import { h } from '../h.js'
import { icon } from '../icons.js'
import { codeBlock } from '../code.js'
import { renderMcq } from '../items.js'
import { recordAnswer } from '../../store.js'
import { problemById } from '../../content/index.js'
import { bookmarkButton, itemLabel, richText, companyBadge } from './shared.js'

const partLabel = { pattern: 'Pattern', ds: 'Data structure', time: 'Time complexity', space: 'Space complexity' }
const parts = ['pattern', 'ds', 'time', 'space']

function groupByProblem(items) {
  const groups = []
  for (const item of items) {
    const problemId = item.diagnose?.problemId || item.id
    const last = groups[groups.length - 1]
    if (last && last.problemId === problemId) last.items.push(item)
    else groups.push({ problemId, items: [item] })
  }
  return groups
}

export default function runDiagnose(container, items, { onFinish } = {}) {
  const groups = groupByProblem(items)
  let groupIndex = 0
  let partIndex = 0
  const results = []
  const root = h('div', { class: 'practice-run diagnose-run' })
  container.replaceChildren(root)

  function showGroup() {
    const group = groups[groupIndex]
    if (!group) return onFinish?.(results)
    partIndex = 0
    draw(group)
  }

  function draw(group) {
    const problem = problemById[group.problemId]
    const partEl = h('div', { class: 'diagnose-part' })
    const revealEl = h('div', { class: 'diagnose-reveal' })
    const steps = h('div', { class: 'row diagnose-steps' }, parts.map((part, i) => h('span', {
      class: `diagnose-step${i < partIndex ? ' done' : i === partIndex ? ' current' : ''}`,
    }, partLabel[part])))

    root.replaceChildren(h('div', { class: 'card diagnose-card stack' },
      h('div', { class: 'row spread' },
        h('div', { class: 'stack-sm' },
          h('h2', { class: 'diagnose-title' }, problem?.title || 'Problem'),
          h('div', { class: 'row-wrap' },
            problem?.lc ? h('span', { class: 'pill mono' }, `#${problem.lc}`) : null,
            problem?.difficulty ? h('span', { class: 'pill' }, problem.difficulty) : null,
            problem ? companyBadge(problem, { size: 'xs' }) : null)),
        bookmarkButton(group.items[0]?.id)),
      problem?.constraints ? h('div', { class: 'diagnose-constraints mono small muted' }, problem.constraints) : null,
      problem?.signals?.length ? h('div', { class: 'row-wrap' }, problem.signals.map(signal => h('span', { class: 'chip' }, signal))) : null,
      steps,
      partEl,
      revealEl))

    askNext(group, problem, partEl, steps, revealEl)
  }

  function askNext(group, problem, partEl, steps, revealEl) {
    if (partIndex >= group.items.length) return reveal(group, problem, revealEl)
    const item = group.items[partIndex]
    partEl.replaceChildren(
      h('div', { class: 'diagnose-q muted small' }, partLabel[item.diagnose?.part] || 'Question'),
      renderMcq(item, result => {
        try { recordAnswer({ itemId: item.id, kind: 'mcq', skills: item.skills || [], correct: result.correct, ms: result.ms }) } catch {}
        results.push({ itemId: item.id, kind: 'mcq', correct: result.correct, skills: item.skills || [], ms: result.ms, label: itemLabel(item) })
        setTimeout(() => {
          partIndex += 1
          steps.querySelectorAll('.diagnose-step').forEach((el, i) => {
            el.classList.toggle('done', i < partIndex)
            el.classList.toggle('current', i === partIndex)
          })
          askNext(group, problem, partEl, steps, revealEl)
        }, 550)
      }))
  }

  function reveal(group, problem, revealEl) {
    if (!problem) {
      next()
      return
    }
    revealEl.replaceChildren(
      problem.insight ? h('div', { class: 'diagnose-insight stack-sm' }, h('span', { class: 'label muted' }, 'Insight'), h('div', null, richText(problem.insight))) : null,
      problem.narration?.length ? h('div', { class: 'diagnose-narration stack-sm' },
        h('span', { class: 'label muted' }, 'Say it'),
        problem.narration.map(line => h('div', { class: 'diagnose-say' }, richText(line)))) : null,
      problem.solution ? h('details', { class: 'diagnose-solution' }, h('summary', null, 'Solution'), codeBlock(problem.solution)) : null,
      h('button', { class: 'btn btn-primary', onclick: () => next() }, groupIndex < groups.length - 1 ? ['Next problem ', icon('arrowRight', 16)] : 'Finish'))
  }

  function next() {
    groupIndex += 1
    showGroup()
  }

  showGroup()

  const cleanup = () => {}
  cleanup.endNow = () => onFinish?.(results)
  return cleanup
}
