import { h } from '../ui/h.js'
import { getState, subscribe, getLevelInfo, getStreak, getStudyMinutes, getNodeProgress, recordAnswer } from '../store.js'
import { allItems, hrefFor, course } from '../content/curriculum.js'
import { recommendNext, nextIncompleteBite, getInterviewAt, setInterviewAt } from '../engine/recommend.js'
import { getUser, accountsAvailable } from '../auth/index.js'
import { companyChips } from '../ui/companies.js'
import { renderItem, kindOf } from '../ui/items.js'
import { persistOverride } from '../ui/override.js'

const dailyGoalMinutes = 20

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
          ? h('span', { class: 'small muted' }, `Interview in ${Math.max(0, Math.ceil((at.getTime() - Date.now()) / 86400e3))}d`)
          : h('span', { class: 'small muted' }, 'Studying at your own pace'),
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
  const bite = nextIncompleteBite()
  const todayMinutes = getStudyMinutes({ todayOnly: true })
  const goalPct = Math.min(100, Math.round((todayMinutes / dailyGoalMinutes) * 100))

  return h('div', { class: 'hero-main' },
    bite
      ? h('a', { class: 'btn btn-primary hero-cta', href: hrefFor(bite.id) },
        h('span', { class: 'hero-cta-play' }, '▶'),
        h('span', { class: 'hero-cta-text' }, h('small', null, `Continue · ${bite.minutes}m`), h('b', null, bite.title)))
      : h('a', { class: 'btn btn-primary hero-cta', href: '#/course' },
        h('span', { class: 'hero-cta-play' }, '🎉'), h('span', { class: 'hero-cta-text' }, h('small', null, 'Core course complete'), h('b', null, 'Review the tree'))),
    h('div', { class: 'row-wrap hero-sub' },
      h('div', { class: 'goal-ring-wrap' },
        h('div', { class: 'ring', style: { '--pct': goalPct, '--ring-color': goalPct >= 100 ? 'var(--green)' : 'var(--teal)' } }, h('span', null, `${todayMinutes}m`)),
        h('span', { class: 'small muted' }, `Today's goal · ${dailyGoalMinutes}m`)),
      interviewEl))
}

function dailyQuestionStepper(questionItems) {
  const stage = h('div', { class: 'card tight daily-question' })
  const showQuestion = index => {
    const item = questionItems[index]
    const kind = kindOf(item)
    const isLast = index === questionItems.length - 1
    const nextButton = h('button', { class: 'btn btn-sm btn-primary', style: { visibility: 'hidden' }, onclick: () => isLast ? showDone() : showQuestion(index + 1) }, isLast ? 'Finish' : 'Next →')
    const onAnswer = result => {
      try { recordAnswer({ itemId: item.id, kind, skills: item.skills || [], correct: result.correct, ms: result.ms }) } catch {}
      nextButton.style.visibility = 'visible'
    }
    const onOverride = () => persistOverride({ itemId: item.id, kind, skills: item.skills || [] })
    stage.replaceChildren(
      h('div', { class: 'spread' }, h('span', { class: 'small muted' }, `Question ${index + 1} of ${questionItems.length}`), nextButton),
      renderItem(item, onAnswer, { onOverride }))
  }
  const showDone = () => stage.replaceChildren(h('div', { class: 'spread' }, h('b', null, 'Daily questions done'), h('a', { class: 'btn btn-sm', href: '#/practice' }, 'Keep practicing →')))
  showQuestion(0)
  return stage
}

function buildTodaySection(thoughtItem) {
  const dailySeed = hashString(dateKey())
  const questionPool = allItems.filter(item => ['mcq', 'cloze', 'parsons'].includes(item.kind) && item.skills?.length && (item.lines?.length || 0) <= 12)
  const questionItems = seededPick(questionPool, dailySeed, 3)
  return h('div', { class: 'stack' },
    h('div', { class: 'spread' },
      h('span', { class: 'section-title' }, 'Today'),
      h('span', { class: 'pill pill-amber' }, `${getStreak()}🔥 streak`)),
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
        ? dailyQuestionStepper(questionItems)
        : h('p', { class: 'muted small' }, 'No drill questions available yet.')))
}

function buildNextUpSection() {
  const recs = recommendNext({ limit: 3 })
  return h('div', { class: 'stack' },
    h('span', { class: 'section-title' }, 'Next up'),
    h('div', { class: 'grid-3' }, recs.map(rec => h('a', { class: 'card card-hover stack-sm', href: rec.href },
      h('div', { class: 'spread' },
        h('span', { class: `pill pill-${kindColor[rec.kind] || 'teal'}` }, rec.kind.replace('-', ' ')),
        h('span', { class: 'mono small muted' }, formatMinutes(rec.minutes))),
      h('b', null, rec.title),
      h('span', { class: 'small muted' }, rec.reason)))))
}

function buildProgressGlanceSection() {
  const levelInfo = getLevelInfo()
  const overall = getNodeProgress(course.id)
  return h('div', { class: 'stack' },
    h('div', { class: 'spread' }, h('span', { class: 'section-title' }, 'Progress'), h('a', { class: 'small', href: '#/stats' }, 'Full stats ▸')),
    h('div', { class: 'grid-3 card' },
      h('div', { class: 'stat' }, h('span', { class: 'stat-value', style: 'color:var(--amber)' }, `Lv ${levelInfo.level}`), h('span', { class: 'stat-label' }, `${levelInfo.xp} XP`)),
      h('div', { class: 'stat' }, h('span', { class: 'stat-value' }, `${getStreak()}🔥`), h('span', { class: 'stat-label' }, 'day streak')),
      h('div', { class: 'stat' }, h('span', { class: 'stat-value' }, `${Math.round(overall * 100)}%`), h('span', { class: 'stat-label' }, 'course done'))))
}

export default async function render(container) {
  const page = h('div', { class: 'page' })
  container.appendChild(page)

  const thoughtItem = await loadTodaysThought()
  const interviewEl = buildInterviewControl()

  const draw = () => {
    const newVisitor = isNewVisitor()
    const heroEl = newVisitor ? welcomeHero() : returningHero(interviewEl)
    page.replaceChildren(heroEl, buildTodaySection(thoughtItem), buildNextUpSection(), buildProgressGlanceSection())
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
