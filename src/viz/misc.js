import { h } from '../ui/h.js'
import { syncKeyed, setText, cellText, flash } from './util.js'

export function createIntervals() {
  const lanes = h('div', { class: 'vi-lanes' })
  const merged = h('div', { class: 'vi-lanes vi-merged' })
  const axis = h('div', { class: 'vi-axis' })
  const el = h('div', { class: 'viz-intervals' }, lanes, merged, axis)
  const update = panel => {
    const intervals = panel.intervals || []
    const mergedList = panel.merged || []
    const all = [...intervals, ...mergedList].flat().filter(value => typeof value === 'number')
    const low = all.length ? Math.min(...all) : 0
    const high = all.length ? Math.max(...all) : 1
    const span = high - low || 1
    const highlight = new Set((panel.highlight || []).map(Number))
    const place = (node, [start, end]) => {
      node.style.left = `${((start - low) / span) * 100}%`
      node.style.width = `max(6px, ${((end - start) / span) * 100}%)`
    }
    const make = () => h('div', { class: 'vi-lane' }, h('div', { class: 'vi-bar' }, h('span')))
    syncKeyed(lanes, intervals, (item, i) => i, make, (node, item, i) => {
      const bar = node.firstChild
      place(bar, item)
      bar.classList.toggle('is-hl', highlight.has(i))
      setText(bar.firstChild, `${cellText(item[0])}–${cellText(item[1])}`)
    })
    merged.style.display = panel.merged ? '' : 'none'
    syncKeyed(merged, mergedList, (item, i) => i, make, (node, item) => {
      place(node.firstChild, item)
      setText(node.firstChild.firstChild, `${cellText(item[0])}–${cellText(item[1])}`)
    })
    const ticks = [...new Set(all)].sort((a, b) => a - b)
    const shown = ticks.length > 12 ? ticks.filter((_, i) => i % Math.ceil(ticks.length / 12) === 0) : ticks
    axis.replaceChildren(...shown.map(value => h('span', { style: { left: `${((value - low) / span) * 100}%` } }, cellText(value))))
  }
  return { el, update }
}

export function createText() {
  const el = h('div', { class: 'viz-text' })
  return { el, update: panel => setText(el, panel.text ?? '') }
}

export function createComplexity() {
  const ops = h('b')
  const size = h('b')
  const marker = h('div', { class: 'vx-marker' })
  const refs = h('div', { class: 'vx-refs' })
  const ratio = h('span', { class: 'vx-ratio' })
  const el = h('div', { class: 'viz-complexity' },
    h('div', { class: 'vx-counts' }, h('span', null, 'n ', size), h('span', null, 'ops ', ops), ratio),
    h('div', { class: 'vx-meter' }, refs, marker))
  const update = panel => {
    const n = Math.max(1, Number(panel.n) || 1)
    const count = Number(panel.ops) || 0
    if (setText(ops, count)) flash(ops)
    setText(size, n)
    const references = [['n', n], ['n log n', n * Math.max(1, Math.log2(n))], ['n²', n * n]]
    const top = Math.log2(Math.max(n * n, count, 2) * 1.6)
    const at = value => `${(Math.log2(Math.max(1, value)) / top) * 100}%`
    refs.replaceChildren(...references.map(([label, value]) => h('span', { style: { left: at(value) } }, label)))
    marker.style.width = at(count)
    setText(ratio, count ? `≈ ${Math.round((count / n) * 10) / 10}·n` : '')
  }
  return { el, update }
}
