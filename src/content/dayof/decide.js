const masterTree = {
  q: 'What shape is the input?',
  options: [
    {
      label: 'Array / string',
      next: {
        q: 'What is actually being asked?',
        options: [
          { label: 'Shortest / smallest window that fits a condition', leaf: { result: 'Sliding window', ds: 'two indices + Counter/dict', time: 'O(n)', why: 'grow right, shrink left while condition holds', ref: 'Sliding window template' } },
          { label: 'Contiguous subarray/substring, fixed property', leaf: { result: 'Sliding window or prefix sum', ds: 'dict + two pointers, or running sum', time: 'O(n)', why: 'contiguous is the window/prefix-sum signal', ref: 'Prefix sum template' } },
          { label: 'Count ways / min-max choice at each step', leaf: { result: 'Dynamic programming', ds: 'array/dict or @cache', time: 'O(n) or O(n·k)', why: 'overlapping subproblems, optimal substructure', ref: 'DP template' } },
          { label: 'All combinations / subsets / permutations', leaf: { result: 'Backtracking', ds: 'path list + recursion', time: 'O(2ⁿ) or O(n!)', why: 'try a choice, recurse, undo it', ref: 'Backtracking template' } },
          { label: 'Kth largest/smallest/most frequent', leaf: { result: 'Heap (top-k)', ds: 'min-heap capped at size k', time: 'O(n log k)', why: 'bound the heap to k, not n', ref: 'Top-k heap template' } },
          { label: 'Sorted input, find a target / boundary', leaf: { result: 'Binary search', ds: 'lo/hi pointers', time: 'O(log n)', why: 'sorted + find = halve the search space', ref: 'Binary search template' } },
        ],
      },
    },
    {
      label: 'Linked list',
      next: {
        q: 'What is the operation?',
        options: [
          { label: 'Detect a cycle / find the start', leaf: { result: 'Fast & slow pointers', ds: 'two pointers, no extra space', time: 'O(n)', why: 'fast gains one node per step, must meet in a cycle', ref: 'Fast/slow pointers template' } },
          { label: 'Reverse / reorder / merge lists', leaf: { result: 'Iterative pointer rewiring', ds: 'prev/curr/next pointers', time: 'O(n)', why: 'one pass, relink next pointers as you go', ref: 'Linked list reversal template' } },
          { label: 'Kth from end / middle node', leaf: { result: 'Two pointers, one offset by k', ds: 'two pointers', time: 'O(n)', why: 'one pass beats counting length first', ref: 'Two pointers (list) template' } },
        ],
      },
    },
    { label: 'Tree', leaf: { result: 'go to the TREE decision tree (next section)', ds: 'recursion (DFS) or deque (BFS)', time: 'O(n)', why: 'trees get their own tree: top-down vs bottom-up vs level order' } },
    { label: 'Graph / grid', leaf: { result: 'go to the GRAPH decision tree (next section)', ds: 'adjacency list/dict, or 4-dir grid', time: 'O(V+E)', why: 'graphs branch hard on weights, goal, and directed-ness' } },
    { label: 'Intervals', leaf: { result: 'Sort by start, then sweep or merge', ds: 'sorted list, optionally a heap of end times', time: 'O(n log n)', why: 'sorting resolves most of the hard part up front', ref: 'Interval sweep template' } },
    { label: 'Design a data structure', leaf: { result: 'List the ops needed, pick a DS per op', ds: 'dict+DLL (LRU), trie (prefix), two heaps (median)', time: 'usually O(1) or O(log n) per op', why: 'match each required operation to its fast DS' } },
  ],
}

const graphTree = {
  q: 'Is it a tree? (connected, exactly V−1 edges, no cycle)',
  options: [
    {
      label: 'Yes',
      next: {
        q: 'Do you just need to visit every node?',
        options: [
          { label: 'Yes, plain traversal', leaf: { result: 'DFS', ds: 'recursion (implicit stack)', time: 'O(V+E)', why: 'a tree has one path between any two nodes', ref: 'DFS template (graph)' } },
          { label: 'No — LCA, diameter, serialize, levels', leaf: { result: 'go to the TREE decision tree', ds: 'depends on the exact ask', time: 'O(n)', why: 'tree-shaped asks get their own decision tree' } },
        ],
      },
    },
    {
      label: 'No — general graph',
      next: {
        q: "What's the main goal?",
        options: [
          {
            label: 'Shortest path',
            next: {
              q: 'Edge weights?',
              options: [
                { label: 'Unweighted (every edge costs 1)', leaf: { result: 'BFS', ds: 'deque + visited set', time: 'O(V+E)', why: 'BFS frontier = min hops from the source', ref: 'BFS template' } },
                { label: 'Only 0 or 1', leaf: { result: '0-1 BFS', ds: 'deque, 0-edges push front, 1-edges push back', time: 'O(V+E)', why: '0-weight edges jump the queue for free', ref: '0-1 BFS template' } },
                { label: 'Non-negative', leaf: { result: 'Dijkstra', ds: 'min-heap + dist dict', time: 'O((V+E) log V)', why: 'always expand the closest unvisited node', ref: 'Dijkstra template' } },
                { label: 'Negative allowed', leaf: { result: 'Bellman-Ford', ds: 'dist array/dict, relax every edge', time: 'O(V·E)', why: 'relax all edges V−1 times, catches negatives', ref: 'Bellman-Ford template' } },
                { label: 'Weighted but ≤ k stops/edges', leaf: { result: 'Bellman-Ford, capped at k rounds', ds: 'dist array, relax k times only', time: 'O(k·E)', why: 'stopping relaxation early enforces the stop limit', ref: 'Bellman-Ford template' } },
              ],
            },
          },
          {
            label: 'Connect all nodes, minimum total cost',
            next: {
              q: 'Dense graph / coordinates, or a sparse edge list?',
              options: [
                { label: 'Dense / coordinates', leaf: { result: "Prim's MST", ds: 'min-heap + visited set', time: 'O(E log V)', why: 'grow one tree, always add the cheapest edge out', ref: "Prim's MST template" } },
                { label: 'Sparse edge list', leaf: { result: "Kruskal's MST", ds: 'sorted edges + Union-Find', time: 'O(E log E)', why: 'take the cheapest edge that does not close a cycle', ref: "Kruskal's MST template" } },
              ],
            },
          },
          { label: 'Order tasks by dependency', leaf: { result: 'Topological sort (Kahn)', ds: 'indegree dict + deque', time: 'O(V+E)', why: 'repeatedly peel off nodes with indegree 0', ref: 'Topological sort template' } },
          { label: 'Merge groups / dynamic connectivity', leaf: { result: 'Union-Find', ds: 'parent list + rank list', time: 'O(1) amortized per op', why: 'union by rank + path compression flattens lookups', ref: 'Union-Find template' } },
          { label: 'Split into 2 groups, no same-group edge', leaf: { result: 'BFS two-coloring (bipartite check)', ds: 'color dict + deque', time: 'O(V+E)', why: 'alternate colors on BFS; a clash means not bipartite', ref: 'Bipartite BFS template' } },
          {
            label: 'Does a cycle exist?',
            next: {
              q: 'Directed or undirected?',
              options: [
                { label: 'Directed', leaf: { result: '3-color DFS, or Kahn indegree count', ds: 'color dict (white/gray/black)', time: 'O(V+E)', why: 'an edge into a gray node is a back edge', ref: 'Cycle detection (directed) template' } },
                { label: 'Undirected', leaf: { result: 'Union-Find, or DFS tracking parent', ds: 'parent list, or parent arg in DFS', time: 'O(V+E)', why: 'an edge joining an already-same set is a cycle', ref: 'Cycle detection (undirected) template' } },
              ],
            },
          },
          { label: "It's a grid", leaf: { result: 'Treat it as an implicit graph', ds: '4-dir offsets + visited set/grid', time: 'O(rows·cols)', why: 'each cell is a node, up to 4 neighbor edges', ref: 'Grid BFS/DFS template' } },
        ],
      },
    },
  ],
}

const treeDecisionTree = {
  q: 'What does the question need from the tree?',
  options: [
    {
      label: 'Visit/compute over every node',
      next: {
        q: 'Does each node need info from its parent, or from its children?',
        options: [
          { label: 'From the parent, passed down (path sum so far, depth, an ancestor)', leaf: { result: 'Top-down DFS', ds: 'recursion, extra params carry state down', time: 'O(n)', why: 'the state is known before you visit children', ref: 'Top-down DFS template' } },
          { label: 'From the children, combined on the way up (height, count, diameter)', leaf: { result: 'Bottom-up DFS', ds: 'recursion, return value(s) up', time: 'O(n)', why: "children's answers must exist before the parent combines them", ref: 'Bottom-up DFS template' } },
        ],
      },
    },
    { label: 'Level-by-level order, or shortest depth', leaf: { result: 'BFS (level order)', ds: 'deque, snapshot len(queue) per level', time: 'O(n)', why: 'one BFS layer = one tree depth level', ref: 'Tree BFS template' } },
    { label: "It's a BST — search, insert, kth, or a range", leaf: { result: 'Use the BST property', ds: 'none extra — compare vs node.val', time: 'O(log n) balanced, O(n) worst', why: 'left < node < right lets you discard half the tree', ref: 'BST search template' } },
    { label: 'Need the lowest common ancestor', leaf: { result: 'LCA recursion', ds: 'recursion, bubble the match up', time: 'O(n)', why: 'a node found on both sides is the LCA, return it up', ref: 'LCA template' } },
    { label: 'Serialize/deserialize, or rebuild from a traversal', leaf: { result: 'Preorder (+ null markers) encode/decode', ds: 'list/deque consumed in order', time: 'O(n)', why: 'preorder with null markers round-trips the exact shape', ref: 'Serialize tree template' } },
  ],
}

const summary = [
  'Shape first: ==array==/==string==, ==linked list==, tree, ==graph==/==grid==, ==interval==, design.',
  'Then the ask: ==shortest==, count ways, ==all combinations==, ==kth==, ==contiguous==, ==connected==, dependencies, min/max choice.',
  'Is it a tree? connected + V−1 edges + no cycle → traversal-only lands on ==DFS==.',
  'Shortest: unweighted → ==BFS==. 0/1 → 0-1 BFS. non-neg → ==dijkstra==. negative → ==bellman-ford==.',
  'Connect all, min cost → ==minimum spanning tree==: dense → =="prim\'s algorithm"==, edges → =="kruskal\'s algorithm"==.',
  'Order deps → ==topological sort==. Merging groups → ==union-find==. Two-color split → ==bipartite==.',
  'Pick the DS by the op you need fast: membership→set, min repeatedly→==heap==, FIFO→==deque==.',
  'Stuck? Say the shape, name the pattern, state time/space, then code.',
]

const sections = [
  { kind: 'tree', title: 'MASTER: shape → question → pattern', root: masterTree },
  { kind: 'tree', title: 'GRAPH: tree? → goal → algorithm', root: graphTree },
  { kind: 'tree', title: 'TREE: top-down vs bottom-up vs BFS vs BST', root: treeDecisionTree },
  {
    kind: 'table',
    title: 'Algorithm → data structures',
    columns: ['Algorithm', 'Data structures', 'Time', 'Space'],
    rows: [
      ['BFS', 'deque + visited set', 'O(V+E)', 'O(V)'],
      ['DFS', 'recursion / stack + visited set', 'O(V+E)', 'O(V)'],
      ['Dijkstra', 'min-heap + dist dict', 'O((V+E) log V)', 'O(V)'],
      ["Prim's MST", 'min-heap + visited set', 'O(E log V)', 'O(V)'],
      ["Kruskal's MST", 'sorted edges + Union-Find', 'O(E log E)', 'O(V)'],
      ['Topo sort (Kahn)', 'indegree dict + deque', 'O(V+E)', 'O(V)'],
      ['Union-Find', 'parent list + rank list', 'O(1) amortized', 'O(V)'],
      ['Sliding window', 'Counter/dict + two indices', 'O(n)', 'O(k)'],
      ['Monotonic stack', 'list used as a stack of indices', 'O(n)', 'O(n)'],
      ['Top-k', 'min-heap capped at size k', 'O(n log k)', 'O(k)'],
      ['LRU cache', 'dict + doubly linked list', 'O(1) per op', 'O(capacity)'],
      ['Median of stream', 'max-heap + min-heap', 'O(log n) per insert', 'O(n)'],
      ['Trie', 'dict of children per node', 'O(word length)', 'O(total chars)'],
      ['Interval sweep', 'sort by start + heap of end times', 'O(n log n)', 'O(n)'],
      ['Backtracking', 'path list + recursion', 'O(2ⁿ) or O(n!)', 'O(n) depth'],
      ['DP', 'array / dict / @cache', 'O(n) or O(n·k)', 'O(n) or O(1)'],
      ['Binary search', 'lo/hi pointers', 'O(log n)', 'O(1)'],
    ],
  },
  {
    kind: 'table',
    title: 'Signal words → pattern',
    columns: ['Signal words in the prompt', 'Pattern'],
    rows: [
      ['contiguous subarray / substring', 'Sliding window'],
      ['all possible / all combinations / permutations', 'Backtracking'],
      ['kth largest / smallest / most frequent', 'Heap (top-k)'],
      ['minimum / maximum number of ways', 'Dynamic programming'],
      ['shortest path / fewest steps', 'BFS (unweighted) or Dijkstra (weighted)'],
      ['connected components / number of islands', 'DFS/BFS flood fill, or Union-Find'],
      ['can finish / prerequisite / order of tasks', 'Topological sort'],
      ['merge intervals / overlapping', 'Sort, then a sweep'],
      ['sorted array, find a target', 'Binary search'],
      ['next greater / next smaller element', 'Monotonic stack'],
      ['design, O(1) get/put', 'Hash map + a specialized DS (DLL, heap)'],
      ['in-place, O(1) extra space', 'Two pointers / pointer rewiring'],
      ['palindrome / reverse', 'Two pointers from both ends'],
      ['group anagrams / duplicates', 'Hash map keyed by a signature'],
      ['connect all cities cheaply / min spanning tree', 'MST: Prim or Kruskal'],
      ['cycle in a graph', '3-color DFS, or Union-Find'],
      ['word ladder / transform in fewest steps', 'BFS over an implicit graph'],
    ],
  },
  {
    kind: 'table',
    title: 'Need this op fast → use this DS',
    columns: ['Need this op', 'Use this DS'],
    rows: [
      ['O(1) membership test', 'set'],
      ['repeatedly get the min / max', 'heap'],
      ['FIFO order', 'deque'],
      ['LIFO order', 'list (as a stack)'],
      ['ordered keys, range queries', 'sorted list + bisect'],
      ['running / prefix counts', 'dict (prefix-sum map)'],
      ['insertion order + O(1) remove by key', 'dict + doubly linked list'],
      ['count frequencies', 'Counter'],
      ['prefix matching on strings', 'trie (dict of children)'],
      ['value → index lookups', 'dict (hash map)'],
      ['fixed/variable window of elements', 'deque, or two pointers'],
      ['group items by a key', 'defaultdict(list)'],
    ],
  },
]

const recall = [
  { prompt: 'Is it a tree — the 3-part check?', answer: 'connected, exactly V−1 edges, no cycle' },
  { prompt: 'Confirmed tree, only need traversal → algorithm?', answer: 'DFS (recursion, no seen set needed)' },
  { prompt: 'Shortest path, unweighted graph → algorithm + DS?', answer: 'BFS — deque + visited set' },
  { prompt: 'Shortest path, non-negative weights → algorithm + DS?', answer: 'Dijkstra — min-heap + dist dict' },
  { prompt: 'Shortest path, negative weights → algorithm?', answer: 'Bellman-Ford — relax every edge V−1 times' },
  { prompt: 'Shortest path, 0/1 edge weights → algorithm?', answer: '0-1 BFS — deque, push 0-edges to the front' },
  { prompt: 'Connect all nodes min cost, dense/points → algorithm?', answer: "Prim's MST — min-heap + visited set" },
  { prompt: 'Connect all nodes min cost, edge list → algorithm?', answer: "Kruskal's MST — sort edges + Union-Find" },
  { prompt: 'Order tasks with dependencies → algorithm + DS?', answer: 'Topological sort (Kahn) — indegree dict + deque' },
  { prompt: 'Merging groups / dynamic connectivity → DS?', answer: 'Union-Find — parent list + rank, path compression' },
  { prompt: 'Check if a graph is bipartite → method?', answer: 'BFS, alternate 2 colors, clash = not bipartite' },
  { prompt: 'Detect a cycle, directed graph → method?', answer: '3-color DFS (gray→gray edge = cycle), or Kahn stalls' },
  { prompt: 'Detect a cycle, undirected graph → method?', answer: 'Union-Find same-set union, or DFS tracking parent' },
  { prompt: "Tree: need a subtree's height/count/diameter → DFS direction?", answer: 'Bottom-up — children return first, parent combines' },
  { prompt: 'Tree: need the running path sum down to each node → DFS direction?', answer: 'Top-down — pass the sum as a recursion parameter' },
  { prompt: 'Tree: need nodes level by level → technique + DS?', answer: 'BFS — deque, loop len(queue) once per level' },
  { prompt: 'Need O(1) average membership checks → DS?', answer: 'set' },
  { prompt: 'Need the kth largest repeatedly from a stream → DS?', answer: 'min-heap capped at size k' },
  { prompt: "Contiguous substring with a count constraint → pattern?", answer: 'Sliding window + Counter/dict' },
  { prompt: "Grid traversal — how do you model it?", answer: 'implicit graph: each cell a node, 4 neighbor edges' },
]

const quiz = [
  { id: 'dayof:decide:q1', q: "You're told the graph is connected, has exactly V−1 edges, and no cycle. What is it?", choices: ['A tree', 'A DAG', 'A complete graph', 'A bipartite graph'], answer: 0, why: "That's the exact definition of a tree: connected, V−1 edges, acyclic.", skills: ['graph-modeling', 'ds-diagnosis'] },
  { id: 'dayof:decide:q2', q: "It's confirmed a tree, you just need to visit every node once. Best fit?", choices: ['DFS recursion', 'Dijkstra', 'Union-Find', 'Bellman-Ford'], answer: 0, why: 'A tree has exactly one path between nodes — plain DFS, no seen set needed.', skills: ['graph-dfs', 'tree-dfs'] },
  { id: 'dayof:decide:q3', q: 'Shortest path in an unweighted graph. Which DS pairing?', choices: ['deque + visited set', 'min-heap + dist dict', 'sorted edges + Union-Find', 'stack + recursion'], answer: 0, why: 'BFS explores level by level; a deque gives O(1) pops from the front.', skills: ['graph-bfs', 'queue-deque'] },
  { id: 'dayof:decide:q4', q: 'Shortest path, all weights non-negative but not all equal to 1. Algorithm?', choices: ['BFS', 'Dijkstra', 'Bellman-Ford', 'DFS'], answer: 1, why: 'Non-negative weights let Dijkstra greedily pop the smallest known distance.', skills: ['dijkstra'] },
  { id: 'dayof:decide:q5', q: 'Graph has negative edge weights and you still need shortest path. Algorithm?', choices: ['Dijkstra', "Prim's", 'Bellman-Ford', "Kruskal's"], answer: 2, why: 'Dijkstra breaks with negative edges; Bellman-Ford relaxes all edges V−1 times.', skills: ['dijkstra'] },
  { id: 'dayof:decide:q6', q: 'Connect all nodes at minimum cost, graph given as dense coordinates. Algorithm?', choices: ["Kruskal's", "Prim's", 'Dijkstra', 'Topological sort'], answer: 1, why: "Dense graphs favor Prim's: grow one tree, heap always picks the cheapest edge out.", skills: ['mst'] },
  { id: 'dayof:decide:q7', q: 'Same MST goal, but the input is a sparse edge list. Algorithm?', choices: ["Prim's", "Kruskal's", 'Bellman-Ford', 'BFS'], answer: 1, why: "Sparse edge lists suit Kruskal's: sort edges, union if it doesn't close a cycle.", skills: ['mst', 'union-find'] },
  { id: 'dayof:decide:q8', q: 'Prerequisite courses, need a valid completion order. Pattern + DS?', choices: ['DFS + seen set only', 'Topological sort — indegree dict + deque', 'Dijkstra — heap + dist dict', 'Union-Find — parent array'], answer: 1, why: 'Ordering with dependencies is topological sort; Kahn uses indegree counts and a queue.', skills: ['topo-sort'] },
  { id: 'dayof:decide:q9', q: "You keep merging groups and need fast 'are these two connected?' checks. DS?", choices: ['Adjacency list + fresh DFS each time', 'Union-Find with path compression', 'A heap of edges', 'A stack of visited nodes'], answer: 1, why: "Dynamic connectivity across repeated merges is Union-Find's exact use case.", skills: ['union-find'] },
  { id: 'dayof:decide:q10', q: 'Split a graph into two groups with no edge inside either group. Pattern?', choices: ['Topological sort', 'BFS two-coloring (bipartite check)', 'Dijkstra', 'Backtracking'], answer: 1, why: "That's a bipartite check: BFS, alternate colors, a clash means not bipartite.", skills: ['graph-bfs', 'graph-modeling'] },
  { id: 'dayof:decide:q11', q: 'Directed graph, need to detect a cycle. Technique?', choices: ['Union-Find', '3-color DFS (white/gray/black)', 'Sliding window', 'Two pointers'], answer: 1, why: 'On a directed graph, an edge into a gray (in-progress) node is a back edge — a cycle.', skills: ['graph-dfs'] },
  { id: 'dayof:decide:q12', q: 'Undirected graph, need to detect a cycle. Technique?', choices: ['3-color DFS', 'Union-Find, or parent-tracking DFS', 'Dijkstra', 'Topological sort'], answer: 1, why: 'Undirected cycle check: union edges and watch for same-set, or DFS tracking parent.', skills: ['union-find', 'graph-dfs'] },
  { id: 'dayof:decide:q13', q: "It's a grid of cells. How do you model it for BFS/DFS?", choices: ['As intervals to sort', 'As an implicit graph: each cell a node, up to 4 edges', 'As a trie of coordinates', 'As a heap of distances'], answer: 1, why: 'Grids are implicit graphs — each cell is a node with up to 4 neighbor edges.', skills: ['grid'] },
  { id: 'dayof:decide:q14', q: 'Tree problem: need the height of every subtree. Top-down or bottom-up DFS?', choices: ['Top-down, pass depth as a param', "Bottom-up, return height from children", 'BFS level order', 'Use the BST property'], answer: 1, why: "Height needs the children's answers first, so it's bottom-up: combine on return.", skills: ['tree-dfs'] },
  { id: 'dayof:decide:q15', q: 'Tree problem: pass the running path sum down into each node. Top-down or bottom-up?', choices: ['Top-down, pass the sum as a param', 'Bottom-up, return the sum from children', 'Union-Find', 'Topological sort'], answer: 0, why: 'The path sum so far is known before visiting children, so pass it down.', skills: ['tree-dfs'] },
  { id: 'dayof:decide:q16', q: 'Need tree nodes level by level. Technique + DS?', choices: ['DFS + stack', 'BFS + deque, loop len(queue) once per level', 'Dijkstra + heap', 'Backtracking + path list'], answer: 1, why: 'Level order is BFS; snapshotting len(queue) each loop isolates one level.', skills: ['tree-bfs'] },
  { id: 'dayof:decide:q17', q: 'Need the kth largest element repeatedly as a stream arrives. DS?', choices: ['A sorted list, re-sorted each time', 'A min-heap of size k', 'A set', 'A monotonic stack'], answer: 1, why: 'A min-heap capped at size k keeps the kth largest at the top in O(log k).', skills: ['heap'] },
  { id: 'dayof:decide:q18', q: 'Need O(1) average membership checks on many elements. DS?', choices: ['list', 'set', 'deque', 'sorted array + bisect'], answer: 1, why: 'Hash-based sets give O(1) average membership; lists are O(n) per check.', skills: ['arrays-hashing', 'ds-diagnosis'] },
  { id: 'dayof:decide:q19', q: "Prompt: 'longest contiguous substring with at most k distinct characters.' Pattern?", choices: ['Backtracking', 'Sliding window with a Counter', 'Binary search', 'Union-Find'], answer: 1, why: "'Contiguous' plus a count constraint is the classic sliding window with a frequency map.", skills: ['sliding-window'] },
  { id: 'dayof:decide:q20', q: 'n ≤ 10⁵, grid shortest-path, every move costs 1. What should you reach for?', choices: ['BFS — O(rows·cols)', 'Backtracking — O(2ⁿ)', 'Bellman-Ford — O(n²)', 'Dijkstra — unnecessary here'], answer: 0, why: 'Unweighted shortest path on a grid is BFS, linear in cells — no heap needed.', skills: ['grid', 'graph-bfs', 'constraints'] },
  { id: 'dayof:decide:q21', q: "Walk the tree: is it a tree? → No. Goal: connect all nodes, minimum cost. Input: dense coordinates. Where do you land?", choices: ['DFS', "Prim's MST", "Kruskal's MST", 'Topological sort'], answer: 1, why: "Not a tree, min-cost connect-all, dense input routes straight to Prim's MST with a heap.", skills: ['mst', 'graph-modeling'] },
  { id: 'dayof:decide:q22', q: 'Walk the tree: is it a tree? → Yes. Traversal only? → Yes. Where do you land?', choices: ['Dijkstra', 'Union-Find', 'DFS', "Kruskal's"], answer: 2, why: 'A confirmed tree needing only traversal lands on plain DFS, no extra DS.', skills: ['tree-dfs', 'graph-dfs'] },
  { id: 'dayof:decide:q23', q: "Prompt: 'return all possible subsets of the array.' Pattern + DS?", choices: ['DP with @cache', 'Backtracking — path list + recursion', 'Sliding window', 'Union-Find'], answer: 1, why: "'All possible' subsets/combinations signals backtracking: build, recurse, undo.", skills: ['backtracking'] },
  { id: 'dayof:decide:q24', q: "Prompt: 'minimum number of coins to make this amount.' Pattern?", choices: ['Backtracking only', 'Dynamic programming — array/dict of best-so-far', 'Greedy always works here', 'BFS'], answer: 1, why: 'A min-cost choice problem with overlapping subproblems signals DP, not pure greedy.', skills: ['dp-1d'] },
  { id: 'dayof:decide:q25', q: 'Design an LRU cache with O(1) get and put. DS combo?', choices: ['Array + binary search', 'dict + doubly linked list', 'heap + dict', 'trie'], answer: 1, why: 'The dict gives O(1) lookup; the doubly linked list gives O(1) move-to-front/evict.', skills: ['ds-diagnosis', 'arrays-hashing'] },
]

export default {
  id: 'decide',
  title: 'Decide: problem → pattern → algorithm → DS',
  icon: '🧭',
  minutes: 30,
  summary,
  sections,
  recall,
  quiz,
}
