import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { creaGiocatore } from "@/lib/store/file-store";
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
    fotoUrl: "",
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

  await creaGiocatore(giocatore);
  revalidatePath("/", "layout");
  return NextResponse.json(giocatore, { status: 201 });
}
