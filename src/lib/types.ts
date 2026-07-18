// Modello di dominio — Lega Calcio Over 40, Campo Sportivo Santa Teresa (Scafati)
// Questi tipi rispecchiano 1:1 lo schema Postgres in supabase/schema.sql,
// così la data layer (src/lib/data/*) può passare dai dati mock a Supabase
// senza cambiare la forma dei dati consumati dai componenti.

export type Ruolo = "Portiere" | "Difensore" | "Centrocampista" | "Attaccante";
export type PiedePreferito = "Destro" | "Sinistro" | "Ambidestro";

export type StatoPartita = "programmata" | "live" | "intervallo" | "conclusa" | "rinviata" | "sospesa";

export type TipoEvento =
  | "goal"
  | "autogoal"
  | "rigore_segnato"
  | "rigore_sbagliato"
  | "assist"
  | "ammonizione"
  | "secondo_giallo"
  | "espulsione"
  | "sostituzione"
  | "inizio_partita"
  | "fine_primo_tempo"
  | "inizio_secondo_tempo"
  | "fine_partita"
  | "mvp";

export interface Sponsor {
  id: string;
  nome: string;
  logoUrl: string;
  sito?: string;
  livello: "platinum" | "gold" | "silver";
  descrizione?: string;
}

export interface Stagione {
  id: string;
  etichetta: string; // "2025/2026"
  dataInizio: string;
  dataFine: string;
  attuale: boolean;
  campioneSquadraId?: string;
}

export interface Squadra {
  id: string;
  slug: string;
  nome: string;
  nomeBreve: string;
  logoUrl: string;
  coverUrl: string;
  coloriSociali: [string, string];
  descrizione: string;
  fondazione: number;
  capitanoId?: string;
  viceCapitanoId?: string;
  allenatore: string;
  sedeSociale?: string;
  sponsorIds: string[];
  galleryUrls: string[];
}

export interface StatisticheStagionaliGiocatore {
  stagioneId: string;
  squadraId: string;
  presenze: number;
  minutiGiocati: number;
  goal: number;
  assist: number;
  ammonizioni: number;
  espulsioni: number;
  mediaVoto: number;
  mvp: number;
  cleanSheet?: number;
  golSubiti?: number;
}

export interface Giocatore {
  id: string;
  slug: string;
  nome: string;
  cognome: string;
  fotoUrl: string;
  numeroMaglia: number;
  ruolo: Ruolo;
  eta: number;
  dataNascita: string;
  altezzaCm: number;
  pesoKg: number;
  piedePreferito: PiedePreferito;
  squadraId: string;
  bio: string;
  galleryUrls: string[];
  videoUrls: { titolo: string; url: string; thumbnailUrl: string }[];
  statistiche: StatisticheStagionaliGiocatore[];
  trofei: { stagioneId: string; titolo: string }[];
}

export interface Meteo {
  temperaturaC: number;
  condizione: "sereno" | "nuvoloso" | "pioggia" | "vento" | "nebbia";
  ventoKmh: number;
  umidita: number;
}

export interface EventoPartita {
  id: string;
  partitaId: string;
  minuto: number;
  minutoRecupero?: number;
  tempo: 1 | 2;
  tipo: TipoEvento;
  squadraId: string;
  giocatoreId?: string;
  giocatoreEntrataId?: string; // per sostituzioni
  assistGiocatoreId?: string;
  dettaglio?: string;
}

export interface FormazioneVoce {
  giocatoreId: string;
  titolare: boolean;
  numero: number;
  ruolo: Ruolo;
  votoLive?: number;
  ammonito?: boolean;
  espulso?: boolean;
  sostituito?: boolean;
}

export interface StatistichePartita {
  possessoPalla: [number, number];
  tiri: [number, number];
  tiriInPorta: [number, number];
  corner: [number, number];
  falli: [number, number];
  fuorigioco: [number, number];
  parate: [number, number];
}

export interface Partita {
  id: string;
  stagioneId: string;
  giornata: number;
  dataOra: string;
  stato: StatoPartita;
  minutoCorrente?: number;
  squadraCasaId: string;
  squadraTrasfertaId: string;
  golCasa: number;
  golTrasferta: number;
  arbitro: string;
  campo: string;
  meteo?: Meteo;
  eventi: EventoPartita[];
  formazioneCasa?: FormazioneVoce[];
  formazioneTrasferta?: FormazioneVoce[];
  statistiche?: StatistichePartita;
  mvpGiocatoreId?: string;
  galleryUrls: string[];
  highlightUrl?: string;
  partitaDellaSettimana?: boolean;
  note?: string;
}

export interface RigaClassifica {
  squadraId: string;
  posizione: number;
  puntiCasa: number;
  puntiTrasferta: number;
  giocate: number;
  vinte: number;
  pareggiate: number;
  perse: number;
  golFatti: number;
  golSubiti: number;
  punti: number;
  ultimeCinque: ("V" | "N" | "P")[];
  ammonizioni: number;
  espulsioni: number;
}

export interface Articolo {
  id: string;
  slug: string;
  titolo: string;
  sommario: string;
  contenuto: string;
  copertinaUrl: string;
  categoria: "comunicato" | "articolo" | "disciplinare" | "evento";
  autore: string;
  pubblicatoIl: string;
  squadreCorrelate?: string[];
  in_evidenza?: boolean;
}

export interface AlbumMedia {
  id: string;
  titolo: string;
  copertinaUrl: string;
  data: string;
  tipo: "foto" | "video";
  partitaId?: string;
  squadraId?: string;
  itemsUrls: { url: string; thumbnailUrl?: string; tipo: "foto" | "video" }[];
}

export interface PremioSettimanale {
  id: string;
  giornata: number;
  stagioneId: string;
  tipo: "mvp_giornata" | "squadra_della_settimana" | "partita_della_settimana" | "gol_della_settimana";
  giocatoreId?: string;
  squadraId?: string;
  partitaId?: string;
  motivazione: string;
}

export interface VoceAlboOro {
  stagioneId: string;
  squadraCampioneId: string;
  capocannoniereId: string;
  capocannoniereGoal: number;
  mvpStagioneId: string;
  miglioreDifesaSquadraId: string;
  fairPlaySquadraId: string;
}

export interface Notifica {
  id: string;
  tipo: "goal" | "inizio_partita" | "intervallo" | "fine_partita" | "news" | "comunicato" | "mvp_voto" | "media";
  titolo: string;
  corpo: string;
  link?: string;
  creataIl: string;
}

// ---------------------------------------------------------------------------
// ARCHIVIO STORICO REALE — Campionati Passati
// Dati sorgente: export/CSV forniti dalla Lega. Alcune stagioni hanno dati
// parziali (nomi censurati dalla fonte, liste marcatori troncate, anomalie
// di classifica per sanzioni disciplinari): questi limiti sono preservati
// nei campi `nota`/`incompleta` invece di essere nascosti, così l'admin può
// correggerli dal pannello quando avrà le fonti complete.
// ---------------------------------------------------------------------------

export interface RigaClassificaStorica {
  posizione: number;
  squadra: string;
  punti: number;
  giocate: number;
  vinte: number;
  pareggiate?: number;
  perse?: number;
  golFatti?: number;
  golSubiti?: number;
  nota?: string;
}

export interface MarcatoreStorico {
  posizione: number;
  giocatore: string;
  squadra: string;
  gol: number;
  nomeParziale?: boolean;
  nota?: string;
}

export interface PremioStorico {
  titolo: string;
  assegnatario: string;
  dettaglio?: string;
}

export interface CampionatoStorico {
  id: string;
  stagione: string; // "2025/2026"
  nomeCompetizione: string;
  vincitore?: string;
  classificaFinale: RigaClassificaStorica[];
  classificaIncompleta?: boolean;
  marcatori: MarcatoreStorico[];
  marcatoriIncompleti?: boolean;
  mvp?: string;
  premi?: PremioStorico[];
  fairPlaySquadra?: string;
  galleryUrls: string[];
  note?: string;
}

// ---------------------------------------------------------------------------
// COMPETIZIONI — motore generico (campionati, coppe, tornei, gironi)
// Modello predisposto per il futuro "competition builder" lato admin.
// ---------------------------------------------------------------------------

export type TipoCompetizione = "campionato" | "coppa" | "torneo_eliminazione" | "gironi" | "gironi_piu_finale" | "personalizzata";
export type FormatoIncontri = "andata_ritorno" | "girone_unico" | "eliminazione_diretta" | "misto";
export type StatoCompetizione = "bozza" | "in_corso" | "conclusa" | "archiviata";

export interface CriterioClassifica {
  ordine: number;
  criterio: "punti" | "differenza_reti" | "gol_fatti" | "scontri_diretti" | "fair_play" | "sorteggio";
}

export interface FaseCompetizione {
  id: string;
  nome: string; // "Girone A", "Quarti di finale", "Fase a gironi"
  ordine: number;
  formato: FormatoIncontri;
  squadreIds: string[];
}

export interface Competizione {
  id: string;
  slug: string;
  nome: string;
  tipo: TipoCompetizione;
  stagioneId: string;
  logoUrl: string;
  coloreSociale: string;
  stato: StatoCompetizione;
  formato: FormatoIncontri;
  criteriClassifica: CriterioClassifica[];
  fasi: FaseCompetizione[];
  regolamento?: string;
  squadreIscritteIds: string[];
}

export interface RigaClassificaDisciplina {
  squadraId: string;
  ammonizioni: number;
  espulsioni: number;
  puntiDisciplina: number; // 1 per ammonizione, 3 per espulsione (convenzione FIGC amatoriale)
}

export interface UtenteProfilo {
  id: string;
  nome: string;
  email: string;
  squadraPreferitaId?: string;
  giocatorePreferitoId?: string;
  notifichePush: {
    goal: boolean;
    inizioPartita: boolean;
    fine_partita: boolean;
    news: boolean;
    comunicati: boolean;
  };
  ruolo: "tifoso" | "giocatore" | "organizzatore";
}
