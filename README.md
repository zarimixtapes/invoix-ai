# Invoix AI Web App

A web app version of the AI invoice app. Upload this to GitHub and deploy it on Vercel.

## Includes
- Landing page
- Dashboard
- AI invoice creator
- Invoice preview
- Multi-language selector with correct flags
- Pricing page
- Stripe-ready checkout route
- OpenAI-ready API route
- Supabase database schema

## Run locally
```bash
npm install
npm run dev
```

## Create `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=your_stripe_price_id
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Deploy cheapest way
1. Upload this folder to GitHub.
2. Import it into Vercel.
3. Add the environment variables.
4. Deploy.

## Supabase setup
Run `supabase_schema.sql` in Supabase SQL Editor.
