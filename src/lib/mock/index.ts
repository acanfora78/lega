import { buildLegaData } from "./generate";

// Costruita una sola volta per processo: funge da "database in memoria" per
// la demo. La data layer in src/lib/data/*.ts espone funzioni pure che, in
// produzione, verranno sostituite da query Supabase con la stessa firma.
let cached: ReturnType<typeof buildLegaData> | null = null;

export function legaData() {
  if (!cached) cached = buildLegaData();
  return cached;
}

export { NOW } from "./now";
