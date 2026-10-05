export const skillGroups = [
  { id: 'foundations', label: 'Foundations', skills: [
    ['complexity', 'Big-O analysis'],
    ['constraints', 'Constraints → complexity'],
    ['ds-diagnosis', 'Pick the data structure'],
    ['communication', 'Explain while coding'],
  ] },
  { id: 'linear', label: 'Linear', skills: [
    ['arrays-hashing', 'Arrays & hashing'],
    ['two-pointers', 'Two pointers'],
    ['sliding-window', 'Sliding window'],
    ['prefix-sum', 'Prefix sums'],
    ['binary-search', 'Binary search'],
    ['stack', 'Stack'],
    ['monotonic-stack', 'Monotonic stack'],
    ['queue-deque', 'Queue & deque'],
    ['linked-list', 'Linked list'],
  ] },
  { id: 'trees', label: 'Trees & heaps', skills: [
    ['tree-dfs', 'Tree DFS'],
    ['tree-bfs', 'Tree BFS'],
    ['bst', 'BST'],
    ['heap', 'Heap / top-k'],
    ['trie', 'Trie'],
  ] },
  { id: 'graphs', label: 'Graphs', skills: [
    ['graph-modeling', 'Model as a graph'],
    ['graph-dfs', 'Graph DFS'],
    ['graph-bfs', 'Graph BFS / shortest path'],
    ['grid', 'Grid traversal'],
    ['topo-sort', 'Topological sort'],
    ['union-find', 'Union-Find'],
    ['dijkstra', 'Dijkstra / weighted'],
    ['mst', 'MST'],
  ] },
  { id: 'paradigms', label: 'Paradigms', skills: [
    ['backtracking', 'Backtracking'],
    ['dp-1d', '1-D DP'],
    ['dp-2d', '2-D DP'],
    ['greedy', 'Greedy'],
    ['intervals', 'Intervals'],
    ['bit', 'Bit manipulation'],
    ['math', 'Math & simulation'],
  ] },
]

export const skills = Object.fromEntries(
  skillGroups.flatMap(group => group.skills.map(([id, label]) => [id, { id, label, group: group.id }]))
)

export const skillIds = Object.keys(skills)
