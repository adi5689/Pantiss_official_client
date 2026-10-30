import test from 'node:test';
import assert from 'node:assert/strict';
import { serveDriveImage } from '../server/drive-image.js';
import { imageUrl, normalizeImageUrl } from '../src/features/team/model.js';
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a5s8AAAAASUVORK5CYII=','base64');
function response(){return {headers:{},setHeader(k,v){this.headers[k]=v;},status(code){this.code=code;return this;},json(data){this.data=data;},end(bytes){this.bytes=bytes;}};}

test('Drive share and thumbnail links render through the site without rewriting stored URLs',()=>{
  assert.equal(imageUrl('https://drive.google.com/file/d/example-file/view'),'/api/team?action=image&id=example-file');
  assert.equal(imageUrl('https://drive.google.com/thumbnail?id=example-file&sz=w800'),'/api/team?action=image&id=example-file');
  assert.equal(normalizeImageUrl('https://drive.google.com/file/d/example-file/view'),'https://drive.google.com/thumbnail?id=example-file&sz=w800');
  assert.equal(imageUrl('/assets/teams/photo.png'),'/assets/teams/photo.png');
  assert.equal(imageUrl('https://drive.google.com.attacker.example/file/d/example/view'),'https://drive.google.com.attacker.example/file/d/example/view');
});
test('serves public image bytes but never exposes arbitrary private Drive files',async()=>{
  const original=globalThis.fetch;let permissions=[{type:'anyone',role:'reader'}];let mediaReads=0;
  process.env.GOOGLE_TEAM_DRIVE_FOLDER_ID='media-folder';
  globalThis.fetch=async url=>{
    if(url.includes('oauth2'))return Response.json({access_token:'fixture',expires_in:3600});
    if(url.includes('alt=media')){mediaReads++;return new Response(png,{headers:{'Content-Type':'image/png'}});}
    return Response.json({mimeType:'image/png',size:String(png.length),parents:['media-folder'],permissions});
  };
  try{
    const res=response();await serveDriveImage({query:{id:'public-file'}},res);
    assert.equal(res.code,200);assert.equal(res.headers['Content-Type'],'image/png');assert.deepEqual(res.bytes,png);
    assert.match(res.headers['Cache-Control'],/^public/);
    permissions=[];
    const denied=response();await serveDriveImage({query:{id:'private-file'}},denied);
    assert.equal(denied.code,403);assert.equal(mediaReads,1);
    const preview=response();await serveDriveImage({query:{id:'draft-image'}},preview,true);
    assert.equal(preview.code,200);assert.equal(preview.headers['Cache-Control'],'private, no-store');
    const invalid=response();await serveDriveImage({query:{id:'../secret'}},invalid);
    assert.equal(invalid.code,400);
  }finally{globalThis.fetch=original;}
});
