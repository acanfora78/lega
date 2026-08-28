import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { erroreApi } from "@/lib/api-error";
import { revalidateCompetizioni } from "@/lib/revalidate";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { creaFaseCompetizione, ricalcolaClassificaCompetizione } from "@/lib/store/file-store";
import type { FaseCompetizione, FormatoIncontri } from "@/lib/types";

const FORMATI: FormatoIncontri[] = ["andata_ritorno", "girone_unico", "eliminazione_diretta", "misto"];

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  const body = await request.json();
  const nome = String(body.nome ?? "").trim();
  if (!nome) return NextResponse.json({ error: "Il nome della fase è obbligatorio." }, { status: 400 });

  const fase: FaseCompetizione = {
    id: `fase-${randomUUID()}`,
    nome,
    ordine: Number(body.ordine) || 1,
    formato: FORMATI.includes(body.formato) ? body.formato : "girone_unico",
    squadreIds: Array.isArray(body.squadreIds) ? body.squadreIds.filter((v: unknown): v is string => typeof v === "string") : [],
  };

  try {
    const competizione = await creaFaseCompetizione(id, fase);
    if (!competizione) return NextResponse.json({ error: "Competizione non trovata." }, { status: 404 });
    if (fase.formato !== "eliminazione_diretta") await ricalcolaClassificaCompetizione(id, fase.id);
    revalidateCompetizioni(competizione.slug);
    return NextResponse.json(competizione, { status: 201 });
  } catch (err) {
    return erroreApi(err, "Impossibile creare la fase.");
  }
}
