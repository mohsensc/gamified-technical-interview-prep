# Google Cram

Local study app for the Google SWE intern interview. Plain ES modules, no build step, no dependencies.

## Start

```
cd ~/google-cram && npm start
```

Open http://localhost:5317

## Sections

- **Dashboard**: countdown, next plan step, weakest skills, spaced review, mastery map
- **Plan**: the 10-hour schedule as checkable blocks
- **Learn**: visual lessons per topic, plus step-through traces (code + live diagram + what to say)
- **Drill**: adaptive mix of quizzes, fill-in code, line ordering and cards; `#/drill/<skill>` for one skill
- **Flashcards**: spaced repetition review
- **Problems**: Google-tagged LeetCode list with pattern, complexity, narration and solution
- **Games**: Constraint Sniper, DS Match, Pointer Surgery and more
- **Mock**: timed interview walkthrough, phase by phase
- **Handbook**: cheat sheets and the narration script

Keys: `←` `→` step traces, `1-4` answer, `Enter` next, `space` flip.

## Progress

Saved to `data/state.json` by the server and mirrored in browser localStorage. Delete `data/state.json` and clear site data to reset.

See `docs/CRAM-GUIDE.md` for the plan on paper.
