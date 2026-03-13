-- ModelVerse hackathon setup for nodes/jobs/job_bids APIs.
-- Run in Supabase SQL Editor.

-- Extensions
create extension if not exists pgcrypto;

-- Core tables (create if missing)
create table if not exists nodes (
  node_id uuid primary key default gen_random_uuid(),
  wallet_address text unique not null,
  api_key text unique,
  stake_amount numeric default 1,
  reputation_score numeric default 0.5,
  total_jobs_completed integer default 0,
  is_active boolean default true,
  last_seen timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Compatibility for older schema that used nodes.id instead of nodes.node_id.
alter table if exists nodes add column if not exists id uuid default gen_random_uuid();
alter table if exists nodes add column if not exists node_id uuid;
alter table if exists nodes add column if not exists api_key text;
alter table if exists nodes add column if not exists stake_amount numeric default 1;
alter table if exists nodes add column if not exists total_jobs_completed integer default 0;
alter table if exists nodes add column if not exists is_active boolean default true;
alter table if exists nodes add column if not exists last_seen timestamptz default now();
alter table if exists nodes add column if not exists created_at timestamptz default now();
alter table if exists nodes add column if not exists updated_at timestamptz default now();
alter table if exists nodes add column if not exists wallet text;
alter table if exists nodes add column if not exists reputationscore numeric;
alter table if exists nodes add column if not exists wallet_address text;
update nodes set node_id = id where node_id is null and id is not null;
update nodes set id = node_id where id is null and node_id is not null;
update nodes set wallet_address = wallet where wallet_address is null and wallet is not null;
alter table if exists nodes add column if not exists reputation_score numeric default 0.5;
update nodes set reputation_score = reputationscore where reputation_score is null and reputationscore is not null;
create unique index if not exists idx_nodes_node_id_unique on nodes(node_id);
create unique index if not exists idx_nodes_id_unique on nodes(id);

create table if not exists jobs (
  job_id uuid primary key default gen_random_uuid(),
  model_id uuid,
  model_cid text,
  model_hash text,
  model_input_type text default 'image',
  buyer_wallet text,
  input_data_url text,
  input_base64 text,
  payment_amount numeric default 0,
  status text default 'pending',
  assigned_node_id uuid references nodes(node_id),
  result_hash text,
  result_url text,
  result jsonb,
  execution_time_ms integer,
  created_at timestamptz default now(),
  completed_at timestamptz,
  updated_at timestamptz default now()
);

-- Compatibility for older schema that used jobs.id instead of jobs.job_id.
alter table if exists jobs add column if not exists id uuid default gen_random_uuid();
alter table if exists jobs add column if not exists job_id uuid;
update jobs set job_id = id where job_id is null and id is not null;
update jobs set id = job_id where id is null and job_id is not null;
alter table if exists jobs add column if not exists model_cid text;
alter table if exists jobs add column if not exists model_hash text;
alter table if exists jobs add column if not exists model_input_type text default 'image';
alter table if exists jobs add column if not exists input_data_url text;
alter table if exists jobs add column if not exists input_base64 text;
alter table if exists jobs add column if not exists payment_amount numeric default 0;
alter table if exists jobs add column if not exists result_hash text;
alter table if exists jobs add column if not exists result_url text;
alter table if exists jobs add column if not exists result jsonb;
alter table if exists jobs add column if not exists execution_time_ms integer;
alter table if exists jobs add column if not exists completed_at timestamptz;
alter table if exists jobs add column if not exists updated_at timestamptz default now();
create unique index if not exists idx_jobs_job_id_unique on jobs(job_id);
create unique index if not exists idx_jobs_id_unique on jobs(id);

create table if not exists job_bids (
  bid_id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(job_id) on delete cascade,
  node_id uuid not null references nodes(node_id) on delete cascade,
  estimated_time_ms integer not null,
  reputation_score numeric default 0.5,
  bid_timestamp timestamptz default now(),
  unique (job_id, node_id)
);

-- RLS policies
alter table if exists nodes enable row level security;
alter table if exists jobs enable row level security;
alter table if exists job_bids enable row level security;

-- Nodes table RLS
drop policy if exists "Node owners can view/edit own node" on nodes;
create policy "Node owners can view/edit own node"
on nodes
for all
using (wallet_address = auth.jwt()->>'sub')
with check (wallet_address = auth.jwt()->>'sub');

-- Jobs table RLS
drop policy if exists "Nodes view pending jobs" on jobs;
create policy "Nodes view pending jobs"
on jobs
for select
to authenticated
using (status = 'pending');

drop policy if exists "Own node updates own assigned jobs" on jobs;
create policy "Own node updates own assigned jobs"
on jobs
for update
to authenticated
using (
  assigned_node_id = (
    select node_id from nodes where wallet_address = auth.jwt()->>'sub' limit 1
  )
)
with check (
  assigned_node_id = (
    select node_id from nodes where wallet_address = auth.jwt()->>'sub' limit 1
  )
);

-- Job bids table RLS
drop policy if exists "Nodes can submit bids" on job_bids;
create policy "Nodes can submit bids"
on job_bids
for insert
to authenticated
with check (
  node_id = (
    select node_id from nodes where wallet_address = auth.jwt()->>'sub' limit 1
  )
);

drop policy if exists "Nodes can read own bids" on job_bids;
create policy "Nodes can read own bids"
on job_bids
for select
to authenticated
using (
  node_id = (
    select node_id from nodes where wallet_address = auth.jwt()->>'sub' limit 1
  )
);

-- Performance indexes
create index if not exists idx_jobs_status on jobs(status);
create index if not exists idx_jobs_created on jobs(created_at desc);
create index if not exists idx_nodes_active on nodes(is_active, reputation_score desc);

-- Auto-generate API key on node insert
create or replace function public.generate_api_key()
returns trigger
language plpgsql
as $$
begin
  if new.api_key is null or length(trim(new.api_key)) = 0 then
    new.api_key := gen_random_uuid()::text;
  end if;
  return new;
end;
$$;

drop trigger if exists trigger_generate_api_key on nodes;
create trigger trigger_generate_api_key
before insert on nodes
for each row
execute function generate_api_key();

-- Helper RPC for incrementing node completed job count from edge function.
create or replace function public.increment_node_job_count(p_node_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update nodes
  set total_jobs_completed = coalesce(total_jobs_completed, 0) + 1,
      reputation_score = coalesce(reputation_score, 0.5) + 0.01,
      updated_at = now()
  where node_id = p_node_id;
end;
$$;

grant execute on function public.increment_node_job_count(uuid) to anon, authenticated, service_role;
