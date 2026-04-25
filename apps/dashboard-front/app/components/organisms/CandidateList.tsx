import { Avatar } from "@/app/components/atoms/Avatar";
import { StatusPill } from "@/app/components/atoms/StatusPill";
import type { Candidate } from "@/app/lib/recruiter-data";

function reviewTone(reviewState: Candidate["reviewState"]) {
  if (reviewState === "Auto-ready") return "success" as const;
  if (reviewState === "Escalated") return "danger" as const;
  return "warning" as const;
}

export function CandidateList({ candidates }: { candidates: Candidate[] }) {
  return (
    <section className="rounded-3xl bg-[var(--surface-soft)] p-3 shadow-[var(--shadow-inset)]">
      <div className="hidden grid-cols-[1.3fr_0.8fr_0.6fr_0.8fr_1.35fr_0.8fr] gap-3 px-4 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[var(--quiet)] xl:grid">
        <span>Candidate</span>
        <span>Stage</span>
        <span>Fit</span>
        <span>Source</span>
        <span>AI summary</span>
        <span>Next action</span>
      </div>
      <div className="grid gap-3">
        {candidates.map((candidate) => (
          <article
            className="grid gap-4 rounded-3xl bg-[var(--surface)] p-5 shadow-[var(--shadow-outline)] xl:grid-cols-[1.3fr_0.8fr_0.6fr_0.8fr_1.35fr_0.8fr] xl:items-center"
            key={candidate.id}
          >
            <div className="flex min-w-0 items-center gap-3">
              <Avatar initials={candidate.initials} />
              <div className="min-w-0">
                <h2 className="truncate text-base font-medium leading-[1.5] tracking-[0.16px] text-[var(--ink)]">
                  {candidate.name}
                </h2>
                <p className="mt-1 truncate text-sm leading-[1.43] tracking-[0.14px] text-[var(--muted)]">
                  {candidate.role} / {candidate.location}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusPill tone={candidate.stage === "Needs review" ? "warning" : "primary"}>
                {candidate.stage}
              </StatusPill>
              <StatusPill tone={reviewTone(candidate.reviewState)}>
                {candidate.reviewState}
              </StatusPill>
            </div>
            <div>
              <p className="font-display text-3xl font-light leading-[1.13] text-[var(--ink)]">
                {candidate.fitScore}
              </p>
              <p className="text-xs text-[var(--muted)]">
                {candidate.confidence}% confidence
              </p>
            </div>
            <p className="text-sm leading-[1.43] tracking-[0.14px] text-[var(--muted)]">
              {candidate.source}
            </p>
            <p className="text-sm leading-[1.5] tracking-[0.14px] text-[var(--muted)]">
              {candidate.summary}
            </p>
            <button className="min-h-10 rounded-full bg-[var(--warm-stone)] px-4 text-left text-[15px] font-medium leading-[1.47] text-[var(--ink)] shadow-[var(--shadow-warm)] transition hover:bg-[var(--surface-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]">
              {candidate.nextAction}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
