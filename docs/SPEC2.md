# Google Cram v2: foundation contract

Extends `SPEC.md`. Same rules apply: vanilla ES modules, no deps, camelCase, no comments, minimal text, dark and light tokens from `src/styles/base.css`.

## Course tree: `src/content/curriculum.js` (pure data, imports in Node)

Course → 8 Units (60-125 min) → 40 Modules (15-22 core min) → Bites (2-5 min, mock up to 20).
Every lesson, trace and algorithm is placed exactly once. A bite with `optional: true` is a bonus deep dive and does not count toward module minutes or progress.

```js
Course  {id:'course', kind:'course', title, deadline:'2026-10-06T12:00:00', minutes, units}
Unit    {id:'u-graphs1', kind:'unit', title, icon, minutes, skills, mustLearn, modules, checkpoint:{itemCount:15, passPct:80}}
Module  {id:'g1-bfs-levels', kind:'module', unitId, title, minutes, skills, mustLearn,
         gap: {slug, tier:'P0'|'P1', rank, why} | null, bites, checkpoint:{itemCount, passPct:80}}
Bite    {id:'<moduleId>~<type>~<ref|slot>', moduleId, unitId, type, title, minutes, skills, optional,
         ref?, traceId?, mode?, scope?}
```

Bite types and what `ref` means:

| type | ref | how to play |
|---|---|---|
| lesson | lesson id | slides from `lessons` |
| trace | trace id | stepper from `traceById` |
| algo | algorithm id (`algorithmById`) | algorithm card, then its `traceId` |
| predict | trace id | `buildSession({mode:'predict', scope})` |
| cards, rapid, quiz, diagnose | none | `buildSession({mode: bite.mode, scope: bite.scope})` |
| mock | `framework`, `tips`, `sim`, `narrate:<templateId>` | narration content in `narration.js` |
| read | statement id (`statements-a`/`statements-b`) or `drill` | link card to `#/read/<ref>` or `#/read/drill`, self-reported done |

Units in order: `u-complexity`, `u-graphs1`, `u-graphs2`, `u-trees`, `u-stacks`, `u-arrays`, `u-paradigms`, `u-craft`.
Must-learn modules (`mustLearn:true`, from `gaps.priority` P0/P1) come early in their unit.

Exports:
- `course`, `units`, `allModules`, `allBites` (flattened, study order), `allItems`, `algorithmById`, `placement`
- `findNode(id)` → course | unit | module | bite (with `kind`) | null
- `pathTo(id)` → `[{id, kind, title, href}]`, from course down to the node
- `hrefFor(id)` → `#/course`, `#/course/<id>` or `#/bite/<id>` (URI-encoded)
- `itemsForNode(id)` → quiz items, each with `kind`: `mcq|cloze|parsons|card|generator` and `topic`
- `problemsForNode(id)`, `tracesForNode(id)`, `moduleForItem(itemId)`, `nextBite(biteId, {includeOptional})`

## Store additions: `src/store.js` (all old exports unchanged)

State gains `events[]` (last 20000), `bites{}`, `checkpoints{}`, `bookmarks{}`, `sessions[]` (last 300), `skillHistory{day:{skill:mastery}}`, and `items[id].lastCorrect`.

```js
Event {type:'answer'|'card'|'session'|'bite'|'checkpoint'|'game'|'trace', ts, itemId?, kind?, mode?, skills?,
       topic?, nodeId?, correct?, ms?, hinted?, grade?, score?, gameId?, pct?, sessionId?}
```

- `recordAnswer({itemId, kind, skills, correct, ms, mode?, topic?, nodeId?, hinted?})`, `rateCard(itemId, skills, grade, extra?)` and `recordGameScore` log events on their own.
- `setEventContext({mode, nodeId, topic})` / `clearEventContext()`: player pages set this once so every logged event carries mode and node.
- `logEvent(fields)` → event. Use it for anything else, for example `{type:'trace', itemId: traceId, ms}`.
- `getEvents(filter | fn)`, where filter is `{type (string|array), since, until, skill, nodeId, mode, itemId, kind, topic, correct, limit}`
- `getDailyRollups(days=14)` → `[{day:'YYYY-MM-DD', count, correct, accuracy|null, minutes, xp}]`
- `getSkillHistory(skill?)` → `[{day, mastery}]`, or `[{day, skills:{id:mastery}}]` when no skill is given
- `getSkillAccuracy(skill, lastN=20)` → `{total, correct, wrong, accuracy}`
- `completeBite(id, {ms?, score?})`, `getBiteStatus(id)` → `{done, at, firstAt, count, best}`
- `recordCheckpoint(nodeId, pct)` (pass means best ≥ 80), `getCheckpoint(nodeId)` → `{attempts, best, last, at, passed}` | null
- `getNodeProgress(id)` → 0..1. A bite is done or not done. A module is 0.5·core bites + 0.3·checkpoint + 0.2·mastery. A unit is 0.85·modules (weighted by minutes) + 0.15·checkpoint.
- `toggleBookmark(itemId)` → bool, `isBookmarked(id)`, `getBookmarks()` → ids, newest first
- `getMissed({since?, kind?})` → `[{id, kind, skills, lastAt, attempts, correct}]` (wrong at last attempt)
- `saveSession({mode, scope, results:[{itemId, correct, ms, skills, kind}], ms?})` → session; `getSessions(limit?)` returns newest first
- `loadCurriculum()`: `initStore` already awaits it, and `getNodeProgress` needs it

## Sessions: `src/engine/session.js`

- `modes`: `[{id, title, icon, blurb, seconds?}]` for `rapid`, `diagnose`, `weakest`, `mixed`, `mcq`, `cards`, `cloze`, `parsons`, `predict` and `checkpoint`. Also exports `modeById`.
- `buildSession({mode, scope, count?, seconds?, minutes?})` → items, ready for `renderItem` from `src/ui/items.js`
  - `scope = {unitId?, moduleId?, nodeId?, topic?, skills?, kinds?, googleOnly?, difficulty?, missedOnly?, bookmarksOnly?, dueOnly?}`
  - rapid: MCQs, generator instances and short cards converted to MCQ (`sourceId` = card id). Timer default is `modes.rapid.seconds`.
  - diagnose: 4 MCQs per problem (pattern, ds, time, space). Each has `diagnose:{problemId, part}`.
  - predict: `{id:'predict:<traceId>', kind:'predict', traceId, title, skills}`, and the page renders the trace in guess mode.
  - checkpoint: uses `findNode(scope.moduleId|unitId).checkpoint.itemCount` and leaves out cards
  - weakest: the 3 weakest skills unless `scope.skills` is given
- `makeDiagnoseQuestions(problem, pool?)` → MCQs whose distractors come from other problems' fields
- `scopeFromQuery(query)` → `{scope, count?, minutes?, seconds?}`, `practiceHref(mode, scope, {minutes, count})` → hash

## Recommendations: `src/engine/recommend.js`

- `recommendNext({limit=3})` → `[{title, reason (≤14 words, data-backed), href, minutes, kind}]`
  - kind is one of `continue|must-learn|drill|review|checkpoint|mock|warmup`
  - ranking weighs weak skills, due SRS, missed items, curriculum position, must-learn rank, hours until Tue 12:00 and variety
- `continueTarget()` → href of the next incomplete core bite, `nextIncompleteBite()`, `hoursUntilInterview()`, `interviewAt`

## Routes and URLs

| route | page file |
|---|---|
| `#/course`, `#/course/:id` (unit, module or bite id) | `src/pages/course.js` |
| `#/bite/:id` (plays one bite, then offers the next) | `src/pages/bite.js` |
| `#/practice`, `#/practice/:mode` | `src/pages/practice.js` |
| `#/algorithms`, `#/algorithms/:id` | `src/pages/algorithms.js` |
| `#/stats` | `src/pages/stats.js` |
| `#/glossary`, `#/glossary/:term` | `src/pages/glossary.js` |

Practice query: `#/practice/:mode?unit=&module=&node=&skill=a,b&topic=&kinds=cloze,parsons&google=1&missed=1&bookmarks=1&due=1&diff=2&min=5&n=20&sec=90`.
Pages receive `params.query`. `parseQuery(hashOrString)` and `buildQuery(obj)` come from `src/router.js`. Then call `buildSession(scopeFromQuery(params.query))` with `mode` set.
Ids in the path are URI-encoded (`hrefFor` does this). Decode with `decodeURIComponent`.

## Keyword markup

Any text field (slides, points, q, why, card front and back, notes, blurbs) may contain `==term==`. Render text through `rich(text)` → `DocumentFragment` from `src/ui/rich.js`, which the keywords agent owns. It turns each term into a highlighted keyword that links to `#/glossary/<term>`. Never show the raw `==` to the user.
