import { h, svg, clear } from '../ui/h.js'
import { codeBlock } from '../ui/code.js'
import { renderPanels } from '../viz/render.js'
import { shuffleMcq } from '../ui/items.js'
import * as store from '../store.js'
import { topics, topicById, problems } from '../content/index.js'
import { skills } from '../content/skills.js'
import { rich, stripMarks } from '../ui/rich.js'
import { subnav } from '../ui/subnav.js'
import { icon } from '../ui/icons.js'

const decodeParam = value => {
  try { return decodeURIComponent(value) } catch { return value }
}

const masteryOf = skill => {
  try { return store.getMastery(skill) ?? 0.3 } catch { return 0.3 }
}

const seen = id => {
  try { return store.isSeen(id) } catch { return false }
}

const topicMastery = topic => {
  const list = topic.skills || []
  if (!list.length) return 0
  return list.reduce((sum, skill) => sum + masteryOf(skill), 0) / list.length
}

export function masteryRing(value, size = 56) {
  const radius = size / 2 - 5
  const circumference = 2 * Math.PI * radius
  const level = value >= 0.75 ? 'high' : value >= 0.5 ? 'mid' : 'low'
  return h('div', { class: `ring ring-${level}`, style: { width: `${size}px`, height: `${size}px` } },
    svg('svg', { viewBox: `0 0 ${size} ${size}`, width: size, height: size },
      svg('circle', { class: 'ring-track', cx: size / 2, cy: size / 2, r: radius }),
      svg('circle', {
        class: 'ring-value', cx: size / 2, cy: size / 2, r: radius,
        'stroke-dasharray': `${circumference * value} ${circumference}`,
        transform: `rotate(-90 ${size / 2} ${size / 2})`,
      })),
    h('span', { class: 'ring-label' }, `${Math.round(value * 100)}`))
}

function renderGrid(container) {
  const cards = topics.map(topic => {
    const lessons = topic.lessons || []
    const doneLessons = lessons.filter(lesson => seen(lesson.id)).length
    return h('a', { class: 'card topic-card', href: `#/learn/${encodeURIComponent(topic.id)}` },
      h('div', { class: 'row topic-card-top' },
        h('span', { class: 'topic-icon' }, topic.icon ? icon(topic.icon, 18) : null),
        masteryRing(topicMastery(topic))),
      h('div', { class: 'topic-title' }, stripMarks(topic.title)),
      h('div', { class: 'row topic-meta muted' },
        h('span', null, `${doneLessons}/${lessons.length} lessons`),
        h('span', null, `${(topic.traces || []).length} traces`)))
  })
  const nextTopic = topics.find(topic => (topic.lessons || []).some(lesson => !seen(lesson.id))) || topics[0]
  container.append(h('div', { class: 'page learn-page' },
    subnav('learn', 'learn'),
    h('div', { class: 'page-header row' },
      h('h1', null, 'Learn'),
      nextTopic ? h('a', { class: 'btn btn-primary', href: `#/learn/${encodeURIComponent(nextTopic.id)}` }, 'Start next lesson') : null),
    cards.length ? h('div', { class: 'grid topic-grid' }, cards) : h('div', { class: 'empty card' }, 'No topics yet.')))
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
        h('span', { class: 'verdict' }, correct ? 'Yes' : 'Nope'), ask.why ? h('span', null, rich(ask.why)) : null))
      try { store.recordAnswer({ itemId: askId, kind: 'mcq', skills: skillsList, correct }) } catch {}
    },
  }, h('span', { class: 'kbd choice-key' }, String(index + 1)), h('span', { class: 'choice-text' }, rich(choice))))
  return { el: h('div', { class: 'slide-ask' }, h('div', { class: 'ask-q' }, rich(ask.q)), h('div', { class: 'choices choices-compact' }, buttons), why), buttons }
}

function renderTopic(container, topic) {
  const lessons = topic.lessons || []
  let lessonIndex = Math.max(0, lessons.findIndex(lesson => !seen(lesson.id)))
  let slideIndex = 0
  let currentAsk = null

  const tabs = h('div', { class: 'row lesson-tabs' })
  const deck = h('div', { class: 'card slide-deck' })

  function drawTabs() {
    tabs.replaceChildren(...lessons.map((lesson, i) => h('button', {
      class: `chip lesson-chip${i === lessonIndex ? ' active' : ''}${seen(lesson.id) ? ' done' : ''}`,
      onclick: () => {
        lessonIndex = i
        slideIndex = 0
        drawTabs()
        drawSlide()
      },
    }, seen(lesson.id) ? icon('check', 13) : null, seen(lesson.id) ? ' ' : '', stripMarks(lesson.title))))
  }

  function drawSlide() {
    const lesson = lessons[lessonIndex]
    if (!lesson) {
      deck.replaceChildren(h('div', { class: 'empty' }, 'No lessons yet.'))
      return
    }
    const slides = lesson.slides || []
    const slide = slides[slideIndex] || {}
    const isLast = slideIndex >= slides.length - 1
    if (isLast) {
      try {
        if (!seen(lesson.id)) {
          store.markSeen(lesson.id)
          drawTabs()
        }
      } catch {}
    }

    const body = h('div', { class: 'slide-body' })
    const visual = h('div', { class: 'slide-visual' })
    if (slide.svg) visual.append(h('div', { class: 'slide-svg', html: slide.svg }))
    if (slide.panels?.length) {
      const panelHost = h('div', { class: 'slide-panels' })
      visual.append(panelHost)
      try { renderPanels(panelHost, slide.panels) } catch (error) { panelHost.append(h('div', { class: 'muted' }, 'diagram unavailable')) }
    }
    if (slide.code) visual.append(codeBlock(slide.code, { highlightLine: slide.highlight ?? null, dimOthers: Boolean(slide.highlight) }))
    if (visual.childNodes.length) body.append(visual)
    if (slide.points?.length) body.append(h('ul', { class: 'slide-points' }, slide.points.map(point => h('li', null, rich(point)))))
    currentAsk = null
    if (slide.ask) {
      currentAsk = askBlock(slide.ask, `${lesson.id}:ask:${slideIndex}`, lesson.skills || topic.skills || [])
      body.append(currentAsk.el)
    }

    const prevButton = h('button', { class: 'btn btn-ghost', disabled: slideIndex === 0, onclick: () => go(-1) }, icon('arrowLeft', 16))
    const nextButton = isLast
      ? (lessons[lessonIndex + 1]
        ? h('button', { class: 'btn btn-primary', onclick: () => nextLesson() }, ['Next lesson ', icon('arrowRight', 16)])
        : h('a', { class: 'btn btn-primary', href: `#/drill/${encodeURIComponent(topic.id)}` }, ['Drill it ', icon('arrowRight', 16)]))
      : h('button', { class: 'btn btn-primary', onclick: () => go(1) }, icon('arrowRight', 16))

    deck.replaceChildren(
      h('div', { class: 'row slide-head' },
        h('div', { class: 'slide-lesson muted' }, stripMarks(lesson.title)),
        h('div', { class: 'slide-dots' }, slides.map((_, i) => h('button', {
          class: `slide-dot${i === slideIndex ? ' active' : ''}${i < slideIndex ? ' past' : ''}`,
          'aria-label': `slide ${i + 1}`,
          onclick: () => {
            slideIndex = i
            drawSlide()
          },
        })))),
      h('h2', { class: 'slide-title' }, rich(slide.title || lesson.title)),
      body,
      h('div', { class: 'row slide-nav' }, prevButton, h('span', { class: 'muted slide-count' }, `${slideIndex + 1} / ${slides.length || 1}`), nextButton))
  }

  function go(delta) {
    const lesson = lessons[lessonIndex]
    if (!lesson) return
    const target = slideIndex + delta
    if (target < 0) return
    if (target >= (lesson.slides || []).length) {
      if (lessons[lessonIndex + 1]) nextLesson()
      return
    }
    slideIndex = target
    drawSlide()
  }

  function nextLesson() {
    if (!lessons[lessonIndex + 1]) return
    lessonIndex += 1
    slideIndex = 0
    drawTabs()
    drawSlide()
  }

  const onKey = event => {
    if (event.metaKey || event.ctrlKey || event.altKey) return
    const tag = event.target?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA') return
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      go(1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      go(-1)
    } else if (currentAsk && /^[1-4]$/.test(event.key)) {
      currentAsk.buttons[Number(event.key) - 1]?.click()
    }
  }
  document.addEventListener('keydown', onKey)

  const traces = topic.traces || []
  const topicProblems = problems.filter(problem => problem.topic === topic.id || (topic.problems || []).some(own => own.id === problem.id)).slice(0, 10)

  const skillChips = (topic.skills || []).map(skill => {
    const value = masteryOf(skill)
    return h('a', { class: 'chip skill-drill-chip', href: `#/drill/${encodeURIComponent(skill)}` },
      h('span', null, skills[skill]?.label || skill),
      h('span', { class: 'skill-meter' }, h('span', { style: { width: `${Math.round(value * 100)}%` } })),
      h('span', { class: 'muted' }, `${Math.round(value * 100)}%`))
  })

  container.append(h('div', { class: 'page learn-topic' },
    subnav('learn', 'learn'),
    h('div', { class: 'page-header row' },
      h('a', { class: 'btn btn-ghost', href: '#/learn' }, icon('arrowLeft', 16)),
      h('span', { class: 'topic-icon' }, topic.icon ? icon(topic.icon, 22) : null),
      h('h1', null, stripMarks(topic.title)),
      masteryRing(topicMastery(topic), 48),
      h('a', { class: 'btn learn-drill-all', href: `#/drill/${encodeURIComponent(topic.id)}` }, 'Drill topic')),
    lessons.length ? tabs : null,
    deck,
    traces.length ? h('section', { class: 'stack learn-section' },
      h('h3', null, 'Step through'),
      h('div', { class: 'grid trace-grid' }, traces.map(trace => h('a', { class: 'card trace-link', href: `#/trace/${encodeURIComponent(trace.id)}` },
        h('div', { class: 'trace-link-title row' }, icon('play', 14), ' ', stripMarks(trace.title)),
        trace.problem ? h('div', { class: 'muted trace-link-problem' }, stripMarks(trace.problem)) : null,
        trace.complexity ? h('div', { class: 'row' },
          h('span', { class: 'pill' }, `T ${trace.complexity.time}`),
          h('span', { class: 'pill' }, `S ${trace.complexity.space}`)) : null)))) : null,
    skillChips.length ? h('section', { class: 'stack learn-section' },
      h('h3', null, 'Drill skills'),
      h('div', { class: 'row skill-drill-row' }, skillChips)) : null,
    topicProblems.length ? h('section', { class: 'stack learn-section' },
      h('h3', null, 'Problems'),
      h('div', { class: 'row problem-chip-row' }, topicProblems.map(problem => h('a', { class: 'chip', href: `#/problems/${encodeURIComponent(problem.id)}` },
        problem.lc ? h('span', { class: 'muted' }, `${problem.lc}`) : null, ' ', stripMarks(problem.title))))) : null))

  drawTabs()
  drawSlide()
  return () => document.removeEventListener('keydown', onKey)
}

export default function render(container, params = {}) {
  clear(container)
  if (params.topic) {
    const topic = topicById[decodeParam(params.topic)]
    if (topic) return renderTopic(container, topic)
    container.append(h('div', { class: 'page' }, h('div', { class: 'empty card' }, 'Topic not found. ', h('a', { href: '#/learn' }, 'All topics'))))
    return
  }
  renderGrid(container)
}
