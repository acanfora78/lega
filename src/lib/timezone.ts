/**
 * L'orario della lega è sempre quello italiano (Europe/Rome, con cambio
 * automatico CET/CEST), ma il processo Node che esegue le route API su
 * Vercel gira in UTC. `new Date("2026-05-01T15:00:00")` (senza offset)
 * viene quindi interpretato come le 15:00 UTC, non le 15:00 di Roma: in
 * piena ora legale (CEST, UTC+2) la partita finiva salvata 2 ore avanti
 * rispetto a quanto inserito in form o CSV. Le funzioni qui sotto convertono
 * esplicitamente un orario "muro" di Roma nell'istante UTC corretto, e
 * viceversa forzano la visualizzazione sempre nel fuso di Roma
 * indipendentemente da dove gira il rendering (server in UTC o browser).
 */
export const FUSO_LEGA = "Europe/Rome";

/** Converte una coppia data ("YYYY-MM-DD") + ora ("HH:MM") intesa come orario locale di Roma nell'istante UTC corrispondente. */
export function parseDataOraRoma(data: string, ora: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data);
  const [oreStr, minutiStr] = (ora || "15:00").split(":");
  if (!match) return new Date(NaN);

  const [, annoStr, meseStr, giornoStr] = match;
  const anno = Number(annoStr);
  const mese = Number(meseStr);
  const giorno = Number(giornoStr);
  const ore = Number(oreStr);
  const minuti = Number(minutiStr ?? "0");
  if ([anno, mese, giorno, ore, minuti].some((n) => Number.isNaN(n))) return new Date(NaN);

  // 1. Ipotesi iniziale: tratta i campi come se fossero già UTC.
  const ipotesi = new Date(Date.UTC(anno, mese - 1, giorno, ore, minuti));

  // 2. Legge che orario mostrerebbe Roma per quell'istante: la differenza tra
  //    i campi desiderati e quelli mostrati a Roma è l'offset da applicare.
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: FUSO_LEGA,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const parti = Object.fromEntries(dtf.formatToParts(ipotesi).map((p) => [p.type, p.value]));
  const oraRoma = parti.hour === "24" ? 0 : Number(parti.hour);
  const comeUtc = Date.UTC(Number(parti.year), Number(parti.month) - 1, Number(parti.day), oraRoma, Number(parti.minute));
  const offsetMs = comeUtc - ipotesi.getTime();

  // 3. Sottrae l'offset: l'istante corretto è quello che, visto da Roma, mostra esattamente i campi voluti.
  return new Date(ipotesi.getTime() - offsetMs);
}
