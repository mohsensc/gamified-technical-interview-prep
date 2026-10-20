import { h, clear, toast } from '../ui/h.js'
import { icon } from '../ui/icons.js'
import { renderMcq } from '../ui/items.js'
import { codeBlock } from '../ui/code.js'
import { companyMark } from '../ui/companies.js'
import { companyById } from '../content/companies.js'
import { cheatSheets, cheatSheetsByGroup } from '../content/cheatsheets.js'
import { recordAnswer, getSetting, setSetting } from '../store.js'
import { subnav } from '../ui/subnav.js'

const sheetSkills = {
  constraints: ['constraints', 'complexity'],
  algos: ['complexity'],
  signals: ['ds-diagnosis'],
  'python-ops': ['complexity'],
  'two-pointers-windows': ['two-pointers', 'sliding-window'],
  'binary-search': ['binary-search'],
  'prefix-monostack': ['prefix-sum', 'monotonic-stack'],
  'graph-traversal': ['graph-bfs', 'topo-sort', 'dijkstra'],
  'unionfind-mst': ['union-find', 'mst'],
  'backtracking-dp': ['backtracking', 'dp-1d', 'dp-2d'],
  'intervals-heap': ['intervals', 'heap'],
  'trie-bits': ['trie', 'bit'],
  'core-templates': ['tree-dfs', 'tree-bfs', 'linked-list', 'dp-1d'],
  'interview-communication': ['communication'],
  'edge-cases-companies': ['communication'],
}

const sup = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }

function formatOps(value) {
  if (!isFinite(value) || value > 1e30) return 'off the charts'
  if (value < 1000) return `${Math.max(1, Math.round(value))}`
  const exponent = Math.floor(Math.log10(value))
  const mantissa = value / 10 ** exponent
  const exponentText = String(exponent).split('').map(digit => sup[digit]).join('')
  const lead = mantissa >= 1.05 ? `${Math.round(mantissa * 10) / 10}·` : ''
  return `${lead}10${exponentText}`
}

function barWidth(ops) {
  if (!isFinite(ops)) return 100
  const log = Math.max(0, Math.log10(Math.max(1, ops)))
  return Math.max(2, Math.min(100, (log / 18) * 100))
}

function barTone(ops) {
  if (!isFinite(ops) || ops > 1e9) return 'red'
  if (ops > 1e7) return 'amber'
  return 'teal'
}

function copyText(text) {
  const run = async () => {
    try {
      await navigator.clipboard.writeText(text)
      toast('Copied', 'good')
    } catch {
      toast('Copy failed', 'bad')
    }
  }
  run()
}

function searchKey(parts) {
  return parts.filter(part => part !== undefined && part !== null).join(' ').toLowerCase()
}

function shuffleArray(list) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function rowEl(tone, key, ...rest) {
  const isAttrsObj = value => value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Node)
  const extra = isAttrsObj(rest[0]) ? rest.shift() : null
  const extraClass = extra?.class ? ` ${extra.class}` : ''
  const style = extra?.style || null
  return h('div', {
    class: `cheat-row${tone ? ` tone-${tone}` : ''}${extraClass}`,
    'data-k': key,
    style,
    tabindex: '0',
    onclick: () => copyText(key),
    onkeydown: event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); copyText(key) } },
  }, rest)
}

function silentRow(key, ...rest) {
  const isAttrsObj = value => value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Node)
  const extra = isAttrsObj(rest[0]) ? rest.shift() : null
  const extraClass = extra?.class ? ` ${extra.class}` : ''
  return h('div', { class: `cheat-row${extraClass}`, 'data-k': key }, rest)
}

function getCollapsedState() {
  try { return getSetting('cheatCollapsed', {}) || {} } catch { return {} }
}

function persistCollapsed(id, isOpen) {
  try { setSetting('cheatCollapsed', { ...getCollapsedState(), [id]: isOpen }) } catch {}
}

function colsTemplate(n) {
  if (n <= 2) return 'minmax(0, 1.5fr) minmax(0, 1fr)'
  if (n === 3) return 'minmax(0, 1.6fr) minmax(0, 0.8fr) minmax(0, 1.4fr)'
  return 'minmax(0, 1.5fr) minmax(0, 0.8fr) minmax(0, 0.8fr) minmax(0, 1.7fr)'
}

function buildConstraintsBody(sheet) {
  const rows = sheet.rows.map(entry => rowEl(null, searchKey([entry.n, entry.target, entry.note]), { class: 'cheat-con-row' },
    h('span', { class: 'cheat-con-n mono' }, entry.n),
    h('span', { class: 'cheat-con-arrow' }, icon('arrowRight', 14)),
    h('span', { class: 'cheat-con-target' }, entry.target),
    h('span', { class: 'cheat-con-note muted small' }, entry.note)))
  const notes = sheet.notes ? h('div', { class: 'row-wrap cheat-extra-notes' }, sheet.notes.map(text => h('span', { class: 'chip cheat-note-chip' }, text))) : null
  return [h('div', { class: 'cheat-con-list' }, rows), notes]
}

function buildLadderBody(sheet) {
  const rows = sheet.rows.map(def => {
    const ops5 = def.fn(1e5)
    const ops6 = def.fn(1e6)
    return rowEl(null, searchKey([def.label, formatOps(ops5), formatOps(ops6)]), { class: 'cheat-ladder-row' },
      h('span', { class: 'cheat-ladder-label mono' }, def.label),
      h('div', { class: 'cheat-ladder-bar-wrap' },
        h('span', { class: 'cheat-budget-mark' }),
        h('div', { class: `cheat-ladder-bar tone-${barTone(ops6)}`, style: { width: `${barWidth(ops6)}%` } })),
      h('span', { class: 'cheat-ladder-ops mono' }, `n=10⁵: ${formatOps(ops5)}`),
      h('span', { class: 'cheat-ladder-ops mono' }, `n=10⁶: ${formatOps(ops6)}`))
  })
  return [
    h('p', { class: 'muted small' }, 'Bar = log scale of total ops at n = 10⁶. Budget mark ≈ 10⁸ ops/sec.'),
    h('div', { class: 'cheat-ladder-list' }, rows),
  ]
}

function buildTableBody(sheet) {
  const template = colsTemplate(sheet.headers.length)
  const head = h('div', { class: 'cheat-table-row cheat-table-head muted small', style: { gridTemplateColumns: template } },
    sheet.headers.map(label => h('span', null, label)))
  const rows = sheet.rows.map(cells => rowEl(null, searchKey(cells), { class: 'cheat-table-row', style: { gridTemplateColumns: template } },
    cells.map((cell, i) => h('span', { class: i === 0 ? 'cheat-table-primary' : 'mono' }, cell))))
  return [h('div', { class: 'cheat-table' }, head, ...rows)]
}

function buildSignalsBody(sheet) {
  const rows = sheet.rows.map(([signal, pattern]) => rowEl(null, searchKey([signal, pattern]), { class: 'cheat-signal-row' },
    h('span', { class: 'cheat-signal-text' }, signal),
    h('span', { class: 'cheat-signal-arrow' }, icon('arrowRight', 14)),
    h('span', { class: 'pill pill-red' }, pattern)))
  return [h('div', { class: 'cheat-signal-list' }, rows)]
}

function buildNotesBody(sheet) {
  const rows = sheet.rows.map(entry => {
    if (typeof entry === 'string') return rowEl(null, searchKey([entry]), { class: 'cheat-note-row' }, h('span', null, entry))
    return rowEl(null, searchKey([entry.label, entry.note]), { class: 'cheat-note-row' }, h('b', null, entry.label), h('span', { class: 'muted small' }, entry.note))
  })
  return [h('div', { class: 'stack-sm' }, rows)]
}

function buildIdiomsBody(sheet) {
  const rows = sheet.rows.map(entry => silentRow(searchKey([entry.bad, entry.good, entry.note]), { class: 'cheat-idiom-row' },
    h('div', { class: 'cheat-idiom-col cheat-idiom-bad' }, h('span', { class: 'cheat-idiom-tag tag-bad' }, 'Avoid'), codeBlock(entry.bad, { lineNumbers: false })),
    h('div', { class: 'cheat-idiom-col cheat-idiom-good' }, h('span', { class: 'cheat-idiom-tag tag-good' }, 'Prefer'), codeBlock(entry.good, { lineNumbers: false })),
    h('p', { class: 'cheat-idiom-note muted small' }, entry.note)))
  return [h('div', { class: 'cheat-idiom-list' }, rows)]
}

function codeToolbar(label, code) {
  return h('div', { class: 'cheat-code-toolbar' },
    label ? h('b', { class: 'cheat-code-label' }, label) : null,
    h('button', { class: 'btn btn-ghost btn-sm cheat-copy-btn', onclick: () => copyText(code) }, 'Copy'))
}

function buildCodeBody(sheet) {
  return [
    sheet.when ? h('p', { class: 'cheat-code-when' }, sheet.when) : null,
    sheet.complexity ? h('p', { class: 'muted small mono cheat-code-complexity' }, sheet.complexity) : null,
    silentRow(searchKey([sheet.title, sheet.when, sheet.complexity, sheet.code]), { class: 'cheat-code-wrap' },
      codeToolbar(null, sheet.code),
      codeBlock(sheet.code)),
  ]
}

function buildCodeMultiBody(sheet) {
  const snippets = sheet.snippets.map(snippet => silentRow(searchKey([snippet.label, snippet.code]), { class: 'cheat-code-wrap' },
    codeToolbar(snippet.label, snippet.code),
    codeBlock(snippet.code)))
  return [
    sheet.when ? h('p', { class: 'cheat-code-when' }, sheet.when) : null,
    sheet.complexity ? h('p', { class: 'muted small mono cheat-code-complexity' }, sheet.complexity) : null,
    h('div', { class: 'stack-sm' }, snippets),
  ]
}

function buildStepsBody(sheet) {
  const rows = sheet.rows.map((entry, i) => rowEl(null, searchKey([entry.step, entry.you]), { class: 'cheat-step-row' },
    h('span', { class: 'cheat-step-num' }, String(i + 1)),
    h('div', { class: 'cheat-step-col' }, h('b', null, entry.step), h('p', { class: 'cheat-step-quote' }, `“${entry.you}”`))))
  return [h('div', { class: 'stack-sm' }, rows)]
}

function buildStarBody(sheet) {
  const letterRows = sheet.rows.map(entry => rowEl(null, searchKey([entry.label, entry.tip]), { class: 'cheat-star-row' },
    h('span', { class: 'cheat-star-letter' }, entry.letter),
    h('div', null, h('b', null, entry.label), h('p', { class: 'muted small' }, entry.tip))))
  const prompts = sheet.prompts ? silentRow(searchKey(sheet.prompts), { class: 'cheat-star-prompts' },
    h('div', { class: 'label muted small' }, 'Common prompts'),
    h('ul', { class: 'cheat-star-prompt-list' }, sheet.prompts.map(p => h('li', null, p)))) : null
  const rule = sheet.rule ? silentRow(searchKey([sheet.rule]), { class: 'cheat-star-rule muted small' }, sheet.rule) : null
  return [h('div', { class: 'cheat-star-grid' }, letterRows), prompts, rule]
}

function buildCompaniesBody(sheet) {
  const rows = sheet.rows.map(entry => {
    const company = companyById[entry.id]
    return silentRow(searchKey([company?.label, ...entry.points]), { class: 'cheat-company-row' },
      h('div', { class: 'cheat-company-head' }, companyMark(entry.id, 22), h('b', null, company?.label || entry.id)),
      h('ul', { class: 'cheat-company-points' }, entry.points.map(point => h('li', null, point))))
  })
  return [h('div', { class: 'cheat-company-grid' }, rows)]
}

const bodyBuilders = {
  constraints: buildConstraintsBody,
  ladder: buildLadderBody,
  table: buildTableBody,
  signals: buildSignalsBody,
  notes: buildNotesBody,
  idioms: buildIdiomsBody,
  code: buildCodeBody,
  'code-multi': buildCodeMultiBody,
  steps: buildStepsBody,
  star: buildStarBody,
  companies: buildCompaniesBody,
}

function buildPairQuiz(rows, { prompt, answerIndex, count, idPrefix }) {
  const candidates = shuffleArray(rows)
  const questions = []
  for (const candidate of candidates) {
    if (questions.length >= count) break
    const answerText = String(candidate[answerIndex])
    const distractorTexts = [...new Set(rows.map(other => String(other[answerIndex])).filter(text => text !== answerText))]
    if (!distractorTexts.length) continue
    const distractors = shuffleArray(distractorTexts).slice(0, 3)
    questions.push({
      id: `${idPrefix}:auto:${questions.length}:${Math.floor(Math.random() * 1e6)}`,
      q: prompt(candidate),
      choices: [answerText, ...distractors],
      answer: 0,
    })
  }
  return questions
}

function buildConstraintsQuiz(part, count, idPrefix) {
  const rows = part.rows
  const candidates = shuffleArray(rows)
  const questions = []
  for (const entry of candidates) {
    if (questions.length >= count) break
    const distractorTexts = [...new Set(rows.map(other => other.target).filter(target => target !== entry.target))]
    if (!distractorTexts.length) continue
    const distractors = shuffleArray(distractorTexts).slice(0, 3)
    questions.push({
      id: `${idPrefix}:auto:${questions.length}:${Math.floor(Math.random() * 1e6)}`,
      q: `${entry.n} → target complexity?`,
      choices: [entry.target, ...distractors],
      answer: 0,
      why: entry.note,
    })
  }
  return questions
}

function quizPoolForPart(part, idPrefix) {
  const manual = (part.quiz || []).map((item, i) => ({ id: `${idPrefix}:manual:${i}`, ...item }))
  let auto = []
  if (part.kind === 'constraints') auto = buildConstraintsQuiz(part, 8, idPrefix)
  else if (part.kind === 'signals' && part.quizPrompt) auto = buildPairQuiz(part.rows, { prompt: part.quizPrompt, answerIndex: 1, count: 10, idPrefix })
  else if (part.kind === 'table' && part.quizCol != null && part.quizPrompt) auto = buildPairQuiz(part.rows, { prompt: part.quizPrompt, answerIndex: part.quizCol, count: 8, idPrefix })
  return [...manual, ...auto]
}

function quizPoolFor(sheet) {
  if (sheet.parts) return sheet.parts.flatMap((part, i) => quizPoolForPart(part, `${sheet.id}:p${i}`))
  return quizPoolForPart(sheet, sheet.id)
}

function renderInlineQuiz(host, items, defaultSkills, { onClose } = {}) {
  let index = 0
  let score = 0
  function draw() {
    clear(host)
    if (!items.length) {
      host.append(h('p', { class: 'muted small cheat-quiz-empty' }, 'No quiz questions for this sheet yet.'))
      return
    }
    if (index >= items.length) {
      host.append(h('div', { class: 'cheat-quiz-done' },
        h('div', { class: 'row spread' }, h('b', null, 'Done'), h('span', { class: 'pill pill-teal' }, `${score}/${items.length}`)),
        h('div', { class: 'row' },
          h('button', { class: 'btn btn-ghost btn-sm', onclick: () => { index = 0; score = 0; draw() } }, 'Again'),
          onClose ? h('button', { class: 'btn btn-ghost btn-sm', onclick: onClose }, 'Close') : null)))
      return
    }
    const item = items[index]
    const skills = item._skills || defaultSkills
    host.append(
      h('div', { class: 'cheat-quiz-progress muted small' }, `${index + 1} / ${items.length}`),
      renderMcq(item, ({ correct, ms }) => {
        try { recordAnswer({ itemId: item.id, kind: 'mcq', skills, correct, ms }) } catch {}
        if (correct) score += 1
        setTimeout(() => { index += 1; draw() }, correct ? 450 : 1300)
      }))
  }
  draw()
}

function buildPartBody(part) {
  const builder = bodyBuilders[part.kind]
  const inner = builder ? builder(part) : [h('p', { class: 'muted small' }, 'Nothing here yet.')]
  return h('div', { class: 'cheat-part' },
    part.title ? h('div', { class: 'cheat-part-title' }, part.title) : null,
    ...inner)
}

function buildSheetCard(sheet, group) {
  const tone = group.tone
  const body = sheet.parts
    ? sheet.parts.map(buildPartBody)
    : (() => {
        const builder = bodyBuilders[sheet.kind]
        return builder ? builder(sheet) : [h('p', { class: 'muted small' }, 'Nothing here yet.')]
      })()

  const quizHost = h('div', { class: 'cheat-quiz-host' })
  let quizOpen = false
  const quizButton = h('button', { class: 'btn btn-ghost btn-sm cheat-quiz-btn', onclick: () => {
    quizOpen = !quizOpen
    quizButton.textContent = quizOpen ? 'Hide quiz' : 'Quiz me on this'
    if (quizOpen) {
      const pool = shuffleArray(quizPoolFor(sheet)).slice(0, 5)
      renderInlineQuiz(quizHost, pool, sheetSkills[sheet.id] || ['complexity'], { onClose: () => { quizOpen = false; quizButton.textContent = 'Quiz me on this'; clear(quizHost) } })
    } else clear(quizHost)
  } }, 'Quiz me on this')

  const stored = getCollapsedState()
  const isOpen = stored[sheet.id] === true

  const details = h('details', { id: sheet.id, class: 'card cheat-card', open: isOpen || null, style: { '--sheet-tone': `var(--${tone})` } },
    h('summary', { class: 'cheat-card-head' },
      h('span', { class: 'cheat-bar', style: { background: `var(--${tone})` } }),
      h('h2', null, sheet.title),
      h('span', { class: 'cheat-chevron' }, icon('chevronRight', 14))),
    h('div', { class: 'cheat-card-body' },
      ...body,
      h('div', { class: 'cheat-card-footer' }, quizButton),
      quizHost))

  details.querySelector('summary').addEventListener('click', () => {
    setTimeout(() => persistCollapsed(sheet.id, details.open), 0)
  })

  return details
}

function applyFilter(root, query) {
  const q = query.trim().toLowerCase()
  for (const card of root.querySelectorAll('.cheat-card')) {
    const rows = card.querySelectorAll('.cheat-row')
    let anyVisible = !rows.length
    for (const el of rows) {
      const hit = !q || (el.dataset.k || '').includes(q)
      el.classList.toggle('is-hidden', !hit)
      if (hit) anyVisible = true
    }
    card.classList.toggle('is-hidden', Boolean(q) && !anyVisible)
    if (q && anyVisible && !card.open) {
      card.open = true
      card.dataset.autoOpened = '1'
    } else if (!q && card.dataset.autoOpened) {
      card.open = false
      delete card.dataset.autoOpened
    }
  }
}

export default function render(container) {
  clear(container)

  const searchInput = h('input', {
    class: 'filter-search cheat-search', type: 'search', placeholder: 'Search every sheet…',
    oninput: event => applyFilter(page, event.target.value),
  })

  const expandAllButton = h('button', { class: 'btn btn-ghost btn-sm', onclick: () => {
    const map = {}
    for (const card of page.querySelectorAll('.cheat-card')) { card.open = true; map[card.id] = true }
    try { setSetting('cheatCollapsed', { ...getCollapsedState(), ...map }) } catch {}
  } }, 'Expand all')

  const collapseAllButton = h('button', { class: 'btn btn-ghost btn-sm', onclick: () => {
    const map = {}
    for (const card of page.querySelectorAll('.cheat-card')) { card.open = false; map[card.id] = false }
    try { setSetting('cheatCollapsed', { ...getCollapsedState(), ...map }) } catch {}
  } }, 'Collapse all')

  const printButton = h('button', { class: 'btn btn-ghost btn-sm', onclick: () => {
    const cards = [...page.querySelectorAll('.cheat-card')]
    const previous = cards.map(card => card.open)
    cards.forEach(card => { card.open = true })
    const restore = () => {
      cards.forEach((card, i) => { card.open = previous[i] })
      window.removeEventListener('afterprint', restore)
    }
    window.addEventListener('afterprint', restore)
    window.print()
  } }, 'Print')

  const quizHost = h('div', { class: 'cheat-quiz-host cheat-quiz-host-global' })
  let quizOpen = false
  const quizButton = h('button', { class: 'btn btn-primary', onclick: () => {
    quizOpen = !quizOpen
    quizButton.textContent = quizOpen ? 'Close quiz' : 'Quiz me'
    if (quizOpen) {
      const pool = shuffleArray(cheatSheets.flatMap(sheet => quizPoolFor(sheet).map(item => ({ ...item, _skills: sheetSkills[sheet.id] || ['complexity'] })))).slice(0, 10)
      renderInlineQuiz(quizHost, pool, ['complexity'], { onClose: () => { quizOpen = false; quizButton.textContent = 'Quiz me'; clear(quizHost) } })
    } else clear(quizHost)
  } }, 'Quiz me')

  const toolbar = h('div', { class: 'cheat-toolbar' },
    searchInput,
    h('div', { class: 'row cheat-toolbar-actions' }, expandAllButton, collapseAllButton, printButton, quizButton))

  const navStrip = h('nav', { class: 'cheat-nav-strip' },
    cheatSheetsByGroup.map(group => h('div', { class: 'cheat-nav-group' },
      h('span', { class: 'cheat-nav-group-label', style: { '--dot': `var(--${group.tone})` } }, group.label),
      group.sheets.map(sheet => h('a', {
        class: 'chip cheat-chip', href: '#/cheatsheet', style: { '--dot': `var(--${group.tone})` },
        onclick: event => {
          event.preventDefault()
          const target = document.getElementById(sheet.id)
          if (!target) return
          if (!target.open) { target.open = true; persistCollapsed(sheet.id, true) }
          target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        },
      }, h('i', { class: 'cheat-chip-dot' }), sheet.title)))))

  const sections = cheatSheetsByGroup.map(group => h('section', { class: 'cheat-group' },
    h('div', { class: 'cheat-group-label muted small' }, group.label),
    group.sheets.map(sheet => buildSheetCard(sheet, group))))

  const page = h('div', { class: 'page cheat-page' },
    subnav('cheatsheet', 'cheatsheet'),
    h('div', { class: 'page-header' }, h('h1', null, 'Cheat sheet')),
    toolbar,
    navStrip,
    quizHost,
    sections)

  container.append(page)
  return null
}
