import { h, clear } from '../ui/h.js'
import { createArcade, codeView, shuffle, pickByLevel } from './_engine.js'
import { overrideButton, applyOverrideVisuals } from '../ui/override.js'

const L = (...lines) => lines

const snippets = [
  { d: 1, title: 'Two Sum', skills: ['arrays-hashing'], lines: L('def twoSum(nums, target):', '    seen = {}', '    for i, x in enumerate(nums):', '        if target - x in seen:', '            return [seen[target - x], i]', '        seen[x] = i', '    return []') },
  { d: 1, title: 'Valid Anagram', skills: ['arrays-hashing'], lines: L('def isAnagram(s, t):', '    counts = Counter(s)', '    for ch in t:', '        counts[ch] -= 1', '    return all(v == 0 for v in counts.values())') },
  { d: 1, title: 'Contains Duplicate', skills: ['arrays-hashing'], lines: L('def containsDuplicate(nums):', '    seen = set()', '    for x in nums:', '        if x in seen:', '            return True', '        seen.add(x)', '    return False') },
  { d: 2, title: 'Valid Palindrome', skills: ['two-pointers'], lines: L('def isPalindrome(s):', '    filtered = [ch.lower() for ch in s if ch.isalnum()]', '    left, right = 0, len(filtered) - 1', '    while left < right:', '        if filtered[left] != filtered[right]:', '            return False', '        left += 1', '        right -= 1', '    return True') },
  { d: 1, title: 'Two Sum II (sorted)', skills: ['two-pointers'], lines: L('def twoSumSorted(numbers, target):', '    left, right = 0, len(numbers) - 1', '    while left < right:', '        total = numbers[left] + numbers[right]', '        if total == target:', '            return [left + 1, right + 1]', '        elif total < target:', '            left += 1', '        else:', '            right -= 1', '    return []') },
  { d: 1, title: 'Max Sum Subarray of Size K', skills: ['sliding-window'], lines: L('def maxSumSubarray(nums, k):', '    window = sum(nums[:k])', '    best = window', '    for i in range(k, len(nums)):', '        window += nums[i] - nums[i - k]', '        best = max(best, window)', '    return best') },
  { d: 2, title: 'Longest Substring Without Repeating Characters', skills: ['sliding-window'], lines: L('def lengthOfLongestSubstring(s):', '    seen = {}', '    left = 0', '    best = 0', '    for right, ch in enumerate(s):', '        if ch in seen and seen[ch] >= left:', '            left = seen[ch] + 1', '        seen[ch] = right', '        best = max(best, right - left + 1)', '    return best') },
  { d: 1, title: 'Range Sum Query', skills: ['prefix-sum'], lines: L('def rangeSum(nums, left, right):', '    prefix = [0]', '    for x in nums:', '        prefix.append(prefix[-1] + x)', '    return prefix[right + 1] - prefix[left]') },
  { d: 1, title: 'Binary Search', skills: ['binary-search'], lines: L('def binarySearch(arr, target):', '    left, right = 0, len(arr) - 1', '    while left <= right:', '        mid = (left + right) // 2', '        if arr[mid] == target:', '            return mid', '        elif arr[mid] < target:', '            left = mid + 1', '        else:', '            right = mid - 1', '    return -1') },
  { d: 2, title: 'Search Insert Position', skills: ['binary-search'], lines: L('def searchInsert(nums, target):', '    left, right = 0, len(nums)', '    while left < right:', '        mid = (left + right) // 2', '        if nums[mid] < target:', '            left = mid + 1', '        else:', '            right = mid', '    return left') },
  { d: 1, title: 'Valid Parentheses', skills: ['stack'], lines: L('def isValid(s):', '    stack = []', "    pairs = {')': '(', ']': '[', '}': '{'}", '    for ch in s:', '        if ch in pairs:', '            if not stack or stack.pop() != pairs[ch]:', '                return False', '        else:', '            stack.append(ch)', '    return not stack') },
  { d: 2, title: 'Next Greater Element', skills: ['monotonic-stack'], lines: L('def nextGreater(nums):', '    result = [-1] * len(nums)', '    stack = []', '    for i, x in enumerate(nums):', '        while stack and nums[stack[-1]] < x:', '            result[stack.pop()] = x', '        stack.append(i)', '    return result') },
  { d: 3, title: 'Level Order Traversal', skills: ['tree-bfs'], lines: L('def levelOrder(root):', '    if not root:', '        return []', '    result = []', '    queue = deque([root])', '    while queue:', '        level = []', '        for _ in range(len(queue)):', '            node = queue.popleft()', '            level.append(node.val)', '            if node.left:', '                queue.append(node.left)', '            if node.right:', '                queue.append(node.right)', '        result.append(level)', '    return result') },
  { d: 1, title: 'Reverse Linked List', skills: ['linked-list'], lines: L('def reverseList(head):', '    prev = None', '    curr = head', '    while curr:', '        nxt = curr.next', '        curr.next = prev', '        prev = curr', '        curr = nxt', '    return prev') },
  { d: 2, title: 'Merge Two Sorted Lists', skills: ['linked-list'], lines: L('def mergeTwoLists(l1, l2):', '    dummy = ListNode()', '    tail = dummy', '    while l1 and l2:', '        if l1.val <= l2.val:', '            tail.next = l1', '            l1 = l1.next', '        else:', '            tail.next = l2', '            l2 = l2.next', '        tail = tail.next', '    tail.next = l1 or l2', '    return dummy.next') },
  { d: 1, title: 'Linked List Cycle', skills: ['linked-list'], lines: L('def hasCycle(head):', '    slow = fast = head', '    while fast and fast.next:', '        slow = slow.next', '        fast = fast.next.next', '        if slow == fast:', '            return True', '    return False') },
  { d: 1, title: 'Max Depth of Binary Tree', skills: ['tree-dfs'], lines: L('def maxDepth(node):', '    if not node:', '        return 0', '    left = maxDepth(node.left)', '    right = maxDepth(node.right)', '    return 1 + max(left, right)') },
  { d: 1, title: 'Invert Binary Tree', skills: ['tree-dfs'], lines: L('def invertTree(node):', '    if not node:', '        return None', '    node.left, node.right = invertTree(node.right), invertTree(node.left)', '    return node') },
  { d: 1, title: 'Search in a BST', skills: ['bst'], lines: L('def searchBST(node, val):', '    if not node or node.val == val:', '        return node', '    if val < node.val:', '        return searchBST(node.left, val)', '    return searchBST(node.right, val)') },
  { d: 1, title: 'Kth Largest Element', skills: ['heap'], lines: L('def findKthLargest(nums, k):', '    heap = []', '    for x in nums:', '        heapq.heappush(heap, x)', '        if len(heap) > k:', '            heapq.heappop(heap)', '    return heap[0]') },
  { d: 2, title: 'Trie Insert', skills: ['trie'], lines: L('def insert(root, word):', '    node = root', '    for ch in word:', '        if ch not in node.children:', '            node.children[ch] = TrieNode()', '        node = node.children[ch]', '    node.isEnd = True') },
  { d: 1, title: 'Graph DFS Order', skills: ['graph-dfs'], lines: L('def dfs(node, graph, visited, order):', '    visited.add(node)', '    order.append(node)', '    for neighbor in graph[node]:', '        if neighbor not in visited:', '            dfs(neighbor, graph, visited, order)', '    return order') },
  { d: 2, title: 'Graph BFS Order', skills: ['graph-bfs'], lines: L('def bfs(start, graph):', '    visited = {start}', '    queue = deque([start])', '    order = []', '    while queue:', '        node = queue.popleft()', '        order.append(node)', '        for neighbor in graph[node]:', '            if neighbor not in visited:', '                visited.add(neighbor)', '                queue.append(neighbor)', '    return order') },
  { d: 3, title: 'Course Schedule Order', skills: ['topo-sort'], lines: L('def findOrder(n, edges):', '    indegree = [0] * n', '    graph = [[] for _ in range(n)]', '    for u, v in edges:', '        graph[u].append(v)', '        indegree[v] += 1', '    queue = deque(i for i in range(n) if indegree[i] == 0)', '    order = []', '    while queue:', '        node = queue.popleft()', '        order.append(node)', '        for nxt in graph[node]:', '            indegree[nxt] -= 1', '            if indegree[nxt] == 0:', '                queue.append(nxt)', '    return order if len(order) == n else []') },
  { d: 2, title: 'Union-Find Union', skills: ['union-find'], lines: L('def union(parent, rank, a, b):', '    rootA, rootB = find(parent, a), find(parent, b)', '    if rootA == rootB:', '        return', '    if rank[rootA] < rank[rootB]:', '        rootA, rootB = rootB, rootA', '    parent[rootB] = rootA', '    rank[rootA] += rank[rootA] == rank[rootB]') },
  { d: 3, title: "Dijkstra's Shortest Path", skills: ['dijkstra'], lines: L('def dijkstra(n, edges, src):', '    graph = [[] for _ in range(n)]', '    for u, v, w in edges:', '        graph[u].append((v, w))', '        graph[v].append((u, w))', "    dist = [float('inf')] * n", '    dist[src] = 0', '    heap = [(0, src)]', '    while heap:', '        d, node = heapq.heappop(heap)', '        if d > dist[node]:', '            continue', '        for neighbor, weight in graph[node]:', '            if d + weight < dist[neighbor]:', '                dist[neighbor] = d + weight', '                heapq.heappush(heap, (dist[neighbor], neighbor))', '    return dist') },
  { d: 3, title: "Kruskal's MST Weight", skills: ['mst'], lines: L('def mstWeight(n, edges):', '    parent = list(range(n))', '    edges = sorted(edges, key=lambda e: e[2])', '    total = 0', '    for u, v, w in edges:', '        rootU, rootV = find(parent, u), find(parent, v)', '        if rootU != rootV:', '            parent[rootU] = rootV', '            total += w', '    return total') },
  { d: 3, title: 'Subsets', skills: ['backtracking'], lines: L('def subsets(nums):', '    result = []', '    curr = []', '    def dfs(i):', '        if i == len(nums):', '            result.append(curr.copy())', '            return', '        curr.append(nums[i])', '        dfs(i + 1)', '        curr.pop()', '        dfs(i + 1)', '    dfs(0)', '    return result') },
  { d: 1, title: 'Climbing Stairs', skills: ['dp-1d'], lines: L('def climbStairs(n):', '    if n <= 2:', '        return n', '    prev2, prev1 = 1, 2', '    for i in range(3, n + 1):', '        curr = prev1 + prev2', '        prev2, prev1 = prev1, curr', '    return prev1') },
  { d: 1, title: 'House Robber', skills: ['dp-1d'], lines: L('def rob(nums):', '    prev2, prev1 = 0, 0', '    for x in nums:', '        curr = max(prev1, prev2 + x)', '        prev2, prev1 = prev1, curr', '    return prev1') },
  { d: 1, title: 'Unique Paths', skills: ['dp-2d'], lines: L('def uniquePaths(m, n):', '    dp = [[1] * n for _ in range(m)]', '    for i in range(1, m):', '        for j in range(1, n):', '            dp[i][j] = dp[i - 1][j] + dp[i][j - 1]', '    return dp[m - 1][n - 1]') },
  { d: 1, title: 'Merge Intervals', skills: ['intervals'], lines: L('def merge(intervals):', '    intervals.sort(key=lambda pair: pair[0])', '    merged = [intervals[0]]', '    for start, end in intervals[1:]:', '        if start <= merged[-1][1]:', '            merged[-1][1] = max(merged[-1][1], end)', '        else:', '            merged.append([start, end])', '    return merged') },
  { d: 1, title: 'Count Set Bits', skills: ['bit'], lines: L('def countBits(n):', '    count = 0', '    while n:', '        count += n & 1', '        n >>= 1', '    return count') },
  { d: 1, title: 'Greatest Common Divisor', skills: ['math'], lines: L('def gcd(a, b):', '    while b:', '        a, b = b, a % b', '    return a') },
]

function mount(container, api) {
  let snippet = null
  let bank = []
  let program = []
  let locked = false
  let startTime = 0
  let programHost = null
  let bankHost = null
  let feedback = null
  let checkButton = null

  function nextRound(ctx) {
    if (ctx.over()) return
    snippet = pickByLevel(snippets, Math.min(3, Math.ceil(ctx.level / 2)))
    bank = shuffle(snippet.lines.map((text, i) => ({ text, i })))
    program = []
    locked = false
    startTime = performance.now()
    clear(ctx.stage)
    programHost = h('div', { class: 'ptr-program' })
    bankHost = h('div', { class: 'ptr-bank' })
    feedback = h('div', { class: 'game-feedback' })
    checkButton = h('button', { class: 'btn btn-primary', disabled: true, onclick: () => check(ctx) }, 'Check ', h('span', { class: 'kbd' }, 'Enter'))
    ctx.stage.append(h('div', { class: 'card game-card fade-in' },
      h('div', { class: 'row row-wrap game-tags' },
        h('span', { class: 'pill pill-teal' }, `🧵 ${snippet.title}`),
        h('span', { class: 'chip' }, `${snippet.lines.length} lines`)),
      h('div', { class: 'section-title' }, 'Your order'),
      programHost,
      h('div', { class: 'section-title' }, 'Lines'),
      bankHost,
      h('div', { class: 'row' }, checkButton, h('button', { class: 'btn btn-ghost', onclick: () => undo() }, 'Undo ', h('span', { class: 'kbd' }, '⌫'))),
      feedback))
    render()
  }

  function render() {
    clear(programHost)
    if (!program.length) programHost.append(h('div', { class: 'muted small' }, 'Pick lines below in the order they should run'))
    program.forEach((item, i) => programHost.append(h('button', { class: 'ptr-line chosen', onclick: () => removeAt(i) }, h('span', { class: 'ptr-step' }, String(i + 1)), item.text)))
    clear(bankHost)
    bank.forEach((item, i) => bankHost.append(h('button', {
      class: `ptr-line${program.includes(item) ? ' used' : ''}`,
      disabled: program.includes(item) || locked,
      onclick: () => add(item),
    }, h('span', { class: 'kbd' }, String(i + 1)), item.text)))
    checkButton.disabled = locked || program.length !== snippet.lines.length
  }

  function add(item) {
    if (locked || program.includes(item)) return
    program.push(item)
    render()
  }

  function undo() {
    if (locked || !program.length) return
    program.pop()
    render()
  }

  function removeAt(index) {
    if (locked) return
    program.splice(index, 1)
    render()
  }

  function check(ctx) {
    if (locked || program.length !== snippet.lines.length) return
    locked = true
    render()
    const correct = program.every((item, pos) => item.i === pos)
    const seconds = (performance.now() - startTime) / 1000
    if (correct) {
      ctx.hit(180, Math.max(0, 1 - seconds / 35))
      ctx.resolve(true, { skills: snippet.skills, id: `line-up:${snippet.title}` })
      feedback.append(h('div', { class: 'game-why good' }, '✓ ', 'That order runs correctly.'))
      ctx.waitFor(() => nextRound(ctx), 1300)
      return
    }
    ctx.resolve(false, {
      skills: snippet.skills, id: `line-up:${snippet.title}`,
      mistake: { summary: snippet.title, yours: program.map(item => item.text).join(' → '), answer: snippet.lines.join(' → '), why: 'The order below runs correctly; yours does not match it.' },
    })
    let alive = ctx.miss()
    const continueButton = h('button', { class: 'btn btn-primary game-continue', onclick: () => ctx.proceed() }, alive ? 'Continue ' : 'Results ', h('span', { class: 'kbd' }, 'Enter'))
    const overrule = overrideButton({
      title: 'My order also runs correctly. Count it.',
      onOverride: () => {
        if (!ctx.overrule({ base: 180 })) return
        alive = true
        applyOverrideVisuals(feedback)
        continueButton.firstChild.textContent = 'Continue '
      },
    })
    feedback.append(
      h('div', { class: 'game-why bad' }, h('strong', null, 'Not quite — a correct order:')),
      codeView(snippet.lines.join('\n')),
      h('div', { class: 'row row-wrap' }, continueButton, overrule))
    ctx.waitFor(() => (alive ? nextRound(ctx) : ctx.end()))
  }

  return createArcade(container, api, {
    title: 'Line Up',
    icon: '🧵',
    rules: ['rebuild the solution', 'order matters'],
    mode: 'timed',
    seconds: 100,
    seed: api.seed,
    onStart: ctx => nextRound(ctx),
    onKey: (event, ctx) => {
      if (!snippet || locked) return
      if (event.key === 'Enter') {
        event.preventDefault()
        check(ctx)
        return
      }
      if (event.key === 'Backspace') {
        event.preventDefault()
        undo()
        return
      }
      const index = Number(event.key) - 1
      if (Number.isInteger(index) && index >= 0 && index < bank.length) {
        event.preventDefault()
        add(bank[index])
      }
    },
  })
}

export default {
  id: 'line-up',
  title: 'Line Up',
  icon: '🧵',
  blurb: 'Rebuild a correct solution, one line at a time.',
  skills: ['communication', 'ds-diagnosis'],
  difficulty: 'Escalates with streak',
  modeLabel: '100s timer',
  supportsDaily: true,
  mount,
}
