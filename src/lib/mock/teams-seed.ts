export interface TeamSeed {
  slug: string;
  nome: string;
  nomeBreve: string;
  coloriSociali: [string, string];
  fondazione: number;
  sedeSociale: string;
  allenatore: string;
  descrizione: string;
}

// Otto club amatoriali della zona di Scafati (Agro Nocerino-Sarnese),
// tutti iscritti alla Lega Calcio Over 40 — Campo Sportivo Santa Teresa.
export const TEAMS_SEED: TeamSeed[] = [
  {
    slug: "scafati-veterani",
    nome: "ASD Scafati Veterani 1985",
    nomeBreve: "Scafati Veterani",
    coloriSociali: ["#16a34a", "#0b3d24"],
    fondazione: 1985,
    sedeSociale: "Via Passanti, Scafati (SA)",
    allenatore: "Ciro Barbato",
    descrizione:
      "La squadra di casa del Campo Santa Teresa. Nata nel 1985 come costola del glorioso Scafati calcistico, oggi è il club più titolato della Lega con quattro scudetti Over 40 in bacheca. Il pubblico di casa non manca mai una giornata.",
  },
  {
    slug: "san-marzano-real",
    nome: "Real San Marzano Over 40",
    nomeBreve: "Real San Marzano",
    coloriSociali: ["#dc2626", "#111827"],
    fondazione: 1998,
    sedeSociale: "Via Nazionale, San Marzano sul Sarno (SA)",
    allenatore: "Antonio Guarino",
    descrizione:
      "Rosso fuoco e cuore agro-sarnese: il Real San Marzano è la squadra rivelazione delle ultime stagioni, capace di alternare un gioco veloce a una difesa di ferro guidata dal libero storico del club.",
  },
  {
    slug: "angri-united",
    nome: "Angri United Veterani",
    nomeBreve: "Angri United",
    coloriSociali: ["#2563eb", "#f8fafc"],
    fondazione: 2003,
    sedeSociale: "Via Passanti Chiunzi, Angri (SA)",
    allenatore: "Michele Landi",
    descrizione:
      "Blu elettrico e organizzazione svizzera. L'Angri United è il club più giovane della Lega ma già una realtà consolidata, famoso per il pressing alto e per una tifoseria itinerante instancabile.",
  },
  {
    slug: "pagani-antica",
    nome: "Pagani Antica Over 40",
    nomeBreve: "Pagani Antica",
    coloriSociali: ["#7c3aed", "#fbbf24"],
    fondazione: 1991,
    sedeSociale: "Corso Italia, Pagani (SA)",
    allenatore: "Pasquale Fusco",
    descrizione:
      "Viola e oro come lo stemma cittadino. Il Pagani Antica gioca un calcio spettacolare e imprevedibile, capace delle migliori e delle peggiori prestazioni della Lega nella stessa stagione.",
  },
  {
    slug: "nocera-old-boys",
    nome: "Nocera Superiore Old Boys",
    nomeBreve: "Nocera Old Boys",
    coloriSociali: ["#ea580c", "#1c1917"],
    fondazione: 1988,
    sedeSociale: "Via Atzori, Nocera Superiore (SA)",
    allenatore: "Vincenzo Iovine",
    descrizione:
      "Arancio e grinta. I veterani nocerini sono la squadra più fisica del torneo, temuta sui calci piazzati e capace di ribaltare le partite negli ultimi dieci minuti.",
  },
  {
    slug: "sarno-storico",
    nome: "Sarno Calcio Storico",
    nomeBreve: "Sarno Storico",
    coloriSociali: ["#0891b2", "#f1f5f9"],
    fondazione: 1979,
    sedeSociale: "Via San Valentino, Sarno (SA)",
    allenatore: "Raffaele Coppola",
    descrizione:
      "Il decano della Lega, fondato nel 1979. Il Sarno Storico porta in campo esperienza da vendere e un modulo, il 4-3-3 di manica larga, che non cambiano da trent'anni. E funziona ancora.",
  },
  {
    slug: "pompei-scavi",
    nome: "Pompei Scavi FC",
    nomeBreve: "Pompei Scavi",
    coloriSociali: ["#b91c1c", "#eab308"],
    fondazione: 1995,
    sedeSociale: "Via Plinio, Pompei (NA)",
    allenatore: "Domenico Torre",
    descrizione:
      "Rossoblù e amaranto, con un pizzico di teatralità tutta vesuviana. Il Pompei Scavi è la squadra con più tifosi trasfertisti della Lega: dove gioca il Pompei, c'è sempre un pullman di supporter.",
  },
  {
    slug: "cava-metelliana",
    nome: "Cava Veterani Metelliana",
    nomeBreve: "Cava Metelliana",
    coloriSociali: ["#0f766e", "#f5f5f4"],
    fondazione: 2001,
    sedeSociale: "Via Rosario Senatore, Cava de' Tirreni (SA)",
    allenatore: "Emanuele Basile",
    descrizione:
      "Turchese metelliano: tecnica, palleggio e un pizzico di supponenza costiera. La Cava Metelliana è la squadra più propositiva della Lega, con il miglior possesso palla medio del campionato.",
  },
];
