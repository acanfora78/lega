import type { CapacitorConfig } from "@capacitor/cli";

// ============================================================================
// WRAPPER NATIVO — carica il sito Next.js live, non una copia statica
// ----------------------------------------------------------------------------
// L'app usa server components, route API e cookie di sessione per l'area
// organizzatore: un export statico (next export) perderebbe tutto questo.
// Capacitor qui fa da guscio nativo che apre direttamente `server.url`
// dentro una WKWebView, mentre `webDir` (ios-shell/) esiste solo perché la
// configurazione lo richiede — contiene solo la schermata mostrata per
// l'istante prima che la pagina remota sia pronta.
// ============================================================================
const config: CapacitorConfig = {
  appId: "it.legacalciooverquaranta.legaover40",
  appName: "Lega Over 40",
  webDir: "ios-shell",
  server: {
    // TODO: sostituire con l'URL di produzione reale confermato dall'utente.
    url: "https://REPLACE-WITH-PRODUCTION-URL",
    cleartext: false,
  },
  ios: {
    contentInset: "automatic",
    backgroundColor: "#05101f",
  },
};

export default config;
