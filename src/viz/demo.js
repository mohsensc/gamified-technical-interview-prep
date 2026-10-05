const graphBfs = {
  id: 'viz-demo:bfs',
  title: 'BFS shortest hops',
  skills: ['graph-bfs'],
  problem: 'Fewest edges from node 0 to every node.',
  code: `class Solution:
    def shortestHops(self, n: int, edges: List[List[int]]) -> List[int]:
        graph = {i: [] for i in range(n)}
        for a, b in edges:
            graph[a].append(b)
            graph[b].append(a)

        dist = [-1] * n
        dist[0] = 0
        queue = deque([0])

        while queue:
            node = queue.popleft()
            for nei in graph[node]:
                if dist[nei] == -1:
                    dist[nei] = dist[node] + 1
                    queue.append(nei)

        return dist`,
  complexity: { time: 'O(V+E)', space: 'O(V)', why: 'Each node enqueued once, each edge scanned twice.' },
  inputs: [
    { label: 'small', value: { n: 6, edges: [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [4, 5]] } },
    { label: 'two paths', value: { n: 7, edges: [[0, 1], [1, 2], [2, 3], [0, 4], [4, 5], [5, 3], [3, 6]] } },
  ],
  run({ n, edges }, t) {
    const graph = Object.fromEntries(Array.from({ length: n }, (_, i) => [i, []]))
    const nodes = Array.from({ length: n }, (_, i) => ({ id: i }))
    const edgeList = edges.map(([a, b]) => ({ from: a, to: b }))
    const state = {}
    const edgeState = {}
    const panels = queue => [
      { kind: 'graph', label: 'graph', directed: false, nodes, edges: edgeList, state: { ...state }, edgeState: { ...edgeState }, values: Object.fromEntries(dist.map((d, i) => [i, d === -1 ? '∞' : d])) },
      { kind: 'queue', label: 'queue', items: [...queue] },
      { kind: 'array', label: 'dist', values: [...dist], highlight: [] },
    ]
    let dist = Array(n).fill(-1)
    t.step(3, { vars: { n }, panels: panels([]), note: 'Build an adjacency list.', say: 'I will model this as an undirected graph with an adjacency list.' })
    for (const [a, b] of edges) {
      graph[a].push(b)
      graph[b].push(a)
    }
    t.step(4, { vars: { n, graph }, panels: panels([]), note: 'Both directions since undirected.' })
    dist[0] = 0
    const queue = [0]
    state[0] = 'frontier'
    t.step(10, { vars: { dist, queue }, panels: panels(queue), note: 'Start BFS from node 0.', say: 'BFS gives fewest hops because it expands level by level.' })
    while (queue.length) {
      const node = queue.shift()
      state[node] = 'current'
      t.step(13, { vars: { node, queue, dist }, panels: panels(queue), note: `Pop ${node} from the front.` })
      for (const nei of graph[node]) {
        edgeState[`${node}->${nei}`] = 'active'
        t.step(15, { vars: { node, nei, dist }, panels: panels(queue), note: `Check neighbor ${nei}.` })
        delete edgeState[`${node}->${nei}`]
        if (dist[nei] === -1) {
          dist[nei] = dist[node] + 1
          queue.push(nei)
          state[nei] = 'frontier'
          edgeState[`${node}->${nei}`] = 'tree'
          t.step(17, { vars: { node, nei, dist, queue }, panels: panels(queue), note: `First visit: dist[${nei}] = ${dist[nei]}.`, say: dist[nei] === 1 ? 'I mark distance when enqueuing so no node is added twice.' : undefined })
        }
      }
      state[node] = 'done'
    }
    t.step(19, { vars: { dist }, panels: panels([]), note: 'Queue empty: every reachable node has its distance.', say: 'That is O(V plus E) time and O(V) space for the queue and dist.' })
  },
}

const reverseList = {
  id: 'viz-demo:reverse',
  title: 'Reverse linked list',
  skills: ['linked-list'],
  problem: 'Reverse a singly linked list in place.',
  code: `class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        prev, curr = None, head

        while curr:
            tmp = curr.next
            curr.next = prev
            prev = curr
            curr = tmp

        return prev`,
  complexity: { time: 'O(n)', space: 'O(1)', why: 'One pass, three pointers.' },
  inputs: [{ label: '1→5', value: [1, 2, 3, 4, 5] }, { label: 'two', value: [7, 9] }],
  run(values, t) {
    const nodes = values.map((val, i) => ({ id: `n${i}`, val, next: i + 1 < values.length ? `n${i + 1}` : null }))
    const byId = Object.fromEntries(nodes.map(node => [node.id, node]))
    let prev = null
    let curr = nodes.length ? 'n0' : null
    const snap = (extra = {}) => [{ kind: 'linkedlist', label: 'list', nodes: nodes.map(node => ({ ...node })), pointers: { prev, curr, ...extra }, highlight: curr ? [curr] : [] }]
    t.step(3, { vars: { prev: null, curr: curr && byId[curr].val }, panels: snap(), note: 'prev starts at None.', say: 'I keep prev and curr and flip one arrow per step.' })
    while (curr) {
      const tmp = byId[curr].next
      t.step(6, { vars: { curr: byId[curr].val, tmp: tmp && byId[tmp].val }, panels: snap({ tmp }), note: 'Save next before breaking the link.' })
      byId[curr].next = prev
      t.step(7, { vars: { curr: byId[curr].val }, panels: snap({ tmp }), note: 'Flip the arrow backward.', say: prev === null ? 'Save next first, otherwise I lose the rest of the list.' : undefined })
      prev = curr
      curr = tmp
      t.step(9, { vars: { prev: byId[prev].val, curr: curr && byId[curr].val }, panels: snap(), note: 'Advance both pointers.' })
    }
    t.step(11, { vars: { prev: prev && byId[prev].val }, panels: snap(), note: 'prev is the new head.', say: 'O(n) time, O(1) extra space.' })
  },
}

const islands = {
  id: 'viz-demo:islands',
  title: 'Number of islands',
  skills: ['grid', 'graph-dfs'],
  problem: 'Count connected groups of 1s.',
  code: `class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        rows, cols = len(grid), len(grid[0])
        seen = set()
        result = 0

        def dfs(r, c):
            if r < 0 or c < 0 or r == rows or c == cols or grid[r][c] == "0" or (r, c) in seen:
                return
            seen.add((r, c))
            dfs(r + 1, c)
            dfs(r - 1, c)
            dfs(r, c + 1)
            dfs(r, c - 1)

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == "1" and (r, c) not in seen:
                    dfs(r, c)
                    result += 1

        return result`,
  complexity: { time: 'O(r·c)', space: 'O(r·c)', why: 'Each cell visited once; recursion depth up to r·c.' },
  inputs: [{ label: '4×5', value: [['1', '1', '0', '0', '0'], ['1', '1', '0', '0', '0'], ['0', '0', '1', '0', '0'], ['0', '0', '0', '1', '1']] }],
  run(grid, t) {
    const rows = grid.length
    const cols = grid[0].length
    const seen = new Set()
    const frames = []
    let result = 0
    const state = {}
    const snap = () => [
      { kind: 'grid', label: 'grid', cells: grid, state: { ...state } },
      { kind: 'callstack', label: 'calls', frames: [...frames] },
      { kind: 'complexity', n: rows * cols, ops: seen.size },
    ]
    const dfs = (r, c) => {
      frames.push(`dfs(${r},${c})`)
      if (r < 0 || c < 0 || r === rows || c === cols || grid[r][c] === '0' || seen.has(`${r},${c}`)) {
        frames.pop()
        return
      }
      seen.add(`${r},${c}`)
      state[`${r},${c}`] = 'current'
      t.step(10, { vars: { r, c, result }, panels: snap(), note: `Sink (${r},${c}) into this island.` })
      state[`${r},${c}`] = 'visited'
      dfs(r + 1, c)
      dfs(r - 1, c)
      dfs(r, c + 1)
      dfs(r, c - 1)
      frames.pop()
    }
    t.step(3, { vars: { rows, cols }, panels: snap(), note: 'Grid is an implicit graph.', say: 'Each land cell is a node; neighbors are the 4 directions.' })
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === '1' && !seen.has(`${r},${c}`)) {
          t.step(18, { vars: { r, c, result }, panels: snap(), note: 'New unseen land: start a DFS.', say: result === 0 ? 'Every DFS from unseen land finds one whole island.' : undefined })
          dfs(r, c)
          result += 1
          t.step(20, { vars: { r, c, result }, panels: snap(), note: `Island #${result} done.` })
        }
      }
    }
    t.step(22, { vars: { result }, panels: snap(), note: `${result} islands.`, say: 'O(rows times cols) time and space.' })
  },
}

const lastStone = {
  id: 'viz-demo:heap',
  title: 'Last stone weight',
  skills: ['heap'],
  problem: 'Smash the two heaviest stones until one is left.',
  code: `class Solution:
    def lastStoneWeight(self, stones: List[int]) -> int:
        heap = [-s for s in stones]
        heapq.heapify(heap)

        while len(heap) > 1:
            first = -heapq.heappop(heap)
            second = -heapq.heappop(heap)
            if first != second:
                heapq.heappush(heap, -(first - second))

        return -heap[0] if heap else 0`,
  complexity: { time: 'O(n log n)', space: 'O(n)', why: 'n pops and pushes, each log n.' },
  inputs: [{ label: 'six', value: [2, 7, 4, 1, 8, 1] }],
  run(stones, t) {
    const heap = []
    const push = value => {
      heap.push(value)
      let i = heap.length - 1
      while (i > 0 && heap[(i - 1) >> 1] < heap[i]) {
        [heap[i], heap[(i - 1) >> 1]] = [heap[(i - 1) >> 1], heap[i]]
        i = (i - 1) >> 1
      }
    }
    const pop = () => {
      const top = heap[0]
      const last = heap.pop()
      if (heap.length) {
        heap[0] = last
        let i = 0
        while (true) {
          let big = i
          for (const child of [2 * i + 1, 2 * i + 2]) if (child < heap.length && heap[child] > heap[big]) big = child
          if (big === i) break
          ;[heap[i], heap[big]] = [heap[big], heap[i]]
          i = big
        }
      }
      return top
    }
    stones.forEach(push)
    t.step(4, { vars: { stones }, panels: [{ kind: 'heap', label: 'max-heap', items: [...heap], highlight: [0] }], note: 'Negate to fake a max-heap.', say: 'Python has a min-heap, so I store negatives.' })
    while (heap.length > 1) {
      const first = pop()
      const second = pop()
      t.step(8, { vars: { first, second }, panels: [{ kind: 'heap', label: 'max-heap', items: [...heap], highlight: [] }], note: `Pop ${first} and ${second}.` })
      if (first !== second) {
        push(first - second)
        t.step(10, { vars: { first, second, pushed: first - second }, panels: [{ kind: 'heap', label: 'max-heap', items: [...heap], highlight: [heap.indexOf(first - second)] }], note: 'Push the difference back.' })
      }
    }
    t.step(12, { vars: { result: heap[0] ?? 0 }, panels: [{ kind: 'heap', label: 'max-heap', items: [...heap], highlight: [0] }], note: 'One stone left.' })
  },
}

const coinChange = {
  id: 'viz-demo:coins',
  title: 'Coin change',
  skills: ['dp-1d'],
  problem: 'Fewest coins to make amount.',
  code: `class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        dp = [amount + 1] * (amount + 1)
        dp[0] = 0

        for a in range(1, amount + 1):
            for c in coins:
                if a - c >= 0:
                    dp[a] = min(dp[a], 1 + dp[a - c])

        return dp[amount] if dp[amount] != amount + 1 else -1`,
  complexity: { time: 'O(amount·k)', space: 'O(amount)', why: 'Each amount tries every coin.' },
  inputs: [{ label: '1,2,5 → 11', value: { coins: [1, 2, 5], amount: 11 } }],
  run({ coins, amount }, t) {
    const dp = Array(amount + 1).fill(Infinity)
    dp[0] = 0
    const table = (hl, deps) => ({ kind: 'table', label: 'dp', rows: [dp.map(v => (v === Infinity ? '∞' : v))], colLabels: dp.map((_, i) => i), highlight: hl, deps })
    t.step(4, { vars: { amount }, panels: [table([], [])], note: 'dp[a] = fewest coins for a.', say: 'Subproblem: best answer for every smaller amount.' })
    for (let a = 1; a <= amount; a++) {
      for (const c of coins) {
        if (a - c >= 0) {
          dp[a] = Math.min(dp[a], 1 + dp[a - c])
          t.step(9, { vars: { a, c, 'dp[a]': dp[a] }, panels: [table([`0,${a}`], [`0,${a - c}`])], note: `Use coin ${c}: 1 + dp[${a - c}].` })
        }
      }
    }
    t.step(11, { vars: { result: dp[amount] }, panels: [table([`0,${amount}`], [])], note: 'Answer at dp[amount].' })
  },
}

const mergeIntervals = {
  id: 'viz-demo:intervals',
  title: 'Merge intervals',
  skills: ['intervals'],
  problem: 'Merge all overlapping intervals.',
  code: `class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        intervals.sort()
        result = [intervals[0]]

        for start, end in intervals[1:]:
            if start <= result[-1][1]:
                result[-1][1] = max(result[-1][1], end)
            else:
                result.append([start, end])

        return result`,
  complexity: { time: 'O(n log n)', space: 'O(n)', why: 'Sort dominates.' },
  inputs: [{ label: 'basic', value: [[1, 3], [8, 10], [2, 6], [15, 18], [9, 12]] }],
  run(intervals, t) {
    intervals.sort((a, b) => a[0] - b[0])
    const result = [[...intervals[0]]]
    const panel = i => [{ kind: 'intervals', label: 'intervals', intervals, highlight: [i], merged: result.map(item => [...item]) }]
    t.step(4, { vars: { result }, panels: panel(0), note: 'Sorted by start.', say: 'Sorting by start means overlaps are always adjacent.' })
    for (let i = 1; i < intervals.length; i++) {
      const [start, end] = intervals[i]
      if (start <= result[result.length - 1][1]) {
        result[result.length - 1][1] = Math.max(result[result.length - 1][1], end)
        t.step(8, { vars: { start, end, result }, panels: panel(i), note: 'Overlap: extend the last one.' })
      } else {
        result.push([start, end])
        t.step(10, { vars: { start, end, result }, panels: panel(i), note: 'Gap: start a new interval.' })
      }
    }
    t.step(12, { vars: { result }, panels: panel(-1), note: 'Done.' })
  },
}

const bstInorder = {
  id: 'viz-demo:tree',
  title: 'Kth smallest in BST',
  skills: ['bst', 'tree-dfs'],
  problem: 'Return the kth smallest value.',
  code: `class Solution:
    def kthSmallest(self, root: Optional[TreeNode], k: int) -> int:
        stack = []
        curr = root

        while stack or curr:
            while curr:
                stack.append(curr)
                curr = curr.left
            curr = stack.pop()
            k -= 1
            if k == 0:
                return curr.val
            curr = curr.right`,
  complexity: { time: 'O(h + k)', space: 'O(h)', why: 'Stack holds one root-to-leaf path.' },
  inputs: [{ label: 'k=3', value: { root: [5, 3, 6, 2, 4, null, null, 1], k: 3 } }],
  run({ root, k }, t) {
    const build = (i, prefix) => (i < root.length && root[i] !== null ? { id: `t${i}`, val: root[i], left: build(2 * i + 1), right: build(2 * i + 2) } : null)
    const tree = build(0)
    const state = {}
    const stack = []
    let curr = tree
    const snap = () => [
      { kind: 'tree', label: 'bst', root: tree, state: { ...state }, pointers: curr ? { curr: curr.id } : {} },
      { kind: 'stack', label: 'stack', items: stack.map(node => node.val) },
    ]
    t.step(4, { vars: { k }, panels: snap(), note: 'Iterative inorder = sorted order.', say: 'Inorder on a BST visits values in sorted order.' })
    while (stack.length || curr) {
      while (curr) {
        stack.push(curr)
        state[curr.id] = 'frontier'
        t.step(8, { vars: { k, curr: curr.val }, panels: snap(), note: 'Push and go left.' })
        curr = curr.left
      }
      curr = stack.pop()
      k -= 1
      state[curr.id] = 'current'
      t.step(11, { vars: { k, curr: curr.val }, panels: snap(), note: `Visit ${curr.val}.` })
      if (k === 0) {
        state[curr.id] = 'path'
        t.step(13, { vars: { result: curr.val }, panels: snap(), note: 'kth visit is the answer.', say: 'O(h plus k) time, O(h) space.' })
        return
      }
      state[curr.id] = 'done'
      curr = curr.right
    }
  },
}

export const demoTraces = [graphBfs, reverseList, islands, lastStone, coinChange, mergeIntervals, bstInorder]

export default demoTraces
