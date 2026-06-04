# BuildMind AI Production MVP

A functional localStorage-first MVP for an AI-first construction management web app. It is not a static dashboard: modules support add, edit, delete, approve/close, role switching, permission blocks, generated project records, demo billing, and API-ready routes.

## What works immediately

- Landing, pricing, login demo, dashboard, projects, site diaries, delays, variations, hazards, defects, timesheets, reports/email drafts, construction memory, team permissions, billing, settings.
- Local browser persistence with `localStorage`.
- Working CRUD forms and modals.
- Role-based view/edit behaviour for owner, builder, project manager, contractor, subcontractor, worker, client, architect.
- Voice-to-Everything demo workflow that creates actual records.
- Demo-safe API routes that do not crash without keys.

## Deploy to Vercel

1. Upload this project to a fresh repository or deploy directly with Vercel CLI.
2. Use Node 20.x.
3. Run `npm install`.
4. Run `npm run build`.
5. Deploy.

## Environment variables

Copy `.env.example` to your Vercel environment. The app works without keys in demo mode. Add keys when ready:

- `OPENAI_API_KEY` for `/api/ai/site-update`
- `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET` for billing
- Google OAuth keys for Drive sync
- Supabase keys when moving from localStorage to database persistence

## Supabase

Run `supabase/schema.sql` in Supabase SQL editor. RLS starter policies are included, but you must adapt them to your real Supabase Auth user model before production use.

## Production notes

This is a strong MVP foundation, not a finished Procore replacement. Before charging real companies, add:

- Supabase Auth and server persistence
- real file/photo uploads
- PDF report exports
- real email provider integration
- Google Drive OAuth/token storage
- Stripe webhook signature verification
- security review and QA
