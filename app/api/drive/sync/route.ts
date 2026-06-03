import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest){
  const {project='Project', records=[]} = await req.json();
  // Production: exchange OAuth token, call Google Drive files.create with upload body.
  return NextResponse.json({demo:true, message:'Drive evidence pack prepared. Connect Google OAuth credentials to upload files in production.', fileName:`${project}-evidence-pack-${new Date().toISOString().slice(0,10)}.json`, recordCount:Array.isArray(records)?records.length:0});
}
