import { NextRequest, NextResponse } from 'next/server';

function localParse(text: string, projectId = 'demo-project') {
  const lower = text.toLowerCase();
  const base = { projectId, source: 'deterministic-demo-parser', originalText: text };
  return {
    siteDiary: { ...base, title: 'Generated site diary', details: text, status: 'draft' },
    delay: /(rain|storm|late|delay|weather|supplier|permit)/.test(lower) ? { ...base, title: 'Detected delay', details: text, severity: lower.includes('storm') ? 'high' : 'medium', status: 'open' } : null,
    variation: /(variation|extra|change|client requested|additional|scope)/.test(lower) ? { ...base, title: 'Detected variation draft', details: text, status: 'draft' } : null,
    hazard: /(hazard|unsafe|injury|trench|barrier|ppe|scaffold|fall)/.test(lower) ? { ...base, title: 'Detected safety hazard', details: text, severity: lower.includes('injury') ? 'critical' : 'high', status: 'open' } : null,
    defect: /(defect|crack|leak|damage|broken|poor finish)/.test(lower) ? { ...base, title: 'Detected defect', details: text, severity: 'medium', status: 'open' } : null,
    emailDraft: { ...base, subject: 'Project site update', recipientType: lower.includes('architect') ? 'architect' : lower.includes('hq') ? 'hq' : 'client', body: `Hi team,\n\nSite update: ${text}\n\nBuildMind has created the matching diary, delay, variation, safety and memory records where relevant.\n\nRegards,`, status: 'draft' },
    memoryEntry: { ...base, title: 'Project memory entry', details: text, status: 'open' }
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const text = String(body.text || '');
  const projectId = String(body.projectId || 'demo-project');
  if (!text.trim()) return NextResponse.json({ error: 'Text is required.' }, { status: 400 });

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ mode: 'demo', message: 'OPENAI_API_KEY missing. Deterministic parser used.', data: localParse(text, projectId) });
  }

  try {
    const res = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
        input: `Classify this construction site update into JSON with keys siteDiary, delay, variation, hazard, defect, emailDraft, memoryEntry. Return concise structured JSON only. Project ID: ${projectId}\nUpdate: ${text}`
      })
    });
    const json = await res.json();
    return NextResponse.json({ mode: 'openai', raw: json, fallback: localParse(text, projectId) });
  } catch (error) {
    return NextResponse.json({ mode: 'fallback', message: 'OpenAI request failed. Demo parser used.', data: localParse(text, projectId), error: error instanceof Error ? error.message : 'Unknown error' });
  }
}
