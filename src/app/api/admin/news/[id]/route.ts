import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { aggiornaArticolo, eliminaArticolo } from "@/lib/store/file-store";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  const patch = await request.json();
  const aggiornato = await aggiornaArticolo(id, patch);
  if (!aggiornato) return NextResponse.json({ error: "Articolo non trovato." }, { status: 404 });
  revalidatePath("/", "layout");
  return NextResponse.json(aggiornato);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  await eliminaArticolo(id);
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
