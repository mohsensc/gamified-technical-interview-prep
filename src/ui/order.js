const KEYWORDS = new Set(['False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class',
  'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in',
  'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield'])

const BUILTINS = new Set(['abs', 'all', 'any', 'bin', 'bool', 'bytearray', 'bytes', 'callable', 'chr',
  'classmethod', 'compile', 'complex', 'delattr', 'dict', 'dir', 'divmod', 'enumerate', 'eval', 'exec', 'filter',
  'float', 'format', 'frozenset', 'getattr', 'globals', 'hasattr', 'hash', 'help', 'hex', 'id', 'input', 'int',
  'isinstance', 'issubclass', 'iter', 'len', 'list', 'locals', 'map', 'max', 'memoryview', 'min', 'next', 'object',
  'oct', 'open', 'ord', 'pow', 'print', 'property', 'range', 'repr', 'reversed', 'round', 'set', 'setattr', 'slice',
  'sorted', 'staticmethod', 'str', 'sum', 'super', 'tuple', 'type', 'vars', 'zip', 'heapq', 'collections',
  'defaultdict', 'dd', 'Counter', 'deque', 'functools', 'cache', 'lru_cache', 'bisect', 'math', 'itertools',
  'random', 'sys', 'os', 're', 'inf', 'Optional', 'List', 'Dict', 'Tuple', 'Set', 'Node', 'ListNode', 'TreeNode'])

const MUTATORS = new Set(['append', 'add', 'pop', 'remove', 'update', 'popleft', 'appendleft', 'extend',
  'insert', 'discard', 'clear'])

const HEAP_FUNCS = ['heappush', 'heappop', 'heapify', 'heapreplace', 'heappushpop']

function indentOf(line) {
  const m = line.match(/^[ \t]*/)
  return m ? m[0].length : 0
}

function stripStringsAndComments(line) {
  let out = ''
  let i = 0
  while (i < line.length) {
    const ch = line[i]
    if (ch === '#') break
    if (ch === '"' || ch === "'") {
      const quote = ch
      i++
      while (i < line.length && line[i] !== quote) {
        if (line[i] === '\\') i++
        i++
      }
      i++
      out += ' '
      continue
    }
    out += ch
    i++
  }
  return out
}

function extractIdentifiers(text) {
  const out = []
  const re = /[A-Za-z_][A-Za-z0-9_]*/g
  let m
  while ((m = re.exec(text))) out.push({ text: m[0], index: m.index })
  return out
}

function splitTopLevel(s) {
  const parts = []
  let depth = 0
  let start = 0
  for (let i = 0; i <= s.length; i++) {
    const ch = s[i]
    if (ch === '(' || ch === '[') depth++
    else if (ch === ')' || ch === ']') depth--
    if ((ch === ',' && depth === 0) || i === s.length) {
      parts.push(s.slice(start, i))
      start = i + 1
    }
  }
  return parts
}

function chainBase(expr) {
  const bracketIdx = expr.indexOf('[')
  const prefix = bracketIdx === -1 ? expr : expr.slice(0, bracketIdx)
  const ids = extractIdentifiers(prefix)
  return ids.length ? ids[ids.length - 1].text : null
}

function extractTargets(expr, out) {
  const trimmed = expr.trim()
  if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
    for (const part of splitTopLevel(trimmed.slice(1, -1))) extractTargets(part, out)
    return
  }
  const stripped = trimmed.replace(/^\*+/, '')
  const base = chainBase(stripped)
  if (base) out.push(base)
}

function baseIdentifiersFromTargets(lhs) {
  const out = []
  for (const part of splitTopLevel(lhs)) extractTargets(part, out)
  return out
}

function findTopLevelAssign(line) {
  let depth = 0
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '(' || ch === '[' || ch === '{') depth++
    else if (ch === ')' || ch === ']' || ch === '}') depth--
    else if (depth === 0 && ch === '=') {
      const prev = line[i - 1]
      const next = line[i + 1]
      if (next === '=') { i++; continue }
      if (prev === '=' || prev === '<' || prev === '>' || prev === '!') continue
      let opStart = i
      if (prev === '/' && line[i - 2] === '/') opStart = i - 2
      else if (prev === '*' && line[i - 2] === '*') opStart = i - 2
      else if (prev === '>' && line[i - 2] === '>') opStart = i - 2
      else if (prev === '<' && line[i - 2] === '<') opStart = i - 2
      else if ('+-*/%&|^'.includes(prev)) opStart = i - 1
      return { lhs: line.slice(0, opStart), rhs: line.slice(i + 1) }
    }
  }
  return null
}

function collectChainReads(line, reads) {
  const chainRe = /[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*(?:\[[^[\]]*\])*/g
  let m
  while ((m = chainRe.exec(line))) {
    const chain = m[0]
    const afterIdx = m.index + chain.length
    const followedByCall = /^\s*\(/.test(line.slice(afterIdx))
    let effective = chain
    if (followedByCall) {
      const lastDot = chain.lastIndexOf('.')
      if (lastDot === -1) continue
      effective = chain.slice(0, lastDot)
    }
    const firstToken = effective.match(/^[A-Za-z_]\w*/)
    if (!firstToken || KEYWORDS.has(firstToken[0])) continue
    const bare = !effective.includes('.') && !effective.includes('[')
    if (bare && BUILTINS.has(effective)) continue
    const base = chainBase(effective)
    if (base && !KEYWORDS.has(base) && !BUILTINS.has(base)) reads.add(base)
  }
}

function analyzeLine(rawLine) {
  const line = stripStringsAndComments(rawLine)
  const trimmed = line.trim()
  const writes = new Set()
  const reads = new Set()

  const defMatch = trimmed.match(/^(def|class)\s+([A-Za-z_]\w*)/)
  if (defMatch) writes.add(defMatch[2])

  const forMatch = trimmed.match(/^for\s+(.+?)\s+in\s+.+:$/)
  if (forMatch) for (const base of baseIdentifiersFromTargets(forMatch[1])) writes.add(base)

  for (const fn of HEAP_FUNCS) {
    const re = new RegExp(`\\b${fn}\\s*\\(\\s*([A-Za-z_]\\w*(?:\\.[A-Za-z_]\\w*)*(?:\\[[^[\\]]*\\])*)`)
    const m = line.match(re)
    if (m) {
      const base = chainBase(m[1])
      if (base) writes.add(base)
    }
  }

  const methodRe = /([A-Za-z_][\w.[\]'"0-9]*)\.([A-Za-z_]\w*)\s*\(/g
  let mm
  while ((mm = methodRe.exec(line))) {
    if (MUTATORS.has(mm[2])) {
      const base = chainBase(mm[1])
      if (base) writes.add(base)
    }
  }

  const assign = !defMatch && !forMatch && findTopLevelAssign(line)
  if (assign) for (const base of baseIdentifiersFromTargets(assign.lhs)) writes.add(base)

  if (defMatch) {
    const after = trimmed.slice(defMatch[0].length)
    const closeParen = after.indexOf(')')
    const rest = closeParen === -1 ? '' : after.slice(closeParen + 1)
    collectChainReads(rest, reads)
  } else {
    collectChainReads(line, reads)
  }

  return { writes, reads }
}

function parseRaw(lines) {
  const root = { indent: -1, children: [] }
  const stack = [root]
  for (const line of lines) {
    const indent = indentOf(line)
    const node = { text: line, indent, children: [] }
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop()
    stack[stack.length - 1].children.push(node)
    stack.push(node)
  }
  return root.children
}

function toUnits(rawNodes) {
  const simpleUnits = rawNodes.map(n => ({ chain: false, text: n.text, children: toUnits(n.children) }))
  return mergeChains(simpleUnits)
}

function mergeChains(units) {
  const result = []
  let i = 0
  while (i < units.length) {
    const head = units[i]
    const headTrim = head.chain ? '' : head.text.trim()
    let j = i + 1
    const members = [head]
    if (!head.chain && /^if\b.*:$/.test(headTrim)) {
      while (j < units.length && !units[j].chain && /^elif\b.*:$/.test(units[j].text.trim())) { members.push(units[j]); j++ }
      if (j < units.length && !units[j].chain && /^else\s*:$/.test(units[j].text.trim())) { members.push(units[j]); j++ }
    } else if (!head.chain && /^(for|while)\b.*:$/.test(headTrim)) {
      if (j < units.length && !units[j].chain && /^else\s*:$/.test(units[j].text.trim())) { members.push(units[j]); j++ }
    } else if (!head.chain && /^try\s*:$/.test(headTrim)) {
      while (j < units.length && !units[j].chain && /^except\b.*:$/.test(units[j].text.trim())) { members.push(units[j]); j++ }
      if (j < units.length && !units[j].chain && /^else\s*:$/.test(units[j].text.trim())) { members.push(units[j]); j++ }
      if (j < units.length && !units[j].chain && /^finally\s*:$/.test(units[j].text.trim())) { members.push(units[j]); j++ }
    }
    if (members.length > 1) {
      result.push({ chain: true, members: members.map(m => ({ text: m.text, children: m.children })) })
      i = j
    } else {
      result.push(head)
      i++
    }
  }
  return result
}

function buildUnits(lines) {
  return toUnits(parseRaw(lines))
}

function childrenSignature(children) {
  return children.map(signature).sort().join(',')
}

function signature(unit) {
  if (unit.chain) return 'C[' + unit.members.map(m => m.text.trim() + '{' + childrenSignature(m.children) + '}').join('>') + ']'
  return 'S(' + unit.text.trim() + ')[' + childrenSignature(unit.children) + ']'
}

function collectLines(unit, out) {
  if (unit.chain) {
    for (const m of unit.members) {
      out.push(m.text)
      for (const c of m.children) collectLines(c, out)
    }
  } else {
    out.push(unit.text)
    for (const c of unit.children) collectLines(c, out)
  }
}

function analyzeUnit(unit) {
  const lines = []
  collectLines(unit, lines)
  const writes = new Set()
  const reads = new Set()
  for (const line of lines) {
    const info = analyzeLine(line)
    for (const x of info.writes) writes.add(x)
    for (const x of info.reads) reads.add(x)
  }
  return { writes, reads }
}

function isControlPin(unit) {
  if (unit.chain) return false
  return /^(return|break|continue|raise|yield)\b/.test(unit.text.trim())
}

function intersects(a, b) {
  for (const x of a) if (b.has(x)) return true
  return false
}

function validateSiblings(correctUnits, answerUnits) {
  if (correctUnits.length !== answerUnits.length) return false
  if (correctUnits.length === 0) return true

  const correctSigs = correctUnits.map(signature)
  const answerSigs = answerUnits.map(signature)
  const sortedC = [...correctSigs].sort()
  const sortedA = [...answerSigs].sort()
  for (let i = 0; i < sortedC.length; i++) if (sortedC[i] !== sortedA[i]) return false

  const used = new Array(correctUnits.length).fill(false)
  const matchedCorrectIndex = new Array(answerUnits.length).fill(-1)
  for (let a = 0; a < answerUnits.length; a++) {
    for (let c = 0; c < correctUnits.length; c++) {
      if (!used[c] && correctSigs[c] === answerSigs[a]) {
        used[c] = true
        matchedCorrectIndex[a] = c
        break
      }
    }
  }

  const positionInAnswer = new Array(correctUnits.length).fill(-1)
  matchedCorrectIndex.forEach((c, a) => { positionInAnswer[c] = a })

  const info = correctUnits.map(analyzeUnit)
  const pins = correctUnits.map(isControlPin)

  for (let i = 0; i < correctUnits.length; i++) {
    for (let j = i + 1; j < correctUnits.length; j++) {
      let needOrder = pins[i] || pins[j]
      if (!needOrder) {
        const a = info[i], b = info[j]
        needOrder = intersects(a.writes, b.reads) || intersects(a.reads, b.writes) || intersects(a.writes, b.writes)
      }
      if (needOrder && positionInAnswer[i] > positionInAnswer[j]) return false
    }
  }

  for (let a = 0; a < answerUnits.length; a++) {
    const c = matchedCorrectIndex[a]
    const cu = correctUnits[c]
    const au = answerUnits[a]
    if (cu.chain && au.chain) {
      if (cu.members.length !== au.members.length) return false
      for (let k = 0; k < cu.members.length; k++) {
        if (!validateSiblings(cu.members[k].children, au.members[k].children)) return false
      }
    } else if (!cu.chain && !au.chain) {
      if (!validateSiblings(cu.children, au.children)) return false
    } else {
      return false
    }
  }

  return true
}

export function isValidOrder(correctLines, answerLines) {
  if (!Array.isArray(correctLines) || !Array.isArray(answerLines)) return false
  if (correctLines.length !== answerLines.length) return false
  if (correctLines.length === 0) return true
  const correctTree = buildUnits(correctLines)
  const answerTree = buildUnits(answerLines)
  return validateSiblings(correctTree, answerTree)
}
