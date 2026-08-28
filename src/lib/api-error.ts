import { NextResponse } from "next/server";

/**
 * Converte un errore imprevisto (tipicamente una scrittura Supabase fallita:
 * sessione scaduta, RLS, rete) in una risposta JSON che il client può
 * mostrare per davvero, invece di un 500 generico che fa fallire anche il
 * parsing lato client e nasconde la causa reale.
 */
export function erroreApi(err: unknown, messaggioDefault: string) {
  console.error(messaggioDefault, err);
  const messaggio = err instanceof Error && err.message ? err.message : messaggioDefault;
  return NextResponse.json({ error: messaggio }, { status: 500 });
}
