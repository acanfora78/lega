import { NextResponse } from "next/server";
import { erroreApi } from "@/lib/api-error";
import { revalidatePartite } from "@/lib/revalidate";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { eliminaEventoPartita } from "@/lib/store/file-store";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string; eventoId: string }> }) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id, eventoId } = await params;
  try {
    const partita = await eliminaEventoPartita(id, eventoId);
    if (!partita) return NextResponse.json({ error: "Partita non trovata." }, { status: 404 });
    await revalidatePartite(partita);
    return NextResponse.json(partita);
  } catch (err) {
    return erroreApi(err, "Impossibile eliminare l'evento.");
  }
}
