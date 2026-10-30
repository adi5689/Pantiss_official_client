import { serveDriveImage } from '../server/drive-image.js';
import { GoogleRequestError } from '../server/google-errors.js';
import { collections, contentColumns, validateContent } from '../src/features/content/model.js';
import { readContent, writeContent, removeContent, initializeContent, importContent } from '../server/content-store.js';
import { createHmac, timingSafeEqual, randomUUID, scryptSync } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { configured, readMembers, writeMember, removeMember, seedMembers, uploadPhoto } from '../server/team-store.js';
import { columns, validateMember } from '../src/features/team/model.js';
const attempts = new Map();
const sign = value => createHmac('sha256', process.env.TEAM_SESSION_SECRET).update(value).digest('base64url');
const equal = (a, b) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
const authConfigured = () => process.env.TEAM_ADMIN_PASSWORD?.length >= 16 && process.env.TEAM_SESSION_SECRET?.length >= 32;
function authenticated(req) {
  if (!authConfigured()) return false;
  const token = req.headers.cookie?.split(';').map(s => s.trim()).find(s => s.startsWith('pantiss_team='))?.slice(13) || '';
  const [expires, signature] = token.split('.');
  return Boolean(signature && Number(expires) > Date.now() && equal(sign(expires), signature));
}
function cookie(value, maxAge) {
  return `pantiss_team=${value}; Path=/api/team; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
}
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const action = req.query?.action || new URL(req.url, 'http://localhost').searchParams.get('action') || 'list';
  const resource = req.query?.resource || new URL(req.url, 'http://localhost').searchParams.get('resource') || 'team';
  if (resource !== 'team' && !Object.hasOwn(collections, resource)) return res.status(404).json({
    error: 'Unknown content section.'
  });
  try {
    if (req.method === 'GET') {
      if (action === 'image') return await serveDriveImage(req, res, authenticated(req));
      if (action === 'session') return res.status(200).json({
        authenticated: authenticated(req),
        configured: configured(),
        authConfigured: authConfigured()
      });
      if (action !== 'list') return res.status(404).json({
        error: 'Unknown action.'
      });
      if (!configured()) return res.status(200).json({
        members: null,
        configured: false
      });
      const admin = req.query?.admin === '1' || new URL(req.url, 'http://localhost').searchParams.get('admin') === '1';
      if (admin && !authenticated(req)) return res.status(401).json({
        error: 'Please sign in again.'
      });
      const members = (await (resource === 'team' ? readMembers() : readContent(resource))).filter(m => admin || m.status === 'published').map(member => {
        const record = !admin && resource !== 'team' ? validateContent(resource, member) : member;
        return Object.fromEntries((resource === 'team' ? columns : contentColumns(resource)).map(key => [key, record[key]]));
      });
      return res.status(200).json({
        members,
        configured: true
      });
    }
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({
        error: 'Method not allowed.'
      });
    }
    // Reject cross-origin writes and form submissions, including login CSRF.
    const origin = req.headers.origin;
    const host = req.headers.host;
    if (!origin || new URL(origin).host !== host || !req.headers['content-type']?.startsWith('application/json')) return res.status(403).json({
      error: 'Request origin is not allowed.'
    });
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    if (JSON.stringify(body).length > 2900000) return res.status(413).json({
      error: 'Upload must be under 2 MB.'
    });
    if (action === 'login') {
      if (!authConfigured()) return res.status(503).json({
        error: 'Admin access is not configured. Follow docs/team-admin.md.'
      });
      const ip = req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
      const now = Date.now();
      for (const [key, value] of attempts) if (value.until < now) attempts.delete(key);
      const attempt = attempts.get(ip) || {
        count: 0,
        until: now + 900000
      };
      if (attempt.count >= 5) return res.status(429).json({
        error: 'Too many attempts. Try again in 15 minutes.'
      });
      attempt.count++;
      attempts.set(ip, attempt);
      const candidate = String(body.password || '').slice(0, 1024);
      if (!timingSafeEqual(scryptSync(candidate, 'pantiss-team-admin', 32), scryptSync(process.env.TEAM_ADMIN_PASSWORD, 'pantiss-team-admin', 32))) return res.status(401).json({
        error: 'Incorrect password.'
      });
      attempts.delete(ip);
      const expires = String(Date.now() + 8 * 3600000);
      res.setHeader('Set-Cookie', cookie(`${expires}.${sign(expires)}`, 8 * 3600));
      return res.status(200).json({
        ok: true
      });
    }
    if (!authenticated(req)) return res.status(401).json({
      error: 'Please sign in again.'
    });
    if (action === 'logout') {
      res.setHeader('Set-Cookie', cookie('', 0));
      return res.status(200).json({
        ok: true
      });
    }
    if (!configured()) return res.status(503).json({
      error: 'Connect Google Sheets and Drive first. Follow docs/team-admin.md.'
    });
    if (action === 'upload') return res.status(200).json({
      image: await uploadPhoto(body)
    });
    if (resource !== 'team') {
      if (action === 'initialize') {
        await initializeContent(resource);
        return res.status(200).json({
          ok: true
        });
      }
      if (action === 'seed') {
        if ((await readContent(resource)).length) return res.status(409).json({
          error: 'Import is only available for an empty section.'
        });
        const seeds = JSON.parse(readFileSync(new URL('../server/seeds/content.json', import.meta.url), 'utf8'));
        const records = seeds[resource].map(record => validateContent(resource, record));
        await importContent(resource, records);
        return res.status(200).json({
          ok: true
        });
      }
      if (!['save', 'delete', ...(resource === 'tenders' ? ['tender-status'] : [])].includes(action)) return res.status(404).json({
        error: 'Unknown action.'
      });
      const records = await readContent(resource);
      const current = records.find(record => record.id === body.id);
      if (body.id && !current) return res.status(404).json({
        error: 'Record no longer exists. Refresh the list.'
      });
      if (action === 'delete') {
        if (!current) return res.status(400).json({
          error: 'Select an item to remove.'
        });
        await removeContent(resource, current.row);
      } else {
        let record;
        try {
          if (action === 'tender-status' && !current) return res.status(400).json({ error: 'Select a tender to update.' });
          record = validateContent(resource, action === 'tender-status' ? { ...current, tenderStatus: body.tenderStatus } : body);
        } catch (error) {
          return res.status(400).json({
            error: error.message
          });
        }
        record.id = current?.id || randomUUID();
        await writeContent(resource, record, current?.row);
      }
      return res.status(200).json({
        ok: true
      });
    }
    if (action === 'seed') {
      if ((await readMembers()).length) return res.status(409).json({
        error: 'Import is available only for an empty roster.'
      });
      const seed = JSON.parse(readFileSync(new URL('../src/features/team/seed.json', import.meta.url), 'utf8'));
      await seedMembers(seed);
      return res.status(200).json({
        ok: true
      });
    }
    if (!['save', 'delete'].includes(action)) return res.status(404).json({
      error: 'Unknown action.'
    });
    const existing = await readMembers();
    const current = existing.find(m => m.id === body.id);
    if (body.id && !current) return res.status(404).json({
      error: 'Member no longer exists. Refresh the roster.'
    });
    if (action === 'delete') {
      if (!current) return res.status(400).json({
        error: 'Select a member to remove.'
      });
      await removeMember(current.row);
    } else {
      let member;
      try {
        member = validateMember(body);
      } catch (error) {
        return res.status(400).json({
          error: error.message
        });
      }
      member.id = current?.id || randomUUID();
      await writeMember(member, current?.row);
    }
    return res.status(200).json({
      ok: true
    });
  } catch (error) {
    if (error instanceof GoogleRequestError) return res.status(error.status === 400 ? 400 : 502).json({ error: error.message });
    if (error instanceof SyntaxError) return res.status(400).json({
      error: 'Invalid request.'
    });
    return res.status(502).json({
      error: 'Unable to complete the Google request. Check Google credentials, sheet headers and Drive permissions, then retry.'
    });
  }
}
