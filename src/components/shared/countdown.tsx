"use client";

import { useEffect, useState } from "react";

function diffParts(target: Date, from: Date) {
  const total = Math.max(0, target.getTime() - from.getTime());
  const giorni = Math.floor(total / (1000 * 60 * 60 * 24));
  const ore = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minuti = Math.floor((total / (1000 * 60)) % 60);
  const secondi = Math.floor((total / 1000) % 60);
  return { giorni, ore, minuti, secondi, total };
}

export function Countdown({ target, compact = false }: { target: string | Date; compact?: boolean }) {
  const targetDate = typeof target === "string" ? new Date(target) : target;
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- prima misurazione dell'orologio client, evita mismatch di idratazione
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const parts = diffParts(targetDate, now ?? targetDate);

  if (!now) return null;

  if (parts.total <= 0) {
    return <span className="font-score text-sm font-semibold text-primary-glow">In corso</span>;
  }

  const units = [
    { label: "gg", value: parts.giorni },
    { label: "hh", value: parts.ore },
    { label: "mm", value: parts.minuti },
    { label: "ss", value: parts.secondi },
  ];

  if (compact) {
    return (
      <span className="font-score text-sm font-semibold tabular-nums">
        {parts.giorni > 0 && `${parts.giorni}g `}
        {String(parts.ore).padStart(2, "0")}:{String(parts.minuti).padStart(2, "0")}:{String(parts.secondi).padStart(2, "0")}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {units.map((u) => (
        <div key={u.label} className="glass flex min-w-[52px] flex-col items-center rounded-xl py-2">
          <span className="font-score text-2xl font-bold tabular-nums leading-none text-foreground">
            {String(u.value).padStart(2, "0")}
          </span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{u.label}</span>
        </div>
      ))}
    </div>
  );
}
