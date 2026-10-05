export const interviewLabel = 'Interview Tue 12:00'

export function interviewTime(now = new Date()) {
  const target = new Date(now)
  target.setHours(12, 0, 0, 0)
  const daysAhead = (2 - now.getDay() + 7) % 7
  target.setDate(target.getDate() + daysAhead)
  if (target.getTime() <= now.getTime() - 2 * 3600e3) target.setDate(target.getDate() + 7)
  return target
}

export const planBlocks = [
  {
    id: 'plan:complexity',
    title: 'Complexity + constraints → target Big-O',
    minutes: 40,
    skills: ['complexity', 'constraints'],
    steps: [
      { label: 'Lesson: Big-O and the constraint table', href: '#/learn/complexity' },
      { label: 'Game: Constraint Sniper (3 rounds)', href: '#/games/constraint-sniper' },
      { label: 'Drill: constraints → complexity', href: '#/drill/constraints' },
      { label: 'Drill: Big-O of code snippets', href: '#/drill/complexity' },
    ],
  },
  {
    id: 'plan:ds-diagnosis',
    title: 'Pick the data structure',
    minutes: 30,
    skills: ['ds-diagnosis', 'arrays-hashing'],
    steps: [
      { label: 'Handbook: signal → data structure', href: '#/handbook' },
      { label: 'Drill: data-structure diagnosis', href: '#/drill/ds-diagnosis' },
      { label: 'Games: pattern match round', href: '#/games' },
    ],
  },
  {
    id: 'plan:graph-dfs',
    title: 'Graphs I: model it + DFS',
    minutes: 50,
    skills: ['graph-modeling', 'graph-dfs'],
    steps: [
      { label: 'Lesson: graphs core', href: '#/learn/graphs-core' },
      { label: 'Step through a DFS trace out loud', href: '#/learn/graphs-core' },
      { label: 'Drill: model as a graph', href: '#/drill/graph-modeling' },
      { label: 'Drill: graph DFS', href: '#/drill/graph-dfs' },
    ],
  },
  {
    id: 'plan:graph-bfs',
    title: 'Graphs II: BFS + grids',
    minutes: 50,
    skills: ['graph-bfs', 'grid'],
    steps: [
      { label: 'Trace: BFS shortest path, narrate each pop', href: '#/learn/graphs-core' },
      { label: 'Drill: graph BFS', href: '#/drill/graph-bfs' },
      { label: 'Drill: grid traversal', href: '#/drill/grid' },
      { label: 'Problems: islands / rotting oranges style', href: '#/problems' },
    ],
  },
  {
    id: 'plan:recall-1',
    title: 'Recall sprint',
    minutes: 20,
    skills: ['complexity', 'graph-dfs', 'graph-bfs'],
    steps: [
      { label: 'Flashcards: everything due', href: '#/flashcards' },
      { label: 'Drill: mixed adaptive', href: '#/drill' },
    ],
  },
  {
    id: 'plan:topo',
    title: 'Topological sort + cycles',
    minutes: 35,
    skills: ['topo-sort', 'graph-modeling'],
    steps: [
      { label: 'Lesson: Kahn + DFS topo', href: '#/learn/graphs-core' },
      { label: 'Drill: topological sort', href: '#/drill/topo-sort' },
      { label: 'Problem: Course Schedule', href: '#/problems' },
    ],
  },
  {
    id: 'plan:tree-dfs',
    title: 'Tree DFS: return values up',
    minutes: 45,
    skills: ['tree-dfs'],
    steps: [
      { label: 'Lesson: trees', href: '#/learn/trees' },
      { label: 'Trace a recursive DFS with the call stack', href: '#/learn/trees' },
      { label: 'Drill: tree DFS', href: '#/drill/tree-dfs' },
    ],
  },
  {
    id: 'plan:tree-bfs',
    title: 'Tree BFS + BST',
    minutes: 35,
    skills: ['tree-bfs', 'bst', 'heap'],
    steps: [
      { label: 'Drill: level-order BFS', href: '#/drill/tree-bfs' },
      { label: 'Drill: BST', href: '#/drill/bst' },
      { label: 'Drill: heap / top-k', href: '#/drill/heap' },
    ],
  },
  {
    id: 'plan:graphs-advanced',
    title: 'Graphs III: Union-Find + Dijkstra',
    minutes: 50,
    skills: ['union-find', 'dijkstra', 'mst'],
    steps: [
      { label: 'Lesson: advanced graphs', href: '#/learn/graphs-advanced' },
      { label: 'Trace Dijkstra heap pops', href: '#/learn/graphs-advanced' },
      { label: 'Drill: union-find', href: '#/drill/union-find' },
      { label: 'Drill: Dijkstra', href: '#/drill/dijkstra' },
    ],
  },
  {
    id: 'plan:stacks-queues',
    title: 'Stacks, monotonic stacks, queues',
    minutes: 40,
    skills: ['stack', 'monotonic-stack', 'queue-deque'],
    steps: [
      { label: 'Lesson: stacks + lists', href: '#/learn/stacks-lists' },
      { label: 'Drill: stack', href: '#/drill/stack' },
      { label: 'Drill: monotonic stack', href: '#/drill/monotonic-stack' },
      { label: 'Drill: queue + deque', href: '#/drill/queue-deque' },
    ],
  },
  {
    id: 'plan:linked-lists',
    title: 'Linked lists: pointers without panic',
    minutes: 30,
    skills: ['linked-list', 'two-pointers'],
    steps: [
      { label: 'Trace: reverse + fast/slow', href: '#/learn/stacks-lists' },
      { label: 'Drill: linked list', href: '#/drill/linked-list' },
      { label: 'Flashcards review', href: '#/flashcards' },
    ],
  },
  {
    id: 'plan:google-list',
    title: 'Google-list pattern drills',
    minutes: 60,
    skills: ['sliding-window', 'two-pointers', 'intervals', 'binary-search'],
    steps: [
      { label: 'Problems: Google-tagged, pattern first', href: '#/problems' },
      { label: 'Lesson: linear patterns', href: '#/learn/linear' },
      { label: 'Lesson: paradigms (DP, greedy, backtracking)', href: '#/learn/paradigms' },
      { label: 'Drill: mixed adaptive', href: '#/drill' },
    ],
  },
  {
    id: 'plan:narration',
    title: 'Explain while coding',
    minutes: 40,
    skills: ['communication'],
    steps: [
      { label: 'Handbook: the narration script', href: '#/handbook' },
      { label: 'Trace with "say" lines, read them aloud', href: '#/learn/graphs-core' },
      { label: 'Drill: communication', href: '#/drill/communication' },
    ],
  },
  {
    id: 'plan:mock',
    title: 'Mock interview',
    minutes: 45,
    skills: ['communication', 'graph-bfs', 'ds-diagnosis'],
    steps: [
      { label: 'Mock: 45 min, timer on, talk out loud', href: '#/mock' },
      { label: 'Review misses in drill', href: '#/drill' },
    ],
  },
  {
    id: 'plan:final',
    title: 'Final review + sleep',
    minutes: 30,
    skills: ['constraints', 'graph-dfs', 'graph-bfs', 'tree-dfs'],
    steps: [
      { label: 'Flashcards: due only', href: '#/flashcards' },
      { label: 'Constraint Sniper speed round', href: '#/games/constraint-sniper' },
      { label: 'Skim the handbook cheat sheet', href: '#/handbook' },
    ],
  },
]

export const totalPlanMinutes = planBlocks.reduce((total, block) => total + block.minutes, 0)

export default { planBlocks, totalPlanMinutes, interviewTime, interviewLabel }
