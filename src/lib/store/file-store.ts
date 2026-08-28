import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { createReadOnlyClient } from "@/lib/supabase/read-only";
import type {
  AlbumMedia,
  Articolo,
  EventoPartita,
  Giocatore,
  Notifica,
  Partita,
  PremioSettimanale,
  RigaClassifica,
  Sponsor,
  Squadra,
  Squalifica,
  Stagione,
  StatoPartita,
  VotoPartita,
} from "@/lib/types";

/** Scala dei voti usata sia dal pannello admin sia dalla validazione lato server. */
export const VOTO_MINIMO = 1;
export const VOTO_MASSIMO = 10;

// ============================================================================
// STORE REALE (server-side)
// ----------------------------------------------------------------------------
// Nessuna "modalità demo": ogni azione dell'area organizzatore passa da qui e
// viene scritta realmente, quindi sopravvive a refresh, riavvii, sessioni e
// utenti diversi. Due backend possibili, scelti in automatico:
//
//   1. Supabase (NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
//      impostate): l'intero stato della lega vive come un'unica riga JSONB
//      nella tabella `lega_store` (vedi supabase/schema.sql). Funziona ovunque,
//      incluse le funzioni serverless di Vercel/Netlify dove il filesystem
//      è effimero/di sola lettura. Le scritture passano dalla sessione
//      dell'utente autenticato (cookie), quindi restano protette dalla RLS
//      `is_organizzatore()` già definita nello schema.
//   2. File locale (`.data/league.json`): usato quando Supabase non è
//      configurato, tipicamente in sviluppo o su hosting con disco
//      persistente (VPS, Docker, Railway, Render, Fly.io). Se il filesystem
//      risulta di sola lettura degrada a stato iniziale in memoria invece
//      di far crashare il render della pagina.
// ============================================================================

export interface ImpostazioniLega {
  nomeLega: string;
  campo: string;
  email: string;
  telefono: string;
  stagioneEtichetta: string;
  stagioneDataInizio: string;
  stagioneDataFine: string;
  regolamento: string;
  automazioni: {
    classificaAutomatica: boolean;
    marcatoriAutomatici: boolean;
    mvpAutomatico: boolean;
    notifichePushGol: boolean;
    partitaSettimanaAutomatica: boolean;
  };
}

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
  notifiche: Notifica[];
  squalifiche: Squalifica[];
  impostazioni: ImpostazioniLega;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "league.json");

const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function stagioneCorrenteDefault(): Stagione {
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

function statoIniziale(): LegaData {
  const stagione = stagioneCorrenteDefault();
  return {
    stagioni: [stagione],
    stagioneAttualeId: stagione.id,
    squadre: [],
    giocatori: [],
    partite: [],
    classifica: [],
    articoli: [],
    albumMedia: [],
    sponsor: [],
    premiSettimanali: [],
    notifiche: [],
    squalifiche: [],
    impostazioni: {
      nomeLega: "Lega Calcio Over 40",
      campo: "Campo Sportivo Santa Teresa, Scafati (SA)",
      email: "info@legacalciooverquaranta.it",
      telefono: "",
      stagioneEtichetta: stagione.etichetta,
      stagioneDataInizio: stagione.dataInizio,
      stagioneDataFine: stagione.dataFine,
      regolamento: "",
      automazioni: {
        classificaAutomatica: true,
        marcatoriAutomatici: true,
        mvpAutomatico: true,
        notifichePushGol: true,
        partitaSettimanaAutomatica: false,
      },
    },
  };
}

// ---------------------------------------------------------------------------
// BACKEND SUPABASE — unica riga JSONB nella tabella lega_store
// ---------------------------------------------------------------------------
async function loadFromSupabase(): Promise<LegaData> {
  try {
    const supabase = createReadOnlyClient();
    const { data, error } = await supabase.from("lega_store").select("data").eq("id", 1).maybeSingle();
    if (error) throw error;
    if (!data) return statoIniziale();
    return { ...statoIniziale(), ...(data.data as Partial<LegaData>) };
  } catch (err) {
    console.warn("[store] Lettura da Supabase fallita, uso stato iniziale in memoria.", err);
    return statoIniziale();
  }
}

async function persistToSupabase(data: LegaData) {
  // A differenza di loadFromSupabase, qui l'errore NON va inghiottito: se una
  // scrittura fallisce (sessione scaduta, RLS, rete) il chiamante deve saperlo,
  // altrimenti la route API risponde "successo" mentre il database non è mai
  // stato aggiornato — l'organizzatore vede sparire una riga e la ritrova al
  // refresh successivo, perché quello che ha "salvato" non è mai stato scritto.
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("lega_store").upsert({ id: 1, data, updated_at: new Date().toISOString() });
  if (error) {
    console.error("[store] Scrittura su Supabase fallita.", error);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// BACKEND FILE — .data/league.json (sviluppo o hosting con disco persistente)
// ---------------------------------------------------------------------------
// Nessuna cache in memoria: il modulo dello store viene istanziato separatamente
// per ogni route/pagina compilata (Route Handler vs Server Component), quindi una
// cache a livello di modulo non sarebbe condivisa tra le due copie. Si legge
// quindi sempre il file per garantire uno stato coerente.
//
// Su filesystem in sola lettura (es. funzioni serverless senza Supabase
// configurato) mkdir/writeFile falliscono: qui non deve mai far crashare il
// render della pagina, quindi si degrada a stato iniziale in memoria (nessuna
// persistenza) invece di lanciare un'eccezione non gestita.
let filesystemScrivibile = true;

function loadFromFile(): LegaData {
  if (!filesystemScrivibile) return statoIniziale();
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DATA_FILE)) {
      const iniziale = statoIniziale();
      fs.writeFileSync(DATA_FILE, JSON.stringify(iniziale, null, 2), "utf-8");
      return iniziale;
    }
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return { ...statoIniziale(), ...JSON.parse(raw) };
  } catch (err) {
    if (isFilesystemReadOnly(err)) {
      filesystemScrivibile = false;
      console.warn(
        "[store] Filesystem di sola lettura e Supabase non configurato: nessuna persistenza reale possibile. " +
          "Vedi il README, sezione 'Passare a Supabase in produzione'."
      );
    }
    return statoIniziale();
  }
}

function persistToFile(data: LegaData) {
  if (!filesystemScrivibile) return;
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    if (isFilesystemReadOnly(err)) filesystemScrivibile = false;
  }
}

function isFilesystemReadOnly(err: unknown): boolean {
  const code = (err as NodeJS.ErrnoException)?.code;
  return code === "EROFS" || code === "EACCES" || code === "EPERM" || code === "ENOENT";
}

// ---------------------------------------------------------------------------
// SELEZIONE BACKEND
// ---------------------------------------------------------------------------
async function load(): Promise<LegaData> {
  return isSupabaseConfigured ? loadFromSupabase() : loadFromFile();
}

async function persist(data: LegaData) {
  return isSupabaseConfigured ? persistToSupabase(data) : persistToFile(data);
}

// ---------------------------------------------------------------------------
// LETTURA
// ---------------------------------------------------------------------------
// Ogni funzione in src/lib/data/*.ts chiama getStore() in modo indipendente:
// senza memoizzazione, una singola pagina che ne invoca dieci finirebbe per
// rifare dieci letture di rete verso Supabase per lo stesso identico stato.
// React.cache() deduplica le chiamate entro la stessa richiesta/render,
// quindi il backend viene interrogato una sola volta per pagina.
export const getStore = cache(async function getStore(): Promise<LegaData> {
  return load();
});

// ---------------------------------------------------------------------------
// CLASSIFICA — ricalcolata automaticamente ad ogni scrittura di risultato
// ---------------------------------------------------------------------------
export async function ricalcolaClassifica() {
  const data = await load();
  data.classifica = data.squadre.map((s) => {
    const concluse = data.partite.filter(
      (p) => p.stato === "conclusa" && (p.squadraCasaId === s.id || p.squadraTrasfertaId === s.id)
    );
    let vinte = 0,
      pareggiate = 0,
      perse = 0,
      golFatti = 0,
      golSubiti = 0,
      puntiCasa = 0,
      puntiTrasferta = 0,
      ammonizioni = 0,
      espulsioni = 0;
    const forma: { data: string; esito: "V" | "N" | "P" }[] = [];

    concluse.forEach((p) => {
      const isCasa = p.squadraCasaId === s.id;
      const gf = isCasa ? p.golCasa : p.golTrasferta;
      const gs = isCasa ? p.golTrasferta : p.golCasa;
      golFatti += gf;
      golSubiti += gs;
      let esito: "V" | "N" | "P";
      if (gf > gs) {
        vinte++;
        esito = "V";
        if (isCasa) puntiCasa += 3;
        else puntiTrasferta += 3;
      } else if (gf === gs) {
        pareggiate++;
        esito = "N";
        if (isCasa) puntiCasa += 1;
        else puntiTrasferta += 1;
      } else {
        perse++;
        esito = "P";
      }
      forma.push({ data: p.dataOra, esito });
      const eventiSquadra = p.eventi.filter((e) => e.squadraId === s.id);
      ammonizioni += eventiSquadra.filter((e) => e.tipo === "ammonizione").length;
      espulsioni += eventiSquadra.filter((e) => e.tipo === "espulsione").length;
    });

    forma.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

    return {
      squadraId: s.id,
      posizione: 0,
      puntiCasa,
      puntiTrasferta,
      giocate: concluse.length,
      vinte,
      pareggiate,
      perse,
      golFatti,
      golSubiti,
      punti: puntiCasa + puntiTrasferta,
      ultimeCinque: forma.slice(-5).map((f) => f.esito),
      ammonizioni,
      espulsioni,
    } satisfies RigaClassifica;
  });

  data.classifica.sort((a, b) => b.punti - a.punti || b.golFatti - b.golSubiti - (a.golFatti - a.golSubiti) || b.golFatti - a.golFatti);
  data.classifica.forEach((r, i) => (r.posizione = i + 1));
  await persist(data);
}

// ---------------------------------------------------------------------------
// SQUADRE
// ---------------------------------------------------------------------------
export async function creaSquadra(squadra: Squadra) {
  const data = await load();
  data.squadre.push(squadra);
  await persist(data);
  await ricalcolaClassifica();
  return squadra;
}

export async function aggiornaSquadra(id: string, patch: Partial<Squadra>) {
  const data = await load();
  const idx = data.squadre.findIndex((s) => s.id === id);
  if (idx === -1) return undefined;
  data.squadre[idx] = { ...data.squadre[idx], ...patch };
  await persist(data);
  return data.squadre[idx];
}

export async function eliminaSquadra(id: string) {
  const data = await load();
  data.squadre = data.squadre.filter((s) => s.id !== id);
  data.giocatori = data.giocatori.filter((g) => g.squadraId !== id);
  data.partite = data.partite.filter((p) => p.squadraCasaId !== id && p.squadraTrasfertaId !== id);
  await persist(data);
  await ricalcolaClassifica();
}

// ---------------------------------------------------------------------------
// GIOCATORI
// ---------------------------------------------------------------------------
export async function creaGiocatore(giocatore: Giocatore) {
  const data = await load();
  data.giocatori.push(giocatore);
  await persist(data);
  return giocatore;
}

export async function aggiornaGiocatore(id: string, patch: Partial<Giocatore>) {
  const data = await load();
  const idx = data.giocatori.findIndex((g) => g.id === id);
  if (idx === -1) return undefined;
  data.giocatori[idx] = { ...data.giocatori[idx], ...patch };
  await persist(data);
  return data.giocatori[idx];
}

export async function eliminaGiocatore(id: string) {
  const data = await load();
  data.giocatori = data.giocatori.filter((g) => g.id !== id);
  await persist(data);
}

// ---------------------------------------------------------------------------
// PARTITE
// ---------------------------------------------------------------------------
export async function creaPartita(partita: Partita) {
  const data = await load();
  data.partite.push(partita);
  await persist(data);
  return partita;
}

export async function eliminaPartita(id: string) {
  const data = await load();
  data.partite = data.partite.filter((p) => p.id !== id);
  await persist(data);
  await ricalcolaClassifica();
}

export async function aggiornaStatoPartita(id: string, stato: StatoPartita) {
  const data = await load();
  const partita = data.partite.find((p) => p.id === id);
  if (!partita) return undefined;
  partita.stato = stato;
  await persist(data);
  if (stato === "conclusa") await ricalcolaClassifica();
  return partita;
}

export async function aggiornaRisultatoPartita(id: string, golCasa: number, golTrasferta: number) {
  const data = await load();
  const partita = data.partite.find((p) => p.id === id);
  if (!partita) return undefined;
  partita.golCasa = golCasa;
  partita.golTrasferta = golTrasferta;
  await persist(data);
  if (partita.stato === "conclusa") await ricalcolaClassifica();
  return partita;
}

export async function impostaMvpPartita(id: string, giocatoreId: string) {
  const data = await load();
  const partita = data.partite.find((p) => p.id === id);
  if (!partita) return undefined;
  partita.mvpGiocatoreId = giocatoreId;
  await persist(data);
  return partita;
}

/**
 * Salva i voti dell'organizzatore per una partita. I voti arrivano dal
 * tabellino e sono la sorgente delle classifiche "Miglior giocatore" e
 * "Miglior portiere": un voto a 0 (o fuori scala) equivale a "non assegnato"
 * e viene rimosso, così una casella svuotata nel pannello sparisce davvero
 * invece di restare a pesare sulle medie.
 */
export async function impostaVotiPartita(id: string, voti: VotoPartita[]) {
  const data = await load();
  const partita = data.partite.find((p) => p.id === id);
  if (!partita) return undefined;

  const validi = voti
    .filter((v) => v.giocatoreId && Number.isFinite(v.voto) && v.voto >= VOTO_MINIMO && v.voto <= VOTO_MASSIMO)
    .map((v) => ({ giocatoreId: v.giocatoreId, voto: v.voto, ...(v.nota ? { nota: v.nota } : {}) }));

  // Un solo voto per giocatore: l'ultimo inviato vince.
  const perGiocatore = new Map(validi.map((v) => [v.giocatoreId, v]));
  partita.voti = [...perGiocatore.values()];

  await persist(data);
  return partita;
}

export async function aggiungiEventoPartita(id: string, evento: EventoPartita) {
  const data = await load();
  const partita = data.partite.find((p) => p.id === id);
  if (!partita) return undefined;
  partita.eventi.push(evento);
  if (evento.tipo === "goal" || evento.tipo === "rigore_segnato") {
    if (evento.squadraId === partita.squadraCasaId) partita.golCasa += 1;
    else if (evento.squadraId === partita.squadraTrasfertaId) partita.golTrasferta += 1;
  }
  await persist(data);
  if (partita.stato === "conclusa") await ricalcolaClassifica();
  return partita;
}

/**
 * Rimuove un evento aggiunto per errore alla cronaca. Specchia esattamente
 * aggiungiEventoPartita al contrario: se l'evento era un gol, il risultato
 * torna indietro di una rete (mai sotto zero, nel caso il punteggio fosse
 * già stato corretto a mano nel frattempo); se la partita è conclusa la
 * classifica viene ricalcolata di conseguenza.
 */
export async function eliminaEventoPartita(id: string, eventoId: string) {
  const data = await load();
  const partita = data.partite.find((p) => p.id === id);
  if (!partita) return undefined;
  const evento = partita.eventi.find((e) => e.id === eventoId);
  if (!evento) return partita;

  partita.eventi = partita.eventi.filter((e) => e.id !== eventoId);
  if (evento.tipo === "goal" || evento.tipo === "rigore_segnato") {
    if (evento.squadraId === partita.squadraCasaId) partita.golCasa = Math.max(0, partita.golCasa - 1);
    else if (evento.squadraId === partita.squadraTrasfertaId) partita.golTrasferta = Math.max(0, partita.golTrasferta - 1);
  }
  await persist(data);
  if (partita.stato === "conclusa") await ricalcolaClassifica();
  return partita;
}

// ---------------------------------------------------------------------------
// NEWS
// ---------------------------------------------------------------------------
export async function creaArticolo(articolo: Articolo) {
  const data = await load();
  data.articoli.unshift(articolo);
  await persist(data);
  return articolo;
}

export async function aggiornaArticolo(id: string, patch: Partial<Articolo>) {
  const data = await load();
  const idx = data.articoli.findIndex((a) => a.id === id);
  if (idx === -1) return undefined;
  data.articoli[idx] = { ...data.articoli[idx], ...patch };
  await persist(data);
  return data.articoli[idx];
}

export async function eliminaArticolo(id: string) {
  const data = await load();
  data.articoli = data.articoli.filter((a) => a.id !== id);
  await persist(data);
}

// ---------------------------------------------------------------------------
// SQUALIFICHE (Giudice Sportivo)
// ---------------------------------------------------------------------------
export async function creaSqualifica(squalifica: Squalifica) {
  const data = await load();
  data.squalifiche.unshift(squalifica);
  await persist(data);
  return squalifica;
}

export async function aggiornaSqualifica(id: string, patch: Partial<Squalifica>) {
  const data = await load();
  const idx = data.squalifiche.findIndex((s) => s.id === id);
  if (idx === -1) return undefined;
  data.squalifiche[idx] = { ...data.squalifiche[idx], ...patch };
  await persist(data);
  return data.squalifiche[idx];
}

export async function eliminaSqualifica(id: string) {
  const data = await load();
  data.squalifiche = data.squalifiche.filter((s) => s.id !== id);
  await persist(data);
}

// ---------------------------------------------------------------------------
// SPONSOR
// ---------------------------------------------------------------------------
export async function creaSponsor(sponsor: Sponsor) {
  const data = await load();
  data.sponsor.unshift(sponsor);
  await persist(data);
  return sponsor;
}

export async function eliminaSponsor(id: string) {
  const data = await load();
  data.sponsor = data.sponsor.filter((s) => s.id !== id);
  await persist(data);
}

// ---------------------------------------------------------------------------
// MEDIA
// ---------------------------------------------------------------------------
export async function creaAlbum(album: AlbumMedia) {
  const data = await load();
  data.albumMedia.unshift(album);
  await persist(data);
  return album;
}

export async function eliminaAlbum(id: string) {
  const data = await load();
  data.albumMedia = data.albumMedia.filter((a) => a.id !== id);
  await persist(data);
}

// ---------------------------------------------------------------------------
// NOTIFICHE
// ---------------------------------------------------------------------------
export async function inviaNotifica(notifica: Notifica) {
  const data = await load();
  data.notifiche.unshift(notifica);
  await persist(data);
  return notifica;
}

export async function eliminaNotifica(id: string) {
  const data = await load();
  data.notifiche = data.notifiche.filter((n) => n.id !== id);
  await persist(data);
}

// ---------------------------------------------------------------------------
// IMPOSTAZIONI
// ---------------------------------------------------------------------------
export async function aggiornaImpostazioni(patch: Partial<ImpostazioniLega>) {
  const data = await load();
  data.impostazioni = { ...data.impostazioni, ...patch, automazioni: { ...data.impostazioni.automazioni, ...patch.automazioni } };
  if (patch.stagioneEtichetta || patch.stagioneDataInizio || patch.stagioneDataFine) {
    const stagione = data.stagioni.find((s) => s.id === data.stagioneAttualeId);
    if (stagione) {
      if (patch.stagioneEtichetta) stagione.etichetta = patch.stagioneEtichetta;
      if (patch.stagioneDataInizio) stagione.dataInizio = patch.stagioneDataInizio;
      if (patch.stagioneDataFine) stagione.dataFine = patch.stagioneDataFine;
    }
  }
  await persist(data);
  return data.impostazioni;
}
