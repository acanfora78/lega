import { csvAOggetti } from "@/lib/csv";
import { parseDataOraRoma } from "@/lib/timezone";
import type { RigaCalendarioImport } from "@/lib/store/file-store";
import type { Squadra } from "@/lib/types";

/**
 * Validazione del CSV di un calendario, condivisa tra l'import del
 * campionato principale e quello delle competizioni aggiuntive: stessa
 * struttura di colonne, stessa logica di risoluzione squadre per nome,
 * cambia solo l'elenco delle squadre ammesse (l'intera Lega per il
 * campionato, le sole iscritte per una competizione o una sua fase).
 */
export const COLONNE_CALENDARIO_RICHIESTE = ["giornata", "data", "squadra_casa", "squadra_trasferta"];

export interface ErroreRigaCalendario {
  riga: number;
  errore: string;
}

export type EsitoValidazioneCalendario =
  | { ok: true; righe: RigaCalendarioImport[] }
  | { ok: false; errore: string; righe?: ErroreRigaCalendario[] };

function trovaSquadra(nome: string, squadre: Squadra[]): Squadra | undefined {
  const normalizzato = nome.trim().toLowerCase();
  return squadre.find((s) => s.nome.toLowerCase() === normalizzato || s.nomeBreve.toLowerCase() === normalizzato);
}

export function validaCalendarioCsv(csv: string, squadreAmmesse: Squadra[], contestoErrore = ""): EsitoValidazioneCalendario {
  const righeCsv = csvAOggetti(csv);
  if (righeCsv.length === 0) {
    return { ok: false, errore: "Il file non contiene righe da importare." };
  }

  const intestazione = Object.keys(righeCsv[0]);
  const mancanti = COLONNE_CALENDARIO_RICHIESTE.filter((c) => !intestazione.includes(c));
  if (mancanti.length > 0) {
    return {
      ok: false,
      errore: `Colonne mancanti nell'intestazione: ${mancanti.join(", ")}. Colonne attese: ${COLONNE_CALENDARIO_RICHIESTE.join(", ")}, arbitro, campo${contestoErrore ? ` (${contestoErrore})` : ""}.`,
    };
  }

  const errori: ErroreRigaCalendario[] = [];
  const righeValide: RigaCalendarioImport[] = [];

  righeCsv.forEach((r, i) => {
    const numeroRiga = i + 2; // +1 per l'intestazione, +1 perché l'admin conta da 1
    const giornata = Number(r.giornata);
    if (!Number.isInteger(giornata) || giornata < 1) {
      errori.push({ riga: numeroRiga, errore: `giornata non valida: "${r.giornata}"` });
      return;
    }

    const dataOra = parseDataOraRoma(r.data, r.ora || "15:00");
    if (Number.isNaN(dataOra.getTime())) {
      errori.push({ riga: numeroRiga, errore: `data/ora non valide: "${r.data} ${r.ora ?? ""}"` });
      return;
    }

    const casa = trovaSquadra(r.squadra_casa, squadreAmmesse);
    if (!casa) {
      errori.push({ riga: numeroRiga, errore: `squadra_casa "${r.squadra_casa}" non è tra le squadre ammesse${contestoErrore}.` });
      return;
    }
    const trasferta = trovaSquadra(r.squadra_trasferta, squadreAmmesse);
    if (!trasferta) {
      errori.push({ riga: numeroRiga, errore: `squadra_trasferta "${r.squadra_trasferta}" non è tra le squadre ammesse${contestoErrore}.` });
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
    return { ok: false, errore: `${errori.length} righe non valide, nessuna partita importata.`, righe: errori };
  }

  return { ok: true, righe: righeValide };
}
