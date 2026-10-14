import { h, clear, confetti } from '../ui/h.js'
import { codeBlock } from '../ui/code.js'
import { renderMcq } from '../ui/items.js'
import * as store from '../store.js'
import { problems, problemById, traceById } from '../content/index.js'
import { skills } from '../content/skills.js'
import { rich, stripMarks } from '../ui/rich.js'
import { companyChips, companyFilter } from '../ui/companies.js'
import { companiesFor, matchesCompanies, companyCounts } from '../content/companies.js'

const filters = { search: '', companies: [], difficulty: 'all', skill: 'all', pattern: 'all' }

const commonTimes = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n^2)', 'O(n^3)', 'O(2^n)', 'O(n!)', 'O(V+E)', 'O(m·n)', 'O(n·k)', 'O(E log V)', 'O(n log k)', 'O(√n)']
const commonDs = ['hashmap', 'set', 'array', 'stack', 'queue', 'deque', 'heap', 'linked list', 'trie', 'union-find', 'adjacency list', 'sorted array', '2-D table']

const decodeParam = value => {
  try { return decodeURIComponent(value) } catch { return value }
}

const seen = id => {
  try { return store.isSeen(id) } catch { return false }
}

const normalizeTime = text => String(text || '').replace(/\s+/g, '').replace(/[·*×]/g, '').toLowerCase()

const shuffle = list => {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function buildChoices(correct, candidates, normalizeFn = text => String(text).toLowerCase().trim()) {
  const used = new Set([normalizeFn(correct)])
  const distractors = []
  for (const candidate of shuffle(candidates)) {
    const key = normalizeFn(candidate)
    if (!candidate || used.has(key)) continue
    used.add(key)
    distractors.push(candidate)
    if (distractors.length === 3) break
  }
  const choices = shuffle([correct, ...distractors])
  return { choices, answer: choices.indexOf(correct) }
}

const dsLabel = problem => (problem.ds || []).join(' + ')

const difficultyClass = difficulty => `diff-${String(difficulty || '').toLowerCase()}`

function matches(problem) {
  if (!matchesCompanies(problem, filters.companies)) return false
  if (filters.difficulty !== 'all' && problem.difficulty !== filters.difficulty) return false
  if (filters.skill !== 'all' && !(problem.skills || []).includes(filters.skill)) return false
  if (filters.pattern !== 'all' && problem.pattern !== filters.pattern) return false
  const query = filters.search.trim().toLowerCase()
  if (!query) return true
  const haystack = [problem.title, problem.lc, problem.pattern, ...(problem.ds || []), ...(problem.signals || [])].join(' ').toLowerCase()
  return query.split(/\s+/).every(word => haystack.includes(word))
}

function renderList(container) {
  const patterns = [...new Set(problems.map(problem => problem.pattern).filter(Boolean))].sort()
  const usedSkills = [...new Set(problems.flatMap(problem => problem.skills || []))].filter(skill => skills[skill])
  const body = h('tbody')
  const countEl = h('span', { class: 'muted' })

  function drawRows() {
    const list = problems.filter(matches)
    countEl.textContent = `${list.length} / ${problems.length}`
    body.replaceChildren(...list.map(problem => h('tr', {
      class: `problem-row${seen(problem.id) ? ' is-seen' : ''}`,
      tabindex: '0',
      onclick: () => { location.hash = `#/problems/${encodeURIComponent(problem.id)}` },
      onkeydown: event => { if (event.key === 'Enter') location.hash = `#/problems/${encodeURIComponent(problem.id)}` },
    },
    h('td', { class: 'mono muted' }, problem.lc ?? ''),
    h('td', { class: 'problem-title-cell' },
      h('span', { class: `diff-dot ${difficultyClass(problem.difficulty)}`, title: problem.difficulty || '' }),
      stripMarks(problem.title),
      companyChips(companiesFor(problem), { size: 'xs', labels: false, max: 3 }),
      seen(problem.id) ? h('span', { class: 'seen-mark' }, '✓') : null),
    h('td', null, problem.pattern ? h('span', { class: 'chip chip-pattern' }, problem.pattern) : null),
    h('td', { class: 'mono' }, problem.time || ''),
    h('td', { class: 'mono muted' }, problem.space || ''))))
    if (!list.length) body.append(h('tr', null, h('td', { colspan: '5', class: 'empty' }, 'No matches')))
  }

  const select = (key, options, allLabel) => h('select', {
    class: 'filter-select',
    onchange: event => {
      filters[key] = event.target.value
      drawRows()
    },
  }, h('option', { value: 'all' }, allLabel), options.map(([value, label]) => h('option', { value, selected: filters[key] === value }, label)))

  const difficultyChips = h('div', { class: 'row seg' }, ['all', 'Easy', 'Medium', 'Hard'].map(level => h('button', {
    class: `chip${filters.difficulty === level ? ' active' : ''}`,
    onclick: event => {
      filters.difficulty = level
      for (const chip of difficultyChips.children) chip.classList.remove('active')
      event.currentTarget.classList.add('active')
      drawRows()
    },
  }, level === 'all' ? 'Any' : level)))

  const companyRow = companyFilter({
    selected: filters.companies,
    counts: companyCounts(problems),
    onChange: next => {
      filters.companies = next
      drawRows()
    },
  })

  const searchInput = h('input', {
    class: 'filter-search',
    type: 'search',
    placeholder: 'Search title, pattern, signal…',
    value: filters.search,
    oninput: event => {
      filters.search = event.target.value
      drawRows()
    },
  })

  const randomButton = h('button', {
    class: 'btn btn-primary',
    onclick: () => {
      const list = problems.filter(matches)
      const fresh = list.filter(problem => !seen(problem.id))
      const pool = fresh.length ? fresh : list
      if (pool.length) location.hash = `#/problems/${encodeURIComponent(pool[Math.floor(Math.random() * pool.length)].id)}`
    },
  }, 'Random diagnose')

  container.append(h('div', { class: 'page problems-page' },
    h('div', { class: 'page-header row' }, h('h1', null, 'Problems'), countEl, randomButton),
    companyRow,
    h('div', { class: 'row problem-filters' },
      searchInput,
      difficultyChips,
      select('skill', usedSkills.map(skill => [skill, skills[skill].label]), 'All skills'),
      select('pattern', patterns.map(pattern => [pattern, pattern]), 'All patterns')),
    problems.length
      ? h('div', { class: 'card table-wrap' }, h('table', { class: 'problem-table' },
        h('thead', null, h('tr', null, h('th', null, '#'), h('th', null, 'Problem'), h('th', null, 'Pattern'), h('th', null, 'Time'), h('th', null, 'Space'))),
        body))
      : h('div', { class: 'empty card' }, 'No problems loaded yet.')))
  drawRows()
}

function renderDetail(container, problem) {
  const others = problems.filter(other => other.id !== problem.id)
  const steps = []

  if (problem.pattern) {
    const { choices, answer } = buildChoices(problem.pattern, others.map(other => other.pattern))
    steps.push({ key: 'pattern', label: 'Pattern', skills: problem.skills || [], item: {
      id: `${problem.id}:diag:pattern`, q: 'Which pattern?', choices, answer,
      why: problem.signals?.length ? `Signals: ${problem.signals.join(', ')}` : problem.pattern,
    } })
  }
  if (problem.time) {
    const { choices, answer } = buildChoices(problem.time, [...others.map(other => other.time), ...commonTimes], normalizeTime)
    steps.push({ key: 'time', label: 'Time', skills: ['constraints', 'complexity'].filter(skill => skills[skill]), item: {
      id: `${problem.id}:diag:time`, q: `Target time for ${problem.constraints || 'these constraints'}?`, choices, answer,
      why: `${problem.time} time, ${problem.space || '?'} space`,
    } })
  }
  if (problem.ds?.length) {
    const correct = dsLabel(problem)
    const candidates = [...others.map(dsLabel), ...commonDs]
    const { choices, answer } = buildChoices(correct, candidates)
    steps.push({ key: 'ds', label: 'Data structure', skills: ['ds-diagnosis'], item: {
      id: `${problem.id}:diag:ds`, q: 'Core data structure?', choices, answer, why: correct,
    } })
  }

  const stepHost = h('div', { class: 'stack diag-steps' })
  const reveal = h('div', { class: 'stack diag-reveal' })
  const scoreEl = h('div', { class: 'row diag-score' })
  const results = []
  let revealed = false

  const skipButton = h('button', { class: 'btn btn-ghost', onclick: () => showReveal() }, 'Skip to solution')

  function drawScore() {
    scoreEl.replaceChildren(...steps.map((step, i) => h('span', {
      class: `chip diag-chip${results[i] === true ? ' good' : results[i] === false ? ' bad' : i === results.length ? ' active' : ''}`,
    }, `${i + 1}. ${step.label}`)))
  }

  function showStep(i) {
    drawScore()
    if (i >= steps.length) {
      showReveal()
      return
    }
    const step = steps[i]
    const wrapper = h('div', { class: 'card diag-step' }, h('div', { class: 'diag-step-label muted' }, `${i + 1} / ${steps.length} · ${step.label}`))
    wrapper.append(renderMcq(step.item, ({ correct, ms }) => {
      results[i] = correct
      try { store.recordAnswer({ itemId: step.item.id, kind: 'mcq', skills: step.skills, correct, ms }) } catch {}
      drawScore()
      setTimeout(() => showStep(i + 1), correct ? 500 : 1100)
    }))
    stepHost.append(wrapper)
    wrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  function showReveal() {
    if (revealed) return
    revealed = true
    skipButton.remove()
    try { store.markSeen(problem.id) } catch {}
    const score = results.filter(Boolean).length
    if (steps.length && score === steps.length) confetti()
    const trace = problem.traceId ? traceById[problem.traceId] : null
    reveal.append(
      h('div', { class: 'card insight-card' },
        h('div', { class: 'label muted' }, 'Insight'),
        h('div', { class: 'insight-text' }, rich(problem.insight || '—')),
        h('div', { class: 'row' },
          problem.pattern ? h('span', { class: 'chip chip-pattern' }, problem.pattern) : null,
          ...(problem.ds || []).map(ds => h('span', { class: 'chip' }, ds)),
          problem.time ? h('span', { class: 'pill' }, `T ${problem.time}`) : null,
          problem.space ? h('span', { class: 'pill' }, `S ${problem.space}`) : null,
          trace ? h('a', { class: 'btn btn-primary', href: `#/trace/${encodeURIComponent(trace.id)}` }, '▶ Step through') : null)),
      problem.narration?.length ? h('div', { class: 'card narration-card' },
        h('div', { class: 'label muted' }, 'Say it'),
        h('ol', { class: 'narration' }, problem.narration.map(line => h('li', null, rich(line))))) : null,
      problem.solution ? h('div', { class: 'card solution-card' },
        h('div', { class: 'row' },
          h('div', { class: 'label muted' }, 'Solution'),
          h('button', { class: 'btn btn-ghost btn-sm', onclick: event => {
            navigator.clipboard?.writeText(problem.solution)
            event.currentTarget.textContent = 'Copied'
          } }, 'Copy')),
        codeBlock(problem.solution)) : null,
      problem.pitfalls?.length ? h('div', { class: 'card pitfalls-card' },
        h('div', { class: 'label muted' }, 'Pitfalls'),
        h('ul', null, problem.pitfalls.map(pitfall => h('li', null, rich(pitfall))))) : null)
    reveal.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const index = problems.findIndex(other => other.id === problem.id)
  const prev = problems[index - 1]
  const next = problems[index + 1]

  container.append(h('div', { class: 'page problem-detail' },
    h('div', { class: 'page-header row' },
      h('a', { class: 'btn btn-ghost', href: '#/problems' }, '←'),
      problem.lc ? h('span', { class: 'mono muted lc-num' }, `#${problem.lc}`) : null,
      h('h1', null, stripMarks(problem.title)),
      problem.difficulty ? h('span', { class: `pill ${difficultyClass(problem.difficulty)}` }, problem.difficulty) : null,
      companyChips(companiesFor(problem), { size: 'sm' })),
    h('div', { class: 'card statement-card' },
      problem.constraints ? h('div', { class: 'constraints mono' }, problem.constraints) : null,
      problem.signals?.length ? h('div', { class: 'row signals' }, problem.signals.map(signal => h('span', { class: 'chip chip-signal' }, rich(signal)))) : null,
      problem.lc ? h('a', { class: 'muted lc-link', href: `https://leetcode.com/problems/${slugify(problem.title)}/`, target: '_blank', rel: 'noopener' }, 'Open on LeetCode ↗') : null),
    steps.length ? h('div', { class: 'row diag-head' }, h('h3', null, 'Diagnose first'), scoreEl, skipButton) : null,
    stepHost,
    reveal,
    h('div', { class: 'row problem-pager' },
      prev ? h('a', { class: 'btn btn-ghost', href: `#/problems/${encodeURIComponent(prev.id)}` }, `← ${stripMarks(prev.title)}`) : h('span'),
      next ? h('a', { class: 'btn btn-ghost', href: `#/problems/${encodeURIComponent(next.id)}` }, `${stripMarks(next.title)} →`) : null)))

  showStep(0)
}

const slugify = title => String(title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export default function render(container, params = {}) {
  clear(container)
  if (params.id) {
    const id = decodeParam(params.id)
    const problem = problemById[id] || problems.find(other => String(other.lc) === id)
    if (problem) return renderDetail(container, problem)
    container.append(h('div', { class: 'page' }, h('div', { class: 'empty card' }, 'Problem not found. ', h('a', { href: '#/problems' }, 'All problems'))))
    return
  }
  renderList(container)
}
