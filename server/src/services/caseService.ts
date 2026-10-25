import { randomUUID } from 'node:crypto';
import { MysteryCaseModel } from '../models/MysteryCase.js';
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
export async function createCase(ownerSessionId:string,input:Record<string,unknown>){
  const publicId=randomUUID();const expiresAt=new Date(Date.now()+env.CASE_TTL_DAYS*86400000);
  const record=await MysteryCaseModel.create({publicId,ownerSessionId,status:'generating',generationStage:'blueprint',input,expiresAt});
  void runGeneration(publicId,input as Parameters<typeof generateCase>[0]);
  return {record,publicId};
}
async function runGeneration(publicId:string,input:Parameters<typeof generateCase>[0]){
  try{
    let timeout:ReturnType<typeof setTimeout>|undefined;
    const content=await Promise.race([generateCase(input,async(stage)=>{await MysteryCaseModel.updateOne({publicId},{$set:{generationStage:stage}});}),new Promise<never>((_resolve,reject)=>{timeout=setTimeout(()=>reject(new Error('Generation timeout')),env.GENERATION_TIMEOUT_MS);})]).finally(()=>{if(timeout)clearTimeout(timeout);});
    const mediaAssets:any[]=[];
    const wantsImage=env.ENABLE_IMAGE_GENERATION==='true'&&input.evidenceTypes.includes('image');
    const wantsVideo=env.ENABLE_VIDEO_GENERATION==='true'&&input.evidenceTypes.includes('cctv');
    if(wantsImage||wantsVideo){
      await MysteryCaseModel.updateOne({publicId},{$set:{generationStage:'media'}});
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
    const privateAnnotations=content.evidence.map((item)=>({id:item.id,classification:item.classification,rationale:item.rationale}));
    const solution={...content.solution,decisiveEvidenceIds:content.evidence.filter((item)=>item.classification==='decisive_clue').map((item)=>item.id),supportingEvidenceIds:content.evidence.filter((item)=>item.classification==='supporting_clue').map((item)=>item.id),redHerringEvidenceIds:content.evidence.filter((item)=>item.classification==='red_herring').map((item)=>item.id)};
    await MysteryCaseModel.updateOne({publicId},{$set:{publicCase:publicCaseDto(content),solution,privateAnnotations,mediaAssets,status:'ready',generationStage:'complete'}});
  }catch(error){
    const generationError=error instanceof GenerationFailure?error:null;
    const code=generationError?.safeCode||(error instanceof Error&&error.message==='Generation timeout'?'GENERATION_TIMEOUT':'GENERATION_FAILED');
    console.error(JSON.stringify({event:'case_generation_failed',publicId,stage:generationError?.stage||'generation',code,...(generationError?.providerStatus?{providerStatus:generationError.providerStatus}:{}),...(generationError?.diagnostics?{diagnostics:generationError.diagnostics}:{})}));
    await MysteryCaseModel.updateOne({publicId},{$set:{status:'failed',generationStage:'failed',failureCode:code}});
  }
}
export async function getOwnedCase(publicId:string,ownerSessionId:string){return MysteryCaseModel.findOne({publicId,ownerSessionId}).select('+solution +privateAnnotations');}
export function resultDto(record:any){
  const solution=record.solution;const selected:string[]=record.accusation.selectedEvidenceIds||[];
  const relevant=new Set<string>([...solution.decisiveEvidenceIds,...solution.supportingEvidenceIds]);
  const evidenceScore=Math.min(30,selected.filter((id)=>relevant.has(id)).length*10);const culpritScore=record.accusation.suspectId===solution.culpritSuspectId?70:0;
  return {outcome:culpritScore?'correct':'incorrect',score:culpritScore+evidenceScore,scoreBreakdown:{culprit:culpritScore,evidence:evidenceScore},accusation:{suspectId:record.accusation.suspectId,selectedEvidenceIds:selected,reasoning:record.accusation.reasoning},solution:{culpritSuspectId:solution.culpritSuspectId,motive:solution.motive,explanation:solution.explanation,reconstructionSteps:solution.reconstructionSteps,decisiveEvidenceIds:solution.decisiveEvidenceIds,supportingEvidenceIds:solution.supportingEvidenceIds,redHerringEvidenceIds:solution.redHerringEvidenceIds,evidenceFindings:(record.privateAnnotations||[]).map((item:any)=>({evidenceId:item.id,classification:item.classification,rationale:item.rationale}))}};
}
