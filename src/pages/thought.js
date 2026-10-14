import { h } from '../ui/h.js'
import { codeBlock, highlightPython } from '../ui/code.js'
import { rich } from '../ui/rich.js'
import { getState, update, recordAnswer, subscribe } from '../store.js'
import { navigate } from '../router.js'
import { priorityIds } from '../content/thought/priority.js'
import { codeMatches } from '../ui/codeMatch.js'
import { overrideButton, applyOverrideVisuals, persistOverride } from '../ui/override.js'

const queueKey = 'thought-queue'
const stepLabels = ['Read', 'Data structure', 'Method', 'Code', 'Fill 3 lines', 'Complexity']
const modeDefs = [
  { id: 'priority', label: 'Priority' },
  { id: 'order', label: 'In order' },
  { id: 'shuffle', label: 'Shuffle' },
  { id: 'missed', label: 'Missed only' },
  { id: 'unseen', label: 'Not seen' },
]

let contentPromise = null

function loadThoughtContent() {
  if (!contentPromise) contentPromise = import('../content/thought/index.js').then(mod => mod.loadThought()).catch(error => {
    console.error('thought content failed', error)
    return { categories: [], items: [] }
  })
  return contentPromise
}

function shuffle(list) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function saveQueue(queue) {
  try { sessionStorage.setItem(queueKey, JSON.stringify(queue)) } catch {}
}

function loadQueue() {
  try {
    const raw = sessionStorage.getItem(queueKey)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function getThoughtMap() {
  try { return getState().thought || {} } catch { return {} }
}

function saveStatus(itemId, patch) {
  try {
    update(draft => {
      draft.thought ||= {}
      draft.thought[itemId] = { ...draft.thought[itemId], ...patch, at: Date.now() }
    })
  } catch (error) {
    console.error(error)
  }
}

const stepKeys = ['ds', 'method', 'fill', 'time', 'space']

function statusTone(status) {
  if (!status) return 'gray'
  const values = stepKeys.map(key => status[key])
  if (!values.some(value => value !== undefined)) return 'gray'
  const allDone = values.every(value => value !== undefined)
  if (allDone && values.every(Boolean)) return 'green'
  return values.some(Boolean) ? 'amber' : 'red'
}

const isDone = status => ['green', 'amber'].includes(statusTone(status))
const priorityRank = new Map(priorityIds.map((id, i) => [id, i]))
const sortByPriority = pool => [...pool].sort((a, b) => (priorityRank.get(a.id) ?? 1e6) - (priorityRank.get(b.id) ?? 1e6))

const toneDot = { green: 'dot-green', amber: 'dot-amber', red: 'dot-red', gray: 'dot-accent' }

function normalizeLine(text) {
  let t = String(text ?? '').trim()
  t = t.replace(/\s+/g, ' ')
  t = t.replace(/\s*([=+\-*/%<>!&|^~,.:()[\]{}])\s*/g, '$1')
  t = t.replace(/'/g, '"')
  return t
}

function lineMatches(userValue, lineIndex, rawLines, accept) {
  const alts = (accept && accept[String(lineIndex)]) || []
  const candidates = [rawLines[lineIndex], ...alts]
  const normalizedUser = normalizeLine(userValue)
  if (!normalizedUser) return false
  return candidates.some(candidate => normalizeLine(candidate) === normalizedUser) || codeMatches(userValue, candidates)
}

function emptyCard(title, sub) {
  return h('div', { class: 'card empty' },
    h('div', { class: 'empty-icon' }, '🧠'),
    h('h3', null, title),
    sub ? h('p', { class: 'muted' }, sub) : null,
    h('a', { class: 'btn', href: '#/thought' }, 'Back to list'))
}

function loadingCard() {
  return h('div', { class: 'card empty' }, h('div', { class: 'empty-icon' }, '⏳'), h('h3', null, 'Loading…'))
}

function listHeader() {
  return h('div', { class: 'page-header' },
    h('div', null,
      h('span', { class: 'eyebrow' }, 'Memory recall'),
      h('h1', null, 'Thought Processes'),
      h('p', { class: 'muted' }, 'Read it, pick the structure and method, recall the key lines, say the complexity.')))
}

function categoryStats(ids, statusMap) {
  const total = ids.length
  const green = ids.filter(id => isDone(statusMap[id])).length
  return { total, pct: total ? Math.round((green / total) * 100) : 0 }
}

function chipEl(label, stats, active, onClick) {
  const chip = h('button', { class: `chip${active ? ' active' : ''}`, type: 'button' },
    label,
    h('span', { class: 'thought-chip-count' }, ` ${stats.total}`),
    stats.total ? h('span', { class: 'thought-chip-pct' }, ` · ${stats.pct}%`) : null)
  chip.addEventListener('click', onClick)
  return chip
}

function buildCategoryChips(categories, items, statusMap, selected, onPick) {
  const chips = [chipEl('All', categoryStats(items.map(i => i.id), statusMap), selected === 'all', () => onPick('all'))]
  for (const cat of categories) chips.push(chipEl(cat.title, categoryStats(cat.items.map(i => i.id), statusMap), selected === cat.id, () => onPick(cat.id)))
  return chips
}

function buildModeChips(selected, onPick) {
  return modeDefs.map(mode => {
    const chip = h('button', { class: `chip${selected === mode.id ? ' active' : ''}`, type: 'button' }, mode.label)
    chip.addEventListener('click', () => onPick(mode.id))
    return chip
  })
}

function itemsForCategory(categories, items, selected) {
  if (selected === 'all') return items
  return categories.find(cat => cat.id === selected)?.items || []
}

function buildQueueIds(pool, mode, statusMap) {
  let list = pool
  if (mode === 'priority') list = sortByPriority(pool).filter(item => !isDone(statusMap[item.id]))
  else if (mode === 'missed') list = pool.filter(item => statusTone(statusMap[item.id]) === 'red')
  else if (mode === 'unseen') list = pool.filter(item => statusTone(statusMap[item.id]) === 'gray')
  const ids = list.map(item => item.id)
  return mode === 'shuffle' ? shuffle(ids) : ids
}

function listRow(item, categories, statusMap, onClick, rank) {
  const tone = statusTone(statusMap[item.id])
  const done = isDone(statusMap[item.id])
  const catTitle = categories.find(cat => cat.id === item.category)?.title || item.category
  const row = h('button', { class: `thought-row${done ? ' is-done' : ''}`, type: 'button' },
    rank != null ? h('span', { class: 'thought-row-rank mono small' }, done ? '✓' : String(rank)) : null,
    h('span', { class: `dot ${toneDot[tone]}` }),
    h('span', { class: 'thought-row-lc mono muted small' }, item.lc != null ? `#${item.lc}` : ''),
    h('span', { class: 'thought-row-title' }, item.title),
    h('span', { class: `pill diff-${String(item.difficulty || '').toLowerCase()}` }, item.difficulty),
    h('span', { class: 'thought-row-cat muted small' }, catTitle),
    rank != null && priorityRank.has(item.id) ? h('span', { class: 'pill thought-core' }, 'Core') : null)
  row.addEventListener('click', onClick)
  return row
}

function renderList(container) {
  const page = h('div', { class: 'page thought-page' })
  container.append(page)
  page.append(listHeader(), loadingCard())

  let destroyed = false
  let unsub = null
  let data = null
  let selectedCategory = 'all'
  let selectedMode = 'priority'

  function startQueue(category, mode, ids) {
    if (!ids.length) return
    saveQueue({ category, mode, ids, index: 0 })
    navigate(`#/thought/${encodeURIComponent(ids[0])}`)
  }

  function runFromRow(item, pool) {
    const ids = pool.map(p => p.id)
    const start = ids.indexOf(item.id)
    const ordered = start >= 0 ? ids.slice(start) : [item.id]
    saveQueue({ category: selectedCategory, mode: 'order', ids: ordered, index: 0 })
    navigate(`#/thought/${encodeURIComponent(item.id)}`)
  }

  function draw() {
    if (destroyed || !data) return
    if (!data.items.length) {
      page.replaceChildren(listHeader(), emptyCard('Building your drills…', 'Content is still being written. This page will pick it up automatically.'))
      return
    }
    const statusMap = getThoughtMap()
    const pool = itemsForCategory(data.categories, data.items, selectedCategory)
    const queueIds = buildQueueIds(pool, selectedMode, statusMap)
    const startBtn = h('button', {
      class: 'btn btn-primary btn-lg thought-start', type: 'button', disabled: !queueIds.length,
    }, queueIds.length ? `Start — ${queueIds.length} problem${queueIds.length > 1 ? 's' : ''}` : 'Nothing in this queue')
    startBtn.addEventListener('click', () => startQueue(selectedCategory, selectedMode, queueIds))

    const shown = selectedMode === 'priority' ? sortByPriority(pool) : pool
    const coreLeft = shown.filter(item => priorityRank.has(item.id) && !isDone(statusMap[item.id])).length
    const rows = shown.map((item, i) => listRow(item, data.categories, statusMap, () => runFromRow(item, shown), selectedMode === 'priority' ? i + 1 : null))

    page.replaceChildren(
      listHeader(),
      h('div', { class: 'card thought-filters' },
        h('div', { class: 'row-wrap thought-chip-row' }, buildCategoryChips(data.categories, data.items, statusMap, selectedCategory, cat => { selectedCategory = cat; draw() })),
        h('div', { class: 'row-wrap thought-chip-row' }, buildModeChips(selectedMode, mode => { selectedMode = mode; draw() })),
        selectedMode === 'priority' ? h('p', { class: 'muted small' }, `Core list first: one problem per pattern, graphs → trees → DP → stacks/tries → strings. ${coreLeft} core left. Yellow and green count as done.`) : null,
        startBtn),
      h('div', { class: 'stack-sm thought-list' }, rows.length ? rows : [h('p', { class: 'muted small' }, 'No problems in this view.')]))
  }

  loadThoughtContent().then(result => {
    if (destroyed) return
    data = result
    draw()
    unsub = subscribe(draw)
  })

  return () => {
    destroyed = true
    if (unsub) unsub()
  }
}

function exampleBox(ex) {
  return h('div', { class: 'thought-example' },
    h('div', { class: 'thought-example-row' }, h('span', { class: 'thought-example-label' }, 'Input'), h('code', { class: 'mono' }, String(ex.input))),
    h('div', { class: 'thought-example-row' }, h('span', { class: 'thought-example-label' }, 'Output'), h('code', { class: 'mono' }, String(ex.output))),
    ex.explanation ? h('p', { class: 'muted small' }, rich(ex.explanation)) : null)
}

function stepperHeader(current) {
  return h('div', { class: 'thought-stepper' }, stepLabels.map((label, i) => {
    const n = i + 1
    const cls = n === current ? 'current' : n < current ? 'done' : ''
    return h('div', { class: `thought-step ${cls}` },
      h('span', { class: 'thought-step-num' }, n < current ? '✓' : String(n)),
      h('span', { class: 'thought-step-label' }, label))
  }))
}

function buildRunner(page, item, data) {
  let queue = loadQueue()
  if (!queue || !Array.isArray(queue.ids) || !queue.ids.includes(item.id)) {
    const catItems = data.categories.find(cat => cat.id === item.category)?.items || [item]
    const ids = catItems.map(i => i.id)
    const start = ids.indexOf(item.id)
    queue = { category: item.category, mode: 'order', ids: start >= 0 ? ids.slice(start) : [item.id], index: 0 }
  } else {
    queue = { ...queue, index: queue.ids.indexOf(item.id) }
  }
  saveQueue(queue)
  const nextItemId = queue.ids[queue.index + 1] || null

  const categoryTitle = data.categories.find(cat => cat.id === item.category)?.title || item.category
  const stepState = { ds: null, method: null, fill: null, time: null, space: null }
  let keyDisposer = null

  function setKeys(fn) {
    if (keyDisposer) window.removeEventListener('keydown', keyDisposer)
    keyDisposer = fn || null
    if (keyDisposer) window.addEventListener('keydown', keyDisposer)
  }

  function goNext() {
    if (nextItemId) {
      saveQueue({ ...queue, index: queue.index + 1 })
      navigate(`#/thought/${encodeURIComponent(nextItemId)}`)
    } else {
      navigate('#/thought')
    }
  }

  const backRow = h('div', { class: 'row-wrap thought-top' },
    h('a', { class: 'btn btn-ghost btn-sm', href: '#/thought' }, '← All problems'),
    h('span', { class: 'muted small' }, categoryTitle))
  const stepperEl = h('div')
  const bodyEl = h('div', { class: 'thought-body' })
  page.replaceChildren(backRow, stepperEl, bodyEl)

  function miniHeader() {
    return h('div', { class: 'row-wrap thought-mini-head' },
      item.lc != null ? h('span', { class: 'pill mono' }, `#${item.lc}`) : null,
      h('span', { class: `pill diff-${String(item.difficulty || '').toLowerCase()}` }, item.difficulty),
      h('b', null, item.title))
  }

  function renderStep1() {
    stepperEl.replaceChildren(stepperHeader(1))
    const goBtn = h('button', { class: 'btn btn-primary btn-lg', type: 'button' }, "I've got an approach →")
    goBtn.addEventListener('click', () => renderStep2())
    bodyEl.replaceChildren(
      h('div', { class: 'card thought-card' },
        h('div', { class: 'row-wrap thought-head-row' },
          item.lc != null ? h('span', { class: 'pill mono' }, `#${item.lc}`) : null,
          h('span', { class: `pill diff-${String(item.difficulty || '').toLowerCase()}` }, item.difficulty),
          h('h2', null, item.title)),
        h('div', { class: 'thought-statement' }, String(item.statement || '').split(/\n\n+/).map(p => h('p', null, rich(p)))),
        item.examples?.length ? h('div', { class: 'thought-examples' }, item.examples.map(ex => exampleBox(ex))) : null,
        item.constraints?.length ? h('div', { class: 'thought-constraints' },
          h('div', { class: 'section-title' }, 'Constraints'),
          h('ul', null, item.constraints.map(c => h('li', { class: 'mono small' }, c)))) : null),
      h('div', { class: 'thought-actions' }, goBtn))
    setKeys(event => {
      if (event.key !== 'Enter') return
      event.preventDefault()
      goBtn.click()
    })
  }

  function renderStep2() {
    stepperEl.replaceChildren(stepperHeader(2))
    const stepStartedAt = Date.now()
    const shuffled = shuffle(item.ds.choices)
    let locked = false

    const select = h('select', { class: 'thought-select' },
      h('option', { value: '', disabled: true, selected: true }, 'Choose a data structure…'),
      shuffled.map(choice => h('option', { value: choice }, choice)))
    const lockBtn = h('button', { class: 'btn btn-primary', type: 'button', disabled: true }, 'Lock in')
    const feedback = h('div', { class: 'thought-feedback-slot' })
    const nextBtn = h('button', { class: 'btn btn-primary', type: 'button', style: { display: 'none' } }, 'Continue →')

    select.addEventListener('change', () => { lockBtn.disabled = !select.value })

    function lock() {
      if (locked || !select.value) return
      locked = true
      const correct = select.value === item.ds.answer
      select.disabled = true
      lockBtn.style.display = 'none'
      stepState.ds = correct
      saveStatus(item.id, { ds: correct })
      try { recordAnswer({ itemId: `${item.id}:ds`, kind: 'thought', skills: item.skills, correct, ms: Date.now() - stepStartedAt }) } catch (error) { console.error(error) }
      feedback.replaceChildren(h('div', { class: `item-why show ${correct ? 'good' : 'bad'}` },
        h('span', { class: 'verdict' }, correct ? 'Correct' : 'Not quite'),
        h('span', null, correct ? 'That is the right structure.' : rich(`Correct: ${item.ds.answer}`))))
      nextBtn.style.display = ''
      nextBtn.focus()
    }
    lockBtn.addEventListener('click', lock)
    nextBtn.addEventListener('click', () => renderStep3())

    bodyEl.replaceChildren(
      h('div', { class: 'card thought-card' },
        miniHeader(),
        h('h3', null, 'Which data structures would you reach for?'),
        select,
        h('div', { class: 'row thought-actions' }, lockBtn, nextBtn),
        feedback))

    setKeys(event => {
      if (event.key !== 'Enter') return
      event.preventDefault()
      if (!locked) lock(); else renderStep3()
    })
  }

  function renderStep3() {
    stepperEl.replaceChildren(stepperHeader(3))
    const stepStartedAt = Date.now()
    const shuffled = shuffle(item.method.choices)
    let locked = false
    let chosen = ''

    const select = h('select', { class: 'thought-select' },
      h('option', { value: '', disabled: true, selected: true }, 'Choose an approach…'),
      shuffled.map(choice => h('option', { value: choice }, choice)))

    const cards = shuffled.map(choice => {
      const card = h('button', { class: 'choice thought-radio', type: 'button' },
        h('span', { class: 'thought-radio-dot' }),
        h('span', { class: 'choice-text' }, rich(choice)))
      card.addEventListener('click', () => { if (!locked) pick(choice) })
      return card
    })

    const lockBtn = h('button', { class: 'btn btn-primary', type: 'button', disabled: true }, 'Lock in')
    const feedback = h('div', { class: 'thought-feedback-slot' })
    const nextBtn = h('button', { class: 'btn btn-primary', type: 'button', style: { display: 'none' } }, 'Continue →')

    function syncUI() {
      select.value = chosen
      cards.forEach((card, i) => card.classList.toggle('checked', shuffled[i] === chosen))
      lockBtn.disabled = !chosen
    }

    function pick(value) { chosen = value; syncUI() }
    select.addEventListener('change', () => pick(select.value))

    function lock() {
      if (locked || !chosen) return
      locked = true
      const correct = chosen === item.method.answer
      select.disabled = true
      lockBtn.style.display = 'none'
      stepState.method = correct
      saveStatus(item.id, { method: correct })
      try { recordAnswer({ itemId: `${item.id}:method`, kind: 'thought', skills: item.skills, correct, ms: Date.now() - stepStartedAt }) } catch (error) { console.error(error) }
      cards.forEach((card, i) => {
        card.disabled = true
        if (shuffled[i] === item.method.answer) card.classList.add('is-correct')
        else if (shuffled[i] === chosen) card.classList.add('is-wrong')
        else card.classList.add('is-dim')
      })
      feedback.replaceChildren(h('div', { class: `item-why show ${correct ? 'good' : 'bad'}` },
        h('span', { class: 'verdict' }, correct ? 'Correct' : 'Not quite'),
        h('span', null, rich(item.method.answer))))
      nextBtn.style.display = ''
      nextBtn.focus()
    }
    lockBtn.addEventListener('click', lock)
    nextBtn.addEventListener('click', () => renderStep4())

    bodyEl.replaceChildren(
      h('div', { class: 'card thought-card' },
        miniHeader(),
        h('h3', null, 'What is the approach?'),
        select,
        h('div', { class: 'thought-radio-list' }, cards),
        h('div', { class: 'row thought-actions' }, lockBtn, nextBtn),
        feedback))

    setKeys(event => {
      if (event.key !== 'Enter') return
      event.preventDefault()
      if (!locked) lock(); else renderStep4()
    })
  }

  function renderStep4() {
    stepperEl.replaceChildren(stepperHeader(4))
    const hideBtn = h('button', { class: 'btn btn-primary btn-lg', type: 'button' }, 'Hide 3 lines & test me →')
    hideBtn.addEventListener('click', () => renderStep5())
    bodyEl.replaceChildren(
      h('div', { class: 'card thought-card' },
        miniHeader(),
        h('h3', null, 'Optimal solution'),
        h('p', { class: 'muted small' }, 'Read it through. Notice the key lines — you will recall them next.'),
        codeBlock(item.code)),
      h('div', { class: 'thought-actions' }, hideBtn))
    setKeys(event => {
      if (event.key !== 'Enter') return
      event.preventDefault()
      hideBtn.click()
    })
  }

  function renderStep5() {
    stepperEl.replaceChildren(stepperHeader(5))
    const stepStartedAt = Date.now()
    const rawLines = String(item.code).replace(/\t/g, '    ').replace(/\s+$/, '').split('\n')
    const blankSet = new Set(item.blanks || [])
    const inputs = {}
    const blankState = {}
    let attempts = 0
    let finished = false

    const lineEls = rawLines.map((line, i) => {
      if (!blankSet.has(i)) {
        return h('div', { class: 'code-line', 'data-line': i + 1 },
          h('span', { class: 'code-ln' }, String(i + 1)),
          h('span', { class: 'code-text', html: highlightPython(line) || ' ' }))
      }
      const indent = line.match(/^\s*/)[0]
      const content = line.slice(indent.length)
      const input = h('input', {
        class: 'thought-fill-input', spellcheck: 'false', autocomplete: 'off', autocapitalize: 'off',
        style: { width: `${Math.max(6, content.length + 2)}ch` }, 'aria-label': `blank line ${i + 1}`,
      })
      input.addEventListener('keydown', event => {
        if (event.key === 'Enter') { event.preventDefault(); check() }
      })
      const showBtn = h('button', { class: 'btn btn-ghost btn-sm thought-show-line', type: 'button' }, 'Show line')
      showBtn.addEventListener('click', () => revealOne(i))
      inputs[i] = input
      blankState[i] = { correct: false, revealed: false, content }
      return h('div', { class: 'code-line thought-fill-line', 'data-line': i + 1 },
        h('span', { class: 'code-ln' }, String(i + 1)),
        h('span', { class: 'code-text thought-fill-text' },
          h('span', { class: 'thought-fill-indent' }, indent), input, showBtn))
    })

    const block = h('pre', { class: 'code-block with-ln thought-fill-code' }, h('code', null, lineEls))
    const checkBtn = h('button', { class: 'btn btn-primary', type: 'button' }, 'Check ', h('span', { class: 'kbd' }, '⌘↵'))
    const attemptsLabel = h('span', { class: 'muted small thought-attempts' }, '2 attempts left')
    const nextBtn = h('button', { class: 'btn btn-primary', type: 'button', style: { display: 'none' } }, 'Continue →')
    const feedback = h('div', { class: 'thought-feedback-slot' })

    function revealOne(i) {
      const state = blankState[i]
      if (state.correct || state.revealed) return
      state.revealed = true
      inputs[i].value = state.content
      inputs[i].disabled = true
      inputs[i].classList.remove('is-wrong')
      inputs[i].classList.add('is-revealed')
      maybeFinish()
    }

    function maybeFinish() {
      const settled = Object.values(blankState).every(state => state.correct || state.revealed)
      if (settled && !finished) finish()
    }

    function check() {
      if (finished) return
      attempts += 1
      let anyWrongRemaining = false
      for (const key of Object.keys(blankState)) {
        const i = Number(key)
        const state = blankState[i]
        if (state.correct || state.revealed) continue
        const ok = lineMatches(inputs[i].value, i, rawLines, item.accept)
        if (!ok && inputs[i].value.trim()) state.typedWrong = inputs[i].value
        if (ok) {
          state.correct = true
          inputs[i].disabled = true
          inputs[i].classList.remove('is-wrong')
          inputs[i].classList.add('is-correct')
        } else {
          inputs[i].classList.add('is-wrong')
          anyWrongRemaining = true
        }
      }
      if (attempts >= 2 && anyWrongRemaining) {
        for (const key of Object.keys(blankState)) {
          const i = Number(key)
          if (!blankState[i].correct) revealOne(i)
        }
      }
      attemptsLabel.textContent = attempts >= 2 ? 'Revealed' : `${2 - attempts} attempt${2 - attempts === 1 ? '' : 's'} left`
      maybeFinish()
    }

    function finish() {
      finished = true
      checkBtn.disabled = true
      Object.values(inputs).forEach(input => { input.disabled = true })
      const correctCount = Object.values(blankState).filter(state => state.correct).length
      const total = Object.keys(blankState).length
      const allCorrect = total > 0 && correctCount === total
      stepState.fill = allCorrect
      saveStatus(item.id, { fill: allCorrect })
      try { recordAnswer({ itemId: `${item.id}:fill`, kind: 'thought', skills: item.skills, correct: allCorrect, ms: Date.now() - stepStartedAt }) } catch (error) { console.error(error) }
      feedback.replaceChildren(h('div', { class: `item-why show ${allCorrect ? 'good' : 'bad'}` },
        h('span', { class: 'verdict' }, allCorrect ? 'All 3 lines' : `${correctCount}/${total} lines`)))
      const typedWrong = Object.entries(blankState).filter(([, state]) => !state.correct && state.typedWrong)
      if (!allCorrect && typedWrong.length) {
        feedback.append(h('div', { class: 'override-row' },
          h('span', { class: 'muted small' }, typedWrong.map(([i, state]) => `L${Number(i) + 1}: ${state.typedWrong.trim()}`).join(' · ')),
          overrideButton({
            onOverride: () => {
              for (const [i, state] of typedWrong) {
                state.correct = true
                inputs[i].classList.remove('is-wrong', 'is-revealed')
                inputs[i].classList.add('is-correct', 'is-overridden')
              }
              applyOverrideVisuals(block)
              const nowAllCorrect = Object.values(blankState).every(state => state.correct)
              const verdict = feedback.querySelector('.item-why')
              if (verdict && nowAllCorrect) {
                verdict.classList.remove('bad')
                verdict.classList.add('good')
                verdict.querySelector('.verdict').textContent = 'Counted as correct'
              }
              if (!nowAllCorrect) return
              stepState.fill = true
              saveStatus(item.id, { fill: true })
              persistOverride({ itemId: `${item.id}:fill`, kind: 'thought', skills: item.skills || [] })
            },
          })))
      }
      nextBtn.style.display = ''
      nextBtn.focus()
    }

    checkBtn.addEventListener('click', check)
    nextBtn.addEventListener('click', () => renderStep6())

    bodyEl.replaceChildren(
      h('div', { class: 'card thought-card' },
        miniHeader(),
        h('h3', null, 'Recall the 3 key lines'),
        block,
        h('div', { class: 'row spread thought-actions' }, h('div', { class: 'row' }, checkBtn, attemptsLabel), nextBtn),
        feedback))

    setKeys(event => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') { event.preventDefault(); check() }
      else if (event.key === 'Enter' && finished) { event.preventDefault(); nextBtn.click() }
    })

    const firstInput = inputs[Object.keys(inputs)[0]]
    setTimeout(() => { if (firstInput?.isConnected) firstInput.focus() }, 30)
  }

  function renderStep6() {
    stepperEl.replaceChildren(stepperHeader(6))
    const stepStartedAt = Date.now()
    const timeChoices = shuffle(item.time.choices)
    const spaceChoices = shuffle(item.space.choices)
    let locked = false

    const timeSelect = h('select', { class: 'thought-select' },
      h('option', { value: '', disabled: true, selected: true }, 'Time complexity…'),
      timeChoices.map(choice => h('option', { value: choice }, choice)))
    const spaceSelect = h('select', { class: 'thought-select' },
      h('option', { value: '', disabled: true, selected: true }, 'Space complexity…'),
      spaceChoices.map(choice => h('option', { value: choice }, choice)))
    const lockBtn = h('button', { class: 'btn btn-primary', type: 'button', disabled: true }, 'Lock in')
    const timeFeedback = h('div', { class: 'thought-feedback-slot' })
    const spaceFeedback = h('div', { class: 'thought-feedback-slot' })
    const summaryBtn = h('button', { class: 'btn btn-primary btn-lg', type: 'button', style: { display: 'none' } }, 'See summary →')

    function updateLock() { lockBtn.disabled = !timeSelect.value || !spaceSelect.value }
    timeSelect.addEventListener('change', updateLock)
    spaceSelect.addEventListener('change', updateLock)

    function lock() {
      if (locked || !timeSelect.value || !spaceSelect.value) return
      locked = true
      timeSelect.disabled = true
      spaceSelect.disabled = true
      lockBtn.style.display = 'none'
      const timeCorrect = timeSelect.value === item.time.answer
      const spaceCorrect = spaceSelect.value === item.space.answer
      stepState.time = timeCorrect
      stepState.space = spaceCorrect
      saveStatus(item.id, { time: timeCorrect, space: spaceCorrect })
      try {
        recordAnswer({ itemId: `${item.id}:time`, kind: 'thought', skills: item.skills, correct: timeCorrect, ms: Date.now() - stepStartedAt })
        recordAnswer({ itemId: `${item.id}:space`, kind: 'thought', skills: item.skills, correct: spaceCorrect, ms: Date.now() - stepStartedAt })
      } catch (error) { console.error(error) }
      timeFeedback.replaceChildren(h('div', { class: `item-why show ${timeCorrect ? 'good' : 'bad'}` },
        h('span', { class: 'verdict' }, timeCorrect ? 'Correct' : `Correct: ${item.time.answer}`),
        h('span', null, rich(item.time.why || ''))))
      spaceFeedback.replaceChildren(h('div', { class: `item-why show ${spaceCorrect ? 'good' : 'bad'}` },
        h('span', { class: 'verdict' }, spaceCorrect ? 'Correct' : `Correct: ${item.space.answer}`),
        h('span', null, rich(item.space.why || ''))))
      summaryBtn.style.display = ''
      summaryBtn.focus()
    }
    lockBtn.addEventListener('click', lock)
    summaryBtn.addEventListener('click', () => renderSummary())

    bodyEl.replaceChildren(
      h('div', { class: 'card thought-card' },
        miniHeader(),
        h('h3', null, 'Time and space complexity'),
        h('div', { class: 'thought-complexity-grid' },
          h('div', { class: 'stack-sm' }, h('div', { class: 'section-title' }, 'Time'), timeSelect, timeFeedback),
          h('div', { class: 'stack-sm' }, h('div', { class: 'section-title' }, 'Space'), spaceSelect, spaceFeedback)),
        h('div', { class: 'row thought-actions' }, lockBtn, summaryBtn)))

    setKeys(event => {
      if (event.key !== 'Enter') return
      event.preventDefault()
      if (!locked) lock(); else renderSummary()
    })
  }

  function renderSummary() {
    stepperEl.replaceChildren(stepperHeader(7))
    const rows = [
      ['Data structure', stepState.ds],
      ['Method', stepState.method],
      ['Fill the lines', stepState.fill],
      ['Time complexity', stepState.time],
      ['Space complexity', stepState.space],
    ]
    const checklist = h('div', { class: 'thought-checklist' }, rows.map(([label, ok]) =>
      h('div', { class: `thought-check-row ${ok === true ? 'good' : ok === false ? 'bad' : ''}` },
        h('span', null, label),
        h('span', { class: 'thought-check-mark' }, ok === true ? '✓' : ok === false ? '✗' : '–'))))

    const sayItCard = h('div', { class: 'card thought-sayit' },
      h('div', { class: 'section-title' }, 'Say this'),
      h('p', { class: 'thought-sayit-text' }, rich(item.sayIt || '')))

    const pitfallCard = item.pitfall ? h('div', { class: 'card thought-pitfall' },
      h('div', { class: 'section-title' }, 'Watch out'),
      h('p', null, rich(item.pitfall))) : null

    const nextBtn = h('button', { class: 'btn btn-primary btn-lg', type: 'button' }, nextItemId ? 'Next problem →' : 'Back to list', h('span', { class: 'kbd' }, 'N'))
    nextBtn.addEventListener('click', goNext)
    const retryBtn = h('button', { class: 'btn', type: 'button' }, 'Retry')
    retryBtn.addEventListener('click', () => {
      stepState.ds = stepState.method = stepState.fill = stepState.time = stepState.space = null
      renderStep1()
    })
    const backBtn = h('a', { class: 'btn btn-ghost', href: '#/thought' }, 'Back to list')

    bodyEl.replaceChildren(
      h('div', { class: 'card thought-card thought-summary' },
        miniHeader(),
        checklist,
        sayItCard,
        pitfallCard,
        h('div', { class: 'row-wrap thought-actions' }, nextBtn, retryBtn, backBtn)))

    setKeys(event => {
      if (event.key.toLowerCase() !== 'n') return
      event.preventDefault()
      goNext()
    })
  }

  renderStep1()

  return () => setKeys(null)
}

async function renderRunner(container, id) {
  const page = h('div', { class: 'page thought-runner' })
  container.append(page)
  page.append(loadingCard())
  const data = await loadThoughtContent()
  const item = data.items.find(entry => entry.id === id)
  if (!item) {
    page.replaceChildren(emptyCard('Problem not found', 'It may still be generating, or this id is stale.'))
    return null
  }
  return buildRunner(page, item, data)
}

export default function render(container, params) {
  const id = params?.id
  if (!id) return renderList(container)
  return renderRunner(container, id)
}
