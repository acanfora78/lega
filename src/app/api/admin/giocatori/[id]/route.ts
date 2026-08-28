import { NextResponse } from "next/server";
import { revalidateGiocatori } from "@/lib/revalidate";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { aggiornaGiocatore, eliminaGiocatore, getStore } from "@/lib/store/file-store";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  const patch = await request.json();
  const aggiornato = await aggiornaGiocatore(id, patch);
  if (!aggiornato) return NextResponse.json({ error: "Giocatore non trovato." }, { status: 404 });
  const squadraSlug = (await getStore()).squadre.find((s) => s.id === aggiornato.squadraId)?.slug;
  revalidateGiocatori({ giocatoreId: aggiornato.id, squadraSlug });
  return NextResponse.json(aggiornato);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  const giocatore = (await getStore()).giocatori.find((g) => g.id === id);
  const squadraSlug = giocatore ? (await getStore()).squadre.find((s) => s.id === giocatore.squadraId)?.slug : undefined;
  await eliminaGiocatore(id);
  revalidateGiocatori({ giocatoreId: id, squadraSlug });
  return NextResponse.json({ ok: true });
}
