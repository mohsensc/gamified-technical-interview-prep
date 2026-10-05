import { h } from '../ui/h.js'
import { createScene, linePath } from './scene.js'
import { createArray } from './array.js'
import { cellText } from './util.js'

export function createHeap() {
  const scene = createScene()
  const array = createArray()
  const el = h('div', { class: 'viz-heap' }, scene.el, array.el)
  const update = panel => {
    const items = panel.items || []
    const highlight = new Set((panel.highlight || []).map(Number))
    const depth = items.length ? Math.floor(Math.log2(items.length)) : 0
    const gapX = 46
    const gapY = 60
    const radius = 18
    const pad = 28
    const width = Math.max(220, 2 ** depth * gapX + pad * 2)
    const height = depth * gapY + pad * 2
    const positionOf = index => {
      const level = Math.floor(Math.log2(index + 1))
      const slot = index + 1 - 2 ** level
      return { x: pad + ((slot + 0.5) / 2 ** level) * (width - 2 * pad), y: pad + level * gapY }
    }
    const nodes = items.map((item, index) => ({
      key: index, ...positionOf(index), r: radius, label: cellText(item), cls: highlight.has(index) ? 'st-current' : index === 0 ? 'st-root' : '',
    }))
    const edges = items.slice(1).map((item, offset) => {
      const index = offset + 1
      const a = positionOf(Math.floor((index - 1) / 2))
      const b = positionOf(index)
      return { key: index, d: linePath(a.x, a.y, b.x, b.y, radius, radius).d, cls: highlight.has(index) ? 'es-active' : '' }
    })
    scene.update({ width, height: Math.max(height, 70), nodes, edges })
    array.update({ values: items, highlight: panel.highlight || [], pointers: {} })
  }
  return { el, update }
}
