import { google } from 'googleapis';
export async function uploadTextToDrive(refreshToken:string, filename:string, text:string){
  const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const drive = google.drive({ version:'v3', auth: oauth2Client });
  const res = await drive.files.create({
    requestBody:{ name: filename, mimeType:'text/plain' },
    media:{ mimeType:'text/plain', body: text },
    fields:'id, webViewLink'
  });
  return res.data;
}
