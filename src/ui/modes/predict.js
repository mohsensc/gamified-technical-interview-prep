import { h } from '../h.js'
import { icon } from '../icons.js'
import { mountStepper } from '../../viz/stepper.js'
import { traceById } from '../../content/index.js'
import { bookmarkButton, companyBadge } from './shared.js'

export default function runPredict(container, items, { onFinish, nextLabel = 'Finish' } = {}) {
  let index = 0
  let stepperDestroy = null
  const results = []

  const head = h('div', { class: 'row spread pm-predict-head' })
  const host = h('div', { class: 'pm-predict-host' })
  const nextButton = h('button', { class: 'btn btn-primary', onclick: () => advance() }, ['Next trace ', icon('arrowRight', 16)])
  const root = h('div', { class: 'practice-run pm-predict' }, head, host, h('div', { class: 'row pm-predict-actions' }, nextButton))
  container.replaceChildren(root)

  function readScore() {
    const text = host.querySelector('.st-score')?.textContent || ''
    const match = text.match(/(\d+)\s*\/\s*(\d+)/)
    return match ? { hits: Number(match[1]), total: Number(match[2]) } : { hits: 0, total: 0 }
  }

  function loadTrace() {
    const item = items[index]
    if (!item) return finish()
    const trace = traceById[item.traceId]
    if (!trace) {
      index += 1
      return loadTrace()
    }
    head.replaceChildren(
      h('div', { class: 'row' },
        h('span', { class: 'muted small' }, items.length > 1 ? `Trace ${index + 1}/${items.length}` : 'Predict the trace'),
        companyBadge(item, { size: 'xs' })),
      bookmarkButton(item.id))
    if (stepperDestroy) stepperDestroy()
    host.replaceChildren()
    stepperDestroy = mountStepper(host, trace)
    nextButton.replaceChildren(...(index + 1 < items.length ? ['Next trace ', icon('arrowRight', 16)] : [nextLabel]))
    setTimeout(() => host.querySelector('.st-predict-toggle')?.click(), 0)
  }

  function advance() {
    const item = items[index]
    if (item) {
      const { hits, total } = readScore()
      results.push({ itemId: item.id, kind: 'predict', correct: total > 0 && hits === total, skills: item.skills || [], label: item.title, hits, total })
    }
    index += 1
    if (index >= items.length) return finish()
    loadTrace()
  }

  function finish() {
    if (stepperDestroy) stepperDestroy()
    onFinish?.(results)
  }

  loadTrace()

  const cleanup = () => { if (stepperDestroy) stepperDestroy() }
  cleanup.endNow = finish
  return cleanup
}
