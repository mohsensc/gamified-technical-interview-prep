import { h, clear, confetti } from '../ui/h.js'
import { units, allModules } from '../content/curriculum.js'
import { topics } from '../content/index.js'
import { skillGroups, skills } from '../content/skills.js'
import { buildSession, scopeFromQuery, practiceHref, modeById } from '../engine/session.js'
import { recommendNext } from '../engine/recommend.js'
import {
  getXP, getMastery, setEventContext, clearEventContext,
  saveSession, recordCheckpoint,
} from '../store.js'
import runRapid from '../ui/modes/rapid.js'
import runDiagnose from '../ui/modes/diagnose.js'
import runPredict from '../ui/modes/predict.js'
import runGeneric from '../ui/modes/generic.js'
import { statBlock } from '../ui/modes/shared.js'

const scopeKey = 'cram.practiceScope'

const tiles = [
  { mode: 'rapid', title: 'Rapid Fire', icon: '⚡', blurb: 'Beat the clock, 1-4 keys', seconds: [60, 120] },
  { mode: 'diagnose', title: 'Diagnose', icon: '🩺', blurb: 'Pattern → DS → time → space' },
  { mode: 'mcq', title: 'Multiple Choice', icon: '❓', blurb: 'Quick quiz' },
  { mode: 'cards', title: 'Flashcards', icon: '🃏', blurb: 'Flip and rate' },
  { mode: 'cloze', title: 'Fill-in', icon: '🧩', blurb: 'Complete the code' },
  { mode: 'parsons', title: 'Reorder', icon: '🔀', blurb: 'Put the lines in order' },
  { mode: 'predict', title: 'Predict the Trace', icon: '🔮', blurb: 'Guess the next line' },
  { mode: 'weakest', title: 'Weakest-first', icon: '🎯', blurb: 'Aimed at low mastery' },
  { mode: 'mixed', title: 'Redo Missed', icon: '🔁', blurb: 'Fix recent misses', extraScope: { missedOnly: true } },
  { mode: 'mixed', title: 'Bookmarks', icon: '★', blurb: 'Your saved items', extraScope: { bookmarksOnly: true } },
]

const safeMastery = skill => { try { return getMastery(skill) ?? 0.3 } catch { return 0.3 } }

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
    googleOnly: Boolean(saved.googleOnly),
    difficulty: Number(saved.difficulty) || 0,
    missedOnly: Boolean(saved.missedOnly),
  }
  let minutes = Number(saved.minutes) || 0

  const root = h('div', { class: 'page practice-page' })
  container.append(root)

  function persist() {
    writeScope({ ...scope, minutes })
  }

  function cleanScope(extra) {
    const out = {}
    if (scope.unitId) out.unitId = scope.unitId
    if (scope.moduleId) out.moduleId = scope.moduleId
    if (scope.skills.length) out.skills = scope.skills
    if (scope.topic) out.topic = scope.topic
    if (scope.googleOnly) out.googleOnly = true
    if (scope.difficulty) out.difficulty = scope.difficulty
    if (scope.missedOnly) out.missedOnly = true
    return { ...out, ...extra }
  }

  function tileHref(tile, seconds) {
    const options = {}
    if (minutes) options.minutes = minutes
    if (seconds) options.seconds = seconds
    return practiceHref(tile.mode, cleanScope(tile.extraScope), options)
  }

  function draw() {
    persist()
    const moduleOptions = scope.unitId ? allModules.filter(mod => mod.unitId === scope.unitId) : allModules
    const anyActive = scope.unitId || scope.moduleId || scope.skills.length || scope.topic || scope.googleOnly || scope.difficulty || scope.missedOnly || minutes

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

    const minuteChips = h('div', { class: 'row-wrap' }, [5, 10, 20].map(value => h('button', {
      class: `chip${minutes === value ? ' active' : ''}`,
      onclick: () => { minutes = minutes === value ? 0 : value; draw() },
    }, `${value}m`)))

    const skillGroupsEl = skillGroups.map(group => h('div', { class: 'practice-skill-group' },
      h('span', { class: 'muted small' }, group.label),
      h('div', { class: 'row-wrap' }, group.skills.map(([id, label]) => h('button', {
        class: `chip${scope.skills.includes(id) ? ' active' : ''}`,
        onclick: () => {
          scope.skills = scope.skills.includes(id) ? scope.skills.filter(s => s !== id) : [...scope.skills, id]
          draw()
        },
      }, label)))))

    const scopeBar = h('div', { class: 'card practice-scope stack' },
      h('div', { class: 'row-wrap practice-scope-row' },
        unitSelect, moduleSelect, topicSelect,
        h('button', { class: `chip${scope.googleOnly ? ' active' : ''}`, onclick: () => { scope.googleOnly = !scope.googleOnly; draw() } }, '🔎 Google only'),
        h('button', { class: `chip${scope.missedOnly ? ' active' : ''}`, onclick: () => { scope.missedOnly = !scope.missedOnly; draw() } }, '✗ Missed only'),
        diffChips,
        minuteChips,
        anyActive ? h('button', {
          class: 'chip practice-reset',
          onclick: () => { scope.unitId = ''; scope.moduleId = ''; scope.skills = []; scope.topic = ''; scope.googleOnly = false; scope.difficulty = 0; scope.missedOnly = false; minutes = 0; draw() },
        }, 'Reset') : null),
      h('details', { class: 'practice-skills-toggle' },
        h('summary', { class: 'muted small' }, scope.skills.length ? `${scope.skills.length} skill${scope.skills.length > 1 ? 's' : ''} selected` : 'Filter by skill'),
        h('div', { class: 'practice-skill-groups' }, skillGroupsEl)))

    const tilesEl = h('div', { class: 'grid practice-tiles' }, tiles.map(tile => {
      if (tile.seconds) {
        return h('div', { class: 'tile practice-tile' },
          h('div', { class: 'practice-tile-icon' }, tile.icon),
          h('div', { class: 'practice-tile-title' }, tile.title),
          h('div', { class: 'practice-tile-blurb muted small' }, tile.blurb),
          h('div', { class: 'row practice-tile-actions' }, tile.seconds.map(s => h('a', { class: 'btn btn-sm', href: tileHref(tile, s) }, `${s}s`))))
      }
      return h('a', { class: 'tile practice-tile', href: tileHref(tile) },
        h('div', { class: 'practice-tile-icon' }, tile.icon),
        h('div', { class: 'practice-tile-title' }, tile.title),
        h('div', { class: 'practice-tile-blurb muted small' }, tile.blurb))
    }))

    root.replaceChildren(
      h('div', { class: 'page-header' }, h('div', null, h('h1', null, 'Practice'), h('p', { class: 'muted' }, 'Pick a mode. Your scope sticks around.'))),
      scopeBar,
      tilesEl)
  }

  draw()
  return null
}

function missedExists(results) {
  return results.some(result => !result.correct)
}

function renderEnd(container, { results, xpGained, masteryBefore, mode, scope }) {
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
      statBlock(`+${xpGained}`, 'XP')),
    deltas.length ? h('div', { class: 'stack' },
      h('div', { class: 'label muted' }, 'Mastery'),
      deltas.map(({ skill, before, after, delta }) => h('a', { class: 'delta-row', href: practiceHref('weakest', { skills: [skill] }, { minutes: 5 }) },
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
      h('button', { class: 'btn', 'data-action': 'again' }, 'Again'),
      missedExists(results) ? h('a', { class: 'btn', href: practiceHref('mixed', { ...scope, missedOnly: true }) }, 'Redo misses') : null,
      rec ? h('a', { class: 'btn btn-primary', href: rec.href }, 'Next recommended') : null)))
}

function renderSession(container, params) {
  clear(container)
  const mode = params.mode
  const modeInfo = modeById[mode]
  const { scope, count, minutes, seconds } = scopeFromQuery(params.query || {})
  const nodeId = scope.nodeId || scope.moduleId || scope.unitId || null

  const topRow = h('div', { class: 'row practice-session-top' },
    h('a', { class: 'btn btn-ghost btn-sm', href: '#/practice' }, '← Practice'),
    h('span', { class: 'chip' }, modeInfo ? `${modeInfo.icon} ${modeInfo.title}` : mode))
  const stage = h('div', { class: 'practice-session-stage' })
  const page = h('div', { class: 'page practice-session' }, topRow, stage)
  container.append(page)

  let activeCleanup = null

  function teardown() {
    clearEventContext()
    if (typeof activeCleanup === 'function') {
      try { activeCleanup() } catch {}
    }
    activeCleanup = null
  }

  function finish(results) {
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
    renderEnd(endEl, { results, xpGained, masteryBefore, mode, scope })
    endEl.querySelector('[data-action="again"]')?.addEventListener('click', start)
  }

  let startedAt = 0
  let xpBefore = 0
  let masteryBefore = {}

  function start() {
    teardown()
    startedAt = Date.now()
    xpBefore = getXP()
    setEventContext({ mode, nodeId, topic: scope.topic })

    let items = []
    try { items = buildSession({ mode, scope, count, seconds, minutes }) } catch (error) { console.error(error) }
    const skillsTouched = new Set(items.flatMap(item => item.skills || []))
    masteryBefore = Object.fromEntries([...skillsTouched].map(skill => [skill, safeMastery(skill)]))

    if (!items.length) {
      clearEventContext()
      stage.replaceChildren(h('div', { class: 'empty card' },
        h('div', { class: 'empty-icon' }, '🗂'),
        h('h3', null, 'Nothing matches this scope'),
        h('a', { class: 'btn btn-primary', href: '#/practice' }, 'Change scope')))
      return
    }

    const runStage = h('div')
    stage.replaceChildren(runStage)
    if (mode === 'rapid') activeCleanup = runRapid(runStage, items, { seconds: seconds || modeInfo?.seconds || 90, onFinish: finish })
    else if (mode === 'diagnose') activeCleanup = runDiagnose(runStage, items, { onFinish: finish })
    else if (mode === 'predict') activeCleanup = runPredict(runStage, items, { onFinish: finish })
    else activeCleanup = runGeneric(runStage, items, { onFinish: finish })
  }

  start()

  return teardown
}

export default function render(container, params = {}) {
  if (!params.mode) return renderHub(container)
  return renderSession(container, params)
}
