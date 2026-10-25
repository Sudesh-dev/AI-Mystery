# After Hours — AI Mystery Room

A single-player detective game built from fictional scenarios. The backend creates a private case solution, then serves an allowlisted investigation file. The answer and clue annotations stay server-side until the player submits one final accusation.

## Stack

- React, TypeScript, Vite, and Three.js client.
- Express, TypeScript, MongoDB/Mongoose, and Gemini API server.
- Anonymous signed sessions; no account is required.

## Run locally

1. Install Node.js 20 or newer and MongoDB (local or hosted).
2. Copy `.env.example` to `.env` and set `MONGODB_URI`, a unique `SESSION_SECRET`, and Gemini text credentials if you want AI-generated cases. Without Gemini credentials, the app uses its sample case.
3. Install and run:

   ```sh
   npm ci
   npm run dev
   ```

4. Open `http://localhost:5173`. The API listens on `http://localhost:5000`.

## Deploy to Render + MongoDB Atlas

The app is deployed as one Render web service: Express serves the built React site and `/api` from the same HTTPS origin. MongoDB Atlas stores case data. The included `render.yaml` defines the service and asks for the environment-specific values during setup.

### 1. Prepare the repository

1. Commit the project to a GitHub repository and push the branch you want to deploy.
2. Confirm `.env` is not tracked by Git. Only `.env.example` belongs in the repository. Never place a Gemini key or database password in source files, `render.yaml`, or a `VITE_` variable.

### 2. Create a MongoDB Atlas database

1. Create an Atlas project and cluster, then create a database user with a strong password. Use a dedicated application user; do not use your Atlas account login.
2. In **Network Access**, allow the Render service's outbound IP ranges. After the first Render service exists, find the ranges in its **Connect → Outbound** panel and add them to Atlas. If Atlas blocks the first boot, the app will exit with `DATABASE_UNAVAILABLE`; allow the ranges and redeploy. Atlas warns that `0.0.0.0/0` permits connections from anywhere; use it only as a temporary development workaround, with a strong database password, and replace it with the host's ranges before public launch.
3. In Atlas, choose **Connect → Drivers** and copy the Node.js connection string. Replace the password placeholder and set the database name to `ai_mystery_room`. Keep this string private.

### 3. Deploy the Render service

1. In Render, choose **New → Blueprint**, connect the GitHub repository, and select the branch. Render reads `render.yaml`.
2. Confirm the service name and region. The blueprint uses the Free plan for a preview; choose a paid instance for a public production launch.
3. When prompted, enter:
   - `CLIENT_ORIGIN`: the exact HTTPS origin Render assigns, for example `https://ai-mystery-room.onrender.com` (no trailing slash).
   - `MONGODB_URI`: the Atlas connection string.
   - `GEMINI_API_KEY`: your Gemini API key.
   - `GEMINI_TEXT_MODEL`: a current supported text model ID.
4. Keep `ENABLE_IMAGE_GENERATION` and `ENABLE_VIDEO_GENERATION` set to `false` for the first deployment. Text-only cases and the investigation flow will work; the synthetic media fallbacks remain available.
5. Create the Blueprint. Render runs `npm ci && npm run build`, starts with `npm start`, and checks `/api/health`. Open the service URL after the deploy reports **Live**.

### 4. Verify the live app

1. Open `https://<your-service>.onrender.com/api/health`; it should return `{"status":"ok"}`.
2. Open the root URL and create a small fictional case.
3. Confirm generation reaches the case room, refresh the page, submit an accusation, and verify the result appears only after submission.
4. Inspect Render logs for `server_started` and `case_generation_failed`. Logs intentionally omit scenarios, prompts, and secrets.
5. Test once in a private browser window to confirm the anonymous session cookie is created over HTTPS.

### Hosting notes

- Render's Free web services sleep after 15 minutes idle and their local files are ephemeral; Render recommends Free for hobby projects and previews rather than production. Cases persist in Atlas, but images/videos saved to the local filesystem will disappear on restart, sleep, or deploy. A paid service is appropriate for a public launch.
- Keep media generation disabled unless you attach a persistent Render disk at `/opt/render/project/src/uploads` and set `MEDIA_STORAGE_DIR` to that exact path. Persistent disks require a paid service and change deploy behavior. For multi-instance scaling or object storage, implement a shared storage adapter before enabling media.
- This app runs generation work inside the web process. Keep a single service instance for now; scaling horizontally needs a shared job queue and a distributed rate-limit store.
- Anonymous cases expire after `CASE_TTL_DAYS` (7 days by default). The cleanup job removes expired MongoDB records and locally stored media.
- Render supplies `PORT`; the server binds to it on `0.0.0.0`. Production startup rejects local MongoDB URLs, weak session secrets, missing Gemini text settings, and non-HTTPS client origins.
- If you add a custom domain, update `CLIENT_ORIGIN` to its exact `https://` origin and redeploy.

## Production build locally

```sh
npm ci
npm run build
NODE_ENV=production npm start
```

Set production environment variables before starting. On Windows PowerShell, set variables with `$env:NODE_ENV = 'production'` for the current shell.

## Product experience

- First-load preloader and reading progress bar.
- Responsive landing page and scenario builder.
- Three.js procedural investigation desk, built from code-created meshes.
- Case room with suspects, timeline, filterable evidence, evidence viewers, evidence citation, and a final accusation.
- Deterministic server-side scoring and solution reveal after accusation.

## Security

- Gemini is called only from the server. Never use a `VITE_` variable for secrets.
- Public case DTOs are assembled with explicit allowlists; the result endpoint rejects requests until the accusation is recorded.
- Case ownership is tied to an HMAC-signed, HttpOnly, Secure-in-production anonymous cookie.
- Case creation and accusation routes enforce the configured browser origin in production.
- Scenario input and Gemini output are validated; provider errors and private solution data are not returned to the browser.
- All cases and artifacts are fictional. Do not submit real private messages or personal information.

See [SPEC.md](./SPEC.md) for canonical product requirements and [AGENTS.md](./AGENTS.md) for repository implementation rules.
