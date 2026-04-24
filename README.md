# StudyFlow

StudyFlow is a timer-first productivity web app that alternates between **Focus** and **Workout** sessions:

**Focus -> Workout -> Repeat**

It helps users maintain concentration, reduce sedentary study patterns, and review progress through daily summaries.

## Live Service

- Production: `https://study-flow-999.netlify.app`
- Repository: `https://github.com/starirene9/study-flow-main`

## Core Features

- Focus/Workout cycle timer with automatic session transitions
- Session controls: start, pause, resume, stop
- Daily summary with focus/workout totals and timeline visualization
- YouTube workout video management (selection, deduplication, activation)
- Authentication with Supabase (sign up, sign in, sign out)
- Password reset and password update flow
- Bilingual UI (Korean/English) and dark mode

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui, Radix UI
- **Routing**: React Router v6
- **State Management**: Context API (`AuthContext`, `StudyFlowContext`)
- **Data/Auth**: Supabase
- **Deployment**: Netlify

## Architecture at a Glance

- `src/pages/`: Route-level screens (`/`, `/focus`, `/workout`, `/summary`, `/auth`)
- `src/context/AuthContext.tsx`: Auth lifecycle and auth actions
- `src/context/StudyFlowContext.tsx`: Timer/session domain state and transitions
- `src/lib/storage.ts`: Settings, logs, and YouTube link persistence
- `src/lib/supabase.ts`: Supabase client initialization (env-variable enforced)

## Local Development

### 1) Prerequisites

- Node.js 18+
- npm

### 2) Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

The app is configured to fail fast if these variables are missing.

### 3) Run

```bash
npm install
npm run dev
```

By default, Vite runs on `8080`, and if occupied it will use `8081` (or the next available port).

## Build and Preview

```bash
npm run build
npm run preview
```

## Deployment (Netlify)

- Build command: `npm run build`
- Publish directory: `dist`
- Required env vars:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

For Supabase Auth redirect flows, ensure:

- Site URL: `https://study-flow-999.netlify.app`
- Redirect URL: `https://study-flow-999.netlify.app/auth`

## Roadmap

- Fix CSS warning related to `@import` order in `index.css`
- Introduce code-splitting to reduce large bundle warnings
- Improve error logging strategy (development vs production)
- Add E2E tests for auth and session transition regressions
