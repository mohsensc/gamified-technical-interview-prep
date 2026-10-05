import { h } from './h.js'

export function breadcrumb(trail = []) {
  return h('nav', { class: 'crumb', 'aria-label': 'Breadcrumb' },
    trail.map((node, i) => [
      i > 0 ? h('span', { class: 'crumb-sep' }, '›') : null,
      i === trail.length - 1
        ? h('span', { class: 'crumb-current' }, node.title)
        : h('a', { class: 'crumb-link', href: node.href }, node.title),
    ]))
}

export default breadcrumb
