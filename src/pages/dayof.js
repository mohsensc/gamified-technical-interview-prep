import { h, clear } from '../ui/h.js'
import { codeBlock } from '../ui/code.js'
import { rich } from '../ui/rich.js'
import { renderMcq } from '../ui/items.js'
import { getState, update, subscribe, recordAnswer } from '../store.js'

const budgetMs = 3 * 3600e3
const passPct = 80

const constraintRows = [
  ['10', 'O(n!) / O(2ⁿ·n)', 'permutations, subsets'],
  ['20', 'O(2ⁿ)', 'bitmask DP'],
  ['100 – 1,000', 'O(n²) / O(n³)', 'nested loops, DP table'],
  ['10⁵', 'O(n log n)', 'sort, heap, two pointers'],
  ['10⁶', 'O(n)', 'single pass, hashing, prefix sum'],
  ['10⁸ – 10⁹', 'O(log n) / O(√n)', 'binary search the answer'],
]

const fallbackScript = [
  'Repeat the problem back and confirm constraints.',
  'Say the brute force, then say why it is too slow.',
  'Name the pattern and data structure before coding.',
  'Narrate each block while you type it.',
  'Test on the example, then an edge case.',
  'State time and space at the end.',
]

let sheetsPromise = null

function loadSheets() {
  if (!sheetsPromise) sheetsPromise = import('../content/dayof/index.js').then(mod => mod.sheets || []).catch(error => {
    console.error('dayof content failed', error)
    return []
  })
  return sheetsPromise
}

function freshDayof() {
  return { startedAt: Date.now(), budgetMs, reviewed: {}, tests: {}, finalExam: null }
}

function safeState() {
  try {
    return getState()
  } catch {
    return {}
  }
}

function ensureDayof() {
  let record = null
  try {
    update(draft => {
      if (!draft.dayof) draft.dayof = freshDayof()
      record = draft.dayof
    })
  } catch (error) {
    console.error(error)
  }
  return record || freshDayof()
}

function getDayof() {
  return safeState().dayof || null
}

function markReviewed(sheetId, ms) {
  try {
    update(draft => {
      if (!draft.dayof) draft.dayof = freshDayof()
      draft.dayof.reviewed[sheetId] = { at: Date.now(), ms: Math.round(ms || 0) }
    })
  } catch (error) {
    console.error(error)
  }
}

function recordTest(sheetId, pct, passed) {
  try {
    update(draft => {
      if (!draft.dayof) draft.dayof = freshDayof()
      const bucket = sheetId === 'final' ? 'finalExam' : null
      if (bucket) {
        const prev = draft.dayof.finalExam || { attempts: 0, best: 0 }
        draft.dayof.finalExam = { attempts: prev.attempts + 1, best: Math.max(prev.best, pct), last: pct, passed: Math.max(prev.best, pct) >= passPct, at: Date.now() }
      } else {
        const prev = draft.dayof.tests[sheetId] || { attempts: 0, best: 0 }
        draft.dayof.tests[sheetId] = { attempts: prev.attempts + 1, best: Math.max(prev.best, pct), last: pct, passed: Math.max(prev.best, pct) >= passPct, at: Date.now() }
      }
    })
  } catch (error) {
    console.error(error)
  }
}

const isReviewed = (dayof, sheetId) => Boolean(dayof?.reviewed?.[sheetId])
const testBest = (dayof, sheetId) => dayof?.tests?.[sheetId]?.best ?? null
const finalExamBest = dayof => dayof?.finalExam?.best ?? null

function sheetStatus(sheet, dayof) {
  const best = testBest(dayof, sheet.id)
  return { reviewed: isReviewed(dayof, sheet.id), best, passed: best !== null && best >= passPct }
}

function computeNextStep(sheets, dayof) {
  for (const sheet of sheets) {
    if (!isReviewed(dayof, sheet.id)) return { href: `#/dayof/review/${encodeURIComponent(sheet.id)}`, label: `Review — ${sheet.title}` }
  }
  for (const sheet of sheets) {
    const best = testBest(dayof, sheet.id)
    if (best === null || best < passPct) return { href: `#/dayof/test/${encodeURIComponent(sheet.id)}`, label: `Test — ${sheet.title}` }
  }
  const finalBest = finalExamBest(dayof)
  if (finalBest === null || finalBest < passPct) return { href: '#/dayof/test/final', label: 'Final exam — 25 mixed questions' }
  return { href: '#/dayof/final', label: 'Final sheets — go in ready' }
}

function formatClock(ms) {
  const sign = ms < 0 ? '-' : ''
  const abs = Math.abs(Math.round(ms / 1000))
  const hrs = Math.floor(abs / 3600)
  const mins = Math.floor((abs % 3600) / 60)
  const secs = abs % 60
  const pad = n => String(n).padStart(2, '0')
  return hrs > 0 ? `${sign}${hrs}:${pad(mins)}:${pad(secs)}` : `${sign}${mins}:${pad(secs)}`
}

function shuffle(list) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function isCodeLike(text) {
  const value = String(text ?? '').trim()
  if (!value) return false
  if (value.includes('\n')) return true
  if (/^(def|return|for|while|if|class|import|from|with|try|raise|yield|self\.)\b/.test(value)) return true
  if (/^[a-zA-Z_][\w.]*\(.*\)$/.test(value)) return true
  return false
}

function emptyCard(title, sub) {
  return h('div', { class: 'card empty' },
    h('div', { class: 'empty-icon' }, '🧩'),
    h('h3', null, title),
    sub ? h('p', { class: 'muted' }, sub) : null,
    h('a', { class: 'btn', href: '#/dayof' }, 'Back to DAYOF'))
}

function loadingCard() {
  return h('div', { class: 'card empty' }, h('div', { class: 'empty-icon' }, '⏳'), h('h3', null, 'Loading…'))
}

function secHead(tag, tone, title) {
  return h('div', { class: 'dayof-sec-head' }, h('span', { class: `pill pill-${tone}` }, tag), h('h3', null, rich(title)))
}

function stageHead(title, metaText, pct) {
  return h('div', { class: 'dayof-stage-head' },
    h('div', { class: 'row-wrap' }, h('h2', null, title), h('span', { class: 'pill' }, metaText)),
    h('div', { class: 'progress dayof-stage-progress' }, h('div', { style: { width: `${Math.round(Math.min(1, pct) * 100)}%` } })))
}

function reviewCard(sheet, status) {
  return h('a', { class: `card card-hover dayof-sheet-card${status.reviewed ? ' is-done' : ''}`, href: `#/dayof/review/${encodeURIComponent(sheet.id)}` },
    h('div', { class: 'row spread' }, h('span', { class: 'dayof-sheet-icon' }, sheet.icon || '📄'), status.reviewed ? h('span', { class: 'dayof-check' }, '✓') : null),
    h('div', { class: 'dayof-sheet-title' }, sheet.title),
    h('div', { class: 'muted small' }, `${sheet.minutes || 10} min`))
}

function testCard(sheet, status) {
  const label = status.best === null ? 'not tested' : `${status.best}%`
  const tone = status.best === null ? '' : status.passed ? 'pill-green' : 'pill-amber'
  return h('a', { class: `card card-hover dayof-sheet-card${status.passed ? ' is-done' : ''}`, href: `#/dayof/test/${encodeURIComponent(sheet.id)}` },
    h('div', { class: 'row spread' }, h('span', { class: 'dayof-sheet-icon' }, sheet.icon || '📄'), h('span', { class: `pill ${tone}` }, label)),
    h('div', { class: 'dayof-sheet-title' }, sheet.title),
    h('div', { class: 'muted small' }, `${(sheet.quiz || []).length} questions`))
}

function finalExamCard(best, passed) {
  const label = best === null ? 'not tried' : `${best}%`
  const tone = best === null ? '' : passed ? 'pill-green' : 'pill-amber'
  return h('a', { class: `card card-hover dayof-sheet-card dayof-final-exam${passed ? ' is-done' : ''}`, href: '#/dayof/test/final' },
    h('div', { class: 'row spread' }, h('span', { class: 'dayof-sheet-icon' }, '🏁'), h('span', { class: `pill ${tone}` }, label)),
    h('div', { class: 'dayof-sheet-title' }, 'Final exam'),
    h('div', { class: 'muted small' }, '25 mixed questions'))
}

function finalCard(sheet, ready) {
  return h('a', { class: `card card-hover dayof-sheet-card dayof-final-card${ready ? ' is-ready' : ''}`, href: `#/dayof/final/${encodeURIComponent(sheet.id)}` },
    h('span', { class: 'dayof-sheet-icon' }, sheet.icon || '📄'),
    h('div', { class: 'dayof-sheet-title' }, sheet.title),
    h('div', { class: 'muted small' }, 'One-screen summary'))
}

function renderHome(container) {
  const page = h('div', { class: 'page dayof-page' })
  container.append(page)
  page.append(loadingCard())
  ensureDayof()

  let sheets = []
  let unsub = null
  let destroyed = false

  function draw() {
    if (destroyed) return
    const dayof = getDayof() || ensureDayof()

    if (!sheets.length) {
      page.replaceChildren(
        h('div', { class: 'page-header' },
          h('div', null, h('span', { class: 'eyebrow' }, 'DAYOF'), h('h1', null, '3-hour final cram'))),
        emptyCard('Building your sheets…', 'The cram sheets are still being written. This page will pick them up automatically once ready.'))
      return
    }

    const statuses = sheets.map(sheet => ({ sheet, status: sheetStatus(sheet, dayof) }))
    const reviewedCount = statuses.filter(s => s.status.reviewed).length
    const passedCount = statuses.filter(s => s.status.passed).length
    const finalBest = finalExamBest(dayof)
    const finalPassed = finalBest !== null && finalBest >= passPct
    const allReviewed = reviewedCount === sheets.length
    const allTestsPassed = passedCount === sheets.length && finalPassed
    const next = computeNextStep(sheets, dayof)

    const header = h('div', { class: 'page-header' },
      h('div', null,
        h('div', { class: 'row-wrap' }, h('span', { class: 'eyebrow' }, 'DAYOF'), h('span', { class: 'pill pill-amber' }, 'Interview today')),
        h('h1', null, '3-hour final cram'),
        h('p', { class: 'muted' }, 'Review → Test → Final sheets. One pass through, then you walk in.'))))

    const nextBtn = h('a', { class: 'btn btn-primary btn-lg dayof-next', href: next.href }, h('span', null, 'Next step'), h('b', null, next.label))

    const reviewStage = h('div', { class: 'card dayof-stage-card' },
      stageHead('① Review', `${reviewedCount}/${sheets.length}`, reviewedCount / sheets.length),
      h('div', { class: 'grid-3 dayof-sheet-grid' }, statuses.map(({ sheet, status }) => reviewCard(sheet, status))))

    const testStage = h('div', { class: 'card dayof-stage-card' },
      stageHead('② Test', `${passedCount}/${sheets.length} + exam`, (passedCount + (finalPassed ? 1 : 0)) / (sheets.length + 1)),
      h('div', { class: 'grid-3 dayof-sheet-grid' }, [...statuses.map(({ sheet, status }) => testCard(sheet, status)), finalExamCard(finalBest, finalPassed)]))

    const finalStage = h('div', { class: 'card dayof-stage-card' },
      stageHead('③ Final sheets', allTestsPassed ? 'ready' : `${sheets.length} sheets`, allTestsPassed ? 1 : 0.1),
      h('div', { class: 'grid-3 dayof-sheet-grid' }, statuses.map(({ sheet }) => finalCard(sheet, allTestsPassed))),
      h('a', { class: 'btn dayof-final-all', href: '#/dayof/final' }, 'Open the full final page →'))

    const timeline = h('div', { class: 'timeline dayof-path' },
      h('div', { class: `plan-block${allReviewed ? ' done' : ' current'}` }, h('div', { class: 'plan-dot' }, allReviewed ? '✓' : '1'), reviewStage),
      h('div', { class: `plan-block${allTestsPassed ? ' done' : allReviewed ? ' current' : ''}` }, h('div', { class: 'plan-dot' }, allTestsPassed ? '✓' : '2'), testStage),
      h('div', { class: `plan-block${allTestsPassed ? ' current' : ''}` }, h('div', { class: 'plan-dot' }, '3'), finalStage))

    page.replaceChildren(header, nextBtn, timeline)
  }

  loadSheets().then(result => {
    if (destroyed) return
    sheets = result
    draw()
    unsub = subscribe(draw)
  })

  return () => {
    destroyed = true
    if (unsub) unsub()
  }
}

function knobsBlock(knobs, { label = true } = {}) {
  if (!knobs?.length) return null
  const items = knobs.map(knob => {
    const panel = h('div', { class: 'dayof-knob-panel' },
      h('p', { class: 'small' }, rich(knob.how)),
      knob.code ? h('div', { class: 'dayof-knob-code' }, codeBlock(knob.code, { lineNumbers: false })) : null)
    const chip = h('button', { class: 'chip dayof-knob-chip', type: 'button' }, knob.change)
    chip.addEventListener('click', () => {
      const open = panel.classList.toggle('open')
      chip.classList.toggle('active', open)
    })
    return h('div', { class: 'dayof-knob' }, chip, panel)
  })
  return h('div', { class: 'dayof-knobs' },
    label ? h('div', { class: 'muted small' }, 'Variants — tap to see the edit') : null,
    h('div', { class: 'row-wrap' }, items))
}

function boilerplateCard(section, id) {
  const block = codeBlock(section.code || '')
  const wrap = h('div', { class: 'dayof-code-wrap' }, block)
  const hideBtn = h('button', { class: 'btn btn-ghost btn-sm', type: 'button' }, 'Hide code')
  hideBtn.addEventListener('click', () => {
    const hidden = wrap.classList.toggle('is-hidden')
    hideBtn.textContent = hidden ? 'Show code' : 'Hide code'
  })
  wrap.addEventListener('click', () => {
    if (!wrap.classList.contains('is-hidden')) return
    wrap.classList.remove('is-hidden')
    hideBtn.textContent = 'Hide code'
  })
  return h('div', { class: 'card dayof-sec', id },
    secHead('Boilerplate', 'sky', section.title),
    section.when ? h('p', { class: 'muted small' }, rich(section.when)) : null,
    h('div', { class: 'row-wrap dayof-chips' },
      section.time ? h('span', { class: 'pill pill-amber mono' }, section.time) : null,
      section.space ? h('span', { class: 'pill pill-teal mono' }, section.space) : null),
    h('div', { class: 'row spread dayof-code-toolbar' }, h('span', { class: 'muted small' }, 'Cover, recite, then check'), hideBtn),
    wrap,
    knobsBlock(section.knobs))
}

function findBoilerplate(sheets, title) {
  const needle = String(title).trim().toLowerCase()
  for (const sheet of sheets) {
    for (const sec of sheet.sections) {
      if (sec.kind === 'boilerplate' && sec.title.trim().toLowerCase() === needle) return { sheet, sec }
    }
  }
  return null
}

function refChip(ref, ctx) {
  if (!ref) return null
  const found = findBoilerplate(ctx.sheets, ref)
  if (!found) return h('span', { class: 'pill' }, `see: ${ref}`)
  if (found.sheet.id === ctx.sheet.id) {
    const idx = found.sheet.sections.indexOf(found.sec)
    const chip = h('button', { class: 'chip', type: 'button' }, `↳ ${ref}`)
    chip.addEventListener('click', () => document.getElementById(`sec-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    return chip
  }
  return h('a', { class: 'chip', href: `#/dayof/review/${encodeURIComponent(found.sheet.id)}` }, `↳ ${ref} · ${found.sheet.title}`)
}

function wholeTree(node) {
  const box = h('div', { class: 'dayof-tree-diagram' }, h('div', { class: 'dayof-tree-diagram-q' }, rich(node.q)))
  const opts = h('div', { class: 'dayof-tree-diagram-opts' })
  for (const opt of node.options || []) {
    if (opt.leaf) {
      opts.append(h('div', { class: 'dayof-tree-diagram-leaf' },
        h('span', { class: 'dayof-tree-diagram-label' }, rich(opt.label)), h('span', { class: 'muted' }, '→'),
        h('b', null, rich(opt.leaf.result)), h('span', { class: 'pill mono' }, opt.leaf.time)))
    } else {
      opts.append(h('div', { class: 'dayof-tree-diagram-branch' },
        h('div', { class: 'dayof-tree-diagram-label' }, rich(opt.label)), wholeTree(opt.next)))
    }
  }
  box.append(opts)
  return box
}

function treeCard(section, id, ctx) {
  const crumbs = h('div', { class: 'row-wrap dayof-tree-crumbs' })
  const body = h('div', { class: 'dayof-tree-body' })
  const wholeBtn = h('button', { class: 'btn btn-ghost btn-sm', type: 'button' }, 'Show whole tree')
  let path = []
  let whole = false

  function renderCrumbs() {
    clear(crumbs)
    const rootBtn = h('button', { class: 'chip', type: 'button' }, 'Start')
    rootBtn.addEventListener('click', restart)
    crumbs.append(rootBtn)
    for (const label of path) crumbs.append(h('span', { class: 'muted' }, '→'), h('span', { class: 'chip active' }, label))
  }

  function renderNode(node) {
    clear(body)
    body.append(h('div', { class: 'dayof-tree-q' }, rich(node.q)))
    const options = h('div', { class: 'dayof-tree-options' }, (node.options || []).map(opt => {
      const btn = h('button', { class: 'btn dayof-tree-opt', type: 'button' }, rich(opt.label))
      btn.addEventListener('click', () => choose(opt))
      return btn
    }))
    body.append(options)
  }

  function renderLeaf(leaf) {
    clear(body)
    const restartBtn = h('button', { class: 'btn btn-sm', type: 'button' }, 'Start over')
    restartBtn.addEventListener('click', restart)
    body.append(h('div', { class: 'dayof-leaf-card' },
      h('div', { class: 'row-wrap' }, h('span', { class: 'pill pill-green' }, rich(leaf.result)), h('span', { class: 'pill mono' }, leaf.time)),
      h('p', { class: 'small' }, h('b', null, 'Data structures: '), rich(leaf.ds)),
      h('p', { class: 'small muted' }, rich(leaf.why)),
      refChip(leaf.ref, ctx),
      restartBtn))
  }

  function choose(opt) {
    path.push(opt.label)
    renderCrumbs()
    if (opt.leaf) renderLeaf(opt.leaf)
    else renderNode(opt.next)
  }

  function restart() {
    path = []
    renderCrumbs()
    renderNode(section.root)
  }

  wholeBtn.addEventListener('click', () => {
    whole = !whole
    wholeBtn.textContent = whole ? 'Back to clicking' : 'Show whole tree'
    if (whole) {
      clear(body)
      clear(crumbs)
      body.append(wholeTree(section.root))
    } else restart()
  })

  restart()

  return h('div', { class: 'card dayof-sec dayof-tree-card', id },
    secHead('Decision tree', 'pink', section.title),
    crumbs, body,
    h('div', { class: 'row' }, wholeBtn))
}

function tableCard(section, id) {
  return h('div', { class: 'card dayof-sec', id },
    secHead('Table', 'teal', section.title),
    h('div', { class: 'dayof-table-wrap' },
      h('table', { class: 'dayof-table' },
        h('thead', null, h('tr', null, (section.columns || []).map(col => h('th', null, rich(col))))),
        h('tbody', null, (section.rows || []).map(row => h('tr', null, row.map(cell => h('td', null, rich(String(cell))))))))))
}

function beforeAfterCard(section, id) {
  return h('div', { class: 'card dayof-sec', id },
    secHead('Before → after', 'amber', section.title),
    h('div', { class: 'dayof-ba-list' }, (section.rows || []).map(row => h('div', { class: 'dayof-ba-row' },
      h('code', { class: 'dayof-ba-op' }, row.op),
      h('span', { class: 'dayof-ba-before mono' }, row.before),
      h('span', { class: 'dayof-ba-arrow' }, '→'),
      h('span', { class: 'dayof-ba-after mono' }, row.after),
      row.note ? h('span', { class: 'muted small dayof-ba-note' }, row.note) : null))))
}

function listCard(section, id) {
  return h('div', { class: 'card dayof-sec', id },
    secHead('Notes', 'green', section.title),
    h('ul', { class: 'dayof-list' }, (section.items || []).map(item => h('li', null, rich(item)))))
}

function unknownCard(section, id) {
  return h('div', { class: 'card dayof-sec', id }, secHead('Section', 'gray', section.title || 'Untitled'), h('p', { class: 'muted small' }, 'Unsupported section kind.'))
}

const sectionBuilders = { boilerplate: boilerplateCard, tree: treeCard, table: tableCard, beforeAfter: beforeAfterCard, list: listCard }

function sectionCard(section, id, ctx) {
  const build = sectionBuilders[section.kind] || unknownCard
  return build(section, id, ctx)
}

function recallDrill(cards, onFinish) {
  const list = cards?.length ? cards : []
  let index = 0
  let got = 0
  let missed = 0
  const wrap = h('div', { class: 'stack' })

  function draw() {
    clear(wrap)
    wrap.append(h('div', { class: 'section-title' }, 'Recall drill'))
    if (!list.length) {
      wrap.append(h('p', { class: 'muted small' }, 'No recall prompts yet.'))
      onFinish?.()
      return
    }
    if (index >= list.length) {
      const again = h('button', { class: 'btn btn-sm', type: 'button' }, 'Go again')
      again.addEventListener('click', () => { index = 0; got = 0; missed = 0; draw() })
      wrap.append(h('div', { class: 'dayof-recall-done' },
        h('div', { class: 'row-wrap' }, h('span', { class: 'pill pill-green' }, `${got} got it`), h('span', { class: 'pill pill-red' }, `${missed} missed`)),
        again))
      onFinish?.()
      return
    }
    const card = list[index]
    let flipped = false
    const front = h('div', { class: 'flash-face flash-front' }, h('div', { class: 'flash-text' }, rich(card.prompt)))
    const back = h('div', { class: 'flash-face flash-back' },
      isCodeLike(card.answer) ? codeBlock(card.answer, { lineNumbers: false }) : h('div', { class: 'flash-text' }, rich(card.answer)))
    const face = h('div', { class: 'flash-card', tabindex: '0' }, front, back)
    const gotBtn = h('button', { class: 'btn btn-good', type: 'button', disabled: true }, 'Got it')
    const missBtn = h('button', { class: 'btn btn-bad', type: 'button', disabled: true }, 'Missed')
    function flip() {
      if (flipped) return
      flipped = true
      face.classList.add('flipped')
      gotBtn.disabled = false
      missBtn.disabled = false
    }
    face.addEventListener('click', flip)
    face.addEventListener('keydown', event => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        flip()
      }
    })
    gotBtn.addEventListener('click', () => { got += 1; index += 1; draw() })
    missBtn.addEventListener('click', () => { missed += 1; index += 1; draw() })
    wrap.append(
      h('div', { class: 'row spread' }, h('span', { class: 'muted small' }, `${index + 1} / ${list.length}`), h('span', { class: 'muted small' }, 'Tap to flip')),
      face,
      h('div', { class: 'row dayof-recall-actions' }, missBtn, gotBtn))
  }
  draw()
  return wrap
}

function buildReview(page, sheet, sheets) {
  const startedAt = Date.now()
  const backRow = h('div', { class: 'row-wrap dayof-review-top' }, h('a', { class: 'btn btn-ghost btn-sm', href: '#/dayof' }, '← DAYOF'), h('span', { class: 'muted small' }, 'Review'))

  const header = h('div', { class: 'page-header' },
    h('div', null,
      h('div', { class: 'row-wrap' }, h('span', { class: 'dayof-sheet-icon-lg' }, sheet.icon || '📄'), h('h1', null, sheet.title)),
      h('p', { class: 'muted' }, `${sheet.minutes || 10} min budget · ${sheet.sections.length} sections`)),
    h('a', { class: 'btn btn-primary', href: `#/dayof/test/${encodeURIComponent(sheet.id)}` }, 'Skip to test →'))

  const tldr = h('div', { class: 'card dayof-tldr', id: 'sec-tldr' },
    h('div', { class: 'section-title' }, 'TL;DR'),
    h('ul', { class: 'dayof-list dayof-tldr-list' }, (sheet.summary || []).map(line => h('li', null, rich(line)))))

  const sectionEls = sheet.sections.map((section, index) => sectionCard(section, `sec-${index}`, { sheet, sheets }))

  const recallWrap = h('div', { class: 'card dayof-recall', id: 'sec-recall' })

  const ctaLink = h('a', { class: 'btn btn-primary btn-lg', href: `#/dayof/test/${encodeURIComponent(sheet.id)}` }, 'Take the test →')
  const ctaCard = h('div', { class: 'card dayof-cta', id: 'sec-test-cta' },
    h('div', null, h('h3', null, 'Ready?'), h('p', { class: 'muted small' }, 'Lock in what you just reviewed.')),
    ctaLink)

  const flowEl = h('div', { class: 'dayof-review-flow' }, tldr, sectionEls, recallWrap, ctaCard)

  const tocItems = [{ id: 'sec-tldr', label: 'TL;DR' }, ...sheet.sections.map((section, index) => ({ id: `sec-${index}`, label: section.title })), { id: 'sec-recall', label: 'Recall' }, { id: 'sec-test-cta', label: 'Test' }]
  const tocLinks = tocItems.map(item => {
    const link = h('a', { class: 'dayof-toc-link', href: `#/dayof/review/${encodeURIComponent(sheet.id)}` }, item.label)
    link.addEventListener('click', event => {
      event.preventDefault()
      document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return link
  })
  const toc = h('nav', { class: 'dayof-toc' }, tocLinks)

  const layout = h('div', { class: 'dayof-review-layout' }, toc, flowEl)
  page.replaceChildren(backRow, header, layout)

  let finished = false
  function finishReview() {
    if (finished) return
    finished = true
    markReviewed(sheet.id, Date.now() - startedAt)
  }

  recallWrap.append(recallDrill(sheet.recall || [], finishReview))
  ctaLink.addEventListener('click', finishReview)

  const observedEls = [tldr, ...sectionEls, recallWrap, ctaCard]
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      const idx = observedEls.indexOf(entry.target)
      if (idx === -1) continue
      tocLinks.forEach((link, i) => link.classList.toggle('active', i === idx))
    }
  }, { rootMargin: '-10% 0px -70% 0px', threshold: 0 })
  observedEls.forEach(el => observer.observe(el))

  return () => observer.disconnect()
}

async function renderReview(container, sheetId) {
  const page = h('div', { class: 'page dayof-review' })
  container.append(page)
  page.append(loadingCard())
  const sheets = await loadSheets()
  const sheet = sheets.find(s => s.id === sheetId)
  if (!sheet) {
    page.replaceChildren(emptyCard('Sheet not found', 'It may still be generating.'))
    return null
  }
  return buildReview(page, sheet, sheets)
}

function runTest(page, initialItems, title, retryHref, onComplete) {
  let items = initialItems
  let index = 0
  let results = []
  let completedOnce = false

  function draw() {
    clear(page)
    if (index >= items.length) {
      const correct = results.filter(r => r.correct).length
      const pct = items.length ? Math.round(correct / items.length * 100) : 0
      const passed = pct >= passPct
      if (!completedOnce) {
        completedOnce = true
        onComplete?.(pct, passed)
      }
      const misses = results.filter(r => !r.correct)
      const retryBtn = misses.length ? h('button', { class: 'btn btn-primary', type: 'button' }, 'Retry misses') : null
      if (retryBtn) retryBtn.addEventListener('click', () => { items = misses.map(m => m.item); index = 0; results = []; draw() })
      page.append(
        h('div', { class: 'page-header' },
          h('div', null, h('h1', null, title), h('p', { class: 'muted' }, `${correct}/${items.length} correct`)),
          h('span', { class: `pill dayof-score-pill ${passed ? 'pill-green' : 'pill-red'}` }, `${pct}%${passed ? ' PASS' : ''}`)),
        h('div', { class: 'card dayof-test-summary' },
          misses.length
            ? h('div', { class: 'stack-sm dayof-miss-list' }, h('div', { class: 'section-title' }, 'Review these'), misses.map(m => h('div', { class: 'dayof-miss' },
                h('div', { class: 'small' }, rich(m.item.q)),
                h('div', { class: 'muted small' }, rich(m.item.why)),
                h('a', { class: 'btn btn-sm', href: `#/dayof/review/${encodeURIComponent(m.item.sheetId)}` }, 'Review'))))
            : h('p', { class: 'muted small' }, 'Clean sweep. Nice.'),
          h('div', { class: 'row-wrap dayof-test-actions' },
            retryBtn,
            retryHref ? h('a', { class: 'btn', href: retryHref }, 'Review sheet') : null,
            h('a', { class: 'btn btn-ghost', href: '#/dayof' }, 'Back to DAYOF'))))
      return
    }

    const item = items[index]
    const pct = Math.round(index / items.length * 100)
    const nextBtn = h('button', { class: 'btn btn-primary dayof-next-q', type: 'button', disabled: true }, index === items.length - 1 ? 'See results' : 'Next →')
    nextBtn.addEventListener('click', () => { index += 1; draw() })
    const mcqEl = renderMcq(item, ({ correct, ms }) => {
      try {
        recordAnswer({ itemId: item.id, kind: 'mcq', skills: item.skills || [], correct, ms })
      } catch (error) {
        console.error(error)
      }
      results.push({ item, correct, ms })
      nextBtn.disabled = false
    })
    page.append(
      h('div', { class: 'page-header' },
        h('h1', null, title),
        h('span', { class: 'pill' }, `${results.filter(r => r.correct).length} correct`)),
      h('div', { class: 'progress dayof-test-progress' }, h('div', { style: { width: `${pct}%` } })),
      h('div', { class: 'card dayof-test-card' },
        h('div', { class: 'muted small' }, `Question ${index + 1} of ${items.length}`),
        mcqEl, nextBtn))
  }
  draw()
}

async function renderTest(container, sheetId) {
  const page = h('div', { class: 'page dayof-test' })
  container.append(page)
  page.append(loadingCard())
  const sheets = await loadSheets()
  const isFinal = sheetId === 'final'
  const sheet = isFinal ? null : sheets.find(s => s.id === sheetId)
  if (!isFinal && !sheet) {
    page.replaceChildren(emptyCard('Sheet not found', 'It may still be generating.'))
    return null
  }
  const pool = isFinal
    ? sheets.flatMap(s => (s.quiz || []).map(q => ({ ...q, sheetId: s.id })))
    : (sheet.quiz || []).map(q => ({ ...q, sheetId: sheet.id }))
  if (!pool.length) {
    page.replaceChildren(emptyCard('No quiz yet', 'This quiz is still being written.'))
    return null
  }
  const items = isFinal ? shuffle(pool).slice(0, 25) : shuffle(pool)
  const title = isFinal ? 'Final exam — mixed questions' : `Test — ${sheet.title}`
  const retryHref = isFinal ? null : `#/dayof/review/${encodeURIComponent(sheet.id)}`
  runTest(page, items, title, retryHref, (pct, passed) => recordTest(sheetId, pct, passed))
  return null
}

function findSection(sheets, predicate) {
  for (const sheet of sheets) for (const sec of sheet.sections) if (predicate(sec)) return sec
  return null
}

function summaryCard(sheet) {
  return h('div', { class: 'card dayof-summary-card' },
    h('div', { class: 'row-wrap' }, h('span', { class: 'dayof-sheet-icon' }, sheet.icon || '📄'), h('h3', null, sheet.title)),
    h('ul', { class: 'dayof-list dayof-summary-list' }, (sheet.summary || []).map(line => h('li', null, rich(line)))),
    h('a', { class: 'btn btn-sm btn-ghost', href: `#/dayof/final/${encodeURIComponent(sheet.id)}` }, 'Full sheet →'))
}

function buildFinalOverview(sheets) {
  const header = h('div', { class: 'page-header' },
    h('div', null, h('span', { class: 'eyebrow' }, 'DAYOF'), h('h1', null, 'Final sheets'), h('p', { class: 'muted' }, 'One screen each. Scan right before you go in.')),
    h('a', { class: 'btn btn-ghost', href: '#/dayof' }, '← DAYOF'))

  const grid = h('div', { class: 'grid-3 dayof-final-grid' }, sheets.map(sheet => summaryCard(sheet)))

  const constraintCard = h('div', { class: 'card dayof-sec' },
    secHead('Constraints', 'teal', 'Constraint → target complexity'),
    h('div', { class: 'dayof-table-wrap' },
      h('table', { class: 'dayof-table' },
        h('thead', null, h('tr', null, ['n ≤', 'target', 'cue'].map(c => h('th', null, c)))),
        h('tbody', null, constraintRows.map(row => h('tr', null, row.map(cell => h('td', null, cell))))))))

  const interviewSheet = sheets.find(s => s.id === 'interview')
  const scriptSection = findSection(interviewSheet ? [interviewSheet] : sheets, sec => sec.kind === 'list' && /interview script|say this out loud/i.test(sec.title))
  const scriptItems = scriptSection ? scriptSection.items : fallbackScript
  const scriptCard = h('div', { class: 'card dayof-sec' },
    secHead('Script', 'pink', 'Say this out loud'),
    h('ul', { class: 'dayof-list' }, scriptItems.map(item => h('li', null, rich(item)))))

  return h('div', { class: 'stack-lg dayof-final-page' }, header, grid, h('div', { class: 'grid-2' }, constraintCard, scriptCard))
}

function compactBoilerplate(section) {
  return h('div', { class: 'card dayof-sec dayof-compact' },
    secHead('Boilerplate', 'sky', section.title),
    h('div', { class: 'row-wrap dayof-chips' },
      section.time ? h('span', { class: 'pill pill-amber mono' }, section.time) : null,
      section.space ? h('span', { class: 'pill pill-teal mono' }, section.space) : null),
    codeBlock(section.code || '', { lineNumbers: false }),
    section.knobs?.length
      ? h('details', { class: 'dayof-knob-details' },
          h('summary', { class: 'small muted' }, `${section.knobs.length} variant${section.knobs.length > 1 ? 's' : ''}`),
          knobsBlock(section.knobs, { label: false }))
      : null)
}

function buildSheetFinal(sheet) {
  const header = h('div', { class: 'page-header' },
    h('div', null,
      h('div', { class: 'row-wrap' }, h('span', { class: 'dayof-sheet-icon-lg' }, sheet.icon || '📄'), h('h1', null, sheet.title)),
      h('p', { class: 'muted' }, 'Final sheet — one screen')),
    h('a', { class: 'btn btn-ghost', href: '#/dayof/final' }, '← All sheets'))

  const summary = h('div', { class: 'card dayof-tldr' }, h('ul', { class: 'dayof-list' }, (sheet.summary || []).map(line => h('li', null, rich(line)))))
  const boilerplates = sheet.sections.filter(s => s.kind === 'boilerplate')
  const codeGrid = boilerplates.length ? h('div', { class: 'grid-2 dayof-final-code-grid' }, boilerplates.map(section => compactBoilerplate(section))) : null
  const others = sheet.sections.filter(s => s.kind !== 'boilerplate').map((section, i) => sectionCard(section, `fsec-${i}`, { sheet, sheets: [sheet] }))

  return h('div', { class: 'stack dayof-final-page' }, header, summary, codeGrid, others.length ? h('div', { class: 'stack' }, others) : null)
}

async function renderFinal(container, sheetId) {
  const page = h('div', { class: 'page dayof-final' })
  container.append(page)
  page.append(loadingCard())
  const sheets = await loadSheets()
  if (!sheets.length) {
    page.replaceChildren(emptyCard('Building your sheets…', 'Nothing to show yet.'))
    return null
  }
  if (sheetId) {
    const sheet = sheets.find(s => s.id === sheetId)
    if (!sheet) {
      page.replaceChildren(emptyCard('Sheet not found', 'It may still be generating.'))
      return null
    }
    page.replaceChildren(buildSheetFinal(sheet))
    return null
  }
  page.replaceChildren(buildFinalOverview(sheets))
  return null
}

export default function render(container, params) {
  const stage = params?.stage
  const id = params?.id
  if (!stage) return renderHome(container)
  if (stage === 'review') return renderReview(container, id)
  if (stage === 'test') return renderTest(container, id)
  if (stage === 'final') return renderFinal(container, id)
  container.replaceChildren(emptyCard('Unknown DAYOF stage'))
  return null
}
