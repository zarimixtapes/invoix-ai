create extension if not exists pgcrypto;
create extension if not exists vector;

create type app_role as enum ('owner','admin','project_manager','builder','contractor','subcontractor','architect','client','worker','safety_officer','finance');
create type subscription_status as enum ('trialing','active','past_due','canceled','unpaid','none');

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subscription_status subscription_status not null default 'trialing',
  trial_ends_at timestamptz,
  stripe_customer_id text,
  created_at timestamptz default now()
);
create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role app_role not null default 'worker',
  invited_by uuid,
  created_at timestamptz default now(),
  unique(company_id,user_id)
);
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  name text not null,
  address text,
  client_name text,
  status text default 'active',
  start_date date,
  forecast_completion date,
  budget numeric default 0,
  created_at timestamptz default now()
);
create table public.project_access (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  membership_id uuid references public.memberships(id) on delete cascade,
  access_level text default 'standard',
  created_at timestamptz default now(),
  unique(project_id,membership_id)
);
create table public.site_diaries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  created_by uuid references auth.users(id),
  diary_date date default current_date,
  raw_input text,
  ai_summary text,
  diary_text text,
  weather text,
  workers_count int default 0,
  status text default 'draft',
  created_at timestamptz default now()
);
create table public.delays (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  diary_id uuid references public.site_diaries(id) on delete set null,
  reason text not null,
  impact_hours numeric default 0,
  impact_days numeric default 0,
  status text default 'draft',
  evidence_required text[] default '{}',
  created_at timestamptz default now()
);
create table public.variations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  diary_id uuid references public.site_diaries(id) on delete set null,
  title text not null,
  scope text,
  estimated_cost numeric default 0,
  status text default 'draft',
  client_approved_at timestamptz,
  created_at timestamptz default now()
);
create table public.hazards (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  diary_id uuid references public.site_diaries(id) on delete set null,
  title text not null,
  risk_level text default 'review',
  corrective_action text,
  assigned_to uuid references auth.users(id),
  closed_at timestamptz,
  created_at timestamptz default now()
);
create table public.defects (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  diary_id uuid references public.site_diaries(id) on delete set null,
  title text not null,
  location text,
  severity text default 'medium',
  trade text,
  assigned_to uuid references auth.users(id),
  status text default 'open',
  closed_at timestamptz,
  created_at timestamptz default now()
);
create table public.timesheets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  user_id uuid references auth.users(id),
  clock_in timestamptz,
  clock_out timestamptz,
  break_minutes int default 0,
  notes text,
  status text default 'submitted',
  created_at timestamptz default now()
);
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  document_type text,
  storage_path text,
  version int default 1,
  created_at timestamptz default now()
);
create table public.email_drafts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  recipient_type text not null,
  to_email text,
  subject text not null,
  body text not null,
  status text default 'draft',
  sent_at timestamptz,
  created_at timestamptz default now()
);
create table public.project_memory (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  source_table text,
  source_id uuid,
  content text not null,
  embedding vector(1536),
  created_at timestamptz default now()
);
create table public.drive_sync_logs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  file_id text,
  file_url text,
  status text default 'synced',
  created_at timestamptz default now()
);
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  status text,
  current_period_end timestamptz,
  trial_end timestamptz,
  created_at timestamptz default now()
);
create table public.trial_guardrails (
  id uuid primary key default gen_random_uuid(),
  email_hash text not null,
  fingerprint_hash text,
  company_id uuid references public.companies(id) on delete cascade,
  trial_started_at timestamptz default now()
);
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  actor_id uuid references auth.users(id),
  action text not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create or replace function public.is_company_member(target_company uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.memberships m where m.company_id = target_company and m.user_id = auth.uid());
$$;
create or replace function public.can_access_project(target_project uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from public.projects p join public.memberships m on m.company_id=p.company_id
    where p.id=target_project and m.user_id=auth.uid()
  );
$$;

alter table public.companies enable row level security;
alter table public.memberships enable row level security;
alter table public.projects enable row level security;
alter table public.project_access enable row level security;
alter table public.site_diaries enable row level security;
alter table public.delays enable row level security;
alter table public.variations enable row level security;
alter table public.hazards enable row level security;
alter table public.defects enable row level security;
alter table public.timesheets enable row level security;
alter table public.documents enable row level security;
alter table public.email_drafts enable row level security;
alter table public.project_memory enable row level security;
alter table public.drive_sync_logs enable row level security;
alter table public.subscriptions enable row level security;
alter table public.audit_logs enable row level security;

create policy "members can read company" on public.companies for select using (public.is_company_member(id));
create policy "members can read memberships" on public.memberships for select using (public.is_company_member(company_id));
create policy "members can read projects" on public.projects for select using (public.is_company_member(company_id));
create policy "members can insert projects" on public.projects for insert with check (public.is_company_member(company_id));
create policy "members can update projects" on public.projects for update using (public.is_company_member(company_id));

create policy "members can access project_access" on public.project_access for select using (public.can_access_project(project_id));
create policy "members can access diaries" on public.site_diaries for all using (public.can_access_project(project_id)) with check (public.can_access_project(project_id));
create policy "members can access delays" on public.delays for all using (public.can_access_project(project_id)) with check (public.can_access_project(project_id));
create policy "members can access variations" on public.variations for all using (public.can_access_project(project_id)) with check (public.can_access_project(project_id));
create policy "members can access hazards" on public.hazards for all using (public.can_access_project(project_id)) with check (public.can_access_project(project_id));
create policy "members can access defects" on public.defects for all using (public.can_access_project(project_id)) with check (public.can_access_project(project_id));
create policy "members can access timesheets" on public.timesheets for all using (public.can_access_project(project_id)) with check (public.can_access_project(project_id));
create policy "members can access docs" on public.documents for all using (public.can_access_project(project_id)) with check (public.can_access_project(project_id));
create policy "members can access emails" on public.email_drafts for all using (public.can_access_project(project_id)) with check (public.can_access_project(project_id));
create policy "members can access memory" on public.project_memory for all using (public.can_access_project(project_id)) with check (public.can_access_project(project_id));
create policy "members can access drive logs" on public.drive_sync_logs for all using (public.can_access_project(project_id)) with check (public.can_access_project(project_id));
create policy "members can read subscriptions" on public.subscriptions for select using (public.is_company_member(company_id));
create policy "members can read audit logs" on public.audit_logs for select using (public.is_company_member(company_id));

create index idx_memberships_user on public.memberships(user_id);
create index idx_projects_company on public.projects(company_id);
create index idx_diaries_project on public.site_diaries(project_id, diary_date desc);
create index idx_memory_project on public.project_memory(project_id, created_at desc);
create index idx_variations_project on public.variations(project_id, status);
create index idx_delays_project on public.delays(project_id, status);

-- Killer-app upgrade tables
create table if not exists public.project_photos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  uploaded_by uuid references auth.users(id),
  storage_path text,
  location text,
  trade text,
  ai_tags text[] default '{}',
  ai_findings jsonb default '{}',
  taken_at timestamptz default now(),
  created_at timestamptz default now()
);
create table if not exists public.rfi_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  question text,
  assigned_to_email text,
  status text default 'draft',
  due_date date,
  created_at timestamptz default now()
);
create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  item_type text not null,
  item_id uuid not null,
  requested_by uuid references auth.users(id),
  approver_role app_role,
  status text default 'pending',
  decision_note text,
  decided_at timestamptz,
  created_at timestamptz default now()
);
create table if not exists public.report_packets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  packet_type text default 'daily',
  date_from date,
  date_to date,
  payload jsonb default '{}',
  drive_file_id text,
  status text default 'draft',
  created_at timestamptz default now()
);
create table if not exists public.workspace_settings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade unique,
  drive_folder_id text,
  default_client_report_tone text default 'professional',
  trial_fingerprint_required boolean default true,
  created_at timestamptz default now()
);

alter table public.project_photos enable row level security;
alter table public.rfi_items enable row level security;
alter table public.approvals enable row level security;
alter table public.report_packets enable row level security;
alter table public.workspace_settings enable row level security;

create policy "members can access project photos" on public.project_photos for all using (public.can_access_project(project_id)) with check (public.can_access_project(project_id));
create policy "members can access rfi" on public.rfi_items for all using (public.can_access_project(project_id)) with check (public.can_access_project(project_id));
create policy "members can access approvals" on public.approvals for all using (public.can_access_project(project_id)) with check (public.can_access_project(project_id));
create policy "members can access report packets" on public.report_packets for all using (public.can_access_project(project_id)) with check (public.can_access_project(project_id));
create policy "members can read workspace settings" on public.workspace_settings for select using (public.is_company_member(company_id));

create index if not exists idx_photos_project on public.project_photos(project_id, taken_at desc);
create index if not exists idx_rfi_project on public.rfi_items(project_id, status);
create index if not exists idx_approvals_project on public.approvals(project_id, status);
create index if not exists idx_packets_project on public.report_packets(project_id, created_at desc);
