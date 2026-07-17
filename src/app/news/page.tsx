import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { NewsCard } from "@/components/news/news-card";
import { getArticoli } from "@/lib/data";

export const metadata: Metadata = { title: "News" };

export default function NewsPage() {
  const articoli = getArticoli();
  const [primo, ...resto] = articoli;

  return (
    <Container className="flex flex-col gap-6 pt-6 sm:pt-10">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-gold-bright">Il mondo della Lega</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">News &amp; Comunicati</h1>
        <p className="mt-1 text-sm text-muted-foreground">Articoli, comunicati ufficiali e comunicazioni disciplinari della Lega Calcio Over 40.</p>
      </div>

      {primo && <NewsCard articolo={primo} featured />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {resto.map((a) => (
          <NewsCard key={a.id} articolo={a} />
        ))}
      </div>
    </Container>
  );
}
