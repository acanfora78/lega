import { NextResponse } from "next/server";
import { erroreApi } from "@/lib/api-error";
import { revalidatePartite } from "@/lib/revalidate";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import {
  aggiornaRisultatoPartita,
  aggiornaStatoPartita,
  eliminaPartita,
  impostaMvpPartita,
  impostaVotiPartita,
  getStore,
} from "@/lib/store/file-store";
import type { StatoPartita, VotoPartita } from "@/lib/types";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  const body = await request.json();

  try {
    if (typeof body.stato === "string") await aggiornaStatoPartita(id, body.stato as StatoPartita);
    if (typeof body.golCasa === "number" && typeof body.golTrasferta === "number") {
      await aggiornaRisultatoPartita(id, body.golCasa, body.golTrasferta);
    }
    if (typeof body.mvpGiocatoreId === "string") await impostaMvpPartita(id, body.mvpGiocatoreId);
    if (Array.isArray(body.voti)) {
      const voti: VotoPartita[] = body.voti
        .filter((v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null)
        .map((v: Record<string, unknown>) => ({
          giocatoreId: String(v.giocatoreId ?? ""),
          voto: Number(v.voto),
          ...(typeof v.nota === "string" && v.nota.trim() ? { nota: v.nota.trim() } : {}),
        }));
      await impostaVotiPartita(id, voti);
    }

    const partita = (await getStore()).partite.find((p) => p.id === id);
    if (!partita) return NextResponse.json({ error: "Partita non trovata." }, { status: 404 });
    await revalidatePartite(partita);
    return NextResponse.json(partita);
  } catch (err) {
    return erroreApi(err, "Impossibile salvare le modifiche alla partita.");
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  try {
    // Catturata prima di eliminare: dopo eliminaPartita() non è più
    // nell'archivio, ma serve ancora per sapere quali squadre/giocatori/
    // competizione invalidare.
    const partita = (await getStore()).partite.find((p) => p.id === id);
    await eliminaPartita(id);
    await revalidatePartite(partita);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return erroreApi(err, "Impossibile eliminare la partita.");
  }
}
