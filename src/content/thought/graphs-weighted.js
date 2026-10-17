export default {
  id: 'graphs-weighted',
  title: 'Graphs: ordering & weighted',
  icon: 'compass',
  items: [
    {
      id: 'thought:graphs-weighted:course-schedule',
      lc: 207,
      title: 'Course Schedule',
      difficulty: 'Medium',
      category: 'graphs-weighted',
      skills: ['topo-sort', 'graph-dfs', 'graph-modeling'],
      companies: ['google', 'amazon', 'microsoft'],
      statement: `You're given n courses labeled 0 to n-1 and a list of prerequisite pairs [a, b] meaning you must finish course b before course a. Decide whether it's possible to finish every course given these dependencies.

Think of each prerequisite as a directed edge. You can finish all courses exactly when the dependency graph has no cycle — a cycle means two or more courses depend on each other in a loop, so none of them could ever go first.

Return true if an ordering exists that satisfies every prerequisite, and false if some cycle makes that impossible.`,
      examples: [
        { input: 'numCourses = 2, prerequisites = [[1,0]]', output: 'true', explanation: 'Take course 0, then course 1.' },
        { input: 'numCourses = 2, prerequisites = [[1,0],[0,1]]', output: 'false', explanation: '0 needs 1 and 1 needs 0 — a cycle.' },
      ],
      constraints: ['1 <= numCourses <= 2000', '0 <= prerequisites.length <= 5000', 'prerequisites[i].length == 2', 'All pairs are unique'],
      ds: {
        answer: 'dd(list) adjacency + array of 3 states (unvisited/visiting/visited)',
        choices: [
          'dd(list) adjacency + array of 3 states (unvisited/visiting/visited)',
          'dd(list) adjacency + set visited',
          'dd(list) indegree array + deque queue',
          'union-find parent array',
        ],
      },
      method: {
        answer: "DFS each node with 3 states; a back-edge to a visiting node means a cycle, else mark it done",
        choices: [
          "DFS each node with 3 states; a back-edge to a visiting node means a cycle, else mark it done",
          "Kahn's BFS: repeatedly pop zero-indegree nodes; a leftover node after the queue empties means a cycle",
          "DFS with a single visited set; cycle whenever we revisit any visited node",
          "Union-Find: union prerequisite pairs and check if any union creates a self-loop",
        ],
      },
      code: `class Solution:
    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
        graph = dd(list)
        for course, pre in prerequisites:
            graph[course].append(pre)

        state = [0] * numCourses

        def dfs(course):
            if state[course] == 1:
                return False
            if state[course] == 2:
                return True

            state[course] = 1
            for pre in graph[course]:
                if not dfs(pre):
                    return False
            state[course] = 2

            return True

        return all(dfs(c) for c in range(numCourses))`,
      blanks: [9, 14, 18],
      time: { answer: 'O(V+E)', choices: ['O(V+E)', 'O(V*E)', 'O(E log V)', 'O(V^2)'], why: 'Each node and edge is visited once across the whole DFS.' },
      space: { answer: 'O(V+E)', choices: ['O(V+E)', 'O(V)', 'O(E)', 'O(1)'], why: 'Adjacency list plus the state array and recursion stack.' },
      sayIt: "I run a ==DFS== per course with a 3-state array; hitting a ==visiting== node again means a cycle, so I return false, else true.",
      pitfall: 'Only tracking a single seen set instead of 3 distinct states.',
    },
    {
      id: 'thought:graphs-weighted:course-schedule-ii',
      lc: 210,
      title: 'Course Schedule II',
      difficulty: 'Medium',
      category: 'graphs-weighted',
      skills: ['topo-sort', 'queue-deque', 'graph-modeling'],
      companies: ['google', 'amazon'],
      statement: `This is the same course dependency setup as before, but now you must produce one valid order to take all n courses, not just decide if it's possible. Each prerequisite pair [a, b] still means b must come before a.

If no valid order exists because of a cycle, return an empty array instead.

A natural way to build an order is to repeatedly pick courses whose prerequisites are all already satisfied — courses with zero remaining dependencies — append them to the result, and update the dependency counts of everything that depended on them.`,
      examples: [
        { input: 'numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]', output: '[0,1,2,3] (or [0,2,1,3])', explanation: '0 has no prereqs; 1 and 2 both need 0; 3 needs both 1 and 2.' },
      ],
      constraints: ['1 <= numCourses <= 2000', '0 <= prerequisites.length <= numCourses * (numCourses - 1)', 'All prerequisite pairs are distinct'],
      ds: {
        answer: 'dd(list) adjacency + indegree array + deque queue',
        choices: [
          'dd(list) adjacency + indegree array + deque queue',
          'dd(list) adjacency + array of 3 states (unvisited/visiting/visited)',
          'dd(list) adjacency + min-heap keyed on indegree',
          'union-find parent array + rank array',
        ],
      },
      method: {
        answer: "Kahn's BFS: push all zero-indegree nodes, pop one, append to order, decrement neighbors' indegree, push any that hit zero",
        choices: [
          "Kahn's BFS: push all zero-indegree nodes, pop one, append to order, decrement neighbors' indegree, push any that hit zero",
          'DFS postorder: recurse into prereqs first, then append the current course on the way back up',
          'DFS with 3 states, returning false on a cycle and building order via preorder append',
          'Greedily sort courses by their indegree count ascending',
        ],
      },
      code: `class Solution:
    def findOrder(self, numCourses: int, prerequisites: List[List[int]]) -> List[int]:
        graph = dd(list)
        indegree = [0] * numCourses

        for course, pre in prerequisites:
            graph[pre].append(course)
            indegree[course] += 1

        queue = deque(c for c in range(numCourses) if indegree[c] == 0)
        order = []

        while queue:
            node = queue.popleft()
            order.append(node)

            for nxt in graph[node]:
                indegree[nxt] -= 1
                if indegree[nxt] == 0:
                    queue.append(nxt)

        return order if len(order) == numCourses else []`,
      blanks: [7, 17, 19],
      accept: { '7': ['indegree[course] = indegree[course] + 1'] },
      time: { answer: 'O(V+E)', choices: ['O(V+E)', 'O(V*E)', 'O(E log V)', 'O(V^2)'], why: 'Each node dequeued once, each edge relaxed once.' },
      space: { answer: 'O(V+E)', choices: ['O(V+E)', 'O(V)', 'O(E)', 'O(1)'], why: 'Adjacency list, indegree array, and the queue.' },
      sayIt: "==Kahn's algorithm==: start from zero-indegree courses, pop and append to order, decrementing neighbors until the queue drains.",
      pitfall: 'Forgetting to check order length equals numCourses to catch a cycle.',
    },
    {
      id: 'thought:graphs-weighted:alien-dictionary',
      lc: 269,
      title: 'Alien Dictionary',
      difficulty: 'Hard',
      category: 'graphs-weighted',
      skills: ['topo-sort', 'graph-dfs', 'graph-modeling'],
      companies: ['google', 'amazon', 'meta'],
      statement: `You're given a list of words from an alien language, already sorted according to that language's unknown alphabet order. From the order the words appear in, figure out one valid ordering of the letters themselves, or report that no valid ordering exists.

Compare each pair of neighboring words letter by letter. The first position where they differ tells you that one letter must come before the other in the alien alphabet — that's a directed edge. If one word is a prefix of the next but appears after it, the order is already broken and no answer is possible.

Once you've built this letter-ordering graph, a valid alphabet is just a topological sort of it; if the graph has a cycle, no valid alphabet exists.`,
      examples: [
        { input: 'words = ["wrt","wrf","er","ett","rftt"]', output: '"wertf"', explanation: 'Comparing adjacent words gives edges w<e, r<t, t<f, e<r.' },
        { input: 'words = ["z","x","z"]', output: '""', explanation: 'z<x and x<z contradict each other — a cycle.' },
      ],
      constraints: ['1 <= words.length <= 100', '1 <= words[i].length <= 100', 'words[i] consists of lowercase English letters'],
      ds: {
        answer: 'dd(set) adjacency over letters + dict of 3 states for DFS',
        choices: [
          'dd(set) adjacency over letters + dict of 3 states for DFS',
          'dd(list) adjacency over letters + indegree array + deque queue',
          'Counter of letter frequencies + sort by count',
          'trie of all words + DFS over trie nodes',
        ],
      },
      method: {
        answer: 'Build edges from the first differing letter of each adjacent word pair, then postorder DFS each letter with 3 states, appending to result on the way back up and reversing at the end',
        choices: [
          'Build edges from the first differing letter of each adjacent word pair, then postorder DFS each letter with 3 states, appending to result on the way back up and reversing at the end',
          "Kahn's BFS: compute indegree per letter, repeatedly pop and append zero-indegree letters",
          'Sort the letters by their first appearance across all words',
          'DFS preorder: append each letter the moment we first visit it, no reversal needed',
        ],
      },
      code: `class Solution:
    def foreignDictionary(self, words: List[str]) -> str:
        letters = {c for w in words for c in w}
        graph = dd(set)
        for first, second in zip(words, words[1:]):
            n = min(len(first), len(second))
            if len(first) > len(second) and first[:n] == second[:n]:
                return ""
            for i in range(n):
                if first[i] != second[i]:
                    graph[first[i]].add(second[i])
                    break
        state = {}
        order = []
        def dfs(c):
            if c in state:
                return state[c]
            state[c] = True
            for nxt in graph[c]:
                if dfs(nxt):
                    return True
            state[c] = False
            order.append(c)
            return False
        for c in letters:
            if dfs(c):
                return ""
        return "".join(reversed(order))`,
      blanks: [10, 17, 22],
      time: { answer: 'O(C)', choices: ['O(C)', 'O(C^2)', 'O(W^2)', 'O(26 * C)'], why: 'C = total letters across words; the letter graph itself is tiny (<=26 nodes).' },
      space: { answer: 'O(1)', choices: ['O(1)', 'O(C)', 'O(W)', 'O(C^2)'], why: 'Graph, state dict, and recursion are bounded by the <=26-letter alphabet.' },
      sayIt: 'Build a letter graph from each adjacent word pair\'s first difference, then postorder DFS with cycle detection to topologically sort the letters.',
      pitfall: 'Forgetting the longer-word-after-its-prefix case is an invalid order.',
    },
    {
      id: 'thought:graphs-weighted:network-delay-time',
      lc: 743,
      title: 'Network Delay Time',
      difficulty: 'Medium',
      category: 'graphs-weighted',
      skills: ['dijkstra', 'heap', 'graph-modeling'],
      companies: ['google', 'amazon'],
      statement: `A network has n nodes labeled 1 to n. You're given directed edges times[i] = [u, v, w] meaning a signal takes w time units to travel from node u to node v. A signal starts at node k and needs to reach every other node.

Find the minimum time for the signal sent from k to reach all n nodes. If some node is unreachable, return -1 instead.

This is a shortest-path problem with positive weights, so track the shortest known distance to each node and always expand from the closest unvisited node next.`,
      examples: [
        { input: 'times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2', output: '2', explanation: 'From node 2: nodes 1 and 3 reached at time 1, node 4 reached at time 2.' },
      ],
      constraints: ['1 <= k <= n <= 100', '1 <= times.length <= 6000', '1 <= u, v <= n', '0 <= w <= 100', 'All (u, v) pairs are unique'],
      ds: {
        answer: 'dd(list) adjacency + min-heap of (dist, node) + seen set',
        choices: [
          'dd(list) adjacency + min-heap of (dist, node) + seen set',
          'dd(list) adjacency + deque queue + visited set',
          '2-D dp table of distances between every pair',
          'dd(list) adjacency + dist dict, relax every edge V-1 times',
        ],
      },
      method: {
        answer: 'Dijkstra: pop the closest (dist, node) from a min-heap, skip if already finalized, otherwise relax each neighbor by pushing (dist + weight, neighbor)',
        choices: [
          'Dijkstra: pop the closest (dist, node) from a min-heap, skip if already finalized, otherwise relax each neighbor by pushing (dist + weight, neighbor)',
          'BFS layer by layer from k, counting the number of hops to reach every node',
          'Bellman-Ford: relax every edge n-1 times, taking the minimum each round',
          'DFS from k, tracking the running path sum and taking the min over all root-to-node paths',
        ],
      },
      code: `class Solution:
    def networkDelayTime(self, times: List[List[int]], n: int, k: int) -> int:
        graph = dd(list)
        for u, v, w in times:
            graph[u].append((v, w))

        heap = [(0, k)]
        seen = set()
        maxTime = 0

        while heap:
            dist, node = heapq.heappop(heap)
            if node in seen:
                continue
            seen.add(node)
            maxTime = max(maxTime, dist)

            for nxt, w in graph[node]:
                if nxt not in seen:
                    heapq.heappush(heap, (dist + w, nxt))

        return maxTime if len(seen) == n else -1`,
      blanks: [12, 15, 19],
      accept: { '15': ['maxTime = max(dist, maxTime)'] },
      time: { answer: 'O(E log V)', choices: ['O(E log V)', 'O(V^2)', 'O(V+E)', 'O(V * E)'], why: 'Each edge may push to the heap once; heap ops cost log V.' },
      space: { answer: 'O(V+E)', choices: ['O(V+E)', 'O(V)', 'O(E)', 'O(V^2)'], why: 'Adjacency list plus a heap that can hold up to E entries.' },
      sayIt: "Dijkstra from k with a min-heap of (distance, node); pop the closest unfinalized node each time and relax its edges.",
      pitfall: 'Not skipping a node already finalized lets a stale heap entry overwrite the answer.',
    },
    {
      id: 'thought:graphs-weighted:path-with-minimum-effort',
      lc: 1631,
      title: 'Path With Minimum Effort',
      difficulty: 'Medium',
      category: 'graphs-weighted',
      skills: ['dijkstra', 'heap', 'grid'],
      companies: ['google', 'amazon'],
      statement: `You're given a 2-D grid of heights. You start at the top-left cell and must reach the bottom-right cell, moving only up/down/left/right. The effort of a route is the maximum absolute height difference between any two consecutive cells on that route, not the sum.

Find the route that minimizes this maximum step, and return that minimum possible effort.

This is a shortest-path variant where instead of summing edge weights you take the max along the path, then minimize that max over all paths — a classic Dijkstra-style minimax on an implicit grid graph.`,
      examples: [
        { input: 'heights = [[1,2,2],[3,8,2],[5,3,5]]', output: '2', explanation: 'Going right, right, down, down keeps every step difference at most 2.' },
      ],
      constraints: ['1 <= rows, cols <= 100', '1 <= heights[i][j] <= 10^6'],
      ds: {
        answer: 'min-heap of (effort, row, col) + 2-D effort grid',
        choices: [
          'min-heap of (effort, row, col) + 2-D effort grid',
          'dd(list) adjacency + deque queue + visited grid',
          'monotonic stack of indices + 2-D visited grid',
          '2-D dp table filled bottom-up',
        ],
      },
      method: {
        answer: 'Dijkstra minimax: pop the cell with smallest max-effort-so-far from a heap, and relax each neighbor with max(currentEffort, heightDiff) instead of a sum',
        choices: [
          'Dijkstra minimax: pop the cell with smallest max-effort-so-far from a heap, and relax each neighbor with max(currentEffort, heightDiff) instead of a sum',
          'Binary search the answer, then BFS/DFS to check if a path exists using only steps <= that effort',
          'BFS level by level, effort equals the number of hops to reach the bottom-right',
          'DFS with backtracking, trying every path and taking the minimum max-step seen',
        ],
      },
      code: `class Solution:
    def minimumEffortPath(self, heights: List[List[int]]) -> int:
        rows, cols = len(heights), len(heights[0])
        effort = [[math.inf] * cols for _ in range(rows)]
        effort[0][0] = 0
        heap = [(0, 0, 0)]

        while heap:
            curr, r, c = heapq.heappop(heap)
            if r == rows - 1 and c == cols - 1:
                return curr

            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols:
                    nextEffort = max(curr, abs(heights[nr][nc] - heights[r][c]))
                    if nextEffort < effort[nr][nc]:
                        effort[nr][nc] = nextEffort
                        heapq.heappush(heap, (nextEffort, nr, nc))

        return 0`,
      blanks: [15, 16, 18],
      accept: { '15': ['nextEffort = max(curr, abs(heights[r][c] - heights[nr][nc]))'] },
      time: { answer: 'O(R*C log(R*C))', choices: ['O(R*C log(R*C))', 'O(R*C)', 'O((R*C)^2)', 'O(R+C)'], why: 'Each cell can be pushed multiple times onto a heap of up to R*C entries.' },
      space: { answer: 'O(R*C)', choices: ['O(R*C)', 'O(R+C)', 'O(1)', 'O(R^2*C^2)'], why: 'The effort grid and heap both scale with the number of cells.' },
      sayIt: 'Dijkstra minimax on the grid: relax each neighbor with max(currentEffort, heightDiff) instead of summing, popping the smallest-effort cell first.',
      pitfall: 'Summing height differences along the path instead of taking the max.',
    },
    {
      id: 'thought:graphs-weighted:swim-in-rising-water',
      lc: 778,
      title: 'Swim in Rising Water',
      difficulty: 'Hard',
      category: 'graphs-weighted',
      skills: ['dijkstra', 'heap', 'grid'],
      companies: ['google'],
      statement: `You're given an n x n grid where cell (i, j) has an elevation. At time t, water has risen to level t, so you can only stand on a cell once the water level is at least that cell's elevation. You start at the top-left cell at time 0 and want to reach the bottom-right cell, moving to any of the 4 adjacent cells.

Find the minimum time t at which a path from start to end exists.

Equivalently, over every path from start to end, a path's cost is the highest elevation cell on it; you want the path that minimizes that highest elevation — expand outward from the start and always surface the lowest-elevation frontier cell next.`,
      examples: [
        { input: 'grid = [[0,2],[1,3]]', output: '3', explanation: 'You must eventually step on the cell with elevation 3 to reach the bottom-right.' },
      ],
      constraints: ['1 <= n <= 50', '0 <= grid[i][j] < n^2', 'Every value in grid is unique'],
      ds: {
        answer: 'min-heap of (elevation, row, col) + 2-D visited grid',
        choices: [
          'min-heap of (elevation, row, col) + 2-D visited grid',
          'dd(list) adjacency + deque queue + visited grid',
          'binary search over time + BFS visited grid per check',
          'monotonic stack of elevations + 2-D visited grid',
        ],
      },
      method: {
        answer: 'Greedy heap expansion: always pop the lowest-elevation reachable cell next, track the running max elevation seen, stop once the end cell is popped',
        choices: [
          'Greedy heap expansion: always pop the lowest-elevation reachable cell next, track the running max elevation seen, stop once the end cell is popped',
          'Binary search the answer time t, then BFS/DFS to check if start can reach end using only cells <= t',
          'BFS level by level from the start, answer is the number of hops to reach the end',
          'DP over cells in elevation order, each cell\'s answer is the min of its neighbors\' answers',
        ],
      },
      code: `class Solution:
    def swimInWater(self, grid: List[List[int]]) -> int:
        n = len(grid)
        seen = {(0, 0)}
        heap = [(grid[0][0], 0, 0)]
        ans = 0

        while heap:
            height, r, c = heapq.heappop(heap)
            ans = max(ans, height)
            if r == n - 1 and c == n - 1:
                return ans

            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < n and 0 <= nc < n and (nr, nc) not in seen:
                    seen.add((nr, nc))
                    heapq.heappush(heap, (grid[nr][nc], nr, nc))

        return ans`,
      blanks: [9, 16, 17],
      time: { answer: 'O(n^2 log n)', choices: ['O(n^2 log n)', 'O(n^4)', 'O(n^2)', 'O(n^2 * 2^n)'], why: 'Each of n^2 cells pushed once to a heap of size up to n^2.' },
      space: { answer: 'O(n^2)', choices: ['O(n^2)', 'O(n)', 'O(1)', 'O(n^3)'], why: 'Visited set and heap both scale with the number of cells.' },
      sayIt: 'Greedy heap expansion from the start: always surface the lowest unvisited cell next and track the running max elevation until the end pops.',
      pitfall: 'Marking visited after popping instead of before pushing causes duplicate heap entries.',
    },
    {
      id: 'thought:graphs-weighted:cheapest-flights-within-k-stops',
      lc: 787,
      title: 'Cheapest Flights Within K Stops',
      difficulty: 'Medium',
      category: 'graphs-weighted',
      skills: ['graph-modeling', 'dp-1d'],
      companies: ['google', 'amazon'],
      statement: `There are n cities connected by flights, each with a cost. You're given a starting city src, a destination dst, and a cap k on the number of stops (intermediate cities) you're allowed to use. Find the cheapest price to get from src to dst using at most k stops, or -1 if it's not possible within that limit.

Because there's a hard cap on the number of edges in the path (at most k+1 edges), a plain Dijkstra isn't safe here — it could lock in a cheaper but longer route before a more expensive, shorter-hop route gets a chance.

Instead, relax every edge exactly k+1 times, each round only using distances fixed by the previous round. This is Bellman-Ford limited to k+1 rounds, which naturally caps the number of edges used per path.`,
      examples: [
        { input: 'n = 4, flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src = 0, dst = 3, k = 1', output: '700', explanation: '0 -> 1 -> 3 costs 700 with one stop; the cheaper 0->1->2->3 route needs 2 stops.' },
      ],
      constraints: ['1 <= n <= 100', '0 <= flights.length <= (n * (n-1)) / 2', '0 <= src, dst, k < n', 'src != dst'],
      ds: {
        answer: 'dist array of size n + relax all edges k+1 times',
        choices: [
          'dist array of size n + relax all edges k+1 times',
          'dd(list) adjacency + min-heap of (cost, stops, node)',
          'dd(list) adjacency + deque queue, BFS layer by layer',
          '2-D dp table of [city][stops]',
        ],
      },
      method: {
        answer: 'Bellman-Ford capped at k+1 rounds: each round relax every flight edge using a snapshot of the previous round\'s distances, so a path never uses more than k+1 edges',
        choices: [
          "Bellman-Ford capped at k+1 rounds: each round relax every flight edge using a snapshot of the previous round's distances, so a path never uses more than k+1 edges",
          'Dijkstra with a (cost, stops, node) heap state, popping the cheapest first',
          'Plain Dijkstra on cost, ignoring stop count entirely',
          'DFS exploring every path up to depth k+1, tracking the minimum cost',
        ],
      },
      code: `class Solution:
    def findCheapestPrice(self, n: int, flights: List[List[int]], src: int, dst: int, k: int) -> int:
        dist = [math.inf] * n
        dist[src] = 0

        for _ in range(k + 1):
            nextDist = dist[:]
            for u, v, price in flights:
                if dist[u] + price < nextDist[v]:
                    nextDist[v] = dist[u] + price
            dist = nextDist

        return dist[dst] if dist[dst] != math.inf else -1`,
      blanks: [6, 8, 10],
      accept: { '8': ['if price + dist[u] < nextDist[v]:'] },
      time: { answer: 'O(k * E)', choices: ['O(k * E)', 'O(E log V)', 'O(V * E)', 'O(E)'], why: 'k+1 rounds, each relaxing every edge once.' },
      space: { answer: 'O(V)', choices: ['O(V)', 'O(E)', 'O(V*E)', 'O(V+E)'], why: 'Just the current and next distance arrays, sized by city count.' },
      sayIt: "Bellman-Ford capped at k+1 rounds: snapshot the distance array each round so a city's new cost only uses last round's values.",
      pitfall: 'Updating dist in place instead of a snapshot lets a path sneak in extra edges.',
    },
    {
      id: 'thought:graphs-weighted:min-cost-to-connect-all-points',
      lc: 1584,
      title: 'Min Cost to Connect All Points',
      difficulty: 'Medium',
      category: 'graphs-weighted',
      skills: ['mst', 'heap', 'graph-modeling'],
      companies: ['google', 'amazon'],
      statement: `You're given n points on a 2-D plane. The cost to connect any two points is the Manhattan distance between them. Find the minimum total cost to connect all n points so that every point can reach every other point, directly or through others.

This is a minimum spanning tree problem on a complete graph where every pair of points has an implicit edge — you don't build the graph explicitly, you compute distances on demand.

Grow the tree one point at a time: start from any point, and repeatedly add whichever unconnected point is closest to the current tree, using a heap to always have the next-cheapest edge ready.`,
      examples: [
        { input: 'points = [[0,0],[2,2],[3,10],[5,2],[7,0]]', output: '20', explanation: 'Connecting via Manhattan distances in the cheapest tree sums to 20.' },
      ],
      constraints: ['1 <= points.length <= 1000', '-10^6 <= xi, yi <= 10^6', 'All pairs of points are distinct'],
      ds: {
        answer: "min-heap of (dist, point) + seen set, grown one point at a time (Prim's)",
        choices: [
          "min-heap of (dist, point) + seen set, grown one point at a time (Prim's)",
          "union-find parent array + sort all edges by weight (Kruskal's)",
          'dd(list) adjacency + deque queue + visited set',
          '2-D dp table of pairwise distances',
        ],
      },
      method: {
        answer: "Prim's: maintain a heap of (distance-to-tree, point); repeatedly pop the closest unconnected point, add its cost to the total, then push fresh distances from it to every point not yet in the tree",
        choices: [
          "Prim's: maintain a heap of (distance-to-tree, point); repeatedly pop the closest unconnected point, add its cost to the total, then push fresh distances from it to every point not yet in the tree",
          "Kruskal's: sort every pairwise edge by weight, union-find to add edges that don't create a cycle until all points connect",
          'Dijkstra from point 0, summing shortest-path distances to every other point',
          'BFS from point 0, cost is the number of hops times average edge weight',
        ],
      },
      code: `class Solution:
    def minCostConnectPoints(self, points: List[List[int]]) -> int:
        n = len(points)
        seen = set()
        heap = [(0, 0)]
        total = 0

        while len(seen) < n:
            dist, i = heapq.heappop(heap)
            if i in seen:
                continue
            seen.add(i)
            total += dist

            for j in range(n):
                if j not in seen:
                    nd = abs(points[i][0] - points[j][0]) + abs(points[i][1] - points[j][1])
                    heapq.heappush(heap, (nd, j))

        return total`,
      blanks: [9, 12, 17],
      accept: { '12': ['total = total + dist'] },
      time: { answer: 'O(n^2 log n)', choices: ['O(n^2 log n)', 'O(n^2)', 'O(n log n)', 'O(n^3)'], why: 'Up to n points each pushed up to n times onto the heap.' },
      space: { answer: 'O(n^2)', choices: ['O(n^2)', 'O(n)', 'O(n log n)', 'O(1)'], why: 'The heap can hold up to n pushes per point in the worst case.' },
      sayIt: "Prim's: grow the tree by always popping the closest unconnected point from a heap, then pushing fresh distances to every point still outside the tree.",
      pitfall: 'Forgetting to skip a point already added when its stale heap entry resurfaces.',
    },
    {
      id: 'thought:graphs-weighted:redundant-connection',
      lc: 684,
      title: 'Redundant Connection',
      difficulty: 'Medium',
      category: 'graphs-weighted',
      skills: ['union-find', 'graph-modeling'],
      companies: ['google', 'amazon'],
      statement: `You're given a list of edges that describe a graph which started as a tree on n nodes, then had exactly one extra edge added, creating a single cycle. Find that extra edge — the one you could remove to get back to a tree.

If multiple edges could be removed to break the cycle, return the one that appears last in the input list.

Process edges in order and union their two endpoints. The first edge whose two endpoints are already in the same component is the redundant one — adding it is what created the cycle.`,
      examples: [
        { input: 'edges = [[1,2],[1,3],[2,3]]', output: '[2,3]', explanation: '1-2 and 1-3 already connect everything; 2-3 closes a cycle.' },
      ],
      constraints: ['3 <= n <= 1000', 'edges.length == n', '1 <= ai, bi <= n', 'ai != bi'],
      ds: {
        answer: 'union-find parent array + rank array',
        choices: [
          'union-find parent array + rank array',
          'dd(list) adjacency + 3-state DFS cycle check per edge',
          'dd(list) adjacency + deque queue + visited set',
          'monotonic stack of edge weights',
        ],
      },
      method: {
        answer: 'Union-Find: for each edge union its two endpoints; the first edge whose endpoints already share a root is the one to return',
        choices: [
          'Union-Find: for each edge union its two endpoints; the first edge whose endpoints already share a root is the one to return',
          'Build the graph then DFS from each node looking for a back edge to find the cycle',
          "Kahn's topological sort, the leftover node with nonzero indegree reveals the cycle",
          'Sort edges and remove the largest-weight edge first until the graph becomes a tree',
        ],
      },
      code: `class Solution:
    def findRedundantConnection(self, edges: List[List[int]]) -> List[int]:
        n = len(edges)
        parent = list(range(n + 1))
        rank = [1] * (n + 1)

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        for a, b in edges:
            ra, rb = find(a), find(b)
            if ra == rb:
                return [a, b]

            if rank[ra] < rank[rb]:
                ra, rb = rb, ra
            parent[rb] = ra
            rank[ra] += rank[rb]`,
      blanks: [14, 15, 19],
      time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(n^2 log n)'], why: 'Near-constant find/union with path compression and union by rank.' },
      space: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(1)', 'O(n^2)'], why: 'Parent and rank arrays sized by the number of nodes.' },
      sayIt: 'Union-Find over the edges in order; the first edge whose two endpoints already share a root is the redundant one to return.',
      pitfall: 'Forgetting path compression or union by rank degrades find to O(n) per call.',
    },
    {
      id: 'thought:graphs-weighted:accounts-merge',
      lc: 721,
      title: 'Accounts Merge',
      difficulty: 'Medium',
      category: 'graphs-weighted',
      skills: ['union-find', 'arrays-hashing', 'graph-modeling'],
      companies: ['google', 'amazon', 'meta'],
      statement: `You're given a list of accounts, each a list starting with a name followed by emails belonging to that account. Two accounts belong to the same person if they share at least one email, even transitively through a chain of accounts.

Merge all accounts that belong to the same person into one, combining all their emails (sorted) under that person's name, and return the merged list in any order.

Treat each account as a node and each shared email as gluing two accounts together — union accounts that share any email, then gather every email that ends up in the same group.`,
      examples: [
        { input: 'accounts = [["John","johnsmith@mail.com","john_newyork@mail.com"],["John","johnsmith@mail.com","john00@mail.com"],["Mary","mary@mail.com"],["John","johnny@mail.com"]]', output: '[["John","john00@mail.com","john_newyork@mail.com","johnsmith@mail.com"],["Mary","mary@mail.com"],["John","johnny@mail.com"]]', explanation: 'The first two John accounts share johnsmith@mail.com so they merge; the third John is unrelated.' },
      ],
      constraints: ['1 <= accounts.length <= 1000', '2 <= accounts[i].length <= 10', '1 <= accounts[i][j].length <= 30'],
      ds: {
        answer: 'union-find parent array by account index + dd(list) email-to-indices map',
        choices: [
          'union-find parent array by account index + dd(list) email-to-indices map',
          'dd(list) adjacency between emails + DFS collecting connected emails',
          'dd(set) grouping by name + sort emails within each name group',
          'trie of emails + DFS over trie branches',
        ],
      },
      method: {
        answer: 'Union-Find by account index: for each account, union it with every other account index that already owns one of its emails using a first-seen owner map, then group accounts by root and collect+sort their emails',
        choices: [
          'Union-Find by account index: for each account, union it with every other account index that already owns one of its emails using a first-seen owner map, then group accounts by root and collect+sort their emails',
          'DFS treating emails as graph nodes: build an email-to-email adjacency list from shared accounts and DFS each connected component',
          'Group accounts by name first, then merge any two with the same name',
          'Sort all emails, then merge adjacent accounts whose email ranges overlap',
        ],
      },
      code: `class Solution:
    def accountsMerge(self, accounts: List[List[str]]) -> List[List[str]]:
        n = len(accounts)
        parent = list(range(n))
        owner = {}

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        def union(a, b):
            ra, rb = find(a), find(b)
            if ra != rb:
                parent[ra] = rb

        for i, account in enumerate(accounts):
            for email in account[1:]:
                if email in owner:
                    union(i, owner[email])
                owner[email] = i

        groups = dd(set)
        for email, i in owner.items():
            groups[find(i)].add(email)

        return [[accounts[root][0]] + sorted(emails) for root, emails in groups.items()]`,
      blanks: [20, 21, 25],
      time: { answer: 'O(N log N)', choices: ['O(N log N)', 'O(N^2)', 'O(N)', 'O(N * n)'], why: 'N = total emails; union-find is near constant, sorting each group dominates.' },
      space: { answer: 'O(N)', choices: ['O(N)', 'O(n^2)', 'O(1)', 'O(N log N)'], why: 'Parent array, owner map, and grouped email sets scale with total emails.' },
      sayIt: 'Union-find by account index: union any two accounts sharing an email via a first-seen owner map, then group and sort emails by root.',
      pitfall: 'Grouping by name instead of union-find root merges unrelated same-named people.',
    },
    {
      id: 'thought:graphs-weighted:is-graph-bipartite',
      lc: 785,
      title: 'Is Graph Bipartite?',
      difficulty: 'Medium',
      category: 'graphs-weighted',
      skills: ['graph-bfs', 'queue-deque', 'graph-modeling'],
      companies: ['google', 'meta'],
      statement: `You're given an undirected graph as an adjacency list. A graph is bipartite if you can split its nodes into two groups so that every edge connects a node in one group to a node in the other — no edge stays within a group.

Determine whether the given graph is bipartite. The graph may not be connected, so you need to check every component.

A standard way is to 2-color the graph with BFS: color the start node, then force every neighbor to the opposite color; if a neighbor is already colored the same as the current node, the graph isn't bipartite.`,
      examples: [
        { input: 'graph = [[1,2,3],[0,2],[0,1,3],[0,2]]', output: 'false', explanation: 'Nodes 0,1,2 form an odd cycle (triangle), so no valid 2-coloring exists.' },
        { input: 'graph = [[1,3],[0,2],[1,3],[0,2]]', output: 'true', explanation: 'Colors alternate cleanly around the even cycle 0-1-2-3-0.' },
      ],
      constraints: ['1 <= graph.length <= 100', '0 <= graph[i].length < graph.length', 'graph[i] does not contain i or duplicates'],
      ds: {
        answer: 'dd(list) adjacency (given) + color dict + deque queue',
        choices: [
          'dd(list) adjacency (given) + color dict + deque queue',
          'dd(list) adjacency + union-find, same-set check per edge',
          'dd(list) adjacency + 3-state DFS stack',
          '2-D grid of pairwise colors',
        ],
      },
      method: {
        answer: 'BFS 2-coloring: color the start node, push its neighbors with the opposite color, and return false the moment a neighbor is already colored the same as the current node',
        choices: [
          'BFS 2-coloring: color the start node, push its neighbors with the opposite color, and return false the moment a neighbor is already colored the same as the current node',
          'Union-Find: union every pair of nodes two hops apart, bipartite if no node ends up unioned with itself',
          'DFS computing depth from the root, bipartite if every edge connects nodes of different depth parity without recoloring',
          'Topologically sort the graph, bipartite if the sort succeeds without a cycle',
        ],
      },
      code: `class Solution:
    def isBipartite(self, graph: List[List[int]]) -> bool:
        n = len(graph)
        color = {}

        for start in range(n):
            if start in color:
                continue

            color[start] = 0
            queue = deque([start])

            while queue:
                node = queue.popleft()
                for nxt in graph[node]:
                    if nxt not in color:
                        color[nxt] = 1 - color[node]
                        queue.append(nxt)
                    elif color[nxt] == color[node]:
                        return False

        return True`,
      blanks: [16, 18, 19],
      accept: { '16': ['color[nxt] = (color[node] + 1) % 2'] },
      time: { answer: 'O(V+E)', choices: ['O(V+E)', 'O(V*E)', 'O(V^2)', 'O(E log V)'], why: 'Standard BFS visits each node and edge once.' },
      space: { answer: 'O(V)', choices: ['O(V)', 'O(V+E)', 'O(E)', 'O(1)'], why: 'Color map and queue are both bounded by the number of nodes.' },
      sayIt: "BFS 2-color each component: force every neighbor to the opposite color, failing the moment a neighbor already shares the current node's color.",
      pitfall: 'Forgetting the graph can be disconnected and only checking one component.',
    },
    {
      id: 'thought:graphs-weighted:possible-bipartition',
      lc: 886,
      title: 'Possible Bipartition',
      difficulty: 'Medium',
      category: 'graphs-weighted',
      skills: ['graph-dfs', 'graph-modeling'],
      companies: ['google'],
      statement: `You have n people numbered 1 to n and a list of dislike pairs. You need to split everyone into two groups so that no two people who dislike each other end up in the same group.

Return true if such a split is possible, and false otherwise.

This is the same 2-coloring problem as graph bipartiteness, just phrased through people and dislikes instead of nodes and edges — build the dislike graph, then try to 2-color it, this time with DFS.`,
      examples: [
        { input: 'n = 4, dislikes = [[1,2],[1,3],[2,4]]', output: 'true', explanation: 'Group {1,4} and {2,3} satisfy every dislike pair.' },
        { input: 'n = 3, dislikes = [[1,2],[1,3],[2,3]]', output: 'false', explanation: '1, 2, 3 mutually dislike each other — an odd cycle (triangle).' },
      ],
      constraints: ['1 <= n <= 2000', '0 <= dislikes.length <= 10^4', 'dislikes[i].length == 2', '1 <= dislikes[i][j] <= n'],
      ds: {
        answer: 'dd(list) adjacency + color dict + recursive DFS',
        choices: [
          'dd(list) adjacency + color dict + recursive DFS',
          'dd(list) adjacency + color dict + deque queue',
          'union-find parent array, union every disliked pair',
          'dd(list) adjacency + 3-state DFS cycle check (like course schedule)',
        ],
      },
      method: {
        answer: 'DFS 2-coloring: color the current person, recurse into every disliked neighbor forcing the opposite color, and bubble up false the moment a neighbor already matches the current color',
        choices: [
          'DFS 2-coloring: color the current person, recurse into every disliked neighbor forcing the opposite color, and bubble up false the moment a neighbor already matches the current color',
          'BFS 2-coloring: push neighbors level by level instead of recursing',
          'Union-Find: union every pair of people who share a disliker, bipartite fails if two dislikers end up unioned',
          'Sort people by number of dislikes and greedily assign the less-conflicted group first',
        ],
      },
      code: `class Solution:
    def possibleBipartition(self, n: int, dislikes: List[List[int]]) -> bool:
        graph = dd(list)
        for a, b in dislikes:
            graph[a].append(b)
            graph[b].append(a)

        color = {}

        def dfs(person, c):
            if person in color:
                return color[person] == c

            color[person] = c
            return all(dfs(nxt, 1 - c) for nxt in graph[person])

        return all(dfs(p, 0) for p in range(1, n + 1) if p not in color)`,
      blanks: [11, 13, 14],
      time: { answer: 'O(V+E)', choices: ['O(V+E)', 'O(V*E)', 'O(V^2)', 'O(E log V)'], why: 'DFS visits each person and each dislike edge once.' },
      space: { answer: 'O(V+E)', choices: ['O(V+E)', 'O(V)', 'O(E)', 'O(1)'], why: 'Adjacency list, color map, and recursion stack scale with people and dislikes.' },
      sayIt: "DFS 2-color the dislike graph: force every disliked neighbor to the opposite color, bubbling up false on a color conflict.",
      pitfall: 'Not re-checking an already-colored neighbor against the expected color.',
    },
    {
      id: 'thought:graphs-weighted:find-eventual-safe-states',
      lc: 802,
      title: 'Find Eventual Safe States',
      difficulty: 'Medium',
      category: 'graphs-weighted',
      skills: ['graph-dfs', 'graph-modeling'],
      companies: ['google'],
      statement: `You're given a directed graph as an adjacency list. A node is terminal if it has no outgoing edges. A node is safe if every possible path starting from it eventually ends at a terminal node — no matter which path you take, you can never get stuck in a cycle.

Return all safe nodes, sorted in ascending order.

This is a cycle-detection problem again: a node is unsafe exactly when some path from it reaches a cycle. Run a 3-state DFS from every node, memoizing each node's safety once it's known so you don't redo work.`,
      examples: [
        { input: 'graph = [[1,2],[2,3],[5],[0],[5],[],[]]', output: '[2,4,5,6]', explanation: 'Nodes 2, 4, 5, 6 only ever reach terminal nodes; 0, 1, 3 are stuck in a cycle.' },
      ],
      constraints: ['1 <= graph.length <= 10^4', '0 <= graph[i].length <= graph.length', 'The graph may contain self-loops'],
      ds: {
        answer: 'dd(list) adjacency (given) + array of 3 states (unvisited/visiting/safe) memoized',
        choices: [
          'dd(list) adjacency (given) + array of 3 states (unvisited/visiting/safe) memoized',
          'dd(list) adjacency + indegree array + deque queue',
          'dd(list) adjacency + union-find components',
          'min-heap of (outdegree, node) + seen set',
        ],
      },
      method: {
        answer: 'DFS with 3 states memoized per node: a node is unsafe if currently visiting (cycle) or any neighbor is unsafe, else mark it safe once every neighbor resolves safe',
        choices: [
          'DFS with 3 states memoized per node: a node is unsafe if currently visiting (cycle) or any neighbor is unsafe, else mark it safe once every neighbor resolves safe',
          "Reverse the graph, then repeatedly peel off nodes with zero remaining out-edges like Kahn's algorithm; the survivors are unsafe",
          'BFS from every node counting reachable terminal nodes, safe if that count is nonzero',
          'Union-Find grouping nodes that share a path, safe if the group contains a terminal node',
        ],
      },
      code: `class Solution:
    def eventualSafeNodes(self, graph: List[List[int]]) -> List[int]:
        n = len(graph)
        state = [0] * n

        def dfs(node):
            if state[node] == 1:
                return False
            if state[node] == 2:
                return True

            state[node] = 1
            for nxt in graph[node]:
                if not dfs(nxt):
                    return False
            state[node] = 2

            return True

        return [node for node in range(n) if dfs(node)]`,
      blanks: [6, 11, 15],
      time: { answer: 'O(V+E)', choices: ['O(V+E)', 'O(V*E)', 'O(V^2)', 'O(E log V)'], why: 'Each node and edge explored once thanks to memoized state.' },
      space: { answer: 'O(V+E)', choices: ['O(V+E)', 'O(V)', 'O(E)', 'O(1)'], why: 'Adjacency list, state array, and recursion stack scale with the graph.' },
      sayIt: '3-state DFS memoized per node: unsafe if currently visiting or any neighbor is unsafe, else mark safe once every neighbor resolves safe.',
      pitfall: 'Not memoizing state lets the same unsafe subtree get re-explored repeatedly.',
    },
    {
      id: 'thought:graphs-weighted:last-day-where-you-can-still-cross',
      lc: 1970,
      title: 'Last Day Where You Can Still Cross',
      difficulty: 'Hard',
      category: 'graphs-weighted',
      skills: ['binary-search', 'graph-bfs', 'grid'],
      companies: ['google'],
      statement: `You have a 1-indexed n x n grid of land that floods one cell per day, given by the order in cells. On day 0, every cell is land; you want to walk from the top row to the bottom row using only land cells, moving in the 4 cardinal directions.

Find the last day on which such a path still exists. After that day, every path from top to bottom is blocked by water.

As days increase, more cells become water, so the set of days where a path exists is monotonic — once it's impossible, it stays impossible. That lets you binary search on the day and, for each candidate day, run a BFS to check whether top-to-bottom is still reachable using only cells that haven't flooded yet.`,
      examples: [
        { input: 'row = 2, col = 2, cells = [[1,1],[2,1],[1,2],[2,2]]', output: '2', explanation: 'By day 2, a path through (1,2) still exists; day 3 floods everything.' },
      ],
      constraints: ['2 <= row, col <= 50', '4 <= row * col <= 2500', 'cells.length == row * col'],
      ds: {
        answer: 'binary search over day + deque queue BFS with a 2-D flood-day grid',
        choices: [
          'binary search over day + deque queue BFS with a 2-D flood-day grid',
          'reverse union-find adding cells from last flooded to first, checking top-bottom connectivity',
          'min-heap of (day, row, col) + 2-D visited grid',
          'dd(list) adjacency + 3-state DFS cycle check',
        ],
      },
      method: {
        answer: 'Binary search the day: for a candidate day, BFS from every unflooded top-row cell using only cells that flood after that day, feasible if any BFS reaches the bottom row',
        choices: [
          'Binary search the day: for a candidate day, BFS from every unflooded top-row cell using only cells that flood after that day, feasible if any BFS reaches the bottom row',
          'Reverse union-find: add cells back in reverse flood order, unioning with virtual top/bottom nodes; the day before top and bottom first connect is the answer',
          "Dijkstra from the top row where each cell's weight is its flood day, answer is the minimax path to the bottom row",
          'DFS from the top row counting the number of reachable cells, feasible once that count covers a full row',
        ],
      },
      code: `class Solution:
    def latestDayToCross(self, row: int, col: int, cells: List[List[int]]) -> int:
        floodDay = [[0] * col for _ in range(row)]
        for day, (r, c) in enumerate(cells, 1):
            floodDay[r - 1][c - 1] = day
        def canCross(day):
            seen = set((0, c) for c in range(col) if floodDay[0][c] > day)
            queue = deque(seen)
            while queue:
                r, c = queue.popleft()
                if r == row - 1:
                    return True
                for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nr, nc = r + dr, c + dc
                    if 0 <= nr < row and 0 <= nc < col and (nr, nc) not in seen and floodDay[nr][nc] > day:
                        seen.add((nr, nc))
                        queue.append((nr, nc))
            return False
        lo, hi = 1, row * col
        while lo < hi:
            mid = (lo + hi + 1) // 2
            if canCross(mid):
                lo = mid
            else:
                hi = mid - 1
        return lo`,
      blanks: [6, 14, 20],
      accept: { '20': ['mid = lo + (hi - lo + 1) // 2'] },
      time: { answer: 'O(R*C*log(R*C))', choices: ['O(R*C*log(R*C))', 'O(R*C)', 'O((R*C)^2)', 'O(R*C*log R)'], why: 'log(R*C) binary search rounds, each doing an O(R*C) BFS.' },
      space: { answer: 'O(R*C)', choices: ['O(R*C)', 'O(R+C)', 'O(1)', 'O(R^2*C^2)'], why: 'Flood-day grid, seen set, and queue all scale with the number of cells.' },
      sayIt: "Binary search the day on its monotonic feasibility; for each candidate, BFS from the unflooded top row to see if the bottom row is still reachable.",
      pitfall: "Forgetting the +1 when computing mid causes an infinite loop in this 'find last true' search.",
    },
    {
      id: 'thought:graphs-weighted:evaluate-division',
      lc: 399,
      title: 'Evaluate Division',
      difficulty: 'Medium',
      category: 'graphs-weighted',
      skills: ['graph-dfs', 'graph-modeling'],
      companies: ['google', 'amazon'],
      statement: `You're given a list of equations like a / b = value, meaning you know the ratio between a and b. You're also given a list of queries c / d, and for each one you need to compute that ratio using the known equations, or return -1.0 if it can't be determined.

Model each equation a / b = v as a weighted, directed, bidirectional pair of edges: a to b with weight v, and b to a with weight 1 / v. A query c / d is then just the product of edge weights along any path from c to d.

For each query, DFS from c multiplying weights as you go, and return the accumulated product the moment you reach d, or -1.0 if no path connects them (or either variable is unknown).`,
      examples: [
        { input: 'equations = [["a","b"],["b","c"]], values = [2.0,3.0], queries = [["a","c"],["b","a"],["a","e"],["a","a"],["x","x"]]', output: '[6.0,0.5,-1.0,1.0,-1.0]', explanation: 'a/c = (a/b)*(b/c) = 2*3 = 6; a/e is undetermined since e is unknown.' },
      ],
      constraints: ['1 <= equations.length <= 20', 'equations[i].length == 2', 'values.length == equations.length', 'values[i] > 0.0', '1 <= queries.length <= 20'],
      ds: {
        answer: 'dd(dict) weighted adjacency (both directions) + set visited per query DFS',
        choices: [
          'dd(dict) weighted adjacency (both directions) + set visited per query DFS',
          'dd(list) unweighted adjacency + BFS counting hops',
          'union-find parent array + weight-to-root ratio',
          '2-D dp table of all-pairs ratios (Floyd-Warshall style)',
        ],
      },
      method: {
        answer: 'Model each equation as two weighted directed edges (v and 1/v); DFS from the numerator multiplying edge weights on the way back, returning the product once the denominator is reached',
        choices: [
          'Model each equation as two weighted directed edges (v and 1/v); DFS from the numerator multiplying edge weights on the way back, returning the product once the denominator is reached',
          'Weighted union-find: union each pair with a ratio-to-parent, answer a query by comparing each side\'s ratio to a common root',
          'BFS from the numerator counting hops to the denominator, multiplying by a fixed average ratio',
          'Floyd-Warshall: precompute every pair\'s ratio by chaining through every intermediate variable',
        ],
      },
      code: `class Solution:
    def calcEquation(self, equations: List[List[str]], values: List[float], queries: List[List[str]]) -> List[float]:
        graph = dd(dict)
        for (a, b), v in zip(equations, values):
            graph[a][b] = v
            graph[b][a] = 1 / v

        def dfs(curr, target, seen):
            if curr not in graph or target not in graph:
                return -1.0
            if curr == target:
                return 1.0

            seen.add(curr)
            for nxt, w in graph[curr].items():
                if nxt not in seen:
                    sub = dfs(nxt, target, seen)
                    if sub != -1.0:
                        return w * sub

            return -1.0

        return [dfs(c, d, set()) for c, d in queries]`,
      blanks: [5, 16, 18],
      time: { answer: 'O(Q*(V+E))', choices: ['O(Q*(V+E))', 'O(V*E)', 'O(Q*V^2)', 'O(V+E+Q)'], why: 'Each of Q queries runs its own DFS over the small equation graph.' },
      space: { answer: 'O(V+E)', choices: ['O(V+E)', 'O(V)', 'O(E)', 'O(V^2)'], why: 'Adjacency map plus the recursion stack and seen set per query.' },
      sayIt: 'Build a weighted graph from each equation and its reciprocal, then DFS per query multiplying edge weights until the denominator is reached.',
      pitfall: 'Forgetting the reverse edge with the reciprocal weight breaks queries run the other way.',
    },
    {
      id: 'thought:graphs-weighted:reconstruct-itinerary',
      lc: 332,
      title: 'Reconstruct Itinerary',
      difficulty: 'Hard',
      category: 'graphs-weighted',
      skills: ['graph-dfs', 'graph-modeling'],
      companies: ['google', 'meta'],
      statement: `You're given a list of airline tickets as [from, to] pairs, all starting from "JFK". Reconstruct the itinerary that uses every ticket exactly once, starting at "JFK".

If multiple valid itineraries use every ticket, return the one that is lexicographically smallest when read as a single sequence of airport codes.

You may assume all tickets form at least one valid itinerary, and all tickets must be used exactly once.`,
      examples: [
        { input: 'tickets = [["MUC","LHR"],["JFK","MUC"],["SFO","SJC"],["LHR","SFO"]]', output: '["JFK","MUC","LHR","SFO","SJC"]', explanation: 'the only itinerary that uses every ticket starting from JFK' },
      ],
      constraints: ['1 <= tickets.length <= 300', 'every ticket forms at least one valid itinerary'],
      ds: {
        answer: 'dict of sorted destination lists per airport (adjacency), built reverse-sorted so pop() returns the smallest',
        choices: ['dict of sorted destination lists per airport (adjacency), built reverse-sorted so pop() returns the smallest', 'min-heap per airport of destinations', 'Union-Find over airports to detect when a loop closes', '2-D dp table of (airport, tickets used)'],
      },
      method: {
        answer: "Hierholzer's algorithm: ==DFS using up a ticket (pop) on each visit, and only append an airport to the route once it has no edges left==, then reverse the post-order route at the end",
        choices: [
          "Hierholzer's algorithm: ==DFS using up a ticket (pop) on each visit, and only append an airport to the route once it has no edges left==, then reverse the post-order route at the end",
          'Greedy: always fly to the lexicographically smallest reachable airport next, backtracking if you get stuck with unused tickets',
          'BFS layer by layer, picking the smallest unvisited destination at each airport per layer',
          'Topological sort of airports by out-degree, breaking ties alphabetically',
        ],
      },
      code: `class Solution:
    def findItinerary(self, tickets: List[List[str]]) -> List[str]:
        graph = defaultdict(list)
        for src, dst in sorted(tickets, reverse=True):
            graph[src].append(dst)

        route = []

        def dfs(airport):
            while graph[airport]:
                dfs(graph[airport].pop())
            route.append(airport)

        dfs("JFK")
        return route[::-1]`,
      blanks: [4, 10, 14],
      time: { answer: 'O(E log E)', choices: ['O(E log E)', 'O(E)', 'O(V + E)', 'O(E^2)'], why: 'sorting all E tickets dominates; the DFS itself visits each edge once' },
      space: { answer: 'O(E)', choices: ['O(E)', 'O(V)', 'O(1)', 'O(V + E)'], why: 'adjacency list holds every ticket, plus recursion depth up to E' },
      sayIt: 'I build a reverse-sorted adjacency so pop() gives the smallest next stop, DFS consuming tickets, append on the way back out, then reverse; O(E log E) time.',
      pitfall: "Appending to the route BEFORE exhausting an airport's edges produces the wrong order — must append post-order.",
    },
    {
      id: 'thought:graphs-weighted:number-of-operations-to-make-network-connected',
      lc: 1319,
      title: 'Number of Operations to Make Network Connected',
      difficulty: 'Medium',
      category: 'graphs-weighted',
      skills: ['union-find', 'graph-modeling'],
      companies: ['amazon', 'google'],
      statement: `You're given n computers labeled 0 to n-1 and a list of direct connections (cables), each connecting two computers. You can unplug any cable and use it to connect any two computers that currently aren't connected.

Return the minimum number of operations (cable moves) needed to make every computer reachable from every other computer, or -1 if it's impossible.

It's impossible only when there aren't even enough cables to connect everyone, regardless of how they're arranged.`,
      examples: [
        { input: 'n = 4, connections = [[0,1],[0,2],[1,2]]', output: '1', explanation: 'move the redundant 0-2 or 1-2 cable to connect computer 3' },
        { input: 'n = 6, connections = [[0,1],[0,2],[0,3],[1,2]]', output: '-1', explanation: 'only 4 cables for 6 computers, fewer than the 5 needed at minimum' },
      ],
      constraints: ['1 <= n <= 10^5', '1 <= connections.length <= min(n * (n - 1) / 2, 10^5)'],
      ds: {
        answer: 'Union-Find (disjoint set) over the n computers with path compression',
        choices: ['Union-Find (disjoint set) over the n computers with path compression', 'adjacency list + BFS counting components', '2-D dp table of (computer, operations used)', 'min-heap of (component size, root) to merge smallest first'],
      },
      method: {
        answer: "Union-Find: ==first check len(connections) >= n - 1== (enough cables to possibly connect everyone), union every connection, and the answer is ==components - 1==, since each extra cable can stitch two components together",
        choices: [
          "Union-Find: ==first check len(connections) >= n - 1== (enough cables to possibly connect everyone), union every connection, and the answer is ==components - 1==, since each extra cable can stitch two components together",
          'BFS/DFS to count connected components directly, then the answer is always the component count with no -1 check needed',
          'Greedy: repeatedly remove a cable from the largest component and attach it to the smallest until one component remains',
          'Union-Find, but the answer is the number of redundant (same-root) connections encountered, not components - 1',
        ],
      },
      code: `class Solution:
    def makeConnected(self, n: int, connections: List[List[int]]) -> int:
        if len(connections) < n - 1:
            return -1

        parent = list(range(n))

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        components = n
        for a, b in connections:
            rootA, rootB = find(a), find(b)
            if rootA != rootB:
                parent[rootA] = rootB
                components -= 1

        return components - 1`,
      blanks: [3, 18, 20],
      time: { answer: 'O(E * α(n))', choices: ['O(E * α(n))', 'O(E log E)', 'O(n^2)', 'O(E)'], why: 'near-constant find/union per connection with path compression' },
      space: { answer: 'O(n)', choices: ['O(n)', 'O(E)', 'O(1)', 'O(n + E)'], why: 'the parent array holds one entry per computer' },
      sayIt: "I union-find the connections, bail out early if there aren't even n-1 cables, then the answer is components - 1 since each spare cable can join two components.",
      pitfall: 'Forgetting the len(connections) < n - 1 early return lets an impossible case silently return a wrong positive number.',
    },
    {
      id: 'thought:graphs-weighted:critical-connections-in-a-network',
      lc: 1192,
      title: 'Critical Connections in a Network',
      difficulty: 'Hard',
      category: 'graphs-weighted',
      skills: ['graph-dfs', 'graph-modeling'],
      companies: ['google', 'meta'],
      statement: `There are n servers connected by n-1 or more bidirectional connections, forming a network. A critical connection is one that, if removed, would split the network into two or more disconnected pieces.

Return all critical connections in the network, in any order.

Think about which connections lead only into "dead-end" parts of the network with no other way back.`,
      examples: [
        { input: 'n = 4, connections = [[0,1],[1,2],[2,0],[1,3]]', output: '[[1,3]]', explanation: '0-1-2 form a cycle (any one edge there is replaceable), but 1-3 is the only way to reach server 3' },
      ],
      constraints: ['2 <= n <= 10^5', 'n - 1 <= connections.length <= 10^5', 'no repeated connections, no self-loops'],
      ds: {
        answer: "adjacency list + two int arrays: discovery time and low-link value per node (Tarjan's bridge algorithm)",
        choices: ["adjacency list + two int arrays: discovery time and low-link value per node (Tarjan's bridge algorithm)", 'Union-Find merging nodes and checking component count after removing each edge', 'BFS layering to find back-edges by level difference', '2-D dp table of (node, parent) reachability'],
      },
      method: {
        answer: "DFS assigning each node a ==discovery time and low-link value==, and an edge (node, neighbor) is a bridge exactly when ==low[neighbor] > disc[node]==, meaning the subtree below neighbor has no back-edge reaching node or higher",
        choices: [
          "DFS assigning each node a ==discovery time and low-link value==, and an edge (node, neighbor) is a bridge exactly when ==low[neighbor] > disc[node]==, meaning the subtree below neighbor has no back-edge reaching node or higher",
          'Remove each edge one at a time and re-run BFS/DFS to check if the graph is still fully connected (O(E) full traversals)',
          'Union-Find: an edge is critical whenever its two endpoints are not already in the same component before union',
          'DFS coloring nodes by component after temporarily deleting each node, flagging edges whose removal increases component count',
        ],
      },
      code: `class Solution:
    def criticalConnections(self, n: int, connections: List[List[int]]) -> List[List[int]]:
        graph = defaultdict(list)
        for a, b in connections:
            graph[a].append(b)
            graph[b].append(a)

        disc = [-1] * n
        low = [-1] * n
        bridges = []
        timer = [0]

        def dfs(node, parent):
            disc[node] = low[node] = timer[0]
            timer[0] += 1

            for neighbor in graph[node]:
                if neighbor == parent:
                    continue
                if disc[neighbor] == -1:
                    dfs(neighbor, node)
                    low[node] = min(low[node], low[neighbor])
                    if low[neighbor] > disc[node]:
                        bridges.append([node, neighbor])
                else:
                    low[node] = min(low[node], disc[neighbor])

        dfs(0, -1)
        return bridges`,
      blanks: [13, 21, 22],
      time: { answer: 'O(V + E)', choices: ['O(V + E)', 'O(E * (V + E))', 'O(V * E)', 'O(E log E)'], why: 'a single DFS computes disc/low for every node and edge once' },
      space: { answer: 'O(V + E)', choices: ['O(V + E)', 'O(V)', 'O(E)', 'O(1)'], why: 'adjacency list plus the disc/low arrays and recursion stack' },
      sayIt: "Single DFS tracking discovery time and low-link per node; an edge is a bridge when the child's low-link can't reach back to or above the parent's discovery time, O(V+E) time.",
      pitfall: 'Must skip only the immediate parent edge, not all previously visited neighbors, or real back-edges get missed.',
    },
    {
      id: 'thought:graphs-weighted:minimum-height-trees',
      lc: 310,
      title: 'Minimum Height Trees',
      difficulty: 'Medium',
      category: 'graphs-weighted',
      skills: ['topo-sort', 'graph-modeling'],
      companies: ['google', 'amazon'],
      statement: `You're given a tree (a connected, undirected, acyclic graph) of n nodes. For any node you pick as the root, the tree's height is the longest distance from that root down to any leaf.

A "minimum height tree" is a tree rooted at a node that minimizes this height, meaning that node minimizes the greatest distance to any other node.

Return every node that could serve as the root of a minimum height tree; there can be at most 2 such roots.`,
      examples: [
        { input: 'n = 4, edges = [[1,0],[1,2],[1,3]]', output: '[1]', explanation: 'rooting at node 1 gives height 1, the smallest possible since it reaches every other node in one hop' },
        { input: 'n = 6, edges = [[3,0],[3,1],[3,2],[3,4],[5,4]]', output: '[3,4]', explanation: 'both node 3 and node 4 tie for the minimum possible height' },
      ],
      constraints: ['1 <= n <= 2 * 10^4', 'edges.length == n - 1', 'the given input is guaranteed to be a valid tree'],
      ds: {
        answer: 'adjacency set per node (degree-tracked) + a queue of current leaves (degree 1)',
        choices: ['adjacency set per node (degree-tracked) + a queue of current leaves (degree 1)', 'adjacency list + DFS computing eccentricity from every node', 'Union-Find grouping nodes, then BFS from the root of each component', 'min-heap of (degree, node) processed like Dijkstra'],
      },
      method: {
        answer: "Topological leaf-trimming (BFS layers): repeatedly strip every current leaf (degree-1 node) from the tree, ==shrinking the remaining node count each round==, until 1 or 2 nodes are left — those are the centers, the roots that minimize tree height",
        choices: [
          'Run BFS from every single node to compute its height, then keep whichever node(s) have the minimum height (O(n^2) overall)',
          "Topological leaf-trimming (BFS layers): repeatedly strip every current leaf (degree-1 node) from the tree, ==shrinking the remaining node count each round==, until 1 or 2 nodes are left — those are the centers, the roots that minimize tree height",
          'DFS to find the two endpoints of the longest path (tree diameter), then return only its exact midpoint',
          'Union-Find to detect the tree is connected, then arbitrarily root at node 0',
        ],
      },
      code: `class Solution:
    def findMinHeightTrees(self, n: int, edges: List[List[int]]) -> List[int]:
        if n == 1:
            return [0]

        graph = defaultdict(set)
        for a, b in edges:
            graph[a].add(b)
            graph[b].add(a)

        leaves = deque(node for node in range(n) if len(graph[node]) == 1)
        remaining = n

        while remaining > 2:
            remaining -= len(leaves)
            for _ in range(len(leaves)):
                leaf = leaves.popleft()
                neighbor = graph[leaf].pop()
                graph[neighbor].discard(leaf)
                if len(graph[neighbor]) == 1:
                    leaves.append(neighbor)

        return list(leaves)`,
      blanks: [10, 14, 20],
      time: { answer: 'O(V + E)', choices: ['O(V + E)', 'O(V^2)', 'O(V log V)', 'O(V * E)'], why: 'each node is trimmed from the leaf queue exactly once, each edge removed once' },
      space: { answer: 'O(V + E)', choices: ['O(V + E)', 'O(V)', 'O(1)', 'O(E log E)'], why: 'adjacency sets plus the leaves queue scale with nodes and edges' },
      sayIt: "Peel leaves layer by layer like topological sort, ==remaining shrinks each round==, the last 1 or 2 nodes standing are the tree's centers since they minimize the furthest distance to any other node, O(V+E) time.",
      pitfall: 'A tree center can be 2 nodes when the longest path has odd length, not always exactly 1 — stop trimming once remaining <= 2, never trim all the way down to 1.',
    },
    {
      id: 'thought:graphs-weighted:find-the-city-with-smallest-number-of-neighbors',
      lc: 1334,
      title: 'Find the City With the Smallest Number of Neighbors at a Threshold Distance',
      difficulty: 'Medium',
      category: 'graphs-weighted',
      skills: ['dijkstra', 'graph-modeling'],
      companies: ['google', 'amazon'],
      statement: `You're given n cities connected by weighted, bidirectional roads. For a given distance threshold, a city A is a "neighbor" of city B if the shortest path between them is at most that threshold.

For each city, count how many neighbors it has. Find the city with the smallest such count.

If more than one city ties for the smallest count, return the one with the largest city number.`,
      examples: [
        { input: 'n = 4, edges = [[0,1,3],[1,2,1],[1,3,4],[2,3,1]], distanceThreshold = 4', output: '3', explanation: 'city 3 can only reach cities 1 and 2 within distance 4, the fewest of any city' },
      ],
      constraints: ['2 <= n <= 100', '1 <= edges.length <= n * (n-1) / 2', '1 <= edgeWeight <= 10^4', 'at most one edge between any pair of cities'],
      ds: {
        answer: 'n x n distance matrix (Floyd-Warshall all-pairs shortest paths)',
        choices: ['n x n distance matrix (Floyd-Warshall all-pairs shortest paths)', "run Dijkstra from every node with a min-heap (n separate single-source searches)", 'BFS from every node, treating every edge as weight 1', 'Union-Find grouping cities within distanceThreshold of each other'],
      },
      method: {
        answer: 'Floyd-Warshall: try every node k as an intermediate hop, ==dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])== for every pair (i,j); once all-pairs distances settle, count reachable neighbors per city within the threshold and keep the city with the fewest, breaking ties toward the larger index',
        choices: [
          "Run Dijkstra's algorithm n times, once rooted at each city, merging the results into the same distance matrix",
          'BFS n times treating the graph as unweighted, ignoring the actual edge weights',
          'Greedy: only keep direct edges under the threshold, ignoring any multi-hop paths entirely',
          'Floyd-Warshall: try every node k as an intermediate hop, ==dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])== for every pair (i,j); once all-pairs distances settle, count reachable neighbors per city within the threshold and keep the city with the fewest, breaking ties toward the larger index',
        ],
      },
      code: `class Solution:
    def findTheCity(self, n: int, edges: List[List[int]], distanceThreshold: int) -> int:
        dist = [[math.inf] * n for _ in range(n)]
        for i in range(n):
            dist[i][i] = 0
        for a, b, w in edges:
            dist[a][b] = min(dist[a][b], w)
            dist[b][a] = min(dist[b][a], w)

        for k in range(n):
            for i in range(n):
                for j in range(n):
                    dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])

        best, bestCount = -1, math.inf
        for i in range(n):
            count = sum(1 for j in range(n) if i != j and dist[i][j] <= distanceThreshold)
            if count <= bestCount:
                best, bestCount = i, count

        return best`,
      blanks: [12, 16, 17],
      time: { answer: 'O(n^3)', choices: ['O(n^3)', 'O(n^2 log n)', 'O(n^2)', 'O(n^4)'], why: 'three nested loops over every (k, i, j) triple' },
      space: { answer: 'O(n^2)', choices: ['O(n^2)', 'O(n)', 'O(1)', 'O(n^2 log n)'], why: 'full n x n distance matrix' },
      sayIt: "Floyd-Warshall fills ==dist[i][j] = min(dist[i][j], dist[i][k]+dist[k][j]) for every k==, then count each city's neighbors under the threshold, ties go to the larger city index, O(n^3) time.",
      pitfall: 'Ties must pick the city with the LARGER index, not the first one found — using < instead of <= silently breaks this.',
    },
    {
      id: 'thought:graphs-weighted:path-with-maximum-probability',
      lc: 1514,
      title: 'Path With Maximum Probability',
      difficulty: 'Medium',
      category: 'graphs-weighted',
      skills: ['dijkstra'],
      companies: ['google', 'amazon'],
      statement: `You're given a graph of n nodes where each edge has a success probability between 0 and 1. Starting from a given node, you want to reach another given node.

The probability of a path is the product of the probabilities of every edge along it (not the sum, since each edge must independently succeed).

Find the maximum probability of success along any path from start to end, or return 0 if no path exists.`,
      examples: [
        { input: 'n = 3, edges = [[0,1],[1,2],[0,2]], succProb = [0.5,0.5,0.2], start = 0, end = 2', output: '0.25', explanation: 'the path 0->1->2 has probability 0.5*0.5 = 0.25, beating the direct edge 0->2 at 0.2' },
      ],
      constraints: ['2 <= n <= 10^4', '0 <= edges.length <= 2 * 10^4', '0 <= succProb[i] <= 1', 'there is at most one edge between any two nodes'],
      ds: {
        answer: 'max-heap of (probability, node) via negation, plus a best[] array of the best probability found so far',
        choices: ['max-heap of (probability, node) via negation, plus a best[] array of the best probability found so far', 'min-heap of (probability, node), same as plain Dijkstra with no negation', 'BFS queue exploring every edge once, multiplying probabilities along the way', '2-D dp table of (node, steps taken)'],
      },
      method: {
        answer: "Dijkstra, but maximize instead of minimize: python's heapq is a min-heap, so push ==negated probabilities== to simulate a max-heap; relax a neighbor by ==multiplying probabilities== instead of adding weights, since independent probabilities compound by multiplication",
        choices: [
          'Bellman-Ford style relaxation over all edges repeatedly, summing log-probabilities instead of multiplying raw probabilities',
          'BFS exploring every path from start to end, multiplying probabilities and keeping the maximum found',
          "Dijkstra, but maximize instead of minimize: python's heapq is a min-heap, so push ==negated probabilities== to simulate a max-heap; relax a neighbor by ==multiplying probabilities== instead of adding weights, since independent probabilities compound by multiplication",
          'Greedy: always take the single highest-probability edge available at each step',
        ],
      },
      code: `class Solution:
    def maxProbability(self, n: int, edges: List[List[int]], succProb: List[float], start: int, end: int) -> float:
        graph = defaultdict(list)
        for (a, b), prob in zip(edges, succProb):
            graph[a].append((b, prob))
            graph[b].append((a, prob))

        best = [0.0] * n
        best[start] = 1.0
        heap = [(-1.0, start)]

        while heap:
            negProb, node = heapq.heappop(heap)
            prob = -negProb
            if node == end:
                return prob
            if prob < best[node]:
                continue

            for neighbor, edgeProb in graph[node]:
                candidate = prob * edgeProb
                if candidate > best[neighbor]:
                    best[neighbor] = candidate
                    heapq.heappush(heap, (-candidate, neighbor))

        return 0.0`,
      blanks: [13, 20, 23],
      time: { answer: 'O(E log V)', choices: ['O(E log V)', 'O(V^2 log V)', 'O(V * E)', 'O(E^2)'], why: 'standard Dijkstra bound, each edge can trigger one heap push, the heap holds at most V entries wide' },
      space: { answer: 'O(V + E)', choices: ['O(V + E)', 'O(V)', 'O(E)', 'O(V * E)'], why: 'adjacency list plus the best[] array plus the heap, each scaling with nodes/edges' },
      sayIt: "Max-heap via ==negated probabilities==, relax neighbors by ==multiplying probabilities== (not adding), same lazy-deletion Dijkstra pattern, stop early the moment end is popped, O(E log V) time.",
      pitfall: 'Forgetting to negate probabilities breaks everything, since heapq only pops the smallest — must negate going in and negate again coming out.',
    },
  ],
}
