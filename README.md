# After Hours — AI Mystery Room

A single-player detective game built from fictional scenarios. The backend creates a private case solution, then serves an allowlisted investigation file. The answer and clue annotations stay server-side until the player submits one final accusation.

## Requirements

- Node.js 20 or newer and npm 10 or newer
- MongoDB running locally, or a MongoDB connection string
- A Gemini API key and supported text model for AI case generation (optional for the built-in sample case)

## Start locally

1. Copy `.env.example` to `.env` and set a long random `SESSION_SECRET`.
2. Set `MONGODB_URI` to your MongoDB instance.
3. To generate cases with Gemini, add `GEMINI_API_KEY` and a currently supported `GEMINI_TEXT_MODEL`. The app uses the server-side `@google/genai` SDK. If those values are absent, case creation uses the fixed fictional sample case so you can explore the investigation flow without a provider key.
4. Install dependencies and start the client and API:

   ```sh
   npm install
   npm run dev
   ```

5. Open `http://localhost:5173`. The API listens on `http://localhost:5000`.

For a production build, run `npm run build`, then start the API with `npm start`. Serve the built client through a static host or reverse proxy and set `CLIENT_ORIGIN` to its origin. Production media storage should use a persistent object store; local filesystems may be ephemeral on hosted platforms.

## Product experience

- A full-screen first-load preloader with an animated progress meter.
- A thin reading progress bar at the top as the page scrolls.
- A responsive landing page and scenario builder.
- A Three.js procedural investigation desk in the hero. It uses meshes created in code and does not fetch third-party model assets.
- A case room with suspects, a timeline, filterable evidence, evidence viewers, evidence citation, and a final accusation.
- A deterministic server-side score and solution reveal after the accusation.
- Anonymous signed sessions; no login is required.

## Gemini and media configuration

Gemini is called only from the Node server. Never add a Gemini key to a `VITE_` variable or the client bundle. The text, image, and video model identifiers are intentionally configured through environment variables because model availability changes. Structured case blueprint and evidence generation use the official Google GenAI SDK. Programmatic Zod checks run before a generated case is saved as ready. For video, current Google documentation recommends the Gemini Omni Flash Interactions API (`gemini-omni-1.1-flash`); the Veo 3.1 preview IDs were shut down on October 22, 2026. Check the [official video guide](https://ai.google.dev/gemini-api/docs/video) before changing model configuration.

`ENABLE_IMAGE_GENERATION` and `ENABLE_VIDEO_GENERATION` are off by default. When enabled with a supported Gemini model ID and API key, image and video evidence use the Gemini Interactions API and are stored under `server/uploads/`; the API serves them only to the owning anonymous session. When disabled or unavailable, evidence uses clearly labelled synthetic simulations. The local filesystem storage is for development and must be replaced by persistent object storage for deployments with ephemeral filesystems.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Experience overview |
| `/create` | Scenario and evidence settings |
| `/cases/:caseId/generating` | Case generation progress |
| `/cases/:caseId` | Investigation room |
| `/cases/:caseId/result` | Solution, score, and reconstruction after accusation |

## Security notes

- Public case DTOs are assembled with explicit field allowlists.
- The result endpoint rejects requests until a final accusation is recorded.
- Case ownership is tied to an HMAC-signed, HttpOnly anonymous session cookie.
- Score and correctness are computed by the API using private case annotations.
- Scenario input and Gemini output are validated; raw provider errors and solution data are not returned to the browser.
- All cases and artifacts are fictional. Do not submit real private messages or personal information.

See [SPEC.md](./SPEC.md) for the canonical product requirements and [AGENTS.md](./AGENTS.md) for repository implementation rules.
