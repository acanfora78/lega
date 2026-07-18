import { NextResponse } from "next/server";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { creaSponsor } from "@/lib/store/file-store";
import type { Sponsor } from "@/lib/types";

export async function POST(request: Request) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await request.json();
  const nome = String(body.nome ?? "").trim();
  if (!nome) return NextResponse.json({ error: "Il nome è obbligatorio." }, { status: 400 });

  const sponsor: Sponsor = {
    id: `sponsor-${Date.now()}`,
    nome,
    logoUrl: "",
    livello: body.livello ?? "silver",
    descrizione: String(body.descrizione ?? ""),
  };

  creaSponsor(sponsor);
  return NextResponse.json(sponsor, { status: 201 });
}
