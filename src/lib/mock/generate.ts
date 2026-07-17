import type {
  AlbumMedia,
  Articolo,
  EventoPartita,
  FormazioneVoce,
  Giocatore,
  Meteo,
  Partita,
  PremioSettimanale,
  RigaClassifica,
  Ruolo,
  Sponsor,
  Squadra,
  Stagione,
  StatisticheStagionaliGiocatore,
  StatoPartita,
  VoceAlboOro,
} from "@/lib/types";
import { mulberry32, hashSeed, pick, randInt } from "./prng";
import { nomeCompleto } from "./names";
import { TEAMS_SEED } from "./teams-seed";
import { slugify } from "@/lib/utils";
import { NOW } from "./now";

const ARBITRI = [
  "Sig. Alfonso De Rosa",
  "Sig. Bruno Sannino",
  "Sig.ra Chiara Milone",
  "Sig. Giovanni Attanasio",
  "Sig. Ferdinando Cesarano",
  "Sig. Luca Palmieri",
];

const RUOLI_QUOTA: { ruolo: Ruolo; count: number }[] = [
  { ruolo: "Portiere", count: 2 },
  { ruolo: "Difensore", count: 5 },
  { ruolo: "Centrocampista", count: 5 },
  { ruolo: "Attaccante", count: 4 },
];

const TZ_OFFSET = "+02:00";

// Tutte le manipolazioni di data restano indipendenti dal fuso orario del
// server: operiamo su millisecondi assoluti e ricostruiamo gli orari con un
// offset esplicito, evitando i metodi setHours/setDate (fuso locale).
function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 86_400_000);
}

function isoDateAtOffset(date: Date) {
  const shifted = new Date(date.getTime() + 2 * 60 * 60 * 1000);
  const y = shifted.getUTCFullYear();
  const m = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const d = String(shifted.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function atTime(date: Date, h: number, m: number) {
  const dateStr = isoDateAtOffset(date);
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  return new Date(`${dateStr}T${hh}:${mm}:00${TZ_OFFSET}`);
}

// ---------------------------------------------------------------------------
// 1. SQUADRE + ROSE
// ---------------------------------------------------------------------------

interface BuiltTeam {
  squadra: Squadra;
  roster: Giocatore[];
}

function buildTeams(): BuiltTeam[] {
  const usedNames = new Set<string>();

  return TEAMS_SEED.map((seed) => {
    const teamId = seed.slug;
    const rand = mulberry32(hashSeed(seed.slug));
    const roster: Giocatore[] = [];
    let shirt = 1;

    RUOLI_QUOTA.forEach(({ ruolo, count }) => {
      for (let i = 0; i < count; i++) {
        const { nome, cognome } = nomeCompleto(rand, usedNames);
        const eta = randInt(rand, 40, 53);
        const dataNascita = new Date(NOW.getFullYear() - eta, randInt(rand, 0, 11), randInt(rand, 1, 28));
        const id = `${teamId}-${slugify(`${nome} ${cognome}`)}`;
        roster.push({
          id,
          slug: slugify(`${nome}-${cognome}-${shirt}`),
          nome,
          cognome,
          fotoUrl: "",
          numeroMaglia: shirt,
          ruolo,
          eta,
          dataNascita: dataNascita.toISOString(),
          altezzaCm: randInt(rand, 168, 193),
          pesoKg: randInt(rand, 72, 95),
          piedePreferito: pick(rand, ["Destro", "Destro", "Destro", "Sinistro", "Ambidestro"]),
          squadraId: teamId,
          bio: bioPerRuolo(ruolo, nome, seed.nomeBreve, rand),
          galleryUrls: [],
          videoUrls: [],
          statistiche: [],
          trofei: [],
        });
        shirt++;
      }
    });

    // capitano: centrocampista/difensore più anziano; vice: un attaccante o difensore
    const eligibiliCapitano = roster.filter((p) => p.ruolo !== "Portiere").sort((a, b) => b.eta - a.eta);
    const capitano = eligibiliCapitano[0];
    const vice = eligibiliCapitano.find((p) => p.id !== capitano.id) ?? roster[1];

    const squadra: Squadra = {
      id: teamId,
      slug: seed.slug,
      nome: seed.nome,
      nomeBreve: seed.nomeBreve,
      logoUrl: "",
      coverUrl: "",
      coloriSociali: seed.coloriSociali,
      descrizione: seed.descrizione,
      fondazione: seed.fondazione,
      capitanoId: capitano.id,
      viceCapitanoId: vice.id,
      allenatore: seed.allenatore,
      sedeSociale: seed.sedeSociale,
      sponsorIds: [],
      galleryUrls: [],
    };

    return { squadra, roster };
  });
}

function bioPerRuolo(ruolo: Ruolo, nome: string, squadra: string, rand: () => number): string {
  const frasi: Record<Ruolo, string[]> = {
    Portiere: [
      `${nome} para tutto quello che si muove tra i pali del ${squadra}: riflessi intatti nonostante il tempo che passa.`,
      `Ultimo baluardo del ${squadra}, ${nome} comanda la difesa a gran voce da oltre un decennio.`,
    ],
    Difensore: [
      `Roccia del reparto arretrato, ${nome} non concede un metro agli attaccanti avversari.`,
      `${nome} è il faro difensivo del ${squadra}: letture di gioco impeccabili ed esperienza da vendere.`,
    ],
    Centrocampista: [
      `Motore silenzioso del ${squadra}, ${nome} detta i tempi della manovra da metà campo.`,
      `${nome} corre per due, recupera palloni e imposta: il classico centrocampista box-to-box Over 40.`,
    ],
    Attaccante: [
      `Bomber di razza, ${nome} non ha mai perso il vizio del gol nemmeno dopo i quaranta.`,
      `${nome} è il terminale offensivo del ${squadra}: fiuto del gol intatto e istinto da rapace d'area.`,
    ],
  };
  return pick(rand, frasi[ruolo]);
}

// ---------------------------------------------------------------------------
// 2. CALENDARIO — round robin circle method, andata e ritorno
// ---------------------------------------------------------------------------

function roundRobinPairs(teamIds: string[]): [string, string][][] {
  const arr = [...teamIds];
  const numRounds = arr.length - 1;
  const half = arr.length / 2;
  let list = [...arr];
  const rounds: [string, string][][] = [];

  for (let r = 0; r < numRounds; r++) {
    const roundPairs: [string, string][] = [];
    for (let i = 0; i < half; i++) {
      const home = list[i];
      const away = list[list.length - 1 - i];
      roundPairs.push(r % 2 === 0 ? [home, away] : [away, home]);
    }
    rounds.push(roundPairs);
    list = [list[0], list[list.length - 1], ...list.slice(1, list.length - 1)];
  }
  return rounds;
}

const KICKOFFS: [number, number][] = [
  [9, 30],
  [11, 0],
  [18, 0],
  [19, 30],
];

function giornataBaseDate(giornata: number): Date {
  const g1 = new Date("2026-05-01T00:00:00+02:00");
  return addDays(g1, (giornata - 1) * 7);
}

// ---------------------------------------------------------------------------
// 3. GENERAZIONE EVENTI/STATISTICHE PARTITA
// ---------------------------------------------------------------------------

function weightedGoals(rand: () => number) {
  const table = [0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 3, 4];
  return pick(rand, table);
}

function attaccantiEIdonei(roster: Giocatore[]) {
  return roster.filter((p) => p.ruolo !== "Portiere");
}

function generaEventiGol(
  rand: () => number,
  squadraId: string,
  roster: Giocatore[],
  golNumero: number,
  tempoLimiteMinuto: number
): EventoPartita[] {
  const eventi: EventoPartita[] = [];
  const papabili = attaccantiEIdonei(roster);
  for (let i = 0; i < golNumero; i++) {
    const scorer = pick(rand, papabili);
    const conAssist = rand() > 0.35;
    const assistPlayer = conAssist ? pick(rand, papabili.filter((p) => p.id !== scorer.id)) : undefined;
    const minuto = randInt(rand, 1, tempoLimiteMinuto);
    eventi.push({
      id: `${squadraId}-gol-${i}-${minuto}`,
      partitaId: "",
      minuto,
      tempo: minuto <= 45 ? 1 : 2,
      tipo: rand() > 0.92 ? "rigore_segnato" : "goal",
      squadraId,
      giocatoreId: scorer.id,
      assistGiocatoreId: assistPlayer?.id,
    });
  }
  return eventi;
}

function generaCartellini(
  rand: () => number,
  squadraId: string,
  roster: Giocatore[],
  tempoLimiteMinuto: number
): EventoPartita[] {
  const eventi: EventoPartita[] = [];
  const nAmmonizioni = randInt(rand, 0, 3);
  const ammoniti: string[] = [];
  for (let i = 0; i < nAmmonizioni; i++) {
    const player = pick(rand, roster);
    const minuto = randInt(rand, 1, tempoLimiteMinuto);
    ammoniti.push(player.id);
    eventi.push({
      id: `${squadraId}-amm-${i}-${minuto}`,
      partitaId: "",
      minuto,
      tempo: minuto <= 45 ? 1 : 2,
      tipo: "ammonizione",
      squadraId,
      giocatoreId: player.id,
    });
  }
  if (rand() > 0.9 && ammoniti.length > 0) {
    const minuto = randInt(rand, 60, tempoLimiteMinuto);
    eventi.push({
      id: `${squadraId}-esp-${minuto}`,
      partitaId: "",
      minuto,
      tempo: 2,
      tipo: "espulsione",
      squadraId,
      giocatoreId: pick(rand, ammoniti),
      dettaglio: "Doppia ammonizione",
    });
  }
  return eventi;
}

function costruisciFormazioni(rand: () => number, squadraId: string, roster: Giocatore[], eventi: EventoPartita[]): FormazioneVoce[] {
  const gk = roster.filter((p) => p.ruolo === "Portiere");
  const def = roster.filter((p) => p.ruolo === "Difensore");
  const mid = roster.filter((p) => p.ruolo === "Centrocampista");
  const att = roster.filter((p) => p.ruolo === "Attaccante");

  const titolari = [
    ...gk.slice(0, 1),
    ...def.slice(0, 4),
    ...mid.slice(0, 4),
    ...att.slice(0, 2),
  ];
  const panchina = roster.filter((p) => !titolari.includes(p)).slice(0, 5);

  const ammonitiIds = new Set(eventi.filter((e) => e.tipo === "ammonizione" && e.squadraId === squadraId).map((e) => e.giocatoreId));
  const espulsiIds = new Set(eventi.filter((e) => e.tipo === "espulsione" && e.squadraId === squadraId).map((e) => e.giocatoreId));

  return [...titolari, ...panchina].map((p, idx) => ({
    giocatoreId: p.id,
    titolare: idx < titolari.length,
    numero: p.numeroMaglia,
    ruolo: p.ruolo,
    votoLive: Number((5.5 + rand() * 3).toFixed(1)),
    ammonito: ammonitiIds.has(p.id),
    espulso: espulsiIds.has(p.id),
    sostituito: idx < titolari.length && rand() > 0.7,
  }));
}

interface MatchGenInput {
  id: string;
  stagioneId: string;
  giornata: number;
  dataOra: Date;
  stato: StatoPartita;
  casa: BuiltTeam;
  trasferta: BuiltTeam;
  partitaDellaSettimana?: boolean;
  minutoLive?: number;
}

function generaMeteo(rand: () => number): Meteo {
  const condizioni: Meteo["condizione"][] = ["sereno", "sereno", "sereno", "nuvoloso", "pioggia", "vento", "nebbia"];
  return {
    temperaturaC: randInt(rand, 20, 34),
    condizione: pick(rand, condizioni),
    ventoKmh: randInt(rand, 2, 22),
    umidita: randInt(rand, 35, 75),
  };
}

function generaPartita(input: MatchGenInput): Partita {
  const rand = mulberry32(hashSeed(input.id));
  const isFuture = input.stato === "programmata";
  const isLive = input.stato === "live" || input.stato === "intervallo";
  const limiteMinuto = isLive ? Math.min(input.minutoLive ?? 45, 90) : 90;

  let golCasa = 0;
  let golTrasferta = 0;
  let eventi: EventoPartita[] = [];

  if (!isFuture) {
    const totCasa = isLive ? randInt(rand, 0, 3) : weightedGoals(rand);
    const totTrasferta = isLive ? randInt(rand, 0, 3) : weightedGoals(rand);
    golCasa = totCasa;
    golTrasferta = totTrasferta;

    eventi = [
      ...generaEventiGol(rand, input.casa.squadra.id, input.casa.roster, totCasa, limiteMinuto),
      ...generaEventiGol(rand, input.trasferta.squadra.id, input.trasferta.roster, totTrasferta, limiteMinuto),
      ...generaCartellini(rand, input.casa.squadra.id, input.casa.roster, limiteMinuto),
      ...generaCartellini(rand, input.trasferta.squadra.id, input.trasferta.roster, limiteMinuto),
    ].sort((a, b) => a.minuto - b.minuto);

    eventi = eventi.map((e, i) => ({ ...e, id: `${input.id}-ev-${i}`, partitaId: input.id }));

    eventi.unshift({
      id: `${input.id}-inizio`,
      partitaId: input.id,
      minuto: 0,
      tempo: 1,
      tipo: "inizio_partita",
      squadraId: input.casa.squadra.id,
    });

    if (!isLive || limiteMinuto > 45) {
      eventi.splice(1, 0, {
        id: `${input.id}-int`,
        partitaId: input.id,
        minuto: 45,
        tempo: 1,
        tipo: "fine_primo_tempo",
        squadraId: input.casa.squadra.id,
      });
    }

    if (!isLive) {
      eventi.push({
        id: `${input.id}-fine`,
        partitaId: input.id,
        minuto: 90,
        tempo: 2,
        tipo: "fine_partita",
        squadraId: input.casa.squadra.id,
      });
    }
  }

  const formazioneCasa = !isFuture ? costruisciFormazioni(rand, input.casa.squadra.id, input.casa.roster, eventi) : undefined;
  const formazioneTrasferta = !isFuture ? costruisciFormazioni(rand, input.trasferta.squadra.id, input.trasferta.roster, eventi) : undefined;

  const scorersCasa = eventi.filter((e) => (e.tipo === "goal" || e.tipo === "rigore_segnato") && e.squadraId === input.casa.squadra.id);
  const scorersTrasferta = eventi.filter((e) => (e.tipo === "goal" || e.tipo === "rigore_segnato") && e.squadraId === input.trasferta.squadra.id);
  const mvpEvento = [...scorersCasa, ...scorersTrasferta][0];
  const mvpGiocatoreId =
    !isFuture && mvpEvento?.giocatoreId
      ? mvpEvento.giocatoreId
      : !isFuture
        ? pick(rand, [...input.casa.roster, ...input.trasferta.roster]).id
        : undefined;

  const possCasa = randInt(rand, 38, 62);

  return {
    id: input.id,
    stagioneId: input.stagioneId,
    giornata: input.giornata,
    dataOra: input.dataOra.toISOString(),
    stato: input.stato,
    minutoCorrente: isLive ? input.minutoLive : undefined,
    squadraCasaId: input.casa.squadra.id,
    squadraTrasfertaId: input.trasferta.squadra.id,
    golCasa,
    golTrasferta,
    arbitro: pick(rand, ARBITRI),
    campo: "Campo Sportivo Santa Teresa",
    meteo: generaMeteo(rand),
    eventi,
    formazioneCasa,
    formazioneTrasferta,
    statistiche: !isFuture
      ? {
          possessoPalla: [possCasa, 100 - possCasa],
          tiri: [randInt(rand, 6, 18), randInt(rand, 6, 18)],
          tiriInPorta: [randInt(rand, 2, 9), randInt(rand, 2, 9)],
          corner: [randInt(rand, 1, 9), randInt(rand, 1, 9)],
          falli: [randInt(rand, 4, 16), randInt(rand, 4, 16)],
          fuorigioco: [randInt(rand, 0, 4), randInt(rand, 0, 4)],
          parate: [randInt(rand, 1, 7), randInt(rand, 1, 7)],
        }
      : undefined,
    mvpGiocatoreId,
    galleryUrls: [],
    partitaDellaSettimana: input.partitaDellaSettimana,
  };
}

// ---------------------------------------------------------------------------
// 4. ASSEMBLAGGIO STAGIONE
// ---------------------------------------------------------------------------

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
  alboOro: VoceAlboOro[];
}

export function buildLegaData(): LegaData {
  const teams = buildTeams();
  const teamById = new Map(teams.map((t) => [t.squadra.id, t]));
  const teamIds = teams.map((t) => t.squadra.id);

  const stagioneAttuale: Stagione = {
    id: "2025-2026",
    etichetta: "2025/2026",
    dataInizio: "2026-05-01",
    dataFine: "2026-08-02",
    attuale: true,
  };
  const stagionePrec1: Stagione = {
    id: "2024-2025",
    etichetta: "2024/2025",
    dataInizio: "2025-05-04",
    dataFine: "2025-08-03",
    attuale: false,
    campioneSquadraId: "scafati-veterani",
  };
  const stagionePrec2: Stagione = {
    id: "2023-2024",
    etichetta: "2023/2024",
    dataInizio: "2024-05-05",
    dataFine: "2024-08-04",
    attuale: false,
    campioneSquadraId: "sarno-storico",
  };

  const leg1 = roundRobinPairs(teamIds);
  const leg2 = leg1.map((round) => round.map(([h, a]) => [a, h] as [string, string]));
  const allRounds = [...leg1, ...leg2]; // 14 giornate

  const partite: Partita[] = [];

  allRounds.forEach((round, roundIdx) => {
    const giornata = roundIdx + 1;
    const baseDate = giornataBaseDate(giornata);

    round.forEach(([homeId, awayId], matchIdx) => {
      const casa = teamById.get(homeId)!;
      const trasferta = teamById.get(awayId)!;

      let stato: StatoPartita = "programmata";
      let dataOra: Date;
      let minutoLive: number | undefined;
      let partitaDellaSettimana = false;

      if (giornata < 12) {
        stato = "conclusa";
        const [h, m] = KICKOFFS[matchIdx];
        dataOra = atTime(baseDate, h, m);
      } else if (giornata === 12) {
        partitaDellaSettimana = matchIdx === 3;
        if (matchIdx === 0) {
          stato = "conclusa";
          dataOra = atTime(baseDate, 9, 30);
        } else if (matchIdx === 1) {
          stato = "live";
          dataOra = atTime(baseDate, 17, 30);
          minutoLive = Math.min(90, Math.max(1, Math.round((NOW.getTime() - dataOra.getTime()) / 60000)));
        } else if (matchIdx === 2) {
          stato = "programmata";
          dataOra = atTime(addDays(baseDate, 1), 10, 30);
        } else {
          stato = "programmata";
          dataOra = atTime(addDays(baseDate, 2), 19, 0);
        }
      } else {
        stato = "programmata";
        const [h, m] = KICKOFFS[matchIdx];
        dataOra = atTime(baseDate, h, m);
      }

      const id = `p-g${giornata}-${homeId}-${awayId}`;
      partite.push(
        generaPartita({
          id,
          stagioneId: stagioneAttuale.id,
          giornata,
          dataOra,
          stato,
          casa,
          trasferta,
          partitaDellaSettimana,
          minutoLive,
        })
      );
    });
  });

  // ---- statistiche stagionali aggregate dai match conclusi ----
  const statMap = new Map<string, StatisticheStagionaliGiocatore>();
  const presenzeSet = new Map<string, Set<string>>();

  function statFor(giocatoreId: string, squadraId: string) {
    const key = giocatoreId;
    if (!statMap.has(key)) {
      statMap.set(key, {
        stagioneId: stagioneAttuale.id,
        squadraId,
        presenze: 0,
        minutiGiocati: 0,
        goal: 0,
        assist: 0,
        ammonizioni: 0,
        espulsioni: 0,
        mediaVoto: 0,
        mvp: 0,
      });
    }
    return statMap.get(key)!;
  }

  const votiAccumulati = new Map<string, number[]>();

  partite
    .filter((p) => p.stato === "conclusa" || p.stato === "live")
    .forEach((p) => {
      [...(p.formazioneCasa ?? []), ...(p.formazioneTrasferta ?? [])].forEach((f) => {
        const squadraId = (p.formazioneCasa ?? []).includes(f) ? p.squadraCasaId : p.squadraTrasfertaId;
        if (!presenzeSet.has(f.giocatoreId)) presenzeSet.set(f.giocatoreId, new Set());
        presenzeSet.get(f.giocatoreId)!.add(p.id);
        const s = statFor(f.giocatoreId, squadraId);
        s.presenze = presenzeSet.get(f.giocatoreId)!.size;
        s.minutiGiocati += f.titolare ? (f.sostituito ? randInt(mulberry32(hashSeed(p.id + f.giocatoreId)), 55, 89) : 90) : randInt(mulberry32(hashSeed(f.giocatoreId + p.id)), 10, 35);
        if (f.votoLive) {
          if (!votiAccumulati.has(f.giocatoreId)) votiAccumulati.set(f.giocatoreId, []);
          votiAccumulati.get(f.giocatoreId)!.push(f.votoLive);
        }
      });

      p.eventi.forEach((e) => {
        if (!e.giocatoreId && !e.assistGiocatoreId) return;
        const squadraId = e.squadraId;
        if (e.tipo === "goal" || e.tipo === "rigore_segnato") {
          if (e.giocatoreId) statFor(e.giocatoreId, squadraId).goal += 1;
          if (e.assistGiocatoreId) statFor(e.assistGiocatoreId, squadraId).assist += 1;
        }
        if (e.tipo === "ammonizione") {
          if (e.giocatoreId) statFor(e.giocatoreId, squadraId).ammonizioni += 1;
        }
        if (e.tipo === "espulsione") {
          if (e.giocatoreId) statFor(e.giocatoreId, squadraId).espulsioni += 1;
        }
      });

      if (p.mvpGiocatoreId) {
        const squadraId = teams.some((t) => t.roster.some((r) => r.id === p.mvpGiocatoreId && r.squadraId === p.squadraCasaId))
          ? p.squadraCasaId
          : p.squadraTrasfertaId;
        statFor(p.mvpGiocatoreId, squadraId).mvp += 1;
      }

      // portieri titolari: clean sheet e gol subiti
      const portiereCasa = (p.formazioneCasa ?? []).find((f) => f.titolare && f.ruolo === "Portiere");
      const portiereTrasferta = (p.formazioneTrasferta ?? []).find((f) => f.titolare && f.ruolo === "Portiere");
      if (portiereCasa) {
        const s = statFor(portiereCasa.giocatoreId, p.squadraCasaId);
        s.golSubiti = (s.golSubiti ?? 0) + p.golTrasferta;
        if (p.golTrasferta === 0) s.cleanSheet = (s.cleanSheet ?? 0) + 1;
      }
      if (portiereTrasferta) {
        const s = statFor(portiereTrasferta.giocatoreId, p.squadraTrasfertaId);
        s.golSubiti = (s.golSubiti ?? 0) + p.golCasa;
        if (p.golCasa === 0) s.cleanSheet = (s.cleanSheet ?? 0) + 1;
      }
    });

  votiAccumulati.forEach((voti, giocatoreId) => {
    const s = statMap.get(giocatoreId);
    if (s) s.mediaVoto = Number((voti.reduce((a, b) => a + b, 0) / voti.length).toFixed(2));
  });

function generaStagionePassata(giocatore: { id: string; ruolo: Ruolo; squadraId: string }, stagioneId: string): StatisticheStagionaliGiocatore {
  const rand = mulberry32(hashSeed(`${giocatore.id}-${stagioneId}`));
  const presenze = randInt(rand, 8, 14);
  const golBase = giocatore.ruolo === "Attaccante" ? randInt(rand, 6, 22) : giocatore.ruolo === "Centrocampista" ? randInt(rand, 1, 9) : giocatore.ruolo === "Difensore" ? randInt(rand, 0, 4) : 0;
  return {
    stagioneId,
    squadraId: giocatore.squadraId,
    presenze,
    minutiGiocati: presenze * randInt(rand, 55, 90),
    goal: golBase,
    assist: giocatore.ruolo === "Portiere" ? 0 : randInt(rand, 0, 8),
    ammonizioni: randInt(rand, 0, 6),
    espulsioni: rand() > 0.85 ? 1 : 0,
    mediaVoto: Number((5.8 + rand() * 2).toFixed(2)),
    mvp: rand() > 0.8 ? randInt(rand, 1, 2) : 0,
    cleanSheet: giocatore.ruolo === "Portiere" ? randInt(rand, 2, 7) : undefined,
    golSubiti: giocatore.ruolo === "Portiere" ? randInt(rand, 10, 24) : undefined,
  };
}

const giocatori: Giocatore[] = teams.flatMap((t) =>
    t.roster.map((p) => ({
      ...p,
      statistiche: [
        ...(statMap.has(p.id) ? [statMap.get(p.id)!] : []),
        generaStagionePassata(p, stagionePrec1.id),
        generaStagionePassata(p, stagionePrec2.id),
      ],
      trofei:
        p.id === teamById.get("scafati-veterani")?.roster[0]?.id
          ? [{ stagioneId: stagionePrec1.id, titolo: "Campione Over 40 2024/2025" }]
          : [],
    }))
  );

  const squadre = teams.map((t) => t.squadra);

  // ---- classifica ----
  const classifica: RigaClassifica[] = squadre.map((s) => {
    const conclusePer = partite.filter((p) => p.stato === "conclusa" && (p.squadraCasaId === s.id || p.squadraTrasfertaId === s.id));
    let vinte = 0,
      pareggiate = 0,
      perse = 0,
      golFatti = 0,
      golSubiti = 0,
      puntiCasa = 0,
      puntiTrasferta = 0,
      ammonizioni = 0,
      espulsioni = 0;
    const formaCronologica: { data: string; esito: "V" | "N" | "P" }[] = [];

    conclusePer.forEach((p) => {
      const isCasa = p.squadraCasaId === s.id;
      const golFatto = isCasa ? p.golCasa : p.golTrasferta;
      const golSubito = isCasa ? p.golTrasferta : p.golCasa;
      golFatti += golFatto;
      golSubiti += golSubito;
      let esito: "V" | "N" | "P";
      if (golFatto > golSubito) {
        vinte++;
        esito = "V";
        if (isCasa) puntiCasa += 3;
        else puntiTrasferta += 3;
      } else if (golFatto === golSubito) {
        pareggiate++;
        esito = "N";
        if (isCasa) puntiCasa += 1;
        else puntiTrasferta += 1;
      } else {
        perse++;
        esito = "P";
      }
      formaCronologica.push({ data: p.dataOra, esito });
      const eventiSquadra = p.eventi.filter((e) => e.squadraId === s.id);
      ammonizioni += eventiSquadra.filter((e) => e.tipo === "ammonizione").length;
      espulsioni += eventiSquadra.filter((e) => e.tipo === "espulsione").length;
    });

    formaCronologica.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

    return {
      squadraId: s.id,
      posizione: 0,
      puntiCasa,
      puntiTrasferta,
      giocate: conclusePer.length,
      vinte,
      pareggiate,
      perse,
      golFatti,
      golSubiti,
      punti: puntiCasa + puntiTrasferta,
      ultimeCinque: formaCronologica.slice(-5).map((f) => f.esito),
      ammonizioni,
      espulsioni,
    };
  });

  classifica.sort((a, b) => b.punti - a.punti || b.golFatti - b.golSubiti - (a.golFatti - a.golSubiti) || b.golFatti - a.golFatti);
  classifica.forEach((r, i) => (r.posizione = i + 1));

  // ---- sponsor ----
  const sponsor: Sponsor[] = [
    { id: "sp-1", nome: "Macelleria D'Auria", logoUrl: "", livello: "platinum", descrizione: "Carni selezionate dal 1962, sponsor principale della Lega." },
    { id: "sp-2", nome: "Farmacia Centrale Scafati", logoUrl: "", livello: "platinum", descrizione: "Il tuo benessere, la nostra missione." },
    { id: "sp-3", nome: "Concessionaria Auto Sud", logoUrl: "", livello: "gold", descrizione: "Mobilità e passione da tre generazioni." },
    { id: "sp-4", nome: "Pastificio Agro Sarnese", logoUrl: "", livello: "gold", descrizione: "Pasta artigianale del territorio." },
    { id: "sp-5", nome: "Studio Legale Improta & Associati", logoUrl: "", livello: "gold", descrizione: "Consulenza legale per famiglie e imprese." },
    { id: "sp-6", nome: "Ottica Vesuvio", logoUrl: "", livello: "silver", descrizione: "Vedere bene, vivere meglio." },
    { id: "sp-7", nome: "Pizzeria Antica Tradizione", logoUrl: "", livello: "silver", descrizione: "Il forno a legna del centro storico." },
    { id: "sp-8", nome: "Palestra Titan Gym", logoUrl: "", livello: "silver", descrizione: "Preparazione atletica ufficiale della Lega." },
  ];

  // ---- news / comunicati ----
  const scafati = squadre.find((s) => s.id === "scafati-veterani")!;
  const sanMarzano = squadre.find((s) => s.id === "san-marzano-real")!;
  const articoli: Articolo[] = [
    {
      id: "art-1",
      slug: "apertura-giornata-12-derby-agro",
      titolo: "Giornata 12: tutto pronto per il derby dell'Agro al Santa Teresa",
      sommario: "Si apre oggi la dodicesima giornata di campionato: riflettori puntati sul big match della sera.",
      contenuto:
        "La Lega Calcio Over 40 torna in campo per la dodicesima giornata di andata e ritorno. Il Campo Sportivo Santa Teresa ospiterà tre delle quattro sfide in programma, con il match clou in serata che promette spettacolo. La classifica resta cortissima al vertice e ogni punto pesa come un macigno in vista del rush finale di stagione.",
      copertinaUrl: "",
      categoria: "articolo",
      autore: "Redazione Lega",
      pubblicatoIl: new Date("2026-07-17T08:00:00+02:00").toISOString(),
      in_evidenza: true,
    },
    {
      id: "art-2",
      slug: "comunicato-ufficiale-regolamento-disciplinare",
      titolo: "Comunicato Ufficiale n.14: aggiornamento regolamento disciplinare",
      sommario: "Il Giudice Sportivo della Lega comunica le decisioni relative alla undicesima giornata.",
      contenuto:
        "Si comunica che, a seguito degli eventi della undicesima giornata, il Giudice Sportivo ha deliberato le seguenti sanzioni disciplinari. Restano ferme le ammende societarie per comportamento scorretto del pubblico. Si ricorda a tutte le squadre l'obbligo di consegna della distinta 30 minuti prima del calcio d'inizio.",
      copertinaUrl: "",
      categoria: "comunicato",
      autore: "Giudice Sportivo",
      pubblicatoIl: new Date("2026-07-14T12:00:00+02:00").toISOString(),
    },
    {
      id: "art-3",
      slug: `intervista-capitano-${scafati.slug}`,
      titolo: `Intervista esclusiva: il capitano dello ${scafati.nomeBreve} si racconta`,
      sommario: "Passione, sacrificio e amore per la maglia: la storia di chi non ha mai smesso di giocare.",
      contenuto:
        "Abbiamo incontrato il capitano dello Scafati Veterani per parlare di una carriera lunga vent'anni nella Lega. «Il calcio Over 40 non è un ripiego, è la dimostrazione che la passione non ha età. Ogni domenica indossare questa maglia è un privilegio», ha dichiarato il capitano ai nostri microfoni.",
      copertinaUrl: "",
      categoria: "articolo",
      autore: "Redazione Lega",
      pubblicatoIl: new Date("2026-07-12T10:00:00+02:00").toISOString(),
      squadreCorrelate: [scafati.id],
    },
    {
      id: "art-4",
      slug: "calendario-fase-finale-stagione",
      titolo: "Diramato il calendario della fase finale: si chiude il 2 agosto",
      sommario: "Comunicate le date delle ultime tre giornate di campionato e della premiazione finale.",
      contenuto:
        "La Segreteria della Lega comunica il calendario definitivo delle ultime giornate. Il campionato si concluderà il 2 agosto con la cerimonia di premiazione al Campo Sportivo Santa Teresa, a seguire festa conclusiva aperta a tutti i tesserati e alle famiglie.",
      copertinaUrl: "",
      categoria: "comunicato",
      autore: "Segreteria Lega",
      pubblicatoIl: new Date("2026-07-09T09:00:00+02:00").toISOString(),
    },
    {
      id: "art-5",
      slug: `sorpresa-${sanMarzano.slug}-stagione`,
      titolo: `La cavalcata del ${sanMarzano.nomeBreve}: come nasce la sorpresa della stagione`,
      sommario: "Analisi tattica della squadra rivelazione del torneo, tra pressing alto e gol nel finale.",
      contenuto:
        "Nessuno se lo aspettava a inizio stagione, eppure il Real San Marzano si è issato nelle zone alte della classifica con un gioco moderno e propositivo. Merito di un blocco difensivo solido e di un centrocampo che recupera un numero impressionante di palloni a partita.",
      copertinaUrl: "",
      categoria: "articolo",
      autore: "Redazione Lega",
      pubblicatoIl: new Date("2026-07-06T16:30:00+02:00").toISOString(),
      squadreCorrelate: [sanMarzano.id],
    },
    {
      id: "art-6",
      slug: "regolamento-fair-play-premio",
      titolo: "Premio Fair Play: la classifica aggiornata a metà stagione",
      sommario: "Meno cartellini, più sportività: ecco chi guida la speciale graduatoria disciplinare.",
      contenuto:
        "La Lega premia da sempre lo spirito sportivo: al termine della stagione la squadra con il minor numero di sanzioni disciplinari riceverà il Trofeo Fair Play, simbolo dei valori che animano il campionato Over 40 fin dalla sua fondazione.",
      copertinaUrl: "",
      categoria: "articolo",
      autore: "Redazione Lega",
      pubblicatoIl: new Date("2026-07-03T09:00:00+02:00").toISOString(),
    },
  ];

  // ---- media ----
  const albumMedia: AlbumMedia[] = [
    {
      id: "alb-1",
      titolo: "Giornata 11 — gli scatti più belli",
      copertinaUrl: "",
      data: new Date("2026-07-10T20:00:00+02:00").toISOString(),
      tipo: "foto",
      itemsUrls: Array.from({ length: 8 }).map(() => ({ url: "", tipo: "foto" as const })),
    },
    {
      id: "alb-2",
      titolo: "Best goal del mese di Giugno",
      copertinaUrl: "",
      data: new Date("2026-06-30T21:00:00+02:00").toISOString(),
      tipo: "video",
      itemsUrls: Array.from({ length: 5 }).map(() => ({ url: "", tipo: "video" as const })),
    },
    {
      id: "alb-3",
      titolo: `${scafati.nomeBreve} — dietro le quinte`,
      copertinaUrl: "",
      data: new Date("2026-06-20T18:00:00+02:00").toISOString(),
      tipo: "foto",
      squadraId: scafati.id,
      itemsUrls: Array.from({ length: 10 }).map(() => ({ url: "", tipo: "foto" as const })),
    },
    {
      id: "alb-4",
      titolo: "Cerimonia inaugurale stagione 2025/2026",
      copertinaUrl: "",
      data: new Date("2026-05-01T19:00:00+02:00").toISOString(),
      tipo: "foto",
      itemsUrls: Array.from({ length: 12 }).map(() => ({ url: "", tipo: "foto" as const })),
    },
  ];

  // ---- premi settimanali (ultime 3 giornate concluse) ----
  const premiSettimanali: PremioSettimanale[] = [];
  [11, 10, 9].forEach((g) => {
    const matches = partite.filter((p) => p.giornata === g);
    const best = matches[0];
    if (best?.mvpGiocatoreId) {
      premiSettimanali.push({
        id: `premio-mvp-${g}`,
        giornata: g,
        stagioneId: stagioneAttuale.id,
        tipo: "mvp_giornata",
        giocatoreId: best.mvpGiocatoreId,
        motivazione: "Prestazione decisiva per la vittoria della propria squadra.",
      });
    }
    const migliore = matches.reduce((acc, m) => (m.golCasa + m.golTrasferta > (acc?.golCasa ?? 0) + (acc?.golTrasferta ?? 0) ? m : acc), matches[0]);
    if (migliore) {
      premiSettimanali.push({
        id: `premio-partita-${g}`,
        giornata: g,
        stagioneId: stagioneAttuale.id,
        tipo: "partita_della_settimana",
        partitaId: migliore.id,
        motivazione: "Il match più spettacolare della giornata, con gol e ribaltoni fino al triplice fischio.",
      });
    }
  });

  // ---- albo d'oro ----
  const alboOro: VoceAlboOro[] = [
    {
      stagioneId: stagionePrec1.id,
      squadraCampioneId: "scafati-veterani",
      capocannoniereId: teamById.get("scafati-veterani")!.roster.find((p) => p.ruolo === "Attaccante")!.id,
      capocannoniereGoal: 27,
      mvpStagioneId: teamById.get("scafati-veterani")!.roster[0].id,
      miglioreDifesaSquadraId: "sarno-storico",
      fairPlaySquadraId: "cava-metelliana",
    },
    {
      stagioneId: stagionePrec2.id,
      squadraCampioneId: "sarno-storico",
      capocannoniereId: teamById.get("pompei-scavi")!.roster.find((p) => p.ruolo === "Attaccante")!.id,
      capocannoniereGoal: 24,
      mvpStagioneId: teamById.get("sarno-storico")!.roster[0].id,
      miglioreDifesaSquadraId: "scafati-veterani",
      fairPlaySquadraId: "angri-united",
    },
  ];

  return {
    stagioni: [stagioneAttuale, stagionePrec1, stagionePrec2],
    stagioneAttualeId: stagioneAttuale.id,
    squadre,
    giocatori,
    partite,
    classifica,
    articoli,
    albumMedia,
    sponsor,
    premiSettimanali,
    alboOro,
  };
}
