import { framework, interviewTips, whereToLook, templates } from './narration.js'

const bigO = {
  id: 'big-o', title: 'Big-O & constraints', icon: '📏', blurb: 'Read n, know the budget.',
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
    {
      type: 'table', title: 'Special shapes',
      cols: ['Input', 'Target'],
      rows: [
        ['Grid r×c ≤ 10^5 cells', 'O(r·c)'],
        ['Graph V, E ≤ 10^5', 'O(V+E) · O((V+E) log V)'],
        ['k ≪ n, top k', 'O(n log k)'],
        ['Many queries q', 'precompute, O(1) or O(log n) each'],
      ],
    },
    {
      type: 'table', title: 'Common costs',
      cols: ['Pattern', 'Time', 'Space'],
      rows: [
        ['Hash lookups in loop', 'O(n)', 'O(n)'],
        ['Sort then scan', 'O(n log n)', 'O(n)'],
        ['Binary search', 'O(log n)', 'O(1)'],
        ['Heap of size k', 'O(n log k)', 'O(k)'],
        ['DFS / BFS', 'O(V+E)', 'O(V)'],
        ['Subsets', 'O(n·2^n)', 'O(n)'],
        ['Permutations', 'O(n·n!)', 'O(n)'],
        ['Memo DP', 'states × work per state', 'states'],
      ],
    },
    { type: 'where', title: 'Where to look', items: whereToLook },
  ],
}

const pythonOps = {
  id: 'python-ds', title: 'Python DS ops', icon: '🐍', blurb: 'What each call really costs.',
  sections: [
    { type: 'table', title: 'list', cols: ['Op', 'Cost'], rows: [['a[i], a[i] = x', 'O(1)'], ['append, pop()', 'O(1)'], ['pop(0), insert(0, x)', 'O(n)'], ['x in a', 'O(n)'], ['a[l:r]', 'O(r-l)'], ['sort(), sorted()', 'O(n log n)'], ['min, max, sum', 'O(n)'], ['a.reverse(), a[::-1]', 'O(n)']] },
    { type: 'table', title: 'dict / set', cols: ['Op', 'Cost'], rows: [['d[k], d[k] = v', 'O(1) avg'], ['k in d, k in s', 'O(1) avg'], ['del d[k], s.remove', 'O(1)'], ['s | t, s & t', 'O(len(s)+len(t))'], ['iterate', 'O(n)']] },
    { type: 'table', title: 'deque', cols: ['Op', 'Cost'], rows: [['append, appendleft', 'O(1)'], ['pop, popleft', 'O(1)'], ['q[i] middle', 'O(n)']] },
    { type: 'table', title: 'heapq (min-heap)', cols: ['Op', 'Cost'], rows: [['heappush, heappop', 'O(log n)'], ['heapify(list)', 'O(n)'], ['heap[0] peek', 'O(1)'], ['nlargest(k, a)', 'O(n log k)'], ['max-heap', 'push -x']] },
    { type: 'table', title: 'string', cols: ['Op', 'Cost'], rows: [['s[i]', 'O(1)'], ['s + t', 'O(len)'], ['"".join(parts)', 'O(total)'], ['s[::-1], s.split()', 'O(n)'], ['sub in s', 'O(n·m) worst'], ['+= in loop', 'O(n^2) risk']] },
    { type: 'table', title: 'Counter / bisect / sorted', cols: ['Op', 'Cost'], rows: [['Counter(a)', 'O(n)'], ['c.most_common(k)', 'O(n log k)'], ['c1 == c2', 'O(distinct)'], ['bisect_left(a, x)', 'O(log n)'], ['insort(a, x)', 'O(n)'], ['sorted(d, key=...)', 'O(n log n)']] },
    {
      type: 'code', title: 'Imports I use',
      code: 'from collections import defaultdict as dd, Counter, deque\nimport heapq\nfrom functools import cache\nimport bisect',
    },
  ],
}

const decisionTree = {
  id: 'decision-tree', title: 'Pattern decision tree', icon: '🧭', blurb: 'Answer yes/no, land on a pattern.',
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
  id: 'graphs', title: 'Graph toolkit', icon: '🕸️', blurb: 'Representations + 5 templates.',
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
    {
      type: 'code', title: 'DFS (recursive)', when: 'Components, reachability, cycle check, all paths',
      code: `graph = dd(list)
for a, b in edges:
    graph[a].append(b)
    graph[b].append(a)

seen = set()

def dfs(node):
    if node in seen:
        return
    seen.add(node)

    for nei in graph[node]:
        dfs(nei)

result = 0
for node in range(n):
    if node not in seen:
        dfs(node)
        result += 1`,
    },
    {
      type: 'code', title: 'BFS shortest steps', when: 'Unweighted shortest path, levels, nearest',
      code: `queue = deque([start])
seen = {start}
steps = 0

while queue:
    for _ in range(len(queue)):
        node = queue.popleft()
        if node == target:
            return steps

        for nei in graph[node]:
            if nei not in seen:
                seen.add(nei)
                queue.append(nei)
    steps += 1

return -1`,
    },
    {
      type: 'code', title: 'Grid BFS / DFS', when: 'Islands, rotting oranges, flood fill',
      code: `rows, cols = len(grid), len(grid[0])
seen = set()

def dfs(r, c):
    if r < 0 or c < 0 or r >= rows or c >= cols:
        return
    if (r, c) in seen or grid[r][c] == "0":
        return
    seen.add((r, c))

    for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
        dfs(r + dr, c + dc)`,
    },
    {
      type: 'code', title: 'Topological sort (Kahn)', when: 'Prerequisites, build order, cycle in directed graph',
      code: `graph = {i: [] for i in range(n)}
indegree = [0] * n
for course, prereq in prerequisites:
    graph[prereq].append(course)
    indegree[course] += 1

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
    },
    {
      type: 'code', title: 'Union-Find', when: 'Dynamic connectivity, redundant edge, Kruskal',
      code: `parent = [i for i in range(n)]
rank = [1] * n

def find(node):
    result = node

    while parent[result] != result:
        parent[result] = parent[parent[result]]
        result = parent[result]

    return result

def union(n1, n2):
    p1, p2 = find(n1), find(n2)

    if p1 == p2:
        return False

    if rank[p1] > rank[p2]:
        parent[p2] = p1
        rank[p1] += rank[p2]
    else:
        parent[p1] = p2
        rank[p2] += rank[p1]
    return True`,
    },
    {
      type: 'code', title: 'Dijkstra', when: 'Weighted shortest path, weights ≥ 0',
      code: `graph = dd(list)
for u, v, w in times:
    graph[u].append((v, w))

heap = [(0, start)]
seen = set()
dist = {}

while heap:
    length, node = heapq.heappop(heap)
    if node in seen:
        continue
    seen.add(node)
    dist[node] = length

    for nei, w in graph[node]:
        if nei not in seen:
            heapq.heappush(heap, (length + w, nei))`,
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
  id: 'trees', title: 'Trees', icon: '🌳', blurb: 'Recursion contract + level order.',
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
      type: 'code', title: 'Level order BFS', when: 'Per-level answers',
      code: `if not root:
    return []

result = []
queue = deque([root])

while queue:
    level = []
    for _ in range(len(queue)):
        node = queue.popleft()
        level.append(node.val)
        if node.left:
            queue.append(node.left)
        if node.right:
            queue.append(node.right)
    result.append(level)

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
  id: 'linear', title: 'Stacks, queues, lists', icon: '🔗', blurb: 'LIFO, FIFO, pointer surgery.',
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
    {
      type: 'code', title: 'Monotonic stack', when: 'Next greater element, daily temperatures',
      code: `result = [0] * len(temperatures)
stack = []

for i, temp in enumerate(temperatures):
    while stack and temp > stack[-1][1]:
        index = stack.pop()[0]
        result[index] = i - index
    stack.append([i, temp])

return result`,
    },
    {
      type: 'code', title: 'Reverse linked list', when: 'Reverse, reorder, palindrome list',
      code: `prev, curr = None, head

while curr:
    nxt = curr.next
    curr.next = prev
    prev = curr
    curr = nxt

return prev`,
    },
    {
      type: 'code', title: 'Fast & slow pointers', when: 'Cycle, middle node',
      code: `slow, fast = head, head

while fast and fast.next:
    slow = slow.next
    fast = fast.next.next
    if slow == fast:
        return True

return False`,
    },
    {
      type: 'code', title: 'Dummy head merge', when: 'Merge lists, remove nodes',
      code: `dummy = ListNode()
curr = dummy

while list1 and list2:
    if list1.val < list2.val:
        curr.next = list1
        list1 = list1.next
    else:
        curr.next = list2
        list2 = list2.next
    curr = curr.next

curr.next = list1 or list2
return dummy.next`,
    },
  ],
}

const dp = {
  id: 'dp', title: 'Dynamic programming', icon: '🧮', blurb: 'State, transition, base, order.',
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
      type: 'code', title: 'Bottom-up 2-D', when: 'Two strings / grid',
      code: `rows, cols = len(text1), len(text2)
dp = [[0] * (cols + 1) for _ in range(rows + 1)]

for i in range(rows - 1, -1, -1):
    for j in range(cols - 1, -1, -1):
        if text1[i] == text2[j]:
            dp[i][j] = 1 + dp[i + 1][j + 1]
        else:
            dp[i][j] = max(dp[i + 1][j], dp[i][j + 1])

return dp[0][0]`,
    },
    {
      type: 'table', title: 'Families',
      cols: ['Family', 'Problems'],
      rows: [['Linear choose/skip', 'House robber, climbing stairs'], ['Unbounded knapsack', 'Coin change'], ['Two sequences', 'LCS, edit distance'], ['Grid paths', 'Unique paths, min path sum'], ['Intervals / palindromes', 'Longest palindromic substring'], ['LIS', 'O(n^2) DP or O(n log n) bisect']],
    },
  ],
}

const dayOf = {
  id: 'day-of', title: 'Interview day', icon: '🎯', blurb: 'Checklist + narration framework.',
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
