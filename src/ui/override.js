import { h } from './h.js'
import * as store from '../store.js'

export function persistOverride({ itemId, kind, skills = [], mode, topic, nodeId } = {}) {
  if (!itemId) return false
  try {
    return Boolean(store.overrideAnswer?.({ itemId, kind, skills, mode, topic, nodeId }))
  } catch (error) {
    console.warn(error)
    return false
  }
}

export function overrideButton({ onOverride, label = 'I was right', title = 'My answer is also valid. Count it.' } = {}) {
  let used = false
  const pill = h('span', { class: 'pill pill-green override-pill' }, '✓ Counted as correct')
  const button = h('button', {
    class: 'btn btn-ghost btn-sm override-btn',
    type: 'button',
    title,
    onclick: event => {
      event.stopPropagation()
      trigger()
    },
  }, label)

  function trigger() {
    if (used) return
    used = true
    try { onOverride?.() } catch (error) { console.warn(error) }
    if (button.isConnected) button.replaceWith(pill)
  }

  button.trigger = trigger
  return button
}

export function applyOverrideVisuals(container, { verdictText = 'Counted as correct' } = {}) {
  if (!container) return
  for (const node of container.querySelectorAll('.is-wrong')) {
    node.classList.remove('is-wrong')
    node.classList.add('is-correct', 'is-overridden')
  }
  for (const verdict of container.querySelectorAll('.item-why.bad')) {
    verdict.classList.remove('bad')
    verdict.classList.add('good', 'is-overridden')
    const label = verdict.querySelector('.verdict')
    if (label) label.textContent = verdictText
  }
  for (const verdict of container.querySelectorAll('.game-why.bad')) {
    verdict.classList.remove('bad')
    verdict.classList.add('good', 'is-overridden')
  }
  container.classList.add('is-overridden')
}
