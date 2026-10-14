import { h } from '../ui/h.js'
import { traces, traceById, topics } from '../content/index.js'
import { skills } from '../content/skills.js'
import { mountStepper } from '../viz/stepper.js'

const galleryIds = new Set(['', 'all', 'gallery', 'index'])

const decode = value => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

const topicMeta = id => {
  const topic = topics.find(item => item.id === id)
  if (topic) return { title: topic.title, icon: topic.icon || '•' }
  if (String(id).startsWith('google')) return { title: 'Problem bank', icon: '🔎' }
  return { title: id || 'Other', icon: '•' }
}

const skillLabel = id => skills[id]?.label || id

export default function render(container, params = {}) {
  const id = decode(params.id || '')
  const trace = traceById[id]
  if (trace) return renderTrace(container, trace)
  return renderGallery(container, galleryIds.has(id) ? '' : id)
}

function renderTrace(container, trace) {
  const siblings = traces.filter(item => item.topic === trace.topic)
  const position = siblings.findIndex(item => item.id === trace.id)
  const previous = siblings[position - 1]
  const next = siblings[position + 1]
  const query = new URLSearchParams(location.hash.split('?')[1] || '')
  const inputIndex = Number(query.get('input')) || 0
  const host = h('div', { class: 'trace-host' })
  const page = h('div', { class: 'page trace-page' },
    h('div', { class: 'trace-nav' },
      h('a', { class: 'btn btn-ghost btn-sm', href: '#/trace/all' }, '← Traces'),
      h('span', { class: 'trace-crumb muted small' }, `${topicMeta(trace.topic).icon} ${topicMeta(trace.topic).title}`)),
    host,
    siblings.length > 1 ? h('div', { class: 'trace-pager' },
      previous ? h('a', { class: 'btn btn-sm', href: `#/trace/${previous.id}` }, `← ${previous.title}`) : h('span'),
      next ? h('a', { class: 'btn btn-sm', href: `#/trace/${next.id}` }, `${next.title} →`) : h('span')) : null)
  container.replaceChildren(page)
  const destroy = mountStepper(host, trace, { inputIndex })
  return () => destroy()
}

function renderGallery(container, missingId) {
  const search = h('input', { class: 'trace-search', type: 'search', placeholder: 'Search traces, skills, topics…', autofocus: true })
  const results = h('div', { class: 'trace-groups' })
  const count = h('span', { class: 'muted small' })
  const page = h('div', { class: 'page trace-gallery' },
    h('div', { class: 'page-header trace-gallery-head' },
      h('div', null, h('h1', null, 'Traces'), h('p', { class: 'muted' }, 'Step through code. Watch the data move.')),
      count),
    missingId ? h('div', { class: 'card tight trace-missing' }, `No trace “${missingId}”. Pick one below.`) : null,
    search,
    results)
  container.replaceChildren(page)

  const order = [...topics.map(topic => topic.id)]
  for (const trace of traces) if (!order.includes(trace.topic)) order.push(trace.topic)

  const draw = () => {
    const terms = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean)
    const matches = traces.filter(trace => {
      const haystack = [trace.title, trace.problem, trace.id, topicMeta(trace.topic).title, ...(trace.skills || []).map(skillLabel), ...(trace.skills || []), trace.complexity?.time]
        .join(' ').toLowerCase()
      return terms.every(term => haystack.includes(term))
    })
    count.textContent = `${matches.length} trace${matches.length === 1 ? '' : 's'}`
    if (!traces.length) {
      results.replaceChildren(h('div', { class: 'card empty' }, h('div', { class: 'empty-icon' }, '🧪'), h('p', { class: 'muted' }, 'No traces yet.')))
      return
    }
    if (!matches.length) {
      results.replaceChildren(h('div', { class: 'card empty' }, h('div', { class: 'empty-icon' }, '🔍'), h('p', { class: 'muted' }, 'Nothing matches.')))
      return
    }
    results.replaceChildren(...order.map(topicId => {
      const group = matches.filter(trace => trace.topic === topicId)
      if (!group.length) return null
      const meta = topicMeta(topicId)
      return h('section', { class: 'trace-group' },
        h('h3', { class: 'section-title' }, `${meta.icon} ${meta.title}`, h('span', { class: 'muted small' }, ` ${group.length}`)),
        h('div', { class: 'trace-cards' }, group.map(traceCard)))
    }).filter(Boolean))
  }

  search.addEventListener('input', draw)
  draw()
  setTimeout(() => search.focus(), 0)
}

function traceCard(trace) {
  return h('a', { class: 'card card-hover trace-card', href: `#/trace/${trace.id}` },
    h('div', { class: 'trace-card-top' },
      h('strong', null, trace.title || trace.id),
      trace.complexity?.time ? h('span', { class: 'pill pill-amber mono' }, trace.complexity.time) : null),
    trace.problem ? h('p', { class: 'muted small trace-card-problem' }, trace.problem) : null,
    h('div', { class: 'trace-card-skills' }, (trace.skills || []).slice(0, 3).map(id => h('span', { class: 'trace-skill' }, skillLabel(id)))))
}
