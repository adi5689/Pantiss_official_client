import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { collections, contentColumns, validateContent, blankRecord, isOpen, safeLink } from '../src/features/content/model.js';
import { readContent, initializeContent, writeContent, removeContent } from '../server/content-store.js';
import handler from '../api/team.js';
const validJob = {
  ...blankRecord('jobs'),
  title: 'Programme lead',
  category: 'Project Management',
  location: 'Odisha',
  googleFormLink: 'mailto:hr@example.com',
  description: 'Lead delivery',
  status: 'published'
};
const validTender = {
  ...blankRecord('tenders'),
  title: 'Equipment supply',
  location: 'Odisha',
  startDate: '2026-10-01',
  deadline: '2026-11-01',
  link: 'https://example.com/notice.pdf',
  status: 'published'
};
const validImpact = {
  ...blankRecord('impact'),
  title: 'A new impact story',
  category: 'Insights',
  body: 'An actual article.',
  status: 'published'
};
test('validates content, unsafe links, date order and publication requirements', () => {
  for (const [resource, record] of [['jobs', validJob], ['tenders', validTender], ['impact', validImpact]]) assert.equal(validateContent(resource, record).title, record.title);
  assert.throws(() => validateContent('jobs', {
    ...validJob,
    googleFormLink: 'javascript:alert(1)'
  }));
  assert.throws(() => validateContent('tenders', {
    ...validTender,
    deadline: '2026-09-01'
  }));
  assert.throws(() => validateContent('tenders', {
    ...validTender,
    startDate: '2026-02-30'
  }));
  assert.throws(() => validateContent('impact', {
    ...validImpact,
    body: '',
    link: ''
  }));
  assert.equal(safeLink('//evil.example'), false);
  assert.equal(safeLink('https://user:password@example.com'), false);
});
test('deadlines close opportunities at the end of the India calendar day', () => {
  assert.equal(isOpen({
    ...validJob,
    deadline: '2026-10-30'
  }, new Date('2026-10-30T18:29:00Z')), true);
  assert.equal(isOpen({
    ...validJob,
    deadline: '2026-10-30'
  }, new Date('2026-10-30T18:30:00Z')), false);
  assert.equal(isOpen({
    ...validTender,
    tenderStatus: 'closed'
  }, new Date('2026-10-20')), false);
});
test('migration copies are valid drafts, and Teams has no seed fallback', () => {
  const seeds = JSON.parse(readFileSync(new URL('../server/seeds/content.json', import.meta.url), 'utf8'));
  assert.equal(seeds.tenders[0].startDate, '2026-07-02');
  assert.equal(seeds.tenders[0].deadline, '2026-07-08');
  for (const resource of Object.keys(collections)) for (const item of seeds[resource]) {
    assert.equal(item.status, 'draft');
    assert.doesNotThrow(() => validateContent(resource, item));
  }
  const teamSource = readFileSync(new URL('../src/Components/TeamPage/TeamTabs/TeamTabs.jsx', import.meta.url), 'utf8');
  assert.doesNotMatch(teamSource, /seed\.json|useState\(seed\)|\?\? seed/);
});
test('initializes new worksheets, writes RAW values and clears only the selected row', async () => {
  const original = globalThis.fetch;
  const requests = [];
  let exists = false;
  for (const key of ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN', 'GOOGLE_TEAM_SHEET_ID', 'GOOGLE_TEAM_DRIVE_FOLDER_ID']) process.env[key] = 'content-fixture';
  globalThis.fetch = async (url, options = {}) => {
    requests.push({
      url,
      options
    });
    return {
      ok: true,
      json: async () => {
        if (url.includes('oauth2')) return {
          access_token: 'test',
          expires_in: 3600
        };
        if (url.endsWith(':batchUpdate')) {
          exists = true;
          return {};
        }
        if (url.includes('?fields=sheets.properties.title')) return {
          sheets: exists ? [{
            properties: {
              title: 'Jobs'
            }
          }] : []
        };
        return {
          values: []
        };
      }
    };
  };
  try {
    assert.deepEqual(await readContent('jobs'), []);
    assert.equal(requests.some(r => r.options.method === 'PUT'), false);
    await initializeContent('jobs');
    await writeContent('jobs', {
      ...validJob,
      id: 'test-id',
      title: '=literal'
    }, 4);
    await removeContent('jobs', 4);
    const write = requests.find(r => r.options.method === 'PUT' && decodeURIComponent(r.url).includes(`A4:${String.fromCharCode(64 + contentColumns('jobs').length)}4`));
    assert.ok(write);
    assert.match(write.url, /valueInputOption=RAW/);
    assert.equal(JSON.parse(write.options.body).values[0][1], '=literal');
    assert.ok(requests.some(r => r.url.endsWith(':clear') && decodeURIComponent(r.url).includes(`A4:${String.fromCharCode(64 + contentColumns('jobs').length)}4`)));
  } finally {
    globalThis.fetch = original;
  }
});
async function call(resource, admin = false, cookie) {
  const req = {
    method: 'GET',
    url: '/api/team',
    query: {
      action: 'list',
      resource,
      admin: admin ? '1' : '0'
    },
    headers: {
      cookie
    }
  };
  const res = {
    setHeader() {},
    status(code) {
      this.code = code;
      return this;
    },
    json(data) {
      this.data = data;
    }
  };
  await handler(req, res);
  return res;
}
test('each public collection filters drafts, rejects unknown sections and requires admin auth', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async url => ({
    ok: true,
    json: async () => {
      if (url.includes('oauth2')) return {
        access_token: 'test',
        expires_in: 3600
      };
      if (url.includes('?fields=sheets.properties.title')) return {
        sheets: Object.values(collections).map(c => ({
          properties: {
            title: c.tab
          }
        }))
      };
      const resource = Object.keys(collections).find(key => decodeURIComponent(url).includes(`'${collections[key].tab}'`));
      const record = {
        jobs: validJob,
        tenders: validTender,
        impact: validImpact
      }[resource];
      return {
        values: [contentColumns(resource), ...['published', 'draft'].map((status, i) => contentColumns(resource).map(key => ({
          ...record,
          id: String(i),
          status
        })[key] || ''))]
      };
    }
  });
  try {
    for (const resource of Object.keys(collections)) {
      const response = await call(resource);
      assert.equal(response.code, 200);
      assert.equal(response.data.members.length, 1);
      assert.equal(response.data.members[0].status, 'published');
      assert.equal('row' in response.data.members[0], false);
      assert.equal((await call(resource, true)).code, 401);
    }
    assert.equal((await call('constructor')).code, 404);
  } finally {
    globalThis.fetch = original;
  }
});

test('PDF uploads validate file signatures and return a Drive document URL', async () => {
  const { uploadPhoto } = await import('../server/team-store.js');
  await assert.rejects(() => uploadPhoto({kind:'document',type:'application/pdf',data:Buffer.from('not a pdf').toString('base64')}));
  const original=globalThis.fetch;
  const requests=[];
  globalThis.fetch=async(url,options={})=>{requests.push({url,options});return {ok:true,json:async()=>url.includes('oauth2')?{access_token:'mock',expires_in:3600}:url.includes('/upload/')?{id:'test-document'}:{}};};
  try {
    const url=await uploadPhoto({kind:'document',type:'application/pdf',name:'notice.pdf',data:Buffer.from('%PDF-1.7\nfixture').toString('base64')});
    assert.equal(url,'https://drive.google.com/file/d/test-document/view');
    assert.ok(requests.some(r=>r.url.includes('/permissions')&&JSON.parse(r.options.body).role==='reader'));
  } finally {globalThis.fetch=original;}
});

test('tender status toggle requires authentication and preserves current tender fields', async () => {
  const original = globalThis.fetch;
  process.env.TEAM_ADMIN_PASSWORD = 'test-only-password-long-enough';
  process.env.TEAM_SESSION_SECRET = 'test-only-session-secret-longer-than-32-characters';
  for (const key of ['GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET','GOOGLE_REFRESH_TOKEN','GOOGLE_TEAM_SHEET_ID','GOOGLE_TEAM_DRIVE_FOLDER_ID']) process.env[key]='toggle-fixture';
  const current={...validTender,id:'tender-toggle',title:'Latest server title',tenderStatus:'closed'};
  let written;
  globalThis.fetch=async(url,options={})=>({ok:true,json:async()=>{
    if(url.includes('oauth2'))return {access_token:'mock',expires_in:3600};
    if(url.includes('?fields=sheets.properties.title'))return {sheets:[{properties:{title:'Tenders'}}]};
    if(options.method==='PUT'){written=JSON.parse(options.body).values[0];return {};}
    return {values:[contentColumns('tenders'),contentColumns('tenders').map(key=>current[key]??'')]};
  }});
  async function request(action,body,cookie){
    const req={method:'POST',url:'/api/team',query:{resource:'tenders',action},headers:{host:'localhost:5173',origin:'http://localhost:5173','content-type':'application/json',cookie},body};
    const res={headers:{},setHeader(key,value){this.headers[key]=value;},status(code){this.code=code;return this;},json(data){this.data=data;}};
    await handler(req,res);return res;
  }
  try {
    assert.equal((await request('tender-status',{id:current.id,tenderStatus:'open'})).code,401);
    const login=await request('login',{password:process.env.TEAM_ADMIN_PASSWORD});
    const cookie=login.headers['Set-Cookie'].split(';')[0];
    assert.equal((await request('tender-status',{id:current.id,tenderStatus:'invalid'},cookie)).code,400);
    assert.equal((await request('tender-status',{id:current.id,tenderStatus:'open',title:'Stale client title',status:'draft'},cookie)).code,200);
    const saved=Object.fromEntries(contentColumns('tenders').map((key,i)=>[key,written[i]]));
    assert.equal(saved.tenderStatus,'open');assert.equal(saved.title,current.title);assert.equal(saved.status,'published');
  } finally {globalThis.fetch=original;}
});
