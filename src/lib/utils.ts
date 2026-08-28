import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { FUSO_LEGA } from "@/lib/timezone";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// timeZone forzato a Europe/Rome: senza specificarlo esplicitamente, il
// fuso usato è quello ambientale di chi esegue il formato — il browser
// dell'utente (già Europe/Rome) ma il processo Node lato server (UTC su
// Vercel). Un orario reso in un Server Component finirebbe quindi diverso
// da quello del client, sia in visualizzazione che, con l'idratazione React,
// come mismatch server/client. Forzarlo qui rende entrambi coerenti e
// sempre corretti per il pubblico italiano, ovunque giri il rendering.
export function formatDateIt(date: string | Date, opts?: Intl.DateTimeFormatOptions) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("it-IT", {
    timeZone: FUSO_LEGA,
    day: "2-digit",
    month: "long",
    ...opts,
  }).format(d);
}

export function formatTimeIt(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("it-IT", {
    timeZone: FUSO_LEGA,
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatDateShort(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("it-IT", {
    timeZone: FUSO_LEGA,
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(d);
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * In un campionato Over 40 il giocatore che non ha ancora compiuto 40 anni è
 * un'eccezione al regolamento (fascia 35–39), quindi va segnalato in tutte le
 * liste con una stellina.
 */
export const ETA_MINIMA_REGOLAMENTO = 40;

export function isUnderQuaranta(eta: number | undefined): boolean {
  return typeof eta === "number" && eta > 0 && eta < ETA_MINIMA_REGOLAMENTO;
}

/** Età compiuta a partire dalla data di nascita, indipendente dal campo `eta` salvato. */
export function etaDaDataNascita(dataNascita: string | undefined): number | undefined {
  if (!dataNascita) return undefined;
  const nascita = new Date(dataNascita);
  if (Number.isNaN(nascita.getTime())) return undefined;
  const oggi = new Date();
  let eta = oggi.getFullYear() - nascita.getFullYear();
  const compleannoPassato =
    oggi.getMonth() > nascita.getMonth() ||
    (oggi.getMonth() === nascita.getMonth() && oggi.getDate() >= nascita.getDate());
  if (!compleannoPassato) eta -= 1;
  return eta;
}

export function slugify(text: string) {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
