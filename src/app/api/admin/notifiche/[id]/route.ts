import { NextResponse } from "next/server";
import { erroreApi } from "@/lib/api-error";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { eliminaNotifica } from "@/lib/store/file-store";

// Nessuna revalidatePath: lo storico invii lo legge solo il pannello admin,
// che è sempre dinamico e si aggiorna da sé via router.refresh() (vedi
// src/lib/revalidate.ts per il ragionamento completo).
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  try {
    await eliminaNotifica(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return erroreApi(err, "Impossibile eliminare la notifica.");
  }
}
