# After Hours — AI Mystery Room

A single-player detective game built from fictional scenarios. The backend creates a private case solution, then serves an allowlisted investigation file. The answer and clue annotations stay server-side until the player submits one final accusation.

## Stack

- React, TypeScript, Vite, and Three.js client.
- Express, TypeScript, MongoDB/Mongoose, and Gemini API server.
- Anonymous signed sessions; no account is required.

## Run locally

1. Install Node.js 24 LTS and MongoDB (local or hosted).
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
2. In Atlas, choose **Connect → Drivers** and copy the Node.js connection string. Replace the password placeholder and set the database name to `ai_mystery_room`. URL-encode reserved characters in the username/password. Keep this string private.
3. After the Render service exists, allow its outbound IP ranges in Atlas **Network Access**. In Render, open the service's **Connect → Outbound** panel and add the listed ranges. The app exits if Atlas rejects the initial connection; once the ranges are allowed, redeploy it. Avoid `0.0.0.0/0`. For strictly no-cost use, leave paid Atlas backup features off and manually export anything you want to keep.

### 3. Deploy the Render service

1. In Render, choose **New → Blueprint**, connect the GitHub repository, and select the branch. Render reads the root `render.yaml`.
2. Confirm the service name and region. The blueprint uses Render's `free` web plan and pins Node.js to `24.22.1`. This is a $0 hobby/demo deployment, not an always-on production service: Render sleeps it after 15 minutes without traffic, and the next cold start can take about a minute. Keep billing disabled; if included usage limits are reached, Render may suspend service/builds instead of charging when no payment method is attached. See [Render Free instance limits](https://render.com/docs/free).
3. When prompted, enter:
   - `CLIENT_ORIGIN`: the exact HTTPS service origin, for example `https://ai-mystery-room.onrender.com` (no trailing slash). If Render assigns a different URL, update this variable in **Environment** after creation and redeploy.
   - `MONGODB_URI`: the Atlas connection string.
   - `GEMINI_API_KEY`: your Gemini API key, stored as a Render secret.
4. `GEMINI_QUICK_TEXT_MODEL` defaults to `gemini-3.8-flash`. Google lists standard Gemini 3.8 Flash token usage as free, subject to account eligibility and free-tier limits; don't enable paid billing if you want to keep costs at zero. Free-tier prompts may be used to improve Google's products, so submit fictional scenarios only. If the free tier isn't available for your Google project, stop rather than linking paid billing. Keep `ENABLE_IMAGE_GENERATION` and `ENABLE_VIDEO_GENERATION` set to `false`; the downloaded soundtrack is a static app asset and the case uses simulated media fallbacks.
5. Create the Blueprint. Render installs development dependencies for the TypeScript/Vite build, compiles the app, then removes development dependencies before starting with `npm start`. It checks `/api/health`. If the first deployment fails because Atlas blocks the connection, allow the Render outbound ranges in Atlas and redeploy.
6. After the service is created, confirm `CLIENT_ORIGIN` matches its assigned HTTPS URL exactly, add Atlas network access as described above, then trigger **Manual Deploy → Deploy latest commit** if needed.

### 4. Verify the live app

1. Open `https://<your-service>.onrender.com/api/health`; it should return `{"status":"ok"}`.
2. Open the root URL, create a small fictional case, and confirm generation reaches the case room.
3. Refresh, inspect evidence, submit an accusation, and verify the solution appears only after submission.
4. Test history, retry/fallback, sound mute/volume, and one private browser session. Check that the browser keeps the secure `mystery_session` cookie over HTTPS.
5. Inspect Render logs for `server_started` and safe generation failure codes. Logs intentionally omit scenarios, prompts, and secrets.

### Hosting notes

- Render Free has an ephemeral filesystem; uploaded/generated files would be lost on restarts, redeploys, and sleep. Keep AI image/video generation disabled. A persistent Render disk is not available on Free. The soundtrack file is bundled into the deploy, so it is restored with each build.
- Generation jobs and rate limits currently live in the web process. Keep one service instance; horizontal scaling needs a durable shared job queue and distributed rate limiting. A restart or deploy can interrupt an active generation and leave its history entry generating; open that case's progress page and use its sample fallback if needed. Add a durable queue before promising automatic recovery, uninterrupted deploys, or high availability.
- Anonymous cases expire after `CASE_TTL_DAYS` (7 days by default). The cleanup job removes expired MongoDB records and locally stored media.
- Render supplies `PORT`; the server binds to it on `0.0.0.0`. Production startup rejects local MongoDB URLs, weak session secrets, missing Gemini text settings, non-HTTPS client origins, invalid media flags, and enabled media generation without its model ID.
- If you add a custom domain, update `CLIENT_ORIGIN` to its exact `https://` origin and redeploy.
- Atlas Free clusters have a 0.5 GB storage cap. Leave the optional Atlas Free backup feature off because it is paid; export data manually if you need a copy. [Atlas Free cluster limits](https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/) and [backup pricing](https://www.mongodb.com/docs/atlas/backup/cloud-backup/free-cluster-backup/).
- Confirm the downloaded soundtrack's license permits your intended use. Monitor Render/Gemini usage; if any provider asks you to enable paid billing, stop and leave it disabled.

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
- Session-private generation history with success/failure status and a detail modal.
- Fast case generation with a labeled sample fallback and a background wait option when Gemini is slow.
- Deterministic server-side scoring and solution reveal after accusation.

## Security

- Gemini is called only from the server. Never use a `VITE_` variable for secrets.
- Public case DTOs are assembled with explicit allowlists; the result endpoint rejects requests until the accusation is recorded.
- Case ownership is tied to an HMAC-signed, HttpOnly, Secure-in-production anonymous cookie.
- Case creation and accusation routes enforce the configured browser origin in production.
- Scenario input and Gemini output are validated; provider errors and private solution data are not returned to the browser.
- All cases and artifacts are fictional. Do not submit real private messages or personal information.

See [SPEC.md](./SPEC.md) for canonical product requirements and [AGENTS.md](./AGENTS.md) for repository implementation rules.
