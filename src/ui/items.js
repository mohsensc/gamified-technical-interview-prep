import { h } from './h.js'
import { codeBlock } from './code.js'
import { rich } from './rich.js'
import { isValidOrder } from './order.js'
import { splitCloze } from './clozeParse.js'
import { codeMatches } from './codeMatch.js'
import { overrideButton, applyOverrideVisuals } from './override.js'

const now = () => performance.now()

const isTyping = event => {
  const target = event.target
  return target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)
}

export function bindKeys(el, handler, { allowTyping = false } = {}) {
  let armed = false
  setTimeout(() => { armed = true }, 0)
  const listener = event => {
    if (!el.isConnected) {
      if (armed) document.removeEventListener('keydown', listener)
      return
    }
    if (event.metaKey || event.ctrlKey || event.altKey) return
    if (!allowTyping && isTyping(event)) return
    handler(event)
  }
  document.addEventListener('keydown', listener)
  return () => document.removeEventListener('keydown', listener)
}

const shuffle = list => {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export const kindOf = item => {
  if (item.kind) return item.kind
  if (Array.isArray(item.choices)) return 'mcq'
  if (Array.isArray(item.lines)) return 'parsons'
  if (item.front !== undefined) return 'card'
  if (typeof item.code === 'string' && item.code.includes('[[')) return 'cloze'
  return 'mcq'
}

export const kindLabel = { mcq: 'Quiz', cloze: 'Fill in', parsons: 'Reorder', card: 'Card' }

function verdictEl(correct, text, label) {
  return h('div', { class: `item-why show ${correct ? 'good' : 'bad'}` },
    h('span', { class: 'verdict' }, label || (correct ? 'Correct' : 'Not quite')),
    text ? h('span', null, rich(text)) : null)
}

const pinnedChoice = /\b(all|none|both|neither) of\b|^(both|neither)\b/i

export function shuffleMcq(item) {
  const choices = item.choices || []
  if (choices.length < 2 || choices.some(choice => pinnedChoice.test(String(choice)))) return item
  const order = choices.map((_, index) => index)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return { ...item, choices: order.map(index => choices[index]), answer: order.indexOf(item.answer) }
}

export function renderMcq(original, onDone) {
  const item = shuffleMcq(original)
  const started = now()
  let answered = false
  const whySlot = h('div', { class: 'item-why-slot' })
  const choices = item.choices || []
  const buttons = choices.map((choice, index) => h('button', { class: 'choice', onclick: () => pick(index) },
    h('span', { class: 'kbd choice-key' }, String(index + 1)),
    h('span', { class: 'choice-text' }, rich(choice, { autoLink: false }))))

  const el = h('div', { class: 'item item-mcq' },
    h('div', { class: 'item-q' }, rich(item.q)),
    item.code ? codeBlock(item.code) : null,
    h('div', { class: 'choices' }, buttons),
    whySlot)

  function pick(index) {
    if (answered) return
    answered = true
    const correct = index === item.answer
    buttons.forEach((button, i) => {
      button.disabled = true
      if (i === item.answer) button.classList.add('is-correct')
      else if (i === index) button.classList.add('is-wrong')
      else button.classList.add('is-dim')
    })
    whySlot.append(verdictEl(correct, item.why))
    onDone?.({ correct, ms: now() - started, choice: index })
  }

  bindKeys(el, event => {
    const n = Number(event.key)
    if (n >= 1 && n <= choices.length) {
      event.preventDefault()
      pick(n - 1)
    }
  })
  return el
}

const looseKey = text => String(text).replace(/\s+/g, '').replace(/"/g, "'").toLowerCase()
export const blankMatches = (answers, value) => codeMatches(value, answers, { caseInsensitive: true }) || answers.some(answer => looseKey(answer) === looseKey(value) && looseKey(value) !== '')

export const parseCloze = code => splitCloze(code, index => `ZQBLANK${index}ZQ`)

export function renderCloze(item, onDone, { onOverride } = {}) {
  const started = now()
  const { source, blanks } = parseCloze(item.code)
  let checked = false

  const inputs = blanks.map((answers, index) => {
    const longest = Math.max(3, ...answers.map(answer => answer.length))
    const input = h('input', {
      class: 'cloze-input',
      spellcheck: 'false',
      autocomplete: 'off',
      autocapitalize: 'off',
      'aria-label': `blank ${index + 1}`,
      style: { width: `${longest + 1.5}ch` },
      onkeydown: event => {
        if (event.key === 'Enter') {
          event.preventDefault()
          event.stopPropagation()
          check()
        }
      },
    })
    return input
  })

  const block = codeBlock(source)
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT)
  const textNodes = []
  while (walker.nextNode()) if (walker.currentNode.nodeValue.includes('ZQBLANK')) textNodes.push(walker.currentNode)
  for (const node of textNodes) {
    const parts = node.nodeValue.split(/(ZQBLANK\d+ZQ)/)
    const fragment = document.createDocumentFragment()
    for (const part of parts) {
      const match = part.match(/^ZQBLANK(\d+)ZQ$/)
      if (match) fragment.append(h('span', { class: 'cloze-slot' }, inputs[Number(match[1])]))
      else if (part) fragment.append(document.createTextNode(part))
    }
    node.parentNode.replaceChild(fragment, node)
  }

  const feedback = h('div', { class: 'item-why-slot' })
  const hintSlot = h('div')
  const checkButton = h('button', { class: 'btn btn-primary', onclick: () => check() }, 'Check ', h('span', { class: 'kbd' }, '↵'))
  const revealButton = h('button', { class: 'btn btn-ghost', onclick: () => check(true) }, 'Reveal')
  const hintButton = item.hint ? h('button', { class: 'btn btn-ghost', onclick: () => {
    hintSlot.replaceChildren(h('div', { class: 'cloze-hint' }, item.hint))
    hintButton.remove()
  } }, 'Hint') : null

  const el = h('div', { class: 'item item-cloze' },
    h('div', { class: 'item-q' }, item.title || 'Fill in the blanks'),
    h('div', { class: 'cloze-code' }, block),
    hintSlot,
    h('div', { class: 'row item-actions' }, checkButton, hintButton, revealButton),
    feedback)

  function check(giveUp = false) {
    if (checked) return
    checked = true
    const results = inputs.map((input, index) => {
      const ok = !giveUp && blankMatches(blanks[index], input.value)
      input.disabled = true
      input.classList.add(ok ? 'is-correct' : 'is-wrong')
      if (!ok) {
        input.value = input.value || ''
        input.parentNode.append(h('span', { class: 'cloze-answer' }, blanks[index][0]))
      }
      return ok
    })
    const correct = results.length > 0 && results.every(Boolean)
    checkButton.disabled = true
    revealButton.disabled = true
    if (hintButton) hintButton.disabled = true
    const right = results.filter(Boolean).length
    const ms = now() - started
    feedback.append(verdictEl(correct, giveUp ? 'Revealed' : `${right}/${results.length} blanks`))
    if (!correct && !giveUp && inputs.some(input => input.value.trim())) {
      feedback.append(h('div', { class: 'override-row' }, overrideButton({
        onOverride: () => {
          applyOverrideVisuals(el)
          for (const answerEl of el.querySelectorAll('.cloze-answer')) answerEl.classList.add('is-alt')
          onOverride?.({ correct: true, overridden: true, ms })
        },
      })))
    }
    onDone?.({ correct, ms })
  }

  setTimeout(() => { if (el.isConnected) inputs[0]?.focus() }, 50)
  return el
}

export function renderParsons(item, onDone, { onOverride } = {}) {
  const started = now()
  const correctLines = (item.lines || []).map(line => line.replace(/\s+$/, ''))
  const pieces = [
    ...correctLines.map((text, index) => ({ id: `l${index}`, text, distractor: false })),
    ...(item.distractors || []).map((text, index) => ({ id: `d${index}`, text: text.replace(/\s+$/, ''), distractor: true })),
  ]
  let pool = shuffle(pieces)
  if (pool.length > 1 && pool.every((piece, i) => piece.id === pieces[i].id)) pool.reverse()
  let answer = []
  let checked = false
  let dragId = null

  const poolEl = h('div', { class: 'parsons-list parsons-pool', 'data-list': 'pool' })
  const answerEl = h('div', { class: 'parsons-list parsons-answer', 'data-list': 'answer' })
  const feedback = h('div', { class: 'item-why-slot' })
  const checkButton = h('button', { class: 'btn btn-primary', onclick: () => check() }, 'Check')
  const resetButton = h('button', { class: 'btn btn-ghost', onclick: () => {
    if (checked) return
    pool = shuffle(pieces)
    answer = []
    draw()
  } }, 'Reset')

  const findPiece = id => pieces.find(piece => piece.id === id)
  const removeEverywhere = id => {
    pool = pool.filter(piece => piece.id !== id)
    answer = answer.filter(piece => piece.id !== id)
  }

  function move(id, target, index) {
    if (checked) return
    const piece = findPiece(id)
    if (!piece) return
    const list = target === 'answer' ? answer : pool
    const currentIndex = list.findIndex(other => other.id === id)
    removeEverywhere(id)
    const targetList = target === 'answer' ? answer : pool
    let insertAt = index ?? targetList.length
    if (currentIndex !== -1 && currentIndex < insertAt) insertAt -= 1
    targetList.splice(Math.max(0, Math.min(insertAt, targetList.length)), 0, piece)
    draw()
  }

  function lineEl(piece, listName, index) {
    const indent = piece.text.match(/^\s*/)[0].length
    const el = h('div', {
      class: 'parsons-line',
      draggable: checked ? 'false' : 'true',
      'data-id': piece.id,
      tabindex: '0',
      onclick: () => move(piece.id, listName === 'pool' ? 'answer' : 'pool'),
      onkeydown: event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          move(piece.id, listName === 'pool' ? 'answer' : 'pool')
        } else if (listName === 'answer' && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
          event.preventDefault()
          const delta = event.key === 'ArrowUp' ? -1 : 1
          const target = index + delta
          if (target < 0 || target >= answer.length) return
          ;[answer[index], answer[target]] = [answer[target], answer[index]]
          draw()
          answerEl.querySelector(`[data-id="${piece.id}"]`)?.focus()
        }
      },
      ondragstart: event => {
        dragId = piece.id
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', piece.id)
        requestAnimationFrame(() => el.classList.add('dragging'))
      },
      ondragend: () => {
        dragId = null
        el.classList.remove('dragging')
        clearMarkers()
      },
    },
    listName === 'answer' ? h('span', { class: 'parsons-num' }, String(index + 1)) : null,
    h('span', { class: 'parsons-indent', style: { width: `${indent}ch` } },
      Array.from({ length: Math.floor(indent / 4) }, () => h('i', { class: 'indent-guide' }))),
    h('code', { class: 'parsons-text' }, piece.text.trimStart()))
    return el
  }

  const clearMarkers = () => {
    for (const marker of el.querySelectorAll('.drop-before, .drop-after')) marker.classList.remove('drop-before', 'drop-after')
    poolEl.classList.remove('drop-target')
    answerEl.classList.remove('drop-target')
  }

  const dropIndex = (listEl, clientY) => {
    const lines = [...listEl.querySelectorAll('.parsons-line')]
    for (let i = 0; i < lines.length; i++) {
      const box = lines[i].getBoundingClientRect()
      if (clientY < box.top + box.height / 2) return i
    }
    return lines.length
  }

  for (const listEl of [poolEl, answerEl]) {
    listEl.addEventListener('dragover', event => {
      if (!dragId || checked) return
      event.preventDefault()
      clearMarkers()
      listEl.classList.add('drop-target')
      const lines = [...listEl.querySelectorAll('.parsons-line')]
      const index = dropIndex(listEl, event.clientY)
      if (lines[index]) lines[index].classList.add('drop-before')
      else if (lines.length) lines[lines.length - 1].classList.add('drop-after')
    })
    listEl.addEventListener('dragleave', event => {
      if (!listEl.contains(event.relatedTarget)) listEl.classList.remove('drop-target')
    })
    listEl.addEventListener('drop', event => {
      if (!dragId || checked) return
      event.preventDefault()
      const index = dropIndex(listEl, event.clientY)
      const id = dragId
      clearMarkers()
      move(id, listEl.dataset.list, index)
    })
  }

  function draw() {
    poolEl.replaceChildren(...pool.map((piece, i) => lineEl(piece, 'pool', i)))
    answerEl.replaceChildren(...answer.map((piece, i) => lineEl(piece, 'answer', i)))
    if (!answer.length) answerEl.append(h('div', { class: 'parsons-empty muted' }, 'Click or drag lines here'))
    if (!pool.length) poolEl.append(h('div', { class: 'parsons-empty muted' }, 'Empty'))
    checkButton.disabled = checked || answer.length === 0
  }

  function check() {
    if (checked || !answer.length) return
    checked = true
    const hasDistractor = answer.some(piece => piece.distractor)
    const sameLength = answer.length === correctLines.length
    const exact = sameLength && !hasDistractor && answer.every((piece, i) => piece.text === correctLines[i])
    const validReordered = !exact && sameLength && !hasDistractor && isValidOrder(correctLines, answer.map(piece => piece.text))
    const correct = exact || validReordered

    const lineEls = [...answerEl.querySelectorAll('.parsons-line')]
    if (correct) {
      lineEls.forEach(node => node.classList.add('is-correct'))
    } else {
      answer.forEach((piece, i) => {
        const ok = !piece.distractor && correctLines[i] === piece.text
        lineEls[i]?.classList.add(ok ? 'is-correct' : 'is-wrong')
      })
    }
    for (const lineNode of el.querySelectorAll('.parsons-line')) lineNode.setAttribute('draggable', 'false')
    for (const lineNode of poolEl.querySelectorAll('.parsons-line')) {
      if (findPiece(lineNode.dataset.id)?.distractor) lineNode.classList.add('is-discarded')
    }
    checkButton.disabled = true
    resetButton.disabled = true
    const placed = answer.filter((piece, i) => !piece.distractor && piece.text === correctLines[i]).length
    const label = validReordered ? 'Accepted — independent lines can go in any order' : undefined
    feedback.append(verdictEl(correct, correct ? null : `${placed}/${correctLines.length} in place`, label))
    const ms = now() - started
    if (!correct) {
      const solution = h('div', { class: 'parsons-solution' }, h('div', { class: 'label muted' }, 'Answer'), codeBlock(correctLines.join('\n')))
      feedback.append(h('div', { class: 'override-row' }, overrideButton({
        onOverride: () => {
          applyOverrideVisuals(el)
          solution.querySelector('.label').textContent = 'Reference answer'
          onOverride?.({ correct: true, overridden: true, ms })
        },
      })), solution)
    }
    onDone?.({ correct, ms })
  }

  const el = h('div', { class: 'item item-parsons' },
    h('div', { class: 'item-q' }, item.title || 'Put the lines in order'),
    h('div', { class: 'parsons-board' },
      h('div', { class: 'parsons-col' }, h('div', { class: 'parsons-label muted' }, 'Lines', item.distractors?.length ? h('span', { class: 'pill' }, `${item.distractors.length} decoy${item.distractors.length > 1 ? 's' : ''}`) : null), poolEl),
      h('div', { class: 'parsons-col' }, h('div', { class: 'parsons-label muted' }, 'Your solution'), answerEl)),
    h('div', { class: 'row item-actions' }, checkButton, resetButton),
    feedback)

  draw()
  return el
}

export const gradeNames = ['Again', 'Hard', 'Good', 'Easy']

export function renderCard(item, onGrade) {
  const started = now()
  let flipped = false
  let graded = false

  const gradeButtons = gradeNames.map((name, grade) => h('button', {
    class: `btn grade-btn grade-${name.toLowerCase()}`,
    onclick: event => {
      event.stopPropagation()
      grade_(grade)
    },
  }, h('span', { class: 'kbd' }, String(grade + 1)), name))

  const grades = h('div', { class: 'grade-row' }, gradeButtons)
  const flipHint = h('div', { class: 'flip-hint muted' }, 'Tap or ', h('span', { class: 'kbd' }, 'space'), ' to flip')

  const back = h('div', { class: 'flash-face flash-back' },
    h('div', { class: 'flash-text' }, rich(item.back)),
    item.code ? codeBlock(item.code) : null)
  const front = h('div', { class: 'flash-face flash-front' }, h('div', { class: 'flash-text' }, rich(item.front)))
  const cardEl = h('div', { class: 'flash-card', tabindex: '0', onclick: () => flip() }, front, back)

  const el = h('div', { class: 'item item-card' }, cardEl, flipHint, grades)

  function flip() {
    if (graded) return
    flipped = !flipped
    cardEl.classList.toggle('flipped', flipped)
    el.classList.toggle('revealed', flipped || el.classList.contains('revealed'))
    if (flipped) flipHint.classList.add('hide')
  }

  function grade_(grade) {
    if (graded || !el.classList.contains('revealed')) return
    graded = true
    gradeButtons.forEach((button, i) => {
      button.disabled = true
      if (i === grade) button.classList.add('chosen')
    })
    onGrade?.(grade, { ms: now() - started })
  }

  bindKeys(el, event => {
    if (event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault()
      flip()
      return
    }
    const n = Number(event.key)
    if (n >= 1 && n <= 4 && el.classList.contains('revealed')) {
      event.preventDefault()
      grade_(n - 1)
    }
  })
  return el
}

export const overridableKinds = new Set(['cloze', 'parsons'])

export function renderItem(item, onDone, options = {}) {
  const kind = kindOf(item)
  if (kind === 'cloze') return renderCloze(item, onDone, options)
  if (kind === 'parsons') return renderParsons(item, onDone, options)
  if (kind === 'card') return renderCard(item, (grade, { ms }) => onDone?.({ correct: grade >= 2, grade, ms }))
  return renderMcq(item, onDone)
}
