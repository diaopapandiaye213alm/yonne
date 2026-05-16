-- ============================================================
-- YONNE — Monitoring des connexions Supabase Realtime
-- ============================================================
-- Ces fonctions RPC permettent à l'admin d'auditer la charge
-- Realtime sans avoir accès direct aux tables système Postgres.
-- Appel depuis le Dashboard ou le code :
--   const { data } = await supabase.rpc('yonne_realtime_stats');
-- ============================================================


-- ── 1. Statistiques globales des connexions actives ─────────────────────────
-- Retourne le nombre de connexions par état et par application.
-- La colonne `application_name` = 'realtime' pour les abonnements Supabase.
create or replace function yonne_realtime_stats()
  returns json
  language sql stable security definer
  set search_path = public, pg_catalog
as $$
  select json_build_object(
    'sampled_at',             now(),

    -- Connexions totales à la base (tous clients confondus)
    'total_pg_connections',   (
      select count(*)
      from pg_stat_activity
      where datname = current_database()
    ),

    -- Connexions Supabase Realtime actives
    'realtime_connections',   (
      select count(*)
      from pg_stat_activity
      where datname = current_database()
        and application_name ilike '%realtime%'
    ),

    -- Connexions en attente d'événements (LISTEN / NOTIFY)
    'listen_wait_connections', (
      select count(*)
      from pg_stat_activity
      where datname = current_database()
        and wait_event_type = 'Client'
        and wait_event = 'ClientRead'
        and state = 'idle'
    ),

    -- Connexions longues (> 60s) — signal d'alarme de fuite
    'long_running_connections', (
      select count(*)
      from pg_stat_activity
      where datname = current_database()
        and state != 'idle'
        and now() - query_start > interval '60 seconds'
    ),

    -- Canaux Realtime par publication active (Supabase Realtime v2)
    'realtime_subscriptions', (
      select count(*)
      from pg_stat_activity
      where datname = current_database()
        and application_name ilike '%realtime%'
        and state = 'idle in transaction'
    ),

    -- Détail par état de connexion
    'connections_by_state',   (
      select json_object_agg(state, cnt)
      from (
        select coalesce(state, 'unknown') as state, count(*) as cnt
        from pg_stat_activity
        where datname = current_database()
        group by state
      ) s
    )
  );
$$;

grant execute on function yonne_realtime_stats() to anon, authenticated;


-- ── 2. Audit des rate-limits SMS ────────────────────────────────────────────
-- Retourne l'état courant de tous les compteurs SMS actifs.
-- Utile pour surveiller l'usage Africa's Talking en temps réel.
create or replace function yonne_sms_quota_status()
  returns json
  language sql stable security definer
  set search_path = public
as $$
  select json_build_object(
    'sampled_at', now(),
    'quotas', (
      select json_agg(
        json_build_object(
          'key',      key,
          'count',    count,
          'reset_at', reset_at,
          'expired',  reset_at <= now()
        )
        order by key
      )
      from api_rate_limits
      where key like 'sms:%'
    )
  );
$$;

grant execute on function yonne_sms_quota_status() to anon, authenticated;


-- ── 3. Réinitialisation manuelle des quotas SMS ─────────────────────────────
-- À utiliser avec précaution (admin uniquement via service-role).
-- Exemple : supabase.rpc('yonne_sms_quota_reset', { scope: 'global' })
--   scope = 'global'           → efface tous les quotas globaux
--   scope = 'merchant:<id>'    → efface les quotas d'un marchand
--   scope = 'all'              → efface TOUS les compteurs SMS
create or replace function yonne_sms_quota_reset(scope text default 'global')
  returns json
  language plpgsql security definer
  set search_path = public
as $$
declare
  deleted_count integer;
begin
  if scope = 'all' then
    delete from api_rate_limits where key like 'sms:%';
  elsif scope = 'global' then
    delete from api_rate_limits where key like 'sms:global:%';
  else
    -- scope = 'merchant:<id>'
    delete from api_rate_limits
    where key like 'sms:merchant:' || ltrim(scope, 'merchant:') || ':%';
  end if;

  get diagnostics deleted_count = row_count;

  return json_build_object(
    'reset_at',      now(),
    'scope',         scope,
    'rows_deleted',  deleted_count
  );
end;
$$;

-- Restriction : cette fonction ne doit être appelée que via service-role.
-- Ne pas accorder de droits aux rôles publics.
revoke execute on function yonne_sms_quota_reset(text) from anon, authenticated;


-- ── 4. Vue de synthèse pour le Dashboard admin ──────────────────────────────
-- Table matérialisée légère pour afficher les stats Realtime dans l'admin
-- sans appeler pg_stat_activity à chaque rendu (trop coûteux si fréquent).
-- À rafraîchir via un cron Supabase toutes les 5 minutes.

create table if not exists realtime_audit_snapshots (
  id         bigserial    primary key,
  sampled_at timestamptz  not null default now(),
  stats      json         not null
);

alter table realtime_audit_snapshots enable row level security;
create policy if not exists "admin read realtime snapshots"
  on realtime_audit_snapshots for select using (true);

create index if not exists idx_realtime_snapshots_sampled
  on realtime_audit_snapshots (sampled_at desc);

-- Nettoyer les snapshots de plus de 24h (évite la croissance illimitée de la table)
create or replace function yonne_realtime_snapshot_collect()
  returns void
  language plpgsql security definer
  set search_path = public
as $$
begin
  -- Insérer le snapshot courant
  insert into realtime_audit_snapshots (stats)
  select yonne_realtime_stats();

  -- Purger les snapshots de plus de 24 heures
  delete from realtime_audit_snapshots
  where sampled_at < now() - interval '24 hours';
end;
$$;

grant execute on function yonne_realtime_snapshot_collect() to anon, authenticated;

-- ── Commentaire d'usage ──────────────────────────────────────────────────────
-- Pour activer la collecte automatique toutes les 5 minutes, configurer dans
-- Supabase Dashboard → Database → Cron Jobs (extension pg_cron) :
--
--   select cron.schedule(
--     'realtime-audit-snapshot',
--     '*/5 * * * *',
--     $$ select yonne_realtime_snapshot_collect(); $$
--   );
--
-- Appel depuis le client admin :
--   const { data } = await supabase
--     .from('realtime_audit_snapshots')
--     .select('sampled_at, stats')
--     .order('sampled_at', { ascending: false })
--     .limit(1)
--     .single();
