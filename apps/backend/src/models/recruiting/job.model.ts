import mongoose, { Schema } from "mongoose";

export interface JobDocument {
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<JobDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
);

export const JobModel =
  (mongoose.models.Job as mongoose.Model<JobDocument>) ||
  mongoose.model<JobDocument>("Job", jobSchema);
