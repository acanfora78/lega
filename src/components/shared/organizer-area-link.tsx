"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShieldCheck, ChevronRight } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

// ============================================================================
// INGRESSO ALL'AREA ORGANIZZATORE — non un link pubblico
// ----------------------------------------------------------------------------
// Prima compariva come voce fissa nell'header, nella pagina "Altro" e nel
// profilo: visibile a chiunque, anche a chi non aveva alcun account. Da qui
// in poi compare solo a chi ha già effettuato l'accesso con un utente che ha
// app_metadata.role = "organizzatore" — lo stesso identico criterio che
// src/lib/supabase/middleware.ts applica lato server per decidere chi entra
// davvero in /admin.
//
// Nascondere il link qui non è la protezione: è solo cortesia verso chi non
// potrebbe comunque entrarci. Il blocco reale resta il middleware, fail
// closed, che a questo componente è del tutto indifferente — anche
// aggirandolo (URL diretto) la porta resta chiusa a chi non ha quel ruolo.
// ============================================================================

function useOrganizzatore(): boolean {
  const [organizzatore, setOrganizzatore] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient();
    let attivo = true;

    const applicaRuolo = (ruolo: string | undefined) => {
      if (attivo) setOrganizzatore(ruolo === "organizzatore");
    };

    supabase.auth.getUser().then(({ data }) => {
      applicaRuolo((data.user?.app_metadata as { role?: string } | undefined)?.role);
    });

    const { data: iscrizione } = supabase.auth.onAuthStateChange((_evento, session) => {
      applicaRuolo((session?.user.app_metadata as { role?: string } | undefined)?.role);
    });

    return () => {
      attivo = false;
      iscrizione.subscription.unsubscribe();
    };
  }, []);

  return organizzatore;
}

export function OrganizerAreaLink({ variant }: { variant: "icon" | "tile" | "card" | "cta" }) {
  const organizzatore = useOrganizzatore();
  if (!organizzatore) return null;

  if (variant === "cta") {
    return (
      <Button asChild variant="gold">
        <Link href="/admin">
          <ShieldCheck className="size-4" />
          Vai all&apos;area organizzatore
        </Link>
      </Button>
    );
  }

  if (variant === "icon") {
    return (
      <Link
        href="/admin"
        className="ring-focus hidden rounded-full p-2.5 text-muted-foreground hover:bg-white/[0.06] hover:text-foreground sm:flex"
        aria-label="Area Organizzatore"
      >
        <ShieldCheck className="size-[18px]" />
      </Link>
    );
  }

  if (variant === "tile") {
    return (
      <Link href="/admin" className="flex items-center gap-3.5 rounded-2xl glass p-4 hover:border-primary-glow/30">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary-glow">
          <ShieldCheck className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">Area Organizzatore</p>
          <p className="truncate text-xs text-muted-foreground">Gestione completa del campionato</p>
        </div>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </Link>
    );
  }

  return (
    <Link href="/admin" className="flex items-center gap-3 rounded-2xl glass p-4 hover:border-primary-glow/30 sm:flex-1">
      <span className="flex size-10 items-center justify-center rounded-xl bg-gold/15 text-gold-bright">
        <ShieldCheck className="size-4" />
      </span>
      <div>
        <p className="text-sm font-bold">Area Organizzatore</p>
        <p className="text-xs text-muted-foreground">Accesso riservato allo staff della Lega</p>
      </div>
    </Link>
  );
}

/**
 * Stessa porta di OrganizerAreaLink, ma per i pulsanti "vai a configurarlo
 * dal pannello" degli stati vuoti (squadre, classifica, media, news): ognuno
 * ha etichetta e destinazione proprie, quindi qui si passa il pulsante già
 * pronto invece di un'altra variante fissa. A chi non è l'organizzatore che
 * ha già effettuato l'accesso non compare nulla — non un pulsante che
 * porterebbe comunque a un accesso negato.
 */
export function OrganizerOnly({ children }: { children: React.ReactNode }) {
  const organizzatore = useOrganizzatore();
  if (!organizzatore) return null;
  return <>{children}</>;
}
