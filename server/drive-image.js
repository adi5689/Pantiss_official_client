import { google } from './team-store.js';
import { detectImageType, MAX_UPLOAD_BYTES } from '../src/features/content/upload.js';

export async function serveDriveImage(req, res, admin = false) {
  const id = req.query?.id || new URL(req.url, 'http://localhost').searchParams.get('id');
  if (typeof id !== 'string' || !/^[\w-]{1,200}$/.test(id)) return res.status(400).json({error:'Invalid image ID.'});
  const base = `https://www.googleapis.com/drive/v3/files/${id}`;
  const metadata = await google(`${base}?fields=mimeType,size,trashed,parents,permissions(type,role)&supportsAllDrives=true`);
  const publiclyViewable = metadata.permissions?.some(permission => permission.type === 'anyone' && ['reader','writer','commenter'].includes(permission.role));
  const privatePreview = admin && metadata.parents?.includes(process.env.GOOGLE_TEAM_DRIVE_FOLDER_ID);
  if (!publiclyViewable && !privatePreview) return res.status(403).json({error:'This image does not allow public viewing.'});
  if (metadata.trashed || !['image/jpeg','image/png','image/webp'].includes(metadata.mimeType) || Number(metadata.size) > MAX_UPLOAD_BYTES) return res.status(400).json({error:'This file is not a supported website image.'});
  const response = await google(`${base}?alt=media&supportsAllDrives=true`, {}, 'response');
  // Bound the body even if Drive metadata is stale or missing a size.
  const chunks=[];let length=0;
  for await (const chunk of response.body) {
    length+=chunk.length;
    if(length>MAX_UPLOAD_BYTES)throw new Error('Image exceeds the delivery limit.');
    chunks.push(Buffer.from(chunk));
  }
  const bytes=Buffer.concat(chunks);
  const type=detectImageType(bytes);
  if(!type)return res.status(400).json({error:'This file is not a supported image.'});
  res.setHeader('Content-Type',type);
  res.setHeader('Content-Length',bytes.length);
  res.setHeader('Content-Disposition','inline');
  res.setHeader('Cache-Control',publiclyViewable?'public, max-age=3600':'private, no-store');
  res.status(200);res.end(bytes);
}
