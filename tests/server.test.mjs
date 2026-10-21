import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import http from 'node:http'

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)))
const tempDir = mkdtempSync(join(tmpdir(), 'techprep-test-'))
const databasePath = join(tempDir, 'test.db')
const port = 5400 + Math.floor(Math.random() * 400)
const baseUrl = `http://127.0.0.1:${port}`
let serverProcess = null

const startServer = () => new Promise((resolve, reject) => {
  serverProcess = spawn(process.execPath, ['server.js'], {
    cwd: rootDir,
    env: { ...process.env, PORT: String(port), DB_PATH: databasePath },
    stdio: ['ignore', 'pipe', 'inherit'],
  })
  serverProcess.once('error', reject)
  serverProcess.stdout.on('data', chunk => {
    if (String(chunk).includes('running at')) resolve()
  })
})

const stopServer = () => new Promise(resolve => {
  if (!serverProcess) return resolve()
  serverProcess.once('exit', resolve)
  serverProcess.kill('SIGTERM')
  serverProcess = null
})

const request = (method, path, { body, headers = {} } = {}) => new Promise((resolve, reject) => {
  const req = http.request(`${baseUrl}${path}`, { method, headers: { 'Content-Type': 'application/json', ...headers } }, res => {
    const chunks = []
    res.on('data', chunk => chunks.push(chunk))
    res.on('end', () => {
      const text = Buffer.concat(chunks).toString('utf8')
      let json = null
      try {
        json = JSON.parse(text)
      } catch {}
      resolve({ status: res.statusCode, text, json })
    })
  })
  req.on('error', reject)
  if (body !== undefined) req.write(typeof body === 'string' ? body : JSON.stringify(body))
  req.end()
})

const sampleProgress = () => ({
  version: 1,
  xp: 120,
  items: { 'mcq-1': { attempts: 2, correct: 1, box: 1 } },
  events: [{ ts: 1, type: 'answer', itemId: 'mcq-1', correct: true }],
  settings: { theme: 'dark' },
  notes: { 'two-sum': 'use a hashmap' },
})

before(startServer)
after(async () => {
  await stopServer()
  rmSync(tempDir, { recursive: true, force: true })
})

test('a fresh database has no progress', async () => {
  const { status, json } = await request('GET', '/api/state')
  assert.equal(status, 200)
  assert.equal(json.state, null)
})

test('saved progress loads back unchanged', async () => {
  const saved = await request('PUT', '/api/state', { body: sampleProgress() })
  assert.equal(saved.status, 200)
  const loaded = await request('GET', '/api/state')
  assert.deepEqual(loaded.json.state, sampleProgress())
})

test('saving again replaces sections and drops removed ones', async () => {
  const next = { ...sampleProgress(), xp: 300 }
  delete next.notes
  await request('PUT', '/api/state', { body: next })
  const loaded = await request('GET', '/api/state')
  assert.equal(loaded.json.state.xp, 300)
  assert.equal('notes' in loaded.json.state, false)
})

test('progress survives a server restart', async () => {
  await stopServer()
  await startServer()
  const loaded = await request('GET', '/api/state')
  assert.equal(loaded.json.state.xp, 300)
  assert.equal(loaded.json.state.items['mcq-1'].attempts, 2)
})

test('import replaces everything with the uploaded export', async () => {
  const exported = { ...sampleProgress(), xp: 5, items: {} }
  await request('PUT', '/api/state', { body: exported })
  const loaded = await request('GET', '/api/state')
  assert.deepEqual(loaded.json.state, exported)
})

test('reset clears all progress', async () => {
  const reset = await request('DELETE', '/api/state')
  assert.equal(reset.status, 200)
  const loaded = await request('GET', '/api/state')
  assert.equal(loaded.json.state, null)
})

test('bad bodies are rejected', async () => {
  assert.equal((await request('PUT', '/api/state', { body: '[1,2]' })).status, 400)
  assert.equal((await request('PUT', '/api/state', { body: 'not json' })).status, 400)
})

test('requests from other sites or hostnames are refused', async () => {
  const otherOrigin = await request('PUT', '/api/state', { body: sampleProgress(), headers: { Origin: 'https://example.org' } })
  assert.equal(otherOrigin.status, 403)
  const otherHost = await request('GET', '/api/state', { headers: { Host: 'evil.test' } })
  assert.equal(otherHost.status, 403)
})

test('the app and its files are served, private folders are not', async () => {
  const home = await request('GET', '/')
  assert.equal(home.status, 200)
  assert.match(home.text, /TechPrep/)
  assert.equal((await request('GET', '/src/main.js')).status, 200)
  assert.equal((await request('GET', '/server.js')).status, 403)
  assert.equal((await request('GET', '/data/techprep.db')).status, 403)
})

test('earlier state.json files are imported once into an empty database', async () => {
  await stopServer()
  const legacyDir = mkdtempSync(join(tmpdir(), 'techprep-legacy-'))
  writeFileSync(join(legacyDir, 'state.json'), JSON.stringify(sampleProgress()))
  const legacyDatabase = join(legacyDir, 'legacy.db')
  const legacyPort = port + 500
  const child = spawn(process.execPath, ['server.js'], {
    cwd: rootDir,
    env: { ...process.env, PORT: String(legacyPort), DB_PATH: legacyDatabase },
    stdio: ['ignore', 'pipe', 'inherit'],
  })
  await new Promise(resolve => child.stdout.on('data', chunk => String(chunk).includes('running at') && resolve()))
  const response = await fetch(`http://127.0.0.1:${legacyPort}/api/state`)
  const { state } = await response.json()
  assert.equal(state.xp, 120)
  assert.equal(state.notes['two-sum'], 'use a hashmap')
  await new Promise(resolve => {
    child.once('exit', resolve)
    child.kill('SIGTERM')
  })
  rmSync(legacyDir, { recursive: true, force: true })
  await startServer()
})
