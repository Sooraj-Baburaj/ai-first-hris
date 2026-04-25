import { zodTextFormat } from "openai/helpers/zod";
import OpenAI from "openai";
import { z } from "zod";

import { env } from "../../config/env.js";
import { AppError } from "../../lib/app-error.js";

const resumeAnalysisSchema = z.object({
  candidateIdentity: z.object({
    fullName: z.string().nullable(),
    email: z.string().nullable(),
  }),
  summary: z.string().min(1),
  confidence: z.number().min(0).max(100),
  status: z.enum(["under_review", "ready_for_screening"]),
  nextAction: z.string().min(1),
  reviewState: z.enum(["auto_ready", "recruiter_review", "escalated"]),
  pros: z.array(z.string()).max(5),
  cons: z.array(z.string()).max(5),
  fitReasoning: z.string().min(1),
  compatibilityReasoning: z.string().min(1),
  metrics: z.object({
    skillCoverage: z.number().min(0).max(100),
    experienceRelevance: z.number().min(0).max(100),
    domainAlignment: z.number().min(0).max(100),
    communicationClarity: z.number().min(0).max(100),
    strengths: z.array(z.string()).max(5),
    risks: z.array(z.string()).max(5),
  }),
});

export type ResumeAnalysisOutput = z.infer<typeof resumeAnalysisSchema>;

const screeningOutcomeSchema = z.object({
  summary: z.string().min(1),
  recommendation: z.enum(["advance", "reject", "needs_review"]),
});

export type ScreeningOutcomeOutput = z.infer<typeof screeningOutcomeSchema>;

export const resumeAnalysisService = {
  async analyzeResume(input: {
    resumeText: string;
    jobTitle: string;
    jobDescription: string;
    traceId?: string;
  }): Promise<ResumeAnalysisOutput> {
    const traceId = input.traceId ?? "unknown";
    const resumeLength = input.resumeText.trim().length;

    console.info("[resume-analysis] starting", {
      traceId,
      model: env.OPENAI_MODEL,
      hasApiKey: Boolean(env.OPENAI_API_KEY),
      jobTitle: input.jobTitle,
      resumeLength,
    });

    if (!env.OPENAI_API_KEY) {
      console.error("[resume-analysis] missing OPENAI_API_KEY", {
        traceId,
      });
      throw new AppError(
        "OPENAI_API_KEY is missing. AI resume analysis is unavailable.",
        500,
        "AI_ANALYSIS_UNAVAILABLE"
      );
    }

    const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

    let response: Awaited<ReturnType<typeof client.responses.parse>>;
    try {
      response = await client.responses.parse({
        model: env.OPENAI_MODEL,
        input: [
          {
            role: "system",
            content:
              "You are a recruiting analysis agent. Extract candidate identity from resume (full name and email if present), assess resume-job fit, explain pros/cons, and provide objective reasoning for fit and compatibility.",
          },
          {
            role: "user",
            content: `Job title: ${input.jobTitle}\nJob description:\n${input.jobDescription}\n\nResume text:\n${input.resumeText.trim()}`,
          },
        ],
        text: {
          format: zodTextFormat(resumeAnalysisSchema, "resume_analysis"),
        },
      });
    } catch (error) {
      console.error("[resume-analysis] OpenAI request failed", {
        traceId,
        model: env.OPENAI_MODEL,
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
              }
            : { message: "Unknown error" },
      });
      throw error;
    }

    for (const output of response.output) {
      if (output.type !== "message") {
        continue;
      }

      for (const item of output.content) {
        if (item.type === "refusal") {
          console.warn("[resume-analysis] model refused request", {
            traceId,
            refusal: item.refusal,
          });
          throw new AppError(
            "AI analysis refused this resume content.",
            422,
            "AI_ANALYSIS_REFUSED"
          );
        }

        if ("parsed" in item && item.parsed) {
          const parsed = item.parsed as ResumeAnalysisOutput;
          const normalizedIdentity = {
            fullName: parsed.candidateIdentity.fullName?.trim() || null,
            // Do not fail the whole analysis if model emits an invalid email.
            email: parsed.candidateIdentity.email?.trim() || null,
          };
          console.info("[resume-analysis] parsed analysis successfully", {
            traceId,
            status: parsed.status,
            confidence: parsed.confidence,
          });
          return {
            ...parsed,
            candidateIdentity: normalizedIdentity,
          };
        }
      }
    }

    console.error("[resume-analysis] parse failed: no structured payload", {
      traceId,
      outputTypes: response.output.map((entry) => entry.type),
    });
    throw new AppError("AI analysis did not return a structured result.", 502, "AI_ANALYSIS_PARSE_FAILED");
  },

  async summarizeScreening(input: {
    candidateName: string;
    roleApplied: string;
    durationSeconds: number;
    fitScore: number;
    compatibilityScore: number;
    strengths: string[];
    risks: string[];
  }): Promise<ScreeningOutcomeOutput> {
    // Heuristic fallback so completion still works without OpenAI.
    const fallbackRecommendation: ScreeningOutcomeOutput["recommendation"] =
      input.durationSeconds >= 240 && input.compatibilityScore >= 70
        ? "advance"
        : input.durationSeconds < 90
          ? "reject"
          : "needs_review";

    if (!env.OPENAI_API_KEY) {
      return {
        summary: `Voice screening completed for ${input.candidateName} (${input.roleApplied}). Call duration was ${Math.max(
          0,
          Math.round(input.durationSeconds)
        )} seconds. Auto recommendation: ${fallbackRecommendation.replace("_", " ")} based on duration and resume fit signals.`,
        recommendation: fallbackRecommendation,
      };
    }

    const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    const response = await client.responses.parse({
      model: env.OPENAI_MODEL,
      input: [
        {
          role: "system",
          content:
            "You are a recruiting assistant. Produce a concise post-call summary and recommendation for next round. Be conservative when evidence is limited.",
        },
        {
          role: "user",
          content: `Candidate: ${input.candidateName}
Role: ${input.roleApplied}
Call duration (seconds): ${input.durationSeconds}
Resume fit score: ${input.fitScore}
Compatibility score: ${input.compatibilityScore}
Known strengths: ${input.strengths.join(", ") || "None"}
Known risks: ${input.risks.join(", ") || "None"}

Return:
1) summary: 2-4 sentences for recruiter panel.
2) recommendation: one of advance, reject, needs_review.

If duration is too short (< 90s), strongly prefer reject or needs_review.`,
        },
      ],
      text: {
        format: zodTextFormat(screeningOutcomeSchema, "screening_outcome"),
      },
    });

    for (const output of response.output) {
      if (output.type !== "message") continue;
      for (const item of output.content) {
        if ("parsed" in item && item.parsed) {
          return item.parsed as ScreeningOutcomeOutput;
        }
      }
    }

    return {
      summary: `Voice screening completed for ${input.candidateName}. Evidence was limited, so recruiter review is recommended before deciding next steps.`,
      recommendation: "needs_review",
    };
  },
};
