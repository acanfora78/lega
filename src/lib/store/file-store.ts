import fs from "node:fs";
import path from "node:path";
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
  Stagione,
  StatoPartita,
} from "@/lib/types";

// ============================================================================
// STORE REALE SU FILE (server-side)
// ----------------------------------------------------------------------------
// Nessuna "modalità demo": ogni azione dell'area organizzatore passa da qui e
// scrive su disco (.data/league.json), quindi sopravvive a refresh, riavvii e
// sessioni diverse. Adatto a qualsiasi hosting con filesystem persistente
// (VPS, Docker, Railway, Render, Fly.io, `next start` su server proprio).
//
// Su piattaforme serverless "pure" (Vercel/Netlify Functions) il filesystem è
// effimero tra un'invocazione e l'altra: per quei target sostituire le
// funzioni di questo file con query verso Supabase (schema già pronto in
// supabase/schema.sql, client in src/lib/supabase/*) — la forma dei dati
// resta identica, nessun altro file va toccato.
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
  impostazioni: ImpostazioniLega;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "league.json");

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

// Nessuna cache in memoria: il modulo dello store viene istanziato separatamente
// per ogni route/pagina compilata (Route Handler vs Server Component), quindi una
// cache a livello di modulo non sarebbe condivisa tra le due copie e le scritture
// di un endpoint admin non comparirebbero nelle pagine finché non si rilegge da
// disco. Si legge quindi sempre il file per garantire uno stato coerente.
//
// Su filesystem in sola lettura (es. funzioni serverless di Vercel/Netlify, dove
// solo /tmp è scrivibile) mkdir/writeFile falliscono: qui non deve mai far
// crashare il render della pagina, quindi si degrada a stato iniziale in
// memoria (nessuna persistenza) invece di lanciare un'eccezione non gestita.
let filesystemScrivibile = true;

function load(): LegaData {
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
        "[file-store] Filesystem di sola lettura (tipico di hosting serverless come Vercel/Netlify): " +
          "la persistenza reale richiede Supabase o un hosting con disco persistente. " +
          "Vedi il README, sezione 'Passare a Supabase in produzione'."
      );
    }
    return statoIniziale();
  }
}

function persist(data: LegaData) {
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
// LETTURA
// ---------------------------------------------------------------------------
export function getStore(): LegaData {
  return load();
}

// ---------------------------------------------------------------------------
// CLASSIFICA — ricalcolata automaticamente ad ogni scrittura di risultato
// ---------------------------------------------------------------------------
export function ricalcolaClassifica() {
  const data = load();
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
  persist(data);
}

// ---------------------------------------------------------------------------
// SQUADRE
// ---------------------------------------------------------------------------
export function creaSquadra(squadra: Squadra) {
  const data = load();
  data.squadre.push(squadra);
  persist(data);
  ricalcolaClassifica();
  return squadra;
}

export function aggiornaSquadra(id: string, patch: Partial<Squadra>) {
  const data = load();
  const idx = data.squadre.findIndex((s) => s.id === id);
  if (idx === -1) return undefined;
  data.squadre[idx] = { ...data.squadre[idx], ...patch };
  persist(data);
  return data.squadre[idx];
}

export function eliminaSquadra(id: string) {
  const data = load();
  data.squadre = data.squadre.filter((s) => s.id !== id);
  data.giocatori = data.giocatori.filter((g) => g.squadraId !== id);
  data.partite = data.partite.filter((p) => p.squadraCasaId !== id && p.squadraTrasfertaId !== id);
  persist(data);
  ricalcolaClassifica();
}

// ---------------------------------------------------------------------------
// GIOCATORI
// ---------------------------------------------------------------------------
export function creaGiocatore(giocatore: Giocatore) {
  const data = load();
  data.giocatori.push(giocatore);
  persist(data);
  return giocatore;
}

export function aggiornaGiocatore(id: string, patch: Partial<Giocatore>) {
  const data = load();
  const idx = data.giocatori.findIndex((g) => g.id === id);
  if (idx === -1) return undefined;
  data.giocatori[idx] = { ...data.giocatori[idx], ...patch };
  persist(data);
  return data.giocatori[idx];
}

export function eliminaGiocatore(id: string) {
  const data = load();
  data.giocatori = data.giocatori.filter((g) => g.id !== id);
  persist(data);
}

// ---------------------------------------------------------------------------
// PARTITE
// ---------------------------------------------------------------------------
export function creaPartita(partita: Partita) {
  const data = load();
  data.partite.push(partita);
  persist(data);
  return partita;
}

export function eliminaPartita(id: string) {
  const data = load();
  data.partite = data.partite.filter((p) => p.id !== id);
  persist(data);
  ricalcolaClassifica();
}

export function aggiornaStatoPartita(id: string, stato: StatoPartita) {
  const data = load();
  const partita = data.partite.find((p) => p.id === id);
  if (!partita) return undefined;
  partita.stato = stato;
  persist(data);
  if (stato === "conclusa") ricalcolaClassifica();
  return partita;
}

export function aggiornaRisultatoPartita(id: string, golCasa: number, golTrasferta: number) {
  const data = load();
  const partita = data.partite.find((p) => p.id === id);
  if (!partita) return undefined;
  partita.golCasa = golCasa;
  partita.golTrasferta = golTrasferta;
  persist(data);
  if (partita.stato === "conclusa") ricalcolaClassifica();
  return partita;
}

export function impostaMvpPartita(id: string, giocatoreId: string) {
  const data = load();
  const partita = data.partite.find((p) => p.id === id);
  if (!partita) return undefined;
  partita.mvpGiocatoreId = giocatoreId;
  persist(data);
  return partita;
}

export function aggiungiEventoPartita(id: string, evento: EventoPartita) {
  const data = load();
  const partita = data.partite.find((p) => p.id === id);
  if (!partita) return undefined;
  partita.eventi.push(evento);
  if (evento.tipo === "goal" || evento.tipo === "rigore_segnato") {
    if (evento.squadraId === partita.squadraCasaId) partita.golCasa += 1;
    else if (evento.squadraId === partita.squadraTrasfertaId) partita.golTrasferta += 1;
  }
  persist(data);
  if (partita.stato === "conclusa") ricalcolaClassifica();
  return partita;
}

// ---------------------------------------------------------------------------
// NEWS
// ---------------------------------------------------------------------------
export function creaArticolo(articolo: Articolo) {
  const data = load();
  data.articoli.unshift(articolo);
  persist(data);
  return articolo;
}

export function aggiornaArticolo(id: string, patch: Partial<Articolo>) {
  const data = load();
  const idx = data.articoli.findIndex((a) => a.id === id);
  if (idx === -1) return undefined;
  data.articoli[idx] = { ...data.articoli[idx], ...patch };
  persist(data);
  return data.articoli[idx];
}

export function eliminaArticolo(id: string) {
  const data = load();
  data.articoli = data.articoli.filter((a) => a.id !== id);
  persist(data);
}

// ---------------------------------------------------------------------------
// SPONSOR
// ---------------------------------------------------------------------------
export function creaSponsor(sponsor: Sponsor) {
  const data = load();
  data.sponsor.unshift(sponsor);
  persist(data);
  return sponsor;
}

export function eliminaSponsor(id: string) {
  const data = load();
  data.sponsor = data.sponsor.filter((s) => s.id !== id);
  persist(data);
}

// ---------------------------------------------------------------------------
// MEDIA
// ---------------------------------------------------------------------------
export function creaAlbum(album: AlbumMedia) {
  const data = load();
  data.albumMedia.unshift(album);
  persist(data);
  return album;
}

export function eliminaAlbum(id: string) {
  const data = load();
  data.albumMedia = data.albumMedia.filter((a) => a.id !== id);
  persist(data);
}

// ---------------------------------------------------------------------------
// NOTIFICHE
// ---------------------------------------------------------------------------
export function inviaNotifica(notifica: Notifica) {
  const data = load();
  data.notifiche.unshift(notifica);
  persist(data);
  return notifica;
}

// ---------------------------------------------------------------------------
// IMPOSTAZIONI
// ---------------------------------------------------------------------------
export function aggiornaImpostazioni(patch: Partial<ImpostazioniLega>) {
  const data = load();
  data.impostazioni = { ...data.impostazioni, ...patch, automazioni: { ...data.impostazioni.automazioni, ...patch.automazioni } };
  if (patch.stagioneEtichetta || patch.stagioneDataInizio || patch.stagioneDataFine) {
    const stagione = data.stagioni.find((s) => s.id === data.stagioneAttualeId);
    if (stagione) {
      if (patch.stagioneEtichetta) stagione.etichetta = patch.stagioneEtichetta;
      if (patch.stagioneDataInizio) stagione.dataInizio = patch.stagioneDataInizio;
      if (patch.stagioneDataFine) stagione.dataFine = patch.stagioneDataFine;
    }
  }
  persist(data);
  return data.impostazioni;
}
