# BuildMind AI — Complete MVP

BuildMind AI is a voice-first construction operating system MVP. It is not a finished Procore clone, but it is an organised deployable foundation with the core product architecture: projects, teams, roles, trials, subscriptions, paywall, site diaries, delays, variations, defects, hazards, timesheets, document vault, AI project memory, draft emails, Drive sync hooks, and audit logs.

## Tech stack
- Next.js App Router
- Supabase Auth + Postgres + RLS
- Stripe subscriptions + 14 day trial
- OpenAI for AI site updates/search/drafting
- Google Drive API hook
- Resend email hook

## Setup
1. Create a Supabase project.
2. Run `supabase/schema.sql` in Supabase SQL editor.
3. Copy `.env.example` to `.env.local` and fill values.
4. Create a Stripe product/price and add the monthly price id to `STRIPE_PRO_PRICE_ID`.
5. Add Stripe webhook endpoint `/api/stripe/webhook`.
6. Optional: configure Google OAuth consent + Drive API.
7. Run:

```bash
npm install
npm run dev
```

## Recommended production flow
- Use Supabase Auth email/password or magic link.
- First login creates a company workspace and 14-day trial.
- Roles control access: owner, admin, project_manager, builder, contractor, subcontractor, architect, client, worker, safety_officer, finance.
- Paywall checks subscription status and trial end date.
- Trial abuse reduction stores user id, email hash and optional device fingerprint.

## What still needs real-world setup
- Real domain email verification for Resend.
- Google OAuth verification if requesting sensitive scopes publicly.
- Construction-law review of generated variation/delay documents before using legally.
- Proper QA and penetration testing before storing sensitive commercial data.
