import { h } from '../h.js'
import { renderItem, kindOf, kindLabel } from '../items.js'
import { recordAnswer, rateCard } from '../../store.js'
import { bookmarkButton, itemLabel, resultItemId } from './shared.js'
import { overrideResult } from '../../engine/session.js'

export default function runGeneric(container, items, { onFinish } = {}) {
  let index = 0
  let answered = false
  let advanceTimer = null
  const results = []

  const progressFill = h('div', { class: 'progress-fill' })
  const progressEl = h('div', { class: 'progress practice-progress' }, progressFill)
  const counterEl = h('span', { class: 'muted small mono' })
  const stage = h('div', { class: 'card practice-item-card' })
  const nextButton = h('button', { class: 'btn btn-primary', onclick: () => next() }, 'Next ', h('span', { class: 'kbd' }, '↵'))
  const skipButton = h('button', { class: 'btn btn-ghost', onclick: () => next(true) }, 'Skip')
  nextButton.hidden = true

  const root = h('div', { class: 'practice-run generic-run' },
    h('div', { class: 'row spread practice-run-top' }, counterEl, progressEl),
    stage,
    h('div', { class: 'row practice-run-actions' }, skipButton, nextButton))
  container.replaceChildren(root)

  function updateHeader() {
    progressFill.style.width = `${(index / items.length) * 100}%`
    counterEl.textContent = `${Math.min(index + 1, items.length)}/${items.length}`
  }

  function show() {
    answered = false
    nextButton.hidden = true
    skipButton.hidden = false
    const item = items[index]
    const kind = kindOf(item)
    stage.replaceChildren(
      h('div', { class: 'row spread practice-item-top' },
        h('span', { class: `chip kind-chip kind-${kind}` }, kindLabel[kind] || kind),
        bookmarkButton(item.id)),
      renderItem(item, result => onAnswer(item, kind, result), { onOverride: () => onOverride(item, kind) }))
    updateHeader()
  }

  function onAnswer(item, kind, result) {
    if (answered) return
    answered = true
    clearTimeout(advanceTimer)
    const itemId = resultItemId(item)
    try {
      if (kind === 'card') rateCard(itemId, item.skills || [], result.grade)
      else recordAnswer({ itemId, kind, skills: item.skills || [], correct: result.correct, ms: result.ms })
    } catch {}
    results.push({ itemId, kind, correct: result.correct, skills: item.skills || [], ms: result.ms, label: itemLabel(item) })
    skipButton.hidden = true
    if (kind === 'card') {
      advanceTimer = setTimeout(() => next(), 220)
      return
    }
    nextButton.hidden = false
    nextButton.focus({ preventScroll: true })
  }

  function onOverride(item, kind) {
    const itemId = resultItemId(item)
    overrideResult(results, result => result.itemId === itemId, { itemId, kind, skills: item.skills || [] })
  }

  function next(skipped = false) {
    if (!answered && !skipped) return
    if (skipped && !answered) {
      const item = items[index]
      results.push({ itemId: resultItemId(item), kind: kindOf(item), correct: false, skills: item.skills || [], label: itemLabel(item), skipped: true })
    }
    index += 1
    if (index >= items.length) {
      onFinish?.(results)
      return
    }
    show()
  }

  const onKey = event => {
    if (!root.isConnected) return
    if (event.metaKey || event.ctrlKey || event.altKey) return
    if (event.key === 'Enter' && answered) {
      event.preventDefault()
      next()
    }
  }
  document.addEventListener('keydown', onKey)

  show()

  return () => {
    clearTimeout(advanceTimer)
    document.removeEventListener('keydown', onKey)
  }
}
