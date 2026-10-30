import test from 'node:test';
import assert from 'node:assert/strict';
import {googleFailure,GoogleRequestError} from '../server/google-errors.js';
import {uploadPhoto} from '../server/team-store.js';

test('maps known Google failures to actionable messages without echoing responses',()=>{
  const quota=googleFailure(403,{error:{message:'private Google response',errors:[{reason:'storageQuotaExceeded'}]}});
  assert.ok(quota instanceof GoogleRequestError);
  assert.match(quota.message,/storage is full/);
  assert.doesNotMatch(quota.message,/private Google response/);
  assert.match(googleFailure(403,{error:{errors:[{reason:'insufficientPermissions'}]}}).message,/Reauthorize/);
  assert.doesNotMatch(googleFailure(500,{error:{message:'sensitive material'}}).message,/sensitive material/);
});
test('invalid image signatures produce a client validation error',async()=>{
  await assert.rejects(()=>uploadPhoto({type:'image/jpeg',data:Buffer.from('not a JPEG').toString('base64')}),error=>error instanceof GoogleRequestError&&error.status===400&&/JPEG/.test(error.message));
});

test('a small PNG mislabeled as JPEG uploads with its detected MIME type and extension', async()=>{
  const original=globalThis.fetch;let uploaded;
  globalThis.fetch=async(url,options={})=>{
    if(url.includes('/upload/'))uploaded=options.body.toString('utf8');
    return {ok:true,json:async()=>url.includes('oauth2')?{access_token:'fixture',expires_in:3600}:url.includes('/upload/')?{id:'image-test'}:{}};
  };
  try {
    const bytes=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a5s8AAAAASUVORK5CYII=','base64');
    const result=await uploadPhoto({type:'image/jpeg',name:'portrait.jpg',data:bytes.toString('base64')});
    assert.match(result,/id=image-test/);
    assert.match(uploaded,/Content-Type: image\/png/);
    assert.match(uploaded,/portrait\.png/);
  } finally {globalThis.fetch=original;}
});

test('size errors are distinct from invalid image format errors', async()=>{
  await assert.rejects(()=>uploadPhoto({data:Buffer.alloc(2*1024*1024+1).toString('base64')}),error=>error.reason==='fileTooLarge'&&/exceeds/.test(error.message));
});
