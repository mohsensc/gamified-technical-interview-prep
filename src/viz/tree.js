import { createScene, linePath } from './scene.js'
import { treeLayout } from './layout.js'
import { cellText, stateClass } from './util.js'

export function pointerTags(pointers, positionOf, offset) {
  const stacks = new Map()
  const tags = []
  for (const [name, target] of Object.entries(pointers || {})) {
    if (target === null || target === undefined) continue
    const position = positionOf(target)
    if (!position) continue
    const level = stacks.get(String(target)) || 0
    stacks.set(String(target), level + 1)
    tags.push({ key: name, text: name, x: position.x, y: position.y - offset - level * 21, cls: 'tag-ptr', tick: level === 0 })
  }
  return tags
}

export function createTree() {
  const scene = createScene()
  const update = panel => {
    const { nodes, edges, width: slots, depth } = treeLayout(panel.root)
    const gapX = 50
    const gapY = 66
    const radius = 18
    const pointers = panel.pointers || {}
    const tagRoom = Object.keys(pointers).length ? 26 + 21 * Math.min(2, Object.keys(pointers).length - 1) : 4
    const pad = 30
    const width = Math.max(220, slots * gapX + pad * 2)
    const height = depth * gapY + pad * 2 + tagRoom + 14
    const positions = new Map(nodes.map(node => [node.id, { x: pad + gapX / 2 + node.x * gapX, y: pad + tagRoom + node.depth * gapY }]))
    const state = panel.state || {}
    const values = panel.values || {}
    const sceneNodes = nodes.map(node => ({
      key: node.id, ...positions.get(node.id), r: radius, label: cellText(node.val), cls: stateClass(state[node.id]),
      note: values[node.id] === undefined ? undefined : cellText(values[node.id]),
    }))
    const sceneEdges = edges.map(edge => {
      const a = positions.get(edge.from)
      const b = positions.get(edge.to)
      const childState = state[edge.to]
      const cls = childState === 'path' && state[edge.from] === 'path' ? 'es-path' : childState && childState !== 'frontier' ? 'es-tree' : ''
      return { key: `${edge.from}->${edge.to}`, d: linePath(a.x, a.y, b.x, b.y, radius, radius).d, cls }
    })
    const tags = pointerTags(pointers, id => positions.get(String(id)), radius + 14)
    scene.update({ width, height, nodes: sceneNodes, edges: sceneEdges, tags })
    if (!nodes.length) scene.update({ width: 220, height: 60, nodes: [], edges: [], tags: [{ key: '__empty', text: 'None', x: 110, y: 30, cls: 'tag-empty', tick: false }] })
  }
  return { el: scene.el, update }
}
