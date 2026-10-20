const rotate = (choices, answer, shift) => ({
  choices: choices.map((_, j) => choices[(j + shift) % choices.length]),
  answer: (answer - shift + choices.length) % choices.length,
})

const mcqRows = [
  [['graph-modeling'], 1, 'Employees report to managers, forming a hierarchy with no cycles. Best model?', ['Tree (a special case of a DAG)', 'General undirected graph', 'Weighted graph needing Dijkstra', 'Union-Find only'], 0, 'One parent per node, no cycles: a tree.'],
  [['graph-modeling'], 1, '"If A knows B and B knows C, A and C are in the same friend circle." Model?', ['Connected components of an undirected graph', 'Shortest path', 'Topological sort', 'Minimum spanning tree'], 0, 'Transitivity of "same circle" is exactly connectivity.'],
  [['graph-modeling'], 2, '"Word A transforms into word B by changing one letter." Edges connect:', ['Words that differ by exactly one letter', 'Every pair of words', 'Words of the same length only', 'Words sharing a prefix'], 0, 'One-letter difference defines the adjacency.'],
  [['graph-modeling', 'topo-sort'], 1, '"Course B requires course A first." Edge direction should be:', ['A → B', 'B → A', 'Undirected', 'No edge needed'], 0, 'Topological order needs prerequisite pointing to dependent.'],
  [['graph-modeling'], 2, '"Fewest flights from city A to city B," ignoring price. Treat edges as:', ['Unweighted (plain BFS)', 'Weighted by price (Dijkstra)', 'Weighted by distance', 'A sorted list'], 0, 'Counting edges, not cost, is unweighted shortest path.'],
  [['graph-modeling'], 2, 'Equations like a/b = 2.0, b/c = 3.0; answer a/c = ? Best model?', ['Weighted directed graph; multiply ratios along a path', 'Unweighted BFS', 'Union-Find only', 'Sort the equations'], 0, 'Each edge is a ratio; the query multiplies ratios along a found path.'],
  [['graph-modeling', 'mst'], 1, '"Minimum cost to connect all computers with cables, cost given per pair." Best approach class?', ['Minimum Spanning Tree', 'Shortest path', 'Topological sort', 'Backtracking'], 0, 'Connect everything at minimum total edge weight: MST.'],
  [['graph-modeling', 'union-find'], 2, 'Detect whether adding one more edge to an undirected forest creates a cycle. Best tool?', ['Union-Find', 'BFS from scratch each time', 'Sorting', 'Topological sort'], 0, 'union(a, b) returning "already same root" is instant cycle detection.'],
  [['graph-modeling'], 1, '"Can a message reach from server A to server B," cost irrelevant. Which fits?', ['Reachability via DFS/BFS', 'Dijkstra', 'MST', 'Topological sort'], 0, 'Pure reachability needs no weights, just a traversal.'],
  [['graph-modeling', 'grid'], 2, 'Grid where moving between adjacent cells has different costs. Best representation?', ['Weighted graph over cells, edge cost = move cost', 'Unweighted BFS', 'Union-Find', 'Sorting cells by value'], 0, 'Costs vary, so model cells as nodes and moves as weighted edges.'],
  [['graph-dfs'], 1, 'Keys and Rooms: room i has keys to other rooms, start in room 0. Can you visit all rooms? Approach:', ['DFS/BFS from room 0, collect the reachable set', 'Union-Find', 'Topological sort', 'Dijkstra'], 0, 'Just reachability from a single start.'],
  [['graph-dfs', 'backtracking'], 2, '"All Paths From Source to Target" in a DAG: expected technique?', ['DFS with backtracking, since every path must be listed', 'A single BFS pass', 'Union-Find', 'Greedy'], 0, 'Enumerating all paths is exponential in general; backtracking DFS is required.'],
  [['graph-dfs'], 2, 'DFS coloring for bipartite check: a neighbor already has the SAME color as the current node. Conclusion?', ['Not bipartite', 'Bipartite', 'Need BFS instead', 'Graph has no edges'], 0, 'Two adjacent same-colored nodes violate the bipartite property.'],
  [['graph-dfs'], 1, 'Is Graph Bipartite: node v gets color 1 and recurses into its neighbors. Each neighbor must get:', ['-1', '1', '0', 'A random color'], 0, 'Adjacent nodes must alternate colors.'],
  [['graph-dfs'], 2, 'Time Needed to Inform Employees: tree where a manager informs direct reports, each edge has an informTime. Total time is:', ['The maximum root-to-leaf sum of informTime along any path', 'The sum of all informTime values', 'The number of employees', 'The widest BFS level'], 0, 'The last employee informed sits at the end of the longest-duration path from the root.'],
  [['graph-dfs', 'graph-modeling'], 2, 'Evaluate Division: DFS from a to c multiplies edge weights along the path. If no path exists, return:', ['-1.0', '0', '1.0', 'infinity'], 0, 'Convention for an unanswerable query.'],
  [['graph-dfs'], 3, 'Reconstruct Itinerary (Eulerian path): why greedily pick the lexicographically smallest unused ticket AND still backtrack?', ['Pure greedy can dead-end; post-order backtracking fixes it into the correct itinerary', 'Only the smallest ticket ever matters', 'Backtracking is unnecessary here', 'Order never matters'], 0, 'Greedy alone can strand itself; appending nodes post-order and reversing recovers a valid Eulerian path.'],
  [['graph-dfs'], 2, 'Recursive flood fill (paint bucket) on a 1000×1000 same-colored image. Primary Python risk?', ['RecursionError from the default recursion limit', 'Wrong answer', 'Integer overflow', 'O(n log n) blowup'], 0, 'A million cells can chain into one deep call stack past the ~1000 default limit.'],
  [['graph-dfs', 'backtracking'], 3, 'All Paths From Source to Target, n = 15 nodes. Worst-case number of distinct paths is bounded by about:', ['2ⁿ', 'n²', 'n!', 'n'], 0, 'Each intermediate node is roughly an include/exclude choice, bounding paths near 2ⁿ.'],
  [['graph-dfs', 'topo-sort'], 2, 'Directed-cycle DFS marks nodes UNVISITED / VISITING / VISITED. A back edge points to a node marked:', ['VISITING', 'VISITED', 'UNVISITED', 'Either VISITED or UNVISITED'], 0, 'An edge back onto the current recursion path (VISITING) is the cycle signature.'],
  [['graph-bfs', 'grid'], 1, '01 Matrix: find each cell\'s distance to the nearest 0. Efficient approach?', ['Multi-source BFS starting from every 0 cell at once', 'BFS once per cell', 'DFS from each 1 cell', 'Dijkstra per cell'], 0, 'Starting all zeros simultaneously gives true shortest distances in one O(r·c) pass.'],
  [['graph-bfs', 'grid'], 2, 'As Far from Land as Possible: maximize a water cell\'s distance to the nearest land. Approach mirrors:', ['Multi-source BFS from all land cells', 'Single-source BFS from (0,0)', 'DFS with memoization only', 'Union-Find'], 0, 'Same multi-source BFS pattern as 01 Matrix, started from land instead of zeros.'],
  [['graph-bfs'], 3, 'Shortest Path to Get All Keys: the BFS queue state should be:', ['(row, col, keysBitmask)', '(row, col) only', 'keysBitmask only', '(row, col, path so far)'], 0, 'The same cell is worth revisiting with a different set of collected keys.'],
  [['graph-bfs'], 2, 'Minimum Genetic Mutation (word-ladder style over "A","C","G","T"): generating neighbors for an 8-character string costs:', ['O(8 · 4) per string', 'O(n) comparisons against every other string', 'O(4⁸)', 'O(n²)'], 0, '8 positions × 4 possible letters is far cheaper than comparing against the whole list.'],
  [['graph-bfs'], 2, 'Snakes and Ladders: board flattened to 1..n², a die roll (1-6) is an edge. Fewest rolls to win?', ['BFS shortest path over up to 6 next squares per move', 'DFS trying all paths', 'DP over dice counts only', 'Greedy: always take the highest ladder'], 0, 'Unweighted shortest path over a state graph is BFS.'],
  [['graph-bfs'], 3, 'Shortest Path Visiting All Nodes (n ≤ 12): the BFS state space is roughly:', ['n · 2ⁿ, pairs of (node, visited-mask)', 'n²', '2ⁿ only', 'n!'], 0, 'Bitmask BFS tracks current node and which nodes have been visited.'],
  [['graph-bfs'], 1, 'A BFS queue is initialized with several starting nodes all at distance 0. This pattern is:', ['Multi-source BFS', 'Bidirectional BFS', '0-1 BFS', 'Dijkstra'], 0, 'Multiple simultaneous sources, one shared frontier.'],
  [['graph-bfs'], 2, '0-1 BFS (edge weights only 0 or 1) replaces the heap with:', ['A deque: push 0-weight relaxations to the front, 1-weight to the back', 'A stack', 'A sorted list', 'A trie'], 0, 'Front/back pushes keep the deque in non-decreasing distance order without a heap.'],
  [['graph-bfs'], 2, 'Bidirectional BFS (from source and target) stops successfully when a node appears in:', ['Both frontiers', 'Only the source frontier', 'Only the target frontier', 'Neither frontier'], 0, 'A shared node means the two searches have met.'],
  [['graph-bfs'], 2, 'Open the Lock: BFS over 4-digit combinations, each wheel can turn +1/-1. The state space size is bounded by:', ['10⁴', '8⁴', '4¹⁰', 'Unbounded'], 0, '4 wheels, 10 digits each, gives at most 10,000 distinct states.'],
  [['grid', 'graph-bfs'], 2, 'Shortest Bridge: a grid has exactly two islands. Overall approach?', ['DFS to mark one island, then multi-source BFS from it toward the other', 'A single BFS from (0,0)', 'Union-Find per cell only', 'Dijkstra from every cell'], 0, 'Mark the first island, then expand outward layer by layer until the second island is hit.'],
  [['grid', 'graph-bfs'], 3, 'Shortest Path in a Grid with Obstacles Elimination: the BFS state must include:', ['(row, col, obstaclesRemaining)', '(row, col) only', '(row, col, steps)', 'obstaclesRemaining only'], 0, 'The same cell with more eliminations left is still worth exploring again.'],
  [['grid', 'backtracking'], 3, 'Unique Paths III: walk over every empty square exactly once between a fixed start and end. Right paradigm:', ['Backtracking DFS over the full path, not DP', '2-D DP like Unique Paths I/II', 'Greedy', 'Plain BFS shortest path'], 0, 'Visiting every cell exactly once is a Hamiltonian-path constraint, so there is no simple optimal substructure.'],
  [['grid', 'graph-dfs'], 3, 'Counting distinct island SHAPES (not just the count): the key extra step is:', ['Record each island\'s cell offsets relative to its start cell in a set', 'Count DFS calls per island', 'Sort islands by size', 'Use BFS instead of DFS'], 0, 'Offsets normalize an island\'s shape regardless of where it sits in the grid.'],
  [['grid'], 3, 'Battleships in a Board: count ships (no two adjacent) without a full flood fill, by counting a cell as a NEW ship only when:', ['Its left and top neighbors are not also "X"', 'It is surrounded by water', 'It sits at (0,0)', 'DFS visits it last'], 0, 'Only the top-left corner of each ship is counted, in O(1) per cell.'],
  [['grid'], 2, 'A grid DFS checks `grid[r][c] == 1`, but the grid actually stores strings like "1". Symptom?', ['Every cell looks like water: the answer is wrong (often 0)', 'It crashes', 'It works fine', 'Infinite loop'], 0, '"1" != 1 in Python, so the land check silently always fails.'],
  [['grid', 'constraints'], 1, 'A grid problem states rows, cols ≤ 1000 and asks for a traversal. Target complexity:', ['O(r · c)', 'O((r · c) log(r · c))', 'O((r · c)²)', 'O(2^(r·c))'], 0, '10⁶ cells visited once each fits comfortably; squaring it would not.'],
  [['grid', 'graph-dfs'], 2, 'Surrounded Regions-style problems mark border-connected cells first because:', ['Only cells touching the border can possibly escape capture', 'It is faster to start there', 'Border cells are always "O"', 'DFS requires starting at edges'], 0, 'Anything not reachable from the border is, by elimination, enclosed.'],
  [['grid'], 2, 'A grid traversal uses a `seen` set of (r, c) tuples instead of mutating the grid. The tradeoff is:', ['Extra O(r · c) space, but the input grid stays unmodified', 'Strictly faster time complexity', 'No tradeoff at all', 'BFS becomes invalid'], 0, 'Same time complexity, more space, but a clean (unmutated) input.'],
  [['grid'], 2, 'A number-of-islands variant also counts DIAGONAL neighbors as connected. The direction set becomes:', ['8 directions instead of 4', 'Still 4 directions', '2 directions', '12 directions'], 0, 'Diagonal connectivity adds the four corner neighbors.'],
  [['topo-sort'], 2, 'Minimum Height Trees: repeatedly remove all current leaves (degree 1), layer by layer. The 1-2 nodes left are:', ['The root(s) that minimize the tree\'s height', 'Always exactly one node', 'The nodes with the most edges', 'Chosen at random'], 0, 'Peeling leaves from the outside in converges on the tree\'s center.'],
  [['topo-sort'], 2, 'Parallel Courses: each course takes 1 time unit, prerequisites form a DAG. Minimum time to finish all courses equals:', ['The number of BFS layers in Kahn\'s topological sort', 'The total number of courses', 'The number of courses with zero prerequisites', 'The number of edges'], 0, 'Each layer can run in parallel; the layer count is the longest prerequisite chain.'],
  [['topo-sort'], 3, 'Sequence Reconstruction: check whether `org` is the UNIQUE topological order of given sequences. The order is unique when:', ['At every step of Kahn\'s BFS exactly one node has indegree 0', 'The graph has no edges', 'Any valid topological sort exists', 'DFS visits nodes in array order'], 0, 'A tie (two indegree-0 nodes at once) means more than one valid order exists.'],
  [['topo-sort', 'graph-modeling'], 3, 'Alien Dictionary: comparing adjacent words, word1 is longer than word2 but word2 is a proper prefix of word1, and word1 comes FIRST. Result:', ['Invalid ordering: return ""', 'No edge needed', 'Edge word1 → word2', 'Edge word2 → word1'], 0, 'A longer word cannot validly precede its own prefix in any dictionary order.'],
  [['topo-sort'], 1, 'Course Schedule II: Kahn\'s algorithm produces an order with length less than numCourses. Correct return value:', ['An empty array (a cycle was detected)', 'The partial order as-is', 'Raise an error', 'Sort it anyway and return'], 0, 'Fewer nodes than expected in the topo order means some courses are stuck in a cycle.'],
  [['topo-sort', 'graph-dfs'], 2, 'DFS-based topological sort appends a node to the result list:', ['After recursing into all of its neighbors (postorder), then the whole list is reversed', 'Before recursing into any neighbor', 'Partway through recursion', 'Never — only Kahn\'s builds an order'], 0, 'Postorder finishes dependencies first; reversing puts prerequisites first.'],
  [['topo-sort'], 3, 'Jobs are grouped, groups depend on each other, and jobs within a group also depend on each other. This needs:', ['Two separate topological sorts: one over groups, one over jobs within each group', 'A single DFS pass', 'Union-Find only', 'Sorting jobs by id'], 0, 'Group-level and job-level dependencies are independent DAGs layered on top of each other.'],
  [['topo-sort'], 2, 'A DAG has more than one valid topological order exactly when:', ['At some point in Kahn\'s BFS, more than one node has indegree 0', 'The graph has a cycle', 'The graph is a straight chain', 'Never — DAGs always have one order'], 0, 'A tie in available nodes means their relative order is free to choose.'],
  [['dijkstra'], 1, 'Dijkstra\'s algorithm gives wrong shortest paths when the graph has:', ['Negative edge weights', 'Many edges', 'Disconnected nodes', 'Self-loops'], 0, 'Dijkstra finalizes a distance on pop, assuming no future edge can ever improve it — false with negative weights.'],
  [['dijkstra'], 2, 'Bellman-Ford relaxes every edge V−1 times. A Vth round that STILL improves a distance means:', ['A negative weight cycle exists', 'The graph is disconnected', 'A bug in the indegree count', 'Nothing unusual, it is expected'], 0, 'Shortest paths are only well-defined up to V−1 edges unless a negative cycle keeps shrinking them.'],
  [['dijkstra'], 2, 'All-pairs shortest paths needed, V ≤ 400, graph fairly dense. Simplest fit?', ['Floyd-Warshall, O(V³)', 'BFS from every node (unweighted only)', 'Union-Find', 'Topological sort'], 0, '400³ ≈ 6.4·10⁷, comfortably fast, and Floyd-Warshall needs no special-casing for dense graphs.'],
  [['dijkstra'], 2, 'Dijkstra with a min-heap of (distance, node). Popping a node already finalized in `seen` means you should:', ['Skip it — a stale entry from lazy deletion', 'Recompute its distance', 'Push it again', 'Treat it as an error'], 0, 'Pushing every relaxation instead of decrease-key leaves stale duplicates to be skipped on pop.'],
  [['dijkstra'], 1, 'Why push every relaxation instead of decreasing an existing heap entry in Python Dijkstra?', ['heapq has no decrease-key; duplicates plus a skip-if-seen check are simpler', 'It is faster in theory', 'It avoids using a heap at all', 'BFS requires it'], 0, 'Lazy deletion sidesteps the missing decrease-key operation in heapq.'],
  [['dijkstra'], 2, 'Cheapest Flights Within K Stops: plain Dijkstra (ignoring the stop limit) can be WRONG because:', ['The globally cheapest path might use more stops than allowed', 'Dijkstra cannot handle positive weights', 'It is too slow', 'Weighted graphs always need BFS'], 0, 'Dijkstra finds the overall cheapest path, not the cheapest path under a hop budget.'],
  [['dijkstra'], 1, 'Bellman-Ford over E edges and V nodes costs:', ['O(V · E)', 'O(E log V)', 'O(V + E)', 'O(V²)'], 0, 'V−1 full passes, each relaxing all E edges.'],
  [['dijkstra'], 1, 'Dijkstra\'s time complexity with a binary heap, V nodes, E edges:', ['O((V + E) log V)', 'O(V²)', 'O(V + E)', 'O(E log E) only'], 0, 'Each edge can push once, each heap op costs log V.'],
  [['dijkstra'], 2, 'To reconstruct the actual shortest PATH (not just its length) in Dijkstra, you additionally track:', ['A parent pointer each time a node\'s distance improves', 'Nothing extra is needed', 'The heap contents at the end', 'A visited counter'], 0, 'Walking parent pointers back from the target rebuilds the path.'],
  [['dijkstra', 'grid'], 2, 'Minimax path (minimize the MAXIMUM edge on a path, e.g. Path With Minimum Effort): the relaxation rule becomes:', ['max(dist[u], weight) compared against dist[v]', 'dist[u] + weight, unchanged', 'min(dist[u], weight)', 'weight alone'], 0, 'Path cost is the worst single step, not a running sum, so relax with max.'],
  [['dijkstra'], 2, 'A* search improves on Dijkstra by:', ['Adding a heuristic estimate of remaining distance to prioritize the heap', 'Removing the heap entirely', 'Ignoring edge weights', 'Using DFS instead of a heap'], 0, 'A good heuristic focuses the search toward the goal instead of expanding uniformly.'],
  [['dijkstra'], 2, 'Negative edge weights but NO negative cycle, small graph. Correct shortest-path algorithm:', ['Bellman-Ford', 'Dijkstra', 'Plain BFS', 'Union-Find'], 0, 'Bellman-Ford tolerates negative edges as long as no negative cycle exists.'],
  [['mst'], 1, 'A Minimum Spanning Tree of a connected graph with n nodes always has exactly:', ['n − 1 edges', 'n edges', 'n + 1 edges', 'log n edges'], 0, 'A spanning tree on n nodes has n−1 edges by definition.'],
  [['mst', 'union-find'], 1, "Kruskal's algorithm processes edges in order of:", ['Increasing weight, skipping any that would form a cycle', 'Node id', 'Decreasing weight', 'DFS discovery order'], 0, 'Cheapest-first, Union-Find rejects edges that would close a cycle.'],
  [['mst', 'heap'], 1, "Prim's algorithm grows the MST by always adding:", ['The cheapest edge connecting the current tree to a new node', 'The cheapest edge overall, regardless of connection', 'A random unvisited node', 'The most expensive edge first'], 0, 'Prim grows one connected tree outward, always via its cheapest frontier edge.'],
  [['mst'], 2, 'Kruskal vs. Prim: Kruskal is usually preferred for:', ['Sparse graphs with an edge list already available', 'Dense graphs stored as adjacency matrices', 'Graphs with negative weights', 'Unweighted graphs'], 0, 'Sorting a short edge list and using Union-Find is cheap when E is small relative to V².'],
  [['mst', 'heap'], 2, 'Min Cost to Connect All Points (n points, Manhattan distance) via Prim\'s with a heap costs about:', ['O(n² log n)', 'O(n log n)', 'O(n²)', 'O(n³)'], 0, 'A dense graph has O(n²) candidate edges, each a possible heap push at log n cost.'],
  [['mst', 'union-find'], 1, 'Detecting whether adding an edge to a partially built MST creates a cycle is done with:', ["Union-Find's find() on both endpoints", 'BFS from scratch each time', 'Sorting again', 'A visited array alone'], 0, 'Same root for both endpoints means a cycle would form.'],
  [['mst'], 2, 'If an MST is not unique (ties in edge weight), which is true?', ['Multiple different spanning trees can share the same minimum total weight', 'The graph must be disconnected', 'Kruskal and Prim will fail', 'An MST never has weight ties'], 0, 'Ties allow structurally different trees with identical total cost.'],
  [['mst'], 1, 'MST algorithms assume the graph is:', ['Undirected and connected', 'Directed', 'Already a tree', 'Unweighted'], 0, 'A spanning tree over disconnected or directed input is not well-defined the same way.'],
  [['union-find'], 2, "Union-Find's find(x) with path compression (halving) does what on the way up?", ['Repoints nodes partway to the root, speeding future finds', 'Permanently sets every visited node to the same value in one shot', 'Nothing — it only reads', 'Rewrites the rank array'], 0, "parent[x] = parent[parent[x]] flattens the path a bit on every call."],
  [['union-find'], 1, 'Union by rank attaches:', ['The shorter tree under the root of the taller tree', 'Node 0 under node 1, always', 'The taller tree under the shorter one', 'Nodes in alphabetical order'], 0, 'Keeping the taller tree on top bounds height at O(log n).'],
  [['union-find'], 2, 'Number of Provinces (isConnected matrix) via Union-Find: the answer is:', ['The number of distinct roots after unioning all connected pairs', 'The number of 1s in the matrix', 'Always n', 'The matrix trace'], 0, 'Each remaining distinct root is one province.'],
  [['union-find'], 2, 'Redundant Connection: process edges in order, union endpoints. The first edge where union fails (same root already):', ['Is the edge to remove', 'Is always the last edge in the list', 'Cannot happen on valid input', 'Is found by sorting first'], 0, 'That edge is the one that would close a second path between already-connected nodes.'],
  [['union-find'], 2, 'Accounts Merge: union accounts sharing any email, then group emails by:', ['Their root parent', 'Account name only', 'Insertion order', 'Email string length'], 0, 'The Union-Find root identifies which merged account each email belongs to.'],
  [['union-find'], 2, 'With path compression AND union by rank together, each operation runs in:', ['Amortized O(α(n)), practically constant', 'O(log n) always', 'O(n)', 'O(1) worst case, guaranteed'], 0, 'α is the inverse Ackermann function — at most 4 or 5 for any realistic n.'],
  [['union-find'], 1, 'Union-Find is the wrong tool for:', ['Finding the actual shortest path between two nodes', 'Checking if two nodes are connected', 'Counting connected components', 'Detecting a cycle in an undirected graph'], 0, 'Union-Find answers connectivity questions, not path length or path shape.'],
  [['union-find'], 2, 'Graph Valid Tree (n nodes, an edge list), checked via Union-Find: return False as soon as:', ['A union fails because both endpoints already share a root (a cycle)', 'Any single edge is processed', 'n equals edges.length', 'The first union succeeds'], 0, 'A tree can have no cycles, so a same-root union is disqualifying.'],
]

const mcqs = mcqRows.map(([skills, difficulty, q, choices, answer, why], i) => ({
  id: `bank-graphs-dp:graphs:mcq:${i + 1}`,
  skills,
  difficulty,
  q,
  ...rotate(choices, answer, (i * 5 + 3) % 4),
  why,
}))

const clozeRows = [
  [['graph-modeling'], 'Weighted graph from equations (Evaluate Division)', `graph = dd(list)
for (a, b), val in zip(equations, values):
    graph[a].append((b, val))
    graph[b].append((a, [[1 / val|1/val]]))`, 'Each equation gives both directions.'],
  [['graph-modeling', 'topo-sort'], 'Adjacency list from prerequisites', `graph = dd(list)
indegree = [0] * numCourses

for course, pre in prerequisites:
    graph[[[pre]]].append(course)
    indegree[course] [[+= 1]]`],
  [['graph-dfs'], 'Keys and Rooms reachability', `def dfs(room):
    seen.add(room)
    for key in rooms[room]:
        if key not in seen:
            [[dfs(key)]]

dfs(0)
return len(seen) == [[len(rooms)]]`],
  [['graph-dfs'], 'Bipartite check by coloring', `def dfs(node, c):
    color[node] = c
    for nei in graph[node]:
        if color[nei] == c:
            return [[False]]
        if color[nei] == 0 and not dfs(nei, [[-c]]):
            return False
    return True`],
  [['graph-dfs', 'topo-sort'], 'Directed cycle check with 3 states', `state = [0] * n

def dfs(node):
    if state[node] == 1:
        return [[True]]
    if state[node] == 2:
        return False
    state[node] = [[1]]
    for nei in graph[node]:
        if dfs(nei):
            return True
    state[node] = [[2]]
    return False`, '1 = on the current path, 2 = fully explored.'],
  [['graph-bfs', 'grid'], 'Multi-source BFS: 01 Matrix', `queue = deque()
for r in range(rows):
    for c in range(cols):
        if mat[r][c] == 0:
            queue.append((r, c))
        else:
            mat[r][c] = [[-1]]

while queue:
    r, c = queue.popleft()
    for dr, dc in directions:
        nr, nc = r + dr, c + dc
        if 0 <= nr < rows and 0 <= nc < cols and mat[nr][nc] == -1:
            mat[nr][nc] = mat[r][c] + [[1]]
            queue.append((nr, nc))`],
  [['graph-bfs'], '0-1 BFS with a deque', `dist = [math.inf] * n
dist[0] = 0
dq = deque([0])

while dq:
    node = dq.popleft()
    for nei, w in graph[node]:
        if dist[node] + w < dist[nei]:
            dist[nei] = dist[node] + w
            if w == 0:
                dq.[[appendleft]](nei)
            else:
                dq.[[append]](nei)`, 'Zero-weight edges jump to the front, costing nothing extra.'],
  [['grid', 'graph-bfs'], 'Shortest Bridge: DFS mark, then BFS expand', `def dfs(r, c):
    grid[r][c] = 2
    island.append((r, c))
    for dr, dc in directions:
        nr, nc = r + dr, c + dc
        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
            dfs(nr, nc)

queue = deque(island)
steps = 0
while queue:
    for _ in range([[len(queue)]]):
        r, c = queue.popleft()
        for dr, dc in directions:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                return [[steps]]
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0:
                grid[nr][nc] = 2
                queue.append((nr, nc))
    steps [[+= 1]]`],
  [['grid', 'backtracking'], 'Unique Paths III backtracking', `def dfs(r, c, remaining):
    if grid[r][c] == 2:
        return 1 if remaining == [[0]] else 0

    temp, grid[r][c] = grid[r][c], -2
    total = 0
    for dr, dc in directions:
        nr, nc = r + dr, c + dc
        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] >= 0:
            total += dfs(nr, nc, remaining - [[1]])
    grid[r][c] = [[temp]]
    return total`],
  [['topo-sort'], 'Minimum Height Trees: trim leaves', `leaves = deque(node for node in range(n) if len(graph[node]) == [[1]])
remaining = n

while remaining > 2:
    remaining -= len(leaves)
    for _ in range(len(leaves)):
        leaf = leaves.popleft()
        neighbor = graph[leaf].pop()
        graph[neighbor].remove([[leaf]])
        if len(graph[neighbor]) == 1:
            leaves.append(neighbor)

return list(leaves)`],
  [['topo-sort', 'graph-modeling'], 'Alien Dictionary edge building', `for first, second in zip(words, words[1:]):
    minLen = min(len(first), len(second))
    if first[:minLen] == second[:minLen] and len(first) > len(second):
        return [[""]]
    for i in range(minLen):
        if first[i] != second[i]:
            graph[first[i]].add(second[i])
            indegree[second[i]] [[+= 1]]
            break`],
  [['topo-sort', 'graph-dfs'], 'DFS postorder topological sort', `seen = set()
order = []

def dfs(node):
    seen.add(node)
    for nei in graph[node]:
        if nei not in seen:
            dfs(nei)
    order.[[append]](node)

for node in range(n):
    if node not in seen:
        dfs(node)

return order[::[[-1]]]`],
  [['dijkstra'], 'Network delay time (Dijkstra)', `heap = [(0, k)]
dist = {}

while heap:
    time, node = heapq.heappop(heap)
    if node in dist:
        continue
    dist[node] = time
    for nei, w in graph[node]:
        if nei not in dist:
            heapq.heappush(heap, (time + [[w]], nei))

return max(dist.values()) if len(dist) == n else [[-1]]`],
  [['dijkstra', 'grid'], 'Minimax relaxation (Path With Minimum Effort)', `heap = [(0, 0, 0)]
effort = [ [0] * cols for _ in [[range(rows)]] ]
effort[0][0] = 0

while heap:
    curr, r, c = heapq.heappop(heap)
    if curr > effort[r][c]:
        continue
    for dr, dc in directions:
        nr, nc = r + dr, c + dc
        if 0 <= nr < rows and 0 <= nc < cols:
            step = [[max]](curr, abs(heights[nr][nc] - heights[r][c]))
            if step < effort[nr][nc]:
                effort[nr][nc] = step
                heapq.heappush(heap, (step, nr, nc))`, 'effort grid is initialized to infinity in the real solution; the blank is the combine rule.'],
  [['dijkstra'], 'Bellman-Ford rounds (Cheapest Flights Within K Stops)', `prices = [math.inf] * n
prices[src] = 0

for _ in range(k + 1):
    temp = prices[:]
    for u, v, w in flights:
        if prices[u] != math.inf and prices[u] + w < temp[v]:
            temp[v] = [[prices[u] + w]]
    prices = [[temp]]

return -1 if prices[dst] == math.inf else prices[dst]`],
  [['dijkstra'], 'Bellman-Ford negative cycle detection', `dist = [0] * n

for i in range(n):
    updated = False
    for u, v, w in edges:
        if dist[u] + w < dist[v]:
            dist[v] = dist[u] + w
            updated = True
    if i == n - 1 and updated:
        return [[True]]

return False`],
  [['mst', 'heap'], "Prim's MST with a heap", `seen = set()
heap = [(0, 0)]
total = 0

while len(seen) < n:
    cost, node = heapq.heappop(heap)
    if node in seen:
        continue
    seen.add(node)
    total [[+= cost]]
    for nei, w in graph[node]:
        if nei not in seen:
            heapq.heappush(heap, ([[w]], nei))

return total`],
  [['mst', 'union-find'], "Kruskal's MST with Union-Find", `edges.sort(key = lambda e: e[[[2]]])
parent = list(range(n))

def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x

total, used = 0, 0
for a, b, w in edges:
    pa, pb = find(a), find(b)
    if pa == pb:
        continue
    parent[pa] = [[pb]]
    total += w
    used += 1
    if used == n - 1:
        [[break]]`],
  [['union-find'], 'find + union by rank', `def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x

def union(a, b):
    ra, rb = find(a), find(b)
    if ra == rb:
        return False
    if rank[ra] < rank[rb]:
        ra, rb = rb, ra
    parent[rb] = [[ra]]
    if rank[ra] == rank[rb]:
        rank[ra] [[+= 1]]
    return True`],
  [['union-find'], 'Number of Provinces via Union-Find', `parent = list(range(n))

def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x

for i in range(n):
    for j in range(i + 1, n):
        if isConnected[i][j] == 1:
            parent[find(i)] = [[find(j)]]

return len({[[find]](x) for x in range(n)})`],
]

const clozes = clozeRows.map(([skills, title, code, hint], i) => ({
  id: `bank-graphs-dp:graphs:cloze:${i + 1}`,
  skills,
  title,
  code,
  ...(hint ? { hint } : {}),
}))

const parsonsRows = [
  [['graph-dfs', 'graph-bfs'], 'Is Graph Bipartite (BFS coloring)', [
    'def isBipartite(self, graph: List[List[int]]) -> bool:',
    '    color = {}',
    '    for start in range(len(graph)):',
    '        if start in color:',
    '            continue',
    '        color[start] = 0',
    '        queue = deque([start])',
    '        while queue:',
    '            node = queue.popleft()',
    '            for nei in graph[node]:',
    '                if nei not in color:',
    '                    color[nei] = 1 - color[node]',
    '                    queue.append(nei)',
    '                elif color[nei] == color[node]:',
    '                    return False',
    '    return True',
  ], ['                    color[nei] = color[node]']],
  [['union-find'], 'Redundant Connection (Union-Find)', [
    'def findRedundantConnection(self, edges: List[List[int]]) -> List[int]:',
    '    parent = list(range(len(edges) + 1))',
    '    def find(x):',
    '        while parent[x] != x:',
    '            parent[x] = parent[parent[x]]',
    '            x = parent[x]',
    '        return x',
    '    for a, b in edges:',
    '        ra, rb = find(a), find(b)',
    '        if ra == rb:',
    '            return [a, b]',
    '        parent[ra] = rb',
    '    return []',
  ], ['    parent[a] = b']],
  [['mst', 'union-find'], "Kruskal's MST", [
    'def minCostConnectPoints(self, points: List[List[int]]) -> int:',
    '    n = len(points)',
    '    edges = []',
    '    for i in range(n):',
    '        for j in range(i + 1, n):',
    '            dist = abs(points[i][0] - points[j][0]) + abs(points[i][1] - points[j][1])',
    '            edges.append((dist, i, j))',
    '    edges.sort()',
    '    parent = list(range(n))',
    '    def find(x):',
    '        while parent[x] != x:',
    '            parent[x] = parent[parent[x]]',
    '            x = parent[x]',
    '        return x',
    '    total, used = 0, 0',
    '    for dist, i, j in edges:',
    '        pi, pj = find(i), find(j)',
    '        if pi == pj:',
    '            continue',
    '        parent[pi] = pj',
    '        total += dist',
    '        used += 1',
    '        if used == n - 1:',
    '            break',
    '    return total',
  ], ['    edges.sort(reverse = True)']],
  [['mst', 'heap'], "Prim's MST", [
    'def minCostConnectPoints(self, points: List[List[int]]) -> int:',
    '    n = len(points)',
    '    seen = set()',
    '    heap = [(0, 0)]',
    '    total = 0',
    '    while len(seen) < n:',
    '        cost, i = heapq.heappop(heap)',
    '        if i in seen:',
    '            continue',
    '        seen.add(i)',
    '        total += cost',
    '        for j in range(n):',
    '            if j not in seen:',
    '                dist = abs(points[i][0] - points[j][0]) + abs(points[i][1] - points[j][1])',
    '                heapq.heappush(heap, (dist, j))',
    '    return total',
  ], ['                heapq.heappush(heap, (dist, i))']],
  [['dijkstra'], 'Network Delay Time (Dijkstra)', [
    'def networkDelayTime(self, times: List[List[int]], n: int, k: int) -> int:',
    '    graph = defaultdict(list)',
    '    for u, v, w in times:',
    '        graph[u].append((v, w))',
    '    heap = [(0, k)]',
    '    dist = {}',
    '    while heap:',
    '        time, node = heapq.heappop(heap)',
    '        if node in dist:',
    '            continue',
    '        dist[node] = time',
    '        for nei, w in graph[node]:',
    '            if nei not in dist:',
    '                heapq.heappush(heap, (time + w, nei))',
    '    return max(dist.values()) if len(dist) == n else -1',
  ], ['        dist[node] = min(dist.get(node, math.inf), time)']],
  [['dijkstra'], 'Cheapest Flights Within K Stops (Bellman-Ford)', [
    'def findCheapestPrice(self, n: int, flights: List[List[int]], src: int, dst: int, k: int) -> int:',
    '    prices = [math.inf] * n',
    '    prices[src] = 0',
    '    for _ in range(k + 1):',
    '        temp = prices[:]',
    '        for u, v, w in flights:',
    '            if prices[u] != math.inf and prices[u] + w < temp[v]:',
    '                temp[v] = prices[u] + w',
    '        prices = temp',
    '    return -1 if prices[dst] == math.inf else prices[dst]',
  ], ['            prices[v] = min(prices[v], prices[u] + w)']],
  [['topo-sort'], 'Minimum Height Trees', [
    'def findMinHeightTrees(self, n: int, edges: List[List[int]]) -> List[int]:',
    '    if n == 1:',
    '        return [0]',
    '    graph = defaultdict(set)',
    '    for a, b in edges:',
    '        graph[a].add(b)',
    '        graph[b].add(a)',
    '    leaves = deque(node for node in range(n) if len(graph[node]) == 1)',
    '    remaining = n',
    '    while remaining > 2:',
    '        remaining -= len(leaves)',
    '        for _ in range(len(leaves)):',
    '            leaf = leaves.popleft()',
    '            neighbor = graph[leaf].pop()',
    '            graph[neighbor].remove(leaf)',
    '            if len(graph[neighbor]) == 1:',
    '                leaves.append(neighbor)',
    '    return list(leaves)',
  ], ['    return [leaves.popleft()]']],
  [['topo-sort'], 'Course Schedule II (Kahn\'s)', [
    'def findOrder(self, numCourses: int, prerequisites: List[List[int]]) -> List[int]:',
    '    graph = defaultdict(list)',
    '    indegree = [0] * numCourses',
    '    for course, pre in prerequisites:',
    '        graph[pre].append(course)',
    '        indegree[course] += 1',
    '    queue = deque(c for c in range(numCourses) if indegree[c] == 0)',
    '    order = []',
    '    while queue:',
    '        curr = queue.popleft()',
    '        order.append(curr)',
    '        for nxt in graph[curr]:',
    '            indegree[nxt] -= 1',
    '            if indegree[nxt] == 0:',
    '                queue.append(nxt)',
    '    return order if len(order) == numCourses else []',
  ], ['    return order']],
  [['graph-bfs', 'grid'], '01 Matrix (multi-source BFS)', [
    'def updateMatrix(self, mat: List[List[int]]) -> List[List[int]]:',
    '    rows, cols = len(mat), len(mat[0])',
    '    queue = deque()',
    '    for r in range(rows):',
    '        for c in range(cols):',
    '            if mat[r][c] == 0:',
    '                queue.append((r, c))',
    '            else:',
    '                mat[r][c] = -1',
    '    while queue:',
    '        r, c = queue.popleft()',
    '        for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:',
    '            nr, nc = r + dr, c + dc',
    '            if 0 <= nr < rows and 0 <= nc < cols and mat[nr][nc] == -1:',
    '                mat[nr][nc] = mat[r][c] + 1',
    '                queue.append((nr, nc))',
    '    return mat',
  ], ['                mat[nr][nc] = mat[r][c]']],
  [['union-find'], 'Accounts Merge (Union-Find)', [
    'def accountsMerge(self, accounts: List[List[str]]) -> List[List[str]]:',
    '    parent = list(range(len(accounts)))',
    '    def find(x):',
    '        while parent[x] != x:',
    '            parent[x] = parent[parent[x]]',
    '            x = parent[x]',
    '        return x',
    '    emailToAccount = {}',
    '    for i, account in enumerate(accounts):',
    '        for email in account[1:]:',
    '            if email in emailToAccount:',
    '                parent[find(i)] = find(emailToAccount[email])',
    '            else:',
    '                emailToAccount[email] = i',
    '    groups = defaultdict(set)',
    '    for email, i in emailToAccount.items():',
    '        groups[find(i)].add(email)',
    '    return [[accounts[root][0]] + sorted(emails) for root, emails in groups.items()]',
  ], ['            emailToAccount[email] = find(i)']],
  [['graph-bfs'], 'Shortest Path Visiting All Nodes (bitmask BFS)', [
    'def shortestPathLength(self, graph: List[List[int]]) -> int:',
    '    n = len(graph)',
    '    target = (1 << n) - 1',
    '    queue = deque((i, 1 << i, 0) for i in range(n))',
    '    seen = {(i, 1 << i) for i in range(n)}',
    '    while queue:',
    '        node, mask, steps = queue.popleft()',
    '        if mask == target:',
    '            return steps',
    '        for nei in graph[node]:',
    '            nmask = mask | (1 << nei)',
    '            if (nei, nmask) not in seen:',
    '                seen.add((nei, nmask))',
    '                queue.append((nei, nmask, steps + 1))',
    '    return -1',
  ], ['            nmask = mask & (1 << nei)']],
  [['union-find'], 'Union-Find: find + union by rank', [
    'def find(x):',
    '    while parent[x] != x:',
    '        parent[x] = parent[parent[x]]',
    '        x = parent[x]',
    '    return x',
    'def union(a, b):',
    '    ra, rb = find(a), find(b)',
    '    if ra == rb:',
    '        return False',
    '    if rank[ra] < rank[rb]:',
    '        ra, rb = rb, ra',
    '    parent[rb] = ra',
    '    if rank[ra] == rank[rb]:',
    '        rank[ra] += 1',
    '    return True',
  ], ['    parent[ra] = rb']],
]

const parsons = parsonsRows.map(([skills, title, lines, distractors], i) => ({
  id: `bank-graphs-dp:graphs:parsons:${i + 1}`,
  skills,
  title,
  lines,
  ...(distractors ? { distractors } : {}),
}))

const flashcardData = [
  [['graph-modeling'], 'How do you model "A must happen before B"?', 'Directed edge A → B; a valid order is a topological sort of the DAG.'],
  [['graph-modeling'], 'How do you model "friends know each other, is X connected to Y"?', 'Undirected graph; connectivity means same connected component.'],
  [['graph-modeling'], 'Fewest flights vs. cheapest flights — same graph, different weights?', 'Fewest edges → unweighted BFS. Cheapest → weighted shortest path (Dijkstra or Bellman-Ford).'],
  [['graph-modeling'], 'How to model ratios like a/b = 2.0 for a query a/c?', 'Weighted directed graph: edge a→b weight 2.0, edge b→a weight 0.5. Multiply weights along a found path.'],
  [['graph-modeling', 'mst'], 'Signal words "minimum cost to connect all nodes"?', 'Minimum Spanning Tree: Prim\'s or Kruskal\'s.'],
  [['graph-modeling'], 'Signal words "can reach", "is it possible to get from X to Y"?', 'Plain reachability: DFS or BFS, no weights needed.'],
  [['graph-dfs'], 'Keys and Rooms: what is the stopping condition?', 'All rooms visited: the reachable set\'s size equals the total room count.'],
  [['graph-dfs'], 'Why track a color (-1/0/1), not just a visited flag, for a bipartite check?', 'You need to know WHICH side a node is on, not just that it was seen.'],
  [['graph-dfs', 'topo-sort'], '3-color DFS cycle detection: what do the states mean?', '0 unvisited, 1 on the current path (visiting), 2 fully done. An edge into a state-1 node means a cycle.'],
  [['graph-dfs', 'backtracking'], 'All Paths From Source to Target: the backtracking rule?', 'Append the node to the path, recurse into neighbors, then pop it off before returning (undo the choice).'],
  [['graph-dfs'], 'DFS recursion depth risk in Python?', 'Default limit is about 1000; a long chain can hit RecursionError. Use iterative DFS or BFS instead.'],
  [['graph-dfs'], 'Evaluate Division: query variable never appeared in any equation?', 'Return -1.0 — it is not in the graph at all.'],
  [['graph-bfs'], 'Why BFS and not DFS for "fewest moves/steps"?', 'BFS explores in order of distance; the first time it reaches the target, that is the shortest path.'],
  [['graph-bfs'], 'What is multi-source BFS?', 'Start the queue with ALL source cells or nodes at distance 0 simultaneously, instead of one at a time.'],
  [['graph-bfs'], '0-1 BFS trick?', 'Use a deque: push 0-weight relaxations to the front, 1-weight to the back. Skips a full heap for 0/1 weights.'],
  [['graph-bfs'], 'Bitmask BFS: why include the mask in the visited state?', 'The same cell or node can be worth revisiting with a different set of collected items or keys.'],
  [['graph-bfs'], 'Bidirectional BFS speedup intuition?', 'Two searches of depth d/2 each explore about b^(d/2), far less than one search of depth d exploring b^d.'],
  [['graph-bfs'], 'Word-ladder style BFS: why mark a word seen when it is ENQUEUED, not when popped?', 'Prevents the same word from being queued again at a later, never-shorter BFS layer.'],
  [['grid', 'graph-bfs'], 'Shortest Bridge: two-phase approach?', 'DFS to find and collect all cells of the first island, then multi-source BFS from those cells toward the second.'],
  [['grid'], 'Grid with an obstacle-elimination budget k: why does BFS state need k?', 'The same cell reached with different remaining eliminations is a genuinely different, non-dominated state.'],
  [['grid', 'backtracking'], 'Unique Paths III style "visit every cell exactly once": why not DP?', 'There is no simple optimal substructure for an exact Hamiltonian path count, so backtracking DFS is required.'],
  [['grid', 'graph-dfs'], 'Counting distinct island SHAPES?', 'Normalize each island\'s cells to offsets from its first visited cell, store the shape as a set or tuple in a set.'],
  [['grid'], 'Common grid bug: comparing grid[r][c] == 1 when the stored values are strings?', '"1" != 1 in Python; check the actual stored type before comparing.'],
  [['grid'], 'Why mark visited by mutating the grid instead of a separate seen set?', 'O(1) extra space, but it destroys the input; use a seen set when the grid must stay intact.'],
  [['topo-sort'], 'Minimum Height Trees, the big idea?', 'Repeatedly strip leaves layer by layer; the 1-2 nodes left are the tree\'s center(s).'],
  [['topo-sort'], 'Parallel Courses: time to finish all courses?', 'Number of BFS layers in Kahn\'s algorithm, which equals the length of the longest prerequisite chain.'],
  [['topo-sort', 'graph-modeling'], 'Alien Dictionary: where does each edge come from?', 'The first differing character between each pair of adjacent words in the sorted list.'],
  [['topo-sort'], 'Sequence Reconstruction: when is the topo order unique?', 'When at every step of Kahn\'s BFS exactly one node has indegree 0.'],
  [['topo-sort', 'graph-dfs'], 'DFS topological sort: why reverse the postorder list?', 'Postorder finishes dependents (sinks) first; reversing puts prerequisites (sources) first.'],
  [['topo-sort'], 'A DAG\'s topological sort is unique exactly when?', 'The DAG has a Hamiltonian path — at every Kahn\'s BFS step, only one node has indegree 0.'],
  [['dijkstra'], 'Why does Dijkstra fail with negative edges?', 'It finalizes a distance the moment a node is popped, assuming nothing later can improve it — false if weights can be negative.'],
  [['dijkstra'], 'Bellman-Ford extra (Vth) round still improves a distance?', 'A negative weight cycle exists; shortest paths are undefined.'],
  [['dijkstra'], 'Dijkstra lazy deletion?', 'Push every relaxation instead of decreasing a heap key; skip a node on pop if it is already finalized.'],
  [['dijkstra', 'grid'], 'Minimax Dijkstra (minimize the max edge on a path)?', 'Relax with max(dist[u], weight) instead of dist[u] + weight.'],
  [['dijkstra'], 'Cheapest Flights Within K Stops: why not plain Dijkstra?', 'The globally cheapest path might use more stops than allowed; Bellman-Ford-style rounds cap edges used.'],
  [['dijkstra'], 'Reconstructing the actual shortest path, not just its length?', 'Store a parent pointer whenever a node\'s distance improves, then walk parents back from the target.'],
  [['dijkstra'], 'All-pairs shortest paths, small V (around ≤ 400)?', 'Floyd-Warshall: dp[k][i][j] = min(dp[i][j], dp[i][k] + dp[k][j]), O(V³).'],
  [['mst'], 'MST edge count?', 'Always n − 1 for n nodes in a connected graph.'],
  [['mst', 'union-find'], "Kruskal's algorithm in one line?", 'Sort all edges by weight; add each one unless its endpoints are already in the same Union-Find set.'],
  [['mst', 'heap'], "Prim's algorithm in one line?", 'Grow one tree: repeatedly add the cheapest edge connecting the tree to a new outside node, via a heap of candidates.'],
  [['mst'], 'Kruskal vs. Prim — when to prefer which?', 'Kruskal: sparse graphs, edges already listed. Prim: dense graphs, adjacency list or matrix, grows naturally with a heap.'],
  [['mst'], 'MST total weight when edge weights have ties?', 'The minimum total weight is unique, but which specific tree achieves it may not be.'],
  [['union-find'], 'Union-Find find(x) with path compression — the halving trick?', 'parent[x] = parent[parent[x]] before moving up; flattens the tree a bit on every call.'],
  [['union-find'], 'Union by rank or size — which tree hangs under which?', 'The smaller (shorter) tree\'s root attaches under the larger tree\'s root, keeping height around log n.'],
  [['union-find'], 'With both optimizations, each Union-Find operation costs?', 'Amortized O(α(n)), the inverse Ackermann function — effectively constant for any realistic n.'],
  [['union-find'], "Union-Find's two core operations?", 'find(x): which set x belongs to (its root). union(a, b): merge the sets containing a and b.'],
  [['union-find'], 'When is Union-Find the wrong tool?', 'When you need an actual path or shortest distance, not just "are these connected" — use BFS/DFS or Dijkstra instead.'],
  [['union-find'], 'Detect a cycle while building an undirected graph edge by edge?', 'union(a, b) returns False (same root already) the instant an edge would close a cycle.'],
]

const flashcards = flashcardData.map(([skills, front, back, code], i) => ({
  id: `bank-graphs-dp:graphs:card:${i + 1}`,
  skills,
  front,
  back,
  ...(code ? { code } : {}),
}))

const problems = [
  {
    id: 'bank-graphs-dp:problem:1135', lc: 1135, title: 'Connecting Cities With Minimum Cost', difficulty: 'Medium',
    skills: ['mst', 'union-find'], pattern: 'Union-Find Kruskal (sort edges)', ds: ['array (parent)'],
    constraints: '1 ≤ n ≤ 10^4, 1 ≤ connections ≤ 10^4, return -1 if not connectable', time: 'O(E log E)', space: 'O(n)',
    insight: 'Kruskal: take edges cheapest first and keep one only if it joins two different components.',
    signals: ['connect every city', 'minimum total cost', 'return -1 if impossible'],
    narration: ['Sort connections by cost.', 'For each edge, find both roots; if they differ, union and add the cost.', 'After n - 1 unions the tree is spanning.', 'If fewer unions happened, the graph is disconnected: -1.'],
    solution: `class Solution:
    def minimumCost(self, n, connections):
        parent = list(range(n + 1))

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        total = 0
        used = 0
        for a, b, cost in sorted(connections, key=lambda edge: edge[2]):
            rootA, rootB = find(a), find(b)
            if rootA != rootB:
                parent[rootA] = rootB
                total += cost
                used += 1
        return total if used == n - 1 else -1`,
    pitfalls: ['Cities are 1-indexed, so the parent array needs n + 1 slots', 'Forgetting the n - 1 edge check returns a cost for a disconnected graph'],
  },
  {
    id: 'bank-graphs-dp:problem:2050', lc: 2050, title: 'Parallel Courses III', difficulty: 'Hard',
    skills: ['topo-sort', 'dp-1d'], pattern: 'Topological sort + longest-path DP', ds: ['adjacency list', 'queue'],
    constraints: '1 ≤ n ≤ 5·10^4, relations form a DAG, courses can run in parallel', time: 'O(n + E)', space: 'O(n + E)',
    insight: 'A course can start when its slowest prerequisite finishes, so finish[c] = time[c] + max(finish of prerequisites), computed in topological order.',
    signals: ['minimum months to finish all courses', 'unlimited parallel courses', 'each course has its own duration'],
    narration: ['Build the DAG and in-degrees (courses are 1-indexed).', 'finish[c] starts at time[c].', 'Pop a course from the zero in-degree queue; for each dependent, finish[next] = max(finish[next], finish[c] + time[next]).', 'The answer is max(finish).'],
    solution: `class Solution:
    def minimumTime(self, n, relations, time):
        graph = [[] for _ in range(n)]
        indegree = [0] * n
        for prev, nxt in relations:
            graph[prev - 1].append(nxt - 1)
            indegree[nxt - 1] += 1
        finish = time[:]
        queue = deque(i for i in range(n) if indegree[i] == 0)
        while queue:
            course = queue.popleft()
            for nxt in graph[course]:
                finish[nxt] = max(finish[nxt], finish[course] + time[nxt])
                indegree[nxt] -= 1
                if indegree[nxt] == 0:
                    queue.append(nxt)
        return max(finish)`,
    companies: ['google', 'amazon'],
    pitfalls: ['Summing times along one path instead of taking the max over prerequisites', 'The answer is max(finish), not the finish of the last popped course'],
  },
  {
    id: 'bank-graphs-dp:problem:444', lc: 444, title: 'Sequence Reconstruction', difficulty: 'Medium',
    skills: ['topo-sort', 'graph-modeling'], pattern: 'Topological sort: queue size must stay 1 (unique order)', ds: ['adjacency list', 'queue'],
    constraints: 'nums is a permutation of 1..n, sequences are subsequences of the true order', time: 'O(n + total sequence length)', space: 'O(n + E)',
    insight: 'A topological order is unique exactly when the Kahn queue never holds two nodes at once.',
    signals: ['is nums the only shortest supersequence', 'unique ordering', 'sequences give adjacent-pair constraints'],
    narration: ['Each adjacent pair (a, b) in a sequence is an edge a -> b.', 'Run Kahn\'s algorithm from the in-degree-0 nodes.', 'If the queue ever has more than one node, two orders are possible: return False.', 'Otherwise compare the produced order to nums.'],
    solution: `class Solution:
    def sequenceReconstruction(self, nums, sequences):
        n = len(nums)
        graph = [[] for _ in range(n + 1)]
        indegree = [0] * (n + 1)
        for seq in sequences:
            for a, b in zip(seq, seq[1:]):
                graph[a].append(b)
                indegree[b] += 1
        queue = deque(i for i in range(1, n + 1) if indegree[i] == 0)
        order = []
        while queue:
            if len(queue) > 1:
                return False
            node = queue.popleft()
            order.append(node)
            for nxt in graph[node]:
                indegree[nxt] -= 1
                if indegree[nxt] == 0:
                    queue.append(nxt)
        return order == nums`,
    companies: ['google'],
    pitfalls: ['Checking only that nums is a valid order says nothing about uniqueness', 'A cycle leaves order shorter than nums, which the final comparison catches'],
  },
  {
    id: 'bank-graphs-dp:problem:1293', lc: 1293, title: 'Shortest Path in a Grid with Obstacles Elimination', difficulty: 'Hard',
    skills: ['graph-bfs', 'grid'], pattern: 'BFS shortest path, state (r, c, k left)', ds: ['queue', 'set'],
    constraints: '1 ≤ m, n ≤ 40, 1 ≤ k ≤ m · n, cells are 0 or 1', time: 'O(m · n · k)', space: 'O(m · n · k)',
    insight: 'Standing on the same cell with a different number of eliminations left is a different state; BFS over (row, col, left) still gives fewest steps.',
    signals: ['shortest path with up to k walls removed', 'unit step cost', 'grid up to 40 by 40'],
    narration: ['Shortcut: if k >= rows + cols - 2, walk straight to the corner.', 'Queue holds (r, c, left, steps); seen holds (r, c, left).', 'Moving into a wall costs one elimination; skip if none left.', 'First time the corner pops, steps is the answer.'],
    solution: `class Solution:
    def shortestPath(self, grid, k):
        rows, cols = len(grid), len(grid[0])
        if k >= rows + cols - 2:
            return rows + cols - 2
        queue = deque([(0, 0, k, 0)])
        seen = {(0, 0, k)}
        while queue:
            r, c, left, steps = queue.popleft()
            if r == rows - 1 and c == cols - 1:
                return steps
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols:
                    nextLeft = left - grid[nr][nc]
                    if nextLeft >= 0 and (nr, nc, nextLeft) not in seen:
                        seen.add((nr, nc, nextLeft))
                        queue.append((nr, nc, nextLeft, steps + 1))
        return -1`,
    pitfalls: ['A plain (r, c) visited set wrongly blocks a later arrival that has more eliminations left', 'Check budget after the move: left - grid[nr][nc] must stay >= 0'],
  },
  {
    id: 'bank-graphs-dp:problem:1368', lc: 1368, title: 'Minimum Cost to Make at Least One Valid Path in a Grid', difficulty: 'Hard',
    skills: ['graph-bfs', 'queue-deque', 'grid'], pattern: 'BFS shortest path: 0-1 BFS (deque front for free moves)', ds: ['deque', 'grid'],
    constraints: '1 ≤ m, n ≤ 100, each cell holds an arrow 1 right, 2 left, 3 down, 4 up', time: 'O(m · n)', space: 'O(m · n)',
    insight: 'Following a cell\'s arrow costs 0 and any other move costs 1, so a deque with free moves at the front is a Dijkstra without the heap.',
    signals: ['change an arrow at cost 1', 'edge costs are only 0 or 1', 'cheapest path from top-left to bottom-right'],
    narration: ['cost[r][c] is the fewest arrow changes to reach the cell.', 'Each of the 4 moves costs 0 if it matches the arrow, else 1.', 'On an improvement, push free moves to the front and paid moves to the back of the deque.', 'Answer is cost at the bottom-right.'],
    solution: `class Solution:
    def minCost(self, grid):
        rows, cols = len(grid), len(grid[0])
        moves = ((0, 1), (0, -1), (1, 0), (-1, 0))
        cost = [[float('inf')] * cols for _ in range(rows)]
        cost[0][0] = 0
        queue = deque([(0, 0)])
        while queue:
            r, c = queue.popleft()
            for arrow, (dr, dc) in enumerate(moves, 1):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols:
                    step = 0 if grid[r][c] == arrow else 1
                    if cost[r][c] + step < cost[nr][nc]:
                        cost[nr][nc] = cost[r][c] + step
                        if step == 0:
                            queue.appendleft((nr, nc))
                        else:
                            queue.append((nr, nc))
        return cost[rows - 1][cols - 1]`,
    companies: ['google', 'amazon'],
    pitfalls: ['Plain BFS treats every move as cost 1 and overcounts', 'Only push when the cost strictly improves, or the loop never ends'],
  },
  {
    id: 'bank-graphs-dp:problem:815', lc: 815, title: 'Bus Routes', difficulty: 'Hard',
    skills: ['graph-bfs', 'graph-modeling'], pattern: 'BFS shortest path over routes (stop to routes map)', ds: ['hashmap', 'queue'],
    constraints: '1 ≤ routes ≤ 500, total stops ≤ 10^5, stops up to 10^6', time: 'O(total stops)', space: 'O(total stops)',
    insight: 'The cost is buses taken, not stops passed, so make each route a node and BFS over routes via shared stops.',
    signals: ['fewest buses', 'routes loop forever', 'transfer at a shared stop'],
    narration: ['Map each stop to the routes serving it.', 'BFS from source; popping a stop boards every unused route there at cost buses + 1.', 'Mark a route used the first time so its stops are scanned once.', 'Return buses + 1 when target appears, else -1.'],
    solution: `class Solution:
    def numBusesToDestination(self, routes, source, target):
        if source == target:
            return 0
        stopToRoutes = defaultdict(list)
        for i, route in enumerate(routes):
            for stop in route:
                stopToRoutes[stop].append(i)
        queue = deque([(source, 0)])
        seenStops = {source}
        seenRoutes = set()
        while queue:
            stop, buses = queue.popleft()
            for i in stopToRoutes[stop]:
                if i in seenRoutes:
                    continue
                seenRoutes.add(i)
                for nxt in routes[i]:
                    if nxt == target:
                        return buses + 1
                    if nxt not in seenStops:
                        seenStops.add(nxt)
                        queue.append((nxt, buses + 1))
        return -1`,
    pitfalls: ['BFS over stops without marking routes rescans the same route many times', 'source == target needs zero buses, handle it before the loop'],
  },
]

export default { mcqs, clozes, parsons, flashcards, problems }
