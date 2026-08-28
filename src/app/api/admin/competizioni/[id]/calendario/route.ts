import { NextResponse } from "next/server";
import { erroreApi } from "@/lib/api-error";
import { revalidateCompetizioni } from "@/lib/revalidate";
import { validaCalendarioCsv } from "@/lib/calendario-import";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { getStore, importaCalendarioCompetizione } from "@/lib/store/file-store";

/**
 * Il calendario di una competizione NON lo genera l'app: lo fornisce
 * l'organizzatore via CSV (girone all'italiana, tabellone a eliminazione
 * diretta o gironi+finale — un algoritmo di generazione diverso per ognuno
 * sarebbe un lavoro enorme per un beneficio che un file già pronto ottiene
 * subito). Qui si legge, si valida riga per riga e si scrive in blocco: se
 * anche una sola riga non è valida non si importa nulla, così l'organizzatore
 * corregge il file e ricarica invece di ritrovarsi un calendario a metà.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  const body = await request.json();
  const csv = String(body.csv ?? "");
  const faseId = typeof body.faseId === "string" && body.faseId ? body.faseId : undefined;
  if (!csv.trim()) return NextResponse.json({ error: "Nessun contenuto CSV ricevuto." }, { status: 400 });

  const store = await getStore();
  const competizione = store.competizioni.find((c) => c.id === id);
  if (!competizione) return NextResponse.json({ error: "Competizione non trovata." }, { status: 404 });

  let squadreAmmesse = store.squadre.filter((s) => competizione.squadreIscritteIds.includes(s.id));
  if (faseId) {
    const fase = competizione.fasi.find((f) => f.id === faseId);
    if (!fase) return NextResponse.json({ error: "Fase non trovata." }, { status: 404 });
    squadreAmmesse = store.squadre.filter((s) => fase.squadreIds.includes(s.id));
  }

  const esito = validaCalendarioCsv(csv, squadreAmmesse, faseId ? " a questa fase" : " a questa competizione");
  if (!esito.ok) {
    return NextResponse.json({ error: esito.errore, righe: esito.righe }, { status: 400 });
  }

  try {
    const create = await importaCalendarioCompetizione(id, faseId, esito.righe);
    revalidateCompetizioni(competizione.slug);
    return NextResponse.json({ creati: create?.length ?? 0 }, { status: 201 });
  } catch (err) {
    return erroreApi(err, "Impossibile importare il calendario.");
  }
}
