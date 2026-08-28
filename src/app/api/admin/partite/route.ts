import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { erroreApi } from "@/lib/api-error";
import { revalidatePartite } from "@/lib/revalidate";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { creaPartita, getStore } from "@/lib/store/file-store";
import { parseDataOraRoma } from "@/lib/timezone";
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

  const dataOra = parseDataOraRoma(String(body.data ?? ""), body.ora || "15:00");
  if (Number.isNaN(dataOra.getTime())) {
    return NextResponse.json({ error: "Data o ora della partita non valide." }, { status: 400 });
  }

  try {
    const partita: Partita = {
      id: `partita-${randomUUID()}`,
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
    revalidatePartite(partita.id);
    return NextResponse.json(partita, { status: 201 });
  } catch (err) {
    return erroreApi(err, "Impossibile creare la partita.");
  }
}
