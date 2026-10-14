import { h, clear, confetti } from '../ui/h.js'
import { codeBlock } from '../ui/code.js'
import { renderMcq } from '../ui/items.js'
import { createSignatureEditor } from '../ui/signature.js'
import { persistOverride } from '../ui/override.js'
import { rich, stripMarks } from '../ui/rich.js'
import { recordAnswer, markSeen, isSeen } from '../store.js'
import { subnav } from '../ui/subnav.js'

const commonTimes = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n^2)', 'O(n^3)', 'O(2^n)', 'O(n!)', 'O(V+E)', 'O(m·n)', 'O(n·k)', 'O(E log V)', 'O(n log k)', 'O(√n)']
const drillSize = 16

let statementsPromise = null

function loadStatements() {
  if (statementsPromise) return statementsPromise
  statementsPromise = Promise.all([
    import('../content/statements-a.js').catch(() => null),
    import('../content/statements-b.js').catch(() => null),
  ]).then(mods => {
    const byId = new Map()
    for (const mod of mods) {
      const bank = mod?.default
      if (!bank?.statements?.length) continue
      for (const st of bank.statements) if (!byId.has(st.id)) byId.set(st.id, { ...st, bank: bank.id })
    }
    return [...byId.values()]
  })
  return statementsPromise
}

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

const seen = id => {
  try { return isSeen(id) } catch { return false }
}

const normalizeTime = text => String(text || '').replace(/\s+/g, '').replace(/[·*×]/g, '').toLowerCase()

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

const difficultyClass = difficulty => `diff-${String(difficulty || '').toLowerCase()}`

export function chunkStatement(text) {
  const chunks = []
  const re = /[^.,;:!?]*[.,;:!?]+|[^.,;:!?]+$/g
  let match
  while ((match = re.exec(String(text || '')))) {
    const token = match[0]
    const trimmed = token.trim()
    if (!trimmed) continue
    const leading = token.length - token.trimStart().length
    const start = match.index + leading
    chunks.push({ start, end: start + trimmed.length, text: trimmed })
  }
  return chunks
}

export function groupParagraphs(chunks, fullText) {
  const groups = []
  let current = []
  chunks.forEach((chunk, ci) => {
    if (ci > 0) {
      const gap = fullText.slice(chunks[ci - 1].end, chunk.start)
      if (/\n[ \t]*\n/.test(gap)) {
        groups.push(current)
        current = []
      }
    }
    current.push(ci)
  })
  if (current.length) groups.push(current)
  return groups
}

export function matchSignals(chunks, signals, fullText) {
  const lower = String(fullText || '').toLowerCase()
  const chunkFlags = chunks.map(() => ({ isSignal: false, items: [] }))
  const results = (signals || []).map(sig => {
    const phrase = String(sig.phrase || '').trim()
    if (!phrase) return { sig, hit: null, chunkIndices: [] }
    const idx = lower.indexOf(phrase.toLowerCase())
    if (idx === -1) return { sig, hit: null, chunkIndices: [] }
    const end = idx + phrase.length
    const overlapping = []
    chunks.forEach((chunk, ci) => {
      if (chunk.start < end && chunk.end > idx) {
        overlapping.push(ci)
        chunkFlags[ci].isSignal = true
        chunkFlags[ci].items.push(sig)
      }
    })
    return { sig, hit: false, chunkIndices: overlapping }
  })
  return { chunkFlags, results }
}

function renderExample(example, index) {
  return h('div', { class: 'rd-example' },
    h('div', { class: 'rd-example-title' }, `Example ${index + 1}`),
    h('div', { class: 'rd-example-row' }, h('b', null, 'Input: '), h('code', null, String(example.input ?? ''))),
    h('div', { class: 'rd-example-row' }, h('b', null, 'Output: '), h('code', null, String(example.output ?? ''))),
    example.explanation ? h('div', { class: 'rd-example-row muted' }, h('b', null, 'Explanation: '), rich(example.explanation)) : null)
}

function statementPlainText(statement) {
  return stripMarks(statement.statement || '')
}

function renderReadStep(stage, statement, onDone) {
  const fullText = statementPlainText(statement)
  const chunks = chunkStatement(fullText)
  const pickedIndices = new Set()
  const started = performance.now()
  let revealed = false

  const timerEl = h('span', { class: 'mono rd-timer' }, '0:00')
  const timerHandle = setInterval(() => {
    const secs = Math.floor((performance.now() - started) / 1000)
    timerEl.textContent = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`
  }, 500)

  const chunkEls = chunks.map((chunk, ci) => h('span', {
    class: 'rd-chunk',
    tabindex: '0',
    'data-ci': String(ci),
    onclick: () => { if (!revealed) toggle(ci) },
    onkeydown: event => {
      if (!revealed && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault()
        toggle(ci)
      }
    },
  }, `${chunk.text} `))

  function toggle(ci) {
    if (pickedIndices.has(ci)) pickedIndices.delete(ci)
    else pickedIndices.add(ci)
    chunkEls[ci].classList.toggle('picked', pickedIndices.has(ci))
  }

  const paraGroups = groupParagraphs(chunks, fullText)
  const chunkHost = h('div', { class: 'rd-statement' }, paraGroups.map(group => h('p', { class: 'rd-para' }, group.map(ci => chunkEls[ci]))))
  chunkHost.addEventListener('mouseup', () => {
    if (revealed) return
    const selection = window.getSelection?.()
    if (!selection || selection.isCollapsed || !chunkHost.contains(selection.anchorNode)) return
    const range = selection.getRangeAt(0)
    chunkEls.forEach((el, ci) => {
      if (!pickedIndices.has(ci) && range.intersectsNode?.(el)) toggle(ci)
    })
    selection.removeAllRanges()
  })

  const legendEl = h('div', { class: 'rd-legend' })
  const scoreChip = h('span', { class: 'pill rd-score-chip' })
  const continueBtn = h('button', { class: 'btn btn-primary', disabled: true, onclick: () => onDone() }, 'Continue to quiz →')

  const revealBtn = h('button', { class: 'btn btn-primary', onclick: () => reveal() }, 'Reveal signals')

  function reveal() {
    if (revealed) return
    revealed = true
    clearInterval(timerHandle)
    revealBtn.remove()
    const ms = performance.now() - started
    const { chunkFlags, results } = matchSignals(chunks, statement.signals, fullText)
    chunkEls.forEach((el, ci) => {
      el.classList.add('rd-frozen')
      el.classList.toggle('rd-signal', chunkFlags[ci].isSignal)
      el.classList.toggle('rd-hit', chunkFlags[ci].isSignal && pickedIndices.has(ci))
      el.classList.toggle('rd-missed', chunkFlags[ci].isSignal && !pickedIndices.has(ci))
      el.classList.toggle('rd-extra', !chunkFlags[ci].isSignal && pickedIndices.has(ci))
    })
    const grounded = results.filter(r => r.hit !== null).map(r => ({ ...r, hit: r.chunkIndices.some(ci => pickedIndices.has(ci)) }))
    const hits = grounded.filter(r => r.hit).length
    const falsePositives = [...pickedIndices].filter(ci => !chunkFlags[ci].isSignal).length
    legendEl.replaceChildren(...results.map(r => h('div', { class: `rd-legend-item${r.hit === null ? '' : r.hit ? ' good' : ' bad'}` },
      h('span', { class: 'rd-legend-phrase' }, r.sig.phrase),
      h('span', { class: 'rd-legend-arrow' }, '→'),
      h('span', { class: 'rd-legend-means' }, rich(r.sig.means)))))
    const correct = grounded.length > 0 && hits === grounded.length && falsePositives === 0
    scoreChip.textContent = grounded.length ? `${hits}/${grounded.length} signals${falsePositives ? ` · ${falsePositives} extra` : ''}` : 'no signals tagged'
    scoreChip.classList.add(correct ? 'pill-green' : 'pill-amber')
    try { recordAnswer({ itemId: `${statement.id}:read`, kind: 'read', skills: statement.skills || [], correct, ms: Math.round(ms) }) } catch {}
    if (correct && grounded.length) confetti()
    continueBtn.disabled = false
  }

  stage.append(h('div', { class: 'stack' },
    h('div', { class: 'row spread rd-read-head' },
      h('span', { class: 'muted small' }, 'Click phrases you think matter, or drag to select a few words'),
      h('span', { class: 'row' }, h('span', { class: 'icon' }, '⏱'), timerEl)),
    h('div', { class: 'card rd-statement-card' }, chunkHost),
    statement.examples?.length ? h('div', { class: 'grid-2 rd-examples' }, statement.examples.map(renderExample)) : null,
    statement.constraints?.length ? h('div', { class: 'card constraints' },
      h('div', { class: 'label muted' }, 'Constraints'),
      h('ul', { class: 'rd-constraints-list mono' }, statement.constraints.map(c => h('li', null, c)))) : null,
    statement.followUp ? h('div', { class: 'muted small rd-followup' }, h('b', null, 'Follow-up: '), rich(statement.followUp)) : null,
    h('div', { class: 'row' }, revealBtn, scoreChip),
    legendEl,
    h('div', { class: 'row rd-step-actions' }, continueBtn)))

  return () => clearInterval(timerHandle)
}

function renderExtractStep(stage, statement, allStatements, onDone) {
  const others = allStatements.filter(other => other.id !== statement.id)
  const keyInfo = statement.keyInfo || {}
  const ioCorrect = `${keyInfo.input ?? '?'} → ${keyInfo.output ?? '?'}`
  const ioCandidates = others.map(other => `${other.keyInfo?.input ?? '?'} → ${other.keyInfo?.output ?? '?'}`)
  const steps = []

  steps.push({
    label: 'Input / output',
    skills: [...(statement.skills || []), 'communication'],
    item: (() => {
      const { choices, answer } = buildChoices(ioCorrect, ioCandidates)
      return { id: `${statement.id}:extract:io`, q: 'What does this function take in, and return?', choices, answer, why: keyInfo.target ? `Target: ${keyInfo.target}` : ioCorrect }
    })(),
  })

  if (statement.time) {
    const { choices, answer } = buildChoices(statement.time, [...others.map(o => o.time), ...commonTimes], normalizeTime)
    steps.push({
      label: 'Target complexity',
      skills: ['constraints', 'communication'],
      item: { id: `${statement.id}:extract:time`, q: 'Target time complexity from the constraints?', choices, answer, why: `${statement.time} time${statement.space ? `, ${statement.space} space` : ''}` },
    })
  }

  if (statement.pattern) {
    const { choices, answer } = buildChoices(statement.pattern, others.map(o => o.pattern))
    steps.push({
      label: 'Pattern',
      skills: [...(statement.skills || []), 'communication'],
      item: { id: `${statement.id}:extract:pattern`, q: 'Which pattern fits this problem?', choices, answer, why: (statement.signals || []).map(s => s.phrase).join(', ') || statement.pattern },
    })
  }

  const scoreEl = h('div', { class: 'row diag-score' })
  const stepHost = h('div', { class: 'stack diag-steps' })
  const results = []

  function drawScore() {
    scoreEl.replaceChildren(...steps.map((step, i) => h('span', {
      class: `chip diag-chip${results[i] === true ? ' good' : results[i] === false ? ' bad' : i === results.length ? ' active' : ''}`,
    }, `${i + 1}. ${step.label}`)))
  }

  function showStep(i) {
    drawScore()
    if (i >= steps.length) {
      onDone()
      return
    }
    const step = steps[i]
    const wrapper = h('div', { class: 'card diag-step' }, h('div', { class: 'diag-step-label muted' }, `${i + 1} / ${steps.length} · ${step.label}`))
    wrapper.append(renderMcq(step.item, ({ correct, ms }) => {
      results[i] = correct
      try { recordAnswer({ itemId: step.item.id, kind: 'mcq', skills: step.skills, correct, ms }) } catch {}
      drawScore()
      setTimeout(() => showStep(i + 1), correct ? 450 : 1000)
    }))
    stepHost.append(wrapper)
    wrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  stage.append(h('div', { class: 'stack' },
    h('div', { class: 'row diag-head' }, h('h3', null, 'Extract'), scoreEl),
    stepHost))
  showStep(0)
}

function renderStatementPanel(statement) {
  const paragraphs = statementPlainText(statement).split(/\n\n+/).filter(Boolean)
  return h('div', { class: 'card rd-side-statement' },
    h('div', { class: 'row spread' }, h('h3', null, stripMarks(statement.title)), statement.difficulty ? h('span', { class: 'pill' }, statement.difficulty) : null),
    ...paragraphs.map(text => h('p', null, rich(text))),
    ...(statement.examples || []).map(renderExample),
    statement.constraints?.length ? h('div', { class: 'rd-side-constraints' },
      h('div', { class: 'label muted' }, 'Constraints'),
      h('ul', null, ...statement.constraints.map(line => h('li', null, h('code', null, line))))) : null,
    statement.followUp ? h('div', { class: 'muted' }, h('b', null, 'Follow-up: '), rich(statement.followUp)) : null)
}

function renderSignStep(stage, statement, onDone) {
  const oneLiner = statementPlainText(statement).split(/(?<=[.!?])\s+/)[0] || statement.title
  let logged = false
  const continueBtn = h('button', { class: 'btn btn-primary', disabled: true, onclick: () => onDone() }, 'Continue to edge cases →')

  const editor = createSignatureEditor(statement.signature, {
    onCheck: (result, attempts) => {
      if (logged) return
      if (result.ok || attempts >= 2) {
        logged = true
        try { recordAnswer({ itemId: `${statement.id}:sign`, kind: 'sign', skills: [...(statement.skills || []), 'communication'], correct: result.ok }) } catch {}
        continueBtn.disabled = false
      }
    },
    onOverride: () => {
      const skills = [...(statement.skills || []), 'communication']
      if (logged) persistOverride({ itemId: `${statement.id}:sign`, kind: 'sign', skills })
      else {
        logged = true
        try { recordAnswer({ itemId: `${statement.id}:sign`, kind: 'sign', skills, correct: true }) } catch {}
      }
      continueBtn.disabled = false
    },
  })

  stage.append(h('div', { class: 'rd-sign-split' },
    renderStatementPanel(statement),
    h('div', { class: 'stack rd-sign-work' },
      h('div', { class: 'card rd-sign-recap' }, h('div', { class: 'label muted' }, 'Write the signature for'), h('div', null, rich(oneLiner))),
      editor.el,
      h('div', { class: 'row rd-step-actions' }, continueBtn))))
}

function renderEdgeStep(stage, statement, allStatements, onDone) {
  const trueCases = [...new Set(statement.edgeCases || [])]
  const poolOther = allStatements.filter(other => other.id !== statement.id).flatMap(other => other.edgeCases || [])
  const trueSet = new Set(trueCases.map(c => c.toLowerCase()))
  const distractors = shuffle([...new Set(poolOther)].filter(c => !trueSet.has(c.toLowerCase()))).slice(0, Math.min(3, Math.max(1, trueCases.length)))
  const options = shuffle([...trueCases.map(text => ({ text, correct: true })), ...distractors.map(text => ({ text, correct: false }))])
  const picked = new Set()
  let checked = false
  const started = performance.now()

  const rows = options.map((opt, i) => {
    const box = h('span', { class: 'check' })
    const row = h('label', {
      class: 'rd-edge-row',
      onclick: event => {
        event.preventDefault()
        if (checked) return
        if (picked.has(i)) picked.delete(i)
        else picked.add(i)
        box.classList.toggle('on', picked.has(i))
      },
    }, box, h('span', null, rich(opt.text)))
    return row
  })
  const boxes = rows.map(row => row.firstChild)

  const feedback = h('div', { class: 'item-why-slot' })
  const checkBtn = h('button', { class: 'btn btn-primary', onclick: () => check() }, 'Check edge cases')
  const finishBtn = h('button', { class: 'btn btn-primary', disabled: true, onclick: () => onDone() }, 'Finish →')

  function check() {
    if (checked || !options.length) return
    checked = true
    const ms = performance.now() - started
    let hits = 0
    let misses = 0
    let extras = 0
    options.forEach((opt, i) => {
      const isPicked = picked.has(i)
      if (opt.correct && isPicked) { hits++; boxes[i].classList.add('on', 'good') }
      else if (opt.correct && !isPicked) { misses++; boxes[i].classList.add('bad') }
      else if (!opt.correct && isPicked) { extras++; boxes[i].classList.add('on', 'bad') }
    })
    checkBtn.disabled = true
    const correct = misses === 0 && extras === 0 && trueCases.length > 0
    feedback.replaceChildren(h('div', { class: `item-why show ${correct ? 'good' : 'bad'}` },
      h('span', { class: 'verdict' }, correct ? 'All edge cases caught' : 'Missed some'),
      h('span', null, `${hits}/${trueCases.length} correct${extras ? `, ${extras} wrong pick${extras > 1 ? 's' : ''}` : ''}`)))
    try { recordAnswer({ itemId: `${statement.id}:edge`, kind: 'read', skills: statement.skills || [], correct, ms: Math.round(ms) }) } catch {}
    finishBtn.disabled = false
  }

  stage.append(h('div', { class: 'stack' },
    h('h3', null, 'Which edge cases apply?'),
    options.length ? h('div', { class: 'card stack-sm rd-edge-list' }, rows) : h('div', { class: 'empty card' }, 'No edge cases listed for this one.'),
    h('div', { class: 'row rd-step-actions' }, options.length ? checkBtn : null, feedback),
    h('div', { class: 'row rd-step-actions' }, finishBtn)))

  if (!options.length) finishBtn.disabled = false
}

function renderSummary(stage, statement, allStatements, { onAnother, onBack }) {
  try { markSeen(`read:${statement.id}`) } catch {}
  const pool = allStatements.filter(other => other.id !== statement.id)
  const unseen = pool.filter(other => !seen(`read:${other.id}`))
  const nextPool = unseen.length ? unseen : pool
  stage.append(h('div', { class: 'card stack rd-summary' },
    h('div', { class: 'row' }, h('div', { class: 'empty-icon' }, '✅'), h('h3', null, 'Statement complete')),
    h('p', { class: 'muted' }, 'Logged to your skill mastery and SRS queue.'),
    h('div', { class: 'row' },
      nextPool.length ? h('button', { class: 'btn btn-primary', onclick: () => onAnother(nextPool[Math.floor(Math.random() * nextPool.length)]) }, 'Another statement →') : null,
      h('a', { class: 'btn btn-ghost', onclick: onBack, href: '#/read' }, 'Back to list'))))
}

const stepTitles = ['Read', 'Extract', 'Sign', 'Edge']

function renderRunner(container, statement, allStatements) {
  clear(container)
  let stepIndex = 0
  let cleanup = null

  const isDesign = statement.signature?.kind === 'class'
  const progressEl = h('div', { class: 'row rd-progress' })
  const stage = h('div', { class: 'rd-stage' })

  function drawProgress() {
    progressEl.replaceChildren(...stepTitles.map((title, i) => h('span', {
      class: `chip diag-chip${i < stepIndex ? ' good' : i === stepIndex ? ' active' : ''}`,
    }, `${i + 1}. ${title}`)))
  }

  function goto(next) {
    if (typeof cleanup === 'function') cleanup()
    cleanup = null
    stepIndex = next
    drawProgress()
    clear(stage)
    if (stepIndex === 0) cleanup = renderReadStep(stage, statement, () => goto(1))
    else if (stepIndex === 1) renderExtractStep(stage, statement, allStatements, () => goto(2))
    else if (stepIndex === 2) renderSignStep(stage, statement, () => goto(3))
    else if (stepIndex === 3) renderEdgeStep(stage, statement, allStatements, () => goto(4))
    else renderSummary(stage, statement, allStatements, {
      onAnother: next => { location.hash = `#/read/${encodeURIComponent(next.id)}` },
      onBack: () => { location.hash = '#/read' },
    })
  }

  container.append(h('div', { class: 'page rd-page' },
    subnav('learn', 'read'),
    h('div', { class: 'page-header row' },
      h('a', { class: 'btn btn-ghost', href: '#/read' }, '←'),
      statement.lc ? h('span', { class: 'mono muted lc-num' }, `#${statement.lc}`) : null,
      h('h1', null, stripMarks(statement.title)),
      statement.difficulty ? h('span', { class: `pill ${difficultyClass(statement.difficulty)}` }, statement.difficulty) : null,
      isDesign ? h('span', { class: 'pill pill-sky' }, 'Design / OOP') : null),
    progressEl,
    stage))

  goto(0)
  return () => { if (typeof cleanup === 'function') cleanup() }
}

function renderList(container, statements) {
  const filters = { design: false, difficulty: 'all', done: 'all', search: '' }
  const body = h('tbody')
  const countEl = h('span', { class: 'muted' })

  function matches(statement) {
    if (filters.design && statement.signature?.kind !== 'class') return false
    if (filters.difficulty !== 'all' && statement.difficulty !== filters.difficulty) return false
    if (filters.done === 'done' && !seen(`read:${statement.id}`)) return false
    if (filters.done === 'not' && seen(`read:${statement.id}`)) return false
    const query = filters.search.trim().toLowerCase()
    if (!query) return true
    const haystack = [statement.title, statement.lc, statement.pattern].join(' ').toLowerCase()
    return query.split(/\s+/).every(word => haystack.includes(word))
  }

  function drawRows() {
    const list = statements.filter(matches)
    countEl.textContent = `${list.length} / ${statements.length}`
    body.replaceChildren(...list.map(statement => h('tr', {
      class: `problem-row${seen(`read:${statement.id}`) ? ' is-seen' : ''}`,
      tabindex: '0',
      onclick: () => { location.hash = `#/read/${encodeURIComponent(statement.id)}` },
      onkeydown: event => { if (event.key === 'Enter') location.hash = `#/read/${encodeURIComponent(statement.id)}` },
    },
    h('td', { class: 'mono muted' }, statement.lc ?? ''),
    h('td', { class: 'problem-title-cell' },
      h('span', { class: `diff-dot ${difficultyClass(statement.difficulty)}`, title: statement.difficulty || '' }),
      stripMarks(statement.title),
      statement.signature?.kind === 'class' ? h('span', { class: 'pill pill-sky' }, 'OOP') : null,
      seen(`read:${statement.id}`) ? h('span', { class: 'seen-mark' }, '✓') : null),
    h('td', null, statement.pattern ? h('span', { class: 'chip chip-pattern' }, statement.pattern) : null),
    h('td', { class: 'mono' }, statement.time || ''))))
    if (!list.length) body.append(h('tr', null, h('td', { colspan: '3', class: 'empty' }, 'No matches')))
  }

  const difficultyChips = h('div', { class: 'row seg' }, ['all', 'Easy', 'Medium', 'Hard'].map(level => h('button', {
    class: `chip${filters.difficulty === level ? ' active' : ''}`,
    onclick: event => {
      filters.difficulty = level
      for (const chip of difficultyChips.children) chip.classList.remove('active')
      event.currentTarget.classList.add('active')
      drawRows()
    },
  }, level === 'all' ? 'Any' : level)))

  const doneChips = h('div', { class: 'row seg' }, [['all', 'All'], ['done', 'Done'], ['not', 'Not done']].map(([value, label]) => h('button', {
    class: `chip${filters.done === value ? ' active' : ''}`,
    onclick: event => {
      filters.done = value
      for (const chip of doneChips.children) chip.classList.remove('active')
      event.currentTarget.classList.add('active')
      drawRows()
    },
  }, label)))

  const designChip = h('button', {
    class: `chip${filters.design ? ' active' : ''}`,
    onclick: () => {
      filters.design = !filters.design
      designChip.classList.toggle('active', filters.design)
      drawRows()
    },
  }, 'Design / OOP only')

  const searchInput = h('input', {
    class: 'filter-search',
    type: 'search',
    placeholder: 'Search title, pattern…',
    value: filters.search,
    oninput: event => {
      filters.search = event.target.value
      drawRows()
    },
  })

  const randomButton = h('button', {
    class: 'btn btn-primary',
    onclick: () => {
      const list = statements.filter(matches)
      const fresh = list.filter(statement => !seen(`read:${statement.id}`))
      const pool = fresh.length ? fresh : list
      if (pool.length) location.hash = `#/read/${encodeURIComponent(pool[Math.floor(Math.random() * pool.length)].id)}`
    },
  }, 'Random')

  container.append(h('div', { class: 'page rd-page' },
    subnav('learn', 'read'),
    h('div', { class: 'page-header row' }, h('h1', null, 'Read & sign'), countEl, randomButton, h('a', { class: 'btn btn-ghost', href: '#/read/drill' }, 'Signature drill →')),
    h('div', { class: 'row problem-filters' }, searchInput, designChip, difficultyChips, doneChips),
    statements.length
      ? h('div', { class: 'card table-wrap' }, h('table', { class: 'problem-table' },
        h('thead', null, h('tr', null, h('th', null, '#'), h('th', null, 'Statement'), h('th', null, 'Pattern'), h('th', null, 'Time'))),
        body))
      : h('div', { class: 'empty card' },
        h('div', { class: 'empty-icon' }, '📄'),
        h('p', null, 'No statements loaded yet.'))))
  drawRows()
}

function renderDrill(container, statements) {
  clear(container)
  if (!statements.length) {
    container.append(h('div', { class: 'page rd-page' },
      h('div', { class: 'empty card' }, h('div', { class: 'empty-icon' }, '📄'), h('p', null, 'No statements loaded yet.'))))
    return
  }
  const queue = shuffle(statements).slice(0, Math.min(drillSize, statements.length))
  let index = 0
  let score = { right: 0, total: 0 }
  const startedAll = performance.now()
  const hud = h('div', { class: 'row spread rd-drill-hud' })
  const stage = h('div', { class: 'rd-stage' })

  function drawHud() {
    hud.replaceChildren(
      h('span', { class: 'mono' }, `${index + 1} / ${queue.length}`),
      h('span', { class: 'pill' }, `${score.right}/${score.total}`))
  }

  function drawCurrent() {
    drawHud()
    clear(stage)
    const statement = queue[index]
    const oneLiner = statementPlainText(statement).split(/(?<=[.!?])\s+/)[0] || ''
    let answered = false
    const nextBtn = h('button', { class: 'btn btn-primary', disabled: true, onclick: () => advance() }, index === queue.length - 1 ? 'Finish →' : 'Next →')
    const editor = createSignatureEditor(statement.signature, {
      revealAfter: 1,
      onCheck: result => {
        if (answered) return
        answered = true
        score.total++
        if (result.ok) score.right++
        try { recordAnswer({ itemId: `${statement.id}:drill`, kind: 'sign', skills: [...(statement.skills || []), 'communication'], correct: result.ok }) } catch {}
        nextBtn.disabled = false
        drawHud()
      },
      onOverride: () => {
        if (!answered) return
        score.right++
        persistOverride({ itemId: `${statement.id}:drill`, kind: 'sign', skills: [...(statement.skills || []), 'communication'] })
        drawHud()
      },
    })
    stage.append(h('div', { class: 'rd-sign-split' },
      renderStatementPanel(statement),
      h('div', { class: 'stack rd-sign-work' },
        h('div', { class: 'card rd-sign-recap' },
          h('div', { class: 'row spread' },
            h('h3', null, stripMarks(statement.title)),
            statement.signature?.kind === 'class' ? h('span', { class: 'pill pill-sky' }, 'OOP') : null),
          h('div', { class: 'muted' }, stripMarks(oneLiner))),
        editor.el,
        h('div', { class: 'row rd-step-actions' }, nextBtn))))
  }

  function advance() {
    index++
    if (index >= queue.length) {
      const ms = performance.now() - startedAll
      clear(stage)
      stage.append(h('div', { class: 'card stack rd-summary' },
        h('h3', null, 'Drill done'),
        h('p', { class: 'muted' }, `${score.right}/${score.total} signatures correct in ${Math.round(ms / 1000)}s.`),
        h('div', { class: 'row' },
          h('button', { class: 'btn btn-primary', onclick: () => render(container, { id: 'drill' }) }, 'Run again'),
          h('a', { class: 'btn btn-ghost', href: '#/read' }, 'Back to list'))))
      hud.replaceChildren(h('span', { class: 'mono' }, 'done'), h('span', { class: 'pill pill-green' }, `${score.right}/${score.total}`))
      return
    }
    drawCurrent()
  }

  container.append(h('div', { class: 'page rd-page' },
    subnav('learn', 'read'),
    h('div', { class: 'page-header row' }, h('a', { class: 'btn btn-ghost', href: '#/read' }, '←'), h('h1', null, 'Signature drill'), hud),
    stage))
  drawCurrent()
}

export default function render(container, params = {}) {
  clear(container)
  container.append(h('div', { class: 'page' }, h('div', { class: 'empty card' }, h('div', { class: 'empty-icon' }, '⏳'), h('p', null, 'Loading statements…'))))

  return loadStatements().then(statements => {
    if (!container.isConnected) return
    clear(container)
    if (params.id === 'drill') {
      renderDrill(container, statements)
      return null
    }
    if (params.id) {
      const id = decodeParam(params.id)
      const statement = statements.find(s => s.id === id) || statements.find(s => String(s.lc) === id)
      if (!statement) {
        container.append(h('div', { class: 'page' }, h('div', { class: 'empty card' }, 'Statement not found. ', h('a', { href: '#/read' }, 'All statements'))))
        return null
      }
      return renderRunner(container, statement, statements)
    }
    renderList(container, statements)
    return null
  }).catch(error => {
    console.error(error)
    if (!container.isConnected) return
    clear(container)
    container.append(h('div', { class: 'page' }, h('div', { class: 'card empty' },
      h('div', { class: 'empty-icon' }, '🚧'),
      h('h3', null, 'Read & sign hit an error'),
      h('p', { class: 'muted' }, String(error?.message || error)),
      h('a', { class: 'btn', href: '#/' }, 'Dashboard'))))
  })
}
