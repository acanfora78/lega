import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminSqualifiche } from "@/components/admin/admin-squalifiche";
import { ConteggiCartellini } from "@/components/news/tabellone-disciplinare";
import { getConteggiDisciplinariRisolti, getSqualificheRisolte } from "@/lib/data/disciplina";
import { getGiocatori, getGiornataCorrente, getSquadre } from "@/lib/data";

export const metadata: Metadata = { title: "Giudice Sportivo" };

export default async function AdminDisciplinarePage() {
  const giornata = await getGiornataCorrente();
  const [squalifiche, giocatori, squadre, conteggi] = await Promise.all([
    getSqualificheRisolte(giornata),
    getGiocatori(),
    getSquadre(),
    getConteggiDisciplinariRisolti(),
  ]);

  return (
    <Container className="flex flex-col gap-6 pt-6 sm:pt-10">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-gold-bright">Area Organizzatore</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Giudice Sportivo</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Registra le squalifiche e pubblica i comunicati. I cartellini si contano da soli dai tabellini delle
          partite concluse: non vanno reinseriti qui.
        </p>
      </div>

      <AdminShell>
        <div className="flex flex-col gap-8">
          <AdminSqualifiche
            squalifiche={squalifiche}
            giocatori={giocatori}
            squadre={squadre}
            conteggi={conteggi}
            giornataCorrente={giornata}
          />

          <section>
            <h2 className="mb-3 font-display text-lg font-bold tracking-tight">Conteggio cartellini</h2>
            <ConteggiCartellini conteggi={conteggi} />
          </section>
        </div>
      </AdminShell>
    </Container>
  );
}
