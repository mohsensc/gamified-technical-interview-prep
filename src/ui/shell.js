import { h } from './h.js'
import { subscribe, getLevelInfo, getStreak, dueItems, getStudyMinutes, getSetting, setSetting } from '../store.js'
import { onNavigate, navigate } from '../router.js'

const iconPaths = {
  dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  course: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20"/><path d="M8 8h8M8 11.5h8"/>',
  practice: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  algorithms: '<circle cx="12" cy="4.5" r="2.3"/><circle cx="5" cy="13" r="2.3"/><circle cx="19" cy="13" r="2.3"/><circle cx="12" cy="20.5" r="2.3"/><path d="M12 6.8L6 11M12 6.8l6 4.2M6.6 14.6L11 18.8M17.4 14.6L13 18.8"/>',
  learn: '<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',
  problems: '<path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/>',
  games: '<rect x="2" y="7" width="20" height="11" rx="4"/><path d="M7 11v3M5.5 12.5h3"/><circle cx="15.5" cy="11.5" r=".8"/><circle cx="17.5" cy="13.5" r=".8"/>',
  mock: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/>',
  stats: '<path d="M4 20V10M12 20V4M20 20v-7"/><path d="M2 20h20"/>',
  glossary: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/>',
  handbook: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  flame: '<path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-6 1-9.5z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  layers: '<path d="M12 2l10 5-10 5L2 7z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>',
  read: '<path d="M4 4h12l4 4v13H4z"/><path d="M8 9h8M8 13h8M8 17h5"/>',
  cheatsheet: '<rect x="3" y="3" width="18" height="18" rx="2.5"/><path d="M8 8h3M8 12h8M8 16h8M14 8h2"/>',
  dayof: '<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>',
  thought: '<path d="M9 18h6"/><path d="M10 21.5h4"/><path d="M12 2.5a6.5 6.5 0 0 0-3.6 11.9c.6.4 1.1 1.2 1.1 2.1h5a2.6 2.6 0 0 1 1.1-2.1A6.5 6.5 0 0 0 12 2.5z"/>',
}

export const icon = (name, size = 20) => {
  const span = h('span', { class: 'icon', 'aria-hidden': 'true' })
  span.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${iconPaths[name] || ''}</svg>`
  return span
}

export const navItems = [
  { id: 'dayof', label: 'DAYOF', href: '#/dayof', key: 'z', amber: true },
  { id: 'thought', label: 'Thought Processes', href: '#/thought', key: 't' },
  { id: 'dashboard', label: 'Home', href: '#/', key: 'h' },
  { id: 'course', label: 'Course', href: '#/course', key: 'c' },
  { id: 'practice', label: 'Practice', href: '#/practice', key: 'r' },
  { id: 'algorithms', label: 'Algorithms', href: '#/algorithms', key: 'a' },
  { id: 'learn', label: 'Learn', href: '#/learn', key: 'l' },
  { id: 'problems', label: 'Problems', href: '#/problems', key: 'b' },
  { id: 'read', label: 'Read', href: '#/read', key: 'd' },
  { id: 'games', label: 'Games', href: '#/games', key: 'g' },
  { id: 'mock', label: 'Mock', href: '#/mock', key: 'm' },
  { id: 'stats', label: 'Stats', href: '#/stats', key: 's' },
  { id: 'glossary', label: 'Glossary', href: '#/glossary', key: 'y' },
  { id: 'handbook', label: 'Handbook', href: '#/handbook', key: 'k' },
  { id: 'cheatsheet', label: 'Cheat sheet', href: '#/cheatsheet', key: 'q' },
]

const sectionFor = path => {
  const first = path.split('/')[1] || ''
  if (first === 'trace') return 'learn'
  if (first === 'bite') return 'course'
  if (first === 'drill' || first === 'flashcards') return 'practice'
  return navItems.find(item => item.href === `#/${first}`)?.id || 'dashboard'
}

export function mountShell(root) {
  const navLinks = navItems.map(item => h('a', { class: `nav-link${item.amber ? ' nav-link-amber' : ''}`, href: item.href, title: `${item.label}  (g ${item.key})`, 'data-id': item.id },
    icon(item.id), h('span', { class: 'nav-label' }, item.label)))

  const levelLabel = h('span', { class: 'top-level' })
  const xpFill = h('div', { class: 'xp-fill' })
  const xpText = h('span', { class: 'xp-text' })
  const streakValue = h('b')
  const dueValue = h('b')
  const minutesValue = h('b')
  const themeButton = h('button', { class: 'btn-icon', title: 'Toggle theme', onclick: () => {
    setSetting('theme', getSetting('theme', 'dark') === 'dark' ? 'light' : 'dark')
    renderStats()
  } })

  const dueLink = h('a', { class: 'stat-pill due', href: '#/drill?due=1', title: 'Due reviews' }, icon('layers', 16), dueValue, h('span', { class: 'stat-label' }, 'due'))

  const topbar = h('header', { class: 'topbar' },
    h('div', { class: 'xp-wrap', title: 'Level progress' },
      levelLabel,
      h('div', { class: 'xp-bar' }, xpFill),
      xpText),
    h('div', { class: 'top-stats' },
      h('span', { class: 'stat-pill streak', title: 'Day streak' }, icon('flame', 16), streakValue, h('span', { class: 'stat-label' }, 'day')),
      dueLink,
      h('span', { class: 'stat-pill', title: 'Minutes studied today' }, icon('clock', 16), minutesValue, h('span', { class: 'stat-label' }, 'min')),
      themeButton))

  const view = h('main', { class: 'view', id: 'view' })

  const shell = h('div', { class: 'app-shell' },
    h('nav', { class: 'rail' },
      h('a', { class: 'brand', href: '#/', title: 'Google Cram' }, h('span', { class: 'brand-mark' }, 'G'), h('span', { class: 'brand-text' }, 'Cram')),
      h('div', { class: 'nav-links' }, navLinks)),
    h('div', { class: 'main-col' }, topbar, view))

  root.replaceChildren(shell)

  function renderStats() {
    const info = getLevelInfo()
    levelLabel.textContent = `Lv ${info.level}`
    xpFill.style.width = `${Math.round(info.progress * 100)}%`
    xpText.textContent = `${info.into}/${info.needed} XP`
    streakValue.textContent = String(getStreak())
    const dueCount = dueItems().length
    dueValue.textContent = String(dueCount)
    dueLink.classList.toggle('hot', dueCount > 0)
    minutesValue.textContent = String(getStudyMinutes({ todayOnly: true }))
    const dark = getSetting('theme', 'dark') === 'dark'
    themeButton.replaceChildren(icon(dark ? 'sun' : 'moon', 18))
  }

  renderStats()
  subscribe(renderStats)
  setInterval(renderStats, 30e3)

  onNavigate(path => {
    const active = sectionFor(path)
    for (const link of navLinks) link.classList.toggle('active', link.dataset.id === active)
  })

  let pendingG = 0
  window.addEventListener('keydown', event => {
    const target = event.target
    if (event.metaKey || event.ctrlKey || event.altKey) return
    if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return
    const now = Date.now()
    if (event.key === 'g' && now - pendingG > 900) {
      pendingG = now
      return
    }
    if (now - pendingG < 900) {
      pendingG = 0
      const item = navItems.find(entry => entry.key === event.key)
      if (item) {
        event.preventDefault()
        navigate(item.href)
      }
    }
  })

  return view
}
