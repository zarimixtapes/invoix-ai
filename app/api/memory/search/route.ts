import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { answerProjectMemory } from '@/lib/ai';
import { createSupabaseAdmin } from '@/lib/supabase/server';
const Body=z.object({project_id:z.string(), question:z.string()});
export async function POST(req:NextRequest){const body=Body.parse(await req.json());const db=createSupabaseAdmin();const {data}=await db.from('project_memory').select('content,created_at,source_table').eq('project_id',body.project_id).limit(100);const context=(data||[]).map((r:any)=>`${r.created_at} ${r.source_table}: ${r.content}`).join('\n');const answer=await answerProjectMemory(body.question,context);return NextResponse.json({answer,sources:data});}
