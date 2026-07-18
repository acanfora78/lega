import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Client per sole letture pubbliche (RLS: "lettura_pubblica" consente SELECT a
// chiunque). Non tocca i cookie della richiesta: usarlo per le letture invece
// del client autenticato (src/lib/supabase/server.ts, che chiama cookies())
// permette a Next.js di mettere in cache le pagine pubbliche invece di
// renderizzarle sempre dinamicamente. Le scritture restano sul client
// autenticato, perché devono passare dalla sessione dell'organizzatore per la
// RLS "scrittura_organizzatore".
export function createReadOnlyClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase non configurato: imposta NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return createSupabaseClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
