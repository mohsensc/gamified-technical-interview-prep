import { h } from '../ui/h.js'
import { getBiteStatus, subscribe } from '../store.js'
import { planBlocks, totalPlanMinutes, interviewTime, interviewLabel } from '../content/plan.js'
import { findNode } from '../content/curriculum.js'
import { skills } from '../content/skills.js'

const coreBitesOf = block => {
  const mod = findNode(block.id)
  return mod ? mod.bites.filter(bite => !bite.optional) : []
}

export const blockStatus = block => {
  const core = coreBitesOf(block)
  const doneCount = core.filter(bite => getBiteStatus(bite.id).done).length
  return { core, doneCount, done: core.length > 0 && doneCount === core.length }
}

export const currentBlock = () => planBlocks.find(block => !blockStatus(block).done) || null

export const planMinutesRemaining = () =>
  planBlocks.filter(block => !blockStatus(block).done).reduce((total, block) => total + block.minutes, 0)

const formatMinutes = minutes => {
  const hours = Math.floor(minutes / 60)
  const rest = Math.round(minutes % 60)
  if (!hours) return `${rest}m`
  return rest ? `${hours}h ${rest}m` : `${hours}h`
}

export default function render(container) {
  const page = h('div', { class: 'page' })
  container.appendChild(page)

  const draw = () => {
    const statuses = planBlocks.map(block => ({ block, ...blockStatus(block) }))
    const doneMinutes = statuses.filter(s => s.done).reduce((total, s) => total + s.block.minutes, 0)
    const remainingMinutes = totalPlanMinutes - doneMinutes
    const current = statuses.find(s => !s.done)
    const hoursLeft = Math.max(0, (interviewTime().getTime() - Date.now()) / 3600e3)

    const header = h('div', { class: 'page-header' },
      h('div', null,
        h('h1', null, 'Cram plan'),
        h('p', null, `${formatMinutes(totalPlanMinutes)} · ${planBlocks.length} blocks · must-learn gaps first`)),
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
        h('a', { class: 'btn btn-primary btn-sm', href: current.block.href }, 'Open ▸'))
        : h('div', { class: 'row', style: 'margin-top:8px' }, h('b', null, 'All blocks done. Sleep well.')))

    let elapsed = 0
    const timeline = h('div', { class: 'timeline' }, statuses.map(status => {
      const { block, done, core, doneCount } = status
      const startAt = elapsed
      elapsed += block.minutes
      const isCurrent = current && current.block.id === block.id
      const pct = core.length ? doneCount / core.length * 100 : 0
      return h('div', { class: `plan-block${done ? ' done' : ''}${isCurrent ? ' current' : ''}` },
        h('div', { class: 'plan-dot' }, done ? '✓' : ''),
        h('a', { class: 'card plan-head', href: block.href },
          h('span', { style: 'font-size:18px' }, block.unitIcon),
          h('div', { class: 'grow stack-sm' },
            h('div', { class: 'row-wrap' },
              h('h3', null, block.title),
              block.mustLearn ? h('span', { class: 'pill pill-amber' }, block.gap?.tier || 'Must-learn') : null,
              isCurrent ? h('span', { class: 'pill pill-sky' }, 'now') : null),
            h('div', { class: 'row-wrap' },
              h('span', { class: 'small muted' }, block.unitTitle),
              block.skills.map(skill => h('span', { class: 'pill' }, skills[skill]?.label || skill))),
            h('div', { class: 'progress', style: 'margin-top:2px' }, h('div', { style: { width: `${pct}%` } }))),
          h('div', { class: 'stack-sm', style: 'align-items:flex-end' },
            h('span', { class: 'mono small' }, formatMinutes(block.minutes)),
            h('span', { class: 'faint small mono' }, `+${formatMinutes(startAt)}`)),
          h('span', { class: 'muted small mono' }, `${doneCount}/${core.length}`)))
    }))

    page.replaceChildren(header, progressCard, timeline)
  }

  draw()
  return subscribe(draw)
}
