import { NextResponse } from "next/server";
import { ConflittoScritturaError } from "@/lib/store/file-store";

/**
 * Converte un errore imprevisto (tipicamente una scrittura Supabase fallita:
 * sessione scaduta, RLS, rete) in una risposta JSON che il client può
 * mostrare per davvero, invece di un 500 generico che fa fallire anche il
 * parsing lato client e nasconde la causa reale.
 *
 * ConflittoScritturaError (due scritture ravvicinate sugli stessi dati) è un
 * caso a sé: non è un errore imprevisto del server, è un normale conflitto
 * di concorrenza — risponde 409, non 500, così chi chiama può distinguerlo e
 * mostrare "ricarica e riprova" invece di un errore generico.
 */
export function erroreApi(err: unknown, messaggioDefault: string) {
  if (err instanceof ConflittoScritturaError) {
    return NextResponse.json({ error: err.message }, { status: 409 });
  }
  console.error(messaggioDefault, err);
  const messaggio = err instanceof Error && err.message ? err.message : messaggioDefault;
  return NextResponse.json({ error: messaggio }, { status: 500 });
}
