import { NextResponse } from "next/server";
import { erroreApi } from "@/lib/api-error";
import { revalidateCompetizioni } from "@/lib/revalidate";
import { csvAOggetti } from "@/lib/csv";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { getStore, importaCalendarioCompetizione, type RigaCalendarioImport } from "@/lib/store/file-store";
import type { Squadra } from "@/lib/types";

/**
 * Il calendario di una competizione NON lo genera l'app: lo fornisce
 * l'organizzatore via CSV (girone all'italiana, tabellone a eliminazione
 * diretta o gironi+finale — un algoritmo di generazione diverso per ognuno
 * sarebbe un lavoro enorme per un beneficio che un file già pronto ottiene
 * subito). Qui si legge, si valida riga per riga e si scrive in blocco: se
 * anche una sola riga non è valida non si importa nulla, così l'organizzatore
 * corregge il file e ricarica invece di ritrovarsi un calendario a metà.
 */

const COLONNE_RICHIESTE = ["giornata", "data", "squadra_casa", "squadra_trasferta"];

function trovaSquadra(nome: string, squadre: Squadra[]): Squadra | undefined {
  const normalizzato = nome.trim().toLowerCase();
  return squadre.find((s) => s.nome.toLowerCase() === normalizzato || s.nomeBreve.toLowerCase() === normalizzato);
}

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

  const righeCsv = csvAOggetti(csv);
  if (righeCsv.length === 0) {
    return NextResponse.json({ error: "Il file non contiene righe da importare." }, { status: 400 });
  }
  const intestazione = Object.keys(righeCsv[0]);
  const mancanti = COLONNE_RICHIESTE.filter((c) => !intestazione.includes(c));
  if (mancanti.length > 0) {
    return NextResponse.json(
      { error: `Colonne mancanti nell'intestazione: ${mancanti.join(", ")}. Colonne attese: ${COLONNE_RICHIESTE.join(", ")}, arbitro, campo.` },
      { status: 400 }
    );
  }

  const errori: { riga: number; errore: string }[] = [];
  const righeValide: RigaCalendarioImport[] = [];

  righeCsv.forEach((r, i) => {
    const numeroRiga = i + 2; // +1 per l'intestazione, +1 perché l'admin conta da 1
    const giornata = Number(r.giornata);
    if (!Number.isInteger(giornata) || giornata < 1) {
      errori.push({ riga: numeroRiga, errore: `giornata non valida: "${r.giornata}"` });
      return;
    }

    const dataOra = new Date(`${r.data}T${r.ora || "15:00"}:00`);
    if (Number.isNaN(dataOra.getTime())) {
      errori.push({ riga: numeroRiga, errore: `data/ora non valide: "${r.data} ${r.ora ?? ""}"` });
      return;
    }

    const casa = trovaSquadra(r.squadra_casa, squadreAmmesse);
    if (!casa) {
      errori.push({ riga: numeroRiga, errore: `squadra_casa "${r.squadra_casa}" non è tra le squadre iscritte${faseId ? " a questa fase" : ""}.` });
      return;
    }
    const trasferta = trovaSquadra(r.squadra_trasferta, squadreAmmesse);
    if (!trasferta) {
      errori.push({ riga: numeroRiga, errore: `squadra_trasferta "${r.squadra_trasferta}" non è tra le squadre iscritte${faseId ? " a questa fase" : ""}.` });
      return;
    }
    if (casa.id === trasferta.id) {
      errori.push({ riga: numeroRiga, errore: "squadra_casa e squadra_trasferta coincidono." });
      return;
    }

    righeValide.push({
      giornata,
      dataOra: dataOra.toISOString(),
      squadraCasaId: casa.id,
      squadraTrasfertaId: trasferta.id,
      arbitro: r.arbitro || undefined,
      campo: r.campo || undefined,
    });
  });

  if (errori.length > 0) {
    return NextResponse.json({ error: `${errori.length} righe non valide, nessuna partita importata.`, righe: errori }, { status: 400 });
  }

  try {
    const create = await importaCalendarioCompetizione(id, faseId, righeValide);
    revalidateCompetizioni(competizione.slug);
    return NextResponse.json({ creati: create?.length ?? 0 }, { status: 201 });
  } catch (err) {
    return erroreApi(err, "Impossibile importare il calendario.");
  }
}
