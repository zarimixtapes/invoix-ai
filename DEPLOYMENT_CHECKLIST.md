# Deployment checklist

- [ ] Use a fresh Vercel project, not the old invoice project cache.
- [ ] Node version: 20.x.
- [ ] `npm install` succeeds.
- [ ] `npm run build` succeeds.
- [ ] Add env vars in Vercel.
- [ ] Test localStorage demo modules.
- [ ] Test `/api/ai/site-update` without OpenAI key; it should return demo parser output.
- [ ] Add OpenAI key and retest AI route.
- [ ] Create Stripe product/price and add `STRIPE_PRICE_ID`.
- [ ] Add Supabase project and run `supabase/schema.sql`.
- [ ] Only launch paid users after Auth, RLS and billing webhooks are fully connected.
