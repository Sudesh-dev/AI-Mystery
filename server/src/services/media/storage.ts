import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve, sep } from 'node:path';
import { env } from '../../config/env.js';
export const mediaRoot=env.MEDIA_STORAGE_DIR;
export async function saveAsset(caseId:string,evidenceId:string,asset:{bytes:Buffer;mimeType:string;provider:string;model:string}){
  const extension=asset.mimeType==='video/mp4'?'mp4':'png';const storagePath=resolve(mediaRoot,caseId,`${evidenceId}.${extension}`);
  const relativePath=relative(mediaRoot,storagePath);
  if(relativePath.startsWith(`..${sep}`)||relativePath==='..'||relativePath.startsWith(sep))throw new Error('Invalid media path');
  await mkdir(dirname(storagePath),{recursive:true});await writeFile(storagePath,asset.bytes,{flag:'wx'});
  return {evidenceId,assetType:extension==='mp4'?'video':'image',state:'ready',provider:asset.provider,model:asset.model,mimeType:asset.mimeType,storagePath,createdAt:new Date()};
}
