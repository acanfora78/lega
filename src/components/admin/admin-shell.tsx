"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCog,
  CalendarDays,
  Trophy,
  Newspaper,
  Images,
  Handshake,
  Bell,
  Settings,
  ShieldCheck,
  Gavel,
} from "lucide-react";
import { cn } from "@/lib/utils";

const VOCI = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/squadre", label: "Squadre", icon: Users },
  { href: "/admin/giocatori", label: "Giocatori", icon: UserCog },
  { href: "/admin/partite", label: "Partite & Risultati", icon: CalendarDays },
  { href: "/admin/competizioni", label: "Competizioni", icon: Trophy },
  { href: "/admin/disciplinare", label: "Giudice Sportivo", icon: Gavel },
  { href: "/admin/news", label: "News", icon: Newspaper },
  { href: "/admin/media", label: "Galleria", icon: Images },
  { href: "/admin/sponsor", label: "Sponsor", icon: Handshake },
  { href: "/admin/notifiche", label: "Notifiche Push", icon: Bell },
  { href: "/admin/impostazioni", label: "Impostazioni Lega", icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
      <aside className="lg:sticky lg:top-20 lg:h-fit">
        <div className="mb-3 flex items-center gap-2 rounded-2xl glass p-3.5 text-xs font-bold uppercase tracking-wider text-gold-bright">
          <ShieldCheck className="size-4" />
          Area Organizzatore
        </div>
        <nav className="no-scrollbar flex gap-1.5 overflow-x-auto lg:flex-col lg:overflow-visible">
          {VOCI.map((v) => {
            const active = v.href === "/admin" ? pathname === "/admin" : pathname.startsWith(v.href);
            return (
              <Link
                key={v.href}
                href={v.href}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors",
                  active ? "bg-primary/15 text-primary-glow" : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
                )}
              >
                <v.icon className="size-4 shrink-0" />
                <span className="whitespace-nowrap">{v.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
