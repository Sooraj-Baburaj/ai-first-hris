import { DemoLogoutButton } from "@/app/components/molecules/DemoLogoutButton";
import Link from "next/link";

const timeline = [
  ["Application received", "Resume and portfolio parsed by Closed AI."],
  [
    "Screening in progress",
    "Recruiter review is queued for the design systems role.",
  ],
  [
    "Next step",
    "Expect an interview coordination email after recruiter approval.",
  ],
];

export default function CandidatePortalPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-6 text-[var(--ink)] sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="grid content-between gap-8 rounded-3xl bg-[var(--surface)] p-6 shadow-[var(--shadow-outline)] lg:p-8">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                className="flex w-fit items-center gap-3 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--ring)]"
                href="/"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-[var(--ink)] font-display text-lg font-light text-[var(--background)] shadow-[var(--shadow-card)]">
                  C
                </span>
                <span className="text-[15px] font-medium leading-[1.33] tracking-[0.15px]">
                  Closed AI
                </span>
              </Link>
              <DemoLogoutButton />
            </div>
            <div className="mt-12 grid gap-4">
              <p className="font-cta text-sm font-bold uppercase leading-[1.1] tracking-[0.7px]">
                Candidate portal
              </p>
              <h1 className="font-display text-5xl font-light leading-[1.08] tracking-[-0.96px] sm:text-6xl">
                Your application is moving.
              </h1>
              <p className="max-w-xl text-lg leading-[1.6] tracking-[0.18px] text-(--muted)">
                Review your current stage, pending items, and recruiter-facing
                AI summary before the next interview step.
              </p>
            </div>
          </div>
          <div className="grid gap-3 rounded-3xl bg-(--warm-stone) p-5 shadow-(--shadow-warm)">
            <p className="text-sm font-medium text-(--ink)">
              Candidate: Maya Rao
            </p>
            <p className="text-sm leading-[1.5] tracking-[0.14px] text-(--muted)">
              Senior Product Designer / Bengaluru / Interview stage
            </p>
          </div>
        </section>
        <section className="grid content-start gap-4 rounded-3xl bg-[var(--surface-soft)] p-3 shadow-[var(--shadow-inset)]">
          <article className="rounded-3xl bg-[var(--surface)] p-6 shadow-[var(--shadow-outline)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-3xl font-light leading-[1.13]">
                Application status
              </h2>
              <span className="rounded-full bg-[var(--green-soft)] px-3 py-1 text-[13px] font-medium text-[var(--green)]">
                88% confidence
              </span>
            </div>
            <p className="mt-4 text-sm leading-[1.5] tracking-[0.14px] text-[var(--muted)]">
              Closed AI found strong systems portfolio evidence and HR workflow
              experience. A recruiter is reviewing the interview brief.
            </p>
          </article>
          <ol className="grid gap-3">
            {timeline.map(([title, detail]) => (
              <li
                className="rounded-3xl bg-[var(--surface)] p-5 shadow-[var(--shadow-outline)]"
                key={title}
              >
                <p className="text-base font-medium leading-[1.5] tracking-[0.16px]">
                  {title}
                </p>
                <p className="mt-2 text-sm leading-[1.5] tracking-[0.14px] text-[var(--muted)]">
                  {detail}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
