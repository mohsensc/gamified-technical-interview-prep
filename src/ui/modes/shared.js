import { h } from '../h.js'
import { toggleBookmark, isBookmarked } from '../../store.js'
import { rich } from '../rich.js'

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
  }, '★')
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
