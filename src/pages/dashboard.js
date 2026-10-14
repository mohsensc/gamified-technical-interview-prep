import { h } from '../ui/h.js'
import { getState, subscribe, getSkillRecord, weakestSkills, dueItems, getMissed, getLevelInfo, getStreak, getStudyMinutes, getNodeProgress, getBiteStatus, getSetting, setSetting, recordAnswer } from '../store.js'
import { skillGroups, skills, skillIds } from '../content/skills.js'
import { units, allBites, hrefFor, allItems } from '../content/curriculum.js'
import { totalPlanMinutes } from '../content/plan.js'
import { recommendNext, nextIncompleteBite, getInterviewAt, setInterviewAt } from '../engine/recommend.js'
import { practiceHref } from '../engine/session.js'
import { planMinutesRemaining } from './plan.js'
import { getUser, accountsAvailable } from '../auth/index.js'
import { problems } from '../content/index.js'
import { matchesCompanies } from '../content/companies.js'
import { companyChips, companyFilter } from '../ui/companies.js'
import { renderItem, kindOf } from '../ui/items.js'
import { persistOverride } from '../ui/override.js'

const dailyGoalMinutes = 20
const heatColor = (mastery, attempts) => {
  if (!attempts) return 'var(--gray)'
  if (mastery < 0.35) return 'var(--red)'
  if (mastery < 0.55) return 'var(--amber)'
  if (mastery < 0.75) return 'var(--sky)'
  return 'var(--green)'
}

const kindColor = { continue: 'teal', 'must-learn': 'amber', drill: 'sky', review: 'pink', checkpoint: 'green', mock: 'amber', warmup: 'teal', oop: 'amber', read: 'sky' }

const formatMinutes = minutes => {
  const hours = Math.floor(minutes / 60)
  const rest = Math.round(minutes % 60)
  if (!hours) return `${rest}m`
  return rest ? `${hours}h ${rest}m` : `${hours}h`
}

const dateKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const hashString = text => {
  let hash = 2166136261
  for (const char of String(text)) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

const seededPick = (list, seed, count) => {
  if (!list.length || count <= 0) return []
  const arr = [...list]
  let state = (seed >>> 0) || 1
  const rand = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }
  const n = Math.min(count, arr.length)
  for (let i = arr.length - 1; i > arr.length - 1 - n; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.slice(arr.length - n)
}

const isNewVisitor = () => {
  const state = getState()
  return !Object.keys(state.items).length && !Object.keys(state.bites).length && !state.xp
}

async function loadTodaysThought() {
  try {
    const mod = await import('../content/thought/index.js')
    const data = await mod.loadThought()
    const pool = data?.items || []
    return pool.length ? seededPick(pool, hashString(dateKey()) + 1, 1)[0] : null
  } catch (error) {
    console.error(error)
    return null
  }
}

function welcomeHero() {
  const canSignIn = accountsAvailable() && !getUser()
  return h('div', { class: 'welcome-hero' },
    h('span', { class: 'eyebrow' }, 'Free coding interview prep'),
    h('h1', null, 'Learn the patterns behind every coding interview question.'),
    h('p', { class: 'muted welcome-sub' }, 'Lessons, drills, and mock interviews for Google, Amazon, Meta, Microsoft, Apple, and Bloomberg style problems — no signup required to start.'),
    h('div', { class: 'row-wrap' },
      h('a', { class: 'btn btn-primary btn-lg', href: '#/course' }, 'Start learning'),
      canSignIn ? h('a', { class: 'btn btn-lg btn-ghost', href: '#/login' }, 'Sign in to sync') : null))
}

function buildInterviewControl() {
  const el = h('div', { class: 'row-wrap interview-control' })
  let open = false

  const update = () => {
    const at = getInterviewAt()
    if (!open) {
      el.replaceChildren(
        at
          ? h('span', { class: 'eyebrow' }, `Interview in ${Math.max(0, Math.ceil((at.getTime() - Date.now()) / 86400e3))}d`)
          : h('span', { class: 'eyebrow' }, 'Studying at your own pace'),
        h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => { open = true; update() } }, at ? 'Change date' : '+ Add interview date'))
      return
    }
    const input = h('input', { type: 'date', class: 'interview-date-input', value: at ? at.toISOString().slice(0, 10) : '' })
    el.replaceChildren(
      input,
      h('button', { class: 'btn btn-primary btn-sm', type: 'button', onclick: () => { setInterviewAt(input.value || null); open = false; update() } }, 'Save'),
      at ? h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => { setInterviewAt(null); open = false; update() } }, 'Clear') : null,
      h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => { open = false; update() } }, 'Cancel'))
  }

  update()
  return el
}

function returningHero(interviewEl) {
  const levelInfo = getLevelInfo()
  const bite = nextIncompleteBite()
  const planLeft = planMinutesRemaining()
  const todayMinutes = getStudyMinutes({ todayOnly: true })
  const goalPct = Math.min(100, Math.round((todayMinutes / dailyGoalMinutes) * 100))

  return h('div', { class: 'hero-main' },
    bite
      ? h('a', { class: 'btn btn-primary hero-cta', href: hrefFor(bite.id) },
        h('span', { class: 'hero-cta-play' }, '▶'),
        h('span', { class: 'hero-cta-text' }, h('small', null, `Continue · ${bite.minutes}m`), h('b', null, bite.title)))
      : h('a', { class: 'btn btn-primary hero-cta', href: '#/course' },
        h('span', { class: 'hero-cta-play' }, '🎉'), h('span', { class: 'hero-cta-text' }, h('small', null, 'Core course complete'), h('b', null, 'Review the tree'))),
    interviewEl,
    h('div', { class: 'hero-stat-row' },
      h('div', { class: 'goal-ring-wrap' },
        h('div', { class: 'ring ring-lg', style: { '--pct': goalPct, '--ring-color': goalPct >= 100 ? 'var(--green)' : 'var(--teal)' } }, h('span', null, `${todayMinutes}m`)),
        h('span', { class: 'small muted' }, `Today's goal · ${dailyGoalMinutes}m`)),
      h('div', { class: 'grid-3 hero-stats' },
        h('div', { class: 'stat' }, h('span', { class: 'stat-value', style: 'color:var(--amber)' }, `Lv ${levelInfo.level}`), h('span', { class: 'stat-label' }, `${levelInfo.xp} XP`)),
        h('div', { class: 'stat' }, h('span', { class: 'stat-value' }, `${getStreak()}🔥`), h('span', { class: 'stat-label' }, 'day streak')),
        h('div', { class: 'stat' }, h('span', { class: 'stat-value' }, formatMinutes(planLeft)), h('span', { class: 'stat-label' }, 'plan left')))),
    h('div', { class: 'progress' }, h('div', { style: { width: `${Math.min(100, (1 - planLeft / Math.max(1, totalPlanMinutes)) * 100)}%` } })))
}

function dailyQuestionCard(item) {
  const kind = kindOf(item)
  const stage = h('div', { class: 'card tight daily-question' })
  const onAnswer = result => {
    try { recordAnswer({ itemId: item.id, kind, skills: item.skills || [], correct: result.correct, ms: result.ms }) } catch {}
  }
  const onOverride = () => persistOverride({ itemId: item.id, kind, skills: item.skills || [] })
  stage.append(renderItem(item, onAnswer, { onOverride }))
  return stage
}

function buildDailyChallengeSection(thoughtItem) {
  const dailySeed = hashString(dateKey())
  const questionPool = allItems.filter(item => ['mcq', 'cloze', 'parsons'].includes(item.kind) && item.skills?.length)
  const questionItems = seededPick(questionPool, dailySeed, 3)
  return h('div', { class: 'stack' },
    h('div', { class: 'spread' },
      h('span', { class: 'section-title' }, "Today's challenge"),
      h('span', { class: 'muted small mono' }, dateKey())),
    h('div', { class: 'stack daily-challenge-card card' },
      thoughtItem
        ? h('a', { class: 'daily-thought-row', href: `#/thought/${encodeURIComponent(thoughtItem.id)}` },
          h('div', { class: 'row-wrap' },
            thoughtItem.lc != null ? h('span', { class: 'mono small muted' }, `#${thoughtItem.lc}`) : null,
            h('span', { class: `pill diff-${String(thoughtItem.difficulty || '').toLowerCase()}` }, thoughtItem.difficulty),
            h('b', null, thoughtItem.title),
            companyChips(thoughtItem.companies, { size: 'xs' })),
          h('span', { class: 'btn btn-sm btn-primary' }, 'Walk through it →'))
        : null,
      questionItems.length
        ? h('div', { class: 'grid daily-questions' }, questionItems.map(dailyQuestionCard))
        : h('p', { class: 'muted small' }, 'No drill questions available yet.')))
}

function buildCompanyTrackSection() {
  const el = h('div', { class: 'stack' })
  let selected = getSetting('targetCompanies', [])

  const update = () => {
    const pool = selected.length ? problems.filter(problem => matchesCompanies(problem, selected)) : problems.filter(problem => (problem.companies || []).length)
    const picked = [...pool].sort((a, b) => (b.companies?.length || 0) - (a.companies?.length || 0) || (a.lc ?? 9999) - (b.lc ?? 9999)).slice(0, 8)
    el.replaceChildren(
      h('div', { class: 'spread' },
        h('span', { class: 'section-title' }, 'Company tracks'),
        h('span', { class: 'small muted' }, selected.length ? `${pool.length} matching` : 'pick a target company')),
      companyFilter({ selected, onChange: next => { selected = next; setSetting('targetCompanies', next); update() } }),
      picked.length
        ? h('div', { class: 'stack-sm track-list' }, picked.map(problem => h('a', { class: 'card card-hover track-row', href: `#/problems/${encodeURIComponent(problem.id)}` },
          h('div', { class: 'row-wrap grow' },
            problem.lc != null ? h('span', { class: 'mono small muted' }, `#${problem.lc}`) : null,
            h('b', null, problem.title),
            h('span', { class: `pill diff-${String(problem.difficulty || '').toLowerCase()}` }, problem.difficulty)),
          companyChips(problem.companies, { size: 'xs' }))))
        : h('p', { class: 'muted small' }, 'No problems tagged for that company yet.'))
  }

  update()
  return el
}

export default async function render(container) {
  const page = h('div', { class: 'page' })
  container.appendChild(page)

  const thoughtItem = await loadTodaysThought()
  const interviewEl = buildInterviewControl()
  const dailySection = buildDailyChallengeSection(thoughtItem)
  const trackSection = buildCompanyTrackSection()

  let mapOpen = null

  const draw = () => {
    const newVisitor = isNewVisitor()
    const heroEl = newVisitor ? welcomeHero() : returningHero(interviewEl)

    const recs = recommendNext({ limit: 3 })
    const nextSection = h('div', { class: 'stack' },
      h('span', { class: 'section-title' }, 'Recommended next'),
      h('div', { class: 'grid-3' }, recs.map(rec => h('a', { class: 'card card-hover stack-sm', href: rec.href },
        h('div', { class: 'spread' },
          h('span', { class: `pill pill-${kindColor[rec.kind] || 'teal'}` }, rec.kind.replace('-', ' ')),
          h('span', { class: 'mono small muted' }, formatMinutes(rec.minutes))),
        h('b', null, rec.title),
        h('span', { class: 'small muted' }, rec.reason)))))

    const courseMap = h('div', { class: 'stack' },
      h('div', { class: 'spread' }, h('span', { class: 'section-title' }, 'Course map'), h('a', { class: 'small', href: '#/course' }, 'Full tree ▸')),
      h('div', { class: 'grid-2' }, units.map(unit => {
        const progress = getNodeProgress(unit.id)
        return h('a', { class: 'card card-hover stack-sm', href: hrefFor(unit.id) },
          h('div', { class: 'spread' },
            h('div', { class: 'row' }, h('span', null, unit.icon), h('b', null, unit.title)),
            h('span', { class: 'mono small muted' }, `${Math.round(progress * 100)}%`)),
          h('div', { class: 'progress' }, h('div', { style: { width: `${progress * 100}%` } })),
          h('div', { class: 'row-wrap' }, unit.modules.map(mod => h('span', {
            class: `pill${mod.mustLearn ? ' pill-amber' : ''}`, title: mod.title,
          }, mod.title.length > 16 ? `${mod.title.slice(0, 15)}…` : mod.title))))
      })))

    const due = dueItems()
    const missed = getMissed({ since: Date.now() - 24 * 3600e3 })
    const weakest = weakestSkills(1, skillIds.filter(id => id !== 'communication'))[0]
    const quickTiles = [
      { icon: '⚡', title: 'Rapid fire', sub: 'Beat the clock', href: practiceHref('rapid', {}) },
      { icon: '🩺', title: 'Diagnose', sub: 'Pattern · DS · time · space', href: practiceHref('diagnose', {}) },
      { icon: '🗂️', title: 'Due cards', sub: `${due.length} due now`, href: practiceHref('mixed', { dueOnly: true }) },
      { icon: '↩️', title: 'Redo missed', sub: `${missed.length} wrong today`, href: practiceHref('mixed', { missedOnly: true }) },
      { icon: '🎯', title: 'Weakest skill', sub: weakest ? (skills[weakest]?.label || weakest) : 'All solid', href: weakest ? practiceHref('weakest', { skills: [weakest] }) : '#/practice' },
    ]
    const quickSection = h('div', { class: 'stack' },
      h('span', { class: 'section-title' }, 'Quick play'),
      h('div', { class: 'grid', style: 'grid-template-columns:repeat(auto-fill,minmax(170px,1fr))' },
        quickTiles.map(tile => h('a', { class: 'tile', href: tile.href },
          h('span', { class: 'tile-icon' }, tile.icon),
          h('span', { class: 'tile-title' }, tile.title),
          h('span', { class: 'tile-sub' }, tile.sub)))))

    const upcomingAlgoBites = allBites.filter(b => b.type === 'algo' && !getBiteStatus(b.id).done).slice(0, 6)
    const algoSection = h('div', { class: 'stack' },
      h('div', { class: 'spread' }, h('span', { class: 'section-title' }, 'Algorithm tree'), h('a', { class: 'small', href: '#/algorithms' }, 'Open tree ▸')),
      upcomingAlgoBites.length
        ? h('div', { class: 'row-wrap' }, upcomingAlgoBites.map(b => h('a', { class: 'chip', href: hrefFor(b.id) }, b.title)))
        : h('p', { class: 'muted small' }, 'Every algorithm node is lit up.'))

    const heatmapOpen = mapOpen ?? window.innerWidth > 600
    const statsSection = h('details', { class: 'card stack mastery-map', open: heatmapOpen || null, ontoggle: event => { mapOpen = event.currentTarget.open } },
      h('summary', { class: 'spread' },
        h('span', { class: 'section-title' }, 'Mastery map'),
        h('div', { class: 'row-wrap' },
          h('a', { class: 'small', href: '#/stats', onclick: event => event.stopPropagation() }, 'Full stats ▸'),
          h('div', { class: 'legend' },
            h('span', null, h('i', { style: 'background:var(--gray)' }), 'new'),
            h('span', null, h('i', { style: 'background:var(--red)' }), 'weak'),
            h('span', null, h('i', { style: 'background:var(--amber)' }), 'shaky'),
            h('span', null, h('i', { style: 'background:var(--sky)' }), 'ok'),
            h('span', null, h('i', { style: 'background:var(--green)' }), 'solid')))),
      skillGroups.map(group => h('div', { class: 'heatmap-group' },
        h('span', { class: 'small muted' }, group.label),
        h('div', { class: 'heatmap' }, group.skills.map(([id, label]) => {
          const record = getSkillRecord(id)
          const color = heatColor(record.mastery, record.attempts)
          return h('a', { class: 'heat-cell', href: `#/practice/weakest?skill=${id}`, title: `${label}: ${Math.round(record.mastery * 100)}% · ${record.attempts} tries`, style: { '--heat': color, '--heat-pct': record.attempts ? 10 + record.mastery * 18 : 0 } },
            h('div', { class: 'heat-row' }, h('span', null, label), h('span', { class: 'heat-pct' }, record.attempts ? `${Math.round(record.mastery * 100)}` : '·')),
            h('div', { class: 'heat-bar' }, h('div', { style: { width: `${record.mastery * 100}%` } })))
        })))))

    const sections = newVisitor
      ? [heroEl, dailySection, trackSection, courseMap, quickSection]
      : [heroEl, dailySection, nextSection, trackSection, courseMap, quickSection, algoSection, statsSection]
    page.replaceChildren(...sections)
  }

  draw()
  let lastSignature = ''
  const signature = state => `${state.xp}|${Object.keys(state.items).length}|${Object.keys(state.bites).length}|${Object.keys(state.checkpoints).length}|${state.sessions.length}|${Math.floor(state.studyMs / 60e3)}`
  lastSignature = signature(getState())
  const unsubscribe = subscribe(state => {
    const next = signature(state)
    if (next !== lastSignature) {
      lastSignature = next
      draw()
    }
  })
  return () => {
    unsubscribe()
  }
}
