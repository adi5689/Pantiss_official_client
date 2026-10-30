import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseEnv } from 'node:util';
// Small Vite middleware adapter for the same handler deployed on Vercel.
import handler from '../api/team.js';
export function teamApiPlugin() {
  return {
    name: 'team-api',
    configureServer(server) {
      server.middlewares.use('/api/team', async (req, res) => {
        // Vite restarts in the same process, where loadEnv otherwise keeps old
        // process.env values. Read server-only local settings on every request.
        const mode = server.config.mode;
        for (const name of ['.env', '.env.local', `.env.${mode}`, `.env.${mode}.local`]) {
          const path = resolve(server.config.envDir, name);
          if (!existsSync(path)) continue;
          for (const [key, value] of Object.entries(parseEnv(readFileSync(path, 'utf8')))) {
            if (key.startsWith('TEAM_') || key.startsWith('GOOGLE_')) process.env[key] = value;
          }
        }
        const query = new URL(req.url, 'http://localhost').searchParams;
        req.query = Object.fromEntries(query);
        const chunks = [];
        let size = 0;
        for await (const chunk of req) {
          size += chunk.length;
          if (size > 2900000) {
            res.statusCode = 413;
            res.end(JSON.stringify({
              error: 'Upload must be under 2 MB.'
            }));
            return;
          }
          chunks.push(chunk);
        }
        req.body = Buffer.concat(chunks).toString() || '{}';
        res.status = code => {
          res.statusCode = code;
          return res;
        };
        res.json = data => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        };
        await handler(req, res);
      });
    }
  };
}
