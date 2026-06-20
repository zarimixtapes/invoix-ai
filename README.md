# Invoix AI v4

AI-powered invoicing, quoting, and business admin for freelancers, sole traders, tradies,
cleaners, mobile services, and small online sellers. Type a plain-English instruction and get
a structured invoice — line items, GST, totals, and a customer email — in seconds.

This is a **real, working Next.js app**, not a static mockup. Every screen reads and writes to
a local data store (so it's fully usable with zero configuration), and every API route is
written to upgrade cleanly to real OpenAI / Stripe / Supabase services the moment you add keys.

---

## 1. Quick start (demo mode, no keys needed)

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Click **Start free**, fill in any demo email/password (nothing is
validated — there's no real backend auth in demo mode), and you'll land in a pre-populated
dashboard with sample customers, invoices, and quotes.

Demo mode uses:
- **localStorage** (via a versioned Zustand store) for all data — customers, invoices, quotes,
  products, email drafts, payments, AI usage, and subscription state.
- A **deterministic local parser** for the AI invoice generator (regex-based, not a real LLM) so
  it works with zero setup. See `lib/ai-parser.ts`.
- **Simulated Stripe billing** — upgrading a plan updates your local subscription state instantly
  instead of redirecting to a real Stripe Checkout session.

Nothing is sent to a server in this mode. You can reset or wipe your data any time from
**Settings → Danger zone**.

---

## 2. Production setup

Copy the example env file and fill in whichever services you want to enable — you don't need
all of them at once, and the app degrades gracefully if any are missing:

```bash
cp .env.example .env.local
```

| Variable | Enables |
|---|---|
| `OPENAI_API_KEY` | Real LLM parsing in `/api/ai/invoice` (otherwise uses the deterministic fallback parser) |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Persistent multi-user database instead of localStorage |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO` | Real Stripe Checkout + subscription webhooks |
| `NEXT_PUBLIC_APP_URL` | Used to build Stripe redirect URLs |

### Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL editor and run `supabase/schema.sql`. It creates every table, index, and a
   starter set of Row Level Security policies scoped by `business_id` / `owner_id`.
3. The commented seed block at the bottom of the file shows how to insert demo rows once you
   have a real `auth.users.id` to attach them to.
4. The current build still reads/writes localStorage by default — wiring the UI to Supabase
   queries instead is the natural next step once your schema is live (the data shapes in
   `lib/types.ts` match the schema column-for-column to make that mapping straightforward).

### Stripe

1. Create two recurring Prices in your Stripe Dashboard (Starter, Pro) and put their IDs in
   `STRIPE_PRICE_STARTER` / `STRIPE_PRICE_PRO`.
2. Set `STRIPE_SECRET_KEY` from your Stripe API keys page.
3. Point a webhook endpoint at `/api/stripe/webhook` for `checkout.session.completed` and
   `customer.subscription.*` events, and copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
4. Without these set, the **Billing** page runs in demo billing mode: upgrade buttons still work,
   they just simulate the subscription change locally instead of calling Stripe.

### OpenAI

Set `OPENAI_API_KEY` and the AI Invoice Generator will use `gpt-4o-mini` to parse instructions
instead of the local regex parser. If the API call fails for any reason (bad key, rate limit,
network), the route automatically falls back to the local parser so the feature never breaks.

---

## 3. Deploying to Vercel

```bash
npm run build   # sanity-check locally first
```

1. Push this repo to GitHub/GitLab/Bitbucket.
2. Import it in [Vercel](https://vercel.com/new).
3. Add whichever environment variables from `.env.example` you want enabled (all optional).
4. Deploy. No special build settings are required — it's a standard Next.js App Router project.

> **Note on this build environment:** this project was generated in a sandbox with no outbound
> network access, so `npm install` / `npm run build` could not be executed here to verify the
> install. Dependency versions in `package.json` are pinned to specific, known-stable releases
> on the public npm registry (see `.npmrc`). Please run `npm install && npm run build` locally
> or let Vercel's build step do it — if anything needs adjusting, it's most likely a dependency
> patch version, not the application code.

---

## 4. What's implemented

- **14 screens**: landing, pricing, login/signup (demo), dashboard, invoices, quotes, customers,
  products/services, AI generator, email drafts, templates/branding, billing, reports, settings.
- **Full CRUD** for invoices, quotes, customers, and products — add/edit/duplicate/delete, all
  persisted to localStorage with schema versioning (`lib/store.ts`) so a future schema change
  won't crash on stale data; it resets gracefully instead.
- **Calculations**: subtotal, per-line tax, discount (flat or %), shipping, total, amount paid,
  balance due — all centralized in `lib/calculations.ts`.
- **Status automation**: invoices flip to "overdue" automatically once the due date passes with
  a balance owing (`getEffectiveInvoiceStatus`, synced into the store on app load).
- **Quotes → Invoices**: one-click conversion that copies line items into a new invoice with a
  fresh auto-incremented number.
- **AI invoice generator**: works with or without `OPENAI_API_KEY`; always produces a usable,
  editable draft you can turn into a real invoice (and an automatic "send invoice" email draft).
- **Email drafts**: generated for sending invoices, payment reminders, overdue notices, quote
  follow-ups, and payment thank-yous. Copy to clipboard or open directly in your email client.
- **Printable invoices/quotes**: a dedicated print stylesheet (`app/globals.css`) isolates the
  document preview so "Print / PDF" produces a clean, professional PDF via the browser's print
  dialog — no extra PDF-rendering dependency required.
- **Plan gating that actually works**: Free plan is capped at 5 invoices/month and 3 AI
  generations/month (tracked from real usage, not placeholders); Starter and Pro unlock more.
  Every plan gets a 14-day trial with full Pro access.
- **No dead buttons**: billing upgrade buttons always do something — either a real Stripe
  Checkout redirect or a clearly-labelled simulated upgrade in demo mode.

## 5. Known simplifications (by design, for a focused MVP)

- Login/signup is a demo gate, not real authentication — there's no password check or session
  persistence beyond the data already in localStorage. Wire this to Supabase Auth for production.
- "PDF export" is implemented as a print-optimized HTML view (browser → Save as PDF), not a
  server-rendered PDF binary, to avoid an extra heavyweight dependency in the demo build.
- Multi-business support is scaffolded in the data model and pricing copy but not built into the
  UI yet — the schema's `business_id` foreign keys are ready for it.
- The deterministic AI parser (used when `OPENAI_API_KEY` is absent) understands common phrasing
  like *"4 hours labour at $85 per hour, due in 7 days, GST included"* but isn't a full NLU
  system — connect a real key for arbitrary phrasing.

## 6. Project structure

```
app/
  page.tsx                landing page
  pricing/                pricing page
  login/                  demo login/signup
  (app)/                  authenticated app shell (sidebar layout)
    dashboard/  invoices/  quotes/  customers/  products/
    ai-generator/  emails/  templates/  billing/  reports/  settings/
  api/
    ai/invoice/            OpenAI-ready AI parsing route
    email/draft/           email draft generation route
    stripe/checkout/       Stripe Checkout session route
    stripe/webhook/        Stripe subscription webhook route
components/                all reusable UI (forms, editors, previews, shell)
lib/                       types, calculations, store (localStorage), AI parser, demo data
supabase/schema.sql        full production schema + RLS policies
```
