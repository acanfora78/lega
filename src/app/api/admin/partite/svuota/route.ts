import { NextResponse } from "next/server";
import { erroreApi } from "@/lib/api-error";
import { revalidatePartite } from "@/lib/revalidate";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { svuotaCalendarioPartite } from "@/lib/store/file-store";

// ============================================================================
// SVUOTAMENTO CALENDARIO — campionato principale
// ----------------------------------------------------------------------------
// Toglie tutte le partite del campionato principale in un colpo solo (cronaca,
// tabellini e voti compresi), per ripartire da un CSV nuovo invece di
// eliminare gara per gara. Le competizioni aggiuntive non sono toccate.
// Nessun oggetto partita da passare a revalidatePartite() qui: sono tutte
// sparite insieme, quindi si ricade sulle sole pagine elenco (come già fa la
// funzione quando non riceve nulla) — le schede di dettaglio delle singole
// squadre/giocatori restano comunque valide, non parlano più di partite che
// non esistono più.
// ============================================================================

export async function POST() {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    await svuotaCalendarioPartite();
    await revalidatePartite();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return erroreApi(err, "Impossibile svuotare il calendario.");
  }
}
