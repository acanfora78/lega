"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogIn, LogOut, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

// ============================================================================
// STATO DELL'ACCESSO — e il modo per uscirne
// ----------------------------------------------------------------------------
// Prima non esisteva alcun pulsante di logout in tutta l'app: una volta
// effettuato l'accesso (come organizzatore o come tifoso), l'unico modo per
// "cambiare account" era cancellare i dati del sito a mano dal browser. Chi
// registrava un secondo account nello stesso browser restava comunque
// autenticato come il primo finché non lo faceva — la sessione di Supabase
// non si sostituisce da sola alla semplice registrazione se il progetto
// richiede la conferma via email.
// ============================================================================

interface Account {
  email: string;
  organizzatore: boolean;
}

export function AccountStatus() {
  const router = useRouter();
  // Senza Supabase configurato non c'è mai una sessione da leggere: parte già
  // sullo stato "non autenticato" invece di scoprirlo con un setState dentro
  // l'effetto (che innescherebbe un render a cascata inutile).
  const [account, setAccount] = useState<Account | null | undefined>(() => (isSupabaseConfigured ? undefined : null));
  const [uscendo, setUscendo] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient();
    let attivo = true;

    const applica = (email: string | undefined, ruolo: string | undefined) => {
      if (!attivo) return;
      setAccount(email ? { email, organizzatore: ruolo === "organizzatore" } : null);
    };

    supabase.auth.getUser().then(({ data }) => {
      applica(data.user?.email, (data.user?.app_metadata as { role?: string } | undefined)?.role);
    });

    const { data: iscrizione } = supabase.auth.onAuthStateChange((_evento, session) => {
      applica(session?.user.email, (session?.user.app_metadata as { role?: string } | undefined)?.role);
    });

    return () => {
      attivo = false;
      iscrizione.subscription.unsubscribe();
    };
  }, []);

  async function esci() {
    setUscendo(true);
    try {
      await createClient().auth.signOut();
      toast.success("Sei uscito dall'account");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Impossibile uscire dall'account");
    } finally {
      setUscendo(false);
    }
  }

  // Stato indeterminato (prima di sapere se c'è una sessione): nessun lampo
  // del pulsante sbagliato, meglio non mostrare nulla per un istante.
  if (account === undefined) return null;

  if (account) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-display text-base font-bold">Accesso effettuato</p>
            <p className="text-sm text-muted-foreground">
              {account.email}
              {account.organizzatore && " · Organizzatore"}
            </p>
          </div>
          <Button variant="outline" onClick={esci} disabled={uscendo}>
            {uscendo ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
            Esci
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="font-display text-base font-bold">Accedi per salvare le tue preferenze</p>
          <p className="text-sm text-muted-foreground">Sincronizza squadra del cuore, notifiche e voti MVP su tutti i tuoi dispositivi.</p>
        </div>
        <Button asChild>
          <Link href="/auth/login">
            <LogIn className="size-4" />
            Accedi o registrati
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
