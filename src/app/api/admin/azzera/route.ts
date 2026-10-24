import { NextResponse } from "next/server";
import { erroreApi } from "@/lib/api-error";
import { revalidateTutto } from "@/lib/revalidate";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { azzeraDati, type AmbitoAzzeramento } from "@/lib/store/file-store";

const AMBITI: AmbitoAzzeramento[] = ["risultati", "competizioni", "tutto"];

export async function POST(request: Request) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await request.json().catch(() => ({}));
  if (!AMBITI.includes(body.ambito)) {
    return NextResponse.json({ error: "Tipo di azzeramento non valido." }, { status: 400 });
  }

  try {
    await azzeraDati(body.ambito);
    revalidateTutto();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return erroreApi(err, "Impossibile azzerare i dati.");
  }
}
