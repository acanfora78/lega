import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Le pagine pubbliche sono quasi tutte statiche (SSG): il router del
    // browser le precarica in automatico appena un link compare nella barra
    // di navigazione — che è sempre visibile, quindi succede in continuazione
    // — e per default le tiene in cache 5 minuti prima di rifare la
    // richiesta. Il server viene invalidato subito ad ogni scrittura admin
    // (revalidatePath, vedi src/lib/revalidate.ts), ma quella cache è
    // lato browser: un salvataggio corretto sul server restava comunque
    // invisibile fino a un reload vero, perché router.refresh() pulisce
    // solo la pagina corrente, non le altre già precaricate nella stessa
    // scheda. A 0 ogni navigazione richiede davvero i dati aggiornati; la
    // shell (header, nav) resta comunque instantanea, cambia solo il
    // contenuto della pagina.
    staleTimes: {
      static: 0,
    },
  },
};

export default nextConfig;
