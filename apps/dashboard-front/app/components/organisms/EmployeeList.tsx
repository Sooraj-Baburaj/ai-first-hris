import { Avatar } from "@/app/components/atoms/Avatar";
import { StatusPill } from "@/app/components/atoms/StatusPill";
import type { EmployeeSummaryDto } from "@closed-ai/types";

function toTitleCase(value: string) {
  return value
    .split("_")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

function priorityTone(priority: EmployeeSummaryDto["priority"]) {
  if (priority === "high") return "danger" as const;
  if (priority === "medium") return "warning" as const;
  return "success" as const;
}

function initialsFromName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function EmployeeList({ employees }: { employees: EmployeeSummaryDto[] }) {
  if (employees.length === 0) {
    return (
      <section className="grid gap-3 rounded-3xl bg-[var(--surface-soft)] p-3 shadow-[var(--shadow-inset)]">
        <article className="rounded-3xl bg-[var(--surface)] p-8 shadow-[var(--shadow-outline)]">
          <h2 className="font-display text-3xl font-light leading-[1.13] text-[var(--ink)]">
            No employees yet
          </h2>
          <p className="mt-3 max-w-[65ch] text-sm leading-[1.5] tracking-[0.14px] text-[var(--muted)]">
            Employees appear once a recruiter converts a hired candidate to an
            employee record.
          </p>
        </article>
      </section>
    );
  }

  return (
    <section className="rounded-3xl bg-[var(--surface-soft)] p-3 shadow-[var(--shadow-inset)]">
      <div className="hidden grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.85fr_1fr] gap-3 px-4 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[var(--quiet)] xl:grid">
        <span>Employee</span>
        <span>Department</span>
        <span>Manager</span>
        <span>Status</span>
        <span>Progress</span>
        <span>Suggested follow-up</span>
      </div>
      <div className="grid gap-3">
        {employees.map((employee) => (
          <article
            className="grid gap-4 rounded-3xl bg-[var(--surface)] p-5 shadow-[var(--shadow-outline)] xl:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.85fr_1fr] xl:items-center"
            key={employee.id}
          >
            <div className="flex min-w-0 items-center gap-3">
              <Avatar initials={initialsFromName(employee.fullName)} />
              <div className="min-w-0">
                <h2 className="truncate text-base font-medium leading-[1.5] tracking-[0.16px] text-[var(--ink)]">
                  {employee.fullName}
                </h2>
                <p className="mt-1 truncate text-sm leading-[1.43] tracking-[0.14px] text-[var(--muted)]">
                  {employee.location}
                </p>
              </div>
            </div>
            <p className="text-sm leading-[1.43] tracking-[0.14px] text-[var(--muted)]">
              {employee.department}
            </p>
            <p className="text-sm leading-[1.43] tracking-[0.14px] text-[var(--muted)]">
              {employee.manager}
            </p>
            <div className="flex flex-wrap gap-2">
              <StatusPill tone={employee.onboardingStatus === "healthy" ? "success" : "primary"}>
                {toTitleCase(employee.onboardingStatus)}
              </StatusPill>
              <StatusPill tone={priorityTone(employee.priority)}>{toTitleCase(employee.priority)}</StatusPill>
            </div>
            <div className="grid gap-2">
              <div className="h-2 rounded-full bg-[var(--surface-muted)] shadow-[var(--shadow-inset)]">
                <div className="h-full rounded-full bg-[var(--ink)]" style={{ width: `${employee.progress}%` }} />
              </div>
              <p className="text-xs text-[var(--muted)]">{employee.progress}% complete</p>
            </div>
            <button className="min-h-10 rounded-full bg-[var(--warm-stone)] px-4 text-left text-[15px] font-medium leading-[1.47] text-[var(--ink)] shadow-[var(--shadow-warm)] transition hover:bg-[var(--surface-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]">
              {employee.suggestedFollowUp}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
