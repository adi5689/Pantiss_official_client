// Run with explicit --publish authorization. Existing rows are never replaced
// by historical copies; only their media links are migrated.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, basename, extname } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { loadEnv } from 'vite';
import { google, readMembers, uploadPhoto } from '../server/team-store.js';
import { readContent, initializeContent } from '../server/content-store.js';
import { validateContent, collections, contentColumns } from '../src/features/content/model.js';
import { driveImageId, validateMember, columns } from '../src/features/team/model.js';
import { detectImageType, MAX_UPLOAD_BYTES } from '../src/features/content/upload.js';

if(!process.argv.includes('--publish')) throw new Error('Pass --publish only after authorizing publication of historical content.');
Object.assign(process.env,loadEnv('development',process.cwd(),''));
const root=process.cwd();
const statePath=resolve(root,'.content-migration.local');
const reportPath=resolve(root,'.content-migration-report.local');
const state=existsSync(statePath)?JSON.parse(readFileSync(statePath,'utf8')):{media:{},completed:[]};
const report=existsSync(reportPath)?JSON.parse(readFileSync(reportPath,'utf8')):{startedAt:new Date().toISOString(),imagesUploaded:0,imagesReused:0,documentsCopied:0,rowsAdded:{team:0,jobs:0,tenders:0,impact:0},rowsMediaUpdated:{team:0,jobs:0,tenders:0,impact:0},issues:[]};
const folder=process.env.GOOGLE_TEAM_DRIVE_FOLDER_ID;
const seeds=JSON.parse(readFileSync(resolve(root,'server/seeds/content.json'),'utf8'));
seeds.team=JSON.parse(readFileSync(resolve(root,'src/features/team/seed.json'),'utf8'));
const current={team:await readMembers()};
for(const resource of ['jobs','tenders','impact'])current[resource]=await readContent(resource);
const backup=resolve(root,'.content-migration-before.local');
if(!existsSync(backup))writeFileSync(backup,JSON.stringify(current,null,2),{mode:0o600});
const persist=()=>{writeFileSync(statePath,JSON.stringify(state,null,2),{mode:0o600});writeFileSync(reportPath,JSON.stringify(report,null,2),{mode:0o600});};
const json=body=>({headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
const files=[];let pageToken='';
do {
 const query=new URLSearchParams({q:`'${folder}' in parents and trashed = false`,fields:'nextPageToken,files(id,mimeType,md5Checksum)',pageSize:'1000',supportsAllDrives:'true',includeItemsFromAllDrives:'true'});
 if(pageToken)query.set('pageToken',pageToken);
 const result=await google(`https://www.googleapis.com/drive/v3/files?${query}`);
 files.push(...(result.files||[]));pageToken=result.nextPageToken||'';
}while(pageToken);
const existingHashes=new Map(files.filter(f=>f.md5Checksum).map(f=>[f.md5Checksum,f]));
const temp=resolve(tmpdir(),'pantiss-content-migration');mkdirSync(temp,{recursive:true});
async function makePublic(id){await google(`https://www.googleapis.com/drive/v3/files/${id}/permissions?supportsAllDrives=true`,{method:'POST',...json({type:'anyone',role:'reader'})});}
async function image(source){
 if(!source||driveImageId(source))return source;
 if(state.media[source])return state.media[source];
 let bytes;
 if(source.startsWith('/')){
  const path=resolve(root,'public',source.slice(1));
  if(!path.startsWith(resolve(root,'public')+'/'))throw new Error('Invalid local media path.');
  bytes=readFileSync(path);
 }else{
  const url=new URL(source);
  if(url.protocol!=='https:'||!['pantiss.com','www.pantiss.com','images.unsplash.com','img.youtube.com'].includes(url.hostname))return source;
  const response=await fetch(url,{signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw new Error(`Source image unavailable (HTTP ${response.status}).`);
  bytes=Buffer.from(await response.arrayBuffer());
 }
 const sourceHash=createHash('sha256').update(bytes).digest('hex');
 let type=detectImageType(bytes);
 if(bytes.length>MAX_UPLOAD_BYTES||!type){
  const input=resolve(temp,`${sourceHash}${extname(new URL(source,'https://local.invalid').pathname)||'.img'}`);
  const output=resolve(temp,`${sourceHash}.jpg`);
  writeFileSync(input,bytes);
  execFileSync('/usr/bin/sips',['-Z','1600','-s','format','jpeg','-s','formatOptions','80',input,'--out',output],{stdio:'ignore'});
  bytes=readFileSync(output);type=detectImageType(bytes);
 }
 if(bytes.length>MAX_UPLOAD_BYTES||!type)throw new Error('Image could not be optimized to a supported format under 2 MB.');
 const md5=createHash('md5').update(bytes).digest('hex');
 const duplicate=existingHashes.get(md5);
 let url;
 if(duplicate){await makePublic(duplicate.id);url=`https://drive.google.com/thumbnail?id=${duplicate.id}&sz=w800`;report.imagesReused++;}
 else{
  url=await uploadPhoto({name:basename(new URL(source,'https://local.invalid').pathname),data:bytes.toString('base64'),type});
  const id=driveImageId(url);existingHashes.set(md5,{id});report.imagesUploaded++;
 }
 state.media[source]=url;persist();return url;
}
async function document(source){
 const id=driveImageId(source);
 if(!id)return source;
 if(state.media[source])return state.media[source];
 if(files.some(file=>file.id===id))return source;
 const result=await google(`https://www.googleapis.com/drive/v3/files/${id}/copy?supportsAllDrives=true&fields=id`,{method:'POST',...json({parents:[folder]})});
 await makePublic(result.id);
 const url=`https://drive.google.com/file/d/${result.id}/view`;
 state.media[source]=url;report.documentsCopied++;persist();return url;
}
function key(resource,row){return resource==='team'?`${row.name}|${row.department}`:`${row.title}|${row.category||''}|${row.location||''}`;}
async function migrateMedia(resource,record){
 let changed=false;
 for(const field of ['image',...(['tenders','impact'].includes(resource)?['link']:resource==='jobs'?['document']:[])]){
  if(!record[field])continue;
  try{const migrated=field==='image'?await image(record[field]):await document(record[field]);if(migrated!==record[field]){record[field]=migrated;changed=true;}}
  catch(error){report.issues.push({section:resource,title:record.title||record.name,field,error:error.message});persist();}
 }
 return changed;
}
for(const resource of ['team','jobs','tenders','impact']){
 if(resource!=='team')await initializeContent(resource);
 const knownIds=new Set(current[resource].map(r=>r.id));
 const knownKeys=new Set(current[resource].map(r=>key(resource,r)));
 const updates=[];
 const headers=resource==='team'?columns:contentColumns(resource);
 const tab=(resource==='team'?(process.env.GOOGLE_TEAM_SHEET_TAB||'Team'):collections[resource].tab).replaceAll("'","''");
 const range=row=>`'${tab}'!A${row}:${String.fromCharCode(64+headers.length)}${row}`;
 const queue=(record,row)=>updates.push({range:range(row),values:[headers.map(key=>record[key]??'')]});
 if(!current[resource].length)updates.push({range:range(1),values:[headers]});
 let added=0,changed=0;
 for(const row of current[resource]){
  if(await migrateMedia(resource,row)){
   queue(resource==='team'?validateMember(row):validateContent(resource,row),row.row);
   changed++;
  }
 }
 let nextRow=Math.max(1,...current[resource].map(row=>row.row))+1;
 for(const original of seeds[resource]){
  if(knownIds.has(original.id)||knownKeys.has(key(resource,original)))continue;
  const row={...original,status:'published'};
  await migrateMedia(resource,row);
  queue(resource==='team'?validateMember(row):validateContent(resource,row),nextRow++);
  knownIds.add(row.id);knownKeys.add(key(resource,row));added++;
 }
 if(updates.length)await google(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(process.env.GOOGLE_TEAM_SHEET_ID)}/values:batchUpdate`,{method:'POST',...json({valueInputOption:'RAW',data:updates})});
 report.rowsAdded[resource]+=added;report.rowsMediaUpdated[resource]+=changed;persist();
 console.log(JSON.stringify({section:resource,added,mediaUpdated:changed}));
}
report.finishedAt=new Date().toISOString();report.totals={};
report.totals.team=(await readMembers()).length;
for(const resource of ['jobs','tenders','impact'])report.totals[resource]=(await readContent(resource)).length;
persist();
console.log(JSON.stringify(report));
