import { NextResponse } from "next/server";
import { revalidateSquadre } from "@/lib/revalidate";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { creaSquadra } from "@/lib/store/file-store";
import type { Squadra } from "@/lib/types";
import { slugify } from "@/lib/utils";

export async function POST(request: Request) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await request.json();
  const nome = String(body.nome ?? "").trim();
  if (!nome) return NextResponse.json({ error: "Il nome è obbligatorio." }, { status: 400 });

  const squadra: Squadra = {
    id: `squadra-${Date.now()}`,
    slug: slugify(nome),
    nome,
    nomeBreve: String(body.nomeBreve ?? nome),
    logoUrl: String(body.logoUrl ?? ""),
    coverUrl: String(body.coverUrl ?? ""),
    coloriSociali: body.coloriSociali ?? ["#0f9c52", "#063a24"],
    descrizione: String(body.descrizione ?? ""),
    fondazione: Number(body.fondazione) || new Date().getFullYear(),
    allenatore: String(body.allenatore ?? ""),
    sedeSociale: String(body.sedeSociale ?? ""),
    sponsorIds: [],
    galleryUrls: [],
  };

  await creaSquadra(squadra);
  revalidateSquadre(squadra.slug);
  return NextResponse.json(squadra, { status: 201 });
}
