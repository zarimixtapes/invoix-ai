import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const text = await req.text();
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ mode: 'demo', message: 'Webhook received but STRIPE_WEBHOOK_SECRET missing. In production verify signature before updating subscription.', bytes: text.length });
  }
  return NextResponse.json({ received: true, message: 'Webhook endpoint ready. Add signature verification and Supabase update logic for production.', bytes: text.length });
}
