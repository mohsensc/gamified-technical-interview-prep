import { h } from '../ui/h.js'
import { createArray } from './array.js'
import { createHashmap, createSet, createStack, createQueue, createCallstack } from './collections.js'
import { createLinkedList } from './linkedlist.js'
import { createTree } from './tree.js'
import { createGraph } from './graph.js'
import { createGrid } from './grid.js'
import { createHeap } from './heap.js'
import { createTable } from './table.js'
import { createIntervals, createText, createComplexity } from './misc.js'
import { prepareLayouts } from './layout.js'

export { prepareLayouts }

const factories = {
  array: createArray,
  hashmap: createHashmap,
  set: createSet,
  stack: createStack,
  queue: createQueue,
  deque: createQueue,
  linkedlist: createLinkedList,
  tree: createTree,
  graph: createGraph,
  grid: createGrid,
  heap: createHeap,
  callstack: createCallstack,
  table: createTable,
  intervals: createIntervals,
  text: createText,
  complexity: createComplexity,
}

const wideKinds = new Set(['array', 'linkedlist', 'tree', 'graph', 'grid', 'heap', 'table', 'intervals'])

const icons = {
  hashmap: '{}', set: '∪', stack: '▤', queue: '⇥', deque: '⇄', callstack: 'ƒ', heap: '△', complexity: 'ops',
}

function createSlot(kind) {
  const factory = factories[kind] || createText
  const instance = factory()
  const label = h('span', { class: 'viz-panel-label' })
  const head = h('div', { class: 'viz-panel-head' }, icons[kind] ? h('span', { class: 'viz-panel-icon' }, icons[kind]) : null, label)
  const body = h('div', { class: 'viz-panel-body' }, instance.el)
  const el = h('section', { class: `viz-panel viz-kind-${kind}${wideKinds.has(kind) ? ' is-wide' : ''}` }, head, body)
  return { kind, el, label, head, instance }
}

export function renderPanels(container, panels, ctx) {
  let root = container._vizRoot
  if (!root || root.parentNode !== container) {
    root = h('div', { class: 'viz-panels' })
    root._slots = []
    container.replaceChildren(root)
    container._vizRoot = root
  }
  const slots = root._slots
  const list = (Array.isArray(panels) ? panels : panels ? [panels] : []).filter(panel => panel && typeof panel === 'object')
  list.forEach((panel, i) => {
    const kind = factories[panel.kind] ? panel.kind : 'text'
    let slot = slots[i]
    if (!slot || slot.kind !== kind) {
      const fresh = createSlot(kind)
      if (slot) slot.el.replaceWith(fresh.el)
      else root.append(fresh.el)
      slots[i] = slot = fresh
    }
    const labelText = panel.label || (panel.kind === 'text' || panel.kind === 'complexity' ? '' : panel.kind)
    slot.label.textContent = labelText
    slot.head.style.display = labelText || slot.head.childNodes.length > 1 ? '' : 'none'
    slot.el.classList.toggle('is-sorted', Boolean(panel.sorted))
    try {
      slot.instance.update(factories[panel.kind] ? panel : { text: `Unknown panel: ${panel.kind}` }, ctx)
      slot.el.classList.remove('has-error')
    } catch (error) {
      slot.el.classList.add('has-error')
      console.error('viz panel failed', panel, error)
    }
  })
  while (slots.length > list.length) slots.pop().el.remove()
  root.classList.toggle('is-empty', !list.length)
  return root
}

export function renderPanel(panel, ctx) {
  const host = h('div', { class: 'viz-host' })
  renderPanels(host, [panel], ctx)
  return host
}
