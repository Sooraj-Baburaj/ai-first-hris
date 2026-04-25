"use client";

import { Avatar } from "@/app/components/atoms/Avatar";
import { StatusPill } from "@/app/components/atoms/StatusPill";
import { apiBaseUrl } from "@/app/lib/api";
import type { CandidateSummaryDto } from "@closed-ai/types";
import { useMemo, useState } from "react";

function toTitleCase(value: string) {
  return value
    .split("_")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

function reviewTone(reviewState: CandidateSummaryDto["reviewState"]) {
  if (reviewState === "auto_ready") return "success" as const;
  if (reviewState === "escalated") return "danger" as const;
  return "warning" as const;
}

function initialsFromName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function CandidateList({
  candidates,
}: {
  candidates: CandidateSummaryDto[];
}) {
  const [items, setItems] = useState(candidates);
  const [selectedId, setSelectedId] = useState<string | null>(
    candidates.length > 0 ? candidates[0].id : null,
  );
  const [actionState, setActionState] = useState<"idle" | "sending">("idle");

  const selectedCandidate = useMemo(
    () => items.find((candidate) => candidate.id === selectedId) ?? null,
    [items, selectedId],
  );

  async function handleSendScreening(candidateId: string) {
    setActionState("sending");

    try {
      const response = await fetch(
        `${apiBaseUrl}/api/v1/recruiter/candidates/${candidateId}/send-technical-screening`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to send");
      }

      const payload = (await response.json()) as {
        candidate: CandidateSummaryDto;
      };
      if (payload.candidate) {
        setItems((previous) =>
          previous.map((candidate) =>
            candidate.id === payload.candidate.id
              ? payload.candidate
              : candidate,
          ),
        );
      }
    } finally {
      setActionState("idle");
    }
  }

  if (items.length === 0) {
    return (
      <section className="grid gap-3 rounded-3xl bg-[var(--surface-soft)] p-3 shadow-[var(--shadow-inset)]">
        <article className="rounded-3xl bg-[var(--surface)] p-8 shadow-[var(--shadow-outline)]">
          <h2 className="font-display text-3xl font-light leading-[1.13] text-[var(--ink)]">
            No candidates yet
          </h2>
          <p className="mt-3 max-w-[65ch] text-sm leading-[1.5] tracking-[0.14px] text-[var(--muted)]">
            Candidate records appear here after someone submits a resume from
            the candidate portal.
          </p>
        </article>
      </section>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.45fr_0.95fr]">
      <section className="rounded-3xl bg-[var(--surface-soft)] p-3 shadow-[var(--shadow-inset)]">
        <div className="hidden grid-cols-[1.25fr_0.85fr_0.65fr_0.75fr_0.75fr_1fr] gap-3 px-4 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[var(--quiet)] xl:grid">
          <span>Candidate</span>
          <span>Stage</span>
          <span>Fit</span>
          <span>AI confidence</span>
          <span>Source</span>
          <span>Next action</span>
        </div>
        <div className="grid gap-3">
          {items.map((candidate) => (
            <article
              className={`grid cursor-pointer gap-4 rounded-3xl bg-[var(--surface)] p-5 shadow-[var(--shadow-outline)] xl:grid-cols-[1.25fr_0.85fr_0.65fr_0.75fr_0.75fr_1fr] xl:items-center ${
                candidate.id === selectedId ? "ring-2 ring-[var(--ring)]" : ""
              }`}
              key={candidate.id}
              onClick={() => setSelectedId(candidate.id)}
            >
              <div className="flex min-w-0 items-center gap-3">
                <Avatar initials={initialsFromName(candidate.fullName)} />
                <div className="min-w-0">
                  <h2 className="truncate text-base font-medium leading-[1.5] tracking-[0.16px] text-[var(--ink)]">
                    {candidate.fullName}
                  </h2>
                  <p className="mt-1 truncate text-sm leading-[1.43] tracking-[0.14px] text-[var(--muted)]">
                    {candidate.roleApplied} / {candidate.location}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusPill tone="primary">
                  {toTitleCase(candidate.stage)}
                </StatusPill>
                <StatusPill tone={reviewTone(candidate.reviewState)}>
                  {toTitleCase(candidate.reviewState)}
                </StatusPill>
                {candidate.aiAnalysisFailed ? (
                  <StatusPill tone="danger">AI failed</StatusPill>
                ) : null}
              </div>
              <div>
                <p className="font-display text-3xl font-light leading-[1.13] text-[var(--ink)]">
                  {candidate.fitScore}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  {candidate.compatibilityScore}% compatibility
                </p>
              </div>
              <p className="text-sm leading-[1.43] tracking-[0.14px] text-[var(--muted)]">
                {candidate.aiAnalysisFailed ? "Unavailable" : `${candidate.confidence}%`}
              </p>
              <p className="text-sm leading-[1.43] tracking-[0.14px] text-[var(--muted)]">
                {toTitleCase(candidate.source)}
              </p>
              <StatusPill
                tone={
                  candidate.technicalScreening.status === "auto_sent" ||
                  candidate.technicalScreening.status === "manual_sent"
                    ? "success"
                    : "warning"
                }
              >
                {candidate.technicalScreening.status === "not_sent"
                  ? "Not sent"
                  : "Invite sent"}
              </StatusPill>
            </article>
          ))}
        </div>
      </section>

      {selectedCandidate ? (
        <aside className="rounded-3xl bg-[var(--surface)] p-6 shadow-[var(--shadow-outline)] xl:sticky xl:top-6 xl:self-start">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-3xl font-light leading-[1.13] text-[var(--ink)]">
              Analysis panel
            </h3>
            <StatusPill
              tone={
                selectedCandidate.compatibilityScore > 60
                  ? "success"
                  : "warning"
              }
            >
              {selectedCandidate.compatibilityScore}% compatibility
            </StatusPill>
          </div>

          <p className="mt-3 text-sm leading-[1.5] tracking-[0.14px] text-[var(--muted)]">
            {selectedCandidate.analysisDetails.fitReasoning}
          </p>
          <p className="mt-2 text-sm leading-[1.5] tracking-[0.14px] text-[var(--muted)]">
            {selectedCandidate.analysisDetails.compatibilityReasoning}
          </p>

          <div className="mt-5 grid gap-3">
            <article className="rounded-2xl bg-[var(--surface-soft)] p-4">
              <p className="text-sm font-medium text-[var(--ink)]">Pros</p>
              <ul className="mt-2 grid gap-2">
                {selectedCandidate.analysisDetails.pros.length > 0 ? (
                  selectedCandidate.analysisDetails.pros.map((item) => (
                    <li className="text-sm text-[var(--muted)]" key={item}>
                      - {item}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-[var(--muted)]">
                    - No strengths extracted yet.
                  </li>
                )}
              </ul>
            </article>

            <article className="rounded-2xl bg-[var(--surface-soft)] p-4">
              <p className="text-sm font-medium text-[var(--ink)]">Cons</p>
              <ul className="mt-2 grid gap-2">
                {selectedCandidate.analysisDetails.cons.length > 0 ? (
                  selectedCandidate.analysisDetails.cons.map((item) => (
                    <li className="text-sm text-[var(--muted)]" key={item}>
                      - {item}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-[var(--muted)]">
                    - No risks extracted yet.
                  </li>
                )}
              </ul>
            </article>
          </div>

          <div className="mt-5 grid gap-2">
            <p className="text-sm font-medium text-[var(--ink)]">
              Technical screening
            </p>
            <p className="text-sm text-[var(--muted)]">
              Invitation status:{" "}
              {toTitleCase(selectedCandidate.technicalScreening.status)}
            </p>
            {selectedCandidate.compatibilityScore <= 60 &&
            selectedCandidate.technicalScreening.status === "not_sent" ? (
              <button
                className="mt-2 min-h-11 rounded-full bg-[var(--ink)] px-4 text-[15px] font-medium leading-[1.47] text-[var(--surface)] shadow-[var(--shadow-card)] transition hover:bg-[var(--muted)] disabled:opacity-70"
                disabled={actionState === "sending"}
                onClick={() => void handleSendScreening(selectedCandidate.id)}
                type="button"
              >
                {actionState === "sending"
                  ? "Sending invitation"
                  : "Send technical screening anyway"}
              </button>
            ) : null}
          </div>
        </aside>
      ) : null}
    </div>
  );
}
