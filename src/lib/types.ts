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
