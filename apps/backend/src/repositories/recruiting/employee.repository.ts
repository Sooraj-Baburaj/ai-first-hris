import { EmployeeModel } from "../../models/recruiting/employee.model.js";

export const employeeRepository = {
  async findByEmail(workEmail: string) {
    return EmployeeModel.findOne({ workEmail: workEmail.toLowerCase().trim() });
  },

  async list() {
    return EmployeeModel.find().sort({ updatedAt: -1 }).lean();
  },

  async upsertFromCandidate(input: {
    candidateId: string;
    workEmail: string;
    fullName: string;
    location: string;
  }) {
    return EmployeeModel.findOneAndUpdate(
      { workEmail: input.workEmail.toLowerCase().trim() },
      {
        $setOnInsert: {
          candidateId: input.candidateId,
          workEmail: input.workEmail.toLowerCase().trim(),
          fullName: input.fullName,
          department: "General",
          manager: "Unassigned",
          location: input.location,
          onboardingStatus: "onboarding",
          progress: 20,
          suggestedFollowUp: "Finish onboarding checklist",
          priority: "medium",
          convertedFromCandidateAt: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
      }
    );
  },
};
