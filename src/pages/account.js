import { h, toast } from '../ui/h.js'
import { navigate } from '../router.js'
import { config } from '../config.js'
import {
  getUser, authMode, accountsAvailable, onAuthChange,
  signInWithEmail, signUpWithEmail, signInWithMagicLink, signInWithOAuth,
} from '../auth/index.js'
import { whenAccountReady, signOutUser, syncNow, exportState, importState, resetState, getState } from '../store.js'
import { syncBadge, userInitial } from '../ui/account.js'

const providerIcons = {
  google: '<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.3-4.8 3.3-8z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.8 14.2a6.6 6.6 0 0 1 0-4.3V7.1H2.1a11 11 0 0 0 0 9.9z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4z"/></svg>',
  github: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.4-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5z"/></svg>',
}

const providerNames = { google: 'Google', github: 'GitHub', email: 'Email', local: 'This computer' }

const iconSpan = markup => {
  const span = h('span', { class: 'icon', 'aria-hidden': 'true' })
  span.innerHTML = markup
  return span
}

const brandBlock = (title, subtitle) => h('div', { class: 'auth-brand' },
  h('span', { class: 'brand-mark auth-mark' }, '</>'),
  h('h1', null, title),
  subtitle ? h('p', { class: 'muted' }, subtitle) : null)

const field = (label, input) => h('label', { class: 'auth-field' }, h('span', null, label), input)

const answeredCount = () => Object.values(getState().items).filter(item => item.attempts > 0).length

const downloadProgress = () => {
  const blob = new Blob([JSON.stringify(exportState())], { type: 'application/json' })
  const link = h('a', { href: URL.createObjectURL(blob), download: `codecram-progress-${new Date().toISOString().slice(0, 10)}.json` })
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(link.href), 2000)
}

const pickProgressFile = () => {
  const input = h('input', { type: 'file', accept: 'application/json,.json', style: 'display:none', onchange: async () => {
    const file = input.files?.[0]
    input.remove()
    if (!file) return
    try {
      const parsed = JSON.parse(await file.text())
      if (importState(parsed)) toast('Progress imported', 'good')
      else toast('That file is not a progress export', 'bad')
    } catch {
      toast('Could not read that file', 'bad')
    }
  } })
  document.body.appendChild(input)
  input.click()
}

const dataCard = () => h('section', { class: 'card account-section' },
  h('div', { class: 'section-title' }, 'Your data'),
  h('p', { class: 'muted small' }, `${answeredCount()} questions answered, ${getState().xp} XP.`),
  h('div', { class: 'row row-wrap' },
    h('button', { class: 'btn btn-sm', onclick: downloadProgress }, 'Export'),
    h('button', { class: 'btn btn-sm', onclick: pickProgressFile }, 'Import'),
    h('button', { class: 'btn btn-sm btn-ghost account-danger', onclick: () => {
      if (confirm('Erase all progress for this account on every device?')) {
        resetState()
        toast('Progress reset')
      }
    } }, 'Reset')))

function signedInView(user) {
  return h('div', { class: 'page account-page' },
    h('section', { class: 'card account-profile' },
      h('span', { class: 'account-avatar xl' }, userInitial(user)),
      h('div', { class: 'account-profile-id' },
        h('h2', null, user.name || user.email),
        h('span', { class: 'muted' }, user.email),
        h('span', { class: 'pill pill-teal' }, providerNames[user.provider] || user.provider)),
      h('div', { class: 'account-profile-actions' },
        syncBadge(),
        h('button', { class: 'btn btn-sm', onclick: async () => {
          await syncNow()
          toast('Synced', 'good')
        } }, 'Sync now'),
        h('button', { class: 'btn btn-sm btn-ghost', onclick: async () => {
          await signOutUser()
          navigate('#/')
        } }, 'Sign out'))),
    dataCard())
}

function unavailableView() {
  return h('div', { class: 'page account-page' },
    h('section', { class: 'card auth-card' },
      brandBlock('Playing as guest', 'Accounts are off on this site. Everything you do is saved in this browser.'),
      h('a', { class: 'btn btn-primary auth-submit', href: '#/' }, 'Keep learning')),
    dataCard())
}

function signInView(startMode) {
  const supabaseMode = authMode() === 'supabase'
  let formMode = startMode
  const status = h('p', { class: 'auth-status', role: 'status' })
  const nameInput = h('input', { type: 'text', autocomplete: 'name', placeholder: 'Ada Lovelace', maxlength: '60' })
  const emailInput = h('input', { type: 'email', autocomplete: 'email', placeholder: 'you@example.com', required: true })
  const passwordInput = h('input', { type: 'password', autocomplete: 'current-password', placeholder: '8+ characters', minlength: '8', required: true })
  const nameField = field('Name', nameInput)
  const submitButton = h('button', { class: 'btn btn-primary auth-submit', type: 'submit' })
  const tabs = h('div', { class: 'auth-tabs', role: 'tablist' })

  const setStatus = (message, tone = 'bad') => {
    status.textContent = message || ''
    status.dataset.tone = tone
  }

  const setBusy = busy => {
    for (const control of card.querySelectorAll('button, input')) control.disabled = busy
  }

  const paint = () => {
    const signUp = formMode === 'signup'
    nameField.style.display = signUp ? '' : 'none'
    passwordInput.autocomplete = signUp ? 'new-password' : 'current-password'
    submitButton.textContent = signUp ? 'Create account' : 'Sign in'
    tabs.replaceChildren(
      h('button', { type: 'button', class: ['auth-tab', !signUp && 'active'], onclick: () => switchMode('signin') }, 'Sign in'),
      h('button', { type: 'button', class: ['auth-tab', signUp && 'active'], onclick: () => switchMode('signup') }, 'Create account'))
    setStatus('')
  }

  const switchMode = next => {
    formMode = next
    paint()
  }

  const finish = async result => {
    if (result?.pendingConfirmation) {
      setStatus('Check your inbox to confirm your email, then sign in.', 'good')
      return
    }
    setStatus('Syncing your progress', 'good')
    await whenAccountReady()
    toast(`Signed in as ${getUser()?.name || getUser()?.email || 'you'}`, 'good')
    navigate('#/')
  }

  const run = async task => {
    setBusy(true)
    setStatus('')
    try {
      await task()
    } catch (error) {
      setStatus(String(error?.message || error))
    } finally {
      if (card.isConnected) setBusy(false)
    }
  }

  const form = h('form', { class: 'auth-form', onsubmit: event => {
    event.preventDefault()
    run(async () => {
      const result = formMode === 'signup'
        ? await signUpWithEmail(emailInput.value, passwordInput.value, nameInput.value)
        : await signInWithEmail(emailInput.value, passwordInput.value)
      await finish(result)
    })
  } },
    nameField,
    field('Email', emailInput),
    field('Password', passwordInput),
    submitButton)

  const oauthBlock = supabaseMode ? h('div', { class: 'auth-oauth' },
    ...config.oauthProviders.map(provider => h('button', { type: 'button', class: 'btn auth-provider', onclick: () => run(async () => {
      await signInWithOAuth(provider)
      setStatus('Redirecting', 'good')
    }) }, iconSpan(providerIcons[provider] || ''), `Continue with ${providerNames[provider] || provider}`)),
    h('div', { class: 'auth-divider' }, h('span', null, 'or'))) : null

  const magicLink = supabaseMode ? h('button', { type: 'button', class: 'btn btn-ghost btn-sm auth-magic', onclick: () => run(async () => {
    if (!emailInput.value.trim()) {
      emailInput.focus()
      throw new Error('Enter your email first')
    }
    await signInWithMagicLink(emailInput.value)
    setStatus('Magic link sent. Open it on this device.', 'good')
  }) }, 'Email me a sign-in link instead') : null

  const card = h('section', { class: 'card auth-card' },
    brandBlock('CodeCram', 'Free coding interview prep. Sign in to keep your progress on every device.'),
    oauthBlock,
    tabs,
    form,
    magicLink,
    status,
    h('a', { class: 'auth-guest', href: '#/' }, 'Continue as guest'),
    authMode() === 'local' ? h('p', { class: 'muted small auth-note' }, 'Local account, stored on this computer.') : null)

  paint()
  return h('div', { class: 'page account-page auth-page' }, card)
}

export default function render(container) {
  const isLogin = location.hash.startsWith('#/login')
  const draw = () => {
    const user = getUser()
    if (user && isLogin) {
      navigate('#/account')
      return
    }
    if (user) container.replaceChildren(signedInView(user))
    else if (!accountsAvailable()) container.replaceChildren(unavailableView())
    else container.replaceChildren(signInView(new URLSearchParams(location.hash.split('?')[1] || '').get('mode') === 'signup' ? 'signup' : 'signin'))
  }
  draw()
  const stop = onAuthChange(() => {
    if (!isLogin) draw()
  })
  return () => stop()
}
