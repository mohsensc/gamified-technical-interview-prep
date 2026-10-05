import { h } from '../ui/h.js'
import { flash, setText, cellText } from './util.js'

export function createTable() {
  const table = h('table', { class: 'vt-table' })
  const el = h('div', { class: 'viz-table' }, table)
  let shape = ''
  let cellEls = []
  const update = panel => {
    const rows = (panel.rows || []).map(row => (Array.isArray(row) ? row : [row]))
    const cols = Math.max(0, ...rows.map(row => row.length))
    const colLabels = panel.colLabels || null
    const rowLabels = panel.rowLabels || null
    const nextShape = `${rows.length}x${cols}|${JSON.stringify(colLabels)}|${JSON.stringify(rowLabels)}`
    if (nextShape !== shape) {
      shape = nextShape
      cellEls = []
      const head = colLabels ? h('thead', null, h('tr', null, rowLabels ? h('th', { class: 'vt-corner' }) : null,
        Array.from({ length: cols }, (_, c) => h('th', null, cellText(colLabels[c] ?? ''))))) : null
      const body = h('tbody', null, rows.map((row, r) => {
        const tds = Array.from({ length: cols }, () => h('td', { class: 'vt-cell' }))
        cellEls.push(tds)
        return h('tr', null, rowLabels ? h('th', null, cellText(rowLabels[r] ?? '')) : null, tds)
      }))
      table.replaceChildren(...[head, body].filter(Boolean))
      table._fresh = true
    }
    const highlight = new Set(panel.highlight || [])
    const deps = new Set(panel.deps || [])
    rows.forEach((row, r) => {
      for (let c = 0; c < cols; c++) {
        const cell = cellEls[r][c]
        const key = `${r},${c}`
        const value = row[c]
        cell.className = `vt-cell${highlight.has(key) ? ' is-hl' : ''}${deps.has(key) ? ' is-dep' : ''}${value === null || value === undefined || value === '' ? ' is-blank' : ''}`
        const changed = setText(cell, value === null || value === undefined ? '' : cellText(value))
        if (changed && !table._fresh) flash(cell)
      }
    })
    table._fresh = false
  }
  return { el, update }
}
