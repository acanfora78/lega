import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { erroreApi } from "@/lib/api-error";
import { revalidateNews } from "@/lib/revalidate";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { creaArticolo } from "@/lib/store/file-store";
import type { Articolo } from "@/lib/types";
import { slugify } from "@/lib/utils";

export async function POST(request: Request) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await request.json();
  const titolo = String(body.titolo ?? "").trim();
  if (!titolo) return NextResponse.json({ error: "Il titolo è obbligatorio." }, { status: 400 });

  const articolo: Articolo = {
    id: `articolo-${randomUUID()}`,
    slug: slugify(titolo),
    titolo,
    sommario: String(body.sommario ?? ""),
    contenuto: String(body.contenuto ?? ""),
    copertinaUrl: String(body.copertinaUrl ?? ""),
    categoria: body.categoria ?? "articolo",
    autore: String(body.autore ?? "Redazione Lega"),
    pubblicatoIl: new Date().toISOString(),
    in_evidenza: Boolean(body.in_evidenza),
  };

  try {
    await creaArticolo(articolo);
    revalidateNews(articolo.slug);
    return NextResponse.json(articolo, { status: 201 });
  } catch (err) {
    return erroreApi(err, "Impossibile pubblicare l'articolo.");
  }
}
