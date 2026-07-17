import { Info } from "lucide-react";

export function DemoBanner() {
  return (
    <div className="flex items-start gap-2.5 rounded-2xl border border-gold/20 bg-gold/5 p-4 text-xs text-gold-bright">
      <Info className="mt-0.5 size-4 shrink-0" />
      <p>
        <b>Modalità demo:</b> le modifiche in questa sezione aggiornano solo la sessione corrente. Collegando le
        variabili Supabase (vedi <code>.env.example</code> e <code>supabase/schema.sql</code>) tutte le azioni
        scrivono direttamente sul database di produzione.
      </p>
    </div>
  );
}
