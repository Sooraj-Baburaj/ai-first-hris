import { JobModel } from "../../models/recruiting/job.model.js";

export const jobRepository = {
  async create(input: { title: string; description: string }) {
    return JobModel.create({
      title: input.title,
      description: input.description,
    });
  },

  async list() {
    return JobModel.find().sort({ createdAt: -1 }).lean();
  },

  async findById(jobId: string) {
    return JobModel.findById(jobId);
  },
};
