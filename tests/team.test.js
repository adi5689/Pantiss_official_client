import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/team.js';
import { validateMember, imageUrl } from '../src/features/team/model.js';
import { uploadPhoto } from '../server/team-store.js';
function call({
  method = 'GET',
  action = 'list',
  body,
  headers = {}
} = {}) {
  const req = {
    method,
    url: `/api/team?action=${action}`,
    query: {
      action
    },
    headers: {
      host: 'localhost:5173',
      ...headers
    },
    body
  };
  const res = {
    headers: {},
    setHeader(key, value) {
      this.headers[key] = value;
    },
    status(code) {
      this.code = code;
      return this;
    },
    json(data) {
      this.data = data;
      return this;
    }
  };
  return handler(req, res).then(() => res);
}
const origin = {
  origin: 'http://localhost:5173',
  'content-type': 'application/json'
};
test('validates publication, groups and unsafe URLs', () => {
  const member = {
    name: 'Example',
    title: 'Lead',
    image: '/assets/teams/example.png',
    department: 'founders',
    order: 1,
    status: 'published'
  };
  assert.equal(validateMember(member).name, 'Example');
  assert.throws(() => validateMember({
    ...member,
    image: 'javascript:alert(1)'
  }));
  assert.throws(() => validateMember({
    ...member,
    department: 'finance'
  }));
  assert.throws(() => validateMember({
    ...member,
    department: 'region'
  }));
  assert.throws(() => validateMember({
    ...member,
    order: -1
  }));
  assert.throws(() => validateMember({
    ...member,
    image: ''
  }));
  assert.equal(validateMember({
    ...member,
    status: 'draft',
    image: ''
  }).status, 'draft');
  assert.match(imageUrl('https://drive.google.com/file/d/abc_123/view'), /id=abc_123/);
});
test('missing Google config returns explicit fallback instead of empty roster', async () => {
  const res = await call();
  assert.equal(res.code, 200);
  assert.equal(res.data.members, null);
});
test('rejects cross-origin writes and unauthorized mutation', async () => {
  assert.equal((await call({
    method: 'POST',
    action: 'save',
    headers: {
      ...origin,
      origin: 'https://evil.example'
    },
    body: {}
  })).code, 403);
  assert.equal((await call({
    method: 'POST',
    action: 'save',
    headers: origin,
    body: {}
  })).code, 401);
});
test('signed session login, tampering and logout', async () => {
  process.env.TEAM_ADMIN_PASSWORD = 'test-only-long-password';
  process.env.TEAM_SESSION_SECRET = 'test-only-session-secret-at-least-32-characters';
  assert.equal((await call({
    method: 'POST',
    action: 'login',
    headers: origin,
    body: {
      password: 'wrong'
    }
  })).code, 401);
  const login = await call({
    method: 'POST',
    action: 'login',
    headers: origin,
    body: {
      password: process.env.TEAM_ADMIN_PASSWORD
    }
  });
  assert.equal(login.code, 200);
  const cookie = login.headers['Set-Cookie'].split(';')[0];
  assert.match(login.headers['Set-Cookie'], /HttpOnly; SameSite=Strict/);
  assert.equal((await call({
    action: 'session',
    headers: {
      cookie
    }
  })).data.authenticated, true);
  assert.equal((await call({
    action: 'session',
    headers: {
      cookie: cookie + 'x'
    }
  })).data.authenticated, false);
  const logout = await call({
    method: 'POST',
    action: 'logout',
    headers: {
      ...origin,
      cookie
    },
    body: {}
  });
  assert.match(logout.headers['Set-Cookie'], /Max-Age=0/);
});
test('rejects disguised image uploads before contacting Google', async () => {
  await assert.rejects(() => uploadPhoto({
    type: 'image/png',
    data: Buffer.from('<svg/>').toString('base64')
  }), /JPEG, PNG or WebP/);
});
test('Google-backed list hides drafts and CRUD writes RAW cells', async () => {
  for (const key of ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN', 'GOOGLE_TEAM_SHEET_ID', 'GOOGLE_TEAM_DRIVE_FOLDER_ID']) process.env[key] = 'test-placeholder';
  const {
    columns
  } = await import('../src/features/team/model.js');
  const rows = [columns, ['public', 'Public member', 'Lead', '/assets/teams/test.png', 'founders', '', '', 1, 'published'], ['private', 'Draft member', 'Lead', '', 'founders', '', '', 2, 'draft']];
  const requests = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options = {}) => {
    requests.push({
      url,
      options
    });
    return {
      ok: true,
      json: async () => url.includes('oauth2') ? {
        access_token: 'mock-access',
        expires_in: 3600
      } : options.method ? {} : {
        values: rows
      }
    };
  };
  try {
    const publicList = await call();
    assert.deepEqual(publicList.data.members.map(m => m.id), ['public']);
    assert.equal('row' in publicList.data.members[0], false);
    const login = await call({
      method: 'POST',
      action: 'login',
      headers: origin,
      body: {
        password: process.env.TEAM_ADMIN_PASSWORD
      }
    });
    const cookie = login.headers['Set-Cookie'].split(';')[0];
    const headers = {
      ...origin,
      cookie
    };
    const saved = await call({
      method: 'POST',
      action: 'save',
      headers,
      body: {
        id: 'public',
        name: '=not a formula',
        title: 'Lead',
        image: '/assets/teams/test.png',
        department: 'founders',
        order: 4,
        status: 'published'
      }
    });
    assert.equal(saved.code, 200);
    const write = requests.find(r => r.options.method === 'PUT');
    assert.match(write.url, /valueInputOption=RAW/);
    assert.equal(JSON.parse(write.options.body).values[0][1], '=not a formula');
    const removed = await call({
      method: 'POST',
      action: 'delete',
      headers,
      body: {
        id: 'private'
      }
    });
    assert.equal(removed.code, 200);
    assert.ok(requests.some(r => r.url.includes('A3%3AI3') && r.url.endsWith(':clear')));
    assert.equal((await call({
      method: 'POST',
      action: 'seed',
      headers,
      body: {}
    })).code, 409);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
