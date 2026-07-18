import { NextResponse } from "next/server";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { aggiornaGiocatore, eliminaGiocatore } from "@/lib/store/file-store";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  const patch = await request.json();
  const aggiornato = aggiornaGiocatore(id, patch);
  if (!aggiornato) return NextResponse.json({ error: "Giocatore non trovato." }, { status: 404 });
  return NextResponse.json(aggiornato);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  eliminaGiocatore(id);
  return NextResponse.json({ ok: true });
}
