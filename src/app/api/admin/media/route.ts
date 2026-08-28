import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { erroreApi } from "@/lib/api-error";
import { revalidateMedia } from "@/lib/revalidate";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { creaAlbum } from "@/lib/store/file-store";
import type { AlbumMedia } from "@/lib/types";

export async function POST(request: Request) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await request.json().catch(() => ({}));

  const itemsUrls = Array.isArray(body.itemsUrls)
    ? body.itemsUrls
        .filter((i: unknown): i is { url: string; tipo: string } => Boolean(i && typeof i === "object" && "url" in i))
        .map((i: { url: string; tipo: string }) => ({ url: String(i.url), tipo: i.tipo === "video" ? "video" : "foto" }))
    : [];

  if (itemsUrls.length === 0) {
    return NextResponse.json({ error: "Carica almeno un file." }, { status: 400 });
  }

  const album: AlbumMedia = {
    id: `album-${randomUUID()}`,
    titolo: String(body.titolo ?? "Nuovo album"),
    copertinaUrl: String(body.copertinaUrl ?? itemsUrls[0].url),
    data: new Date().toISOString(),
    tipo: body.tipo === "video" ? "video" : "foto",
    itemsUrls,
  };

  try {
    await creaAlbum(album);
    revalidateMedia();
    return NextResponse.json(album, { status: 201 });
  } catch (err) {
    return erroreApi(err, "Impossibile salvare l'album.");
  }
}
