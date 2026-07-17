import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { MediaExplorer } from "@/components/media/media-explorer";
import { getAlbum } from "@/lib/data";

export const metadata: Metadata = { title: "Media Center" };

export default function MediaPage() {
  const album = getAlbum();

  return (
    <Container className="flex flex-col gap-6 pt-6 sm:pt-10">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-gold-bright">Media Center</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Foto, Video &amp; Highlights</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ogni emozione del campionato, immortalata giornata dopo giornata.</p>
      </div>
      <MediaExplorer album={album} />
    </Container>
  );
}
