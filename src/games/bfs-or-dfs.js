import { runQuiz, part, pickByLevel, sample } from './_engine.js'

const algorithms = ['BFS', 'DFS', 'Dijkstra', 'Topological sort', 'Union-Find', '0-1 BFS']

const falseReasons = [
  'DFS guarantees the fewest edges on unweighted graphs',
  'BFS handles positive weights correctly',
  'Dijkstra works fine with negative edges',
  'Union-Find returns shortest path lengths',
  'Topological sort works on graphs with cycles',
  'Recursion is always faster than a queue',
  'A heap is required for unweighted shortest paths',
  'DFS visits nodes in order of distance',
  'BFS needs less memory than DFS on every graph',
  'Union-Find can tell you edge directions',
  'Topological order is unique for any DAG',
  'Dijkstra is needed whenever a grid is involved',
]

const scenarios = [
  { x: ['Dijkstra', '0-1 BFS'], d: 1, s: 'Fewest moves from start to exit in a maze grid.', a: 'BFS', r: 'Unweighted: BFS reaches nodes in order of distance', skills: ['graph-bfs', 'grid'] },
  { x: ['BFS', 'Union-Find'], d: 1, s: 'Count islands of 1s in a grid.', a: 'DFS', r: 'Only reachability matters; DFS floods each component', skills: ['graph-dfs', 'grid'] },
  { x: ['DFS'], d: 1, s: 'Can all courses be finished given prerequisites?', a: 'Topological sort', r: 'Dependency order exists iff the graph has no cycle', skills: ['topo-sort'] },
  { d: 1, s: 'Network delay: weighted positive edges, time to reach all.', a: 'Dijkstra', r: 'Positive weights: always settle the closest node next', skills: ['dijkstra'] },
  { x: ['DFS', 'BFS'], d: 1, s: 'Number of connected components as edges stream in.', a: 'Union-Find', r: 'Merging sets incrementally is near O(1) per edge', skills: ['union-find'] },
  { x: ['Dijkstra'], d: 2, s: 'Grid where moving straight is free and turning costs 1.', a: '0-1 BFS', r: 'Edge weights are only 0 or 1: deque front/back keeps order', skills: ['graph-bfs', 'queue-deque'] },
  { x: ['DFS'], d: 1, s: 'Print a binary tree level by level.', a: 'BFS', r: 'A queue finishes one depth before the next', skills: ['tree-bfs'] },
  { x: ['BFS'], d: 1, s: 'Find all root-to-leaf paths that sum to target.', a: 'DFS', r: 'Need full paths; DFS carries the current path and backtracks', skills: ['tree-dfs', 'backtracking'] },
  { x: ['Dijkstra', '0-1 BFS'], d: 2, s: 'Word ladder: fewest one-letter changes between two words.', a: 'BFS', r: 'Each change costs 1, so BFS layers give the minimum', skills: ['graph-bfs', 'graph-modeling'] },
  { x: ['DFS'], d: 2, s: 'Alien dictionary: derive letter order from sorted words.', a: 'Topological sort', r: 'Adjacent words give "a before b" edges to order', skills: ['topo-sort', 'graph-modeling'] },
  { x: ['DFS'], d: 2, s: 'Find the edge that, when added, created a cycle.', a: 'Union-Find', r: 'An edge joining two already-connected nodes closes a cycle', skills: ['union-find'] },
  { d: 2, s: 'Cheapest flight with prices on each route.', a: 'Dijkstra', r: 'Edges carry different costs; BFS would ignore them', skills: ['dijkstra'] },
  { x: ['BFS'], d: 2, s: 'Clone a graph given one node.', a: 'DFS', r: 'Visit every node once, mapping old → new as you recurse', skills: ['graph-dfs'] },
  { x: ['0-1 BFS', 'Dijkstra'], d: 2, s: 'Rotting oranges: minutes until all rot.', a: 'BFS', r: 'All rotten oranges start together; layers are minutes', skills: ['graph-bfs', 'grid'] },
  { x: ['BFS'], d: 2, s: 'Pacific Atlantic: cells that drain into both oceans.', a: 'DFS', r: 'Reachability from each ocean border, then intersect', skills: ['graph-dfs', 'grid'] },
  { x: ['Union-Find'], d: 3, s: 'Swim in rising water: minimize the max height on a path.', a: 'Dijkstra', r: 'Heap by "max so far" pops the best bottleneck first', skills: ['dijkstra', 'grid'] },
  { x: ['Dijkstra'], d: 3, s: 'Minimum walls to remove to reach the corner.', a: '0-1 BFS', r: 'Empty cell costs 0, wall costs 1: two weights only', skills: ['graph-bfs', 'grid'] },
  { x: ['DFS', 'BFS'], d: 3, s: 'Accounts merge: group emails that share any owner.', a: 'Union-Find', r: 'Union emails per account, then group by root', skills: ['union-find', 'graph-modeling'] },
  { d: 3, s: 'Parallel courses: minimum semesters with prereqs.', a: 'Topological sort', r: "Kahn's layers: each wave of in-degree 0 is one semester", skills: ['topo-sort'] },
  { x: ['Topological sort'], d: 2, s: 'Detect a cycle in a directed graph.', a: 'DFS', r: 'A back edge to a node on the current path means a cycle', skills: ['graph-dfs'] },
  { x: ['0-1 BFS', 'Dijkstra'], d: 3, s: 'Shortest path in a grid where you may break up to k walls.', a: 'BFS', r: 'Unit steps; state is (r, c, walls left) and BFS layers stay minimal', skills: ['graph-bfs', 'grid'] },
  { x: ['Union-Find'], d: 3, s: 'Path with minimum effort: minimize the max height diff.', a: 'Dijkstra', r: 'Weights vary per edge; heap by worst step so far', skills: ['dijkstra', 'grid'] },
  { x: ['BFS', 'Union-Find'], d: 1, s: 'Is there any path between two nodes? Graph is static.', a: 'DFS', r: 'Just reachability; DFS is simplest with a seen set', skills: ['graph-dfs'] },
  { x: ['DFS', 'BFS'], d: 2, s: 'Number of provinces from an adjacency matrix.', a: 'Union-Find', r: 'Union every connected pair, count distinct roots', skills: ['union-find'] },
]

export function makeQuestion(level = 1) {
  const item = pickByLevel(scenarios, level)
  const index = scenarios.indexOf(item)
  const distractAlgos = algorithms.filter(algo => algo !== item.a && !(item.x || []).includes(algo))
  return {
    id: `bfs-or-dfs:${index}`,
    skills: ['graph-modeling', ...item.skills],
    tag: '🕸️ Pick the traversal',
    summary: item.s,
    prompt: item.s,
    parts: [
      part('Which algorithm?', item.a, sample(distractAlgos, 5), `${item.a}: ${item.r}.`),
      part(`Why ${item.a}?`, item.r, sample(falseReasons, 3), item.r + '.'),
    ],
  }
}

export default {
  id: 'bfs-or-dfs',
  title: 'BFS or DFS?',
  icon: '🕸️',
  blurb: 'Choose the traversal, defend the choice.',
  skills: ['graph-bfs', 'graph-dfs', 'dijkstra', 'topo-sort', 'union-find'],
  mount: (container, api) => runQuiz(container, api, {
    title: 'BFS or DFS?',
    icon: '🕸️',
    rules: ['algorithm, then reason', 'say it out loud'],
    mode: 'timed',
    seconds: 90,
    speedMs: 12000,
    makeQuestion,
  }),
}
