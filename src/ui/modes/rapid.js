import { h } from '../h.js'
import { renderMcq } from '../items.js'
import { recordAnswer } from '../../store.js'
import { bookmarkButton, itemLabel, resultItemId, companyBadge } from './shared.js'

export default function runRapid(container, items, { seconds = 90, onFinish } = {}) {
  let index = 0
  let combo = 0
  let correct = 0
  let timeLeft = Math.max(5, Math.round(seconds))
  let done = false
  let advanceTimer = null
  const results = []
  const pool = items.filter(Boolean)

  const clock = h('div', { class: 'rapid-clock mono' }, String(timeLeft))
  const comboEl = h('div', { class: 'rapid-combo' })
  const scoreEl = h('div', { class: 'rapid-score mono' }, '0')
  const stage = h('div', { class: 'rapid-item' })
  const flash = h('div', { class: 'rapid-flash' })

  const root = h('div', { class: 'practice-run rapid-run' },
    h('div', { class: 'rapid-bar' },
      h('div', { class: 'rapid-metric' }, clock, h('span', { class: 'muted small' }, 's left')),
      comboEl,
      h('div', { class: 'rapid-metric' }, scoreEl, h('span', { class: 'muted small' }, 'correct'))),
    h('div', { class: 'rapid-card-wrap' }, stage, flash),
    h('div', { class: 'key-hints muted small' }, '1-4 to answer'))
  container.replaceChildren(root)

  const timer = setInterval(() => {
    if (done) return
    timeLeft -= 1
    clock.textContent = String(Math.max(0, timeLeft))
    clock.classList.toggle('low', timeLeft > 0 && timeLeft <= 10)
    if (timeLeft <= 0) finish()
  }, 1000)

  function finish() {
    if (done) return
    done = true
    clearInterval(timer)
    clearTimeout(advanceTimer)
    onFinish?.(results)
  }

  function show() {
    if (done) return
    if (index >= pool.length) {
      if (!pool.length) return finish()
      index = 0
    }
    const item = pool[index]
    flash.className = 'rapid-flash'
    stage.replaceChildren(
      h('div', { class: 'row spread rapid-item-top' },
        h('div', { class: 'row' }, h('span', { class: 'muted small' }, `#${index + 1}`), companyBadge(item, { size: 'xs' })),
        bookmarkButton(item.id)),
      renderMcq(item, result => onAnswer(item, result)))
  }

  function onAnswer(item, result) {
    if (done) return
    const itemId = resultItemId(item)
    try { recordAnswer({ itemId, kind: 'mcq', skills: item.skills || [], correct: result.correct, ms: result.ms }) } catch {}
    combo = result.correct ? combo + 1 : 0
    if (result.correct) correct += 1
    results.push({ itemId, kind: 'mcq', correct: result.correct, skills: item.skills || [], ms: result.ms, label: itemLabel(item) })
    scoreEl.textContent = String(correct)
    comboEl.textContent = combo >= 2 ? `×${combo} combo` : ''
    comboEl.classList.toggle('hot', combo >= 5)
    flash.className = `rapid-flash show ${result.correct ? 'good' : 'bad'}`
    advanceTimer = setTimeout(() => { index += 1; show() }, result.correct ? 420 : 680)
  }

  show()

  const cleanup = () => {
    clearInterval(timer)
    clearTimeout(advanceTimer)
  }
  cleanup.endNow = finish
  return cleanup
}
