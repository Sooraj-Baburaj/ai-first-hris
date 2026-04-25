import { Avatar } from "@/app/components/atoms/Avatar";
import { StatusPill } from "@/app/components/atoms/StatusPill";
import type { Employee } from "@/app/lib/recruiter-data";

function priorityTone(priority: Employee["priority"]) {
  if (priority === "High") return "danger" as const;
  if (priority === "Medium") return "warning" as const;
  return "success" as const;
}

export function EmployeeList({ employees }: { employees: Employee[] }) {
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
              <Avatar initials={employee.initials} />
              <div className="min-w-0">
                <h2 className="truncate text-base font-medium leading-[1.5] tracking-[0.16px] text-[var(--ink)]">
                  {employee.name}
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
              <StatusPill tone={employee.status === "Healthy" ? "success" : "primary"}>
                {employee.status}
              </StatusPill>
              <StatusPill tone={priorityTone(employee.priority)}>
                {employee.priority}
              </StatusPill>
            </div>
            <div className="grid gap-2">
              <div className="h-2 rounded-full bg-[var(--surface-muted)] shadow-[var(--shadow-inset)]">
                <div
                  className="h-full rounded-full bg-[var(--ink)]"
                  style={{ width: `${employee.progress}%` }}
                />
              </div>
              <p className="text-xs text-[var(--muted)]">
                {employee.progress}% complete
              </p>
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
