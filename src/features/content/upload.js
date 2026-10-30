export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
export function detectImageType(bytes) {
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'image/jpeg';
  if ([137,80,78,71,13,10,26,10].every((value,i)=>bytes[i]===value)) return 'image/png';
  const ascii=(start,end)=>String.fromCharCode(...bytes.subarray(start,end));
  if (ascii(0,4)==='RIFF' && ascii(8,12)==='WEBP') return 'image/webp';
  return '';
}
const readBase64 = blob => new Promise((resolve,reject)=>{
  const reader=new FileReader();
  reader.onload=()=>resolve(reader.result.split(',')[1]);
  reader.onerror=()=>reject(new Error('Could not read the selected file. Please select it again.'));
  reader.readAsDataURL(blob);
});
async function convertImage(file) {
  const url=URL.createObjectURL(file);
  try {
    const image=await new Promise((resolve,reject)=>{
      const img=new Image();
      img.onload=()=>resolve(img);
      img.onerror=()=>reject(new Error('Your browser cannot read this image format. Export it as JPEG or PNG and select the exported file.'));
      img.src=url;
    });
    const scale=Math.min(1,2048/Math.max(image.naturalWidth,image.naturalHeight));
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));
    canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
    const context=canvas.getContext('2d');
    if(!context)throw new Error('Image conversion is unavailable. Export this image as JPEG or PNG.');
    // JPEG has no alpha channel; preserve a predictable white background.
    context.fillStyle='white';context.fillRect(0,0,canvas.width,canvas.height);
    context.drawImage(image,0,0,canvas.width,canvas.height);
    return await new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Could not convert this image. Export it as JPEG or PNG.')),'image/jpeg',0.9));
  } finally { URL.revokeObjectURL(url); }
}
export async function prepareUpload(file,kind='image') {
  if(file.size>MAX_UPLOAD_BYTES)throw new Error('This file exceeds the 2 MB upload limit. Choose a smaller file.');
  if(!file.size)throw new Error('This file is empty. Select a different file.');
  const bytes=new Uint8Array(await file.arrayBuffer());
  let type=detectImageType(bytes);
  let blob=file;
  if(kind==='document') {
    if(String.fromCharCode(...bytes.subarray(0,5))!=='%PDF-')throw new Error('This document is not a PDF. Export it as PDF before uploading.');
    type='application/pdf';
  } else if(!type) {
    blob=await convertImage(file);
    type='image/jpeg';
  }
  if(blob.size>MAX_UPLOAD_BYTES)throw new Error('The converted image exceeds 2 MB. Export a smaller JPEG or PNG.');
  const extension=({'image/jpeg':'jpg','image/png':'png','image/webp':'webp','application/pdf':'pdf'})[type];
  const name=`${(file.name||'upload').replace(/\.[^.]+$/,'')}.${extension}`;
  return {data:await readBase64(blob),type,name,kind};
}
