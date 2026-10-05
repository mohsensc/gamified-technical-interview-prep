import { h } from '../ui/h.js'
import { getState, subscribe, getMastery, getSkillRecord, weakestSkills, dueItems, getMissed, getLevelInfo, getStreak, getStudyMinutes, getNodeProgress, getBiteStatus } from '../store.js'
import { skillGroups, skills, skillIds } from '../content/skills.js'
import { units, allBites, hrefFor } from '../content/curriculum.js'
import { interviewLabel, totalPlanMinutes } from '../content/plan.js'
import { recommendNext, nextIncompleteBite, interviewAt } from '../engine/recommend.js'
import { practiceHref } from '../engine/session.js'
import { planMinutesRemaining } from './plan.js'

const heatColor = (mastery, attempts) => {
  if (!attempts) return 'var(--gray)'
  if (mastery < 0.35) return 'var(--red)'
  if (mastery < 0.55) return 'var(--amber)'
  if (mastery < 0.75) return 'var(--sky)'
  return 'var(--green)'
}

const kindColor = { continue: 'teal', 'must-learn': 'amber', drill: 'sky', review: 'pink', checkpoint: 'green', mock: 'amber', warmup: 'teal' }

const countdownParts = () => {
  const ms = Math.max(0, interviewAt.getTime() - Date.now())
  const totalSeconds = Math.floor(ms / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor(totalSeconds % 86400 / 3600),
    minutes: Math.floor(totalSeconds % 3600 / 60),
    seconds: totalSeconds % 60,
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
    const levelInfo = getLevelInfo()
    const bite = nextIncompleteBite()
    const planLeft = planMinutesRemaining()

    const hero = h('div', { class: 'hero-main' },
      bite
        ? h('a', { class: 'btn btn-primary hero-cta', href: hrefFor(bite.id) },
          h('span', { class: 'hero-cta-play' }, '▶'),
          h('span', { class: 'hero-cta-text' }, h('small', null, `Continue · ${bite.minutes}m`), h('b', null, bite.title)))
        : h('a', { class: 'btn btn-primary hero-cta', href: '#/course' },
          h('span', { class: 'hero-cta-play' }, '🎉'), h('span', { class: 'hero-cta-text' }, h('small', null, 'Core course complete'), h('b', null, 'Review the tree'))),
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
        h('div', { class: 'stat' }, h('span', { class: 'stat-value' }, formatMinutes(planLeft)), h('span', { class: 'stat-label' }, 'plan left'))),
      h('div', { class: 'progress' }, h('div', { style: { width: `${Math.min(100, (1 - planLeft / Math.max(1, totalPlanMinutes)) * 100)}%` } })))

    const recs = recommendNext({ limit: 3 })
    const nextSection = h('div', { class: 'stack' },
      h('span', { class: 'section-title' }, 'Do this next'),
      h('div', { class: 'grid-3' }, recs.map(rec => h('a', { class: 'card card-hover stack-sm', href: rec.href },
        h('div', { class: 'spread' },
          h('span', { class: `pill pill-${kindColor[rec.kind] || 'teal'}` }, rec.kind.replace('-', ' ')),
          h('span', { class: 'mono small muted' }, formatMinutes(rec.minutes))),
        h('b', null, rec.title),
        h('span', { class: 'small muted' }, rec.reason)))))

    const courseMap = h('div', { class: 'stack' },
      h('div', { class: 'spread' }, h('span', { class: 'section-title' }, 'Course map'), h('a', { class: 'small', href: '#/course' }, 'Full tree ▸')),
      h('div', { class: 'grid-2' }, units.map(unit => {
        const progress = getNodeProgress(unit.id)
        return h('a', { class: 'card card-hover stack-sm', href: hrefFor(unit.id) },
          h('div', { class: 'spread' },
            h('div', { class: 'row' }, h('span', null, unit.icon), h('b', null, unit.title)),
            h('span', { class: 'mono small muted' }, `${Math.round(progress * 100)}%`)),
          h('div', { class: 'progress' }, h('div', { style: { width: `${progress * 100}%` } })),
          h('div', { class: 'row-wrap' }, unit.modules.map(mod => h('span', {
            class: `pill${mod.mustLearn ? ' pill-amber' : ''}`, title: mod.title,
          }, mod.title.length > 16 ? `${mod.title.slice(0, 15)}…` : mod.title))))
      })))

    const due = dueItems()
    const missed = getMissed({ since: Date.now() - 24 * 3600e3 })
    const weakest = weakestSkills(1, skillIds.filter(id => id !== 'communication'))[0]
    const quickTiles = [
      { icon: '⚡', title: 'Rapid fire', sub: 'Beat the clock', href: practiceHref('rapid', {}) },
      { icon: '🩺', title: 'Diagnose', sub: 'Pattern · DS · time · space', href: practiceHref('diagnose', {}) },
      { icon: '🗂️', title: 'Due cards', sub: `${due.length} due now`, href: practiceHref('mixed', { dueOnly: true }) },
      { icon: '↩️', title: 'Redo missed', sub: `${missed.length} wrong today`, href: practiceHref('mixed', { missedOnly: true }) },
      { icon: '🎯', title: 'Weakest skill', sub: weakest ? (skills[weakest]?.label || weakest) : 'All solid', href: weakest ? practiceHref('weakest', { skills: [weakest] }) : '#/practice' },
    ]
    const quickSection = h('div', { class: 'stack' },
      h('span', { class: 'section-title' }, 'Quick play'),
      h('div', { class: 'grid', style: 'grid-template-columns:repeat(auto-fill,minmax(170px,1fr))' },
        quickTiles.map(tile => h('a', { class: 'tile', href: tile.href },
          h('span', { class: 'tile-icon' }, tile.icon),
          h('span', { class: 'tile-title' }, tile.title),
          h('span', { class: 'tile-sub' }, tile.sub)))))

    const upcomingAlgoBites = allBites.filter(b => b.type === 'algo' && !getBiteStatus(b.id).done).slice(0, 6)
    const algoSection = h('div', { class: 'stack' },
      h('div', { class: 'spread' }, h('span', { class: 'section-title' }, 'Algorithm tree'), h('a', { class: 'small', href: '#/algorithms' }, 'Open tree ▸')),
      upcomingAlgoBites.length
        ? h('div', { class: 'row-wrap' }, upcomingAlgoBites.map(b => h('a', { class: 'chip', href: hrefFor(b.id) }, b.title)))
        : h('p', { class: 'muted small' }, 'Every algorithm node is lit up.'))

    const heatmapOpen = mapOpen ?? window.innerWidth > 600
    const statsSection = h('details', { class: 'card stack mastery-map', open: heatmapOpen || null, ontoggle: event => { mapOpen = event.currentTarget.open } },
      h('summary', { class: 'spread' },
        h('span', { class: 'section-title' }, 'Mastery map'),
        h('div', { class: 'row-wrap' },
          h('a', { class: 'small', href: '#/stats', onclick: event => event.stopPropagation() }, 'Full stats ▸'),
          h('div', { class: 'legend' },
            h('span', null, h('i', { style: 'background:var(--gray)' }), 'new'),
            h('span', null, h('i', { style: 'background:var(--red)' }), 'weak'),
            h('span', null, h('i', { style: 'background:var(--amber)' }), 'shaky'),
            h('span', null, h('i', { style: 'background:var(--sky)' }), 'ok'),
            h('span', null, h('i', { style: 'background:var(--green)' }), 'solid')))),
      skillGroups.map(group => h('div', { class: 'heatmap-group' },
        h('span', { class: 'small muted' }, group.label),
        h('div', { class: 'heatmap' }, group.skills.map(([id, label]) => {
          const record = getSkillRecord(id)
          const color = heatColor(record.mastery, record.attempts)
          return h('a', { class: 'heat-cell', href: `#/practice/weakest?skill=${id}`, title: `${label}: ${Math.round(record.mastery * 100)}% · ${record.attempts} tries`, style: { '--heat': color, '--heat-pct': record.attempts ? 10 + record.mastery * 18 : 0 } },
            h('div', { class: 'heat-row' }, h('span', null, label), h('span', { class: 'heat-pct' }, record.attempts ? `${Math.round(record.mastery * 100)}` : '·')),
            h('div', { class: 'heat-bar' }, h('div', { style: { width: `${record.mastery * 100}%` } })))
        })))))

    page.replaceChildren(hero, nextSection, courseMap, quickSection, algoSection, statsSection)
    tickCountdown()
  }

  draw()
  const timer = setInterval(tickCountdown, 1000)
  let lastSignature = ''
  const signature = state => `${state.xp}|${Object.keys(state.items).length}|${Object.keys(state.bites).length}|${Object.keys(state.checkpoints).length}|${state.sessions.length}|${Math.floor(state.studyMs / 60e3)}`
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
