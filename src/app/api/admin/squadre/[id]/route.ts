import { NextResponse } from "next/server";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { aggiornaSquadra, eliminaSquadra } from "@/lib/store/file-store";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  const patch = await request.json();
  const aggiornata = aggiornaSquadra(id, patch);
  if (!aggiornata) return NextResponse.json({ error: "Squadra non trovata." }, { status: 404 });
  return NextResponse.json(aggiornata);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  eliminaSquadra(id);
  return NextResponse.json({ ok: true });
}
