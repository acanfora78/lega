import { NextResponse } from "next/server";
import { erroreApi } from "@/lib/api-error";
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

  try {
    // Nessuna pagina pubblica cacheata legge le notifiche in-app (solo il
    // pannello admin, che è sempre dinamico e si aggiorna da sé via
    // router.refresh()): non c'è quindi nessuna cache pubblica da invalidare.
    await inviaNotifica(notifica);
    return NextResponse.json(notifica, { status: 201 });
  } catch (err) {
    return erroreApi(err, "Impossibile salvare la notifica.");
  }
}
