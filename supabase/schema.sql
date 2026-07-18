-- ============================================================================
-- LEGA CALCIO OVER 40 — Campo Sportivo Santa Teresa, Scafati
-- Schema Postgres / Supabase — produzione
-- ============================================================================
-- Convenzioni:
--   * chiavi primarie uuid (default gen_random_uuid())
--   * timestamp con timezone ovunque
--   * RLS abilitata su tutte le tabelle: lettura pubblica, scrittura riservata
--     al ruolo "organizzatore" (claim custom su auth.users -> app_metadata.role)
--   * i trigger ricalcolano automaticamente classifica / statistiche / home
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- ENUM
-- ---------------------------------------------------------------------------
create type ruolo_giocatore as enum ('Portiere', 'Difensore', 'Centrocampista', 'Attaccante');
create type piede as enum ('Destro', 'Sinistro', 'Ambidestro');
create type stato_partita as enum ('programmata', 'live', 'intervallo', 'conclusa', 'rinviata', 'sospesa');
create type tipo_evento as enum (
  'goal', 'autogoal', 'rigore_segnato', 'rigore_sbagliato', 'assist',
  'ammonizione', 'secondo_giallo', 'espulsione', 'sostituzione',
  'inizio_partita', 'fine_primo_tempo', 'inizio_secondo_tempo', 'fine_partita', 'mvp'
);
create type livello_sponsor as enum ('platinum', 'gold', 'silver');
create type categoria_articolo as enum ('comunicato', 'articolo', 'disciplinare', 'evento');
create type ruolo_utente as enum ('tifoso', 'giocatore', 'organizzatore');

-- ---------------------------------------------------------------------------
-- STAGIONI
-- ---------------------------------------------------------------------------
create table stagioni (
  id uuid primary key default gen_random_uuid(),
  etichetta text not null unique,
  data_inizio date not null,
  data_fine date not null,
  attuale boolean not null default false,
  campione_squadra_id uuid,
  created_at timestamptz not null default now()
);
create unique index one_stagione_attuale on stagioni (attuale) where attuale;

-- ---------------------------------------------------------------------------
-- SPONSOR
-- ---------------------------------------------------------------------------
create table sponsor (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  logo_url text not null,
  sito text,
  livello livello_sponsor not null default 'silver',
  descrizione text,
  attivo boolean not null default true,
  ordinamento int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- SQUADRE
-- ---------------------------------------------------------------------------
create table squadre (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nome text not null,
  nome_breve text not null,
  logo_url text,
  cover_url text,
  colore_primario text not null default '#16a34a',
  colore_secondario text not null default '#d9b84a',
  descrizione text,
  fondazione int,
  capitano_id uuid,
  vice_capitano_id uuid,
  allenatore text,
  sede_sociale text,
  attiva boolean not null default true,
  created_at timestamptz not null default now()
);

create table squadre_sponsor (
  squadra_id uuid references squadre(id) on delete cascade,
  sponsor_id uuid references sponsor(id) on delete cascade,
  primary key (squadra_id, sponsor_id)
);

create table squadre_gallery (
  id uuid primary key default gen_random_uuid(),
  squadra_id uuid references squadre(id) on delete cascade,
  url text not null,
  didascalia text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- GIOCATORI
-- ---------------------------------------------------------------------------
create table giocatori (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nome text not null,
  cognome text not null,
  foto_url text,
  numero_maglia int,
  ruolo ruolo_giocatore not null,
  data_nascita date not null,
  altezza_cm int,
  peso_kg int,
  piede_preferito piede default 'Destro',
  squadra_id uuid references squadre(id) on delete set null,
  bio text,
  attivo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table squadre add constraint fk_capitano foreign key (capitano_id) references giocatori(id) on delete set null;
alter table squadre add constraint fk_vice_capitano foreign key (vice_capitano_id) references giocatori(id) on delete set null;

create table giocatori_gallery (
  id uuid primary key default gen_random_uuid(),
  giocatore_id uuid references giocatori(id) on delete cascade,
  url text not null,
  created_at timestamptz not null default now()
);

create table giocatori_video (
  id uuid primary key default gen_random_uuid(),
  giocatore_id uuid references giocatori(id) on delete cascade,
  titolo text not null,
  url text not null,
  thumbnail_url text,
  created_at timestamptz not null default now()
);

-- Statistiche stagionali per giocatore — aggiornate dai trigger sugli eventi partita
create table statistiche_giocatore_stagione (
  id uuid primary key default gen_random_uuid(),
  giocatore_id uuid references giocatori(id) on delete cascade,
  stagione_id uuid references stagioni(id) on delete cascade,
  squadra_id uuid references squadre(id) on delete cascade,
  presenze int not null default 0,
  minuti_giocati int not null default 0,
  goal int not null default 0,
  assist int not null default 0,
  ammonizioni int not null default 0,
  espulsioni int not null default 0,
  somma_voti numeric not null default 0,
  num_voti int not null default 0,
  mvp int not null default 0,
  clean_sheet int not null default 0,
  gol_subiti int not null default 0,
  unique (giocatore_id, stagione_id)
);

create table giocatori_trofei (
  id uuid primary key default gen_random_uuid(),
  giocatore_id uuid references giocatori(id) on delete cascade,
  stagione_id uuid references stagioni(id),
  titolo text not null
);

-- ---------------------------------------------------------------------------
-- CALENDARIO / PARTITE
-- ---------------------------------------------------------------------------
create table partite (
  id uuid primary key default gen_random_uuid(),
  stagione_id uuid references stagioni(id) on delete cascade,
  giornata int not null,
  data_ora timestamptz not null,
  stato stato_partita not null default 'programmata',
  minuto_corrente int,
  squadra_casa_id uuid references squadre(id),
  squadra_trasferta_id uuid references squadre(id),
  gol_casa int not null default 0,
  gol_trasferta int not null default 0,
  arbitro text,
  campo text not null default 'Campo Sportivo Santa Teresa',
  meteo_temperatura_c numeric,
  meteo_condizione text,
  meteo_vento_kmh numeric,
  meteo_umidita numeric,
  mvp_giocatore_id uuid references giocatori(id),
  highlight_url text,
  partita_della_settimana boolean not null default false,
  note text,
  created_at timestamptz not null default now(),
  check (squadra_casa_id <> squadra_trasferta_id)
);

create index idx_partite_stagione_giornata on partite (stagione_id, giornata);
create index idx_partite_stato on partite (stato);
create index idx_partite_data on partite (data_ora);

create table partite_eventi (
  id uuid primary key default gen_random_uuid(),
  partita_id uuid references partite(id) on delete cascade,
  minuto int not null,
  minuto_recupero int,
  tempo int not null default 1 check (tempo in (1, 2)),
  tipo tipo_evento not null,
  squadra_id uuid references squadre(id),
  giocatore_id uuid references giocatori(id),
  giocatore_entrata_id uuid references giocatori(id),
  assist_giocatore_id uuid references giocatori(id),
  dettaglio text,
  created_at timestamptz not null default now()
);
create index idx_eventi_partita on partite_eventi (partita_id, minuto);

create table partite_formazioni (
  id uuid primary key default gen_random_uuid(),
  partita_id uuid references partite(id) on delete cascade,
  squadra_id uuid references squadre(id),
  giocatore_id uuid references giocatori(id),
  titolare boolean not null default true,
  numero int,
  ruolo ruolo_giocatore,
  voto_live numeric,
  ammonito boolean not null default false,
  espulso boolean not null default false,
  sostituito boolean not null default false,
  unique (partita_id, giocatore_id)
);

create table partite_statistiche (
  partita_id uuid primary key references partite(id) on delete cascade,
  possesso_casa numeric not null default 50,
  possesso_trasferta numeric not null default 50,
  tiri_casa int not null default 0,
  tiri_trasferta int not null default 0,
  tiri_porta_casa int not null default 0,
  tiri_porta_trasferta int not null default 0,
  corner_casa int not null default 0,
  corner_trasferta int not null default 0,
  falli_casa int not null default 0,
  falli_trasferta int not null default 0,
  fuorigioco_casa int not null default 0,
  fuorigioco_trasferta int not null default 0,
  parate_casa int not null default 0,
  parate_trasferta int not null default 0
);

create table partite_gallery (
  id uuid primary key default gen_random_uuid(),
  partita_id uuid references partite(id) on delete cascade,
  url text not null,
  created_at timestamptz not null default now()
);

create table partite_chat (
  id uuid primary key default gen_random_uuid(),
  partita_id uuid references partite(id) on delete cascade,
  utente_id uuid references auth.users(id) on delete cascade,
  messaggio text not null,
  moderato boolean not null default false,
  nascosto boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- CLASSIFICA — vista materializzata ricalcolata dal trigger sulle partite concluse
-- ---------------------------------------------------------------------------
create table classifica (
  stagione_id uuid references stagioni(id) on delete cascade,
  squadra_id uuid references squadre(id) on delete cascade,
  posizione int,
  punti_casa int not null default 0,
  punti_trasferta int not null default 0,
  giocate int not null default 0,
  vinte int not null default 0,
  pareggiate int not null default 0,
  perse int not null default 0,
  gol_fatti int not null default 0,
  gol_subiti int not null default 0,
  punti int not null default 0,
  ammonizioni int not null default 0,
  espulsioni int not null default 0,
  ultime_cinque text[] not null default '{}',
  primary key (stagione_id, squadra_id)
);

-- ---------------------------------------------------------------------------
-- NEWS / COMUNICATI
-- ---------------------------------------------------------------------------
create table articoli (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  titolo text not null,
  sommario text,
  contenuto text not null,
  copertina_url text,
  categoria categoria_articolo not null default 'articolo',
  autore text not null default 'Redazione Lega',
  in_evidenza boolean not null default false,
  pubblicato_il timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table articoli_squadre (
  articolo_id uuid references articoli(id) on delete cascade,
  squadra_id uuid references squadre(id) on delete cascade,
  primary key (articolo_id, squadra_id)
);

-- ---------------------------------------------------------------------------
-- MEDIA CENTER
-- ---------------------------------------------------------------------------
create table album_media (
  id uuid primary key default gen_random_uuid(),
  titolo text not null,
  copertina_url text,
  tipo text not null default 'foto' check (tipo in ('foto', 'video')),
  data date not null default current_date,
  partita_id uuid references partite(id) on delete set null,
  squadra_id uuid references squadre(id) on delete set null,
  created_at timestamptz not null default now()
);

create table album_media_items (
  id uuid primary key default gen_random_uuid(),
  album_id uuid references album_media(id) on delete cascade,
  url text not null,
  thumbnail_url text,
  tipo text not null default 'foto' check (tipo in ('foto', 'video')),
  likes int not null default 0,
  ordinamento int not null default 0
);

create table media_reazioni (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references album_media_items(id) on delete cascade,
  utente_id uuid references auth.users(id) on delete cascade,
  tipo text not null default 'like',
  created_at timestamptz not null default now(),
  unique (item_id, utente_id, tipo)
);

-- ---------------------------------------------------------------------------
-- PREMI / HALL OF FAME
-- ---------------------------------------------------------------------------
create table premi_settimanali (
  id uuid primary key default gen_random_uuid(),
  stagione_id uuid references stagioni(id) on delete cascade,
  giornata int not null,
  tipo text not null check (tipo in ('mvp_giornata', 'squadra_della_settimana', 'partita_della_settimana', 'gol_della_settimana')),
  giocatore_id uuid references giocatori(id),
  squadra_id uuid references squadre(id),
  partita_id uuid references partite(id),
  motivazione text,
  created_at timestamptz not null default now()
);

create table albo_oro (
  stagione_id uuid primary key references stagioni(id) on delete cascade,
  squadra_campione_id uuid references squadre(id),
  capocannoniere_id uuid references giocatori(id),
  capocannoniere_goal int,
  mvp_stagione_id uuid references giocatori(id),
  miglior_difesa_squadra_id uuid references squadre(id),
  fair_play_squadra_id uuid references squadre(id)
);

-- ---------------------------------------------------------------------------
-- NOTIFICHE PUSH
-- ---------------------------------------------------------------------------
create table notifiche (
  id uuid primary key default gen_random_uuid(),
  tipo text not null,
  titolo text not null,
  corpo text not null,
  link text,
  creata_il timestamptz not null default now()
);

create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  utente_id uuid references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- PROFILI UTENTE
-- ---------------------------------------------------------------------------
create table profili (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  squadra_preferita_id uuid references squadre(id),
  giocatore_preferito_id uuid references giocatori(id),
  ruolo ruolo_utente not null default 'tifoso',
  notifica_goal boolean not null default true,
  notifica_inizio_partita boolean not null default true,
  notifica_fine_partita boolean not null default true,
  notifica_news boolean not null default true,
  notifica_comunicati boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- TRIGGER — automazioni: classifica, statistiche giocatore, presenze
-- ============================================================================

create or replace function fn_ricalcola_classifica(p_stagione_id uuid)
returns void as $$
begin
  delete from classifica where stagione_id = p_stagione_id;

  insert into classifica (
    stagione_id, squadra_id, giocate, vinte, pareggiate, perse,
    gol_fatti, gol_subiti, punti, punti_casa, punti_trasferta
  )
  select
    p_stagione_id,
    s.id,
    coalesce(count(p.id), 0),
    coalesce(sum(case when (p.squadra_casa_id = s.id and p.gol_casa > p.gol_trasferta)
                    or (p.squadra_trasferta_id = s.id and p.gol_trasferta > p.gol_casa) then 1 else 0 end), 0),
    coalesce(sum(case when p.gol_casa = p.gol_trasferta then 1 else 0 end), 0),
    coalesce(sum(case when (p.squadra_casa_id = s.id and p.gol_casa < p.gol_trasferta)
                    or (p.squadra_trasferta_id = s.id and p.gol_trasferta < p.gol_casa) then 1 else 0 end), 0),
    coalesce(sum(case when p.squadra_casa_id = s.id then p.gol_casa else p.gol_trasferta end), 0),
    coalesce(sum(case when p.squadra_casa_id = s.id then p.gol_trasferta else p.gol_casa end), 0),
    coalesce(sum(
      case
        when (p.squadra_casa_id = s.id and p.gol_casa > p.gol_trasferta)
          or (p.squadra_trasferta_id = s.id and p.gol_trasferta > p.gol_casa) then 3
        when p.gol_casa = p.gol_trasferta then 1
        else 0
      end
    ), 0),
    coalesce(sum(case when p.squadra_casa_id = s.id and p.gol_casa > p.gol_trasferta then 3
                       when p.squadra_casa_id = s.id and p.gol_casa = p.gol_trasferta then 1
                       else 0 end), 0),
    coalesce(sum(case when p.squadra_trasferta_id = s.id and p.gol_trasferta > p.gol_casa then 3
                       when p.squadra_trasferta_id = s.id and p.gol_trasferta = p.gol_casa then 1
                       else 0 end), 0)
  from squadre s
  left join partite p
    on (p.squadra_casa_id = s.id or p.squadra_trasferta_id = s.id)
    and p.stagione_id = p_stagione_id
    and p.stato = 'conclusa'
  where s.attiva
  group by s.id;

  update classifica c set posizione = ranked.posizione
  from (
    select squadra_id,
      row_number() over (order by punti desc, (gol_fatti - gol_subiti) desc, gol_fatti desc) as posizione
    from classifica where stagione_id = p_stagione_id
  ) ranked
  where c.squadra_id = ranked.squadra_id and c.stagione_id = p_stagione_id;
end;
$$ language plpgsql security definer;

create or replace function trg_partite_after_update()
returns trigger as $$
begin
  if new.stato = 'conclusa' then
    perform fn_ricalcola_classifica(new.stagione_id);
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger partite_ricalcola_classifica
after update of stato, gol_casa, gol_trasferta on partite
for each row execute function trg_partite_after_update();

-- Aggiorna le statistiche stagionali del giocatore ad ogni evento partita
create or replace function trg_eventi_after_insert()
returns trigger as $$
declare
  v_stagione_id uuid;
begin
  select stagione_id into v_stagione_id from partite where id = new.partita_id;

  if new.tipo in ('goal', 'rigore_segnato') and new.giocatore_id is not null then
    insert into statistiche_giocatore_stagione (giocatore_id, stagione_id, squadra_id, goal)
    values (new.giocatore_id, v_stagione_id, new.squadra_id, 1)
    on conflict (giocatore_id, stagione_id)
    do update set goal = statistiche_giocatore_stagione.goal + 1;
  end if;

  if new.assist_giocatore_id is not null and new.tipo in ('goal', 'rigore_segnato') then
    insert into statistiche_giocatore_stagione (giocatore_id, stagione_id, squadra_id, assist)
    values (new.assist_giocatore_id, v_stagione_id, new.squadra_id, 1)
    on conflict (giocatore_id, stagione_id)
    do update set assist = statistiche_giocatore_stagione.assist + 1;
  end if;

  if new.tipo in ('ammonizione', 'secondo_giallo') and new.giocatore_id is not null then
    insert into statistiche_giocatore_stagione (giocatore_id, stagione_id, squadra_id, ammonizioni)
    values (new.giocatore_id, v_stagione_id, new.squadra_id, 1)
    on conflict (giocatore_id, stagione_id)
    do update set ammonizioni = statistiche_giocatore_stagione.ammonizioni + 1;
  end if;

  if new.tipo = 'espulsione' and new.giocatore_id is not null then
    insert into statistiche_giocatore_stagione (giocatore_id, stagione_id, squadra_id, espulsioni)
    values (new.giocatore_id, v_stagione_id, new.squadra_id, 1)
    on conflict (giocatore_id, stagione_id)
    do update set espulsioni = statistiche_giocatore_stagione.espulsioni + 1;
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger eventi_aggiorna_statistiche
after insert on partite_eventi
for each row execute function trg_eventi_after_insert();

-- Notifica push automatica sui goal
create or replace function trg_notifica_goal()
returns trigger as $$
declare
  v_squadra text;
begin
  if new.tipo in ('goal', 'rigore_segnato', 'autogoal') then
    select nome into v_squadra from squadre where id = new.squadra_id;
    insert into notifiche (tipo, titolo, corpo, link)
    values ('goal', 'GOAL! ' || coalesce(v_squadra, ''), 'Minuto ' || new.minuto || '''', '/partite/' || new.partita_id);
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger eventi_notifica_goal
after insert on partite_eventi
for each row execute function trg_notifica_goal();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table stagioni enable row level security;
alter table sponsor enable row level security;
alter table squadre enable row level security;
alter table squadre_sponsor enable row level security;
alter table squadre_gallery enable row level security;
alter table giocatori enable row level security;
alter table giocatori_gallery enable row level security;
alter table giocatori_video enable row level security;
alter table statistiche_giocatore_stagione enable row level security;
alter table giocatori_trofei enable row level security;
alter table partite enable row level security;
alter table partite_eventi enable row level security;
alter table partite_formazioni enable row level security;
alter table partite_statistiche enable row level security;
alter table partite_gallery enable row level security;
alter table partite_chat enable row level security;
alter table classifica enable row level security;
alter table articoli enable row level security;
alter table articoli_squadre enable row level security;
alter table album_media enable row level security;
alter table album_media_items enable row level security;
alter table media_reazioni enable row level security;
alter table premi_settimanali enable row level security;
alter table albo_oro enable row level security;
alter table notifiche enable row level security;
alter table push_subscriptions enable row level security;
alter table profili enable row level security;

-- helper: l'utente corrente è un organizzatore?
create or replace function is_organizzatore()
returns boolean as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'organizzatore', false);
$$ language sql stable;

-- lettura pubblica per tutte le tabelle di dominio sportivo
do $$
declare
  t text;
begin
  foreach t in array array[
    'stagioni', 'sponsor', 'squadre', 'squadre_sponsor', 'squadre_gallery',
    'giocatori', 'giocatori_gallery', 'giocatori_video', 'statistiche_giocatore_stagione',
    'giocatori_trofei', 'partite', 'partite_eventi', 'partite_formazioni',
    'partite_statistiche', 'partite_gallery', 'classifica', 'articoli',
    'articoli_squadre', 'album_media', 'album_media_items', 'premi_settimanali',
    'albo_oro', 'notifiche'
  ]
  loop
    execute format('create policy "lettura_pubblica" on %I for select using (true);', t);
    execute format('create policy "scrittura_organizzatore" on %I for all using (is_organizzatore()) with check (is_organizzatore());', t);
  end loop;
end $$;

-- profili: ognuno vede/modifica solo il proprio
create policy "profilo_proprio_select" on profili for select using (auth.uid() = id or is_organizzatore());
create policy "profilo_proprio_update" on profili for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profilo_proprio_insert" on profili for insert with check (auth.uid() = id);

-- chat partita: lettura pubblica dei messaggi moderati, scrittura autenticata
create policy "chat_lettura" on partite_chat for select using (not nascosto);
create policy "chat_scrittura" on partite_chat for insert with check (auth.uid() = utente_id);
create policy "chat_moderazione" on partite_chat for update using (is_organizzatore());

-- reazioni media: chiunque autenticato può reagire
create policy "reazioni_lettura" on media_reazioni for select using (true);
create policy "reazioni_scrittura" on media_reazioni for insert with check (auth.uid() = utente_id);
create policy "reazioni_rimozione" on media_reazioni for delete using (auth.uid() = utente_id);

-- push subscriptions: solo il proprietario
create policy "push_sub_proprio" on push_subscriptions for all using (auth.uid() = utente_id) with check (auth.uid() = utente_id);

-- ============================================================================
-- REALTIME — pubblica gli aggiornamenti live della Match Center
-- ============================================================================
alter publication supabase_realtime add table partite, partite_eventi, partite_statistiche, partite_chat, classifica, notifiche;

-- ============================================================================
-- LEGA_STORE — stato applicativo come singola riga JSONB
-- ----------------------------------------------------------------------------
-- Ponte pragmatico: l'app usa già un modello dati in-process (src/lib/types.ts)
-- gestito da src/lib/store/file-store.ts. Invece di normalizzare subito ogni
-- lettura/scrittura sulle tabelle relazionali sopra (roadmap futura), questa
-- tabella conserva l'intero stato ("squadre", "giocatori", "partite", ecc.)
-- come un unico blob JSONB, così l'app ottiene persistenza reale multi-sessione
-- anche su hosting serverless (Vercel/Netlify, dove il filesystem è di sola
-- lettura) senza dover riscrivere il data layer. Le tabelle relazionali sopra
-- restano lo schema di riferimento per una futura migrazione completa.
-- ============================================================================
create table if not exists lega_store (
  id int primary key default 1,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint lega_store_singleton check (id = 1)
);

alter table lega_store enable row level security;
create policy "lega_store_lettura_pubblica" on lega_store for select using (true);
create policy "lega_store_scrittura_organizzatore" on lega_store for all using (is_organizzatore()) with check (is_organizzatore());

-- ============================================================================
-- STORAGE — bucket per loghi, foto giocatori/squadre, copertine news, media
-- ----------------------------------------------------------------------------
-- Un solo bucket pubblico in lettura; le scritture (upload, sostituzione,
-- cancellazione) restano riservate all'organizzatore tramite la stessa
-- funzione is_organizzatore() usata per il resto dello schema. L'upload parte
-- direttamente dal browser (client Supabase autenticato con la sessione
-- dell'organizzatore), senza passare da un endpoint del backend.
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('lega-media', 'lega-media', true)
on conflict (id) do nothing;

create policy "lega_media_lettura_pubblica" on storage.objects for select
  using (bucket_id = 'lega-media');

create policy "lega_media_scrittura_organizzatore" on storage.objects for insert
  with check (bucket_id = 'lega-media' and is_organizzatore());

create policy "lega_media_modifica_organizzatore" on storage.objects for update
  using (bucket_id = 'lega-media' and is_organizzatore());

create policy "lega_media_rimozione_organizzatore" on storage.objects for delete
  using (bucket_id = 'lega-media' and is_organizzatore());
