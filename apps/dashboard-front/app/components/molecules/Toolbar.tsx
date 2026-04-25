export function Toolbar({
  primaryFilter,
  secondaryFilter,
}: {
  primaryFilter: string;
  secondaryFilter: string;
}) {
  return (
    <div className="grid gap-3 rounded-3xl bg-[var(--surface-soft)] p-3 shadow-[var(--shadow-inset)] md:grid-cols-[1fr_auto_auto]">
      <label className="sr-only" htmlFor="workspace-search">
        Search records
      </label>
      <input
        id="workspace-search"
        className="min-h-12 rounded-full bg-[var(--surface)] px-5 text-[15px] font-medium leading-[1.47] tracking-[0.15px] text-[var(--ink)] shadow-[var(--shadow-outline)] placeholder:text-[var(--quiet)] focus:shadow-[0_0_0_3px_var(--ring),var(--shadow-outline)]"
        placeholder="Search by person, role, document, or action"
        type="search"
      />
      <select
        aria-label={primaryFilter}
        className="min-h-12 rounded-full bg-[var(--surface)] px-5 text-[15px] font-medium leading-[1.47] tracking-[0.15px] text-[var(--ink)] shadow-[var(--shadow-outline)] focus:shadow-[0_0_0_3px_var(--ring),var(--shadow-outline)]"
        defaultValue="all"
      >
        <option value="all">{primaryFilter}</option>
        <option value="active">Active</option>
        <option value="review">Needs review</option>
      </select>
      <select
        aria-label={secondaryFilter}
        className="min-h-12 rounded-full bg-[var(--surface)] px-5 text-[15px] font-medium leading-[1.47] tracking-[0.15px] text-[var(--ink)] shadow-[var(--shadow-outline)] focus:shadow-[0_0_0_3px_var(--ring),var(--shadow-outline)]"
        defaultValue="today"
      >
        <option value="today">{secondaryFilter}</option>
        <option value="week">This week</option>
        <option value="month">This month</option>
      </select>
    </div>
  );
}
