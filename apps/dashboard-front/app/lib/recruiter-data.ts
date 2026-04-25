export type CandidateStage =
  | "Applied"
  | "Screening"
  | "Interview"
  | "Offer"
  | "Needs review";

export type Candidate = {
  id: string;
  name: string;
  initials: string;
  role: string;
  location: string;
  source: string;
  stage: CandidateStage;
  fitScore: number;
  confidence: number;
  summary: string;
  nextAction: string;
  reviewState: "Auto-ready" | "Recruiter review" | "Escalated";
};

export type Employee = {
  id: string;
  name: string;
  initials: string;
  department: string;
  manager: string;
  location: string;
  status: "Onboarding" | "Helpdesk" | "Learning" | "Healthy";
  progress: number;
  suggestedFollowUp: string;
  priority: "Low" | "Medium" | "High";
};

export type AgentEvent = {
  id: string;
  label: string;
  detail: string;
  time: string;
};

export type DemoUserType = "recruiter" | "candidate" | "employee";

export type DemoLoginUser = {
  email: string;
  name: string;
  type: DemoUserType;
  route: string;
  label: string;
};

export const demoLoginUsers: DemoLoginUser[] = [
  {
    email: "recruiter@closedai.com",
    name: "Closed AI Recruiter",
    type: "recruiter",
    route: "/recruiter/candidates",
    label: "Recruiter workspace",
  },
  {
    email: "candidate@closedai.com",
    name: "Candidate Demo",
    type: "candidate",
    route: "/candidate",
    label: "Candidate portal",
  },
  {
    email: "employee@closedai.com",
    name: "Employee Demo",
    type: "employee",
    route: "/employee",
    label: "Employee portal",
  },
];

export const defaultRecruiterRoute = "/recruiter/candidates";
export const defaultCandidateRoute = "/candidate";

export const demoUserTypes: { label: string; value: DemoUserType }[] = [
  { label: "Recruiter", value: "recruiter" },
  { label: "Candidate", value: "candidate" },
  { label: "Employee", value: "employee" },
];

export function resolveDemoLogin(email: string, type: DemoUserType) {
  const normalizedEmail = email.trim().toLowerCase();
  const matchedUser = demoLoginUsers.find(
    (user) => user.email === normalizedEmail && user.type === type,
  );

  return (
    matchedUser ?? {
      email: normalizedEmail,
      name: "Candidate Demo",
      type: "candidate" as const,
      route: defaultCandidateRoute,
      label: "Candidate portal",
    }
  );
}

export const candidates: Candidate[] = [
  {
    id: "cand-001",
    name: "Maya Rao",
    initials: "MR",
    role: "Senior Product Designer",
    location: "Bengaluru",
    source: "Referral",
    stage: "Interview",
    fitScore: 92,
    confidence: 88,
    summary:
      "Strong systems portfolio and HR workflow experience. Resume matches 9 of 11 role signals.",
    nextAction: "Send panel brief",
    reviewState: "Auto-ready",
  },
  {
    id: "cand-002",
    name: "Ethan Cole",
    initials: "EC",
    role: "Backend Engineer",
    location: "Austin",
    source: "Inbound",
    stage: "Screening",
    fitScore: 84,
    confidence: 81,
    summary:
      "High match on distributed systems. Missing recent MongoDB evidence; ask during screen.",
    nextAction: "Schedule voice screen",
    reviewState: "Recruiter review",
  },
  {
    id: "cand-003",
    name: "Priya Nair",
    initials: "PN",
    role: "People Ops Lead",
    location: "Remote",
    source: "LinkedIn",
    stage: "Needs review",
    fitScore: 76,
    confidence: 69,
    summary:
      "Excellent onboarding depth. Compensation range conflict found in uploaded notes.",
    nextAction: "Confirm comp band",
    reviewState: "Escalated",
  },
  {
    id: "cand-004",
    name: "Jon Bell",
    initials: "JB",
    role: "AI Solutions Architect",
    location: "New York",
    source: "Agency",
    stage: "Offer",
    fitScore: 89,
    confidence: 86,
    summary:
      "Relevant voice AI deployments and customer-facing implementation history.",
    nextAction: "Prepare offer packet",
    reviewState: "Auto-ready",
  },
];

export const employees: Employee[] = [
  {
    id: "emp-001",
    name: "Aisha Menon",
    initials: "AM",
    department: "Engineering",
    manager: "Ruth Park",
    location: "Bengaluru",
    status: "Onboarding",
    progress: 72,
    suggestedFollowUp: "Collect tax declaration",
    priority: "Medium",
  },
  {
    id: "emp-002",
    name: "Leo Martins",
    initials: "LM",
    department: "Sales",
    manager: "Nora Shah",
    location: "London",
    status: "Helpdesk",
    progress: 34,
    suggestedFollowUp: "Route benefits ticket",
    priority: "High",
  },
  {
    id: "emp-003",
    name: "Sofia Chen",
    initials: "SC",
    department: "Design",
    manager: "Maya Rao",
    location: "Singapore",
    status: "Learning",
    progress: 58,
    suggestedFollowUp: "Assign manager enablement path",
    priority: "Low",
  },
  {
    id: "emp-004",
    name: "Daniel Brooks",
    initials: "DB",
    department: "People",
    manager: "Amara Iyer",
    location: "Toronto",
    status: "Healthy",
    progress: 91,
    suggestedFollowUp: "Share internal mobility role",
    priority: "Low",
  },
];

export const agentEvents: AgentEvent[] = [
  {
    id: "evt-001",
    label: "Resume extraction completed",
    detail: "4 candidate profiles updated from uploaded resumes.",
    time: "09:42",
  },
  {
    id: "evt-002",
    label: "Human review requested",
    detail: "Priya Nair flagged for compensation-band mismatch.",
    time: "09:31",
  },
  {
    id: "evt-003",
    label: "Onboarding reminder drafted",
    detail: "Aisha Menon missing 2 pre-joining documents.",
    time: "09:14",
  },
];
