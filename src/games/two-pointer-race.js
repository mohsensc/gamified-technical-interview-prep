import { h } from '../ui/h.js'
import { runQuiz, part, rand } from './_engine.js'

function simulateTwoPointer(arr, target) {
  let l = 0
  let r = arr.length - 1
  const steps = []
  while (l < r) {
    const sum = arr[l] + arr[r]
    const action = sum === target ? 'found' : sum < target ? 'left' : 'right'
    steps.push({ l, r, sum, action })
    if (action === 'found') break
    if (action === 'left') l++
    else r--
  }
  return steps
}

function drawRaceArray(arr, l, r, target) {
  return h('div', { class: 'race-ask' },
    h('div', { class: 'heap-ask-cap' }, `L = ${l}, R = ${r}`),
    h('div', { class: 'race-row' }, arr.map((val, i) => h('div', { class: `race-box${i === l ? ' race-l' : ''}${i === r ? ' race-r' : ''}` }, String(val)))),
    h('div', { class: 'race-target muted small' }, `target = ${target} · arr[L] + arr[R] = ${arr[l] + arr[r]}`))
}

export function makeQuestion(level = 1) {
  const n = Math.min(9, 6 + Math.floor(level / 1.6) + rand(2))
  const arr = Array.from({ length: n }, () => 1 + rand(40)).sort((a, b) => a - b)
  const li = rand(n - 2)
  const ri = li + 1 + rand(n - li - 1)
  const target = arr[li] + arr[ri]
  const steps = simulateTwoPointer(arr, target)
  const parts = steps.map(step => {
    const options = {
      left: `Move L → (sum ${step.sum} < target)`,
      right: `Move R ← (sum ${step.sum} > target)`,
      found: 'Found! sum = target',
    }
    const answer = options[step.action]
    const distractors = Object.entries(options).filter(([key]) => key !== step.action).map(([, label]) => label)
    const why = step.action === 'found'
      ? `arr[L] + arr[R] = ${step.sum} = target. Stop here.`
      : step.action === 'left'
        ? `${step.sum} < ${target}: the array is sorted, so only a bigger left value can raise the sum.`
        : `${step.sum} > ${target}: only a smaller right value can lower the sum.`
    return part(drawRaceArray(arr, step.l, step.r, target), answer, distractors, why)
  })
  return {
    id: `two-pointer-race:${arr.join('-')}:${target}`,
    skills: ['two-pointers'],
    tag: '🏁 Two-pointer race',
    summary: `Sorted array, target ${target}`,
    prompt: `Target sum = ${target}. Which move closes the gap?`,
    parts,
  }
}

export default {
  id: 'two-pointer-race',
  title: 'Two-Pointer Race',
  icon: '🏁',
  blurb: 'Call every L/R move until the pointers meet.',
  skills: ['two-pointers'],
  difficulty: '60s timer · escalates',
  modeLabel: '60s timer',
  supportsDaily: true,
  mount: (container, api) => runQuiz(container, api, {
    title: 'Two-Pointer Race',
    icon: '🏁',
    rules: ['sorted array', 'move the pointer that fixes the sum'],
    mode: 'timed',
    seconds: 60,
    speedMs: 6500,
    seed: api.seed,
    makeQuestion,
  }),
}
