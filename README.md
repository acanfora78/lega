# Lega Calcio Over 40 — Campo Sportivo Santa Teresa

L'app ufficiale della Lega Calcio Over 40 di Scafati (SA): centro digitale del campionato, non un semplice sito di risultati. Home dinamica, Live Match Center, classifiche automatiche, statistiche, profili giocatore con carriera nella Lega, Hall of Fame, Media Center e un'area organizzatore completa per gestire l'intero torneo.

## Stack tecnologico

- **Next.js 16** (App Router, React 19, Turbopack)
- **TypeScript** end-to-end
- **Tailwind CSS v4** con design system custom (dark mode, verde + oro, glassmorphism)
- **Radix UI** primitives (componenti stile shadcn scritti a mano)
- **Framer Motion** per le animazioni premium
- **Supabase** (Postgres + Auth + Realtime) come backend di produzione — schema completo in `supabase/schema.sql`
- **PWA**: manifest, service worker, notifiche push (Web Push / VAPID)

## Avvio rapido

```bash
npm install
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000). L'app funziona subito con un ricco dataset demo generato in modo deterministico (`src/lib/mock`), senza bisogno di configurare Supabase: 8 squadre, oltre 120 giocatori, 14 giornate di campionato, classifiche, statistiche, news, sponsor, Hall of Fame e premi settimanali.

## Passare a Supabase in produzione

1. Crea un progetto su [supabase.com](https://supabase.com) ed esegui `supabase/schema.sql` nel SQL editor: crea tutte le tabelle, i trigger di automazione (ricalcolo classifica, statistiche giocatore, notifiche sui gol) e le policy di Row Level Security.
2. Copia `.env.example` in `.env.local` e compila le variabili (URL/anon key Supabase, chiavi VAPID per le notifiche push, chiave OpenWeather opzionale).
3. Sostituisci le funzioni in `src/lib/data/*.ts` (oggi lette da `src/lib/mock`) con query verso `src/lib/supabase/client.ts` / `server.ts`: la forma dei dati restituiti (vedi `src/lib/types.ts`) è già identica allo schema Postgres, quindi lo switch non richiede modifiche ai componenti.
4. Assegna il claim `app_metadata.role = "organizzatore"` agli account dello staff per sbloccare le policy di scrittura e l'accesso a `/admin`.

## Struttura del progetto

```
src/
  app/            Pagine (App Router): home, partite, classifica, squadre,
                   giocatori, statistiche, news, media, hall-of-fame, campo,
                   ricerca, altro, profilo, auth, admin (area organizzatore)
  components/
    ui/           Primitive stile shadcn (Radix + Tailwind, scritte a mano)
    brand/        Stemmi squadra, avatar giocatore e sfondi generati via SVG
    layout/       Bottom nav, header
    match/        Live Match Center: timeline, formazioni, statistiche, chat
    home/ team/ player/ news/ media/ statistiche/ admin/  Componenti di dominio
  lib/
    types.ts      Modello di dominio, rispecchia 1:1 supabase/schema.sql
    mock/          Generatore dati demo deterministico
    data/          Data layer (oggi legge da mock, domani da Supabase)
    supabase/      Client browser/server/middleware
supabase/
  schema.sql       Schema Postgres completo con RLS e trigger di automazione
public/
  manifest.webmanifest, sw.js, icons/   PWA
```

## Funzionalità principali

- **Home**: hero con prossima partita/diretta e countdown, partite di oggi, ultimi risultati, anteprima classifica, top marcatori/assist, MVP della settimana, news, media, sponsor.
- **Live Match Center**: cronaca minuto per minuto, formazioni con voti live, statistiche (possesso, tiri, corner, falli...), meteo, arbitro, chat di partita moderata.
- **Classifica**: generale, casa, trasferta, miglior attacco/difesa, Fair Play, forma.
- **Squadre & Giocatori**: rose complete, staff, storico risultati, trofei, e per ogni giocatore una sezione **Carriera nella Lega** con lo storico stagione per stagione.
- **Centro Statistiche**: marcatori, assist, miglior portiere, clean sheet, ammoniti, espulsi, presenze, MVP.
- **Hall of Fame**: albo d'oro, record storici, squadra più titolata.
- **Area Organizzatore** (`/admin`): dashboard, gestione squadre/giocatori/partite/risultati/gol/cartellini/MVP, news, galleria, sponsor, notifiche push, impostazioni di lega.

## Script disponibili

```bash
npm run dev     # sviluppo con Turbopack
npm run build   # build di produzione (genera staticamente tutte le pagine)
npm run start   # avvia il server di produzione
npm run lint    # ESLint
```
