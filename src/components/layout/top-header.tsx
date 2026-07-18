"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell, ShieldCheck, User } from "lucide-react";
import { LegaMonogram } from "@/components/brand/pitch-art";
import { cn } from "@/lib/utils";

const DESKTOP_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/partite", label: "Partite" },
  { href: "/classifica", label: "Classifica" },
  { href: "/squadre", label: "Squadre" },
  { href: "/statistiche", label: "Statistiche" },
  { href: "/news", label: "News" },
  { href: "/media", label: "Media" },
  { href: "/campionati-passati", label: "Campionati Passati" },
  { href: "/hall-of-fame", label: "Hall of Fame" },
];

export function TopHeader() {
  const pathname = usePathname();

  return (
    <header className="safe-top sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <LegaMonogram size={34} />
          <div className="hidden leading-none sm:block">
            <p className="font-display text-sm font-bold tracking-tight">LEGA CALCIO</p>
            <p className="font-score text-[11px] font-semibold tracking-[0.2em] text-gold-bright">OVER 40</p>
          </div>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {DESKTOP_ITEMS.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ring-focus",
                  active ? "bg-white/[0.08] text-primary-glow" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <Link href="/ricerca" className="ring-focus rounded-full p-2.5 text-muted-foreground hover:bg-white/[0.06] hover:text-foreground" aria-label="Cerca">
            <Search className="size-[18px]" />
          </Link>
          <Link href="/altro#notifiche" className="ring-focus rounded-full p-2.5 text-muted-foreground hover:bg-white/[0.06] hover:text-foreground" aria-label="Notifiche">
            <Bell className="size-[18px]" />
          </Link>
          <Link
            href="/admin"
            className="ring-focus hidden rounded-full p-2.5 text-muted-foreground hover:bg-white/[0.06] hover:text-foreground sm:flex"
            aria-label="Area Organizzatore"
          >
            <ShieldCheck className="size-[18px]" />
          </Link>
          <Link
            href="/profilo"
            className="ring-focus flex items-center gap-2 rounded-full border border-border-strong bg-white/[0.03] py-1.5 pl-1.5 pr-3 hover:bg-white/[0.06]"
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-primary-glow to-primary">
              <User className="size-4 text-primary-foreground" />
            </span>
            <span className="hidden text-sm font-semibold sm:block">Profilo</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
