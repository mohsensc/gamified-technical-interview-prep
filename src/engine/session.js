import { problems, traces } from '../content/index.js'
import { allItems, findNode, itemsForNode, problemsForNode, tracesForNode } from '../content/curriculum.js'
import { skillIds } from '../content/skills.js'
import { pickAdaptive, weakestSkills, getMissed, getBookmarks, dueItems } from '../store.js'
import { persistOverride } from '../ui/override.js'

export const modes = [
  { id: 'rapid', title: 'Rapid fire', icon: '⚡', blurb: 'Beat the clock', seconds: 90 },
  { id: 'diagnose', title: 'Diagnose', icon: '🩺', blurb: 'Pattern, DS, time, space' },
  { id: 'weakest', title: 'Weak spots', icon: '🎯', blurb: 'Aimed at your lowest skills' },
  { id: 'mixed', title: 'Mixed', icon: '🎲', blurb: 'A bit of everything' },
  { id: 'mcq', title: 'Quiz', icon: '❓', blurb: 'Multiple choice' },
  { id: 'cards', title: 'Cards', icon: '🃏', blurb: 'Flip and rate' },
  { id: 'cloze', title: 'Fill in', icon: '🧩', blurb: 'Complete the code' },
  { id: 'parsons', title: 'Reorder', icon: '🔀', blurb: 'Put lines in order' },
  { id: 'predict', title: 'Predict', icon: '🔮', blurb: 'Guess the next step' },
  { id: 'checkpoint', title: 'Checkpoint', icon: '🏁', blurb: '80% to pass' },
]

export const modeById = Object.fromEntries(modes.map(mode => [mode.id, mode]))

const defaultCounts = { rapid: 30, diagnose: 12, weakest: 12, mixed: 12, mcq: 10, cards: 15, cloze: 5, parsons: 4, predict: 3, checkpoint: 10 }
const secondsPerItem = { rapid: 6, diagnose: 15, weakest: 30, mixed: 35, mcq: 25, cards: 10, cloze: 60, parsons: 60, predict: 150, checkpoint: 30 }

const hashString = text => {
  let hash = 2166136261
  for (const char of String(text)) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

const seededRandom = seed => {
  let value = seed >>> 0 || 1
  return () => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0
    return value / 4294967296
  }
}

const shuffle = (list, random = Math.random) => {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const normalizeText = text => String(text || '')
  .toLowerCase()
  .replace(/²/g, '^2').replace(/³/g, '^3').replace(/ⁿ/g, '^n')
  .replace(/·|\*/g, '')
  .replace(/\s+/g, '')

const diagnoseParts = [
  { part: 'pattern', label: 'Which pattern?', get: problem => problem.pattern, skills: problem => ['ds-diagnosis', ...(problem.skills || []).slice(0, 1)] },
  { part: 'ds', label: 'Main data structure?', get: problem => (problem.ds || []).join(' + '), skills: () => ['ds-diagnosis'] },
  { part: 'time', label: 'Time complexity?', get: problem => problem.time, skills: () => ['complexity', 'constraints'] },
  { part: 'space', label: 'Space complexity?', get: problem => problem.space, skills: () => ['complexity'] },
]

export function makeDiagnoseQuestions(problem, pool = problems) {
  if (!problem) return []
  const random = seededRandom(hashString(problem.id))
  const context = [problem.constraints, (problem.signals || []).slice(0, 3).join(', ')].filter(Boolean).join(' · ')
  const result = []
  for (const { part, label, get, skills } of diagnoseParts) {
    const correct = get(problem)
    if (!correct) continue
    const key = normalizeText(correct)
    const seen = new Set([key])
    const sameGroup = pool.filter(other => other.id !== problem.id && (other.skills || []).some(skill => (problem.skills || []).includes(skill)))
    const candidates = [...shuffle(sameGroup, random), ...shuffle(pool, random)]
    const distractors = []
    for (const other of candidates) {
      if (distractors.length >= 3) break
      const value = get(other)
      if (!value) continue
      const otherKey = normalizeText(value)
      if (seen.has(otherKey)) continue
      seen.add(otherKey)
      distractors.push(value)
    }
    if (distractors.length < 3) continue
    const choices = shuffle([correct, ...distractors], random)
    result.push({
      id: `${problem.id}:dx:${part}`,
      kind: 'mcq',
      topic: problem.topic,
      skills: [...new Set(skills(problem))],
      difficulty: problem.difficulty === 'Hard' ? 3 : problem.difficulty === 'Easy' ? 1 : 2,
      q: `${problem.lc ? `${problem.lc}. ` : ''}${problem.title}${context ? ` · ${context}` : ''} — ${label}`,
      choices,
      answer: choices.indexOf(correct),
      why: problem.insight || '',
      diagnose: { problemId: problem.id, part },
      google: Boolean(problem.google),
    })
  }
  return result
}

const instantiate = (generator, seed) => {
  try {
    const made = generator.make(seed)
    if (!made || !Array.isArray(made.choices)) return null
    return { ...made, kind: 'mcq', topic: generator.topic, generated: true, generatorId: generator.id, skills: made.skills || generator.skills }
  } catch {
    return null
  }
}

const expandGenerators = (items, perGenerator = 4) => items.flatMap(item => {
  if (item.kind !== 'generator') return [item]
  const base = Math.floor(Math.random() * 1e6)
  return Array.from({ length: perGenerator }, (_, i) => instantiate(item, base + i * 7919)).filter(Boolean)
})

const cardAsMcq = (card, pool) => {
  const random = seededRandom(hashString(card.id))
  const peers = shuffle(pool.filter(other => other.id !== card.id && other.back && normalizeText(other.back) !== normalizeText(card.back)), random)
  const sameSkill = peers.filter(other => (other.skills || [])[0] === (card.skills || [])[0])
  const distractors = []
  const seen = new Set([normalizeText(card.back)])
  for (const other of [...sameSkill, ...peers]) {
    if (distractors.length >= 3) break
    const key = normalizeText(other.back)
    if (seen.has(key)) continue
    seen.add(key)
    distractors.push(other.back)
  }
  if (distractors.length < 3) return null
  const choices = shuffle([card.back, ...distractors], random)
  return { id: `${card.id}:mcq`, sourceId: card.id, kind: 'mcq', topic: card.topic, skills: card.skills, difficulty: 1, q: card.front, choices, answer: choices.indexOf(card.back), why: '' }
}

const wordCount = text => String(text || '').trim().split(/\s+/).filter(Boolean).length
const isShortCard = card => card.kind === 'card' && !card.code && wordCount(card.back) <= 12 && wordCount(card.front) <= 18

const scopeNodeId = scope => scope.nodeId || scope.moduleId || scope.unitId || null

const baseId = item => item.sourceId || item.diagnose?.problemId || item.id

const applyScope = (items, scope = {}, { isProblem = false } = {}) => {
  let pool = items
  const nodeId = scopeNodeId(scope)
  if (nodeId && findNode(nodeId)) {
    const allowed = new Set((isProblem ? problemsForNode(nodeId) : itemsForNode(nodeId)).map(item => item.id))
    pool = pool.filter(item => allowed.has(item.id))
  }
  if (scope.topic) pool = pool.filter(item => item.topic === scope.topic)
  if (scope.skills?.length) {
    const wanted = new Set(scope.skills)
    pool = pool.filter(item => (item.skills || []).some(skill => wanted.has(skill)))
  }
  if (scope.kinds?.length) pool = pool.filter(item => scope.kinds.includes(item.kind) || (item.kind === 'generator' && scope.kinds.includes('mcq')))
  if (scope.googleOnly) pool = pool.filter(item => item.google || String(item.topic || '').startsWith('google'))
  if (scope.difficulty) pool = pool.filter(item => !item.difficulty || String(item.difficulty) === String(scope.difficulty))
  if (scope.missedOnly) {
    const missed = new Set(getMissed().map(entry => entry.id))
    pool = pool.filter(item => missed.has(item.id) || missed.has(baseId(item)))
  }
  if (scope.bookmarksOnly) {
    const marks = new Set(getBookmarks())
    pool = pool.filter(item => marks.has(item.id) || marks.has(baseId(item)))
  }
  if (scope.dueOnly) {
    const due = new Set(dueItems().map(entry => entry.id))
    pool = pool.filter(item => due.has(item.id) || due.has(baseId(item)))
  }
  return pool
}

const itemsOfKind = (kinds, scope) => applyScope(allItems.filter(item => kinds.includes(item.kind)), scope)

const resolveCount = (mode, { count, seconds, minutes }) => {
  if (Number.isFinite(count) && count > 0) return Math.round(count)
  const secs = Number.isFinite(seconds) && seconds > 0 ? seconds : Number.isFinite(minutes) && minutes > 0 ? minutes * 60 : null
  if (secs) return Math.max(3, Math.ceil(secs / (secondsPerItem[mode] || 30)))
  return defaultCounts[mode] || 10
}

const capKinds = (list, caps, count) => {
  const used = {}
  const result = []
  for (const item of list) {
    const cap = caps[item.kind]
    if (cap !== undefined && (used[item.kind] || 0) >= Math.ceil(cap * count)) continue
    used[item.kind] = (used[item.kind] || 0) + 1
    result.push(item)
    if (result.length >= count) break
  }
  return result
}

const interleave = list => {
  const byKind = {}
  for (const item of list) (byKind[item.kind] = byKind[item.kind] || []).push(item)
  const queues = Object.values(byKind)
  const result = []
  while (queues.some(queue => queue.length)) for (const queue of queues) if (queue.length) result.push(queue.shift())
  return result
}

const rapidPool = scope => {
  const base = applyScope(allItems, scope)
  const mcqLike = expandGenerators(base.filter(item => item.kind === 'mcq' || item.kind === 'generator'), 3)
  const cardPool = allItems.filter(item => item.kind === 'card')
  const shortCards = base.filter(isShortCard).map(card => cardAsMcq(card, cardPool)).filter(Boolean)
  return [...mcqLike, ...shortCards]
}

const diagnoseSession = (scope, count) => {
  const pool = applyScope(problems.filter(problem => problem.pattern && problem.time), { ...scope, kinds: null }, { isProblem: true })
  const chosen = pickAdaptive(pool.map(problem => ({ ...problem, difficulty: undefined })), count)
  return chosen.flatMap(problem => makeDiagnoseQuestions(problems.find(entry => entry.id === problem.id) || problem))
}

const predictSession = (scope, count) => {
  const nodeId = scopeNodeId(scope)
  let pool = nodeId && findNode(nodeId) ? tracesForNode(nodeId) : traces
  if (scope.topic) pool = pool.filter(trace => trace.topic === scope.topic)
  if (scope.skills?.length) pool = pool.filter(trace => (trace.skills || []).some(skill => scope.skills.includes(skill)))
  if (!pool.length && nodeId) pool = traces.filter(trace => (trace.skills || []).some(skill => (findNode(nodeId)?.skills || []).includes(skill)))
  const items = pool.map(trace => ({ id: `predict:${trace.id}`, kind: 'predict', traceId: trace.id, title: trace.title, skills: trace.skills, topic: trace.topic }))
  return pickAdaptive(items, count)
}

const checkpointSession = (scope, count) => {
  const nodeId = scopeNodeId(scope)
  const node = nodeId ? findNode(nodeId) : null
  const target = node?.checkpoint?.itemCount || count
  const pool = expandGenerators(applyScope(allItems.filter(item => item.kind !== 'card'), scope), 2)
  const problemPool = node ? problemsForNode(nodeId) : []
  const diagnose = problemPool.length ? makeDiagnoseQuestions(pickAdaptive(problemPool, 1)[0]).slice(0, 2) : []
  const picked = capKinds(pickAdaptive(pool, target * 3), { cloze: 0.2, parsons: 0.2 }, target - diagnose.length)
  return interleave([...picked, ...diagnose]).slice(0, target)
}

export function buildSession({ mode = 'mixed', scope = {}, count, seconds, minutes } = {}) {
  const safeScope = scope || {}
  const n = resolveCount(mode, { count, seconds, minutes })
  switch (mode) {
    case 'rapid':
      return pickAdaptive(rapidPool(safeScope), n)
    case 'diagnose':
      return diagnoseSession(safeScope, Math.max(1, Math.ceil(n / 4)))
    case 'mcq':
      return pickAdaptive(expandGenerators(itemsOfKind(['mcq', 'generator'], safeScope), 2), n)
    case 'cards':
      return pickAdaptive(itemsOfKind(['card'], safeScope), n)
    case 'cloze':
      return pickAdaptive(itemsOfKind(['cloze'], safeScope), n)
    case 'parsons':
      return pickAdaptive(itemsOfKind(['parsons'], safeScope), n)
    case 'predict':
      return predictSession(safeScope, n)
    case 'checkpoint':
      return checkpointSession(safeScope, n)
    case 'weakest': {
      const skills = safeScope.skills?.length ? safeScope.skills : weakestSkills(3, skillIds.filter(id => id !== 'communication'))
      const pool = expandGenerators(applyScope(allItems, { ...safeScope, skills }), 2)
      return interleave(capKinds(pickAdaptive(pool, n * 3), { card: 0.3, cloze: 0.2, parsons: 0.15 }, n))
    }
    default: {
      const pool = expandGenerators(applyScope(allItems, safeScope), 2)
      return interleave(capKinds(pickAdaptive(pool, n * 3), { card: 0.3, cloze: 0.2, parsons: 0.2 }, n))
    }
  }
}

export function scopeFromQuery(query = {}) {
  const flag = value => value === '1' || value === 'true' || value === true
  const list = value => (value ? String(value).split(',').map(part => part.trim()).filter(Boolean) : undefined)
  const scope = {
    unitId: query.unit || undefined,
    moduleId: query.module || undefined,
    nodeId: query.node || undefined,
    topic: query.topic || undefined,
    skills: list(query.skill || query.skills),
    kinds: list(query.kinds),
    googleOnly: flag(query.google) || undefined,
    difficulty: query.diff ? Number(query.diff) : undefined,
    missedOnly: flag(query.missed) || undefined,
    bookmarksOnly: flag(query.bookmarks) || undefined,
    dueOnly: flag(query.due) || undefined,
  }
  for (const key of Object.keys(scope)) if (scope[key] === undefined) delete scope[key]
  const options = { scope }
  if (query.n) options.count = Number(query.n)
  if (query.min) options.minutes = Number(query.min)
  if (query.sec) options.seconds = Number(query.sec)
  return options
}

export function practiceHref(mode, scope = {}, { minutes, count } = {}) {
  const params = new URLSearchParams()
  if (scope.unitId) params.set('unit', scope.unitId)
  if (scope.moduleId) params.set('module', scope.moduleId)
  if (scope.nodeId) params.set('node', scope.nodeId)
  if (scope.topic) params.set('topic', scope.topic)
  if (scope.skills?.length) params.set('skill', scope.skills.join(','))
  if (scope.kinds?.length) params.set('kinds', scope.kinds.join(','))
  if (scope.googleOnly) params.set('google', '1')
  if (scope.difficulty) params.set('diff', String(scope.difficulty))
  if (scope.missedOnly) params.set('missed', '1')
  if (scope.bookmarksOnly) params.set('bookmarks', '1')
  if (scope.dueOnly) params.set('due', '1')
  if (minutes) params.set('min', String(minutes))
  if (count) params.set('n', String(count))
  const text = params.toString()
  return `#/practice/${mode}${text ? `?${text}` : ''}`
}

export function overrideResult(results, matches, record = {}) {
  const flipped = persistOverride(record)
  for (let i = results.length - 1; i >= 0; i--) {
    const result = results[i]
    if (result.correct || result.skipped || !matches(result)) continue
    result.correct = true
    result.overridden = true
    return { flipped, result }
  }
  return { flipped, result: null }
}

export { allItems }
