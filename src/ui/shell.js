import { h } from './h.js'
import { logoGlyph } from './logo.js'
import { getSetting, setSetting } from '../store.js'
import { onNavigate, navigate } from '../router.js'
import { icon } from './icons.js'

export { icon } from './icons.js'

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
      h('span', { class: 'row cmdk-hints' }, h('span', { class: 'kbd' }, icon('arrowUp', 12)), h('span', { class: 'kbd' }, icon('arrowDown', 12)), h('span', { class: 'kbd' }, icon('enter', 12)))))
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

  const themeButton = h('button', { class: 'btn-icon', type: 'button', title: 'Toggle theme', 'aria-label': 'Toggle theme', onclick: () => {
    setSetting('theme', getSetting('theme', 'light') === 'dark' ? 'light' : 'dark')
    renderStats()
  } })

  const accountSlot = h('div', { class: 'account-slot' })

  const shellEl = h('div', { class: 'app-shell' })

  const drawerQuery = window.matchMedia('(max-width: 760px)')

  const syncDrawerAccess = () => {
    const isOpen = shellEl.classList.contains('drawer-open')
    rail.inert = drawerQuery.matches && !isOpen
    menuButton.setAttribute('aria-expanded', String(isOpen))
  }

  const setDrawer = isOpen => {
    shellEl.classList.toggle('drawer-open', isOpen)
    document.body.classList.toggle('drawer-lock', isOpen)
    syncDrawerAccess()
  }

  const menuButton = h('button', { class: 'btn-icon menu-button', type: 'button', 'aria-label': 'Open menu', onclick: () => setDrawer(!shellEl.classList.contains('drawer-open')) }, icon('menu', 18))

  const topbar = h('header', { class: 'topbar' },
    menuButton,
    h('a', { class: 'brand brand-compact', href: '#/', 'aria-label': 'TechPrep home' }, h('span', { class: 'brand-mark' }, logoGlyph())),
    searchButton,
    h('div', { class: 'grow' }),
    themeButton,
    accountSlot)

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
      writePref('techprep-rail', collapsed ? 'collapsed' : 'open')
      syncCollapseLabel()
    },
  }, icon('collapse', 18))

  const rail = h('nav', { class: 'rail', 'aria-label': 'Main' },
    h('div', { class: 'rail-head' },
      h('a', { class: 'brand', href: '#/', title: 'TechPrep' },
        h('span', { class: 'brand-mark' }, logoGlyph()),
        h('span', { class: 'brand-text' }, 'Tech', h('b', null, 'Prep'))),
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

  if (readPref('techprep-rail', 'open') === 'collapsed') shellEl.classList.add('rail-collapsed')
  syncCollapseLabel()
  shellEl.append(rail, scrim, h('div', { class: 'main-col' }, topbar, view), bottomNav)
  syncDrawerAccess()
  drawerQuery.addEventListener('change', syncDrawerAccess)
  root.replaceChildren(shellEl, palette.overlay)

  import('./account.js')
    .then(mod => {
      const button = mod.accountButton?.()
      if (button) accountSlot.replaceChildren(button)
    })
    .catch(() => {})

  function renderStats() {
    const dark = getSetting('theme', 'light') === 'dark'
    themeButton.replaceChildren(icon(dark ? 'sun' : 'moon', 18))
  }

  renderStats()

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
