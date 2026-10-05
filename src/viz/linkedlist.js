import { createScene, linePath } from './scene.js'
import { pointerTags } from './tree.js'
import { cellText, stateClass } from './util.js'

export function createLinkedList() {
  const scene = createScene()
  const update = panel => {
    const nodes = panel.nodes || []
    const pointers = panel.pointers || {}
    const highlight = new Set((panel.highlight || []).map(String))
    const state = panel.state || {}
    const boxW = 62
    const boxH = 36
    const gap = 34
    const pad = 22
    const pointerCount = Object.keys(pointers).length
    const stackHeight = Math.max(1, ...Object.values(countBy(Object.values(pointers))))
    const tagRoom = pointerCount ? 30 + 21 * (stackHeight - 1) : 6
    const indexOf = new Map(nodes.map((node, i) => [String(node.id), i]))
    const nextIndex = node => (node.next === null || node.next === undefined ? -1 : indexOf.get(String(node.next)) ?? -1)
    const hasLoop = nodes.some((node, i) => {
      const j = nextIndex(node)
      return j >= 0 && Math.abs(j - i) !== 1
    }) || (panel.cycleTo !== undefined && panel.cycleTo !== null)
    const cy = pad + tagRoom + boxH / 2
    const hasNull = Object.values(pointers).some(target => target === null)
    const slots = nodes.length + (hasNull ? 1 : 0)
    const width = Math.max(200, pad * 2 + slots * boxW + Math.max(0, slots - 1) * gap)
    const height = cy + boxH / 2 + (hasLoop ? 58 : 22) + pad / 2
    const xOf = i => pad + boxW / 2 + i * (boxW + gap)
    const sceneNodes = nodes.map((node, i) => {
      const status = highlight.has(String(node.id)) ? 'current' : state[node.id]
      return {
        key: node.id, shape: 'llnode', w: boxW, h: boxH, x: xOf(i), y: cy,
        label: cellText(node.val), sub: nextIndex(node) >= 0 ? '•' : '∅', cls: stateClass(status),
      }
    })
    const links = new Set()
    nodes.forEach((node, i) => {
      const j = nextIndex(node)
      if (j >= 0) links.add(`${i}>${j}`)
    })
    const edges = []
    nodes.forEach((node, i) => {
      const j = nextIndex(node)
      if (j < 0) return
      edges.push(linkEdge(`${node.id}`, i, j, links.has(`${j}>${i}`), xOf, cy, boxW, boxH, ''))
    })
    if (panel.cycleTo !== undefined && panel.cycleTo !== null && nodes.length) {
      const last = nodes.length - 1
      const target = indexOf.get(String(panel.cycleTo))
      if (target !== undefined && nextIndex(nodes[last]) !== target) edges.push(linkEdge('__cycle', last, target, false, xOf, cy, boxW, boxH, 'es-back'))
    }
    const nullX = xOf(nodes.length)
    const tags = pointerTags(pointers, target => {
      if (target === null) return { x: nullX, y: cy }
      const i = indexOf.get(String(target))
      return i === undefined ? null : { x: xOf(i), y: cy }
    }, boxH / 2 + 14)
    for (const [name, target] of Object.entries(pointers)) {
      if (target === null) {
        const tag = tags.find(item => item.key === name)
        if (tag) tag.cls = 'tag-ptr tag-null'
      }
    }
    if (hasNull) tags.push({ key: '__null', text: 'null', x: nullX, y: cy, cls: 'tag-empty', tick: false })
    if (!nodes.length && !hasNull) tags.push({ key: '__empty', text: 'empty', x: width / 2, y: cy, cls: 'tag-empty', tick: false })
    scene.update({ width, height, nodes: sceneNodes, edges, tags })
  }
  return { el: scene.el, update }
}

function linkEdge(key, i, j, paired, xOf, cy, boxW, boxH, cls) {
  const nextDot = boxW / 2 - 8
  if (j === i + 1) {
    const y = paired ? cy - 7 : cy
    return { key, d: linePath(xOf(i) + nextDot, y, xOf(j) - boxW / 2, y, 0, 2).d, arrow: true, cls, marker: cls ? 'back' : 'base' }
  }
  if (j === i - 1) {
    const y = paired ? cy + 7 : cy
    return { key, d: linePath(xOf(i) - boxW / 2, y, xOf(j) + boxW / 2, y, 0, 2).d, arrow: true, cls, marker: cls ? 'back' : 'base' }
  }
  const startX = xOf(i) + (j < i ? 0 : nextDot)
  const endX = xOf(j)
  const bottom = cy + boxH / 2
  const dip = bottom + 44
  const d = `M ${startX} ${bottom} Q ${(startX + endX) / 2} ${dip + 28} ${endX} ${bottom + 3}`
  return { key, d, arrow: true, cls: cls || 'es-back', marker: 'back' }
}

function countBy(values) {
  const counts = {}
  for (const value of values) counts[String(value)] = (counts[String(value)] || 0) + 1
  return counts
}
