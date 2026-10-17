const clone = value => JSON.parse(JSON.stringify(value))

const lineAt = code => {
  const lines = code.split('\n')
  return (text, nth = 1) => {
    let seen = 0
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === text && ++seen === nth) return i + 1
    }
    seen = 0
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(text) && ++seen === nth) return i + 1
    }
    throw new Error(`line not found: ${text}`)
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

const fmtCell = value => {
  if (value === Infinity) return '∞'
  if (value === true) return 'T'
  if (value === false) return 'F'
  if (value === null || value === undefined) return ''
  return value
}

const fmtList = list => `[${list.join(',')}]`
const fmtLists = lists => `[${lists.map(fmtList).join(', ')}]`

const dpRow = (label, values, opts = {}) => ({
  kind: 'table',
  label,
  rows: [values.map(fmtCell)],
  rowLabels: opts.rowLabels || [label],
  colLabels: opts.colLabels || values.map((_, i) => String(i)),
  highlight: opts.highlight || [],
  deps: opts.deps || [],
})

const dpGrid = (label, grid, opts = {}) => ({
  kind: 'table',
  label,
  rows: grid.map(r => r.map(fmtCell)),
  rowLabels: opts.rowLabels,
  colLabels: opts.colLabels,
  highlight: opts.highlight || [],
  deps: opts.deps || [],
})

const arrayPanel = (label, values, opts = {}) => ({
  kind: 'array',
  label,
  values: [...values],
  pointers: { ...(opts.pointers || {}) },
  highlight: opts.highlight || [],
  window: opts.window,
  dim: opts.dim || [],
  sorted: opts.sorted,
})

const textPanel = text => ({ kind: 'text', text })
const callstack = frames => ({ kind: 'callstack', label: 'call stack', frames: [...frames] })

const decisionTree = rootVal => {
  let count = 0
  const state = {}
  const values = {}
  const make = val => ({ id: `d${count++}`, val, left: null, right: null })
  const root = make(rootVal)
  const panel = (label, currentId) => ({
    kind: 'tree',
    label,
    root: clone(root),
    state: { ...state },
    pointers: currentId ? { here: currentId } : {},
    values: { ...values },
  })
  return { root, make, state, values, panel }
}

const heapPush = (heap, item) => {
  heap.push(item)
  let i = heap.length - 1
  while (i > 0) {
    const parent = (i - 1) >> 1
    if (heap[parent] <= heap[i]) break
    ;[heap[parent], heap[i]] = [heap[i], heap[parent]]
    i = parent
  }
}

const heapPop = heap => {
  const top = heap[0]
  const last = heap.pop()
  if (heap.length) {
    heap[0] = last
    let i = 0
    while (true) {
      const left = 2 * i + 1
      const right = left + 1
      let small = i
      if (left < heap.length && heap[left] < heap[small]) small = left
      if (right < heap.length && heap[right] < heap[small]) small = right
      if (small === i) break
      ;[heap[small], heap[i]] = [heap[i], heap[small]]
      i = small
    }
  }
  return top
}

const subsetsCode = `class Solution:
    def subsets(self, nums: List[int]) -> List[List[int]]:

        result = []
        curr = []

        def dfs(i):
            if i == len(nums):
                result.append(curr.copy())
                return

            curr.append(nums[i])
            dfs(i + 1)
            curr.pop()
            dfs(i + 1)

        dfs(0)

        return result`

const traceSubsets = {
  id: 'paradigms:trace:subsets',
  title: 'Subsets (take / skip backtracking)',
  skills: ['backtracking', 'communication'],
  problem: 'Return every subset of a list of distinct integers.',
  code: subsetsCode,
  complexity: { time: 'O(n · 2^n)', space: 'O(n)', why: '2^n leaves, each copy costs O(n). Recursion depth n.' },
  inputs: [
    { label: '[1,2,3]', value: [1, 2, 3] },
    { label: '[5,7]', value: [5, 7] },
    { label: '[0]', value: [0] },
  ],
  run(nums, t) {
    const L = lineAt(subsetsCode)
    const say = once()
    const result = []
    const curr = []
    const frames = []
    const tree = decisionTree('[]')
    const panels = id => [
      tree.panel('decision tree: left = take, right = skip', id),
      callstack(frames),
      { kind: 'stack', label: 'curr', items: [...curr] },
      textPanel(`result = ${fmtLists(result)}`),
    ]
    t.step(L('dfs(0)'), {
      vars: { nums: [...nums] },
      panels: panels(null),
      note: 'Start at index 0 with an empty subset',
      say: 'Each element has two choices, take or skip. That is a binary decision tree with 2^n leaves.',
    })
    const dfs = (i, node) => {
      frames.push(`dfs(${i})`)
      tree.state[node.id] = 'current'
      t.step(L('def dfs(i):'), { vars: { i, curr: [...curr] }, panels: panels(node.id), note: `Decide on index ${i}` })
      if (i === nums.length) {
        result.push([...curr])
        tree.state[node.id] = 'done'
        t.step(L('result.append(curr.copy())'), {
          vars: { i, curr: [...curr] },
          panels: panels(node.id),
          note: `Leaf: record a copy of ${fmtList(curr)}`,
          say: say('copy', 'At a leaf I append a copy, because curr keeps mutating as I backtrack.'),
        })
        frames.pop()
        return
      }
      curr.push(nums[i])
      node.left = tree.make(fmtList(curr))
      tree.state[node.id] = 'path'
      t.step(L('curr.append(nums[i])'), {
        vars: { i, curr: [...curr] },
        panels: panels(node.id),
        note: `Choose: take ${nums[i]}`,
        say: say('choose', 'Choose: add nums[i], then explore everything below that choice.'),
      })
      dfs(i + 1, node.left)
      curr.pop()
      tree.state[node.id] = 'current'
      t.step(L('curr.pop()'), {
        vars: { i, curr: [...curr] },
        panels: panels(node.id),
        note: `Unchoose: remove ${nums[i]}`,
        say: say('unchoose', 'Unchoose: pop it so the skip branch sees the same state I started with.'),
      })
      node.right = tree.make(fmtList(curr))
      tree.state[node.id] = 'path'
      t.step(L('dfs(i + 1)', 2), {
        vars: { i, curr: [...curr] },
        panels: panels(node.id),
        note: `Skip ${nums[i]}, explore right branch`,
      })
      dfs(i + 1, node.right)
      tree.state[node.id] = 'visited'
      frames.pop()
    }
    dfs(0, tree.root)
    t.step(L('return result'), {
      vars: { count: result.length },
      panels: panels(null),
      note: `${result.length} subsets = 2^${nums.length}`,
      say: 'O(n·2^n) time: 2^n subsets, each copied in O(n). O(n) extra space for recursion besides output.',
    })
  },
}

const combinationCode = `class Solution:
    def combinationSum(self, nums: List[int], target: int) -> List[List[int]]:

        answer = []

        def dfs(i, curr, total):
            if total == target:
                answer.append(curr.copy())
                return
            if i >= len(nums) or total > target:
                return

            curr.append(nums[i])
            dfs(i, curr, total + nums[i])
            curr.pop()
            dfs(i + 1, curr, total)

        dfs(0, [], 0)

        return answer`

const traceCombinationSum = {
  id: 'paradigms:trace:combination-sum',
  title: 'Combination Sum (reuse allowed)',
  skills: ['backtracking'],
  problem: 'Find all unique combinations of nums summing to target; each number reusable.',
  code: combinationCode,
  complexity: { time: 'O(2^(t/m))', space: 'O(t/m)', why: 'Depth up to target/min(nums); each level branches take vs skip.' },
  inputs: [
    { label: '[2,3] → 6', value: { nums: [2, 3], target: 6 } },
    { label: '[2,3,5] → 8', value: { nums: [2, 3, 5], target: 8 } },
    { label: '[2,3,6,7] → 7', value: { nums: [2, 3, 6, 7], target: 7 } },
  ],
  run({ nums, target }, t) {
    const L = lineAt(combinationCode)
    const say = once()
    const answer = []
    const curr = []
    const frames = []
    const tree = decisionTree('[]')
    let currentI = 0
    tree.values[tree.root.id] = 'Σ0'
    const panels = id => [
      tree.panel('left = take nums[i] again, right = move to i+1', id),
      callstack(frames),
      arrayPanel('nums', nums, { pointers: currentI < nums.length ? { i: currentI } : {} }),
      textPanel(`answer = ${fmtLists(answer)}`),
    ]
    t.step(L('dfs(0, [], 0)'), {
      vars: { target },
      panels: panels(null),
      note: 'Start: index 0, empty combo, sum 0',
      say: 'Two branches per call: reuse nums[i], or move past it forever. Moving forward prevents duplicate orderings.',
    })
    const dfs = (i, total, node) => {
      frames.push(`dfs(${i},${total})`)
      currentI = i
      tree.state[node.id] = 'current'
      if (total === target) {
        answer.push([...curr])
        tree.state[node.id] = 'done'
        t.step(L('answer.append(curr.copy())'), {
          vars: { i, curr: [...curr], total },
          panels: panels(node.id),
          note: `Hit target: save ${fmtList(curr)}`,
          say: say('hit', 'Sum equals target, so I record a copy and stop this branch.'),
        })
        frames.pop()
        return
      }
      if (i >= nums.length || total > target) {
        tree.state[node.id] = 'visited'
        t.step(L('return', 2), {
          vars: { i, curr: [...curr], total },
          panels: panels(node.id),
          note: total > target ? `Prune: ${total} > ${target}` : 'Prune: ran out of numbers',
          say: say('prune', 'Prune: overshooting the target or running out of numbers can never recover.'),
        })
        frames.pop()
        return
      }
      curr.push(nums[i])
      node.left = tree.make(fmtList(curr))
      tree.values[node.left.id] = `Σ${total + nums[i]}`
      tree.state[node.id] = 'path'
      t.step(L('curr.append(nums[i])'), {
        vars: { i, curr: [...curr], total },
        panels: panels(node.id),
        note: `Take ${nums[i]} (can take it again)`,
      })
      dfs(i, total + nums[i], node.left)
      currentI = i
      curr.pop()
      node.right = tree.make(fmtList(curr))
      tree.values[node.right.id] = `Σ${total}`
      t.step(L('dfs(i + 1, curr, total)'), {
        vars: { i, curr: [...curr], total },
        panels: panels(node.id),
        note: `Pop ${nums[i]}, never use it again`,
        say: say('skip', 'After popping, i+1 means this number is done. That is how I avoid [2,3] and [3,2] both.'),
      })
      dfs(i + 1, total, node.right)
      tree.state[node.id] = 'visited'
      frames.pop()
    }
    dfs(0, 0, tree.root)
    t.step(L('return answer'), {
      vars: { found: answer.length },
      panels: panels(null),
      note: `${answer.length} combination(s) found`,
      say: 'Exponential in target over the smallest number; pruning on total > target keeps it fast in practice.',
    })
  },
}

const permuteCode = `class Solution:
    def permute(self, nums: List[int]) -> List[List[int]]:

        result = []
        curr = []
        used = set()

        def dfs():
            if len(curr) == len(nums):
                result.append(curr.copy())
                return

            for num in nums:
                if num in used:
                    continue
                used.add(num)
                curr.append(num)
                dfs()
                curr.pop()
                used.remove(num)

        dfs()

        return result`

const permutationLayout = nums => {
  const nodes = []
  const edges = []
  let leaf = 0
  const depthMax = nums.length
  const build = (path, depth) => {
    const id = `p${path.join('-')}`
    const node = { id, label: path.length ? String(path[path.length - 1]) : '·', depth, path }
    nodes.push(node)
    const children = nums.filter(num => !path.includes(num))
    if (!children.length) {
      node.xs = leaf++
      return node.xs
    }
    const xs = children.map(num => {
      const childPath = [...path, num]
      edges.push({ from: id, to: `p${childPath.join('-')}` })
      return build(childPath, depth + 1)
    })
    node.xs = (xs[0] + xs[xs.length - 1]) / 2
    return node.xs
  }
  build([], 0)
  const width = Math.max(1, leaf - 1)
  return {
    nodes: nodes.map(node => ({ id: node.id, label: node.label, x: leaf === 1 ? 0.5 : 0.04 + 0.92 * (node.xs / width), y: 0.06 + 0.88 * (node.depth / Math.max(1, depthMax)) })),
    edges,
  }
}

const tracePermutations = {
  id: 'paradigms:trace:permutations',
  title: 'Permutations (used set)',
  skills: ['backtracking'],
  problem: 'Return all orderings of a list of distinct integers.',
  code: permuteCode,
  complexity: { time: 'O(n · n!)', space: 'O(n)', why: 'n! leaves, each copied in O(n). Depth n plus the used set.' },
  inputs: [
    { label: '[1,2,3]', value: [1, 2, 3] },
    { label: '[0,1]', value: [0, 1] },
  ],
  run(nums, t) {
    const L = lineAt(permuteCode)
    const say = once()
    const layout = permutationLayout(nums)
    const shown = new Set(['p'])
    const state = {}
    const edgeState = {}
    const result = []
    const curr = []
    const used = new Set()
    const frames = []
    const idOf = path => `p${path.join('-')}`
    const panels = () => [
      {
        kind: 'graph',
        label: 'decision tree (each level picks one unused number)',
        directed: true,
        nodes: layout.nodes.filter(node => shown.has(node.id)),
        edges: layout.edges.filter(edge => shown.has(edge.to)),
        state: { ...state },
        edgeState: { ...edgeState },
      },
      callstack(frames),
      { kind: 'stack', label: 'curr', items: [...curr] },
      { kind: 'set', label: 'used', items: [...used], highlight: [] },
      textPanel(`result = ${fmtLists(result)}`),
    ]
    t.step(L('dfs()', 2), {
      vars: { nums: [...nums] },
      panels: panels(),
      note: 'Start with nothing placed',
      say: 'n choices for the first slot, n-1 for the next... that is n! leaves.',
    })
    const dfs = () => {
      const id = idOf(curr)
      frames.push(`dfs(${fmtList(curr)})`)
      state[id] = 'current'
      t.step(L('if len(curr) == len(nums):'), { vars: { curr: [...curr] }, panels: panels(), note: `${curr.length} of ${nums.length} slots filled` })
      if (curr.length === nums.length) {
        result.push([...curr])
        state[id] = 'done'
        t.step(L('result.append(curr.copy())'), {
          vars: { curr: [...curr] },
          panels: panels(),
          note: `Full permutation ${fmtList(curr)}`,
          say: say('leaf', 'Every slot filled, so this path is one permutation. Save a copy.'),
        })
        frames.pop()
        return
      }
      state[id] = 'path'
      for (const num of nums) {
        if (used.has(num)) {
          t.step(L('continue'), { vars: { curr: [...curr], num }, panels: panels(), note: `${num} already used, skip` })
          continue
        }
        used.add(num)
        curr.push(num)
        const childId = idOf(curr)
        shown.add(childId)
        edgeState[`${id}->${childId}`] = 'active'
        t.step(L('curr.append(num)'), {
          vars: { curr: [...curr], num },
          panels: panels(),
          note: `Choose ${num}`,
          say: say('choose', 'Choose an unused number, mark it used, recurse to fill the next slot.'),
        })
        dfs()
        curr.pop()
        used.delete(num)
        edgeState[`${id}->${childId}`] = 'tree'
        state[id] = 'current'
        t.step(L('used.remove(num)'), {
          vars: { curr: [...curr], num },
          panels: panels(),
          note: `Unchoose ${num}`,
          say: say('undo', 'Undo both the append and the used mark, so the next sibling starts clean.'),
        })
        state[id] = 'path'
      }
      state[id] = 'visited'
      frames.pop()
    }
    dfs()
    t.step(L('return result'), {
      vars: { count: result.length },
      panels: panels(),
      note: `${result.length} permutations = ${nums.length}!`,
      say: 'O(n·n!) time, O(n) recursion space. Fine only for n around 8 to 10.',
    })
  },
}

const parensCode = `class Solution:
    def generateParenthesis(self, n: int) -> List[str]:

        result = []
        curr = []

        def dfs(openCount, closeCount):
            if len(curr) == 2 * n:
                result.append("".join(curr))
                return

            if openCount < n:
                curr.append("(")
                dfs(openCount + 1, closeCount)
                curr.pop()

            if closeCount < openCount:
                curr.append(")")
                dfs(openCount, closeCount + 1)
                curr.pop()

        dfs(0, 0)

        return result`

const traceParens = {
  id: 'paradigms:trace:generate-parentheses',
  title: 'Generate Parentheses',
  skills: ['backtracking'],
  problem: 'Generate all well-formed strings of n pairs of parentheses.',
  code: parensCode,
  complexity: { time: 'O(4^n / √n)', space: 'O(n)', why: 'Catalan number of valid strings, each length 2n. Depth 2n.' },
  inputs: [
    { label: 'n = 2', value: 2 },
    { label: 'n = 3', value: 3 },
  ],
  run(n, t) {
    const L = lineAt(parensCode)
    const say = once()
    const result = []
    const curr = []
    const frames = []
    const tree = decisionTree('""')
    const panels = id => [
      tree.panel('left = add "(", right = add ")"', id),
      callstack(frames),
      textPanel(`curr = "${curr.join('')}"   result = [${result.map(s => `"${s}"`).join(', ')}]`),
    ]
    t.step(L('dfs(0, 0)'), {
      vars: { n },
      panels: panels(null),
      note: 'Start with 0 open, 0 closed',
      say: 'Only two rules: open if open < n, close if close < open. Invalid strings are never built.',
    })
    const dfs = (openCount, closeCount, node) => {
      frames.push(`dfs(${openCount},${closeCount})`)
      tree.state[node.id] = 'current'
      t.step(L('if len(curr) == 2 * n:'), {
        vars: { openCount, closeCount, curr: curr.join('') },
        panels: panels(node.id),
        note: `open=${openCount}, close=${closeCount}`,
      })
      if (curr.length === 2 * n) {
        result.push(curr.join(''))
        tree.state[node.id] = 'done'
        t.step(L('result.append("".join(curr))'), {
          vars: { curr: curr.join('') },
          panels: panels(node.id),
          note: `Valid: ${curr.join('')}`,
          say: say('leaf', 'Length 2n and the rules guaranteed balance, so it is valid with no extra check.'),
        })
        frames.pop()
        return
      }
      tree.state[node.id] = 'path'
      if (openCount < n) {
        curr.push('(')
        node.left = tree.make(curr.join(''))
        t.step(L('curr.append("(")'), {
          vars: { openCount, closeCount, curr: curr.join('') },
          panels: panels(node.id),
          note: `${openCount} < ${n}: open one`,
          say: say('open', 'I can open as long as I have not used all n opens.'),
        })
        dfs(openCount + 1, closeCount, node.left)
        curr.pop()
        t.step(L('curr.pop()'), { vars: { openCount, closeCount, curr: curr.join('') }, panels: panels(node.id), note: 'Backtrack the "("' })
      }
      if (closeCount < openCount) {
        curr.push(')')
        node.right = tree.make(curr.join(''))
        t.step(L('curr.append(")")'), {
          vars: { openCount, closeCount, curr: curr.join('') },
          panels: panels(node.id),
          note: `${closeCount} < ${openCount}: close one`,
          say: say('close', 'I may close only when there is an unmatched open, so the prefix never goes negative.'),
        })
        dfs(openCount, closeCount + 1, node.right)
        curr.pop()
        t.step(L('curr.pop()', 2), { vars: { openCount, closeCount, curr: curr.join('') }, panels: panels(node.id), note: 'Backtrack the ")"' })
      }
      tree.state[node.id] = 'visited'
      frames.pop()
    }
    dfs(0, 0, tree.root)
    t.step(L('return result'), {
      vars: { count: result.length },
      panels: panels(null),
      note: `${result.length} strings (Catalan number)`,
      say: 'Count is the nth Catalan number, about 4^n/n^1.5. Recursion depth is 2n.',
    })
  },
}

const climbCode = `class Solution:
    def climbStairs(self, n: int) -> int:

        if n <= 2:
            return n

        dp = [0] * (n + 1)
        dp[1], dp[2] = 1, 2

        for i in range(3, n + 1):
            dp[i] = dp[i - 1] + dp[i - 2]

        return dp[n]`

const traceClimb = {
  id: 'paradigms:trace:climbing-stairs',
  title: 'Climbing Stairs (1-D table)',
  skills: ['dp-1d'],
  problem: 'Count ways to climb n steps taking 1 or 2 at a time.',
  code: climbCode,
  complexity: { time: 'O(n)', space: 'O(n)', why: 'One pass filling n cells. Two variables would make it O(1).' },
  inputs: [
    { label: 'n = 5', value: 5 },
    { label: 'n = 8', value: 8 },
    { label: 'n = 2', value: 2 },
  ],
  run(n, t) {
    const L = lineAt(climbCode)
    const say = once()
    t.step(L('if n <= 2:'), {
      vars: { n },
      panels: [textPanel(`n = ${n}`)],
      note: 'Tiny inputs answer themselves',
      say: 'State: dp[i] = ways to reach step i. Last move was a 1 or a 2, so dp[i] = dp[i-1] + dp[i-2].',
    })
    if (n <= 2) {
      t.step(L('return n'), { vars: { n, answer: n }, panels: [textPanel(`answer = ${n}`)], note: `Base case: ${n} way(s)` })
      return
    }
    const dp = new Array(n + 1).fill(0)
    t.step(L('dp = [0] * (n + 1)'), { vars: { n }, panels: [dpRow('dp', dp)], note: 'One cell per step' })
    dp[1] = 1
    dp[2] = 2
    t.step(L('dp[1], dp[2] = 1, 2'), {
      vars: { n },
      panels: [dpRow('dp', dp, { highlight: ['0,1', '0,2'] })],
      note: 'Base: 1 way to step 1, 2 ways to step 2',
      say: say('base', 'Base cases: one way to reach step 1, two ways to reach step 2.'),
    })
    for (let i = 3; i <= n; i++) {
      dp[i] = dp[i - 1] + dp[i - 2]
      t.step(L('dp[i] = dp[i - 1] + dp[i - 2]'), {
        vars: { i, 'dp[i-1]': dp[i - 1], 'dp[i-2]': dp[i - 2], 'dp[i]': dp[i] },
        panels: [dpRow('dp', dp, { highlight: [`0,${i}`], deps: [`0,${i - 1}`, `0,${i - 2}`] })],
        note: `${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}`,
        say: say('transition', 'Each cell only needs the two before it, so I fill left to right.'),
      })
    }
    t.step(L('return dp[n]'), {
      vars: { answer: dp[n] },
      panels: [dpRow('dp', dp, { highlight: [`0,${n}`] })],
      note: `Answer dp[${n}] = ${dp[n]}`,
      say: 'O(n) time. Since I only look back two cells, I can drop to O(1) space with two variables.',
    })
  },
}

const robCode = `class Solution:
    def rob(self, nums: List[int]) -> int:

        if len(nums) == 1:
            return nums[0]

        dp = [0] * len(nums)
        dp[0] = nums[0]
        dp[1] = max(nums[0], nums[1])

        for i in range(2, len(nums)):
            dp[i] = max(dp[i - 1], dp[i - 2] + nums[i])

        return dp[-1]`

const traceRob = {
  id: 'paradigms:trace:house-robber',
  title: 'House Robber (skip or take)',
  skills: ['dp-1d'],
  problem: 'Max money robbing houses in a row, never two adjacent.',
  code: robCode,
  complexity: { time: 'O(n)', space: 'O(n)', why: 'One cell per house; O(1) possible with two rolling variables.' },
  inputs: [
    { label: '[2,7,9,3,1]', value: [2, 7, 9, 3, 1] },
    { label: '[2,1,1,2]', value: [2, 1, 1, 2] },
    { label: '[5]', value: [5] },
  ],
  run(nums, t) {
    const L = lineAt(robCode)
    const say = once()
    const n = nums.length
    const dp = new Array(n).fill(null)
    const panels = (i, opts = {}) => [
      arrayPanel('nums', nums, { pointers: i === null ? {} : { i }, highlight: opts.take ? [i] : [] }),
      dpRow('dp', dp, opts),
    ]
    t.step(L('if len(nums) == 1:'), {
      vars: { n },
      panels: panels(null),
      note: 'One house: just rob it',
      say: 'dp[i] = best loot using houses 0..i. At each house: skip it, or rob it plus dp[i-2].',
    })
    if (n === 1) {
      t.step(L('return nums[0]'), { vars: { answer: nums[0] }, panels: panels(0), note: `Answer ${nums[0]}` })
      return
    }
    dp.fill(0)
    t.step(L('dp = [0] * len(nums)'), { vars: { n }, panels: panels(null), note: 'Table of best-so-far' })
    dp[0] = nums[0]
    t.step(L('dp[0] = nums[0]'), { vars: { 'dp[0]': dp[0] }, panels: panels(0, { highlight: ['0,0'] }), note: 'First house alone' })
    dp[1] = Math.max(nums[0], nums[1])
    t.step(L('dp[1] = max(nums[0], nums[1])'), {
      vars: { 'dp[1]': dp[1] },
      panels: panels(1, { highlight: ['0,1'] }),
      note: 'Better of the first two',
      say: say('base', 'Two base cases because the transition looks back two houses.'),
    })
    for (let i = 2; i < n; i++) {
      const skip = dp[i - 1]
      const take = dp[i - 2] + nums[i]
      dp[i] = Math.max(skip, take)
      t.step(L('dp[i] = max(dp[i - 1], dp[i - 2] + nums[i])'), {
        vars: { i, skip, take, 'dp[i]': dp[i] },
        panels: panels(i, { highlight: [`0,${i}`], deps: [`0,${i - 1}`, `0,${i - 2}`], take: take >= skip }),
        note: take >= skip ? `Rob: ${dp[i - 2]} + ${nums[i]} = ${take} ≥ ${skip}` : `Skip: keep ${skip} > ${take}`,
        say: say('choice', 'Skip keeps dp[i-1]. Rob adds nums[i] to dp[i-2], since the neighbor is off limits.'),
      })
    }
    t.step(L('return dp[-1]'), {
      vars: { answer: dp[n - 1] },
      panels: panels(null, { highlight: [`0,${n - 1}`] }),
      note: `Answer ${dp[n - 1]}`,
      say: 'O(n) time, O(n) space, reducible to O(1) with two variables prev and curr.',
    })
  },
}

const coinCode = `import math

class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:

        dp = [0] + [math.inf] * amount

        for i in range(1, amount + 1):
            for c in coins:
                if i - c >= 0:
                    dp[i] = min(dp[i], 1 + dp[i - c])

        return dp[amount] if dp[amount] != math.inf else -1`

const traceCoin = {
  id: 'paradigms:trace:coin-change',
  title: 'Coin Change (min coins table)',
  skills: ['dp-1d', 'greedy'],
  problem: 'Fewest coins summing to amount, or -1 if impossible.',
  code: coinCode,
  complexity: { time: 'O(amount · k)', space: 'O(amount)', why: 'Each amount tries each of k coins once.' },
  inputs: [
    { label: '[1,2,5] → 11', value: { coins: [1, 2, 5], amount: 11 } },
    { label: '[1,3,4] → 6', value: { coins: [1, 3, 4], amount: 6 } },
    { label: '[2] → 3', value: { coins: [2], amount: 3 } },
  ],
  run({ coins, amount }, t) {
    const L = lineAt(coinCode)
    const say = once()
    const dp = [0, ...new Array(amount).fill(Infinity)]
    const panels = (opts = {}, c = null) => [
      arrayPanel('coins', coins, { highlight: c === null ? [] : [coins.indexOf(c)] }),
      dpRow('dp[amount] = min coins', dp, opts),
    ]
    t.step(L('dp = [0] + [math.inf] * amount'), {
      vars: { amount },
      panels: panels({ highlight: ['0,0'] }),
      note: '0 coins make 0; everything else unknown',
      say: 'Greedy fails here, e.g. coins 1,3,4 for 6. So dp[i] = fewest coins to make amount i.',
    })
    for (let i = 1; i <= amount; i++) {
      t.step(L('for i in range(1, amount + 1):'), { vars: { i }, panels: panels({ highlight: [`0,${i}`] }), note: `Solve amount ${i}` })
      for (const c of coins) {
        if (i - c >= 0) {
          const before = dp[i]
          dp[i] = Math.min(dp[i], 1 + dp[i - c])
          t.step(L('dp[i] = min(dp[i], 1 + dp[i - c])'), {
            vars: { i, c, 'dp[i-c]': fmtCell(dp[i - c]), 'dp[i]': fmtCell(dp[i]) },
            panels: panels({ highlight: [`0,${i}`], deps: [`0,${i - c}`] }, c),
            note: dp[i] < before ? `Use coin ${c}: 1 + dp[${i - c}] = ${fmtCell(dp[i])}` : `Coin ${c} no better`,
            say: say('transition', 'Last coin used is some c, so dp[i] = 1 + dp[i - c], minimized over coins.'),
          })
        }
      }
    }
    const answer = dp[amount] === Infinity ? -1 : dp[amount]
    t.step(L('return dp[amount] if dp[amount] != math.inf else -1'), {
      vars: { answer },
      panels: panels({ highlight: [`0,${amount}`] }),
      note: answer === -1 ? 'Still ∞: impossible, return -1' : `Answer ${answer} coins`,
      say: 'O(amount × coins) time and O(amount) space. Infinity marks unreachable amounts.',
    })
  },
}

const lcsCode = `class Solution:
    def longestCommonSubsequence(self, text1: str, text2: str) -> int:

        dp = [[0] * (len(text2) + 1) for _ in range(len(text1) + 1)]

        for i in range(len(text1) - 1, -1, -1):
            for j in range(len(text2) - 1, -1, -1):
                if text1[i] == text2[j]:
                    dp[i][j] = 1 + dp[i + 1][j + 1]
                else:
                    dp[i][j] = max(dp[i + 1][j], dp[i][j + 1])

        return dp[0][0]`

const traceLcs = {
  id: 'paradigms:trace:lcs',
  title: 'Longest Common Subsequence (2-D)',
  skills: ['dp-2d'],
  problem: 'Length of the longest subsequence common to two strings.',
  code: lcsCode,
  complexity: { time: 'O(m · n)', space: 'O(m · n)', why: 'One cell per pair of suffixes, O(1) work each.' },
  inputs: [
    { label: 'abcde / ace', value: { text1: 'abcde', text2: 'ace' } },
    { label: 'abc / def', value: { text1: 'abc', text2: 'def' } },
    { label: 'abcba / bcab', value: { text1: 'abcba', text2: 'bcab' } },
  ],
  run({ text1, text2 }, t) {
    const L = lineAt(lcsCode)
    const say = once()
    const m = text1.length
    const n = text2.length
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
    const rowLabels = [...text1.split(''), '∅']
    const colLabels = [...text2.split(''), '∅']
    const panels = (opts = {}) => [dpGrid('dp[i][j] = LCS of text1[i:], text2[j:]', dp, { rowLabels, colLabels, ...opts })]
    t.step(L('dp = [[0] * (len(text2) + 1) for _ in range(len(text1) + 1)]'), {
      vars: { m, n },
      panels: panels(),
      note: 'Extra row/col of 0s: empty suffix',
      say: 'dp[i][j] is the LCS of the suffixes text1[i:] and text2[j:]. Empty suffix gives 0.',
    })
    for (let i = m - 1; i >= 0; i--) {
      for (let j = n - 1; j >= 0; j--) {
        if (text1[i] === text2[j]) {
          dp[i][j] = 1 + dp[i + 1][j + 1]
          t.step(L('dp[i][j] = 1 + dp[i + 1][j + 1]'), {
            vars: { i, j, 'text1[i]': text1[i], 'text2[j]': text2[j], 'dp[i][j]': dp[i][j] },
            panels: panels({ highlight: [`${i},${j}`], deps: [`${i + 1},${j + 1}`] }),
            note: `'${text1[i]}' matches: 1 + diagonal`,
            say: say('match', 'Characters match, so both advance and I add one: 1 + dp[i+1][j+1].'),
          })
        } else {
          dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1])
          t.step(L('dp[i][j] = max(dp[i + 1][j], dp[i][j + 1])'), {
            vars: { i, j, 'text1[i]': text1[i], 'text2[j]': text2[j], 'dp[i][j]': dp[i][j] },
            panels: panels({ highlight: [`${i},${j}`], deps: [`${i + 1},${j}`, `${i},${j + 1}`] }),
            note: `'${text1[i]}' ≠ '${text2[j]}': best of below or right`,
            say: say('mismatch', 'Mismatch: drop one character from either string and take the better answer.'),
          })
        }
      }
    }
    t.step(L('return dp[0][0]'), {
      vars: { answer: dp[0][0] },
      panels: panels({ highlight: ['0,0'] }),
      note: `LCS length ${dp[0][0]}`,
      say: say('end', 'I fill bottom-up from the end so dependencies are ready. O(m·n) time and space; one row suffices for O(n).'),
    })
  },
}

const pathsCode = `class Solution:
    def uniquePaths(self, m: int, n: int) -> int:

        dp = [[1] * n for _ in range(m)]

        for r in range(1, m):
            for c in range(1, n):
                dp[r][c] = dp[r - 1][c] + dp[r][c - 1]

        return dp[m - 1][n - 1]`

const traceUniquePaths = {
  id: 'paradigms:trace:unique-paths',
  title: 'Unique Paths (grid DP)',
  skills: ['dp-2d', 'grid'],
  problem: 'Count paths from top-left to bottom-right moving only right or down.',
  code: pathsCode,
  complexity: { time: 'O(m · n)', space: 'O(m · n)', why: 'Each cell summed once from top and left; one row gives O(n).' },
  inputs: [
    { label: '3 × 7', value: { m: 3, n: 7 } },
    { label: '3 × 3', value: { m: 3, n: 3 } },
    { label: '4 × 4', value: { m: 4, n: 4 } },
  ],
  run({ m, n }, t) {
    const L = lineAt(pathsCode)
    const say = once()
    const dp = Array.from({ length: m }, () => new Array(n).fill(1))
    const panels = (opts = {}) => [dpGrid('dp[r][c] = paths to (r,c)', dp, { rowLabels: dp.map((_, r) => `r${r}`), colLabels: dp[0].map((_, c) => `c${c}`), ...opts })]
    t.step(L('dp = [[1] * n for _ in range(m)]'), {
      vars: { m, n },
      panels: panels(),
      note: 'First row and column: exactly 1 path',
      say: 'Base: along the top edge or left edge there is only one way, straight line.',
    })
    for (let r = 1; r < m; r++) {
      for (let c = 1; c < n; c++) {
        dp[r][c] = dp[r - 1][c] + dp[r][c - 1]
        t.step(L('dp[r][c] = dp[r - 1][c] + dp[r][c - 1]'), {
          vars: { r, c, up: dp[r - 1][c], left: dp[r][c - 1], 'dp[r][c]': dp[r][c] },
          panels: panels({ highlight: [`${r},${c}`], deps: [`${r - 1},${c}`, `${r},${c - 1}`] }),
          note: `${dp[r - 1][c]} from above + ${dp[r][c - 1]} from left`,
          say: say('transition', 'I arrive from above or from the left, so add those two counts.'),
        })
      }
    }
    t.step(L('return dp[m - 1][n - 1]'), {
      vars: { answer: dp[m - 1][n - 1] },
      panels: panels({ highlight: [`${m - 1},${n - 1}`] }),
      note: `${dp[m - 1][n - 1]} paths`,
      say: 'O(m·n) time. Row by row only needs the previous row, so O(n) space works too.',
    })
  },
}

const wordBreakCode = `class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:

        dp = [False] * (len(s) + 1)
        dp[len(s)] = True

        for i in range(len(s) - 1, -1, -1):
            for word in wordDict:
                if i + len(word) <= len(s) and s[i:i + len(word)] == word:
                    dp[i] = dp[i + len(word)]
                if dp[i]:
                    break

        return dp[0]`

const traceWordBreak = {
  id: 'paradigms:trace:word-break',
  title: 'Word Break (suffix DP)',
  skills: ['dp-1d'],
  problem: 'Can s be split into a sequence of dictionary words?',
  code: wordBreakCode,
  complexity: { time: 'O(n · w · L)', space: 'O(n)', why: 'n positions × w words × L-length compare.' },
  inputs: [
    { label: 'leetcode', value: { s: 'leetcode', wordDict: ['leet', 'code'] } },
    { label: 'applepenapple', value: { s: 'applepenapple', wordDict: ['apple', 'pen'] } },
    { label: 'catsandog', value: { s: 'catsandog', wordDict: ['cats', 'dog', 'sand', 'and', 'cat'] } },
  ],
  run({ s, wordDict }, t) {
    const L = lineAt(wordBreakCode)
    const say = once()
    const n = s.length
    const dp = new Array(n + 1).fill(false)
    const chars = s.split('')
    const panels = (i, opts = {}, win) => [
      arrayPanel('s', chars, { pointers: i === null ? {} : { i }, window: win }),
      dpRow('dp[i] = s[i:] breakable', dp, { colLabels: dp.map((_, k) => String(k)), ...opts }),
    ]
    t.step(L('dp = [False] * (len(s) + 1)'), {
      vars: { n },
      panels: panels(null),
      note: 'dp[i]: can the suffix s[i:] be split?',
      say: 'State: dp[i] means the suffix starting at i can be segmented.',
    })
    dp[n] = true
    t.step(L('dp[len(s)] = True'), {
      vars: { n },
      panels: panels(null, { highlight: [`0,${n}`] }),
      note: 'Empty suffix is trivially fine',
      say: say('base', 'Base case: the empty suffix is segmentable, which lets a word that ends exactly at the end succeed.'),
    })
    for (let i = n - 1; i >= 0; i--) {
      for (const word of wordDict) {
        const fits = i + word.length <= n
        const matches = fits && s.slice(i, i + word.length) === word
        const win = fits ? [i, i + word.length - 1] : undefined
        t.step(L('if i + len(word) <= len(s) and s[i:i + len(word)] == word:'), {
          vars: { i, word, slice: fits ? s.slice(i, i + word.length) : '(too long)' },
          panels: panels(i, { highlight: [`0,${i}`] }, win),
          note: matches ? `"${word}" fits at ${i}` : `"${word}" does not match at ${i}`,
        })
        if (matches) {
          dp[i] = dp[i + word.length]
          t.step(L('dp[i] = dp[i + len(word)]'), {
            vars: { i, word, 'dp[i]': dp[i] },
            panels: panels(i, { highlight: [`0,${i}`], deps: [`0,${i + word.length}`] }, win),
            note: `dp[${i}] = dp[${i + word.length}] = ${dp[i] ? 'True' : 'False'}`,
            say: say('transition', 'If a word matches at i, the answer depends on whether the rest after it is breakable.'),
          })
        }
        if (dp[i]) {
          t.step(L('break'), { vars: { i }, panels: panels(i, { highlight: [`0,${i}`] }), note: 'Found one split, stop trying words' })
          break
        }
      }
    }
    t.step(L('return dp[0]'), {
      vars: { answer: dp[0] ? 'True' : 'False' },
      panels: panels(null, { highlight: ['0,0'] }),
      note: dp[0] ? 'Whole string splits' : 'No valid split',
      say: 'Right to left so dp[i + len(word)] is ready. O(n·w·L) time, O(n) space.',
    })
  },
}

const lisCode = `class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:

        longest = [1] * len(nums)
        maximum = 1

        for i in range(len(nums) - 1, -1, -1):
            for j in range(i + 1, len(nums)):
                if nums[j] > nums[i]:
                    longest[i] = max(longest[i], 1 + longest[j])
            maximum = max(maximum, longest[i])

        return maximum`

const traceLis = {
  id: 'paradigms:trace:lis',
  title: 'Longest Increasing Subsequence (O(n²))',
  skills: ['dp-1d'],
  problem: 'Length of the longest strictly increasing subsequence.',
  code: lisCode,
  complexity: { time: 'O(n²)', space: 'O(n)', why: 'For each i, scan every j after it. Patience sorting gives O(n log n).' },
  inputs: [
    { label: '[10,9,2,5,3,7,101,18]', value: [10, 9, 2, 5, 3, 7, 101, 18] },
    { label: '[0,1,0,3,2,3]', value: [0, 1, 0, 3, 2, 3] },
    { label: '[7,7,7]', value: [7, 7, 7] },
  ],
  run(nums, t) {
    const L = lineAt(lisCode)
    const say = once()
    const n = nums.length
    const longest = new Array(n).fill(1)
    let maximum = 1
    const panels = (pointers, opts = {}) => [
      arrayPanel('nums', nums, { pointers, highlight: opts.hl || [] }),
      dpRow('longest[i] = LIS starting at i', longest, opts),
    ]
    t.step(L('longest = [1] * len(nums)'), {
      vars: { n },
      panels: panels({}),
      note: 'Every element alone is length 1',
      say: 'State: longest[i] is the LIS that starts at index i. Each element alone counts as 1.',
    })
    for (let i = n - 1; i >= 0; i--) {
      t.step(L('for i in range(len(nums) - 1, -1, -1):'), { vars: { i, maximum }, panels: panels({ i }, { highlight: [`0,${i}`] }), note: `Start sequences at ${nums[i]}` })
      for (let j = i + 1; j < n; j++) {
        if (nums[j] > nums[i]) {
          const before = longest[i]
          longest[i] = Math.max(longest[i], 1 + longest[j])
          t.step(L('longest[i] = max(longest[i], 1 + longest[j])'), {
            vars: { i, j, 'nums[i]': nums[i], 'nums[j]': nums[j], 'longest[i]': longest[i] },
            panels: panels({ i, j }, { highlight: [`0,${i}`], deps: [`0,${j}`], hl: [i, j] }),
            note: longest[i] > before ? `${nums[i]} < ${nums[j]}: extend to ${longest[i]}` : `${nums[i]} < ${nums[j]}, no gain`,
            say: say('transition', 'If nums[j] is bigger, I can put nums[i] in front of the best sequence starting at j.'),
          })
        }
      }
      maximum = Math.max(maximum, longest[i])
      t.step(L('maximum = max(maximum, longest[i])'), { vars: { i, 'longest[i]': longest[i], maximum }, panels: panels({ i }, { highlight: [`0,${i}`] }), note: `Best so far ${maximum}` })
    }
    t.step(L('return maximum'), {
      vars: { answer: maximum },
      panels: panels({}),
      note: `LIS length ${maximum}`,
      say: 'O(n²) time, O(n) space. Mention the O(n log n) tails array plus bisect as a follow-up.',
    })
  },
}

const jumpCode = `class Solution:
    def canJump(self, nums: List[int]) -> bool:

        farthest = 0

        for i in range(len(nums)):
            if i > farthest:
                return False
            farthest = max(farthest, i + nums[i])

        return True`

const traceJump = {
  id: 'paradigms:trace:jump-game',
  title: 'Jump Game (greedy reach)',
  skills: ['greedy'],
  problem: 'Each value is max jump length. Can you reach the last index?',
  code: jumpCode,
  complexity: { time: 'O(n)', space: 'O(1)', why: 'Single pass tracking the farthest reachable index.' },
  inputs: [
    { label: '[2,3,1,1,4]', value: [2, 3, 1, 1, 4] },
    { label: '[3,2,1,0,4]', value: [3, 2, 1, 0, 4] },
    { label: '[1,0,1]', value: [1, 0, 1] },
  ],
  run(nums, t) {
    const L = lineAt(jumpCode)
    const say = once()
    let farthest = 0
    const panels = i => [
      arrayPanel('nums', nums, {
        pointers: { ...(i === null ? {} : { i }), reach: Math.min(farthest, nums.length - 1) },
        window: [0, Math.min(farthest, nums.length - 1)],
        dim: nums.map((_, k) => k).filter(k => k > farthest),
      }),
    ]
    t.step(L('farthest = 0'), {
      vars: { farthest },
      panels: panels(null),
      note: 'Only index 0 is reachable so far',
      say: 'Greedy: I only need the farthest index reachable so far, not which path got there.',
    })
    for (let i = 0; i < nums.length; i++) {
      t.step(L('if i > farthest:'), { vars: { i, farthest }, panels: panels(i), note: i > farthest ? `${i} is past reach ${farthest}` : `${i} is reachable` })
      if (i > farthest) {
        t.step(L('return False'), {
          vars: { i, farthest },
          panels: panels(i),
          note: 'Stuck: cannot get here',
          say: say('stuck', 'If i is beyond my reach, nothing earlier can carry me further, so return False.'),
        })
        return
      }
      farthest = Math.max(farthest, i + nums[i])
      t.step(L('farthest = max(farthest, i + nums[i])'), {
        vars: { i, 'nums[i]': nums[i], farthest },
        panels: panels(i),
        note: `Reach now ${farthest}`,
        say: say('extend', 'Every reachable index extends the frontier to i + nums[i] if that is farther.'),
      })
    }
    t.step(L('return True'), {
      vars: { farthest },
      panels: panels(null),
      note: 'Last index is reachable',
      say: 'One pass, O(n) time, O(1) space. DP would be O(n²) for the same answer.',
    })
  },
}

const mergeCode = `class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:

        intervals.sort(key = lambda i: i[0])

        output = []

        for start, end in intervals:
            if output and start <= output[-1][1]:
                output[-1][1] = max(end, output[-1][1])
            else:
                output.append([start, end])

        return output`

const traceMerge = {
  id: 'paradigms:trace:merge-intervals',
  title: 'Merge Intervals (sort + sweep)',
  skills: ['intervals', 'greedy'],
  problem: 'Merge all overlapping intervals.',
  code: mergeCode,
  complexity: { time: 'O(n log n)', space: 'O(n)', why: 'Sorting dominates; the sweep is linear.' },
  inputs: [
    { label: 'classic', value: [[1, 3], [8, 10], [2, 6], [15, 18]] },
    { label: 'touching', value: [[4, 5], [1, 4], [0, 0]] },
    { label: 'nested', value: [[1, 10], [2, 3], [4, 8], [11, 12]] },
  ],
  run(input, t) {
    const L = lineAt(mergeCode)
    const say = once()
    const intervals = clone(input)
    const output = []
    const panels = idx => [{ kind: 'intervals', label: 'sorted by start', intervals: clone(intervals), highlight: idx === null ? [] : [idx], merged: clone(output) }]
    t.step(L('intervals.sort(key = lambda i: i[0])'), {
      vars: { n: intervals.length },
      panels: panels(null),
      note: 'Unsorted input',
      say: 'Sort by start so any overlap is with the most recent merged interval only.',
    })
    intervals.sort((a, b) => a[0] - b[0])
    t.step(L('output = []'), { vars: { n: intervals.length }, panels: panels(null), note: 'Sorted; overlaps are now adjacent' })
    intervals.forEach(([start, end], idx) => {
      const lastEnd = output.length ? output[output.length - 1][1] : null
      t.step(L('if output and start <= output[-1][1]:'), {
        vars: { start, end, lastEnd: lastEnd === null ? 'None' : lastEnd },
        panels: panels(idx),
        note: lastEnd !== null && start <= lastEnd ? `${start} ≤ ${lastEnd}: overlaps` : 'No overlap',
        say: say('check', 'Compare the new start with the end of the last merged interval.'),
      })
      if (output.length && start <= lastEnd) {
        output[output.length - 1][1] = Math.max(end, lastEnd)
        t.step(L('output[-1][1] = max(end, output[-1][1])'), {
          vars: { start, end, merged: fmtList(output[output.length - 1]) },
          panels: panels(idx),
          note: `Extend to ${fmtList(output[output.length - 1])}`,
          say: say('max', 'Take the max of ends, because a nested interval can end earlier than the current one.'),
        })
      } else {
        output.push([start, end])
        t.step(L('output.append([start, end])'), { vars: { start, end }, panels: panels(idx), note: `Start new block ${fmtList([start, end])}` })
      }
    })
    t.step(L('return output'), {
      vars: { merged: fmtLists(output) },
      panels: panels(null),
      note: `${output.length} merged interval(s)`,
      say: 'O(n log n) for the sort, O(n) sweep, O(n) output.',
    })
  },
}

const roomsCode = `import heapq

class Solution:
    def minMeetingRooms(self, intervals: List[List[int]]) -> int:

        intervals.sort(key = lambda i: i[0])
        heap = []
        result = 0

        for start, end in intervals:
            while heap and heap[0] <= start:
                heapq.heappop(heap)
            heapq.heappush(heap, end)
            result = max(result, len(heap))

        return result`

const traceRooms = {
  id: 'paradigms:trace:meeting-rooms-ii',
  title: 'Meeting Rooms II (min-heap of ends)',
  skills: ['intervals', 'heap', 'greedy'],
  problem: 'Minimum number of rooms so no meetings overlap.',
  code: roomsCode,
  complexity: { time: 'O(n log n)', space: 'O(n)', why: 'Sort plus one push/pop per meeting on a heap of size ≤ n.' },
  inputs: [
    { label: 'classic', value: [[0, 30], [5, 10], [15, 20]] },
    { label: 'chain', value: [[1, 5], [2, 6], [5, 8], [6, 9], [8, 10]] },
    { label: 'back to back', value: [[7, 10], [2, 4]] },
  ],
  run(input, t) {
    const L = lineAt(roomsCode)
    const say = once()
    const intervals = clone(input)
    const heap = []
    let result = 0
    const panels = idx => [
      { kind: 'intervals', label: 'meetings by start', intervals: clone(intervals), highlight: idx === null ? [] : [idx] },
      { kind: 'heap', label: 'end times of busy rooms', items: [...heap], highlight: heap.length ? [0] : [] },
    ]
    t.step(L('intervals.sort(key = lambda i: i[0])'), {
      vars: { n: intervals.length },
      panels: panels(null),
      note: 'Process meetings in start order',
      say: 'Sort by start. A min-heap holds end times of rooms in use, so the earliest-free room is on top.',
    })
    intervals.sort((a, b) => a[0] - b[0])
    intervals.forEach(([start, end], idx) => {
      t.step(L('for start, end in intervals:'), { vars: { start, end, result }, panels: panels(idx), note: `Meeting [${start}, ${end}] arrives` })
      while (heap.length && heap[0] <= start) {
        const freed = heapPop(heap)
        t.step(L('heapq.heappop(heap)'), {
          vars: { start, freed, rooms: heap.length },
          panels: panels(idx),
          note: `Room ending at ${freed} is free by ${start}`,
          say: say('pop', 'The top room ends before this meeting starts, so I free it and reuse it.'),
        })
      }
      heapPush(heap, end)
      t.step(L('heapq.heappush(heap, end)'), {
        vars: { start, end, rooms: heap.length },
        panels: panels(idx),
        note: `Occupy a room until ${end}`,
        say: say('push', 'Push this meeting\'s end time; heap size is rooms in use right now.'),
      })
      result = Math.max(result, heap.length)
      t.step(L('result = max(result, len(heap))'), { vars: { result, rooms: heap.length }, panels: panels(idx), note: `Peak rooms ${result}` })
    })
    t.step(L('return result'), {
      vars: { answer: result },
      panels: panels(null),
      note: `${result} room(s) needed`,
      say: 'O(n log n) time for sort and heap ops, O(n) heap. Two sorted arrays of starts and ends also works.',
    })
  },
}

const traces = [
  traceSubsets,
  traceCombinationSum,
  tracePermutations,
  traceParens,
  traceClimb,
  traceRob,
  traceCoin,
  traceLcs,
  traceUniquePaths,
  traceWordBreak,
  traceLis,
  traceMerge,
  traceRooms,
  traceJump,
]

const fullSubsetTree = nums => {
  const tree = decisionTree('[]')
  const grow = (i, node, curr) => {
    if (i === nums.length) {
      tree.state[node.id] = 'done'
      return
    }
    node.left = tree.make(fmtList([...curr, nums[i]]))
    node.right = tree.make(fmtList(curr))
    grow(i + 1, node.left, [...curr, nums[i]])
    grow(i + 1, node.right, curr)
  }
  grow(0, tree.root, [])
  return tree.panel('take ← → skip', null)
}

const lessons = [
  {
    id: 'paradigms:lesson:backtracking',
    title: 'Backtracking: choose, explore, unchoose',
    skills: ['backtracking', 'complexity'],
    slides: [
      {
        title: 'Every answer is a path',
        panels: [fullSubsetTree([1, 2, 3])],
        points: ['Each level = one decision.', 'Each leaf = one candidate answer.'],
      },
      {
        title: 'The template',
        code: `def dfs(i):
    if i == len(nums):
        result.append(curr.copy())
        return

    curr.append(nums[i])
    dfs(i + 1)
    curr.pop()
    dfs(i + 1)`,
        highlight: 6,
        points: ['Choose → explore → unchoose.', 'Base case records a copy.'],
      },
      {
        title: 'Why .copy()?',
        points: ['curr is one shared list.', 'Without a copy, every saved answer ends up [].'],
        ask: {
          q: 'You append curr (no copy) at each leaf. What does result hold at the end?',
          choices: ['All subsets, correct', 'Many references to the same empty list', 'Only the last subset', 'An error'],
          answer: 1,
          why: 'Every entry points to the same list object, which is empty once backtracking unwinds.',
        },
      },
      {
        title: 'What it costs',
        panels: [textPanel('subsets 2^n · n    permutations n! · n    depth = space O(n)')],
        points: ['n ≤ 20 → 2^n is fine.', 'n ≤ 10 → n! is fine.'],
      },
      {
        title: 'Prune early',
        points: ['Stop a branch the moment it cannot succeed.', 'total > target, too many opens, used cell.'],
        ask: {
          q: 'Combination Sum: which check prunes the most work?',
          choices: ['i >= len(nums)', 'total > target', 'len(curr) == 0', 'nums[i] == 0'],
          answer: 1,
          why: 'Overshooting the target can never recover since numbers are positive, so the whole subtree is skipped.',
        },
      },
      {
        title: 'Avoiding duplicates',
        points: ['Combinations: only move forward (i or i+1).', 'Duplicates in input: sort, skip equal siblings.'],
        code: `nums.sort()
for j in range(i, len(nums)):
    if j > i and nums[j] == nums[j - 1]:
        continue`,
      },
    ],
  },
  {
    id: 'paradigms:lesson:dp-recipe',
    title: 'The DP recipe',
    skills: ['dp-1d', 'dp-2d', 'communication'],
    slides: [
      {
        title: 'Five things to say',
        points: ['State: dp[i] means…', 'Transition', 'Base case', 'Fill order', 'Answer cell'],
      },
      {
        title: 'Example: climbing stairs',
        panels: [dpRow('dp', [0, 1, 2, 3, 5, 8], { highlight: ['0,5'], deps: ['0,4', '0,3'] })],
        points: ['dp[i] = dp[i-1] + dp[i-2]', 'Base dp[1]=1, dp[2]=2. Answer dp[n].'],
      },
      {
        title: 'Top-down: recursion + cache',
        code: `from functools import cache

@cache
def dfs(i):
    if i <= 2:
        return i
    return dfs(i - 1) + dfs(i - 2)`,
        highlight: 3,
        points: ['Write the brute force recursion.', '@cache turns it into DP.'],
      },
      {
        title: 'Bottom-up: fill a table',
        code: `dp = [0] * (n + 1)
dp[1], dp[2] = 1, 2
for i in range(3, n + 1):
    dp[i] = dp[i - 1] + dp[i - 2]
return dp[n]`,
        highlight: 4,
        points: ['No recursion depth limit.', 'Easy to shrink to O(1) space.'],
      },
      {
        title: 'Cost = states × work per state',
        points: ['n states × O(1) = O(n).', 'm·n states × O(1) = O(m·n).', 'amount states × k coins.'],
        ask: {
          q: 'Word Break: n positions, w words, each compare O(L). Time?',
          choices: ['O(n)', 'O(n · w · L)', 'O(2^n)', 'O(w · L)'],
          answer: 1,
          why: 'n states, each tries w words with an O(L) slice compare.',
        },
      },
      {
        title: '2-D: fill so deps are ready',
        panels: [dpGrid('LCS abc / ac', [[2, 1, 0], [1, 1, 0], [1, 1, 0], [0, 0, 0]], { rowLabels: ['a', 'b', 'c', '∅'], colLabels: ['a', 'c', '∅'], highlight: ['0,0'], deps: ['1,1'] })],
        points: ['Suffix states → loop from the end.', 'Arrows point to cells already filled.'],
      },
    ],
  },
  {
    id: 'paradigms:lesson:recognize-dp',
    title: 'Spotting DP (vs greedy vs backtracking)',
    skills: ['dp-1d', 'greedy', 'backtracking', 'ds-diagnosis'],
    slides: [
      {
        title: 'DP smells',
        points: ['"Number of ways"', '"Min / max cost"', '"Is it possible"', 'Choices repeat the same subproblem.'],
      },
      {
        title: 'Overlapping subproblems',
        panels: [
          {
            kind: 'tree',
            label: 'fib(5) without cache',
            root: { id: 'f5', val: 'f5', left: { id: 'f4', val: 'f4', left: { id: 'f3a', val: 'f3', left: { id: 'f2a', val: 'f2', left: null, right: null }, right: { id: 'f1a', val: 'f1', left: null, right: null } }, right: { id: 'f2b', val: 'f2', left: null, right: null } }, right: { id: 'f3b', val: 'f3', left: { id: 'f2c', val: 'f2', left: null, right: null }, right: { id: 'f1b', val: 'f1', left: null, right: null } } },
            state: { f3a: 'current', f3b: 'current', f2a: 'frontier', f2b: 'frontier', f2c: 'frontier' },
            pointers: {},
            values: {},
          },
        ],
        points: ['Same call appears twice → cache it.'],
      },
      {
        title: 'All answers vs best answer',
        points: ['List every combo → backtracking.', 'Count or optimize → DP.'],
        ask: {
          q: '"Return the number of ways to decode s." Which paradigm?',
          choices: ['Backtracking listing all decodings', 'DP over positions', 'Greedy', 'Binary search'],
          answer: 1,
          why: 'Counting, not listing, and decode(i) depends on decode(i+1) and decode(i+2): overlapping subproblems.',
        },
      },
      {
        title: 'When greedy breaks',
        panels: [dpRow('coins 1,3,4 → dp', [0, 1, 2, 1, 1, 2, 2], { highlight: ['0,6'], deps: ['0,3'] })],
        points: ['Greedy 6 = 4+1+1 (3 coins).', 'DP finds 3+3 (2 coins).'],
      },
      {
        title: 'Read the constraints',
        points: ['n ≤ 20 → backtracking / bitmask.', 'n ≤ 1000 → O(n²) DP.', 'n ≤ 10^5 → O(n) DP or greedy.'],
      },
    ],
  },
  {
    id: 'paradigms:lesson:intervals',
    title: 'Intervals: sort, merge, sweep',
    skills: ['intervals', 'heap', 'greedy'],
    slides: [
      {
        title: 'Step 1: sort by start',
        panels: [{ kind: 'intervals', label: 'sorted', intervals: [[1, 3], [2, 6], [8, 10], [15, 18]], highlight: [1] }],
        points: ['Overlaps become neighbors.'],
      },
      {
        title: 'Overlap test',
        code: `if start <= output[-1][1]:
    output[-1][1] = max(end, output[-1][1])`,
        highlight: 1,
        points: ['a overlaps b if b.start ≤ a.end.', 'max() handles nested intervals.'],
      },
      {
        title: 'Merged result',
        panels: [{ kind: 'intervals', label: 'merge', intervals: [[1, 3], [2, 6], [8, 10], [15, 18]], highlight: [], merged: [[1, 6], [8, 10], [15, 18]] }],
        points: ['O(n log n) sort + O(n) sweep.'],
      },
      {
        title: 'Rooms: heap of end times',
        panels: [
          { kind: 'intervals', label: 'meetings', intervals: [[0, 30], [5, 10], [15, 20]], highlight: [2] },
          { kind: 'heap', label: 'busy until', items: [20, 30], highlight: [0] },
        ],
        points: ['Top ≤ start → reuse that room.', 'Heap size = rooms in use.'],
      },
      {
        title: 'Remove fewest to avoid overlap',
        points: ['Sort by end.', 'Keep the interval that ends first.'],
        ask: {
          q: 'Non-overlapping intervals: why keep the one that ends earliest?',
          choices: ['It is shortest', 'It leaves the most room for the rest', 'It starts first', 'Sorting is stable'],
          answer: 1,
          why: 'Exchange argument: an earlier end never blocks more future intervals than a later end.',
        },
      },
    ],
  },
  {
    id: 'paradigms:lesson:greedy',
    title: 'Greedy: why the local choice is safe',
    skills: ['greedy', 'communication'],
    slides: [
      {
        title: 'Greedy = commit, never undo',
        points: ['Make the best local move.', 'Must argue it never hurts.'],
      },
      {
        title: 'Jump game: track reach',
        panels: [arrayPanel('nums', [2, 3, 1, 1, 4], { pointers: { i: 1, reach: 4 }, window: [0, 4] })],
        points: ['farthest = max(farthest, i + nums[i])', 'i > farthest → stuck.'],
      },
      {
        title: 'Proof sketch: exchange',
        points: ['Take an optimal answer.', 'Swap in my greedy choice.', 'Still optimal → greedy is safe.'],
      },
      {
        title: 'Kadane is greedy',
        code: `curr = 0
result = nums[0]
for num in nums:
    curr = max(num, curr + num)
    result = max(result, curr)`,
        highlight: 4,
        points: ['Negative running sum? Drop it.'],
      },
      {
        title: 'Test before trusting',
        points: ['Try a small counterexample.', 'If one breaks it, use DP.'],
        ask: {
          q: 'Gas station: total gas ≥ total cost. Where do you start?',
          choices: ['Index 0 always', 'Right after the last point the tank went negative', 'Station with most gas', 'Any station'],
          answer: 1,
          why: 'Any start before a failure point also fails there, so reset the start past it.',
        },
      },
    ],
  },
  {
    id: 'paradigms:lesson:bits',
    title: 'Bit tricks you will actually use',
    skills: ['bit', 'math'],
    slides: [
      {
        title: 'Read a bit',
        panels: [arrayPanel('13 in binary', [1, 1, 0, 1], { highlight: [3] })],
        code: `n & 1
(n >> i) & 1`,
        points: ['& 1 → lowest bit.', '>> shifts right.'],
      },
      {
        title: 'Drop the lowest set bit',
        code: `count = 0
while n:
    n &= n - 1
    count += 1`,
        highlight: 3,
        points: ['n & (n-1) clears one 1.', 'Loop runs once per set bit.'],
      },
      {
        title: 'XOR cancels pairs',
        code: `result = 0
for num in nums:
    result ^= num`,
        points: ['a ^ a = 0, a ^ 0 = a.', 'Single Number, Missing Number.'],
      },
      {
        title: 'Masks = subsets',
        points: ['1 << i sets bit i.', 'mask from 0 to 2^n - 1 lists all subsets.'],
        ask: {
          q: 'n & (n - 1) == 0 and n > 0 means…',
          choices: ['n is odd', 'n is a power of two', 'n is zero', 'n has two set bits'],
          answer: 1,
          why: 'A power of two has exactly one set bit; clearing it leaves 0.',
        },
      },
      {
        title: 'Counting bits DP',
        code: `answer[i] = answer[i >> 1] + (i & 1)`,
        points: ['i >> 1 already solved.', 'Add the dropped bit.'],
      },
    ],
  },
]

const cardData = [
  [['backtracking'], 'Backtracking template in three words?', 'Choose, explore, unchoose. Mutate state, recurse, then undo the mutation.'],
  [['backtracking'], 'Why append curr.copy() and not curr?', 'curr is one shared list that keeps changing. Without a copy every saved entry is the same object.'],
  [['backtracking', 'complexity'], 'Time to generate all subsets of n items?', 'O(n · 2^n): 2^n subsets, each copied in O(n).'],
  [['backtracking', 'complexity'], 'Time to generate all permutations of n items?', 'O(n · n!): n! leaves, O(n) copy each.'],
  [['backtracking', 'complexity'], 'Space of a backtracking solution (excluding output)?', 'O(depth), usually O(n) for the recursion stack and curr.'],
  [['backtracking', 'constraints'], 'n ≤ 20 in the constraints suggests?', 'O(2^n) is OK: subsets, bitmask, or backtracking.'],
  [['backtracking', 'constraints'], 'n ≤ 10 suggests?', 'O(n!) is OK: permutations / full search.'],
  [['backtracking'], 'Combination Sum: how to avoid [2,3] and [3,2]?', 'Only move forward: branch on take nums[i] (stay at i) or skip (go to i+1).'],
  [['backtracking'], 'Input has duplicates. How to skip duplicate subsets?', 'Sort, then in the loop skip nums[j] when j > i and nums[j] == nums[j-1].'],
  [['backtracking'], 'Generate Parentheses: the two rules?', 'Add "(" if open < n. Add ")" if close < open.'],
  [['backtracking'], 'Permutations: what tracks which numbers are taken?', 'A used set (or boolean array). Add before recursing, remove after.'],
  [['backtracking', 'grid'], 'Word Search on a grid: how to mark visited cheaply?', 'Overwrite board[r][c] with "#" before recursing, restore it after.'],
  [['backtracking'], 'What is pruning?', 'Returning early from a branch that cannot produce a valid answer, e.g. total > target.'],
  [['dp-1d'], 'The 5-part DP recipe?', 'State, transition, base case, fill order, answer cell.'],
  [['dp-1d'], 'Signals that a problem is DP?', '"Number of ways", "min/max", "is it possible", with choices that repeat subproblems.'],
  [['dp-1d'], 'Top-down vs bottom-up?', 'Top-down: recursion + @cache, easy to write. Bottom-up: loop over a table, no recursion limit, easy space cuts.'],
  [['dp-1d', 'complexity'], 'How to get DP time complexity?', 'Number of states × work per state.'],
  [['dp-1d'], 'Climbing Stairs transition?', 'dp[i] = dp[i-1] + dp[i-2]. Last move was 1 or 2 steps.'],
  [['dp-1d'], 'House Robber transition?', 'dp[i] = max(dp[i-1], dp[i-2] + nums[i]). Skip or rob.'],
  [['dp-1d'], 'House Robber II (circle) trick?', 'Run linear robber twice: skip the first house, or skip the last. Take the max.'],
  [['dp-1d'], 'Coin Change transition?', 'dp[i] = min over coins c of 1 + dp[i - c]. Base dp[0] = 0, rest inf.'],
  [['dp-1d', 'greedy'], 'Why not greedy for Coin Change?', 'Coins [1,3,4], amount 6: greedy 4+1+1 = 3 coins, optimal 3+3 = 2.'],
  [['dp-1d'], 'Word Break state?', 'dp[i] = suffix s[i:] can be segmented. dp[len(s)] = True.'],
  [['dp-1d'], 'LIS O(n²) state?', 'longest[i] = LIS starting at i = 1 + max longest[j] for j > i with nums[j] > nums[i].'],
  [['dp-1d', 'binary-search'], 'LIS in O(n log n)?', 'Keep tails array; for each num, bisect_left and replace or append. Length of tails is the answer.'],
  [['dp-1d'], 'Decode Ways transition?', 'dp[i] = dp[i+1] if s[i] != "0", plus dp[i+2] if s[i:i+2] is 10 to 26.'],
  [['dp-1d'], 'How to make 1-D DP O(1) space?', 'If dp[i] only uses the last k cells, keep k rolling variables.'],
  [['dp-2d'], 'LCS transition?', 'Match: 1 + dp[i+1][j+1]. Else max(dp[i+1][j], dp[i][j+1]).'],
  [['dp-2d'], 'Why size (m+1) × (n+1) for LCS?', 'Extra row/col represent the empty suffix, base value 0, so no bounds checks.'],
  [['dp-2d', 'grid'], 'Unique Paths transition?', 'dp[r][c] = dp[r-1][c] + dp[r][c-1]. First row and column are 1.'],
  [['dp-2d'], 'Edit Distance transition on mismatch?', '1 + min(insert, delete, replace) = 1 + min(dp[i][j+1], dp[i+1][j], dp[i+1][j+1]).'],
  [['dp-2d'], '0/1 knapsack 1-D: loop direction for capacity?', 'Backwards, so each item is used at most once. Forward allows reuse (unbounded).'],
  [['dp-2d', 'complexity'], '2-D DP space trick?', 'If row r only needs row r-1, keep one or two rows: O(n) space.'],
  [['greedy'], 'What must be true for greedy to work?', 'A locally best choice never ruins the global optimum. Argue with an exchange argument.'],
  [['greedy'], 'Jump Game greedy?', 'Track farthest reachable. If i > farthest, return False.'],
  [['greedy'], 'Kadane in one line?', 'curr = max(num, curr + num); result = max(result, curr).'],
  [['greedy'], 'Gas Station key fact?', 'If total gas ≥ total cost a start exists. Reset start after any index where the tank dips below 0.'],
  [['intervals'], 'First move on almost any interval problem?', 'Sort by start (merge, insert) or by end (max non-overlapping).'],
  [['intervals'], 'When do [a,b] and [c,d] overlap (sorted, a ≤ c)?', 'c ≤ b. Touching endpoints count as overlap for merge.'],
  [['intervals', 'greedy'], 'Non-overlapping Intervals: sort by?', 'End. Keep the interval that ends first; count the rest as removals.'],
  [['intervals', 'heap'], 'Meeting Rooms II with a heap?', 'Sort by start. Min-heap of end times. Pop while top ≤ start, push end. Max heap size = rooms.'],
  [['bit'], 'n & (n - 1) does what?', 'Clears the lowest set bit. Equals 0 iff n is a power of two (n > 0).'],
  [['bit'], 'XOR facts for Single Number?', 'a ^ a = 0 and a ^ 0 = a. XOR everything; pairs cancel.'],
  [['bit'], 'Get bit i of n?', '(n >> i) & 1. Set it: n | (1 << i). Clear: n & ~(1 << i).'],
  [['bit', 'math'], 'Missing Number in O(1) space?', 'Sum formula n(n+1)/2 minus sum(nums), or XOR indices with values.'],
  [['math'], 'Modulo for huge counts?', 'Apply % (10**9 + 7) after every addition or multiplication in the DP.'],
]

const flashcards = cardData.map(([skills, front, back], i) => ({ id: `paradigms:card:${i + 1}`, skills, front, back }))

const mcqData = [
  [['backtracking', 'complexity'], 2, 'Subsets of n distinct numbers. How many recursive calls in the take/skip tree?', ['n', '2^n', '2^(n+1) - 1', 'n!'], 2, 'A full binary tree of depth n has 2^n leaves and 2^(n+1) - 1 nodes total.'],
  [['backtracking', 'constraints'], 1, 'n ≤ 15. You need every subset. Is O(n · 2^n) OK?', ['No, too slow', 'Yes, about 5·10^5 ops', 'Only with memo', 'Only in C++'], 1, '2^15 · 15 ≈ 491k operations, far under 10^8.'],
  [['backtracking'], 2, 'What happens next in subsets after dfs(i + 1) returns from the take branch?', ['Return immediately', 'curr.pop() then dfs(i + 1) for the skip branch', 'Append nums[i] again', 'result.append(curr)'], 1, 'Unchoose restores curr, then the skip branch explores without nums[i].'],
  [['backtracking'], 2, 'You forget curr.pop() in subsets. Result?', ['Same output', 'Subsets grow too long and are wrong', 'Infinite recursion', 'Fewer subsets but correct'], 1, 'State leaks between branches, so later subsets contain extra elements.'],
  [['backtracking'], 2, 'Combination Sum calls dfs(i, ...) after taking nums[i] instead of dfs(i + 1, ...). Why?', ['Bug, should be i + 1', 'Numbers can be reused', 'To prune', 'To sort'], 1, 'Staying at i lets the same number be chosen again.'],
  [['backtracking'], 3, 'Combination Sum II (each number once, input has duplicates). Key change?', ['Use a set of results only', 'Sort and skip nums[j] == nums[j-1] at the same level, recurse with j+1', 'Use BFS', 'Use DP'], 1, 'Sorting groups duplicates; skipping equal siblings avoids duplicate combos, j+1 prevents reuse.'],
  [['backtracking', 'complexity'], 2, 'Permutations of 8 items: number of leaves?', ['256', '40320', '64', '16777216'], 1, '8! = 40320.'],
  [['backtracking'], 2, 'Generate Parentheses with n=3. Which prefix is never built?', ['"(("', '"()("', '"())"', '"(()"'], 2, 'close < open is required to add ")". "())" would need close 2 with open 1.'],
  [['backtracking', 'grid'], 3, 'Word Search: why restore board[r][c] after recursing?', ['Saves memory', 'Other paths may use that cell', 'Python requires it', 'Avoids index errors'], 1, 'The cell is only blocked for the current path; sibling paths must see it again.'],
  [['backtracking', 'ds-diagnosis'], 2, 'Permutations: best structure to check "already used" in O(1)?', ['List scan', 'Set or boolean array', 'Heap', 'Stack'], 1, 'Set membership is O(1); scanning curr is O(n).'],
  [['backtracking', 'dp-1d'], 2, '"Return all ways to partition s into palindromes." Paradigm?', ['DP only', 'Backtracking (optionally with a palindrome table)', 'Greedy', 'Sliding window'], 1, 'You must list every partition, so search all branches. DP can precompute isPalindrome.'],
  [['backtracking', 'complexity'], 3, 'N-Queens: why is it faster than n^n in practice?', ['Memoization', 'Pruning with column and diagonal sets', 'Sorting', 'Bit DP only'], 1, 'Each row picks a column not attacked; sets cut most branches early.'],
  [['dp-1d'], 1, 'Which phrase most strongly suggests DP?', ['"Return all combinations"', '"Number of ways to reach"', '"Find the k-th largest"', '"Shortest path in unweighted graph"'], 1, 'Counting ways with overlapping choices is classic DP.'],
  [['dp-1d', 'complexity'], 1, 'Coin Change with amount A and k coins, bottom-up. Time?', ['O(A)', 'O(A · k)', 'O(k^A)', 'O(A log k)'], 1, 'A states, each tries k coins.'],
  [['dp-1d'], 2, 'Coin Change: why initialize dp to infinity?', ['Faster', 'Marks unreachable amounts so min works', 'Python needs it', 'To count ways'], 1, 'inf is the identity for min and signals impossible amounts, returned as -1.'],
  [['dp-1d'], 2, 'House Robber: nums = [2,7,9,3,1]. dp[2] = ?', ['9', '11', '7', '16'], 1, 'max(dp[1]=7, dp[0]+9=11) = 11.'],
  [['dp-1d'], 2, 'Climbing Stairs, n=5. Answer?', ['5', '8', '13', '10'], 1, 'Sequence 1, 2, 3, 5, 8 for n = 1..5.'],
  [['dp-1d'], 2, 'Top-down fib with @cache. Time for n?', ['O(2^n)', 'O(n)', 'O(n log n)', 'O(n²)'], 1, 'n distinct states, each computed once in O(1).'],
  [['dp-1d'], 3, 'Python top-down DP with n = 10^5 crashes. Likely cause?', ['Cache too big', 'Recursion depth limit', 'Integer overflow', 'Slow dict'], 1, 'Default recursion limit is ~1000. Go bottom-up or raise the limit.'],
  [['dp-1d'], 2, 'Word Break fills dp from right to left because…', ['It is faster', 'dp[i] needs dp[i + len(word)], which must be ready', 'Strings are reversed', 'No reason'], 1, 'Fill order must respect dependencies.'],
  [['dp-1d'], 2, 'Word Break: s = "leetcode", dict = ["leet","code"]. dp[4] is…', ['False', 'True', 'Undefined', '4'], 1, 's[4:] = "code" is a word and dp[8] = True.'],
  [['dp-1d'], 3, 'LIS O(n²) on [10,9,2,5,3,7,101,18]. Answer?', ['3', '4', '5', '2'], 1, 'For example 2,3,7,101 or 2,5,7,18.'],
  [['dp-1d', 'binary-search'], 3, 'LIS with n ≤ 10^5. Which approach?', ['O(n²) DP', 'Tails array + bisect, O(n log n)', 'Backtracking', 'Sort then count'], 1, '10^10 ops is too slow; patience sorting with binary search fits.'],
  [['dp-1d'], 2, 'Decode Ways: s = "06". Answer?', ['1', '0', '2', '6'], 1, 'Leading zero cannot be decoded, and "06" is not 10..26.'],
  [['dp-1d', 'complexity'], 2, 'House Robber needs only dp[i-1] and dp[i-2]. Best space?', ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'], 1, 'Two rolling variables suffice.'],
  [['dp-1d'], 3, 'House Robber II (circular). Why two runs?', ['Speed', 'First and last are adjacent; exclude one of them each run', 'To count ways', 'Handles negatives'], 1, 'Splitting into nums[1:] and nums[:-1] removes the circular conflict.'],
  [['dp-2d', 'complexity'], 1, 'LCS of lengths m and n. Time?', ['O(m + n)', 'O(m · n)', 'O(2^(m+n))', 'O(m log n)'], 1, 'One cell per pair (i, j), O(1) each.'],
  [['dp-2d'], 2, 'LCS: text1[i] == text2[j]. dp[i][j] = ?', ['max(dp[i+1][j], dp[i][j+1])', '1 + dp[i+1][j+1]', 'dp[i+1][j+1]', '1 + max(...)'], 1, 'Both characters are used, so advance both and add one.'],
  [['dp-2d'], 2, 'Unique Paths 3 × 3 grid. Answer?', ['4', '6', '9', '3'], 1, 'C(4,2) = 6.'],
  [['dp-2d', 'grid'], 2, 'Unique Paths II: obstacle at (r,c). dp[r][c] = ?', ['1', '0', 'dp[r-1][c]', 'inf'], 1, 'No path can pass through an obstacle.'],
  [['dp-2d'], 3, 'Edit Distance: delete from word1 corresponds to which cell (suffix DP)?', ['dp[i][j+1]', 'dp[i+1][j]', 'dp[i+1][j+1]', 'dp[i][j]'], 1, 'Deleting word1[i] advances i only.'],
  [['dp-2d'], 3, '0/1 knapsack with 1-D dp: inner capacity loop goes…', ['Forward', 'Backward', 'Either', 'Random'], 1, 'Backward ensures dp[c - w] still holds the previous item\'s row.'],
  [['dp-2d', 'constraints'], 2, 'Two strings, each length ≤ 1000. O(m·n) DP?', ['Too slow', 'Fine, 10^6 cells', 'Needs bitset', 'Needs greedy'], 1, '10^6 operations is tiny.'],
  [['greedy'], 2, 'Jump Game [3,2,1,0,4]. At i = 4, farthest = 3. Result?', ['True', 'False', 'Error', 'Depends'], 1, 'i > farthest means index 4 is unreachable.'],
  [['greedy', 'complexity'], 1, 'Jump Game greedy time and space?', ['O(n²), O(n)', 'O(n), O(1)', 'O(n log n), O(1)', 'O(n), O(n)'], 1, 'One pass with one variable.'],
  [['greedy'], 2, 'Kadane: when does curr reset to num?', ['When num < 0', 'When curr + num < num, i.e. curr < 0', 'Every step', 'Never'], 1, 'A negative running sum only hurts what follows.'],
  [['greedy'], 3, 'How do you justify a greedy choice in an interview?', ['It passed examples', 'Exchange argument: swapping in my choice never worsens an optimal answer', 'It is fast', 'Big-O'], 1, 'Show any optimal solution can be transformed to include the greedy choice.'],
  [['greedy', 'dp-1d'], 2, 'Coins [1,5,10,25], US style. Greedy works. Coins [1,3,4]?', ['Greedy works', 'Greedy fails for 6', 'Greedy fails for 4', 'Both work'], 1, 'Greedy picks 4+1+1; optimal is 3+3.'],
  [['greedy'], 2, 'Gas Station: tank goes negative at index 4 starting from 0. Next candidate start?', ['1', '5', '4', '0 again'], 1, 'Any start in 0..4 also fails at 4, so try 5.'],
  [['greedy', 'heap'], 3, 'Task Scheduler / Hand of Straights style problems usually pair greedy with…', ['A stack', 'A heap or counter of what is most/least urgent', 'Union-Find', 'A trie'], 1, 'Greedy needs fast access to the current best choice.'],
  [['intervals'], 1, 'Merge Intervals first step?', ['Sort by end', 'Sort by start', 'Build a heap', 'Hash starts'], 1, 'Sorting by start puts overlaps next to each other.'],
  [['intervals'], 2, 'Merging [1,10] then [2,3]. New end?', ['3', '10', '13', '2'], 1, 'max(10, 3) = 10. Forgetting max breaks nested intervals.'],
  [['intervals', 'complexity'], 1, 'Merge Intervals time?', ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], 1, 'Sort dominates the linear sweep.'],
  [['intervals', 'heap'], 2, 'Meeting Rooms II: what does the heap store?', ['Start times', 'End times of rooms in use', 'Durations', 'Meeting ids'], 1, 'The earliest ending room is the one that frees first.'],
  [['intervals', 'heap'], 2, 'Meetings [[0,30],[5,10],[15,20]]. Rooms?', ['1', '2', '3', '0'], 1, '[15,20] reuses the room freed at 10.'],
  [['intervals', 'greedy'], 3, 'Non-overlapping Intervals: minimum removals. Sort by?', ['Start, keep longer', 'End, keep earliest end', 'Length', 'Start, keep earliest start'], 1, 'Earliest end leaves the most room for later intervals.'],
  [['intervals'], 2, 'Meeting Rooms I (can attend all?). After sorting, check…', ['Any start[i] < end[i-1]', 'Sum of lengths', 'Heap size', 'start[0] == 0'], 0, 'Any meeting starting before the previous ends is a conflict.'],
  [['bit'], 1, 'XOR of [4,1,2,1,2]?', ['0', '4', '1', '10'], 1, 'Pairs cancel; 4 remains.'],
  [['bit', 'complexity'], 2, 'Counting set bits with n &= n - 1 runs how many times?', ['32 always', 'Number of set bits', 'log n', 'n'], 1, 'Each iteration clears exactly one 1 bit.'],
  [['bit'], 2, 'Iterating mask from 0 to (1 << n) - 1 enumerates…', ['Permutations', 'All subsets of n items', 'Pairs', 'Primes'], 1, 'Each bit pattern selects a subset; 2^n masks.'],
]

const rotate = (choices, answer, shift) => ({
  choices: choices.map((_, k) => choices[(k - shift + choices.length) % choices.length]),
  answer: (answer + shift) % choices.length,
})

const mcqs = mcqData.map(([skills, difficulty, q, choices, answer, why], i) => ({
  id: `paradigms:mcq:${i + 1}`,
  skills,
  difficulty,
  q,
  ...rotate(choices, answer, (i * 3 + 2) % 4),
  why,
}))

const clozes = [
  {
    id: 'paradigms:cloze:1',
    skills: ['backtracking'],
    title: 'Subsets',
    code: `def dfs(i):
    if i == [[len(nums)]]:
        result.append(curr.[[copy()]])
        return

    curr.append(nums[i])
    dfs(i + 1)
    curr.[[pop()]]
    dfs([[i + 1|i+1]])`,
    hint: 'Choose, explore, unchoose, skip.',
  },
  {
    id: 'paradigms:cloze:2',
    skills: ['backtracking'],
    title: 'Combination Sum',
    code: `def dfs(i, curr, total):
    if total == target:
        answer.append(curr.copy())
        return
    if i >= len(nums) or total [[>]] target:
        return

    curr.append(nums[i])
    dfs([[i]], curr, total + nums[i])
    curr.pop()
    dfs([[i + 1|i+1]], curr, total)`,
    hint: 'Reuse allowed on the take branch.',
  },
  {
    id: 'paradigms:cloze:3',
    skills: ['backtracking'],
    title: 'Generate Parentheses rules',
    code: `if openCount < [[n]]:
    curr.append("(")
    dfs(openCount + 1, closeCount)
    curr.pop()

if closeCount < [[openCount]]:
    curr.append(")")
    dfs(openCount, [[closeCount + 1|closeCount+1]])
    curr.pop()`,
  },
  {
    id: 'paradigms:cloze:4',
    skills: ['dp-1d'],
    title: 'Coin Change',
    code: `dp = [0] + [math.inf] * [[amount]]

for i in range(1, amount + 1):
    for c in coins:
        if i - c >= 0:
            dp[i] = [[min]](dp[i], 1 + dp[i - [[c]]])

return dp[amount] if dp[amount] != math.inf else [[-1]]`,
  },
  {
    id: 'paradigms:cloze:5',
    skills: ['dp-1d'],
    title: 'House Robber',
    code: `dp = [0] * len(nums)
dp[0] = nums[0]
dp[1] = [[max]](nums[0], nums[1])

for i in range(2, len(nums)):
    dp[i] = max(dp[i - [[1]]], dp[i - [[2]]] + nums[i])

return dp[-1]`,
  },
  {
    id: 'paradigms:cloze:6',
    skills: ['dp-1d'],
    title: 'Top-down climbing stairs',
    code: `from functools import [[cache]]

@cache
def dfs(i):
    if i <= 2:
        return [[i]]
    return dfs(i - 1) + [[dfs(i - 2)]]`,
  },
  {
    id: 'paradigms:cloze:7',
    skills: ['dp-2d'],
    title: 'LCS',
    code: `dp = [[0] * (len(text2) + 1) for _ in range(len(text1) + 1)]

for i in range(len(text1) - 1, -1, -1):
    for j in range(len(text2) - 1, -1, -1):
        if text1[i] == text2[j]:
            dp[i][j] = [[1]] + dp[i + 1][j + [[1]]]
        else:
            dp[i][j] = [[max]](dp[i + 1][j], dp[i][j + 1])

return dp[0][0]`,
  },
  {
    id: 'paradigms:cloze:8',
    skills: ['dp-1d'],
    title: 'Word Break',
    code: `dp = [False] * (len(s) + 1)
dp[len(s)] = [[True]]

for i in range(len(s) - 1, -1, -1):
    for word in wordDict:
        if i + len(word) <= len(s) and s[i:i + len(word)] == word:
            dp[i] = dp[i + [[len(word)]]]
        if dp[i]:
            [[break]]

return dp[0]`,
  },
  {
    id: 'paradigms:cloze:9',
    skills: ['greedy'],
    title: 'Jump Game',
    code: `farthest = 0

for i in range(len(nums)):
    if i [[>]] farthest:
        return [[False]]
    farthest = max(farthest, [[i + nums[i]|nums[i] + i]])

return True`,
  },
  {
    id: 'paradigms:cloze:10',
    skills: ['intervals'],
    title: 'Merge Intervals',
    code: `intervals.[[sort]](key = lambda i: i[0])

output = []

for start, end in intervals:
    if output and start [[<=]] output[-1][1]:
        output[-1][1] = [[max]](end, output[-1][1])
    else:
        output.append([start, end])`,
  },
  {
    id: 'paradigms:cloze:11',
    skills: ['intervals', 'heap'],
    title: 'Meeting Rooms II',
    code: `intervals.sort(key = lambda i: i[0])
heap = []
result = 0

for start, end in intervals:
    while heap and heap[0] [[<=]] start:
        heapq.[[heappop]](heap)
    heapq.heappush(heap, [[end]])
    result = max(result, [[len(heap)]])`,
  },
  {
    id: 'paradigms:cloze:12',
    skills: ['bit'],
    title: 'Bits: count ones and single number',
    code: `count = 0
while n:
    n &= [[n - 1|n-1]]
    count += 1

result = 0
for num in nums:
    result [[^=]] num`,
  },
]

const parsons = [
  {
    id: 'paradigms:parsons:1',
    skills: ['backtracking'],
    title: 'Subsets',
    lines: [
      'def dfs(i):',
      '    if i == len(nums):',
      '        result.append(curr.copy())',
      '        return',
      '    curr.append(nums[i])',
      '    dfs(i + 1)',
      '    curr.pop()',
      '    dfs(i + 1)',
      'dfs(0)',
    ],
    distractors: ['        result.append(curr)'],
  },
  {
    id: 'paradigms:parsons:2',
    skills: ['backtracking'],
    title: 'Permutations with a used set',
    lines: [
      'def dfs():',
      '    if len(curr) == len(nums):',
      '        result.append(curr.copy())',
      '        return',
      '    for num in nums:',
      '        if num in used:',
      '            continue',
      '        used.add(num)',
      '        curr.append(num)',
      '        dfs()',
      '        curr.pop()',
      '        used.remove(num)',
    ],
    distractors: ['        dfs(i + 1)'],
  },
  {
    id: 'paradigms:parsons:3',
    skills: ['dp-1d'],
    title: 'Coin Change bottom-up',
    lines: [
      'dp = [0] + [math.inf] * amount',
      'for i in range(1, amount + 1):',
      '    for c in coins:',
      '        if i - c >= 0:',
      '            dp[i] = min(dp[i], 1 + dp[i - c])',
      'return dp[amount] if dp[amount] != math.inf else -1',
    ],
    distractors: ['            dp[i] = max(dp[i], 1 + dp[i - c])'],
  },
  {
    id: 'paradigms:parsons:4',
    skills: ['dp-2d'],
    title: 'Unique Paths',
    lines: [
      'def uniquePaths(self, m: int, n: int) -> int:',
      '    dp = [[1] * n for _ in range(m)]',
      '    for r in range(1, m):',
      '        for c in range(1, n):',
      '            dp[r][c] = dp[r - 1][c] + dp[r][c - 1]',
      '    return dp[m - 1][n - 1]',
    ],
    distractors: ['    dp = [[1] * n] * m'],
  },
  {
    id: 'paradigms:parsons:5',
    skills: ['dp-1d'],
    title: 'House Robber O(1) space',
    lines: [
      'def rob(self, nums: List[int]) -> int:',
      '    prev, curr = 0, 0',
      '    for num in nums:',
      '        prev, curr = curr, max(curr, prev + num)',
      '    return curr',
    ],
    distractors: ['        prev, curr = curr, curr + num'],
  },
  {
    id: 'paradigms:parsons:6',
    skills: ['intervals'],
    title: 'Merge Intervals',
    lines: [
      'def merge(self, intervals: List[List[int]]) -> List[List[int]]:',
      '    intervals.sort(key = lambda i: i[0])',
      '    output = []',
      '    for start, end in intervals:',
      '        if output and start <= output[-1][1]:',
      '            output[-1][1] = max(end, output[-1][1])',
      '        else:',
      '            output.append([start, end])',
      '    return output',
    ],
    distractors: ['            output[-1][1] = end'],
  },
  {
    id: 'paradigms:parsons:7',
    skills: ['intervals', 'heap'],
    title: 'Meeting Rooms II',
    lines: [
      'intervals.sort(key = lambda i: i[0])',
      'heap = []',
      'result = 0',
      'for start, end in intervals:',
      '    while heap and heap[0] <= start:',
      '        heapq.heappop(heap)',
      '    heapq.heappush(heap, end)',
      '    result = max(result, len(heap))',
      'return result',
    ],
    distractors: ['    heapq.heappush(heap, start)'],
  },
  {
    id: 'paradigms:parsons:8',
    skills: ['dp-1d', 'binary-search'],
    title: 'LIS in O(n log n)',
    lines: [
      'def lengthOfLIS(self, nums: List[int]) -> int:',
      '    tails = []',
      '    for num in nums:',
      '        i = bisect.bisect_left(tails, num)',
      '        if i == len(tails):',
      '            tails.append(num)',
      '        else:',
      '            tails[i] = num',
      '    return len(tails)',
    ],
    distractors: ['        i = bisect.bisect_right(tails, num)'],
  },
]

const problems = [
  {
    id: 'paradigms:problem:subsets',
    lc: 78,
    title: 'Subsets',
    difficulty: 'Medium',
    google: true,
    skills: ['backtracking'],
    pattern: 'Backtracking (take / skip)',
    ds: ['list', 'recursion'],
    constraints: '1 ≤ n ≤ 10, distinct',
    time: 'O(n · 2^n)',
    space: 'O(n)',
    insight: 'Each element is a yes/no decision. Leaves of the decision tree are the subsets.',
    signals: ['all subsets', 'power set', 'n ≤ 10'],
    narration: [
      'Distinct numbers, any order is fine, include the empty set?',
      'Each element has two choices, so a binary decision tree.',
      'DFS with choose, explore, unchoose; copy at each leaf.',
      'O(n·2^n) time, O(n) stack.',
    ],
    solution: subsetsCode,
    traceId: 'paradigms:trace:subsets',
    pitfalls: ['Appending curr without copy', 'Forgetting the empty subset'],
  },
  {
    id: 'paradigms:problem:combination-sum',
    lc: 39,
    title: 'Combination Sum',
    difficulty: 'Medium',
    google: true,
    skills: ['backtracking'],
    pattern: 'Backtracking with reuse',
    ds: ['list', 'recursion'],
    constraints: '1 ≤ n ≤ 30, 2 ≤ nums[i] ≤ 40, target ≤ 40',
    time: 'O(2^(t/m))',
    space: 'O(t/m)',
    insight: 'Take nums[i] and stay at i, or skip to i+1. Forward-only kills duplicate orderings.',
    signals: ['all unique combinations', 'same number unlimited times', 'sum to target'],
    narration: [
      'All positive? Can numbers repeat? Order irrelevant?',
      'Backtrack: take nums[i] again or move on.',
      'Prune when total exceeds target.',
      'Exponential in target / min number, depth ≤ target / min.',
    ],
    solution: combinationCode,
    traceId: 'paradigms:trace:combination-sum',
    pitfalls: ['Looping from 0 each call creates duplicate permutations', 'No prune on total > target'],
  },
  {
    id: 'paradigms:problem:permutations',
    lc: 46,
    title: 'Permutations',
    difficulty: 'Medium',
    google: true,
    skills: ['backtracking'],
    pattern: 'Backtracking with used set',
    ds: ['set', 'recursion'],
    constraints: '1 ≤ n ≤ 6, distinct',
    time: 'O(n · n!)',
    space: 'O(n)',
    insight: 'Each level fills one slot with any unused number.',
    signals: ['all possible orderings', 'n ≤ 6'],
    narration: [
      'Distinct integers, return in any order.',
      'Fill slots left to right, skip numbers already used.',
      'Add to used and curr, recurse, then undo both.',
      'n! permutations, O(n) each to copy.',
    ],
    solution: permuteCode,
    traceId: 'paradigms:trace:permutations',
    pitfalls: ['Undo only curr but not used', 'Duplicates in input need sorting and sibling skip'],
  },
  {
    id: 'paradigms:problem:generate-parentheses',
    lc: 22,
    title: 'Generate Parentheses',
    difficulty: 'Medium',
    google: true,
    skills: ['backtracking'],
    pattern: 'Constrained backtracking',
    ds: ['list', 'recursion'],
    constraints: '1 ≤ n ≤ 8',
    time: 'O(4^n / √n)',
    space: 'O(n)',
    insight: 'Open if open < n, close if close < open. Never build an invalid prefix.',
    signals: ['all combinations of well-formed', 'n pairs'],
    narration: [
      'Return every valid string of n pairs.',
      'Track open and close counts, two guarded choices.',
      'Length 2n means valid by construction.',
      'Output size is the Catalan number.',
    ],
    solution: parensCode,
    traceId: 'paradigms:trace:generate-parentheses',
    pitfalls: ['Generating all 2^(2n) strings and filtering'],
  },
  {
    id: 'paradigms:problem:climbing-stairs',
    lc: 70,
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    google: false,
    skills: ['dp-1d'],
    pattern: '1-D DP (Fibonacci)',
    ds: ['array'],
    constraints: '1 ≤ n ≤ 45',
    time: 'O(n)',
    space: 'O(1)',
    insight: 'Ways to i = ways to i-1 + ways to i-2.',
    signals: ['how many distinct ways', '1 or 2 steps'],
    narration: [
      'dp[i] = ways to reach step i.',
      'Last move was 1 or 2 steps, so add the two before.',
      'Base dp[1] = 1, dp[2] = 2.',
      'O(n) time, O(1) with two variables.',
    ],
    solution: `class Solution:
    def climbStairs(self, n: int) -> int:

        if n <= 2:
            return n

        prev, curr = 1, 2

        for i in range(3, n + 1):
            prev, curr = curr, prev + curr

        return curr`,
    traceId: 'paradigms:trace:climbing-stairs',
    pitfalls: ['Plain recursion without cache is O(2^n)'],
  },
  {
    id: 'paradigms:problem:house-robber',
    lc: 198,
    title: 'House Robber',
    difficulty: 'Medium',
    google: true,
    skills: ['dp-1d'],
    pattern: '1-D DP (skip or take)',
    ds: ['array'],
    constraints: '1 ≤ n ≤ 100, 0 ≤ nums[i] ≤ 400',
    time: 'O(n)',
    space: 'O(n)',
    insight: 'Best at i = max(skip i, rob i + best at i-2).',
    signals: ['maximum amount', 'cannot pick adjacent'],
    narration: [
      'Non-negative values, at least one house?',
      'dp[i] = best using houses up to i.',
      'Skip: dp[i-1]. Rob: dp[i-2] + nums[i].',
      'O(n) time, O(1) possible with two variables.',
    ],
    solution: robCode,
    traceId: 'paradigms:trace:house-robber',
    pitfalls: ['n == 1 index error on nums[1]'],
  },
  {
    id: 'paradigms:problem:coin-change',
    lc: 322,
    title: 'Coin Change',
    difficulty: 'Medium',
    google: true,
    skills: ['dp-1d'],
    pattern: 'Unbounded knapsack DP',
    ds: ['array'],
    constraints: '1 ≤ coins ≤ 12, 0 ≤ amount ≤ 10^4',
    time: 'O(amount · k)',
    space: 'O(amount)',
    insight: 'Greedy fails. dp[i] = 1 + min dp[i - c].',
    signals: ['fewest number of coins', 'infinite number of each', 'return -1'],
    narration: [
      'Unlimited coins, return -1 if impossible.',
      'Greedy breaks on 1,3,4 for 6, so DP.',
      'dp[i] = min coins for i, base dp[0] = 0.',
      'O(amount × coins) time, O(amount) space.',
    ],
    solution: coinCode,
    traceId: 'paradigms:trace:coin-change',
    pitfalls: ['Returning inf instead of -1', 'amount = 0 should return 0'],
  },
  {
    id: 'paradigms:problem:lcs',
    lc: 1143,
    title: 'Longest Common Subsequence',
    difficulty: 'Medium',
    google: true,
    skills: ['dp-2d'],
    pattern: '2-D DP on two strings',
    ds: ['2-D array'],
    constraints: '1 ≤ m, n ≤ 1000',
    time: 'O(m · n)',
    space: 'O(m · n)',
    insight: 'Match → diagonal + 1. Mismatch → best of dropping one char.',
    signals: ['two strings', 'subsequence', 'longest common'],
    narration: [
      'Subsequence, not substring, so gaps allowed.',
      'dp[i][j] = LCS of text1[i:] and text2[j:].',
      'Fill from the bottom-right so deps are ready.',
      'O(m·n) time and space, one row for O(n).',
    ],
    solution: lcsCode,
    traceId: 'paradigms:trace:lcs',
    pitfalls: ['Off-by-one without the extra empty row/column'],
  },
  {
    id: 'paradigms:problem:unique-paths',
    lc: 62,
    title: 'Unique Paths',
    difficulty: 'Medium',
    google: true,
    skills: ['dp-2d', 'grid'],
    pattern: 'Grid DP',
    ds: ['2-D array'],
    constraints: '1 ≤ m, n ≤ 100',
    time: 'O(m · n)',
    space: 'O(m · n)',
    insight: 'Paths into a cell = paths from above + paths from left.',
    signals: ['only move down or right', 'how many unique paths'],
    narration: [
      'Only right and down moves.',
      'dp[r][c] = dp[r-1][c] + dp[r][c-1].',
      'Edges have exactly one path.',
      'O(m·n), one row gives O(n) space.',
    ],
    solution: pathsCode,
    traceId: 'paradigms:trace:unique-paths',
    pitfalls: ['[[1] * n] * m aliases rows'],
  },
  {
    id: 'paradigms:problem:word-break',
    lc: 139,
    title: 'Word Break',
    difficulty: 'Medium',
    google: true,
    skills: ['dp-1d'],
    pattern: 'Suffix DP over positions',
    ds: ['array', 'set'],
    constraints: '1 ≤ |s| ≤ 300, ≤ 1000 words, word length ≤ 20',
    time: 'O(n · w · L)',
    space: 'O(n)',
    insight: 'dp[i] true if some word matches at i and dp[i + len] is true.',
    signals: ['segmented into dictionary words', 'reused multiple times'],
    narration: [
      'Words reusable, return just True/False.',
      'dp[i] = suffix from i can be split.',
      'Try each word at i, check the rest.',
      'O(n·w·L) time, O(n) space.',
    ],
    solution: wordBreakCode,
    traceId: 'paradigms:trace:word-break',
    pitfalls: ['Plain recursion without memo is exponential'],
  },
  {
    id: 'paradigms:problem:lis',
    lc: 300,
    title: 'Longest Increasing Subsequence',
    difficulty: 'Medium',
    google: true,
    skills: ['dp-1d', 'binary-search'],
    pattern: '1-D DP (O(n²)) or patience sort',
    ds: ['array'],
    constraints: '1 ≤ n ≤ 2500',
    time: 'O(n²)',
    space: 'O(n)',
    insight: 'LIS from i = 1 + best LIS from any later bigger element.',
    signals: ['strictly increasing subsequence', 'longest', 'n ≤ 2500'],
    narration: [
      'Strictly increasing, subsequence so gaps allowed.',
      'longest[i] = LIS starting at i.',
      'Scan j > i with nums[j] > nums[i].',
      'O(n²) fits 2500; mention tails + bisect for O(n log n).',
    ],
    solution: lisCode,
    traceId: 'paradigms:trace:lis',
    pitfalls: ['Using >= breaks strictness'],
  },
  {
    id: 'paradigms:problem:merge-intervals',
    lc: 56,
    title: 'Merge Intervals',
    difficulty: 'Medium',
    google: true,
    skills: ['intervals'],
    pattern: 'Sort + sweep',
    ds: ['array'],
    constraints: '1 ≤ n ≤ 10^4',
    time: 'O(n log n)',
    space: 'O(n)',
    insight: 'After sorting by start, only the last merged interval can overlap.',
    signals: ['merge all overlapping', 'intervals'],
    narration: [
      'Do touching intervals like [1,4],[4,5] merge? Yes.',
      'Sort by start.',
      'Extend last if start ≤ its end, else append.',
      'O(n log n) sort, O(n) output.',
    ],
    solution: mergeCode,
    traceId: 'paradigms:trace:merge-intervals',
    pitfalls: ['Setting end instead of max(end, last end)'],
  },
  {
    id: 'paradigms:problem:meeting-rooms-ii',
    lc: 253,
    title: 'Meeting Rooms II',
    difficulty: 'Medium',
    google: true,
    skills: ['intervals', 'heap'],
    pattern: 'Sort + min-heap of end times',
    ds: ['heap'],
    constraints: '1 ≤ n ≤ 10^4',
    time: 'O(n log n)',
    space: 'O(n)',
    insight: 'Heap top is the room that frees first. Heap size is rooms in use.',
    signals: ['minimum number of rooms', 'overlapping meetings'],
    narration: [
      'Does a meeting ending at 10 free the room for one starting at 10? Yes.',
      'Sort by start, min-heap of end times.',
      'Pop finished rooms, push current end, track max size.',
      'O(n log n) time, O(n) heap.',
    ],
    solution: roomsCode,
    traceId: 'paradigms:trace:meeting-rooms-ii',
    pitfalls: ['Using < vs <= for back-to-back meetings'],
  },
  {
    id: 'paradigms:problem:jump-game',
    lc: 55,
    title: 'Jump Game',
    difficulty: 'Medium',
    google: true,
    skills: ['greedy'],
    pattern: 'Greedy reach',
    ds: ['array'],
    constraints: '1 ≤ n ≤ 10^4',
    time: 'O(n)',
    space: 'O(1)',
    insight: 'Only the farthest reachable index matters.',
    signals: ['maximum jump length', 'can you reach the last index'],
    narration: [
      'Values are max jump, not exact jump.',
      'Track farthest reachable index.',
      'If i passes it, stuck.',
      'O(n) time, O(1) space; DP would be O(n²).',
    ],
    solution: jumpCode,
    traceId: 'paradigms:trace:jump-game',
    pitfalls: ['Treating nums[i] as an exact jump'],
  },
  {
    id: 'paradigms:problem:non-overlapping-intervals',
    lc: 435,
    title: 'Non-overlapping Intervals',
    difficulty: 'Medium',
    google: true,
    skills: ['intervals', 'greedy'],
    pattern: 'Greedy by end',
    ds: ['array'],
    constraints: '1 ≤ n ≤ 10^5',
    time: 'O(n log n)',
    space: 'O(1)',
    insight: 'Keep the interval that ends first; every conflict is one removal.',
    signals: ['minimum number to remove', 'non-overlapping'],
    narration: [
      'Touching endpoints do not overlap here.',
      'Sort by end, keep earliest finisher.',
      'Count conflicts as removals.',
      'O(n log n) time.',
    ],
    solution: `class Solution:
    def eraseOverlapIntervals(self, intervals: List[List[int]]) -> int:

        intervals.sort(key = lambda i: i[1])

        result = 0
        prevEnd = intervals[0][1]

        for start, end in intervals[1:]:
            if start < prevEnd:
                result += 1
            else:
                prevEnd = end

        return result`,
    pitfalls: ['Sorting by start without keeping the smaller end'],
  },
  {
    id: 'paradigms:problem:counting-bits',
    lc: 338,
    title: 'Counting Bits',
    difficulty: 'Easy',
    google: false,
    skills: ['bit', 'dp-1d'],
    pattern: 'Bit DP',
    ds: ['array'],
    constraints: '0 ≤ n ≤ 10^5',
    time: 'O(n)',
    space: 'O(n)',
    insight: 'bits(i) = bits(i >> 1) + (i & 1).',
    signals: ['number of 1 bits for every i', 'linear time'],
    narration: [
      'Return counts for 0..n.',
      'Shifting right drops the last bit, already solved.',
      'Add back that last bit.',
      'O(n) time.',
    ],
    solution: `class Solution:
    def countBits(self, n: int) -> List[int]:

        answer = [0] * (n + 1)

        for i in range(1, n + 1):
            answer[i] = answer[i >> 1] + (i & 1)

        return answer`,
  },
]

const paradigmShapes = [
  ['List all subsets', 20, 'Backtracking O(n·2^n)', ['backtracking']],
  ['List all orderings', 9, 'Backtracking O(n·n!)', ['backtracking']],
  ['Count ways to climb n stairs', 100000, '1-D DP O(n)', ['dp-1d']],
  ['Fewest coins for amount', 10000, 'DP O(amount·k)', ['dp-1d']],
  ['LCS of two strings', 1000, '2-D DP O(m·n)', ['dp-2d']],
  ['Merge overlapping intervals', 100000, 'Sort + sweep O(n log n)', ['intervals']],
  ['Can you reach the last index', 100000, 'Greedy O(n)', ['greedy']],
  ['Find the one unpaired number', 100000, 'XOR O(n), O(1) space', ['bit']],
]

const paradigmChoices = ['Backtracking O(n·2^n)', 'Backtracking O(n·n!)', '1-D DP O(n)', 'DP O(amount·k)', '2-D DP O(m·n)', 'Sort + sweep O(n log n)', 'Greedy O(n)', 'XOR O(n), O(1) space']

const generators = [
  {
    id: 'paradigms:gen:pick-paradigm',
    title: 'Pick the paradigm',
    skills: ['backtracking', 'dp-1d', 'greedy', 'intervals', 'constraints'],
    make(seed) {
      const rand = k => {
        seed = (seed * 9301 + 49297) % 233280
        return Math.floor((seed / 233280) * k)
      }
      const start = seed
      const [task, n, right, skills] = paradigmShapes[Math.abs(start) % paradigmShapes.length]
      const wrong = paradigmChoices.filter(choice => choice !== right)
      const picks = []
      while (picks.length < 3) {
        const choice = wrong[rand(wrong.length)]
        if (!picks.includes(choice)) picks.push(choice)
      }
      const answer = rand(4)
      const choices = [...picks]
      choices.splice(answer, 0, right)
      return {
        id: `paradigms:gen:pick-paradigm:${start}`,
        skills: [...skills, 'constraints'],
        difficulty: 2,
        q: `${task}, n ≤ ${n.toLocaleString('en-US')}. Best approach?`,
        choices,
        answer,
        why: `${right} fits n ≤ ${n.toLocaleString('en-US')} within ~10^8 ops.`,
      }
    },
  },
]

export default {
  id: 'paradigms',
  title: 'Backtracking, DP, Intervals, Greedy',
  icon: 'puzzle',
  skills: ['backtracking', 'dp-1d', 'dp-2d', 'greedy', 'intervals', 'bit', 'math'],
  lessons,
  traces,
  flashcards,
  mcqs,
  clozes,
  parsons,
  problems,
  extras: { generators },
}
