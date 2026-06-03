# BuildMind AI Functional MVP

This version is intentionally **not a static dashboard**. It includes a working browser demo with:

- Add, edit, delete and status updates for projects, diaries, delays, variations, hazards, defects, timesheets, emails, Drive documents and team members.
- Role switching with permission blocks for worker, subcontractor, client, architect, contractor, builder, PM and owner.
- Voice-to-Everything workflow: one update creates diary, delay, variation, hazard, email draft and construction memory records when relevant.
- Construction Memory search across allowed records.
- Google Drive evidence pack simulation.
- Billing/trial/paywall demo state.
- Audit log for every action.
- API route hooks for OpenAI, Supabase CRUD, Stripe checkout and Drive sync.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploy on Vercel

1. Upload this folder to GitHub.
2. Import the repo into Vercel.
3. Add environment variables from `.env.example`.
4. Run `supabase/schema.sql` in Supabase if you want production database mode.
5. Create a Stripe price and add `STRIPE_PRICE_ID`.

## Demo mode vs production mode

The UI works immediately using browser localStorage, so you can test app logic without API keys. Production API routes are included, but you must connect Supabase, Stripe, OpenAI and Google OAuth credentials to make real backend actions persist outside the browser.

## Important

This is a functional MVP, not a complete Procore replacement. The correct next steps after testing are:

1. Connect Supabase auth and replace localStorage with authenticated records.
2. Connect Stripe webhooks and enforce paywall server-side.
3. Add file uploads for photos/documents.
4. Add Google OAuth for real Drive upload.
5. Add email provider such as Resend, Gmail API or SendGrid.
6. Add mobile/offline mode for construction sites.
