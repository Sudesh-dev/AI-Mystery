import { z } from 'zod';

export const evidenceTypes = ['chat','image','cctv','document'] as const;
export const createCaseSchema = z.object({
  scenario: z.string().trim().min(80).max(5000), title: z.string().trim().min(3).max(80).optional(),
  setting: z.string().trim().max(120).optional(), difficulty: z.enum(['easy','medium','hard']).default('medium'),
  tone: z.enum(['cozy','classic_detective','thriller','lighthearted']).default('classic_detective'),
  evidenceTypes: z.array(z.enum(evidenceTypes)).max(4).default(['chat','image','cctv','document']),
  contentNote: z.string().trim().max(300).optional(),
});
export const accusationSchema = z.object({ suspectId: z.string().min(1).max(80), selectedEvidenceIds: z.array(z.string().min(1).max(80)).max(3).default([]).refine((ids)=>new Set(ids).size===ids.length,'Evidence selections must be unique.'), reasoning: z.string().trim().max(500).optional() });
export const caseContentSchema = z.object({
  title: z.string().min(3).max(80), difficulty: z.enum(['easy','medium','hard']), tone: z.string(), caseBrief: z.string().min(40).max(800), incident: z.string().min(20).max(400),
  suspects: z.array(z.object({id:z.string(),name:z.string(),role:z.string(),profile:z.string(),claimedAlibi:z.string().nullable().optional()})).min(3).max(5),
  timeline: z.array(z.object({time:z.string(),event:z.string(),certainty:z.enum(['confirmed','claimed'])})).min(5).max(20),
  evidence: z.array(z.object({id:z.string(),type:z.enum(evidenceTypes),title:z.string(),sourceLabel:z.string(),displayTimestamp:z.string(),description:z.string(),publicContent:z.record(z.string(),z.unknown()),classification:z.enum(['decisive_clue','supporting_clue','red_herring','neutral']),rationale:z.string()})).min(6).max(20),
  solution: z.object({culpritSuspectId:z.string(),motive:z.string(),explanation:z.string(),reconstructionSteps:z.array(z.object({time:z.string(),event:z.string()})).min(5).max(20)}),
}).superRefine((data,ctx)=>{
  const suspectIds=data.suspects.map((s)=>s.id);const evidenceIds=data.evidence.map((e)=>e.id);
  if(new Set(suspectIds).size!==suspectIds.length)ctx.addIssue({code:'custom',message:'Duplicate suspect IDs'});
  if(new Set(evidenceIds).size!==evidenceIds.length)ctx.addIssue({code:'custom',message:'Duplicate evidence IDs'});
  if(!suspectIds.includes(data.solution.culpritSuspectId))ctx.addIssue({code:'custom',message:'Culprit does not exist'});
  if(data.evidence.filter((e)=>e.classification==='decisive_clue'||e.classification==='supporting_clue').length<3)ctx.addIssue({code:'custom',message:'Insufficient clue evidence'});
  if(data.evidence.filter((e)=>e.classification==='red_herring').length<2)ctx.addIssue({code:'custom',message:'Insufficient red herrings'});
  for(const item of data.evidence){
    const content=item.publicContent;
    if(item.type==='chat'&&(!Array.isArray(content.messages)||content.messages.length<2||content.messages.length>20||content.messages.some((message)=>!message||typeof message!=='object'||typeof (message as any).sender!=='string'||typeof (message as any).time!=='string'||typeof (message as any).body!=='string'))){ctx.addIssue({code:'custom',message:`Malformed chat evidence ${item.id}`});}
    if(item.type==='image'&&typeof content.altText!=='string')ctx.addIssue({code:'custom',message:`Image alt text missing for ${item.id}`});
    if(item.type==='cctv'&&typeof content.transcript!=='string')ctx.addIssue({code:'custom',message:`CCTV transcript missing for ${item.id}`});
    if(item.type==='document'&&typeof content.text!=='string')ctx.addIssue({code:'custom',message:`Document text missing for ${item.id}`});
  }
});
export type CaseContent = z.infer<typeof caseContentSchema>;
