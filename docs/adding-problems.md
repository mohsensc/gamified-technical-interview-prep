# Adding and editing content

All content is plain JavaScript in `src/content/` and `src/games/`. There is no build step. Save a file, refresh the browser.

After every change, run:

```
npm run validate
```

It checks every item and tells you the file, the line, what is wrong and how to fix it. Details are at the end of this page.

## Where things live

| Kind | File to edit | Example in that file |
|---|---|---|
| Problem | `src/content/bank/linear-problems.js` (also `structures.js`, `graphs-dp.js` in the same folder) | `lc: 986, title: 'Interval List Intersections'` |
| Thought walkthrough | `src/content/thought/*.js` (one file per category) | `id: 'thought:stack-trie:valid-parentheses'` |
| Multiple choice (MCQ) | `src/content/bank/linear-mcqs.js` | `{ skills: ['arrays-hashing'], difficulty: 1, q: '...' }` |
| Fill-in (cloze) | `src/content/bank/linear-clozes.js` | `code: ... [[seen.add(num)]] ...` |
| Reorder (parsons) | `src/content/bank/linear-parsons.js` | `id: 'bank-linear:parsons:33'` |
| Flashcard | `src/content/bank/linear-flashcards.js` | `[AH, 'Two Sum: best approach?', 'A hashmap...']` |
| Game round | `src/games/<game>.js` | `['Does s2 contain a permutation of s1?', 'Sliding window', '...']` |
| Company tags | `src/content/companies.js` | `1 GAMFPB · 2 AMFPB` |
| Skill ids | `src/content/skills.js` | `['arrays-hashing', 'Arrays & hashing']` |

The `bank/linear*` files hold array, string and search topics. `bank/structures*.js` holds stacks, heaps, lists, trees, union-find and design. `bank/graphs-dp*.js` holds graphs and dynamic programming. Pick the file that matches your topic.

## Skill ids

Almost every item has `skills: [...]`. Use ids from `src/content/skills.js`, for example `arrays-hashing`, `two-pointers`, `graph-bfs`, `dp-1d`. A wrong id is an error in validate.

## Problem

Required: `id`, `title`, `difficulty`, `skills`, `time`, `space`, and a company tag (see Company tags).
The rest is shown on the problem page. Fill in as much as you can.

```js
{
  id: 'bank-linear:problem:986',
  lc: 986,
  title: 'Interval List Intersections',
  difficulty: 'Medium',
  skills: ['intervals', 'two-pointers'],
  companies: ['google'],
  pattern: 'Intervals: two-pointer merge of two sorted lists',
  ds: ['array'],
  constraints: '0 ≤ list lengths ≤ 1000, each list sorted and disjoint',
  time: 'O(m + n)',
  space: 'O(1) extra',
  insight: 'The overlap is [max of starts, min of ends]. Advance whichever ends first.',
  signals: ['two sorted lists of disjoint intervals', 'return every overlap'],
  narration: ['Keep one pointer in each list.', 'Overlap start is the larger start.'],
  pitfalls: ['Touching endpoints count as an overlap'],
  solution: `class Solution:
    def intervalIntersection(self, firstList, secondList):
        ...`,
}
```

- `difficulty` is exactly `Easy`, `Medium` or `Hard`.
- `lc` is the LeetCode number. It is optional, but it links the problem to the company table.
- `id` must be unique. In the bank files it looks like `bank-linear:problem:986`.
- `wrong` (list of plausible wrong approaches) is optional.

## Thought walkthrough

A guided problem: pick the structure, pick the method, fill in the blanks of the code, then give time and space. Add an item to the `items` array in a file under `src/content/thought/`.

Required: `id`, `title`, `difficulty`, `skills`, `companies`, `statement`, `ds`, `method`, `time`, `space`, `code`, `blanks`.

```js
{
  id: 'thought:stack-trie:valid-parentheses',
  lc: 20,
  title: 'Valid Parentheses',
  difficulty: 'Easy',
  category: 'stack-trie',
  skills: ['stack'],
  companies: ['google', 'amazon'],
  statement: "You're given a string made only of ( ) { } [ ]. Decide if the brackets are balanced.",
  examples: [{ input: "s = '()[]{}'", output: 'true' }],
  constraints: ['1 <= s.length <= 10^4'],
  ds: { answer: 'deque stack of open brackets', choices: ['deque stack of open brackets', 'two pointers', 'Counter', 'queue'] },
  method: { answer: 'Push openers, pop and match on closers', choices: ['Push openers, pop and match on closers', '...', '...'] },
  code: `class Solution:
    def isValid(self, s: str) -> bool:
        ...`,
  blanks: [3, 7, 10],
  accept: { '7': ['if not stack or pairs[c] != stack.pop():'] },
  time: { answer: 'O(n)', choices: ['O(n)', 'O(n^2)', 'O(log n)', 'O(n log n)'], why: 'one pass' },
  space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'], why: 'the stack can hold n brackets' },
  sayIt: '==Stack== of open brackets. Pop and match on a close. O(n) time and space.',
  pitfall: 'Popping from an empty stack',
}
```

Rules that validate checks:

- In `ds`, `method`, `time` and `space`, `answer` must appear word for word in `choices`.
- `blanks` are line numbers inside `code`, counting from 0. Each one must point at a line with code on it.
- Keys in `accept` must also be listed in `blanks`. `accept` holds extra answers that count as correct.
- Wrap key phrases in `==double equals==` to highlight them.

## Multiple choice

Required: `skills`, `q`, `choices` (2 or more), `answer`. An `id` is added for you in the `linear` files. Other files need one, like `bank-structures:mcq:12`.
Optional: `difficulty` (1 to 3), `code` (shown under the question), `why` (shown after answering).

```js
{ skills: ['arrays-hashing'], difficulty: 1,
  q: 'Unsorted array, find if any two elements sum to a target in O(n). Approach?',
  choices: ['Sort, then binary search', 'One pass with a hashmap', 'Nested loops', 'Divide and conquer'],
  answer: 1,
  why: 'O(n) rules out sorting. A hashmap checks each complement in O(1).' }
```

`answer` is the position of the right choice, counting from 0. Here `1` is the hashmap.

## Fill-in

Required: `skills`, `title`, `code`. The code needs at least one `[[blank]]`.
Put the exact answer inside the brackets. To accept more than one spelling, separate them with `|`, like `[[i - 2|i-2]]`.

```js
{
  skills: ['arrays-hashing'], title: 'Contains Duplicate',
  code: `class Solution:
    def containsDuplicate(self, nums: List[int]) -> bool:
        seen = [[set()]]
        for num in nums:
            if num in seen:
                return [[True]]
            seen.add(num)
        return False`,
}
```

## Reorder

The learner puts shuffled lines in order. Required: `skills`, `title`, `lines` (3 or more, in the correct order). Optional: `distractors`, wrong lines mixed in. A distractor must not equal a real line.

```js
{
  id: 'bank-linear:parsons:33', skills: ['math'], title: 'Happy Number: cycle detection',
  lines: [
    'class Solution:',
    '    def isHappy(self, n: int) -> bool:',
    '        seen = set()',
    '        while n != 1 and n not in seen:',
    '            seen.add(n)',
    '            n = sum(int(d) ** 2 for d in str(n))',
    '        return n == 1',
  ],
  distractors: ['        while n != 1:'],
}
```

Keep the indentation exactly as it should be in the answer.

## Flashcard

In `linear-flashcards.js`, add a row to `cardData`: `[skills, front, back]`. The constants at the top (`AH`, `TP`, `BS`) are skill lists.

```js
[AH, 'Why can a Python list never be a dict key?', 'Lists are mutable and unhashable. Use a tuple instead.'],
```

Other bank files use full objects: `{ id, skills, front, back }`. An optional `code` field shows a snippet on the card.

## Game round

Each game keeps its rounds in its own file in `src/games/`.

- Pattern Radar: add a row to `builtIn` in `pattern-radar.js`: `[prompt, right pattern, why]`.
  ```js
  ['Does s2 contain a permutation of s1?', 'Sliding window', 'Fixed-size window of len(s1) with char counts.'],
  ```
  The pattern must be one of the names in `patternSkills` at the top of the file, for example `Sliding window` or `Two pointers`.
- DS Match: add an object to `scenarios` in `ds-match.js`: `{ d, s, ds, alts, why, op, skills }`.
- BFS or DFS: add an object to `scenarios` in `bfs-or-dfs.js`: `{ d, s, a, r, skills }` (`a` is the right algorithm, `x` lists algorithms to leave out of the choices).
- Pointer Surgery: add a puzzle to `puzzles` in `pointer-surgery.js`.

`d` is the level, 1 is easiest. A new game needs its own file with `id`, `title`, `icon`, `blurb`, `skills` and `mount`, plus one import line in `src/pages/games.js`.

## Company tags

Problems get company tags in two ways:

1. A `companies: ['google', 'amazon']` field on the problem.
2. A row in the table in `src/content/companies.js`. Each entry is the LeetCode number, then one letter per company.

```
1 GAMFPB · 2 AMFPB · 3 GAMFPB
```

`G` Google, `A` Amazon, `M` Microsoft, `F` Meta, `P` Apple, `B` Bloomberg. To add a company, add it to `companyList` and to `letterToCompany` in the same file.

## Editing something that already exists

1. Find it. Search the repo for a few words from the question or the problem title, for example `grep -rn "Two Sum" src/content`.
2. Edit the text in place. Do not change an `id`. Progress is stored against ids, so a renamed id looks like a new, unanswered item.
3. Save and refresh the page.
4. Run `npm run validate`.

To remove an item, delete it from the array. Progress stored for it stays in the database but is ignored.

## Running validate and reading its errors

```
npm run validate
```

When everything is fine you see counts and `All content is valid. 0 errors.`

When something is wrong, errors are grouped by file:

```
src/content/bank/linear-mcqs.js
  line 2  mcq bank-linear:mcq:1
    Problem: "answer" is 7 but there are 4 choices.
    Fix:     Set answer to the position of the right choice, counting from 0 (0 to 3).
```

- The first line is the file.
- Next come the line number and the kind and id of the item.
- `Problem` says what is wrong. `Fix` says what to change.

The command exits with an error code if anything is wrong, so you can also run it before you commit.

## Checks you will probably hit

| Message starts with | What to do |
|---|---|
| Unknown skill id | Use an id from `src/content/skills.js` |
| Unknown company id | Use `google`, `amazon`, `microsoft`, `meta`, `apple` or `bloomberg` |
| "answer" is N but there are M choices | Count from 0 |
| The code has no [[blank]] | Wrap the hidden part in `[[ ]]` |
| Difficulty is ... | Use `Easy`, `Medium` or `Hard` |
| No company tags were found | Add `companies: [...]` or a row in `companies.js` |
| The id "..." is already used | Rename one of the two ids |
