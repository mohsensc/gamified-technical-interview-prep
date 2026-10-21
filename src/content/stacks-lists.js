const topicId = 'stacks-lists'

const unwrap = input => (input && typeof input === 'object' && !Array.isArray(input) && 'value' in input && 'label' in input) ? input.value : input

const lineFinder = code => {
  const lines = code.split('\n')
  return (text, nth = 1) => {
    let seen = 0
    for (let i = 0; i < lines.length; i++) if (lines[i].includes(text) && ++seen === nth) return i + 1
    throw new Error(`line not found: ${text}`)
  }
}

const range = n => Array.from({ length: Math.max(0, n) }, (_, i) => i)
const chain = (values, prefix) => values.map((val, i) => ({ id: `${prefix}${i}`, val, next: i < values.length - 1 ? `${prefix}${i + 1}` : null }))
const listPanel = (label, nodes, pointers = {}, highlight = [], extra = {}) => ({
  kind: 'linkedlist', label, nodes: nodes.map(node => ({ ...node })), pointers: { ...pointers }, highlight: [...highlight], ...extra,
})
const indexMap = nodes => Object.fromEntries(nodes.map(node => [node.id, node]))
const walk = (nodes, headId) => {
  const map = indexMap(nodes)
  const out = []
  const seen = new Set()
  let id = headId
  while (id && !seen.has(id)) {
    seen.add(id)
    out.push(map[id].val)
    id = map[id].next
  }
  return out
}
const topIndex = stack => stack.length ? [stack.length - 1] : []

const validCode = `class Solution:
    def isValid(self, s: str) -> bool:
        pairs = {')': '(', ']': '[', '}': '{'}
        stack = []

        for char in s:
            if char in pairs:
                if not stack or stack[-1] != pairs[char]:
                    return False
                stack.pop()
            else:
                stack.append(char)

        return not stack`

const minStackCode = `class MinStack:

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
        return self.stack[-1][1]`

const dailyCode = `class Solution:
    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:
        result = [0] * len(temperatures)
        stack = []

        for i, temp in enumerate(temperatures):
            while stack and temp > temperatures[stack[-1]]:
                index = stack.pop()
                result[index] = i - index
            stack.append(i)

        return result`

const histogramCode = `class Solution:
    def largestRectangleArea(self, heights: List[int]) -> int:
        result = 0
        stack = []

        for i, h in enumerate(heights + [0]):
            start = i
            while stack and stack[-1][1] > h:
                index, height = stack.pop()
                result = max(result, height * (i - index))
                start = index
            stack.append((start, h))

        return result`

const ngeCode = `class Solution:
    def nextGreaterElement(self, nums1: List[int], nums2: List[int]) -> List[int]:
        nextGreater = {}
        stack = []

        for num in nums2:
            while stack and num > stack[-1]:
                nextGreater[stack.pop()] = num
            stack.append(num)

        return [nextGreater.get(num, -1) for num in nums1]`

const windowMaxCode = `from collections import deque

class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:
        result = []
        window = deque()

        for i in range(len(nums)):
            while window and nums[window[-1]] < nums[i]:
                window.pop()
            window.append(i)

            if window[0] <= i - k:
                window.popleft()

            if i >= k - 1:
                result.append(nums[window[0]])

        return result`

const reverseCode = `class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        prev, curr = None, head

        while curr:
            temp = curr.next
            curr.next = prev
            prev = curr
            curr = temp

        return prev`

const mergeCode = `class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = ListNode()
        tail = dummy

        while list1 and list2:
            if list1.val < list2.val:
                tail.next = list1
                list1 = list1.next
            else:
                tail.next = list2
                list2 = list2.next
            tail = tail.next

        tail.next = list1 or list2
        return dummy.next`

const cycleCode = `class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        slow = fast = head

        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow is fast:
                return True

        return False`

const middleCode = `class Solution:
    def middleNode(self, head: Optional[ListNode]) -> Optional[ListNode]:
        slow = fast = head

        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next

        return slow`

const removeNthCode = `class Solution:
    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:
        dummy = ListNode(0, head)
        behind = ahead = dummy

        for _ in range(n + 1):
            ahead = ahead.next

        while ahead:
            ahead = ahead.next
            behind = behind.next

        behind.next = behind.next.next
        return dummy.next`

const reorderCode = `class Solution:
    def reorderList(self, head: Optional[ListNode]) -> None:
        slow, fast = head, head.next

        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next

        second = slow.next
        prev = slow.next = None

        while second:
            temp = second.next
            second.next = prev
            prev = second
            second = temp

        first, second = head, prev
        while second:
            temp1, temp2 = first.next, second.next
            first.next = second
            second.next = temp1
            first, second = temp1, temp2`

const addTwoCode = `class Solution:
    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = ListNode()
        tail = dummy
        carry = 0

        while l1 or l2 or carry:
            total = carry
            if l1:
                total += l1.val
                l1 = l1.next
            if l2:
                total += l2.val
                l2 = l2.next
            carry, digit = divmod(total, 10)
            tail.next = ListNode(digit)
            tail = tail.next

        return dummy.next`

const kGroupCode = `class Solution:
    def reverseKGroup(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        dummy = ListNode(0, head)
        groupPrev = dummy

        while True:
            kth = groupPrev
            for _ in range(k):
                kth = kth.next
                if not kth:
                    return dummy.next

            groupNext = kth.next
            prev, curr = groupNext, groupPrev.next
            while curr is not groupNext:
                temp = curr.next
                curr.next = prev
                prev = curr
                curr = temp

            first = groupPrev.next
            groupPrev.next = kth
            groupPrev = first`

const traces = [
  {
    id: `${topicId}:trace:valid-parentheses`,
    title: 'Valid Parentheses',
    skills: ['stack'],
    problem: 'Is every bracket closed by the right type, in the right order?',
    code: validCode,
    complexity: { time: 'O(n)', space: 'O(n)', why: 'One pass; stack holds at most n openers.' },
    inputs: [
      { label: 'valid nest', value: '({[]})' },
      { label: 'crossed', value: '([)]' },
      { label: 'leftover', value: '(()' },
      { label: 'siblings', value: '{[]}()' },
    ],
    run(input, t) {
      const s = unwrap(input)
      const L = lineFinder(validCode)
      const chars = [...s]
      const pairs = { ')': '(', ']': '[', '}': '{' }
      const stack = []
      const view = (i, hlKey = []) => [
        { kind: 'array', label: 's', values: [...chars], pointers: i == null ? {} : { char: i }, highlight: i == null ? [] : [i], dim: i == null ? [] : range(i) },
        { kind: 'stack', label: 'stack · openers waiting', items: [...stack], highlight: topIndex(stack) },
        { kind: 'hashmap', label: 'pairs', entries: Object.entries(pairs), highlight: hlKey },
      ]
      t.step(L('pairs = {'), { vars: {}, panels: view(null), note: 'Map each closer to the opener it needs.', say: 'Brackets nest, so the most recent unmatched opener must close first. That is LIFO, so a stack.' })
      t.step(L('stack = []'), { vars: { stack: [] }, panels: view(null), note: 'Openers wait here for their partner.' })
      for (let i = 0; i < chars.length; i++) {
        const char = chars[i]
        t.step(L('for char in s'), { vars: { char, stack: [...stack] }, panels: view(i), note: `Read '${char}'.` })
        if (char in pairs) {
          t.step(L('if char in pairs'), { vars: { char, stack: [...stack] }, panels: view(i, [char]), note: `'${char}' is a closer; needs '${pairs[char]}' on top.` })
          if (!stack.length || stack[stack.length - 1] !== pairs[char]) {
            const top = stack[stack.length - 1]
            t.step(L('if not stack or'), { vars: { char, top: top ?? null }, panels: view(i, [char]), note: stack.length ? `Top is '${top}', not '${pairs[char]}'.` : 'Nothing open to close.' })
            t.step(L('return False'), { vars: { result: false }, panels: view(i, [char]), note: 'Invalid. Exit early.', say: 'A closer that does not match the latest opener means the nesting is broken, so I return False right away.' })
            return
          }
          stack.pop()
          t.step(L('stack.pop()'), { vars: { char, stack: [...stack] }, panels: view(i, [char]), note: `Matched '${pairs[char]}${char}'. Pop it.`, say: i === chars.findIndex(c => c in pairs) ? 'Top matches, so this pair is done and I pop it.' : undefined })
        } else {
          stack.push(char)
          t.step(L('stack.append(char)'), { vars: { char, stack: [...stack] }, panels: view(i), note: `Opener '${char}' waits on the stack.` })
        }
      }
      t.step(L('return not stack'), { vars: { result: stack.length === 0 }, panels: view(null), note: stack.length ? 'Leftover openers never closed: False.' : 'Everything matched: True.', say: 'An empty stack means every opener was closed. O(n) time, O(n) space for the stack.' })
    },
  },
  {
    id: `${topicId}:trace:min-stack`,
    title: 'Min Stack',
    skills: ['stack', 'ds-diagnosis'],
    problem: 'Stack with push, pop, top and getMin, all O(1).',
    code: minStackCode,
    complexity: { time: 'O(1) per op', space: 'O(n)', why: 'Each entry stores the min at its height.' },
    inputs: [
      { label: 'classic', value: [['push', -2], ['push', 0], ['push', -3], ['getMin'], ['pop'], ['top'], ['getMin']] },
      { label: 'equal mins', value: [['push', 5], ['push', 3], ['push', 3], ['pop'], ['getMin'], ['push', 7], ['getMin'], ['pop'], ['pop'], ['getMin']] },
    ],
    run(input, t) {
      const ops = unwrap(input)
      const L = lineFinder(minStackCode)
      const stack = []
      let returned = '—'
      const view = (k, hl = topIndex(stack)) => [
        { kind: 'array', label: 'operations', values: ops.map(op => op.length > 1 ? `${op[0]}(${op[1]})` : `${op[0]}()`), pointers: k == null ? {} : { op: k }, highlight: k == null ? [] : [k], dim: k == null ? [] : range(k) },
        { kind: 'stack', label: 'stack · (val, min so far)', items: stack.map(([val, low]) => `${val} | min ${low}`), highlight: hl },
        { kind: 'text', text: `last return: ${returned}` },
      ]
      t.step(L('self.stack = []'), { vars: { stack: [] }, panels: view(null), note: 'Each entry will carry its own running min.', say: 'Instead of recomputing min, every entry remembers the min of everything below it.' })
      let saidPush = false
      let saidPop = false
      ops.forEach(([name, val], k) => {
        if (name === 'push') {
          if (stack.length) {
            const minVal = Math.min(stack[stack.length - 1][1], val)
            t.step(L('minVal = min('), { vars: { val, minVal }, panels: view(k), note: `min(top min ${stack[stack.length - 1][1]}, ${val}) = ${minVal}.` })
            stack.push([val, minVal])
          } else {
            t.step(L('minVal = val'), { vars: { val, minVal: val }, panels: view(k), note: 'Empty stack: val is the min.' })
            stack.push([val, val])
          }
          t.step(L('self.stack.append((val, minVal))'), { vars: { val, minVal: stack[stack.length - 1][1] }, panels: view(k), note: `Push (${val}, ${stack[stack.length - 1][1]}).`, say: saidPush ? undefined : 'Push stores the pair, so the current min is always at the top in O(1).' })
          saidPush = true
        } else if (name === 'pop') {
          const removed = stack.pop()
          t.step(L('self.stack.pop()'), { vars: { removed: removed[0], newMin: stack.length ? stack[stack.length - 1][1] : null }, panels: view(k), note: `Pop ${removed[0]}; min reverts to ${stack.length ? stack[stack.length - 1][1] : 'nothing'}.`, say: saidPop ? undefined : 'Popping restores the previous min for free, because the entry below already stored it.' })
          saidPop = true
        } else if (name === 'top') {
          returned = stack[stack.length - 1][0]
          t.step(L('return self.stack[-1][0]'), { vars: { top: returned }, panels: view(k), note: `top() → ${returned}.` })
        } else {
          returned = stack[stack.length - 1][1]
          t.step(L('return self.stack[-1][1]'), { vars: { min: returned }, panels: view(k), note: `getMin() → ${returned}. No scan needed.` })
        }
      })
    },
  },
  {
    id: `${topicId}:trace:daily-temperatures`,
    title: 'Daily Temperatures',
    skills: ['monotonic-stack', 'stack'],
    problem: 'For each day, how many days until a warmer one? 0 if never.',
    code: dailyCode,
    complexity: { time: 'O(n)', space: 'O(n)', why: 'Each index pushed once and popped once.' },
    inputs: [
      { label: 'mixed', value: [73, 74, 75, 71, 69, 72, 76, 73] },
      { label: 'rising', value: [30, 40, 50, 60] },
      { label: 'falling', value: [60, 50, 40, 30] },
    ],
    run(input, t) {
      const temps = unwrap(input)
      const L = lineFinder(dailyCode)
      const result = temps.map(() => 0)
      const stack = []
      const view = (i, setIdx = null) => [
        { kind: 'array', label: 'temperatures', values: [...temps], pointers: i == null ? {} : { i }, highlight: [...stack], dim: i == null ? [] : range(i).filter(j => !stack.includes(j)) },
        { kind: 'stack', label: 'stack · waiting days (temps decreasing)', items: stack.map(idx => `${idx} · ${temps[idx]}°`), highlight: topIndex(stack) },
        { kind: 'array', label: 'result', values: [...result], pointers: setIdx == null ? {} : { set: setIdx }, highlight: setIdx == null ? [] : [setIdx] },
      ]
      t.step(L('result = [0]'), { vars: { n: temps.length }, panels: view(null), note: 'Default 0 means no warmer day ever comes.' })
      t.step(L('stack = []'), { vars: { stack: [] }, panels: view(null), note: 'Stack of indices still waiting.', say: 'I keep a stack of days still waiting for a warmer day. Temps on it stay decreasing.' })
      let saidPop = false
      for (let i = 0; i < temps.length; i++) {
        const temp = temps[i]
        t.step(L('for i, temp'), { vars: { i, temp, stack: [...stack] }, panels: view(i), note: `Day ${i}: ${temp}°.` })
        while (stack.length && temp > temps[stack[stack.length - 1]]) {
          const topIdx = stack[stack.length - 1]
          t.step(L('while stack and'), { vars: { i, temp, top: topIdx }, panels: view(i), note: `${temp}° beats ${temps[topIdx]}° on top.`, say: saidPop ? undefined : 'Today is warmer than the top day, so today is that day\'s answer. Pop and record the gap.' })
          saidPop = true
          const index = stack.pop()
          t.step(L('index = stack.pop()'), { vars: { i, index }, panels: view(i), note: `Day ${index} found its warmer day.` })
          result[index] = i - index
          t.step(L('result[index] ='), { vars: { index, wait: i - index }, panels: view(i, index), note: `result[${index}] = ${i} − ${index} = ${i - index}.` })
        }
        if (stack.length) t.step(L('while stack and'), { vars: { i, temp, top: stack[stack.length - 1] }, panels: view(i), note: `${temp}° not warmer than ${temps[stack[stack.length - 1]]}°. Stop.` })
        stack.push(i)
        t.step(L('stack.append(i)'), { vars: { i, stack: [...stack] }, panels: view(i), note: `Day ${i} now waits.`, say: i === 0 ? 'I push the index, not the temp, so I can compute the distance later.' : undefined })
      }
      t.step(L('return result'), { vars: { result: [...result] }, panels: view(null), note: 'Days left on the stack keep 0.', say: 'The while loop looks nested, but each index is pushed and popped at most once, so it is O(n) amortized.' })
    },
  },
  {
    id: `${topicId}:trace:largest-rectangle`,
    title: 'Largest Rectangle in Histogram',
    skills: ['monotonic-stack', 'stack'],
    problem: 'Largest rectangle area that fits under the histogram bars.',
    code: histogramCode,
    complexity: { time: 'O(n)', space: 'O(n)', why: 'Each bar pushed and popped once.' },
    inputs: [
      { label: 'classic', value: [2, 1, 5, 6, 2, 3] },
      { label: 'two bars', value: [2, 4] },
      { label: 'flat', value: [3, 3, 3] },
    ],
    run(input, t) {
      const heights = unwrap(input)
      const L = lineFinder(histogramCode)
      const hs = [...heights, 0]
      let result = 0
      let calc = ''
      const stack = []
      const view = (i, extra = {}) => [
        { kind: 'array', label: 'heights + [0]', values: [...hs], pointers: i == null ? {} : { i, ...(extra.start != null ? { start: extra.start } : {}) }, highlight: stack.map(([s]) => s), window: extra.window || undefined, dim: [] },
        { kind: 'stack', label: 'stack · (start, height) increasing', items: stack.map(([s, h]) => `start ${s} · h ${h}`), highlight: topIndex(stack) },
        { kind: 'text', text: `best = ${result}${calc ? `   ·   ${calc}` : ''}` },
      ]
      t.step(L('result = 0'), { vars: { result }, panels: view(null), note: 'Track best area seen.' })
      t.step(L('stack = []'), { vars: { stack: [] }, panels: view(null), note: 'Heights on the stack only increase.', say: 'Each bar extends right until a shorter bar appears. An increasing stack tells me exactly when that happens.' })
      let saidPop = false
      let saidStart = false
      for (let i = 0; i < hs.length; i++) {
        const h = hs[i]
        calc = ''
        t.step(L('for i, h in'), { vars: { i, h }, panels: view(i), note: i === heights.length ? 'Sentinel 0 flushes every bar left.' : `Bar ${i}, height ${h}.`, say: i === heights.length ? 'The trailing 0 forces every remaining bar to pop, so I do not need a cleanup loop.' : undefined })
        let start = i
        t.step(L('start = i'), { vars: { i, h, start }, panels: view(i, { start }), note: 'New bar can start here, maybe earlier.' })
        while (stack.length && stack[stack.length - 1][1] > h) {
          t.step(L('while stack and'), { vars: { i, h, topHeight: stack[stack.length - 1][1] }, panels: view(i, { start }), note: `Top height ${stack[stack.length - 1][1]} > ${h}: it can't extend.` })
          const [index, height] = stack.pop()
          t.step(L('index, height = stack.pop()'), { vars: { index, height }, panels: view(i, { start, window: [index, i - 1] }), note: `Bar h${height} spans ${index}..${i - 1}.`, say: saidPop ? undefined : 'When I pop, that bar is finished: it stretched from its start to just before i.' })
          saidPop = true
          const area = height * (i - index)
          result = Math.max(result, area)
          calc = `${height} × (${i} − ${index}) = ${area}`
          t.step(L('result = max('), { vars: { area, result }, panels: view(i, { start, window: [index, i - 1] }), note: `Area ${area}; best ${result}.` })
          start = index
          t.step(L('start = index'), { vars: { start }, panels: view(i, { start }), note: `Current bar can reach back to ${index}.`, say: saidStart ? undefined : 'The shorter bar inherits the popped start, because it fits under everything it popped.' })
          saidStart = true
        }
        stack.push([start, h])
        t.step(L('stack.append((start, h))'), { vars: { start, h, stack: stack.map(([s, x]) => [s, x]) }, panels: view(i, { start }), note: `Push (${start}, ${h}).` })
      }
      calc = ''
      t.step(L('return result'), { vars: { result }, panels: view(null), note: `Largest area ${result}.`, say: 'Every bar is pushed and popped once, so O(n) time and O(n) space.' })
    },
  },
  {
    id: `${topicId}:trace:next-greater`,
    title: 'Next Greater Element',
    skills: ['monotonic-stack', 'arrays-hashing'],
    problem: 'For each nums1 value, its next greater element in nums2, else -1.',
    code: ngeCode,
    complexity: { time: 'O(n + m)', space: 'O(m)', why: 'One monotonic pass over nums2, then lookups.' },
    inputs: [
      { label: 'classic', value: { nums1: [4, 1, 2], nums2: [1, 3, 4, 2] } },
      { label: 'longer', value: { nums1: [2, 6, 1, 5], nums2: [2, 7, 6, 1, 5, 8] } },
    ],
    run(input, t) {
      const { nums1, nums2 } = unwrap(input)
      const L = lineFinder(ngeCode)
      const nextGreater = {}
      const stack = []
      const view = (j, hlKey = []) => [
        { kind: 'array', label: 'nums2', values: [...nums2], pointers: j == null ? {} : { num: j }, highlight: j == null ? [] : [j], dim: j == null ? [] : range(j) },
        { kind: 'stack', label: 'stack · values (decreasing)', items: [...stack], highlight: topIndex(stack) },
        { kind: 'hashmap', label: 'nextGreater', entries: Object.entries(nextGreater).map(([k, v]) => [Number(k), v]), highlight: hlKey },
      ]
      t.step(L('nextGreater = {}'), { vars: {}, panels: view(null), note: 'Answer lookup for every nums2 value.', say: 'Values are unique, so I can map each value to its next greater, then answer nums1 by lookup.' })
      t.step(L('stack = []'), { vars: {}, panels: view(null), note: 'Values still looking for something bigger.' })
      let said = false
      nums2.forEach((num, j) => {
        t.step(L('for num in nums2'), { vars: { num, stack: [...stack] }, panels: view(j), note: `See ${num}.` })
        while (stack.length && num > stack[stack.length - 1]) {
          const popped = stack.pop()
          nextGreater[popped] = num
          t.step(L('nextGreater[stack.pop()]'), { vars: { num, popped }, panels: view(j, [popped]), note: `${num} is next greater for ${popped}.`, say: said ? undefined : 'Anything smaller on top just met its next greater element, so I pop and record it.' })
          said = true
        }
        stack.push(num)
        t.step(L('stack.append(num)'), { vars: { num, stack: [...stack] }, panels: view(j), note: `${num} waits.` })
      })
      const answer = nums1.map(num => nextGreater[num] ?? -1)
      t.step(L('return [nextGreater'), { vars: { result: answer }, panels: [...view(null), { kind: 'array', label: 'answer for nums1', values: answer, pointers: {}, highlight: [] }], note: 'Leftovers on stack have no greater: -1.', say: 'One pass over nums2 plus lookups: O(n + m) time.' })
    },
  },
  {
    id: `${topicId}:trace:sliding-window-max`,
    title: 'Sliding Window Maximum',
    skills: ['queue-deque', 'monotonic-stack', 'sliding-window'],
    problem: 'Max of every window of size k.',
    code: windowMaxCode,
    complexity: { time: 'O(n)', space: 'O(k)', why: 'Each index enters and leaves the deque once.' },
    inputs: [
      { label: 'k=3', value: { nums: [1, 3, -1, -3, 5, 3, 6, 7], k: 3 } },
      { label: 'falling k=2', value: { nums: [9, 7, 5, 3, 1], k: 2 } },
      { label: 'k=1', value: { nums: [4, 2, 6], k: 1 } },
    ],
    run(input, t) {
      const { nums, k } = unwrap(input)
      const L = lineFinder(windowMaxCode)
      const result = []
      const window = []
      const view = i => [
        { kind: 'array', label: 'nums', values: [...nums], pointers: i == null ? {} : { i }, highlight: [...window], window: i == null ? undefined : [Math.max(0, i - k + 1), i] },
        { kind: 'queue', label: 'window deque · indices, values decreasing', items: window.map(idx => `${idx} · ${nums[idx]}`), highlight: window.length ? [0] : [] },
        { kind: 'array', label: 'result', values: [...result], pointers: {}, highlight: result.length ? [result.length - 1] : [] },
      ]
      t.step(L('result = []'), { vars: { k }, panels: view(null), note: 'Collect one max per window.' })
      t.step(L('window = deque()'), { vars: {}, panels: view(null), note: 'Front always holds the window max.', say: 'I keep a deque of indices with decreasing values. The front is always the max of the current window.' })
      let saidPop = false
      let saidFront = false
      for (let i = 0; i < nums.length; i++) {
        t.step(L('for i in range'), { vars: { i, num: nums[i] }, panels: view(i), note: `Add nums[${i}] = ${nums[i]}.` })
        while (window.length && nums[window[window.length - 1]] < nums[i]) {
          const gone = window.pop()
          t.step(L('window.pop()'), { vars: { i, removed: gone }, panels: view(i), note: `${nums[gone]} < ${nums[i]}: it can never be a max again.`, say: saidPop ? undefined : 'A smaller value to the left of a bigger one is useless for every future window, so I pop it from the back.' })
          saidPop = true
        }
        window.push(i)
        t.step(L('window.append(i)'), { vars: { i, window: [...window] }, panels: view(i), note: `Index ${i} joins the back.` })
        if (window[0] <= i - k) {
          const gone = window.shift()
          t.step(L('window.popleft()'), { vars: { i, expired: gone }, panels: view(i), note: `Index ${gone} slid out of the window.`, say: saidFront ? undefined : 'The front index fell out of the window, so popleft. That is why I store indices.' })
          saidFront = true
        }
        if (i >= k - 1) {
          result.push(nums[window[0]])
          t.step(L('result.append('), { vars: { i, max: nums[window[0]] }, panels: view(i), note: `Window full: max = ${nums[window[0]]}.` })
        }
      }
      t.step(L('return result'), { vars: { result: [...result] }, panels: view(null), note: 'One max per window.', say: 'Each index is appended and removed once, so O(n) time and O(k) space, better than a heap at O(n log k).' })
    },
  },
  {
    id: `${topicId}:trace:reverse-list`,
    title: 'Reverse Linked List',
    skills: ['linked-list'],
    problem: 'Reverse a singly linked list in place.',
    code: reverseCode,
    complexity: { time: 'O(n)', space: 'O(1)', why: 'One pass, three pointers.' },
    inputs: [
      { label: '5 nodes', value: [1, 2, 3, 4, 5] },
      { label: '2 nodes', value: [1, 2] },
      { label: 'empty', value: [] },
    ],
    run(input, t) {
      const values = unwrap(input)
      const L = lineFinder(reverseCode)
      const nodes = chain(values, 'n')
      const map = indexMap(nodes)
      let prev = null
      let curr = nodes.length ? nodes[0].id : null
      let temp = null
      const val = id => id ? map[id].val : null
      const view = (hl = []) => [listPanel('list', nodes, { prev, curr, temp }, hl)]
      t.step(L('prev, curr = None, head'), { vars: { prev: null, curr: val(curr) }, panels: view(), note: 'prev starts at None: the new tail.', say: 'I walk the list once with prev and curr, flipping each arrow backwards. I save next first so I never lose the rest.' })
      let step = 0
      while (curr) {
        t.step(L('while curr:'), { vars: { prev: val(prev), curr: val(curr) }, panels: view([curr]), note: `curr = ${val(curr)}.` })
        temp = map[curr].next
        t.step(L('temp = curr.next'), { vars: { curr: val(curr), temp: val(temp) }, panels: view([curr]), note: 'Save the rest before cutting.', say: step === 0 ? 'Saving curr.next first is the key move; after the flip that link is gone.' : undefined })
        map[curr].next = prev
        t.step(L('curr.next = prev'), { vars: { curr: val(curr), prev: val(prev) }, panels: view([curr]), note: `Flip: ${val(curr)} → ${prev ? val(prev) : 'None'}.` })
        prev = curr
        t.step(L('prev = curr'), { vars: { prev: val(prev) }, panels: view([prev]), note: 'prev advances.' })
        curr = temp
        t.step(L('curr = temp'), { vars: { curr: val(curr) }, panels: view(curr ? [curr] : []), note: curr ? 'curr advances.' : 'curr fell off the end.' })
        step++
      }
      temp = null
      t.step(L('while curr:'), { vars: { curr: null }, panels: view(), note: 'curr is None: done.' })
      t.step(L('return prev'), { vars: { head: val(prev) }, panels: view(prev ? [prev] : []), note: 'prev is the new head.', say: 'Return prev, not curr: curr is None. O(n) time, O(1) extra space.' })
    },
  },
  {
    id: `${topicId}:trace:merge-two-lists`,
    title: 'Merge Two Sorted Lists',
    skills: ['linked-list', 'two-pointers'],
    problem: 'Splice two sorted lists into one sorted list.',
    code: mergeCode,
    complexity: { time: 'O(n + m)', space: 'O(1)', why: 'Relinks existing nodes; one pass.' },
    inputs: [
      { label: 'interleave', value: { list1: [1, 2, 4], list2: [1, 3, 4] } },
      { label: 'one empty', value: { list1: [], list2: [0] } },
      { label: 'uneven', value: { list1: [1, 5, 9], list2: [2, 3] } },
    ],
    run(input, t) {
      const { list1: a, list2: b } = unwrap(input)
      const L = lineFinder(mergeCode)
      const dummy = { id: 'd', val: 'D', next: null }
      const nodes = [dummy, ...chain(a, 'a'), ...chain(b, 'b')]
      const map = indexMap(nodes)
      let list1 = a.length ? 'a0' : null
      let list2 = b.length ? 'b0' : null
      let tail = 'd'
      const val = id => id ? map[id].val : null
      const view = (hl = []) => [
        listPanel('nodes', nodes, { dummy: 'd', tail, list1, list2 }, hl),
        { kind: 'text', text: `merged so far: ${walk(nodes, 'd').slice(1).join(' → ') || '(empty)'}` },
      ]
      t.step(L('dummy = ListNode()'), { vars: {}, panels: view(['d']), note: 'Dummy head: no special case for first node.', say: 'A dummy node means I never special-case the head; I just return dummy.next at the end.' })
      t.step(L('tail = dummy'), { vars: { tail: 'D' }, panels: view(['d']), note: 'tail is where the next node attaches.' })
      let said = false
      while (list1 && list2) {
        t.step(L('while list1 and list2'), { vars: { list1: val(list1), list2: val(list2) }, panels: view([list1, list2]), note: `Compare ${val(list1)} vs ${val(list2)}.` })
        if (map[list1].val < map[list2].val) {
          t.step(L('if list1.val < list2.val'), { vars: { list1: val(list1), list2: val(list2) }, panels: view([list1]), note: `${val(list1)} is smaller.` })
          map[tail].next = list1
          t.step(L('tail.next = list1'), { vars: { tail: val(tail) }, panels: view([list1]), note: `Attach ${val(list1)}.`, say: said ? undefined : 'Always attach the smaller head, then advance that list.' })
          list1 = map[list1].next
          t.step(L('list1 = list1.next'), { vars: { list1: val(list1) }, panels: view(list1 ? [list1] : []), note: 'Advance list1.' })
        } else {
          t.step(L('else:'), { vars: { list1: val(list1), list2: val(list2) }, panels: view([list2]), note: `${val(list2)} ≤ ${val(list1)}: take list2.` })
          map[tail].next = list2
          t.step(L('tail.next = list2'), { vars: { tail: val(tail) }, panels: view([list2]), note: `Attach ${val(list2)}.`, say: said ? undefined : 'Always attach the smaller head, then advance that list.' })
          list2 = map[list2].next
          t.step(L('list2 = list2.next'), { vars: { list2: val(list2) }, panels: view(list2 ? [list2] : []), note: 'Advance list2.' })
        }
        said = true
        tail = map[tail].next
        t.step(L('tail = tail.next'), { vars: { tail: val(tail) }, panels: view([tail]), note: 'tail moves to the newest node.' })
      }
      const rest = list1 || list2
      map[tail].next = rest
      t.step(L('tail.next = list1 or list2'), { vars: { rest: val(rest) }, panels: view(rest ? [rest] : []), note: rest ? 'Attach the leftover run in one link.' : 'Nothing left over.', say: 'One list ran out; the other is already sorted, so I attach it in one step.' })
      t.step(L('return dummy.next'), { vars: { head: val(map.d.next) }, panels: view(map.d.next ? [map.d.next] : []), note: 'Skip the dummy.', say: 'O(n + m) time, O(1) extra space since I only relink nodes.' })
    },
  },
  {
    id: `${topicId}:trace:cycle-floyd`,
    title: 'Linked List Cycle (fast/slow)',
    skills: ['linked-list', 'two-pointers'],
    problem: 'Does the list loop back on itself?',
    code: cycleCode,
    complexity: { time: 'O(n)', space: 'O(1)', why: 'Fast closes the gap by 1 per step inside the loop.' },
    inputs: [
      { label: 'cycle at 1', value: { values: [3, 2, 0, -4], pos: 1 } },
      { label: 'no cycle', value: { values: [1, 2, 3, 4, 5, 6], pos: -1 } },
      { label: 'cycle at 0', value: { values: [1, 2], pos: 0 } },
      { label: 'long loop', value: { values: [1, 2, 3, 4, 5, 6, 7], pos: 2 } },
    ],
    run(input, t) {
      const { values, pos } = unwrap(input)
      const L = lineFinder(cycleCode)
      const nodes = chain(values, 'n')
      const extra = {}
      if (pos >= 0 && nodes.length) {
        nodes[nodes.length - 1].next = nodes[pos].id
        extra.cycleTo = nodes[pos].id
      }
      const map = indexMap(nodes)
      let slow = nodes.length ? 'n0' : null
      let fast = slow
      const val = id => id ? map[id].val : null
      const view = (hl = []) => [listPanel('list', nodes, { slow, fast }, hl, extra)]
      t.step(L('slow = fast = head'), { vars: { slow: val(slow), fast: val(fast) }, panels: view(), note: 'Both start at head.', say: 'Two runners: slow moves 1, fast moves 2. If there is a loop, fast laps slow and they meet. O(1) space, no visited set.' })
      let rounds = 0
      while (fast && map[fast].next) {
        t.step(L('while fast and fast.next'), { vars: { slow: val(slow), fast: val(fast) }, panels: view(), note: 'fast can take two steps.', say: rounds === 0 ? 'I check fast and fast.next so fast.next.next never touches None.' : undefined })
        slow = map[slow].next
        t.step(L('slow = slow.next'), { vars: { slow: val(slow) }, panels: view([slow]), note: 'slow: one step.' })
        fast = map[map[fast].next].next
        t.step(L('fast = fast.next.next'), { vars: { fast: val(fast) }, panels: view(fast ? [fast] : []), note: 'fast: two steps.' })
        if (slow === fast) {
          t.step(L('if slow is fast'), { vars: { slow: val(slow), fast: val(fast) }, panels: view([slow]), note: 'Same node: they met.' })
          t.step(L('return True'), { vars: { result: true }, panels: view([slow]), note: 'Cycle found.', say: 'They met, so there is a cycle. Inside the loop fast gains one node per step, so it takes at most one lap: O(n).' })
          return
        }
        t.step(L('if slow is fast'), { vars: { slow: val(slow), fast: val(fast) }, panels: view(), note: 'Not met yet.' })
        rounds++
      }
      t.step(L('while fast and fast.next'), { vars: { fast: val(fast) }, panels: view(), note: 'fast hit the end.' })
      t.step(L('return False'), { vars: { result: false }, panels: view(), note: 'A list with an end has no cycle.', say: 'Fast reached None, so the list terminates. No cycle.' })
    },
  },
  {
    id: `${topicId}:trace:middle-node`,
    title: 'Middle of the Linked List',
    skills: ['linked-list', 'two-pointers'],
    problem: 'Return the middle node (second middle if even).',
    code: middleCode,
    complexity: { time: 'O(n)', space: 'O(1)', why: 'Fast covers 2x; when it ends, slow is halfway.' },
    inputs: [
      { label: 'odd', value: [1, 2, 3, 4, 5] },
      { label: 'even', value: [1, 2, 3, 4, 5, 6] },
      { label: 'single', value: [7] },
    ],
    run(input, t) {
      const values = unwrap(input)
      const L = lineFinder(middleCode)
      const nodes = chain(values, 'n')
      const map = indexMap(nodes)
      let slow = nodes.length ? 'n0' : null
      let fast = slow
      const val = id => id ? map[id].val : null
      const view = (hl = []) => [listPanel('list', nodes, { slow, fast }, hl)]
      t.step(L('slow = fast = head'), { vars: { slow: val(slow), fast: val(fast) }, panels: view(), note: 'Both at head.', say: 'Fast moves twice as fast, so when fast hits the end slow is at the middle. One pass, no length count.' })
      while (fast && map[fast].next) {
        t.step(L('while fast and fast.next'), { vars: { slow: val(slow), fast: val(fast) }, panels: view(), note: 'Room for fast to jump two.' })
        slow = map[slow].next
        t.step(L('slow = slow.next'), { vars: { slow: val(slow) }, panels: view([slow]), note: 'slow +1.' })
        fast = map[map[fast].next].next
        t.step(L('fast = fast.next.next'), { vars: { fast: val(fast) }, panels: view(fast ? [fast] : []), note: fast ? 'fast +2.' : 'fast stepped past the end.' })
      }
      t.step(L('while fast and fast.next'), { vars: { fast: val(fast) }, panels: view(), note: fast ? 'fast is the last node.' : 'fast is None.' })
      t.step(L('return slow'), { vars: { middle: val(slow) }, panels: view([slow]), note: `Middle is ${val(slow)}.`, say: values.length % 2 === 0 ? 'Even length gives the second middle. Starting fast at head.next would give the first.' : 'O(n) time, O(1) space.' })
    },
  },
  {
    id: `${topicId}:trace:remove-nth`,
    title: 'Remove Nth Node From End',
    skills: ['linked-list', 'two-pointers'],
    problem: 'Delete the nth node from the end in one pass.',
    code: removeNthCode,
    complexity: { time: 'O(n)', space: 'O(1)', why: 'Fixed gap between two pointers, one pass.' },
    inputs: [
      { label: 'n=2', value: { values: [1, 2, 3, 4, 5], n: 2 } },
      { label: 'remove head', value: { values: [1, 2], n: 2 } },
      { label: 'single', value: { values: [1], n: 1 } },
    ],
    run(input, t) {
      const { values, n } = unwrap(input)
      const L = lineFinder(removeNthCode)
      let nodes = [{ id: 'd', val: 'D', next: values.length ? 'n0' : null }, ...chain(values, 'n')]
      const map = indexMap(nodes)
      let behind = 'd'
      let ahead = 'd'
      const val = id => id ? map[id].val : null
      const view = (hl = []) => [
        listPanel('list', nodes, { dummy: 'd', behind, ahead }, hl),
        { kind: 'text', text: `gap = ${n + 1} links` },
      ]
      t.step(L('dummy = ListNode(0, head)'), { vars: { n }, panels: view(['d']), note: 'Dummy covers removing the head.', say: 'I add a dummy so removing the real head is the same as any other removal.' })
      t.step(L('behind = ahead = dummy'), { vars: { behind: 'D', ahead: 'D' }, panels: view(), note: 'Both start on dummy.' })
      for (let s = 0; s < n + 1; s++) {
        ahead = map[ahead].next
        t.step(L('ahead = ahead.next', 1), { vars: { step: s + 1, ahead: val(ahead) }, panels: view(ahead ? [ahead] : []), note: `ahead moves ${s + 1} of ${n + 1}.`, say: s === n ? 'ahead is now n+1 links ahead. When ahead falls off the end, behind sits just before the target.' : undefined })
      }
      while (ahead) {
        t.step(L('while ahead:'), { vars: { ahead: val(ahead), behind: val(behind) }, panels: view(), note: 'Not at the end yet.' })
        ahead = map[ahead].next
        t.step(L('ahead = ahead.next', 2), { vars: { ahead: val(ahead) }, panels: view(ahead ? [ahead] : []), note: 'ahead +1.' })
        behind = map[behind].next
        t.step(L('behind = behind.next'), { vars: { behind: val(behind) }, panels: view([behind]), note: 'behind +1, gap kept.' })
      }
      t.step(L('while ahead:'), { vars: { ahead: null, behind: val(behind) }, panels: view([behind]), note: 'ahead is None: behind is before the target.' })
      const target = map[behind].next
      map[behind].next = map[target].next
      t.step(L('behind.next = behind.next.next'), { vars: { removed: val(target) }, panels: view([target]), note: `Skip over ${val(target)}.`, say: 'One link change removes it. O(n) time, one pass, O(1) space.' })
      nodes = nodes.filter(node => node.id !== target)
      t.step(L('return dummy.next'), { vars: { result: walk(nodes, 'd').slice(1) }, panels: view(), note: 'Return the real head.' })
    },
  },
  {
    id: `${topicId}:trace:reorder-list`,
    title: 'Reorder List',
    skills: ['linked-list', 'two-pointers'],
    problem: 'L0→Ln→L1→Ln-1… in place.',
    code: reorderCode,
    complexity: { time: 'O(n)', space: 'O(1)', why: 'Find middle, reverse half, merge: three linear passes.' },
    inputs: [
      { label: '5 nodes', value: [1, 2, 3, 4, 5] },
      { label: '4 nodes', value: [1, 2, 3, 4] },
      { label: 'single', value: [1] },
    ],
    run(input, t) {
      const values = unwrap(input)
      const L = lineFinder(reorderCode)
      const nodes = chain(values, 'n')
      const map = indexMap(nodes)
      const val = id => id ? map[id].val : null
      let ptrs = {}
      const view = (hl = [], phase = '') => [
        listPanel('list', nodes, ptrs, hl),
        { kind: 'text', text: phase },
      ]
      let slow = 'n0'
      let fast = map.n0.next
      ptrs = { slow, fast }
      t.step(L('slow, fast = head, head.next'), { vars: { slow: val(slow), fast: val(fast) }, panels: view([], '1 · find middle'), note: 'Phase 1: find the middle.', say: 'Three moves: find the middle with fast and slow, reverse the second half, then weave the halves together.' })
      while (fast && map[fast].next) {
        slow = map[slow].next
        t.step(L('slow = slow.next'), { vars: { slow: val(slow) }, panels: (ptrs = { slow, fast }, view([slow], '1 · find middle')), note: 'slow +1.' })
        fast = map[map[fast].next].next
        ptrs = { slow, fast }
        t.step(L('fast = fast.next.next'), { vars: { fast: val(fast) }, panels: view(fast ? [fast] : [], '1 · find middle'), note: 'fast +2.' })
      }
      let second = map[slow].next
      ptrs = { slow, second }
      t.step(L('second = slow.next'), { vars: { slow: val(slow), second: val(second) }, panels: view(second ? [second] : [], '2 · split'), note: 'Second half starts after slow.' })
      let prev = null
      map[slow].next = null
      ptrs = { slow, second, prev }
      t.step(L('prev = slow.next = None'), { vars: { prev: null }, panels: view([slow], '2 · split'), note: 'Cut the list in two.', say: 'Cutting slow.next is important; otherwise the merged list ends in a cycle.' })
      let temp = null
      while (second) {
        temp = map[second].next
        map[second].next = prev
        ptrs = { prev, second, temp }
        t.step(L('second.next = prev'), { vars: { second: val(second), prev: val(prev), temp: val(temp) }, panels: view([second], '3 · reverse second half'), note: `Flip ${val(second)} → ${prev ? val(prev) : 'None'}.` })
        prev = second
        second = temp
        ptrs = { prev, second, temp }
        t.step(L('second = temp'), { vars: { prev: val(prev), second: val(second) }, panels: view([prev], '3 · reverse second half'), note: 'Advance.' })
      }
      let first = 'n0'
      second = prev
      ptrs = { first, second }
      t.step(L('first, second = head, prev'), { vars: { first: val(first), second: val(second) }, panels: view([first].concat(second ? [second] : []), '4 · weave'), note: 'Weave front half with reversed back half.', say: 'Now I alternate: one from the front, one from the back, saving both nexts before relinking.' })
      while (second) {
        const temp1 = map[first].next
        const temp2 = map[second].next
        ptrs = { first, second, temp1, temp2 }
        t.step(L('temp1, temp2 = first.next, second.next'), { vars: { temp1: val(temp1), temp2: val(temp2) }, panels: view([first, second], '4 · weave'), note: 'Save both nexts.' })
        map[first].next = second
        t.step(L('first.next = second'), { vars: { first: val(first), second: val(second) }, panels: view([first, second], '4 · weave'), note: `${val(first)} → ${val(second)}.` })
        map[second].next = temp1
        t.step(L('second.next = temp1'), { vars: { second: val(second), temp1: val(temp1) }, panels: view([second], '4 · weave'), note: `${val(second)} → ${temp1 ? val(temp1) : 'None'}.` })
        first = temp1
        second = temp2
        ptrs = { first, second }
        t.step(L('first, second = temp1, temp2'), { vars: { first: val(first), second: val(second) }, panels: view(first ? [first] : [], '4 · weave'), note: 'Advance both.' })
      }
      ptrs = { head: 'n0' }
      t.step(L('while second:', 2), { vars: { result: walk(nodes, 'n0') }, panels: view([], `done: ${walk(nodes, 'n0').join(' → ')}`), note: 'Reordered in place.', say: 'Three linear passes, so O(n) time and O(1) extra space.' })
    },
  },
  {
    id: `${topicId}:trace:add-two-numbers`,
    title: 'Add Two Numbers',
    skills: ['linked-list', 'math'],
    problem: 'Digits stored in reverse; return their sum as a list.',
    code: addTwoCode,
    complexity: { time: 'O(max(n, m))', space: 'O(max(n, m))', why: 'One node per output digit.' },
    inputs: [
      { label: '342 + 465', value: { l1: [2, 4, 3], l2: [5, 6, 4] } },
      { label: '999 + 1', value: { l1: [9, 9, 9], l2: [1] } },
      { label: '5 + 5', value: { l1: [5], l2: [5] } },
    ],
    run(input, t) {
      const { l1: a, l2: b } = unwrap(input)
      const L = lineFinder(addTwoCode)
      const nodesA = chain(a, 'a')
      const nodesB = chain(b, 'b')
      const out = [{ id: 'd', val: 'D', next: null }]
      const mapA = indexMap(nodesA)
      const mapB = indexMap(nodesB)
      const mapOut = indexMap(out)
      let l1 = a.length ? 'a0' : null
      let l2 = b.length ? 'b0' : null
      let tail = 'd'
      let carry = 0
      let total = 0
      const view = (hlA = [], hlB = []) => [
        listPanel('l1', nodesA, { l1 }, hlA),
        listPanel('l2', nodesB, { l2 }, hlB),
        listPanel('result', out, { dummy: 'd', tail }, [tail]),
        { kind: 'text', text: `carry = ${carry}   total = ${total}` },
      ]
      t.step(L('dummy = ListNode()'), { vars: {}, panels: view(), note: 'Dummy head for the answer.', say: 'Digits are already least-significant first, so I add like grade school from the heads, carrying as I go.' })
      t.step(L('carry = 0'), { vars: { carry }, panels: view(), note: 'No carry yet.' })
      let first = true
      while (l1 || l2 || carry) {
        total = carry
        t.step(L('total = carry'), { vars: { carry, total }, panels: view(l1 ? [l1] : [], l2 ? [l2] : []), note: `Start digit sum with carry ${carry}.`, say: !l1 && !l2 ? 'Both lists are done but carry is 1, so the loop condition includes carry to add the final digit.' : undefined })
        const hlA = l1 ? [l1] : []
        const hlB = l2 ? [l2] : []
        if (l1) {
          total += mapA[l1].val
          l1 = mapA[l1].next
        }
        if (l2) {
          total += mapB[l2].val
          l2 = mapB[l2].next
        }
        t.step(L(hlB.length ? 'total += l2.val' : 'total += l1.val'), { vars: { total }, panels: view(hlA, hlB), note: `Digits summed: total = ${total}.` })
        carry = Math.floor(total / 10)
        const digit = total % 10
        t.step(L('carry, digit = divmod'), { vars: { carry, digit }, panels: view(hlA, hlB), note: `${total} → digit ${digit}, carry ${carry}.`, say: first ? 'divmod by 10 splits the digit to write from the carry to pass on.' : undefined })
        first = false
        const node = { id: `r${out.length}`, val: digit, next: null }
        out.push(node)
        mapOut[node.id] = node
        mapOut[tail].next = node.id
        tail = node.id
        t.step(L('tail = tail.next'), { vars: { digit }, panels: view(), note: `Append ${digit}.` })
      }
      total = 0
      t.step(L('return dummy.next'), { vars: { result: walk(out, 'd').slice(1) }, panels: view(), note: 'Answer, digits reversed.', say: 'O(max(n, m)) time; the output list is the only extra space.' })
    },
  },
]

const lessons = [
  {
    id: `${topicId}:lesson:stack`,
    title: 'Stack = pending work',
    skills: ['stack', 'ds-diagnosis'],
    slides: [
      {
        title: 'Last in, first out',
        panels: [{ kind: 'stack', label: 'stack', items: ['a', 'b', 'c'], highlight: [2] }],
        points: ['append → push O(1)', 'pop() → O(1)', 'stack[-1] → peek'],
      },
      {
        title: 'It holds what is still waiting',
        panels: [
          { kind: 'array', label: 's', values: ['(', '{', '[', ']', '}', ')'], pointers: { char: 3 }, highlight: [3], dim: [] },
          { kind: 'stack', label: 'openers waiting', items: ['(', '{', '['], highlight: [2] },
        ],
        points: ['Top = the most recent unfinished thing', 'Next event resolves the top first'],
      },
      {
        title: 'Reach for a stack when you see',
        points: ['matching / balanced / nested', 'undo, back, most recent', 'evaluate expression, decode string', 'iterative DFS'],
      },
      {
        title: 'Python stack',
        code: `stack = []
stack.append(x)
top = stack[-1]
x = stack.pop()
if not stack:
    return True`,
        highlight: 4,
        points: ['Plain list. Never pop(0).'],
      },
      {
        title: 'Check',
        ask: { q: 'Browser back button history?', choices: ['Queue', 'Stack', 'Heap', 'Set'], answer: 1, why: 'Back returns to the most recently visited page: LIFO.' },
      },
    ],
  },
  {
    id: `${topicId}:lesson:monotonic`,
    title: 'Monotonic stack rules',
    skills: ['monotonic-stack'],
    slides: [
      {
        title: '"Next greater / smaller" → monotonic stack',
        points: ['Brute force: O(n²) scan right', 'Stack: O(n), one pass', 'Each index pushed once, popped once'],
      },
      {
        title: 'Decreasing stack → next GREATER',
        panels: [
          { kind: 'array', label: 'temps', values: [73, 74, 75, 71, 69, 72], pointers: { i: 5 }, highlight: [2, 3, 4], dim: [] },
          { kind: 'stack', label: 'indices · temps decreasing', items: ['2 · 75°', '3 · 71°', '4 · 69°'], highlight: [2] },
        ],
        points: ['72 arrives → pops 69, 71', 'Popped item’s answer = current i'],
      },
      {
        title: 'Increasing stack → next SMALLER',
        panels: [
          { kind: 'array', label: 'heights', values: [2, 1, 5, 6, 2, 3], pointers: { i: 4 }, highlight: [1, 2, 3], dim: [] },
          { kind: 'stack', label: '(start, h) increasing', items: ['1 · h1', '2 · h5', '3 · h6'], highlight: [2] },
        ],
        points: ['2 arrives → pops 6, 5', 'Popped bar ends at i − 1'],
      },
      {
        title: 'Store indices, not values',
        points: ['distance = i − index', 'value = nums[index]', 'window expiry needs the index'],
      },
      {
        title: 'The template',
        code: `for i, num in enumerate(nums):
    while stack and num > nums[stack[-1]]:
        index = stack.pop()
        result[index] = num
    stack.append(i)`,
        highlight: 2,
        points: ['Flip > to < for next smaller'],
      },
      {
        title: 'Check',
        ask: { q: 'Next SMALLER element to the right: stack order bottom→top?', choices: ['Decreasing', 'Increasing', 'Sorted by index desc', 'Any order'], answer: 1, why: 'A smaller arrival pops bigger tops, so what remains increases.' },
      },
    ],
  },
  {
    id: `${topicId}:lesson:deque`,
    title: 'Queues & deques',
    skills: ['queue-deque', 'ds-diagnosis'],
    slides: [
      {
        title: 'First in, first out',
        panels: [{ kind: 'queue', label: 'queue', items: ['a', 'b', 'c'], highlight: [0] }],
        points: ['append → back', 'popleft → front', 'BFS, scheduling, streams'],
      },
      {
        title: 'Use deque, not list',
        panels: [{ kind: 'table', label: 'cost', rows: [['O(1)', 'O(n)'], ['O(1)', 'O(n)'], ['O(1)', 'O(1)']], rowLabels: ['pop front', 'push front', 'push / pop back'], colLabels: ['deque', 'list'], highlight: ['0,1', '1,1'], deps: [] }],
        points: ['list.pop(0) shifts every element'],
      },
      {
        title: 'Python queue',
        code: `from collections import deque

queue = deque([start])
while queue:
    node = queue.popleft()
    queue.append(neighbor)`,
        highlight: 5,
      },
      {
        title: 'Monotonic deque: window max',
        panels: [
          { kind: 'array', label: 'nums, k=3', values: [1, 3, -1, -3, 5], pointers: { i: 3 }, highlight: [1, 2, 3], window: [1, 3] },
          { kind: 'queue', label: 'indices · values decreasing', items: ['1 · 3', '2 · -1', '3 · -3'], highlight: [0] },
        ],
        points: ['Back: pop smaller values', 'Front: pop expired index', 'Front = window max'],
      },
      {
        title: 'Check',
        ask: { q: 'BFS with queue.pop(0) on 10^5 nodes costs?', choices: ['O(n)', 'O(n log n)', 'O(n²)', 'O(1)'], answer: 2, why: 'Each pop(0) shifts up to n items; n pops → O(n²).' },
      },
    ],
  },
  {
    id: `${topicId}:lesson:linked-list`,
    title: 'Linked list toolkit',
    skills: ['linked-list', 'two-pointers'],
    slides: [
      {
        title: 'Dummy node',
        panels: [{ kind: 'linkedlist', label: 'with dummy', nodes: [{ id: 'd', val: 'D', next: 'n0' }, { id: 'n0', val: 1, next: 'n1' }, { id: 'n1', val: 2, next: null }], pointers: { dummy: 'd', tail: 'd' }, highlight: ['d'] }],
        points: ['Head edits become normal edits', 'Return dummy.next'],
      },
      {
        title: 'prev / curr / temp dance',
        code: `while curr:
    temp = curr.next
    curr.next = prev
    prev = curr
    curr = temp`,
        highlight: 2,
        points: ['Save next before you cut'],
      },
      {
        title: 'Fast / slow',
        panels: [{ kind: 'linkedlist', label: 'fast 2x', nodes: chain([1, 2, 3, 4, 5], 'm'), pointers: { slow: 'm2', fast: 'm4' }, highlight: ['m2'] }],
        points: ['Fast at end → slow at middle', 'They meet → cycle'],
      },
      {
        title: 'Gap pointers',
        panels: [{ kind: 'linkedlist', label: 'n = 2', nodes: [{ id: 'd', val: 'D', next: 'g0' }, ...chain([1, 2, 3, 4, 5], 'g')], pointers: { behind: 'g2', ahead: null }, highlight: ['g3'] }],
        points: ['ahead leads by n + 1', 'ahead None → behind before target'],
      },
      {
        title: 'Check',
        ask: { q: 'Reversing a list: what breaks if you skip temp = curr.next?', choices: ['Nothing', 'You lose the rest of the list', 'Infinite loop always', 'Head unchanged'], answer: 1, why: 'curr.next = prev overwrites the only link to the remaining nodes.' },
      },
    ],
  },
  {
    id: `${topicId}:lesson:python-costs`,
    title: 'Pick it fast: costs & signals',
    skills: ['ds-diagnosis', 'complexity', 'queue-deque', 'stack'],
    slides: [
      {
        title: 'Python costs',
        panels: [{ kind: 'table', label: 'big-O', rows: [['O(1)', 'O(1)'], ['O(n)', 'O(1)'], ['O(1)', 'O(n)'], ['O(n)', 'O(n)']], rowLabels: ['append / pop end', 'insert / pop front', 'index [i]', 'x in'], colLabels: ['list', 'deque'], highlight: ['1,1', '2,0'], deps: [] }],
      },
      {
        title: 'Signal → structure',
        panels: [{ kind: 'hashmap', label: 'when you read…', entries: [['matching, nested, undo', 'stack'], ['next greater / smaller', 'monotonic stack'], ['window max / min', 'monotonic deque'], ['level by level, arrival order', 'queue'], ['O(1) move / evict + lookup', 'hashmap + linked list']], highlight: [] }],
      },
      {
        title: 'Amortized O(1)',
        points: ['Nested while ≠ O(n²)', 'Count pushes + pops total', 'Each ≤ n → O(n)'],
      },
      {
        title: 'Check',
        ask: { q: 'LRU cache with O(1) get and put needs?', choices: ['Heap', 'Hashmap + doubly linked list', 'Sorted list', 'Two stacks'], answer: 1, why: 'Hashmap finds the node; the linked list moves or evicts it in O(1).' },
      },
    ],
  },
]

const flashcards = [
  ['stack', 'Signals that say "stack"', 'Matching pairs, nesting, undo/back, "most recent", expression evaluation, iterative DFS.'],
  ['stack', 'Valid parentheses: what goes on the stack?', 'Openers only. A closer must match the top; pop on match. Valid if stack empty at end.'],
  ['stack', 'Valid parentheses edge cases', 'Closer with empty stack, mismatched top, leftover openers, odd length shortcut.'],
  ['stack', 'Min stack trick', 'Push (val, minSoFar). getMin = stack[-1][1]. All ops O(1).'],
  ['stack', 'Eval RPN: operator order', 'second = pop(), first = pop(), push(first op second). Order matters for - and /.'],
  ['stack', 'Python division truncating toward zero', 'int(a / b). Floor // rounds -7/2 to -4, but RPN wants -3.'],
  ['stack', 'Python stack ops', 'stack.append(x), stack.pop(), stack[-1] to peek, `if not stack` for empty. All O(1).'],
  ['stack', 'Decode string "3[a2[c]]"', 'Stack of (prevString, count). On "[" push; on "]" pop and prev + count * current.'],
  ['monotonic-stack', 'When to use a monotonic stack', '"Next/previous greater or smaller" for every element. O(n) instead of O(n²).'],
  ['monotonic-stack', 'Next GREATER: stack is…', 'Decreasing (bottom→top). A bigger arrival pops smaller tops and answers them.'],
  ['monotonic-stack', 'Next SMALLER: stack is…', 'Increasing. A smaller arrival pops bigger tops.'],
  ['monotonic-stack', 'Why store indices in a monotonic stack?', 'Distance (i − index), value lookup via nums[index], and window expiry all need the index.'],
  ['monotonic-stack', 'Monotonic stack complexity', 'O(n) amortized time: each index pushed once, popped at most once. O(n) space.'],
  ['monotonic-stack', 'Daily temperatures answer for popped index', 'result[index] = i − index, where i is the warmer day that popped it.'],
  ['monotonic-stack', 'Largest rectangle: when a bar pops', 'Its width runs from its start to i − 1. Area = height × (i − start).'],
  ['monotonic-stack', 'Largest rectangle: why heights + [0]?', 'The 0 sentinel pops every remaining bar, so no cleanup loop.'],
  ['monotonic-stack', 'Largest rectangle: start = index', 'The new shorter bar can extend back to the earliest popped start.'],
  ['monotonic-stack', 'Circular next greater (LC 503)', 'Loop i over 2n, use i % n. Only push during the first pass.'],
  ['queue-deque', 'Queue in Python', 'from collections import deque; append back, popleft front. Both O(1).'],
  ['queue-deque', 'Why not list.pop(0)?', 'It shifts every element: O(n). A BFS of n nodes becomes O(n²).'],
  ['queue-deque', 'Deque costs', 'append, appendleft, pop, popleft: O(1). Index into middle: O(n).'],
  ['queue-deque', 'Sliding window max: deque holds', 'Indices whose values are decreasing. Front = current window max.'],
  ['queue-deque', 'Sliding window max: two removals', 'Back: pop smaller values than new num. Front: popleft if index ≤ i − k.'],
  ['queue-deque', 'Sliding window max complexity', 'O(n) time, O(k) space. Heap version is O(n log n).'],
  ['queue-deque', 'Queue using two stacks', 'Push to inbox. On pop, if outbox empty, move all inbox → outbox. Amortized O(1).'],
  ['queue-deque', 'deque(maxlen=k)', 'Auto-drops from the opposite end when full. Handy for last-k items.'],
  ['linked-list', 'Dummy node: why?', 'Removes head special cases. Build after dummy, return dummy.next.'],
  ['linked-list', 'Reverse list: 4 lines', 'temp = curr.next; curr.next = prev; prev = curr; curr = temp. Return prev.'],
  ['linked-list', 'Fast/slow: find middle', 'slow +1, fast +2 while fast and fast.next. slow ends at middle (second if even).'],
  ['linked-list', 'Floyd cycle detection', 'slow +1, fast +2. Meet → cycle. fast hits None → no cycle. O(1) space.'],
  ['linked-list', 'Cycle start (LC 142)', 'After meeting, reset one pointer to head; move both +1. They meet at the cycle start.'],
  ['linked-list', 'Remove nth from end', 'Dummy; ahead moves n+1; then move both until ahead None; behind.next = behind.next.next.'],
  ['linked-list', 'Reorder list recipe', 'Find middle, cut, reverse second half, weave halves alternating.'],
  ['linked-list', 'Merge two sorted lists', 'Dummy + tail. Attach smaller head, advance. End: tail.next = list1 or list2.'],
  ['bit', 'Swap two integers without a temp?', 'a ^= b; b ^= a; a ^= b. Each XOR step recovers one original value from the other two.'],
  ['linked-list', 'Reverse k-group: leftover', 'If fewer than k nodes remain, leave them as is. Check with a kth walk first.'],
  ['linked-list', 'Cycle detection with a set of values: bug?', 'Duplicate values give false positives. Store node objects, or use fast/slow.'],
  ['linked-list', 'LRU cache structure', 'Hashmap key → node, plus doubly linked list for recency. get/put O(1).'],
  ['complexity', 'Recursive linked list ops in Python', 'O(n) call stack. Default limit ~1000, so 10^5 nodes → RecursionError. Prefer iterative.'],
  ['communication', 'Say this before a monotonic stack', '"Each index is pushed and popped once, so the nested while is O(n) amortized."'],
].map(([skill, front, back], i) => ({ id: `${topicId}:card:${i + 1}`, skills: [skill], front, back }))

const mcqData = [
  ['stack', 1, 'Valid parentheses on "(]": what happens at "]"?', null, ['Push "]"', 'Top "(" ≠ "[" → return False', 'Pop and continue', 'Skip it'], 1, 'The closer needs "[" on top; "(" is there, so nesting is broken.'],
  ['stack', 1, 'Valid parentheses on "((": the loop ends. Result?', null, ['True', 'False: stack not empty', 'Error', 'True if length even'], 1, 'Leftover openers were never closed. Return not stack.'],
  ['stack', 2, 'Why is a stack the right structure for bracket matching?', null, ['Sorted order', 'The most recent unmatched opener must close first', 'O(1) search', 'Removes duplicates'], 1, 'Nesting is LIFO: the latest opener is the first to close.'],
  ['stack', 2, 'MinStack: push 5, push 3, push 7, pop, getMin() returns?', null, ['7', '5', '3', 'None'], 2, 'After popping 7, top entry is (3, min 3).'],
  ['stack', 2, 'MinStack with (val, minSoFar) pairs. getMin cost?', null, ['O(n)', 'O(log n)', 'O(1)', 'O(1) amortized only'], 2, 'The min is stored on the top entry; just read it.'],
  ['stack', 2, 'MinStack using min(self.stack) in getMin. Problem?', null, ['Wrong answer', 'getMin is O(n), not O(1)', 'Uses too little memory', 'pop breaks'], 1, 'Correct but scans the whole stack each call.'],
  ['stack', 2, 'Eval RPN tokens ["4","2","-"]. Pops are second=2, first=4. Push?', null, ['-2', '2', '6', '8'], 1, 'Compute first - second = 4 - 2.'],
  ['stack', 3, 'Eval RPN "-7 2 /" should give -3. Which Python expression?', null, ['-7 // 2', 'int(-7 / 2)', 'round(-7 / 2)', 'math.floor(-7 / 2)'], 1, 'Floor division gives -4. int() truncates toward zero.'],
  ['monotonic-stack', 1, 'Daily temperatures: what does the stack store?', null, ['Temperatures sorted', 'Indices of days still waiting for a warmer day', 'Answers', 'Every index ever seen'], 1, 'Indices waiting; their temps are decreasing.'],
  ['monotonic-stack', 2, 'Daily temperatures: bottom→top, the temps on the stack are…', null, ['Increasing', 'Decreasing (non-increasing)', 'Random', 'Equal'], 1, 'Any warmer arrival pops colder tops, so what remains decreases.'],
  ['monotonic-stack', 2, 'Daily temperatures has a while inside a for. Time?', null, ['O(n²)', 'O(n log n)', 'O(n)', 'O(n·k)'], 2, 'Each index is pushed and popped at most once: 2n operations total.'],
  ['monotonic-stack', 2, 'Next SMALLER element to the right. Stack order?', null, ['Decreasing', 'Increasing', 'Sorted descending by index', 'Doesn\'t matter'], 1, 'A smaller arrival pops bigger tops; leftovers increase.'],
  ['monotonic-stack', 2, 'Temps [70, 60, 65]. Day 2 (65) arrives. What pops?', null, ['Nothing', 'Index 1 (60)', 'Indices 1 and 0', 'Index 0 (70)'], 1, '65 > 60 pops index 1; 65 < 70 stops.'],
  ['monotonic-stack', 3, 'Largest rectangle: bar (start 2, h 5) pops at i = 4. Width?', null, ['5', '4', '2', '3'], 2, 'Width = i - start = 4 - 2 = 2. Area 10.'],
  ['monotonic-stack', 2, 'Largest rectangle: why loop over heights + [0]?', null, ['Avoid empty input', 'The 0 forces every leftover bar to pop and be measured', 'Keeps stack increasing', 'Off-by-one on indices'], 1, 'Sentinel flushes the stack, no extra cleanup loop.'],
  ['monotonic-stack', 3, 'Largest rectangle: after popping, why start = index?', null, ['To reset', 'The shorter current bar extends left over everything it popped', 'To skip duplicates', 'To keep the stack small'], 1, 'Popped bars were taller, so the current height fits under them.'],
  ['constraints', 2, 'Histogram n ≤ 10^5. Brute force tries every pair. Verdict?', null, ['Fine: 10^5 ops', 'Too slow: ~10^10 ops; use O(n) stack', 'Fine with memo', 'Need O(log n)'], 1, 'n² = 10^10 is far above ~10^8/sec.'],
  ['monotonic-stack', 2, 'Next greater element I: why a hashmap too?', null, ['To sort', 'nums1 asks about values; map value → next greater for O(1) lookup', 'To count', 'Remove duplicates'], 1, 'Compute once over nums2, then answer each nums1 query by lookup.'],
  ['monotonic-stack', 3, 'Circular next greater (LC 503). Standard trick?', null, ['Sort first', 'Iterate 2n times using i % n', 'Reverse array', 'Use a heap'], 1, 'A second pass lets wrap-around elements answer the leftovers.'],
  ['queue-deque', 1, 'BFS queue in Python should be…', null, ['list with pop(0)', 'collections.deque with popleft()', 'heapq', 'set'], 1, 'popleft is O(1); list.pop(0) is O(n).'],
  ['queue-deque', 2, 'BFS on 10^5 nodes using list.pop(0). Time?', null, ['O(n)', 'O(n log n)', 'O(n²) from shifting', 'O(1)'], 2, 'Each pop(0) shifts the rest of the list.'],
  ['queue-deque', 2, 'Which deque operation is NOT O(1)?', null, ['appendleft', 'pop', 'popleft', 'dq[len(dq) // 2]'], 3, 'Indexing the middle of a deque walks blocks: O(n).'],
  ['queue-deque', 2, 'Sliding window max: what does the deque store?', null, ['Values sorted ascending', 'Indices with decreasing values', 'Window sums', 'All indices in window'], 1, 'Decreasing values; front is the max; indices allow expiry.'],
  ['queue-deque', 2, 'Sliding window max: when do you popleft?', null, ['Every step', 'When front index ≤ i - k (left the window)', 'When the deque is full', 'When nums[i] is smaller'], 1, 'The front expires once it falls outside [i-k+1, i].'],
  ['queue-deque', 3, 'nums [1,3,-1], k=3, then -3 arrives (i=3). Deque values after?', null, ['[3, -1, -3]', '[-1, -3]', '[3, -3]', '[1, 3, -1, -3]'], 0, 'Index 1 (3) still in window [1,3]; -3 is smaller, just appended.'],
  ['queue-deque', 2, 'Window max with a heap vs monotonic deque?', null, ['Both O(n)', 'Heap O(n log n), deque O(n)', 'Heap O(n), deque O(n log n)', 'Both O(nk)'], 1, 'Deque does amortized O(1) per element.'],
  ['queue-deque', 2, 'Queue via two stacks: cost of dequeue?', null, ['Always O(n)', 'Amortized O(1)', 'O(log n)', 'O(1) worst case'], 1, 'Each element moves inbox → outbox once.'],
  ['linked-list', 1, 'Reverse linked list returns…', null, ['curr', 'head', 'prev', 'temp'], 2, 'Loop ends with curr = None; prev is the new head.'],
  ['linked-list', 2, 'Reversing: you write curr.next = prev before saving curr.next. Result?', null, ['Works', 'The rest of the list is lost', 'Infinite loop', 'Only head reversed correctly, rest fine'], 1, 'The only link to the remaining nodes was overwritten.'],
  ['linked-list', 2, 'Recursive reverse on 10^5 nodes in Python?', null, ['Fine', 'RecursionError: default depth ~1000', 'O(n²)', 'Uses O(1) space'], 1, 'One frame per node; iterative is safer.'],
  ['linked-list', 1, 'Main purpose of a dummy node?', null, ['Speed', 'Avoid special-casing changes to the head', 'Detect cycles', 'Save memory'], 1, 'The real head becomes just another next pointer.'],
  ['linked-list', 2, 'Merging sorted lists: after the loop, tail.next = list1 or list2. Why safe?', null, ['Both are None', 'The leftover is already sorted and all ≥ merged values', 'It sorts them', 'It copies nodes'], 1, 'One list ran out; the remainder is sorted and larger.'],
  ['linked-list', 2, 'Merge two sorted lists, sizes n and m. Extra space (iterative)?', null, ['O(n + m)', 'O(1)', 'O(log n)', 'O(n·m)'], 1, 'Only relinks existing nodes.'],
  ['linked-list', 2, 'Floyd: why does fast eventually meet slow inside a cycle?', null, ['Fast slows down', 'Fast closes the gap by 1 node each step', 'They both reset', 'Random chance'], 1, 'Relative speed 1 means the gap hits 0 within one lap.'],
  ['linked-list', 1, 'Why loop "while fast and fast.next"?', null, ['Style', 'fast.next.next would crash if fast or fast.next is None', 'To skip head', 'To detect even length'], 1, 'Guard both before jumping two.'],
  ['linked-list', 3, 'Cycle check stores node.val in a set. Fails when?', null, ['Never', 'Values repeat, e.g. [1, 1, 2] without a cycle', 'List is empty', 'Cycle at head'], 1, 'Equal values are different nodes; store nodes or use fast/slow.'],
  ['linked-list', 2, '[1,2,3,4], slow = fast = head. Middle returned?', null, ['2', '3', '4', '1'], 1, 'Even length gives the second middle.'],
  ['linked-list', 3, 'You need the FIRST middle of an even list (reorder list). Change?', null, ['Start fast = head.next', 'Start slow = head.next', 'Move fast by 3', 'Return slow.next'], 0, 'Fast one step ahead makes slow stop one earlier.'],
  ['linked-list', 2, 'Remove nth from end with dummy: ahead first moves…', null, ['n steps', 'n + 1 steps', 'n - 1 steps', 'to the end'], 1, 'Then behind stops at the node before the target.'],
  ['linked-list', 2, 'Remove nth from end, n = length (remove head). With dummy?', null, ['Crash', 'behind stays on dummy; dummy.next skips head', 'Need special case', 'Returns None'], 1, 'Dummy makes head removal ordinary.'],
  ['linked-list', 2, 'Reorder list in O(1) space. Steps?', null, ['Sort then merge', 'Middle → reverse second half → weave', 'Stack all nodes', 'Recursion only'], 1, 'Three linear passes, no extra storage.'],
  ['linked-list', 3, 'Reorder list: forget slow.next = None. Likely bug?', null, ['Faster', 'Cycle in the result', 'Middle node lost', 'No effect'], 1, 'The first half still points into the reversed half.'],
  ['linked-list', 2, 'Add two numbers: why "or carry" in the loop condition?', null, ['Style', 'A final carry needs one more node (e.g. 5 + 5)', 'Handles negatives', 'Avoids None'], 1, 'Both lists done, carry 1 → append digit 1.'],
  ['linked-list', 3, 'Reverse nodes in k-group, 7 nodes, k = 3. Last node?', null, ['Reversed alone', 'Left as is', 'Removed', 'Moved to front'], 1, 'Fewer than k nodes remain, so leave them.'],
  ['ds-diagnosis', 2, 'Prompt: "for each day, how many days until a warmer one". Pick:', null, ['Heap', 'Monotonic stack', 'Queue', 'Binary search'], 1, '"Next greater" for each element is the monotonic stack signal.'],
  ['ds-diagnosis', 2, 'Prompt: "maximum of each window of size k". Pick:', null, ['Monotonic deque', 'Stack', 'Hashset', 'Trie'], 0, 'Expire from front, prune smaller from back.'],
  ['ds-diagnosis', 2, 'Prompt: "get and put in O(1), evict least recently used". Pick:', null, ['Heap', 'Hashmap + doubly linked list', 'Sorted array', 'Two stacks'], 1, 'Map finds node; list moves or evicts it in O(1).'],
  ['communication', 2, 'Best line to say while writing the monotonic while loop?', null, ['"This is O(n²) but fine"', '"Each index is pushed and popped once, so O(n) amortized"', '"Python is fast"', 'Say nothing'], 1, 'Pre-empt the nested-loop complexity question.'],
].map(([skill, difficulty, q, code, choices, answer, why], i) => {
  const shift = (i * 3 + 1) % 4
  const rotated = choices.map((_, j) => choices[(j + shift) % 4])
  return { id: `${topicId}:mcq:${i + 1}`, skills: [skill], difficulty, q, ...(code ? { code } : {}), choices: rotated, answer: (answer - shift + 4) % 4, why }
})

const mcqs = mcqData

const clozes = [
  { title: 'Valid parentheses', skills: ['stack'], code: `for char in s:
    if char in pairs:
        if [[not stack]] or stack[-1] != pairs[char]:
            return False
        stack.[[pop()]]
    else:
        stack.[[append(char)]]

return [[not stack|len(stack) == 0]]` },
  { title: 'Daily temperatures', skills: ['monotonic-stack'], code: `for i, temp in enumerate(temperatures):
    while stack and temp [[>]] temperatures[stack[-1]]:
        index = stack.pop()
        result[index] = [[i - index]]
    stack.append([[i]])` },
  { title: 'Sliding window max', skills: ['queue-deque', 'monotonic-stack'], code: `for i in range(len(nums)):
    while window and nums[window[-1]] [[<]] nums[i]:
        window.pop()
    window.append(i)

    if window[0] <= [[i - k]]:
        window.[[popleft()]]

    if i >= [[k - 1]]:
        result.append(nums[window[0]])` },
  { title: 'Reverse a linked list', skills: ['linked-list'], code: `prev, curr = None, head

while curr:
    temp = [[curr.next]]
    curr.next = [[prev]]
    prev = [[curr]]
    curr = temp

return [[prev]]` },
  { title: 'Merge two sorted lists', skills: ['linked-list'], code: `dummy = ListNode()
tail = dummy

while list1 and list2:
    if list1.val < list2.val:
        tail.next = list1
        list1 = list1.next
    else:
        tail.next = list2
        list2 = list2.next
    tail = [[tail.next]]

tail.next = [[list1 or list2|list2 or list1]]
return [[dummy.next]]` },
  { title: 'Middle node', skills: ['linked-list'], code: `slow = fast = head

while [[fast and fast.next]]:
    slow = [[slow.next]]
    fast = [[fast.next.next]]

return slow` },
  { title: 'Remove nth from end', skills: ['linked-list'], code: `dummy = ListNode(0, head)
behind = ahead = dummy

for _ in range([[n + 1]]):
    ahead = ahead.next

while [[ahead]]:
    ahead = ahead.next
    behind = behind.next

behind.next = [[behind.next.next]]
return dummy.next` },
  { title: 'Min stack push', skills: ['stack'], code: `def push(self, val: int) -> None:
    if [[self.stack]]:
        minVal = [[min(self.stack[-1][1], val)|min(val, self.stack[-1][1])]]
    else:
        minVal = val
    self.stack.append(([[val]], minVal))

def getMin(self) -> int:
    return self.stack[-1][1]` },
  { title: 'BFS queue', skills: ['queue-deque'], code: `from collections import [[deque]]

queue = deque([start])
seen = {start}
while queue:
    node = queue.[[popleft()]]
    for neighbor in graph[node]:
        if neighbor not in [[seen]]:
            seen.add(neighbor)
            queue.[[append(neighbor)]]` },
  { title: 'Largest rectangle', skills: ['monotonic-stack'], code: `for i, h in enumerate(heights + [0]):
    start = [[i]]
    while stack and stack[-1][1] [[>]] h:
        index, height = stack.pop()
        result = max(result, height * [[(i - index)]])
        start = [[index]]
    stack.append((start, h))` },
].map((cloze, i) => ({ id: `${topicId}:cloze:${i + 1}`, ...cloze }))

const parsons = [
  { title: 'Reverse a linked list', skills: ['linked-list'], lines: ['prev, curr = None, head', 'while curr:', '    temp = curr.next', '    curr.next = prev', '    prev = curr', '    curr = temp', 'return prev'], distractors: ['    curr = curr.next', 'return curr'] },
  { title: 'Daily temperatures', skills: ['monotonic-stack'], lines: ['result = [0] * len(temperatures)', 'stack = []', 'for i, temp in enumerate(temperatures):', '    while stack and temp > temperatures[stack[-1]]:', '        index = stack.pop()', '        result[index] = i - index', '    stack.append(i)', 'return result'], distractors: ['    stack.append(temp)', '        result[i] = index - i'] },
  { title: 'Valid parentheses', skills: ['stack'], lines: ["pairs = {')': '(', ']': '[', '}': '{'}", 'stack = []', 'for char in s:', '    if char in pairs:', '        if not stack or stack[-1] != pairs[char]:', '            return False', '        stack.pop()', '    else:', '        stack.append(char)', 'return not stack'], distractors: ['return True'] },
  { title: 'Floyd cycle detection', skills: ['linked-list'], lines: ['slow = fast = head', 'while fast and fast.next:', '    slow = slow.next', '    fast = fast.next.next', '    if slow is fast:', '        return True', 'return False'], distractors: ['while fast.next.next:', '    fast = fast.next'] },
  { title: 'Remove nth from end', skills: ['linked-list'], lines: ['dummy = ListNode(0, head)', 'behind = ahead = dummy', 'for _ in range(n + 1):', '    ahead = ahead.next', 'while ahead:', '    ahead = ahead.next', '    behind = behind.next', 'behind.next = behind.next.next', 'return dummy.next'], distractors: ['for _ in range(n - 1):', 'return head'] },
  { title: 'Sliding window max', skills: ['queue-deque'], lines: ['result = []', 'window = deque()', 'for i in range(len(nums)):', '    while window and nums[window[-1]] < nums[i]:', '        window.pop()', '    window.append(i)', '    if window[0] <= i - k:', '        window.popleft()', '    if i >= k - 1:', '        result.append(nums[window[0]])', 'return result'], distractors: ['    window.append(nums[i])'] },
  { title: 'Merge two sorted lists', skills: ['linked-list'], lines: ['dummy = ListNode()', 'tail = dummy', 'while list1 and list2:', '    if list1.val < list2.val:', '        tail.next = list1', '        list1 = list1.next', '    else:', '        tail.next = list2', '        list2 = list2.next', '    tail = tail.next', 'tail.next = list1 or list2', 'return dummy.next'], distractors: ['return dummy'] },
  { title: 'Eval RPN', skills: ['stack'], lines: ['stack = []', 'for token in tokens:', '    if token in ops:', '        second = stack.pop()', '        first = stack.pop()', '        stack.append(ops[token](first, second))', '    else:', '        stack.append(int(token))', 'return stack[0]'], distractors: ['        stack.append(ops[token](second, first))'] },
].map((parsons, i) => ({ id: `${topicId}:parsons:${i + 1}`, ...parsons }))

const problems = [
  {
    lc: 20, title: 'Valid Parentheses', difficulty: 'Easy', google: true, skills: ['stack'], pattern: 'Stack matching', ds: ['stack', 'hashmap'],
    constraints: '1 ≤ s.length ≤ 10^4', time: 'O(n)', space: 'O(n)',
    insight: 'Latest unmatched opener must close first: stack of openers.',
    signals: ['valid', 'brackets', 'closed in the correct order', 'nested'],
    narration: ['Only bracket chars? Empty string valid?', 'Nesting is LIFO, so a stack of openers.', 'Closer must match the top, else False.', 'Valid if the stack is empty at the end.', 'O(n) time, O(n) space.'],
    solution: validCode, traceId: `${topicId}:trace:valid-parentheses`,
    pitfalls: ['Closer on empty stack', 'Leftover openers', 'Odd length can return False early'],
  },
  {
    lc: 155, title: 'Min Stack', difficulty: 'Medium', google: true, skills: ['stack', 'ds-diagnosis'], pattern: 'Augmented stack', ds: ['stack'],
    constraints: 'up to 3·10^4 calls; pop/top/getMin on non-empty', time: 'O(1) per op', space: 'O(n)',
    insight: 'Store (val, min so far) so the min travels with the stack.',
    signals: ['constant time', 'retrieving the minimum', 'design'],
    narration: ['Calls always valid on non-empty stack?', 'Each entry stores val and the min beneath it.', 'Push computes min with the top\'s min.', 'Pop restores the old min for free.', 'All O(1), O(n) space.'],
    solution: minStackCode, traceId: `${topicId}:trace:min-stack`,
    pitfalls: ['min(self.stack) is O(n)', 'Duplicate minimums with a separate min stack'],
  },
  {
    lc: 150, title: 'Evaluate Reverse Polish Notation', difficulty: 'Medium', google: false, skills: ['stack'], pattern: 'Stack evaluation', ds: ['stack', 'hashmap'],
    constraints: '1 ≤ tokens.length ≤ 10^4', time: 'O(n)', space: 'O(n)',
    insight: 'Operands wait on a stack; an operator consumes the top two.',
    signals: ['reverse polish', 'postfix', 'evaluate', 'operators'],
    narration: ['Division truncates toward zero?', 'Push numbers; on operator pop two.', 'Second popped is the left operand.', 'Answer is the last value left.', 'O(n) time and space.'],
    solution: `class Solution:
    def evalRPN(self, tokens: List[str]) -> int:
        stack = []
        ops = {
            '+': lambda a, b: a + b,
            '-': lambda a, b: a - b,
            '*': lambda a, b: a * b,
            '/': lambda a, b: int(a / b),
        }

        for token in tokens:
            if token in ops:
                second = stack.pop()
                first = stack.pop()
                stack.append(ops[token](first, second))
            else:
                stack.append(int(token))

        return stack[0]`,
    pitfalls: ['Operand order for - and /', '// floors negatives; use int(a / b)'],
  },
  {
    lc: 739, title: 'Daily Temperatures', difficulty: 'Medium', google: true, skills: ['monotonic-stack'], pattern: 'Monotonic stack (decreasing)', ds: ['stack'],
    constraints: '1 ≤ n ≤ 10^5, 30 ≤ temp ≤ 100', time: 'O(n)', space: 'O(n)',
    insight: 'A warmer day answers every colder waiting day on top of the stack.',
    signals: ['how many days until', 'warmer', 'next greater', 'for each'],
    narration: ['n up to 10^5, so O(n²) is out.', 'Stack of waiting indices, temps decreasing.', 'Warmer day pops and sets i - index.', 'Leftovers stay 0.', 'Each index pushed/popped once: O(n).'],
    solution: dailyCode, traceId: `${topicId}:trace:daily-temperatures`,
    pitfalls: ['Equal temps are not warmer: use >', 'Store indices, not temps'],
  },
  {
    lc: 496, title: 'Next Greater Element I', difficulty: 'Easy', google: false, skills: ['monotonic-stack', 'arrays-hashing'], pattern: 'Monotonic stack + hashmap', ds: ['stack', 'hashmap'],
    constraints: '1 ≤ nums1.length ≤ nums2.length ≤ 1000, unique values', time: 'O(n + m)', space: 'O(m)',
    insight: 'Precompute next greater for every nums2 value, then look up.',
    signals: ['next greater element', 'to the right', 'subset'],
    narration: ['Values unique, so map value to answer.', 'Decreasing stack over nums2.', 'Bigger value pops and answers smaller ones.', 'Lookup each nums1 value, default -1.', 'O(n + m).'],
    solution: ngeCode, traceId: `${topicId}:trace:next-greater`,
  },
  {
    lc: 84, title: 'Largest Rectangle in Histogram', difficulty: 'Hard', google: true, skills: ['monotonic-stack'], pattern: 'Monotonic stack (increasing)', ds: ['stack'],
    constraints: '1 ≤ n ≤ 10^5, 0 ≤ h ≤ 10^4', time: 'O(n)', space: 'O(n)',
    insight: 'A bar ends when a shorter bar arrives; pop it and measure.',
    signals: ['largest rectangle', 'histogram', 'contiguous bars', 'next smaller'],
    narration: ['n 10^5, pairs are 10^10: need O(n).', 'Increasing stack of (start, height).', 'Shorter bar pops taller ones: width i - start.', 'Shorter bar inherits the earliest start.', 'Sentinel 0 flushes the rest. O(n).'],
    solution: histogramCode, traceId: `${topicId}:trace:largest-rectangle`,
    pitfalls: ['Forgetting leftover bars at the end', 'Not carrying start back'],
  },
  {
    lc: 239, title: 'Sliding Window Maximum', difficulty: 'Hard', google: true, skills: ['queue-deque', 'sliding-window'], pattern: 'Monotonic deque', ds: ['deque'],
    constraints: '1 ≤ k ≤ n ≤ 10^5', time: 'O(n)', space: 'O(k)',
    insight: 'Keep indices with decreasing values; front is the max.',
    signals: ['sliding window', 'maximum', 'size k', 'each window'],
    narration: ['n·k could be 10^10, so not brute force.', 'Deque of indices, values decreasing.', 'Pop smaller from the back on arrival.', 'Popleft when the front leaves the window.', 'Each index in/out once: O(n).'],
    solution: windowMaxCode, traceId: `${topicId}:trace:sliding-window-max`,
    pitfalls: ['Storing values loses expiry info', 'Only append results once i ≥ k - 1'],
  },
  {
    lc: 206, title: 'Reverse Linked List', difficulty: 'Easy', google: false, skills: ['linked-list'], pattern: 'prev / curr pointers', ds: ['linked list'],
    constraints: '0 ≤ n ≤ 5000', time: 'O(n)', space: 'O(1)',
    insight: 'Save next, flip the arrow, advance both pointers.',
    signals: ['reverse', 'in place', 'linked list'],
    narration: ['Empty list returns None.', 'prev starts None, curr at head.', 'Save next, flip, advance.', 'Return prev.', 'O(n) time, O(1) space.'],
    solution: reverseCode, traceId: `${topicId}:trace:reverse-list`,
  },
  {
    lc: 21, title: 'Merge Two Sorted Lists', difficulty: 'Easy', google: false, skills: ['linked-list'], pattern: 'Dummy + tail', ds: ['linked list'],
    constraints: '0 ≤ n, m ≤ 50', time: 'O(n + m)', space: 'O(1)',
    insight: 'Dummy head; always attach the smaller head.',
    signals: ['merge', 'sorted', 'splicing'],
    narration: ['Either list may be empty.', 'Dummy node avoids head special case.', 'Attach smaller, advance it.', 'Attach leftover in one link.', 'O(n + m), O(1) extra.'],
    solution: mergeCode, traceId: `${topicId}:trace:merge-two-lists`,
  },
  {
    lc: 141, title: 'Linked List Cycle', difficulty: 'Easy', google: false, skills: ['linked-list', 'two-pointers'], pattern: 'Fast / slow (Floyd)', ds: ['linked list'],
    constraints: '0 ≤ n ≤ 10^4', time: 'O(n)', space: 'O(1)',
    insight: 'Fast gains one node per step; inside a loop it must meet slow.',
    signals: ['cycle', 'O(1) memory', 'loop back'],
    narration: ['Can I use O(1) memory? Then Floyd.', 'slow +1, fast +2.', 'Meet means cycle.', 'fast hits None means no cycle.', 'O(n) time, O(1) space.'],
    solution: cycleCode, traceId: `${topicId}:trace:cycle-floyd`,
    pitfalls: ['A set of values breaks on duplicates', 'Recursion depth on long lists'],
  },
  {
    lc: 19, title: 'Remove Nth Node From End of List', difficulty: 'Medium', google: false, skills: ['linked-list', 'two-pointers'], pattern: 'Dummy + gap pointers', ds: ['linked list'],
    constraints: '1 ≤ n ≤ size ≤ 30', time: 'O(n)', space: 'O(1)',
    insight: 'Lead by n + 1 from a dummy; behind stops before the target.',
    signals: ['from the end', 'one pass', 'nth'],
    narration: ['n always valid?', 'Dummy handles removing the head.', 'ahead moves n + 1 first.', 'Move both until ahead is None.', 'Skip behind.next. O(n), O(1).'],
    solution: removeNthCode, traceId: `${topicId}:trace:remove-nth`,
  },
  {
    lc: 143, title: 'Reorder List', difficulty: 'Medium', google: false, skills: ['linked-list', 'two-pointers'], pattern: 'Middle + reverse + weave', ds: ['linked list'],
    constraints: '1 ≤ n ≤ 5·10^4', time: 'O(n)', space: 'O(1)',
    insight: 'Combine three tools: find middle, reverse half, merge alternating.',
    signals: ['L0 → Ln → L1', 'in place', 'reorder'],
    narration: ['Modify in place, return nothing.', 'Fast/slow to find middle, cut.', 'Reverse the second half.', 'Weave front and back.', 'O(n) time, O(1) space.'],
    solution: reorderCode, traceId: `${topicId}:trace:reorder-list`,
    pitfalls: ['Forgetting to cut creates a cycle'],
  },
  {
    lc: 25, title: 'Reverse Nodes in k-Group', difficulty: 'Hard', google: true, skills: ['linked-list'], pattern: 'Dummy + group reversal', ds: ['linked list'],
    constraints: '1 ≤ k ≤ n ≤ 5000', time: 'O(n)', space: 'O(1)',
    insight: 'Find the kth node, reverse the group onto groupNext, reconnect.',
    signals: ['k at a time', 'reverse', 'left-out nodes remain'],
    narration: ['Leftover < k nodes stay as is.', 'Dummy before head, groupPrev tracks join.', 'Walk k to find kth; stop if missing.', 'Reverse with prev starting at groupNext.', 'Reconnect, groupPrev = old first. O(n).'],
    solution: kGroupCode,
    pitfalls: ['prev must start at groupNext, not None', 'Save old first before reconnecting'],
  },
  {
    lc: 2, title: 'Add Two Numbers', difficulty: 'Medium', google: true, skills: ['linked-list', 'math'], pattern: 'Dummy + carry', ds: ['linked list'],
    constraints: '1 ≤ n, m ≤ 100, digits 0-9', time: 'O(max(n, m))', space: 'O(max(n, m))',
    insight: 'Digits are reversed, so add from the heads with a carry.',
    signals: ['reverse order', 'digits', 'sum as a linked list'],
    narration: ['Lengths can differ.', 'Dummy + tail, carry starts 0.', 'Loop while l1 or l2 or carry.', 'divmod(total, 10) splits carry and digit.', 'O(max(n, m)).'],
    solution: addTwoCode, traceId: `${topicId}:trace:add-two-numbers`,
    pitfalls: ['Final carry needs a node', 'Lists of different lengths'],
  },
].map(problem => ({ id: `${topicId}:problem:${problem.lc}`, ...problem }))

const seededRandom = seed => {
  let a = (seed >>> 0) || 1
  return () => {
    a = (a + 0x6D2B79F5) | 0
    let x = Math.imul(a ^ (a >>> 15), 1 | a)
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

const nextBy = (nums, better) => {
  const result = nums.map(() => -1)
  const stack = []
  nums.forEach((num, i) => {
    while (stack.length && better(num, nums[stack[stack.length - 1]])) result[stack.pop()] = num
    stack.push(i)
  })
  return result
}

const generators = [
  {
    id: `${topicId}:gen:next-greater`,
    title: 'Next greater, fast',
    skills: ['monotonic-stack'],
    make(seed) {
      const rand = seededRandom(seed)
      const kind = rand() < 0.5 ? 'greater' : 'smaller'
      const nums = Array.from({ length: 6 }, () => 1 + Math.floor(rand() * 9))
      const greater = nextBy(nums, (a, b) => a > b)
      const smaller = nextBy(nums, (a, b) => a < b)
      const greaterEq = nextBy(nums, (a, b) => a >= b)
      const correct = kind === 'greater' ? greater : smaller
      const fmt = arr => `[${arr.join(', ')}]`
      const pool = [fmt(correct), fmt(kind === 'greater' ? smaller : greater), fmt(greaterEq), fmt([...correct].reverse()), fmt(correct.map((v, i) => (i === nums.length - 1 ? v : nums[i + 1])))]
      const choices = []
      for (const option of pool) if (!choices.includes(option) && choices.length < 4) choices.push(option)
      let bump = 1
      while (choices.length < 4) {
        const option = fmt(correct.map((v, i) => (i === (bump - 1) % nums.length ? (v === -1 ? 9 + bump : -1) : v)))
        if (!choices.includes(option)) choices.push(option)
        bump++
      }
      for (let i = choices.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1))
        ;[choices[i], choices[j]] = [choices[j], choices[i]]
      }
      return {
        id: `${topicId}:gen:next-greater:${seed}`,
        skills: ['monotonic-stack'],
        difficulty: 2,
        q: `Next ${kind.toUpperCase()} element to the right for each of ${fmt(nums)}? (-1 if none)`,
        choices,
        answer: choices.indexOf(fmt(correct)),
        why: kind === 'greater' ? 'Decreasing stack: a bigger arrival answers smaller tops. Equal is not greater.' : 'Increasing stack: a smaller arrival answers bigger tops. Equal is not smaller.',
      }
    },
  },
]

export default {
  id: topicId,
  title: 'Stacks, Queues & Linked Lists',
  icon: 'layers',
  skills: ['stack', 'monotonic-stack', 'queue-deque', 'linked-list'],
  lessons,
  traces,
  flashcards,
  mcqs,
  clozes,
  parsons,
  problems,
  extras: { generators },
}
