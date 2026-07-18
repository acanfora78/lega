import { NextResponse } from "next/server";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { creaPartita, getStore } from "@/lib/store/file-store";
import type { Partita } from "@/lib/types";

export async function POST(request: Request) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await request.json();
  const squadraCasaId = String(body.squadraCasaId ?? "");
  const squadraTrasfertaId = String(body.squadraTrasfertaId ?? "");
  if (!squadraCasaId || !squadraTrasfertaId || squadraCasaId === squadraTrasfertaId) {
    return NextResponse.json({ error: "Seleziona due squadre diverse." }, { status: 400 });
  }

  const dataOra = new Date(`${body.data}T${body.ora || "15:00"}:00`);
  if (Number.isNaN(dataOra.getTime())) {
    return NextResponse.json({ error: "Data o ora della partita non valide." }, { status: 400 });
  }

  const partita: Partita = {
    id: `partita-${Date.now()}`,
    stagioneId: (await getStore()).stagioneAttualeId,
    giornata: Number(body.giornata) || 1,
    dataOra: dataOra.toISOString(),
    stato: "programmata",
    squadraCasaId,
    squadraTrasfertaId,
    golCasa: 0,
    golTrasferta: 0,
    arbitro: String(body.arbitro ?? ""),
    campo: String(body.campo ?? "Campo Sportivo Santa Teresa"),
    eventi: [],
    galleryUrls: [],
  };

  await creaPartita(partita);
  return NextResponse.json(partita, { status: 201 });
}
