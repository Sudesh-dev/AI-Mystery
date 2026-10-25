import { randomUUID } from 'node:crypto';
import { MysteryCaseModel } from '../models/MysteryCase.js';
import { demoCase } from '../domain/fixture.js';
import { generateCase, GenerationFailure } from '../domain/generate.js';
import type { CaseContent } from '../domain/schemas.js';
import { env } from '../config/env.js';
import { GeminiMediaProvider } from './media/provider.js';
import { saveAsset } from './media/storage.js';

export function publicCaseDto(value:CaseContent){
  return {title:value.title,difficulty:value.difficulty,tone:value.tone,caseBrief:value.caseBrief,incident:value.incident,
    suspects:value.suspects.map(({id,name,role,profile,claimedAlibi})=>({id,name,role,profile,claimedAlibi})),
    timeline:value.timeline.map(({time,event,certainty})=>({time,event,certainty})),
    evidence:value.evidence.map(({id,type,title,sourceLabel,displayTimestamp,description,publicContent})=>{
      const safeContent=type==='chat'?{messages:Array.isArray(publicContent.messages)?publicContent.messages.map((message:any)=>({sender:message.sender,time:message.time,body:message.body})):[]}:
        type==='image'?{altText:publicContent.altText,mediaState:publicContent.mediaState==='ready'?'ready':'fallback',...(typeof publicContent.mediaUrl==='string'?{mediaUrl:publicContent.mediaUrl}:{})}:
        type==='cctv'?{transcript:publicContent.transcript,mediaState:publicContent.mediaState==='ready'?'ready':'fallback',...(typeof publicContent.mediaUrl==='string'?{mediaUrl:publicContent.mediaUrl}:{})}:
        {text:publicContent.text};
      return {id,type,title,sourceLabel,displayTimestamp,description,publicContent:safeContent};
    }),
  };
}
export function caseHistoryDto(record:any){
  const input=record.input&&typeof record.input==='object'?record.input as Record<string,unknown>:{};
  const publicCase=record.publicCase&&typeof record.publicCase==='object'?record.publicCase as Record<string,any>:null;
  const scenario=typeof input.scenario==='string'?input.scenario:'';
  const fallbackTitle=scenario.split(/[.!?]/,1)[0]?.trim().slice(0,80)||'Untitled case';
  const title=typeof publicCase?.title==='string'?publicCase.title:typeof input.title==='string'&&input.title.trim()?input.title.trim():fallbackTitle;
  const status=record.status==='failed'?'failed':record.status==='generating'?'generating':'succeeded';
  return {
    caseId:record.publicId,title,status,caseStatus:record.status,
    stage:record.status==='failed'?(record.failureStage||undefined):record.generationStage,
    createdAt:record.createdAt,updatedAt:record.updatedAt,
    details:{scenario,setting:typeof input.setting==='string'?input.setting:'',difficulty:typeof input.difficulty==='string'?input.difficulty:'medium',tone:typeof input.tone==='string'?input.tone:'classic_detective',evidenceTypes:Array.isArray(input.evidenceTypes)?input.evidenceTypes.filter((item):item is string=>typeof item==='string'):[],contentNote:typeof input.contentNote==='string'?input.contentNote:''},
    demoMode:Boolean(record.demoMode),
    ...(typeof record.fallbackReason==='string'?{fallbackReason:record.fallbackReason}:{}),
    ...(status==='failed'?{failure:{code:typeof record.failureCode==='string'?record.failureCode:'GENERATION_FAILED',message:'This case could not be prepared. Try creating a new mystery.'}}:{}),
    ...(publicCase?{summary:{caseBrief:typeof publicCase.caseBrief==='string'?publicCase.caseBrief:'',incident:typeof publicCase.incident==='string'?publicCase.incident:'',suspectCount:Array.isArray(publicCase.suspects)?publicCase.suspects.length:0,evidenceCount:Array.isArray(publicCase.evidence)?publicCase.evidence.length:0}}:{}),
  };
}
export async function createCase(ownerSessionId:string,input:Record<string,unknown>){
  const publicId=randomUUID();const expiresAt=new Date(Date.now()+env.CASE_TTL_DAYS*86400000);
  const record=await MysteryCaseModel.create({publicId,ownerSessionId,status:'generating',generationStage:'blueprint',input,expiresAt});
  void runGeneration(publicId,input as Parameters<typeof generateCase>[0]);
  return {record,publicId};
}
function readyCaseUpdate(content:CaseContent,mediaAssets:any[]=[],demoMode=false,fallbackReason:string|null=null){
  const privateAnnotations=content.evidence.map((item)=>({id:item.id,classification:item.classification,rationale:item.rationale}));
  const solution={...content.solution,decisiveEvidenceIds:content.evidence.filter((item)=>item.classification==='decisive_clue').map((item)=>item.id),supportingEvidenceIds:content.evidence.filter((item)=>item.classification==='supporting_clue').map((item)=>item.id),redHerringEvidenceIds:content.evidence.filter((item)=>item.classification==='red_herring').map((item)=>item.id)};
  return {publicCase:publicCaseDto(content),solution,privateAnnotations,mediaAssets,status:'ready',generationStage:'complete',slowGeneration:false,demoMode,fallbackReason};
}
export async function useSampleFallback(publicId:string,ownerSessionId:string){
  const record:any=await MysteryCaseModel.findOne({publicId,ownerSessionId}).select('status input').lean();
  if(!record)return null;
  if(record.status!=='generating')return {status:record.status};
  const input=record.input as Parameters<typeof generateCase>[0];
  const content=demoCase(input);
  const updated=await MysteryCaseModel.updateOne({publicId,ownerSessionId,status:'generating'},{$set:readyCaseUpdate(content,[],true,'PLAYER_SELECTED_FALLBACK')});
  if(updated.modifiedCount)return {status:'ready'};
  const latest:any=await MysteryCaseModel.findOne({publicId,ownerSessionId}).select('status').lean();
  return latest?{status:latest.status}:null;
}
async function runGeneration(publicId:string,input:Parameters<typeof generateCase>[0]){
  try{
    let timeout:ReturnType<typeof setTimeout>|undefined;
    let slowTimer:ReturnType<typeof setTimeout>|undefined;
    let currentStage:'blueprint'|'evidence'='blueprint';
    let usedFallback=!env.GEMINI_API_KEY||!env.GEMINI_QUICK_TEXT_MODEL;
    let fallbackReason:string|null=usedFallback?'GEMINI_CONFIGURATION_MISSING':null;
    let content:CaseContent;
    const generation=generateCase(input,async(stage)=>{currentStage=stage;await MysteryCaseModel.updateOne({publicId,status:'generating'},{$set:{generationStage:stage}});});
    try{
      const result=await Promise.race([generation,new Promise<never>((_resolve,reject)=>{slowTimer=setTimeout(()=>{void MysteryCaseModel.updateOne({publicId,status:'generating'},{$set:{slowGeneration:true}}).catch(()=>undefined);},60000);timeout=setTimeout(()=>reject(new GenerationFailure(currentStage,'GENERATION_TIMEOUT')),env.GENERATION_TIMEOUT_MS);})]);
      content=result;
    }catch(error){
      if(error instanceof GenerationFailure){
        usedFallback=true;fallbackReason=error.safeCode;content=demoCase(input);
        console.warn(JSON.stringify({event:'case_generation_fallback',publicId,stage:error.stage,reason:error.safeCode}));
      }else throw error;
    }finally{if(timeout)clearTimeout(timeout);if(slowTimer)clearTimeout(slowTimer);}
    const mediaAssets:any[]=[];
    const wantsImage=!usedFallback&&env.ENABLE_IMAGE_GENERATION==='true'&&input.evidenceTypes.includes('image');
    const wantsVideo=!usedFallback&&env.ENABLE_VIDEO_GENERATION==='true'&&input.evidenceTypes.includes('cctv');
    if(wantsImage||wantsVideo){
      await MysteryCaseModel.updateOne({publicId,status:'generating'},{$set:{generationStage:'media'}});
      let provider:GeminiMediaProvider|null=null;try{provider=new GeminiMediaProvider();}catch{console.error(JSON.stringify({event:'media_fallback',caseId:publicId,code:'MEDIA_PROVIDER_UNAVAILABLE'}));}
      for(const item of content.evidence){
        if((item.type==='image'&&wantsImage)||(item.type==='cctv'&&wantsVideo)){
          try{
            if(!provider)throw new Error('Media provider unavailable');
            const asset=item.type==='image'?await provider.generateImage(item.description):await provider.generateVideo(item.description);
            mediaAssets.push(await saveAsset(publicId,item.id,asset));
            item.publicContent={...item.publicContent,mediaState:'ready',mediaUrl:`/api/v1/cases/${publicId}/media/${item.id}`};
          }catch{
            console.error(JSON.stringify({event:'media_fallback',caseId:publicId,evidenceId:item.id,code:'MEDIA_GENERATION_FAILED'}));
            item.publicContent={...item.publicContent,mediaState:'fallback'};
          }
        }
      }
    }
    await MysteryCaseModel.updateOne({publicId,status:'generating'},{$set:readyCaseUpdate(content,mediaAssets,usedFallback,fallbackReason)});
  }catch(error){
    const generationError=error instanceof GenerationFailure?error:null;
    const code=generationError?.safeCode||'GENERATION_FAILED';
    const updated=await MysteryCaseModel.updateOne({publicId,status:'generating'},{$set:{status:'failed',generationStage:'failed',failureStage:generationError?.stage||'generation',failureCode:code}});
    if(updated.modifiedCount)console.error(JSON.stringify({event:'case_generation_failed',publicId,stage:generationError?.stage||'generation',code,...(generationError?.providerStatus?{providerStatus:generationError.providerStatus}:{}),...(generationError?.diagnostics?{diagnostics:generationError.diagnostics}:{})}));
  }
}
export async function getOwnedCase(publicId:string,ownerSessionId:string){return MysteryCaseModel.findOne({publicId,ownerSessionId}).select('+solution +privateAnnotations');}
export function resultDto(record:any){
  const solution=record.solution;const selected:string[]=record.accusation.selectedEvidenceIds||[];
  const relevant=new Set<string>([...solution.decisiveEvidenceIds,...solution.supportingEvidenceIds]);
  const evidenceScore=Math.min(30,selected.filter((id)=>relevant.has(id)).length*10);const culpritScore=record.accusation.suspectId===solution.culpritSuspectId?70:0;
  return {outcome:culpritScore?'correct':'incorrect',score:culpritScore+evidenceScore,scoreBreakdown:{culprit:culpritScore,evidence:evidenceScore},accusation:{suspectId:record.accusation.suspectId,selectedEvidenceIds:selected,reasoning:record.accusation.reasoning},solution:{culpritSuspectId:solution.culpritSuspectId,motive:solution.motive,explanation:solution.explanation,reconstructionSteps:solution.reconstructionSteps,decisiveEvidenceIds:solution.decisiveEvidenceIds,supportingEvidenceIds:solution.supportingEvidenceIds,redHerringEvidenceIds:solution.redHerringEvidenceIds,evidenceFindings:(record.privateAnnotations||[]).map((item:any)=>({evidenceId:item.id,classification:item.classification,rationale:item.rationale}))}};
}
