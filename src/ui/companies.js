import { h } from './h.js'
import { companyList, companyById } from '../content/companies.js'

const markSvgs = {
  microsoft: '<svg viewBox="0 0 16 16" width="100%" height="100%"><rect x="2" y="2" width="5.5" height="5.5" fill="#f25022"/><rect x="8.5" y="2" width="5.5" height="5.5" fill="#7fba00"/><rect x="2" y="8.5" width="5.5" height="5.5" fill="#00a4ef"/><rect x="8.5" y="8.5" width="5.5" height="5.5" fill="#ffb900"/></svg>',
  apple: '<svg viewBox="0 0 16 16" width="100%" height="100%"><path fill="currentColor" d="M11.2 8.5c0-1.6 1.3-2.3 1.4-2.4-.8-1.1-1.9-1.3-2.3-1.3-1-.1-1.9.6-2.4.6-.5 0-1.3-.6-2.1-.5-1.1 0-2.1.6-2.6 1.6-1.1 1.9-.3 4.8.8 6.3.5.8 1.1 1.6 1.9 1.6.8 0 1-.5 2-.5s1.2.5 2 .5 1.3-.8 1.8-1.5c.6-.8.8-1.6.8-1.7 0 0-1.3-.6-1.3-2.2zM9.6 3.8c.4-.5.7-1.2.6-1.8-.6 0-1.3.4-1.7.9-.4.4-.7 1.1-.6 1.8.6 0 1.3-.4 1.7-.9z"/></svg>',
}

export function companyMark(id, size = 18) {
  const company = companyById[id]
  if (!company) return null
  const mark = h('span', {
    class: `co-mark co-${id}`,
    style: { '--co': company.color, width: `${size}px`, height: `${size}px`, fontSize: `${Math.round(size * 0.62)}px` },
    'aria-hidden': 'true',
  })
  if (markSvgs[id]) mark.innerHTML = markSvgs[id]
  else mark.textContent = company.letter
  return mark
}

export function companyChips(companies = [], { size = 'sm', labels = size !== 'xs', max = 6 } = {}) {
  const known = companyList.filter(company => companies.includes(company.id))
  if (!known.length) return null
  const shown = known.slice(0, max)
  const markSize = size === 'lg' ? 20 : size === 'xs' ? 14 : 16
  const row = h('span', { class: `co-chips co-chips-${size}`, title: known.map(company => company.label).join(', ') },
    shown.map(company => h('span', { class: labels ? 'co-chip' : 'co-chip co-chip-bare', style: { '--co': company.color }, title: `Asked at ${company.label}` },
      companyMark(company.id, markSize),
      labels ? h('span', { class: 'co-label' }, company.label) : null)),
    known.length > shown.length ? h('span', { class: 'co-more' }, `+${known.length - shown.length}`) : null)
  return row
}

export function companyFilter({ selected = [], onChange, counts = null } = {}) {
  let current = [...selected]
  const row = h('div', { class: 'co-filter', role: 'group', 'aria-label': 'Filter by company' })

  const render = () => {
    const allButton = h('button', {
      type: 'button',
      class: `chip co-filter-chip${current.length ? '' : ' active'}`,
      'aria-pressed': String(!current.length),
      onclick: () => update([]),
    }, 'All')
    const companyButtons = companyList.map(company => {
      const isOn = current.includes(company.id)
      return h('button', {
        type: 'button',
        class: `chip co-filter-chip${isOn ? ' active co-on' : ''}`,
        style: { '--co': company.color },
        'aria-pressed': String(isOn),
        title: company.label,
        onclick: () => update(isOn ? current.filter(id => id !== company.id) : [...current, company.id]),
      },
      companyMark(company.id, 16),
      h('span', { class: 'co-label' }, company.label),
      counts && counts[company.id] != null ? h('span', { class: 'co-count' }, String(counts[company.id])) : null)
    })
    row.replaceChildren(allButton, ...companyButtons)
  }

  const update = next => {
    current = next
    render()
    if (onChange) onChange([...current])
  }

  render()
  row.setSelected = next => {
    current = [...next]
    render()
  }
  return row
}
