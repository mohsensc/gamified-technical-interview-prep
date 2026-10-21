import http from 'node:http'
import { readFile, writeFile, rename, mkdir, stat, readdir } from 'node:fs/promises'
import { join, normalize, extname, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomBytes, randomUUID, scrypt, timingSafeEqual, createHash } from 'node:crypto'

const rootDir = dirname(fileURLToPath(import.meta.url))
const dataDir = process.env.DATA_DIR || join(rootDir, 'data')
const statePath = join(dataDir, 'state.json')
const usersPath = join(dataDir, 'users.json')
const authSessionsPath = join(dataDir, 'auth-sessions.json')
const userStateDir = join(dataDir, 'users')
const port = Number(process.env.PORT) || 5317
const host = process.env.HOST || '127.0.0.1'
const staticEntries = new Set(['index.html', 'src', 'robots.txt', 'sitemap.xml', 'manifest.webmanifest', 'favicon.svg'])
const sessionCookieName = 'techprep_session'
const legacySessionCookieName = 'codecram_session'
const sessionMaxAgeSeconds = 60 * 24 * 3600
const maxUserStateBytes = 8 * 1024 * 1024

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown; charset=utf-8',
  '.py': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
}

const latestMtime = async dir => {
  let latest = 0
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    latest = Math.max(latest, entry.isDirectory() ? await latestMtime(full) : (await stat(full)).mtimeMs)
  }
  return latest
}

const sendJson = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
  res.end(JSON.stringify(body))
}

const readBody = req => new Promise((resolve, reject) => {
  const chunks = []
  let size = 0
  req.on('data', chunk => {
    size += chunk.length
    if (size > 20 * 1024 * 1024) {
      reject(new Error('Body too large'))
      req.destroy()
      return
    }
    chunks.push(chunk)
  })
  req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
  req.on('error', reject)
})

let writeChain = Promise.resolve()

const writeFileAtomic = (filePath, text) => {
  writeChain = writeChain.then(async () => {
    await mkdir(dirname(filePath), { recursive: true })
    const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`
    await writeFile(tempPath, text, 'utf8')
    await rename(tempPath, filePath)
  })
  const job = writeChain
  writeChain = job.catch(error => console.error('write failed', filePath, error))
  return job
}

const writeStateAtomic = text => writeFileAtomic(statePath, text)

const readJsonFile = async (filePath, fallback) => {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'))
  } catch {
    return fallback
  }
}

const hashPassword = (password, salt) => new Promise((resolve, reject) => {
  scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (error, key) => error ? reject(error) : resolve(key))
})

const hashToken = token => createHash('sha256').update(token).digest('hex')

const parseCookies = header => Object.fromEntries(String(header || '').split(';').map(part => {
  const index = part.indexOf('=')
  if (index < 0) return null
  return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())]
}).filter(Boolean))

const readSessionToken = req => {
  const cookies = parseCookies(req.headers.cookie)
  return cookies[sessionCookieName] || cookies[legacySessionCookieName]
}

const sessionCookie = (token, maxAge) => `${sessionCookieName}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}`

const publicUser = user => ({ id: user.id, email: user.email, name: user.name, provider: 'local' })

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

let usersCache = null
let authSessionsCache = null

const loadUsers = async () => {
  if (!usersCache) usersCache = await readJsonFile(usersPath, { users: [] })
  if (!Array.isArray(usersCache.users)) usersCache.users = []
  return usersCache
}

const loadAuthSessions = async () => {
  if (!authSessionsCache) authSessionsCache = await readJsonFile(authSessionsPath, {})
  const now = Date.now()
  for (const [key, session] of Object.entries(authSessionsCache)) if (session.expiresAt < now) delete authSessionsCache[key]
  return authSessionsCache
}

const saveUsers = () => writeFileAtomic(usersPath, JSON.stringify(usersCache, null, 2))
const saveAuthSessions = () => writeFileAtomic(authSessionsPath, JSON.stringify(authSessionsCache))

const userStatePath = userId => join(userStateDir, `${userId.replace(/[^a-zA-Z0-9-]/g, '')}.json`)

const currentUser = async req => {
  const token = readSessionToken(req)
  if (!token) return null
  const sessions = await loadAuthSessions()
  const session = sessions[hashToken(token)]
  if (!session) return null
  const { users } = await loadUsers()
  return users.find(user => user.id === session.userId) || null
}

const startSession = async (res, user) => {
  const token = randomBytes(32).toString('hex')
  const sessions = await loadAuthSessions()
  sessions[hashToken(token)] = { userId: user.id, createdAt: Date.now(), expiresAt: Date.now() + sessionMaxAgeSeconds * 1000 }
  await saveAuthSessions()
  res.setHeader('Set-Cookie', sessionCookie(token, sessionMaxAgeSeconds))
}

const readJsonBody = async req => {
  const text = await readBody(req)
  return text ? JSON.parse(text) : {}
}

const failedLogins = new Map()

const handleAuth = async (req, res, path) => {
  if (path === '/api/auth/me' && req.method === 'GET') {
    const user = await currentUser(req)
    return sendJson(res, 200, { user: user ? publicUser(user) : null })
  }
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })
  if (path === '/api/auth/signup') {
    const body = await readJsonBody(req)
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    const name = String(body.name || '').trim().slice(0, 60) || email.split('@')[0]
    if (!emailPattern.test(email)) return sendJson(res, 400, { error: 'Enter a valid email' })
    if (password.length < 8) return sendJson(res, 400, { error: 'Use at least 8 characters' })
    const store = await loadUsers()
    if (store.users.some(user => user.email === email)) return sendJson(res, 409, { error: 'That email already has an account' })
    const salt = randomBytes(16).toString('hex')
    const hash = (await hashPassword(password, salt)).toString('hex')
    const user = { id: randomUUID(), email, name, salt, hash, createdAt: Date.now() }
    store.users.push(user)
    await saveUsers()
    await startSession(res, user)
    return sendJson(res, 200, { user: publicUser(user) })
  }
  if (path === '/api/auth/login') {
    const body = await readJsonBody(req)
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    const recent = (failedLogins.get(email) || []).filter(time => Date.now() - time < 15 * 60e3)
    if (recent.length >= 10) return sendJson(res, 429, { error: 'Too many attempts. Try again later' })
    const { users } = await loadUsers()
    const user = users.find(entry => entry.email === email)
    const salt = user?.salt || randomBytes(16).toString('hex')
    const attempt = await hashPassword(password, salt)
    const valid = user && timingSafeEqual(attempt, Buffer.from(user.hash, 'hex'))
    if (!valid) {
      failedLogins.set(email, [...recent, Date.now()])
      return sendJson(res, 401, { error: 'Wrong email or password' })
    }
    failedLogins.delete(email)
    await startSession(res, user)
    return sendJson(res, 200, { user: publicUser(user) })
  }
  if (path === '/api/auth/logout') {
    const token = readSessionToken(req)
    if (token) {
      const sessions = await loadAuthSessions()
      delete sessions[hashToken(token)]
      await saveAuthSessions()
    }
    res.setHeader('Set-Cookie', sessionCookie('', 0))
    return sendJson(res, 200, { ok: true })
  }
  return sendJson(res, 404, { error: 'Not found' })
}

const handleUserState = async (req, res) => {
  const user = await currentUser(req)
  if (!user) return sendJson(res, 401, { error: 'Not signed in' })
  const filePath = userStatePath(user.id)
  if (req.method === 'GET') {
    return sendJson(res, 200, { state: await readJsonFile(filePath, null) })
  }
  if (req.method === 'PUT' || req.method === 'POST') {
    const text = await readBody(req)
    if (Buffer.byteLength(text) > maxUserStateBytes) return sendJson(res, 413, { error: 'State too large' })
    const parsed = JSON.parse(text)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return sendJson(res, 400, { error: 'Invalid state' })
    await writeFileAtomic(filePath, JSON.stringify(parsed))
    return sendJson(res, 200, { ok: true, updatedAt: parsed.updatedAt ?? null })
  }
  return sendJson(res, 405, { error: 'Method not allowed' })
}

const handleState = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const text = await readFile(statePath, 'utf8')
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
      res.end(text)
    } catch {
      sendJson(res, 200, null)
    }
    return
  }
  if (req.method === 'PUT' || req.method === 'POST') {
    try {
      const origin = req.headers.origin
      if (origin && new URL(origin).host !== req.headers.host) return sendJson(res, 403, { ok: false, error: 'Forbidden' })
      const text = await readBody(req)
      const parsed = JSON.parse(text)
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid state')
      if ((parsed.updatedAt || 0) > Date.now() + 24 * 3600 * 1000) throw new Error('Invalid updatedAt')
      await writeStateAtomic(JSON.stringify(parsed))
      sendJson(res, 200, { ok: true, updatedAt: parsed?.updatedAt ?? null })
    } catch (error) {
      sendJson(res, 400, { ok: false, error: String(error.message || error) })
    }
    return
  }
  sendJson(res, 405, { ok: false })
}

const serveStatic = async (req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
  const safePath = normalize(urlPath).replace(/^(\.\.[/\\])+/, '')
  let filePath = join(rootDir, safePath)
  const topEntry = safePath.split(/[/\\]/).filter(Boolean)[0]
  const allowed = !topEntry || staticEntries.has(topEntry)
  if (!filePath.startsWith(rootDir) || !allowed || safePath.split(/[/\\]/).some(part => part.startsWith('.') && part.length > 1)) {
    res.writeHead(403)
    res.end('Forbidden')
    return
  }
  try {
    const info = await stat(filePath)
    if (info.isDirectory()) filePath = join(filePath, 'index.html')
    const body = await readFile(filePath)
    res.writeHead(200, {
      'Content-Type': mimeTypes[extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    })
    res.end(body)
  } catch {
    if (!extname(urlPath)) {
      const body = await readFile(join(rootDir, 'index.html'))
      res.writeHead(200, { 'Content-Type': mimeTypes['.html'] })
      res.end(body)
      return
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('Not found')
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const path = new URL(req.url, 'http://localhost').pathname
    if (path.startsWith('/api/auth/')) {
      try {
        return await handleAuth(req, res, path)
      } catch (error) {
        return sendJson(res, 400, { error: error instanceof SyntaxError ? 'Invalid request' : String(error.message || error) })
      }
    }
    if (path === '/api/user-state') {
      try {
        return await handleUserState(req, res)
      } catch (error) {
        return sendJson(res, 400, { error: String(error.message || error) })
      }
    }
    if (path === '/api/state') return await handleState(req, res)
    if (req.url.startsWith('/api/version')) {
      const version = Math.max(await latestMtime(join(rootDir, 'src')), (await stat(join(rootDir, 'index.html'))).mtimeMs)
      return sendJson(res, 200, { version })
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405)
      res.end()
      return
    }
    await serveStatic(req, res)
  } catch (error) {
    console.error(error)
    if (!res.headersSent) res.writeHead(500)
    res.end('Server error')
  }
})

server.listen(port, host, () => {
  console.log(`\n  TechPrep  →  http://localhost:${port}\n`)
})
