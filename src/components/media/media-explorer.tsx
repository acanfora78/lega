"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PitchBackdrop } from "@/components/brand/pitch-art";
import { formatDateIt } from "@/lib/utils";
import type { AlbumMedia } from "@/lib/types";
import { Play, Images } from "lucide-react";

function AlbumGrid({ items, onSelect }: { items: AlbumMedia[]; onSelect: (a: AlbumMedia) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((a) => (
        <button
          key={a.id}
          onClick={() => onSelect(a)}
          className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl glass bg-pitch-gradient p-4 text-left transition-transform hover:-translate-y-1"
        >
          {a.copertinaUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- copertina caricata dall'organizzatore su Supabase Storage
            <img src={a.copertinaUrl} alt="" className="absolute inset-0 size-full object-cover" />
          ) : (
            <PitchBackdrop />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full glass px-2.5 py-1 text-xs font-bold">
            {a.tipo === "video" ? <Play className="size-3" /> : <Images className="size-3" />}
            {a.itemsUrls.length}
          </div>
          <div className="relative">
            <p className="text-xs font-semibold text-muted-foreground">{formatDateIt(a.data)}</p>
            <p className="font-display text-sm font-bold leading-snug group-hover:text-primary-glow">{a.titolo}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

export function MediaExplorer({ album }: { album: AlbumMedia[] }) {
  const [selezionato, setSelezionato] = useState<AlbumMedia | null>(null);
  const foto = album.filter((a) => a.tipo === "foto");
  const video = album.filter((a) => a.tipo === "video");

  return (
    <>
      <Tabs defaultValue="tutti">
        <TabsList>
          <TabsTrigger value="tutti">Tutti</TabsTrigger>
          <TabsTrigger value="foto">Foto</TabsTrigger>
          <TabsTrigger value="video">Video</TabsTrigger>
        </TabsList>
        <TabsContent value="tutti" className="mt-5">
          <AlbumGrid items={album} onSelect={setSelezionato} />
        </TabsContent>
        <TabsContent value="foto" className="mt-5">
          <AlbumGrid items={foto} onSelect={setSelezionato} />
        </TabsContent>
        <TabsContent value="video" className="mt-5">
          <AlbumGrid items={video} onSelect={setSelezionato} />
        </TabsContent>
      </Tabs>

      <Dialog open={Boolean(selezionato)} onOpenChange={(open) => !open && setSelezionato(null)}>
        <DialogContent>
          {selezionato && (
            <>
              <DialogHeader>
                <DialogTitle>{selezionato.titolo}</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">{formatDateIt(selezionato.data, { day: "2-digit", month: "long", year: "numeric" })}</p>
              <div className="grid grid-cols-3 gap-2">
                {selezionato.itemsUrls.map((item, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-xl bg-pitch-gradient">
                    {item.url ? (
                      item.tipo === "video" ? (
                        <video src={item.url} className="size-full object-cover" controls />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element -- foto caricata dall'organizzatore su Supabase Storage
                        <img src={item.url} alt="" className="size-full object-cover" />
                      )
                    ) : (
                      <PitchBackdrop />
                    )}
                    {item.tipo === "video" && !item.url && <Play className="absolute inset-0 m-auto size-6 text-white/80" />}
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
