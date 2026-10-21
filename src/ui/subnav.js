import { h } from './h.js'

export const subnavGroups = {
  learn: [
    { id: 'learn', label: 'Lessons', href: '#/learn' },
    { id: 'algorithms', label: 'Algorithms', href: '#/algorithms' },
    { id: 'problems', label: 'Problems', href: '#/problems' },
    { id: 'read', label: 'Read', href: '#/read' },
  ],
  cheatsheet: [
    { id: 'cheatsheet', label: 'Sheets', href: '#/cheatsheet' },
    { id: 'glossary', label: 'Glossary', href: '#/glossary' },
  ],
  handbook: [
    { id: 'handbook', label: 'Guides', href: '#/handbook' },
    { id: 'plan', label: 'Study plan', href: '#/plan' },
    { id: 'dayof', label: 'Interview day', href: '#/dayof' },
  ],
  practice: [
    { id: 'practice', label: 'Modes', href: '#/practice' },
    { id: 'flashcards', label: 'Flashcards', href: '#/flashcards' },
    { id: 'mock', label: 'Mock interview', href: '#/mock' },
  ],
}

export function subnav(groupId, activeId) {
  const tabs = subnavGroups[groupId] || []
  return h('nav', { class: 'subnav', 'aria-label': 'Section' },
    tabs.map(tab => h('a', { class: `subnav-tab${tab.id === activeId ? ' active' : ''}`, href: tab.href, 'aria-current': tab.id === activeId ? 'page' : null }, tab.label)))
}
