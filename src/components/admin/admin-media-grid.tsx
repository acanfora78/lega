"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadCloud, Trash2, Images, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { formatDateIt } from "@/lib/utils";
import type { AlbumMedia } from "@/lib/types";

const BUCKET = "lega-media";

export function AdminMediaGrid({ album }: { album: AlbumMedia[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [nascosti, setNascosti] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  function apriNuovo() {
    setFiles([]);
    setOpen(true);
  }

  async function salva(form: FormData) {
    if (files.length === 0) {
      toast.error("Seleziona almeno un file da caricare");
      return;
    }
    const titolo = String(form.get("titolo") ?? "Nuovo album");
    setUploading(true);
    try {
      const supabase = createClient();
      const itemsUrls = await Promise.all(
        files.map(async (file) => {
          const tipo: "foto" | "video" = file.type.startsWith("video") ? "video" : "foto";
          const ext = file.name.split(".").pop() ?? (tipo === "video" ? "mp4" : "jpg");
          const path = `album/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false, cacheControl: "31536000" });
          if (error) throw error;
          const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
          return { url: data.publicUrl, tipo };
        })
      );

      const tipoAlbum: "foto" | "video" = itemsUrls.every((i) => i.tipo === "video") ? "video" : "foto";

      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titolo, tipo: tipoAlbum, itemsUrls, copertinaUrl: itemsUrls[0]?.url ?? "" }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Errore");
      toast.success("Album caricato con successo");
      setOpen(false);
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossibile caricare l'album");
    } finally {
      setUploading(false);
    }
  }

  async function elimina(id: string) {
    setNascosti((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Errore");
      toast.success("Album rimosso");
      startTransition(() => router.refresh());
    } catch (err) {
      setNascosti((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.error(err instanceof Error ? err.message : "Impossibile rimuovere l'album");
    }
  }

  const albumVisibili = album.filter((a) => !nascosti.has(a.id));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-2">
        {isPending && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
        <Button size="sm" onClick={apriNuovo}>
          <UploadCloud className="size-4" /> Carica foto o video
        </Button>
      </div>

      {albumVisibili.length === 0 ? (
        <div className="rounded-2xl glass p-10 text-center text-sm text-muted-foreground">Nessun album ancora caricato.</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {albumVisibili.map((a) => (
            <div key={a.id} className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl glass bg-pitch-gradient p-3.5">
              {a.copertinaUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- copertina caricata dall'organizzatore su Supabase Storage
                <img src={a.copertinaUrl} alt="" className="absolute inset-0 size-full object-cover" />
              )}
              <button
                onClick={() => elimina(a.id)}
                className="absolute right-2.5 top-2.5 z-10 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Elimina album"
              >
                <Trash2 className="size-3.5" />
              </button>
              <div className="absolute left-2.5 top-2.5 z-10 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[10px] font-bold text-white">
                {a.tipo === "video" ? <Play className="size-3" /> : <Images className="size-3" />}
                {a.itemsUrls.length}
              </div>
              <div className="relative z-10">
                <p className="text-[11px] text-muted-foreground">{formatDateIt(a.data)}</p>
                <p className="text-xs font-bold leading-snug">{a.titolo}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuovo album</DialogTitle>
          </DialogHeader>
          <form action={(fd) => salva(fd)} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="titolo">Titolo album</Label>
              <Input id="titolo" name="titolo" placeholder="Es. Giornata 12 in fotografia" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Foto o video</Label>
              <input
                ref={inputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              />
              <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => inputRef.current?.click()}>
                <UploadCloud className="size-4" /> Scegli file
              </Button>
              {files.length > 0 && <p className="text-xs text-muted-foreground">{files.length} file selezionati</p>}
            </div>
            <Button type="submit" className="mt-1" disabled={uploading}>
              {uploading && <Loader2 className="size-4 animate-spin" />}
              {uploading ? "Caricamento in corso..." : "Carica album"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
