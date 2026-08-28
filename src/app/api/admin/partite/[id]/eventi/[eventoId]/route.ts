import { NextResponse } from "next/server";
import { revalidatePartite } from "@/lib/revalidate";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { eliminaEventoPartita } from "@/lib/store/file-store";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string; eventoId: string }> }) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id, eventoId } = await params;
  const partita = await eliminaEventoPartita(id, eventoId);
  if (!partita) return NextResponse.json({ error: "Partita non trovata." }, { status: 404 });
  revalidatePartite(partita.id);
  return NextResponse.json(partita);
}
