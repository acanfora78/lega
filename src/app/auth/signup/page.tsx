import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { AuthForm } from "@/components/auth/auth-form";
import { LegaMonogram } from "@/components/brand/pitch-art";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Registrati" };

export default function SignupPage() {
  return (
    <Container className="flex flex-col items-center gap-6 pt-16">
      <LegaMonogram size={56} />
      <div className="text-center">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Entra a far parte della Lega</h1>
        <p className="mt-1 text-sm text-muted-foreground">Crea il tuo account tifoso gratuito</p>
      </div>
      <Card className="w-full max-w-sm">
        <CardContent className="p-6">
          <AuthForm mode="signup" />
        </CardContent>
      </Card>
    </Container>
  );
}
