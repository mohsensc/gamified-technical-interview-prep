import { h, toast } from '../ui/h.js'
import { exportState, importState, resetState, getState, getSetting, setSetting, subscribe } from '../store.js'

const answeredCount = () => Object.values(getState().items).filter(item => item.attempts > 0).length

const downloadProgress = () => {
  const blob = new Blob([JSON.stringify(exportState())], { type: 'application/json' })
  const link = h('a', { href: URL.createObjectURL(blob), download: `techprep-progress-${new Date().toISOString().slice(0, 10)}.json` })
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(link.href), 2000)
}

const pickProgressFile = onDone => {
  const input = h('input', { type: 'file', accept: 'application/json,.json', style: 'display:none', onchange: async () => {
    const file = input.files?.[0]
    input.remove()
    if (!file) return
    try {
      const parsed = JSON.parse(await file.text())
      if (importState(parsed)) {
        toast('Progress imported', 'good')
        onDone()
      } else toast('That file is not a progress export', 'bad')
    } catch {
      toast('Could not read that file', 'bad')
    }
  } })
  document.body.appendChild(input)
  input.click()
}

export default function render(container) {
  const summary = h('p', { class: 'muted small' })
  const paintSummary = () => {
    summary.textContent = `${answeredCount()} questions answered, ${getState().xp} XP.`
  }
  paintSummary()

  const themeToggle = h('button', { class: 'btn btn-sm', type: 'button', onclick: () => {
    setSetting('theme', getSetting('theme', 'light') === 'dark' ? 'light' : 'dark')
  } })
  const paintTheme = () => {
    themeToggle.textContent = getSetting('theme', 'light') === 'dark' ? 'Switch to light' : 'Switch to dark'
  }
  paintTheme()
  const stopThemeWatch = subscribe(paintTheme)

  container.replaceChildren(h('div', { class: 'page settings-page' },
    h('section', { class: 'card settings-section' },
      h('div', { class: 'section-title' }, 'Appearance'),
      h('div', { class: 'row row-wrap' }, themeToggle)),
    h('section', { class: 'card settings-section' },
      h('div', { class: 'section-title' }, 'Your progress'),
      summary,
      h('p', { class: 'muted small' }, 'Saved on this computer in data/techprep.db.'),
      h('div', { class: 'row row-wrap' },
        h('button', { class: 'btn btn-sm', onclick: downloadProgress }, 'Export'),
        h('button', { class: 'btn btn-sm', onclick: () => pickProgressFile(paintSummary) }, 'Import'),
        h('button', { class: 'btn btn-sm btn-ghost settings-danger', onclick: () => {
          if (confirm('Erase all progress? This cannot be undone.')) {
            resetState()
            paintSummary()
            toast('Progress reset')
          }
        } }, 'Reset')))))

  return stopThemeWatch
}
