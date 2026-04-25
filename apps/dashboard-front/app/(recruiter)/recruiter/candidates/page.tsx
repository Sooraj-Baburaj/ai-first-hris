import { PageHeader } from "@/app/components/molecules/PageHeader";
import { Toolbar } from "@/app/components/molecules/Toolbar";
import { CandidateList } from "@/app/components/organisms/CandidateList";
import { RecruiterShell } from "@/app/components/templates/RecruiterShell";
import { candidates } from "@/app/lib/recruiter-data";

export default function RecruiterCandidatesPage() {
  return (
    <RecruiterShell active="Candidates">
      <div className="grid gap-6">
        <PageHeader
          description="Review parsed profiles, fit evidence, confidence, and the next human or agent action for every active requisition."
          eyebrow="Talent acquisition"
          title="Candidate pipeline"
        />
        <Toolbar primaryFilter="All stages" secondaryFilter="Updated today" />
        <CandidateList candidates={candidates} />
      </div>
    </RecruiterShell>
  );
}
