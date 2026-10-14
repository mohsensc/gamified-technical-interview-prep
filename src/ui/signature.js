import { h } from './h.js'
import { codeBlock } from './code.js'
import { overrideButton } from './override.js'

const openBrackets = new Set(['(', '[', '{'])
const closeBrackets = new Set([')', ']', '}'])

function splitTop(str, seps) {
  const parts = []
  let depth = 0
  let current = ''
  for (const ch of str) {
    if (openBrackets.has(ch)) depth++
    else if (closeBrackets.has(ch)) depth--
    if (depth === 0 && seps.includes(ch)) {
      parts.push(current)
      current = ''
    } else current += ch
  }
  parts.push(current)
  return parts
}

function topLevelIndexOf(str, ch) {
  let depth = 0
  for (let i = 0; i < str.length; i++) {
    const c = str[i]
    if (openBrackets.has(c)) depth++
    else if (closeBrackets.has(c)) depth--
    else if (depth === 0 && c === ch) return i
  }
  return -1
}

function stripOuterParens(input) {
  let str = input
  while (str.length > 1 && str[0] === '(' && str[str.length - 1] === ')') {
    let depth = 0
    let wraps = true
    for (let i = 0; i < str.length; i++) {
      if (str[i] === '(') depth++
      else if (str[i] === ')') {
        depth--
        if (depth === 0 && i !== str.length - 1) {
          wraps = false
          break
        }
      }
    }
    if (!wraps) break
    str = str.slice(1, -1)
  }
  return str
}

function expandOptional(input) {
  let result = input
  let guard = 0
  while (guard++ < 25) {
    const idx = result.indexOf('Optional[')
    if (idx === -1) break
    const openIdx = idx + 'Optional'.length
    let depth = 0
    let end = -1
    for (let i = openIdx; i < result.length; i++) {
      if (result[i] === '[') depth++
      else if (result[i] === ']') {
        depth--
        if (depth === 0) {
          end = i
          break
        }
      }
    }
    if (end === -1) break
    const inner = result.slice(openIdx + 1, end)
    result = `${result.slice(0, idx)}(${inner}|None)${result.slice(end + 1)}`
  }
  return result
}

const containerNames = /\b(List|Dict|Set|Tuple|FrozenSet)\b/g

function canonUnionOrGeneric(input) {
  const s = stripOuterParens(input)
  if (!s) return s
  const unionParts = splitTop(s, ['|']).filter(part => part.length)
  if (unionParts.length > 1) return unionParts.map(canonUnionOrGeneric).sort().join('|')
  const match = s.match(/^([A-Za-z_][A-Za-z0-9_]*)\[(.*)\]$/)
  if (match) {
    const inner = match[2]
    const args = splitTop(inner, [',']).map(arg => canonUnionOrGeneric(arg.trim())).filter(arg => arg.length)
    return `${match[1]}[${args.join(',')}]`
  }
  return s
}

export function canonType(raw) {
  let s = String(raw ?? '').replace(/\s+/g, '')
  if (!s) return ''
  s = expandOptional(s)
  s = s.replace(containerNames, word => word.toLowerCase())
  s = s.replace(/NoneType/gi, 'None')
  return canonUnionOrGeneric(s)
}

export function typesMatch(a, b) {
  return canonType(a) === canonType(b)
}

function parseOneParam(segment) {
  const trimmed = segment.trim()
  if (!trimmed) return null
  let rest = trimmed
  const eqIdx = topLevelIndexOf(rest, '=')
  if (eqIdx !== -1) rest = rest.slice(0, eqIdx).trim()
  const colonIdx = topLevelIndexOf(rest, ':')
  if (colonIdx !== -1) {
    return { name: rest.slice(0, colonIdx).trim(), typeRaw: rest.slice(colonIdx + 1).trim(), hasType: true }
  }
  return { name: rest.trim(), typeRaw: null, hasType: false }
}

function parseParamList(raw) {
  return splitTop(raw, [','])
    .map(part => part.trim())
    .filter(part => part.length)
    .map(parseOneParam)
    .filter(Boolean)
}

function joinLogicalLines(text) {
  const rawLines = String(text ?? '').replace(/\t/g, '    ').replace(/\r\n/g, '\n').split('\n')
  const records = []
  let buffer = null
  let depth = 0
  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i]
    if (buffer === null) {
      if (!line.trim()) continue
      buffer = { raw: line.trim(), indent: line.match(/^ */)[0].length, lineNo: i + 1 }
      depth = 0
    } else {
      buffer.raw += ` ${line.trim()}`
    }
    for (const ch of line) {
      if (ch === '(') depth++
      else if (ch === ')') depth--
    }
    if (depth <= 0) {
      records.push(buffer)
      buffer = null
    }
  }
  if (buffer) records.push(buffer)
  return records
}

const classPattern = /^class\s+([A-Za-z_]\w*)\s*(?:\([^)]*\))?\s*:$/
const defPattern = /^def\s+([A-Za-z_]\w*)\s*\(([\s\S]*)\)\s*(?:->\s*([\s\S]+?))?\s*:$/

function parseRecords(text) {
  const records = joinLogicalLines(text)
  const classBuckets = new Map()
  const orphanDefs = []
  let currentClass = null
  for (const record of records) {
    const classMatch = record.raw.match(classPattern)
    if (classMatch) {
      currentClass = classMatch[1]
      if (!classBuckets.has(currentClass)) classBuckets.set(currentClass, { name: currentClass, lineNo: record.lineNo, defs: [] })
      continue
    }
    const defMatch = record.raw.match(defPattern)
    if (defMatch) {
      const def = { name: defMatch[1], paramsRaw: defMatch[2] || '', returnsRaw: defMatch[3] ? defMatch[3].trim() : null, lineNo: record.lineNo }
      if (currentClass) classBuckets.get(currentClass).defs.push(def)
      else orphanDefs.push(def)
    }
  }
  return { classBuckets, orphanDefs }
}

function compareParams(expectedParams, userParams, issues, methodName) {
  const count = Math.max(expectedParams.length, userParams.length)
  for (let i = 0; i < count; i++) {
    const expected = expectedParams[i]
    const got = userParams[i]
    if (!expected) {
      issues.push({ severity: 'error', scope: 'param', method: methodName, message: `${methodName}(): extra parameter "${got.name}"` })
      continue
    }
    if (!got) {
      issues.push({ severity: 'error', scope: 'param', method: methodName, param: expected.name, message: `${methodName}(): missing parameter "${expected.name}"` })
      continue
    }
    if (expected.name === 'self') {
      if (got.name !== 'self') issues.push({ severity: 'error', scope: 'param', method: methodName, message: `${methodName}(): first parameter must be named "self", got "${got.name}"` })
      continue
    }
    if (got.name !== expected.name) {
      issues.push({ severity: 'error', scope: 'param', method: methodName, param: expected.name, message: `${methodName}(): parameter ${i} should be named "${expected.name}", got "${got.name}"` })
    }
    if (!got.hasType) {
      issues.push({ severity: 'error', scope: 'param', method: methodName, param: expected.name, message: `${methodName}(): parameter "${expected.name}" needs a type annotation` })
    } else if (!typesMatch(got.typeRaw, expected.type)) {
      issues.push({ severity: 'error', scope: 'param', method: methodName, param: expected.name, message: `${methodName}(): "${expected.name}" should be typed ${expected.type}, got ${got.typeRaw}` })
    }
  }
}

function compareMethod(expected, userDef, issues) {
  const expectedParams = [{ name: 'self', type: null }, ...(expected.params || []).map(([name, type]) => ({ name, type }))]
  const userParams = parseParamList(userDef.paramsRaw)
  compareParams(expectedParams, userParams, issues, expected.name)
  const isInit = expected.name === '__init__'
  if (userDef.returnsRaw === null) {
    if (!isInit) issues.push({ severity: 'error', scope: 'return', method: expected.name, message: `${expected.name}(): missing "-> ${expected.returns || '...'}"` })
  } else {
    const expectedReturn = expected.returns || (isInit ? 'None' : null)
    if (expectedReturn && !typesMatch(userDef.returnsRaw, expectedReturn)) {
      issues.push({ severity: 'error', scope: 'return', method: expected.name, message: `${expected.name}(): return type should be ${expectedReturn}, got ${userDef.returnsRaw}` })
    }
  }
}

function checkMethodsForClass(bucket, expectedMethods, issues) {
  const byName = new Map()
  for (const def of bucket.defs) {
    if (byName.has(def.name)) issues.push({ severity: 'warn', scope: 'method', method: def.name, message: `"${def.name}" is declared twice` })
    else byName.set(def.name, def)
  }
  for (const expected of expectedMethods) {
    const userDef = byName.get(expected.name)
    if (!userDef) {
      issues.push({ severity: 'error', scope: 'method', method: expected.name, message: `Missing method "${expected.name}"` })
      continue
    }
    compareMethod(expected, userDef, issues)
  }
}

export function checkSignature(spec, text) {
  const issues = []
  if (!spec) return { ok: false, issues: [{ severity: 'error', message: 'No signature to check' }] }
  const { classBuckets } = parseRecords(text)

  if (spec.kind === 'class') {
    const className = spec.className
    const bucket = classBuckets.get(className)
    if (!bucket) {
      issues.push({ severity: 'error', scope: 'class', message: `Missing "class ${className}:"` })
    } else {
      checkMethodsForClass(bucket, spec.methods || [], issues)
    }
    return { ok: issues.length === 0, issues }
  }

  const className = spec.className || 'Solution'
  const bucket = classBuckets.get(className)
  if (!bucket) {
    issues.push({ severity: 'error', scope: 'class', message: `Missing "class ${className}:"` })
  } else {
    checkMethodsForClass(bucket, [{ name: spec.method, params: spec.params || [], returns: spec.returns }], issues)
  }
  for (const helper of spec.helperClasses || []) {
    const helperBucket = classBuckets.get(helper.className)
    if (!helperBucket) {
      issues.push({ severity: 'error', scope: 'class', message: `Missing helper "class ${helper.className}:"` })
      continue
    }
    if (helper.params) checkMethodsForClass(helperBucket, [{ name: '__init__', params: helper.params, returns: null }], issues)
  }
  return { ok: issues.length === 0, issues }
}

function formatParamDecl([name, type]) {
  return type ? `${name}: ${type}` : name
}

function methodHeaderLine(indent, name, params, returns, isInit) {
  const paramsStr = ['self', ...(params || []).map(formatParamDecl)].join(', ')
  const ret = returns ? ` -> ${returns}` : isInit ? ' -> None' : ''
  return `${' '.repeat(indent)}def ${name}(${paramsStr})${ret}:`
}

export function expectedSignatureText(spec) {
  if (!spec) return ''
  if (spec.kind === 'class') {
    const lines = [`class ${spec.className}:`]
    for (const method of spec.methods || []) {
      lines.push(methodHeaderLine(4, method.name, method.params, method.returns, method.name === '__init__'))
      lines.push('        pass')
    }
    return lines.join('\n')
  }
  const lines = []
  for (const helper of spec.helperClasses || []) {
    lines.push(`class ${helper.className}:`)
    if (helper.params) {
      lines.push(methodHeaderLine(4, '__init__', helper.params, null, true))
      lines.push('        pass')
    }
    lines.push('')
  }
  lines.push(`class ${spec.className || 'Solution'}:`)
  lines.push(methodHeaderLine(4, spec.method, spec.params, spec.returns, false))
  lines.push('        pass')
  return lines.join('\n')
}

export function createSignatureEditor(spec, { onCheck, onOverride, revealAfter = 2, placeholder } = {}) {
  let attempts = 0
  let revealed = false
  let overridden = false

  const textarea = h('textarea', {
    class: 'sig-editor mono',
    spellcheck: 'false',
    autocomplete: 'off',
    autocapitalize: 'off',
    rows: String(Math.min(10, 3 + (spec?.methods?.length || 1) * 2)),
    placeholder: placeholder || 'class Solution:\n    def method(self, ...) -> ...:',
    onkeydown: event => {
      if (event.key === 'Tab') {
        event.preventDefault()
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        textarea.value = `${textarea.value.slice(0, start)}    ${textarea.value.slice(end)}`
        textarea.selectionStart = textarea.selectionEnd = start + 4
      } else if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        check()
      }
    },
  })

  const issuesEl = h('div', { class: 'sig-issues' })
  const revealEl = h('div', { class: 'sig-reveal' })
  const overrideSlot = h('span', { class: 'sig-override' })
  const statusEl = h('span', { class: 'muted small' }, `Tab inserts 4 spaces · ⌘⏎ to check`)
  const checkButton = h('button', { class: 'btn btn-primary', onclick: () => check() }, 'Check signature')
  const giveUpButton = h('button', { class: 'btn btn-ghost', onclick: () => reveal() }, 'Show answer')

  function paintIssues(result) {
    issuesEl.replaceChildren()
    if (result.ok) {
      issuesEl.append(h('div', { class: 'sig-issue sig-ok' }, '✓ Matches, clean signature.'))
      return
    }
    issuesEl.append(...result.issues.map(issue => h('div', { class: `sig-issue sig-${issue.severity}` }, issue.message)))
  }

  function check() {
    const result = checkSignature(spec, textarea.value)
    attempts += 1
    paintIssues(result)
    textarea.classList.toggle('is-wrong', !result.ok)
    textarea.classList.toggle('is-correct', result.ok)
    if (result.ok) statusEl.textContent = 'Nailed it.'
    else if (attempts >= revealAfter) statusEl.textContent = 'Here is the canonical signature.'
    else statusEl.textContent = `Not quite — ${revealAfter - attempts} ${revealAfter - attempts === 1 ? 'try' : 'tries'} left before the answer shows.`
    if (!result.ok && attempts >= revealAfter) reveal()
    onCheck?.(result, attempts)
    if (result.ok || overridden) overrideSlot.replaceChildren()
    else overrideSlot.replaceChildren(overrideButton({ onOverride: () => markOverridden(result) }))
    return result
  }

  function markOverridden(result) {
    if (overridden) return
    overridden = true
    textarea.classList.remove('is-wrong')
    textarea.classList.add('is-correct', 'is-overridden')
    issuesEl.replaceChildren()
    statusEl.textContent = ''
    onOverride?.(result, attempts)
  }

  function reveal() {
    if (revealed) return
    revealed = true
    checkButton.disabled = true
    giveUpButton.disabled = true
    textarea.disabled = true
    revealEl.replaceChildren(h('div', { class: 'label muted' }, 'Canonical signature'), codeBlock(expectedSignatureText(spec)))
  }

  const el = h('div', { class: 'sig-box stack-sm' },
    textarea,
    h('div', { class: 'row sig-actions' }, checkButton, giveUpButton, overrideSlot, statusEl),
    issuesEl,
    revealEl)

  return { el, textarea, check, reveal, getAttempts: () => attempts, isRevealed: () => revealed, isOverridden: () => overridden }
}
