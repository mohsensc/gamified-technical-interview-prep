import { h } from '../ui/h.js'
import { syncKeyed, flash, setText, cellText, formatValue } from './util.js'

const emptyNote = text => h('div', { class: 'viz-empty' }, text)

function toggleEmpty(host, list, text) {
  let note = host.querySelector(':scope > .viz-empty')
  if (!list.length && !note) host.append(note = emptyNote(text))
  if (list.length && note) note.remove()
}

export function createHashmap() {
  const rows = h('div', { class: 'vh-rows' })
  const el = h('div', { class: 'viz-hashmap' }, rows)
  const update = panel => {
    const raw = panel.entries || []
    const entries = Array.isArray(raw) ? raw : raw instanceof Map ? [...raw] : Object.entries(raw)
    const highlight = new Set((panel.highlight || []).map(key => formatValue(key)))
    syncKeyed(rows, entries, ([key]) => formatValue(key), () => h('div', { class: 'vh-row' },
      h('span', { class: 'vh-key' }), h('span', { class: 'vh-arrow' }, '→'), h('span', { class: 'vh-val' })), (node, [key, value], i, fresh) => {
      node.classList.toggle('is-hl', highlight.has(formatValue(key)))
      setText(node.firstChild, cellText(key))
      if (setText(node.lastChild, formatValue(value, 1).replace(/^'(.*)'$/, '$1')) && !fresh) flash(node)
    })
    toggleEmpty(el, entries, '{ }')
  }
  return { el, update }
}

export function createSet() {
  const chips = h('div', { class: 'vset-items' })
  const el = h('div', { class: 'viz-set' }, chips)
  const update = panel => {
    const raw = panel.items || []
    const items = Array.isArray(raw) ? raw : [...raw]
    const highlight = new Set((panel.highlight || []).map(item => formatValue(item)))
    syncKeyed(chips, items, item => formatValue(item), () => h('span', { class: 'vset-chip' }), (node, item) => {
      setText(node, cellText(item))
      node.classList.toggle('is-hl', highlight.has(formatValue(item)))
    })
    toggleEmpty(el, items, 'set()')
  }
  return { el, update }
}

export function createStack() {
  const list = h('div', { class: 'vs-items' })
  const el = h('div', { class: 'viz-stack' }, list, h('div', { class: 'vs-base' }))
  const update = panel => {
    const items = panel.items || []
    const highlight = new Set((panel.highlight || []).map(Number))
    const ordered = items.map((item, i) => ({ item, i })).reverse()
    syncKeyed(list, ordered, entry => entry.i, () => h('div', { class: 'vs-item' }, h('span', { class: 'vs-val' }), h('span', { class: 'vs-top' }, 'top')), (node, entry, index, fresh) => {
      node.classList.toggle('is-hl', highlight.has(entry.i))
      node.classList.toggle('is-top', entry.i === items.length - 1)
      if (setText(node.firstChild, cellText(entry.item)) && !fresh) flash(node)
    })
    toggleEmpty(list, items, 'empty')
  }
  return { el, update }
}

const same = (a, b) => formatValue(a) === formatValue(b)

export function createQueue() {
  const list = h('div', { class: 'vq-items' })
  const el = h('div', { class: 'viz-queue' }, h('span', { class: 'vq-end' }, 'front'), list, h('span', { class: 'vq-end' }, 'back'))
  let previous = []
  let offset = 0
  const update = panel => {
    const items = panel.items || []
    let shift = -1
    for (let k = 0; k <= previous.length; k++) {
      const rest = previous.slice(k)
      if (rest.length <= items.length && rest.every((item, i) => same(item, items[i]))) {
        shift = k
        break
      }
    }
    offset += shift >= 0 ? shift : previous.length + 1
    previous = items.slice()
    const highlight = new Set((panel.highlight || []).map(Number))
    syncKeyed(list, items, (item, i) => offset + i, () => h('div', { class: 'vq-item' }), (node, item, i) => {
      setText(node, cellText(item))
      node.classList.toggle('is-hl', highlight.has(i))
      node.classList.toggle('is-front', i === 0)
    })
    toggleEmpty(list, items, 'empty')
  }
  return { el, update }
}

export function createCallstack() {
  const list = h('div', { class: 'vc-items' })
  const el = h('div', { class: 'viz-callstack' }, list)
  const update = panel => {
    const frames = panel.frames || []
    const ordered = frames.map((frame, i) => ({ frame, i })).reverse()
    syncKeyed(list, ordered, entry => entry.i, () => h('div', { class: 'vc-frame' }), (node, entry) => {
      setText(node, entry.frame)
      node.classList.toggle('is-top', entry.i === frames.length - 1)
    })
    toggleEmpty(list, frames, 'no calls')
  }
  return { el, update }
}
