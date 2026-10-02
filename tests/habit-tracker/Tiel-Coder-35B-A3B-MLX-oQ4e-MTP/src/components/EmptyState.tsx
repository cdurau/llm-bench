export function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-2xl border bg-[var(--surface)] px-4 py-6" style={{ borderColor: 'var(--edge)' }}>
      <p className="font-medium tracking-tight" style={{ color: 'var(--ink)' }}>
        {title}
      </p>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
        {hint}
      </p>
    </div>
  );
}
