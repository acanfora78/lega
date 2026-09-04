import { NextResponse } from "next/server";
import { erroreApi } from "@/lib/api-error";
import { revalidatePartite } from "@/lib/revalidate";
import { validaCalendarioCsv } from "@/lib/calendario-import";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { getStore, importaCalendarioPartite } from "@/lib/store/file-store";

/** Import in blocco del calendario del campionato principale da file CSV. Stessa logica di validazione delle competizioni aggiuntive, vedi src/lib/calendario-import.ts. */
export async function POST(request: Request) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await request.json();
  const csv = String(body.csv ?? "");
  if (!csv.trim()) return NextResponse.json({ error: "Nessun contenuto CSV ricevuto." }, { status: 400 });

  const store = await getStore();
  if (store.squadre.length === 0) {
    return NextResponse.json({ error: "Crea prima le squadre: il calendario si risolve sui loro nomi." }, { status: 400 });
  }

  const esito = validaCalendarioCsv(csv, store.squadre, " tra le squadre della Lega");
  if (!esito.ok) {
    return NextResponse.json({ error: esito.errore, righe: esito.righe }, { status: 400 });
  }

  try {
    const importate = await importaCalendarioPartite(esito.righe);
    await revalidatePartite();
    return NextResponse.json({ creati: importate.creati, aggiornati: importate.aggiornati }, { status: 201 });
  } catch (err) {
    return erroreApi(err, "Impossibile importare il calendario.");
  }
}
