import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { createSupabaseAdmin, createSupabaseServerClient } from '@/lib/supabase/server';
const Body=z.object({company_name:z.string().min(2),email:z.string().email(),role:z.string().optional(),fingerprint:z.string().optional()});
function hash(v:string){return crypto.createHash('sha256').update(v.toLowerCase().trim()).digest('hex')}
export async function POST(req:NextRequest){
  const body=Body.parse(await req.json());
  const auth=await createSupabaseServerClient(); const {data:{user}}=await auth.auth.getUser();
  if(!user) return NextResponse.json({error:'Login required before workspace creation.'},{status:401});
  const db=createSupabaseAdmin(); const email_hash=hash(body.email); const fp_hash=body.fingerprint?hash(body.fingerprint):null;
  const {data:existing}=await db.from('trial_guardrails').select('id').or(`email_hash.eq.${email_hash}${fp_hash?`,fingerprint_hash.eq.${fp_hash}`:''}`).limit(1);
  if(existing&&existing.length>0) return NextResponse.json({error:'Trial already used. Please subscribe or contact support.'},{status:409});
  const trialEnds=new Date(Date.now()+Number(process.env.TRIAL_DAYS||14)*86400000).toISOString();
  const {data:company,error}=await db.from('companies').insert({name:body.company_name,trial_ends_at:trialEnds,subscription_status:'trialing'}).select().single();
  if(error) return NextResponse.json({error:error.message},{status:400});
  await db.from('memberships').insert({company_id:company.id,user_id:user.id,role:'owner'});
  await db.from('trial_guardrails').insert({email_hash,fingerprint_hash:fp_hash,company_id:company.id,trial_started_at:new Date().toISOString()});
  await db.from('audit_logs').insert({company_id:company.id,actor_id:user.id,action:'workspace.created',metadata:{role:body.role||'builder'}});
  return NextResponse.json({ok:true,company});
}
