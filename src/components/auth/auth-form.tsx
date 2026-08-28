"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Mail, Lock, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

// Destinazione sicura per il redirect "next": solo percorsi interni relativi,
// mai un URL assoluto (evita open-redirect verso domini esterni).
function destinazioneSicura(next: string | undefined) {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return undefined;
}

/**
 * Traduce l'errore di Supabase in un messaggio che dica cosa fare.
 *
 * Il caso importante è il fallimento di rete: Safari lo riporta come
 * "Load failed" e Chrome come "Failed to fetch", stringhe che all'utente non
 * dicono nulla e che vengono facilmente scambiate per una password sbagliata.
 * In realtà significano che il browser non ha proprio raggiunto Supabase —
 * quasi sempre perché il progetto è in pausa (il piano gratuito sospende i
 * progetti inattivi) oppure perché l'URL configurato è errato.
 */
function messaggioErrore(err: unknown): { titolo: string; dettaglio?: string } {
  const grezzo = err instanceof Error ? err.message : String(err);
  const rete = /load failed|failed to fetch|networkerror|fetch failed/i.test(grezzo);

  if (rete) {
    return {
      titolo: "Impossibile raggiungere il server di autenticazione",
      dettaglio:
        "Non è un problema di email o password. Il progetto Supabase potrebbe essere in pausa (il piano gratuito sospende i progetti inattivi: riattivalo dalla dashboard) oppure l'indirizzo configurato non è corretto.",
    };
  }

  if (/invalid login credentials/i.test(grezzo)) {
    return { titolo: "Email o password non corretti" };
  }

  if (/email not confirmed/i.test(grezzo)) {
    return {
      titolo: "Email non ancora confermata",
      dettaglio: "Conferma l'indirizzo dal link ricevuto, oppure segna l'utente come confermato dalla dashboard Supabase.",
    };
  }

  return { titolo: grezzo || "Si è verificato un errore" };
}

export function AuthForm({ mode, next }: { mode: "login" | "signup"; next?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      toast.error("Supabase non è ancora configurato per questo ambiente demo.", {
        description: "Imposta NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY per abilitare l'autenticazione.",
      });
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const destinazione = destinazioneSicura(next);
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const ruolo = (data.user?.app_metadata as { role?: string } | undefined)?.role;
        toast.success("Accesso effettuato");
        // L'organizzatore atterra direttamente nella sua area dedicata invece
        // che nel profilo tifoso generico.
        router.push(ruolo === "organizzatore" ? (destinazione ?? "/admin") : (destinazione ?? "/profilo"));
      } else {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { nome } } });
        if (error) throw error;
        toast.success("Registrazione completata");
        router.push(destinazione ?? "/profilo");
      }
      router.refresh();
    } catch (err) {
      const { titolo, dettaglio } = messaggioErrore(err);
      toast.error(titolo, dettaglio ? { description: dettaglio, duration: 12000 } : undefined);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {mode === "signup" && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nome">Nome e cognome</Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="nome" required value={nome} onChange={(e) => setNome(e.target.value)} className="pl-10" placeholder="Mario Rossi" />
          </div>
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" placeholder="tu@esempio.it" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10"
            placeholder="••••••••"
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="mt-2">
        {loading && <Loader2 className="size-4 animate-spin" />}
        {mode === "login" ? "Accedi" : "Crea account"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        {mode === "login" ? (
          <>
            Non hai un account?{" "}
            <Link href="/auth/signup" className="font-semibold text-primary-glow hover:text-gold-bright">
              Registrati
            </Link>
          </>
        ) : (
          <>
            Hai già un account?{" "}
            <Link href="/auth/login" className="font-semibold text-primary-glow hover:text-gold-bright">
              Accedi
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
