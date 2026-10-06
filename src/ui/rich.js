import { h } from './h.js'
import { surfaceForms, termId, findTerm, categoryMeta } from '../content/glossary.js'

const markPattern = /==([^\n]+?)==/g
const isWordChar = ch => /[a-z0-9]/i.test(ch)

export function stripMarks(text) {
  return String(text ?? '').replace(/==([^\n]+?)==/g, '$1')
}

function matchAt(lowerText, pos) {
  for (const form of surfaceForms) {
    const len = form.lower.length
    if (!len || pos + len > lowerText.length) continue
    if (!lowerText.startsWith(form.lower, pos)) continue
    const before = pos > 0 ? lowerText[pos - 1] : ''
    const after = pos + len < lowerText.length ? lowerText[pos + len] : ''
    if (!isWordChar(before) && !isWordChar(after)) return form
  }
  return null
}

function keywordNode(text, entry) {
  const color = categoryMeta[entry.category]?.color || 'accent'
  const go = event => {
    event.stopPropagation()
    location.hash = `#/glossary/${encodeURIComponent(termId(entry.term))}`
  }
  return h('span', {
    class: `kw kw-${color}`,
    tabindex: '0',
    role: 'link',
    'data-tip': entry.def,
    onclick: go,
    onkeydown: event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        go(event)
      }
    },
  }, text)
}

function markNode(text) {
  return h('span', { class: 'kw kw-plain' }, text)
}

function appendAuto(frag, text, used) {
  if (!text) return
  const lower = text.toLowerCase()
  let i = 0
  let start = 0
  while (i < text.length) {
    const found = matchAt(lower, i)
    if (found && !used.has(found.id)) {
      if (i > start) frag.append(document.createTextNode(text.slice(start, i)))
      used.add(found.id)
      frag.append(keywordNode(text.slice(i, i + found.lower.length), found.entry))
      i += found.lower.length
      start = i
    } else if (found) {
      i += found.lower.length
    } else {
      i += 1
    }
  }
  if (start < text.length) frag.append(document.createTextNode(text.slice(start)))
}

export function rich(text) {
  const frag = document.createDocumentFragment()
  const source = String(text ?? '')
  if (!source) return frag
  const used = new Set()
  const parts = source.split(/`([^`\n]+)`/)
  parts.forEach((part, i) => {
    if (i % 2) {
      const code = document.createElement('code')
      code.className = 'rich-code'
      code.textContent = part
      frag.append(code)
    } else if (part) {
      frag.append(richMarks(part, used))
    }
  })
  return frag
}

function richMarks(source, used) {
  const frag = document.createDocumentFragment()
  let lastIndex = 0
  let match
  markPattern.lastIndex = 0
  while ((match = markPattern.exec(source))) {
    appendAuto(frag, source.slice(lastIndex, match.index), used)
    const inner = match[1].trim()
    const entry = findTerm(inner)
    if (entry) {
      used.add(termId(entry.term))
      frag.append(keywordNode(inner, entry))
    } else {
      frag.append(markNode(inner))
    }
    lastIndex = match.index + match[0].length
  }
  appendAuto(frag, source.slice(lastIndex), used)
  return frag
}
