import { config } from '../config.js'

const localHostnames = new Set(['localhost', '127.0.0.1', '[::1]', '::1'])
const listeners = new Set()
let adapter = null
let mode = 'guest'
let initPromise = null
let lastUserId = null

export const isLocalhost = () => {
  try {
    return localHostnames.has(location.hostname) || location.hostname.endsWith('.local')
  } catch {
    return false
  }
}

const supabaseConfigured = () => Boolean(config.supabaseUrl && config.supabaseAnonKey)

const emit = user => {
  const nextId = user?.id || null
  if (nextId === lastUserId) return
  lastUserId = nextId
  for (const listener of [...listeners]) {
    try {
      listener(user || null)
    } catch (error) {
      console.error(error)
    }
  }
}

const requireAdapter = () => {
  if (!adapter) throw new Error('Accounts are not available here. Your progress is saved in this browser.')
  return adapter
}

export function initAuth() {
  if (initPromise) return initPromise
  initPromise = (async () => {
    if (supabaseConfigured()) {
      const { createSupabaseAdapter } = await import('./supabase.js')
      adapter = createSupabaseAdapter(config)
      await adapter.init()
      mode = 'supabase'
    } else if (isLocalhost()) {
      const { createLocalAdapter } = await import('./local.js')
      const candidate = createLocalAdapter()
      if (await candidate.init()) {
        adapter = candidate
        mode = 'local'
      }
    }
    if (adapter) {
      lastUserId = adapter.getUser()?.id || null
      adapter.onChange(emit)
    }
    return getUser()
  })().catch(error => {
    console.error('auth unavailable', error)
    adapter = null
    mode = 'guest'
    return null
  })
  return initPromise
}

export function authMode() {
  return mode
}

export function accountsAvailable() {
  return mode !== 'guest'
}

export function getUser() {
  return adapter?.getUser() || null
}

export function onAuthChange(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function syncTiming() {
  return { delayMs: adapter?.saveDelayMs ?? 8000, minGapMs: adapter?.minGapMs ?? 45000 }
}

const cleanEmail = email => String(email || '').trim().toLowerCase()

export async function signInWithEmail(email, password) {
  return requireAdapter().signInWithEmail(cleanEmail(email), String(password || ''))
}

export async function signUpWithEmail(email, password, name) {
  return requireAdapter().signUpWithEmail(cleanEmail(email), String(password || ''), String(name || '').trim())
}

export async function signInWithMagicLink(email) {
  return requireAdapter().signInWithMagicLink(cleanEmail(email))
}

export async function signInWithOAuth(provider) {
  if (!['google', 'github'].includes(provider)) throw new Error('Unknown provider')
  return requireAdapter().signInWithOAuth(provider)
}

export async function signOut() {
  if (!adapter) return
  await adapter.signOut()
  emit(null)
}

export async function loadRemoteState() {
  if (!adapter || !getUser()) return null
  return adapter.loadRemoteState()
}

export async function saveRemoteState(state, options = {}) {
  if (!adapter || !getUser()) return false
  const text = typeof state === 'string' ? state : JSON.stringify(state)
  return adapter.saveRemoteState(text, options)
}
