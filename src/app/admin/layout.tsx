// ============================================================================
// TUTTA L'AREA ORGANIZZATORE È SEMPRE DINAMICA — mai generata staticamente
// ----------------------------------------------------------------------------
// Causa reale di "salvo, ricarico la pagina, torna alla versione precedente",
// segnalato più volte: alcune pagine admin (quelle con generateStaticParams,
// come la gestione di una singola partita o competizione) venivano generate
// staticamente e messe in cache dal SERVER per il tetto di ISR del layout
// radice pubblico (300s) — nessuna scrittura le invalidava mai, perché si
// era sempre assunto che le pagine admin fossero "già dinamiche di loro" in
// quanto protette da autenticazione. Vero per l'accesso (il middleware
// blocca /admin/* a chi non ha il ruolo giusto), falso per la cache di
// QUESTE pagine: un salvataggio scriveva i dati giusti, ma il server
// continuava a servire l'HTML pre-generato di prima — e nemmeno un reload
// del browser lo salta, perché è una cache del server, non della cronologia
// locale.
//
// `force-dynamic` qui, sul layout condiviso da ogni route sotto /admin,
// chiude il problema una volta sola per tutte le pagine presenti e future,
// invece di doverlo ricordare in ciascuna: sono pagine a basso traffico (le
// usa solo l'organizzatore), non serve la generazione statica da nessuna
// parte qui dentro.
// ============================================================================
import { archivioRaggiungibile } from "@/lib/store/file-store";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Se il database non risponde (es. progetto Supabase in pausa) le pagine
  // mostrerebbero una lega vuota come se i dati fossero spariti, e ogni
  // salvataggio fallirebbe: lo si dice chiaramente invece di lasciarlo intuire.
  const raggiungibile = await archivioRaggiungibile();
  return (
    <>
      {!raggiungibile && (
        <div className="mx-auto mt-4 max-w-6xl px-4">
          <div className="rounded-xl border border-danger/50 bg-danger/10 p-4 text-sm">
            <p className="font-bold text-danger">Database non raggiungibile — i dati non vengono mostrati né salvati</p>
            <p className="mt-1 text-muted-foreground">
              I dati non sono persi. Controlla su supabase.com che il progetto non sia in pausa (se lo è, premi
              &quot;Restore&quot;), poi ricarica questa pagina.
            </p>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
