import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest){
  const {to='client', project='Project', context=''} = await req.json();
  const subject = `${project} - Site update and action required`;
  const body = `Hi ${to},\n\nPlease see the latest site update for ${project}.\n\n${context}\n\nActions requested:\n- Review any delay or variation impacts\n- Confirm design/approval items if required\n- Reply with comments or approval\n\nRegards,\nBuildMind AI`;
  return NextResponse.json({draft:{subject,body,status:'draft'}});
}
