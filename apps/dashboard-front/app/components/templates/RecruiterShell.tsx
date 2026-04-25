import { DemoLogoutButton } from "@/app/components/molecules/DemoLogoutButton";
import Link from "next/link";

const navItems = [
  { href: "/recruiter/candidates", label: "Candidates" },
  { href: "/recruiter/employees", label: "Employees" },
  { path: null, label: "Onboarding" },
  { path: null, label: "Helpdesk" },
  { path: null, label: "Knowledge" },
];

export function RecruiterShell({
  active,
  children,
}: {
  active: "Candidates" | "Employees";
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--ink)]">
      <div className="mx-auto grid min-h-screen w-full max-w-[1680px] lg:grid-cols-[280px_1fr]">
        <aside className="bg-[var(--surface)] px-4 py-5 shadow-[var(--shadow-inset)] lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:px-5 lg:py-6">
          <div className="flex items-center justify-between gap-4 lg:grid lg:gap-8">
            <Link
              className="flex items-center gap-3 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--ring)]"
              href="/"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-[var(--ink)] font-display text-lg font-light text-[var(--background)] shadow-[var(--shadow-card)]">
                C
              </span>
              <span>
                <span className="block text-[15px] font-medium leading-[1.33] tracking-[0.15px] text-[var(--ink)]">
                  Closed AI
                </span>
                <span className="block text-xs text-[var(--quiet)]">
                  Closed AI / Recruiter
                </span>
              </span>
            </Link>
            <span className="rounded-full bg-[var(--warm-stone)] px-3 py-1.5 text-xs font-medium text-[var(--ink)] shadow-[var(--shadow-warm)] lg:hidden">
              Demo
            </span>
          </div>

          <nav
            aria-label="Recruiter workspace"
            className="mt-5 flex gap-2 overflow-x-auto lg:mt-10 lg:grid lg:gap-1"
          >
            {navItems.map((item) =>
              "path" in item && item.path === null ? (
                <span
                  className="whitespace-nowrap rounded-full px-3 py-2.5 text-sm font-medium text-[var(--quiet)]"
                  key={item.label}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  className={`whitespace-nowrap rounded-full px-3 py-2.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] ${
                    active === item.label
                      ? "bg-[var(--ink)] text-[var(--surface)] shadow-[var(--shadow-card)]"
                      : "text-[var(--muted)] hover:bg-[var(--warm-stone)] hover:text-[var(--ink)]"
                  }`}
                  href={item.href}
                  key={item.label}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="mt-8 hidden rounded-3xl bg-[var(--warm-stone)] p-5 shadow-[var(--shadow-warm)] lg:grid">
            <p className="font-cta text-sm font-bold uppercase leading-[1.1] tracking-[0.7px] text-[var(--ink)]">
              Role guard
            </p>
            <p className="mt-3 text-sm leading-[1.5] tracking-[0.14px] text-[var(--muted)]">
              The MVP uses static role routing for recruiters, candidates, and
              employees. Production access control will enforce the same role
              boundaries on the server.
            </p>
            <div className="mt-5">
              <DemoLogoutButton />
            </div>
          </div>
        </aside>
        <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
