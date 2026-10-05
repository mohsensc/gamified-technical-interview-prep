import { h, clear } from '../ui/h.js'
import { lineChart, barChart, heatmapCalendar, heatmapRow, beforeAfterBars } from '../ui/charts.js'
import {
  getState, subscribe, getEvents, getDailyRollups, getSkillHistory,
  getCheckpoint, getMissed, getNodeProgress, weakestSkills, getMastery, getSkillRecord, getBiteStatus,
} from '../store.js'
import { units, allModules, allBites, algorithmById, hrefFor } from '../content/curriculum.js'
import { skillGroups, skills, skillIds } from '../content/skills.js'
import { practiceHref } from '../engine/session.js'
import { continueTarget, hoursUntilInterview } from '../engine/recommend.js'

const masteryFloor = 0.3
const masteryTarget = 0.85
const realSkillIds = skillIds.filter(id => id !== 'communication')
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const dayMs = 86400e3

const clamp01 = v => Math.max(0, Math.min(1, v))

const dayKeyLocal = ts => {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const startOfDay = (ts = Date.now()) => {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

const dayTs = dayStr => new Date(`${dayStr}T12:00:00`).getTime()
const shortDay = dayStr => {
  const d = new Date(`${dayStr}T12:00:00`)
  return `${dayNames[d.getDay()]} ${d.getDate()}`
}
const dateLabel = dayStr => new Date(`${dayStr}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

const heatColor = mastery => {
  if (mastery < 0.35) return 'var(--red)'
  if (mastery < 0.55) return 'var(--amber)'
  if (mastery < 0.75) return 'var(--sky)'
  return 'var(--green)'
}

const barColorFor = id => ({ mastery: 'var(--teal)', checkpoint: 'var(--sky)', accuracy: 'var(--amber)', coverage: 'var(--green)' }[id] || 'var(--accent)')

const skillLabel = id => skills[id]?.label || id

const mustLearnSkills = () => [...new Set(allModules.filter(mod => mod.mustLearn).flatMap(mod => mod.skills))].filter(id => id !== 'communication')
const checkpointNodes = () => [...units, ...allModules]

function firstFailingCheckpointHref() {
  for (const mod of allModules) {
    const core = mod.bites.filter(bite => !bite.optional)
    if (core.length && core.every(bite => getBiteStatus(bite.id).done) && !getCheckpoint(mod.id)?.passed) return practiceHref('checkpoint', { moduleId: mod.id })
  }
  for (const unit of units) if (!getCheckpoint(unit.id)?.passed) return practiceHref('checkpoint', { unitId: unit.id })
  return '#/course'
}

function computeReadiness() {
  const mustSkills = mustLearnSkills()
  const masteryAvg = mustSkills.length ? mustSkills.reduce((sum, id) => sum + getMastery(id), 0) / mustSkills.length : masteryFloor
  const masteryScore = clamp01((masteryAvg - masteryFloor) / (masteryTarget - masteryFloor))

  const nodes = checkpointNodes()
  const passed = nodes.filter(node => getCheckpoint(node.id)?.passed).length
  const checkpointScore = nodes.length ? passed / nodes.length : 0

  const rollups = getDailyRollups(7).filter(d => d.accuracy != null)
  const accAvg = rollups.length ? rollups.reduce((sum, d) => sum + d.accuracy, 0) / rollups.length : null
  const accuracyScore = accAvg ?? 0

  const coreBites = allBites.filter(bite => !bite.optional)
  const doneBites = coreBites.filter(bite => getBiteStatus(bite.id).done).length
  const coverageScore = coreBites.length ? doneBites / coreBites.length : 0

  const weights = { mastery: 0.35, checkpoint: 0.25, accuracy: 0.2, coverage: 0.2 }
  const total = masteryScore * weights.mastery + checkpointScore * weights.checkpoint + accuracyScore * weights.accuracy + coverageScore * weights.coverage
  return {
    score: Math.round(total * 100),
    breakdown: [
      { id: 'mastery', label: 'Must-learn mastery', pct: Math.round(masteryScore * 100), href: practiceHref('weakest', { skills: mustSkills }, { minutes: 10 }) },
      { id: 'checkpoint', label: 'Checkpoints passed', pct: Math.round(checkpointScore * 100), detail: `${passed}/${nodes.length}`, href: firstFailingCheckpointHref() },
      { id: 'accuracy', label: 'Accuracy (7d)', pct: accAvg == null ? null : Math.round(accAvg * 100), href: practiceHref('mixed', { missedOnly: true }, { minutes: 10 }) },
      { id: 'coverage', label: 'Core coverage', pct: Math.round(coverageScore * 100), detail: `${doneBites}/${coreBites.length}`, href: continueTarget() },
    ],
  }
}

function etaLabel() {
  const hrs = hoursUntilInterview()
  if (hrs <= 0) return 'Interview time'
  if (hrs < 48) return `${Math.max(1, Math.round(hrs))}h to interview`
  return `${Math.round(hrs / 24)}d to interview`
}

function renderReadiness() {
  const data = computeReadiness()
  const scoreColor = data.score >= 75 ? 'var(--green)' : data.score >= 50 ? 'var(--amber)' : 'var(--red)'
  return h('div', { class: 'card stack readiness-card' },
    h('div', { class: 'spread' },
      h('div', null,
        h('span', { class: 'section-title' }, 'Readiness for Tuesday'),
        h('div', { class: 'readiness-score', style: { color: scoreColor } }, String(data.score))),
      h('span', { class: 'muted small' }, etaLabel())),
    h('div', { class: 'stack-sm readiness-breakdown' }, data.breakdown.map(row => h('a', { class: 'readiness-row', href: row.href },
      h('div', { class: 'spread small' },
        h('span', null, row.label, row.detail ? h('span', { class: 'muted' }, ` · ${row.detail}`) : null),
        h('span', { class: 'mono' }, row.pct == null ? '–' : `${row.pct}%`)),
      h('div', { class: 'readiness-bar' }, h('div', { style: { width: `${row.pct ?? 0}%`, background: barColorFor(row.id) } }))))))
}

function accuracyPoints(skillSet, days = 21) {
  const since = startOfDay(Date.now() - (days - 1) * dayMs)
  const events = getEvents({ type: ['answer', 'card'], since })
  const byDay = new Map()
  for (const ev of events) {
    if (skillSet && !(ev.skills || []).some(id => skillSet.has(id))) continue
    const key = dayKeyLocal(ev.ts)
    const bucket = byDay.get(key) || { correct: 0, total: 0 }
    bucket.total += 1
    if (ev.correct) bucket.correct += 1
    byDay.set(key, bucket)
  }
  const points = []
  for (let i = 0; i < days; i++) {
    const key = dayKeyLocal(since + i * dayMs)
    const bucket = byDay.get(key)
    if (bucket) points.push({ x: points.length, y: (bucket.correct / bucket.total) * 100, label: `${shortDay(key)} · ${bucket.correct}/${bucket.total}` })
  }
  return points
}

function edgePicks(points) {
  if (!points.length) return []
  const picks = new Set([0, points.length - 1, Math.floor((points.length - 1) / 2)])
  return [...picks].sort((a, b) => a - b).map(i => ({ x: points[i].x, text: points[i].label.split(' · ')[0] }))
}

function renderAccuracySection(state) {
  const card = h('div', { class: 'card stack' })
  const select = h('select', { class: 'filter-select' }, h('option', { value: '' }, 'Overall'), units.map(unit => h('option', { value: unit.id }, `${unit.icon} ${unit.title}`)))
  select.value = state.accuracyUnit || ''
  const chartHost = h('div')
  const draw = () => {
    const unit = units.find(u => u.id === select.value)
    const points = accuracyPoints(unit ? new Set(unit.skills) : null)
    chartHost.replaceChildren(points.length >= 2
      ? lineChart([{ name: '', color: 'var(--teal)', points }], { yFormat: v => `${Math.round(v)}%`, yMin: 0, yMax: 100, area: true, xLabels: edgePicks(points) })
      : h('div', { class: 'empty small muted' }, 'Answer a few more items to chart this.'))
  }
  select.addEventListener('change', () => {
    state.accuracyUnit = select.value
    draw()
  })
  card.append(h('div', { class: 'spread' }, h('span', { class: 'section-title' }, 'Accuracy over time'), select), chartHost)
  draw()
  return card
}

function renderSpeedSection() {
  const days = 14
  const since = startOfDay(Date.now() - (days - 1) * dayMs)
  const events = getEvents({ type: 'answer', since }).filter(ev => (ev.mode === 'rapid' || ev.mode === 'diagnose') && ev.correct && Number.isFinite(ev.ms))
  const byDay = new Map()
  for (const ev of events) {
    const key = dayKeyLocal(ev.ts)
    const bucket = byDay.get(key) || { sum: 0, n: 0 }
    bucket.sum += ev.ms
    bucket.n += 1
    byDay.set(key, bucket)
  }
  const points = []
  for (let i = 0; i < days; i++) {
    const key = dayKeyLocal(since + i * dayMs)
    const bucket = byDay.get(key)
    if (bucket) points.push({ x: points.length, y: bucket.sum / bucket.n, label: `${shortDay(key)} · ${Math.round(bucket.sum / bucket.n)}ms` })
  }
  const card = h('div', { class: 'card stack' }, h('span', { class: 'section-title' }, 'Speed: rapid & diagnose'))
  card.append(points.length >= 2
    ? lineChart([{ name: '', color: 'var(--pink)', points }], { yFormat: v => `${Math.round(v)}ms`, xLabels: edgePicks(points) })
    : h('div', { class: 'empty small muted' }, 'Do a timed rapid-fire or diagnose round to chart this.'))
  return card
}

function masterySnapshot(skillId) {
  const now = getMastery(skillId)
  const history = getSkillHistory(skillId)
  const before = history.length ? history[0].mastery : now
  return { before, after: now }
}

function renderMasterySection() {
  const card = h('div', { class: 'card stack' }, h('span', { class: 'section-title' }, 'Mastery: first day vs now'))
  for (const group of skillGroups) {
    const items = group.skills.map(([id, label]) => ({ id, label, ...masterySnapshot(id) })).sort((a, b) => a.after - b.after)
    card.append(h('div', { class: 'stack-sm' }, h('div', { class: 'small muted' }, group.label), beforeAfterBars(items, { max: 1, formatValue: v => `${Math.round(v * 100)}%` })))
  }
  return card
}

function renderXpMinutesSection() {
  const rollups = getDailyRollups(14)
  const xpItems = rollups.map(d => ({ label: shortDay(d.day).split(' ')[1], values: [{ value: d.xp, color: 'var(--amber)', name: 'XP' }] }))
  const minuteItems = rollups.map(d => ({ label: shortDay(d.day).split(' ')[1], values: [{ value: d.minutes, color: 'var(--sky)', name: 'min' }] }))
  return h('div', { class: 'card stack' },
    h('span', { class: 'section-title' }, 'XP & minutes per day'),
    h('div', { class: 'small muted' }, 'XP'), barChart(xpItems, { yFormat: v => String(Math.round(v)) }),
    h('div', { class: 'small muted', style: 'margin-top:4px' }, 'Minutes studied'), barChart(minuteItems, { yFormat: v => `${Math.round(v)}m` }))
}

function renderCourseSection(state) {
  const card = h('div', { class: 'card stack' }, h('span', { class: 'section-title' }, 'Course completion'))
  const open = state.openUnits
  for (const unit of units) {
    const prog = getNodeProgress(unit.id)
    card.append(h('details', { class: 'course-unit', open: open.has(unit.id) || null, ontoggle: event => { if (event.currentTarget.open) open.add(unit.id); else open.delete(unit.id) } },
      h('summary', { class: 'spread' }, h('span', null, `${unit.icon} ${unit.title}`), h('span', { class: 'mono small' }, `${Math.round(prog * 100)}%`)),
      h('div', { class: 'progress' }, h('div', { style: { width: `${prog * 100}%` } })),
      h('div', { class: 'stack-sm module-list' }, unit.modules.map(mod => {
        const mp = getNodeProgress(mod.id)
        return h('a', { class: 'module-row', href: hrefFor(mod.id) },
          h('div', { class: 'spread small' }, h('span', null, mod.title), h('span', { class: 'mono muted' }, `${Math.round(mp * 100)}%`)),
          h('div', { class: 'progress sky' }, h('div', { style: { width: `${mp * 100}%` } })))
      }))))
  }
  return card
}

function renderActivitySection() {
  const daily = getDailyRollups(70).map(d => ({ date: d.day, value: d.minutes, label: `${dateLabel(d.day)} · ${d.minutes}m, ${d.count} answers` }))
  const hours = Array.from({ length: 24 }, (_, hr) => ({ hour: hr, value: 0 }))
  for (const ev of getEvents({ since: startOfDay() })) hours[new Date(ev.ts).getHours()].value += 1
  for (const cell of hours) {
    cell.label = `${String(cell.hour).padStart(2, '0')}:00 · ${cell.value} event${cell.value === 1 ? '' : 's'}`
    cell.shortLabel = cell.hour % 6 === 0 ? `${cell.hour}h` : ''
  }
  return h('div', { class: 'card stack' },
    h('span', { class: 'section-title' }, 'Activity'),
    h('div', { class: 'small muted' }, 'Today by hour'), heatmapRow(hours, { color: 'var(--sky)' }),
    h('div', { class: 'small muted', style: 'margin-top:10px' }, 'Last 10 weeks'), heatmapCalendar(daily, { colorVar: 'var(--teal)' }))
}

function renderSkillExtremesSection(state) {
  const attempted = Object.entries(state.skills).filter(([id, record]) => id !== 'communication' && record.attempts >= 1)
  const strongest = [...attempted].sort((a, b) => b[1].mastery - a[1].mastery).slice(0, 5)
  const weakIds = weakestSkills(5, realSkillIds)

  const row = (id, record) => h('a', { class: 'weak-item', href: practiceHref('weakest', { skills: [id] }, { minutes: 5 }) },
    h('div', { class: 'grow stack-sm' },
      h('b', null, skillLabel(id)),
      h('div', { class: 'heat-bar', style: { '--heat': heatColor(record.mastery) } }, h('div', { style: { width: `${record.mastery * 100}%` } }))),
    h('span', { class: 'mono small muted' }, `${Math.round(record.mastery * 100)}%`))

  return h('div', { class: 'grid-2' },
    h('div', { class: 'card stack' }, h('span', { class: 'section-title' }, 'Strongest skills'),
      strongest.length ? strongest.map(([id, record]) => row(id, record)) : h('div', { class: 'empty small muted' }, 'Practice a few to see this.')),
    h('div', { class: 'card stack' }, h('span', { class: 'section-title' }, 'Weakest skills'),
      weakIds.map(id => row(id, getSkillRecord(id)))))
}

function renderMissedSection() {
  const missed = getMissed({ since: Date.now() - 7 * dayMs }).slice(0, 8)
  const card = h('div', { class: 'card stack' },
    h('div', { class: 'spread' }, h('span', { class: 'section-title' }, 'Most missed (7d)'), h('a', { class: 'small', href: practiceHref('mixed', { missedOnly: true }, { minutes: 10 }) }, 'Practice all ▸')))
  if (!missed.length) {
    card.append(h('div', { class: 'empty small muted' }, 'Nothing missed recently.'))
    return card
  }
  card.append(...missed.map(item => h('a', {
    class: 'stats-missed-row',
    href: practiceHref('mixed', item.skills?.length ? { skills: item.skills } : {}, { minutes: 5 }),
  },
    h('span', { class: 'pill' }, item.kind),
    h('span', { class: 'grow small' }, (item.skills || []).map(skillLabel).join(', ') || item.id),
    h('span', { class: 'muted small mono' }, `${item.attempts}×`))))
  return card
}

function mergedSkillAverageHistory(ids) {
  const dayMap = new Map()
  for (const id of ids) for (const { day, mastery } of getSkillHistory(id)) {
    const arr = dayMap.get(day) || []
    arr.push(mastery)
    dayMap.set(day, arr)
  }
  return [...dayMap.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([day, arr]) => ({ t: dayTs(day), v: arr.reduce((sum, v) => sum + v, 0) / arr.length }))
}

function cumulativeCheckpointHistory() {
  const events = getEvents({ type: 'checkpoint' }).filter(ev => ev.correct).sort((a, b) => a.ts - b.ts)
  const seen = new Set()
  const points = []
  for (const ev of events) {
    if (!ev.nodeId || seen.has(ev.nodeId)) continue
    seen.add(ev.nodeId)
    points.push({ t: ev.ts, v: seen.size })
  }
  return points
}

const cumulativeFromDates = dates => [...dates].filter(Number.isFinite).sort((a, b) => a - b).map((t, i) => ({ t, v: i + 1 }))

function estimatePace(history) {
  const pts = history.filter(p => Number.isFinite(p.v))
  if (pts.length < 2) return null
  const first = pts[0]
  const last = pts[pts.length - 1]
  const days = (last.t - first.t) / dayMs
  if (days < 0.5) return null
  const rate = (last.v - first.v) / days
  if (rate <= 1e-9) return null
  return { rate, last: last.v }
}

function etaText(history, target) {
  const pace = estimatePace(history)
  if (!pace) return 'Keep practicing'
  const remaining = target - pace.last
  if (remaining <= 0) return 'Done'
  const hours = (remaining / pace.rate) * 24
  if (hours > 24 * 30) return 'Weeks+'
  if (hours < 1) return '<1h'
  if (hours < 48) return `${Math.round(hours)}h`
  return `${Math.round(hours / 24)}d`
}

const pctFmt = (now, target) => `${Math.round(now * 100)}% of ${Math.round(target * 100)}% target`
const countFmt = (now, target) => `${Math.round(now)} / ${Math.round(target)}`

function buildGoals() {
  const state = getState()
  const mustSkills = mustLearnSkills()
  const masteryAvg = mustSkills.length ? mustSkills.reduce((sum, id) => sum + getMastery(id), 0) / mustSkills.length : masteryFloor
  const nodes = checkpointNodes()
  const passedCount = nodes.filter(node => getCheckpoint(node.id)?.passed).length
  const constraintsMastery = getMastery('constraints')
  const mockDates = (state.mockHistory || []).map(entry => entry.date)
  const t1 = Object.values(algorithmById).filter(algo => algo.tier === 1)
  const seenMap = state.seen || {}
  const litDates = t1.map(algo => seenMap[algo.traceId]).filter(Boolean)

  return [
    { label: '80% mastery, all must-learn skills', now: masteryAvg, target: 0.8, fmt: pctFmt, history: mergedSkillAverageHistory(mustSkills), href: practiceHref('weakest', { skills: mustSkills }, { minutes: 10 }) },
    { label: 'Pass every checkpoint', now: passedCount, target: nodes.length, fmt: countFmt, history: cumulativeCheckpointHistory(), href: firstFailingCheckpointHref() },
    { label: '90% on constraints → complexity', now: constraintsMastery, target: 0.9, fmt: pctFmt, history: getSkillHistory('constraints').map(d => ({ t: dayTs(d.day), v: d.mastery })), href: practiceHref('weakest', { skills: ['constraints'] }, { minutes: 5 }) },
    { label: '5 mock interviews narrated', now: mockDates.length, target: 5, fmt: countFmt, history: cumulativeFromDates(mockDates), href: '#/mock' },
    { label: 'All T1 algorithms lit', now: litDates.length, target: Math.max(1, t1.length), fmt: countFmt, history: cumulativeFromDates(litDates), href: '#/algorithms' },
  ]
}

function renderGoalsSection() {
  const goals = buildGoals()
  return h('div', { class: 'card stack' }, h('span', { class: 'section-title' }, 'Learning goals'),
    goals.map(goal => {
      const pct = clamp01(goal.now / goal.target)
      const done = goal.now >= goal.target
      return h('a', { class: 'goal-row', href: goal.href },
        h('div', { class: 'spread small' }, h('span', null, goal.label), h('span', { class: 'mono' }, done ? 'Done' : etaText(goal.history, goal.target))),
        h('div', { class: 'progress' }, h('div', { style: { width: `${pct * 100}%`, background: done ? 'var(--green)' : 'var(--teal)' } })),
        h('div', { class: 'muted small' }, goal.fmt(goal.now, goal.target)))
    }))
}

function renderEmpty() {
  return h('div', { class: 'stack-lg' },
    h('div', { class: 'card empty' },
      h('div', { class: 'empty-icon' }, '📊'),
      h('h3', null, 'Nothing tracked yet'),
      h('p', { class: 'muted' }, 'Study a bit and your readiness, mastery and goals will show up here.'),
      h('a', { class: 'btn btn-primary', href: continueTarget() }, 'Start studying')),
    renderGoalsSection())
}

export default function render(container) {
  clear(container)
  const page = h('div', { class: 'page stats-page' })
  container.append(page)

  const pageState = { accuracyUnit: '', openUnits: new Set() }

  const signature = state => [
    state.events.length,
    Math.floor(state.studyMs / 60e3),
    state.xp,
    Object.keys(state.items).length,
    Object.keys(state.bites).length,
    Object.keys(state.checkpoints).length,
    state.sessions.length,
    (state.mockHistory || []).length,
  ].join('|')

  let lastSignature = ''

  const draw = () => {
    const state = getState()
    lastSignature = signature(state)
    if (!state.events.length) {
      page.replaceChildren(h('div', { class: 'page-header' }, h('h1', null, 'Stats')), renderEmpty())
      return
    }
    page.replaceChildren(
      h('div', { class: 'page-header' }, h('h1', null, 'Stats'), h('p', { class: 'sub' }, 'How ready you are for Tuesday.')),
      renderReadiness(),
      h('div', { class: 'grid-2' }, renderAccuracySection(pageState), renderSpeedSection()),
      renderMasterySection(),
      renderXpMinutesSection(),
      renderCourseSection(pageState),
      renderActivitySection(),
      renderSkillExtremesSection(state),
      renderMissedSection(),
      renderGoalsSection())
  }

  draw()
  const unsubscribe = subscribe(state => {
    if (signature(state) !== lastSignature) draw()
  })
  return () => unsubscribe()
}
