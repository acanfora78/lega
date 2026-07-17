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

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
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
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { nome } } });
        if (error) throw error;
      }
      toast.success(mode === "login" ? "Accesso effettuato" : "Registrazione completata");
      router.push("/profilo");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Si è verificato un errore");
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
