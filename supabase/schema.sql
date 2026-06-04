-- BuildMind AI Supabase schema. Run in Supabase SQL editor after creating a new project.
create extension if not exists "pgcrypto";

create type app_role as enum ('owner','builder','project_manager','contractor','subcontractor','worker','client','architect');
create type app_status as enum ('open','approved','closed','draft','sent','paid','active','expired','past_due','trialing');

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  trial_started_at timestamptz default now(),
  billing_status app_status default 'trialing',
  created_at timestamptz default now()
);

create table if not exists memberships (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  user_id uuid,
  name text not null,
  email text not null,
  role app_role not null default 'worker',
  status app_status default 'active',
  created_at timestamptz default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  name text not null,
  client text,
  location text,
  progress int default 0 check(progress >= 0 and progress <= 100),
  budget numeric default 0,
  deadline date,
  status app_status default 'active',
  created_at timestamptz default now()
);

create table if not exists project_access (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  membership_id uuid references memberships(id) on delete cascade,
  access_level text default 'standard',
  created_at timestamptz default now(),
  unique(project_id, membership_id)
);

create table if not exists site_diaries (id uuid primary key default gen_random_uuid(), project_id uuid references projects(id) on delete cascade, title text not null, details text, status app_status default 'draft', approved_for_client boolean default false, created_at timestamptz default now());
create table if not exists delays (id uuid primary key default gen_random_uuid(), project_id uuid references projects(id) on delete cascade, title text not null, details text, severity text default 'medium', value numeric default 0, status app_status default 'open', created_at timestamptz default now());
create table if not exists variations (id uuid primary key default gen_random_uuid(), project_id uuid references projects(id) on delete cascade, title text not null, details text, value numeric default 0, status app_status default 'draft', approved_for_client boolean default false, created_at timestamptz default now());
create table if not exists hazards (id uuid primary key default gen_random_uuid(), project_id uuid references projects(id) on delete cascade, title text not null, details text, severity text default 'medium', status app_status default 'open', created_at timestamptz default now());
create table if not exists defects (id uuid primary key default gen_random_uuid(), project_id uuid references projects(id) on delete cascade, title text not null, details text, severity text default 'medium', status app_status default 'open', created_at timestamptz default now());
create table if not exists timesheets (id uuid primary key default gen_random_uuid(), project_id uuid references projects(id) on delete cascade, title text not null, details text, assigned_to text, hours numeric default 0, status app_status default 'open', created_at timestamptz default now());
create table if not exists email_drafts (id uuid primary key default gen_random_uuid(), project_id uuid references projects(id) on delete cascade, title text not null, recipient_type text default 'client', subject text, body text, status app_status default 'draft', approved_for_client boolean default false, created_at timestamptz default now());
create table if not exists reports (id uuid primary key default gen_random_uuid(), project_id uuid references projects(id) on delete cascade, title text not null, details text, body text, status app_status default 'draft', approved_for_client boolean default false, created_at timestamptz default now());
create table if not exists memory_entries (id uuid primary key default gen_random_uuid(), project_id uuid references projects(id) on delete cascade, title text not null, details text, status app_status default 'open', created_at timestamptz default now());
create table if not exists audit_logs (id uuid primary key default gen_random_uuid(), project_id uuid references projects(id) on delete cascade, actor_membership_id uuid references memberships(id), title text not null, details text, status app_status default 'open', created_at timestamptz default now());
create table if not exists subscriptions (id uuid primary key default gen_random_uuid(), company_id uuid references companies(id) on delete cascade, stripe_customer_id text, stripe_subscription_id text, status app_status default 'trialing', plan text default 'pro', trial_ends_at timestamptz default now() + interval '14 days', created_at timestamptz default now());
create table if not exists trial_guardrails (id uuid primary key default gen_random_uuid(), email_hash text unique, fingerprint_hash text, company_id uuid references companies(id) on delete set null, trial_started_at timestamptz default now(), created_at timestamptz default now());

create index if not exists idx_memberships_company on memberships(company_id);
create index if not exists idx_projects_company on projects(company_id);
create index if not exists idx_project_access_project on project_access(project_id);
create index if not exists idx_diaries_project on site_diaries(project_id);
create index if not exists idx_delays_project on delays(project_id);
create index if not exists idx_variations_project on variations(project_id);
create index if not exists idx_hazards_project on hazards(project_id);
create index if not exists idx_defects_project on defects(project_id);
create index if not exists idx_timesheets_project on timesheets(project_id);
create index if not exists idx_memory_project on memory_entries(project_id);

alter table companies enable row level security;
alter table memberships enable row level security;
alter table projects enable row level security;
alter table project_access enable row level security;
alter table site_diaries enable row level security;
alter table delays enable row level security;
alter table variations enable row level security;
alter table hazards enable row level security;
alter table defects enable row level security;
alter table timesheets enable row level security;
alter table email_drafts enable row level security;
alter table reports enable row level security;
alter table memory_entries enable row level security;
alter table audit_logs enable row level security;
alter table subscriptions enable row level security;
alter table trial_guardrails enable row level security;

-- Starter policies. Replace auth.uid() linkage with your production auth model.
create policy "Members can read own company" on companies for select using (exists (select 1 from memberships m where m.company_id = companies.id and m.user_id = auth.uid()));
create policy "Members can read memberships" on memberships for select using (user_id = auth.uid() or exists (select 1 from memberships m where m.company_id = memberships.company_id and m.user_id = auth.uid() and m.role in ('owner','builder','project_manager')));
create policy "Members can read projects" on projects for select using (exists (select 1 from memberships m where m.company_id = projects.company_id and m.user_id = auth.uid()));
create policy "Managers can manage projects" on projects for all using (exists (select 1 from memberships m where m.company_id = projects.company_id and m.user_id = auth.uid() and m.role in ('owner','builder','project_manager')));

-- Repeatable project record policies use project -> company membership check.
create policy "Read diaries by project membership" on site_diaries for select using (exists (select 1 from projects p join memberships m on m.company_id=p.company_id where p.id=site_diaries.project_id and m.user_id=auth.uid()));
create policy "Manage diaries by project membership" on site_diaries for all using (exists (select 1 from projects p join memberships m on m.company_id=p.company_id where p.id=site_diaries.project_id and m.user_id=auth.uid() and m.role in ('owner','builder','project_manager','contractor','subcontractor')));

create policy "Read project records delays" on delays for select using (exists (select 1 from projects p join memberships m on m.company_id=p.company_id where p.id=delays.project_id and m.user_id=auth.uid()));
create policy "Manage delays managers" on delays for all using (exists (select 1 from projects p join memberships m on m.company_id=p.company_id where p.id=delays.project_id and m.user_id=auth.uid() and m.role in ('owner','builder','project_manager')));

create policy "Read project records variations" on variations for select using (exists (select 1 from projects p join memberships m on m.company_id=p.company_id where p.id=variations.project_id and m.user_id=auth.uid()));
create policy "Manage variations managers architects" on variations for all using (exists (select 1 from projects p join memberships m on m.company_id=p.company_id where p.id=variations.project_id and m.user_id=auth.uid() and m.role in ('owner','builder','project_manager','architect')));

create policy "Read project records hazards" on hazards for select using (exists (select 1 from projects p join memberships m on m.company_id=p.company_id where p.id=hazards.project_id and m.user_id=auth.uid()));
create policy "Manage hazards site roles" on hazards for all using (exists (select 1 from projects p join memberships m on m.company_id=p.company_id where p.id=hazards.project_id and m.user_id=auth.uid() and m.role in ('owner','builder','project_manager','contractor','subcontractor','worker')));

-- For MVP: use similar policies for remaining tables.
insert into companies(name) values ('Demo Build Co') on conflict do nothing;
