import { NextResponse } from "next/server";
import { erroreApi } from "@/lib/api-error";
import { revalidateImpostazioni } from "@/lib/revalidate";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { aggiornaImpostazioni } from "@/lib/store/file-store";

export async function PATCH(request: Request) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const patch = await request.json();
  try {
    const impostazioni = await aggiornaImpostazioni(patch);
    revalidateImpostazioni();
    return NextResponse.json(impostazioni);
  } catch (err) {
    return erroreApi(err, "Impossibile salvare le impostazioni.");
  }
}
