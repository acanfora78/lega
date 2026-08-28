"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, Trophy, Users, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/partite", label: "Partite", icon: CalendarDays },
  { href: "/classifica", label: "Classifica", icon: Trophy },
  { href: "/squadre", label: "Squadre", icon: Users },
  { href: "/altro", label: "Altro", icon: Menu },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 safe-bottom md:hidden">
      {/* glass-nav invece di glass-strong: elemento fixed, sempre sotto lo
          scroll del contenuto — un blur più leggero costa molto meno al
          compositor senza cambiare percettibilmente l'effetto. */}
      <div className="mx-3 mb-3 glass-nav rounded-2xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.7)]">
        <ul className="flex items-stretch justify-between px-1 py-1.5">
          {ITEMS.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={cn(
                    "relative flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold transition-colors ring-focus",
                    active ? "text-primary-glow" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {active && (
                    <span className="absolute -top-1.5 h-1 w-6 rounded-full bg-gradient-to-r from-primary to-primary-glow shadow-[0_0_10px_rgba(34,224,122,0.7)]" />
                  )}
                  <Icon className={cn("size-5", active && "drop-shadow-[0_0_6px_rgba(34,224,122,0.6)]")} strokeWidth={active ? 2.4 : 2} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
