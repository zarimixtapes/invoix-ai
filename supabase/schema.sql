create extension if not exists pgcrypto;

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'trial',
  trial_started_at timestamptz default now(),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now()
);

create table if not exists memberships (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  user_id uuid,
  email text,
  role text not null check (role in ('owner','builder','pm','contractor','subcontractor','worker','client','architect')),
  created_at timestamptz default now()
);

create table if not exists records (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  project_id uuid,
  type text not null,
  title text not null,
  body text not null default '',
  status text default 'open',
  amount numeric default 0,
  hours numeric default 0,
  owner text,
  meta jsonb default '{}'::jsonb,
  created_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists trial_guardrails (
  id uuid primary key default gen_random_uuid(),
  email_hash text,
  company_id uuid references companies(id) on delete cascade,
  ip_hash text,
  fingerprint_hash text,
  created_at timestamptz default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  actor_user_id uuid,
  action text not null,
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table companies enable row level security;
alter table memberships enable row level security;
alter table records enable row level security;
alter table trial_guardrails enable row level security;
alter table audit_logs enable row level security;

create policy if not exists "members can read company" on companies for select using (
  exists (select 1 from memberships m where m.company_id = companies.id and m.user_id = auth.uid())
);
create policy if not exists "members can read memberships" on memberships for select using (
  exists (select 1 from memberships m where m.company_id = memberships.company_id and m.user_id = auth.uid())
);
create policy if not exists "members can read records" on records for select using (
  exists (select 1 from memberships m where m.company_id = records.company_id and m.user_id = auth.uid())
);
create policy if not exists "editors can insert records" on records for insert with check (
  exists (select 1 from memberships m where m.company_id = records.company_id and m.user_id = auth.uid() and m.role in ('owner','builder','pm','contractor','subcontractor','worker'))
);
create policy if not exists "editors can update records" on records for update using (
  exists (select 1 from memberships m where m.company_id = records.company_id and m.user_id = auth.uid() and m.role in ('owner','builder','pm','contractor','subcontractor','worker'))
);
create policy if not exists "managers can delete records" on records for delete using (
  exists (select 1 from memberships m where m.company_id = records.company_id and m.user_id = auth.uid() and m.role in ('owner','builder','pm'))
);
