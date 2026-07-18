"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const BUCKET = "lega-media";

export function ImageUpload({
  value,
  onChange,
  folder,
  label = "Carica immagine",
  shape = "square",
}: {
  value?: string;
  onChange: (url: string) => void;
  folder: string;
  label?: string;
  shape?: "square" | "circle" | "wide";
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false, cacheControl: "31536000" });
      if (error) throw error;
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Immagine caricata");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Caricamento immagine non riuscito");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden bg-white/[0.04] text-muted-foreground",
          shape === "circle" ? "size-14 rounded-full" : shape === "wide" ? "h-14 w-24 rounded-lg" : "size-14 rounded-xl"
        )}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element -- anteprima di un'immagine caricata su Supabase Storage, dominio non noto in anticipo
          <img src={value} alt="" className="size-full object-cover" />
        ) : (
          <ImageIcon className="size-5" />
        )}
      </div>
      <div className="flex flex-col gap-1">
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {value ? "Cambia immagine" : label}
        </Button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-left text-xs text-muted-foreground hover:text-danger"
          >
            Rimuovi
          </button>
        )}
      </div>
    </div>
  );
}
