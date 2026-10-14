import { allBites, allModules, findNode, hrefFor, units, algorithmById } from '../content/curriculum.js'
import { skills as skillInfo } from '../content/skills.js'
import { getState, getEvents, getBiteStatus, getNodeProgress, getSessions, dueItems, getMissed, getCheckpoint, getSetting, setSetting } from '../store.js'
import { practiceHref } from './session.js'

const interviewSettingKey = 'interviewAt'
const noDeadlineHorizonHours = 24 * 365

export function getInterviewAt() {
  const iso = getSetting(interviewSettingKey, null)
  if (!iso) return null
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? null : date
}

export function setInterviewAt(value) {
  const date = value ? new Date(value) : null
  setSetting(interviewSettingKey, date && !Number.isNaN(date.getTime()) ? date.toISOString() : null)
}

export function hoursUntilInterview(now = Date.now()) {
  const at = getInterviewAt()
  return at ? (at.getTime() - now) / 3600e3 : noDeadlineHorizonHours
}

const label = skill => skillInfo[skill]?.label || skill
const pct = value => `${Math.round(value * 100)}%`
const clip = (text, max = 14) => {
  const words = String(text).split(/\s+/).filter(Boolean)
  return words.length <= max ? words.join(' ') : words.slice(0, max).join(' ')
}

const coreBites = () => allBites.filter(bite => !bite.optional)

export function nextIncompleteBite() {
  return coreBites().find(bite => !getBiteStatus(bite.id).done) || allBites.find(bite => !getBiteStatus(bite.id).done) || null
}

export function continueTarget() {
  const bite = nextIncompleteBite()
  return bite ? hrefFor(bite.id) : '#/course'
}

const firstOpenBite = mod => mod.bites.find(bite => !bite.optional && !getBiteStatus(bite.id).done) || null

const recentSkills = () => {
  const last = getSessions(1)[0]
  if (last?.skills?.length && Date.now() - last.at < 3 * 3600e3) return new Set(last.skills)
  return new Set(getEvents({ type: ['answer', 'card', 'bite'], limit: 12 }).flatMap(event => event.skills || []))
}

const lowPriorityAlgoSlugs = Object.values(algorithmById)
  .filter(algo => algo.tier === 3 || algo.id === 'algorithms:floyd-warshall')
  .map(algo => algo.id.split(':').pop())

const isLowPriorityItem = itemId => lowPriorityAlgoSlugs.some(slug => String(itemId || '').includes(slug))

const skillStats = (skill, lastN = 5) => {
  const events = getEvents({ type: ['answer', 'card'], skill }).filter(event => !isLowPriorityItem(event.itemId))
  const recent = events.slice(-lastN)
  const wrong = recent.filter(event => !event.correct).length
  return { total: events.length, recent: recent.length, wrong }
}

export function recommendNext({ limit = 3 } = {}) {
  const state = getState()
  const hoursLeft = hoursUntilInterview()
  const hoursText = hoursLeft > 0 ? `${Math.max(1, Math.round(hoursLeft))}h left` : 'interview time'
  const avoid = recentSkills()
  const candidates = []
  const add = candidate => candidates.push({ ...candidate, reason: clip(candidate.reason) })

  const bite = nextIncompleteBite()
  if (bite) {
    const mod = findNode(bite.moduleId)
    const core = mod.bites.filter(entry => !entry.optional)
    const done = core.filter(entry => getBiteStatus(entry.id).done).length
    add({
      title: `Continue: ${bite.title}`,
      reason: done ? `${mod.title}: ${done} of ${core.length} bites done` : `Next up in ${mod.title}`,
      href: hrefFor(bite.id),
      minutes: bite.minutes,
      kind: 'continue',
      skills: bite.skills || [],
      score: 50 + (mod.mustLearn ? 12 : 0) - (hoursLeft < 3 ? 20 : 0),
    })
  }

  const mustLearn = allModules
    .filter(mod => mod.mustLearn && mod.id !== bite?.moduleId)
    .map(mod => ({ mod, progress: getNodeProgress(mod.id) }))
    .filter(entry => entry.progress < 0.8)
    .sort((a, b) => (a.mod.gap?.rank || 99) - (b.mod.gap?.rank || 99))
  for (const { mod, progress } of mustLearn.slice(0, 2)) {
    const open = firstOpenBite(mod)
    const tier = mod.gap?.tier || 'Must-learn'
    add({
      title: mod.title,
      reason: progress > 0.02 ? `${tier} gap, ${pct(progress)} done` : `${tier} gap, not started yet`,
      href: open ? hrefFor(open.id) : hrefFor(mod.id),
      minutes: open ? Math.min(mod.minutes, 20) : mod.minutes,
      kind: 'must-learn',
      skills: mod.skills,
      score: 44 + (tier === 'P0' ? 10 : 4) + (hoursLeft < 12 && hoursLeft > 3 ? 6 : 0),
    })
  }

  const oopRanked = allModules
    .filter(mod => mod.unitId === 'u-oop' && mod.id !== bite?.moduleId)
    .map(mod => ({ mod, progress: getNodeProgress(mod.id) }))
    .sort((a, b) => a.progress - b.progress)
  const oopTarget = oopRanked.find(entry => entry.progress < 0.8)
  if (oopTarget) {
    const open = firstOpenBite(oopTarget.mod)
    add({
      title: oopTarget.mod.title,
      reason: oopTarget.progress > 0.02 ? `You flagged this: OOP & design, ${pct(oopTarget.progress)} done` : 'You flagged this: OOP, self and design patterns',
      href: open ? hrefFor(open.id) : hrefFor(oopTarget.mod.id),
      minutes: open ? Math.min(oopTarget.mod.minutes, 20) : oopTarget.mod.minutes,
      kind: 'oop',
      skills: oopTarget.mod.skills,
      score: 54 + (hoursLeft < 12 && hoursLeft > 3 ? 6 : 0),
    })
  }

  const readModule = findNode('ic-read')
  if (readModule && readModule.id !== bite?.moduleId) {
    const openRead = firstOpenBite(readModule)
    add({
      title: openRead ? openRead.title : 'Read & Sign: rapid drill',
      reason: openRead ? 'You flagged this: read long problems, write the signature' : 'Keep signature speed sharp before Tuesday',
      href: openRead ? hrefFor(openRead.id) : '#/read/drill',
      minutes: openRead ? openRead.minutes : 4,
      kind: 'read',
      skills: ['communication', 'ds-diagnosis'],
      score: 50 + (hoursLeft < 12 && hoursLeft > 3 ? 6 : 0),
    })
  }

  const attempted = Object.entries(state.skills)
    .filter(([id, record]) => record.attempts >= 3 && id !== 'communication')
    .sort((a, b) => a[1].mastery - b[1].mastery)
  for (const [skill, record] of attempted.slice(0, 2)) {
    if (record.mastery >= 0.75) continue
    const stats = skillStats(skill)
    const accuracy = record.attempts ? record.correct / record.attempts : 0
    add({
      title: `Drill ${label(skill)}`,
      reason: stats.recent ? `${label(skill)} ${pct(accuracy)}, missed ${stats.wrong} of last ${stats.recent}` : `${label(skill)} mastery ${pct(record.mastery)}`,
      href: practiceHref('weakest', { skills: [skill] }, { minutes: 5 }),
      minutes: 5,
      kind: 'drill',
      skills: [skill],
      score: 38 + (1 - record.mastery) * 40 + stats.wrong * 2,
    })
  }

  const due = dueItems()
  if (due.length >= 5) {
    const oldest = Math.max(...due.map(item => Date.now() - item.due))
    const overdue = oldest > 3600e3 ? `, oldest ${Math.round(oldest / 3600e3)}h overdue` : ''
    add({
      title: 'Review due items',
      reason: `${due.length} items due${overdue}`,
      href: practiceHref('mixed', { dueOnly: true }, { minutes: 5 }),
      minutes: 5,
      kind: 'review',
      skills: [...new Set(due.flatMap(item => item.skills || []))].slice(0, 4),
      score: 30 + Math.min(20, due.length) + (hoursLeft < 3 ? 15 : 0),
    })
  }

  const missed = getMissed({ since: Date.now() - 24 * 3600e3 })
  if (missed.length >= 3) {
    add({
      title: 'Fix recent misses',
      reason: `${missed.length} items wrong at last attempt today`,
      href: practiceHref('mixed', { missedOnly: true }, { minutes: 5 }),
      minutes: 5,
      kind: 'review',
      skills: [...new Set(missed.flatMap(item => item.skills || []))].slice(0, 4),
      score: 32 + Math.min(18, missed.length * 2),
    })
  }

  for (const mod of allModules) {
    const core = mod.bites.filter(entry => !entry.optional)
    if (!core.length || !core.every(entry => getBiteStatus(entry.id).done)) continue
    const checkpoint = getCheckpoint(mod.id)
    if (checkpoint?.passed) continue
    add({
      title: `Checkpoint: ${mod.title}`,
      reason: checkpoint ? `Best ${checkpoint.best}%, need ${mod.checkpoint.passPct}%` : 'All bites done, checkpoint not taken',
      href: practiceHref('checkpoint', { moduleId: mod.id }),
      minutes: Math.ceil(mod.checkpoint.itemCount * 0.5),
      kind: 'checkpoint',
      skills: mod.skills,
      score: 47,
    })
    break
  }

  if (hoursLeft < 6) {
    const craft = units.find(unit => unit.id === 'u-craft')
    const mockBite = craft?.modules.flatMap(mod => mod.bites).find(entry => entry.type === 'mock' && !getBiteStatus(entry.id).done)
    add({
      title: mockBite ? mockBite.title : 'Rapid constraint sprint',
      reason: `${hoursText}: rehearse out loud now`,
      href: mockBite ? hrefFor(mockBite.id) : practiceHref('rapid', { skills: ['constraints', 'complexity'] }),
      minutes: mockBite?.minutes || 3,
      kind: 'mock',
      skills: ['communication'],
      score: 52 + (hoursLeft < 2 ? 20 : 0),
    })
  }
  if (hoursLeft < 2) {
    add({
      title: 'Rapid warm-up',
      reason: `${hoursText}: quick confident reps, nothing new`,
      href: practiceHref('rapid', { googleOnly: false }),
      minutes: 3,
      kind: 'warmup',
      skills: [],
      score: 75,
    })
  }

  if (!candidates.length) {
    add({ title: 'Diagnose curated problems', reason: 'Everything on track, keep diagnosis sharp', href: practiceHref('diagnose', { googleOnly: true }), minutes: 5, kind: 'drill', skills: ['ds-diagnosis'], score: 1 })
  }

  for (const candidate of candidates) {
    if (candidate.skills.some(skill => avoid.has(skill)) && candidate.kind !== 'continue') candidate.score -= 12
  }

  const picked = []
  const pool = [...candidates]
  while (picked.length < limit && pool.length) {
    pool.sort((a, b) => adjusted(b, picked) - adjusted(a, picked))
    const next = pool.shift()
    if (picked.some(entry => entry.href === next.href)) continue
    picked.push(next)
  }
  return picked.map(({ title, reason, href, minutes, kind }) => ({ title, reason, href, minutes, kind }))
}

function adjusted(candidate, picked) {
  const sameKind = picked.filter(entry => entry.kind === candidate.kind).length
  const sameSkill = picked.filter(entry => entry.skills.some(skill => candidate.skills.includes(skill))).length
  return candidate.score - sameKind * 10 - sameSkill * 6
}
