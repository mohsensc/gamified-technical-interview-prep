import { h, svg, clear } from '../ui/h.js'
import { createArcade, codeView, shuffle, sample, pickByLevel, rand } from './_engine.js'

const distinctValues = count => sample([1, 2, 3, 4, 5, 6, 7, 8, 9], count).sort((a, b) => a - b)

function chain(prefix, values) {
  const nodes = {}
  values.forEach((val, i) => {
    nodes[`${prefix}${i}`] = { val, next: i + 1 < values.length ? `${prefix}${i + 1}` : null }
  })
  return nodes
}

const puzzles = [
  { id: 'reverse', d: 1, title: 'Reverse the list', skills: ['linked-list'],
    build() {
      const values = shuffle(distinctValues(4))
      return {
        nodes: chain('n', values), env: { head: 'n0', prev: null, curr: 'n0', nxt: null },
        loop: 'curr', resultFrom: 'prev', expected: [...values].reverse(),
        rows: [['n0', 'n1', 'n2', 'n3']],
        template: 'prev, curr = None, head\n\nwhile curr:\n    ???\n\nreturn prev',
        correct: ['nxt = curr.next', 'curr.next = prev', 'prev = curr', 'curr = nxt'],
        distractors: ['curr = curr.next', 'prev.next = curr', 'nxt = prev'],
      }
    } },
  { id: 'insert-after', d: 1, title: 'Insert node after p', skills: ['linked-list'],
    build() {
      const [a, b, c, d] = distinctValues(4)
      const nodes = { ...chain('n', [a, b, d]), x: { val: c, next: null } }
      return {
        nodes, env: { head: 'n0', p: 'n1', node: 'x' },
        resultFrom: 'head', expected: [a, b, c, d],
        rows: [['n0', 'n1', 'n2'], [null, 'x']],
        template: '???\n\nreturn head',
        correct: ['node.next = p.next', 'p.next = node'],
        distractors: ['p.next = node.next', 'node = p.next', 'p = node'],
      }
    } },
  { id: 'delete-curr', d: 1, title: 'Unlink curr (prev is before it)', skills: ['linked-list'],
    build() {
      const values = shuffle(distinctValues(4))
      return {
        nodes: chain('n', values), env: { head: 'n0', prev: 'n1', curr: 'n2' },
        resultFrom: 'head', expected: values.filter((_, i) => i !== 2),
        rows: [['n0', 'n1', 'n2', 'n3']],
        template: '???\n\nreturn head',
        correct: ['prev.next = curr.next'],
        distractors: ['curr = curr.next', 'prev = curr.next', 'curr.next = prev', 'prev.next = curr'],
      }
    } },
  { id: 'push-front', d: 1, title: 'Push node to the front', skills: ['linked-list'],
    build() {
      const values = distinctValues(4)
      const nodes = { ...chain('n', values.slice(1)), x: { val: values[0], next: null } }
      return {
        nodes, env: { head: 'n0', node: 'x' },
        resultFrom: 'head', expected: values,
        rows: [['n0', 'n1', 'n2'], ['x']],
        template: '???\n\nreturn head',
        correct: ['node.next = head', 'head = node'],
        distractors: ['head.next = node', 'head = node.next', 'node = head'],
      }
    } },
  { id: 'append-tail', d: 1, title: 'Append node at tail, keep tail', skills: ['linked-list'],
    build() {
      const values = distinctValues(4)
      const nodes = { ...chain('n', values.slice(0, 3)), x: { val: values[3], next: null } }
      return {
        nodes, env: { head: 'n0', tail: 'n2', node: 'x' },
        resultFrom: 'head', expected: values, requireEnv: { tail: 'x' },
        rows: [['n0', 'n1', 'n2'], [null, null, null, 'x']],
        template: '???\n\nreturn head',
        correct: ['tail.next = node', 'tail = node'],
        distractors: ['tail = node.next', 'node.next = tail', 'tail = tail.next.next'],
      }
    } },
  { id: 'remove-nth', d: 2, title: 'Remove nth from end: left is before target', skills: ['linked-list', 'two-pointers'],
    build() {
      const values = shuffle(distinctValues(4))
      const nodes = { d: { val: 'D', next: 'n0' }, ...chain('n', values) }
      return {
        nodes, env: { dummy: 'd', left: 'n1', right: null },
        resultFrom: 'dummy', skipFirst: true, expected: values.filter((_, i) => i !== 2),
        rows: [['d', 'n0', 'n1', 'n2', 'n3']],
        template: 'while right:\n    left = left.next\n    right = right.next\n\n???\n\nreturn dummy.next',
        correct: ['left.next = left.next.next'],
        distractors: ['left = left.next.next', 'left.next = right', 'left.next.next = left', 'right = left.next'],
      }
    } },
  { id: 'merge-step', d: 2, title: 'Merge step: l1.val ≤ l2.val', skills: ['linked-list', 'two-pointers'],
    build() {
      const [a, b, c, d] = distinctValues(4)
      const nodes = { d: { val: 'D', next: null }, a0: { val: a, next: 'a1' }, a1: { val: d, next: null }, b0: { val: b, next: 'b1' }, b1: { val: c, next: null } }
      return {
        nodes, env: { dummy: 'd', tail: 'd', l1: 'a0', l2: 'b0' },
        resultFrom: 'dummy', skipFirst: true, expected: [a, d], requireEnv: { tail: 'a0', l1: 'a1', l2: 'b0' },
        rows: [['d', 'a0', 'a1'], [null, 'b0', 'b1']],
        template: 'if l1.val <= l2.val:\n    ???\nelse:\n    ...',
        correct: ['tail.next = l1', 'l1 = l1.next', 'tail = tail.next'],
        distractors: ['tail = l1.next', 'l1.next = tail', 'l2 = l2.next'],
      }
    } },
  { id: 'middle', d: 2, title: 'Find the middle with slow & fast', skills: ['linked-list', 'two-pointers'],
    build() {
      const count = 5 + rand(2)
      const values = shuffle(distinctValues(count))
      const middle = Math.floor(count / 2)
      return {
        nodes: chain('n', values), env: { head: 'n0', slow: 'n0', fast: 'n0' },
        loop: 'fast and fast.next', resultFrom: 'head', expected: values, requireEnv: { slow: `n${middle}` },
        rows: [values.map((_, i) => `n${i}`)],
        template: 'slow, fast = head, head\n\nwhile fast and fast.next:\n    ???\n\nreturn slow',
        correct: ['slow = slow.next', 'fast = fast.next.next'],
        distractors: ['fast = fast.next', 'slow = fast.next', 'slow.next = fast'],
      }
    } },
  { id: 'swap-pair', d: 3, title: 'Swap the first pair (dummy before it)', skills: ['linked-list'],
    build() {
      const values = shuffle(distinctValues(4))
      const nodes = { d: { val: 'D', next: 'n0' }, ...chain('n', values) }
      return {
        nodes, env: { dummy: 'd', prev: 'd', first: 'n0', second: 'n1' },
        resultFrom: 'dummy', skipFirst: true, expected: [values[1], values[0], values[2], values[3]],
        rows: [['d', 'n0', 'n1', 'n2', 'n3']],
        template: 'first, second = prev.next, prev.next.next\n\n???',
        correct: ['first.next = second.next', 'second.next = first', 'prev.next = second'],
        distractors: ['second = first.next', 'first.next = second', 'prev = second'],
      }
    } },
  { id: 'rotate', d: 3, title: 'Rotate right by one', skills: ['linked-list'],
    build() {
      const values = shuffle(distinctValues(4))
      return {
        nodes: chain('n', values), env: { head: 'n0', newTail: 'n2', tail: 'n3' },
        resultFrom: 'head', expected: [values[3], values[0], values[1], values[2]],
        rows: [['n0', 'n1', 'n2', 'n3']],
        template: '???\n\nreturn head',
        correct: ['tail.next = head', 'head = tail', 'newTail.next = None'],
        distractors: ['tail.next = None', 'head = newTail', 'newTail = tail'],
      }
    } },
]

const usablePuzzles = puzzles

class RunError extends Error {}

function evaluate(path, env, nodes) {
  if (path === 'None') return null
  const parts = path.split('.')
  if (!(parts[0] in env)) throw new RunError(`NameError: ${parts[0]}`)
  let current = env[parts[0]]
  for (const field of parts.slice(1)) {
    if (field !== 'next') throw new RunError(`Unknown field ${field}`)
    if (current === null) throw new RunError(`'NoneType' has no attribute 'next'`)
    current = nodes[current].next
  }
  return current
}

function assign(line, env, nodes) {
  const [lhs, rhs] = line.split(' = ').map(text => text.trim())
  const value = evaluate(rhs, env, nodes)
  const parts = lhs.split('.')
  if (parts.length === 1) {
    env[lhs] = value
    return
  }
  const owner = evaluate(parts.slice(0, -1).join('.'), env, nodes)
  if (owner === null) throw new RunError(`'NoneType' has no attribute 'next'`)
  nodes[owner].next = value
}

function truthy(condition, env, nodes) {
  for (const term of condition.split(' and ')) {
    if (evaluate(term.trim(), env, nodes) === null) return false
  }
  return true
}

function listValues(startId, nodes, skipFirst) {
  const values = []
  const seen = new Set()
  let current = startId
  while (current !== null && current !== undefined) {
    if (seen.has(current)) return { values, cycle: true }
    seen.add(current)
    values.push(nodes[current].val)
    current = nodes[current].next
  }
  return { values: skipFirst ? values.slice(1) : values, cycle: false }
}

function execute(spec, program) {
  const env = { ...spec.env }
  const nodes = JSON.parse(JSON.stringify(spec.nodes))
  const frames = [{ env: { ...env }, nodes: JSON.parse(JSON.stringify(nodes)), line: null }]
  try {
    let iterations = 0
    const runBody = () => {
      for (const line of program) {
        assign(line, env, nodes)
        frames.push({ env: { ...env }, nodes: JSON.parse(JSON.stringify(nodes)), line })
      }
    }
    if (spec.loop) {
      while (truthy(spec.loop, env, nodes)) {
        if (++iterations > 12) throw new RunError('Infinite loop')
        runBody()
      }
    } else runBody()
  } catch (error) {
    if (!(error instanceof RunError)) throw error
    return { frames, error: error.message }
  }
  const result = listValues(env[spec.resultFrom], nodes, spec.skipFirst)
  if (result.cycle) return { frames, error: 'Cycle! The list loops forever.' }
  const listOk = result.values.join(',') === spec.expected.join(',')
  const envOk = Object.entries(spec.requireEnv || {}).every(([name, id]) => env[name] === id)
  return { frames, values: result.values, ok: listOk && envOk, envOk }
}

let markerSeed = 0

function drawList(spec, frame, highlight) {
  const width = 560
  const rowHeight = 92
  const cell = 96
  const position = {}
  spec.rows.forEach((row, r) => row.forEach((id, c) => {
    if (id) position[id] = { x: 34 + c * cell, y: 34 + r * rowHeight }
  }))
  const height = spec.rows.length * rowHeight + 20
  const markerId = `ptr-arrow-${++markerSeed}`
  const boxW = 44, boxH = 32
  const arrows = []
  for (const [id, node] of Object.entries(frame.nodes)) {
    if (!node.next || !position[id] || !position[node.next]) continue
    const a = position[id], b = position[node.next]
    const startX = a.x + boxW / 2, startY = a.y
    const endX = b.x - boxW / 2 - 4, endY = b.y
    const straight = b.y === a.y && b.x > a.x && b.x - a.x <= cell
    const d = straight
      ? `M ${startX} ${startY} L ${endX} ${endY}`
      : b.y !== a.y
        ? `M ${a.x} ${a.y + (b.y > a.y ? boxH / 2 : -boxH / 2)} C ${a.x} ${(a.y + b.y) / 2}, ${b.x} ${(a.y + b.y) / 2}, ${b.x} ${b.y + (b.y > a.y ? -boxH / 2 - 4 : boxH / 2 + 4)}`
        : `M ${a.x} ${a.y - boxH / 2} C ${a.x} ${a.y - 52}, ${b.x} ${b.y - 52}, ${b.x} ${b.y - boxH / 2 - 4}`
    arrows.push(svg('path', { d, class: `ptr-edge${straight ? '' : ' bent'}`, 'marker-end': `url(#${markerId})` }))
  }
  const labels = {}
  for (const [name, id] of Object.entries(frame.env)) {
    if (id && position[id]) (labels[id] ||= []).push(name)
  }
  const boxes = Object.entries(position).map(([id, { x, y }]) => svg('g', { class: `ptr-node${highlight?.includes(id) ? ' hot' : ''}` },
    svg('rect', { x: x - boxW / 2, y: y - boxH / 2, width: boxW, height: boxH, rx: 8 }),
    svg('text', { x, y: y + 1, 'text-anchor': 'middle', 'dominant-baseline': 'middle' }, String(frame.nodes[id].val)),
    (labels[id] || []).map((name, k) => svg('text', { class: 'ptr-label', x, y: y + boxH / 2 + 13 + k * 13, 'text-anchor': 'middle' }, name))))
  const nullNames = Object.entries(frame.env).filter(([, id]) => id === null).map(([name]) => name)
  return h('div', { class: 'ptr-diagram' },
    svg('svg', { class: 'ptr-svg', viewBox: `0 0 ${width} ${height}`, preserveAspectRatio: 'xMinYMid meet' },
      svg('defs', null, svg('marker', { id: markerId, viewBox: '0 0 10 10', refX: '8', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse' },
        svg('path', { d: 'M 0 0 L 10 5 L 0 10 z', class: 'ptr-arrowhead' }))),
      arrows, boxes),
    nullNames.length ? h('div', { class: 'row row-wrap ptr-nulls' }, nullNames.map(name => h('span', { class: 'chip mono' }, `${name} → None`))) : null)
}

function mount(container, api) {
  let spec = null
  let puzzle = null
  let bank = []
  let program = []
  let locked = false
  let startTime = 0
  let diagramHost, programHost, bankHost, feedback, runButton

  function nextPuzzle(ctx) {
    if (ctx.over()) return
    puzzle = pickByLevel(usablePuzzles, Math.min(3, Math.ceil(ctx.level / 1.5)))
    spec = puzzle.build()
    bank = shuffle([...spec.correct, ...sample(spec.distractors, Math.min(spec.distractors.length, 3))])
    program = []
    locked = false
    startTime = performance.now()
    clear(ctx.stage)
    diagramHost = h('div', { class: 'ptr-host' })
    programHost = h('div', { class: 'ptr-program' })
    bankHost = h('div', { class: 'ptr-bank' })
    feedback = h('div', { class: 'game-feedback' })
    runButton = h('button', { class: 'btn btn-primary', onclick: () => run(ctx) }, 'Run ', h('span', { class: 'kbd' }, 'Enter'))
    ctx.stage.append(h('div', { class: 'card game-card fade-in' },
      h('div', { class: 'row row-wrap game-tags' },
        h('span', { class: 'pill pill-pink' }, `🔗 ${puzzle.title}`),
        h('span', { class: 'chip mono' }, `→ ${spec.expected.join(' → ')}`)),
      diagramHost,
      h('div', { class: 'ptr-columns' },
        h('div', { class: 'stack-sm' }, h('div', { class: 'section-title' }, 'Template'), codeView(spec.template)),
        h('div', { class: 'stack-sm' }, h('div', { class: 'section-title' }, '??? ='), programHost)),
      h('div', { class: 'section-title' }, 'Lines'),
      bankHost,
      h('div', { class: 'row' }, runButton, h('button', { class: 'btn btn-ghost', onclick: () => undo() }, 'Undo ', h('span', { class: 'kbd' }, '⌫'))),
      feedback))
    diagramHost.append(drawList(spec, { env: spec.env, nodes: spec.nodes }))
    renderProgram()
  }

  function renderProgram() {
    clear(programHost)
    if (!program.length) programHost.append(h('div', { class: 'muted small' }, 'Pick lines in order'))
    program.forEach((line, i) => programHost.append(h('button', { class: 'ptr-line chosen', onclick: () => removeAt(i) }, h('span', { class: 'ptr-step' }, String(i + 1)), line)))
    clear(bankHost)
    bank.forEach((line, i) => bankHost.append(h('button', {
      class: `ptr-line${program.includes(line) ? ' used' : ''}`,
      disabled: program.includes(line) || locked,
      onclick: () => add(line),
    }, h('span', { class: 'kbd' }, String(i + 1)), line)))
  }

  function add(line) {
    if (locked || program.includes(line)) return
    program.push(line)
    renderProgram()
  }

  function undo() {
    if (locked || !program.length) return
    program.pop()
    renderProgram()
  }

  function removeAt(index) {
    if (locked) return
    program.splice(index, 1)
    renderProgram()
  }

  function run(ctx) {
    if (locked || !program.length || ctx.over()) return
    locked = true
    runButton.disabled = true
    renderProgram()
    const result = execute(spec, program)
    const frames = result.frames.slice(-14)
    let i = 0
    const playFrame = () => {
      const frame = frames[i]
      clear(diagramHost)
      const target = frame.line ? frame.env[frame.line.split(' = ')[0].split('.')[0]] : null
      diagramHost.append(drawList(spec, frame, target ? [target] : []))
      if (frame.line) diagramHost.append(h('div', { class: 'ptr-running mono small' }, `▶ ${frame.line}`))
      i++
      if (i < frames.length) ctx.later(playFrame, 380)
      else finish(ctx, result)
    }
    playFrame()
  }

  function finish(ctx, result) {
    const seconds = (performance.now() - startTime) / 1000
    const canonical = spec.correct.join('; ')
    const why = result.error
      ? `${result.error}. One fix: ${canonical}`
      : result.ok ? `Pointers rewired cleanly.` : `Got ${result.values.join(' → ') || 'empty'}${result.envOk === false ? ' (pointer left in the wrong spot)' : ''}. One fix: ${canonical}`
    if (result.ok) {
      ctx.hit(200, Math.max(0, 1 - seconds / 40))
      ctx.resolve(true, { skills: puzzle.skills, id: `pointer-surgery:${puzzle.id}` })
      feedback.append(h('div', { class: 'game-why good' }, `✓ ${why}`))
      ctx.waitFor(() => nextPuzzle(ctx), 1500)
      return
    }
    ctx.resolve(false, {
      skills: puzzle.skills,
      id: `pointer-surgery:${puzzle.id}`,
      mistake: { summary: puzzle.title, yours: program.join('; '), answer: canonical, why: result.error || 'Order matters: save what you are about to overwrite first.' },
    })
    const alive = ctx.miss()
    feedback.append(
      h('div', { class: 'game-why bad' }, h('strong', null, result.error ? 'Crash' : 'Wrong list'), h('span', null, why)),
      h('button', { class: 'btn btn-primary game-continue', onclick: () => ctx.proceed() }, alive ? 'Continue ' : 'Results ', h('span', { class: 'kbd' }, 'Enter')))
    ctx.waitFor(() => (alive ? nextPuzzle(ctx) : ctx.end()))
  }

  return createArcade(container, api, {
    title: 'Pointer Surgery',
    icon: '🔗',
    rules: ['build the lines', 'watch it run'],
    mode: 'lives',
    lives: 3,
    onStart: ctx => nextPuzzle(ctx),
    onKey: (event, ctx) => {
      if (!spec || locked) return
      if (event.key === 'Enter') {
        event.preventDefault()
        run(ctx)
        return
      }
      if (event.key === 'Backspace') {
        event.preventDefault()
        undo()
        return
      }
      const index = Number(event.key) - 1
      if (Number.isInteger(index) && index >= 0 && index < bank.length) {
        event.preventDefault()
        add(bank[index])
      }
    },
  })
}

export const _test = { puzzles: usablePuzzles, execute }

export default {
  id: 'pointer-surgery',
  title: 'Pointer Surgery',
  icon: '🔗',
  blurb: 'Rewire linked lists without losing nodes.',
  skills: ['linked-list'],
  mount,
}
