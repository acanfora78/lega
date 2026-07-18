import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { inviaNotifica } from "@/lib/store/file-store";
import type { Notifica } from "@/lib/types";

export async function POST(request: Request) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await request.json();
  const titolo = String(body.titolo ?? "").trim();
  const corpo = String(body.corpo ?? "").trim();
  if (!titolo || !corpo) return NextResponse.json({ error: "Titolo e testo sono obbligatori." }, { status: 400 });

  const notifica: Notifica = {
    id: `notifica-${Date.now()}`,
    tipo: body.tipo ?? "news",
    titolo,
    corpo,
    link: body.link || undefined,
    creataIl: new Date().toISOString(),
  };

  await inviaNotifica(notifica);
  revalidatePath("/", "layout");
  return NextResponse.json(notifica, { status: 201 });
}
