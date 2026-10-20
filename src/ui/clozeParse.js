const bracketDepthIsBalanced = text => {
  let depth = 0
  for (const char of text) {
    if (char === '[') depth += 1
    else if (char === ']') {
      depth -= 1
      if (depth < 0) return false
    }
  }
  return depth === 0
}

const findBlankEnd = (code, innerStart) => {
  const lineEnd = code.indexOf('\n', innerStart)
  const limit = lineEnd === -1 ? code.length : lineEnd
  let fallback = -1
  for (let end = code.indexOf(']]', innerStart); end !== -1 && end < limit; end = code.indexOf(']]', end + 1)) {
    if (end === innerStart) continue
    if (bracketDepthIsBalanced(code.slice(innerStart, end))) return end
    if (fallback === -1 && code[end + 2] !== ']') fallback = end
  }
  return fallback
}

export function splitCloze(code, makePlaceholder) {
  const text = String(code)
  const blanks = []
  let source = ''
  let cursor = 0
  while (cursor < text.length) {
    const open = text.indexOf('[[', cursor)
    if (open === -1) break
    if (text[open + 2] === ']') {
      source += text.slice(cursor, open + 1)
      cursor = open + 1
      continue
    }
    let start = open
    if (text[open + 2] === '[' && /[\w\])]/.test(text[open - 1] || '')) start = open + 1
    const end = findBlankEnd(text, start + 2)
    if (end === -1) {
      source += text.slice(cursor, open + 1)
      cursor = open + 1
      continue
    }
    source += text.slice(cursor, start)
    blanks.push(text.slice(start + 2, end).split('|').map(part => part.trim()).filter(Boolean))
    source += makePlaceholder(blanks.length - 1)
    cursor = end + 2
  }
  return { source: source + text.slice(cursor), blanks }
}
