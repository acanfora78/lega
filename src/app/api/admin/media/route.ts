import { NextResponse } from "next/server";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { creaAlbum } from "@/lib/store/file-store";
import type { AlbumMedia } from "@/lib/types";

export async function POST(request: Request) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await request.json().catch(() => ({}));

  const album: AlbumMedia = {
    id: `album-${Date.now()}`,
    titolo: String(body.titolo ?? "Nuovo album"),
    copertinaUrl: "",
    data: new Date().toISOString(),
    tipo: body.tipo ?? "foto",
    itemsUrls: [{ url: "", tipo: body.tipo ?? "foto" }],
  };

  creaAlbum(album);
  return NextResponse.json(album, { status: 201 });
}
