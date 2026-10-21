import http from 'node:http'
import { readFile, stat, readdir } from 'node:fs/promises'
import { mkdirSync, readFileSync, existsSync, readdirSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { join, normalize, extname, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = dirname(fileURLToPath(import.meta.url))
const databasePath = process.env.DB_PATH || join(rootDir, 'data', 'techprep.db')
const legacyDir = dirname(databasePath)
const port = Number(process.env.PORT) || 5317
const host = '127.0.0.1'
const staticEntries = new Set(['index.html', 'src', 'manifest.webmanifest', 'favicon.svg'])
const maxBodyBytes = 64 * 1024 * 1024
const allowedHosts = new Set(['localhost', '127.0.0.1', '[::1]'])

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
}

mkdirSync(dirname(databasePath), { recursive: true })
const database = new DatabaseSync(databasePath)
database.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  CREATE TABLE IF NOT EXISTS progress (
    section TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`)

const selectAllSections = database.prepare('SELECT section, value FROM progress')
const upsertSection = database.prepare('INSERT INTO progress (section, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(section) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at')
const deleteSection = database.prepare('DELETE FROM progress WHERE section = ?')
const deleteAllSections = database.prepare('DELETE FROM progress')
const selectMeta = database.prepare('SELECT value FROM meta WHERE key = ?')
const upsertMeta = database.prepare('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')

const savedSectionText = new Map()

const readState = () => {
  const rows = selectAllSections.all()
  if (!rows.length) return null
  const state = {}
  for (const row of rows) {
    state[row.section] = JSON.parse(row.value)
    savedSectionText.set(row.section, row.value)
  }
  return state
}

const writeState = state => {
  const now = Date.now()
  database.exec('BEGIN')
  try {
    for (const row of selectAllSections.all()) if (!(row.section in state)) {
      deleteSection.run(row.section)
      savedSectionText.delete(row.section)
    }
    for (const [section, value] of Object.entries(state)) {
      const text = JSON.stringify(value)
      if (savedSectionText.get(section) === text) continue
      upsertSection.run(section, text, now)
      savedSectionText.set(section, text)
    }
    database.exec('COMMIT')
  } catch (error) {
    database.exec('ROLLBACK')
    savedSectionText.clear()
    throw error
  }
}

const clearState = () => {
  deleteAllSections.run()
  savedSectionText.clear()
}

const isPlainObject = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const answeredCount = state => Object.values(state?.items || {}).filter(item => item?.attempts > 0).length

const readJsonFileSync = filePath => {
  try {
    const parsed = JSON.parse(readFileSync(filePath, 'utf8'))
    return isPlainObject(parsed) ? parsed : null
  } catch {
    return null
  }
}

const importLegacyFiles = () => {
  if (selectMeta.get('legacyImportDone')) return
  upsertMeta.run('legacyImportDone', '1')
  if (selectAllSections.all().length) return
  const candidates = []
  const statePath = join(legacyDir, 'state.json')
  if (existsSync(statePath)) candidates.push(statePath)
  const usersDir = join(legacyDir, 'users')
  if (existsSync(usersDir)) for (const name of readdirSync(usersDir)) if (name.endsWith('.json')) candidates.push(join(usersDir, name))
  const states = candidates.map(file => ({ file, state: readJsonFileSync(file) })).filter(entry => entry.state)
  if (!states.length) return
  states.sort((a, b) => answeredCount(b.state) - answeredCount(a.state) || (b.state.updatedAt || 0) - (a.state.updatedAt || 0))
  const best = states[0]
  if (!answeredCount(best.state) && !(best.state.xp > 0)) return
  writeState(best.state)
  console.log(`  Imported your earlier progress from ${best.file}`)
}

importLegacyFiles()

const sendJson = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
  res.end(JSON.stringify(body))
}

const readBody = req => new Promise((resolve, reject) => {
  const chunks = []
  let size = 0
  req.on('data', chunk => {
    size += chunk.length
    if (size > maxBodyBytes) {
      reject(new Error('Body too large'))
      req.destroy()
      return
    }
    chunks.push(chunk)
  })
  req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
  req.on('error', reject)
})

const hostIsLocal = req => allowedHosts.has(String(req.headers.host || '').replace(/:\d+$/, '').toLowerCase())

const originIsSame = req => {
  const origin = req.headers.origin
  if (!origin) return true
  try {
    return new URL(origin).host === req.headers.host
  } catch {
    return false
  }
}

const handleState = async (req, res) => {
  if (req.method === 'GET') return sendJson(res, 200, { state: readState() })
  if (!originIsSame(req)) return sendJson(res, 403, { ok: false, error: 'Forbidden' })
  if (req.method === 'DELETE') {
    clearState()
    return sendJson(res, 200, { ok: true })
  }
  if (req.method === 'PUT' || req.method === 'POST') {
    try {
      const parsed = JSON.parse(await readBody(req))
      if (!isPlainObject(parsed)) throw new Error('Progress must be a JSON object')
      writeState(parsed)
      return sendJson(res, 200, { ok: true })
    } catch (error) {
      return sendJson(res, 400, { ok: false, error: String(error.message || error) })
    }
  }
  return sendJson(res, 405, { ok: false })
}

const latestMtime = async dir => {
  let latest = 0
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    latest = Math.max(latest, entry.isDirectory() ? await latestMtime(full) : (await stat(full)).mtimeMs)
  }
  return latest
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
    if (!hostIsLocal(req)) {
      res.writeHead(403)
      res.end('Forbidden')
      return
    }
    const path = new URL(req.url, 'http://localhost').pathname
    if (path === '/api/state') return await handleState(req, res)
    if (path === '/api/version') {
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

const shutDown = () => {
  server.close()
  try {
    database.close()
  } catch {}
  process.exit(0)
}

process.on('SIGINT', shutDown)
process.on('SIGTERM', shutDown)

server.listen(port, host, () => {
  console.log(`\n  TechPrep is running at http://localhost:${port}\n  Progress file: ${databasePath}\n`)
})
