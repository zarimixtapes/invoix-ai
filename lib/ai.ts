import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'missing' });

export async function generateSiteIntelligence(input:string){
  if(!process.env.OPENAI_API_KEY){
    return {
      summary: input,
      diary: `Site diary generated from: ${input}`,
      delays: input.toLowerCase().includes('delay') ? [{reason:'Potential delay mentioned', impact_hours:2, evidence_required:['photos','weather','delivery docket']}] : [],
      variations: input.toLowerCase().includes('extra') || input.toLowerCase().includes('variation') ? [{title:'Possible variation', draft_scope: input, status:'draft'}] : [],
      hazards: input.toLowerCase().includes('hazard') ? [{title:'Hazard mentioned', risk:'Review required'}] : [],
      defects: input.toLowerCase().includes('defect') ? [{title:'Defect mentioned', severity:'medium'}] : [],
      client_email: `Hi, here is the latest site update:\n\n${input}\n\nRegards,`,
      hq_email: `Team update:\n\n${input}`
    };
  }
  const res = await client.chat.completions.create({
    model:'gpt-4o-mini',
    messages:[{role:'system',content:'You are construction documentation AI. Return strict JSON with summary, diary, delays[], variations[], hazards[], defects[], client_email, hq_email, architect_email. Avoid legal certainty; use draft wording.'},{role:'user',content:input}],
    response_format:{type:'json_object'}
  });
  return JSON.parse(res.choices[0]?.message?.content || '{}');
}

export async function answerProjectMemory(question:string, context:string){
  if(!process.env.OPENAI_API_KEY) return `Project Memory answer placeholder for: ${question}\n\nContext found:\n${context.slice(0,800)}`;
  const res = await client.chat.completions.create({model:'gpt-4o-mini',messages:[{role:'system',content:'Answer from construction records only. If missing, say what evidence is missing.'},{role:'user',content:`Question: ${question}\nRecords:\n${context}`} ]});
  return res.choices[0]?.message?.content || '';
}
