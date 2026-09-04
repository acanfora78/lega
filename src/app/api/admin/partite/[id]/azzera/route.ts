import { NextResponse } from "next/server";
import { erroreApi } from "@/lib/api-error";
import { revalidatePartite } from "@/lib/revalidate";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { azzeraStatistichePartita } from "@/lib/store/file-store";

// ============================================================================
// AZZERAMENTO STATISTICHE DI UNA PARTITA
// ----------------------------------------------------------------------------
// Cancella cronaca, distinta, voti, MVP e risultato riportando la gara a
// 0-0 senza eventi e allo stato "programmata", ma la lascia nel calendario:
// distinto da DELETE /api/admin/partite/[id], che toglie la gara stessa. Se
// la partita era conclusa, la classifica si aggiorna di conseguenza — la
// gara azzerata sparisce del tutto dal conteggio delle giocate, come se non
// fosse mai stata disputata, finché non viene ricompilata.
// ============================================================================

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;

  try {
    const partita = await azzeraStatistichePartita(id);
    if (!partita) return NextResponse.json({ error: "Partita non trovata." }, { status: 404 });
    await revalidatePartite(partita);
    return NextResponse.json(partita);
  } catch (err) {
    return erroreApi(err, "Impossibile azzerare le statistiche della partita.");
  }
}
