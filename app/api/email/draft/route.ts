import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseAdmin } from '@/lib/supabase/server';
const Body=z.object({project_id:z.string(), recipient_type:z.enum(['client','hq','architect','contractor','subcontractor']), subject:z.string(), body:z.string(), to:z.string().email().optional()});
export async function POST(req:NextRequest){const body=Body.parse(await req.json());const db=createSupabaseAdmin();const {data,error}=await db.from('email_drafts').insert({...body,status:'draft'}).select().single();if(error)return NextResponse.json({error:error.message},{status:400});return NextResponse.json({ok:true,draft:data});}
