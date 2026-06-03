import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest){
  const { update, project } = await req.json();
  if(!update) return NextResponse.json({error:'Missing update text'},{status:400});
  if(!process.env.OPENAI_API_KEY){
    const lower = String(update).toLowerCase();
    return NextResponse.json({demo:true, records:[
      {type:'diary',title:'Site diary from update',body:update,status:'open'},
      ...(lower.includes('delay')||lower.includes('late')||lower.includes('rain')?[{type:'delay',title:'Potential delay detected',body:update,status:'open'}]:[]),
      ...(lower.includes('client requested')||lower.includes('variation')||lower.includes('extra')?[{type:'variation',title:'Potential variation detected',body:update,status:'pending'}]:[]),
      ...(lower.includes('hazard')||lower.includes('trench')||lower.includes('unsafe')?[{type:'hazard',title:'Potential hazard detected',body:update,status:'high'}]:[]),
      {type:'email',title:`Draft project update${project?` for ${project}`:''}`,body:`Hi team,\n\nToday's update: ${update}\n\nPlease review the attached evidence and required actions.`,status:'draft'},
      {type:'memory',title:'Construction memory entry',body:update,status:'open'}
    ]});
  }
  const openai = new OpenAI({apiKey:process.env.OPENAI_API_KEY});
  const response = await openai.chat.completions.create({
    model:'gpt-4o-mini',
    response_format:{type:'json_object'},
    messages:[{role:'system',content:'Extract construction records from a site update. Return JSON with records array. Each record has type, title, body, status. Types: diary, delay, variation, hazard, defect, timesheet, email, memory.'},{role:'user',content:`Project: ${project||'Unknown'}\nUpdate: ${update}`}]
  });
  const content=response.choices[0]?.message?.content || '{"records":[]}';
  return NextResponse.json(JSON.parse(content));
}
