export default {
  id: 'trees-design',
  title: 'Trees, heaps & OOP design',
  icon: '🌳',
  minutes: 25,

  summary: [
    '==Bottom-up DFS==: dfs(node) returns a value for the PARENT. ==Top-down DFS==: pass ancestor state down.',
    'Global best in bottom-up? Use ==self.x== (set once before dfs, no nonlocal needed).',
    '==BFS==: queue, snapshot ==len(queue)== before looping the level.',
    '==BST==: ordering skips a whole subtree. Search, insert, LCA all O(h).',
    '==Heap==: min-heap size k keeps the k largest. Negate values for max-heap behavior.',
    'Median = two heaps: small = max-heap (negated), large = min-heap, sizes within 1.',
    '==LRU==: dict (key→node) + doubly linked list. get moves to front, put evicts the back.',
    'Stuck? Ask: level or path? children or ancestors? sorted or not?',
  ],

  sections: [
    {
      kind: 'tree',
      title: 'Tree or stream? → algorithm',
      root: {
        q: 'What are you given?',
        options: [
          {
            label: 'A tree (root, TreeNode)',
            next: {
              q: 'Is there a BST invariant (left < node < right)?',
              options: [
                {
                  label: 'Yes, sorted order matters',
                  next: {
                    q: 'What do you need?',
                    options: [
                      {
                        label: 'search a value / insert a value',
                        leaf: { result: 'BST walk down, no recursion needed', ds: 'none, just pointers', time: 'O(h)', why: 'ordering halves the space each step', ref: 'BST walk: search, insert, LCA' },
                      },
                      {
                        label: 'lowest common ancestor of two nodes',
                        leaf: { result: 'BST LCA walk: go left/right until split', ds: 'none', time: 'O(h)', why: 'split point is where paths diverge', ref: 'BST walk: search, insert, LCA' },
                      },
                      {
                        label: 'kth smallest value',
                        leaf: { result: 'iterative inorder with an explicit stack', ds: 'stack', time: 'O(h + k)', why: 'inorder on a BST is sorted order', ref: 'Inorder iterative (kth smallest)' },
                      },
                    ],
                  },
                },
                {
                  label: 'No, plain binary tree',
                  next: {
                    q: 'Grouped by level, built top-down, or built bottom-up?',
                    options: [
                      {
                        label: 'By level (right view, zigzag, min depth)',
                        leaf: { result: 'BFS, snapshot len(queue) per level', ds: 'queue (deque)', time: 'O(n)', why: 'queue pops nodes in distance order', ref: 'BFS level order (snapshot queue)' },
                      },
                      {
                        label: 'Top-down: answer needs ancestors (bounds, depth)',
                        leaf: { result: 'DFS, pass extra state down as args', ds: 'recursion + extra params', time: 'O(n)', why: 'a node needs info only ancestors know', ref: 'DFS top-down (pass state down)' },
                      },
                      {
                        label: 'Bottom-up: answer is local to this subtree',
                        leaf: { result: 'DFS, return a value up to the parent', ds: 'recursion (call stack)', time: 'O(n)', why: 'each node combines its two children once', ref: 'DFS bottom-up (return height)' },
                      },
                      {
                        label: 'Bottom-up: best value anywhere in the tree',
                        leaf: { result: 'DFS return + self.best tracked across calls', ds: 'recursion + one self.x', time: 'O(n)', why: 'the best path need not touch the root', ref: 'DFS bottom-up (return height)' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            label: 'A stream / array, need top-k or a running stat',
            next: {
              q: 'What do you need?',
              options: [
                {
                  label: 'kth largest (array, or add() on a stream)',
                  leaf: { result: 'min-heap capped at size k', ds: 'heap (heapq)', time: 'O(n log k)', why: 'heap[0] is always the kth largest', ref: 'Heaps: kth largest, top-k, median' },
                },
                {
                  label: 'k most frequent elements',
                  leaf: { result: 'Counter, then min-heap of (freq, num) size k', ds: 'hashmap + heap', time: 'O(n log k)', why: 'counting turns it into kth-largest-by-freq', ref: 'Heaps: kth largest, top-k, median' },
                },
                {
                  label: 'running median as numbers stream in',
                  leaf: { result: 'two heaps: max-heap low half, min-heap high half', ds: 'two heaps', time: 'O(log n) per op', why: 'the middle sits on top of one heap', ref: 'Heaps: kth largest, top-k, median' },
                },
                {
                  label: 'O(1) get/put by key, evict oldest-used',
                  leaf: { result: 'hashmap + doubly linked list (LRU)', ds: 'dict + DLL', time: 'O(1)', why: 'dict finds the node, list tracks recency', ref: 'LRU cache (dict + doubly linked list)' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'table',
      title: 'Pattern → data structure → complexity',
      columns: ['Need', 'Data structure', 'Time', 'Space'],
      rows: [
        ['Level order / right view / zigzag', 'queue (deque)', 'O(n)', 'O(w)'],
        ['DFS bottom-up (height, balance, diameter)', 'recursion, call stack', 'O(n)', 'O(h)'],
        ['DFS top-down (bounds, depth, pathMax)', 'recursion + extra args', 'O(n)', 'O(h)'],
        ['BST search / insert', 'none, just pointers', 'O(h)', 'O(1) / O(h) rec'],
        ['Kth smallest in BST', 'stack, iterative inorder', 'O(h + k)', 'O(h)'],
        ['Kth largest, stream or array', 'min-heap size k', 'O(n log k)', 'O(k)'],
        ['Top-k frequent', 'hashmap + heap', 'O(n log k)', 'O(n)'],
        ['Running median', 'two heaps', 'O(log n) / op', 'O(n)'],
        ['LRU cache', 'dict + doubly linked list', 'O(1)', 'O(capacity)'],
        ['Serialize / deserialize tree', 'preorder string + sentinel', 'O(n)', 'O(n)'],
        ['Min stack with O(1) getMin', 'stack of (val, minSoFar)', 'O(1)', 'O(n)'],
        ['Time-based key lookup', 'dict of lists + bisect', 'O(log n)', 'O(n)'],
      ],
    },
    {
      kind: 'boilerplate',
      title: 'BFS level order (snapshot queue)',
      when: 'level-by-level order, width, right view, zigzag, min depth',
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
      time: 'O(n)',
      space: 'O(w)',
      knobs: [
        {
          change: 'right side view (last node per level)',
          how: 'snapshot levelSize, then keep node.val only when i == levelSize - 1',
          code: `levelSize = len(queue)
for i in range(levelSize):
    node = queue.popleft()
    if i == levelSize - 1:
        result.append(node.val)`,
        },
        {
          change: 'zigzag (alternate direction per level)',
          how: 'track leftToRight bool, reverse the level list before appending it',
          code: `if not leftToRight:
    level.reverse()
result.append(level)
leftToRight = not leftToRight`,
        },
        {
          change: 'minimum depth (shortest root-to-leaf path)',
          how: 'return depth the moment you pop a node with no children',
          code: `if not node.left and not node.right:
    return depth`,
        },
      ],
    },
    {
      kind: 'boilerplate',
      title: 'DFS bottom-up (return height)',
      when: 'answer combines from children: height, sum, balance, diameter',
      code: `class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:

        def dfs(node):
            if not node:
                return 0

            left = dfs(node.left)
            right = dfs(node.right)

            return 1 + max(left, right)

        return dfs(root)`,
      time: 'O(n)',
      space: 'O(h)',
      knobs: [
        {
          change: 'diameter (longest path through any node)',
          how: 'init self.best = 0 before dfs; update it with left + right each call',
          code: `self.best = max(left + right, self.best)
return 1 + max(left, right)`,
        },
        {
          change: 'is the tree balanced',
          how: 'return -1 sentinel the moment a child is -1 or heights differ by >1',
          code: `if left == -1 or right == -1 or abs(left - right) > 1:
    return -1
return 1 + max(left, right)`,
        },
        {
          change: 'max path sum (values can be negative)',
          how: 'clamp each side with max(0, dfs(...)) so a bad branch contributes 0',
          code: `left = max(0, dfs(node.left))
right = max(0, dfs(node.right))
self.maxSum = max(self.maxSum, node.val + left + right)
return node.val + max(left, right)`,
        },
      ],
    },
    {
      kind: 'boilerplate',
      title: 'DFS top-down (pass state down)',
      when: 'answer depends on ancestors: bounds, running max, depth',
      code: `class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:

        self.ans = 0

        def dfs(node, depth):
            if not node:
                return

            self.ans = max(self.ans, depth)
            dfs(node.left, depth + 1)
            dfs(node.right, depth + 1)

        dfs(root, 1)

        return self.ans`,
      time: 'O(n)',
      space: 'O(h)',
      knobs: [
        {
          change: 'validate BST',
          how: 'pass (low, high) bounds instead of depth; fail if node.val is outside',
          code: `def dfs(node, low, high):
    if not node:
        return True
    if not low < node.val < high:
        return False
    return dfs(node.left, low, node.val) and dfs(node.right, node.val, high)`,
        },
        {
          change: 'count good nodes (val ≥ every ancestor)',
          how: 'pass pathMax instead of depth; bump self.total when node.val ≥ pathMax',
          code: `def dfs(node, pathMax):
    if not node:
        return
    if node.val >= pathMax:
        self.total += 1
        pathMax = node.val
    dfs(node.left, pathMax)
    dfs(node.right, pathMax)`,
        },
      ],
    },
    {
      kind: 'boilerplate',
      title: 'BST walk: search, insert, LCA',
      when: 'sorted invariant lets you skip a whole subtree',
      code: `class Solution:
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
      space: 'O(1) search, O(h) insert',
      knobs: [
        {
          change: 'LCA in a BST',
          how: 'walk down: go left if both smaller, right if both larger, else stop',
          code: `curr = root
while curr:
    if p.val < curr.val and q.val < curr.val:
        curr = curr.left
    elif p.val > curr.val and q.val > curr.val:
        curr = curr.right
    else:
        return curr`,
        },
        {
          change: 'LCA in a general tree (no ordering)',
          how: 'recurse both sides; if both return non-null, the current node is the LCA',
          code: `def lowestCommonAncestor(self, root, p, q):
    if not root or root == p or root == q:
        return root

    left = self.lowestCommonAncestor(root.left, p, q)
    right = self.lowestCommonAncestor(root.right, p, q)

    if left and right:
        return root
    return left or right`,
        },
      ],
    },
    {
      kind: 'boilerplate',
      title: 'Inorder iterative (kth smallest)',
      when: 'need sorted order from a BST, no recursion',
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
      time: 'O(h + k)',
      space: 'O(h)',
      knobs: [
        {
          change: 'return the full sorted list',
          how: 'drop the k counter; append curr.val to result on every pop',
          code: `curr = stack.pop()
result.append(curr.val)
curr = curr.right`,
        },
        {
          change: 'kth largest instead of smallest',
          how: 'push and descend right first, left second (reverse inorder)',
          code: `while curr:
    stack.append(curr)
    curr = curr.right
curr = stack.pop()
curr = curr.left`,
        },
      ],
    },
    {
      kind: 'boilerplate',
      title: 'Serialize / deserialize (preorder, N for null)',
      when: 'turn a tree into a string, then rebuild it exactly',
      code: `class Codec:

    def serialize(self, root: Optional[TreeNode]) -> str:
        result = []

        def dfs(node):
            if not node:
                result.append('N')
                return

            result.append(str(node.val))
            dfs(node.left)
            dfs(node.right)

        dfs(root)
        return ','.join(result)

    def deserialize(self, data: str) -> Optional[TreeNode]:
        values = data.split(',')
        self.i = 0

        def dfs():
            if values[self.i] == 'N':
                self.i += 1
                return None

            node = TreeNode(int(values[self.i]))
            self.i += 1
            node.left = dfs()
            node.right = dfs()

            return node

        return dfs()`,
      time: 'O(n)',
      space: 'O(n)',
      knobs: [
        {
          change: 'level-order (BFS) serialization instead',
          how: 'use a queue, push both children even when None, write N for them',
          code: `queue = deque([root]) if root else deque()
result = []
while queue:
    node = queue.popleft()
    if node:
        result.append(str(node.val))
        queue.append(node.left)
        queue.append(node.right)
    else:
        result.append('N')`,
        },
      ],
    },
    {
      kind: 'boilerplate',
      title: 'Heaps: kth largest, top-k, median',
      when: 'need the biggest / most-frequent / middle from a stream',
      code: `import heapq

class KthLargest:

    def __init__(self, k: int, nums: List[int]):
        self.heap = nums
        self.k = k
        heapq.heapify(self.heap)

        while len(self.heap) > k:
            heapq.heappop(self.heap)

    def add(self, val: int) -> int:
        heapq.heappush(self.heap, val)

        if len(self.heap) > self.k:
            heapq.heappop(self.heap)

        return self.heap[0]`,
      time: 'O(log k) per add',
      space: 'O(k)',
      knobs: [
        {
          change: 'top-k frequent elements (not a stream)',
          how: 'Counter first, push (freq, num) tuples, pop whenever heap exceeds k',
          code: `counted = Counter(nums)
heap = []
for num, freq in counted.items():
    heapq.heappush(heap, (freq, num))
    if len(heap) > k:
        heapq.heappop(heap)
return [num for freq, num in heap]`,
        },
        {
          change: 'running median from a stream',
          how: 'two heaps: small = max-heap of negated values, large = min-heap, rebalance sizes',
          code: `def addNum(self, num):
    heapq.heappush(self.small, -num)
    if self.small and self.large and -self.small[0] > self.large[0]:
        val = heapq.heappop(self.small)
        heapq.heappush(self.large, -val)
    if len(self.small) > len(self.large) + 1:
        val = heapq.heappop(self.small)
        heapq.heappush(self.large, -val)
    if len(self.small) < len(self.large):
        val = heapq.heappop(self.large)
        heapq.heappush(self.small, -val)

def findMedian(self):
    if len(self.small) > len(self.large):
        return -self.small[0]
    return (-self.small[0] + self.large[0]) / 2`,
        },
      ],
    },
    {
      kind: 'list',
      title: 'OOP design: rules + the script',
      items: [
        '__init__ sets self.x: anything that must survive between calls.',
        'Local x: scratch value, dies when the method returns.',
        'self.x set in one method, read in another: that is shared state.',
        'Every method takes self first, even if a method never uses it.',
        'Script: clarify the exact API (methods + signatures) before writing code.',
        'Pick one data structure per operation: what gives O(1) for THIS op?',
        'Write the skeleton first: __init__ fields, empty method stubs.',
        'Fill methods using self.x only; never silently recreate state locally.',
        'Say the invariant out loud: what must stay true after every call?',
        'Test edge cases out loud: empty cache, capacity 1, duplicate key.',
      ],
    },
    {
      kind: 'boilerplate',
      title: 'LRU cache (dict + doubly linked list)',
      when: 'need O(1) get/put, evict the least-recently-used',
      code: `class Node:
    def __init__(self, key=0, val=0):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None

class LRUCache:

    def __init__(self, capacity: int):
        self.cap = capacity
        self.cache = {}
        self.left = Node()
        self.right = Node()
        self.left.next = self.right
        self.right.prev = self.left

    def remove(self, node):
        prev, nxt = node.prev, node.next
        prev.next = nxt
        nxt.prev = prev

    def insert(self, node):
        prev, nxt = self.right.prev, self.right
        prev.next = node
        node.prev = prev
        node.next = nxt
        nxt.prev = node

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1

        self.remove(self.cache[key])
        self.insert(self.cache[key])
        return self.cache[key].val

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.remove(self.cache[key])

        self.cache[key] = Node(key, value)
        self.insert(self.cache[key])

        if len(self.cache) > self.cap:
            lru = self.left.next
            self.remove(lru)
            del self.cache[lru.key]`,
      time: 'O(1)',
      space: 'O(capacity)',
      knobs: [
        {
          change: 'same LRU, faster to write under pressure',
          how: 'use OrderedDict: move_to_end on hit, popitem(last=False) to evict',
          code: `from collections import OrderedDict

class LRUCache:

    def __init__(self, capacity: int):
        self.cap = capacity
        self.cache = OrderedDict()

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.cap:
            self.cache.popitem(last=False)`,
        },
      ],
    },
    {
      kind: 'boilerplate',
      title: 'Min stack & time-based key-value',
      when: 'tiny design classes: O(1) or O(log n) per op',
      code: `class MinStack:

    def __init__(self):
        self.stack = []

    def push(self, val: int) -> None:
        if self.stack:
            minVal = min(self.stack[-1][1], val)
        else:
            minVal = val
        self.stack.append((val, minVal))

    def pop(self) -> None:
        self.stack.pop()

    def top(self) -> int:
        return self.stack[-1][0]

    def getMin(self) -> int:
        return self.stack[-1][1]`,
      time: 'O(1)',
      space: 'O(n)',
      knobs: [
        {
          change: 'time-based key-value store (get latest value at/before timestamp)',
          how: 'defaultdict(list) of (timestamp, value) pairs; bisect_right to find the floor',
          code: `from collections import defaultdict as dd
import bisect

class TimeMap:

    def __init__(self):
        self.store = dd(list)

    def set(self, key: str, value: str, timestamp: int) -> None:
        self.store[key].append((timestamp, value))

    def get(self, key: str, timestamp: int) -> str:
        values = self.store[key]
        i = bisect.bisect_right(values, (timestamp, chr(127)))
        if i == 0:
            return ''
        return values[i - 1][1]`,
        },
      ],
    },
  ],

  recall: [
    { prompt: 'DFS bottom-up: what does dfs(node) return?', answer: 'A value for the PARENT to use (height, sum, gain) — not the final answer itself.' },
    { prompt: 'DFS top-down: what gets passed down the recursion?', answer: 'State built from ancestors: bounds, depth, or a running max/sum.' },
    { prompt: 'How does this user track a global best in bottom-up DFS?', answer: 'self.best (or self.maxSum): set once before the dfs closure, updated inside it. No nonlocal needed.' },
    { prompt: 'BFS level order: why snapshot len(queue) before the for loop?', answer: 'Children pushed during this level must wait for the next level’s loop.' },
    { prompt: 'Right side view: how do you know a node is last in its level?', answer: 'i == levelSize - 1, checked inside the snapshot-size for loop.' },
    { prompt: 'Min depth via BFS: when do you return early?', answer: 'The instant you pop a node with no left and no right child.' },
    { prompt: 'Validate BST: why bounds (low, high), not a parent-only comparison?', answer: 'A node can satisfy its parent but still violate a higher ancestor’s bound.' },
    { prompt: 'LCA in a BST: when do you stop walking?', answer: 'When p and q no longer sit strictly on the same side of curr.' },
    { prompt: 'LCA in a general tree: what does a node return?', answer: 'root, if p or q is found on both sides below it; otherwise whichever side was non-null.' },
    { prompt: 'Iterative inorder: what two things does the explicit stack replace?', answer: 'The recursive call stack, and the "go left first" ordering it gives for free.' },
    { prompt: 'Serialize a tree so deserialize is unambiguous: what marks a missing child?', answer: 'A sentinel token like "N", written even for null children, in preorder.' },
    { prompt: 'Kth largest in a stream: what heap type and size?', answer: 'Min-heap capped at size k; heap[0] is always the kth largest.' },
    { prompt: 'Running median: the two heaps, and their signs?', answer: 'small = max-heap via negated values (low half). large = plain min-heap (high half).' },
    { prompt: 'LRU cache get(key): what two calls happen, in order?', answer: 'self.remove(node) first, then self.insert(node) — moves it to the most-recent end.' },
    { prompt: 'LRU cache eviction: which node, and how is it found in O(1)?', answer: 'self.left.next — the node right after the left sentinel is the least recently used.' },
    { prompt: 'Fill in the blank:\ndef dfs(node):\n    if not node:\n        return 0\n    left = dfs(node.left)\n    right = dfs(node.right)\n    ???', answer: 'return 1 + max(left, right)' },
    { prompt: 'What is the real difference between self.x and a local x inside a method?', answer: 'self.x persists across calls and across methods; local x is gone the instant the method returns.' },
    { prompt: 'Min stack getMin() in O(1): what does each stack entry store?', answer: 'A (val, minSoFar) pair, so the top of the stack always has the running min.' },
  ],

  quiz: [
    { id: 'dayof:trees-design:q1', q: 'Tree DFS bottom-up (return height): time and space?', choices: ['O(n) time, O(n) space always', 'O(n) time, O(h) space', 'O(log n) time, O(1) space', 'O(n^2) time, O(h) space'], answer: 1, why: 'Each node is visited once; the call stack depth is the tree’s height h.', skills: ['tree-dfs', 'complexity'] },
    { id: 'dayof:trees-design:q2', q: 'BFS on a tree: why deque + popleft(), not a plain list with pop(0)?', choices: ['list.pop(0) is O(n); deque.popleft() is O(1)', 'deque supports negative indices', 'list cannot store TreeNode objects', 'BFS requires a stack, not a queue'], answer: 0, why: 'list.pop(0) shifts every remaining element; deque.popleft() does not.', skills: ['tree-bfs', 'queue-deque', 'complexity'] },
    { id: 'dayof:trees-design:q3', q: 'A level-order BFS adds: "if i == levelSize - 1: result.append(node.val)". What variant is this?', choices: ['Zigzag traversal', 'Right side view', 'Minimum depth', 'Validate BST'], answer: 1, why: 'Keeping only the last node popped per level gives the rightmost view.', skills: ['tree-bfs'] },
    { id: 'dayof:trees-design:q4', q: 'Minimum depth with BFS: when do you return?', choices: ['After the whole queue is empty', 'The first time you pop a node with no children', 'When depth equals the tree height', 'Never; min depth needs DFS'], answer: 1, why: 'BFS reaches the nearest leaf first, so that is the minimum depth.', skills: ['tree-bfs'] },
    { id: 'dayof:trees-design:q5', q: 'Nested dfs tracks a diameter with: best = max(left + right, best) — no self.x, no nonlocal. What happens?', choices: ['Works fine, identical to self.best', 'UnboundLocalError: the assignment makes best local to dfs', 'best silently stays 0 forever', 'Python raises a RecursionError'], answer: 1, why: 'Assigning to best anywhere in dfs makes it local for the whole function; reading it first fails.', skills: ['tree-dfs', 'communication'] },
    { id: 'dayof:trees-design:q6', q: 'Balanced-tree check: what does dfs returning -1 mean?', choices: ['The subtree is empty', 'This subtree already failed the balance check', 'The node has exactly one child', 'An input parsing error occurred'], answer: 1, why: '-1 is a sentinel that propagates up once any subtree is unbalanced.', skills: ['tree-dfs'] },
    { id: 'dayof:trees-design:q7', q: 'Max path sum uses max(0, dfs(node.left)) instead of dfs(node.left). Why?', choices: ['To handle null nodes', 'Values can be negative; a bad branch should contribute 0, not hurt the sum', 'To force O(1) space', 'max(0, x) prevents infinite recursion'], answer: 1, why: 'Clamping to 0 means you only extend through a child when it actually helps.', skills: ['tree-dfs'] },
    { id: 'dayof:trees-design:q8', q: 'Tree DFS top-down: what is the extra argument usually carrying?', choices: ['The final answer so far', 'Nothing; top-down never takes extra args', 'State built from ancestors: bounds, depth, or pathMax', 'The total size of the tree'], answer: 2, why: 'Top-down threads ancestor-derived state down through each call.', skills: ['tree-dfs', 'communication'] },
    { id: 'dayof:trees-design:q9', q: 'In [5,4,6,None,None,3,7], node 3 is less than its parent 6, yet the tree is invalid. Why?', choices: ['3 is fine; the tree is actually valid', '3 violates the higher ancestor 5, which a parent-only check misses', '6 should be a leaf node', 'This is a balance problem, not a BST problem'], answer: 1, why: '3 sits in 5’s right subtree, so it must exceed 5 — bounds catch this, parent checks don’t.', skills: ['bst', 'tree-dfs'] },
    { id: 'dayof:trees-design:q10', q: 'Good nodes: what gets passed down instead of (low, high)?', choices: ['pathMax, the largest value seen from root to here', 'A depth counter', 'A visited set', 'The parent pointer'], answer: 0, why: 'A node is good when its value is at least pathMax; pathMax then updates.', skills: ['tree-dfs', 'bst'] },
    { id: 'dayof:trees-design:q11', q: 'BST search/insert: cost on a balanced tree vs. a degenerate (sorted-insert) one?', choices: ['O(log n) in both cases', 'O(log n) balanced, O(n) degenerate', 'O(n) in both cases', 'O(1) balanced, O(log n) degenerate'], answer: 1, why: 'Height h is log n when balanced, but n when the tree becomes a line.', skills: ['bst', 'complexity'] },
    { id: 'dayof:trees-design:q12', q: 'LCA in a BST: when do you stop walking down?', choices: ['Only when you reach a leaf', 'When p and q stop being strictly on the same side of curr', 'After exactly log n steps', 'When curr.val equals 0'], answer: 1, why: 'That split (or hitting p/q itself) is the lowest common ancestor.', skills: ['bst'] },
    { id: 'dayof:trees-design:q13', q: 'LCA in a general tree: both left and right recursive calls return non-null. What does that mean?', choices: ['An error in the input', 'p and q are the same node', 'The current node is the LCA: a target is on each side', 'Restart the search from the root'], answer: 2, why: 'If both sides found a target, the split happens at this node.', skills: ['tree-dfs'] },
    { id: 'dayof:trees-design:q14', q: 'Iterative inorder (kth smallest): what does the explicit stack replace?', choices: ['The TreeNode class', 'The queue used in BFS', 'The recursive call stack, preserving left-to-right order', 'Nothing; it is purely for speed'], answer: 2, why: 'Pushing the left spine then popping mimics exactly what recursion would do.', skills: ['bst', 'stack', 'tree-dfs'] },
    { id: 'dayof:trees-design:q15', q: 'Serialize a tree in preorder: why write a sentinel like "N" for every null child?', choices: ['It saves space', 'Without it, deserialize cannot tell where a subtree ends', 'Python requires it for recursion', 'It makes the tree balanced'], answer: 1, why: 'The marker makes the preorder sequence unambiguous to replay into a tree.', skills: ['tree-dfs'] },
    { id: 'dayof:trees-design:q16', q: 'Kth largest, one-shot over an array: why a MIN-heap, not a max-heap?', choices: ['heapq is min-heap only; a min-heap capped at size k keeps the top k, with the kth on top', 'Min-heaps are always faster in Python', 'Max-heaps cannot store integers', 'There is no real difference'], answer: 0, why: 'Capping a min-heap at size k makes heap[0] the smallest of the top k: the kth largest.', skills: ['heap', 'ds-diagnosis'] },
    { id: 'dayof:trees-design:q17', q: 'Top-k frequent: why run Counter before touching the heap?', choices: ['Counter sorts the array', 'It shrinks n elements to u distinct (value, freq) pairs for the heap', 'Heaps cannot hold duplicate values', 'Counter is required by Python syntax'], answer: 1, why: 'Counting first limits heap work to the number of distinct values.', skills: ['heap', 'arrays-hashing'] },
    { id: 'dayof:trees-design:q18', q: 'Running median with two heaps: which heap may hold one extra element?', choices: ['large, the min-heap half', 'small, the max-heap half (via negation)', 'Both must always be exactly equal', 'Neither; sizes must differ by exactly 2'], answer: 1, why: 'small can carry the extra middle element when the count is odd.', skills: ['heap'] },
    { id: 'dayof:trees-design:q19', q: 'Running median: why push -num onto the small heap instead of num?', choices: ['To sort it faster', 'heapq is min-heap only; negating simulates a max-heap for that half', 'Negative numbers are required by the problem', 'It prevents duplicate values'], answer: 1, why: 'Negating flips min-heap behavior into max-heap behavior for the half needing the largest on top.', skills: ['heap'] },
    { id: 'dayof:trees-design:q20', q: 'In a design class like LRUCache, what distinguishes self.x from a local x in a method?', choices: ['No difference in Python', 'self.x persists across calls and across methods; local x dies on return', 'local x is always faster', 'self.x can only hold an integer'], answer: 1, why: 'Instance attributes are the class’s memory; locals are scratch for one call.', skills: ['ds-diagnosis', 'communication'] },
    { id: 'dayof:trees-design:q21', q: 'LRUCache.get(key): why call self.remove(node) before self.insert(node)?', choices: ['insert first would duplicate the node', 'remove needs the node’s current prev/next before they get relinked', 'Order does not actually matter here', 'get never calls insert at all'], answer: 1, why: 'Removing first uses the still-valid old pointers before relinking.', skills: ['linked-list', 'ds-diagnosis'] },
    { id: 'dayof:trees-design:q22', q: 'LRUCache eviction: which node is removed, and how is it found in O(1)?', choices: ['self.right.prev, the most recent node', 'self.left.next, right after the left sentinel', 'Scan the dict for the oldest key', 'The node holding the smallest key'], answer: 1, why: 'The left sentinel always points to the least-recently-used node.', skills: ['linked-list', 'ds-diagnosis'] },
    { id: 'dayof:trees-design:q23', q: 'LRUCache uses two sentinel nodes (left, right) instead of checking for None. Why?', choices: ['Sentinels make the code slower on purpose', 'Every real node always has a non-None prev/next, so no edge-case branches needed', 'Python forbids None in linked lists', 'The judge requires sentinel nodes'], answer: 1, why: 'Dummy head/tail nodes remove every null-check special case from insert/remove.', skills: ['linked-list'] },
    { id: 'dayof:trees-design:q24', q: 'Min stack, O(1) getMin: what does each stack entry store?', choices: ['Just the pushed value', 'A (val, minSoFar) pair: the running min up to this frame', 'A pointer to the global minimum index', 'A sorted copy of the whole stack'], answer: 1, why: 'Pairing each value with the min-so-far makes every op O(1), no extra structure.', skills: ['stack'] },
    { id: 'dayof:trees-design:q25', q: 'TimeMap.get: why bisect_right with key (timestamp, chr(127)) instead of just timestamp?', choices: ['chr(127) is a typo with no effect', 'chr(127) sorts after any real value, landing just past the last entry at that timestamp', 'It converts the timestamp into a string', 'It avoids duplicate keys in the dict'], answer: 1, why: 'That trick finds the rightmost entry with timestamp ≤ target, even with duplicate timestamps.', skills: ['binary-search', 'arrays-hashing'] },
  ],
}
