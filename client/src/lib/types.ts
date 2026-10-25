export type EvidenceType = 'chat' | 'image' | 'cctv' | 'document';
export type Evidence = {
  id: string; type: EvidenceType; title: string; sourceLabel: string; displayTimestamp: string;
  description: string; publicContent: { text?: string; messages?: { sender: string; time: string; body: string }[]; mediaState?: string; mediaUrl?: string; altText?: string; transcript?: string };
};
export type Suspect = { id: string; name: string; role: string; profile: string; claimedAlibi?: string | null };
export type MysteryCase = {
  caseId: string; status: 'generating' | 'ready' | 'completed' | 'failed'; generationStage?: string; slowGeneration?: boolean; demoMode?: boolean;
  publicCase?: { title: string; difficulty: string; tone: string; caseBrief: string; incident: string; suspects: Suspect[]; timeline: { time: string; event: string; certainty: 'confirmed' | 'claimed' }[]; evidence: Evidence[] };
};
export type MysteryResult = {
  outcome: 'correct' | 'incorrect'; score: number; scoreBreakdown: { culprit: number; evidence: number };
  accusation: { suspectId: string; selectedEvidenceIds: string[]; reasoning?: string };
  solution: { culpritSuspectId: string; motive: string; explanation: string; reconstructionSteps: { time: string; event: string }[]; decisiveEvidenceIds: string[]; supportingEvidenceIds: string[]; redHerringEvidenceIds: string[]; evidenceFindings: { evidenceId: string; classification: string; rationale: string }[] };
};
export type GenerationHistoryEntry = {
  caseId: string;
  title: string;
  status: 'generating' | 'succeeded' | 'failed';
  caseStatus: 'generating' | 'ready' | 'completed' | 'failed';
  stage?: string;
  demoMode?: boolean;
  fallbackReason?: string;
  createdAt: string;
  updatedAt: string;
  details: { scenario: string; setting: string; difficulty: string; tone: string; evidenceTypes: string[]; contentNote: string };
  failure?: { code: string; message: string };
  summary?: { caseBrief: string; incident: string; suspectCount: number; evidenceCount: number };
};
