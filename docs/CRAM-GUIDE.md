# Cram Guide

10 hours, 15 blocks. Start every block from the dashboard button. Times are offsets from when you start.

| # | Start | Length | Block | Steps |
|---|---|---|---|---|
| 1 | 0:00 | 40m | Complexity + constraints → target Big-O | Lesson: Big-O and the constraint table<br>Game: Constraint Sniper (3 rounds)<br>Drill: constraints → complexity<br>Drill: Big-O of code snippets |
| 2 | 0:40 | 30m | Pick the data structure | Handbook: signal → data structure<br>Drill: data-structure diagnosis<br>Games: pattern match round |
| 3 | 1:10 | 50m | Graphs I: model it + DFS | Lesson: graphs core<br>Step through a DFS trace out loud<br>Drill: model as a graph<br>Drill: graph DFS |
| 4 | 2:00 | 50m | Graphs II: BFS + grids | Trace: BFS shortest path, narrate each pop<br>Drill: graph BFS<br>Drill: grid traversal<br>Problems: islands / rotting oranges style |
| 5 | 2:50 | 20m | Recall sprint | Flashcards: everything due<br>Drill: mixed adaptive |
| 6 | 3:10 | 35m | Topological sort + cycles | Lesson: Kahn + DFS topo<br>Drill: topological sort<br>Problem: Course Schedule |
| 7 | 3:45 | 45m | Tree DFS: return values up | Lesson: trees<br>Trace a recursive DFS with the call stack<br>Drill: tree DFS |
| 8 | 4:30 | 35m | Tree BFS + BST | Drill: level-order BFS<br>Drill: BST<br>Drill: heap / top-k |
| 9 | 5:05 | 50m | Graphs III: Union-Find + Dijkstra | Lesson: advanced graphs<br>Trace Dijkstra heap pops<br>Drill: union-find<br>Drill: Dijkstra |
| 10 | 5:55 | 40m | Stacks, monotonic stacks, queues | Lesson: stacks + lists<br>Drill: stack<br>Drill: monotonic stack<br>Drill: queue + deque |
| 11 | 6:35 | 30m | Linked lists: pointers without panic | Trace: reverse + fast/slow<br>Drill: linked list<br>Flashcards review |
| 12 | 7:05 | 60m | Google-list pattern drills | Problems: Google-tagged, pattern first<br>Lesson: linear patterns<br>Lesson: paradigms (DP, greedy, backtracking)<br>Drill: mixed adaptive |
| 13 | 8:05 | 40m | Explain while coding | Handbook: the narration script<br>Trace with "say" lines, read them aloud<br>Drill: communication |
| 14 | 8:45 | 45m | Mock interview | Mock: 45 min, timer on, talk out loud<br>Review misses in drill |
| 15 | 9:30 | 30m | Final review + sleep | Flashcards: due only<br>Constraint Sniper speed round<br>Skim the handbook cheat sheet |

Take a 5 minute break between blocks. Sleep before the interview beats one more block.

## Narration framework

Say something at every phase. Silence reads as stuck.

| Phase | Time | Goal | Say |
|---|---|---|---|
| Clarify | 4m | Restate, ask, walk one example | "So given ___, return ___. Can it be empty or have duplicates?" |
| Constraints | 2m | Read n, pick the target Big-O | "n up to 10^5, so I'm aiming for O(n log n) or better." |
| Brute force | 3m | Name the naive way and its cost | "Trying every ___ is O(___). It repeats ___." |
| Optimize | 6m | Pattern + data structure + why | "This is a ___ problem because ___. A ___ makes each lookup O(1)." |
| Code | 18m | Talk at setup, loop, update, return | "This holds ___. At every step ___ stays true. I update ___ because ___." |
| Test | 6m | Dry-run, then edges | "Tracing ___: after the first pass ___. Empty input returns ___." |
| Complexity | 3m | Both, with a reason per term | "O(___) time since each ___ is touched once. O(___) space for ___." |

While coding BFS/DFS:

- **Model**: "Each node is a ___. There's an edge when ___."
- **Build**: "Adjacency list with `dd(list)`."
- **Visit**: "I mark seen when I push, so nothing is queued twice."
- **Pop**: "Popping gives the closest unvisited node, so the first time I reach the target is the shortest path."
- **Cost**: "Every node and edge once: O(V + E) time, O(V) for seen and the queue."

When stuck: "Let me try a smaller example." / "Which structure gives O(1) for the thing I repeat?"

## Constraints to complexity

Budget is about 10^8 simple operations per second. Python is slower, so leave room.

| Constraint | Target |
|---|---|
| n ≤ 10 | O(n!) or O(2^n · n) |
| n ≤ 20 | O(2^n) |
| n ≤ 100 | O(n^3), O(n^4) ok |
| n ≤ 500 to 1000 | O(n^2), O(n^2 log n) |
| n ≤ 3000 | O(n^2) |
| n ≤ 10^5 | O(n log n) or O(n) |
| n ≤ 10^6 | O(n), O(n log n) tight |
| n or values up to 10^9 | O(log n), O(√n), binary search on the answer |
| Grid r·c ≤ 10^5 cells | O(r·c) |
| Graph V, E ≤ 10^5 | O(V + E) or O((V + E) log V) |
