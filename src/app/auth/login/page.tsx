import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { AuthForm } from "@/components/auth/auth-form";
import { LegaMonogram } from "@/components/brand/pitch-art";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export const metadata: Metadata = { title: "Accedi" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; supabase_non_configurato?: string }>;
}) {
  const { next, supabase_non_configurato } = await searchParams;

  return (
    <Container className="flex flex-col items-center gap-6 pt-16">
      <LegaMonogram size={56} />
      <div className="text-center">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Bentornato in Lega</h1>
        <p className="mt-1 text-sm text-muted-foreground">Accedi per seguire la tua squadra del cuore</p>
      </div>

      {/* Il middleware rimanda qui con questo parametro quando le variabili
          Supabase mancano. Senza questo avviso la pagina resterebbe muta e
          sembrerebbe un problema di credenziali. */}
      {supabase_non_configurato === "1" && (
        <Card className="w-full max-w-sm border-warning/25 bg-warning/5">
          <CardContent className="flex items-start gap-2.5 p-4 text-xs text-warning">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>
              <span className="font-bold">Autenticazione non configurata.</span> Mancano le variabili{" "}
              <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
              <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in questo ambiente: finché non sono
              impostate l&apos;area organizzatore resta bloccata. Impostale nelle variabili d&apos;ambiente del
              progetto e ridispiega.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="w-full max-w-sm">
        <CardContent className="p-6">
          <AuthForm mode="login" next={next} />
        </CardContent>
      </Card>
    </Container>
  );
}
