export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="flex flex-col gap-4">
      <p className="font-cta text-sm font-bold uppercase leading-[1.1] tracking-[0.7px] text-[var(--ink)]">
        {eyebrow}
      </p>
      <div className="flex max-w-4xl flex-col gap-3">
        <h1 className="font-display text-4xl font-light leading-[1.17] text-[var(--ink)]">
          {title}
        </h1>
        <p className="max-w-3xl text-lg font-normal leading-[1.6] tracking-[0.18px] text-[var(--muted)]">
          {description}
        </p>
      </div>
    </header>
  );
}
