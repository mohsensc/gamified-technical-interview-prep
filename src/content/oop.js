const topicId = 'oop'

const unwrap = input => (input && typeof input === 'object' && !Array.isArray(input) && 'value' in input && 'label' in input) ? input.value : input

const lineFinder = code => {
  const lines = code.split('\n')
  return (text, nth = 1) => {
    let seen = 0
    for (let i = 0; i < lines.length; i++) if (lines[i].includes(text) && ++seen === nth) return i + 1
    throw new Error(`line not found: ${text} (nth ${nth})`)
  }
}

const topIndex = stack => stack.length ? [stack.length - 1] : []

const heapPush = (heap, val) => {
  heap.push(val)
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
      const l = 2 * i + 1
      const r = 2 * i + 2
      let m = i
      if (l < heap.length && heap[l] < heap[m]) m = l
      if (r < heap.length && heap[r] < heap[m]) m = r
      if (m === i) break
      ;[heap[i], heap[m]] = [heap[m], heap[i]]
      i = m
    }
  }
  return top
}

const heapifyArr = arr => {
  for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) {
    let j = i
    while (true) {
      const l = 2 * j + 1
      const r = 2 * j + 2
      let m = j
      if (l < arr.length && arr[l] < arr[m]) m = l
      if (r < arr.length && arr[r] < arr[m]) m = r
      if (m === j) break
      ;[arr[j], arr[m]] = [arr[m], arr[j]]
      j = m
    }
  }
}

const lruCode = `class Node:
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
            del self.cache[lru.key]`

const orderedDictLruCode = `from collections import OrderedDict

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
            self.cache.popitem(last=False)`

const lfuCode = `from collections import defaultdict as dd, OrderedDict

class LFUCache:

    def __init__(self, capacity: int):
        self.cap = capacity
        self.minFreq = 0
        self.keyToVal = {}
        self.keyToFreq = {}
        self.freqToKeys = dd(OrderedDict)

    def bump(self, key: int):
        freq = self.keyToFreq[key]
        del self.freqToKeys[freq][key]
        if not self.freqToKeys[freq] and freq == self.minFreq:
            self.minFreq += 1

        self.keyToFreq[key] = freq + 1
        self.freqToKeys[freq + 1][key] = None

    def get(self, key: int) -> int:
        if key not in self.keyToVal:
            return -1

        self.bump(key)
        return self.keyToVal[key]

    def put(self, key: int, value: int) -> None:
        if self.cap == 0:
            return

        if key in self.keyToVal:
            self.keyToVal[key] = value
            self.bump(key)
            return

        if len(self.keyToVal) >= self.cap:
            evict, _ = self.freqToKeys[self.minFreq].popitem(last=False)
            del self.keyToVal[evict]
            del self.keyToFreq[evict]

        self.keyToVal[key] = value
        self.keyToFreq[key] = 1
        self.freqToKeys[1][key] = None
        self.minFreq = 1`

const medianCode = `import heapq

class MedianFinder:

    def __init__(self):
        self.small, self.large = [], []

    def addNum(self, num: int) -> None:
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

    def findMedian(self) -> float:
        if len(self.small) > len(self.large):
            return -self.small[0]

        return (-self.small[0] + self.large[0]) / 2`

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

const kthLargestCode = `import heapq

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

        return self.heap[0]`

const timeMapCode = `from collections import defaultdict as dd
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

        return values[i - 1][1]`

const loggerCode = `class Logger:

    def __init__(self):
        self.lastPrinted = {}

    def shouldPrintMessage(self, timestamp: int, message: str) -> bool:
        if message not in self.lastPrinted or timestamp - self.lastPrinted[message] >= 10:
            self.lastPrinted[message] = timestamp
            return True

        return False`

const randomizedSetCode = `import random

class RandomizedSet:

    def __init__(self):
        self.values = []
        self.indices = {}

    def insert(self, val: int) -> bool:
        if val in self.indices:
            return False

        self.indices[val] = len(self.values)
        self.values.append(val)
        return True

    def remove(self, val: int) -> bool:
        if val not in self.indices:
            return False

        index = self.indices[val]
        last = self.values[-1]
        self.values[index] = last
        self.indices[last] = index

        self.values.pop()
        del self.indices[val]
        return True

    def getRandom(self) -> int:
        return random.choice(self.values)`

const prefixTreeCode = `class TrieNode:
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

        return True`

const wordDictionaryCode = `class TrieNode:
    def __init__(self):
        self.child = {}
        self.endOfWord = False

class WordDictionary:

    def __init__(self):
        self.root = TrieNode()

    def addWord(self, word: str) -> None:
        node = self.root

        for c in word:
            if c not in node.child:
                node.child[c] = TrieNode()
            node = node.child[c]

        node.endOfWord = True

    def search(self, word: str) -> bool:

        def dfs(j, node):
            for i in range(j, len(word)):
                c = word[i]
                if c != '.':
                    if c not in node.child:
                        return False
                    node = node.child[c]
                else:
                    for kid in node.child.values():
                        if dfs(i + 1, kid):
                            return True
                    return False

            return node.endOfWord

        return dfs(0, self.root)`

const browserHistoryCode = `class BrowserHistory:

    def __init__(self, homepage: str):
        self.history = [homepage]
        self.curr = 0

    def visit(self, url: str) -> None:
        self.history = self.history[:self.curr + 1]
        self.history.append(url)
        self.curr += 1

    def back(self, steps: int) -> str:
        self.curr = max(0, self.curr - steps)
        return self.history[self.curr]

    def forward(self, steps: int) -> str:
        self.curr = min(len(self.history) - 1, self.curr + steps)
        return self.history[self.curr]`

const queueViaStacksCode = `class MyQueue:

    def __init__(self):
        self.inbox = []
        self.outbox = []

    def push(self, x: int) -> None:
        self.inbox.append(x)

    def pop(self) -> int:
        self.moveIfNeeded()
        return self.outbox.pop()

    def peek(self) -> int:
        self.moveIfNeeded()
        return self.outbox[-1]

    def empty(self) -> bool:
        return not self.inbox and not self.outbox

    def moveIfNeeded(self):
        if not self.outbox:
            while self.inbox:
                self.outbox.append(self.inbox.pop())`

const twitterCode = `import heapq
from collections import defaultdict as dd

class Twitter:

    def __init__(self):
        self.time = 0
        self.tweets = dd(list)
        self.following = dd(set)

    def postTweet(self, userId: int, tweetId: int) -> None:
        self.tweets[userId].append((self.time, tweetId))
        self.time -= 1

    def getNewsFeed(self, userId: int) -> List[int]:
        heap = []

        for user in self.following[userId] | {userId}:
            if self.tweets[user]:
                index = len(self.tweets[user]) - 1
                time, tweetId = self.tweets[user][index]
                heapq.heappush(heap, (time, tweetId, user, index - 1))

        result = []
        while heap and len(result) < 10:
            time, tweetId, user, index = heapq.heappop(heap)
            result.append(tweetId)
            if index >= 0:
                nextTime, nextTweetId = self.tweets[user][index]
                heapq.heappush(heap, (nextTime, nextTweetId, user, index - 1))

        return result

    def follow(self, followerId: int, followeeId: int) -> None:
        if followerId != followeeId:
            self.following[followerId].add(followeeId)

    def unfollow(self, followerId: int, followeeId: int) -> None:
        self.following[followerId].discard(followeeId)`

const lessons = [
  {
    id: `${topicId}:lesson:classes-101`,
    title: 'Classes 101: self, __init__, methods',
    skills: ['ds-diagnosis', 'communication'],
    slides: [
      {
        title: 'Why a class at all',
        points: ['Design problems want ONE object holding state plus methods.', '==self== is "this instance." Every method takes it first.', 'Think: a struct with attached functions.'],
      },
      {
        title: '__init__ runs once',
        code: `class Counter:
    def __init__(self, start=0):
        self.count = start`,
        points: ['Counter(5) calls __init__ exactly once to build that instance.', '==self.count== is stored on THIS object, until something changes it.'],
      },
      {
        title: 'self.attr vs class attr: the shared-mutable trap',
        code: `class Bad:
    seen = []

    def add(self, x):
        self.seen.append(x)`,
        points: ['==seen== is a CLASS attribute: one list shared by every instance.', 'Two Bad() objects would corrupt each other\'s list.', 'Fix: self.seen = [] inside __init__.'],
        ask: {
          q: 'class Bad: seen = [] (as above). Two separate Bad() objects call add(1) and add(2). What do their .seen lists look like after?',
          choices: ['[1] and [2], separate', 'Both show [1, 2]', 'A TypeError', 'Both show []'],
          answer: 1,
          why: 'seen is a class attribute: one list shared by every instance, not per-object state.',
        },
      },
      {
        title: 'self.method() calls another method',
        code: `class Stack:
    def __init__(self):
        self.items = []

    def push(self, x):
        self.items.append(x)

    def pushTwice(self, x):
        self.push(x)
        self.push(x)`,
        points: ['A method can call another method on the same object via self.', 'This is how LRU\'s get() reuses remove() and insert() — no copy-paste.'],
      },
      {
        title: 'Say it out loud',
        points: ['"I\'ll keep state as self.* fields on the class."', '"This method mutates self; that one just reads it."', 'self.x matching a constructor param is normal.'],
      },
    ],
  },
  {
    id: `${topicId}:lesson:building-blocks`,
    title: 'Helper node classes',
    skills: ['linked-list', 'ds-diagnosis'],
    slides: [
      {
        title: 'A node is its own tiny class',
        code: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next`,
        points: ['One class, two fields. Build a chain by setting .next.'],
      },
      {
        title: 'Doubly linked: add prev',
        code: `class Node:
    def __init__(self, key=0, val=0):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None`,
        points: ['LRU unlinks from the MIDDLE in O(1): ==prev== makes that possible.', 'key lives ON the node so eviction can del the hashmap entry.'],
      },
      {
        title: 'Sentinel head/tail nodes',
        points: ['Two fake nodes, self.left and self.right, that are NEVER removed.', 'Every real node sits between them: no None-checks for "is this the first/last node?"'],
      },
      {
        title: '__repr__ and @dataclass',
        code: `class Node:
    def __repr__(self):
        return f'Node({self.key}:{self.val})'`,
        points: ['__repr__ makes print(node) readable instead of <Node object at 0x...>.', '@dataclass can auto-write __init__ for plain data holders — mention it, rarely needed live.'],
      },
      {
        title: 'Say it out loud',
        points: ['"I\'ll use two sentinel nodes so I never special-case an empty or single-node list."'],
      },
    ],
  },
  {
    id: `${topicId}:lesson:heaps-as-objects`,
    title: 'heapq: ordering & two heaps',
    skills: ['heap', 'ds-diagnosis'],
    slides: [
      {
        title: 'heapq is always a MIN-heap',
        points: ['heappush/heappop keep the smallest at heap[0].', 'Want a max-heap? Push the ==negative==: -num.'],
      },
      {
        title: 'Ordering by tuple',
        code: `heapq.heappush(heap, (time, tweetId, user))`,
        points: ['Tuples compare left to right. The FIRST field is the sort key.', 'A second unique field (id, index) breaks ties cleanly.'],
      },
      {
        title: '__lt__ for custom objects',
        code: `class Task:
    def __init__(self, priority, name):
        self.priority = priority
        self.name = name

    def __lt__(self, other):
        return self.priority < other.priority`,
        points: ['Pushing Task objects needs __lt__, or heapq cannot compare them.', 'Simpler fix: push plain tuples instead of custom objects.'],
      },
      {
        title: 'Two heaps = one running median',
        panels: [
          { kind: 'heap', label: 'self.small · max-heap (shown as real values)', items: [4, 2, 3] },
          { kind: 'heap', label: 'self.large · min-heap', items: [8, 10, 9] },
        ],
        points: ['Max-heap for the lower half, min-heap for the upper half.', 'The two tops ARE the median values.', 'Rebalance every insert: sizes differ by ≤ 1.'],
      },
      {
        title: 'Say it out loud',
        points: ['"I need both the max AND the min efficiently, so two heaps split the data in half."'],
      },
    ],
  },
  {
    id: `${topicId}:lesson:ordereddict-shortcut`,
    title: 'OrderedDict vs hand-built DLL',
    skills: ['linked-list', 'communication'],
    slides: [
      {
        title: 'The shortcut',
        code: orderedDictLruCode,
        points: ['move_to_end(key) and popitem(last=False) do exactly what your DLL does.', '~10 lines instead of ~35 — tempting to reach for immediately.'],
      },
      {
        title: 'Why interviewers still want the hand-built version',
        points: ['They are testing whether you can BUILD the O(1) structure, not just call one.', 'Say both: name OrderedDict, then build the DLL anyway.'],
      },
      {
        title: 'What OrderedDict hides',
        points: ['Underneath, it literally IS a hashmap + doubly linked list — the same idea, pre-written.', 'Knowing that mapping is the actual skill being tested.'],
      },
      {
        title: 'Say it out loud',
        points: ['"Python\'s OrderedDict gives me this for free, but let me build the mechanism by hand."'],
        ask: {
          q: 'Interviewer says "you may use any built-in you like." Best move for a design problem?',
          choices: ['Just call OrderedDict and move on', 'Mention OrderedDict exists, then build the DLL by hand to show the mechanism', 'Ignore the hint, build the DLL silently', 'Ask to skip to a different problem'],
          answer: 1,
          why: 'Naming the shortcut shows awareness; building it anyway proves you understand why it works.',
        },
      },
    ],
  },
  {
    id: `${topicId}:lesson:design-interview-flow`,
    title: 'Design problems: the flow',
    skills: ['communication', 'ds-diagnosis'],
    slides: [
      {
        title: '1. Clarify the API',
        points: ['List every method and its signature before writing a line of code.', '"get(key) returns -1 or the value, right? Does put always succeed?"'],
      },
      {
        title: '2. Pick a DS per operation',
        points: ['Write the TARGET complexity next to each method first.', 'get O(1), put O(1) → hashmap handles lookup; something else must handle order.'],
      },
      {
        title: '3. Class skeleton first',
        code: `class LRUCache:
    def __init__(self, capacity: int):
        ...

    def get(self, key: int) -> int:
        ...

    def put(self, key: int, value: int) -> None:
        ...`,
        points: ['Stub every method with ... before filling in any of them.', 'Decide the self.* fields here too — write them in __init__ first.'],
      },
      {
        title: '4. One method at a time',
        points: ['Fill __init__ first — the fields ARE the design.', 'Then the simplest method, then whichever depends on it.'],
      },
      {
        title: '5. State invariants out loud',
        points: ['"self.left.next is always the least recently used real node."', 'Saying the invariant catches bugs before you code them.'],
        ask: {
          q: 'You just wrote the class skeleton with every method stubbed. What should you fill in first?',
          choices: ['The hardest method, to get it over with', '__init__ and its self.* fields — they ARE the design', 'Whichever method is listed first', 'All methods at once'],
          answer: 1,
          why: 'Every method depends on the fields __init__ sets up; design those first.',
        },
      },
    ],
  },
  {
    id: `${topicId}:lesson:pitfalls`,
    title: 'self.* pitfalls that cost points',
    skills: ['ds-diagnosis', 'communication'],
    slides: [
      {
        title: 'Mutable default args',
        code: `def __init__(self, items=[]):
    self.items = items`,
        points: ['The default [] is created ONCE, shared across every call omitting the arg.', 'Fix: items=None, then build self.items fresh inside.'],
      },
      {
        title: 'Forgot to update BOTH sides',
        points: ['DLL removal needs prev.next AND next.prev updated, or the list corrupts.', 'Eviction needs the hashmap entry deleted too, or get() goes stale.'],
      },
      {
        title: 'self.x vs x: silent shadowing',
        code: `def put(self, key, value):
    cache = {}`,
        points: ['Forgetting self. makes a brand-new LOCAL dict — self.cache never changes.', 'No crash, just silently wrong behavior. Hard to spot under pressure.'],
      },
      {
        title: 'Calling the wrong self.method, or in the wrong order',
        points: ['remove() unlinks; insert() relinks. Insert before remove on an existing key double-links it.', 'Order matters: for an existing key, remove THEN insert.'],
        ask: {
          q: 'put() on an EXISTING key should...',
          choices: ['Just overwrite the value, skip reordering', 'Remove the old node, then re-insert it as the MRU', 'Insert a second node for the same key', 'Delete and rebuild the whole cache'],
          answer: 1,
          why: 'An update still counts as a use: it must become the most recently used.',
        },
      },
    ],
  },
]

const runLru = (input, t) => {
  const { capacity, ops } = unwrap(input)
  const L = lineFinder(lruCode)
  const cap = capacity
  const vals = new Map()
  let order = ['L', 'R']
  let returned = '—'
  let saidHit = false
  let saidIdentity = false
  let saidEvict = false
  const labelOf = id => id === 'L' ? 'left·sentinel' : id === 'R' ? 'right·sentinel' : `${id}:${vals.get(id)}`
  const dllPanel = (hl = []) => ({
    kind: 'linkedlist', label: 'self.left ⇄ ... ⇄ self.right',
    nodes: order.map((id, i) => ({ id, val: labelOf(id), next: i < order.length - 1 ? order[i + 1] : null })),
    pointers: { left: 'L', right: 'R' },
    highlight: hl,
  })
  const mapPanel = (hl = []) => ({ kind: 'hashmap', label: 'self.cache · key → node', entries: [...vals.entries()], highlight: hl })
  const view = (hl = []) => [dllPanel(hl), mapPanel(hl), { kind: 'text', text: `capacity ${cap} · last return: ${returned}` }]

  const doRemove = (id, callLine, nth = 1) => {
    const idx = order.indexOf(id)
    const prevId = order[idx - 1]
    const nextId = order[idx + 1]
    t.step(L(callLine, nth), { vars: { node: id }, panels: view([id]), note: `remove(${labelOf(id)}): unlink it from the DLL.` })
    t.step(L('prev, nxt = node.prev, node.next'), { vars: { prev: labelOf(prevId), nxt: labelOf(nextId) }, panels: view([prevId, id, nextId].filter(Boolean)), note: 'Grab both neighbors before cutting anything.' })
    order = order.filter(x => x !== id)
    t.step(L('prev.next = nxt'), { vars: {}, panels: view([prevId, nextId].filter(Boolean)), note: `${labelOf(prevId)} now points to ${labelOf(nextId)}.` })
    t.step(L('nxt.prev = prev'), { vars: {}, panels: view([prevId, nextId].filter(Boolean)), note: 'Back-link closes the gap too — both sides must update or the splice half-breaks.' })
  }

  const doInsert = (id, callLine, nth = 1) => {
    t.step(L(callLine, nth), { vars: { node: id }, panels: view([id]), note: `insert(${labelOf(id)}): splice it in right before self.right.` })
    const beforeId = order[order.length - 2]
    order.splice(order.length - 1, 0, id)
    t.step(L('prev, nxt = self.right.prev, self.right'), { vars: {}, panels: view([beforeId, id].filter(Boolean)), note: `${labelOf(beforeId)} was the old MRU; self.right is the fixed tail sentinel.` })
    t.step(L('prev.next = node'), { vars: {}, panels: view([beforeId, id].filter(Boolean)), note: `${labelOf(beforeId)} now points to the new node.` })
    t.step(L('node.prev = prev'), { vars: {}, panels: view([id]), note: 'New node points back to the old MRU.' })
    t.step(L('node.next = nxt'), { vars: {}, panels: view([id, 'R']), note: 'New node points forward to self.right.' })
    t.step(L('nxt.prev = node'), { vars: {}, panels: view([id]), note: 'self.right now points back to the new MRU node.' })
  }

  t.step(L('self.cap = capacity'), { vars: { capacity: cap }, panels: view(), note: `Capacity fixed at ${cap}.`, say: 'self.cap and self.cache are the only two fields the whole structure needs, plus the sentinels.' })
  t.step(L('self.cache = {}'), { vars: {}, panels: view(), note: 'Empty map to start.' })
  t.step(L('self.left.next = self.right'), { vars: {}, panels: view(), note: 'Sentinels wired to each other: an empty list.', say: 'Two fixed sentinels mean add/remove never special-case the ends.' })
  t.step(L('self.right.prev = self.left'), { vars: {}, panels: view(), note: 'Back-link too, so the DLL is doubly consistent.' })

  ops.forEach(([name, a, b]) => {
    if (name === 'get') {
      const key = a
      t.step(L('def get(self, key: int) -> int:'), { vars: { key }, panels: view(vals.has(key) ? [key] : []), note: `get(${key}).` })
      const present = vals.has(key)
      t.step(L('if key not in self.cache:'), { vars: { key, present }, panels: view(present ? [key] : []), note: present ? `${key} is cached.` : `${key} is not cached.` })
      if (!present) {
        returned = -1
        t.step(L('return -1'), { vars: { result: -1 }, panels: view(), note: `${key} missing: -1.` })
        return
      }
      doRemove(key, 'self.remove(self.cache[key])', 1)
      doInsert(key, 'self.insert(self.cache[key])', 1)
      returned = vals.get(key)
      t.step(L('return self.cache[key].val'), { vars: { result: returned }, panels: view([key]), note: `Return ${returned}. ${key} is now the MRU node.`, say: !saidHit ? 'A hit still touches the list: reading counts as a use too.' : undefined })
      saidHit = true
    } else {
      const key = a
      const value = b
      t.step(L('def put(self, key: int, value: int) -> None:'), { vars: { key, value }, panels: view(vals.has(key) ? [key] : []), note: `put(${key}, ${value}).` })
      const exists = vals.has(key)
      t.step(L('if key in self.cache:'), { vars: { key, exists }, panels: view(exists ? [key] : []), note: exists ? `${key} exists: remove its old node first.` : `${key} is new.` })
      if (exists) doRemove(key, 'self.remove(self.cache[key])', 2)
      vals.set(key, value)
      t.step(L('self.cache[key] = Node(key, value)'), { vars: { key, value }, panels: view(), note: `New Node(${key}, ${value}), stored in the map.`, say: !saidIdentity ? 'self.cache[key] IS this node object, not a copy — the map and the list share it.' : undefined })
      saidIdentity = true
      doInsert(key, 'self.insert(self.cache[key])', 2)
      if (vals.size > cap) {
        const evict = order[1]
        t.step(L('if len(self.cache) > self.cap:'), { vars: { size: vals.size, cap }, panels: view(), note: `${vals.size} > ${cap}: over capacity.` })
        t.step(L('lru = self.left.next'), { vars: { lru: evict }, panels: view([evict]), note: `self.left.next is the true LRU: ${evict}.` })
        doRemove(evict, 'self.remove(lru)')
        vals.delete(evict)
        t.step(L('del self.cache[lru.key]'), { vars: { evicted: evict }, panels: view(), note: `${evict} evicted from both the list and the map.`, say: !saidEvict ? 'Evict from both structures, or they drift out of sync.' : undefined })
        saidEvict = true
      } else {
        t.step(L('if len(self.cache) > self.cap:'), { vars: { size: vals.size, cap }, panels: view(), note: 'Still within capacity: no eviction.' })
      }
    }
  })
}

const traces = [
  {
    id: `${topicId}:trace:lru-evict`,
    title: 'LRU Cache: put() and eviction',
    skills: ['linked-list', 'ds-diagnosis'],
    problem: 'get/put in O(1), evicting the least recently used key when over capacity.',
    code: lruCode,
    complexity: { time: 'O(1) per op', space: 'O(capacity)', why: 'Hashmap lookup plus a constant number of DLL pointer rewires.' },
    inputs: [
      { label: 'classic eviction', value: { capacity: 2, ops: [['put', 1, 1], ['put', 2, 2], ['get', 1], ['put', 3, 3], ['get', 2], ['put', 4, 4], ['get', 1], ['get', 3], ['get', 4]] } },
      { label: 'capacity 1', value: { capacity: 1, ops: [['put', 1, 10], ['put', 2, 20], ['get', 1], ['get', 2]] } },
      { label: 'update refreshes recency', value: { capacity: 2, ops: [['put', 1, 1], ['put', 2, 2], ['put', 1, 100], ['put', 3, 3], ['get', 2], ['get', 1]] } },
    ],
    run: runLru,
  },
  {
    id: `${topicId}:trace:lru-identity`,
    title: 'LRU Cache: reordering without eviction',
    skills: ['linked-list', 'ds-diagnosis'],
    problem: 'Watch self.cache and the DLL share the same node objects as recency shifts.',
    code: lruCode,
    complexity: { time: 'O(1) per op', space: 'O(capacity)', why: 'No eviction here; every op is still a fixed number of pointer rewires.' },
    inputs: [
      { label: 'reads reorder, no eviction', value: { capacity: 4, ops: [['put', 1, 'a'], ['put', 2, 'b'], ['put', 3, 'c'], ['get', 1], ['get', 2], ['get', 1], ['get', 3]] } },
      { label: 'overwrite keeps identity', value: { capacity: 3, ops: [['put', 5, 'x'], ['get', 5], ['put', 5, 'y'], ['get', 5]] } },
    ],
    run: runLru,
  },
  {
    id: `${topicId}:trace:median-two-heaps`,
    title: 'Find Median from Data Stream',
    skills: ['heap', 'ds-diagnosis'],
    problem: 'Running median of a stream, with O(log n) insert.',
    code: medianCode,
    complexity: { time: 'O(log n) addNum, O(1) findMedian', space: 'O(n)', why: 'Two heaps split the data; each insert does at most 3 heap ops.' },
    inputs: [
      { label: '1,2,3 then 10', value: [1, 2, 3, 10] },
      { label: 'sorted descending', value: [5, 4, 3, 2, 1] },
      { label: 'with negatives', value: [-1, -2, -3, 0, 5] },
    ],
    run(input, t) {
      const nums = unwrap(input)
      const L = lineFinder(medianCode)
      const small = []
      const large = []
      const seen = []
      let saidPush = false
      let saidCross = false
      let saidBack = false
      const view = (hl = {}) => [
        { kind: 'heap', label: 'self.small · max-heap (shown as real values)', items: small.map(v => -v), highlight: hl.small || [] },
        { kind: 'heap', label: 'self.large · min-heap', items: [...large], highlight: hl.large || [] },
        { kind: 'text', text: `stream so far: ${seen.join(', ')}` },
      ]
      nums.forEach(num => {
        seen.push(num)
        t.step(L('def addNum(self, num: int) -> None:'), { vars: { num }, panels: view(), note: `addNum(${num}).` })
        heapPush(small, -num)
        t.step(L('heapq.heappush(self.small, -num)'), { vars: { num }, panels: view({ small: [0] }), note: `Push ${num} into small (negated), so its max floats to the top.`, say: !saidPush ? 'Every value starts in the small (max) half, then I rebalance.' : undefined })
        saidPush = true
        if (small.length && large.length && -small[0] > large[0]) {
          t.step(L('if self.small and self.large and -self.small[0] > self.large[0]:'), { vars: { smallTop: -small[0], largeTop: large[0] }, panels: view({ small: [0], large: [0] }), note: `small's max ${-small[0]} > large's min ${large[0]}: out of order.` })
          const val = heapPop(small)
          t.step(L('val = heapq.heappop(self.small)', 1), { vars: { val: -val }, panels: view(), note: `Pop ${-val} off small.` })
          heapPush(large, -val)
          t.step(L('heapq.heappush(self.large, -val)', 1), { vars: { moved: -val }, panels: view({ large: [0] }), note: `${-val} moves to large.`, say: !saidCross ? 'Crossing the boundary keeps every value in small ≤ every value in large.' : undefined })
          saidCross = true
        } else {
          t.step(L('if self.small and self.large and -self.small[0] > self.large[0]:'), { vars: {}, panels: view(), note: 'Already in order: nothing crosses.' })
        }
        if (small.length > large.length + 1) {
          t.step(L('if len(self.small) > len(self.large) + 1:'), { vars: { small: small.length, large: large.length }, panels: view(), note: 'small has 2 extra: too lopsided.' })
          const val = heapPop(small)
          t.step(L('val = heapq.heappop(self.small)', 2), { vars: { val: -val }, panels: view(), note: `Pop ${-val} off small.` })
          heapPush(large, -val)
          t.step(L('heapq.heappush(self.large, -val)', 2), { vars: { moved: -val }, panels: view({ large: [0] }), note: `${-val} moves to large. Sizes now balanced.` })
        } else {
          t.step(L('if len(self.small) > len(self.large) + 1:'), { vars: {}, panels: view(), note: 'Sizes already within 1 of each other.' })
        }
        if (small.length < large.length) {
          t.step(L('if len(self.small) < len(self.large):'), { vars: { small: small.length, large: large.length }, panels: view(), note: 'large has more: shift one back.' })
          const val = heapPop(large)
          t.step(L('val = heapq.heappop(self.large)'), { vars: { val }, panels: view(), note: `Pop ${val} off large.` })
          heapPush(small, -val)
          t.step(L('heapq.heappush(self.small, -val)'), { vars: { moved: val }, panels: view({ small: [0] }), note: `${val} moves to small, negated for the max-heap.`, say: !saidBack ? 'small is allowed exactly one more than large — that extra becomes the median on odd counts.' : undefined })
          saidBack = true
        } else {
          t.step(L('if len(self.small) < len(self.large):'), { vars: {}, panels: view(), note: 'large not bigger: done rebalancing.' })
        }
      })
      t.step(L('def findMedian(self) -> float:'), { vars: {}, panels: view(), note: 'findMedian() just peeks both tops.' })
      if (small.length > large.length) {
        t.step(L('return -self.small[0]'), { vars: { median: -small[0] }, panels: view({ small: [0] }), note: `Odd total: median is small's top, ${-small[0]}.`, say: 'O(log n) per insert, O(1) per median — the heaps absorb the sorting work incrementally.' })
      } else {
        const median = (-small[0] + large[0]) / 2
        t.step(L('return (-self.small[0] + self.large[0]) / 2'), { vars: { median }, panels: view({ small: [0], large: [0] }), note: `Even total: average the two tops = ${median}.` })
      }
    },
  },
  {
    id: `${topicId}:trace:min-stack`,
    title: 'Min Stack',
    skills: ['stack', 'ds-diagnosis'],
    problem: 'Stack with push, pop, top and getMin, all O(1).',
    code: minStackCode,
    complexity: { time: 'O(1) per op', space: 'O(n)', why: 'Each entry stores the min at its own height.' },
    inputs: [
      { label: 'classic', value: [['push', -2], ['push', 0], ['push', -3], ['getMin'], ['pop'], ['top'], ['getMin']] },
      { label: 'equal mins', value: [['push', 5], ['push', 3], ['push', 3], ['pop'], ['getMin'], ['push', 7], ['getMin']] },
    ],
    run(input, t) {
      const ops = unwrap(input)
      const L = lineFinder(minStackCode)
      const stack = []
      let returned = '—'
      const view = (hl = topIndex(stack)) => [
        { kind: 'stack', label: 'self.stack · (val, minSoFar)', items: stack.map(([v, m]) => `${v} | min ${m}`), highlight: hl },
        { kind: 'text', text: `ops: ${ops.map(op => op.length > 1 ? `${op[0]}(${op[1]})` : `${op[0]}()`).join('  ')}` },
        { kind: 'text', text: `last return: ${returned}` },
      ]
      t.step(L('self.stack = []'), { vars: {}, panels: view([]), note: 'One list holds both the value and the running min.', say: 'self.stack IS the entire object state — no second field needed for the min.' })
      ops.forEach(([name, val]) => {
        if (name === 'push') {
          if (stack.length) {
            const minVal = Math.min(stack[stack.length - 1][1], val)
            t.step(L('minVal = min(self.stack[-1][1], val)'), { vars: { val, minVal }, panels: view([]), note: `min(${stack[stack.length - 1][1]}, ${val}) = ${minVal}.` })
            stack.push([val, minVal])
          } else {
            t.step(L('minVal = val'), { vars: { val, minVal: val }, panels: view([]), note: 'First entry: val is its own min.' })
            stack.push([val, val])
          }
          t.step(L('self.stack.append((val, minVal))'), { vars: { pushed: stack[stack.length - 1] }, panels: view(), note: `Push (${stack[stack.length - 1][0]}, ${stack[stack.length - 1][1]}).` })
        } else if (name === 'pop') {
          stack.pop()
          t.step(L('self.stack.pop()'), { vars: {}, panels: view(), note: 'Top entry removed; the min below is still correct — it never depended on the popped one.' })
        } else if (name === 'top') {
          returned = stack[stack.length - 1][0]
          t.step(L('return self.stack[-1][0]'), { vars: { top: returned }, panels: view(), note: `top() → ${returned}.` })
        } else {
          returned = stack[stack.length - 1][1]
          t.step(L('return self.stack[-1][1]'), { vars: { min: returned }, panels: view(), note: `getMin() → ${returned}. No loop needed.`, say: 'getMin is O(1) because the min is cached on every entry, never recomputed.' })
        }
      })
    },
  },
  {
    id: `${topicId}:trace:kth-largest`,
    title: 'Kth Largest Element in a Stream',
    skills: ['heap', 'ds-diagnosis'],
    problem: 'Maintain the kth largest value as numbers keep arriving.',
    code: kthLargestCode,
    complexity: { time: 'O(log k) per add', space: 'O(k)', why: 'A size-capped min-heap never grows past k elements.' },
    inputs: [
      { label: 'k=3 classic', value: { k: 3, nums: [4, 5, 8, 2], adds: [3, 5, 10, 9, 4] } },
      { label: 'k=1', value: { k: 1, nums: [], adds: [-2, -1, 3] } },
    ],
    run(input, t) {
      const { k, nums, adds } = unwrap(input)
      const L = lineFinder(kthLargestCode)
      const heap = [...nums]
      const view = (hl = []) => [{ kind: 'heap', label: `self.heap · min-heap, size ≤ k=${k}`, items: [...heap], highlight: hl }]
      t.step(L('self.heap = nums'), { vars: { heap: [...heap] }, panels: view(), note: 'Reuse the given list as the heap storage directly.' })
      t.step(L('self.k = k'), { vars: { k }, panels: view(), note: `Keep k=${k} for every future add().` })
      heapifyArr(heap)
      t.step(L('heapq.heapify(self.heap)'), { vars: { heap: [...heap] }, panels: view(), note: 'O(n) bottom-up build, not n separate pushes.' })
      while (heap.length > k) {
        t.step(L('while len(self.heap) > k:'), { vars: { size: heap.length }, panels: view([0]), note: `${heap.length} > ${k}: shrink.` })
        heapPop(heap)
        t.step(L('heapq.heappop(self.heap)'), { vars: { popped: true }, panels: view(), note: 'Smallest leaves; only the k largest remain.' })
      }
      t.step(L('while len(self.heap) > k:'), { vars: { size: heap.length }, panels: view(), note: `Exactly ${k} kept (or fewer). heap[0] will be the kth largest.`, say: 'Size never exceeds k from here on — that is the whole trick.' })
      adds.forEach(val => {
        t.step(L('def add(self, val: int) -> int:'), { vars: { val }, panels: view(), note: `add(${val}).` })
        heapPush(heap, val)
        t.step(L('heapq.heappush(self.heap, val)'), { vars: { val }, panels: view(), note: `${val} joins the heap.` })
        if (heap.length > k) {
          t.step(L('if len(self.heap) > self.k:'), { vars: { size: heap.length }, panels: view([0]), note: `${heap.length} > ${k}: smallest must go.` })
          heapPop(heap)
          t.step(L('heapq.heappop(self.heap)'), { vars: {}, panels: view(), note: 'Back down to k.' })
        } else {
          t.step(L('if len(self.heap) > self.k:'), { vars: { size: heap.length }, panels: view(), note: 'Still ≤ k.' })
        }
        const result = heap[0]
        t.step(L('return self.heap[0]'), { vars: { kthLargest: result }, panels: view([0]), note: `heap[0] = ${result}: the kth largest so far.`, say: 'Everything bigger than heap[0] is also in the heap; everything smaller never made it in.' })
      })
    },
  },
  {
    id: `${topicId}:trace:time-map`,
    title: 'Time Based Key-Value Store',
    skills: ['arrays-hashing', 'ds-diagnosis'],
    problem: 'set(key, value, timestamp) and get(key, timestamp) → latest value at or before that time.',
    code: timeMapCode,
    complexity: { time: 'O(1) set, O(log n) get', space: 'O(n)', why: 'Per-key lists are already sorted by timestamp, so get() can binary search.' },
    inputs: [
      { label: 'classic', value: [['set', 'foo', 'bar', 1], ['get', 'foo', 1], ['get', 'foo', 3], ['set', 'foo', 'bar2', 4], ['get', 'foo', 4], ['get', 'foo', 5]] },
      { label: 'before any set', value: [['get', 'x', 1], ['set', 'x', 'a', 2], ['get', 'x', 1], ['get', 'x', 2]] },
    ],
    run(input, t) {
      const ops = unwrap(input)
      const L = lineFinder(timeMapCode)
      const store = new Map()
      let returned = '—'
      const view = (key, hl = []) => [
        { kind: 'hashmap', label: 'self.store', entries: [...store.entries()].map(([k, list]) => [k, list.map(([ts, v]) => `${ts}:${v}`).join(', ')]), highlight: key != null ? [key] : [] },
        { kind: 'text', text: `last return: ${JSON.stringify(returned)}` },
      ]
      t.step(L('self.store = dd(list)'), { vars: {}, panels: view(null), note: 'Each key maps to a list of (timestamp, value), appended in order.', say: 'Timestamps only increase per key, so each list is already sorted — that is what makes bisect valid.' })
      ops.forEach(([name, key, a, b]) => {
        if (name === 'set') {
          const value = a
          const timestamp = b
          if (!store.has(key)) store.set(key, [])
          store.get(key).push([timestamp, value])
          t.step(L('self.store[key].append((timestamp, value))'), { vars: { key, timestamp, value }, panels: view(key), note: `Append (${timestamp}, "${value}") to ${key}'s list.` })
        } else {
          const timestamp = a
          const list = store.get(key) || []
          t.step(L('values = self.store[key]'), { vars: { key }, panels: view(key), note: `Look up ${key}'s list.` })
          let i = 0
          while (i < list.length && list[i][0] <= timestamp) i++
          t.step(L('i = bisect.bisect_right(values, (timestamp, chr(127)))'), { vars: { timestamp, i }, panels: view(key), note: `Binary search: first index past timestamp ≤ ${timestamp} is ${i}.` })
          if (i === 0) {
            returned = ''
            t.step(L("return ''"), { vars: { result: '' }, panels: view(key), note: 'Nothing recorded at or before this timestamp.' })
          } else {
            returned = list[i - 1][1]
            t.step(L('return values[i - 1][1]'), { vars: { result: returned }, panels: view(key), note: `values[${i - 1}] is the latest entry at or before ${timestamp}: "${returned}".`, say: 'O(log n) per get instead of scanning every set() call.' })
          }
        }
      })
    },
  },
  {
    id: `${topicId}:trace:randomized-set`,
    title: 'Insert Delete GetRandom O(1)',
    skills: ['arrays-hashing', 'ds-diagnosis'],
    problem: 'insert, remove and uniform getRandom, all O(1).',
    code: randomizedSetCode,
    complexity: { time: 'O(1) per op', space: 'O(n)', why: 'Swap-with-last removal avoids shifting the array.' },
    inputs: [
      { label: 'classic', value: [['insert', 1], ['remove', 2], ['insert', 2], ['getRandom'], ['remove', 1], ['insert', 2]] },
      { label: 'swap in the middle', value: [['insert', 1], ['insert', 2], ['insert', 3], ['insert', 4], ['remove', 2], ['getRandom']] },
    ],
    run(input, t) {
      const ops = unwrap(input)
      const L = lineFinder(randomizedSetCode)
      const values = []
      const indices = new Map()
      let returned = '—'
      let saidSwap = false
      const view = (hl = [], hlMap = []) => [
        { kind: 'array', label: 'self.values', values: [...values], highlight: hl },
        { kind: 'hashmap', label: 'self.indices · value → index', entries: [...indices.entries()], highlight: hlMap },
        { kind: 'text', text: `last return: ${returned}` },
      ]
      t.step(L('self.values = []'), { vars: {}, panels: view(), note: 'Array for O(1) random access.' })
      t.step(L('self.indices = {}'), { vars: {}, panels: view(), note: 'Map value → its index, so remove never has to search.', say: 'The two structures must stay in sync: every value\'s index field must match where it really sits.' })
      ops.forEach(([name, val]) => {
        if (name === 'insert') {
          t.step(L('def insert(self, val: int) -> bool:'), { vars: { val }, panels: view(), note: `insert(${val}).` })
          if (indices.has(val)) {
            returned = false
            t.step(L('return False', 1), { vars: { result: false }, panels: view([], [val]), note: 'Already present: no duplicates allowed.' })
          } else {
            indices.set(val, values.length)
            t.step(L('self.indices[val] = len(self.values)'), { vars: { val, index: values.length }, panels: view(), note: `${val} will sit at index ${values.length}.` })
            values.push(val)
            t.step(L('self.values.append(val)'), { vars: {}, panels: view([values.length - 1]), note: 'Append to the end.' })
            returned = true
            t.step(L('return True', 1), { vars: { result: true }, panels: view([values.length - 1]), note: 'Inserted.' })
          }
        } else if (name === 'remove') {
          t.step(L('def remove(self, val: int) -> bool:'), { vars: { val }, panels: view(), note: `remove(${val}).` })
          if (!indices.has(val)) {
            returned = false
            t.step(L('return False', 2), { vars: { result: false }, panels: view(), note: 'Not present: nothing to remove.' })
          } else {
            const index = indices.get(val)
            t.step(L('index = self.indices[val]'), { vars: { val, index }, panels: view([index]), note: `${val} is at index ${index}.` })
            const last = values[values.length - 1]
            t.step(L('last = self.values[-1]'), { vars: { last }, panels: view([values.length - 1]), note: `Last element is ${last}: it will fill the gap instead of shifting everything.` })
            values[index] = last
            t.step(L('self.values[index] = last'), { vars: { index, last }, panels: view([index]), note: `Overwrite index ${index} with ${last}.`, say: !saidSwap ? 'Swap the target with the last element so removal is O(1), never O(n) shifting.' : undefined })
            saidSwap = true
            indices.set(last, index)
            t.step(L('self.indices[last] = index'), { vars: { last, index }, panels: view([index], [last]), note: `${last}'s index updated to ${index} — the maps must agree.` })
            values.pop()
            t.step(L('self.values.pop()'), { vars: {}, panels: view(), note: 'Drop the now-duplicated last slot.' })
            indices.delete(val)
            t.step(L('del self.indices[val]'), { vars: {}, panels: view(), note: `${val} fully gone from both structures.` })
            returned = true
            t.step(L('return True', 2), { vars: { result: true }, panels: view(), note: 'Removed in O(1).' })
          }
        } else {
          returned = values.length ? `one of {${values.join(', ')}}` : 'undefined (empty)'
          t.step(L('return random.choice(self.values)'), { vars: {}, panels: view(), note: 'Any index is equally likely: uniform over self.values.' })
        }
      })
    },
  },
  {
    id: `${topicId}:trace:trie`,
    title: 'Implement Trie (Prefix Tree)',
    skills: ['trie', 'ds-diagnosis'],
    problem: 'insert(word), search(word), startsWith(prefix) over many shared-prefix words.',
    code: prefixTreeCode,
    complexity: { time: 'O(L) per call', space: 'O(total characters)', why: 'One hop per character; shared prefixes share nodes.' },
    inputs: [
      { label: 'apple family', value: [['insert', 'apple'], ['search', 'apple'], ['search', 'app'], ['insert', 'app'], ['search', 'app'], ['search', 'appl']] },
      { label: 'disjoint words', value: [['insert', 'cat'], ['insert', 'car'], ['search', 'ca'], ['search', 'cat'], ['search', 'dog']] },
    ],
    run(input, t) {
      const ops = unwrap(input)
      const L = lineFinder(prefixTreeCode)
      const ROOT = '∅'
      const paths = new Set([ROOT])
      const ends = new Set()
      let saidPrefix = false
      let saidEndCheck = false
      const childPath = (parent, c) => parent === ROOT ? c : parent + c
      const nodeLabel = p => p === ROOT ? 'root' : p[p.length - 1]
      const view = (curr = ROOT, pathSoFar = []) => [{
        kind: 'graph', label: 'self.root · trie', directed: true,
        nodes: [...paths].map(p => ({ id: p, label: nodeLabel(p) })),
        edges: [...paths].filter(p => p !== ROOT).map(p => ({ from: p.length > 1 ? p.slice(0, -1) : ROOT, to: p })),
        state: Object.fromEntries([...pathSoFar.map(p => [p, 'path']), [curr, 'current']]),
        values: Object.fromEntries([...ends].map(p => [p, '• word'])),
      }]
      t.step(L('self.root = TrieNode()'), { vars: {}, panels: view(), note: 'One empty root; children live in dicts, not fixed slots.', say: 'self.root never changes identity — only the children dicts underneath it grow.' })
      ops.forEach(([name, word]) => {
        if (name === 'insert') {
          t.step(L('def insert(self, word: str) -> None:'), { vars: { word }, panels: view(), note: `insert("${word}").` })
          let curr = ROOT
          const visited = [ROOT]
          t.step(L('curr = self.root', 1), { vars: { curr: 'root' }, panels: view(curr, visited), note: 'Start at the root.' })
          for (const c of word) {
            const next = childPath(curr, c)
            t.step(L('for c in word:', 1), { vars: { c }, panels: view(curr, visited), note: `Next character: '${c}'.` })
            if (!paths.has(next)) {
              paths.add(next)
              t.step(L('curr.children[c] = TrieNode()'), { vars: { created: next }, panels: view(curr, visited), note: `No '${c}' here yet: create a new TrieNode.` })
            } else {
              t.step(L('if c not in curr.children:', 1), { vars: {}, panels: view(curr, visited), note: `'${c}' already exists: reuse it.` })
            }
            curr = next
            visited.push(curr)
            t.step(L('curr = curr.children[c]', 1), { vars: { curr: nodeLabel(curr) }, panels: view(curr, visited), note: `Step down to '${c}'.` })
          }
          ends.add(curr)
          t.step(L('curr.endOfWord = True'), { vars: { word }, panels: view(curr, visited), note: `Mark the end: "${word}" is a complete word here.`, say: !saidPrefix ? 'A shared prefix can walk through the same nodes as an earlier word — only this flag marks a real word.' : undefined })
          saidPrefix = true
        } else {
          const query = word
          t.step(L('def search(self, word: str) -> bool:'), { vars: { word: query }, panels: view(), note: `search("${query}").` })
          let curr = ROOT
          const visited = [ROOT]
          let found = true
          t.step(L('curr = self.root', 2), { vars: {}, panels: view(curr, visited), note: 'Start from the root again.' })
          for (const c of query) {
            const next = childPath(curr, c)
            t.step(L('for c in word:', 2), { vars: { c }, panels: view(curr, visited), note: `Need '${c}' next.` })
            if (!paths.has(next)) {
              t.step(L('if c not in curr.children:', 2), { vars: {}, panels: view(curr, visited), note: `No '${c}' from here: word not in trie.` })
              found = false
              break
            }
            curr = next
            visited.push(curr)
            t.step(L('curr = curr.children[c]', 2), { vars: { curr: nodeLabel(curr) }, panels: view(curr, visited), note: `Found '${c}', step down.` })
          }
          if (found) {
            const isWord = ends.has(curr)
            t.step(L('return curr.endOfWord'), { vars: { result: isWord }, panels: view(curr, visited), note: isWord ? 'Full path exists AND is marked as a word: True.' : 'Path exists, but no insert ended here: False.', say: !saidEndCheck ? 'A prefix existing is not enough — endOfWord is what makes it a real word.' : undefined })
            saidEndCheck = true
          } else {
            t.step(L('return False', 1), { vars: { result: false }, panels: view(curr, visited), note: 'Missing a character along the path: False.' })
          }
        }
      })
    },
  },
  {
    id: `${topicId}:trace:queue-via-stacks`,
    title: 'Implement Queue using Stacks',
    skills: ['stack', 'queue-deque'],
    problem: 'FIFO queue built only from LIFO stacks.',
    code: queueViaStacksCode,
    complexity: { time: 'O(1) push, amortized O(1) pop/peek', space: 'O(n)', why: 'Each element crosses inbox → outbox exactly once in its lifetime.' },
    inputs: [
      { label: 'classic', value: [['push', 1], ['push', 2], ['peek'], ['pop'], ['empty']] },
      { label: 'interleaved', value: [['push', 1], ['pop'], ['push', 2], ['push', 3], ['peek'], ['pop'], ['pop'], ['empty']] },
    ],
    run(input, t) {
      const ops = unwrap(input)
      const L = lineFinder(queueViaStacksCode)
      const inbox = []
      const outbox = []
      let returned = '—'
      let saidAmortized = false
      const view = (hlIn = [], hlOut = []) => [
        { kind: 'stack', label: 'self.inbox · newest pushed on top', items: [...inbox], highlight: hlIn },
        { kind: 'stack', label: 'self.outbox · front of queue on top', items: [...outbox], highlight: hlOut },
        { kind: 'text', text: `last return: ${returned}` },
      ]
      t.step(L('self.inbox = []'), { vars: {}, panels: view(), note: 'Pushes always land here.' })
      t.step(L('self.outbox = []'), { vars: {}, panels: view(), note: 'Pops/peeks come from here, already reversed.', say: 'Flipping one stack onto another reverses it — that reversal turns LIFO into FIFO.' })
      const moveIfNeeded = nth => {
        t.step(L('self.moveIfNeeded()', nth), { vars: {}, panels: view(), note: 'Make sure outbox has the oldest item on top.' })
        if (!outbox.length) {
          t.step(L('if not self.outbox:'), { vars: {}, panels: view(), note: 'outbox is empty: time to flip inbox over.' })
          while (inbox.length) {
            const x = inbox.pop()
            outbox.push(x)
            t.step(L('self.outbox.append(self.inbox.pop())'), { vars: { moved: x }, panels: view([], [outbox.length - 1]), note: `Move ${x}. Reversing inbox fixes the order.` })
          }
        } else {
          t.step(L('if not self.outbox:'), { vars: {}, panels: view(), note: 'outbox still holds items in the right order: no flip needed.' })
        }
      }
      ops.forEach(([name, x]) => {
        if (name === 'push') {
          inbox.push(x)
          t.step(L('self.inbox.append(x)'), { vars: { x }, panels: view([inbox.length - 1]), note: `push(${x}): goes on top of inbox.` })
        } else if (name === 'pop') {
          t.step(L('def pop(self) -> int:'), { vars: {}, panels: view(), note: 'pop().' })
          moveIfNeeded(1)
          returned = outbox.pop()
          t.step(L('return self.outbox.pop()'), { vars: { result: returned }, panels: view(), note: `Returns ${returned}, the oldest item.` })
        } else if (name === 'peek') {
          t.step(L('def peek(self) -> int:'), { vars: {}, panels: view(), note: 'peek().' })
          moveIfNeeded(2)
          returned = outbox[outbox.length - 1]
          t.step(L('return self.outbox[-1]'), { vars: { result: returned }, panels: view([], [outbox.length - 1]), note: `Front is ${returned}; nothing removed.` })
        } else {
          returned = !inbox.length && !outbox.length
          t.step(L('return not self.inbox and not self.outbox'), { vars: { result: returned }, panels: view(), note: 'Empty only if BOTH stacks are empty.', say: !saidAmortized ? 'Each element moves inbox → outbox at most once in its lifetime: amortized O(1).' : undefined })
          saidAmortized = true
        }
      })
    },
  },
  {
    id: `${topicId}:trace:browser-history`,
    title: 'Design Browser History',
    skills: ['arrays-hashing', 'ds-diagnosis'],
    problem: 'visit/back/forward over a tape of visited pages.',
    code: browserHistoryCode,
    complexity: { time: 'O(1) back/forward, O(n) worst-case visit', space: 'O(n)', why: 'visit() may truncate a long forward run; back/forward just clamp an index.' },
    inputs: [
      { label: 'classic', value: { homepage: 'leetcode.com', ops: [['visit', 'google.com'], ['visit', 'facebook.com'], ['visit', 'youtube.com'], ['back', 1], ['back', 1], ['forward', 1], ['visit', 'linkedin.com'], ['forward', 2], ['back', 2], ['back', 7]] } },
      { label: 'short', value: { homepage: 'home', ops: [['visit', 'a'], ['visit', 'b'], ['back', 5], ['forward', 5]] } },
    ],
    run(input, t) {
      const { homepage, ops } = unwrap(input)
      const L = lineFinder(browserHistoryCode)
      let history = [homepage]
      let curr = 0
      let returned = '—'
      let saidClamp = false
      const view = (dim = []) => [
        { kind: 'array', label: 'self.history', values: [...history], pointers: { curr }, highlight: [curr], dim },
        { kind: 'text', text: `last return: ${returned}` },
      ]
      t.step(L('self.history = [homepage]'), { vars: { homepage }, panels: view(), note: 'One-element history so far.' })
      t.step(L('self.curr = 0'), { vars: { curr }, panels: view(), note: 'curr indexes the page being viewed right now.', say: 'self.curr IS the browser\'s position — everything else is just the tape of pages.' })
      ops.forEach(([name, a]) => {
        if (name === 'visit') {
          const url = a
          t.step(L('def visit(self, url: str) -> None:'), { vars: { url }, panels: view(), note: `visit("${url}").` })
          const dropped = history.slice(curr + 1)
          history = history.slice(0, curr + 1)
          t.step(L('self.history = self.history[:self.curr + 1]'), { vars: { dropped }, panels: view(), note: dropped.length ? `Forward history {${dropped.join(', ')}} is gone: a real browser does this too.` : 'Nothing forward to drop.' })
          history.push(url)
          t.step(L('self.history.append(url)'), { vars: { url }, panels: view(), note: `"${url}" appended.` })
          curr++
          t.step(L('self.curr += 1'), { vars: { curr }, panels: view(), note: `curr moves to ${curr}, the new page.` })
        } else if (name === 'back') {
          const steps = a
          t.step(L('def back(self, steps: int) -> str:'), { vars: { steps }, panels: view(), note: `back(${steps}).` })
          curr = Math.max(0, curr - steps)
          t.step(L('self.curr = max(0, self.curr - steps)'), { vars: { curr }, panels: view(), note: "Clamp at 0: can't go before the homepage." })
          returned = history[curr]
          t.step(L('return self.history[self.curr]', 1), { vars: { result: returned }, panels: view(), note: `Now viewing "${returned}".` })
        } else {
          const steps = a
          t.step(L('def forward(self, steps: int) -> str:'), { vars: { steps }, panels: view(), note: `forward(${steps}).` })
          curr = Math.min(history.length - 1, curr + steps)
          t.step(L('self.curr = min(len(self.history) - 1, self.curr + steps)'), { vars: { curr }, panels: view(), note: 'Clamp at the newest page.', say: !saidClamp ? 'Both back and forward just clamp curr — no special-casing the ends.' : undefined })
          saidClamp = true
          returned = history[curr]
          t.step(L('return self.history[self.curr]', 2), { vars: { result: returned }, panels: view(), note: `Now viewing "${returned}".` })
        }
      })
    },
  },
]

const flashcards = [
  ['ds-diagnosis', '__init__ runs when?', 'Exactly once, when you call ClassName(...). It builds self.* fields for that instance.'],
  ['ds-diagnosis', 'self.x vs local x', 'self.x persists on the object across method calls. Plain x dies when the method returns.'],
  ['ds-diagnosis', 'Class attribute shared-mutable bug', 'class Foo: items = [] makes ONE list shared by every instance. Set it in __init__ instead: self.items = [].'],
  ['ds-diagnosis', 'Why self is the first parameter', 'Python passes the instance automatically. foo.bar(1) really calls Bar(foo, 1) under the hood.'],
  ['ds-diagnosis', 'Calling self.method() from another method', 'Lets one method reuse another\'s logic on the same object, like get() reusing remove() + insert().'],
  ['linked-list', '__repr__ vs __str__', '__repr__ is the debug-friendly fallback print uses when __str__ is missing. Return a short unambiguous string.'],
  ['ds-diagnosis', '@dataclass shortcut', 'Auto-generates __init__, __repr__, __eq__ from type-annotated fields. Fine to mention; rarely needed live.'],
  ['ds-diagnosis', 'Mutable default argument bug', 'def __init__(self, items=[]) shares ONE list across every call missing that arg. Use None, then build inside.'],
  ['communication', 'Design interview order', 'Clarify the API → pick a DS per operation\'s target complexity → class skeleton with every method stubbed → fill one at a time.'],
  ['communication', 'Stating an invariant out loud', '"self.left.next is always the LRU real node." Saying it catches bugs before you write them.'],
  ['linked-list', 'LRU Cache: the two structures', 'self.cache: key → Node (O(1) lookup). Doubly linked list ordered by recency (O(1) reorder).'],
  ['linked-list', 'Why doubly, not singly, linked?', 'Removing a node from the middle needs its prev pointer too, or you cannot relink in O(1).'],
  ['linked-list', 'LRU sentinels self.left / self.right', 'Two fake nodes that never move. Real nodes always sit between them: no None-checks for empty or single-node lists.'],
  ['linked-list', 'LRU get() on a hit', 'remove(node) then insert(node) at the MRU end. A read still counts as a "use".'],
  ['linked-list', 'LRU put() on an existing key', 'Remove the old node first, THEN create and insert the new one — still refreshes recency.'],
  ['linked-list', 'LRU eviction target', 'self.left.next is always the true least-recently-used real node. Remove it, then del the matching cache entry.'],
  ['ds-diagnosis', 'self.cache[key] IS the node', 'Not a copy. The hashmap and the linked list point at the SAME object — move it once, both views update.'],
  ['communication', 'LRU complexity to say out loud', 'get and put are both O(1): one hashmap op plus a constant number of pointer rewires.'],
  ['linked-list', 'OrderedDict.move_to_end(key)', 'O(1). Moves an existing key to the most-recent end — the built-in version of remove(node) + insert(node).'],
  ['linked-list', 'OrderedDict.popitem(last=False)', 'Pops the OLDEST entry in O(1) — the built-in eviction step.'],
  ['communication', 'OrderedDict in an interview', 'Mention it exists, then build the DLL by hand anyway — that is the part being tested.'],
  ['heap', 'Python heapq default', 'Always a MIN-heap. For a max-heap, push the negative of each value.'],
  ['heap', 'Comparing tuples in a heap', 'Left to right. (time, id) sorts by time first; id breaks ties.'],
  ['heap', '__lt__ for custom heap objects', 'heapq needs a way to compare items. Define __lt__ on the class, or just push tuples instead.'],
  ['heap', 'Running median: the trick', 'Max-heap for the lower half, min-heap for the upper half. Their tops are the two middle values.'],
  ['heap', 'Running median: the invariant', 'len(small) equals len(large), or is exactly one more. Rebalance after every insert.'],
  ['heap', 'Kth largest in a stream', 'Keep a min-heap of size k. heap[0] is always the kth largest so far; pop when size exceeds k.'],
  ['heap', 'heapify vs n pushes', 'heapq.heapify(list) is O(n). Pushing n items one at a time is O(n log n).'],
  ['trie', 'TrieNode fields', 'self.children: dict char → TrieNode. self.endOfWord: bool, true only at a word\'s last node.'],
  ['trie', 'Trie prefix exists vs word exists', 'Walking the path can succeed (prefix exists) while endOfWord is still False (not a full inserted word).'],
  ['trie', 'WordDictionary "." wildcard search', 'Recursive dfs(i, node): on ".", try EVERY child at this position, return True if any path completes.'],
  ['ds-diagnosis', 'Time Based Key-Value Store', 'dict of key → list of (timestamp, value), appended in increasing timestamp order. get() is bisect_right by timestamp.'],
  ['ds-diagnosis', 'Logger Rate Limiter', 'dict message → last printed timestamp. Print again only once 10+ seconds have passed.'],
  ['arrays-hashing', 'Insert Delete GetRandom O(1)', 'Array + value→index map. Remove by swapping the target with the LAST element, then popping — never shift.'],
  ['arrays-hashing', 'Why swap-with-last for O(1) remove', 'Removing from the middle of a list is O(n) unless you move the last element into the gap first.'],
  ['queue-deque', 'Queue via two stacks', 'Push → inbox. Pop/peek → flip inbox into outbox only when outbox is empty. Amortized O(1).'],
  ['queue-deque', 'Why flipping stacks gives FIFO', 'Popping a stack onto another stack reverses the order once — LIFO run twice is FIFO.'],
  ['ds-diagnosis', 'Browser History structure', 'A list (the tape) plus self.curr (the position). visit() truncates everything after curr first.'],
  ['ds-diagnosis', 'Browser History: back/forward pattern', 'Both just clamp self.curr with max(0, ...) / min(len-1, ...). No special-casing the ends.'],
  ['heap', 'Design Twitter: merging followees\' feeds', 'Push each followed user\'s newest tweet (time, tweetId, user, nextIndex) into one heap; pop top 10, push each user\'s next.'],
  ['ds-diagnosis', 'LFU Cache: freq buckets', 'freq → OrderedDict of keys at that freq (insertion-ordered for tie-breaking). minFreq tracks the bucket to evict from.'],
  ['ds-diagnosis', 'LFU eviction rule', 'Evict from the LOWEST frequency bucket; among ties, the one that has been there longest.'],
  ['communication', 'Design problem: state it before coding', 'Say every self.* field and what it is for, before writing the first method body.'],
  ['ds-diagnosis', 'Signal: "get/put/insert, all O(1), with eviction"', 'Hashmap for O(1) lookup, plus a second structure (DLL, two stacks, or heap) for O(1) order.'],
  ['communication', 'Signal: "design a class that supports..."', 'Treat it like any other problem: clarify the API first, THEN pick data structures — don\'t start coding immediately.'],
].map(([skill, front, back], i) => ({ id: `${topicId}:card:${i + 1}`, skills: [skill], front, back }))

const mcqData = [
  ['ds-diagnosis', 1, 'When does __init__ run?', null, ['Every time you call a method', 'Once, when the object is created', 'Only if you call it manually', 'Never, it is just documentation'], 1, 'ClassName(...) calls __init__ exactly once to set up that instance.'],
  ['ds-diagnosis', 1, 'self.x inside a method refers to...', null, ['A brand-new local variable', 'A field stored on the current instance', 'A global variable', 'The class name'], 1, 'self is the instance; self.x persists on it across calls.'],
  ['ds-diagnosis', 2, 'class Bag:\n    items = []\n\n    def add(self, x):\n        self.items.append(x)\nTwo Bag() objects both call add(). Their .items lists are...', 'class Bag:\n    items = []\n\n    def add(self, x):\n        self.items.append(x)', ['Separate, as expected', 'The SAME list, shared by both objects', 'Both empty', 'Error at the second add'], 1, 'items is a class attribute: one object shared by every instance unless set in __init__.'],
  ['ds-diagnosis', 2, 'Fix for the shared-list bug above?', null, ['Rename items to _items', 'Set self.items = [] inside __init__', 'Make add() a static method', 'Use a tuple instead'], 1, 'Assigning in __init__ creates one list PER instance.'],
  ['ds-diagnosis', 1, 'A method that only reads self.* fields should still take...', null, ['No parameters', 'self as the first parameter', 'cls as the first parameter', 'The class name as a parameter'], 1, 'Every instance method takes self first, even read-only ones.'],
  ['ds-diagnosis', 2, 'def __init__(self, items=[]):\n    self.items = items\nWhat is the bug?', "def __init__(self, items=[]):\n    self.items = items", ['None, this is correct', 'The default list is created once and shared across every call missing that arg', 'items should be a set', 'self.items should always be items.copy()'], 1, 'Mutable defaults are created once at function-definition time, not per call.'],
  ['ds-diagnosis', 2, 'A method calls self.remove(x) then self.insert(x). This is an example of...', null, ['A syntax error', 'One method reusing another method on the same object', 'Multiple inheritance', 'A static method call'], 1, 'self.method() calls route through the same instance, letting methods compose.'],
  ['communication', 2, 'Interviewer: "you may use any built-in." They expect you to...', null, ['Just call the built-in and move on', 'Name the built-in, then still build the structure by hand', 'Ignore the hint', 'Ask for a different problem'], 1, 'Naming it shows awareness; building it shows you understand the mechanism.'],
  ['communication', 1, 'Before writing any method body in a design problem, you should first...', null, ['Write the hardest method', 'Clarify every method\'s signature and behavior', 'Pick variable names', 'Write test cases only'], 1, 'Clarifying the API prevents building the wrong thing.'],
  ['ds-diagnosis', 2, 'Design problem: get O(1), put O(1), eviction needed. First structural decision?', null, ['Sort by value', 'Hashmap for lookup, plus a second structure for O(1) order', 'Binary search tree only', 'Nested lists'], 1, 'Hashmap alone gives lookup but not O(1) order tracking.'],
  ['linked-list', 1, 'LRU Cache needs O(1) get AND put. Core structures?', null, ['Array only', 'Hashmap + doubly linked list', 'Stack + queue', 'Two hashmaps'], 1, 'Hashmap for lookup, DLL for O(1) recency reordering.'],
  ['linked-list', 2, 'Why doubly linked, not singly linked, for LRU?', null, ['Doubly is simpler to write', 'Removing a middle node needs its prev pointer too', 'Singly linked lists cannot store values', 'Doubly linked lists allocate faster'], 1, 'Without prev, unlinking a middle node costs an O(n) search.'],
  ['linked-list', 2, 'LRU uses sentinel self.left and self.right nodes mainly to...', null, ['Save memory', 'Avoid special-casing empty or single-node lists', 'Speed up hashing', 'Store the capacity'], 1, 'Every real node sits between two fixed, never-removed sentinels.'],
  ['linked-list', 2, 'LRU get(key) on an existing key should...', null, ['Just return the value, no list change', 'Move the node to the MRU end, then return the value', 'Delete and reinsert a brand new node', 'Do nothing to the list'], 1, 'A read still counts as a use: remove then insert at the MRU end.'],
  ['linked-list', 2, 'LRU put(key, value) where key already exists. Correct order?', null, ['Insert the new node, then remove the old one', 'Remove the existing node, then insert the updated one', 'Only update the value in place', 'Append a second node for the same key'], 1, 'Removing first avoids ever having two nodes for the same key.'],
  ['linked-list', 2, 'Who is the LRU eviction target?', null, ['self.right.prev', 'self.left.next', 'Whatever is in self.cache first (dict order)', 'The largest key'], 1, 'self.left.next is always the true least-recently-used real node.'],
  ['ds-diagnosis', 3, 'self.cache[key] in the hand-built LRU returns...', null, ['A copy of the node', 'The SAME Node object that lives in the linked list', 'Just the value, already unwrapped', 'A new node each time'], 1, 'The hashmap stores a reference to the actual node, not a copy.'],
  ['ds-diagnosis', 2, 'If remove() only updates prev.next but forgets nxt.prev, the bug is...', null, ['No effect, it still works', 'The list silently corrupts: nxt still thinks prev is its neighbor', 'An immediate crash', 'Only affects get(), not put()'], 1, 'A splice needs both sides updated or the back-link is stale.'],
  ['communication', 2, 'LRU get and put time complexity to state out loud?', null, ['O(log n) both', 'O(1) both: one hashmap op plus constant pointer rewires', 'O(n) worst case', 'O(1) get, O(n) put'], 1, 'Both are O(1): the DLL splice is a constant number of pointer updates.'],
  ['linked-list', 2, 'LFU Cache (harder cousin of LRU) also needs to track...', null, ['Just recency', 'Frequency of use, with recency as a tiebreaker', 'Only capacity', 'Alphabetical key order'], 1, 'LFU evicts the least frequently used, tie-broken by least recent.'],
  ['linked-list', 1, 'OrderedDict.move_to_end(key) does what, in O(1)?', null, ['Deletes the key', 'Moves an existing key to the most-recently-used end', 'Sorts all keys', 'Copies the dict'], 1, 'It is the built-in version of remove(node) + insert(node) at the MRU end.'],
  ['linked-list', 1, 'OrderedDict.popitem(last=False) removes...', null, ['A random key', 'The most recently added key', 'The OLDEST entry', 'The largest value'], 2, 'last=False means pop from the old end: the LRU entry.'],
  ['communication', 2, 'Why build the DLL by hand when OrderedDict exists?', null, ['OrderedDict is slower', 'The interview is testing whether you understand the O(1) mechanism, not the API', 'OrderedDict cannot store ints', 'There is no reason; always use OrderedDict'], 1, 'The hand-built version demonstrates the hashmap+DLL insight directly.'],
  ['heap', 1, 'Python heapq.heappush/heappop maintain...', null, ['A max-heap by default', 'A min-heap by default', 'A sorted list', 'A balanced BST'], 1, 'heapq is always a min-heap; negate values for max-heap behavior.'],
  ['heap', 2, 'To use heapq as a max-heap, you...', null, ['Pass reverse=True', 'Push the negative of each value', 'Call heapq.maxheapify()', 'Use a different import'], 1, 'There is no max-heap mode; negation is the standard trick.'],
  ['heap', 2, 'heapq.heappush(heap, (time, tweetId)). Comparison order?', null, ['Random', 'tweetId first, then time', 'time first, then tweetId as a tiebreak', 'Only time matters, tweetId ignored'], 2, 'Tuples compare left to right; the first field is the primary sort key.'],
  ['heap', 2, 'Pushing custom objects (not tuples) into a heap requires...', null, ['Nothing extra', 'A __lt__ method so heapq can compare them', 'A __hash__ method', 'Making the class immutable'], 1, 'heapq compares elements directly; without __lt__ it raises a TypeError.'],
  ['heap', 2, 'Running median: self.small is a...', null, ['Min-heap of the larger half', 'Max-heap (via negation) of the smaller half', 'A sorted list', 'Min-heap of the smaller half'], 1, 'small holds the lower half, max on top via negated values.'],
  ['heap', 3, 'addNum rebalances by size: if len(small) > len(large) + 1, you...', null, ['Pop from large, push to small', 'Pop from small, push to large', 'Do nothing', 'Clear both heaps'], 1, 'small is only allowed one extra; the overflow moves to large.'],
  ['heap', 2, 'Median of an odd-sized stream, len(small) == len(large) + 1?', null, ['Average of both tops', "large's top", "small's top (negated back)", 'Always 0'], 2, 'The extra element in small is exactly the middle value.'],
  ['heap', 2, 'Kth largest in a stream: self.heap is a...', null, ['Max-heap of size k', 'Min-heap of size k', 'Sorted array of all elements', 'A max-heap of all elements'], 1, 'A size-k min-heap keeps the k largest; heap[0] is the kth largest.'],
  ['heap', 2, 'Kth largest: why pop when size exceeds k?', null, ['To save memory only', 'To discard the smallest of the current top-k, keeping exactly k', 'Because heapq requires it', 'It never needs to pop'], 1, 'Only the k largest-so-far should remain; the smallest among them leaves first.'],
  ['heap', 3, 'Design Twitter news feed merge, k followees. Per getNewsFeed call, best approach?', null, ['Sort all tweets from all followees every time', "Heap merge: push each followee's newest tweet, pop 10, push their next", 'Only show the most recent followee\'s tweets', 'Store one global sorted list of every tweet ever'], 1, 'A k-way heap merge avoids resorting everything on every call.'],
  ['trie', 1, 'TrieNode.children is typically a...', null, ['Fixed-size array of 26 slots', 'A dict mapping character → TrieNode', 'A linked list of characters', 'A single TrieNode'], 1, 'A dict handles any alphabet or unicode without wasted slots.'],
  ['trie', 2, 'TrieNode.endOfWord is True exactly when...', null, ['Every node in the trie', 'A node is a leaf (no children)', 'That node is the last character of some inserted word', 'The trie is empty'], 2, 'It marks completed words, independent of whether more children exist.'],
  ['trie', 2, 'search("app") walks the path successfully but endOfWord is False there. Result?', null, ['True, the path exists', 'False, "app" was never inserted as a full word', 'An error', 'Depends on startsWith'], 1, 'Prefix existing is not the same as the word being inserted.'],
  ['trie', 2, 'startsWith(prefix) differs from search(word) by...', null, ['Nothing, they are identical', 'startsWith never checks endOfWord; search does', 'startsWith is recursive, search is not', 'startsWith uses a different tree'], 1, 'startsWith only needs the path to exist, not to end a word.'],
  ['trie', 3, 'WordDictionary search("b.d") with "." as wildcard. Implementation?', null, ['Replace . with every letter and call search() 26 times', 'Recursive dfs that, on ".", tries every child at that position', 'Regex match against all inserted words', 'Impossible without storing all words separately'], 1, 'Branching into every child at a "." is the standard trie wildcard pattern.'],
  ['ds-diagnosis', 2, 'Time Based Key-Value Store: get(key, timestamp) with no exact match should return...', null, ['Empty string, or the value with the largest timestamp ≤ given timestamp', 'The very first value ever set', 'An error', 'The most recently set value, period'], 0, 'It wants the latest value at or before the query timestamp, not just the latest overall.'],
  ['ds-diagnosis', 2, 'Why does Time Based Key-Value Store use bisect instead of scanning?', null, ['Scanning is impossible', 'Timestamps are inserted in increasing order per key, so the list is already sorted', 'bisect is required by Python', 'Keys must be sorted too'], 1, 'A sorted list of (timestamp, value) supports O(log n) lookup via binary search.'],
  ['ds-diagnosis', 1, 'Logger Rate Limiter prints a message again only if...', null, ['It has never been seen', 'At least 10 seconds passed since it last printed', 'The timestamp is even', 'Never, once blocked always blocked'], 1, 'A dict tracks last-printed time per message; compare the gap to 10.'],
  ['arrays-hashing', 2, 'Insert Delete GetRandom O(1): remove(val) must avoid...', null, ['Using a hashmap', 'Shifting every element after the removed index', 'Checking if val exists first', 'Returning a boolean'], 1, 'A plain list.remove or del by index is O(n) from the shift.'],
  ['arrays-hashing', 2, 'The swap-with-last removal trick requires tracking...', null, ['Nothing extra', "Each value's current index in a hashmap", 'The original insertion order', 'A second array of booleans'], 1, 'Without the index map you cannot find the value\'s slot in O(1).'],
  ['queue-deque', 2, 'Queue via two stacks: pop() is called repeatedly without any push(). Each pop costs?', null, ['O(n) every time', 'O(1): outbox already has everything flipped from the first pop', 'O(log n)', 'It errors after the first pop'], 1, 'The flip only happens when outbox is empty; later pops just pop outbox.'],
  ['ds-diagnosis', 2, 'Browser History: visit(url) while curr is in the middle of history (after some back() calls) should...', null, ['Append url without changing anything else', 'Truncate everything after curr, then append url and advance curr', 'Insert url right after curr, keeping the old forward pages too', 'Reset curr to 0'], 1, 'A real browser discards forward history the moment you navigate somewhere new.'],
].map(([skill, difficulty, q, code, choices, answer, why], i) => ({ id: `${topicId}:mcq:${i + 1}`, skills: [skill], difficulty, q, ...(code ? { code } : {}), choices, answer, why }))

const mcqs = mcqData

const clozes = [
  {
    title: 'LRU Cache: __init__ fields', skills: ['linked-list', 'ds-diagnosis'],
    code: `def __init__(self, capacity: int):
    self.cap = capacity
    self.cache = [[{}]]
    self.left = Node()
    self.right = Node()
    self.left.next = [[self.right]]
    self.right.prev = [[self.left]]`,
    hint: 'Two sentinels point at each other when the list is empty.',
  },
  {
    title: 'LRU remove(): unlink a node', skills: ['linked-list'],
    code: `def remove(self, node):
    prev, nxt = node.prev, node.next
    prev.next = [[nxt]]
    nxt.prev = [[prev]]`,
  },
  {
    title: 'LRU insert(): splice at the MRU end', skills: ['linked-list'],
    code: `def insert(self, node):
    prev, nxt = self.right.prev, self.right
    prev.next = [[node]]
    node.prev = [[prev]]
    node.next = [[nxt]]
    nxt.prev = [[node]]`,
  },
  {
    title: 'LRU get(): a hit still moves the node', skills: ['linked-list', 'ds-diagnosis'],
    code: `def get(self, key: int) -> int:
    if key not in self.cache:
        return -1
    self.[[remove]](self.cache[key])
    self.[[insert]](self.cache[key])
    return self.cache[key].val`,
  },
  {
    title: 'LRU put(): evict the true LRU', skills: ['linked-list'],
    code: `if len(self.cache) > self.cap:
    lru = self.left.[[next]]
    self.remove(lru)
    del self.cache[lru.key]`,
  },
  {
    title: 'Shared-mutable class attribute bug', skills: ['ds-diagnosis'],
    code: `class Bag:
    def __init__(self):
        self.[[items]] = []

    def add(self, x):
        self.items.append(x)`,
    hint: 'Move the list off the class and onto the instance.',
  },
  {
    title: 'Max-heap via negation: push', skills: ['heap'],
    code: `def addNum(self, num: int) -> None:
    heapq.heappush(self.small, [[-num]])`,
  },
  {
    title: 'Max-heap via negation: read the top back', skills: ['heap'],
    code: `def findMedian(self) -> float:
    if len(self.small) > len(self.large):
        return [[-self.small[0]]]
    return (-self.small[0] + self.large[0]) / 2`,
  },
  {
    title: 'Kth largest in a stream: shrink to size k', skills: ['heap'],
    code: `def __init__(self, k: int, nums: List[int]):
    self.heap = nums
    self.k = k
    heapq.[[heapify]](self.heap)
    while len(self.heap) > k:
        heapq.[[heappop]](self.heap)`,
  },
  {
    title: 'Insert Delete GetRandom: swap-pop removal', skills: ['arrays-hashing'],
    code: `def remove(self, val: int) -> bool:
    if val not in self.indices:
        return False
    index = self.indices[val]
    last = self.values[-1]
    self.values[index] = [[last]]
    self.indices[last] = [[index]]
    self.values.pop()
    del self.indices[val]
    return True`,
  },
  {
    title: "Browser History: clamp, don't special-case", skills: ['ds-diagnosis'],
    code: `def back(self, steps: int) -> str:
    self.curr = [[max]](0, self.curr - steps)
    return self.history[self.curr]

def forward(self, steps: int) -> str:
    self.curr = [[min]](len(self.history) - 1, self.curr + steps)
    return self.history[self.curr]`,
  },
  {
    title: 'Queue via two stacks: lazy flip', skills: ['queue-deque'],
    code: `def moveIfNeeded(self):
    if not self.outbox:
        while self.inbox:
            self.outbox.append(self.inbox.[[pop()]])`,
    hint: 'Popping the inbox stack reverses the order as it lands in outbox.',
  },
].map((cloze, i) => ({ id: `${topicId}:cloze:${i + 1}`, ...cloze }))

const parsons = [
  {
    title: 'LRU Cache: get()', skills: ['linked-list'],
    lines: [
      'def get(self, key: int) -> int:',
      '    if key not in self.cache:',
      '        return -1',
      '    self.remove(self.cache[key])',
      '    self.insert(self.cache[key])',
      '    return self.cache[key].val',
    ],
    distractors: ['    return self.cache[key]', '    self.insert(self.cache[key])'],
  },
  {
    title: 'LRU Cache: put()', skills: ['linked-list'],
    lines: [
      'def put(self, key: int, value: int) -> None:',
      '    if key in self.cache:',
      '        self.remove(self.cache[key])',
      '    self.cache[key] = Node(key, value)',
      '    self.insert(self.cache[key])',
      '    if len(self.cache) > self.cap:',
      '        lru = self.left.next',
      '        self.remove(lru)',
      '        del self.cache[lru.key]',
    ],
    distractors: ['        lru = self.right.prev', '    self.cache[key].val = value'],
  },
  {
    title: 'LRU remove() and insert() helpers', skills: ['linked-list'],
    lines: [
      'def remove(self, node):',
      '    prev, nxt = node.prev, node.next',
      '    prev.next = nxt',
      '    nxt.prev = prev',
      'def insert(self, node):',
      '    prev, nxt = self.right.prev, self.right',
      '    prev.next = node',
      '    node.prev = prev',
      '    node.next = nxt',
      '    nxt.prev = node',
    ],
    distractors: ['    node.prev = nxt', '    self.right.next = node'],
  },
  {
    title: 'Find Median from Data Stream: addNum()', skills: ['heap'],
    lines: [
      'def addNum(self, num: int) -> None:',
      '    heapq.heappush(self.small, -num)',
      '    if self.small and self.large and -self.small[0] > self.large[0]:',
      '        val = heapq.heappop(self.small)',
      '        heapq.heappush(self.large, -val)',
      '    if len(self.small) > len(self.large) + 1:',
      '        val = heapq.heappop(self.small)',
      '        heapq.heappush(self.large, -val)',
      '    if len(self.small) < len(self.large):',
      '        val = heapq.heappop(self.large)',
      '        heapq.heappush(self.small, -val)',
    ],
    distractors: ['    heapq.heappush(self.small, num)'],
  },
  {
    title: 'Min Stack: push()', skills: ['stack'],
    lines: [
      'def push(self, val: int) -> None:',
      '    if self.stack:',
      '        minVal = min(self.stack[-1][1], val)',
      '    else:',
      '        minVal = val',
      '    self.stack.append((val, minVal))',
    ],
    distractors: ['    minVal = min(self.stack[-1], val)'],
  },
  {
    title: 'Kth Largest in a Stream: add()', skills: ['heap'],
    lines: [
      'def add(self, val: int) -> int:',
      '    heapq.heappush(self.heap, val)',
      '    if len(self.heap) > self.k:',
      '        heapq.heappop(self.heap)',
      '    return self.heap[0]',
    ],
    distractors: ['    return self.heap[-1]'],
  },
  {
    title: 'Insert Delete GetRandom O(1): remove()', skills: ['arrays-hashing'],
    lines: [
      'def remove(self, val: int) -> bool:',
      '    if val not in self.indices:',
      '        return False',
      '    index = self.indices[val]',
      '    last = self.values[-1]',
      '    self.values[index] = last',
      '    self.indices[last] = index',
      '    self.values.pop()',
      '    del self.indices[val]',
      '    return True',
    ],
    distractors: ['    self.values.pop(index)'],
  },
  {
    title: 'WordDictionary: wildcard search()', skills: ['trie'],
    lines: [
      '    def dfs(j, node):',
      '        for i in range(j, len(word)):',
      '            c = word[i]',
      "            if c != '.':",
      '                if c not in node.child:',
      '                    return False',
      '                node = node.child[c]',
      '            else:',
      '                for kid in node.child.values():',
      '                    if dfs(i + 1, kid):',
      '                        return True',
      '                return False',
      '        return node.endOfWord',
      '    return dfs(0, self.root)',
    ],
    distractors: ['    return dfs(0, node)'],
  },
  {
    title: 'Browser History: back() and forward()', skills: ['ds-diagnosis'],
    lines: [
      'def back(self, steps: int) -> str:',
      '    self.curr = max(0, self.curr - steps)',
      '    return self.history[self.curr]',
      'def forward(self, steps: int) -> str:',
      '    self.curr = min(len(self.history) - 1, self.curr + steps)',
      '    return self.history[self.curr]',
    ],
    distractors: ['    self.curr = max(0, self.curr + steps)'],
  },
  {
    title: 'Queue via two stacks: pop()', skills: ['queue-deque'],
    lines: [
      'def pop(self) -> int:',
      '    self.moveIfNeeded()',
      '    return self.outbox.pop()',
      'def moveIfNeeded(self):',
      '    if not self.outbox:',
      '        while self.inbox:',
      '            self.outbox.append(self.inbox.pop())',
    ],
    distractors: ['        while self.outbox:'],
  },
].map((parsons, i) => ({ id: `${topicId}:parsons:${i + 1}`, ...parsons }))

const problems = [
  {
    id: `${topicId}:problem:146`, lc: 146, title: 'LRU Cache', difficulty: 'Medium', google: true,
    skills: ['linked-list', 'ds-diagnosis'], pattern: 'Hashmap + doubly linked list', ds: ['hashmap', 'linked-list'],
    constraints: '1 ≤ capacity ≤ 3000, up to 2·10^5 calls', time: 'O(1) per op', space: 'O(capacity)',
    insight: 'Hashmap gives O(1) lookup; a DLL with sentinels gives O(1) reorder and eviction.',
    signals: ['get and put both O(1)', 'evict the least recently used', 'fixed capacity'],
    narration: [
      'Two structures: self.cache maps key to node, a DLL orders nodes by recency.',
      'Sentinels self.left/self.right mean no empty-list special case.',
      'get(): if present, remove then insert at the MRU end, return val.',
      'put(): remove the old node if present, insert the new one, evict self.left.next if over capacity.',
      'O(1) time per call: one hashmap op plus a constant number of pointer rewires.',
    ],
    solution: lruCode,
    traceId: `${topicId}:trace:lru-evict`,
    pitfalls: ["Forgetting to update a node's old neighbors on both sides", 'Not deleting the hashmap entry on eviction', 'Treating an update (existing key) as a no-op for recency'],
  },
  {
    id: `${topicId}:problem:460`, lc: 460, title: 'LFU Cache', difficulty: 'Hard', google: true,
    skills: ['linked-list', 'ds-diagnosis'], pattern: 'Frequency buckets of OrderedDicts', ds: ['hashmap', 'linked-list'],
    constraints: '1 ≤ capacity ≤ 10^4, up to 2·10^5 calls', time: 'O(1) per op', space: 'O(capacity)',
    insight: 'Evict lowest frequency, break ties by recency: a dict of freq → OrderedDict of keys.',
    signals: ['least frequently used', 'ties broken by least recently used', 'O(1) get and put'],
    narration: [
      'Harder cousin of LRU: evict by frequency first, recency second.',
      "self.freqToKeys[f] is an OrderedDict — insertion order gives the recency tiebreak for free.",
      "self.minFreq tracks the bucket to evict from; it bumps whenever a key's old bucket empties.",
      'bump(key) removes it from the old bucket, re-inserts it into bucket freq + 1.',
    ],
    solution: lfuCode,
    pitfalls: ['Forgetting to bump minFreq when the old bucket becomes empty', 'capacity = 0 must reject every put'],
  },
  {
    id: `${topicId}:problem:295`, lc: 295, title: 'Find Median from Data Stream', difficulty: 'Hard', google: true,
    skills: ['heap', 'ds-diagnosis'], pattern: 'Two heaps, max + min', ds: ['heap'],
    constraints: 'up to 5·10^4 calls to addNum, -10^5 ≤ num ≤ 10^5', time: 'O(log n) addNum, O(1) findMedian', space: 'O(n)',
    insight: "Max-heap for the lower half, min-heap for the upper half; tops are the two middle values.",
    signals: ['running median', 'stream of numbers', 'insert plus query the current middle'],
    narration: [
      'self.small: max-heap (negated) of the lower half. self.large: min-heap of the upper half.',
      "addNum: push to small, then rebalance — cross if small's max beats large's min, then fix sizes.",
      'Invariant: len(small) == len(large), or len(small) == len(large) + 1.',
      "findMedian: odd total → small's top; even → average both tops.",
      'O(log n) per insert from the heap ops; O(1) to read the median.',
    ],
    solution: medianCode,
    traceId: `${topicId}:trace:median-two-heaps`,
    pitfalls: ['Forgetting Python heapq is min-only: negate for the max-heap', 'Skipping the cross-rebalance step before the size check'],
  },
  {
    id: `${topicId}:problem:155`, lc: 155, title: 'Min Stack', difficulty: 'Medium', google: true,
    skills: ['stack', 'ds-diagnosis'], pattern: 'Augmented stack', ds: ['stack'],
    constraints: 'up to 3·10^4 calls', time: 'O(1) per op', space: 'O(n)',
    insight: 'Store (val, minSoFar) per entry — the whole object is one list of pairs.',
    signals: ['push, pop, top, getMin all O(1)'],
    narration: [
      'self.stack holds tuples, not bare values: (val, min of everything below and including it).',
      "push: new min is min(current top's min, val) — O(1), no scan.",
      'pop: just drop the top tuple; the min below never depended on it.',
      'getMin: self.stack[-1][1], O(1).',
    ],
    solution: minStackCode,
    traceId: `${topicId}:trace:min-stack`,
    pitfalls: ['Using a separate self.minVal field that breaks on pop (it does not know the PREVIOUS min)'],
  },
  {
    id: `${topicId}:problem:703`, lc: 703, title: 'Kth Largest Element in a Stream', difficulty: 'Easy', google: true,
    skills: ['heap', 'ds-diagnosis'], pattern: 'Size-k min-heap', ds: ['heap'],
    constraints: '1 ≤ k ≤ 10^4, up to 10^4 calls to add', time: 'O(log k) per add', space: 'O(k)',
    insight: 'Keep only the k largest seen so far in a min-heap; its top is the kth largest.',
    signals: ['kth largest', 'stream of values', 'running top-k'],
    narration: [
      'self.heap holds AT MOST k elements, smallest on top.',
      'Constructor: heapify the given nums, then pop down to size k.',
      'add(val): push, then pop if size exceeds k.',
      'Return heap[0] — the smallest of the current top-k is exactly the kth largest overall.',
    ],
    solution: kthLargestCode,
    traceId: `${topicId}:trace:kth-largest`,
    pitfalls: ['Keeping all n elements instead of capping at k (still correct, but O(n log n) not O(n log k))'],
  },
  {
    id: `${topicId}:problem:981`, lc: 981, title: 'Time Based Key-Value Store', difficulty: 'Medium', google: true,
    skills: ['arrays-hashing', 'ds-diagnosis'], pattern: 'Hashmap of sorted lists + binary search', ds: ['hashmap', 'array'],
    constraints: 'up to 2·10^5 calls, timestamps strictly increasing per key in set calls', time: 'O(1) set, O(log n) get', space: 'O(n)',
    insight: 'set() appends are already sorted by timestamp, so get() can bisect instead of scan.',
    signals: ['set and get with a timestamp', 'latest value at or before a time'],
    narration: [
      'self.store: key → list of (timestamp, value), built by append-only set() calls.',
      'Since timestamps only increase per key, the list never needs re-sorting.',
      'get() wants the LATEST value at or before the query time: bisect_right by timestamp.',
      'i == 0 from bisect means nothing exists yet at or before that time: return "".',
    ],
    solution: timeMapCode,
    traceId: `${topicId}:trace:time-map`,
    pitfalls: ['Scanning linearly instead of bisecting (still correct, worse complexity)', 'Off-by-one: using bisect_left instead of bisect_right on a timestamp tie'],
  },
  {
    id: `${topicId}:problem:359`, lc: 359, title: 'Logger Rate Limiter', difficulty: 'Easy', google: true,
    skills: ['arrays-hashing', 'ds-diagnosis'], pattern: 'Hashmap of last-seen time', ds: ['hashmap'],
    constraints: 'timestamps non-decreasing, up to 10^4 calls', time: 'O(1) per call', space: 'O(distinct messages)',
    insight: 'One field per message: the last timestamp it printed. Compare the gap to 10.',
    signals: ['rate limit', 'print again only after N seconds'],
    narration: [
      'self.lastPrinted: message → timestamp it last printed at.',
      'Print (and update) if the message is new, or 10+ seconds passed since its last print.',
      'Otherwise, block it — no update, no print.',
    ],
    solution: loggerCode,
    pitfalls: ['Storing ALL timestamps per message instead of just the last one (wastes memory, not needed)'],
  },
  {
    id: `${topicId}:problem:380`, lc: 380, title: 'Insert Delete GetRandom O(1)', difficulty: 'Medium', google: true,
    skills: ['arrays-hashing', 'ds-diagnosis'], pattern: 'Array + index map, swap-pop removal', ds: ['array', 'hashmap'],
    constraints: 'up to 2·10^5 calls', time: 'O(1) per op', space: 'O(n)',
    insight: 'Removing from an array is O(n) unless you swap the target with the last element first.',
    signals: ['getRandom with uniform probability', 'insert/remove/getRandom all O(1)'],
    narration: [
      'self.values: the actual array, for O(1) random indexing. self.indices: value → its index.',
      'insert: append to values, record its index.',
      'remove: overwrite the target\'s slot with the LAST element, fix that element\'s index, then pop the now-duplicate tail.',
      'getRandom: random.choice(self.values) — O(1), uniform.',
    ],
    solution: randomizedSetCode,
    traceId: `${topicId}:trace:randomized-set`,
    pitfalls: ['Removing with list.remove(val) or del values[i] — both O(n)', 'Forgetting to update self.indices[last] after the swap'],
  },
  {
    id: `${topicId}:problem:208`, lc: 208, title: 'Implement Trie (Prefix Tree)', difficulty: 'Medium', google: true,
    skills: ['trie', 'ds-diagnosis'], pattern: 'Nested TrieNode objects', ds: ['trie'],
    constraints: 'up to 3·10^4 calls, words/prefixes up to length 2000, lowercase only', time: 'O(L) per op', space: 'O(total characters)',
    insight: 'Each node is its own tiny object: a dict of children plus one endOfWord flag.',
    signals: ['prefix tree', 'startsWith', 'many words sharing prefixes'],
    narration: [
      'TrieNode: self.children (dict char → TrieNode), self.endOfWord (bool).',
      'insert: walk/create a child per character, then mark the last node endOfWord = True.',
      'search: walk the same way, but return False immediately if any character is missing — and check endOfWord at the end.',
      'startsWith: identical walk, but skip the endOfWord check.',
    ],
    solution: prefixTreeCode,
    traceId: `${topicId}:trace:trie`,
    pitfalls: ['Confusing "path exists" with "word was inserted" — only endOfWord proves the latter'],
  },
  {
    id: `${topicId}:problem:211`, lc: 211, title: 'Design Add and Search Words Data Structure', difficulty: 'Medium', google: true,
    skills: ['trie', 'ds-diagnosis'], pattern: 'Trie + DFS for wildcards', ds: ['trie'],
    constraints: 'up to 5·10^4 addWord/search calls, word length ≤ 500', time: 'O(L) addWord, O(26^L) worst-case search', space: 'O(total characters)',
    insight: 'Same trie as always, but "." forces a DFS that tries every child at that position.',
    signals: ['wildcard character .', 'matches any letter at that position'],
    narration: [
      'Same TrieNode shape as a plain trie.',
      'addWord: identical to trie insert.',
      'search uses a nested dfs(i, node): on a normal letter, follow one child; on ".", try EVERY child and recurse.',
      'Base case: reached the end of the word — return node.endOfWord.',
    ],
    solution: wordDictionaryCode,
    pitfalls: ["Forgetting dfs needs its own node parameter — reusing self.root breaks the recursion", 'Not returning False promptly when a literal character is missing'],
  },
  {
    id: `${topicId}:problem:1472`, lc: 1472, title: 'Design Browser History', difficulty: 'Medium', google: true,
    skills: ['arrays-hashing', 'ds-diagnosis'], pattern: 'Array tape + current index', ds: ['array'],
    constraints: 'up to 5000 calls, URL length ≤ 20', time: 'O(1) back/forward, O(n) worst-case visit', space: 'O(n)',
    insight: 'One list is the whole history; self.curr is just a position in it.',
    signals: ['visit, back, forward', 'forward history disappears after a new visit'],
    narration: [
      'self.history: every page ever visited, in order. self.curr: the index being viewed.',
      'visit(url): truncate everything after curr (kills the forward stack), append, advance curr.',
      'back(steps): clamp curr down with max(0, ...).',
      'forward(steps): clamp curr up with min(len - 1, ...).',
    ],
    solution: browserHistoryCode,
    traceId: `${topicId}:trace:browser-history`,
    pitfalls: ['Not truncating on visit — leaves stale forward pages reachable after a new visit'],
  },
  {
    id: `${topicId}:problem:232`, lc: 232, title: 'Implement Queue using Stacks', difficulty: 'Easy', google: true,
    skills: ['stack', 'queue-deque', 'ds-diagnosis'], pattern: 'Two stacks, lazy flip', ds: ['stack'],
    constraints: 'up to 100 calls', time: 'O(1) push, amortized O(1) pop/peek', space: 'O(n)',
    insight: 'Flipping one stack onto another reverses it once — LIFO reversed is FIFO.',
    signals: ['queue behavior, stacks only allowed'],
    narration: [
      'self.inbox: where push() always lands. self.outbox: where pop()/peek() read from.',
      'moveIfNeeded: only flips inbox → outbox when outbox is empty.',
      'Each element crosses inbox → outbox exactly once in its lifetime: amortized O(1).',
    ],
    solution: queueViaStacksCode,
    traceId: `${topicId}:trace:queue-via-stacks`,
    pitfalls: ['Flipping on every pop instead of only when outbox is empty — correct, but O(n) every call'],
  },
  {
    id: `${topicId}:problem:355`, lc: 355, title: 'Design Twitter', difficulty: 'Medium', google: true,
    skills: ['heap', 'ds-diagnosis'], pattern: 'Per-user tweet lists + k-way heap merge', ds: ['heap', 'hashmap'],
    constraints: 'up to 3·10^4 calls, feed size ≤ 10', time: 'O(log(followees)) per feed entry', space: 'O(tweets + follows)',
    insight: "Merge each followed user's newest tweet with a heap, like merging k sorted lists.",
    signals: ['news feed of the 10 most recent tweets among people you follow'],
    narration: [
      'self.tweets: userId → list of (time, tweetId); self.time is a decreasing counter so smaller = newer.',
      'self.following: userId → set of followees.',
      "getNewsFeed: push each followee's (plus your own) newest tweet, pop the smallest (newest) up to 10 times, pushing each user's next tweet after theirs is popped.",
      'This is exactly a k-way merge of sorted (by time) lists, one per followee.',
    ],
    solution: twitterCode,
    pitfalls: ['Re-sorting ALL tweets on every getNewsFeed call instead of merging just the next candidate per user'],
  },
].sort((a, b) => a.lc - b.lc)

export default {
  id: topicId,
  title: 'OOP & Design',
  icon: 'layers',
  skills: ['arrays-hashing', 'linked-list', 'heap', 'stack', 'queue-deque', 'trie', 'bst', 'ds-diagnosis', 'complexity', 'communication'],
  lessons,
  traces,
  flashcards,
  mcqs,
  clozes,
  parsons,
  problems,
}
