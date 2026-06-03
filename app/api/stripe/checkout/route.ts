import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getMembership } from '@/lib/auth';
export async function POST(){
  const membership = await getMembership();
  if(!membership) return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`,303);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const session = await stripe.checkout.sessions.create({
    mode:'subscription',
    line_items:[{price:process.env.STRIPE_PRO_PRICE_ID!,quantity:1}],
    success_url:`${appUrl}/dashboard/billing?success=1`,
    cancel_url:`${appUrl}/paywall?cancelled=1`,
    subscription_data:{ trial_period_days:Number(process.env.TRIAL_DAYS || 14), metadata:{ company_id: membership.company_id } },
    client_reference_id: membership.company_id,
    metadata:{ company_id: membership.company_id },
    allow_promotion_codes:true
  });
  return NextResponse.redirect(session.url!, 303);
}
