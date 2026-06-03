import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendEmail } from '@/lib/email';
import { createSupabaseAdmin } from '@/lib/supabase/server';
const Body=z.object({draft_id:z.string().uuid(), to:z.string().email()});
export async function POST(req:NextRequest){const {draft_id,to}=Body.parse(await req.json());const db=createSupabaseAdmin();const {data:draft,error}=await db.from('email_drafts').select('*').eq('id',draft_id).single();if(error||!draft)return NextResponse.json({error:'Draft not found'},{status:404});const sent=await sendEmail({to,subject:draft.subject,body:draft.body});await db.from('email_drafts').update({status:'sent',sent_at:new Date().toISOString(),to_email:to}).eq('id',draft_id);return NextResponse.json({ok:true,sent});}
