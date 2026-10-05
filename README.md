# Google Cram

Local study app for the Google SWE intern interview. Plain ES modules, no build step, no dependencies.

## Start

```
cd ~/google-cram && npm start
```

Open http://localhost:5317

## Sections

- **Home**: countdown, "do this next" picks, course map, quick play, mastery heatmap
- **Course**: the full unit → module → bite tree with progress rings and checkpoints
- **Practice**: pick a mode (rapid fire, diagnose, multiple choice, flashcards, fill-in, reorder, predict-the-trace, weakest-first, redo missed, bookmarks) and a scope, then run a session
- **Algorithms**: pan/zoom skill tree of every algorithm, learning paths, and a detail page per algorithm (mnemonic, signals/traps, steps, recall-mode template, complexity, trace)
- **Learn**: visual lessons per topic, plus step-through traces (code + live diagram + what to say)
- **Problems**: Google-tagged LeetCode list with pattern, complexity, narration and solution
- **Games**: Constraint Sniper, DS Match, Pointer Surgery and more
- **Mock**: timed interview walkthrough, phase by phase
- **Stats**: readiness score, accuracy/mastery/speed trends, activity, goals
- **Glossary**: searchable term reference plus a rapid-fire quiz
- **Handbook**: cheat sheets and the narration script
- **Plan**: the 10-hour schedule as checkable blocks

Keys: `←` `→` step traces, `1-4` answer, `Enter` next, `space` flip.

## Progress

Saved to `data/state.json` by the server and mirrored in browser localStorage. Delete `data/state.json` and clear site data to reset.

See `docs/CRAM-GUIDE.md` for the plan on paper.
