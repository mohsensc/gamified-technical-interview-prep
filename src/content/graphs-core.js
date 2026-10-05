const clone = value => JSON.parse(JSON.stringify(value))

const finder = code => {
  const lines = code.split('\n')
  return (snippet, nth = 0) => {
    let count = 0
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(snippet)) {
        if (count === nth) return i + 1
        count++
      }
    }
    throw new Error(`line not found: ${snippet}`)
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

const cellKey = (r, c) => `${r},${c}`
const pairText = (r, c) => `(${r},${c})`
const letter = i => String.fromCharCode(65 + (i % 26))

const gridPanel = (label, cells, state = {}, values = {}) => ({
  kind: 'grid',
  label,
  cells: clone(cells),
  state: { ...state },
  values: { ...values },
})

const callstackPanel = frames => ({ kind: 'callstack', label: 'call stack', frames: [...frames] })

const queuePanel = (items, label = 'queue') => ({
  kind: 'queue',
  label,
  items: [...items],
  highlight: items.length ? [0] : [],
})

const circleLayout = (ids, radius = 0.38) =>
  ids.map((id, i) => {
    const angle = (2 * Math.PI * i) / ids.length - Math.PI / 2
    return { id, label: String(id), x: +(0.5 + radius * Math.cos(angle)).toFixed(3), y: +(0.5 + radius * Math.sin(angle)).toFixed(3) }
  })

const graphPanel = ({ label = 'graph', directed = false, nodes, edges, state = {}, edgeState = {}, values = {} }) => ({
  kind: 'graph',
  label,
  directed,
  nodes: clone(nodes),
  edges: clone(edges),
  state: { ...state },
  edgeState: { ...edgeState },
  values: { ...values },
})

const markEdge = (edgeState, a, b, kind, directed = false) => {
  edgeState[`${a}->${b}`] = kind
  if (!directed) edgeState[`${b}->${a}`] = kind
}

const fourDirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]

const islandGrids = {
  three: [
    ['1', '1', '0', '0', '0'],
    ['1', '1', '0', '0', '0'],
    ['0', '0', '1', '0', '0'],
    ['0', '0', '0', '1', '1'],
  ],
  snake: [
    ['1', '1', '1', '0'],
    ['0', '0', '1', '0'],
    ['1', '0', '1', '1'],
    ['1', '0', '0', '1'],
  ],
  ring: [
    ['1', '1', '1', '1'],
    ['1', '0', '0', '1'],
    ['1', '0', '1', '1'],
    ['0', '0', '0', '0'],
  ],
}

const islandsDfsCode = `class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        rows, cols, islands = len(grid), len(grid[0]), 0

        def dfs(row, col):
            if row < 0 or row >= rows or col < 0 or col >= cols or grid[row][col] == "0":
                return

            grid[row][col] = "0"

            dfs(row + 1, col)
            dfs(row - 1, col)
            dfs(row, col + 1)
            dfs(row, col - 1)

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == "1":
                    dfs(r, c)
                    islands += 1

        return islands`

const traceIslandsDfs = {
  id: 'graphs-core:trace:islands-dfs',
  title: 'Number of islands (DFS sink)',
  skills: ['grid', 'graph-dfs', 'graph-modeling', 'communication'],
  problem: 'Count groups of 4-directionally connected "1" cells.',
  code: islandsDfsCode,
  complexity: { time: 'O(r·c)', space: 'O(r·c)', why: 'Each cell sunk once; worst-case recursion depth is every cell (one long snake).' },
  inputs: [
    { label: 'three islands', value: islandGrids.three },
    { label: 'snake', value: islandGrids.snake },
    { label: 'ring', value: islandGrids.ring },
  ],
  run(input, t) {
    const L = finder(islandsDfsCode)
    const grid = clone(input)
    const rows = grid.length
    const cols = grid[0].length
    const state = {}
    const values = {}
    const frames = []
    const say = once()
    let islands = 0
    const panels = () => [
      gridPanel('grid (sunk = visited)', grid, state, values),
      callstackPanel(frames),
      { kind: 'text', text: `islands = ${islands}` },
    ]
    t.step(L('rows, cols, islands'), {
      vars: { rows, cols, islands },
      panels: panels(),
      note: 'Cells are nodes; 4 neighbors are edges',
      say: say('model', 'This is a graph in disguise: each land cell is a node, adjacent land cells share an edge. Islands = connected components.'),
    })
    let shownBase = false
    const dfs = (row, col) => {
      if (row < 0 || row >= rows || col < 0 || col >= cols || grid[row][col] === '0') {
        if (!shownBase && frames.length) {
          shownBase = true
          t.step(L('return', 0), {
            vars: { row, col },
            panels: panels(),
            note: `(${row},${col}) is off-grid or water: return`,
            say: 'Base case first: out of bounds or water means stop. Checking at the top keeps the neighbor calls clean.',
          })
        }
        return
      }
      frames.push(`dfs(${row},${col})`)
      grid[row][col] = '0'
      state[cellKey(row, col)] = 'current'
      values[cellKey(row, col)] = letter(islands)
      t.step(L('grid[row][col] = "0"'), {
        vars: { row, col, depth: frames.length },
        panels: panels(),
        note: `Sink (${row},${col}) so it is never counted again`,
        say: say('sink', 'Marking visited by sinking the cell to "0": O(1) extra space, and it can never be re-entered.'),
      })
      state[cellKey(row, col)] = 'path'
      for (const [dr, dc] of fourDirs) dfs(row + dr, col + dc)
      state[cellKey(row, col)] = 'visited'
      frames.pop()
    }
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === '1') {
          state[cellKey(r, c)] = 'current'
          t.step(L('if grid[r][c] == "1"'), {
            vars: { r, c, islands },
            panels: panels(),
            note: `Unvisited land at (${r},${c}): new island`,
            say: islands === 0 ? 'Scan every cell. Any land still standing must start a brand new island.' : undefined,
          })
          dfs(r, c)
          islands++
          t.step(L('islands += 1'), {
            vars: { r, c, islands },
            panels: panels(),
            note: `Whole island ${letter(islands - 1)} sunk; count = ${islands}`,
            say: say('count', 'One DFS call from the outer loop flood-fills exactly one component, so I add one per call.'),
          })
        }
      }
    }
    t.step(L('return islands'), {
      vars: { islands },
      panels: panels(),
      note: `Answer: ${islands}`,
      say: 'O(r·c) time: each cell is sunk once and checks 4 neighbors. Space O(r·c) worst case for recursion depth.',
    })
  },
}

const islandsBfsCode = `from collections import deque

class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        rows, cols, islands = len(grid), len(grid[0]), 0
        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]

        def bfs(r, c):
            queue = deque([(r, c)])
            grid[r][c] = "0"

            while queue:
                row, col = queue.popleft()

                for dr, dc in directions:
                    nr, nc = row + dr, col + dc
                    if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == "1":
                        grid[nr][nc] = "0"
                        queue.append((nr, nc))

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == "1":
                    bfs(r, c)
                    islands += 1

        return islands`

const traceIslandsBfs = {
  id: 'graphs-core:trace:islands-bfs',
  title: 'Number of islands (BFS queue)',
  skills: ['grid', 'graph-bfs', 'queue-deque', 'communication'],
  problem: 'Count islands, flooding each one with a queue instead of recursion.',
  code: islandsBfsCode,
  complexity: { time: 'O(r·c)', space: 'O(r·c) worst (queue), often ~O(min(r,c))', why: 'Each cell enqueued once; the frontier is usually a band ~min(r,c) wide, but plan for O(r·c).' },
  inputs: [
    { label: 'three islands', value: islandGrids.three },
    { label: 'snake', value: islandGrids.snake },
    { label: 'ring', value: islandGrids.ring },
  ],
  run(input, t) {
    const L = finder(islandsBfsCode)
    const grid = clone(input)
    const rows = grid.length
    const cols = grid[0].length
    const state = {}
    const values = {}
    const say = once()
    let islands = 0
    let queue = []
    const panels = () => [
      gridPanel('grid', grid, state, values),
      queuePanel(queue.map(([r, c]) => pairText(r, c))),
      { kind: 'text', text: `islands = ${islands}` },
    ]
    t.step(L('directions = '), {
      vars: { rows, cols, islands },
      panels: panels(),
      note: 'Directions list = the 4 implicit edges of a cell',
      say: say('dirs', 'I keep a directions list so neighbor logic is one loop instead of four copies.'),
    })
    const bfs = (r, c) => {
      queue = [[r, c]]
      grid[r][c] = '0'
      state[cellKey(r, c)] = 'frontier'
      values[cellKey(r, c)] = letter(islands)
      t.step(L('grid[r][c] = "0"'), {
        vars: { r, c },
        panels: panels(),
        note: `Seed queue with (${r},${c}) and mark it now`,
        say: say('seed', 'Mark the start visited as I enqueue it, not when I pop it.'),
      })
      while (queue.length) {
        const [row, col] = queue.shift()
        state[cellKey(row, col)] = 'current'
        t.step(L('queue.popleft()'), {
          vars: { row, col, queued: queue.length },
          panels: panels(),
          note: `Pop (${row},${col}) from the front (FIFO)`,
        })
        for (const [dr, dc] of fourDirs) {
          const nr = row + dr
          const nc = col + dc
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === '1') {
            grid[nr][nc] = '0'
            queue.push([nr, nc])
            state[cellKey(nr, nc)] = 'frontier'
            values[cellKey(nr, nc)] = letter(islands)
            t.step(L('queue.append((nr, nc))'), {
              vars: { row, col, nr, nc },
              panels: panels(),
              note: `Land neighbor (${nr},${nc}): mark + enqueue`,
              say: say('enqueue', 'Marking on enqueue guarantees each cell enters the queue once. Marking on pop would let the same cell be queued by several neighbors.'),
            })
          }
        }
        state[cellKey(row, col)] = 'visited'
      }
    }
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === '1') {
          t.step(L('if grid[r][c] == "1"'), {
            vars: { r, c, islands },
            panels: panels(),
            note: `Fresh land at (${r},${c}): start a BFS`,
          })
          bfs(r, c)
          islands++
          t.step(L('islands += 1'), {
            vars: { islands },
            panels: panels(),
            note: `Queue empty: island ${letter(islands - 1)} done`,
            say: say('count', 'Queue drained means this component is fully explored. One BFS per island.'),
          })
        }
      }
    }
    t.step(L('return islands'), {
      vars: { islands },
      panels: panels(),
      note: `Answer: ${islands}`,
      say: 'O(r·c) time. BFS avoids Python recursion limits on huge islands, which is a good reason to prefer it here.',
    })
  },
}

const areaGrids = {
  two: [
    [1, 1, 0, 0],
    [1, 0, 0, 1],
    [0, 0, 1, 1],
    [0, 1, 1, 1],
  ],
  plus: [
    [0, 1, 0, 1],
    [1, 1, 1, 0],
    [0, 1, 0, 0],
    [1, 0, 0, 1],
  ],
}

const maxAreaCode = `class Solution:
    def maxAreaOfIsland(self, grid: List[List[int]]) -> int:
        rows, cols, biggest = len(grid), len(grid[0]), 0

        def dfs(row, col):
            if row < 0 or row >= rows or col < 0 or col >= cols or grid[row][col] == 0:
                return 0

            grid[row][col] = 0

            return 1 + dfs(row + 1, col) + dfs(row - 1, col) + dfs(row, col + 1) + dfs(row, col - 1)

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 1:
                    biggest = max(biggest, dfs(r, c))

        return biggest`

const traceMaxArea = {
  id: 'graphs-core:trace:max-area',
  title: 'Max area of island (DFS returns size)',
  skills: ['grid', 'graph-dfs'],
  problem: 'Return the size of the largest 4-connected island of 1s.',
  code: maxAreaCode,
  complexity: { time: 'O(r·c)', space: 'O(r·c)', why: 'Each cell zeroed once; recursion can go r·c deep.' },
  inputs: [
    { label: 'two islands', value: areaGrids.two },
    { label: 'plus', value: areaGrids.plus },
  ],
  run(input, t) {
    const L = finder(maxAreaCode)
    const grid = clone(input)
    const rows = grid.length
    const cols = grid[0].length
    const state = {}
    const values = {}
    const frames = []
    const say = once()
    let biggest = 0
    const panels = () => [
      gridPanel('grid (value = size returned)', grid, state, values),
      callstackPanel(frames),
      { kind: 'text', text: `biggest = ${biggest}` },
    ]
    t.step(L('rows, cols, biggest'), {
      vars: { rows, cols, biggest },
      panels: panels(),
      note: 'Same flood fill, but dfs returns a count',
      say: say('contract', 'Contract: dfs(row, col) returns how many land cells it newly sinks from here.'),
    })
    const dfs = (row, col) => {
      if (row < 0 || row >= rows || col < 0 || col >= cols || grid[row][col] === 0) return 0
      frames.push(`dfs(${row},${col})`)
      grid[row][col] = 0
      state[cellKey(row, col)] = 'current'
      t.step(L('grid[row][col] = 0'), {
        vars: { row, col },
        panels: panels(),
        note: `Sink (${row},${col}) before recursing`,
        say: say('before', 'Sink before recursing, otherwise neighbors would bounce back and count me twice.'),
      })
      state[cellKey(row, col)] = 'path'
      let total = 1
      for (const [dr, dc] of fourDirs) total += dfs(row + dr, col + dc)
      state[cellKey(row, col)] = 'visited'
      values[cellKey(row, col)] = String(total)
      t.step(L('return 1 + dfs'), {
        vars: { row, col, returns: total },
        panels: panels(),
        note: `(${row},${col}) returns 1 + neighbors = ${total}`,
        say: say('sum', 'Each call returns 1 for itself plus whatever its four neighbors sank. Sizes flow back up the stack.'),
      })
      frames.pop()
      return total
    }
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === 1) {
          const size = dfs(r, c)
          biggest = Math.max(biggest, size)
          t.step(L('biggest = max'), {
            vars: { r, c, size, biggest },
            panels: panels(),
            note: `Island from (${r},${c}) has area ${size}`,
          })
        }
      }
    }
    t.step(L('return biggest'), {
      vars: { biggest },
      panels: panels(),
      note: `Largest island: ${biggest}`,
      say: 'O(r·c) time and worst-case O(r·c) stack. Same skeleton as number of islands, only the return value changed.',
    })
  },
}

const orangeGrids = {
  classic: [
    [2, 1, 1],
    [1, 1, 0],
    [0, 1, 1],
  ],
  twoSources: [
    [2, 1, 1, 0],
    [1, 0, 1, 1],
    [0, 1, 1, 2],
  ],
  stuck: [
    [2, 1, 1],
    [0, 1, 1],
    [1, 0, 1],
  ],
}

const rottingCode = `from collections import deque

class Solution:
    def orangesRotting(self, grid: List[List[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        queue, fresh, minutes = deque(), 0, 0

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 2:
                    queue.append((r, c))
                elif grid[r][c] == 1:
                    fresh += 1

        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]
        while queue and fresh:
            for _ in range(len(queue)):
                row, col = queue.popleft()
                for dr, dc in directions:
                    nr, nc = row + dr, col + dc
                    if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                        grid[nr][nc] = 2
                        fresh -= 1
                        queue.append((nr, nc))
            minutes += 1

        return minutes if fresh == 0 else -1`

const traceRotting = {
  id: 'graphs-core:trace:rotting-oranges',
  title: 'Rotting oranges (multi-source BFS)',
  skills: ['graph-bfs', 'grid', 'queue-deque', 'communication'],
  problem: 'Each minute rot spreads to adjacent fresh oranges. Minutes until none fresh, or -1.',
  code: rottingCode,
  complexity: { time: 'O(r·c)', space: 'O(r·c)', why: 'Each orange rots and is enqueued at most once.' },
  inputs: [
    { label: 'classic', value: orangeGrids.classic },
    { label: 'two sources', value: orangeGrids.twoSources },
    { label: 'unreachable', value: orangeGrids.stuck },
  ],
  run(input, t) {
    const L = finder(rottingCode)
    const grid = clone(input)
    const rows = grid.length
    const cols = grid[0].length
    const state = {}
    const values = {}
    const say = once()
    let queue = []
    let fresh = 0
    let minutes = 0
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (grid[r][c] === 0) state[cellKey(r, c)] = 'wall'
    const panels = () => [
      gridPanel('0 empty · 1 fresh · 2 rotten (value = minute)', grid, state, values),
      queuePanel(queue.map(([r, c]) => pairText(r, c))),
      { kind: 'text', text: `minute ${minutes} · fresh left ${fresh}` },
    ]
    t.step(L('queue, fresh, minutes'), {
      vars: { rows, cols },
      panels: panels(),
      note: 'Rot spreads from ALL rotten oranges at once',
      say: say('multi', 'Every rotten orange starts spreading at minute 0, so I seed the queue with all of them: multi-source BFS.'),
    })
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === 2) {
          queue.push([r, c])
          state[cellKey(r, c)] = 'frontier'
          values[cellKey(r, c)] = '0'
        } else if (grid[r][c] === 1) fresh++
      }
    }
    t.step(L('fresh += 1'), {
      vars: { fresh, queue: queue.map(([r, c]) => pairText(r, c)) },
      panels: panels(),
      note: `${queue.length} source(s) queued, ${fresh} fresh counted`,
      say: say('fresh', 'Counting fresh up front lets me stop early and detect -1 without rescanning the grid.'),
    })
    while (queue.length && fresh) {
      const size = queue.length
      t.step(L('for _ in range(len(queue))'), {
        vars: { minutes, levelSize: size, fresh },
        panels: panels(),
        note: `Minute ${minutes + 1}: process exactly ${size} queued orange(s)`,
        say: say('level', 'Snapshotting len(queue) processes one minute at a time. Each BFS layer is one minute.'),
      })
      for (let i = 0; i < size; i++) {
        const [row, col] = queue.shift()
        state[cellKey(row, col)] = 'current'
        t.step(L('queue.popleft()'), { vars: { row, col, minutes }, panels: panels(), note: `Spread from (${row},${col})` })
        for (const [dr, dc] of fourDirs) {
          const nr = row + dr
          const nc = col + dc
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1) {
            grid[nr][nc] = 2
            fresh--
            queue.push([nr, nc])
            state[cellKey(nr, nc)] = 'frontier'
            values[cellKey(nr, nc)] = String(minutes + 1)
            t.step(L('grid[nr][nc] = 2'), {
              vars: { nr, nc, fresh },
              panels: panels(),
              note: `(${nr},${nc}) rots at minute ${minutes + 1}`,
              say: say('mark', 'Setting it to 2 right away is my visited mark, so no other orange enqueues it again.'),
            })
          }
        }
        state[cellKey(row, col)] = 'visited'
      }
      minutes++
      t.step(L('minutes += 1'), { vars: { minutes, fresh }, panels: panels(), note: `Minute ${minutes} finished` })
    }
    const answer = fresh === 0 ? minutes : -1
    t.step(L('return minutes if fresh'), {
      vars: { minutes, fresh, answer },
      panels: panels(),
      note: fresh === 0 ? `All rotten after ${minutes} minute(s)` : `${fresh} fresh unreachable: -1`,
      say: fresh === 0
        ? 'O(r·c) time and space. The answer is the number of BFS layers it took.'
        : 'Queue ran dry while fresh oranges remain: they are walled off, so return -1.',
    })
  },
}

const INF = 2147483647
const treasureGrids = {
  classic: [
    [INF, -1, 0, INF],
    [INF, INF, INF, -1],
    [INF, -1, INF, -1],
    [0, -1, INF, INF],
  ],
  oneChest: [
    [0, INF, INF],
    [INF, -1, INF],
    [INF, INF, INF],
  ],
}

const treasureCode = `from collections import deque

class Solution:
    def islandsAndTreasure(self, grid: List[List[int]]) -> None:
        rows, cols = len(grid), len(grid[0])
        INF = 2147483647
        queue = deque()

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 0:
                    queue.append((r, c))

        while queue:
            row, col = queue.popleft()
            dist = grid[row][col] + 1

            for nr, nc in [(row + 1, col), (row - 1, col), (row, col + 1), (row, col - 1)]:
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == INF:
                    grid[nr][nc] = dist
                    queue.append((nr, nc))`

const traceTreasure = {
  id: 'graphs-core:trace:islands-treasure',
  title: 'Walls & gates / islands and treasure',
  skills: ['graph-bfs', 'grid', 'communication'],
  problem: 'Fill every land cell with distance to its nearest treasure (0). Walls are -1.',
  code: treasureCode,
  complexity: { time: 'O(r·c)', space: 'O(r·c)', why: 'Every cell is filled and enqueued at most once, from all chests together.' },
  inputs: [
    { label: 'classic', value: treasureGrids.classic },
    { label: 'one chest', value: treasureGrids.oneChest },
  ],
  run(input, t) {
    const L = finder(treasureCode)
    const grid = clone(input)
    const rows = grid.length
    const cols = grid[0].length
    const state = {}
    const say = once()
    let queue = []
    const show = () => grid.map(row => row.map(v => (v === INF ? '∞' : v === -1 ? '#' : v)))
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (grid[r][c] === -1) state[cellKey(r, c)] = 'wall'
    const panels = () => [gridPanel('# wall · 0 treasure · ∞ unvisited', show(), state), queuePanel(queue.map(([r, c]) => pairText(r, c)))]
    t.step(L('queue = deque()'), {
      vars: { rows, cols },
      panels: panels(),
      note: 'Reverse it: BFS out FROM every chest',
      say: say('reverse', 'Instead of BFS from every land cell, which is O((r·c)^2), I BFS once from all treasures together.'),
    })
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === 0) {
          queue.push([r, c])
          state[cellKey(r, c)] = 'frontier'
          t.step(L('queue.append((r, c))'), { vars: { r, c }, panels: panels(), note: `Treasure at (${r},${c}) is a source` })
        }
      }
    }
    while (queue.length) {
      const [row, col] = queue.shift()
      const dist = grid[row][col] + 1
      state[cellKey(row, col)] = 'current'
      t.step(L('dist = grid[row][col] + 1'), {
        vars: { row, col, dist },
        panels: panels(),
        note: `Pop (${row},${col}); neighbors get ${dist}`,
        say: say('layers', 'Queue order is distance order. The first time BFS reaches a cell is via a shortest path.'),
      })
      for (const [nr, nc] of [[row + 1, col], [row - 1, col], [row, col + 1], [row, col - 1]]) {
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === INF) {
          grid[nr][nc] = dist
          queue.push([nr, nc])
          state[cellKey(nr, nc)] = 'frontier'
          t.step(L('grid[nr][nc] = dist'), {
            vars: { nr, nc, dist },
            panels: panels(),
            note: `(${nr},${nc}) = ${dist}, final`,
            say: say('inf', 'INF doubles as my unvisited check: once a cell gets a number it is final and never touched again.'),
          })
        }
      }
      state[cellKey(row, col)] = 'visited'
    }
    t.step(L('while queue:'), {
      vars: {},
      panels: panels(),
      note: 'Queue empty: every reachable cell filled',
      say: 'O(r·c) time and space. Unreachable land stays INF, which the problem expects.',
    })
  },
}

const heightsGrids = {
  classic: [
    [1, 2, 2, 3, 5],
    [3, 2, 3, 4, 4],
    [2, 4, 5, 3, 1],
    [6, 7, 1, 4, 5],
    [5, 1, 1, 2, 4],
  ],
  small: [
    [1, 2, 3],
    [8, 9, 4],
    [7, 6, 5],
  ],
}

const pacificCode = `class Solution:
    def pacificAtlantic(self, heights: List[List[int]]) -> List[List[int]]:
        rows, cols = len(heights), len(heights[0])
        pac, atl, answers = set(), set(), []

        def dfs(row, col, oceanSet, prevHeight):
            if (row, col) in oceanSet or row < 0 or row >= rows or col < 0 or col >= cols or heights[row][col] < prevHeight:
                return
            oceanSet.add((row, col))
            dfs(row + 1, col, oceanSet, heights[row][col])
            dfs(row - 1, col, oceanSet, heights[row][col])
            dfs(row, col + 1, oceanSet, heights[row][col])
            dfs(row, col - 1, oceanSet, heights[row][col])

        for r in range(rows):
            dfs(r, 0, pac, heights[r][0])
            dfs(r, cols - 1, atl, heights[r][cols - 1])

        for c in range(cols):
            dfs(0, c, pac, heights[0][c])
            dfs(rows - 1, c, atl, heights[rows - 1][c])

        for r in range(rows):
            for c in range(cols):
                if (r, c) in pac and (r, c) in atl:
                    answers.append([r, c])

        return answers`

const tracePacific = {
  id: 'graphs-core:trace:pacific-atlantic',
  title: 'Pacific Atlantic (DFS uphill from oceans)',
  skills: ['grid', 'graph-dfs', 'graph-modeling', 'communication'],
  problem: 'Cells whose water can flow (to ≤ height) into both the Pacific (top/left) and Atlantic (bottom/right).',
  code: pacificCode,
  complexity: { time: 'O(r·c)', space: 'O(r·c)', why: 'Each cell joins each ocean set at most once: two flood fills total.' },
  inputs: [
    { label: 'LC example', value: heightsGrids.classic },
    { label: 'spiral', value: heightsGrids.small },
  ],
  run(input, t) {
    const L = finder(pacificCode)
    const heights = input
    const rows = heights.length
    const cols = heights[0].length
    const pac = new Set()
    const atl = new Set()
    const frames = []
    const say = once()
    let current = null
    let answers = []
    const values = () => {
      const out = {}
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const k = cellKey(r, c)
          const tag = (pac.has(k) ? 'P' : '') + (atl.has(k) ? 'A' : '')
          if (tag) out[k] = tag
        }
      }
      return out
    }
    const state = () => {
      const out = {}
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const k = cellKey(r, c)
          if (pac.has(k) && atl.has(k)) out[k] = 'path'
          else if (pac.has(k)) out[k] = 'frontier'
          else if (atl.has(k)) out[k] = 'visited'
        }
      }
      for (const [r, c] of answers) out[cellKey(r, c)] = 'done'
      if (current) out[current] = 'current'
      return out
    }
    const panels = () => [
      gridPanel('heights · P pacific · A atlantic', heights, state(), values()),
      callstackPanel(frames),
      { kind: 'set', label: 'pac ∩ atl', items: [...pac].filter(k => atl.has(k)).map(k => `(${k})`) },
    ]
    t.step(L('pac, atl, answers'), {
      vars: { rows, cols },
      panels: panels(),
      note: 'Flip it: walk UPHILL from each ocean edge',
      say: say('flip', 'Checking every cell downhill is O((r·c)^2). Reverse the flow: start at each ocean border and climb to cells of equal or greater height.'),
    })
    const dfs = (row, col, oceanSet, prevHeight, oceanName) => {
      const k = cellKey(row, col)
      if (oceanSet.has(k) || row < 0 || row >= rows || col < 0 || col >= cols || heights[row][col] < prevHeight) return
      oceanSet.add(k)
      frames.push(`dfs(${row},${col},${oceanName})`)
      current = k
      t.step(L('oceanSet.add((row, col))'), {
        vars: { row, col, ocean: oceanName, height: heights[row][col], prevHeight },
        panels: panels(),
        note: `${oceanName} reaches (${row},${col}): ${heights[row][col]} ≥ ${prevHeight}`,
        say: say(`climb${oceanName}`, oceanName === 'pac'
          ? 'Reverse condition: I can step to a neighbor only if it is at least as high, since water would flow from it down to me.'
          : 'Same DFS, different set. Passing the set in lets one function serve both oceans.'),
      })
      current = null
      for (const [dr, dc] of fourDirs) dfs(row + dr, col + dc, oceanSet, heights[row][col], oceanName)
      frames.pop()
    }
    for (let r = 0; r < rows; r++) {
      dfs(r, 0, pac, heights[r][0], 'pac')
      dfs(r, cols - 1, atl, heights[r][cols - 1], 'atl')
    }
    t.step(L('for c in range(cols):'), { vars: { pac: pac.size, atl: atl.size }, panels: panels(), note: 'Left/right borders done; now top/bottom' })
    for (let c = 0; c < cols; c++) {
      dfs(0, c, pac, heights[0][c], 'pac')
      dfs(rows - 1, c, atl, heights[rows - 1][c], 'atl')
    }
    answers = []
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (pac.has(cellKey(r, c)) && atl.has(cellKey(r, c))) answers.push([r, c])
    t.step(L('answers.append([r, c])'), {
      vars: { answers: answers.map(([r, c]) => pairText(r, c)) },
      panels: panels(),
      note: `${answers.length} cells reach both oceans`,
      say: say('intersect', 'Answer is the intersection of the two reachable sets.'),
    })
    t.step(L('return answers'), {
      vars: { count: answers.length },
      panels: panels(),
      note: 'Return the intersection',
      say: 'Two flood fills, each O(r·c), so O(r·c) time and space overall.',
    })
  },
}

const cloneInputs = {
  square: [[2, 4], [1, 3], [2, 4], [1, 3]],
  triangle: [[2, 3], [1, 3], [1, 2]],
  line: [[2], [1, 3], [2]],
}

const cloneCode = `class Solution:
    def cloneGraph(self, node: Optional['Node']) -> Optional['Node']:
        oldToNew = {}

        def dfs(node):
            if node in oldToNew:
                return oldToNew[node]

            clone = Node(node.val)
            oldToNew[node] = clone
            for neighbor in node.neighbors:
                clone.neighbors.append(dfs(neighbor))

            return clone

        return dfs(node) if node else None`

const traceClone = {
  id: 'graphs-core:trace:clone-graph',
  title: 'Clone graph (DFS + old→new map)',
  skills: ['graph-dfs', 'arrays-hashing', 'communication'],
  problem: 'Deep copy a connected undirected graph given node 1.',
  code: cloneCode,
  complexity: { time: 'O(V+E)', space: 'O(V)', why: 'Each node cloned once; each adjacency entry appended once.' },
  inputs: [
    { label: 'square', value: cloneInputs.square },
    { label: 'triangle', value: cloneInputs.triangle },
    { label: 'line', value: cloneInputs.line },
  ],
  run(input, t) {
    const L = finder(cloneCode)
    const n = input.length
    const ids = Array.from({ length: n }, (_, i) => i + 1)
    const nodes = circleLayout(ids)
    const edges = []
    for (let i = 0; i < n; i++) for (const j of input[i]) if (i + 1 < j) edges.push({ from: i + 1, to: j })
    const state = {}
    const edgeState = {}
    const oldToNew = []
    const cloneNodes = []
    const cloneEdges = []
    const frames = []
    const say = once()
    const panels = () => [
      graphPanel({ label: 'original', nodes, edges, state, edgeState }),
      graphPanel({
        label: 'clone (built so far)',
        nodes: cloneNodes.map(id => ({ ...nodes[id - 1], label: `${id}'` })),
        edges: cloneEdges,
        state: Object.fromEntries(cloneNodes.map(id => [id, 'done'])),
      }),
      { kind: 'hashmap', label: 'oldToNew', entries: oldToNew.map(id => [`node ${id}`, `clone ${id}'`]) },
      callstackPanel(frames),
    ]
    t.step(L('oldToNew = {}'), {
      vars: {},
      panels: panels(),
      note: 'Map original node → its copy',
      say: say('map', 'The hashmap is both my visited set and my lookup for wiring edges to copies that already exist.'),
    })
    const dfs = id => {
      frames.push(`dfs(${id})`)
      if (oldToNew.includes(id)) {
        t.step(L('return oldToNew[node]'), {
          vars: { node: id },
          panels: panels(),
          note: `${id} already cloned: reuse ${id}'`,
          say: say('cycle', 'Already in the map means I have seen it. Returning the existing copy breaks cycles, no infinite loop.'),
        })
        frames.pop()
        return id
      }
      oldToNew.push(id)
      cloneNodes.push(id)
      state[id] = 'current'
      t.step(L('oldToNew[node] = clone'), {
        vars: { node: id },
        panels: panels(),
        note: `Create ${id}' and store it BEFORE recursing`,
        say: say('before', 'I register the clone before visiting neighbors, so a neighbor pointing back finds it.'),
      })
      state[id] = 'path'
      for (const nb of input[id - 1]) {
        markEdge(edgeState, id, nb, 'active')
        const got = dfs(nb)
        if (!cloneEdges.some(e => (e.from === id && e.to === got) || (e.from === got && e.to === id))) cloneEdges.push({ from: id, to: got })
        markEdge(edgeState, id, nb, 'tree')
        state[id] = 'current'
        t.step(L('clone.neighbors.append(dfs(neighbor))'), {
          vars: { node: id, neighbor: nb },
          panels: panels(),
          note: `Wire ${id}' → ${got}'`,
        })
        state[id] = 'path'
      }
      state[id] = 'done'
      t.step(L('return clone'), { vars: { node: id }, panels: panels(), note: `${id}' finished` })
      frames.pop()
      return id
    }
    dfs(1)
    t.step(L('return dfs(node) if node else None'), {
      vars: { cloned: oldToNew.length },
      panels: panels(),
      note: 'Return the copy of node 1',
      say: 'O(V+E) time: every node once, every edge once from each side. O(V) for the map and stack.',
    })
  },
}

const courseInputs = {
  dag: { numCourses: 5, prerequisites: [[1, 0], [2, 0], [3, 1], [3, 2], [4, 3]] },
  cycle: { numCourses: 4, prerequisites: [[1, 0], [2, 1], [3, 2], [1, 3]] },
  split: { numCourses: 6, prerequisites: [[1, 0], [2, 1], [4, 3], [5, 4], [5, 2]] },
}

const courseCode = `class Solution:
    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
        graph = {i: [] for i in range(numCourses)}
        for course, pre in prerequisites:
            graph[course].append(pre)

        state = [0] * numCourses

        def dfs(course):
            if state[course] == 1:
                return False
            if state[course] == 2:
                return True

            state[course] = 1
            for pre in graph[course]:
                if not dfs(pre):
                    return False
            state[course] = 2
            return True

        for c in range(numCourses):
            if not dfs(c):
                return False
        return True`

const traceCourse = {
  id: 'graphs-core:trace:course-schedule',
  title: 'Course schedule (3-color cycle DFS)',
  skills: ['topo-sort', 'graph-dfs', 'graph-modeling', 'communication'],
  problem: 'Can all courses be finished? Equivalent: does the prerequisite graph have a cycle?',
  code: courseCode,
  complexity: { time: 'O(V+E)', space: 'O(V+E)', why: 'Each course turns done once and each edge is followed once; adjacency list holds E.' },
  inputs: [
    { label: 'DAG', value: courseInputs.dag },
    { label: 'cycle 1→3→2→1', value: courseInputs.cycle },
    { label: 'two chains', value: courseInputs.split },
  ],
  run(input, t) {
    const L = finder(courseCode)
    const { numCourses, prerequisites } = input
    const graph = Array.from({ length: numCourses }, () => [])
    for (const [course, pre] of prerequisites) graph[course].push(pre)
    const nodes = circleLayout(Array.from({ length: numCourses }, (_, i) => i))
    const edges = prerequisites.map(([course, pre]) => ({ from: course, to: pre }))
    const color = Array(numCourses).fill(0)
    const edgeState = {}
    const frames = []
    const say = once()
    let current = null
    const vizState = () => {
      const out = {}
      color.forEach((s, i) => {
        if (s === 1) out[i] = 'path'
        if (s === 2) out[i] = 'done'
      })
      if (current !== null) out[current] = 'current'
      return out
    }
    const panels = () => [
      graphPanel({ label: 'course → prereq (pink = on path, green = safe)', directed: true, nodes, edges, state: vizState(), edgeState }),
      { kind: 'array', label: 'state (0 new · 1 visiting · 2 done)', values: [...color], highlight: current !== null ? [current] : [] },
      callstackPanel(frames),
    ]
    t.step(L('graph[course].append(pre)'), {
      vars: { numCourses, edges: prerequisites.length },
      panels: panels(),
      note: 'Courses are nodes, prerequisites are directed edges',
      say: say('model', 'Courses are nodes, each prerequisite is a directed edge. Finishing everything is possible exactly when there is no cycle.'),
    })
    t.step(L('state = [0] * numCourses'), {
      vars: { state: [...color] },
      panels: panels(),
      note: '3 colors: new, visiting (on stack), done',
      say: say('colors', 'A plain seen set is not enough in a directed graph. I need "visiting" for the current path and "done" for proven-safe nodes.'),
    })
    const dfs = course => {
      frames.push(`dfs(${course})`)
      if (color[course] === 1) {
        current = course
        t.step(L('return False', 0), {
          vars: { course, 'state[course]': 1 },
          panels: panels(),
          note: `${course} is already on the current path: cycle!`,
          say: 'I reached a node that is still visiting, so this is a back edge. That is a cycle, so return False.',
        })
        frames.pop()
        return false
      }
      if (color[course] === 2) {
        current = course
        t.step(L('return True', 0), {
          vars: { course, 'state[course]': 2 },
          panels: panels(),
          note: `${course} already proven safe: skip`,
          say: say('memo', 'Done nodes were already proven cycle-free. Skipping them keeps the whole thing O(V+E).'),
        })
        current = null
        frames.pop()
        return true
      }
      color[course] = 1
      current = course
      t.step(L('state[course] = 1'), { vars: { course, prereqs: [...graph[course]] }, panels: panels(), note: `Visiting ${course}: push onto path` })
      current = null
      for (const pre of graph[course]) {
        edgeState[`${course}->${pre}`] = 'active'
        const ok = dfs(pre)
        if (!ok) {
          edgeState[`${course}->${pre}`] = 'back'
          current = course
          t.step(L('return False', 1), { vars: { course, pre }, panels: panels(), note: 'Propagate failure up the stack' })
          frames.pop()
          return false
        }
        edgeState[`${course}->${pre}`] = 'tree'
      }
      color[course] = 2
      current = course
      t.step(L('state[course] = 2'), {
        vars: { course },
        panels: panels(),
        note: `All prereqs of ${course} safe: mark done`,
        say: say('done', 'Every prerequisite returned safe, so I pop this node off the path and mark it done.'),
      })
      current = null
      frames.pop()
      return true
    }
    for (let c = 0; c < numCourses; c++) {
      if (color[c] === 0) {
        t.step(L('for c in range(numCourses)'), { vars: { c }, panels: panels(), note: `Start DFS from course ${c}` })
      }
      if (!dfs(c)) {
        t.step(L('return False', 2), {
          vars: { c, answer: false },
          panels: panels(),
          note: 'Cycle found: impossible',
          say: 'Return False. O(V+E) time: each node finishes once, each edge is checked once.',
        })
        return
      }
    }
    t.step(L('return True', 2), {
      vars: { answer: true },
      panels: panels(),
      note: 'Every course done, no cycle',
      say: 'No back edge anywhere, so the graph is a DAG and all courses can be taken. O(V+E) time and space.',
    })
  },
}

const kahnCode = `from collections import defaultdict as dd, deque

class Solution:
    def findOrder(self, numCourses: int, prerequisites: List[List[int]]) -> List[int]:
        graph = dd(list)
        indegree = [0] * numCourses
        for course, pre in prerequisites:
            graph[pre].append(course)
            indegree[course] += 1

        queue = deque([c for c in range(numCourses) if indegree[c] == 0])
        order = []

        while queue:
            curr = queue.popleft()
            order.append(curr)
            for nxt in graph[curr]:
                indegree[nxt] -= 1
                if indegree[nxt] == 0:
                    queue.append(nxt)

        return order if len(order) == numCourses else []`

const traceKahn = {
  id: 'graphs-core:trace:course-schedule-ii',
  title: "Course schedule II (Kahn's topo sort)",
  skills: ['topo-sort', 'graph-bfs', 'queue-deque', 'communication'],
  problem: 'Return an order to take all courses, or [] if impossible.',
  code: kahnCode,
  complexity: { time: 'O(V+E)', space: 'O(V+E)', why: 'Each course enqueued once; each edge decrements one indegree once.' },
  inputs: [
    { label: 'DAG', value: courseInputs.dag },
    { label: 'cycle', value: courseInputs.cycle },
    { label: 'two chains', value: courseInputs.split },
  ],
  run(input, t) {
    const L = finder(kahnCode)
    const { numCourses, prerequisites } = input
    const graph = Array.from({ length: numCourses }, () => [])
    const indegree = Array(numCourses).fill(0)
    const nodes = circleLayout(Array.from({ length: numCourses }, (_, i) => i))
    const edges = prerequisites.map(([course, pre]) => ({ from: pre, to: course }))
    const state = {}
    const edgeState = {}
    const say = once()
    let queue = []
    const order = []
    const values = () => Object.fromEntries(indegree.map((d, i) => [i, `in ${d}`]))
    const panels = (hl = []) => [
      graphPanel({ label: 'prereq → course (value = indegree)', directed: true, nodes, edges, state, edgeState, values: values() }),
      queuePanel(queue),
      { kind: 'array', label: 'indegree', values: [...indegree], highlight: hl },
      { kind: 'array', label: 'order', values: [...order] },
    ]
    for (const [course, pre] of prerequisites) {
      graph[pre].push(course)
      indegree[course]++
    }
    t.step(L('indegree[course] += 1'), {
      vars: { indegree: [...indegree] },
      panels: panels(),
      note: 'Edge pre → course; indegree = unmet prereqs',
      say: say('indeg', 'Edges point from prerequisite to course. Indegree counts how many prerequisites are still unmet.'),
    })
    queue = []
    for (let c = 0; c < numCourses; c++) {
      if (indegree[c] === 0) {
        queue.push(c)
        state[c] = 'frontier'
      }
    }
    t.step(L('queue = deque('), {
      vars: { queue: [...queue] },
      panels: panels(),
      note: 'Indegree 0 = takeable right now',
      say: say('start', 'Anything with zero unmet prerequisites can be taken immediately, so they seed the queue.'),
    })
    while (queue.length) {
      const curr = queue.shift()
      state[curr] = 'current'
      order.push(curr)
      t.step(L('order.append(curr)'), {
        vars: { curr, order: [...order] },
        panels: panels(),
        note: `Take course ${curr}`,
      })
      for (const nxt of graph[curr]) {
        indegree[nxt]--
        edgeState[`${curr}->${nxt}`] = 'tree'
        const unlocked = indegree[nxt] === 0
        if (unlocked) {
          queue.push(nxt)
          state[nxt] = 'frontier'
        }
        t.step(L(unlocked ? 'queue.append(nxt)' : 'indegree[nxt] -= 1'), {
          vars: { curr, nxt, 'indegree[nxt]': indegree[nxt] },
          panels: panels([nxt]),
          note: unlocked ? `${nxt} has no prereqs left: enqueue` : `${nxt} still needs ${indegree[nxt]} more`,
          say: unlocked ? say('unlock', 'Removing curr erases its outgoing edges. When a course hits indegree 0, it is unlocked.') : undefined,
        })
      }
      state[curr] = 'done'
    }
    const ok = order.length === numCourses
    if (!ok) for (let i = 0; i < numCourses; i++) if (!order.includes(i)) state[i] = 'path'
    t.step(L('return order if len(order)'), {
      vars: { order: [...order], answer: ok ? [...order] : [] },
      panels: panels(),
      note: ok ? 'All courses ordered' : `Only ${order.length}/${numCourses}: pink nodes are stuck in a cycle`,
      say: ok
        ? "Kahn's: O(V+E). Each node enqueued once, each edge decremented once."
        : 'Courses on a cycle never reach indegree 0, so the order comes up short. Short order means a cycle, return [].',
    })
  },
}

const componentInputs = {
  three: { n: 6, edges: [[0, 1], [1, 2], [3, 4]] },
  one: { n: 5, edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]] },
  isolated: { n: 5, edges: [[0, 4], [2, 3]] },
}

const componentsCode = `from collections import defaultdict as dd

class Solution:
    def countComponents(self, n: int, edges: List[List[int]]) -> int:
        graph = dd(list)
        for a, b in edges:
            graph[a].append(b)
            graph[b].append(a)

        seen = set()

        def dfs(node):
            seen.add(node)
            for nei in graph[node]:
                if nei not in seen:
                    dfs(nei)

        result = 0
        for node in range(n):
            if node not in seen:
                dfs(node)
                result += 1

        return result`

const traceComponents = {
  id: 'graphs-core:trace:components',
  title: 'Count connected components (DFS)',
  skills: ['graph-dfs', 'graph-modeling'],
  problem: 'Given n nodes and undirected edges, count connected components.',
  code: componentsCode,
  complexity: { time: 'O(V+E)', space: 'O(V+E)', why: 'Each node added to seen once; each edge scanned twice (both directions).' },
  inputs: [
    { label: '3 parts', value: componentInputs.three },
    { label: 'one ring', value: componentInputs.one },
    { label: 'isolated nodes', value: componentInputs.isolated },
  ],
  run(input, t) {
    const L = finder(componentsCode)
    const { n, edges: edgeList } = input
    const graph = Array.from({ length: n }, () => [])
    for (const [a, b] of edgeList) {
      graph[a].push(b)
      graph[b].push(a)
    }
    const nodes = circleLayout(Array.from({ length: n }, (_, i) => i))
    const edges = edgeList.map(([a, b]) => ({ from: a, to: b }))
    const state = {}
    const edgeState = {}
    const values = {}
    const seen = new Set()
    const frames = []
    const say = once()
    let result = 0
    const panels = () => [
      graphPanel({ label: 'undirected graph (value = component)', nodes, edges, state, edgeState, values }),
      { kind: 'set', label: 'seen', items: [...seen] },
      callstackPanel(frames),
      { kind: 'text', text: `components = ${result}` },
    ]
    t.step(L('graph[b].append(a)'), {
      vars: { n, edges: edgeList.length },
      panels: panels(),
      note: 'Undirected: add the edge both ways',
      say: say('both', 'Undirected, so each edge goes in both adjacency lists. Forgetting one side is the classic bug.'),
    })
    const dfs = node => {
      frames.push(`dfs(${node})`)
      seen.add(node)
      state[node] = 'current'
      values[node] = letter(result)
      t.step(L('seen.add(node)'), { vars: { node }, panels: panels(), note: `Visit ${node}, component ${letter(result)}` })
      state[node] = 'path'
      for (const nei of graph[node]) {
        if (!seen.has(nei)) {
          markEdge(edgeState, node, nei, 'tree')
          dfs(nei)
          state[node] = 'path'
        }
      }
      state[node] = 'done'
      frames.pop()
    }
    for (let node = 0; node < n; node++) {
      if (!seen.has(node)) {
        t.step(L('if node not in seen'), {
          vars: { node, result },
          panels: panels(),
          note: `${node} unseen: new component`,
          say: result === 0 ? say('outer', 'The outer loop matters: DFS from one node only reaches its own component, so I try every node.') : undefined,
        })
        dfs(node)
        result++
        t.step(L('result += 1'), {
          vars: { result },
          panels: panels(),
          note: `Component ${letter(result - 1)} fully explored`,
          say: graph[node].length === 0 ? say('iso', 'Isolated nodes count too: no edges, but still their own component.') : undefined,
        })
      }
    }
    t.step(L('return result'), {
      vars: { result },
      panels: panels(),
      note: `${result} component(s)`,
      say: 'O(V+E) time and space. Union-Find also works, nearly O(E·α(V)), handy when edges stream in.',
    })
  },
}

const treeInputs = {
  valid: { n: 5, edges: [[0, 1], [0, 2], [0, 3], [1, 4]] },
  cycle: { n: 5, edges: [[0, 1], [1, 2], [2, 0], [3, 4]] },
  extra: { n: 4, edges: [[0, 1], [1, 2], [2, 3], [3, 1]] },
}

const validTreeCode = `from collections import defaultdict as dd

class Solution:
    def validTree(self, n: int, edges: List[List[int]]) -> bool:
        if len(edges) != n - 1:
            return False

        graph = dd(list)
        for a, b in edges:
            graph[a].append(b)
            graph[b].append(a)

        seen = set()

        def dfs(node, parent):
            if node in seen:
                return False
            seen.add(node)
            for nei in graph[node]:
                if nei == parent:
                    continue
                if not dfs(nei, node):
                    return False
            return True

        return dfs(0, -1) and len(seen) == n`

const traceValidTree = {
  id: 'graphs-core:trace:valid-tree',
  title: 'Graph valid tree (undirected cycle check)',
  skills: ['graph-dfs', 'graph-modeling', 'communication'],
  problem: 'Do n nodes and these undirected edges form exactly one tree?',
  code: validTreeCode,
  complexity: { time: 'O(V+E)', space: 'O(V+E)', why: 'One DFS over the adjacency list; E = n-1 after the early check.' },
  inputs: [
    { label: 'valid tree', value: treeInputs.valid },
    { label: 'cycle + split', value: treeInputs.cycle },
    { label: 'too many edges', value: treeInputs.extra },
  ],
  run(input, t) {
    const L = finder(validTreeCode)
    const { n, edges: edgeList } = input
    const nodes = circleLayout(Array.from({ length: n }, (_, i) => i))
    const edges = edgeList.map(([a, b]) => ({ from: a, to: b }))
    const state = {}
    const edgeState = {}
    const seen = new Set()
    const frames = []
    const say = once()
    const panels = () => [
      graphPanel({ label: 'undirected graph', nodes, edges, state, edgeState }),
      { kind: 'set', label: 'seen', items: [...seen] },
      callstackPanel(frames),
    ]
    t.step(L('if len(edges) != n - 1'), {
      vars: { n, edges: edgeList.length },
      panels: panels(),
      note: `Tree needs exactly n-1 = ${n - 1} edges`,
      say: say('count', 'A tree on n nodes has exactly n-1 edges. Fewer means disconnected, more means a cycle. Cheap O(1) filter.'),
    })
    if (edgeList.length !== n - 1) {
      t.step(L('return False', 0), { vars: { answer: false }, panels: panels(), note: 'Wrong edge count: not a tree' })
      return
    }
    const graph = Array.from({ length: n }, () => [])
    for (const [a, b] of edgeList) {
      graph[a].push(b)
      graph[b].push(a)
    }
    t.step(L('graph[b].append(a)'), { vars: {}, panels: panels(), note: 'Build undirected adjacency list' })
    const dfs = (node, parent) => {
      frames.push(`dfs(${node}, parent=${parent})`)
      if (seen.has(node)) {
        state[node] = 'path'
        t.step(L('return False', 1), {
          vars: { node, parent },
          panels: panels(),
          note: `${node} seen again via a non-parent edge: cycle`,
          say: 'Reaching a seen node through an edge that is not the one I came from means a second route: a cycle.',
        })
        frames.pop()
        return false
      }
      seen.add(node)
      state[node] = 'current'
      t.step(L('seen.add(node)'), {
        vars: { node, parent },
        panels: panels(),
        note: `Visit ${node} (came from ${parent})`,
        say: say('parent', 'Undirected edges show up both ways, so I pass the parent and skip it. Otherwise every edge looks like a cycle.'),
      })
      state[node] = 'visited'
      for (const nei of graph[node]) {
        if (nei === parent) continue
        markEdge(edgeState, node, nei, seen.has(nei) ? 'back' : 'tree')
        if (!dfs(nei, node)) {
          frames.pop()
          return false
        }
      }
      state[node] = 'done'
      frames.pop()
      return true
    }
    const acyclic = dfs(0, -1)
    const answer = acyclic && seen.size === n
    for (let i = 0; i < n; i++) if (!seen.has(i) && acyclic) state[i] = 'path'
    t.step(L('return dfs(0, -1) and len(seen) == n'), {
      vars: { acyclic, seen: seen.size, n, answer },
      panels: panels(),
      note: answer ? 'No cycle and all nodes reached: tree' : acyclic ? 'Some nodes unreachable' : 'Cycle found: not a tree',
      say: 'Tree means connected AND acyclic. O(V+E) time and space.',
    })
  },
}

const matrixGrids = {
  open: [
    [0, 0, 0],
    [1, 1, 0],
    [1, 1, 0],
  ],
  maze: [
    [0, 1, 0, 0],
    [0, 1, 0, 1],
    [0, 0, 0, 1],
    [1, 1, 0, 0],
  ],
  blocked: [
    [0, 1, 1],
    [1, 1, 0],
    [1, 0, 0],
  ],
}

const binaryMatrixCode = `from collections import deque

class Solution:
    def shortestPathBinaryMatrix(self, grid: List[List[int]]) -> int:
        n = len(grid)
        if grid[0][0] == 1 or grid[n - 1][n - 1] == 1:
            return -1

        directions = [(1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (1, -1), (-1, 1), (-1, -1)]
        queue = deque([(0, 0, 1)])
        seen = {(0, 0)}

        while queue:
            row, col, dist = queue.popleft()
            if row == n - 1 and col == n - 1:
                return dist
            for dr, dc in directions:
                nr, nc = row + dr, col + dc
                if 0 <= nr < n and 0 <= nc < n and grid[nr][nc] == 0 and (nr, nc) not in seen:
                    seen.add((nr, nc))
                    queue.append((nr, nc, dist + 1))

        return -1`

const traceBinaryMatrix = {
  id: 'graphs-core:trace:binary-matrix',
  title: 'Shortest path in binary matrix (BFS, 8 dirs)',
  skills: ['graph-bfs', 'grid', 'communication'],
  problem: 'Length of the shortest clear path (0 cells, 8-directional) from top-left to bottom-right.',
  code: binaryMatrixCode,
  complexity: { time: 'O(n²)', space: 'O(n²)', why: 'n² cells, each enqueued once, 8 neighbor checks each.' },
  inputs: [
    { label: 'open', value: matrixGrids.open },
    { label: 'maze', value: matrixGrids.maze },
    { label: 'blocked', value: matrixGrids.blocked },
  ],
  run(input, t) {
    const L = finder(binaryMatrixCode)
    const grid = input
    const n = grid.length
    const state = {}
    const values = {}
    const parent = {}
    const say = once()
    let queue = []
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (grid[r][c] === 1) state[cellKey(r, c)] = 'wall'
    const panels = () => [
      gridPanel('grid (value = path length so far)', grid, state, values),
      queuePanel(queue.map(([r, c, d]) => `(${r},${c}) d${d}`)),
    ]
    t.step(L('if grid[0][0] == 1'), {
      vars: { n },
      panels: panels(),
      note: 'Blocked start or end means no path',
      say: say('edge', 'Edge case first: if the start or end cell is blocked, answer -1 immediately.'),
    })
    if (grid[0][0] === 1 || grid[n - 1][n - 1] === 1) {
      t.step(L('return -1', 0), { vars: { answer: -1 }, panels: panels(), note: 'Return -1' })
      return
    }
    queue = [[0, 0, 1]]
    state[cellKey(0, 0)] = 'frontier'
    values[cellKey(0, 0)] = '1'
    t.step(L('seen = {(0, 0)}'), {
      vars: { queue: ['(0,0,1)'] },
      panels: panels(),
      note: 'Unweighted shortest path → BFS',
      say: say('why', 'Every move costs 1, so shortest path means BFS. The first time I pop the target, its distance is minimal.'),
    })
    while (queue.length) {
      const [row, col, dist] = queue.shift()
      state[cellKey(row, col)] = 'current'
      t.step(L('queue.popleft()'), { vars: { row, col, dist }, panels: panels(), note: `Pop (${row},${col}) at distance ${dist}` })
      if (row === n - 1 && col === n - 1) {
        let k = cellKey(row, col)
        while (k) {
          state[k] = 'path'
          k = parent[k]
        }
        t.step(L('return dist'), {
          vars: { dist },
          panels: panels(),
          note: `Reached the corner: ${dist} cells`,
          say: 'Target popped, so return. BFS guarantees no shorter path exists. O(n²) time and space.',
        })
        return
      }
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        const nr = row + dr
        const nc = col + dc
        const k = cellKey(nr, nc)
        if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] === 0 && !(k in values)) {
          values[k] = String(dist + 1)
          parent[k] = cellKey(row, col)
          queue.push([nr, nc, dist + 1])
          state[k] = 'frontier'
          t.step(L('queue.append((nr, nc, dist + 1))'), {
            vars: { nr, nc, dist: dist + 1 },
            panels: panels(),
            note: `Discover (${nr},${nc}) at ${dist + 1}`,
            say: say('diag', 'Eight directions here, diagonals included. Seen is updated on enqueue so each cell enters once.'),
          })
        }
      }
      state[cellKey(row, col)] = 'visited'
    }
    t.step(L('return -1', 1), { vars: { answer: -1 }, panels: panels(), note: 'Queue empty, target never reached: -1' })
  },
}

const ladderInputs = {
  classic: { beginWord: 'hit', endWord: 'cog', wordList: ['hot', 'dot', 'dog', 'lot', 'log', 'cog'] },
  missing: { beginWord: 'hit', endWord: 'cog', wordList: ['hot', 'dot', 'dog', 'lot', 'log'] },
  short: { beginWord: 'cold', endWord: 'warm', wordList: ['cord', 'card', 'ward', 'warm', 'corm', 'worm'] },
}

const ladderCode = `from collections import deque

class Solution:
    def ladderLength(self, beginWord: str, endWord: str, wordList: List[str]) -> int:
        words = set(wordList)
        if endWord not in words:
            return 0

        queue = deque([(beginWord, 1)])
        seen = {beginWord}

        while queue:
            word, steps = queue.popleft()
            if word == endWord:
                return steps
            for i in range(len(word)):
                for ch in "abcdefghijklmnopqrstuvwxyz":
                    nxt = word[:i] + ch + word[i + 1:]
                    if nxt in words and nxt not in seen:
                        seen.add(nxt)
                        queue.append((nxt, steps + 1))

        return 0`

const oneApart = (a, b) => {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++
  return diff === 1
}

const traceLadder = {
  id: 'graphs-core:trace:word-ladder',
  title: 'Word ladder (implicit graph BFS)',
  skills: ['graph-bfs', 'graph-modeling', 'communication'],
  problem: 'Fewest words from beginWord to endWord, changing one letter at a time, using only wordList words.',
  code: ladderCode,
  complexity: { time: 'O(N·L·26·L)', space: 'O(N·L)', why: 'N words dequeued once; each tries L·26 variants, each built in O(L).' },
  inputs: [
    { label: 'hit → cog', value: ladderInputs.classic },
    { label: 'end missing', value: ladderInputs.missing },
    { label: 'cold → warm', value: ladderInputs.short },
  ],
  run(input, t) {
    const L = finder(ladderCode)
    const { beginWord, endWord, wordList } = input
    const words = new Set(wordList)
    const all = [beginWord, ...wordList.filter(w => w !== beginWord)]
    const nodes = circleLayout(all, 0.4)
    const edges = []
    for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) if (oneApart(all[i], all[j])) edges.push({ from: all[i], to: all[j] })
    const state = {}
    const edgeState = {}
    const values = {}
    const parent = {}
    const say = once()
    let queue = []
    const panels = () => [
      graphPanel({ label: 'words = nodes, 1-letter diff = edge', nodes, edges, state, edgeState, values }),
      queuePanel(queue.map(([w, s]) => `${w}:${s}`)),
    ]
    t.step(L('words = set(wordList)'), {
      vars: { beginWord, endWord },
      panels: panels(),
      note: 'Implicit graph: neighbors generated on the fly',
      say: say('model', 'Words are nodes, one-letter changes are edges. Fewest transformations is an unweighted shortest path, so BFS.'),
    })
    if (!words.has(endWord)) {
      t.step(L('return 0', 0), {
        vars: { answer: 0 },
        panels: panels(),
        note: `${endWord} not in list: unreachable`,
        say: 'If endWord is not in the dictionary, there is no path at all. Return 0 before any work.',
      })
      return
    }
    queue = [[beginWord, 1]]
    state[beginWord] = 'frontier'
    values[beginWord] = '1'
    t.step(L('seen = {beginWord}'), {
      vars: { queue: [`${beginWord}:1`] },
      panels: panels(),
      note: 'Start counts as word 1',
      say: say('set', 'The word list goes in a set so neighbor lookups are O(1) instead of scanning the list.'),
    })
    while (queue.length) {
      const [word, steps] = queue.shift()
      state[word] = 'current'
      t.step(L('word, steps = queue.popleft()'), { vars: { word, steps }, panels: panels(), note: `Pop "${word}" at step ${steps}` })
      if (word === endWord) {
        let w = word
        while (w) {
          state[w] = 'path'
          if (parent[w]) markEdge(edgeState, parent[w], w, 'path')
          w = parent[w]
        }
        t.step(L('return steps'), {
          vars: { steps },
          panels: panels(),
          note: `Reached "${endWord}" in ${steps} words`,
          say: 'First time BFS pops the target is the shortest ladder. Time is O(N·L²·26) since each word tries 26·L variants of length L.',
        })
        return
      }
      for (let i = 0; i < word.length; i++) {
        for (const ch of 'abcdefghijklmnopqrstuvwxyz') {
          const nxt = word.slice(0, i) + ch + word.slice(i + 1)
          if (words.has(nxt) && !(nxt in values)) {
            values[nxt] = String(steps + 1)
            parent[nxt] = word
            queue.push([nxt, steps + 1])
            state[nxt] = 'frontier'
            markEdge(edgeState, word, nxt, 'tree')
            t.step(L('queue.append((nxt, steps + 1))'), {
              vars: { word, i, ch, nxt, steps: steps + 1 },
              panels: panels(),
              note: `Swap position ${i} → "${nxt}" (step ${steps + 1})`,
              say: say('gen', 'I generate neighbors by trying all 26 letters at each position. That is 26·L candidates, much cheaper than comparing against all N words.'),
            })
          }
        }
      }
      state[word] = 'visited'
    }
    t.step(L('return 0', 1), { vars: { answer: 0 }, panels: panels(), note: 'Queue empty: no ladder' })
  },
}

const boardInputs = {
  classic: [
    ['X', 'X', 'X', 'X'],
    ['X', 'O', 'O', 'X'],
    ['X', 'X', 'O', 'X'],
    ['X', 'O', 'X', 'X'],
  ],
  escape: [
    ['X', 'O', 'X', 'X', 'X'],
    ['X', 'O', 'O', 'X', 'X'],
    ['X', 'X', 'X', 'O', 'X'],
    ['X', 'O', 'O', 'O', 'X'],
    ['X', 'X', 'X', 'X', 'X'],
  ],
}

const surroundedCode = `class Solution:
    def solve(self, board: List[List[str]]) -> None:
        rows, cols = len(board), len(board[0])

        def dfs(row, col):
            if row < 0 or row >= rows or col < 0 or col >= cols or board[row][col] != "O":
                return
            board[row][col] = "T"
            dfs(row + 1, col)
            dfs(row - 1, col)
            dfs(row, col + 1)
            dfs(row, col - 1)

        for r in range(rows):
            for c in range(cols):
                if (r in [0, rows - 1] or c in [0, cols - 1]) and board[r][c] == "O":
                    dfs(r, c)

        for r in range(rows):
            for c in range(cols):
                if board[r][c] == "O":
                    board[r][c] = "X"
                elif board[r][c] == "T":
                    board[r][c] = "O"`

const traceSurrounded = {
  id: 'graphs-core:trace:surrounded-regions',
  title: 'Surrounded regions (protect from the border)',
  skills: ['grid', 'graph-dfs', 'graph-modeling', 'communication'],
  problem: 'Flip every O region not connected to the border into X, in place.',
  code: surroundedCode,
  complexity: { time: 'O(r·c)', space: 'O(r·c)', why: 'Each O marked T at most once, then one final pass.' },
  inputs: [
    { label: 'classic', value: boardInputs.classic },
    { label: 'escape route', value: boardInputs.escape },
  ],
  run(input, t) {
    const L = finder(surroundedCode)
    const board = clone(input)
    const rows = board.length
    const cols = board[0].length
    const state = {}
    const frames = []
    const say = once()
    const panels = () => [gridPanel('board (T = safe, touches border)', board, state), callstackPanel(frames)]
    t.step(L('rows, cols = len(board)'), {
      vars: { rows, cols },
      panels: panels(),
      note: 'Invert: find O regions that CAN escape',
      say: say('invert', 'Instead of proving a region is surrounded, I find the regions that touch the border. Everything else gets captured.'),
    })
    const dfs = (row, col) => {
      if (row < 0 || row >= rows || col < 0 || col >= cols || board[row][col] !== 'O') return
      frames.push(`dfs(${row},${col})`)
      board[row][col] = 'T'
      state[cellKey(row, col)] = 'current'
      t.step(L('board[row][col] = "T"'), {
        vars: { row, col },
        panels: panels(),
        note: `(${row},${col}) connects to the border: mark T`,
        say: say('temp', 'A temporary "T" marks safe cells and doubles as visited, so DFS never loops.'),
      })
      state[cellKey(row, col)] = 'frontier'
      for (const [dr, dc] of fourDirs) dfs(row + dr, col + dc)
      frames.pop()
    }
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if ((r === 0 || r === rows - 1 || c === 0 || c === cols - 1) && board[r][c] === 'O') {
          t.step(L('if (r in [0, rows - 1]'), { vars: { r, c }, panels: panels(), note: `Border O at (${r},${c}): start DFS` })
          dfs(r, c)
        }
      }
    }
    t.step(L('for r in range(rows):', 1), {
      vars: {},
      panels: panels(),
      note: 'Plain O left = surrounded',
      say: say('flip', 'Any O still plain could not reach the border, so it is captured. T goes back to O.'),
    })
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (board[r][c] === 'O') {
          board[r][c] = 'X'
          state[cellKey(r, c)] = 'path'
          t.step(L('board[r][c] = "X"'), { vars: { r, c }, panels: panels(), note: `Capture (${r},${c})` })
        } else if (board[r][c] === 'T') {
          board[r][c] = 'O'
          state[cellKey(r, c)] = 'done'
        }
      }
    }
    t.step(L('board[r][c] = "O"'), {
      vars: {},
      panels: panels(),
      note: 'Safe cells restored to O',
      say: 'Border DFS plus one sweep: O(r·c) time, O(r·c) worst-case recursion.',
    })
  },
}

const traces = [
  traceIslandsDfs,
  traceIslandsBfs,
  traceMaxArea,
  traceRotting,
  traceTreasure,
  tracePacific,
  traceClone,
  traceCourse,
  traceKahn,
  traceComponents,
  traceValidTree,
  traceBinaryMatrix,
  traceLadder,
  traceSurrounded,
]

const g = (label, ids, pairs, opts = {}) =>
  graphPanel({
    label,
    directed: !!opts.directed,
    nodes: opts.nodes || circleLayout(ids),
    edges: pairs.map(([from, to]) => ({ from, to })),
    state: opts.state || {},
    edgeState: opts.edgeState || {},
    values: opts.values || {},
  })

const demoIds = ['A', 'B', 'C', 'D', 'E', 'F']
const demoEdges = [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D'], ['D', 'E'], ['E', 'F']]

const lessons = [
  {
    id: 'graphs-core:lesson:spot-the-graph',
    title: 'Spot the graph in disguise',
    skills: ['graph-modeling', 'communication'],
    slides: [
      {
        title: 'Graph = things + connections',
        panels: [g('nodes + edges', demoIds, demoEdges)],
        points: ['Node: a thing.', 'Edge: "can go from this to that".'],
      },
      {
        title: 'Grid = graph',
        panels: [gridPanel('cell = node, 4 neighbors = edges', islandGrids.three, { '1,1': 'current', '0,1': 'frontier', '1,0': 'frontier', '2,1': 'frontier', '1,2': 'frontier' })],
        points: ['Each cell is a node.', 'Up/down/left/right are edges. No adjacency list needed.'],
      },
      {
        title: 'Words = graph',
        panels: [g('one-letter change = edge', ['hit', 'hot', 'dot', 'lot', 'dog', 'cog'], [['hit', 'hot'], ['hot', 'dot'], ['hot', 'lot'], ['dot', 'dog'], ['dog', 'cog'], ['dot', 'lot']])],
        points: ['Word ladder: edges are generated, never stored.'],
      },
      {
        title: 'Dependencies = directed graph',
        panels: [g('prereq → course', [0, 1, 2, 3], [[0, 1], [0, 2], [1, 3], [2, 3]], { directed: true })],
        points: ['Courses, build steps, recipes.', 'Order needed → topological sort.'],
      },
      {
        title: 'States = graph',
        points: ['Lock combos, puzzle boards, (position, keys held).', 'Each state is a node; one move is an edge.', 'Fewest moves → BFS.'],
      },
      {
        title: 'Trigger words',
        points: ['connected, reachable, islands, regions', 'minimum steps / moves / transformations', 'prerequisites, order, dependencies'],
        ask: {
          q: '"Minimum number of single-digit turns to open a lock" is…',
          choices: ['DP over digits', 'BFS over lock states', 'Greedy per digit', 'Binary search'],
          answer: 1,
          why: 'Each combo is a node, each turn an edge with cost 1. Fewest moves = BFS.',
        },
      },
      {
        title: 'Say it out loud',
        points: ['"Nodes are ___, edges are ___."', '"I want ___ (reachability / shortest / order)."', 'Then pick DFS, BFS, or topo.'],
      },
    ],
  },
  {
    id: 'graphs-core:lesson:representations',
    title: 'Representations: list, matrix, grid',
    skills: ['graph-modeling', 'ds-diagnosis'],
    slides: [
      {
        title: 'Edge list (what you are given)',
        code: `edges = [[0, 1], [0, 2], [1, 3], [2, 3]]`,
        points: ['Easy to read, slow to query.', 'Convert it first.'],
      },
      {
        title: 'Adjacency list (default)',
        code: `from collections import defaultdict as dd

graph = dd(list)
for a, b in edges:
    graph[a].append(b)
    graph[b].append(a)`,
        highlight: 6,
        points: ['O(V+E) space.', 'Undirected: add both ways.'],
      },
      {
        title: 'When nodes are 0..n-1',
        code: `graph = {i: [] for i in range(n)}
for course, pre in prerequisites:
    graph[course].append(pre)`,
        points: ['Every node gets a key, even isolated ones.'],
      },
      {
        title: 'Adjacency matrix',
        panels: [{ kind: 'table', label: 'matrix[a][b] = 1 if edge', rows: [[0, 1, 1, 0], [1, 0, 0, 1], [1, 0, 0, 1], [0, 1, 1, 0]], rowLabels: ['0', '1', '2', '3'], colLabels: ['0', '1', '2', '3'], highlight: ['0,1', '1,0'] }],
        points: ['O(V²) space. O(1) edge check.', 'Only for small dense graphs.'],
      },
      {
        title: 'Implicit grid neighbors',
        code: `directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]
for dr, dc in directions:
    nr, nc = row + dr, col + dc
    if 0 <= nr < rows and 0 <= nc < cols:
        pass`,
        highlight: 4,
        points: ['Bounds check, then the cell rule.'],
      },
      {
        title: 'Pick one',
        points: ['Given edges → dd(list).', 'Grid → directions list.', 'Neighbors computable → generate on the fly.'],
        ask: {
          q: 'V = 10^5, E = 2·10^5. Best representation?',
          choices: ['Adjacency matrix', 'Adjacency list', 'Edge list scanned each time', 'Nested set of pairs only'],
          answer: 1,
          why: 'Matrix needs 10^10 cells. List is O(V+E) and iterates neighbors directly.',
        },
      },
    ],
  },
  {
    id: 'graphs-core:lesson:dfs',
    title: 'DFS: go deep, back up',
    skills: ['graph-dfs', 'communication'],
    slides: [
      {
        title: 'The idea',
        panels: [g('DFS from A', demoIds, demoEdges, { state: { A: 'done', B: 'done', D: 'path', E: 'current', C: 'visited' }, edgeState: { 'A->B': 'tree', 'B->D': 'tree', 'D->E': 'active' } })],
        points: ['Follow one path as far as possible.', 'Dead end → back up.'],
      },
      {
        title: 'Recursive template',
        code: `seen = set()

def dfs(node):
    seen.add(node)
    for nei in graph[node]:
        if nei not in seen:
            dfs(nei)`,
        highlight: 4,
        points: ['Mark first, then explore.'],
      },
      {
        title: 'Iterative with a stack',
        code: `stack = [start]
seen = {start}
while stack:
    node = stack.pop()
    for nei in graph[node]:
        if nei not in seen:
            seen.add(nei)
            stack.append(nei)`,
        highlight: 4,
        points: ['Same O(V+E). No recursion limit.'],
      },
      {
        title: 'Call stack = path',
        panels: [callstackPanel(['dfs(A)', 'dfs(B)', 'dfs(D)', 'dfs(E)'])],
        points: ['Frames on the stack are the current path.', 'Depth can reach V.'],
      },
      {
        title: 'Python recursion limit',
        points: ['Default ~1000 frames.', '300×300 grid island = 90,000 deep → crash.', 'Say it; offer iterative or BFS.'],
        code: `import sys
sys.setrecursionlimit(10**6)`,
      },
      {
        title: 'Why O(V+E)',
        points: ['Each node marked once: V.', 'Each adjacency entry scanned once: E (2E undirected).'],
        ask: {
          q: 'DFS on a grid with r·c cells costs…',
          choices: ['O(r·c)', 'O((r·c)²)', 'O(4^(r·c))', 'O(r + c)'],
          answer: 0,
          why: 'V = r·c and E ≤ 4·r·c, so O(V+E) = O(r·c).',
        },
      },
    ],
  },
  {
    id: 'graphs-core:lesson:bfs',
    title: 'BFS: ripples, layers, shortest paths',
    skills: ['graph-bfs', 'queue-deque', 'communication'],
    slides: [
      {
        title: 'Ripples outward',
        panels: [g('BFS from A (value = distance)', demoIds, demoEdges, { state: { A: 'done', B: 'done', C: 'done', D: 'current', E: 'frontier' }, values: { A: '0', B: '1', C: '1', D: '2', E: '3' } })],
        points: ['Visit all distance 1, then 2, then 3.'],
      },
      {
        title: 'Template',
        code: `from collections import deque

queue = deque([start])
seen = {start}
while queue:
    node = queue.popleft()
    for nei in graph[node]:
        if nei not in seen:
            seen.add(nei)
            queue.append(nei)`,
        highlight: 9,
        points: ['deque: popleft is O(1). list.pop(0) is O(n).'],
      },
      {
        title: 'Mark on ENQUEUE',
        panels: [g('B and C both see D', ['A', 'B', 'C', 'D'], [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D']], { state: { A: 'done', B: 'current', C: 'frontier', D: 'frontier' } })],
        points: ['Mark on pop → D queued twice.', 'Mark on push → each node once.'],
      },
      {
        title: 'Shortest path, unweighted',
        code: `while queue:
    for _ in range(len(queue)):
        node = queue.popleft()
        if node == target:
            return steps
    steps += 1`,
        highlight: 2,
        points: ['Snapshot len(queue) = one layer.', 'First pop of target = shortest.'],
      },
      {
        title: 'Multi-source BFS',
        panels: [gridPanel('all rotten oranges start together', orangeGrids.twoSources, { '0,0': 'frontier', '2,3': 'frontier', '1,1': 'wall', '0,3': 'wall', '2,0': 'wall' }, { '0,0': '0', '2,3': '0' })],
        points: ['Seed the queue with EVERY source.', 'Distance to nearest source, one pass.'],
      },
      {
        title: 'Check yourself',
        ask: {
          q: 'Edges have weights 1 or 5. Plain BFS gives shortest paths?',
          choices: ['Yes, always', 'No, use Dijkstra (or 0-1 style tricks)', 'Yes if graph is a DAG', 'Only with DFS'],
          answer: 1,
          why: 'BFS counts edges, not cost. Unequal weights break layer order.',
        },
        points: ['BFS = shortest by edge count only.'],
      },
    ],
  },
  {
    id: 'graphs-core:lesson:grids',
    title: 'Grids and components',
    skills: ['grid', 'graph-dfs', 'graph-bfs'],
    slides: [
      {
        title: 'The skeleton',
        code: `rows, cols = len(grid), len(grid[0])

def dfs(row, col):
    if row < 0 or row >= rows or col < 0 or col >= cols or grid[row][col] == "0":
        return
    grid[row][col] = "0"
    for dr, dc in directions:
        dfs(row + dr, col + dc)`,
        highlight: 4,
        points: ['Guard, mark, recurse.'],
      },
      {
        title: 'Count components',
        panels: [gridPanel('one outer-loop call per island', islandGrids.three, { '0,0': 'visited', '0,1': 'visited', '1,0': 'visited', '1,1': 'visited', '2,2': 'current' }, { '0,0': 'A', '0,1': 'A', '1,0': 'A', '1,1': 'A', '2,2': 'B' })],
        points: ['Loop every cell. Unvisited land → flood it, count += 1.'],
      },
      {
        title: 'Mark visited: 2 ways',
        points: ['Mutate grid (sink to "0"): O(1) extra.', 'seen set of (r, c): keeps input intact.', 'Ask if mutation is OK.'],
      },
      {
        title: 'Start from the edges',
        panels: [gridPanel('pacific/atlantic: climb from borders', heightsGrids.small, { '0,0': 'frontier', '0,1': 'frontier', '0,2': 'path', '1,0': 'frontier', '2,0': 'path', '1,1': 'path' }, {})],
        points: ['Pacific Atlantic, surrounded regions.', 'Search FROM the target, not to it.'],
      },
      {
        title: 'Complexity',
        points: ['Time O(r·c): each cell once, 4 checks.', 'Space O(r·c): seen or recursion worst case.'],
        ask: {
          q: 'Grid 1000×1000, island-counting DFS in Python. Main risk?',
          choices: ['Time limit', 'RecursionError on a big island', 'Integer overflow', 'Hash collisions'],
          answer: 1,
          why: '10^6 cells could be one island; recursion depth explodes past ~1000. Use BFS or an explicit stack.',
        },
      },
    ],
  },
  {
    id: 'graphs-core:lesson:cycles',
    title: 'Cycle detection: directed vs undirected',
    skills: ['graph-dfs', 'topo-sort'],
    slides: [
      {
        title: 'Undirected: track parent',
        panels: [g('C sees A, A is not its parent → cycle', ['A', 'B', 'C'], [['A', 'B'], ['B', 'C'], ['C', 'A']], { state: { A: 'visited', B: 'visited', C: 'current' }, edgeState: { 'A->B': 'tree', 'B->C': 'tree', 'C->A': 'back', 'A->C': 'back' } })],
        points: ['Seen neighbor that is not my parent = cycle.'],
      },
      {
        title: 'Undirected code',
        code: `def dfs(node, parent):
    if node in seen:
        return False
    seen.add(node)
    for nei in graph[node]:
        if nei == parent:
            continue
        if not dfs(nei, node):
            return False
    return True`,
        highlight: 6,
      },
      {
        title: 'Directed: seen is not enough',
        panels: [g('D reached twice, no cycle', ['A', 'B', 'C', 'D'], [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D']], { directed: true, state: { D: 'done', B: 'done', C: 'current', A: 'path' } })],
        points: ['Diamond: D seen again, but it is safe.'],
      },
      {
        title: '3 colors',
        code: `state = [0] * n

def dfs(node):
    if state[node] == 1:
        return False
    if state[node] == 2:
        return True
    state[node] = 1
    for nei in graph[node]:
        if not dfs(nei):
            return False
    state[node] = 2
    return True`,
        highlight: 4,
        points: ['0 new · 1 on path · 2 done.', 'Hit a 1 → back edge → cycle.'],
      },
      {
        title: 'Path set version',
        points: ['Your style: add to path set, remove after loop.', 'Plus memo of done nodes, or it is exponential.'],
        ask: {
          q: 'Path-set DFS without a done memo on a big DAG is…',
          choices: ['Still O(V+E)', 'Possibly exponential', 'Wrong answers', 'O(V log V)'],
          answer: 1,
          why: 'Without marking finished nodes, shared sub-DAGs are re-explored from every path.',
        },
      },
    ],
  },
  {
    id: 'graphs-core:lesson:topo',
    title: "Topological sort: Kahn's and DFS",
    skills: ['topo-sort', 'graph-bfs', 'graph-dfs'],
    slides: [
      {
        title: 'What it is',
        panels: [g('one valid order: 0, 1, 2, 3', [0, 1, 2, 3], [[0, 1], [0, 2], [1, 3], [2, 3]], { directed: true, values: { 0: '#1', 1: '#2', 2: '#3', 3: '#4' } })],
        points: ['Every edge u → v: u comes first.', 'Only exists for DAGs.'],
      },
      {
        title: "Kahn's: peel indegree 0",
        panels: [g('value = indegree', [0, 1, 2, 3], [[0, 1], [0, 2], [1, 3], [2, 3]], { directed: true, state: { 0: 'frontier' }, values: { 0: 'in 0', 1: 'in 1', 2: 'in 1', 3: 'in 2' } })],
        points: ['Queue all indegree-0 nodes.', 'Pop, append, decrement neighbors.'],
      },
      {
        title: "Kahn's code",
        code: `queue = deque([c for c in range(n) if indegree[c] == 0])
order = []
while queue:
    curr = queue.popleft()
    order.append(curr)
    for nxt in graph[curr]:
        indegree[nxt] -= 1
        if indegree[nxt] == 0:
            queue.append(nxt)`,
        highlight: 8,
        points: ['len(order) < n → cycle.'],
      },
      {
        title: 'DFS postorder',
        code: `def dfs(node):
    state[node] = 1
    for nei in graph[node]:
        if state[nei] == 0:
            dfs(nei)
    state[node] = 2
    order.append(node)

order.reverse()`,
        highlight: 7,
        points: ['Append when finished. Reverse at the end.'],
      },
      {
        title: 'Which one?',
        points: ["Kahn's: iterative, cycle check for free, easy to narrate.", 'DFS: shorter if already doing 3-color.'],
        ask: {
          q: "Kahn's finishes with order of length 4, n = 6. Meaning?",
          choices: ['Two isolated nodes', 'A cycle blocks 2 nodes', 'Bug: impossible', 'Graph is disconnected'],
          answer: 1,
          why: 'Isolated nodes have indegree 0 and get output. Missing nodes never hit 0: they sit on or behind a cycle.',
        },
      },
    ],
  },
  {
    id: 'graphs-core:lesson:choose-and-narrate',
    title: 'DFS or BFS? And how to say it',
    skills: ['graph-dfs', 'graph-bfs', 'communication', 'complexity'],
    slides: [
      {
        title: 'Decision guide',
        points: ['Shortest / fewest steps, unweighted → BFS.', 'Reachability, components, flood fill → either (DFS shorter).', 'Cycles, topo, path state → DFS.'],
      },
      {
        title: 'More signals',
        points: ['Nearest from many sources → multi-source BFS.', 'Order with dependencies → topo sort.', 'Huge depth in Python → BFS or iterative.'],
      },
      {
        title: 'Complexity script',
        points: ['"V nodes, E edges. Each node visited once, each edge checked once: O(V+E)."', 'Grid: V = r·c, E ≈ 4·r·c.'],
      },
      {
        title: 'Narration: before code',
        points: ['"Nodes are cells, edges are 4 neighbors."', '"I want the minimum steps, so BFS."', '"Mark visited on enqueue."'],
      },
      {
        title: 'Narration: while coding',
        points: ['"Bounds check, then wall check."', '"Snapshot queue size: one layer per step."', '"Return when I first pop the target."'],
      },
      {
        title: 'Narration: after',
        points: ['Trace a 3×3 example aloud.', 'Edge cases: empty, all water, unreachable, start = end.'],
        ask: {
          q: 'Fewest knight moves on an infinite board from (0,0) to (x,y). First choice?',
          choices: ['DFS with memo', 'BFS over positions', 'Greedy toward target', 'Topological sort'],
          answer: 1,
          why: 'Each move has cost 1: unweighted shortest path. BFS (bounded box) is the baseline.',
        },
      },
    ],
  },
]

const cardRows = [
  [['graph-modeling'], 'What makes a problem a graph problem?', 'Things (nodes) plus a relation saying which things connect (edges). Ask: what is a node, what is an edge?'],
  [['graph-modeling', 'grid'], 'Grid as a graph: nodes and edges?', 'Each cell is a node. Edges go to the 4 (or 8) neighbors that pass the cell rule. No adjacency list needed.'],
  [['graph-modeling'], 'Word ladder: nodes and edges?', 'Words are nodes. Two words share an edge if they differ by exactly one letter. Generate neighbors on the fly.'],
  [['graph-modeling', 'topo-sort'], 'Course prerequisites: what graph?', 'Directed graph. Edge pre → course (or course → pre). Cycle = impossible. Order = topological sort.'],
  [['graph-modeling'], 'State-space graph?', 'Each configuration (lock combo, board, position+keys) is a node; one legal move is an edge. Fewest moves → BFS.'],
  [['graph-modeling'], 'Signals for graph traversal', '"connected", "islands", "regions", "reachable", "minimum steps/moves", "transform", "prerequisites", "dependencies".'],
  [['graph-modeling', 'ds-diagnosis'], 'Default graph representation?', 'Adjacency list: dd(list). O(V+E) space, iterate neighbors directly.', `graph = dd(list)
for a, b in edges:
    graph[a].append(b)
    graph[b].append(a)`],
  [['graph-modeling'], 'Undirected edge list → adjacency list: classic bug?', 'Adding only one direction. Undirected edges go in BOTH lists.'],
  [['graph-modeling'], 'Adjacency matrix: when?', 'Small dense graphs or O(1) edge-exists queries. Costs O(V²) space; never for V = 10^5.'],
  [['graph-modeling'], 'Why {i: [] for i in range(n)} over dd(list)?', 'Every node gets a key, including isolated ones, so loops over graph see all n nodes.'],
  [['grid'], 'Grid neighbor idiom', 'A directions list and one loop with a bounds check.', `for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
    nr, nc = row + dr, col + dc
    if 0 <= nr < rows and 0 <= nc < cols:`],
  [['grid'], 'Mark visited in a grid: two options', 'Mutate the grid (sink "1"→"0"): O(1) extra. Or a seen set of (r, c) to keep input intact. Ask if mutation is allowed.'],
  [['graph-dfs'], 'DFS in one sentence', 'Go as deep as possible along one path, back up at dead ends. Stack (call stack or explicit).'],
  [['graph-dfs'], 'DFS recursive template', 'Mark, then visit unseen neighbors.', `def dfs(node):
    seen.add(node)
    for nei in graph[node]:
        if nei not in seen:
            dfs(nei)`],
  [['graph-dfs', 'stack'], 'DFS iterative template', 'Explicit stack. Avoids recursion limits.', `stack = [start]
seen = {start}
while stack:
    node = stack.pop()
    for nei in graph[node]:
        if nei not in seen:
            seen.add(nei)
            stack.append(nei)`],
  [['graph-dfs'], 'Python recursion limit risk', 'Default ~1000 frames. A big grid island or long chain can be 10^5 deep → RecursionError. Mention it; use BFS or a stack.'],
  [['graph-dfs'], 'sys.setrecursionlimit: full fix?', 'Partial. Deep recursion can still overflow the C stack and crash. Iterative is the safe fix.'],
  [['graph-dfs', 'complexity'], 'Why is DFS O(V+E)?', 'Each node is marked once (V). Each adjacency entry is scanned once (E, or 2E undirected).'],
  [['graph-dfs'], 'What does the DFS call stack hold?', 'The current path from the start node. Max depth up to V.'],
  [['graph-bfs'], 'BFS in one sentence', 'Explore in rings: all nodes at distance 1, then 2, then 3. FIFO queue.'],
  [['graph-bfs', 'queue-deque'], 'BFS template', 'deque, mark on enqueue.', `queue = deque([start])
seen = {start}
while queue:
    node = queue.popleft()
    for nei in graph[node]:
        if nei not in seen:
            seen.add(nei)
            queue.append(nei)`],
  [['graph-bfs'], 'Why mark visited on ENQUEUE?', 'Otherwise a node can be queued by several neighbors before it is popped: duplicates and extra work; still correct, but the queue can blow up.'],
  [['graph-bfs', 'queue-deque'], 'Why deque, not list?', 'deque.popleft() is O(1). list.pop(0) shifts everything: O(n) per pop, O(n²) total.'],
  [['graph-bfs'], 'Why does BFS give shortest paths?', 'Nodes leave the queue in nondecreasing distance. First time a node is reached is via the fewest edges.'],
  [['graph-bfs'], 'When does BFS NOT give shortest paths?', 'Weighted edges with different costs. Use Dijkstra (non-negative weights).'],
  [['graph-bfs'], 'Level-by-level BFS trick', 'Snapshot size = len(queue), pop exactly that many, then steps += 1.', `for _ in range(len(queue)):
    node = queue.popleft()`],
  [['graph-bfs'], 'Multi-source BFS', 'Seed the queue with ALL sources at distance 0. Gives distance to the nearest source in one O(V+E) pass.'],
  [['graph-bfs', 'grid'], 'Rotting oranges: key moves', 'Queue all rotten, count fresh. BFS by minute. Answer = layers; fresh left → -1.'],
  [['graph-bfs', 'grid'], 'Walls and gates: why from the gates?', 'BFS from each room is O((r·c)²). One multi-source BFS from all gates is O(r·c).'],
  [['graph-bfs', 'complexity'], 'BFS space on a grid?', 'O(r·c) for seen. The queue frontier is often ~O(min(r,c)) but plan for O(r·c).'],
  [['graph-dfs', 'graph-bfs'], 'DFS or BFS: fewest steps?', 'BFS. DFS finds A path, not the shortest.'],
  [['graph-dfs', 'graph-bfs'], 'DFS or BFS: count components?', 'Either. DFS is shorter to write; BFS avoids recursion depth.'],
  [['graph-dfs', 'graph-bfs'], 'DFS or BFS: detect a cycle in a directed graph?', "DFS with 3 colors, or Kahn's (BFS) and check if all nodes were output."],
  [['graph-dfs'], 'Connected components recipe', 'Loop over every node; if unseen, DFS from it and count += 1.'],
  [['graph-dfs'], 'Undirected cycle detection', 'DFS with parent. A seen neighbor that is not the parent means a cycle.'],
  [['graph-dfs', 'topo-sort'], 'Why is seen not enough for directed cycles?', 'A diamond A→B→D, A→C→D reaches D twice with no cycle. Need "on current path" vs "finished".'],
  [['graph-dfs', 'topo-sort'], 'The 3 colors', '0 = unvisited, 1 = visiting (on stack), 2 = done. Edge into a 1 = back edge = cycle.'],
  [['graph-dfs', 'topo-sort'], 'Path-set cycle DFS: what else is needed?', 'A memo of finished nodes (empty their list, or state 2). Without it, shared subgraphs re-run: exponential.'],
  [['graph-dfs'], 'Graph valid tree: two conditions', 'Connected AND acyclic. Shortcut: exactly n-1 edges and connected.'],
  [['graph-dfs'], 'Why len(edges) != n-1 → not a tree?', 'Every tree on n nodes has n-1 edges. Fewer: disconnected. More: a cycle.'],
  [['topo-sort'], 'Topological order definition', 'An ordering where every edge u → v has u before v. Exists only for DAGs.'],
  [['topo-sort'], "Kahn's algorithm", 'Queue all indegree-0 nodes. Pop, output, decrement neighbors; enqueue any that hit 0.'],
  [['topo-sort'], "Kahn's: detect a cycle", 'If output length < n, some nodes never reached indegree 0: there is a cycle.'],
  [['topo-sort'], 'DFS topo sort', 'Append each node AFTER all its neighbors finish (postorder). Reverse the list at the end.'],
  [['topo-sort'], 'Topo sort complexity', 'O(V+E) time, O(V+E) space for graph + indegrees + queue.'],
  [['topo-sort'], 'Edge direction for Kahn on courses', 'pre → course. Indegree of course = number of unmet prereqs.'],
  [['topo-sort', 'graph-modeling'], 'Alien dictionary: graph?', 'Letters are nodes. First differing char of adjacent words gives edge a → b. Topo sort letters.'],
  [['graph-dfs'], 'Clone graph: why a map old → new?', 'Visited set and lookup in one. Lets cycles reuse the existing copy instead of looping forever.'],
  [['graph-dfs'], 'Clone graph: when to store in the map?', 'Right after creating the copy, BEFORE recursing into neighbors. Otherwise a cycle creates duplicates.'],
  [['graph-dfs', 'grid'], 'Pacific Atlantic trick', 'Reverse the flow: DFS uphill from each ocean border. Answer = intersection of two reachable sets.'],
  [['graph-dfs', 'grid'], 'Surrounded regions trick', 'DFS from border O cells, mark safe (T). Flip remaining O → X, then T → O.'],
  [['graph-dfs', 'grid'], 'Max area of island: contract', 'dfs(r, c) returns cells sunk from here: 1 + sum of 4 neighbor calls; 0 for water/out of bounds.'],
  [['graph-bfs', 'grid'], 'Shortest path in binary matrix: gotchas', '8 directions. Blocked start or end → -1. Path length counts cells, so start at 1.'],
  [['graph-bfs', 'graph-modeling'], 'Word ladder neighbor generation', 'For each position try 26 letters, keep those in the word set. O(26·L) candidates, each O(L) to build.'],
  [['graph-bfs'], 'Word ladder complexity', 'O(N · L² · 26): N words, L positions × 26 letters, O(L) to build/hash each candidate.'],
  [['complexity', 'grid'], 'Grid r·c ≤ 10^5: target complexity', 'O(r·c). One traversal, each cell O(1) work.'],
  [['complexity', 'graph-modeling'], 'V, E ≤ 10^5: target complexity', 'O(V+E), or O((V+E) log V) if a heap is involved.'],
  [['communication', 'graph-bfs'], 'Say this before BFS code', '"Nodes are __, edges are __. Unweighted shortest path, so BFS. I mark visited when I enqueue."'],
  [['communication', 'graph-dfs'], 'Say this before DFS code', '"dfs(node) explores everything reachable. Base case: out of bounds or visited. Mark, then recurse on neighbors."'],
  [['communication', 'graph-modeling'], 'Edge cases to mention for graphs', 'Empty input, single node, disconnected parts, cycles, self-loops, duplicate edges, unreachable target.'],
]

const flashcards = cardRows.map(([skills, front, back, code], i) => ({
  id: `graphs-core:card:${i + 1}`,
  skills,
  front,
  back,
  ...(code ? { code } : {}),
}))

const mcqRows = [
  [['graph-modeling'], 1, 'Grid of 1s and 0s, count groups of touching 1s. What are the edges?', ['Every pair of 1s', 'Adjacent 1-cells (up/down/left/right)', 'Each row to the next row', 'Cells with the same value anywhere'], 1, 'Connectivity is local: a land cell links to land neighbors. Counting groups = counting components.'],
  [['graph-modeling'], 2, '"Minimum number of moves to solve a sliding puzzle." Best model?', ['DP over tile values', 'BFS where each board state is a node', 'Greedy: move the most misplaced tile', 'Topological sort of tiles'], 1, 'States are nodes, one move = one edge of cost 1. Fewest moves = BFS shortest path.'],
  [['graph-modeling', 'topo-sort'], 1, 'Tasks with "A must finish before B". Need a valid run order. Which?', ['BFS shortest path', 'Topological sort', 'Union-Find', 'Binary search'], 1, 'Dependencies form a directed graph; a valid order is a topological order.'],
  [['graph-modeling'], 2, 'Word ladder with N = 5000 words of length L = 5. Neighbor generation choice?', ['Compare each word with all N words: O(N·L)', 'Try 26 letters at each position: O(26·L) candidates', 'Sort words and binary search', 'Build an adjacency matrix'], 1, '26·5 = 130 candidates per word beats 5000 comparisons, and set lookups are O(L).'],
  [['graph-modeling', 'ds-diagnosis'], 1, 'V = 10^5, E = 10^5 sparse graph. Representation?', ['Adjacency matrix', 'Adjacency list (dd(list))', 'Sorted edge list only', 'Nested dict of booleans for all pairs'], 1, 'A matrix would be 10^10 cells. Adjacency list is O(V+E).'],
  [['graph-modeling'], 2, 'You build an undirected graph but only do graph[a].append(b). Symptom?', ['Nothing, DFS handles it', 'Some reachable nodes are never visited', 'Infinite recursion', 'Duplicate visits'], 1, 'Traversal from b cannot step to a, so components look split.'],
  [['graph-modeling'], 2, 'Graph built with dd(list) from edges. n = 5 but node 4 has no edges. Looping "for node in graph" misses…', ['Nothing', 'Node 4', 'Node 0', 'All nodes'], 1, 'dd(list) only creates keys that were touched. Loop over range(n) or prefill keys.'],
  [['graph-modeling'], 3, 'Bus routes: fewest buses from stop S to T. Best node choice for BFS?', ['Stops only, edge per consecutive stop pair', 'Routes as nodes (or stop+route layers), cost per bus boarded', 'Every (stop, time) pair', 'Sort stops and two-pointer'], 1, 'Cost counts buses, not stops. Treat routes as nodes so each BFS layer is one more bus.'],
  [['graph-dfs'], 1, 'What data structure does recursive DFS implicitly use?', ['Queue', 'Call stack', 'Heap', 'Hash map'], 1, 'Each recursive call pushes a frame; returning pops it. Last in, first out.'],
  [['graph-dfs'], 1, 'DFS on V nodes and E edges with an adjacency list costs…', ['O(V)', 'O(E log V)', 'O(V+E)', 'O(V·E)'], 2, 'Each node marked once, each adjacency entry scanned once.'],
  [['graph-dfs'], 2, 'Python DFS on a 500×500 all-land grid. Most likely failure?', ['Time limit exceeded', 'RecursionError', 'Wrong count', 'MemoryError from the grid'], 1, '250,000 cells can be one path of recursive calls; default limit is about 1000.'],
  [['graph-dfs'], 2, 'Where should seen.add(node) go in recursive DFS?', ['After visiting all neighbors', 'At the start of dfs(node), before neighbors', 'Only on leaves', 'Anywhere, it does not matter'], 1, 'Marking late lets a cycle re-enter the node, causing repeats or infinite recursion.'],
  [['graph-dfs', 'stack'], 2, 'Iterative DFS pops from the end of a list. Swap pop() for pop(0)?', ['Still DFS', 'Becomes BFS order (but O(n) per pop)', 'Becomes topological sort', 'Crashes'], 1, 'Front removal is FIFO: BFS order. On a list that is O(n) each time, so use deque.'],
  [['graph-dfs'], 3, 'Grid DFS checks bounds INSIDE the call (top of dfs). Versus checking before calling, this…', ['Changes complexity to O(4^n)', 'Makes up to 4x more calls but same O(r·c)', 'Is incorrect for corners', 'Needs a seen set'], 1, 'Each cell spawns 4 calls, many returning immediately. Still constant work per cell.'],
  [['graph-dfs'], 2, 'Number of islands, grid "0"/"1". After dfs(r, c) from the outer loop returns, what is true?', ['Only (r, c) was sunk', 'The whole island containing (r, c) is sunk', 'All islands are sunk', 'The row r is sunk'], 1, 'DFS floods every land cell reachable from (r, c): exactly one component.'],
  [['graph-dfs'], 2, 'Max area of island returns 1 + dfs(4 neighbors). Why sink BEFORE the recursive calls?', ['Style only', 'Else neighbors call back into it and count it again', 'Python needs it', 'To save memory'], 1, 'The neighbor sees an unsunk cell and recurses back, double counting or looping.'],
  [['graph-dfs', 'grid'], 3, 'Number of islands must not modify the grid. Extra space?', ['O(1)', 'O(r + c)', 'O(r·c) seen set', 'O(log(r·c))'], 2, 'Without sinking, you need a seen structure sized to the cells visited.'],
  [['graph-dfs'], 2, 'Count components: n = 6, edges [[0,1],[2,3]]. Answer?', ['2', '3', '4', '6'], 2, '{0,1}, {2,3}, {4}, {5}. Isolated nodes are components.'],
  [['graph-dfs'], 2, 'Undirected cycle check: why skip the parent?', ['Speed only', 'The edge back to the parent is the same edge, not a cycle', 'Parent is always unvisited', 'To avoid self-loops'], 1, 'Undirected edges appear both ways. Without skipping, every edge looks like a cycle.'],
  [['graph-dfs'], 3, 'Undirected graph with parallel edges a-b twice. Parent-skip DFS will…', ['Detect a cycle correctly (two edges = cycle)', 'Miss it, since both point to the parent', 'Crash', 'Loop forever'], 1, 'Skipping by node id skips both copies. Track the edge id if duplicates matter.'],
  [['graph-dfs'], 2, 'Graph valid tree: n = 4, edges = 3, but DFS from 0 reaches 3 nodes. Answer?', ['True', 'False: disconnected', 'False: cycle', 'Depends on order'], 1, 'n-1 edges but not connected means some other part has a cycle. Not a tree.'],
  [['graph-dfs'], 1, 'n = 5, edges = 5. Can it be a tree?', ['Yes if connected', 'No: a tree has exactly n-1 = 4 edges', 'Yes if no self-loops', 'Only if directed'], 1, 'Any extra edge beyond n-1 creates a cycle.'],
  [['graph-dfs'], 2, 'Clone graph: what goes wrong if you add to oldToNew AFTER the neighbor loop?', ['Nothing', 'Cycles recurse forever / duplicate clones', 'Edges reversed', 'Only values wrong'], 1, 'A neighbor pointing back cannot find the in-progress clone, so it starts cloning again.'],
  [['graph-dfs'], 2, 'Clone graph time with V nodes and E edges?', ['O(V)', 'O(V+E)', 'O(V²)', 'O(E log V)'], 1, 'Each node cloned once; each neighbor reference appended once.'],
  [['graph-dfs', 'grid'], 2, 'Pacific Atlantic: DFS from ocean borders steps to a neighbor when…', ['neighbor < current height', 'neighbor ≥ current height', 'neighbor == current height', 'always'], 1, 'Reverse flow: water from the higher neighbor could flow down to us.'],
  [['graph-dfs', 'grid'], 2, 'Pacific Atlantic brute force (DFS downhill from every cell) costs…', ['O(r·c)', 'O((r·c)²)', 'O(r·c log(r·c))', 'O(2^(r·c))'], 1, 'Each of r·c starts may explore r·c cells. Border-first makes it O(r·c).'],
  [['graph-dfs', 'grid'], 2, 'Surrounded regions: why start DFS from the border?', ['Border cells are larger', 'Safe regions are exactly those touching the border', 'It is faster to index', 'Interior cells are always X'], 1, 'Mark escapable O cells, then everything else is captured. Easier than proving enclosure.'],
  [['graph-dfs', 'topo-sort'], 2, 'Directed graph A→B, A→C, B→D, C→D. A seen-set DFS reports a cycle when it re-reaches D. Correct?', ['Yes, D twice means cycle', 'No, a diamond is acyclic', 'Yes, any repeat is a cycle', 'Only if D has outgoing edges'], 1, 'In directed graphs reaching a FINISHED node is fine. Only an on-path node means a cycle.'],
  [['graph-dfs', 'topo-sort'], 2, '3-color DFS hits a neighbor with state 1. Meaning?', ['Already finished: skip', 'On the current path: cycle', 'Unvisited: recurse', 'Isolated'], 1, 'State 1 = visiting. An edge to it is a back edge.'],
  [['graph-dfs', 'topo-sort'], 3, 'Path-set course DFS (add, recurse, remove) without memoizing finished courses. Worst case?', ['O(V+E)', 'Exponential on DAGs with shared subpaths', 'O(V log V)', 'O(E²)'], 1, 'Each path re-explores shared descendants. Your submission fixed this by setting courses[c] = [] after success.'],
  [['graph-dfs', 'topo-sort'], 1, 'Course schedule with courses = 2000, prereqs = 5000. Target complexity?', ['O(V·E)', 'O(V+E)', 'O(V²·E)', 'O(2^V)'], 1, 'One DFS or Kahn pass touches each node and edge a constant number of times.'],
  [['topo-sort'], 1, "Kahn's algorithm starts with…", ['The node with most edges', 'All nodes with indegree 0', 'Node 0', 'A random node'], 1, 'Indegree 0 means no unmet prerequisites: safe to output first.'],
  [['topo-sort'], 2, "Kahn's output has length < n. Conclusion?", ['Graph disconnected', 'Graph has a cycle', 'Bug in indegree', 'Graph is a tree'], 1, 'Nodes on a cycle (and behind it) never reach indegree 0.'],
  [['topo-sort'], 2, 'Edges pre → course. After popping curr in Kahn, we…', ['Increment indegree of curr', 'Decrement indegree of each course curr unlocks', 'Remove curr from the queue again', 'Reset all indegrees'], 1, 'Taking curr satisfies one prerequisite for each outgoing neighbor.'],
  [['topo-sort'], 2, 'DFS topo sort: when is a node appended to order?', ['When first discovered', 'After all its descendants finish (postorder)', 'Before checking neighbors', 'Never, use a queue'], 1, 'Postorder puts dependencies first; reverse at the end (for u→v meaning u first).'],
  [['topo-sort'], 3, 'Graph has edges u → v meaning "u before v". DFS postorder list is [D, B, C, A]. Valid order?', ['[D, B, C, A]', '[A, C, B, D]', '[B, D, A, C]', '[A, B, D, C]'], 1, 'Postorder finishes sinks first; reversing gives sources first.'],
  [['topo-sort'], 2, 'How many topological orders can a DAG have?', ['Exactly one', 'At least one; possibly many', 'Zero or one', 'Always n!'], 1, 'Independent nodes can be ordered freely. Unique only if a Hamiltonian path exists.'],
  [['topo-sort', 'graph-modeling'], 3, 'Alien dictionary: words ["abc", "ab"]. What should happen?', ['Order "abc"', 'Return "" (invalid: prefix after longer word)', 'Edge c → b', 'Ignore the pair'], 1, 'A longer word before its own prefix is impossible in any ordering.'],
  [['graph-bfs'], 1, 'BFS uses which data structure?', ['Stack', 'FIFO queue', 'Min-heap', 'Set only'], 1, 'First in, first out processes nodes in order of distance.'],
  [['graph-bfs', 'queue-deque'], 2, 'BFS with list.pop(0) on 10^5 nodes. Problem?', ['None', 'Each pop is O(n): O(n²) total', 'Breaks FIFO order', 'Uses too much memory'], 1, 'Lists shift every element on front removal. deque.popleft() is O(1).'],
  [['graph-bfs'], 2, 'BFS marks visited when POPPING instead of enqueuing. Effect?', ['Wrong shortest distances always', 'Nodes can be enqueued many times: extra work', 'Infinite loop always', 'No effect'], 1, 'Several neighbors may enqueue the same node before it is popped. Correct but wasteful.'],
  [['graph-bfs'], 2, 'Why does the first pop of the target give the shortest path?', ['Queue is sorted by value', 'BFS pops in nondecreasing distance order', 'Target has smallest id', 'DFS backtracks'], 1, 'All distance-d nodes are processed before any distance-(d+1) node.'],
  [['graph-bfs'], 2, 'Unweighted graph, shortest path from s to t. Which is correct AND efficient?', ['DFS taking the first path found', 'BFS from s', 'DFS exploring all paths', 'Topological sort'], 1, 'DFS finds A path. Exploring all paths is exponential. BFS is O(V+E).'],
  [['graph-bfs'], 2, 'Edge weights are 1 or 2. Fastest correct choice?', ['Plain BFS', 'Dijkstra (or split weight-2 edges)', 'DFS', "Kahn's"], 1, 'BFS assumes equal weights. Dijkstra handles it; splitting 2-edges into two 1-edges also works.'],
  [['graph-bfs'], 2, 'Level-by-level BFS: why "for _ in range(len(queue))"?', ['To sort the queue', 'Process exactly one layer before steps += 1', 'To avoid duplicates', 'Python requires it'], 1, 'len is evaluated once, so children added this round wait for the next layer.'],
  [['graph-bfs', 'grid'], 2, 'Rotting oranges: why put ALL rotten oranges in the queue first?', ['Saves memory', 'They all spread simultaneously; layer = minute', 'Order does not matter, any start works', 'To count fresh'], 1, 'Multi-source BFS models simultaneous spread. Starting from one source gives wrong times.'],
  [['graph-bfs', 'grid'], 2, 'Rotting oranges returns -1 when…', ['Queue starts empty', 'Fresh oranges remain after BFS ends', 'Grid has empty cells', 'Minutes > rows'], 1, 'Unreachable fresh oranges never rot.'],
  [['graph-bfs', 'grid'], 3, 'Rotting grid with no fresh oranges and some rotten. Expected answer?', ['-1', '0', '1', 'number of rotten'], 1, 'Nothing to rot: 0 minutes. Loop condition "while queue and fresh" handles it.'],
  [['graph-bfs', 'grid'], 2, 'Walls and gates: BFS from every room separately costs…', ['O(r·c)', 'O((r·c)²)', 'O(r·c·log)', 'O(r + c)'], 1, 'r·c BFS runs of O(r·c) each. Multi-source from gates is one O(r·c) pass.'],
  [['graph-bfs', 'grid'], 2, 'Walls and gates: grid[nr][nc] == INF check serves as…', ['Wall detection', 'The visited check', 'Gate detection', 'Bounds check'], 1, 'Once a cell gets a distance it is final, so INF means unvisited.'],
  [['graph-bfs', 'grid'], 2, 'Shortest path in binary matrix: path length for a 1×1 grid [[0]]?', ['0', '1', '-1', '2'], 1, 'Length counts cells visited, so start at 1.'],
  [['graph-bfs', 'grid'], 2, 'Shortest path in binary matrix allows moves in…', ['4 directions', '8 directions', 'Only right/down', '2 directions'], 1, 'The problem allows diagonal moves. Forgetting them is a common bug.'],
  [['graph-bfs'], 2, 'Word ladder: why remove/mark words as seen when enqueued?', ['To shrink memory', 'Each word should be reached once at its shortest distance', 'Required by sets', 'To sort output'], 1, 'Later reaches are never shorter in BFS. Marking prevents re-queueing.'],
  [['graph-bfs'], 3, 'Word ladder: endWord not in wordList. Answer?', ['1', '0', '-1', 'Depends on beginWord'], 1, 'The last word must be in the list. Return 0 immediately.'],
  [['graph-bfs'], 3, 'Bidirectional BFS on a graph with branching factor b and distance d explores roughly…', ['b^d', '2·b^(d/2)', 'b·d', 'd^b'], 1, 'Two searches meet in the middle, each going half the depth.'],
  [['graph-dfs', 'graph-bfs'], 1, 'Count islands: DFS or BFS?', ['Only DFS works', 'Only BFS works', 'Either, same O(r·c)', 'Neither, needs Union-Find'], 2, 'Both flood fill one component. BFS avoids recursion depth issues.'],
  [['graph-dfs', 'graph-bfs'], 2, 'Detect a cycle in a directed graph. Valid approaches?', ['Only Union-Find', '3-color DFS or Kahn (count output)', 'BFS with seen set alone', 'Sorting edges'], 1, 'Union-Find is for undirected. A seen set alone fails on diamonds.'],
  [['graph-dfs', 'graph-bfs'], 2, 'Minimum knight moves on an 8×8 board. Pick:', ['DFS', 'BFS', 'Greedy', 'Topo sort'], 1, 'Each move costs 1: unweighted shortest path.'],
  [['graph-dfs', 'graph-bfs'], 2, 'Need all paths from source to target in a DAG. Pick:', ['BFS shortest path', 'DFS with backtracking', "Kahn's", 'Union-Find'], 1, 'Enumerating paths is backtracking DFS; output can be exponential.'],
  [['complexity', 'grid'], 1, 'Grid up to 300×300. Which complexity is safe?', ['O((r·c)²)', 'O(r·c)', 'O(2^(r·c))', 'O((r·c)³)'], 1, '9·10^4 cells; squared is 8·10^9, too slow. Linear is instant.'],
  [['complexity', 'graph-bfs'], 2, 'BFS on a grid: E in O(V+E) is about…', ['r + c', '4·r·c', '(r·c)²', 'log(r·c)'], 1, 'Each cell has up to 4 neighbor edges, so E is O(r·c).'],
  [['complexity', 'graph-dfs'], 2, 'Space for recursive DFS on a path graph of n nodes?', ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], 2, 'Recursion depth equals the path length.'],
  [['grid'], 1, 'directions = [(1,0),(-1,0),(0,1),(0,-1)]. Valid neighbor check?', ['0 < nr < rows', '0 <= nr < rows and 0 <= nc < cols', 'nr < rows or nc < cols', 'nr >= 0 and nc >= 0'], 1, 'Both coordinates must be in range on both ends.'],
  [['grid'], 2, 'Number of islands with grid values as STRINGS "1"/"0". Bug: if grid[r][c] == 1. Result?', ['Works', 'Always returns 0', 'Crashes', 'Counts water'], 1, '"1" != 1 in Python. Read the input type.'],
  [['grid'], 2, 'Grid DFS without any visited marking on a 2×2 all-land grid. Result?', ['Returns 1', 'Infinite recursion', 'Returns 4', 'Returns 0'], 1, 'Neighbors call each other back and forth forever.'],
  [['grid', 'graph-dfs'], 3, 'Count distinct island SHAPES. Key extra idea?', ['Sort islands by size', 'Record a normalized path/offset signature per island in a set', 'Union-Find only', 'BFS distances'], 1, 'Offsets from the island start (or DFS move string) canonicalize shape.'],
  [['communication'], 1, 'Best first sentence after reading a grid islands prompt?', ['"Let me code DFS."', '"Cells are nodes, adjacent land cells are edges; I will count components."', '"Is this DP?"', '"I will use a heap."'], 1, 'Name the model first. It tells the interviewer your plan in one line.'],
  [['communication', 'graph-bfs'], 2, 'Interviewer: "Why BFS and not DFS here?" (min steps). Best answer?', ['"BFS is faster."', '"BFS explores by distance, so the first time I reach the target is the shortest."', '"DFS uses recursion."', '"Habit."'], 1, 'Tie the choice to the guarantee BFS gives.'],
  [['communication', 'graph-dfs'], 2, 'Interviewer asks about grid DFS risks in Python. Best mention?', ['GIL', 'Recursion depth limit on large islands; BFS or iterative fix', 'Integer overflow', 'Hash randomization'], 1, 'Shows you know the real production failure mode.'],
  [['graph-modeling', 'graph-bfs'], 3, 'Open the lock (4 wheels, deadends). Nodes ~10^4. Approach and cost?', ['DFS, O(4^10)', 'BFS over 10^4 states × 8 moves', 'DP over digits', 'Greedy per wheel'], 1, '10^4 states, 8 neighbors each: about 8·10^4 edges. Tiny for BFS.'],
]

const rotate = (choices, answer, shift) => ({
  choices: choices.map((_, j) => choices[(j + shift) % choices.length]),
  answer: (answer - shift + choices.length) % choices.length,
})

const mcqs = mcqRows.map(([skills, difficulty, q, choices, answer, why, code], i) => ({
  id: `graphs-core:mcq:${i + 1}`,
  skills,
  difficulty,
  q,
  ...(code ? { code } : {}),
  ...rotate(choices, answer, (i * 7 + 2) % 4),
  why,
}))

const clozeRows = [
  [['graph-dfs', 'grid'], 'Number of islands: sink', `def dfs(row, col):
    if row < 0 or row >= rows or col < 0 or col >= cols or grid[row][col] == "0":
        [[return]]
    grid[row][col] = [["0"|'0']]
    dfs(row + 1, col)
    dfs(row - 1, col)
    dfs(row, col + 1)
    dfs(row, col - 1)

for r in range(rows):
    for c in range(cols):
        if grid[r][c] == "1":
            dfs(r, c)
            islands [[+= 1]]`, 'Mark visited by sinking land.'],
  [['graph-bfs', 'queue-deque'], 'BFS template', `queue = [[deque]]([start])
seen = {start}
while queue:
    node = queue.[[popleft()]]
    for nei in graph[node]:
        if nei not in seen:
            seen.[[add]](nei)
            queue.append(nei)`, 'O(1) pops from the front.'],
  [['graph-dfs'], 'Recursive DFS', `seen = set()

def dfs(node):
    seen.add(node)
    for nei in [[graph]][node]:
        if nei [[not in]] seen:
            dfs(nei)`],
  [['graph-dfs', 'stack'], 'Iterative DFS', `stack = [start]
seen = {start}
while stack:
    node = stack.[[pop()]]
    for nei in graph[node]:
        if nei not in seen:
            seen.add(nei)
            stack.[[append]](nei)`],
  [['graph-modeling'], 'Undirected adjacency list', `graph = dd([[list]])
for a, b in edges:
    graph[a].append([[b]])
    graph[b].append([[a]])`, 'Both directions.'],
  [['grid'], 'Grid neighbors with bounds', `directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]
for dr, dc in directions:
    nr, nc = row + [[dr]], col + [[dc]]
    if 0 <= nr < [[rows]] and 0 <= nc < [[cols]]:
        visit(nr, nc)`],
  [['graph-bfs', 'grid'], 'Rotting oranges layer loop', `while queue and fresh:
    for _ in range([[len(queue)]]):
        row, col = queue.popleft()
        for dr, dc in directions:
            nr, nc = row + dr, col + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == [[1]]:
                grid[nr][nc] = 2
                fresh [[-= 1]]
                queue.append((nr, nc))
    minutes [[+= 1]]`],
  [['graph-dfs', 'topo-sort'], '3-color cycle check', `def dfs(course):
    if state[course] == [[1]]:
        return False
    if state[course] == [[2]]:
        return True
    state[course] = 1
    for pre in graph[course]:
        if not dfs(pre):
            return [[False]]
    state[course] = [[2]]
    return True`, '1 = on current path.'],
  [['topo-sort'], "Kahn's algorithm", `queue = deque([c for c in range(n) if indegree[c] == [[0]]])
order = []
while queue:
    curr = queue.popleft()
    order.append([[curr]])
    for nxt in graph[curr]:
        indegree[nxt] [[-= 1]]
        if indegree[nxt] == 0:
            queue.append(nxt)

return order if len(order) == [[n|numCourses]] else []`],
  [['graph-dfs'], 'Undirected cycle with parent', `def dfs(node, parent):
    if node in seen:
        return False
    seen.add(node)
    for nei in graph[node]:
        if nei == [[parent]]:
            [[continue]]
        if not dfs(nei, [[node]]):
            return False
    return True`],
  [['graph-dfs'], 'Clone graph', `def dfs(node):
    if node in oldToNew:
        return [[oldToNew]][node]
    clone = Node(node.val)
    oldToNew[node] = [[clone]]
    for neighbor in node.neighbors:
        clone.neighbors.append([[dfs(neighbor)]])
    return clone`, 'Store before recursing.'],
  [['graph-dfs', 'grid'], 'Max area of island', `def dfs(row, col):
    if row < 0 or row >= rows or col < 0 or col >= cols or grid[row][col] == 0:
        return [[0]]
    grid[row][col] = 0
    return [[1]] + dfs(row + 1, col) + dfs(row - 1, col) + dfs(row, col + 1) + dfs(row, col - 1)

for r in range(rows):
    for c in range(cols):
        if grid[r][c] == 1:
            biggest = [[max]](biggest, dfs(r, c))`],
  [['graph-bfs'], 'Shortest path layers', `steps = 0
while queue:
    for _ in range(len(queue)):
        node = queue.popleft()
        if node == [[target]]:
            return [[steps]]
        for nei in graph[node]:
            if nei not in seen:
                seen.add(nei)
                queue.append(nei)
    steps [[+= 1]]
return -1`],
  [['graph-dfs', 'grid'], 'Pacific Atlantic reverse flow', `def dfs(row, col, oceanSet, prevHeight):
    if (row, col) in oceanSet or row < 0 or row >= rows or col < 0 or col >= cols or heights[row][col] [[<]] prevHeight:
        return
    oceanSet.[[add]]((row, col))
    dfs(row + 1, col, oceanSet, heights[row][col])
    dfs(row - 1, col, oceanSet, heights[row][col])
    dfs(row, col + 1, oceanSet, heights[row][col])
    dfs(row, col - 1, oceanSet, heights[row][col])`, 'Climb uphill from the ocean.'],
]

const clozes = clozeRows.map(([skills, title, code, hint], i) => ({
  id: `graphs-core:cloze:${i + 1}`,
  skills,
  title,
  code,
  ...(hint ? { hint } : {}),
}))

const parsonsRows = [
  [['graph-bfs', 'queue-deque'], 'BFS shortest steps', [
    'queue = deque([start])',
    'seen = {start}',
    'steps = 0',
    'while queue:',
    '    for _ in range(len(queue)):',
    '        node = queue.popleft()',
    '        if node == target:',
    '            return steps',
    '        for nei in graph[node]:',
    '            if nei not in seen:',
    '                seen.add(nei)',
    '                queue.append(nei)',
    '    steps += 1',
    'return -1',
  ], ['        node = queue.pop()', '    seen.add(node)']],
  [['graph-dfs', 'grid'], 'Number of islands', [
    'rows, cols, islands = len(grid), len(grid[0]), 0',
    'def dfs(row, col):',
    '    if row < 0 or row >= rows or col < 0 or col >= cols or grid[row][col] == "0":',
    '        return',
    '    grid[row][col] = "0"',
    '    for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:',
    '        dfs(row + dr, col + dc)',
    'for r in range(rows):',
    '    for c in range(cols):',
    '        if grid[r][c] == "1":',
    '            dfs(r, c)',
    '            islands += 1',
    'return islands',
  ], ['            islands += dfs(r, c)']],
  [['topo-sort'], "Kahn's topological sort", [
    'graph = dd(list)',
    'indegree = [0] * numCourses',
    'for course, pre in prerequisites:',
    '    graph[pre].append(course)',
    '    indegree[course] += 1',
    'queue = deque([c for c in range(numCourses) if indegree[c] == 0])',
    'order = []',
    'while queue:',
    '    curr = queue.popleft()',
    '    order.append(curr)',
    '    for nxt in graph[curr]:',
    '        indegree[nxt] -= 1',
    '        if indegree[nxt] == 0:',
    '            queue.append(nxt)',
  ], ['    indegree[pre] += 1']],
  [['graph-dfs', 'topo-sort'], 'Course schedule (3 colors)', [
    'state = [0] * numCourses',
    'def dfs(course):',
    '    if state[course] == 1:',
    '        return False',
    '    if state[course] == 2:',
    '        return True',
    '    state[course] = 1',
    '    for pre in graph[course]:',
    '        if not dfs(pre):',
    '            return False',
    '    state[course] = 2',
    '    return True',
  ], ['    state[course] = 0']],
  [['graph-bfs', 'grid'], 'Rotting oranges setup', [
    'rows, cols = len(grid), len(grid[0])',
    'queue, fresh, minutes = deque(), 0, 0',
    'for r in range(rows):',
    '    for c in range(cols):',
    '        if grid[r][c] == 2:',
    '            queue.append((r, c))',
    '        elif grid[r][c] == 1:',
    '            fresh += 1',
  ], ['            fresh -= 1']],
  [['graph-dfs'], 'Count connected components (graph built)', [
    'seen = set()',
    'def dfs(node):',
    '    seen.add(node)',
    '    for nei in graph[node]:',
    '        if nei not in seen:',
    '            dfs(nei)',
    'result = 0',
    'for node in range(n):',
    '    if node not in seen:',
    '        dfs(node)',
    '        result += 1',
  ], ['for node in graph:']],
  [['graph-dfs'], 'Clone graph', [
    'oldToNew = {}',
    'def dfs(node):',
    '    if node in oldToNew:',
    '        return oldToNew[node]',
    '    clone = Node(node.val)',
    '    oldToNew[node] = clone',
    '    for neighbor in node.neighbors:',
    '        clone.neighbors.append(dfs(neighbor))',
    '    return clone',
    'return dfs(node) if node else None',
  ]],
  [['graph-dfs', 'stack'], 'Iterative DFS', [
    'stack = [start]',
    'seen = {start}',
    'while stack:',
    '    node = stack.pop()',
    '    for nei in graph[node]:',
    '        if nei not in seen:',
    '            seen.add(nei)',
    '            stack.append(nei)',
  ], ['    node = stack.popleft()']],
  [['graph-dfs'], 'Graph valid tree', [
    'if len(edges) != n - 1:',
    '    return False',
    'seen = set()',
    'def dfs(node, parent):',
    '    if node in seen:',
    '        return False',
    '    seen.add(node)',
    '    for nei in graph[node]:',
    '        if nei == parent:',
    '            continue',
    '        if not dfs(nei, node):',
    '            return False',
    '    return True',
    'return dfs(0, -1) and len(seen) == n',
  ]],
  [['graph-dfs', 'grid'], 'Surrounded regions final sweep', [
    'for r in range(rows):',
    '    for c in range(cols):',
    '        if (r in [0, rows - 1] or c in [0, cols - 1]) and board[r][c] == "O":',
    '            dfs(r, c)',
    'for r in range(rows):',
    '    for c in range(cols):',
    '        if board[r][c] == "O":',
    '            board[r][c] = "X"',
    '        elif board[r][c] == "T":',
    '            board[r][c] = "O"',
  ]],
]

const parsons = parsonsRows.map(([skills, title, lines, distractors], i) => ({
  id: `graphs-core:parsons:${i + 1}`,
  skills,
  title,
  lines,
  ...(distractors ? { distractors } : {}),
}))

const problem = fields => ({ google: true, ...fields, id: `graphs-core:problem:${fields.lc}` })

const problems = [
  problem({
    lc: 200,
    title: 'Number of Islands',
    difficulty: 'Medium',
    skills: ['grid', 'graph-dfs', 'graph-bfs', 'graph-modeling'],
    pattern: 'Grid flood fill / components',
    ds: ['grid', 'recursion stack'],
    constraints: '1 ≤ m, n ≤ 300, grid[i][j] is "0" or "1"',
    time: 'O(m·n)',
    space: 'O(m·n)',
    insight: 'Each DFS from the outer loop sinks exactly one island. Count the calls.',
    signals: ['connected horizontally or vertically', 'number of islands', 'grid of "1"/"0"'],
    narration: [
      'Cells are nodes, adjacent land is an edge: count components.',
      'Can I modify the grid? Then sink visited land to "0".',
      'Outer loop over cells; unvisited land → DFS, islands += 1.',
      'O(m·n) time; recursion up to m·n deep, BFS if that worries us.',
    ],
    solution: islandsDfsCode,
    traceId: 'graphs-core:trace:islands-dfs',
    pitfalls: ['Strings "1" not ints', 'Deep recursion on 300×300 all-land grid', 'Forgetting to mark before recursing'],
  }),
  problem({
    lc: 695,
    title: 'Max Area of Island',
    difficulty: 'Medium',
    skills: ['grid', 'graph-dfs'],
    pattern: 'Grid DFS returning size',
    ds: ['grid'],
    constraints: '1 ≤ m, n ≤ 50',
    time: 'O(m·n)',
    space: 'O(m·n)',
    insight: 'dfs returns 1 + the four neighbor results; 0 for water.',
    signals: ['largest island', 'area', 'connected 1s'],
    narration: [
      'Same as islands, but dfs returns how many cells it sank.',
      'Base: out of bounds or water returns 0.',
      'Sink, then 1 + four recursive calls.',
      'Track biggest in the outer loop. O(m·n).',
    ],
    solution: maxAreaCode,
    traceId: 'graphs-core:trace:max-area',
    pitfalls: ['Sinking after the recursive calls double counts', 'All water returns 0'],
  }),
  problem({
    lc: 994,
    title: 'Rotting Oranges',
    difficulty: 'Medium',
    skills: ['graph-bfs', 'grid', 'queue-deque'],
    pattern: 'Multi-source BFS by layers',
    ds: ['deque', 'grid'],
    constraints: '1 ≤ m, n ≤ 10',
    time: 'O(m·n)',
    space: 'O(m·n)',
    insight: 'All rotten oranges spread at once: seed the queue with all of them, one layer per minute.',
    signals: ['every minute', 'adjacent', 'minimum time until', 'simultaneously'],
    narration: [
      'Rot spreads from every rotten orange at the same time: multi-source BFS.',
      'Queue all rotten, count fresh.',
      'Process level by level with len(queue); each level is a minute.',
      'Fresh left → -1. O(m·n) time and space.',
    ],
    solution: rottingCode,
    traceId: 'graphs-core:trace:rotting-oranges',
    pitfalls: ['No fresh at start → 0', 'Counting the last empty layer as a minute', 'Marking rotten on pop'],
  }),
  problem({
    lc: 286,
    title: 'Walls and Gates (Islands and Treasure)',
    difficulty: 'Medium',
    skills: ['graph-bfs', 'grid'],
    pattern: 'Multi-source BFS distance fill',
    ds: ['deque', 'grid'],
    constraints: '1 ≤ m, n ≤ 250',
    time: 'O(m·n)',
    space: 'O(m·n)',
    insight: 'BFS from all gates together; INF doubles as the unvisited marker.',
    signals: ['distance to nearest', 'fill each empty room', 'INF', 'gates'],
    narration: [
      'Distance to the NEAREST gate: BFS outward from all gates at once.',
      'Queue every 0 cell first.',
      'Neighbor still INF → set dist + 1, enqueue.',
      'Each cell set once: O(m·n).',
    ],
    solution: treasureCode,
    traceId: 'graphs-core:trace:islands-treasure',
    pitfalls: ['BFS from each room is O((m·n)²)', 'Overwriting walls (-1)'],
  }),
  problem({
    lc: 417,
    title: 'Pacific Atlantic Water Flow',
    difficulty: 'Medium',
    skills: ['grid', 'graph-dfs', 'graph-modeling'],
    pattern: 'Reverse flood fill from borders',
    ds: ['set', 'grid'],
    constraints: '1 ≤ m, n ≤ 200, 0 ≤ heights ≤ 10^5',
    time: 'O(m·n)',
    space: 'O(m·n)',
    insight: 'Climb uphill from each ocean edge; intersect the two reachable sets.',
    signals: ['flow to both', 'ocean borders', 'height ≤ neighbor'],
    narration: [
      'Brute force from every cell is O((m·n)²).',
      'Reverse: DFS from each ocean border, moving to neighbors at least as high.',
      'Two sets, pac and atl; answer is their intersection.',
      'O(m·n) time and space.',
    ],
    solution: pacificCode,
    traceId: 'graphs-core:trace:pacific-atlantic',
    pitfalls: ['Reversing the comparison', 'Mixing top/left (Pacific) with bottom/right (Atlantic)'],
  }),
  problem({
    lc: 133,
    title: 'Clone Graph',
    difficulty: 'Medium',
    skills: ['graph-dfs', 'arrays-hashing'],
    pattern: 'DFS + hashmap old → new',
    ds: ['hashmap'],
    constraints: '0 ≤ nodes ≤ 100',
    time: 'O(V+E)',
    space: 'O(V)',
    insight: 'The old→new map is visited set and lookup; store the clone before recursing.',
    signals: ['deep copy', 'graph', 'neighbors list'],
    narration: [
      'Empty input returns None.',
      'Map each original node to its copy; doubles as visited.',
      'Create, store, then clone neighbors recursively.',
      'O(V+E) time, O(V) map and stack.',
    ],
    solution: cloneCode,
    traceId: 'graphs-core:trace:clone-graph',
    pitfalls: ['Storing after the loop → infinite recursion on cycles', 'node is None'],
  }),
  problem({
    lc: 207,
    title: 'Course Schedule',
    difficulty: 'Medium',
    skills: ['topo-sort', 'graph-dfs', 'graph-modeling'],
    pattern: 'Directed cycle detection',
    ds: ['adjacency list', 'state array'],
    constraints: '1 ≤ numCourses ≤ 2000, prerequisites ≤ 5000',
    time: 'O(V+E)',
    space: 'O(V+E)',
    insight: 'Possible iff no cycle. 3 colors: visiting node reached again = back edge.',
    signals: ['prerequisites', 'can you finish', 'dependencies'],
    narration: [
      'Courses are nodes, prerequisites are directed edges.',
      'Finish all iff the graph has no cycle.',
      'DFS with 3 states; hitting a visiting node means a cycle.',
      "O(V+E). Kahn's is the iterative alternative.",
    ],
    solution: courseCode,
    traceId: 'graphs-core:trace:course-schedule',
    pitfalls: ['Seen set alone flags diamonds as cycles', 'No memo of finished nodes → exponential'],
  }),
  problem({
    lc: 210,
    title: 'Course Schedule II',
    difficulty: 'Medium',
    skills: ['topo-sort', 'graph-bfs'],
    pattern: "Kahn's topological sort",
    ds: ['deque', 'indegree array', 'adjacency list'],
    constraints: '1 ≤ numCourses ≤ 2000',
    time: 'O(V+E)',
    space: 'O(V+E)',
    insight: 'Repeatedly take courses with zero unmet prereqs; short output means a cycle.',
    signals: ['return the ordering', 'prerequisites', 'any valid order'],
    narration: [
      'Need an actual order: topological sort.',
      'Edge pre → course, indegree = unmet prereqs.',
      'Queue indegree 0, pop, append, decrement neighbors.',
      'len(order) < n means cycle → []. O(V+E).',
    ],
    solution: kahnCode,
    traceId: 'graphs-core:trace:course-schedule-ii',
    pitfalls: ['Edge direction reversed gives a reversed order', 'Forgetting isolated courses'],
  }),
  problem({
    lc: 323,
    title: 'Number of Connected Components in an Undirected Graph',
    difficulty: 'Medium',
    skills: ['graph-dfs', 'graph-modeling', 'union-find'],
    pattern: 'Components via DFS',
    ds: ['adjacency list', 'set'],
    constraints: '1 ≤ n ≤ 2000, edges ≤ 5000',
    time: 'O(V+E)',
    space: 'O(V+E)',
    insight: 'Every unseen node starts a new component; DFS marks the rest of it.',
    signals: ['connected components', 'undirected', 'n nodes'],
    narration: [
      'Build undirected adjacency list, both directions.',
      'Loop all n nodes; unseen → DFS and count.',
      'Isolated nodes count as components.',
      'O(V+E). Union-Find also works.',
    ],
    solution: componentsCode,
    traceId: 'graphs-core:trace:components',
    pitfalls: ['Looping over graph keys misses isolated nodes', 'One-directional edges'],
  }),
  problem({
    lc: 261,
    title: 'Graph Valid Tree',
    difficulty: 'Medium',
    skills: ['graph-dfs', 'graph-modeling'],
    pattern: 'Connected + acyclic',
    ds: ['adjacency list', 'set'],
    constraints: '1 ≤ n ≤ 2000',
    time: 'O(V+E)',
    space: 'O(V+E)',
    insight: 'Tree ⇔ n-1 edges and connected. DFS with parent checks for cycles.',
    signals: ['valid tree', 'undirected edges', 'n nodes'],
    narration: [
      'A tree is connected and acyclic.',
      'Quick filter: edges must be n-1.',
      'DFS with parent; seen non-parent neighbor = cycle.',
      'Then check len(seen) == n. O(V+E).',
    ],
    solution: validTreeCode,
    traceId: 'graphs-core:trace:valid-tree',
    pitfalls: ['Treating the parent edge as a cycle', 'n = 1 with no edges is a tree'],
  }),
  problem({
    lc: 1091,
    title: 'Shortest Path in Binary Matrix',
    difficulty: 'Medium',
    skills: ['graph-bfs', 'grid'],
    pattern: 'BFS shortest path, 8 directions',
    ds: ['deque', 'set'],
    constraints: '1 ≤ n ≤ 100',
    time: 'O(n²)',
    space: 'O(n²)',
    insight: 'Unit-cost moves: BFS; first pop of the corner is the answer.',
    signals: ['shortest clear path', '8-directionally connected', 'binary matrix'],
    narration: [
      'Blocked start or end → -1.',
      'Each move costs 1, so BFS gives the shortest.',
      'Store (row, col, dist); mark on enqueue; 8 directions.',
      'O(n²) time and space.',
    ],
    solution: binaryMatrixCode,
    traceId: 'graphs-core:trace:binary-matrix',
    pitfalls: ['Only 4 directions', 'Path length counts cells (start at 1)', '1×1 grid'],
  }),
  problem({
    lc: 127,
    title: 'Word Ladder',
    difficulty: 'Hard',
    skills: ['graph-bfs', 'graph-modeling'],
    pattern: 'BFS on implicit graph',
    ds: ['set', 'deque'],
    constraints: '1 ≤ L ≤ 10, wordList ≤ 5000',
    time: 'O(N·L²·26)',
    space: 'O(N·L)',
    insight: 'Words are nodes, one-letter changes are edges; generate neighbors by trying 26 letters.',
    signals: ['transformation sequence', 'one letter at a time', 'shortest'],
    narration: [
      'Words are nodes, one-letter difference is an edge; shortest → BFS.',
      'endWord missing → 0.',
      'Generate neighbors: each position × 26 letters, keep those in the set.',
      'O(N·L²·26). Bidirectional BFS halves the depth.',
    ],
    solution: ladderCode,
    traceId: 'graphs-core:trace:word-ladder',
    pitfalls: ['Answer counts words, not edges', 'Comparing all pairs is O(N²·L)'],
  }),
  problem({
    lc: 130,
    title: 'Surrounded Regions',
    difficulty: 'Medium',
    skills: ['grid', 'graph-dfs'],
    pattern: 'Border flood fill, then sweep',
    ds: ['grid'],
    constraints: '1 ≤ m, n ≤ 200',
    time: 'O(m·n)',
    space: 'O(m·n)',
    insight: 'Mark O regions touching the border as safe; everything else flips.',
    signals: ['surrounded', 'capture', 'border', 'in place'],
    narration: [
      'Proving enclosure is hard; finding escapes is easy.',
      'DFS from every border O, mark T.',
      'Sweep: O → X, T → O.',
      'O(m·n) time; recursion worst case O(m·n).',
    ],
    solution: surroundedCode,
    traceId: 'graphs-core:trace:surrounded-regions',
    pitfalls: ['Flipping during the border DFS', 'Forgetting to restore T'],
  }),
  problem({
    lc: 733,
    title: 'Flood Fill',
    difficulty: 'Easy',
    skills: ['grid', 'graph-dfs'],
    pattern: 'Grid DFS',
    ds: ['grid'],
    constraints: '1 ≤ m, n ≤ 50',
    time: 'O(m·n)',
    space: 'O(m·n)',
    insight: 'Recolor same-colored connected cells; if new color equals old, return early.',
    signals: ['flood fill', 'starting pixel', 'same color connected'],
    narration: [
      'If color already equals the start color, nothing to do.',
      'DFS from (sr, sc) over cells with the original color.',
      'Recoloring is the visited mark.',
      'O(m·n).',
    ],
    solution: `class Solution:
    def floodFill(self, image: List[List[int]], sr: int, sc: int, color: int) -> List[List[int]]:
        rows, cols, start = len(image), len(image[0]), image[sr][sc]

        if start == color:
            return image

        def dfs(row, col):
            if row < 0 or row >= rows or col < 0 or col >= cols or image[row][col] != start:
                return
            image[row][col] = color
            dfs(row + 1, col)
            dfs(row - 1, col)
            dfs(row, col + 1)
            dfs(row, col - 1)

        dfs(sr, sc)
        return image`,
    pitfalls: ['start == color causes infinite recursion without the early return'],
  }),
  problem({
    lc: 542,
    title: '01 Matrix',
    difficulty: 'Medium',
    skills: ['graph-bfs', 'grid'],
    pattern: 'Multi-source BFS from zeros',
    ds: ['deque', 'grid'],
    constraints: '1 ≤ m·n ≤ 10^4',
    time: 'O(m·n)',
    space: 'O(m·n)',
    insight: 'Distance to nearest 0: BFS from every 0 at once.',
    signals: ['distance of the nearest 0', 'each cell'],
    narration: [
      'Nearest-of-many → multi-source BFS from all zeros.',
      'Ones start as -1 (unvisited).',
      'Pop, set unvisited neighbors to dist + 1, enqueue.',
      'O(m·n) time and space.',
    ],
    solution: `from collections import deque

class Solution:
    def updateMatrix(self, mat: List[List[int]]) -> List[List[int]]:
        rows, cols = len(mat), len(mat[0])
        queue = deque()

        for r in range(rows):
            for c in range(cols):
                if mat[r][c] == 0:
                    queue.append((r, c))
                else:
                    mat[r][c] = -1

        while queue:
            row, col = queue.popleft()
            for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
                nr, nc = row + dr, col + dc
                if 0 <= nr < rows and 0 <= nc < cols and mat[nr][nc] == -1:
                    mat[nr][nc] = mat[row][col] + 1
                    queue.append((nr, nc))

        return mat`,
    pitfalls: ['BFS from each 1 is O((m·n)²)'],
  }),
]

const placeChoices = (answer, wrong, seed) => {
  const at = Math.abs(seed * 7 + 3) % 4
  const choices = wrong.slice(0, 3)
  choices.splice(at, 0, answer)
  return { choices, answer: at }
}

const generatorScenarios = [
  ['DFS over an adjacency list', 'O(V+E)', ['O(V·E)', 'O(E log V)', 'O(V²)'], 'Each node once, each edge once.'],
  ['BFS over an adjacency list', 'O(V+E)', ['O(V·E)', 'O(E log V)', 'O(V²)'], 'Each node enqueued once, each edge scanned once.'],
  ["Kahn's topological sort", 'O(V+E)', ['O(V·E)', 'O(E log V)', 'O(V²)'], 'Each node enqueued once, each edge decremented once.'],
  ['DFS over an adjacency MATRIX', 'O(V²)', ['O(V+E)', 'O(E log V)', 'O(V³)'], 'Scanning a matrix row per node costs V each: V².'],
  ['BFS restarted from every node to answer all-pairs reachability', 'O(V·(V+E))', ['O(V+E)', 'O(E log V)', 'O(V³ log V)'], 'V runs of O(V+E) each: O(V·(V+E)).'],
]

const generators = [
  {
    id: 'graphs-core:gen:traversal-cost',
    title: 'Traversal cost',
    skills: ['complexity', 'graph-dfs', 'graph-bfs'],
    make(seed) {
      const [what, answer, wrong, why] = generatorScenarios[Math.abs(seed) % generatorScenarios.length]
      const v = 10 ** (2 + (Math.abs(seed) % 4))
      return {
        id: `graphs-core:gen:traversal-cost:${seed}`,
        skills: ['complexity', 'graph-dfs', 'graph-bfs'],
        difficulty: 2,
        q: `V = ${v.toLocaleString('en-US')}, E ≈ 2V. Time for: ${what}?`,
        ...placeChoices(answer, wrong, seed),
        why,
      }
    },
  },
  {
    id: 'graphs-core:gen:grid-size',
    title: 'Grid traversal budget',
    skills: ['complexity', 'grid', 'constraints'],
    make(seed) {
      const sizes = [50, 100, 300, 500, 1000, 3000]
      const side = sizes[Math.abs(seed) % sizes.length]
      const cells = side * side
      const everyCell = Math.floor(Math.abs(seed) / sizes.length) % 3 === 2
      const verdicts = ['Comfortably fast', 'Fine in C++, tight in Python', 'Too slow', 'Needs DP instead']
      const verdict = everyCell ? (cells <= 2500 ? verdicts[0] : cells <= 10 ** 4 ? verdicts[1] : verdicts[2]) : cells <= 10 ** 6 ? verdicts[0] : verdicts[1]
      const what = everyCell ? 'A separate BFS started from every cell is…' : 'One BFS over every cell is…'
      const why = everyCell
        ? `O((r·c)²) = ${(cells * cells).toExponential(1)} ops vs ~10^8/sec. Use multi-source BFS instead.`
        : `O(r·c) = ${cells.toLocaleString('en-US')} cell visits vs ~10^8 ops/sec; Python does ~10^6–10^7 BFS steps/sec.`
      return {
        id: `graphs-core:gen:grid-size:${seed}`,
        skills: ['complexity', 'grid', 'constraints'],
        difficulty: everyCell ? 2 : 1,
        q: `Grid ${side}×${side} (${cells.toLocaleString('en-US')} cells). ${what}`,
        ...placeChoices(verdict, verdicts.filter(choice => choice !== verdict), seed),
        why,
      }
    },
  },
]

export default {
  id: 'graphs-core',
  title: 'Graphs: DFS, BFS, Grids, Topo',
  icon: '🕸️',
  skills: ['graph-modeling', 'graph-dfs', 'graph-bfs', 'grid', 'topo-sort'],
  lessons,
  traces,
  flashcards,
  mcqs,
  clozes,
  parsons,
  problems,
  extras: { generators },
}
