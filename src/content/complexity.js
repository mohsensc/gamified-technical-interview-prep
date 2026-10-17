const topicId = 'complexity'
const clone = value => JSON.parse(JSON.stringify(value))
const C = ['complexity']
const K = ['constraints']
const D = ['ds-diagnosis']
const CK = ['complexity', 'constraints']
const CD = ['complexity', 'ds-diagnosis']
const KD = ['constraints', 'ds-diagnosis']

const placeAnswer = (choices, slot) => {
  const [correct, ...rest] = choices
  const ordered = [...rest]
  ordered.splice(slot, 0, correct)
  return { choices: ordered, answer: slot }
}

const lessons = [
  {
    id: 'complexity:lesson:big-o',
    title: 'What Big-O actually counts',
    skills: ['complexity'],
    slides: [
      {
        title: 'Count the work, drop the noise',
        points: ['Big-O = how work grows as n grows', 'Drop constants: 3n → n', 'Keep the biggest term: n² + n → n²'],
        panels: [
          { kind: 'table', label: 'ops when n = 1,000', colLabels: ['growth', 'ops'], rows: [['log n', '10'], ['n', '1,000'], ['n log n', '10,000'], ['n²', '1,000,000'], ['2ⁿ', '∞ (10³⁰¹)']], highlight: ['3,1'] },
        ],
      },
      {
        title: 'One loop = O(n)',
        code: `for num in nums:
    total += num`,
        highlight: 1,
        panels: [{ kind: 'complexity', label: 'body runs', n: 8, ops: 8 }],
        points: ['Body runs once per element'],
      },
      {
        title: 'Nested loops multiply',
        code: `for i in range(n):
    for j in range(i + 1, n):
        check(i, j)`,
        highlight: 3,
        panels: [{ kind: 'complexity', label: 'pairs checked', n: 8, ops: 28 }],
        points: ['n(n-1)/2 pairs → still O(n²)', 'Starting j at i+1 halves work, not the class'],
      },
      {
        title: 'Sequential loops add',
        code: `for a in nums:
    seen.add(a)
for b in other:
    if b in seen:
        count += 1`,
        points: ['Loop then loop → O(n + m)', 'Not n·m: they never nest'],
      },
      {
        title: 'Halving = log n',
        code: `while n > 1:
    n //= 2`,
        panels: [{ kind: 'array', label: 'n = 16 halves', values: [16, 8, 4, 2, 1], highlight: [4] }],
        points: ['16 → 1 in 4 steps = log₂ 16', 'Binary search, balanced trees, i *= 2'],
      },
      {
        title: 'Check yourself',
        code: `i = 1
while i < n:
    for j in range(n):
        work()
    i *= 2`,
        ask: { q: 'Time complexity?', choices: ['O(n²)', 'O(n log n)', 'O(log n)', 'O(n)'], answer: 1, why: 'Outer loop doubles i → log n rounds, each doing n work.' },
      },
    ],
  },
  {
    id: 'complexity:lesson:recursion-amortized',
    title: 'Recursion trees & amortized',
    skills: ['complexity'],
    slides: [
      {
        title: 'Recursion: branches ^ depth',
        code: `def dfs(i):
    if i <= 1:
        return i
    return dfs(i - 1) + dfs(i - 2)`,
        panels: [{
          kind: 'tree', label: 'calls for fib(4)',
          root: { id: 'a', val: 'f4', left: { id: 'b', val: 'f3', left: { id: 'd', val: 'f2', left: { id: 'h', val: 'f1', left: null, right: null }, right: { id: 'i', val: 'f0', left: null, right: null } }, right: { id: 'e', val: 'f1', left: null, right: null } }, right: { id: 'c', val: 'f2', left: { id: 'f', val: 'f1', left: null, right: null }, right: { id: 'g', val: 'f0', left: null, right: null } } },
          state: { d: 'current', c: 'current' },
        }],
        points: ['2 branches, depth n → O(2ⁿ)', 'Amber: f2 computed twice'],
      },
      {
        title: 'Memo collapses the tree',
        code: `@cache
def dfs(i):
    if i <= 1:
        return i
    return dfs(i - 1) + dfs(i - 2)`,
        points: ['Distinct states × work per state', 'n states × O(1) = O(n)'],
        panels: [{ kind: 'complexity', label: 'calls fib(30)', n: 30, ops: 59 }],
      },
      {
        title: 'Divide & conquer',
        panels: [{ kind: 'table', label: 'merge sort levels', colLabels: ['level', 'pieces', 'work'], rows: [['0', '1 × n', 'n'], ['1', '2 × n/2', 'n'], ['2', '4 × n/4', 'n'], ['…', 'log n levels', 'n each']] }],
        points: ['log n levels × n per level', '= O(n log n)'],
      },
      {
        title: 'Amortized: dynamic array',
        panels: [{ kind: 'array', label: 'capacity doubles: 1,2,4,8', values: [1, 2, 3, 4, 5, null, null, null], highlight: [4], dim: [5, 6, 7] }],
        points: ['Rare O(n) copy on resize', 'Total copies ≤ 2n → append is O(1) amortized'],
      },
      {
        title: 'Amortized: monotonic stack',
        code: `for i in range(len(nums)):
    while stack and nums[stack[-1]] < nums[i]:
        stack.pop()
    stack.append(i)`,
        points: ['Each index pushed once, popped once', 'Inner while totals n → O(n), not n²'],
      },
      {
        title: 'Check yourself',
        ask: { q: 'Backtracking over all subsets of n items, copying each to output?', choices: ['O(2ⁿ)', 'O(n · 2ⁿ)', 'O(n²)', 'O(n!)'], answer: 1, why: '2ⁿ subsets, each copy costs up to n.' },
      },
    ],
  },
  {
    id: 'complexity:lesson:space',
    title: 'Space: stack, structures, output',
    skills: ['complexity'],
    slides: [
      {
        title: 'Space = extra memory you allocate',
        points: ['Hash sets, queues, memo tables', 'Recursion stack counts too', 'Say whether output is included'],
      },
      {
        title: 'Recursion stack = max depth',
        panels: [{ kind: 'callstack', label: 'skewed tree depth n', frames: ['dfs(1)', 'dfs(2)', 'dfs(3)', 'dfs(4)', 'dfs(5)'] }],
        points: ['Balanced tree → O(log n)', 'Skewed / linked-list shape → O(n)'],
      },
      {
        title: 'BFS queue = widest level',
        panels: [{ kind: 'queue', label: 'last level of full tree', items: ['8', '9', '10', '11', '12', '13', '14', '15'] }],
        points: ['Full binary tree: ~n/2 leaves wait together', '→ O(n) space'],
      },
      {
        title: 'Rolling arrays',
        code: `prev, curr = 0, 1
for _ in range(n):
    prev, curr = curr, prev + curr`,
        points: ['dp[i] only needs dp[i-1], dp[i-2]', 'O(n) table → O(1) two vars'],
      },
      {
        title: 'Hidden copies',
        code: `rest = nums[1:]
key = ''.join(sorted(word))`,
        points: ['Slices copy: O(k) time and space', 'sorted() returns a new list'],
      },
      {
        title: 'Check yourself',
        ask: { q: 'DFS on an r×c grid of all land, recursive. Worst stack depth?', choices: ['O(1)', 'O(r + c)', 'O(r · c)', 'O(log(r·c))'], answer: 2, why: 'Snake path can visit every cell before returning.' },
      },
    ],
  },
  {
    id: 'complexity:lesson:constraints',
    title: 'Read constraints → target complexity',
    skills: ['constraints', 'complexity'],
    slides: [
      {
        title: 'Budget: ~10⁸ ops per second',
        points: ['Plug n into candidate Big-O', 'Under ~10⁸ → passes', 'Way over → need a faster idea'],
        panels: [{ kind: 'complexity', label: 'n = 10⁵, O(n²)', n: 100000, ops: 10000000000 }],
      },
      {
        title: 'The cheat table',
        panels: [{
          kind: 'table', label: 'n → target',
          colLabels: ['max n', 'target'],
          rows: [['≤ 10', 'O(n!) / O(2ⁿ·n)'], ['≤ 20', 'O(2ⁿ)'], ['≤ 100', 'O(n³)'], ['≤ 3000', 'O(n²)'], ['≤ 10⁵', 'O(n log n)'], ['≤ 10⁶', 'O(n)'], ['≤ 10⁹', 'O(log n) / O(√n)']],
        }],
      },
      {
        title: 'Tiny n is a hint',
        points: ['n ≤ 20 screams subsets / bitmask', 'n ≤ 10 screams permutations', 'They let you brute force'],
        panels: [{ kind: 'complexity', label: '2²⁰', n: 20, ops: 1048576 }],
      },
      {
        title: 'Huge values → binary search the answer',
        points: ['Values up to 10⁹ but n ≤ 10⁵', 'Search the answer space: O(n log V)', 'log₂ 10⁹ ≈ 30'],
      },
      {
        title: 'Graphs & grids',
        points: ['V, E ≤ 10⁵ → O(V + E) BFS/DFS', 'Weighted → O((V+E) log V)', 'r·c ≤ 10⁵ cells → visit each once'],
      },
      {
        title: 'Say it out loud',
        points: ['"n is up to 10⁵, so n² is 10¹⁰: too slow."', '"I need n log n or better."'],
        ask: { q: 'n ≤ 2·10⁵, count pairs with a property. Target?', choices: ['O(n²)', 'O(n log n)', 'O(2ⁿ)', 'O(n³)'], answer: 1, why: 'n² = 4·10¹⁰ is too slow; sort + two pointers or hashing fits.' },
      },
    ],
  },
  {
    id: 'complexity:lesson:python-costs',
    title: 'Python data structure costs',
    skills: ['ds-diagnosis', 'complexity'],
    slides: [
      {
        title: 'list: fast at the end only',
        panels: [{ kind: 'table', label: 'list ops', colLabels: ['op', 'cost'], rows: [['append / pop()', 'O(1)'], ['pop(0) / insert(0,x)', 'O(n)'], ['x in lst', 'O(n)'], ['lst[i]', 'O(1)'], ['lst[a:b]', 'O(b-a)']], highlight: ['1,1', '2,1'] }],
      },
      {
        title: 'deque: fast at both ends',
        code: `queue = deque([start])
node = queue.popleft()`,
        panels: [{ kind: 'queue', label: 'popleft O(1)', items: ['a', 'b', 'c', 'd'], highlight: [0] }],
        points: ['BFS always uses deque', 'list.pop(0) makes BFS O(n²)'],
      },
      {
        title: 'set / dict: O(1) average',
        panels: [{ kind: 'table', label: 'hash ops', colLabels: ['op', 'cost'], rows: [['x in s', 'O(1) avg'], ['d[k] = v', 'O(1) avg'], ['del d[k]', 'O(1) avg'], ['Counter(nums)', 'O(n)']] }],
        points: ['Keys must be hashable: tuple yes, list no'],
      },
      {
        title: 'heapq: min on top',
        panels: [{ kind: 'heap', label: 'min-heap', items: [1, 3, 2, 7, 4, 5, 6] }],
        points: ['heappush / heappop: O(log n)', 'heapify(list): O(n)', 'heap[0]: O(1) peek'],
      },
      {
        title: 'Strings & sorting',
        points: ['Strings immutable: s += c copies', 'Build list, then "".join → O(n)', 'sorted(): O(n log n), new list'],
      },
      {
        title: 'Pick the DS from the need',
        panels: [{ kind: 'table', label: 'need → DS', colLabels: ['need', 'use'], rows: [['seen before?', 'set'], ['count things', 'Counter'], ['FIFO / BFS', 'deque'], ['undo / match', 'stack'], ['repeated min/max', 'heap'], ['prefix lookup', 'trie'], ['sorted + search', 'bisect']] }],
      },
    ],
  },
]

const nestedCode = `class Solution:
    def countPairs(self, nums: List[int], target: int) -> int:

        result = 0

        for i in range(len(nums)):
            for j in range(i + 1, len(nums)):
                if nums[i] + nums[j] == target:
                    result += 1

        return result`

const twoPointerCode = `class Solution:
    def twoSum(self, numbers: List[int], target: int) -> List[int]:

        left, right = 0, len(numbers) - 1

        while left < right:
            total = numbers[left] + numbers[right]
            if total == target:
                return [left + 1, right + 1]
            elif total > target:
                right -= 1
            else:
                left += 1

        return []`

const binarySearchCode = `class Solution:
    def search(self, nums: List[int], target: int) -> int:

        left, right = 0, len(nums) - 1

        while left <= right:
            mid = ((right - left) // 2) + left
            if nums[mid] == target:
                return mid
            elif nums[mid] > target:
                right = mid - 1
            else:
                left = mid + 1

        return -1`

const fibCode = `class Solution:
    def fib(self, n: int) -> int:

        def dfs(i):
            if i <= 1:
                return i

            return dfs(i - 1) + dfs(i - 2)

        return dfs(n)`

const memoCode = `class Solution:
    def fib(self, n: int) -> int:

        memo = {}

        def dfs(i):
            if i <= 1:
                return i
            if i in memo:
                return memo[i]

            memo[i] = dfs(i - 1) + dfs(i - 2)
            return memo[i]

        return dfs(n)`

const bfsCode = `from collections import deque

class Solution:
    def bfs(self, n: int, edges: List[List[int]]) -> List[int]:

        graph = {i: [] for i in range(n)}
        for a, b in edges:
            graph[a].append(b)
            graph[b].append(a)

        order, seen = [], {0}
        queue = deque([0])

        while queue:
            node = queue.popleft()
            order.append(node)
            for nei in graph[node]:
                if nei not in seen:
                    seen.add(nei)
                    queue.append(nei)

        return order`

const traces = [
  {
    id: 'complexity:trace:nested-loop',
    title: 'Nested loops: watch n² grow',
    skills: ['complexity', 'constraints'],
    problem: 'Count pairs (i < j) whose sum equals target, brute force.',
    code: nestedCode,
    complexity: { time: 'O(n²)', space: 'O(1)', why: 'Every pair i<j is checked once: n(n-1)/2.' },
    inputs: [
      { label: 'n = 5', value: { nums: [1, 4, 2, 3, 5], target: 6 } },
      { label: 'n = 8', value: { nums: [3, 1, 5, 2, 4, 6, 0, 3], target: 6 } },
    ],
    run(input, t) {
      const { nums, target } = input
      const n = nums.length
      let result = 0
      let ops = 0
      const panels = (i, j, hit) => [
        { kind: 'array', label: 'nums', values: [...nums], pointers: j === undefined ? (i === undefined ? {} : { i }) : { i, j }, highlight: hit ? [i, j] : [] },
        { kind: 'complexity', label: 'pair checks', n, ops },
        { kind: 'text', text: `checks so far ${ops} · total will be n(n-1)/2 = ${(n * (n - 1)) / 2}` },
      ]
      t.step(4, { vars: { result, n }, panels: panels(), note: 'Brute force: try every pair.', say: 'First the brute force: check every pair, that is O(n²).' })
      for (let i = 0; i < n; i++) {
        t.step(6, { vars: { i, result }, panels: panels(i), note: `Outer pass i=${i}: inner runs ${n - i - 1} times.`, say: i === 0 ? 'Outer loop is n, inner loop shrinks: n-1, n-2, ... sums to n²/2.' : undefined })
        for (let j = i + 1; j < n; j++) {
          ops++
          const hit = nums[i] + nums[j] === target
          t.step(8, { vars: { i, j, sum: nums[i] + nums[j], result }, panels: panels(i, j, hit), note: hit ? 'Match!' : `${nums[i]}+${nums[j]} ≠ ${target}` })
          if (hit) {
            result++
            t.step(9, { vars: { i, j, result }, panels: panels(i, j, true), note: 'Count it.' })
          }
        }
      }
      t.step(11, { vars: { result, ops }, panels: panels(), note: `${ops} checks for n=${n}: quadratic.`, say: `With n up to 10^5 this is 5·10^9 checks, too slow. A hashmap gets it to O(n).` })
    },
  },
  {
    id: 'complexity:trace:two-pointers',
    title: 'Two pointers: one pass, O(n)',
    skills: ['complexity', 'two-pointers'],
    problem: 'Sorted array: find 1-indexed positions of two numbers summing to target.',
    code: twoPointerCode,
    complexity: { time: 'O(n)', space: 'O(1)', why: 'Each step moves one pointer inward; at most n-1 moves.' },
    inputs: [
      { label: 'found late', value: { numbers: [1, 3, 4, 5, 7, 10, 11, 15], target: 10 } },
      { label: 'not found', value: { numbers: [1, 3, 5, 7, 9, 13, 15, 21, 25], target: 100 } },
      { label: 'tiny', value: { numbers: [2, 7, 11, 15], target: 9 } },
    ],
    run(input, t) {
      const { numbers, target } = input
      const n = numbers.length
      let left = 0
      let right = n - 1
      let ops = 0
      const dim = () => numbers.map((_, k) => k).filter(k => k < left || k > right)
      const panels = hit => [
        { kind: 'array', label: 'numbers (sorted)', values: [...numbers], pointers: { left, right }, window: [left, right], dim: dim(), highlight: hit ? [left, right] : [], sorted: true },
        { kind: 'complexity', label: 'iterations', n, ops },
      ]
      t.step(4, { vars: { left, right, target }, panels: panels(), note: 'Pointers at both ends.', say: 'Array is sorted, so I can squeeze from both ends in one pass.' })
      while (left < right) {
        ops++
        t.step(6, { vars: { left, right }, panels: panels(), note: `Window size ${right - left + 1}.` })
        const total = numbers[left] + numbers[right]
        t.step(7, { vars: { left, right, total }, panels: panels(), note: `${numbers[left]} + ${numbers[right]} = ${total}` })
        if (total === target) {
          t.step(9, { vars: { left, right, total }, panels: panels(true), note: 'Found the pair.', say: `Found it in ${ops} iterations. Each step drops one element, so O(n) time, O(1) space.` })
          return
        }
        if (total > target) {
          right--
          t.step(11, { vars: { left, right, total }, panels: panels(), note: 'Too big → shrink right.', say: ops === 1 ? 'Too big, and right is the largest, so it can never pair with anything. Drop it.' : undefined })
        } else {
          left++
          t.step(13, { vars: { left, right, total }, panels: panels(), note: 'Too small → grow left.', say: ops <= 2 ? 'Too small, left is smallest, so it is useless. Drop it.' : undefined })
        }
      }
      t.step(15, { vars: { left, right }, panels: panels(), note: `No pair after ${ops} steps (≤ n-1).`, say: 'Worst case each element is dropped once: linear.' })
    },
  },
  {
    id: 'complexity:trace:binary-search',
    title: 'Binary search: log n halvings',
    skills: ['complexity', 'binary-search'],
    problem: 'Find target index in a sorted array, or -1.',
    code: binarySearchCode,
    complexity: { time: 'O(log n)', space: 'O(1)', why: 'Range halves each iteration: log₂ n steps.' },
    inputs: [
      { label: 'n = 16, present', value: { nums: [1, 3, 4, 6, 8, 9, 11, 14, 15, 17, 20, 22, 25, 28, 30, 33], target: 25 } },
      { label: 'n = 16, missing', value: { nums: [1, 3, 4, 6, 8, 9, 11, 14, 15, 17, 20, 22, 25, 28, 30, 33], target: 2 } },
      { label: 'n = 32', value: { nums: Array.from({ length: 32 }, (_, k) => k * 3 + 1), target: 88 } },
    ],
    run(input, t) {
      const { nums, target } = input
      const n = nums.length
      let left = 0
      let right = n - 1
      let ops = 0
      let mid
      const log = Math.ceil(Math.log2(n + 1))
      const panels = hit => [
        { kind: 'array', label: 'nums', values: [...nums], pointers: mid === undefined ? { left, right } : { left, mid, right }, window: [left, right], dim: nums.map((_, k) => k).filter(k => k < left || k > right), highlight: hit ? [mid] : [], sorted: true },
        { kind: 'complexity', label: 'halvings', n, ops },
        { kind: 'text', text: `range size ${Math.max(0, right - left + 1)} · max steps ⌈log₂(n+1)⌉ = ${log}` },
      ]
      t.step(4, { vars: { left, right, target }, panels: panels(), note: 'Search whole range.', say: 'Sorted input, so binary search: O(log n).' })
      while (left <= right) {
        ops++
        t.step(6, { vars: { left, right }, panels: panels(), note: `Range has ${right - left + 1} items.` })
        mid = Math.floor((right - left) / 2) + left
        t.step(7, { vars: { left, mid, right }, panels: panels(), note: `mid = ${mid}, nums[mid] = ${nums[mid]}` })
        if (nums[mid] === target) {
          t.step(9, { vars: { mid }, panels: panels(true), note: `Found in ${ops} steps.`, say: `${ops} steps for n=${n}. Doubling n adds just one step.` })
          return
        }
        if (nums[mid] > target) {
          right = mid - 1
          t.step(11, { vars: { left, mid, right }, panels: panels(), note: 'Too big → discard right half.', say: ops === 1 ? 'Each comparison throws away half the range.' : undefined })
        } else {
          left = mid + 1
          t.step(13, { vars: { left, mid, right }, panels: panels(), note: 'Too small → discard left half.', say: ops === 1 ? 'Each comparison throws away half the range.' : undefined })
        }
      }
      mid = undefined
      t.step(15, { vars: { left, right }, panels: panels(), note: `Empty range after ${ops} steps.`, say: 'Missing target still costs only log n.' })
    },
  },
  {
    id: 'complexity:trace:fib-naive',
    title: 'Naive recursion: 2ⁿ call tree',
    skills: ['complexity', 'dp-1d'],
    problem: 'Compute the n-th Fibonacci number with plain recursion.',
    code: fibCode,
    complexity: { time: 'O(2ⁿ)', space: 'O(n)', why: 'Two branches per call, depth n. Stack holds one root-to-leaf path.' },
    inputs: [
      { label: 'n = 4', value: { n: 4 } },
      { label: 'n = 5', value: { n: 5 } },
      { label: 'n = 6', value: { n: 6 } },
    ],
    run(input, t) {
      const { n } = input
      let ops = 0
      let counter = 0
      const frames = []
      const state = {}
      const values = {}
      const make = i => ({ id: `c${counter++}`, val: `f(${i})`, left: null, right: null })
      const root = make(n)
      let maxDepth = 0
      const panels = () => [
        { kind: 'tree', label: 'recursion tree', root: clone(root), state: { ...state }, values: { ...values } },
        { kind: 'callstack', label: 'call stack', frames: [...frames] },
        { kind: 'complexity', label: 'calls', n, ops },
      ]
      t.step(10, { vars: { n }, panels: panels(), note: 'Start the recursion.', say: 'Plain recursion first. Each call branches twice.' })
      const dfs = (i, node) => {
        ops++
        frames.push(`dfs(${i})`)
        maxDepth = Math.max(maxDepth, frames.length)
        state[node.id] = 'current'
        t.step(5, { vars: { i, calls: ops, depth: frames.length }, panels: panels(), note: `Call #${ops}: dfs(${i}).` })
        if (i <= 1) {
          values[node.id] = String(i)
          state[node.id] = 'done'
          t.step(6, { vars: { i, returns: i }, panels: panels(), note: 'Base case.' })
          frames.pop()
          return i
        }
        state[node.id] = 'visited'
        node.left = make(i - 1)
        const a = dfs(i - 1, node.left)
        state[node.id] = 'current'
        node.right = make(i - 2)
        const repeat = i - 2 >= 2
        const b = dfs(i - 2, node.right)
        values[node.id] = String(a + b)
        state[node.id] = 'done'
        t.step(8, {
          vars: { i, left: a, right: b, returns: a + b },
          panels: panels(),
          note: repeat ? `dfs(${i - 2}) was recomputed from scratch.` : `Combine ${a} + ${b}.`,
          say: repeat && i === n ? 'Notice the right subtree repeats work we already did. That duplication is why it is exponential.' : undefined,
        })
        frames.pop()
        return a + b
      }
      const answer = dfs(n, root)
      t.step(10, { vars: { n, answer, calls: ops, maxDepth }, panels: panels(), note: `${ops} calls for n=${n}. ~1.6ⁿ growth.`, say: `Time O(2^n), space O(n) since the stack is at most ${maxDepth} deep. Memoization fixes the time.` })
    },
  },
  {
    id: 'complexity:trace:fib-memo',
    title: 'Memoized recursion: O(n) calls',
    skills: ['complexity', 'dp-1d'],
    problem: 'Compute the n-th Fibonacci number with a memo dict.',
    code: memoCode,
    complexity: { time: 'O(n)', space: 'O(n)', why: 'n distinct states, each solved once; memo and stack are O(n).' },
    inputs: [
      { label: 'n = 5', value: { n: 5 } },
      { label: 'n = 6', value: { n: 6 } },
      { label: 'n = 8', value: { n: 8 } },
    ],
    run(input, t) {
      const { n } = input
      let ops = 0
      let counter = 0
      const frames = []
      const state = {}
      const values = {}
      const memo = new Map()
      const make = i => ({ id: `m${counter++}`, val: `f(${i})`, left: null, right: null })
      const root = make(n)
      let hitKey = null
      const panels = () => [
        { kind: 'tree', label: 'calls (pruned)', root: clone(root), state: { ...state }, values: { ...values } },
        { kind: 'callstack', label: 'call stack', frames: [...frames] },
        { kind: 'hashmap', label: 'memo', entries: [...memo.entries()], highlight: hitKey === null ? [] : [hitKey] },
        { kind: 'complexity', label: 'calls', n, ops },
      ]
      t.step(4, { vars: { n }, panels: panels(), note: 'Empty memo.', say: 'Same recursion, but I cache each answer so every state is solved once.' })
      t.step(15, { vars: { n }, panels: panels(), note: 'Start the recursion.' })
      const dfs = (i, node) => {
        ops++
        hitKey = null
        frames.push(`dfs(${i})`)
        state[node.id] = 'current'
        t.step(7, { vars: { i, calls: ops }, panels: panels(), note: `Call #${ops}: dfs(${i}).` })
        if (i <= 1) {
          values[node.id] = String(i)
          state[node.id] = 'done'
          t.step(8, { vars: { i, returns: i }, panels: panels(), note: 'Base case.' })
          frames.pop()
          return i
        }
        if (memo.has(i)) {
          hitKey = i
          values[node.id] = `${memo.get(i)} ✓`
          state[node.id] = 'path'
          t.step(10, { vars: { i, returns: memo.get(i) }, panels: panels(), note: 'Cache hit: no subtree!', say: i === n - 2 ? 'Cache hit, this whole subtree is skipped. Calls are now linear.' : undefined })
          frames.pop()
          hitKey = null
          return memo.get(i)
        }
        state[node.id] = 'visited'
        node.left = make(i - 1)
        const a = dfs(i - 1, node.left)
        state[node.id] = 'current'
        node.right = make(i - 2)
        const b = dfs(i - 2, node.right)
        memo.set(i, a + b)
        hitKey = i
        values[node.id] = String(a + b)
        state[node.id] = 'done'
        t.step(12, { vars: { i, value: a + b }, panels: panels(), note: `Store memo[${i}] = ${a + b}.` })
        t.step(13, { vars: { i, returns: a + b }, panels: panels(), note: 'Return cached value.' })
        hitKey = null
        frames.pop()
        return a + b
      }
      const answer = dfs(n, root)
      t.step(15, { vars: { n, answer, calls: ops }, panels: panels(), note: `${ops} calls (2n-1) vs ~1.6ⁿ.`, say: 'n states times O(1) work each: O(n) time, O(n) space for memo plus stack.' })
    },
  },
  {
    id: 'complexity:trace:bfs-v-plus-e',
    title: 'BFS: counting V + E',
    skills: ['complexity', 'graph-bfs'],
    problem: 'BFS order from node 0 in an undirected graph; count the real work.',
    code: bfsCode,
    complexity: { time: 'O(V + E)', space: 'O(V + E)', why: 'Each node dequeued once; each edge scanned twice (once per end).' },
    inputs: [
      { label: '6 nodes, 7 edges', value: { n: 6, edges: [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [4, 5], [2, 5]] } },
      { label: 'path of 5', value: { n: 5, edges: [[0, 1], [1, 2], [2, 3], [3, 4]] } },
      { label: 'star of 6', value: { n: 6, edges: [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5]] } },
    ],
    run(input, t) {
      const { n, edges } = input
      const graph = {}
      for (let i = 0; i < n; i++) graph[i] = []
      const nodes = Array.from({ length: n }, (_, k) => ({ id: String(k) }))
      const edgeList = edges.map(([a, b]) => ({ from: String(a), to: String(b) }))
      let pops = 0
      let scans = 0
      const state = {}
      const edgeState = {}
      let order = []
      let seen = new Set()
      let queue = []
      const panels = current => [
        { kind: 'graph', label: 'graph', directed: false, nodes, edges: edgeList, state: { ...state }, edgeState: { ...edgeState } },
        { kind: 'queue', label: 'queue', items: [...queue] },
        { kind: 'set', label: 'seen', items: [...seen], highlight: current === undefined ? [] : [current] },
        { kind: 'complexity', label: 'pops + edge scans', n: n + edges.length, ops: pops + scans },
        { kind: 'text', text: `V pops ${pops}/${n} · edge scans ${scans}/${2 * edges.length}` },
      ]
      t.step(6, { vars: { n, E: edges.length }, panels: panels(), note: 'Build adjacency list.', say: 'First I build an adjacency list: O(V + E) time and space.' })
      for (const [a, b] of edges) {
        graph[a].push(b)
        t.step(8, { vars: { a, b }, panels: panels(), note: `${a} → ${b}` })
        graph[b].push(a)
        t.step(9, { vars: { a, b }, panels: panels(), note: `${b} → ${a}: every edge stored twice.` })
      }
      order = []
      seen = new Set([0])
      t.step(11, { vars: { order: [...order] }, panels: panels(), note: 'Mark start seen.' })
      queue = [0]
      state['0'] = 'frontier'
      t.step(12, { vars: { queue: [...queue] }, panels: panels(), note: 'deque: O(1) popleft.', say: 'I use a deque, so popleft is O(1). A list.pop(0) would make this quadratic.' })
      let first = true
      while (queue.length) {
        t.step(14, { vars: { queue: [...queue] }, panels: panels(), note: `${queue.length} waiting.` })
        const node = queue.shift()
        pops++
        state[String(node)] = 'current'
        t.step(15, { vars: { node }, panels: panels(node), note: `Pop ${node} (pop #${pops}).` })
        order.push(node)
        t.step(16, { vars: { node, order: [...order] }, panels: panels(node), note: 'Visit it.' })
        for (const nei of graph[node]) {
          scans++
          const key = `${node}->${nei}`
          const fresh = !seen.has(nei)
          if (fresh) edgeState[key] = 'active'
          t.step(18, { vars: { node, nei, fresh }, panels: panels(node), note: fresh ? `${nei} is new.` : `${nei} already seen: O(1) set check.`, say: first ? 'Each node is popped once and each edge checked from both ends, so total work is V + 2E.' : undefined })
          first = false
          if (fresh) {
            seen.add(nei)
            t.step(19, { vars: { nei }, panels: panels(nei), note: 'Mark seen when enqueued.' })
            queue.push(nei)
            state[String(nei)] = 'frontier'
            edgeState[key] = 'tree'
            t.step(20, { vars: { queue: [...queue] }, panels: panels(nei), note: `Enqueue ${nei}.` })
          }
        }
        state[String(node)] = 'done'
      }
      t.step(22, { vars: { order: [...order], pops, scans }, panels: panels(), note: `${pops} pops + ${scans} scans = V + 2E.`, say: 'Time O(V + E), space O(V + E) for the graph plus O(V) for queue and seen.' })
    },
  },
]

const flashcardData = [
  [C, 'What does Big-O describe?', 'How work grows as input size n grows. Drop constants and lower-order terms.'],
  [C, 'Two nested loops over n?', 'O(n²). Even if j starts at i+1, it is n(n-1)/2, still quadratic.'],
  [C, 'Loop over nums, then a separate loop over other?', 'O(n + m). Sequential loops add, nested loops multiply.'],
  [C, 'Loop where i doubles (i *= 2) up to n?', 'O(log n): number of doublings to reach n is log₂ n.'],
  [C, 'Recursion with b branches and depth d?', 'About O(bᵈ) calls. Fibonacci: 2 branches, depth n → O(2ⁿ).'],
  [C, 'Memoized recursion time formula?', 'Number of distinct states × work per state.'],
  [C, 'Why is appending to a Python list O(1)?', 'Amortized: capacity grows geometrically, so total copying over n appends is O(n).'],
  [C, 'Monotonic stack with inner while loop: time?', 'O(n) amortized. Each index is pushed once and popped at most once.'],
  [C, 'Sliding window where left and right only move forward?', 'O(n). Each pointer travels at most n steps in total.'],
  [C, 'Merge sort time and space?', 'O(n log n) time: log n levels × n work. O(n) extra space for merging.'],
  [C, 'Python sorted() / list.sort() cost?', 'O(n log n) time (Timsort). sorted() also makes an O(n) copy.'],
  [C, 'Binary search time?', 'O(log n). The range halves every iteration.'],
  [C, 'Binary search on the answer, n items, values up to V?', 'O(n log V). log V iterations, each an O(n) feasibility check.'],
  [C, 'Recursive DFS space on a tree of height h?', 'O(h) stack. Balanced: O(log n). Skewed: O(n).'],
  [C, 'BFS queue space on a full binary tree?', 'O(n). The last level holds about n/2 nodes at once.'],
  [C, 'Does output count toward space?', 'Usually stated separately. Say "O(1) extra, excluding the output list."'],
  [C, 'Graph BFS/DFS time with adjacency list?', 'O(V + E). Each node processed once, each edge scanned once or twice.'],
  [C, 'Grid DFS/BFS time on r×c grid?', 'O(r·c). Each cell visited once, 4 neighbors each.'],
  [C, 'Dijkstra with a binary heap?', 'O((V + E) log V) time, O(V + E) space.'],
  [C, 'Generate all subsets of n items?', 'O(n · 2ⁿ): 2ⁿ subsets, up to n to copy each.'],
  [C, 'Generate all permutations of n items?', 'O(n · n!). n! orderings, n to copy each.'],
  [C, 'Group anagrams by sorted key: w words, length L?', 'O(w · L log L). Counting key instead: O(w · L).'],
  [C, 'Trie insert/search for word of length L?', 'O(L) time per word. Space O(total characters).'],
  [C, 'Harmonic loop: for i in 1..n, for j in range(0, n, i)?', 'n/1 + n/2 + ... + n/n = O(n log n).'],
  [C, 'Space of 2D DP table m×n with rolling rows?', 'O(n): only the previous row is needed.'],
  [C, 'Sum of 1 + 2 + ... + n operations?', 'n(n+1)/2 → O(n²).'],
  [K, 'Ops budget per second for interview estimates?', 'About 10⁸ simple operations per second.'],
  [K, 'n ≤ 10 suggests?', 'O(n!) or O(2ⁿ·n): permutations / brute force are fine.'],
  [K, 'n ≤ 20 suggests?', 'O(2ⁿ) or O(2ⁿ·n): subsets, bitmask DP, backtracking.'],
  [K, 'n ≤ 100 suggests?', 'O(n³) is fine (10⁶). Floyd-Warshall, cubic DP.'],
  [K, 'n ≤ 1000–3000 suggests?', 'O(n²): pairwise DP or nested loops.'],
  [K, 'n ≤ 10⁵ suggests?', 'O(n log n) or O(n). Sorting, heap, hashmap, two pointers.'],
  [K, 'n ≤ 10⁶ suggests?', 'O(n), maybe O(n log n) if tight. Single pass, hashing, prefix sums.'],
  [K, 'n or values up to 10⁹ suggests?', 'O(log n) or O(√n): binary search, math. Never loop to 10⁹.'],
  [K, 'V, E ≤ 10⁵ in a graph problem?', 'O(V + E) traversal, or O((V+E) log V) with a heap.'],
  [K, 'n ≤ 40 and need subsets?', 'Meet in the middle: 2 × 2²⁰ instead of 2⁴⁰.'],
  [K, 'Interviewer gives no constraints. What do you do?', 'Ask: "How large can n get?" Then state the target complexity before coding.'],
  [K, 'q queries of range sums on an array of n?', 'Prefix sums: O(n) build, O(1) per query → O(n + q).'],
  [D, 'list.pop(0) vs deque.popleft()?', 'list.pop(0) is O(n) (shifts everything). deque.popleft() is O(1).', 'queue = deque([start])\nnode = queue.popleft()'],
  [D, 'x in list vs x in set?', 'List: O(n) scan. Set: O(1) average via hashing.'],
  [D, 'Cost of s += c in a loop building a string?', 'Up to O(n²): strings are immutable. Collect parts in a list, then "".join(parts).'],
  [D, 'Cost of nums[a:b]?', 'O(b - a) time and space: slicing copies.'],
  [D, 'heappush / heappop / heap[0]?', 'O(log n) / O(log n) / O(1).'],
  [D, 'heapify(list) cost?', 'O(n), faster than n pushes at O(n log n).'],
  [D, 'Need repeated min or max with inserts?', 'Heap. Python heapq is a min-heap; push -x for max.'],
  [D, 'Need FIFO order, e.g. BFS?', 'collections.deque: append + popleft both O(1).'],
  [D, 'Need to count occurrences?', 'Counter(nums): O(n) build, O(1) lookup.'],
  [D, 'Use a list as a dict key?', 'Not allowed: lists are unhashable. Convert to tuple(lst).'],
  [D, 'bisect.insort into a sorted list?', 'O(log n) to find spot, O(n) to shift → O(n) insert.'],
  [D, 'list.remove(x) or list.index(x)?', 'O(n): linear scan. dict/set delete is O(1) average.'],
  [D, 'Need prefix lookups over many words?', 'Trie: O(L) per insert or prefix query.'],
  [D, 'Need nearest greater/smaller element?', 'Monotonic stack: O(n) total.'],
]

const flashcards = flashcardData.map(([skills, front, back, code], k) => ({
  id: `complexity:card:${k + 1}`, skills, front, back, ...(code ? { code } : {}),
}))

const mcqData = [
  [K, 1, '1 ≤ n ≤ 10⁵. You must find whether any two numbers sum to target. Which approach fits?', null, ['Hash set in one pass, O(n)', 'Check all pairs, O(n²)', 'Try all subsets, O(2ⁿ)', 'Triple loop, O(n³)'], 'n² = 10¹⁰ ops, far over 10⁸/sec. One pass with a set is 10⁵.'],
  [K, 1, '1 ≤ n ≤ 20. Return all subsets with sum k. Target complexity?', null, ['O(2ⁿ · n) is fine', 'Must be O(n log n)', 'Must be O(n)', 'O(n!) is required'], '2²⁰ ≈ 10⁶, times 20 still ~2·10⁷. Tiny n invites exponential search.'],
  [K, 1, '1 ≤ n ≤ 8. Return every ordering of the array. What fits?', null, ['Backtracking, O(n · n!)', 'Sorting, O(n log n)', 'Binary search, O(log n)', 'Two pointers, O(n)'], '8! = 40320. The output itself is n!, so you cannot beat that.'],
  [K, 2, 'n ≤ 500. Slowest complexity likely to still pass?', null, ['O(n³)', 'O(n⁴)', 'O(2ⁿ)', 'O(n!)'], '500³ ≈ 1.25·10⁸: borderline, risky in Python. Aim for O(n²). n⁴ = 6·10¹⁰ is far too slow.'],
  [K, 2, 'n ≤ 10⁵ piles, each up to 10⁹. Find the minimum speed to finish in h hours. Approach?', null, ['Binary search on speed, O(n log V)', 'Try every speed 1..10⁹, O(n·V)', 'Sort piles, O(n log n) only', 'DP over hours, O(n·h)'], 'Feasibility is monotonic in speed. ~30 halvings × n checks.'],
  [K, 2, 'n ≤ 10⁶. Count subarrays with sum k. Which fits?', null, ['Prefix sum + hashmap, O(n)', 'All subarrays, O(n²)', 'All subarrays with sum loop, O(n³)', 'Sort then binary search, O(n log n) (breaks order)'], 'n² = 10¹². Prefix sums turn "sum of range" into one hashmap lookup per index.'],
  [K, 2, 'Grid is 300×300. You plan to BFS from every land cell. Feasible?', null, ['No: (9·10⁴)² ≈ 8·10⁹ ops', 'Yes: 9·10⁴ ops', 'Yes: O(r + c)', 'No: it is O(2ⁿ)'], 'Each BFS is O(r·c); doing it r·c times squares it. Use multi-source BFS: one pass.'],
  [K, 1, 'V, E ≤ 10⁵, unweighted. Fewest edges from s to t?', null, ['BFS, O(V + E)', 'Floyd-Warshall, O(V³)', 'DFS over all paths, exponential', 'Bellman-Ford, O(V·E)'], 'Unweighted shortest path is BFS. V³ = 10¹⁵.'],
  [K, 2, 'V, E ≤ 10⁵, positive weights. Cheapest path from s?', null, ['Dijkstra with heap, O((V+E) log V)', 'BFS, O(V + E)', 'Floyd-Warshall, O(V³)', 'Bellman-Ford, O(V·E)'], 'Weights break plain BFS. V·E = 10¹⁰ too slow.'],
  [K, 2, 'n, q ≤ 10⁵. Each query asks sum of nums[l..r]. Best?', null, ['Prefix sums, O(n + q)', 'Loop each query, O(n·q)', 'Sort per query, O(q·n log n)', 'Heap per query, O(q log n)'], 'Naive is 10¹⁰. prefix[r+1] - prefix[l] is O(1) per query.'],
  [K, 1, 'n ≤ 2000. An O(n²) DP is your idea. Verdict?', null, ['Fine: 4·10⁶ ops', 'Too slow: 10¹⁰ ops', 'Only O(n) passes', 'Need O(log n)'], 'Plug in: 2000² = 4·10⁶, well under 10⁸.'],
  [K, 2, 'n ≤ 10⁵, return the k most frequent. Which is NOT good enough?', null, ['Sort pairs by every count for each k query, O(k · n log n)', 'Counter + heap of size k, O(n log k)', 'Counter + buckets, O(n)', 'Counter + sort, O(n log n)'], 'Re-sorting per query multiplies; the others are near-linear.'],
  [K, 3, 'n ≤ 40, pick a subset hitting exact sum. Approach?', null, ['Meet in the middle, O(2^(n/2) · n)', 'Plain subsets, O(2ⁿ)', 'Greedy by size', 'Permutations, O(n!)'], '2⁴⁰ ≈ 10¹². Split in halves: 2·2²⁰, then sort + match.'],
  [K, 2, 'n up to 10¹⁸. Compute something about n. Target?', null, ['O(log n)', 'O(n)', 'O(√n) always fine', 'O(n log n)'], 'Even √(10¹⁸) = 10⁹ is too slow. Halving / fast power is ~60 steps.'],
  [K, 2, 'String length ≤ 1000. Longest palindromic substring. Which fits best?', null, ['Expand around centers, O(n²)', 'Check every substring naively, O(n³)', 'All subsequences, O(2ⁿ)', 'It needs O(log n)'], 'n² = 10⁶ is easy. n³ = 10⁹ is too slow.'],
  [K, 1, 'Interviewer gives no constraints. Best first move?', null, ['Ask how big n can be, then state a target complexity', 'Start coding brute force silently', 'Assume n ≤ 10', 'Always aim for O(1)'], 'Constraints pick the algorithm. Asking shows you think about scale.'],
  [K, 2, 'Sorted array, n ≤ 10⁶, many queries "how many equal x?". Per query?', null, ['Two bisects, O(log n)', 'Count with loop, O(n)', 'Build Counter each query, O(n)', 'Sort each query, O(n log n)'], 'bisect_right - bisect_left gives the count in O(log n).'],
  [K, 2, '10⁵ inserts mixed with "current median?" queries. Approach?', null, ['Two heaps, O(log n) insert, O(1) median', 'Sort after every insert, O(n log n) each', 'Scan list each query, O(n)', 'Stack of values'], 'Max-heap low half + min-heap high half keeps the middle on top.'],
  [K, 3, 'n ≤ 15 cities, shortest tour visiting all. Fits?', null, ['Bitmask DP, O(2ⁿ · n²)', 'Brute permutations, O(n!)', 'Plain BFS, O(V + E)', 'Greedy nearest neighbor'], '2¹⁵·225 ≈ 7·10⁶. 15! ≈ 1.3·10¹² is too slow; greedy is wrong.'],
  [K, 2, 'Words list total length ≤ 10⁵, many prefix queries. DS?', null, ['Trie, O(L) per query', 'Scan all words per query', 'Sorted list + linear scan', 'Stack'], 'Trie walks only the prefix length per query.'],
  [C, 1, 'Time complexity?', `for i in range(n):
    for j in range(i, n):
        total += 1`, ['O(n²)', 'O(n log n)', 'O(n)', 'O(n³)'], 'Inner runs n, n-1, ..., 1 times: n(n+1)/2 → O(n²).'],
  [C, 1, 'Time complexity?', `i = 1
while i < n:
    i *= 2`, ['O(log n)', 'O(n)', 'O(√n)', 'O(n log n)'], 'i doubles: reaches n after log₂ n steps.'],
  [C, 2, 'Time complexity?', `right = 0
for left in range(n):
    while right < n and ok(left, right):
        right += 1`, ['O(n)', 'O(n²)', 'O(n log n)', 'O(log n)'], 'right never resets; it moves at most n times total across all lefts.'],
  [C, 3, 'Time complexity?', `for i in range(1, n + 1):
    for j in range(0, n, i):
        work()`, ['O(n log n)', 'O(n²)', 'O(n)', 'O(n√n)'], 'n/1 + n/2 + ... + n/n = n·H(n) ≈ n ln n.'],
  [C, 1, 'Time complexity?', `nums.sort()
for num in nums:
    total += num`, ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'], 'Sort dominates: n log n + n → n log n.'],
  [C, 2, 'Time complexity (assume no interpreter tricks)?', `result = ""
for c in s:
    result += c`, ['O(n²)', 'O(n)', 'O(n log n)', 'O(1)'], 'Strings are immutable; each += may copy. Use "".join(parts) for O(n).'],
  [C, 1, 'Time complexity? (lst has m items)', `count = 0
for x in nums:
    if x in lst:
        count += 1`, ['O(n · m)', 'O(n + m)', 'O(n)', 'O(m)'], '"in list" scans m items each time. set(lst) makes it O(n + m).'],
  [C, 2, 'Time complexity?', `def f(n):
    if n == 0:
        return 1
    return f(n - 1) + f(n - 1)`, ['O(2ⁿ)', 'O(n)', 'O(n²)', 'O(log n)'], 'Two calls per level, depth n: 2ⁿ calls.'],
  [C, 2, 'Time complexity?', `def solve(nums):
    if len(nums) <= 1:
        return nums
    mid = len(nums) // 2
    left = solve(nums[:mid])
    right = solve(nums[mid:])
    return merge(left, right)`, ['O(n log n)', 'O(n²)', 'O(log n)', 'O(2ⁿ)'], 'log n levels, O(n) slicing + merging per level.'],
  [C, 1, 'Time complexity?', `for target in queries:
    i = bisect_left(nums, target)`, ['O(q log n)', 'O(q · n)', 'O(q + n)', 'O(log n)'], 'q queries × O(log n) binary search each.'],
  [C, 2, 'Time complexity?', `for i in range(len(nums)):
    while stack and nums[stack[-1]] < nums[i]:
        stack.pop()
    stack.append(i)`, ['O(n)', 'O(n²)', 'O(n log n)', 'O(log n)'], 'Each index pushed once and popped at most once: 2n total.'],
  [C, 2, 'Time complexity of this BFS on V nodes, E edges?', `queue = [start]
while queue:
    node = queue.pop(0)
    for nei in graph[node]:
        if nei not in seen:
            seen.add(nei)
            queue.append(nei)`, ['O(V² + E)', 'O(V + E)', 'O(V log V)', 'O(E log V)'], 'list.pop(0) shifts the list: O(V) per pop. deque.popleft fixes it.'],
  [C, 1, 'Time complexity?', `@cache
def dfs(i):
    if i <= 1:
        return i
    return dfs(i - 1) + dfs(i - 2)`, ['O(n)', 'O(2ⁿ)', 'O(n²)', 'O(log n)'], 'n distinct states, O(1) work each with cache.'],
  [C, 1, 'Grid DFS marking visited cells. Time on r×c grid?', `def dfs(r, c):
    if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] == "0":
        return
    grid[r][c] = "0"
    dfs(r + 1, c)
    dfs(r - 1, c)
    dfs(r, c + 1)
    dfs(r, c - 1)`, ['O(r · c)', 'O(4^(r·c))', 'O((r·c)²)', 'O(r + c)'], 'Each cell flips to "0" once; the 4 calls per cell are constant work.'],
  [C, 2, 'Time complexity?', `def backtrack(i, path):
    if i == len(nums):
        result.append(path[:])
        return
    path.append(nums[i])
    backtrack(i + 1, path)
    path.pop()
    backtrack(i + 1, path)`, ['O(n · 2ⁿ)', 'O(2ⁿ)', 'O(n²)', 'O(n!)'], '2ⁿ leaves, each copies a path of up to n.'],
  [C, 2, 'Time complexity?', `heap = []
for num in nums:
    heapq.heappush(heap, num)
for _ in range(k):
    heapq.heappop(heap)`, ['O(n log n + k log n)', 'O(n + k)', 'O(k log n)', 'O(n²)'], 'n pushes at log n, then k pops at log n. heapify would make the first part O(n).'],
  [C, 1, 'Time complexity?', `for a in nums:
    total += a
for b in other:
    total += b`, ['O(n + m)', 'O(n · m)', 'O(max(n, m)²)', 'O(n log m)'], 'Sequential loops add.'],
  [C, 2, 'Group anagrams: w words, max length L. Time?', `groups = dd(list)
for word in words:
    groups[''.join(sorted(word))].append(word)`, ['O(w · L log L)', 'O(w · L)', 'O(w log w)', 'O(w² · L)'], 'Each word sorted: L log L. Counting 26 letters would make it O(w·L).'],
  [C, 2, 'Sliding window with a dict. Time?', `left = 0
for right in range(len(s)):
    count[s[right]] += 1
    while count[s[right]] > 1:
        count[s[left]] -= 1
        left += 1`, ['O(n)', 'O(n²)', 'O(n log n)', 'O(26n²)'], 'left and right each move forward at most n times.'],
  [C, 3, 'Time and space?', `def total(nums):
    if not nums:
        return 0
    return nums[0] + total(nums[1:])`, ['O(n²) time, O(n²) space', 'O(n) time, O(n) space', 'O(n) time, O(1) space', 'O(n log n) time, O(n) space'], 'Each slice copies up to n, and all slices live on the stack at once.'],
  [C, 2, 'Time complexity?', `for i in range(n):
    ordered = sorted(nums)
    check(ordered, i)`, ['O(n² log n)', 'O(n log n)', 'O(n²)', 'O(n)'], 'Sorting inside the loop repeats n log n work n times. Hoist it out.'],
  [C, 2, 'Dijkstra with heapq on V nodes, E edges. Time?', null, ['O((V + E) log V)', 'O(V + E)', 'O(V²·E)', 'O(E²)'], 'Each edge can push once: E pushes/pops at log cost.'],
  [C, 1, 'Time complexity?', `for i in range(n):
    for j in range(m):
        for k in range(10):
            work()`, ['O(n · m)', 'O(n · m · k) with k growing', 'O(n + m)', 'O(10ⁿ)'], 'The inner 10 is a constant. Drop it.'],
  [C, 2, 'Time complexity?', `while n > 0:
    digit = n % 10
    n //= 10`, ['O(log n)', 'O(n)', 'O(1)', 'O(√n)'], 'Number of digits is log₁₀ n.'],
  [C, 3, 'Time complexity?', `i = 2
while i * i <= n:
    if n % i == 0:
        return False
    i += 1`, ['O(√n)', 'O(n)', 'O(log n)', 'O(n log n)'], 'Loop stops once i exceeds √n.'],
  [C, 1, 'Recursive DFS on a balanced binary tree with n nodes. Space?', null, ['O(log n)', 'O(n)', 'O(1)', 'O(n log n)'], 'Stack depth = height = log n for balanced trees.'],
  [C, 2, 'Recursive DFS on a tree that is a straight line (skewed). Space?', null, ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], 'Height is n, so n frames stack up. Mention this edge case.'],
  [C, 2, 'Level-order BFS on a complete binary tree. Space?', null, ['O(n)', 'O(log n)', 'O(1)', 'O(h²)'], 'Bottom level holds ~n/2 nodes in the queue at once.'],
  [C, 2, 'Space of this DP?', `prev, curr = 0, 1
for _ in range(n):
    prev, curr = curr, prev + curr`, ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], 'Only two variables live at any time.'],
  [C, 2, 'Subsets via backtracking. Extra space excluding the output?', null, ['O(n)', 'O(2ⁿ)', 'O(n · 2ⁿ)', 'O(1)'], 'Recursion depth n plus a path of length n.'],
  [C, 2, 'Memoized grid DP dfs(r, c) on m×n grid. Space?', null, ['O(m · n)', 'O(m + n)', 'O(1)', 'O(2^(m+n))'], 'Cache holds m·n states; stack depth m+n is smaller.'],
  [D, 1, 'Cost of nums.pop(0) on a list of n?', null, ['O(n)', 'O(1)', 'O(log n)', 'O(1) amortized'], 'Every remaining element shifts left. Use deque.popleft().'],
  [D, 1, 'Average cost of x in some_set?', null, ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'], 'Hash lookup. Worst case O(n) with collisions, rarely matters.'],
  [D, 2, 'Building a heap from n existing numbers. Fastest?', null, ['heapify(nums), O(n)', 'n heappush calls, O(n log n)', 'sorted(nums), O(n log n)', 'insort each, O(n²)'], 'Bottom-up heapify is linear.'],
  [D, 1, 'You need "have I seen this before?" in O(1). Use?', null, ['set', 'list', 'stack', 'sorted list'], 'Hash set membership is O(1) average.'],
  [D, 1, 'Match brackets, most recent open first. DS?', null, ['Stack', 'Queue', 'Heap', 'Set'], 'Last opened must close first: LIFO.'],
  [D, 2, 'Repeatedly take the smallest item while new items arrive. DS?', null, ['Min-heap', 'Sorted list re-sorted each time', 'Stack', 'deque'], 'heappush/heappop are O(log n). Re-sorting is O(n log n) each time.'],
  [D, 2, 'Key a dict by a pair of coordinates. Which works?', `seen = {}
key = ???`, ['(r, c)', '[r, c]', '{r, c}', 'dict(r=r, c=c)'], 'Tuples are hashable; lists, sets, dicts are not.'],
  [D, 2, 'Cost of lst.insert(0, x) vs deque.appendleft(x)?', null, ['O(n) vs O(1)', 'O(1) vs O(1)', 'O(log n) vs O(1)', 'O(1) vs O(n)'], 'List shifts every element; deque is a linked block structure.'],
  [D, 2, 'bisect.insort(sorted_list, x) cost?', null, ['O(n): log n search, n shift', 'O(log n)', 'O(1)', 'O(n log n)'], 'Finding the spot is fast, inserting into a list still shifts.'],
  [D, 1, 'Cost of nums[i:j]?', null, ['O(j - i)', 'O(1)', 'O(log n)', 'O(n²)'], 'Slicing creates a new list of j-i items.'],
  [D, 2, 'Sliding window max over n items, window k. Best DS?', null, ['Monotonic deque, O(n)', 'Heap only, O(n log n) with stale entries', 'Re-scan each window, O(n·k)', 'Set, O(n)'], 'Deque keeps decreasing candidates; front is the max. Each index in/out once.'],
  [D, 2, 'list.append(x) is O(1) amortized. What does that mean?', null, ['Occasional O(n) resize, but n appends total O(n)', 'Every append is exactly O(1)', 'It is O(log n) on average', 'It is O(n) but feels fast'], 'Geometric growth spreads the copy cost over many appends.'],
]

const slots = [1, 3, 0, 2, 2, 0, 3, 1]
const mcqs = mcqData.map(([skills, difficulty, q, code, choices, why], k) => ({
  id: `complexity:mcq:${k + 1}`,
  skills,
  difficulty,
  q,
  ...(code ? { code } : {}),
  ...placeAnswer(choices, slots[k % slots.length]),
  why,
}))

const clozes = [
  {
    id: 'complexity:cloze:1', skills: CD, title: 'O(1) BFS queue',
    code: `queue = [[deque]]([start])
seen = {start}

while queue:
    node = queue.[[popleft]]()
    for nei in graph[node]:
        if nei not in [[seen]]:
            seen.add(nei)
            queue.append(nei)`,
    hint: 'Which container pops from the front in O(1)?',
  },
  {
    id: 'complexity:cloze:2', skills: ['complexity', 'binary-search'], title: 'O(log n) binary search',
    code: `left, right = 0, len(nums) - 1

while left [[<=]] right:
    mid = ((right - left) // [[2]]) + left
    if nums[mid] == target:
        return mid
    elif nums[mid] > target:
        right = [[mid - 1]]
    else:
        left = [[mid + 1]]`,
  },
  {
    id: 'complexity:cloze:3', skills: CD, title: 'Top k in O(n + k log n)',
    code: `heap = [-num for num in nums]
heapq.[[heapify]](heap)

result = []
for _ in range(k):
    result.append(-heapq.[[heappop]](heap))`,
    hint: 'Build the heap in linear time.',
  },
  {
    id: 'complexity:cloze:4', skills: ['complexity', 'dp-1d'], title: '2ⁿ → n with a cache',
    code: `from functools import [[cache]]

@cache
def dfs(i):
    if i <= 1:
        return [[i]]
    return dfs(i - 1) + dfs([[i - 2]])`,
  },
  {
    id: 'complexity:cloze:5', skills: ['complexity', 'monotonic-stack'], title: 'Amortized O(n) monotonic stack',
    code: `result = [0] * len(temperatures)
stack = []

for i in range(len(temperatures)):
    while [[stack]] and temperatures[i] > temperatures[stack[-1]]:
        index = stack.[[pop]]()
        result[index] = [[i - index]]
    stack.append(i)`,
  },
  {
    id: 'complexity:cloze:6', skills: ['constraints', 'prefix-sum'], title: 'O(n + q) range sums',
    code: `prefix = [0] * (len(nums) + [[1]])
for i in range(len(nums)):
    prefix[i + 1] = prefix[i] [[+]] nums[i]

for l, r in queries:
    result.append(prefix[r + 1] [[-]] prefix[l])`,
  },
  {
    id: 'complexity:cloze:7', skills: ['complexity', 'sliding-window'], title: 'O(n) window, pointers never go back',
    code: `seen = set()
left, best = 0, 0

for right in range(len(s)):
    while s[right] in [[seen]]:
        seen.[[remove]](s[left])
        left += 1
    seen.add(s[right])
    best = max(best, right - [[left]] + 1)`,
  },
  {
    id: 'complexity:cloze:8', skills: CD, title: 'O(n) string building',
    code: `parts = []
for word in words:
    parts.[[append]](word.upper())

result = "".[[join]](parts)`,
    hint: 'Avoid result += word in a loop.',
  },
  {
    id: 'complexity:cloze:9', skills: CD, title: 'O(n) duplicate check',
    code: `duplicates = [[set()]]

for num in nums:
    if num [[in]] duplicates:
        return True
    duplicates.[[add]](num)

return False`,
  },
  {
    id: 'complexity:cloze:10', skills: ['constraints', 'binary-search'], title: 'Binary search on answer, O(n log V)',
    code: `left, right = 1, [[max(piles)]]

while left < right:
    mid = ((right - left) // 2) + left
    hours = sum((pile + mid - 1) // mid for pile in piles)
    if hours <= h:
        right = [[mid]]
    else:
        left = [[mid + 1]]

return left`,
  },
]

const parsons = [
  {
    id: 'complexity:parsons:1', skills: ['complexity', 'binary-search'], title: 'Binary search, O(log n)',
    lines: [
      'left, right = 0, len(nums) - 1',
      'while left <= right:',
      '    mid = ((right - left) // 2) + left',
      '    if nums[mid] == target:',
      '        return mid',
      '    elif nums[mid] > target:',
      '        right = mid - 1',
      '    else:',
      '        left = mid + 1',
      'return -1',
    ],
    distractors: ['    right = mid + 1', 'while left < len(nums):'],
  },
  {
    id: 'complexity:parsons:2', skills: CD, title: 'BFS with O(1) pops',
    lines: [
      'queue = deque([start])',
      'seen = {start}',
      'while queue:',
      '    node = queue.popleft()',
      '    for nei in graph[node]:',
      '        if nei not in seen:',
      '            seen.add(nei)',
      '            queue.append(nei)',
    ],
    distractors: ['    node = queue.pop(0)', 'seen = []'],
  },
  {
    id: 'complexity:parsons:3', skills: ['complexity', 'dp-1d'], title: 'Memoized recursion, O(n)',
    lines: [
      'memo = {}',
      'def dfs(i):',
      '    if i <= 1:',
      '        return i',
      '    if i in memo:',
      '        return memo[i]',
      '    memo[i] = dfs(i - 1) + dfs(i - 2)',
      '    return memo[i]',
      'return dfs(n)',
    ],
    distractors: ['    return dfs(i - 1) + dfs(i - 2)'],
  },
  {
    id: 'complexity:parsons:4', skills: ['complexity', 'heap'], title: 'k largest with a size-k heap, O(n log k)',
    lines: [
      'heap = []',
      'for num in nums:',
      '    heapq.heappush(heap, num)',
      '    if len(heap) > k:',
      '        heapq.heappop(heap)',
      'return heap[0]',
    ],
    distractors: ['    nums.sort()', 'return heap[-1]'],
  },
  {
    id: 'complexity:parsons:5', skills: ['constraints', 'prefix-sum'], title: 'Prefix sums for q queries, O(n + q)',
    lines: [
      'prefix = [0] * (len(nums) + 1)',
      'for i in range(len(nums)):',
      '    prefix[i + 1] = prefix[i] + nums[i]',
      'result = []',
      'for left, right in queries:',
      '    result.append(prefix[right + 1] - prefix[left])',
      'return result',
    ],
    distractors: ['    result.append(sum(nums[left:right + 1]))'],
  },
]

const problems = [
  {
    id: 'complexity:problem:217', lc: 217, title: 'Contains Duplicate', difficulty: 'Easy', google: false,
    skills: ['complexity', 'ds-diagnosis', 'arrays-hashing'], pattern: 'Hash set', ds: ['set'],
    constraints: '1 ≤ n ≤ 10^5, -10^9 ≤ nums[i] ≤ 10^9', time: 'O(n)', space: 'O(n)',
    insight: 'n² pairs is 10¹⁰. A set answers "seen before?" in O(1).',
    signals: ['any value appears twice', 'n up to 10^5'],
    narration: ['Brute force checks all pairs: O(n²), too slow for 10^5.', 'Sorting gives O(n log n) with O(1) extra.', 'A set gives O(n) time, O(n) space.', 'I will scan once and return on the first repeat.'],
    solution: `class Solution:
    def hasDuplicate(self, nums: List[int]) -> bool:

        duplicates = set()

        for num in nums:
            if num in duplicates:
                return True
            duplicates.add(num)

        return False`,
    pitfalls: ['Using a list for seen makes it O(n²)'],
  },
  {
    id: 'complexity:problem:704', lc: 704, title: 'Binary Search', difficulty: 'Easy', google: false,
    skills: ['complexity', 'binary-search'], pattern: 'Binary search', ds: ['array'],
    constraints: '1 ≤ n ≤ 10^4, sorted, distinct', time: 'O(log n)', space: 'O(1)',
    insight: 'Sorted + "find" means halve the range each step.',
    signals: ['sorted', 'O(log n) required'],
    narration: ['Input is sorted, so binary search.', 'Inclusive bounds, loop while left <= right.', 'Each step drops half: O(log n), O(1) space.'],
    solution: binarySearchCode,
    traceId: 'complexity:trace:binary-search',
    pitfalls: ['left < right with right = mid - 1 misses the last element', 'Single element array'],
  },
  {
    id: 'complexity:problem:509', lc: 509, title: 'Fibonacci Number', difficulty: 'Easy', google: false,
    skills: ['complexity', 'dp-1d'], pattern: 'Memoization', ds: ['hashmap'],
    constraints: '0 ≤ n ≤ 30', time: 'O(n)', space: 'O(n)',
    insight: 'Plain recursion is 2ⁿ; caching n states makes it linear.',
    signals: ['f(n) defined by f(n-1), f(n-2)'],
    narration: ['Recurrence: f(n) = f(n-1) + f(n-2).', 'Naive recursion is O(2^n): subproblems repeat.', 'Memo makes it O(n) time and space.', 'Could roll two variables for O(1) space.'],
    solution: memoCode,
    traceId: 'complexity:trace:fib-memo',
  },
  {
    id: 'complexity:problem:875', lc: 875, title: 'Koko Eating Bananas', difficulty: 'Medium', google: true,
    skills: ['constraints', 'binary-search', 'complexity'], pattern: 'Binary search on answer', ds: ['array'],
    constraints: '1 ≤ n ≤ 10^4, n ≤ h ≤ 10^9, 1 ≤ piles[i] ≤ 10^9', time: 'O(n log max(piles))', space: 'O(1)',
    insight: 'Speeds up to 10⁹ but feasibility is monotonic: binary search the speed.',
    signals: ['minimum value such that', 'values up to 10^9', 'monotonic condition'],
    narration: ['Trying every speed is 10^9 × n: impossible.', 'If speed k works, any faster works: monotonic.', 'Binary search speed in [1, max(piles)].', 'Each check is O(n), about 30 checks: O(n log V).'],
    solution: `class Solution:
    def minEatingSpeed(self, piles: List[int], h: int) -> int:

        left, right = 1, max(piles)

        while left < right:
            mid = ((right - left) // 2) + left
            hours = 0
            for pile in piles:
                hours += (pile + mid - 1) // mid

            if hours <= h:
                right = mid
            else:
                left = mid + 1

        return left`,
    pitfalls: ['Use ceiling division', 'right = mid (not mid - 1) when mid is feasible'],
  },
  {
    id: 'complexity:problem:78', lc: 78, title: 'Subsets', difficulty: 'Medium', google: true,
    skills: ['constraints', 'backtracking', 'complexity'], pattern: 'Backtracking', ds: ['array'],
    constraints: '1 ≤ n ≤ 10', time: 'O(n · 2^n)', space: 'O(n) extra',
    insight: 'n ≤ 10 says exponential is expected: output itself is 2ⁿ.',
    signals: ['all subsets', 'n ≤ 10'],
    narration: ['Output has 2^n subsets, so 2^n is a lower bound.', 'Each index: include or skip.', 'Copy path at leaves: O(n · 2^n) time.', 'Extra space O(n) for path and stack.'],
    solution: `class Solution:
    def subsets(self, nums: List[int]) -> List[List[int]]:

        result, path = [], []

        def dfs(i):
            if i == len(nums):
                result.append(path[:])
                return

            path.append(nums[i])
            dfs(i + 1)
            path.pop()
            dfs(i + 1)

        dfs(0)
        return result`,
    pitfalls: ['Append path[:] not path'],
  },
  {
    id: 'complexity:problem:347', lc: 347, title: 'Top K Frequent Elements', difficulty: 'Medium', google: true,
    skills: ['ds-diagnosis', 'complexity', 'heap'], pattern: 'Bucket sort', ds: ['hashmap', 'array'],
    constraints: '1 ≤ n ≤ 10^5, k ≤ distinct values', time: 'O(n)', space: 'O(n)',
    insight: 'Frequency ≤ n, so bucket by count instead of sorting.',
    signals: ['k most frequent', 'better than O(n log n)'],
    narration: ['Count with Counter: O(n).', 'Sorting counts is O(n log n); heap of size k is O(n log k).', 'Counts are at most n, so buckets give O(n).', 'Walk buckets from high to low until k found.'],
    solution: `from collections import Counter

class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:

        counted = Counter(nums)

        buckets = [[] for _ in range(len(nums) + 1)]
        for digit, freq in counted.items():
            buckets[freq].append(digit)

        answers = []

        for i in range(len(buckets) - 1, 0, -1):
            for num in buckets[i]:
                answers.append(num)
                if len(answers) == k:
                    return answers

        return answers`,
  },
  {
    id: 'complexity:problem:239', lc: 239, title: 'Sliding Window Maximum', difficulty: 'Hard', google: true,
    skills: ['complexity', 'queue-deque', 'monotonic-stack'], pattern: 'Monotonic deque', ds: ['deque'],
    constraints: '1 ≤ n ≤ 10^5, 1 ≤ k ≤ n', time: 'O(n)', space: 'O(k)',
    insight: 'Keep a decreasing deque of indices; each index enters and leaves once.',
    signals: ['max of every window', 'n up to 10^5 (n·k too slow)'],
    narration: ['Rescanning each window is O(n·k), up to 10^10.', 'Deque holds indices with decreasing values.', 'Front is the window max; drop it when it slides out.', 'Each index pushed and popped once: O(n) amortized.'],
    solution: `from collections import deque

class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:

        answer = []
        holding = deque()

        for i in range(len(nums)):
            while holding and nums[holding[-1]] < nums[i]:
                holding.pop()
            holding.append(i)

            if holding[0] <= i - k:
                holding.popleft()

            if i >= k - 1:
                answer.append(nums[holding[0]])

        return answer`,
    pitfalls: ['Store indices, not values, so you know when the front expires'],
  },
]

const mulberry = seed => {
  let a = (seed >>> 0) + 0x9e3779b9
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let x = a
    x = Math.imul(x ^ (x >>> 15), x | 1)
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}
const pick = (rand, list) => list[Math.floor(rand() * list.length)]
const shuffleAnswer = (rand, correct, wrong) => {
  const pool = [...new Set(wrong.filter(w => w !== correct))]
  const distractors = []
  while (distractors.length < 3 && pool.length) distractors.push(pool.splice(Math.floor(rand() * pool.length), 1)[0])
  return placeAnswer([correct, ...distractors], Math.floor(rand() * (distractors.length + 1)))
}

const constraintRows = [
  { label: 'n ≤ 10', task: ['list all orderings', 'try every arrangement'], answer: 'O(n · n!)', why: '10! ≈ 3.6·10⁶: brute force over permutations fits.' },
  { label: 'n ≤ 20', task: ['choose a subset', 'pick items under a budget'], answer: 'O(2ⁿ · n)', why: '2²⁰ ≈ 10⁶; exponential subset search fits.' },
  { label: 'n ≤ 100', task: ['find the best triple', 'all-pairs shortest paths'], answer: 'O(n³)', why: '100³ = 10⁶, easily under 10⁸.' },
  { label: 'n ≤ 2000', task: ['compare two strings with DP', 'check every pair'], answer: 'O(n²)', why: '2000² = 4·10⁶. n³ would be 8·10⁹.' },
  { label: 'n ≤ 10⁵', task: ['schedule meetings', 'find pairs with a property', 'merge intervals'], answer: 'O(n log n)', why: 'n² = 10¹⁰ too slow; n log n ≈ 1.7·10⁶.' },
  { label: 'n ≤ 10⁶', task: ['count subarrays with sum k', 'find the first unique element'], answer: 'O(n)', why: 'Even n log n is ~2·10⁷; a single linear pass is the safe target.' },
  { label: 'n ≤ 10⁹', task: ['find the smallest valid value', 'locate a threshold'], answer: 'O(log n)', why: 'Cannot touch every value; halve the search space (~30 steps).' },
]
const complexityLadder = ['O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(n³)', 'O(2ⁿ · n)', 'O(n · n!)']

const snippetMakers = [
  rand => {
    const v = pick(rand, ['i', 'k', 'step'])
    const f = pick(rand, [2, 3])
    return { code: `${v} = 1\nwhile ${v} < n:\n    ${v} *= ${f}`, answer: 'O(log n)', wrong: ['O(n)', 'O(√n)', 'O(n log n)', 'O(1)'], why: `${v} multiplies by ${f}: log n steps.` }
  },
  rand => {
    const start = pick(rand, ['0', 'i', 'i + 1'])
    return { code: `for i in range(n):\n    for j in range(${start}, n):\n        total += 1`, answer: 'O(n²)', wrong: ['O(n)', 'O(n log n)', 'O(n³)', 'O(2ⁿ)'], why: 'Inner loop shrinks but still sums to ~n²/2.' }
  },
  rand => {
    const inner = pick(rand, [5, 26, 100])
    return { code: `for i in range(n):\n    for c in range(${inner}):\n        work(i, c)`, answer: 'O(n)', wrong: ['O(n²)', `O(${inner}ⁿ)`, 'O(n log n)', 'O(1)'], why: `${inner} is a constant, so it drops.` }
  },
  rand => {
    const ds = pick(rand, ['lst', 'items'])
    return { code: `for x in nums:\n    if x in ${ds}:\n        count += 1`, answer: 'O(n · m)', wrong: ['O(n)', 'O(n + m)', 'O(m)', 'O(n log m)'], why: `"in" on a list scans all m items. set(${ds}) makes it O(n + m).` }
  },
  rand => {
    const name = pick(rand, ['dfs', 'go', 'solve'])
    return { code: `def ${name}(n):\n    if n <= 1:\n        return 1\n    return ${name}(n - 1) + ${name}(n - 1)`, answer: 'O(2ⁿ)', wrong: ['O(n)', 'O(n²)', 'O(log n)', 'O(n!)'], why: 'Two branches per call, depth n.' }
  },
  rand => {
    const name = pick(rand, ['dfs', 'go'])
    return { code: `@cache\ndef ${name}(i):\n    if i <= 1:\n        return i\n    return ${name}(i - 1) + ${name}(i - 2)`, answer: 'O(n)', wrong: ['O(2ⁿ)', 'O(n²)', 'O(log n)', 'O(n log n)'], why: 'n distinct states, each computed once.' }
  },
  () => ({ code: `nums.sort()\nfor num in nums:\n    i = bisect_left(nums, num * 2)`, answer: 'O(n log n)', wrong: ['O(n)', 'O(n²)', 'O(log n)', 'O(n² log n)'], why: 'Sort is n log n, then n binary searches at log n.' }),
  () => ({ code: `for i in range(len(nums)):\n    while stack and nums[stack[-1]] < nums[i]:\n        stack.pop()\n    stack.append(i)`, answer: 'O(n)', wrong: ['O(n²)', 'O(n log n)', 'O(log n)', 'O(1)'], why: 'Amortized: each index pushed and popped once.' }),
  () => ({ code: `while queue:\n    node = queue.pop(0)\n    for nei in graph[node]:\n        if nei not in seen:\n            seen.add(nei)\n            queue.append(nei)`, answer: 'O(V² + E)', wrong: ['O(V + E)', 'O(V log V)', 'O(E²)', 'O(V)'], why: 'list.pop(0) costs O(V) per pop. Use deque.popleft.' }),
  rand => {
    const op = pick(rand, ['n //= 2', 'n //= 10', 'n >>= 1'])
    return { code: `while n > 0:\n    ${op}`, answer: 'O(log n)', wrong: ['O(n)', 'O(1)', 'O(√n)', 'O(n log n)'], why: 'n shrinks by a constant factor each step.' }
  },
]

const pyOps = [
  ['lst.append(x)', 'O(1) amortized', 'Occasional resize spread over many appends.'],
  ['lst.pop()', 'O(1)', 'Removing from the end shifts nothing.'],
  ['lst.pop(0)', 'O(n)', 'Every element shifts left. Use deque.popleft().'],
  ['lst.insert(0, x)', 'O(n)', 'Every element shifts right. Use deque.appendleft().'],
  ['x in lst', 'O(n)', 'Linear scan.'],
  ['x in s  (s is a set)', 'O(1) average', 'Hash lookup.'],
  ['d[key] = value', 'O(1) average', 'Hash insert.'],
  ['deque.popleft()', 'O(1)', 'deque is fast at both ends.'],
  ['heapq.heappush(heap, x)', 'O(log n)', 'Sift up the tree height.'],
  ['heapq.heappop(heap)', 'O(log n)', 'Move last to root, sift down.'],
  ['heapq.heapify(lst)', 'O(n)', 'Bottom-up build is linear.'],
  ['heap[0]', 'O(1)', 'Min sits at index 0.'],
  ['sorted(lst)', 'O(n log n)', 'Timsort; also O(n) extra for the new list.'],
  ['lst[a:b]', 'O(b - a)', 'Slicing copies the elements.'],
  ['len(lst)', 'O(1)', 'Length is stored.'],
  ['lst.remove(x)', 'O(n)', 'Find then shift.'],
  ['Counter(nums)', 'O(n)', 'One pass to count.'],
  ['"".join(parts) (total length n)', 'O(n)', 'Single allocation for all parts.'],
  ['s[::-1]', 'O(n)', 'Builds a reversed copy.'],
  ['bisect.bisect_left(lst, x)', 'O(log n)', 'Binary search on sorted list.'],
  ['bisect.insort(lst, x)', 'O(n)', 'Search is log n, but insertion shifts.'],
  ['del d[key]', 'O(1) average', 'Hash delete.'],
  ['min(lst)', 'O(n)', 'Scans all elements.'],
  ['lst.copy()', 'O(n)', 'Copies every reference.'],
]
const opCostPool = ['O(1)', 'O(1) average', 'O(1) amortized', 'O(log n)', 'O(n)', 'O(n log n)', 'O(b - a)', 'O(n²)']

const spaceCases = [
  { q: 'Recursive DFS on a balanced binary tree of n nodes. Extra space?', answer: 'O(log n)', wrong: ['O(n)', 'O(1)', 'O(n log n)'], why: 'Stack depth = height = log n.' },
  { q: 'Recursive DFS on a skewed (line-shaped) tree of n nodes. Extra space?', answer: 'O(n)', wrong: ['O(log n)', 'O(1)', 'O(n²)'], why: 'Height is n, so n frames.' },
  { q: 'BFS on a complete binary tree of n nodes. Queue space?', answer: 'O(n)', wrong: ['O(log n)', 'O(1)', 'O(√n)'], why: 'The last level has ~n/2 nodes queued at once.' },
  { q: 'Fibonacci with @cache for n. Space?', answer: 'O(n)', wrong: ['O(1)', 'O(2ⁿ)', 'O(log n)'], why: 'n cache entries plus stack depth n.' },
  { q: 'Fibonacci with two rolling variables. Space?', answer: 'O(1)', wrong: ['O(n)', 'O(log n)', 'O(2ⁿ)'], why: 'Only prev and curr are kept.' },
  { q: 'Plain recursive fib(n), no memo. Space?', answer: 'O(n)', wrong: ['O(2ⁿ)', 'O(1)', 'O(n²)'], why: 'Only one root-to-leaf path is on the stack at once.' },
  { q: 'Grid DFS (recursive) on an r×c grid. Worst-case space?', answer: 'O(r · c)', wrong: ['O(r + c)', 'O(1)', 'O(log(r · c))'], why: 'A snake path can put every cell on the stack.' },
  { q: 'Memoized dfs(i, j) for LCS of lengths m and n. Space?', answer: 'O(m · n)', wrong: ['O(m + n)', 'O(1)', 'O(2^(m+n))'], why: 'Cache stores every (i, j) state.' },
  { q: 'Bottom-up 2D DP of m×n with only the previous row kept. Space?', answer: 'O(n)', wrong: ['O(m · n)', 'O(1)', 'O(m)'], why: 'One row of n plus the current row.' },
  { q: 'Subsets backtracking, excluding the output list. Extra space?', answer: 'O(n)', wrong: ['O(2ⁿ)', 'O(n · 2ⁿ)', 'O(1)'], why: 'Path and recursion depth are both at most n.' },
  { q: 'Merge sort on n items. Extra space?', answer: 'O(n)', wrong: ['O(1)', 'O(log n)', 'O(n log n)'], why: 'Merging needs a buffer of size n (stack is only log n).' },
  { q: 'Reverse a list in place with two pointers. Extra space?', answer: 'O(1)', wrong: ['O(n)', 'O(log n)', 'O(n²)'], why: 'Swaps use only a few variables.' },
  { q: 'Graph BFS with adjacency list, V nodes and E edges. Space?', answer: 'O(V + E)', wrong: ['O(V)', 'O(E²)', 'O(V²)'], why: 'Adjacency list stores every edge; seen and queue are O(V).' },
  { q: 'total(nums) = nums[0] + total(nums[1:]) recursively. Space?', answer: 'O(n²)', wrong: ['O(n)', 'O(1)', 'O(log n)'], why: 'n frames, each holding a slice of up to n.' },
]

const budgetRows = [
  { n: 10 ** 5, nLabel: '10⁵' },
  { n: 10 ** 6, nLabel: '10⁶' },
  { n: 2000, nLabel: '2000' },
  { n: 20, nLabel: '20' },
  { n: 500, nLabel: '500' },
  { n: 5000, nLabel: '5000' },
]
const budgetFns = [
  ['O(n²)', n => n * n],
  ['O(n log n)', n => n * Math.log2(n)],
  ['O(n³)', n => n ** 3],
  ['O(2ⁿ)', n => 2 ** n],
  ['O(n)', n => n],
]
const sci = x => {
  if (x < 1000) return String(Math.round(x))
  const e = Math.floor(Math.log10(x))
  const m = x / 10 ** e
  return `${m.toFixed(m < 9.95 ? 1 : 0).replace(/\.0$/, '')}·10^${e}`
}

const generators = [
  {
    id: 'complexity:gen:constraint',
    title: 'Constraint → target complexity',
    skills: ['constraints'],
    make(seed) {
      const rand = mulberry(seed)
      const row = pick(rand, constraintRows)
      const task = pick(rand, row.task)
      const wrong = complexityLadder.filter(c => c !== row.answer && !(row.label === 'n ≤ 10⁶' && c === 'O(n log n)'))
      return {
        id: `complexity:gen:constraint:${seed}`,
        skills: ['constraints'],
        difficulty: 2,
        q: `Constraint: ${row.label}. You need to ${task}. Slowest complexity that still safely fits?`,
        ...shuffleAnswer(rand, row.answer, wrong),
        why: row.why,
      }
    },
  },
  {
    id: 'complexity:gen:snippet',
    title: 'Code → Big-O',
    skills: ['complexity'],
    make(seed) {
      const rand = mulberry(seed)
      const item = pick(rand, snippetMakers)(rand)
      return {
        id: `complexity:gen:snippet:${seed}`,
        skills: ['complexity'],
        difficulty: 2,
        q: 'Time complexity of this code?',
        code: item.code,
        ...shuffleAnswer(rand, item.answer, item.wrong),
        why: item.why,
      }
    },
  },
  {
    id: 'complexity:gen:pyop',
    title: 'Python op cost',
    skills: ['ds-diagnosis', 'complexity'],
    make(seed) {
      const rand = mulberry(seed)
      const [op, cost, why] = pick(rand, pyOps)
      const wrong = opCostPool.filter(c => c !== cost && !(c.startsWith('O(1)') && cost.startsWith('O(1)')))
      return {
        id: `complexity:gen:pyop:${seed}`,
        skills: ['ds-diagnosis', 'complexity'],
        difficulty: 1,
        q: 'Time cost of this Python op (n = len)?',
        code: op,
        ...shuffleAnswer(rand, cost, wrong),
        why,
      }
    },
  },
  {
    id: 'complexity:gen:space',
    title: 'Space complexity',
    skills: ['complexity'],
    make(seed) {
      const rand = mulberry(seed)
      const item = pick(rand, spaceCases)
      return {
        id: `complexity:gen:space:${seed}`,
        skills: ['complexity'],
        difficulty: 2,
        q: item.q,
        ...shuffleAnswer(rand, item.answer, item.wrong),
        why: item.why,
      }
    },
  },
  {
    id: 'complexity:gen:budget',
    title: 'Will it pass in 1 second?',
    skills: ['constraints', 'complexity'],
    make(seed) {
      const rand = mulberry(seed)
      const row = pick(rand, budgetRows)
      const [name, fn] = pick(rand, budgetFns)
      const ops = fn(row.n)
      const verdict = ops <= 10 ** 8 ? 'Passes' : ops <= 10 ** 9 ? 'Borderline / likely TLE' : 'Too slow'
      const choices = ['Passes', 'Borderline / likely TLE', 'Too slow', 'Depends only on memory']
      return {
        id: `complexity:gen:budget:${seed}`,
        skills: ['constraints', 'complexity'],
        difficulty: 1,
        q: `n = ${row.nLabel}, algorithm is ${name}. Budget ~10⁸ ops/sec. Verdict?`,
        ...shuffleAnswer(rand, verdict, choices),
        why: `${name} at n = ${row.nLabel} ≈ ${sci(ops)} ops vs 10^8 per second.`,
      }
    },
  },
]

export default {
  id: topicId,
  title: 'Complexity & Constraints',
  icon: 'clock',
  skills: ['complexity', 'constraints', 'ds-diagnosis'],
  lessons,
  traces,
  flashcards,
  mcqs,
  clozes,
  parsons,
  problems,
  extras: { generators, constraintTable: constraintRows.map(({ label, answer }) => ({ label, answer })) },
}
