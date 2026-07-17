export function StatBar({
  label,
  home,
  away,
  format,
}: {
  label: string;
  home: number;
  away: number;
  format?: (v: number) => string;
}) {
  const total = home + away || 1;
  const homePct = (home / total) * 100;
  const fmt = format ?? ((v: number) => String(v));

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm font-semibold">
        <span className="tabular-nums">{fmt(home)}</span>
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className="tabular-nums">{fmt(away)}</span>
      </div>
      <div className="flex h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-l-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-700"
          style={{ width: `${homePct}%` }}
        />
        <div
          className="h-full rounded-r-full bg-gradient-to-r from-gold to-gold-bright transition-all duration-700"
          style={{ width: `${100 - homePct}%` }}
        />
      </div>
    </div>
  );
}
