import { h } from '../ui/h.js'
import { codeBlock } from '../ui/code.js'
import { recordAnswer, markSeen } from '../store.js'
import { renderPanels, prepareLayouts } from './render.js'
import { deepClone, formatValue, flash, setText } from './util.js'
import { rich, stripMarks } from '../ui/rich.js'
import { icon } from '../ui/icons.js'

const maxSteps = 2000
const baseDelay = 1000

export function buildSteps(trace, input) {
  const steps = []
  const capSignal = { cap: true }
  let error = null
  const t = {
    step(line, snapshot = {}) {
      if (steps.length >= maxSteps) throw capSignal
      steps.push({ ...deepClone(snapshot || {}), line: Number(line) || 0 })
    },
  }
  try {
    trace.run(deepClone(input), t)
  } catch (caught) {
    if (caught !== capSignal) error = caught?.message || String(caught)
  }
  return { steps, error, capped: steps.length >= maxSteps }
}

export function mountStepper(container, trace, options = {}) {
  const inputs = trace.inputs?.length ? trace.inputs : [{ label: 'default', value: null }]
  let inputIndex = Math.min(Math.max(0, options.inputIndex ?? 0), inputs.length - 1)
  let customValue = null
  let run = { steps: [], error: null }
  let layoutCtx = null
  let index = 0
  let playing = false
  let timer = null
  let speed = Number(options.speed) || 1
  let predicting = false
  let awaiting = false
  let score = { hits: 0, total: 0 }
  let lastVars = {}

  const code = codeBlock(trace.code || '', { lineNumbers: true })
  const diagram = h('div', { class: 'st-diagram' })
  const noteEl = h('div', { class: 'st-note' })
  const sayText = h('div', { class: 'st-say-text' })
  const sayEl = h('div', { class: 'st-say' }, h('span', { class: 'st-say-tag' }, icon('mic', 13), ' Say it'), sayText)
  const varsBody = h('div', { class: 'st-vars-body' })
  const varsEl = h('div', { class: 'st-vars' }, varsBody)
  const errorEl = h('div', { class: 'st-error' })

  const counter = h('span', { class: 'st-counter mono' })
  const prevButton = h('button', { class: 'btn btn-icon st-prev', title: 'Back (left arrow key)', 'aria-label': 'Previous step', onclick: () => go(index - 1) }, icon('arrowLeft', 20))
  const nextButton = h('button', { class: 'btn btn-primary st-next', title: 'Next (right arrow key)', 'aria-label': 'Next step', onclick: () => advance() }, icon('arrowRight', 20))
  const playButton = h('button', { class: 'btn btn-icon st-play', title: 'Autoplay (space)', onclick: () => togglePlay() }, icon('play', 16))
  const scrub = h('input', { type: 'range', class: 'st-scrub', min: 0, max: 0, value: 0, oninput: event => go(Number(event.target.value)) })
  const ticks = h('div', { class: 'st-ticks' })
  const speedLabel = h('span', { class: 'st-speed-label mono' })
  const speedInput = h('input', {
    type: 'range', class: 'st-speed', min: 0.25, max: 4, step: 0.25, value: speed, title: 'Speed',
    oninput: event => {
      speed = Number(event.target.value)
      speedLabel.textContent = `${speed}×`
      if (playing) schedule()
    },
  })
  speedLabel.textContent = `${speed}×`
  const scoreEl = h('span', { class: 'st-score mono' })
  const predictButton = h('button', { class: 'chip st-predict-toggle', onclick: () => togglePredict() }, icon('target', 14), ' Predict')
  const predictBanner = h('div', { class: 'st-predict-banner' })

  const presetChips = h('div', { class: 'st-presets' })
  const editor = h('textarea', { class: 'st-editor mono', spellcheck: 'false', rows: 3 })
  const editorError = h('span', { class: 'st-editor-error' })
  const editorRow = h('div', { class: 'st-editor-row' }, editor, h('div', { class: 'st-editor-actions' },
    h('button', { class: 'btn btn-sm btn-primary', onclick: () => runCustom() }, 'Run'), editorError))
  editorRow.style.display = 'none'

  const complexity = trace.complexity || {}
  const why = h('div', { class: 'st-why' }, rich(complexity.why || ''))
  why.style.display = 'none'
  const badge = h('button', { class: 'st-badge', title: 'Why?', onclick: () => { why.style.display = why.style.display === 'none' ? '' : 'none' } },
    complexity.time ? h('span', { class: 'pill pill-amber' }, icon('clock', 12), ` ${complexity.time}`) : null,
    complexity.space ? h('span', { class: 'pill pill-sky' }, icon('grid', 12), ` ${complexity.space}`) : null)

  const codePane = h('div', { class: 'st-code' }, code)
  let hintSeen = false
  try { hintSeen = localStorage.getItem('techprep.stepHint') === '1' } catch {}
  const stepHint = hintSeen ? null : h('div', { class: 'st-hint' }, h('span', { class: 'kbd' }, icon('arrowLeft', 12)), h('span', { class: 'kbd' }, icon('arrowRight', 12)), ' to step')
  const dismissHint = () => {
    if (!stepHint || !stepHint.isConnected) return
    stepHint.classList.add('is-gone')
    setTimeout(() => stepHint.remove(), 400)
    try { localStorage.setItem('techprep.stepHint', '1') } catch {}
  }
  const root = h('div', { class: 'stepper' },
    h('div', { class: 'st-head' },
      h('div', { class: 'st-title' }, h('h2', null, stripMarks(trace.title || trace.id)), trace.problem ? h('p', { class: 'muted' }, rich(trace.problem)) : null),
      complexity.time || complexity.space ? badge : null),
    why,
    h('div', { class: 'st-inputs' }, presetChips),
    editorRow,
    h('div', { class: 'st-main' },
      h('div', { class: 'st-left' }, codePane, varsEl),
      h('div', { class: 'st-right' }, predictBanner, noteEl, sayEl, diagram, errorEl)),
    h('div', { class: 'st-controls' },
      h('div', { class: 'st-buttons' }, prevButton, nextButton, playButton),
      h('div', { class: 'st-timeline' }, ticks, scrub),
      counter,
      h('div', { class: 'st-extras' }, h('span', { class: 'st-speed-wrap' }, speedInput, speedLabel), predictButton, scoreEl),
      stepHint))

  container.append(root)

  const renderPresets = () => {
    presetChips.replaceChildren(
      ...inputs.map((preset, i) => h('button', {
        class: `chip${customValue === null && i === inputIndex ? ' active' : ''}`,
        onclick: () => {
          customValue = null
          inputIndex = i
          load()
        },
      }, preset.label || `input ${i + 1}`)),
      h('button', {
        class: `chip st-custom-chip${customValue !== null ? ' active' : ''}`,
        onclick: () => {
          const open = editorRow.style.display === 'none'
          editorRow.style.display = open ? '' : 'none'
          if (open) {
            editor.value = JSON.stringify(customValue !== null ? customValue.value : inputs[inputIndex].value, null, 0) ?? ''
            editor.focus()
          }
        },
      }, icon('edit', 14), ' Custom'))
  }

  const runCustom = () => {
    let value
    try {
      value = JSON.parse(editor.value)
    } catch (parseError) {
      editorError.textContent = 'Invalid JSON'
      return
    }
    const attempt = buildSteps(trace, value)
    if (!attempt.steps.length) {
      editorError.textContent = attempt.error ? `Error: ${attempt.error}` : 'No steps produced'
      return
    }
    editorError.textContent = attempt.error ? `Stopped early: ${attempt.error}` : ''
    customValue = { value }
    load(attempt)
  }

  const load = prebuilt => {
    stop()
    run = prebuilt || buildSteps(trace, customValue !== null ? customValue.value : inputs[inputIndex].value)
    layoutCtx = prepareLayouts(run.steps)
    index = 0
    lastVars = {}
    awaiting = false
    diagram._vizRoot = null
    diagram.replaceChildren()
    scrub.max = Math.max(0, run.steps.length - 1)
    renderTicks()
    renderPresets()
    if (run.error) errorEl.replaceChildren(icon('warning', 14), ` ${run.error}`)
    else if (run.capped) errorEl.replaceChildren(`Capped at ${maxSteps} steps`)
    else errorEl.replaceChildren()
    errorEl.style.display = errorEl.textContent ? '' : 'none'
    show()
  }

  const renderTicks = () => {
    const total = run.steps.length
    ticks.replaceChildren(...run.steps.map((step, i) => (step.say && total > 1
      ? h('button', { class: 'st-tick', title: stripMarks(step.say), style: { left: `calc(${(i / (total - 1)) * 100}% + ${8 - (i / (total - 1)) * 16}px)` }, onclick: () => go(i) })
      : null)).filter(Boolean))
  }

  const setRich = (node, text) => {
    const value = String(text || '')
    if (node.dataset.raw === value) return false
    node.dataset.raw = value
    node.replaceChildren(rich(value))
    return true
  }

  const renderVars = vars => {
    const entries = Object.entries(vars || {})
    const previous = lastVars
    lastVars = {}
    const rows = entries.map(([name, value]) => {
      const text = formatValue(value, 1).replace(/^'(.*)'$/, "'$1'")
      lastVars[name] = text
      return { name, text, changed: name in previous && previous[name] !== text, added: !(name in previous) }
    })
    const existing = new Map([...varsBody.children].map(row => [row.dataset.name, row]))
    const nextRows = rows.map(row => {
      let node = existing.get(row.name)
      if (!node) node = h('div', { class: 'st-var', 'data-name': row.name }, h('span', { class: 'st-var-name mono' }, row.name), h('span', { class: 'st-var-val mono' }))
      setText(node.lastChild, row.text)
      node.lastChild.title = row.text
      if (row.changed || (row.added && Object.keys(previous).length)) flash(node)
      return node
    })
    varsBody.replaceChildren(...nextRows)
    varsEl.style.display = rows.length ? '' : 'none'
  }

  const show = () => {
    const total = run.steps.length
    const step = run.steps[index]
    if (!step) {
      counter.textContent = '0 / 0'
      setRich(noteEl, run.error ? '' : 'No steps')
      sayEl.style.display = 'none'
      code.setHighlight(null)
      renderVars({})
      updateButtons()
      return
    }
    code.setHighlight(step.line)
    renderPanels(diagram, step.panels || [], layoutCtx)
    setRich(noteEl, step.note || '')
    noteEl.style.visibility = step.note ? '' : 'hidden'
    sayEl.style.display = step.say ? '' : 'none'
    if (step.say && setRich(sayText, step.say)) flash(sayEl)
    renderVars(step.vars)
    counter.textContent = `${index + 1} / ${total}`
    scrub.value = index
    updateButtons()
  }

  const updateButtons = () => {
    const total = run.steps.length
    prevButton.disabled = index <= 0
    nextButton.disabled = index >= total - 1
    playButton.replaceChildren(icon(playing ? 'pause' : (index >= total - 1 && total ? 'replay' : 'play'), 16))
    playButton.disabled = predicting
    root.classList.toggle('is-predicting', predicting)
    root.classList.toggle('is-awaiting', awaiting)
    predictButton.classList.toggle('active', predicting)
    scoreEl.textContent = predicting || score.total ? `${score.hits}/${score.total}` : ''
    predictBanner.style.display = predicting ? '' : 'none'
    if (predicting && !predictBanner.dataset.result) predictBanner.replaceChildren(...(awaiting ? [icon('tap', 14), ' Click the line that runs next'] : ['Press Next, then guess the next line']))
  }

  const go = target => {
    const total = run.steps.length
    if (!total) return
    const clamped = Math.max(0, Math.min(total - 1, target))
    if (awaiting && clamped !== index) {
      awaiting = false
      code.setMarks({})
    }
    if (clamped === index && run.steps.length) {
      updateButtons()
      return
    }
    index = clamped
    if (index >= 3) dismissHint()
    show()
  }

  const advance = () => {
    const total = run.steps.length
    if (index >= total - 1) return
    if (!predicting) return go(index + 1)
    const current = run.steps[index]
    const next = run.steps[index + 1]
    if (next.line === current.line || !next.line) return go(index + 1)
    if (awaiting) return
    awaiting = true
    delete predictBanner.dataset.result
    code.setMarks({})
    updateButtons()
  }

  const guess = line => {
    if (!awaiting) return
    const next = run.steps[index + 1]
    if (!next) return
    const correct = line === next.line
    awaiting = false
    score.total += 1
    if (correct) score.hits += 1
    try {
      recordAnswer({ itemId: `${trace.id}:predict`, kind: 'predict', skills: trace.skills || [], correct })
    } catch {}
    code.setMarks(correct ? { [line]: 'good' } : { [line]: 'bad', [next.line]: 'good' })
    predictBanner.dataset.result = correct ? 'good' : 'bad'
    predictBanner.className = `st-predict-banner is-${correct ? 'good' : 'bad'}`
    predictBanner.replaceChildren(icon(correct ? 'check' : 'x', 13), correct ? ` Line ${line}` : ` It was line ${next.line}`)
    index += 1
    show()
    setTimeout(() => {
      if (!root.isConnected) return
      code.setMarks({})
      delete predictBanner.dataset.result
      predictBanner.className = 'st-predict-banner'
      updateButtons()
    }, correct ? 700 : 1400)
  }

  const togglePredict = () => {
    predicting = !predicting
    awaiting = false
    code.setMarks({})
    delete predictBanner.dataset.result
    predictBanner.className = 'st-predict-banner'
    if (predicting) stop()
    updateButtons()
  }

  code.addEventListener('click', event => {
    if (!awaiting) return
    const lineEl = event.target.closest('[data-line]')
    if (lineEl) guess(Number(lineEl.dataset.line))
  })

  const schedule = () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      if (!playing || !root.isConnected) return stop()
      if (index >= run.steps.length - 1) return stop()
      go(index + 1)
      if (index >= run.steps.length - 1) stop()
      else schedule()
    }, baseDelay / speed)
  }

  const togglePlay = () => {
    if (predicting) return
    if (playing) return stop()
    if (index >= run.steps.length - 1) go(0)
    playing = true
    updateButtons()
    schedule()
  }

  function stop() {
    playing = false
    clearTimeout(timer)
    timer = null
    updateButtons()
  }

  const onKey = event => {
    if (!root.isConnected) return
    if (event.metaKey || event.ctrlKey || event.altKey) return
    const target = event.target
    if (target && (target.closest?.('input, textarea, select, [contenteditable="true"]'))) return
    const keys = {
      ArrowRight: () => advance(),
      ArrowLeft: () => go(index - 1),
      Home: () => go(0),
      End: () => go(run.steps.length - 1),
      ' ': () => togglePlay(),
    }
    const action = keys[event.key]
    if (!action) return
    event.preventDefault()
    if (event.key !== ' ' && playing) stop()
    action()
  }
  document.addEventListener('keydown', onKey)

  try {
    markSeen(trace.id)
  } catch {}
  load()

  const destroy = () => {
    stop()
    document.removeEventListener('keydown', onKey)
    root.remove()
  }
  destroy.el = root
  destroy.go = target => go(target)
  destroy.getIndex = () => index
  destroy.getSteps = () => run.steps
  return destroy
}
