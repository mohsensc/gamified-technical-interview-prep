const requestJson = async (path, { method = 'GET', body, timeoutMs = 6000, keepalive = false } = {}) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(path, {
      method,
      credentials: 'same-origin',
      cache: 'no-store',
      keepalive,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
      signal: controller.signal,
    })
    const type = res.headers.get('content-type') || ''
    const data = type.includes('application/json') ? await res.json() : null
    if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`)
    return data
  } finally {
    clearTimeout(timer)
  }
}

export function createLocalAdapter() {
  let user = null
  const listeners = new Set()

  const setUser = next => {
    user = next || null
    for (const listener of [...listeners]) listener(user)
  }

  return {
    async init() {
      try {
        const data = await requestJson('/api/auth/me', { timeoutMs: 1500 })
        if (!data || !('user' in data)) return false
        user = data.user || null
        return true
      } catch {
        return false
      }
    },
    getUser: () => user,
    onChange(fn) {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
    async signInWithEmail(email, password) {
      const data = await requestJson('/api/auth/login', { method: 'POST', body: { email, password } })
      setUser(data.user)
      return data.user
    },
    async signUpWithEmail(email, password, name) {
      const data = await requestJson('/api/auth/signup', { method: 'POST', body: { email, password, name } })
      setUser(data.user)
      return data.user
    },
    async signInWithMagicLink() {
      throw new Error('Magic links need the hosted version')
    },
    async signInWithOAuth() {
      throw new Error('Social sign-in needs the hosted version')
    },
    async signOut() {
      try {
        await requestJson('/api/auth/logout', { method: 'POST', body: {} })
      } finally {
        setUser(null)
      }
    },
    async loadRemoteState() {
      const data = await requestJson('/api/user-state')
      return data?.state || null
    },
    async saveRemoteState(text, { keepalive = false } = {}) {
      await requestJson('/api/user-state', { method: 'PUT', body: text, timeoutMs: 15000, keepalive })
      return true
    },
    saveDelayMs: 1500,
    minGapMs: 4000,
  }
}
