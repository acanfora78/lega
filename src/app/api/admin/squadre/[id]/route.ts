import { NextResponse } from "next/server";
import { erroreApi } from "@/lib/api-error";
import { revalidateSquadre } from "@/lib/revalidate";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { aggiornaSquadra, eliminaSquadra, getStore } from "@/lib/store/file-store";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  const patch = await request.json();
  try {
    const aggiornata = await aggiornaSquadra(id, patch);
    if (!aggiornata) return NextResponse.json({ error: "Squadra non trovata." }, { status: 404 });
    revalidateSquadre(aggiornata.slug);
    return NextResponse.json(aggiornata);
  } catch (err) {
    return erroreApi(err, "Impossibile salvare le modifiche alla squadra.");
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  try {
    const slug = (await getStore()).squadre.find((s) => s.id === id)?.slug;
    await eliminaSquadra(id);
    revalidateSquadre(slug);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return erroreApi(err, "Impossibile eliminare la squadra.");
  }
}
