import { getSponsor } from "@/lib/data";
import { Card } from "@/components/ui/card";

function initialsMark(nome: string) {
  return nome
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export async function SponsorBanner({ title = "I nostri sponsor" }: { title?: string }) {
  const sponsor = await getSponsor();

  return (
    <Card className="overflow-hidden p-5">
      <p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{title}</p>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
        {sponsor.map((s) => (
          <div
            key={s.id}
            title={s.nome}
            className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-border bg-white/[0.03] text-xs font-bold text-muted-foreground transition-colors hover:border-gold/40 hover:text-gold-bright"
          >
            {s.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- logo caricato dall'organizzatore su Supabase Storage
              <img src={s.logoUrl} alt={s.nome} className="size-full object-cover" />
            ) : (
              initialsMark(s.nome)
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
