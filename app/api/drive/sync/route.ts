import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const payload = {
    id: `drive_${Date.now()}`,
    projectId: body.projectId || 'demo-project',
    fileName: body.fileName || `BuildMind evidence pack ${new Date().toISOString().slice(0,10)}.json`,
    status: process.env.GOOGLE_CLIENT_ID ? 'ready_for_google_oauth' : 'simulated',
    recordsCount: Array.isArray(body.records) ? body.records.length : 0,
    createdAt: new Date().toISOString()
  };
  return NextResponse.json({ message: process.env.GOOGLE_CLIENT_ID ? 'Google Drive OAuth credentials detected. Implement token exchange/upload here.' : 'Drive sync simulated. Add Google OAuth keys to enable production sync.', sync: payload });
}
