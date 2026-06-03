import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateSiteIntelligence } from '@/lib/ai';
import { createSupabaseAdmin } from '@/lib/supabase/server';
const Body = z.object({ project_id:z.string(), input:z.string().min(3), source:z.string().optional() });
export async function POST(req:NextRequest){
  const body = Body.parse(await req.json());
  const intelligence = await generateSiteIntelligence(body.input);
  if(body.project_id !== 'demo'){
    const db = createSupabaseAdmin();
    const { data: diary } = await db.from('site_diaries').insert({ project_id:body.project_id, raw_input:body.input, ai_summary:intelligence.summary, diary_text:intelligence.diary }).select().single();
    for(const d of intelligence.delays || []) await db.from('delays').insert({ project_id:body.project_id, diary_id:diary?.id, reason:d.reason, impact_hours:d.impact_hours || 0, status:'draft', evidence_required:d.evidence_required || [] });
    for(const v of intelligence.variations || []) await db.from('variations').insert({ project_id:body.project_id, diary_id:diary?.id, title:v.title || 'Variation draft', scope:v.draft_scope || body.input, status:'draft' });
    for(const h of intelligence.hazards || []) await db.from('hazards').insert({ project_id:body.project_id, diary_id:diary?.id, title:h.title || 'Hazard', risk_level:h.risk || 'review' });
    for(const f of intelligence.defects || []) await db.from('defects').insert({ project_id:body.project_id, diary_id:diary?.id, title:f.title || 'Defect', severity:f.severity || 'medium' });
    await db.from('email_drafts').insert([{ project_id:body.project_id, recipient_type:'client', subject:'Site update', body:intelligence.client_email || '' },{ project_id:body.project_id, recipient_type:'hq', subject:'Internal site update', body:intelligence.hq_email || '' },{ project_id:body.project_id, recipient_type:'architect', subject:'Design/site query update', body:intelligence.architect_email || '' }]);
    await db.from('project_memory').insert({ project_id:body.project_id, source_table:'site_diaries', source_id:diary?.id, content:JSON.stringify(intelligence) });
  }
  return NextResponse.json({ ok:true, intelligence });
}
