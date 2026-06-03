# Deployment checklist

## Supabase
- Create project
- Run `supabase/schema.sql`
- Enable email auth
- Add storage buckets: project-photos, documents, reports
- Confirm RLS is enabled on all public tables

## Stripe
- Create product: BuildMind Pro
- Create monthly price
- Put price id in `STRIPE_PRO_PRICE_ID`
- Add webhook URL: `/api/stripe/webhook`
- Listen for subscription created/updated/deleted events

## Vercel
- Import GitHub repo
- Add environment variables
- Deploy
- Test `/pricing`, `/dashboard`, `/api/ai/site-update`

## Google Drive
- Create Google Cloud project
- Enable Drive API
- Create OAuth credentials
- Add callback URL
- Fill Google env vars

## Email
- Verify domain in Resend
- Set `EMAIL_FROM`
- Test `/api/email/send`

## Legal/compliance warning
Generated delay, variation and claim letters should be reviewed before being relied on as legal or contractual notices.
