import { initAuth, getUser, onAuthChange, loadRemoteState, saveRemoteState, syncTiming, isLocalhost, signOut } from './auth/index.js'

const guestStorageKey = 'codecram-state'
const legacyStorageKey = 'google-cram-state'
const themeStorageKey = 'codecram-theme'
const userStorageKey = userId => `codecram-state:${userId}`
const pendingMergeKey = userId => `codecram-pending-merge:${userId}`
const boxIntervals = [0, 5 * 60e3, 30 * 60e3, 3 * 3600e3, 12 * 3600e3, 2 * 86400e3]
const startMastery = 0.3
const serverDebounceMs = 900
const idleLimitMs = 3 * 60e3
const tickMs = 15e3
const maxEvents = 20000
const maxSessions = 300
const cloudEventLimit = 3000
const cloudSessionLimit = 150
const cloudHistoryLimit = 150
const cloudSkillHistoryDays = 120
const keepaliveLimitBytes = 60000
const masteryFloor = startMastery
const masteryTarget = 0.85

const listeners = new Set()
const replaceListeners = new Set()
const syncListeners = new Set()
let state = null
let activeUserId = null
let serverTimer = null
let localTimer = null
let cloudTimer = null
let guestServerAvailable = false
let lastInputAt = Date.now()
let lastTickAt = Date.now()
let lastCloudText = ''
let lastCloudSaveAt = 0
let cloudSaving = null
let cloudReady = false
let accountSwitch = Promise.resolve()
let syncStatus = { status: 'local', at: 0, error: null }

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
  settings: { theme: 'light' },
  gameScores: {},
  notes: {},
  history: [],
  events: [],
  bites: {},
  checkpoints: {},
  bookmarks: {},
  sessions: [],
  skillHistory: {},
})

const normalize = raw => {
  const base = freshState()
  if (!raw || typeof raw !== 'object') return base
  const merged = { ...base, ...raw }
  for (const key of ['skills', 'items', 'seen', 'daily', 'plan', 'settings', 'gameScores', 'notes', 'bites', 'checkpoints', 'bookmarks', 'skillHistory']) {
    if (!merged[key] || typeof merged[key] !== 'object' || Array.isArray(merged[key])) merged[key] = base[key]
  }
  if (!Array.isArray(merged.history)) merged.history = []
  if (!Array.isArray(merged.events)) merged.events = []
  if (!Array.isArray(merged.sessions)) merged.sessions = []
  merged.settings = { ...base.settings, ...merged.settings }
  if (merged.settings.theme === 'dark' && !merged.settings.themeMigratedLight) {
    merged.settings.theme = 'light'
    merged.settings.themeMigratedLight = true
  }
  for (const key of ['xp', 'answerStreak', 'bestAnswerStreak', 'studyMs', 'updatedAt']) {
    if (!Number.isFinite(merged[key])) merged[key] = 0
  }
  return merged
}

const storageKeyFor = userId => userId ? userStorageKey(userId) : guestStorageKey

const readStorage = key => {
  try {
    const text = localStorage.getItem(key)
    return text ? JSON.parse(text) : null
  } catch {
    return null
  }
}

const migrateLegacyStorage = () => {
  try {
    if (localStorage.getItem(guestStorageKey)) return
    const legacy = localStorage.getItem(legacyStorageKey)
    if (legacy) localStorage.setItem(guestStorageKey, legacy)
  } catch {}
}

const readLocal = (userId = activeUserId) => readStorage(storageKeyFor(userId))

const setPendingMerge = (userId, on) => {
  try {
    if (on) localStorage.setItem(pendingMergeKey(userId), '1')
    else localStorage.removeItem(pendingMergeKey(userId))
  } catch {}
}

const hasPendingMerge = userId => {
  try {
    return localStorage.getItem(pendingMergeKey(userId)) === '1'
  } catch {
    return false
  }
}

const trimmedCopy = (source, { events, sessions, history, skillDays }) => {
  const copy = { ...source }
  copy.events = source.events.slice(-events)
  copy.sessions = source.sessions.slice(-sessions)
  copy.history = source.history.slice(-history)
  const days = Object.keys(source.skillHistory).sort().slice(-skillDays)
  copy.skillHistory = Object.fromEntries(days.map(day => [day, source.skillHistory[day]]))
  return copy
}

const cloudCopy = source => trimmedCopy(source, { events: cloudEventLimit, sessions: cloudSessionLimit, history: cloudHistoryLimit, skillDays: cloudSkillHistoryDays })

const writeLocal = () => {
  if (!state) return
  const key = storageKeyFor(activeUserId)
  try {
    localStorage.setItem(key, JSON.stringify(state))
  } catch {
    try {
      localStorage.setItem(key, JSON.stringify(cloudCopy(state)))
    } catch {}
  }
  try {
    localStorage.setItem(themeStorageKey, state.settings.theme || 'light')
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

const setSyncStatus = (status, extra = {}) => {
  syncStatus = { ...syncStatus, status, error: null, ...extra }
  for (const listener of [...syncListeners]) {
    try {
      listener(syncStatus)
    } catch (error) {
      console.error(error)
    }
  }
}

export function getSyncStatus() {
  return { ...syncStatus, userId: activeUserId }
}

export function onSyncChange(fn) {
  syncListeners.add(fn)
  return () => syncListeners.delete(fn)
}

export function onStateReplaced(fn) {
  replaceListeners.add(fn)
  return () => replaceListeners.delete(fn)
}

const pushToServer = async () => {
  if (!state || activeUserId || !guestServerAvailable) return
  try {
    await fetchWithTimeout('/api/state', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    }, 5000)
  } catch {}
}

const saveToCloud = async ({ force = false, keepalive = false } = {}) => {
  if (!state || !activeUserId || !cloudReady) return false
  if (cloudSaving) {
    await cloudSaving
    if (!force) return false
  }
  const userId = activeUserId
  const text = JSON.stringify(cloudCopy(state))
  if (text === lastCloudText) {
    setSyncStatus('synced', { at: syncStatus.at || Date.now() })
    return false
  }
  setSyncStatus('saving')
  cloudSaving = (async () => {
    try {
      await saveRemoteState(text, { keepalive: keepalive && text.length < keepaliveLimitBytes })
      if (userId === activeUserId) {
        lastCloudText = text
        lastCloudSaveAt = Date.now()
        setSyncStatus('synced', { at: lastCloudSaveAt })
      }
      return true
    } catch (error) {
      if (userId === activeUserId) setSyncStatus('error', { error: String(error?.message || error) })
      return false
    } finally {
      cloudSaving = null
    }
  })()
  return cloudSaving
}

const scheduleCloudSave = () => {
  if (!activeUserId) return
  clearTimeout(cloudTimer)
  const { delayMs, minGapMs } = syncTiming()
  const wait = Math.max(delayMs, lastCloudSaveAt + minGapMs - Date.now())
  if (syncStatus.status !== 'saving') setSyncStatus('pending')
  cloudTimer = setTimeout(() => saveToCloud(), wait)
}

const scheduleSave = () => {
  clearTimeout(localTimer)
  localTimer = setTimeout(writeLocal, 120)
  if (activeUserId) {
    scheduleCloudSave()
    return
  }
  if (!guestServerAvailable) return
  clearTimeout(serverTimer)
  serverTimer = setTimeout(pushToServer, serverDebounceMs)
}

const flushNow = () => {
  if (!state) return
  clearTimeout(localTimer)
  writeLocal()
  if (activeUserId) {
    clearTimeout(cloudTimer)
    saveToCloud({ force: true, keepalive: true })
    return
  }
  if (!guestServerAvailable) return
  clearTimeout(serverTimer)
  try {
    const body = new Blob([JSON.stringify(state)], { type: 'application/json' })
    if (!navigator.sendBeacon?.('/api/state', body)) pushToServer()
  } catch {
    pushToServer()
  }
}

export function syncNow() {
  clearTimeout(cloudTimer)
  writeLocal()
  if (activeUserId) return saveToCloud({ force: true })
  return pushToServer()
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
  const key = dayKey()
  if (!state.skillHistory[key]) state.skillHistory[key] = {}
  state.skillHistory[key][skill] = Math.round(record.mastery * 1000) / 1000
  return record.mastery
}

let curriculumApi = null

export async function loadCurriculum() {
  if (curriculumApi) return curriculumApi
  try {
    curriculumApi = await import('./content/curriculum.js')
  } catch (error) {
    console.error('curriculum load failed', error)
  }
  return curriculumApi
}

const findNode = id => curriculumApi?.findNode(id) || null

let eventContext = {}

export function setEventContext(context = {}) {
  eventContext = { ...context }
}

export function clearEventContext() {
  eventContext = {}
}

export function getEventContext() {
  return { ...eventContext }
}

const eventFields = ['type', 'itemId', 'kind', 'mode', 'skills', 'topic', 'nodeId', 'correct', 'ms', 'hinted', 'grade', 'score', 'gameId', 'pct', 'sessionId']

const buildEvent = fields => {
  const merged = { ...eventContext, ...fields }
  const event = { ts: Number.isFinite(merged.ts) ? merged.ts : Date.now() }
  for (const key of eventFields) {
    const value = merged[key]
    if (value === undefined || value === null || value === '') continue
    if (Array.isArray(value) && !value.length) continue
    event[key] = value
  }
  if (!event.type) event.type = 'answer'
  return event
}

const pushEvent = (draft, fields) => {
  const event = buildEvent(fields)
  draft.events.push(event)
  if (draft.events.length > maxEvents) draft.events.splice(0, draft.events.length - maxEvents)
  return event
}

export function logEvent(fields = {}) {
  let event = null
  update(draft => {
    event = pushEvent(draft, fields)
  })
  return event
}

export function getEvents(filter = {}) {
  const events = getState().events
  if (typeof filter === 'function') return events.filter(filter)
  const { type, since, until, skill, skills, nodeId, mode, itemId, kind, topic, correct, limit } = filter
  const types = type ? [].concat(type) : null
  const skillSet = skill || skills ? new Set([].concat(skill || skills)) : null
  let result = events.filter(event =>
    (!types || types.includes(event.type)) &&
    (!since || event.ts >= since) &&
    (!until || event.ts < until) &&
    (!skillSet || (event.skills || []).some(id => skillSet.has(id))) &&
    (!nodeId || event.nodeId === nodeId) &&
    (!mode || event.mode === mode) &&
    (!itemId || event.itemId === itemId) &&
    (!kind || event.kind === kind) &&
    (!topic || event.topic === topic) &&
    (correct === undefined || Boolean(event.correct) === correct))
  if (limit) result = result.slice(-limit)
  return result
}

const answeredCount = source => Object.values(source?.items || {}).filter(item => item?.attempts > 0).length

const isEmptyState = source => !source || (answeredCount(source) === 0 && !(source.xp > 0) && !Object.keys(source.bites || {}).length)

const unionKeys = (a = {}, b = {}) => [...new Set([...Object.keys(a), ...Object.keys(b)])]

const mergeByStrength = (a = {}, b = {}, { countField, tsField, maxFields = [] }) => {
  const result = {}
  for (const id of unionKeys(a, b)) {
    const av = a[id]
    const bv = b[id]
    if (!av) { result[id] = bv; continue }
    if (!bv) { result[id] = av; continue }
    const aCount = av[countField] || 0
    const bCount = bv[countField] || 0
    const useA = aCount !== bCount ? aCount > bCount : (av[tsField] || 0) >= (bv[tsField] || 0)
    const winner = useA ? av : bv
    const merged = { ...winner }
    for (const field of maxFields) merged[field] = Math.max(av[field] || 0, bv[field] || 0)
    result[id] = merged
  }
  return result
}

const mergeEarliestTimestamp = (a = {}, b = {}) => {
  const result = {}
  for (const id of unionKeys(a, b)) {
    const av = a[id]
    const bv = b[id]
    result[id] = av === undefined ? bv : bv === undefined ? av : Math.min(av, bv)
  }
  return result
}

const mergeMaxValue = (a = {}, b = {}) => {
  const result = {}
  for (const id of unionKeys(a, b)) {
    const av = a[id]
    const bv = b[id]
    result[id] = av === undefined ? bv : bv === undefined ? av : Math.max(av, bv)
  }
  return result
}

const mergeDaily = (a = {}, b = {}) => {
  const result = {}
  for (const day of unionKeys(a, b)) {
    const av = a[day]
    const bv = b[day]
    if (!av) { result[day] = bv; continue }
    if (!bv) { result[day] = av; continue }
    const merged = {
      xp: Math.max(av.xp || 0, bv.xp || 0),
      answers: Math.max(av.answers || 0, bv.answers || 0),
      correct: Math.max(av.correct || 0, bv.correct || 0),
      ms: Math.max(av.ms || 0, bv.ms || 0),
    }
    if (av.answerMs !== undefined || bv.answerMs !== undefined) merged.answerMs = Math.max(av.answerMs || 0, bv.answerMs || 0)
    result[day] = merged
  }
  return result
}

const mergeCheckpoints = (a = {}, b = {}) => {
  const merged = mergeByStrength(a, b, { countField: 'attempts', tsField: 'at', maxFields: ['best'] })
  for (const record of Object.values(merged)) record.passed = record.best >= 80
  return merged
}

const mergeSkills = (a = {}, b = {}) => {
  const winners = {}
  const skills = {}
  for (const skill of unionKeys(a, b)) {
    const av = a[skill]
    const bv = b[skill]
    if (!av) { skills[skill] = bv; winners[skill] = 'b'; continue }
    if (!bv) { skills[skill] = av; winners[skill] = 'a'; continue }
    const aAttempts = av.attempts || 0
    const bAttempts = bv.attempts || 0
    const useA = aAttempts !== bAttempts ? aAttempts > bAttempts : (av.lastAt || 0) >= (bv.lastAt || 0)
    winners[skill] = useA ? 'a' : 'b'
    skills[skill] = useA ? av : bv
  }
  return { skills, winners }
}

const mergeSkillHistory = (a = {}, b = {}, winners = {}) => {
  const result = {}
  for (const day of unionKeys(a, b)) {
    const ad = a[day] || {}
    const bd = b[day] || {}
    const dayMerged = {}
    for (const skill of unionKeys(ad, bd)) {
      const hasA = ad[skill] !== undefined
      const hasB = bd[skill] !== undefined
      dayMerged[skill] = hasA && hasB ? (winners[skill] === 'b' ? bd[skill] : ad[skill]) : hasA ? ad[skill] : bd[skill]
    }
    result[day] = dayMerged
  }
  return result
}

const dedupeByKey = (list, keyFn) => [...new Map(list.map(entry => [keyFn(entry), entry])).values()]

const mergeEvents = (a = [], b = []) => {
  const merged = dedupeByKey([...a, ...b], event => JSON.stringify(event)).sort((x, y) => x.ts - y.ts)
  return merged.length > maxEvents ? merged.slice(-maxEvents) : merged
}

const mergeSessions = (a = [], b = []) => {
  const merged = dedupeByKey([...a, ...b], session => session.id).sort((x, y) => x.at - y.at)
  return merged.length > maxSessions ? merged.slice(-maxSessions) : merged
}

const mergeHistory = (a = [], b = []) => {
  const merged = dedupeByKey([...a, ...b], entry => JSON.stringify(entry)).sort((x, y) => x.t - y.t)
  return merged.length > 400 ? merged.slice(-400) : merged
}

const mergePreferSide = (a = {}, b = {}, preferB) => {
  const result = {}
  for (const key of unionKeys(a, b)) {
    const hasA = a[key] !== undefined
    const hasB = b[key] !== undefined
    result[key] = hasA && hasB ? (preferB ? b[key] : a[key]) : hasA ? a[key] : b[key]
  }
  return result
}

const mergeStates = (guestRaw, remoteRaw) => {
  const a = normalize(guestRaw)
  const b = normalize(remoteRaw)
  const preferB = (b.updatedAt || 0) > (a.updatedAt || 0)
  const { skills, winners } = mergeSkills(a.skills, b.skills)
  return normalize({
    version: Math.max(a.version || 1, b.version || 1),
    createdAt: Math.min(a.createdAt || Date.now(), b.createdAt || Date.now()),
    updatedAt: Math.max(a.updatedAt || 0, b.updatedAt || 0),
    xp: Math.max(a.xp || 0, b.xp || 0),
    answerStreak: Math.max(a.answerStreak || 0, b.answerStreak || 0),
    bestAnswerStreak: Math.max(a.bestAnswerStreak || 0, b.bestAnswerStreak || 0),
    studyMs: Math.max(a.studyMs || 0, b.studyMs || 0),
    skills,
    items: mergeByStrength(a.items, b.items, { countField: 'attempts', tsField: 'lastAt' }),
    seen: mergeEarliestTimestamp(a.seen, b.seen),
    daily: mergeDaily(a.daily, b.daily),
    plan: mergePreferSide(a.plan, b.plan, preferB),
    settings: preferB ? b.settings : a.settings,
    gameScores: mergeMaxValue(a.gameScores, b.gameScores),
    notes: mergePreferSide(a.notes, b.notes, preferB),
    history: mergeHistory(a.history, b.history),
    events: mergeEvents(a.events, b.events),
    bites: mergeByStrength(a.bites, b.bites, { countField: 'count', tsField: 'at', maxFields: ['best'] }),
    checkpoints: mergeCheckpoints(a.checkpoints, b.checkpoints),
    bookmarks: mergeEarliestTimestamp(a.bookmarks, b.bookmarks),
    sessions: mergeSessions(a.sessions, b.sessions),
    skillHistory: mergeSkillHistory(a.skillHistory, b.skillHistory, winners),
  })
}

const announce = message => {
  if (typeof document === 'undefined') return
  import('./ui/h.js').then(({ toast }) => toast(message, 'good')).catch(() => {})
}

const replaceState = next => {
  state = normalize(next)
  writeLocal()
  applyTheme()
  notify()
  for (const listener of [...replaceListeners]) {
    try {
      listener(state)
    } catch (error) {
      console.error(error)
    }
  }
}

const loadGuestState = async () => {
  const local = readLocal(null)
  let remote = null
  guestServerAvailable = false
  if (isLocalhost()) {
    try {
      const res = await fetchWithTimeout('/api/state')
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
        remote = await res.json()
        guestServerAvailable = true
      }
    } catch {}
  }
  const localTime = local?.updatedAt || 0
  const remoteTime = remote?.updatedAt || 0
  const chosen = normalize(remoteTime > localTime ? remote : local || remote)
  if (localTime > remoteTime) setTimeout(pushToServer, 0)
  return chosen
}

const fetchRemote = async () => {
  try {
    const remote = await loadRemoteState()
    return { ok: true, remote: remote && typeof remote === 'object' ? remote : null }
  } catch (error) {
    setSyncStatus('error', { error: String(error?.message || error) })
    return { ok: false, remote: null }
  }
}

const reconcileWithRemote = async (userId, fresh) => {
  const { ok, remote } = await fetchRemote()
  if (activeUserId !== userId) return
  if (!ok) {
    setTimeout(() => {
      if (activeUserId === userId && !cloudReady) reconcileWithRemote(userId, fresh)
    }, 30000)
    return
  }
  const markSynced = () => {
    lastCloudText = JSON.stringify(cloudCopy(state))
    setSyncStatus('synced', { at: Date.now() })
  }
  if (!fresh) {
    cloudReady = true
    if (remote && remote.updatedAt === state.updatedAt) {
      markSynced()
      return
    }
    if (remote && (remote.updatedAt || 0) > (state.updatedAt || 0)) {
      replaceState(remote)
      markSynced()
      return
    }
    await saveToCloud()
    if (syncStatus.status !== 'error') setSyncStatus('synced', { at: Date.now() })
    return
  }
  const local = state
  cloudReady = true
  setPendingMerge(userId, false)
  if (isEmptyState(remote)) {
    replaceState({ ...local, updatedAt: Date.now() })
    await saveToCloud({ force: true })
    if (!isEmptyState(local)) announce('Progress synced')
    return
  }
  if (isEmptyState(local)) {
    replaceState(remote)
    markSynced()
    return
  }
  const merged = mergeStates(local, remote)
  merged.updatedAt = Date.now()
  replaceState(merged)
  await saveToCloud({ force: true })
  announce('Progress synced')
}

const adoptUser = async user => {
  const cached = readLocal(user.id)
  const guestSnapshot = state && !activeUserId ? state : normalize(readLocal(null))
  activeUserId = user.id
  cloudReady = false
  lastCloudText = ''
  lastCloudSaveAt = 0
  setSyncStatus('loading')
  const fresh = !cached || hasPendingMerge(user.id)
  if (fresh) setPendingMerge(user.id, true)
  replaceState(cached || { ...guestSnapshot })
  await reconcileWithRemote(user.id, fresh)
}

const dropToGuest = async () => {
  clearTimeout(cloudTimer)
  activeUserId = null
  lastCloudText = ''
  setSyncStatus('local', { at: 0 })
  replaceState(await loadGuestState())
}

const handleAuthChange = user => {
  accountSwitch = accountSwitch.then(() => user ? (user.id === activeUserId ? null : adoptUser(user)) : (activeUserId ? dropToGuest() : null)).catch(error => console.error('account switch failed', error))
  return accountSwitch
}

export function whenAccountReady() {
  return accountSwitch
}

export function getActiveUserId() {
  return activeUserId
}

export async function signOutUser() {
  await accountSwitch
  if (activeUserId) {
    clearTimeout(cloudTimer)
    writeLocal()
    await saveToCloud({ force: true })
  }
  await signOut()
  await accountSwitch
}

export async function initStore() {
  migrateLegacyStorage()
  let user = null
  try {
    user = await initAuth()
  } catch {}
  await loadCurriculum()
  if (user) {
    const cached = readLocal(user.id)
    if (cached) {
      activeUserId = user.id
      cloudReady = false
      state = normalize(cached)
      setSyncStatus('loading')
      accountSwitch = reconcileWithRemote(user.id, hasPendingMerge(user.id)).catch(error => console.error(error))
    } else {
      state = await loadGuestState()
      accountSwitch = adoptUser(user).catch(error => console.error(error))
    }
  } else {
    state = await loadGuestState()
  }
  onAuthChange(handleAuthChange)
  writeLocal()
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

export function recordAnswer({ itemId, kind, skills = [], correct, ms, mode, topic, nodeId, hinted } = {}) {
  let xpGained = 0
  const newMastery = {}
  update(draft => {
    const now = Date.now()
    const undo = correct ? null : {
      at: now,
      streak: draft.answerStreak,
      skills: Object.fromEntries(skills.map(skill => {
        const record = draft.skills[skill]
        return [skill, record ? { mastery: record.mastery, attempts: record.attempts, correct: record.correct } : null]
      })),
    }
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
      if (undo) {
        undo.box = item.box
        item.undo = undo
      } else {
        delete item.undo
      }
      item.attempts += 1
      if (correct) item.correct += 1
      item.box = correct ? Math.min(5, item.box + 1) : 0
      item.due = now + (correct ? boxIntervals[item.box] : 60e3)
      item.lastAt = now
      item.lastCorrect = Boolean(correct)
      draft.seen[itemId] = draft.seen[itemId] || now
    }
    pushEvent(draft, { type: 'answer', itemId, kind, skills, correct: Boolean(correct), ms: Number.isFinite(ms) ? Math.round(ms) : undefined, mode, topic, nodeId, hinted: hinted ? true : undefined, ts: now })
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

const findLastIndex = (list, predicate) => {
  for (let i = list.length - 1; i >= 0; i--) if (predicate(list[i])) return i
  return -1
}

export function overrideAnswer({ itemId, kind, skills = [], mode, topic, nodeId } = {}) {
  if (!itemId) return false
  const current = getState()
  const eventIndex = findLastIndex(current.events, event => event.type === 'answer' && event.itemId === itemId)
  const event = current.events[eventIndex]
  const item = current.items[itemId]
  const itemWrong = item && item.attempts > 0 && item.lastCorrect === false
  if (event ? event.correct : !itemWrong) return false
  let flipped = false
  update(draft => {
    const now = Date.now()
    const target = eventIndex >= 0 ? draft.events[eventIndex] : null
    const answeredAt = target?.ts || draft.items[itemId]?.lastAt || now
    const skillIds = skills.length ? skills : target?.skills || draft.items[itemId]?.skills || []
    const record = draft.items[itemId] || ensureItem(itemId, kind, skillIds)
    const undo = record.undo && Math.abs((record.undo.at || 0) - answeredAt) < 5000 ? record.undo : null
    const laterAnswers = draft.events.slice(eventIndex + 1).some(entry => entry.type === 'answer' || entry.type === 'card')
    if (record.lastCorrect === false) {
      record.correct = Math.min(record.attempts, (record.correct || 0) + 1)
      record.box = Math.min(5, (undo ? undo.box : 0) + 1)
      record.due = answeredAt + boxIntervals[record.box]
      record.lastCorrect = true
    }
    delete record.undo
    if (kind) record.kind = record.kind || kind
    let xpGained
    if (!laterAnswers && draft.answerStreak === 0) {
      draft.answerStreak = (undo ? undo.streak : 0) + 1
      draft.bestAnswerStreak = Math.max(draft.bestAnswerStreak, draft.answerStreak)
      xpGained = 10 + Math.min(10, Math.floor(draft.answerStreak / 3) * 2)
    } else {
      xpGained = 10
    }
    const xpDelta = xpGained - 2
    draft.xp += xpDelta
    const day = draft.daily[dayKey(answeredAt)]
    if (day) {
      day.xp = (day.xp || 0) + xpDelta
      day.correct = Math.min(day.answers || 0, (day.correct || 0) + 1)
    } else {
      today().xp += xpDelta
    }
    for (const skill of skillIds) {
      const before = undo?.skills?.[skill]
      const skillRecord = ensureSkill(skill)
      if (before !== undefined && skillRecord.attempts === (before?.attempts || 0) + 1) {
        if (before) Object.assign(skillRecord, before)
        else Object.assign(skillRecord, { mastery: startMastery, attempts: 0, correct: 0 })
        adjustMastery(skill, 1)
      } else {
        skillRecord.correct = Math.min(skillRecord.attempts, (skillRecord.correct || 0) + 1)
        skillRecord.mastery = Math.min(1, skillRecord.mastery + Math.max(0.05, 0.16 / (1 + skillRecord.attempts * 0.02)) * (1 - skillRecord.mastery))
        const key = dayKey()
        if (!draft.skillHistory[key]) draft.skillHistory[key] = {}
        draft.skillHistory[key][skill] = Math.round(skillRecord.mastery * 1000) / 1000
      }
    }
    if (target) {
      target.correct = true
      target.overridden = true
    } else {
      pushEvent(draft, { type: 'answer', itemId, kind, skills: skillIds, correct: true, mode, topic, nodeId, ts: now })
      draft.events[draft.events.length - 1].overridden = true
    }
    const historyIndex = findLastIndex(draft.history, entry => entry.id === itemId && entry.kind !== 'xp')
    if (historyIndex >= 0) draft.history[historyIndex].ok = true
    const sessionIndex = findLastIndex(draft.sessions, session => session.at >= answeredAt - 1000 && (session.results || []).some(result => result.itemId === itemId && !result.correct))
    if (sessionIndex >= 0) {
      const session = draft.sessions[sessionIndex]
      const resultIndex = findLastIndex(session.results, result => result.itemId === itemId && !result.correct)
      session.results[resultIndex] = { ...session.results[resultIndex], correct: true, overridden: true }
      session.correct = Math.min(session.total, (session.correct || 0) + 1)
      session.pct = session.total ? Math.round(session.correct / session.total * 100) : 0
      const sessionEvent = draft.events.find(entry => entry.type === 'session' && entry.sessionId === session.id)
      if (sessionEvent) sessionEvent.score = session.pct
    }
    flipped = true
  })
  return flipped
}

export function rateCard(itemId, skills = [], grade = 2, extra = {}) {
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
    item.lastCorrect = grade >= 2
    draft.seen[itemId] = draft.seen[itemId] || now
    pushEvent(draft, { ...extra, type: 'card', itemId, kind: 'card', skills, grade, correct: grade >= 2, ts: now })
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
    pushEvent(draft, { type: 'game', gameId, itemId: gameId, score })
  })
  return isBest
}

export function setNote(key, value) {
  update(draft => {
    draft.notes[key] = value
  })
}

export function resetState() {
  const fresh = freshState()
  fresh.updatedAt = Date.now()
  replaceState(fresh)
  syncNow()
}

export function exportState() {
  return JSON.parse(JSON.stringify(getState()))
}

export function importState(raw) {
  if (!raw || typeof raw !== 'object' || !raw.items || typeof raw.items !== 'object') return false
  replaceState({ ...raw, updatedAt: Date.now() })
  syncNow()
  return true
}

export function applyTheme() {
  try {
    document.documentElement.dataset.theme = getState().settings.theme || 'light'
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

export function getDailyRollups(days = 14) {
  const current = getState()
  const result = []
  const cursor = new Date()
  cursor.setDate(cursor.getDate() - (days - 1))
  for (let i = 0; i < days; i++) {
    const key = dayKey(cursor)
    const day = current.daily[key] || { xp: 0, answers: 0, correct: 0, ms: 0 }
    result.push({
      day: key,
      count: day.answers || 0,
      correct: day.correct || 0,
      accuracy: day.answers ? day.correct / day.answers : null,
      minutes: Math.round((day.ms || 0) / 60e3),
      xp: day.xp || 0,
    })
    cursor.setDate(cursor.getDate() + 1)
  }
  return result
}

export function getSkillHistory(skill) {
  const history = getState().skillHistory
  const days = Object.keys(history).sort()
  if (skill) return days.filter(day => history[day][skill] !== undefined).map(day => ({ day, mastery: history[day][skill] }))
  return days.map(day => ({ day, skills: { ...history[day] } }))
}

export function getSkillAccuracy(skill, lastN = 20) {
  const events = getEvents({ type: ['answer', 'card'], skill })
  const recent = events.slice(-lastN)
  const correct = recent.filter(event => event.correct).length
  return { total: recent.length, correct, wrong: recent.length - correct, accuracy: recent.length ? correct / recent.length : null }
}

export function completeBite(id, { ms, score } = {}) {
  if (!id) return null
  let record = null
  update(draft => {
    const now = Date.now()
    const prev = draft.bites[id] || { count: 0 }
    record = { done: true, at: now, firstAt: prev.firstAt || now, count: (prev.count || 0) + 1, best: Math.max(prev.best ?? 0, score ?? 0) }
    draft.bites[id] = record
    pushEvent(draft, { type: 'bite', nodeId: id, itemId: id, ms, score, ts: now })
  })
  return record
}

export function getBiteStatus(id) {
  return getState().bites[id] || { done: false, count: 0 }
}

export function recordCheckpoint(nodeId, pct) {
  if (!nodeId || !Number.isFinite(pct)) return null
  let record = null
  update(draft => {
    const now = Date.now()
    const prev = draft.checkpoints[nodeId] || { attempts: 0, best: 0 }
    const value = Math.max(0, Math.min(100, Math.round(pct)))
    record = { attempts: prev.attempts + 1, best: Math.max(prev.best, value), last: value, at: now, passed: Math.max(prev.best, value) >= 80 }
    draft.checkpoints[nodeId] = record
    pushEvent(draft, { type: 'checkpoint', nodeId, pct: value, correct: value >= 80, ts: now })
  })
  return record
}

export function getCheckpoint(nodeId) {
  return getState().checkpoints[nodeId] || null
}

const masteryScore = skills => {
  const ids = (skills || []).filter(skill => skill !== 'communication')
  if (!ids.length) return 0
  const avg = ids.reduce((sum, skill) => sum + getMastery(skill), 0) / ids.length
  return Math.max(0, Math.min(1, (avg - masteryFloor) / (masteryTarget - masteryFloor)))
}

const checkpointScore = (nodeId, passPct = 80) => {
  const record = getState().checkpoints[nodeId]
  if (!record) return 0
  return Math.min(1, record.best / passPct)
}

export function getNodeProgress(nodeId) {
  const node = findNode(nodeId)
  if (!node) return 0
  if (node.kind === 'bite') return getBiteStatus(nodeId).done ? 1 : 0
  if (node.kind === 'module') {
    const core = node.bites.filter(bite => !bite.optional)
    const list = core.length ? core : node.bites
    const biteFrac = list.length ? list.filter(bite => getBiteStatus(bite.id).done).length / list.length : 0
    return Math.min(1, biteFrac * 0.5 + checkpointScore(nodeId, node.checkpoint?.passPct) * 0.3 + masteryScore(node.skills) * 0.2)
  }
  const children = node.kind === 'unit' ? node.modules : node.units
  const total = children.reduce((sum, child) => sum + (child.minutes || 1), 0) || 1
  const rolled = children.reduce((sum, child) => sum + getNodeProgress(child.id) * (child.minutes || 1), 0) / total
  if (node.kind === 'unit') return Math.min(1, rolled * 0.85 + checkpointScore(nodeId, node.checkpoint?.passPct) * 0.15)
  return rolled
}

export function toggleBookmark(itemId) {
  if (!itemId) return false
  let on = false
  update(draft => {
    if (draft.bookmarks[itemId]) delete draft.bookmarks[itemId]
    else {
      draft.bookmarks[itemId] = Date.now()
      on = true
    }
  })
  return on
}

export function isBookmarked(itemId) {
  return Boolean(getState().bookmarks[itemId])
}

export function getBookmarks() {
  return Object.entries(getState().bookmarks).sort((a, b) => b[1] - a[1]).map(([id]) => id)
}

export function getMissed({ since = 0, kind } = {}) {
  return Object.entries(getState().items)
    .filter(([, item]) => item.attempts > 0 && item.lastCorrect === false && item.lastAt >= since && (!kind || item.kind === kind))
    .sort((a, b) => b[1].lastAt - a[1].lastAt)
    .map(([id, item]) => ({ id, kind: item.kind, skills: item.skills || [], lastAt: item.lastAt, attempts: item.attempts, correct: item.correct }))
}

export function saveSession({ mode, scope = {}, results = [], ms } = {}) {
  let session = null
  update(draft => {
    const now = Date.now()
    const total = results.length
    const correct = results.filter(result => result.correct).length
    const skillSet = [...new Set(results.flatMap(result => result.skills || []))]
    session = {
      id: `s${now.toString(36)}`,
      at: now,
      mode: mode || 'mixed',
      scope,
      total,
      correct,
      pct: total ? Math.round(correct / total * 100) : 0,
      ms: Number.isFinite(ms) ? ms : results.reduce((sum, result) => sum + (result.ms || 0), 0),
      skills: skillSet,
      results: results.slice(0, 200).map(result => ({ itemId: result.itemId, correct: Boolean(result.correct), ms: result.ms, kind: result.kind })),
    }
    draft.sessions.push(session)
    if (draft.sessions.length > maxSessions) draft.sessions.splice(0, draft.sessions.length - maxSessions)
    pushEvent(draft, { type: 'session', mode: session.mode, skills: skillSet, nodeId: scope.nodeId || scope.moduleId || scope.unitId, score: session.pct, ms: session.ms, sessionId: session.id, ts: now })
  })
  return session
}

export function getSessions(limit) {
  const sessions = getState().sessions
  return limit ? sessions.slice(-limit).reverse() : [...sessions].reverse()
}
