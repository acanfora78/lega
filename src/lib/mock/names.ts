export const NOMI = [
  "Antonio", "Giuseppe", "Marco", "Francesco", "Salvatore", "Vincenzo", "Luigi",
  "Alessandro", "Gennaro", "Raffaele", "Ciro", "Pasquale", "Carmine", "Enzo",
  "Mario", "Roberto", "Stefano", "Fabio", "Massimo", "Paolo", "Michele",
  "Domenico", "Angelo", "Nicola", "Aniello", "Rosario", "Bruno", "Emanuele",
  "Davide", "Simone", "Andrea", "Luca", "Matteo", "Riccardo", "Gaetano",
];

export const COGNOMI = [
  "Esposito", "Russo", "Romano", "Ferrari", "Marino", "Greco", "Conte",
  "De Luca", "Mancini", "Costa", "Fontana", "Rizzo", "Amato", "Barbato",
  "Cirillo", "Coppola", "D'Amico", "Del Prete", "Di Domenico", "Fusco",
  "Guarino", "Iovine", "Landi", "Longo", "Maiorano", "Napolitano", "Orlando",
  "Palumbo", "Pepe", "Petrosino", "Sorrentino", "Torre", "Vitale", "Improta",
  "Carotenuto", "Alfano", "Apicella", "Basile", "Cavallo", "D'Auria",
];

export function nomeCompleto(rand: () => number, usati: Set<string>): { nome: string; cognome: string } {
  let tentativi = 0;
  while (tentativi < 50) {
    const nome = NOMI[Math.floor(rand() * NOMI.length)];
    const cognome = COGNOMI[Math.floor(rand() * COGNOMI.length)];
    const key = `${nome} ${cognome}`;
    if (!usati.has(key)) {
      usati.add(key);
      return { nome, cognome };
    }
    tentativi++;
  }
  const nome = NOMI[Math.floor(rand() * NOMI.length)];
  const cognome = COGNOMI[Math.floor(rand() * COGNOMI.length)];
  return { nome, cognome: `${cognome} II` };
}
