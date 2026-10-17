const libraryUrl = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'
const sessionStorageKey = 'codecram-auth'
const progressTable = 'progress'

const toUser = raw => {
  if (!raw) return null
  const meta = raw.user_metadata || {}
  const email = raw.email || ''
  return {
    id: raw.id,
    email,
    name: meta.full_name || meta.name || meta.user_name || email.split('@')[0] || 'You',
    provider: raw.app_metadata?.provider || 'email',
  }
}

const hasStoredSession = () => {
  try {
    return Boolean(localStorage.getItem(sessionStorageKey))
  } catch {
    return false
  }
}

const hasAuthCallback = () => {
  const query = new URLSearchParams(location.search)
  return query.has('code') || query.has('error_description')
}

const cleanCallbackUrl = () => {
  const query = new URLSearchParams(location.search)
  if (!query.has('code') && !query.has('error_description') && !query.has('error')) return
  for (const key of ['code', 'error', 'error_code', 'error_description']) query.delete(key)
  const search = query.toString()
  history.replaceState(null, '', `${location.pathname}${search ? `?${search}` : ''}${location.hash || '#/'}`)
}

const redirectTarget = siteUrl => `${(siteUrl || location.origin + location.pathname).replace(/#.*$/, '')}`

export function createSupabaseAdapter({ supabaseUrl, supabaseAnonKey, siteUrl }) {
  let client = null
  let clientPromise = null
  let user = null
  let cachedSession = null
  const listeners = new Set()

  const setUser = next => {
    const mapped = toUser(next)
    if (mapped?.id === user?.id) {
      user = mapped
      return
    }
    user = mapped
    for (const listener of [...listeners]) listener(user)
  }

  const getClient = () => {
    if (client) return Promise.resolve(client)
    if (!clientPromise) {
      clientPromise = import(libraryUrl).then(({ createClient }) => {
        client = createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            flowType: 'pkce',
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storageKey: sessionStorageKey,
          },
        })
        client.auth.onAuthStateChange((event, session) => {
          cachedSession = session || null
          setUser(session?.user || null)
        })
        return client
      }).catch(error => {
        clientPromise = null
        throw error
      })
    }
    return clientPromise
  }

  const requireUser = () => {
    if (!user) throw new Error('Not signed in')
    return user
  }

  return {
    async init() {
      const callback = hasAuthCallback()
      if (!callback && !hasStoredSession()) return true
      try {
        const supabase = await getClient()
        const { data } = await supabase.auth.getSession()
        cachedSession = data?.session || null
        user = toUser(data?.session?.user)
      } catch (error) {
        console.error('auth init failed', error)
      }
      if (callback) cleanCallbackUrl()
      return true
    },
    getUser: () => user,
    onChange(fn) {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
    async signInWithEmail(email, password) {
      const supabase = await getClient()
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      cachedSession = data.session || cachedSession
      setUser(data.user)
      return user
    },
    async signUpWithEmail(email, password, name) {
      const supabase = await getClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name || '' }, emailRedirectTo: redirectTarget(siteUrl) },
      })
      if (error) throw error
      if (!data.session) return { pendingConfirmation: true }
      cachedSession = data.session
      setUser(data.user)
      return user
    },
    async signInWithMagicLink(email) {
      const supabase = await getClient()
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTarget(siteUrl) } })
      if (error) throw error
      return { sent: true }
    },
    async signInWithOAuth(provider) {
      const supabase = await getClient()
      const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: redirectTarget(siteUrl) } })
      if (error) throw error
      return { redirecting: true }
    },
    async signOut() {
      try {
        const supabase = await getClient()
        await supabase.auth.signOut()
      } finally {
        cachedSession = null
        setUser(null)
      }
    },
    async loadRemoteState() {
      const { id } = requireUser()
      const supabase = await getClient()
      const { data, error } = await supabase.from(progressTable).select('state').eq('user_id', id).maybeSingle()
      if (error) throw error
      return data?.state || null
    },
    async saveRemoteState(text, { keepalive = false } = {}) {
      const { id } = requireUser()
      const row = { user_id: id, state: JSON.parse(text), updated_at: new Date().toISOString() }
      if (keepalive && cachedSession?.access_token) {
        const res = await fetch(`${supabaseUrl}/rest/v1/progress?on_conflict=user_id`, {
          method: 'POST',
          keepalive: true,
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${cachedSession.access_token}`,
            'Content-Type': 'application/json',
            Prefer: 'resolution=merge-duplicates,return=minimal',
          },
          body: JSON.stringify(row),
        })
        if (!res.ok) throw new Error(`Save failed (${res.status})`)
        return true
      }
      const supabase = await getClient()
      const { error } = await supabase.from(progressTable).upsert(row)
      if (error) throw error
      return true
    },
    saveDelayMs: 8000,
    minGapMs: 45000,
  }
}
