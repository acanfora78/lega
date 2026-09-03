import { NextResponse } from "next/server";
import { erroreApi } from "@/lib/api-error";
import { revalidatePartite } from "@/lib/revalidate";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { impostaDistintaPartita, type VoceDistinta } from "@/lib/store/file-store";
import type { Ruolo } from "@/lib/types";

// ============================================================================
// DISTINTA DI GARA
// ----------------------------------------------------------------------------
// Si compila prima del fischio d'inizio, una squadra alla volta: l'elenco
// sostituisce interamente quello già salvato, così togliere un giocatore che
// alla fine non si è presentato è immediato quanto aggiungerlo.
//
// La validazione di merito (il giocatore appartiene davvero a quella squadra,
// niente doppioni) sta nello store, dove c'è la rosa: qui si controlla solo la
// forma di ciò che arriva.
// ============================================================================

const RUOLI: Ruolo[] = ["Portiere", "Difensore", "Centrocampista", "Attaccante"];

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const squadraId = typeof body.squadraId === "string" ? body.squadraId : "";
  if (!squadraId) return NextResponse.json({ error: "Squadra non indicata." }, { status: 400 });
  if (!Array.isArray(body.voci)) return NextResponse.json({ error: "Distinta non valida." }, { status: 400 });

  const voci: VoceDistinta[] = body.voci
    .filter((v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null)
    .filter((v: Record<string, unknown>) => typeof v.giocatoreId === "string" && v.giocatoreId)
    .map((v: Record<string, unknown>) => ({
      giocatoreId: String(v.giocatoreId),
      titolare: Boolean(v.titolare),
      numero: Number(v.numero),
      ...(RUOLI.includes(v.ruolo as Ruolo) ? { ruolo: v.ruolo as Ruolo } : {}),
    }));

  try {
    const partita = await impostaDistintaPartita(id, squadraId, voci);
    if (!partita) return NextResponse.json({ error: "Partita non trovata." }, { status: 404 });
    revalidatePartite(partita.id);
    return NextResponse.json(partita);
  } catch (err) {
    return erroreApi(err, "Impossibile salvare la distinta.");
  }
}
