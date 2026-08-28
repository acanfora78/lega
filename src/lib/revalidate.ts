import { revalidatePath } from "next/cache";

// ============================================================================
// REVALIDAZIONE MIRATA
// ----------------------------------------------------------------------------
// Prima ogni route admin chiamava `revalidatePath("/", "layout")`: invalida il
// layout radice, e quindi OGNI pagina dell'app — anche quelle che non
// mostrano affatto la risorsa appena scritta (registrare una squalifica
// svuotava la cache di /news, /media, /campionati-passati, ogni scheda
// giocatore...). Il prossimo visitatore su una qualsiasi di quelle pagine,
// dopo QUALUNQUE scrittura admin, pescava una cache vuota e otteneva un
// render dinamico completo invece di servire la pagina già pronta.
//
// Qui sotto c'è, risorsa per risorsa, l'elenco reale delle pagine pubbliche
// che la mostrano: solo quelle vengono invalidate. Le pagine di dettaglio
// dinamiche (/squadre/[slug], /giocatori/[id], /partite/[id], /news/[slug])
// vengono invalidate quando la route conosce già lo slug/id coinvolto — un
// path letterale, senza ambiguità sul funzionamento di `revalidatePath`.
// Quando non lo conosce (es. la scheda squadra di un giocatore appena
// modificato) resta il tetto di sicurezza `revalidate = 300` del layout
// radice: al più 5 minuti di ritardo, non un'invalidazione totale ad ogni
// click.
//
// Pagine escluse di proposito perché non leggono mai lo store live:
// /campionati-passati*, /hall-of-fame (solo archivio storico), /campo (solo
// contenuto statico), /ricerca (fa fetch live lato client via /api/ricerca,
// non serve invalidare una pagina cacheata che non esiste), /admin/* (sempre
// dinamiche: leggono cookies() per l'autenticazione, quindi non sono mai
// servite dalla cache in primo luogo — si aggiornano da sole via
// router.refresh() sul client).
// ============================================================================

function revalidateMany(paths: string[]) {
  paths.forEach((p) => revalidatePath(p));
}

export function revalidateSquadre(slug?: string) {
  revalidateMany(["/", "/squadre", "/classifica", "/statistiche", "/partite", "/disciplinare"]);
  if (slug) revalidatePath(`/squadre/${slug}`);
}

export function revalidateGiocatori(opts: { giocatoreId?: string; squadraSlug?: string } = {}) {
  revalidateMany(["/", "/squadre", "/statistiche", "/disciplinare"]);
  if (opts.giocatoreId) revalidatePath(`/giocatori/${opts.giocatoreId}`);
  if (opts.squadraSlug) revalidatePath(`/squadre/${opts.squadraSlug}`);
}

export function revalidatePartite(partitaId?: string) {
  revalidateMany(["/", "/partite", "/classifica", "/statistiche", "/disciplinare", "/squadre"]);
  if (partitaId) revalidatePath(`/partite/${partitaId}`);
}

export function revalidateNews(slug?: string) {
  revalidateMany(["/", "/news", "/disciplinare"]);
  if (slug) revalidatePath(`/news/${slug}`);
}

export function revalidateMedia() {
  revalidateMany(["/", "/media"]);
}

export function revalidateSponsor() {
  revalidateMany(["/", "/squadre"]);
}

export function revalidateSqualifiche() {
  // Registrare una squalifica può pubblicare anche un comunicato disciplinare
  // (categoria "news"), quindi le stesse pagine di revalidateNews.
  revalidateMany(["/", "/news", "/disciplinare"]);
}

/** Impostazioni della Lega (nome, stagione, contatti): compaiono ovunque compare l'etichetta stagione. */
export function revalidateImpostazioni() {
  revalidateMany(["/", "/classifica", "/statistiche", "/partite", "/squadre", "/disciplinare"]);
}

export function revalidateCompetizioni(slug?: string) {
  revalidateMany(["/", "/competizioni"]);
  if (slug) revalidatePath(`/competizioni/${slug}`);
}
