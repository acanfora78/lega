import { NextResponse } from "next/server";
import { revalidateNews } from "@/lib/revalidate";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { aggiornaArticolo, eliminaArticolo, getStore } from "@/lib/store/file-store";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  const patch = await request.json();
  const aggiornato = await aggiornaArticolo(id, patch);
  if (!aggiornato) return NextResponse.json({ error: "Articolo non trovato." }, { status: 404 });
  revalidateNews(aggiornato.slug);
  return NextResponse.json(aggiornato);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  const slug = (await getStore()).articoli.find((a) => a.id === id)?.slug;
  await eliminaArticolo(id);
  revalidateNews(slug);
  return NextResponse.json({ ok: true });
}
