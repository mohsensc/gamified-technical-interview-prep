import { h, clear } from '../ui/h.js'
import { renderMcq } from '../ui/items.js'
import { recordAnswer } from '../store.js'
import { lessons, traces, mcqs, clozes, parsons, flashcards, problems } from '../content/index.js'
import { glossaryTerms, categoryOrder, categoryMeta, termId, findTerm, relatedEntries } from '../content/glossary.js'

const decodeParam = value => {
  try { return decodeURIComponent(value) } catch { return value }
}

const shuffle = list => {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const termHref = entry => `#/glossary/${encodeURIComponent(termId(entry.term))}`

function matchesQuery(entry, query) {
  if (!query) return true
  const haystack = [entry.term, ...(entry.aliases || []), entry.def].join(' ').toLowerCase()
  return haystack.includes(query)
}

function buildRapidItems(count) {
  return shuffle(glossaryTerms).slice(0, Math.min(count, glossaryTerms.length)).map((entry, index) => {
    const distractors = shuffle(glossaryTerms.filter(other => other.term !== entry.term)).slice(0, 3).map(other => other.def)
    const choices = shuffle([entry.def, ...distractors])
    return {
      id: `glossary:rapid:${termId(entry.term)}:${index}:${Math.floor(Math.random() * 1e6)}`,
      q: `What does "${entry.term}" mean?`,
      choices,
      answer: choices.indexOf(entry.def),
      why: `${categoryMeta[entry.category]?.label || entry.category} term`,
    }
  })
}

function renderRapid(host, onClose) {
  let items = buildRapidItems(8)
  let index = 0
  let score = 0

  function draw() {
    host.replaceChildren()
    if (index >= items.length) {
      host.append(h('div', { class: 'card gl-rapid' },
        h('div', { class: 'gl-rapid-head' },
          h('h3', null, 'Rapid fire done'),
          h('span', { class: 'pill pill-teal' }, `${score}/${items.length}`)),
        h('div', { class: 'row' },
          h('button', { class: 'btn btn-primary', onclick: () => { items = buildRapidItems(8); index = 0; score = 0; draw() } }, 'Again'),
          h('button', { class: 'btn btn-ghost', onclick: onClose }, 'Close'))))
      return
    }
    const item = items[index]
    host.append(h('div', { class: 'card gl-rapid' },
      h('div', { class: 'gl-rapid-head' },
        h('span', { class: 'muted small' }, `${index + 1} / ${items.length}`),
        h('span', { class: 'pill' }, `${score} correct`)),
      renderMcq(item, ({ correct, ms }) => {
        try { recordAnswer({ itemId: item.id, kind: 'mcq', skills: [], correct, ms }) } catch {}
        if (correct) score += 1
        setTimeout(() => { index += 1; draw() }, correct ? 550 : 1300)
      })))
  }
  draw()
}

function renderList(container) {
  const state = { query: '', cat: 'all' }
  const countEl = h('span', { class: 'muted small' })
  const resultsEl = h('div', { class: 'stack gl-groups' })
  const chips = h('div', { class: 'row row-wrap gl-chips' })
  const rapidHost = h('div')
  let rapidOpen = false

  const rapidButton = h('button', { class: 'btn btn-primary gl-rapid-btn', onclick: () => {
    rapidOpen = !rapidOpen
    rapidButton.textContent = rapidOpen ? 'Close rapid fire' : '⚡ Glossary rapid fire'
    rapidHost.replaceChildren()
    if (rapidOpen) renderRapid(rapidHost, () => {
      rapidOpen = false
      rapidButton.textContent = '⚡ Glossary rapid fire'
      rapidHost.replaceChildren()
    })
  } }, '⚡ Glossary rapid fire')

  const searchInput = h('input', {
    class: 'filter-search gl-search', type: 'search', placeholder: 'Search terms, aliases, definitions…',
    oninput: event => { state.query = event.target.value.trim().toLowerCase(); drawResults() },
  })

  function drawChips() {
    chips.replaceChildren(
      h('button', { class: `chip${state.cat === 'all' ? ' active' : ''}`, onclick: () => { state.cat = 'all'; drawChips(); drawResults() } }, 'All'),
      ...categoryOrder.map(catId => h('button', {
        class: `chip${state.cat === catId ? ' active' : ''}`,
        onclick: () => { state.cat = catId; drawChips(); drawResults() },
      }, h('span', { class: `dot dot-${categoryMeta[catId].color}` }), ` ${categoryMeta[catId].label}`)))
  }

  function drawResults() {
    const groups = categoryOrder
      .filter(catId => state.cat === 'all' || state.cat === catId)
      .map(catId => ({
        catId,
        entries: glossaryTerms
          .filter(entry => entry.category === catId && matchesQuery(entry, state.query))
          .sort((a, b) => a.term.localeCompare(b.term)),
      }))
      .filter(group => group.entries.length)

    const total = groups.reduce((sum, group) => sum + group.entries.length, 0)
    countEl.textContent = `${total} / ${glossaryTerms.length}`

    resultsEl.replaceChildren(...groups.map(group => h('section', { class: 'stack gl-group' },
      h('div', { class: 'row gl-group-head' },
        h('span', { class: `dot dot-${categoryMeta[group.catId].color}` }),
        h('h3', null, categoryMeta[group.catId].label),
        h('span', { class: 'muted small' }, String(group.entries.length))),
      h('div', { class: 'grid gl-term-grid' }, group.entries.map(entry => h('a', { class: 'card card-hover gl-term-card', href: termHref(entry) },
        h('div', { class: 'row gl-term-top' },
          h('strong', null, entry.term),
          h('span', { class: `pill pill-${categoryMeta[entry.category].color}` }, categoryMeta[entry.category].label)),
        h('div', { class: 'muted small gl-term-def' }, entry.def)))))))

    if (!groups.length) resultsEl.append(h('div', { class: 'empty card' }, 'No terms match.'))
  }

  drawChips()
  drawResults()

  container.append(h('div', { class: 'page gl-page' },
    h('div', { class: 'page-header row' },
      h('h1', null, 'Glossary'),
      countEl,
      rapidButton),
    rapidHost,
    h('div', { class: 'row gl-controls' }, searchInput),
    chips,
    resultsEl))
}

const containsEntry = (text, entry) => {
  if (!text) return false
  const lower = String(text).toLowerCase()
  const forms = [entry.term, ...(entry.aliases || [])].map(form => form.toLowerCase())
  return forms.some(form => {
    let idx = lower.indexOf(form)
    while (idx !== -1) {
      const before = idx > 0 ? lower[idx - 1] : ''
      const after = idx + form.length < lower.length ? lower[idx + form.length] : ''
      if (!/[a-z0-9]/i.test(before) && !/[a-z0-9]/i.test(after)) return true
      idx = lower.indexOf(form, idx + 1)
    }
    return false
  })
}

function findMentions(entry) {
  const mentions = []
  for (const lesson of lessons) {
    const text = [lesson.title, ...(lesson.slides || []).flatMap(slide => [slide.title, ...(slide.points || []), slide.ask?.q, slide.ask?.why])].filter(Boolean).join(' ')
    if (containsEntry(text, entry)) mentions.push({ kind: 'lesson', kindLabel: 'Lesson', text: lesson.title, href: `#/learn/${encodeURIComponent(lesson.topic)}` })
  }
  for (const trace of traces) {
    const text = [trace.title, trace.problem].filter(Boolean).join(' ')
    if (containsEntry(text, entry)) mentions.push({ kind: 'trace', kindLabel: 'Trace', text: trace.title, href: `#/trace/${encodeURIComponent(trace.id)}` })
  }
  for (const mcq of mcqs) {
    const text = [mcq.q, mcq.why].filter(Boolean).join(' ')
    if (containsEntry(text, entry)) mentions.push({ kind: 'mcq', kindLabel: 'Quiz', text: mcq.q, href: `#/drill/${encodeURIComponent(mcq.topic)}` })
  }
  for (const cloze of clozes) {
    if (containsEntry(cloze.title, entry)) mentions.push({ kind: 'cloze', kindLabel: 'Fill in', text: cloze.title, href: `#/drill/${encodeURIComponent(cloze.topic)}` })
  }
  for (const item of parsons) {
    if (containsEntry(item.title, entry)) mentions.push({ kind: 'parsons', kindLabel: 'Reorder', text: item.title, href: `#/drill/${encodeURIComponent(item.topic)}` })
  }
  for (const card of flashcards) {
    const text = [card.front, card.back].filter(Boolean).join(' ')
    if (containsEntry(text, entry)) mentions.push({ kind: 'card', kindLabel: 'Card', text: card.front, href: '#/flashcards' })
  }
  for (const problem of problems) {
    const text = [problem.title, problem.insight, ...(problem.narration || []), ...(problem.pitfalls || []), ...(problem.signals || [])].filter(Boolean).join(' ')
    if (containsEntry(text, entry)) mentions.push({ kind: 'problem', kindLabel: 'Problem', text: problem.title, href: `#/problems/${encodeURIComponent(problem.id)}` })
  }
  return mentions.slice(0, 18)
}

function renderDetail(container, rawTerm) {
  const entry = findTerm(rawTerm)
  if (!entry) {
    container.append(h('div', { class: 'page' }, h('div', { class: 'empty card' }, 'Term not found. ', h('a', { href: '#/glossary' }, 'All terms'))))
    return
  }
  const related = relatedEntries(entry)
  const mentions = findMentions(entry)
  const color = categoryMeta[entry.category]?.color || 'accent'

  container.append(h('div', { class: 'page gl-detail' },
    h('div', { class: 'page-header row' },
      h('a', { class: 'btn btn-ghost', href: '#/glossary' }, '←'),
      h('h1', null, entry.term),
      h('span', { class: `pill pill-${color}` }, categoryMeta[entry.category]?.label || entry.category)),
    h('div', { class: 'card gl-def-card' },
      h('div', { class: 'gl-def' }, entry.def),
      entry.aliases?.length ? h('div', { class: 'row gl-aliases' },
        h('span', { class: 'muted small' }, 'Also:'),
        entry.aliases.map(alias => h('span', { class: 'chip' }, alias))) : null),
    related.length ? h('section', { class: 'stack' },
      h('h3', null, 'Related'),
      h('div', { class: 'row row-wrap' }, related.map(rel => h('a', { class: 'chip', href: termHref(rel) }, rel.term)))) : null,
    h('section', { class: 'stack' },
      h('h3', null, 'Shows up in'),
      mentions.length
        ? h('div', { class: 'stack gl-mentions' }, mentions.map(mention => h('a', { class: 'card card-hover gl-mention', href: mention.href },
          h('span', { class: 'pill' }, mention.kindLabel),
          h('span', { class: 'gl-mention-text' }, mention.text))))
        : h('div', { class: 'muted small' }, 'Nothing tagged with this term yet.'))))
}

export default function render(container, params = {}) {
  clear(container)
  if (params.term) return renderDetail(container, decodeParam(params.term))
  renderList(container)
}
