import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from './supabase/server';
import { Role } from './types';

export async function requireUser(){
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if(!user) redirect('/login');
  return user;
}
export async function getMembership(companyId?: string){
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if(!user) return null;
  let q = supabase.from('memberships').select('*, companies(*)').eq('user_id', user.id).limit(1);
  if(companyId) q = q.eq('company_id', companyId);
  const { data } = await q.maybeSingle();
  return data as null | { company_id:string; role:Role; companies:any };
}
