import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { erroreApi } from "@/lib/api-error";
import { generaComunicatoGiornata } from "@/lib/comunicato";
import { revalidateNews } from "@/lib/revalidate";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { aggiornaArticolo, creaArticolo, getStore } from "@/lib/store/file-store";
import type { Articolo } from "@/lib/types";

// ============================================================================
// COMUNICATO UFFICIALE DI GIORNATA
// ----------------------------------------------------------------------------
// L'organizzatore non compila nulla: il testo si compone dai dati già in
// archivio (risultati, classifica, marcatori, cartellini, diffide,
// squalifiche). Con `anteprima: true` la route restituisce solo il testo,
// senza pubblicare, così il comunicato si può leggere prima di metterlo online.
//
// Rigenerare la stessa giornata aggiorna l'articolo esistente invece di
// crearne un secondo: lo slug è deterministico (comunicato-giornata-N), quindi
// dopo aver corretto un tabellino basta premere di nuovo Genera.
// ============================================================================

export async function POST(request: Request) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await request.json().catch(() => ({}));
  const giornata = Number(body.giornata);
  if (!Number.isInteger(giornata) || giornata < 1) {
    return NextResponse.json({ error: "Giornata non valida." }, { status: 400 });
  }

  try {
    const store = await getStore();
    const comunicato = generaComunicatoGiornata(store, giornata);

    if (body.anteprima) return NextResponse.json(comunicato);

    const slug = `comunicato-giornata-${giornata}`;
    const esistente = store.articoli.find((a) => a.slug === slug);

    const campi = {
      titolo: comunicato.titolo,
      sommario: comunicato.sommario,
      contenuto: comunicato.contenuto,
      categoria: "comunicato" as const,
      autore: "Giudice Sportivo",
      squadreCorrelate: comunicato.squadreCoinvolte,
    };

    const articolo: Articolo = esistente
      ? ((await aggiornaArticolo(esistente.id, { ...campi, pubblicatoIl: new Date().toISOString() })) ?? esistente)
      : await creaArticolo({
          id: `articolo-${randomUUID()}`,
          slug,
          copertinaUrl: "",
          pubblicatoIl: new Date().toISOString(),
          in_evidenza: false,
          ...campi,
        });

    revalidateNews(slug);
    return NextResponse.json({ ...comunicato, articolo, aggiornato: Boolean(esistente) }, { status: esistente ? 200 : 201 });
  } catch (err) {
    return erroreApi(err, "Impossibile generare il comunicato.");
  }
}
