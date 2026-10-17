import { h } from '../h.js'
import { icon } from '../icons.js'
import { toggleBookmark, isBookmarked } from '../../store.js'
import { rich } from '../rich.js'
import { companyChips } from '../companies.js'
import { companiesFor } from '../../content/companies.js'

export function bookmarkButton(itemId) {
  if (!itemId) return null
  const on = () => { try { return isBookmarked(itemId) } catch { return false } }
  const star = h('button', {
    class: `bookmark-btn${on() ? ' active' : ''}`,
    title: 'Bookmark',
    'aria-label': 'Bookmark',
    onclick: event => {
      event.stopPropagation()
      let active = false
      try { active = toggleBookmark(itemId) } catch {}
      star.classList.toggle('active', active)
    },
  }, icon('star', 16))
  return star
}

export function richText(text) {
  try { return rich(text) } catch { return String(text ?? '').replace(/==([^=]+)==/g, '$1') }
}

export function itemLabel(item) {
  return item?.q || item?.title || item?.front || item?.id || ''
}

export function resultItemId(item) {
  return item?.generatorId || item?.sourceId || item?.id
}

export function statBlock(value, label) {
  return h('div', { class: 'summary-stat' }, h('div', { class: 'summary-value' }, value), h('div', { class: 'summary-label muted' }, label))
}

export function companyBadge(item, options) {
  try { return companyChips(companiesFor(item), options) } catch { return null }
}

export function formatElapsed(ms) {
  const total = Math.max(0, Math.round((ms || 0) / 1000))
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}

const hintText = {
  mcq: '1-4 pick · ↵ next',
  cloze: 'Tab between blanks · ↵ check',
  parsons: 'Click or drag lines · ↵ check',
  card: 'Space flip · 1-4 grade',
  predict: '↵ next step',
}

export function keyHintRow(kind) {
  const text = hintText[kind]
  return text ? h('div', { class: 'key-hints muted small' }, text) : null
}

export function comboMeter(combo) {
  const el = h('span', { class: 'combo' }, combo >= 2 ? `×${combo}` : '')
  el.classList.toggle('hot', combo >= 5)
  return el
}
