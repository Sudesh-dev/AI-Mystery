import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { accusationSchema, createCaseSchema } from '../domain/schemas.js';
import { caseHistoryDto, createCase, getOwnedCase, resultDto, useSampleFallback } from '../services/caseService.js';
import { MysteryCaseModel } from '../models/MysteryCase.js';
import { env } from '../config/env.js';
import { relative, resolve, sep } from 'node:path';
import { mediaRoot } from '../services/media/storage.js';

export const apiRouter=Router();
const generationLimit=rateLimit({windowMs:60*60*1000,limit:env.MAX_CASE_GENERATIONS_PER_HOUR,standardHeaders:'draft-7',legacyHeaders:false,message:{error:{code:'RATE_LIMITED',message:'Please wait before opening another case.'}}});
function fail(res:any,status:number,code:string,message:string){return res.status(status).json({error:{code,message,requestId:res.locals.requestId}});}
async function generationSlotAvailable(ownerSessionId:string,res:any){
  const active=await MysteryCaseModel.exists({ownerSessionId,status:'generating'});if(active){fail(res,409,'CASE_NOT_READY','Your current case is still being prepared.');return false;}
  const recent=await MysteryCaseModel.countDocuments({ownerSessionId,createdAt:{$gte:new Date(Date.now()-60*60*1000)}});if(recent>=env.MAX_CASE_GENERATIONS_PER_HOUR){fail(res,429,'RATE_LIMITED','You have opened several cases recently. Please try again later.');return false;}
  return true;
}
apiRouter.get('/cases/history',async(req,res,next)=>{
  try{
    const records=await MysteryCaseModel.find({ownerSessionId:req.sessionId}).sort({createdAt:-1}).limit(30).select('publicId status generationStage failureStage failureCode demoMode fallbackReason input publicCase createdAt updatedAt').lean();
    return res.json({history:records.map(caseHistoryDto)});
  }catch(error){next(error);}
});
apiRouter.post('/cases',generationLimit,async(req,res,next)=>{
  try{
    const origin=req.get('origin');if((env.NODE_ENV==='production'&&origin!==env.CLIENT_ORIGIN)||(origin&&origin!==env.CLIENT_ORIGIN))return fail(res,403,'ORIGIN_NOT_ALLOWED','This request could not be accepted.');
    const parsed=createCaseSchema.safeParse(req.body);if(!parsed.success)return fail(res,400,'VALIDATION_ERROR','Please check the scenario and case settings.');
    if(!await generationSlotAvailable(req.sessionId,res))return;
    const {publicId}=await createCase(req.sessionId,parsed.data);
    return res.status(202).json({caseId:publicId,status:'generating',generationStage:'blueprint',pollAfterMs:1500});
  }catch(error){next(error);}
});
apiRouter.post('/cases/:caseId/retry',generationLimit,async(req,res,next)=>{
  try{
    const origin=req.get('origin');if((env.NODE_ENV==='production'&&origin!==env.CLIENT_ORIGIN)||(origin&&origin!==env.CLIENT_ORIGIN))return fail(res,403,'ORIGIN_NOT_ALLOWED','This request could not be accepted.');
    const original:any=await MysteryCaseModel.findOne({publicId:req.params.caseId,ownerSessionId:req.sessionId}).select('status demoMode input').lean();
    if(!original)return fail(res,404,'CASE_NOT_FOUND','That case could not be found.');
    if(!(original.status==='failed'||(original.status==='ready'&&original.demoMode)))return fail(res,409,'RETRY_NOT_AVAILABLE','Only a failed generation or a sample fallback can be retried.');
    if(!await generationSlotAvailable(req.sessionId,res))return;
    const {publicId}=await createCase(req.sessionId,original.input as Record<string,unknown>);
    return res.status(202).json({caseId:publicId,status:'generating',generationStage:'blueprint',pollAfterMs:1500});
  }catch(error){next(error);}
});
apiRouter.post('/cases/:caseId/fallback',async(req,res,next)=>{
  try{
    const origin=req.get('origin');if((env.NODE_ENV==='production'&&origin!==env.CLIENT_ORIGIN)||(origin&&origin!==env.CLIENT_ORIGIN))return fail(res,403,'ORIGIN_NOT_ALLOWED','This request could not be accepted.');
    const result=await useSampleFallback(req.params.caseId,req.sessionId);if(!result)return fail(res,404,'CASE_NOT_FOUND','That case could not be found.');
    return res.json({status:result.status,demoMode:result.status==='ready'});
  }catch(error){next(error);}
});
apiRouter.get('/cases/:caseId',async(req,res,next)=>{
  try{
    const record=await getOwnedCase(req.params.caseId,req.sessionId);if(!record)return fail(res,404,'CASE_NOT_FOUND','That case could not be found.');
    if(record.status==='generating')return res.json({caseId:record.publicId,status:record.status,generationStage:record.generationStage,slowGeneration:Boolean(record.slowGeneration),pollAfterMs:1500});
    if(record.status==='failed')return res.json({caseId:record.publicId,status:'failed',message:'This case could not be prepared. Please try another story.'});
    return res.json({caseId:record.publicId,status:record.status,demoMode:Boolean(record.demoMode)||!env.GEMINI_API_KEY||!env.GEMINI_QUICK_TEXT_MODEL,publicCase:record.publicCase,...(record.status==='completed'?{accusation:{submittedAt:(record.accusation as any)?.submittedAt}}:{})});
  }catch(error){next(error);}
});
apiRouter.post('/cases/:caseId/accusations',async(req,res,next)=>{
  try{
    const origin=req.get('origin');if((env.NODE_ENV==='production'&&origin!==env.CLIENT_ORIGIN)||(origin&&origin!==env.CLIENT_ORIGIN))return fail(res,403,'ORIGIN_NOT_ALLOWED','This request could not be accepted.');
    const parsed=accusationSchema.safeParse(req.body);if(!parsed.success)return fail(res,400,'VALIDATION_ERROR','Choose one suspect and up to three unique evidence items.');
    const record=await getOwnedCase(req.params.caseId,req.sessionId);if(!record)return fail(res,404,'CASE_NOT_FOUND','That case could not be found.');
    if(record.status==='completed')return res.json({status:'completed',result:resultDto(record)});
    if(record.status!=='ready')return fail(res,409,'CASE_NOT_READY','This case is not ready for an accusation.');
    const publicCase=record.publicCase as any;const validSuspects=new Set(publicCase.suspects.map((item:any)=>item.id));const validEvidence=new Set(publicCase.evidence.map((item:any)=>item.id));
    if(!validSuspects.has(parsed.data.suspectId)||parsed.data.selectedEvidenceIds.some((id)=>!validEvidence.has(id)))return fail(res,400,'VALIDATION_ERROR','One or more selections are not part of this case.');
    const updated=await MysteryCaseModel.findOneAndUpdate({_id:record._id,status:'ready'},{$set:{status:'completed',accusation:{...parsed.data,submittedAt:new Date()}}},{new:true}).select('+solution +privateAnnotations');
    if(!updated){const latest=await getOwnedCase(req.params.caseId,req.sessionId);if(latest?.status==='completed')return res.json({status:'completed',result:resultDto(latest)});return fail(res,409,'ALREADY_COMPLETED','This case has already been closed.');}
    return res.json({status:'completed',result:resultDto(updated)});
  }catch(error){next(error);}
});
apiRouter.get('/cases/:caseId/result',async(req,res,next)=>{
  try{
    const record=await getOwnedCase(req.params.caseId,req.sessionId);if(!record)return fail(res,404,'CASE_NOT_FOUND','That case could not be found.');
    if(record.status!=='completed'||!record.accusation)return fail(res,409,'CASE_NOT_READY','Submit your final accusation to view the solution.');
    return res.json(resultDto(record));
  }catch(error){next(error);}
});
apiRouter.get('/cases/:caseId/media/:evidenceId',async(req,res,next)=>{
  try{
    const record=await getOwnedCase(req.params.caseId,req.sessionId);if(!record)return fail(res,404,'CASE_NOT_FOUND','That case could not be found.');
    const asset=(record.mediaAssets as any[]).find((entry)=>entry.evidenceId===req.params.evidenceId&&entry.state==='ready');
    if(!asset)return fail(res,404,'MEDIA_NOT_FOUND','That case artifact is unavailable.');
    const root=mediaRoot;const file=resolve(asset.storagePath);const rel=relative(root,file);
    if(rel.startsWith(`..${sep}`)||rel==='..'||rel.startsWith(sep))return fail(res,404,'MEDIA_NOT_FOUND','That case artifact is unavailable.');
    res.setHeader('Content-Type',asset.mimeType);res.setHeader('Cache-Control','private, max-age=3600');
    return res.sendFile(file,(error)=>{if(error&&!res.headersSent)fail(res,404,'MEDIA_NOT_FOUND','That case artifact is unavailable.');});
  }catch(error){next(error);}
});
