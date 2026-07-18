"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadCloud, Trash2, Images, Play, Loader2 } from "lucide-react";
import { PitchBackdrop } from "@/components/brand/pitch-art";
import { Button } from "@/components/ui/button";
import { formatDateIt } from "@/lib/utils";
import type { AlbumMedia } from "@/lib/types";

export function AdminMediaGrid({ album }: { album: AlbumMedia[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function upload() {
    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titolo: "Nuovo album caricato", tipo: "foto" }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Errore");
      toast.success("Album caricato con successo");
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossibile caricare l'album");
    }
  }

  async function elimina(id: string) {
    try {
      const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Errore");
      toast.success("Album rimosso");
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossibile rimuovere l'album");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-2">
        {isPending && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
        <Button size="sm" onClick={upload}>
          <UploadCloud className="size-4" /> Carica foto o video
        </Button>
      </div>

      {album.length === 0 ? (
        <div className="rounded-2xl glass p-10 text-center text-sm text-muted-foreground">Nessun album ancora caricato.</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {album.map((a) => (
            <div key={a.id} className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl glass bg-pitch-gradient p-3.5">
              <PitchBackdrop />
              <button
                onClick={() => elimina(a.id)}
                className="absolute right-2.5 top-2.5 z-10 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Elimina album"
              >
                <Trash2 className="size-3.5" />
              </button>
              <div className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[10px] font-bold text-white">
                {a.tipo === "video" ? <Play className="size-3" /> : <Images className="size-3" />}
                {a.itemsUrls.length}
              </div>
              <div className="relative">
                <p className="text-[11px] text-muted-foreground">{formatDateIt(a.data)}</p>
                <p className="text-xs font-bold leading-snug">{a.titolo}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
