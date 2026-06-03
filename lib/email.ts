import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY || 'missing');
export async function sendEmail({to, subject, body}:{to:string; subject:string; body:string}){
  if(!process.env.RESEND_API_KEY) return { id:'demo-email-not-sent', to, subject, body };
  return resend.emails.send({ from: process.env.EMAIL_FROM || 'BuildMind AI <noreply@example.com>', to, subject, text: body });
}
