import { h } from '../ui/h.js'
import { syncKeyed, flash, setText, cellText } from './util.js'

const gap = 4

export function createArray() {
  const cells = h('div', { class: 'va-cells' })
  const windowEl = h('div', { class: 'va-window' })
  const pointerLayer = h('div', { class: 'va-ptrs' })
  const el = h('div', { class: 'viz-array' }, pointerLayer, h('div', { class: 'va-track' }, windowEl, cells))
  const update = panel => {
    const values = Array.isArray(panel.values) ? panel.values : []
    const texts = values.map(cellText)
    const longest = Math.max(1, ...texts.map(text => text.length))
    const cellWidth = values.length > 24 ? 28 : Math.max(36, Math.min(76, longest * 9 + 18))
    el.style.setProperty('--cell', `${cellWidth}px`)
    el.classList.toggle('is-sorted', Boolean(panel.sorted))
    const highlight = new Set((panel.highlight || []).map(Number))
    const dim = new Set((panel.dim || []).map(Number))
    const [left, right] = Array.isArray(panel.window) ? panel.window : [null, null]
    const inWindow = i => left !== null && left !== undefined && i >= left && i <= right
    syncKeyed(cells, texts, (text, i) => i, () => h('div', { class: 'va-cell' }, h('span', { class: 'va-val' }), h('span', { class: 'va-idx' })), (node, text, i, fresh) => {
      node.className = `va-cell${highlight.has(i) ? ' is-hl' : ''}${dim.has(i) ? ' is-dim' : ''}${inWindow(i) ? ' in-window' : ''}`
      if (setText(node.firstChild, text) && !fresh) flash(node)
      setText(node.lastChild, i)
    })
    if (!values.length) {
      cells.replaceChildren(h('div', { class: 'viz-empty' }, '[]'))
      cells._keyed = new Map()
    }
    const showWindow = left !== null && left !== undefined && right !== null && right !== undefined && right >= left
    windowEl.style.display = showWindow ? '' : 'none'
    if (showWindow) {
      windowEl.style.transform = `translateX(${left * (cellWidth + gap) - 3}px)`
      windowEl.style.width = `${(right - left + 1) * (cellWidth + gap) - gap + 6}px`
    }
    const stacks = new Map()
    const entries = Object.entries(panel.pointers || {})
      .filter(([, index]) => typeof index === 'number' && Number.isFinite(index))
      .map(([name, index]) => {
        const level = stacks.get(index) || 0
        stacks.set(index, level + 1)
        return { name, index, level }
      })
    const maxLevel = Math.max(0, ...entries.map(entry => entry.level))
    pointerLayer.style.height = entries.length ? `${24 + maxLevel * 20}px` : '6px'
    syncKeyed(pointerLayer, entries, entry => entry.name, entry => h('div', { class: 'va-ptr' }, h('span', null, entry.name)), (node, entry) => {
      const x = entry.index * (cellWidth + gap) + cellWidth / 2
      node.style.transform = `translate(${x}px, ${-entry.level * 20}px)`
      node.classList.toggle('is-out', entry.index < 0 || entry.index >= values.length)
      node.classList.toggle('is-stacked', entry.level > 0)
    })
  }
  return { el, update }
}
