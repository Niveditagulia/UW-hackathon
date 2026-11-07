# Gentle Grove — React / Next.js

Full local copy of Gentle Grove, preserving the original screens, colours, enlarged text, four interactive games, starting-level assessment, garden, personal reports, CSV export and staff dashboard.

## Run

Node.js 22.13 or newer is required. Dependencies are already installed on this computer.

```sh
cd /Users/Nivedita/Desktop/Hackathon
npm run dev
```

Open **http://localhost:5173/login**. Leave the terminal running. Press Ctrl+C to stop it. You can also double-click `Start Gentle Grove.command`.

On another computer, run `npm ci` first. Copy `.env.example` to `.env.local` and set your own staff registration code.

## Resident login

Choose **I'm a resident → Sign in securely → Register**. Create a username and a password of at least 12 characters. Complete your profile, then the starting-level assessment. The four games use the resulting difficulty levels. Winning replenishes the garden; unsuccessful rounds reduce its health gently. Results feed your report.

**Keep me signed in** preserves your session for 30 days; otherwise it lasts 8 hours. Passwords are hashed, never stored as plain text. The browser can also offer to save your credentials.

## Staff login

Choose **I'm a staff member → Sign in securely → Register**. Create a staff username/password and enter the `STAFF_REGISTRATION_CODE` from the local `.env.local` file. This setup code prevents resident users from granting themselves staff access. Keep that file private. Staff login opens the dashboard directly. Lock staff access and Sign out both revoke the current session.

Existing staff sign in with their username/password. The dashboard shows resident reports. There are no pre-created accounts or default passwords.

## Local storage

The database lives under `.data/grove.db`. It persists across server restarts. Do not delete `.data` if you want to keep accounts, profiles and reports. Back up the `.data` folder while the server is stopped. The previous local database has been copied into this version. Hosted Site records have not been imported.

No ChatGPT or Cloudflare account is required to run locally. Local development uses a persistent SQLite file through libSQL. The server binds to loopback only.

## Commands

- `npm run dev`: migrate the local database and start the development server.
- `npm run typecheck`: check TypeScript.
- `npm run build`: produce the React/server production bundle.
- `npm start`: serve the built bundle locally, using the same database.
- `python3 tests/local_smoke.py`: integration checks against the running local server; cleans up its own test accounts.

## Code layout

- `app/`: React pages, reusable UI and server API routes.
- `app/AccountForm.tsx`: resident and staff login/registration.
- `app/api/auth/route.ts`: password validation and persistent sessions.
- `app/globals.css`: original responsive design and colour palette.
- `app/GameRun.tsx`, `app/GameHome.tsx`, `app/assessment/`: gameplay and assessment.
- `app/ReportView.tsx`: resident and care-team reports.
- `lib/local-session.ts`: session verification and password hashing.
- `lib/game-rules.ts`: game levels, garden changes and performance trend rules.
- `db/`, `drizzle/`, `scripts/migrate.mjs`: database client and versioned SQL migrations.
- `public/`: original icons/assets and app manifest.
- `next.config.ts`, `vercel.json`: local and Vercel configuration.

Stack: React 19, Next.js 16, TypeScript, SQLite/libSQL and Drizzle.

## Current product limits

Language preferences are saved; the interface is currently English. Trend summaries use transparent rules, not an external AI service, and are not medical diagnoses. This local project is not configured for public clinical deployment, email verification or password recovery. Keep the staff setup code private before sharing the project.

## Vercel deployment

1. Import `Niveditagulia/UW-hackathon` from GitHub into Vercel. Select **Next.js** with root directory `./`; leave output directory at its framework default.
2. Create/connect a **Turso (libSQL)** database. See https://vercel.com/marketplace/tursocloud/database .
3. Set these server-side environment variables in Vercel (do not prefix them with `NEXT_PUBLIC_`):
   - `TURSO_DATABASE_URL`: your hosted `libsql://...` URL.
   - `TURSO_AUTH_TOKEN`: the database access token.
   - `STAFF_REGISTRATION_CODE`: a long private setup code for staff registration.
4. Deploy. `npm run build` applies versioned database migrations, then builds Next.js. Missing/invalid database configuration fails the build with a clear message.
5. Register resident and staff accounts on your Vercel URL. Your local database is never uploaded or committed. Cloud accounts start fresh.

Use separate databases for Preview and Production deployments. The cloud connection needs real credentials; only local SQLite and the Next.js production build have been verified on this computer.

## Troubleshooting

- Use either http://localhost:5173/login or http://127.0.0.1:5173/login consistently. Browser cookies are separate for each hostname.
- Both hostnames support registration and login. Cross-site requests are still rejected.
- If port 5173 is occupied, use the existing server or stop it with Ctrl+C before starting again.
- Run `npm run db:migrate` if your local database needs initialization.
- The staff setup code is in `.env.local`, not the old `.dev.vars` file.
