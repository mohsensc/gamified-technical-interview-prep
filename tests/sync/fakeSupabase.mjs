import { randomUUID } from 'node:crypto'

export const fakeSupabaseHost = 'fake-project.supabase.co'
export const fakeSupabaseUrl = `https://${fakeSupabaseHost}`

const base64Url = value => Buffer.from(JSON.stringify(value)).toString('base64url')

const corsHeaders = requestHeaders => ({
  'access-control-allow-origin': '*',
  'access-control-allow-headers': requestHeaders?.['access-control-request-headers'] || '*',
  'access-control-allow-methods': '*',
  'access-control-expose-headers': '*',
})

export const createFakeSupabase = () => {
  const users = new Map()
  const tokens = new Map()
  const progress = new Map()
  const writes = []

  const makeSession = user => {
    const accessToken = `${base64Url({ alg: 'HS256', typ: 'JWT' })}.${base64Url({ sub: user.id, role: 'authenticated', exp: 4102444800 })}.${randomUUID().replace(/-/g, '')}`
    tokens.set(accessToken, user.id)
    return {
      access_token: accessToken,
      token_type: 'bearer',
      expires_in: 31536000,
      expires_at: Math.floor(Date.now() / 1000) + 31536000,
      refresh_token: `refresh-${user.id}`,
      user: publicUser(user),
    }
  }

  const publicUser = user => ({
    id: user.id,
    aud: 'authenticated',
    role: 'authenticated',
    email: user.email,
    app_metadata: { provider: 'email' },
    user_metadata: { full_name: user.name },
    created_at: new Date().toISOString(),
  })

  const userFromRequest = request => tokens.get(String(request.headers().authorization || '').replace(/^Bearer /, '')) || null

  const handle = async (route, control) => {
    const request = route.request()
    const url = new URL(request.url())
    const headers = corsHeaders(request.headers())
    const json = (status, body) => route.fulfill({ status, headers: { ...headers, 'content-type': 'application/json' }, body: JSON.stringify(body) })
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
    if (control.offline) return route.abort('internetdisconnected')
    const path = url.pathname
    const body = request.postData() ? JSON.parse(request.postData()) : {}
    if (path === '/auth/v1/signup') {
      if ([...users.values()].some(user => user.email === body.email)) return json(422, { code: 'user_already_exists', msg: 'User already registered' })
      const user = { id: randomUUID(), email: body.email, password: body.password, name: body.data?.full_name || '' }
      users.set(user.id, user)
      return json(200, makeSession(user))
    }
    if (path === '/auth/v1/token') {
      const grant = url.searchParams.get('grant_type')
      if (grant === 'password') {
        const user = [...users.values()].find(entry => entry.email === body.email && entry.password === body.password)
        if (!user) return json(400, { code: 'invalid_credentials', msg: 'Invalid login credentials', error_description: 'Invalid login credentials' })
        return json(200, makeSession(user))
      }
      const user = users.get(String(body.refresh_token || '').replace('refresh-', ''))
      return user ? json(200, makeSession(user)) : json(400, { msg: 'bad refresh' })
    }
    if (path === '/auth/v1/logout') return route.fulfill({ status: 204, headers })
    if (path === '/auth/v1/user') {
      const userId = userFromRequest(request)
      return userId ? json(200, publicUser(users.get(userId))) : json(401, { msg: 'unauthorized' })
    }
    if (path === '/rest/v1/progress') {
      const userId = userFromRequest(request)
      if (!userId) return json(401, { message: 'JWT expired', code: 'PGRST301' })
      if (request.method() === 'GET') {
        const wanted = (url.searchParams.get('user_id') || '').replace('eq.', '')
        if (wanted !== userId) return json(200, [])
        const row = progress.get(userId)
        const wantsObject = String(request.headers().accept || '').includes('vnd.pgrst.object')
        if (wantsObject) return row ? json(200, { state: row.state }) : json(406, { code: 'PGRST116', details: 'The result contains 0 rows', message: 'JSON object requested, multiple (or no) rows returned' })
        return json(200, row ? [{ state: row.state }] : [])
      }
      if (request.method() === 'POST') {
        const rows = [].concat(body)
        for (const row of rows) {
          if (row.user_id !== userId) return json(403, { code: '42501', message: 'row-level security violation' })
          progress.set(userId, { state: row.state, updatedAt: row.updated_at })
          writes.push({ userId, at: Date.now() })
        }
        return route.fulfill({ status: 201, headers })
      }
    }
    return json(404, { message: `unhandled ${request.method()} ${path}` })
  }

  const findUser = email => [...users.values()].find(user => user.email === email) || null

  return {
    handle,
    writes,
    stateForEmail: email => {
      const user = findUser(email)
      return user ? progress.get(user.id)?.state || null : null
    },
    reset: () => {
      users.clear()
      tokens.clear()
      progress.clear()
      writes.length = 0
    },
  }
}
