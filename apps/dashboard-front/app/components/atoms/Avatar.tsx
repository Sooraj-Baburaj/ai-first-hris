export function Avatar({ initials }: { initials: string }) {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--warm-stone)] text-[13px] font-medium text-[var(--ink)] shadow-[var(--shadow-inset)]">
      {initials}
    </span>
  );
}
