import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin';

export async function GET(req: NextRequest){
  const supabase = getSupabaseAdmin();
  if(!supabase) return NextResponse.json({ demo:true, items:[], note:'Supabase env vars not configured. App uses localStorage demo mode.' });
  const companyId = req.nextUrl.searchParams.get('company_id');
  let q = supabase.from('records').select('*').order('created_at',{ascending:false});
  if(companyId) q = q.eq('company_id', companyId);
  const {data,error} = await q;
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({items:data});
}

export async function POST(req: NextRequest){
  const supabase = getSupabaseAdmin();
  const body = await req.json();
  if(!supabase) return NextResponse.json({ demo:true, item:{...body,id:crypto.randomUUID()}, note:'Saved in browser demo mode unless Supabase is configured.' });
  const {data,error} = await supabase.from('records').insert(body).select('*').single();
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({item:data});
}

export async function PUT(req: NextRequest){
  const supabase = getSupabaseAdmin();
  const body = await req.json();
  if(!supabase) return NextResponse.json({ demo:true, item:body });
  const {id,...patch}=body;
  const {data,error}=await supabase.from('records').update(patch).eq('id',id).select('*').single();
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({item:data});
}

export async function DELETE(req: NextRequest){
  const supabase = getSupabaseAdmin();
  const id = req.nextUrl.searchParams.get('id');
  if(!id) return NextResponse.json({error:'Missing id'},{status:400});
  if(!supabase) return NextResponse.json({ demo:true, deleted:id });
  const {error}=await supabase.from('records').delete().eq('id',id);
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({deleted:id});
}
