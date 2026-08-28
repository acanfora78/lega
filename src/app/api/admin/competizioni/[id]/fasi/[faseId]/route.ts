import { NextResponse } from "next/server";
import { erroreApi } from "@/lib/api-error";
import { revalidateCompetizioni } from "@/lib/revalidate";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { eliminaFaseCompetizione } from "@/lib/store/file-store";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string; faseId: string }> }) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id, faseId } = await params;
  try {
    const competizione = await eliminaFaseCompetizione(id, faseId);
    if (!competizione) return NextResponse.json({ error: "Competizione non trovata." }, { status: 404 });
    revalidateCompetizioni(competizione.slug);
    return NextResponse.json(competizione);
  } catch (err) {
    return erroreApi(err, "Impossibile eliminare la fase.");
  }
}
