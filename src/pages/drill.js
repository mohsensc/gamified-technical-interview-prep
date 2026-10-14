import { h, clear, confetti } from '../ui/h.js'
import { renderItem, kindOf, kindLabel } from '../ui/items.js'
import { overrideResult } from '../engine/session.js'
import * as store from '../store.js'
import { mcqs, clozes, parsons, flashcards, generators, topicById } from '../content/index.js'
import { skills, skillGroups, skillIds } from '../content/skills.js'
import { companyChips } from '../ui/companies.js'
import { companiesFor } from '../content/companies.js'

const companyBadge = item => { try { return companyChips(companiesFor(item), { size: 'xs' }) } catch { return null } }

const sessionSize = 15
const generatedPerGenerator = 3

const decodeParam = value => {
  try { return decodeURIComponent(value) } catch { return value }
}

function describeFilter(filter) {
  if (!filter) return { label: 'Adaptive mix', match: () => true }
  if (skills[filter]) return { label: skills[filter].label, match: item => (item.skills || []).includes(filter) }
  const topic = topicById[filter]
  if (topic) {
    const topicSkills = new Set(topic.skills || [])
    return { label: topic.title, match: item => item.topic === filter || (item.skills || []).some(skill => topicSkills.has(skill)) }
  }
  const group = skillGroups.find(g => g.id === filter)
  if (group) {
    const groupSkills = new Set(group.skills.map(([id]) => id))
    return { label: group.label, match: item => (item.skills || []).some(skill => groupSkills.has(skill)) }
  }
  return { label: filter, match: () => true }
}

function generatedItems() {
  const items = []
  for (const generator of generators) {
    for (let i = 0; i < generatedPerGenerator; i++) {
      try {
        const seed = Math.floor(Math.random() * 1e9)
        const made = generator.make(seed)
        if (!made || !Array.isArray(made.choices)) continue
        items.push({ ...made, kind: 'mcq', genId: generator.id, skills: made.skills || generator.skills || [], topic: made.topic })
      } catch {}
    }
  }
  return items
}

function buildPool(match) {
  const tag = (list, kind) => list.map(item => ({ ...item, kind }))
  const pool = [
    ...tag(mcqs, 'mcq'),
    ...tag(clozes, 'cloze'),
    ...tag(parsons, 'parsons'),
    ...tag(flashcards, 'card'),
    ...generatedItems(),
  ]
  return pool.filter(match)
}

const warmupSize = 3

function warmup(pool, adaptive) {
  if (!adaptive) return []
  let weak = []
  try { weak = store.weakestSkills(4, skillIds) || [] } catch {}
  const weakSet = new Set(weak)
  const candidates = pool.filter(item => item.kind === 'mcq' && (item.skills || []).some(skill => weakSet.has(skill)))
  const generated = candidates.filter(item => item.genId)
  const preferred = generated.length ? [...generated.sort(() => Math.random() - 0.5).slice(0, 1), ...candidates.filter(item => !item.genId)] : candidates
  let picked = []
  try { picked = store.pickAdaptive(preferred.slice(1), warmupSize - 1) || [] } catch {}
  return [...preferred.slice(0, 1), ...picked].slice(0, warmupSize)
}

function cardsLater(list) {
  const head = []
  const parked = []
  for (const item of list) {
    if (head.length < warmupSize && item.kind === 'card') parked.push(item)
    else head.push(item)
  }
  return [...head.slice(0, warmupSize), ...parked, ...head.slice(warmupSize)]
}

function pickSession(pool, adaptive = false) {
  const opening = warmup(pool, adaptive)
  const openingIds = new Set(opening.map(item => item.id))
  const rest = pool.filter(item => !openingIds.has(item.id))
  let picked = []
  try { picked = store.pickAdaptive(rest, sessionSize - opening.length) || [] } catch { picked = [] }
  if (!picked.length) picked = [...rest].sort(() => Math.random() - 0.5).slice(0, sessionSize - opening.length)
  picked = cardsLater([...opening, ...picked])
  const seenGen = new Set()
  return picked.filter(item => {
    if (!item.genId) return true
    const key = item.id
    if (seenGen.has(key)) return false
    seenGen.add(key)
    return true
  })
}

const pct = value => `${Math.round((value || 0) * 100)}%`

export default function render(container, params = {}) {
  const filterId = params.skill ? decodeParam(params.skill) : null
  const filter = describeFilter(filterId)
  let keyListener = null
  let advanceTimer = null

  const setKeyListener = listener => {
    if (keyListener) document.removeEventListener('keydown', keyListener)
    keyListener = listener
    if (listener) document.addEventListener('keydown', listener)
  }

  function startSession() {
    clearTimeout(advanceTimer)
    setKeyListener(null)
    const pool = buildPool(filter.match)
    clear(container)

    if (!pool.length) {
      container.append(h('div', { class: 'page drill-page' },
        h('div', { class: 'page-header' }, h('h1', null, filter.label)),
        h('div', { class: 'empty card' },
          h('div', null, 'Nothing to drill here yet.'),
          h('a', { class: 'btn btn-primary', href: '#/drill' }, 'Adaptive mix'))))
      return
    }

    let dueCount = 0
    try { dueCount = store.dueItems().length } catch {}
    const items = pickSession(pool, !filterId && !dueCount)
    const skillsTouched = new Set(items.flatMap(item => item.skills || []))
    const masteryBefore = Object.fromEntries([...skillsTouched].map(skill => [skill, safeMastery(skill)]))
    const results = []
    let index = 0
    let combo = 0
    let bestCombo = 0
    let comboBeforeMiss = 0
    let xpTotal = 0
    let answered = false
    let readyAt = 0

    const progressFill = h('div', { class: 'progress-fill' })
    const progressEl = h('div', { class: 'progress drill-progress' }, progressFill)
    const counterEl = h('span', { class: 'drill-count muted' })
    const comboEl = h('span', { class: 'combo' })
    const xpText = h('span', null, '0 XP')
    const xpEl = h('span', { class: 'pill drill-xp' }, xpText)
    const popLayer = h('div', { class: 'xp-pop-layer' })
    const stage = h('div', { class: 'drill-stage' })
    const metaEl = h('div', { class: 'drill-meta row' })
    const nextButton = h('button', { class: 'btn btn-primary drill-next', onclick: () => next() }, 'Next ', h('span', { class: 'kbd' }, '↵'))
    const skipButton = h('button', { class: 'btn btn-ghost', onclick: () => next(true) }, 'Skip')
    const footer = h('div', { class: 'row drill-footer' }, skipButton, nextButton)

    const page = h('div', { class: 'page drill-page' },
      h('div', { class: 'drill-top' },
        h('div', { class: 'row drill-title' },
          h('a', { class: 'btn btn-ghost', href: '#/' }, '←'),
          h('h1', null, filter.label),
          h('div', { class: 'row drill-stats' }, comboEl, xpEl, counterEl)),
        progressEl,
        popLayer),
      metaEl,
      h('div', { class: 'card drill-card' }, stage),
      footer)
    container.append(page)

    function updateHeader() {
      progressFill.style.width = `${(index / items.length) * 100}%`
      counterEl.textContent = `${Math.min(index + 1, items.length)}/${items.length}`
      comboEl.textContent = combo >= 2 ? `×${combo}` : ''
      comboEl.classList.toggle('hot', combo >= 5)
      xpText.textContent = `${xpTotal} XP`
    }

    function popXp(amount, correct) {
      if (!amount) return
      const pop = h('div', { class: `xp-pop ${correct ? 'good' : 'bad'}` }, `+${amount} XP`)
      xpEl.append(pop)
      setTimeout(() => pop.remove(), 1100)
    }

    function show() {
      answered = false
      clearTimeout(advanceTimer)
      const item = items[index]
      const kind = kindOf(item)
      nextButton.hidden = true
      skipButton.hidden = false
      metaEl.replaceChildren(
        h('span', { class: `chip kind-chip kind-${kind}` }, kindLabel[kind] || kind),
        companyBadge(item),
        ...(item.skills || []).slice(0, 3).map(skill => h('span', { class: 'chip chip-skill' }, skills[skill]?.label || skill)),
        item.difficulty ? h('span', { class: 'muted diff-dots' }, '●'.repeat(item.difficulty) + '○'.repeat(Math.max(0, 3 - item.difficulty))) : null)
      stage.replaceChildren(renderItem(item, result => onAnswered(item, kind, result), { onOverride: () => onOverridden(item, kind) }))
      updateHeader()
      if (kind !== 'cloze') stage.querySelector('button, .flash-card')?.focus?.({ preventScroll: true })
    }

    function onAnswered(item, kind, result) {
      if (answered) return
      answered = true
      readyAt = performance.now() + 250
      let outcome = null
      try {
        if (kind === 'card') outcome = store.rateCard(item.id, item.skills || [], result.grade)
        else outcome = store.recordAnswer({ itemId: item.genId || item.id, kind, skills: item.skills || [], correct: result.correct, ms: result.ms })
      } catch {}
      const xpGained = outcome?.xpGained ?? (kind === 'card' ? 0 : result.correct ? 10 : 2)
      xpTotal += xpGained
      comboBeforeMiss = combo
      combo = result.correct ? combo + 1 : 0
      bestCombo = Math.max(bestCombo, combo)
      results.push({ item, kind, correct: result.correct })
      popXp(xpGained, result.correct)
      if (combo > 0 && combo % 5 === 0) confetti()
      updateHeader()
      skipButton.hidden = true
      if (kind === 'card') {
        advanceTimer = setTimeout(() => next(), 220)
        return
      }
      nextButton.hidden = false
      nextButton.focus({ preventScroll: true })
    }

    function onOverridden(item, kind) {
      const { result } = overrideResult(results, entry => entry.item === item, { itemId: item.genId || item.id, kind, skills: item.skills || [] })
      if (!result) return
      const bonus = 8
      xpTotal += bonus
      combo = comboBeforeMiss + 1
      bestCombo = Math.max(bestCombo, combo)
      popXp(bonus, true)
      updateHeader()
    }

    function next(skipped = false) {
      if (!answered && !skipped) return
      if (skipped && !answered) {
        results.push({ item: items[index], kind: kindOf(items[index]), correct: false, skipped: true })
        combo = 0
      }
      index += 1
      if (index >= items.length) finish()
      else show()
    }

    setKeyListener(event => {
      if (!page.isConnected) return
      if (!answered || performance.now() < readyAt) return
      if (event.key === 'Enter' || event.key === 'ArrowRight') {
        event.preventDefault()
        next()
      }
    })

    function finish() {
      setKeyListener(null)
      progressFill.style.width = '100%'
      const answeredResults = results.filter(result => !result.skipped)
      const correctCount = answeredResults.filter(result => result.correct).length
      const accuracy = answeredResults.length ? correctCount / answeredResults.length : 0
      if (accuracy >= 0.8) confetti()

      const deltas = [...skillsTouched].map(skill => {
        const after = safeMastery(skill)
        return { skill, before: masteryBefore[skill], after, delta: after - masteryBefore[skill] }
      }).sort((a, b) => b.delta - a.delta)

      const missed = results.filter(result => !result.correct)

      stage.replaceChildren(h('div', { class: 'drill-summary stack' },
        h('div', { class: 'summary-stats' },
          stat(`${Math.round(accuracy * 100)}%`, 'accuracy'),
          stat(`${correctCount}/${results.length}`, 'correct'),
          stat(`+${xpTotal}`, 'XP'),
          stat(`×${bestCombo}`, 'best combo')),
        deltas.length ? h('div', { class: 'stack summary-deltas' },
          h('div', { class: 'label muted' }, 'Mastery'),
          deltas.map(({ skill, before, after, delta }) => h('a', { class: 'delta-row', href: `#/drill/${skill}` },
            h('span', { class: 'delta-name' }, skills[skill]?.label || skill),
            h('span', { class: 'delta-bar' },
              h('span', { class: 'delta-before', style: { width: pct(Math.min(before, after)) } }),
              h('span', { class: `delta-change ${delta >= 0 ? 'up' : 'down'}`, style: { left: pct(Math.min(before, after)), width: pct(Math.abs(delta)) } })),
            h('span', { class: `delta-num ${delta > 0.001 ? 'up' : delta < -0.001 ? 'down' : ''}` },
              `${pct(after)} ${delta > 0.001 ? '▲' : delta < -0.001 ? '▼' : ''}`)))) : null,
        missed.length ? h('div', { class: 'stack summary-missed' },
          h('div', { class: 'label muted' }, 'Missed'),
          missed.slice(0, 6).map(result => h('div', { class: 'missed-row' },
            h('span', { class: 'chip' }, kindLabel[result.kind] || result.kind),
            h('span', null, result.item.q || result.item.title || result.item.front || '')))) : null))

      metaEl.replaceChildren(h('span', { class: 'chip' }, 'Session done'))
      footer.replaceChildren(
        h('a', { class: 'btn btn-ghost', href: '#/' }, 'Dashboard'),
        filterId ? h('a', { class: 'btn btn-ghost', href: '#/drill' }, 'Mixed drill') : null,
        h('button', { class: 'btn btn-primary', onclick: () => startSession() }, 'Again ', h('span', { class: 'kbd' }, '↵')))
      setTimeout(() => {
        setKeyListener(event => {
          if (!page.isConnected) return
          if (event.key === 'Enter') {
            event.preventDefault()
            startSession()
          }
        })
      }, 300)
      counterEl.textContent = 'done'
    }

    show()
  }

  startSession()

  return () => {
    clearTimeout(advanceTimer)
    setKeyListener(null)
  }
}

function stat(value, label) {
  return h('div', { class: 'summary-stat' }, h('div', { class: 'summary-value' }, value), h('div', { class: 'summary-label muted' }, label))
}

function safeMastery(skill) {
  try { return store.getMastery(skill) ?? 0.3 } catch { return 0.3 }
}
