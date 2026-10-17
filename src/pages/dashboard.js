import { h } from '../ui/h.js'
import { getState, subscribe, getLevelInfo, getStreak, getStudyMinutes, getNodeProgress, getEvents, dueItems, recordAnswer } from '../store.js'
import { allItems, hrefFor, course } from '../content/curriculum.js'
import { recommendNext, nextIncompleteBite, getInterviewAt, setInterviewAt } from '../engine/recommend.js'
import { getUser } from '../auth/index.js'
import { userInitial } from '../ui/account.js'
import { companyChips } from '../ui/companies.js'
import { renderItem, kindOf } from '../ui/items.js'
import { persistOverride } from '../ui/override.js'
import { heatmapCalendar } from '../ui/charts.js'

const dailyGoalMinutes = 20

const kindColor = { continue: 'teal', 'must-learn': 'amber', drill: 'sky', review: 'pink', checkpoint: 'green', mock: 'amber', warmup: 'teal', oop: 'amber', read: 'sky' }

const weekdayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const formatMinutes = minutes => {
  const hours = Math.floor(minutes / 60)
  const rest = Math.round(minutes % 60)
  if (!hours) return `${rest}m`
  return rest ? `${hours}h ${rest}m` : `${hours}h`
}

const dateKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const monthLabel = date => date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

const startOfMonth = date => new Date(date.getFullYear(), date.getMonth(), 1)

const isActiveDay = day => Boolean(day) && (day.answers > 0 || day.ms >= 60e3)

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

const getDailyQuestionItems = () => {
  const dailySeed = hashString(dateKey())
  const pool = allItems.filter(item => ['mcq', 'cloze', 'parsons'].includes(item.kind) && item.skills?.length && (item.lines?.length || 0) <= 12)
  return seededPick(pool, dailySeed, 3)
}

const getKindCounts = () => {
  const counts = { mcq: 0, cloze: 0, parsons: 0, card: 0, game: 0, thought: 0 }
  for (const item of Object.values(getState().items)) {
    if (item.attempts > 0 && counts[item.kind] !== undefined) counts[item.kind] += 1
  }
  return counts
}

const computeBestStreak = () => {
  const daily = getState().daily
  const activeDays = Object.keys(daily).filter(key => isActiveDay(daily[key])).sort()
  let best = 0
  let run = 0
  let prevTime = null
  for (const key of activeDays) {
    const time = new Date(`${key}T00:00:00`).getTime()
    run = prevTime !== null && time - prevTime === 86400000 ? run + 1 : 1
    if (run > best) best = run
    prevTime = time
  }
  return best
}

const computeBadges = () => {
  const totalAnswered = getEvents({ type: 'answer' }).length
  const bestStreak = computeBestStreak()
  const masteredSkill = Object.values(getState().skills).some(record => record.attempts >= 3 && record.mastery >= 0.85)
  return [
    { id: 'first10', icon: '🔰', label: 'First 10 answers', unlocked: totalAnswered >= 10 },
    { id: 'weekstreak', icon: '🔥', label: '7-day streak', unlocked: bestStreak >= 7 },
    { id: 'century', icon: '💯', label: '100 answers', unlocked: totalAnswered >= 100 },
    { id: 'mastery', icon: '🏆', label: 'Mastered a skill', unlocked: masteredSkill },
  ]
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

function buildTitleBlock() {
  return h('div', { class: 'game-title-block' },
    h('h1', { class: 'game-logo' }, h('span', { class: 'game-logo-mark', 'aria-hidden': 'true' }, '🎮'), 'CodeCram'),
    h('p', { class: 'game-tagline' }, 'Your coding interview training arcade'))
}

function buildPlayerCard(user, levelInfo) {
  const initial = user ? userInitial(user) : 'P'
  const pct = Math.max(4, Math.round((levelInfo.progress || 0) * 100))
  return h('div', { class: 'player-card' },
    h('span', { class: 'player-avatar' }, initial),
    h('div', { class: 'player-meta' },
      h('div', { class: 'player-meta-top' },
        h('span', { class: 'player-level-badge' }, `Lv ${levelInfo.level}`),
        h('span', { class: 'player-xp-text' }, `${levelInfo.into} / ${levelInfo.needed} XP`)),
      h('div', { class: 'progress xp-bar' }, h('div', { style: { width: `${pct}%` } }))))
}

function buildPlayButton(bite, newVisitor) {
  if (bite) {
    return h('a', { class: 'btn btn-primary play-btn', href: hrefFor(bite.id) },
      h('span', { class: 'play-btn-icon' }, '▶'),
      h('span', { class: 'play-btn-copy' },
        h('small', null, newVisitor ? 'Press play to start' : 'Continue practicing'),
        h('b', null, `${bite.title} · ${bite.minutes}m`)))
  }
  return h('a', { class: 'btn btn-primary play-btn', href: '#/course' },
    h('span', { class: 'play-btn-icon' }, '🎉'),
    h('span', { class: 'play-btn-copy' }, h('small', null, 'Core course complete'), h('b', null, 'Review the tree')))
}

function buildGameMenu(items) {
  const nav = h('div', { class: 'game-menu', role: 'menu', 'aria-label': 'Game menu' })
  const els = items.map((item, i) => {
    const tileColor = i % 2 === 0 ? 'var(--pink)' : 'var(--teal)'
    const attrs = {
      class: 'game-menu-item',
      role: 'menuitem',
      tabindex: i === 0 ? '0' : '-1',
      style: { '--tile-color': tileColor },
    }
    const inner = [
      h('span', { class: 'game-menu-icon' }, item.icon),
      h('span', { class: 'game-menu-copy' },
        h('span', { class: 'game-menu-title' }, item.title),
        h('span', { class: 'game-menu-sub' }, item.sub)),
      h('span', { class: 'game-menu-chevron', 'aria-hidden': 'true' }, '›'),
    ]
    if (item.href) return h('a', { ...attrs, href: item.href }, ...inner)
    return h('button', { ...attrs, type: 'button', 'aria-expanded': String(Boolean(item.expanded)), onclick: item.onActivate }, ...inner)
  })
  nav.append(...els)
  nav.addEventListener('keydown', event => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const focusable = Array.from(nav.querySelectorAll('.game-menu-item'))
    if (!focusable.length) return
    const current = focusable.indexOf(document.activeElement)
    let next = current
    if (event.key === 'ArrowDown') next = (current + 1 + focusable.length) % focusable.length
    else if (event.key === 'ArrowUp') next = (current - 1 + focusable.length) % focusable.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = focusable.length - 1
    focusable.forEach((el, i) => el.setAttribute('tabindex', i === next ? '0' : '-1'))
    focusable[next]?.focus()
  })
  return nav
}

function dailyQuestionStepper(questionItems, onFinish) {
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
  const showDone = () => {
    stage.replaceChildren(h('div', { class: 'stack center daily-question-done' },
      h('span', { class: 'daily-question-done-icon' }, '✅'),
      h('b', null, 'Daily questions done'),
      h('span', { class: 'small muted' }, 'Nice work, see you tomorrow for a fresh set.'),
      h('div', { class: 'row-wrap daily-question-done-actions' },
        h('a', { class: 'btn btn-sm', href: '#/practice' }, 'Keep practicing →'),
        h('button', { class: 'btn btn-sm btn-ghost', type: 'button', onclick: () => onFinish?.() }, 'Close'))))
  }
  showQuestion(0)
  return stage
}

function buildDailyModal(thoughtItem, stepperNode, onAfterClose) {
  const closeBtn = h('button', { class: 'btn-icon daily-modal-close', type: 'button', 'aria-label': 'Close daily challenge' }, '✕')
  const panel = h('div', { class: 'daily-modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'daily-modal-title' },
    h('div', { class: 'daily-modal-head' },
      h('div', { class: 'stack-sm' },
        h('span', { class: 'section-title' }, 'Daily challenge'),
        h('h2', { id: 'daily-modal-title' }, "Today's 3 questions")),
      closeBtn),
    h('div', { class: 'daily-modal-body stack' },
      thoughtItem
        ? h('a', { class: 'daily-thought-row', href: `#/thought/${encodeURIComponent(thoughtItem.id)}` },
          h('div', { class: 'row-wrap' },
            thoughtItem.lc != null ? h('span', { class: 'mono small muted' }, `#${thoughtItem.lc}`) : null,
            h('span', { class: `pill diff-${String(thoughtItem.difficulty || '').toLowerCase()}` }, thoughtItem.difficulty),
            h('b', null, thoughtItem.title),
            companyChips(thoughtItem.companies, { size: 'xs' })),
          h('span', { class: 'btn btn-sm btn-primary' }, 'Walk through it →'))
        : null,
      stepperNode))

  let lastFocus = null
  const overlay = h('div', { class: 'daily-modal-overlay', hidden: true, onclick: event => { if (event.target === overlay) close() } }, panel)

  const open = () => {
    if (!overlay.hidden) return
    lastFocus = document.activeElement
    overlay.hidden = false
    document.body.classList.add('daily-modal-open')
    requestAnimationFrame(() => {
      panel.querySelector('.item button, .item input, .daily-thought-row, button, a')?.focus()
    })
  }
  const close = () => {
    if (overlay.hidden) return
    overlay.hidden = true
    document.body.classList.remove('daily-modal-open')
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus?.()
    onAfterClose?.()
  }
  closeBtn.addEventListener('click', close)
  const onKeydown = event => {
    if (event.key === 'Escape' && !overlay.hidden) close()
  }
  document.addEventListener('keydown', onKeydown)

  return { overlay, open, close, destroy: () => document.removeEventListener('keydown', onKeydown) }
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

function buildCalendarCard(monthCursor, onPrevMonth, onNextMonth) {
  const daily = getState().daily
  const year = monthCursor.getFullYear()
  const month = monthCursor.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startWeekday = new Date(year, month, 1).getDay()
  const now = new Date()
  const todayKey = dateKey(now)
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()
  const values = []
  for (let d = 1; d <= daysInMonth; d++) values.push(daily[dateKey(new Date(year, month, d))]?.answers || 0)
  const maxVal = Math.max(1, ...values)

  const cells = []
  for (let i = 0; i < startWeekday; i++) cells.push(h('span', { class: 'cal-day is-empty' }))
  for (let d = 1; d <= daysInMonth; d++) {
    const key = dateKey(new Date(year, month, d))
    const value = daily[key]?.answers || 0
    const t = value / maxVal
    const isToday = key === todayKey
    cells.push(h('span', {
      class: `cal-day${isToday ? ' is-today' : ''}`,
      title: `${key}${value ? ` · ${value} answered` : ''}`,
      style: value ? { background: `color-mix(in srgb, var(--coral) ${Math.round(20 + t * 70)}%, var(--surface-3))` } : null,
    }, String(d)))
  }

  return h('div', { class: 'card stack cal-card' },
    h('div', { class: 'cal-head' },
      h('button', { class: 'btn-icon cal-nav-btn', type: 'button', onclick: onPrevMonth, 'aria-label': 'Previous month' }, '‹'),
      h('span', { class: 'cal-month-label' }, monthLabel(monthCursor)),
      h('button', { class: 'btn-icon cal-nav-btn', type: 'button', disabled: isCurrentMonth, onclick: onNextMonth, 'aria-label': 'Next month' }, '›')),
    h('div', { class: 'cal-grid' }, weekdayLabels.map(label => h('span', { class: 'cal-weekday' }, label)), cells))
}

function buildStreakCard() {
  const current = getStreak()
  const best = computeBestStreak()
  return h('div', { class: 'card stack' },
    h('span', { class: 'section-title' }, 'Streak'),
    h('div', { class: 'row-wrap streak-row' },
      h('div', { class: 'stat' }, h('span', { class: 'stat-value' }, `${current}🔥`), h('span', { class: 'stat-label' }, 'current')),
      h('div', { class: 'stat' }, h('span', { class: 'stat-value' }, `${best}🏅`), h('span', { class: 'stat-label' }, 'best'))))
}

function buildHeatmapCard() {
  const days = getDailyRollupsForHeatmap()
  return h('div', { class: 'card stack' },
    h('span', { class: 'section-title' }, 'Last 26 weeks'),
    heatmapCalendar(days, { cell: 8, gap: 2, colorVar: 'var(--coral)', ariaLabel: 'Answers per day over the last 26 weeks' }))
}

function getDailyRollupsForHeatmap() {
  const daily = getState().daily
  const days = []
  const cursor = new Date()
  cursor.setDate(cursor.getDate() - 181)
  for (let i = 0; i < 182; i++) {
    const key = dateKey(cursor)
    const count = daily[key]?.answers || 0
    days.push({ date: key, value: count, label: `${key} · ${count} answered` })
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

function buildGoalRingCard() {
  const todayMinutes = getStudyMinutes({ todayOnly: true })
  const goalPct = Math.min(100, Math.round((todayMinutes / dailyGoalMinutes) * 100))
  return h('div', { class: 'card row goal-ring-card' },
    h('div', { class: 'ring', style: { '--pct': goalPct, '--ring-color': goalPct >= 100 ? 'var(--green)' : 'var(--coral)' } }, h('span', null, `${todayMinutes}m`)),
    h('div', { class: 'stack-sm' }, h('b', null, "Today's goal"), h('span', { class: 'small muted' }, `${dailyGoalMinutes} min target`)))
}

function buildKindStatsCard(kindCounts) {
  const rows = [
    { label: 'Questions', value: kindCounts.mcq + kindCounts.cloze + kindCounts.parsons, icon: '❓' },
    { label: 'Cards', value: kindCounts.card, icon: '🃏' },
    { label: 'Thought walks', value: kindCounts.thought, icon: '🧠' },
    { label: 'Games', value: kindCounts.game, icon: '🎮' },
  ]
  return h('div', { class: 'card stack' },
    h('span', { class: 'section-title' }, 'Solved by kind'),
    h('div', { class: 'kind-stats-row' }, rows.map(row => h('div', { class: 'row' },
      h('span', { class: 'kind-stat-icon' }, row.icon),
      h('div', { class: 'stack-sm' }, h('b', null, String(row.value)), h('span', { class: 'small muted' }, row.label))))))
}

function buildBadgesCard(badges) {
  return h('div', { class: 'card stack' },
    h('span', { class: 'section-title' }, 'Badges'),
    h('div', { class: 'badge-row' }, badges.map(badge => h('div', { class: `badge${badge.unlocked ? ' unlocked' : ' locked'}`, title: badge.label },
      h('span', { class: 'badge-icon' }, badge.unlocked ? badge.icon : '🔒'),
      h('span', { class: 'badge-label' }, badge.label)))))
}

export default async function render(container) {
  const page = h('div', { class: 'page home-page' })
  container.appendChild(page)

  const thoughtItem = await loadTodaysThought()
  const interviewEl = buildInterviewControl()
  const dailyQuestionItems = getDailyQuestionItems()
  const dailyStepperNode = dailyQuestionItems.length
    ? dailyQuestionStepper(dailyQuestionItems, () => dailyModal.close())
    : h('p', { class: 'muted small' }, 'No drill questions available yet.')

  let dailyModalOpen = false
  let monthCursor = startOfMonth(new Date())

  const dailyModal = buildDailyModal(thoughtItem, dailyStepperNode, () => { dailyModalOpen = false; draw() })
  container.appendChild(dailyModal.overlay)

  const openDailyModal = () => { dailyModalOpen = true; dailyModal.open(); draw() }
  const prevMonth = () => { monthCursor = new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1); draw() }
  const nextMonth = () => {
    const now = new Date()
    if (monthCursor.getFullYear() === now.getFullYear() && monthCursor.getMonth() === now.getMonth()) return
    monthCursor = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1)
    draw()
  }

  const draw = () => {
    const newVisitor = isNewVisitor()
    const user = getUser()
    const levelInfo = getLevelInfo()
    const bite = nextIncompleteBite()
    const kindCounts = getKindCounts()
    const badges = computeBadges()

    const dailySub = `${getStreak()}🔥 streak · ${dailyQuestionItems.length} quick qs`
    const thoughtSub = thoughtItem ? `${thoughtItem.difficulty} · ${thoughtItem.title}` : 'Fresh pick tomorrow'
    const courseSub = `${Math.round(getNodeProgress(course.id) * 100)}% through the course`
    const dueCount = dueItems().length
    const practiceSub = dueCount ? `${dueCount} due for review` : 'Nothing due yet'
    const gamesPlayed = kindCounts.game || 0
    const arcadeSub = gamesPlayed ? `${gamesPlayed} games played` : 'Mini-games & boss fights'

    const menuItems = [
      { id: 'daily', icon: '📅', title: 'Daily challenge', sub: dailySub, expanded: dailyModalOpen, onActivate: openDailyModal },
      { id: 'thought', icon: '🧠', title: 'Thought Processes', sub: thoughtSub, href: '#/thought' },
      { id: 'course', icon: '📘', title: 'Course', sub: courseSub, href: '#/course' },
      { id: 'practice', icon: '🎯', title: 'Practice', sub: practiceSub, href: '#/practice' },
      { id: 'arcade', icon: '🕹️', title: 'Arcade', sub: arcadeSub, href: '#/games' },
    ]

    const main = h('div', { class: 'home-main' },
      buildTitleBlock(),
      buildPlayerCard(user, levelInfo),
      h('div', { class: 'play-stack' },
        buildPlayButton(bite, newVisitor),
        h('div', { class: 'row-wrap play-sub-row' }, interviewEl)),
      buildGameMenu(menuItems),
      buildNextUpSection())

    const sidebar = h('div', { class: 'home-sidebar' },
      buildCalendarCard(monthCursor, prevMonth, nextMonth),
      buildStreakCard(),
      buildHeatmapCard(),
      buildGoalRingCard(),
      buildKindStatsCard(kindCounts),
      buildBadgesCard(badges))

    page.replaceChildren(h('div', { class: 'home-grid' }, main, sidebar))
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
    dailyModal.destroy()
  }
}
