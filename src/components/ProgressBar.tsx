export default function ProgressBar({ value, goal, label = "Progresso da meta" }: { value: number; goal: number; label?: string }) {
  const pct = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0;
  return (
    <div role="progressbar" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} className="h-2 w-full overflow-hidden rounded-full bg-brand-border">
      <div className="h-full bg-brand-goldLight" style={{ width: `${pct}%` }} />
    </div>
  );
}
