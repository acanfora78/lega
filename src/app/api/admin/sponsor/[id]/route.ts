import { NextResponse } from "next/server";
import { erroreApi } from "@/lib/api-error";
import { revalidateSponsor } from "@/lib/revalidate";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { eliminaSponsor } from "@/lib/store/file-store";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  try {
    await eliminaSponsor(id);
    revalidateSponsor();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return erroreApi(err, "Impossibile eliminare lo sponsor.");
  }
}
