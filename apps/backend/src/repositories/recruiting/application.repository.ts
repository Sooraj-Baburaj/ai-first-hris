import type { ApplicationStage, ApplicationStatus } from "@closed-ai/types";

import { ApplicationModel } from "../../models/recruiting/application.model.js";

export const applicationRepository = {
  async findByCandidateAndJob(candidateId: string, jobId: string) {
    return ApplicationModel.findOne({ candidateId, jobId });
  },

  async findLatestByCandidateId(candidateId: string) {
    return ApplicationModel.findOne({ candidateId }).sort({ updatedAt: -1 });
  },

  async listByCandidateId(candidateId: string) {
    return ApplicationModel.find({ candidateId }).sort({ updatedAt: -1 });
  },

  async upsert(candidateId: string, jobId: string, payload: { stage: ApplicationStage; status: ApplicationStatus; confidence: number }) {
    return ApplicationModel.findOneAndUpdate(
      { candidateId, jobId },
      {
        $set: {
          stage: payload.stage,
          status: payload.status,
          confidence: payload.confidence,
        },
        $setOnInsert: {
          candidateId,
          jobId,
          timeline: [],
        },
      },
      {
        upsert: true,
        new: true,
      }
    );
  },

  async addTimelineEvent(candidateId: string, jobId: string, event: { id: string; label: string; detail: string; at: Date }) {
    return ApplicationModel.findOneAndUpdate(
      { candidateId, jobId },
      {
        $push: { timeline: event },
      },
      {
        new: true,
      }
    );
  },
};
