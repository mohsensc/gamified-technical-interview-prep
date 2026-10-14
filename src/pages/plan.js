import { h } from '../ui/h.js'
import { getBiteStatus, subscribe } from '../store.js'
import { weeks, totalPlanMinutes } from '../content/plan.js'
import { findNode } from '../content/curriculum.js'
import { skills } from '../content/skills.js'
import { getInterviewAt } from '../engine/recommend.js'
import { subnav } from '../ui/subnav.js'

const coreBitesOf = block => {
  const mod = findNode(block.id)
  return mod ? mod.bites.filter(bite => !bite.optional) : []
}

export const blockStatus = block => {
  const core = coreBitesOf(block)
  const doneCount = core.filter(bite => getBiteStatus(bite.id).done).length
  return { core, doneCount, done: core.length > 0 && doneCount === core.length }
}

export const currentBlock = () => weeks.flatMap(week => week.modules).find(block => !blockStatus(block).done) || null

export const planMinutesRemaining = () =>
  weeks.flatMap(week => week.modules).filter(block => !blockStatus(block).done).reduce((total, block) => total + block.minutes, 0)

const formatMinutes = minutes => {
  const hours = Math.floor(minutes / 60)
  const rest = Math.round(minutes % 60)
  if (!hours) return `${rest}m`
  return rest ? `${hours}h ${rest}m` : `${hours}h`
}

const weekStatus = week => {
  const statuses = week.modules.map(block => ({ block, ...blockStatus(block) }))
  const doneMinutes = statuses.filter(s => s.done).reduce((total, s) => total + s.block.minutes, 0)
  return { week, statuses, doneMinutes, pct: week.minutes ? doneMinutes / week.minutes : 0, done: statuses.length > 0 && statuses.every(s => s.done) }
}

const countdownPill = interviewAt => {
  if (!interviewAt) return null
  const hoursLeft = Math.max(0, (interviewAt.getTime() - Date.now()) / 3600e3)
  const text = hoursLeft < 48 ? `${Math.max(1, Math.round(hoursLeft))}h to interview` : `${Math.round(hoursLeft / 24)}d to interview`
  return h('span', { class: 'pill pill-sky' }, text)
}

function weekBlockRow(status) {
  const { block, done, core, doneCount } = status
  const pct = core.length ? doneCount / core.length * 100 : 0
  return h('a', { class: `card plan-head${done ? ' done' : ''}`, href: block.href },
    h('span', { style: 'font-size:18px' }, block.unitIcon),
    h('div', { class: 'grow stack-sm' },
      h('div', { class: 'row-wrap' },
        h('h3', null, block.title),
        block.mustLearn ? h('span', { class: 'pill pill-amber' }, block.gap?.tier || 'Must-learn') : null,
        done ? h('span', { class: 'pill pill-green' }, 'Done') : null),
      h('div', { class: 'row-wrap' },
        h('span', { class: 'small muted' }, block.unitTitle),
        block.skills.slice(0, 3).map(skill => h('span', { class: 'pill' }, skills[skill]?.label || skill))),
      h('div', { class: 'progress', style: 'margin-top:2px' }, h('div', { style: { width: `${pct}%` } }))),
    h('div', { class: 'stack-sm', style: 'align-items:flex-end' },
      h('span', { class: 'mono small' }, formatMinutes(block.minutes)),
      h('span', { class: 'muted small mono' }, `${doneCount}/${core.length}`)))
}

function weekCard(info, isOpen, toggle) {
  const { week, statuses, doneMinutes, pct, done } = info
  const doneCount = statuses.filter(s => s.done).length
  const header = h('div', { class: 'spread', style: 'cursor:pointer', onclick: () => toggle(week.id) },
    h('div', { class: 'stack-sm grow' },
      h('div', { class: 'row-wrap' }, h('h3', null, week.title), done ? h('span', { class: 'pill pill-green' }, 'Complete') : null),
      h('p', { class: 'muted small' }, week.focus),
      h('div', { class: 'progress' }, h('div', { style: { width: `${pct * 100}%` } }))),
    h('div', { class: 'stack-sm', style: 'align-items:flex-end;flex-shrink:0' },
      h('span', { class: 'mono small' }, `${formatMinutes(doneMinutes)} / ${formatMinutes(week.minutes)}`),
      h('span', { class: 'muted small' }, `${doneCount}/${statuses.length} modules`),
      h('button', { class: 'btn-icon', type: 'button', onclick: event => { event.stopPropagation(); toggle(week.id) } }, isOpen ? '▾' : '▸')))
  const body = isOpen ? h('div', { class: 'stack-sm', style: 'margin-top:14px' }, statuses.map(weekBlockRow)) : null
  return h('div', { class: 'card stack' }, header, body)
}

export default function render(container) {
  const page = h('div', { class: 'page' })
  container.appendChild(page)
  let openWeek = null

  const draw = () => {
    const weekInfos = weeks.map(weekStatus)
    const doneMinutes = weekInfos.reduce((total, info) => total + info.doneMinutes, 0)
    const current = weekInfos.find(info => !info.done)
    if (openWeek === null) openWeek = (current || weekInfos[weekInfos.length - 1])?.week.id || null
    const currentBite = current?.statuses.find(s => !s.done)

    const header = h('div', { class: 'page-header' },
      h('div', null,
        h('h1', null, 'Study plan'),
        h('p', { class: 'muted small' }, `${formatMinutes(totalPlanMinutes)} · ${weeks.length} weeks, must-learn gaps first`)),
      countdownPill(getInterviewAt()))

    const progressCard = h('div', { class: 'card stack-sm' },
      h('div', { class: 'spread' },
        h('span', { class: 'section-title' }, 'Overall progress'),
        h('span', { class: 'mono small muted' }, `${totalPlanMinutes ? Math.round(doneMinutes / totalPlanMinutes * 100) : 0}%`)),
      h('div', { class: 'progress' }, h('div', { style: { width: `${totalPlanMinutes ? doneMinutes / totalPlanMinutes * 100 : 0}%` } })),
      currentBite ? h('div', { class: 'row-wrap', style: 'margin-top:8px' },
        h('span', { class: 'muted small' }, `Up next · ${current.week.title}`),
        h('b', null, currentBite.block.title),
        h('a', { class: 'btn btn-primary btn-sm', href: currentBite.block.href }, 'Open ▸'))
        : h('div', { class: 'row', style: 'margin-top:8px' }, h('b', null, 'All four weeks done. Nice work.')))

    const weekCards = weekInfos.map(info => weekCard(info, openWeek === info.week.id, id => { openWeek = openWeek === id ? null : id; draw() }))

    page.replaceChildren(subnav('handbook', 'plan'), header, progressCard, h('div', { class: 'stack' }, weekCards))
  }

  draw()
  return subscribe(draw)
}
