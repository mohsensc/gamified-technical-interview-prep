import { runQuiz, part, pick, pickByLevel, rand } from './_engine.js'

const arrayName = () => pick(['nums', 'arr', 'values', 'heights', 'prices'])
const funcName = () => pick(['solve', 'helper', 'process', 'work', 'compute'])

const timeCommon = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(n³)', 'O(2ⁿ)']
const spaceCommon = ['O(1)', 'O(log n)', 'O(n)', 'O(n²)']

const templates = [
  { d: 1, make: () => {
    const arr = arrayName()
    return { code: `def ${funcName()}(${arr}):\n    total = 0\n\n    for x in ${arr}:\n        total += x\n\n    return total`,
      time: 'O(n)', space: 'O(1)', why: 'One pass over n items.', spaceWhy: 'Only a running total.' }
  } },
  { d: 1, make: () => {
    const arr = arrayName()
    return { code: `def ${funcName()}(${arr}):\n    n = len(${arr})\n    count = 0\n\n    for i in range(n):\n        for j in range(n):\n            if ${arr}[i] < ${arr}[j]:\n                count += 1\n\n    return count`,
      time: 'O(n²)', space: 'O(1)', why: 'n × n pairs.', spaceWhy: 'A counter only.' }
  } },
  { d: 1, make: () => {
    const arr = arrayName()
    return { code: `def ${funcName()}(${arr}):\n    n = len(${arr})\n    result = 0\n\n    for i in range(n):\n        for j in range(i + 1, n):\n            result = max(result, ${arr}[i] + ${arr}[j])\n\n    return result`,
      time: 'O(n²)', space: 'O(1)', why: 'n(n−1)/2 pairs is still O(n²).', spaceWhy: 'One variable.' }
  } },
  { d: 2, make: () => {
    const arr = arrayName()
    return { code: `def ${funcName()}(${arr}):\n    n = len(${arr})\n    found = 0\n\n    for i in range(n):\n        for j in range(i + 1, n):\n            for k in range(j + 1, n):\n                if ${arr}[i] + ${arr}[j] + ${arr}[k] == 0:\n                    found += 1\n\n    return found`,
      time: 'O(n³)', space: 'O(1)', why: 'Three nested loops over n.', spaceWhy: 'A counter.' }
  } },
  { d: 1, make: () => {
    const step = pick(['n //= 2', 'n = n // 2', 'n >>= 1'])
    return { code: `def ${funcName()}(n):\n    steps = 0\n\n    while n > 1:\n        ${step}\n        steps += 1\n\n    return steps`,
      time: 'O(log n)', space: 'O(1)', why: 'n halves each loop: log₂ n iterations.', spaceWhy: 'Two ints.' }
  } },
  { d: 2, make: () => ({ code: `def ${funcName()}(n):\n    total = 0\n\n    for i in range(n):\n        j = 1\n        while j < n:\n            j *= 2\n            total += 1\n\n    return total`,
    time: 'O(n log n)', space: 'O(1)', why: 'n outer × log n doubling inner.', spaceWhy: 'Counters only.' }) },
  { d: 1, make: () => ({ code: `def ${funcName()}(nums, words):\n    total = 0\n\n    for x in nums:\n        total += x\n\n    for word in words:\n        total += len(word)\n\n    return total`,
    time: 'O(n + m)', space: 'O(1)', timeAlts: ['O(n·m)', 'O(n)', 'O(n²)'], why: 'Two separate loops add, not multiply.', spaceWhy: 'One accumulator.' }) },
  { d: 1, make: () => ({ code: `def ${funcName()}(rows, cols):\n    grid = [[0] * cols for _ in range(rows)]\n\n    for r in range(rows):\n        for c in range(cols):\n            grid[r][c] = r * c\n\n    return grid`,
    time: 'O(r·c)', space: 'O(r·c)', timeAlts: ['O(r + c)', 'O(n²)', 'O(r·c·log c)'], spaceAlts: ['O(1)', 'O(r + c)', 'O(c)'], why: 'Every cell once.', spaceWhy: 'The grid has r·c cells.' }) },
  { d: 2, make: () => ({ code: `def fib(n):\n    if n < 2:\n        return n\n\n    return fib(n - 1) + fib(n - 2)`,
    time: 'O(2ⁿ)', space: 'O(n)', timeAlts: ['O(n)', 'O(n²)', 'O(n log n)'], why: 'Two calls per level, depth n: branching tree.', spaceWhy: 'Call stack depth is n, not 2ⁿ.' }) },
  { d: 2, make: () => ({ code: `from functools import cache\n\n@cache\ndef fib(n):\n    if n < 2:\n        return n\n\n    return fib(n - 1) + fib(n - 2)`,
    time: 'O(n)', space: 'O(n)', timeAlts: ['O(2ⁿ)', 'O(n²)', 'O(log n)'], why: 'Each n computed once thanks to @cache.', spaceWhy: 'Cache of n entries + stack depth n.' }) },
  { d: 2, make: () => ({ code: `def search(nums, target, left, right):\n    if left > right:\n        return -1\n\n    mid = (left + right) // 2\n\n    if nums[mid] == target:\n        return mid\n    if nums[mid] < target:\n        return search(nums, target, mid + 1, right)\n    return search(nums, target, left, mid - 1)`,
    time: 'O(log n)', space: 'O(log n)', why: 'Range halves each call.', spaceWhy: 'Recursion depth log n. Iterative would be O(1).' }) },
  { d: 3, make: () => ({ code: `def sortList(nums):\n    if len(nums) <= 1:\n        return nums\n\n    mid = len(nums) // 2\n    left = sortList(nums[:mid])\n    right = sortList(nums[mid:])\n\n    result = []\n    i = j = 0\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]:\n            result.append(left[i])\n            i += 1\n        else:\n            result.append(right[j])\n            j += 1\n\n    return result + left[i:] + right[j:]`,
    time: 'O(n log n)', space: 'O(n)', why: 'log n levels, O(n) merge work per level.', spaceWhy: 'Merged lists of size n at a time.' }) },
  { d: 2, make: () => {
    const arr = arrayName()
    return { code: `import heapq\n\ndef ${funcName()}(${arr}):\n    heap = []\n\n    for x in ${arr}:\n        heapq.heappush(heap, x)\n\n    result = []\n    while heap:\n        result.append(heapq.heappop(heap))\n\n    return result`,
      time: 'O(n log n)', space: 'O(n)', why: 'n pushes + n pops, each log n.', spaceWhy: 'Heap holds n items.' }
  } },
  { d: 2, make: () => {
    const arr = arrayName()
    return { code: `import heapq\n\ndef kthLargest(${arr}, k):\n    heap = []\n\n    for x in ${arr}:\n        heapq.heappush(heap, x)\n        if len(heap) > k:\n            heapq.heappop(heap)\n\n    return heap[0]`,
      time: 'O(n log k)', space: 'O(k)', timeAlts: ['O(n log n)', 'O(n·k)', 'O(k log n)'], spaceAlts: ['O(n)', 'O(1)', 'O(log k)'], why: 'Heap capped at k: each op log k.', spaceWhy: 'Never more than k+1 items.' }
  } },
  { d: 2, make: () => {
    const arr = arrayName()
    return { code: `def ${funcName()}(${arr}):\n    result = []\n\n    for x in ${arr}:\n        result.append(x)\n        result.sort()\n\n    return result`,
      time: 'O(n² log n)', space: 'O(n)', timeAlts: ['O(n log n)', 'O(n²)', 'O(n)'], why: 'Sorting (up to n log n) inside an n loop.', spaceWhy: 'result grows to n.' }
  } },
  { d: 3, make: () => ({ code: `def ${funcName()}(words):\n    text = ''\n\n    for word in words:\n        text = text + word\n\n    return text`,
    time: 'O(n²)', space: 'O(n)', why: 'Strings are immutable: each + copies everything so far. Use "".join.', spaceWhy: 'Final string of total length n.' }) },
  { d: 2, make: () => {
    const arr = arrayName()
    return { code: `def ${funcName()}(${arr}):\n    pairs = []\n\n    for i in range(len(${arr})):\n        for j in range(i + 1, len(${arr})):\n            pairs.append((${arr}[i], ${arr}[j]))\n\n    return pairs`,
      time: 'O(n²)', space: 'O(n²)', why: 'Visit every pair.', spaceWhy: 'Stores every pair: n²/2 tuples.' }
  } },
  { d: 3, make: () => ({ code: `def subsets(nums):\n    result = []\n    curr = []\n\n    def dfs(i):\n        if i == len(nums):\n            result.append(curr.copy())\n            return\n\n        curr.append(nums[i])\n        dfs(i + 1)\n        curr.pop()\n        dfs(i + 1)\n\n    dfs(0)\n    return result`,
    time: 'O(2ⁿ·n)', space: 'O(2ⁿ·n)', timeAlts: ['O(2ⁿ)', 'O(n²)', 'O(n!)'], spaceAlts: ['O(n)', 'O(2ⁿ)', 'O(n²)'], why: '2ⁿ leaves, each copies up to n items.', spaceWhy: 'Output holds 2ⁿ lists of length ≤ n.' }) },
  { d: 3, make: () => ({ code: `def permute(nums):\n    result = []\n\n    def dfs(curr, remaining):\n        if not remaining:\n            result.append(curr)\n            return\n\n        for i in range(len(remaining)):\n            dfs(curr + [remaining[i]], remaining[:i] + remaining[i + 1:])\n\n    dfs([], nums)\n    return result`,
    time: 'O(n!·n)', space: 'O(n!·n)', timeAlts: ['O(2ⁿ)', 'O(n²)', 'O(n!)'], spaceAlts: ['O(n)', 'O(n²)', 'O(2ⁿ)'], why: 'n! leaves, each list built in O(n).', spaceWhy: 'Output stores n! permutations of length n.' }) },
  { d: 1, make: () => {
    const arr = arrayName()
    return { code: `def ${funcName()}(${arr}, otherList):\n    common = 0\n\n    for x in ${arr}:\n        if x in otherList:\n            common += 1\n\n    return common`,
      time: 'O(n²)', space: 'O(1)', why: '"in" on a list scans it: n × n.', spaceWhy: 'A counter.' }
  } },
  { d: 1, make: () => {
    const arr = arrayName()
    return { code: `def ${funcName()}(${arr}, other):\n    seen = set(other)\n    common = 0\n\n    for x in ${arr}:\n        if x in seen:\n            common += 1\n\n    return common`,
      time: 'O(n)', space: 'O(n)', why: 'Set build O(n), each lookup O(1).', spaceWhy: 'The set holds n values.' }
  } },
  { d: 2, make: () => ({ code: `from collections import deque\n\ndef ${funcName()}(grid):\n    rows, cols = len(grid), len(grid[0])\n    queue = deque([(0, 0)])\n    seen = {(0, 0)}\n\n    while queue:\n        r, c = queue.popleft()\n        for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:\n            nr, nc = r + dr, c + dc\n            if 0 <= nr < rows and 0 <= nc < cols and (nr, nc) not in seen:\n                seen.add((nr, nc))\n                queue.append((nr, nc))\n\n    return len(seen)`,
    time: 'O(r·c)', space: 'O(r·c)', timeAlts: ['O(r + c)', 'O((r·c)²)', 'O(4ʳᶜ)'], spaceAlts: ['O(1)', 'O(r + c)', 'O(min(r, c))'], why: 'Each cell enqueued once, 4 neighbors each.', spaceWhy: 'seen can hold every cell.' }) },
  { d: 2, make: () => ({ code: `def isPrime(n):\n    if n < 2:\n        return False\n\n    i = 2\n    while i * i <= n:\n        if n % i == 0:\n            return False\n        i += 1\n\n    return True`,
    time: 'O(√n)', space: 'O(1)', timeAlts: ['O(n)', 'O(log n)', 'O(n log n)'], why: 'Stops once i² > n: √n iterations.', spaceWhy: 'One counter.' }) },
  { d: 1, make: () => {
    const arr = arrayName()
    return { code: `def ${funcName()}(${arr}, target):\n    left, right = 0, len(${arr}) - 1\n\n    while left < right:\n        total = ${arr}[left] + ${arr}[right]\n        if total == target:\n            return [left, right]\n        if total < target:\n            left += 1\n        else:\n            right -= 1\n\n    return []`,
      time: 'O(n)', space: 'O(1)', why: 'Pointers move inward, n steps total.', spaceWhy: 'Two indices.' }
  } },
  { d: 3, make: () => ({ code: `def total(nums):\n    if not nums:\n        return 0\n\n    return nums[0] + total(nums[1:])`,
    time: 'O(n²)', space: 'O(n²)', timeAlts: ['O(n)', 'O(n log n)', 'O(2ⁿ)'], spaceAlts: ['O(n)', 'O(1)', 'O(log n)'], why: 'nums[1:] copies n, n−1, … items.', spaceWhy: 'n stack frames each holding a slice copy.' }) },
  { d: 2, make: () => {
    const arr = arrayName()
    return { code: `def ${funcName()}(${arr}):\n    queue = list(${arr})\n    order = []\n\n    while queue:\n        order.append(queue.pop(0))\n\n    return order`,
      time: 'O(n²)', space: 'O(n)', why: 'list.pop(0) shifts every element. Use deque.popleft.', spaceWhy: 'Copy of n items.' }
  } },
  { d: 2, make: () => {
    const arr = arrayName()
    const extra = rand(2) ? '\n    for _ in range(26):\n        pass\n' : ''
    return { code: `from collections import Counter\n\ndef ${funcName()}(${arr}):\n    counts = Counter(${arr})\n${extra}\n    best = 0\n    for key, freq in counts.items():\n        best = max(best, freq)\n\n    return best`,
      time: 'O(n)', space: 'O(n)', why: 'Counting is one pass; distinct keys ≤ n. Constant loops vanish.', spaceWhy: 'Up to n distinct keys.' }
  } },
  { d: 3, make: () => ({ code: `def ${funcName()}(matrix):\n    n = len(matrix)\n\n    for i in range(n):\n        row = sorted(matrix[i])\n        matrix[i] = row\n\n    return matrix`,
    time: 'O(n² log n)', space: 'O(n)', timeAlts: ['O(n²)', 'O(n log n)', 'O(n³)'], spaceAlts: ['O(1)', 'O(n²)', 'O(log n)'], why: 'n rows, sorting each of length n: n · n log n.', spaceWhy: 'sorted() returns a new row of n.' }) },
]

const allTimes = [...timeCommon, 'O(n² log n)', 'O(√n)', 'O(n!·n)', 'O(2ⁿ·n)']

export function makeQuestion(level = 1) {
  const template = pickByLevel(templates, level)
  const index = templates.indexOf(template)
  const built = template.make()
  return {
    id: `bigo-ladder:${index}`,
    skills: ['complexity'],
    tag: '🪜 Time + space',
    summary: built.code.split('\n').find(line => line.startsWith('def ')) || 'Snippet',
    code: built.code,
    parts: [
      part('Time complexity?', built.time, built.timeAlts || allTimes, built.why),
      part('Extra space?', built.space, built.spaceAlts || [...spaceCommon, 'O(n log n)'], built.spaceWhy),
    ],
  }
}

export default {
  id: 'bigo-ladder',
  title: 'Big-O Ladder',
  icon: '🪜',
  blurb: 'Read Python, call time and space.',
  skills: ['complexity'],
  mount: (container, api) => runQuiz(container, api, {
    title: 'Big-O Ladder',
    icon: '🪜',
    rules: ['time, then space', 'climbs as you streak'],
    mode: 'lives',
    lives: 3,
    speedMs: 15000,
    makeQuestion,
  }),
}
