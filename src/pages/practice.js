import { h, clear, confetti } from '../ui/h.js'
import { icon } from '../ui/icons.js'
import { units, allModules } from '../content/curriculum.js'
import { topics, problems } from '../content/index.js'
import { skillGroups, skills } from '../content/skills.js'
import { companyCounts } from '../content/companies.js'
import { companyFilter } from '../ui/companies.js'
import { subnav } from '../ui/subnav.js'
import { buildSession, scopeFromQuery, practiceHref, modeById, modes, modeCounts } from '../engine/session.js'
import { recommendNext } from '../engine/recommend.js'
import {
  getXP, getMastery, setEventContext, clearEventContext,
  saveSession, recordCheckpoint, dueItems, getMissed, getBookmarks,
} from '../store.js'
import runRapid from '../ui/modes/rapid.js'
import runDiagnose from '../ui/modes/diagnose.js'
import runPredict from '../ui/modes/predict.js'
import runGeneric from '../ui/modes/generic.js'
import { statBlock, resultItemId, formatElapsed } from '../ui/modes/shared.js'

const scopeKey = 'cram.practiceScope'
const lengthOptions = [5, 10, 20, 0]
const lengthLabel = n => (n ? String(n) : 'Endless')
const hubModes = modes.filter(mode => mode.id !== 'checkpoint')
const rapidSeconds = [60, 90, 120]

const safeMastery = skill => { try { return getMastery(skill) ?? 0.3 } catch { return 0.3 } }
const safeCount = fn => { try { return fn().length } catch { return 0 } }

const readScope = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(scopeKey) || '{}')
    return raw && typeof raw === 'object' ? raw : {}
  } catch { return {} }
}

const writeScope = state => {
  try { localStorage.setItem(scopeKey, JSON.stringify(state)) } catch {}
}

function renderHub(container) {
  clear(container)
  const saved = readScope()
  const scope = {
    unitId: saved.unitId || '',
    moduleId: saved.moduleId || '',
    skills: Array.isArray(saved.skills) ? [...saved.skills] : [],
    topic: saved.topic || '',
    companies: Array.isArray(saved.companies) ? [...saved.companies] : [],
    difficulty: Number(saved.difficulty) || 0,
    missedOnly: Boolean(saved.missedOnly),
    bookmarksOnly: Boolean(saved.bookmarksOnly),
    dueOnly: Boolean(saved.dueOnly),
  }
  let length = lengthOptions.includes(Number(saved.length)) ? Number(saved.length) : 10
  let timerOn = Boolean(saved.timerOn)
  let selectedMode = modeById[saved.lastMode] && saved.lastMode !== 'checkpoint' ? saved.lastMode : null
  let selectedRapidSeconds = rapidSeconds.includes(Number(saved.rapidSeconds)) ? Number(saved.rapidSeconds) : 90

  const root = h('div', { class: 'page practice-page' })
  container.append(root)

  function persist() {
    writeScope({ ...scope, length, timerOn, lastMode: selectedMode, rapidSeconds: selectedRapidSeconds })
  }

  function sessionOptions() {
    const options = { timer: timerOn || undefined }
    if (length) options.count = length
    else options.endless = true
    return options
  }

  function startHref() {
    if (!selectedMode) return null
    if (selectedMode === 'rapid') return practiceHref('rapid', scope, { seconds: selectedRapidSeconds, timer: timerOn || undefined })
    if (selectedMode === 'speed') return practiceHref('speed', scope, { seconds: 60, timer: timerOn || undefined })
    return practiceHref(selectedMode, scope, sessionOptions())
  }

  function resetScope() {
    scope.unitId = ''
    scope.moduleId = ''
    scope.skills = []
    scope.topic = ''
    scope.companies = []
    scope.difficulty = 0
    scope.missedOnly = false
    scope.bookmarksOnly = false
    scope.dueOnly = false
  }

  function draw() {
    persist()
    const counts = modeCounts(scope)
    const dueCount = safeCount(dueItems)
    const missedCount = safeCount(getMissed)
    const bookmarkCount = safeCount(getBookmarks)
    const companyBase = companyCounts(problems)
    const moduleOptions = scope.unitId ? allModules.filter(mod => mod.unitId === scope.unitId) : allModules
    const anyActive = scope.unitId || scope.moduleId || scope.skills.length || scope.topic || scope.companies.length ||
      scope.difficulty || scope.missedOnly || scope.bookmarksOnly || scope.dueOnly

    const unitSelect = h('select', { class: 'practice-select' },
      h('option', { value: '' }, 'All units'),
      ...units.map(unit => h('option', { value: unit.id }, unit.title)))
    unitSelect.value = scope.unitId
    unitSelect.addEventListener('change', () => { scope.unitId = unitSelect.value; scope.moduleId = ''; draw() })

    const moduleSelect = h('select', { class: 'practice-select' },
      h('option', { value: '' }, 'All modules'),
      ...moduleOptions.map(mod => h('option', { value: mod.id }, mod.title)))
    moduleSelect.value = scope.moduleId
    moduleSelect.addEventListener('change', () => { scope.moduleId = moduleSelect.value; draw() })

    const topicSelect = h('select', { class: 'practice-select' },
      h('option', { value: '' }, 'All topics'),
      ...topics.map(topic => h('option', { value: topic.id }, topic.title)))
    topicSelect.value = scope.topic
    topicSelect.addEventListener('change', () => { scope.topic = topicSelect.value; draw() })

    const diffChips = h('div', { class: 'row-wrap' }, [1, 2, 3].map(level => h('button', {
      class: `chip${scope.difficulty === level ? ' active' : ''}`,
      onclick: () => { scope.difficulty = scope.difficulty === level ? 0 : level; draw() },
    }, '●'.repeat(level) + '○'.repeat(3 - level))))

    const toggleChip = (key, label, count) => h('button', {
      class: `chip${scope[key] ? ' active' : ''}`,
      onclick: () => { scope[key] = !scope[key]; draw() },
    }, label, count ? h('span', { class: 'chip-count' }, String(count)) : null)

    const scopeToggles = h('div', { class: 'row-wrap' },
      toggleChip('dueOnly', [icon('clock', 13), ' Due'], dueCount),
      toggleChip('missedOnly', [icon('repeat', 13), ' Missed'], missedCount),
      toggleChip('bookmarksOnly', [icon('star', 13), ' Bookmarked'], bookmarkCount))

    const skillGroupsEl = skillGroups.map(group => h('div', { class: 'practice-skill-group' },
      h('span', { class: 'muted small' }, group.label),
      h('div', { class: 'row-wrap' }, group.skills.map(([id, label]) => h('button', {
        class: `chip${scope.skills.includes(id) ? ' active' : ''}`,
        onclick: () => {
          scope.skills = scope.skills.includes(id) ? scope.skills.filter(s => s !== id) : [...scope.skills, id]
          draw()
        },
      }, label)))))

    const companyFilterEl = companyFilter({
      selected: scope.companies,
      counts: companyBase,
      onChange: next => { scope.companies = next; draw() },
    })

    const scopeCard = h('div', { class: 'card practice-scope stack' },
      h('div', { class: 'row-wrap practice-scope-row' },
        topicSelect, diffChips, scopeToggles,
        anyActive ? h('button', { class: 'chip practice-reset', onclick: () => { resetScope(); draw() } }, 'Reset') : null),
      h('div', { class: 'stack-sm' },
        h('span', { class: 'label muted' }, 'Company'),
        companyFilterEl),
      h('details', { class: 'practice-skills-toggle' },
        h('summary', { class: 'muted small' }, scope.skills.length ? `${scope.skills.length} skill${scope.skills.length > 1 ? 's' : ''} selected` : 'Filter by skill'),
        h('div', { class: 'practice-skill-groups' }, skillGroupsEl)),
      h('details', { class: 'practice-more' },
        h('summary', { class: 'muted small' }, 'Unit / module'),
        h('div', { class: 'row-wrap practice-more-row' }, unitSelect, moduleSelect)))

    const lengthSeg = h('div', { class: 'segmented' }, lengthOptions.map(n => h('button', {
      type: 'button',
      class: `segmented-option${length === n ? ' active' : ''}`,
      onclick: () => { length = n; draw() },
    }, lengthLabel(n))))

    const timerSeg = h('div', { class: 'segmented' }, [false, true].map(value => h('button', {
      type: 'button',
      class: `segmented-option${timerOn === value ? ' active' : ''}`,
      onclick: () => { timerOn = value; draw() },
    }, value ? 'On' : 'Off')))

    const settingsCard = h('div', { class: 'card practice-settings row-wrap' },
      h('div', { class: 'stack-sm' }, h('span', { class: 'label muted' }, 'Length'), lengthSeg),
      h('div', { class: 'stack-sm' }, h('span', { class: 'label muted' }, 'Timer'), timerSeg))

    const filtersSummary = anyActive ? 'Filters & length (active)' : 'Filters & length'
    const filtersDetails = h('details', { class: 'practice-filters', open: anyActive || null },
      h('summary', { class: 'muted small' }, filtersSummary),
      h('div', { class: 'stack' }, scopeCard, settingsCard))

    const modeTiles = hubModes.map(mode => {
      const count = counts[mode.id] ?? 0
      const countLabel = mode.seconds ? null : h('span', { class: 'practice-mode-count' }, count ? `${count} item${count === 1 ? '' : 's'}` : 'none yet')
      const active = selectedMode === mode.id
      const tile = h('button', {
        type: 'button',
        class: `tile practice-mode-card${count ? '' : ' is-empty'}${active ? ' active' : ''}`,
      },
        h('div', { class: 'practice-mode-icon' }, icon(mode.icon, 22)),
        h('div', { class: 'practice-mode-title' }, mode.title),
        h('div', { class: 'practice-mode-blurb muted small' }, mode.blurb),
        countLabel)
      tile.addEventListener('click', () => { selectedMode = mode.id; draw() })
      return tile
    })

    const rapidOptionsRow = selectedMode === 'rapid'
      ? h('div', { class: 'row-wrap practice-rapid-seconds' },
        h('span', { class: 'small muted' }, 'Duration'),
        rapidSeconds.map(secs => h('button', {
          type: 'button',
          class: `chip${selectedRapidSeconds === secs ? ' active' : ''}`,
          onclick: () => { selectedRapidSeconds = secs; draw() },
        }, `${secs}s`)))
      : null

    const startLabel = selectedMode ? `Start · ${modeById[selectedMode].title}` : 'Pick a mode above'
    const startBtn = h('a', {
      class: `btn btn-primary btn-lg practice-start${selectedMode ? '' : ' disabled'}`,
      href: startHref() || '#',
      onclick: event => { if (!selectedMode) event.preventDefault() },
    }, startLabel)

    root.replaceChildren(
      subnav('practice', 'practice'),
      h('div', { class: 'page-header' }, h('h1', null, 'Practice')),
      h('div', { class: 'grid practice-mode-grid' }, modeTiles),
      h('div', { class: 'stack practice-start-wrap' }, rapidOptionsRow, startBtn),
      filtersDetails)
  }

  draw()
  return null
}

function missedExists(results) {
  return results.some(result => !result.correct)
}

function renderEnd(container, { results, xpGained, masteryBefore, mode, scope, ms }) {
  const answered = results.filter(result => !result.skipped)
  const correctCount = answered.filter(result => result.correct).length
  const total = answered.length
  const accuracy = total ? correctCount / total : 0
  const skillsTouched = [...new Set(answered.flatMap(result => result.skills || []))]
  const deltas = skillsTouched.map(skill => {
    const before = masteryBefore[skill] ?? 0.3
    const after = safeMastery(skill)
    return { skill, before, after, delta: after - before }
  }).sort((a, b) => b.delta - a.delta)
  const missed = answered.filter(result => !result.correct)
  let recs = []
  try { recs = recommendNext({ limit: 1 }) } catch {}
  const rec = recs[0]

  if (total >= 3 && accuracy >= 0.8) { try { confetti() } catch {} }

  container.replaceChildren(h('div', { class: 'practice-end stack' },
    h('div', { class: 'summary-stats' },
      statBlock(`${Math.round(accuracy * 100)}%`, 'accuracy'),
      statBlock(`${correctCount}/${total}`, 'correct'),
      statBlock(formatElapsed(ms), 'time'),
      statBlock(`+${xpGained}`, 'XP')),
    deltas.length ? h('div', { class: 'stack' },
      h('div', { class: 'label muted' }, 'Skills moved'),
      deltas.map(({ skill, before, after, delta }) => h('a', { class: 'delta-row', href: practiceHref('weakest', { skills: [skill] }, { count: 10 }) },
        h('span', { class: 'delta-name' }, skills[skill]?.label || skill),
        h('span', { class: 'delta-bar' },
          h('span', { class: 'delta-before', style: { width: `${Math.round(Math.min(before, after) * 100)}%` } }),
          h('span', { class: `delta-change ${delta >= 0 ? 'up' : 'down'}`, style: { left: `${Math.round(Math.min(before, after) * 100)}%`, width: `${Math.round(Math.abs(delta) * 100)}%` } })),
        h('span', { class: `delta-num ${delta > 0.001 ? 'up' : delta < -0.001 ? 'down' : ''}` },
          `${Math.round(after * 100)}% ${delta > 0.001 ? '▲' : delta < -0.001 ? '▼' : ''}`)))) : null,
    missed.length ? h('div', { class: 'stack' },
      h('div', { class: 'label muted' }, 'Missed'),
      missed.slice(0, 8).map(result => h('div', { class: 'missed-row' },
        h('span', { class: 'chip' }, result.kind),
        h('span', null, result.label || result.itemId)))) : null,
    rec ? h('a', { class: 'card card-hover practice-rec', href: rec.href },
      h('span', { class: 'pill pill-teal' }, 'Up next'),
      h('strong', null, rec.title),
      h('span', { class: 'muted small' }, rec.reason)) : null,
    h('div', { class: 'row practice-end-actions' },
      h('a', { class: 'btn btn-ghost', href: '#/practice' }, 'Practice hub'),
      h('button', { class: 'btn', 'data-action': 'again' }, 'Retry'),
      missedExists(results) ? h('a', { class: 'btn', href: practiceHref('mixed', { ...scope, missedOnly: true }) }, 'Redo misses') : null,
      rec ? h('a', { class: 'btn btn-primary', href: rec.href }, 'Next recommended') : null)))
}

function renderSession(container, params) {
  clear(container)
  const mode = params.mode
  const modeInfo = modeById[mode]
  const { scope, count, minutes, seconds, endless, timerOn } = scopeFromQuery(params.query || {})
  const nodeId = scope.nodeId || scope.moduleId || scope.unitId || null
  const effectiveEndless = endless && mode !== 'checkpoint'

  const endButton = h('button', { class: 'btn btn-ghost btn-sm', onclick: () => activeCleanup?.endNow?.() }, 'End session')
  const timerPill = h('span', { class: 'pill mono practice-timer-pill' }, '0:00')
  const topRow = h('div', { class: 'row spread practice-session-top' },
    h('div', { class: 'row' },
      h('a', { class: 'btn btn-ghost btn-sm', href: '#/practice' }, '← Practice'),
      h('span', { class: 'chip' }, modeInfo ? [icon(modeInfo.icon, 13), ` ${modeInfo.title}`] : mode)),
    h('div', { class: 'row' }, timerOn ? timerPill : null, endButton))
  const stage = h('div', { class: 'practice-session-stage' })
  const page = h('div', { class: 'page practice-session' }, topRow, stage)
  container.append(page)

  let activeCleanup = null
  let timerInterval = null

  function teardown() {
    clearEventContext()
    clearInterval(timerInterval)
    if (typeof activeCleanup === 'function') {
      try { activeCleanup() } catch {}
    }
    activeCleanup = null
  }

  function finish(results) {
    clearInterval(timerInterval)
    endButton.hidden = true
    const ms = Date.now() - startedAt
    let session = null
    try { session = saveSession({ mode, scope, results, ms }) } catch {}
    if (mode === 'checkpoint' && nodeId) {
      try { recordCheckpoint(nodeId, session?.pct ?? Math.round((results.filter(r => r.correct).length / Math.max(1, results.length)) * 100)) } catch {}
    }
    clearEventContext()
    const xpGained = Math.max(0, getXP() - xpBefore)
    const endEl = h('div')
    stage.replaceChildren(endEl)
    renderEnd(endEl, { results, xpGained, masteryBefore, mode, scope, ms })
    endEl.querySelector('[data-action="again"]')?.addEventListener('click', start)
  }

  let startedAt = 0
  let xpBefore = 0
  let masteryBefore = {}

  function loadMore(resultsSoFar) {
    const usedIds = new Set(resultsSoFar.map(result => result.itemId))
    let extra = []
    try { extra = buildSession({ mode, scope, count, seconds, minutes }) } catch { extra = [] }
    return extra.filter(item => !usedIds.has(resultItemId(item)))
  }

  function start() {
    teardown()
    startedAt = Date.now()
    xpBefore = getXP()
    setEventContext({ mode, nodeId, topic: scope.topic })

    if (timerOn) {
      timerPill.textContent = '0:00'
      timerInterval = setInterval(() => { timerPill.textContent = formatElapsed(Date.now() - startedAt) }, 1000)
    }
    endButton.hidden = false

    let items = []
    try { items = buildSession({ mode, scope, count, seconds, minutes }) } catch (error) { console.error(error) }
    const skillsTouched = new Set(items.flatMap(item => item.skills || []))
    masteryBefore = Object.fromEntries([...skillsTouched].map(skill => [skill, safeMastery(skill)]))

    if (!items.length) {
      clearEventContext()
      clearInterval(timerInterval)
      stage.replaceChildren(h('div', { class: 'empty card' },
        h('div', { class: 'empty-icon' }, icon('folder', 32)),
        h('h3', null, 'Nothing matches this scope'),
        h('a', { class: 'btn btn-primary', href: '#/practice' }, 'Change scope')))
      return
    }

    const runStage = h('div')
    stage.replaceChildren(runStage)
    if (mode === 'rapid' || mode === 'speed') activeCleanup = runRapid(runStage, items, { seconds: seconds || modeInfo?.seconds || 90, onFinish: finish })
    else if (mode === 'diagnose') activeCleanup = runDiagnose(runStage, items, { onFinish: finish })
    else if (mode === 'predict') activeCleanup = runPredict(runStage, items, { onFinish: finish })
    else activeCleanup = runGeneric(runStage, items, { onFinish: finish, endless: effectiveEndless, loadMore })
  }

  start()

  return teardown
}

export default function render(container, params = {}) {
  if (!params.mode) return renderHub(container)
  return renderSession(container, params)
}
