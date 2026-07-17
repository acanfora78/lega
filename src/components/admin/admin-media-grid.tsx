"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { UploadCloud, Trash2, Images, Play } from "lucide-react";
import { PitchBackdrop } from "@/components/brand/pitch-art";
import { Button } from "@/components/ui/button";
import { formatDateIt } from "@/lib/utils";
import type { AlbumMedia } from "@/lib/types";

export function AdminMediaGrid({ album }: { album: AlbumMedia[] }) {
  const [lista, setLista] = useState(album);
  const inputRef = useRef<HTMLInputElement>(null);

  function upload() {
    inputRef.current?.click();
  }

  function onFile() {
    const nuovo: AlbumMedia = {
      id: `up-${Date.now()}`,
      titolo: "Nuovo album caricato",
      copertinaUrl: "",
      data: new Date().toISOString(),
      tipo: "foto",
      itemsUrls: [{ url: "", tipo: "foto" }],
    };
    setLista((prev) => [nuovo, ...prev]);
    toast.success("Album caricato con successo");
  }

  function elimina(id: string) {
    setLista((prev) => prev.filter((a) => a.id !== id));
    toast.success("Album rimosso");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <input ref={inputRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={onFile} />
        <Button size="sm" onClick={upload}>
          <UploadCloud className="size-4" /> Carica foto o video
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {lista.map((a) => (
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
    </div>
  );
}
