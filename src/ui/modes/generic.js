import { h } from '../h.js'
import { renderItem, kindOf, kindLabel } from '../items.js'
import { recordAnswer, rateCard } from '../../store.js'
import { bookmarkButton, itemLabel, resultItemId, companyBadge, keyHintRow, comboMeter } from './shared.js'
import { overrideResult } from '../../engine/session.js'

export default function runGeneric(container, items, { onFinish, endless = false, loadMore } = {}) {
  let pool = [...items]
  let index = 0
  let answered = false
  let advanceTimer = null
  let combo = 0
  let ended = false
  const results = []

  const progressFill = h('div', { class: 'progress-fill' })
  const progressEl = h('div', { class: 'progress practice-progress' }, progressFill)
  const counterEl = h('span', { class: 'muted small mono' })
  const comboEl = comboMeter(0)
  const stage = h('div', { class: 'card practice-item-card' })
  const hintEl = h('div')
  const nextButton = h('button', { class: 'btn btn-primary', onclick: () => next() }, 'Next ', h('span', { class: 'kbd' }, '↵'))
  const skipButton = h('button', { class: 'btn btn-ghost', onclick: () => next(true) }, 'Skip')
  nextButton.hidden = true

  const root = h('div', { class: 'practice-run generic-run' },
    h('div', { class: 'row spread practice-run-top' }, h('div', { class: 'row' }, counterEl, comboEl), progressEl),
    stage,
    hintEl,
    h('div', { class: 'row practice-run-actions' }, skipButton, nextButton))
  container.replaceChildren(root)

  function finishNow() {
    if (ended) return
    ended = true
    clearTimeout(advanceTimer)
    onFinish?.(results)
  }

  function updateHeader() {
    progressFill.style.width = endless ? '100%' : `${(index / pool.length) * 100}%`
    counterEl.textContent = endless ? `#${index + 1}` : `${Math.min(index + 1, pool.length)}/${pool.length}`
    comboEl.textContent = combo >= 2 ? `×${combo}` : ''
    comboEl.classList.toggle('hot', combo >= 5)
  }

  function show() {
    answered = false
    nextButton.hidden = true
    skipButton.hidden = false
    const item = pool[index]
    const kind = kindOf(item)
    stage.replaceChildren(
      h('div', { class: 'row spread practice-item-top' },
        h('div', { class: 'row' }, h('span', { class: `chip kind-chip kind-${kind}` }, kindLabel[kind] || kind), companyBadge(item, { size: 'xs' })),
        bookmarkButton(item.id)),
      renderItem(item, result => onAnswer(item, kind, result), { onOverride: () => onOverride(item, kind) }))
    hintEl.replaceChildren(keyHintRow(kind))
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
    combo = result.correct ? combo + 1 : 0
    updateHeader()
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
    const { result } = overrideResult(results, entry => entry.itemId === itemId, { itemId, kind, skills: item.skills || [] })
    if (!result) return
    combo += 1
    updateHeader()
  }

  function next(skipped = false) {
    if (!answered && !skipped) return
    if (skipped && !answered) {
      const item = pool[index]
      results.push({ itemId: resultItemId(item), kind: kindOf(item), correct: false, skills: item.skills || [], label: itemLabel(item), skipped: true })
      combo = 0
    }
    index += 1
    if (index >= pool.length) {
      if (endless && typeof loadMore === 'function') {
        let extra = []
        try { extra = loadMore(results) || [] } catch { extra = [] }
        if (extra.length) {
          pool.push(...extra)
          show()
          return
        }
      }
      finishNow()
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

  const cleanup = () => {
    clearTimeout(advanceTimer)
    document.removeEventListener('keydown', onKey)
  }
  cleanup.endNow = finishNow
  return cleanup
}
