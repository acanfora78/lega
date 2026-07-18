import { NextResponse } from "next/server";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { aggiornaRisultatoPartita, aggiornaStatoPartita, eliminaPartita, impostaMvpPartita, getStore } from "@/lib/store/file-store";
import type { StatoPartita } from "@/lib/types";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  const body = await request.json();

  if (typeof body.stato === "string") aggiornaStatoPartita(id, body.stato as StatoPartita);
  if (typeof body.golCasa === "number" && typeof body.golTrasferta === "number") {
    aggiornaRisultatoPartita(id, body.golCasa, body.golTrasferta);
  }
  if (typeof body.mvpGiocatoreId === "string") impostaMvpPartita(id, body.mvpGiocatoreId);

  const partita = getStore().partite.find((p) => p.id === id);
  if (!partita) return NextResponse.json({ error: "Partita non trovata." }, { status: 404 });
  return NextResponse.json(partita);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  eliminaPartita(id);
  return NextResponse.json({ ok: true });
}
