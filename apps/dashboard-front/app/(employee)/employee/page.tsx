import { DemoLogoutButton } from "@/app/components/molecules/DemoLogoutButton";
import Link from "next/link";

const actions = [
  ["Onboarding", "2 documents need confirmation before Friday."],
  ["Helpdesk", "Benefits ticket routed to People Ops with AI summary."],
  ["Learning", "Manager enablement path is ready for review."],
];

export default function EmployeePortalPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-6 text-[var(--ink)] sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl gap-6 lg:grid-cols-[1fr_360px]">
        <section className="grid gap-6">
          <div className="rounded-3xl bg-[var(--surface)] p-6 shadow-[var(--shadow-outline)] lg:p-8">
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
                Employee portal
              </p>
              <h1 className="font-display text-5xl font-light leading-[1.08] tracking-[-0.96px] sm:text-6xl">
                Your HR workspace is organized.
              </h1>
              <p className="max-w-2xl text-lg leading-[1.6] tracking-[0.18px] text-[var(--muted)]">
                See onboarding progress, support activity, and recommended
                learning next steps from the same Closed AI assistant layer.
              </p>
            </div>
          </div>
          <div className="grid gap-3 rounded-3xl bg-[var(--surface-soft)] p-3 shadow-[var(--shadow-inset)] md:grid-cols-3">
            {actions.map(([title, detail]) => (
              <article
                className="rounded-3xl bg-[var(--surface)] p-5 shadow-[var(--shadow-outline)]"
                key={title}
              >
                <h2 className="text-base font-medium leading-[1.5] tracking-[0.16px]">
                  {title}
                </h2>
                <p className="mt-2 text-sm leading-[1.5] tracking-[0.14px] text-[var(--muted)]">
                  {detail}
                </p>
              </article>
            ))}
          </div>
        </section>
        <aside className="grid content-start gap-4 rounded-3xl bg-[var(--surface)] p-6 shadow-[var(--shadow-outline)]">
          <h2 className="font-display text-3xl font-light leading-[1.13]">
            Today
          </h2>
          <div className="grid gap-3">
            <div className="rounded-3xl bg-[var(--warm-stone)] p-5 shadow-[var(--shadow-warm)]">
              <p className="text-sm font-medium text-[var(--ink)]">
                Profile health
              </p>
              <p className="mt-2 font-display text-4xl font-light leading-[1.1]">
                72%
              </p>
              <p className="mt-2 text-sm leading-[1.5] tracking-[0.14px] text-[var(--muted)]">
                Complete the tax declaration to clear onboarding.
              </p>
            </div>
            <button className="min-h-11 rounded-full bg-[var(--ink)] px-4 text-[15px] font-medium leading-[1.47] text-[var(--surface)] shadow-[var(--shadow-card)] transition hover:bg-[var(--muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]">
              Ask HR assistant
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
