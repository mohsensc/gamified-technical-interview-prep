import { h, clear, toast } from '../ui/h.js'
import { renderMcq } from '../ui/items.js'
import { recordAnswer } from '../store.js'

const constraintRows = [
  { n: 'n ≤ 10', tone: 'pink', huge: true, target: 'O(n!) or O(2ⁿ·n)', note: 'permutations, brute-force subsets' },
  { n: 'n ≤ 20', tone: 'pink', huge: true, target: 'O(2ⁿ)', note: 'bitmask DP, subset enumeration' },
  { n: 'n ≤ 100', tone: 'amber', huge: true, target: 'O(n³)', note: 'cubic DP, Floyd–Warshall' },
  { n: 'n ≤ 1,000', tone: 'amber', huge: true, target: 'O(n²) (·log n ok)', note: 'pairwise DP, nested loops' },
  { n: 'n ≤ 10⁴', tone: 'red', huge: false, target: 'O(n²) risky · O(n√n) / O(n log n) safer', note: 'n² = 10⁸, borderline in Python' },
  { n: 'n ≤ 10⁵', tone: 'teal', huge: true, target: 'O(n log n)', note: 'sort, heap, hashmap, two pointers' },
  { n: 'n ≤ 10⁶', tone: 'teal', huge: true, target: 'O(n) · O(n log n) tight', note: 'single pass, hashing, prefix sums' },
  { n: 'n ≤ 10⁸', tone: 'red', huge: false, target: 'O(n) only in C++ — in Python aim log n / √n / O(1)', note: 'Python does ~10⁷ ops/sec' },
  { n: 'n ≥ 10⁹ (or values ≤ 10⁹)', tone: 'sky', huge: true, target: 'O(log n) · O(√n) · O(1)', note: 'binary search the answer, or closed-form math' },
]

const constraintNotes = [
  'budget ≈ 10⁷–10⁸ simple ops/sec · Python ~10⁷',
  'grid R×C ≤ 10⁵ cells → O(R·C)',
  'graph V,E ≤ 10⁵ → O(V+E) or O((V+E) log V)',
  'k small (≤ 20) → exponential in k is fine',
]

const factorial = n => {
  let result = 1
  for (let i = 2; i <= n; i++) {
    result *= i
    if (!isFinite(result)) return Infinity
  }
  return result
}

const ladderDefs = [
  { label: 'O(1)', fn: () => 1 },
  { label: 'O(log n)', fn: n => Math.log2(n) },
  { label: 'O(√n)', fn: n => Math.sqrt(n) },
  { label: 'O(n)', fn: n => n },
  { label: 'O(n log n)', fn: n => n * Math.log2(n) },
  { label: 'O(n²)', fn: n => n * n },
  { label: 'O(2ⁿ)', fn: n => 2 ** n },
  { label: 'O(n!)', fn: n => factorial(n) },
]

const sup = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }

function formatOps(value) {
  if (!isFinite(value) || value > 1e30) return 'off the charts'
  if (value < 1000) return `${Math.max(1, Math.round(value))}`
  const exponent = Math.floor(Math.log10(value))
  const mantissa = value / 10 ** exponent
  const exponentText = String(exponent).split('').map(digit => sup[digit]).join('')
  const lead = mantissa >= 1.05 ? `${Math.round(mantissa * 10) / 10}·` : ''
  return `${lead}10${exponentText}`
}

function barWidth(ops) {
  if (!isFinite(ops)) return 100
  const log = Math.max(0, Math.log10(Math.max(1, ops)))
  return Math.max(2, Math.min(100, (log / 16) * 100))
}

function barTone(ops) {
  if (!isFinite(ops) || ops > 1e9) return 'red'
  if (ops > 1e7) return 'amber'
  return 'teal'
}

const pyOpsGroups = [
  { group: 'list', tone: 'teal', rows: [['append / pop()', 'O(1)'], ['pop(0) / insert(0, x)', 'O(n)'], ['x in list', 'O(n)'], ['lst[i]', 'O(1)'], ['lst[a:b]', 'O(b-a)'], ['sort() / sorted()', 'O(n log n)']] },
  { group: 'dict / set', tone: 'sky', rows: [['d[k] = v', 'O(1) avg'], ['k in d', 'O(1) avg'], ['del d[k]', 'O(1) avg'], ['Counter(nums)', 'O(n)']] },
  { group: 'deque', tone: 'amber', rows: [['append(x)', 'O(1)'], ['appendleft(x)', 'O(1)'], ['pop()', 'O(1)'], ['popleft()', 'O(1)'], ['dq[i]', 'O(n)']] },
  { group: 'heapq', tone: 'pink', rows: [['heappush', 'O(log n)'], ['heappop', 'O(log n)'], ['heapify(list)', 'O(n)'], ['heap[0] peek', 'O(1)'], ['nlargest(k, it)', 'O(n log k)']] },
  { group: 'str', tone: 'green', rows: [["result += c in a loop", 'O(n²)'], ["''.join(parts)", 'O(n)'], ['s[::-1]', 'O(n)'], ['s in text', 'O(n·m) worst']] },
  { group: 'bisect', tone: 'red', rows: [['bisect_left / right', 'O(log n)'], ['insort(list, x)', 'O(n) — shift after O(log n) find']] },
]

const algoRows = [
  ['BFS / DFS (graph)', 'O(V + E)', 'O(V)', 'each node + edge visited once'],
  ['BFS / DFS (grid)', 'O(R · C)', 'O(R · C)', 'each cell visited once'],
  ['Dijkstra (heap)', 'O((V+E) log V)', 'O(V + E)', 'needs non-negative weights'],
  ['Union-Find', '~O(α(n)) per op', 'O(V)', 'path compression + union by rank'],
  ['Prim / Kruskal (MST)', 'O(E log V)', 'O(V + E)', ''],
  ['Topological sort', 'O(V + E)', 'O(V)', 'Kahn’s or DFS order'],
  ['Binary search', 'O(log n)', 'O(1)', 'range halves each step'],
  ['Binary search on answer', 'O(n log range)', 'O(1)', 'log(range) feasibility checks, each O(n)'],
  ['Sorting (Python)', 'O(n log n)', 'O(n)', 'Timsort, sorted() copies'],
  ['Heap top-k', 'O(n log k)', 'O(k)', 'heap sized k beats full sort'],
  ['Backtracking: subsets', 'O(2ⁿ · n)', 'O(n)', '2ⁿ leaves, up to n to copy each'],
  ['Backtracking: permutations', 'O(n! · n)', 'O(n)', 'n! orderings, up to n to copy each'],
  ['Dynamic programming', 'states × transition', 'O(states)', 'count states, multiply by work per state'],
  ['Trie insert / search', 'O(L)', 'O(total chars)', 'L = word or prefix length'],
]

const spaceRows = [
  { label: 'Recursion depth', note: 'O(h) balanced tree/graph · O(n) skewed or linked-list shape' },
  { label: 'BFS / level queue', note: 'O(width) — the widest frontier or level, not total nodes' },
  { label: 'Output space', note: 'usually stated separately — say "O(1) extra, excluding the output"' },
  { label: 'In-place', note: 'O(1) extra — mutate the input, allocate nothing new' },
  { label: 'Memo table', note: 'O(distinct states) — one slot per subproblem, not per call' },
]

const signalRows = [
  ['sorted array', 'two pointers · binary search'],
  ['kth largest / smallest', 'heap · quickselect'],
  ['contiguous subarray / substring', 'sliding window · prefix sum'],
  ['shortest path, unweighted', 'BFS'],
  ['shortest path, weighted', 'Dijkstra'],
  ['dependencies / prerequisites', 'topological sort'],
  ['connected components / groups', 'union-find · DFS'],
  ['all combinations / subsets / orderings', 'backtracking'],
  ['count ways / min or max cost', 'dynamic programming'],
  ['intervals / scheduling', 'sort + sweep'],
  ['next greater / smaller element', 'monotonic stack'],
  ['O(1) get + put, with eviction', 'hashmap + doubly linked list'],
]

const sections = [
  { id: 'constraints', label: 'Constraints', tone: 'teal' },
  { id: 'ladder', label: 'Big-O ladder', tone: 'sky' },
  { id: 'pyops', label: 'Python costs', tone: 'amber' },
  { id: 'algos', label: 'Algorithms', tone: 'pink' },
  { id: 'space', label: 'Space', tone: 'green' },
  { id: 'signals', label: 'Signal words', tone: 'red' },
]

function copyText(text) {
  const run = async () => {
    try {
      await navigator.clipboard.writeText(text)
      toast('Copied', 'good')
    } catch {
      toast('Copy failed', 'bad')
    }
  }
  run()
}

function searchKey(parts) {
  return parts.join(' ').toLowerCase()
}

function row(tone, key, ...rest) {
  const isAttrsObj = value => value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Node)
  const extra = isAttrsObj(rest[0]) ? rest.shift() : null
  const extraClass = extra?.class ? ` ${extra.class}` : ''
  return h('div', { class: `cheat-row${tone ? ` tone-${tone}` : ''}${extraClass}`, 'data-k': key, tabindex: '0', onclick: () => copyText(key), onkeydown: event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); copyText(key) } } }, rest)
}

function cardHead(title, tone) {
  return h('div', { class: 'cheat-card-head' }, h('span', { class: 'cheat-bar', style: { background: `var(--${tone})` } }), h('h2', null, title))
}

function buildConstraintsSection() {
  const rows = constraintRows.map(entry => row(entry.tone, searchKey([entry.n, entry.target, entry.note]), { class: `cheat-row cheat-con-row${entry.huge ? ' is-huge' : ''} tone-${entry.tone}` },
    h('span', { class: 'cheat-con-n' }, entry.n),
    h('span', { class: 'cheat-con-arrow' }, '→'),
    h('span', { class: 'cheat-con-target' }, entry.target),
    h('span', { class: 'cheat-con-note' }, entry.note)))

  return h('section', { id: 'constraints', class: 'card cheat-card' },
    cardHead('Constraint → target complexity', 'teal'),
    h('div', { class: 'cheat-con-list' }, rows),
    h('div', { class: 'row-wrap cheat-extra-notes' }, constraintNotes.map(text => h('span', { class: 'chip cheat-note-chip' }, text))))
}

function buildLadderSection() {
  const rows = ladderDefs.map(def => {
    const ops5 = def.fn(1e5)
    const ops6 = def.fn(1e6)
    return row(null, searchKey([def.label, formatOps(ops5), formatOps(ops6)]), { class: 'cheat-ladder-row' },
      h('span', { class: 'cheat-ladder-label mono' }, def.label),
      h('div', { class: 'cheat-ladder-bar-wrap' },
        h('span', { class: 'cheat-budget-mark' }),
        h('div', { class: `cheat-ladder-bar tone-${barTone(ops6)}`, style: { width: `${barWidth(ops6)}%` } })),
      h('span', { class: 'cheat-ladder-ops mono' }, `n=10⁵: ${formatOps(ops5)}`),
      h('span', { class: 'cheat-ladder-ops mono' }, `n=10⁶: ${formatOps(ops6)}`))
  })
  return h('section', { id: 'ladder', class: 'card cheat-card' },
    cardHead('Big-O ladder', 'sky'),
    h('p', { class: 'muted small' }, 'Bar = log scale of total ops at n = 10⁶. Budget mark ≈ 10⁸ ops/sec.'),
    h('div', { class: 'cheat-ladder-list' }, rows))
}

function buildPyOpsSection() {
  const groups = pyOpsGroups.map(group => h('div', { class: 'cheat-pyops-group' },
    h('div', { class: 'row cheat-pyops-head' }, h('span', { class: 'cheat-bar cheat-bar-sm', style: { background: `var(--${group.tone})` } }), h('b', null, group.group)),
    h('div', { class: 'stack-sm' }, group.rows.map(([op, cost]) => row(group.tone, searchKey([group.group, op, cost]), { class: 'cheat-pyops-row' },
      h('code', null, op),
      h('span', { class: `pill pill-${group.tone} mono` }, cost))))))
  return h('section', { id: 'pyops', class: 'card cheat-card' },
    cardHead('Python operation costs', 'amber'),
    h('div', { class: 'grid-3 cheat-pyops-grid' }, groups))
}

function buildAlgoSection() {
  const rows = algoRows.map(([name, time, space, note]) => row(null, searchKey([name, time, space, note]), { class: 'cheat-algo-row' },
    h('span', { class: 'cheat-algo-name' }, name),
    h('span', { class: 'pill pill-amber mono' }, time),
    h('span', { class: 'pill pill-sky mono' }, space),
    h('span', { class: 'muted small cheat-algo-note' }, note)))
  return h('section', { id: 'algos', class: 'card cheat-card' },
    cardHead('Algorithm complexities', 'pink'),
    h('div', { class: 'cheat-algo-head cheat-algo-row' },
      h('span', { class: 'muted small' }, 'algorithm'), h('span', { class: 'muted small' }, 'time'), h('span', { class: 'muted small' }, 'space'), h('span', { class: 'muted small' }, 'note')),
    h('div', { class: 'cheat-algo-list' }, rows))
}

function buildSpaceSection() {
  const rows = spaceRows.map(entry => row('green', searchKey([entry.label, entry.note]), { class: 'cheat-space-row' },
    h('b', null, entry.label), h('span', { class: 'muted small' }, entry.note)))
  return h('section', { id: 'space', class: 'card cheat-card' },
    cardHead('Space reminders', 'green'),
    h('div', { class: 'stack-sm' }, rows))
}

function buildSignalsSection() {
  const rows = signalRows.map(([signal, pattern]) => row('red', searchKey([signal, pattern]), { class: 'cheat-signal-row' },
    h('span', { class: 'cheat-signal-text' }, signal),
    h('span', { class: 'cheat-signal-arrow' }, '→'),
    h('span', { class: 'pill pill-red' }, pattern)))
  return h('section', { id: 'signals', class: 'card cheat-card' },
    cardHead('Signal words → pattern', 'red'),
    h('div', { class: 'cheat-signal-list' }, rows))
}

function buildQuizItems(count) {
  const pool = [...constraintRows]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  const picked = pool.slice(0, Math.min(count, pool.length))
  return picked.map((entry, index) => {
    const distractors = constraintRows.filter(other => other !== entry).map(other => other.target)
    for (let i = distractors.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[distractors[i], distractors[j]] = [distractors[j], distractors[i]]
    }
    return {
      id: `cheatsheet:quiz:${index}:${Math.floor(Math.random() * 1e6)}`,
      q: `${entry.n} → target complexity?`,
      choices: [entry.target, ...distractors.slice(0, 3)],
      answer: 0,
      why: entry.note,
    }
  })
}

function renderQuiz(host, onClose) {
  let items = buildQuizItems(6)
  let index = 0
  let score = 0

  function draw() {
    clear(host)
    if (index >= items.length) {
      host.append(h('div', { class: 'card cheat-quiz-card' },
        h('div', { class: 'row spread' }, h('h3', null, 'Quiz done'), h('span', { class: 'pill pill-teal' }, `${score}/${items.length}`)),
        h('div', { class: 'row' },
          h('button', { class: 'btn btn-primary', onclick: () => { items = buildQuizItems(6); index = 0; score = 0; draw() } }, 'Again'),
          h('button', { class: 'btn btn-ghost', onclick: onClose }, 'Close'))))
      return
    }
    const item = items[index]
    host.append(h('div', { class: 'card cheat-quiz-card' },
      h('div', { class: 'row spread' }, h('span', { class: 'muted small' }, `${index + 1} / ${items.length}`), h('span', { class: 'pill' }, `${score} correct`)),
      renderMcq(item, ({ correct, ms }) => {
        try { recordAnswer({ itemId: item.id, kind: 'mcq', skills: ['constraints'], correct, ms }) } catch {}
        if (correct) score += 1
        setTimeout(() => { index += 1; draw() }, correct ? 500 : 1300)
      })))
  }
  draw()
}

function applyFilter(root, query) {
  const q = query.trim().toLowerCase()
  for (const card of root.querySelectorAll('.cheat-card')) {
    let anyVisible = false
    const rows = card.querySelectorAll('.cheat-row')
    if (!rows.length) continue
    for (const el of rows) {
      const hit = !q || (el.dataset.k || '').includes(q)
      el.classList.toggle('is-hidden', !hit)
      if (hit) anyVisible = true
    }
    card.classList.toggle('is-hidden', Boolean(q) && !anyVisible)
  }
}

export default function render(container) {
  clear(container)

  const quizHost = h('div', { class: 'cheat-quiz-host' })
  let quizOpen = false
  const quizButton = h('button', { class: 'btn btn-primary', onclick: () => {
    quizOpen = !quizOpen
    quizButton.textContent = quizOpen ? 'Close quiz' : 'Quiz me'
    clear(quizHost)
    if (quizOpen) renderQuiz(quizHost, () => { quizOpen = false; quizButton.textContent = 'Quiz me'; clear(quizHost) })
  } }, 'Quiz me')

  const searchInput = h('input', {
    class: 'filter-search cheat-search', type: 'search', placeholder: 'Filter everything on this page…',
    oninput: event => applyFilter(page, event.target.value),
  })

  const chips = h('div', { class: 'row-wrap cheat-chips' }, sections.map(section => h('a', { class: 'chip cheat-chip', href: `#/cheatsheet`, style: { '--dot': `var(--${section.tone})` }, onclick: event => {
    event.preventDefault()
    document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } }, h('i', { class: 'cheat-chip-dot' }), section.label)))

  const toolbar = h('div', { class: 'cheat-toolbar' }, searchInput, chips, quizButton)

  const page = h('div', { class: 'page cheat-page' },
    h('div', { class: 'page-header' },
      h('div', null, h('h1', null, 'Cheat sheet'), h('p', { class: 'muted' }, 'Scan it in 5 seconds. Click any row to copy. Printable.')),
      ),
    toolbar,
    quizHost,
    buildConstraintsSection(),
    buildLadderSection(),
    buildPyOpsSection(),
    buildAlgoSection(),
    buildSpaceSection(),
    buildSignalsSection())

  container.append(page)
  return null
}
