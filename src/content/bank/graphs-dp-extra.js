const rotate = (choices, answer, shift) => ({
  choices: choices.map((_, j) => choices[(j + shift) % choices.length]),
  answer: (answer - shift + choices.length) % choices.length,
})

const mcqRows = [
  [['greedy'], 1, 'Jump Game: nums = [2, 3, 1, 1, 4]. Can you reach the last index?', ['True', 'False', 'Only if sorted first', 'Greedy fails here, DP is required'], 0, 'From index 0 the farthest reach is 2; from index 1 it becomes 4, which already covers the last index.'],
  [['greedy'], 2, 'Jump Game: nums = [3, 2, 1, 0, 4]. Can you reach the last index?', ['False', 'True', 'Only with backtracking', 'Depends on the starting index'], 0, 'Index 3 holds a 0 and is the farthest anything can push past it, so index 4 is unreachable.'],
  [['greedy'], 2, 'Jump Game II: nums = [2, 3, 1, 1, 4]. Minimum number of jumps to the last index?', ['2', '3', '1', '4'], 0, 'Jump from index 0 into the window ending at index 2 (reach 2), then jump straight to index 4 — two jumps total.'],
  [['greedy'], 2, 'Gas Station: gas = [1, 2, 3, 4, 5], cost = [3, 4, 5, 1, 2]. Which starting index completes the circuit?', ['3', '0', '1', 'No valid start exists'], 0, 'Total gas (15) equals total cost (15), so a start exists; the running tank last goes negative right after index 2, so index 3 is the reset point.'],
  [['greedy'], 2, "Task Scheduler: tasks = ['A','A','A','B','B','B'], n = 2. Minimum total time including idle slots?", ['8', '6', '9', '7'], 0, '(3 - 1) · (2 + 1) + 2 = 8, matching the pattern A B idle, A B idle, A B.'],
  [['greedy'], 2, 'Candy: ratings = [1, 0, 2]. Minimum total candies needed?', ['5', '4', '6', '3'], 0, 'The two-pass result is [2, 1, 2] — the lowest-rated middle child gets the bare minimum of 1.'],
  [['greedy'], 2, "Partition Labels: why does extending the window's end to the last-seen index of every character inside it work?", ['Once the scan reaches that extended end, no character from the window can reappear later, so the cut is safe', 'It only works because the alphabet has 26 letters', 'The string must be sorted first for this to work', 'It is secretly a DP, not a greedy rule'], 0, "The window's boundary is pushed out exactly far enough to contain every occurrence of every character seen so far."],
  [['greedy'], 1, 'Boats to Save People: people = [3, 2, 2, 1], limit = 3. Minimum boats needed?', ['3', '2', '4', '1'], 0, 'Sorted [1, 2, 2, 3]: pairing 1 with 2 fits the limit, leaving the other 2 and the 3 each alone — 3 boats.'],
  [['greedy', 'intervals'], 2, 'Non-overlapping Intervals: intervals = [[1,2],[2,3],[3,4],[1,3]]. Fewest removals to make the rest non-overlapping?', ['1', '2', '0', '3'], 0, 'Sorting by end time and greedily keeping the earliest-ending, non-conflicting intervals leaves only [1,3] needing removal.'],
  [['greedy', 'intervals'], 1, 'Minimum Number of Arrows to Burst Balloons: points = [[10,16],[2,8],[1,6],[7,12]]. Minimum arrows?', ['2', '3', '4', '1'], 0, 'Sorted by end: one arrow at y = 6 bursts [1,6] and [2,8]; a second arrow at y = 12 bursts [7,12] and [10,16].'],
  [['intervals'], 1, 'Merge Intervals: [[1,3],[2,6],[8,10],[15,18]]. Result?', ['[[1,6],[8,10],[15,18]]', '[[1,3],[2,6],[8,18]]', '[[1,18]]', '[[1,6],[8,18]]'], 0, '[1,3] and [2,6] overlap (2 ≤ 3) and merge into [1,6]; the remaining two intervals are already disjoint.'],
  [['intervals'], 2, 'Insert Interval: intervals = [[1,3],[6,9]], newInterval = [2,5]. Result?', ['[[1,5],[6,9]]', '[[1,3],[2,5],[6,9]]', '[[1,9]]', '[[2,5],[1,3],[6,9]]'], 0, '[2,5] overlaps [1,3] (2 ≤ 3) and merges into [1,5]; it does not reach far enough to touch [6,9].'],
  [['intervals'], 1, 'Meeting Rooms: can one person attend every meeting in [[0,30],[5,10],[15,20]]?', ['No — [0,30] overlaps both of the other meetings', 'Yes, none of them overlap', 'Only if the meetings are reordered', 'Not enough information to decide'], 0, '[0,30] fully contains both [5,10] and [15,20] in time.'],
  [['intervals', 'heap'], 2, 'Meeting Rooms II: minimum conference rooms needed for [[0,30],[5,10],[15,20]]?', ['2', '3', '1', '30'], 0, 'At time 5, [0,30] and [5,10] are simultaneously active; no moment ever needs a third room.'],
  [['intervals'], 2, 'Why sort by START for Merge Intervals but by END for Non-overlapping Intervals?', ['Merging needs left-to-right order to extend a run; removal wants to keep whichever interval frees the timeline soonest', 'There is no real difference — either sort works for both problems', 'Sorting by end is always the better general choice', 'Sorting by start is always the better general choice'], 0, "The two problems optimize different things, so they need different greedy orderings to stay correct."],
  [['intervals'], 2, 'Car Pooling: trips = [[2,1,5],[3,3,7]], capacity = 4. Can every trip be completed without exceeding capacity?', ['False — between km 3 and km 5 both trips overlap for 5 passengers, exceeding 4', 'True, capacity is never exceeded', 'True, since the total of 5 passengers just barely fits', 'Impossible to tell without the number of stops'], 0, "From km 3 to km 5, trip 1's 2 passengers and trip 2's 3 passengers are both aboard: 5 exceeds the 4-seat limit."],
  [['intervals'], 2, 'Interval List Intersections: given overlapping [s1,e1] and [s2,e2], the intersection (if valid) is?', ['[max(s1, s2), min(e1, e2)], valid only when max(s1, s2) ≤ min(e1, e2)', '[min(s1, s2), max(e1, e2)], always', 'Always empty unless s1 equals s2', '[s1, e2] whenever s1 < s2'], 0, 'The overlap of two ranges runs from the later start to the earlier end, if that range is non-empty.'],
  [['intervals', 'two-pointers'], 2, 'Interval List Intersections (two sorted lists, two pointers): after checking an overlap, which pointer should advance?', ['Whichever interval has the smaller END — it cannot overlap anything further to the right', 'Always the first list\'s pointer', 'Always the second list\'s pointer', 'Both pointers always advance together'], 0, 'The interval ending first is fully spent; the one ending later may still overlap the next interval in the other list.'],
  [['communication'], 1, 'You finish coding a DFS over a graph with V vertices and E edges. The interviewer asks for the complexity. Best answer?', ['O(V + E) time, O(V) space for the visited set plus the recursion stack', 'O(V²) always, regardless of how many edges exist', 'O(E) time only, vertices do not matter', "O(1) — it's just recursion"], 0, 'Each vertex and edge is touched exactly once in an adjacency-list DFS or BFS.'],
  [['communication', 'constraints'], 2, 'You coded an O(n²) solution, but the constraints say n ≤ 10^6. What should you do next?', ['Say the complexity out loud, flag that it will not fit the constraint, and start sketching a faster approach', 'Submit it as-is since constraints are just suggestions', 'Stay quiet and hope the interviewer does not notice', 'Immediately restart from scratch without explaining why'], 0, 'Naming the mismatch yourself shows you can reason about scale and signals you are already moving toward a fix.'],
  [['communication'], 1, 'Before writing any code, what is most useful to do first?', ['Restate the problem in your own words and ask one or two clarifying questions about edge cases or input shape', 'Start typing the brute force immediately', 'Ask the interviewer to solve a small example for you', 'Try to recall the exact editorial solution word for word'], 0, 'Confirming the problem is understood avoids solving the wrong thing and surfaces hidden assumptions early.'],
  [['communication'], 2, 'Mid-interview, you are stuck for a minute with no idea what to try next. Best move?', ['Narrate what you have tried, what is blocking you, and ask a specific, directed question', 'Stay completely silent until something comes to you', 'Switch to a completely different problem', "Say \"I don't know\" and stop working"], 0, 'Thinking out loud turns silence into a collaborative signal and usually unblocks you faster.'],
  [['communication'], 2, 'You see the optimal approach immediately. Should you skip straight to coding it?', ['Usually mention the brute force in one sentence first and explain why it is slow, then move to the optimal idea', 'Yes — always code the optimal solution immediately with zero explanation', 'No — you must fully implement the brute force every single time', 'Ask the interviewer which one they would prefer'], 0, 'A one-line brute-force mention proves you understand the baseline, without wasting time fully implementing it.'],
  [['communication'], 1, 'The interviewer points out a bug using a specific failing example. Best reaction?', ['Thank them, trace the failing example by hand, and fix the specific line causing it', 'Defend the code as correct', 'Rewrite the entire solution from scratch', 'Ignore it and move on to the next test case'], 0, 'Targeted debugging from a concrete failing case is faster and shows composure under correction.'],
  [['communication', 'dp-2d'], 2, 'You are about to write a 2-D DP over (i, j) with 0 ≤ i < n, 0 ≤ j < m. What is worth saying before coding?', ['The state meaning (what dp[i][j] represents), the transition, and the resulting O(n·m) time and space', 'Nothing — just start typing the nested loops', 'Only where the final answer will be read from', 'The exact variable names you plan to use'], 0, 'Naming the state and transition out loud is what actually proves the DP is understood, not the code itself.'],
  [['communication'], 1, 'Time is almost up and your solution is correct but not fully optimized. What should you prioritize?', ['Keep the working, correct solution and briefly describe how you would optimize it with more time', 'Delete it and attempt a risky last-minute rewrite', 'Stay silent about any possible optimization', 'Apologize and stop working entirely'], 0, 'A correct, explained solution beats an unfinished "better" one; describing the optimization out loud still earns credit.'],
  [['dp-2d', 'bit', 'constraints'], 2, 'Shortest Path Visiting All Nodes: n ≤ 12 nodes. State space size for the bitmask BFS/DP?', ['n · 2ⁿ ≈ 12 · 4096 ≈ 49,000 states', 'n! ≈ 479 million', '2ⁿ alone, ignoring the current node', 'n² only, about 144'], 0, 'Each state pairs (current node, visited mask); n ≤ 12 keeps 2ⁿ small enough to pair with n.'],
  [['dp-2d'], 2, 'Unbounded Knapsack vs. 0/1 Knapsack: the only code difference in the 1-D rolling-array version is?', ['The direction of the inner capacity loop — forward for unbounded, backward for 0/1', 'Unbounded needs a full 2-D table, 0/1 does not', '0/1 needs the items sorted first, unbounded does not', 'They use entirely different recurrences'], 0, 'Forward iteration lets an item feed its own later update (reuse allowed); backward iteration blocks that (reuse forbidden).'],
  [['dp-1d'], 1, 'Coin Change with coins = [1, 2, 5] works fine with a greedy "always take the largest coin" rule. Why can greedy still fail on other coin sets?', ['Greedy only works for "canonical" coin systems; sets like [1, 3, 4] for amount 6 need DP to find the true optimum', 'Greedy always works for coin change, with no exceptions', 'DP is only ever needed once there are more than five coin values', 'It actually fails on [1, 2, 5] too, by coincidence'], 0, 'For coins [1, 3, 4] and amount 6, greedy gives 4 + 1 + 1 (three coins) but 3 + 3 (two coins) is optimal.'],
  [['dp-2d'], 2, "LCS of 'abcde' and 'ace' has length 3. Which subsequence achieves it?", ['"ace"', '"abc"', '"cde"', '"ae"'], 0, 'a, c, and e appear in that same relative order inside both strings.'],
  [['dp-2d'], 2, "Edit Distance from 'horse' to 'ros' is 3. Which three operations achieve it?", ['Replace h→r, then delete the extra r, then delete the e (horse → rorse → rose → ros)', 'Insert three characters only, nothing else', 'Delete all five characters, then insert three', 'It cannot actually be done in 3 operations'], 0, "horse → rorse (replace h with r) → rose (delete the stray r) → ros (delete the trailing e): three edits total."],
  [['dp-1d', 'binary-search', 'constraints'], 2, 'LIS with n up to 2×10^5. Why is the O(n log n) patience-sorting version required over the O(n²) DP?', ['O(n²) at n = 2×10^5 is roughly 4×10^10 operations — far too slow; O(n log n) is roughly 3.6 million', 'The two run at essentially the same real-world speed', 'O(n²) is actually faster once n passes 10^5', 'Patience sorting is only a theoretical trick with no real speed benefit'], 0, 'The quadratic blow-up at this scale makes the O(n²) DP infeasible within a normal time limit.'],
  [['dijkstra'], 2, "Dijkstra's algorithm with a binary heap on V vertices, E edges: time complexity?", ['O((V + E) log V)', 'O(V²), regardless of implementation', 'O(E), independent of V', 'O(V · E)'], 0, 'Each of up to E edge relaxations can trigger an O(log V) heap push or pop.'],
  [['dijkstra'], 2, 'Bellman-Ford on V vertices, E edges: time complexity?', ['O(V · E)', 'O(E log V)', 'O(V + E)', 'O(V²)'], 0, 'V − 1 relaxation rounds, each sweeping all E edges.'],
  [['dijkstra'], 2, 'Bellman-Ford: after V − 1 relaxation rounds, a Vth round still improves some distance. What does that reveal?', ['A negative-weight cycle reachable from the source exists; shortest paths are undefined for the affected nodes', 'The graph contains a self-loop only, nothing more', 'There is a bug in the implementation', 'The source node must be unreachable'], 0, 'A genuine shortest path uses at most V − 1 edges; a distance still improving past that signals an exploitable negative cycle.'],
  [['mst'], 2, "Kruskal's algorithm time complexity is dominated by?", ['Sorting the edges: O(E log E)', 'The Union-Find operations: O(E)', 'Building the adjacency list: O(V)', 'O(E²), checking every pair of edges'], 0, 'Union-Find with path compression and union by rank is close to O(1) per call; sorting E edges is the real bottleneck.'],
  [['mst', 'heap'], 2, "Prim's algorithm with a binary heap: time complexity?", ['O(E log V)', 'O(V²), regardless of implementation', 'O(E log E)', 'O(V · E)'], 0, 'Each edge can trigger a heap push; heap operations cost O(log V) with up to V nodes resident in the heap.'],
  [['union-find'], 2, 'Using Union-Find to detect a cycle while adding undirected edges one at a time: the cycle is found exactly when?', ['union(a, b) discovers that a and b already share the same root', 'The parent array becomes completely full', 'find(a) returns -1', 'The edge count exceeds V'], 0, 'If a and b are already connected, one more edge between them necessarily closes a cycle.'],
  [['topo-sort'], 1, "Kahn's algorithm (BFS topological sort): a cycle in the graph is detected when?", ['Fewer than V nodes end up in the final topological order', 'The queue never becomes empty', 'Every node starts with indegree 0', 'It always runs forever with no way to detect anything'], 0, 'Nodes stuck inside a cycle never reach indegree 0, so they are never dequeued into the order.'],
  [['constraints'], 1, 'Constraints say n ≤ 12. What does this strongly hint toward?', ['Trying all permutations or subsets: O(n!) brute force, or O(2ⁿ · n) bitmask DP', 'A single O(n) pass is already expected', 'An O(n log n) sorting-based approach', 'An O(n³) DP table'], 0, '12! ≈ 479 million and 2¹² = 4096 are both within reach; this scale is a classic signal for exhaustive search.'],
  [['constraints'], 1, 'Constraints say n ≤ 1000 and the problem compares every pair of elements. Expected complexity?', ['O(n²) ≈ 10^6 operations, comfortably fast', 'O(n) only — pairwise comparison would otherwise be impossible', 'O(2ⁿ), since pairs suggest subsets', 'O(n log n), since that fits every pair-based problem'], 0, 'A straightforward nested loop over 1000 elements fits easily inside a normal time limit.'],
  [['constraints'], 2, 'Constraints say n ≤ 10^5 and the data must be sorted or deduplicated along the way. Expected complexity?', ['O(n log n)', 'O(n²) is still fine at this scale', 'O(2ⁿ)', 'O(1)'], 0, 'O(n²) would be roughly 10^10 operations — far too slow; sorting-based O(n log n) comfortably fits 10^5.'],
  [['constraints'], 2, 'Constraints say n ≤ 10^8 with a tight time limit. Expected complexity?', ['O(n) with a small constant factor, or better', 'O(n log n) is always safe at this scale', 'O(n²) is fine as long as it has early breaks', 'O(n√n) is the standard target here'], 0, 'Even O(n log n) risks running too slow at 10^8; a single linear pass is the safer target.'],
  [['constraints', 'dp-2d'], 2, 'Constraints say both strings have length ≤ 1000 in an LCS-style string DP problem. Expected complexity?', ['O(n · m) ≈ 10^6, a 2-D DP table fits comfortably', 'O(n + m) only', 'O(n² · m²)', 'O(2ⁿ⁺ᵐ)'], 0, 'A standard O(n·m) DP table over two length-1000 strings is about a million cells.'],
  [['constraints', 'complexity'], 2, "You derive O(n log n), but the interviewer asks 'can we do better?' while constraints only say n ≤ 10^5. Best response?", ['Explain that O(n log n) already comfortably fits n ≤ 10^5, so further optimizing time is unnecessary — offer to discuss space instead', 'Panic and assume the current approach must be wrong', 'Claim O(n) is always achievable for every problem', 'Refuse to discuss optimization any further'], 0, 'Checking the achieved complexity against the actual constraint is the right way to judge whether something is "good enough."'],
]

const mcqs = mcqRows.map(([skills, difficulty, q, choices, answer, why], i) => ({
  id: `bank-graphs-dp:extra:mcq:${i + 1}`,
  skills,
  difficulty,
  q,
  ...rotate(choices, answer, (i * 7 + 2) % 4),
  why,
}))

const clozeRows = [
  [['greedy'], 'Jump Game: farthest reachable', `def canJump(nums):
    farthest = 0
    for i, num in enumerate(nums):
        if i > farthest:
            return [[False]]
        farthest = max(farthest, i + [[num]])
    return True`],
  [['greedy'], 'Gas Station: single pass', `def canCompleteCircuit(gas, cost):
    total, tank, start = 0, 0, 0
    for i in range(len(gas)):
        diff = gas[i] - cost[i]
        total += diff
        tank += diff
        if tank < 0:
            start = i + [[1]]
            tank = [[0]]
    return start if total >= 0 else -1`, 'A dip below zero rules out every start up to and including i.'],
  [['greedy', 'intervals'], 'Non-overlapping Intervals', `def eraseOverlapIntervals(intervals):
    intervals.sort(key=lambda x: x[[[1]]])
    count = 0
    end = float('-inf')
    for s, e in intervals:
        if s >= end:
            end = e
        else:
            count [[+= 1]]
    return count`, 'Sort by end time to keep the interval that frees the timeline soonest.'],
  [['greedy'], 'Partition Labels', `def partitionLabels(s):
    last = {c: i for i, c in enumerate(s)}
    result = []
    start = end = 0
    for i, c in enumerate(s):
        end = max(end, last[[[c]]])
        if i == end:
            result.append(end - start + [[1]])
            start = i + 1
    return result`],
  [['greedy'], 'Boats to Save People', `def numRescueBoats(people, limit):
    people.sort()
    i, j = 0, len(people) - 1
    boats = 0
    while i <= j:
        if people[i] + people[j] <= limit:
            i [[+= 1]]
        j -= 1
        boats += [[1]]
    return boats`],
  [['intervals'], 'Merge Intervals', `def merge(intervals):
    intervals.sort(key=lambda x: x[0])
    result = [intervals[0]]
    for s, e in intervals[1:]:
        if s <= result[-1][[[1]]]:
            result[-1][1] = max(result[-1][1], e)
        else:
            result.append([[[s, e]]])
    return result`],
  [['intervals'], 'Insert Interval', `def insert(intervals, newInterval):
    result = []
    i, n = 0, len(intervals)
    while i < n and intervals[i][1] < newInterval[0]:
        result.append(intervals[i])
        i += 1
    while i < n and intervals[i][0] <= newInterval[[[1]]]:
        newInterval = [min(newInterval[0], intervals[i][0]), max(newInterval[1], intervals[i][1])]
        i += 1
    result.append(newInterval)
    result.extend(intervals[i:])
    return result`],
  [['intervals', 'heap'], 'Meeting Rooms II with a heap', `import heapq

def minMeetingRooms(intervals):
    intervals.sort(key=lambda x: x[0])
    heap = []
    for s, e in intervals:
        if heap and heap[0] <= s:
            heapq.heappop(heap)
        heapq.heappush(heap, [[e]])
    return len(heap)`, 'Pop a freed-up room before pushing the new meeting\'s end time.'],
  [['intervals'], 'Car Pooling with a diff array', `def carPooling(trips, capacity):
    diff = [0] * 1001
    for passengers, start, end in trips:
        diff[start] += passengers
        diff[end] -= [[passengers]]
    seats = 0
    for change in diff:
        seats += change
        if seats > capacity:
            return [[False]]
    return True`],
  [['dijkstra'], 'Floyd-Warshall all-pairs shortest paths', `for k in range(n):
    for i in range(n):
        for j in range(n):
            dist[i][j] = min(dist[i][j], dist[i][[[k]]] + dist[k][j])`, 'k must be the outermost loop: it is the intermediate node every pair routes through.'],
  [['dijkstra'], 'Bellman-Ford with negative-cycle check', `def bellmanFord(n, edges, src):
    dist = [float('inf')] * n
    dist[src] = 0
    for _ in range(n - 1):
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + [[w]]
    for u, v, w in edges:
        if dist[u] + w < dist[v]:
            return [[None]]
    return dist`],
  [['mst', 'union-find'], "Kruskal's MST", `def kruskal(n, edges):
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    edges.sort(key=lambda e: e[[[2]]])
    cost = 0
    for u, v, w in edges:
        ru, rv = find(u), find(v)
        if ru != rv:
            parent[ru] = [[rv]]
            cost += w
    return cost`],
  [['dijkstra', 'heap'], "Dijkstra with a min-heap", `import heapq

def dijkstra(n, graph, src):
    dist = [float('inf')] * n
    dist[src] = 0
    heap = [(0, src)]
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue
        for v, w in graph[u]:
            nd = d + w
            if nd < dist[v]:
                dist[v] = nd
                heapq.heappush(heap, [[(nd, v)]])
    return dist`],
  [['topo-sort'], "Course Schedule via Kahn's algorithm", `from collections import deque

def canFinish(numCourses, prerequisites):
    indegree = [0] * numCourses
    graph = [[] for _ in range(numCourses)]
    for a, b in prerequisites:
        graph[b].append(a)
        indegree[a] += [[1]]
    queue = deque(i for i in range(numCourses) if indegree[i] == 0)
    seen = 0
    while queue:
        node = queue.popleft()
        seen += 1
        for nxt in graph[node]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                queue.append([[nxt]])
    return seen == numCourses`],
  [['graph-bfs'], 'Word Ladder BFS', `from collections import deque

def ladderLength(beginWord, endWord, wordList):
    words = set(wordList)
    if endWord not in words:
        return 0
    queue = deque([(beginWord, 1)])
    while queue:
        word, steps = queue.popleft()
        if word == endWord:
            return [[steps]]
        for i in range(len(word)):
            for c in 'abcdefghijklmnopqrstuvwxyz':
                nxt = word[:i] + c + word[i + 1:]
                if nxt in words:
                    words.remove(nxt)
                    queue.append((nxt, steps + [[1]]))
    return 0`],
  [['union-find'], 'Number of Provinces via Union-Find', `def findCircleNum(isConnected):
    n = len(isConnected)
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    for i in range(n):
        for j in range(i + 1, n):
            if isConnected[i][j]:
                ri, rj = find(i), find(j)
                if ri != rj:
                    parent[ri] = [[rj]]
    return len({find(x) for x in range(n)})`],
  [['dp-1d'], 'Longest Increasing Subsequence, O(n²) DP', `def lengthOfLIS(nums):
    n = len(nums)
    dp = [1] * n
    for i in range(n):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[[[j]]] + 1)
    return max(dp)`],
  [['graph-bfs', 'queue-deque'], '0-1 BFS with a deque', `from collections import deque

def zeroOneBFS(n, graph, src):
    dist = [float('inf')] * n
    dist[src] = 0
    dq = deque([src])
    while dq:
        u = dq.popleft()
        for v, w in graph[u]:
            nd = dist[u] + w
            if nd < dist[v]:
                dist[v] = nd
                if w == 0:
                    dq.appendleft([[v]])
                else:
                    dq.append([[v]])
    return dist`, 'Zero-weight edges go to the front of the deque, one-weight edges to the back.'],
]

const clozes = clozeRows.map(([skills, title, code, hint], i) => ({
  id: `bank-graphs-dp:extra:cloze:${i + 1}`,
  skills,
  title,
  code,
  ...(hint ? { hint } : {}),
}))

const parsonsRows = [
  [['greedy'], 'Jump Game II (minimum jumps)', [
    'def jump(nums):',
    '    jumps = 0',
    '    curEnd = 0',
    '    farthest = 0',
    '    for i in range(len(nums) - 1):',
    '        farthest = max(farthest, i + nums[i])',
    '        if i == curEnd:',
    '            jumps += 1',
    '            curEnd = farthest',
    '    return jumps',
  ], ['        if i == farthest:']],
  [['greedy'], 'Gas Station single pass', [
    'def canCompleteCircuit(gas, cost):',
    '    total, tank, start = 0, 0, 0',
    '    for i in range(len(gas)):',
    '        diff = gas[i] - cost[i]',
    '        total += diff',
    '        tank += diff',
    '        if tank < 0:',
    '            start = i + 1',
    '            tank = 0',
    '    return start if total >= 0 else -1',
  ], ['    return start if tank >= 0 else -1']],
  [['greedy', 'intervals'], 'Merge Intervals', [
    'def merge(intervals):',
    '    intervals.sort(key=lambda x: x[0])',
    '    result = [intervals[0]]',
    '    for s, e in intervals[1:]:',
    '        if s <= result[-1][1]:',
    '            result[-1][1] = max(result[-1][1], e)',
    '        else:',
    '            result.append([s, e])',
    '    return result',
  ], ['    intervals.sort(key=lambda x: x[1])']],
  [['intervals', 'heap'], 'Meeting Rooms II with a heap', [
    'import heapq',
    '',
    'def minMeetingRooms(intervals):',
    '    intervals.sort(key=lambda x: x[0])',
    '    heap = []',
    '    for s, e in intervals:',
    '        if heap and heap[0] <= s:',
    '            heapq.heappop(heap)',
    '        heapq.heappush(heap, e)',
    '    return len(heap)',
  ], ['        if heap and heap[0] <= e:']],
  [['intervals'], 'Insert Interval', [
    'def insert(intervals, newInterval):',
    '    result = []',
    '    i, n = 0, len(intervals)',
    '    while i < n and intervals[i][1] < newInterval[0]:',
    '        result.append(intervals[i])',
    '        i += 1',
    '    while i < n and intervals[i][0] <= newInterval[1]:',
    '        newInterval = [min(newInterval[0], intervals[i][0]), max(newInterval[1], intervals[i][1])]',
    '        i += 1',
    '    result.append(newInterval)',
    '    result.extend(intervals[i:])',
    '    return result',
  ], ['        newInterval = [intervals[i][0], intervals[i][1]]']],
  [['dijkstra', 'heap'], 'Dijkstra with a min-heap', [
    'import heapq',
    '',
    'def dijkstra(n, graph, src):',
    '    dist = [float("inf")] * n',
    '    dist[src] = 0',
    '    heap = [(0, src)]',
    '    while heap:',
    '        d, u = heapq.heappop(heap)',
    '        if d > dist[u]:',
    '            continue',
    '        for v, w in graph[u]:',
    '            nd = d + w',
    '            if nd < dist[v]:',
    '                dist[v] = nd',
    '                heapq.heappush(heap, (nd, v))',
    '    return dist',
  ], ['        if d > dist[u]:', '            break']],
  [['mst', 'union-find'], "Kruskal's MST", [
    'def kruskal(n, edges):',
    '    parent = list(range(n))',
    '    def find(x):',
    '        while parent[x] != x:',
    '            parent[x] = parent[parent[x]]',
    '            x = parent[x]',
    '        return x',
    '    edges.sort(key=lambda e: e[2])',
    '    cost = 0',
    '    for u, v, w in edges:',
    '        ru, rv = find(u), find(v)',
    '        if ru != rv:',
    '            parent[ru] = rv',
    '            cost += w',
    '    return cost',
  ], ['    edges.sort(key=lambda e: e[0])']],
  [['dijkstra'], 'Floyd-Warshall all-pairs shortest paths', [
    'def floydWarshall(n, dist):',
    '    for k in range(n):',
    '        for i in range(n):',
    '            for j in range(n):',
    '                dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])',
    '    return dist',
  ], ['                dist[i][j] = min(dist[i][j], dist[k][i] + dist[k][j])']],
  [['graph-bfs'], 'Word Ladder BFS', [
    'from collections import deque',
    '',
    'def ladderLength(beginWord, endWord, wordList):',
    '    words = set(wordList)',
    '    if endWord not in words:',
    '        return 0',
    '    queue = deque([(beginWord, 1)])',
    '    while queue:',
    '        word, steps = queue.popleft()',
    '        if word == endWord:',
    '            return steps',
    '        for i in range(len(word)):',
    '            for c in "abcdefghijklmnopqrstuvwxyz":',
    '                nxt = word[:i] + c + word[i + 1:]',
    '                if nxt in words:',
    '                    words.remove(nxt)',
    '                    queue.append((nxt, steps + 1))',
    '    return 0',
  ], ['                if nxt in wordList:']],
  [['topo-sort'], "Course Schedule via Kahn's algorithm", [
    'from collections import deque',
    '',
    'def canFinish(numCourses, prerequisites):',
    '    indegree = [0] * numCourses',
    '    graph = [[] for _ in range(numCourses)]',
    '    for a, b in prerequisites:',
    '        graph[b].append(a)',
    '        indegree[a] += 1',
    '    queue = deque(i for i in range(numCourses) if indegree[i] == 0)',
    '    seen = 0',
    '    while queue:',
    '        node = queue.popleft()',
    '        seen += 1',
    '        for nxt in graph[node]:',
    '            indegree[nxt] -= 1',
    '            if indegree[nxt] == 0:',
    '                queue.append(nxt)',
    '    return seen == numCourses',
  ], ['    return len(queue) == 0']],
]

const parsons = parsonsRows.map(([skills, title, lines, distractors], i) => ({
  id: `bank-graphs-dp:extra:parsons:${i + 1}`,
  skills,
  title,
  lines,
  ...(distractors ? { distractors } : {}),
}))

const flashcardData = [
  [['greedy'], 'Jump Game greedy core idea?', 'Track the farthest index reachable so far; if the current index ever exceeds it, you are stuck.'],
  [['greedy'], 'Jump Game II greedy (minimum jumps) idea?', "BFS-by-levels without a queue: track the current jump's reach boundary (curEnd) and the farthest seen so far; take a jump whenever i reaches curEnd."],
  [['greedy'], 'Gas Station: why does one single pass work?', 'If total gas ≥ total cost, a valid start exists; any index where the running tank goes negative can never be a valid start, so restart right after it.'],
  [['greedy'], 'Task Scheduler idle-slot formula?', '(maxFreq − 1) · (n + 1) + countOfTasksWithMaxFreq, then take the max against len(tasks) since extra non-max tasks can fill idle slots.'],
  [['greedy'], 'Candy: why two passes (left-to-right, then right-to-left)?', 'Each pass enforces only one neighbor rule; combining both with max() satisfies the left-neighbor and right-neighbor constraints at once.'],
  [['greedy'], 'Boats to Save People two-pointer greedy?', 'Sort the people; always pair the lightest with the heaviest if they fit the limit together, otherwise send the heaviest alone.'],
  [['intervals'], 'Merge Intervals core step?', 'Sort by start time; merge into the last kept interval whenever the next interval\'s start is ≤ that interval\'s current end.'],
  [['intervals', 'greedy'], 'Non-overlapping Intervals: sort key and why?', 'Sort by END time — keeping whichever interval finishes earliest leaves the most room for the rest (classic activity selection).'],
  [['intervals', 'heap'], 'Meeting Rooms II min-heap idea?', "Sort by start; push each meeting's end time to a min-heap, but first pop the heap's smallest end if it is ≤ the current meeting's start (that room just freed up)."],
  [['intervals'], 'Insert Interval: the three phases?', 'Copy every interval ending before the new one starts, merge all overlapping intervals into the new one, then copy the rest unchanged.'],
  [['intervals'], 'Car Pooling diff-array trick?', 'Add passengers at the pickup km, subtract them at the drop-off km; a running prefix sum over the array gives the occupancy at every point.'],
  [['communication'], 'How to narrate before coding?', 'State the approach in one or two sentences, name the data structure, and give the target complexity before touching the keyboard.'],
  [['communication', 'dp-2d'], 'What to say about complexity for a memoized (i, j) recursion over n × m states?', 'O(n · m) distinct states, O(1) work per state after memoization → O(n · m) time and space.'],
  [['communication'], "How to handle 'I don't remember the exact algorithm'?", 'Say what you DO know — the pattern this resembles, like "this smells like Dijkstra" — and reason from first principles instead of stalling in silence.'],
  [['communication'], 'When should edge cases be mentioned out loud?', 'Before coding: empty input, a single element, all-equal values, negatives — call out the ones actually relevant to this problem.'],
  [['communication'], 'How to recover from a bug the interviewer points out?', "Thank them, trace through the failing example by hand, and fix the specific line — don't rewrite everything from scratch."],
  [['communication'], 'Why mention the brute force first, even when you already see the optimal?', "It proves you understand the problem's correctness before optimizing, and gives a concrete baseline the optimal approach improves on."],
  [['constraints'], 'n ≤ 12–15, and the problem concerns orderings or assignments. Hint?', 'O(n!) brute force for pure permutations, or O(n² · 2ⁿ) bitmask DP once a per-subset decision is involved.'],
  [['constraints'], 'n ≤ 1000, and the problem checks every pair of elements. Hint?', 'About 10^6 operations — comfortably fast; a plain O(n²) nested loop is the expected scale here.'],
  [['constraints'], 'n ≤ 10^5, and the problem needs sorting or a hashmap lookup. Hint?', 'O(n log n) is the budget; an O(n²) pairwise comparison (around 10^10 ops) would time out.'],
  [['constraints'], 'n up to 10^8 with a tight time limit. Hint?', 'Only a linear O(n) pass (or O(n) with a small constant) fits comfortably; even O(n log n) risks being too slow here.'],
  [['dijkstra'], 'Dijkstra vs. Bellman-Ford: when to pick which?', 'Dijkstra: all edge weights ≥ 0, faster via a heap. Bellman-Ford: negative edges are allowed, and it can also detect a negative cycle.'],
  [['dijkstra'], "Floyd-Warshall's loop order?", 'k (the intermediate node) must be the outermost loop; i and j can appear in either order inside it.'],
  [['mst'], 'Kruskal vs. Prim — which complexity term dominates each?', 'Kruskal: O(E log E) from sorting all the edges. Prim with a heap: O(E log V) from one heap operation per edge relaxation.'],
  [['union-find'], 'Union-Find with no path compression and no union by rank, worst case?', 'Degenerates toward a linked list: O(n) per find or union in the worst case, instead of near-constant time.'],
]

const flashcards = flashcardData.map(([skills, front, back, code], i) => ({
  id: `bank-graphs-dp:extra:card:${i + 1}`,
  skills,
  front,
  back,
  ...(code ? { code } : {}),
}))

export default { mcqs, clozes, parsons, flashcards }
