import Link from "next/link";
import { EmailLoginForm } from "@/app/components/organisms/EmailLoginForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-6 text-[var(--ink)] sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1fr_440px]">
        <section className="grid gap-10">
          <Link
            className="flex w-fit items-center gap-3 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--ring)]"
            href="/"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-[var(--ink)] font-display text-xl font-light text-[var(--background)] shadow-[var(--shadow-card)]">
              C
            </span>
            <span>
              <span className="block text-[15px] font-medium leading-[1.33] tracking-[0.15px]">
                Closed AI
              </span>
              <span className="block text-sm tracking-[0.14px] text-[var(--quiet)]">
                Role-based MVP demo
              </span>
            </span>
          </Link>
          <div className="grid max-w-3xl gap-5">
            <p className="font-cta text-sm font-bold uppercase leading-[1.1] tracking-[0.7px] text-[var(--ink)]">
              HR operating layer
            </p>
            <h1 className="font-display text-5xl font-light leading-[1.08] tracking-[-0.96px] text-[var(--ink)] sm:text-6xl">
              Enter the right Closed AI workspace.
            </h1>
            <p className="max-w-2xl text-lg font-normal leading-[1.6] tracking-[0.18px] text-[var(--muted)]">
              A calm MVP entry point for recruiters, candidates, and employees,
              with role-specific views over the same workforce AI layer.
            </p>
          </div>
          <div className="grid gap-3 rounded-3xl bg-[var(--surface-soft)] p-3 shadow-[var(--shadow-inset)] sm:grid-cols-3">
            {[
              ["1", "recruiter sign-in"],
              ["1", "employee sign-in"],
              ["Any", "candidate email"],
            ].map(([value, label]) => (
              <div
                className="rounded-2xl bg-[var(--surface)] p-5 shadow-[var(--shadow-outline)]"
                key={label}
              >
                <p className="font-display text-3xl font-light leading-[1.13] text-[var(--ink)]">
                  {value}
                </p>
                <p className="mt-1 text-sm leading-[1.43] tracking-[0.14px] text-[var(--muted)]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>
        <EmailLoginForm />
      </div>
    </main>
  );
}
