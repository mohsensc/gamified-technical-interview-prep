# How it works

TechPrep is a small Node server plus a browser app written in plain JavaScript modules. There is no build step and no packages to install.

## Folder map

```
server.js              the whole backend: serves files, saves progress to SQLite
index.html             the single page. Loads the styles and src/main.js
favicon.svg, manifest.webmanifest
src/
  main.js              starts the store and router, lists every page
  router.js            maps #/routes to pages
  store.js             progress in memory, loads and saves it through the server
  pages/               one file per screen (dashboard, practice, problems, settings, ...)
  games/               one file per game, plus _engine.js shared by the quiz games
  content/             all the questions, lessons and problems (see below)
  engine/              picks what to study next and builds practice sessions
  ui/                  shared building blocks (h.js makes elements, shell.js is the layout)
  viz/                 the diagrams: arrays, trees, graphs, heaps, step-through traces
  styles/              CSS, one file per area. base.css holds the colors
scripts/
  validate-content.mjs checks every content item (npm run validate)
tests/                 npm test
docs/                  these pages
data/                  your progress file. Created on first start, never committed
```

### Inside src/content

```
bank/                  MCQs, fill-ins, reorders, flashcards and problems by topic
thought/               thought walkthroughs, one file per category
dayof/                 the "day of the interview" guides
algorithms.js, trees.js, graphs-core.js, ...   lessons and step-through traces by topic
problems-a.js, problems-b.js                   more problems
companies.js           company list and the LeetCode number to company table
skills.js              every skill id
curriculum.js          the course: units, modules and bites
index.js               gathers everything into mcqs, flashcards, problems, ...
```

## How a page loads

1. The browser opens `index.html`, which loads the CSS and `src/main.js`.
2. `main.js` asks the store for your progress, then starts the router.
3. The router reads the part after `#` in the address, for example `#/problems/linear:problem:986`.
4. It finds the matching entry in the `pages` list in `main.js`, imports that file on demand and calls its default function with a container.
5. The page reads content from `src/content/index.js` and your progress from `store.js`, then draws itself.

To add a screen: write `src/pages/mypage.js` with `export default function render(container) {...}`, then add one line to `pages` and one `route(...)` line in `main.js`.

## How games load content

`src/pages/games.js` imports every game and lists them. Each game exports `id`, `title`, `icon`, `blurb`, `skills` and `mount(container, api)`. Most games call `runQuiz` from `_engine.js` with a `makeQuestion` function. That function picks a round from the lists inside the game file, such as `builtIn` in `pattern-radar.js`.

Practice, drills and flashcards read items from `src/content/index.js` instead.

## Where progress lives

One file: `data/techprep.db`. It is a SQLite database, opened by `server.js` with Node's built-in `node:sqlite` module. Set `DB_PATH` to use another location. Set `PORT` to use another port (default 5317). The server only listens on `127.0.0.1`, so nothing outside your computer can reach it.

The browser keeps your progress in memory. It loads it from `GET /api/state` on start. After each change it waits half a second and sends the whole thing with `PUT /api/state`. It also sends it when you close or hide the tab. `DELETE /api/state` clears everything. The server writes only the parts that changed.

### Tables

`progress` holds one row per part of your progress.

| Column | Meaning |
|---|---|
| `section` | The name of the part (text, primary key) |
| `value` | That part as JSON text |
| `updated_at` | When the row last changed, in milliseconds |

The sections are:

| Section | Holds |
|---|---|
| `xp`, `answerStreak`, `bestAnswerStreak`, `studyMs` | Totals |
| `skills` | Mastery per skill id |
| `items` | Per question: attempts, correct, box and due time for spaced repetition |
| `seen` | Which items you have opened |
| `daily` | XP, answers and minutes per day |
| `plan`, `bites`, `checkpoints` | Course and plan progress |
| `gameScores` | Best score per game |
| `notes` | Your scratch notes per problem |
| `bookmarks` | Saved items |
| `history`, `events`, `sessions`, `skillHistory` | Logs used by the stats page |
| `settings` | Theme |
| `version`, `createdAt`, `updatedAt` | Bookkeeping |

`meta` is a small key and value table. It remembers that the one-time import of old progress has run.

You can look at the file with any SQLite tool, for example `sqlite3 data/techprep.db "select section, length(value) from progress"`.

### Fresh start and older progress

A fresh clone has no `data/` folder, so everything starts at zero: nothing solved, no streak, no XP, no notes.

If you ran an older version, the first start imports your old `data/state.json` (or the biggest file in `data/users/`) once. Progress that an older version kept in the browser is uploaded the first time you open the page (only if the database is still empty), then removed from the browser.

### Backup, move, reset

- Back up: copy `data/techprep.db` (and `techprep.db-wal` if it exists), or use Settings, then Export.
- Move to another computer: copy the file into the new `data/` folder, or Export there and Import here.
- Reset: Settings, then Reset. Or stop the app and delete the `data` folder.

## Tests

`npm test` starts the server on a temporary database and checks save, load, restart, import, reset and the safety rules (other sites and other host names are refused).
