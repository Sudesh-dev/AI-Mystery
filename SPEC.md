
I need you to make a Spec sheet for spec driven development

Project Overview:

Al Mystery room is the project here the user will give a small scenario or story based on which the website will create a Mystery challenge where the Al on the backend will come up with a fake investigation where there will be a culprit and the user will then be given a set of proofs like whatsapp messges, images, cam recordings (all of these will be created by Al).

The user will then have to select a culprit.

TECH Stack:

MERN Stack

Al:

Gemini

Crete a spec shee containing all the details and it will be the Single source of truth for codex to build a website
…
Done! I've created a complete, Codex-ready specification for AI Mystery Room. The goal is to make SPEC.md the single source of truth so Codex can build the website without repeatedly guessing your requirements.

1. Complete specification — SPEC.md

The full 6,500-word product and engineering blueprint.

Download SPEC.md

2. Codex instructions — AGENTS.md

Directs Codex to follow the specification, implement in phases, and preserve the security requirements.

Download AGENTS.md

3. Complete specification package

Both files packaged together, ready to extract into your project repository.

Download AI Mystery Room Spec Package (.zip)

What's included in the spec?
Area

Defined requirements

Product & UI

Landing page, scenario builder, investigation room, evidence viewers and result page

AI generation

Gemini prompts, structured output, validation, mystery consistency and retries

Evidence

Fictional chat conversations, AI-generated images, CCTV clips and documents

Backend

Express APIs, MongoDB schemas, anonymous sessions and generation workflow

Game mechanics

Suspect selection, evidence selection, final accusation and deterministic scoring

Security

Hidden culprit protection, API key handling, ownership checks, rate limits and input validation

Testing

Unit tests, API tests, end-to-end flows and acceptance criteria

Development plan

Five implementation phases, from the working foundation to media generation and polish

I've also specified an important requirement: the solution must remain secret until the player submits their final accusation. The backend stores the culprit and calculates the score; the frontend must never receive the hidden answer prematurely.

The media integration is designed around Gemini's structured-output, image-generation and video-generation capabilities, with configurable model IDs and clearly labeled fallbacks when media generation is unavailable. 

Google AI for Developers
+2

How to use it with Codex
Extract the ZIP and copy SPEC.md and AGENTS.md into the root of your project repository.

Open the repository in Codex.

Start with this prompt:

Read AGENTS.md and the complete SPEC.md before making changes. SPEC.md is the single source of truth for this project.

First, inspect the repository and compare its current state against the specification. Then implement Phase 1 from Section 19 only.

Follow the specified MERN + TypeScript + Gemini architecture. Do not skip requirements, expose the hidden mystery solution to the frontend, or implement unrelated features. Run the relevant tests, report what was completed, and identify any remaining work before proceeding to Phase 2.

My recommendation: Build and test the complete investigation loop with a fixed sample mystery first, then integrate Gemini text generation, followed by AI-generated images and CCTV footage. That sequence lets you verify the actual game mechanics before introducing the additional complexity and cost of media generation.


SPEC.md
Document

AGENTS.md
Document
AI Mystery Room — Product & Engineering Specification
Status: Canonical specification for v1 implementation
Audience: Codex, developers, reviewers, and testers
Last updated: 2026-10-25
Specification authority: This file is the single source of truth for product behavior and implementation requirements. If implementation details conflict with this file, update the implementation to match this file. If a real requirement must change, edit this file first.

1. Product definition
1.1 What we are building
AI Mystery Room is a browser-based, single-player mystery-investigation game. A user supplies a short fictional scenario or story. The application uses Google's Gemini API to turn it into a solvable mystery case. The user investigates a fictional incident by reviewing a cast of suspects and a collection of synthetic evidence—such as chat conversations, images, documents, and CCTV-style footage—then selects the culprit and submits a final accusation.

The experience should feel like entering a digital investigation room: cinematic and intriguing, but clear, responsive, and easy to use. The mystery must be logically solvable from the evidence shown to the player. It must not depend on guessing what the model had in mind.

1.2 Product promise
“Give us a story. Investigate the evidence. Find the truth.”

1.3 Core loop
The user enters a scenario and chooses a few optional settings.
The backend creates a fictional case plan with one fixed culprit, a motive, a timeline, suspects, clues, and red herrings.
The backend generates evidence that follows that plan.
The user inspects the case brief, suspects, timeline, and evidence room.
The user selects one culprit, cites up to three evidence items, optionally explains their reasoning, and submits a final accusation.
The application reveals the canonical solution, the key clue chain, the motive, the timeline reconstruction, and the result score.
1.4 Target user
A casual player who enjoys detective stories, escape rooms, logic puzzles, whodunits, and interactive fiction. The user should not need technical knowledge or an account to play.

1.5 Non-goals for v1
Real criminal investigations, law-enforcement use, or factual allegations about real people.
Multiplayer collaboration, public case sharing, leaderboards, paid features, subscriptions, or social feeds.
User-uploaded photos, recordings, or private chat exports.
A chatbot that can reveal clues on demand before the final accusation.
Open-ended AI conversation as the main game mechanic.
Guaranteed photorealistic generated video for every case regardless of model availability, quota, cost, or latency.
2. Product rules and invariants
These rules are mandatory and should be encoded in backend validation and automated tests wherever practical.

Fiction only. Every case and every evidence item must be presented as fictional, synthetic content. Never present generated evidence as real evidence or make real-world accusations.
Exactly one culprit. Every ready case has 3–5 suspects and exactly one canonical culprit.
Solvable by evidence. The case has at least three meaningful clue-bearing evidence items, at least two red herrings or misleading-but-explainable details, and a coherent timeline. No required deduction may rely on information withheld from the player.
One source of truth for the mystery. Generate a hidden case blueprint first. All evidence must derive from this blueprint. Do not independently ask the model to invent each evidence item without providing the same canonical facts.
No solution leakage. Before a final accusation, public API responses must never include the culprit ID, motive, hidden clue labels, answer rationale, solution-only timeline notes, or private generation prompts.
Server decides correctness. The browser may submit a suspect ID and selected evidence IDs, but the backend calculates the result using stored canonical data.
Validate model output. Do not trust model output solely because it is valid JSON. Validate structure, referential integrity, clue requirements, length limits, chronology, and semantic consistency before making a case playable.
Graceful media fallback. A missing or failed image/video generation capability must not make a case impossible to solve or prevent a textual evidence-only case from opening. Clearly label fallback visuals as simulations/placeholders, not real footage.
Generated media only. Do not source, scrape, or reuse real private conversations, surveillance recordings, or identifiable real-person imagery as case evidence.
No graphic content. Keep cases suitable for a broad teen/adult audience. No graphic gore, explicit sexual content, or instructional detail about committing crimes.
No answer in UI copy or telemetry. Do not put the culprit or secret solution fields into browser-visible HTML, client logs, analytics events, network errors, or default API error messages before the accusation.
MERN + Gemini. The product uses MongoDB, Express, React, and Node.js, with Gemini as the primary generative AI provider. No Python backend, no SQL database, and no second AI provider are required for v1.
3. Scope and required functionality
3.1 Required v1 capabilities
Landing page and clear “Create a Mystery” action.
Scenario builder form with input validation and basic configuration.
Asynchronous case generation with visible progress states.
Case room with a brief, suspects, evidence categories, and timeline.
Fictional chat evidence displayed as readable chat UI, not merely a screenshot.
Image evidence displayed in an accessible image viewer with captions and AI-generated/synthetic labeling.
CCTV evidence presented as a video player when generated video is available, with transcript/description and timestamps. If no video asset is available, render a CCTV simulation using generated still frames/keyframes or a clearly labelled simulated timeline.
Document/note evidence as structured text cards.
Evidence selection: the player can mark up to three evidence items as support for their final accusation.
Final accusation form: select one suspect, optionally write reasoning, and submit once.
Result screen with correct/incorrect outcome, fixed solution explanation, culprit, motive, decisive clues, red-herring explanations, timeline reconstruction, and score.
Retry by starting a new case.
Anonymous sessions; no registration/login in v1.
Responsive desktop, tablet, and mobile layouts.
Loading, empty, error, and recovery states.
Tests for solution secrecy, case validation, scoring, session ownership, and primary user flow.
3.2 Configurable capabilities
Gemini-generated still images for image evidence and, where useful, fictional suspect portraits.
Gemini-generated short video clips for CCTV evidence.
AI-assisted post-generation consistency review.
Persistent media object storage in a production storage provider.
The image and video adapter implementations are part of v1, not future TODOs. Actual generation can be disabled in a local development environment to avoid unexpected charges, but a full-media deployment must configure supported Gemini image/video models and enable the relevant flags. Adapters must be isolated behind server-side interfaces. The app must never require a browser-side Gemini key or direct browser-to-Gemini calls. Fallback simulation is for disabled features or provider failures; it must be clearly labeled and must not be represented as an actual generated video.

4. User journeys
4.1 Create a mystery
The landing page introduces the experience and states that cases and evidence are AI-generated fiction.
The user selects Create a Mystery.
The scenario builder asks for the core story. Optional fields provide title, setting, tone, difficulty, and evidence preferences.
On submit, client validation runs and the API creates a case in generating state.
The user sees a progress screen with stage labels such as “Building the case”, “Connecting the clues”, “Preparing evidence”, and “Checking consistency”. Progress labels are informative, not claims of exact percentage completion.
The client polls the case status endpoint at a reasonable interval with backoff. On ready, it navigates to the case room. On failed, it presents a useful retry action without revealing internal secrets.
4.2 Investigate a case
The case room has a persistent header with case title, difficulty, and a visible fictional-case label. The content is organized into:

Case Brief: incident summary, location, date/time within the fictional world, goal, and what is known.
Suspects: 3–5 cards. Each displays name, role/relationship, short profile, and an initial stated alibi where relevant. No card exposes hidden fields.
Evidence Room: filterable evidence list with categories All, Chats, Images, CCTV, and Documents. Evidence is open to the player at the start; do not lock a decisive clue behind an artificial paywall or random unlock.
Timeline: a chronological view of known events. Distinguish confirmed timestamps from reported/claimed times.
Evidence detail: opening an item shows source, in-world timestamp, content/media, caption or transcript, and any authenticity/uncertainty note the fictional artifact would naturally carry.
Evidence selection: a control on each item marks/unmarks it as an item the player wants to cite. Show a count such as “2 of 3 selected”. Selection is not a reveal action.
Final accusation: fixed call-to-action opens a confirmation panel. User chooses one suspect, optionally enters reasoning up to 500 characters, reviews selected evidence, then confirms the irreversible submission.
On mobile, use tabs or stacked accordions to avoid a tiny multi-column layout. The final accusation action must remain easy to find without obscuring evidence.

4.3 Submit the accusation and view the solution
The user must select exactly one valid suspect from the case.
The user may cite zero to three evidence item IDs. The UI should encourage selecting evidence but should not block a player who wants to make a guess.
Reasoning is optional and capped at 500 characters.
The backend stores the final accusation and transitions the case to completed.
A case can be accused only once. Repeated requests must return the existing result rather than recalculate or permit a second attempt.
After submission, display whether the culprit selection was correct, the canonical culprit, motive, a step-by-step reconstruction, the decisive clues, the red herrings, and how the submitted evidence helped or failed to support the conclusion.
Provide Start another mystery. Do not reveal a solution before the accusation through a hint endpoint, public case JSON, client source, media URL, or error payload.
5. UX, visual direction, and accessibility
5.1 Visual language
Use a polished investigative control-room aesthetic: deep charcoal/navy backgrounds, restrained amber or warm-red accents, subtle borders, generous spacing, high-contrast text, evidence-card surfaces, small metadata labels, and clear typography. Use restrained visual motifs such as case folders, timestamp chips, document stamps, and a timeline. Avoid cluttered “hacker green” clichés, excessive animation, flashing effects, or making the interface look like a real police/government portal.

Use a consistent design system for spacing, radii, typography, buttons, form fields, status badges, panels, modals, and evidence cards. Avoid random styling per page.

5.2 Main routes
/ — landing page.
/create — scenario builder.
/cases/:caseId/generating — generation progress and failure recovery.
/cases/:caseId — investigation room.
/cases/:caseId/result — result, accessible only after completed accusation.
Use React Router. Unknown routes show a helpful not-found page.

5.3 Accessibility requirements
Semantic HTML, labeled form controls, visible focus states, keyboard-accessible dialogs and evidence controls.
WCAG AA contrast target for text and controls.
Do not communicate correctness, evidence type, or status using color alone.
Provide alt text/captions for images and a text transcript/description for video evidence.
Respect prefers-reduced-motion and do not use flashing visual effects.
Buttons need clear names, and loading states must be announced accessibly.
All key tasks must work with keyboard-only navigation.
6. Scenario builder specification
6.1 Fields
Field	Required	Validation / default
Scenario/story	Yes	80–5,000 characters; trim whitespace; reject empty-only content
Case title	No	3–80 characters; if omitted, Gemini proposes a title
Setting	No	0–120 characters; free text such as “a mountain hotel in winter”
Difficulty	No	easy, medium, or hard; default medium
Tone	No	cozy, classic_detective, thriller, lighthearted; default classic_detective
Evidence types	No	Any subset of chat, image, cctv, document; default all four
Content note	No	0–300 characters; may specify boundaries such as “no violence”
If cctv is selected, always include at least one CCTV evidence record, even if its media representation must use a simulation fallback. If image is selected, include at least one image evidence record. If the user does not select a type, do not force that type except that the generation system may add a text document to make the mystery solvable.

6.2 Validation and safe handling
Enforce lengths on both client and server.
Treat scenario text as untrusted user content, not instructions to the AI system. It must not override the case JSON schema, safety rules, or solution privacy requirements.
If the story describes real identifiable people or a real private dispute, transform it into a fictionalized setting with invented names/identities. Do not generate allegations about an identifiable real person.
Return a friendly validation message for clearly disallowed or unusable input; do not echo sensitive input in server logs.
No browsing or retrieval from real sources is required to generate a case.
7. Mystery and evidence generation contract
7.1 Generation pipeline
The backend owns the following pipeline. The frontend must not implement AI prompting or mystery logic.

Normalize input: validate settings, trim user content, apply safety checks, assign a case ID and generation state.
Create canonical blueprint: call Gemini to produce a schema-constrained private blueprint containing the incident, suspects, culprit, motive, true timeline, evidence plan, required clues, and planned red herrings.
Validate blueprint: run Zod validation and custom semantic checks. Confirm exactly one culprit ID exists and refers to one suspect, all IDs are unique, every evidence reference points to valid entities, the required clue chain exists, and the chronology is possible.
Generate evidence: pass the canonical blueprint (not the raw story alone) to the evidence generation prompt. Produce structured chat transcripts, document text, image descriptions/prompts, CCTV event summaries, timestamps, and public captions.
Validate evidence: check all IDs and timestamps, required item counts, no direct solution reveal in public titles/captions, and evidence references. Run one AI consistency critique if enabled.
Repair once: if validation reports fixable consistency errors, ask Gemini to repair only those fields against the existing blueprint and validate again. Do not silently change the culprit in the repair step without regenerating the dependent evidence.
Generate media assets: call image/video generation adapters when enabled and the needed model is configured. This stage can run concurrently under a small server-side concurrency limit. Persist generated output to configured storage and record the media state.
Mark ready: store the validated case and set status to ready only when required text evidence exists and each requested media type has either a real generated asset or an explicitly supported simulation fallback.
Fail safely: after retry limit, mark failed with a generic user-facing message and a server-side diagnostic code. Never expose the hidden blueprint or raw model response in the public error.
7.2 Required case shape
Every generated playable case must contain:

3–5 suspects with stable IDs.
One incident and one fixed culprit.
A clear motive and plausible opportunity.
A canonical timeline with at least 5 important events.
At least 6 evidence items in total, spanning every selected evidence type; at least 3 meaningful clue items; at least 2 red herrings or misleading claims that can be explained in the reveal.
Each important clue must support or contradict a specific hypothesis using facts visible to the player.
At least one alternative suspect must initially appear plausible.
A reveal explanation that connects the culprit, motive, opportunity, timeline, and decisive evidence.
No contradictions that make two suspects equally or more conclusively guilty than the canonical culprit.
Recommended default evidence mix when all types are selected: 2 chat threads, 1–2 image artifacts, 1 CCTV item, and 2 or more documents/notes. The count may vary when needed to maintain coherent logic, but minimum constraints must hold.

7.3 Evidence types
Each evidence item has a public representation and private analytical annotations.

Chat (chat)

Render as a fictional messaging interface made of structured messages: sender, timestamp, body, optional delivery/read indicator, and group/individual conversation metadata.
All participants are invented and use in-case suspect IDs where applicable.
Do not use real phone numbers, real account handles, or actual screenshots copied from a real service.
Do not embed clue labels or verdict text in message bodies unless it naturally belongs to the fictional chat.
Image (image)

Create a fictional still, for example an object, room, receipt, footprint, desk, doorway, or scene detail. Avoid unnecessary faces; if a person is shown, they must be fully fictional and not resemble a named real person.
Store public caption and alt text separately from internal image prompt and private clue annotations.
If generation fails, show a clearly labeled placeholder derived from the case metadata and preserve the textual observation in the evidence details.
CCTV (cctv)

Public data includes camera label, timestamp range, transcript/observation, confidence or visibility note, and media state.
Preferred asset: a short synthetic video clip from a configured Gemini video model.
Fallback: a set of synthetic keyframes or stylized CCTV simulation with timestamps and scrubber. If keyframes cannot be generated, show a generated timeline/sequence card and detailed text description.
Never describe fallback imagery as an actual recording. Apply a visible “AI-GENERATED / SIMULATED FOOTAGE” label.
Document (document)

Examples: fictional note, receipt, access log, inventory sheet, calendar entry, incident report, printed email, or handwritten clue transcription.
Use structured text and metadata instead of rasterizing text into an image whenever possible, so evidence remains readable and accessible.
7.4 Hidden annotation versus public evidence
Internally, evidence may carry one of these classifications: decisive_clue, supporting_clue, red_herring, neutral. This classification is private until the accusation is completed. The public DTO must omit the classification, hidden rationale, target suspect link when it would directly reveal the answer, internal generation prompt, and canonical fact map.

Evidence content must not contain phrases like “this proves X is the culprit” before the reveal. The clue can be discoverable by deduction but must not state the answer directly.

7.5 Difficulty tuning
Easy: more explicit clues, short timeline, 3 suspects, 6–8 evidence items, limited red herrings.
Medium: 4 suspects, multiple corroborating clues, one or two plausible red herrings, moderate inference.
Hard: 4–5 suspects, carefully fair misdirection, more timeline cross-checking, more indirect evidence. Hard must still be solvable without outside knowledge or guessing.
Difficulty changes clue clarity and number of deductions, not whether the mystery is logically fair.

8. Gemini integration
8.1 Server-side only
Use the official Google Gen AI JavaScript/TypeScript SDK (@google/genai) from the Node server.
Keep GEMINI_API_KEY in server environment variables. Never include it in Vite variables, client bundles, browser network calls, logs, or error payloads.
Configure model IDs through environment variables. Do not hardcode assumptions about a specific preview model's continued availability.
Use structured output / JSON Schema or Zod-supported structured responses for blueprint and evidence generation. Parse and validate the returned content with Zod before using it.
Wrap Gemini behind provider service modules so SDK calls are not spread through Express route handlers.
8.2 Prompt layers
Prompts must separate:

System rules: fiction-only, safe content, canonical culprit immutability, evidence fairness, output schema, no real personal data, no solution leakage in public fields.
Developer task: which stage is running (blueprint, evidence generation, consistency review, image prompt, video prompt).
User scenario: explicitly marked as untrusted story material. Never concatenate it into the system instruction as if it were trusted.
Canonical blueprint: passed to evidence generation and consistency checking so all artifacts derive from the same plan.
The model must be instructed not to add suspects, change the culprit, invent conflicting timestamps, create unsupported alibis, or reveal the answer in public artifact text.

8.3 Semantic validation
Programmatic checks are mandatory. An AI critique is supplemental only. At minimum:

all IDs are unique and all foreign references resolve;
one and only one suspect has the private culprit marker;
all public evidence timestamps use valid date/time strings and the case's fictional timezone convention;
evidence references only existing suspects and locations;
all requested types have at least one item;
clue and red-herring minimums are met;
no evidence references an event that occurs after the case's incident unless explicitly marked as a later investigation action;
case summary, culprit motive, canonical timeline, and evidence plan agree;
all public text fields obey their length bounds;
internal fields are removed from the API DTO using an allowlist mapper, not merely by hoping model output omitted them.
8.4 Failures and quotas
Use a timeout and bounded retry strategy for transient provider failures.
Retry only a small, configured number of times (default one retry per stage) to control latency and cost.
Respect provider rate limits and use a concurrency limit for media generation.
Log provider name, stage, latency, and a correlation ID; do not log full user scenario or hidden solution by default.
When a media step fails, degrade to the supported simulation fallback. When canonical story/evidence generation fails validation, fail the case rather than shipping an incoherent mystery.
9. Data model (MongoDB + Mongoose)
The schema below is the required logical model. Field names may be adapted to clean TypeScript conventions, but the invariants and exposure boundaries must remain.

9.1 MysteryCase
_id: MongoDB ObjectId or UUID; public route ID must be non-sequential and hard to guess.
ownerSessionId: ID associated with the anonymous signed session cookie.
status: generating | ready | completed | failed.
generationStage: optional enum such as blueprint | evidence | consistency | media | complete | failed.
input: { scenario, requestedTitle?, setting?, difficulty, tone, evidenceTypes[], contentNote? }.
publicCase: { title, difficulty, tone, caseBrief, incident, suspects[], timeline[], evidence[] }.
solution (private; use Mongoose select: false): { culpritSuspectId, motive, canonicalTimeline[], decisiveEvidenceIds[], supportingEvidenceIds[], redHerringEvidenceIds[], explanation, reconstructionSteps[] }.
accusation: nullable { suspectId, selectedEvidenceIds[], reasoning?, isCorrect, score, submittedAt }.
mediaAssets[]: internal references to media state and storage location. Do not make internal storage keys public.
failureCode?: safe internal diagnostic enum/string, not a raw provider response.
createdAt, updatedAt, optional expiresAt.
Add indexes for public ID lookup, owner session + creation date, and expiry. Apply a configurable retention period (default 7 days in development; production retention must be configurable and documented). Prefer a TTL index for expiry if it matches product retention needs.

9.2 Suspect
id: stable case-local ID such as suspect_01.
name: fictional display name.
role: relationship to incident/person/place.
profile: 1–3 sentence public description.
claimedAlibi: public claim or null.
visualAssetId?: optional generated portrait/placeholder reference.
Private culprit identification must exist only in solution or private case blueprint, not in public suspect properties.
9.3 EvidenceItem
id: stable case-local ID.
type: chat | image | cctv | document.
title, sourceLabel, displayTimestamp, description.
publicContent: type-specific safe content, such as messages, document text, image asset reference, or CCTV transcript.
mediaState: not_required | pending | ready | fallback | failed where relevant.
Private annotations: classification, canonical facts, target entities, explanation, internal prompt, and generation metadata. These must never be returned in public DTO before reveal.
9.4 Session and ownership
No account is required. Create a random anonymous session ID and store it in a signed, HttpOnly, SameSite=Lax cookie. Use Secure in production. Each case belongs to the session that created it. All case read, accusation, and result routes must verify session ownership. Do not use a client-supplied ownerSessionId as proof of ownership.

10. API contract
Base path: /api/v1. All request bodies must be validated with Zod. Return consistent JSON error objects and do not return stack traces.

10.1 GET /api/health
Returns a minimal health status for deployment checks. Do not expose secrets, database connection strings, provider diagnostics, or detailed infrastructure state.

10.2 POST /api/v1/cases
Creates a case generation job.

Request:

{
  "scenario": "A valuable prototype disappeared from a locked workshop after a late-night demo.",
  "title": "The Missing Prototype",
  "setting": "A small robotics lab during a rainy evening",
  "difficulty": "medium",
  "tone": "classic_detective",
  "evidenceTypes": ["chat", "image", "cctv", "document"],
  "contentNote": "Keep the mystery non-graphic."
}
Response: 202 Accepted

{
  "caseId": "opaque-case-id",
  "status": "generating",
  "generationStage": "blueprint",
  "pollAfterMs": 1500
}
The worker continues asynchronously and updates the saved case status. A session must not have more than one active generation at a time in v1. Apply server-side rate limits.

10.3 GET /api/v1/cases/:caseId
Verify the signed anonymous session owns the case.
If generating, return only { caseId, status, generationStage, pollAfterMs }.
If failed, return status and a safe retry message.
If ready, return the public case DTO and status.
If completed, return the public case DTO plus the submitted accusation state, but the full solution is returned from the result endpoint only. The frontend may link to the result screen.
10.4 POST /api/v1/cases/:caseId/accusations
Request:

{
  "suspectId": "suspect_03",
  "selectedEvidenceIds": ["evidence_02", "evidence_05"],
  "reasoning": "The timing in the access log conflicts with this suspect's claim."
}
Validation:

Case exists, belongs to session, and is ready.
suspectId exists in the case.
selectedEvidenceIds contains 0–3 unique evidence IDs that exist in the case.
reasoning is optional, trimmed, and max 500 characters.
The accusation is final and may be recorded only once.
Response: 200 OK with safe result summary, or 409 Conflict if already completed. Duplicate submissions after completion should return the existing result rather than creating a new attempt.

10.5 GET /api/v1/cases/:caseId/result
Verify ownership and completed state.
Return the solution and score only if the accusation has been submitted.
Before completion, return 403 or 409 with a generic message such as “Submit your final accusation to view the solution.” The response must not contain any solution fields.
10.6 Error shape
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please check the highlighted fields.",
    "requestId": "correlation-id"
  }
}
Use stable error codes such as VALIDATION_ERROR, CASE_NOT_FOUND, CASE_NOT_READY, ALREADY_COMPLETED, RATE_LIMITED, GENERATION_FAILED, and INTERNAL_ERROR. Public messages must be actionable but generic. Never return raw Gemini output, prompts, secrets, stack traces, or hidden blueprint content.

11. Scoring and result reveal
Use deterministic server-side scoring for v1; do not ask Gemini to decide whether a user's answer is correct.

Correct culprit: 70 points.
Each selected evidence item that belongs to decisiveEvidenceIds or supportingEvidenceIds: +10 points, up to three items / 30 points.
Incorrect culprit: 0 culprit points; selected relevant evidence can still earn up to 30 points.
Final score is capped at 100.
The UI must explain that the score measures culprit identification plus cited evidence. Do not give points for selecting red herrings. A selected evidence item should be judged by ID and private annotations, not by matching arbitrary user-submitted text.

Result screen sections:

Outcome: correct or incorrect culprit selection.
Your accusation: selected suspect, selected evidence, and optional reasoning.
The culprit and motive.
What happened: ordered timeline reconstruction.
The decisive clues: show evidence cards that support the conclusion and explain the inference.
Red herrings: explain why tempting clues were misleading but not contradictory.
Score breakdown.
Button to start a new mystery.
The solution reveal should be understandable without reading model-generated internal reasoning. It must use the stored solution and evidence mapping, not create a new answer after accusation.

12. Frontend implementation requirements
12.1 Stack
React + TypeScript.
Vite.
React Router.
Tailwind CSS (or a single consistent utility/design system; do not mix multiple styling frameworks without a clear reason).
TanStack Query for API loading/polling and cache state, or an equivalent consistent query approach.
Zod for client-side input schemas shared where practical with server types.
A small shared component library for buttons, inputs, modal/dialog, evidence cards, badges, loading state, and error state.
12.2 Required component concepts
LandingPage
ScenarioBuilderForm
GenerationProgress
CaseRoomPage
CaseBriefPanel
SuspectCard / SuspectsPanel
EvidenceFilters
EvidenceCard
ChatEvidenceViewer
ImageEvidenceViewer
CctvEvidenceViewer
DocumentEvidenceViewer
TimelinePanel
EvidenceSelectionControl
AccusationDialog
ResultPage
ErrorState / NotFoundPage
These names are conceptual; components may be grouped sensibly. Avoid one huge component per route. Use typed props and isolate evidence renderers by evidence type.

12.3 Client-side data exposure
Never bundle prompts, the private blueprint schema, server-only keys, or the full MongoDB document.
Build public response DTOs with explicit allowlists in the backend.
Do not embed the correct suspect in HTML attributes, hidden input values, React state, serialized route data, or frontend source maps.
The result endpoint is the only public interface allowed to return the solution, and only after completion.
12.4 UI state and errors
Handle at least these states on every relevant page: initial, loading, success, empty, validation error, network error, server error, and generation failure. Keep user input intact if a transient request fails. Polling must stop after ready, completed, or failed, and must not create unbounded requests.

13. Backend implementation requirements
13.1 Stack
Node.js LTS + TypeScript.
Express.
MongoDB + Mongoose.
@google/genai for Gemini calls.
Zod for request and AI output validation.
helmet, strict CORS, rate limiting, signed cookies, and structured logs.
Vitest (or Jest) for unit/integration tests; Supertest for Express API tests.
13.2 Suggested directory layout
/
├── SPEC.md                    # canonical specification (this file)
├── AGENTS.md                  # repo-level instructions pointing Codex to SPEC.md
├── client/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   │   ├── scenario-builder/
│   │   │   ├── case-room/
│   │   │   └── results/
│   │   ├── lib/
│   │   ├── pages/
│   │   └── types/
│   └── ...
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   │   ├── gemini/
│   │   │   ├── case-generation/
│   │   │   ├── media/
│   │   │   └── scoring/
│   │   ├── schemas/
│   │   ├── utils/
│   │   └── tests/
│   └── ...
├── shared/                    # shared types/schemas only where genuinely reusable
├── .env.example
└── README.md
Do not place secret-bearing environment files in Git. A separate AGENTS.md may direct coding behavior but must not duplicate feature requirements already defined here.

13.3 Architecture boundaries
Express route handlers validate the request, call a controller/service, and return a response DTO. No Gemini prompt logic inside route handlers.
case-generation orchestrates the pipeline and updates the persisted case status.
gemini owns all text-model requests and structured output parsing.
media owns image/video generation, storage, and fallback simulations.
scoring owns deterministic accusation validation and score calculation.
models define database persistence; public DTO mappers must remain explicit.
React calls only the Express API.
13.4 Generation job reliability
For v1, a lightweight persisted background runner is acceptable; a separate queue product is not required. Save generating state before starting work. Limit concurrent jobs. On server startup, detect stale jobs left in generating beyond a configurable timeout and either retry them safely or mark them failed. Do not leave them stuck forever. Make each stage idempotent where practical.

14. Environment configuration
Create .env.example with placeholders and descriptions. Never commit actual secrets.

Required or expected variables:

NODE_ENV=development
SERVER_PORT=5000
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/ai_mystery_room
SESSION_SECRET=replace-with-a-long-random-secret
GEMINI_API_KEY=replace-with-your-key
GEMINI_TEXT_MODEL=configure-a-current-supported-text-model

# Optional media capabilities. Keep secrets server-side.
ENABLE_IMAGE_GENERATION=false
GEMINI_IMAGE_MODEL=configure-a-current-supported-image-model
ENABLE_VIDEO_GENERATION=false
GEMINI_VIDEO_MODEL=configure-a-current-supported-video-model

CASE_TTL_DAYS=7
MAX_ACTIVE_GENERATIONS_PER_SESSION=1
MAX_CASE_GENERATIONS_PER_HOUR=5
GENERATION_TIMEOUT_MS=300000
Requirements:

Parse environment variables at server startup with Zod and fail fast for missing required values.
Keep model names configurable and verify current model/API availability during implementation.
Media feature flags default off in a fresh local environment to avoid unexpected provider charges. For full-media acceptance, configure supported image/video models and turn on the corresponding flags. The text-only pipeline and all investigation mechanics must still work when media generation is disabled or unavailable.
.env.example contains placeholders only.
15. Media assets and storage
Define a MediaProvider interface so the case-generation code does not depend on a particular Gemini model response format. The adapter should support image generation and video generation independently.

Each asset record should include: asset ID, case ID, evidence ID, asset type, generation state, provider/model label, MIME type, storage reference, alt text/transcript, created time, and safe failure code. Do not put large base64 blobs in MongoDB documents. Use filesystem storage for local development and a configured persistent object store for production. If a production storage adapter is not implemented yet, document that media files on an ephemeral deployment filesystem will not persist across restarts.

Do not expose internal storage paths or signed credentials. Public asset URLs must be served through a controlled route or trusted storage URL with appropriate cache headers. If an asset is still pending, the case room shows a pending/fallback state rather than a broken image/video element.

16. Security, privacy, and abuse prevention
Store the Gemini API key and session signing secret only on the server.
Use helmet, production HTTPS, strict CORS allowlisting, secure cookie flags, JSON body-size limits, request validation, and rate limiting.
Verify case ownership on all case-specific endpoints.
Check the request Origin for state-changing browser requests and reject unexpected origins.
Never accept ownerSessionId, solution, isCorrect, score, or hidden evidence annotations from the client as authoritative fields.
Use server-side random IDs; do not use sequential public case identifiers.
Avoid logging raw scenario text, user reasoning, generated private blueprint, secrets, or full evidence payloads by default. Use request IDs and safe diagnostic codes.
Limit scenario length, reasoning length, evidence selection count, case generations per session, concurrent jobs, and media-generation concurrency.
Do not include arbitrary remote URLs supplied by the user in server-side media fetches. This helps prevent SSRF.
Treat all model output as untrusted, sanitize rendered text, and never render model-provided HTML as trusted markup.
Provide a basic content policy note: “Use fictional scenarios. Do not submit real private messages or personal information.”
Delete expired cases and related media assets according to configured retention. Ensure cleanup covers stored files as well as MongoDB records.
17. Error handling and observability
Generate a request/correlation ID for each API request.
Use structured server logs with stage, status, duration, request ID, and safe error code.
Log unexpected exceptions server-side; show a generic message to users.
Distinguish input errors, provider errors, generation-validation failures, media failures, database failures, and ownership/not-found outcomes internally.
Media failures are non-fatal if the fallback works. Invalid core mystery generation is fatal for that case.
On a client network interruption, the frontend should fetch current case status rather than blindly create another case.
18. Testing and acceptance criteria
The project is not complete until the following pass.

18.1 Automated tests
Unit tests

scenario schema rejects missing/too-short/too-long text and invalid enum values;
blueprint validator rejects missing culprit, multiple culprits, duplicate IDs, invalid references, insufficient clues, and malformed timeline;
evidence validator rejects references to unknown suspects or unsupported types;
score calculator returns 70 for correct culprit with no cited clues, 0 for incorrect culprit with no relevant evidence, adds 10 per selected decisive/supporting evidence up to 30, and never exceeds 100;
public DTO mapper excludes the hidden solution and all private evidence annotations before accusation.
API integration tests

create case returns 202 and a valid case ID;
polling transitions to ready or failed in test fixtures;
a different anonymous session cannot read or accuse another session's case;
result endpoint cannot reveal the solution before accusation;
accusation rejects unknown suspect/evidence IDs and more than three evidence IDs;
duplicate accusation does not create a second attempt;
generation/provider errors do not expose prompts, keys, stack traces, or raw model output.
End-to-end happy path

Open landing page.
Create a case from a sample scenario.
Observe generation progress.
Open the case room and inspect at least one suspect and one item from each generated evidence type selected.
Select a suspect and up to three evidence items.
Submit an accusation.
Verify the result and clue explanations display.
Start a new case.
18.2 Product acceptance checklist
The site starts locally using documented commands.
The user can create and solve a case without signing in.
A ready case has 3–5 suspects, one fixed culprit, at least 6 evidence items, at least 3 clue items, and at least 2 explainable red herrings.
Every selected evidence type is represented. With media generation enabled and configured, image evidence uses AI-generated images and CCTV evidence uses AI-generated clips; disabled/failed media generation uses a clearly labelled simulation fallback.
Evidence forms a consistent chain and the reveal explains it.
The solution remains server-side until final accusation.
The accusation and score are calculated by the backend.
Responsive layout works at mobile and desktop widths.
Keyboard access, labeled controls, contrast, image alt text, and video transcript/description are present.
Provider failures are handled and do not crash the app.
No API key or secret exists in the frontend bundle or Git history.
All tests above pass.
19. Implementation sequence
Implement in this order so the application becomes playable before optional media complexity is added.

Phase 1 — Foundation
Create the client/server TypeScript project structure.
Set up MongoDB connection, environment validation, Express middleware, session cookie, health endpoint, and basic UI design system.
Add .env.example and README startup instructions.
Phase 2 — Deterministic case engine and UI
Create Zod schemas and a fixed seed case fixture for local development/tests.
Implement case room, evidence renderers, suspect cards, timeline, evidence selection, accusation, scoring, and result reveal using the fixture.
Prove secrecy and ownership with API tests before integrating Gemini.
Phase 3 — Gemini text generation
Implement canonical blueprint generation, structured evidence generation, semantic validation, retry/repair, persisted job status, and polling UI.
Replace the fixture path with generated cases while keeping fixtures for tests.
Phase 4 — Media adapters
Add image generation and storage adapter, then video generation adapter.
Implement fallbacks and clear generated/simulated labels.
Keep the app fully usable when one or both media adapters are disabled.
Phase 5 — Hardening and polish
Complete unit, integration, and end-to-end tests.
Review responsive layout, accessibility, latency, rate limits, cleanup jobs, logs, and deployment configuration.
Fix failing acceptance checks before considering v1 complete.
Do not begin by building all features in a single giant component or by generating a frontend around unvalidated model output. Build the core playable loop and the private/public data boundary first.

20. Definition of done
V1 is done when the local application can be started from the README, a user can generate a coherent mystery and solve it end-to-end, media features degrade gracefully, the answer is inaccessible before accusation, all acceptance checks pass, and the repository contains no real secrets. A visually polished landing page without a working investigation and reveal flow is not a completed product.

21. Official references to verify during implementation
Provider capabilities and model identifiers can change. Check these official Google sources at implementation time and configure the selected model IDs through environment variables:

Gemini API structured output: https://ai.google.dev/gemini-api/docs/structured-output
Gemini API image generation: https://ai.google.dev/gemini-api/docs/image-generation
Gemini API video generation: https://ai.google.dev/gemini-api/docs/video
Gemini API safety guidance: https://ai.google.dev/gemini-api/docs/safety-guidance
These references inform integration choices but do not override the product invariants and acceptance criteria in this specification.



⋮⋮⋮⋮
