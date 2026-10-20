import { h, svg, clear } from '../ui/h.js'
import { icon } from '../ui/icons.js'
import { codeBlock } from '../ui/code.js'
import { parseCloze } from '../ui/items.js'
import { mountStepper } from '../viz/stepper.js'
import { navigate } from '../router.js'
import { getMastery, isSeen, getEvents, getBiteStatus } from '../store.js'
import { practiceHref } from '../engine/session.js'
import { allBites } from '../content/curriculum.js'
import { problems } from '../content/index.js'
import { skills as skillMeta } from '../content/skills.js'
import algorithmsContent from '../content/algorithms.js'
import { subnav } from '../ui/subnav.js'

const branches = algorithmsContent.branches
const branchById = Object.fromEntries(branches.map(b => [b.id, b]))
const treeNodes = algorithmsContent.tree
const algoById = Object.fromEntries(algorithmsContent.algorithms.map(a => [a.id, a]))
const traceById = Object.fromEntries(algorithmsContent.traces.map(t => [t.id, t]))
const clozeById = Object.fromEntries(algorithmsContent.clozes.map(c => [c.id, c]))
const paths = algorithmsContent.paths
const pathById = Object.fromEntries(paths.map(p => [p.id, p]))
const orderedIds = treeNodes.map(n => n.id)
const problemIdByLc = new Map(problems.filter(p => p.lc).map(p => [p.lc, p.id]))
const biteIdForAlgo = new Map(allBites.filter(b => b.type === 'algo').map(b => [b.ref, b.id]))

const slugOf = id => id.slice('algorithms:'.length)

const decode = value => {
  try { return decodeURIComponent(value) } catch { return value }
}

const readPref = (key, fallback) => {
  try { return localStorage.getItem(key) || fallback } catch { return fallback }
}
const writePref = (key, value) => {
  try { localStorage.setItem(key, value) } catch {}
}

let richFn = null
let richLoaded = false
async function loadRich() {
  if (richLoaded) return richFn
  richLoaded = true
  try {
    const mod = await import('../ui/rich.js')
    richFn = typeof mod.rich === 'function' ? mod.rich : null
  } catch {
    richFn = null
  }
  return richFn
}

const plainText = text => String(text ?? '').replace(/==([^=]+)==/g, '$1')

function rich(text) {
  if (!text) return document.createTextNode('')
  if (richFn) {
    try { return richFn(text) } catch {}
  }
  return document.createTextNode(plainText(text))
}

const safeMastery = skill => {
  try { return getMastery(skill) } catch { return 0.3 }
}
const safeSeen = id => {
  try { return isSeen(id) } catch { return false }
}
const safeBiteStatus = id => {
  try { return getBiteStatus(id) } catch { return { done: false } }
}
const safeEvents = filter => {
  try { return getEvents(filter) } catch { return [] }
}

function quizAccuracy(algo) {
  const slug = slugOf(algo.id)
  const events = safeEvents({ type: ['answer', 'card'] }).filter(e => e.itemId && e.itemId.startsWith('algorithms:') && e.itemId.includes(slug))
  if (!events.length) return null
  const correct = events.filter(e => e.correct).length
  return correct / events.length
}

function doneSignal(algo) {
  const biteId = biteIdForAlgo.get(algo.id)
  if (biteId && safeBiteStatus(biteId).done) return 1
  if (algo.traceId && safeSeen(algo.traceId)) return 0.6
  return 0
}

function masteryScore(algo) {
  const ids = (algo.skills || []).filter(id => id !== 'communication')
  const avg = ids.length ? ids.reduce((sum, id) => sum + safeMastery(id), 0) / ids.length : 0.3
  const acc = quizAccuracy(algo)
  const quizPart = acc === null ? avg : acc
  const score = avg * 0.45 + doneSignal(algo) * 0.25 + quizPart * 0.3
  return Math.max(0, Math.min(1, score))
}

const scoreLevel = score => (score >= 0.78 ? 3 : score >= 0.58 ? 2 : score >= 0.4 ? 1 : 0)
const levelLabel = ['New', 'Learning', 'Solid', 'Mastered']

const tierLabel = tier => (tier === 1 ? 'T1 · must-know' : tier === 3 ? 'T3 · bonus' : 'T2')

function algoHref(id, pathId) {
  return `#/algorithms/${encodeURIComponent(id)}${pathId ? `?path=${encodeURIComponent(pathId)}` : ''}`
}

function pathProgress(pathId) {
  const path = pathById[pathId]
  const scored = path.algoIds.filter(id => algoById[id]).map(id => ({ id, score: masteryScore(algoById[id]) }))
  const done = scored.filter(s => s.score >= 0.58).length
  const next = scored.find(s => s.score < 0.58) || scored[scored.length - 1]
  return { done, total: scored.length, nextId: next?.id }
}

function notFoundCard() {
  return h('div', { class: 'page' }, h('div', { class: 'card empty' },
    h('div', { class: 'empty-icon' }, icon('tree', 32)),
    h('h3', null, 'Algorithm not found'),
    h('a', { class: 'btn', href: '#/algorithms' }, 'Back to the tree')))
}

export default async function render(container, params = {}) {
  clear(container)
  await loadRich()
  const query = params.query || {}
  if (params.id) {
    const id = decode(params.id)
    const algo = algoById[id]
    if (!algo) {
      container.append(notFoundCard())
      return null
    }
    return renderDetail(container, algo, query)
  }
  return renderTree(container, query)
}

const virtualW = 2400
const virtualH = 1000
const marginX = 90
const marginY = 90
const px = frac => marginX + frac * (virtualW - 2 * marginX)
const py = frac => marginY + frac * (virtualH - 2 * marginY)
const radiusFor = tier => (tier === 1 ? 20 : tier === 3 ? 13 : 16)

const pos = Object.fromEntries(treeNodes.map(n => [n.id, { x: px(n.x), y: py(n.y) }]))
const edges = treeNodes.flatMap(n => n.prereqs.filter(p => pos[p]).map(p => ({ from: p, to: n.id })))

function wrapLabel(title, maxChars = 15) {
  const words = String(title).split(' ')
  const lines = []
  let line = ''
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (candidate.length <= maxChars) line = candidate
    else {
      if (line) lines.push(line)
      line = word
    }
  }
  if (line) lines.push(line)
  if (lines.length > 2) {
    let rest = lines.slice(1).join(' ')
    if (rest.length > maxChars) rest = `${rest.slice(0, maxChars - 1)}…`
    lines.length = 1
    lines.push(rest)
  }
  return lines
}

function renderTree(container, query) {
  let view = readPref('cram.algoView', 'tree')
  let activePath = query.path && pathById[query.path] ? query.path : readPref('cram.algoPath', '')
  if (activePath && !pathById[activePath]) activePath = ''
  let tierFilter = 'all'
  const activeBranches = new Set(branches.map(b => b.id))
  let search = ''

  const setPath = id => {
    activePath = id
    writePref('cram.algoPath', id || '')
  }

  const matches = node => {
    const q = search.trim().toLowerCase()
    const algo = algoById[node.id]
    const hitSearch = !q || node.title.toLowerCase().includes(q) || (algo.oneLiner || '').toLowerCase().includes(q) || (algo.skills || []).some(s => (skillMeta[s]?.label || '').toLowerCase().includes(q))
    const hitTier = tierFilter === 'all' || node.tier === tierFilter
    const hitBranch = activeBranches.has(node.branch)
    return hitSearch && hitTier && hitBranch
  }

  const searchInput = h('input', {
    class: 'filter-search algo-search', type: 'search', placeholder: 'Search algorithms, signals, skills…', value: search,
    oninput: event => { search = event.target.value; refresh() },
  })

  const tierOptions = [['all', 'All tiers'], [1, 'T1 must-know'], [2, 'T2'], [3, 'T3 bonus']]
  const tierChipEls = tierOptions.map(([value, label]) => h('button', {
    class: `chip${tierFilter === value ? ' active' : ''}`,
    onclick: event => {
      tierFilter = value
      for (const chip of tierChipEls) chip.classList.remove('active')
      event.currentTarget.classList.add('active')
      refresh()
    },
  }, label))
  const tierRow = h('div', { class: 'row-wrap' }, tierChipEls)

  const allBranchesChip = h('button', {
    class: 'chip active',
    onclick: () => {
      activeBranches.clear()
      branches.forEach(b => activeBranches.add(b.id))
      for (const chip of branchChipEls) chip.classList.add('active')
      allBranchesChip.classList.add('active')
      refresh()
    },
  }, 'All branches')
  const branchChipEls = branches.map(branch => h('button', {
    class: 'chip active branch-chip', style: { '--dot': branch.color },
    onclick: event => {
      if (activeBranches.has(branch.id)) activeBranches.delete(branch.id)
      else activeBranches.add(branch.id)
      event.currentTarget.classList.toggle('active', activeBranches.has(branch.id))
      allBranchesChip.classList.toggle('active', activeBranches.size === branches.length)
      refresh()
    },
  }, h('i', { class: 'legend-dot' }), branch.title))
  const branchRow = h('div', { class: 'row-wrap branch-legend' }, allBranchesChip, branchChipEls)

  const pathChipEls = paths.map(path => h('button', {
    class: `chip path-chip${activePath === path.id ? ' active' : ''}`,
    onclick: event => {
      const turningOn = activePath !== path.id
      setPath(turningOn ? path.id : '')
      for (const chip of pathChipEls) chip.classList.remove('active')
      if (turningOn) event.currentTarget.classList.add('active')
      refresh()
    },
  }, `${path.title} · ${path.minutes}m`))
  const pathRow = h('div', { class: 'row-wrap path-row' }, pathChipEls)

  const viewTreeChip = h('button', { class: `chip${view === 'tree' ? ' active' : ''}` }, icon('tree', 14), ' Tree')
  const viewListChip = h('button', { class: `chip${view === 'list' ? ' active' : ''}` }, icon('list', 14), ' List')
  viewTreeChip.onclick = () => { view = 'tree'; writePref('cram.algoView', view); viewTreeChip.classList.add('active'); viewListChip.classList.remove('active'); redrawBody() }
  viewListChip.onclick = () => { view = 'list'; writePref('cram.algoView', view); viewListChip.classList.add('active'); viewTreeChip.classList.remove('active'); redrawBody() }

  const pathBarHost = h('div', { class: 'algo-pathbar-host' })
  const bodyHost = h('div', { class: 'algo-body-host' })

  const legend = h('div', { class: 'row-wrap legend algo-mastery-legend' },
    levelLabel.map((label, i) => h('span', null, h('i', { style: { background: `var(--border-strong)`, opacity: 0.35 + i * 0.22 } }), label)))

  const page = h('div', { class: 'page algo-tree-page' },
    subnav('learn', 'algorithms'),
    h('div', { class: 'page-header' },
      h('h1', null, 'Algorithms'),
      h('div', { class: 'row' }, viewTreeChip, viewListChip)),
    h('div', { class: 'card algo-controls' },
      searchInput,
      tierRow,
      branchRow,
      pathRow),
    pathBarHost,
    legend,
    bodyHost)

  container.append(page)

  function refresh() {
    drawPathBar()
    redrawBody()
  }

  function drawPathBar() {
    if (!activePath) { pathBarHost.replaceChildren(); return }
    const path = pathById[activePath]
    const { done, total, nextId } = pathProgress(activePath)
    const nextAlgo = nextId ? algoById[nextId] : null
    pathBarHost.replaceChildren(h('div', { class: 'card algo-pathbar' },
      h('div', { class: 'stack-sm grow' },
        h('div', { class: 'row spread' }, h('b', null, path.title), h('span', { class: 'muted small' }, `${done}/${total} done · ${path.minutes} min`)),
        h('div', { class: 'progress' }, h('div', { class: 'progress-fill', style: { width: `${total ? (done / total) * 100 : 0}%` } }))),
      nextAlgo ? h('a', { class: 'btn btn-primary', href: algoHref(nextAlgo.id, activePath) }, [`Next: ${nextAlgo.title} `, icon('arrowRight', 16)]) : null,
      h('button', { class: 'btn btn-icon', title: 'Clear path', onclick: () => { setPath(''); for (const chip of pathChipEls) chip.classList.remove('active'); refresh() } }, '×')))
  }

  let destroyTreeView = null
  function redrawBody() {
    if (destroyTreeView) { destroyTreeView(); destroyTreeView = null }
    clear(bodyHost)
    if (view === 'list') renderListView(bodyHost, { matches, activePath })
    else destroyTreeView = renderTreeView(bodyHost, { matches, activePath, go })
  }

  function go(id) {
    navigate(algoHref(id, activePath).slice(1))
  }

  drawPathBar()
  redrawBody()

  return () => { if (destroyTreeView) destroyTreeView() }
}

function renderListView(host, { matches, activePath }) {
  const pathAlgoSet = activePath ? new Set(pathById[activePath].algoIds) : null
  const groups = branches.map(branch => ({
    branch,
    nodes: treeNodes.filter(n => n.branch === branch.id && matches(n) && (!pathAlgoSet || pathAlgoSet.has(n.id))),
  })).filter(group => group.nodes.length)

  if (!groups.length) {
    host.append(h('div', { class: 'card empty' }, h('div', { class: 'empty-icon' }, icon('search', 32)), h('h3', null, 'No matches'), h('p', { class: 'muted' }, 'Try a different search or filter.')))
    return
  }

  const groupEls = groups.map(group => {
    const cards = group.nodes.map(node => buildListCard(node, activePath))
    const head = h('div', { class: 'row algo-list-group-head' }, h('i', { class: 'legend-dot', style: { background: group.branch.color } }), h('h3', null, group.branch.title))
    return h('div', { class: 'algo-list-group' }, head, h('div', { class: 'grid algo-list-grid' }, cards))
  })
  host.append(h('div', { class: 'stack-lg algo-list' }, groupEls))
}

function buildListCard(node, activePath) {
  const algo = algoById[node.id]
  const score = masteryScore(algo)
  const level = scoreLevel(score)
  const topRow = h('div', { class: 'row spread' }, h('span', { class: `pill tier-pill tier-${node.tier}` }, tierLabel(node.tier)), h('span', { class: 'muted small' }, levelLabel[level]))
  const bar = h('div', { class: 'progress' }, h('div', { class: 'progress-fill', style: { width: `${score * 100}%` } }))
  return h('a', { class: `card card-hover algo-list-card level-${level}`, href: algoHref(node.id, activePath) },
    topRow,
    h('div', { class: 'algo-list-title' }, algo.title),
    h('p', { class: 'muted small algo-list-oneliner' }, algo.oneLiner),
    bar)
}

function renderTreeView(host, { matches, activePath, go }) {
  const pathAlgoSet = activePath ? new Set(pathById[activePath].algoIds) : null
  const pathOrder = activePath ? pathById[activePath].algoIds : null

  const defs = svg('defs', null, svg('marker', { id: 'algoArrow', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' },
    svg('path', { d: 'M0,0 L10,5 L0,10 z', class: 'algo-arrowhead' })))

  const sceneRoot = svg('g', { class: 'algo-scene' })
  const svgEl = svg('svg', { class: 'algo-svg', viewBox: `0 0 ${virtualW} ${virtualH}`, style: { width: `${virtualW}px`, height: `${virtualH}px` } }, defs, sceneRoot)

  const children = []
  for (const edge of edges) {
    const inPath = pathAlgoSet && pathAlgoSet.has(edge.from) && pathAlgoSet.has(edge.to)
    const dim = Boolean(pathAlgoSet) && !inPath
    children.push(svg('line', { x1: pos[edge.from].x, y1: pos[edge.from].y, x2: pos[edge.to].x, y2: pos[edge.to].y, class: `algo-edge${dim ? ' is-dim' : ''}`, 'marker-end': 'url(#algoArrow)' }))
  }
  if (pathOrder) {
    const points = pathOrder.filter(id => pos[id]).map(id => `${pos[id].x},${pos[id].y}`).join(' ')
    children.push(svg('polyline', { points, class: 'algo-route' }))
  }
  for (const node of treeNodes) {
    const algo = algoById[node.id]
    const score = masteryScore(algo)
    const level = scoreLevel(score)
    const dim = !matches(node) || (pathAlgoSet && !pathAlgoSet.has(node.id))
    const branch = branchById[node.branch]
    const r = radiusFor(node.tier)
    const lines = wrapLabel(node.title)
    const pathIndex = pathOrder ? pathOrder.indexOf(node.id) : -1
    const group = svg('g', {
      class: `algo-node tier-${node.tier} level-${level}${dim ? ' is-dim' : ''}`,
      style: `--branch:${branch?.color || 'var(--teal)'};`,
      transform: `translate(${pos[node.id].x},${pos[node.id].y})`,
      tabindex: dim ? '-1' : '0',
      role: 'button',
      'aria-label': node.title,
    },
      node.tier === 1 ? svg('circle', { class: 'algo-ring', r: r + 5 }) : null,
      svg('circle', { class: 'algo-dot', r }),
      svg('title', null, `${node.title} · ${levelLabel[level]}`),
      svg('text', { class: 'algo-label', y: r + 14, 'text-anchor': 'middle' }, lines.map((line, i) => svg('tspan', { x: 0, dy: i === 0 ? '0' : '11' }, line))),
      pathIndex >= 0 ? svg('g', { class: 'algo-badge', transform: `translate(${r * 0.7},${-r * 0.7})` }, svg('circle', { r: 8 }), svg('text', { y: 3, 'text-anchor': 'middle' }, String(pathIndex + 1))) : null)
    group.addEventListener('click', () => { if (!dim) go(node.id) })
    group.addEventListener('keydown', event => { if ((event.key === 'Enter' || event.key === ' ') && !dim) { event.preventDefault(); go(node.id) } })
    group.addEventListener('pointerenter', () => sceneRoot.appendChild(group))
    group.addEventListener('focus', () => sceneRoot.appendChild(group))
    children.push(group)
  }
  sceneRoot.replaceChildren(...children)

  const viewport = h('div', { class: 'algo-tree-viewport' },
    h('div', { class: 'algo-tree-toolbar' },
      h('button', { class: 'btn btn-icon', title: 'Zoom out', onclick: () => applyZoom(zoom / 1.25) }, '−'),
      h('button', { class: 'btn btn-icon', title: 'Fit', onclick: () => fit() }, '⤢'),
      h('button', { class: 'btn btn-icon', title: 'Zoom in', onclick: () => applyZoom(zoom * 1.25) }, '+')),
    svgEl)

  let zoom = 1
  const applyZoom = next => {
    const clamped = Math.max(0.3, Math.min(2.5, next))
    const rect = viewport.getBoundingClientRect()
    const cx = (viewport.scrollLeft + rect.width / 2) / zoom
    const cy = (viewport.scrollTop + rect.height / 2) / zoom
    zoom = clamped
    svgEl.style.width = `${Math.round(virtualW * zoom)}px`
    svgEl.style.height = `${Math.round(virtualH * zoom)}px`
    viewport.scrollLeft = cx * zoom - rect.width / 2
    viewport.scrollTop = cy * zoom - rect.height / 2
  }
  const fit = () => {
    const vw = viewport.clientWidth - 8
    const vh = Math.max(viewport.clientHeight - 8, 1)
    zoom = Math.max(0.32, Math.min(vw / virtualW, vh / virtualH, 1.3))
    svgEl.style.width = `${Math.round(virtualW * zoom)}px`
    svgEl.style.height = `${Math.round(virtualH * zoom)}px`
    viewport.scrollLeft = 0
    viewport.scrollTop = 0
  }

  let dragging = false
  let startX = 0, startY = 0, startLeft = 0, startTop = 0
  const onPointerDown = event => {
    if (event.target.closest('.algo-node')) return
    dragging = true
    startX = event.clientX
    startY = event.clientY
    startLeft = viewport.scrollLeft
    startTop = viewport.scrollTop
    viewport.classList.add('is-grabbing')
  }
  const onPointerMove = event => {
    if (!dragging) return
    viewport.scrollLeft = startLeft - (event.clientX - startX)
    viewport.scrollTop = startTop - (event.clientY - startY)
  }
  const onPointerUp = () => { dragging = false; viewport.classList.remove('is-grabbing') }
  const onWheel = event => {
    if (!event.ctrlKey && !event.metaKey) return
    event.preventDefault()
    applyZoom(zoom * (event.deltaY < 0 ? 1.1 : 1 / 1.1))
  }
  viewport.addEventListener('pointerdown', onPointerDown)
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  viewport.addEventListener('wheel', onWheel, { passive: false })

  host.append(viewport)
  requestAnimationFrame(fit)

  return () => {
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
  }
}

function renderDetail(container, algo, query) {
  const branch = branchById[algo.branch]
  const score = masteryScore(algo)
  const level = scoreLevel(score)
  const pathId = query.path && pathById[query.path] && pathById[query.path].algoIds.includes(algo.id) ? query.path : ''

  let prevHref = null
  let nextHref = null
  let pagerLabel = ''
  if (pathId) {
    const order = pathById[pathId].algoIds
    const i = order.indexOf(algo.id)
    pagerLabel = `${pathById[pathId].title} · ${i + 1}/${order.length}`
    if (order[i - 1]) prevHref = algoHref(order[i - 1], pathId)
    if (order[i + 1]) nextHref = algoHref(order[i + 1], pathId)
  } else {
    const i = orderedIds.indexOf(algo.id)
    if (orderedIds[i - 1]) prevHref = algoHref(orderedIds[i - 1])
    if (orderedIds[i + 1]) nextHref = algoHref(orderedIds[i + 1])
  }

  const header = h('div', { class: 'page-header algo-detail-head' },
    h('div', { class: 'row algo-crumb' },
      h('a', { class: 'btn btn-ghost btn-sm', href: pathId ? `#/algorithms?path=${encodeURIComponent(pathId)}` : '#/algorithms' }, [icon('arrowLeft', 16), ' Tree']),
      branch ? h('span', { class: 'pill', style: { color: branch.color, background: 'color-mix(in srgb, currentColor 16%, transparent)' } }, branch.title) : null,
      h('span', { class: `pill tier-pill tier-${algo.tier}` }, tierLabel(algo.tier)),
      h('span', { class: `pill level-pill level-${level}` }, levelLabel[level]),
      pagerLabel ? h('span', { class: 'muted small' }, pagerLabel) : null),
    h('h1', null, algo.title))

  const mnemonicHero = h('div', { class: 'card algo-hero' },
    h('div', { class: 'eyebrow' }, 'Mnemonic'),
    h('div', { class: 'algo-mnemonic' }, rich(algo.mnemonic)),
    h('p', { class: 'algo-oneliner' }, rich(algo.oneLiner)))

  const signals = algo.whenToUse?.length ? h('div', { class: 'card' },
    h('div', { class: 'section-title' }, 'Signals'),
    h('div', { class: 'row-wrap' }, algo.whenToUse.map(text => h('span', { class: 'chip chip-signal' }, rich(text))))) : null

  const traps = algo.notWhen?.length ? h('div', { class: 'card' },
    h('div', { class: 'section-title' }, 'Traps'),
    h('div', { class: 'row-wrap' }, algo.notWhen.map(text => h('span', { class: 'chip chip-trap' }, rich(text))))) : null

  const stepsCard = algo.steps?.length ? h('div', { class: 'card' },
    h('div', { class: 'section-title' }, 'Steps'),
    h('ol', { class: 'algo-steps' }, algo.steps.map(step => h('li', null, h('code', null, rich(step)))))) : null

  const templateBlock = codeBlock(algo.template || '', { lineNumbers: true })
  const copyButton = h('button', { class: 'btn btn-ghost btn-sm', onclick: event => {
    navigator.clipboard?.writeText(algo.template || '')
    event.currentTarget.textContent = 'Copied'
    setTimeout(() => { event.currentTarget.textContent = 'Copy' }, 1200)
  } }, 'Copy')

  const clozeId = `algorithms:cloze:${slugOf(algo.id)}`
  const cloze = clozeById[clozeId]
  let recallToggle = null
  let recallPanel = null
  if (cloze) {
    recallPanel = buildRecallPanel(cloze)
    recallPanel.style.display = 'none'
    recallToggle = h('button', { class: 'chip', onclick: () => {
      const showing = recallPanel.style.display !== 'none'
      recallPanel.style.display = showing ? 'none' : ''
      templateBlock.style.display = showing ? '' : 'none'
      recallToggle.classList.toggle('active', !showing)
    } }, icon('brain', 14), ' Recall mode')
  }

  const templateCard = h('div', { class: 'card' },
    h('div', { class: 'row spread' }, h('div', { class: 'section-title' }, 'Template'), h('div', { class: 'row' }, recallToggle, copyButton)),
    templateBlock, recallPanel)

  const complexityCard = h('div', { class: 'card algo-complexity' },
    h('div', { class: 'row' },
      algo.time ? h('span', { class: 'pill pill-amber' }, icon('clock', 12), ` ${algo.time}`) : null,
      algo.space ? h('span', { class: 'pill pill-sky' }, icon('grid', 12), ` ${algo.space}`) : null),
    algo.whyComplexity ? h('p', { class: 'muted' }, rich(algo.whyComplexity)) : null)

  const compareCard = algo.compare?.length ? h('div', { class: 'card' },
    h('div', { class: 'section-title' }, 'Compare with'),
    h('div', { class: 'stack-sm' }, algo.compare.map(entry => {
      const other = algoById[entry.algoId]
      return h('div', { class: 'row algo-compare-row' },
        other ? h('a', { class: 'chip', href: algoHref(other.id) }, other.title) : h('span', { class: 'chip' }, entry.algoId),
        h('span', { class: 'muted small' }, rich(entry.difference)))
    }))) : null

  const relatedChips = (algo.relatedLc || []).map(lc => {
    const problemId = problemIdByLc.get(lc)
    return problemId ? h('a', { class: 'chip', href: `#/problems/${encodeURIComponent(problemId)}` }, `LC ${lc}`) : h('span', { class: 'chip' }, `LC ${lc}`)
  })
  const variantsCard = (algo.variants?.length || relatedChips.length) ? h('div', { class: 'card' },
    algo.variants?.length ? h('div', { class: 'stack-sm' }, h('div', { class: 'section-title' }, 'Variants'),
      h('ul', { class: 'algo-variants' }, algo.variants.map(text => h('li', null, rich(text))))) : null,
    relatedChips.length ? h('div', { class: 'stack-sm', style: 'margin-top:10px' }, h('div', { class: 'section-title' }, 'Related'), h('div', { class: 'row-wrap' }, relatedChips)) : null) : null

  const traceHost = h('div', { class: 'algo-trace-host' })
  const trace = algo.traceId ? traceById[algo.traceId] : null
  const traceCard = trace ? h('div', { class: 'card algo-trace-card' },
    h('div', { class: 'section-title' }, 'Step through it'),
    traceHost) : null

  const buttonsRow = h('div', { class: 'row-wrap algo-actions' },
    h('a', { class: 'btn btn-primary', href: practiceHref('mixed', { skills: algo.skills }) }, 'Drill this'),
    h('a', { class: 'btn', href: practiceHref('cards', { skills: algo.skills }) }, 'Flashcards'))

  const pagerRow = h('div', { class: 'row problem-pager' },
    prevHref ? h('a', { class: 'btn btn-ghost', href: prevHref }, [icon('arrowLeft', 16), ' Prev']) : h('span'),
    nextHref ? h('a', { class: 'btn btn-ghost', href: nextHref }, ['Next ', icon('arrowRight', 16)]) : null)

  const page = h('div', { class: 'page algo-detail-page' },
    subnav('learn', 'algorithms'),
    header,
    mnemonicHero,
    h('div', { class: 'grid-2 algo-pair' }, signals, traps),
    stepsCard,
    templateCard,
    complexityCard,
    compareCard,
    variantsCard,
    traceCard,
    buttonsRow,
    pagerRow)

  container.append(page)

  let destroyStepper = null
  if (trace) destroyStepper = mountStepper(traceHost, trace)

  return () => { if (destroyStepper) destroyStepper() }
}

function buildRecallPanel(cloze) {
  const { source, blanks } = parseCloze(cloze.code)
  const block = codeBlock(source, { lineNumbers: true })
  const revealed = blanks.map(() => false)
  const slots = []

  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT)
  const textNodes = []
  while (walker.nextNode()) if (walker.currentNode.nodeValue.includes('ZQBLANK')) textNodes.push(walker.currentNode)
  for (const node of textNodes) {
    const parts = node.nodeValue.split(/(ZQBLANK\d+ZQ)/)
    const fragment = document.createDocumentFragment()
    for (const part of parts) {
      const match = part.match(/^ZQBLANK(\d+)ZQ$/)
      if (match) {
        const index = Number(match[1])
        const slot = h('button', { type: 'button', class: 'recall-slot', onclick: () => toggle(index) }, '▢▢▢')
        slots[index] = slot
        fragment.append(slot)
      } else if (part) fragment.append(document.createTextNode(part))
    }
    node.parentNode.replaceChild(fragment, node)
  }

  function paint(index) {
    const slot = slots[index]
    if (!slot) return
    slot.textContent = revealed[index] ? blanks[index][0] : '▢▢▢'
    slot.classList.toggle('is-revealed', revealed[index])
  }
  function toggle(index) {
    revealed[index] = !revealed[index]
    paint(index)
  }
  function setAll(value) {
    revealed.forEach((_, i) => { revealed[i] = value; paint(i) })
  }

  return h('div', { class: 'recall-panel' },
    h('div', { class: 'row spread recall-actions' },
      h('span', { class: 'muted small' }, `${blanks.length} blanks · click to reveal`),
      h('div', { class: 'row' },
        h('button', { class: 'btn btn-ghost btn-sm', onclick: () => setAll(true) }, 'Reveal all'),
        h('button', { class: 'btn btn-ghost btn-sm', onclick: () => setAll(false) }, 'Hide all'))),
    block)
}
