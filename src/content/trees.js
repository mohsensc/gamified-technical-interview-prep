const clone = value => JSON.parse(JSON.stringify(value))

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

const treePanel = (root, state, opts = {}) => ({
  kind: 'tree',
  label: opts.label || 'tree',
  root: root ? clone(root) : null,
  state: { ...state },
  pointers: { ...(opts.pointers || {}) },
  values: { ...(opts.values || {}) },
})

const kit = root => {
  const state = {}
  const values = {}
  const frames = []
  const panels = (cur, extra = []) => [
    treePanel(root, state, { pointers: cur ? { node: cur.id } : {}, values }),
    { kind: 'callstack', label: 'call stack', frames: [...frames] },
    ...extra,
  ]
  return { state, values, frames, panels }
}

const once = () => {
  const used = new Set()
  return (key, text) => {
    if (used.has(key)) return undefined
    used.add(key)
    return text
  }
}

const lessThan = (a, b) => (Array.isArray(a) ? (a[0] !== b[0] ? a[0] < b[0] : a[1] < b[1]) : a < b)

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

const fmtBound = x => (x === Infinity ? '∞' : x === -Infinity ? '-∞' : String(x))

const sample = {
  balanced: [3, 9, 20, null, null, 15, 7],
  full: [1, 2, 3, 4, 5, 6, 7],
  skewed: [1, 2, null, 3, null, 4],
  bst: [5, 3, 8, 1, 4, 7, 9],
  badBst: [5, 4, 6, null, null, 3, 7],
  lcaBst: [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5],
  unbalanced: [1, 2, 2, 3, 3, null, null, 4, 4],
  wide: [1, 2, 3, null, 5, null, 4],
  leftHeavy: [1, 2, 3, 4, null, null, null, 5],
}

const traceMaxDepth = {
  id: 'trees:trace:max-depth',
  title: 'Max depth (recursive DFS)',
  skills: ['tree-dfs', 'communication'],
  problem: 'Return the number of nodes on the longest root-to-leaf path.',
  code: `class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:

        def dfs(node):
            if not node:
                return 0

            left = dfs(node.left)
            right = dfs(node.right)

            return 1 + max(left, right)

        return dfs(root)`,
  complexity: { time: 'O(n)', space: 'O(h)', why: 'Each node visited once; the call stack holds one root-to-node path.' },
  inputs: [
    { label: 'balanced', value: sample.balanced },
    { label: 'full', value: sample.full },
    { label: 'skewed', value: sample.skewed },
  ],
  run(input, t) {
    const root = buildTree(input)
    const { state, values, frames, panels } = kit(root)
    const say = once()
    t.step(13, {
      vars: { root: root ? root.val : 'None' },
      panels: panels(null),
      note: 'Kick off DFS from the root',
      say: say('contract', 'dfs(node) returns the height of the subtree rooted at node. None has height 0.'),
    })
    const dfs = node => {
      frames.push(node ? `dfs(${node.val})` : 'dfs(None)')
      if (!node) {
        t.step(6, { vars: { node: 'None' }, panels: panels(null), note: 'Empty subtree: height 0', say: say('base', 'Base case: an empty subtree contributes 0.') })
        frames.pop()
        return 0
      }
      state[node.id] = 'current'
      t.step(5, { vars: { node: node.val }, panels: panels(node), note: `Enter ${node.val}, not None` })
      state[node.id] = 'path'
      const left = dfs(node.left)
      state[node.id] = 'current'
      t.step(8, { vars: { node: node.val, left }, panels: panels(node), note: `Left subtree of ${node.val} has height ${left}` })
      state[node.id] = 'path'
      const right = dfs(node.right)
      state[node.id] = 'current'
      t.step(9, { vars: { node: node.val, left, right }, panels: panels(node), note: `Right subtree of ${node.val} has height ${right}` })
      const result = 1 + Math.max(left, right)
      values[node.id] = `h=${result}`
      state[node.id] = 'done'
      const isLeaf = !node.left && !node.right
      t.step(11, {
        vars: { node: node.val, left, right, returns: result },
        panels: panels(node),
        note: `Return 1 + max(${left}, ${right}) = ${result}`,
        say: isLeaf
          ? say('leaf', 'A leaf returns 1. Answers bubble up: this is post-order, bottom-up.')
          : say('combine', 'Each node combines its children: one plus the taller side.'),
      })
      frames.pop()
      return result
    }
    const answer = dfs(root)
    t.step(13, {
      vars: { answer },
      panels: panels(null),
      note: `Max depth = ${answer}`,
      say: 'O(n) time, each node once. O(h) space for the call stack: log n balanced, n skewed.',
    })
  },
}

const traceLevelOrder = {
  id: 'trees:trace:level-order',
  title: 'Level order (BFS with queue)',
  skills: ['tree-bfs', 'queue-deque', 'communication'],
  problem: 'Return node values grouped level by level, left to right.',
  code: `from collections import deque

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
  complexity: { time: 'O(n)', space: 'O(w)', why: 'Each node enqueued once; queue holds at most one level (width w, up to n/2).' },
  inputs: [
    { label: 'balanced', value: sample.balanced },
    { label: 'full', value: sample.full },
    { label: 'gappy', value: sample.wide },
  ],
  run(input, t) {
    const root = buildTree(input)
    const state = {}
    const say = once()
    let queue = []
    let level = []
    const result = []
    const panels = (cur, extra = []) => [
      treePanel(root, state, { pointers: cur ? { node: cur.id } : {} }),
      { kind: 'queue', label: 'queue', items: queue.map(n => n.val), highlight: queue.length ? [0] : [] },
      { kind: 'array', label: 'level', values: [...level] },
      { kind: 'text', text: `result = ${JSON.stringify(result)}` },
      ...extra,
    ]
    if (!root) {
      t.step(6, { vars: { root: 'None' }, panels: panels(null), note: 'Empty tree: no levels' })
      return
    }
    queue = [root]
    state[root.id] = 'frontier'
    t.step(9, {
      vars: { queue: [root.val] },
      panels: panels(null),
      note: 'Seed the queue with the root',
      say: say('why', 'Level by level means BFS: a FIFO queue processes nodes in distance order.'),
    })
    let depth = 0
    while (queue.length) {
      level = []
      t.step(12, { vars: { depth, queueSize: queue.length }, panels: panels(null), note: `New level ${depth}: ${queue.length} node(s) waiting` })
      const size = queue.length
      t.step(14, {
        vars: { 'len(queue)': size },
        panels: panels(null),
        note: `Snapshot size = ${size}; pop exactly that many`,
        say: say('snapshot', 'I snapshot len(queue) first, so children added now wait for the next level.'),
      })
      for (let i = 0; i < size; i++) {
        const node = queue.shift()
        state[node.id] = 'current'
        t.step(15, { vars: { node: node.val, i }, panels: panels(node), note: `Pop ${node.val} from the front` })
        level.push(node.val)
        t.step(16, { vars: { node: node.val, level: [...level] }, panels: panels(node), note: `Add ${node.val} to this level` })
        if (node.left) {
          queue.push(node.left)
          state[node.left.id] = 'frontier'
          t.step(19, { vars: { node: node.val }, panels: panels(node), note: `Enqueue left child ${node.left.val}` })
        }
        if (node.right) {
          queue.push(node.right)
          state[node.right.id] = 'frontier'
          t.step(21, {
            vars: { node: node.val },
            panels: panels(node),
            note: `Enqueue right child ${node.right.val}`,
            say: say('fifo', 'Left before right keeps each level in left-to-right order.'),
          })
        }
        state[node.id] = 'done'
      }
      result.push([...level])
      t.step(23, { vars: { level: [...level] }, panels: panels(null), note: `Level ${depth} complete: ${JSON.stringify(level)}` })
      depth++
    }
    t.step(25, {
      vars: { result: clone(result) },
      panels: panels(null),
      note: 'Queue empty: every level collected',
      say: 'O(n) time. O(w) space for the widest level, about n/2 for a full tree.',
    })
  },
}

const traceValidBst = {
  id: 'trees:trace:valid-bst',
  title: 'Validate BST (pass bounds down)',
  skills: ['bst', 'tree-dfs', 'communication'],
  problem: 'Is every node strictly between all ancestors-imposed bounds?',
  code: `class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:

        def validRange(node, low, high):
            if not node:
                return True
            if not low < node.val < high:
                return False
            return validRange(node.left, low, node.val) and validRange(node.right, node.val, high)

        return validRange(root, float('-inf'), float('inf'))`,
  complexity: { time: 'O(n)', space: 'O(h)', why: 'Each node checked once against its (low, high) window.' },
  inputs: [
    { label: 'valid', value: sample.bst },
    { label: 'deep trap', value: sample.badBst },
    { label: 'skewed', value: [3, 2, null, 1] },
  ],
  run(input, t) {
    const root = buildTree(input)
    const { state, values, frames, panels } = kit(root)
    const say = once()
    t.step(11, {
      vars: { low: '-∞', high: '∞' },
      panels: panels(null),
      note: 'Root may be anything: (-∞, ∞)',
      say: say('contract', 'Top-down: I pass the allowed (low, high) window into each call. Parent-only checks miss deep violations.'),
    })
    const valid = (node, low, high) => {
      frames.push(`validRange(${node ? node.val : 'None'}, ${fmtBound(low)}, ${fmtBound(high)})`)
      if (!node) {
        t.step(6, { vars: { node: 'None' }, panels: panels(null), note: 'Empty subtree is valid', say: say('base', 'Base case: an empty subtree is a valid BST.') })
        frames.pop()
        return true
      }
      state[node.id] = 'current'
      values[node.id] = `(${fmtBound(low)},${fmtBound(high)})`
      t.step(7, { vars: { node: node.val, low: fmtBound(low), high: fmtBound(high) }, panels: panels(node), note: `Is ${fmtBound(low)} < ${node.val} < ${fmtBound(high)}?` })
      if (!(low < node.val && node.val < high)) {
        values[node.id] = `✗ (${fmtBound(low)},${fmtBound(high)})`
        t.step(8, {
          vars: { node: node.val, low: fmtBound(low), high: fmtBound(high) },
          panels: panels(node),
          note: `${node.val} breaks its window: invalid`,
          say: say('fail', `${node.val} is fine vs its parent but violates an ancestor bound. That is why bounds travel down.`),
        })
        frames.pop()
        return false
      }
      state[node.id] = 'path'
      t.step(9, {
        vars: { node: node.val },
        panels: panels(node),
        note: `Left gets (${fmtBound(low)},${node.val}), right gets (${node.val},${fmtBound(high)})`,
        say: say('narrow', 'Going left tightens high to node.val; going right tightens low.'),
      })
      const result = valid(node.left, low, node.val) && valid(node.right, node.val, high)
      state[node.id] = result ? 'done' : 'current'
      t.step(9, { vars: { node: node.val, returns: result ? 'True' : 'False' }, panels: panels(node), note: result ? `Subtree at ${node.val} valid` : `Short-circuit: ${node.val} subtree invalid` })
      frames.pop()
      return result
    }
    const answer = valid(root, -Infinity, Infinity)
    t.step(11, {
      vars: { answer: answer ? 'True' : 'False' },
      panels: panels(null),
      note: answer ? 'Valid BST' : 'Not a BST',
      say: 'O(n) time, O(h) space. Strict < handles duplicates as invalid.',
    })
  },
}

const traceLcaBst = {
  id: 'trees:trace:lca-bst',
  title: 'LCA in a BST (split point)',
  skills: ['bst', 'communication'],
  problem: 'Find the lowest node that has both p and q as descendants in a BST.',
  code: `class Solution:
    def lowestCommonAncestor(self, root: TreeNode, p: TreeNode, q: TreeNode) -> TreeNode:
        curr = root

        while curr:
            if p.val < curr.val and q.val < curr.val:
                curr = curr.left
            elif p.val > curr.val and q.val > curr.val:
                curr = curr.right
            else:
                return curr`,
  complexity: { time: 'O(h)', space: 'O(1)', why: 'One root-to-split walk; no recursion needed.' },
  inputs: [
    { label: 'p=2 q=8', value: { tree: sample.lcaBst, p: 2, q: 8 } },
    { label: 'p=2 q=4', value: { tree: sample.lcaBst, p: 2, q: 4 } },
    { label: 'p=3 q=5', value: { tree: sample.lcaBst, p: 3, q: 5 } },
  ],
  run(input, t) {
    const root = buildTree(input.tree)
    const p = findVal(root, input.p)
    const q = findVal(root, input.q)
    const state = {}
    const say = once()
    const values = { [p.id]: 'p', [q.id]: 'q' }
    const panels = curr => [
      treePanel(root, state, { pointers: curr ? { curr: curr.id } : {}, values }),
      { kind: 'text', text: `p = ${p.val}, q = ${q.val}` },
    ]
    let curr = root
    state[curr.id] = 'current'
    t.step(3, {
      vars: { curr: curr.val, p: p.val, q: q.val },
      panels: panels(curr),
      note: 'Start at the root',
      say: say('idea', 'BST ordering tells me which side p and q live on. The LCA is where they split.'),
    })
    while (curr) {
      t.step(5, { vars: { curr: curr.val }, panels: panels(curr), note: `Compare ${p.val} and ${q.val} with ${curr.val}` })
      t.step(6, { vars: { curr: curr.val }, panels: panels(curr), note: `Both smaller than ${curr.val}?` })
      if (p.val < curr.val && q.val < curr.val) {
        state[curr.id] = 'path'
        curr = curr.left
        state[curr.id] = 'current'
        t.step(7, { vars: { curr: curr.val }, panels: panels(curr), note: 'Both on the left: go left', say: say('left', 'Both smaller, so the split is in the left subtree.') })
        continue
      }
      t.step(8, { vars: { curr: curr.val }, panels: panels(curr), note: `Both larger than ${curr.val}?` })
      if (p.val > curr.val && q.val > curr.val) {
        state[curr.id] = 'path'
        curr = curr.right
        state[curr.id] = 'current'
        t.step(9, { vars: { curr: curr.val }, panels: panels(curr), note: 'Both on the right: go right', say: say('right', 'Both larger, so the split is in the right subtree.') })
        continue
      }
      state[curr.id] = 'done'
      t.step(11, {
        vars: { answer: curr.val },
        panels: panels(curr),
        note: `Split (or hit p/q) at ${curr.val}: LCA`,
        say: 'They diverge here, or one equals curr. O(h) time, O(1) space iteratively.',
      })
      return
    }
  },
}

const traceDiameter = {
  id: 'trees:trace:diameter',
  title: 'Diameter (bottom-up heights)',
  skills: ['tree-dfs', 'communication'],
  problem: 'Longest path (in edges) between any two nodes.',
  code: `class Solution:
    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:

        self.best = 0

        def dfs(node):
            if not node:
                return 0

            left = dfs(node.left)
            right = dfs(node.right)

            self.best = max(left + right, self.best)

            return 1 + max(left, right)

        dfs(root)

        return self.best`,
  complexity: { time: 'O(n)', space: 'O(h)', why: 'One post-order pass; global best updated at every node.' },
  inputs: [
    { label: 'classic', value: [1, 2, 3, 4, 5] },
    { label: 'off-root', value: [1, 2, null, 3, 4, 5, null, null, 6] },
    { label: 'balanced', value: sample.balanced },
  ],
  run(input, t) {
    const root = buildTree(input)
    const { state, values, frames, panels } = kit(root)
    const say = once()
    let best = 0
    const extra = () => [{ kind: 'text', text: `best = ${best}` }]
    t.step(4, {
      vars: { best },
      panels: panels(null, extra()),
      note: 'Global best path length',
      say: say('contract', 'dfs returns height, but the answer is a path through a node: left + right. Track it globally.'),
    })
    const dfs = node => {
      frames.push(node ? `dfs(${node.val})` : 'dfs(None)')
      if (!node) {
        t.step(8, { vars: { node: 'None' }, panels: panels(null, extra()), note: 'Empty: height 0' })
        frames.pop()
        return 0
      }
      state[node.id] = 'current'
      t.step(7, { vars: { node: node.val, best }, panels: panels(node, extra()), note: `Enter ${node.val}` })
      state[node.id] = 'path'
      const left = dfs(node.left)
      state[node.id] = 'current'
      t.step(10, { vars: { node: node.val, left }, panels: panels(node, extra()), note: `Left height ${left}` })
      state[node.id] = 'path'
      const right = dfs(node.right)
      state[node.id] = 'current'
      t.step(11, { vars: { node: node.val, left, right }, panels: panels(node, extra()), note: `Right height ${right}` })
      const prev = best
      best = Math.max(left + right, best)
      t.step(13, {
        vars: { node: node.val, 'left+right': left + right, best },
        panels: panels(node, extra()),
        note: best > prev ? `Path through ${node.val} = ${left + right}: new best` : `Path through ${node.val} = ${left + right}; best stays ${best}`,
        say: best > prev && node !== root ? say('offroot', 'The best path need not pass through the root, so I check every node.') : undefined,
      })
      const result = 1 + Math.max(left, right)
      values[node.id] = `h=${result}`
      state[node.id] = 'done'
      t.step(15, {
        vars: { node: node.val, returns: result },
        panels: panels(node, extra()),
        note: `Return height ${result} to parent`,
        say: say('return', 'Return height, not diameter: a parent can only extend one branch.'),
      })
      frames.pop()
      return result
    }
    dfs(root)
    t.step(17, { vars: { best }, panels: panels(null, extra()), note: 'DFS finished' })
    t.step(19, { vars: { answer: best }, panels: panels(null, extra()), note: `Diameter = ${best} edges`, say: 'O(n) time, O(h) stack space.' })
  },
}

const traceBalanced = {
  id: 'trees:trace:balanced',
  title: 'Balanced tree (-1 sentinel)',
  skills: ['tree-dfs'],
  problem: 'Is every node’s left/right height difference at most 1?',
  code: `class Solution:
    def isBalanced(self, root: Optional[TreeNode]) -> bool:

        def dfs(node):
            if not node:
                return 0

            left = dfs(node.left)
            right = dfs(node.right)

            if left == -1 or right == -1 or abs(left - right) > 1:
                return -1

            return 1 + max(left, right)

        return dfs(root) != -1`,
  complexity: { time: 'O(n)', space: 'O(h)', why: 'Heights computed once bottom-up; -1 propagates failure.' },
  inputs: [
    { label: 'balanced', value: sample.balanced },
    { label: 'unbalanced', value: sample.unbalanced },
    { label: 'left-heavy', value: sample.leftHeavy },
  ],
  run(input, t) {
    const root = buildTree(input)
    const { state, values, frames, panels } = kit(root)
    const say = once()
    t.step(16, {
      vars: {},
      panels: panels(null),
      note: 'One pass returns height or -1',
      say: say('contract', 'dfs returns height, or -1 meaning unbalanced somewhere below. One O(n) pass, not O(n²).'),
    })
    const dfs = node => {
      frames.push(node ? `dfs(${node.val})` : 'dfs(None)')
      if (!node) {
        t.step(6, { vars: { node: 'None' }, panels: panels(null), note: 'Empty: height 0', say: say('base', 'None is balanced with height 0.') })
        frames.pop()
        return 0
      }
      state[node.id] = 'current'
      t.step(5, { vars: { node: node.val }, panels: panels(node), note: `Enter ${node.val}` })
      state[node.id] = 'path'
      const left = dfs(node.left)
      state[node.id] = 'current'
      t.step(8, { vars: { node: node.val, left }, panels: panels(node), note: `Left returned ${left}` })
      state[node.id] = 'path'
      const right = dfs(node.right)
      state[node.id] = 'current'
      t.step(9, { vars: { node: node.val, left, right }, panels: panels(node), note: `Right returned ${right}` })
      t.step(11, { vars: { node: node.val, left, right, diff: left === -1 || right === -1 ? '-' : Math.abs(left - right) }, panels: panels(node), note: 'Any child failed, or heights differ by >1?' })
      if (left === -1 || right === -1 || Math.abs(left - right) > 1) {
        values[node.id] = '-1'
        t.step(12, {
          vars: { node: node.val, returns: -1 },
          panels: panels(node),
          note: left === -1 || right === -1 ? 'Propagate failure upward' : `|${left} - ${right}| > 1: unbalanced here`,
          say: say('fail', '-1 is a sentinel: once any subtree fails, every ancestor just passes it up.'),
        })
        frames.pop()
        return -1
      }
      const result = 1 + Math.max(left, right)
      values[node.id] = `h=${result}`
      state[node.id] = 'done'
      t.step(14, { vars: { node: node.val, returns: result }, panels: panels(node), note: `Balanced here; height ${result}`, say: say('ok', 'Balanced at this node, so I return the real height for the parent to compare.') })
      frames.pop()
      return result
    }
    const answer = dfs(root)
    t.step(16, { vars: { answer: answer !== -1 ? 'True' : 'False' }, panels: panels(null), note: answer !== -1 ? 'Balanced' : 'Not balanced', say: 'O(n) time, O(h) space.' })
  },
}

const traceKthSmallest = {
  id: 'trees:trace:kth-smallest',
  title: 'Kth smallest (iterative inorder)',
  skills: ['bst', 'tree-dfs', 'stack'],
  problem: 'Return the kth smallest value in a BST.',
  code: `class Solution:
    def kthSmallest(self, root: Optional[TreeNode], k: int) -> int:
        stack = []
        curr = root

        while stack or curr:
            while curr:
                stack.append(curr)
                curr = curr.left

            curr = stack.pop()
            k -= 1
            if k == 0:
                return curr.val

            curr = curr.right`,
  complexity: { time: 'O(h + k)', space: 'O(h)', why: 'Stack holds one left spine; we stop after k pops.' },
  inputs: [
    { label: 'k=3', value: { tree: [5, 3, 6, 2, 4, null, null, 1], k: 3 } },
    { label: 'k=1', value: { tree: [3, 1, 4, null, 2], k: 1 } },
    { label: 'k=6', value: { tree: sample.bst, k: 6 } },
  ],
  run(input, t) {
    const root = buildTree(input.tree)
    let k = input.k
    const state = {}
    const values = {}
    const say = once()
    const stack = []
    let curr = root
    let popped = 0
    const panels = () => [
      treePanel(root, state, { pointers: curr ? { curr: curr.id } : {}, values }),
      { kind: 'stack', label: 'stack', items: stack.map(n => n.val), highlight: stack.length ? [stack.length - 1] : [] },
      { kind: 'text', text: `k = ${k}` },
    ]
    t.step(4, {
      vars: { curr: curr ? curr.val : 'None', k },
      panels: panels(),
      note: 'Inorder of a BST is sorted',
      say: say('idea', 'Inorder traversal of a BST visits values in sorted order, so the kth visit is the answer.'),
    })
    while (stack.length || curr) {
      t.step(6, { vars: { curr: curr ? curr.val : 'None', stack: stack.map(n => n.val) }, panels: panels(), note: 'Stack or curr still has work' })
      while (curr) {
        stack.push(curr)
        state[curr.id] = 'frontier'
        t.step(8, {
          vars: { curr: curr.val },
          panels: panels(),
          note: `Push ${curr.val}; keep going left`,
          say: say('spine', 'Push the whole left spine. The stack replaces the recursion call stack.'),
        })
        curr = curr.left
        t.step(9, { vars: { curr: curr ? curr.val : 'None' }, panels: panels(), note: curr ? `Move left to ${curr.val}` : 'No left child: stop descending' })
      }
      curr = stack.pop()
      state[curr.id] = 'current'
      t.step(11, { vars: { curr: curr.val }, panels: panels(), note: `Pop ${curr.val}: smallest unvisited`, say: say('pop', 'Popped node has no unvisited smaller values left. Visit it now.') })
      k -= 1
      popped += 1
      values[curr.id] = `#${popped}`
      t.step(12, { vars: { curr: curr.val, k }, panels: panels(), note: `Visit #${popped}; k left = ${k}` })
      t.step(13, { vars: { k }, panels: panels(), note: k === 0 ? 'k hit 0' : 'Not yet' })
      if (k === 0) {
        state[curr.id] = 'path'
        t.step(14, { vars: { answer: curr.val }, panels: panels(), note: `Answer ${curr.val}`, say: 'Early exit: O(h + k) time, O(h) space.' })
        return
      }
      state[curr.id] = 'done'
      curr = curr.right
      t.step(16, { vars: { curr: curr ? curr.val : 'None' }, panels: panels(), note: curr ? `Go right to ${curr.val}` : 'No right child: pop next', say: say('right', 'After visiting, the next larger values are in the right subtree.') })
    }
  },
}

const traceRightSide = {
  id: 'trees:trace:right-side',
  title: 'Right side view (BFS last per level)',
  skills: ['tree-bfs', 'queue-deque'],
  problem: 'Return the values visible when looking at the tree from the right.',
  code: `from collections import deque

class Solution:
    def rightSideView(self, root: Optional[TreeNode]) -> List[int]:
        result = []
        queue = deque([root]) if root else deque()

        while queue:
            levelSize = len(queue)

            for i in range(levelSize):
                node = queue.popleft()

                if i == levelSize - 1:
                    result.append(node.val)

                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)

        return result`,
  complexity: { time: 'O(n)', space: 'O(w)', why: 'Standard BFS; record the last node of each level.' },
  inputs: [
    { label: 'gappy', value: sample.wide },
    { label: 'left peek', value: sample.leftHeavy },
    { label: 'full', value: sample.full },
  ],
  run(input, t) {
    const root = buildTree(input)
    const state = {}
    const say = once()
    let queue = root ? [root] : []
    const result = []
    const panels = cur => [
      treePanel(root, state, { pointers: cur ? { node: cur.id } : {} }),
      { kind: 'queue', label: 'queue', items: queue.map(n => n.val), highlight: queue.length ? [0] : [] },
      { kind: 'array', label: 'result', values: [...result] },
    ]
    if (root) state[root.id] = 'frontier'
    t.step(6, {
      vars: { queue: queue.map(n => n.val) },
      panels: panels(null),
      note: 'Seed the queue',
      say: say('idea', 'The visible node per level is the rightmost one. BFS gives me levels directly.'),
    })
    while (queue.length) {
      const levelSize = queue.length
      t.step(9, { vars: { levelSize }, panels: panels(null), note: `Level has ${levelSize} node(s)`, say: say('snap', 'Snapshot the level size before adding children.') })
      for (let i = 0; i < levelSize; i++) {
        const node = queue.shift()
        state[node.id] = 'current'
        t.step(12, { vars: { i, levelSize, node: node.val }, panels: panels(node), note: `Pop ${node.val} (i=${i})` })
        if (i === levelSize - 1) {
          result.push(node.val)
          state[node.id] = 'path'
          t.step(15, {
            vars: { i, node: node.val, result: [...result] },
            panels: panels(node),
            note: `Last in level: ${node.val} is visible`,
            say: say('last', 'i equals levelSize minus one, so this is the rightmost node of the level.'),
          })
        }
        if (node.left) {
          queue.push(node.left)
          state[node.left.id] = 'frontier'
          t.step(18, { vars: { node: node.val }, panels: panels(node), note: `Enqueue ${node.left.val}` })
        }
        if (node.right) {
          queue.push(node.right)
          state[node.right.id] = 'frontier'
          t.step(20, { vars: { node: node.val }, panels: panels(node), note: `Enqueue ${node.right.val}` })
        }
        if (state[node.id] !== 'path') state[node.id] = 'done'
      }
    }
    t.step(22, {
      vars: { result: [...result] },
      panels: panels(null),
      note: `Right view = ${JSON.stringify(result)}`,
      say: say('end', 'A left node can be visible when the right side is shorter. O(n) time, O(w) space.'),
    })
  },
}

const traceBuildTree = {
  id: 'trees:trace:build-tree',
  title: 'Build tree from preorder + inorder',
  skills: ['tree-dfs', 'arrays-hashing'],
  problem: 'Reconstruct a binary tree from its preorder and inorder traversals.',
  code: `class Solution:
    def buildTree(self, preorder: List[int], inorder: List[int]) -> Optional[TreeNode]:

        hashedIndex = {val: idx for idx, val in enumerate(inorder)}

        self.preIndex = 0

        def dfs(l, r):
            if l > r:
                return None

            root = TreeNode(preorder[self.preIndex])
            mid = hashedIndex[preorder[self.preIndex]]
            self.preIndex += 1
            root.left = dfs(l, mid - 1)
            root.right = dfs(mid + 1, r)
            return root

        return dfs(0, len(preorder) - 1)`,
  complexity: { time: 'O(n)', space: 'O(n)', why: 'Hashmap gives O(1) split lookups; each value becomes one node.' },
  inputs: [
    { label: 'classic', value: { preorder: [3, 9, 20, 15, 7], inorder: [9, 3, 15, 20, 7] } },
    { label: 'six nodes', value: { preorder: [1, 2, 4, 5, 3, 6], inorder: [4, 2, 5, 1, 3, 6] } },
  ],
  run(input, t) {
    const { preorder, inorder } = input
    const hashedIndex = Object.fromEntries(inorder.map((val, idx) => [val, idx]))
    const say = once()
    let preIndex = 0
    let built = null
    const state = {}
    const frames = []
    const panels = (l, r, mid, cur) => [
      { kind: 'array', label: 'preorder', values: [...preorder], pointers: preIndex < preorder.length ? { preIndex } : {}, dim: preorder.map((_, i) => i).filter(i => i < preIndex) },
      { kind: 'array', label: 'inorder', values: [...inorder], pointers: mid === undefined ? {} : { mid }, window: l <= r ? [l, r] : undefined, highlight: mid === undefined ? [] : [mid] },
      treePanel(built, state, { label: 'built so far', pointers: cur ? { root: cur.id } : {} }),
      { kind: 'callstack', label: 'call stack', frames: [...frames] },
    ]
    t.step(4, {
      vars: { hashedIndex: { ...hashedIndex } },
      panels: [...panels(0, -1), { kind: 'hashmap', label: 'hashedIndex', entries: Object.entries(hashedIndex).map(([k, v]) => [Number(k), v]) }],
      note: 'Map value → inorder index for O(1) splits',
      say: say('map', 'Preorder gives me the next root. Inorder tells me what goes left vs right of it.'),
    })
    t.step(6, { vars: { preIndex }, panels: panels(0, -1), note: 'preIndex walks preorder left to right' })
    const dfs = (l, r, parent, side) => {
      frames.push(`dfs(${l}, ${r})`)
      if (l > r) {
        t.step(10, { vars: { l, r }, panels: panels(l, r), note: 'Empty range: None' })
        frames.pop()
        return null
      }
      const node = { id: `b${preIndex}`, val: preorder[preIndex], left: null, right: null }
      if (!parent) built = node
      else parent[side] = node
      for (const key of Object.keys(state)) if (state[key] === 'current') state[key] = 'path'
      state[node.id] = 'current'
      t.step(12, {
        vars: { l, r, 'preorder[preIndex]': node.val },
        panels: panels(l, r, undefined, node),
        note: `Next preorder value ${node.val} is this subtree's root`,
        say: say('root', 'First unused preorder value is always the root of the current range.'),
      })
      const mid = hashedIndex[preorder[preIndex]]
      t.step(13, {
        vars: { l, r, mid },
        panels: panels(l, r, mid, node),
        note: `Inorder split at ${mid}: left [${l}, ${mid - 1}], right [${mid + 1}, ${r}]`,
        say: say('split', 'Everything left of mid in inorder is the left subtree, right of mid is the right.'),
      })
      preIndex += 1
      t.step(14, { vars: { preIndex }, panels: panels(l, r, mid, node), note: 'Consume this preorder value' })
      t.step(15, { vars: { l, r: mid - 1 }, panels: panels(l, r, mid, node), note: 'Build left first (preorder is root, left, right)', say: say('order', 'Left before right, because preorder lists the whole left subtree before the right.') })
      dfs(l, mid - 1, node, 'left')
      state[node.id] = 'current'
      t.step(16, { vars: { l: mid + 1, r }, panels: panels(l, r, mid, node), note: `Left of ${node.val} done; build right` })
      dfs(mid + 1, r, node, 'right')
      state[node.id] = 'done'
      t.step(17, { vars: { returns: node.val }, panels: panels(l, r, mid, node), note: `Subtree rooted at ${node.val} complete` })
      frames.pop()
      return node
    }
    dfs(0, preorder.length - 1, null, null)
    t.step(19, { vars: { root: built.val }, panels: panels(0, -1), note: 'Tree rebuilt', say: 'O(n) time with the hashmap, O(n) space for map plus O(h) recursion.' })
  },
}

const traceKthLargest = {
  id: 'trees:trace:kth-largest',
  title: 'Kth largest (min-heap of size k)',
  skills: ['heap', 'ds-diagnosis'],
  problem: 'Return the kth largest element in an unsorted array.',
  code: `import heapq

class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        heap = []

        for num in nums:
            heapq.heappush(heap, num)

            if len(heap) > k:
                heapq.heappop(heap)

        return heap[0]`,
  complexity: { time: 'O(n log k)', space: 'O(k)', why: 'Each push/pop costs log k; heap never exceeds k+1.' },
  inputs: [
    { label: 'k=2', value: { nums: [3, 2, 1, 5, 6, 4], k: 2 } },
    { label: 'k=4 dupes', value: { nums: [3, 2, 3, 1, 2, 4, 5, 5, 6], k: 4 } },
  ],
  run(input, t) {
    const { nums, k } = input
    const heap = []
    const say = once()
    const panels = (i, hl = []) => [
      { kind: 'array', label: 'nums', values: [...nums], pointers: i === undefined ? {} : { num: i }, dim: nums.map((_, j) => j).filter(j => i !== undefined && j < i) },
      { kind: 'heap', label: `min-heap (k = ${k})`, items: [...heap], highlight: hl },
    ]
    t.step(5, {
      vars: { k },
      panels: panels(),
      note: 'Keep only the k largest seen so far',
      say: say('idea', 'Min-heap of size k: the root is the smallest of the top k, which is the kth largest.'),
    })
    nums.forEach((num, i) => {
      t.step(7, { vars: { num, i }, panels: panels(i), note: `Next num = ${num}` })
      heappush(heap, num)
      t.step(8, { vars: { num, heap: [...heap] }, panels: panels(i, [heap.indexOf(num)]), note: `Push ${num}; it sifts up to its spot` })
      t.step(10, { vars: { 'len(heap)': heap.length, k }, panels: panels(i), note: heap.length > k ? `Size ${heap.length} > ${k}: too big` : `Size ${heap.length} ≤ ${k}: keep all`, say: say('cap', 'The heap never exceeds k + 1, so each push or pop is O(log k).') })
      if (heap.length > k) {
        const out = heappop(heap)
        t.step(11, {
          vars: { popped: out, heap: [...heap] },
          panels: panels(i, [0]),
          note: `Evict ${out}: smallest can't be in top k`,
          say: say('evict', 'Pop the minimum: it is smaller than k others, so it can never be the answer.'),
        })
      }
    })
    t.step(13, {
      vars: { answer: heap[0] },
      panels: panels(undefined, [0]),
      note: `heap[0] = ${heap[0]} is the kth largest`,
      say: 'O(n log k) time, O(k) space. Sorting is O(n log n); quickselect is O(n) average.',
    })
  },
}

const traceTopK = {
  id: 'trees:trace:top-k-frequent',
  title: 'Top k frequent (Counter + heap)',
  skills: ['heap', 'arrays-hashing', 'ds-diagnosis'],
  problem: 'Return the k most frequent elements.',
  code: `import heapq
from collections import Counter

class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        counted = Counter(nums)
        heap = []

        for num, freq in counted.items():
            heapq.heappush(heap, (freq, num))

            if len(heap) > k:
                heapq.heappop(heap)

        return [num for freq, num in heap]`,
  complexity: { time: 'O(n log k)', space: 'O(n)', why: 'Counting is O(n); heap of size k over u distinct values.' },
  inputs: [
    { label: 'k=2', value: { nums: [1, 1, 1, 2, 2, 3], k: 2 } },
    { label: 'k=2 mixed', value: { nums: [4, 1, 4, 2, 2, 4, 3, 2, 5, 4], k: 2 } },
  ],
  run(input, t) {
    const { nums, k } = input
    const counts = new Map()
    nums.forEach(num => counts.set(num, (counts.get(num) || 0) + 1))
    const heap = []
    const say = once()
    const show = item => `(${item[0]},${item[1]})`
    const panels = (hlKey, hl = []) => [
      { kind: 'hashmap', label: 'counted', entries: [...counts.entries()], highlight: hlKey === undefined ? [] : [hlKey] },
      { kind: 'heap', label: `min-heap of (freq, num), k = ${k}`, items: heap.map(show), highlight: hl },
    ]
    t.step(6, {
      vars: { k },
      panels: panels(),
      note: 'Count frequencies in O(n)',
      say: say('count', 'First count with a Counter. Then top k by frequency is a heap problem.'),
    })
    t.step(7, { vars: {}, panels: panels(), note: 'Empty min-heap keyed by freq', say: say('heap', 'Min-heap of size k: the least frequent of my current top k sits on top, ready to evict.') })
    for (const [num, freq] of counts.entries()) {
      t.step(9, { vars: { num, freq }, panels: panels(num), note: `${num} appears ${freq}×` })
      heappush(heap, [freq, num])
      t.step(10, { vars: { num, freq }, panels: panels(num, [heap.findIndex(item => item[0] === freq && item[1] === num)]), note: `Push (${freq}, ${num})` })
      t.step(12, { vars: { 'len(heap)': heap.length, k }, panels: panels(num), note: heap.length > k ? 'Over k: evict least frequent' : 'Within k' })
      if (heap.length > k) {
        const out = heappop(heap)
        t.step(13, { vars: { popped: show(out) }, panels: panels(num, [0]), note: `Evict ${out[1]} (freq ${out[0]})`, say: say('evict', 'Tuples compare by freq first, so the least frequent leaves.') })
      }
    }
    const answer = heap.map(item => item[1])
    t.step(15, {
      vars: { answer },
      panels: panels(),
      note: `Top ${k}: ${JSON.stringify(answer)}`,
      say: 'O(n log k). Bucket sort by frequency gets O(n) if asked to beat n log n.',
    })
  },
}

const traceTrie = {
  id: 'trees:trace:trie',
  title: 'Trie insert & search',
  skills: ['trie', 'ds-diagnosis'],
  problem: 'Insert words into a prefix tree, then search for whole words.',
  code: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.endOfWord = False

class Trie:
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

        return curr.endOfWord`,
  complexity: { time: 'O(L) per op', space: 'O(total chars)', why: 'One hashmap hop per character; shared prefixes share nodes.' },
  inputs: [
    { label: 'cat car dog', value: [['insert', 'cat'], ['insert', 'car'], ['insert', 'dog'], ['search', 'car'], ['search', 'ca'], ['search', 'cow']] },
    { label: 'app apple', value: [['insert', 'apple'], ['search', 'app'], ['insert', 'app'], ['search', 'app'], ['search', 'apt']] },
  ],
  run(input, t) {
    const say = once()
    const allWords = input.filter(op => op[0] === 'insert').map(op => op[1])
    const full = { id: 'root', children: {} }
    allWords.forEach(word => {
      let node = full
      for (const c of word) {
        if (!node.children[c]) node.children[c] = { id: node.id === 'root' ? c : node.id + c, char: c, children: {} }
        node = node.children[c]
      }
    })
    const pos = {}
    let leaf = 0
    let maxDepth = 1
    const layout = (node, depth) => {
      maxDepth = Math.max(maxDepth, depth)
      const kids = Object.keys(node.children).sort().map(c => node.children[c])
      if (!kids.length) {
        pos[node.id] = { x: leaf++, depth }
        return
      }
      kids.forEach(kid => layout(kid, depth + 1))
      pos[node.id] = { x: kids.reduce((s, kid) => s + pos[kid.id].x, 0) / kids.length, depth }
    }
    layout(full, 0)
    const span = Math.max(1, leaf - 1)
    const live = new Map([['root', { id: 'root', char: '', parent: null }]])
    const ends = new Set()
    const graphPanel = (state, edgeState = {}) => {
      const nodes = [...live.values()].map(n => ({
        id: n.id,
        label: n.id === 'root' ? '·' : n.char,
        x: leaf <= 1 ? 0.5 : 0.08 + (0.84 * pos[n.id].x) / span,
        y: 0.08 + (0.84 * pos[n.id].depth) / maxDepth,
      }))
      const edges = [...live.values()].filter(n => n.parent).map(n => ({ from: n.parent, to: n.id }))
      const values = Object.fromEntries([...ends].map(id => [id, 'end']))
      return { kind: 'graph', label: 'trie', directed: true, nodes, edges, state: { ...state }, edgeState: { ...edgeState }, values }
    }
    const wordPanel = (word, i) => ({ kind: 'array', label: 'word', values: word.split(''), pointers: i < word.length ? { c: i } : {}, dim: word.split('').map((_, j) => j).filter(j => j < i) })
    t.step(8, { vars: {}, panels: [graphPanel({ root: 'current' })], note: 'Empty root node', say: say('idea', 'A trie stores words by shared prefixes. Each node is a dict of children plus an end flag.') })
    for (const [op, word] of input) {
      const state = { root: 'current' }
      const edgeState = {}
      let curr = 'root'
      const panels = i => [graphPanel(state, edgeState), wordPanel(word, i), { kind: 'text', text: `${op}("${word}")` }]
      t.step(op === 'insert' ? 11 : 21, { vars: { word, curr: 'root' }, panels: panels(0), note: `${op}("${word}"): start at root` })
      let failed = false
      for (let i = 0; i < word.length; i++) {
        const c = word[i]
        const childId = curr === 'root' ? c : curr + c
        const exists = live.has(childId)
        t.step(op === 'insert' ? 14 : 24, { vars: { c, curr: curr === 'root' ? 'root' : curr }, panels: panels(i), note: exists ? `'${c}' already a child` : `'${c}' missing` })
        if (!exists) {
          if (op === 'search') {
            t.step(25, { vars: { c, returns: 'False' }, panels: panels(i), note: `No '${c}' edge: "${word}" absent`, say: say('miss', 'Missing edge means no stored word has this prefix. Return False early.') })
            failed = true
            break
          }
          live.set(childId, { id: childId, char: c, parent: curr })
          t.step(15, { vars: { c }, panels: panels(i), note: `Create node for '${c}'`, say: say('create', 'Only create nodes for new characters; shared prefixes reuse existing nodes.') })
        }
        state[curr] = 'path'
        edgeState[`${curr}->${childId}`] = 'path'
        curr = childId
        state[curr] = 'current'
        t.step(op === 'insert' ? 16 : 26, { vars: { c, curr }, panels: panels(i + 1), note: `Step down to '${c}'` })
      }
      if (failed) continue
      if (op === 'insert') {
        ends.add(curr)
        state[curr] = 'done'
        t.step(18, { vars: { curr, endOfWord: 'True' }, panels: panels(word.length), note: `Mark end of "${word}"`, say: say('end', 'Mark endOfWord so a prefix like "ca" is not mistaken for a word.') })
      } else {
        const found = ends.has(curr)
        state[curr] = found ? 'done' : 'current'
        t.step(28, {
          vars: { returns: found ? 'True' : 'False' },
          panels: panels(word.length),
          note: found ? `"${word}" is a stored word` : `"${word}" is only a prefix`,
          say: found ? say('found', 'Path exists and endOfWord is True. O(L) per lookup, independent of word count.') : say('prefix', 'Path exists but endOfWord is False: prefix, not word. startsWith would return True here.'),
        })
      }
    }
  },
}

const traces = [
  traceMaxDepth,
  traceLevelOrder,
  traceValidBst,
  traceLcaBst,
  traceDiameter,
  traceBalanced,
  traceKthSmallest,
  traceRightSide,
  traceBuildTree,
  traceKthLargest,
  traceTopK,
  traceTrie,
]

const annotate = (values, fn) => {
  const root = buildTree(values)
  const out = {}
  fn(root, out)
  return { root, out }
}

const orderLabels = (values, kind) =>
  annotate(values, (root, out) => {
    let n = 0
    const walk = node => {
      if (!node) return
      if (kind === 'pre') out[node.id] = `${++n}`
      walk(node.left)
      if (kind === 'in') out[node.id] = `${++n}`
      walk(node.right)
      if (kind === 'post') out[node.id] = `${++n}`
    }
    walk(root)
  })

const heightLabels = values =>
  annotate(values, (root, out) => {
    const walk = node => {
      if (!node) return 0
      const h = 1 + Math.max(walk(node.left), walk(node.right))
      out[node.id] = `h=${h}`
      return h
    }
    walk(root)
  })

const depthLabels = values =>
  annotate(values, (root, out) => {
    const walk = (node, d) => {
      if (!node) return
      out[node.id] = `d=${d}`
      walk(node.left, d + 1)
      walk(node.right, d + 1)
    }
    walk(root, 0)
  })

const labeledTree = (label, values, labeler, state = {}) => {
  const { root, out } = labeler(values)
  return treePanel(root, state, { label, values: out })
}

const levelState = (values, upTo) => {
  const root = buildTree(values)
  const state = {}
  let level = [root]
  let d = 0
  while (level.length) {
    if (d <= upTo + 1) level.forEach(n => (state[n.id] = d < upTo ? 'done' : d === upTo ? 'current' : 'frontier'))
    level = level.flatMap(n => [n.left, n.right].filter(Boolean))
    d++
  }
  return treePanel(root, state, { label: `level ${upTo}` })
}

const lessons = [
  {
    id: 'trees:lesson:dfs-contract',
    title: 'Tree DFS: the recursion contract',
    skills: ['tree-dfs', 'communication'],
    slides: [
      {
        title: 'Say the contract first',
        points: ['"dfs(node) returns ___ for the subtree rooted at node."', 'Fill the blank before writing code.'],
      },
      {
        title: 'Three parts, every time',
        code: `def dfs(node):
    if not node:
        return 0

    left = dfs(node.left)
    right = dfs(node.right)

    return 1 + max(left, right)`,
        highlight: 2,
        points: ['Base: what does None return?', 'Recurse: trust children.', 'Combine: build my answer.'],
      },
      {
        title: 'Answers flow up',
        panels: [labeledTree('dfs returns height', sample.balanced, heightLabels)],
        points: ['Leaves return 1, root returns the answer.'],
      },
      {
        title: 'Return value ≠ answer',
        points: ['Diameter: return height, track left+right in a global.', 'Parent can extend only one branch.'],
        ask: {
          q: 'Max path sum: what should dfs(node) return?',
          choices: ['Best path anywhere in subtree', 'Best downward path starting at node', 'Sum of subtree', 'Height of subtree'],
          answer: 1,
          why: 'Parent can only extend a single downward chain; the bent path is recorded globally.',
        },
      },
      {
        title: 'Space is O(h)',
        panels: [
          treePanel(buildTree(sample.full), {}, { label: 'balanced: h ≈ log n' }),
          treePanel(buildTree(sample.skewed), {}, { label: 'skewed: h = n' }),
        ],
        points: ['Call stack holds one root-to-node path.', 'Skewed tree → O(n) stack.'],
      },
    ],
  },
  {
    id: 'trees:lesson:orders',
    title: 'Pre, in, post order + top-down vs bottom-up',
    skills: ['tree-dfs', 'bst'],
    slides: [
      {
        title: 'Preorder: node, left, right',
        panels: [labeledTree('visit order', sample.full, v => orderLabels(v, 'pre'))],
        points: ['Process before children.', 'Use: copy/serialize, pass state down.'],
      },
      {
        title: 'Inorder: left, node, right',
        panels: [labeledTree('visit order on a BST', sample.bst, v => orderLabels(v, 'in'))],
        points: ['BST inorder is sorted.', 'Use: kth smallest, validate BST.'],
      },
      {
        title: 'Postorder: left, right, node',
        panels: [labeledTree('visit order', sample.full, v => orderLabels(v, 'post'))],
        points: ['Children finish first.', 'Use: heights, diameter, balanced, delete.'],
      },
      {
        title: 'Top-down: pass state in',
        panels: [labeledTree('depth passed as argument', sample.balanced, depthLabels)],
        code: `def dfs(node, pathMax):
    if not node:
        return
    if node.val >= pathMax:
        self.total += 1
    dfs(node.left, max(pathMax, node.val))
    dfs(node.right, max(pathMax, node.val))`,
        points: ['Parent knows something the child needs: bounds, depth, path max.'],
      },
      {
        title: 'Bottom-up: return a value',
        panels: [labeledTree('heights returned', sample.balanced, heightLabels)],
        points: ['Node needs children’s results: height, balanced, subtree sum.'],
        ask: {
          q: 'Count good nodes (no larger ancestor). Which style?',
          choices: ['Bottom-up return', 'Top-down pass pathMax', 'BFS only', 'Inorder sorted'],
          answer: 1,
          why: 'The condition depends on ancestors, so carry the running max down.',
        },
      },
    ],
  },
  {
    id: 'trees:lesson:bfs-levels',
    title: 'Tree BFS: level by level',
    skills: ['tree-bfs', 'queue-deque', 'communication'],
    slides: [
      {
        title: 'Queue = distance order',
        panels: [levelState(sample.full, 0), { kind: 'queue', label: 'queue', items: [1] }],
        points: ['deque + popleft. FIFO visits by depth.'],
      },
      {
        title: 'Snapshot len(queue)',
        code: `while queue:
    level = []
    for _ in range(len(queue)):
        node = queue.popleft()
        level.append(node.val)
        if node.left:
            queue.append(node.left)
        if node.right:
            queue.append(node.right)
    result.append(level)`,
        highlight: 3,
        points: ['range(len(queue)) evaluated once: exactly one level per loop.'],
      },
      {
        title: 'One level at a time',
        panels: [levelState(sample.full, 1), { kind: 'queue', label: 'queue', items: [2, 3] }],
        points: ['Green done, amber now, children wait.'],
      },
      {
        title: 'DFS O(h) vs BFS O(w)',
        panels: [treePanel(buildTree(sample.full), {}, { label: 'full: w ≈ n/2, h ≈ log n' }), treePanel(buildTree(sample.skewed), {}, { label: 'skewed: w = 1, h = n' })],
        points: ['Full tree: DFS wins.', 'Skewed: BFS wins.'],
      },
      {
        title: 'When to reach for BFS',
        points: ['"level", "row", "depth k", "minimum depth", "right side view", "zigzag".', 'Min depth: BFS stops at first leaf.'],
        ask: {
          q: 'Minimum depth of a huge tree with a leaf near the root. Best?',
          choices: ['DFS full traversal', 'BFS, stop at first leaf', 'Inorder', 'Sort depths'],
          answer: 1,
          why: 'BFS reaches the shallowest leaf first and can return immediately.',
        },
      },
    ],
  },
  {
    id: 'trees:lesson:bst',
    title: 'BST: ordering is the superpower',
    skills: ['bst'],
    slides: [
      {
        title: 'The invariant',
        panels: [treePanel(buildTree(sample.bst), {}, { label: 'left < node < right, for whole subtrees' })],
        points: ['Every left descendant smaller, every right larger.'],
      },
      {
        title: 'Parent check is not enough',
        panels: [treePanel(buildTree(sample.badBst), { n5: 'current' }, { label: '3 < 6 ok, but 3 < 5 root!', values: { n5: '✗' } })],
        points: ['Pass (low, high) bounds down.'],
      },
      {
        title: 'Search halves each step',
        panels: [treePanel(buildTree(sample.bst), { n0: 'path', n2: 'path', n5: 'done' }, { label: 'find 7' })],
        points: ['O(h): log n balanced, n degenerate.'],
      },
      {
        title: 'Inorder = sorted',
        panels: [labeledTree('inorder rank', sample.bst, v => orderLabels(v, 'in'))],
        points: ['Kth smallest: stop at kth inorder visit.'],
      },
      {
        title: 'LCA: the split point',
        panels: [treePanel(buildTree(sample.lcaBst), { n0: 'done' }, { label: 'p=2, q=8 split at 6', values: { n1: 'p', n2: 'q' } })],
        points: ['Both smaller → left. Both larger → right. Else here.'],
        ask: {
          q: 'LCA in BST, p=3, q=5 in the tree above. Answer?',
          choices: ['6', '2', '4', '3'],
          answer: 2,
          why: '6: both smaller, go left. 2: both larger, go right. 4: 3 < 4 < 5, split.',
        },
      },
    ],
  },
  {
    id: 'trees:lesson:heaps-tries',
    title: 'Heaps & tries: when and why',
    skills: ['heap', 'trie', 'ds-diagnosis'],
    slides: [
      {
        title: 'Heap = cheap min',
        panels: [{ kind: 'heap', label: 'min-heap array', items: [1, 3, 2, 7, 4, 5] }],
        points: ['peek O(1), push/pop O(log n), heapify O(n).', 'Children of i: 2i+1, 2i+2.'],
      },
      {
        title: 'Top k: min-heap of size k',
        panels: [{ kind: 'heap', label: 'k = 3 largest so far', items: [5, 6, 9] }],
        points: ['Root = kth largest. Evict when size > k.', 'O(n log k).'],
      },
      {
        title: 'Python is min-heap only',
        code: `heap = [-x for x in nums]
heapq.heapify(heap)
largest = -heapq.heappop(heap)`,
        points: ['Negate for max-heap. Tuples compare by first item.'],
      },
      {
        title: 'Trie = prefix tree',
        panels: [
          {
            kind: 'graph',
            label: 'cat, car, dog',
            directed: true,
            nodes: [
              { id: 'r', label: '·', x: 0.5, y: 0.08 },
              { id: 'c', label: 'c', x: 0.3, y: 0.36 },
              { id: 'ca', label: 'a', x: 0.3, y: 0.64 },
              { id: 'cat', label: 't', x: 0.15, y: 0.92 },
              { id: 'car', label: 'r', x: 0.45, y: 0.92 },
              { id: 'd', label: 'd', x: 0.75, y: 0.36 },
              { id: 'do', label: 'o', x: 0.75, y: 0.64 },
              { id: 'dog', label: 'g', x: 0.75, y: 0.92 },
            ],
            edges: [
              { from: 'r', to: 'c' }, { from: 'c', to: 'ca' }, { from: 'ca', to: 'cat' }, { from: 'ca', to: 'car' },
              { from: 'r', to: 'd' }, { from: 'd', to: 'do' }, { from: 'do', to: 'dog' },
            ],
            state: { cat: 'done', car: 'done', dog: 'done' },
            values: { cat: 'end', car: 'end', dog: 'end' },
          },
        ],
        points: ['children dict + endOfWord flag.', 'O(L) per insert/search.'],
      },
      {
        title: 'Diagnose the structure',
        points: ['"k largest / closest / merge k sorted" → heap.', '"prefix / autocomplete / word list on grid" → trie.'],
        ask: {
          q: 'Stream of numbers, query the median anytime. Best structure?',
          choices: ['One sorted list', 'Two heaps (max low, min high)', 'Trie', 'Hash map'],
          answer: 1,
          why: 'Max-heap of lower half, min-heap of upper half: O(log n) add, O(1) median.',
        },
      },
    ],
  },
]

const cardRows = [
  [['tree-dfs', 'communication'], 'First sentence before coding any tree recursion?', '"dfs(node) returns X for the subtree rooted at node." Then base case, recurse, combine.'],
  [['tree-dfs'], 'Tree DFS time and space?', 'O(n) time, each node once. O(h) space for the call stack: O(log n) balanced, O(n) skewed.'],
  [['tree-bfs'], 'Tree BFS time and space?', 'O(n) time. O(w) space, w = max level width, up to about n/2 for a full tree.'],
  [['tree-bfs'], 'Why snapshot len(queue) in level-order BFS?', 'range(len(queue)) is evaluated once, so the loop pops exactly the current level; children wait for the next round.'],
  [['tree-dfs'], 'Preorder visit order?', 'node, left, right. Good for copying, serializing, passing state down.'],
  [['tree-dfs', 'bst'], 'Inorder visit order and its BST property?', 'left, node, right. On a BST it yields values in sorted order.'],
  [['tree-dfs'], 'Postorder visit order and typical use?', 'left, right, node. Bottom-up answers: height, diameter, balanced, deleting a tree.'],
  [['tree-dfs'], 'Top-down vs bottom-up recursion?', 'Top-down passes state as arguments (depth, bounds, path max). Bottom-up returns values from children and combines them.'],
  [['tree-dfs'], 'Signal for top-down DFS?', 'Answer at a node depends on ancestors: path sums, good nodes, BST bounds, depth labels.'],
  [['tree-dfs'], 'Signal for bottom-up DFS?', 'Answer at a node depends on its subtrees: height, size, balanced, diameter, max path sum.'],
  [['tree-dfs'], 'Diameter: what does dfs return vs track?', 'Return height (1 + max(left, right)). Track best = max(best, left + right) globally.', `self.best = max(left + right, self.best)
return 1 + max(left, right)`],
  [['tree-dfs'], 'Max path sum: why max(dfs(child), 0)?', 'A negative branch only hurts, so drop it by taking 0.'],
  [['tree-dfs'], 'Balanced tree in one pass?', 'Return height or -1 sentinel. If either child is -1 or heights differ by >1, return -1. O(n).'],
  [['tree-dfs'], 'Why is naive balanced check O(n²)?', 'Calling height() at every node recomputes subtrees repeatedly. Return height and status together instead.'],
  [['tree-dfs'], 'Same tree / symmetric tree pattern?', 'Recurse on two nodes at once: both None → True, one None or vals differ → False, then recurse pairs.'],
  [['tree-dfs'], 'Invert a binary tree?', 'Swap left and right at every node, recursively. O(n) time, O(h) space.', `node.left, node.right = node.right, node.left`],
  [['tree-dfs'], 'Subtree of another tree, complexity?', 'For each node in root, run sameTree: O(m·n) worst. Serialization + string match can reach O(m+n).'],
  [['tree-dfs', 'arrays-hashing'], 'Build tree from preorder + inorder: key idea?', 'preorder[i] is the next root; its inorder index splits left/right ranges. Hashmap of inorder indices makes it O(n).'],
  [['tree-dfs'], 'Serialize a binary tree?', 'Preorder with a marker like "N" for None. Deserialize by consuming tokens in the same order.'],
  [['bst'], 'BST invariant?', 'All values in left subtree < node < all values in right subtree, recursively.'],
  [['bst'], 'Validate BST: why bounds, not parent checks?', 'A node can satisfy its parent but violate a higher ancestor. Pass (low, high) down.', `validRange(node.left, low, node.val) and validRange(node.right, node.val, high)`],
  [['bst'], 'LCA in a BST?', 'Walk from root: both smaller → left, both larger → right, otherwise current node is the split. O(h), O(1) space.'],
  [['bst'], 'Kth smallest in BST?', 'Inorder traversal, stop at the kth visit. Iterative stack gives O(h + k).'],
  [['bst'], 'BST search / insert cost?', 'O(h): O(log n) if balanced, O(n) if degenerate (sorted inserts).'],
  [['bst', 'stack'], 'Iterative inorder template?', 'Push left spine, pop, visit, move to right child. Loop while stack or curr.', `while stack or curr:
    while curr:
        stack.append(curr)
        curr = curr.left
    curr = stack.pop()
    curr = curr.right`],
  [['tree-dfs'], 'LCA in a general binary tree?', 'dfs returns p, q, or None found below. If both sides non-None, node is LCA; else return the non-None side.'],
  [['tree-bfs'], 'Right side view?', 'BFS by level, take the last node of each level. Or DFS right-first, record first node per depth.'],
  [['tree-bfs'], 'Minimum depth: BFS or DFS?', 'BFS: return at the first leaf found. DFS must explore everything.'],
  [['tree-bfs'], 'Zigzag level order?', 'Standard BFS levels; reverse every other level (or appendleft into a deque).'],
  [['heap'], 'Python heapq basics?', 'Min-heap only. heappush/heappop O(log n), heap[0] peek O(1), heapify O(n).'],
  [['heap'], 'Max-heap in Python?', 'Push negatives: heappush(heap, -x); pop with -heappop(heap).'],
  [['heap'], 'Kth largest element: which heap and size?', 'Min-heap of size k. Root is the kth largest. O(n log k) time, O(k) space.'],
  [['heap'], 'Why min-heap for k largest?', 'The smallest of the top k must be evictable in O(log n). A min-heap puts it at the root.'],
  [['heap', 'arrays-hashing'], 'Top k frequent: two approaches?', 'Counter + min-heap of (freq, num) size k: O(n log k). Bucket sort by frequency: O(n).'],
  [['heap'], 'Merge k sorted lists?', 'Min-heap of (val, i, node) heads. Pop smallest, push its next. O(N log k).'],
  [['heap'], 'Median of a stream?', 'Max-heap for lower half, min-heap for upper half, keep sizes within 1. Add O(log n), median O(1).'],
  [['heap'], 'heapify vs n pushes?', 'heapify is O(n). n heappush calls are O(n log n).'],
  [['trie'], 'Trie node fields?', 'children: dict char → node, and endOfWord: bool.'],
  [['trie'], 'search vs startsWith in a trie?', 'Both walk chars. search returns curr.endOfWord; startsWith returns True once the walk survives.'],
  [['trie', 'ds-diagnosis'], 'When does a trie beat a hash set?', 'Prefix queries, autocomplete, wildcard search, or many words on a grid (Word Search II): prune by prefix.'],
]

const flashcards = cardRows.map(([skills, front, back, code], i) => ({
  id: `trees:card:${i + 1}`,
  skills,
  front,
  back,
  ...(code ? { code } : {}),
}))

const mcqRows = [
  [['tree-dfs', 'complexity'], 1, 'Recursive DFS on a balanced tree of n nodes uses how much extra space?', ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], 1, 'Stack depth equals height, which is log n for balanced trees.'],
  [['tree-dfs', 'complexity'], 2, 'Same DFS on a tree where every node has only a left child?', ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], 2, 'Height is n, so the call stack reaches n frames.'],
  [['tree-bfs', 'complexity'], 2, 'BFS on a perfect binary tree with n nodes: peak queue size?', ['O(log n)', 'about n/2', 'O(1)', 'n²'], 1, 'The last level holds about half the nodes and sits in the queue at once.'],
  [['tree-bfs', 'tree-dfs', 'ds-diagnosis'], 2, 'Very wide, shallow tree with millions of leaves. Which traversal uses less memory?', ['BFS', 'DFS', 'Same', 'Neither works'], 1, 'DFS uses O(h), small here. BFS holds a whole wide level.'],
  [['tree-bfs'], 1, 'What breaks if you replace for _ in range(len(queue)) with while queue inside the level loop?', ['Nothing', 'Levels merge into one list', 'Infinite loop', 'Nodes skipped'], 1, 'The inner loop would also consume children just appended, so all levels collapse together.'],
  [['tree-bfs', 'queue-deque'], 1, 'Why deque instead of list for BFS?', ['Sorted order', 'popleft is O(1); list.pop(0) is O(n)', 'Uses less memory', 'Thread safe'], 1, 'list.pop(0) shifts every element.'],
  [['tree-dfs'], 1, 'Preorder of tree 1(2(4,5),3)?', ['4 2 5 1 3', '1 2 4 5 3', '4 5 2 3 1', '1 2 3 4 5'], 1, 'Node, then full left subtree, then right.'],
  [['tree-dfs'], 1, 'Inorder of tree 1(2(4,5),3)?', ['4 2 5 1 3', '1 2 4 5 3', '4 5 2 3 1', '2 4 5 1 3'], 0, 'Left, node, right.'],
  [['tree-dfs'], 1, 'Postorder of tree 1(2(4,5),3)?', ['4 2 5 1 3', '4 5 2 3 1', '1 2 4 5 3', '5 4 3 2 1'], 1, 'Left, right, node: children before parent.'],
  [['tree-dfs'], 2, 'Which order naturally computes subtree heights?', ['Preorder', 'Inorder', 'Postorder', 'Level order'], 2, 'You need both children’s heights before the node’s.'],
  [['tree-dfs', 'communication'], 2, 'Count nodes whose value is ≥ every ancestor. What should the recursive call carry?', ['Return subtree size', 'Pass running max from root', 'Return min of subtree', 'Pass depth only'], 1, 'Condition depends on ancestors: top-down state.'],
  [['tree-dfs'], 2, 'Diameter: dfs returns 1 + max(left, right) and updates best. What is best updated with?', ['left + right', '1 + left + right', 'max(left, right)', 'left * right'], 0, 'Edges through node = left height + right height.'],
  [['tree-dfs'], 3, 'Why can’t diameter’s dfs just return the diameter of the subtree?', ['Too slow', 'Parent needs height to extend a path, not the subtree’s best path', 'Recursion limit', 'It would double count root'], 1, 'A path through the parent extends only one downward branch.'],
  [['tree-dfs'], 3, 'Max path sum: node returns node.val + max(left, right) where left = max(dfs(l), 0). Why the 0?', ['Avoid None', 'Drop negative branches', 'Count empty path as a node', 'Prevent overflow'], 1, 'Adding a negative chain only lowers the sum.'],
  [['tree-dfs', 'complexity'], 2, 'Balanced check that calls height() at every node on a skewed tree costs?', ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], 2, 'height() is O(n) per node on a chain. The -1 sentinel version is O(n).'],
  [['tree-dfs'], 2, 'In the balanced-tree dfs, what does -1 mean?', ['Empty subtree', 'Subtree somewhere is unbalanced', 'Height is negative', 'Leaf node'], 1, 'A sentinel that propagates failure upward without extra work.'],
  [['tree-dfs'], 1, 'Max depth of an empty tree with the standard recursion?', ['-1', '0', '1', 'Error'], 1, 'Base case: None returns 0.'],
  [['tree-dfs'], 2, 'Same tree check below. Which lines are required for correctness?', ['both None → True', 'one None → False', 'vals differ → False', 'All of these are needed'], 3, 'Without any one of them you crash or return a wrong answer.', `def same(p, q):
    if not p and not q:
        return True
    if not p or not q or p.val != q.val:
        return False
    return same(p.left, q.left) and same(p.right, q.right)`],
  [['bst'], 2, 'Tree 5(4, 6(3, 7)). Does checking each node only against its parent catch the bug?', ['Yes', 'No, 3 is fine vs 6 but less than root 5', 'No, 7 is invalid', 'Yes, 6 > 5 fails'], 1, 'Only ancestor bounds catch 3 in the right subtree of 5.'],
  [['bst'], 2, 'validRange(node.left, ?, ?) for the left child?', ['(low, high)', '(low, node.val)', '(node.val, high)', '(-inf, node.val)'], 1, 'Keep the inherited lower bound; tighten the upper bound.'],
  [['bst'], 1, 'Inorder traversal of a valid BST produces?', ['Random order', 'Sorted ascending', 'Sorted descending', 'Level order'], 1, 'Left subtree smaller, node, right subtree larger.'],
  [['bst', 'complexity'], 2, 'Insert 1..n in order into a plain BST. Search cost afterwards?', ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], 2, 'It degenerates into a linked list of height n.'],
  [['bst'], 2, 'LCA in BST: root=6, p=2, q=4. First move?', ['Return 6', 'Go left', 'Go right', 'Go to p'], 1, 'Both are smaller than 6.'],
  [['bst'], 2, 'LCA in BST when p is an ancestor of q?', ['p', 'q', 'root', 'parent of p'], 0, 'At p the values no longer lie on the same strict side, so p is returned.'],
  [['bst', 'complexity'], 2, 'Iterative inorder kth smallest: time?', ['O(n) always', 'O(h + k)', 'O(k log n)', 'O(log n)'], 1, 'Descend one spine (h), then k pops with amortized moves.'],
  [['bst', 'stack'], 2, 'Iterative inorder: after popping and visiting curr, next step?', ['curr = curr.left', 'curr = curr.right', 'push curr again', 'pop again'], 1, 'Next larger values live in the right subtree.'],
  [['tree-dfs', 'arrays-hashing'], 2, 'Build from preorder + inorder: why a hashmap of inorder indices?', ['To sort values', 'O(1) split lookup instead of O(n) index()', 'To detect duplicates', 'To store parents'], 1, 'Without it, each index() scan makes the build O(n²).'],
  [['tree-dfs'], 3, 'Build from preorder + inorder: why recurse left before right?', ['Arbitrary', 'Preorder lists the whole left subtree before the right', 'Inorder requires it', 'To save memory'], 1, 'preIndex walks preorder; it must consume left values first.'],
  [['tree-bfs'], 2, 'Right side view of 1(2(,5), 3(,4)) ?', ['[1, 3, 4]', '[1, 2, 5]', '[1, 3, 5]', '[1, 3]'], 0, 'Levels: [1], [2,3], [5,4]. Last of each.'],
  [['tree-bfs'], 3, 'Right side view of 1(2(4(5)), 3)?', ['[1, 3]', '[1, 3, 4, 5]', '[1, 2, 4, 5]', '[1, 3, 4]'], 1, 'Deeper levels only have left-side nodes, which become visible.'],
  [['tree-bfs', 'tree-dfs'], 2, 'Minimum depth of a tree: why BFS?', ['Less code', 'Stops at the first leaf found', 'DFS is incorrect', 'BFS uses O(1) space'], 1, 'Levels are processed in order, so the first leaf is the shallowest.'],
  [['heap', 'complexity'], 1, 'heapq.heapify on n items costs?', ['O(n)', 'O(n log n)', 'O(log n)', 'O(1)'], 0, 'Bottom-up sift down sums to linear time.'],
  [['heap'], 2, 'Kth largest of n numbers with a heap. Best choice?', ['Max-heap of all n, pop k times', 'Min-heap capped at k', 'Max-heap capped at k', 'Sorted list'], 1, 'O(n log k) time, O(k) space; root is the answer.'],
  [['heap'], 2, 'Min-heap of size k holding the k largest. heap[0] is?', ['The largest', 'The kth largest', 'The median', 'The smallest overall'], 1, 'Smallest among the top k.'],
  [['heap'], 1, 'Max-heap in Python heapq?', ['heapq.maxheap()', 'Push negated values', 'reverse=True', 'Use sorted()'], 1, 'heapq is min-only; negate on push and pop.'],
  [['heap'], 2, 'heap of (freq, num) tuples. Two entries share freq. Which pops first?', ['Random', 'Smaller num', 'Larger num', 'Error'], 1, 'Tuples compare element by element.'],
  [['heap', 'linked-list'], 3, 'Merge k sorted lists with heap of (val, node). What can crash?', ['Nothing', 'Equal vals compare ListNode objects', 'Negative vals', 'Empty heap'], 1, 'Add an index tiebreaker: (val, i, node).'],
  [['heap', 'ds-diagnosis'], 2, 'Median from a data stream: structures?', ['One min-heap', 'Max-heap low half + min-heap high half', 'BST without balancing', 'Two stacks'], 1, 'Tops of both heaps give the middle in O(1).'],
  [['heap', 'arrays-hashing', 'complexity'], 3, 'Top k frequent with bucket sort runs in?', ['O(n log n)', 'O(n log k)', 'O(n)', 'O(k)'], 2, 'Frequencies are bounded by n, so index buckets by frequency.'],
  [['heap', 'constraints'], 2, 'n = 10^6 numbers, k = 10. Kth largest with a k-heap does about?', ['10^6 ops', '3·10^6 ops (n log k)', '2·10^7 ops', '10^12 ops'], 1, 'log2(10) ≈ 3.3, so n log k ≈ 3·10^6.'],
  [['trie'], 1, 'Trie search(word) returns?', ['True if path exists', 'curr.endOfWord after walking', 'len(children) > 0', 'True if any child'], 1, 'Path existing alone means prefix, not word.'],
  [['trie'], 2, 'After insert("apple"), search("app")?', ['True', 'False', 'Error', 'Depends on order'], 1, 'Path exists, but endOfWord at "p" is False.'],
  [['trie', 'complexity'], 2, 'Trie insert time for word length L with N words stored?', ['O(N)', 'O(L)', 'O(L log N)', 'O(N·L)'], 1, 'One dict hop per character, independent of N.'],
  [['trie', 'ds-diagnosis'], 2, 'Word Search II (many words on a grid). Why a trie?', ['Sorting words', 'Prune DFS when the prefix matches no word', 'O(1) lookup per word', 'Less memory than a set'], 1, 'One grid DFS checks all words; dead prefixes stop early.'],
  [['trie', 'ds-diagnosis'], 3, 'Design add/search with "." wildcard. Search on "." does what?', ['Fails', 'Tries every child recursively', 'Skips the char', 'Matches only first child'], 1, 'DFS over all children at that position.'],
]

const mcqs = mcqRows.map(([skills, difficulty, q, choices, answer, why, code], i) => ({
  id: `trees:mcq:${i + 1}`,
  skills,
  difficulty,
  q,
  ...(code ? { code } : {}),
  choices,
  answer,
  why,
}))

const clozes = [
  {
    id: 'trees:cloze:1',
    skills: ['tree-dfs'],
    title: 'Max depth',
    code: `def maxDepth(self, root: Optional[TreeNode]) -> int:
    if not root:
        return [[0]]

    return [[1 + max(self.maxDepth(root.left), self.maxDepth(root.right))|1+max(self.maxDepth(root.left),self.maxDepth(root.right))]]`,
    hint: 'Base case, then one plus the taller child.',
  },
  {
    id: 'trees:cloze:2',
    skills: ['tree-bfs', 'queue-deque'],
    title: 'Level order loop',
    code: `while queue:
    level = []

    for _ in range([[len(queue)]]):
        node = queue.[[popleft()]]
        level.append(node.val)

        if node.left:
            queue.append(node.left)
        if node.right:
            queue.append(node.right)

    result.[[append(level)]]`,
    hint: 'Snapshot the level size.',
  },
  {
    id: 'trees:cloze:3',
    skills: ['bst', 'tree-dfs'],
    title: 'Validate BST bounds',
    code: `def validRange(node, low, high):
    if not node:
        return [[True]]
    if not [[low < node.val < high]]:
        return False
    return validRange(node.left, low, [[node.val]]) and validRange(node.right, [[node.val]], high)`,
  },
  {
    id: 'trees:cloze:4',
    skills: ['bst', 'stack'],
    title: 'Iterative inorder',
    code: `while stack or curr:
    while curr:
        stack.append(curr)
        curr = [[curr.left]]

    curr = [[stack.pop()]]
    k -= 1
    if k == 0:
        return curr.val

    curr = [[curr.right]]`,
  },
  {
    id: 'trees:cloze:5',
    skills: ['tree-dfs'],
    title: 'Diameter',
    code: `def dfs(node):
    if not node:
        return 0

    left = dfs(node.left)
    right = dfs(node.right)

    self.best = max([[left + right|left+right]], self.best)

    return [[1 + max(left, right)|1+max(left,right)]]`,
    hint: 'Track the path, return the height.',
  },
  {
    id: 'trees:cloze:6',
    skills: ['heap'],
    title: 'Kth largest heap',
    code: `heap = []

for num in nums:
    heapq.[[heappush]](heap, num)

    if len(heap) > [[k]]:
        heapq.[[heappop]](heap)

return heap[0]`,
  },
  {
    id: 'trees:cloze:7',
    skills: ['trie'],
    title: 'Trie insert',
    code: `def insert(self, word: str) -> None:
    curr = self.root

    for c in word:
        if c not in [[curr.children]]:
            curr.children[c] = [[TrieNode()]]
        curr = curr.children[c]

    curr.[[endOfWord]] = True`,
  },
  {
    id: 'trees:cloze:8',
    skills: ['bst'],
    title: 'LCA in BST',
    code: `curr = root

while curr:
    if p.val < curr.val and q.val < curr.val:
        curr = [[curr.left]]
    elif p.val > curr.val and q.val > curr.val:
        curr = [[curr.right]]
    else:
        return [[curr]]`,
  },
  {
    id: 'trees:cloze:9',
    skills: ['tree-bfs'],
    title: 'Right side view',
    code: `while queue:
    levelSize = len(queue)

    for i in range(levelSize):
        node = queue.popleft()

        if i == [[levelSize - 1|levelSize-1]]:
            result.append(node.val)

        if node.left:
            queue.append([[node.left]])
        if node.right:
            queue.append([[node.right]])`,
  },
  {
    id: 'trees:cloze:10',
    skills: ['heap', 'arrays-hashing'],
    title: 'Top k frequent (buckets)',
    code: `counted = Counter(nums)

buckets = [list() for _ in range([[len(nums) + 1|len(nums)+1]])]
for num, freq in counted.items():
    buckets[freq].[[append]](num)

result = []
for i in range(len(buckets) - 1, 0, [[-1]]):
    for num in buckets[i]:
        result.append(num)
        if len(result) == k:
            return result`,
    hint: 'Index buckets by frequency, read from the top.',
  },
]

const parsons = [
  {
    id: 'trees:parsons:1',
    skills: ['tree-bfs', 'queue-deque'],
    title: 'Level order traversal',
    lines: [
      'result = []',
      'queue = deque([root])',
      'while queue:',
      '    level = []',
      '    for _ in range(len(queue)):',
      '        node = queue.popleft()',
      '        level.append(node.val)',
      '        if node.left:',
      '            queue.append(node.left)',
      '        if node.right:',
      '            queue.append(node.right)',
      '    result.append(level)',
      'return result',
    ],
    distractors: ['        node = queue.pop()', '    while queue:'],
  },
  {
    id: 'trees:parsons:2',
    skills: ['tree-dfs'],
    title: 'Max depth via inner dfs',
    lines: [
      'def dfs(node):',
      '    if not node:',
      '        return 0',
      '    left = dfs(node.left)',
      '    right = dfs(node.right)',
      '    return 1 + max(left, right)',
      'return dfs(root)',
    ],
    distractors: ['        return 1', '    return left + right'],
  },
  {
    id: 'trees:parsons:3',
    skills: ['bst', 'tree-dfs'],
    title: 'Validate BST',
    lines: [
      'def validRange(node, low, high):',
      '    if not node:',
      '        return True',
      '    if not low < node.val < high:',
      '        return False',
      '    return validRange(node.left, low, node.val) and validRange(node.right, node.val, high)',
      "return validRange(root, float('-inf'), float('inf'))",
    ],
    distractors: ['    if node.left.val > node.val:'],
  },
  {
    id: 'trees:parsons:4',
    skills: ['bst', 'stack'],
    title: 'Kth smallest iterative',
    lines: [
      'stack = []',
      'curr = root',
      'while stack or curr:',
      '    while curr:',
      '        stack.append(curr)',
      '        curr = curr.left',
      '    curr = stack.pop()',
      '    k -= 1',
      '    if k == 0:',
      '        return curr.val',
      '    curr = curr.right',
    ],
    distractors: ['        curr = curr.right', '    curr = curr.left'],
  },
  {
    id: 'trees:parsons:5',
    skills: ['trie'],
    title: 'Trie search',
    lines: [
      'def search(self, word: str) -> bool:',
      '    curr = self.root',
      '    for c in word:',
      '        if c not in curr.children:',
      '            return False',
      '        curr = curr.children[c]',
      '    return curr.endOfWord',
    ],
    distractors: ['    return True', '            curr.children[c] = TrieNode()'],
  },
  {
    id: 'trees:parsons:6',
    skills: ['heap'],
    title: 'Kth largest with min-heap',
    lines: [
      'heap = []',
      'for num in nums:',
      '    heapq.heappush(heap, num)',
      '    if len(heap) > k:',
      '        heapq.heappop(heap)',
      'return heap[0]',
    ],
    distractors: ['    heapq.heappush(heap, -num)', 'return heap[-1]'],
  },
  {
    id: 'trees:parsons:7',
    skills: ['tree-dfs'],
    title: 'Balanced tree',
    lines: [
      'def dfs(node):',
      '    if not node:',
      '        return 0',
      '    left = dfs(node.left)',
      '    right = dfs(node.right)',
      '    if left == -1 or right == -1 or abs(left - right) > 1:',
      '        return -1',
      '    return 1 + max(left, right)',
      'return dfs(root) != -1',
    ],
    distractors: ['    if abs(left - right) > 1:'],
  },
  {
    id: 'trees:parsons:8',
    skills: ['tree-dfs'],
    title: 'Invert binary tree',
    lines: [
      'def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:',
      '    if not root:',
      '        return None',
      '    root.left, root.right = root.right, root.left',
      '    self.invertTree(root.left)',
      '    self.invertTree(root.right)',
      '    return root',
    ],
    distractors: ['    root.left = root.right'],
  },
]

const problems = [
  {
    id: 'trees:problem:104',
    lc: 104,
    title: 'Maximum Depth of Binary Tree',
    difficulty: 'Easy',
    google: true,
    skills: ['tree-dfs'],
    pattern: 'Bottom-up DFS',
    ds: ['binary tree'],
    constraints: '0 ≤ n ≤ 10^4',
    time: 'O(n)',
    space: 'O(h)',
    insight: 'Depth = 1 + taller child. Return value carries the answer up.',
    signals: ['depth', 'longest root-to-leaf'],
    narration: [
      'Empty tree returns 0, single node returns 1.',
      'dfs(node) returns the height of its subtree.',
      'Base: None is 0. Combine: 1 + max(left, right).',
      'O(n) time, O(h) stack; BFS counting levels also works.',
    ],
    solution: `class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:

        def dfs(node):
            if not node:
                return 0

            left = dfs(node.left)
            right = dfs(node.right)

            return 1 + max(left, right)

        return dfs(root)`,
    traceId: 'trees:trace:max-depth',
    pitfalls: ['Empty root', 'Recursion depth on a 10^4 chain: mention iterative fallback'],
  },
  {
    id: 'trees:problem:102',
    lc: 102,
    title: 'Binary Tree Level Order Traversal',
    difficulty: 'Medium',
    google: true,
    skills: ['tree-bfs', 'queue-deque'],
    pattern: 'BFS by level',
    ds: ['deque'],
    constraints: '0 ≤ n ≤ 2000',
    time: 'O(n)',
    space: 'O(w)',
    insight: 'Snapshot len(queue): one inner loop per level.',
    signals: ['level by level', 'each depth', 'left to right'],
    narration: [
      'Output is a list per level, so BFS with a queue.',
      'For each level I snapshot len(queue) and pop exactly that many.',
      'Children go to the back, so they form the next level.',
      'O(n) time, O(w) space for the widest level.',
    ],
    solution: `from collections import deque

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
    traceId: 'trees:trace:level-order',
    pitfalls: ['Empty root returns []', 'Using list.pop(0) makes it O(n²)'],
  },
  {
    id: 'trees:problem:98',
    lc: 98,
    title: 'Validate Binary Search Tree',
    difficulty: 'Medium',
    google: true,
    skills: ['bst', 'tree-dfs'],
    pattern: 'Top-down DFS with bounds',
    ds: ['binary tree'],
    constraints: '1 ≤ n ≤ 10^4, -2^31 ≤ val ≤ 2^31 - 1',
    time: 'O(n)',
    space: 'O(h)',
    insight: 'Each node lives in a (low, high) window set by all ancestors.',
    signals: ['valid BST', 'strictly less', 'every node in left subtree'],
    narration: [
      'Clarify: duplicates invalid? I assume strict.',
      'Parent-only checks miss deep violations, so I pass bounds down.',
      'Left child gets (low, node.val), right gets (node.val, high).',
      'O(n) time, O(h) space. Inorder-sorted check also works.',
    ],
    solution: `class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:

        def validRange(node, low, high):
            if not node:
                return True
            if not low < node.val < high:
                return False
            return validRange(node.left, low, node.val) and validRange(node.right, node.val, high)

        return validRange(root, float('-inf'), float('inf'))`,
    traceId: 'trees:trace:valid-bst',
    pitfalls: ['Only comparing with direct children', 'Using INT_MIN sentinels instead of infinities', 'Duplicates'],
  },
  {
    id: 'trees:problem:235',
    lc: 235,
    title: 'Lowest Common Ancestor of a BST',
    difficulty: 'Medium',
    google: false,
    skills: ['bst'],
    pattern: 'BST walk to split point',
    ds: ['BST'],
    constraints: '2 ≤ n ≤ 10^5, p and q exist',
    time: 'O(h)',
    space: 'O(1)',
    insight: 'The LCA is the first node where p and q fall on different sides.',
    signals: ['BST', 'lowest common ancestor'],
    narration: [
      'BST ordering tells me which side each target lives on.',
      'Both smaller: go left. Both larger: go right.',
      'Otherwise they split here, or one equals curr: answer.',
      'O(h) time, O(1) space iteratively.',
    ],
    solution: `class Solution:
    def lowestCommonAncestor(self, root: TreeNode, p: TreeNode, q: TreeNode) -> TreeNode:
        curr = root

        while curr:
            if p.val < curr.val and q.val < curr.val:
                curr = curr.left
            elif p.val > curr.val and q.val > curr.val:
                curr = curr.right
            else:
                return curr`,
    traceId: 'trees:trace:lca-bst',
    pitfalls: ['p is an ancestor of q', 'Using general-tree LCA misses the O(h) shortcut'],
  },
  {
    id: 'trees:problem:543',
    lc: 543,
    title: 'Diameter of Binary Tree',
    difficulty: 'Easy',
    google: true,
    skills: ['tree-dfs'],
    pattern: 'Bottom-up DFS + global best',
    ds: ['binary tree'],
    constraints: '1 ≤ n ≤ 10^4',
    time: 'O(n)',
    space: 'O(h)',
    insight: 'Return height; record left + right at every node.',
    signals: ['longest path between any two nodes', 'may not pass through root'],
    narration: [
      'Diameter in edges; may not pass through root.',
      'dfs returns height so the parent can extend one branch.',
      'At each node, left + right is the best path bending here.',
      'O(n) time, O(h) space.',
    ],
    solution: `class Solution:
    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:

        self.best = 0

        def dfs(node):
            if not node:
                return 0

            left = dfs(node.left)
            right = dfs(node.right)

            self.best = max(left + right, self.best)

            return 1 + max(left, right)

        dfs(root)

        return self.best`,
    traceId: 'trees:trace:diameter',
    pitfalls: ['Counting nodes instead of edges', 'Only checking the root'],
  },
  {
    id: 'trees:problem:110',
    lc: 110,
    title: 'Balanced Binary Tree',
    difficulty: 'Easy',
    google: false,
    skills: ['tree-dfs'],
    pattern: 'Bottom-up DFS with sentinel',
    ds: ['binary tree'],
    constraints: '0 ≤ n ≤ 5000',
    time: 'O(n)',
    space: 'O(h)',
    insight: 'Return height or -1; failure propagates up for free.',
    signals: ['height-balanced', 'differ by more than one'],
    narration: [
      'Naive height() per node is O(n²) on a chain.',
      'dfs returns height, or -1 if unbalanced below.',
      'If a child is -1 or heights differ by >1, return -1.',
      'One pass: O(n) time, O(h) space.',
    ],
    solution: `class Solution:
    def isBalanced(self, root: Optional[TreeNode]) -> bool:

        def dfs(node):
            if not node:
                return 0

            left = dfs(node.left)
            right = dfs(node.right)

            if left == -1 or right == -1 or abs(left - right) > 1:
                return -1

            return 1 + max(left, right)

        return dfs(root) != -1`,
    traceId: 'trees:trace:balanced',
    pitfalls: ['Checking only the root’s balance', 'O(n²) recomputing heights'],
  },
  {
    id: 'trees:problem:230',
    lc: 230,
    title: 'Kth Smallest Element in a BST',
    difficulty: 'Medium',
    google: true,
    skills: ['bst', 'stack'],
    pattern: 'Iterative inorder',
    ds: ['stack'],
    constraints: '1 ≤ k ≤ n ≤ 10^4',
    time: 'O(h + k)',
    space: 'O(h)',
    insight: 'Inorder of a BST is sorted; stop at the kth pop.',
    signals: ['kth smallest', 'BST'],
    narration: [
      'Inorder visits a BST in sorted order.',
      'Iterative stack lets me stop at the kth visit.',
      'Push left spine, pop, count, go right.',
      'O(h + k) time, O(h) space. Follow-up: store subtree sizes.',
    ],
    solution: `class Solution:
    def kthSmallest(self, root: Optional[TreeNode], k: int) -> int:
        stack = []
        curr = root

        while stack or curr:
            while curr:
                stack.append(curr)
                curr = curr.left

            curr = stack.pop()
            k -= 1
            if k == 0:
                return curr.val

            curr = curr.right`,
    traceId: 'trees:trace:kth-smallest',
    pitfalls: ['Building the full list costs O(n) when k is small', 'Off-by-one on k'],
  },
  {
    id: 'trees:problem:199',
    lc: 199,
    title: 'Binary Tree Right Side View',
    difficulty: 'Medium',
    google: true,
    skills: ['tree-bfs', 'queue-deque'],
    pattern: 'BFS, last node per level',
    ds: ['deque'],
    constraints: '0 ≤ n ≤ 100',
    time: 'O(n)',
    space: 'O(w)',
    insight: 'Visible node = last node of each BFS level.',
    signals: ['standing on the right side', 'top to bottom'],
    narration: [
      'Visible node per depth is the rightmost at that depth.',
      'BFS by level, record node when i == levelSize - 1.',
      'Left nodes can be visible if the right side is shorter.',
      'O(n) time, O(w) space.',
    ],
    solution: `from collections import deque

class Solution:
    def rightSideView(self, root: Optional[TreeNode]) -> List[int]:
        result = []
        queue = deque([root]) if root else deque()

        while queue:
            levelSize = len(queue)

            for i in range(levelSize):
                node = queue.popleft()

                if i == levelSize - 1:
                    result.append(node.val)

                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)

        return result`,
    traceId: 'trees:trace:right-side',
    pitfalls: ['Only walking right children', 'Empty root'],
  },
  {
    id: 'trees:problem:105',
    lc: 105,
    title: 'Construct Binary Tree from Preorder and Inorder',
    difficulty: 'Medium',
    google: true,
    skills: ['tree-dfs', 'arrays-hashing'],
    pattern: 'Divide by inorder index',
    ds: ['hashmap'],
    constraints: '1 ≤ n ≤ 3000, unique values',
    time: 'O(n)',
    space: 'O(n)',
    insight: 'Preorder picks the root; inorder splits left and right.',
    signals: ['preorder and inorder', 'construct', 'unique values'],
    narration: [
      'Values are unique, so inorder index lookup is safe.',
      'preorder[preIndex] is the next root.',
      'Its inorder index splits the range: left side, right side.',
      'Hashmap makes splits O(1): O(n) total, O(n) space.',
    ],
    solution: `class Solution:
    def buildTree(self, preorder: List[int], inorder: List[int]) -> Optional[TreeNode]:

        hashedIndex = {val: idx for idx, val in enumerate(inorder)}

        self.preIndex = 0

        def dfs(l, r):
            if l > r:
                return None

            root = TreeNode(preorder[self.preIndex])
            mid = hashedIndex[preorder[self.preIndex]]
            self.preIndex += 1
            root.left = dfs(l, mid - 1)
            root.right = dfs(mid + 1, r)
            return root

        return dfs(0, len(preorder) - 1)`,
    traceId: 'trees:trace:build-tree',
    pitfalls: ['Building right before left', 'Slicing arrays makes it O(n²)'],
  },
  {
    id: 'trees:problem:215',
    lc: 215,
    title: 'Kth Largest Element in an Array',
    difficulty: 'Medium',
    google: true,
    skills: ['heap', 'ds-diagnosis'],
    pattern: 'Min-heap of size k',
    ds: ['heap'],
    constraints: '1 ≤ k ≤ n ≤ 10^5',
    time: 'O(n log k)',
    space: 'O(k)',
    insight: 'Keep the k largest; the smallest of them is the answer.',
    signals: ['kth largest', 'without sorting'],
    narration: [
      'Sorting is O(n log n); I can do O(n log k).',
      'Min-heap capped at k holds the k largest so far.',
      'When it exceeds k, pop the min: it cannot be the answer.',
      'heap[0] is kth largest. Quickselect: O(n) average.',
    ],
    solution: `import heapq

class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        heap = []

        for num in nums:
            heapq.heappush(heap, num)

            if len(heap) > k:
                heapq.heappop(heap)

        return heap[0]`,
    traceId: 'trees:trace:kth-largest',
    pitfalls: ['Using a max-heap of all n', 'Duplicates still count separately'],
  },
  {
    id: 'trees:problem:347',
    lc: 347,
    title: 'Top K Frequent Elements',
    difficulty: 'Medium',
    google: true,
    skills: ['heap', 'arrays-hashing'],
    pattern: 'Count + bucket sort (or heap)',
    ds: ['hashmap', 'heap'],
    constraints: '1 ≤ n ≤ 10^5, answer is unique',
    time: 'O(n)',
    space: 'O(n)',
    insight: 'Frequencies are ≤ n, so bucket by frequency.',
    signals: ['k most frequent', 'better than O(n log n)'],
    narration: [
      'Count with a Counter first.',
      'Heap of size k gives O(n log k).',
      'Better: frequencies are at most n, so bucket by frequency.',
      'Read buckets from high to low until I have k. O(n).',
    ],
    solution: `from collections import Counter

class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:

        counted = Counter(nums)

        buckets = [[] for _ in range(len(nums) + 1)]
        for num, freq in counted.items():
            buckets[freq].append(num)

        result = []

        for i in range(len(buckets) - 1, 0, -1):
            for num in buckets[i]:
                result.append(num)
                if len(result) == k:
                    return result`,
    traceId: 'trees:trace:top-k-frequent',
    pitfalls: ['Bucket array size must be n + 1', 'Sorting the whole Counter is O(n log n)'],
  },
  {
    id: 'trees:problem:208',
    lc: 208,
    title: 'Implement Trie (Prefix Tree)',
    difficulty: 'Medium',
    google: true,
    skills: ['trie'],
    pattern: 'Trie',
    ds: ['trie', 'hashmap'],
    constraints: '1 ≤ word length ≤ 2000, ≤ 3·10^4 calls',
    time: 'O(L) per op',
    space: 'O(total chars)',
    insight: 'Dict of children per node plus an end-of-word flag.',
    signals: ['prefix', 'startsWith', 'autocomplete'],
    narration: [
      'Each node: children dict and endOfWord flag.',
      'insert walks chars, creating missing nodes, marks end.',
      'search needs endOfWord; startsWith only needs the path.',
      'O(L) per operation regardless of how many words.',
    ],
    solution: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.endOfWord = False

class Trie:

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
    traceId: 'trees:trace:trie',
    pitfalls: ['search returning True for a prefix', 'Forgetting endOfWord on insert'],
  },
]

const makeRng = seed => {
  let s = (seed * 2654435761) >>> 0 || 1
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    s >>>= 0
    return s / 4294967296
  }
}

const shuffleAnswer = (rng, correct, wrongs) => {
  const choices = [correct, ...wrongs]
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[choices[i], choices[j]] = [choices[j], choices[i]]
  }
  return { choices, answer: choices.indexOf(correct) }
}

const shapes = [
  { name: 'perfectly balanced', dfs: 'O(log n)', bfs: 'O(n)', best: 'DFS', why: 'Height log n; last level holds about n/2 nodes.' },
  { name: 'a single left-leaning chain', dfs: 'O(n)', bfs: 'O(1)', best: 'BFS', why: 'Height n; each level has one node.' },
  { name: 'a star-like root with many leaf children (n-ary)', dfs: 'O(1)', bfs: 'O(n)', best: 'DFS', why: 'Depth 2; one level holds n - 1 nodes.' },
]

const generators = [
  {
    id: 'trees:gen:traversal-space',
    title: 'DFS vs BFS space by tree shape',
    skills: ['tree-dfs', 'tree-bfs', 'complexity'],
    make(seed) {
      const rng = makeRng(seed)
      const shape = shapes[Math.floor(rng() * shapes.length)]
      const n = [1000, 10000, 100000, 1000000][Math.floor(rng() * 4)]
      const askBfs = rng() < 0.5
      const correct = askBfs ? shape.bfs : shape.dfs
      const pool = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'].filter(c => c !== correct)
      const { choices, answer } = shuffleAnswer(rng, correct, pool)
      return {
        id: `trees:gen:traversal-space:${seed}`,
        skills: ['tree-dfs', 'tree-bfs', 'complexity'],
        difficulty: 2,
        q: `Tree with n = ${n.toLocaleString('en-US')} nodes, shaped as ${shape.name}. Extra space of ${askBfs ? 'BFS (queue)' : 'recursive DFS (stack)'}?`,
        choices,
        answer,
        why: `${shape.why} DFS is O(h), BFS is O(w); ${shape.best} is lighter here.`,
      }
    },
  },
]

export default {
  id: 'trees',
  title: 'Trees, Heaps & Tries',
  icon: 'tree',
  skills: ['tree-dfs', 'tree-bfs', 'bst', 'heap', 'trie'],
  lessons,
  traces,
  flashcards,
  mcqs,
  clozes,
  parsons,
  problems,
  extras: { generators },
}
