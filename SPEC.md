# TechPrep — build contract (all agents MUST follow)

Local study web app. Vanilla ES modules, NO build step, NO npm deps. Served by `node server.js` on http://localhost:5317.
User: Google SWE intern candidate, interviews Tue noon. Writes Python. Weak spots: picking time/space from constraints,
data-structure diagnosis, explaining DFS/BFS while coding, graphs, plus some queues/stacks/linked lists.
Hates reading walls of text. Loves diagrams, stepping forward/back through code with a live diagram, quizzes, flashcards, games.
UI rules: minimal text, modern, clean, fun; dark default + light; NO purple gradients, no heavy shadows; no code comments; camelCase.

## User's Python style (mirror it in ALL solution code)
Real samples in `docs/my-submissions/<slug>/submission-*.py`. Read 3-5 relevant ones before writing code.
- `from collections import defaultdict as dd`, `Counter`, `deque`; `import heapq` (heappush/heappop/heapify); `from functools import cache`; `bisect`.
- `class Solution:` + typed method signature. Nested `def dfs(...)` closures, `nonlocal`, `seen = set()`.
- `rows, cols = len(grid), len(grid[0])`, adjacency as `graph = dd(list)` or `{i: [] for i in range(n)}`.
- Plain descriptive names (`result`, `stack`, `heap`, `curr`, `prev`, `left`, `right`). Blank lines between blocks. No comments.

## File layout and ownership (only write files you own)
```
server.js, package.json, index.html            shell agent  (package.json already exists)
src/main.js src/router.js src/store.js          shell agent
src/ui/h.js src/ui/code.js src/ui/shell.js      shell agent
src/styles/base.css                             shell agent (design tokens + layout + common components)
src/pages/dashboard.js src/pages/plan.js        shell agent
src/content/plan.js                             shell agent
src/ui/items.js src/pages/drill.js src/pages/flashcards.js src/pages/learn.js src/pages/problems.js src/styles/items.css   items agent
src/viz/*.js src/pages/trace.js src/styles/viz.css                                                        viz agent
src/games/*.js src/pages/games.js src/styles/games.css                                                    games agent
src/pages/mock.js src/pages/handbook.js src/content/handbook.js src/content/narration.js src/styles/mock.css  coach agent
src/content/<topicId>.js                       one content agent per topic
src/content/google-a.js, google-b.js           google bank agents
src/content/index.js, src/content/skills.js    ALREADY WRITTEN (do not edit except integration agent)
```
index.html must link every css in src/styles/: base.css, items.css, viz.css, games.css, mock.css.

## Shared helpers (shell agent implements, everyone may import)
`src/ui/h.js`:
- `h(tag, attrs?, ...children)` → HTMLElement. attrs: `class`, `style` (string|object), `onclick` etc (any `on*` → listener), `html` (innerHTML), other → setAttribute. children: strings, nodes, arrays, null/false skipped.
- `svg(tag, attrs?, ...children)` same for SVG namespace.
- `clear(el)`, `toast(msg, kind?)` kind in `good|bad|info`, `confetti()` small burst.
`src/ui/code.js`:
- `codeBlock(source, {highlightLine?: number, lineNumbers?: true, dimOthers?: false}) → HTMLElement` Python syntax highlight (own tiny tokenizer). Lines 1-indexed. Element exposes `.setHighlight(lineNo)`.
`src/store.js` (persistent state; saves to localStorage AND `PUT /api/state` debounced; loads from `GET /api/state` on boot, newest `updatedAt` wins):
- `await initStore()`; `getState()`; `update(fn)` (mutate draft then persist); `subscribe(fn)`.
- `recordAnswer({itemId, kind, skills: string[], correct: boolean, ms?: number})` → updates per-skill mastery (0..1, Elo-like, starts 0.3), per-item SRS (Leitner box 0-5 with `due` timestamp: box intervals 0, 5min, 30min, 3h, 12h, 2d), XP (+10 correct, +2 wrong, streak bonus), daily log, studied minutes. Returns `{xpGained, newMastery}`.
- `rateCard(itemId, skills, grade)` grade 0 again/1 hard/2 good/3 easy → SRS + mastery.
- `getMastery(skill)`, `weakestSkills(n)`, `dueItems(kind?)`, `markSeen(id)`, `isSeen(id)`, `addTime(ms)`.
- `pickAdaptive(items, count)`: weights items by: due SRS first, then low mastery of their skills, unseen, difficulty near mastery; randomized.
- `getXP()`, `getLevel()` (level n needs 100*n*(n+1)/2 XP), `getStreak()`.
- state also holds `plan` progress map `{blockId: {done: bool, ...}}`, `settings`, `gameScores {gameId: best}`, `notes`.
`src/router.js`: hash routes. `route(pattern, render)`; render receives `(container, params)` and may return cleanup fn. Routes:
`#/` dashboard, `#/plan`, `#/learn` (topic grid), `#/learn/:topic`, `#/trace/:id`, `#/drill` (adaptive mixed), `#/drill/:skill`,
`#/flashcards`, `#/problems`, `#/problems/:id`, `#/games`, `#/games/:id`, `#/mock`, `#/handbook`, `#/handbook/:id`.
Each page module exports `default function render(container, params)`; main.js registers them.

## Content module shape (src/content/<topicId>.js, pure data + pure JS, NO DOM, must import in Node)
```js
export default {
  id: 'graphs-core', title: 'Graphs: Traversal', icon: '🕸️', skills: ['graph-dfs','graph-bfs', ...],
  lessons: [ Lesson ], traces: [ Trace ], flashcards: [ Card ], mcqs: [ MCQ ], clozes: [ Cloze ],
  parsons: [ Parsons ], problems: [ Problem ], extras?: {}
}
```
All ids globally unique: prefix with topic id, e.g. `graphs-core:mcq:12`.
`skills` values MUST come from `src/content/skills.js`.

**Lesson** (visual slides, ≤25 words of text per slide): `{id, title, skills, slides: [{title, panels?: Panel[], svg?: string, points?: string[], code?: string, highlight?: number, ask?: {q, choices, answer, why}}]}`
**Trace** (step-through code w/ diagram — the star feature):
```js
{ id, title, skills, problem: 'one-line statement', code: `python in user style`, complexity: {time:'O(V+E)', space:'O(V)', why:'short'},
  inputs: [{label:'small', value: <any JSON>}, ...],     // 2-4 presets
  run(input, t) { ... t.step(line, {vars:{name: value}, panels: Panel[], note:'≤15 words what & why', say?:'what to SAY to interviewer here'}) ... } }
```
`run` re-implements the algorithm in JS mirroring the Python line by line; call `t.step` at each meaningful line with `line` = 1-indexed line in `code`. Make panels show the full relevant state every step (pure snapshots: deep-copy arrays). Aim 15-80 steps per preset. Include `say` on key steps — this trains explaining-while-coding.

**Panel kinds** (rendered by viz agent; all fields JSON-serializable):
- `{kind:'array', label, values:[], pointers:{name: index}, highlight:[i], window:[l,r], dim:[i], sorted?:bool}`
- `{kind:'hashmap', label, entries:[[k,v]], highlight:[k]}`  `{kind:'set', label, items:[], highlight:[]}`
- `{kind:'stack', label, items:[] /*bottom→top*/, highlight:[i]}`  `{kind:'queue', label, items:[] /*front→back*/, highlight:[i]}` (deque uses queue)
- `{kind:'linkedlist', label, nodes:[{id, val, next}], pointers:{name: nodeId|null}, highlight:[id], cycleTo?: id}`
- `{kind:'tree', label, root:{id,val,left,right}|null, state:{id:'current'|'visited'|'frontier'|'done'|'path'}, pointers:{name:id}, values?:{id:annotation}}`
- `{kind:'graph', label, directed, nodes:[{id, label?, x?, y?}] (x,y 0..1 optional), edges:[{from,to,w?}], state:{id:'current'|'visited'|'frontier'|'done'|'path'}, edgeState:{'a->b':'tree'|'active'|'back'|'path'}, values?:{id: annotation e.g. dist}}`
- `{kind:'grid', label, cells:[[v]], state:{'r,c':'current'|'visited'|'frontier'|'path'|'wall'}, values?:{'r,c':text}}`
- `{kind:'heap', label, items:[], highlight:[i]}` (array form, rendered as tree + array)
- `{kind:'callstack', label, frames:['dfs(2,3)', ...] /*bottom→top*/}`
- `{kind:'table', label, rows:[[v]], rowLabels?, colLabels?, highlight:['r,c'], deps:['r,c']}` (DP)
- `{kind:'intervals', label, intervals:[[s,e]], highlight:[i], merged?:[[s,e]]}`
- `{kind:'text', text}`  `{kind:'complexity', n, ops}` (live op counter)
State color meaning everywhere: current=amber, frontier=sky, visited=teal-dim, done=green, path=pink, wall=gray.

**Card**: `{id, skills, front, back, code?}` (front ≤20 words; back ≤35 words; may include `code`).
**MCQ**: `{id, skills, difficulty:1|2|3, q, code?, choices:[4 strings], answer: idx, why: '≤30 words'}`
**Cloze** (fill-in code): `{id, skills, title, code: 'python with [[answer|alt2|alt3]] blanks', hint?}` 2-5 blanks, answers short tokens/expressions.
**Parsons** (reorder lines): `{id, skills, title, lines:['python lines in correct order WITH indentation'], distractors?:['wrong line']}` 5-14 lines.
**Problem**: `{id, lc: number, title, difficulty:'Easy'|'Medium'|'Hard', google: bool, skills, pattern:'Sliding window', ds:['hashmap'], constraints:'1 ≤ n ≤ 10^5', time:'O(n)', space:'O(k)', insight:'≤20 words aha', signals:['words in prompt that hint pattern'], narration:['≤6 short lines to SAY: clarify→approach→complexity'], solution:`python user style`, traceId?: 'id of a Trace' , pitfalls?:['edge cases']}`

## Skills taxonomy
See `src/content/skills.js` (ids, labels, groups). Mastery tracked per skill id.

## Adaptive loop
Drill page: `pickAdaptive` over all MCQ/Cloze/Parsons/Cards/constraint-drills filtered by skill; wrong answers resurface soon (SRS box 0).
Dashboard shows mastery heatmap per skill, weakest 3 skills with one-click drills, due counts, XP/level/streak, today's plan block.

## Constraint → complexity table (canonical, use consistently)
n ≤ 10: O(n!) / O(2^n·n) ; n ≤ 20: O(2^n) ; n ≤ 100: O(n^3)/O(n^4) ok ; n ≤ 500–1000: O(n^2)… n ≤ 3000: O(n^2) ;
n ≤ 10^5: O(n log n) or O(n) ; n ≤ 10^6: O(n) / O(n log n) tight ; n ≤ 10^9 or values up to 10^9: O(log n) / O(√n) / binary search on answer.
Budget ≈ 10^8 simple ops per second. Grid r×c ≤ 10^5 cells → O(r·c). Graph V,E ≤ 10^5 → O(V+E) or O((V+E) log V).

## Generators (procedural infinite drills)
A content module may set `extras.generators: [{id, title, skills, make(seed:number) → MCQ}]` (pure, deterministic from seed, returns a full MCQ object with unique id `${genId}:${seed}`).
Drill page and games use these for endless rounds (e.g. random constraints → pick complexity).

## Verification every agent must do
- Content agents: `node -e "import('./src/content/<id>.js').then(m=>{...})"` — import, check ids unique, skills valid, every trace `run` works on every preset with a stub `t={step(line,s){...}}` (line within code length, panels array), clozes contain [[ ]], mcq answer index valid.
- UI agents: `node --check` every file you wrote. Pages must not crash if some content arrays are empty.
