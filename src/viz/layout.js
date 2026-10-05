const globalCache = new Map()

const edgeKey = edge => `${edge.from}->${edge.to}`

export function graphSignature(nodes, edges) {
  return `${nodes.map(node => node.id).sort().join(',')}|${edges.map(edgeKey).sort().join(',')}`
}

export function layoutGraph(nodes, edges, directed) {
  const ids = nodes.map(node => String(node.id))
  const fixed = new Map()
  for (const node of nodes) {
    if (typeof node.x === 'number' && typeof node.y === 'number') fixed.set(String(node.id), { x: node.x, y: node.y })
  }
  const cleanEdges = edges
    .map(edge => ({ from: String(edge.from), to: String(edge.to) }))
    .filter(edge => edge.from !== edge.to && ids.includes(edge.from) && ids.includes(edge.to))
  if (fixed.size === ids.length) return fixed
  if (!fixed.size && directed && ids.length > 2 && isAcyclic(ids, cleanEdges)) {
    const layered = layeredLayout(ids, cleanEdges)
    if (layered) return layered
  }
  return forceLayout(ids, cleanEdges, fixed)
}

export function cachedGraphLayout(nodes, edges, directed) {
  const key = `${directed ? 'd' : 'u'}:${graphSignature(nodes, edges)}`
  if (!globalCache.has(key)) {
    if (globalCache.size > 300) globalCache.clear()
    globalCache.set(key, layoutGraph(nodes, edges, directed))
  }
  return globalCache.get(key)
}

function isAcyclic(ids, edges) {
  const indegree = new Map(ids.map(id => [id, 0]))
  const adjacency = new Map(ids.map(id => [id, []]))
  for (const edge of edges) {
    adjacency.get(edge.from).push(edge.to)
    indegree.set(edge.to, indegree.get(edge.to) + 1)
  }
  const queue = ids.filter(id => indegree.get(id) === 0)
  let seen = 0
  while (queue.length) {
    const id = queue.shift()
    seen += 1
    for (const next of adjacency.get(id)) {
      indegree.set(next, indegree.get(next) - 1)
      if (indegree.get(next) === 0) queue.push(next)
    }
  }
  return seen === ids.length && edges.length > 0
}

function layeredLayout(ids, edges) {
  const preds = new Map(ids.map(id => [id, []]))
  const succs = new Map(ids.map(id => [id, []]))
  for (const edge of edges) {
    preds.get(edge.to).push(edge.from)
    succs.get(edge.from).push(edge.to)
  }
  const layer = new Map()
  const depthOf = id => {
    if (layer.has(id)) return layer.get(id)
    layer.set(id, 0)
    const depth = preds.get(id).length ? Math.max(...preds.get(id).map(depthOf)) + 1 : 0
    layer.set(id, depth)
    return depth
  }
  ids.forEach(depthOf)
  const layerCount = Math.max(...layer.values()) + 1
  if (layerCount < 2) return null
  const layers = Array.from({ length: layerCount }, () => [])
  ids.forEach(id => layers[layer.get(id)].push(id))
  const order = new Map()
  const reindex = () => layers.forEach(list => list.forEach((id, i) => order.set(id, i / Math.max(1, list.length - 1))))
  reindex()
  const barycenter = (id, neighbors) => {
    const list = neighbors.get(id)
    return list.length ? list.reduce((sum, other) => sum + order.get(other), 0) / list.length : order.get(id)
  }
  for (let sweep = 0; sweep < 6; sweep++) {
    const forward = sweep % 2 === 0
    const range = forward ? layers.slice(1) : layers.slice(0, -1).reverse()
    for (const list of range) {
      const scores = new Map(list.map(id => [id, barycenter(id, forward ? preds : succs)]))
      list.sort((a, b) => scores.get(a) - scores.get(b))
      list.forEach((id, i) => order.set(id, i / Math.max(1, list.length - 1)))
    }
  }
  const positions = new Map()
  layers.forEach((list, depth) => {
    list.forEach((id, i) => positions.set(id, {
      x: layerCount === 1 ? 0.5 : depth / (layerCount - 1),
      y: (i + 1) / (list.length + 1),
    }))
  })
  return positions
}

function bfsOrder(ids, edges) {
  const adjacency = new Map(ids.map(id => [id, []]))
  for (const edge of edges) {
    adjacency.get(edge.from).push(edge.to)
    adjacency.get(edge.to).push(edge.from)
  }
  const seen = new Set()
  const order = []
  for (const start of ids) {
    if (seen.has(start)) continue
    seen.add(start)
    const queue = [start]
    while (queue.length) {
      const id = queue.shift()
      order.push(id)
      for (const next of adjacency.get(id)) {
        if (!seen.has(next)) {
          seen.add(next)
          queue.push(next)
        }
      }
    }
  }
  return order
}

function forceLayout(ids, edges, fixed) {
  const count = ids.length
  const positions = new Map()
  const order = bfsOrder(ids, edges)
  order.forEach((id, i) => {
    const angle = (2 * Math.PI * i) / Math.max(1, count) - Math.PI / 2
    positions.set(id, fixed.get(id) ? { ...fixed.get(id) } : { x: 0.5 + 0.4 * Math.cos(angle), y: 0.5 + 0.4 * Math.sin(angle) })
  })
  if (count <= 3 || !edges.length) return normalize(positions, fixed)
  const k = 0.75 * Math.sqrt(1 / count)
  let temperature = 0.08
  for (let iteration = 0; iteration < 320; iteration++) {
    const shift = new Map(ids.map(id => [id, { x: 0, y: 0 }]))
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const a = positions.get(ids[i])
        const b = positions.get(ids[j])
        let dx = a.x - b.x
        let dy = a.y - b.y
        let distance = Math.hypot(dx, dy)
        if (distance < 1e-4) {
          dx = 0.01 * (i - j)
          dy = 0.01
          distance = Math.hypot(dx, dy)
        }
        const force = (k * k) / distance
        shift.get(ids[i]).x += (dx / distance) * force
        shift.get(ids[i]).y += (dy / distance) * force
        shift.get(ids[j]).x -= (dx / distance) * force
        shift.get(ids[j]).y -= (dy / distance) * force
      }
    }
    for (const edge of edges) {
      const a = positions.get(edge.from)
      const b = positions.get(edge.to)
      const dx = a.x - b.x
      const dy = a.y - b.y
      const distance = Math.hypot(dx, dy) || 1e-4
      const force = (distance * distance) / k
      shift.get(edge.from).x -= (dx / distance) * force
      shift.get(edge.from).y -= (dy / distance) * force
      shift.get(edge.to).x += (dx / distance) * force
      shift.get(edge.to).y += (dy / distance) * force
    }
    for (const id of ids) {
      if (fixed.has(id)) continue
      const position = positions.get(id)
      const delta = shift.get(id)
      const length = Math.hypot(delta.x, delta.y) || 1
      const step = Math.min(length, temperature)
      position.x += (delta.x / length) * step + (0.5 - position.x) * 0.01
      position.y += (delta.y / length) * step + (0.5 - position.y) * 0.01
    }
    temperature *= 0.985
  }
  return normalize(positions, fixed)
}

function normalize(positions, fixed) {
  if (fixed.size) return positions
  const xs = [...positions.values()].map(p => p.x)
  const ys = [...positions.values()].map(p => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const spanX = maxX - minX || 1
  const spanY = maxY - minY || 1
  for (const position of positions.values()) {
    position.x = maxX === minX ? 0.5 : (position.x - minX) / spanX
    position.y = maxY === minY ? 0.5 : (position.y - minY) / spanY
  }
  return positions
}

export function prepareLayouts(steps) {
  const groups = new Map()
  for (const step of steps || []) {
    for (const panel of step.panels || []) {
      if (!panel || panel.kind !== 'graph') continue
      const label = panel.label || 'graph'
      if (!groups.has(label)) groups.set(label, { directed: Boolean(panel.directed), nodes: new Map(), edges: new Map() })
      const group = groups.get(label)
      for (const node of panel.nodes || []) if (!group.nodes.has(String(node.id))) group.nodes.set(String(node.id), node)
      for (const edge of panel.edges || []) group.edges.set(edgeKey(edge), edge)
    }
  }
  const layouts = new Map()
  for (const [label, group] of groups) {
    layouts.set(label, layoutGraph([...group.nodes.values()], [...group.edges.values()], group.directed))
  }
  return { layouts }
}

export function treeLayout(root) {
  const nodes = []
  const edges = []
  let order = 0
  let maxDepth = 0
  const walk = (node, depth, path, parentId) => {
    if (!node || depth > 40) return
    const id = String(node.id ?? path)
    walk(node.left, depth + 1, `${path}L`, id)
    const entry = { id, val: node.val, x: order++, depth }
    nodes.push(entry)
    maxDepth = Math.max(maxDepth, depth)
    if (parentId !== null) edges.push({ from: parentId, to: id })
    walk(node.right, depth + 1, `${path}R`, id)
  }
  walk(root, 0, 'n', null)
  return { nodes, edges, width: order, depth: maxDepth }
}
