import { detectImageType, MAX_UPLOAD_BYTES } from '../src/features/content/upload.js';
import { GoogleRequestError, googleFailure } from './google-errors.js';
import { randomUUID, createHash } from 'node:crypto';
import { columns } from '../src/features/team/model.js';
let cachedToken;
export const configured = () => ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN', 'GOOGLE_TEAM_SHEET_ID', 'GOOGLE_TEAM_DRIVE_FOLDER_ID'].every(key => process.env[key]);
export async function google(url, options = {}, responseType = 'json') {
  const credentialKey = createHash('sha256').update([process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REFRESH_TOKEN].join('|')).digest('hex');
  if (!cachedToken || cachedToken.expires < Date.now() || cachedToken.credentialKey !== credentialKey) {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
        grant_type: 'refresh_token'
      }),
      signal: AbortSignal.timeout(15000)
    });
    const token = await response.json();
    if (!response.ok) throw new GoogleRequestError(response.status, 'authorization', 'Google authorization failed. Reauthorize the account and update the server refresh token.');
    cachedToken = {
      credentialKey,
      value: token.access_token,
      expires: Date.now() + (token.expires_in - 60) * 1000
    };
  }
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${cachedToken.value}`
    },
    signal: AbortSignal.timeout(20000)
  });
  if (response.ok && responseType === 'response') return response;
  const data = await response.json();
  if (!response.ok) throw googleFailure(response.status, data);
  return data;
}
function range(value) {
  const tab = (process.env.GOOGLE_TEAM_SHEET_TAB || 'Team').replaceAll("'", "''");
  return `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(process.env.GOOGLE_TEAM_SHEET_ID)}/values/${encodeURIComponent(`'${tab}'!${value}`)}`;
}
export async function readMembers() {
  const {
    values = []
  } = await google(range('A:I'));
  if (values.length && columns.some((key, i) => values[0][i] !== key)) throw new Error('Sheet headers do not match. Follow docs/team-admin.md.');
  return values.slice(1).map((row, i) => ({
    ...Object.fromEntries(columns.map((key, j) => [key, row[j] ?? ''])),
    row: i + 2
  })).filter(m => m.id);
}
export async function writeMember(member, row) {
  if (!row) {
    const {
      values = []
    } = await google(range('A1:I1'));
    if (!values.length) await google(`${range('A1:I1')}?valueInputOption=RAW`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [columns]
      })
    });
  }
  const values = [columns.map(key => member[key] ?? '')];
  if (row) return google(`${range(`A${row}:I${row}`)}?valueInputOption=RAW`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values
    })
  });
  return google(`${range('A:I')}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values
    })
  });
}
export async function removeMember(row) {
  await google(`${range(`A${row}:I${row}`)}:clear`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: '{}'
  });
}
export async function seedMembers(members) {
  await google(`${range(`A1:I${members.length + 1}`)}?valueInputOption=RAW`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: [columns, ...members.map(m => columns.map(key => m[key] ?? ''))]
    })
  });
}
export async function uploadPhoto({
  data,
  name,
  kind = 'image'
}) {
  const bytes = Buffer.from(data || '', 'base64');
  if (bytes.length > MAX_UPLOAD_BYTES) throw new GoogleRequestError(400, 'fileTooLarge', 'This file exceeds the 2 MB upload limit. Choose a smaller file.');
  if (!bytes.length) throw new GoogleRequestError(400, 'emptyUpload', 'This file is empty. Select a different file.');
  const imageType = detectImageType(bytes);
  const pdf = kind === 'document' && bytes.toString('ascii', 0, 5) === '%PDF-';
  const contentType = pdf ? 'application/pdf' : imageType;
  if (!contentType || (kind === 'document' && !pdf)) throw new GoogleRequestError(400, 'invalidUpload', kind === 'document' ? 'This document is not a PDF. Export it as PDF before uploading.' : 'This file is not a supported image. Export it as JPEG, PNG or WebP before uploading.');
  const extension = ({'image/jpeg':'jpg','image/png':'png','image/webp':'webp','application/pdf':'pdf'})[contentType];
  const uploadName = `${String(name || 'Upload').replace(/\.[^.]+$/, '').slice(0, 115)}.${extension}`;
  const boundary = `pantiss-${randomUUID()}`;
  const metadata = JSON.stringify({
    name: uploadName,
    parents: [process.env.GOOGLE_TEAM_DRIVE_FOLDER_ID]
  });
  const body = Buffer.concat([Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: ${contentType}\r\n\r\n`), bytes, Buffer.from(`\r\n--${boundary}--`)]);
  const file = await google('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=id', {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body
  });
  try {
    await google(`https://www.googleapis.com/drive/v3/files/${file.id}/permissions?supportsAllDrives=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'anyone',
        role: 'reader'
      })
    });
  } catch (error) {
    throw new GoogleRequestError(error.status || 502, 'sharingFailed', `File uploaded, but public viewing could not be enabled. ${error instanceof GoogleRequestError ? error.message : 'Check the folder’s public sharing policy.'}`);
  }
  return pdf ? `https://drive.google.com/file/d/${file.id}/view` : `https://drive.google.com/thumbnail?id=${file.id}&sz=w800`;
}
