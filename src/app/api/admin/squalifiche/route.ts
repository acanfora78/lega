import { NextResponse } from "next/server";
import { erroreApi } from "@/lib/api-error";
import { revalidateSqualifiche } from "@/lib/revalidate";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { creaArticolo, creaSqualifica, getStore } from "@/lib/store/file-store";
import type { Articolo, MotivoSqualifica, Squalifica } from "@/lib/types";
import { slugify } from "@/lib/utils";

const MOTIVI: MotivoSqualifica[] = ["espulsione", "somma_ammonizioni", "condotta", "reclamo", "altro"];

const ETICHETTE_MOTIVO: Record<MotivoSqualifica, string> = {
  espulsione: "espulsione diretta",
  somma_ammonizioni: "somma di ammonizioni",
  condotta: "condotta antisportiva",
  reclamo: "accoglimento di reclamo",
  altro: "provvedimento del Giudice Sportivo",
};

export async function POST(request: Request) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await request.json();
  const giocatoreId = String(body.giocatoreId ?? "").trim();
  if (!giocatoreId) return NextResponse.json({ error: "Seleziona il giocatore squalificato." }, { status: 400 });

  const giornate = Number(body.giornate);
  if (!Number.isInteger(giornate) || giornate < 1) {
    return NextResponse.json({ error: "Le giornate di squalifica devono essere almeno 1." }, { status: 400 });
  }

  const store = await getStore();
  const giocatore = store.giocatori.find((g) => g.id === giocatoreId);
  if (!giocatore) return NextResponse.json({ error: "Giocatore non trovato." }, { status: 404 });

  const motivo: MotivoSqualifica = MOTIVI.includes(body.motivo) ? body.motivo : "altro";
  const giornataDa = Number.isInteger(Number(body.giornataDa)) && Number(body.giornataDa) > 0 ? Number(body.giornataDa) : 1;

  const squalifica: Squalifica = {
    id: `squalifica-${Date.now()}`,
    stagioneId: store.stagioneAttualeId,
    giocatoreId,
    squadraId: giocatore.squadraId,
    giornate,
    giornataDa,
    motivo,
    dettaglio: String(body.dettaglio ?? "").trim() || undefined,
    giornataOrigine: Number.isInteger(Number(body.giornataOrigine)) ? Number(body.giornataOrigine) : undefined,
    emessaIl: new Date().toISOString(),
  };

  try {
    // Il comunicato disciplinare è opzionale: si pubblica solo se richiesto,
    // così l'organizzatore può registrare un provvedimento senza annunciarlo
    // prima che sia definitivo.
    if (body.pubblicaComunicato) {
      const squadra = store.squadre.find((s) => s.id === giocatore.squadraId);
      const nomeCompleto = `${giocatore.nome} ${giocatore.cognome}`;
      const titolo = `Giudice Sportivo: ${giornate} ${giornate === 1 ? "giornata" : "giornate"} a ${nomeCompleto}`;
      const articolo: Articolo = {
        id: `articolo-${Date.now()}`,
        slug: slugify(`${titolo}-${squalifica.id}`),
        titolo,
        sommario: `${nomeCompleto}${squadra ? ` (${squadra.nomeBreve})` : ""} è squalificato per ${ETICHETTE_MOTIVO[motivo]}.`,
        contenuto: [
          `Il Giudice Sportivo ha inflitto ${giornate} ${giornate === 1 ? "giornata" : "giornate"} di squalifica a ${nomeCompleto}${squadra ? ` del ${squadra.nome}` : ""}, per ${ETICHETTE_MOTIVO[motivo]}.`,
          squalifica.dettaglio ? `\n\n${squalifica.dettaglio}` : "",
          `\n\nIl provvedimento decorre dalla giornata ${giornataDa}.`,
        ].join(""),
        copertinaUrl: "",
        categoria: "disciplinare",
        autore: "Giudice Sportivo",
        pubblicatoIl: new Date().toISOString(),
        squadreCorrelate: squadra ? [squadra.id] : undefined,
      };
      await creaArticolo(articolo);
      squalifica.articoloId = articolo.id;
    }

    await creaSqualifica(squalifica);
    revalidateSqualifiche();
    return NextResponse.json(squalifica, { status: 201 });
  } catch (err) {
    return erroreApi(err, "Impossibile registrare la squalifica.");
  }
}
