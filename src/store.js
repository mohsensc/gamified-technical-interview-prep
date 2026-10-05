const storageKey = 'google-cram-state'
const boxIntervals = [0, 5 * 60e3, 30 * 60e3, 3 * 3600e3, 12 * 3600e3, 2 * 86400e3]
const startMastery = 0.3
const serverDebounceMs = 900
const idleLimitMs = 3 * 60e3
const tickMs = 15e3

const listeners = new Set()
let state = null
let serverTimer = null
let localTimer = null
let serverAvailable = true
let lastInputAt = Date.now()
let lastTickAt = Date.now()

const dayKey = (time = Date.now()) => {
  const date = new Date(time)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const freshState = () => ({
  version: 1,
  createdAt: Date.now(),
  updatedAt: 0,
  xp: 0,
  answerStreak: 0,
  bestAnswerStreak: 0,
  studyMs: 0,
  skills: {},
  items: {},
  seen: {},
  daily: {},
  plan: {},
  settings: { theme: 'dark' },
  gameScores: {},
  notes: {},
  history: [],
})

const normalize = raw => {
  const base = freshState()
  if (!raw || typeof raw !== 'object') return base
  const merged = { ...base, ...raw }
  for (const key of ['skills', 'items', 'seen', 'daily', 'plan', 'settings', 'gameScores', 'notes']) {
    if (!merged[key] || typeof merged[key] !== 'object' || Array.isArray(merged[key])) merged[key] = base[key]
  }
  if (!Array.isArray(merged.history)) merged.history = []
  merged.settings = { ...base.settings, ...merged.settings }
  for (const key of ['xp', 'answerStreak', 'bestAnswerStreak', 'studyMs', 'updatedAt']) {
    if (!Number.isFinite(merged[key])) merged[key] = 0
  }
  return merged
}

const readLocal = () => {
  try {
    const text = localStorage.getItem(storageKey)
    return text ? JSON.parse(text) : null
  } catch {
    return null
  }
}

const writeLocal = () => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state))
  } catch {}
}

const fetchWithTimeout = async (url, options = {}, ms = 2500) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

const pushToServer = async () => {
  if (!state) return
  try {
    await fetchWithTimeout('/api/state', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    }, 5000)
    serverAvailable = true
  } catch {
    serverAvailable = false
  }
}

const scheduleSave = () => {
  clearTimeout(localTimer)
  localTimer = setTimeout(writeLocal, 120)
  clearTimeout(serverTimer)
  serverTimer = setTimeout(pushToServer, serverDebounceMs)
}

const flushNow = () => {
  if (!state) return
  clearTimeout(localTimer)
  writeLocal()
  clearTimeout(serverTimer)
  try {
    const body = new Blob([JSON.stringify(state)], { type: 'application/json' })
    if (!navigator.sendBeacon?.('/api/state', body)) pushToServer()
  } catch {
    pushToServer()
  }
}

const notify = () => {
  for (const listener of [...listeners]) {
    try {
      listener(state)
    } catch (error) {
      console.error(error)
    }
  }
}

const today = () => {
  const key = dayKey()
  if (!state.daily[key]) state.daily[key] = { xp: 0, answers: 0, correct: 0, ms: 0 }
  return state.daily[key]
}

const ensureSkill = skill => {
  if (!state.skills[skill]) state.skills[skill] = { mastery: startMastery, attempts: 0, correct: 0, lastAt: 0 }
  return state.skills[skill]
}

const ensureItem = (itemId, kind, skills) => {
  if (!state.items[itemId]) state.items[itemId] = { box: 0, due: 0, attempts: 0, correct: 0, lastAt: 0, kind: kind || null, skills: skills || [] }
  const item = state.items[itemId]
  if (kind) item.kind = kind
  if (skills?.length) item.skills = skills
  return item
}

const adjustMastery = (skill, outcome, weight = 1) => {
  const record = ensureSkill(skill)
  const k = 0.16 * weight / (1 + record.attempts * 0.02)
  const step = Math.max(0.05, k)
  if (outcome >= 0.5) record.mastery += step * (outcome - record.mastery) * (outcome >= 1 ? 1 : 0.8)
  else record.mastery -= step * 1.25 * record.mastery * (1 - outcome)
  record.mastery = Math.min(1, Math.max(0, record.mastery))
  record.attempts += 1
  if (outcome >= 0.5) record.correct += 1
  record.lastAt = Date.now()
  return record.mastery
}

export async function initStore() {
  const local = readLocal()
  let remote = null
  try {
    const res = await fetchWithTimeout('/api/state')
    if (res.ok) remote = await res.json()
  } catch {
    serverAvailable = false
  }
  const localTime = local?.updatedAt || 0
  const remoteTime = remote?.updatedAt || 0
  state = normalize(remoteTime > localTime ? remote : local || remote)
  writeLocal()
  if (localTime > remoteTime && serverAvailable) pushToServer()
  applyTheme()
  startActivityTracking()
  return state
}

export function getState() {
  if (!state) state = normalize(readLocal())
  return state
}

export function update(fn) {
  getState()
  try {
    const result = fn(state)
    state.updatedAt = Date.now()
    scheduleSave()
    notify()
    return result
  } catch (error) {
    console.error('store update failed', error)
    return undefined
  }
}

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function recordAnswer({ itemId, kind, skills = [], correct, ms } = {}) {
  let xpGained = 0
  const newMastery = {}
  update(draft => {
    const now = Date.now()
    if (correct) {
      draft.answerStreak += 1
      draft.bestAnswerStreak = Math.max(draft.bestAnswerStreak, draft.answerStreak)
      xpGained = 10 + Math.min(10, Math.floor(draft.answerStreak / 3) * 2)
    } else {
      draft.answerStreak = 0
      xpGained = 2
    }
    draft.xp += xpGained
    for (const skill of skills) newMastery[skill] = adjustMastery(skill, correct ? 1 : 0)
    if (itemId) {
      const item = ensureItem(itemId, kind, skills)
      item.attempts += 1
      if (correct) item.correct += 1
      item.box = correct ? Math.min(5, item.box + 1) : 0
      item.due = now + (correct ? boxIntervals[item.box] : 60e3)
      item.lastAt = now
      draft.seen[itemId] = draft.seen[itemId] || now
    }
    const day = today()
    day.xp += xpGained
    day.answers += 1
    if (correct) day.correct += 1
    if (Number.isFinite(ms) && ms > 0) {
      const capped = Math.min(ms, 5 * 60e3)
      day.answerMs = (day.answerMs || 0) + capped
    }
    draft.history.push({ t: now, id: itemId || null, kind: kind || null, ok: Boolean(correct) })
    if (draft.history.length > 400) draft.history.splice(0, draft.history.length - 400)
  })
  return { xpGained, newMastery }
}

export function rateCard(itemId, skills = [], grade = 2) {
  const newMastery = {}
  let xpGained = 0
  update(draft => {
    const now = Date.now()
    const item = ensureItem(itemId, 'card', skills)
    if (grade <= 0) item.box = 0
    else if (grade === 1) item.box = Math.max(1, item.box)
    else if (grade === 2) item.box = Math.min(5, item.box + 1)
    else item.box = Math.min(5, item.box + 2)
    item.due = now + (grade <= 0 ? 60e3 : boxIntervals[item.box])
    item.attempts += 1
    if (grade >= 2) item.correct += 1
    item.lastAt = now
    draft.seen[itemId] = draft.seen[itemId] || now
    const outcome = [0, 0.45, 0.85, 1][Math.max(0, Math.min(3, grade))]
    for (const skill of skills) newMastery[skill] = adjustMastery(skill, outcome, 0.6)
    xpGained = [1, 3, 5, 6][Math.max(0, Math.min(3, grade))]
    draft.xp += xpGained
    const day = today()
    day.xp += xpGained
    day.answers += 1
    if (grade >= 2) day.correct += 1
  })
  return { xpGained, newMastery }
}

export function getMastery(skill) {
  return getState().skills[skill]?.mastery ?? startMastery
}

export function getSkillRecord(skill) {
  return getState().skills[skill] || { mastery: startMastery, attempts: 0, correct: 0, lastAt: 0 }
}

export function weakestSkills(n = 3, skillIds = null) {
  const current = getState()
  const ids = skillIds || Object.keys(current.skills)
  return ids
    .map(id => ({ id, mastery: current.skills[id]?.mastery ?? startMastery, attempts: current.skills[id]?.attempts || 0 }))
    .sort((a, b) => a.mastery - b.mastery || b.attempts - a.attempts)
    .slice(0, n)
    .map(entry => entry.id)
}

export function dueItems(kind) {
  const now = Date.now()
  return Object.entries(getState().items)
    .filter(([, item]) => item.attempts > 0 && item.due <= now && (!kind || item.kind === kind))
    .map(([id, item]) => ({ id, ...item }))
    .sort((a, b) => a.box - b.box || a.due - b.due)
}

export function getItemRecord(itemId) {
  return getState().items[itemId] || null
}

export function markSeen(id) {
  if (!id || getState().seen[id]) return
  update(draft => {
    draft.seen[id] = Date.now()
  })
}

export function isSeen(id) {
  return Boolean(getState().seen[id])
}

export function addTime(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return
  update(draft => {
    draft.studyMs += ms
    today().ms += ms
  })
}

export function addXP(amount, reason) {
  if (!Number.isFinite(amount) || amount <= 0) return 0
  update(draft => {
    draft.xp += Math.round(amount)
    today().xp += Math.round(amount)
    if (reason) draft.history.push({ t: Date.now(), id: reason, kind: 'xp', ok: true })
  })
  return Math.round(amount)
}

export function pickAdaptive(items = [], count = 10) {
  const current = getState()
  const now = Date.now()
  const scored = items.filter(Boolean).map(item => {
    const record = current.items[item.id]
    const skills = item.skills || []
    const masteries = skills.map(skill => current.skills[skill]?.mastery ?? startMastery)
    const avgMastery = masteries.length ? masteries.reduce((a, b) => a + b, 0) / masteries.length : startMastery
    let score = (1 - avgMastery) * 3
    if (record && record.attempts > 0) {
      if (record.due <= now) score += 6 - record.box * 0.6
      else score -= 3 + Math.min(3, (record.due - now) / 3600e3)
    } else if (!current.seen[item.id]) {
      score += 1.5
    }
    if (item.difficulty) {
      const target = 1 + avgMastery * 2.2
      score -= Math.abs(item.difficulty - target) * 0.7
    }
    score += Math.random() * 2
    return { item, score }
  })
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, count).map(entry => entry.item)
}

const levelThreshold = n => 100 * n * (n + 1) / 2

export function getXP() {
  return getState().xp
}

export function getLevel() {
  const xp = getXP()
  let level = 0
  while (levelThreshold(level + 1) <= xp) level++
  return level
}

export function getLevelInfo() {
  const xp = getXP()
  const level = getLevel()
  const floor = levelThreshold(level)
  const ceiling = levelThreshold(level + 1)
  return { level, xp, into: xp - floor, needed: ceiling - floor, progress: (xp - floor) / (ceiling - floor) }
}

const isActiveDay = day => day && (day.answers > 0 || day.ms >= 60e3)

export function getStreak() {
  const daily = getState().daily
  let streak = 0
  const cursor = new Date()
  if (!isActiveDay(daily[dayKey(cursor)])) cursor.setDate(cursor.getDate() - 1)
  while (isActiveDay(daily[dayKey(cursor)])) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function getToday() {
  return getState().daily[dayKey()] || { xp: 0, answers: 0, correct: 0, ms: 0 }
}

export function getStudyMinutes({ todayOnly = false } = {}) {
  const ms = todayOnly ? getToday().ms : getState().studyMs
  return Math.round(ms / 60e3)
}

export function getPlanBlock(blockId) {
  return getState().plan[blockId] || { done: false, steps: {} }
}

export function setPlanBlock(blockId, patch) {
  update(draft => {
    draft.plan[blockId] = { done: false, steps: {}, ...draft.plan[blockId], ...patch }
  })
}

export function setSetting(key, value) {
  update(draft => {
    draft.settings[key] = value
  })
  if (key === 'theme') applyTheme()
}

export function getSetting(key, fallback) {
  return getState().settings[key] ?? fallback
}

export function recordGameScore(gameId, score) {
  let isBest = false
  update(draft => {
    const best = draft.gameScores[gameId]
    if (best === undefined || score > best) {
      draft.gameScores[gameId] = score
      isBest = true
    }
  })
  return isBest
}

export function setNote(key, value) {
  update(draft => {
    draft.notes[key] = value
  })
}

export function resetState() {
  state = freshState()
  state.updatedAt = Date.now()
  writeLocal()
  pushToServer()
  notify()
}

export function applyTheme() {
  try {
    document.documentElement.dataset.theme = getState().settings.theme || 'dark'
  } catch {}
}

let trackingStarted = false

function startActivityTracking() {
  if (trackingStarted || typeof window === 'undefined') return
  trackingStarted = true
  const markInput = () => {
    lastInputAt = Date.now()
  }
  for (const eventName of ['pointerdown', 'keydown', 'wheel', 'touchstart', 'mousemove']) {
    window.addEventListener(eventName, markInput, { passive: true })
  }
  const tick = () => {
    const now = Date.now()
    const elapsed = Math.min(now - lastTickAt, tickMs * 2)
    lastTickAt = now
    if (document.visibilityState === 'visible' && now - lastInputAt < idleLimitMs && elapsed > 0) addTime(elapsed)
  }
  setInterval(tick, tickMs)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      tick()
      flushNow()
    } else {
      lastTickAt = Date.now()
      lastInputAt = Date.now()
    }
  })
  window.addEventListener('pagehide', flushNow)
}
