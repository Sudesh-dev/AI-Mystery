
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
Repository instructions for Codex
Before implementing or changing features, read SPEC.md completely. SPEC.md is the single source of truth for product requirements, architecture, API contracts, data privacy, UI behavior, testing, and acceptance criteria.

Rules:

Follow SPEC.md; do not silently weaken requirements or invent contradictory product behavior.
If a requirement needs to change, update SPEC.md first, then update code and tests in the same change.
Implement in the sequence defined in Section 19 of SPEC.md. Keep the app end-to-end playable at each milestone.
Protect the private mystery solution. Add or preserve automated tests proving it is not returned before a final accusation.
Keep Gemini calls on the server. Never put API keys, prompts, or hidden solution fields in the client bundle.
Validate every incoming request and every model output. Treat user scenarios and model output as untrusted.
Prefer small, typed modules over large all-in-one components or route handlers.
Do not claim a feature is complete unless its acceptance checks and tests pass.
Keep .env files and all secrets out of version control. Update .env.example when configuration changes.
At the end of each implementation task, summarize files changed, tests run, results, and any incomplete acceptance criteria.


⋮⋮⋮⋮