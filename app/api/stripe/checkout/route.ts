import { NextResponse } from 'next/server';

export async function POST() {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
    return NextResponse.json({ mode: 'demo', message: 'Stripe keys missing. Demo billing remains active; no checkout session created.' });
  }
  const params = new URLSearchParams();
  params.append('mode', 'subscription');
  params.append('line_items[0][price]', process.env.STRIPE_PRICE_ID);
  params.append('line_items[0][quantity]', '1');
  params.append('subscription_data[trial_period_days]', '14');
  params.append('success_url', `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?billing=success`);
  params.append('cancel_url', `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?billing=cancelled`);
  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
