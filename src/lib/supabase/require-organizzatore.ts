import { createClient } from "@/lib/supabase/server";

/**
 * Verifica che la richiesta provenga da un utente con ruolo "organizzatore".
 * Se Supabase non è configurato in questo ambiente, l'accesso viene negato
 * (fail closed): senza autenticazione reale non c'è modo di distinguere un
 * organizzatore da un visitatore qualunque, quindi l'area admin va tenuta
 * bloccata finché NEXT_PUBLIC_SUPABASE_URL/ANON_KEY non sono impostate.
 */
export async function requireOrganizzatore(): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { ok: false, status: 503, message: "Autenticazione non configurata: imposta le variabili Supabase per abilitare l'area organizzatore." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { ok: false, status: 401, message: "Accesso richiesto." };

    const ruolo = (user.app_metadata as { role?: string } | undefined)?.role;
    if (ruolo !== "organizzatore") {
      return { ok: false, status: 403, message: "Permessi insufficienti." };
    }

    return { ok: true };
  } catch {
    return { ok: false, status: 500, message: "Impossibile verificare l'autenticazione." };
  }
}
