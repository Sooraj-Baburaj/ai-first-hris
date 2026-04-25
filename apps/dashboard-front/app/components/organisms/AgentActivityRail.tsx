import { agentEvents } from "@/app/lib/recruiter-data";

export function AgentActivityRail() {
  return (
    <aside className="rounded-3xl bg-[var(--surface)] p-5 shadow-[var(--shadow-outline)] lg:sticky lg:top-6 lg:self-start">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-light leading-[1.13] text-[var(--ink)]">
            Agent activity
          </h2>
          <p className="mt-2 text-sm leading-[1.5] tracking-[0.14px] text-[var(--muted)]">
            Audit-friendly actions from the last hour.
          </p>
        </div>
        <span className="rounded-full bg-[var(--green-soft)] px-3 py-1 text-[13px] font-medium text-[var(--green)]">
          Live
        </span>
      </div>
      <ol className="mt-5 grid gap-3">
        {agentEvents.map((event) => (
          <li
            className="rounded-2xl bg-[var(--surface)] p-4 shadow-[var(--shadow-inset)]"
            key={event.id}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium tracking-[0.14px] text-[var(--ink)]">
                {event.label}
              </p>
              <time className="text-xs text-[var(--quiet)]">{event.time}</time>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {event.detail}
            </p>
          </li>
        ))}
      </ol>
    </aside>
  );
}
