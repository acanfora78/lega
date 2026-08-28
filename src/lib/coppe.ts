import type { FasciaCoppa, ZonaCoppa } from "@/lib/types";

// ============================================================================
// PIAZZAMENTI COPPE
// ----------------------------------------------------------------------------
// Le ultime due posizioni della classifica restano sempre fuori da ogni coppa.
// Tutte le altre ricevono una fascia; le prime posizioni vanno a Champions,
// Europa e Conference (nell'ordine), il resto entra in Coppa Italia.
//
// Il numero di squadre della Lega cambia di stagione in stagione, quindi le
// ampiezze non sono costanti: si parte dagli obiettivi "pieni" (4/1/1, sul
// modello Serie A) e si restringono in ordine inverso di prestigio finché non
// entrano nei posti realmente disponibili. Così una lega da 6 squadre non
// finisce per qualificare tutti alla Champions, e una da 20 mantiene lo
// schema classico.
// ============================================================================

const OBIETTIVI: { zona: Exclude<ZonaCoppa, "coppa_italia" | "esclusa">; posti: number }[] = [
  { zona: "champions", posti: 4 },
  { zona: "europa", posti: 1 },
  { zona: "conference", posti: 1 },
];

/** Posizioni finali sempre escluse dalle coppe. */
export const POSIZIONI_ESCLUSE = 2;

export const FASCE: Record<ZonaCoppa, FasciaCoppa> = {
  champions: {
    zona: "champions",
    etichetta: "Champions League",
    etichettaBreve: "UCL",
    colore: "var(--primary-glow)",
    descrizione: "Qualificazione alla Champions League della Lega",
  },
  europa: {
    zona: "europa",
    etichetta: "Europa League",
    etichettaBreve: "UEL",
    colore: "#5b9dff",
    descrizione: "Qualificazione all'Europa League della Lega",
  },
  conference: {
    zona: "conference",
    etichetta: "Conference League",
    etichettaBreve: "UECL",
    colore: "#38d4c4",
    descrizione: "Qualificazione alla Conference League della Lega",
  },
  coppa_italia: {
    zona: "coppa_italia",
    etichetta: "Coppa Italia",
    etichettaBreve: "CI",
    colore: "var(--gold)",
    descrizione: "Ammessa alla Coppa Italia della Lega",
  },
  esclusa: {
    zona: "esclusa",
    etichetta: "Esclusa dalle coppe",
    etichettaBreve: "—",
    colore: "var(--danger)",
    descrizione: "Le ultime due classificate non accedono ad alcuna coppa",
  },
};

/**
 * Calcola quante posizioni spettano a ciascuna zona per una classifica di
 * `totaleSquadre` squadre. Le ultime due sono sempre escluse; ciò che avanza
 * viene distribuito dall'alto.
 */
export function calcolaAmpiezzeCoppe(totaleSquadre: number): Record<ZonaCoppa, number> {
  const ampiezze: Record<ZonaCoppa, number> = {
    champions: 0,
    europa: 0,
    conference: 0,
    coppa_italia: 0,
    esclusa: Math.min(POSIZIONI_ESCLUSE, totaleSquadre),
  };

  // Posti che possono ricevere una coppa: tutti tranne le ultime due.
  let disponibili = Math.max(0, totaleSquadre - ampiezze.esclusa);
  if (disponibili === 0) return ampiezze;

  // Le coppe europee non possono occupare l'intera classifica: alla Coppa
  // Italia va sempre lasciato almeno un posto quando ce n'è più di uno.
  let budgetEuropee = disponibili > 1 ? disponibili - 1 : 0;

  for (const { zona, posti } of OBIETTIVI) {
    const assegnati = Math.min(posti, budgetEuropee);
    ampiezze[zona] = assegnati;
    budgetEuropee -= assegnati;
    disponibili -= assegnati;
  }

  ampiezze.coppa_italia = disponibili;
  return ampiezze;
}

/** Zona di qualificazione di una posizione (1-based) in una classifica di N squadre. */
export function zonaPerPosizione(posizione: number, totaleSquadre: number): ZonaCoppa {
  const ampiezze = calcolaAmpiezzeCoppe(totaleSquadre);
  if (posizione > totaleSquadre - ampiezze.esclusa) return "esclusa";

  let soglia = 0;
  for (const zona of ["champions", "europa", "conference"] as const) {
    soglia += ampiezze[zona];
    if (posizione <= soglia) return zona;
  }
  return "coppa_italia";
}

/** Fasce effettivamente presenti in classifica, per costruire la legenda. */
export function fascePresenti(totaleSquadre: number): (FasciaCoppa & { posizioni: string })[] {
  const ampiezze = calcolaAmpiezzeCoppe(totaleSquadre);
  const risultato: (FasciaCoppa & { posizioni: string })[] = [];

  let cursore = 1;
  for (const zona of ["champions", "europa", "conference", "coppa_italia"] as const) {
    const ampiezza = ampiezze[zona];
    if (ampiezza <= 0) continue;
    risultato.push({ ...FASCE[zona], posizioni: intervallo(cursore, cursore + ampiezza - 1) });
    cursore += ampiezza;
  }
  if (ampiezze.esclusa > 0) {
    risultato.push({ ...FASCE.esclusa, posizioni: intervallo(cursore, totaleSquadre) });
  }
  return risultato;
}

function intervallo(da: number, a: number) {
  return da === a ? `${da}` : `${da}–${a}`;
}
