import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/shared/container";
import { MediaExplorer } from "@/components/media/media-explorer";
import { Button } from "@/components/ui/button";
import { getAlbum } from "@/lib/data";
import { Images, ShieldCheck } from "lucide-react";

export const metadata: Metadata = { title: "Media Center" };

export default async function MediaPage() {
  const album = await getAlbum();

  return (
    <Container className="flex flex-col gap-6 pt-6 sm:pt-10">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-gold-bright">Media Center</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Foto, Video &amp; Highlights</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ogni emozione del campionato, immortalata giornata dopo giornata.</p>
      </div>
      {album.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl glass p-12 text-center">
          <Images className="size-8 text-muted-foreground" />
          <p className="font-display text-lg font-bold">Nessun contenuto ancora caricato</p>
          <p className="max-w-md text-sm text-muted-foreground">
            Foto, video e highlights caricati dall&apos;area organizzatore compariranno in questa galleria.
          </p>
          <Button asChild className="mt-2">
            <Link href="/admin/media">
              <ShieldCheck className="size-4" /> Carica il primo contenuto
            </Link>
          </Button>
        </div>
      ) : (
        <MediaExplorer album={album} />
      )}
    </Container>
  );
}
