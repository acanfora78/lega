import { NextResponse } from "next/server";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { aggiungiEventoPartita } from "@/lib/store/file-store";
import type { EventoPartita } from "@/lib/types";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  const body = await request.json();

  const evento: EventoPartita = {
    id: `evento-${Date.now()}`,
    partitaId: id,
    minuto: Number(body.minuto) || 1,
    tempo: Number(body.minuto) > 45 ? 2 : 1,
    tipo: body.tipo,
    squadraId: body.squadraId,
    giocatoreId: body.giocatoreId || undefined,
  };

  const partita = aggiungiEventoPartita(id, evento);
  if (!partita) return NextResponse.json({ error: "Partita non trovata." }, { status: 404 });
  return NextResponse.json(partita, { status: 201 });
}
