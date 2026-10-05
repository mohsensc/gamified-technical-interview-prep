import { svg } from '../ui/h.js'
import { syncKeyed, setText, flash } from './util.js'

let sceneCounter = 0
const markerStates = ['base', 'tree', 'active', 'back', 'path', 'muted']

export function createScene() {
  const uid = `vz${++sceneCounter}`
  const defs = svg('defs', null, markerStates.map(state => svg('marker', {
    id: `${uid}-${state}`, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse',
  }, svg('path', { d: 'M0,0 L10,5 L0,10 z', class: `viz-arrowhead ah-${state}` }))))
  const edgeLayer = svg('g', { class: 'viz-edges' })
  const edgeLabelLayer = svg('g', { class: 'viz-edge-labels' })
  const nodeLayer = svg('g', { class: 'viz-nodes' })
  const tagLayer = svg('g', { class: 'viz-tags' })
  const root = svg('svg', { class: 'viz-scene', xmlns: 'http://www.w3.org/2000/svg' }, defs, edgeLayer, edgeLabelLayer, nodeLayer, tagLayer)

  const update = ({ width, height, nodes = [], edges = [], tags = [] }) => {
    root.setAttribute('viewBox', `0 0 ${Math.round(width)} ${Math.round(height)}`)
    root.style.maxWidth = `${Math.round(width * 1.15)}px`
    root.style.aspectRatio = `${width} / ${height}`

    syncKeyed(edgeLayer, edges, edge => edge.key, () => svg('path', { class: 'viz-edge' }), (node, edge) => {
      node.setAttribute('class', `viz-edge ${edge.cls || ''}`)
      node.setAttribute('d', edge.d)
      node.style.d = `path("${edge.d}")`
      if (edge.arrow) node.setAttribute('marker-end', `url(#${uid}-${edge.marker || 'base'})`)
      else node.removeAttribute('marker-end')
    })

    const labeled = edges.filter(edge => edge.label !== undefined && edge.label !== null && edge.label !== '')
    syncKeyed(edgeLabelLayer, labeled, edge => edge.key, () => svg('g', { class: 'viz-edge-label' },
      svg('rect', { rx: 4, ry: 4 }), svg('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central' })), (node, edge) => {
      const text = node.lastChild
      setText(text, edge.label)
      const width = Math.max(16, String(edge.label).length * 7 + 8)
      const rect = node.firstChild
      rect.setAttribute('x', -width / 2)
      rect.setAttribute('y', -9)
      rect.setAttribute('width', width)
      rect.setAttribute('height', 18)
      node.setAttribute('class', `viz-edge-label ${edge.cls || ''}`)
      node.style.transform = `translate(${edge.labelAt.x}px, ${edge.labelAt.y}px)`
    })

    syncKeyed(nodeLayer, nodes, node => node.key, item => makeNode(item), (node, item, index, fresh) => patchNode(node, item, fresh))

    syncKeyed(tagLayer, tags, tag => tag.key, () => svg('g', { class: 'viz-tag' },
      svg('rect', { rx: 5, ry: 5 }), svg('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central' }), svg('path', { class: 'viz-tag-tick' })), (node, tag) => {
      setText(node.childNodes[1], tag.text)
      const width = String(tag.text).length * 7 + 12
      const rect = node.firstChild
      rect.setAttribute('x', -width / 2)
      rect.setAttribute('y', -9)
      rect.setAttribute('width', width)
      rect.setAttribute('height', 18)
      node.childNodes[2].setAttribute('d', tag.tick === false ? '' : 'M-4,9 L0,14 L4,9 z')
      node.setAttribute('class', `viz-tag ${tag.cls || ''}`)
      node.style.transform = `translate(${tag.x}px, ${tag.y}px)`
    })
  }

  return { el: root, update }
}

function makeNode(item) {
  if (item.shape === 'llnode') {
    return svg('g', { class: 'viz-node' },
      svg('rect', { class: 'viz-shape', rx: 7, ry: 7 }),
      svg('line', { class: 'viz-divider' }),
      svg('text', { class: 'viz-label', 'text-anchor': 'middle', 'dominant-baseline': 'central' }),
      svg('text', { class: 'viz-next', 'text-anchor': 'middle', 'dominant-baseline': 'central' }),
      svg('text', { class: 'viz-note', 'text-anchor': 'middle', 'dominant-baseline': 'central' }))
  }
  return svg('g', { class: 'viz-node' },
    svg('circle', { class: 'viz-shape' }),
    svg('text', { class: 'viz-label', 'text-anchor': 'middle', 'dominant-baseline': 'central' }),
    svg('g', { class: 'viz-note-wrap' }, svg('rect', { rx: 4, ry: 4 }), svg('text', { class: 'viz-note', 'text-anchor': 'middle', 'dominant-baseline': 'central' })))
}

function patchNode(node, item, fresh) {
  node.setAttribute('class', `viz-node ${item.cls || ''}`)
  node.style.transform = `translate(${item.x}px, ${item.y}px)`
  const label = String(item.label ?? '')
  if (item.shape === 'llnode') {
    const width = item.w
    const height = item.h
    const shape = node.childNodes[0]
    shape.setAttribute('x', -width / 2)
    shape.setAttribute('y', -height / 2)
    shape.setAttribute('width', width)
    shape.setAttribute('height', height)
    const divider = node.childNodes[1]
    const split = width / 2 - 16
    divider.setAttribute('x1', split)
    divider.setAttribute('x2', split)
    divider.setAttribute('y1', -height / 2)
    divider.setAttribute('y2', height / 2)
    const labelEl = node.childNodes[2]
    labelEl.setAttribute('x', -8)
    labelEl.style.fontSize = label.length > 4 ? '11px' : ''
    if (setText(labelEl, label) && !fresh) flash(node)
    const nextEl = node.childNodes[3]
    nextEl.setAttribute('x', split + 8)
    setText(nextEl, item.sub ?? '')
    const note = node.childNodes[4]
    note.setAttribute('y', height / 2 + 13)
    setText(note, item.note ?? '')
    return
  }
  const radius = item.r || 18
  node.childNodes[0].setAttribute('r', radius)
  const labelEl = node.childNodes[1]
  labelEl.style.fontSize = label.length > 3 ? `${Math.max(9, 15 - label.length)}px` : ''
  if (setText(labelEl, label) && !fresh) flash(node)
  const wrap = node.childNodes[2]
  const note = item.note === undefined || item.note === null || item.note === '' ? '' : String(item.note)
  wrap.style.display = note ? '' : 'none'
  if (note) {
    const noteText = wrap.lastChild
    if (setText(noteText, note) && !fresh) flash(wrap)
    const width = note.length * 7 + 10
    const rect = wrap.firstChild
    rect.setAttribute('x', -width / 2)
    rect.setAttribute('y', -8)
    rect.setAttribute('width', width)
    rect.setAttribute('height', 16)
    wrap.setAttribute('transform', `translate(0 ${radius + 13})`)
  }
}

export function linePath(x1, y1, x2, y2, startTrim = 0, endTrim = 0, bend = 0) {
  const dx = x2 - x1
  const dy = y2 - y1
  const length = Math.hypot(dx, dy) || 1
  const ux = dx / length
  const uy = dy / length
  if (!bend) {
    const sx = x1 + ux * startTrim
    const sy = y1 + uy * startTrim
    const ex = x2 - ux * endTrim
    const ey = y2 - uy * endTrim
    return { d: `M ${r(sx)} ${r(sy)} Q ${r((sx + ex) / 2)} ${r((sy + ey) / 2)} ${r(ex)} ${r(ey)}`, mid: { x: (sx + ex) / 2, y: (sy + ey) / 2 } }
  }
  const mx = (x1 + x2) / 2 - uy * bend
  const my = (y1 + y2) / 2 + ux * bend
  const toControl = (px, py, trim) => {
    const vx = mx - px
    const vy = my - py
    const vl = Math.hypot(vx, vy) || 1
    return [px + (vx / vl) * trim, py + (vy / vl) * trim]
  }
  const [sx, sy] = toControl(x1, y1, startTrim)
  const [ex, ey] = toControl(x2, y2, endTrim)
  return { d: `M ${r(sx)} ${r(sy)} Q ${r(mx)} ${r(my)} ${r(ex)} ${r(ey)}`, mid: { x: (sx + 2 * mx + ex) / 4, y: (sy + 2 * my + ey) / 4 } }
}

const r = value => Math.round(value * 10) / 10
