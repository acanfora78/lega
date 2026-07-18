import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/shared/container";
import { NewsCard } from "@/components/news/news-card";
import { Button } from "@/components/ui/button";
import { getArticoli } from "@/lib/data";
import { Newspaper, ShieldCheck } from "lucide-react";

export const metadata: Metadata = { title: "News" };

export default async function NewsPage() {
  const articoli = await getArticoli();
  const [primo, ...resto] = articoli;

  return (
    <Container className="flex flex-col gap-6 pt-6 sm:pt-10">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-gold-bright">Il mondo della Lega</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">News &amp; Comunicati</h1>
        <p className="mt-1 text-sm text-muted-foreground">Articoli, comunicati ufficiali e comunicazioni disciplinari della Lega.</p>
      </div>

      {articoli.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl glass p-12 text-center">
          <Newspaper className="size-8 text-muted-foreground" />
          <p className="font-display text-lg font-bold">Nessuna news pubblicata</p>
          <p className="max-w-md text-sm text-muted-foreground">
            Gli articoli e i comunicati ufficiali pubblicati dall&apos;area organizzatore compariranno qui.
          </p>
          <Button asChild className="mt-2">
            <Link href="/admin/news">
              <ShieldCheck className="size-4" /> Pubblica il primo articolo
            </Link>
          </Button>
        </div>
      ) : (
        <>
          {primo && <NewsCard articolo={primo} featured />}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resto.map((a) => (
              <NewsCard key={a.id} articolo={a} />
            ))}
          </div>
        </>
      )}
    </Container>
  );
}
