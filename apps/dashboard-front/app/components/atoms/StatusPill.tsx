type StatusTone = "neutral" | "primary" | "success" | "warning" | "danger";

const toneClasses: Record<StatusTone, string> = {
  neutral: "bg-[var(--surface-muted)] text-[var(--muted)]",
  primary: "bg-[var(--warm-stone)] text-[var(--ink)]",
  success: "bg-[var(--green-soft)] text-[var(--green)]",
  warning: "bg-[var(--amber-soft)] text-[var(--amber)]",
  danger: "bg-[var(--rose-soft)] text-[var(--rose)]",
};

export function StatusPill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: StatusTone;
}) {
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full px-3 text-[13px] font-medium leading-[1.38] ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
