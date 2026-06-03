import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createSupabaseAdmin } from '@/lib/supabase/server';
export async function POST(req:NextRequest){
  const sig=req.headers.get('stripe-signature'); const raw=await req.text();
  let event; try{ event=stripe.webhooks.constructEvent(raw,sig!,process.env.STRIPE_WEBHOOK_SECRET!); }catch(e:any){ return new NextResponse(`Webhook Error: ${e.message}`,{status:400}); }
  const db=createSupabaseAdmin();
  if(event.type==='checkout.session.completed'){
    const session:any=event.data.object; const companyId=session.metadata?.company_id || session.client_reference_id;
    if(companyId) await db.from('companies').update({stripe_customer_id:session.customer,subscription_status:'trialing'}).eq('id',companyId);
  }
  if(event.type==='customer.subscription.created'||event.type==='customer.subscription.updated'||event.type==='customer.subscription.deleted'){
    const sub:any=event.data.object; const companyId=sub.metadata?.company_id;
    const status=sub.status;
    await db.from('subscriptions').upsert({ company_id: companyId || null, stripe_subscription_id:sub.id, stripe_customer_id:sub.customer, status, current_period_end: sub.current_period_end ? new Date(sub.current_period_end*1000).toISOString() : null, trial_end: sub.trial_end ? new Date(sub.trial_end*1000).toISOString() : null },{onConflict:'stripe_subscription_id'});
    if(companyId) await db.from('companies').update({subscription_status:status, trial_ends_at: sub.trial_end ? new Date(sub.trial_end*1000).toISOString() : undefined}).eq('id',companyId);
  }
  return NextResponse.json({received:true});
}
