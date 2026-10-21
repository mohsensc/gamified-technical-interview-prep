import { framework, interviewTips, whereToLook, templates } from './narration.js'

const bigO = {
  id: 'big-o', title: 'Big-O & constraints', icon: 'ruler', blurb: 'Read n, know the budget.',
  sections: [
    {
      type: 'bars', title: 'n → allowed complexity (≈10^8 ops/sec)',
      rows: [
        { n: 'n ≤ 10', complexity: 'O(n!) · O(2^n·n)', level: 1, example: 'permutations' },
        { n: 'n ≤ 20', complexity: 'O(2^n)', level: 0.9, example: 'subsets, bitmask' },
        { n: 'n ≤ 100', complexity: 'O(n^3) · O(n^4)', level: 0.75, example: 'triple loops, Floyd' },
        { n: 'n ≤ 1000', complexity: 'O(n^2)', level: 0.6, example: '2-D DP, pairs' },
        { n: 'n ≤ 3000', complexity: 'O(n^2)', level: 0.55, example: 'LCS, edit distance' },
        { n: 'n ≤ 10^5', complexity: 'O(n log n) · O(n)', level: 0.35, example: 'sort, heap, window' },
        { n: 'n ≤ 10^6', complexity: 'O(n) · O(n log n) tight', level: 0.2, example: 'one pass, hash' },
        { n: 'n ≤ 10^9', complexity: 'O(log n) · O(√n)', level: 0.08, example: 'binary search on answer' },
      ],
    },
    { type: 'where', title: 'Where to look', items: whereToLook },
  ],
}

const pythonOps = {
  id: 'python-ds', title: 'Python DS ops', icon: 'code', blurb: 'Full cost tables live in the cheat sheet.',
  sections: [
    {
      type: 'code', title: 'Imports I use',
      code: 'from collections import defaultdict as dd, Counter, deque\nimport heapq\nfrom functools import cache\nimport bisect',
    },
  ],
}

const decisionTree = {
  id: 'decision-tree', title: 'Pattern decision tree', icon: 'compass', blurb: 'Answer yes/no, land on a pattern.',
  sections: [
    {
      type: 'flow', title: 'Which pattern?', start: 'graph',
      nodes: {
        graph: { q: 'Things connected by relations (grid, prereqs, friends)?', yes: 'weighted', no: 'tree' },
        weighted: { q: 'Need shortest path?', yes: 'weights', no: 'ordering' },
        weights: { q: 'Edges have different weights?', yes: 'L:dijkstra', no: 'L:bfs' },
        ordering: { q: 'Dependencies / an order to finish?', yes: 'L:topo', no: 'dynamicConn' },
        dynamicConn: { q: 'Edges arrive one by one, ask "connected?"', yes: 'L:unionFind', no: 'L:dfs' },
        tree: { q: 'Input is a tree?', yes: 'treeLevel', no: 'enumerate' },
        treeLevel: { q: 'Level by level / nearest?', yes: 'L:treeBfs', no: 'L:treeDfs' },
        enumerate: { q: 'Need ALL combinations / permutations?', yes: 'L:backtracking', no: 'optimal' },
        optimal: { q: 'Count ways or min/max with choices that overlap?', yes: 'L:dp', no: 'topk' },
        topk: { q: 'kth / top k / running median?', yes: 'L:heap', no: 'contiguous' },
        contiguous: { q: 'Contiguous subarray / substring?', yes: 'sumRange', no: 'sorted' },
        sumRange: { q: 'Exact sum = k (negatives allowed)?', yes: 'L:prefix', no: 'L:window' },
        sorted: { q: 'Sorted input, or can you sort?', yes: 'searchAnswer', no: 'intervals' },
        searchAnswer: { q: 'Find a value / smallest feasible answer?', yes: 'L:binarySearch', no: 'L:twoPointers' },
        intervals: { q: 'Intervals / meetings?', yes: 'L:intervals', no: 'nextGreater' },
        nextGreater: { q: 'Next greater / matching brackets?', yes: 'L:stack', no: 'L:hash' },
      },
      leaves: {
        dijkstra: { pattern: 'Dijkstra', ds: 'heapq + dist', time: 'O((V+E) log V)', skill: 'dijkstra' },
        bfs: { pattern: 'BFS', ds: 'deque + seen', time: 'O(V+E)', skill: 'graph-bfs' },
        topo: { pattern: 'Topological sort', ds: 'indegree + deque', time: 'O(V+E)', skill: 'topo-sort' },
        unionFind: { pattern: 'Union-Find', ds: 'parent + rank', time: 'O(α(n)) per op', skill: 'union-find' },
        dfs: { pattern: 'DFS components', ds: 'graph dd(list) + seen', time: 'O(V+E)', skill: 'graph-dfs' },
        treeBfs: { pattern: 'Tree BFS', ds: 'deque', time: 'O(n)', skill: 'tree-bfs' },
        treeDfs: { pattern: 'Tree DFS', ds: 'recursion', time: 'O(n)', skill: 'tree-dfs' },
        backtracking: { pattern: 'Backtracking', ds: 'path list', time: 'O(n·2^n)', skill: 'backtracking' },
        dp: { pattern: 'Dynamic programming', ds: '@cache / table', time: 'states × transition', skill: 'dp-1d' },
        heap: { pattern: 'Heap', ds: 'heapq size k', time: 'O(n log k)', skill: 'heap' },
        prefix: { pattern: 'Prefix sum + hashmap', ds: 'dict of prefix counts', time: 'O(n)', skill: 'prefix-sum' },
        window: { pattern: 'Sliding window', ds: 'Counter / set', time: 'O(n)', skill: 'sliding-window' },
        binarySearch: { pattern: 'Binary search', ds: 'left/right', time: 'O(log n)', skill: 'binary-search' },
        twoPointers: { pattern: 'Two pointers', ds: 'left/right', time: 'O(n)', skill: 'two-pointers' },
        intervals: { pattern: 'Sort + sweep', ds: 'sorted list / heap', time: 'O(n log n)', skill: 'intervals' },
        stack: { pattern: 'Stack / monotonic stack', ds: 'list as stack', time: 'O(n)', skill: 'monotonic-stack' },
        hash: { pattern: 'Hashing', ds: 'dict / set / Counter', time: 'O(n)', skill: 'arrays-hashing' },
      },
    },
  ],
}

const sampleGraph = {
  kind: 'graph', label: 'graph = dd(list)', directed: false,
  nodes: [{ id: 0, x: 0.15, y: 0.3 }, { id: 1, x: 0.45, y: 0.15 }, { id: 2, x: 0.45, y: 0.7 }, { id: 3, x: 0.8, y: 0.4 }, { id: 4, x: 0.85, y: 0.85 }],
  edges: [{ from: 0, to: 1 }, { from: 0, to: 2 }, { from: 1, to: 3 }, { from: 2, to: 3 }, { from: 3, to: 4 }],
  state: { 0: 'done', 1: 'visited', 2: 'visited', 3: 'current', 4: 'frontier' },
  edgeState: { '0->1': 'tree', '0->2': 'tree', '1->3': 'tree' },
  values: { 0: 'd=0', 1: 'd=1', 2: 'd=1', 3: 'd=2', 4: 'd=3' },
}

const graphs = {
  id: 'graphs', title: 'Graph toolkit', icon: 'web', blurb: 'Representations + how to talk through them. Templates are in the cheat sheet.',
  sections: [
    { type: 'panels', title: 'BFS mid-run', panels: [sampleGraph, { kind: 'queue', label: 'queue', items: [4] }, { kind: 'set', label: 'seen', items: [0, 1, 2, 3, 4] }] },
    {
      type: 'table', title: 'Representations',
      cols: ['Form', 'Build', 'When'],
      rows: [
        ['Adjacency list', 'graph = dd(list)', 'Default, sparse'],
        ['Dict of lists', '{i: [] for i in range(n)}', 'Nodes 0..n-1, keep isolated'],
        ['Grid', 'rows, cols = len(grid), len(grid[0])', 'Cells, 4 neighbors'],
        ['Edge list', 'edges = [[a, b, w]]', 'Union-Find, Kruskal'],
        ['Matrix', 'adj[i][j]', 'Dense, n ≤ 1000'],
      ],
    },
    { type: 'narration', title: 'Say this', items: templates.filter(template => ['dfs', 'bfs', 'topo'].includes(template.id)) },
  ],
}

const sampleTree = {
  kind: 'tree', label: 'root',
  root: { id: 'a', val: 4, left: { id: 'b', val: 2, left: { id: 'd', val: 1, left: null, right: null }, right: { id: 'e', val: 3, left: null, right: null } }, right: { id: 'c', val: 7, left: null, right: { id: 'f', val: 9, left: null, right: null } } },
  state: { a: 'done', b: 'done', d: 'done', e: 'current', c: 'frontier' },
  values: { a: 'h=3', b: 'h=2', d: 'h=1', e: 'h=1' },
}

const trees = {
  id: 'trees', title: 'Trees', icon: 'tree', blurb: 'Recursion contract + level order.',
  sections: [
    { type: 'panels', title: 'Post-order: children answer first', panels: [sampleTree, { kind: 'callstack', label: 'call stack', frames: ['dfs(4)', 'dfs(2)', 'dfs(3)'] }] },
    {
      type: 'table', title: 'Which traversal',
      cols: ['Need', 'Use'],
      rows: [['Height, diameter, balanced', 'Post-order DFS (return up)'], ['Path from root, good nodes', 'Pre-order DFS (pass down)'], ['BST sorted order, kth smallest', 'In-order'], ['Levels, right side view', 'BFS with len(queue)'], ['LCA in BST', 'Walk: both < go left, both > go right']],
    },
    {
      type: 'code', title: 'DFS returning a value', when: 'Height, diameter, max path sum',
      code: `result = 0

def dfs(node):
    nonlocal result
    if not node:
        return 0

    left = dfs(node.left)
    right = dfs(node.right)
    result = max(result, left + right)

    return 1 + max(left, right)

dfs(root)
return result`,
    },
    {
      type: 'code', title: 'Validate BST (bounds)', when: 'Pass allowed range down',
      code: `def dfs(node, low, high):
    if not node:
        return True
    if not low < node.val < high:
        return False

    return dfs(node.left, low, node.val) and dfs(node.right, node.val, high)

return dfs(root, float("-inf"), float("inf"))`,
    },
  ],
}

const linear = {
  id: 'linear', title: 'Stacks, queues, lists', icon: 'link', blurb: 'LIFO, FIFO, pointer surgery. Templates are in the cheat sheet.',
  sections: [
    {
      type: 'panels', title: 'Shapes',
      panels: [
        { kind: 'stack', label: 'stack (list)', items: [3, 5, 8], highlight: [2] },
        { kind: 'queue', label: 'deque', items: [1, 4, 6], highlight: [0] },
        { kind: 'linkedlist', label: 'linked list', nodes: [{ id: 'n1', val: 1, next: 'n2' }, { id: 'n2', val: 2, next: 'n3' }, { id: 'n3', val: 3, next: null }], pointers: { prev: 'n1', curr: 'n2' }, highlight: ['n2'] },
      ],
    },
    {
      type: 'table', title: 'Pick one',
      cols: ['Signal', 'Structure'],
      rows: [['Brackets, undo, nested', 'stack'], ['Next greater / warmer', 'monotonic stack'], ['Process in arrival order, BFS', 'deque'], ['Sliding window max', 'monotonic deque'], ['Min in O(1)', 'stack of (val, min)'], ['Reverse / middle / cycle', 'two pointers on list']],
    },
  ],
}

const dp = {
  id: 'dp', title: 'Dynamic programming', icon: 'calculator', blurb: 'State, transition, base, order.',
  sections: [
    {
      type: 'panels', title: 'LCS table: cell = max(up, left) or diag + 1',
      panels: [{ kind: 'table', label: 'dp', colLabels: ['', 'a', 'c', 'e'], rowLabels: ['', 'a', 'b', 'c', 'e'], rows: [[0, 0, 0, 0], [0, 1, 1, 1], [0, 1, 1, 1], [0, 1, 2, 2], [0, 1, 2, 3]], highlight: ['4,3'], deps: ['3,2'] }],
    },
    {
      type: 'table', title: '4 questions',
      cols: ['Ask', 'Example (house robber)'],
      rows: [['State: what does dp(i) mean?', 'max money from houses i..n-1'], ['Transition', 'max(dp(i+1), nums[i] + dp(i+2))'], ['Base case', 'i ≥ n → 0'], ['Answer', 'dp(0)'], ['Cost', 'states × work = n × 1']],
    },
    {
      type: 'code', title: 'Top-down with @cache', when: 'Fastest to write, recursion depth ≤ ~10^4',
      code: `@cache
def dp(i):
    if i >= len(nums):
        return 0

    return max(dp(i + 1), nums[i] + dp(i + 2))

return dp(0)`,
    },
    {
      type: 'table', title: 'Families',
      cols: ['Family', 'Problems'],
      rows: [['Linear choose/skip', 'House robber, climbing stairs'], ['Unbounded knapsack', 'Coin change'], ['Two sequences', 'LCS, edit distance'], ['Grid paths', 'Unique paths, min path sum'], ['Intervals / palindromes', 'Longest palindromic substring'], ['LIS', 'O(n^2) DP or O(n log n) bisect']],
    },
  ],
}

const dayOf = {
  id: 'day-of', title: 'Interview day', icon: 'target', blurb: 'Checklist + narration framework.',
  sections: [
    { type: 'steps', title: 'The 45-minute flow', items: framework },
    { type: 'tips', title: 'What interviewers look for', items: interviewTips },
    {
      type: 'list', title: 'Day-of checklist',
      items: ['Laptop charged, camera + mic tested', 'Shared doc / editor open, font readable', 'Water, paper, pen', 'Say hello, smile, short intro (30 sec)', 'Clarify before coding, every time', 'Narrate each block as you write it', 'Trace one example through your code', 'State time + space with reasons', 'Ask one real question at the end'],
    },
    { type: 'narration', title: 'DFS / BFS lines to say', items: templates.filter(template => ['dfs', 'bfs'].includes(template.id)) },
  ],
}

export const chapters = [dayOf, bigO, decisionTree, pythonOps, graphs, trees, linear, dp]
export const chapterById = Object.fromEntries(chapters.map(chapter => [chapter.id, chapter]))

export default { chapters, chapterById }
