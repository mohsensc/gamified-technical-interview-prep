const rotate = (choices, answer, shift) => {
  const n = choices.length
  const rotated = choices.map((_, j) => choices[(j + shift) % n])
  return { choices: rotated, answer: ((answer - shift) % n + n) % n }
}

const mcqRows = [
  ['stack', 1, 'Which structure evaluates a Reverse Polish Notation expression like "2 1 + 3 *"?', null, ['Queue', 'Stack', 'Heap', 'Trie'], 1, 'Operands push; an operator pops the two most recent and pushes the result.'],
  ['stack', 2, 'RPN tokens ["5","1","2","+","4","*","+"]. What does the stack hold right after "+"  (the first one)?', null, ['[5, 1, 2]', '[5, 3]', '[5, 1, 2, 3]', '[3, 5]'], 1, '1 and 2 pop, push 1+2=3, leaving [5, 3].'],
  ['stack', 2, 'Simplify Unix path "/a/./b/../../c": which op does ".." trigger on the stack?', null, ['push ".."', 'pop if the stack is non-empty', 'push the previous component twice', 'clear the whole stack'], 1, '".." means go up one directory: pop one component if any exist.'],
  ['stack', 1, 'Decode String: "3[a]2[bc]" uses a stack of what?', null, ['Just characters', '(previous string, repeat count) pairs', 'Only counts', 'Only letters, no counts'], 1, 'On "[" push the string built so far and the count; on "]" pop and repeat.'],
  ['stack', 2, 'Basic Calculator (with parens, no * /): why push onto the stack at "("?', null, ['Push the digit', 'Push the running result and sign so far, then reset them for the new scope', 'Push the operator only', 'Nothing is pushed'], 1, 'Each "(" starts a fresh sub-expression; its outer context must be saved to resume at ")".'],
  ['stack', 2, 'Asteroid Collision: asteroids move right (positive) or left (negative). A stack holds survivors moving right. New asteroid is negative and bigger than stack top. Result?', null, ['Push it, no collision', 'Pop the top, keep comparing against the new top', 'Both explode immediately', 'Ignore the new asteroid'], 1, 'Bigger left-mover destroys smaller right-movers; keep popping until it is beaten or the stack empties.'],
  ['stack', 2, 'Asteroid Collision: equal-size collision (one left, one right) result?', null, ['Both survive', 'Both explode', 'Only the left-mover survives', 'Only the right-mover survives'], 1, 'Equal magnitudes cancel each other out.'],
  ['stack', 1, 'Checking `if stack:` before `stack.pop()` guards against what?', null, ['A TypeError', 'IndexError on an empty stack', 'A slow pop', 'Nothing, pop is always safe'], 1, 'Popping an empty list raises IndexError.'],
  ['stack', 2, 'Bug spotting: `stack.pop(0)` used throughout a "stack" solution. Problem?', null, ['No problem, still LIFO', "It pops the front: that's a queue, and it's O(n) per call", 'It raises an error', 'It mutates the wrong list'], 1, 'index 0 removal shifts the rest: wrong order and O(n), not O(1).'],
  ['stack', 2, 'Implementing DFS iteratively (no recursion) on a tree/graph uses what in place of the call stack?', null, ['A queue', 'An explicit stack', 'A heap', 'Two pointers'], 1, 'An explicit stack mimics the recursion call stack, LIFO order.'],
  ['stack', 2, 'Code output: stack=[]; for x in [1,2,3,2,1]: if stack and stack[-1]==x: stack.pop() else: stack.append(x). Final stack?', `stack = []
for x in [1, 2, 3, 2, 1]:
    if stack and stack[-1] == x:
        stack.pop()
    else:
        stack.append(x)`, ['[1, 2, 3, 2, 1]', '[1, 2, 3]', '[3]', '[]'], 0, '1,2,3 push. Then 2 matches top(3)? No, 3!=2 so push 2 -> [1,2,3,2]; then 1 vs top 2, no match, push 1 -> [1,2,3,2,1]. Top never equals the incoming value here, nothing ever pops.'],
  ['stack', 2, 'Which Python idiom peeks the top of a stack without removing it?', null, ['stack.pop(0)', 'stack[-1]', 'stack[0]', 'stack.top()'], 1, 'Lists have no .top(); the last element is stack[-1].'],
  ['stack', 1, 'Score of Parentheses-style problems (nesting doubles a value) need what per stack frame?', null, ['Just a character', "The running score accumulated in the current nesting level", 'The index only', 'Nothing, a counter suffices'], 1, 'Push the current level score before descending, pop and combine with `2 *` when closing a level.'],
  ['stack', 2, 'Why is a stack, not a queue, correct for matching HTML/XML tags?', null, ['Tags close in the same order they opened (FIFO)', 'The most recently opened tag must close first (LIFO)', 'Order does not matter', 'Queues are faster'], 1, 'Nesting is inherently LIFO: `<a><b></b></a>` closes b before a.'],
]

const mcqs = mcqRows.map(([skill, difficulty, q, code, choices, answer, why], i) => {
  const shift = (i * 2 + 1) % choices.length
  return { id: `bank-structures:mcq:stack:${i + 1}`, skills: [skill], difficulty, q, ...(code ? { code } : {}), ...rotate(choices, answer, shift), why }
})

const monoRows = [
  ['monotonic-stack', 2, 'Next Greater Element II (circular array): standard trick?', null, ['Sort the array first', 'Iterate indices 0..2n-1 using i % n, push only on the first pass', 'Use a heap of (value, index)', 'Reverse the array and run next-smaller'], 1, 'A second virtual lap lets elements near the end see wrap-around neighbors.'],
  ['monotonic-stack', 2, '132 Pattern (find i<j<k with nums[i]<nums[k]<nums[j]): scanning right to left, the stack tracks what?', null, ['The smallest value seen so far', 'Candidates for nums[k], keeping the largest popped value as a running threshold', 'All values in sorted order', 'Only even-indexed values'], 1, 'Popping smaller stack tops while scanning right-to-left records the best possible "k" value below the current "j" candidate.'],
  ['monotonic-stack', 3, 'Remove K Digits (remove k digits to make the smallest possible number): the stack should stay…', null, ['Strictly decreasing', 'Non-decreasing, popping larger digits while removals remain', 'Sorted descending', 'Unchanged, just append all digits'], 1, 'A bigger digit before a smaller one should be dropped first to shrink the number, as long as k allows it.'],
  ['monotonic-stack', 2, 'Sum of Subarray Minimums: why does each element need its "previous less" and "next less or equal" index?', null, ['To sort the array', 'To count exactly how many subarrays have it as the minimum, without enumerating subarrays', 'To detect duplicates', 'To reverse the array'], 1, 'An element is the min of (i - prevLess) * (nextLess - i) subarrays; a monotonic stack finds both boundaries in O(n).'],
  ['monotonic-stack', 2, 'Online Stock Span (days with price <= today, consecutively before today): what does the stack store?', null, ['Every price ever seen', '(price, span) pairs, popping while price >= top price', 'Only today\'s price', 'A sorted list of prices'], 1, 'Popping all days whose price is beaten merges their spans into today\'s span.'],
  ['monotonic-stack', 1, 'For "next greater element", bottom-to-top the stack values are…', null, ['Increasing', 'Decreasing (strictly, or non-increasing)', 'Unsorted', 'Always empty'], 1, 'Anything smaller than an arriving value already popped, so what remains only decreases.'],
  ['monotonic-stack', 2, 'nums = [2, 1, 2, 4, 3]. Next greater element of index 1 (value 1)?', `nums = [2, 1, 2, 4, 3]`, ['2', '4', '3', '-1'], 0, 'Scanning forward from index 1, the first greater value is 2 at index 2.'],
  ['monotonic-stack', 2, 'Bug spotting: `while stack and nums[stack[-1]] <= nums[i]:` for "next STRICTLY greater element". Problem?', `while stack and nums[stack[-1]] <= nums[i]:
    nextGreater[stack.pop()] = nums[i]
stack.append(i)`, ['No bug', 'Equal values incorrectly count as "greater", so duplicates get a wrong answer', 'It never pops anything', 'It is O(n^2)'], 1, '<= pops on equality too, so an equal element would wrongly be reported as the next greater.'],
  ['monotonic-stack', 3, 'Maximal Rectangle in a binary matrix (all 1s): how does it reduce to Largest Rectangle in Histogram?', null, ['Only works for square matrices', "Run largest-rectangle on each row's column-height histogram, updated as you go down", 'Sort every row', 'Use union-find per column'], 1, 'Treat each row as the histogram base, accumulating consecutive 1s per column from the rows above.'],
  ['monotonic-stack', 1, 'Why keep amortized O(n) despite a while loop nested in a for loop?', `for i in range(len(nums)):
    while stack and nums[stack[-1]] < nums[i]:
        stack.pop()
    stack.append(i)`, ['It is actually O(n^2)', 'Each index is pushed exactly once and popped at most once, so total work is 2n', 'The while loop never runs', 'Python optimizes it automatically'], 1, 'Total pushes = n, total pops <= n: the nested loop still sums to O(n).'],
  ['monotonic-stack', 2, 'Trapping Rain Water via monotonic stack (instead of two pointers): what triggers computing trapped water?', null, ['Every single step', 'Popping a bar because a taller bar arrives, using the popped bar as the basin floor', 'Only at the last index', 'Sorting the heights first'], 1, 'The popped bar is lower than both its new left and right neighbor, forming a basin.'],
  ['monotonic-stack', 3, 'Remove Duplicate Letters (smallest result, each letter exactly once, keep relative order): besides a decreasing stack, what extra bookkeeping is required?', null, ['Nothing else', "Last-occurrence index of each letter, to know if a popped letter still appears later", 'Sorting by frequency', 'A visited set of indices only'], 1, 'You may only pop a letter off the stack if it reappears later in the string.'],
  ['monotonic-stack', 2, 'Previous Smaller Element (for every index, nearest smaller value to its left): stack direction while scanning left to right?', null, ['Pop while top >= current, then the new top (if any) is the answer', 'Pop while top <= current', 'Never pop', 'Pop everything every step'], 0, 'Only strictly smaller values can answer "previous smaller"; equal/larger tops are useless and get discarded.'],
  ['monotonic-stack', 2, 'Space complexity of a monotonic stack over n elements?', null, ['O(1)', 'O(n) worst case', 'O(log n)', 'O(n^2)'], 1, 'A strictly increasing (or decreasing) input keeps every element on the stack.'],
]

const monoMcqs = monoRows.map(([skill, difficulty, q, code, choices, answer, why], i) => {
  const shift = (i * 2 + 1) % choices.length
  return { id: `bank-structures:mcq:monostack:${i + 1}`, skills: [skill], difficulty, q, ...(code ? { code } : {}), ...rotate(choices, answer, shift), why }
})

const queueRows = [
  ['queue-deque', 1, 'BFS needs O(1) pops from the front. The right Python container?', null, ['list', 'collections.deque', 'heapq', 'set'], 1, 'deque.popleft() is O(1); list.pop(0) is O(n).'],
  ['queue-deque', 2, 'Moving Average from Data Stream (window size k): best structure for the window?', null, ['A sorted list', 'deque(maxlen=k): auto-evicts the oldest value when full', 'A set', 'A heap of size k'], 1, 'deque(maxlen=k) drops the oldest element automatically on append.'],
  ['queue-deque', 2, 'Number of Recent Calls (count requests in the last 3000ms): structure and why?', null, ['A stack, pop expired calls', 'A queue of timestamps, popleft while the front is too old', 'A heap keyed by -timestamp', 'A set of timestamps'], 1, 'Timestamps arrive in increasing order, so expired ones are always at the front: FIFO expiry.'],
  ['queue-deque', 2, 'Implement a queue using two stacks. Amortized cost of dequeue?', null, ['O(n) every call', 'O(1) amortized: each element moves inbox -> outbox exactly once', 'O(log n)', 'O(1) worst case, always'], 1, 'A single element may be shifted once, but that cost is spread over many future O(1) dequeues.'],
  ['queue-deque', 2, 'Implement a stack using a single queue: how do you make push(x) behave LIFO?', null, ['You cannot, it is impossible', 'Push x, then rotate the queue (dequeue and re-enqueue) size-1 times so x ends up at the front', 'Reverse the whole queue every pop', 'Use two queues always'], 1, 'Rotating right after each push keeps the newest element at the front, giving LIFO pop/peek.'],
  ['queue-deque', 1, 'deque.rotate(1) does what?', null, ['Reverses the deque', 'Moves the last element to the front (right rotation)', 'Sorts the deque', 'Removes the first element'], 1, 'Positive rotate(n) shifts elements from the right end to the left end.'],
  ['queue-deque', 2, '0-1 BFS (edge weights only 0 or 1): why use a deque instead of a plain queue?', null, ['No real reason, same thing', 'Push 0-weight edges to the front and 1-weight edges to the back, keeping distances processed in order without a heap', 'deque is required for any BFS', 'It avoids visited tracking'], 1, 'This keeps the deque acting like a priority queue restricted to two distance buckets, in O(V+E).'],
  ['queue-deque', 2, 'Design Circular Queue backed by a fixed array: what fields track state besides the array?', null, ['Just a size variable', 'head index, count (or tail index), and capacity', 'Nothing else is needed', 'A separate stack'], 1, 'head and a count (or tail) let enqueue/dequeue wrap around the array in O(1) without shifting.'],
  ['queue-deque', 2, 'Design Hit Counter (hits in the last 300 seconds): why a queue of timestamps works well?', null, ['Timestamps must be sorted manually each call', 'Timestamps arrive non-decreasing, so expired ones are always at the front: popleft until within range', 'A heap is strictly required', 'Only a set works'], 1, 'Monotonic arrival order means a simple FIFO queue handles expiry in amortized O(1) per call.'],
  ['queue-deque', 1, 'Walls and Gates / multi-source BFS: how do you seed the queue?', null, ['With only the single nearest gate', 'With every gate cell at once, all at distance 0', 'Empty, then add gates lazily', 'With every wall cell'], 1, 'Enqueuing all sources together makes BFS expand the true shortest distance from the nearest gate to each cell.'],
  ['queue-deque', 2, 'Sliding Window Maximum with a monotonic deque: what triggers popping from the FRONT?', null, ['A larger value just arrived', 'The front index has slid outside the current window, i - k >= window[0]', 'The deque is empty', 'Every single step, unconditionally'], 1, 'Front values expire by position, independent of their value.'],
  ['queue-deque', 2, 'Which deque operation costs O(n), not O(1)?', null, ['appendleft(x)', 'popleft()', 'dq[len(dq)//2] (middle index access)', 'append(x)'], 2, 'A deque is a doubly linked list of blocks; both ends are O(1) but the middle is not directly indexable in O(1).'],
  ['queue-deque', 2, 'First Unique Character in a stream of characters: why pair a deque with a count map?', null, ['The deque alone sorts the characters', 'Candidates for "unique so far" live in the deque; the count map tells you when to pop stale (now-duplicated) ones from the front', 'Only the count map is needed', 'Order does not matter here'], 1, 'Once a front candidate\'s count exceeds 1 it is popped, so the true front is always the current unique answer.'],
]

const queueMcqs = queueRows.map(([skill, difficulty, q, code, choices, answer, why], i) => {
  const shift = (i * 2 + 1) % choices.length
  return { id: `bank-structures:mcq:queue:${i + 1}`, skills: [skill], difficulty, q, ...(code ? { code } : {}), ...rotate(choices, answer, shift), why }
})

const clozes = [
  { id: 'bank-structures:cloze:stack:1', skills: ['stack'], title: 'Decode String', code: `def decodeString(s: str) -> str:
    stack = []
    current, num = '', 0

    for char in s:
        if char.isdigit():
            num = num * 10 + int(char)
        elif char == '[':
            stack.[[append]]((current, num))
            current, num = '', 0
        elif char == ']':
            prevString, count = stack.[[pop]]()
            current = prevString + current [[*]] count
        else:
            current += char

    return current` },
  { id: 'bank-structures:cloze:stack:2', skills: ['stack'], title: 'Simplify path', code: `def simplifyPath(path: str) -> str:
    stack = []

    for part in path.split('/'):
        if part == '' or part == '.':
            continue
        elif part == '..':
            if [[stack]]:
                stack.pop()
        else:
            stack.[[append]](part)

    return '/' + '/'.[[join]](stack)` },
  { id: 'bank-structures:cloze:stack:3', skills: ['stack'], title: 'Asteroid Collision', code: `def asteroidCollision(asteroids):
    stack = []

    for a in asteroids:
        alive = True
        while alive and a < 0 and stack and stack[-1] > 0:
            if stack[-1] < -a:
                stack.[[pop]]()
            elif stack[-1] == -a:
                stack.pop()
                alive = [[False]]
            else:
                alive = False
        if alive:
            stack.append([[a]])

    return stack` },
  { id: 'bank-structures:cloze:stack:4', skills: ['stack'], title: 'Min Stack get min', code: `class MinStack:
    def __init__(self):
        self.stack = [[[]]]

    def push(self, val: int) -> None:
        minVal = min(val, self.stack[-1][1]) if self.stack else val
        self.stack.append((val, [[minVal]]))

    def pop(self) -> None:
        self.stack.[[pop]]()

    def getMin(self) -> int:
        return [[self.stack[-1][1]]]` },
  { id: 'bank-structures:cloze:stack:5', skills: ['stack'], title: 'Valid parentheses, final check', code: `pairs = {')': '(', ']': '[', '}': '{'}
stack = []

for char in s:
    if char in pairs:
        if not stack or stack[-1] != pairs[char]:
            return [[False]]
        stack.pop()
    else:
        stack.append(char)

return [[not stack]]` },
  { id: 'bank-structures:cloze:monostack:1', skills: ['monotonic-stack'], title: 'Next Greater Element II (circular)', code: `def nextGreaterElements(nums):
    n = len(nums)
    result = [-1] * n
    stack = []

    for i in range(2 * n):
        while stack and nums[stack[-1]] < nums[i [[%]] n]:
            result[stack.pop()] = nums[i % n]
        if i < [[n]]:
            stack.append(i)

    return result` },
  { id: 'bank-structures:cloze:monostack:2', skills: ['monotonic-stack'], title: 'Online Stock Span', code: `class StockSpanner:
    def __init__(self):
        self.stack = []

    def next(self, price: int) -> int:
        span = 1
        while self.stack and self.stack[-1][0] [[<=]] price:
            span += [[self.stack.pop()[1]]]
        self.stack.append((price, span))
        return [[span]]` },
  { id: 'bank-structures:cloze:monostack:3', skills: ['monotonic-stack'], title: 'Daily Temperatures distances', code: `result = [0] * len(temperatures)
stack = []

for i, temp in enumerate(temperatures):
    while stack and temp [[>]] temperatures[stack[-1]]:
        index = stack.[[pop]]()
        result[index] = [[i - index]]
    stack.append(i)` },
  { id: 'bank-structures:cloze:monostack:4', skills: ['monotonic-stack'], title: 'Previous smaller element', code: `def previousSmaller(nums):
    result = [-1] * len(nums)
    stack = []

    for i, num in enumerate(nums):
        while stack and nums[stack[-1]] [[>=]] num:
            stack.pop()
        if stack:
            result[i] = [[nums[stack[-1]]]]
        stack.[[append]](i)

    return result` },
  { id: 'bank-structures:cloze:queue:1', skills: ['queue-deque'], title: 'Moving average with deque(maxlen)', code: `from collections import deque

class MovingAverage:
    def __init__(self, size: int):
        self.window = deque(maxlen=[[size]])

    def next(self, val: int) -> float:
        self.window.append(val)
        return sum(self.window) / [[len]](self.window)` },
  { id: 'bank-structures:cloze:queue:2', skills: ['queue-deque'], title: 'Number of Recent Calls', code: `from collections import deque

class RecentCounter:
    def __init__(self):
        self.calls = deque()

    def ping(self, t: int) -> int:
        self.calls.[[append]](t)
        while self.calls[0] [[<]] t - 3000:
            self.calls.popleft()
        return [[len]](self.calls)` },
  { id: 'bank-structures:cloze:queue:3', skills: ['queue-deque'], title: 'Sliding Window Maximum, popping stale front', code: `window = deque()
result = []

for i, num in enumerate(nums):
    while window and nums[window[-1]] [[<]] num:
        window.pop()
    window.append(i)

    if window[0] <= i - [[k]]:
        window.[[popleft]]()

    if i >= k - 1:
        result.append(nums[window[0]])` },
  { id: 'bank-structures:cloze:queue:4', skills: ['queue-deque'], title: 'Queue via two stacks', code: `class MyQueue:
    def __init__(self):
        self.inbox, self.outbox = [], []

    def push(self, x: int) -> None:
        self.inbox.[[append]](x)

    def pop(self) -> int:
        self.moveIfNeeded()
        return self.outbox.[[pop]]()

    def moveIfNeeded(self):
        if not [[self.outbox]]:
            while self.inbox:
                self.outbox.append(self.inbox.[[pop]]())` },
]

const parsons = [
  { id: 'bank-structures:parsons:stack:1', skills: ['stack'], title: 'Decode String (recover final string)', lines: [
    "stack = []",
    "current, num = '', 0",
    "for char in s:",
    "    if char.isdigit():",
    "        num = num * 10 + int(char)",
    "    elif char == '[':",
    "        stack.append((current, num))",
    "        current, num = '', 0",
    "    elif char == ']':",
    "        prevString, count = stack.pop()",
    "        current = prevString + current * count",
    "    else:",
    "        current += char",
    "return current",
  ], distractors: ["        current = current * count + prevString", "num = int(char) * 10 + num"] },
  { id: 'bank-structures:parsons:stack:2', skills: ['stack'], title: 'Simplify Path', lines: [
    "stack = []",
    "for part in path.split('/'):",
    "    if part == '' or part == '.':",
    "        continue",
    "    elif part == '..':",
    "        if stack:",
    "            stack.pop()",
    "    else:",
    "        stack.append(part)",
    "return '/' + '/'.join(stack)",
  ], distractors: ["        stack.append('..')", "return '/'.join(stack) + '/'"] },
  { id: 'bank-structures:parsons:stack:3', skills: ['stack'], title: 'Asteroid Collision', lines: [
    "stack = []",
    "for a in asteroids:",
    "    alive = True",
    "    while alive and a < 0 and stack and stack[-1] > 0:",
    "        if stack[-1] < -a:",
    "            stack.pop()",
    "        elif stack[-1] == -a:",
    "            stack.pop()",
    "            alive = False",
    "        else:",
    "            alive = False",
    "    if alive:",
    "        stack.append(a)",
    "return stack",
  ], distractors: ["        stack.append(-a)"] },
  { id: 'bank-structures:parsons:monostack:1', skills: ['monotonic-stack'], title: 'Online Stock Span', lines: [
    "stack = []",
    "def next(price):",
    "    span = 1",
    "    while stack and stack[-1][0] <= price:",
    "        span += stack.pop()[1]",
    "    stack.append((price, span))",
    "    return span",
  ], distractors: ["    while stack and stack[-1][0] < price:"] },
  { id: 'bank-structures:parsons:monostack:2', skills: ['monotonic-stack'], title: 'Next Greater Element II', lines: [
    "n = len(nums)",
    "result = [-1] * n",
    "stack = []",
    "for i in range(2 * n):",
    "    while stack and nums[stack[-1]] < nums[i % n]:",
    "        result[stack.pop()] = nums[i % n]",
    "    if i < n:",
    "        stack.append(i)",
    "return result",
  ], distractors: ["    stack.append(i % n)"] },
  { id: 'bank-structures:parsons:monostack:3', skills: ['monotonic-stack'], title: 'Previous Smaller Element', lines: [
    "result = [-1] * len(nums)",
    "stack = []",
    "for i, num in enumerate(nums):",
    "    while stack and nums[stack[-1]] >= num:",
    "        stack.pop()",
    "    if stack:",
    "        result[i] = nums[stack[-1]]",
    "    stack.append(i)",
    "return result",
  ], distractors: ["    while stack and nums[stack[-1]] <= num:"] },
  { id: 'bank-structures:parsons:queue:1', skills: ['queue-deque'], title: 'Number of Recent Calls', lines: [
    "self.calls.append(t)",
    "while self.calls[0] < t - 3000:",
    "    self.calls.popleft()",
    "return len(self.calls)",
  ], distractors: ["while self.calls[-1] < t - 3000:"] },
  { id: 'bank-structures:parsons:queue:2', skills: ['queue-deque'], title: 'Sliding Window Maximum', lines: [
    "window = deque()",
    "result = []",
    "for i, num in enumerate(nums):",
    "    while window and nums[window[-1]] < num:",
    "        window.pop()",
    "    window.append(i)",
    "    if window[0] <= i - k:",
    "        window.popleft()",
    "    if i >= k - 1:",
    "        result.append(nums[window[0]])",
  ], distractors: ["    if window[0] < i - k:"] },
  { id: 'bank-structures:parsons:queue:3', skills: ['queue-deque'], title: 'Queue using two stacks', lines: [
    "def push(self, x):",
    "    self.inbox.append(x)",
    "def pop(self):",
    "    self.moveIfNeeded()",
    "    return self.outbox.pop()",
    "def moveIfNeeded(self):",
    "    if not self.outbox:",
    "        while self.inbox:",
    "            self.outbox.append(self.inbox.pop())",
  ], distractors: ["    if not self.inbox:"] },
]

const cardData = [
  ['stack', 'Signals that mean "stack"', 'Nesting, matching pairs, most-recent-first, undo history, parsing expressions, iterative DFS.'],
  ['stack', 'Why RPN evaluation needs a stack', 'Operators act on the two most recently seen operands: last in, first used.'],
  ['stack', 'Decode String stack entries', 'Push (stringSoFar, repeatCount) at "[". On "]", pop and build prevString + current * count.'],
  ['stack', 'Simplify Path: "." and ".."', '"." means stay; skip it. ".." means go up: pop the stack if non-empty.'],
  ['stack', 'Asteroid Collision rule', 'Collision only when a right-mover (positive) is followed by a left-mover (negative). Bigger survives, equal cancels both.'],
  ['stack', 'Basic Calculator with parens', 'On "(" push (result, sign); on ")" pop and combine. Each paren level gets a fresh running total.'],
  ['stack', 'Iterative DFS without recursion', 'Push the start node; pop, visit, push unvisited neighbors. Mirrors the call stack explicitly.'],
  ['stack', 'Cost of stack.append / stack.pop / stack[-1]', 'All O(1): Python lists are arrays with O(1) end operations.'],
  ['stack', 'Why list.pop(0) ruins a "stack" solution', "That's queue (FIFO) behavior, and it's O(n): every remaining item shifts left."],
  ['monotonic-stack', 'Next greater element: stack shape', 'Decreasing bottom to top. An arriving bigger value pops and answers every smaller top.'],
  ['monotonic-stack', 'Next smaller element: stack shape', 'Increasing bottom to top. An arriving smaller value pops and answers every bigger top.'],
  ['monotonic-stack', 'Next Greater Element II (circular)', 'Loop i over 2n using nums[i % n]; only push indices during the first lap (i < n).'],
  ['monotonic-stack', 'Online Stock Span idea', 'Pop (price, span) pairs while stored price <= today; sum their spans plus 1 for today.'],
  ['monotonic-stack', 'Sum of Subarray Minimums idea', "Each element is the minimum of (i - prevLess) * (nextLessOrEqual - i) subarrays; find those bounds with a monotonic stack."],
  ['monotonic-stack', 'Remove K Digits idea', 'Keep the result non-decreasing: pop a larger digit before a smaller new one, as long as removals remain.'],
  ['monotonic-stack', 'Why the amortized bound holds', 'Every index is pushed exactly once and popped at most once, so total stack operations are O(n) even with a nested while.'],
  ['monotonic-stack', '132 Pattern scan direction', 'Right to left; the popped maximum becomes a running "third value" threshold candidate.'],
  ['monotonic-stack', 'Remove Duplicate Letters extra bookkeeping', 'Track the last index of every character so you know whether a popped letter still appears again later.'],
  ['queue-deque', 'Why BFS needs deque, not list', 'list.pop(0) is O(n) per call; a BFS over n nodes becomes O(n^2). deque.popleft() is O(1).'],
  ['queue-deque', 'deque(maxlen=k)', 'Appending past capacity silently drops the oldest element from the other end.'],
  ['queue-deque', 'Number of Recent Calls structure', 'A FIFO queue of timestamps: since calls arrive non-decreasing, expired ones are always at the front.'],
  ['queue-deque', 'Queue via two stacks, amortized cost', 'Each element is moved inbox -> outbox exactly once over its lifetime, so dequeue is O(1) amortized.'],
  ['queue-deque', 'Stack via one queue, push trick', 'Enqueue the new item, then rotate the queue size-1 times so the new item ends up at the front.'],
  ['queue-deque', '0-1 BFS with a deque', 'Push 0-weight edges to the front, 1-weight edges to the back: keeps the deque acting like a 2-bucket priority queue.'],
  ['queue-deque', 'Multi-source BFS seeding', 'Enqueue every source (e.g. every gate) at distance 0 before the first pop; distances come out correct for all of them at once.'],
  ['queue-deque', 'deque middle-index cost', 'dq[len(dq)//2] is O(n): only the two ends are O(1).',],
  ['queue-deque', 'Design Circular Queue state', 'Fixed array plus head index and a count (or tail index), so enqueue/dequeue wrap in O(1) without shifting.'],
]

const flashcards = cardData.map(([skill, front, back, code], i) => ({ id: `bank-structures:card:stacks-queues:${i + 1}`, skills: [skill], front, back, ...(code ? { code } : {}) }))

export default {
  mcqs: [...mcqs, ...monoMcqs, ...queueMcqs],
  clozes,
  parsons,
  flashcards,
}
