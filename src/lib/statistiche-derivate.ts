import type { Giocatore, Partita } from "@/lib/types";

// ============================================================================
// STATISTICHE GIOCATORE — derivate, mai immesse a mano
// ----------------------------------------------------------------------------
// Il campo `Giocatore.statistiche` è nato come dato da compilare a mano e non
// è mai stato scritto da nessuna route: le classifiche marcatori, assist,
// presenze e MVP che lo leggevano risultavano quindi sempre vuote, per quanti
// gol l'organizzatore inserisse nel tabellino.
//
// Qui la sorgente è una sola: gli eventi delle partite concluse — gli stessi
// che alimentano cronaca, classifica e giustizia sportiva. Inserito il
// risultato con i suoi eventi, ogni classifica dell'app si aggiorna da sé,
// senza nessun secondo inserimento e senza numeri che possano divergere.
// ============================================================================

export interface StatisticheDerivate {
  giocatoreId: string;
  squadraId: string;
  presenze: number;
  goal: number;
  /** Gol su rigore, già compresi in `goal`. */
  rigori: number;
  assist: number;
  autogoal: number;
  ammonizioni: number;
  espulsioni: number;
  mvp: number;
  /** Partite in cui il portiere non ha subito reti (solo per chi ha ruolo Portiere). */
  cleanSheet: number;
  golSubiti: number;
  partiteVotate: number;
  mediaVoto: number;
}

function vuota(giocatoreId: string, squadraId: string): StatisticheDerivate {
  return {
    giocatoreId,
    squadraId,
    presenze: 0,
    goal: 0,
    rigori: 0,
    assist: 0,
    autogoal: 0,
    ammonizioni: 0,
    espulsioni: 0,
    mvp: 0,
    cleanSheet: 0,
    golSubiti: 0,
    partiteVotate: 0,
    mediaVoto: 0,
  };
}

/**
 * Statistiche stagionali di ogni giocatore, ricavate dalle gare concluse
 * passate. Restituisce una voce per ogni giocatore presente in `giocatori`,
 * anche a zero: le classifiche filtrano poi ciò che serve.
 */
export function calcolaStatisticheDerivate(partite: Partita[], giocatori: Giocatore[]): Map<string, StatisticheDerivate> {
  const perGiocatore = new Map<string, StatisticheDerivate>(
    giocatori.map((g) => [g.id, vuota(g.id, g.squadraId)])
  );
  const ruoloDi = new Map(giocatori.map((g) => [g.id, g.ruolo]));
  const sommaVoti = new Map<string, number>();

  const tocca = (giocatoreId: string) => perGiocatore.get(giocatoreId);

  partite
    .filter((p) => p.stato === "conclusa")
    .forEach((partita) => {
      const presenti = new Set<string>();

      // Presenza: chi compare nella distinta compilata prima della gara, più —
      // anche senza distinta — chiunque abbia almeno un evento a referto. Il
      // calendario importato da CSV non porta formazioni, quindi senza questo
      // secondo criterio le gare vecchie non darebbero nessuna presenza.
      [...(partita.formazioneCasa ?? []), ...(partita.formazioneTrasferta ?? [])].forEach((v) =>
        presenti.add(v.giocatoreId)
      );

      partita.eventi.forEach((e) => {
        if (!e.giocatoreId) return;
        const voce = tocca(e.giocatoreId);
        if (!voce) return;
        presenti.add(e.giocatoreId);

        switch (e.tipo) {
          case "goal":
            voce.goal += 1;
            break;
          case "rigore_segnato":
            voce.goal += 1;
            voce.rigori += 1;
            break;
          case "autogoal":
            // L'autorete non è un gol del marcatore: resta contata a parte.
            voce.autogoal += 1;
            break;
          case "assist":
            voce.assist += 1;
            break;
          case "ammonizione":
            voce.ammonizioni += 1;
            break;
          case "secondo_giallo":
            voce.ammonizioni += 1;
            voce.espulsioni += 1;
            break;
          case "espulsione":
            voce.espulsioni += 1;
            break;
          default:
            break;
        }

        // Assist annotato sull'evento gol invece che come evento separato.
        if ((e.tipo === "goal" || e.tipo === "rigore_segnato") && e.assistGiocatoreId) {
          const assistman = tocca(e.assistGiocatoreId);
          if (assistman) {
            assistman.assist += 1;
            presenti.add(e.assistGiocatoreId);
          }
        }
      });

      if (partita.mvpGiocatoreId) {
        const mvp = tocca(partita.mvpGiocatoreId);
        if (mvp) {
          mvp.mvp += 1;
          presenti.add(partita.mvpGiocatoreId);
        }
      }

      partita.voti?.forEach((v) => {
        const voce = tocca(v.giocatoreId);
        if (!voce) return;
        voce.partiteVotate += 1;
        sommaVoti.set(v.giocatoreId, (sommaVoti.get(v.giocatoreId) ?? 0) + v.voto);
        presenti.add(v.giocatoreId);
      });

      presenti.forEach((giocatoreId) => {
        const voce = tocca(giocatoreId);
        if (!voce) return;
        voce.presenze += 1;

        if (ruoloDi.get(giocatoreId) !== "Portiere") return;
        const inCasa = voce.squadraId === partita.squadraCasaId;
        const inTrasferta = voce.squadraId === partita.squadraTrasfertaId;
        if (!inCasa && !inTrasferta) return;
        const subiti = inCasa ? partita.golTrasferta : partita.golCasa;
        voce.golSubiti += subiti;
        if (subiti === 0) voce.cleanSheet += 1;
      });
    });

  perGiocatore.forEach((voce, id) => {
    const somma = sommaVoti.get(id);
    voce.mediaVoto = voce.partiteVotate > 0 && somma !== undefined ? somma / voce.partiteVotate : 0;
  });

  return perGiocatore;
}
