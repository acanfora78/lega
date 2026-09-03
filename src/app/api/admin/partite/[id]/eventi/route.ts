import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { erroreApi } from "@/lib/api-error";
import { revalidatePartite } from "@/lib/revalidate";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { aggiungiEventoPartita } from "@/lib/store/file-store";
import type { EventoPartita, TipoEvento } from "@/lib/types";

// Il tipo evento decide gol e provvedimenti disciplinari: va validato contro
// l'elenco ammesso invece di fidarsi del body, altrimenti un valore fuori
// elenco finisce nel tabellino e sfugge sia al punteggio sia al regolamento.
const TIPI: TipoEvento[] = [
  "goal",
  "autogoal",
  "rigore_segnato",
  "rigore_sbagliato",
  "assist",
  "ammonizione",
  "secondo_giallo",
  "espulsione",
  "sostituzione",
  "inizio_partita",
  "fine_primo_tempo",
  "inizio_secondo_tempo",
  "fine_partita",
  "mvp",
];

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  const body = await request.json();

  if (!TIPI.includes(body.tipo)) {
    return NextResponse.json({ error: "Tipo di evento non valido." }, { status: 400 });
  }

  const evento: EventoPartita = {
    id: `evento-${randomUUID()}`,
    partitaId: id,
    minuto: Number(body.minuto) || 1,
    tempo: Number(body.minuto) > 45 ? 2 : 1,
    tipo: body.tipo,
    squadraId: body.squadraId,
    giocatoreId: body.giocatoreId || undefined,
  };

  try {
    const partita = await aggiungiEventoPartita(id, evento);
    if (!partita) return NextResponse.json({ error: "Partita non trovata." }, { status: 404 });
    revalidatePartite(partita.id);
    return NextResponse.json(partita, { status: 201 });
  } catch (err) {
    return erroreApi(err, "Impossibile aggiungere l'evento alla cronaca.");
  }
}
