# Gentle Grove — React / Next.js

Full local copy of Gentle Grove, preserving the original screens, colours, enlarged text, four interactive games, starting-level assessment, garden, personal reports, CSV export and staff dashboard.

## Run

Node.js 22.13 or newer is required.

```sh
cd /Users/Nivedita/Documents/ChatGPT/app
npm install
# Copy .env.example to .env.local, then add your Supabase values.
npm run dev
```

Open **http://localhost:5173/login**. Leave the terminal running. Press Ctrl+C to stop it. You can also double-click `Start Gentle Grove.command`.

On another computer, run `npm ci` first. Copy `.env.example` to `.env.local` and add the Supabase values plus your own staff registration code.

## Resident login

Choose **I'm a resident → Sign in securely → Register**. Create a username and a password of at least 12 characters. Complete your profile, then the starting-level assessment. The four games use the resulting difficulty levels. Winning replenishes the garden; unsuccessful rounds reduce its health gently. Results feed your report.

**Keep me signed in** preserves your session for 30 days; otherwise it lasts 8 hours. Passwords are hashed, never stored as plain text. The browser can also offer to save your credentials.

## Staff login

Choose **I'm a staff member → Sign in securely → Register**. Create a staff username/password and enter the `STAFF_REGISTRATION_CODE` from the local `.env.local` file. This setup code prevents resident users from granting themselves staff access. Keep that file private. Staff login opens the dashboard directly. Lock staff access and Sign out both revoke the current session.

Existing staff sign in with their username/password. The dashboard shows resident reports. There are no pre-created accounts or default passwords.

## Data storage

Accounts, profiles, sessions, assessment levels, and staff reports live in your Supabase database. This lets localhost and Vercel use the same data. The Supabase service-role key stays server-side; never put it in a `NEXT_PUBLIC_` variable or commit `.env.local`.

## Commands

- `npm run dev`: start the development server.
- `npm run typecheck`: check TypeScript.
- `npm run build`: produce the React/server production bundle.
- `npm start`: serve the built bundle locally, using the same database.

## Code layout

- `app/`: React pages, reusable UI and server API routes.
- `app/AccountForm.tsx`: resident and staff login/registration.
- `app/api/auth/route.ts`: password validation and persistent sessions.
- `app/globals.css`: original responsive design and colour palette.
- `app/GameRun.tsx`, `app/GameHome.tsx`, `app/assessment/`: gameplay and assessment.
- `app/ReportView.tsx`: resident and care-team reports.
- `lib/local-session.ts`: session verification and password hashing.
- `lib/game-rules.ts`: game levels, garden changes and performance trend rules.
- `lib/supabase.ts`: server-only Supabase database client.
- `supabase/schema.sql`: database schema to run once in the Supabase SQL Editor.
- `public/`: original icons/assets and app manifest.
- `next.config.ts`, `vercel.json`: local and Vercel configuration.

Stack: React 19, Next.js 16, TypeScript, Supabase Postgres.

## Current product limits

Language preferences are saved; the interface is currently English. Trend summaries use transparent rules, not an external AI service, and are not medical diagnoses. This local project is not configured for public clinical deployment, email verification or password recovery. Keep the staff setup code private before sharing the project.

## Vercel deployment

1. Create a free Supabase project at https://supabase.com/dashboard. Open **SQL Editor**, create a new query, paste the entire contents of `supabase/schema.sql`, then click **Run**.
2. In Supabase, open **Project Settings → API**. Copy the **Project URL** and the `service_role` secret key.
3. Import `Niveditagulia/UW-hackathon` into Vercel. Select **Next.js** with root directory `./`.
4. Add these Vercel environment variables for **Production** and **Preview**:
   - `NEXT_PUBLIC_SUPABASE_URL`: the Project URL.
   - `SUPABASE_SERVICE_ROLE_KEY`: the `service_role` secret key. Keep this private.
   - `STAFF_REGISTRATION_CODE`: a long private code used only to create staff accounts.
5. Deploy. Then register resident and staff accounts on your Vercel URL.

The Vercel build does not run database migrations. Run `supabase/schema.sql` before using a new Supabase project.

## Troubleshooting

- Use either http://localhost:5173/login or http://127.0.0.1:5173/login consistently. Browser cookies are separate for each hostname.
- Both hostnames support registration and login. Cross-site requests are still rejected.
- If port 5173 is occupied, use the existing server or stop it with Ctrl+C before starting again.
- If a page says the database is not configured, check that all three variables in `.env.local` or Vercel are present and restart/redeploy.
- The staff setup code is in `.env.local` locally and Vercel environment variables in production.
