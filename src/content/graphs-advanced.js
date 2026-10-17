const clone = value => JSON.parse(JSON.stringify(value))

const lineFinder = code => {
  const lines = code.split('\n')
  return (needle, after = 0) => {
    const hits = []
    lines.forEach((line, idx) => {
      if (idx >= after && line.includes(needle)) hits.push(idx + 1)
    })
    if (!hits.length) throw new Error(`missing line: ${needle}`)
    if (hits.length > 1 && !after) throw new Error(`ambiguous line: ${needle}`)
    return hits[0]
  }
}

const once = () => {
  const used = new Set()
  return (key, text) => {
    if (used.has(key)) return undefined
    used.add(key)
    return text
  }
}

const lessThan = (a, b) => {
  if (Array.isArray(a)) {
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return lessThan(a[i], b[i])
    }
    return false
  }
  return a < b
}

const heappush = (heap, item) => {
  heap.push(item)
  let i = heap.length - 1
  while (i > 0) {
    const p = (i - 1) >> 1
    if (lessThan(heap[i], heap[p])) {
      ;[heap[i], heap[p]] = [heap[p], heap[i]]
      i = p
    } else break
  }
}

const heappop = heap => {
  const top = heap[0]
  const last = heap.pop()
  if (heap.length) {
    heap[0] = last
    let i = 0
    for (;;) {
      const l = 2 * i + 1
      const r = l + 1
      let m = i
      if (l < heap.length && lessThan(heap[l], heap[m])) m = l
      if (r < heap.length && lessThan(heap[r], heap[m])) m = r
      if (m === i) break
      ;[heap[i], heap[m]] = [heap[m], heap[i]]
      i = m
    }
  }
  return top
}

const fmt = x => (x === Infinity ? '∞' : String(x))
const tup = arr => `(${arr.map(fmt).join(', ')})`

const circle = ids =>
  ids.map((id, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / ids.length
    return { id, label: String(id), x: +(0.5 + 0.38 * Math.cos(angle)).toFixed(3), y: +(0.5 + 0.38 * Math.sin(angle)).toFixed(3) }
  })

const pointNodes = points => {
  const xs = points.map(p => p[0])
  const ys = points.map(p => p[1])
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const spanX = Math.max(...xs) - minX || 1
  const spanY = Math.max(...ys) - minY || 1
  return points.map(([x, y], i) => ({
    id: i,
    label: `${i}`,
    x: +(0.1 + (0.8 * (x - minX)) / spanX).toFixed(3),
    y: +(0.9 - (0.8 * (y - minY)) / spanY).toFixed(3),
  }))
}

const manhattan = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1])

const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]

const ufCode = `class Solution:
    def countComponents(self, n: int, edges: List[List[int]]) -> int:
        parent = [i for i in range(n)]
        rank = [1] * n
        result = n

        def find(node):
            root = node
            while parent[root] != root:
                parent[root] = parent[parent[root]]
                root = parent[root]
            return root

        def union(n1, n2):
            p1, p2 = find(n1), find(n2)
            if p1 == p2:
                return 0
            if rank[p1] < rank[p2]:
                p1, p2 = p2, p1
            parent[p2] = p1
            if rank[p1] == rank[p2]:
                rank[p1] += 1
            return 1

        for a, b in edges:
            result -= union(a, b)

        return result`

const traceUfComponents = {
  id: 'graphs-advanced:trace:uf-components',
  title: 'Union-Find: count components',
  skills: ['union-find', 'communication'],
  problem: 'n nodes, undirected edges: how many connected components? (LC 323)',
  code: ufCode,
  complexity: { time: 'O(n + E·α(n))', space: 'O(n)', why: 'Path compression + union by rank make each find effectively constant.' },
  inputs: [
    { label: 'small', value: { n: 5, edges: [[0, 1], [1, 2], [3, 4]] } },
    { label: 'merges', value: { n: 6, edges: [[0, 1], [2, 3], [1, 3], [4, 5], [3, 5], [0, 5]] } },
    { label: 'no edges', value: { n: 3, edges: [] } },
  ],
  run({ n, edges }, t) {
    const L = lineFinder(ufCode)
    const say = once()
    const parent = [...Array(n).keys()]
    const rank = Array(n).fill(1)
    let result = n
    let edgeIdx = -1
    const panels = (hl = [], extra = {}) => {
      const state = {}
      parent.forEach((p, i) => { if (p === i) state[i] = 'done' })
      hl.forEach(i => { state[i] = 'current' })
      if (extra.path) extra.path.forEach(i => { if (!hl.includes(i)) state[i] = 'path' })
      return [
        { kind: 'graph', label: 'forest (child → parent), roots green', directed: true, nodes: circle([...Array(n).keys()]), edges: parent.map((p, i) => ({ from: i, to: p })).filter(e => e.from !== e.to), state, edgeState: {} },
        { kind: 'array', label: 'parent', values: [...parent], pointers: extra.pointers || {}, highlight: [...hl] },
        { kind: 'array', label: 'rank', values: [...rank], pointers: {}, highlight: extra.rankHl || [] },
        { kind: 'array', label: 'edges', values: edges.map(([a, b]) => `${a}-${b}`), pointers: edgeIdx >= 0 && edgeIdx < edges.length ? { e: edgeIdx } : {}, highlight: [] },
        { kind: 'text', text: `components = ${result}` },
      ]
    }
    t.step(L('parent = ['), { vars: { n }, panels: panels(), note: 'Every node starts as its own root', say: say('init', 'Each node is its own set. Components start at n; each successful union drops one.') })
    t.step(L('result = n'), { vars: { result }, panels: panels() })
    const find = node => {
      let root = node
      const path = [node]
      t.step(L('root = node'), { vars: { node, root }, panels: panels([root], { pointers: { root }, path }), note: `find(${node}): climb to the root` })
      while (parent[root] !== root) {
        t.step(L('while parent[root] != root'), { vars: { node, root, 'parent[root]': parent[root] }, panels: panels([root], { pointers: { root }, path }), note: `${root} is not a root, keep climbing` })
        const before = parent[root]
        parent[root] = parent[parent[root]]
        t.step(L('parent[root] = parent[parent[root]]'), {
          vars: { root, 'parent[root]': parent[root] },
          panels: panels([root], { pointers: { root }, path }),
          note: before === parent[root] ? 'Grandparent = parent, no change' : `Path halving: ${root} now points to ${parent[root]}`,
          say: before !== parent[root] ? say('compress', 'Path compression: point to my grandparent so future finds are shorter. That plus rank gives near O(1).') : undefined,
        })
        root = parent[root]
        path.push(root)
        t.step(L('root = parent[root]'), { vars: { node, root }, panels: panels([root], { pointers: { root }, path }) })
      }
      t.step(L('return root'), { vars: { node, root }, panels: panels([root], { pointers: { root }, path }), note: `Root of ${node} is ${root}` })
      return root
    }
    const union = (n1, n2) => {
      let p1 = find(n1)
      let p2 = find(n2)
      t.step(L('p1, p2 = find(n1), find(n2)'), { vars: { n1, n2, p1, p2 }, panels: panels([p1, p2], { pointers: { p1, p2 } }), note: `Roots: ${p1} and ${p2}` })
      if (p1 === p2) {
        t.step(L('return 0'), { vars: { p1, p2 }, panels: panels([p1]), note: 'Same root: already connected', say: say('same', 'Same root means they are already in one set. This edge is redundant; count unchanged.') })
        return 0
      }
      if (rank[p1] < rank[p2]) {
        ;[p1, p2] = [p2, p1]
        t.step(L('p1, p2 = p2, p1'), { vars: { p1, p2 }, panels: panels([p1, p2], { pointers: { p1, p2 }, rankHl: [p1, p2] }), note: 'Make p1 the taller tree' })
      }
      parent[p2] = p1
      t.step(L('parent[p2] = p1'), { vars: { p1, p2 }, panels: panels([p1, p2], { pointers: { p1, p2 } }), note: `Hang root ${p2} under ${p1}`, say: say('rank', 'Union by rank: attach the shorter tree under the taller root so height stays logarithmic.') })
      if (rank[p1] === rank[p2]) {
        rank[p1] += 1
        t.step(L('rank[p1] += 1'), { vars: { p1, 'rank[p1]': rank[p1] }, panels: panels([p1], { rankHl: [p1] }), note: 'Equal heights: new tree is one taller' })
      }
      t.step(L('return 1'), { vars: { p1, p2 }, panels: panels([p1]), note: 'Two sets merged' })
      return 1
    }
    edges.forEach(([a, b], i) => {
      edgeIdx = i
      t.step(L('for a, b in edges'), { vars: { a, b }, panels: panels([a, b]), note: `Edge ${a}-${b}` })
      result -= union(a, b)
      t.step(L('result -= union(a, b)'), { vars: { a, b, result }, panels: panels(), note: `components = ${result}` })
    })
    edgeIdx = edges.length
    t.step(L('return result'), { vars: { result }, panels: panels(), note: `${result} components = number of roots`, say: 'O(n + E·α(n)) time, O(n) space. α is inverse Ackermann, at most 4 in practice.' })
  },
}

const redundantCode = `class Solution:
    def findRedundantConnection(self, edges: List[List[int]]) -> List[int]:
        parent = [i for i in range(len(edges) + 1)]
        rank = [1] * (len(edges) + 1)

        def find(node):
            while parent[node] != node:
                parent[node] = parent[parent[node]]
                node = parent[node]
            return node

        def union(n1, n2):
            p1, p2 = find(n1), find(n2)
            if p1 == p2:
                return False
            if rank[p1] < rank[p2]:
                p1, p2 = p2, p1
            parent[p2] = p1
            rank[p1] += rank[p2]
            return True

        for a, b in edges:
            if not union(a, b):
                return [a, b]`

const traceRedundant = {
  id: 'graphs-advanced:trace:redundant-connection',
  title: 'Redundant connection (Union-Find)',
  skills: ['union-find', 'graph-modeling'],
  problem: 'A tree plus one extra edge: return the edge that creates the cycle (LC 684).',
  code: redundantCode,
  complexity: { time: 'O(n·α(n))', space: 'O(n)', why: 'One union per edge; first failed union is the cycle edge.' },
  inputs: [
    { label: 'triangle', value: [[1, 2], [1, 3], [2, 3]] },
    { label: 'square + tail', value: [[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]] },
    { label: 'late cycle', value: [[1, 2], [3, 4], [5, 3], [2, 5], [1, 4], [4, 6]] },
  ],
  run(edges, t) {
    const L = lineFinder(redundantCode)
    const say = once()
    const n = edges.length
    const parent = [...Array(n + 1).keys()]
    const rank = Array(n + 1).fill(1)
    const ids = [...Array(n).keys()].map(i => i + 1)
    const edgeState = {}
    const panels = (hl = [], ptr = {}) => {
      const state = {}
      ids.forEach(i => { if (parent[i] === i) state[i] = 'done' })
      hl.forEach(i => { state[i] = 'current' })
      return [
        { kind: 'graph', label: 'input graph', directed: false, nodes: circle(ids), edges: edges.map(([a, b]) => ({ from: a, to: b })), state: { ...state }, edgeState: { ...edgeState } },
        { kind: 'graph', label: 'union-find forest', directed: true, nodes: circle(ids), edges: ids.filter(i => parent[i] !== i).map(i => ({ from: i, to: parent[i] })), state, edgeState: {} },
        { kind: 'array', label: 'parent (index 0 unused)', values: [...parent], pointers: ptr, highlight: [...hl], dim: [0] },
      ]
    }
    t.step(L('parent = ['), { vars: { n }, panels: panels(), note: 'Nodes are 1..n, so size n + 1', say: say('idea', 'Add edges one by one. If both ends already share a root, this edge closes a cycle.') })
    const find = node => {
      while (parent[node] !== node) {
        parent[node] = parent[parent[node]]
        node = parent[node]
      }
      return node
    }
    for (const [a, b] of edges) {
      edgeState[`${a}->${b}`] = 'active'
      t.step(L('for a, b in edges'), { vars: { a, b }, panels: panels([a, b]), note: `Try edge ${a}-${b}` })
      let p1 = find(a)
      let p2 = find(b)
      t.step(L('p1, p2 = find(n1), find(n2)'), { vars: { n1: a, n2: b, p1, p2 }, panels: panels([p1, p2], { p1, p2 }), note: `Roots ${p1} and ${p2}` })
      if (p1 === p2) {
        edgeState[`${a}->${b}`] = 'back'
        t.step(L('return False'), { vars: { p1, p2 }, panels: panels([a, b]), note: 'Same root: cycle found', say: say('cycle', 'Both ends already connected, so this edge makes a cycle. It is the last such edge since we scan in order.') })
        t.step(L('return [a, b]'), { vars: { result: `[${a}, ${b}]` }, panels: panels([a, b]), note: `Answer [${a}, ${b}]`, say: 'O(n·α(n)) time, O(n) space. DFS per edge would be O(n²).' })
        return
      }
      if (rank[p1] < rank[p2]) [p1, p2] = [p2, p1]
      parent[p2] = p1
      rank[p1] += rank[p2]
      edgeState[`${a}->${b}`] = 'tree'
      t.step(L('parent[p2] = p1'), { vars: { p1, p2, 'rank[p1]': rank[p1] }, panels: panels([p1], { p1 }), note: `Merge: ${p2} under ${p1}`, say: say('merge', 'Different roots: union them and keep the bigger set as the root.') })
      t.step(L('return True'), { vars: { a, b }, panels: panels(), note: 'Edge is safe, part of the tree' })
    }
  },
}

const dijkstraCode = `import heapq

class Solution:
    def networkDelayTime(self, times: List[List[int]], n: int, k: int) -> int:
        graph = {i: [] for i in range(1, n + 1)}

        for u, v, w in times:
            graph[u].append((v, w))

        seen = set()
        heap = [(0, k)]
        t = 0

        while heap:
            length, node = heapq.heappop(heap)
            if node in seen:
                continue
            seen.add(node)
            t = max(t, length)

            for nei, w in graph[node]:
                if nei not in seen:
                    heapq.heappush(heap, (length + w, nei))

        return t if len(seen) == n else -1`

const traceDijkstra = {
  id: 'graphs-advanced:trace:network-delay',
  title: 'Dijkstra: network delay time',
  skills: ['dijkstra', 'heap', 'communication'],
  problem: 'Signal from k along weighted directed edges: time until all n nodes hear it, or -1 (LC 743).',
  code: dijkstraCode,
  complexity: { time: 'O((V+E) log V)', space: 'O(V+E)', why: 'Each edge pushes at most once; heap ops cost log.' },
  inputs: [
    { label: 'stale entries', value: { n: 5, k: 1, times: [[1, 2, 4], [1, 3, 1], [3, 2, 2], [2, 4, 1], [3, 4, 5], [4, 5, 3]] } },
    { label: 'LC example', value: { n: 4, k: 2, times: [[2, 1, 1], [2, 3, 1], [3, 4, 1]] } },
    { label: 'unreachable', value: { n: 3, k: 1, times: [[1, 2, 1], [2, 1, 1]] } },
  ],
  run({ n, k, times }, t) {
    const L = lineFinder(dijkstraCode)
    const say = once()
    const ids = [...Array(n).keys()].map(i => i + 1)
    const graph = Object.fromEntries(ids.map(i => [i, []]))
    const seen = new Set()
    const heap = [[0, k]]
    const best = { [k]: 0 }
    const edgeState = {}
    let tt = 0
    const panels = (cur = null, heapHl = []) => {
      const state = {}
      heap.forEach(([, v]) => { if (!seen.has(v)) state[v] = 'frontier' })
      seen.forEach(v => { state[v] = 'done' })
      if (cur !== null) state[cur] = 'current'
      const values = {}
      Object.entries(best).forEach(([v, d]) => { values[v] = seen.has(+v) ? `${d}` : `≤${d}` })
      return [
        { kind: 'graph', label: 'graph (labels = best time)', directed: true, nodes: circle(ids), edges: times.map(([u, v, w]) => ({ from: u, to: v, w })), state, edgeState: { ...edgeState }, values },
        { kind: 'heap', label: 'heap (time, node)', items: heap.map(tup), highlight: heapHl },
        { kind: 'set', label: 'seen (final)', items: [...seen], highlight: cur !== null && seen.has(cur) ? [cur] : [] },
        { kind: 'text', text: `t = ${tt}` },
      ]
    }
    for (const [u, v, w] of times) graph[u].push([v, w])
    t.step(L('for u, v, w in times'), { vars: { n, k }, panels: panels(), note: 'Adjacency list: node → (neighbor, weight)' })
    t.step(L('heap = [(0, k)]'), { vars: { k }, panels: panels(k, [0]), note: `Start at ${k} with time 0`, say: say('setup', 'Weighted, non-negative edges, shortest times from one source: Dijkstra with a min-heap of (time, node).') })
    while (heap.length) {
      const [length, node] = heappop(heap)
      t.step(L('heapq.heappop(heap)'), { vars: { length, node }, panels: panels(node), note: `Pop smallest: node ${node} at time ${length}`, say: say('pop', 'The heap always pops the closest unfinished node. Its time is now final, since all weights are non-negative.') })
      if (seen.has(node)) {
        t.step(L('continue'), { vars: { length, node }, panels: panels(node), note: 'Stale entry: already finalized, skip', say: say('lazy', 'Lazy deletion: instead of decrease-key, we push duplicates and skip stale ones when popped.') })
        continue
      }
      seen.add(node)
      best[node] = length
      t.step(L('seen.add(node)'), { vars: { node, length }, panels: panels(node), note: `${node} finalized at ${length}` })
      tt = Math.max(tt, length)
      t.step(L('t = max(t, length)'), { vars: { t: tt }, panels: panels(node), note: 'Answer is the slowest arrival' })
      for (const [nei, w] of graph[node]) {
        const key = `${node}->${nei}`
        if (!seen.has(nei)) {
          heappush(heap, [length + w, nei])
          if (best[nei] === undefined || length + w < best[nei]) best[nei] = length + w
          edgeState[key] = 'active'
          t.step(L('heapq.heappush(heap, (length + w, nei))'), { vars: { node, nei, w, 'length + w': length + w }, panels: panels(node, [heap.findIndex(x => x[0] === length + w && x[1] === nei)]), note: `Relax ${node}→${nei}: push (${length + w}, ${nei})`, say: say('relax', 'Relax each edge: push the candidate time. Smaller candidates will pop first.') })
          edgeState[key] = 'tree'
        } else {
          t.step(L('if nei not in seen'), { vars: { node, nei }, panels: panels(node), note: `${nei} already final, skip` })
        }
      }
    }
    const answer = seen.size === n ? tt : -1
    t.step(L('return t if len(seen) == n else -1'), { vars: { t: tt, 'len(seen)': seen.size, answer }, panels: panels(), note: answer === -1 ? 'Some node never reached: -1' : `All reached; answer ${answer}`, say: 'O((V+E) log V) time with the heap, O(V+E) space.' })
  },
}

const swimCode = `import heapq

class Solution:
    def swimInWater(self, grid: List[List[int]]) -> int:
        n = len(grid)
        seen = {(0, 0)}
        heap = [(grid[0][0], 0, 0)]

        while heap:
            height, r, c = heapq.heappop(heap)
            if r == n - 1 and c == n - 1:
                return height

            for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
                nr, nc = r + dr, c + dc
                if 0 <= nr < n and 0 <= nc < n and (nr, nc) not in seen:
                    seen.add((nr, nc))
                    heapq.heappush(heap, (max(height, grid[nr][nc]), nr, nc))`

const traceSwim = {
  id: 'graphs-advanced:trace:swim-rising-water',
  title: 'Swim in rising water (minimax Dijkstra)',
  skills: ['dijkstra', 'grid', 'heap'],
  problem: 'Min time t so a path from top-left to bottom-right has every cell ≤ t (LC 778).',
  code: swimCode,
  complexity: { time: 'O(n² log n)', space: 'O(n²)', why: 'n² cells each pushed once, heap ops log(n²).' },
  inputs: [
    { label: '3x3', value: [[0, 2, 4], [3, 8, 1], [5, 6, 2]] },
    { label: '4x4', value: [[0, 1, 9, 3], [8, 2, 10, 4], [12, 5, 6, 11], [13, 14, 7, 4]] },
    { label: '2x2', value: [[0, 2], [1, 3]] },
  ],
  run(grid, t) {
    const L = lineFinder(swimCode)
    const say = once()
    const n = grid.length
    const seen = new Set(['0,0'])
    const popped = new Set()
    const heap = [[grid[0][0], 0, 0]]
    const cost = { '0,0': grid[0][0] }
    const panels = (cur = null, done = false) => {
      const state = {}
      heap.forEach(([, r, c]) => { state[`${r},${c}`] = 'frontier' })
      popped.forEach(key => { state[key] = done ? 'path' : 'visited' })
      if (cur) state[cur] = 'current'
      const values = {}
      Object.entries(cost).forEach(([key, v]) => { values[key] = `t${v}` })
      return [
        { kind: 'grid', label: 'elevation (tN = water level needed)', cells: clone(grid), state, values },
        { kind: 'heap', label: 'heap (level, r, c)', items: heap.map(tup), highlight: [] },
      ]
    }
    t.step(L('heap = [(grid[0][0], 0, 0)]'), { vars: { n }, panels: panels('0,0'), note: 'Cost of a path = its highest cell', say: say('model', 'Path cost is the max cell, not a sum. Dijkstra still works: always expand the lowest bottleneck first.') })
    while (heap.length) {
      const [height, r, c] = heappop(heap)
      popped.add(`${r},${c}`)
      t.step(L('heapq.heappop(heap)'), { vars: { height, r, c }, panels: panels(`${r},${c}`), note: `Lowest water level available: ${height}` })
      if (r === n - 1 && c === n - 1) {
        t.step(L('return height'), { vars: { height }, panels: panels(`${r},${c}`, true), note: `Reached corner at level ${height}`, say: 'First pop of the target is optimal. O(n² log n) time, O(n²) space.' })
        return
      }
      for (const [dr, dc] of dirs) {
        const nr = r + dr
        const nc = c + dc
        if (nr >= 0 && nr < n && nc >= 0 && nc < n && !seen.has(`${nr},${nc}`)) {
          seen.add(`${nr},${nc}`)
          const level = Math.max(height, grid[nr][nc])
          heappush(heap, [level, nr, nc])
          cost[`${nr},${nc}`] = level
          t.step(L('heapq.heappush(heap, (max(height, grid[nr][nc]), nr, nc))'), { vars: { r, c, nr, nc, level }, panels: panels(`${r},${c}`), note: `Neighbor (${nr},${nc}) needs level max(${height}, ${grid[nr][nc]}) = ${level}`, say: say('push', 'New cost is max of the bottleneck so far and the next cell. Marking seen on push is safe because pops are non-decreasing.') })
        }
      }
    }
  },
}

const effortCode = `import heapq
import math

class Solution:
    def minimumEffortPath(self, heights: List[List[int]]) -> int:
        rows, cols = len(heights), len(heights[0])
        effort = [[math.inf] * cols for _ in range(rows)]
        effort[0][0] = 0
        heap = [(0, 0, 0)]

        while heap:
            curr, r, c = heapq.heappop(heap)
            if r == rows - 1 and c == cols - 1:
                return curr
            if curr > effort[r][c]:
                continue

            for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols:
                    step = max(curr, abs(heights[nr][nc] - heights[r][c]))
                    if step < effort[nr][nc]:
                        effort[nr][nc] = step
                        heapq.heappush(heap, (step, nr, nc))`

const traceEffort = {
  id: 'graphs-advanced:trace:min-effort',
  title: 'Path with minimum effort',
  skills: ['dijkstra', 'grid'],
  problem: 'Effort = max height jump along a path; minimize it from top-left to bottom-right (LC 1631).',
  code: effortCode,
  complexity: { time: 'O(rc log(rc))', space: 'O(rc)', why: 'Dijkstra over r·c cells with 4 edges each.' },
  inputs: [
    { label: 'LC 1', value: [[1, 2, 2], [3, 8, 2], [5, 3, 5]] },
    { label: 'LC 2', value: [[1, 2, 3], [3, 8, 4], [5, 3, 5]] },
    { label: 'wide', value: [[1, 10, 6, 7], [1, 3, 5, 8], [4, 2, 1, 9]] },
  ],
  run(heights, t) {
    const L = lineFinder(effortCode)
    const say = once()
    const rows = heights.length
    const cols = heights[0].length
    const effort = heights.map(row => row.map(() => Infinity))
    effort[0][0] = 0
    const heap = [[0, 0, 0]]
    const done = new Set()
    const panels = (cur = null, finished = false) => {
      const state = {}
      heap.forEach(([, r, c]) => { state[`${r},${c}`] = 'frontier' })
      done.forEach(key => { state[key] = finished ? 'path' : 'visited' })
      if (cur) state[cur] = 'current'
      const values = {}
      effort.forEach((row, r) => row.forEach((v, c) => { if (v !== Infinity) values[`${r},${c}`] = `e${v}` }))
      return [
        { kind: 'grid', label: 'heights (eN = best effort)', cells: clone(heights), state, values },
        { kind: 'table', label: 'effort', rows: effort.map(row => row.map(fmt)), highlight: cur ? [cur] : [], deps: [] },
        { kind: 'heap', label: 'heap (effort, r, c)', items: heap.map(tup), highlight: [] },
      ]
    }
    t.step(L('heap = [(0, 0, 0)]'), { vars: { rows, cols }, panels: panels('0,0'), note: 'Cells are nodes, jumps are edge weights', say: say('model', 'Grid as a weighted graph. Path cost is the max jump, and max is monotone, so Dijkstra applies.') })
    while (heap.length) {
      const [curr, r, c] = heappop(heap)
      t.step(L('heapq.heappop(heap)'), { vars: { curr, r, c }, panels: panels(`${r},${c}`), note: `Pop (${r},${c}) with effort ${curr}` })
      if (r === rows - 1 && c === cols - 1) {
        done.add(`${r},${c}`)
        t.step(L('return curr'), { vars: { curr }, panels: panels(`${r},${c}`, true), note: `Target popped: effort ${curr}`, say: 'Target popped first time is optimal. O(rc log rc) time, O(rc) space.' })
        return
      }
      if (curr > effort[r][c]) {
        t.step(L('continue'), { vars: { curr, best: effort[r][c] }, panels: panels(`${r},${c}`), note: 'Stale: a better effort was already found', say: say('stale', 'Stale heap entry, we found a cheaper way here already. Skip it.') })
        continue
      }
      done.add(`${r},${c}`)
      for (const [dr, dc] of dirs) {
        const nr = r + dr
        const nc = c + dc
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          const step = Math.max(curr, Math.abs(heights[nr][nc] - heights[r][c]))
          if (step < effort[nr][nc]) {
            effort[nr][nc] = step
            heappush(heap, [step, nr, nc])
            t.step(L('heapq.heappush(heap, (step, nr, nc))'), { vars: { r, c, nr, nc, step }, panels: panels(`${r},${c}`), note: `Improve (${nr},${nc}) to ${step}`, say: say('relax', 'Relax: max of effort so far and this jump. Only push if it beats the best known.') })
          }
        }
      }
    }
  },
}

const flightsCode = `import math

class Solution:
    def findCheapestPrice(self, n: int, flights: List[List[int]], src: int, dst: int, k: int) -> int:
        prices = [math.inf] * n
        prices[src] = 0

        for i in range(k + 1):
            temp = prices[:]

            for u, v, w in flights:
                if prices[u] == math.inf:
                    continue
                if prices[u] + w < temp[v]:
                    temp[v] = prices[u] + w

            prices = temp

        return -1 if prices[dst] == math.inf else prices[dst]`

const traceFlights = {
  id: 'graphs-advanced:trace:cheapest-flights',
  title: 'Cheapest flights within k stops (Bellman-Ford)',
  skills: ['dijkstra', 'graph-modeling', 'dp-1d'],
  problem: 'Cheapest price src → dst using at most k stops, or -1 (LC 787).',
  code: flightsCode,
  complexity: { time: 'O(k·E)', space: 'O(n)', why: 'k + 1 rounds, each relaxes every flight once.' },
  inputs: [
    { label: 'LC 1 (k=1)', value: { n: 4, flights: [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]], src: 0, dst: 3, k: 1 } },
    { label: 'k=1 cheap', value: { n: 3, flights: [[0, 1, 100], [1, 2, 100], [0, 2, 500]], src: 0, dst: 2, k: 1 } },
    { label: 'k=0 direct', value: { n: 3, flights: [[0, 1, 100], [1, 2, 100], [0, 2, 500]], src: 0, dst: 2, k: 0 } },
  ],
  run({ n, flights, src, dst, k }, t) {
    const L = lineFinder(flightsCode)
    const say = once()
    const ids = [...Array(n).keys()]
    let prices = Array(n).fill(Infinity)
    prices[src] = 0
    let temp = null
    const history = [prices.map(fmt)]
    const panels = (edge = null, hlTemp = []) => {
      const state = { [src]: 'done', [dst]: 'path' }
      if (edge) state[edge[0]] = 'current'
      const values = {}
      ids.forEach(i => { values[i] = fmt((temp || prices)[i]) })
      const edgeState = edge ? { [`${edge[0]}->${edge[1]}`]: 'active' } : {}
      return [
        { kind: 'graph', label: 'flights (labels = price this round)', directed: true, nodes: circle(ids), edges: flights.map(([u, v, w]) => ({ from: u, to: v, w })), state, edgeState, values },
        { kind: 'array', label: 'prices (last round)', values: prices.map(fmt), pointers: edge ? { u: edge[0] } : {}, highlight: [] },
        { kind: 'array', label: 'temp (this round)', values: (temp || prices).map(fmt), pointers: edge ? { v: edge[1] } : {}, highlight: hlTemp },
        { kind: 'table', label: 'price after each round (row = edges used)', rows: history.map(row => [...row]), rowLabels: history.map((_, i) => `${i}`), colLabels: ids.map(String), highlight: [], deps: [] },
      ]
    }
    t.step(L('prices[src] = 0'), { vars: { src, dst, k }, panels: panels(), note: 'Only src reachable with 0 flights', say: say('why', 'k stops means at most k + 1 flights. Bellman-Ford round i finds best price using at most i flights.') })
    for (let i = 0; i < k + 1; i++) {
      temp = [...prices]
      t.step(L('temp = prices[:]'), { vars: { i }, panels: panels(), note: `Round ${i + 1}: copy prices`, say: say('copy', 'Copy so this round only extends last round paths by one edge. Without the copy, paths could chain many flights in one round.') })
      for (const [u, v, w] of flights) {
        if (prices[u] === Infinity) {
          t.step(L('continue'), { vars: { i, u, v, w }, panels: panels([u, v]), note: `${u} not reachable yet, skip` })
          continue
        }
        if (prices[u] + w < temp[v]) {
          temp[v] = prices[u] + w
          t.step(L('temp[v] = prices[u] + w'), { vars: { i, u, v, w, 'temp[v]': temp[v] }, panels: panels([u, v], [v]), note: `${u}→${v}: ${prices[u]} + ${w} = ${temp[v]} is cheaper` })
        } else {
          t.step(L('if prices[u] + w < temp[v]'), { vars: { i, u, v, w }, panels: panels([u, v]), note: `${prices[u]} + ${w} not better than ${fmt(temp[v])}` })
        }
      }
      prices = temp
      temp = null
      history.push(prices.map(fmt))
      t.step(L('prices = temp'), { vars: { i }, panels: panels(), note: `After ${i + 1} flight(s)` })
    }
    const answer = prices[dst] === Infinity ? -1 : prices[dst]
    t.step(L('return -1 if prices[dst] == math.inf else prices[dst]'), { vars: { answer }, panels: panels(), note: `Answer ${answer}`, say: 'O(k·E) time, O(n) space. Plain Dijkstra fails here: cheapest path may use too many stops.' })
  },
}

const primCode = `import heapq

class Solution:
    def minCostConnectPoints(self, points: List[List[int]]) -> int:
        n = len(points)
        seen = set()
        heap = [(0, 0)]
        total = 0

        while len(seen) < n:
            cost, i = heapq.heappop(heap)
            if i in seen:
                continue
            seen.add(i)
            total += cost
            x, y = points[i]

            for j in range(n):
                if j not in seen:
                    distance = abs(points[j][0] - x) + abs(points[j][1] - y)
                    heapq.heappush(heap, (distance, j))

        return total`

const mstInputs = [
  { label: 'LC 1', value: [[0, 0], [2, 2], [3, 10], [5, 2], [7, 0]] },
  { label: 'triangle', value: [[3, 12], [-2, 5], [-4, 1]] },
  { label: 'square', value: [[0, 0], [1, 1], [1, 0], [-1, 1]] },
]

const tracePrim = {
  id: 'graphs-advanced:trace:prim',
  title: "Prim's MST: min cost to connect points",
  skills: ['mst', 'heap', 'greedy'],
  problem: 'Connect all points with min total Manhattan distance (LC 1584).',
  code: primCode,
  complexity: { time: 'O(n² log n)', space: 'O(n²)', why: 'Dense graph: each pop pushes up to n edges.' },
  inputs: mstInputs,
  run(points, t) {
    const L = lineFinder(primCode)
    const say = once()
    const n = points.length
    const nodes = pointNodes(points)
    const seen = new Set()
    const heap = [[0, 0, -1]]
    const treeEdges = []
    let candidates = []
    let total = 0
    const panels = (cur = null) => {
      const state = {}
      heap.forEach(([, j]) => { if (!seen.has(j)) state[j] = 'frontier' })
      seen.forEach(j => { state[j] = 'done' })
      if (cur !== null) state[cur] = 'current'
      const edges = [...treeEdges.map(([a, b, w]) => ({ from: a, to: b, w })), ...candidates.map(([a, b, w]) => ({ from: a, to: b, w }))]
      const edgeState = {}
      treeEdges.forEach(([a, b]) => { edgeState[`${a}->${b}`] = 'tree' })
      candidates.forEach(([a, b]) => { edgeState[`${a}->${b}`] = 'active' })
      return [
        { kind: 'graph', label: 'points (green = in tree)', directed: false, nodes, edges, state, edgeState },
        { kind: 'heap', label: 'heap (cost, point)', items: heap.map(([c, j]) => tup([c, j])), highlight: [] },
        { kind: 'text', text: `total = ${total}` },
      ]
    }
    t.step(L('heap = [(0, 0)]'), { vars: { n }, panels: panels(0), note: 'Start the tree at point 0 for free', say: say('idea', "Prim's: grow one tree, always adding the cheapest edge that reaches a new point.") })
    while (seen.size < n) {
      const [cost, i, from] = heappop(heap)
      candidates = []
      t.step(L('heapq.heappop(heap)'), { vars: { cost, i }, panels: panels(i), note: `Cheapest edge reaches point ${i} at cost ${cost}` })
      if (seen.has(i)) {
        t.step(L('continue'), { vars: { i }, panels: panels(i), note: `${i} already in tree, stale edge`, say: say('stale', 'Already connected: skip. Lazy deletion again, same trick as Dijkstra.') })
        continue
      }
      seen.add(i)
      if (from >= 0) treeEdges.push([from, i, cost])
      total += cost
      t.step(L('total += cost'), { vars: { i, cost, total }, panels: panels(i), note: `Add point ${i}, total ${total}`, say: say('cut', 'Cut property: the cheapest edge leaving the tree is always safe to add.') })
      const [x, y] = points[i]
      for (let j = 0; j < n; j++) {
        if (!seen.has(j)) {
          const distance = Math.abs(points[j][0] - x) + Math.abs(points[j][1] - y)
          heappush(heap, [distance, j, i])
          candidates.push([i, j, distance])
        }
      }
      if (candidates.length) t.step(L('heapq.heappush(heap, (distance, j))'), { vars: { i, pushed: candidates.length }, panels: panels(i), note: `Push edges from ${i} to every outside point` })
    }
    candidates = []
    t.step(L('return total'), { vars: { total }, panels: panels(), note: `MST cost ${total}`, say: 'Dense graph with n² edges, so O(n² log n). n - 1 tree edges total.' })
  },
}

const kruskalCode = `class Solution:
    def minCostConnectPoints(self, points: List[List[int]]) -> int:
        n = len(points)
        edges = []

        for i in range(n):
            for j in range(i + 1, n):
                distance = abs(points[i][0] - points[j][0]) + abs(points[i][1] - points[j][1])
                edges.append((distance, i, j))

        edges.sort()
        parent = [i for i in range(n)]

        def find(node):
            while parent[node] != node:
                parent[node] = parent[parent[node]]
                node = parent[node]
            return node

        total, used = 0, 0

        for distance, i, j in edges:
            p1, p2 = find(i), find(j)
            if p1 == p2:
                continue
            parent[p1] = p2
            total += distance
            used += 1
            if used == n - 1:
                break

        return total`

const traceKruskal = {
  id: 'graphs-advanced:trace:kruskal',
  title: "Kruskal's MST with Union-Find",
  skills: ['mst', 'union-find', 'greedy'],
  problem: 'Same points problem: sort all edges, add the cheapest that joins two components (LC 1584).',
  code: kruskalCode,
  complexity: { time: 'O(E log E)', space: 'O(E)', why: 'Sorting dominates; here E = n², so O(n² log n).' },
  inputs: mstInputs,
  run(points, t) {
    const L = lineFinder(kruskalCode)
    const say = once()
    const n = points.length
    const nodes = pointNodes(points)
    const edges = []
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) edges.push([manhattan(points[i], points[j]), i, j])
    const parent = [...Array(n).keys()]
    const edgeState = {}
    let ptr = -1
    let total = 0
    let used = 0
    const panels = (hl = []) => {
      const state = {}
      parent.forEach((p, i) => { state[i] = p === i ? 'done' : 'visited' })
      hl.forEach(i => { state[i] = 'current' })
      return [
        { kind: 'graph', label: 'all edges (pink = MST)', directed: false, nodes, edges: edges.map(([w, a, b]) => ({ from: a, to: b, w })), state, edgeState: { ...edgeState } },
        { kind: 'array', label: 'edges by cost', values: edges.map(([w, a, b]) => `${w}:${a}-${b}`), pointers: ptr >= 0 && ptr < edges.length ? { e: ptr } : {}, highlight: [], sorted: true },
        { kind: 'array', label: 'parent', values: [...parent], pointers: {}, highlight: [...hl] },
        { kind: 'text', text: `total = ${total}, used = ${used}/${n - 1}` },
      ]
    }
    t.step(L('edges.append((distance, i, j))'), { vars: { n, edges: edges.length }, panels: panels(), note: `Built all ${edges.length} pair edges` })
    edges.sort((a, b) => (lessThan(a, b) ? -1 : lessThan(b, a) ? 1 : 0))
    t.step(L('edges.sort()'), { vars: { edges: edges.length }, panels: panels(), note: 'Sort by cost: greedy takes cheapest first', say: say('idea', "Kruskal's: sort edges, take each one unless it joins two points already connected. Union-Find answers that in near O(1).") })
    const find = node => {
      while (parent[node] !== node) {
        parent[node] = parent[parent[node]]
        node = parent[node]
      }
      return node
    }
    for (let k = 0; k < edges.length; k++) {
      ptr = k
      const [distance, i, j] = edges[k]
      const p1 = find(i)
      const p2 = find(j)
      edgeState[`${i}->${j}`] = 'active'
      t.step(L('p1, p2 = find(i), find(j)'), { vars: { distance, i, j, p1, p2 }, panels: panels([i, j]), note: `Edge ${i}-${j} cost ${distance}: roots ${p1}, ${p2}` })
      if (p1 === p2) {
        edgeState[`${i}->${j}`] = 'back'
        t.step(L('continue'), { vars: { p1, p2 }, panels: panels([i, j]), note: 'Same component: would form a cycle, skip', say: say('cycle', 'Same root means adding this edge creates a cycle, so skip it.') })
        continue
      }
      parent[p1] = p2
      total += distance
      used += 1
      edgeState[`${i}->${j}`] = 'path'
      t.step(L('used += 1'), { vars: { distance, total, used }, panels: panels([i, j]), note: `Take it: total ${total}` })
      if (used === n - 1) {
        t.step(L('break'), { vars: { used }, panels: panels(), note: 'n - 1 edges: tree complete', say: say('stop', 'A spanning tree has exactly n - 1 edges, so stop early.') })
        break
      }
    }
    t.step(L('return total'), { vars: { total }, panels: panels(), note: `MST cost ${total}`, say: 'O(E log E) for the sort. Prim is better for dense graphs, Kruskal for sparse edge lists.' })
  },
}

const bipartiteCode = `from collections import deque

class Solution:
    def isBipartite(self, graph: List[List[int]]) -> bool:
        color = {}

        for start in range(len(graph)):
            if start in color:
                continue
            color[start] = 0
            queue = deque([start])

            while queue:
                node = queue.popleft()

                for nei in graph[node]:
                    if nei not in color:
                        color[nei] = 1 - color[node]
                        queue.append(nei)
                    elif color[nei] == color[node]:
                        return False

        return True`

const traceBipartite = {
  id: 'graphs-advanced:trace:bipartite',
  title: 'Is graph bipartite? (BFS 2-coloring)',
  skills: ['graph-bfs', 'graph-modeling', 'communication'],
  problem: 'Can nodes be split into two sets with every edge crossing sets? (LC 785)',
  code: bipartiteCode,
  complexity: { time: 'O(V+E)', space: 'O(V)', why: 'Each node colored and dequeued once; each edge checked twice.' },
  inputs: [
    { label: 'square', value: [[1, 3], [0, 2], [1, 3], [0, 2]] },
    { label: 'triangle', value: [[1, 2, 3], [0, 2], [0, 1, 3], [0, 2]] },
    { label: 'two parts', value: [[1], [0, 2], [1], [4], [3]] },
  ],
  run(graph, t) {
    const L = lineFinder(bipartiteCode)
    const say = once()
    const n = graph.length
    const ids = [...Array(n).keys()]
    const color = {}
    let queue = []
    const edges = []
    graph.forEach((list, u) => list.forEach(v => { if (u < v) edges.push({ from: u, to: v }) }))
    const panels = (cur = null, bad = null) => {
      const state = {}
      const values = {}
      Object.entries(color).forEach(([v, c]) => {
        state[v] = c === 0 ? 'done' : 'path'
        values[v] = c === 0 ? 'A' : 'B'
      })
      if (cur !== null) state[cur] = 'current'
      const edgeState = {}
      if (bad) edgeState[`${Math.min(...bad)}->${Math.max(...bad)}`] = 'back'
      return [
        { kind: 'graph', label: 'colors: A = green, B = pink', directed: false, nodes: circle(ids), edges, state, edgeState, values },
        { kind: 'queue', label: 'queue', items: [...queue], highlight: [] },
        { kind: 'hashmap', label: 'color', entries: Object.entries(color).map(([k, v]) => [+k, v]), highlight: cur !== null ? [cur] : [] },
      ]
    }
    t.step(L('color = {}'), { vars: { n }, panels: panels(), note: 'Uncolored = unvisited', say: say('idea', 'Bipartite means 2-colorable: every edge joins different colors. BFS and alternate colors level by level.') })
    for (let start = 0; start < n; start++) {
      if (color[start] !== undefined) {
        t.step(L('if start in color'), { vars: { start }, panels: panels(start), note: `${start} already colored, skip` })
        continue
      }
      color[start] = 0
      queue = [start]
      t.step(L('queue = deque([start])'), { vars: { start }, panels: panels(start), note: `New component: color ${start} A`, say: say('components', 'Loop over every start node: the graph can be disconnected.') })
      while (queue.length) {
        const node = queue.shift()
        t.step(L('node = queue.popleft()'), { vars: { node }, panels: panels(node), note: `Visit ${node}` })
        for (const nei of graph[node]) {
          if (color[nei] === undefined) {
            color[nei] = 1 - color[node]
            queue.push(nei)
            t.step(L('queue.append(nei)'), { vars: { node, nei, 'color[nei]': color[nei] }, panels: panels(node), note: `Color ${nei} opposite of ${node}` })
          } else if (color[nei] === color[node]) {
            t.step(L('return False'), { vars: { node, nei }, panels: panels(node, [node, nei]), note: `${node} and ${nei} share a color: odd cycle`, say: 'Same color on both ends means an odd cycle, so not bipartite. O(V+E).' })
            return
          } else {
            t.step(L('elif color[nei] == color[node]'), { vars: { node, nei }, panels: panels(node), note: `${nei} already opposite, fine` })
          }
        }
      }
    }
    t.step(L('return True'), { vars: {}, panels: panels(), note: 'Every edge crosses colors', say: 'No conflicts across all components. O(V+E) time, O(V) space.' })
  },
}

const alienCode = `class Solution:
    def foreignDictionary(self, words: List[str]) -> str:
        adj = {c: set() for w in words for c in w}

        for i in range(len(words) - 1):
            w1, w2 = words[i], words[i + 1]
            n = min(len(w1), len(w2))
            if len(w1) > len(w2) and w1[:n] == w2[:n]:
                return ""
            for j in range(n):
                if w1[j] != w2[j]:
                    adj[w1[j]].add(w2[j])
                    break

        seen, result = {}, []

        def dfs(c):
            if c in seen:
                return seen[c]
            seen[c] = True
            for nei in adj[c]:
                if dfs(nei):
                    return True
            seen[c] = False
            result.append(c)
            return False

        for c in adj:
            if dfs(c):
                return ""

        return "".join(result[::-1])`

const traceAlien = {
  id: 'graphs-advanced:trace:alien-dictionary',
  title: 'Alien dictionary (topological sort)',
  skills: ['topo-sort', 'graph-modeling', 'graph-dfs'],
  problem: 'Words sorted in an alien alphabet: recover a valid letter order, or "" (LC 269).',
  code: alienCode,
  complexity: { time: 'O(C)', space: 'O(U + E)', why: 'C = total characters scanned; U letters, E order edges (≤ U²).' },
  inputs: [
    { label: 'LC example', value: ['wrt', 'wrf', 'er', 'ett', 'rftt'] },
    { label: 'cycle', value: ['z', 'x', 'z'] },
    { label: 'bad prefix', value: ['abc', 'ab'] },
  ],
  run(words, t) {
    const L = lineFinder(alienCode)
    const say = once()
    const adj = {}
    words.forEach(w => [...w].forEach(c => { if (!adj[c]) adj[c] = new Set() }))
    const letters = Object.keys(adj)
    const seen = {}
    const result = []
    const frames = []
    let activeEdge = null
    const panels = (cur = null, hlWords = []) => {
      const state = {}
      Object.entries(seen).forEach(([c, v]) => { state[c] = v ? 'frontier' : 'done' })
      if (cur) state[cur] = 'current'
      const edges = []
      letters.forEach(c => [...adj[c]].sort().forEach(d => edges.push({ from: c, to: d })))
      return [
        { kind: 'graph', label: 'letter order edges (sky = on DFS path)', directed: true, nodes: circle(letters), edges, state, edgeState: activeEdge ? { [activeEdge]: 'active' } : {} },
        { kind: 'array', label: 'words', values: [...words], pointers: {}, highlight: hlWords },
        { kind: 'callstack', label: 'dfs stack', frames: [...frames] },
        { kind: 'stack', label: 'result (post-order)', items: [...result], highlight: [] },
      ]
    }
    t.step(L('adj = {c: set()'), { vars: { letters: letters.join('') }, panels: panels(), note: 'Every letter is a node', say: say('model', 'Letters are nodes. Each adjacent word pair gives at most one edge: first differing letter comes first.') })
    for (let i = 0; i < words.length - 1; i++) {
      const w1 = words[i]
      const w2 = words[i + 1]
      const n = Math.min(w1.length, w2.length)
      t.step(L('w1, w2 = words[i], words[i + 1]'), { vars: { w1, w2 }, panels: panels(null, [i, i + 1]), note: `Compare "${w1}" and "${w2}"` })
      if (w1.length > w2.length && w1.slice(0, n) === w2.slice(0, n)) {
        t.step(L('return ""', 1), { vars: { w1, w2 }, panels: panels(null, [i, i + 1]), note: 'Longer word before its own prefix: invalid', say: say('prefix', 'Edge case: "abc" before "ab" is impossible in any order, return empty.') })
        return
      }
      for (let j = 0; j < n; j++) {
        if (w1[j] !== w2[j]) {
          adj[w1[j]].add(w2[j])
          activeEdge = `${w1[j]}->${w2[j]}`
          t.step(L('adj[w1[j]].add(w2[j])'), { vars: { j, 'w1[j]': w1[j], 'w2[j]': w2[j] }, panels: panels(null, [i, i + 1]), note: `${w1[j]} comes before ${w2[j]}` })
          activeEdge = null
          break
        }
      }
    }
    let cyclic = false
    const dfs = c => {
      frames.push(`dfs('${c}')`)
      if (c in seen) {
        t.step(L('return seen[c]'), { vars: { c, 'seen[c]': seen[c] }, panels: panels(c), note: seen[c] ? `${c} is on the current path: cycle!` : `${c} already finished` , say: seen[c] ? say('cycle', 'True means on the current DFS path. Revisiting it means a cycle, so no valid order.') : undefined })
        frames.pop()
        return seen[c]
      }
      seen[c] = true
      t.step(L('seen[c] = True'), { vars: { c }, panels: panels(c), note: `Enter ${c}, mark on-path` })
      for (const nei of [...adj[c]].sort()) {
        activeEdge = `${c}->${nei}`
        if (dfs(nei)) {
          frames.pop()
          return true
        }
        activeEdge = null
      }
      seen[c] = false
      result.push(c)
      t.step(L('result.append(c)'), { vars: { c, result: result.join('') }, panels: panels(c), note: `${c} done: everything after it is placed`, say: say('post', 'Post-order: a letter is appended after all letters it must precede. Reverse at the end.') })
      frames.pop()
      return false
    }
    for (const c of letters) {
      t.step(L('for c in adj'), { vars: { c }, panels: panels(c), note: `Start DFS from ${c}` })
      if (dfs(c)) {
        cyclic = true
        t.step(L('return ""', L('for c in adj')), { vars: { c }, panels: panels(), note: 'Cycle: no valid order' })
        return
      }
    }
    if (!cyclic) t.step(L('return "".join(result[::-1])'), { vars: { order: [...result].reverse().join('') }, panels: panels(), note: `Order: ${[...result].reverse().join('')}`, say: 'Reverse post-order is a topological order. Linear in total characters.' })
  },
}

const traces = [traceUfComponents, traceRedundant, traceDijkstra, traceSwim, traceEffort, traceFlights, tracePrim, traceKruskal, traceBipartite, traceAlien]

const ufFindCode = `def find(node):
    while parent[node] != node:
        parent[node] = parent[parent[node]]
        node = parent[node]
    return node`

const ufUnionCode = `def union(n1, n2):
    p1, p2 = find(n1), find(n2)
    if p1 == p2:
        return False
    if rank[p1] < rank[p2]:
        p1, p2 = p2, p1
    parent[p2] = p1
    rank[p1] += rank[p2]
    return True`

const dijkstraShort = `heap = [(0, src)]
dist = {}

while heap:
    d, node = heapq.heappop(heap)
    if node in dist:
        continue
    dist[node] = d
    for nei, w in graph[node]:
        if nei not in dist:
            heapq.heappush(heap, (d + w, nei))`

const zeroOneCode = `dist = [math.inf] * n
dist[src] = 0
queue = deque([src])

while queue:
    node = queue.popleft()
    for nei, w in graph[node]:
        if dist[node] + w < dist[nei]:
            dist[nei] = dist[node] + w
            if w == 0:
                queue.appendleft(nei)
            else:
                queue.append(nei)`

const lessons = [
  {
    id: 'graphs-advanced:lesson:union-find',
    title: 'Union-Find in 5 slides',
    skills: ['union-find'],
    slides: [
      {
        title: 'Sets as trees',
        points: ['Each set is a tree', 'The root names the set', 'parent[i] points upward'],
        panels: [
          { kind: 'graph', label: 'two sets, roots green', directed: true, nodes: circle([0, 1, 2, 3, 4, 5]), edges: [{ from: 1, to: 0 }, { from: 2, to: 0 }, { from: 4, to: 3 }, { from: 5, to: 4 }], state: { 0: 'done', 3: 'done' }, edgeState: {} },
          { kind: 'array', label: 'parent', values: [0, 0, 0, 3, 3, 4], pointers: {}, highlight: [0, 3] },
        ],
      },
      {
        title: 'find + path compression',
        points: ['Climb to the root', 'Re-point nodes to grandparent on the way', 'Trees flatten over time'],
        code: ufFindCode,
        highlight: 3,
      },
      {
        title: 'union by rank',
        points: ['Join two roots', 'Short tree goes under tall tree', 'Same root → already connected'],
        code: ufUnionCode,
        highlight: 7,
      },
      {
        title: 'Cost',
        points: ['Both tricks together: O(α(n)) per op', 'α(n) ≤ 4 for any real n', 'Say "effectively constant"'],
        panels: [{ kind: 'complexity', n: 100000, ops: 400000 }],
        ask: { q: 'Path compression alone, no rank. Amortized cost per op?', choices: ['O(1)', 'O(log n)', 'O(n)', 'O(α(n))'], answer: 1, why: 'Compression alone is amortized O(log n). Need both for α(n).' },
      },
      {
        title: 'When UF beats DFS',
        points: ['Edges arrive one at a time', 'Repeated "are a and b connected?"', 'Cycle on add, merge groups, Kruskal'],
        panels: [{ kind: 'table', label: 'pick', rows: [['static graph, one query', 'DFS/BFS'], ['edges stream in', 'Union-Find'], ['need actual path', 'BFS'], ['merge accounts by email', 'Union-Find']], colLabels: ['situation', 'tool'], highlight: ['1,1', '3,1'], deps: [] }],
        ask: { q: 'Edges added online, 10^5 connectivity queries in between. Best tool?', choices: ['BFS per query', 'Union-Find', 'Dijkstra', 'Topological sort'], answer: 1, why: 'DFS per query is O(V+E) each. UF answers each in ~O(1).' },
      },
    ],
  },
  {
    id: 'graphs-advanced:lesson:dijkstra',
    title: 'Dijkstra with heapq',
    skills: ['dijkstra', 'heap'],
    slides: [
      {
        title: 'When',
        points: ['Weighted edges', 'All weights ≥ 0', 'Shortest from one source'],
        panels: [{ kind: 'graph', label: 'pick the closest unfinished node', directed: true, nodes: circle(['A', 'B', 'C', 'D']), edges: [{ from: 'A', to: 'B', w: 4 }, { from: 'A', to: 'C', w: 1 }, { from: 'C', to: 'B', w: 2 }, { from: 'B', to: 'D', w: 1 }], state: { A: 'done', C: 'current', B: 'frontier' }, edgeState: { 'A->C': 'tree' }, values: { A: '0', C: '1', B: '≤4' } }],
      },
      {
        title: 'Lazy deletion',
        points: ['Push duplicates, no decrease-key', 'Skip popped nodes already final', 'First pop = final distance'],
        code: dijkstraShort,
        highlight: 7,
      },
      {
        title: 'Cost',
        points: ['O((V+E) log V)', 'Heap holds up to E entries', 'log E ≈ log V since E ≤ V²'],
        ask: { q: 'V = 10^5, E = 2·10^5, weights ≥ 0. Fits?', choices: ['Yes, ~5·10^6 ops', 'No, O(V²)', 'Only with Bellman-Ford', 'Only if unweighted'], answer: 0, why: '(V+E) log V ≈ 3·10^5 × 17 ≈ 5·10^6.' },
      },
      {
        title: 'Negative weights break it',
        points: ['A popped node is assumed final', 'A later negative edge could make it cheaper', 'Use Bellman-Ford instead'],
        panels: [{ kind: 'graph', label: 'B popped at 2, but A→C→B = 5 - 4 = 1', directed: true, nodes: circle(['A', 'B', 'C']), edges: [{ from: 'A', to: 'B', w: 2 }, { from: 'A', to: 'C', w: 5 }, { from: 'C', to: 'B', w: -4 }], state: { A: 'done', B: 'done', C: 'current' }, edgeState: { 'C->B': 'back' }, values: { A: '0', B: '2 ✗', C: '5' } }],
        ask: { q: 'Why does Dijkstra fail with a negative edge?', choices: ['Heap breaks', 'A finalized node can later get cheaper', 'It loops forever', 'It visits nodes twice'], answer: 1, why: 'Greedy finalization assumes extending a path never decreases cost.' },
      },
    ],
  },
  {
    id: 'graphs-advanced:lesson:shortest-path-variants',
    title: 'Bellman-Ford, k stops, 0-1 BFS',
    skills: ['dijkstra', 'graph-bfs', 'graph-modeling'],
    slides: [
      {
        title: 'Bellman-Ford',
        points: ['Relax every edge, V - 1 rounds', 'Round i = best using ≤ i edges', 'O(V·E), handles negatives'],
        panels: [{ kind: 'table', label: 'price by round', rows: [['0', '∞', '∞', '∞'], ['0', '100', '∞', '∞'], ['0', '100', '200', '700']], rowLabels: ['0', '1', '2'], colLabels: ['0', '1', '2', '3'], highlight: ['2,3'], deps: ['1,1'] }],
      },
      {
        title: 'k stops',
        points: ['k stops = k + 1 edges', 'Run exactly k + 1 rounds', 'Copy prices each round'],
        ask: { q: 'Why copy prices into temp each round?', choices: ['Speed', 'So a round extends paths by only one edge', 'To avoid negative cycles', 'Python lists are immutable'], answer: 1, why: 'In-place updates chain multiple edges in one round, breaking the stop limit.' },
      },
      {
        title: 'Negative cycle check',
        points: ['After V - 1 rounds, relax once more', 'Anything still improves → negative cycle'],
      },
      {
        title: '0-1 BFS',
        points: ['Weights only 0 or 1', 'Deque: 0-edge → front, 1-edge → back', 'O(V+E), no heap'],
        code: zeroOneCode,
        highlight: 11,
      },
      {
        title: 'Pick the tool',
        panels: [{ kind: 'table', label: 'shortest path cheat sheet', rows: [['unweighted', 'BFS', 'O(V+E)'], ['0/1 weights', '0-1 BFS', 'O(V+E)'], ['weights ≥ 0', 'Dijkstra', 'O(E log V)'], ['negatives / ≤ k edges', 'Bellman-Ford', 'O(V·E)'], ['all pairs, V ≤ 400', 'Floyd-Warshall', 'O(V³)']], colLabels: ['graph', 'tool', 'time'], highlight: [], deps: [] }],
      },
    ],
  },
  {
    id: 'graphs-advanced:lesson:mst',
    title: "MST: Prim's vs Kruskal's",
    skills: ['mst', 'union-find', 'greedy'],
    slides: [
      {
        title: 'Minimum spanning tree',
        points: ['Connect all V nodes', 'Exactly V - 1 edges', 'Min total weight, no cycles'],
        panels: [{ kind: 'graph', label: 'pink = MST', directed: false, nodes: circle(['A', 'B', 'C', 'D']), edges: [{ from: 'A', to: 'B', w: 1 }, { from: 'B', to: 'C', w: 2 }, { from: 'A', to: 'C', w: 4 }, { from: 'C', to: 'D', w: 3 }, { from: 'B', to: 'D', w: 5 }], state: {}, edgeState: { 'A->B': 'path', 'B->C': 'path', 'C->D': 'path' } }],
      },
      {
        title: "Prim's",
        points: ['Grow one tree from any node', 'Heap of edges leaving the tree', 'Like Dijkstra, key = edge weight'],
        ask: { q: 'Prim vs Dijkstra: what goes in the heap key?', choices: ['Both use path length', 'Prim: edge weight. Dijkstra: path length', 'Prim: path length', 'Both use edge weight'], answer: 1, why: 'Prim cares about the cheapest single edge into the tree.' },
      },
      {
        title: "Kruskal's",
        points: ['Sort all edges', 'Take an edge if UF says different sets', 'Stop at V - 1 edges'],
      },
      {
        title: 'Which one',
        panels: [{ kind: 'table', label: 'choose', rows: [['dense / points (E ≈ V²)', "Prim, O(V² log V) or O(V²)"], ['sparse edge list', 'Kruskal, O(E log E)'], ['already sorted edges', 'Kruskal']], colLabels: ['input', 'pick'], highlight: [], deps: [] }],
        ask: { q: 'Why is greedy correct for MST?', choices: ['Cut property', 'Optimal substructure only', 'Edges are sorted', 'Graph is a DAG'], answer: 0, why: 'The lightest edge crossing any cut is in some MST.' },
      },
    ],
  },
  {
    id: 'graphs-advanced:lesson:minimax-paths',
    title: 'Bottleneck paths: Dijkstra or binary search + BFS',
    skills: ['dijkstra', 'graph-bfs', 'binary-search'],
    slides: [
      {
        title: 'Bottleneck cost',
        points: ['Path cost = max cell or max jump', 'Not a sum', 'Swim, min effort, safest path'],
        panels: [{ kind: 'grid', label: 'cost = highest cell on path', cells: [[0, 2, 4], [3, 8, 1], [5, 6, 2]], state: { '0,0': 'path', '0,1': 'path', '0,2': 'path', '1,2': 'path', '2,2': 'path' }, values: {} }],
      },
      {
        title: 'Option A: Dijkstra',
        points: ['Key = max so far', 'Max never decreases, so greedy holds', 'O(rc log rc)'],
      },
      {
        title: 'Option B: binary search the answer',
        points: ['Guess t, BFS using cells ≤ t', 'Reachable is monotone in t', 'O(rc log maxVal)'],
        ask: { q: 'Last day to cross: what makes binary search valid?', choices: ['Grid is sorted', 'If crossable on day d, crossable on every earlier day', 'BFS is O(1)', 'Days are unique'], answer: 1, why: 'Monotone predicate: water only adds over time.' },
      },
      {
        title: 'Option C: Union-Find sweep',
        points: ['Add cells in order of height', 'Stop when start and end share a root', 'Reverse time for last day'],
      },
    ],
  },
  {
    id: 'graphs-advanced:lesson:modeling',
    title: 'Model it as a graph',
    skills: ['graph-modeling', 'graph-bfs', 'topo-sort'],
    slides: [
      {
        title: 'Nodes are states',
        points: ['Node = everything you need to know', 'Edge = one legal move', 'Then BFS / Dijkstra'],
        panels: [{ kind: 'table', label: 'state examples', rows: [['open lock', '4-digit string'], ['word ladder', 'word'], ['grid + k removals', '(r, c, k)'], ['visit all nodes', '(node, mask)']], colLabels: ['problem', 'node'], highlight: [], deps: [] }],
      },
      {
        title: 'Bitmask BFS',
        points: ['State (node, visited mask)', '2^n · n states', 'Only when n ≤ 12-20'],
      },
      {
        title: 'Bipartite = 2-coloring',
        points: ['BFS, alternate colors', 'Same color edge → odd cycle', 'Loop all starts: may be disconnected'],
        panels: [{ kind: 'graph', label: 'square: bipartite', directed: false, nodes: circle([0, 1, 2, 3]), edges: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 0, to: 3 }], state: { 0: 'done', 2: 'done', 1: 'path', 3: 'path' }, edgeState: {}, values: { 0: 'A', 1: 'B', 2: 'A', 3: 'B' } }],
      },
      {
        title: 'Order constraints → topo sort',
        points: ['"a before b" = edge a → b', 'Cycle → impossible', 'Alien dictionary, course schedule'],
        ask: { q: 'Alien dictionary: how many edges per adjacent word pair?', choices: ['0 or 1', 'One per letter', 'len(w1) · len(w2)', 'Always 1'], answer: 0, why: 'Only the first differing letter tells you anything.' },
      },
    ],
  },
]

const card = (n, skills, front, back, code) => ({ id: `graphs-advanced:card:${n}`, skills, front, back, ...(code ? { code } : {}) })

const flashcards = [
  card(1, ['union-find'], 'What does find(x) return?', 'The root (representative) of x\'s set. Two nodes are connected iff their roots match.'),
  card(2, ['union-find'], 'Path compression in one line?', 'parent[node] = parent[parent[node]] while climbing (halving), or point every node straight at the root.', 'parent[node] = parent[parent[node]]'),
  card(3, ['union-find'], 'Union by rank: which root goes on top?', 'The taller (or bigger) tree\'s root. Shorter tree hangs under it, keeping height O(log n).'),
  card(4, ['union-find', 'complexity'], 'Cost per UF op with both tricks?', 'Amortized O(α(n)), inverse Ackermann, ≤ 4 in practice. Say "effectively constant".'),
  card(5, ['union-find'], 'Count components with UF?', 'Start count = n. Each union that merges two different roots does count -= 1.'),
  card(6, ['union-find', 'ds-diagnosis'], 'When pick UF over DFS?', 'Edges arrive incrementally, many connectivity queries, cycle detection on add, Kruskal, merging groups.'),
  card(7, ['union-find'], 'Redundant connection signal?', 'Union returns False (same root) → this edge closes a cycle. Return the first such edge.'),
  card(8, ['union-find', 'graph-modeling'], 'Accounts merge: what are the UF nodes?', 'Emails (or account indices). Union every email in an account with its first email, then group by root.'),
  card(9, ['union-find'], 'Init for UF on n nodes?', 'parent = [i for i in range(n)], rank = [1] * n.', 'parent = [i for i in range(n)]\nrank = [1] * n'),
  card(10, ['union-find'], 'Can UF handle edge deletions?', 'Not directly. Trick: process deletions offline in reverse as additions.'),
  card(11, ['dijkstra'], 'Dijkstra requirements?', 'Weighted graph, all weights non-negative, single source.'),
  card(12, ['dijkstra', 'heap'], 'What sits in Dijkstra\'s heap?', '(distance so far, node). Pop smallest distance first.'),
  card(13, ['dijkstra'], 'Lazy deletion?', 'Push duplicates instead of decrease-key; when popped, skip if node already finalized.', 'if node in seen:\n    continue'),
  card(14, ['dijkstra', 'complexity'], 'Dijkstra time with binary heap?', 'O((V+E) log V). Space O(V+E).'),
  card(15, ['dijkstra'], 'Why do negative edges break Dijkstra?', 'A popped node is treated as final, but a later negative edge could reach it cheaper.'),
  card(16, ['dijkstra'], 'When is a node\'s distance final in Dijkstra?', 'The first time it is popped from the heap.'),
  card(17, ['dijkstra'], 'Network delay answer?', 'Max of all shortest distances, or -1 if any node unreached.'),
  card(18, ['dijkstra'], 'Bellman-Ford idea?', 'Relax every edge V - 1 times. After round i, distances use ≤ i edges. O(V·E).'),
  card(19, ['dijkstra'], 'Detect a negative cycle?', 'Run one extra Bellman-Ford round. If any distance still improves, a negative cycle exists.'),
  card(20, ['dijkstra', 'graph-modeling'], 'Cheapest flights with k stops: rounds?', 'k + 1 rounds of Bellman-Ford, copying prices each round.'),
  card(21, ['dijkstra'], 'Why temp = prices[:] in k-stops?', 'So each round only extends last round\'s paths by one edge. In-place updates could chain flights.'),
  card(22, ['graph-bfs', 'dijkstra'], '0-1 BFS?', 'Weights 0/1 only: deque, 0-edge appendleft, 1-edge append. O(V+E).'),
  card(23, ['graph-bfs'], 'Unweighted shortest path tool?', 'Plain BFS. O(V+E). Dijkstra works but adds a needless log.'),
  card(24, ['dijkstra'], 'All-pairs shortest path, V ≤ 400?', 'Floyd-Warshall O(V³): for k, for i, for j: d[i][j] = min(d[i][j], d[i][k] + d[k][j]).'),
  card(25, ['dijkstra', 'grid'], 'Swim in rising water key?', 'max(level so far, grid[nr][nc]). Pop lowest; first time at corner is the answer.'),
  card(26, ['dijkstra', 'grid'], 'Min effort path key?', 'max(effort so far, |height diff|). Dijkstra with an effort matrix.'),
  card(27, ['dijkstra'], 'Why does Dijkstra work for max-of-path costs?', 'Max is monotone: extending a path never lowers its cost, same as non-negative sums.'),
  card(28, ['binary-search', 'graph-bfs'], 'Binary search + BFS pattern?', 'Guess answer t, BFS checks feasibility. Valid if feasible(t) is monotone. O(log range · (V+E)).'),
  card(29, ['binary-search', 'graph-bfs'], 'Last day where you can still cross?', 'Binary search on day; BFS top to bottom on land. Or reverse-time Union-Find.'),
  card(30, ['graph-bfs', 'grid'], 'Safest path in a grid (LC 2812)?', 'Multi-source BFS from thieves for distance, then max-min path via heap or binary search.'),
  card(31, ['mst'], 'MST definition?', 'Subset of V - 1 edges connecting all nodes, no cycle, min total weight.'),
  card(32, ['mst'], "Prim's in one line?", 'Grow a tree; heap of edges leaving it; take cheapest edge to a new node.'),
  card(33, ['mst', 'union-find'], "Kruskal's in one line?", 'Sort edges; add each if UF says its ends are in different sets; stop at V - 1.'),
  card(34, ['mst', 'complexity'], 'Prim vs Kruskal time?', 'Prim O(E log V). Kruskal O(E log E). Dense points: Prim; sparse lists: Kruskal.'),
  card(35, ['mst', 'greedy'], 'Cut property?', 'For any cut, the lightest crossing edge belongs to some MST. Why greedy works.'),
  card(36, ['mst'], 'Prim key vs Dijkstra key?', 'Prim: single edge weight. Dijkstra: total path length from source.'),
  card(37, ['graph-bfs', 'graph-modeling'], 'Bipartite check?', 'BFS 2-coloring. Neighbor same color → not bipartite. Loop all starts.'),
  card(38, ['graph-modeling'], 'Bipartite ⇔ ?', 'No odd-length cycle.'),
  card(39, ['graph-modeling'], 'Possible bipartition (LC 886) signal?', '"Dislike" pairs must be split into two groups: 2-coloring.'),
  card(40, ['graph-modeling', 'graph-bfs'], 'Modeling states as nodes?', 'Node = full state (position, keys, steps left…). Edge = one move. BFS for min moves.'),
  card(41, ['graph-modeling', 'bit'], 'Bitmask BFS when?', 'Visit all nodes / collect all keys with n ≤ 12-20. State (node, mask): 2^n · n.'),
  card(42, ['topo-sort', 'graph-modeling'], 'Alien dictionary edges?', 'For each adjacent pair, first differing letter: w1[j] → w2[j]. Then topo sort.'),
  card(43, ['topo-sort'], 'Alien dictionary invalid cases?', 'Cycle in letter graph, or a word before its own prefix ("abc" before "ab").'),
  card(44, ['topo-sort', 'graph-dfs'], 'DFS topo sort output?', 'Append node after its neighbors (post-order), then reverse.'),
  card(45, ['graph-modeling', 'ds-diagnosis'], 'Weighted shortest path, which tool by weights?', 'none → BFS; 0/1 → 0-1 BFS; ≥ 0 → Dijkstra; negative or ≤ k edges → Bellman-Ford.'),
]

const mcq = (n, skills, difficulty, q, choices, answer, why, code) => ({ id: `graphs-advanced:mcq:${n}`, skills, difficulty, q, choices, answer, why, ...(code ? { code } : {}) })

const mcqs = [
  mcq(1, ['union-find', 'complexity'], 1, 'Union-Find with path compression and union by rank: amortized cost per find?', ['O(1) exactly', 'O(α(n))', 'O(log n)', 'O(n)'], 1, 'Inverse Ackermann, effectively constant but technically α(n).'),
  mcq(2, ['union-find'], 2, 'Union by rank only, no path compression. Worst find?', ['O(1)', 'O(α(n))', 'O(log n)', 'O(n)'], 2, 'Rank keeps tree height ≤ log n.'),
  mcq(3, ['union-find'], 2, 'No rank, no compression. Unions 0-1, 1-2, …, (n-2)-(n-1) always hanging left root under right. Then find(0)?', ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], 2, 'Builds a chain of length n.'),
  mcq(4, ['union-find', 'ds-diagnosis'], 2, 'Edges arrive in a stream; after each, answer "how many components?". Best?', ['Re-run DFS each time', 'Union-Find with a counter', 'Dijkstra', 'Topological sort'], 1, 'Each union is ~O(1) and decrements the count.'),
  mcq(5, ['union-find'], 2, 'In redundant connection, union(a, b) returns False. Meaning?', ['a or b is new', 'a and b already connected, edge makes a cycle', 'Graph is disconnected', 'Rank overflow'], 1, 'Same root before adding the edge = cycle.'),
  mcq(6, ['union-find'], 1, 'What does this line do?', ['Sets node as root', 'Path halving: skip to grandparent', 'Union by rank', 'Detects cycle'], 1, 'Each node on the path points two levels up, flattening the tree.', 'parent[node] = parent[parent[node]]'),
  mcq(7, ['union-find', 'graph-modeling'], 2, 'Accounts merge (LC 721). What do you union?', ['Names', 'Each email with the first email in its account', 'Accounts with the same name', 'All emails globally'], 1, 'Same name can be different people; emails link accounts.'),
  mcq(8, ['union-find'], 2, 'Number of provinces with n=200 adjacency matrix. UF time?', ['O(n)', 'O(n² α(n))', 'O(n³)', 'O(2^n)'], 1, 'Scan n² cells, union each 1.'),
  mcq(9, ['union-find'], 3, 'Graph valid tree (n nodes, edge list). Fastest correct check?', ['len(edges) == n - 1 only', 'No union fails and len(edges) == n - 1', 'DFS from 0 only', 'Every node has degree ≤ 2'], 1, 'n - 1 edges plus no cycle implies connected.'),
  mcq(10, ['union-find'], 3, 'Why can\'t standard UF support "remove edge"?', ['Rank breaks', 'Compression discards structure; a split needs to know which nodes depended on that edge', 'It can in O(1)', 'Roots change'], 1, 'Process removals offline in reverse as unions.'),
  mcq(11, ['union-find', 'graph-dfs'], 2, 'Static graph, one question: count components. UF vs DFS?', ['UF strictly better', 'Both O(V+E)-ish; either is fine', 'DFS can\'t count components', 'UF needs sorting'], 1, 'For one static query both are linear; pick what you code cleanest.'),
  mcq(12, ['dijkstra'], 1, 'Dijkstra needs which condition?', ['Unweighted edges', 'Non-negative weights', 'DAG', 'Undirected graph'], 1, 'Negative edges break greedy finalization.'),
  mcq(13, ['dijkstra', 'complexity'], 1, 'Dijkstra with heapq and lazy deletion. Time?', ['O(V+E)', 'O((V+E) log V)', 'O(V·E)', 'O(V²·E)'], 1, 'Up to E pushes and pops, each log.'),
  mcq(14, ['dijkstra'], 2, 'Popped (7, node) but node in seen. Why can this happen?', ['Bug', 'Node was pushed again earlier with a bigger distance; a smaller one already finalized it', 'Heap is unsorted', 'Negative edge'], 1, 'Lazy deletion leaves stale entries.'),
  mcq(15, ['dijkstra'], 2, 'Remove the "if node in seen: continue" check. Result?', ['Wrong answers', 'Same answers but possibly more work', 'Infinite loop always', 'Crash'], 1, 'Stale pops redo neighbors; correctness kept if you only push improvements, but cost grows.'),
  mcq(16, ['dijkstra'], 2, 'Graph has one negative edge, no negative cycle. Single-source shortest path?', ['Dijkstra', 'BFS', 'Bellman-Ford', 'Prim'], 2, 'Bellman-Ford handles negative weights.'),
  mcq(17, ['dijkstra'], 2, 'Network delay: all reachable, dist = {1:0, 2:3, 3:1, 4:4}. Answer?', ['0', '3', '4', '8'], 2, 'Time for all nodes = max distance.'),
  mcq(18, ['dijkstra', 'heap'], 2, 'Heap entries are (dist, node). Why dist first?', ['Python requires it', 'Tuples compare by first element, so the heap orders by distance', 'Saves memory', 'Avoids duplicates'], 1, 'heapq compares tuples lexicographically.'),
  mcq(19, ['dijkstra'], 3, 'Dijkstra stops early when target is popped. Correct?', ['No, must finish', 'Yes, its distance is final at first pop', 'Only for undirected graphs', 'Only if unweighted'], 1, 'First pop is final with non-negative weights.'),
  mcq(20, ['dijkstra', 'constraints'], 2, 'V = 10^4 nodes, dense E ≈ 10^8 edges. Best Dijkstra variant?', ['Heap, O(E log V)', 'Array scan O(V²)', 'Bellman-Ford', 'BFS'], 1, 'V² = 10^8 beats E log V ≈ 1.3·10^9.'),
  mcq(21, ['dijkstra', 'graph-modeling'], 2, 'Cheapest flights within k stops. Why not plain Dijkstra on cost?', ['Negative prices', 'Cheapest path may use too many stops and block a valid pricier one', 'Too slow', 'Directed graph'], 1, 'State must include stops used.'),
  mcq(22, ['dijkstra'], 2, 'k stops means how many Bellman-Ford rounds?', ['k', 'k + 1', 'k - 1', 'n - 1'], 1, 'k stops = k + 1 flights.'),
  mcq(23, ['dijkstra'], 3, 'In k-stops Bellman-Ford you update prices in place instead of temp. Bug?', ['None', 'A round can chain several flights, exceeding k stops', 'Prices go negative', 'Infinite loop'], 1, 'Copying limits each round to one more edge.'),
  mcq(24, ['dijkstra', 'complexity'], 1, 'Bellman-Ford time?', ['O(V+E)', 'O(E log V)', 'O(V·E)', 'O(V³)'], 2, 'V - 1 rounds over all E edges.'),
  mcq(25, ['graph-bfs', 'dijkstra'], 2, 'Edge weights are only 0 or 1. Best?', ['Dijkstra', '0-1 BFS with deque', 'Bellman-Ford', 'Floyd-Warshall'], 1, 'O(V+E): 0-edges to front, 1-edges to back.'),
  mcq(26, ['graph-bfs'], 2, 'In 0-1 BFS, a 0-weight neighbor improves. What next?', ['append', 'appendleft', 'heappush', 'skip'], 1, 'Same distance as current, so it goes in front.'),
  mcq(27, ['dijkstra', 'grid'], 2, 'Swim in rising water: pushed cost for neighbor?', ['height + grid[nr][nc]', 'max(height, grid[nr][nc])', 'grid[nr][nc]', 'min(height, grid[nr][nc])'], 1, 'Cost of a path is its highest cell.'),
  mcq(28, ['dijkstra', 'grid'], 2, 'Min effort path: relax value?', ['curr + diff', 'max(curr, abs(diff))', 'abs(diff)', 'min(curr, diff)'], 1, 'Effort is the max single jump.'),
  mcq(29, ['binary-search', 'graph-bfs'], 2, 'Swim in rising water via binary search. What do you search?', ['Row index', 'Time t; check BFS reaches corner through cells ≤ t', 'Number of moves', 'Heap size'], 1, 'Feasibility is monotone in t.'),
  mcq(30, ['binary-search', 'graph-bfs', 'complexity'], 2, 'Binary search on t in [0, n²) with BFS check on n×n grid. Time?', ['O(n²)', 'O(n² log n)', 'O(n⁴)', 'O(n log n)'], 1, 'log(n²) checks × O(n²) BFS.'),
  mcq(31, ['binary-search', 'graph-bfs'], 3, 'Last day where you can still cross. Monotone because…', ['Days are sorted', 'Flooding only adds water, so crossable on d means crossable on all d\' < d', 'BFS is greedy', 'Cells are unique'], 1, 'That makes feasibility a prefix of days.'),
  mcq(32, ['mst'], 1, 'An MST on V nodes has how many edges?', ['V', 'V - 1', 'E', 'V + 1'], 1, 'Spanning tree.'),
  mcq(33, ['mst', 'union-find'], 2, "Kruskal: next cheapest edge has both ends with same root. Do what?", ['Take it', 'Skip it: would form a cycle', 'Restart', 'Swap roots'], 1, 'Same component already.'),
  mcq(34, ['mst', 'complexity'], 2, 'Min cost to connect 1000 points, all pairs allowed. Better choice?', ['Kruskal over all pairs', "Prim's (dense graph)", 'Bellman-Ford', 'BFS'], 1, 'E ≈ n²/2; Prim avoids sorting all edges, O(n²) with array.'),
  mcq(35, ['mst', 'greedy'], 3, 'Why is taking the cheapest crossing edge safe?', ['Edges are unique', 'Cut property: some MST contains it', 'Graph is a tree', 'Heap guarantees it'], 1, 'Swap argument: replacing a heavier crossing edge never hurts.'),
  mcq(36, ['mst', 'dijkstra'], 2, 'Prim and Dijkstra both use a heap. The key difference?', ['Prim uses BFS', 'Prim keys by edge weight, Dijkstra by path length', 'Dijkstra needs UF', 'No difference'], 1, 'Prim: cheapest single edge into the tree.'),
  mcq(37, ['mst'], 2, 'Does an MST give shortest paths between nodes?', ['Yes, always', 'No, it minimizes total weight, not pairwise distance', 'Only for undirected', 'Only with unique weights'], 1, 'Classic confusion: MST ≠ shortest path tree.'),
  mcq(38, ['graph-bfs', 'graph-modeling'], 1, 'Graph is bipartite iff…', ['No cycles', 'No odd-length cycle', 'Connected', 'Even number of nodes'], 1, 'Odd cycle forces two adjacent same colors.'),
  mcq(39, ['graph-bfs'], 2, 'Bipartite BFS starting only from node 0. Bug?', ['None', 'Misses other components', 'Wrong colors', 'Infinite loop'], 1, 'Graph may be disconnected; loop all starts.'),
  mcq(40, ['graph-bfs', 'graph-modeling'], 2, 'BFS sees neighbor already colored the same as current. Return?', ['True', 'False', 'Recolor it', 'Skip'], 1, 'Same-colored edge means not 2-colorable.'),
  mcq(41, ['topo-sort', 'graph-modeling'], 2, 'Alien dictionary: "wrt" then "wrf". Edge?', ['w → r', 't → f', 'f → t', 'none'], 1, 'First differing position: t before f.'),
  mcq(42, ['topo-sort'], 2, 'Alien dictionary words ["abc", "ab"]. Answer?', ['"abc"', '"cba"', '"" (invalid)', '"ab"'], 2, 'Longer word before its own prefix is impossible.'),
  mcq(43, ['topo-sort', 'graph-dfs'], 3, 'DFS topo: seen[c] = True while on path, False when done. Meeting a True node means?', ['Already output', 'Cycle', 'Disconnected', 'Leaf'], 1, 'Back edge to the current path.'),
  mcq(44, ['graph-modeling', 'graph-bfs'], 2, 'Shortest path in grid where you may remove up to k walls. BFS state?', ['(r, c)', '(r, c, walls removed)', '(r, c, distance)', 'r * cols + c'], 1, 'Same cell with different k left is a different state.'),
  mcq(45, ['graph-modeling', 'bit', 'constraints'], 3, 'Shortest path visiting all nodes, n ≤ 12. State space?', ['O(n)', 'O(n²)', 'O(n · 2^n)', 'O(n!)'], 2, '(node, visited mask) BFS.'),
  mcq(46, ['graph-modeling', 'graph-bfs'], 2, 'Open the lock (4 wheels, deadends). Model?', ['Tree DFS', 'BFS over 10^4 strings, 8 neighbors each', 'Dijkstra', 'Union-Find'], 1, 'Unweighted min moves → BFS.'),
  mcq(47, ['graph-modeling', 'ds-diagnosis'], 2, 'Weighted graph, non-negative, need ONE shortest path. Which DS drives it?', ['Stack', 'Queue', 'Min-heap', 'Union-Find'], 2, 'Dijkstra = min-heap.'),
  mcq(48, ['dijkstra', 'graph-modeling'], 3, 'Path with max probability (LC 1514). How to adapt Dijkstra?', ['Min-heap of probability', 'Max-heap (push -prob), multiply probabilities', 'Sum logs then BFS', 'Bellman-Ford only'], 1, 'Products of values ≤ 1 never increase: monotone, greedy works.'),
  mcq(49, ['graph-bfs', 'constraints'], 1, 'Unweighted graph, V, E ≤ 10^5, single-source shortest path. Best?', ['Dijkstra', 'BFS', 'Floyd-Warshall', 'Bellman-Ford'], 1, 'O(V+E), no log needed.'),
  mcq(50, ['dijkstra', 'constraints'], 2, 'All-pairs shortest paths, V = 100, weights may be negative (no neg cycle). Pick?', ['Dijkstra from each node', 'Floyd-Warshall O(V³)', 'BFS', 'Prim'], 1, '10^6 ops, handles negatives.'),
]

const cloze = (n, skills, title, code, hint) => ({ id: `graphs-advanced:cloze:${n}`, skills, title, code, ...(hint ? { hint } : {}) })

const clozes = [
  cloze(1, ['union-find'], 'find with full path compression (recursive)', `def find(node):
    if parent[node] != [[node]]:
        parent[node] = [[find(parent[node])]]
    return parent[node]`, 'Point straight at the root on the way back'),
  cloze(2, ['union-find'], 'union by rank', `def union(n1, n2):
    p1, p2 = find(n1), find(n2)
    if p1 == p2:
        return [[False]]
    if rank[p1] < rank[p2]:
        p1, p2 = [[p2, p1]]
    parent[p2] = [[p1]]
    rank[p1] += rank[p2]
    return True`),
  cloze(3, ['dijkstra', 'heap'], 'Dijkstra core loop', `while heap:
    length, node = heapq.[[heappop]](heap)
    if node in seen:
        [[continue]]
    seen.add(node)
    for nei, w in graph[node]:
        if nei not in seen:
            heapq.heappush(heap, ([[length + w|w + length]], nei))`),
  cloze(4, ['dijkstra'], 'Network delay return', `return t if [[len(seen)]] == n else [[-1]]`),
  cloze(5, ['dijkstra'], 'k stops Bellman-Ford round', `for i in range([[k + 1]]):
    temp = [[prices[:]|prices.copy()|list(prices)]]
    for u, v, w in flights:
        if prices[u] == math.inf:
            continue
        if prices[u] + w < temp[v]:
            temp[v] = [[prices[u] + w]]
    prices = temp`, 'k stops = k + 1 flights'),
  cloze(6, ['graph-bfs', 'dijkstra'], '0-1 BFS push', `if dist[node] + w < dist[nei]:
    dist[nei] = dist[node] + w
    if w == 0:
        queue.[[appendleft]](nei)
    else:
        queue.[[append]](nei)`),
  cloze(7, ['dijkstra', 'grid'], 'Swim in rising water push', `if 0 <= nr < n and 0 <= nc < n and (nr, nc) [[not in]] seen:
    seen.add((nr, nc))
    heapq.[[heappush]](heap, ([[max(height, grid[nr][nc])|max(grid[nr][nc], height)]], nr, nc))`),
  cloze(8, ['mst', 'union-find'], 'Kruskal loop', `edges.[[sort]]()
for distance, i, j in edges:
    p1, p2 = find(i), find(j)
    if [[p1 == p2]]:
        continue
    parent[p1] = p2
    total += distance
    used += 1
    if used == [[n - 1]]:
        break`),
  cloze(9, ['graph-bfs', 'graph-modeling'], 'Bipartite coloring', `for nei in graph[node]:
    if nei not in color:
        color[nei] = [[1 - color[node]|color[node] ^ 1]]
        queue.[[append]](nei)
    [[elif]] color[nei] == color[node]:
        return [[False]]`),
  cloze(10, ['mst', 'heap'], "Prim's pop", `while len(seen) < [[n]]:
    cost, i = heapq.heappop(heap)
    if i [[in]] seen:
        continue
    seen.add(i)
    total += [[cost]]`),
]

const parsonsItem = (n, skills, title, lines, distractors) => ({ id: `graphs-advanced:parsons:${n}`, skills, title, lines, ...(distractors ? { distractors } : {}) })

const parsons = [
  parsonsItem(1, ['union-find'], 'find with path compression', [
    'def find(node):',
    '    while parent[node] != node:',
    '        parent[node] = parent[parent[node]]',
    '        node = parent[node]',
    '    return node',
  ], ['        parent[parent[node]] = node']),
  parsonsItem(2, ['union-find'], 'Count components with UF', [
    'parent = [i for i in range(n)]',
    'result = n',
    'for a, b in edges:',
    '    p1, p2 = find(a), find(b)',
    '    if p1 != p2:',
    '        parent[p1] = p2',
    '        result -= 1',
    'return result',
  ], ['        result += 1']),
  parsonsItem(3, ['dijkstra', 'heap'], 'Dijkstra (network delay)', [
    'seen = set()',
    'heap = [(0, k)]',
    't = 0',
    'while heap:',
    '    length, node = heapq.heappop(heap)',
    '    if node in seen:',
    '        continue',
    '    seen.add(node)',
    '    t = max(t, length)',
    '    for nei, w in graph[node]:',
    '        heapq.heappush(heap, (length + w, nei))',
    'return t if len(seen) == n else -1',
  ], ['    heapq.heappush(heap, (w, nei))']),
  parsonsItem(4, ['dijkstra'], 'Bellman-Ford with k stops', [
    'prices = [math.inf] * n',
    'prices[src] = 0',
    'for i in range(k + 1):',
    '    temp = prices[:]',
    '    for u, v, w in flights:',
    '        if prices[u] + w < temp[v]:',
    '            temp[v] = prices[u] + w',
    '    prices = temp',
    'return -1 if prices[dst] == math.inf else prices[dst]',
  ], ['    temp = prices']),
  parsonsItem(5, ['mst', 'heap'], "Prim's MST on points", [
    'seen, heap, total = set(), [(0, 0)], 0',
    'while len(seen) < n:',
    '    cost, i = heapq.heappop(heap)',
    '    if i in seen:',
    '        continue',
    '    seen.add(i)',
    '    total += cost',
    '    for j in range(n):',
    '        if j not in seen:',
    '            heapq.heappush(heap, (dist(i, j), j))',
    'return total',
  ]),
  parsonsItem(6, ['graph-bfs', 'graph-modeling'], 'Bipartite BFS', [
    'color = {}',
    'for start in range(len(graph)):',
    '    if start in color:',
    '        continue',
    '    color[start] = 0',
    '    queue = deque([start])',
    '    while queue:',
    '        node = queue.popleft()',
    '        for nei in graph[node]:',
    '            if nei not in color:',
    '                color[nei] = 1 - color[node]',
    '                queue.append(nei)',
    '            elif color[nei] == color[node]:',
    '                return False',
  ]),
  parsonsItem(7, ['mst', 'union-find'], "Kruskal's MST", [
    'edges.sort()',
    'total, used = 0, 0',
    'for w, a, b in edges:',
    '    p1, p2 = find(a), find(b)',
    '    if p1 == p2:',
    '        continue',
    '    parent[p1] = p2',
    '    total += w',
    '    used += 1',
    '    if used == n - 1:',
    '        break',
    'return total',
  ]),
  parsonsItem(8, ['dijkstra', 'grid'], 'Min effort Dijkstra relax', [
    'curr, r, c = heapq.heappop(heap)',
    'if curr > effort[r][c]:',
    '    continue',
    'for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:',
    '    nr, nc = r + dr, c + dc',
    '    if 0 <= nr < rows and 0 <= nc < cols:',
    '        step = max(curr, abs(heights[nr][nc] - heights[r][c]))',
    '        if step < effort[nr][nc]:',
    '            effort[nr][nc] = step',
    '            heapq.heappush(heap, (step, nr, nc))',
  ], ['        step = curr + abs(heights[nr][nc] - heights[r][c])']),
]

const problem = (lc, rest) => ({ id: `graphs-advanced:problem:${lc}`, lc, ...rest })

const problems = [
  problem(323, {
    title: 'Number of Connected Components in an Undirected Graph',
    difficulty: 'Medium',
    google: true,
    skills: ['union-find', 'graph-dfs'],
    pattern: 'Union-Find count',
    ds: ['array (parent)', 'array (rank)'],
    constraints: '1 ≤ n ≤ 2000, 0 ≤ edges ≤ 5000',
    time: 'O(n + E·α(n))',
    space: 'O(n)',
    insight: 'Start at n components; every successful union removes one.',
    signals: ['number of connected components', 'undirected edges', 'groups'],
    narration: [
      'Clarify: undirected, nodes 0..n-1, duplicate edges possible?',
      'Each node starts as its own set; components = n.',
      'For each edge, union the roots; if they differ, components -= 1.',
      'Path compression + rank keep finds near O(1).',
      'O(n + E·α(n)) time, O(n) space. DFS also works in O(V+E).',
    ],
    solution: ufCode,
    traceId: 'graphs-advanced:trace:uf-components',
    pitfalls: ['Duplicate edges must not double-decrement', 'Isolated nodes still count'],
  }),
  problem(684, {
    title: 'Redundant Connection',
    difficulty: 'Medium',
    google: true,
    skills: ['union-find', 'graph-modeling'],
    pattern: 'Union-Find cycle detection',
    ds: ['array (parent)'],
    constraints: '3 ≤ n ≤ 1000, nodes labeled 1..n',
    time: 'O(n·α(n))',
    space: 'O(n)',
    insight: 'First edge whose endpoints already share a root closes the cycle.',
    signals: ['tree with one extra edge', 'remove an edge', 'return the last such edge'],
    narration: [
      'Clarify: exactly one extra edge, return the last one in input order that fixes it.',
      'Add edges in order with Union-Find.',
      'When both ends already share a root, that edge makes a cycle: return it.',
      'O(n·α(n)) time, O(n) space vs O(n²) with DFS per edge.',
    ],
    solution: redundantCode,
    traceId: 'graphs-advanced:trace:redundant-connection',
    pitfalls: ['Nodes are 1-indexed: size parent n + 1'],
  }),
  problem(547, {
    title: 'Number of Provinces',
    difficulty: 'Medium',
    google: true,
    skills: ['union-find', 'graph-dfs'],
    pattern: 'Union-Find on adjacency matrix',
    ds: ['array (parent)'],
    constraints: '1 ≤ n ≤ 200, isConnected is n × n',
    time: 'O(n²·α(n))',
    space: 'O(n)',
    insight: 'Matrix scan, union every 1; provinces = roots left.',
    signals: ['directly or indirectly connected', 'groups of cities', 'adjacency matrix'],
    narration: [
      'Input is an adjacency matrix, so reading it is already O(n²).',
      'Union i and j for every isConnected[i][j] == 1, j > i.',
      'Count successful unions; answer is n minus that.',
      'O(n²) time, O(n) space. DFS from each unvisited city also works.',
    ],
    solution: `class Solution:
    def findCircleNum(self, isConnected: List[List[int]]) -> int:
        n = len(isConnected)
        parent = [i for i in range(n)]
        result = n

        def find(node):
            while parent[node] != node:
                parent[node] = parent[parent[node]]
                node = parent[node]
            return node

        for i in range(n):
            for j in range(i + 1, n):
                if isConnected[i][j]:
                    p1, p2 = find(i), find(j)
                    if p1 != p2:
                        parent[p1] = p2
                        result -= 1

        return result`,
    traceId: 'graphs-advanced:trace:uf-components',
    pitfalls: ['Diagonal is always 1, skip it'],
  }),
  problem(721, {
    title: 'Accounts Merge',
    difficulty: 'Medium',
    google: true,
    skills: ['union-find', 'graph-modeling', 'arrays-hashing'],
    pattern: 'Union-Find over accounts keyed by email',
    ds: ['hashmap email → account', 'array (parent)'],
    constraints: '1 ≤ accounts ≤ 1000, each ≤ 10 emails',
    time: 'O(N·α(n) + N log N)',
    space: 'O(N)',
    insight: 'Shared email ⇒ union accounts. Group emails by root, sort.',
    signals: ['merge', 'same person if they share an email', 'groups'],
    narration: [
      'Same name does not mean same person; emails link accounts.',
      'Map each email to the first account index that owned it.',
      'If seen before, union the two accounts.',
      'Group emails by root account, sort each group, prepend the name.',
      'N = total emails: O(N log N) for the sorts.',
    ],
    solution: `from collections import defaultdict as dd

class Solution:
    def accountsMerge(self, accounts: List[List[str]]) -> List[List[str]]:
        parent = [i for i in range(len(accounts))]

        def find(node):
            while parent[node] != node:
                parent[node] = parent[parent[node]]
                node = parent[node]
            return node

        owner = {}

        for i, account in enumerate(accounts):
            for email in account[1:]:
                if email in owner:
                    p1, p2 = find(i), find(owner[email])
                    if p1 != p2:
                        parent[p1] = p2
                else:
                    owner[email] = i

        groups = dd(list)

        for email, i in owner.items():
            groups[find(i)].append(email)

        result = []

        for i, emails in groups.items():
            result.append([accounts[i][0]] + sorted(emails))

        return result`,
    pitfalls: ['Do not union by name', 'Sort emails within each group'],
  }),
  problem(743, {
    title: 'Network Delay Time',
    difficulty: 'Medium',
    google: true,
    skills: ['dijkstra', 'heap'],
    pattern: 'Dijkstra (lazy deletion)',
    ds: ['min-heap', 'adjacency list', 'set'],
    constraints: '1 ≤ n ≤ 100, 1 ≤ times ≤ 6000, 0 ≤ w ≤ 100',
    time: 'O((V+E) log V)',
    space: 'O(V+E)',
    insight: 'Shortest times from k; answer is the largest one.',
    signals: ['signal from node k', 'weighted directed', 'minimum time for all nodes'],
    narration: [
      'Weighted, non-negative, single source: Dijkstra.',
      'Heap of (time, node); pop smallest, skip if already seen.',
      'Each first pop is final; track the max time.',
      'If not all n nodes seen, return -1.',
      'O((V+E) log V) time, O(V+E) space.',
    ],
    solution: dijkstraCode,
    traceId: 'graphs-advanced:trace:network-delay',
    pitfalls: ['Nodes are 1-indexed', 'Unreachable node → -1'],
  }),
  problem(778, {
    title: 'Swim in Rising Water',
    difficulty: 'Hard',
    google: true,
    skills: ['dijkstra', 'grid', 'binary-search'],
    pattern: 'Minimax Dijkstra on grid',
    ds: ['min-heap', 'set'],
    constraints: '1 ≤ n ≤ 50, grid is a permutation of 0..n²-1',
    time: 'O(n² log n)',
    space: 'O(n²)',
    insight: 'Path cost is its max cell; expand lowest bottleneck first.',
    signals: ['minimum time', 'water level', 'path where every cell ≤ t'],
    narration: [
      'Cost of a path is the highest cell, so minimize the max.',
      'Dijkstra with key max(level, next cell): max never decreases.',
      'First time I pop the corner, that level is optimal.',
      'Alternative: binary search t with BFS feasibility, O(n² log n).',
      'O(n² log n) time, O(n²) space.',
    ],
    solution: swimCode,
    traceId: 'graphs-advanced:trace:swim-rising-water',
    pitfalls: ['Start cell height counts', 'Use max, not sum'],
  }),
  problem(1631, {
    title: 'Path With Minimum Effort',
    difficulty: 'Medium',
    google: true,
    skills: ['dijkstra', 'grid'],
    pattern: 'Minimax Dijkstra on grid',
    ds: ['min-heap', 'matrix'],
    constraints: '1 ≤ rows, cols ≤ 100, heights ≤ 10^6',
    time: 'O(rc log(rc))',
    space: 'O(rc)',
    insight: 'Edge weight = height jump; path cost = max jump.',
    signals: ['minimum effort', 'maximum absolute difference', 'route'],
    narration: [
      'Cells are nodes, 4 neighbors, weight = height difference.',
      'Cost is the max weight on the path, which is monotone: Dijkstra.',
      'Keep effort matrix, skip stale pops, return at the target.',
      'O(rc log rc). Binary search on effort + BFS also works.',
    ],
    solution: effortCode,
    traceId: 'graphs-advanced:trace:min-effort',
    pitfalls: ['1x1 grid returns 0', 'Skip stale heap entries'],
  }),
  problem(787, {
    title: 'Cheapest Flights Within K Stops',
    difficulty: 'Medium',
    google: true,
    skills: ['dijkstra', 'graph-modeling'],
    pattern: 'Bellman-Ford with k + 1 rounds',
    ds: ['array'],
    constraints: '1 ≤ n ≤ 100, flights ≤ n(n-1)/2, 0 ≤ k < n',
    time: 'O(k·E)',
    space: 'O(n)',
    insight: 'k stops = k + 1 edges; Bellman-Ford rounds count edges.',
    signals: ['at most k stops', 'cheapest price', 'flights'],
    narration: [
      'Plain Dijkstra on price can pick a path with too many stops.',
      'Bellman-Ford: round i = cheapest using ≤ i flights.',
      'Run k + 1 rounds; copy prices so each round adds one flight.',
      'O(k·E) time, O(n) space.',
    ],
    solution: flightsCode,
    traceId: 'graphs-advanced:trace:cheapest-flights',
    pitfalls: ['Forgetting the copy', 'Off by one: k + 1 rounds'],
  }),
  problem(1584, {
    title: 'Min Cost to Connect All Points',
    difficulty: 'Medium',
    google: true,
    skills: ['mst', 'heap', 'union-find'],
    pattern: "Prim's MST",
    ds: ['min-heap', 'set'],
    constraints: '1 ≤ n ≤ 1000, coordinates ≤ 10^6',
    time: 'O(n² log n)',
    space: 'O(n²)',
    insight: 'Complete graph on points: MST. Dense, so Prim.',
    signals: ['connect all points', 'minimum cost', 'Manhattan distance'],
    narration: [
      'Every pair is an edge, so this is MST on a dense graph.',
      "Prim's: heap of edges leaving the tree, take cheapest to a new point.",
      'Stop when all n points are in the tree.',
      'O(n² log n) with heap; O(n²) with a min-distance array.',
      "Kruskal also works: sort n²/2 edges + Union-Find.",
    ],
    solution: primCode,
    traceId: 'graphs-advanced:trace:prim',
    pitfalls: ['n = 1 returns 0'],
  }),
  problem(785, {
    title: 'Is Graph Bipartite?',
    difficulty: 'Medium',
    google: true,
    skills: ['graph-bfs', 'graph-modeling'],
    pattern: 'BFS 2-coloring',
    ds: ['deque', 'hashmap'],
    constraints: '1 ≤ n ≤ 100, adjacency list',
    time: 'O(V+E)',
    space: 'O(V)',
    insight: 'Alternate colors; same-colored edge means odd cycle.',
    signals: ['two sets', 'every edge between sets', 'split into groups'],
    narration: [
      'Bipartite means 2-colorable, i.e. no odd cycle.',
      'BFS from every uncolored node; neighbors get the opposite color.',
      'If a neighbor already has my color, return False.',
      'O(V+E) time, O(V) space.',
    ],
    solution: bipartiteCode,
    traceId: 'graphs-advanced:trace:bipartite',
    pitfalls: ['Graph may be disconnected'],
  }),
  problem(269, {
    title: 'Alien Dictionary',
    difficulty: 'Hard',
    google: true,
    skills: ['topo-sort', 'graph-modeling', 'graph-dfs'],
    pattern: 'Build graph from adjacent pairs + topological sort',
    ds: ['hashmap of sets', 'hashmap (state)'],
    constraints: '1 ≤ words ≤ 100, length ≤ 100, lowercase',
    time: 'O(C)',
    space: 'O(1) (≤ 26 letters)',
    insight: 'First differing letter of adjacent words is one edge.',
    signals: ['sorted lexicographically by new language', 'order of letters'],
    narration: [
      'Letters are nodes; compare each adjacent word pair.',
      'First differing letter gives an edge; prefix violation means invalid.',
      'DFS topo sort with on-path marks to catch cycles.',
      'Reverse post-order is the answer.',
      'O(total characters) time.',
    ],
    solution: alienCode,
    traceId: 'graphs-advanced:trace:alien-dictionary',
    pitfalls: ['"abc" before "ab" is invalid', 'Include letters with no edges'],
  }),
  problem(1970, {
    title: 'Last Day Where You Can Still Cross',
    difficulty: 'Hard',
    google: true,
    skills: ['binary-search', 'graph-bfs', 'grid'],
    pattern: 'Binary search on answer + BFS',
    ds: ['deque', 'set'],
    constraints: '2 ≤ row, col ≤ 2·10^4, row·col ≤ 2·10^4',
    time: 'O(rc log(rc))',
    space: 'O(rc)',
    insight: 'Crossable on day d ⇒ crossable earlier. Binary search d.',
    signals: ['last day', 'flooded cells over time', 'top row to bottom row'],
    narration: [
      'Feasibility is monotone in the day, so binary search the day.',
      'Check(day): flood first day cells, multi-source BFS from top row.',
      'If any bottom cell reached, day works; search right.',
      'O(rc log rc) time. Reverse-time Union-Find also works.',
    ],
    solution: `from collections import deque

class Solution:
    def latestDayToCross(self, row: int, col: int, cells: List[List[int]]) -> int:

        def canCross(day):
            water = set((r - 1, c - 1) for r, c in cells[:day])
            queue = deque([(0, c) for c in range(col) if (0, c) not in water])
            seen = set(queue)

            while queue:
                r, c = queue.popleft()
                if r == row - 1:
                    return True
                for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
                    nr, nc = r + dr, c + dc
                    if 0 <= nr < row and 0 <= nc < col and (nr, nc) not in water and (nr, nc) not in seen:
                        seen.add((nr, nc))
                        queue.append((nr, nc))

            return False

        left, right = 0, len(cells)

        while left < right:
            mid = (left + right + 1) // 2
            if canCross(mid):
                left = mid
            else:
                right = mid - 1

        return left`,
    pitfalls: ['cells are 1-indexed', 'Upper-mid to avoid infinite loop'],
  }),
]

const pickPathSetups = [
  { desc: 'unweighted edges', answer: 'BFS' },
  { desc: 'edge weights only 0 or 1', answer: '0-1 BFS' },
  { desc: 'non-negative weights', answer: 'Dijkstra' },
  { desc: 'some negative weights, no negative cycle', answer: 'Bellman-Ford' },
  { desc: 'non-negative weights, path may use at most k edges', answer: 'Bellman-Ford' },
  { desc: 'all-pairs distances, V ≤ 300', answer: 'Floyd-Warshall' },
  { desc: 'connect every node with min total weight', answer: 'MST (Prim/Kruskal)' },
  { desc: 'edges arrive online, connectivity queries', answer: 'Union-Find' },
]
const pickPathTools = ['BFS', '0-1 BFS', 'Dijkstra', 'Bellman-Ford', 'Floyd-Warshall', 'MST (Prim/Kruskal)', 'Union-Find']
const pickPathWhy = {
  BFS: 'Unweighted: BFS levels are distances, O(V+E).',
  '0-1 BFS': 'Deque handles 0/1 weights in O(V+E).',
  Dijkstra: 'Non-negative weights: greedy heap, O(E log V).',
  'Bellman-Ford': 'Negatives or an edge-count limit need round-by-round relaxation.',
  'Floyd-Warshall': 'Small V, all pairs: O(V³).',
  'MST (Prim/Kruskal)': 'Total weight to connect all, not a path.',
  'Union-Find': 'Incremental connectivity in ~O(1) per op.',
}

const rng = seed => {
  let x = (seed * 2654435761) >>> 0 || 1
  return () => {
    x ^= x << 13
    x >>>= 0
    x ^= x >> 17
    x ^= x << 5
    x >>>= 0
    return x / 4294967296
  }
}

const generators = [
  {
    id: 'graphs-advanced:gen:pick-tool',
    title: 'Pick the graph algorithm',
    skills: ['dijkstra', 'graph-modeling', 'ds-diagnosis'],
    make(seed) {
      const rand = rng(seed)
      const setup = pickPathSetups[Math.floor(rand() * pickPathSetups.length)]
      const sizes = setup.answer === 'Bellman-Ford' ? [10, 100, 1000] : [10, 100, 1000, 10 ** 4, 10 ** 5]
      const v = sizes[Math.floor(rand() * sizes.length)]
      const wrong = pickPathTools.filter(tool => tool !== setup.answer).sort(() => rand() - 0.5).slice(0, 3)
      const choices = [...wrong]
      const answer = Math.floor(rand() * 4)
      choices.splice(answer, 0, setup.answer)
      return {
        id: `graphs-advanced:gen:pick-tool:${seed}`,
        skills: ['dijkstra', 'graph-modeling', 'ds-diagnosis'],
        difficulty: 2,
        q: setup.desc.includes('V ≤') ? `Graph: ${setup.desc}. Best tool?` : `Graph with V = ${v.toLocaleString('en-US')}: ${setup.desc}. Best tool?`,
        choices,
        answer,
        why: pickPathWhy[setup.answer],
      }
    },
  },
]

export default {
  id: 'graphs-advanced',
  title: 'Graphs: Weighted, Union-Find, MST',
  icon: 'compass',
  skills: ['union-find', 'dijkstra', 'mst', 'graph-modeling', 'graph-bfs'],
  lessons,
  traces,
  flashcards,
  mcqs,
  clozes,
  parsons,
  problems,
  extras: { generators },
}
