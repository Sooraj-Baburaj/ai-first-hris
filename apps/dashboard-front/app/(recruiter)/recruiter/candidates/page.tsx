import { PageHeader } from "@/app/components/molecules/PageHeader";
import { Toolbar } from "@/app/components/molecules/Toolbar";
import { CandidateList } from "@/app/components/organisms/CandidateList";
import { RecruiterShell } from "@/app/components/templates/RecruiterShell";
import { apiGet } from "@/app/lib/api";
import type { CandidateListResponseDto } from "@closed-ai/types";

async function getCandidates() {
  try {
    const response = await apiGet<CandidateListResponseDto>("/api/v1/recruiter/candidates");
    return { items: response.items, error: null as string | null };
  } catch {
    return { items: [], error: "Could not load candidates right now." };
  }
}

export default async function RecruiterCandidatesPage() {
  const { items, error } = await getCandidates();

  return (
    <RecruiterShell active="Candidates">
      <div className="grid gap-6">
        <PageHeader
          description="Review parsed profiles, fit evidence, confidence, and the next human or agent action for every active requisition."
          eyebrow="Talent acquisition"
          title="Candidate pipeline"
        />
        <Toolbar primaryFilter="All stages" secondaryFilter="Updated today" />
        {error ? (
          <p className="rounded-2xl bg-[var(--rose-soft)] px-4 py-3 text-sm text-[var(--rose)]">{error}</p>
        ) : null}
        <CandidateList candidates={items} />
      </div>
    </RecruiterShell>
  );
}
