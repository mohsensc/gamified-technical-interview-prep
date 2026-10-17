const gridLeaf = {
  result: 'Grid DFS/BFS traversal',
  ds: 'seen set or in-place mark + directions list',
  time: 'O(R·C)',
  why: 'every cell visited once, 4 neighbor checks',
  ref: 'Grid BFS/DFS template',
}

const unweightedNode = {
  q: 'What do you need from it?',
  options: [
    { label: 'Shortest path / fewest steps', leaf: { result: '==BFS==', ds: 'queue (deque) + seen set', time: 'O(V+E)', why: 'first time reached = shortest, unweighted', ref: 'BFS template' } },
    { label: 'Order with prerequisites', leaf: { result: '==topological sort== (Kahn)', ds: 'indegree array + queue', time: 'O(V+E)', why: 'process zero-indegree nodes first', ref: 'Topological sort template' } },
    { label: 'Split into 2 groups, no same-group edge', leaf: { result: '==bipartite== BFS coloring', ds: 'color dict + queue', time: 'O(V+E)', why: 'a same-color neighbor means it fails', ref: 'Bipartite BFS template' } },
    { label: 'Count components / merge over time', leaf: { result: '==union-find==', ds: 'parent array + rank, ==path compression==', time: '~O(1) amortized/op', why: 'union() returns False exactly on a redundant edge', ref: 'Union-Find template' } },
    { label: 'Explore / path exists / cycle, undirected', leaf: { result: '==DFS== (recursive or iterative)', ds: 'adjacency list + seen set (+ parent for cycle)', time: 'O(V+E)', why: 'pass parent in; seen neighbor that is not parent = cycle', ref: 'DFS template (graph)' } },
    { label: 'Detect a cycle, directed', leaf: { result: '3-color DFS', ds: 'color array (white/gray/black)', time: 'O(V+E)', why: 'hitting a GRAY node is a real ==back edge== — a cycle', ref: 'Cycle detection (directed) template' } },
  ],
}

const mstNode = {
  q: 'Grow outward from one node, or sort all edges globally?',
  options: [
    { label: 'Grow outward from a start node', leaf: { result: "==\"prim's algorithm\"==", ds: 'min-heap + visited set', time: 'O(E log V)', why: 'heap always pops the cheapest edge leaving visited', ref: "Prim's MST template" } },
    { label: 'Sort edges once, skip ones that would cycle', leaf: { result: "==\"kruskal's algorithm\"==", ds: 'sorted edges + Union-Find', time: 'O(E log E)', why: 'union-find rejects any edge that would close a cycle', ref: "Kruskal's MST template" } },
  ],
}

const weightedGoalNode = {
  q: 'Shortest path from one start, or connect everyone cheaply?',
  options: [
    { label: 'Shortest path from one start', leaf: { result: '==dijkstra==', ds: 'min-heap + dist dict', time: 'O((V+E) log V)', why: 'heap always pops the closest unvisited node next', ref: 'Dijkstra template' } },
    { label: 'Connect all nodes cheapest (==minimum spanning tree==)', next: mstNode },
  ],
}

const weightedNode = {
  q: 'Are the edges weighted?',
  options: [
    { label: 'No — every edge costs 1', next: unweightedNode },
    { label: 'Yes — edges carry a cost', next: weightedGoalNode },
  ],
}

const graphDecisionTree = {
  q: "What's given?",
  options: [
    { label: '2D grid of cells', leaf: gridLeaf },
    { label: 'Explicit nodes + edges', next: weightedNode },
  ],
}

const summary = [
  "==BFS== = shortest path, unweighted. ==DFS== = explore, components, cycles.",
  "Weighted single-source → ==dijkstra==. Connect-all cheapest → ==\"prim's algorithm\"==/==\"kruskal's algorithm\"==.",
  "Prereqs / build order → ==topological sort== (Kahn: indegree + queue).",
  "Groups merging over time, redundant edge → ==union-find==.",
  "==grid== = implicit graph: directions list + bounds check, every time.",
  "Mark ==visited-on-enqueue==, not on pop — stops duplicate queue entries.",
  "Directed ==cycle detection== → 3-color DFS. A ==back edge== = a cycle.",
  "==adjacency list==: dd(list); undirected edges add BOTH directions.",
]

const sections = [
  {
    kind: 'boilerplate',
    title: 'Build Adjacency List',
    when: 'any graph given as an edge list or pairs',
    code: `from collections import defaultdict as dd

def buildGraph(n, edges, directed=False):
    graph = dd(list)
    for a, b in edges:
        graph[a].append(b)
        if not directed:
            graph[b].append(a)
    return graph`,
    time: 'O(V+E)',
    space: 'O(V+E)',
    knobs: [
      { change: 'directed graph', how: 'pass directed=True — skip appending the reverse edge', code: `if not directed:\n    graph[b].append(a)` },
      { change: 'weighted edges (u, v, w)', how: 'append (b, w) tuples instead of bare neighbor ids', code: 'graph[a].append((b, w))' },
      { change: 'nodes numbered 1..n, not 0..n-1', how: 'loop range(1, n + 1) wherever you size or iterate' },
      { change: 'every other adjacency shape (indegree, course-schedule direction…)', how: 'see Init sheet → Adjacency list patterns table' },
    ],
  },
  {
    kind: 'tree',
    title: 'GRAPHS: structure → goal → which template',
    root: graphDecisionTree,
  },
  {
    kind: 'boilerplate',
    title: 'DFS template (graph)',
    when: 'explore everything reachable: components, cycles, path exists',
    code: `def dfsRecursive(graph, n):
    seen = set()

    def dfs(node):
        seen.add(node)
        for nei in graph[node]:
            if nei not in seen:
                dfs(nei)

    count = 0
    for node in range(n):
        if node not in seen:
            dfs(node)
            count += 1

    return count`,
    time: 'O(V+E)',
    space: 'O(V) seen set + recursion depth',
    knobs: [
      { change: 'grid / component AREA, not just a count', how: 'dfs returns 1 + the sum of unseen-neighbor calls instead of only marking', code: 'return 1 + sum(dfs(nei) for nei in graph[node] if nei not in seen)' },
      { change: 'does a path exist from src to dst', how: 'dfs returns bool, short-circuit True the instant node == dst' },
      { change: 'cycle check, UNDIRECTED graph', how: 'pass parent into dfs; a seen neighbor that is not parent means a cycle', code: `def dfs(node, parent):
    seen.add(node)
    for nei in graph[node]:
        if nei == parent:
            continue
        if nei in seen or dfs(nei, node):
            return True
    return False` },
      { change: 'recursion depth too deep / skewed graph', how: 'switch to DFS Iterative (stack) — same seen-on-push rule' },
    ],
  },
  {
    kind: 'boilerplate',
    title: 'DFS Iterative (stack)',
    when: 'same as DFS recursive, avoids recursion depth limits',
    code: `def dfsIterative(graph, start):
    seen = {start}
    stack = [start]

    while stack:
        node = stack.pop()
        for nei in graph[node]:
            if nei not in seen:
                seen.add(nei)
                stack.append(nei)

    return seen`,
    time: 'O(V+E)',
    space: 'O(V)',
    knobs: [
      { change: 'need the actual path, not just reachability', how: 'push (node, path) tuples; extend path when pushing each neighbor', code: 'stack.append((nei, path + [nei]))' },
      { change: 'process a node AFTER its children (postorder)', how: 'push (node, False) then (node, True) when expanding; only act on the True pop' },
      { change: 'grid version', how: 'swap graph[node] neighbors for the 4-direction offset check — see Grid BFS/DFS template' },
    ],
  },
  {
    kind: 'boilerplate',
    title: 'Grid BFS/DFS template',
    when: '2D grid treated as an implicit graph',
    code: `directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]

def gridDfs(grid, row, col):
    rows, cols = len(grid), len(grid[0])
    seen = set()

    def dfs(r, c):
        seen.add((r, c))
        for dr, dc in directions:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and (nr, nc) not in seen and grid[nr][nc] == 1:
                dfs(nr, nc)

    dfs(row, col)
    return seen`,
    time: 'O(R·C)',
    space: 'O(R·C)',
    knobs: [
      { change: 'convert DFS → BFS', how: 'swap the recursive dfs call for a deque; mark seen on append, pop from the left', code: `queue = deque([(row, col)])
seen = {(row, col)}
while queue:
    r, c = queue.popleft()
    for dr, dc in directions:
        nr, nc = r + dr, c + dc
        if 0 <= nr < rows and 0 <= nc < cols and (nr, nc) not in seen and grid[nr][nc] == 1:
            seen.add((nr, nc))
            queue.append((nr, nc))` },
      { change: "don't mutate the input grid", how: 'keep the seen set exactly as above' },
      { change: 'mutate grid in-place instead (saves the seen set)', how: "set grid[r][c] = '0' the moment you enter a cell; drop seen entirely", code: `grid[r][c] = '0'` },
      { change: 'count islands / components overall', how: 'loop every cell; call dfs + count += 1 only when unseen and land' },
    ],
  },
  {
    kind: 'boilerplate',
    title: 'BFS template',
    when: 'fewest steps / shortest path, unweighted graph',
    code: `from collections import deque

def bfsLevels(graph, start):
    seen = {start}
    queue = deque([start])
    dist = {start: 0}

    while queue:
        for _ in range(len(queue)):
            node = queue.popleft()
            for nei in graph[node]:
                if nei not in seen:
                    seen.add(nei)
                    dist[nei] = dist[node] + 1
                    queue.append(nei)

    return dist`,
    time: 'O(V+E)',
    space: 'O(V)',
    knobs: [
      { change: 'single target, stop early', how: 'return dist[node] the instant node == target, inside the pop branch' },
      { change: 'return the actual path, not just distance', how: 'track parent = {} on first-seen; walk parent[target] back to start, then reverse', code: `node, path = target, []
while node is not None:
    path.append(node)
    node = parent[node]
path.reverse()` },
      { change: 'why snapshot len(queue) before the inner loop', how: "it freezes one level's size — mutating queue inside the loop would silently merge levels" },
      { change: 'multiple starting sources at once', how: 'seed queue + seen + dist with ALL sources at distance 0 — see Multi-Source BFS' },
    ],
  },
  {
    kind: 'boilerplate',
    title: 'Multi-Source BFS',
    when: 'spread from several starting cells/nodes at once',
    code: `from collections import deque

def multiSourceBfs(grid):
    directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]
    rows, cols = len(grid), len(grid[0])
    queue = deque([(r, c) for r in range(rows) for c in range(cols) if grid[r][c] == 2])
    seen = set(queue)
    minutes = 0

    while queue:
        for _ in range(len(queue)):
            r, c = queue.popleft()
            for dr, dc in directions:
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and (nr, nc) not in seen and grid[nr][nc] == 1:
                    seen.add((nr, nc))
                    queue.append((nr, nc))
        if queue:
            minutes += 1

    return minutes`,
    time: 'O(R·C)',
    space: 'O(R·C)',
    knobs: [
      { change: 'return a DISTANCE grid, not one number', how: 'store dist[(r, c)] = minutes when first enqueued; return that dict' },
      { change: 'check everyone is reachable (rotting oranges)', how: 'after the loop, return -1 if any cell == 1 is still not in seen' },
      { change: "it's actually single-source", how: "seed queue/seen with just [start] — that's plain BFS template" },
      { change: 'graph instead of grid', how: 'seed queue with every known source node id, same dist = 0 start' },
    ],
  },
  {
    kind: 'boilerplate',
    title: 'Bipartite BFS template',
    when: 'split nodes into 2 groups, no same-group edge',
    code: `from collections import deque

def isBipartite(graph, n):
    color = {}

    for start in range(n):
        if start in color:
            continue
        color[start] = 0
        queue = deque([start])

        while queue:
            node = queue.popleft()
            for nei in graph[node]:
                if nei not in color:
                    color[nei] = 1 - color[node]
                    queue.append(nei)
                elif color[nei] == color[node]:
                    return False

    return True`,
    time: 'O(V+E)',
    space: 'O(V)',
    knobs: [
      { change: 'graph might be disconnected', how: 'the outer for start in range(n) loop already restarts coloring per component' },
      { change: 'need the actual 2-coloring, not just True/False', how: 'return the color dict instead of True at the end' },
      { change: 'DFS version instead of BFS', how: 'recursive dfs(node, c): color it, recurse into uncolored neighbors with 1 - c' },
    ],
  },
  {
    kind: 'boilerplate',
    title: 'Topological sort template',
    when: 'order with dependencies; detect an impossible order',
    code: `from collections import deque

def topoSortKahn(graph, n):
    indegree = [0] * n
    for node in graph:
        for nei in graph[node]:
            indegree[nei] += 1

    queue = deque([i for i in range(n) if indegree[i] == 0])
    order = []

    while queue:
        node = queue.popleft()
        order.append(node)
        for nei in graph[node]:
            indegree[nei] -= 1
            if indegree[nei] == 0:
                queue.append(nei)

    return order if len(order) == n else []`,
    time: 'O(V+E)',
    space: 'O(V)',
    knobs: [
      { change: 'just detect if a cycle exists (course schedule I)', how: 'return len(order) == n as a plain bool' },
      { change: 'course schedule II — return the build order', how: 'already done — order IS it, or [] when impossible' },
      { change: 'edges given as [course, prereq] pairs', how: 'build graph[prereq].append(course), so edges point prereq → course' },
      { change: 'nodes are characters, not 0..n-1 ints', how: 'swap range(n) for the explicit char set; indegree becomes a dict' },
    ],
  },
  {
    kind: 'boilerplate',
    title: 'Cycle detection (directed) template',
    when: 'detect a cycle in a DIRECTED graph',
    code: `def hasCycleDirected(graph, n):
    WHITE, GRAY, BLACK = 0, 1, 2
    color = [WHITE] * n

    def dfs(node):
        color[node] = GRAY
        for nei in graph[node]:
            if color[nei] == GRAY:
                return True
            if color[nei] == WHITE and dfs(nei):
                return True
        color[node] = BLACK
        return False

    return any(color[i] == WHITE and dfs(i) for i in range(n))`,
    time: 'O(V+E)',
    space: 'O(V)',
    knobs: [
      { change: 'undirected graph instead', how: "don't 3-color — use parent-tracking DFS; a GRAY-equivalent neighbor there just means the edge you came from" },
      { change: 'need the actual cycle, not yes/no', how: 'append nodes to a path list on GRAY; slice it from the repeated node when hit' },
      { change: 'topo sort already covers this', how: "Kahn's len(order) < n is an equivalent cycle check" },
    ],
  },
  {
    kind: 'boilerplate',
    title: 'Union-Find template',
    when: 'track groups merging over time; redundant edge',
    code: `def buildUnionFind(n):
    parent = list(range(n))
    rank = [1] * n

    def find(node):
        while parent[node] != node:
            parent[node] = parent[parent[node]]
            node = parent[node]
        return node

    def union(a, b):
        ra, rb = find(a), find(b)
        if ra == rb:
            return False
        if rank[ra] < rank[rb]:
            ra, rb = rb, ra
        parent[rb] = ra
        rank[ra] += rank[rb]
        return True

    return find, union`,
    time: '~O(1) amortized per op',
    space: 'O(V)',
    knobs: [
      { change: 'count connected components', how: 'components = n; components -= union(a, b) for every edge (True counts as 1)' },
      { change: 'first redundant edge (the one that reconnects)', how: 'loop edges in order; return the first edge where union(a, b) is False' },
      { change: 'need group sizes too', how: 'track size = [1] * n; size[ra] += size[rb] inside union, instead of rank' },
      { change: 'skip path compression / union by rank', how: "don't — without both, find() degrades toward O(n) per call" },
    ],
  },
  {
    kind: 'boilerplate',
    title: 'Dijkstra template',
    when: 'shortest path, weighted, non-negative edges',
    code: `import heapq, math

def dijkstra(graph, n, start):
    dist = {start: 0}
    heap = [(0, start)]

    while heap:
        d, node = heapq.heappop(heap)
        if d > dist.get(node, math.inf):
            continue
        for nei, w in graph[node]:
            nd = d + w
            if nd < dist.get(nei, math.inf):
                dist[nei] = nd
                heapq.heappush(heap, (nd, nei))

    return dist`,
    time: 'O((V+E) log V)',
    space: 'O(V+E)',
    knobs: [
      { change: 'network delay time — latest arrival', how: 'return max(dist.values()) if len(dist) == n else -1' },
      { change: 'single target, stop early', how: 'return d the instant node == target, right after the stale-entry check' },
      { change: 'minimax / effort path (minimize the max edge on the path)', how: 'push (max(d, w), nei) instead of (d + w, nei)', code: 'heapq.heappush(heap, (max(d, w), nei))' },
      { change: 'at most k stops — Dijkstra breaks here', how: 'switch algorithms: Bellman-Ford, relax every edge k + 1 times' },
    ],
  },
  {
    kind: 'boilerplate',
    title: "Prim's MST template",
    when: 'connect all nodes cheapest, growing from a start',
    code: `import heapq

def dist(p1, p2):
    return abs(p1[0] - p2[0]) + abs(p1[1] - p2[1])

def primMst(points):
    n = len(points)
    seen = {0}
    heap = []
    for i in range(1, n):
        heapq.heappush(heap, (dist(points[0], points[i]), i))
    total = 0

    while len(seen) < n:
        w, node = heapq.heappop(heap)
        if node in seen:
            continue
        seen.add(node)
        total += w
        for nxt in range(n):
            if nxt not in seen:
                heapq.heappush(heap, (dist(points[node], points[nxt]), nxt))

    return total`,
    time: 'O(E log V)',
    space: 'O(V+E)',
    knobs: [
      { change: 'graph already has explicit weighted edges, not raw points', how: 'seed the heap from graph[0] edge pairs (w, nei); drop the dist() function' },
      { change: 'need the actual MST edges, not just total cost', how: 'append (node, nxt, w) to a list instead of total +=' },
      { change: 'dense points, no adjacency list (min-cost-connect-points style)', how: 'this is exactly that — scanning every unvisited point each pop is O(n²) pushes, not O(E)' },
      { change: 'sparse edge list instead', how: 'Kruskal is usually simpler there — sort + Union-Find, no per-node scan' },
    ],
  },
  {
    kind: 'boilerplate',
    title: "Kruskal's MST template",
    when: 'connect all nodes cheapest, sorted edges + Union-Find',
    code: `def kruskalMst(n, edges):
    edges = sorted(edges, key=lambda e: e[2])
    find, union = buildUnionFind(n)
    total = 0

    for a, b, w in edges:
        if union(a, b):
            total += w

    return total`,
    time: 'O(E log E)',
    space: 'O(V+E)',
    knobs: [
      { change: 'need the actual MST edges', how: 'append (a, b, w) to a list inside the if union(a, b) branch' },
      { change: 'count skipped edges (the ones that would cycle)', how: 'add an else branch next to the if: skipped += 1' },
      { change: 'dense graph, few nodes', how: "Prim's is usually simpler there — one heap growing from a single start" },
    ],
  },
  {
    kind: 'table',
    title: 'Complexity: every graph boilerplate',
    columns: ['Algorithm', 'Data structures', 'Time', 'Space'],
    rows: [
      ['BFS', 'deque + seen set', 'O(V+E)', 'O(V)'],
      ['DFS (recursive or iterative)', 'adjacency list + seen set', 'O(V+E)', 'O(V)'],
      ['Grid DFS/BFS', 'directions list + seen set / in-place', 'O(R·C)', 'O(R·C)'],
      ['Multi-source BFS', 'deque seeded with all sources', 'O(R·C) or O(V+E)', 'O(R·C) or O(V)'],
      ['Bipartite BFS coloring', 'color dict + deque', 'O(V+E)', 'O(V)'],
      ['Topological sort (Kahn)', 'indegree array + deque', 'O(V+E)', 'O(V)'],
      ['Cycle detection, directed', 'color array (3-state)', 'O(V+E)', 'O(V)'],
      ['Union-Find', 'parent array + rank, path compression', '~O(1) amortized/op', 'O(V)'],
      ['Dijkstra', 'min-heap + dist dict', 'O((V+E) log V)', 'O(V+E)'],
      ["Prim's MST", 'min-heap + visited set', 'O(E log V)', 'O(V+E)'],
      ["Kruskal's MST", 'sorted edges + Union-Find', 'O(E log E)', 'O(V+E)'],
    ],
  },
  {
    kind: 'list',
    title: 'Say it out loud: BFS & DFS',
    items: [
      'Node = state/entity. Edge = a direct relationship, or one valid move.',
      "BFS marks visited the moment it's enqueued, not when it's popped.",
      'DFS marks visited the moment a node is entered, before recursing.',
      'BFS explores level by level — first time reached is shortest, unweighted.',
      'DFS can run deep down a wrong path before backtracking — fine for existence.',
      'Deep recursive DFS risks stack overflow on skewed graphs — mention the iterative fallback.',
      'Build and traverse are each O(V+E) — say it once, it applies everywhere here.',
      'Weighted edges break plain BFS — that signal alone should say "Dijkstra".',
    ],
  },
]

const recall = [
  { prompt: 'Undirected edge a↔b in an adjacency list?', answer: 'graph[a].append(b); graph[b].append(a)' },
  { prompt: 'Why mark visited on ENQUEUE, not on pop?', answer: "so the same node can't be queued twice before it's processed" },
  { prompt: 'BFS is shortest path only when?', answer: 'edges are unweighted — every edge costs 1' },
  { prompt: 'Grid neighbor expansion skeleton?', answer: 'for dr, dc in directions: nr, nc = r+dr, c+dc; check 0<=nr<rows and 0<=nc<cols' },
  { prompt: 'Count connected components, DFS style?', answer: 'count = 0; for node not in seen: dfs(node); count += 1' },
  { prompt: 'Count connected components, Union-Find style?', answer: 'components = n; components -= union(a, b) for each edge' },
  { prompt: 'Detect a cycle in an UNDIRECTED graph during DFS?', answer: 'pass parent in; a seen neighbor that is not parent means a cycle' },
  { prompt: 'Detect a cycle in a DIRECTED graph?', answer: '3-color DFS — hitting a GRAY node means a cycle' },
  { prompt: "Topo sort's cycle check?", answer: 'len(order) < n once the Kahn loop drains the queue' },
  { prompt: 'Dijkstra: how do you skip a stale heap entry?', answer: 'if d > dist.get(node, math.inf): continue' },
  { prompt: 'When does Dijkstra degrade into plain BFS?', answer: 'when every edge weight equals 1' },
  { prompt: "Prim's MST: starts where, tracks what?", answer: 'any node (0); a visited set + a min-heap of (weight, node)' },
  { prompt: "Kruskal's MST needs which two things?", answer: 'edges sorted by weight + Union-Find to skip cycle-closing edges' },
  { prompt: 'Multi-source BFS: how do you seed the queue?', answer: 'push ALL source cells at once, every one at distance 0' },
  { prompt: 'Bipartite check fails exactly when?', answer: 'a neighbor already has the SAME color as the current node' },
  { prompt: 'Recursion depth risk on a graph — the fix?', answer: 'deep/skewed graph: swap recursive DFS for the iterative stack version' },
]

const quiz = [
  { id: 'dayof:graphs:q1', q: 'Undirected graph, building the adjacency list. Which line is missing?', code: 'graph = dd(list)\nfor a, b in edges:\n    graph[a].append(b)', choices: ['graph[a].append(a)', 'seen.add(a)', 'graph[b].append(a)', 'graph[a].remove(b)'], answer: 2, why: 'Undirected edges go both ways — add the reverse direction too.', skills: ['graph-modeling'] },
  { id: 'dayof:graphs:q2', q: 'This BFS can queue the same node twice. Which fix is correct?', code: 'queue = deque([start])\nseen = set()\nwhile queue:\n    node = queue.popleft()\n    seen.add(node)\n    for nei in graph[node]:\n        if nei not in seen:\n            queue.append(nei)', choices: ['seen.add(node) once, before the while loop starts', 'seen.add(nei) right before queue.append(nei), inside the for loop', 'check if queue is empty before appending', 'use a list instead of a deque'], answer: 1, why: 'Mark visited at enqueue time — marking at pop lets duplicates queue up first.', skills: ['graph-bfs'] },
  { id: 'dayof:graphs:q3', q: "Dijkstra pops (d, node) off the heap. Which check belongs right after?", choices: ['if node in seen: break', 'if d < 0: continue', 'heap.sort() first', 'if d > dist.get(node, math.inf): continue'], answer: 3, why: 'A node can be pushed at several distances — skip any pop worse than the best known.', skills: ['dijkstra'] },
  { id: 'dayof:graphs:q4', q: 'Count connected components in O(V+E) without Union-Find. Which DS pairing?', choices: ['a heap of all edges', 'adjacency list + seen set, DFS/BFS from every unvisited node', 'a trie of node ids', 'a sorted array of nodes'], answer: 1, why: 'Run DFS/BFS from each unvisited node once; each run is one component.', skills: ['graph-dfs', 'ds-diagnosis'] },
  { id: 'dayof:graphs:q5', q: 'Time complexity of DFS over a graph with V nodes, E edges, adjacency list?', choices: ['O(V·E)', 'O(V²)', 'O(V+E)', 'O(E log V)'], answer: 2, why: 'Every node is visited once and every edge is checked once.', skills: ['complexity', 'graph-dfs'] },
  { id: 'dayof:graphs:q6', q: "edges = [[0,1],[1,2],[2,0]], n = 3. What does Kahn's topo sort return?", choices: ['[0, 1, 2]', '[2, 1, 0]', '[0, 1, 2, 0]', '[] — no node ever reaches indegree 0'], answer: 3, why: 'Every node has indegree 1 from the cycle — the queue starts empty, order stays empty.', skills: ['topo-sort'] },
  { id: 'dayof:graphs:q7', q: 'Which algorithm becomes plain BFS once every edge weight equals 1?', choices: ["Prim's", 'Dijkstra', "Kruskal's", 'Union-Find'], answer: 1, why: "Dijkstra's heap-pop-smallest-distance collapses to BFS's queue when all weights are 1.", skills: ['dijkstra', 'graph-bfs'] },
  { id: 'dayof:graphs:q8', q: "Union-Find's find(), with path compression — amortized cost per call?", choices: ['O(log n)', 'O(n)', '~O(1) in practice', 'O(n log n)'], answer: 2, why: 'Path compression plus union by rank flattens the trees to near-constant time.', skills: ['union-find', 'complexity'] },
  { id: 'dayof:graphs:q9', q: 'union(a, b) returns False. What does that tell you?', choices: ['a and b are already in the same group — this edge is redundant', 'a or b is missing from the structure', 'the union operation failed', 'a == b always'], answer: 0, why: 'find(a) == find(b) already, so merging does nothing — a classic redundant-edge signal.', skills: ['union-find'] },
  { id: 'dayof:graphs:q10', q: "Grid DFS marks a cell visited with grid[r][c] = '0'. When do you need a seen set instead?", choices: ['when the grid is small', 'when using BFS instead of DFS', 'never — in-place is always fine', 'when you must not mutate the input grid'], answer: 3, why: "Mutating the input works, but it's destructive — keep a seen set when the grid must stay intact.", skills: ['grid', 'ds-diagnosis'] },
  { id: 'dayof:graphs:q11', q: 'Rotting-oranges-style problem: several sources, spread outward together. Which template?', choices: ['Dijkstra from node 0', 'Single-source BFS, looped per source', 'Multi-source BFS', 'Union-Find'], answer: 2, why: 'Seed the queue with every source at distance 0, so levels advance together.', skills: ['graph-bfs'] },
  { id: 'dayof:graphs:q12', q: 'MST: grow one tree outward from a node, heap + visited set. Which algorithm?', choices: ["Kruskal's", "Prim's", 'Dijkstra', 'Topological sort'], answer: 1, why: "Growing outward from a single start node with a heap is exactly Prim's.", skills: ['mst'] },
  { id: 'dayof:graphs:q13', q: 'MST: sort every edge once, skip ones that would close a cycle. Algorithm + enabling DS?', choices: ["Prim's; a heap", 'Dijkstra; a dist dict', "Kruskal's; Union-Find", 'DFS; a seen set'], answer: 2, why: "Kruskal's needs sorted edges plus Union-Find to reject cycle-closing edges in O(1)-ish time.", skills: ['mst', 'union-find'] },
  { id: 'dayof:graphs:q14', q: "Directed graph cycle check. Why doesn't a plain seen set work?", choices: ['seen sets are too slow for this', "a node fully explored and popped off the path isn't a cycle, but a flat seen set can't tell", 'directed graphs never have cycles', 'it works fine, no issue'], answer: 1, why: 'You need 3 states (white/gray/black) to distinguish "on my current path" from "done".', skills: ['graph-dfs'] },
  { id: 'dayof:graphs:q15', q: '3-color DFS: the inner loop hits a GRAY neighbor. What does that mean?', choices: ['a brand-new component', 'the search just finished', 'that neighbor is disconnected', 'a cycle — a back edge to a node still on the current path'], answer: 3, why: 'GRAY means "currently on the recursion stack" — reaching it again is a back edge.', skills: ['graph-dfs'] },
  { id: 'dayof:graphs:q16', q: 'Dijkstra on a graph with a negative edge weight — what breaks?', choices: ['nothing, Dijkstra still works correctly', "heapq can't store negative numbers", "the greedy 'pop the closest first' assumption; switch to Bellman-Ford", 'you must switch to plain BFS instead'], answer: 2, why: "A later, cheaper path through a negative edge can undercut a distance already finalized.", skills: ['dijkstra'] },
  { id: 'dayof:graphs:q17', q: 'Shortest path with at most k stops allowed. Best-fit algorithm?', choices: ['Dijkstra, unmodified', 'Bellman-Ford, relaxing edges k+1 times', "Prim's MST", 'Union-Find'], answer: 1, why: "Dijkstra has no clean stop-count limit; bounding Bellman-Ford's relax rounds enforces k.", skills: ['dijkstra'] },
  { id: 'dayof:graphs:q18', q: 'Space complexity of BFS on a graph with V nodes, E edges?', choices: ['O(E)', 'O(V+E)', 'O(V)', 'O(1)'], answer: 2, why: 'The queue and seen set hold at most all V nodes — edges are only read, not stored again.', skills: ['complexity', 'graph-bfs'] },
  { id: 'dayof:graphs:q19', q: 'BFS two-coloring fails to be bipartite exactly when?', choices: ['a neighbor already has the same color as the current node', 'the graph is disconnected', 'the graph has more than 2 nodes', 'the graph has zero edges'], answer: 0, why: 'A same-color neighbor means the graph needs 2 nodes in one group to be adjacent — a clash.', skills: ['graph-bfs', 'graph-modeling'] },
  { id: 'dayof:graphs:q20', q: 'adjacency = {0:[1], 1:[2], 2:[]}. Recursive DFS from 0 visits in what order?', choices: ['0, 2, 1', '0, 1, 2', '2, 1, 0', '1, 0, 2'], answer: 1, why: '0 recurses into its only neighbor 1, which recurses into its only neighbor 2.', skills: ['graph-dfs'] },
  { id: 'dayof:graphs:q21', q: 'Which data structure makes Dijkstra pick the next-closest unvisited node in O(log V)?', choices: ['a plain stack', 'a deque', 'a sorted array, re-sorted each pop', 'a min-heap'], answer: 3, why: 'heapq keeps the smallest distance at index 0 and pushes/pops in O(log n).', skills: ['dijkstra', 'ds-diagnosis'] },
  { id: 'dayof:graphs:q22', q: 'Grid problem, R·C up to 10^5 total cells. Target complexity for a full traversal?', choices: ['O(R·C log(R·C))', 'O(R·C)', 'O((R·C)²)', 'O(R+C)'], answer: 1, why: 'Each cell is visited once with O(1) neighbor work — linear in the number of cells.', skills: ['complexity', 'grid'] },
]

export default {
  id: 'graphs',
  title: 'Graph boilerplates',
  icon: 'web',
  minutes: 35,
  summary,
  sections,
  recall,
  quiz,
}
