import type { ResolveRoleResponseDto } from "@closed-ai/types";

export type DemoSession = ResolveRoleResponseDto;

export const demoLoginUsers: Array<{ email: string; label: string }> = [
  {
    email: "recruiter@closedai.com",
    label: "Recruiter workspace",
  },
  {
    email: "candidate@closedai.com",
    label: "Candidate portal",
  },
  {
    email: "employee.converted@closedai.com",
    label: "Employee portal (after conversion)",
  },
];

export const defaultRecruiterRoute = "/recruiter/candidates";

export const agentEvents = [
  {
    id: "evt-001",
    label: "Resume extraction queued",
    detail: "Candidate resumes are waiting for recruiter review signals.",
    time: "Live",
  },
  {
    id: "evt-002",
    label: "Candidate conversion support",
    detail: "Convert hired candidates into employee records from recruiter flow.",
    time: "Live",
  },
  {
    id: "evt-003",
    label: "Role routing active",
    detail: "Static recruiter email routes to recruiter workspace. All others default to candidate unless employee exists.",
    time: "Live",
  },
] as const;
