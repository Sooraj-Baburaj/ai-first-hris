import type {
  CandidateListResponseDto,
  CreateJobRequestDto,
  CreateJobResponseDto,
  EmployeeListResponseDto,
  JobListResponseDto,
} from "@closed-ai/types";

import { AppError } from "../../lib/app-error.js";
import { toCandidateSummaryDto, toEmployeeSummaryDto, toJobDto } from "../../lib/formatters.js";
import { applicationRepository } from "../../repositories/recruiting/application.repository.js";
import { candidateRepository } from "../../repositories/recruiting/candidate.repository.js";
import { employeeRepository } from "../../repositories/recruiting/employee.repository.js";
import { jobRepository } from "../../repositories/recruiting/job.repository.js";

export const recruiterService = {
  async listCandidates(): Promise<CandidateListResponseDto> {
    const items = await candidateRepository.listForRecruiter();

    return {
      items: items.map((candidate) => toCandidateSummaryDto(candidate)),
      total: items.length,
    };
  },

  async listEmployees(): Promise<EmployeeListResponseDto> {
    const items = await employeeRepository.list();

    return {
      items: items.map((employee) => toEmployeeSummaryDto(employee)),
      total: items.length,
    };
  },

  async createJob(payload: CreateJobRequestDto): Promise<CreateJobResponseDto> {
    const title = payload.title.trim();
    const description = payload.description.trim();

    if (!title || !description) {
      throw new AppError("Job title and description are required.", 400, "JOB_FIELDS_REQUIRED");
    }

    const job = await jobRepository.create({ title, description });

    return {
      job: toJobDto(job),
    };
  },

  async listJobs(): Promise<JobListResponseDto> {
    const jobs = await jobRepository.list();

    return {
      items: jobs.map((job) => toJobDto(job)),
      total: jobs.length,
    };
  },

  async sendTechnicalScreening(candidateId: string) {
    const candidate = await candidateRepository.findById(candidateId);
    if (!candidate) {
      throw new AppError("Candidate not found.", 404, "CANDIDATE_NOT_FOUND");
    }

    const updated = await candidateRepository.updateTechnicalScreening(candidateId, {
      status: "manual_sent",
      sentAt: new Date().toISOString(),
    });

    return updated ? toCandidateSummaryDto(updated) : null;
  },

  async convertCandidateToEmployee(candidateId: string) {
    const candidate = await candidateRepository.findById(candidateId);
    if (!candidate) {
      throw new AppError("Candidate not found.", 404, "CANDIDATE_NOT_FOUND");
    }

    const employee = await employeeRepository.upsertFromCandidate({
      candidateId: candidate._id.toString(),
      workEmail: candidate.email,
      fullName: candidate.fullName,
      location: candidate.location,
    });

    await candidateRepository.updateCandidateStatus(candidateId, {
      stage: "hired",
      status: "hired",
      summary: "Candidate accepted the offer and has been converted to employee.",
      nextAction: "Start onboarding sequence",
      reviewState: "auto_ready",
      confidence: 95,
      fitScore: 92,
      compatibilityScore: 92,
      fitMetrics: {
        skillCoverage: 92,
        experienceRelevance: 93,
        domainAlignment: 91,
        communicationClarity: 90,
        strengths: ["Role match confirmed", "Offer accepted"],
        risks: [],
      },
      analysisDetails: {
        pros: ["Excellent role alignment", "Strong delivery track record"],
        cons: [],
        fitReasoning: "Candidate completed hiring funnel and accepted offer.",
        compatibilityReasoning: "Compatibility validated by offer acceptance.",
      },
    });

    const latestApplication = await applicationRepository.findLatestByCandidateId(candidateId);
    if (latestApplication) {
      await applicationRepository.upsert(candidateId, latestApplication.jobId.toString(), {
        stage: "hired",
        status: "hired",
        confidence: 95,
      });
    }

    return toEmployeeSummaryDto(employee);
  },
};
