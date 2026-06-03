import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
export async function POST(req: NextRequest){
  const {companyId,userEmail} = await req.json();
  if(!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID){
    return NextResponse.json({demo:true, checkoutUrl:'/'});
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const session = await stripe.checkout.sessions.create({
    mode:'subscription',
    customer_email:userEmail,
    line_items:[{price:process.env.STRIPE_PRICE_ID,quantity:1}],
    subscription_data:{trial_period_days:14,metadata:{companyId:companyId||'unknown'}},
    success_url:`${process.env.NEXT_PUBLIC_APP_URL}/?billing=success`,
    cancel_url:`${process.env.NEXT_PUBLIC_APP_URL}/?billing=cancelled`,
    metadata:{companyId:companyId||'unknown'}
  });
  return NextResponse.json({checkoutUrl:session.url});
}
