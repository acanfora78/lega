import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { cache } from "react";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { createReadOnlyClient } from "@/lib/supabase/read-only";
import { applicaTabellino, type RigaTabellino } from "@/lib/tabellino";
import type {
  AlbumMedia,
  Articolo,
  Competizione,
  EventoPartita,
  FaseCompetizione,
  FormazioneVoce,
  Giocatore,
  Notifica,
  Partita,
  PremioSettimanale,
  RigaClassifica,
  Ruolo,
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
  /** Classifica del campionato principale (comportamento storico, invariato). */
  classifica: RigaClassifica[];
  /**
   * Competizioni aggiuntive create dall'organizzatore (Coppa Italia, tornei a
   * eliminazione diretta, gironi...), parallele al campionato principale.
   */
  competizioni: Competizione[];
  /**
   * Classifiche delle competizioni aggiuntive, con chiave `competizioneId` o
   * `competizioneId:faseId` per le fasi a girone di una competizione multi-fase.
   * Separata da `classifica` apposta: non deve interferire in alcun modo con
   * il campionato principale, che resta l'unica fonte per home/classifica/statistiche.
   */
  classificheCompetizioni: Record<string, RigaClassifica[]>;
  articoli: Articolo[];
  albumMedia: AlbumMedia[];
  sponsor: Sponsor[];
  premiSettimanali: PremioSettimanale[];
  notifiche: Notifica[];
  squalifiche: Squalifica[];
  impostazioni: ImpostazioniLega;
  /** Id delle migrazioni una-tantum sui dati già applicate (vedi `applicaMigrazioni`), per non ripeterle ad ogni lettura. */
  migrazioni: string[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "league.json");

const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Nessun valore indovinato (etichetta, date d'inizio/fine): l'organizzatore
// vuole configurare la stagione lui stesso da Impostazioni, non trovarsi
// un'etichetta "2026/2027" già scritta che potrebbe non corrispondere alla
// stagione reale. L'oggetto stagione resta comunque necessario a livello
// strutturale (partite e competizioni ci si agganciano con stagioneId), ma
// nasce vuoto invece che precompilato.
function stagioneCorrenteDefault(): Stagione {
  return {
    id: "stagione-corrente",
    etichetta: "",
    dataInizio: "",
    dataFine: "",
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
    competizioni: [],
    classificheCompetizioni: {},
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
    migrazioni: [],
  };
}

// ---------------------------------------------------------------------------
// CONCORRENZA — due scritture ravvicinate non devono più cancellarsi a vicenda
// ---------------------------------------------------------------------------
// Ogni funzione di scrittura fa load() → muta la propria copia → persist():
// senza alcun controllo, se due richieste si sovrappongono (due schede
// aperte, un import mentre un'altra scrittura è in corso, due organizzatori)
// la seconda persist() sovrascriveva per intero il blob JSONB con la PROPRIA
// copia, basata su uno stato ormai vecchio — cancellando in silenzio quello
// che la prima aveva appena scritto. Una partita salvata spariva senza che
// nessun errore lo segnalasse: esattamente il sintomo di "partita non
// trovata" al salvataggio, dopo che la pagina l'aveva appena mostrata.
//
// `versioneDi` lega ogni oggetto LegaData restituito da load() alla versione
// che aveva in quel momento (updated_at su Supabase, mtime sul file), senza
// dover cambiare la firma delle ~40 funzioni che già fanno
// `const data = await load(); ...; await persist(data);` — la stessa identica
// referenza attraversa entrambe le chiamate, quindi persist() può risalire
// alla versione di partenza senza che nessun chiamante debba passarla a mano.
const versioneDi = new WeakMap<LegaData, string>();
/** Sentinella: la riga non esisteva ancora quando è stata letta (primo avvio). */
const RIGA_ASSENTE = "riga-assente";

export class ConflittoScritturaError extends Error {
  constructor() {
    super("Qualcun altro ha modificato questi dati nel frattempo. Ricarica la pagina e riprova.");
    this.name = "ConflittoScritturaError";
  }
}

// ---------------------------------------------------------------------------
// BACKEND SUPABASE — unica riga JSONB nella tabella lega_store
// ---------------------------------------------------------------------------
async function loadFromSupabase(): Promise<LegaData> {
  try {
    const supabase = createReadOnlyClient();
    const { data, error } = await supabase.from("lega_store").select("data, updated_at").eq("id", 1).maybeSingle();
    if (error) throw error;
    if (!data) {
      const iniziale = statoIniziale();
      versioneDi.set(iniziale, RIGA_ASSENTE);
      return iniziale;
    }
    const unita = { ...statoIniziale(), ...(data.data as Partial<LegaData>) };
    versioneDi.set(unita, data.updated_at as string);
    return unita;
  } catch (err) {
    // Lettura fallita (rete, RLS): stato iniziale in memoria SENZA versione
    // registrata. Chi lo usa solo per leggere (pagine pubbliche) degrada
    // correttamente a "nessun dato". Chi lo passasse a persist() per
    // scriverci sopra viene bloccato più sotto — altrimenti una lettura
    // fallita per un blip di rete scriverebbe una lega vuota sopra a quella
    // vera, un danno ben peggiore del conflitto che questo meccanismo vuole
    // prevenire.
    console.warn("[store] Lettura da Supabase fallita, uso stato iniziale in memoria.", err);
    return statoIniziale();
  }
}

async function persistToSupabase(data: LegaData) {
  const versioneAttesa = versioneDi.get(data);
  if (versioneAttesa === undefined) {
    // Mai state lette con successo: scrivere ora significherebbe sovrascrivere
    // dati reali con una copia partita da uno stato sconosciuto.
    throw new Error(
      "Impossibile salvare: la lettura dei dati precedente non è riuscita, quindi non è sicuro scriverci sopra. Riprova."
    );
  }

  const supabase = await createServerSupabaseClient();
  const nuovaVersione = new Date().toISOString();

  if (versioneAttesa === RIGA_ASSENTE) {
    // Primo avvio in assoluto: nessuna riga da condizionare, si inserisce.
    // Se due richieste bootstrappano insieme, il vincolo di chiave primaria
    // su id=1 fa fallire la seconda invece di lasciarle sovrascrivere a
    // vicenda: la si traduce nello stesso errore di conflitto.
    const { error } = await supabase.from("lega_store").insert({ id: 1, data, updated_at: nuovaVersione });
    if (error) {
      if (error.code === "23505") throw new ConflittoScritturaError();
      console.error("[store] Scrittura su Supabase fallita.", error);
      throw error;
    }
    versioneDi.set(data, nuovaVersione);
    return;
  }

  const { data: righe, error } = await supabase
    .from("lega_store")
    .update({ data, updated_at: nuovaVersione })
    .eq("id", 1)
    .eq("updated_at", versioneAttesa)
    .select("id");
  if (error) {
    console.error("[store] Scrittura su Supabase fallita.", error);
    throw error;
  }
  if (!righe || righe.length === 0) {
    // La condizione updated_at = versioneAttesa non ha trovato righe: nel
    // frattempo qualcun altro ha già scritto. Non si sovrascrive alla cieca.
    throw new ConflittoScritturaError();
  }
  versioneDi.set(data, nuovaVersione);
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
      versioneDi.set(iniziale, String(fs.statSync(DATA_FILE).mtimeMs));
      return iniziale;
    }
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    // La versione (mtime) va letta PRIMA del contenuto: se qualcuno scrive nel
    // mezzo, si scarta comunque una lettura potenzialmente inconsistente al
    // prossimo giro invece di fidarsi di un mtime che nel frattempo è già
    // cambiato di nuovo.
    const versione = String(fs.statSync(DATA_FILE).mtimeMs);
    const unita = { ...statoIniziale(), ...JSON.parse(raw) };
    versioneDi.set(unita, versione);
    return unita;
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
  const versioneAttesa = versioneDi.get(data);
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    // Stesso principio del backend Supabase: se il file è cambiato rispetto a
    // quando è stato letto, qualcun altro ha già scritto nel frattempo — non
    // si sovrascrive alla cieca con una copia partita da uno stato vecchio.
    if (versioneAttesa !== undefined && versioneAttesa !== RIGA_ASSENTE && fs.existsSync(DATA_FILE)) {
      const versioneAttuale = String(fs.statSync(DATA_FILE).mtimeMs);
      if (versioneAttuale !== versioneAttesa) throw new ConflittoScritturaError();
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    versioneDi.set(data, String(fs.statSync(DATA_FILE).mtimeMs));
  } catch (err) {
    if (err instanceof ConflittoScritturaError) throw err;
    if (isFilesystemReadOnly(err)) filesystemScrivibile = false;
  }
}

function isFilesystemReadOnly(err: unknown): boolean {
  const code = (err as NodeJS.ErrnoException)?.code;
  return code === "EROFS" || code === "EACCES" || code === "EPERM" || code === "ENOENT";
}

// ---------------------------------------------------------------------------
// MIGRAZIONI UNA-TANTUM SUI DATI GIÀ SALVATI
// ---------------------------------------------------------------------------
// Fino a questa correzione, l'orario delle partite (form manuale e import
// CSV) veniva interpretato nel fuso del processo Node invece che in quello
// di Roma: su Vercel (UTC) ogni partita inserita in piena ora legale (CEST,
// UTC+2) finiva salvata 2 ore avanti. Le partite già inserite prima del fix
// vanno corrette una volta sola; quelle nuove nascono già corrette perché
// scritte con `parseDataOraRoma`.
// ---------------------------------------------------------------------------
// NESSUNO SPOSTAMENTO D'ORARIO IN LETTURA
// ---------------------------------------------------------------------------
// Qui prima vivevano due migrazioni che spostavano gli orari delle partite di
// una quantità fissa (-2h a tutte, poi +1h alle giornate 8-27) per rimediare a
// come venivano interpretati all'import. Sono state rimosse, per due motivi:
//
//   1. Erano una stima. Lo scarto reale dipende dalla data della singola gara
//      (ora legale o solare), non dal numero di giornata: qualunque intervallo
//      di giornate sbaglia le partite a cavallo del cambio d'ora.
//   2. Erano applicate ad ogni lettura finché non riuscivano a salvarsi, e su
//      una richiesta pubblica la RLS rifiuta la scrittura: le pagine per il
//      pubblico continuavano quindi a mostrare orari spostati, comprese le
//      partite appena importate, che erano già corrette.
//
// L'orario ora ha una sola fonte: il CSV. Viene letto come ora italiana
// (src/lib/timezone.ts) e mostrato sempre nel fuso di Roma, quindi quello che
// si legge nel file è quello che si vede nel calendario. Per correggere gli
// orari di un calendario già caricato si ricarica lo stesso CSV: l'import
// riallinea le gare esistenti invece di duplicarle (vedi importaCalendario*).
// ---------------------------------------------------------------------------

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

/**
 * Calcola la classifica di un insieme di squadre sulle sole partite concluse
 * passate in `partite`. Condivisa tra il campionato principale (tutte le
 * partite senza competizioneId, per compatibilità con i dati esistenti) e le
 * classifiche scoped delle competizioni aggiuntive: la logica di calcolo è
 * identica, cambia solo quale sottoinsieme di partite considerare.
 */
function calcolaClassifica(squadre: Squadra[], partite: Partita[]): RigaClassifica[] {
  const classifica = squadre.map((s) => {
    const concluse = partite.filter(
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

  classifica.sort((a, b) => b.punti - a.punti || b.golFatti - b.golSubiti - (a.golFatti - a.golSubiti) || b.golFatti - a.golFatti);
  classifica.forEach((r, i) => (r.posizione = i + 1));
  return classifica;
}

export async function ricalcolaClassifica() {
  const data = await load();
  // Solo le partite del campionato principale: le partite di una competizione
  // aggiuntiva (competizioneId valorizzato) hanno la propria classifica
  // separata e non devono in alcun modo influenzare questa.
  const partitePrincipali = data.partite.filter((p) => !p.competizioneId);
  data.classifica = calcolaClassifica(data.squadre, partitePrincipali);
  await persist(data);
}

/**
 * Ricalcola la classifica di una competizione aggiuntiva (o di una sua fase a
 * girone). Non tocca mai `data.classifica`, che resta il campionato
 * principale: vive in `classificheCompetizioni`, con chiave `competizioneId`
 * o `competizioneId:faseId` per le fasi di una competizione multi-fase.
 */
export async function ricalcolaClassificaCompetizione(competizioneId: string, faseId?: string) {
  const data = await load();
  const competizione = data.competizioni.find((c) => c.id === competizioneId);
  if (!competizione) return;

  const fase = faseId ? competizione.fasi.find((f) => f.id === faseId) : undefined;
  const squadreIds = fase ? fase.squadreIds : competizione.squadreIscritteIds;
  const squadre = data.squadre.filter((s) => squadreIds.includes(s.id));
  const partite = data.partite.filter(
    (p) => p.competizioneId === competizioneId && (faseId ? p.faseId === faseId : !p.faseId)
  );

  const chiave = faseId ? `${competizioneId}:${faseId}` : competizioneId;
  data.classificheCompetizioni[chiave] = calcolaClassifica(squadre, partite);
  await persist(data);
}

/** Ricalcola la classifica giusta per la partita indicata: quella del campionato principale, o quella scoped della sua competizione/fase. */
async function ricalcolaClassificaPerPartita(partita: Partita) {
  if (partita.competizioneId) await ricalcolaClassificaCompetizione(partita.competizioneId, partita.faseId);
  else await ricalcolaClassifica();
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
  // Toglie la squadra anche dalle competizioni aggiuntive a cui era iscritta,
  // altrimenti resterebbe in classifica pur non avendo più partite né rosa.
  const competizioniColpite = data.competizioni.filter((c) => c.squadreIscritteIds.includes(id));
  data.competizioni.forEach((c) => {
    c.squadreIscritteIds = c.squadreIscritteIds.filter((sid) => sid !== id);
    c.fasi.forEach((f) => (f.squadreIds = f.squadreIds.filter((sid) => sid !== id)));
  });
  await persist(data);
  await ricalcolaClassifica();
  for (const c of competizioniColpite) {
    await ricalcolaClassificaCompetizione(c.id);
    for (const f of c.fasi) await ricalcolaClassificaCompetizione(c.id, f.id);
  }
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
  const partita = data.partite.find((p) => p.id === id);
  data.partite = data.partite.filter((p) => p.id !== id);
  await persist(data);
  if (partita) await ricalcolaClassificaPerPartita(partita);
  return partita;
}

/**
 * Svuota per intero il calendario del campionato principale: ogni partita
 * senza competizioneId sparisce, con cronaca, tabellini e voti che porta
 * dietro. Le partite delle competizioni aggiuntive non sono toccate — hanno
 * il loro calendario e la loro classifica separati. Pensata per ripartire da
 * zero con un nuovo CSV invece di eliminare gara per gara.
 */
export async function svuotaCalendarioPartite() {
  const data = await load();
  data.partite = data.partite.filter((p) => Boolean(p.competizioneId));
  data.classifica = calcolaClassifica(data.squadre, []);
  await persist(data);
}

export async function aggiornaStatoPartita(id: string, stato: StatoPartita) {
  const data = await load();
  const partita = data.partite.find((p) => p.id === id);
  if (!partita) return undefined;
  partita.stato = stato;
  await persist(data);
  if (stato === "conclusa") await ricalcolaClassificaPerPartita(partita);
  return partita;
}

export async function aggiornaRisultatoPartita(id: string, golCasa: number, golTrasferta: number) {
  const data = await load();
  const partita = data.partite.find((p) => p.id === id);
  if (!partita) return undefined;
  partita.golCasa = golCasa;
  partita.golTrasferta = golTrasferta;
  await persist(data);
  if (partita.stato === "conclusa") await ricalcolaClassificaPerPartita(partita);
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

/**
 * Riga di distinta in arrivo dal pannello: del giocatore basta l'id, numero e
 * ruolo si completano dalla scheda del tesserato se non vengono indicati.
 */
export type VoceDistinta = { giocatoreId: string; titolare?: boolean; numero?: number; ruolo?: Ruolo };

/**
 * Distinta di gara di una delle due squadre: solo chi è presente e chi parte
 * titolare, niente altro — gol, cartellini e voti restano un affare del
 * tabellino (vedi impostaTabellinoPartita più sotto), completamente
 * indipendente da questa scrittura. Sono le presenze in classifica
 * individuale e restringono al solo gruppo convocato gli elenchi del
 * tabellino, che altrimenti proporrebbero l'intera rosa.
 *
 * Si accettano solo tesserati della squadra indicata, una volta sola
 * ciascuno: una distinta con un giocatore dell'altra squadra falserebbe
 * presenze e cartellini senza che nessuno se ne accorga.
 */
export async function impostaDistintaPartita(id: string, squadraId: string, voci: VoceDistinta[]) {
  const data = await load();
  const partita = data.partite.find((p) => p.id === id);
  if (!partita) return undefined;
  if (squadraId !== partita.squadraCasaId && squadraId !== partita.squadraTrasfertaId) {
    throw new Error("La squadra indicata non gioca questa partita.");
  }

  const rosa = new Map(data.giocatori.filter((g) => g.squadraId === squadraId).map((g) => [g.id, g]));
  const perGiocatore = new Map<string, FormazioneVoce>();
  voci.forEach((v) => {
    const giocatore = rosa.get(v.giocatoreId);
    if (!giocatore) return;
    perGiocatore.set(giocatore.id, {
      giocatoreId: giocatore.id,
      titolare: Boolean(v.titolare),
      numero: typeof v.numero === "number" && Number.isFinite(v.numero) && v.numero > 0 ? v.numero : giocatore.numeroMaglia,
      ruolo: v.ruolo ?? giocatore.ruolo,
    });
  });

  const distinta = [...perGiocatore.values()];
  if (squadraId === partita.squadraCasaId) partita.formazioneCasa = distinta;
  else partita.formazioneTrasferta = distinta;

  await persist(data);
  return partita;
}

/**
 * Salva il tabellino di una squadra: presenze, gol, assist, cartellini e voti
 * in un colpo solo. La riconciliazione vera sta in src/lib/tabellino.ts, che
 * riscrive gli eventi della sola squadra indicata lasciando intatti quelli
 * dell'avversaria e quelli che il tabellino non governa.
 *
 * Il risultato si muove della differenza, non del totale: come per
 * l'inserimento del singolo episodio, un gol aggiunto vale una rete in più. Un
 * punteggio messo a mano per reti senza marcatore indicato resta quindi
 * valido.
 */
export async function impostaTabellinoPartita(id: string, squadraId: string, righe: RigaTabellino[]) {
  const data = await load();
  const partita = data.partite.find((p) => p.id === id);
  if (!partita) return undefined;
  if (squadraId !== partita.squadraCasaId && squadraId !== partita.squadraTrasfertaId) {
    throw new Error("La squadra indicata non gioca questa partita.");
  }

  const roster = data.giocatori.filter((g) => g.squadraId === squadraId);
  // Un voto fuori scala equivale a "non assegnato": non deve pesare sulle medie.
  const pulite = righe.map((r) => ({
    ...r,
    voto:
      typeof r.voto === "number" && Number.isFinite(r.voto) && r.voto >= VOTO_MINIMO && r.voto <= VOTO_MASSIMO
        ? r.voto
        : null,
  }));

  const esito = applicaTabellino(partita, squadraId, roster, pulite, () => `evento-${randomUUID()}`);

  partita.eventi = esito.eventi;
  partita.voti = esito.voti;
  if (squadraId === partita.squadraCasaId) partita.formazioneCasa = esito.distinta;
  else partita.formazioneTrasferta = esito.distinta;
  partita.golCasa = Math.max(0, partita.golCasa + esito.deltaGolCasa);
  partita.golTrasferta = Math.max(0, partita.golTrasferta + esito.deltaGolTrasferta);

  await persist(data);
  if (partita.stato === "conclusa") await ricalcolaClassificaPerPartita(partita);
  return partita;
}

export async function aggiungiEventoPartita(id: string, evento: EventoPartita) {
  const data = await load();
  const partita = data.partite.find((p) => p.id === id);
  if (!partita) return undefined;
  partita.eventi.push(evento);
  // L'autorete è registrata sulla squadra di chi la segna, ma la rete va
  // all'avversaria: senza questa distinzione il risultato si sposterebbe
  // dalla parte sbagliata.
  if (evento.tipo === "goal" || evento.tipo === "rigore_segnato") {
    if (evento.squadraId === partita.squadraCasaId) partita.golCasa += 1;
    else if (evento.squadraId === partita.squadraTrasfertaId) partita.golTrasferta += 1;
  } else if (evento.tipo === "autogoal") {
    if (evento.squadraId === partita.squadraCasaId) partita.golTrasferta += 1;
    else if (evento.squadraId === partita.squadraTrasfertaId) partita.golCasa += 1;
  }
  await persist(data);
  if (partita.stato === "conclusa") await ricalcolaClassificaPerPartita(partita);
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
  } else if (evento.tipo === "autogoal") {
    if (evento.squadraId === partita.squadraCasaId) partita.golTrasferta = Math.max(0, partita.golTrasferta - 1);
    else if (evento.squadraId === partita.squadraTrasfertaId) partita.golCasa = Math.max(0, partita.golCasa - 1);
  }
  await persist(data);
  if (partita.stato === "conclusa") await ricalcolaClassificaPerPartita(partita);
  return partita;
}

/**
 * Azzera le statistiche e il risultato di una partita, mantenendo la gara
 * stessa (squadre, giornata, data): cronaca, distinta, voti, MVP e punteggio
 * tornano allo stato "non ancora giocata", pronta per essere ricompilata da
 * zero. A differenza di eliminaPartita, che toglie la gara dal calendario,
 * qui la gara resta — cambia solo cosa vi è stato registrato sopra.
 *
 * Nessuna squalifica orfana da ripulire: le posizioni disciplinari
 * (calcolaPosizioniDisciplinari) si ricalcolano da sole dagli eventi ad ogni
 * lettura, e le squalifiche registrate a mano in data.squalifiche non
 * referenziano una partita specifica (solo un numero di giornata), quindi
 * azzerare una gara non le tocca.
 */
export async function azzeraStatistichePartita(id: string) {
  const data = await load();
  const partita = data.partite.find((p) => p.id === id);
  if (!partita) return undefined;

  partita.eventi = [];
  partita.golCasa = 0;
  partita.golTrasferta = 0;
  partita.voti = [];
  partita.formazioneCasa = undefined;
  partita.formazioneTrasferta = undefined;
  partita.mvpGiocatoreId = undefined;
  partita.statistiche = undefined;

  await persist(data);
  if (partita.stato === "conclusa") await ricalcolaClassificaPerPartita(partita);
  return partita;
}

// ---------------------------------------------------------------------------
// COMPETIZIONI — tornei aggiuntivi paralleli al campionato principale
// ---------------------------------------------------------------------------
export async function creaCompetizione(competizione: Competizione) {
  const data = await load();
  data.competizioni.push(competizione);
  await persist(data);
  return competizione;
}

export async function aggiornaCompetizione(id: string, patch: Partial<Competizione>) {
  const data = await load();
  const idx = data.competizioni.findIndex((c) => c.id === id);
  if (idx === -1) return undefined;
  data.competizioni[idx] = { ...data.competizioni[idx], ...patch };
  await persist(data);
  return data.competizioni[idx];
}

export async function eliminaCompetizione(id: string) {
  const data = await load();
  data.competizioni = data.competizioni.filter((c) => c.id !== id);
  data.partite = data.partite.filter((p) => p.competizioneId !== id);
  Object.keys(data.classificheCompetizioni)
    .filter((chiave) => chiave === id || chiave.startsWith(`${id}:`))
    .forEach((chiave) => delete data.classificheCompetizioni[chiave]);
  await persist(data);
}

/** Aggiunge una fase (girone, semifinale...) a una competizione multi-fase. */
export async function creaFaseCompetizione(competizioneId: string, fase: FaseCompetizione) {
  const data = await load();
  const competizione = data.competizioni.find((c) => c.id === competizioneId);
  if (!competizione) return undefined;
  competizione.fasi.push(fase);
  await persist(data);
  return competizione;
}

export async function eliminaFaseCompetizione(competizioneId: string, faseId: string) {
  const data = await load();
  const competizione = data.competizioni.find((c) => c.id === competizioneId);
  if (!competizione) return undefined;
  competizione.fasi = competizione.fasi.filter((f) => f.id !== faseId);
  data.partite = data.partite.filter((p) => !(p.competizioneId === competizioneId && p.faseId === faseId));
  delete data.classificheCompetizioni[`${competizioneId}:${faseId}`];
  await persist(data);
  return competizione;
}

/**
 * Import del calendario da righe già validate e risolte sulle squadre —
 * l'organizzatore fornisce il calendario via CSV invece che generarlo l'app.
 *
 * L'import RIALLINEA invece di accodare: una riga del file che corrisponde a
 * una gara già presente (stessa giornata, stesse due squadre) ne aggiorna data,
 * ora, arbitro e campo lasciando intatti risultato, cronaca, formazioni e voti;
 * le righe senza corrispondenza diventano nuove partite. Ricaricare lo stesso
 * CSV è quindi il modo per rimettere in riga gli orari — quelli del file
 * diventano quelli del calendario — senza duplicare le partite né perdere
 * quanto già registrato sulle gare giocate.
 */
export interface RigaCalendarioImport {
  giornata: number;
  dataOra: string;
  squadraCasaId: string;
  squadraTrasfertaId: string;
  arbitro?: string;
  campo?: string;
}

export interface EsitoImportCalendario {
  creati: number;
  aggiornati: number;
  partite: Partita[];
}

/** Chiave d'identità di una gara nel calendario: giornata + accoppiamento squadre. */
function chiaveGara(giornata: number, casaId: string, trasfertaId: string) {
  return `${giornata}|${casaId}|${trasfertaId}`;
}

/**
 * Applica le righe del CSV all'insieme di partite `esistenti`, restituendo
 * quelle nuove da aggiungere. Le esistenti vengono aggiornate sul posto.
 */
function allineaAlCsv(
  esistenti: Partita[],
  righe: RigaCalendarioImport[],
  nuovaPartita: (r: RigaCalendarioImport) => Partita
): EsitoImportCalendario {
  const perChiave = new Map(
    esistenti.map((p) => [chiaveGara(p.giornata, p.squadraCasaId, p.squadraTrasfertaId), p])
  );

  const nuove: Partita[] = [];
  let aggiornati = 0;

  righe.forEach((r) => {
    const esistente = perChiave.get(chiaveGara(r.giornata, r.squadraCasaId, r.squadraTrasfertaId));
    if (esistente) {
      esistente.dataOra = r.dataOra;
      if (r.arbitro !== undefined) esistente.arbitro = r.arbitro;
      if (r.campo !== undefined) esistente.campo = r.campo;
      aggiornati += 1;
      return;
    }
    const partita = nuovaPartita(r);
    nuove.push(partita);
    // Anche le righe appena create entrano nell'indice: un CSV che ripete due
    // volte la stessa gara non deve produrne due copie.
    perChiave.set(chiaveGara(partita.giornata, partita.squadraCasaId, partita.squadraTrasfertaId), partita);
  });

  return { creati: nuove.length, aggiornati, partite: nuove };
}

export async function importaCalendarioCompetizione(
  competizioneId: string,
  faseId: string | undefined,
  righe: RigaCalendarioImport[]
): Promise<EsitoImportCalendario | undefined> {
  const data = await load();
  const competizione = data.competizioni.find((c) => c.id === competizioneId);
  if (!competizione) return undefined;

  const esistenti = data.partite.filter(
    (p) => p.competizioneId === competizioneId && (faseId ? p.faseId === faseId : !p.faseId)
  );

  const esito = allineaAlCsv(esistenti, righe, (r) => ({
    id: `partita-${competizioneId}-${randomUUID()}`,
    stagioneId: data.stagioneAttualeId,
    competizioneId,
    faseId,
    giornata: r.giornata,
    dataOra: r.dataOra,
    stato: "programmata",
    squadraCasaId: r.squadraCasaId,
    squadraTrasfertaId: r.squadraTrasfertaId,
    golCasa: 0,
    golTrasferta: 0,
    arbitro: r.arbitro ?? "",
    campo: r.campo ?? "Campo Sportivo Santa Teresa",
    eventi: [],
    galleryUrls: [],
  }));

  data.partite.push(...esito.partite);
  await persist(data);
  return esito;
}

/**
 * Stesso import in blocco, ma per il calendario del campionato principale
 * (nessun competizioneId/faseId: sono le partite "storiche", quelle che
 * alimentano `classifica` invece di `classificheCompetizioni`).
 */
export async function importaCalendarioPartite(righe: RigaCalendarioImport[]): Promise<EsitoImportCalendario> {
  const data = await load();

  const esito = allineaAlCsv(
    data.partite.filter((p) => !p.competizioneId),
    righe,
    (r) => ({
      id: `partita-${randomUUID()}`,
      stagioneId: data.stagioneAttualeId,
      giornata: r.giornata,
      dataOra: r.dataOra,
      stato: "programmata",
      squadraCasaId: r.squadraCasaId,
      squadraTrasfertaId: r.squadraTrasfertaId,
      golCasa: 0,
      golTrasferta: 0,
      arbitro: r.arbitro ?? "",
      campo: r.campo ?? "Campo Sportivo Santa Teresa",
      eventi: [],
      galleryUrls: [],
    })
  );

  data.partite.push(...esito.partite);
  await persist(data);
  return esito;
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
