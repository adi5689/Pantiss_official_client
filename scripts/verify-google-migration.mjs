import {readFileSync,writeFileSync} from 'node:fs';
import {loadEnv} from 'vite';
import {readMembers} from '../server/team-store.js';
import {readContent} from '../server/content-store.js';
import {imageUrl} from '../src/features/team/model.js';
Object.assign(process.env,loadEnv('development',process.cwd(),''));
const before=JSON.parse(readFileSync('.content-migration-before.local','utf8'));
const after={team:await readMembers()};
for(const resource of ['jobs','tenders','impact'])after[resource]=await readContent(resource);
const changed=[];
for(const [resource,rows]of Object.entries(before))for(const old of rows){
 const current=after[resource].find(row=>row.id===old.id);
 if(!current){changed.push({resource,id:old.id,field:'missing'});continue;}
 for(const [field,value]of Object.entries(old))if(!['image','document','link','row'].includes(field)&&String(current[field]??'')!==String(value??''))changed.push({resource,id:old.id,field});
}
const results={counts:{},existingFieldsPreserved:changed.length===0,unexpectedChanges:changed,images:[]};
for(const resource of Object.keys(after)){
 const response=await fetch(`http://localhost:5173/api/team?action=list&resource=${resource}`,{signal:AbortSignal.timeout(30000)});
 const data=await response.json();
 results.counts[resource]={stored:after[resource].length,published:after[resource].filter(row=>row.status==='published').length,publicApiCount:data.members?.length,publicApiStatus:response.status};
 if(!response.ok)throw new Error(`Public API failed for ${resource}.`);
}
for(const [resource,records]of [['team',after.team],['impact',after.impact]]){
 const images=records.filter(row=>row.image?.includes('drive.google.com'));
 for(const row of [images[0],images.at(-1)].filter(Boolean)){
  const response=await fetch(`http://localhost:5173${imageUrl(row.image)}`,{signal:AbortSignal.timeout(30000)});
  const bytes=await response.arrayBuffer();
  results.images.push({section:resource,ok:response.ok,type:response.headers.get('content-type'),bytes:bytes.byteLength});
 }
}
writeFileSync('.content-migration-verification.local',JSON.stringify(results,null,2),{mode:0o600});
console.log(JSON.stringify(results));
if(changed.length||results.images.some(image=>!image.ok))process.exitCode=1;
