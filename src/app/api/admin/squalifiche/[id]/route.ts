import { NextResponse } from "next/server";
import { erroreApi } from "@/lib/api-error";
import { revalidateSqualifiche } from "@/lib/revalidate";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { aggiornaSqualifica, eliminaSqualifica } from "@/lib/store/file-store";
import type { Squalifica } from "@/lib/types";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  const body = await request.json();

  const patch: Partial<Squalifica> = {};
  if (Number.isInteger(Number(body.giornate)) && Number(body.giornate) >= 1) patch.giornate = Number(body.giornate);
  if (Number.isInteger(Number(body.giornataDa)) && Number(body.giornataDa) >= 1) patch.giornataDa = Number(body.giornataDa);
  if (typeof body.dettaglio === "string") patch.dettaglio = body.dettaglio.trim() || undefined;

  try {
    const aggiornata = await aggiornaSqualifica(id, patch);
    if (!aggiornata) return NextResponse.json({ error: "Squalifica non trovata." }, { status: 404 });
    revalidateSqualifiche();
    return NextResponse.json(aggiornata);
  } catch (err) {
    return erroreApi(err, "Impossibile salvare le modifiche alla squalifica.");
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  try {
    await eliminaSqualifica(id);
    revalidateSqualifiche();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return erroreApi(err, "Impossibile revocare la squalifica.");
  }
}
