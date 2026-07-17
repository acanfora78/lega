import { legaData } from "@/lib/mock";

export interface RisultatoRicerca {
  tipo: "squadra" | "giocatore" | "partita" | "news" | "sponsor";
  id: string;
  titolo: string;
  sottotitolo?: string;
  href: string;
}

export function ricercaGlobale(query: string): RisultatoRicerca[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const data = legaData();
  const risultati: RisultatoRicerca[] = [];

  data.squadre
    .filter((s) => s.nome.toLowerCase().includes(q) || s.nomeBreve.toLowerCase().includes(q))
    .forEach((s) =>
      risultati.push({ tipo: "squadra", id: s.id, titolo: s.nome, sottotitolo: "Squadra", href: `/squadre/${s.slug}` })
    );

  data.giocatori
    .filter((g) => `${g.nome} ${g.cognome}`.toLowerCase().includes(q))
    .forEach((g) => {
      const squadra = data.squadre.find((s) => s.id === g.squadraId);
      risultati.push({
        tipo: "giocatore",
        id: g.id,
        titolo: `${g.nome} ${g.cognome}`,
        sottotitolo: squadra?.nomeBreve ?? g.ruolo,
        href: `/giocatori/${g.id}`,
      });
    });

  data.articoli
    .filter((a) => a.titolo.toLowerCase().includes(q))
    .forEach((a) =>
      risultati.push({ tipo: "news", id: a.id, titolo: a.titolo, sottotitolo: "News", href: `/news/${a.slug}` })
    );

  data.sponsor
    .filter((s) => s.nome.toLowerCase().includes(q))
    .forEach((s) => risultati.push({ tipo: "sponsor", id: s.id, titolo: s.nome, sottotitolo: "Sponsor", href: `/altro` }));

  data.partite
    .filter((p) => {
      const casa = data.squadre.find((s) => s.id === p.squadraCasaId)?.nome ?? "";
      const trasf = data.squadre.find((s) => s.id === p.squadraTrasfertaId)?.nome ?? "";
      return `${casa} ${trasf}`.toLowerCase().includes(q);
    })
    .slice(0, 8)
    .forEach((p) => {
      const casa = data.squadre.find((s) => s.id === p.squadraCasaId)?.nomeBreve ?? "";
      const trasf = data.squadre.find((s) => s.id === p.squadraTrasfertaId)?.nomeBreve ?? "";
      risultati.push({
        tipo: "partita",
        id: p.id,
        titolo: `${casa} vs ${trasf}`,
        sottotitolo: `Giornata ${p.giornata}`,
        href: `/partite/${p.id}`,
      });
    });

  return risultati.slice(0, 30);
}
