import Link from "next/link";
import { Container } from "@/components/shared/container";
import { PitchBackdrop, StadiumLights, LegaMonogram } from "@/components/brand/pitch-art";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <Container className="pt-6 sm:pt-10">
      <div className="relative overflow-hidden rounded-3xl bg-pitch-gradient">
        <div className="bg-aurora absolute inset-0 opacity-50 mix-blend-screen" />
        <PitchBackdrop />
        <StadiumLights />
        <div className="relative flex flex-col items-center gap-4 px-6 py-20 text-center">
          <LegaMonogram size={48} />
          <p className="font-score text-7xl font-extrabold text-gold-bright">404</p>
          <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Fuorigioco!</h1>
          <p className="max-w-md text-sm text-muted-foreground">
            La pagina che cerchi è finita fuori dal campo. Torna in Home o prova a cercare quello che ti serve.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/">
                <Home className="size-4" /> Torna alla Home
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/ricerca">
                <Search className="size-4" /> Cerca nella Lega
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
}
