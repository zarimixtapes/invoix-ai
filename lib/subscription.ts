import { createSupabaseAdmin } from './supabase/server';
export async function hasAccess(companyId:string){
  const db = createSupabaseAdmin();
  const { data } = await db.from('companies').select('subscription_status, trial_ends_at').eq('id', companyId).single();
  if(!data) return false;
  if(['active','trialing'].includes(data.subscription_status)) return true;
  if(data.trial_ends_at && new Date(data.trial_ends_at).getTime() > Date.now()) return true;
  return false;
}
export async function assertAccess(companyId:string){
  const ok = await hasAccess(companyId);
  if(!ok) throw new Error('PAYWALL_REQUIRED');
}
