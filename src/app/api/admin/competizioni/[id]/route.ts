import { NextResponse } from "next/server";
import { erroreApi } from "@/lib/api-error";
import { revalidateCompetizioni } from "@/lib/revalidate";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { aggiornaCompetizione, eliminaCompetizione, getStore, ricalcolaClassificaCompetizione } from "@/lib/store/file-store";
import type { Competizione, StatoCompetizione } from "@/lib/types";

const STATI: StatoCompetizione[] = ["bozza", "in_corso", "conclusa", "archiviata"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  const body = await request.json();

  const patch: Partial<Competizione> = {};
  if (typeof body.nome === "string" && body.nome.trim()) patch.nome = body.nome.trim();
  if (typeof body.regolamento === "string") patch.regolamento = body.regolamento;
  if (STATI.includes(body.stato)) patch.stato = body.stato;
  if (Array.isArray(body.squadreIscritteIds)) {
    patch.squadreIscritteIds = body.squadreIscritteIds.filter((v: unknown): v is string => typeof v === "string");
  }

  try {
    const aggiornata = await aggiornaCompetizione(id, patch);
    if (!aggiornata) return NextResponse.json({ error: "Competizione non trovata." }, { status: 404 });
    // Le squadre iscritte possono essere cambiate: la classifica scoped va
    // riallineata subito, non solo alla prossima partita conclusa.
    if (patch.squadreIscritteIds && aggiornata.formato !== "eliminazione_diretta") {
      await ricalcolaClassificaCompetizione(aggiornata.id);
    }
    revalidateCompetizioni(aggiornata.slug);
    return NextResponse.json(aggiornata);
  } catch (err) {
    return erroreApi(err, "Impossibile salvare le modifiche alla competizione.");
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  try {
    const slug = (await getStore()).competizioni.find((c) => c.id === id)?.slug;
    await eliminaCompetizione(id);
    revalidateCompetizioni(slug);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return erroreApi(err, "Impossibile eliminare la competizione.");
  }
}
