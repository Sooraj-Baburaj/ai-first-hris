import mongoose, { Schema } from "mongoose";

export interface EmployeeDocument {
  candidateId?: mongoose.Types.ObjectId;
  workEmail: string;
  fullName: string;
  department: string;
  manager: string;
  location: string;
  onboardingStatus: "onboarding" | "helpdesk" | "learning" | "healthy";
  progress: number;
  suggestedFollowUp: string;
  priority: "low" | "medium" | "high";
  convertedFromCandidateAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const employeeSchema = new Schema<EmployeeDocument>(
  {
    candidateId: { type: Schema.Types.ObjectId, ref: "Candidate", required: false },
    workEmail: { type: String, required: true, unique: true, lowercase: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    manager: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    onboardingStatus: { type: String, required: true, default: "onboarding" },
    progress: { type: Number, required: true, default: 10 },
    suggestedFollowUp: {
      type: String,
      required: true,
      default: "Complete onboarding tasks",
    },
    priority: { type: String, required: true, default: "medium" },
    convertedFromCandidateAt: { type: Date, required: false },
  },
  {
    timestamps: true,
  }
);

export const EmployeeModel =
  (mongoose.models.Employee as mongoose.Model<EmployeeDocument>) ||
  mongoose.model<EmployeeDocument>("Employee", employeeSchema);
