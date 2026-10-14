import { h } from './h.js'
import { subscribe, getLevelInfo, getStreak, dueItems, getStudyMinutes, getSetting, setSetting } from '../store.js'
import { onNavigate, navigate } from '../router.js'

const iconPaths = {
  dashboard: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9v11h5v-6h4v6h5V9"/>',
  course: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20"/><path d="M8 8h8M8 11.5h8"/>',
  practice: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  algorithms: '<circle cx="12" cy="4.5" r="2.3"/><circle cx="5" cy="13" r="2.3"/><circle cx="19" cy="13" r="2.3"/><circle cx="12" cy="20.5" r="2.3"/><path d="M12 6.8L6 11M12 6.8l6 4.2M6.6 14.6L11 18.8M17.4 14.6L13 18.8"/>',
  learn: '<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',
  problems: '<path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/>',
  games: '<rect x="2" y="7" width="20" height="11" rx="4"/><path d="M7 11v3M5.5 12.5h3"/><circle cx="15.5" cy="11.5" r=".8"/><circle cx="17.5" cy="13.5" r=".8"/>',
  mock: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/>',
  stats: '<path d="M4 20V10M12 20V4M20 20v-7"/><path d="M2 20h20"/>',
  glossary: '<path d="M4 4h10a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z"/><path d="M8 9h6M8 13h4"/>',
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
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  collapse: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M9 4v16"/>',
  more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
  enter: '<path d="M20 5v7a3 3 0 0 1-3 3H5"/><path d="m9 11-4 4 4 4"/>',
}

export const icon = (name, size = 20) => {
  const span = h('span', { class: 'icon', 'aria-hidden': 'true' })
  span.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${iconPaths[name] || ''}</svg>`
  return span
}

export const navGroups = [
  {
    id: 'study',
    label: 'Study',
    items: [
      { id: 'dashboard', label: 'Home', href: '#/', key: 'h' },
      { id: 'thought', label: 'Thought Processes', short: 'Think', href: '#/thought', key: 't' },
      { id: 'course', label: 'Course', href: '#/course', key: 'c' },
      { id: 'practice', label: 'Practice', href: '#/practice', key: 'r' },
      { id: 'games', label: 'Games', href: '#/games', key: 'g' },
    ],
  },
  {
    id: 'reference',
    label: 'Reference',
    items: [
      { id: 'learn', label: 'Learn', href: '#/learn', key: 'l' },
      { id: 'cheatsheet', label: 'Cheat sheet', href: '#/cheatsheet', key: 'q' },
      { id: 'handbook', label: 'Handbook', href: '#/handbook', key: 'k' },
    ],
  },
  {
    id: 'track',
    label: 'Track',
    items: [
      { id: 'stats', label: 'Stats', href: '#/stats', key: 's' },
    ],
  },
]

export const navItems = navGroups.flatMap(group => group.items)

const bottomNavIds = ['dashboard', 'thought', 'practice', 'games']

const sectionFor = path => {
  const first = path.split('/')[1] || ''
  if (['trace', 'algorithms', 'problems', 'read'].includes(first)) return 'learn'
  if (first === 'glossary') return 'cheatsheet'
  if (['dayof', 'plan'].includes(first)) return 'handbook'
  if (first === 'bite') return 'course'
  if (['drill', 'flashcards', 'mock'].includes(first)) return 'practice'
  return navItems.find(item => item.href === `#/${first}`)?.id || 'dashboard'
}

const readPref = (key, fallback) => {
  try { return localStorage.getItem(key) ?? fallback } catch { return fallback }
}

const writePref = (key, value) => {
  try { localStorage.setItem(key, value) } catch {}
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || '')

const cheatSheetEntries = [
  { title: 'Constraints to complexity', sub: 'n size to target Big-O' },
  { title: 'Big-O ladder', sub: 'Growth rates side by side' },
  { title: 'Python operation costs', sub: 'list, dict, set, heapq, deque' },
  { title: 'Algorithm complexities', sub: 'Time and space per algorithm' },
  { title: 'Space complexity', sub: 'Recursion, memo, buffers' },
  { title: 'Signal words', sub: 'Phrases that point to a pattern' },
]

const searchKinds = {
  page: { label: 'Go to', tone: 'teal' },
  thought: { label: 'Thought', tone: 'amber' },
  problem: { label: 'Problem', tone: 'sky' },
  algorithm: { label: 'Algorithm', tone: 'green' },
  glossary: { label: 'Glossary', tone: 'pink' },
  handbook: { label: 'Handbook', tone: 'teal' },
  cheatsheet: { label: 'Cheat sheet', tone: 'amber' },
}

const loadSafely = async loader => {
  try { return await loader() } catch (error) {
    console.error('search source failed', error)
    return []
  }
}

let searchIndexPromise = null

const buildSearchIndex = () => {
  if (searchIndexPromise) return searchIndexPromise
  const pageEntries = navItems.map(item => ({ kind: 'page', title: item.label, sub: 'Section', href: item.href }))
  const cheatEntries = cheatSheetEntries.map(entry => ({ kind: 'cheatsheet', title: entry.title, sub: entry.sub, href: '#/cheatsheet' }))
  searchIndexPromise = Promise.all([
    loadSafely(async () => {
      const { problems } = await import('../content/index.js')
      return problems.map(problem => ({
        kind: 'problem',
        title: problem.title,
        sub: [problem.lc ? `LC ${problem.lc}` : null, problem.difficulty, problem.pattern].filter(Boolean).join(' · '),
        lc: problem.lc,
        href: `#/problems/${encodeURIComponent(problem.id)}`,
      }))
    }),
    loadSafely(async () => {
      const { loadThought } = await import('../content/thought/index.js')
      const { items } = await loadThought()
      return items.map(item => ({
        kind: 'thought',
        title: item.title,
        sub: [item.lc ? `LC ${item.lc}` : null, item.difficulty, item.method?.answer].filter(Boolean).join(' · '),
        lc: item.lc,
        href: `#/thought/${encodeURIComponent(item.id)}`,
      }))
    }),
    loadSafely(async () => {
      const algorithmsModule = (await import('../content/algorithms.js')).default
      return (algorithmsModule.algorithms || []).map(algorithm => ({
        kind: 'algorithm',
        title: algorithm.title,
        sub: algorithm.oneLiner || algorithm.time || '',
        href: `#/algorithms/${encodeURIComponent(algorithm.id)}`,
      }))
    }),
    loadSafely(async () => {
      const { glossaryTerms, termId } = await import('../content/glossary.js')
      return glossaryTerms.map(entry => ({
        kind: 'glossary',
        title: entry.term,
        sub: entry.def || entry.definition || '',
        aliases: entry.aliases || [],
        href: `#/glossary/${encodeURIComponent(termId(entry.term))}`,
      }))
    }),
    loadSafely(async () => {
      const { chapters } = await import('../content/handbook.js')
      return chapters.map(chapter => ({ kind: 'handbook', title: chapter.title, sub: 'Handbook chapter', href: `#/handbook/${encodeURIComponent(chapter.id)}` }))
    }),
  ]).then(groups => {
    const entries = [...pageEntries, ...groups.flat(), ...cheatEntries]
    for (const entry of entries) entry.haystack = [entry.title, entry.sub, ...(entry.aliases || [])].join(' ').toLowerCase()
    return entries
  })
  return searchIndexPromise
}

const kindWeight = { page: 6, thought: 4, problem: 4, algorithm: 3, glossary: 2, handbook: 2, cheatsheet: 2 }

const scoreEntry = (entry, query, tokens, lcQuery) => {
  if (lcQuery && entry.lc === lcQuery) return 1000 + kindWeight[entry.kind]
  const title = entry.title.toLowerCase()
  if (!tokens.every(token => entry.haystack.includes(token))) return 0
  let score = kindWeight[entry.kind] || 1
  if (title === query) score += 200
  else if (title.startsWith(query)) score += 120
  else if (title.includes(query)) score += 70
  for (const token of tokens) if (title.split(/[^a-z0-9]+/).some(word => word.startsWith(token))) score += 15
  return score - title.length * 0.05
}

const searchEntries = (entries, rawQuery) => {
  const query = rawQuery.trim().toLowerCase()
  if (!query) return entries.filter(entry => entry.kind === 'page')
  const tokens = query.split(/\s+/).filter(Boolean)
  const lcMatch = query.match(/^(?:lc\s*)?#?(\d{1,4})$/)
  const lcQuery = lcMatch ? Number(lcMatch[1]) : null
  return entries
    .map(entry => ({ entry, score: scoreEntry(entry, query, tokens, lcQuery) }))
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 40)
    .map(result => result.entry)
}

function createSearchPalette() {
  let entries = null
  let results = []
  let activeIndex = 0
  let lastFocus = null

  const input = h('input', {
    class: 'cmdk-input',
    type: 'search',
    placeholder: 'Search problems, patterns, terms…',
    'aria-label': 'Search',
    autocomplete: 'off',
    spellcheck: 'false',
  })
  const list = h('div', { class: 'cmdk-list', role: 'listbox' })
  const status = h('div', { class: 'cmdk-status small muted' })
  const panel = h('div', { class: 'cmdk-panel', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Search' },
    h('div', { class: 'cmdk-head' }, icon('search', 18), input, h('span', { class: 'kbd' }, 'esc')),
    list,
    h('div', { class: 'cmdk-foot small' },
      status,
      h('span', { class: 'row cmdk-hints' }, h('span', { class: 'kbd' }, '↑'), h('span', { class: 'kbd' }, '↓'), h('span', { class: 'kbd' }, '↵'))))
  const overlay = h('div', { class: 'cmdk-overlay', hidden: true, onclick: event => { if (event.target === overlay) close() } }, panel)

  const go = entry => {
    if (!entry) return
    close()
    navigate(entry.href)
  }

  const renderList = () => {
    if (!entries) {
      list.replaceChildren(...[0, 1, 2, 3, 4].map(() => h('div', { class: 'cmdk-row' }, h('div', { class: 'skeleton skeleton-line', style: { width: '60%' } }))))
      status.textContent = 'Loading…'
      return
    }
    results = searchEntries(entries, input.value)
    if (activeIndex >= results.length) activeIndex = Math.max(0, results.length - 1)
    status.textContent = input.value.trim() ? `${results.length} result${results.length === 1 ? '' : 's'}` : 'Jump to a section or type to search'
    if (!results.length) {
      list.replaceChildren(h('div', { class: 'cmdk-empty muted' }, 'No matches. Try a pattern, a problem name, or an LC number.'))
      return
    }
    list.replaceChildren(...results.map((entry, index) => {
      const kind = searchKinds[entry.kind]
      return h('a', {
        class: `cmdk-row${index === activeIndex ? ' active' : ''}`,
        href: entry.href,
        role: 'option',
        'aria-selected': String(index === activeIndex),
        onmousemove: () => {
          if (activeIndex === index) return
          activeIndex = index
          syncActive()
        },
        onclick: event => {
          event.preventDefault()
          go(entry)
        },
      },
      h('span', { class: `pill pill-${kind.tone} cmdk-kind` }, kind.label),
      h('span', { class: 'cmdk-text' },
        h('span', { class: 'cmdk-title' }, entry.title),
        entry.sub ? h('span', { class: 'cmdk-sub' }, entry.sub) : null),
      h('span', { class: 'cmdk-enter' }, icon('enter', 15)))
    }))
  }

  const syncActive = () => {
    const rows = list.querySelectorAll('.cmdk-row')
    rows.forEach((row, index) => {
      row.classList.toggle('active', index === activeIndex)
      row.setAttribute('aria-selected', String(index === activeIndex))
    })
    rows[activeIndex]?.scrollIntoView({ block: 'nearest' })
  }

  input.addEventListener('input', () => {
    activeIndex = 0
    renderList()
  })

  input.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (results.length) activeIndex = (activeIndex + 1) % results.length
      syncActive()
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (results.length) activeIndex = (activeIndex - 1 + results.length) % results.length
      syncActive()
    } else if (event.key === 'Enter') {
      event.preventDefault()
      go(results[activeIndex])
    } else if (event.key === 'Escape') {
      event.preventDefault()
      close()
    }
  })

  const open = () => {
    if (!overlay.hidden) {
      input.select()
      return
    }
    lastFocus = document.activeElement
    overlay.hidden = false
    document.body.classList.add('cmdk-open')
    input.value = ''
    activeIndex = 0
    renderList()
    requestAnimationFrame(() => input.focus())
    if (!entries) buildSearchIndex().then(loaded => {
      entries = loaded
      if (!overlay.hidden) renderList()
    })
  }

  const close = () => {
    if (overlay.hidden) return
    overlay.hidden = true
    document.body.classList.remove('cmdk-open')
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus?.()
  }

  return { overlay, open, close, isOpen: () => !overlay.hidden }
}

export function mountShell(root) {
  const navLinkFor = item => h('a', {
    class: `nav-link${item.amber ? ' nav-link-amber' : ''}`,
    href: item.href,
    title: `${item.label}  (g ${item.key})`,
    'data-id': item.id,
  }, icon(item.id), h('span', { class: 'nav-label' }, item.label))

  const navLinks = []
  const navSections = navGroups.map(group => {
    const links = group.items.map(navLinkFor)
    navLinks.push(...links)
    return h('div', { class: 'nav-group' },
      h('div', { class: 'nav-group-label' }, group.label),
      h('div', { class: 'nav-links' }, links))
  })

  const palette = createSearchPalette()

  const shortcutLabel = isMac ? '⌘K' : 'Ctrl K'
  const searchButton = h('button', { class: 'search-trigger', type: 'button', onclick: () => palette.open(), 'aria-label': 'Search' },
    icon('search', 16), h('span', { class: 'search-trigger-text' }, 'Search'), h('span', { class: 'kbd search-trigger-kbd' }, shortcutLabel))

  const levelLabel = h('span', { class: 'top-level' })
  const xpFill = h('div', { class: 'xp-fill' })
  const xpText = h('span', { class: 'xp-text' })
  const streakValue = h('b')
  const dueValue = h('b')
  const minutesValue = h('b')
  const themeButton = h('button', { class: 'btn-icon', type: 'button', title: 'Toggle theme', 'aria-label': 'Toggle theme', onclick: () => {
    setSetting('theme', getSetting('theme', 'dark') === 'dark' ? 'light' : 'dark')
    renderStats()
  } })

  const dueLink = h('a', { class: 'stat-pill due', href: '#/drill?due=1', title: 'Due reviews' }, icon('layers', 16), dueValue, h('span', { class: 'stat-label' }, 'due'))
  const accountSlot = h('div', { class: 'account-slot' })

  const shellEl = h('div', { class: 'app-shell' })

  const setDrawer = isOpen => {
    shellEl.classList.toggle('drawer-open', isOpen)
    document.body.classList.toggle('drawer-lock', isOpen)
  }

  const menuButton = h('button', { class: 'btn-icon menu-button', type: 'button', 'aria-label': 'Open menu', onclick: () => setDrawer(!shellEl.classList.contains('drawer-open')) }, icon('menu', 18))

  const topbar = h('header', { class: 'topbar' },
    menuButton,
    h('a', { class: 'brand brand-compact', href: '#/', 'aria-label': 'CodeCram home' }, h('span', { class: 'brand-mark' }, '</>')),
    searchButton,
    h('div', { class: 'xp-wrap', title: 'Level progress' },
      levelLabel,
      h('div', { class: 'xp-bar' }, xpFill),
      xpText),
    h('div', { class: 'top-stats' },
      h('span', { class: 'stat-pill streak', title: 'Day streak' }, icon('flame', 16), streakValue, h('span', { class: 'stat-label' }, 'day')),
      dueLink,
      h('span', { class: 'stat-pill minutes', title: 'Minutes studied today' }, icon('clock', 16), minutesValue, h('span', { class: 'stat-label' }, 'min')),
      themeButton,
      accountSlot))

  const view = h('main', { class: 'view', id: 'view' })

  const syncCollapseLabel = () => {
    const label = shellEl.classList.contains('rail-collapsed') ? 'Expand sidebar' : 'Collapse sidebar'
    collapseButton.title = label
    collapseButton.setAttribute('aria-label', label)
  }

  const collapseButton = h('button', {
    class: 'btn-icon rail-collapse',
    type: 'button',
    title: 'Collapse sidebar',
    'aria-label': 'Collapse sidebar',
    onclick: () => {
      const collapsed = !shellEl.classList.contains('rail-collapsed')
      shellEl.classList.toggle('rail-collapsed', collapsed)
      writePref('codecram-rail', collapsed ? 'collapsed' : 'open')
      syncCollapseLabel()
    },
  }, icon('collapse', 18))

  const rail = h('nav', { class: 'rail', 'aria-label': 'Main' },
    h('div', { class: 'rail-head' },
      h('a', { class: 'brand', href: '#/', title: 'CodeCram' },
        h('span', { class: 'brand-mark' }, '</>'),
        h('span', { class: 'brand-text' }, 'Code', h('b', null, 'Cram'))),
      h('button', { class: 'btn-icon drawer-close', type: 'button', 'aria-label': 'Close menu', onclick: () => setDrawer(false) }, icon('close', 18))),
    h('div', { class: 'rail-scroll' }, navSections),
    h('div', { class: 'rail-foot' },
      h('span', { class: 'rail-tagline small faint' }, 'Free coding interview prep'),
      collapseButton))

  const bottomLinks = bottomNavIds.map(id => {
    const item = navItems.find(entry => entry.id === id)
    return h('a', { class: 'bottom-link', href: item.href, 'data-id': item.id }, icon(item.id, 20), h('span', null, item.short || item.label))
  })
  const moreButton = h('button', { class: 'bottom-link', type: 'button', onclick: () => setDrawer(true) }, icon('more', 20), h('span', null, 'More'))
  const bottomNav = h('nav', { class: 'bottom-nav', 'aria-label': 'Quick' }, bottomLinks, moreButton)

  const scrim = h('div', { class: 'drawer-scrim', onclick: () => setDrawer(false) })

  if (readPref('codecram-rail', 'open') === 'collapsed') shellEl.classList.add('rail-collapsed')
  syncCollapseLabel()
  shellEl.append(rail, scrim, h('div', { class: 'main-col' }, topbar, view), bottomNav)
  root.replaceChildren(shellEl, palette.overlay)

  import('./account.js')
    .then(mod => {
      const button = mod.accountButton?.()
      if (button) accountSlot.replaceChildren(button)
    })
    .catch(() => {})

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
    for (const link of [...navLinks, ...bottomLinks]) link.classList.toggle('active', link.dataset.id === active)
    moreButton.classList.toggle('active', !bottomNavIds.includes(active))
    setDrawer(false)
    palette.close()
  })

  let pendingG = 0
  window.addEventListener('keydown', event => {
    const target = event.target
    const typing = target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
    if ((event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === 'k') {
      event.preventDefault()
      if (palette.isOpen()) palette.close()
      else palette.open()
      return
    }
    if (event.key === 'Escape' && shellEl.classList.contains('drawer-open')) {
      setDrawer(false)
      return
    }
    if (event.metaKey || event.ctrlKey || event.altKey || typing || palette.isOpen()) return
    if (event.key === '/') {
      event.preventDefault()
      palette.open()
      return
    }
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
