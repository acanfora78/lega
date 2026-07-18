# Lega Calcio Over 40 — Campo Sportivo Santa Teresa

L'app ufficiale della Lega: centro digitale del campionato, non un semplice sito di risultati. Home dinamica, Live Match Center, classifiche automatiche, statistiche, profili giocatore con carriera nella Lega, archivio dei Campionati Passati, Hall of Fame, Media Center e un'area organizzatore completa per gestire l'intero torneo.

## Stack tecnologico

- **Next.js 16** (App Router, React 19, Turbopack)
- **TypeScript** end-to-end
- **Tailwind CSS v4** con design system custom (dark mode, verde + oro, glassmorphism)
- **Radix UI** primitives (componenti stile shadcn scritti a mano)
- **Framer Motion** per le animazioni premium
- **Supabase** (Postgres + Auth + Realtime) come backend di produzione — schema completo in `supabase/schema.sql`
- **PWA**: manifest, service worker, notifiche push (Web Push / VAPID)

## Stato dei dati e persistenza

La piattaforma parte **pulita**: nessuna squadra, giocatore, partita, news o sponsor di esempio. La stagione corrente è vuota e pronta per l'inserimento reale dall'area organizzatore (`/admin`).

L'unico contenuto precaricato è l'**archivio storico reale** (`src/lib/data/storico.ts`): le classifiche finali e le classifiche marcatori delle stagioni 2022/2023, 2023/2024 e 2025/2026, trascritte dagli export ufficiali forniti dalla Lega. Alcune fonti sono parziali (cognomi censurati, liste marcatori troncate, un'anomalia di punteggio nella stagione 2025/2026): questi limiti sono segnalati in chiaro nell'interfaccia (badge, tooltip, note) invece di essere nascosti, così l'area organizzatore può correggerli quando avrà le fonti complete.

**Nessuna modalità demo**: ogni azione dell'area organizzatore (crea/modifica/elimina squadra, giocatore, partita, gol, cartellino, MVP, news, sponsor, album, notifica, impostazioni) passa da Route Handler dedicati sotto `src/app/api/admin/*`, che scrivono realmente nello store server-side (`src/lib/store/file-store.ts`). Di default questo store è **basato su file** (`.data/league.json`, escluso dal repository via `.gitignore`): sopravvive a refresh, riavvii del processo e sessioni/utenti diversi, perché legge e scrive sempre da disco (nessuna cache in memoria). Funziona su qualunque hosting con filesystem persistente (VPS, Docker, Railway, Render, Fly.io, `next start` su server proprio). Su piattaforme serverless "pure" (Vercel/Netlify Functions), dove il filesystem è effimero tra un'invocazione e l'altra, va sostituito con Supabase seguendo la sezione successiva — la forma dei dati resta identica, va toccato solo `src/lib/store/file-store.ts`.

## Avvio rapido

```bash
npm install
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000). L'app funziona subito, con l'archivio storico reale già consultabile in **Campionati Passati** e **Hall of Fame**, e il resto della piattaforma pronto per essere popolato da `/admin`.

## Passare a Supabase in produzione

1. Crea un progetto su [supabase.com](https://supabase.com) ed esegui `supabase/schema.sql` nel SQL editor: crea tutte le tabelle, i trigger di automazione (ricalcolo classifica, statistiche giocatore, notifiche sui gol) e le policy di Row Level Security.
2. Copia `.env.example` in `.env.local` e compila le variabili (URL/anon key Supabase, chiavi VAPID per le notifiche push, chiave OpenWeather opzionale).
3. Sostituisci le funzioni in `src/lib/store/file-store.ts` (oggi lette/scritte su `.data/league.json`) con query verso `src/lib/supabase/client.ts` / `server.ts`: la forma dei dati restituiti (vedi `src/lib/types.ts`) è già identica allo schema Postgres, quindi lo switch non richiede modifiche né ai componenti né alle route `src/app/api/admin/*`.

### Creare il Super Admin (sicuro, nessuna password nel codice)

L'accesso a `/admin` è già protetto da `src/middleware.ts` + `src/lib/supabase/middleware.ts`: solo un utente Supabase con `app_metadata.role = "organizzatore"` può entrare. **La password non va mai scritta nel codice, in `.env`, o in qualunque file che finisca nel repository.** Per creare l'account dello staff:

1. Dashboard Supabase → **Authentication → Users → Add user**, inserisci l'email dell'organizzatore e imposta la password direttamente lì (non transita mai per il codice).
2. Sempre dalla dashboard, apri l'utente creato e imposta come **Raw App Meta Data**:
   ```json
   { "role": "organizzatore" }
   ```
3. Da questo momento quell'account può accedere a `/admin`; tutte le policy di scrittura in `supabase/schema.sql` (funzione `is_organizzatore()`) si sbloccano automaticamente per lui.

In alternativa, per creare l'utente da script (es. in CI), usare la Admin API di Supabase con la `SUPABASE_SERVICE_ROLE_KEY` **solo in locale o in un secret manager**, mai committata:
```bash
curl -X POST "$NEXT_PUBLIC_SUPABASE_URL/auth/v1/admin/users" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"ORGANIZZATORE@ESEMPIO.IT","password":"***","email_confirm":true,"app_metadata":{"role":"organizzatore"}}'
```

## Struttura del progetto

```
src/
  app/            Pagine (App Router): home, partite, classifica, squadre,
                   giocatori, statistiche, news, media, campionati-passati,
                   hall-of-fame, campo, ricerca, altro, profilo, auth,
                   admin (area organizzatore)
  components/
    ui/           Primitive stile shadcn (Radix + Tailwind, scritte a mano)
    brand/        Stemmi squadra, avatar giocatore e sfondi generati via SVG
    layout/       Bottom nav, header
    match/        Live Match Center: timeline, formazioni, statistiche, chat
    storico/       Componenti per l'archivio dei Campionati Passati
    home/ team/ player/ news/ media/ statistiche/ admin/  Componenti di dominio
  lib/
    types.ts      Modello di dominio, rispecchia 1:1 supabase/schema.sql
    store/file-store.ts  Store reale su file (.data/league.json), nessuna cache
    mock/          Ri-esporta il file-store (compatibilità con il resto del data layer)
    data/          Data layer di sola lettura (oggi legge dal file-store, domani da Supabase)
    data/storico.ts  Archivio reale delle stagioni concluse (classifiche/marcatori)
    supabase/      Client browser/server/middleware
supabase/
  schema.sql       Schema Postgres completo con RLS e trigger di automazione
public/
  manifest.webmanifest, sw.js, icons/   PWA
```

## Funzionalità principali

- **Home**: hero con prossima partita/diretta e countdown, partite di oggi, ultimi risultati, anteprima classifica, top marcatori/assist, MVP della settimana, news, media, sponsor, evidenza sui Campionati Passati.
- **Live Match Center**: cronaca minuto per minuto, formazioni con voti live, statistiche (possesso, tiri, corner, falli...), meteo, arbitro, chat di partita moderata.
- **Classifica**: generale, casa, trasferta, miglior attacco/difesa, Fair Play, forma.
- **Squadre & Giocatori**: rose complete, staff, storico risultati, trofei, e per ogni giocatore una sezione **Carriera nella Lega** con lo storico stagione per stagione.
- **Centro Statistiche**: marcatori, assist, miglior portiere, clean sheet, ammoniti, espulsi, presenze, MVP.
- **Campionati Passati**: archivio reale delle stagioni concluse, con classifica finale e classifica marcatori.
- **Hall of Fame**: squadra più titolata e record calcolati automaticamente dall'archivio storico reale.
- **Area Organizzatore** (`/admin`): dashboard, gestione squadre/giocatori/partite/risultati/gol/cartellini/MVP, news, galleria, sponsor, notifiche push, impostazioni di lega — accesso riservato al Super Admin.

## Script disponibili

```bash
npm run dev     # sviluppo con Turbopack
npm run build   # build di produzione (genera staticamente tutte le pagine)
npm run start   # avvia il server di produzione
npm run lint    # ESLint
```

## Prossimi passi (roadmap)

Alcune parti della richiesta completa richiedono un secondo passaggio dedicato, dato il perimetro:

- **Competition builder generico**: i tipi (`Competizione`, `FaseCompetizione`, formati personalizzabili) sono già definiti in `src/lib/types.ts`; manca l'interfaccia guidata lato admin per creare campionati/coppe/tornei/gironi con criteri di classifica configurabili.
- **Persistenza su Supabase**: la persistenza reale multi-sessione oggi è garantita dallo store su file (`.data/league.json`); su hosting serverless puro (Vercel/Netlify) va migrata a Supabase seguendo la sezione dedicata sopra.
- **CMS avanzato**: media library centralizzata, SEO, homepage/menu builder, backup/ripristino, log, multi-utente con ruoli e permessi granulari (oggi è previsto un solo Super Admin).
