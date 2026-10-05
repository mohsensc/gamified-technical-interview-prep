import { createScene, linePath } from './scene.js'
import { cachedGraphLayout } from './layout.js'
import { cellText, stateClass } from './util.js'

export function createGraph() {
  const scene = createScene()
  const update = (panel, ctx) => {
    const nodes = panel.nodes || []
    const edges = panel.edges || []
    const directed = Boolean(panel.directed)
    const label = panel.label || 'graph'
    const ctxLayout = ctx?.layouts?.get(label)
    const usable = ctxLayout && nodes.every(node => ctxLayout.has(String(node.id)))
    const layout = usable ? ctxLayout : cachedGraphLayout(nodes, edges, directed)
    const count = nodes.length
    const radius = count > 24 ? 13 : count > 14 ? 15 : 18
    const baseWidth = count > 14 ? 680 : 560
    const baseHeight = count > 14 ? 420 : 340
    const pad = radius + 22
    const normalized = id => {
      const node = nodes.find(item => String(item.id) === String(id))
      return (node && typeof node.x === 'number' && typeof node.y === 'number') ? node : layout.get(String(id)) || { x: 0.5, y: 0.5 }
    }
    const raw = nodes.map(node => normalized(node.id))
    const xs = raw.map(position => position.x * (baseWidth - 2 * pad))
    const ys = raw.map(position => position.y * (baseHeight - 2 * pad))
    const minX = xs.length ? Math.min(...xs) : 0
    const minY = ys.length ? Math.min(...ys) : 0
    const spanX = xs.length ? Math.max(...xs) - minX : 0
    const spanY = ys.length ? Math.max(...ys) - minY : 0
    const width = Math.max(240, spanX + 2 * pad)
    const height = Math.max(140, spanY + 2 * pad + 8)
    const offsetX = (width - spanX) / 2 - minX
    const offsetY = (height - spanY) / 2 - minY
    const point = id => {
      const position = normalized(id)
      return { x: offsetX + position.x * (baseWidth - 2 * pad), y: offsetY + position.y * (baseHeight - 2 * pad) }
    }
    const state = panel.state || {}
    const edgeState = panel.edgeState || {}
    const values = panel.values || {}
    const keys = new Set(edges.map(edge => `${edge.from}->${edge.to}`))
    const drawn = new Set()
    const sceneEdges = []
    for (const edge of edges) {
      const forward = `${edge.from}->${edge.to}`
      const backward = `${edge.to}->${edge.from}`
      if (String(edge.from) === String(edge.to)) continue
      if (!directed && (drawn.has(forward) || drawn.has(backward))) continue
      drawn.add(forward)
      const status = edgeState[forward] || (!directed ? edgeState[backward] : undefined)
      const a = point(edge.from)
      const b = point(edge.to)
      const bend = directed && keys.has(backward) ? 16 : 0
      const path = linePath(a.x, a.y, b.x, b.y, directed ? radius : 0, directed ? radius + 3 : 0, bend)
      const weight = edge.w ?? edge.weight
      sceneEdges.push({
        key: forward, d: path.d, cls: status ? `es-${status}` : '', arrow: directed, marker: status || 'base',
        label: weight === undefined || weight === null ? undefined : cellText(weight), labelAt: path.mid,
      })
    }
    const sceneNodes = nodes.map(node => {
      const position = point(node.id)
      const note = values[node.id]
      return {
        key: node.id, x: position.x, y: position.y, r: radius, label: node.label ?? node.id,
        cls: stateClass(state[node.id]), note: note === undefined ? undefined : cellText(note),
      }
    })
    scene.update({ width, height, nodes: sceneNodes, edges: sceneEdges })
  }
  return { el: scene.el, update }
}
