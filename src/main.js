import { initStore } from './store.js'
import { route, setNotFound, startRouter } from './router.js'
import { mountShell } from './ui/shell.js'
import { h } from './ui/h.js'

const lazyPage = loader => async (container, params) => {
  let mod
  try {
    mod = await loader()
  } catch (error) {
    console.error(error)
    container.replaceChildren(h('div', { class: 'page' },
      h('div', { class: 'card empty' },
        h('div', { class: 'empty-icon' }, '🚧'),
        h('h3', null, 'This section is still being built'),
        h('p', { class: 'muted' }, String(error?.message || error)),
        h('a', { class: 'btn', href: '#/' }, 'Dashboard'))))
    return null
  }
  return mod.default(container, params)
}

const pages = {
  dashboard: lazyPage(() => import('./pages/dashboard.js')),
  plan: lazyPage(() => import('./pages/plan.js')),
  learn: lazyPage(() => import('./pages/learn.js')),
  trace: lazyPage(() => import('./pages/trace.js')),
  drill: lazyPage(() => import('./pages/drill.js')),
  flashcards: lazyPage(() => import('./pages/flashcards.js')),
  problems: lazyPage(() => import('./pages/problems.js')),
  games: lazyPage(() => import('./pages/games.js')),
  mock: lazyPage(() => import('./pages/mock.js')),
  handbook: lazyPage(() => import('./pages/handbook.js')),
}

route('#/', pages.dashboard)
route('#/plan', pages.plan)
route('#/learn', pages.learn)
route('#/learn/:topic', pages.learn)
route('#/trace', pages.trace)
route('#/trace/:id', pages.trace)
route('#/drill', pages.drill)
route('#/drill/:skill', pages.drill)
route('#/flashcards', pages.flashcards)
route('#/problems', pages.problems)
route('#/problems/:id', pages.problems)
route('#/games', pages.games)
route('#/games/:id', pages.games)
route('#/mock', pages.mock)
route('#/handbook', pages.handbook)
route('#/handbook/:id', pages.handbook)

setNotFound(container => {
  container.replaceChildren(h('div', { class: 'page' },
    h('div', { class: 'card empty' },
      h('div', { class: 'empty-icon' }, '🧭'),
      h('h3', null, 'Nothing here'),
      h('a', { class: 'btn btn-primary', href: '#/' }, 'Go to dashboard'))))
})

const boot = async () => {
  try {
    await initStore()
  } catch (error) {
    console.error('store init failed', error)
  }
  const view = mountShell(document.getElementById('app'))
  startRouter(view)
}

boot()
