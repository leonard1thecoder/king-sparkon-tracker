export function SampleBadge({ text = "Sample data — live listings appear here" }: { text?: string }) {
  return (
    <span className="mt-4 inline-flex items-center rounded-full border border-dashed border-[var(--ks-gold)] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[var(--ks-muted)]">
      {text}
    </span>
  );
}
