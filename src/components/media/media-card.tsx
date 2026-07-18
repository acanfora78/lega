import Link from "next/link";
import { Play, Images } from "lucide-react";
import { formatDateIt } from "@/lib/utils";
import type { AlbumMedia } from "@/lib/types";

export function MediaCard({ album }: { album: AlbumMedia }) {
  return (
    <Link
      href={`/media?album=${album.id}`}
      className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl bg-pitch-gradient p-4 glass"
    >
      {album.copertinaUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- copertina caricata dall'organizzatore su Supabase Storage
        <img src={album.copertinaUrl} alt="" className="absolute inset-0 size-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full glass px-2.5 py-1 text-xs font-bold">
        {album.tipo === "video" ? <Play className="size-3" /> : <Images className="size-3" />}
        {album.itemsUrls.length}
      </div>
      <div className="relative">
        <p className="text-xs font-semibold text-muted-foreground">{formatDateIt(album.data)}</p>
        <p className="font-display text-sm font-bold leading-snug group-hover:text-primary-glow">{album.titolo}</p>
      </div>
    </Link>
  );
}
