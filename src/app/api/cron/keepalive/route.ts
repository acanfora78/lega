import { NextResponse } from "next/server";
import { createReadOnlyClient } from "@/lib/supabase/read-only";

// ============================================================================
// KEEP-ALIVE DEL DATABASE
// ----------------------------------------------------------------------------
// Un progetto Supabase sul piano gratuito va in pausa dopo alcuni giorni senza
// richieste: da quel momento l'app non legge né salva più nulla finché
// qualcuno non lo riattiva a mano dalla dashboard. È successo davvero dopo
// qualche settimana senza uso dell'area organizzatore.
//
// Vercel chiama questa route ogni giorno (vedi vercel.json, "crons"): una
// lettura leggera basta a far risultare il progetto attivo. Sola lettura,
// nessun dato modificato. Se CRON_SECRET è impostata su Vercel, Vercel la
// invia da sé nell'header Authorization e qui si rifiutano le altre chiamate.
// ============================================================================

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const { error } = await createReadOnlyClient().from("lega_store").select("id").eq("id", 1).maybeSingle();
    if (error) throw error;
    return NextResponse.json({ ok: true, at: new Date().toISOString() });
  } catch (err) {
    console.error("[keepalive] Database non raggiungibile", err);
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
