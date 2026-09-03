import type { EventoPartita, Giocatore, Partita } from "@/lib/types";

// ============================================================================
// MOTORE DISCIPLINARE — impianto FIGC/LND
// ----------------------------------------------------------------------------
// Qui non si "mostra il totale dei cartellini": si applica un regolamento.
// Le regole sono dati (RegolamentoDisciplinare), non condizioni sparse nel
// codice, così l'organizzatore può allinearle al Comunicato Ufficiale della
// propria competizione senza che nessuno debba riscrivere la logica.
//
// I default riproducono l'impianto dei campionati dilettantistici FIGC/LND:
//
//   1. CUMULO DI AMMONIZIONI — la squalifica di una giornata scatta al
//      raggiungimento della quarta ammonizione e successivamente ogni quattro.
//      Il conteggio non si azzera a fine ciclo: prosegue per tutta la stagione,
//      quindi l'8ª, la 12ª... ammonizione fanno scattare una nuova giornata.
//   2. DIFFIDA — è diffidato chi si trova a una sola ammonizione dalla
//      squalifica, cioè a quota 3, 7, 11... È uno stato calcolato, non un
//      elenco da compilare a mano.
//   3. DOPPIA AMMONIZIONE — l'espulsione per somma di ammonizioni nella stessa
//      gara comporta una giornata di squalifica, e i due gialli che l'hanno
//      determinata NON entrano nel computo del cumulo: sono assorbiti dal
//      provvedimento di espulsione.
//   4. ESPULSIONE DIRETTA — minimo edittale di una giornata. Il Giudice
//      Sportivo può aggravarla: lo fa inserendo un provvedimento manuale
//      dall'area organizzatore, che si somma a quello automatico.
//   5. RECIDIVA — dalla terza espulsione stagionale in poi la sanzione base
//      è aumentata di una giornata.
//
// Ogni squalifica automatica si sconta dalla giornata successiva a quella in
// cui è maturata l'infrazione.
// ============================================================================

export interface RegolamentoDisciplinare {
  /** Ammonizioni che fanno scattare una giornata di squalifica (e ogni quante si ripete il ciclo). */
  ammonizioniPerSqualifica: number;
  /** Giornate di squalifica per espulsione diretta (minimo edittale). */
  giornateEspulsioneDiretta: number;
  /** Giornate di squalifica per espulsione da doppia ammonizione. */
  giornateDoppiaAmmonizione: number;
  /**
   * Se i due gialli che hanno prodotto l'espulsione contino anche nel cumulo.
   * Nell'impianto FIGC no: l'espulsione li assorbe.
   */
  ammonizioniDoppiaNelCumulo: boolean;
  /** Da quale espulsione stagionale in poi scatta l'aggravante per recidiva (0 = mai). */
  recidivaDallaEspulsione: number;
  /** Giornate aggiuntive applicate in caso di recidiva. */
  giornateAggravanteRecidiva: number;
}

export const REGOLAMENTO_FIGC_DILETTANTI: RegolamentoDisciplinare = {
  ammonizioniPerSqualifica: 4,
  giornateEspulsioneDiretta: 1,
  giornateDoppiaAmmonizione: 1,
  ammonizioniDoppiaNelCumulo: false,
  recidivaDallaEspulsione: 3,
  giornateAggravanteRecidiva: 1,
};

export type MotivoAutomatico = "somma_ammonizioni" | "doppia_ammonizione" | "espulsione";

/** Provvedimento dedotto dal regolamento, non inserito da nessuno. */
export interface SqualificaAutomatica {
  giocatoreId: string;
  squadraId: string;
  motivo: MotivoAutomatico;
  giornate: number;
  /** Giornata della gara in cui è maturata l'infrazione. */
  giornataOrigine: number;
  /** Prima giornata da scontare: sempre quella successiva all'infrazione. */
  giornataDa: number;
  partitaId: string;
  dettaglio: string;
}

export interface PosizioneDisciplinare {
  giocatoreId: string;
  squadraId: string;
  /** Ammonizioni valide ai fini del cumulo (esclusi i gialli assorbiti da una doppia ammonizione). */
  ammonizioni: number;
  /** Ammonizioni complessive ricevute, comprese quelle assorbite: è il dato del referto. */
  ammonizioniTotali: number;
  espulsioni: number;
  espulsioniDirette: number;
  doppieAmmonizioni: number;
  /** Quante ammonizioni mancano alla prossima squalifica per cumulo. */
  ammonizioniVersoSqualifica: number;
  diffidato: boolean;
  /** Giornate totali di squalifica maturate automaticamente in stagione. */
  giornateSqualificaAutomatiche: number;
  squalifiche: SqualificaAutomatica[];
}

/** Cartellino singolo, con la gara che lo ha prodotto: alimenta il comunicato di giornata. */
export interface CartellinoGiornata {
  giocatoreId: string;
  squadraId: string;
  partitaId: string;
  giornata: number;
  tipo: "ammonizione" | "doppia_ammonizione" | "espulsione";
  minuto: number;
}

function eventiGiocatore(partita: Partita, giocatoreId: string): EventoPartita[] {
  return partita.eventi.filter((e) => e.giocatoreId === giocatoreId);
}

/**
 * Applica il regolamento a tutte le gare concluse passate, in ordine di
 * giornata: l'ordine conta, perché una squalifica si sconta dalla giornata
 * successiva a quella in cui è maturata e la recidiva dipende da quante
 * espulsioni sono già state comminate.
 */
export function calcolaPosizioniDisciplinari(
  partite: Partita[],
  giocatori: Giocatore[],
  regolamento: RegolamentoDisciplinare = REGOLAMENTO_FIGC_DILETTANTI
): PosizioneDisciplinare[] {
  const concluse = [...partite]
    .filter((p) => p.stato === "conclusa")
    .sort((a, b) => a.giornata - b.giornata || new Date(a.dataOra).getTime() - new Date(b.dataOra).getTime());

  const soglia = Math.max(1, regolamento.ammonizioniPerSqualifica);
  const posizioni = new Map<string, PosizioneDisciplinare>();

  const mappaGiocatori = new Map(giocatori.map((g) => [g.id, g]));
  const nomeDi = (id: string) => {
    const g = mappaGiocatori.get(id);
    return g ? `${g.nome} ${g.cognome}` : "Giocatore";
  };

  const tocca = (giocatoreId: string, squadraId: string): PosizioneDisciplinare => {
    const esistente = posizioni.get(giocatoreId);
    if (esistente) return esistente;
    const nuova: PosizioneDisciplinare = {
      giocatoreId,
      squadraId,
      ammonizioni: 0,
      ammonizioniTotali: 0,
      espulsioni: 0,
      espulsioniDirette: 0,
      doppieAmmonizioni: 0,
      ammonizioniVersoSqualifica: soglia,
      diffidato: false,
      giornateSqualificaAutomatiche: 0,
      squalifiche: [],
    };
    posizioni.set(giocatoreId, nuova);
    return nuova;
  };

  concluse.forEach((partita) => {
    // Giocatori toccati da almeno un cartellino in questa gara.
    const coinvolti = new Set(
      partita.eventi
        .filter((e) => e.giocatoreId && (e.tipo === "ammonizione" || e.tipo === "secondo_giallo" || e.tipo === "espulsione"))
        .map((e) => e.giocatoreId as string)
    );

    coinvolti.forEach((giocatoreId) => {
      const eventi = eventiGiocatore(partita, giocatoreId);
      const squadraId = mappaGiocatori.get(giocatoreId)?.squadraId ?? eventi[0]?.squadraId ?? "";
      const pos = tocca(giocatoreId, squadraId);

      const gialli = eventi.filter((e) => e.tipo === "ammonizione").length;
      const doppia = eventi.some((e) => e.tipo === "secondo_giallo");
      const dirette = eventi.filter((e) => e.tipo === "espulsione").length;

      pos.ammonizioniTotali += gialli + (doppia ? 1 : 0);

      // 3. I gialli che hanno prodotto l'espulsione non entrano nel cumulo.
      const gialliNelCumulo = doppia && !regolamento.ammonizioniDoppiaNelCumulo ? 0 : gialli + (doppia ? 1 : 0);

      // 1. Cumulo: una giornata ogni volta che si tocca un multiplo della soglia.
      for (let i = 0; i < gialliNelCumulo; i++) {
        pos.ammonizioni += 1;
        if (pos.ammonizioni % soglia === 0) {
          pos.squalifiche.push({
            giocatoreId,
            squadraId,
            motivo: "somma_ammonizioni",
            giornate: 1,
            giornataOrigine: partita.giornata,
            giornataDa: partita.giornata + 1,
            partitaId: partita.id,
            dettaglio: `${nomeDi(giocatoreId)}: ${pos.ammonizioni}ª ammonizione, squalifica per somma di ammonizioni.`,
          });
          pos.giornateSqualificaAutomatiche += 1;
        }
      }

      // 3. Doppia ammonizione: una giornata.
      if (doppia) {
        pos.doppieAmmonizioni += 1;
        pos.espulsioni += 1;
        pos.squalifiche.push({
          giocatoreId,
          squadraId,
          motivo: "doppia_ammonizione",
          giornate: regolamento.giornateDoppiaAmmonizione,
          giornataOrigine: partita.giornata,
          giornataDa: partita.giornata + 1,
          partitaId: partita.id,
          dettaglio: `${nomeDi(giocatoreId)}: espulsione per seconda ammonizione.`,
        });
        pos.giornateSqualificaAutomatiche += regolamento.giornateDoppiaAmmonizione;
      }

      // 4-5. Espulsione diretta, con aggravante per recidiva.
      for (let i = 0; i < dirette; i++) {
        pos.espulsioni += 1;
        pos.espulsioniDirette += 1;
        const recidiva =
          regolamento.recidivaDallaEspulsione > 0 && pos.espulsioni >= regolamento.recidivaDallaEspulsione;
        const giornate = regolamento.giornateEspulsioneDiretta + (recidiva ? regolamento.giornateAggravanteRecidiva : 0);
        pos.squalifiche.push({
          giocatoreId,
          squadraId,
          motivo: "espulsione",
          giornate,
          giornataOrigine: partita.giornata,
          giornataDa: partita.giornata + 1,
          partitaId: partita.id,
          dettaglio: recidiva
            ? `${nomeDi(giocatoreId)}: espulsione diretta, ${pos.espulsioni}ª stagionale — sanzione aggravata per recidiva.`
            : `${nomeDi(giocatoreId)}: espulsione diretta.`,
        });
        pos.giornateSqualificaAutomatiche += giornate;
      }
    });
  });

  // 2. Diffida: stato finale, a una sola ammonizione dalla prossima squalifica.
  posizioni.forEach((pos) => {
    const nelCiclo = pos.ammonizioni % soglia;
    pos.ammonizioniVersoSqualifica = soglia - nelCiclo;
    pos.diffidato = pos.ammonizioni > 0 && nelCiclo === soglia - 1;
  });

  return [...posizioni.values()].sort(
    (a, b) => b.espulsioni - a.espulsioni || b.ammonizioni - a.ammonizioni
  );
}

/** Tutti i provvedimenti automatici, in ordine di giornata. */
export function squalificheAutomatiche(posizioni: PosizioneDisciplinare[]): SqualificaAutomatica[] {
  return posizioni
    .flatMap((p) => p.squalifiche)
    .sort((a, b) => a.giornataOrigine - b.giornataOrigine || a.giocatoreId.localeCompare(b.giocatoreId));
}

/** Cartellini estratti da una singola giornata, per la sezione disciplinare del comunicato. */
export function cartelliniDiGiornata(partite: Partita[], giornata: number): CartellinoGiornata[] {
  return partite
    .filter((p) => p.giornata === giornata && p.stato === "conclusa")
    .flatMap((p) =>
      p.eventi
        .filter((e) => e.giocatoreId && (e.tipo === "ammonizione" || e.tipo === "secondo_giallo" || e.tipo === "espulsione"))
        .map((e): CartellinoGiornata => ({
          giocatoreId: e.giocatoreId as string,
          squadraId: e.squadraId,
          partitaId: p.id,
          giornata,
          tipo:
            e.tipo === "ammonizione" ? "ammonizione" : e.tipo === "secondo_giallo" ? "doppia_ammonizione" : "espulsione",
          minuto: e.minuto,
        }))
    )
    .sort((a, b) => a.minuto - b.minuto);
}
