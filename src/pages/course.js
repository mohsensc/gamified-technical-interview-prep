import { h, svg } from '../ui/h.js'
import { icon } from '../ui/icons.js'
import { breadcrumb } from '../ui/breadcrumb.js'
import { course, units, findNode, hrefFor, pathTo, problemsForNode } from '../content/curriculum.js'
import { getNodeProgress, getBiteStatus, getCheckpoint, subscribe } from '../store.js'
import { modes, practiceHref } from '../engine/session.js'
import { continueTarget } from '../engine/recommend.js'
import { companyChips } from '../ui/companies.js'

const biteIcons = { lesson: 'book', trace: 'search', algo: 'brain', predict: 'sparkle', cards: 'card', rapid: 'bolt', quiz: 'puzzle', diagnose: 'pulse', mock: 'mic', read: 'read' }
const learnTypes = new Set(['lesson', 'trace', 'algo', 'mock', 'read'])

const openUnits = new Set()
const openModules = new Set()

const formatMinutes = minutes => {
  const hours = Math.floor(minutes / 60)
  const rest = Math.round(minutes % 60)
  if (!hours) return `${rest}m`
  return rest ? `${hours}h ${rest}m` : `${hours}h`
}

function ring(pct, { size = 52, stroke = 5 } = {}) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(1, Math.max(0, pct || 0))
  const offset = circumference * (1 - clamped)
  const color = clamped >= 0.999 ? 'var(--green)' : clamped > 0 ? 'var(--green-bright)' : 'var(--faint)'
  return h('div', { class: 'crs-ring', style: `width:${size}px;height:${size}px` },
    svg('svg', { viewBox: `0 0 ${size} ${size}`, width: size, height: size },
      svg('circle', { cx: size / 2, cy: size / 2, r: radius, fill: 'none', stroke: 'var(--surface-3)', 'stroke-width': stroke }),
      svg('circle', {
        cx: size / 2, cy: size / 2, r: radius, fill: 'none', stroke: color, 'stroke-width': stroke,
        'stroke-linecap': 'round', 'stroke-dasharray': circumference, 'stroke-dashoffset': offset,
        transform: `rotate(-90 ${size / 2} ${size / 2})`,
      })),
    h('span', { class: 'crs-ring-label' }, `${Math.round(clamped * 100)}%`))
}

const unlockHint = (unit, index) => {
  if (index === 0) return null
  const prior = units[index - 1]
  if (!prior) return null
  if (getNodeProgress(unit.id) > 0.05 || getNodeProgress(prior.id) >= 0.2) return null
  return `Pairs well after ${prior.title}`
}

const checkpointPill = cp => {
  if (!cp) return h('span', { class: 'pill' }, 'Checkpoint not started')
  return h('span', { class: `pill ${cp.passed ? 'pill-green' : 'pill-amber'}` }, cp.passed ? [icon('check', 12), ' Checkpoint'] : `Checkpoint ${cp.best}%`)
}

const biteRow = bite => {
  const done = getBiteStatus(bite.id).done
  return h('a', { class: `crs-bite-row${bite.optional ? ' optional' : ''}`, href: hrefFor(bite.id) },
    h('span', { class: `crs-bite-check${done ? ' done' : ''}` }, done ? icon('check', 13) : ''),
    h('span', { class: 'crs-bite-icon' }, icon(biteIcons[bite.type] || 'layers', 16)),
    h('span', { class: 'crs-bite-title' }, bite.title),
    bite.optional ? h('span', { class: 'pill' }, 'extra') : null,
    h('span', { class: 'crs-bite-meta mono' }, `${bite.minutes}m`))
}

function moduleRow(mod, redraw) {
  const progress = getNodeProgress(mod.id)
  const core = mod.bites.filter(bite => !bite.optional)
  const doneCount = core.filter(bite => getBiteStatus(bite.id).done).length
  const isOpen = openModules.has(mod.id)
  const cp = getCheckpoint(mod.id)
  const toggle = () => {
    if (isOpen) openModules.delete(mod.id)
    else openModules.add(mod.id)
    redraw()
  }
  const row = h('div', { class: 'crs-module-row' },
    h('div', { class: 'crs-module-main', onclick: toggle },
      h('div', { class: 'crs-module-title' },
        h('b', null, mod.title),
        mod.mustLearn ? h('span', { class: 'pill pill-amber' }, mod.gap?.tier || 'Must-learn') : null,
        h('span', { class: 'small muted' }, `${doneCount}/${core.length} bites · ${formatMinutes(mod.minutes)}`)),
      h('div', { class: 'crs-module-bar' }, h('div', { style: { width: `${progress * 100}%` } }))),
    h('a', { class: 'btn btn-sm', title: 'Play', href: practiceHref('mixed', { moduleId: mod.id }), onclick: e => e.stopPropagation() }, icon('play', 14)),
    h('a', { class: 'btn btn-sm', title: cp?.passed ? 'Checkpoint passed' : 'Checkpoint', href: practiceHref('checkpoint', { moduleId: mod.id }), onclick: e => e.stopPropagation() }, cp?.passed ? [icon('flag', 14), icon('check', 11)] : icon('flag', 14)),
    h('button', { class: 'crs-expand', 'aria-label': `${isOpen ? 'Collapse' : 'Expand'} ${mod.title}`, 'aria-expanded': String(isOpen), onclick: toggle }, isOpen ? icon('chevronDown', 14) : icon('chevronRight', 14)))
  const bites = isOpen ? h('div', { class: 'crs-bite-list' }, mod.bites.map(biteRow)) : null
  return h('div', { class: 'stack-sm' }, row, bites)
}

function unitCard(unit, index, redraw) {
  const progress = getNodeProgress(unit.id)
  const isOpen = openUnits.has(unit.id)
  const cp = getCheckpoint(unit.id)
  const hint = unlockHint(unit, index)
  const toggle = () => {
    if (isOpen) openUnits.delete(unit.id)
    else openUnits.add(unit.id)
    redraw()
  }
  const head = h('div', { class: 'crs-unit-head' , onclick: toggle },
    ring(progress, { size: 52 }),
    h('div', { class: 'crs-unit-title grow' },
      h('div', { class: 'row-wrap' }, h('span', null, icon(unit.icon, 20)), h('h3', null, unit.title), unit.mustLearn ? h('span', { class: 'pill pill-amber' }, 'Must-learn') : null),
      h('span', { class: 'small muted' }, `${unit.modules.length} modules · ${formatMinutes(unit.minutes)}`),
      hint ? h('span', { class: 'small crs-hint' }, icon('idea', 13), ` ${hint}`) : null),
    h('button', { class: 'crs-expand', 'aria-label': `${isOpen ? 'Collapse' : 'Expand'} ${unit.title}`, 'aria-expanded': String(isOpen) }, isOpen ? icon('chevronDown', 14) : icon('chevronRight', 14)))
  const actions = h('div', { class: 'row-wrap' },
    h('a', { class: 'btn btn-sm', href: hrefFor(unit.id) }, ['Open ', icon('chevronRight', 14)]),
    checkpointPill(cp))
  const moduleList = isOpen ? h('div', { class: 'crs-module-list' }, unit.modules.map(mod => moduleRow(mod, redraw))) : null
  return h('div', { class: 'card crs-unit-card' }, head, actions, moduleList)
}

function renderOverview(container) {
  const page = h('div', { class: 'page' })
  container.appendChild(page)
  const redraw = () => draw()
  const draw = () => {
    const overall = getNodeProgress(course.id)
    const header = h('div', { class: 'page-header' },
      h('div', null,
        h('h1', null, 'Course'),
        h('p', { class: 'muted small' }, `${Math.round(overall * 100)}% complete · ${formatMinutes(course.minutes)} total`)),
      h('a', { class: 'btn btn-primary', href: continueTarget() }, ['Continue ', icon('chevronRight', 14)]))
    page.replaceChildren(header, h('div', { class: 'crs-unit-grid' }, units.map((unit, index) => unitCard(unit, index, redraw))))
  }
  draw()
  return subscribe(draw)
}

function renderFocused(container, id) {
  const node = findNode(id)
  const page = h('div', { class: 'page' })
  container.appendChild(page)
  if (!node || (node.kind !== 'unit' && node.kind !== 'module')) {
    page.replaceChildren(h('div', { class: 'card empty' },
      h('div', { class: 'empty-icon' }, icon('compass', 32)),
      h('h3', null, 'Not found'),
      h('a', { class: 'btn btn-primary', href: '#/course' }, 'Back to course')))
    return null
  }
  const isModule = node.kind === 'module'
  const scope = isModule ? { moduleId: id } : { unitId: id }
  const draw = () => {
    const progress = getNodeProgress(id)
    const cp = getCheckpoint(id)
    const trail = pathTo(id)

    const header = h('div', { class: 'stack-sm' },
      breadcrumb(trail),
      h('div', { class: 'page-header' },
        h('div', null,
          h('div', { class: 'row-wrap' },
            h('span', null, isModule ? null : icon(node.icon, 22)),
            h('h1', null, node.title),
            node.mustLearn ? h('span', { class: 'pill pill-amber' }, node.gap?.tier || 'Must-learn') : null),
          node.gap?.why
            ? h('p', { class: 'muted small' }, node.gap.why)
            : h('p', { class: 'muted' }, `${formatMinutes(node.minutes)} · ${Math.round(progress * 100)}% complete`)),
        h('a', { class: 'btn btn-primary', href: practiceHref('mixed', scope) }, icon('play', 16), ' Play')))

    const learnItems = (isModule ? node.bites : node.modules.flatMap(mod => mod.bites))
      .filter(bite => learnTypes.has(bite.type))
    const learnSection = h('div', { class: 'card crs-section' },
      h('span', { class: 'section-title' }, 'Learn'),
      learnItems.length
        ? h('div', { class: 'crs-bite-list' }, learnItems.map(biteRow))
        : h('p', { class: 'muted small' }, 'No lessons here — jump straight to practice.'))

    const primaryModeIds = new Set(['mixed', 'diagnose', 'rapid'])
    const practiceSection = h('div', { class: 'card crs-section' },
      h('span', { class: 'section-title' }, 'Practice'),
      h('div', { class: 'crs-mode-grid' },
        modes.filter(mode => primaryModeIds.has(mode.id)).map(mode =>
          h('a', { class: 'btn btn-sm', href: practiceHref(mode.id, scope) }, icon(mode.icon, 14), ` ${mode.title}`))),
      h('details', null,
        h('summary', { class: 'muted small' }, 'More modes'),
        h('div', { class: 'crs-mode-grid' },
          modes.filter(mode => !primaryModeIds.has(mode.id) && mode.id !== 'checkpoint').map(mode =>
            h('a', { class: 'btn btn-sm', href: practiceHref(mode.id, scope) }, icon(mode.icon, 14), ` ${mode.title}`)))))

    const problems = problemsForNode(id).slice(0, 6)
    const problemsSection = problems.length ? h('div', { class: 'card crs-section' },
      h('div', { class: 'spread' },
        h('span', { class: 'section-title' }, 'Problems in this scope'),
        h('a', { class: 'small', href: practiceHref('diagnose', scope) }, ['Diagnose them ', icon('chevronRight', 14)])),
      h('div', { class: 'stack-sm' }, problems.map(problem => h('a', { class: 'crs-problem-row', href: `#/problems/${encodeURIComponent(problem.id)}` },
        h('div', { class: 'row-wrap grow' },
          problem.lc != null ? h('span', { class: 'mono small muted' }, `#${problem.lc}`) : null,
          h('span', null, problem.title),
          h('span', { class: `pill diff-${String(problem.difficulty || '').toLowerCase()}` }, problem.difficulty)),
        companyChips(problem.companies, { size: 'xs' }))))) : null

    const target = node.checkpoint
    const checkpointSection = h('div', { class: 'card crs-section' },
      h('span', { class: 'section-title' }, 'Checkpoint'),
      h('div', { class: `crs-checkpoint${cp?.passed ? ' passed' : ''}` },
        h('div', { class: 'stack-sm' },
          h('b', { class: 'row' }, cp?.passed ? [icon('check', 13), ' Passed'] : 'Not passed yet'),
          h('span', { class: 'small muted' }, cp ? `Best ${cp.best}% · ${cp.attempts} attempt${cp.attempts === 1 ? '' : 's'}` : `${target.itemCount} items · need ${target.passPct}%`)),
        h('a', { class: 'btn btn-sm', href: practiceHref('checkpoint', scope) }, cp?.passed ? 'Retry' : 'Start')))

    page.replaceChildren(header, learnSection, practiceSection, problemsSection, checkpointSection)
  }
  draw()
  return subscribe(draw)
}

export default function render(container, params) {
  return params?.id ? renderFocused(container, params.id) : renderOverview(container)
}
