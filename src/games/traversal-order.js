import { h, svg, clear } from '../ui/h.js'
import { createArcade, pick, shuffle, rand } from './_engine.js'
import { overrideButton, applyOverrideVisuals } from '../ui/override.js'

const modes = {
  preorder: { label: 'DFS preorder', why: 'Preorder: node, then left subtree, then right.', skills: ['tree-dfs'], d: 1 },
  level: { label: 'BFS level order', why: 'BFS: finish each level left to right before going deeper.', skills: ['tree-bfs'], d: 1 },
  inorder: { label: 'DFS inorder', why: 'Inorder: entire left subtree, then node, then right subtree.', skills: ['tree-dfs'], d: 2 },
  postorder: { label: 'DFS postorder', why: 'Postorder: both children finish before the node.', skills: ['tree-dfs'], d: 2 },
  graphDfs: { label: 'Graph DFS from 0', why: 'DFS dives into the smallest unvisited neighbor, backtracks when stuck.', skills: ['graph-dfs'], d: 3 },
  graphBfs: { label: 'Graph BFS from 0', why: 'BFS dequeues in order and enqueues unvisited neighbors ascending.', skills: ['graph-bfs'], d: 3 },
  topo: { label: 'Topological order', why: 'A node may appear only after every node pointing into it.', skills: ['topo-sort'], d: 4 },
}

function makeTree(size) {
  const values = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, size)
  const nodes = values.map(value => ({ id: String(value), label: String(value), left: null, right: null, depth: 0 }))
  for (let i = 1; i < nodes.length; i++) {
    const open = []
    for (let j = 0; j < i; j++) {
      if (nodes[j].depth >= 3) continue
      if (!nodes[j].left) open.push([j, 'left'])
      if (!nodes[j].right) open.push([j, 'right'])
    }
    const [parentIndex, side] = pick(open)
    nodes[parentIndex][side] = nodes[i]
    nodes[i].depth = nodes[parentIndex].depth + 1
  }
  return nodes[0]
}

function treeOrders(root) {
  const pre = [], ino = [], post = [], level = []
  const walk = node => {
    if (!node) return
    pre.push(node.id)
    walk(node.left)
    ino.push(node.id)
    walk(node.right)
    post.push(node.id)
  }
  walk(root)
  const queue = [root]
  while (queue.length) {
    const node = queue.shift()
    level.push(node.id)
    if (node.left) queue.push(node.left)
    if (node.right) queue.push(node.right)
  }
  return { preorder: pre, inorder: ino, postorder: post, level }
}

function treeLayout(root) {
  const nodes = [], edges = []
  let index = 0
  let maxDepth = 0
  const walk = (node, depth) => {
    if (!node) return
    walk(node.left, depth + 1)
    nodes.push({ id: node.id, label: node.label, x: index++, y: depth })
    maxDepth = Math.max(maxDepth, depth)
    walk(node.right, depth + 1)
    if (node.left) edges.push({ from: node.id, to: node.left.id })
    if (node.right) edges.push({ from: node.id, to: node.right.id })
  }
  walk(root, 0)
  const width = Math.max(1, index - 1)
  nodes.forEach(node => {
    node.x = 0.08 + (node.x / width) * 0.84
    node.y = 0.12 + (node.y / Math.max(1, maxDepth)) * 0.76
  })
  return { nodes, edges, directed: false }
}

function makeGraph(size) {
  const edges = new Set()
  for (let i = 1; i < size; i++) {
    const j = rand(i)
    edges.add(`${Math.min(i, j)}-${Math.max(i, j)}`)
  }
  const extra = 1 + rand(3)
  for (let tries = 0; tries < 30 && edges.size < size - 1 + extra; tries++) {
    const a = rand(size), b = rand(size)
    if (a !== b) edges.add(`${Math.min(a, b)}-${Math.max(a, b)}`)
  }
  const edgeList = [...edges].map(key => key.split('-').map(Number))
  const graph = Object.fromEntries(Array.from({ length: size }, (_, i) => [i, []]))
  for (const [a, b] of edgeList) {
    graph[a].push(b)
    graph[b].push(a)
  }
  Object.values(graph).forEach(list => list.sort((a, b) => a - b))
  const offset = Math.random() * Math.PI * 2
  const nodes = Array.from({ length: size }, (_, i) => ({
    id: String(i), label: String(i),
    x: 0.5 + 0.38 * Math.cos(offset + (i / size) * Math.PI * 2),
    y: 0.5 + 0.38 * Math.sin(offset + (i / size) * Math.PI * 2),
  }))
  const seen = new Set()
  const dfsOrder = []
  const dfs = node => {
    seen.add(node)
    dfsOrder.push(String(node))
    for (const next of graph[node]) if (!seen.has(next)) dfs(next)
  }
  dfs(0)
  const bfsOrder = []
  const visited = new Set([0])
  const queue = [0]
  while (queue.length) {
    const node = queue.shift()
    bfsOrder.push(String(node))
    for (const next of graph[node]) if (!visited.has(next)) {
      visited.add(next)
      queue.push(next)
    }
  }
  return {
    layout: { nodes, edges: edgeList.map(([a, b]) => ({ from: String(a), to: String(b) })), directed: false },
    adjacency: graph, dfsOrder, bfsOrder,
  }
}

function makeDag(size) {
  const ranks = shuffle(Array.from({ length: size }, (_, i) => i))
  const edges = []
  for (let i = 1; i < size; i++) {
    const parents = shuffle(Array.from({ length: i }, (_, j) => j)).slice(0, 1 + rand(Math.min(2, i)))
    for (const j of parents) edges.push([ranks[j], ranks[i]])
  }
  const depth = {}
  for (let i = 0; i < size; i++) {
    const node = ranks[i]
    depth[node] = Math.max(0, ...edges.filter(([, to]) => to === node).map(([from]) => depth[from] + 1))
  }
  const layers = {}
  for (const node of ranks) (layers[depth[node]] ||= []).push(node)
  const layerCount = Object.keys(layers).length
  const nodes = []
  for (const [layer, members] of Object.entries(layers)) {
    members.forEach((node, k) => nodes.push({
      id: String(node), label: String(node),
      x: 0.1 + (Number(layer) / Math.max(1, layerCount - 1)) * 0.8,
      y: (k + 1) / (members.length + 1),
    }))
  }
  const preds = Object.fromEntries(Array.from({ length: size }, (_, i) => [String(i), []]))
  for (const [from, to] of edges) preds[String(to)].push(String(from))
  return { layout: { nodes, edges: edges.map(([a, b]) => ({ from: String(a), to: String(b) })), directed: true }, preds }
}

function makePuzzle(level) {
  const available = Object.entries(modes).filter(([, mode]) => mode.d <= Math.max(1, Math.min(4, Math.ceil(level / 1.3))))
  const preferred = available.filter(([, mode]) => mode.d >= Math.min(level, 4) - 1)
  const [modeId, mode] = pick(preferred.length ? preferred : available)
  const size = Math.min(9, 5 + Math.floor(level / 2) + rand(2))
  if (modeId === 'graphDfs' || modeId === 'graphBfs') {
    const graph = makeGraph(Math.min(size, 8))
    return { modeId, mode, layout: graph.layout, order: modeId === 'graphDfs' ? graph.dfsOrder : graph.bfsOrder, adjacency: graph.adjacency }
  }
  if (modeId === 'topo') {
    const dag = makeDag(Math.min(size, 7))
    return { modeId, mode, layout: dag.layout, preds: dag.preds }
  }
  const root = makeTree(size)
  return { modeId, mode, layout: treeLayout(root), order: treeOrders(root)[modeId] }
}

let markerSeed = 0

function drawGraph(layout, nodeState, onPick) {
  const width = 520, height = 300, radius = 19
  const markerId = `traversal-arrow-${++markerSeed}`
  const position = Object.fromEntries(layout.nodes.map(node => [node.id, { x: node.x * width, y: node.y * height }]))
  const edgeEls = layout.edges.map(edge => {
    const a = position[edge.from], b = position[edge.to]
    const dx = b.x - a.x, dy = b.y - a.y
    const length = Math.hypot(dx, dy) || 1
    const ux = dx / length, uy = dy / length
    return svg('line', {
      class: 'trav-edge',
      x1: a.x + ux * radius, y1: a.y + uy * radius,
      x2: b.x - ux * (radius + (layout.directed ? 4 : 0)), y2: b.y - uy * (radius + (layout.directed ? 4 : 0)),
      'marker-end': layout.directed ? `url(#${markerId})` : null,
    })
  })
  const nodeEls = layout.nodes.map(node => {
    const { x, y } = position[node.id]
    const state = nodeState[node.id] || {}
    const group = svg('g', {
      class: `trav-node ${state.cls || ''}`,
      tabindex: '0',
      role: 'button',
      'aria-label': `node ${node.label}`,
      onclick: () => onPick(node.id),
      onkeydown: event => {
        if (event.key === 'Enter') {
          event.preventDefault()
          event.stopPropagation()
          onPick(node.id)
        }
      },
    },
    svg('circle', { cx: x, cy: y, r: radius }),
    svg('text', { x, y: y + 1, 'text-anchor': 'middle', 'dominant-baseline': 'middle' }, node.label),
    state.order ? svg('text', { class: 'trav-badge', x: x + radius - 2, y: y - radius + 2, 'text-anchor': 'middle' }, String(state.order)) : null)
    return group
  })
  return svg('svg', { class: 'trav-svg', viewBox: `0 0 ${width} ${height}`, preserveAspectRatio: 'xMidYMid meet' },
    svg('defs', null, svg('marker', { id: markerId, viewBox: '0 0 10 10', refX: '8', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse' },
      svg('path', { d: 'M 0 0 L 10 5 L 0 10 z', class: 'trav-arrow' }))),
    edgeEls, nodeEls)
}

function mount(container, api) {
  let puzzle = null
  let picked = []
  let nodeState = {}
  let mistakes = 0
  let locked = false
  let startTime = 0
  let board = null
  let strip = null
  let feedback = null

  const expectedNext = () => {
    if (puzzle.modeId !== 'topo') return [puzzle.order[picked.length]]
    return puzzle.layout.nodes
      .map(node => node.id)
      .filter(id => !picked.includes(id) && puzzle.preds[id].every(pred => picked.includes(pred)))
  }

  function nextPuzzle(ctx) {
    if (ctx.over()) return
    puzzle = makePuzzle(ctx.level)
    picked = []
    nodeState = {}
    mistakes = 0
    locked = false
    startTime = performance.now()
    clear(ctx.stage)
    board = h('div', { class: 'trav-board' })
    strip = h('div', { class: 'trav-strip' })
    feedback = h('div', { class: 'game-feedback' })
    const adjacency = puzzle.adjacency
      ? h('div', { class: 'trav-adj mono small' }, Object.entries(puzzle.adjacency).map(([node, list]) => h('div', null, h('b', null, node), ` → ${list.join(', ') || '∅'}`)))
      : null
    ctx.stage.append(h('div', { class: 'card game-card fade-in' },
      h('div', { class: 'row row-wrap game-tags' },
        h('span', { class: 'pill pill-teal' }, `🧭 ${puzzle.mode.label}`),
        puzzle.adjacency ? h('span', { class: 'chip' }, 'neighbors ascending') : null,
        puzzle.modeId === 'topo' ? h('span', { class: 'chip' }, 'any valid order') : null),
      h('div', { class: 'game-ask' }, 'Click nodes in visit order'),
      h('div', { class: 'trav-wrap' }, board, adjacency),
      strip,
      feedback))
    draw(ctx)
  }

  function draw(ctx) {
    clear(board)
    board.append(drawGraph(puzzle.layout, nodeState, id => choose(ctx, id)))
    clear(strip)
    const total = puzzle.layout.nodes.length
    for (let i = 0; i < total; i++) {
      const id = picked[i]
      strip.append(h('span', { class: `trav-slot${id ? ` ${nodeState[id]?.cls || ''}` : ''}` }, id ? puzzle.layout.nodes.find(node => node.id === id).label : '·'))
    }
  }

  function choose(ctx, id) {
    if (locked || ctx.over() || !puzzle || picked.includes(id)) return
    const valid = expectedNext()
    if (valid.includes(id)) {
      picked.push(id)
      nodeState[id] = { cls: 'done', order: picked.length }
      ctx.hit(20)
    } else {
      const correctId = valid[0]
      const label = id => puzzle.layout.nodes.find(node => node.id === id)?.label
      mistakes++
      const alive = ctx.miss()
      nodeState[id] = { ...nodeState[id], cls: 'wrong' }
      draw(ctx)
      ctx.pulse(board, 'shake')
      ctx.state.mistakes.push({
        summary: `${puzzle.mode.label}, step ${picked.length + 1}`,
        yours: label(id), answer: label(correctId), why: puzzle.mode.why,
      })
      locked = true
      ctx.later(() => {
        delete nodeState[id]
        picked.push(correctId)
        nodeState[correctId] = { cls: 'hinted', order: picked.length }
        locked = false
        if (!alive) {
          draw(ctx)
          complete(ctx, { lost: true })
          return
        }
        draw(ctx)
        if (picked.length === puzzle.layout.nodes.length) complete(ctx)
      }, 650)
      return
    }
    draw(ctx)
    if (picked.length === puzzle.layout.nodes.length) complete(ctx)
  }

  function complete(ctx, { lost = false } = {}) {
    locked = true
    const clean = mistakes === 0
    const seconds = (performance.now() - startTime) / 1000
    ctx.resolve(clean, { skills: puzzle.mode.skills, id: `traversal-order:${puzzle.modeId}` })
    if (clean) {
      ctx.hit(120, Math.max(0, 1 - seconds / 25))
      feedback.append(h('div', { class: 'game-why good' }, '✓ ', puzzle.mode.why))
      ctx.waitFor(() => nextPuzzle(ctx), 1300)
      return
    }
    let alive = !lost
    const missedSteps = mistakes
    const continueButton = h('button', { class: 'btn btn-primary game-continue', onclick: () => ctx.proceed() }, alive ? 'Continue ' : 'Results ', h('span', { class: 'kbd' }, 'Enter'))
    const overrule = overrideButton({
      title: 'My order was also a valid traversal. Count it.',
      onOverride: () => {
        if (!ctx.overrule({ restoreLives: missedSteps, dropMistakes: missedSteps, base: 120 })) return
        alive = true
        applyOverrideVisuals(feedback)
        for (const slot of strip.querySelectorAll('.trav-slot.hinted')) slot.classList.replace('hinted', 'done')
        continueButton.firstChild.textContent = 'Continue '
      },
    })
    feedback.append(
      h('div', { class: 'game-why bad' }, puzzle.mode.why),
      h('div', { class: 'row row-wrap' }, continueButton, overrule))
    ctx.waitFor(() => (alive ? nextPuzzle(ctx) : ctx.end()))
  }

  return createArcade(container, api, {
    title: 'Traversal Order',
    icon: '🧭',
    rules: ['tap nodes in order', 'digits pick nodes'],
    mode: 'lives',
    lives: 3,
    onStart: ctx => nextPuzzle(ctx),
    onKey: (event, ctx) => {
      if (!puzzle || !/^[0-9]$/.test(event.key)) return
      const node = puzzle.layout.nodes.find(candidate => candidate.label === event.key)
      if (node) {
        event.preventDefault()
        choose(ctx, node.id)
      }
    },
  })
}

export default {
  id: 'traversal-order',
  title: 'Traversal Order',
  icon: '🧭',
  blurb: 'Click nodes exactly as DFS or BFS would.',
  skills: ['tree-dfs', 'tree-bfs', 'graph-dfs', 'graph-bfs', 'topo-sort'],
  mount,
}
