/**
 * Parser CSV minimale (RFC4180: virgole tra campi, campi tra virgolette per
 * contenere virgole o virgolette letterali `""`). Basta per un file caricato
 * dall'organizzatore — niente di più, niente libreria esterna per questo.
 */
export function parseCsv(testo: string): string[][] {
  const righe: string[][] = [];
  let riga: string[] = [];
  let campo = "";
  let inQuote = false;

  // Normalizza i fine riga e toglie un eventuale BOM iniziale (Excel lo aggiunge sempre).
  const s = testo.replace(/^﻿/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuote) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          campo += '"';
          i++;
        } else {
          inQuote = false;
        }
      } else {
        campo += c;
      }
      continue;
    }
    if (c === '"') {
      inQuote = true;
    } else if (c === ",") {
      riga.push(campo);
      campo = "";
    } else if (c === "\n") {
      riga.push(campo);
      righe.push(riga);
      riga = [];
      campo = "";
    } else {
      campo += c;
    }
  }
  // Ultimo campo/riga, se il file non finisce con un a-capo.
  if (campo !== "" || riga.length > 0) {
    riga.push(campo);
    righe.push(riga);
  }

  return righe.filter((r) => r.some((c) => c.trim() !== ""));
}

/** Righe come oggetti chiave→valore, usando la prima riga come intestazione (case-insensitive, spazi tolti). */
export function csvAOggetti(testo: string): Record<string, string>[] {
  const righe = parseCsv(testo);
  if (righe.length === 0) return [];
  const intestazione = righe[0].map((h) => h.trim().toLowerCase());
  return righe.slice(1).map((riga) => {
    const obj: Record<string, string> = {};
    intestazione.forEach((chiave, i) => (obj[chiave] = (riga[i] ?? "").trim()));
    return obj;
  });
}
