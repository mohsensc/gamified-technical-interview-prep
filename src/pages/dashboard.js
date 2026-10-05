import { h } from '../ui/h.js'
import { getState, subscribe, getMastery, getSkillRecord, weakestSkills, dueItems, getLevelInfo, getStreak, getStudyMinutes, getToday } from '../store.js'
import { skillGroups, skills, skillIds } from '../content/skills.js'
import { planBlocks, totalPlanMinutes, interviewTime, interviewLabel } from '../content/plan.js'
import { currentBlock, blockStatus } from './plan.js'

const heatColor = (mastery, attempts) => {
  if (!attempts) return 'var(--gray)'
  if (mastery < 0.35) return 'var(--red)'
  if (mastery < 0.55) return 'var(--amber)'
  if (mastery < 0.75) return 'var(--sky)'
  return 'var(--green)'
}

const launchTiles = [
  { icon: '🎮', title: 'Games', sub: 'Constraint Sniper & more', href: '#/games', color: 'var(--amber)' },
  { icon: '🎯', title: 'Constraint Sniper', sub: 'n → Big-O, fast', href: '#/games/constraint-sniper', color: 'var(--pink)' },
  { icon: '🔍', title: 'Traces', sub: 'Step code + diagram', href: '#/learn', color: 'var(--teal)' },
  { icon: '🎙️', title: 'Mock', sub: 'Timed, talk out loud', href: '#/mock', color: 'var(--sky)' },
  { icon: '🧩', title: 'Problems', sub: 'Google list by pattern', href: '#/problems', color: 'var(--green)' },
  { icon: '📒', title: 'Handbook', sub: 'Cheat sheets', href: '#/handbook', color: 'var(--amber)' },
]

const countdownParts = () => {
  const ms = Math.max(0, interviewTime().getTime() - Date.now())
  const totalSeconds = Math.floor(ms / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor(totalSeconds % 86400 / 3600),
    minutes: Math.floor(totalSeconds % 3600 / 60),
    seconds: totalSeconds % 60,
    ms,
  }
}

const formatMinutes = minutes => {
  const hours = Math.floor(minutes / 60)
  const rest = Math.round(minutes % 60)
  if (!hours) return `${rest}m`
  return rest ? `${hours}h ${rest}m` : `${hours}h`
}

export default function render(container) {
  const page = h('div', { class: 'page' })
  container.appendChild(page)

  const countdownEls = { days: h('b'), hours: h('b'), minutes: h('b'), seconds: h('b') }
  const tickCountdown = () => {
    const parts = countdownParts()
    for (const key of Object.keys(countdownEls)) countdownEls[key].textContent = String(parts[key]).padStart(2, '0')
  }

  let mapOpen = null
  const draw = () => {
    const state = getState()
    const levelInfo = getLevelInfo()
    const due = dueItems()
    const dueCards = due.filter(item => item.kind === 'card').length
    const today = getToday()
    const accuracy = today.answers ? Math.round(today.correct / today.answers * 100) : null
    const next = currentBlock()
    const doneMinutes = planBlocks.filter(block => blockStatus(block).done).reduce((total, block) => total + block.minutes, 0)

    const nextStepIndex = next ? Math.max(0, next.steps.findIndex((_, i) => !blockStatus(next).record.steps?.[i])) : 0
    const nextStep = next?.steps[nextStepIndex]
    const ctaLabel = nextStep ? `${nextStep.label.replace(/^(\w+):\s*/, '$1 · ')}` : ''
    const hero = h('section', { class: 'hero' },
      h('div', { class: 'hero-main' },
        nextStep ? h('a', { class: 'btn btn-primary hero-cta', href: nextStep.href },
          h('span', { class: 'hero-cta-play' }, '▶'),
          h('span', { class: 'hero-cta-text' }, h('small', null, `Start · ${formatMinutes(next.minutes)} block`), h('b', null, ctaLabel))) : null,
        h('span', { class: 'eyebrow' }, interviewLabel),
        h('div', { class: 'countdown' },
          h('div', { class: 'countdown-unit' }, countdownEls.days, h('span', null, 'days')),
          h('div', { class: 'countdown-unit' }, countdownEls.hours, h('span', null, 'hrs')),
          h('div', { class: 'countdown-unit' }, countdownEls.minutes, h('span', null, 'min')),
          h('div', { class: 'countdown-unit' }, countdownEls.seconds, h('span', null, 'sec'))),
        h('div', { class: 'grid-4', style: 'gap:10px' },
          h('div', { class: 'stat' }, h('span', { class: 'stat-value', style: 'color:var(--amber)' }, `Lv ${levelInfo.level}`), h('span', { class: 'stat-label' }, `${levelInfo.xp} XP`)),
          h('div', { class: 'stat' }, h('span', { class: 'stat-value' }, `${getStreak()}🔥`), h('span', { class: 'stat-label' }, 'day streak')),
          h('div', { class: 'stat' }, h('span', { class: 'stat-value' }, formatMinutes(getStudyMinutes({ todayOnly: true }))), h('span', { class: 'stat-label' }, 'today')),
          h('div', { class: 'stat' }, h('span', { class: 'stat-value' }, accuracy === null ? '–' : `${accuracy}%`), h('span', { class: 'stat-label' }, `${today.answers} answers`))),
        h('div', { class: 'progress', title: 'Level progress' }, h('div', { style: { width: `${levelInfo.progress * 100}%` } }))),
      next ? h('div', { class: 'next-block' },
        h('div', { class: 'spread' },
          h('span', { class: 'section-title' }, 'Next plan block'),
          h('span', { class: 'pill pill-amber' }, formatMinutes(next.minutes))),
        h('h2', null, next.title),
        h('div', { class: 'steps' }, next.steps.map((step, i) => {
          const on = Boolean(blockStatus(next).record.steps?.[i])
          return h('a', { class: 'row small', href: step.href, style: { color: on ? 'var(--faint)' : 'var(--text)', textDecoration: on ? 'line-through' : 'none' } },
            h('span', { class: 'mono faint' }, on ? '✓' : `${i + 1}`), step.label)
        })),
        h('div', { class: 'row', style: 'margin-top:auto' },
          h('a', { class: 'btn', href: nextStep.href }, 'Start block ▸'),
          h('a', { class: 'btn btn-ghost', href: '#/plan' }, 'Full plan')),
        h('div', { class: 'stack-sm' },
          h('div', { class: 'spread small muted' }, h('span', null, 'Plan'), h('span', { class: 'mono' }, `${formatMinutes(doneMinutes)} / ${formatMinutes(totalPlanMinutes)}`)),
          h('div', { class: 'progress amber' }, h('div', { style: { width: `${doneMinutes / totalPlanMinutes * 100}%` } }))))
        : h('div', { class: 'next-block' },
          h('span', { class: 'section-title' }, 'Plan'),
          h('h2', null, 'Plan complete 🎉'),
          h('p', { class: 'muted' }, 'Keep reviewing due cards, then rest.'),
          h('a', { class: 'btn btn-primary', href: '#/flashcards' }, 'Review cards')))

    const weakest = weakestSkills(3, skillIds)
    const weakCard = h('div', { class: 'card stack' },
      h('div', { class: 'spread' }, h('span', { class: 'section-title' }, 'Weakest skills'), h('a', { class: 'small', href: '#/drill' }, 'Mixed drill ▸')),
      weakest.map(skill => {
        const mastery = getMastery(skill)
        const record = getSkillRecord(skill)
        return h('div', { class: 'weak-item' },
          h('div', { class: 'grow stack-sm' },
            h('b', null, skills[skill]?.label || skill),
            h('div', { class: 'heat-bar', style: { '--heat': heatColor(mastery, record.attempts) } }, h('div', { style: { width: `${mastery * 100}%` } }))),
          h('span', { class: 'mono small muted' }, `${Math.round(mastery * 100)}%`),
          h('a', { class: 'btn btn-sm btn-primary', href: `#/drill/${skill}` }, 'Drill'))
      }))

    const dueCard = due.length || Object.keys(state.items).length
      ? h('div', { class: 'card stack' },
        h('span', { class: 'section-title' }, 'Spaced review'),
        h('div', { class: 'row', style: 'gap:18px' },
          h('div', { class: 'stat' }, h('span', { class: 'stat-value', style: { color: due.length ? 'var(--sky)' : 'var(--text)' } }, String(due.length)), h('span', { class: 'stat-label' }, 'due now')),
          h('div', { class: 'stat' }, h('span', { class: 'stat-value' }, String(dueCards)), h('span', { class: 'stat-label' }, 'cards')),
          h('div', { class: 'stat' }, h('span', { class: 'stat-value' }, String(Object.keys(state.items).length)), h('span', { class: 'stat-label' }, 'tracked'))),
        h('div', { class: 'row-wrap', style: 'margin-top:auto' },
          due.length ? h('a', { class: 'btn btn-primary', href: '#/drill?due=1' }, 'Review due') : h('span', { class: 'muted small' }, 'Nothing due right now.'),
          h('a', { class: 'btn', href: '#/flashcards' }, 'Flashcards')))
      : h('div', { class: 'card stack' },
        h('span', { class: 'section-title' }, 'Spaced review'),
        h('div', { class: 'spread' },
          h('span', { class: 'muted' }, 'Nothing due. Drill to seed reviews.'),
          h('a', { class: 'btn btn-sm btn-primary', href: '#/drill' }, 'Drill')))

    const heatmapOpen = mapOpen ?? window.innerWidth > 600
    const heatmap = h('details', { class: 'card stack mastery-map', open: heatmapOpen || null, ontoggle: event => { mapOpen = event.currentTarget.open } },
      h('summary', { class: 'spread' },
        h('span', { class: 'section-title' }, 'Mastery map'),
        h('div', { class: 'legend' },
          h('span', null, h('i', { style: 'background:var(--gray)' }), 'new'),
          h('span', null, h('i', { style: 'background:var(--red)' }), 'weak'),
          h('span', null, h('i', { style: 'background:var(--amber)' }), 'shaky'),
          h('span', null, h('i', { style: 'background:var(--sky)' }), 'ok'),
          h('span', null, h('i', { style: 'background:var(--green)' }), 'solid'))),
      skillGroups.map(group => h('div', { class: 'heatmap-group' },
        h('span', { class: 'small muted' }, group.label),
        h('div', { class: 'heatmap' }, group.skills.map(([id, label]) => {
          const record = getSkillRecord(id)
          const color = heatColor(record.mastery, record.attempts)
          return h('a', { class: 'heat-cell', href: `#/drill/${id}`, title: `${label}: ${Math.round(record.mastery * 100)}% · ${record.attempts} tries`, style: { '--heat': color, '--heat-pct': record.attempts ? 10 + record.mastery * 18 : 0 } },
            h('div', { class: 'heat-row' }, h('span', null, label), h('span', { class: 'heat-pct' }, record.attempts ? `${Math.round(record.mastery * 100)}` : '·')),
            h('div', { class: 'heat-bar' }, h('div', { style: { width: `${record.mastery * 100}%` } })))
        })))))

    const tiles = h('div', { class: 'stack' },
      h('span', { class: 'section-title' }, 'Quick launch'),
      h('div', { class: 'grid', style: 'grid-template-columns:repeat(auto-fill,minmax(170px,1fr))' },
        launchTiles.map(tile => h('a', { class: 'tile', href: tile.href, style: { '--tile-color': tile.color } },
          h('span', { class: 'tile-icon' }, tile.icon),
          h('span', { class: 'tile-title' }, tile.title),
          h('span', { class: 'tile-sub' }, tile.sub)))))

    page.replaceChildren(hero, h('div', { class: 'grid-2' }, weakCard, dueCard), heatmap, tiles)
    tickCountdown()
  }

  draw()
  const timer = setInterval(tickCountdown, 1000)
  let lastSignature = ''
  const signature = state => `${state.xp}|${Object.keys(state.items).length}|${JSON.stringify(state.plan).length}|${Math.floor(state.studyMs / 60e3)}`
  lastSignature = signature(getState())
  const unsubscribe = subscribe(state => {
    const next = signature(state)
    if (next !== lastSignature) {
      lastSignature = next
      draw()
    }
  })
  return () => {
    clearInterval(timer)
    unsubscribe()
  }
}
