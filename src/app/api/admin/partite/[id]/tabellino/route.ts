import { NextResponse } from "next/server";
import { erroreApi } from "@/lib/api-error";
import { revalidatePartite } from "@/lib/revalidate";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { impostaTabellinoPartita } from "@/lib/store/file-store";
import type { RigaTabellino } from "@/lib/tabellino";

// ============================================================================
// TABELLINO DI GARA — salvataggio di una squadra alla volta
// ----------------------------------------------------------------------------
// Arriva l'intero referto della squadra, non la singola modifica: lo store lo
// riconcilia con quello che c'è già (vedi src/lib/tabellino.ts). Una squadra
// per chiamata perché è così che si compila a bordo campo, e perché due
// salvataggi indipendenti non possono sovrascriversi il lavoro a vicenda.
//
// Qui si controlla solo la forma dei numeri; chi appartiene a quale rosa lo
// verifica lo store, che ha i tesserati.
// ============================================================================

/** Interi non negativi e con un tetto: un dito fermo sul + non deve scrivere 900 gol. */
function conteggio(valore: unknown, massimo: number): number {
  const n = Math.trunc(Number(valore));
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(n, massimo);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const squadraId = typeof body.squadraId === "string" ? body.squadraId : "";
  if (!squadraId) return NextResponse.json({ error: "Squadra non indicata." }, { status: 400 });
  if (!Array.isArray(body.righe)) return NextResponse.json({ error: "Tabellino non valido." }, { status: 400 });

  const righe: RigaTabellino[] = body.righe
    .filter((r: unknown): r is Record<string, unknown> => typeof r === "object" && r !== null)
    .filter((r: Record<string, unknown>) => typeof r.giocatoreId === "string" && r.giocatoreId)
    .map((r: Record<string, unknown>) => ({
      giocatoreId: String(r.giocatoreId),
      presente: Boolean(r.presente),
      titolare: Boolean(r.titolare),
      numero: conteggio(r.numero, 99),
      gol: conteggio(r.gol, 30),
      rigori: conteggio(r.rigori, 30),
      autoreti: conteggio(r.autoreti, 30),
      assist: conteggio(r.assist, 30),
      ammonizione: Boolean(r.ammonizione),
      doppiaAmmonizione: Boolean(r.doppiaAmmonizione),
      espulsione: Boolean(r.espulsione),
      voto: typeof r.voto === "number" && Number.isFinite(r.voto) ? r.voto : null,
    }));

  try {
    const partita = await impostaTabellinoPartita(id, squadraId, righe);
    if (!partita) return NextResponse.json({ error: "Partita non trovata." }, { status: 404 });
    await revalidatePartite(partita);
    return NextResponse.json(partita);
  } catch (err) {
    return erroreApi(err, "Impossibile salvare il tabellino.");
  }
}
