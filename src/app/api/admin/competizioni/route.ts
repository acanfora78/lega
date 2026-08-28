import { NextResponse } from "next/server";
import { erroreApi } from "@/lib/api-error";
import { revalidateCompetizioni } from "@/lib/revalidate";
import { requireOrganizzatore } from "@/lib/supabase/require-organizzatore";
import { creaCompetizione, getStore, ricalcolaClassificaCompetizione } from "@/lib/store/file-store";
import type { Competizione, FormatoIncontri, TipoCompetizione } from "@/lib/types";
import { slugify } from "@/lib/utils";

const TIPI: TipoCompetizione[] = ["campionato", "coppa", "torneo_eliminazione", "gironi", "gironi_piu_finale", "personalizzata"];
const FORMATI: FormatoIncontri[] = ["andata_ritorno", "girone_unico", "eliminazione_diretta", "misto"];

export async function POST(request: Request) {
  const auth = await requireOrganizzatore();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await request.json();
  const nome = String(body.nome ?? "").trim();
  if (!nome) return NextResponse.json({ error: "Il nome è obbligatorio." }, { status: 400 });

  const tipo: TipoCompetizione = TIPI.includes(body.tipo) ? body.tipo : "coppa";
  const formato: FormatoIncontri = FORMATI.includes(body.formato) ? body.formato : "girone_unico";
  const squadreIscritteIds: string[] = Array.isArray(body.squadreIscritteIds)
    ? body.squadreIscritteIds.filter((id: unknown): id is string => typeof id === "string")
    : [];

  try {
    const store = await getStore();
    const competizione: Competizione = {
      id: `competizione-${Date.now()}`,
      slug: slugify(nome),
      nome,
      tipo,
      stagioneId: store.stagioneAttualeId,
      logoUrl: "",
      coloreSociale: "#0f9c52",
      stato: "bozza",
      formato,
      criteriClassifica: [
        { ordine: 1, criterio: "punti" },
        { ordine: 2, criterio: "differenza_reti" },
        { ordine: 3, criterio: "gol_fatti" },
      ],
      fasi: [],
      regolamento: typeof body.regolamento === "string" ? body.regolamento : undefined,
      squadreIscritteIds,
    };

    await creaCompetizione(competizione);
    // Semina subito una classifica a zero per le squadre iscritte, come già
    // accade per il campionato principale quando si crea una squadra: senza
    // questo la pagina della competizione resterebbe vuota finché non si
    // conclude la prima partita, anche a iscrizioni già chiuse.
    if (formato !== "eliminazione_diretta") await ricalcolaClassificaCompetizione(competizione.id);

    revalidateCompetizioni(competizione.slug);
    return NextResponse.json(competizione, { status: 201 });
  } catch (err) {
    return erroreApi(err, "Impossibile creare la competizione.");
  }
}
