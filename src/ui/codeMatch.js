const wordChar = /[A-Za-z0-9_]/

const wrapLeadingKeywords = /^(if|elif|while|return|assert|yield)\s*\(/

function matchingParenAt(text, start) {
  let depth = 0
  let quote = null
  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (quote) {
      if (ch === '\\') i++
      else if (ch === quote) quote = null
      continue
    }
    if (ch === '"' || ch === "'") quote = ch
    else if (ch === '(') depth++
    else if (ch === ')') {
      depth--
      if (depth === 0) return i
    }
  }
  return -1
}

function hasTopLevelComma(text) {
  let depth = 0
  let quote = null
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quote) {
      if (ch === '\\') i++
      else if (ch === quote) quote = null
      continue
    }
    if (ch === '"' || ch === "'") quote = ch
    else if ('([{'.includes(ch)) depth++
    else if (')]}'.includes(ch)) depth--
    else if (ch === ',' && depth === 0) return true
  }
  return false
}

function stripTrailingComment(text) {
  let quote = null
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quote) {
      if (ch === '\\') i++
      else if (ch === quote) quote = null
      continue
    }
    if (ch === '"' || ch === "'") quote = ch
    else if (ch === '#') return text.slice(0, i)
  }
  return text
}

function collapseSpaces(text) {
  const squeezed = text.replace(/\s+/g, ' ')
  let out = ''
  for (let i = 0; i < squeezed.length; i++) {
    const ch = squeezed[i]
    if (ch !== ' ') {
      out += ch
      continue
    }
    const before = out[out.length - 1]
    const after = squeezed[i + 1]
    if (before && after && wordChar.test(before) && wordChar.test(after)) out += ' '
  }
  return out
}

function unwrapOuterParens(text) {
  let current = text
  for (let guard = 0; guard < 4; guard++) {
    if (current.startsWith('(') && matchingParenAt(current, 0) === current.length - 1 && !hasTopLevelComma(current.slice(1, -1))) {
      current = current.slice(1, -1)
      continue
    }
    const keyword = current.match(wrapLeadingKeywords)
    if (keyword) {
      const open = keyword[0].length - 1
      const close = matchingParenAt(current, open)
      if (close === current.length - 1 && !hasTopLevelComma(current.slice(open + 1, close))) {
        current = `${keyword[1]} ${current.slice(open + 1, close)}`
        continue
      }
    }
    break
  }
  return current
}

export function normalizeCode(text, { caseInsensitive = false } = {}) {
  let value = stripTrailingComment(String(text ?? ''))
  value = value.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/'/g, '"')
  value = value.trim().replace(/[;:\s]+$/, '').trim()
  value = collapseSpaces(value)
  value = unwrapOuterParens(value)
  value = collapseSpaces(value)
  return caseInsensitive ? value.toLowerCase() : value
}

export function codeMatches(userText, candidates, options) {
  const user = normalizeCode(userText, options)
  if (!user) return false
  return candidates.some(candidate => normalizeCode(candidate, options) === user)
}
