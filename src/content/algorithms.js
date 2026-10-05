const clone = value => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)))

const lineFinder = code => {
  const lines = code.split('\n')
  return (needle, nth = 1) => {
    let seen = 0
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(needle)) {
        seen++
        if (seen === nth) return i + 1
      }
    }
    throw new Error(`line not found: ${needle} (#${nth})`)
  }
}

const once = () => {
  const used = new Set()
  return (key, text) => {
    if (used.has(key)) return undefined
    used.add(key)
    return text
  }
}

const lessThan = (a, b) => {
  if (Array.isArray(a) && Array.isArray(b)) {
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      if (a[i] < b[i]) return true
      if (a[i] > b[i]) return false
    }
    return a.length < b.length
  }
  return a < b
}

const siftDown = (heap, startpos, pos) => {
  const newitem = heap[pos]
  while (pos > startpos) {
    const parentpos = (pos - 1) >> 1
    const parent = heap[parentpos]
    if (lessThan(newitem, parent)) {
      heap[pos] = parent
      pos = parentpos
      continue
    }
    break
  }
  heap[pos] = newitem
}

const siftUp = (heap, pos) => {
  const endpos = heap.length
  const startpos = pos
  const newitem = heap[pos]
  let childpos = 2 * pos + 1
  while (childpos < endpos) {
    const rightpos = childpos + 1
    if (rightpos < endpos && !lessThan(heap[childpos], heap[rightpos])) childpos = rightpos
    heap[pos] = heap[childpos]
    pos = childpos
    childpos = 2 * pos + 1
  }
  heap[pos] = newitem
  siftDown(heap, startpos, pos)
}

const heappush = (heap, item) => {
  heap.push(item)
  siftDown(heap, 0, heap.length - 1)
}

const heappop = heap => {
  const last = heap.pop()
  if (heap.length) {
    const top = heap[0]
    heap[0] = last
    siftUp(heap, 0)
    return top
  }
  return last
}

const heapify = heap => {
  for (let i = (heap.length >> 1) - 1; i >= 0; i--) siftUp(heap, i)
}

const buildTree = values => {
  if (!values || !values.length || values[0] === null) return null
  const nodes = values.map((val, i) => (val === null ? null : { id: `n${i}`, val, left: null, right: null }))
  const root = nodes[0]
  const queue = [root]
  let i = 1
  while (queue.length && i < values.length) {
    const node = queue.shift()
    if (i < values.length) {
      node.left = nodes[i]
      if (nodes[i]) queue.push(nodes[i])
      i++
    }
    if (i < values.length) {
      node.right = nodes[i]
      if (nodes[i]) queue.push(nodes[i])
      i++
    }
  }
  return root
}

const findVal = (node, val) => {
  if (!node) return null
  if (node.val === val) return node
  return findVal(node.left, val) || findVal(node.right, val)
}

const fmt = x => (x === Infinity ? '∞' : x === -Infinity ? '-∞' : x === null || x === undefined ? 'None' : x === true ? 'True' : x === false ? 'False' : x)

const circleLayout = ids => {
  const pos = {}
  const n = ids.length
  ids.forEach((id, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / n
    pos[id] = [Math.round((0.5 + 0.4 * Math.cos(angle)) * 100) / 100, Math.round((0.5 + 0.4 * Math.sin(angle)) * 100) / 100]
  })
  return pos
}

const ek = (u, v) => `${u}->${v}`

const P = {
  array: (label, values, opts = {}) => ({ kind: 'array', label, values: clone(values), pointers: { ...(opts.pointers || {}) }, highlight: [...(opts.highlight || [])], ...(opts.window ? { window: [...opts.window] } : {}), dim: [...(opts.dim || [])], ...(opts.sorted ? { sorted: true } : {}) }),
  hashmap: (label, entries, highlight = []) => ({ kind: 'hashmap', label, entries: clone(entries instanceof Map ? [...entries.entries()] : Array.isArray(entries) ? entries : Object.entries(entries)), highlight: clone(highlight) }),
  set: (label, items, highlight = []) => ({ kind: 'set', label, items: clone([...items]), highlight: clone(highlight) }),
  stack: (label, items, highlight = []) => ({ kind: 'stack', label, items: clone(items), highlight: [...highlight] }),
  queue: (label, items, highlight = []) => ({ kind: 'queue', label, items: clone(items), highlight: [...highlight] }),
  heap: (label, items, highlight = []) => ({ kind: 'heap', label, items: clone(items), highlight: [...highlight] }),
  calls: (frames, label = 'call stack') => ({ kind: 'callstack', label, frames: [...frames] }),
  table: (label, rows, opts = {}) => ({ kind: 'table', label, rows: clone(rows).map(row => row.map(fmt)), ...(opts.rowLabels ? { rowLabels: clone(opts.rowLabels) } : {}), ...(opts.colLabels ? { colLabels: clone(opts.colLabels) } : {}), highlight: [...(opts.highlight || [])], deps: [...(opts.deps || [])] }),
  grid: (label, cells, state = {}, values = {}) => ({ kind: 'grid', label, cells: clone(cells), state: { ...state }, values: { ...values } }),
  tree: (label, root, state = {}, pointers = {}, values = {}) => ({ kind: 'tree', label, root: root ? clone(root) : null, state: { ...state }, pointers: { ...pointers }, values: { ...values } }),
  list: (label, nodes, pointers = {}, highlight = [], cycleTo) => ({ kind: 'linkedlist', label, nodes: clone(nodes), pointers: { ...pointers }, highlight: [...highlight], ...(cycleTo !== undefined ? { cycleTo } : {}) }),
  intervals: (label, intervals, highlight = [], merged) => ({ kind: 'intervals', label, intervals: clone(intervals), highlight: [...highlight], ...(merged ? { merged: clone(merged) } : {}) }),
  text: text => ({ kind: 'text', text: String(text) }),
  ops: (n, ops) => ({ kind: 'complexity', n, ops }),
  graph: (label, g, state = {}, edgeState = {}, values = {}) => {
    const ids = g.nodes.map(String)
    const pos = g.pos || circleLayout(ids)
    return {
      kind: 'graph',
      label,
      directed: !!g.directed,
      nodes: ids.map(id => ({ id, label: g.labels?.[id] ?? id, ...(pos[id] ? { x: pos[id][0], y: pos[id][1] } : {}) })),
      edges: g.edges.map(([from, to, w]) => ({ from: String(from), to: String(to), ...(w !== undefined ? { w } : {}) })),
      state: { ...state },
      edgeState: { ...edgeState },
      values: clone(values),
    }
  },
}

const specs = []
const def = spec => specs.push(spec)


def({
  slug: 'binary-search',
  title: 'Binary search',
  branch: 'searching',
  tier: 1,
  skills: ['binary-search'],
  prereqs: [],
  oneLiner: 'Halve a sorted range each step until the target appears.',
  whenToUse: ['sorted array', 'find target in O(log n)', 'n up to 10^9 or values huge', 'rotated sorted array'],
  notWhen: ['unsorted data with one lookup: just scan', 'need all matches: use bounds', 'linked list (no random access)'],
  mnemonic: 'Phone book: open the middle, rip away the wrong half. L ≤ R, mid ± 1.',
  steps: ['left, right = 0, n - 1', 'while left <= right', 'mid = (left + right) // 2', 'hit → return mid', 'too small → left = mid + 1', 'too big → right = mid - 1'],
  template: `class Solution:
    def search(self, nums: List[int], target: int) -> int:
        left, right = 0, len(nums) - 1

        while left <= right:
            mid = (left + right) // 2

            if nums[mid] == target:
                return mid
            elif nums[mid] < target:
                left = mid + 1
            else:
                right = mid - 1

        return -1`,
  time: 'O(log n)',
  space: 'O(1)',
  whyComplexity: 'Each comparison halves the search range: n → n/2 → … → 1 is log n steps.',
  variants: ['Search rotated sorted array (LC 33)', 'Find min in rotated array (LC 153)', 'Search 2-D matrix (LC 74)', 'Peak element (LC 162)'],
  relatedLc: [704, 33, 153, 74, 162],
  compare: [['bounds', 'Bounds find the first/last position, not any match'], ['two-pointers', 'Two pointers walk inward linearly, O(n)']],
  problem: 'Return the index of target in a sorted array, or -1.',
  inputs: [
    { label: 'found', value: { nums: [-1, 0, 3, 5, 9, 12, 15, 21, 26, 30, 34, 41, 47, 52, 60], target: 47 } },
    { label: 'missing', value: { nums: [1, 4, 6, 8, 10, 13, 17], target: 7 } },
    { label: 'first item', value: { nums: [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32], target: 2 } },
  ],
  run({ nums, target }, t, L) {
    const say = once()
    let left = 0
    let right = nums.length - 1
    const panels = (mid, hit = []) => {
      const dim = nums.map((_, i) => i).filter(i => i < left || i > right)
      const pointers = { left, right }
      if (mid !== undefined) pointers.mid = mid
      return [P.array('nums', nums, { pointers, window: left <= right ? [left, right] : undefined, dim, highlight: hit, sorted: true }), P.text(`target = ${target}`)]
    }
    t.step(L('left, right = 0'), { vars: { left, right, target }, panels: panels(), note: 'Search space = whole array', say: say('a', 'Sorted input, so I can binary search: O(log n) instead of a linear scan.') })
    while (left <= right) {
      t.step(L('while left <= right'), { vars: { left, right }, panels: panels(), note: `Range [${left}, ${right}] still non-empty` })
      const mid = Math.floor((left + right) / 2)
      t.step(L('mid = (left'), { vars: { left, right, mid, 'nums[mid]': nums[mid] }, panels: panels(mid, [mid]), note: `Probe the middle: nums[${mid}] = ${nums[mid]}`, say: say('mid', 'I check the middle so each comparison throws away half.') })
      if (nums[mid] === target) {
        t.step(L('return mid'), { vars: { mid }, panels: panels(mid, [mid]), note: `Found ${target} at index ${mid}`, say: 'Found it. O(log n) time, O(1) space.' })
        return
      }
      if (nums[mid] < target) {
        left = mid + 1
        t.step(L('left = mid + 1'), { vars: { left, right, mid }, panels: panels(mid), note: `${nums[mid]} < ${target}: drop the left half`, say: say('left', 'Middle is too small, so the answer can only be to its right. mid + 1 avoids an infinite loop.') })
      } else {
        right = mid - 1
        t.step(L('right = mid - 1'), { vars: { left, right, mid }, panels: panels(mid), note: `${nums[mid]} > ${target}: drop the right half`, say: say('right', 'Middle is too big, so I keep only the left part.') })
      }
    }
    t.step(L('return -1'), { vars: { left, right }, panels: panels(), note: 'Range empty: target absent', say: 'Pointers crossed, so the target is not here. Return -1.' })
  },
  blanks: ['left <= right', ['(left + right) // 2', 'left + (right - left) // 2', '(right - left) // 2 + left'], 'mid + 1', 'mid - 1'],
  distractors: ['while left < right:', 'left = mid'],
})

def({
  slug: 'bounds',
  title: 'Lower / upper bound',
  branch: 'searching',
  tier: 1,
  skills: ['binary-search'],
  prereqs: ['binary-search'],
  oneLiner: 'First index where nums[i] >= target (lower) or > target (upper).',
  whenToUse: ['first or last occurrence', 'insert position', 'count of values in a range', 'sorted with duplicates'],
  notWhen: ['any match is fine: plain binary search', 'unsorted input'],
  mnemonic: 'Half-open [L, R): shrink R onto the answer. Lower uses <, upper uses <=. bisect_left / bisect_right.',
  steps: ['left, right = 0, n', 'while left < right', 'mid = (left + right) // 2', 'nums[mid] < target → left = mid + 1', 'else right = mid', 'return left'],
  template: `class Solution:
    def lowerBound(self, nums: List[int], target: int) -> int:
        left, right = 0, len(nums)

        while left < right:
            mid = (left + right) // 2

            if nums[mid] < target:
                left = mid + 1
            else:
                right = mid

        return left`,
  time: 'O(log n)',
  space: 'O(1)',
  whyComplexity: 'Same halving as binary search; the loop ends when left meets right.',
  variants: ['First and last position (LC 34): lower(t) and lower(t + 1) - 1', 'Search insert position (LC 35)', 'Count in range = upper(b) - lower(a)', 'Python: bisect.bisect_left / bisect_right'],
  relatedLc: [34, 35, 278, 981],
  compare: [['binary-search', 'Plain search stops at any match; bounds keep going to the boundary'], ['bs-on-answer', 'Same loop, but over a range of answers with a feasibility check']],
  problem: 'Return the first index i with nums[i] >= target (insert position).',
  inputs: [
    { label: 'duplicates', value: { nums: [1, 2, 2, 2, 3, 5, 8], target: 2 } },
    { label: 'absent', value: { nums: [1, 3, 5, 7, 9, 11], target: 6 } },
    { label: 'past end', value: { nums: [2, 4, 6], target: 9 } },
  ],
  run({ nums, target }, t, L) {
    const say = once()
    let left = 0
    let right = nums.length
    const panels = (mid, hit = []) => {
      const dim = nums.map((_, i) => i).filter(i => i < left || i >= right)
      const pointers = { left, right }
      if (mid !== undefined) pointers.mid = mid
      return [P.array('nums', nums, { pointers, window: left < right ? [left, right - 1] : undefined, dim, highlight: hit, sorted: true }), P.text(`target = ${target}   answer lives in [left, right]`)]
    }
    t.step(L('left, right = 0'), { vars: { left, right }, panels: panels(), note: 'right = n: the answer may be past the end', say: say('a', 'Half-open range. right starts at n because the insert spot can be the end.') })
    while (left < right) {
      t.step(L('while left < right'), { vars: { left, right }, panels: panels(), note: `Candidates [${left}, ${right}]` })
      const mid = Math.floor((left + right) / 2)
      t.step(L('mid = (left'), { vars: { mid, 'nums[mid]': nums[mid] }, panels: panels(mid, [mid]), note: `Probe nums[${mid}] = ${nums[mid]}` })
      if (nums[mid] < target) {
        left = mid + 1
        t.step(L('left = mid + 1'), { vars: { left, right }, panels: panels(mid), note: `${nums[mid]} < ${target}: answer is right of mid`, say: say('l', 'Strictly smaller means mid can never be the answer, so skip past it.') })
      } else {
        right = mid
        t.step(L('right = mid'), { vars: { left, right }, panels: panels(mid), note: `${nums[mid]} >= ${target}: mid might be the answer, keep it`, say: say('r', 'mid could be the first match, so right = mid, not mid - 1.') })
      }
    }
    t.step(L('return left'), { vars: { left }, panels: panels(undefined, left < nums.length ? [left] : []), note: `First index with value >= ${target} is ${left}`, say: 'left == right is the boundary. Upper bound: just change < to <=. O(log n).' })
  },
  blanks: ['len(nums)', 'left < right', 'left = mid + 1', ['right = mid', 'right=mid']],
})

def({
  slug: 'bs-on-answer',
  title: 'Binary search on the answer',
  branch: 'searching',
  tier: 1,
  skills: ['binary-search', 'constraints'],
  prereqs: ['bounds'],
  oneLiner: 'Binary search the smallest value that passes a monotonic check.',
  whenToUse: ['minimize the maximum / maximize the minimum', 'smallest speed / capacity / days that works', 'answer range up to 10^9', 'feasible(x) is monotonic'],
  notWhen: ['no monotonic yes/no check', 'small answer space: just try all'],
  mnemonic: 'Guess-the-number with a judge: too slow? go faster. Range [lo, hi], keep the first YES.',
  steps: ['left, right = min answer, max answer', 'while left < right', 'mid = (left + right) // 2', 'feasible(mid) → right = mid', 'else left = mid + 1', 'return left'],
  template: `class Solution:
    def minEatingSpeed(self, piles: List[int], h: int) -> int:
        left, right = 1, max(piles)

        while left < right:
            mid = (left + right) // 2
            hours = sum((p + mid - 1) // mid for p in piles)

            if hours <= h:
                right = mid
            else:
                left = mid + 1

        return left`,
  time: 'O(n log m)',
  space: 'O(1)',
  whyComplexity: 'log m guesses over the answer range m, each checked with an O(n) pass.',
  variants: ['Capacity to ship packages (LC 1011)', 'Split array largest sum (LC 410)', 'Minimum days to make bouquets (LC 1482)', 'Sqrt(x) (LC 69)'],
  relatedLc: [875, 1011, 410, 1482, 69],
  compare: [['bounds', 'Bounds search an array; this searches a numeric answer range'], ['dp-1d', 'DP builds answers; here we only test yes/no per guess']],
  problem: 'Koko eats piles at speed k per hour. Find the minimum k to finish in h hours.',
  inputs: [
    { label: 'h=8', value: { piles: [3, 6, 7, 11], h: 8 } },
    { label: 'tight h=5', value: { piles: [9, 4, 12, 6, 2], h: 5 } },
    { label: 'loose h=9', value: { piles: [9, 4, 12, 6, 2], h: 9 } },
  ],
  run({ piles, h }, t, L) {
    const say = once()
    const top = Math.max(...piles)
    const speeds = Array.from({ length: top }, (_, i) => i + 1)
    let left = 1
    let right = top
    const panels = (mid, hours) => [
      P.array('speed k', speeds, { pointers: mid ? { left: left - 1, mid: mid - 1, right: right - 1 } : { left: left - 1, right: right - 1 }, window: [left - 1, right - 1], dim: speeds.map((_, i) => i).filter(i => i < left - 1 || i > right - 1), highlight: mid ? [mid - 1] : [], sorted: true }),
      P.array('piles', piles, { highlight: [] }),
      P.text(mid ? `hours at k=${mid}: ${hours} (limit ${h})` : `limit h = ${h}`),
    ]
    t.step(L('left, right = 1'), { vars: { left, right }, panels: panels(), note: 'Answer is a speed between 1 and max pile', say: say('a', 'Faster speed never takes more hours, so feasibility is monotonic. I binary search the speed.') })
    while (left < right) {
      t.step(L('while left < right'), { vars: { left, right }, panels: panels(), note: `Speeds [${left}, ${right}] still possible` })
      const mid = Math.floor((left + right) / 2)
      t.step(L('mid = (left'), { vars: { mid }, panels: panels(mid, '?'), note: `Guess k = ${mid}` })
      const hours = piles.reduce((s, p) => s + Math.ceil(p / mid), 0)
      t.step(L('hours = sum'), { vars: { mid, hours }, panels: panels(mid, hours), note: `ceil(p / ${mid}) summed = ${hours} hours`, say: say('check', 'The check is O(n): ceiling divide each pile and sum.') })
      if (hours <= h) {
        right = mid
        t.step(L('right = mid'), { vars: { left, right }, panels: panels(mid, hours), note: `${hours} <= ${h}: k=${mid} works, try slower`, say: say('yes', 'Feasible, so mid might be the minimum. Keep it: right = mid.') })
      } else {
        left = mid + 1
        t.step(L('left = mid + 1'), { vars: { left, right }, panels: panels(mid, hours), note: `${hours} > ${h}: too slow, go faster`, say: say('no', 'Infeasible, so every speed up to mid fails. left = mid + 1.') })
      }
    }
    t.step(L('return left'), { vars: { answer: left }, panels: panels(), note: `Minimum speed = ${left}`, say: 'O(n log max(piles)) time, O(1) space.' })
  },
  blanks: ['1, max(piles)', ['hours <= h', 'hours<=h'], 'right = mid', 'left = mid + 1'],
})

def({
  slug: 'hashmap-lookup',
  title: 'Hashmap complement lookup',
  branch: 'linear',
  tier: 1,
  skills: ['arrays-hashing', 'ds-diagnosis'],
  prereqs: [],
  oneLiner: 'Store what you have seen; ask the map for what you need.',
  whenToUse: ['pair summing to target', 'seen before? / duplicates', 'O(n) instead of nested loops', 'count frequencies / group anagrams'],
  notWhen: ['sorted input and O(1) space wanted: two pointers', 'need ordering of keys: use sorting or heap'],
  mnemonic: 'Coat check: hand in num, ask "is my partner target - num already checked in?"',
  steps: ['seen = {}', 'for i, num in enumerate(nums)', 'need = target - num', 'need in seen → return pair', 'seen[num] = i'],
  template: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}

        for i, num in enumerate(nums):
            if target - num in seen:
                return [seen[target - num], i]
            seen[num] = i

        return []`,
  time: 'O(n)',
  space: 'O(n)',
  whyComplexity: 'One pass; each dict lookup and insert is O(1) on average.',
  variants: ['Group anagrams (LC 49)', 'Contains duplicate (LC 217)', 'Longest consecutive sequence (LC 128)', 'Top-k frequent with Counter (LC 347)'],
  relatedLc: [1, 49, 217, 128, 347],
  compare: [['two-pointers', 'Two pointers need sorted input but use O(1) space'], ['prefix-sum-hashmap', 'Same lookup trick, but on running prefix sums']],
  problem: 'Return indices of the two numbers that add to target.',
  inputs: [
    { label: 'basic', value: { nums: [2, 7, 11, 15, 1, 8], target: 16 } },
    { label: 'later pair', value: { nums: [3, 9, 4, 12, 2, 10, 6, 5], target: 11 } },
    { label: 'duplicates', value: { nums: [5, 1, 5, 9], target: 10 } },
  ],
  run({ nums, target }, t, L) {
    const say = once()
    const seen = new Map()
    const panels = (i, hitKey) => [
      P.array('nums', nums, { pointers: i !== undefined ? { i } : {}, highlight: i !== undefined ? [i] : [] }),
      P.hashmap('seen {num: index}', seen, hitKey !== undefined ? [hitKey] : []),
    ]
    t.step(L('seen = {}'), { vars: { target }, panels: panels(), note: 'Empty map: value → index', say: say('a', 'Brute force is O(n²). A dict lets me find each complement in O(1).') })
    for (let i = 0; i < nums.length; i++) {
      const num = nums[i]
      const need = target - num
      t.step(L('for i, num'), { vars: { i, num, need }, panels: panels(i), note: `num = ${num}, need ${need}` })
      if (seen.has(need)) {
        t.step(L('return [seen'), { vars: { i, num, need, 'seen[need]': seen.get(need) }, panels: panels(i, need), note: `${need} seen at ${seen.get(need)}: done`, say: 'Complement found. One pass, O(n) time and O(n) space.' })
        return
      }
      t.step(L('if target - num in seen'), { vars: { need }, panels: panels(i), note: `${need} not seen yet`, say: say('check', 'I check before inserting, so a number never pairs with itself.') })
      seen.set(num, i)
      t.step(L('seen[num] = i'), { vars: { num, i }, panels: panels(i, num), note: `Remember ${num} → ${i}` })
    }
    t.step(L('return []'), { vars: {}, panels: panels(), note: 'No pair' })
  },
  blanks: ['target - num in seen', 'seen[target - num], i', 'seen[num] = i'],
})

def({
  slug: 'two-pointers',
  title: 'Two pointers (opposite ends)',
  branch: 'linear',
  tier: 1,
  skills: ['two-pointers'],
  prereqs: [],
  oneLiner: 'Squeeze inward from both ends, moving the pointer that cannot win.',
  whenToUse: ['sorted array pair / triplet sum', 'palindrome check', 'container with most water', 'O(1) extra space'],
  notWhen: ['unsorted and indices must be kept: hashmap', 'contiguous window constraint: sliding window'],
  mnemonic: 'Two people walking toward each other: sum too small → left steps up; too big → right steps down.',
  steps: ['left, right = 0, n - 1', 'while left < right', 'total = a[left] + a[right]', 'hit → return', 'too small → left += 1', 'too big → right -= 1'],
  template: `class Solution:
    def twoSum(self, numbers: List[int], target: int) -> List[int]:
        left, right = 0, len(numbers) - 1

        while left < right:
            total = numbers[left] + numbers[right]

            if total == target:
                return [left + 1, right + 1]
            elif total < target:
                left += 1
            else:
                right -= 1

        return []`,
  time: 'O(n)',
  space: 'O(1)',
  whyComplexity: 'Each step moves one pointer inward; they meet after at most n moves.',
  variants: ['3Sum: sort + fix one + two pointers (LC 15)', 'Container with most water (LC 11)', 'Valid palindrome (LC 125)', 'Trapping rain water (LC 42)'],
  relatedLc: [167, 15, 11, 125, 42],
  compare: [['hashmap-lookup', 'Hashmap works unsorted, costs O(n) space'], ['sliding-window-variable', 'Window pointers both move right, not toward each other']],
  problem: 'Sorted array: return 1-indexed positions of two numbers summing to target.',
  inputs: [
    { label: 'basic', value: { numbers: [1, 3, 4, 6, 8, 9, 11, 15], target: 17 } },
    { label: 'ends', value: { numbers: [2, 7, 11, 15, 18, 20, 26], target: 25 } },
    { label: 'negatives', value: { numbers: [-7, -5, -2, 0, 3, 4, 9, 12], target: 13 } },
  ],
  run({ numbers, target }, t, L) {
    const say = once()
    let left = 0
    let right = numbers.length - 1
    const panels = (hit = []) => [
      P.array('numbers', numbers, { pointers: { left, right }, window: [left, right], dim: numbers.map((_, i) => i).filter(i => i < left || i > right), highlight: hit, sorted: true }),
      P.text(`target = ${target}`),
    ]
    t.step(L('left, right = 0'), { vars: { left, right }, panels: panels(), note: 'Pointers at both ends', say: say('a', 'Sorted input: moving left raises the sum, moving right lowers it.') })
    while (left < right) {
      const total = numbers[left] + numbers[right]
      t.step(L('total = numbers'), { vars: { left, right, total }, panels: panels([left, right]), note: `${numbers[left]} + ${numbers[right]} = ${total}` })
      if (total === target) {
        t.step(L('return [left + 1'), { vars: { answer: [left + 1, right + 1] }, panels: panels([left, right]), note: 'Hit the target', say: 'Found it. O(n) time, O(1) space.' })
        return
      }
      if (total < target) {
        left++
        t.step(L('left += 1'), { vars: { left, right, total }, panels: panels(), note: `${total} < ${target}: need bigger, move left`, say: say('l', 'Sum too small. The smallest value cannot pair with anything bigger than right, so drop it.') })
      } else {
        right--
        t.step(L('right -= 1'), { vars: { left, right, total }, panels: panels(), note: `${total} > ${target}: need smaller, move right`, say: say('r', 'Sum too big, so the largest value is useless now. Drop it.') })
      }
    }
    t.step(L('return []'), { vars: {}, panels: panels(), note: 'Pointers met: no pair' })
  },
  blanks: ['left < right', 'total < target', 'left += 1', 'right -= 1'],
})

def({
  slug: 'sliding-window-fixed',
  title: 'Sliding window (fixed size)',
  branch: 'linear',
  tier: 2,
  skills: ['sliding-window'],
  prereqs: ['two-pointers'],
  oneLiner: 'Slide a size-k window: add the new right, drop the old left.',
  whenToUse: ['every subarray of size k', 'max/avg of k consecutive', 'permutation in string (fixed length)', 'anagrams of p in s'],
  notWhen: ['window size varies with a condition: variable window', 'negative numbers with sum target: prefix sums'],
  mnemonic: 'Train window: one passenger boards at the front, one leaves at the back. Never recount.',
  steps: ['window = sum(nums[:k])', 'for right in range(k, n)', 'window += nums[right] - nums[right - k]', 'update result'],
  template: `class Solution:
    def maxSumK(self, nums: List[int], k: int) -> int:
        window = sum(nums[:k])
        result = window

        for right in range(k, len(nums)):
            window += nums[right] - nums[right - k]
            result = max(result, window)

        return result`,
  time: 'O(n)',
  space: 'O(1)',
  whyComplexity: 'Each element enters once and leaves once; update is O(1) per slide.',
  variants: ['Permutation in string (LC 567)', 'Find all anagrams (LC 438)', 'Max average subarray (LC 643)', 'Sliding window maximum needs a deque (LC 239)'],
  relatedLc: [643, 567, 438, 1456],
  compare: [['sliding-window-variable', 'Variable window grows and shrinks on a condition'], ['monotonic-deque', 'Deque needed when you want max/min of each window']],
  problem: 'Maximum sum of any k consecutive numbers.',
  inputs: [
    { label: 'k=3', value: { nums: [2, 1, 5, 1, 3, 2, 6, 1], k: 3 } },
    { label: 'k=2', value: { nums: [4, -1, 2, 7, -3, 5], k: 2 } },
    { label: 'k=4', value: { nums: [1, 1, 1, 9, 1, 1, 1, 1, 8], k: 4 } },
  ],
  run({ nums, k }, t, L) {
    const say = once()
    let window = nums.slice(0, k).reduce((a, b) => a + b, 0)
    let result = window
    const panels = (right, hl = []) => [
      P.array('nums', nums, { window: [right - k + 1, right], pointers: { left: right - k + 1, right }, highlight: hl }),
      P.text(`window = ${window}   best = ${result}`),
    ]
    t.step(L('window = sum'), { vars: { window }, panels: panels(k - 1), note: `First window sum = ${window}`, say: say('a', 'I build the first window once, then slide it in O(1) per step.') })
    t.step(L('result = window'), { vars: { window, result }, panels: panels(k - 1), note: 'Best so far = first window' })
    for (let right = k; right < nums.length; right++) {
      t.step(L('for right in range'), { vars: { right }, panels: panels(right - 1, [right]), note: `Next element ${nums[right]} enters` })
      window += nums[right] - nums[right - k]
      t.step(L('window += nums'), { vars: { right, window, added: nums[right], removed: nums[right - k] }, panels: panels(right, [right, right - k]), note: `+${nums[right]} −${nums[right - k]} → ${window}`, say: say('slide', 'Add the newcomer, subtract the one falling off. No re-summing.') })
      result = Math.max(result, window)
      t.step(L('result = max'), { vars: { window, result }, panels: panels(right), note: `best = ${result}` })
    }
    t.step(L('return result'), { vars: { result }, panels: panels(nums.length - 1), note: `Max k-sum = ${result}`, say: 'O(n) time, O(1) space.' })
  },
  blanks: ['sum(nums[:k])', ['range(k, len(nums))', 'range(k,len(nums))'], ['nums[right] - nums[right - k]', 'nums[right]-nums[right-k]']],
})

def({
  slug: 'sliding-window-variable',
  title: 'Sliding window (variable)',
  branch: 'linear',
  tier: 1,
  skills: ['sliding-window', 'arrays-hashing'],
  prereqs: ['sliding-window-fixed', 'hashmap-lookup'],
  oneLiner: 'Grow right always; shrink left while the window is invalid.',
  whenToUse: ['longest / shortest substring with a condition', 'at most k distinct', 'without repeating characters', 'minimum window containing'],
  notWhen: ['condition is not monotonic when shrinking', 'subarray sum = k with negatives: prefix hashmap'],
  mnemonic: 'Caterpillar: head always crawls forward, tail catches up only when the body breaks the rule.',
  steps: ['left = 0, state = set/Counter', 'for right in range(n)', 'while invalid: remove s[left], left += 1', 'add s[right]', 'result = max(result, right - left + 1)'],
  template: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        seen = set()
        left, result = 0, 0

        for right in range(len(s)):
            while s[right] in seen:
                seen.remove(s[left])
                left += 1

            seen.add(s[right])
            result = max(result, right - left + 1)

        return result`,
  time: 'O(n)',
  space: 'O(k)',
  whyComplexity: 'left and right each move at most n times total, so 2n steps; k = alphabet size.',
  variants: ['Longest repeating char replacement (LC 424)', 'Minimum window substring (LC 76)', 'At most k distinct chars (LC 340)', 'Min size subarray sum (LC 209)'],
  relatedLc: [3, 424, 76, 209, 340],
  compare: [['sliding-window-fixed', 'Fixed window never shrinks conditionally'], ['two-pointers', 'Opposite-end pointers move toward each other']],
  problem: 'Length of the longest substring without repeating characters.',
  inputs: [
    { label: 'abcabcbb', value: 'abcabcbb' },
    { label: 'pwwkew', value: 'pwwkew' },
    { label: 'dvdfa', value: 'dvdfa' },
  ],
  run(s, t, L) {
    const say = once()
    const chars = s.split('')
    const seen = new Set()
    let left = 0
    let result = 0
    const panels = (right, hl = []) => [
      P.array('s', chars, { window: right >= left ? [left, right] : undefined, pointers: right !== undefined ? { left, right } : { left }, highlight: hl }),
      P.set('seen', [...seen], hl.map(i => chars[i])),
      P.text(`best = ${result}`),
    ]
    t.step(L('seen = set()'), { vars: {}, panels: panels(), note: 'Window chars live in a set', say: say('a', 'Variable window: expand right, shrink left while there is a repeat.') })
    for (let right = 0; right < chars.length; right++) {
      t.step(L('for right in range'), { vars: { right, 's[right]': chars[right] }, panels: panels(right - 1, [right]), note: `Try to add '${chars[right]}'` })
      while (seen.has(chars[right])) {
        t.step(L('while s[right] in seen'), { vars: { left, right }, panels: panels(right - 1, [right]), note: `'${chars[right]}' already inside: shrink`, say: say('shrink', 'Duplicate inside the window, so I move left until it is gone.') })
        seen.delete(chars[left])
        t.step(L('seen.remove'), { vars: { removed: chars[left] }, panels: panels(right - 1, [left]), note: `Drop '${chars[left]}'` })
        left++
        t.step(L('left += 1'), { vars: { left }, panels: panels(right - 1), note: `left → ${left}` })
      }
      seen.add(chars[right])
      t.step(L('seen.add'), { vars: { left, right }, panels: panels(right, [right]), note: `Window '${chars.slice(left, right + 1).join('')}' is valid` })
      result = Math.max(result, right - left + 1)
      t.step(L('result = max'), { vars: { result, size: right - left + 1 }, panels: panels(right), note: `Length ${right - left + 1}, best ${result}` })
    }
    t.step(L('return result'), { vars: { result }, panels: panels(chars.length - 1), note: `Longest = ${result}`, say: 'Each index enters and leaves once: O(n) time, O(k) space for the set.' })
  },
  blanks: ['s[right] in seen', 'seen.remove(s[left])', 'right - left + 1'],
})

def({
  slug: 'prefix-sum',
  title: 'Prefix sum',
  branch: 'linear',
  tier: 1,
  skills: ['prefix-sum'],
  prereqs: [],
  oneLiner: 'Precompute running totals so any range sum is one subtraction.',
  whenToUse: ['many range-sum queries', 'sum of subarray i..j', 'immutable array', 'product except self (prefix × suffix)'],
  notWhen: ['array updates between queries: Fenwick / segment tree', 'single query: just loop'],
  mnemonic: 'Odometer: distance from mile i to j = reading at j+1 minus reading at i.',
  steps: ['prefix = [0]', 'append prefix[-1] + num', 'sum(l..r) = prefix[r + 1] - prefix[l]'],
  template: `class NumArray:

    def __init__(self, nums: List[int]):
        self.prefix = [0]

        for num in nums:
            self.prefix.append(self.prefix[-1] + num)

    def sumRange(self, left: int, right: int) -> int:
        return self.prefix[right + 1] - self.prefix[left]`,
  time: 'O(n) build, O(1) query',
  space: 'O(n)',
  whyComplexity: 'One pass to build; each query is two lookups and a subtraction.',
  variants: ['Product of array except self (LC 238)', '2-D prefix sums (LC 304)', 'Pivot index (LC 724)', 'Subarray sum equals k needs a hashmap (LC 560)'],
  relatedLc: [303, 304, 238, 724],
  compare: [['prefix-sum-hashmap', 'Add a hashmap of seen prefixes to count target sums'], ['sliding-window-fixed', 'Window handles one size; prefix answers any range']],
  problem: 'Answer sumRange(left, right) queries on a fixed array.',
  inputs: [
    { label: 'basic', value: { nums: [3, -2, 5, 1, 4], queries: [[1, 3], [0, 4], [2, 2]] } },
    { label: 'mixed', value: { nums: [-2, 0, 3, -5, 2, -1], queries: [[0, 2], [2, 5], [0, 5]] } },
  ],
  run({ nums, queries }, t, L) {
    const say = once()
    const prefix = [0]
    const panels = (opts = {}) => [
      P.array('nums', nums, { highlight: opts.numsHl || [], window: opts.window }),
      P.array('prefix', prefix, { highlight: opts.preHl || [], pointers: opts.prePtr || {} }),
    ]
    t.step(L('self.prefix = [0]'), { vars: {}, panels: panels(), note: 'prefix[0] = 0: sum of nothing', say: say('a', 'prefix[i] = sum of the first i numbers. The leading 0 avoids an edge case.') })
    nums.forEach((num, i) => {
      t.step(L('for num in nums'), { vars: { num }, panels: panels({ numsHl: [i] }), note: `Next number ${num}` })
      prefix.push(prefix[prefix.length - 1] + num)
      t.step(L('self.prefix.append'), { vars: { num, 'prefix[-1]': prefix[prefix.length - 1] }, panels: panels({ numsHl: [i], preHl: [prefix.length - 1] }), note: `${prefix[prefix.length - 2]} + ${num} = ${prefix[prefix.length - 1]}` })
    })
    for (const [left, right] of queries) {
      const answer = prefix[right + 1] - prefix[left]
      t.step(L('return self.prefix[right + 1]'), {
        vars: { left, right, answer },
        panels: panels({ window: [left, right], preHl: [right + 1, left], prePtr: { 'r+1': right + 1, l: left } }),
        note: `prefix[${right + 1}] − prefix[${left}] = ${prefix[right + 1]} − ${prefix[left]} = ${answer}`,
        say: say('q', 'Each query is O(1): total up to right minus total before left.'),
      })
    }
  },
  blanks: ['[0]', 'self.prefix[-1] + num', ['self.prefix[right + 1] - self.prefix[left]', 'self.prefix[right+1] - self.prefix[left]']],
})

def({
  slug: 'prefix-sum-hashmap',
  title: 'Prefix sum + hashmap',
  branch: 'linear',
  tier: 1,
  skills: ['prefix-sum', 'arrays-hashing'],
  prereqs: ['prefix-sum', 'hashmap-lookup'],
  oneLiner: 'Count earlier prefixes equal to current prefix minus k.',
  whenToUse: ['count subarrays with sum k', 'negative numbers allowed', 'longest subarray with sum / equal 0s and 1s', 'sum divisible by k'],
  notWhen: ['all positives and want longest/shortest: sliding window is simpler', 'need the subarrays themselves listed'],
  mnemonic: 'Two-sum on prefixes: prefix - k is the partner. Seed {0: 1} for subarrays starting at 0.',
  steps: ['count = Counter({0: 1})', 'for num: prefix += num', 'result += count[prefix - k]', 'count[prefix] += 1'],
  template: `class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        count = Counter({0: 1})
        prefix, result = 0, 0

        for num in nums:
            prefix += num
            result += count[prefix - k]
            count[prefix] += 1

        return result`,
  time: 'O(n)',
  space: 'O(n)',
  whyComplexity: 'One pass; each prefix is looked up and stored once in O(1).',
  variants: ['Contiguous array 0/1 (LC 525)', 'Subarray sums divisible by k (LC 974)', 'Continuous subarray sum (LC 523)', 'Path sum III on a tree (LC 437)'],
  relatedLc: [560, 525, 974, 523, 437],
  compare: [['sliding-window-variable', 'Window fails with negatives; prefix map does not'], ['hashmap-lookup', 'Same complement trick on values instead of prefixes']],
  problem: 'Count subarrays whose sum equals k.',
  inputs: [
    { label: 'k=3', value: { nums: [1, 2, 1, 2, 1], k: 3 } },
    { label: 'negatives', value: { nums: [3, 4, 7, -2, 2, 1, 4, 2], k: 7 } },
    { label: 'zeros', value: { nums: [0, 0, 1, -1], k: 0 } },
  ],
  run({ nums, k }, t, L) {
    const say = once()
    const count = new Map([[0, 1]])
    let prefix = 0
    let result = 0
    const panels = (i, hl = []) => [
      P.array('nums', nums, { pointers: i !== undefined ? { i } : {}, highlight: i !== undefined ? [i] : [] }),
      P.hashmap('count {prefix: times}', count, hl),
      P.text(`prefix = ${prefix}   result = ${result}`),
    ]
    t.step(L('count = Counter'), { vars: { k }, panels: panels(undefined, [0]), note: 'Seed {0: 1}: empty prefix', say: say('a', 'sum(i..j) = prefix[j] − prefix[i−1]. So I count earlier prefixes equal to prefix − k.') })
    nums.forEach((num, i) => {
      prefix += num
      t.step(L('prefix += num'), { vars: { num, prefix }, panels: panels(i), note: `prefix = ${prefix}` })
      const add = count.get(prefix - k) || 0
      result += add
      t.step(L('result += count'), { vars: { 'prefix - k': prefix - k, found: add, result }, panels: panels(i, [prefix - k]), note: add ? `${add} earlier prefix(es) = ${prefix - k}: +${add}` : `No prefix ${prefix - k} yet`, say: add ? say('hit', 'Each earlier prefix equal to prefix − k marks the start of a subarray summing to k.') : undefined })
      count.set(prefix, (count.get(prefix) || 0) + 1)
      t.step(L('count[prefix] += 1'), { vars: { prefix }, panels: panels(i, [prefix]), note: `Record prefix ${prefix}` })
    })
    t.step(L('return result'), { vars: { result }, panels: panels(), note: `${result} subarrays sum to ${k}`, say: 'O(n) time, O(n) space. Works with negatives, unlike sliding window.' })
  },
  blanks: ['Counter({0: 1})', 'count[prefix - k]', 'count[prefix] += 1'],
})

def({
  slug: 'kadane',
  title: "Kadane's max subarray",
  branch: 'linear',
  tier: 1,
  skills: ['dp-1d', 'arrays-hashing'],
  prereqs: ['prefix-sum'],
  oneLiner: 'Extend the running sum or restart at the current number.',
  whenToUse: ['maximum sum contiguous subarray', 'best time to buy and sell once', 'max circular subarray', 'O(n) single pass'],
  notWhen: ['non-contiguous picks: that is just positives or DP', 'need count of subarrays with sum k: prefix hashmap'],
  mnemonic: 'Bad baggage? Drop it. If carrying the past hurts, start fresh at num.',
  steps: ['result = nums[0], curr = 0', 'for num in nums', 'curr = max(curr + num, num)', 'result = max(result, curr)'],
  template: `class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        result, curr = nums[0], 0

        for num in nums:
            curr = max(curr + num, num)
            result = max(result, curr)

        return result`,
  time: 'O(n)',
  space: 'O(1)',
  whyComplexity: 'One pass with two running numbers; best-ending-here only depends on the previous one.',
  variants: ['Max product subarray: track min too (LC 152)', 'Best time to buy and sell stock (LC 121)', 'Max circular subarray (LC 918)'],
  relatedLc: [53, 152, 121, 918],
  compare: [['prefix-sum', 'Prefix sums answer fixed ranges; Kadane finds the best one'], ['dp-1d', 'Kadane is 1-D DP with O(1) memory']],
  problem: 'Largest sum of a non-empty contiguous subarray.',
  inputs: [
    { label: 'classic', value: [-2, 1, -3, 4, -1, 2, 1, -5, 4] },
    { label: 'all negative', value: [-3, -1, -4, -2] },
    { label: 'restart', value: [5, -9, 6, -2, 3] },
  ],
  run(nums, t, L) {
    const say = once()
    let result = nums[0]
    let curr = 0
    let start = 0
    let bestRange = [0, 0]
    const panels = i => [
      P.array('nums', nums, { pointers: i !== undefined ? { i } : {}, window: i !== undefined ? [start, i] : bestRange, highlight: i !== undefined ? [i] : [] }),
      P.text(`curr = ${curr}   result = ${result}   best = nums[${bestRange[0]}..${bestRange[1]}]`),
    ]
    t.step(L('result, curr ='), { vars: { result, curr }, panels: panels(), note: 'result starts at nums[0] for all-negative input', say: say('a', 'curr = best sum of a subarray ending here. Either extend it or restart.') })
    nums.forEach((num, i) => {
      t.step(L('for num in nums'), { vars: { num, curr }, panels: panels(i), note: `num = ${num}` })
      const extend = curr + num
      if (num > extend) start = i
      curr = Math.max(extend, num)
      t.step(L('curr = max'), { vars: { 'curr + num': extend, num, curr }, panels: panels(i), note: num > extend ? `Restart at ${num}: past was negative` : `Extend: ${curr}`, say: num > extend ? say('restart', 'The running sum went negative, so carrying it only hurts. Start fresh.') : undefined })
      if (curr > result) bestRange = [start, i]
      result = Math.max(result, curr)
      t.step(L('result = max'), { vars: { curr, result }, panels: panels(i), note: `best = ${result}` })
    })
    t.step(L('return result'), { vars: { result }, panels: panels(), note: `Max subarray sum = ${result}`, say: 'O(n) time, O(1) space.' })
  },
  blanks: [['nums[0], 0', "float('-inf'), 0"], ['max(curr + num, num)', 'max(num, curr + num)'], ['max(result, curr)', 'max(curr, result)']],
})


const slNodes = (values, nextOf) => values.map((val, i) => ({ id: `n${i}`, val, next: nextOf ? nextOf(i) : i + 1 < values.length ? `n${i + 1}` : null }))

def({
  slug: 'monotonic-stack',
  title: 'Monotonic stack',
  branch: 'stacks',
  tier: 1,
  skills: ['monotonic-stack', 'stack'],
  prereqs: [],
  oneLiner: 'Keep a sorted stack; each pop answers "next greater" for someone.',
  whenToUse: ['next greater / smaller element', 'days until a warmer temperature', 'largest rectangle in histogram', 'stock span'],
  notWhen: ['max of a sliding window: monotonic deque', 'global max/min only: one pass'],
  mnemonic: 'Bouncer line: a taller newcomer kicks out every shorter person, and tells them their answer.',
  steps: ['stack of indices, values decreasing', 'for i, x in enumerate(nums)', 'while stack and top < x: pop, answer it', 'push i', 'leftovers have no answer'],
  template: `class Solution:
    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:
        result = [0] * len(temperatures)
        stack = []

        for i, temp in enumerate(temperatures):
            while stack and temperatures[stack[-1]] < temp:
                prev = stack.pop()
                result[prev] = i - prev
            stack.append(i)

        return result`,
  time: 'O(n)',
  space: 'O(n)',
  whyComplexity: 'Each index is pushed once and popped at most once, so 2n stack operations total.',
  variants: ['Next greater element I/II (LC 496, 503)', 'Largest rectangle in histogram (LC 84)', 'Online stock span (LC 901)', 'Trapping rain water (LC 42)'],
  relatedLc: [739, 496, 503, 84, 901],
  compare: [['monotonic-deque', 'Deque also pops from the front when items leave the window'], ['two-pointers', 'Two pointers scan linearly without remembering pending items']],
  problem: 'For each day, how many days until a warmer temperature (0 if never).',
  inputs: [
    { label: 'classic', value: [73, 74, 75, 71, 69, 72, 76, 73] },
    { label: 'falling', value: [60, 55, 50, 45, 70] },
    { label: 'zigzag', value: [30, 40, 35, 50, 45, 60, 20] },
  ],
  run(temps, t, L) {
    const say = once()
    const result = temps.map(() => 0)
    const stack = []
    const panels = (i, hl = []) => [
      P.array('temperatures', temps, { pointers: i !== undefined ? { i } : {}, highlight: hl, dim: [] }),
      P.stack('stack (indices, temps falling)', stack.map(j => `${j}:${temps[j]}`), stack.length ? [stack.length - 1] : []),
      P.array('result', result, { highlight: hl.filter(j => j !== i) }),
    ]
    t.step(L('result = [0]'), { vars: {}, panels: panels(), note: 'Default answer 0: no warmer day', say: say('a', 'Brute force is O(n²). A stack of unresolved days gives O(n).') })
    t.step(L('stack = []'), { vars: {}, panels: panels(), note: 'Stack holds days still waiting' })
    temps.forEach((temp, i) => {
      t.step(L('for i, temp'), { vars: { i, temp }, panels: panels(i, [i]), note: `Day ${i}: ${temp}°` })
      while (stack.length && temps[stack[stack.length - 1]] < temp) {
        t.step(L('while stack and'), { vars: { i, temp, top: temps[stack[stack.length - 1]] }, panels: panels(i, [i, stack[stack.length - 1]]), note: `${temp} beats waiting ${temps[stack[stack.length - 1]]}`, say: say('pop', 'The new day is warmer than the top, so the top finally has its answer.') })
        const prev = stack.pop()
        result[prev] = i - prev
        t.step(L('result[prev] = i - prev'), { vars: { prev, wait: i - prev }, panels: panels(i, [i, prev]), note: `Day ${prev} waits ${i - prev}` })
      }
      stack.push(i)
      t.step(L('stack.append(i)'), { vars: { i, stack: [...stack] }, panels: panels(i, [i]), note: `Day ${i} now waits`, say: say('push', 'Stack stays decreasing: every day below the top is warmer than it.') })
    })
    t.step(L('return result'), { vars: { result: [...result] }, panels: panels(), note: 'Leftovers never got warmer: 0', say: 'Each index pushed and popped once: O(n) time, O(n) space.' })
  },
  blanks: ['temperatures[stack[-1]] < temp', 'stack.pop()', 'i - prev', 'stack.append(i)'],
  distractors: ['while stack and temperatures[stack[-1]] > temp:', 'stack.append(temp)'],
})

def({
  slug: 'monotonic-deque',
  title: 'Monotonic deque',
  branch: 'stacks',
  tier: 2,
  skills: ['queue-deque', 'sliding-window', 'monotonic-stack'],
  prereqs: ['monotonic-stack', 'sliding-window-fixed'],
  oneLiner: 'Deque of indices with decreasing values; front is the window max.',
  whenToUse: ['max or min of every window of size k', 'sliding window maximum', 'shortest subarray with sum ≥ k', 'jump game with window'],
  notWhen: ['window sum only: plain sliding window', 'no window, just next greater: monotonic stack'],
  mnemonic: 'Kings queue: weaker newcomers wait behind, stronger ones evict the back; old kings retire from the front.',
  steps: ['while back value < new: pop back', 'append right', 'if front left the window: popleft', 'once window full: record nums[front]'],
  template: `from collections import deque

class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:
        queue = deque()
        result = []

        for right in range(len(nums)):
            while queue and nums[queue[-1]] < nums[right]:
                queue.pop()
            queue.append(right)

            if queue[0] <= right - k:
                queue.popleft()
            if right >= k - 1:
                result.append(nums[queue[0]])

        return result`,
  time: 'O(n)',
  space: 'O(k)',
  whyComplexity: 'Each index enters and leaves the deque at most once; deque never exceeds k items.',
  variants: ['Sliding window maximum (LC 239)', 'Shortest subarray with sum at least k (LC 862)', 'Constrained subsequence sum (LC 1425)', 'Longest subarray with |diff| ≤ limit (LC 1438)'],
  relatedLc: [239, 862, 1425, 1438],
  compare: [['monotonic-stack', 'Stack only pops from the back'], ['heap-top-k', 'Heap gives O(n log k) and needs lazy deletion']],
  problem: 'Return the max of every window of size k.',
  inputs: [
    { label: 'k=3', value: { nums: [1, 3, -1, -3, 5, 3, 6, 7], k: 3 } },
    { label: 'falling k=2', value: { nums: [9, 8, 7, 6, 5, 4], k: 2 } },
    { label: 'k=4', value: { nums: [4, 2, 12, 3, 1, 8, 6, 5, 9], k: 4 } },
  ],
  run({ nums, k }, t, L) {
    const say = once()
    const queue = []
    const result = []
    const panels = (right, hl = []) => [
      P.array('nums', nums, { pointers: right !== undefined ? { right } : {}, window: right !== undefined ? [Math.max(0, right - k + 1), right] : undefined, highlight: hl }),
      P.queue('deque (indices, values falling)', queue.map(j => `${j}:${nums[j]}`), queue.length ? [0] : []),
      P.array('result', result),
    ]
    t.step(L('queue = deque()'), { vars: { k }, panels: panels(), note: 'Deque stores candidate indices', say: say('a', 'The deque keeps only indices that could still become a window max, values decreasing.') })
    for (let right = 0; right < nums.length; right++) {
      t.step(L('for right in range'), { vars: { right, 'nums[right]': nums[right] }, panels: panels(right, [right]), note: `${nums[right]} enters` })
      while (queue.length && nums[queue[queue.length - 1]] < nums[right]) {
        const gone = queue.pop()
        t.step(L('queue.pop()'), { vars: { removed: nums[gone] }, panels: panels(right, [right, gone]), note: `${nums[gone]} < ${nums[right]}: never a max again`, say: say('pop', 'A smaller older value can never beat the newcomer, so it is useless. Pop it.') })
      }
      queue.push(right)
      t.step(L('queue.append(right)'), { vars: { right }, panels: panels(right, [right]), note: `Push index ${right}` })
      if (queue[0] <= right - k) {
        const old = queue.shift()
        t.step(L('queue.popleft()'), { vars: { expired: old }, panels: panels(right, [old]), note: `Index ${old} left the window`, say: say('expire', 'The front fell out of the window, so it retires from the left.') })
      }
      if (right >= k - 1) {
        result.push(nums[queue[0]])
        t.step(L('result.append'), { vars: { max: nums[queue[0]] }, panels: panels(right, [queue[0]]), note: `Window max = ${nums[queue[0]]}`, say: say('rec', 'Front of the deque is always the max of the current window.') })
      }
    }
    t.step(L('return result'), { vars: { result: [...result] }, panels: panels(), note: 'All window maxima', say: 'Each index pushed and popped once: O(n) time, O(k) space.' })
  },
  blanks: ['nums[queue[-1]] < nums[right]', 'queue[0] <= right - k', 'right >= k - 1', 'nums[queue[0]]'],
})

def({
  slug: 'fast-slow-pointers',
  title: 'Fast & slow pointers',
  branch: 'lists',
  tier: 1,
  skills: ['linked-list', 'two-pointers'],
  prereqs: ['two-pointers'],
  oneLiner: 'Slow steps 1, fast steps 2; meeting means a cycle.',
  whenToUse: ['linked list has a cycle', 'middle of a linked list', 'find duplicate number in O(1) space', 'happy number'],
  notWhen: ['random access array: use indices', 'O(n) extra space is fine and simpler: a seen set'],
  mnemonic: 'Tortoise and hare on a track: on a loop the hare laps the tortoise; on a road it hits the end.',
  steps: ['slow, fast = head, head', 'while fast and fast.next', 'slow = slow.next', 'fast = fast.next.next', 'slow == fast → cycle', 'fast hit None → no cycle'],
  template: `class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        slow, fast = head, head

        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next

            if slow == fast:
                return True

        return False`,
  time: 'O(n)',
  space: 'O(1)',
  whyComplexity: 'Inside a cycle the gap closes by one each step, so they meet within n steps.',
  variants: ['Middle of linked list (LC 876): return slow', 'Cycle start (LC 142): reset one to head, step both by 1', 'Find duplicate number (LC 287)', 'Happy number (LC 202)', 'Palindrome linked list (LC 234)'],
  relatedLc: [141, 142, 876, 287, 202],
  compare: [['hashmap-lookup', 'A seen set also works but costs O(n) space'], ['reverse-linked-list', 'Often combined: find middle, then reverse the second half']],
  problem: 'Does this linked list contain a cycle?',
  inputs: [
    { label: 'cycle to 1', value: { values: [3, 2, 0, -4, 7, 5], pos: 1 } },
    { label: 'no cycle', value: { values: [1, 2, 3, 4, 5, 6, 7], pos: -1 } },
    { label: 'big loop', value: { values: [1, 2, 3, 4, 5, 6, 7, 8], pos: 0 } },
  ],
  run({ values, pos }, t, L) {
    const say = once()
    const n = values.length
    const nodes = slNodes(values, i => (i + 1 < n ? `n${i + 1}` : pos >= 0 ? `n${pos}` : null))
    const nextOf = i => (i === null ? null : i + 1 < n ? i + 1 : pos >= 0 ? pos : null)
    const id = i => (i === null ? null : `n${i}`)
    let slow = 0
    let fast = 0
    const panels = (hl = []) => [
      P.list('list', nodes, { slow: id(slow), fast: id(fast) }, hl.map(id), pos >= 0 ? `n${pos}` : undefined),
      P.text(pos >= 0 ? `tail links back to index ${pos}` : 'tail → None'),
    ]
    t.step(L('slow, fast = head'), { vars: { slow: values[0], fast: values[0] }, panels: panels([0]), note: 'Both start at head', say: say('a', 'Floyd: slow moves one step, fast two. O(1) space instead of a seen set.') })
    let rounds = 0
    while (fast !== null && nextOf(fast) !== null) {
      t.step(L('while fast and fast.next'), { vars: {}, panels: panels(), note: 'Fast can still take two steps' })
      slow = nextOf(slow)
      t.step(L('slow = slow.next'), { vars: { slow: values[slow] }, panels: panels([slow]), note: `slow → ${values[slow]}` })
      fast = nextOf(nextOf(fast))
      t.step(L('fast = fast.next.next'), { vars: { fast: fast === null ? 'None' : values[fast] }, panels: panels(fast === null ? [] : [fast]), note: fast === null ? 'fast ran off the end' : `fast → ${values[fast]}`, say: say('gap', 'If there is a loop, fast gains one step per round, so it must catch slow.') })
      if (slow === fast) {
        t.step(L('return True'), { vars: { meet: values[slow] }, panels: panels([slow]), note: `Met at ${values[slow]}: cycle!`, say: 'They met, so there is a cycle. O(n) time, O(1) space.' })
        return
      }
      t.step(L('if slow == fast'), { vars: {}, panels: panels(), note: 'Not met yet' })
      if (++rounds > 40) break
    }
    t.step(L('return False'), { vars: {}, panels: panels(), note: 'fast reached the end: no cycle', say: say('end', 'Fast hit None, so the list ends. No cycle. O(n) time, O(1) space.') })
  },
  blanks: ['fast and fast.next', 'slow.next', 'fast.next.next', ['slow == fast', 'fast == slow', 'slow is fast']],
  distractors: ['while slow and slow.next:', 'fast = fast.next'],
})

def({
  slug: 'reverse-linked-list',
  title: 'Reverse a linked list',
  branch: 'lists',
  tier: 1,
  skills: ['linked-list'],
  prereqs: [],
  oneLiner: 'Walk once, flipping each next pointer back to prev.',
  whenToUse: ['reverse a list or a sublist', 'palindrome linked list', 'reorder list', 'reverse nodes in k-group'],
  notWhen: ['array: swap with two pointers', 'only need to read backwards: a stack is fine'],
  mnemonic: 'Save, flip, step, step: nxt = curr.next, curr.next = prev, prev = curr, curr = nxt.',
  steps: ['prev, curr = None, head', 'while curr', 'nxt = curr.next (save)', 'curr.next = prev (flip)', 'prev = curr; curr = nxt (advance)', 'return prev'],
  template: `class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        prev, curr = None, head

        while curr:
            nxt = curr.next
            curr.next = prev
            prev = curr
            curr = nxt

        return prev`,
  time: 'O(n)',
  space: 'O(1)',
  whyComplexity: 'Each node is visited once and its pointer flipped in place; only three variables.',
  variants: ['Reverse linked list II (LC 92)', 'Reorder list (LC 143)', 'Palindrome linked list (LC 234)', 'Reverse nodes in k-group (LC 25)'],
  relatedLc: [206, 92, 143, 234, 25],
  compare: [['fast-slow-pointers', 'Find the middle first, then reverse half'], ['two-pointers', 'Arrays reverse by swapping ends instead']],
  problem: 'Reverse a singly linked list and return the new head.',
  inputs: [
    { label: '5 nodes', value: [1, 2, 3, 4, 5] },
    { label: '2 nodes', value: [7, 9] },
    { label: '6 nodes', value: [10, 20, 30, 40, 50, 60] },
  ],
  run(values, t, L) {
    const say = once()
    const nodes = slNodes(values)
    let prev = null
    let curr = values.length ? 'n0' : null
    let nxt = null
    const byId = id => nodes.find(node => node.id === id)
    const panels = (hl = []) => {
      const pointers = { prev, curr }
      if (nxt !== null) pointers.nxt = nxt
      return [P.list('nodes', nodes, pointers, hl), P.text(`reversed so far: ${(() => { const out = []; let p = prev; while (p) { out.push(byId(p).val); p = byId(p).next } return out.join(' → ') || 'None' })()}`)]
    }
    t.step(L('prev, curr = None'), { vars: { prev: 'None', curr: values[0] }, panels: panels(curr ? [curr] : []), note: 'prev is the new list (empty)', say: say('a', 'Iterative, O(1) space: flip each next pointer while walking.') })
    while (curr) {
      t.step(L('while curr'), { vars: { curr: byId(curr).val }, panels: panels([curr]), note: `Process ${byId(curr).val}` })
      nxt = byId(curr).next
      t.step(L('nxt = curr.next'), { vars: { nxt: nxt ? byId(nxt).val : 'None' }, panels: panels([curr]), note: 'Save next before we lose it', say: say('save', 'I save curr.next first, otherwise flipping would cut off the rest of the list.') })
      byId(curr).next = prev
      t.step(L('curr.next = prev'), { vars: { 'curr.next': prev ? byId(prev).val : 'None' }, panels: panels([curr]), note: `${byId(curr).val} now points back`, say: say('flip', 'Flip: this node now points to the reversed part.') })
      prev = curr
      t.step(L('prev = curr'), { vars: { prev: byId(prev).val }, panels: panels([prev]), note: 'prev advances' })
      curr = nxt
      nxt = null
      t.step(L('curr = nxt'), { vars: { curr: curr ? byId(curr).val : 'None' }, panels: panels(curr ? [curr] : []), note: 'curr advances' })
    }
    t.step(L('return prev'), { vars: { head: prev ? byId(prev).val : 'None' }, panels: panels(prev ? [prev] : []), note: 'prev is the new head', say: 'curr is None, prev is the new head. O(n) time, O(1) space.' })
  },
  blanks: ['None, head', 'curr.next = prev', 'prev = curr', 'curr = nxt'],
  distractors: ['curr.next = nxt', 'return curr'],
})

def({
  slug: 'lru-cache',
  title: 'LRU cache',
  branch: 'lists',
  tier: 2,
  skills: ['linked-list', 'arrays-hashing', 'ds-diagnosis'],
  prereqs: ['hashmap-lookup', 'reverse-linked-list'],
  oneLiner: 'Hashmap for O(1) lookup plus recency order for O(1) eviction.',
  whenToUse: ['least recently used eviction', 'get and put in O(1)', 'cache with capacity', 'design a data structure'],
  notWhen: ['evict least frequently used: LFU needs freq buckets', 'no capacity limit: plain dict'],
  mnemonic: 'Fridge shelf: touch it, move it to the front; full? toss what is at the back.',
  steps: ['cache = OrderedDict()', 'get: missing → -1, else move_to_end', 'put: set value, move_to_end', 'over capacity → popitem(last=False)'],
  template: `from collections import OrderedDict

class LRUCache:

    def __init__(self, capacity: int):
        self.cache = OrderedDict()
        self.capacity = capacity

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key: int, value: int) -> None:
        self.cache[key] = value
        self.cache.move_to_end(key)

        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)`,
  time: 'O(1)',
  space: 'O(capacity)',
  whyComplexity: 'OrderedDict is a hashmap plus doubly linked list: lookup, move and pop are all O(1).',
  variants: ['Hand-rolled: dict of key → node + doubly linked list with dummy head/tail', 'LFU cache (LC 460)', 'Design hit counter (LC 362)'],
  relatedLc: [146, 460, 362],
  compare: [['hashmap-lookup', 'A plain dict has no recency order'], ['heap-top-k', 'A heap by timestamp would cost O(log n) per touch']],
  problem: 'Design get/put in O(1) that evicts the least recently used key.',
  inputs: [
    { label: 'cap 2', value: { capacity: 2, ops: [['put', 1, 1], ['put', 2, 2], ['get', 1], ['put', 3, 3], ['get', 2], ['put', 4, 4], ['get', 1], ['get', 3], ['get', 4]] } },
    { label: 'cap 3', value: { capacity: 3, ops: [['put', 1, 10], ['put', 2, 20], ['put', 3, 30], ['get', 1], ['put', 4, 40], ['get', 2], ['put', 3, 33], ['put', 5, 50], ['get', 1]] } },
  ],
  run({ capacity, ops }, t, L) {
    const say = once()
    const cache = new Map()
    const panels = (hl = [], text = '') => [
      P.queue('order: LRU (front) → MRU (back)', [...cache.keys()].map(key => `${key}:${cache.get(key)}`), hl.map(key => [...cache.keys()].indexOf(key)).filter(i => i >= 0)),
      P.hashmap('cache', [...cache.entries()], hl),
      P.text(`capacity = ${capacity}${text ? '   ' + text : ''}`),
    ]
    t.step(L('self.cache = OrderedDict()'), { vars: { capacity }, panels: panels(), note: 'OrderedDict = hashmap + linked list', say: say('a', 'I need O(1) lookup and O(1) recency updates: hashmap plus a doubly linked list. OrderedDict is both.') })
    for (const [op, key, value] of ops) {
      if (op === 'get') {
        if (!cache.has(key)) {
          t.step(L('return -1'), { vars: { key, returns: -1 }, panels: panels([], `get(${key}) → -1`), note: `get(${key}): miss` })
          continue
        }
        const val = cache.get(key)
        cache.delete(key)
        cache.set(key, val)
        t.step(L('self.cache.move_to_end(key)'), { vars: { key }, panels: panels([key], `get(${key})`), note: `Touch ${key}: now most recent`, say: say('touch', 'Reading a key makes it most recently used, so it moves to the back.') })
        t.step(L('return self.cache[key]'), { vars: { key, returns: val }, panels: panels([key], `get(${key}) → ${val}`), note: `Return ${val}` })
      } else {
        cache.set(key, value)
        t.step(L('self.cache[key] = value'), { vars: { key, value }, panels: panels([key], `put(${key}, ${value})`), note: `Store ${key} = ${value}` })
        cache.delete(key)
        cache.set(key, value)
        t.step(L('self.cache.move_to_end(key)', 2), { vars: { key }, panels: panels([key], `put(${key}, ${value})`), note: `${key} is most recent` })
        if (cache.size > capacity) {
          const lru = cache.keys().next().value
          t.step(L('if len(self.cache) > self.capacity'), { vars: { size: cache.size, capacity }, panels: panels([lru]), note: `Over capacity: evict front ${lru}` })
          cache.delete(lru)
          t.step(L('popitem(last=False)'), { vars: { evicted: lru }, panels: panels([], `evicted ${lru}`), note: `Evicted ${lru}`, say: say('evict', 'Over capacity, so I pop the front: the least recently used key.') })
        }
      }
    }
    t.step(L('def put'), { vars: { size: cache.size }, panels: panels(), note: 'All ops O(1)', say: 'Every get and put is O(1). Space O(capacity).' })
  },
  blanks: ['OrderedDict()', 'self.cache.move_to_end(key)', 'len(self.cache) > self.capacity', 'last=False'],
})

def({
  slug: 'merge-sort',
  title: 'Merge sort',
  branch: 'sorting',
  tier: 2,
  skills: ['complexity', 'two-pointers'],
  prereqs: [],
  oneLiner: 'Split in half, sort each half, merge two sorted lists.',
  whenToUse: ['stable O(n log n) sort', 'count inversions', 'sort a linked list', 'merge two sorted lists'],
  notWhen: ['need O(1) extra space: heapsort / in-place quicksort', 'just need kth element: quick select'],
  mnemonic: 'Divide the deck, sort small piles, zip piles back together by always taking the smaller top card.',
  steps: ['base: len ≤ 1 → return', 'mid = len // 2', 'sort left and right halves', 'two pointers: take smaller head', 'append leftovers'],
  template: `class Solution:
    def sortArray(self, nums: List[int]) -> List[int]:
        if len(nums) <= 1:
            return nums

        mid = len(nums) // 2
        left = self.sortArray(nums[:mid])
        right = self.sortArray(nums[mid:])

        result = []
        i, j = 0, 0

        while i < len(left) and j < len(right):
            if left[i] <= right[j]:
                result.append(left[i])
                i += 1
            else:
                result.append(right[j])
                j += 1

        return result + left[i:] + right[j:]`,
  time: 'O(n log n)',
  space: 'O(n)',
  whyComplexity: 'log n levels of halving, each level merges n items in total.',
  variants: ['Sort list (LC 148)', 'Merge two sorted lists (LC 21)', 'Count inversions / reverse pairs (LC 493)', 'Count of smaller numbers after self (LC 315)'],
  relatedLc: [912, 148, 21, 493, 315],
  compare: [['quicksort-partition', 'Quicksort is in-place but O(n²) worst case and unstable'], ['k-way-merge', 'Merges k lists at once with a heap']],
  problem: 'Sort an array with merge sort.',
  inputs: [
    { label: '6 items', value: [5, 2, 4, 6, 1, 3] },
    { label: '5 items', value: [38, 27, 43, 3, 9] },
    { label: 'dupes', value: [4, 1, 4, 2] },
  ],
  run(nums, t, L) {
    const say = once()
    const frames = []
    const run = arr => {
      frames.push(`sortArray([${arr.join(',')}])`)
      if (arr.length <= 1) {
        t.step(L('return nums'), { vars: { nums: [...arr] }, panels: [P.array('nums', arr), P.calls(frames)], note: 'Size ≤ 1 is already sorted', say: say('base', 'Base case: one element is sorted.') })
        frames.pop()
        return arr
      }
      const mid = Math.floor(arr.length / 2)
      t.step(L('mid = len(nums)'), { vars: { mid }, panels: [P.array('nums', arr, { pointers: { mid }, window: [0, mid - 1] }), P.calls(frames)], note: `Split [${arr.slice(0, mid)}] | [${arr.slice(mid)}]`, say: say('split', 'Divide: split in half until pieces are trivially sorted.') })
      const left = run(arr.slice(0, mid))
      const right = run(arr.slice(mid))
      const result = []
      let i = 0
      let j = 0
      const panels = hl => [
        P.array('left', left, { pointers: { i }, highlight: hl === 'l' ? [i] : [], sorted: true }),
        P.array('right', right, { pointers: { j }, highlight: hl === 'r' ? [j] : [], sorted: true }),
        P.array('result', result),
        P.calls(frames),
      ]
      t.step(L('result = []'), { vars: { left: [...left], right: [...right] }, panels: panels(), note: 'Both halves sorted: merge', say: say('merge', 'Conquer: merge two sorted halves with two pointers, always taking the smaller head.') })
      while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
          result.push(left[i])
          t.step(L('result.append(left[i])'), { vars: { i, j, took: left[i] }, panels: panels('l'), note: `${left[i]} ≤ ${right[j]}: take left` })
          i++
        } else {
          result.push(right[j])
          t.step(L('result.append(right[j])'), { vars: { i, j, took: right[j] }, panels: panels('r'), note: `${right[j]} < ${left[i]}: take right` })
          j++
        }
      }
      const merged = [...result, ...left.slice(i), ...right.slice(j)]
      t.step(L('return result + left'), { vars: { merged }, panels: [P.array('merged', merged, { sorted: true }), P.calls(frames)], note: `Append leftovers → [${merged}]` })
      frames.pop()
      return merged
    }
    const sorted = run(nums)
    t.step(L('return result + left'), { vars: { sorted }, panels: [P.array('sorted', sorted, { sorted: true })], note: 'Fully sorted', say: 'log n levels, O(n) merge work per level: O(n log n) time, O(n) space. Stable thanks to <=.' })
  },
  blanks: ['len(nums) // 2', 'left[i] <= right[j]', 'left[i:] + right[j:]'],
})

def({
  slug: 'quicksort-partition',
  title: 'Quicksort (Lomuto partition)',
  branch: 'sorting',
  tier: 2,
  skills: ['two-pointers', 'complexity'],
  prereqs: ['two-pointers'],
  oneLiner: 'Partition around a pivot, then recurse on both sides.',
  whenToUse: ['in-place sort', 'partition by a pivot / predicate', 'sort colors (Dutch flag)', 'move zeroes'],
  notWhen: ['need stability or guaranteed n log n: merge sort', 'only need kth element: quick select'],
  mnemonic: 'Pivot is the bouncer at the end: small fry go left of i, then the bouncer swaps into slot i.',
  steps: ['pivot = nums[high], i = low', 'for j in low..high-1: if nums[j] < pivot swap into i, i += 1', 'swap pivot into i', 'recurse left of i', 'recurse right of i'],
  template: `class Solution:
    def sortArray(self, nums: List[int]) -> List[int]:

        def partition(low, high):
            pivot = nums[high]
            i = low

            for j in range(low, high):
                if nums[j] < pivot:
                    nums[i], nums[j] = nums[j], nums[i]
                    i += 1

            nums[i], nums[high] = nums[high], nums[i]
            return i

        def quicksort(low, high):
            if low < high:
                p = partition(low, high)
                quicksort(low, p - 1)
                quicksort(p + 1, high)

        quicksort(0, len(nums) - 1)
        return nums`,
  time: 'O(n log n)',
  space: 'O(log n)',
  whyComplexity: 'Average split halves the array: log n levels of O(n) partitioning. Sorted input with last pivot → O(n²).',
  variants: ['Sort colors / Dutch national flag (LC 75)', 'Move zeroes (LC 283)', 'Kth largest via quick select (LC 215)', 'Randomize pivot to dodge O(n²)'],
  relatedLc: [912, 75, 283, 215],
  compare: [['merge-sort', 'Merge sort is stable, O(n) extra space, always n log n'], ['quick-select', 'Quick select recurses into only one side']],
  problem: 'Sort an array in place with quicksort.',
  inputs: [
    { label: '7 items', value: [7, 2, 1, 6, 8, 5, 4] },
    { label: '5 items', value: [3, 9, 1, 5, 2] },
    { label: 'dupes', value: [4, 2, 4, 1, 3] },
  ],
  run(nums, t, L) {
    const say = once()
    const frames = []
    const done = new Set()
    const panels = (opts = {}) => [
      P.array('nums', nums, { pointers: opts.pointers || {}, window: opts.window, highlight: opts.hl || [], dim: [...done].filter(k => !(opts.hl || []).includes(k)) }),
      P.calls(frames),
    ]
    const partition = (low, high) => {
      const pivot = nums[high]
      let i = low
      t.step(L('pivot = nums[high]'), { vars: { low, high, pivot }, panels: panels({ pointers: { i, high }, window: [low, high], hl: [high] }), note: `Pivot = ${pivot}`, say: say('pivot', 'Lomuto: pivot is the last element; i marks where the next small value goes.') })
      for (let j = low; j < high; j++) {
        if (nums[j] < pivot) {
          ;[nums[i], nums[j]] = [nums[j], nums[i]]
          t.step(L('nums[i], nums[j] = nums[j]'), { vars: { i, j, pivot }, panels: panels({ pointers: { i, j }, window: [low, high], hl: [i, j] }), note: `${nums[i]} < ${pivot}: swap into slot ${i}` })
          i++
        } else {
          t.step(L('if nums[j] < pivot'), { vars: { i, j, pivot }, panels: panels({ pointers: { i, j }, window: [low, high], hl: [j] }), note: `${nums[j]} ≥ ${pivot}: leave it` })
        }
      }
      ;[nums[i], nums[high]] = [nums[high], nums[i]]
      done.add(i)
      t.step(L('nums[i], nums[high] ='), { vars: { i, pivot }, panels: panels({ pointers: { i }, window: [low, high], hl: [i] }), note: `Pivot ${pivot} lands in final slot ${i}`, say: say('place', 'Everything left of i is smaller, right is bigger: the pivot is in its final spot.') })
      return i
    }
    const quicksort = (low, high) => {
      frames.push(`quicksort(${low}, ${high})`)
      if (low < high) {
        t.step(L('if low < high'), { vars: { low, high }, panels: panels({ window: [low, high] }), note: `Sort range [${low}, ${high}]` })
        const p = partition(low, high)
        quicksort(low, p - 1)
        quicksort(p + 1, high)
      } else if (low === high) {
        done.add(low)
      }
      frames.pop()
    }
    t.step(L('quicksort(0, len(nums) - 1)'), { vars: {}, panels: panels(), note: 'Sort the whole array', say: say('a', 'Quicksort: partition in place, then recurse on both sides.') })
    quicksort(0, nums.length - 1)
    t.step(L('return nums'), { vars: { nums: [...nums] }, panels: [P.array('nums', nums, { sorted: true })], note: 'Sorted in place', say: 'Average O(n log n), worst O(n²) on bad pivots. O(log n) stack space.' })
  },
  blanks: ['nums[high]', 'nums[j] < pivot', 'nums[i], nums[high] = nums[high], nums[i]', 'p - 1'],
})

def({
  slug: 'quick-select',
  title: 'Quick select',
  branch: 'sorting',
  tier: 2,
  skills: ['two-pointers', 'heap'],
  prereqs: ['quicksort-partition'],
  oneLiner: 'Partition, then keep only the side holding the kth index.',
  whenToUse: ['kth largest / smallest element', 'k closest points', 'median without full sort', 'average O(n) required'],
  notWhen: ['streaming data: heap', 'need all top k sorted: heap or sort', 'worst case must be guaranteed'],
  mnemonic: 'Quicksort that only chases one side: the pivot lands at index i; aim i at n - k.',
  steps: ['target = n - k', 'partition [low, high] around nums[high]', 'i == target → return', 'i < target → low = i + 1', 'else high = i - 1'],
  template: `class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        target = len(nums) - k
        low, high = 0, len(nums) - 1

        while True:
            pivot = nums[high]
            i = low

            for j in range(low, high):
                if nums[j] < pivot:
                    nums[i], nums[j] = nums[j], nums[i]
                    i += 1

            nums[i], nums[high] = nums[high], nums[i]

            if i == target:
                return nums[i]
            elif i < target:
                low = i + 1
            else:
                high = i - 1`,
  time: 'O(n)',
  space: 'O(1)',
  whyComplexity: 'Average halving: n + n/2 + n/4 + … = 2n. Bad pivots degrade to O(n²); randomize the pivot.',
  variants: ['K closest points to origin (LC 973)', 'Top k frequent (LC 347)', 'Wiggle sort II (LC 324)', 'Swap a random index into high first'],
  relatedLc: [215, 973, 347],
  compare: [['heap-top-k', 'Heap is O(n log k) worst case and streams'], ['quicksort-partition', 'Quicksort recurses into both sides']],
  problem: 'Return the kth largest element (average O(n)).',
  inputs: [
    { label: 'k=2', value: { nums: [3, 2, 1, 5, 6, 4], k: 2 } },
    { label: 'k=4', value: { nums: [3, 2, 3, 1, 2, 4, 5, 5, 6], k: 4 } },
    { label: 'k=1', value: { nums: [7, 10, 4, 3, 20, 15], k: 1 } },
  ],
  run({ nums, k }, t, L) {
    const say = once()
    const target = nums.length - k
    let low = 0
    let high = nums.length - 1
    const panels = (opts = {}) => [
      P.array('nums', nums, { pointers: { ...(opts.pointers || {}), target }, window: [low, high], highlight: opts.hl || [], dim: nums.map((_, x) => x).filter(x => x < low || x > high) }),
      P.text(`kth largest = index n - k = ${target} in sorted order`),
    ]
    t.step(L('target = len(nums) - k'), { vars: { target }, panels: panels(), note: `kth largest sits at sorted index ${target}`, say: say('a', 'kth largest = index n - k in ascending order. Quick select only chases that index.') })
    let guard = 0
    while (guard++ < 30) {
      const pivot = nums[high]
      let i = low
      t.step(L('pivot = nums[high]'), { vars: { low, high, pivot }, panels: panels({ pointers: { i }, hl: [high] }), note: `Pivot ${pivot} on [${low}, ${high}]` })
      for (let j = low; j < high; j++) {
        if (nums[j] < pivot) {
          ;[nums[i], nums[j]] = [nums[j], nums[i]]
          t.step(L('nums[i], nums[j] = nums[j]'), { vars: { i, j }, panels: panels({ pointers: { i, j }, hl: [i, j] }), note: `${nums[i]} < ${pivot}: move left` })
          i++
        }
      }
      ;[nums[i], nums[high]] = [nums[high], nums[i]]
      t.step(L('nums[i], nums[high] ='), { vars: { i, pivot }, panels: panels({ pointers: { i }, hl: [i] }), note: `Pivot ${pivot} final at ${i}` })
      if (i === target) {
        t.step(L('return nums[i]'), { vars: { answer: nums[i] }, panels: panels({ pointers: { i }, hl: [i] }), note: `Index ${i} = target: answer ${nums[i]}`, say: 'Pivot landed on the target index. Average O(n), O(1) space.' })
        return
      }
      if (i < target) {
        low = i + 1
        t.step(L('low = i + 1'), { vars: { low, high }, panels: panels(), note: `${i} < ${target}: search right only`, say: say('one', 'Unlike quicksort I throw away one side: average n + n/2 + … = O(n).') })
      } else {
        high = i - 1
        t.step(L('high = i - 1'), { vars: { low, high }, panels: panels(), note: `${i} > ${target}: search left only` })
      }
    }
  },
  blanks: ['len(nums) - k', 'i == target', 'low = i + 1', 'high = i - 1'],
})

def({
  slug: 'bucket-sort',
  title: 'Bucket / counting sort',
  branch: 'sorting',
  tier: 2,
  skills: ['arrays-hashing', 'heap'],
  prereqs: ['hashmap-lookup'],
  oneLiner: 'Index buckets by a bounded key; read buckets in order.',
  whenToUse: ['top k frequent elements', 'values in a small range', 'sort by frequency', 'beat O(n log n)'],
  notWhen: ['huge value range with few items: sort or heap', 'need comparisons between arbitrary keys'],
  mnemonic: 'Mail slots: frequency is the slot number, so walk slots from the back to get the most frequent.',
  steps: ['count = Counter(nums)', 'buckets[freq].append(num)', 'walk freq from n down to 1', 'collect until k'],
  template: `class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        count = Counter(nums)
        buckets = [[] for _ in range(len(nums) + 1)]

        for num, freq in count.items():
            buckets[freq].append(num)

        result = []

        for freq in range(len(buckets) - 1, 0, -1):
            for num in buckets[freq]:
                result.append(num)
                if len(result) == k:
                    return result

        return result`,
  time: 'O(n)',
  space: 'O(n)',
  whyComplexity: 'Frequencies are bounded by n, so n+1 buckets; counting and scanning are both linear.',
  variants: ['Counting sort when values in [0, k]: O(n + k)', 'Sort characters by frequency (LC 451)', 'Maximum gap (LC 164)', 'Top k frequent words (LC 692)'],
  relatedLc: [347, 451, 164, 692],
  compare: [['heap-top-k', 'Heap is O(n log k) and needs no bounded key'], ['quick-select', 'Quick select is average O(n) but unordered']],
  problem: 'Return the k most frequent elements.',
  inputs: [
    { label: 'k=2', value: { nums: [1, 1, 1, 2, 2, 3], k: 2 } },
    { label: 'k=3', value: { nums: [4, 4, 5, 6, 6, 6, 7, 7, 4, 4, 8], k: 3 } },
  ],
  run({ nums, k }, t, L) {
    const say = once()
    const count = new Map()
    for (const num of nums) count.set(num, (count.get(num) || 0) + 1)
    const buckets = Array.from({ length: nums.length + 1 }, () => [])
    const result = []
    const panels = (opts = {}) => [
      P.hashmap('count', count, opts.key !== undefined ? [opts.key] : []),
      P.array('buckets[freq]', buckets.map(b => (b.length ? b.join(',') : '·')), { pointers: opts.freq !== undefined ? { freq: opts.freq } : {}, highlight: opts.freq !== undefined ? [opts.freq] : [] }),
      P.array('result', result),
    ]
    t.step(L('count = Counter'), { vars: {}, panels: panels(), note: 'Count each number', say: say('a', 'Frequencies are at most n, so I can bucket by frequency instead of sorting: O(n).') })
    t.step(L('buckets = ['), { vars: { size: buckets.length }, panels: panels(), note: 'n + 1 empty buckets, index = frequency' })
    for (const [num, freq] of count) {
      buckets[freq].push(num)
      t.step(L('buckets[freq].append'), { vars: { num, freq }, panels: panels({ key: num, freq }), note: `${num} appears ${freq}× → bucket ${freq}` })
    }
    for (let freq = buckets.length - 1; freq > 0; freq--) {
      if (!buckets[freq].length) continue
      t.step(L('for freq in range'), { vars: { freq }, panels: panels({ freq }), note: `Bucket ${freq}: [${buckets[freq]}]`, say: say('walk', 'Walk buckets from high frequency to low.') })
      for (const num of buckets[freq]) {
        result.push(num)
        t.step(L('result.append(num)'), { vars: { num, freq }, panels: panels({ freq }), note: `Take ${num}` })
        if (result.length === k) {
          t.step(L('return result'), { vars: { result: [...result] }, panels: panels({ freq }), note: `Got ${k}: done`, say: 'O(n) time and space, beating the O(n log k) heap.' })
          return
        }
      }
    }
    t.step(L('return result', 2), { vars: { result: [...result] }, panels: panels(), note: 'Done' })
  },
  blanks: ['range(len(nums) + 1)', 'buckets[freq].append(num)', ['range(len(buckets) - 1, 0, -1)', 'range(len(buckets)-1, 0, -1)']],
})

def({
  slug: 'heap-top-k',
  title: 'Heap top-k',
  branch: 'heaps',
  tier: 1,
  skills: ['heap'],
  prereqs: [],
  oneLiner: 'Keep a size-k min-heap; its root is the kth largest.',
  whenToUse: ['kth largest / smallest', 'top k frequent / closest', 'stream of numbers', 'k much smaller than n'],
  notWhen: ['need all items sorted: sort', 'single kth query and average O(n) ok: quick select'],
  mnemonic: 'VIP room with k seats: newcomer pushes in, weakest gets kicked out. Doorman = heap[0].',
  steps: ['heapify(nums)', 'pop while len > k', 'add: heappush(val)', 'if len > k: heappop', 'return heap[0]'],
  template: `import heapq

class KthLargest:

    def __init__(self, k: int, nums: List[int]):
        self.heap = nums
        heapq.heapify(self.heap)
        self.k = k

        while len(self.heap) > k:
            heapq.heappop(self.heap)

    def add(self, val: int) -> int:
        heapq.heappush(self.heap, val)

        if len(self.heap) > self.k:
            heapq.heappop(self.heap)

        return self.heap[0]`,
  time: 'O(n log k)',
  space: 'O(k)',
  whyComplexity: 'Each of n items costs one push/pop on a heap capped at size k: log k.',
  variants: ['Kth largest element in array (LC 215)', 'K closest points: push (-dist, point) (LC 973)', 'Top k frequent (LC 347)', 'Last stone weight: max-heap via negatives (LC 1046)'],
  relatedLc: [703, 215, 973, 347, 1046],
  compare: [['quick-select', 'Quick select: average O(n), not streaming'], ['bucket-sort', 'Buckets are O(n) when the key is bounded']],
  problem: 'Stream: after each add, return the kth largest so far.',
  inputs: [
    { label: 'k=3', value: { k: 3, nums: [4, 5, 8, 2], adds: [3, 5, 10, 9, 4] } },
    { label: 'k=2', value: { k: 2, nums: [7, 1, 9, 3, 6], adds: [2, 8, 10] } },
    { label: 'empty start', value: { k: 1, nums: [], adds: [-3, -2, -4, 0, 4] } },
  ],
  run({ k, nums, adds }, t, L) {
    const say = once()
    const heap = [...nums]
    const panels = (hl = [], text = '') => [P.heap('min-heap (size k)', heap, hl), P.text(`k = ${k}${text ? '   ' + text : ''}`)]
    t.step(L('self.heap = nums'), { vars: { nums: [...nums] }, panels: panels(), note: 'Start from the given numbers' })
    heapify(heap)
    t.step(L('heapq.heapify'), { vars: {}, panels: panels([0]), note: 'O(n) heapify: smallest at root', say: say('a', 'Min-heap of size k: the root is the smallest of the top k, which is the kth largest.') })
    while (heap.length > k) {
      const out = heappop(heap)
      t.step(L('heapq.heappop(self.heap)'), { vars: { popped: out, size: heap.length }, panels: panels([0]), note: `Too many: drop ${out}` })
    }
    for (const val of adds) {
      heappush(heap, val)
      t.step(L('heapq.heappush'), { vars: { val }, panels: panels([heap.indexOf(val)], `add(${val})`), note: `Push ${val}` })
      if (heap.length > k) {
        const out = heappop(heap)
        t.step(L('heapq.heappop(self.heap)', 2), { vars: { popped: out }, panels: panels([0], `add(${val})`), note: `Size ${k + 1} > k: evict smallest ${out}`, say: say('evict', 'Smallest of k + 1 cannot be in the top k, so pop it. log k per op.') })
      }
      t.step(L('return self.heap[0]'), { vars: { returns: heap[0] }, panels: panels([0], `→ ${heap[0]}`), note: `kth largest = ${heap[0]}` })
    }
    t.step(L('return self.heap[0]'), { vars: { heap: [...heap] }, panels: panels([0]), note: 'Root = kth largest', say: 'O(log k) per add, O(n log k) total, O(k) space.' })
  },
  blanks: ['heapq.heapify(self.heap)', 'heapq.heappush(self.heap, val)', 'len(self.heap) > self.k', 'self.heap[0]'],
  distractors: ['heapq.heappush(self.heap, -val)', 'return heapq.heappop(self.heap)'],
})

def({
  slug: 'two-heaps-median',
  title: 'Two heaps (running median)',
  branch: 'heaps',
  tier: 2,
  skills: ['heap', 'ds-diagnosis'],
  prereqs: ['heap-top-k'],
  oneLiner: 'Max-heap for the low half, min-heap for the high half.',
  whenToUse: ['median of a data stream', 'sliding window median', 'balance two halves', 'IPO / maximize capital'],
  notWhen: ['static array median: sort or quick select', 'only need max or min: one heap'],
  mnemonic: 'Seesaw: small (max-heap, negated) on the left, large on the right; tops face each other in the middle.',
  steps: ['push to small (negated)', 'move small top to large', 'if large bigger: move back', 'odd: -small[0]', 'even: average the tops'],
  template: `import heapq

class MedianFinder:

    def __init__(self):
        self.small = []
        self.large = []

    def addNum(self, num: int) -> None:
        heapq.heappush(self.small, -num)
        heapq.heappush(self.large, -heapq.heappop(self.small))

        if len(self.large) > len(self.small):
            heapq.heappush(self.small, -heapq.heappop(self.large))

    def findMedian(self) -> float:
        if len(self.small) > len(self.large):
            return -self.small[0]
        return (-self.small[0] + self.large[0]) / 2`,
  time: 'O(n log n)',
  space: 'O(n)',
  whyComplexity: 'Each add does a constant number of O(log n) heap ops; findMedian peeks in O(1).',
  variants: ['Sliding window median (LC 480)', 'IPO (LC 502)', 'Find median from data stream (LC 295)'],
  relatedLc: [295, 480, 502],
  compare: [['heap-top-k', 'One heap only tracks one side'], ['quick-select', 'Quick select finds a static median once']],
  problem: 'Support addNum and findMedian on a stream.',
  inputs: [
    { label: 'stream A', value: [5, 15, 1, 3, 8, 7] },
    { label: 'stream B', value: [2, 9, 4, 10, 1] },
  ],
  run(stream, t, L) {
    const say = once()
    const small = []
    const large = []
    const panels = (text = '') => [
      P.heap('small (max-heap, shown positive)', small.map(x => -x), small.length ? [0] : []),
      P.heap('large (min-heap)', large, large.length ? [0] : []),
      P.text(text || `sizes: small ${small.length}, large ${large.length}`),
    ]
    t.step(L('self.small = []'), { vars: {}, panels: panels(), note: 'Two empty halves', say: say('a', 'Low half in a max-heap, high half in a min-heap. The median sits at the tops.') })
    for (const num of stream) {
      heappush(small, -num)
      t.step(L('heapq.heappush(self.small, -num)'), { vars: { num }, panels: panels(), note: `Push ${num} into small (as ${-num})`, say: say('neg', 'Python only has min-heaps, so I store negatives to fake a max-heap.') })
      const moved = -heappop(small)
      heappush(large, moved)
      t.step(L('heapq.heappush(self.large'), { vars: { moved }, panels: panels(), note: `Largest of small (${moved}) → large`, say: say('order', 'Moving small\'s max to large keeps every small ≤ every large.') })
      if (large.length > small.length) {
        const back = heappop(large)
        heappush(small, -back)
        t.step(L('heapq.heappush(self.small, -heapq'), { vars: { back }, panels: panels(), note: `Rebalance: ${back} back to small`, say: say('bal', 'Keep small the same size or one bigger, so an odd median is small\'s top.') })
      }
      const median = small.length > large.length ? -small[0] : (-small[0] + large[0]) / 2
      t.step(small.length > large.length ? L('return -self.small[0]') : L('return (-self.small[0]'), { vars: { median }, panels: panels(`median = ${median}`), note: `Median now ${median}` })
    }
    t.step(L('def findMedian'), { vars: {}, panels: panels(), note: 'Median is O(1) any time', say: 'O(log n) per add, O(1) per median, O(n) space.' })
  },
  blanks: ['-num', '-heapq.heappop(self.small)', 'len(self.large) > len(self.small)', '(-self.small[0] + self.large[0]) / 2'],
})

def({
  slug: 'k-way-merge',
  title: 'K-way merge (heap)',
  branch: 'heaps',
  tier: 2,
  skills: ['heap', 'linked-list'],
  prereqs: ['heap-top-k'],
  oneLiner: 'Heap holds each list head; pop smallest, push its successor.',
  whenToUse: ['merge k sorted lists', 'kth smallest in sorted matrix', 'smallest range covering k lists', 'external sort'],
  notWhen: ['only two lists: two pointers', 'unsorted inputs: just sort everything'],
  mnemonic: 'k checkout lines, one cashier: always serve whoever is smallest at the front, then call that line\'s next.',
  steps: ['push (head.val, i, head) for each list', 'while heap: pop smallest', 'attach to tail', 'push its next if any', 'return dummy.next'],
  template: `import heapq

class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        heap = []

        for i, node in enumerate(lists):
            if node:
                heapq.heappush(heap, (node.val, i, node))

        dummy = ListNode()
        curr = dummy

        while heap:
            val, i, node = heapq.heappop(heap)
            curr.next = node
            curr = curr.next

            if node.next:
                heapq.heappush(heap, (node.next.val, i, node.next))

        return dummy.next`,
  time: 'O(n log k)',
  space: 'O(k)',
  whyComplexity: 'Each of n nodes is pushed and popped once on a heap of at most k entries.',
  variants: ['Kth smallest in sorted matrix (LC 378)', 'Smallest range covering k lists (LC 632)', 'Find k pairs with smallest sums (LC 373)', 'Divide and conquer pairwise merge also O(n log k)'],
  relatedLc: [23, 378, 632, 373],
  compare: [['merge-sort', 'Merge step on two lists without a heap'], ['heap-top-k', 'Same heap, but fed from k sorted sources']],
  problem: 'Merge k sorted linked lists into one sorted list.',
  inputs: [
    { label: '3 lists', value: [[1, 4, 5], [1, 3, 4], [2, 6]] },
    { label: '4 lists', value: [[2, 9], [5], [1, 7, 8], [3, 4]] },
  ],
  run(lists, t, L) {
    const say = once()
    const heap = []
    const ptr = lists.map(() => 0)
    const merged = []
    const panels = (hl = []) => [
      ...lists.map((list, i) => P.array(`list ${i}`, list, { pointers: ptr[i] < list.length ? { head: ptr[i] } : {}, dim: list.map((_, x) => x).filter(x => x < ptr[i]) })),
      P.heap('heap (val, list)', heap.map(([v, i]) => `${v}·L${i}`), hl),
      P.array('merged', merged, { sorted: true }),
    ]
    t.step(L('heap = []'), { vars: { k: lists.length }, panels: panels(), note: 'Heap will hold one head per list', say: say('a', 'The next output is always one of the k heads, so I keep the heads in a min-heap.') })
    lists.forEach((list, i) => {
      if (!list.length) return
      heappush(heap, [list[0], i])
      t.step(L('heapq.heappush(heap, (node.val'), { vars: { i, val: list[0] }, panels: panels(), note: `Push head ${list[0]} of list ${i}`, say: say('tie', 'The index i breaks ties so Python never compares ListNodes.') })
    })
    t.step(L('curr = dummy'), { vars: {}, panels: panels(), note: 'Dummy head simplifies appends' })
    while (heap.length) {
      const [val, i] = heappop(heap)
      ptr[i]++
      merged.push(val)
      t.step(L('val, i, node = heapq.heappop'), { vars: { val, i }, panels: panels(), note: `Smallest head: ${val} from list ${i}` })
      t.step(L('curr = curr.next'), { vars: { val }, panels: panels(), note: `Attach ${val}` })
      if (ptr[i] < lists[i].length) {
        heappush(heap, [lists[i][ptr[i]], i])
        t.step(L('heapq.heappush(heap, (node.next.val'), { vars: { next: lists[i][ptr[i]] }, panels: panels(), note: `Refill from list ${i}: ${lists[i][ptr[i]]}`, say: say('refill', 'Replace the popped node with its successor so the heap still has each list\'s head.') })
      }
    }
    t.step(L('return dummy.next'), { vars: { merged: [...merged] }, panels: panels(), note: 'All lists merged', say: 'n pushes and pops on a heap of size k: O(n log k) time, O(k) space.' })
  },
  blanks: ['(node.val, i, node)', 'heapq.heappop(heap)', 'node.next', 'dummy.next'],
})


const tbSample = {
  balanced: [4, 2, 6, 1, 3, 5, 7],
  small: [1, 2, 3, null, 4],
  skewed: [3, 1, null, null, 2],
  bst: [8, 3, 10, 1, 6, null, 14, null, null, 4, 7],
  lca: [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4],
}

def({
  slug: 'tree-dfs',
  title: 'Tree DFS (pre / in / post)',
  traceTitle: 'Tree DFS: in-order recursion',
  branch: 'trees',
  tier: 1,
  skills: ['tree-dfs'],
  prereqs: [],
  oneLiner: 'Recurse left and right; where you visit decides the order.',
  whenToUse: ['height / depth / diameter of a tree', 'path sums root to leaf', 'BST in sorted order (in-order)', 'answer for a node depends on its subtrees'],
  notWhen: ['level by level or nearest-to-root: BFS', 'skewed tree with n = 10^5: recursion depth, go iterative'],
  mnemonic: 'Where is the append? Before kids = PRE, between = IN (sorted BST), after = POST (bottom-up answers).',
  steps: ['def dfs(node)', 'if not node: return', 'pre: visit here', 'dfs(node.left)', 'in: visit here', 'dfs(node.right), post: visit here'],
  template: `class Solution:
    def inorderTraversal(self, root: Optional[TreeNode]) -> List[int]:
        result = []

        def dfs(node):
            if not node:
                return

            dfs(node.left)
            result.append(node.val)
            dfs(node.right)

        dfs(root)
        return result`,
  time: 'O(n)',
  space: 'O(h)',
  whyComplexity: 'Every node visited once; the call stack holds one root-to-node path of height h.',
  variants: ['Max depth (LC 104)', 'Diameter: post-order heights (LC 543)', 'Path sum (LC 112)', 'Kth smallest in BST via in-order (LC 230)', 'Invert tree (LC 226)'],
  relatedLc: [94, 144, 145, 104, 543, 230],
  compare: [['tree-bfs', 'BFS goes level by level with a queue'], ['tree-dfs-iterative', 'Same order with an explicit stack, no recursion limit']],
  problem: 'Return the in-order (left, node, right) traversal of a binary tree.',
  inputs: [
    { label: 'BST', value: tbSample.balanced },
    { label: 'gappy', value: tbSample.small },
    { label: 'zig-zag', value: tbSample.skewed },
  ],
  run(input, t, L) {
    const say = once()
    const root = buildTree(input)
    const state = {}
    const values = {}
    const frames = []
    const result = []
    const panels = node => [
      P.tree('tree', root, state, node ? { node: node.id } : {}, values),
      P.calls(frames),
      P.array('result', result, { highlight: result.length ? [result.length - 1] : [] }),
    ]
    t.step(L('result = []'), { vars: {}, panels: panels(), note: 'Collect values in visit order', say: say('a', 'Recursive DFS. The only thing that changes between pre, in and post is where I append.') })
    const dfs = node => {
      frames.push(node ? `dfs(${node.val})` : 'dfs(None)')
      if (!node) {
        t.step(L('if not node'), { vars: { node: 'None' }, panels: panels(), note: 'Hit None: return', say: say('base', 'Base case: an empty child just returns.') })
        frames.pop()
        return
      }
      state[node.id] = 'current'
      t.step(L('dfs(node.left)'), { vars: { node: node.val }, panels: panels(node), note: `At ${node.val}: go left first` })
      state[node.id] = 'path'
      dfs(node.left)
      result.push(node.val)
      values[node.id] = `#${result.length}`
      state[node.id] = 'current'
      t.step(L('result.append'), { vars: { node: node.val, result: [...result] }, panels: panels(node), note: `Left done: visit ${node.val}`, say: say('in', 'In-order visits between the two calls. On a BST that prints values sorted.') })
      state[node.id] = 'path'
      t.step(L('dfs(node.right)'), { vars: { node: node.val }, panels: panels(node), note: `Now the right subtree of ${node.val}` })
      dfs(node.right)
      state[node.id] = 'done'
      frames.pop()
    }
    t.step(L('dfs(root)'), { vars: {}, panels: panels(), note: 'Start at the root' })
    dfs(root)
    t.step(L('return result'), { vars: { result: [...result] }, panels: panels(), note: `In-order = ${JSON.stringify(result)}`, say: 'O(n) time, O(h) stack. Move the append up for pre-order, down for post-order.' })
  },
  blanks: [['if not node', 'if node is None'], 'dfs(node.left)', 'result.append(node.val)', 'dfs(node.right)'],
  distractors: ['dfs(node)', 'result.append(node)'],
})

def({
  slug: 'tree-dfs-iterative',
  title: 'Iterative in-order (stack)',
  branch: 'trees',
  tier: 2,
  skills: ['tree-dfs', 'stack'],
  prereqs: ['tree-dfs'],
  oneLiner: 'Push the left spine, pop, visit, then turn right.',
  whenToUse: ['deep / skewed tree, recursion limit risk', 'BST iterator / kth smallest', 'interviewer asks "without recursion"'],
  notWhen: ['recursion is fine and clearer', 'level order: use a queue'],
  mnemonic: 'Slide down the left banister stacking nodes, pop one, visit, hop right, repeat.',
  steps: ['curr = root, stack = []', 'while curr or stack', 'while curr: push, go left', 'curr = stack.pop(), visit', 'curr = curr.right'],
  template: `class Solution:
    def inorderTraversal(self, root: Optional[TreeNode]) -> List[int]:
        result, stack = [], []
        curr = root

        while curr or stack:
            while curr:
                stack.append(curr)
                curr = curr.left

            curr = stack.pop()
            result.append(curr.val)
            curr = curr.right

        return result`,
  time: 'O(n)',
  space: 'O(h)',
  whyComplexity: 'Each node pushed and popped once; the stack holds at most one left spine.',
  variants: ['BST iterator (LC 173)', 'Kth smallest in BST (LC 230)', 'Pre-order: pop, visit, push right then left (LC 144)', 'Post-order: reversed modified pre-order (LC 145)'],
  relatedLc: [94, 173, 230, 144],
  compare: [['tree-dfs', 'Recursive version uses the call stack implicitly'], ['graph-dfs-iterative', 'Graph version needs a seen set']],
  problem: 'In-order traversal without recursion.',
  inputs: [
    { label: 'BST', value: tbSample.balanced },
    { label: 'gappy', value: tbSample.small },
    { label: 'left chain', value: [5, 4, 6, 3, null, null, 7, 2] },
  ],
  run(input, t, L) {
    const say = once()
    const root = buildTree(input)
    const state = {}
    const result = []
    const stack = []
    let curr = root
    const panels = () => [
      P.tree('tree', root, state, curr ? { curr: curr.id } : {}),
      P.stack('stack', stack.map(n => n.val), stack.length ? [stack.length - 1] : []),
      P.array('result', result),
    ]
    t.step(L('curr = root'), { vars: { curr: curr ? curr.val : 'None' }, panels: panels(), note: 'Start at the root, empty stack', say: say('a', 'I replace the call stack with my own stack, so deep trees cannot overflow.') })
    while (curr || stack.length) {
      t.step(L('while curr or stack'), { vars: { curr: curr ? curr.val : 'None', stack: stack.map(n => n.val) }, panels: panels(), note: 'Work remains' })
      while (curr) {
        stack.push(curr)
        state[curr.id] = 'frontier'
        t.step(L('stack.append(curr)'), { vars: { curr: curr.val }, panels: panels(), note: `Push ${curr.val}`, say: say('spine', 'Push the whole left spine first: the leftmost node is visited first.') })
        curr = curr.left
        t.step(L('curr = curr.left'), { vars: { curr: curr ? curr.val : 'None' }, panels: panels(), note: curr ? `Go left to ${curr.val}` : 'Left is None: stop diving' })
      }
      curr = stack.pop()
      state[curr.id] = 'current'
      t.step(L('curr = stack.pop()'), { vars: { curr: curr.val }, panels: panels(), note: `Pop ${curr.val}: its left side is done` })
      result.push(curr.val)
      state[curr.id] = 'done'
      t.step(L('result.append'), { vars: { result: [...result] }, panels: panels(), note: `Visit ${curr.val}`, say: say('visit', 'Popped means the left subtree is finished, so visit now.') })
      curr = curr.right
      t.step(L('curr = curr.right'), { vars: { curr: curr ? curr.val : 'None' }, panels: panels(), note: curr ? `Turn right to ${curr.val}` : 'No right child' })
    }
    t.step(L('return result'), { vars: { result: [...result] }, panels: panels(), note: `In-order = ${JSON.stringify(result)}`, say: 'O(n) time, O(h) space for the stack.' })
  },
  blanks: ['curr or stack', 'curr = curr.left', 'stack.pop()', 'curr = curr.right'],
})

def({
  slug: 'tree-bfs',
  title: 'Tree BFS (level order)',
  branch: 'trees',
  tier: 1,
  skills: ['tree-bfs', 'queue-deque'],
  prereqs: [],
  oneLiner: 'Queue nodes; pop exactly one level per round.',
  whenToUse: ['level by level', 'right side view / zigzag', 'minimum depth', 'nearest node to the root'],
  notWhen: ['answer built from subtrees (heights, sums): DFS', 'very wide tree and memory tight'],
  mnemonic: 'Snapshot len(queue) = this floor. Pop that many, enqueue kids for the next floor.',
  steps: ['queue = deque([root])', 'while queue', 'for _ in range(len(queue))', 'node = queue.popleft(), record', 'append left, right', 'result.append(level)'],
  template: `from collections import deque

class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        if not root:
            return []

        result = []
        queue = deque([root])

        while queue:
            level = []

            for _ in range(len(queue)):
                node = queue.popleft()
                level.append(node.val)

                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)

            result.append(level)

        return result`,
  time: 'O(n)',
  space: 'O(w)',
  whyComplexity: 'Each node enqueued and dequeued once; queue holds at most the widest level w.',
  variants: ['Right side view: last of each level (LC 199)', 'Zigzag order (LC 103)', 'Min depth (LC 111)', 'Average of levels (LC 637)'],
  relatedLc: [102, 199, 103, 111, 637],
  compare: [['tree-dfs', 'DFS dives deep with a stack, O(h) space'], ['graph-bfs', 'Graph BFS adds a seen set']],
  problem: 'Group node values level by level, left to right.',
  inputs: [
    { label: 'full', value: tbSample.balanced },
    { label: 'gappy', value: tbSample.small },
    { label: 'uneven', value: [1, 2, 3, 4, null, null, 5, null, 6] },
  ],
  parsons: { start: 'result = []', end: 'result.append(level)' },
  run(input, t, L) {
    const say = once()
    const root = buildTree(input)
    const state = {}
    let queue = []
    let level = []
    const result = []
    const panels = node => [
      P.tree('tree', root, state, node ? { node: node.id } : {}),
      P.queue('queue', queue.map(n => n.val), queue.length ? [0] : []),
      P.array('level', level),
      P.text(`result = ${JSON.stringify(result)}`),
    ]
    if (!root) {
      t.step(L('return []'), { vars: {}, panels: panels(), note: 'Empty tree' })
      return
    }
    queue = [root]
    state[root.id] = 'frontier'
    t.step(L('queue = deque'), { vars: { queue: [root.val] }, panels: panels(), note: 'Seed the queue with the root', say: say('a', 'Level order means BFS: a FIFO queue processes nodes in order of depth.') })
    let depth = 0
    while (queue.length) {
      level = []
      t.step(L('level = []'), { vars: { depth, 'len(queue)': queue.length }, panels: panels(), note: `Level ${depth}: ${queue.length} node(s) waiting` })
      const size = queue.length
      t.step(L('for _ in range'), { vars: { size }, panels: panels(), note: `Snapshot size ${size}`, say: say('snap', 'I freeze len(queue) now so children added this round wait for the next level.') })
      for (let i = 0; i < size; i++) {
        const node = queue.shift()
        state[node.id] = 'current'
        level.push(node.val)
        t.step(L('level.append'), { vars: { node: node.val, level: [...level] }, panels: panels(node), note: `Pop ${node.val}, add to level` })
        if (node.left) {
          queue.push(node.left)
          state[node.left.id] = 'frontier'
          t.step(L('queue.append(node.left)'), { vars: { node: node.val }, panels: panels(node), note: `Enqueue left ${node.left.val}` })
        }
        if (node.right) {
          queue.push(node.right)
          state[node.right.id] = 'frontier'
          t.step(L('queue.append(node.right)'), { vars: { node: node.val }, panels: panels(node), note: `Enqueue right ${node.right.val}`, say: say('lr', 'Left before right keeps each level left-to-right.') })
        }
        state[node.id] = 'done'
      }
      result.push([...level])
      t.step(L('result.append(level)'), { vars: { level: [...level] }, panels: panels(), note: `Level ${depth} = ${JSON.stringify(level)}` })
      depth++
    }
    t.step(L('return result'), { vars: { result: clone(result) }, panels: panels(), note: 'Queue empty: all levels collected', say: 'O(n) time, O(w) space for the widest level.' })
  },
  blanks: ['deque([root])', 'range(len(queue))', 'queue.popleft()', 'result.append(level)'],
  distractors: ['node = queue.pop()', 'for _ in range(len(result)):'],
})

def({
  slug: 'bst-ops',
  title: 'BST search & insert',
  branch: 'trees',
  tier: 2,
  skills: ['bst'],
  prereqs: ['tree-dfs', 'binary-search'],
  oneLiner: 'Go left if smaller, right if bigger; one path down.',
  whenToUse: ['binary search tree given', 'find / insert / floor / ceiling', 'O(h) lookups', 'sorted order with dynamic inserts'],
  notWhen: ['plain binary tree: no ordering to exploit', 'need guaranteed log n: tree may be skewed'],
  mnemonic: 'BST = binary search on a tree. Smaller left, bigger right, insert where you fall off.',
  steps: ['curr = root', 'while curr and curr.val != val', 'val < curr.val → left else right', 'insert: None → TreeNode(val)', 'recurse into the correct side, reattach'],
  template: `class Solution:
    def searchBST(self, root: Optional[TreeNode], val: int) -> Optional[TreeNode]:
        curr = root

        while curr and curr.val != val:
            curr = curr.left if val < curr.val else curr.right

        return curr

    def insertIntoBST(self, root: Optional[TreeNode], val: int) -> Optional[TreeNode]:
        if not root:
            return TreeNode(val)

        if val < root.val:
            root.left = self.insertIntoBST(root.left, val)
        else:
            root.right = self.insertIntoBST(root.right, val)

        return root`,
  time: 'O(h)',
  space: 'O(h)',
  whyComplexity: 'One root-to-leaf path: h is log n when balanced, n when skewed. Search is O(1) space.',
  variants: ['Delete node in BST (LC 450)', 'Floor / ceiling in BST', 'LCA of BST: split point (LC 235)', 'Kth smallest (LC 230)'],
  relatedLc: [700, 701, 450, 235],
  compare: [['binary-search', 'Same halving idea on a sorted array'], ['bst-validate', 'Validation must pass bounds down, not just compare to parent']],
  problem: 'Search a value in a BST, then insert a new value.',
  inputs: [
    { label: 'find 6, add 5', value: { tree: tbSample.bst, search: 6, insert: 5 } },
    { label: 'miss 9, add 13', value: { tree: tbSample.bst, search: 9, insert: 13 } },
    { label: 'find 14, add 2', value: { tree: tbSample.bst, search: 14, insert: 2 } },
  ],
  run({ tree, search, insert }, t, L) {
    const say = once()
    let root = buildTree(tree)
    let state = {}
    const frames = []
    const panels = (node, extra) => [
      P.tree('BST', root, state, node ? { curr: node.id } : {}),
      P.calls(frames),
      P.text(extra),
    ]
    let curr = root
    state[curr.id] = 'current'
    t.step(L('curr = root'), { vars: { val: search }, panels: panels(curr, `search ${search}`), note: `Search for ${search} from the root`, say: say('a', 'BST property: everything left is smaller, right is bigger. So one path down.') })
    while (curr && curr.val !== search) {
      t.step(L('while curr and'), { vars: { curr: curr.val, val: search }, panels: panels(curr, `search ${search}`), note: `${search} ${search < curr.val ? '<' : '>'} ${curr.val}` })
      state[curr.id] = 'visited'
      curr = search < curr.val ? curr.left : curr.right
      if (curr) state[curr.id] = 'current'
      t.step(L('curr = curr.left if'), { vars: { curr: curr ? curr.val : 'None' }, panels: panels(curr, `search ${search}`), note: curr ? `Move to ${curr.val}` : 'Fell off the tree', say: say('go', 'Each step discards a whole subtree, like binary search.') })
    }
    if (curr) state[curr.id] = 'done'
    t.step(L('return curr', 1), { vars: { found: curr ? curr.val : 'None' }, panels: panels(curr, `search ${search}`), note: curr ? `Found ${search}` : `${search} not in BST` })
    state = {}
    const ins = node => {
      frames.push(`insert(${node ? node.val : 'None'}, ${insert})`)
      if (!node) {
        const fresh = { id: 'new', val: insert, left: null, right: null }
        t.step(L('return TreeNode(val)'), { vars: { val: insert }, panels: panels(null, `insert ${insert}`), note: `Empty spot: create ${insert}`, say: say('leaf', 'New values always land as a leaf where the search falls off.') })
        frames.pop()
        return fresh
      }
      state[node.id] = 'current'
      if (insert < node.val) {
        t.step(L('root.left = self'), { vars: { root: node.val, val: insert }, panels: panels(node, `insert ${insert}`), note: `${insert} < ${node.val}: go left` })
        state[node.id] = 'path'
        node.left = ins(node.left)
      } else {
        t.step(L('root.right = self'), { vars: { root: node.val, val: insert }, panels: panels(node, `insert ${insert}`), note: `${insert} >= ${node.val}: go right` })
        state[node.id] = 'path'
        node.right = ins(node.right)
      }
      if (node.left && node.left.id === 'new') state.new = 'done'
      if (node.right && node.right.id === 'new') state.new = 'done'
      t.step(L('return root'), { vars: { root: node.val }, panels: panels(node, `insert ${insert}`), note: `Reattach child, return ${node.val}`, say: say('re', 'Returning root and reassigning the child is how the new node gets linked in.') })
      frames.pop()
      return node
    }
    t.step(L('def insertIntoBST'), { vars: { val: insert }, panels: panels(null, `insert ${insert}`), note: `Now insert ${insert}` })
    root = ins(root)
    t.step(L('return root'), { vars: {}, panels: panels(null, `inserted ${insert}`), note: 'Insert complete', say: 'Both are O(h): log n balanced, n skewed.' })
  },
  blanks: ['curr.left if val < curr.val else curr.right', 'return TreeNode(val)', ['self.insertIntoBST(root.left, val)', 'self.insertIntoBST(root.left,val)']],
})

def({
  slug: 'bst-validate',
  title: 'Validate BST (bounds)',
  branch: 'trees',
  tier: 1,
  skills: ['bst', 'tree-dfs'],
  prereqs: ['bst-ops'],
  oneLiner: 'Pass an allowed (low, high) window down to every node.',
  whenToUse: ['is this a valid BST', 'every node within ancestor limits', 'top-down constraint propagation'],
  notWhen: ['only comparing with the parent: misses deep violations', 'values may repeat and duplicates allowed: adjust < to <='],
  mnemonic: 'Each node gets a fence (low, high). Go left: ceiling drops to node. Go right: floor rises.',
  steps: ['dfs(node, low, high)', 'None → True', 'not low < val < high → False', 'left gets (low, val)', 'right gets (val, high)'],
  template: `class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:

        def dfs(node, low, high):
            if not node:
                return True
            if not low < node.val < high:
                return False

            return dfs(node.left, low, node.val) and dfs(node.right, node.val, high)

        return dfs(root, float("-inf"), float("inf"))`,
  time: 'O(n)',
  space: 'O(h)',
  whyComplexity: 'Every node checked once against its window; recursion depth is the tree height.',
  variants: ['In-order must be strictly increasing (alt solution)', 'Recover BST: two swapped nodes (LC 99)', 'Largest BST subtree (LC 333)'],
  relatedLc: [98, 99, 333],
  compare: [['tree-dfs', 'Plain DFS returns info up; this passes bounds down'], ['bst-ops', 'Search uses the property; validation proves it']],
  problem: 'Is every node strictly inside the bounds set by its ancestors?',
  inputs: [
    { label: 'valid', value: tbSample.bst },
    { label: 'deep trap', value: [5, 4, 6, null, null, 3, 7] },
    { label: 'balanced', value: tbSample.balanced },
  ],
  run(input, t, L) {
    const say = once()
    const root = buildTree(input)
    const state = {}
    const values = {}
    const frames = []
    const panels = node => [P.tree('tree', root, state, node ? { node: node.id } : {}, values), P.calls(frames)]
    t.step(L('return dfs(root'), { vars: { low: '-∞', high: '∞' }, panels: panels(), note: 'Root may be anything: (-∞, ∞)', say: say('a', 'Comparing only to the parent misses deep violations, so I pass the allowed window down.') })
    const dfs = (node, low, high) => {
      frames.push(`dfs(${node ? node.val : 'None'}, ${fmt(low)}, ${fmt(high)})`)
      if (!node) {
        t.step(L('return True'), { vars: { node: 'None' }, panels: panels(), note: 'Empty subtree is valid' })
        frames.pop()
        return true
      }
      state[node.id] = 'current'
      values[node.id] = `(${fmt(low)},${fmt(high)})`
      t.step(L('if not low < node.val'), { vars: { node: node.val, low: fmt(low), high: fmt(high) }, panels: panels(node), note: `Is ${fmt(low)} < ${node.val} < ${fmt(high)}?` })
      if (!(low < node.val && node.val < high)) {
        values[node.id] = `✗ (${fmt(low)},${fmt(high)})`
        t.step(L('return False'), { vars: { node: node.val }, panels: panels(node), note: `${node.val} breaks its window`, say: say('fail', `${node.val} looks fine next to its parent but violates an ancestor bound.`) })
        frames.pop()
        return false
      }
      state[node.id] = 'path'
      t.step(L('return dfs(node.left'), { vars: { node: node.val }, panels: panels(node), note: `Left gets (${fmt(low)},${node.val}), right gets (${node.val},${fmt(high)})`, say: say('narrow', 'Going left the ceiling becomes node.val. Going right the floor does.') })
      const ok = dfs(node.left, low, node.val) && dfs(node.right, node.val, high)
      state[node.id] = ok ? 'done' : 'current'
      frames.pop()
      return ok
    }
    const answer = dfs(root, -Infinity, Infinity)
    t.step(L('return dfs(root'), { vars: { answer: fmt(answer) }, panels: panels(), note: answer ? 'Valid BST' : 'Not a BST', say: 'O(n) time, O(h) space. `and` short-circuits on the first failure.' })
  },
  blanks: ['low < node.val < high', 'dfs(node.left, low, node.val)', 'dfs(node.right, node.val, high)'],
  distractors: ['if node.left.val > node.val:'],
})

def({
  slug: 'lca',
  title: 'Lowest common ancestor',
  branch: 'trees',
  tier: 1,
  skills: ['tree-dfs'],
  prereqs: ['tree-dfs'],
  oneLiner: 'Post-order: the node where p and q come from different sides.',
  whenToUse: ['lowest common ancestor of two nodes', 'meeting point in a tree', 'distance between two tree nodes'],
  notWhen: ['tree is a BST: walk down to the split point in O(h), O(1)', 'many queries: binary lifting'],
  mnemonic: 'Each child reports "found someone". Both sides report → I am the LCA. One side → pass it up.',
  steps: ['None, p or q → return node', 'left = dfs(left)', 'right = dfs(right)', 'both → return node', 'else return left or right'],
  template: `class Solution:
    def lowestCommonAncestor(self, root: TreeNode, p: TreeNode, q: TreeNode) -> TreeNode:

        def dfs(node):
            if not node or node == p or node == q:
                return node

            left = dfs(node.left)
            right = dfs(node.right)

            if left and right:
                return node
            return left or right

        return dfs(root)`,
  time: 'O(n)',
  space: 'O(h)',
  whyComplexity: 'Each node visited once in post-order; the stack is one root-to-node path.',
  variants: ['LCA of BST (LC 235)', 'LCA with parent pointers: two-pointer like list intersection (LC 1650)', 'Distance between nodes = d(p) + d(q) - 2d(lca)'],
  relatedLc: [236, 235, 1650, 1644],
  compare: [['bst-ops', 'In a BST the split point is found top-down in O(h)'], ['tree-dfs', 'This is post-order DFS returning a signal']],
  problem: 'Find the lowest node that has both p and q as descendants.',
  inputs: [
    { label: 'p=6 q=0', value: { tree: tbSample.lca, p: 6, q: 0 } },
    { label: 'p=7 q=4', value: { tree: tbSample.lca, p: 7, q: 4 } },
    { label: 'p=5 q=4', value: { tree: tbSample.lca, p: 5, q: 4 } },
  ],
  run({ tree, p: pv, q: qv }, t, L) {
    const say = once()
    const root = buildTree(tree)
    const p = findVal(root, pv)
    const q = findVal(root, qv)
    const state = {}
    const values = { [p.id]: 'p', [q.id]: 'q' }
    const frames = []
    const panels = node => [P.tree('tree', root, state, node ? { node: node.id } : {}, values), P.calls(frames)]
    t.step(L('return dfs(root)'), { vars: { p: pv, q: qv }, panels: panels(), note: 'Post-order search from the root', say: say('a', 'dfs returns p, q, the LCA, or None. Answers bubble up from the children.') })
    const dfs = node => {
      frames.push(`dfs(${node ? node.val : 'None'})`)
      if (!node || node === p || node === q) {
        if (node) state[node.id] = 'path'
        t.step(L('return node', 1), { vars: { node: node ? node.val : 'None' }, panels: panels(node), note: node ? `${node.val} is ${node === p ? 'p' : 'q'}: report it up` : 'None: nothing here', say: node ? say('hit', 'If I hit p or q I return it right away. If the other is below, this node is still the answer.') : undefined })
        frames.pop()
        return node
      }
      state[node.id] = 'current'
      t.step(L('left = dfs'), { vars: { node: node.val }, panels: panels(node), note: `Search left of ${node.val}` })
      state[node.id] = 'visited'
      const left = dfs(node.left)
      state[node.id] = 'current'
      t.step(L('right = dfs'), { vars: { node: node.val, left: left ? left.val : 'None' }, panels: panels(node), note: `Left reported ${left ? left.val : 'None'}; search right` })
      state[node.id] = 'visited'
      const right = dfs(node.right)
      state[node.id] = 'current'
      if (left && right) {
        state[node.id] = 'done'
        values[node.id] = 'LCA'
        t.step(L('return node', 2), { vars: { node: node.val, left: left.val, right: right.val }, panels: panels(node), note: `Both sides found one: ${node.val} is the LCA`, say: say('split', 'p and q come from different subtrees, so this is the lowest common ancestor.') })
        frames.pop()
        return node
      }
      const up = left || right
      if (up) state[node.id] = 'path'
      t.step(L('return left or right'), { vars: { node: node.val, returns: up ? up.val : 'None' }, panels: panels(node), note: up ? `Pass ${up.val} upward` : 'Nothing below: return None' })
      frames.pop()
      return up
    }
    const answer = dfs(root)
    t.step(L('return dfs(root)'), { vars: { answer: answer.val }, panels: panels(answer), note: `LCA = ${answer.val}`, say: 'O(n) time, O(h) space for recursion.' })
  },
  blanks: [['node == p or node == q', 'node in (p, q)', 'node is p or node is q'], 'left and right', 'left or right'],
})

const tbTrieLayout = (nodes, rootId) => {
  const pos = {}
  let leaf = 0
  let maxDepth = 0
  const place = (id, depth) => {
    maxDepth = Math.max(maxDepth, depth)
    const kids = nodes[id].children
    if (!kids.length) {
      pos[id] = [leaf++, depth]
      return
    }
    kids.forEach(k => place(k, depth + 1))
    pos[id] = [(pos[kids[0]][0] + pos[kids[kids.length - 1]][0]) / 2, depth]
  }
  place(rootId, 0)
  const out = {}
  for (const [id, [x, d]] of Object.entries(pos)) out[id] = [Math.round((0.08 + (0.84 * (x + 0.5)) / Math.max(leaf, 1)) * 100) / 100, Math.round((0.08 + (0.84 * d) / Math.max(maxDepth, 1)) * 100) / 100]
  return out
}

def({
  slug: 'trie',
  title: 'Trie (prefix tree)',
  branch: 'trees',
  tier: 1,
  skills: ['trie', 'arrays-hashing'],
  prereqs: ['tree-dfs', 'hashmap-lookup'],
  oneLiner: 'Tree of characters; shared prefixes share a path.',
  whenToUse: ['prefix search / autocomplete', 'startsWith queries', 'word search on a board with many words', 'dictionary of words with wildcard'],
  notWhen: ['only exact lookups: a set is simpler', 'single word: plain string ops'],
  mnemonic: 'Walk the letters: missing child? build it. At the end, plant a flag: endOfWord = True.',
  steps: ['TrieNode: children = {}, endOfWord', 'insert: walk, create missing children', 'mark endOfWord at the end', 'search: walk, missing → False', 'return endOfWord (search) / True (prefix)'],
  template: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.endOfWord = False

class PrefixTree:

    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        curr = self.root

        for c in word:
            if c not in curr.children:
                curr.children[c] = TrieNode()
            curr = curr.children[c]

        curr.endOfWord = True

    def search(self, word: str) -> bool:
        curr = self.root

        for c in word:
            if c not in curr.children:
                return False
            curr = curr.children[c]

        return curr.endOfWord

    def startsWith(self, prefix: str) -> bool:
        curr = self.root

        for c in prefix:
            if c not in curr.children:
                return False
            curr = curr.children[c]

        return True`,
  time: 'O(L)',
  space: 'O(total chars)',
  whyComplexity: 'Each operation walks one node per character of the word, length L.',
  variants: ['Add and search with "." wildcard (LC 211)', 'Word search II: trie + grid DFS (LC 212)', 'Replace words (LC 648)', 'Search suggestions (LC 1268)'],
  relatedLc: [208, 211, 212, 1268],
  compare: [['hashmap-lookup', 'A set answers exact words but not prefixes'], ['tree-dfs', 'Trie DFS powers wildcard and board search']],
  problem: 'Implement insert, search and startsWith on a prefix tree.',
  inputs: [
    { label: 'car/cat/cart', value: { insert: ['car', 'cat', 'cart'], search: ['cat', 'ca'], prefix: ['ca'] } },
    { label: 'app/apple/bat', value: { insert: ['app', 'apple', 'bat'], search: ['apple', 'bad'], prefix: ['ba'] } },
  ],
  parsons: { start: 'def insert', end: 'curr.endOfWord = True' },
  run({ insert, search, prefix }, t, L) {
    const say = once()
    const nodes = { root: { char: '•', end: false, children: [] } }
    let state = {}
    const panels = (curr, text) => {
      const ids = Object.keys(nodes)
      const edges = []
      ids.forEach(id => nodes[id].children.forEach(k => edges.push([id, k])))
      const labels = Object.fromEntries(ids.map(id => [id, nodes[id].char]))
      const values = Object.fromEntries(ids.filter(id => nodes[id].end).map(id => [id, '★']))
      const st = { ...state }
      if (curr) st[curr] = 'current'
      return [P.graph('trie', { directed: true, nodes: ids, edges, labels, pos: tbTrieLayout(nodes, 'root') }, st, {}, values), P.text(text)]
    }
    t.step(L('self.root = TrieNode()'), { vars: {}, panels: panels('root', 'empty trie'), note: 'Root holds no letter', say: say('a', 'Each node maps a character to a child. Shared prefixes share a path.') })
    for (const word of insert) {
      state = {}
      let curr = 'root'
      t.step(L('curr = self.root', 1), { vars: { word }, panels: panels(curr, `insert "${word}"`), note: `Insert "${word}"` })
      for (const c of word) {
        const child = curr === 'root' ? c : curr + c
        if (!nodes[curr].children.includes(child)) {
          nodes[child] = { char: c, end: false, children: [] }
          nodes[curr].children.push(child)
          state[child] = 'frontier'
          t.step(L('curr.children[c] = TrieNode()'), { vars: { c }, panels: panels(curr, `insert "${word}"`), note: `No '${c}' child: create it`, say: say('new', 'Missing letter, so I create the node. Existing prefixes are reused for free.') })
        } else {
          t.step(L('if c not in curr.children', 1), { vars: { c }, panels: panels(curr, `insert "${word}"`), note: `'${c}' already exists: reuse` })
        }
        state[curr] = 'visited'
        curr = child
        t.step(L('curr = curr.children[c]', 1), { vars: { c }, panels: panels(curr, `insert "${word}"`), note: `Step into '${c}'` })
      }
      nodes[curr].end = true
      t.step(L('curr.endOfWord = True'), { vars: { word }, panels: panels(curr, `insert "${word}"`), note: `Mark end of "${word}"`, say: say('end', 'endOfWord separates the word "car" from just the prefix of "cart".') })
    }
    const walk = (word, kind) => {
      state = {}
      const nth = kind === 'search' ? 2 : 3
      let curr = 'root'
      t.step(L('curr = self.root', nth), { vars: { [kind === 'search' ? 'word' : 'prefix']: word }, panels: panels(curr, `${kind} "${word}"`), note: `${kind}("${word}")` })
      for (const c of word) {
        const child = curr === 'root' ? c : curr + c
        if (!nodes[curr].children.includes(child)) {
          t.step(L('return False', nth - 1), { vars: { c }, panels: panels(curr, `${kind} "${word}"`), note: `No '${c}': False` })
          return
        }
        state[curr] = 'path'
        curr = child
        t.step(L('curr = curr.children[c]', nth), { vars: { c }, panels: panels(curr, `${kind} "${word}"`), note: `Follow '${c}'` })
      }
      if (kind === 'search') {
        t.step(L('return curr.endOfWord'), { vars: { endOfWord: fmt(nodes[curr].end) }, panels: panels(curr, `search "${word}"`), note: nodes[curr].end ? `"${word}" is a word` : `"${word}" is only a prefix`, say: say('s', 'search needs the end flag; startsWith only needs the path to exist.') })
      } else {
        t.step(L('return True'), { vars: { prefix: word }, panels: panels(curr, `startsWith "${word}"`), note: `Path exists: True` })
      }
    }
    for (const word of search) walk(word, 'search')
    for (const word of prefix) walk(word, 'startsWith')
    t.step(L('return True'), { vars: {}, panels: panels(null, 'done'), note: 'All operations O(L)', say: 'Each op is O(L) in the word length. Space is total characters inserted.' })
  },
  blanks: ['c not in curr.children', 'curr.children[c] = TrieNode()', 'curr.endOfWord = True', 'return curr.endOfWord'],
})

def({
  slug: 'subsets',
  title: 'Subsets (backtracking)',
  branch: 'backtracking',
  tier: 1,
  skills: ['backtracking'],
  prereqs: ['tree-dfs'],
  oneLiner: 'At each index choose take or skip; record at the end.',
  whenToUse: ['all subsets / power set', 'n ≤ 20', 'every combination of choices', 'include or exclude each item'],
  notWhen: ['only count or best value: DP', 'n large (2^n explodes)'],
  mnemonic: 'Binary decision tree: TAKE (append, recurse, pop) then SKIP (recurse). Copy the path at the leaf.',
  steps: ['dfs(i)', 'i == n → result.append(path.copy())', 'path.append(nums[i]); dfs(i + 1)', 'path.pop()', 'dfs(i + 1) without it'],
  template: `class Solution:
    def subsets(self, nums: List[int]) -> List[List[int]]:
        result, path = [], []

        def dfs(i):
            if i == len(nums):
                result.append(path.copy())
                return

            path.append(nums[i])
            dfs(i + 1)
            path.pop()
            dfs(i + 1)

        dfs(0)
        return result`,
  time: 'O(n·2^n)',
  space: 'O(n)',
  whyComplexity: '2^n leaves, each copying a path of up to n; recursion depth n.',
  variants: ['Subsets II with duplicates: sort + skip equal (LC 90)', 'Letter combinations of phone (LC 17)', 'Generate parentheses (LC 22)', 'Palindrome partitioning (LC 131)'],
  relatedLc: [78, 90, 17, 22, 131],
  compare: [['permutations', 'Permutations use every item, order matters'], ['combination-sum', 'Combination sum allows reuse and prunes on target']],
  problem: 'Return every subset of distinct numbers.',
  inputs: [
    { label: '[1,2,3]', value: [1, 2, 3] },
    { label: '[4,5]', value: [4, 5] },
  ],
  run(nums, t, L) {
    const say = once()
    const result = []
    const path = []
    const frames = []
    const panels = i => [
      P.array('nums', nums, { pointers: i !== undefined && i < nums.length ? { i } : {}, highlight: i !== undefined && i < nums.length ? [i] : [], dim: nums.map((_, k) => k).filter(k => i !== undefined && k < i) }),
      P.array('path', path),
      P.calls(frames),
      P.text(`result = ${JSON.stringify(result)}`),
    ]
    t.step(L('result, path'), { vars: {}, panels: panels(), note: 'path = current choices', say: say('a', 'Each number is in or out: a binary decision tree with 2^n leaves.') })
    const dfs = i => {
      frames.push(`dfs(${i})`)
      if (i === nums.length) {
        result.push([...path])
        t.step(L('result.append(path.copy())'), { vars: { i, path: [...path] }, panels: panels(i), note: `Leaf: record ${JSON.stringify(path)}`, say: say('copy', 'Copy the path. Appending path itself would store a reference that later changes.') })
        frames.pop()
        return
      }
      path.push(nums[i])
      t.step(L('path.append(nums[i])'), { vars: { i, path: [...path] }, panels: panels(i), note: `Take ${nums[i]}` })
      dfs(i + 1)
      path.pop()
      t.step(L('path.pop()'), { vars: { i, path: [...path] }, panels: panels(i), note: `Undo ${nums[i]}, now skip it`, say: say('undo', 'Backtrack: undo the choice so the skip branch starts clean.') })
      dfs(i + 1)
      frames.pop()
    }
    dfs(0)
    t.step(L('return result'), { vars: { count: result.length }, panels: panels(), note: `${result.length} subsets`, say: 'O(n·2^n) time, O(n) extra space besides the output.' })
  },
  blanks: ['i == len(nums)', ['path.copy()', 'path[:]', 'list(path)'], 'path.pop()'],
  distractors: ['result.append(path)'],
})

def({
  slug: 'permutations',
  title: 'Permutations (backtracking)',
  branch: 'backtracking',
  tier: 1,
  skills: ['backtracking'],
  prereqs: ['subsets'],
  oneLiner: 'Fill slots one at a time with any unused item.',
  whenToUse: ['all orderings / arrangements', 'n ≤ 8-10', 'order matters', 'N-Queens style placement'],
  notWhen: ['order does not matter: subsets / combinations', 'only next permutation: in-place swap trick'],
  mnemonic: 'Musical chairs: for each seat try every unused person; mark used, recurse, unmark.',
  steps: ['len(path) == n → record copy', 'for i in range(n)', 'skip if used', 'used.add(i); path.append', 'dfs()', 'path.pop(); used.remove(i)'],
  template: `class Solution:
    def permute(self, nums: List[int]) -> List[List[int]]:
        result, path = [], []
        used = set()

        def dfs():
            if len(path) == len(nums):
                result.append(path.copy())
                return

            for i in range(len(nums)):
                if i in used:
                    continue
                used.add(i)
                path.append(nums[i])
                dfs()
                path.pop()
                used.remove(i)

        dfs()
        return result`,
  time: 'O(n·n!)',
  space: 'O(n)',
  whyComplexity: 'n! leaves, each copying n items; depth n plus the used set.',
  variants: ['Permutations II with duplicates (LC 47)', 'N-Queens (LC 51)', 'Next permutation (LC 31)', 'Letter case permutation (LC 784)'],
  relatedLc: [46, 47, 51, 31],
  compare: [['subsets', 'Subsets decide in/out; permutations decide order'], ['combination-sum', 'Combinations start from i to avoid reorderings']],
  problem: 'Return all orderings of distinct numbers.',
  inputs: [
    { label: '[1,2,3]', value: [1, 2, 3] },
    { label: '[0,1]', value: [0, 1] },
  ],
  parsons: { start: 'def dfs', end: 'used.remove(i)' },
  run(nums, t, L) {
    const say = once()
    const result = []
    const path = []
    const used = new Set()
    const frames = []
    const panels = i => [
      P.array('nums', nums, { pointers: i !== undefined ? { i } : {}, highlight: i !== undefined ? [i] : [], dim: [...used] }),
      P.array('path', path),
      P.set('used', [...used].map(k => `i${k}`)),
      P.calls(frames),
      P.text(`result = ${JSON.stringify(result)}`),
    ]
    t.step(L('used = set()'), { vars: {}, panels: panels(), note: 'used tracks indices in the path', say: say('a', 'n choices for the first slot, n−1 for the next: n! orderings.') })
    const dfs = () => {
      frames.push(`dfs(${JSON.stringify(path)})`)
      if (path.length === nums.length) {
        result.push([...path])
        t.step(L('result.append(path.copy())'), { vars: { path: [...path] }, panels: panels(), note: `Full: record ${JSON.stringify(path)}`, say: say('rec', 'All slots filled, so record a copy.') })
        frames.pop()
        return
      }
      for (let i = 0; i < nums.length; i++) {
        if (used.has(i)) {
          t.step(L('continue'), { vars: { i }, panels: panels(i), note: `${nums[i]} already used: skip` })
          continue
        }
        used.add(i)
        path.push(nums[i])
        t.step(L('path.append(nums[i])'), { vars: { i, path: [...path] }, panels: panels(i), note: `Place ${nums[i]} in slot ${path.length - 1}`, say: say('pick', 'Choose an unused number, mark it, recurse for the next slot.') })
        dfs()
        path.pop()
        used.delete(i)
        t.step(L('used.remove(i)'), { vars: { i, path: [...path] }, panels: panels(i), note: `Undo ${nums[i]}`, say: say('undo', 'Undo both the path and the used mark so siblings can use it.') })
      }
      frames.pop()
    }
    dfs()
    t.step(L('return result'), { vars: { count: result.length }, panels: panels(), note: `${result.length} permutations`, say: 'O(n·n!) time, O(n) extra space.' })
  },
  blanks: ['len(path) == len(nums)', 'i in used', 'path.pop()', 'used.remove(i)'],
})

def({
  slug: 'combination-sum',
  title: 'Combination sum (backtracking)',
  branch: 'backtracking',
  tier: 2,
  skills: ['backtracking'],
  prereqs: ['subsets'],
  oneLiner: 'Loop from start; reuse allowed; prune when total exceeds target.',
  whenToUse: ['all combinations summing to target', 'unlimited reuse of candidates', 'choose k of n', 'no duplicate orderings'],
  notWhen: ['only the count or min coins: DP', 'large target with small values: DP'],
  mnemonic: 'for i from start: start (not 0) kills reorderings; dfs(i) not i+1 allows reuse; total > target prunes.',
  steps: ['dfs(start, total)', 'total == target → record copy', 'total > target → return', 'for i in range(start, n)', 'append, dfs(i, total + c), pop'],
  template: `class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        result, path = [], []

        def dfs(start, total):
            if total == target:
                result.append(path.copy())
                return
            if total > target:
                return

            for i in range(start, len(candidates)):
                path.append(candidates[i])
                dfs(i, total + candidates[i])
                path.pop()

        dfs(0, 0)
        return result`,
  time: 'O(n^(t/m))',
  space: 'O(t/m)',
  whyComplexity: 'Branching n, depth up to target / smallest candidate; exponential, so pruning matters.',
  variants: ['Combination sum II: each once, skip duplicates (LC 40)', 'Combinations n choose k (LC 77)', 'Combination sum III (LC 216)', 'Coin change count is DP (LC 518)'],
  relatedLc: [39, 40, 77, 216],
  compare: [['subsets', 'Subsets take each item at most once, no target'], ['knapsack-unbounded', 'DP counts or optimizes instead of listing']],
  problem: 'List unique combinations (with reuse) that sum to target.',
  inputs: [
    { label: '[2,3,6,7] t=7', value: { candidates: [2, 3, 6, 7], target: 7 } },
    { label: '[2,3] t=6', value: { candidates: [2, 3], target: 6 } },
    { label: '[3,4,5] t=8', value: { candidates: [3, 4, 5], target: 8 } },
  ],
  run({ candidates, target }, t, L) {
    const say = once()
    const result = []
    const path = []
    const frames = []
    const panels = (i, total) => [
      P.array('candidates', candidates, { pointers: i !== undefined ? { i } : {}, highlight: i !== undefined ? [i] : [] }),
      P.array('path', path),
      P.calls(frames),
      P.text(`total = ${total ?? 0} / ${target}   result = ${JSON.stringify(result)}`),
    ]
    t.step(L('dfs(0, 0)'), { vars: { target }, panels: panels(undefined, 0), note: 'Start with nothing chosen', say: say('a', 'Backtracking over choices. Starting at index start avoids [2,3] and [3,2] both appearing.') })
    const dfs = (start, total) => {
      frames.push(`dfs(${start}, ${total})`)
      if (total === target) {
        result.push([...path])
        t.step(L('result.append(path.copy())'), { vars: { path: [...path], total }, panels: panels(undefined, total), note: `Hit ${target}: record ${JSON.stringify(path)}` })
        frames.pop()
        return
      }
      if (total > target) {
        t.step(L('if total > target'), { vars: { total }, panels: panels(undefined, total), note: `${total} > ${target}: prune`, say: say('prune', 'Overshot the target, so stop exploring this branch.') })
        frames.pop()
        return
      }
      for (let i = start; i < candidates.length; i++) {
        path.push(candidates[i])
        t.step(L('dfs(i, total'), { vars: { i, path: [...path], total: total + candidates[i] }, panels: panels(i, total + candidates[i]), note: `Try ${candidates[i]} → total ${total + candidates[i]}`, say: say('reuse', 'I recurse with i, not i + 1, so the same number can be reused.') })
        dfs(i, total + candidates[i])
        path.pop()
        t.step(L('path.pop()'), { vars: { i, path: [...path] }, panels: panels(i, total), note: `Undo ${candidates[i]}` })
      }
      frames.pop()
    }
    dfs(0, 0)
    t.step(L('return result'), { vars: { result: clone(result) }, panels: panels(undefined, 0), note: `${result.length} combination(s)`, say: 'Exponential time, bounded by pruning. Space is the recursion depth, target / min.' })
  },
  blanks: ['total > target', 'range(start, len(candidates))', 'dfs(i, total + candidates[i])'],
})


const gtRange = n => Array.from({ length: n }, (_, i) => i)

const gtAdj = (n, edges, directed) => {
  const graph = {}
  for (let i = 0; i < n; i++) graph[i] = []
  for (const [a, b] of edges) {
    graph[a].push(b)
    if (!directed) graph[b].push(a)
  }
  return graph
}

const gtG = (n, edges, directed, pos) => ({ directed, nodes: gtRange(n), edges, ...(pos ? { pos } : {}) })

const gtTwoClusters = {
  0: [0.12, 0.22], 1: [0.08, 0.6], 2: [0.36, 0.4], 3: [0.24, 0.86],
  4: [0.62, 0.18], 5: [0.9, 0.32], 6: [0.68, 0.56], 7: [0.88, 0.84],
}

const gtLayered = {
  0: [0.1, 0.5], 1: [0.32, 0.2], 2: [0.32, 0.8], 3: [0.56, 0.5], 4: [0.8, 0.2], 5: [0.8, 0.8], 6: [0.95, 0.5],
}

def({
  slug: 'graph-dfs',
  title: 'Graph DFS (recursive)',
  branch: 'traversal',
  tier: 1,
  skills: ['graph-dfs', 'graph-modeling'],
  prereqs: ['tree-dfs'],
  oneLiner: 'Go deep from a node, mark seen, recurse into unseen neighbors.',
  whenToUse: ['connected components / count groups', 'can I reach X from Y', 'explore every node once', 'path exists, clone graph'],
  notWhen: ['shortest path in steps: BFS', 'weighted shortest path: Dijkstra', 'depth up to 10^5: recursion limit, go iterative'],
  mnemonic: 'Maze with chalk: mark the wall, take an unmarked door, back up at dead ends.',
  steps: ['build graph = dd(list), both directions', 'seen = set()', 'dfs(node): seen.add(node)', 'recurse on unseen neighbors', 'outer loop: unseen node → dfs, result += 1'],
  template: `class Solution:
    def countComponents(self, n: int, edges: List[List[int]]) -> int:
        graph = dd(list)

        for a, b in edges:
            graph[a].append(b)
            graph[b].append(a)

        seen = set()

        def dfs(node):
            seen.add(node)

            for nei in graph[node]:
                if nei not in seen:
                    dfs(nei)

        result = 0

        for node in range(n):
            if node not in seen:
                dfs(node)
                result += 1

        return result`,
  time: 'O(V+E)',
  space: 'O(V+E)',
  whyComplexity: 'Each node is entered once and each edge checked twice; adjacency list plus recursion stack.',
  variants: ['Number of provinces (LC 547)', 'Clone graph (LC 133)', 'Find if path exists (LC 1971)', 'Keys and rooms (LC 841)'],
  relatedLc: [323, 547, 133, 1971, 841],
  compare: [['graph-bfs', 'BFS goes level by level and gives shortest unweighted paths'], ['union-find', 'Union-find counts components incrementally, edge by edge']],
  problem: 'Count connected components in an undirected graph with n nodes.',
  inputs: [
    { label: '3 groups', value: { n: 8, edges: [[0, 1], [0, 2], [1, 3], [4, 5], [5, 6], [4, 6]], pos: gtTwoClusters } },
    { label: 'one tree', value: { n: 7, edges: [[0, 1], [0, 2], [1, 3], [3, 4], [2, 5], [5, 6]], pos: gtLayered } },
    { label: 'all alone', value: { n: 4, edges: [[1, 2]] } },
  ],
  run({ n, edges, pos }, t, L) {
    const say = once()
    const graph = gtAdj(n, edges, false)
    const g = gtG(n, edges, false, pos)
    const seen = new Set()
    const state = {}
    const es = {}
    const comp = {}
    const frames = []
    let result = 0
    const panels = () => [P.graph('graph', g, state, es, comp), P.calls(frames), P.set('seen', [...seen]), P.text(`components = ${result}`)]
    t.step(L('graph = dd(list)'), { vars: { n }, panels: panels(), note: 'Build adjacency list from edges', say: say('a', 'First I turn the edge list into an adjacency list, adding each undirected edge both ways.') })
    t.step(L('seen = set()'), { vars: {}, panels: panels(), note: 'seen guards against revisits', say: say('seen', 'A seen set guarantees each node is processed once, which gives O(V+E).') })
    const dfs = (node, from) => {
      frames.push(`dfs(${node})`)
      seen.add(node)
      state[node] = 'current'
      comp[node] = `c${result + 1}`
      if (from !== undefined) es[ek(from, node)] = 'tree'
      t.step(L('seen.add(node)'), { vars: { node }, panels: panels(), note: `Enter ${node}, mark seen`, say: say('mark', 'I mark the node seen on entry, before exploring neighbors, so cycles cannot loop me.') })
      state[node] = 'path'
      for (const nei of graph[node]) {
        if (!seen.has(nei)) {
          es[ek(node, nei)] = 'active'
          t.step(L('if nei not in seen'), { vars: { node, nei }, panels: panels(), note: `${nei} unseen: go deeper`, say: say('deep', 'Unseen neighbor, so I recurse right away. That is the depth-first part.') })
          dfs(nei, node)
          state[node] = 'current'
          t.step(L('for nei in graph[node]'), { vars: { node }, panels: panels(), note: `Back at ${node}, try next neighbor` })
          state[node] = 'path'
        } else {
          t.step(L('if nei not in seen'), { vars: { node, nei }, panels: panels(), note: `${nei} already seen: skip` })
        }
      }
      state[node] = 'done'
      frames.pop()
      t.step(L('dfs(nei)'), { vars: { node }, panels: panels(), note: `${node} finished, return`, say: say('back', 'All neighbors done, so this call returns and we backtrack.') })
    }
    t.step(L('result = 0'), { vars: { result }, panels: panels(), note: 'Count components' })
    for (let node = 0; node < n; node++) {
      if (seen.has(node)) continue
      t.step(L('if node not in seen'), { vars: { node }, panels: panels(), note: `${node} unseen: new component`, say: say('outer', 'Every unseen node in the outer loop starts a brand new component.') })
      dfs(node)
      result++
      t.step(L('result += 1'), { vars: { result }, panels: panels(), note: `Component ${result} fully explored` })
    }
    t.step(L('return result'), { vars: { result }, panels: panels(), note: `${result} components`, say: 'O(V+E) time and space: each node once, each edge twice.' })
  },
  parsons: { start: 'seen = set()', end: 'return result' },
  blanks: ['seen.add(node)', 'if nei not in seen', 'dfs(nei)', 'result += 1'],
  distractors: ['seen.remove(node)', 'return dfs(nei)'],
})

def({
  slug: 'graph-dfs-iterative',
  title: 'Graph DFS (iterative stack)',
  branch: 'traversal',
  tier: 2,
  skills: ['graph-dfs', 'stack'],
  prereqs: ['graph-dfs'],
  oneLiner: 'Same DFS, but an explicit stack replaces the call stack.',
  whenToUse: ['deep graphs: recursion limit risk', 'path exists between source and destination', 'interviewer asks for no recursion', 'n up to 10^5 chain'],
  notWhen: ['need shortest steps: BFS', 'need post-order finish times: recursive is simpler'],
  mnemonic: 'Swap deque for list, popleft for pop: BFS becomes DFS. Mark seen on push.',
  steps: ['build graph', 'seen = {source}, stack = [source]', 'while stack: node = stack.pop()', 'node == destination → True', 'push unseen neighbors, mark seen'],
  template: `class Solution:
    def validPath(self, n: int, edges: List[List[int]], source: int, destination: int) -> bool:
        graph = dd(list)

        for a, b in edges:
            graph[a].append(b)
            graph[b].append(a)

        seen = {source}
        stack = [source]

        while stack:
            node = stack.pop()

            if node == destination:
                return True

            for nei in graph[node]:
                if nei not in seen:
                    seen.add(nei)
                    stack.append(nei)

        return False`,
  time: 'O(V+E)',
  space: 'O(V+E)',
  whyComplexity: 'Each node pushed at most once thanks to seen; each edge scanned twice.',
  variants: ['Clone graph without recursion (LC 133)', 'Iterative islands', 'Keys and rooms (LC 841)'],
  relatedLc: [1971, 841, 133],
  compare: [['graph-dfs', 'Recursive version is shorter but can hit Python recursion limit'], ['graph-bfs', 'Queue instead of stack gives level order and shortest paths']],
  problem: 'Is there a path from source to destination?',
  inputs: [
    { label: 'reachable', value: { n: 7, edges: [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [4, 6], [2, 5]], source: 0, destination: 6, pos: gtLayered } },
    { label: 'cut off', value: { n: 8, edges: [[0, 1], [0, 2], [1, 3], [4, 5], [5, 6], [4, 6]], source: 0, destination: 5, pos: gtTwoClusters } },
  ],
  run({ n, edges, source, destination, pos }, t, L) {
    const say = once()
    const graph = gtAdj(n, edges, false)
    const g = gtG(n, edges, false, pos)
    const seen = new Set([source])
    const stack = [source]
    const state = { [source]: 'frontier' }
    const es = {}
    const values = { [destination]: 'goal' }
    const panels = () => [P.graph('graph', g, state, es, values), P.stack('stack', stack, stack.length ? [stack.length - 1] : []), P.set('seen', [...seen])]
    t.step(L('graph = dd(list)'), { vars: { source, destination }, panels: panels(), note: 'Adjacency list', say: say('a', 'Reachability only, so any traversal works. I use an explicit stack to avoid recursion depth issues.') })
    t.step(L('stack = [source]'), { vars: { stack: [...stack] }, panels: panels(), note: 'Push source, mark seen' })
    while (stack.length) {
      const node = stack.pop()
      state[node] = 'current'
      t.step(L('node = stack.pop()'), { vars: { node, stack: [...stack] }, panels: panels(), note: `Pop ${node} from the top`, say: say('pop', 'Popping from the end is last-in first-out, so I keep diving into the newest branch.') })
      if (node === destination) {
        state[node] = 'path'
        t.step(L('return True'), { vars: { node }, panels: panels(), note: `Reached ${destination}`, say: 'Found the destination. O(V+E) time and space.' })
        return
      }
      for (const nei of graph[node]) {
        if (!seen.has(nei)) {
          seen.add(nei)
          stack.push(nei)
          state[nei] = 'frontier'
          es[ek(node, nei)] = 'tree'
          t.step(L('stack.append(nei)'), { vars: { node, nei }, panels: panels(), note: `Push ${nei}, mark seen`, say: say('push', 'I mark seen at push time so a node never sits in the stack twice.') })
        }
      }
      state[node] = 'done'
    }
    t.step(L('return False'), { vars: {}, panels: panels(), note: 'Stack empty: unreachable', say: 'Explored everything reachable without hitting the destination, so False.' })
  },
  blanks: ['stack.pop()', 'if nei not in seen', 'stack.append(nei)'],
})

def({
  slug: 'graph-bfs',
  title: 'Graph BFS (shortest unweighted)',
  branch: 'traversal',
  tier: 1,
  skills: ['graph-bfs', 'queue-deque'],
  prereqs: ['tree-bfs'],
  oneLiner: 'Explore in rings from start; first arrival is the shortest path.',
  whenToUse: ['minimum number of steps / moves / hops', 'unweighted graph or grid', 'word ladder, knight moves', 'level by level'],
  notWhen: ['edges have different weights: Dijkstra', 'just need reachability: DFS is fine', '0/1 weights: 0-1 BFS'],
  mnemonic: 'Ripples in a pond: every node at distance d is reached before any at d + 1.',
  steps: ['queue = deque([start]), seen = {start}', 'while queue: for _ in range(len(queue))', 'node = queue.popleft()', 'node == end → return steps', 'enqueue unseen neighbors, mark seen', 'steps += 1'],
  template: `class Solution:
    def shortestPath(self, n: int, edges: List[List[int]], start: int, end: int) -> int:
        graph = dd(list)

        for a, b in edges:
            graph[a].append(b)
            graph[b].append(a)

        seen = {start}
        queue = deque([start])
        steps = 0

        while queue:
            for _ in range(len(queue)):
                node = queue.popleft()

                if node == end:
                    return steps

                for nei in graph[node]:
                    if nei not in seen:
                        seen.add(nei)
                        queue.append(nei)

            steps += 1

        return -1`,
  time: 'O(V+E)',
  space: 'O(V)',
  whyComplexity: 'Each node enqueued once, each edge checked twice; queue and seen hold up to V nodes.',
  variants: ['Word ladder (LC 127)', 'Shortest path in binary matrix (LC 1091)', 'Open the lock (LC 752)', 'Minimum knight moves (LC 1197)'],
  relatedLc: [127, 1091, 752, 1197, 433],
  compare: [['graph-dfs', 'DFS finds a path, not the shortest one'], ['dijkstra', 'Dijkstra handles weights with a heap, O((V+E) log V)'], ['zero-one-bfs', '0-1 BFS handles weights 0 and 1 with a deque']],
  problem: 'Fewest edges from start to end in an undirected graph, or -1.',
  inputs: [
    { label: 'layers', value: { n: 7, edges: [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 6], [5, 6]], start: 0, end: 6, pos: gtLayered } },
    { label: 'shortcut', value: { n: 6, edges: [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 4]], start: 0, end: 4 } },
    { label: 'unreachable', value: { n: 8, edges: [[0, 1], [0, 2], [1, 3], [4, 5], [5, 6], [4, 6]], start: 0, end: 6, pos: gtTwoClusters } },
  ],
  run({ n, edges, start, end, pos }, t, L) {
    const say = once()
    const graph = gtAdj(n, edges, false)
    const g = gtG(n, edges, false, pos)
    const seen = new Set([start])
    const queue = [start]
    let steps = 0
    const state = { [start]: 'frontier' }
    const es = {}
    const dist = { [start]: 0 }
    const values = () => Object.fromEntries(Object.entries(dist).map(([k, v]) => [k, `d=${v}`]))
    const panels = () => [P.graph('graph', g, state, es, values()), P.queue('queue', queue, queue.length ? [0] : []), P.set('seen', [...seen]), P.text(`steps = ${steps}   end = ${end}`)]
    t.step(L('graph = dd(list)'), { vars: { start, end }, panels: panels(), note: 'Adjacency list, both directions', say: say('a', 'Unweighted shortest path, so BFS: it explores in rings of equal distance.') })
    t.step(L('queue = deque'), { vars: { queue: [...queue] }, panels: panels(), note: 'Seed queue with start, already seen', say: say('seen', 'I mark seen when I enqueue, not when I pop, so nothing is queued twice.') })
    while (queue.length) {
      const size = queue.length
      t.step(L('for _ in range(len(queue))'), { vars: { steps, size }, panels: panels(), note: `Ring ${steps}: ${size} node(s)`, say: say('level', 'Snapshot len(queue): one pass of this loop is exactly one distance level.') })
      for (let i = 0; i < size; i++) {
        const node = queue.shift()
        state[node] = 'current'
        t.step(L('node = queue.popleft()'), { vars: { node, steps }, panels: panels(), note: `Pop ${node} at distance ${steps}` })
        if (node === end) {
          state[node] = 'path'
          t.step(L('return steps'), { vars: { node, steps }, panels: panels(), note: `Reached ${end} in ${steps} steps`, say: 'The first time BFS pops the target is the shortest distance. O(V+E) time, O(V) space.' })
          return
        }
        for (const nei of graph[node]) {
          if (!seen.has(nei)) {
            seen.add(nei)
            queue.push(nei)
            state[nei] = 'frontier'
            dist[nei] = steps + 1
            es[ek(node, nei)] = 'tree'
            t.step(L('queue.append(nei)'), { vars: { node, nei }, panels: panels(), note: `Enqueue ${nei} at distance ${steps + 1}` })
          }
        }
        state[node] = 'done'
      }
      steps++
      t.step(L('steps += 1'), { vars: { steps }, panels: panels(), note: `Next ring: distance ${steps}` })
    }
    t.step(L('return -1'), { vars: {}, panels: panels(), note: 'Queue empty: end unreachable', say: 'Queue drained without reaching end, so it is in another component: -1.' })
  },
  parsons: { start: 'seen = {start}', end: 'return -1' },
  blanks: ['deque([start])', 'len(queue)', 'queue.popleft()', 'seen.add(nei)'],
  distractors: ['node = queue.pop()', 'seen.add(node)'],
})

def({
  slug: 'multi-source-bfs',
  title: 'Multi-source BFS',
  branch: 'traversal',
  tier: 1,
  skills: ['graph-bfs', 'grid', 'queue-deque'],
  prereqs: ['graph-bfs'],
  oneLiner: 'Seed the queue with every source at once, then BFS normally.',
  whenToUse: ['spreads from many cells at once (rot, fire, gates)', 'distance to nearest X for every cell', 'minutes until all infected', '01 matrix'],
  notWhen: ['single source and target: plain BFS', 'weighted spread: Dijkstra'],
  mnemonic: 'All alarms ring at once: drop every source in the queue at minute 0.',
  steps: ['scan grid: sources → queue, count fresh', 'while queue and fresh', 'for _ in range(len(queue)): pop', 'infect fresh neighbors, fresh -= 1, enqueue', 'minutes += 1', 'fresh == 0 ? minutes : -1'],
  template: `class Solution:
    def orangesRotting(self, grid: List[List[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        queue = deque()
        fresh = 0

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 2:
                    queue.append((r, c))
                elif grid[r][c] == 1:
                    fresh += 1

        minutes = 0

        while queue and fresh:
            for _ in range(len(queue)):
                r, c = queue.popleft()

                for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
                    nr, nc = r + dr, c + dc

                    if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                        grid[nr][nc] = 2
                        fresh -= 1
                        queue.append((nr, nc))

            minutes += 1

        return minutes if fresh == 0 else -1`,
  time: 'O(r·c)',
  space: 'O(r·c)',
  whyComplexity: 'Every cell enters the queue at most once and checks 4 neighbors.',
  variants: ['Walls and gates / islands and treasure (LC 286)', '01 matrix (LC 542)', 'As far from land as possible (LC 1162)', 'Pacific Atlantic: BFS from both oceans (LC 417)'],
  relatedLc: [994, 286, 542, 1162, 417],
  compare: [['graph-bfs', 'Plain BFS starts from one node'], ['flood-fill', 'Flood fill marks regions; it does not measure distance']],
  problem: 'Each minute rot spreads to adjacent fresh oranges. Minutes until none fresh, or -1.',
  inputs: [
    { label: 'one source', value: [[2, 1, 1], [1, 1, 0], [0, 1, 1]] },
    { label: 'two sources', value: [[2, 1, 1, 1, 2], [1, 0, 0, 1, 1], [1, 1, 0, 1, 0]] },
    { label: 'unreachable', value: [[2, 1, 0, 1], [1, 1, 0, 1]] },
  ],
  run(grid, t, L) {
    const say = once()
    const rows = grid.length
    const cols = grid[0].length
    const queue = []
    let fresh = 0
    let minutes = 0
    const state = {}
    const values = {}
    const sync = () => {
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const key = `${r},${c}`
        if (grid[r][c] === 0) state[key] = 'wall'
        else if (grid[r][c] === 2 && !state[key]) state[key] = 'done'
      }
    }
    const panels = cur => {
      const st = { ...state }
      if (cur) st[cur] = 'current'
      return [P.grid('grid (2 rotten, 1 fresh, 0 empty)', grid, st, values), P.queue('queue', queue.map(([r, c]) => `(${r},${c})`), queue.length ? [0] : []), P.text(`minute = ${minutes}   fresh = ${fresh}`)]
    }
    sync()
    t.step(L('rows, cols = len(grid)'), { vars: { rows, cols }, panels: panels(), note: 'Grid is the graph: cells are nodes', say: say('a', 'Each cell is a node with up to 4 neighbors. All rotten oranges spread at once, so multi-source BFS.') })
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === 2) {
          queue.push([r, c])
          values[`${r},${c}`] = '0'
          t.step(L('queue.append((r, c))'), { vars: { r, c }, panels: panels(`${r},${c}`), note: `Source (${r},${c}) enters at minute 0`, say: say('seed', 'Every source goes in the queue before BFS starts, so they all expand in lockstep.') })
        } else if (grid[r][c] === 1) fresh++
      }
    }
    t.step(L('fresh += 1'), { vars: { fresh }, panels: panels(), note: `${fresh} fresh oranges counted` })
    t.step(L('minutes = 0'), { vars: { minutes, fresh }, panels: panels(), note: 'Start the clock' })
    while (queue.length && fresh) {
      const size = queue.length
      t.step(L('for _ in range(len(queue))'), { vars: { minutes, size, fresh }, panels: panels(), note: `Minute ${minutes}: ${size} rotten spread`, say: say('level', 'One level of the queue is one minute of spreading.') })
      for (let i = 0; i < size; i++) {
        const [r, c] = queue.shift()
        t.step(L('r, c = queue.popleft()'), { vars: { r, c }, panels: panels(`${r},${c}`), note: `Spread from (${r},${c})` })
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nr = r + dr
          const nc = c + dc
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1) {
            grid[nr][nc] = 2
            fresh--
            queue.push([nr, nc])
            state[`${nr},${nc}`] = 'frontier'
            values[`${nr},${nc}`] = String(minutes + 1)
            t.step(L('grid[nr][nc] = 2'), { vars: { nr, nc, fresh }, panels: panels(`${r},${c}`), note: `(${nr},${nc}) rots at minute ${minutes + 1}`, say: say('infect', 'Marking it rotten right away doubles as the seen set: no extra memory.') })
          }
        }
        state[`${r},${c}`] = 'done'
      }
      minutes++
      t.step(L('minutes += 1'), { vars: { minutes, fresh }, panels: panels(), note: `Minute ${minutes} done, ${fresh} fresh left` })
    }
    t.step(L('return minutes if'), { vars: { minutes, fresh, answer: fresh === 0 ? minutes : -1 }, panels: panels(), note: fresh === 0 ? `All rotten after ${minutes} minutes` : `${fresh} fresh unreachable: -1`, say: 'O(r·c) time and space: each cell enters the queue once.' })
  },
  parsons: { start: 'minutes = 0', end: 'return minutes' },
  blanks: ['queue.append((r, c))', 'while queue and fresh', 'fresh -= 1', 'minutes += 1'],
  distractors: ['minutes += 1 inside the neighbor loop'],
})

def({
  slug: 'flood-fill',
  title: 'Grid flood fill (islands)',
  branch: 'traversal',
  tier: 1,
  skills: ['grid', 'graph-dfs'],
  prereqs: ['graph-dfs'],
  oneLiner: 'DFS from each unvisited land cell, sinking the whole island.',
  whenToUse: ['count islands / regions in a grid', 'area of largest island', 'paint bucket fill', 'surrounded regions'],
  notWhen: ['need distance or minutes: BFS', 'cells change over time: multi-source BFS'],
  mnemonic: 'Sink the island: step on land, turn it to water, stomp all four directions.',
  steps: ['rows, cols = len(grid), len(grid[0])', 'dfs: out of bounds or water → return', 'sink: grid[r][c] = "0"', 'dfs 4 directions', 'scan: land → dfs, result += 1'],
  template: `class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        rows, cols, result = len(grid), len(grid[0]), 0

        def dfs(row, col):
            if row < 0 or row >= rows or col < 0 or col >= cols or grid[row][col] == "0":
                return

            grid[row][col] = "0"

            dfs(row + 1, col)
            dfs(row - 1, col)
            dfs(row, col + 1)
            dfs(row, col - 1)

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == "1":
                    dfs(r, c)
                    result += 1

        return result`,
  time: 'O(r·c)',
  space: 'O(r·c)',
  whyComplexity: 'Each cell sunk once; recursion can go r·c deep on a snake-shaped island.',
  variants: ['Max area of island (LC 695)', 'Flood fill (LC 733)', 'Surrounded regions (LC 130)', 'Pacific Atlantic water flow (LC 417)'],
  relatedLc: [200, 695, 733, 130, 417],
  compare: [['multi-source-bfs', 'BFS measures spread distance; flood fill just marks regions'], ['union-find', 'Union-find also counts islands, handy when land is added online']],
  problem: 'Count islands of "1" connected up, down, left, right.',
  inputs: [
    { label: '3 islands', value: [['1', '1', '0', '0'], ['1', '0', '0', '1'], ['0', '0', '1', '1'], ['1', '0', '0', '0']] },
    { label: 'snake', value: [['1', '1', '1', '0'], ['0', '0', '1', '0'], ['1', '1', '1', '0']] },
  ],
  run(grid, t, L) {
    const say = once()
    const rows = grid.length
    const cols = grid[0].length
    let result = 0
    const state = {}
    const values = {}
    const frames = []
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (grid[r][c] === '0') state[`${r},${c}`] = 'wall'
    const panels = cur => {
      const st = { ...state }
      if (cur) st[cur] = 'current'
      return [P.grid('grid', grid, st, values), P.calls(frames), P.text(`islands = ${result}`)]
    }
    t.step(L('rows, cols, result'), { vars: { rows, cols, result }, panels: panels(), note: 'Grid as implicit graph', say: say('a', 'Each land cell is a node; neighbors are the 4 directions. Each DFS sinks one whole island.') })
    const dfs = (row, col) => {
      frames.push(`dfs(${row},${col})`)
      const inside = row >= 0 && row < rows && col >= 0 && col < cols
      if (!inside || grid[row][col] === '0') {
        if (inside) t.step(L('return'), { vars: { row, col }, panels: panels(`${row},${col}`), note: `(${row},${col}) is water: return`, say: say('base', 'Base case: off the grid or water, stop. One line guards every direction.') })
        frames.pop()
        return
      }
      grid[row][col] = '0'
      state[`${row},${col}`] = 'visited'
      values[`${row},${col}`] = `#${result + 1}`
      t.step(L('grid[row][col] = "0"'), { vars: { row, col }, panels: panels(`${row},${col}`), note: `Sink (${row},${col})`, say: say('sink', 'I flip land to water so it is never counted again. The grid is my seen set.') })
      dfs(row + 1, col)
      dfs(row - 1, col)
      dfs(row, col + 1)
      dfs(row, col - 1)
      frames.pop()
    }
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === '1') {
          t.step(L('if grid[r][c] == "1"'), { vars: { r, c }, panels: panels(`${r},${c}`), note: `Fresh land at (${r},${c}): new island`, say: say('scan', 'Unvisited land during the scan means a new island. DFS sinks all of it.') })
          dfs(r, c)
          result++
          t.step(L('result += 1'), { vars: { result }, panels: panels(), note: `Island ${result} sunk` })
        }
      }
    }
    t.step(L('return result'), { vars: { result }, panels: panels(), note: `${result} islands`, say: 'O(r·c) time: each cell visited a constant number of times. O(r·c) worst-case stack.' })
  },
  parsons: { start: 'def dfs', end: 'return result' },
  blanks: ['grid[row][col] == "0"', 'grid[row][col] = "0"', 'dfs(r, c)', 'result += 1'],
})

def({
  slug: 'bipartite',
  title: 'Bipartite check (2-coloring)',
  branch: 'traversal',
  tier: 2,
  skills: ['graph-bfs', 'graph-modeling'],
  prereqs: ['graph-bfs'],
  oneLiner: 'BFS-color neighbors opposite; same-color edge means not bipartite.',
  whenToUse: ['split into two groups with no conflicts inside', 'possible bipartition / dislike pairs', 'two-coloring', 'odd cycle detection'],
  notWhen: ['more than two groups: general coloring is NP-hard', 'directed dependencies: topo sort'],
  mnemonic: 'Checkerboard: every edge must join black to white. Same color touching = odd cycle.',
  steps: ['color = {}', 'for each uncolored start: color 0, BFS', 'pop node', 'uncolored nei → 1 - color[node], enqueue', 'same color → False'],
  template: `class Solution:
    def isBipartite(self, graph: List[List[int]]) -> bool:
        color = {}

        for start in range(len(graph)):
            if start in color:
                continue

            color[start] = 0
            queue = deque([start])

            while queue:
                node = queue.popleft()

                for nei in graph[node]:
                    if nei not in color:
                        color[nei] = 1 - color[node]
                        queue.append(nei)
                    elif color[nei] == color[node]:
                        return False

        return True`,
  time: 'O(V+E)',
  space: 'O(V)',
  whyComplexity: 'Plain BFS over every component; each node colored once.',
  variants: ['Possible bipartition (LC 886)', 'Is graph bipartite (LC 785)', 'Union-find version: union all neighbors of a node'],
  relatedLc: [785, 886],
  compare: [['graph-bfs', 'Same traversal, but storing a color instead of a distance'], ['cycle-undirected', 'Bipartite fails exactly on odd cycles']],
  problem: 'Can nodes be split into two sets so every edge crosses between them?',
  inputs: [
    { label: 'square', value: { graph: [[1, 3], [0, 2], [1, 3], [0, 2]], pos: { 0: [0.2, 0.2], 1: [0.8, 0.2], 2: [0.8, 0.8], 3: [0.2, 0.8] } } },
    { label: 'triangle', value: { graph: [[1, 2, 3], [0, 2], [0, 1, 3], [0, 2]], pos: { 0: [0.2, 0.2], 1: [0.8, 0.2], 2: [0.8, 0.8], 3: [0.2, 0.8] } } },
    { label: 'hexagon + pair', value: { graph: [[1, 5], [0, 2], [1, 3], [2, 4], [3, 5], [4, 0], [7], [6]] } },
  ],
  run({ graph, pos }, t, L) {
    const say = once()
    const n = graph.length
    const edges = []
    graph.forEach((list, u) => list.forEach(v => { if (u < v) edges.push([u, v]) }))
    const g = gtG(n, edges, false, pos)
    const color = new Map()
    const state = {}
    const es = {}
    let queue = []
    const panels = () => [
      P.graph('graph (A / B)', g, state, es, Object.fromEntries([...color].map(([k, v]) => [k, v ? 'B' : 'A']))),
      P.queue('queue', queue, queue.length ? [0] : []),
      P.hashmap('color', [...color].map(([k, v]) => [k, v])),
    ]
    t.step(L('color = {}'), { vars: {}, panels: panels(), note: 'color doubles as seen', say: say('a', 'Bipartite means 2-colorable. I BFS and give every neighbor the opposite color.') })
    for (let start = 0; start < n; start++) {
      if (color.has(start)) continue
      color.set(start, 0)
      queue = [start]
      state[start] = 'frontier'
      t.step(L('queue = deque([start])'), { vars: { start }, panels: panels(), note: `New component: color ${start} as A`, say: say('comp', 'The graph may be disconnected, so I start a BFS from every uncolored node.') })
      while (queue.length) {
        const node = queue.shift()
        state[node] = 'current'
        t.step(L('node = queue.popleft()'), { vars: { node, color: color.get(node) }, panels: panels(), note: `Pop ${node} (${color.get(node) ? 'B' : 'A'})` })
        for (const nei of graph[node]) {
          if (!color.has(nei)) {
            color.set(nei, 1 - color.get(node))
            queue.push(nei)
            state[nei] = 'frontier'
            es[ek(node, nei)] = 'tree'
            t.step(L('color[nei] = 1 - color[node]'), { vars: { node, nei, color: color.get(nei) }, panels: panels(), note: `${nei} gets opposite color ${color.get(nei) ? 'B' : 'A'}`, say: say('flip', '1 - color flips 0 and 1, so every edge crosses between the two groups.') })
          } else if (color.get(nei) === color.get(node)) {
            state[nei] = 'path'
            state[node] = 'path'
            es[ek(node, nei)] = 'back'
            t.step(L('return False'), { vars: { node, nei }, panels: panels(), note: `${node} and ${nei} share a color: conflict`, say: 'Two neighbors with the same color means an odd cycle, so not bipartite.' })
            return
          }
        }
        state[node] = 'done'
      }
    }
    t.step(L('return True'), { vars: {}, panels: panels(), note: 'Every edge joins A to B', say: 'No conflicts in any component. O(V+E) time, O(V) space.' })
  },
  blanks: [['color[start] = 0', 'color[start] = 1'], '1 - color[node]', 'color[nei] == color[node]'],
})

def({
  slug: 'cycle-directed',
  title: 'Cycle detection (directed, 3-color)',
  branch: 'ordering',
  tier: 1,
  skills: ['graph-dfs', 'topo-sort'],
  prereqs: ['graph-dfs'],
  oneLiner: 'DFS; reaching a node still on the current path means a cycle.',
  whenToUse: ['can all courses be finished', 'detect circular dependency', 'deadlock / infinite loop in prerequisites', 'eventual safe states'],
  notWhen: ['undirected graph: parent check or union-find', 'also need an order: Kahn gives both'],
  mnemonic: 'White, gray, black. Gray = on my path right now. Touch gray → cycle.',
  steps: ['graph = {i: []}', 'visiting, visited = set(), set()', 'node in visiting → False', 'node in visited → True', 'mark visiting, recurse all', 'move to visited, return True'],
  template: `class Solution:
    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
        graph = {i: [] for i in range(numCourses)}

        for course, prereq in prerequisites:
            graph[course].append(prereq)

        visiting, visited = set(), set()

        def dfs(node):
            if node in visiting:
                return False
            if node in visited:
                return True

            visiting.add(node)

            for pre in graph[node]:
                if not dfs(pre):
                    return False

            visiting.remove(node)
            visited.add(node)
            return True

        return all(dfs(c) for c in range(numCourses))`,
  time: 'O(V+E)',
  space: 'O(V+E)',
  whyComplexity: 'visited memoizes finished nodes, so each node and edge is processed once.',
  variants: ['Course schedule (LC 207)', 'Find eventual safe states (LC 802)', 'Course schedule II returns order (LC 210)'],
  relatedLc: [207, 802, 210],
  compare: [['topo-kahn', 'Kahn detects a cycle when the order is shorter than n'], ['cycle-undirected', 'Undirected only needs to skip the parent edge']],
  problem: 'Course → prerequisite edges. Can every course be finished (no cycle)?',
  inputs: [
    { label: 'no cycle', value: { numCourses: 5, prerequisites: [[1, 0], [2, 1], [3, 1], [3, 2], [4, 3]] } },
    { label: 'cycle', value: { numCourses: 5, prerequisites: [[1, 0], [2, 1], [3, 2], [1, 3], [4, 0]] } },
  ],
  run({ numCourses, prerequisites }, t, L) {
    const say = once()
    const graph = gtAdj(numCourses, prerequisites, true)
    const g = gtG(numCourses, prerequisites, true)
    const visiting = new Set()
    const visited = new Set()
    const state = {}
    const es = {}
    const frames = []
    const panels = () => [P.graph('course → prereq', g, state, es), P.calls(frames), P.set('visiting (gray)', [...visiting]), P.set('visited (black)', [...visited])]
    t.step(L('graph = {i: []'), { vars: { numCourses }, panels: panels(), note: 'Edge course → prereq', say: say('a', 'Courses are nodes, prerequisites are directed edges. Finishing all courses means no directed cycle.') })
    t.step(L('visiting, visited ='), { vars: {}, panels: panels(), note: 'Gray set + black set', say: say('sets', 'visiting is the current DFS path. visited is proven safe, so I never redo it.') })
    const dfs = node => {
      frames.push(`dfs(${node})`)
      if (visiting.has(node)) {
        t.step(L('return False'), { vars: { node }, panels: panels(), note: `${node} is on the current path: cycle!`, say: 'I reached a node that is still on my path. That back edge is a cycle.' })
        frames.pop()
        return false
      }
      if (visited.has(node)) {
        t.step(L('return True'), { vars: { node }, panels: panels(), note: `${node} already safe: skip`, say: say('memo', 'Black node: already proven cycle-free, return True instantly.') })
        frames.pop()
        return true
      }
      visiting.add(node)
      state[node] = 'current'
      t.step(L('visiting.add(node)'), { vars: { node }, panels: panels(), note: `${node} turns gray` })
      state[node] = 'path'
      for (const pre of graph[node]) {
        es[ek(node, pre)] = visiting.has(pre) ? 'back' : 'active'
        t.step(L('for pre in graph[node]'), { vars: { node, pre }, panels: panels(), note: `Check prereq ${pre}` })
        if (!dfs(pre)) {
          state[node] = 'path'
          t.step(L('return False', 2), { vars: { node }, panels: panels(), note: 'Cycle found below: propagate False' })
          frames.pop()
          return false
        }
        es[ek(node, pre)] = 'tree'
      }
      visiting.delete(node)
      visited.add(node)
      state[node] = 'done'
      t.step(L('visited.add(node)'), { vars: { node }, panels: panels(), note: `${node} safe: gray → black`, say: say('black', 'All prerequisites done with no cycle, so I move it from visiting to visited.') })
      frames.pop()
      return true
    }
    for (let c = 0; c < numCourses; c++) {
      t.step(L('return all'), { vars: { c }, panels: panels(), note: `Start dfs(${c})` })
      if (!dfs(c)) {
        t.step(L('return all'), { vars: { answer: 'False' }, panels: panels(), note: 'Cycle: cannot finish', say: 'all() short-circuits on the first False. O(V+E).' })
        return
      }
    }
    t.step(L('return all'), { vars: { answer: 'True' }, panels: panels(), note: 'No cycle: all courses doable', say: 'Every node black, no back edge. O(V+E) time and space.' })
  },
  parsons: { start: 'def dfs', end: 'return all' },
  blanks: ['node in visiting', 'node in visited', 'visiting.remove(node)', 'visited.add(node)'],
  distractors: ['seen.add(node) before the visiting check'],
})

def({
  slug: 'cycle-undirected',
  title: 'Cycle detection (undirected)',
  branch: 'ordering',
  tier: 2,
  skills: ['graph-dfs', 'union-find'],
  prereqs: ['graph-dfs'],
  oneLiner: 'DFS with parent; a seen non-parent neighbor closes a cycle.',
  whenToUse: ['is this graph a tree (n - 1 edges, no cycle)', 'redundant connection', 'detect loop in undirected network'],
  notWhen: ['directed edges: need 3-color', 'edges arrive one at a time: union-find'],
  mnemonic: 'Ignore the road you came on. Any other road to a visited town = loop.',
  steps: ['build undirected graph', 'dfs(node, parent): seen.add(node)', 'skip nei == parent', 'nei seen or dfs(nei) finds cycle → True', 'run from every unseen node'],
  template: `class Solution:
    def hasCycle(self, n: int, edges: List[List[int]]) -> bool:
        graph = dd(list)

        for a, b in edges:
            graph[a].append(b)
            graph[b].append(a)

        seen = set()

        def dfs(node, parent):
            seen.add(node)

            for nei in graph[node]:
                if nei == parent:
                    continue
                if nei in seen or dfs(nei, node):
                    return True

            return False

        return any(dfs(i, -1) for i in range(n) if i not in seen)`,
  time: 'O(V+E)',
  space: 'O(V+E)',
  whyComplexity: 'Each node entered once; each edge looked at from both ends.',
  variants: ['Graph valid tree (LC 261)', 'Redundant connection with union-find (LC 684)'],
  relatedLc: [261, 684],
  compare: [['union-find', 'Union-find: an edge joining two nodes with the same root is a cycle'], ['cycle-directed', 'Directed needs gray/black, not parent']],
  problem: 'Does this undirected graph contain a cycle?',
  inputs: [
    { label: 'tree', value: { n: 6, edges: [[0, 1], [1, 2], [1, 3], [3, 4], [0, 5]] } },
    { label: 'loop', value: { n: 6, edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 2], [0, 5]] } },
  ],
  run({ n, edges }, t, L) {
    const say = once()
    const graph = gtAdj(n, edges, false)
    const g = gtG(n, edges, false)
    const seen = new Set()
    const state = {}
    const es = {}
    const frames = []
    const panels = () => [P.graph('graph', g, state, es), P.calls(frames), P.set('seen', [...seen])]
    t.step(L('graph = dd(list)'), { vars: { n }, panels: panels(), note: 'Undirected adjacency list', say: say('a', 'In an undirected graph every edge looks like a cycle back to the parent, so I pass the parent and skip it.') })
    const dfs = (node, parent) => {
      frames.push(`dfs(${node}, ${parent})`)
      seen.add(node)
      state[node] = 'current'
      t.step(L('seen.add(node)'), { vars: { node, parent }, panels: panels(), note: `Visit ${node} (came from ${parent})` })
      state[node] = 'path'
      for (const nei of graph[node]) {
        if (nei === parent) {
          t.step(L('continue'), { vars: { node, nei, parent }, panels: panels(), note: `${nei} is my parent: skip`, say: say('parent', 'This is the edge I came in on, not a cycle.') })
          continue
        }
        if (seen.has(nei)) {
          es[ek(node, nei)] = 'back'
          state[nei] = 'path'
          t.step(L('return True'), { vars: { node, nei }, panels: panels(), note: `${nei} already seen, not parent: cycle`, say: 'A seen node that is not my parent means two routes to it: a cycle.' })
          frames.pop()
          return true
        }
        es[ek(node, nei)] = 'tree'
        t.step(L('if nei in seen or dfs'), { vars: { node, nei }, panels: panels(), note: `Recurse into ${nei}` })
        if (dfs(nei, node)) {
          frames.pop()
          return true
        }
      }
      state[node] = 'done'
      t.step(L('return False'), { vars: { node }, panels: panels(), note: `No cycle under ${node}` })
      frames.pop()
      return false
    }
    for (let i = 0; i < n; i++) {
      if (seen.has(i)) continue
      t.step(L('return any'), { vars: { i }, panels: panels(), note: `Start dfs(${i}, -1)` })
      if (dfs(i, -1)) {
        t.step(L('return any'), { vars: { answer: 'True' }, panels: panels(), note: 'Cycle found', say: 'any() stops at the first True. O(V+E).' })
        return
      }
    }
    t.step(L('return any'), { vars: { answer: 'False' }, panels: panels(), note: 'No cycle: it is a forest', say: 'O(V+E) time. Union-find is the alternative: same root before union means cycle.' })
  },
  blanks: ['nei == parent', 'nei in seen or dfs(nei, node)', 'dfs(i, -1)'],
})

def({
  slug: 'topo-kahn',
  title: "Topological sort (Kahn's BFS)",
  branch: 'ordering',
  tier: 1,
  skills: ['topo-sort', 'graph-bfs', 'queue-deque'],
  prereqs: ['graph-bfs'],
  oneLiner: 'Repeatedly take nodes with zero indegree; shorter order means cycle.',
  whenToUse: ['order of courses / tasks / builds', 'dependencies must come first', 'alien dictionary', 'detect cycle and return an order'],
  notWhen: ['undirected graph: no topological order', 'only yes/no cycle: DFS 3-color also works'],
  mnemonic: 'Peel the onion: take everyone with no prereqs left, cross them off, repeat.',
  steps: ['graph prereq → course, indegree counts', 'queue = all indegree 0', 'pop node, append to order', 'decrement neighbors; hit 0 → enqueue', 'len(order) == n else cycle'],
  template: `class Solution:
    def findOrder(self, numCourses: int, prerequisites: List[List[int]]) -> List[int]:
        graph = {i: [] for i in range(numCourses)}
        indegree = [0] * numCourses

        for course, prereq in prerequisites:
            graph[prereq].append(course)
            indegree[course] += 1

        queue = deque([i for i in range(numCourses) if indegree[i] == 0])
        order = []

        while queue:
            node = queue.popleft()
            order.append(node)

            for nei in graph[node]:
                indegree[nei] -= 1
                if indegree[nei] == 0:
                    queue.append(nei)

        return order if len(order) == numCourses else []`,
  time: 'O(V+E)',
  space: 'O(V+E)',
  whyComplexity: 'Each node is dequeued once and each edge decrements one indegree once.',
  variants: ['Course schedule II (LC 210)', 'Alien dictionary (LC 269)', 'Parallel courses: count BFS levels (LC 1136)', 'Minimum height trees: peel leaves (LC 310)'],
  relatedLc: [210, 207, 269, 1136, 310],
  compare: [['topo-dfs', 'DFS version reverses post-order; needs a separate cycle check'], ['cycle-directed', 'Only answers yes/no']],
  problem: 'Return an order to take all courses, or [] if impossible.',
  inputs: [
    { label: 'DAG', value: { numCourses: 6, prerequisites: [[1, 0], [2, 0], [3, 1], [3, 2], [4, 3], [5, 3]], pos: { 0: [0.1, 0.5], 1: [0.35, 0.2], 2: [0.35, 0.8], 3: [0.6, 0.5], 4: [0.88, 0.25], 5: [0.88, 0.75] } } },
    { label: 'cycle', value: { numCourses: 7, prerequisites: [[1, 0], [2, 0], [3, 1], [4, 3], [5, 4], [3, 5], [6, 2]] } },
  ],
  run({ numCourses, prerequisites, pos }, t, L) {
    const say = once()
    const edges = prerequisites.map(([course, prereq]) => [prereq, course])
    const graph = gtAdj(numCourses, edges, true)
    const g = gtG(numCourses, edges, true, pos)
    const indegree = new Array(numCourses).fill(0)
    for (const [course] of prerequisites) indegree[course]++
    const state = {}
    const es = {}
    const order = []
    let queue = []
    const panels = () => [
      P.graph('prereq → course', g, state, es, Object.fromEntries(indegree.map((d, i) => [i, `in=${d}`]))),
      P.array('indegree', indegree, { highlight: indegree.map((d, i) => i).filter(i => indegree[i] === 0 && !order.includes(i)) }),
      P.queue('queue', queue, queue.length ? [0] : []),
      P.array('order', order),
    ]
    t.step(L('indegree[course] += 1'), { vars: { indegree: [...indegree] }, panels: panels(), note: 'Edges prereq → course, count indegrees', say: say('a', 'Indegree = number of unmet prerequisites. A course is ready when it hits zero.') })
    queue = gtRange(numCourses).filter(i => indegree[i] === 0)
    queue.forEach(i => { state[i] = 'frontier' })
    t.step(L('queue = deque'), { vars: { queue: [...queue] }, panels: panels(), note: 'Ready now: indegree 0', say: say('seed', 'Everything with no prerequisites can start immediately.') })
    while (queue.length) {
      const node = queue.shift()
      order.push(node)
      state[node] = 'current'
      t.step(L('order.append(node)'), { vars: { node, order: [...order] }, panels: panels(), note: `Take ${node}` })
      for (const nei of graph[node]) {
        indegree[nei]--
        es[ek(node, nei)] = 'tree'
        if (indegree[nei] === 0) {
          queue.push(nei)
          state[nei] = 'frontier'
          t.step(L('queue.append(nei)'), { vars: { nei, indegree: 0 }, panels: panels(), note: `${nei} has no prereqs left: ready`, say: say('ready', 'Last prerequisite done, so this course joins the queue.') })
        } else {
          t.step(L('indegree[nei] -= 1'), { vars: { nei, indegree: indegree[nei] }, panels: panels(), note: `${nei} still waits on ${indegree[nei]}` })
        }
      }
      state[node] = 'done'
    }
    const ok = order.length === numCourses
    gtRange(numCourses).forEach(i => { if (!order.includes(i)) state[i] = 'path' })
    t.step(L('return order if'), { vars: { order: [...order], answer: ok ? [...order] : [] }, panels: panels(), note: ok ? 'Full order found' : `Only ${order.length}/${numCourses}: cycle blocks the rest`, say: ok ? 'Every course taken. O(V+E) time and space.' : 'Nodes in a cycle never reach indegree 0, so the order is short: return [].' })
  },
  parsons: { start: 'queue = deque', end: 'return order' },
  blanks: ['indegree[course] += 1', 'indegree[i] == 0', 'indegree[nei] -= 1', 'len(order) == numCourses'],
  distractors: ['indegree[prereq] += 1'],
})

def({
  slug: 'topo-dfs',
  title: 'Topological sort (DFS post-order)',
  branch: 'ordering',
  tier: 2,
  skills: ['topo-sort', 'graph-dfs'],
  prereqs: ['cycle-directed'],
  oneLiner: 'Append a node after all its descendants; reverse at the end.',
  whenToUse: ['ordering of a DAG with recursion handy', 'build order / task scheduling', 'longest path in a DAG'],
  notWhen: ['graph may have cycles and no check added', 'need level-by-level batches: Kahn'],
  mnemonic: 'Get dressed backwards: you finish shoes last, so shoes go on the list first, then reverse.',
  steps: ['build directed graph', 'dfs: mark seen, recurse unseen', 'after children: order.append(node)', 'run from every unseen node', 'return order[::-1]'],
  template: `class Solution:
    def topoSort(self, n: int, edges: List[List[int]]) -> List[int]:
        graph = dd(list)

        for a, b in edges:
            graph[a].append(b)

        seen = set()
        order = []

        def dfs(node):
            seen.add(node)

            for nei in graph[node]:
                if nei not in seen:
                    dfs(nei)

            order.append(node)

        for node in range(n):
            if node not in seen:
                dfs(node)

        return order[::-1]`,
  time: 'O(V+E)',
  space: 'O(V+E)',
  whyComplexity: 'Standard DFS: every node finished once, every edge followed once.',
  variants: ['Alien dictionary with 3-color cycle check (LC 269)', 'Longest path in DAG', 'Strongly connected components (Kosaraju)'],
  relatedLc: [269, 210, 329],
  compare: [['topo-kahn', 'Kahn is iterative and detects cycles for free'], ['cycle-directed', 'Add visiting set to detect cycles in the same DFS']],
  problem: 'Order DAG nodes so every edge a → b has a before b.',
  inputs: [
    { label: 'diamond', value: { n: 6, edges: [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [5, 4]], pos: { 0: [0.1, 0.5], 1: [0.35, 0.2], 2: [0.35, 0.8], 3: [0.6, 0.5], 4: [0.88, 0.5], 5: [0.6, 0.9] } } },
    { label: 'chain + side', value: { n: 5, edges: [[3, 1], [1, 0], [0, 2], [4, 2]] } },
  ],
  run({ n, edges, pos }, t, L) {
    const say = once()
    const graph = gtAdj(n, edges, true)
    const g = gtG(n, edges, true, pos)
    const seen = new Set()
    const order = []
    const state = {}
    const es = {}
    const frames = []
    const values = {}
    const panels = () => [P.graph('graph', g, state, es, values), P.calls(frames), P.array('order (post-order)', order)]
    t.step(L('graph = dd(list)'), { vars: { n }, panels: panels(), note: 'Directed edges a → b', say: say('a', 'A node can only be placed after everything it points to is finished. Post-order captures that.') })
    const dfs = node => {
      frames.push(`dfs(${node})`)
      seen.add(node)
      state[node] = 'current'
      t.step(L('seen.add(node)'), { vars: { node }, panels: panels(), note: `Enter ${node}` })
      state[node] = 'path'
      for (const nei of graph[node]) {
        if (!seen.has(nei)) {
          es[ek(node, nei)] = 'tree'
          t.step(L('dfs(nei)'), { vars: { node, nei }, panels: panels(), note: `Descend to ${nei}` })
          dfs(nei)
        }
      }
      order.push(node)
      values[node] = `#${order.length}`
      state[node] = 'done'
      t.step(L('order.append(node)'), { vars: { node, order: [...order] }, panels: panels(), note: `${node} finished: append`, say: say('post', 'I append only after all descendants are done, so dependents land before the node.') })
      frames.pop()
    }
    for (let node = 0; node < n; node++) {
      if (seen.has(node)) continue
      t.step(L('if node not in seen'), { vars: { node }, panels: panels(), note: `Unseen ${node}: start DFS` })
      dfs(node)
    }
    const result = [...order].reverse()
    t.step(L('return order[::-1]'), { vars: { result }, panels: [...panels(), P.array('reversed = topo order', result)], note: 'Reverse post-order', say: 'Reversed finish order is a valid topological order. O(V+E).' })
  },
  blanks: ['dfs(nei)', 'order.append(node)', ['order[::-1]', 'list(reversed(order))']],
})

def({
  slug: 'union-find',
  title: 'Union-Find (DSU)',
  branch: 'connectivity',
  tier: 1,
  skills: ['union-find', 'graph-modeling'],
  prereqs: [],
  oneLiner: 'Track groups by root; find with path compression, union by rank.',
  whenToUse: ['merge groups / are a and b connected', 'edges arrive online', 'redundant connection / cycle in undirected', 'Kruskal MST, accounts merge'],
  notWhen: ['need actual paths or distances: BFS/DFS', 'directed reachability', 'deletions of edges'],
  mnemonic: 'Every group has a boss. find = ask up the chain to the boss. union = smaller boss reports to bigger.',
  steps: ['parent = [i], rank = [1] * n', 'find: hop to parent, halve path', 'union: roots p1, p2', 'same root → 0', 'attach smaller under bigger → 1'],
  template: `class Solution:
    def countComponents(self, n: int, edges: List[List[int]]) -> int:
        parent = [i for i in range(n)]
        rank = [1] * n

        def find(node):
            while parent[node] != node:
                parent[node] = parent[parent[node]]
                node = parent[node]
            return node

        def union(a, b):
            p1, p2 = find(a), find(b)

            if p1 == p2:
                return 0
            if rank[p1] < rank[p2]:
                p1, p2 = p2, p1

            parent[p2] = p1
            rank[p1] += rank[p2]
            return 1

        result = n

        for a, b in edges:
            result -= union(a, b)

        return result`,
  time: 'O(E·α(V))',
  space: 'O(V)',
  whyComplexity: 'Path compression plus union by rank makes each operation nearly O(1): inverse Ackermann.',
  variants: ['Redundant connection (LC 684)', 'Number of provinces (LC 547)', 'Accounts merge (LC 721)', 'Number of islands II (LC 305)', 'Kruskal MST'],
  relatedLc: [323, 684, 547, 721, 305],
  compare: [['graph-dfs', 'DFS counts components once; DSU handles streaming edges'], ['kruskal', 'Kruskal is sort edges + union-find']],
  problem: 'Count connected components by merging edge endpoints.',
  inputs: [
    { label: 'with redundant', value: { n: 7, edges: [[0, 1], [1, 2], [3, 4], [2, 0], [5, 6], [4, 6], [1, 3]] } },
    { label: 'two groups', value: { n: 6, edges: [[0, 1], [2, 3], [1, 2], [4, 5], [3, 0]] } },
  ],
  run({ n, edges }, t, L) {
    const say = once()
    const parent = gtRange(n)
    const rank = new Array(n).fill(1)
    const g = gtG(n, edges, false)
    const es = {}
    let result = n
    const forest = () => {
      const links = []
      parent.forEach((p, i) => { if (p !== i) links.push([i, p]) })
      const state = {}
      parent.forEach((p, i) => { if (p === i) state[i] = 'done' })
      return P.graph('parent forest (child → root)', { directed: true, nodes: gtRange(n), edges: links }, state)
    }
    const panels = (hl = []) => [P.graph('edges', g, {}, es), forest(), P.array('parent', parent, { highlight: hl }), P.array('rank (size)', rank, { highlight: hl }), P.text(`components = ${result}`)]
    t.step(L('parent = [i for'), { vars: { n }, panels: panels(), note: 'Everyone is their own boss', say: say('a', 'Each node starts as its own group. Components = n, minus one per successful union.') })
    const find = node => {
      const start = node
      while (parent[node] !== node) {
        if (parent[parent[node]] !== parent[node]) {
          parent[node] = parent[parent[node]]
          t.step(L('parent[node] = parent[parent[node]]'), { vars: { node, 'parent[node]': parent[node] }, panels: panels([node]), note: `Path halving: ${node} skips to grandparent`, say: say('compress', 'Path compression: point to the grandparent while walking, so future finds are short.') })
        }
        node = parent[node]
      }
      t.step(L('return node'), { vars: { node: start, root: node }, panels: panels([node]), note: `find(${start}) = ${node}` })
      return node
    }
    for (const [a, b] of edges) {
      es[ek(a, b)] = 'active'
      t.step(L('result -= union(a, b)'), { vars: { a, b }, panels: panels([a, b]), note: `Union ${a} and ${b}` })
      const p1 = find(a)
      const p2 = find(b)
      if (p1 === p2) {
        es[ek(a, b)] = 'back'
        t.step(L('return 0'), { vars: { p1, p2 }, panels: panels([p1]), note: `Same boss ${p1}: redundant edge`, say: say('same', 'Same root means already connected. In an undirected graph this edge closes a cycle.') })
        continue
      }
      let big = p1
      let small = p2
      if (rank[big] < rank[small]) [big, small] = [small, big]
      parent[small] = big
      rank[big] += rank[small]
      result--
      es[ek(a, b)] = 'tree'
      t.step(L('parent[p2] = p1'), { vars: { root: big, child: small, result }, panels: panels([big, small]), note: `${small} now reports to ${big}`, say: say('rank', 'Smaller tree goes under the bigger one so trees stay shallow.') })
    }
    t.step(L('return result'), { vars: { result }, panels: panels(), note: `${result} components`, say: 'Near O(1) per operation with both optimizations: O(E·α(V)) total, O(V) space.' })
  },
  parsons: { start: 'def find', end: 'return 1' },
  blanks: ['parent[parent[node]]', 'return 0', 'parent[p2] = p1', 'result -= union(a, b)'],
  distractors: ['parent[p1] = p2 before the rank check', 'return parent[node]'],
})

def({
  slug: 'tarjan-bridges',
  title: 'Bridges (Tarjan low-link)',
  branch: 'connectivity',
  tier: 3,
  skills: ['graph-dfs', 'graph-modeling'],
  prereqs: ['graph-dfs'],
  oneLiner: 'Edge is a bridge if the child cannot reach above its parent.',
  whenToUse: ['critical connections in a network', 'which edge removal disconnects', 'articulation points', 'single points of failure'],
  notWhen: ['just counting components: DFS or DSU', 'directed graphs: SCC algorithms instead'],
  mnemonic: 'disc = when I arrived, low = oldest ancestor I can sneak back to. low[child] > disc[me] → bridge.',
  steps: ['disc = -1, low = 0, time = 0', 'dfs: disc = low = time++', 'skip parent edge', 'unvisited child: recurse, low = min(low, low[child])', 'low[child] > disc[node] → bridge', 'visited: low = min(low, disc[nei])'],
  template: `class Solution:
    def criticalConnections(self, n: int, connections: List[List[int]]) -> List[List[int]]:
        graph = dd(list)

        for a, b in connections:
            graph[a].append(b)
            graph[b].append(a)

        disc, low = [-1] * n, [0] * n
        result = []
        time = 0

        def dfs(node, parent):
            nonlocal time
            disc[node] = low[node] = time
            time += 1

            for nei in graph[node]:
                if nei == parent:
                    continue
                if disc[nei] == -1:
                    dfs(nei, node)
                    low[node] = min(low[node], low[nei])
                    if low[nei] > disc[node]:
                        result.append([node, nei])
                else:
                    low[node] = min(low[node], disc[nei])

        dfs(0, -1)
        return result`,
  time: 'O(V+E)',
  space: 'O(V+E)',
  whyComplexity: 'A single DFS; low values update in O(1) per edge.',
  variants: ['Critical connections (LC 1192)', 'Articulation points: low[child] >= disc[node]', 'Tarjan SCC for directed graphs'],
  relatedLc: [1192],
  compare: [['graph-dfs', 'Plain DFS plus two timestamps per node'], ['union-find', 'DSU cannot answer edge-removal questions']],
  problem: 'Find all edges whose removal disconnects the network.',
  inputs: [
    { label: 'LC example', value: { n: 4, connections: [[0, 1], [1, 2], [2, 0], [1, 3]] } },
    { label: 'triangle + tail', value: { n: 6, connections: [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 5]], pos: { 0: [0.1, 0.25], 1: [0.1, 0.75], 2: [0.35, 0.5], 3: [0.55, 0.5], 4: [0.75, 0.5], 5: [0.95, 0.5] } } },
    { label: 'two rings', value: { n: 7, connections: [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 5], [5, 6], [6, 4]] } },
  ],
  run({ n, connections, pos }, t, L) {
    const say = once()
    const graph = gtAdj(n, connections, false)
    const g = gtG(n, connections, false, pos)
    const disc = new Array(n).fill(-1)
    const low = new Array(n).fill(0)
    const result = []
    let time = 0
    const state = {}
    const es = {}
    const frames = []
    const values = () => Object.fromEntries(gtRange(n).filter(i => disc[i] >= 0).map(i => [i, `${disc[i]}/${low[i]}`]))
    const panels = () => [P.graph('graph (disc/low)', g, state, es, values()), P.calls(frames), P.array('disc', disc), P.array('low', low), P.text(`bridges = ${JSON.stringify(result)}`)]
    t.step(L('disc, low ='), { vars: {}, panels: panels(), note: 'disc = arrival time, low = oldest reachable', say: say('a', 'One DFS. disc is when I first see a node; low is the earliest disc reachable from its subtree using one back edge.') })
    const dfs = (node, parent) => {
      frames.push(`dfs(${node}, ${parent})`)
      disc[node] = low[node] = time
      time++
      state[node] = 'current'
      t.step(L('disc[node] = low[node] = time'), { vars: { node, disc: disc[node] }, panels: panels(), note: `Arrive at ${node} at time ${disc[node]}` })
      state[node] = 'path'
      for (const nei of graph[node]) {
        if (nei === parent) continue
        if (disc[nei] === -1) {
          es[ek(node, nei)] = 'tree'
          t.step(L('dfs(nei, node)'), { vars: { node, nei }, panels: panels(), note: `Tree edge ${node}–${nei}` })
          dfs(nei, node)
          low[node] = Math.min(low[node], low[nei])
          state[node] = 'current'
          t.step(L('low[node] = min(low[node], low[nei])'), { vars: { node, nei, 'low[nei]': low[nei], 'low[node]': low[node] }, panels: panels(), note: `low[${node}] = ${low[node]}`, say: say('pull', 'Whatever the child can reach, I can reach too, so I pull its low up.') })
          if (low[nei] > disc[node]) {
            result.push([node, nei])
            es[ek(node, nei)] = 'path'
            t.step(L('result.append'), { vars: { node, nei }, panels: panels(), note: `${nei} cannot reach above ${node}: bridge`, say: 'low[child] > disc[node]: the child subtree has no back edge around this edge, so it is a bridge.' })
          }
          state[node] = 'path'
        } else {
          low[node] = Math.min(low[node], disc[nei])
          es[ek(node, nei)] = es[ek(node, nei)] || es[ek(nei, node)] || 'back'
          t.step(L('low[node] = min(low[node], disc[nei])'), { vars: { node, nei, 'low[node]': low[node] }, panels: panels(), note: `Back edge to ${nei}: low[${node}] = ${low[node]}`, say: say('back', 'A back edge to an ancestor lowers my low: there is a cycle around me.') })
        }
      }
      state[node] = 'done'
      frames.pop()
    }
    dfs(0, -1)
    t.step(L('return result'), { vars: { result: clone(result) }, panels: panels(), note: `${result.length} bridge(s)`, say: 'One DFS, O(V+E) time and space.' })
  },
})


const psNodes = n => Array.from({ length: n }, (_, i) => i)
const psFmtList = list => list.map(fmt)
const psMod = (x, m) => ((x % m) + m) % m

def({
  slug: 'dijkstra',
  title: 'Dijkstra',
  branch: 'paths',
  tier: 1,
  skills: ['dijkstra', 'heap', 'graph-bfs'],
  prereqs: ['graph-bfs', 'heap-top-k'],
  oneLiner: 'Min-heap pops the closest node; its distance is final.',
  whenToUse: ['shortest path with non-negative weights', 'minimum time / cost to reach', 'network delay', 'path with minimum effort'],
  notWhen: ['negative edge weights: Bellman-Ford', 'all weights equal: plain BFS', 'only 0/1 weights: 0-1 BFS'],
  mnemonic: 'Water spreading from a tap: the nearest puddle fills first. Pop, skip if seen, push dist + w.',
  steps: ['heap = [(0, src)], seen = set()', 'pop (dist, node)', 'node in seen → continue', 'seen.add(node): dist is final', 'push (dist + w, nei) for unseen nei'],
  template: `import heapq
from collections import defaultdict as dd

class Solution:
    def networkDelayTime(self, times: List[List[int]], n: int, k: int) -> int:
        graph = dd(list)

        for u, v, w in times:
            graph[u].append((v, w))

        seen = set()
        heap = [(0, k)]
        result = 0

        while heap:
            dist, node = heapq.heappop(heap)
            if node in seen:
                continue
            seen.add(node)
            result = dist

            for nei, w in graph[node]:
                if nei not in seen:
                    heapq.heappush(heap, (dist + w, nei))

        return result if len(seen) == n else -1`,
  time: 'O((V+E) log V)',
  space: 'O(V+E)',
  whyComplexity: 'Each edge pushes at most once; every heap push/pop costs log of heap size.',
  variants: ['Path with minimum effort (LC 1631)', 'Swim in rising water (LC 778)', 'Cheapest flights with stops: state (node, stops)', 'Probability path: max-heap of products (LC 1514)'],
  relatedLc: [743, 1631, 778, 1514, 787],
  compare: [['graph-bfs', 'BFS is Dijkstra when every edge weighs 1'], ['bellman-ford', 'Bellman-Ford handles negative weights, O(V·E)'], ['a-star', 'A* adds a heuristic to aim at one goal']],
  problem: 'Signal starts at k. Time until all n nodes hear it, or -1.',
  inputs: [
    { label: 'detour wins', value: { times: [[1, 2, 4], [1, 3, 1], [3, 2, 2], [2, 4, 1], [3, 4, 5], [4, 5, 3], [3, 5, 7]], n: 5, k: 1, pos: { 1: [0.1, 0.5], 2: [0.45, 0.15], 3: [0.45, 0.85], 4: [0.75, 0.3], 5: [0.9, 0.75] } } },
    { label: 'LC example', value: { times: [[2, 1, 1], [2, 3, 1], [3, 4, 1]], n: 4, k: 2, pos: { 1: [0.15, 0.3], 2: [0.45, 0.3], 3: [0.45, 0.75], 4: [0.85, 0.75] } } },
    { label: 'unreachable', value: { times: [[1, 2, 3], [2, 3, 2], [1, 3, 6], [4, 1, 1]], n: 4, k: 1 } },
  ],
  run({ times, n, k, pos }, t, L) {
    const say = once()
    const nodes = Array.from({ length: n }, (_, i) => i + 1)
    const g = { directed: true, nodes, edges: times, pos }
    const graph = {}
    nodes.forEach(u => { graph[u] = [] })
    const state = {}
    const edgeState = {}
    const values = {}
    const seen = new Set()
    const heap = []
    const via = {}
    let result = 0
    const panels = (hl = []) => [
      P.graph('graph (values = best dist)', g, state, edgeState, values),
      P.heap('heap (dist, node)', heap.map(([d, u]) => `${d}, ${u}`), hl),
      P.set('seen', [...seen]),
    ]
    t.step(L('graph = dd(list)'), { vars: { n, k }, panels: panels(), note: 'Weighted directed graph', say: say('a', 'Non-negative weights, shortest time from one source: Dijkstra with a min-heap.') })
    for (const [u, v, w] of times) graph[u].push([v, w])
    t.step(L('graph[u].append'), { vars: { edges: times.length }, panels: panels(), note: 'Adjacency list: u → (v, w)' })
    heap.push([0, k])
    values[k] = 0
    state[k] = 'frontier'
    t.step(L('heap = [(0, k)]'), { vars: { heap: [[0, k]] }, panels: panels([0]), note: `Seed heap with (0, ${k})` })
    while (heap.length) {
      const [dist, node] = heappop(heap)
      const stale = seen.has(node)
      if (!stale) state[node] = 'current'
      t.step(L('heapq.heappop'), { vars: { dist, node }, panels: panels(), note: `Pop closest: node ${node} at ${dist}`, say: say('pop', 'The heap hands me the closest unfinished node. No shorter route can exist, so its distance is final.') })
      if (stale) {
        t.step(L('continue'), { vars: { dist, node }, panels: panels(), note: `Stale entry for ${node}: skip`, say: say('stale', 'Lazy deletion: longer old entries stay in the heap and get skipped when popped.') })
        continue
      }
      seen.add(node)
      state[node] = 'done'
      values[node] = dist
      const from = via[`${dist},${node}`]
      if (from !== undefined) edgeState[ek(from, node)] = 'tree'
      t.step(L('seen.add(node)'), { vars: { node, dist }, panels: panels(), note: `Lock in ${node} = ${dist}` })
      result = dist
      t.step(L('result = dist'), { vars: { result }, panels: panels(), note: `Latest finish time ${result}` })
      const active = []
      for (const [nei, w] of graph[node]) {
        if (seen.has(nei)) continue
        heappush(heap, [dist + w, nei])
        if (via[`${dist + w},${nei}`] === undefined) via[`${dist + w},${nei}`] = node
        values[nei] = values[nei] === undefined ? dist + w : Math.min(values[nei], dist + w)
        state[nei] = 'frontier'
        edgeState[ek(node, nei)] = 'active'
        active.push(ek(node, nei))
        t.step(L('heapq.heappush(heap, (dist'), { vars: { nei, w, 'dist + w': dist + w }, panels: panels(), note: `Offer ${nei} at ${dist} + ${w} = ${dist + w}`, say: say('push', 'Relax each edge by pushing the new candidate. Duplicates are fine, no decrease-key needed.') })
      }
      active.forEach(key => { if (edgeState[key] === 'active') delete edgeState[key] })
    }
    const answer = seen.size === n ? result : -1
    t.step(L('return result'), { vars: { answer, reached: seen.size }, panels: panels(), note: answer === -1 ? `Only ${seen.size}/${n} reached: -1` : `All reached by time ${answer}`, say: 'O((V+E) log V) time, O(V+E) space for graph and heap.' })
  },
  parsons: { start: 'seen = set()', end: 'heapq.heappush(heap, (dist' },
  blanks: ['[(0, k)]', 'heapq.heappop(heap)', 'node in seen', '(dist + w, nei)'],
  distractors: ['heap = [(k, 0)]', 'seen.remove(node)'],
})

def({
  slug: 'bellman-ford',
  title: 'Bellman-Ford',
  branch: 'paths',
  tier: 2,
  skills: ['dijkstra', 'graph-modeling'],
  prereqs: ['dijkstra'],
  oneLiner: 'Relax every edge, round after round; round i allows i edges.',
  whenToUse: ['negative edge weights', 'at most k stops / edges', 'detect a negative cycle', 'small V·E'],
  notWhen: ['non-negative weights and big graph: Dijkstra', 'unweighted: BFS'],
  mnemonic: 'Gossip rounds: each round, news travels one more hop. Copy prices so a round moves one hop only.',
  steps: ['prices = [inf] * n; prices[src] = 0', 'repeat k + 1 (or V - 1) times', 'temp = prices.copy()', 'for u, v, w: relax into temp', 'prices = temp'],
  template: `class Solution:
    def findCheapestPrice(self, n: int, flights: List[List[int]], src: int, dst: int, k: int) -> int:
        prices = [float('inf')] * n
        prices[src] = 0

        for _ in range(k + 1):
            temp = prices.copy()

            for u, v, w in flights:
                if prices[u] + w < temp[v]:
                    temp[v] = prices[u] + w

            prices = temp

        return prices[dst] if prices[dst] != float('inf') else -1`,
  time: 'O(V·E)',
  space: 'O(V)',
  whyComplexity: 'Up to V - 1 rounds (here k + 1), each scanning all E edges.',
  variants: ['Cheapest flights within k stops (LC 787)', 'Negative cycle: an extra round still relaxes', 'SPFA queue speed-up'],
  relatedLc: [787, 743],
  compare: [['dijkstra', 'Dijkstra is faster but breaks on negative weights'], ['floyd-warshall', 'Floyd gives all pairs in O(V^3)']],
  problem: 'Cheapest price from src to dst using at most k stops, or -1.',
  inputs: [
    { label: 'k=1', value: { n: 4, flights: [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]], src: 0, dst: 3, k: 1, pos: { 0: [0.1, 0.5], 1: [0.45, 0.15], 2: [0.45, 0.85], 3: [0.9, 0.5] } } },
    { label: 'triangle k=1', value: { n: 3, flights: [[0, 1, 100], [1, 2, 100], [0, 2, 500]], src: 0, dst: 2, k: 1, pos: { 0: [0.15, 0.7], 1: [0.5, 0.2], 2: [0.85, 0.7] } } },
    { label: 'triangle k=0', value: { n: 3, flights: [[0, 1, 100], [1, 2, 100], [0, 2, 500]], src: 0, dst: 2, k: 0, pos: { 0: [0.15, 0.7], 1: [0.5, 0.2], 2: [0.85, 0.7] } } },
  ],
  run({ n, flights, src, dst, k, pos }, t, L) {
    const say = once()
    const g = { directed: true, nodes: psNodes(n), edges: flights, pos }
    let prices = Array(n).fill(Infinity)
    let temp = null
    const history = []
    const rowLabels = []
    const state = { [dst]: 'path' }
    const edgeState = {}
    const values = () => Object.fromEntries(prices.map((p, i) => [i, fmt(p)]))
    const panels = (hl = []) => [
      P.graph('flights', g, state, edgeState, values()),
      P.array('prices (last round)', psFmtList(prices), { highlight: [] }),
      ...(temp ? [P.array('temp (this round)', psFmtList(temp), { highlight: hl })] : []),
      P.table('prices per round', history.length ? history : [psFmtList(prices)], { rowLabels: history.length ? rowLabels : ['init'], colLabels: psNodes(n) }),
    ]
    t.step(L("prices = [float('inf')]"), { vars: { n }, panels: panels(), note: 'Everything unreachable so far', say: say('a', 'At most k stops means at most k + 1 edges. Bellman-Ford rounds count edges exactly.') })
    prices[src] = 0
    state[src] = 'current'
    history.push(psFmtList(prices))
    rowLabels.push('start')
    t.step(L('prices[src] = 0'), { vars: { src }, panels: panels(), note: `Source ${src} costs 0` })
    for (let round = 0; round <= k; round++) {
      t.step(L('for _ in range(k + 1)'), { vars: { round: round + 1, of: k + 1 }, panels: panels(), note: `Round ${round + 1}: paths with ≤ ${round + 1} edges` })
      temp = [...prices]
      t.step(L('temp = prices.copy()'), { vars: { temp: psFmtList(temp) }, panels: panels(), note: 'Write into a copy', say: say('copy', 'I relax into a copy so one round extends paths by only one edge. Otherwise updates chain within a round.') })
      for (const [u, v, w] of flights) {
        edgeState[ek(u, v)] = 'active'
        if (prices[u] + w < temp[v]) {
          temp[v] = prices[u] + w
          t.step(L('temp[v] = prices[u] + w'), { vars: { u, v, w, 'temp[v]': temp[v] }, panels: panels([v]), note: `${u}→${v}: ${prices[u]} + ${w} = ${temp[v]} improves`, say: say('relax', 'Relaxing: if going through u is cheaper, record it.') })
        } else {
          t.step(L('if prices[u] + w < temp[v]'), { vars: { u, v, w, 'prices[u]': fmt(prices[u]), 'temp[v]': fmt(temp[v]) }, panels: panels(), note: prices[u] === Infinity ? `${u} not reached yet: skip` : `${u}→${v} no better` })
        }
        delete edgeState[ek(u, v)]
      }
      prices = temp
      temp = null
      history.push(psFmtList(prices))
      rowLabels.push(`round ${round + 1}`)
      t.step(L('prices = temp'), { vars: { prices: psFmtList(prices) }, panels: panels(), note: `Round ${round + 1} done` })
    }
    const answer = prices[dst] === Infinity ? -1 : prices[dst]
    t.step(L('return prices[dst]'), { vars: { answer }, panels: panels(), note: `Cheapest to ${dst} = ${answer}`, say: 'O(k·E) here, O(V·E) in general, O(V) space.' })
  },
  blanks: ['range(k + 1)', ['prices.copy()', 'prices[:]', 'list(prices)'], 'prices[u] + w < temp[v]'],
})

def({
  slug: 'zero-one-bfs',
  title: '0-1 BFS',
  branch: 'paths',
  tier: 3,
  skills: ['graph-bfs', 'queue-deque'],
  prereqs: ['graph-bfs'],
  oneLiner: 'Deque BFS: 0-weight edges go front, 1-weight edges go back.',
  whenToUse: ['edge weights only 0 or 1', 'minimum flips / removals to reach', 'free moves vs paid moves on a grid'],
  notWhen: ['general weights: Dijkstra', 'all weights equal: plain BFS'],
  mnemonic: 'Free ride? Cut the line (appendleft). Paid ride? Back of the line (append).',
  steps: ['dist = [inf] * n; dist[src] = 0', 'queue = deque([src])', 'node = queue.popleft()', 'if dist[node] + w < dist[nei]: update', 'w == 0 → appendleft else append'],
  template: `from collections import deque, defaultdict as dd

class Solution:
    def zeroOneBfs(self, n: int, edges: List[List[int]], src: int) -> List[int]:
        graph = dd(list)

        for u, v, w in edges:
            graph[u].append((v, w))

        dist = [float('inf')] * n
        dist[src] = 0
        queue = deque([src])

        while queue:
            node = queue.popleft()

            for nei, w in graph[node]:
                if dist[node] + w < dist[nei]:
                    dist[nei] = dist[node] + w
                    if w == 0:
                        queue.appendleft(nei)
                    else:
                        queue.append(nei)

        return dist`,
  time: 'O(V+E)',
  space: 'O(V+E)',
  whyComplexity: 'Deque stays sorted by distance like a heap, but each push is O(1).',
  variants: ['Min cost to make a valid grid path (LC 1368)', 'Min obstacles removal (LC 2290)', 'Reverse edges to reach node (LC 1466 style)'],
  relatedLc: [1368, 2290],
  compare: [['dijkstra', 'Dijkstra needs a heap; 0-1 weights only need a deque'], ['graph-bfs', 'Plain BFS treats every edge as weight 1']],
  problem: 'Shortest distance from src to every node when weights are 0 or 1.',
  inputs: [
    { label: 'mixed', value: { n: 5, edges: [[0, 1, 0], [0, 2, 1], [1, 2, 1], [1, 3, 1], [2, 3, 0], [3, 4, 1], [2, 4, 1]], src: 0, pos: { 0: [0.1, 0.5], 1: [0.4, 0.15], 2: [0.4, 0.85], 3: [0.7, 0.5], 4: [0.92, 0.5] } } },
    { label: 'free chain', value: { n: 4, edges: [[0, 3, 1], [0, 1, 0], [1, 2, 0], [2, 3, 0]], src: 0, pos: { 0: [0.1, 0.5], 1: [0.4, 0.2], 2: [0.65, 0.2], 3: [0.9, 0.5] } } },
  ],
  run({ n, edges, src, pos }, t, L) {
    const say = once()
    const g = { directed: true, nodes: psNodes(n), edges, pos }
    const graph = {}
    psNodes(n).forEach(u => { graph[u] = [] })
    for (const [u, v, w] of edges) graph[u].push([v, w])
    const dist = Array(n).fill(Infinity)
    const queue = []
    const state = {}
    const edgeState = {}
    const panels = (hl = []) => [
      P.graph('graph (w = 0 or 1)', g, state, edgeState, Object.fromEntries(dist.map((d, i) => [i, fmt(d)]))),
      P.queue('deque', queue, hl),
      P.array('dist', psFmtList(dist)),
    ]
    t.step(L('graph[u].append'), { vars: { n }, panels: panels(), note: 'Edges weigh 0 or 1', say: say('a', 'Weights are only 0 or 1, so a deque replaces the heap: O(V+E).') })
    dist[src] = 0
    queue.push(src)
    state[src] = 'frontier'
    t.step(L('queue = deque([src])'), { vars: { src }, panels: panels([0]), note: `Start at ${src}` })
    while (queue.length) {
      const node = queue.shift()
      state[node] = 'current'
      t.step(L('node = queue.popleft()'), { vars: { node, 'dist[node]': dist[node] }, panels: panels(), note: `Pop ${node} (dist ${dist[node]})` })
      for (const [nei, w] of graph[node]) {
        if (dist[node] + w < dist[nei]) {
          dist[nei] = dist[node] + w
          state[nei] = 'frontier'
          edgeState[ek(node, nei)] = 'tree'
          if (w === 0) {
            queue.unshift(nei)
            t.step(L('queue.appendleft(nei)'), { vars: { nei, w, 'dist[nei]': dist[nei] }, panels: panels([0]), note: `Free edge to ${nei}: front of deque`, say: say('zero', 'Weight 0 keeps the same distance, so it jumps to the front. The deque stays sorted.') })
          } else {
            queue.push(nei)
            t.step(L('queue.append(nei)'), { vars: { nei, w, 'dist[nei]': dist[nei] }, panels: panels([queue.length - 1]), note: `Paid edge to ${nei}: back of deque`, say: say('one', 'Weight 1 means one more, so it waits at the back like normal BFS.') })
          }
        }
      }
      state[node] = 'done'
    }
    t.step(L('return dist'), { vars: { dist: psFmtList(dist) }, panels: panels(), note: 'All distances final', say: 'O(V+E) time and space, like BFS.' })
  },
})

def({
  slug: 'floyd-warshall',
  title: 'Floyd-Warshall',
  branch: 'paths',
  tier: 2,
  skills: ['dijkstra', 'dp-2d'],
  prereqs: ['dijkstra'],
  oneLiner: 'All-pairs shortest paths: try every node k as a stopover.',
  whenToUse: ['all pairs shortest paths', 'n ≤ 100–400 nodes', 'city with fewest reachable neighbors', 'transitive closure / reachability'],
  notWhen: ['single source: Dijkstra', 'n in the thousands: V^3 too slow'],
  mnemonic: 'K-I-J: Keep Improving Journeys. k is the outer loop, always.',
  steps: ['dist = inf matrix, dist[i][i] = 0', 'dist[u][v] = w', 'for k, for i, for j', 'dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])'],
  template: `class Solution:
    def floydWarshall(self, n: int, edges: List[List[int]]) -> List[List[int]]:
        dist = [[float('inf')] * n for _ in range(n)]

        for i in range(n):
            dist[i][i] = 0
        for u, v, w in edges:
            dist[u][v] = w

        for k in range(n):
            for i in range(n):
                for j in range(n):
                    dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])

        return dist`,
  time: 'O(V^3)',
  space: 'O(V^2)',
  whyComplexity: 'Three nested loops over V nodes; the matrix holds V² distances.',
  variants: ['Find the city with fewest neighbors (LC 1334)', 'Course schedule IV reachability (LC 1462)', 'Detect negative cycle: dist[i][i] < 0'],
  relatedLc: [1334, 1462, 399],
  compare: [['dijkstra', 'Dijkstra from every node is faster on sparse graphs'], ['bellman-ford', 'Bellman-Ford is single source']],
  problem: 'Shortest distance between every pair of nodes.',
  inputs: [
    { label: 'cycle', value: { n: 4, edges: [[0, 1, 3], [1, 2, 1], [2, 3, 2], [0, 3, 10], [3, 0, 4], [0, 2, 7]], pos: { 0: [0.15, 0.2], 1: [0.85, 0.2], 2: [0.85, 0.8], 3: [0.15, 0.8] } } },
    { label: 'negative edge', value: { n: 3, edges: [[0, 1, 4], [1, 2, -2], [0, 2, 5], [2, 0, 1]], pos: { 0: [0.15, 0.7], 1: [0.5, 0.2], 2: [0.85, 0.7] } } },
  ],
  run({ n, edges, pos }, t, L) {
    const say = once()
    const g = { directed: true, nodes: psNodes(n), edges, pos }
    const dist = Array.from({ length: n }, () => Array(n).fill(Infinity))
    const state = {}
    const ids = psNodes(n)
    const panels = (opts = {}) => [
      P.table('dist[i][j]', dist, { rowLabels: ids, colLabels: ids, highlight: opts.hl || [], deps: opts.deps || [] }),
      P.graph('graph', g, state, opts.edgeState || {}),
    ]
    t.step(L("dist = [[float('inf')]"), { vars: { n }, panels: panels(), note: 'n×n matrix of ∞', say: say('a', 'All pairs on a small graph: Floyd-Warshall, a DP over allowed stopovers.') })
    for (let i = 0; i < n; i++) dist[i][i] = 0
    t.step(L('dist[i][i] = 0'), { vars: {}, panels: panels({ hl: ids.map(i => `${i},${i}`) }), note: 'Zero cost to stay put' })
    for (const [u, v, w] of edges) dist[u][v] = w
    t.step(L('dist[u][v] = w'), { vars: { edges: edges.length }, panels: panels({ hl: edges.map(([u, v]) => `${u},${v}`) }), note: 'Direct edges fill in' })
    for (let k = 0; k < n; k++) {
      state[k] = 'current'
      t.step(L('for k in range(n)'), { vars: { k }, panels: panels({ hl: ids.map(j => `${k},${j}`).concat(ids.map(i => `${i},${k}`)) }), note: `Now ${k} may be a stopover`, say: say('k', 'k must be the outer loop: after round k, paths may use stopovers 0..k only.') })
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          const cand = dist[i][k] + dist[k][j]
          if (cand < dist[i][j]) {
            const old = dist[i][j]
            dist[i][j] = cand
            t.step(L('dist[i][j] = min'), { vars: { k, i, j, old: fmt(old), 'via k': cand }, panels: panels({ hl: [`${i},${j}`], deps: [`${i},${k}`, `${k},${j}`], edgeState: { [ek(i, k)]: 'path', [ek(k, j)]: 'path' } }), note: `${i}→${k}→${j} = ${cand} beats ${fmt(old)}`, say: say('relax', 'i to j through k: dist[i][k] + dist[k][j]. Keep the smaller.') })
          }
        }
      }
      state[k] = 'done'
    }
    t.step(L('return dist'), { vars: {}, panels: panels(), note: 'Every pair final', say: 'O(V³) time, O(V²) space. Fine up to a few hundred nodes.' })
  },
  blanks: ['dist[i][i] = 0', 'for k in range(n)', 'dist[i][k] + dist[k][j]'],
})

def({
  slug: 'a-star',
  title: 'A* search',
  branch: 'paths',
  tier: 3,
  skills: ['dijkstra', 'grid', 'heap'],
  prereqs: ['dijkstra'],
  oneLiner: 'Dijkstra ordered by steps + heuristic guess to the goal.',
  whenToUse: ['one start, one known goal', 'grid with obvious distance estimate', 'game / map pathfinding'],
  notWhen: ['need distances to all nodes: Dijkstra/BFS', 'no admissible heuristic', 'interview just wants BFS'],
  mnemonic: 'GPS with a compass: f = g (driven) + h (crow-flies). Never overestimate h.',
  steps: ['heap = [(h(start), 0, start)]', 'pop lowest f = g + h', 'goal → return g', 'skip seen, mark seen', 'push (g + 1 + h(nei), g + 1, nei)'],
  template: `import heapq

class Solution:
    def shortestPath(self, grid: List[List[int]], start: List[int], goal: List[int]) -> int:
        rows, cols = len(grid), len(grid[0])
        gr, gc = goal
        heap = [(abs(start[0] - gr) + abs(start[1] - gc), 0, start[0], start[1])]
        seen = set()

        while heap:
            _, steps, r, c = heapq.heappop(heap)
            if (r, c) == (gr, gc):
                return steps
            if (r, c) in seen:
                continue
            seen.add((r, c))

            for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0 and (nr, nc) not in seen:
                    heapq.heappush(heap, (steps + 1 + abs(nr - gr) + abs(nc - gc), steps + 1, nr, nc))

        return -1`,
  time: 'O(E log V)',
  space: 'O(V)',
  whyComplexity: 'Worst case is Dijkstra; a good heuristic expands far fewer cells.',
  variants: ['Shortest path in binary matrix (LC 1091)', 'Sliding puzzle (LC 773)', 'Manhattan h for 4-way, Chebyshev for 8-way'],
  relatedLc: [1091, 773],
  compare: [['dijkstra', 'Dijkstra expands in all directions; A* leans toward the goal'], ['graph-bfs', 'BFS is enough on small unweighted grids']],
  problem: 'Fewest steps from start to goal on a 0/1 grid (1 = wall).',
  inputs: [
    { label: 'maze', value: { grid: [[0, 0, 0, 0, 0], [1, 1, 0, 1, 0], [0, 0, 0, 1, 0], [0, 1, 1, 1, 0], [0, 0, 0, 0, 0]], start: [0, 0], goal: [4, 0] } },
    { label: 'open field', value: { grid: [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 1, 0, 0], [0, 0, 0, 0, 0]], start: [0, 0], goal: [3, 4] } },
    { label: 'blocked', value: { grid: [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]], start: [0, 0], goal: [0, 3] } },
  ],
  run({ grid, start, goal }, t, L) {
    const say = once()
    const rows = grid.length
    const cols = grid[0].length
    const [gr, gc] = goal
    const h = (r, c) => Math.abs(r - gr) + Math.abs(c - gc)
    const heap = [[h(start[0], start[1]), 0, start[0], start[1]]]
    const seen = new Set()
    const state = {}
    const values = {}
    const parent = {}
    const bestG = { [`${start[0]},${start[1]}`]: 0 }
    grid.forEach((row, r) => row.forEach((v, c) => { if (v === 1) state[`${r},${c}`] = 'wall' }))
    state[`${gr},${gc}`] = 'path'
    values[`${gr},${gc}`] = 'G'
    values[`${start[0]},${start[1]}`] = `f${h(start[0], start[1])}`
    const panels = (hl = []) => [
      P.grid('grid (values = f = g + h)', grid, state, values),
      P.heap('heap (f, g, r, c)', heap.map(([f, g, r, c]) => `${f}, ${g}, (${r},${c})`), hl),
    ]
    t.step(L('heap = [('), { vars: { 'h(start)': h(start[0], start[1]) }, panels: panels([0]), note: 'Seed with f = h(start)', say: say('a', 'A* is Dijkstra ordered by g + h, where h is Manhattan distance. h never overestimates, so the answer stays optimal.') })
    while (heap.length) {
      const [f, steps, r, c] = heappop(heap)
      const key = `${r},${c}`
      if (r === gr && c === gc) {
        let cur = key
        while (cur !== undefined) {
          state[cur] = 'path'
          cur = parent[cur]
        }
        t.step(L('return steps'), { vars: { steps }, panels: panels(), note: `Goal reached in ${steps} steps`, say: 'Goal popped means its g is final. Worst case O(E log V), usually far less.' })
        return
      }
      if (seen.has(key)) {
        t.step(L('continue'), { vars: { r, c }, panels: panels(), note: `(${r},${c}) already expanded` })
        continue
      }
      seen.add(key)
      state[key] = 'current'
      t.step(L('seen.add((r, c))'), { vars: { r, c, g: steps, f }, panels: panels(), note: `Expand (${r},${c}): g=${steps}, f=${f}`, say: say('pop', 'Lowest f first: cells that look closest to the goal get expanded first.') })
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nr = r + dr
        const nc = c + dc
        const nkey = `${nr},${nc}`
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 0 && !seen.has(nkey)) {
          const nf = steps + 1 + h(nr, nc)
          heappush(heap, [nf, steps + 1, nr, nc])
          if (bestG[nkey] === undefined || steps + 1 < bestG[nkey]) {
            bestG[nkey] = steps + 1
            parent[nkey] = key
          }
          if (!(nr === gr && nc === gc)) {
            state[nkey] = 'frontier'
            values[nkey] = `f${nf}`
          }
          t.step(L('heapq.heappush'), { vars: { nr, nc, g: steps + 1, h: h(nr, nc), f: nf }, panels: panels(), note: `Push (${nr},${nc}): ${steps + 1} + ${h(nr, nc)} = ${nf}`, say: say('push', 'f = steps so far + Manhattan guess to the goal.') })
        }
      }
      state[key] = 'visited'
    }
    t.step(L('return -1'), { vars: {}, panels: panels(), note: 'Heap empty: goal unreachable', say: 'Walls cut the goal off, so -1.' })
  },
})

def({
  slug: 'prim',
  title: "Prim's MST",
  branch: 'mst',
  tier: 2,
  skills: ['mst', 'heap', 'graph-modeling'],
  prereqs: ['dijkstra'],
  oneLiner: 'Grow one tree; always add the cheapest edge leaving it.',
  whenToUse: ['connect all points with minimum total cost', 'dense graph / all pairs are edges', 'min cost to connect points'],
  notWhen: ['shortest path between two nodes: Dijkstra', 'edges already listed and sparse: Kruskal is simpler'],
  mnemonic: 'Dijkstra twin: push (edge cost, node), not (total dist, node). Spread the tree one cheapest edge at a time.',
  steps: ['heap = [(0, 0)], seen = set()', 'pop (cost, i); skip if seen', 'seen.add(i); total += cost', 'push (cost to j, j) for unseen j'],
  template: `import heapq

class Solution:
    def minCostConnectPoints(self, points: List[List[int]]) -> int:
        n, seen, heap, total = len(points), set(), [(0, 0)], 0

        while len(seen) < n:
            cost, i = heapq.heappop(heap)
            if i in seen:
                continue
            seen.add(i)
            total += cost
            x, y = points[i]

            for j in range(n):
                if j not in seen:
                    distance = abs(points[j][0] - x) + abs(points[j][1] - y)
                    heapq.heappush(heap, (distance, j))

        return total`,
  time: 'O(n^2 log n)',
  space: 'O(n^2)',
  whyComplexity: 'Complete graph has n² edges; each is pushed once and costs log n.',
  variants: ['Min cost to connect points (LC 1584)', 'Optimize water distribution: virtual node 0 (LC 1168)', 'O(n²) array version for dense graphs'],
  relatedLc: [1584, 1168, 1135],
  compare: [['kruskal', 'Kruskal sorts all edges and uses union-find'], ['dijkstra', 'Dijkstra pushes total distance; Prim pushes just the edge cost']],
  problem: 'Minimum total Manhattan cost to connect all points.',
  inputs: [
    { label: 'LC example', value: [[0, 0], [2, 2], [3, 10], [5, 2], [7, 0]] },
    { label: 'square', value: [[0, 0], [1, 1], [1, 0], [-1, 1]] },
    { label: 'line', value: [[3, 12], [-2, 5], [-4, 1]] },
  ],
  run(points, t, L) {
    const say = once()
    const n = points.length
    const xs = points.map(p => p[0])
    const ys = points.map(p => p[1])
    const scale = (v, lo, hi) => (hi === lo ? 0.5 : 0.1 + (0.8 * (v - lo)) / (hi - lo))
    const pos = Object.fromEntries(points.map(([x, y], i) => [i, [Math.round(scale(x, Math.min(...xs), Math.max(...xs)) * 100) / 100, Math.round((1 - scale(y, Math.min(...ys), Math.max(...ys))) * 100) / 100]]))
    const edges = []
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) edges.push([i, j, Math.abs(points[i][0] - points[j][0]) + Math.abs(points[i][1] - points[j][1])])
    const g = { directed: false, nodes: psNodes(n), edges, pos, labels: Object.fromEntries(points.map((p, i) => [i, `${i} (${p[0]},${p[1]})`])) }
    const seen = new Set()
    const heap = [[0, 0]]
    const via = {}
    const state = { 0: 'frontier' }
    const edgeState = {}
    let total = 0
    const panels = (hl = []) => [
      P.graph('points (w = Manhattan)', g, state, edgeState),
      P.heap('heap (cost, point)', heap.map(([d, j]) => `${d}, ${j}`), hl),
      P.text(`total = ${total}   in tree = ${seen.size}/${n}`),
    ]
    t.step(L('n, seen, heap, total'), { vars: { n }, panels: panels([0]), note: 'Start the tree at point 0', say: say('a', 'Every pair is an edge, so this is dense: Prim with a heap, like Dijkstra but keyed by edge cost.') })
    while (seen.size < n) {
      const [cost, i] = heappop(heap)
      t.step(L('cost, i = heapq.heappop'), { vars: { cost, i }, panels: panels(), note: `Cheapest edge out: ${cost} to point ${i}` })
      if (seen.has(i)) {
        t.step(L('continue'), { vars: { i }, panels: panels(), note: `${i} already in tree: skip` })
        continue
      }
      seen.add(i)
      state[i] = 'done'
      if (via[`${cost},${i}`] !== undefined) edgeState[ek(via[`${cost},${i}`], i)] = 'tree'
      t.step(L('seen.add(i)'), { vars: { i }, panels: panels(), note: `Add point ${i} to the tree`, say: say('cut', 'Cut property: the cheapest edge leaving the tree is always safe to take.') })
      total += cost
      t.step(L('total += cost'), { vars: { cost, total }, panels: panels(), note: `total = ${total}` })
      for (let j = 0; j < n; j++) {
        if (seen.has(j)) continue
        const distance = Math.abs(points[j][0] - points[i][0]) + Math.abs(points[j][1] - points[i][1])
        heappush(heap, [distance, j])
        if (via[`${distance},${j}`] === undefined) via[`${distance},${j}`] = i
        state[j] = 'frontier'
        t.step(L('heapq.heappush(heap, (distance'), { vars: { i, j, distance }, panels: panels(), note: `Offer edge ${i}–${j} cost ${distance}` })
      }
    }
    t.step(L('return total'), { vars: { total }, panels: panels(), note: `MST cost = ${total}`, say: 'O(n² log n) time and O(n²) heap space on a complete graph.' })
  },
  blanks: ['[(0, 0)]', 'if i in seen', 'total += cost', '(distance, j)'],
})

def({
  slug: 'kruskal',
  title: "Kruskal's MST",
  branch: 'mst',
  tier: 2,
  skills: ['mst', 'union-find', 'greedy'],
  prereqs: ['union-find'],
  oneLiner: 'Sort edges by weight; keep each edge joining two different components.',
  whenToUse: ['minimum spanning tree from an edge list', 'connect all cities cheapest', 'sparse graph', 'critical / pseudo-critical edges'],
  notWhen: ['shortest path: Dijkstra', 'dense complete graph: Prim avoids sorting n² edges'],
  mnemonic: 'Cheapest bridges first; refuse any bridge between towns already connected.',
  steps: ['parent = list(range(n))', 'sort edges by w', 'p1, p2 = find(u), find(v)', 'p1 != p2 → union, total += w'],
  template: `class Solution:
    def minimumSpanningTree(self, n: int, edges: List[List[int]]) -> int:
        parent = [i for i in range(n)]

        def find(node):
            while parent[node] != node:
                parent[node] = parent[parent[node]]
                node = parent[node]
            return node

        total = 0

        for w, u, v in sorted((w, u, v) for u, v, w in edges):
            p1, p2 = find(u), find(v)
            if p1 != p2:
                parent[p1] = p2
                total += w

        return total`,
  time: 'O(E log E)',
  space: 'O(V)',
  whyComplexity: 'Sorting edges dominates; each find is nearly O(1) with path compression.',
  variants: ['Connecting cities with minimum cost (LC 1135)', 'Critical edges in MST (LC 1489)', 'Min cost to connect points (LC 1584)'],
  relatedLc: [1135, 1489, 1584],
  compare: [['prim', 'Prim grows one tree from a start node using a heap'], ['union-find', 'Kruskal is union-find plus sorted edges']],
  problem: 'Total weight of a minimum spanning tree.',
  inputs: [
    { label: '5 nodes', value: { n: 5, edges: [[0, 1, 4], [0, 2, 1], [1, 2, 2], [1, 3, 5], [2, 3, 8], [3, 4, 3], [2, 4, 9]], pos: { 0: [0.1, 0.5], 1: [0.4, 0.15], 2: [0.4, 0.85], 3: [0.7, 0.5], 4: [0.92, 0.8] } } },
    { label: 'square', value: { n: 4, edges: [[0, 1, 1], [1, 2, 2], [0, 2, 2], [2, 3, 1], [1, 3, 3]], pos: { 0: [0.15, 0.2], 1: [0.85, 0.2], 2: [0.15, 0.8], 3: [0.85, 0.8] } } },
  ],
  run({ n, edges, pos }, t, L) {
    const say = once()
    const g = { directed: false, nodes: psNodes(n), edges, pos }
    const parent = psNodes(n)
    const sorted = edges.map(([u, v, w]) => [w, u, v]).sort((a, b) => (lessThan(a, b) ? -1 : lessThan(b, a) ? 1 : 0))
    const labels = sorted.map(([w, u, v]) => `${u}-${v}:${w}`)
    const edgeState = {}
    const state = {}
    let total = 0
    const find = node => {
      while (parent[node] !== node) {
        parent[node] = parent[parent[node]]
        node = parent[node]
      }
      return node
    }
    const panels = (idx, hl = []) => [
      P.graph('graph', g, state, edgeState),
      P.array('sorted edges (u-v:w)', labels, { pointers: idx !== undefined ? { edge: idx } : {}, dim: idx !== undefined ? labels.map((_, i) => i).filter(i => i < idx) : [] }),
      P.array('parent', parent, { highlight: hl }),
      P.text(`total = ${total}`),
    ]
    t.step(L('parent = [i for i'), { vars: { n }, panels: panels(), note: 'Every node is its own component', say: say('a', 'Kruskal: take edges cheapest first, skip any that would close a cycle. Union-find detects that.') })
    t.step(L('for w, u, v in sorted'), { vars: { edges: edges.length }, panels: panels(0), note: 'Edges sorted by weight', say: say('sort', 'Sorting is the O(E log E) part.') })
    for (let idx = 0; idx < sorted.length; idx++) {
      const [w, u, v] = sorted[idx]
      edgeState[ek(u, v)] = 'active'
      const p1 = find(u)
      const p2 = find(v)
      t.step(L('p1, p2 = find(u)'), { vars: { u, v, w, p1, p2 }, panels: panels(idx, [u, v]), note: `Edge ${u}–${v} (${w}): roots ${p1}, ${p2}` })
      if (p1 !== p2) {
        parent[p1] = p2
        edgeState[ek(u, v)] = 'tree'
        state[u] = 'done'
        state[v] = 'done'
        t.step(L('parent[p1] = p2'), { vars: { p1, p2 }, panels: panels(idx, [p1]), note: `Different components: union`, say: say('union', 'Different roots, so no cycle. Take the edge and merge the components.') })
        total += w
        t.step(L('total += w'), { vars: { w, total }, panels: panels(idx), note: `total = ${total}` })
      } else {
        edgeState[ek(u, v)] = 'back'
        t.step(L('if p1 != p2'), { vars: { p1, p2 }, panels: panels(idx), note: 'Same root: would form a cycle, skip', say: say('skip', 'Same root means u and v are already connected. This edge would make a cycle.') })
      }
    }
    t.step(L('return total'), { vars: { total }, panels: panels(sorted.length), note: `MST weight = ${total}`, say: 'O(E log E) time for the sort, O(V) for parent.' })
  },
  blanks: ['parent[parent[node]]', 'sorted(', 'p1 != p2', 'parent[p1] = p2'],
})

def({
  slug: 'palindrome-expand',
  title: 'Expand around center',
  branch: 'strings',
  tier: 2,
  skills: ['two-pointers'],
  prereqs: ['two-pointers'],
  oneLiner: 'Grow outward from each center while both ends match.',
  whenToUse: ['longest palindromic substring', 'count palindromic substrings', 'n ≤ 1000 strings'],
  notWhen: ['subsequence, not substring: 2-D DP', 'n ≈ 10^6: Manacher'],
  mnemonic: 'Ripples in a pond: 2n - 1 centers (letters and gaps), expand while mirror matches.',
  steps: ['for each i', 'expand(i, i) for odd', 'expand(i, i + 1) for even', 'while in bounds and s[l] == s[r]: widen', 'keep the longest'],
  template: `class Solution:
    def longestPalindrome(self, s: str) -> str:
        result = ""

        def expand(left, right):
            while left >= 0 and right < len(s) and s[left] == s[right]:
                left -= 1
                right += 1
            return s[left + 1:right]

        for i in range(len(s)):
            odd, even = expand(i, i), expand(i, i + 1)
            result = max(result, odd, even, key=len)

        return result`,
  time: 'O(n^2)',
  space: 'O(1)',
  whyComplexity: '2n - 1 centers, each expanding up to n characters.',
  variants: ['Palindromic substrings count (LC 647)', 'Longest palindromic subsequence is DP (LC 516)', 'Valid palindrome II (LC 680)'],
  relatedLc: [5, 647, 680],
  compare: [['two-pointers', 'Classic two pointers squeeze inward; here they grow outward'], ['lcs', 'Subsequence palindromes need 2-D DP']],
  problem: 'Return the longest palindromic substring.',
  inputs: [
    { label: 'babad', value: 'babad' },
    { label: 'cbbd', value: 'cbbd' },
    { label: 'xabacabz', value: 'xabacabz' },
  ],
  run(s, t, L) {
    const say = once()
    const chars = s.split('')
    let result = ''
    let best = null
    const panels = (left, right, hl = []) => [
      P.array('s', chars, { pointers: left !== undefined ? { left: Math.max(left, 0), right: Math.min(right, chars.length - 1) } : {}, window: left !== undefined && right - left > 1 ? [left + 1, right - 1] : best || undefined, highlight: hl }),
      P.text(`result = "${result}"`),
    ]
    t.step(L('result = ""'), { vars: {}, panels: panels(), note: 'Best palindrome so far: empty', say: say('a', 'Every palindrome has a center: a letter or a gap. I try all 2n - 1 centers and expand.') })
    const expand = (left, right, kind) => {
      while (left >= 0 && right < s.length && s[left] === s[right]) {
        t.step(L('left -= 1'), { vars: { left, right, kind }, panels: panels(left - 1, right + 1, [left, right]), note: `'${s[left]}' == '${s[right]}': widen`, say: say('grow', 'Ends match, so the palindrome grows by one on each side.') })
        left--
        right++
      }
      const found = s.slice(left + 1, right)
      t.step(L('return s[left + 1:right]'), { vars: { kind, found }, panels: panels(left, right), note: found ? `${kind} center gives "${found}"` : `${kind} center: nothing` })
      return found
    }
    for (let i = 0; i < s.length; i++) {
      t.step(L('for i in range(len(s))'), { vars: { i }, panels: panels(undefined, undefined, [i]), note: `Center at ${i} ('${s[i]}')` })
      const odd = expand(i, i, 'odd')
      const even = expand(i, i + 1, 'even')
      for (const cand of [odd, even]) {
        if (cand.length > result.length) {
          result = cand
          const start = cand === odd ? i - (odd.length - 1) / 2 : i - even.length / 2 + 1
          best = [start, start + cand.length - 1]
        }
      }
      t.step(L('result = max('), { vars: { odd, even, result }, panels: panels(), note: `Best = "${result}"` })
    }
    t.step(L('return result'), { vars: { result }, panels: panels(), note: `Longest = "${result}"`, say: 'O(n²) time, O(1) extra space.' })
  },
  blanks: ['s[left] == s[right]', 's[left + 1:right]', 'expand(i, i + 1)'],
})

def({
  slug: 'kmp',
  title: 'KMP string search',
  branch: 'strings',
  tier: 3,
  skills: ['arrays-hashing'],
  prereqs: [],
  oneLiner: 'Prefix table lets the pattern skip ahead instead of restarting.',
  whenToUse: ['find pattern in text in O(n + m)', 'repeated substring pattern', 'shortest palindrome by prefix'],
  notWhen: ['interview allows s.find / slicing: say it first', 'many patterns at once: trie / Aho-Corasick'],
  mnemonic: 'LPS = Longest Prefix that is also Suffix. On mismatch, fall back to lps[j - 1], never move i back.',
  steps: ['build lps for needle', 'mismatch → length = lps[length - 1]', 'match → length += 1', 'scan text with j', 'j == m → found at i - m + 1'],
  template: `class Solution:
    def strStr(self, haystack: str, needle: str) -> int:
        lps = [0] * len(needle)
        length = 0

        for i in range(1, len(needle)):
            while length and needle[i] != needle[length]:
                length = lps[length - 1]
            if needle[i] == needle[length]:
                length += 1
            lps[i] = length

        j = 0

        for i in range(len(haystack)):
            while j and haystack[i] != needle[j]:
                j = lps[j - 1]
            if haystack[i] == needle[j]:
                j += 1
            if j == len(needle):
                return i - j + 1

        return -1`,
  time: 'O(n + m)',
  space: 'O(m)',
  whyComplexity: 'i never moves back; j falls back at most as often as it advanced.',
  variants: ['Find first occurrence (LC 28)', 'Repeated substring pattern (LC 459)', 'Shortest palindrome (LC 214)'],
  relatedLc: [28, 459, 214],
  compare: [['rolling-hash', 'Rabin-Karp hashes windows; KMP never re-reads text'], ['sliding-window-fixed', 'Naive window compare is O(n·m)']],
  problem: 'Index of the first occurrence of needle in haystack, or -1.',
  inputs: [
    { label: 'ababd', value: { haystack: 'ababcabababd', needle: 'ababd' } },
    { label: 'aab', value: { haystack: 'aaaab', needle: 'aab' } },
    { label: 'missing', value: { haystack: 'abcabd', needle: 'abe' } },
  ],
  run({ haystack, needle }, t, L) {
    const say = once()
    const lps = Array(needle.length).fill(0)
    const text = haystack.split('')
    const pat = needle.split('')
    let length = 0
    let j = 0
    const panels = (opts = {}) => [
      P.array('needle', pat, { pointers: opts.pat || {}, highlight: opts.patHl || [] }),
      P.array('lps', lps, { highlight: opts.lpsHl || [] }),
      ...(opts.search ? [P.array('haystack', text, { pointers: opts.text || {}, window: opts.window, highlight: opts.textHl || [] })] : []),
    ]
    t.step(L('lps = [0]'), { vars: {}, panels: panels(), note: 'lps[i] = longest proper prefix = suffix of needle[:i+1]', say: say('a', 'KMP precomputes how far the pattern can fall back, so the text pointer never moves backward.') })
    for (let i = 1; i < pat.length; i++) {
      while (length && pat[i] !== pat[length]) {
        length = lps[length - 1]
        t.step(L('length = lps[length - 1]'), { vars: { i, length }, panels: panels({ pat: { i, length }, patHl: [i] }), note: `Mismatch: fall back length to ${length}` })
      }
      if (pat[i] === pat[length]) {
        length++
        t.step(L('length += 1'), { vars: { i, length }, panels: panels({ pat: { i, length: length - 1 }, patHl: [i, length - 1] }), note: `'${pat[i]}' extends the border to ${length}` })
      }
      lps[i] = length
      t.step(L('lps[i] = length'), { vars: { i, 'lps[i]': length }, panels: panels({ pat: { i }, lpsHl: [i] }), note: `lps[${i}] = ${length}` })
    }
    t.step(L('j = 0'), { vars: { lps: [...lps] }, panels: panels({ search: true }), note: 'Table ready, now scan the text', say: say('table', 'Building the table is O(m). Now one pass over the text.') })
    for (let i = 0; i < text.length; i++) {
      while (j && text[i] !== pat[j]) {
        const old = j
        j = lps[j - 1]
        t.step(L('j = lps[j - 1]'), { vars: { i, j }, panels: panels({ search: true, text: { i }, pat: { j }, textHl: [i], lpsHl: [old - 1] }), note: `Mismatch: reuse ${j} matched chars`, say: say('fall', 'Mismatch: instead of restarting, jump j to lps[j - 1]. Those characters are already known to match.') })
      }
      if (text[i] === pat[j]) {
        j++
        t.step(L('j += 1'), { vars: { i, j }, panels: panels({ search: true, text: { i }, pat: { j: j - 1 }, window: [i - j + 1, i], textHl: [i], patHl: [j - 1] }), note: `'${text[i]}' matches: j = ${j}` })
      } else {
        t.step(L('if haystack[i] == needle[j]'), { vars: { i, j }, panels: panels({ search: true, text: { i }, pat: { j }, textHl: [i] }), note: `'${text[i]}' no match, move on` })
      }
      if (j === pat.length) {
        t.step(L('return i - j + 1'), { vars: { answer: i - j + 1 }, panels: panels({ search: true, window: [i - j + 1, i] }), note: `Found at ${i - j + 1}`, say: 'Found. O(n + m) time, O(m) for the table.' })
        return
      }
    }
    t.step(L('return -1'), { vars: {}, panels: panels({ search: true }), note: 'Not found', say: 'Scanned everything once: -1, still O(n + m).' })
  },
})

def({
  slug: 'rolling-hash',
  title: 'Rolling hash (Rabin-Karp)',
  branch: 'strings',
  tier: 3,
  skills: ['sliding-window', 'arrays-hashing', 'math'],
  prereqs: ['sliding-window-fixed'],
  oneLiner: 'Hash a fixed window in O(1) per slide; compare hashes first.',
  whenToUse: ['find a pattern in text', 'longest duplicate substring (with binary search)', 'compare many substrings fast'],
  notWhen: ['need guaranteed worst case: KMP', 'tiny inputs: slicing is fine'],
  mnemonic: 'Odometer in base 26: drop the front digit, shift, add the new digit. Verify on hash hit.',
  steps: ['target = hash(needle)', 'power = base^(m-1) % mod', 'drop haystack[i - m] once window is full', 'window = window * base + ord(c)', 'hash match → confirm by slicing'],
  template: `class Solution:
    def strStr(self, haystack: str, needle: str) -> int:
        m, base, mod = len(needle), 26, 10**9 + 7
        target = window = 0
        power = pow(base, m - 1, mod)

        for c in needle:
            target = (target * base + ord(c)) % mod

        for i, c in enumerate(haystack):
            if i >= m:
                window = (window - ord(haystack[i - m]) * power) % mod
            window = (window * base + ord(c)) % mod
            if i >= m - 1 and window == target and haystack[i - m + 1:i + 1] == needle:
                return i - m + 1

        return -1`,
  time: 'O(n + m)',
  space: 'O(1)',
  whyComplexity: 'Each slide updates the hash in O(1); slicing only on rare hash hits.',
  variants: ['Longest duplicate substring (LC 1044)', 'Repeated DNA sequences (LC 187)', 'Distinct echo substrings (LC 1316)'],
  relatedLc: [28, 187, 1044],
  compare: [['kmp', 'KMP is deterministic O(n + m), no collisions'], ['sliding-window-fixed', 'Same slide idea, the window value is a hash']],
  problem: 'Index of needle in haystack using a rolling hash.',
  inputs: [
    { label: 'abcd', value: { haystack: 'abcxabcdab', needle: 'abcd' } },
    { label: 'll', value: { haystack: 'hello', needle: 'll' } },
    { label: 'missing', value: { haystack: 'aabba', needle: 'bab' } },
  ],
  run({ haystack, needle }, t, L) {
    const say = once()
    const m = needle.length
    const base = 26
    const mod = 1000000007
    let target = 0
    let window = 0
    let power = 1
    for (let k = 0; k < m - 1; k++) power = (power * base) % mod
    const text = haystack.split('')
    const panels = (i, hl = []) => [
      P.array('haystack', text, { pointers: i !== undefined ? { i } : {}, window: i !== undefined ? [Math.max(0, i - m + 1), i] : undefined, highlight: hl }),
      P.array('needle', needle.split('')),
      P.text(`window hash = ${window}   target = ${target}`),
    ]
    t.step(L('m, base, mod'), { vars: { m, base, mod }, panels: panels(), note: 'Treat strings as base-26 numbers mod p', say: say('a', 'Rabin-Karp: compare hashes in O(1) per window, confirm only when hashes match.') })
    t.step(L('power = pow'), { vars: { power }, panels: panels(), note: `power = 26^${m - 1} mod p, weight of the front char` })
    for (const c of needle) target = (target * base + c.charCodeAt(0)) % mod
    t.step(L('target = (target * base'), { vars: { target }, panels: panels(), note: `hash("${needle}") = ${target}` })
    for (let i = 0; i < text.length; i++) {
      const c = text[i]
      if (i >= m) {
        window = psMod(window - text[i - m].charCodeAt(0) * power, mod)
        t.step(L('window = (window - ord'), { vars: { i, dropped: text[i - m], window }, panels: panels(i - 1, [i - m]), note: `Drop '${text[i - m]}' from the front`, say: say('drop', 'Subtract the outgoing char times its weight, base^(m-1).') })
      }
      window = (window * base + c.charCodeAt(0)) % mod
      t.step(L('window = (window * base'), { vars: { i, c, window }, panels: panels(i, [i]), note: `Shift and add '${c}'`, say: say('add', 'Multiply by the base to shift left, then add the new char.') })
      if (i >= m - 1 && window === target && haystack.slice(i - m + 1, i + 1) === needle) {
        t.step(L('return i - m + 1'), { vars: { answer: i - m + 1 }, panels: panels(i), note: `Hash match, verified: index ${i - m + 1}`, say: 'Hash equal and slice confirms. O(n + m) expected.' })
        return
      }
    }
    t.step(L('return -1'), { vars: {}, panels: panels(), note: 'No window matched', say: 'No match: -1. O(n + m) expected time, O(1) space.' })
  },
})

def({
  slug: 'bit-tricks',
  title: 'Bit tricks',
  branch: 'bits',
  tier: 2,
  skills: ['bit'],
  prereqs: [],
  oneLiner: 'XOR cancels pairs; n & (n - 1) drops the lowest 1.',
  whenToUse: ['every element appears twice except one', 'count set bits', 'O(1) space with no extra structure', 'power of two check'],
  notWhen: ['counts above two: Counter is clearer', 'negative numbers in Python: mask with 0xFFFFFFFF'],
  mnemonic: 'XOR = sock drawer: pairs vanish, the lonely sock stays. n & (n - 1) eats one 1-bit.',
  steps: ['result ^= num for all nums', 'while n: n &= n - 1; count += 1', 'bits[i] = bits[i >> 1] + (i & 1)'],
  template: `class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        result = 0

        for num in nums:
            result ^= num

        return result

    def hammingWeight(self, n: int) -> int:
        count = 0

        while n:
            n &= n - 1
            count += 1

        return count

    def countBits(self, n: int) -> List[int]:
        bits = [0] * (n + 1)

        for i in range(1, n + 1):
            bits[i] = bits[i >> 1] + (i & 1)

        return bits`,
  time: 'O(n)',
  space: 'O(1)',
  whyComplexity: 'One pass for XOR; popcount loops once per set bit; countBits is O(n) with O(n) output.',
  variants: ['Single number (LC 136)', 'Number of 1 bits (LC 191)', 'Counting bits (LC 338)', 'Missing number via XOR (LC 268)', 'Power of two: n & (n - 1) == 0'],
  relatedLc: [136, 191, 338, 268, 371],
  compare: [['hashmap-lookup', 'A set also finds the single number, but costs O(n) space']],
  problem: 'Single number by XOR, popcount by n & (n - 1), counting bits by DP.',
  inputs: [
    { label: 'small', value: { nums: [4, 1, 2, 1, 2], n: 11, upto: 5 } },
    { label: 'bigger', value: { nums: [7, 3, 5, 3, 7], n: 44, upto: 8 } },
  ],
  run({ nums, n, upto }, t, L) {
    const say = once()
    const width = 8
    const bin = x => x.toString(2).padStart(width, '0').split('')
    let result = 0
    t.step(L('result = 0'), { vars: { nums }, panels: [P.array('nums', nums), P.array('result bits', bin(result))], note: 'XOR identity is 0', say: say('a', 'x ^ x = 0 and x ^ 0 = x. XOR everything and pairs cancel.') })
    nums.forEach((num, i) => {
      const before = result
      result ^= num
      t.step(L('result ^= num'), { vars: { num, result }, panels: [P.array('nums', nums, { highlight: [i] }), P.table('XOR', [bin(before), bin(num), bin(result)], { rowLabels: ['result', `^ ${num}`, '='], highlight: bin(result).map((b, j) => (b !== bin(before)[j] ? `2,${j}` : null)).filter(Boolean) })], note: `${before} ^ ${num} = ${result}` })
    })
    t.step(L('return result', 1), { vars: { result }, panels: [P.array('result bits', bin(result))], note: `Lonely number = ${result}`, say: say('xor', 'O(n) time, O(1) space.') })
    let count = 0
    let m = n
    t.step(L('count = 0'), { vars: { n }, panels: [P.array(`n = ${m}`, bin(m))], note: `Count 1-bits of ${n}`, say: say('pop', 'n & (n - 1) clears the lowest set bit, so the loop runs once per 1-bit.') })
    while (m) {
      const before = m
      m &= m - 1
      t.step(L('n &= n - 1'), { vars: { before, after: m }, panels: [P.table('n & (n - 1)', [bin(before), bin(before - 1), bin(m)], { rowLabels: ['n', 'n - 1', '&'] })], note: `${before} → ${m}: lowest 1 gone` })
      count++
      t.step(L('count += 1'), { vars: { count }, panels: [P.array(`n = ${m}`, bin(m))], note: `count = ${count}` })
    }
    t.step(L('return count'), { vars: { count }, panels: [P.text(`${n} has ${count} set bits`)], note: `${count} bits set` })
    const bits = Array(upto + 1).fill(0)
    t.step(L('bits = [0]'), { vars: { n: upto }, panels: [P.array('bits', bits)], note: 'bits[0] = 0', say: say('dp', 'i >> 1 drops the last bit, already solved. Add back i & 1.') })
    for (let i = 1; i <= upto; i++) {
      bits[i] = bits[i >> 1] + (i & 1)
      t.step(L('bits[i] = bits[i >> 1]'), { vars: { i, 'i >> 1': i >> 1, 'i & 1': i & 1, 'bits[i]': bits[i] }, panels: [P.array('bits', bits, { highlight: [i], pointers: { i, half: i >> 1 } }), P.text(`${i} = ${i.toString(2)}`)], note: `bits[${i}] = bits[${i >> 1}] + ${i & 1} = ${bits[i]}` })
    }
    t.step(L('return bits'), { vars: { bits: [...bits] }, panels: [P.array('bits', bits)], note: 'Counts for 0..n', say: 'O(n) time with O(1) work per number.' })
  },
  blanks: ['result ^= num', 'n &= n - 1', 'bits[i >> 1] + (i & 1)'],
})

def({
  slug: 'reservoir-sampling',
  title: 'Reservoir sampling',
  branch: 'bits',
  tier: 3,
  skills: ['math'],
  prereqs: [],
  oneLiner: 'Keep the i-th item with probability 1/i; uniform without length.',
  whenToUse: ['random node from a linked list of unknown length', 'sample from a stream', 'random pick index with O(1) space'],
  notWhen: ['length known and array given: random.choice', 'weighted picks: prefix sums + binary search'],
  mnemonic: 'Musical chairs: the i-th arrival steals the seat with chance 1/i.',
  steps: ['i = 0, result = None', 'walk the stream: i += 1', 'randint(1, i) == 1 → result = val', 'return result'],
  template: `import random

class Solution:
    def __init__(self, head: Optional[ListNode]):
        self.head = head

    def getRandom(self) -> int:
        curr, result, i = self.head, None, 0

        while curr:
            i += 1
            if random.randint(1, i) == 1:
                result = curr.val
            curr = curr.next

        return result`,
  time: 'O(n)',
  space: 'O(1)',
  whyComplexity: 'One pass over the stream, one random number per item, no storage.',
  variants: ['Linked list random node (LC 382)', 'Random pick index (LC 398)', 'Keep k items: replace slot randint(1, i) if ≤ k'],
  relatedLc: [382, 398],
  compare: [['hashmap-lookup', 'Storing everything then choosing costs O(n) space']],
  problem: 'Return a uniformly random node value from a linked list.',
  inputs: [
    { label: 'seed 7', value: { values: [10, 20, 30, 40, 50], seed: 7 } },
    { label: 'seed 42', value: { values: [3, 1, 4, 1, 5, 9], seed: 42 } },
  ],
  run({ values, seed }, t, L) {
    const say = once()
    let s = seed
    const randint = (lo, hi) => {
      s = (s * 16807) % 2147483647
      return lo + (s % (hi - lo + 1))
    }
    const nodes = values.map((val, i) => ({ id: `r${i}`, val, next: i + 1 < values.length ? `r${i + 1}` : null }))
    let result = null
    let keptId = null
    const panels = (currId, roll, i) => [
      P.list('stream', nodes, currId ? { curr: currId } : {}, keptId ? [keptId] : []),
      P.text(`result = ${fmt(result)}${i ? `   keep chance 1/${i}` : ''}${roll !== undefined ? `   roll = ${roll}` : ''}`),
    ]
    t.step(L('curr, result, i ='), { vars: { i: 0 }, panels: panels(nodes[0].id), note: 'Length unknown: decide on the fly', say: say('a', 'I do not know the length, so each new item replaces the pick with probability 1/i.') })
    for (let k = 0; k < nodes.length; k++) {
      const i = k + 1
      t.step(L('i += 1'), { vars: { i }, panels: panels(nodes[k].id, undefined, i), note: `Item #${i}: value ${nodes[k].val}` })
      const roll = randint(1, i)
      if (roll === 1) {
        result = nodes[k].val
        keptId = nodes[k].id
        t.step(L('result = curr.val'), { vars: { roll, result }, panels: panels(nodes[k].id, roll, i), note: `Rolled 1 of ${i}: keep ${result}`, say: say('keep', 'Item i survives later steps with (i/(i+1))·…·((n-1)/n), so every item ends with 1/n.') })
      } else {
        t.step(L('if random.randint'), { vars: { roll }, panels: panels(nodes[k].id, roll, i), note: `Rolled ${roll}: keep ${result}` })
      }
    }
    t.step(L('return result'), { vars: { result }, panels: panels(null), note: `Picked ${result}`, say: 'O(n) time, O(1) space, uniform 1/n.' })
  },
})


const dgShow = values => values.map(v => (v === Infinity ? '∞' : v === true ? 'T' : v === false ? 'F' : v))
const dgShowRows = rows => rows.map(dgShow)

def({
  slug: 'dp-1d',
  title: '1-D DP (house robber)',
  branch: 'dp',
  tier: 1,
  skills: ['dp-1d'],
  prereqs: [],
  oneLiner: 'Best answer at i built from the last one or two answers.',
  whenToUse: ['max/min/count ways along a line', 'cannot pick adjacent', 'climbing stairs / decode ways', 'choice at each index depends on previous few'],
  notWhen: ['choices interact far apart: 2-D DP or graph', 'greedy provably works: simpler'],
  mnemonic: 'Burglar on a street: skip this house (dp[i-1]) or rob it plus two back (dp[i-2] + num).',
  steps: ['define dp[i] = best using first i items', 'base cases dp[0], dp[1]', 'for i in 2..n', 'dp[i] = max(skip, take)', 'return dp[n]'],
  template: `class Solution:
    def rob(self, nums: List[int]) -> int:
        dp = [0] * (len(nums) + 1)
        dp[1] = nums[0]

        for i in range(2, len(nums) + 1):
            dp[i] = max(dp[i - 1], dp[i - 2] + nums[i - 1])

        return dp[len(nums)]`,
  time: 'O(n)',
  space: 'O(n)',
  whyComplexity: 'One O(1) transition per index; drop to two variables for O(1) space.',
  variants: ['Climbing stairs: dp[i] = dp[i-1] + dp[i-2] (LC 70)', 'House robber II circular (LC 213)', 'Decode ways (LC 91)', 'Min cost climbing stairs (LC 746)'],
  relatedLc: [198, 70, 213, 91, 746],
  compare: [['kadane', 'Kadane is the same idea with restart instead of skip'], ['dp-grid', 'Grid DP depends on two neighbors in 2-D']],
  problem: 'Max money robbing houses with no two adjacent.',
  inputs: [
    { label: '2 7 9 3 1', value: [2, 7, 9, 3, 1] },
    { label: '5 1 1 5 2 6', value: [5, 1, 1, 5, 2, 6] },
    { label: '1 2 3 1', value: [1, 2, 3, 1] },
  ],
  run(nums, t, L) {
    const say = once()
    const n = nums.length
    const dp = new Array(n + 1).fill(0)
    const panels = (i, deps = []) => [
      P.array('nums (house i = nums[i-1])', nums, { highlight: i ? [i - 1] : [] }),
      P.array('dp[i] = best of first i houses', dp, { pointers: i !== undefined ? { i } : {}, highlight: i !== undefined ? [i] : [], dim: deps.length ? dp.map((_, k) => k).filter(k => !deps.includes(k) && k !== i) : [] }),
    ]
    t.step(L('dp = [0]'), { vars: { n }, panels: panels(), note: 'dp has n + 1 slots; dp[0] = 0 houses', say: say('a', 'State: dp[i] is the most money from the first i houses.') })
    dp[1] = nums[0]
    t.step(L('dp[1] = nums[0]'), { vars: { 'dp[1]': dp[1] }, panels: panels(1), note: 'One house: rob it' })
    for (let i = 2; i <= n; i++) {
      t.step(L('for i in range'), { vars: { i, house: nums[i - 1] }, panels: panels(i), note: `House ${i} worth ${nums[i - 1]}` })
      const skip = dp[i - 1]
      const take = dp[i - 2] + nums[i - 1]
      dp[i] = Math.max(skip, take)
      t.step(L('dp[i] = max'), { vars: { skip, take, 'dp[i]': dp[i] }, panels: panels(i, [i - 1, i - 2]), note: `skip ${skip} vs take ${dp[i - 2]}+${nums[i - 1]}=${take} → ${dp[i]}`, say: say('rec', 'Two choices: skip this house and keep dp[i-1], or rob it and add dp[i-2].') })
    }
    t.step(L('return dp[len'), { vars: { answer: dp[n] }, panels: panels(n), note: `Best = ${dp[n]}`, say: 'O(n) time. Only the last two cells matter, so O(1) space is possible.' })
  },
  blanks: ['dp[1] = nums[0]', ['dp[i - 1]', 'dp[i-1]'], ['dp[i - 2] + nums[i - 1]', 'dp[i-2] + nums[i-1]', 'dp[i-2]+nums[i-1]']],
})

def({
  slug: 'dp-grid',
  title: '2-D grid DP (min path sum)',
  branch: 'dp',
  tier: 1,
  skills: ['dp-2d', 'grid'],
  prereqs: ['dp-1d'],
  oneLiner: 'Each cell = its cost + cheaper of up or left.',
  whenToUse: ['grid, move only right/down', 'count unique paths', 'min/max path sum in a matrix', 'dungeon / cherry style grid'],
  notWhen: ['moves in 4 directions: BFS or Dijkstra', 'cycles possible: not a DAG'],
  mnemonic: 'Water fills from the top-left: every cell asks up and left, takes the cheaper.',
  steps: ['dp sized (rows+1)×(cols+1), pad with inf', 'seed dp[0][1] = 0', 'for r, for c', 'dp[r][c] = grid + min(up, left)', 'return dp[rows][cols]'],
  template: `class Solution:
    def minPathSum(self, grid: List[List[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        dp = [[math.inf] * (cols + 1) for _ in range(rows + 1)]
        dp[0][1] = 0

        for r in range(1, rows + 1):
            for c in range(1, cols + 1):
                dp[r][c] = grid[r - 1][c - 1] + min(dp[r - 1][c], dp[r][c - 1])

        return dp[rows][cols]`,
  time: 'O(r·c)',
  space: 'O(r·c)',
  whyComplexity: 'Each of r·c cells does O(1) work; keep one row for O(c) space.',
  variants: ['Unique paths: dp = up + left (LC 62)', 'Unique paths II obstacles (LC 63)', 'Maximal square (LC 221)', 'Dungeon game, fill backward (LC 174)'],
  relatedLc: [64, 62, 63, 221, 174],
  compare: [['dijkstra', 'Dijkstra handles any direction with non-negative weights'], ['lcs', 'LCS is grid DP over two strings']],
  problem: 'Cheapest path from top-left to bottom-right moving right or down.',
  inputs: [
    { label: '3×3', value: [[1, 3, 1], [1, 5, 1], [4, 2, 1]] },
    { label: '2×3', value: [[1, 2, 3], [4, 5, 6]] },
    { label: 'snake', value: [[1, 9, 1, 1], [1, 1, 1, 9], [9, 9, 1, 1]] },
  ],
  run(grid, t, L) {
    const say = once()
    const rows = grid.length
    const cols = grid[0].length
    const dp = Array.from({ length: rows + 1 }, () => new Array(cols + 1).fill(Infinity))
    const gridState = {}
    const rowLabels = ['pad', ...grid.map((_, r) => `r${r}`)]
    const colLabels = ['pad', ...grid[0].map((_, c) => `c${c}`)]
    const panels = (r, c, deps = []) => [
      P.grid('grid', grid, gridState),
      P.table('dp (padded)', dgShowRows(dp), { rowLabels, colLabels, highlight: r !== undefined ? [`${r},${c}`] : [], deps }),
    ]
    t.step(L('dp = [[math.inf]'), { vars: { rows, cols }, panels: panels(), note: 'Pad row 0 and col 0 with ∞', say: say('a', 'dp[r][c] = cheapest cost to reach cell (r-1, c-1). The ∞ border means no path from outside.') })
    dp[0][1] = 0
    t.step(L('dp[0][1] = 0'), { vars: {}, panels: panels(0, 1), note: 'Fake entry above the start costs 0' })
    for (let r = 1; r <= rows; r++) {
      t.step(L('for r in range'), { vars: { r }, panels: panels(), note: `Row ${r - 1}` })
      for (let c = 1; c <= cols; c++) {
        const up = dp[r - 1][c]
        const left = dp[r][c - 1]
        dp[r][c] = grid[r - 1][c - 1] + Math.min(up, left)
        gridState[`${r - 1},${c - 1}`] = 'current'
        t.step(L('dp[r][c] = grid'), { vars: { cell: grid[r - 1][c - 1], up: fmt(up), left: fmt(left), 'dp[r][c]': dp[r][c] }, panels: panels(r, c, [`${r - 1},${c}`, `${r},${c - 1}`]), note: `${grid[r - 1][c - 1]} + min(${fmt(up)}, ${fmt(left)}) = ${dp[r][c]}`, say: say('rec', 'You can only arrive from above or from the left, so take the cheaper and add this cell.') })
        gridState[`${r - 1},${c - 1}`] = 'visited'
      }
    }
    let r = rows
    let c = cols
    while (r >= 1 && c >= 1) {
      gridState[`${r - 1},${c - 1}`] = 'path'
      if (r === 1 && c === 1) break
      if (dp[r - 1][c] <= dp[r][c - 1]) r--
      else c--
    }
    t.step(L('return dp[rows][cols]'), { vars: { answer: dp[rows][cols] }, panels: panels(rows, cols), note: `Min path sum = ${dp[rows][cols]}`, say: 'O(r·c) time and space; one rolling row gets space to O(c).' })
  },
  blanks: ['dp[0][1] = 0', ['grid[r - 1][c - 1]', 'grid[r-1][c-1]'], ['min(dp[r - 1][c], dp[r][c - 1])', 'min(dp[r-1][c], dp[r][c-1])']],
})

def({
  slug: 'lcs',
  title: 'Longest common subsequence',
  branch: 'dp',
  tier: 1,
  skills: ['dp-2d'],
  prereqs: ['dp-grid'],
  oneLiner: 'Match → diagonal + 1; mismatch → max of skipping either char.',
  whenToUse: ['two strings, common subsequence', 'diff / similarity of sequences', 'min deletions to make equal', 'dp[i][j] over two prefixes or suffixes'],
  notWhen: ['contiguous substring: different recurrence (reset to 0)', 'one sequence only: LIS or 1-D DP'],
  mnemonic: 'Two zippers: teeth match? zip both (diagonal + 1). No? drop a tooth from one side, keep the max.',
  steps: ['dp of (m+1)×(n+1) zeros', 'loop i, j backward', 'equal → 1 + dp[i+1][j+1]', 'else max(dp[i+1][j], dp[i][j+1])', 'return dp[0][0]'],
  template: `class Solution:
    def longestCommonSubsequence(self, text1: str, text2: str) -> int:
        dp = [[0] * (len(text2) + 1) for _ in range(len(text1) + 1)]

        for i in range(len(text1) - 1, -1, -1):
            for j in range(len(text2) - 1, -1, -1):
                if text1[i] == text2[j]:
                    dp[i][j] = 1 + dp[i + 1][j + 1]
                else:
                    dp[i][j] = max(dp[i + 1][j], dp[i][j + 1])

        return dp[0][0]`,
  time: 'O(n·m)',
  space: 'O(n·m)',
  whyComplexity: 'One O(1) cell per pair of suffixes: m·n cells.',
  variants: ['Edit distance (LC 72)', 'Delete operation for two strings (LC 583)', 'Shortest common supersequence (LC 1092)', 'Longest common substring: reset on mismatch'],
  relatedLc: [1143, 72, 583, 1092],
  compare: [['edit-distance', 'Edit distance minimizes ops with three neighbors'], ['lis-n2', 'LIS is one sequence against itself']],
  problem: 'Length of the longest subsequence common to both strings.',
  inputs: [
    { label: 'abcde / ace', value: { text1: 'abcde', text2: 'ace' } },
    { label: 'acbd / abcd', value: { text1: 'acbd', text2: 'abcd' } },
    { label: 'abc / def', value: { text1: 'abc', text2: 'def' } },
  ],
  run({ text1, text2 }, t, L) {
    const say = once()
    const m = text1.length
    const n = text2.length
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
    const rowLabels = [...text1.split(''), '∅']
    const colLabels = [...text2.split(''), '∅']
    const panels = (i, j, deps = []) => [
      P.array('text1', text1.split(''), { pointers: i !== undefined ? { i } : {}, highlight: i !== undefined ? [i] : [] }),
      P.array('text2', text2.split(''), { pointers: j !== undefined ? { j } : {}, highlight: j !== undefined ? [j] : [] }),
      P.table('dp[i][j] = LCS of text1[i:], text2[j:]', dp, { rowLabels, colLabels, highlight: i !== undefined && j !== undefined ? [`${i},${j}`] : [], deps }),
    ]
    t.step(L('dp = [[0]'), { vars: { m, n }, panels: panels(), note: 'Extra row/col of zeros = empty suffix', say: say('a', 'dp[i][j] is the LCS of the suffixes text1[i:] and text2[j:]. Empty suffix gives 0.') })
    for (let i = m - 1; i >= 0; i--) {
      t.step(L('for i in range'), { vars: { i, 'text1[i]': text1[i] }, panels: panels(i), note: `Row for '${text1[i]}'` })
      for (let j = n - 1; j >= 0; j--) {
        if (text1[i] === text2[j]) {
          dp[i][j] = 1 + dp[i + 1][j + 1]
          t.step(L('dp[i][j] = 1 +'), { vars: { i, j, 'dp[i][j]': dp[i][j] }, panels: panels(i, j, [`${i + 1},${j + 1}`]), note: `'${text1[i]}' matches: 1 + diagonal = ${dp[i][j]}`, say: say('match', 'Characters match, so use both: one plus the answer for the rest of both strings.') })
        } else {
          dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1])
          t.step(L('dp[i][j] = max'), { vars: { i, j, down: dp[i + 1][j], right: dp[i][j + 1], 'dp[i][j]': dp[i][j] }, panels: panels(i, j, [`${i + 1},${j}`, `${i},${j + 1}`]), note: `'${text1[i]}' ≠ '${text2[j]}': max(${dp[i + 1][j]}, ${dp[i][j + 1]}) = ${dp[i][j]}`, say: say('miss', 'No match: skip a char from text1 or from text2, whichever keeps more.') })
        }
      }
    }
    t.step(L('return dp[0][0]'), { vars: { answer: dp[0][0] }, panels: panels(0, 0), note: `LCS length = ${dp[0][0]}`, say: 'O(m·n) time and space. Two rows suffice for O(n) space.' })
  },
  blanks: ['text1[i] == text2[j]', ['1 + dp[i + 1][j + 1]', '1 + dp[i+1][j+1]', 'dp[i + 1][j + 1] + 1'], ['max(dp[i + 1][j], dp[i][j + 1])', 'max(dp[i+1][j], dp[i][j+1])']],
})

def({
  slug: 'edit-distance',
  title: 'Edit distance',
  branch: 'dp',
  tier: 2,
  skills: ['dp-2d'],
  prereqs: ['lcs'],
  oneLiner: 'Min insert/delete/replace ops; match is free, else 1 + min of three.',
  whenToUse: ['minimum operations to convert one string to another', 'insert, delete, replace', 'spell check / fuzzy match', 'one edit away'],
  notWhen: ['only deletions allowed: LCS based', 'only check one edit: O(n) two pointers'],
  mnemonic: 'Three doors out of each mismatch: delete ↓, insert →, replace ↘. Pay 1, take the cheapest.',
  steps: ['dp (m+1)×(n+1)', 'base: dp[i][n] = m - i, dp[m][j] = n - j', 'loop i, j backward', 'equal → dp[i+1][j+1]', 'else 1 + min(down, right, diagonal)', 'return dp[0][0]'],
  template: `class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        m, n = len(word1), len(word2)
        dp = [[0] * (n + 1) for _ in range(m + 1)]

        for i in range(m + 1):
            dp[i][n] = m - i
        for j in range(n + 1):
            dp[m][j] = n - j

        for i in range(m - 1, -1, -1):
            for j in range(n - 1, -1, -1):
                if word1[i] == word2[j]:
                    dp[i][j] = dp[i + 1][j + 1]
                else:
                    dp[i][j] = 1 + min(dp[i + 1][j], dp[i][j + 1], dp[i + 1][j + 1])

        return dp[0][0]`,
  time: 'O(n·m)',
  space: 'O(n·m)',
  whyComplexity: 'm·n suffix pairs, each with an O(1) min of three neighbors.',
  variants: ['One edit distance (LC 161)', 'Delete operation for two strings (LC 583)', 'Min ASCII delete sum (LC 712)'],
  relatedLc: [72, 161, 583, 712],
  compare: [['lcs', 'LCS maximizes matches; edit distance minimizes operations']],
  problem: 'Fewest insert/delete/replace operations turning word1 into word2.',
  inputs: [
    { label: 'horse → ros', value: { word1: 'horse', word2: 'ros' } },
    { label: 'cat → cut', value: { word1: 'cat', word2: 'cut' } },
    { label: 'sun → satur', value: { word1: 'sun', word2: 'satur' } },
  ],
  run({ word1, word2 }, t, L) {
    const say = once()
    const m = word1.length
    const n = word2.length
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
    const rowLabels = [...word1.split(''), '∅']
    const colLabels = [...word2.split(''), '∅']
    const panels = (i, j, deps = []) => [
      P.array('word1', word1.split(''), { pointers: i !== undefined && i < m ? { i } : {}, highlight: i !== undefined && i < m ? [i] : [] }),
      P.array('word2', word2.split(''), { pointers: j !== undefined && j < n ? { j } : {}, highlight: j !== undefined && j < n ? [j] : [] }),
      P.table('dp[i][j] = ops for word1[i:] → word2[j:]', dp, { rowLabels, colLabels, highlight: i !== undefined && j !== undefined ? [`${i},${j}`] : [], deps }),
    ]
    t.step(L('dp = [[0]'), { vars: { m, n }, panels: panels(), note: 'Table over suffix pairs', say: say('a', 'dp[i][j] = edits to turn word1[i:] into word2[j:].') })
    for (let i = 0; i <= m; i++) dp[i][n] = m - i
    t.step(L('dp[i][n] = m - i'), { vars: {}, panels: panels(), note: 'word2 empty: delete everything left', say: say('base', 'Base cases: against an empty string you delete or insert all remaining chars.') })
    for (let j = 0; j <= n; j++) dp[m][j] = n - j
    t.step(L('dp[m][j] = n - j'), { vars: {}, panels: panels(), note: 'word1 empty: insert everything left' })
    for (let i = m - 1; i >= 0; i--) {
      for (let j = n - 1; j >= 0; j--) {
        if (word1[i] === word2[j]) {
          dp[i][j] = dp[i + 1][j + 1]
          t.step(L('dp[i][j] = dp[i + 1][j + 1]'), { vars: { i, j, 'dp[i][j]': dp[i][j] }, panels: panels(i, j, [`${i + 1},${j + 1}`]), note: `'${word1[i]}' = '${word2[j]}': free, copy diagonal ${dp[i][j]}`, say: say('match', 'Same char costs nothing: move both pointers.') })
        } else {
          const del = dp[i + 1][j]
          const ins = dp[i][j + 1]
          const rep = dp[i + 1][j + 1]
          dp[i][j] = 1 + Math.min(del, ins, rep)
          t.step(L('dp[i][j] = 1 + min'), { vars: { i, j, delete: del, insert: ins, replace: rep, 'dp[i][j]': dp[i][j] }, panels: panels(i, j, [`${i + 1},${j}`, `${i},${j + 1}`, `${i + 1},${j + 1}`]), note: `'${word1[i]}' ≠ '${word2[j]}': 1 + min(${del}, ${ins}, ${rep}) = ${dp[i][j]}`, say: say('miss', 'Mismatch: delete moves down, insert moves right, replace moves diagonally. Pay one, take the cheapest.') })
        }
      }
    }
    t.step(L('return dp[0][0]'), { vars: { answer: dp[0][0] }, panels: panels(0, 0), note: `Edit distance = ${dp[0][0]}`, say: 'O(m·n) time and space.' })
  },
  blanks: [['m - i', 'm-i'], ['dp[i + 1][j + 1]', 'dp[i+1][j+1]'], ['1 + min(dp[i + 1][j], dp[i][j + 1], dp[i + 1][j + 1])', '1 + min(dp[i+1][j], dp[i][j+1], dp[i+1][j+1])']],
})

def({
  slug: 'knapsack-01',
  title: '0/1 knapsack (subset sum)',
  branch: 'dp',
  tier: 2,
  skills: ['dp-2d', 'dp-1d'],
  prereqs: ['dp-grid'],
  oneLiner: 'Each item used once: sweep capacity backward so it is not reused.',
  whenToUse: ['pick a subset hitting a sum / capacity', 'each item at most once', 'partition into equal halves', 'target sum with +/-'],
  notWhen: ['items reusable: unbounded knapsack (forward loop)', 'capacity up to 10^9: DP table too big'],
  mnemonic: 'One of each item: walk capacity DOWN so today’s item can’t be counted twice.',
  steps: ['target = total // 2', 'dp = [True] + [False] * target', 'for num in nums', 'for cap from target down to num', 'dp[cap] |= dp[cap - num]', 'return dp[target]'],
  template: `class Solution:
    def canPartition(self, nums: List[int]) -> bool:
        total = sum(nums)
        if total % 2:
            return False

        target = total // 2
        dp = [True] + [False] * target

        for num in nums:
            for cap in range(target, num - 1, -1):
                dp[cap] = dp[cap] or dp[cap - num]

        return dp[target]`,
  time: 'O(n·W)',
  space: 'O(W)',
  whyComplexity: 'n items × W capacities, each O(1); one row reused backward.',
  variants: ['Target sum with +/- (LC 494)', 'Last stone weight II (LC 1049)', 'Ones and zeroes 2-D capacity (LC 474)', 'Classic value/weight knapsack'],
  relatedLc: [416, 494, 1049, 474],
  compare: [['knapsack-unbounded', 'Unbounded loops capacity forward so items repeat'], ['subsets', 'Backtracking enumerates all 2^n subsets instead']],
  problem: 'Can the array be split into two subsets with equal sums?',
  inputs: [
    { label: '1 5 11 5', value: [1, 5, 11, 5] },
    { label: '1 2 3 4', value: [1, 2, 3, 4] },
    { label: '2 2 3 5', value: [2, 2, 3, 5] },
  ],
  run(nums, t, L) {
    const say = once()
    const total = nums.reduce((a, b) => a + b, 0)
    t.step(L('total = sum'), { vars: { total }, panels: [P.array('nums', nums)], note: `Total = ${total}`, say: say('a', 'Equal halves means some subset sums to total / 2. That is 0/1 knapsack.') })
    if (total % 2) {
      t.step(L('return False'), { vars: { total }, panels: [P.array('nums', nums)], note: 'Odd total cannot split' })
      return
    }
    const target = total / 2
    const dp = [true, ...new Array(target).fill(false)]
    const history = []
    const rowLabels = []
    const panels = (idx, cap, num) => [
      P.array('nums', nums, { pointers: idx !== undefined ? { num: idx } : {}, highlight: idx !== undefined ? [idx] : [] }),
      P.array('dp[cap] = sum cap reachable?', dgShow(dp), { pointers: cap !== undefined ? { cap, 'cap-num': cap - num } : {}, highlight: cap !== undefined ? [cap, cap - num] : [] }),
      P.table('dp after each item', history.map(dgShow), { rowLabels: [...rowLabels], colLabels: dp.map((_, k) => k) }),
    ]
    t.step(L('dp = [True]'), { vars: { target }, panels: panels(), note: `Sum 0 is free; aim for ${target}` })
    nums.forEach((num, idx) => {
      t.step(L('for num in nums'), { vars: { num }, panels: panels(idx), note: `Item ${num}: sweep capacity right to left`, say: say('back', 'Backward sweep: dp[cap - num] is still from before this item, so each item is used at most once.') })
      for (let cap = target; cap >= num; cap--) {
        const before = dp[cap]
        dp[cap] = dp[cap] || dp[cap - num]
        if (dp[cap] !== before || cap === target) {
          t.step(L('dp[cap] = dp[cap] or'), { vars: { cap, 'dp[cap - num]': fmt(dp[cap - num]), 'dp[cap]': fmt(dp[cap]) }, panels: panels(idx, cap, num), note: dp[cap] !== before ? `${cap - num} reachable → ${cap} reachable with ${num}` : `cap ${cap}: ${fmt(dp[cap])}`, say: dp[cap] !== before ? say('take', 'If cap - num was reachable, adding num reaches cap.') : undefined })
        }
      }
      history.push([...dp])
      rowLabels.push(`+${num}`)
    })
    t.step(L('return dp[target]'), { vars: { answer: fmt(dp[target]) }, panels: panels(), note: dp[target] ? `Sum ${target} reachable: True` : `Sum ${target} unreachable: False`, say: 'O(n·target) time, O(target) space.' })
  },
  blanks: ['total // 2', ['range(target, num - 1, -1)', 'range(target, num-1, -1)'], ['dp[cap - num]', 'dp[cap-num]']],
})

def({
  slug: 'knapsack-unbounded',
  title: 'Unbounded knapsack (coin change)',
  branch: 'dp',
  tier: 1,
  skills: ['dp-1d'],
  prereqs: ['dp-1d'],
  oneLiner: 'Fewest coins for every amount up to target, reusing coins.',
  whenToUse: ['coins / items reusable', 'minimum coins to make amount', 'number of ways to make change', 'perfect squares / word break'],
  notWhen: ['each item once: 0/1 knapsack backward loop', 'greedy coin systems only work for canonical coins'],
  mnemonic: 'Build every amount from small to big: dp[i] = 1 + best dp[i - coin]. inf means impossible.',
  steps: ['dp = [0] + [inf] * amount', 'for i in 1..amount', 'for c in coins', 'if i - c >= 0: dp[i] = min(dp[i], 1 + dp[i - c])', 'return dp[amount] or -1'],
  template: `class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        dp = [0] + [math.inf] * amount

        for i in range(1, amount + 1):
            for c in coins:
                if i - c >= 0:
                    dp[i] = min(dp[i], 1 + dp[i - c])

        return dp[amount] if dp[amount] != math.inf else -1`,
  time: 'O(n·target)',
  space: 'O(target)',
  whyComplexity: 'amount states × n coins tried per state, each O(1).',
  variants: ['Coin change II count ways: loop coins outside (LC 518)', 'Perfect squares (LC 279)', 'Word break (LC 139)', 'Combination sum IV (LC 377)'],
  relatedLc: [322, 518, 279, 139, 377],
  compare: [['knapsack-01', '0/1 sweeps capacity backward so each item is used once'], ['graph-bfs', 'BFS over amounts also finds fewest coins']],
  problem: 'Fewest coins summing to amount, or -1.',
  inputs: [
    { label: '[1,2,5] → 11', value: { coins: [1, 2, 5], amount: 11 } },
    { label: '[2,5] → 9', value: { coins: [2, 5], amount: 9 } },
    { label: '[3,5] → 7', value: { coins: [3, 5], amount: 7 } },
  ],
  run({ coins, amount }, t, L) {
    const say = once()
    const dp = [0, ...new Array(amount).fill(Infinity)]
    const panels = (i, ci) => [
      P.array('coins', coins, { highlight: ci !== undefined ? [ci] : [] }),
      P.array('dp[i] = fewest coins for i', dgShow(dp), { pointers: i !== undefined ? (ci !== undefined && i - coins[ci] >= 0 ? { i, 'i-c': i - coins[ci] } : { i }) : {}, highlight: i !== undefined ? (ci !== undefined && i - coins[ci] >= 0 ? [i, i - coins[ci]] : [i]) : [] }),
    ]
    t.step(L('dp = [0]'), { vars: { amount }, panels: panels(), note: 'Amount 0 needs 0 coins; rest unknown (∞)', say: say('a', 'dp[i] = fewest coins to make i. Coins are reusable, so it is unbounded knapsack.') })
    for (let i = 1; i <= amount; i++) {
      t.step(L('for i in range'), { vars: { i }, panels: panels(i), note: `Solve amount ${i}` })
      coins.forEach((c, ci) => {
        if (i - c >= 0) {
          const before = dp[i]
          dp[i] = Math.min(dp[i], 1 + dp[i - c])
          t.step(L('dp[i] = min'), { vars: { i, c, 'dp[i - c]': fmt(dp[i - c]), 'dp[i]': fmt(dp[i]) }, panels: panels(i, ci), note: dp[i] < before ? `Use coin ${c}: 1 + dp[${i - c}] = ${fmt(dp[i])}` : `Coin ${c} no better (${fmt(1 + dp[i - c])})`, say: dp[i] < before ? say('use', 'Last coin c leaves amount i - c, already solved. One plus that.') : undefined })
        }
      })
    }
    const answer = dp[amount] === Infinity ? -1 : dp[amount]
    t.step(L('return dp[amount]'), { vars: { answer }, panels: panels(amount), note: answer === -1 ? 'Unreachable: -1' : `Fewest coins = ${answer}`, say: 'O(amount × coins) time, O(amount) space.' })
  },
  blanks: ['[0] + [math.inf] * amount', 'i - c >= 0', ['min(dp[i], 1 + dp[i - c])', 'min(dp[i], dp[i - c] + 1)', 'min(dp[i], 1 + dp[i-c])']],
})

def({
  slug: 'lis-n2',
  title: 'LIS (O(n²) DP)',
  branch: 'dp',
  tier: 1,
  skills: ['dp-1d'],
  prereqs: ['dp-1d'],
  oneLiner: 'dp[i] = longest increasing run ending at i, from smaller earlier j.',
  whenToUse: ['longest increasing subsequence', 'n ≤ 2500', 'chain / nesting (envelopes, pairs)', 'count of LIS'],
  notWhen: ['n up to 10^5: patience sorting O(n log n)', 'contiguous increasing run: one pass'],
  mnemonic: 'Each number asks every earlier smaller number: "can I extend your chain?"',
  steps: ['dp = [1] * n', 'for i in range(n)', 'for j in range(i)', 'nums[j] < nums[i] → dp[i] = max(dp[i], dp[j] + 1)', 'return max(dp)'],
  template: `class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        dp = [1] * len(nums)

        for i in range(len(nums)):
            for j in range(i):
                if nums[j] < nums[i]:
                    dp[i] = max(dp[i], dp[j] + 1)

        return max(dp)`,
  time: 'O(n^2)',
  space: 'O(n)',
  whyComplexity: 'Every pair j < i compared once: n(n-1)/2 checks.',
  variants: ['Number of LIS (LC 673)', 'Russian doll envelopes (LC 354)', 'Largest divisible subset (LC 368)', 'Max length of pair chain (LC 646)'],
  relatedLc: [300, 673, 354, 368, 646],
  compare: [['lis-patience', 'Patience sorting gets O(n log n) with bisect'], ['lcs', 'LCS compares two sequences, LIS one']],
  problem: 'Length of the longest strictly increasing subsequence.',
  inputs: [
    { label: 'classic', value: [10, 9, 2, 5, 3, 7, 101, 18] },
    { label: 'zigzag', value: [0, 1, 0, 3, 2, 3] },
    { label: 'short', value: [4, 10, 4, 3, 8, 9] },
  ],
  run(nums, t, L) {
    const say = once()
    const dp = new Array(nums.length).fill(1)
    const panels = (i, j) => [
      P.array('nums', nums, { pointers: { ...(i !== undefined ? { i } : {}), ...(j !== undefined ? { j } : {}) }, highlight: [i, j].filter(x => x !== undefined) }),
      P.array('dp[i] = LIS ending at i', dp, { highlight: [i, j].filter(x => x !== undefined) }),
    ]
    t.step(L('dp = [1]'), { vars: {}, panels: panels(), note: 'Every number alone is length 1', say: say('a', 'dp[i] = longest increasing subsequence that ends exactly at index i.') })
    for (let i = 0; i < nums.length; i++) {
      t.step(L('for i in range'), { vars: { i, 'nums[i]': nums[i] }, panels: panels(i), note: `Which chains can ${nums[i]} extend?` })
      for (let j = 0; j < i; j++) {
        if (nums[j] < nums[i]) {
          dp[i] = Math.max(dp[i], dp[j] + 1)
          t.step(L('dp[i] = max'), { vars: { i, j, 'dp[j] + 1': dp[j] + 1, 'dp[i]': dp[i] }, panels: panels(i, j), note: `${nums[j]} < ${nums[i]}: extend → dp[${i}] = ${dp[i]}`, say: say('ext', 'A smaller earlier number lets nums[i] extend its chain by one.') })
        } else {
          t.step(L('if nums[j] < nums[i]'), { vars: { i, j }, panels: panels(i, j), note: `${nums[j]} ≥ ${nums[i]}: can't extend` })
        }
      }
    }
    t.step(L('return max(dp)'), { vars: { answer: Math.max(...dp) }, panels: panels(), note: `LIS = ${Math.max(...dp)}`, say: 'The LIS can end anywhere, so return max(dp). O(n²) time, O(n) space.' })
  },
  blanks: ['[1] * len(nums)', 'nums[j] < nums[i]', ['max(dp[i], dp[j] + 1)', 'max(dp[i], 1 + dp[j])', 'max(dp[i], dp[j]+1)'], 'max(dp)'],
})

def({
  slug: 'lis-patience',
  title: 'LIS (patience, n log n)',
  branch: 'dp',
  tier: 2,
  skills: ['dp-1d', 'binary-search'],
  prereqs: ['lis-n2', 'bounds'],
  oneLiner: 'Keep smallest tail per length; bisect each number into place.',
  whenToUse: ['LIS with n up to 10^5', 'longest chain after sorting', 'Russian doll envelopes', 'need O(n log n)'],
  notWhen: ['need the count of LIS: O(n²) DP', 'non-strict increase: use bisect_right'],
  mnemonic: 'Solitaire piles: place each card on the leftmost pile whose top is ≥ it, else start a new pile.',
  steps: ['tails = []', 'for num in nums', 'i = bisect_left(tails, num)', 'i == len → append', 'else tails[i] = num', 'return len(tails)'],
  template: `import bisect

class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        tails = []

        for num in nums:
            i = bisect.bisect_left(tails, num)

            if i == len(tails):
                tails.append(num)
            else:
                tails[i] = num

        return len(tails)`,
  time: 'O(n log n)',
  space: 'O(n)',
  whyComplexity: 'Each of n numbers does one binary search on a sorted tails list.',
  variants: ['Russian doll envelopes: sort w asc, h desc (LC 354)', 'Longest chain of pairs (LC 646)', 'Min deletions to make sorted'],
  relatedLc: [300, 354, 646, 1964],
  compare: [['lis-n2', 'O(n²) DP is simpler and can count LIS'], ['bounds', 'bisect_left is lower bound on tails']],
  problem: 'Length of the longest strictly increasing subsequence in O(n log n).',
  inputs: [
    { label: 'classic', value: [10, 9, 2, 5, 3, 7, 101, 18] },
    { label: 'zigzag', value: [0, 8, 4, 12, 2, 10, 6, 14, 1, 9] },
    { label: 'dupes', value: [7, 7, 3, 7, 8, 1, 2, 3] },
  ],
  run(nums, t, L) {
    const say = once()
    const tails = []
    const panels = (k, i) => [
      P.array('nums', nums, { pointers: k !== undefined ? { num: k } : {}, highlight: k !== undefined ? [k] : [] }),
      P.array('tails[len-1] = smallest tail of an IS of that length', tails, { pointers: i !== undefined ? { i } : {}, highlight: i !== undefined ? [i] : [], sorted: true }),
    ]
    t.step(L('tails = []'), { vars: {}, panels: panels(), note: 'No piles yet', say: say('a', 'tails[k] is the smallest possible tail of an increasing subsequence of length k + 1. It stays sorted.') })
    nums.forEach((num, k) => {
      let i = 0
      while (i < tails.length && tails[i] < num) i++
      t.step(L('i = bisect'), { vars: { num, i }, panels: panels(k, i < tails.length ? i : undefined), note: `bisect_left(${num}) → ${i}`, say: say('bis', 'Binary search for the first tail ≥ num.') })
      if (i === tails.length) {
        tails.push(num)
        t.step(L('tails.append'), { vars: { num, len: tails.length }, panels: panels(k, i), note: `${num} beats every tail: new length ${tails.length}`, say: say('app', 'Bigger than every tail, so it extends the longest subsequence.') })
      } else {
        const old = tails[i]
        tails[i] = num
        t.step(L('tails[i] = num'), { vars: { num, i, replaced: old }, panels: panels(k, i), note: `Replace ${old} with smaller tail ${num}`, say: say('rep', 'Replacing with a smaller tail keeps more room to grow later. Length unchanged.') })
      }
    })
    t.step(L('return len(tails)'), { vars: { answer: tails.length }, panels: panels(), note: `LIS = ${tails.length} (tails is not the LIS itself)`, say: 'O(n log n) time, O(n) space. tails is not the actual subsequence, only its length is right.' })
  },
  blanks: ['bisect.bisect_left(tails, num)', 'i == len(tails)', 'tails[i] = num'],
})

def({
  slug: 'merge-intervals',
  title: 'Merge intervals',
  branch: 'greedy',
  tier: 1,
  skills: ['intervals', 'greedy'],
  prereqs: [],
  oneLiner: 'Sort by start; extend the last interval or start a new one.',
  whenToUse: ['overlapping intervals', 'merge / union of ranges', 'insert interval', 'calendar free time'],
  notWhen: ['count rooms needed: sweep line / heap', 'minimum removals: sort by end greedy'],
  mnemonic: 'Sort by start, then glue: if I start before the last one ends, stretch it.',
  steps: ['sort by start', 'result = []', 'for start, end', 'overlap (start <= last end) → extend end', 'else append'],
  template: `class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        intervals.sort(key=lambda i: i[0])
        result = []

        for start, end in intervals:
            if result and start <= result[-1][1]:
                result[-1][1] = max(result[-1][1], end)
            else:
                result.append([start, end])

        return result`,
  time: 'O(n log n)',
  space: 'O(n)',
  whyComplexity: 'Sorting dominates; the merge pass is linear.',
  variants: ['Insert interval (LC 57)', 'Interval list intersections (LC 986)', 'Employee free time (LC 759)', 'Meeting rooms I: any overlap? (LC 252)'],
  relatedLc: [56, 57, 986, 252],
  compare: [['sweep-line', 'Sweep line counts simultaneous overlaps'], ['interval-scheduling', 'Scheduling sorts by end to keep the most intervals']],
  problem: 'Merge all overlapping intervals.',
  inputs: [
    { label: 'classic', value: [[1, 3], [2, 6], [8, 10], [15, 18]] },
    { label: 'touching', value: [[1, 4], [4, 5], [0, 2], [7, 9], [8, 8]] },
    { label: 'chain', value: [[5, 7], [1, 2], [2, 4], [6, 9], [11, 12], [3, 5]] },
  ],
  run(intervals, t, L) {
    const say = once()
    const result = []
    const panels = (k, hl = []) => [
      P.intervals('intervals', intervals, k !== undefined ? [k] : [], result),
      P.array('result', result.map(r => `[${r[0]},${r[1]}]`), { highlight: hl }),
    ]
    intervals.sort((a, b) => a[0] - b[0])
    t.step(L('intervals.sort'), { vars: { n: intervals.length }, panels: panels(), note: 'Sorted by start time', say: say('a', 'After sorting by start, overlaps are always with the last merged interval.') })
    intervals.forEach(([start, end], k) => {
      t.step(L('for start, end'), { vars: { start, end }, panels: panels(k), note: `Next [${start}, ${end}]` })
      if (result.length && start <= result[result.length - 1][1]) {
        const last = result[result.length - 1]
        last[1] = Math.max(last[1], end)
        t.step(L('result[-1][1] = max'), { vars: { start, 'last end': last[1] }, panels: panels(k, [result.length - 1]), note: `${start} ≤ last end: stretch to [${last[0]}, ${last[1]}]`, say: say('merge', 'It starts before the last one ends, so they overlap. Take the larger end.') })
      } else {
        result.push([start, end])
        t.step(L('result.append'), { vars: { start, end }, panels: panels(k, [result.length - 1]), note: `Gap: new interval [${start}, ${end}]`, say: say('new', 'No overlap with the last one, so start a new merged interval.') })
      }
    })
    t.step(L('return result'), { vars: { result: clone(result) }, panels: panels(), note: `${result.length} merged intervals`, say: 'O(n log n) for the sort, O(n) for the output.' })
  },
  blanks: ['key=lambda i: i[0]', ['start <= result[-1][1]', 'start<=result[-1][1]'], ['max(result[-1][1], end)', 'max(end, result[-1][1])']],
})

def({
  slug: 'sweep-line',
  title: 'Sweep line (meeting rooms)',
  branch: 'greedy',
  tier: 2,
  skills: ['intervals', 'heap'],
  prereqs: ['merge-intervals', 'heap-top-k'],
  oneLiner: 'Sort by start; min-heap of end times counts rooms in use.',
  whenToUse: ['minimum meeting rooms', 'max overlapping intervals at once', 'platforms / cars / CPU tasks', 'events with start and end'],
  notWhen: ['just merge ranges: merge intervals', 'any overlap at all: sort + adjacent check'],
  mnemonic: 'Hotel front desk: when a guest arrives, free the room whose checkout is earliest if they already left.',
  steps: ['sort by start', 'heap = [] of end times', 'for start, end', 'heap[0] <= start → pop (room freed)', 'push end', 'return len(heap)'],
  template: `import heapq

class Solution:
    def minMeetingRooms(self, intervals: List[List[int]]) -> int:
        intervals.sort()
        heap = []

        for start, end in intervals:
            if heap and heap[0] <= start:
                heapq.heappop(heap)
            heapq.heappush(heap, end)

        return len(heap)`,
  time: 'O(n log n)',
  space: 'O(n)',
  whyComplexity: 'Sort plus one push and at most one pop per meeting, each O(log n).',
  variants: ['Sorted starts/ends two pointers (same answer)', 'Car pooling with diff array (LC 1094)', 'My calendar II (LC 731)', 'Min platforms'],
  relatedLc: [253, 1094, 731, 2402],
  compare: [['merge-intervals', 'Merging unions ranges; sweep counts overlap depth'], ['heap-top-k', 'Same heap, keyed on end times']],
  problem: 'Minimum number of rooms so no meetings overlap in a room.',
  inputs: [
    { label: 'classic', value: [[0, 30], [5, 10], [15, 20]] },
    { label: 'stairs', value: [[1, 5], [2, 6], [3, 7], [6, 8], [7, 9]] },
    { label: 'mixed', value: [[9, 10], [4, 9], [4, 17], [2, 6], [1, 3], [5, 8]] },
  ],
  run(intervals, t, L) {
    const say = once()
    const heap = []
    const panels = (k, hl = []) => [
      P.intervals('meetings (sorted by start)', intervals, k !== undefined ? [k] : []),
      P.heap('heap of end times (rooms in use)', heap, hl),
    ]
    intervals.sort((a, b) => a[0] - b[0] || a[1] - b[1])
    t.step(L('intervals.sort'), { vars: {}, panels: panels(), note: 'Process meetings in start order', say: say('a', 'Sort by start. The heap holds end times of busy rooms; its size is rooms in use.') })
    t.step(L('heap = []'), { vars: {}, panels: panels(), note: 'No rooms yet' })
    intervals.forEach(([start, end], k) => {
      t.step(L('for start, end'), { vars: { start, end, 'heap[0]': heap.length ? heap[0] : 'None' }, panels: panels(k, heap.length ? [0] : []), note: `Meeting [${start}, ${end}) arrives` })
      if (heap.length && heap[0] <= start) {
        const freed = heappop(heap)
        t.step(L('heapq.heappop'), { vars: { freed, start }, panels: panels(k), note: `Room ending at ${freed} is free: reuse`, say: say('pop', 'The earliest-ending room is already free, so this meeting takes it.') })
      }
      heappush(heap, end)
      t.step(L('heapq.heappush'), { vars: { end, rooms: heap.length }, panels: panels(k, [heap.indexOf(end)]), note: `Occupy room until ${end}; rooms = ${heap.length}`, say: heap.length > 1 ? say('push', 'Nothing free yet, so the heap grows: another room.') : undefined })
    })
    t.step(L('return len(heap)'), { vars: { answer: heap.length }, panels: panels(), note: `Rooms needed = ${heap.length}`, say: 'O(n log n) time, O(n) space for the heap.' })
  },
  blanks: [['heap[0] <= start', 'start >= heap[0]'], 'heapq.heappop(heap)', 'heapq.heappush(heap, end)', 'len(heap)'],
})

def({
  slug: 'jump-game',
  title: 'Jump game (greedy reach)',
  branch: 'greedy',
  tier: 2,
  skills: ['greedy'],
  prereqs: [],
  oneLiner: 'Track the farthest reachable index; fail if you step past it.',
  whenToUse: ['can you reach the end', 'each value is max jump length', 'min jumps (BFS by levels)', 'gas station style reach'],
  notWhen: ['jumps have costs: DP or Dijkstra', 'exact jump lengths only: BFS / DP'],
  mnemonic: 'Flashlight beam: walk while you are inside the lit area, keep pushing the beam farther.',
  steps: ['farthest = 0', 'for i in range(n)', 'i > farthest → False', 'farthest = max(farthest, i + nums[i])', 'return True'],
  template: `class Solution:
    def canJump(self, nums: List[int]) -> bool:
        farthest = 0

        for i in range(len(nums)):
            if i > farthest:
                return False
            farthest = max(farthest, i + nums[i])

        return True`,
  time: 'O(n)',
  space: 'O(1)',
  whyComplexity: 'One pass; reach only grows and each index is checked once.',
  variants: ['Jump game II min jumps: BFS levels (LC 45)', 'Gas station (LC 134)', 'Video stitching (LC 1024)', 'Jump game III with BFS (LC 1306)'],
  relatedLc: [55, 45, 134, 1024],
  compare: [['dp-1d', 'DP over reachable[i] works but is O(n²)'], ['graph-bfs', 'BFS gives minimum jumps']],
  problem: 'Starting at index 0, can you reach the last index?',
  inputs: [
    { label: 'reachable', value: [2, 3, 1, 1, 4] },
    { label: 'stuck on 0', value: [3, 2, 1, 0, 4] },
    { label: 'long', value: [1, 2, 0, 1, 3, 0, 0, 1] },
  ],
  run(nums, t, L) {
    const say = once()
    let farthest = 0
    const panels = i => [
      P.array('nums (max jump)', nums, { pointers: i !== undefined ? { i, farthest: Math.min(farthest, nums.length - 1) } : { farthest: Math.min(farthest, nums.length - 1) }, window: [0, Math.min(farthest, nums.length - 1)], dim: nums.map((_, k) => k).filter(k => k > farthest), highlight: i !== undefined ? [i] : [] }),
      P.text(`farthest = ${farthest}`),
    ]
    t.step(L('farthest = 0'), { vars: { farthest }, panels: panels(), note: 'Only index 0 reachable', say: say('a', 'Greedy: I only need the farthest index reachable so far.') })
    for (let i = 0; i < nums.length; i++) {
      t.step(L('for i in range'), { vars: { i, farthest }, panels: panels(i), note: `At index ${i}` })
      if (i > farthest) {
        t.step(L('return False'), { vars: { i, farthest }, panels: panels(i), note: `${i} beyond reach ${farthest}: stuck`, say: 'Index i is past the farthest reach, so it and everything after is unreachable. O(n), O(1).' })
        return
      }
      const before = farthest
      farthest = Math.max(farthest, i + nums[i])
      t.step(L('farthest = max'), { vars: { i, 'i + nums[i]': i + nums[i], farthest }, panels: panels(i), note: farthest > before ? `Reach extends to ${farthest}` : `Reach stays ${farthest}`, say: farthest > before ? say('ext', 'From i I can jump up to i + nums[i]; extend the reach.') : undefined })
    }
    t.step(L('return True'), { vars: { farthest }, panels: panels(), note: 'Every index reachable', say: 'Loop finished without getting stuck: True. O(n) time, O(1) space.' })
  },
  blanks: ['i > farthest', ['max(farthest, i + nums[i])', 'max(farthest, nums[i] + i)']],
})

def({
  slug: 'interval-scheduling',
  title: 'Interval scheduling (earliest end)',
  branch: 'greedy',
  tier: 2,
  skills: ['intervals', 'greedy'],
  prereqs: ['merge-intervals'],
  oneLiner: 'Sort by end; keep intervals starting after the last kept end.',
  whenToUse: ['max non-overlapping intervals', 'min removals to stop overlap', 'min arrows to burst balloons', 'activity selection'],
  notWhen: ['weighted intervals: DP + binary search', 'merge ranges: sort by start'],
  mnemonic: 'Pick the meeting that ends first: it leaves the most day for everyone else.',
  steps: ['sort by end', 'last = -inf, result = 0', 'for start, end', 'start >= last → keep, last = end', 'else result += 1 (remove)'],
  template: `class Solution:
    def eraseOverlapIntervals(self, intervals: List[List[int]]) -> int:
        intervals.sort(key=lambda i: i[1])
        result, last = 0, -math.inf

        for start, end in intervals:
            if start >= last:
                last = end
            else:
                result += 1

        return result`,
  time: 'O(n log n)',
  space: 'O(1)',
  whyComplexity: 'Sort dominates; the greedy pass is one comparison per interval.',
  variants: ['Min arrows to burst balloons (LC 452)', 'Max length of pair chain (LC 646)', 'Weighted job scheduling: DP + bisect (LC 1235)'],
  relatedLc: [435, 452, 646, 1235],
  compare: [['merge-intervals', 'Merge sorts by start and unions; this sorts by end and selects'], ['knapsack-01', 'Weighted version needs DP']],
  problem: 'Minimum intervals to remove so the rest do not overlap.',
  inputs: [
    { label: 'one extra', value: [[1, 2], [2, 3], [3, 4], [1, 3]] },
    { label: 'long blocker', value: [[1, 100], [11, 22], [1, 11], [2, 12]] },
    { label: 'mixed', value: [[0, 5], [1, 3], [4, 7], [6, 9], [8, 10], [2, 4]] },
  ],
  run(intervals, t, L) {
    const say = once()
    let result = 0
    let last = -Infinity
    const kept = []
    const panels = k => [
      P.intervals('intervals (sorted by end)', intervals, k !== undefined ? [k] : [], kept),
      P.text(`last end = ${fmt(last)}   removed = ${result}`),
    ]
    intervals.sort((a, b) => a[1] - b[1])
    t.step(L('intervals.sort'), { vars: {}, panels: panels(), note: 'Sorted by end time', say: say('a', 'Greedy: always keep the interval that ends earliest; it leaves the most room.') })
    t.step(L('result, last ='), { vars: { result, last: '-∞' }, panels: panels(), note: 'Nothing kept yet' })
    intervals.forEach(([start, end], k) => {
      t.step(L('for start, end'), { vars: { start, end, last: fmt(last) }, panels: panels(k), note: `Consider [${start}, ${end}]` })
      if (start >= last) {
        last = end
        kept.push([start, end])
        t.step(L('last = end'), { vars: { last }, panels: panels(k), note: `Fits after previous: keep, last = ${end}`, say: say('keep', 'It starts after the last kept end, so it fits. Keep it.') })
      } else {
        result++
        t.step(L('result += 1'), { vars: { result }, panels: panels(k), note: `Overlaps (starts ${start} < ${last}): remove`, say: say('drop', 'It overlaps, and it ends later than what I kept, so dropping it is never worse.') })
      }
    })
    t.step(L('return result'), { vars: { result }, panels: panels(), note: `Remove ${result}`, say: 'O(n log n) for the sort, O(1) extra space.' })
  },
  blanks: ['key=lambda i: i[1]', 'start >= last', 'last = end'],
})


const branches = [
  { id: 'searching', title: 'Searching', color: '#38bdf8' },
  { id: 'linear', title: 'Linear tricks', color: '#22d3ee' },
  { id: 'stacks', title: 'Stacks & deques', color: '#f59e0b' },
  { id: 'lists', title: 'Linked lists', color: '#fb923c' },
  { id: 'sorting', title: 'Sorting & selection', color: '#a3e635' },
  { id: 'heaps', title: 'Heaps', color: '#facc15' },
  { id: 'trees', title: 'Trees', color: '#4ade80' },
  { id: 'traversal', title: 'Graph traversal', color: '#2dd4bf' },
  { id: 'ordering', title: 'Cycles & ordering', color: '#f472b6' },
  { id: 'connectivity', title: 'Connectivity', color: '#34d399' },
  { id: 'paths', title: 'Shortest paths', color: '#60a5fa' },
  { id: 'mst', title: 'MST', color: '#10b981' },
  { id: 'dp', title: 'Dynamic programming', color: '#fb7185' },
  { id: 'backtracking', title: 'Backtracking', color: '#f97316' },
  { id: 'greedy', title: 'Greedy & intervals', color: '#eab308' },
  { id: 'strings', title: 'Strings', color: '#93c5fd' },
  { id: 'bits', title: 'Bits & random', color: '#cbd5e1' },
]

const aid = slug => `algorithms:${slug}`
const withImports = code => {
  const collections = [['dd', /\bdd\(/, 'defaultdict as dd'], ['deque', /\bdeque\(/, 'deque'], ['Counter', /\bCounter\(/, 'Counter']]
    .filter(([, use, name]) => use.test(code) && !new RegExp(`from collections import[^\\n]*\\b${name}`).test(code))
    .map(([, , name]) => name)
  const modules = [['heapq', /\bheapq\./], ['math', /\bmath\./]]
    .filter(([name, use]) => use.test(code) && !new RegExp(`import[^\\n]*\\b${name}\\b`).test(code))
    .map(([name]) => name)
  const header = []
  if (collections.length) header.push(`from collections import ${collections.join(', ')}`)
  if (modules.length) header.push(`import ${modules.join(', ')}`)
  return header.length ? `${header.join('\n')}\n\n${code}` : code
}

for (const spec of specs) spec.template = withImports(spec.template)

const specBySlug = Object.fromEntries(specs.map(spec => [spec.slug, spec]))

const hashString = text => {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619) >>> 0
  return h
}

const placeAnswer = (correct, distractors, seed) => {
  const position = hashString(seed) % 4
  const choices = [...distractors.slice(0, 3)]
  choices.splice(position, 0, correct)
  return { choices, answer: position }
}

const depthOf = (() => {
  const memo = {}
  const depth = slug => {
    if (memo[slug] !== undefined) return memo[slug]
    memo[slug] = 0
    const prereqs = (specBySlug[slug]?.prereqs || []).filter(p => specBySlug[p])
    memo[slug] = prereqs.length ? 1 + Math.max(...prereqs.map(depth)) : 0
    return memo[slug]
  }
  return depth
})()

const maxDepth = Math.max(0, ...specs.map(spec => depthOf(spec.slug)))
const branchIndex = Object.fromEntries(branches.map((branch, i) => [branch.id, i]))
const slotCount = {}

const tree = specs.map(spec => {
  const depth = depthOf(spec.slug)
  const slotKey = `${spec.branch}:${depth}`
  const slot = slotCount[slotKey] || 0
  slotCount[slotKey] = slot + 1
  const column = (branchIndex[spec.branch] + 0.5) / branches.length
  const nudge = slot === 0 ? 0 : (slot % 2 ? 1 : -1) * Math.ceil(slot / 2) * 0.022
  return {
    id: aid(spec.slug),
    title: spec.title,
    branch: spec.branch,
    x: Math.round((column + nudge) * 1000) / 1000,
    y: Math.round(((depth + 0.5) / (maxDepth + 1)) * 1000) / 1000,
    prereqs: (spec.prereqs || []).map(aid),
    tier: spec.tier,
  }
})

const traces = specs.map(spec => {
  const L = lineFinder(spec.template)
  return {
    id: `algorithms:trace:${spec.slug}`,
    title: spec.traceTitle || spec.title,
    skills: [...new Set([...spec.skills, 'communication'])],
    problem: spec.problem,
    code: spec.template,
    complexity: { time: spec.time, space: spec.space, why: spec.whyComplexity },
    inputs: spec.inputs,
    run(input, t) {
      return spec.run(clone(input), t, L)
    },
  }
})

const algorithms = specs.map(spec => ({
  id: aid(spec.slug),
  title: spec.title,
  branch: spec.branch,
  tier: spec.tier,
  skills: spec.skills,
  prereqs: (spec.prereqs || []).map(aid),
  oneLiner: spec.oneLiner,
  whenToUse: spec.whenToUse,
  notWhen: spec.notWhen,
  mnemonic: spec.mnemonic,
  steps: spec.steps,
  template: spec.template,
  time: spec.time,
  space: spec.space,
  whyComplexity: spec.whyComplexity,
  variants: spec.variants,
  relatedLc: spec.relatedLc,
  traceId: `algorithms:trace:${spec.slug}`,
  ...(spec.compare ? { compare: spec.compare.map(([slug, difference]) => ({ algoId: aid(slug), difference })) } : {}),
}))

const flashcards = specs.flatMap(spec => [
  {
    id: `algorithms:card:${spec.slug}:signal`,
    skills: spec.skills,
    front: spec.signal || `Prompt says: "${spec.whenToUse[0]}". Which algorithm?`,
    back: `${spec.title}. ${spec.mnemonic}`,
  },
  {
    id: `algorithms:card:${spec.slug}:complexity`,
    skills: [...new Set([...spec.skills, 'complexity'])],
    front: `${spec.title}: time and space?`,
    back: `${spec.time} time, ${spec.space} space. ${spec.whyComplexity}`,
  },
])

const timePool = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n^2)', 'O(n^3)', 'O(2^n)', 'O(n!)', 'O(V+E)', 'O((V+E) log V)', 'O(V·E)', 'O(V^3)', 'O(E log E)', 'O(n·m)', 'O(n log k)', 'O(k)', 'O(n·W)', 'O(n·target)', 'O(α(n))', 'O(L)', 'O(n + k)', 'O(log(range)·n)']

const familyOf = branch => ({ traversal: 'graph', ordering: 'graph', connectivity: 'graph', paths: 'graph', mst: 'graph', sorting: 'order', heaps: 'order', trees: 'tree', backtracking: 'tree' }[branch] || branch)

const pickDistractors = (spec, count) => {
  const blocked = new Set((spec.compare || []).map(([slug]) => slug))
  const family = familyOf(spec.branch)
  return [...specs]
    .filter(other => other.slug !== spec.slug && !blocked.has(other.slug) && familyOf(other.branch) !== family && other.title !== spec.title)
    .sort((a, b) => hashString(spec.slug + a.slug) - hashString(spec.slug + b.slug))
    .map(other => other.title)
    .filter((title, i, list) => list.indexOf(title) === i)
    .slice(0, count)
}

const mcqs = specs.flatMap(spec => {
  const chooser = placeAnswer(spec.title, pickDistractors(spec, 3), `${spec.slug}:choose`)
  const wrongTimes = timePool
    .filter(time => time !== spec.time)
    .sort((a, b) => hashString(spec.slug + a) - hashString(spec.slug + b))
  const complexityPick = placeAnswer(spec.time, wrongTimes, `${spec.slug}:time`)
  const signals = spec.whenToUse.slice(0, 2).map(s => `"${s}"`).join(' + ')
  return [
    {
      id: `algorithms:mcq:${spec.slug}:choose`,
      skills: [...new Set([...spec.skills, 'ds-diagnosis'])],
      difficulty: spec.tier === 1 ? 1 : 2,
      q: `Signals: ${signals}. Reach for?`,
      choices: chooser.choices,
      answer: chooser.answer,
      why: `${spec.title}: ${spec.oneLiner}`,
    },
    {
      id: `algorithms:mcq:${spec.slug}:time`,
      skills: [...new Set([...spec.skills, 'complexity'])],
      difficulty: spec.tier === 3 ? 3 : 2,
      q: spec.slug === 'quicksort-partition' ? `Average time complexity of ${spec.title}?` : `Time complexity of ${spec.title}?`,
      code: spec.template,
      choices: complexityPick.choices,
      answer: complexityPick.answer,
      why: spec.whyComplexity,
    },
    ...(spec.extraMcqs || []).map((extra, i) => ({
      id: `algorithms:mcq:${spec.slug}:x${i}`,
      skills: spec.skills,
      difficulty: 2,
      ...extra,
    })),
  ]
})

const clozes = specs
  .filter(spec => spec.blanks && spec.blanks.length)
  .map(spec => {
    let code = spec.template
    let from = 0
    for (const blank of spec.blanks) {
      const [literal, ...alts] = Array.isArray(blank) ? blank : [blank]
      const at = code.indexOf(literal, from)
      if (at < 0) throw new Error(`cloze literal not found in ${spec.slug}: ${literal}`)
      const token = `[[${[literal, ...alts].join('|')}]]`
      code = code.slice(0, at) + token + code.slice(at + literal.length)
      from = at + token.length
    }
    return {
      id: `algorithms:cloze:${spec.slug}`,
      skills: spec.skills,
      title: spec.title,
      code,
      hint: spec.mnemonic,
    }
  })

const dedent = lines => {
  const indents = lines.map(line => line.match(/^ */)[0].length)
  const min = Math.min(...indents)
  return lines.map(line => line.slice(min))
}

const parsonsLines = spec => {
  if (Array.isArray(spec.parsons)) return spec.parsons
  const all = spec.template.split('\n')
  let slice = all
  if (spec.parsons && spec.parsons.start) {
    const L = lineFinder(spec.template)
    slice = all.slice(L(spec.parsons.start) - 1, L(spec.parsons.end) )
  }
  return dedent(slice.filter(line => line.trim() && !/^(import|from) /.test(line.trim())))
}

const parsons = specs
  .filter(spec => spec.tier === 1 || spec.parsons)
  .map(spec => ({
    id: `algorithms:parsons:${spec.slug}`,
    skills: spec.skills,
    title: spec.title,
    lines: parsonsLines(spec),
    ...(spec.distractors ? { distractors: spec.distractors } : {}),
  }))

const ids = list => list.map(aid).filter(id => specBySlug[id.slice(11)])

const paths = [
  {
    id: 'algorithms:path:must-know',
    title: 'Must-know core',
    minutes: 150,
    algoIds: ids(['hashmap-lookup', 'two-pointers', 'sliding-window-variable', 'prefix-sum-hashmap', 'binary-search', 'bs-on-answer', 'monotonic-stack', 'reverse-linked-list', 'fast-slow-pointers', 'heap-top-k', 'tree-dfs', 'tree-bfs', 'bst-validate', 'lca', 'trie', 'graph-dfs', 'graph-bfs', 'flood-fill', 'multi-source-bfs', 'topo-kahn', 'union-find', 'dijkstra', 'subsets', 'permutations', 'dp-1d', 'dp-grid', 'merge-intervals']),
  },
  {
    id: 'algorithms:path:graph-spine',
    title: 'Graph spine',
    minutes: 90,
    algoIds: ids(['graph-dfs', 'graph-dfs-iterative', 'graph-bfs', 'flood-fill', 'multi-source-bfs', 'bipartite', 'cycle-undirected', 'cycle-directed', 'topo-kahn', 'topo-dfs', 'union-find', 'dijkstra', 'zero-one-bfs', 'bellman-ford', 'prim', 'kruskal']),
  },
  {
    id: 'algorithms:path:tree-essentials',
    title: 'Tree essentials',
    minutes: 45,
    algoIds: ids(['tree-dfs', 'tree-dfs-iterative', 'tree-bfs', 'bst-ops', 'bst-validate', 'lca', 'trie']),
  },
  {
    id: 'algorithms:path:linear-warmup',
    title: 'Array & string warm-up',
    minutes: 60,
    algoIds: ids(['hashmap-lookup', 'two-pointers', 'sliding-window-fixed', 'sliding-window-variable', 'prefix-sum', 'prefix-sum-hashmap', 'kadane', 'binary-search', 'bounds', 'bs-on-answer', 'monotonic-stack', 'monotonic-deque']),
  },
  {
    id: 'algorithms:path:dp-ladder',
    title: 'DP ladder',
    minutes: 60,
    algoIds: ids(['dp-1d', 'knapsack-unbounded', 'lis-n2', 'dp-grid', 'lcs', 'edit-distance', 'knapsack-01', 'lis-patience']),
  },
  {
    id: 'algorithms:path:search-and-choose',
    title: 'Backtracking & greedy',
    minutes: 40,
    algoIds: ids(['subsets', 'permutations', 'combination-sum', 'jump-game', 'interval-scheduling', 'merge-intervals', 'sweep-line']),
  },
  {
    id: 'algorithms:path:bonus',
    title: 'Bonus round',
    minutes: 45,
    algoIds: specs.filter(spec => spec.tier === 3).map(spec => aid(spec.slug)),
  },
]

export default {
  id: 'algorithms',
  title: 'Algorithm Tree',
  icon: '🌳',
  skills: [...new Set(specs.flatMap(spec => spec.skills))],
  tree,
  branches,
  paths,
  algorithms,
  traces,
  flashcards,
  mcqs,
  clozes,
  parsons,
  lessons: [],
  problems: [],
}
