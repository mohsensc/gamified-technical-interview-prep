import { h } from '../ui/h.js'
import { flash, setText, cellText } from './util.js'

export function createGrid() {
  const board = h('div', { class: 'vg-board' })
  const el = h('div', { class: 'viz-grid' }, board)
  let shape = ''
  let cellEls = []
  const update = panel => {
    const cells = panel.cells || []
    const rows = cells.length
    const cols = rows ? Math.max(...cells.map(row => row.length)) : 0
    const nextShape = `${rows}x${cols}`
    if (nextShape !== shape) {
      shape = nextShape
      const size = Math.max(18, Math.min(44, Math.floor(520 / Math.max(cols, 1)), Math.floor(420 / Math.max(rows, 1))))
      board.style.setProperty('--gcell', `${size}px`)
      board.style.gridTemplateColumns = `repeat(${cols}, var(--gcell))`
      cellEls = []
      board.replaceChildren()
      for (let r = 0; r < rows; r++) {
        cellEls.push([])
        for (let c = 0; c < cols; c++) {
          const cell = h('div', { class: 'vg-cell' }, h('span', { class: 'vg-val' }), h('span', { class: 'vg-note' }))
          cellEls[r].push(cell)
          board.append(cell)
        }
      }
    }
    const flat = cells.flat().map(value => String(value))
    const binary = flat.length && flat.every(value => value === '0' || value === '1')
    const state = panel.state || {}
    const values = panel.values || {}
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = cellEls[r][c]
        const value = cells[r][c]
        const key = `${r},${c}`
        const status = state[key]
        const isLand = binary && String(value) === '1'
        cell.className = `vg-cell${status ? ` st-${status}` : ''}${isLand ? ' is-land' : ''}${binary && !isLand ? ' is-water' : ''}`
        const changed = setText(cell.firstChild, value === undefined ? '' : cellText(value))
        setText(cell.lastChild, values[key] === undefined ? '' : cellText(values[key]))
        if (changed && cell._seen) flash(cell)
        cell._seen = true
      }
    }
  }
  return { el, update }
}
