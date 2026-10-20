import { h } from './h.js'
import { getUser, onAuthChange, accountsAvailable } from '../auth/index.js'
import { getSyncStatus, onSyncChange, signOutUser, syncNow } from '../store.js'

const personIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>'

export const userInitial = user => (user?.name || user?.email || '?').trim().charAt(0).toUpperCase() || '?'

const relativeTime = time => {
  const seconds = Math.round((Date.now() - time) / 1000)
  if (seconds < 45) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

export function syncLabel(status = getSyncStatus()) {
  switch (status.status) {
    case 'loading': return { text: 'Syncing', tone: 'busy' }
    case 'pending': return { text: 'Saving soon', tone: 'busy' }
    case 'saving': return { text: 'Saving', tone: 'busy' }
    case 'synced': return { text: status.at ? `Synced ${relativeTime(status.at)}` : 'Synced', tone: 'good' }
    case 'error': return { text: 'Offline, will retry', tone: 'bad' }
    default: return { text: 'Saved on this device', tone: 'idle' }
  }
}

export function syncBadge() {
  const dot = h('i', { class: 'sync-dot' })
  const text = h('span')
  const badge = h('span', { class: 'sync-badge' }, dot, text)
  const render = () => {
    const label = syncLabel()
    badge.dataset.tone = label.tone
    text.textContent = label.text
  }
  render()
  const stopSync = onSyncChange(render)
  const timer = setInterval(() => {
    if (!badge.isConnected) {
      stopSync()
      clearInterval(timer)
      return
    }
    render()
  }, 30e3)
  return badge
}

export function accountButton() {
  const root = h('div', { class: 'account-control' })
  let menuOpen = false
  let stopDot = null

  const closeMenu = () => {
    menuOpen = false
    root.classList.remove('open')
    root.querySelector('.account-menu')?.remove()
  }

  const onDocumentClick = event => {
    if (menuOpen && !root.contains(event.target)) closeMenu()
  }

  const onKey = event => {
    if (event.key === 'Escape' && menuOpen) closeMenu()
  }

  const openMenu = user => {
    menuOpen = true
    root.classList.add('open')
    const menu = h('div', { class: 'account-menu', role: 'menu' },
      h('div', { class: 'account-menu-head' },
        h('span', { class: 'account-avatar lg' }, userInitial(user)),
        h('div', { class: 'account-menu-id' },
          h('b', null, user.name || user.email),
          h('span', { class: 'muted small' }, user.email))),
      h('div', { class: 'account-menu-sync' }, syncBadge(),
        h('button', { class: 'btn btn-ghost btn-sm', onclick: () => syncNow() }, 'Sync now')),
      h('a', { class: 'account-menu-item', href: '#/account', role: 'menuitem', onclick: closeMenu }, 'Account'),
      h('button', { class: 'account-menu-item', role: 'menuitem', onclick: async () => {
        closeMenu()
        await signOutUser()
        location.hash = '#/'
      } }, 'Sign out'))
    root.appendChild(menu)
  }

  const render = () => {
    closeMenu()
    stopDot?.()
    stopDot = null
    const user = getUser()
    if (user) {
      const avatar = h('button', { class: 'account-avatar', title: user.email, 'aria-haspopup': 'menu', onclick: event => {
        event.stopPropagation()
        if (menuOpen) closeMenu()
        else openMenu(user)
      } }, userInitial(user))
      const dot = h('i', { class: 'account-sync-dot' })
      const paintDot = () => {
        dot.dataset.tone = syncLabel().tone
      }
      paintDot()
      stopDot = onSyncChange(paintDot)
      root.replaceChildren(avatar, dot)
      return
    }
    if (accountsAvailable()) {
      const signIn = h('a', { class: 'btn btn-ghost btn-sm account-signin', href: '#/login' }, 'Sign in')
      const syncSignIn = () => {
        signIn.style.display = /^#\/(login|account)/.test(location.hash) ? 'none' : ''
      }
      syncSignIn()
      window.addEventListener('hashchange', syncSignIn)
      root.replaceChildren(signIn)
      return
    }
    const guestLink = h('a', { class: 'btn-icon account-guest', href: '#/account', title: 'Guest' })
    guestLink.innerHTML = personIcon
    root.replaceChildren(guestLink)
  }

  render()
  onAuthChange(render)
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKey)
  return root
}
