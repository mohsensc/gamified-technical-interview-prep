import { h } from './h.js'

const keywords = new Set(['False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield'])
const builtins = new Set(['len', 'range', 'min', 'max', 'sum', 'abs', 'sorted', 'reversed', 'enumerate', 'zip', 'map', 'filter', 'list', 'dict', 'set', 'tuple', 'int', 'str', 'float', 'bool', 'print', 'any', 'all', 'ord', 'chr', 'isinstance', 'float', 'iter', 'next', 'divmod', 'pow', 'hash', 'type', 'object', 'super', 'self', 'dd', 'defaultdict', 'Counter', 'deque', 'heapq', 'heappush', 'heappop', 'heapify', 'cache', 'bisect', 'bisect_left', 'bisect_right', 'List', 'Optional', 'inf', 'math'])

const escapeHtml = text => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const tokenPattern = /(#.*$)|("""[\s\S]*?"""|'''[\s\S]*?'''|[rbfu]{0,2}"(?:\\.|[^"\\])*"|[rbfu]{0,2}'(?:\\.|[^'\\])*')|(\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b)|(@\w+)|([A-Za-z_]\w*)|(->|[-+*/%=<>!&|^~]=?|\/\/|\*\*)|(\s+)|(.)/gm

export function highlightPython(line) {
  let out = ''
  let previousWord = ''
  for (const match of line.matchAll(tokenPattern)) {
    const [token, comment, string, number, decorator, word, operator] = match
    const safe = escapeHtml(token)
    if (comment) out += `<span class="tok-comment">${safe}</span>`
    else if (string) out += `<span class="tok-string">${safe}</span>`
    else if (number) out += `<span class="tok-number">${safe}</span>`
    else if (decorator) out += `<span class="tok-decorator">${safe}</span>`
    else if (word) {
      if (keywords.has(word)) out += `<span class="tok-keyword">${safe}</span>`
      else if (previousWord === 'def' || previousWord === 'class') out += `<span class="tok-def">${safe}</span>`
      else if (builtins.has(word)) out += `<span class="tok-builtin">${safe}</span>`
      else out += safe
      previousWord = word
      continue
    } else if (operator) out += `<span class="tok-op">${safe}</span>`
    else out += safe
    if (token.trim()) previousWord = ''
  }
  return out
}

export function codeBlock(source = '', { highlightLine = null, lineNumbers = true, dimOthers = false } = {}) {
  const lines = String(source).replace(/\t/g, '    ').replace(/\s+$/, '').split('\n')
  const lineEls = lines.map((line, i) => h('div', { class: 'code-line', 'data-line': i + 1 },
    lineNumbers ? h('span', { class: 'code-ln' }, String(i + 1)) : null,
    h('span', { class: 'code-text', html: highlightPython(line) || ' ' })))
  const block = h('pre', { class: `code-block${lineNumbers ? ' with-ln' : ''}${dimOthers ? ' dim-others' : ''}` },
    h('code', null, lineEls))

  let current = null
  block.setHighlight = (lineNo, { scroll = true } = {}) => {
    if (current) current.classList.remove('active')
    current = lineNo ? lineEls[lineNo - 1] || null : null
    block.classList.toggle('has-active', Boolean(current))
    if (current) {
      current.classList.add('active')
      if (scroll && block.scrollHeight > block.clientHeight) {
        const top = current.offsetTop - block.clientHeight / 2 + current.offsetHeight / 2
        block.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
      }
    }
  }
  block.setMarks = (marks = {}) => {
    lineEls.forEach((el, i) => {
      el.classList.remove('mark-good', 'mark-bad', 'mark-info')
      const mark = marks[i + 1]
      if (mark) el.classList.add(`mark-${mark}`)
    })
  }
  block.lineCount = lines.length
  if (highlightLine) block.setHighlight(highlightLine, { scroll: false })
  return block
}
