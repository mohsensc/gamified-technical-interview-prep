import { h, clear } from '../ui/h.js'
import { codeBlock } from '../ui/code.js'
import { breadcrumb } from '../ui/breadcrumb.js'
import { shuffleMcq } from '../ui/items.js'
import { renderPanels } from '../viz/render.js'
import { mountStepper } from '../viz/stepper.js'
import { findNode, hrefFor, pathTo, nextBite, algorithmById } from '../content/curriculum.js'
import { lessons, traceById } from '../content/index.js'
import { framework, phrases, googleTips, templates } from '../content/narration.js'
import { buildSession } from '../engine/session.js'
import { recordAnswer, completeBite, saveSession, setEventContext, clearEventContext } from '../store.js'
import runRapid from '../ui/modes/rapid.js'
import runDiagnose from '../ui/modes/diagnose.js'
import runPredict from '../ui/modes/predict.js'
import runGeneric from '../ui/modes/generic.js'
import { richText } from '../ui/modes/shared.js'

const lessonById = Object.fromEntries(lessons.map(lesson => [lesson.id, lesson]))

const decodeParam = value => {
  try { return decodeURIComponent(value) } catch { return value }
}

function emptyCard(message) {
  return h('div', { class: 'empty card' }, h('div', { class: 'empty-icon' }, '🧩'), h('p', { class: 'muted' }, message))
}

function askBlock(originalAsk, askId, skillsList) {
  const ask = shuffleMcq(originalAsk)
  let answered = false
  const why = h('div', { class: 'item-why-slot' })
  const buttons = (ask.choices || []).map((choice, index) => h('button', {
    class: 'choice choice-sm',
    onclick: () => {
      if (answered) return
      answered = true
      const correct = index === ask.answer
      buttons.forEach((button, i) => {
        button.disabled = true
        if (i === ask.answer) button.classList.add('is-correct')
        else if (i === index) button.classList.add('is-wrong')
        else button.classList.add('is-dim')
      })
      why.append(h('div', { class: `item-why show ${correct ? 'good' : 'bad'}` },
        h('span', { class: 'verdict' }, correct ? 'Yes' : 'Nope'), ask.why ? h('span', null, ask.why) : null))
      try { recordAnswer({ itemId: askId, kind: 'mcq', skills: skillsList, correct }) } catch {}
    },
  }, h('span', { class: 'kbd choice-key' }, String(index + 1)), h('span', { class: 'choice-text' }, choice)))
  return { el: h('div', { class: 'slide-ask' }, h('div', { class: 'ask-q' }, richText(ask.q)), h('div', { class: 'choices choices-compact' }, buttons), why), buttons }
}

function renderLesson(stage, bite, markDone) {
  const lesson = lessonById[bite.ref]
  if (!lesson) {
    stage.replaceChildren(emptyCard('Lesson not found.'))
    markDone()
    return null
  }
  const slides = lesson.slides || []
  let slideIndex = 0
  let currentAsk = null
  const deck = h('div', { class: 'card slide-deck' })
  stage.replaceChildren(deck)

  function draw() {
    const slide = slides[slideIndex] || {}
    const isLast = slideIndex >= slides.length - 1
    const body = h('div', { class: 'slide-body' })
    const visual = h('div', { class: 'slide-visual' })
    if (slide.svg) visual.append(h('div', { class: 'slide-svg', html: slide.svg }))
    if (slide.panels?.length) {
      const panelHost = h('div', { class: 'slide-panels' })
      visual.append(panelHost)
      try { renderPanels(panelHost, slide.panels) } catch { panelHost.append(h('div', { class: 'muted' }, 'diagram unavailable')) }
    }
    if (slide.code) visual.append(codeBlock(slide.code, { highlightLine: slide.highlight ?? null, dimOthers: Boolean(slide.highlight) }))
    if (visual.childNodes.length) body.append(visual)
    if (slide.points?.length) body.append(h('ul', { class: 'slide-points' }, slide.points.map(point => h('li', null, richText(point)))))
    currentAsk = null
    if (slide.ask) {
      currentAsk = askBlock(slide.ask, `${lesson.id}:ask:${slideIndex}`, lesson.skills || bite.skills || [])
      body.append(currentAsk.el)
    }
    const prevButton = h('button', { class: 'btn btn-ghost', disabled: slideIndex === 0, onclick: () => go(-1) }, '←')
    const nextButton = isLast
      ? h('button', { class: 'btn btn-primary', onclick: () => markDone() }, 'Finish')
      : h('button', { class: 'btn btn-primary', onclick: () => go(1) }, '→')
    deck.replaceChildren(
      h('div', { class: 'row slide-head' },
        h('div', { class: 'slide-lesson muted' }, lesson.title),
        h('div', { class: 'slide-dots' }, slides.map((_, i) => h('button', {
          class: `slide-dot${i === slideIndex ? ' active' : ''}${i < slideIndex ? ' past' : ''}`,
          onclick: () => { slideIndex = i; draw() },
        })))),
      h('h2', { class: 'slide-title' }, slide.title || lesson.title),
      body,
      h('div', { class: 'row slide-nav' }, prevButton, h('span', { class: 'muted slide-count' }, `${slideIndex + 1} / ${slides.length || 1}`), nextButton))
  }

  function go(delta) {
    const target = slideIndex + delta
    if (target < 0 || target >= slides.length) return
    slideIndex = target
    draw()
  }

  const onKey = event => {
    if (event.metaKey || event.ctrlKey || event.altKey) return
    const tag = event.target?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA') return
    if (event.key === 'ArrowRight') { event.preventDefault(); go(1) }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); go(-1) }
    else if (currentAsk && /^[1-4]$/.test(event.key)) currentAsk.buttons[Number(event.key) - 1]?.click()
  }
  document.addEventListener('keydown', onKey)
  draw()
  return () => document.removeEventListener('keydown', onKey)
}

function doneButton(markDone, label = 'Done, mark complete') {
  return h('button', { class: 'btn btn-primary bite-mark-done', onclick: () => markDone() }, label)
}

function renderTraceBite(stage, bite, markDone) {
  const trace = traceById[bite.ref]
  if (!trace) {
    stage.replaceChildren(emptyCard('Trace not found.'))
    markDone()
    return null
  }
  const host = h('div', { class: 'bite-trace-host' })
  stage.replaceChildren(host, h('div', { class: 'row bite-trace-actions' }, doneButton(markDone)))
  return mountStepper(host, trace)
}

function renderAlgoBite(stage, bite, markDone) {
  const algo = algorithmById[bite.ref]
  if (!algo) {
    stage.replaceChildren(emptyCard('Algorithm not found.'))
    markDone()
    return null
  }
  const trace = algo.traceId ? traceById[algo.traceId] : null
  const card = h('div', { class: 'card algo-card stack' },
    h('div', { class: 'row spread' },
      h('h2', null, algo.title),
      h('div', { class: 'row' },
        algo.time ? h('span', { class: 'pill pill-amber mono' }, algo.time) : null,
        algo.space ? h('span', { class: 'pill pill-sky mono' }, algo.space) : null)),
    algo.oneLiner ? h('p', null, richText(algo.oneLiner)) : null,
    algo.mnemonic ? h('div', { class: 'algo-mnemonic' }, '💡 ', richText(algo.mnemonic)) : null,
    algo.whenToUse?.length ? h('div', { class: 'stack-sm' }, h('span', { class: 'label muted' }, 'When'), h('ul', { class: 'slide-points' }, algo.whenToUse.map(line => h('li', null, richText(line))))) : null,
    algo.notWhen?.length ? h('div', { class: 'stack-sm' }, h('span', { class: 'label muted' }, 'Not when'), h('ul', { class: 'slide-points' }, algo.notWhen.map(line => h('li', null, richText(line))))) : null,
    algo.steps?.length ? h('div', { class: 'stack-sm' }, h('span', { class: 'label muted' }, 'Steps'), h('ol', { class: 'algo-steps' }, algo.steps.map(step => h('li', null, richText(step))))) : null,
    algo.whyComplexity ? h('p', { class: 'muted small' }, algo.whyComplexity) : null)
  const host = trace ? h('div', { class: 'bite-trace-host' }) : null
  stage.replaceChildren(card, host, h('div', { class: 'row bite-trace-actions' }, doneButton(markDone)))
  return trace ? mountStepper(host, trace) : null
}

function renderPredictBite(stage, bite, markDone) {
  const trace = traceById[bite.ref]
  if (!trace) {
    stage.replaceChildren(emptyCard('Trace not found.'))
    markDone()
    return null
  }
  const item = { id: `predict:${trace.id}`, kind: 'predict', traceId: trace.id, title: trace.title, skills: trace.skills || [] }
  return runPredict(stage, [item], { onFinish: () => markDone(), nextLabel: 'Done, mark complete' })
}

function renderSessionBite(stage, bite, markDone) {
  let items = []
  try { items = buildSession({ mode: bite.mode, scope: bite.scope }) } catch (error) { console.error(error) }
  if (!items.length) {
    stage.replaceChildren(emptyCard('Nothing to practice here yet.'))
    markDone()
    return null
  }
  setEventContext({ mode: bite.mode, nodeId: bite.moduleId, topic: bite.scope?.topic })
  const onFinish = results => {
    clearEventContext()
    try { saveSession({ mode: bite.mode, scope: bite.scope || {}, results }) } catch {}
    const correct = results.filter(result => result.correct).length
    markDone(results.length ? Math.round((correct / results.length) * 100) : 0)
  }
  if (bite.mode === 'rapid') return runRapid(stage, items, { seconds: Math.max(60, Math.round((bite.minutes || 3) * 60)), onFinish })
  if (bite.mode === 'diagnose') return runDiagnose(stage, items, { onFinish })
  return runGeneric(stage, items, { onFinish })
}

function renderFrameworkRef(stage, markDone) {
  stage.replaceChildren(
    h('div', { class: 'stack' }, framework.map(step => h('div', { class: 'card bite-phase-card stack-sm' },
      h('div', { class: 'row' }, h('span', null, step.icon), h('strong', null, step.title), h('span', { class: 'muted small' }, `${step.minutes}m`)),
      h('p', { class: 'muted small' }, step.goal),
      h('ul', { class: 'slide-points' }, step.checklist.map(item => h('li', null, item)))))),
    doneButton(markDone))
}

function renderTipsRef(stage, markDone) {
  stage.replaceChildren(
    h('div', { class: 'grid' }, googleTips.map(tip => h('div', { class: 'card' }, h('strong', null, tip.title), h('div', { class: 'muted small' }, tip.text)))),
    h('div', { class: 'stack' }, Object.entries(phrases).map(([group, lines]) => h('div', { class: 'card stack-sm' },
      h('strong', null, group.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())),
      lines.map(line => h('div', { class: 'small' }, `"${line}"`))))),
    doneButton(markDone))
}

function renderSimRef(stage, markDone) {
  stage.replaceChildren(
    h('div', { class: 'card stack' },
      h('p', null, 'Run a full 45-minute mock interview with the timer and rubric.'),
      h('a', { class: 'btn btn-primary', href: '#/mock' }, 'Open mock interview →')),
    doneButton(markDone, 'Mark done after you run it'))
}

function renderNarrateRef(stage, templateId, markDone) {
  const template = templates.find(entry => entry.id === templateId)
  if (!template) {
    stage.replaceChildren(emptyCard('Narration template not found.'))
    markDone()
    return null
  }
  let index = 0
  let revealed = false
  const body = h('div', { class: 'card bite-narrate-card stack' })
  stage.replaceChildren(body)

  function draw() {
    const line = template.lines[index]
    if (!line) {
      markDone()
      return
    }
    body.replaceChildren(
      h('div', { class: 'row spread' }, h('span', { class: 'muted small' }, `${index + 1}/${template.lines.length}`), h('span', { class: 'pill' }, line.cue)),
      h('div', { class: 'bite-narrate-line' }, revealed ? richText(line.say) : h('span', { class: 'muted' }, 'Say it out loud, then reveal')),
      h('div', { class: 'row' },
        revealed ? null : h('button', { class: 'btn btn-primary', onclick: () => { revealed = true; draw() } }, 'Reveal'),
        revealed ? h('button', { class: 'btn btn-primary', onclick: () => { index += 1; revealed = false; draw() } }, index + 1 < template.lines.length ? 'Next →' : 'Finish') : null))
  }
  draw()
  return null
}

function renderReadBite(stage, bite, markDone) {
  const isDrill = !bite.ref || bite.ref === 'drill'
  const target = isDrill ? '#/read/drill' : `#/read/${encodeURIComponent(bite.ref)}`
  stage.replaceChildren(
    h('div', { class: 'card stack' },
      h('p', { class: 'muted' }, isDrill
        ? 'Rapid-fire signature drill: title + one-liner, type the class and method signature from memory.'
        : 'Read the full statement, extract the signal, then type the exact signature (class included).'),
      h('a', { class: 'btn btn-primary', href: target }, 'Open Read & Sign →')),
    doneButton(markDone, 'Done, mark complete'))
  return null
}

function renderMockBite(stage, bite, markDone) {
  const ref = bite.ref || ''
  if (ref === 'framework') return renderFrameworkRef(stage, markDone)
  if (ref === 'tips') return renderTipsRef(stage, markDone)
  if (ref === 'sim') return renderSimRef(stage, markDone)
  if (ref.startsWith('narrate:')) return renderNarrateRef(stage, ref.slice('narrate:'.length), markDone)
  stage.replaceChildren(emptyCard('Nothing here yet.'))
  markDone()
  return null
}

function renderBite(container, bite) {
  const crumbs = pathTo(bite.id)
  const startedAt = Date.now()
  let doneShown = false
  const stage = h('div', { class: 'bite-stage' })
  const footer = h('div', { class: 'row bite-footer' }, h('a', { class: 'btn btn-ghost', href: hrefFor(bite.moduleId) }, 'Back to module'))
  const page = h('div', { class: 'page bite-page' },
    breadcrumb(crumbs),
    h('div', { class: 'row spread bite-head' },
      h('h1', null, bite.title),
      h('span', { class: 'pill' }, `${bite.minutes} min`)),
    stage,
    footer)
  container.replaceChildren(page)

  function markDone(score) {
    if (doneShown) return
    doneShown = true
    try { completeBite(bite.id, { ms: Date.now() - startedAt, score }) } catch {}
    const next = nextBite(bite.id, { includeOptional: true })
    footer.replaceChildren(
      h('a', { class: 'btn btn-ghost', href: hrefFor(bite.moduleId) }, 'Back to module'),
      next ? h('a', { class: 'btn btn-primary', href: hrefFor(next.id) }, 'Next bite →') : h('a', { class: 'btn btn-primary', href: hrefFor(bite.moduleId) }, 'Module done →'))
  }

  let cleanup = null
  if (bite.type === 'lesson') cleanup = renderLesson(stage, bite, markDone)
  else if (bite.type === 'trace') cleanup = renderTraceBite(stage, bite, markDone)
  else if (bite.type === 'algo') cleanup = renderAlgoBite(stage, bite, markDone)
  else if (bite.type === 'predict') cleanup = renderPredictBite(stage, bite, markDone)
  else if (['cards', 'rapid', 'quiz', 'diagnose'].includes(bite.type)) cleanup = renderSessionBite(stage, bite, markDone)
  else if (bite.type === 'mock') cleanup = renderMockBite(stage, bite, markDone)
  else if (bite.type === 'read') cleanup = renderReadBite(stage, bite, markDone)
  else {
    stage.replaceChildren(emptyCard('Unknown bite type.'))
    markDone()
  }

  return () => { if (typeof cleanup === 'function') cleanup() }
}

export default function render(container, params = {}) {
  clear(container)
  const id = decodeParam(params.id || '')
  const node = findNode(id)
  if (!node || node.kind !== 'bite') {
    container.append(h('div', { class: 'page' }, h('div', { class: 'empty card' },
      h('div', { class: 'empty-icon' }, '🧩'),
      h('p', { class: 'muted' }, `No bite "${id}".`),
      h('a', { class: 'btn btn-primary', href: '#/course' }, 'Back to course'))))
    return null
  }
  return renderBite(container, node)
}
