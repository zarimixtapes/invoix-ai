import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const recipientType = body.recipientType || 'client';
  const update = body.update || body.details || 'Project update not supplied.';
  const subject = body.subject || `BuildMind update for ${recipientType}`;
  const draft = {
    id: `email_${Date.now()}`,
    recipientType,
    projectId: body.projectId || 'demo-project',
    subject,
    status: 'draft',
    body: `Hi ${recipientType},\n\n${update}\n\nPlease review and advise if you require further details.\n\nRegards,\nBuildMind AI`,
    createdAt: new Date().toISOString(),
    mode: process.env.EMAIL_PROVIDER_API_KEY ? 'production-ready-hook' : 'demo-local-draft'
  };
  return NextResponse.json({ message: process.env.EMAIL_PROVIDER_API_KEY ? 'Email provider can be connected here.' : 'Demo draft generated. Connect an email provider to send.', draft });
}
