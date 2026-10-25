import mongoose from 'mongoose';
import { app } from './app.js';
import { env } from './config/env.js';
import { MysteryCaseModel } from './models/MysteryCase.js';
import { unlink } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';
import { createServer } from 'node:http';
import { mediaRoot } from './services/media/storage.js';

async function cleanupExpired(){
  const expired=await MysteryCaseModel.find({expiresAt:{$lte:new Date()}}).select('mediaAssets').lean();
  const root=mediaRoot;
  for(const item of expired){
    for(const asset of (item.mediaAssets as any[]||[])){
      if(typeof asset.storagePath!=='string')continue;const file=resolve(asset.storagePath);const rel=relative(root,file);
      if(rel.startsWith(`..${sep}`)||rel==='..'||rel.startsWith(sep))continue;
      try{await unlink(file);}catch{}
    }
  }
  if(expired.length)await MysteryCaseModel.deleteMany({expiresAt:{$lte:new Date()}});
}

async function start(){
  await mongoose.connect(env.MONGODB_URI,{serverSelectionTimeoutMS:10000});
  await MysteryCaseModel.updateMany({status:'generating',updatedAt:{$lt:new Date(Date.now()-env.GENERATION_TIMEOUT_MS)}},{$set:{status:'failed',generationStage:'failed',failureCode:'STALE_GENERATION'}});
  await cleanupExpired();setInterval(()=>{void cleanupExpired().catch(()=>console.error(JSON.stringify({event:'cleanup_failed',code:'CLEANUP_FAILED'})));},15*60*1000).unref();
  const server=createServer(app);
  server.listen(env.SERVER_PORT,'0.0.0.0',()=>console.log(JSON.stringify({event:'server_started',port:env.SERVER_PORT,mode:env.NODE_ENV})));
  const shutdown=(signal:string)=>{console.log(JSON.stringify({event:'server_stopping',signal}));server.close(()=>{void mongoose.disconnect().finally(()=>process.exit(0));});setTimeout(()=>process.exit(1),10000).unref();};
  process.once('SIGTERM',()=>shutdown('SIGTERM'));process.once('SIGINT',()=>shutdown('SIGINT'));
}
start().catch((error:unknown)=>{
  const details=error as {name?:unknown;code?:unknown;codeName?:unknown;cause?:{name?:unknown;code?:unknown}};
  const safe=(value:unknown)=>typeof value==='string'||typeof value==='number'?value:undefined;
  console.error(JSON.stringify({event:'startup_failed',stage:'database_connect',code:'DATABASE_UNAVAILABLE',...(safe(details?.name)?{errorName:safe(details.name)}:{}),...(safe(details?.code)?{errorCode:safe(details.code)}:{}),...(safe(details?.codeName)?{errorCodeName:safe(details.codeName)}:{}),...(safe(details?.cause?.name)?{causeName:safe(details.cause?.name)}:{}),...(safe(details?.cause?.code)?{causeCode:safe(details.cause?.code)}:{})}));
  process.exit(1);
});
