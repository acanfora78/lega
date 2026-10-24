import { NextResponse } from "next/server";
import { erroreApi } from "@/lib/api-error";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { diagnosticaSalvataggio } from "@/lib/store/file-store";

export async function POST() {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    return NextResponse.json(await diagnosticaSalvataggio());
  } catch (err) {
    return erroreApi(err, "Impossibile eseguire la verifica del salvataggio.");
  }
}
