const routes = []
let notFound = null
let cleanup = null
let containerEl = null
let renderToken = 0
const navListeners = new Set()

const compile = pattern => {
  const keys = []
  const source = pattern
    .replace(/^#/, '')
    .replace(/\/$/, '')
    .split('/')
    .map(part => {
      if (part.startsWith(':')) {
        keys.push(part.slice(1))
        return '([^/]+)'
      }
      return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    })
    .join('/')
  return { regex: new RegExp(`^${source || '/'}/?$`), keys }
}

export function route(pattern, render) {
  routes.push({ pattern, render, ...compile(pattern) })
}

export function setNotFound(render) {
  notFound = render
}

export function currentPath() {
  const raw = location.hash.replace(/^#/, '').split('?')[0]
  return raw || '/'
}

export function currentQuery() {
  const query = location.hash.split('?')[1] || ''
  return Object.fromEntries(new URLSearchParams(query))
}

export function navigate(path) {
  const target = path.startsWith('#') ? path : `#${path}`
  if (location.hash === target) resolve()
  else location.hash = target
}

export function onNavigate(fn) {
  navListeners.add(fn)
  return () => navListeners.delete(fn)
}

const match = path => {
  for (const entry of routes) {
    const found = path.match(entry.regex)
    if (found) {
      const params = {}
      entry.keys.forEach((key, i) => {
        try {
          params[key] = decodeURIComponent(found[i + 1])
        } catch {
          params[key] = found[i + 1]
        }
      })
      return { entry, params }
    }
  }
  return null
}

export async function resolve() {
  if (!containerEl) return
  const token = ++renderToken
  const path = currentPath()
  if (typeof cleanup === 'function') {
    try {
      cleanup()
    } catch (error) {
      console.error(error)
    }
  }
  cleanup = null
  const found = match(path)
  for (const listener of navListeners) {
    try {
      listener(path, found?.entry.pattern)
    } catch {}
  }
  const params = { ...(found?.params || {}), query: currentQuery() }
  const render = found ? found.entry.render : notFound
  if (!render) return
  const stage = document.createElement('div')
  stage.className = 'route-stage'
  containerEl.replaceChildren(stage)
  containerEl.scrollTop = 0
  window.scrollTo(0, 0)
  try {
    const result = await render(stage, params)
    if (token !== renderToken) {
      stage.remove()
      if (typeof result === 'function') result()
      return
    }
    cleanup = typeof result === 'function' ? result : null
  } catch (error) {
    console.error(error)
    if (token !== renderToken) return
    stage.replaceChildren()
    const box = document.createElement('div')
    box.className = 'page'
    box.innerHTML = `<div class="card empty"><div class="empty-icon">⚠️</div><h3>This page hit an error</h3><p class="muted"></p><a class="btn" href="#/">Back to dashboard</a></div>`
    box.querySelector('p').textContent = String(error?.message || error)
    stage.appendChild(box)
  }
}

export function startRouter(container) {
  containerEl = container
  window.addEventListener('hashchange', resolve)
  if (!location.hash) {
    location.replace('#/')
    return
  }
  resolve()
}
