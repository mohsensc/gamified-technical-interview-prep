import { runQuiz, part, rand } from './_engine.js'

function buildOps(level) {
  const opsCount = Math.min(11, 5 + Math.floor(level / 1.3) + rand(3))
  const stack = []
  const ops = []
  for (let i = 0; i < opsCount; i++) {
    const doPop = stack.length > 0 && (rand(3) === 0 || i === opsCount - 1 && stack.length > 2 && rand(2) === 0)
    if (doPop) {
      const val = stack.pop()
      ops.push({ type: 'pop', val })
    } else {
      const val = 1 + rand(99)
      stack.push(val)
      ops.push({ type: 'push', val })
    }
  }
  if (!stack.length) {
    const val = 1 + rand(99)
    stack.push(val)
    ops.push({ type: 'push', val })
  }
  return { ops, finalStack: [...stack] }
}

function opsToCode(ops) {
  const lines = ['stack = []']
  for (const op of ops) lines.push(op.type === 'push' ? `stack.append(${op.val})` : 'stack.pop()')
  return lines.join('\n')
}

function stackLabel(list) {
  return `[${list.join(', ')}]`
}

function stackVariants(finalStack) {
  const variants = new Set([stackLabel(finalStack)])
  if (finalStack.length > 1) variants.add(stackLabel([...finalStack].reverse()))
  if (finalStack.length > 1) {
    const swapped = [...finalStack]
    const n = swapped.length
    ;[swapped[n - 1], swapped[n - 2]] = [swapped[n - 2], swapped[n - 1]]
    variants.add(stackLabel(swapped))
  }
  if (finalStack.length > 2) variants.add(stackLabel(finalStack.slice(0, -1)))
  if (finalStack.length > 2) variants.add(stackLabel(finalStack.slice(1)))
  variants.add(stackLabel([...finalStack, finalStack[finalStack.length - 1]]))
  return [...variants]
}

export function makeQuestion(level = 1) {
  const { ops, finalStack } = buildOps(level)
  const code = opsToCode(ops)
  const answer = stackLabel(finalStack)
  const variants = stackVariants(finalStack)
  const topVal = finalStack[finalStack.length - 1]
  const prevVal = finalStack.length > 1 ? finalStack[finalStack.length - 2] : null
  const poppedVal = [...ops].reverse().find(op => op.type === 'pop')?.val
  const popDistractors = [...new Set([prevVal, poppedVal, 1 + rand(99), 1 + rand(99)].filter(v => v !== undefined && v !== null && v !== topVal))].map(String)
  return {
    id: `stack-sim:${ops.length}:${finalStack.join('-')}`,
    skills: ['stack'],
    tag: '🥞 Predict the stack',
    summary: `Stack after ${ops.length} ops`,
    code,
    parts: [
      part('Stack now, bottom → top?', answer, variants, `Last in, first out: ${answer}.`),
      part('Next stack.pop() returns?', String(topVal), popDistractors, `The top is the most recent value still on the stack: ${topVal}.`),
    ],
  }
}

export default {
  id: 'stack-sim',
  title: 'Stack Sim',
  icon: '🥞',
  blurb: 'Trace push and pop, call the final state.',
  skills: ['stack'],
  difficulty: 'Escalates with streak',
  modeLabel: '70s timer',
  supportsDaily: true,
  mount: (container, api) => runQuiz(container, api, {
    title: 'Stack Sim',
    icon: '🥞',
    rules: ['LIFO only', 'state, then top'],
    mode: 'timed',
    seconds: 70,
    speedMs: 11000,
    seed: api.seed,
    makeQuestion,
  }),
}
