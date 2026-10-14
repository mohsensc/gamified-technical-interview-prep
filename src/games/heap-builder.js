import { h } from '../ui/h.js'
import { runQuiz, part, shuffle, rand } from './_engine.js'

function heapPush(heap, value) {
  heap.push(value)
  let idx = heap.length - 1
  while (idx > 0) {
    const parent = Math.floor((idx - 1) / 2)
    if (heap[parent] <= heap[idx]) break
    ;[heap[parent], heap[idx]] = [heap[idx], heap[parent]]
    idx = parent
  }
}

function randomHeap(size) {
  const values = shuffle(Array.from({ length: 30 }, (_, i) => i + 1)).slice(0, size)
  const heap = []
  for (const value of values) heapPush(heap, value)
  return heap
}

function buildPushSteps(heap, value) {
  const arr = [...heap, value]
  const steps = []
  let idx = arr.length - 1
  while (idx > 0) {
    const parent = Math.floor((idx - 1) / 2)
    const swap = arr[idx] < arr[parent]
    steps.push({ idx, parent, parentVal: arr[parent], val: arr[idx], swap, before: [...arr] })
    if (!swap) break
    ;[arr[idx], arr[parent]] = [arr[parent], arr[idx]]
    idx = parent
  }
  return steps
}

function buildPopSteps(heap) {
  const arr = [...heap]
  const popped = arr[0]
  const last = arr.pop()
  if (!arr.length) return { popped, steps: [] }
  arr[0] = last
  const steps = []
  let idx = 0
  while (true) {
    const left = 2 * idx + 1
    const right = 2 * idx + 2
    let smallest = idx
    if (left < arr.length && arr[left] < arr[smallest]) smallest = left
    if (right < arr.length && arr[right] < arr[smallest]) smallest = right
    steps.push({
      idx, val: arr[idx], target: smallest,
      left: left < arr.length ? left : null, leftVal: left < arr.length ? arr[left] : null,
      right: right < arr.length ? right : null, rightVal: right < arr.length ? arr[right] : null,
      before: [...arr],
    })
    if (smallest === idx) break
    ;[arr[idx], arr[smallest]] = [arr[smallest], arr[idx]]
    idx = smallest
  }
  return { popped, steps }
}

function drawHeapArray(arr, roles = {}) {
  return h('div', { class: 'heap-row' }, arr.map((val, i) => h('div', { class: `heap-box${roles[i] ? ` heap-${roles[i]}` : ''}` },
    h('span', { class: 'heap-val' }, String(val)),
    h('span', { class: 'heap-idx' }, String(i)))))
}

function stepVisual(caption, arr, roles) {
  return h('div', { class: 'heap-ask' }, h('div', { class: 'heap-ask-cap' }, caption), drawHeapArray(arr, roles))
}

function pushQuestion(level) {
  const size = Math.min(12, 5 + Math.floor(level / 1.4) + rand(3))
  const heap = randomHeap(size)
  const value = 1 + rand(30)
  const steps = buildPushSteps(heap, value)
  const parts = steps.map((step, i) => {
    const roles = { [step.idx]: 'current', [step.parent]: 'parent' }
    const swapLabel = `Swap with parent (idx ${step.parent}, val ${step.parentVal})`
    const stopLabel = 'Stop — in place'
    const answer = step.swap ? swapLabel : stopLabel
    const why = step.swap ? `${step.val} < ${step.parentVal}, so it keeps bubbling up.` : `${step.val} ≥ ${step.parentVal}: the min-heap property holds here.`
    return part(stepVisual(`Step ${i + 1} · index ${step.idx} (${step.val}) vs parent`, step.before, roles), answer, [swapLabel, stopLabel], why)
  })
  return {
    id: `heap-builder:push:${size}:${value}`,
    skills: ['heap'],
    tag: '🧱 Sift up',
    summary: `Push ${value} into a size-${size} min-heap`,
    prompt: `Push ${value} onto the heap — where does it settle?`,
    parts,
  }
}

function popQuestion(level) {
  const size = Math.min(12, 6 + Math.floor(level / 1.4) + rand(3))
  const heap = randomHeap(size)
  const { popped, steps } = buildPopSteps(heap)
  if (!steps.length) return pushQuestion(level)
  const parts = steps.map((step, i) => {
    const roles = { [step.idx]: 'current' }
    if (step.left != null) roles[step.left] = 'left'
    if (step.right != null) roles[step.right] = 'right'
    const options = []
    if (step.left != null) options.push({ key: 'left', label: `Swap with left (idx ${step.left}, val ${step.leftVal})` })
    if (step.right != null) options.push({ key: 'right', label: `Swap with right (idx ${step.right}, val ${step.rightVal})` })
    options.push({ key: 'stop', label: 'Stop — smaller than both children' })
    const answerKey = step.target === step.idx ? 'stop' : (step.target === step.left ? 'left' : 'right')
    const answerOption = options.find(option => option.key === answerKey)
    const distractors = options.map(option => option.label)
    const why = answerKey === 'stop' ? `${step.val} is already ≤ both children.` : `The smaller child wins: swap with ${answerKey}.`
    return part(stepVisual(`Step ${i + 1} · index ${step.idx} (${step.val}) vs children`, step.before, roles), answerOption.label, distractors, why)
  })
  return {
    id: `heap-builder:pop:${size}`,
    skills: ['heap'],
    tag: '🧱 Sift down',
    summary: `Pop the min from a size-${size} heap (removed ${popped})`,
    prompt: `Pop the min (${popped}) — sift the replacement down`,
    parts,
  }
}

export function makeQuestion(level = 1) {
  return rand(2) === 0 ? pushQuestion(level) : popQuestion(level)
}

export default {
  id: 'heap-builder',
  title: 'Heap Builder',
  icon: '🧱',
  blurb: 'Call every sift-up and sift-down swap.',
  skills: ['heap'],
  difficulty: 'Up to Lv 6',
  modeLabel: '3 lives',
  supportsDaily: true,
  mount: (container, api) => runQuiz(container, api, {
    title: 'Heap Builder',
    icon: '🧱',
    rules: ['predict every swap', 'push or pop'],
    mode: 'lives',
    lives: 3,
    seed: api.seed,
    makeQuestion,
  }),
}
