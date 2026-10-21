import { h, svg } from './h.js'

function makeTooltip(wrap) {
  const tip = h('div', { class: 'chart-tip' })
  wrap.append(tip)
  let visible = false
  return {
    show(x, y, content) {
      tip.replaceChildren(...(Array.isArray(content) ? content : [content]))
      tip.style.left = `${Math.max(4, x)}px`
      tip.style.top = `${Math.max(0, y)}px`
      if (!visible) {
        visible = true
        requestAnimationFrame(() => tip.classList.add('show'))
      }
      const rect = tip.getBoundingClientRect()
      const wrapRect = wrap.getBoundingClientRect()
      if (rect.right > wrapRect.right) tip.style.left = `${Math.max(4, x - (rect.right - wrapRect.right))}px`
    },
    hide() {
      if (!visible) return
      visible = false
      tip.classList.remove('show')
    },
  }
}

const emptyState = text => h('div', { class: 'chart-empty muted small' }, text)
const clamp01 = v => Math.max(0, Math.min(1, v))
const describe = (wrap, label) => {
  if (!label) return wrap
  wrap.setAttribute('role', 'img')
  wrap.setAttribute('aria-label', label)
  return wrap
}

export function sparkline(values = [], opts = {}) {
  const { width = 90, height = 26, color = 'var(--accent)' } = opts
  const wrap = h('span', { class: 'chart-spark' })
  const clean = values.filter(v => Number.isFinite(v))
  if (clean.length < 2) return wrap
  const min = Math.min(...clean)
  const max = Math.max(...clean)
  const span = max - min || 1
  const step = width / (clean.length - 1)
  const pts = clean.map((v, i) => `${(i * step).toFixed(1)},${(height - ((v - min) / span) * height).toFixed(1)}`)
  wrap.append(svg('svg', { viewBox: `0 0 ${width} ${height}`, class: 'chart-spark-svg' },
    svg('path', { d: `M${pts.join(' L')}`, class: 'chart-spark-path', style: { stroke: color } })))
  return wrap
}

export function lineChart(series = [], opts = {}) {
  const {
    width = 560, height = 170,
    padding = { top: 10, right: 12, bottom: 22, left: 36 },
    yFormat = v => String(Math.round(v)),
    area = false, yMin, yMax, xLabels = [], emptyText = 'No data yet', ariaLabel,
  } = opts
  const wrap = h('div', { class: 'chart-wrap chart-line' })
  const usable = series.filter(s => s.points?.length)
  if (!usable.length) {
    wrap.append(emptyState(emptyText))
    return wrap
  }
  const allPoints = usable.flatMap(s => s.points)
  const xs = allPoints.map(p => p.x)
  const ys = allPoints.map(p => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = yMin ?? Math.min(0, ...ys)
  const maxY = yMax ?? Math.max(1, ...ys)
  const innerW = width - padding.left - padding.right
  const innerH = height - padding.top - padding.bottom
  const xScale = x => (maxX === minX ? padding.left + innerW / 2 : padding.left + ((x - minX) / (maxX - minX)) * innerW)
  const yScale = y => (maxY === minY ? padding.top + innerH : padding.top + innerH - ((y - minY) / (maxY - minY)) * innerH)

  const gridNodes = []
  const steps = 4
  for (let i = 0; i <= steps; i++) {
    const y = padding.top + innerH - (i / steps) * innerH
    const value = minY + (i / steps) * (maxY - minY)
    gridNodes.push(svg('line', { x1: padding.left, x2: width - padding.right, y1: y, y2: y, class: 'chart-grid-line' }))
    gridNodes.push(svg('text', { x: padding.left - 6, y: y + 3, class: 'chart-axis-label', 'text-anchor': 'end' }, yFormat(value)))
  }

  const seriesNodes = usable.map(s => {
    const pts = s.points
    const base = (padding.top + innerH).toFixed(1)
    const linePath = pts.map((p, i) => `${i ? 'L' : 'M'}${xScale(p.x).toFixed(1)},${yScale(p.y).toFixed(1)}`).join(' ')
    const parts = []
    if (area) {
      const areaPath = `${linePath} L${xScale(pts[pts.length - 1].x).toFixed(1)},${base} L${xScale(pts[0].x).toFixed(1)},${base} Z`
      parts.push(svg('path', { d: areaPath, class: 'chart-area-fill', style: { fill: s.color || 'var(--accent)' } }))
    }
    parts.push(svg('path', { d: linePath, class: 'chart-line-path', style: { stroke: s.color || 'var(--accent)' } }))
    parts.push(...pts.map(p => svg('circle', { cx: xScale(p.x), cy: yScale(p.y), r: 2.6, class: 'chart-dot', style: { fill: s.color || 'var(--accent)' } })))
    return svg('g', { class: 'chart-series' }, parts)
  })

  const labelNodes = xLabels.map(lbl => svg('text', { x: xScale(lbl.x), y: height - 4, class: 'chart-axis-label', 'text-anchor': 'middle' }, lbl.text))

  const hoverLine = svg('line', { x1: -999, x2: -999, y1: padding.top, y2: padding.top + innerH, class: 'chart-hover-line' })
  const tooltip = makeTooltip(wrap)
  const ref = usable[0].points

  const onMove = event => {
    const rect = svgNode.getBoundingClientRect()
    if (!rect.width) return
    const localX = ((event.clientX - rect.left) / rect.width) * width
    const dataX = minX + ((localX - padding.left) / innerW) * (maxX - minX)
    let nearest = ref[0]
    let dist = Infinity
    for (const p of ref) {
      const d = Math.abs(p.x - dataX)
      if (d < dist) {
        dist = d
        nearest = p
      }
    }
    const px = xScale(nearest.x)
    hoverLine.setAttribute('x1', px)
    hoverLine.setAttribute('x2', px)
    hoverLine.classList.add('show')
    const rows = usable.map(s => {
      const pt = s.points.find(p => p.x === nearest.x)
      if (!pt) return null
      return h('div', { class: 'chart-tip-row' }, h('i', { style: { background: s.color || 'var(--accent)' } }), s.name ? h('span', null, `${s.name} `) : null, h('b', null, yFormat(pt.y)))
    }).filter(Boolean)
    const wrapRect = wrap.getBoundingClientRect()
    tooltip.show(rect.left - wrapRect.left + (px / width) * rect.width, rect.top - wrapRect.top - 6, [h('div', { class: 'chart-tip-label' }, nearest.label ?? yFormat(nearest.x)), ...rows])
  }
  const onLeave = () => {
    hoverLine.classList.remove('show')
    tooltip.hide()
  }

  const svgNode = svg('svg', {
    viewBox: `0 0 ${width} ${height}`, class: 'chart-svg', preserveAspectRatio: 'none',
    onmousemove: onMove, onmouseleave: onLeave,
  }, gridNodes, seriesNodes, labelNodes, hoverLine)

  wrap.append(svgNode)
  return describe(wrap, ariaLabel)
}

export function barChart(items = [], opts = {}) {
  const {
    width = 560, height = 170,
    padding = { top: 10, right: 10, bottom: 22, left: 36 },
    yFormat = v => String(Math.round(v)), maxValue, emptyText = 'No data yet', ariaLabel,
  } = opts
  const wrap = h('div', { class: 'chart-wrap chart-bar' })
  if (!items.length) {
    wrap.append(emptyState(emptyText))
    return wrap
  }
  const innerW = width - padding.left - padding.right
  const innerH = height - padding.top - padding.bottom
  const allVals = items.flatMap(it => it.values.map(v => v.value))
  const maxY = Math.max(1, maxValue ?? Math.max(...allVals, 0))
  const groupW = innerW / items.length
  const gap = Math.min(4, groupW * 0.12)
  const tooltip = makeTooltip(wrap)

  const gridNodes = []
  const steps = 3
  for (let i = 0; i <= steps; i++) {
    const y = padding.top + innerH - (i / steps) * innerH
    gridNodes.push(svg('line', { x1: padding.left, x2: width - padding.right, y1: y, y2: y, class: 'chart-grid-line' }))
    gridNodes.push(svg('text', { x: padding.left - 6, y: y + 3, class: 'chart-axis-label', 'text-anchor': 'end' }, yFormat((i / steps) * maxY)))
  }

  const barNodes = items.flatMap((item, i) => {
    const n = item.values.length
    const bw = Math.max(1, (groupW - gap * (n + 1)) / n)
    return item.values.map((v, j) => {
      const x = padding.left + i * groupW + gap + j * (bw + gap)
      const barH = Math.max(0, (v.value / maxY) * innerH)
      const y = padding.top + innerH - barH
      return svg('rect', {
        x, y, width: bw, height: barH, rx: 2, class: 'chart-bar-rect',
        style: { fill: v.color || 'var(--accent)' },
        onmouseenter: event => {
          const wrapRect = wrap.getBoundingClientRect()
          const rect = event.currentTarget.getBoundingClientRect()
          tooltip.show(rect.left - wrapRect.left + rect.width / 2, rect.top - wrapRect.top - 10, [
            h('div', { class: 'chart-tip-label' }, item.label),
            h('div', { class: 'chart-tip-row' }, v.name ? h('span', null, `${v.name} `) : null, h('b', null, yFormat(v.value))),
          ])
        },
        onmouseleave: () => tooltip.hide(),
      })
    })
  })

  const labelNodes = items.map((item, i) => svg('text', {
    x: padding.left + i * groupW + groupW / 2, y: height - 4, class: 'chart-axis-label', 'text-anchor': 'middle',
  }, item.label))

  wrap.append(svg('svg', { viewBox: `0 0 ${width} ${height}`, class: 'chart-svg' }, gridNodes, barNodes, labelNodes))
  return describe(wrap, ariaLabel)
}

const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const weekdayShort = ['', 'Mon', '', 'Wed', '', 'Fri', '']

export function heatmapCalendar(days = [], opts = {}) {
  const {
    cell = 11, gap = 3, colorVar = 'var(--accent)', emptyText = 'No activity yet',
    axisLabels = true, legend = false, ghost = false, ariaLabel,
  } = opts
  const wrap = h('div', { class: `chart-wrap chart-cal${ghost ? ' chart-ghost' : ''}` })
  if (!days.length) {
    wrap.append(emptyState(emptyText))
    return wrap
  }
  const firstWeekday = new Date(`${days[0].date}T00:00:00`).getDay()
  const cells = [...Array(firstWeekday).fill(null), ...days]
  const weeks = Math.ceil(cells.length / 7)
  const topPad = axisLabels ? 14 : 0
  const leftPad = axisLabels ? 20 : 0
  const width = leftPad + weeks * (cell + gap) + gap
  const gridHeight = 7 * (cell + gap) + gap
  const height = topPad + gridHeight
  const maxVal = Math.max(1, ...days.map(d => d.value))
  const tooltip = ghost ? null : makeTooltip(wrap)

  const rects = cells.map((d, idx) => {
    const week = Math.floor(idx / 7)
    const day = idx % 7
    const x = leftPad + gap + week * (cell + gap)
    const y = topPad + gap + day * (cell + gap)
    if (!d) return svg('rect', { x, y, width: cell, height: cell, rx: 3, class: 'chart-cal-cell is-empty' })
    const t = d.value / maxVal
    return svg('rect', {
      x, y, width: cell, height: cell, rx: 3, class: 'chart-cal-cell',
      style: { fill: t <= 0 ? 'var(--surface-3)' : `color-mix(in srgb, ${colorVar} ${Math.round(15 + t * 85)}%, var(--surface-3))` },
      onmouseenter: tooltip ? event => {
        const wrapRect = wrap.getBoundingClientRect()
        const rect = event.currentTarget.getBoundingClientRect()
        tooltip.show(rect.left - wrapRect.left + rect.width / 2, rect.top - wrapRect.top - 10, [
          h('div', { class: 'chart-tip-label' }, d.label || d.date),
        ])
      } : null,
      onmouseleave: tooltip ? () => tooltip.hide() : null,
    })
  })

  const axisNodes = []
  if (axisLabels) {
    weekdayShort.forEach((label, day) => {
      if (!label) return
      axisNodes.push(svg('text', { x: leftPad - 6, y: topPad + gap + day * (cell + gap) + cell * 0.8, class: 'chart-axis-label', 'text-anchor': 'end' }, label))
    })
    let lastMonth = -1
    cells.forEach((d, idx) => {
      if (!d) return
      const month = new Date(`${d.date}T00:00:00`).getMonth()
      if (month === lastMonth) return
      lastMonth = month
      const week = Math.floor(idx / 7)
      axisNodes.push(svg('text', { x: leftPad + gap + week * (cell + gap), y: topPad - 4, class: 'chart-axis-label' }, monthShort[month]))
    })
  }

  wrap.append(svg('svg', { viewBox: `0 0 ${width} ${height}`, class: 'chart-svg chart-cal-svg' }, axisNodes, rects))
  if (legend) {
    const steps = [0, 0.25, 0.5, 0.75, 1]
    wrap.append(h('div', { class: 'chart-cal-legend small muted' }, 'Less',
      steps.map(t => h('i', { style: { background: t <= 0 ? 'var(--surface-3)' : `color-mix(in srgb, ${colorVar} ${Math.round(15 + t * 85)}%, var(--surface-3))` } })),
      'More'))
  }
  return describe(wrap, ariaLabel)
}

export function heatmapRow(cells = [], opts = {}) {
  const { cellW = 20, cellH = 30, gap = 3, color = 'var(--sky)', emptyText = 'No activity yet', ariaLabel } = opts
  const wrap = h('div', { class: 'chart-wrap chart-row' })
  if (!cells.length) {
    wrap.append(emptyState(emptyText))
    return wrap
  }
  const maxVal = Math.max(1, ...cells.map(c => c.value))
  const width = cells.length * (cellW + gap) + gap
  const height = cellH + gap * 2 + 14
  const tooltip = makeTooltip(wrap)

  const rects = cells.map((c, i) => {
    const x = gap + i * (cellW + gap)
    const t = c.value / maxVal
    return svg('rect', {
      x, y: gap, width: cellW, height: cellH, rx: 4, class: 'chart-cal-cell',
      style: { fill: t <= 0 ? 'var(--surface-3)' : `color-mix(in srgb, ${color} ${Math.round(15 + t * 85)}%, var(--surface-3))` },
      onmouseenter: event => {
        const wrapRect = wrap.getBoundingClientRect()
        const rect = event.currentTarget.getBoundingClientRect()
        tooltip.show(rect.left - wrapRect.left + rect.width / 2, rect.top - wrapRect.top - 10, [
          h('div', { class: 'chart-tip-label' }, c.label || ''),
          h('div', { class: 'chart-tip-row' }, h('b', null, String(c.value))),
        ])
      },
      onmouseleave: () => tooltip.hide(),
    })
  })
  const labels = cells.map((c, i) => (c.shortLabel ? svg('text', {
    x: gap + i * (cellW + gap) + cellW / 2, y: height - 2, class: 'chart-axis-label', 'text-anchor': 'middle',
  }, c.shortLabel) : null)).filter(Boolean)

  wrap.append(svg('svg', { viewBox: `0 0 ${width} ${height}`, class: 'chart-svg' }, rects, labels))
  return describe(wrap, ariaLabel)
}

export function beforeAfterBars(items = [], opts = {}) {
  const {
    max = 1, rowH = 20, gap = 7, width = 560,
    formatValue = v => `${Math.round(v * 100)}%`, emptyText = 'No data yet', labelWidth = 150, ariaLabel,
  } = opts
  const wrap = h('div', { class: 'chart-wrap chart-delta' })
  if (!items.length) {
    wrap.append(emptyState(emptyText))
    return wrap
  }
  const valueWidth = 46
  const barAreaW = Math.max(40, width - labelWidth - valueWidth)
  const height = items.length * (rowH + gap) + gap
  const tooltip = makeTooltip(wrap)

  const rows = items.map((item, i) => {
    const y = gap + i * (rowH + gap)
    const beforeW = Math.max(0, item.before / max) * barAreaW
    const afterW = Math.max(0, item.after / max) * barAreaW
    const up = item.after >= item.before
    const lo = Math.min(beforeW, afterW)
    const hi = Math.max(beforeW, afterW)
    const group = svg('g', {
      class: 'chart-delta-row',
      onmouseenter: event => {
        const wrapRect = wrap.getBoundingClientRect()
        const rect = event.currentTarget.getBoundingClientRect()
        tooltip.show(rect.left - wrapRect.left + labelWidth, rect.top - wrapRect.top - 6, [
          h('div', { class: 'chart-tip-label' }, item.label),
          h('div', { class: 'chart-tip-row' }, h('span', null, 'first day '), h('b', null, formatValue(item.before))),
          h('div', { class: 'chart-tip-row' }, h('span', null, 'now '), h('b', null, formatValue(item.after))),
        ])
      },
      onmouseleave: () => tooltip.hide(),
    },
    svg('text', { x: 0, y: y + rowH * 0.7, class: 'chart-delta-label' }, item.label),
    svg('rect', { x: labelWidth, y, width: barAreaW, height: rowH, rx: 6, class: 'chart-delta-track' }),
    svg('rect', { x: labelWidth, y, width: Math.max(2, lo), height: rowH, rx: 6, class: 'chart-delta-before' }),
    hi > lo ? svg('rect', { x: labelWidth + lo, y, width: hi - lo, height: rowH, rx: 6, class: `chart-delta-change ${up ? 'up' : 'down'}` }) : null,
    svg('text', { x: labelWidth + barAreaW + 8, y: y + rowH * 0.7, class: 'chart-delta-value' }, formatValue(item.after)))
    return group
  })

  wrap.append(svg('svg', { viewBox: `0 0 ${width} ${height}`, class: 'chart-svg chart-delta-svg' }, rows))
  return describe(wrap, ariaLabel)
}

export function radarChart(axes = [], opts = {}) {
  const {
    size = 230, levels = 4, max = 1, color = 'var(--accent)', ghost = false,
    formatValue = v => `${Math.round(v * 100)}%`, emptyText = 'No data yet', ariaLabel,
  } = opts
  const wrap = h('div', { class: `chart-wrap chart-radar${ghost ? ' chart-ghost' : ''}` })
  if (axes.length < 3) {
    wrap.append(emptyState(emptyText))
    return wrap
  }
  const n = axes.length
  const center = size / 2
  const labelPad = 30
  const r = center - labelPad
  const angleFor = i => -Math.PI / 2 + (i / n) * Math.PI * 2
  const pointAt = (i, frac) => [center + Math.cos(angleFor(i)) * r * frac, center + Math.sin(angleFor(i)) * r * frac]

  const ringNodes = []
  for (let level = 1; level <= levels; level++) {
    const frac = level / levels
    const pts = axes.map((_, i) => pointAt(i, frac).join(',')).join(' ')
    ringNodes.push(svg('polygon', { points: pts, class: 'chart-radar-ring' }))
  }
  const spokeNodes = axes.map((_, i) => {
    const [x, y] = pointAt(i, 1)
    return svg('line', { x1: center, y1: center, x2: x, y2: y, class: 'chart-radar-spoke' })
  })

  const labelNodes = axes.map((axis, i) => {
    const [x, y] = pointAt(i, 1.17)
    const angle = angleFor(i)
    const anchor = Math.cos(angle) > 0.3 ? 'start' : Math.cos(angle) < -0.3 ? 'end' : 'middle'
    return svg('text', { x, y: y + 4, class: 'chart-axis-label chart-radar-label', 'text-anchor': anchor }, axis.label)
  })

  const dataPts = axes.map((axis, i) => pointAt(i, clamp01((axis.value ?? 0) / max)))
  const dataPath = `${dataPts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')} Z`
  const tooltip = ghost ? null : makeTooltip(wrap)
  const dotNodes = axes.map((axis, i) => svg('circle', {
    cx: dataPts[i][0], cy: dataPts[i][1], r: 3.2, class: 'chart-radar-dot', style: { fill: color },
    onmouseenter: tooltip ? event => {
      const wrapRect = wrap.getBoundingClientRect()
      const rect = event.currentTarget.getBoundingClientRect()
      tooltip.show(rect.left - wrapRect.left + rect.width / 2, rect.top - wrapRect.top - 8, [
        h('div', { class: 'chart-tip-label' }, axis.label),
        h('div', { class: 'chart-tip-row' }, h('b', null, formatValue(axis.value ?? 0))),
      ])
    } : null,
    onmouseleave: tooltip ? () => tooltip.hide() : null,
  }))

  wrap.append(svg('svg', { viewBox: `0 0 ${size} ${size}`, class: 'chart-svg chart-radar-svg' },
    ringNodes, spokeNodes,
    svg('path', { d: dataPath, class: 'chart-radar-fill', style: { fill: color, stroke: color } }),
    dotNodes, labelNodes))
  wrap.append(h('ul', { class: 'sr-only' }, axes.map(axis => h('li', null, `${axis.label}: ${formatValue(axis.value ?? 0)}`))))
  return describe(wrap, ariaLabel)
}
