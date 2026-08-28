import type { CampionatoStorico, MarcatoreStorico, RigaClassificaStorica } from "@/lib/types";

// ============================================================================
// ARCHIVIO STORICO REALE — "Campionati Passati"
// Dati trascritti dagli export ufficiali forniti dalla Lega (classifiche
// finali e classifiche marcatori). Alcune fonti sono parziali: le note e i
// flag `nomeParziale` / `*Incompleta` / `*Incompleti` riportano fedelmente i
// limiti dei dati originali, così l'area organizzatore può correggerli non
// appena saranno disponibili fonti complete.
// ============================================================================

const classifica202526: RigaClassificaStorica[] = [
  { posizione: 1, squadra: "New Team", punti: 101, giocate: 38, vinte: 33, pareggiate: 2, perse: 3 },
  { posizione: 2, squadra: "Cofer 2000", punti: 99, giocate: 38, vinte: 32, pareggiate: 3, perse: 3 },
  { posizione: 3, squadra: "Cartolandia", punti: 96, giocate: 38, vinte: 30, pareggiate: 6, perse: 2 },
  { posizione: 4, squadra: "Sidis Market", punti: 72, giocate: 38, vinte: 23, pareggiate: 3, perse: 12 },
  { posizione: 5, squadra: "FC Abatesi", punti: 66, giocate: 38, vinte: 19, pareggiate: 9, perse: 10 },
  { posizione: 6, squadra: "Potestà", punti: 59, giocate: 38, vinte: 18, pareggiate: 5, perse: 15 },
  { posizione: 7, squadra: "A.C. System Infinity", punti: 59, giocate: 38, vinte: 19, pareggiate: 2, perse: 17 },
  { posizione: 8, squadra: "I Vecchi Amici", punti: 56, giocate: 38, vinte: 17, pareggiate: 5, perse: 16 },
  { posizione: 9, squadra: "PM Soccer", punti: 54, giocate: 38, vinte: 16, pareggiate: 6, perse: 16 },
  { posizione: 10, squadra: "Agenzia Raffaele Pisacane", punti: 53, giocate: 38, vinte: 17, pareggiate: 2, perse: 19 },
  { posizione: 11, squadra: "Lu.Pe Pompei", punti: 52, giocate: 38, vinte: 14, pareggiate: 10, perse: 14 },
  { posizione: 12, squadra: "Team Soccer Abbagnale", punti: 49, giocate: 38, vinte: 14, pareggiate: 7, perse: 17 },
  { posizione: 13, squadra: "Team Apuzzo", punti: 49, giocate: 38, vinte: 15, pareggiate: 4, perse: 19 },
  { posizione: 14, squadra: "NAG", punti: 44, giocate: 38, vinte: 13, pareggiate: 5, perse: 20 },
  { posizione: 15, squadra: "Snai San Marzano", punti: 38, giocate: 38, vinte: 12, pareggiate: 2, perse: 24 },
  { posizione: 16, squadra: "Team Bar Italia", punti: 34, giocate: 38, vinte: 10, pareggiate: 4, perse: 24 },
  { posizione: 17, squadra: "Scafati Soccer", punti: 32, giocate: 38, vinte: 9, pareggiate: 5, perse: 24 },
  { posizione: 18, squadra: "The Lions", punti: 26, giocate: 38, vinte: 7, pareggiate: 5, perse: 26 },
  {
    posizione: 19,
    squadra: "Kornelia",
    punti: 0,
    giocate: 38,
    vinte: 12,
    nota: "Anomalia nella fonte: 0 punti nonostante 12 vittorie registrate, incompatibile con lo schema 3-1-0 — verosimilmente una penalizzazione/sanzione disciplinare della Lega. Pareggi/sconfitte non calcolabili dalla fonte: da verificare col regolamento ufficiale.",
  },
  {
    posizione: 20,
    squadra: "Bar Alba",
    punti: 0,
    giocate: 38,
    vinte: 5,
    nota: "Anomalia nella fonte: 0 punti nonostante 5 vittorie registrate, incompatibile con lo schema 3-1-0 — verosimilmente una penalizzazione/sanzione disciplinare della Lega. Pareggi/sconfitte non calcolabili dalla fonte: da verificare col regolamento ufficiale.",
  },
];

const marcatori202526: MarcatoreStorico[] = [
  { posizione: 1, giocatore: "De Riso R.", squadra: "Sidis Market", gol: 75 },
  { posizione: 2, giocatore: "Scarpa F.", squadra: "New Team", gol: 66 },
  { posizione: 3, giocatore: "Amato A.", squadra: "PM Soccer", gol: 47 },
  { posizione: 4, giocatore: "Miranda S.", squadra: "New Team", gol: 44 },
  { posizione: 5, giocatore: "Piccirillo F.", squadra: "Kornelia", gol: 37 },
  { posizione: 6, giocatore: "Giordano G.", squadra: "Sidis Market", gol: 36 },
  { posizione: 7, giocatore: "Izzo 2 I.", squadra: "Cofer 2000", gol: 34, nota: "Nome riportato così come mostrato nella fonte (possibile refuso dell'app di origine)." },
  { posizione: 8, giocatore: "Secondulfo G.", squadra: "Agenzia Raffaele Pisacane", gol: 33 },
  { posizione: 9, giocatore: "De Vito G.", squadra: "New Team", gol: 30 },
  { posizione: 10, giocatore: "Garofalo A.", squadra: "NAG", gol: 27 },
  { posizione: 11, giocatore: "Pescina M.", squadra: "Potestà", gol: 27 },
  { posizione: 12, giocatore: "Sollo R.", squadra: "Team Apuzzo", gol: 26 },
  { posizione: 13, giocatore: "Grimaldi A.", squadra: "NAG", gol: 25 },
  { posizione: 14, giocatore: "***marrazzo F.", squadra: "FC Abatesi", gol: 25, nomeParziale: true },
  { posizione: 15, giocatore: "Aquino G.", squadra: "Potestà", gol: 25 },
  { posizione: 16, giocatore: "***reale E.", squadra: "Kornelia", gol: 24, nomeParziale: true },
  { posizione: 17, giocatore: "De Rosa M.", squadra: "PM Soccer", gol: 24 },
  { posizione: 18, giocatore: "***sorrentino G.", squadra: "Cofer 2000", gol: 23, nomeParziale: true },
  { posizione: 19, giocatore: "Solimene L.", squadra: "I Vecchi Amici", gol: 23 },
  { posizione: 20, giocatore: "Virzo C.", squadra: "Bar Alba", gol: 23 },
  { posizione: 21, giocatore: "Majella R.", squadra: "Cofer 2000", gol: 22 },
  { posizione: 22, giocatore: "Di Donna P.", squadra: "New Team", gol: 22 },
  { posizione: 23, giocatore: "***esposito G.", squadra: "The Lions", gol: 21, nomeParziale: true },
  { posizione: 24, giocatore: "***ilvettini G.", squadra: "Cofer 2000", gol: 20, nomeParziale: true },
  { posizione: 25, giocatore: "***langella G.", squadra: "A.C. System Infinity", gol: 19, nomeParziale: true },
  { posizione: 26, giocatore: "***tagliamonte M.", squadra: "FC Abatesi", gol: 19, nomeParziale: true },
  { posizione: 27, giocatore: "D'antonio F.", squadra: "Potestà", gol: 19 },
  { posizione: 28, giocatore: "Di Guglielmo D.", squadra: "Kornelia", gol: 19 },
  { posizione: 29, giocatore: "Micucci A.", squadra: "I Vecchi Amici", gol: 19 },
  { posizione: 30, giocatore: "Boffardi A.", squadra: "Scafati Soccer", gol: 18 },
  { posizione: 31, giocatore: "Coppola G.", squadra: "Lu.Pe Pompei", gol: 18 },
  { posizione: 32, giocatore: "Abbagnale M.", squadra: "Team Soccer Abbagnale", gol: 18 },
  { posizione: 33, giocatore: "***stampone P.", squadra: "A.C. System Infinity", gol: 17, nomeParziale: true },
  { posizione: 34, giocatore: "Severini A.", squadra: "Snai San Marzano", gol: 17 },
  { posizione: 35, giocatore: "***d'auria P.", squadra: "FC Abatesi", gol: 17, nomeParziale: true },
  { posizione: 36, giocatore: "Iazzetta G.", squadra: "Team Soccer Abbagnale", gol: 17 },
  { posizione: 37, giocatore: "Cirillo G.", squadra: "Agenzia Raffaele Pisacane", gol: 16 },
  { posizione: 38, giocatore: "Della Monica R.", squadra: "Cartolandia", gol: 16 },
  { posizione: 39, giocatore: "Barretta A.", squadra: "Snai San Marzano", gol: 16 },
  { posizione: 40, giocatore: "***ferrentino D.", squadra: "New Team", gol: 15, nomeParziale: true },
  { posizione: 41, giocatore: "Velotti A.", squadra: "Team Apuzzo", gol: 15 },
  { posizione: 42, giocatore: "Apuzzo A.", squadra: "Team Apuzzo", gol: 15 },
  { posizione: 43, giocatore: "Mainenti F.", squadra: "Team Bar Italia", gol: 15 },
  { posizione: 44, giocatore: "Arpino O.", squadra: "I Vecchi Amici", gol: 14 },
  { posizione: 45, giocatore: "Schettino G.", squadra: "Sidis Market", gol: 14 },
  { posizione: 46, giocatore: "***ruocco R.", squadra: "Cartolandia", gol: 14, nomeParziale: true },
  { posizione: 47, giocatore: "Tolentino D.", squadra: "Cartolandia", gol: 14 },
  { posizione: 48, giocatore: "Gigi R.", squadra: "Snai San Marzano", gol: 13 },
  { posizione: 49, giocatore: "D'ambrosio A.", squadra: "FC Abatesi", gol: 13 },
  { posizione: 50, giocatore: "***ciancia M.", squadra: "Snai San Marzano", gol: 13, nomeParziale: true },
  { posizione: 51, giocatore: "***mautone D.", squadra: "NAG", gol: 13, nomeParziale: true },
  { posizione: 52, giocatore: "Del Gaudio F.", squadra: "Agenzia Raffaele Pisacane", gol: 13 },
  { posizione: 53, giocatore: "***silvestri F.", squadra: "I Vecchi Amici", gol: 13, nomeParziale: true },
  { posizione: 54, giocatore: "***aprea A.", squadra: "Team Apuzzo", gol: 13, nomeParziale: true },
  { posizione: 55, giocatore: "Imperato M.", squadra: "Cartolandia", gol: 13 },
  { posizione: 56, giocatore: "Russo A.", squadra: "Scafati Soccer", gol: 12 },
  { posizione: 57, giocatore: "La Mura M.", squadra: "A.C. System Infinity", gol: 12 },
  { posizione: 58, giocatore: "Lama A.", squadra: "Cofer 2000", gol: 12 },
  { posizione: 59, giocatore: "Cacace G.", squadra: "Team Apuzzo", gol: 12 },
  { posizione: 60, giocatore: "Monaco S.", squadra: "Cartolandia", gol: 12 },
  { posizione: 61, giocatore: "Petraccone A.", squadra: "Team Bar Italia", gol: 12 },
  { posizione: 62, giocatore: "Pepe S.", squadra: "Snai San Marzano", gol: 12 },
  { posizione: 63, giocatore: "Ruotolo I.", squadra: "Bar Alba", gol: 12 },
  { posizione: 64, giocatore: "Tammaro N.", squadra: "A.C. System Infinity", gol: 11 },
  { posizione: 65, giocatore: "Contessa A.", squadra: "Potestà", gol: 11 },
  { posizione: 66, giocatore: "Tortora S.", squadra: "Lu.Pe Pompei", gol: 11 },
  { posizione: 67, giocatore: "Balestrieri R.", squadra: "NAG", gol: 11 },
  { posizione: 68, giocatore: "***sasso M.", squadra: "Team Bar Italia", gol: 11, nomeParziale: true },
  { posizione: 69, giocatore: "Tortora V.", squadra: "FC Abatesi", gol: 11 },
  { posizione: 70, giocatore: "Beato F.", squadra: "Team Soccer Abbagnale", gol: 11 },
  { posizione: 71, giocatore: "Polo R.", squadra: "New Team", gol: 11 },
  { posizione: 72, giocatore: "Vaiano M.", squadra: "The Lions", gol: 10 },
  { posizione: 73, giocatore: "***cipriano S.", squadra: "A.C. System Infinity", gol: 10, nomeParziale: true },
  { posizione: 74, giocatore: "***broda E.", squadra: "Agenzia Raffaele Pisacane", gol: 10, nomeParziale: true },
  { posizione: 75, giocatore: "Basso A.", squadra: "Cofer 2000", gol: 10 },
  { posizione: 76, giocatore: "Catalano G.", squadra: "I Vecchi Amici", gol: 10 },
  { posizione: 77, giocatore: "***coppola A.", squadra: "Snai San Marzano", gol: 10, nomeParziale: true },
  { posizione: 78, giocatore: "De Rosa G.", squadra: "I Vecchi Amici", gol: 10 },
  { posizione: 79, giocatore: "Spada V.", squadra: "PM Soccer", gol: 10 },
  { posizione: 80, giocatore: "Pastore M.", squadra: "Team Soccer Abbagnale", gol: 10 },
];

const classifica202324: RigaClassificaStorica[] = [
  { posizione: 1, squadra: "Cartolandia", punti: 91, giocate: 38, vinte: 29, pareggiate: 4, perse: 5 },
  { posizione: 2, squadra: "Cofer 2000", punti: 89, giocate: 38, vinte: 28, pareggiate: 5, perse: 5 },
  { posizione: 3, squadra: "Team Soccer Abbagnale", punti: 86, giocate: 38, vinte: 27, pareggiate: 5, perse: 6 },
  { posizione: 4, squadra: "Bar Alba", punti: 81, giocate: 38, vinte: 26, pareggiate: 3, perse: 9 },
  { posizione: 5, squadra: "I Vecchi Amici", punti: 79, giocate: 38, vinte: 25, pareggiate: 4, perse: 9 },
  { posizione: 6, squadra: "FC Abatesi", punti: 79, giocate: 38, vinte: 24, pareggiate: 7, perse: 7 },
  { posizione: 7, squadra: "Team Bar Italia", punti: 68, giocate: 38, vinte: 21, pareggiate: 5, perse: 12 },
  { posizione: 8, squadra: "Snai San Marzano", punti: 60, giocate: 38, vinte: 18, pareggiate: 6, perse: 14 },
  { posizione: 9, squadra: "A.C. System Infinity", punti: 54, giocate: 38, vinte: 17, pareggiate: 3, perse: 18 },
  { posizione: 10, squadra: "New Team", punti: 52, giocate: 38, vinte: 15, pareggiate: 7, perse: 16 },
  { posizione: 11, squadra: "Kornelia", punti: 51, giocate: 38, vinte: 16, pareggiate: 3, perse: 19 },
  { posizione: 12, squadra: "Potestà", punti: 49, giocate: 38, vinte: 14, pareggiate: 7, perse: 17 },
  { posizione: 13, squadra: "Lu.Pe Pompei", punti: 46, giocate: 38, vinte: 12, pareggiate: 10, perse: 16 },
  { posizione: 14, squadra: "Scafati Soccer", punti: 44, giocate: 38, vinte: 12, pareggiate: 8, perse: 18 },
  { posizione: 15, squadra: "Sidis Market", punti: 40, giocate: 38, vinte: 12, pareggiate: 4, perse: 22 },
  { posizione: 16, squadra: "Team Apuzzo", punti: 35, giocate: 38, vinte: 10, pareggiate: 5, perse: 23 },
  { posizione: 17, squadra: "Il Grande Telefonino", punti: 29, giocate: 38, vinte: 8, pareggiate: 5, perse: 25 },
  { posizione: 18, squadra: "PM Soccer", punti: 28, giocate: 38, vinte: 9, pareggiate: 1, perse: 28 },
  { posizione: 19, squadra: "Agenzia Raffaele Pisacane", punti: 24, giocate: 38, vinte: 7, pareggiate: 3, perse: 28 },
  { posizione: 20, squadra: "The Lions", punti: 7, giocate: 38, vinte: 2, pareggiate: 1, perse: 35 },
];

const marcatori202324: MarcatoreStorico[] = [
  { posizione: 1, giocatore: "De Riso R.", squadra: "Team Soccer Abbagnale", gol: 65 },
  { posizione: 2, giocatore: "***qualano A.", squadra: "Cofer 2000", gol: 53, nomeParziale: true },
  { posizione: 3, giocatore: "Mariani A.", squadra: "Kornelia", gol: 51 },
  { posizione: 4, giocatore: "Evacuo C.", squadra: "Scafati Soccer", gol: 45 },
  { posizione: 5, giocatore: "Della Monica R.", squadra: "Il Grande Telefonino", gol: 39 },
  { posizione: 6, giocatore: "D'aniello G.", squadra: "Bar Alba", gol: 39 },
  { posizione: 7, giocatore: "D'antonio F.", squadra: "Potestà", gol: 37 },
  { posizione: 8, giocatore: "Pastore M.", squadra: "Snai San Marzano", gol: 37 },
  { posizione: 9, giocatore: "Beato F.", squadra: "Team Soccer Abbagnale", gol: 37 },
  { posizione: 10, giocatore: "Coppola A.", squadra: "FC Abatesi", gol: 35 },
  { posizione: 11, giocatore: "Pescina M.", squadra: "Potestà", gol: 34 },
  { posizione: 12, giocatore: "Pizzini D.", squadra: "I Vecchi Amici", gol: 32 },
  { posizione: 13, giocatore: "Apuzzo A.", squadra: "Team Apuzzo", gol: 31 },
  { posizione: 14, giocatore: "Solimene L.", squadra: "I Vecchi Amici", gol: 30 },
  { posizione: 15, giocatore: "Mosca A.", squadra: "A.C. System Infinity", gol: 29 },
  { posizione: 16, giocatore: "Inserra N.", squadra: "Lu.Pe Pompei", gol: 27 },
  { posizione: 17, giocatore: "Miranda S.", squadra: "A.C. System Infinity", gol: 27 },
  { posizione: 18, giocatore: "Secondulfo G.", squadra: "Agenzia Raffaele Pisacane", gol: 27 },
  { posizione: 19, giocatore: "Copertino A.", squadra: "Snai San Marzano", gol: 26 },
  { posizione: 20, giocatore: "***auletta S.", squadra: "Scafati Soccer", gol: 26, nomeParziale: true },
  { posizione: 21, giocatore: "Iazzetta G.", squadra: "Team Soccer Abbagnale", gol: 26 },
  { posizione: 22, giocatore: "De Rosa F.", squadra: "Sidis Market", gol: 25 },
  { posizione: 23, giocatore: "***d'auria P.", squadra: "FC Abatesi", gol: 25, nomeParziale: true },
  { posizione: 24, giocatore: "Bassano R.", squadra: "Cartolandia", gol: 25 },
  { posizione: 25, giocatore: "Polo A.", squadra: "New Team", gol: 24 },
  { posizione: 26, giocatore: "Esposito F.", squadra: "Sidis Market", gol: 23 },
  { posizione: 27, giocatore: "Pepe S.", squadra: "Snai San Marzano", gol: 23 },
  { posizione: 28, giocatore: "***sasso M.", squadra: "Bar Alba", gol: 22, nomeParziale: true },
  { posizione: 29, giocatore: "Piezzo G.", squadra: "PM Soccer", gol: 22 },
  { posizione: 30, giocatore: "Pedone A.", squadra: "Cartolandia", gol: 21 },
  { posizione: 31, giocatore: "Cacace G.", squadra: "Team Apuzzo", gol: 20 },
  { posizione: 32, giocatore: "Mainenti F.", squadra: "Team Bar Italia", gol: 20 },
  { posizione: 33, giocatore: "***ruocco R.", squadra: "Cartolandia", gol: 19, nomeParziale: true },
  { posizione: 34, giocatore: "Amoruso G.", squadra: "Lu.Pe Pompei", gol: 19 },
  { posizione: 35, giocatore: "Panariello F.", squadra: "FC Abatesi", gol: 19 },
  { posizione: 36, giocatore: "Cirillo R.", squadra: "New Team", gol: 19 },
  { posizione: 37, giocatore: "Malafronte A.", squadra: "Team Bar Italia", gol: 19 },
  { posizione: 38, giocatore: "Izzo 2 I.", squadra: "Cofer 2000", gol: 18, nota: "Nome riportato così come mostrato nella fonte (possibile refuso dell'app di origine)." },
  { posizione: 39, giocatore: "De Rosa G.", squadra: "I Vecchi Amici", gol: 18 },
  { posizione: 40, giocatore: "Barbella E.", squadra: "FC Abatesi", gol: 18 },
  { posizione: 41, giocatore: "Manzo A.", squadra: "Sidis Market", gol: 17, nota: "Omonimo di un secondo giocatore \"Manzo A.\" alla posizione 71 (New Team): stesso nome, atleta diverso." },
  { posizione: 42, giocatore: "***menzione A.", squadra: "Agenzia Raffaele Pisacane", gol: 17, nomeParziale: true },
  { posizione: 43, giocatore: "Tortora V.", squadra: "FC Abatesi", gol: 17 },
  { posizione: 44, giocatore: "Limodio L.", squadra: "I Vecchi Amici", gol: 17 },
  { posizione: 45, giocatore: "Contaldi S.", squadra: "The Lions", gol: 16 },
  { posizione: 46, giocatore: "Izzo E.", squadra: "Cofer 2000", gol: 16 },
  { posizione: 47, giocatore: "Di Maio D.", squadra: "Scafati Soccer", gol: 16 },
  { posizione: 48, giocatore: "Cannavacciuolo U.", squadra: "Agenzia Raffaele Pisacane", gol: 15 },
  { posizione: 49, giocatore: "***ilvettini G.", squadra: "Cofer 2000", gol: 15, nomeParziale: true },
  { posizione: 50, giocatore: "Izzo I.", squadra: "Cofer 2000", gol: 15 },
  { posizione: 51, giocatore: "Raiola P.", squadra: "Sidis Market", gol: 15 },
  { posizione: 52, giocatore: "Piccirillo F.", squadra: "Kornelia", gol: 15 },
  { posizione: 53, giocatore: "Abbagnale M.", squadra: "Team Soccer Abbagnale", gol: 15 },
  { posizione: 54, giocatore: "Atripaldi G.", squadra: "Team Bar Italia", gol: 15 },
  { posizione: 55, giocatore: "***tagliamonte M.", squadra: "FC Abatesi", gol: 14, nomeParziale: true },
  { posizione: 56, giocatore: "***giordano G.", squadra: "The Lions", gol: 13, nomeParziale: true },
  { posizione: 57, giocatore: "***milo S.", squadra: "Snai San Marzano", gol: 13, nomeParziale: true },
  { posizione: 58, giocatore: "***buondonno S.", squadra: "New Team", gol: 13, nomeParziale: true },
  { posizione: 59, giocatore: "Sicignano A.", squadra: "Team Bar Italia", gol: 13 },
  { posizione: 60, giocatore: "Spisto F.", squadra: "FC Abatesi", gol: 13 },
  { posizione: 61, giocatore: "Ruotolo I.", squadra: "Bar Alba", gol: 13 },
  { posizione: 62, giocatore: "Tolentino D.", squadra: "Bar Alba", gol: 13 },
  { posizione: 63, giocatore: "Di Guglielmo D.", squadra: "Kornelia", gol: 13 },
  { posizione: 64, giocatore: "Porzio S.", squadra: "Team Soccer Abbagnale", gol: 13 },
  { posizione: 65, giocatore: "Picciau U.", squadra: "New Team", gol: 13 },
  { posizione: 66, giocatore: "Di Salvatore C.", squadra: "PM Soccer", gol: 12 },
  { posizione: 67, giocatore: "Federico G.", squadra: "Lu.Pe Pompei", gol: 12 },
  { posizione: 68, giocatore: "Petraccone A.", squadra: "Team Bar Italia", gol: 12 },
  { posizione: 69, giocatore: "Velotti A.", squadra: "Team Apuzzo", gol: 12 },
  { posizione: 70, giocatore: "Troise A.", squadra: "A.C. System Infinity", gol: 12 },
  { posizione: 71, giocatore: "Manzo A.", squadra: "New Team", gol: 12, nota: "Omonimo del \"Manzo A.\" alla posizione 41 (Sidis Market): stesso nome, atleta diverso." },
  { posizione: 72, giocatore: "Caccavale G.", squadra: "Potestà", gol: 12 },
  { posizione: 73, giocatore: "Maffettone P.", squadra: "Team Bar Italia", gol: 12 },
  { posizione: 74, giocatore: "Di Donna P.", squadra: "Cartolandia", gol: 11 },
];

const classifica202223: RigaClassificaStorica[] = [
  { posizione: 1, squadra: "Team Soccer Abbagnale", punti: 74, giocate: 34, vinte: 24, pareggiate: 2, perse: 8 },
  { posizione: 2, squadra: "Kornelia", punti: 71, giocate: 34, vinte: 22, pareggiate: 5, perse: 7 },
  { posizione: 3, squadra: "Potestà", punti: 70, giocate: 34, vinte: 21, pareggiate: 7, perse: 6 },
  { posizione: 4, squadra: "New Team", punti: 68, giocate: 34, vinte: 21, pareggiate: 5, perse: 8 },
  { posizione: 5, squadra: "Team Bar Italia", punti: 67, giocate: 34, vinte: 20, pareggiate: 7, perse: 7 },
  { posizione: 6, squadra: "FC Abatesi", punti: 66, giocate: 34, vinte: 20, pareggiate: 6, perse: 8 },
  { posizione: 7, squadra: "Bar Alba", punti: 63, giocate: 34, vinte: 19, pareggiate: 6, perse: 9 },
  { posizione: 8, squadra: "Snai San Marzano", punti: 57, giocate: 34, vinte: 16, pareggiate: 9, perse: 9 },
  { posizione: 9, squadra: "PM Soccer", punti: 46, giocate: 34, vinte: 13, pareggiate: 7, perse: 14 },
  { posizione: 10, squadra: "Cartolandia", punti: 45, giocate: 34, vinte: 13, pareggiate: 6, perse: 15 },
  { posizione: 11, squadra: "F.C. Barcellona", punti: 44, giocate: 34, vinte: 13, pareggiate: 5, perse: 16 },
  { posizione: 12, squadra: "I Vecchi Amici", punti: 42, giocate: 34, vinte: 12, pareggiate: 6, perse: 16 },
  { posizione: 13, squadra: "Scafati Soccer", punti: 41, giocate: 34, vinte: 11, pareggiate: 8, perse: 15 },
  { posizione: 14, squadra: "A.C. System Infinity", punti: 32, giocate: 34, vinte: 10, pareggiate: 2, perse: 22 },
  { posizione: 15, squadra: "Lu.Pe Pompei", punti: 32, giocate: 34, vinte: 9, pareggiate: 5, perse: 20 },
  { posizione: 16, squadra: "Il Grande Telefonino", punti: 19, giocate: 34, vinte: 5, pareggiate: 4, perse: 25 },
  { posizione: 17, squadra: "The Lions", punti: 16, giocate: 34, vinte: 4, pareggiate: 4, perse: 26 },
  { posizione: 18, squadra: "Agenzia Raffaele Pisacane", punti: 15, giocate: 34, vinte: 4, pareggiate: 3, perse: 27 },
];

export const CAMPIONATI_STORICI: CampionatoStorico[] = [
  {
    id: "2025-2026",
    stagione: "2025/2026",
    nomeCompetizione: "Campionato",
    vincitore: "New Team",
    classificaFinale: classifica202526,
    marcatori: marcatori202526,
    marcatoriIncompleti: true,
    galleryUrls: [],
    note:
      "Classifica finale e marcatori importati da fonte esterna. La classifica marcatori è troncata alla posizione 80 nella fonte originale (mancano i marcatori sotto le 10 reti); alcuni cognomi risultano parzialmente censurati dalla fonte. Le posizioni 19-20 in classifica presentano un'anomalia di punteggio, probabilmente dovuta a una sanzione disciplinare: da verificare col regolamento ufficiale della stagione.",
  },
  {
    id: "2023-2024",
    stagione: "2023/2024",
    nomeCompetizione: "Campionato",
    vincitore: "Cartolandia",
    classificaFinale: classifica202324,
    marcatori: marcatori202324,
    marcatoriIncompleti: true,
    galleryUrls: [],
    note:
      "Classifica finale e marcatori importati da fonte esterna. La classifica marcatori è troncata alla posizione 74 nella fonte originale (mancano i marcatori sotto le 11 reti); alcuni cognomi risultano parzialmente censurati dalla fonte.",
  },
  {
    id: "2022-2023",
    stagione: "2022/2023",
    nomeCompetizione: "Campionato",
    vincitore: "Team Soccer Abbagnale",
    classificaFinale: classifica202223,
    marcatori: [],
    marcatoriIncompleti: true,
    galleryUrls: [],
    note: "Classifica finale importata da fonte esterna. Dati sui marcatori non ancora disponibili per questa stagione.",
  },
];

export function getCampionatiPassati(): CampionatoStorico[] {
  return [...CAMPIONATI_STORICI].sort((a, b) => b.id.localeCompare(a.id));
}

export function getCampionatoPassatoById(id: string): CampionatoStorico | undefined {
  return CAMPIONATI_STORICI.find((c) => c.id === id);
}

export function getAlboVincitori(): { stagione: string; squadra: string }[] {
  return getCampionatiPassati()
    .filter((c) => c.vincitore)
    .map((c) => ({ stagione: c.stagione, squadra: c.vincitore! }));
}

export interface VoceAlboOroStorico {
  id: string;
  stagione: string;
  vincitore: string;
  /** Vice-campione, dedotto dalla classifica finale quando disponibile. */
  secondo?: string;
  terzo?: string;
  capocannoniere?: { giocatore: string; gol: number };
  /** Vero per la stagione di cui si sta guardando la pagina. */
  corrente?: boolean;
}

/**
 * Albo d'oro di una competizione: tutte le stagioni concluse dello stesso
 * torneo, dalla più recente alla più antica. Si usa il nome della competizione
 * come chiave perché l'archivio storico non ha ancora un id di torneo proprio:
 * ogni stagione è una voce a sé (vedi CampionatoStorico).
 */
export function getAlboOroCompetizione(nomeCompetizione: string, stagioneCorrenteId?: string): VoceAlboOroStorico[] {
  return getCampionatiPassati()
    .filter((c) => c.nomeCompetizione === nomeCompetizione && c.vincitore)
    .map((c) => {
      const capocannoniere = c.marcatori[0];
      return {
        id: c.id,
        stagione: c.stagione,
        vincitore: c.vincitore!,
        secondo: c.classificaFinale.find((r) => r.posizione === 2)?.squadra,
        terzo: c.classificaFinale.find((r) => r.posizione === 3)?.squadra,
        capocannoniere: capocannoniere ? { giocatore: capocannoniere.giocatore, gol: capocannoniere.gol } : undefined,
        corrente: c.id === stagioneCorrenteId,
      };
    });
}

/** Conteggio dei titoli vinti nella sola competizione indicata. */
export function getTitoliCompetizione(nomeCompetizione: string): { squadra: string; titoli: number }[] {
  const conteggio = new Map<string, number>();
  CAMPIONATI_STORICI.filter((c) => c.nomeCompetizione === nomeCompetizione).forEach((c) => {
    if (!c.vincitore) return;
    conteggio.set(c.vincitore, (conteggio.get(c.vincitore) ?? 0) + 1);
  });
  return [...conteggio.entries()]
    .map(([squadra, titoli]) => ({ squadra, titoli }))
    .sort((a, b) => b.titoli - a.titoli || a.squadra.localeCompare(b.squadra));
}

export function getTitoliPerSquadra(): { squadra: string; titoli: number }[] {
  const conteggio = new Map<string, number>();
  CAMPIONATI_STORICI.forEach((c) => {
    if (!c.vincitore) return;
    conteggio.set(c.vincitore, (conteggio.get(c.vincitore) ?? 0) + 1);
  });
  return [...conteggio.entries()]
    .map(([squadra, titoli]) => ({ squadra, titoli }))
    .sort((a, b) => b.titoli - a.titoli);
}

export function getRecordMarcatoreStorico(): { giocatore: string; squadra: string; gol: number; stagione: string } | undefined {
  let best: { giocatore: string; squadra: string; gol: number; stagione: string } | undefined;
  CAMPIONATI_STORICI.forEach((c) => {
    const top = c.marcatori[0];
    if (top && (!best || top.gol > best.gol)) {
      best = { giocatore: top.giocatore, squadra: top.squadra, gol: top.gol, stagione: c.stagione };
    }
  });
  return best;
}
