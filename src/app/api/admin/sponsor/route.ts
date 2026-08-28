import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { erroreApi } from "@/lib/api-error";
import { revalidateSponsor } from "@/lib/revalidate";
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
    id: `sponsor-${randomUUID()}`,
    nome,
    logoUrl: String(body.logoUrl ?? ""),
    livello: body.livello ?? "silver",
    descrizione: String(body.descrizione ?? ""),
  };

  try {
    await creaSponsor(sponsor);
    revalidateSponsor();
    return NextResponse.json(sponsor, { status: 201 });
  } catch (err) {
    return erroreApi(err, "Impossibile salvare lo sponsor.");
  }
}
