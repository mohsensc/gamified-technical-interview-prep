# CodeCram

Free coding-interview prep. Patterns, company-tagged problems, thought-process drills, games, and progress tracking. Plain ES modules, no build step, no dependencies.

## Run locally

```
npm start
```

Open http://localhost:5317. Works as a guest with no account; progress is saved to `data/state.json` and mirrored in browser localStorage.

## Sections

- **Home**: "do this next" picks, course map, quick play, mastery heatmap
- **Course**: the full unit → module → bite tree with progress rings and checkpoints
- **Practice**: pick a mode (rapid fire, diagnose, multiple choice, flashcards, fill-in, reorder, predict-the-trace, weakest-first, redo missed, bookmarks) and a scope, then run a session
- **Thought Processes**: how to reason through a problem out loud, blank by blank
- **Algorithms**: pan/zoom skill tree of every algorithm, learning paths, and a detail page per algorithm
- **Learn**: visual lessons per topic, plus step-through traces (code + live diagram + what to say)
- **Problems**: company-tagged problem list with pattern, complexity, narration and solution
- **Games**: Constraint Sniper, DS Match, Pointer Surgery and more
- **Mock**: timed interview walkthrough, phase by phase
- **Stats**: readiness score, accuracy/mastery/speed trends, activity, goals
- **Glossary**: searchable term reference plus a rapid-fire quiz
- **Handbook**: cheat sheets and the narration script

Keys: `←` `→` step traces, `1-4` answer, `Enter` next, `space` flip.

## Accounts and sync

Guest mode needs no sign-in and works fully offline in localStorage. Signing in syncs progress across devices:

- On localhost with no Supabase config, the included Node server handles accounts itself (`data/users.json`, per-user state under `data/users/`).
- On a static host, set `supabaseUrl`/`supabaseAnonKey` in `src/config.js` to turn on email, magic-link and OAuth sign-in backed by Supabase.

## Deploy for $0 (Cloudflare Pages + Supabase)

1. Create a free Supabase project, then run `supabase/schema.sql` in its SQL editor.
2. In Supabase Auth settings, enable the providers you want (email is on by default; add Google/GitHub if desired) and add your deployed URL to the redirect allow-list.
3. Copy the project's URL and anon key into `supabaseUrl` and `supabaseAnonKey` in `src/config.js`.
4. Push this repo to GitHub.
5. Create a Cloudflare Pages project from that repo with build command `npm run build` and output directory `dist`.
6. Deploy. Cloudflare Pages and the Supabase free tier both cost $0.
7. Optionally set `siteUrl` in `src/config.js` to your deployed URL so sign-in emails link back to it.

## Progress data

Guest progress lives in `localStorage` under `codecram-state` (migrated automatically from the old `google-cram-state` key) and, on localhost, in `data/state.json`. Signed-in progress is cached locally per account and synced to Supabase or the local server.
