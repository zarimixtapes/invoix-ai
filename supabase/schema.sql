-- ─────────────────────────────────────────────────────────────────────────
-- Invoix AI v4 — Supabase schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) on a fresh
-- project. It creates every table the app's TypeScript types expect, plus
-- indexes and starter Row Level Security policies scoped by business_id.
--
-- The demo build (this repo, out of the box) runs entirely on localStorage
-- and does NOT require this schema. Apply it only when you're ready to wire
-- up NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY for real
-- multi-user persistence.
-- ─────────────────────────────────────────────────────────────────────────

create extension if not exists "uuid-ossp";

-- ───────────────────────── profiles ─────────────────────────
-- One row per authenticated user (mirrors auth.users).
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now()
);

-- ───────────────────────── businesses ─────────────────────────
create table if not exists businesses (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null default 'My Business',
  abn text,
  address text,
  email text,
  phone text,
  logo_url text,
  default_tax_rate numeric(5,2) not null default 10,
  default_payment_terms text default 'Payment due within 7 days of invoice date.',
  brand_color text default '#0F9D87',
  invoice_prefix text not null default 'INV',
  next_invoice_number integer not null default 1001,
  next_quote_number integer not null default 1001,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_businesses_owner on businesses (owner_id);

-- ───────────────────────── customers ─────────────────────────
create table if not exists customers (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses (id) on delete cascade,
  name text not null,
  business_name text,
  email text,
  phone text,
  address text,
  abn text,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists idx_customers_business on customers (business_id);

-- ───────────────────────── products_services ─────────────────────────
create table if not exists products_services (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses (id) on delete cascade,
  name text not null,
  description text,
  unit_price numeric(12,2) not null default 0,
  tax_rate numeric(5,2) not null default 10,
  category text not null default 'Service',
  created_at timestamptz not null default now()
);
create index if not exists idx_products_business on products_services (business_id);

-- ───────────────────────── invoices ─────────────────────────
create table if not exists invoices (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses (id) on delete cascade,
  number text not null,
  customer_id uuid references customers (id) on delete set null,
  customer_name text not null,
  customer_email text,
  customer_address text,
  issue_date date not null default current_date,
  due_date date not null,
  discount_type text not null default 'flat' check (discount_type in ('flat', 'percent')),
  discount_value numeric(12,2) not null default 0,
  shipping numeric(12,2) not null default 0,
  notes text,
  payment_terms text,
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  amount_paid numeric(12,2) not null default 0,
  source_quote_id uuid,
  ai_generated boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, number)
);
create index if not exists idx_invoices_business on invoices (business_id);
create index if not exists idx_invoices_status on invoices (business_id, status);
create index if not exists idx_invoices_customer on invoices (customer_id);

-- ───────────────────────── invoice_items ─────────────────────────
create table if not exists invoice_items (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid not null references invoices (id) on delete cascade,
  product_id uuid references products_services (id) on delete set null,
  description text not null,
  quantity numeric(12,2) not null default 1,
  unit_price numeric(12,2) not null default 0,
  tax_rate numeric(5,2) not null default 10,
  sort_order integer not null default 0
);
create index if not exists idx_invoice_items_invoice on invoice_items (invoice_id);

-- ───────────────────────── quotes ─────────────────────────
create table if not exists quotes (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses (id) on delete cascade,
  number text not null,
  customer_id uuid references customers (id) on delete set null,
  customer_name text not null,
  customer_email text,
  customer_address text,
  issue_date date not null default current_date,
  expiry_date date,
  discount_type text not null default 'flat' check (discount_type in ('flat', 'percent')),
  discount_value numeric(12,2) not null default 0,
  shipping numeric(12,2) not null default 0,
  notes text,
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'accepted', 'declined', 'converted', 'expired')),
  converted_invoice_id uuid references invoices (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, number)
);
create index if not exists idx_quotes_business on quotes (business_id);
create index if not exists idx_quotes_status on quotes (business_id, status);

-- ───────────────────────── quote_items ─────────────────────────
create table if not exists quote_items (
  id uuid primary key default uuid_generate_v4(),
  quote_id uuid not null references quotes (id) on delete cascade,
  product_id uuid references products_services (id) on delete set null,
  description text not null,
  quantity numeric(12,2) not null default 1,
  unit_price numeric(12,2) not null default 0,
  tax_rate numeric(5,2) not null default 10,
  sort_order integer not null default 0
);
create index if not exists idx_quote_items_quote on quote_items (quote_id);

-- ───────────────────────── email_drafts ─────────────────────────
create table if not exists email_drafts (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses (id) on delete cascade,
  type text not null check (
    type in ('send_invoice', 'payment_reminder', 'overdue_notice', 'quote_follow_up', 'thank_you_payment')
  ),
  subject text not null,
  recipient_email text,
  body text not null,
  related_invoice_id uuid references invoices (id) on delete cascade,
  related_quote_id uuid references quotes (id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'sent')),
  created_at timestamptz not null default now()
);
create index if not exists idx_email_drafts_business on email_drafts (business_id);

-- ───────────────────────── payments ─────────────────────────
create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses (id) on delete cascade,
  invoice_id uuid not null references invoices (id) on delete cascade,
  amount numeric(12,2) not null,
  method text,
  received_at timestamptz not null default now(),
  notes text
);
create index if not exists idx_payments_invoice on payments (invoice_id);

-- ───────────────────────── subscriptions ─────────────────────────
create table if not exists subscriptions (
  business_id uuid primary key references businesses (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'starter', 'pro')),
  state text not null default 'trialing'
    check (state in ('trialing', 'active', 'expired', 'past_due', 'cancelled')),
  stripe_customer_id text,
  stripe_subscription_id text,
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

-- ───────────────────────── ai_usage ─────────────────────────
create table if not exists ai_usage (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses (id) on delete cascade,
  prompt text not null,
  mode text not null check (mode in ('openai', 'fallback')),
  created_at timestamptz not null default now()
);
create index if not exists idx_ai_usage_business_date on ai_usage (business_id, created_at);

-- ───────────────────────── audit_logs ─────────────────────────
create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses (id) on delete cascade,
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity text not null,
  entity_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_logs_business on audit_logs (business_id, created_at);

-- ─────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- Every table is scoped to businesses the authenticated user owns. This is a
-- starter policy set for a single-owner-per-business model; extend with a
-- business_members table if you need team collaboration.
-- ─────────────────────────────────────────────────────────────────────────

alter table profiles enable row level security;
alter table businesses enable row level security;
alter table customers enable row level security;
alter table products_services enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;
alter table quotes enable row level security;
alter table quote_items enable row level security;
alter table email_drafts enable row level security;
alter table payments enable row level security;
alter table subscriptions enable row level security;
alter table ai_usage enable row level security;
alter table audit_logs enable row level security;

create policy "profiles_self" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "businesses_owner" on businesses
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "customers_owner" on customers
  for all using (
    business_id in (select id from businesses where owner_id = auth.uid())
  ) with check (
    business_id in (select id from businesses where owner_id = auth.uid())
  );

create policy "products_owner" on products_services
  for all using (
    business_id in (select id from businesses where owner_id = auth.uid())
  ) with check (
    business_id in (select id from businesses where owner_id = auth.uid())
  );

create policy "invoices_owner" on invoices
  for all using (
    business_id in (select id from businesses where owner_id = auth.uid())
  ) with check (
    business_id in (select id from businesses where owner_id = auth.uid())
  );

create policy "invoice_items_owner" on invoice_items
  for all using (
    invoice_id in (
      select i.id from invoices i
      join businesses b on b.id = i.business_id
      where b.owner_id = auth.uid()
    )
  ) with check (
    invoice_id in (
      select i.id from invoices i
      join businesses b on b.id = i.business_id
      where b.owner_id = auth.uid()
    )
  );

create policy "quotes_owner" on quotes
  for all using (
    business_id in (select id from businesses where owner_id = auth.uid())
  ) with check (
    business_id in (select id from businesses where owner_id = auth.uid())
  );

create policy "quote_items_owner" on quote_items
  for all using (
    quote_id in (
      select q.id from quotes q
      join businesses b on b.id = q.business_id
      where b.owner_id = auth.uid()
    )
  ) with check (
    quote_id in (
      select q.id from quotes q
      join businesses b on b.id = q.business_id
      where b.owner_id = auth.uid()
    )
  );

create policy "email_drafts_owner" on email_drafts
  for all using (
    business_id in (select id from businesses where owner_id = auth.uid())
  ) with check (
    business_id in (select id from businesses where owner_id = auth.uid())
  );

create policy "payments_owner" on payments
  for all using (
    business_id in (select id from businesses where owner_id = auth.uid())
  ) with check (
    business_id in (select id from businesses where owner_id = auth.uid())
  );

create policy "subscriptions_owner" on subscriptions
  for all using (
    business_id in (select id from businesses where owner_id = auth.uid())
  ) with check (
    business_id in (select id from businesses where owner_id = auth.uid())
  );

create policy "ai_usage_owner" on ai_usage
  for all using (
    business_id in (select id from businesses where owner_id = auth.uid())
  ) with check (
    business_id in (select id from businesses where owner_id = auth.uid())
  );

create policy "audit_logs_owner" on audit_logs
  for select using (
    business_id in (select id from businesses where owner_id = auth.uid())
  );

-- ─────────────────────────────────────────────────────────────────────────
-- Seed / demo data
-- Replace :owner_uuid with a real auth.users.id before running, e.g. the
-- UID of a user you created via Supabase Auth, then execute this block.
-- ─────────────────────────────────────────────────────────────────────────

-- insert into businesses (id, owner_id, name, abn, address, email, phone, invoice_prefix, next_invoice_number, next_quote_number)
-- values (
--   '00000000-0000-0000-0000-000000000001',
--   ':owner_uuid',
--   'Harbour & Co. Trade Services',
--   '51 824 753 556',
--   '12 Wattle Street, Newport NSW 2106',
--   'billing@harbourtrade.example',
--   '0412 345 678',
--   'INV',
--   1006,
--   1003
-- );
--
-- insert into customers (business_id, name, business_name, email, phone, address)
-- values
--   ('00000000-0000-0000-0000-000000000001', 'Amanda Ho', 'ABC Plumbing', 'amanda@abcplumbing.example', '0400 111 222', '4 Marina Way, Newport NSW 2106'),
--   ('00000000-0000-0000-0000-000000000001', 'Daniel Reyes', 'Reyes Cleaning Co.', 'daniel@reyescleaning.example', '0411 222 333', '8 Bay Street, Mona Vale NSW 2103');
--
-- insert into subscriptions (business_id, plan, state, trial_ends_at)
-- values ('00000000-0000-0000-0000-000000000001', 'free', 'trialing', now() + interval '14 days');
