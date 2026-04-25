import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type {
  ApplicationStage,
  ApplicationStatus,
  CandidateCompleteScreeningResponseDto,
  CandidateJoinScreeningResponseDto,
  CandidateScreeningInviteResponseDto,
  CandidateJobListResponseDto,
  CandidateStatusResponseDto,
  ResumeSubmissionResponseDto,
  ResumeFileType,
  ResumeFitMetricsDto,
  TechnicalScreeningDto,
} from "@closed-ai/types";
import pdfParse from "pdf-parse";

import { AppError } from "../../lib/app-error.js";
import { toCandidateStatusDto, toJobDto, toResumeDto, toTimelineDto } from "../../lib/formatters.js";
import { applicationRepository } from "../../repositories/recruiting/application.repository.js";
import { candidateRepository } from "../../repositories/recruiting/candidate.repository.js";
import { jobRepository } from "../../repositories/recruiting/job.repository.js";
import { resumeRepository } from "../../repositories/recruiting/resume.repository.js";
import { resumeAnalysisService } from "../ai/resume-analysis.service.js";
import { livekitTokenService } from "../ai/livekit-token.service.js";
import { env } from "../../config/env.js";

function sanitizeFileName(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function assertMime(mimeType?: string): asserts mimeType is ResumeFileType {
  if (mimeType !== "application/pdf" && mimeType !== "text/plain") {
    throw new AppError("Only PDF and TXT resumes are accepted.", 400, "INVALID_FILE_TYPE");
  }
}

function computeFitScore(metrics: ResumeFitMetricsDto) {
  return Math.round(
    metrics.skillCoverage * 0.35 +
      metrics.experienceRelevance * 0.3 +
      metrics.domainAlignment * 0.25 +
      metrics.communicationClarity * 0.1
  );
}

function computeCompatibilityScore(metrics: ResumeFitMetricsDto) {
  return Math.round(
    metrics.skillCoverage * 0.4 +
      metrics.experienceRelevance * 0.2 +
      metrics.domainAlignment * 0.4
  );
}

function buildInviteUrl(inviteId: string) {
  return `${env.SCREENING_INVITE_BASE_URL.replace(/\/$/, "")}/${inviteId}`;
}

async function extractResumeText(file: { mimetype: ResumeFileType; buffer: Buffer }) {
  if (file.mimetype === "text/plain") {
    return file.buffer.toString("utf8").slice(0, 12000);
  }

  try {
    const parsed = await pdfParse(file.buffer);
    return (parsed.text || "").slice(0, 12000);
  } catch {
    return "";
  }
}

export const resumeService = {
  async submitResume(input: {
    email: string;
    jobId: string;
    file: { originalname: string; mimetype?: string; size: number; buffer: Buffer };
  }): Promise<ResumeSubmissionResponseDto> {
    const traceId = randomUUID();
    const normalizedEmail = input.email.trim().toLowerCase();
    console.info("[resume-upload] received submission", {
      traceId,
      email: normalizedEmail,
      jobId: input.jobId,
      fileName: input.file.originalname,
      mimeType: input.file.mimetype,
      sizeBytes: input.file.size,
    });

    assertMime(input.file.mimetype);

    if (input.file.size > env.MAX_RESUME_SIZE_BYTES) {
      throw new AppError("Resume exceeds maximum upload size.", 400, "FILE_TOO_LARGE");
    }

    const job = await jobRepository.findById(input.jobId);
    if (!job) {
      throw new AppError("Job not found.", 404, "JOB_NOT_FOUND");
    }

    const candidate = await candidateRepository.upsertByEmail({
      email: normalizedEmail,
      fullName: normalizedEmail.split("@")[0] ?? "Candidate",
      roleApplied: job.title,
    });

    const uploadsDir = path.resolve(process.cwd(), env.RESUME_UPLOAD_DIR);
    await mkdir(uploadsDir, { recursive: true });

    const extension = input.file.mimetype === "application/pdf" ? ".pdf" : ".txt";
    const safeName = sanitizeFileName(input.file.originalname.replace(/\.(pdf|txt)$/i, ""));
    const fileName = `${Date.now()}-${safeName || "resume"}${extension}`;
    const storagePath = path.join(uploadsDir, fileName);

    await writeFile(storagePath, input.file.buffer);

    const resume = await resumeRepository.create({
      candidateId: candidate._id.toString(),
      fileName: input.file.originalname,
      mimeType: input.file.mimetype,
      sizeBytes: input.file.size,
      storagePath,
      textExtractStatus: input.file.mimetype === "text/plain" ? "complete" : "pending",
    });

    await candidateRepository.updateLatestResume(candidate._id.toString(), resume._id.toString());

    const resumeText = await extractResumeText({
      mimetype: input.file.mimetype,
      buffer: input.file.buffer,
    });
    console.info("[resume-upload] extracted text", {
      traceId,
      extractedLength: resumeText.length,
    });

    let stage: "under_review" | "ready_for_screening" = "under_review";
    let status: "under_review" | "ready_for_screening" = "under_review";
    let summary = "AI analysis failed; application moved to manual recruiter review.";
    let nextAction = "Manual recruiter review required";
    let reviewState: "auto_ready" | "recruiter_review" | "escalated" = "escalated";
    let confidence = 0;
    let fitMetrics: ResumeFitMetricsDto = {
      skillCoverage: 0,
      experienceRelevance: 0,
      domainAlignment: 0,
      communicationClarity: 0,
      strengths: [],
      risks: ["AI analysis failed"],
    };
    let analysisDetails = {
      pros: [] as string[],
      cons: ["AI analysis failed"] as string[],
      fitReasoning: "AI analysis unavailable, so fit is pending manual review.",
      compatibilityReasoning:
        "Compatibility cannot be computed from AI output; manual recruiter review required.",
    };
    let aiAnalysisFailed = true;

    try {
      const analysis = await resumeAnalysisService.analyzeResume({
        resumeText,
        jobTitle: job.title,
        jobDescription: job.description,
        traceId,
      });

      status = analysis.status;
      stage = analysis.status;
      summary = analysis.summary;
      nextAction = analysis.nextAction;
      reviewState = analysis.reviewState;
      confidence = analysis.confidence;
      fitMetrics = analysis.metrics;
      analysisDetails = {
        pros: analysis.pros,
        cons: analysis.cons,
        fitReasoning: analysis.fitReasoning,
        compatibilityReasoning: analysis.compatibilityReasoning,
      };
      aiAnalysisFailed = false;
      const parsedName = analysis.candidateIdentity.fullName?.trim();
      await candidateRepository.updateIdentity(candidate._id.toString(), {
        fullName: parsedName && parsedName.length > 0 ? parsedName : normalizedEmail,
      });
      console.info("[resume-upload] AI analysis success", {
        traceId,
        status,
        confidence,
      });
    } catch {
      // Intentional: on AI failure we keep manual under-review state and recruiter flag.
      console.error("[resume-upload] AI analysis failed, switching to manual review", {
        traceId,
        email: normalizedEmail,
        jobId: input.jobId,
      });
    }

    const fitScore = computeFitScore(fitMetrics);
    const compatibilityScore = computeCompatibilityScore(fitMetrics);

    let technicalScreening: TechnicalScreeningDto = {
      status: "not_sent",
    };

    if (!aiAnalysisFailed && compatibilityScore > 60) {
      const inviteId = randomUUID();
      const roomName = `screening-${candidate._id.toString()}`;
      const inviteCreatedAt = new Date();
      const inviteExpiresAt = new Date(
        inviteCreatedAt.getTime() + env.SCREENING_INVITE_TTL_MINUTES * 60 * 1000
      );
      technicalScreening = {
        status: "auto_sent",
        sentAt: inviteCreatedAt.toISOString(),
        invitation: {
          id: inviteId,
          roomName,
          joinUrl: buildInviteUrl(inviteId),
          participantName: candidate.fullName || normalizedEmail,
          createdAt: inviteCreatedAt.toISOString(),
          expiresAt: inviteExpiresAt.toISOString(),
        },
      };
      nextAction = "Technical screening invitation sent automatically";
      await candidateRepository.setScreeningInvitation(candidate._id.toString(), {
        id: inviteId,
        roomName,
        joinUrl: buildInviteUrl(inviteId),
        participantName: candidate.fullName || normalizedEmail,
        createdAt: inviteCreatedAt,
        expiresAt: inviteExpiresAt,
      });
    }

    const updatedCandidate = await candidateRepository.updateCandidateStatus(candidate._id.toString(), {
      stage,
      status,
      summary,
      nextAction,
      reviewState,
      confidence,
      fitScore,
      compatibilityScore,
      fitMetrics,
      analysisDetails,
      aiAnalysisFailed,
      technicalScreening,
    });

    if (!updatedCandidate) {
      console.error("[resume-upload] candidate update failed", {
        traceId,
        candidateId: candidate._id.toString(),
      });
      throw new AppError("Candidate status could not be updated.", 500, "CANDIDATE_UPDATE_FAILED");
    }

    await applicationRepository.upsert(candidate._id.toString(), job._id.toString(), {
      stage,
      status,
      confidence,
    });

    await applicationRepository.addTimelineEvent(candidate._id.toString(), job._id.toString(), {
      id: randomUUID(),
      label: "Resume submitted",
      detail: `${input.file.originalname} uploaded for ${job.title}.`,
      at: new Date(),
    });

    if (technicalScreening.status === "auto_sent") {
      await applicationRepository.addTimelineEvent(candidate._id.toString(), job._id.toString(), {
        id: randomUUID(),
        label: "Technical screening invited",
        detail: "Compatibility exceeded 60%, invitation sent automatically.",
        at: new Date(),
      });
    }

    const latestApplication = await applicationRepository.findByCandidateAndJob(
      candidate._id.toString(),
      job._id.toString()
    );
    const latestTimeline = latestApplication ? toTimelineDto(latestApplication.timeline) : [];
    const resumeDto = toResumeDto(resume);

    return {
      resume: resumeDto,
      status: toCandidateStatusDto({
        candidate: updatedCandidate,
        timeline: latestTimeline,
        latestResume: resumeDto,
      }),
    };
  },

  async getCandidateStatusByEmail(email: string): Promise<CandidateStatusResponseDto> {
    const normalizedEmail = email.trim().toLowerCase();
    const candidate = await candidateRepository.findByEmail(normalizedEmail);

    if (!candidate) {
      throw new AppError("Candidate not found for this email.", 404, "CANDIDATE_NOT_FOUND");
    }

    const application = await applicationRepository.findLatestByCandidateId(candidate._id.toString());
    const latestResume = await resumeRepository.findLatestByCandidateId(candidate._id.toString());

    return {
      status: toCandidateStatusDto({
        candidate,
        timeline: application ? toTimelineDto(application.timeline) : [],
        latestResume: latestResume ? toResumeDto(latestResume) : undefined,
      }),
    };
  },

  async listJobsForCandidate(email: string): Promise<CandidateJobListResponseDto> {
    const normalizedEmail = email.trim().toLowerCase();
    const jobs = await jobRepository.list();
    const candidate = await candidateRepository.findByEmail(normalizedEmail);

    if (!candidate) {
      return {
        items: jobs.map((job) => ({ job: toJobDto(job), applicationStatus: null, appliedAt: null })),
        total: jobs.length,
      };
    }

    const applications = await applicationRepository.listByCandidateId(candidate._id.toString());
    const byJobId = new Map(applications.map((app) => [app.jobId.toString(), app]));

    return {
      items: jobs.map((job) => {
        const app = byJobId.get(job._id.toString());

        return {
          job: toJobDto(job),
          applicationStatus: app?.status ?? null,
          appliedAt: app?.createdAt ? app.createdAt.toISOString() : null,
        };
      }),
      total: jobs.length,
    };
  },

  async getScreeningInviteByEmail(email: string): Promise<CandidateScreeningInviteResponseDto> {
    const normalizedEmail = email.trim().toLowerCase();
    const candidate = await candidateRepository.findByEmail(normalizedEmail);
    if (!candidate || !candidate.technicalScreening?.invitation) {
      throw new AppError("No screening invitation found for this candidate.", 404, "INVITATION_NOT_FOUND");
    }

    return {
      invite: {
        candidateId: candidate._id.toString(),
        fullName: candidate.fullName,
        roleApplied: candidate.roleApplied,
        agentName: "closedAI",
        invitation: {
          id: candidate.technicalScreening.invitation.id,
          roomName: candidate.technicalScreening.invitation.roomName,
          joinUrl: candidate.technicalScreening.invitation.joinUrl,
          participantName: candidate.technicalScreening.invitation.participantName,
          createdAt: candidate.technicalScreening.invitation.createdAt.toISOString(),
          expiresAt: candidate.technicalScreening.invitation.expiresAt?.toISOString(),
          joinedAt: candidate.technicalScreening.invitation.joinedAt?.toISOString(),
        },
      },
    };
  },

  async getScreeningInviteById(inviteId: string): Promise<CandidateScreeningInviteResponseDto> {
    const candidate = await candidateRepository.findByScreeningInviteId(inviteId);
    if (!candidate || !candidate.technicalScreening?.invitation) {
      throw new AppError("Screening invitation not found.", 404, "INVITATION_NOT_FOUND");
    }

    return {
      invite: {
        candidateId: candidate._id.toString(),
        fullName: candidate.fullName,
        roleApplied: candidate.roleApplied,
        agentName: "closedAI",
        invitation: {
          id: candidate.technicalScreening.invitation.id,
          roomName: candidate.technicalScreening.invitation.roomName,
          joinUrl: candidate.technicalScreening.invitation.joinUrl,
          participantName: candidate.technicalScreening.invitation.participantName,
          createdAt: candidate.technicalScreening.invitation.createdAt.toISOString(),
          expiresAt: candidate.technicalScreening.invitation.expiresAt?.toISOString(),
          joinedAt: candidate.technicalScreening.invitation.joinedAt?.toISOString(),
        },
      },
    };
  },

  async joinScreeningByInviteId(inviteId: string): Promise<CandidateJoinScreeningResponseDto> {
    const candidate = await candidateRepository.findByScreeningInviteId(inviteId);
    if (!candidate || !candidate.technicalScreening?.invitation) {
      throw new AppError("Screening invitation not found.", 404, "INVITATION_NOT_FOUND");
    }

    const invitation = candidate.technicalScreening.invitation;
    if (invitation.expiresAt && invitation.expiresAt.getTime() < Date.now()) {
      throw new AppError("This screening invitation has expired.", 410, "INVITATION_EXPIRED");
    }

    const participantName = invitation.participantName || candidate.fullName || candidate.email;
    const participantIdentity = `candidate-${candidate._id.toString()}-${randomUUID().slice(0, 8)}`;
    
    // Fetch resume text for agent context.
    // Do not re-parse uploaded PDFs at join time; some PDFs have broken xref tables.
    // We fallback safely so screening can still start.
    let resumeText = "Resume text unavailable.";
    if (candidate.latestResumeId) {
       const resumeDoc = await resumeRepository.findLatestByCandidateId(candidate._id.toString());
       if (resumeDoc && resumeDoc.storagePath) {
          try {
             if (resumeDoc.mimeType === "text/plain") {
               const fs = await import("node:fs/promises");
               resumeText = (await fs.readFile(resumeDoc.storagePath, "utf8")).slice(0, 12000);
             }
          } catch (error) {
             console.warn("[resume.service] resume context unavailable, using fallback text", {
               candidateId: candidate._id.toString(),
               reason: error instanceof Error ? error.message : "unknown",
             });
          }
       }
    }

    // Fetch Job description
    let jobTitle = candidate.roleApplied || "General Application";
    let jobDescription = "We are looking for a candidate with strong problem-solving skills.";
    
    // Try to find the associated application and job
    const applications = await applicationRepository.listByCandidateId(candidate._id.toString());
    const latestApplication = applications[0];
    if (latestApplication) {
       const job = await jobRepository.findById(latestApplication.jobId.toString());
       if (job) {
          jobTitle = job.title;
          jobDescription = job.description;
       }
    }

    const metadata = {
      candidateName: candidate.fullName,
      candidateEmail: candidate.email,
      roleApplied: candidate.roleApplied,
      jobTitle,
      jobDescription,
      resumeText,
      fitScore: candidate.fitScore,
      strengths: candidate.fitMetrics?.strengths,
      risks: candidate.fitMetrics?.risks
    };

    // Dispatch the agent explicitly
    await livekitTokenService.dispatchScreeningAgent({
       roomName: invitation.roomName,
       metadata
    });

    const token = await livekitTokenService.createCandidateJoinToken({
      roomName: invitation.roomName,
      participantName,
      participantIdentity,
    });
    
    await candidateRepository.markScreeningInviteJoined(candidate._id.toString());

    return {
      roomName: invitation.roomName,
      participantName,
      agentName: "closedAI",
      livekitUrl: env.LIVEKIT_URL,
      token,
    };
  },

  async completeScreeningByInviteId(
    inviteId: string,
    input: { durationSeconds: number }
  ): Promise<CandidateCompleteScreeningResponseDto> {
    const candidate = await candidateRepository.findByScreeningInviteId(inviteId);
    if (!candidate || !candidate.technicalScreening?.invitation) {
      throw new AppError("Screening invitation not found.", 404, "INVITATION_NOT_FOUND");
    }

    const durationSeconds = Math.max(0, Math.round(input.durationSeconds || 0));
    const outcome = await resumeAnalysisService.summarizeScreening({
      candidateName: candidate.fullName,
      roleApplied: candidate.roleApplied,
      durationSeconds,
      fitScore: candidate.fitScore,
      compatibilityScore: candidate.compatibilityScore,
      strengths: candidate.fitMetrics?.strengths ?? [],
      risks: candidate.fitMetrics?.risks ?? [],
    });

    let stage: ApplicationStage = "under_review";
    let status: ApplicationStatus = "under_review";
    let nextAction = "Recruiter to review screening summary and decide next steps.";

    if (outcome.recommendation === "advance") {
      stage = "interview";
      status = "interview";
      nextAction = "Schedule next-round interview with hiring panel.";
    } else if (outcome.recommendation === "reject") {
      stage = "rejected";
      status = "rejected";
      nextAction = "Send rejection decision and close application.";
    }

    const completedAt = new Date();
    const updatedCandidate = await candidateRepository.updateCandidateStatus(candidate._id.toString(), {
      stage,
      status,
      summary: outcome.summary,
      nextAction,
      reviewState: outcome.recommendation === "needs_review" ? "recruiter_review" : "auto_ready",
      confidence: candidate.confidence,
      fitScore: candidate.fitScore,
      compatibilityScore: candidate.compatibilityScore,
      fitMetrics: candidate.fitMetrics,
      analysisDetails: candidate.analysisDetails,
      aiAnalysisFailed: candidate.aiAnalysisFailed,
      technicalScreening: {
        status: candidate.technicalScreening.status,
        sentAt:
          typeof candidate.technicalScreening.sentAt === "string"
            ? candidate.technicalScreening.sentAt
            : candidate.technicalScreening.sentAt?.toISOString(),
        invitation: {
          id: candidate.technicalScreening.invitation.id,
          roomName: candidate.technicalScreening.invitation.roomName,
          joinUrl: candidate.technicalScreening.invitation.joinUrl,
          participantName: candidate.technicalScreening.invitation.participantName,
          createdAt: candidate.technicalScreening.invitation.createdAt.toISOString(),
          expiresAt: candidate.technicalScreening.invitation.expiresAt?.toISOString(),
          joinedAt: candidate.technicalScreening.invitation.joinedAt?.toISOString(),
        },
        outcome: {
          completedAt: completedAt.toISOString(),
          durationSeconds,
          summary: outcome.summary,
          recommendation: outcome.recommendation,
        },
      },
    });

    await candidateRepository.setScreeningOutcome(candidate._id.toString(), {
      completedAt,
      durationSeconds,
      summary: outcome.summary,
      recommendation: outcome.recommendation,
    });

    const latestApplication = await applicationRepository.findLatestByCandidateId(candidate._id.toString());
    if (latestApplication) {
      await applicationRepository.upsert(candidate._id.toString(), latestApplication.jobId.toString(), {
        stage,
        status,
        confidence: candidate.confidence,
      });
      await applicationRepository.addTimelineEvent(candidate._id.toString(), latestApplication.jobId.toString(), {
        id: randomUUID(),
        label: "Voice screening completed",
        detail: `Outcome: ${outcome.recommendation.replace("_", " ")}. ${outcome.summary}`,
        at: completedAt,
      });
    }

    const effectiveCandidate = updatedCandidate ?? candidate;
    return {
      candidateId: effectiveCandidate._id.toString(),
      stage: effectiveCandidate.currentStage,
      status: effectiveCandidate.applicationStatus,
      technicalScreening: {
        status: effectiveCandidate.technicalScreening.status,
        sentAt:
          typeof effectiveCandidate.technicalScreening.sentAt === "string"
            ? effectiveCandidate.technicalScreening.sentAt
            : effectiveCandidate.technicalScreening.sentAt?.toISOString(),
        invitation: effectiveCandidate.technicalScreening.invitation
          ? {
              id: effectiveCandidate.technicalScreening.invitation.id,
              roomName: effectiveCandidate.technicalScreening.invitation.roomName,
              joinUrl: effectiveCandidate.technicalScreening.invitation.joinUrl,
              participantName: effectiveCandidate.technicalScreening.invitation.participantName,
              createdAt: effectiveCandidate.technicalScreening.invitation.createdAt.toISOString(),
              expiresAt: effectiveCandidate.technicalScreening.invitation.expiresAt?.toISOString(),
              joinedAt: effectiveCandidate.technicalScreening.invitation.joinedAt?.toISOString(),
            }
          : undefined,
        outcome: {
          completedAt: completedAt.toISOString(),
          durationSeconds,
          summary: outcome.summary,
          recommendation: outcome.recommendation,
        },
      },
      summary: outcome.summary,
      nextAction,
    };
  },
};
