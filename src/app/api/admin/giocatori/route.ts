import { NextResponse } from "next/server";
import { erroreApi } from "@/lib/api-error";
import { revalidateGiocatori } from "@/lib/revalidate";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { creaGiocatore, getStore } from "@/lib/store/file-store";
import type { Giocatore, Ruolo } from "@/lib/types";
import { slugify } from "@/lib/utils";

export async function POST(request: Request) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await request.json();
  const nome = String(body.nome ?? "").trim();
  const cognome = String(body.cognome ?? "").trim();
  const squadraId = String(body.squadraId ?? "");
  if (!nome || !cognome || !squadraId) {
    return NextResponse.json({ error: "Nome, cognome e squadra sono obbligatori." }, { status: 400 });
  }

  const giocatore: Giocatore = {
    id: `giocatore-${Date.now()}`,
    slug: slugify(`${nome}-${cognome}`),
    nome,
    cognome,
    fotoUrl: String(body.fotoUrl ?? ""),
    numeroMaglia: Number(body.numeroMaglia) || 1,
    ruolo: (body.ruolo as Ruolo) ?? "Centrocampista",
    eta: Number(body.eta) || 40,
    dataNascita: "",
    altezzaCm: Number(body.altezzaCm) || 178,
    pesoKg: Number(body.pesoKg) || 78,
    piedePreferito: body.piedePreferito ?? "Destro",
    squadraId,
    bio: String(body.bio ?? ""),
    galleryUrls: [],
    videoUrls: [],
    statistiche: [],
    trofei: [],
  };

  try {
    await creaGiocatore(giocatore);
    const squadraSlug = (await getStore()).squadre.find((s) => s.id === squadraId)?.slug;
    revalidateGiocatori({ giocatoreId: giocatore.id, squadraSlug });
    return NextResponse.json(giocatore, { status: 201 });
  } catch (err) {
    return erroreApi(err, "Impossibile salvare il giocatore.");
  }
}
