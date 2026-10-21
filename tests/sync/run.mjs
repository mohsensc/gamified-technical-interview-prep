import { chromium } from 'playwright-core'
import { existsSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { startServer, createLocalBackend, createSupabaseBackend, resetGuestServerState, baseUrl, password } from './backends.mjs'

const only = process.env.SYNC_ONLY
const results = []
let emailCounter = 0
const newEmail = () => `user${Date.now()}${emailCounter++}@example.com`
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

const findBrowser = () => {
  const root = join(homedir(), 'Library', 'Caches', 'ms-playwright')
  const linuxRoot = join(homedir(), '.cache', 'ms-playwright')
  for (const dir of [root, linuxRoot]) {
    if (!existsSync(dir)) continue
    for (const name of readdirSync(dir).filter(entry => entry.startsWith('chromium-')).sort().reverse()) {
      for (const sub of ['chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing', 'chrome-mac/Chromium.app/Contents/MacOS/Chromium', 'chrome-linux/chrome', 'chrome-linux64/chrome']) {
        const path = join(dir, name, sub)
        if (existsSync(path)) return { executablePath: path }
      }
    }
  }
  return { channel: 'chrome' }
}

const launchBrowser = async () => {
  try {
    return await chromium.launch({ headless: true })
  } catch {
    return chromium.launch({ headless: true, ...findBrowser() })
  }
}

const poll = async (read, predicate, ms = 6000) => {
  const end = Date.now() + ms
  let value = await read()
  while (!predicate(value) && Date.now() < end) {
    await wait(100)
    value = await read()
  }
  return value
}

const itemIds = state => Object.entries(state?.items || {}).filter(([, item]) => item.attempts > 0).map(([id]) => id).sort()
const bookmarkIds = state => Object.keys(state?.bookmarks || {}).sort()
const same = (actual, expected) => JSON.stringify(actual) === JSON.stringify(expected)

const createWorld = async (browser, backend) => {
  const contexts = []
  const world = {
    async newDevice({ clockOffsetMs = 0 } = {}) {
      const context = await browser.newContext()
      const control = { offline: false, clockOffsetMs }
      await backend.prepareContext(context, control)
      await context.addInitScript(offset => {
        const realNow = Date.now.bind(Date)
        Date.now = () => realNow() + offset
      }, clockOffsetMs)
      contexts.push(context)
      return { context, control }
    },
    async openPage(device) {
      const page = await device.context.newPage()
      page.on('pageerror', error => console.error('    pageerror', error.message))
      await page.goto(`${baseUrl}/robots.txt`)
      await page.evaluate(async config => {
        const store = await import('/src/store.js')
        const auth = await import('/src/auth/index.js')
        const { config: appConfig } = await import('/src/config.js')
        if (config) Object.assign(appConfig, config)
        window.t = { store, auth }
        await store.initStore()
        await store.whenAccountReady()
      }, backend.pageConfig)
      return page
    },
    async close() {
      for (const context of contexts) await context.close().catch(() => {})
    },
  }
  return world
}

const answer = (page, itemId) => page.evaluate(id => t.store.recordAnswer({ itemId: id, kind: 'quiz', skills: ['skill-a'], correct: true, ms: 1000 }), itemId)
const addBookmark = (page, itemId) => page.evaluate(id => t.store.toggleBookmark(id), itemId)
const syncNow = page => page.evaluate(() => t.store.syncNow())
const flushPage = page => page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
const localState = page => page.evaluate(() => JSON.parse(JSON.stringify(t.store.getState())))
const status = page => page.evaluate(() => t.store.getSyncStatus())
const storedGuest = page => page.evaluate(() => {
  const text = localStorage.getItem('techprep-state')
  return text ? JSON.parse(text) : null
})
const storedUser = (page, userId) => page.evaluate(id => {
  const text = localStorage.getItem(`techprep-state:${id}`)
  return text ? JSON.parse(text) : null
}, userId)
const activeUser = page => page.evaluate(() => t.store.getActiveUserId())
const signUp = (page, email) => page.evaluate(async ([address, secret]) => {
  await t.auth.signUpWithEmail(address, secret, 'Tester')
  await t.store.whenAccountReady()
}, [email, password])
const signIn = (page, email) => page.evaluate(async ([address, secret]) => {
  await t.auth.signInWithEmail(address, secret)
  await t.store.whenAccountReady()
}, [email, password])
const signOutUser = page => page.evaluate(() => t.store.signOutUser())
const rawAuthSignOut = page => page.evaluate(() => t.auth.signOut())
const remoteIds = (backend, email, predicate = () => true) => poll(async () => itemIds(await backend.remoteState(email)), predicate)

const scenarios = [
  {
    name: 'guest progress then sign up',
    async run({ world, backend, expect }) {
      const device = await world.newDevice()
      const page = await world.openPage(device)
      await answer(page, 'g1')
      await answer(page, 'g2')
      await addBookmark(page, 'gb')
      const email = newEmail()
      await signUp(page, email)
      expect('state keeps guest items', itemIds(await localState(page)), ['g1', 'g2'])
      expect('state keeps guest bookmark', bookmarkIds(await localState(page)), ['gb'])
      expect('remote receives guest items', await remoteIds(backend, email, ids => ids.length === 2), ['g1', 'g2'])
      expect('guest storage emptied after claim', itemIds(await storedGuest(page)), [])
      const reopened = await world.openPage(device)
      expect('reopen keeps items', itemIds(await localState(reopened)), ['g1', 'g2'])
    },
  },
  {
    name: 'guest progress then sign into existing account (new browser)',
    async run({ world, backend, expect }) {
      const email = newEmail()
      const first = await world.newDevice()
      const firstPage = await world.openPage(first)
      await signUp(firstPage, email)
      await answer(firstPage, 'a1')
      await answer(firstPage, 'a2')
      await syncNow(firstPage)
      const second = await world.newDevice()
      const page = await world.openPage(second)
      await answer(page, 'g1')
      await signIn(page, email)
      expect('state is union', itemIds(await localState(page)), ['a1', 'a2', 'g1'])
      expect('remote is union', await remoteIds(backend, email, ids => ids.length === 3), ['a1', 'a2', 'g1'])
    },
  },
  {
    name: 'guest has only a bookmark and signs into account with progress',
    async run({ world, backend, expect }) {
      const email = newEmail()
      const first = await world.newDevice()
      const firstPage = await world.openPage(first)
      await signUp(firstPage, email)
      await answer(firstPage, 'a1')
      await syncNow(firstPage)
      const second = await world.newDevice()
      const page = await world.openPage(second)
      await addBookmark(page, 'only-bookmark')
      await page.evaluate(() => t.store.recordGameScore('game-x', 42))
      await signIn(page, email)
      const state = await localState(page)
      expect('account items kept', itemIds(state), ['a1'])
      expect('guest bookmark kept', bookmarkIds(state), ['only-bookmark'])
      expect('guest game score kept', state.gameScores['game-x'], 42)
    },
  },
  {
    name: 'guest progress then sign into account cached on this browser, guest clock behind',
    async run({ world, backend, expect }) {
      const email = newEmail()
      const device = await world.newDevice({ clockOffsetMs: 3600e3 })
      const page = await world.openPage(device)
      await signUp(page, email)
      await answer(page, 'a1')
      await syncNow(page)
      await signOutUser(page)
      await page.evaluate(() => { Date.now = ((real) => () => real() - 3600e3)(Date.now) })
      await answer(page, 'g1')
      await signIn(page, email)
      expect('cached account plus guest item', itemIds(await localState(page)), ['a1', 'g1'])
      expect('remote has both', await remoteIds(backend, email, ids => ids.length === 2), ['a1', 'g1'])
    },
  },
  {
    name: 'sign out then back in',
    async run({ world, backend, expect }) {
      const email = newEmail()
      const device = await world.newDevice()
      const page = await world.openPage(device)
      await signUp(page, email)
      await answer(page, 'a1')
      await signOutUser(page)
      expect('guest is empty after sign out', itemIds(await localState(page)), [])
      expect('no active user', await activeUser(page), null)
      await signIn(page, email)
      expect('progress back after sign in', itemIds(await localState(page)), ['a1'])
      expect('remote has it', await remoteIds(backend, email, ids => ids.length === 1), ['a1'])
      expect('guest storage has no account progress', itemIds(await storedGuest(page)), [])
    },
  },
  {
    name: 'account switch: A signs out, B signs in on same browser',
    async run({ world, backend, expect }) {
      const emailA = newEmail()
      const emailB = newEmail()
      const device = await world.newDevice()
      const page = await world.openPage(device)
      await signUp(page, emailA)
      await answer(page, 'a1')
      await answer(page, 'a2')
      await signOutUser(page)
      await signUp(page, emailB)
      expect('B starts without A progress', itemIds(await localState(page)), [])
      await answer(page, 'b1')
      await syncNow(page)
      expect('B remote only b1', await remoteIds(backend, emailB, ids => ids.length === 1), ['b1'])
      expect('A remote only a items', await remoteIds(backend, emailA), ['a1', 'a2'])
      await signOutUser(page)
      await signIn(page, emailA)
      expect('A back without B progress', itemIds(await localState(page)), ['a1', 'a2'])
    },
  },
  {
    name: 'account switch: session dropped right after an answer (pending local write)',
    async run({ world, backend, expect }) {
      const emailA = newEmail()
      const emailB = newEmail()
      const device = await world.newDevice()
      const page = await world.openPage(device)
      await signUp(page, emailA)
      await page.evaluate(async () => {
        t.store.recordAnswer({ itemId: 'late', kind: 'quiz', skills: ['skill-a'], correct: true, ms: 1000 })
        await t.auth.signOut()
        await t.store.whenAccountReady()
      })
      await wait(600)
      expect('guest storage holds no account progress', itemIds(await storedGuest(page)), [])
      expect('guest server holds no account progress', itemIds(await (await fetch(`${baseUrl}/api/state`)).json()), [])
      await signUp(page, emailB)
      expect('B has no leaked progress', itemIds(await localState(page)), [])
      await signIn(page, emailA)
      expect('A keeps late answer', itemIds(await localState(page)), ['late'])
    },
  },
  {
    name: 'two tabs in one browser',
    async run({ world, backend, expect }) {
      const email = newEmail()
      const device = await world.newDevice()
      const tabOne = await world.openPage(device)
      await signUp(tabOne, email)
      const tabTwo = await world.openPage(device)
      await answer(tabOne, 't1')
      await flushPage(tabOne)
      await answer(tabTwo, 't2')
      await syncNow(tabTwo)
      await syncNow(tabOne)
      const remote = await remoteIds(backend, email, ids => ids.length === 2)
      expect('remote has both tabs work', remote, ['t1', 't2'])
      const userId = await activeUser(tabOne)
      await flushPage(tabOne)
      await flushPage(tabTwo)
      expect('localStorage has both', itemIds(await storedUser(tabOne, userId)), ['t1', 't2'])
      expect('tab one sees both', itemIds(await localState(tabOne)), ['t1', 't2'])
    },
  },
  {
    name: 'two guest tabs in one browser',
    async run({ world, expect }) {
      const device = await world.newDevice()
      const tabOne = await world.openPage(device)
      const tabTwo = await world.openPage(device)
      await answer(tabOne, 'x1')
      await flushPage(tabOne)
      await answer(tabTwo, 'x2')
      await flushPage(tabTwo)
      await flushPage(tabOne)
      expect('guest storage has both', itemIds(await storedGuest(tabOne)), ['x1', 'x2'])
    },
  },
  {
    name: 'two devices edit the same account',
    async run({ world, backend, expect }) {
      const email = newEmail()
      const one = await world.newDevice()
      const pageOne = await world.openPage(one)
      await signUp(pageOne, email)
      await answer(pageOne, 'base')
      await syncNow(pageOne)
      const two = await world.newDevice()
      const pageTwo = await world.openPage(two)
      await signIn(pageTwo, email)
      await answer(pageOne, 'd1')
      await syncNow(pageOne)
      await answer(pageTwo, 'd2')
      await syncNow(pageTwo)
      expect('remote has all', await remoteIds(backend, email, ids => ids.length === 3), ['base', 'd1', 'd2'])
      await syncNow(pageOne)
      expect('device one converges', itemIds(await localState(pageOne)), ['base', 'd1', 'd2'])
    },
  },
  {
    name: 'two devices with the second clock one hour behind',
    async run({ world, backend, expect }) {
      const email = newEmail()
      const one = await world.newDevice()
      const pageOne = await world.openPage(one)
      await signUp(pageOne, email)
      await answer(pageOne, 'base')
      await syncNow(pageOne)
      const two = await world.newDevice({ clockOffsetMs: -3600e3 })
      const pageTwo = await world.openPage(two)
      await signIn(pageTwo, email)
      await answer(pageOne, 'fast')
      await syncNow(pageOne)
      await answer(pageTwo, 'slow')
      await syncNow(pageTwo)
      await syncNow(pageOne)
      await answer(pageOne, 'fast2')
      await syncNow(pageOne)
      expect('remote has all', await remoteIds(backend, email, ids => ids.length === 4), ['base', 'fast', 'fast2', 'slow'])
    },
  },
  {
    name: 'save fails offline then reopen online',
    async run({ world, backend, expect }) {
      const email = newEmail()
      const device = await world.newDevice()
      const page = await world.openPage(device)
      await signUp(page, email)
      await answer(page, 'on1')
      await syncNow(page)
      device.control.offline = true
      await answer(page, 'off1')
      await syncNow(page)
      expect('status is error', (await status(page)).status, 'error')
      await page.close()
      device.control.offline = false
      const reopened = await world.openPage(device)
      expect('local cache kept offline work', itemIds(await localState(reopened)), ['off1', 'on1'])
      expect('remote catches up on reopen', await remoteIds(backend, email, ids => ids.length === 2), ['off1', 'on1'])
    },
  },
  {
    name: 'reopen while still offline then online',
    async run({ world, backend, expect }) {
      const email = newEmail()
      const device = await world.newDevice()
      const page = await world.openPage(device)
      await signUp(page, email)
      await answer(page, 'on1')
      await syncNow(page)
      device.control.offline = true
      await answer(page, 'off1')
      await page.close()
      const offlinePage = await world.openPage(device)
      expect('offline reopen keeps work', itemIds(await localState(offlinePage)), ['off1', 'on1'])
      await answer(offlinePage, 'off2')
      await offlinePage.close()
      device.control.offline = false
      const online = await world.openPage(device)
      expect('online reopen has everything', itemIds(await localState(online)), ['off1', 'off2', 'on1'])
      expect('remote has everything', await remoteIds(backend, email, ids => ids.length === 3), ['off1', 'off2', 'on1'])
    },
  },
  {
    name: 'page hide flushes unsaved progress',
    async run({ world, backend, expect }) {
      const email = newEmail()
      const device = await world.newDevice()
      const page = await world.openPage(device)
      await signUp(page, email)
      await answer(page, 'hide1')
      await flushPage(page)
      expect('remote has item without waiting for debounce', await remoteIds(backend, email, ids => ids.length === 1), ['hide1'])
    },
  },
  {
    name: 'page hide on a stale tab does not erase another device',
    async run({ world, backend, expect }) {
      const email = newEmail()
      const one = await world.newDevice()
      const pageOne = await world.openPage(one)
      await signUp(pageOne, email)
      await answer(pageOne, 'base')
      await syncNow(pageOne)
      const two = await world.newDevice()
      const pageTwo = await world.openPage(two)
      await signIn(pageTwo, email)
      await answer(pageOne, 'one')
      await syncNow(pageOne)
      await answer(pageTwo, 'two')
      await flushPage(pageTwo)
      await wait(500)
      await syncNow(pageOne)
      await syncNow(pageTwo)
      expect('remote has all after both sync', await remoteIds(backend, email, ids => ids.length === 3), ['base', 'one', 'two'])
    },
  },
  {
    name: 'concurrent saves and edits during a slow save',
    async run({ world, backend, expect }) {
      const email = newEmail()
      const device = await world.newDevice()
      const page = await world.openPage(device)
      await signUp(page, email)
      await answer(page, 'c1')
      const first = page.evaluate(() => t.store.syncNow())
      await answer(page, 'c2')
      const second = page.evaluate(() => t.store.syncNow())
      await Promise.all([first, second])
      expect('remote has both', await remoteIds(backend, email, ids => ids.length === 2), ['c1', 'c2'])
    },
  },
  {
    name: 'bookmark removal reaches the remote',
    async run({ world, backend, expect }) {
      const email = newEmail()
      const device = await world.newDevice()
      const page = await world.openPage(device)
      await signUp(page, email)
      await answer(page, 'k1')
      await addBookmark(page, 'bm')
      await syncNow(page)
      await addBookmark(page, 'bm')
      await syncNow(page)
      const remote = await poll(() => backend.remoteState(email), state => state && bookmarkIds(state).length === 0)
      expect('bookmark gone remotely', bookmarkIds(remote), [])
      expect('bookmark gone locally', bookmarkIds(await localState(page)), [])
    },
  },
  {
    name: 'reset clears the account remotely',
    async run({ world, backend, expect }) {
      const email = newEmail()
      const device = await world.newDevice()
      const page = await world.openPage(device)
      await signUp(page, email)
      await answer(page, 'r1')
      await syncNow(page)
      await page.evaluate(() => t.store.resetState())
      await wait(300)
      const remote = await poll(() => backend.remoteState(email), state => state && itemIds(state).length === 0)
      expect('remote reset', itemIds(remote), [])
      expect('local reset', itemIds(await localState(page)), [])
    },
  },
]

const runBackend = async (browser, backend, server) => {
  for (const scenario of scenarios) {
    if (only && !scenario.name.includes(only)) continue
    await backend.reset()
    await resetGuestServerState()
    const world = await createWorld(browser, backend)
    const failures = []
    const expect = (label, actual, expected) => {
      if (!same(actual, expected)) failures.push(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
    }
    try {
      await scenario.run({ world, backend, server, expect })
    } catch (error) {
      failures.push(`threw ${error.message.split('\n')[0]}`)
    }
    await world.close()
    results.push({ backend: backend.name, name: scenario.name, failures })
    console.log(`${failures.length ? 'FAIL' : 'pass'}  [${backend.name}] ${scenario.name}`)
    for (const failure of failures) console.log(`        ${failure}`)
  }
}

const main = async () => {
  const server = await startServer()
  const browser = await launchBrowser()
  try {
    await runBackend(browser, createLocalBackend(server), server)
    await runBackend(browser, createSupabaseBackend(), server)
  } finally {
    await browser.close()
    await server.stop()
  }
  const failed = results.filter(result => result.failures.length)
  console.log(`\n${results.length - failed.length}/${results.length} passed`)
  process.exit(failed.length ? 1 : 0)
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
