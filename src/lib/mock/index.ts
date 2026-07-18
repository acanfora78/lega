// Compatibilità: la data layer in src/lib/data/*.ts importa `legaData` da qui.
// Il vero store (persistito su file, nessuna modalità demo) vive in
// src/lib/store/file-store.ts.
export { getStore as legaData } from "@/lib/store/file-store";
export type { LegaData, ImpostazioniLega } from "@/lib/store/file-store";
