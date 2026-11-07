# Gentle Grove — local React app

Full local copy of Gentle Grove, preserving the original screens, colours, enlarged text, four interactive games, starting-level assessment, garden, personal reports, CSV export and staff dashboard.

## Run

Node.js 22.13 or newer is required. Dependencies are already installed on this computer.

```sh
cd /Users/Nivedita/Desktop/Hackathon
npm run dev
```

Open **http://localhost:5173/login**. Leave the terminal running. Press Ctrl+C to stop it. You can also double-click `Start Gentle Grove.command`.

On another computer, run `npm ci` first. Copy `.env.example` to `.dev.vars` and set your own staff registration code.

## Resident login

Choose **I'm a resident → Sign in securely → Register**. Create a username and a password of at least 12 characters. Complete your profile, then the starting-level assessment. The four games use the resulting difficulty levels. Winning replenishes the garden; unsuccessful rounds reduce its health gently. Results feed your report.

**Keep me signed in** preserves your session for 30 days; otherwise it lasts 8 hours. Passwords are hashed, never stored as plain text. The browser can also offer to save your credentials.

## Staff login

Choose **I'm a staff member → Sign in securely → Register**. Create a staff username/password and enter the `STAFF_REGISTRATION_CODE` from the local `.dev.vars` file. This setup code prevents resident users from granting themselves staff access. Keep that file private. Staff login opens the dashboard directly. Lock staff access and Sign out both revoke the current session.

Existing staff sign in with their username/password. The dashboard shows resident reports. There are no pre-created accounts or default passwords.

## Local storage

The database lives under `.wrangler/state/v3/d1/`. It persists across server restarts. Do not delete `.wrangler` if you want to keep accounts, profiles and reports. Back up that folder while the server is stopped. This is a new local database: hosted accounts and resident records have not been imported.

No ChatGPT or Cloudflare account is required to run locally. Wrangler emulates the Cloudflare database on your machine. The server binds to loopback only.

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
- `db/`, `drizzle/`: database models and migrations.
- `public/`: original icons/assets and app manifest.
- `vite.config.ts`, `wrangler.json`: local build/runtime configuration.

Stack: React 19, TypeScript, Vite/Vinext, Cloudflare's local Worker runtime, SQLite/D1 and Drizzle.

## Current product limits

Language preferences are saved; the interface is currently English. Trend summaries use transparent rules, not an external AI service, and are not medical diagnoses. This local project is not configured for public clinical deployment, email verification or password recovery. Keep the staff setup code private before sharing the project.
