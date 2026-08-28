import { legaData } from "@/lib/mock";
import type { Giocatore } from "@/lib/types";

// ============================================================================
// PAGELLE — classifiche "Miglior giocatore" e "Miglior portiere"
// ----------------------------------------------------------------------------
// Entrambe derivano esclusivamente dai voti che l'organizzatore inserisce nel
// tabellino di ogni partita (Partita.voti). Nessun voto viene stimato o
// dedotto da altre statistiche: se l'organizzatore non ha votato, il giocatore
// semplicemente non compare.
// ============================================================================

/**
 * Numero minimo di partite votate per entrare in classifica. Senza una soglia,
 * chi ha un solo 8 scavalcherebbe chi ha una media di 7.5 su tutto il girone.
 */
export const PRESENZE_MINIME_PER_MEDIA = 3;

export interface VoceMediaVoto {
  giocatore: Giocatore;
  media: number;
  partiteVotate: number;
  votoMigliore: number;
}

async function mediePerGiocatore(): Promise<Map<string, { somma: number; conteggio: number; migliore: number }>> {
  const { partite, stagioneAttualeId } = await legaData();
  const accumulo = new Map<string, { somma: number; conteggio: number; migliore: number }>();

  partite
    .filter((p) => p.stagioneId === stagioneAttualeId && p.voti?.length)
    .forEach((p) => {
      p.voti!.forEach((v) => {
        const corrente = accumulo.get(v.giocatoreId) ?? { somma: 0, conteggio: 0, migliore: 0 };
        corrente.somma += v.voto;
        corrente.conteggio += 1;
        corrente.migliore = Math.max(corrente.migliore, v.voto);
        accumulo.set(v.giocatoreId, corrente);
      });
    });

  return accumulo;
}

async function classificaPerMedia(
  filtro: (g: Giocatore) => boolean,
  limit: number,
  presenzeMinime: number
): Promise<VoceMediaVoto[]> {
  const { giocatori } = await legaData();
  const accumulo = await mediePerGiocatore();

  return giocatori
    .filter(filtro)
    .map((giocatore) => {
      const dati = accumulo.get(giocatore.id);
      if (!dati || dati.conteggio === 0) return undefined;
      return {
        giocatore,
        media: dati.somma / dati.conteggio,
        partiteVotate: dati.conteggio,
        votoMigliore: dati.migliore,
      } satisfies VoceMediaVoto;
    })
    .filter((v): v is VoceMediaVoto => v !== undefined && v.partiteVotate >= presenzeMinime)
    .sort((a, b) => b.media - a.media || b.partiteVotate - a.partiteVotate)
    .slice(0, limit);
}

/** Classifica Miglior Giocatore: media voto di tutti i ruoli. */
export async function getClassificaMigliorGiocatore(limit = 20, presenzeMinime = PRESENZE_MINIME_PER_MEDIA) {
  return classificaPerMedia(() => true, limit, presenzeMinime);
}

/** Classifica Miglior Portiere: stessa media, ristretta ai portieri. */
export async function getClassificaMigliorPortiere(limit = 20, presenzeMinime = PRESENZE_MINIME_PER_MEDIA) {
  return classificaPerMedia((g) => g.ruolo === "Portiere", limit, presenzeMinime);
}

export interface PagellaPartita {
  giocatore: Giocatore;
  voto: number;
  nota?: string;
}

/** Voti di una singola partita, risolti sui giocatori, per il tabellino pubblico. */
export async function getPagelleDellaPartita(partitaId: string): Promise<PagellaPartita[]> {
  const { partite, giocatori } = await legaData();
  const partita = partite.find((p) => p.id === partitaId);
  if (!partita?.voti?.length) return [];

  const mappa = new Map(giocatori.map((g) => [g.id, g]));
  return partita.voti
    .map((v): PagellaPartita | undefined => {
      const giocatore = mappa.get(v.giocatoreId);
      return giocatore ? { giocatore, voto: v.voto, nota: v.nota } : undefined;
    })
    .filter((v): v is PagellaPartita => v !== undefined)
    .sort((a, b) => b.voto - a.voto);
}
