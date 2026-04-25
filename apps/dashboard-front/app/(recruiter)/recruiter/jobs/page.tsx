import { PageHeader } from "@/app/components/molecules/PageHeader";
import { Toolbar } from "@/app/components/molecules/Toolbar";
import { RecruiterJobsBoard } from "@/app/components/organisms/RecruiterJobsBoard";
import { RecruiterShell } from "@/app/components/templates/RecruiterShell";
import { apiGet } from "@/app/lib/api";
import type { JobListResponseDto } from "@closed-ai/types";

async function getJobs() {
  try {
    const response = await apiGet<JobListResponseDto>("/api/v1/recruiter/jobs");
    return { items: response.items, error: null as string | null };
  } catch {
    return { items: [], error: "Could not load jobs right now." };
  }
}

export default async function RecruiterJobsPage() {
  const { items, error } = await getJobs();

  return (
    <RecruiterShell active="Jobs">
      <div className="grid gap-6">
        <PageHeader
          description="Create lightweight job listings so candidates can apply with resumes and enter the screening workflow."
          eyebrow="Talent acquisition"
          title="Job listings"
        />
        <Toolbar primaryFilter="All jobs" secondaryFilter="Newest first" />
        {error ? (
          <p className="rounded-2xl bg-[var(--rose-soft)] px-4 py-3 text-sm text-[var(--rose)]">{error}</p>
        ) : null}
        <RecruiterJobsBoard initialJobs={items} />
      </div>
    </RecruiterShell>
  );
}
