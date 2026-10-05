import { runQuiz, part, pickByLevel } from './_engine.js'

const costs = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(α(n))', 'O(L)', 'O(k)']

const scenarios = [
  { d: 1, s: 'Need the minimum repeatedly while new values keep arriving.', ds: 'Min-heap', alts: ['Sorted list', 'Stack', 'Hash set'],
    why: 'Heap keeps the min on top with log-time inserts.', op: ['Cost of heappush / heappop?', 'O(log n)', 'Sift up or down one root-to-leaf path.'], skills: ['heap'] },
  { d: 1, s: 'Visit a tree level by level, first in first out.', ds: 'Queue (deque)', alts: ['Stack', 'Min-heap', 'Hash map'],
    why: 'BFS needs FIFO so a level finishes before the next.', op: ['Cost of deque.popleft()?', 'O(1)', 'A deque pops either end in O(1). list.pop(0) is O(n).'], skills: ['tree-bfs', 'queue-deque'] },
  { d: 1, s: 'Check "have I seen this value?" millions of times.', ds: 'Hash set', alts: ['List', 'Sorted list', 'Stack'],
    why: 'Average O(1) membership.', op: ['Average cost of x in seen?', 'O(1)', 'Hashing jumps straight to the bucket.'], skills: ['arrays-hashing'] },
  { d: 1, s: 'Match opening and closing brackets.', ds: 'Stack', alts: ['Queue (deque)', 'Min-heap', 'Hash set'],
    why: 'The most recent opener must close first: LIFO.', op: ['Cost of push / pop at the top?', 'O(1)', 'list.append and list.pop work at the end.'], skills: ['stack'] },
  { d: 2, s: 'Edges keep merging groups; ask if two nodes are connected.', ds: 'Union-Find', alts: ['Adjacency matrix', 'Stack', 'Min-heap'],
    why: 'Union + find with path compression is nearly constant.', op: ['Amortized cost per union/find?', 'O(α(n))', 'Path compression + union by rank: inverse Ackermann.'], skills: ['union-find'] },
  { d: 1, s: 'Count how many times each word appears.', ds: 'Hash map (Counter)', alts: ['Stack', 'Sorted list', 'Queue (deque)'],
    why: 'Key → count with O(1) updates.', op: ['Cost to build counts for n words?', 'O(n)', 'One O(1) update per word.'], skills: ['arrays-hashing'] },
  { d: 2, s: 'Autocomplete: all words starting with a prefix.', ds: 'Trie', alts: ['Hash set', 'Min-heap', 'Sorted list'],
    why: 'Shared prefixes share a path.', op: ['Cost to walk a prefix of length L?', 'O(L)', 'One child hop per character.'], skills: ['trie'] },
  { d: 2, s: 'LRU cache: O(1) get and evict the least recent.', ds: 'Hash map + doubly linked list', alts: ['Min-heap', 'Queue (deque)', 'Sorted list'],
    why: 'Map finds the node, list moves it to the front in O(1).', op: ['Cost of get with move-to-front?', 'O(1)', 'Unlink and relink a node via its pointers.'], skills: ['linked-list', 'arrays-hashing'] },
  { d: 2, s: 'For each element, find the next greater to its right.', ds: 'Monotonic stack', alts: ['Min-heap', 'Queue (deque)', 'Hash set'],
    why: 'Decreasing stack pops when a bigger value shows up.', op: ['Total cost over n elements?', 'O(n)', 'Each index pushed and popped once.'], skills: ['monotonic-stack'] },
  { d: 2, s: 'Max of every sliding window of size k.', ds: 'Monotonic deque', alts: ['Stack', 'Hash map (Counter)', 'Sorted list'],
    why: 'Deque keeps decreasing candidates, drops expired from the front.', op: ['Total cost over n elements?', 'O(n)', 'Each index enters and leaves once.'], skills: ['queue-deque'] },
  { d: 2, s: 'Many range-sum queries on a fixed array.', ds: 'Prefix-sum array', alts: ['Min-heap', 'Hash set', 'Stack'],
    why: 'sum(l..r) = prefix[r+1] − prefix[l].', op: ['Cost per query after building?', 'O(1)', 'Two lookups and a subtraction.'], skills: ['prefix-sum'] },
  { d: 2, s: 'Keep the k largest scores from a stream.', ds: 'Min-heap of size k', alts: ['Max-heap of everything', 'Stack', 'Hash set'],
    why: 'Smallest of the top k sits on top, easy to evict.', op: ['Cost per new score?', 'O(log k)', 'Heap never grows past k.'], skills: ['heap'] },
  { d: 3, s: 'Running median of a stream.', ds: 'Two heaps', alts: ['One min-heap', 'Sorted list + bisect.insort', 'Queue (deque)'],
    why: 'Max-heap for the low half, min-heap for the high half.', op: ['Cost to read the median?', 'O(1)', 'Peek the heap tops.'], skills: ['heap'] },
  { d: 1, s: 'Undo / redo of recent edits.', ds: 'Stack', alts: ['Queue (deque)', 'Hash set', 'Min-heap'],
    why: 'Undo the most recent action first.', op: ['Cost to undo once?', 'O(1)', 'Pop the top.'], skills: ['stack'] },
  { d: 2, s: 'Dijkstra: always expand the closest unsettled node.', ds: 'Min-heap', alts: ['Queue (deque)', 'Stack', 'Hash set'],
    why: 'Heap orders the frontier by distance.', op: ['Total Dijkstra cost?', 'O((V+E) log V)', 'Each edge may push once into the heap.'], skills: ['dijkstra', 'heap'] },
  { d: 2, s: 'Store a sparse graph with 10⁵ nodes for traversal.', ds: 'Adjacency list', alts: ['Adjacency matrix', 'Stack', 'Sorted list'],
    why: 'Space O(V+E). A matrix needs V² = 10¹⁰.', op: ['Cost to iterate all neighbors of all nodes?', 'O(V+E)', 'Each edge listed once or twice.'], skills: ['graph-modeling'] },
  { d: 2, s: 'Group words that are anagrams.', ds: 'Hash map: key → list', alts: ['Trie', 'Min-heap', 'Stack'],
    why: 'Sorted word or count tuple is the bucket key.', op: ['Cost for n words of length L?', 'O(n·L log L)', 'Sort each word for its key.'], skills: ['arrays-hashing'] },
  { d: 3, s: 'Insert values and query "how many < x" in sorted order.', ds: 'Sorted list + bisect', alts: ['Hash set', 'Stack', 'Queue (deque)'],
    why: 'bisect finds rank in O(log n).', op: ['Cost of bisect_left?', 'O(log n)', 'Binary search over a sorted list.'], skills: ['binary-search'] },
  { d: 1, s: 'Iterative DFS without recursion.', ds: 'Stack', alts: ['Queue (deque)', 'Min-heap', 'Hash map (Counter)'],
    why: 'Explicit stack mimics the call stack.', op: ['DFS total on V nodes, E edges?', 'O(V+E)', 'Each node and edge handled once.'], skills: ['graph-dfs', 'stack'] },
  { d: 3, s: 'Shortest path where edges cost 0 or 1.', ds: 'Deque (0-1 BFS)', alts: ['Stack', 'Hash set', 'Sorted list'],
    why: '0-edges to the front, 1-edges to the back.', op: ['Total cost?', 'O(V+E)', 'No heap log factor.'], skills: ['graph-bfs', 'queue-deque'] },
  { d: 2, s: 'Min stack: push, pop, and get min all in O(1).', ds: 'Stack of (value, current min)', alts: ['Min-heap', 'Sorted list', 'Queue (deque)'],
    why: 'Each frame remembers the min below it.', op: ['Cost of getMin?', 'O(1)', 'Read the top pair.'], skills: ['stack'] },
  { d: 2, s: 'Find two nums with sum = target in one pass.', ds: 'Hash map: value → index', alts: ['Stack', 'Min-heap', 'Trie'],
    why: 'Look up target − x as you go.', op: ['Total cost?', 'O(n)', 'O(1) lookup per element.'], skills: ['arrays-hashing'] },
  { d: 3, s: 'Schedule tasks by order of prerequisites.', ds: 'In-degree map + queue', alts: ['Min-heap only', 'Stack of all nodes', 'Union-Find'],
    why: "Kahn's: queue the nodes with no remaining prereqs.", op: ['Total cost?', 'O(V+E)', 'Each edge decrements once.'], skills: ['topo-sort'] },
  { d: 3, s: 'Merge k sorted linked lists.', ds: 'Min-heap of list heads', alts: ['Stack', 'Hash map (Counter)', 'Queue (deque)'],
    why: 'Heap picks the smallest head among k.', op: ['Total cost for N nodes?', 'O(N log k)', 'Each node passes through a size-k heap.'], skills: ['heap', 'linked-list'] },
]

export function makeQuestion(level = 1) {
  const item = pickByLevel(scenarios, level)
  const index = scenarios.indexOf(item)
  const [opQ, opAnswer, opWhy] = item.op
  const extraCosts = ['O(V+E)', 'O((V+E) log V)', 'O(N log k)', 'O(n·L log L)', 'O(log k)', 'O(V²)', 'O(N·k)']
  const costPool = [...costs, ...extraCosts].filter(cost => cost !== opAnswer)
  const sameShape = costPool.filter(cost => cost.length <= opAnswer.length + 6)
  return {
    id: `ds-match:${index}`,
    skills: ['ds-diagnosis', ...item.skills],
    tag: '🧩 Pick the structure',
    summary: item.s,
    prompt: item.s,
    parts: [
      part('Which data structure?', item.ds, item.alts, item.why),
      part(opQ, opAnswer, sameShape.length >= 3 ? sameShape : costPool, opWhy),
    ],
  }
}

export default {
  id: 'ds-match',
  title: 'DS Match',
  icon: '🧩',
  blurb: 'Scenario in, data structure and cost out.',
  skills: ['ds-diagnosis', 'heap', 'stack', 'queue-deque'],
  mount: (container, api) => runQuiz(container, api, {
    title: 'DS Match',
    icon: '🧩',
    rules: ['structure, then cost', 'combos multiply'],
    mode: 'lives',
    lives: 3,
    speedMs: 12000,
    makeQuestion,
  }),
}
