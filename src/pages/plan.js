import { h } from '../ui/h.js'
import { confetti, toast } from '../ui/h.js'
import { getState, update, subscribe } from '../store.js'
import { planBlocks, totalPlanMinutes, interviewTime } from '../content/plan.js'
import { skills } from '../content/skills.js'

const blockProgress = (block, plan) => {
  const record = plan[block.id] || {}
  const checked = block.steps.filter((_, i) => record.steps?.[i]).length
  const done = Boolean(record.done) || checked === block.steps.length
  return { record, checked, done }
}

export const currentBlock = () => {
  const plan = getState().plan
  return planBlocks.find(block => !blockProgress(block, plan).done) || null
}

export const blockStatus = block => blockProgress(block, getState().plan)

const formatMinutes = minutes => {
  const hours = Math.floor(minutes / 60)
  const rest = Math.round(minutes % 60)
  if (!hours) return `${rest}m`
  return rest ? `${hours}h ${rest}m` : `${hours}h`
}

const stepIcons = { learn: '📖', trace: '🔍', games: '🎮', drill: '🎯', flashcards: '🃏', problems: '🧩', mock: '🎙️', handbook: '📒', plan: '🗺️' }
const stepType = href => (href.replace(/^#\//, '').split(/[/?]/)[0] || 'home')
const stepIcon = href => stepIcons[stepType(href)] || '▸'

const setStep = (blockId, index, value, stepCount) => {
  let finished = false
  update(draft => {
    const record = draft.plan[blockId] || { done: false, steps: {} }
    record.steps = { ...(record.steps || {}), [index]: value }
    const wasDone = record.done
    const allChecked = Array.from({ length: stepCount }, (_, i) => record.steps[i]).every(Boolean)
    record.done = allChecked
    if (allChecked && !wasDone) {
      record.doneAt = Date.now()
      finished = true
    }
    draft.plan[blockId] = record
  })
  return finished
}

const setBlockDone = (block, value) => {
  update(draft => {
    const steps = {}
    block.steps.forEach((_, i) => { steps[i] = value })
    draft.plan[block.id] = { ...(draft.plan[block.id] || {}), done: value, steps, doneAt: value ? Date.now() : null }
  })
}

export default function render(container) {
  const openBlocks = new Set()
  const page = h('div', { class: 'page' })
  container.appendChild(page)

  const draw = () => {
    const plan = getState().plan
    const statuses = planBlocks.map(block => ({ block, ...blockProgress(block, plan) }))
    const doneMinutes = statuses.filter(s => s.done).reduce((total, s) => total + s.block.minutes, 0)
    const remainingMinutes = totalPlanMinutes - doneMinutes
    const current = statuses.find(s => !s.done)
    if (current && openBlocks.size === 0) openBlocks.add(current.block.id)
    const hoursLeft = Math.max(0, (interviewTime().getTime() - Date.now()) / 3600e3)

    const header = h('div', { class: 'page-header' },
      h('div', null,
        h('h1', null, 'Cram plan'),
        h('p', null, `${formatMinutes(totalPlanMinutes)} · ${planBlocks.length} blocks · front-loaded on weak spots`)),
      h('div', { class: 'row-wrap' },
        h('span', { class: 'pill pill-teal' }, `${statuses.filter(s => s.done).length}/${planBlocks.length} done`),
        h('span', { class: 'pill pill-amber' }, `${formatMinutes(remainingMinutes)} left`),
        h('span', { class: 'pill pill-sky' }, `${Math.floor(hoursLeft)}h to interview`)))

    const progressCard = h('div', { class: 'card stack-sm' },
      h('div', { class: 'spread' },
        h('span', { class: 'section-title' }, 'Progress'),
        h('span', { class: 'mono small muted' }, `${Math.round(doneMinutes / totalPlanMinutes * 100)}%`)),
      h('div', { class: 'progress' }, h('div', { style: { width: `${doneMinutes / totalPlanMinutes * 100}%` } })),
      current ? h('div', { class: 'row-wrap', style: 'margin-top:8px' },
        h('span', { class: 'muted small' }, 'Up next'),
        h('b', null, current.block.title),
        h('a', { class: 'btn btn-primary btn-sm', href: current.block.steps[current.checked < current.block.steps.length ? current.block.steps.findIndex((_, i) => !current.record.steps?.[i]) : 0]?.href || '#/drill' }, 'Start ▸'))
        : h('div', { class: 'row', style: 'margin-top:8px' }, h('b', null, 'All blocks done. Sleep well.')))

    let elapsed = 0
    const timeline = h('div', { class: 'timeline' }, statuses.map((status, index) => {
      const { block, done, checked, record } = status
      const startAt = elapsed
      elapsed += block.minutes
      const isCurrent = current && current.block.id === block.id
      const isOpen = openBlocks.has(block.id)
      const toggleOpen = () => {
        if (openBlocks.has(block.id)) openBlocks.delete(block.id)
        else openBlocks.add(block.id)
        draw()
      }
      const blockCheck = h('button', { class: `check${done ? ' on' : ''}`, title: done ? 'Mark not done' : 'Mark done', onclick: event => {
        event.stopPropagation()
        setBlockDone(block, !done)
        if (!done) {
          confetti()
          toast(`Block done: ${block.title}`, 'good')
        }
      } })
      const steps = isOpen ? h('div', { class: 'plan-steps' }, block.steps.map((step, i) => {
        const on = Boolean(record.steps?.[i])
        return h('a', { class: `plan-step${on ? ' checked' : ''}`, href: step.href, onclick: () => {
          if (!on) setStep(block.id, i, true, block.steps.length)
        } },
          h('button', { class: `check${on ? ' on' : ''}`, onclick: event => {
            event.preventDefault()
            event.stopPropagation()
            if (setStep(block.id, i, !on, block.steps.length)) {
              confetti()
              toast(`Block done: ${block.title}`, 'good')
            }
          } }),
          h('span', { class: 'plan-step-label grow' }, step.label),
          h('span', { class: 'plan-step-type', title: stepType(step.href) }, stepIcon(step.href)))
      })) : null
      return h('div', { class: `plan-block${done ? ' done' : ''}${isCurrent ? ' current' : ''}` },
        h('div', { class: 'plan-dot' }, done ? '✓' : ''),
        h('div', { class: 'card' },
          h('div', { class: 'plan-head', onclick: toggleOpen },
            blockCheck,
            h('span', { class: 'plan-num' }, String(index + 1).padStart(2, '0')),
            h('div', { class: 'grow stack-sm' },
              h('div', { class: 'row-wrap' },
                h('h3', null, block.title),
                isCurrent ? h('span', { class: 'pill pill-amber' }, 'now') : null),
              h('div', { class: 'row-wrap' },
                block.skills.map(skill => h('span', { class: 'pill' }, skills[skill]?.label || skill)))),
            h('div', { class: 'stack-sm', style: 'align-items:flex-end' },
              h('span', { class: 'mono small' }, formatMinutes(block.minutes)),
              h('span', { class: 'faint small mono' }, `+${formatMinutes(startAt)}`)),
            h('span', { class: 'muted small mono' }, `${checked}/${block.steps.length}`)),
          steps))
    }))

    page.replaceChildren(header, progressCard, timeline,
      h('div', { class: 'row', style: 'justify-content:flex-end' },
        h('button', { class: 'btn btn-ghost btn-sm', onclick: () => {
          if (confirm('Reset plan progress?')) update(draft => { draft.plan = {} })
        } }, 'Reset plan')))
  }

  draw()
  let lastPlanJson = JSON.stringify(getState().plan)
  const unsubscribe = subscribe(state => {
    const nextJson = JSON.stringify(state.plan)
    if (nextJson !== lastPlanJson) {
      lastPlanJson = nextJson
      draw()
    }
  })
  return unsubscribe
}
