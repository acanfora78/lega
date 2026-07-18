import type {
  AlbumMedia,
  Articolo,
  Giocatore,
  Partita,
  PremioSettimanale,
  RigaClassifica,
  Sponsor,
  Squadra,
  Stagione,
} from "@/lib/types";

// ============================================================================
// STORE IN-MEMORIA DELLA STAGIONE CORRENTE
// ----------------------------------------------------------------------------
// Nessun dato di esempio: la piattaforma parte pulita, pronta per l'inserimento
// reale da parte dell'area organizzatore. In produzione questo modulo viene
// sostituito da query Supabase (stessa forma dei dati, vedi src/lib/types.ts
// e supabase/schema.sql) — la data layer in src/lib/data/*.ts non cambia.
//
// L'archivio delle stagioni concluse (classifiche/marcatori reali) vive
// separatamente in src/lib/data/storico.ts.
// ============================================================================

export interface LegaData {
  stagioni: Stagione[];
  stagioneAttualeId: string;
  squadre: Squadra[];
  giocatori: Giocatore[];
  partite: Partita[];
  classifica: RigaClassifica[];
  articoli: Articolo[];
  albumMedia: AlbumMedia[];
  sponsor: Sponsor[];
  premiSettimanali: PremioSettimanale[];
}

function creaStagioneVuota(): Stagione {
  const oggi = new Date();
  const anno = oggi.getMonth() >= 6 ? oggi.getFullYear() : oggi.getFullYear() - 1; // luglio→giugno
  return {
    id: "stagione-corrente",
    etichetta: `${anno}/${anno + 1}`,
    dataInizio: `${anno}-09-01`,
    dataFine: `${anno + 1}-06-30`,
    attuale: true,
  };
}

function statoVuoto(): LegaData {
  const stagioneAttuale = creaStagioneVuota();
  return {
    stagioni: [stagioneAttuale],
    stagioneAttualeId: stagioneAttuale.id,
    squadre: [],
    giocatori: [],
    partite: [],
    classifica: [],
    articoli: [],
    albumMedia: [],
    sponsor: [],
    premiSettimanali: [],
  };
}

let cached: LegaData | null = null;

export function legaData(): LegaData {
  if (!cached) cached = statoVuoto();
  return cached;
}
