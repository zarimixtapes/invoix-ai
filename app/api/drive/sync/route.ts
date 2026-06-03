import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { uploadTextToDrive } from '@/lib/drive';
import { createSupabaseAdmin } from '@/lib/supabase/server';
const Body=z.object({project_id:z.string(), refresh_token:z.string(), filename:z.string().optional()});
export async function POST(req:NextRequest){const body=Body.parse(await req.json());const db=createSupabaseAdmin();const {data}=await db.from('project_memory').select('content,created_at').eq('project_id',body.project_id).order('created_at',{ascending:false}).limit(50);const text=(data||[]).map((r:any)=>`[${r.created_at}] ${r.content}`).join('\n\n');const file=await uploadTextToDrive(body.refresh_token,body.filename||`BuildMind-${body.project_id}-export.txt`,text);await db.from('drive_sync_logs').insert({project_id:body.project_id,file_id:file.id,file_url:file.webViewLink,status:'synced'});return NextResponse.json({ok:true,file});}
