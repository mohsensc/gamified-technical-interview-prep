export const categoryOrder = ['ds', 'complexity', 'pattern', 'signal', 'graph', 'technique']

export const categoryMeta = {
  ds: { label: 'Data structures', color: 'teal' },
  complexity: { label: 'Complexity', color: 'amber' },
  pattern: { label: 'Patterns', color: 'sky' },
  signal: { label: 'Signal words', color: 'pink' },
  graph: { label: 'Graph', color: 'green' },
  technique: { label: 'Technique', color: 'accent' },
}

const t = (term, category, def, aliases = [], related = []) => ({ term, category, def, aliases, related })

export const glossaryTerms = [
  t('array', 'ds', 'Fixed or dynamic sequence of values accessed by index.', [], ['two pointers', 'prefix sum', 'sorted']),
  t('hash map', 'ds', 'Key-value store with average O(1) lookup, insert, and delete.', ['hashmap', 'dictionary', 'dict'], ['hash set', 'amortized', 'collision']),
  t('hash set', 'ds', 'Unordered collection of unique values with O(1) membership checks.', ['hashset'], ['hash map', 'deduplication']),
  t('stack', 'ds', 'LIFO structure where push and pop happen at the same end.', [], ['monotonic stack', 'call stack', 'recursion']),
  t('queue', 'ds', 'FIFO structure: enqueue at the back, dequeue from the front.', [], ['deque', 'BFS']),
  t('deque', 'ds', 'Queue that pushes and pops from both ends in O(1).', ['double-ended queue'], ['sliding window', 'monotonic queue']),
  t('linked list', 'ds', 'Nodes linked by next pointers; O(1) insert, O(n) random access.', ['singly linked list'], ['doubly linked list', 'fast and slow pointers']),
  t('doubly linked list', 'ds', 'Linked list where each node also points to the previous node.', [], ['linked list', 'LRU cache']),
  t('binary tree', 'ds', 'Tree where every node has at most two children.', [], ['binary search tree', 'tree DFS']),
  t('binary search tree', 'ds', 'Binary tree kept ordered so left < node < right.', ['BST'], ['binary tree', 'in-order traversal']),
  t('heap', 'ds', 'Tree-shaped array that keeps the min or max at the root.', ['priority queue'], ['min-heap', 'max-heap', 'kth']),
  t('min-heap', 'ds', 'Heap that always keeps the smallest element at the root.', ['minheap'], ['heap']),
  t('max-heap', 'ds', 'Heap that always keeps the largest element at the root.', ['maxheap'], ['heap']),
  t('trie', 'ds', 'Tree of characters built for fast prefix lookups on strings.', ['prefix tree'], ['prefix']),
  t('union-find', 'ds', 'Tracks disjoint groups with near-O(1) union and find operations.', ['disjoint set', 'DSU'], ['path compression', 'union by rank', 'connected components']),
  t('graph', 'ds', 'Nodes connected by edges, directed or undirected, weighted or not.', [], ['adjacency list', 'BFS', 'DFS']),
  t('monotonic stack', 'ds', 'Stack kept increasing or decreasing to find the next greater or smaller value.', [], ['stack', 'next greater element']),
  t('monotonic queue', 'ds', "Deque kept sorted to track a sliding window's min or max.", [], ['deque', 'sliding window']),
  t('grid', 'ds', 'Two-D array of cells, often traversed like an implicit graph.', ['2-D grid', 'matrix'], ['graph', 'BFS', 'DFS']),
  t('interval', 'ds', 'A [start, end] range, usually sorted then merged or swept.', ['intervals'], ['merge intervals', 'sorted']),
  t('sorted array', 'ds', 'Array kept in order so it can be binary searched.', [], ['binary search']),
  t('2-D table', 'ds', 'Grid of subproblem answers indexed by two state variables.', ['dp table'], ['dynamic programming']),
  t('LRU cache', 'ds', 'Hash map plus doubly linked list that evicts the least recently used item.', [], ['doubly linked list', 'hash map']),
  t('call stack', 'ds', 'Stack of active function frames; recursion depth lives here.', [], ['recursion', 'recursion depth', 'stack overflow']),
  t('bitmask', 'ds', 'Integer whose bits each represent one flag in a set.', ['bit mask'], ['bit manipulation', 'state compression']),
  t('visited set', 'ds', "Set marking nodes already explored, so they aren't revisited.", [], ['BFS', 'DFS', 'visited-on-enqueue']),
  t('segment tree', 'ds', 'Tree storing range aggregates for fast range query and update.', [], ['range query', 'fenwick tree']),
  t('fenwick tree', 'ds', 'Compact tree for fast prefix sums and point updates.', ['binary indexed tree', 'BIT'], ['prefix sum', 'segment tree']),
  t('counter', 'ds', 'Hash map from a value to how many times it appears.', ['frequency map'], ['hash map', 'frequency']),
  t('sentinel node', 'ds', 'Placeholder list node that simplifies edge cases at the head or tail.', ['dummy node'], ['linked list']),

  t('Big-O', 'complexity', 'Upper bound on how runtime or space grows with input size.', ['big o notation', 'asymptotic notation'], ['time complexity', 'space complexity']),
  t('time complexity', 'complexity', "How an algorithm's runtime grows as input size increases.", [], ['Big-O']),
  t('space complexity', 'complexity', "How an algorithm's extra memory use grows with input size.", [], ['Big-O', 'auxiliary space']),
  t('amortized', 'complexity', 'Average cost per operation over a sequence, even if a few are slow.', ['amortized analysis'], ['hash map', 'dynamic array']),
  t('O(1)', 'complexity', "Runtime that doesn't depend on input size.", ['constant time'], ['Big-O']),
  t('O(log n)', 'complexity', 'Runtime that shrinks the problem by a fraction each step.', ['logarithmic time', 'log n'], ['binary search']),
  t('O(n)', 'complexity', 'Runtime proportional to input size.', ['linear time'], ['Big-O']),
  t('O(n log n)', 'complexity', 'A linear pass combined with a logarithmic step, as in sorting.', [], ['merge sort', 'heap']),
  t('O(n^2)', 'complexity', 'Runtime proportional to input size squared, often from nested loops.', ['quadratic time'], ['brute force']),
  t('O(2^n)', 'complexity', 'Runtime that doubles with each extra input element.', ['exponential time'], ['backtracking', 'all subsets']),
  t('O(n!)', 'complexity', 'Runtime from trying every possible ordering of the input.', ['factorial time'], ['all permutations', 'backtracking']),
  t('O(V+E)', 'complexity', "Runtime proportional to a graph's vertices plus edges, typical of BFS or DFS.", [], ['BFS', 'DFS', 'graph']),
  t('O(E log V)', 'complexity', "Runtime of heap-based graph algorithms such as Dijkstra's or Prim's.", [], ['dijkstra', 'heap', 'minimum spanning tree']),
  t('recursion depth', 'complexity', 'How many nested calls sit on the call stack at once.', [], ['call stack', 'recursion', 'stack overflow']),
  t('stack overflow', 'complexity', "A crash from recursion depth exceeding the call stack's limit.", [], ['recursion depth', 'call stack']),
  t('auxiliary space', 'complexity', 'Extra memory an algorithm uses beyond the input itself.', ['extra space'], ['space complexity', 'in-place']),
  t('worst case', 'complexity', 'The slowest an algorithm can run on any input of that size.', [], ['average case', 'Big-O']),
  t('average case', 'complexity', "An algorithm's expected runtime over typical or random inputs.", [], ['worst case', 'amortized']),
  t('best case', 'complexity', 'The fastest an algorithm can run, on the most favorable input.', [], ['worst case']),
  t('tight bound', 'complexity', 'A bound that is both the upper and lower limit on growth.', ['theta notation'], ['Big-O']),
  t('lower bound', 'complexity', 'The minimum amount of work any algorithm must do for a problem.', ['omega notation'], ['Big-O']),
  t('NP-hard', 'complexity', 'No known polynomial-time solution; usually needs brute force or heuristics.', ['NP-complete'], ['exponential time', 'brute force']),
  t('polynomial time', 'complexity', 'Runtime bounded by a fixed power of the input size.', [], ['Big-O']),
  t('branching factor', 'complexity', 'How many children each node spawns in a search or recursion tree.', [], ['backtracking', 'recursion depth']),
  t('constant factor', 'complexity', 'A fixed multiplier Big-O hides but that can still matter in practice.', [], ['Big-O']),
  t('input size', 'complexity', 'The variable, usually written n, that Big-O is measured against.', [], ['Big-O']),

  t('two pointers', 'pattern', 'Two indices moving through a structure to avoid nested loops.', [], ['sliding window', 'sorted', 'palindrome']),
  t('sliding window', 'pattern', 'A contiguous range that grows or shrinks while scanning once.', ['window'], ['two pointers', 'contiguous', 'monotonic queue']),
  t('prefix sum', 'pattern', 'Precomputed running totals that answer range-sum queries in O(1).', ['running sum', 'cumulative sum'], ['range query', 'subarray', 'fenwick tree']),
  t('binary search', 'pattern', 'Halves a sorted search space each step to find a target.', [], ['O(log n)', 'sorted', 'binary search on answer']),
  t('binary search on answer', 'pattern', 'Binary search over possible answers, checking feasibility at each guess.', [], ['binary search']),
  t('backtracking', 'pattern', 'Try a choice, recurse, undo it, then try the next choice.', [], ['recursion', 'pruning', 'all combinations']),
  t('dynamic programming', 'pattern', 'Breaks a problem into overlapping subproblems and caches their answers.', ['DP'], ['memoization', 'tabulation', '2-D table']),
  t('memoization', 'pattern', "Caches recursive results so repeated subproblems aren't recomputed.", ['top-down DP'], ['dynamic programming', 'caching']),
  t('tabulation', 'pattern', 'Fills a DP table iteratively from base cases upward.', ['bottom-up DP'], ['dynamic programming', '2-D table']),
  t('greedy', 'pattern', "Picks the locally best choice at each step, hoping it's globally optimal.", [], ['interval scheduling', 'greedy choice property']),
  t('divide and conquer', 'pattern', 'Splits a problem into independent subproblems, solves them, then merges.', [], ['recursion', 'merge sort']),
  t('merge intervals', 'pattern', 'Sort intervals by start, then combine the ones that overlap.', [], ['interval', 'sorted']),
  t('fast and slow pointers', 'pattern', 'Two pointers moving at different speeds to find cycles or midpoints.', ['tortoise and hare'], ['linked list', 'cycle detection']),
  t('topological sort', 'pattern', 'Orders nodes so every edge points forward; only works on a DAG.', ['topo sort'], ['dependencies', 'indegree', 'DAG']),
  t("kadane's algorithm", 'pattern', 'Tracks the best running sum, resetting it whenever it turns negative.', ['maximum subarray'], ['subarray']),
  t('bitmask DP', 'pattern', 'DP whose state is a bitmask of which elements are included or visited.', [], ['dynamic programming', 'bitmask']),
  t('meet in the middle', 'pattern', 'Splits the input in half, searches both halves, then combines results.', [], ['exponential time', 'two pointers']),
  t('cycle detection', 'pattern', 'Finding whether a path loops back on a node it already visited.', ['cycle'], ['fast and slow pointers', 'back edge', 'DFS']),
  t('interval scheduling', 'pattern', 'Greedily picks intervals by earliest end time to fit the most.', [], ['greedy', 'interval']),
  t('quickselect', 'pattern', 'Partition-based selection that finds the kth smallest in average O(n).', [], ['kth', 'partition', 'heap']),
  t('sweep line', 'pattern', 'Processes sorted events left to right while tracking running state.', [], ['interval', 'sorted']),
  t('state space search', 'pattern', 'Treats every configuration as a graph node and searches over them.', [], ['BFS', 'graph modeling']),
  t('subsequence', 'pattern', 'Elements in order but not necessarily contiguous, unlike a substring.', [], ['subarray']),
  t('subarray', 'pattern', 'A contiguous slice of an array.', [], ['contiguous', 'prefix sum', 'sliding window']),
  t('graph modeling', 'pattern', "Reframing a problem's entities and relations as nodes and edges.", ['model as a graph'], ['graph', 'BFS', 'DFS']),
  t('next greater element', 'pattern', 'The nearest later element that is larger, found with a monotonic stack.', [], ['monotonic stack']),

  t('shortest', 'signal', 'Shortest path or fewest steps: think BFS, or Dijkstra if weighted.', ['fewest steps'], ['BFS', 'dijkstra', 'shortest path']),
  t('kth', 'signal', 'The kth smallest or largest: think a heap or quickselect, not a full sort.', [], ['heap', 'quickselect']),
  t('contiguous', 'signal', 'A contiguous subarray or substring: think sliding window or prefix sum.', [], ['sliding window', 'prefix sum', 'subarray']),
  t('all combinations', 'signal', 'Enumerate every combination, subset, or ordering: think backtracking.', ['all subsets', 'all permutations'], ['backtracking']),
  t('dependencies', 'signal', 'Task A before task B: think topological sort on a DAG.', ['prerequisites'], ['topological sort', 'indegree', 'DAG']),
  t('sorted', 'signal', 'Input is already sorted: think binary search or two pointers.', [], ['binary search', 'two pointers']),
  t('in-place', 'signal', 'Modify without extra space: think two pointers or swapping, not a copy.', ['in place'], ['auxiliary space', 'two pointers']),
  t('at most k', 'signal', 'At most k distinct values or changes: think sliding window with a counter.', [], ['sliding window', 'counter']),
  t('minimum number of', 'signal', 'Minimum count to reach a goal: think BFS, greedy, or DP.', ['fewest number of'], ['BFS', 'greedy', 'dynamic programming']),
  t('connected', 'signal', 'Are two nodes connected: think union-find or a DFS/BFS from each.', [], ['union-find', 'connected components']),
  t('top k', 'signal', 'The k largest or smallest items from a set: think a heap of size k.', [], ['heap', 'kth']),
  t('palindrome', 'signal', 'Reads the same forwards and backwards: think two pointers from both ends.', [], ['two pointers']),
  t('anagram', 'signal', 'Same letters, different order: think a character-count hash map.', [], ['hash map', 'counter']),
  t('overlapping', 'signal', 'Ranges that overlap: think sorting the intervals, then a merge sweep.', [], ['merge intervals', 'interval']),
  t('unique', 'signal', 'No duplicates allowed: think a hash set for O(1) checks.', [], ['hash set', 'deduplication']),
  t('longest', 'signal', 'Longest run or subsequence: think sliding window or dynamic programming.', [], ['sliding window', 'dynamic programming']),
  t('prefix', 'signal', 'Prefix or dictionary lookups on words: think a trie.', [], ['trie']),
  t('weighted', 'signal', 'Edges carry a cost: think Dijkstra or another weighted shortest-path algorithm.', [], ['dijkstra', 'shortest path']),
  t('negative weights', 'signal', 'Edge weights can be negative: think Bellman-Ford, not Dijkstra.', [], ['bellman-ford', 'relaxation']),
  t('circular', 'signal', 'Wraps around the end: think modulo indexing or a deque.', [], ['deque', 'modulo arithmetic']),
  t('stream', 'signal', 'Values arrive one at a time: think a heap or a running aggregate.', ['streaming'], ['heap', 'two-heap technique']),
  t('median', 'signal', 'Middle value of a running set: think two heaps split at the median.', [], ['two-heap technique', 'heap']),
  t('frequency', 'signal', 'How often something appears: think a hash map counter.', [], ['counter', 'hash map']),
  t('substring', 'signal', 'A contiguous slice of a string: think sliding window.', [], ['sliding window', 'subarray']),
  t('rotated', 'signal', 'A sorted array rotated at an unknown pivot: think modified binary search.', [], ['binary search', 'sorted']),
  t('merge', 'signal', 'Combine two sorted inputs into one: think a two-pointer merge.', [], ['two pointers', 'merge sort']),
  t('adjacent', 'signal', 'Neighboring elements or cells: a cue for DP transitions or grid moves.', [], ['grid']),
  t('window of size k', 'signal', 'A fixed-length sliding window: think one pass tracking enter/leave.', ['fixed window'], ['sliding window']),
  t('reverse', 'signal', 'Reverse a sequence or its order: often two pointers swapping from the ends.', [], ['two pointers', 'linked list']),
  t('distinct', 'signal', 'Values must differ: think a hash set tracking what has been seen.', [], ['hash set', 'unique']),
  t('count ways', 'signal', 'Count the number of ways to do something: think dynamic programming.', ['how many ways', 'number of ways'], ['dynamic programming']),
  t('can you finish', 'signal', 'Can every task complete: think a cycle check via topological sort.', [], ['topological sort', 'cycle detection']),

  t('BFS', 'graph', 'Explores level by level with a queue; finds shortest path when unweighted.', ['breadth-first search'], ['queue', 'shortest path', 'level order traversal']),
  t('DFS', 'graph', 'Explores as deep as possible before backtracking, via a stack or recursion.', ['depth-first search'], ['call stack', 'backtracking', 'recursion']),
  t('indegree', 'graph', 'Number of edges pointing into a node.', ['in-degree'], ['topological sort', 'outdegree']),
  t('outdegree', 'graph', 'Number of edges pointing out of a node.', ['out-degree'], ['indegree']),
  t('visited-on-enqueue', 'graph', "Marking a node visited when it's added to the queue, not when popped.", ['mark on enqueue'], ['BFS', 'queue']),
  t('adjacency list', 'graph', "Graph stored as each node's list of neighbors.", [], ['graph', 'adjacency matrix']),
  t('adjacency matrix', 'graph', 'Graph stored as an N×N grid of edge weights or booleans.', [], ['graph', 'adjacency list']),
  t('path compression', 'graph', 'Union-Find optimization that flattens trees during find for near-O(1) ops.', [], ['union-find', 'union by rank']),
  t('union by rank', 'graph', 'Union-Find optimization that attaches the smaller tree under the larger root.', ['union by size'], ['union-find', 'path compression']),
  t('relaxation', 'graph', "Updating a node's distance when a shorter path through an edge is found.", ['edge relaxation'], ['dijkstra', 'bellman-ford']),
  t('back edge', 'graph', 'An edge to an ancestor still on the DFS stack, signaling a cycle.', [], ['cycle detection', 'DFS']),
  t('bipartite', 'graph', 'A graph whose nodes split into two sets with edges only between them.', ['bipartite graph'], ['graph coloring', 'BFS']),
  t('graph coloring', 'graph', 'Assigning labels to nodes so no edge connects two same-labeled nodes.', [], ['bipartite']),
  t('DAG', 'graph', 'A directed graph with no cycles; what topological sort requires.', ['directed acyclic graph'], ['topological sort', 'indegree']),
  t('strongly connected', 'graph', 'Every node in the group can reach every other node in it.', ['strongly connected components', 'SCC'], ['DFS', 'directed graph']),
  t('connected components', 'graph', 'Groups of nodes reachable from each other in an undirected graph.', [], ['union-find', 'DFS']),
  t('shortest path', 'graph', 'The minimum-cost route between two nodes, by edge count or weight.', [], ['BFS', 'dijkstra']),
  t('dijkstra', 'graph', 'Greedy shortest-path algorithm using a min-heap; needs non-negative weights.', ["dijkstra's algorithm"], ['heap', 'relaxation', 'shortest path']),
  t('bellman-ford', 'graph', 'Shortest-path algorithm that handles negative weights by relaxing every edge repeatedly.', [], ['relaxation', 'negative weights']),
  t('minimum spanning tree', 'graph', 'The cheapest set of edges connecting all nodes with no cycles.', ['MST'], ["prim's algorithm", "kruskal's algorithm", 'union-find']),
  t("prim's algorithm", 'graph', 'Grows a minimum spanning tree one cheapest edge at a time from a heap.', [], ['minimum spanning tree', 'heap']),
  t("kruskal's algorithm", 'graph', 'Builds a minimum spanning tree by adding the cheapest edges that avoid a cycle.', [], ['minimum spanning tree', 'union-find']),
  t('level order traversal', 'graph', 'BFS variant that processes a tree or graph one depth level at a time.', ['level order'], ['BFS', 'tree BFS']),
  t('tree DFS', 'graph', 'Depth-first traversal of a tree: preorder, inorder, or postorder.', [], ['DFS', 'in-order traversal']),
  t('in-order traversal', 'graph', "Visits a BST's nodes left, node, right, which yields sorted order.", ['inorder'], ['binary search tree', 'tree DFS']),
  t('preorder traversal', 'graph', "Visits a tree's node before its left and right subtrees.", ['preorder'], ['tree DFS']),
  t('postorder traversal', 'graph', "Visits a tree's left and right subtrees before the node itself.", ['postorder'], ['tree DFS']),
  t('multi-source BFS', 'graph', 'BFS started from several source nodes at once, all at distance 0.', [], ['BFS', 'shortest path']),
  t('weighted graph', 'graph', 'A graph whose edges carry a cost instead of all being equal.', [], ['dijkstra', 'adjacency list']),
  t('directed graph', 'graph', 'A graph whose edges point in one direction, from one node to another.', ['digraph'], ['DAG', 'indegree']),
  t('undirected graph', 'graph', 'A graph whose edges go both ways between the nodes they connect.', [], ['adjacency list']),
  t('tree BFS', 'graph', 'Breadth-first traversal of a tree, usually to process it level by level.', [], ['BFS', 'level order traversal']),

  t('hashing', 'technique', 'Mapping data to array indices for near O(1) lookup.', [], ['hash map', 'collision']),
  t('collision', 'technique', 'Two different keys mapping to the same hash bucket.', ['hash collision'], ['hashing', 'hash map']),
  t('recursion', 'technique', 'A function calling itself on a smaller version of the same problem.', [], ['base case', 'call stack', 'recursion depth']),
  t('base case', 'technique', 'The smallest input a recursive function solves without recursing further.', [], ['recursion']),
  t('invariant', 'technique', 'A condition that stays true throughout a loop or algorithm.', ['loop invariant'], ['two pointers', 'sliding window']),
  t('pruning', 'technique', "Skipping search branches that can't possibly lead to a valid answer.", [], ['backtracking']),
  t('closures', 'technique', 'An inner function that remembers variables from its enclosing scope.', ['nested function'], ['recursion']),
  t('deduplication', 'technique', 'Removing repeated elements, often with a set or a sorted skip.', ['dedupe'], ['hash set', 'sorted']),
  t('complement lookup', 'technique', 'Storing seen values in a hash map to find a pairing in one pass.', ['two-sum trick'], ['hash map']),
  t('partition', 'technique', 'Splitting an array around a pivot so smaller values come first.', [], ['quickselect', 'quicksort']),
  t('quicksort', 'technique', 'Sorts by partitioning around a pivot, then recursing on each side.', [], ['partition', 'divide and conquer']),
  t('merge sort', 'technique', 'Sorts by recursively splitting in half, then merging the sorted halves.', [], ['divide and conquer']),
  t('bucket sort', 'technique', 'Sorts by grouping values into buckets, useful when the range is known.', [], ['counting sort']),
  t('counting sort', 'technique', 'Sorts by counting occurrences of each value, with no comparisons.', [], ['bucket sort']),
  t('bit manipulation', 'technique', "Using AND, OR, XOR, and shifts on a number's binary form.", ['bitwise'], ['bitmask', 'XOR trick']),
  t('XOR trick', 'technique', "Using XOR's cancel-out property to find a unique or missing element.", [], ['bit manipulation']),
  t('early termination', 'technique', 'Stopping a loop or search as soon as the answer is known.', ['short-circuit'], ['pruning']),
  t('caching', 'technique', 'Storing computed results so the same work is never redone.', ['cache'], ['memoization']),
  t('sentinel value', 'technique', 'A special marker value signaling a boundary or missing data.', [], ['sentinel node']),
  t('state compression', 'technique', 'Encoding a large state compactly, often as a bitmask, for DP.', [], ['bitmask DP', 'bitmask']),
  t('coordinate compression', 'technique', 'Mapping large or sparse values to small dense array indices.', [], ['sorted', 'hashing']),
  t('difference array', 'technique', 'Array of deltas enabling O(1) range updates, recovered with a prefix sum.', [], ['prefix sum']),
  t('two-heap technique', 'technique', 'Splitting a stream into a max-heap and min-heap to track a running median.', [], ['median', 'heap']),
  t('randomization', 'technique', 'Adding randomness, such as a random pivot, to avoid worst-case inputs.', ['random pivot'], ['quicksort']),
  t('iterative DFS', 'technique', 'DFS implemented with an explicit stack instead of function recursion.', [], ['DFS', 'stack']),
  t('tail recursion', 'technique', "Recursion whose very last action is the recursive call itself.", [], ['recursion']),
  t('simulation', 'technique', 'Directly modeling a process step by step instead of deriving a formula.', [], ['brute force']),
  t('brute force', 'technique', 'Trying every possibility directly, without a smarter shortcut.', [], ['time complexity']),
  t('range query', 'technique', 'Asking for an aggregate, like a sum, over a range of an array.', [], ['prefix sum', 'segment tree']),
  t('modulo arithmetic', 'technique', 'Wrapping numbers around a fixed size using the % operator.', ['modulo', 'mod'], ['circular']),
  t('dynamic array', 'technique', 'Array that grows by reallocating and copying when it runs out of room.', ['resizable array'], ['amortized', 'array']),
  t('greedy choice property', 'technique', 'A problem where a locally optimal pick always leads to a globally optimal answer.', [], ['greedy']),
  t('overlapping subproblems', 'technique', 'Smaller subproblems that recur again and again, which DP caches.', [], ['dynamic programming', 'memoization']),
  t('optimal substructure', 'technique', 'An optimal solution is built from optimal solutions to its subproblems.', [], ['dynamic programming']),
]

const slugify = text => String(text).toLowerCase().trim()
  .replace(/\^/g, '-pow-')
  .replace(/!/g, '-fact')
  .replace(/\+/g, '-plus-')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')

export const termId = term => slugify(term)

export const glossaryById = Object.fromEntries(glossaryTerms.map(entry => [termId(entry.term), entry]))

export const surfaceForms = glossaryTerms
  .flatMap(entry => [entry.term, ...(entry.aliases || [])].map(surface => ({
    surface, lower: surface.toLowerCase(), id: termId(entry.term), entry,
  })))
  .sort((a, b) => b.lower.length - a.lower.length)

export function findTerm(text) {
  if (!text) return null
  const lower = String(text).trim().toLowerCase()
  const hit = surfaceForms.find(form => form.lower === lower)
  if (hit) return hit.entry
  return glossaryById[slugify(text)] || null
}

export function relatedEntries(entry) {
  if (!entry?.related?.length) return []
  const seen = new Set([termId(entry.term)])
  const out = []
  for (const name of entry.related) {
    const found = findTerm(name)
    if (!found || seen.has(termId(found.term))) continue
    seen.add(termId(found.term))
    out.push(found)
  }
  return out
}
