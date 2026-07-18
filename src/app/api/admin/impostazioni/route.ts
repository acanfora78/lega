import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { aggiornaImpostazioni } from "@/lib/store/file-store";

export async function PATCH(request: Request) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const patch = await request.json();
  const impostazioni = await aggiornaImpostazioni(patch);
  revalidatePath("/", "layout");
  return NextResponse.json(impostazioni);
}
