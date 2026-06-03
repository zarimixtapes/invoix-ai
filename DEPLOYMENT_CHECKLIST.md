# Deployment checklist

- [ ] Create new GitHub repo, do not overwrite unrelated invoice app unless you want to abandon it.
- [ ] Upload this project.
- [ ] Import into Vercel.
- [ ] Add env vars.
- [ ] Create Supabase project and run `supabase/schema.sql`.
- [ ] Enable Supabase Auth email login.
- [ ] Add Stripe product and recurring monthly price.
- [ ] Set Stripe webhook to `/api/stripe/webhook` if you add the webhook handler.
- [ ] Add Google OAuth credentials for Drive.
- [ ] Replace demo localStorage persistence with Supabase client calls once auth is connected.
