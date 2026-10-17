import { h, toast, confetti } from '../ui/h.js'
import { icon } from '../ui/icons.js'
import { codeBlock } from '../ui/code.js'
import { getState, update, recordAnswer } from '../store.js'
import { problems } from '../content/index.js'
import { framework, phrases, rubric, interviewTips, blockKinds, splitSolution, templates } from '../content/narration.js'
import { rich, stripMarks } from '../ui/rich.js'
import { companyChips } from '../ui/companies.js'
import { overrideButton, persistOverride } from '../ui/override.js'
import { companiesFor } from '../content/companies.js'
import { subnav } from '../ui/subnav.js'

const totalMs = 45 * 60 * 1000
const sessionKey = 'mock:session'
let mode = 'sim'

const pool = () => {
  const tagged = problems.filter(problem => companiesFor(problem).length)
  return tagged.length ? tagged : problems
}

const findProblem = id => problems.find(problem => problem.id === id)
const shuffle = list => list.map(value => [Math.random(), value]).sort((a, b) => a[0] - b[0]).map(pair => pair[1])
const randomOf = list => list[Math.floor(Math.random() * list.length)]

const notes = () => getState().notes || {}
const saveNote = (key, value) => update(state => {
  state.notes = state.notes || {}
  if (value === null) delete state.notes[key]
  else state.notes[key] = value
})

const getSession = () => notes()[sessionKey] || null
const saveSession = session => saveNote(sessionKey, session ? JSON.parse(JSON.stringify(session)) : null)

const formatClock = ms => {
  const sign = ms < 0 ? '-' : ''
  const seconds = Math.floor(Math.abs(ms) / 1000)
  return `${sign}${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

const normalizeBigO = text => (text || '')
  .toLowerCase()
  .replace(/\s+/g, '')
  .replace(/[·×]/g, '*')
  .replace(/^o\(/, '')
  .replace(/\)$/, '')
  .replace(/\*\*/g, '^')
  .replace(/n\*logn/g, 'nlogn')
  .replace(/\(v\+e\)\*?log/g, '(v+e)log')

const tabInserter = event => {
  if (event.key !== 'Tab') return
  event.preventDefault()
  const area = event.target
  const { selectionStart, selectionEnd, value } = area
  area.value = value.slice(0, selectionStart) + '    ' + value.slice(selectionEnd)
  area.selectionStart = area.selectionEnd = selectionStart + 4
  area.dispatchEvent(new Event('input'))
}

const tabsBar = rerender => h('div', { class: 'row mk-tabs' },
  [['sim', 'Simulator'], ['narrate', 'Narrate drill'], ['history', 'History'], ['tips', 'Cheat lines']].map(([id, label]) =>
    h('button', { class: `chip ${mode === id ? 'active' : ''}`, onclick: () => { mode = id; rerender() } }, label)))

const problemMeta = problem => h('div', { class: 'row mk-meta' },
  problem.lc ? h('span', { class: 'pill' }, `#${problem.lc}`) : null,
  h('span', { class: `pill mk-diff-${(problem.difficulty || '').toLowerCase()}` }, problem.difficulty || '—'),
  companyChips(companiesFor(problem), { size: 'xs' }))

const renderPicker = (root, rerender) => {
  const list = pool()
  if (!list.length) {
    root.append(h('div', { class: 'empty card' }, 'No problems loaded yet.'))
    return
  }
  const start = problem => {
    saveSession({ problemId: problem.id, startedAt: Date.now(), phaseIndex: 0, checks: {}, answers: {}, revealed: {} })
    rerender()
  }
  const search = h('input', { class: 'mk-search', placeholder: 'Filter problems…', type: 'search' })
  const listEl = h('div', { class: 'mk-problem-list' })
  const drawList = () => {
    const query = search.value.trim().toLowerCase()
    listEl.replaceChildren(...list
      .filter(problem => !query || `${problem.title} ${problem.lc} ${problem.pattern}`.toLowerCase().includes(query))
      .slice(0, 60)
      .map(problem => h('button', { class: 'mk-problem-row', onclick: () => start(problem) },
        h('span', { class: 'mk-problem-title' }, stripMarks(problem.title)),
        h('span', { class: 'muted hb-small' }, problem.difficulty || ''))))
  }
  search.addEventListener('input', drawList)
  drawList()
  root.append(h('div', { class: 'mk-picker' },
    h('div', { class: 'card mk-hero' },
      h('div', { class: 'mk-hero-clock' }, '45:00'),
      h('div', { class: 'muted' }, `${framework.length} phases · 4 rubric axes`),
      h('div', { class: 'row mk-phase-dots' }, framework.map(step => h('span', { class: 'chip', title: step.title }, icon(step.icon, 13), ` ${step.minutes}m`))),
      h('button', { class: 'btn btn-primary mk-big', onclick: () => start(randomOf(list)) }, 'Random problem')),
    h('div', { class: 'card stack' }, h('strong', null, 'Or choose'), search, listEl)))
}

const phaseExtras = (phase, problem, session, persist) => {
  const reveal = (key, label, content) => session.revealed[key]
    ? h('div', { class: 'mk-reveal' }, content)
    : h('button', { class: 'btn btn-ghost', onclick: () => { session.revealed[key] = true; persist(true) } }, label)

  if (phase.id === 'clarify') {
    return h('div', { class: 'stack' },
      problem.problem || problem.statement
        ? h('div', { class: 'mk-statement' }, rich(problem.problem || problem.statement))
        : h('div', { class: 'mk-statement stack-sm' },
          h('b', null, problem.lc ? `LC ${problem.lc} · ${stripMarks(problem.title)}` : stripMarks(problem.title)),
          problem.constraints ? h('span', { class: 'mono small' }, problem.constraints) : null,
          problem.signals?.length ? h('span', { class: 'muted small' }, 'Prompt mentions: ', rich(problem.signals.join(' · '))) : null,
          problem.lc ? h('a', { class: 'small', href: `https://leetcode.com/problems/${problem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}/`, target: '_blank', rel: 'noopener' }, `Open LC #${problem.lc} statement ↗`) : null),
      problem.pitfalls?.length ? reveal('pitfalls', 'Questions worth asking', h('ul', { class: 'mk-list' }, problem.pitfalls.map(item => h('li', null, rich(item))))) : null)
  }
  if (phase.id === 'constraints') {
    const target = h('input', { class: 'mk-input', placeholder: 'Target, e.g. O(n log n)', value: session.answers.target || '' })
    target.addEventListener('change', () => { session.answers.target = target.value; persist() })
    return h('div', { class: 'stack' },
      h('div', { class: 'mk-constraint' }, h('span', { class: 'chip' }, 'constraints'), problem.constraints || 'Ask the interviewer'),
      target,
      h('a', { class: 'muted hb-small', href: '#/handbook/big-o' }, 'n → Big-O table'))
  }
  if (phase.id === 'brute') {
    return reveal('signals', 'Show prompt signals', h('div', { class: 'row' }, (problem.signals || ['none listed']).map(signal => h('span', { class: 'chip' }, rich(signal)))))
  }
  if (phase.id === 'optimize') {
    return h('div', { class: 'stack' },
      reveal('pattern', 'Hint: pattern', h('div', { class: 'row' }, h('span', { class: 'pill' }, rich(problem.pattern || '?')), (problem.ds || []).map(item => h('span', { class: 'pill' }, rich(item))))),
      session.revealed.pattern ? reveal('insight', 'Hint: key insight', h('div', null, rich(problem.insight || '—'))) : null)
  }
  if (phase.id === 'code') {
    const template = templates.find(item => (problem.skills || []).some(skill => item.skills.includes(skill)))
    return h('div', { class: 'stack' },
      template ? h('div', { class: 'mk-template' }, h('div', { class: 'hb-small muted' }, `${stripMarks(template.title)} lines`),
        template.lines.slice(0, 5).map(line => h('div', { class: 'hb-say' }, h('span', { class: 'chip' }, stripMarks(line.cue)), h('span', null, rich(line.say))))) : null,
      problem.solution ? reveal('solution', 'Peek at solution', codeBlock(problem.solution)) : null)
  }
  if (phase.id === 'test') {
    return reveal('edges', 'Show edge cases', h('ul', { class: 'mk-list' }, (problem.pitfalls?.length ? problem.pitfalls : ['empty input', 'single element', 'all equal', 'max size']).map(item => h('li', null, rich(item)))))
  }
  if (phase.id === 'complexity') {
    const time = h('input', { class: 'mk-input', placeholder: 'Time  O(…)', value: session.answers.time || '' })
    const space = h('input', { class: 'mk-input', placeholder: 'Space  O(…)', value: session.answers.space || '' })
    const result = h('div', { class: 'mk-complexity-result' })
    const drawResult = () => {
      if (!session.answers.checked) return
      const timeOk = normalizeBigO(session.answers.time) === normalizeBigO(problem.time)
      const spaceOk = normalizeBigO(session.answers.space) === normalizeBigO(problem.space)
      const overridden = Boolean(session.answers.overridden)
      const tone = ok => ok || overridden ? 'good' : 'bad'
      const overrideRow = !overridden && !(timeOk && spaceOk)
        ? h('div', { class: 'row' }, overrideButton({
          onOverride: () => {
            session.answers.overridden = true
            session.answers.complexityCorrect = true
            persistOverride({ itemId: `mock:complexity:${problem.id}`, kind: 'mcq', skills: ['complexity', 'constraints'] })
            persist()
            drawResult()
          },
        }))
        : overridden ? h('div', { class: 'row' }, h('span', { class: 'pill pill-green override-pill' }, icon('check', 13), ' Counted as correct')) : null
      result.replaceChildren(
        h('div', { class: `mk-cmp ${tone(timeOk)}` }, h('span', null, 'Time'), h('span', null, session.answers.time || '—'), h('span', null, '→'), h('strong', null, problem.time || '?')),
        h('div', { class: `mk-cmp ${tone(spaceOk)}` }, h('span', null, 'Space'), h('span', null, session.answers.space || '—'), h('span', null, '→'), h('strong', null, problem.space || '?')),
        overrideRow)
    }
    const check = () => {
      session.answers.time = time.value
      session.answers.space = space.value
      const firstCheck = !session.answers.checked
      session.answers.checked = true
      const correct = normalizeBigO(time.value) === normalizeBigO(problem.time) && normalizeBigO(space.value) === normalizeBigO(problem.space)
      session.answers.complexityCorrect = correct
      if (firstCheck) recordAnswer({ itemId: `mock:complexity:${problem.id}`, kind: 'mcq', skills: ['complexity', 'constraints'], correct })
      toast(correct ? 'Both match' : 'Compare with the answer', correct ? 'good' : 'bad')
      persist()
      drawResult()
    }
    drawResult()
    return h('div', { class: 'stack' }, h('div', { class: 'row mk-cx-inputs' }, time, space, h('button', { class: 'btn btn-primary', onclick: check }, 'Check')), result)
  }
  return null
}

const renderRubric = (root, problem, session, rerender) => {
  const ratings = session.ratings || {}
  const reflection = h('textarea', { class: 'mk-reflection', placeholder: 'One thing to do better next time', rows: 2 }, session.reflection || '')
  const save = () => {
    if (rubric.some(axis => !ratings[axis.id])) {
      toast('Rate all four axes', 'bad')
      return
    }
    const entry = {
      id: `${Date.now()}`, problemId: problem.id, title: problem.title, date: Date.now(),
      durationMs: Date.now() - session.startedAt, ratings: { ...ratings }, reflection: reflection.value,
      complexityCorrect: session.answers.complexityCorrect ?? null,
    }
    update(state => {
      state.mockHistory = state.mockHistory || []
      state.mockHistory.unshift(entry)
    })
    recordAnswer({ itemId: `mock:session:${problem.id}`, kind: 'mock', skills: ['communication'], correct: ratings.communication >= 3 })
    saveSession(null)
    confetti?.()
    toast('Saved to history', 'good')
    mode = 'history'
    rerender()
  }
  root.append(h('div', { class: 'card mk-rubric stack' },
    h('h2', null, 'Self-rating'),
    h('div', { class: 'muted hb-small' }, '1 = no hire signal · 4 = strong hire'),
    rubric.map(axis => {
      const buttons = [1, 2, 3, 4].map(score => h('button', {
        class: `mk-score ${ratings[axis.id] === score ? 'active' : ''}`,
        onclick: () => {
          ratings[axis.id] = score
          session.ratings = ratings
          buttons.forEach((button, index) => button.classList.toggle('active', index + 1 === score))
        },
      }, score))
      return h('div', { class: 'mk-axis' }, h('div', null, h('strong', null, stripMarks(axis.label)), h('div', { class: 'muted hb-small' }, rich(axis.hint))), h('div', { class: 'row' }, buttons))
    }),
    reflection,
    h('div', { class: 'row' },
      h('button', { class: 'btn btn-primary', onclick: save }, 'Save'),
      h('button', { class: 'btn btn-ghost', onclick: () => { session.rating = false; session.phaseIndex = framework.length - 1; saveSession(session); rerender() } }, 'Back'))))
}

const renderSession = (root, session, rerender, timers) => {
  const problem = findProblem(session.problemId)
  if (!problem) {
    saveSession(null)
    rerender()
    return
  }
  const persist = redraw => {
    saveSession(session)
    if (redraw) rerender()
  }
  const clock = h('div', { class: 'mk-clock' })
  const bar = h('div', { class: 'mk-time-bar' })
  const tick = () => {
    const elapsed = Date.now() - session.startedAt
    const left = totalMs - elapsed
    clock.textContent = formatClock(left)
    clock.classList.toggle('over', left < 0)
    clock.classList.toggle('low', left >= 0 && left < 5 * 60 * 1000)
    const expectedPhase = (() => {
      let sum = 0
      for (const [index, step] of framework.entries()) {
        sum += step.minutes * 60 * 1000
        if (elapsed < sum) return index
      }
      return framework.length - 1
    })()
    bar.style.width = `${Math.min(100, (elapsed / totalMs) * 100)}%`
    tracker.querySelectorAll('.mk-phase').forEach((el, index) => el.classList.toggle('expected', index === expectedPhase))
  }

  const tracker = h('div', { class: 'mk-tracker' }, framework.map((step, index) => h('button', {
    class: `mk-phase ${index === session.phaseIndex ? 'current' : ''} ${index < session.phaseIndex ? 'done' : ''}`,
    onclick: () => { session.phaseIndex = index; session.rating = false; persist(true) },
  }, h('span', { class: 'mk-phase-icon' }, icon(step.icon, 16)), h('span', { class: 'mk-phase-label' }, step.title))))

  const header = h('div', { class: 'card mk-head' },
    h('div', { class: 'mk-head-main' },
      h('div', null, h('h2', { class: 'mk-title' }, stripMarks(problem.title)), problemMeta(problem)),
      h('div', { class: 'mk-clock-wrap' }, clock, h('div', { class: 'mk-time-track' }, bar))),
    tracker)

  const scratch = h('textarea', { class: 'mk-scratch', spellcheck: 'false', placeholder: 'class Solution:\n    def solve(self, nums: List[int]) -> int:\n' }, notes()[problem.id] || '')
  let saveTimer = null
  scratch.addEventListener('keydown', tabInserter)
  scratch.addEventListener('input', () => {
    clearTimeout(saveTimer)
    saveTimer = setTimeout(() => saveNote(problem.id, scratch.value), 400)
  })
  timers.push(() => { clearTimeout(saveTimer); saveNote(problem.id, scratch.value) })

  if (session.rating) {
    root.append(header)
    renderRubric(root, problem, session, rerender)
    tick()
    timers.push((id => () => clearInterval(id))(setInterval(tick, 1000)))
    return
  }

  const phase = framework[session.phaseIndex]
  const checks = session.checks[phase.id] || []
  const checklist = h('div', { class: 'mk-checklist' }, phase.checklist.map((item, index) => {
    const box = h('input', { type: 'checkbox', checked: !!checks[index] })
    box.addEventListener('change', () => {
      session.checks[phase.id] = session.checks[phase.id] || []
      session.checks[phase.id][index] = box.checked
      persist()
    })
    return h('label', { class: 'hb-check' }, box, h('span', null, item))
  }))
  const starters = h('div', { class: 'mk-starters' }, phase.starters.map(line => h('button', {
    class: 'mk-starter',
    title: 'Copy',
    onclick: () => navigator.clipboard?.writeText(line).then(() => toast('Copied', 'good')).catch(() => {}),
  }, `“${stripMarks(line)}”`)))

  const isLast = session.phaseIndex === framework.length - 1
  const phaseCard = h('div', { class: 'card mk-phase-card stack' },
    h('div', { class: 'mk-phase-top' },
      h('span', { class: 'mk-phase-big' }, icon(phase.icon, 28)),
      h('div', null, h('div', { class: 'muted hb-small' }, `Phase ${session.phaseIndex + 1}/${framework.length} · ${phase.minutes} min`), h('h3', { class: 'mk-phase-title' }, phase.title))),
    h('div', { class: 'mk-goal' }, phase.goal),
    checklist,
    h('div', { class: 'hb-small muted' }, 'Say'),
    starters,
    phaseExtras(phase, problem, session, persist),
    h('div', { class: 'row mk-nav' },
      session.phaseIndex > 0 ? h('button', { class: 'btn btn-ghost', onclick: () => { session.phaseIndex -= 1; persist(true) } }, '← Back') : null,
      isLast
        ? h('button', { class: 'btn btn-primary', onclick: () => { session.rating = true; persist(true) } }, 'Finish & rate')
        : h('button', { class: 'btn btn-primary', onclick: () => { session.phaseIndex += 1; persist(true) } }, 'Next phase →'),
      h('button', { class: 'btn btn-ghost mk-abandon', onclick: () => { if (confirm('Abandon this mock?')) { saveSession(null); rerender() } } }, 'Abandon')))

  root.append(header, h('div', { class: 'mk-body' }, phaseCard,
    h('div', { class: 'card mk-scratch-card' },
      h('div', { class: 'row mk-scratch-head' }, h('strong', null, 'Scratchpad'), h('span', { class: 'muted hb-small' }, 'autosaves · Tab = 4 spaces')),
      scratch)))
  tick()
  timers.push((id => () => clearInterval(id))(setInterval(tick, 1000)))
}

const narrationQueue = () => shuffle(problems.filter(problem => problem.solution && splitSolution(problem.solution).filter(block => block.kind !== 'imports').length >= 2))

let drill = null

const renderNarrate = (root, rerender) => {
  if (!drill || drill.finished === 'next') {
    const queue = narrationQueue()
    if (!queue.length) {
      root.append(h('div', { class: 'empty card' }, 'No solutions loaded yet.'))
      return
    }
    const problem = queue[0]
    const blocks = splitSolution(problem.solution).filter(block => block.kind !== 'imports')
    drill = { problem, blocks, index: 0, score: 0, picked: null, choices: null }
  }
  const { problem, blocks } = drill
  if (drill.index >= blocks.length) {
    root.append(h('div', { class: 'card stack mk-narrate-done' },
      h('h2', null, `${drill.score}/${blocks.length} blocks narrated right`),
      problem.narration?.length ? h('div', { class: 'stack' }, h('div', { class: 'muted hb-small' }, 'Full narration'), problem.narration.map(line => h('div', { class: 'hb-say' }, h('span', null, '“', rich(line), '”')))) : null,
      h('button', { class: 'btn btn-primary', onclick: () => { drill.finished = 'next'; rerender() } }, 'Next problem')))
    return
  }
  const block = blocks[drill.index]
  if (!drill.choices) {
    const others = shuffle(Object.keys(blockKinds).filter(kind => kind !== block.kind)).slice(0, 3)
    drill.choices = shuffle([block.kind, ...others])
  }
  const code = codeBlock(problem.solution, { highlightLine: block.start, dimOthers: true })
  for (let line = block.start; line <= block.end; line += 1) code.querySelectorAll?.(`[data-line="${line}"]`).forEach(el => el.classList.add('mk-block-line'))
  const choose = kind => {
    if (drill.picked) return
    drill.picked = kind
    const correct = kind === block.kind
    if (correct) drill.score += 1
    recordAnswer({ itemId: `narrate:${problem.id}:${drill.index}`, kind: 'mcq', skills: ['communication'], correct })
    rerender()
  }
  const next = () => {
    drill.index += 1
    drill.picked = null
    drill.choices = null
    rerender()
  }
  root.append(h('div', { class: 'mk-narrate' },
    h('div', { class: 'card stack' },
      h('div', { class: 'row mk-narrate-head' }, h('strong', null, stripMarks(problem.title)), h('span', { class: 'pill' }, `Block ${drill.index + 1}/${blocks.length}`), h('span', { class: 'pill' }, `Lines ${block.start}-${block.end}`)),
      h('div', { class: 'mk-block-preview' }, codeBlock(block.text, { lineNumbers: false })),
      h('details', { class: 'mk-full' }, h('summary', { class: 'muted hb-small' }, 'Full solution'), code)),
    h('div', { class: 'card stack' },
      h('div', { class: 'muted hb-small' }, 'What do you SAY while writing this block?'),
      drill.choices.map(kind => h('button', {
        class: `mk-choice ${drill.picked ? (kind === block.kind ? 'good' : kind === drill.picked ? 'bad' : 'faded') : ''}`,
        onclick: () => choose(kind),
      }, stripMarks(blockKinds[kind]))),
      drill.picked ? h('button', { class: 'btn btn-primary', onclick: next }, drill.index + 1 < blocks.length ? 'Next block →' : 'Finish') : null)))
}

const renderHistory = root => {
  const history = getState().mockHistory || []
  if (!history.length) {
    root.append(h('div', { class: 'empty card' }, 'No mocks yet. Run one, then rate yourself.'))
    return
  }
  const averages = rubric.map(axis => {
    const values = history.map(entry => entry.ratings?.[axis.id]).filter(Boolean)
    return [axis, values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0]
  })
  root.append(
    h('div', { class: 'card mk-averages' }, averages.map(([axis, value]) => h('div', { class: 'mk-avg' },
      h('div', { class: 'muted hb-small' }, stripMarks(axis.label)),
      h('div', { class: 'mk-avg-value' }, value.toFixed(1)),
      h('div', { class: 'progress' }, h('div', { style: { width: `${(value / 4) * 100}%` } }))))),
    h('div', { class: 'stack' }, history.map(entry => h('div', { class: 'card mk-history-row' },
      h('div', null,
        h('strong', null, stripMarks(entry.title)),
        h('div', { class: 'muted hb-small' }, `${new Date(entry.date).toLocaleString()} · ${Math.round(entry.durationMs / 60000)} min`),
        entry.reflection ? h('div', { class: 'hb-small' }, entry.reflection) : null),
      h('div', { class: 'row' }, rubric.map(axis => h('span', { class: `mk-rating r${entry.ratings?.[axis.id] || 0}`, title: axis.label }, `${axis.label[0]}${entry.ratings?.[axis.id] || '-'}`)),
        entry.complexityCorrect === null ? null : h('span', { class: `pill ${entry.complexityCorrect ? 'mk-ok' : 'mk-miss'}` }, 'Big-O'))))))
}

const renderTips = root => {
  root.append(h('div', { class: 'grid mk-tips' },
    interviewTips.map(tip => h('div', { class: 'card' }, h('strong', null, stripMarks(tip.title)), h('div', { class: 'muted hb-small' }, rich(tip.text)))),
    Object.entries(phrases).map(([group, lines]) => h('div', { class: 'card stack' },
      h('strong', null, group.replace(/([A-Z])/g, ' $1').replace(/^./, char => char.toUpperCase())),
      lines.map(line => h('div', { class: 'hb-small' }, '“', rich(line), '”'))))))
}

export default function render(container) {
  const cleanups = []
  const runCleanups = () => { while (cleanups.length) cleanups.pop()() }
  const rerender = () => {
    runCleanups()
    container.replaceChildren()
    const body = h('div')
    container.append(h('div', { class: 'page mk-page' },
      subnav('practice', 'mock'),
      h('div', { class: 'page-header' }, h('h1', null, 'Mock interview'), tabsBar(rerender)),
      body))
    if (mode === 'sim') {
      const session = getSession()
      if (session) renderSession(body, session, rerender, cleanups)
      else renderPicker(body, rerender)
    } else if (mode === 'narrate') renderNarrate(body, rerender)
    else if (mode === 'history') renderHistory(body)
    else renderTips(body)
  }
  rerender()
  return runCleanups
}
