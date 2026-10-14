export const framework = [
  {
    id: 'clarify', title: 'Clarify & examples', icon: '❓', minutes: 4,
    goal: 'Restate. Ask. Walk one example by hand.',
    checklist: ['Restate the problem in one sentence', 'Input types, ranges, empty input?', 'Duplicates, negatives, sorted?', 'Output format, ties, in-place?', 'Trace a tiny example out loud'],
    starters: ['So I want to make sure I understand: given ___, return ___.', 'Can the input be empty, or contain duplicates or negatives?', 'Should I return indices or values, and what if there are ties?', 'Let me walk through this small example to confirm.'],
  },
  {
    id: 'constraints', title: 'Constraints → target', icon: '📏', minutes: 2,
    goal: 'Read n. Pick the Big-O you must hit.',
    checklist: ['Ask for n if not given', 'Map n to a complexity budget', 'Say the target out loud'],
    starters: ['How large can n get?', 'With n up to 10^5, I am aiming for O(n log n) or better.', 'n is at most 20, so an exponential search over subsets is fine here.'],
  },
  {
    id: 'brute', title: 'Brute force + cost', icon: '🔨', minutes: 3,
    goal: 'Say the obvious way and why it is too slow.',
    checklist: ['Describe the naive approach in 1-2 lines', 'State its time and space', 'Point at the repeated work'],
    starters: ['The simplest approach is to try every ___, which is O(___).', 'That repeats work because we recompute ___ each time.', 'This would not pass for n = 10^5, so let me optimize.'],
  },
  {
    id: 'optimize', title: 'Optimize: pattern + DS', icon: '💡', minutes: 6,
    goal: 'Name the pattern, the data structure, and why.',
    checklist: ['Name the pattern (BFS, window, heap...)', 'Name the DS and what it stores', 'Why it removes the repeated work', 'Get a nod before coding'],
    starters: ['This looks like a ___ problem because the prompt says ___.', 'I will use a ___ to store ___, so each lookup is O(1).', 'That brings it down to O(___). Does that sound good before I code it?'],
  },
  {
    id: 'code', title: 'Code while narrating', icon: '⌨️', minutes: 18,
    goal: 'Talk at every block: setup, loop, update, return.',
    checklist: ['Setup: say what each variable holds', 'Loop: say the invariant', 'Update: say why this line keeps it true', 'Return: say what the answer means', 'Use helper names, not long comments'],
    starters: ['First I set up ___ which holds ___.', 'This loop goes over ___; at each step ___ is always true.', 'Here I update ___ because ___.', 'At the end ___ holds the answer, so I return it.'],
  },
  {
    id: 'test', title: 'Test + edge cases', icon: '🧪', minutes: 6,
    goal: 'Dry-run your example line by line. Then edges.',
    checklist: ['Trace the example through the code', 'Empty / single element', 'All same / all negative', 'Max size or deep recursion', 'Fix bugs calmly, say what changed'],
    starters: ['Let me trace through with ___: after the first iteration ___.', 'For an empty input we return ___ right away.', 'One edge case is ___; my code handles it because ___.'],
  },
  {
    id: 'complexity', title: 'Time & space + why', icon: '⏱️', minutes: 3,
    goal: 'State both, justify each term.',
    checklist: ['Time with the reason for each factor', 'Space including recursion stack', 'Mention a trade-off or follow-up'],
    starters: ['Time is O(___) because each ___ is processed once and ___.', 'Space is O(___) for the ___, plus the recursion stack of depth ___.', 'If memory mattered more, we could ___.'],
  },
]

export const phrases = {
  transitions: ['Okay, I think I have an approach, let me explain it before coding.', 'Let me write a helper for this so the main logic stays clean.', 'I will code the happy path first, then handle edge cases.'],
  stuck: ['Let me think out loud for a second.', 'Let me try a smaller example to see the pattern.', 'What if the input were sorted? Would that help?', 'Which data structure gives me O(1) for the operation I repeat?'],
  hints: ['That is a great hint, so if I use ___ then ___.', 'Thanks, let me reconsider ___.'],
  bugs: ['I see a bug here: ___. Let me fix it.', 'This index could go out of range when ___, so I add a bounds check.'],
  wrapUp: ['Overall this runs in O(___) time and O(___) space.', 'If I had more time I would add ___.'],
}

export const templates = [
  {
    id: 'dfs', title: 'Graph DFS', skills: ['graph-dfs', 'communication'],
    lines: [
      { cue: 'Node', say: 'Each node is a ___ (a cell, a course, a person).' },
      { cue: 'Edge', say: 'There is an edge from A to B when ___.' },
      { cue: 'Build', say: 'I build an adjacency list with defaultdict(list) so neighbors are O(1) to reach.' },
      { cue: 'Visited', say: 'seen holds nodes I already started, so I never process one twice.' },
      { cue: 'Mark', say: 'I mark a node visited as soon as I enter dfs, before exploring neighbors, to avoid cycles.' },
      { cue: 'Invariant', say: 'dfs(node) returns ___ for the whole component reachable from node.' },
      { cue: 'Base case', say: 'If the node is out of bounds or already seen, return immediately.' },
      { cue: 'Driver', say: 'I call dfs from every unseen node, so each component is counted once.' },
      { cue: 'Depth', say: 'Recursion depth can reach V; for 10^5 nodes I would switch to an explicit stack.' },
      { cue: 'Cost', say: 'Every node and edge is touched once: O(V + E) time, O(V) space.' },
    ],
  },
  {
    id: 'bfs', title: 'Graph BFS', skills: ['graph-bfs', 'communication'],
    lines: [
      { cue: 'Why BFS', say: 'Edges are unweighted and I need the shortest number of steps, so BFS.' },
      { cue: 'Queue', say: 'The deque holds the frontier: nodes discovered but not expanded yet.' },
      { cue: 'Start', say: 'I push all sources first; multi-source BFS spreads from all at once.' },
      { cue: 'Mark', say: 'I mark visited when I enqueue, not when I pop, so nothing is added twice.' },
      { cue: 'Levels', say: 'I process one level per loop using len(queue), and that level count is the distance.' },
      { cue: 'Invariant', say: 'The queue is ordered by distance: everything at distance d comes before d + 1.' },
      { cue: 'Shortest', say: 'The first time I reach a node is through the fewest edges, because levels expand in order.' },
      { cue: 'Cost', say: 'Each node enters the queue once: O(V + E) time, O(V) space for the queue and seen.' },
    ],
  },
  {
    id: 'grid', title: 'Grid traversal', skills: ['grid', 'communication'],
    lines: [
      { cue: 'Model', say: 'Each cell is a node; its 4 neighbors are the edges.' },
      { cue: 'Bounds', say: 'I check 0 <= r < rows and 0 <= c < cols before touching a cell.' },
      { cue: 'Visited', say: 'I either use a seen set or overwrite the cell to mark it in place.' },
      { cue: 'Directions', say: 'I loop over the four directions so I do not repeat the neighbor code.' },
      { cue: 'Cost', say: 'Every cell is visited once: O(rows · cols) time and space.' },
    ],
  },
  {
    id: 'topo', title: 'Topological sort', skills: ['topo-sort', 'communication'],
    lines: [
      { cue: 'Signal', say: 'Prerequisites mean a directed graph; an order exists only if there is no cycle.' },
      { cue: 'Indegree', say: 'indegree counts unmet prerequisites for each node.' },
      { cue: 'Queue', say: 'The queue holds nodes with zero indegree, ready to take now.' },
      { cue: 'Update', say: 'Taking a node lowers its neighbors indegree; any that hit zero join the queue.' },
      { cue: 'Cycle', say: 'If I process fewer than n nodes, a cycle blocked the rest.' },
    ],
  },
  {
    id: 'union-find', title: 'Union-Find', skills: ['union-find', 'communication'],
    lines: [
      { cue: 'Why', say: 'I only need to know if things are connected, as edges arrive, so Union-Find.' },
      { cue: 'Parent', say: 'parent[i] points toward the root that represents i\'s group.' },
      { cue: 'Find', say: 'find walks to the root and compresses the path so later calls are near O(1).' },
      { cue: 'Union', say: 'union links roots by rank; if roots match, the edge makes a cycle.' },
    ],
  },
  {
    id: 'dijkstra', title: 'Dijkstra', skills: ['dijkstra', 'communication'],
    lines: [
      { cue: 'Why', say: 'Weights are non-negative and I need shortest distance, so Dijkstra with a min-heap.' },
      { cue: 'Heap', say: 'The heap holds (distance, node) pairs; the smallest pops first.' },
      { cue: 'Finalize', say: 'When a node pops the first time its distance is final, so I add it to seen.' },
      { cue: 'Cost', say: 'O((V + E) log V) because every edge can push onto the heap once.' },
    ],
  },
  {
    id: 'backtracking', title: 'Backtracking', skills: ['backtracking', 'communication'],
    lines: [
      { cue: 'State', say: 'path holds my current partial choice; i is where I choose next.' },
      { cue: 'Base', say: 'When the path is complete I append a copy to result.' },
      { cue: 'Choose', say: 'I choose, recurse, then undo the choice so the next branch starts clean.' },
      { cue: 'Cost', say: 'There are up to 2^n subsets, each copied in O(n), so O(n · 2^n).' },
    ],
  },
  {
    id: 'window', title: 'Sliding window', skills: ['sliding-window', 'communication'],
    lines: [
      { cue: 'Window', say: 'left and right bound a contiguous window that is always valid.' },
      { cue: 'Grow', say: 'I extend right and add the new element to my counts.' },
      { cue: 'Shrink', say: 'While the window breaks the rule, I move left forward.' },
      { cue: 'Cost', say: 'Each index enters and leaves once, so O(n) total.' },
    ],
  },
]

export const whereToLook = [
  { signal: 'n ≤ 20', think: 'Exponential is fine', pattern: 'Backtracking / bitmask', ds: 'recursion', skill: 'backtracking' },
  { signal: 'n ≤ 10^5', think: 'O(n log n) or O(n)', pattern: 'Sort, hash, window, heap', ds: 'dict / heap', skill: 'constraints' },
  { signal: 'values ≤ 10^9', think: 'O(log n) on the answer', pattern: 'Binary search on answer', ds: 'bisect', skill: 'binary-search' },
  { signal: 'sorted', think: 'Use the order', pattern: 'Two pointers / binary search', ds: 'indices', skill: 'two-pointers' },
  { signal: 'shortest / minimum steps', think: 'Unweighted → BFS, weighted → Dijkstra', pattern: 'BFS', ds: 'deque', skill: 'graph-bfs' },
  { signal: 'all combinations / permutations', think: 'Enumerate choices', pattern: 'Backtracking', ds: 'path list', skill: 'backtracking' },
  { signal: 'kth / top k', think: 'Keep only k', pattern: 'Heap of size k', ds: 'heapq', skill: 'heap' },
  { signal: 'contiguous subarray / substring', think: 'Window over a range', pattern: 'Sliding window', ds: 'Counter / dict', skill: 'sliding-window' },
  { signal: 'sum of range / subarray sum = k', think: 'prefix[j] - prefix[i]', pattern: 'Prefix sum + hashmap', ds: 'dict', skill: 'prefix-sum' },
  { signal: 'prefix of words', think: 'Shared prefixes', pattern: 'Trie', ds: 'nested dict', skill: 'trie' },
  { signal: 'intervals / meetings', think: 'Sort by start', pattern: 'Sort + sweep', ds: 'heap of ends', skill: 'intervals' },
  { signal: 'dependencies / prerequisites / order', think: 'Directed graph', pattern: 'Topological sort', ds: 'indegree + deque', skill: 'topo-sort' },
  { signal: 'connected / groups / islands', think: 'Components', pattern: 'DFS / BFS / Union-Find', ds: 'set / parent[]', skill: 'graph-dfs' },
  { signal: 'next greater / warmer', think: 'Pending items waiting', pattern: 'Monotonic stack', ds: 'stack', skill: 'monotonic-stack' },
  { signal: 'max/min ways, count ways', think: 'Overlapping subproblems', pattern: 'DP', ds: 'cache / table', skill: 'dp-1d' },
  { signal: 'matching brackets / undo', think: 'Last in, first out', pattern: 'Stack', ds: 'list', skill: 'stack' },
]

export const interviewTips = [
  { title: 'Think aloud', text: 'Silence reads as stuck. Narrate even half-ideas.' },
  { title: 'Clarify first', text: 'Two or three questions before any code. Interviewers grade this.' },
  { title: 'Be a teammate', text: 'Collaborative, humble, curious. Treat hints as teamwork.' },
  { title: 'Charm + substance', text: 'Friendly tone, but every sentence moves the solution forward.' },
  { title: 'Drive', text: 'Propose the next step yourself: "Shall I code this?"' },
  { title: 'Own bugs', text: 'Say "found a bug", fix it, move on. Calm beats perfect.' },
  { title: 'Four axes', text: 'Communication, Problem solving, Coding, Testing. Hit all four.' },
]

export const rubric = [
  { id: 'communication', label: 'Communication', hint: 'Narrated every block, clarified up front' },
  { id: 'problemSolving', label: 'Problem solving', hint: 'Found the pattern, justified the DS' },
  { id: 'coding', label: 'Coding', hint: 'Clean, correct, idiomatic Python' },
  { id: 'testing', label: 'Testing', hint: 'Traced example, caught edge cases' },
]

export const blockKinds = {
  imports: 'I import the helpers I need up front, like deque and heapq.',
  guard: 'First I handle the edge case so the main logic can assume valid input.',
  graphBuild: 'I build an adjacency list so I can reach every neighbor in O(1).',
  setup: 'I set up the state I need and say what each variable holds.',
  heap: 'I use a heap so I can always pull the smallest item in O(log n).',
  stack: 'I keep a stack of items still waiting for their answer; the top is the most recent.',
  queue: 'I start a queue with the sources; it holds the frontier for BFS.',
  helper: 'I define a helper; its contract is what it returns for one node or state.',
  bfsLoop: 'While the queue is not empty I pop the front and expand its neighbors.',
  loop: 'This loop visits each element once and keeps the invariant true.',
  memo: 'I cache the recursion so each subproblem is solved only once.',
  ret: 'At the end this holds the answer, so I return it.',
}

const blockRules = [
  ['imports', /^\s*(import|from)\s/],
  ['memo', /@cache|lru_cache|memo/],
  ['helper', /^\s*def\s+(?!\w+\(self)/m],
  ['bfsLoop', /while\s+\w*(queue|q|frontier|treasure)\b/],
  ['heap', /heapq|heappush|heapify/],
  ['queue', /(queue|q|frontier)\s*=\s*(collections\.)?deque\(/],
  ['stack', /stack\s*=\s*(\[|(collections\.)?deque)/],
  ['graphBuild', /(\w+\[\w+\]\.append\(|dd\(list\)|defaultdict\(list\)|\]\s*for\s+\w+\s+in\s+range|graph\[|adj\[)/],
  ['guard', /^\s*if\s+not\s|^\s*if\s.*==\s*\[\]|^\s*if\s+len\(/],
  ['loop', /^\s*(for|while)\s/m],
  ['ret', /^\s*return\s/],
  ['setup', /=/],
]

export const classifyBlock = text => {
  const firstLine = text.trim().split('\n')[0]
  for (const [kind, pattern] of blockRules) {
    if (kind === 'guard' && pattern.test(firstLine) && text.trim().split('\n').length <= 3) return kind
    if (kind === 'ret' && /^\s*return\s/.test(firstLine)) return kind
    if (kind !== 'guard' && kind !== 'ret' && pattern.test(text)) return kind
  }
  return 'setup'
}

export const splitSolution = solution => {
  const lines = (solution || '').replace(/\t/g, '    ').split('\n')
  const blocks = []
  let current = []
  let start = 1
  lines.forEach((line, index) => {
    if (line.trim() === '' || /^\s*class\s|^\s*def\s.*self/.test(line)) {
      if (current.length) blocks.push({ start, end: index, text: current.join('\n') })
      current = []
      start = index + 2
      return
    }
    if (!current.length) start = index + 1
    current.push(line)
  })
  if (current.length) blocks.push({ start, end: lines.length, text: current.join('\n') })
  const indentOf = text => text.match(/^ */)[0].length
  const merged = []
  for (const block of blocks) {
    const prev = merged[merged.length - 1]
    const prevHead = prev ? prev.text.split('\n')[0] : ''
    if (prev && prevHead.trim().endsWith(':') && indentOf(block.text) > indentOf(prevHead)) {
      prev.text += '\n\n' + block.text
      prev.end = block.end
    } else merged.push({ ...block })
  }
  return merged.map(block => ({ ...block, kind: classifyBlock(block.text) }))
}
