# Must-Learn Priority

Based on the 104 solved problems in `docs/my-submissions` vs. the Google-tagged list. Budget: P0 ≈ 4.5 h, P1 ≈ 3 h, P2 only if ahead.

Format: **topic** · why for Google · evidence from submissions · minutes · anchors

## P0: do these first

1. **Prefix sum + hashmap** · counting subarrays with sum k breaks sliding window when negatives exist · not covered (only prefix products in 238) · 45 · 560, 525
2. **Binary search template + search on answer** · values up to 10^9 plus a yes/no check means binary search the answer · partial: 704 took 18 submissions with ad-hoc end checks, 33/153 fine · 50 · 875, 410
3. **BFS by levels / shortest path** · unweighted shortest path and "minutes to spread", explained out loud · partial: 286 multi-source BFS good, 102 solved with DFS, no other BFS · 45 · 994, 102
4. **Topological sort (Kahn)** · build order plus cycle check in one pass · partial: 207/269 via DFS only · 35 · 210, 207
5. **Monotonic stack: next greater + histogram** · span and next-greater problems, 84 is a classic · partial: only 739, 42 done with prefix-max arrays · 45 · 84, 496, 1944
6. **Linked list surgery: dummy, carry, k-group, Floyd** · 2, 25, 143, 19 all on the list · partial: 206/21/143/19 clean, but 141 stores node values in a set (wrong with duplicate values) · 45 · 2, 25, 876

## P1: next

7. **Backtracking choose / explore / unchoose** · subsets, combos, parentheses, plus the 2^n cost · partial: 39 clean, 46 built by insertion · 35 · 78, 22, 17
8. **Sliding window counting** · `right - left + 1` and atMost(k) − atMost(k−1) · partial: 3/424/76/567 are length-only windows · 30 · 713, 209, 930
9. **Design: hashmap + sorted list + bisect** · small API design rounds, pick a structure per operation · not covered (only 155, 208/211; bisect imported but never used) · 30 · 981, 359
10. **Minimax path: Dijkstra-max or binary search + BFS** · 778, 1970, 2812 share this shape · partial: 743 Dijkstra and 1584 Prim solid · 40 · 778, 1970
11. **LIS in O(n log n), tails + bisect** · 354 needs it · partial: 300 is O(n^2) · 25 · 354, 300
12. **Next permutation** · short, tricky, Google-tagged · not covered · 20 · 31

## P2: only if ahead

13. **Kth largest: heap vs quickselect** · partial (703, 1046 heaps) · 20 · 215
14. **Counting DP on two strings** · partial (1143, 10) · 30 · 115, 940
15. **Interval DP (burst balloons)** · not covered · 30 · 312
16. **Union-Find beyond counting** · partial (323) · 20 · 1970, 684
17. **String parsing (atoi, zigzag)** · not covered · 20 · 8, 6
18. **Bipartite + undirected cycles** · partial (261) · 15 · 785, 261
19. **Multi-source BFS + binary search** · partial (286) · 25 · 2812
20. **Meet in the middle** · not covered · 30 · 2035

## Already solid (skip)

Kadane, two pointers (11, 15, 167), max/min-length sliding windows (3, 76, 424), intervals (56, 57, 435, 253), tree DFS (104, 110, 124, 543, 98, 105, 297), tries (208, 211, 212), 1-D/2-D DP (70, 198, 322, 1143, 62, 139), grid DFS (200, 695, 417), Dijkstra (743), bit tricks (136, 191, 338, 371), matrix simulation (48, 54, 73).

Content for every P0/P1 item lives in `src/content/gaps.js` (lesson, trace, cards, MCQs, cloze, parsons, problems).
