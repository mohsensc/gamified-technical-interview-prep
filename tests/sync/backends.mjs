import { spawn } from 'node:child_process'
import { mkdtemp, readFile, rm, mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createFakeSupabase, fakeSupabaseHost, fakeSupabaseUrl } from './fakeSupabase.mjs'

const rootDir = dirname(dirname(dirname(fileURLToPath(import.meta.url))))
const cacheDir = join(rootDir, 'tests', 'sync', '.cache')
export const port = Number(process.env.SYNC_TEST_PORT) || 5317
export const baseUrl = `http://127.0.0.1:${port}`
const password = 'password123'

export const startServer = async () => {
  const dataDir = await mkdtemp(join(tmpdir(), 'codecram-sync-'))
  const child = spawn('node', ['server.js'], { cwd: rootDir, env: { ...process.env, PORT: String(port), HOST: '127.0.0.1', DATA_DIR: dataDir }, stdio: ['ignore', 'pipe', 'pipe'] })
  let output = ''
  child.stdout.on('data', chunk => { output += chunk })
  child.stderr.on('data', chunk => { output += chunk })
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      const res = await fetch(`${baseUrl}/api/auth/me`)
      if (res.ok) break
    } catch {}
    if (child.exitCode !== null) throw new Error(`server exited early: ${output}`)
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  return {
    dataDir,
    stop: async () => {
      child.kill()
      await rm(dataDir, { recursive: true, force: true })
    },
  }
}

const readJson = async path => {
  try {
    return JSON.parse(await readFile(path, 'utf8'))
  } catch {
    return null
  }
}

const cachedJsdelivr = async url => {
  const file = join(cacheDir, Buffer.from(url).toString('base64url').slice(-120))
  if (existsSync(file)) return JSON.parse(await readFile(file, 'utf8'))
  const res = await fetch(url)
  const entry = { status: res.status, type: res.headers.get('content-type') || 'application/javascript', body: await res.text() }
  if (res.ok) {
    await mkdir(cacheDir, { recursive: true })
    await writeFile(file, JSON.stringify(entry))
  }
  return entry
}

const storeOverride = process.env.TEST_STORE_SOURCE

const attachCommon = async (context, control) => {
  if (storeOverride) {
    const text = await readFile(storeOverride, 'utf8')
    await context.route('**/src/store.js', route => route.fulfill({ status: 200, contentType: 'text/javascript', body: text }))
  }
  await context.route('**/api/state', route => control.offline ? route.abort('internetdisconnected') : route.continue())
}

export const createLocalBackend = server => ({
  name: 'local server',
  pageConfig: null,
  async prepareContext(context, control) {
    await attachCommon(context, control)
    await context.route('**/api/user-state', route => control.offline ? route.abort('internetdisconnected') : route.continue())
  },
  async remoteState(email) {
    const users = await readJson(join(server.dataDir, 'users.json'))
    const user = users?.users?.find(entry => entry.email === email)
    if (!user) return null
    return readJson(join(server.dataDir, 'users', `${user.id}.json`))
  },
  async reset() {},
})

export const createSupabaseBackend = () => {
  const fake = createFakeSupabase()
  return {
    name: 'supabase (stubbed)',
    pageConfig: { supabaseUrl: fakeSupabaseUrl, supabaseAnonKey: 'anon-test-key' },
    async prepareContext(context, control) {
      await attachCommon(context, control)
      await context.route(`https://${fakeSupabaseHost}/**`, route => fake.handle(route, control))
      await context.route('https://cdn.jsdelivr.net/**', async route => {
        const entry = await cachedJsdelivr(route.request().url())
        await route.fulfill({ status: entry.status, contentType: entry.type, headers: { 'access-control-allow-origin': '*' }, body: entry.body })
      })
    },
    async remoteState(email) {
      return fake.stateForEmail(email)
    },
    async reset() {
      fake.reset()
    },
  }
}

export const resetGuestServerState = () => fetch(`${baseUrl}/api/state`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ version: 1, updatedAt: 0, items: {} }) })

export { password }
