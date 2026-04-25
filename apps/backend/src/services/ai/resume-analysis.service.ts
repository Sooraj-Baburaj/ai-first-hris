import { zodTextFormat } from "openai/helpers/zod";
import OpenAI from "openai";
import { z } from "zod";

import { env } from "../../config/env.js";
import { AppError } from "../../lib/app-error.js";

const resumeAnalysisSchema = z.object({
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
              "You are a recruiting analysis agent. Assess resume-job fit, explain pros/cons, and provide objective reasoning for fit and compatibility.",
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
          console.info("[resume-analysis] parsed analysis successfully", {
            traceId,
            status: parsed.status,
            confidence: parsed.confidence,
          });
          return parsed;
        }
      }
    }

    console.error("[resume-analysis] parse failed: no structured payload", {
      traceId,
      outputTypes: response.output.map((entry) => entry.type),
    });
    throw new AppError("AI analysis did not return a structured result.", 502, "AI_ANALYSIS_PARSE_FAILED");
  },
};
