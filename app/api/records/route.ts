import { NextResponse } from 'next/server';
export async function GET(){return NextResponse.json({message:'Supabase-ready records endpoint. LocalStorage demo owns browser state until Supabase is connected.'});}
export async function POST(){return NextResponse.json({message:'Connect Supabase service role to persist records server-side.'});}
