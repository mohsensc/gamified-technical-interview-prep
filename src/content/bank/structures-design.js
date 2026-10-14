const rotate = (choices, answer, shift) => {
  const n = choices.length
  const rotated = choices.map((_, j) => choices[(j + shift) % n])
  return { choices: rotated, answer: ((answer - shift) % n + n) % n }
}

const designRows = [
  ['ds-diagnosis', 2, 'LRU Cache (get/put in O(1), evict least recently used): why a hashmap ALONE is not enough?', null, ['A hashmap cannot store values', 'A hashmap gives O(1) lookup but has no notion of recency order, so eviction would need an O(n) scan', 'Hashmaps are too slow in Python', 'It needs sorting instead'], 1, 'Order (who was used least recently) is exactly what a plain hashmap cannot track; a doubly linked list supplies that.'],
  ['linked-list', 2, 'LRU Cache: why does get() on a hit still mutate the doubly linked list?', null, ['It should not, get() should be read-only', 'Reading a key still counts as "using" it, so the node must move to the most-recently-used end', 'To free memory', 'To resize the hashmap'], 1, 'The recency order must reflect every access, not just writes.'],
  ['ds-diagnosis', 3, 'LFU Cache (evict least frequently used; ties broken by least recently used): three fields needed, besides capacity?', null, ['Just one dict of key -> value', 'keyToVal, keyToFreq, and freqToKeys (an OrderedDict per frequency bucket), plus a running minFreq', 'A single sorted list of (freq, key)', 'A heap of (freq, key) only'], 1, 'Bucketing keys by frequency, with insertion order preserved inside each bucket, gives O(1) access to "the LRU key at the current minimum frequency."'],
  ['ds-diagnosis', 2, 'LFU Cache: why track minFreq as its own field instead of scanning for the minimum each time?', null, ['Scanning is actually required anyway', 'Scanning every key\'s frequency would be O(n) per operation, breaking the O(1) requirement', 'minFreq is only cosmetic', 'Python has no way to scan a dict'], 1, 'Maintaining minFreq incrementally (it only decreases to 1 on insert, or increases by exactly one when the bucket empties) keeps every operation O(1).'],
  ['heap', 2, 'Design Twitter (getNewsFeed returns the 10 most recent tweets among a user and everyone they follow): core technique?', null, ['Sort all tweets ever posted every time', 'A heap merging the most recent tweet from each followed user (and self), repeatedly popping the newest and pushing that user\'s next tweet', 'A trie of tweet text', 'A union-find of followers'], 1, 'This is the "merge k sorted lists" pattern: each followee contributes a sorted-by-time stream, merged lazily with a heap.'],
  ['ds-diagnosis', 2, 'Flatten Nested List Iterator (a list can contain integers or further nested lists): hasNext() typically needs to…', null, ['Do nothing, just check an index', 'Pre-flatten: if the top of the internal stack is a nested list, pop it and push its contents until an integer is on top (or the stack is empty)', 'Flatten the entire structure upfront into an array always', 'Reverse the whole structure'], 1, "Lazy flattening processes only what's needed to answer the next hasNext()/next() call, not the whole structure at once."],
  ['ds-diagnosis', 2, 'Peeking Iterator (wraps an existing Iterator with a peek() that does not consume): implementation idea?', null, ['peek() just calls next() twice', 'Cache the next value in a buffer the first time peek() or next() needs it; next() returns and clears the buffer if set, otherwise calls the underlying iterator', 'It is impossible without modifying the original iterator', 'Store the entire sequence in a list first'], 1, 'A one-slot lookahead buffer is the standard trick: peek() fills it without advancing logically, next() drains it.'],
  ['ds-diagnosis', 2, 'Insert Delete GetRandom O(1): why pair a list with a hashmap (value -> index)?', null, ['The list alone gives O(1) random access by VALUE and the hashmap is unused', "The list gives O(1) getRandom() via random index; the hashmap gives O(1) lookup of a value's position for O(1) delete", 'Neither structure is actually needed', 'A set alone is sufficient since it supports random.choice in O(1)'], 1, 'random.choice needs O(1) indexed access (the list); removing an arbitrary value in O(1) needs to know its index first (the hashmap).'],
  ['ds-diagnosis', 2, 'Insert Delete GetRandom O(1): the standard O(1) delete trick for an arbitrary value inside a plain Python list?', null, ['list.remove(val): already O(1)', 'Swap the target with the LAST element, update the hashmap for the moved element, then pop() the now-last slot', 'Shift every element after it left by one', 'Rebuild the list from scratch'], 1, 'Removing from the middle is normally O(n); swapping with the last element turns it into an O(1) pop, as long as order does not matter.'],
  ['ds-diagnosis', 2, 'Design HashMap from scratch (no built-in dict allowed): standard approach?', null, ['A single Python list indexed by the raw key', 'An array of buckets, each a small list (or linked list) of (key, value) pairs; hash the key, mod by bucket count, then scan that bucket', 'A binary search tree keyed by hash value', 'A trie of key characters'], 1, 'This is literally how hash tables are built: hash + modulo to pick a bucket, then linear scan (chaining) within that bucket to resolve collisions.'],
  ['ds-diagnosis', 1, 'Design Circular Queue (fixed capacity, wraps around): enqueue\'s index update?', null, ['tail += 1 always', 'tail = (tail + 1) % capacity, tracked alongside a count (or a head/tail-equal-means-empty convention)', 'tail is never updated', 'Requires shifting every element'], 1, 'Modulo arithmetic on a fixed array lets the queue wrap around without ever shifting elements.'],
  ['ds-diagnosis', 2, 'Snapshot Array (snap() returns a snapshot id; get(index, snapId) returns the value at that index as of that snapshot): why is snap() O(1) despite there being "n" values to remember?', null, ['It actually is not O(1), it is O(n)', 'snap() just increments a counter; each index lazily records (snapId, value) pairs only when SET is called, not on every snap', 'It copies the whole array every time', 'It uses a trie internally'], 1, "Lazy snapshotting: don't copy anything at snap() time, just remember which snapshot id is \"current\" and let set() append history per index."],
  ['ds-diagnosis', 2, 'Snapshot Array: get(index, snapId) with a per-index list of (snapId, value) pairs — correct lookup?', null, ['Linear scan from the front, O(m)', 'Binary search (bisect) for the rightmost entry whose snapId <= the query snapId, O(log m)', 'Always return the last entry', 'Always return the first entry'], 1, "Entries are appended in increasing snapId order, so bisect finds the most recent value AS OF that snapshot in O(log m)."],
  ['ds-diagnosis', 2, 'Time Based Key-Value Store (set(key, value, timestamp) with strictly increasing timestamps per key; get(key, timestamp) wants the value at or before that time): correct lookup strategy?', null, ['Linear scan through all (timestamp, value) pairs for that key', 'Binary search (bisect_right) over the key\'s list of (timestamp, value) pairs, since timestamps only increase', 'Re-sort the list on every get()', 'A hashmap keyed by timestamp directly, ignoring "at or before"'], 1, "Timestamps arrive sorted per key, so bisect finds the latest entry not exceeding the query timestamp in O(log m)."],
  ['ds-diagnosis', 2, "Design Underground System (average travel time between any two stations): what must be tracked per IN-PROGRESS check-in?", null, ['Nothing, only completed trips matter', "Each traveler's (startStation, checkInTime), looked up again at checkOut to compute that trip's duration", 'A global clock only', 'The traveler\'s name and nothing else'], 1, "checkOut needs to pair with the matching checkIn to compute one trip's duration, then that duration feeds into a running (totalTime, count) per (start, end) station pair."],
  ['communication', 2, 'All O`one Data Structure (Inc/Dec/GetMaxKey/GetMinKey must ALL be O(1)): what structure handles this?', null, ['A single sorted dict, re-sorted on every change', 'A doubly linked list of frequency "buckets" (each holding the set of keys at that count), plus a hashmap from key to its bucket node', 'A heap of (count, key) pairs', 'A trie of key strings'], 1, "Buckets ordered by count let GetMax/GetMinKey just peek the head/tail bucket, while a key's own bucket node is found instantly via the hashmap — all O(1)."],
  ['communication', 2, 'General design-interview flow, after clarifying the API: what comes BEFORE writing any method body?', null, ['Write the hardest method first', 'Write the target complexity for every operation, then the class skeleton (fields in __init__ and every method stubbed)', 'Jump straight into the trickiest edge case', 'Write test cases only'], 1, 'The complexity targets dictate which fields and structures __init__ needs; writing those down first prevents a redesign mid-interview.'],
  ['ds-diagnosis', 2, 'Which of these design problems does NOT naturally want a doubly linked list?', null, ['LRU Cache', 'LFU Cache (per frequency bucket, via OrderedDict)', 'Insert Delete GetRandom O(1)', 'All O`one Data Structure'], 2, 'Insert Delete GetRandom O(1) wants O(1) random indexed access (an array) plus a hashmap, not ordered recency.'],
  ['ds-diagnosis', 2, 'Which structure is the right fit for "O(1) median of a growing stream, O(log n) insert"?', null, ['Two heaps (max-heap for the lower half, min-heap for the upper half)', 'A single sorted list, re-sorted on every insert', 'A trie', 'A union-find structure'], 0, 'Two heaps split the stream at the median, each top giving instant access to the middle value(s).'],
  ['ds-diagnosis', 2, 'Which structure fits "given a stream of (key, value) pairs with increasing timestamps, answer value-as-of-time queries"?', null, ['A heap keyed by timestamp', 'A hashmap of key -> list of (timestamp, value), queried with binary search', 'A union-find over keys', 'A monotonic stack'], 1, "Binary search over a naturally sorted-by-time list per key answers 'latest value at or before T' in O(log m)."],
  ['ds-diagnosis', 3, 'Picking a structure for "frequent inserts/removals of arbitrary elements, need O(1) random uniform pick among CURRENT elements"?', null, ['A heap', 'An array + hashmap(value -> index), using swap-with-last for O(1) removal', 'A balanced BST', 'A linked list'], 1, 'The array gives random.choice in O(1); the hashmap resolves arbitrary removal to a known index for the swap-and-pop trick.'],
  ['communication', 1, 'A design problem names a concrete built-in (e.g. "you may use OrderedDict"). Best interview move?', null, ['Only use the built-in, never explain the mechanism underneath', 'Name the built-in to show awareness, then still build the underlying mechanism (e.g. hashmap + doubly linked list) by hand, since that is usually the actual skill being tested', 'Refuse to use any built-ins at all, even sets or dicts', 'Ask to skip the problem'], 1, 'Interviewers usually want to see you understand WHY the built-in works, not just that you can call it.'],
  ['ds-diagnosis', 2, 'Design Hit Counter vs Design Underground System: what do both share structurally?', null, ['Both need a trie', 'Both key state by an identifier (timestamp window, or traveler id) and aggregate results keyed by a second identifier (time window, or station pair)', 'Both need a heap', 'Neither needs a hashmap'], 1, 'Both are "track per-event state, then aggregate by a derived key" problems best solved with hashmaps (plus a queue for the hit counter\'s expiry).'],
  ['ds-diagnosis', 2, 'Why does BST Iterator (next()/hasNext() over a BST, O(1) amortized, O(h) memory) avoid flattening the whole tree into a list upfront?', null, ['Flattening upfront is actually required', 'Flattening costs O(n) memory even if next() is only called once or twice; the controlled-stack approach only pays for work actually done', 'It is not possible to flatten a BST', 'Memory does not matter for this problem'], 1, "If the caller stops early, lazy traversal (explicit stack over just the left spine) never does more work than requested."],
  ['ds-diagnosis', 2, 'Design Circular Deque differs from Design Circular Queue in supporting…', null, ['Only insertion at the front', 'Insertion and deletion at BOTH the front and the back, still in a fixed-size array with modulo arithmetic', 'Sorting on insert', 'Unlimited capacity'], 1, 'Both ends become accessible, same fixed-array + modulo-index approach, just with two more operations.'],
]

const oopRows = [
  ['ds-diagnosis', 1, 'Mutable default argument bug: `def __init__(self, items=[]): self.items = items`. Why is this dangerous?', null, ['It never causes any issue', "The default list is created ONCE at function definition time and shared across every instance that omits the argument", 'Python forbids this syntax', 'It only affects static methods'], 1, 'Two separate objects relying on the default both end up sharing and mutating the SAME underlying list.'],
  ['ds-diagnosis', 1, 'Fix for the mutable default argument bug?', null, ['Use items=() instead, same problem', 'items=None in the signature, then `self.items = items if items is not None else []` inside __init__', 'Make items a class attribute', 'There is no fix'], 1, 'None is immutable and safe as a default; a fresh list is built inside the call when needed.'],
  ['ds-diagnosis', 2, '`class Bad: seen = []` (defined OUTSIDE __init__, directly under the class). Two Bad() instances append to self.seen. Result?', null, ['Each instance has its own independent list', 'Both instances see the SAME shared list, since seen is a class attribute, not an instance attribute', 'A TypeError is raised', 'Appending to self.seen always fails'], 1, "Attributes declared directly in the class body (not inside __init__ via self.x) are shared by every instance unless overridden."],
  ['ds-diagnosis', 2, 'Silent shadowing bug: inside `def put(self, key, value): cache = {}` (meant to update self.cache). What actually happens?', null, ['self.cache gets updated correctly', 'A brand-new LOCAL variable named cache is created; self.cache is untouched, with no error raised', 'A NameError is raised immediately', 'Python auto-detects the missing self. and fixes it'], 1, 'Forgetting `self.` just creates an ordinary local variable — Python never flags this as a mistake.'],
  ['ds-diagnosis', 1, '__repr__ vs __str__: which one does print(obj) use first?', null, ['print() always uses __repr__', "print() calls __str__ if defined, falling back to __repr__ if __str__ isn't defined", 'Both are called and concatenated', 'Neither is used by print()'], 1, "str() (and print) prefers __str__; if only __repr__ exists, that is used as the fallback for both."],
  ['ds-diagnosis', 2, '@staticmethod vs @classmethod vs a normal instance method: key difference in their first parameter?', null, ['All three always receive self first', 'Instance method receives self (the instance); classmethod receives cls (the class); staticmethod receives neither', 'staticmethod receives self, classmethod receives nothing', 'There is no difference, they are interchangeable'], 1, "Instance methods operate on a specific object; classmethods operate on the class itself (useful for alternate constructors); staticmethods are just namespaced functions."],
  ['ds-diagnosis', 2, 'Composition ("has-a") vs inheritance ("is-a") for LRUCache and its Node class: which relationship is this?', null, ['Inheritance: LRUCache IS-A Node', 'Composition: LRUCache HAS Node objects as internal building blocks, with no inheritance relationship', 'Multiple inheritance', 'Neither applies to design problems'], 1, 'LRUCache is not a kind of Node; it merely contains and manages Node instances internally — that is composition.'],
  ['ds-diagnosis', 2, 'Pushing custom Task objects into a heapq without implementing __lt__. Result?', null, ['Works fine, heapq compares object ids', 'TypeError when heapq tries to compare two Task instances on a tie (or any comparison), since Python objects are not orderable by default', 'heapq silently ignores ordering', 'It sorts by memory address successfully'], 1, 'heapq relies on `<` comparisons; without __lt__ (or pushing plain tuples instead), comparing two custom objects raises a TypeError.'],
  ['ds-diagnosis', 1, '@dataclass on a plain data-holder class auto-generates which of these?', null, ['Only __init__', '__init__, __repr__, and __eq__ (based on the declared fields), by default', 'Only __eq__', 'Nothing, it is purely a type hint'], 1, 'dataclass removes the usual boilerplate of writing __init__/__repr__/__eq__ by hand for simple field-holding classes.'],
  ['communication', 1, 'A leading single underscore, like self._cache, signals what convention in Python?', null, ['True enforced privacy, like a private keyword', '"Internal use, not part of the public API" by convention only — Python does not actually block access to it', 'A syntax error', 'It makes the attribute a class attribute'], 1, "Python has no true access modifiers; a single underscore is a documented convention, not an enforced restriction (double-underscore name-mangles, but is still reachable)."],
]

const mcqs = designRows.map(([skill, difficulty, q, code, choices, answer, why], i) => {
  const shift = (i * 2 + 1) % choices.length
  return { id: `bank-structures:mcq:design:${i + 1}`, skills: [skill], difficulty, q, ...(code ? { code } : {}), ...rotate(choices, answer, shift), why }
})

const oopMcqs = oopRows.map(([skill, difficulty, q, code, choices, answer, why], i) => {
  const shift = (i * 2 + 1) % choices.length
  return { id: `bank-structures:mcq:oop:${i + 1}`, skills: [skill], difficulty, q, ...(code ? { code } : {}), ...rotate(choices, answer, shift), why }
})

const clozes = [
  { id: 'bank-structures:cloze:design:1', skills: ['ds-diagnosis'], title: 'Insert Delete GetRandom O(1)', code: `class RandomizedSet:
    def __init__(self):
        self.values = []
        self.indices = {}

    def insert(self, val: int) -> bool:
        if val in self.indices:
            return False
        self.indices[val] = len(self.values)
        self.values.[[append]](val)
        return True

    def remove(self, val: int) -> bool:
        if val not in self.indices:
            return False
        index = self.indices[val]
        last = self.values[-1]
        self.values[index] = [[last]]
        self.indices[last] = [[index]]
        self.values.pop()
        del self.indices[val]
        return True

    def getRandom(self) -> int:
        return random.[[choice]](self.values)` },
  { id: 'bank-structures:cloze:design:2', skills: ['ds-diagnosis'], title: 'Design Circular Queue', code: `class MyCircularQueue:
    def __init__(self, k: int):
        self.data = [0] * k
        self.capacity = k
        self.head = 0
        self.count = 0

    def enQueue(self, value: int) -> bool:
        if self.count == self.capacity:
            return False
        self.data[(self.head + self.count) % self.capacity] = value
        self.count += [[1]]
        return True

    def deQueue(self) -> bool:
        if self.count == 0:
            return False
        self.head = (self.head + 1) % [[self.capacity]]
        self.count -= 1
        return True` },
  { id: 'bank-structures:cloze:design:3', skills: ['ds-diagnosis'], title: 'Time Based Key-Value Store', code: `from collections import defaultdict as dd
import bisect

class TimeMap:
    def __init__(self):
        self.store = dd(list)

    def set(self, key, value, timestamp):
        self.store[key].append(([[timestamp]], value))

    def get(self, key, timestamp):
        values = self.store[key]
        i = bisect.[[bisect_right]](values, (timestamp, chr(127)))
        if i == 0:
            return ''
        return [[values[i - 1][1]]]` },
  { id: 'bank-structures:cloze:design:4', skills: ['heap'], title: 'Design Twitter (merge news feed with a heap)', code: `def getNewsFeed(self, userId: int):
    heap = []

    for user in self.following[userId] | {userId}:
        if self.tweets[user]:
            index = len(self.tweets[user]) - 1
            time, tweetId = self.tweets[user][index]
            heapq.heappush(heap, (time, tweetId, user, index - [[1]]))

    result = []
    while heap and len(result) < [[10]]:
        time, tweetId, user, index = heapq.[[heappop]](heap)
        result.append(tweetId)
        if index >= 0:
            nextTime, nextTweetId = self.tweets[user][index]
            heapq.heappush(heap, (nextTime, nextTweetId, user, index - 1))

    return result` },
  { id: 'bank-structures:cloze:oop:1', skills: ['ds-diagnosis'], title: 'Fixing a mutable default argument', code: `class Bag:
    def __init__(self, items=[[None]]):
        self.items = items if items is not None else [[[]]]` },
  { id: 'bank-structures:cloze:design:5', skills: ['ds-diagnosis'], title: 'Design HashMap (bucket + chaining)', code: `class MyHashMap:
    def __init__(self):
        self.buckets = 1000
        self.table = [[] for _ in range(self.buckets)]

    def hash(self, key: int) -> int:
        return key % [[self.buckets]]

    def put(self, key: int, value: int) -> None:
        bucket = self.table[self.hash(key)]
        for i, (k, v) in enumerate(bucket):
            if k == key:
                bucket[i] = (key, [[value]])
                return
        bucket.[[append]]((key, value))

    def get(self, key: int) -> int:
        bucket = self.table[self.hash(key)]
        for k, v in bucket:
            if k == key:
                return [[v]]
        return -1` },
]

const parsons = [
  { id: 'bank-structures:parsons:design:1', skills: ['ds-diagnosis'], title: 'Insert Delete GetRandom O(1), remove()', lines: [
    'def remove(self, val):',
    '    if val not in self.indices:',
    '        return False',
    '    index = self.indices[val]',
    '    last = self.values[-1]',
    '    self.values[index] = last',
    '    self.indices[last] = index',
    '    self.values.pop()',
    '    del self.indices[val]',
    '    return True',
  ], distractors: ['    self.values.pop(index)'] },
  { id: 'bank-structures:parsons:design:2', skills: ['ds-diagnosis'], title: 'Design Circular Queue enQueue/deQueue', lines: [
    'def enQueue(self, value):',
    '    if self.count == self.capacity:',
    '        return False',
    '    self.data[(self.head + self.count) % self.capacity] = value',
    '    self.count += 1',
    '    return True',
    'def deQueue(self):',
    '    if self.count == 0:',
    '        return False',
    '    self.head = (self.head + 1) % self.capacity',
    '    self.count -= 1',
    '    return True',
  ], distractors: ['    self.head = (self.head - 1) % self.capacity'] },
  { id: 'bank-structures:parsons:oop:1', skills: ['ds-diagnosis'], title: 'LFU Cache bump() helper', lines: [
    'def bump(self, key):',
    '    freq = self.keyToFreq[key]',
    '    del self.freqToKeys[freq][key]',
    '    if not self.freqToKeys[freq] and freq == self.minFreq:',
    '        self.minFreq += 1',
    '    self.keyToFreq[key] = freq + 1',
    '    self.freqToKeys[freq + 1][key] = None',
  ], distractors: ['        self.minFreq -= 1'] },
]

const cardData = [
  ['ds-diagnosis', 'LRU Cache core idea', 'Hashmap (key -> node) for O(1) lookup, plus a doubly linked list for O(1) recency reordering and eviction.'],
  ['ds-diagnosis', 'LFU Cache core idea', 'keyToVal, keyToFreq, and freqToKeys (OrderedDict per frequency), plus a minFreq field updated incrementally, never by scanning.'],
  ['heap', 'Design Twitter news feed', 'Merge-k-sorted-streams pattern: a heap of each followee\'s newest unconsumed tweet, repeatedly popping the newest overall.'],
  ['ds-diagnosis', 'Flatten Nested List Iterator', 'Lazy flattening: hasNext() pops nested lists off a stack and pushes their contents until an integer sits on top.'],
  ['ds-diagnosis', 'Peeking Iterator pattern', 'A one-slot lookahead buffer: fill it on first peek/next, drain it on next(), refill from the underlying iterator as needed.'],
  ['ds-diagnosis', 'Insert Delete GetRandom O(1) trick', 'Array + hashmap(value -> index). Delete by swapping the target with the last element, then popping — avoids shifting.'],
  ['ds-diagnosis', 'Design HashMap from scratch', 'Bucket array, each bucket a small chain of (key, value) pairs; hash the key, mod by bucket count, scan the bucket for collisions.'],
  ['ds-diagnosis', 'Snapshot Array laziness', 'snap() just increments a counter in O(1); set() appends (snapId, value) per index; get() binary-searches that index\'s history.'],
  ['ds-diagnosis', 'Time Based Key-Value Store', 'Per-key list of (timestamp, value), naturally sorted since timestamps increase; get() uses bisect_right for "value as of time T".'],
  ['communication', 'All O`one Data Structure shape', 'Doubly linked list of count "buckets" (each a set of keys), plus a hashmap key -> bucket node, so max/min/inc/dec are all O(1).'],
  ['ds-diagnosis', 'Mutable default argument trap', 'A mutable default (e.g. []) is created once at def-time and shared across every call that omits the argument — use None instead.'],
  ['ds-diagnosis', 'Class attribute vs self.attribute', 'Attributes set directly in the class body are shared across every instance; put mutable state in __init__ as self.x instead.'],
  ['ds-diagnosis', 'Design HashMap bucket + chaining', 'Fixed array of buckets, each a short list of (key, value) pairs. hash(key) picks the bucket; linear scan resolves collisions within it.'],
  ['ds-diagnosis', 'Design Circular Queue state', 'Fixed array, a head index, and a count — enqueue/dequeue just move head by one (mod capacity) and adjust count, no shifting.'],
]

const flashcards = cardData.map(([skill, front, back, code], i) => ({ id: `bank-structures:card:design:${i + 1}`, skills: [skill], front, back, ...(code ? { code } : {}) }))

const problems = [
  {
    id: 'bank-structures:problem:341', lc: 341, title: 'Flatten Nested List Iterator', difficulty: 'Medium',
    skills: ['ds-diagnosis'], pattern: 'Lazy stack flattening', ds: ['stack'],
    constraints: '1 <= nestedList.length <= 1000', time: 'O(1) amortized per next/hasNext', space: 'O(d) for max nesting depth d',
    insight: 'Flattening everything upfront wastes work if the caller stops early; a stack lets hasNext() unwrap just enough.',
    signals: ['nested list of integers and lists', 'iterator interface: next/hasNext'],
    narration: ['A recursive flatten-to-array is simplest but does O(n) work even for one next() call.', 'Instead, keep a stack of remaining items; hasNext() pops nested lists and pushes their contents until an int is on top.', 'next() just pops that int.', 'Amortized O(1) per call since each element is pushed and popped once overall.'],
    solution: `class NestedIterator:
    def __init__(self, nestedList: List[NestedInteger]):
        self.stack = list(reversed(nestedList))

    def next(self) -> int:
        self.hasNext()
        return self.stack.pop().getInteger()

    def hasNext(self) -> bool:
        while self.stack:
            top = self.stack[-1]
            if top.isInteger():
                return True
            self.stack.pop()
            self.stack.extend(reversed(top.getList()))
        return False`,
    companies: ['google', 'meta', 'amazon'],
    pitfalls: ['hasNext() must do the unwrapping work, since next() alone cannot peek past a nested list'],
  },
  {
    id: 'bank-structures:problem:284', lc: 284, title: 'Peeking Iterator', difficulty: 'Medium',
    skills: ['ds-diagnosis'], pattern: 'One-slot lookahead buffer', ds: ['hashmap'],
    constraints: 'Wraps an existing Iterator interface (next, hasNext)', time: 'O(1) per operation', space: 'O(1) extra',
    insight: 'peek() must not consume the underlying iterator, so cache the next value the first time anyone asks.',
    signals: ['add a peek() on top of an existing iterator', 'cannot modify the underlying iterator class'],
    narration: ['Wrap the given Iterator, holding one cached "next value" slot.', 'peek() fills the cache if empty, then returns it without advancing further.', 'next() returns the cached value if present (clearing it), else pulls fresh from the underlying iterator.'],
    solution: `class PeekingIterator:
    def __init__(self, iterator):
        self.iterator = iterator
        self.cached = None
        self.hasCached = False

    def peek(self) -> int:
        if not self.hasCached:
            self.cached = self.iterator.next()
            self.hasCached = True
        return self.cached

    def next(self) -> int:
        if self.hasCached:
            self.hasCached = False
            return self.cached
        return self.iterator.next()

    def hasNext(self) -> bool:
        return self.hasCached or self.iterator.hasNext()`,
    companies: ['google', 'meta'],
    pitfalls: ['Forgetting to check the cache first in both next() and hasNext()'],
  },
  {
    id: 'bank-structures:problem:706', lc: 706, title: 'Design HashMap', difficulty: 'Easy',
    skills: ['ds-diagnosis'], pattern: 'Bucket array with chaining', ds: ['array', 'linked-list'],
    constraints: '0 <= key, value <= 10^6, at most 10^4 calls', time: 'O(1) average per op', space: 'O(n)',
    insight: 'Reimplementing what dict does internally: hash + modulo picks a bucket, then a short chain resolves collisions.',
    signals: ['implement a hashmap without using dict/map built-ins'],
    narration: ['Fix a bucket count (e.g. 1000) and hash a key with key % bucketCount.', 'Each bucket is a small list of (key, value) pairs.', 'put/get/remove scan only that one bucket, O(1) average if buckets stay small.'],
    solution: `class MyHashMap:
    def __init__(self):
        self.buckets = 1000
        self.table = [[] for _ in range(self.buckets)]

    def hash(self, key: int) -> int:
        return key % self.buckets

    def put(self, key: int, value: int) -> None:
        bucket = self.table[self.hash(key)]
        for i, (k, v) in enumerate(bucket):
            if k == key:
                bucket[i] = (key, value)
                return
        bucket.append((key, value))

    def get(self, key: int) -> int:
        bucket = self.table[self.hash(key)]
        for k, v in bucket:
            if k == key:
                return v
        return -1

    def remove(self, key: int) -> None:
        bucket = self.table[self.hash(key)]
        for i, (k, v) in enumerate(bucket):
            if k == key:
                bucket.pop(i)
                return`,
    companies: ['amazon', 'google'],
    pitfalls: ['Forgetting to overwrite an existing key in put(), instead appending a duplicate'],
  },
  {
    id: 'bank-structures:problem:622', lc: 622, title: 'Design Circular Queue', difficulty: 'Medium',
    skills: ['ds-diagnosis'], pattern: 'Fixed array with modulo indices', ds: ['array'],
    constraints: '1 <= k <= 1000, at most 3000 calls', time: 'O(1) per op', space: 'O(k)',
    insight: 'A plain list with pop(0) is O(n); a fixed array plus modulo arithmetic wraps around in O(1).',
    signals: ['fixed-capacity queue', 'wrap around to the front once full'],
    narration: ['Keep a fixed-size array, a head index, and a count (avoids ambiguity between full and empty).', 'enQueue writes at (head + count) % capacity.', 'deQueue advances head by one (mod capacity) and decrements count.'],
    solution: `class MyCircularQueue:
    def __init__(self, k: int):
        self.data = [0] * k
        self.capacity = k
        self.head = 0
        self.count = 0

    def enQueue(self, value: int) -> bool:
        if self.count == self.capacity:
            return False
        self.data[(self.head + self.count) % self.capacity] = value
        self.count += 1
        return True

    def deQueue(self) -> bool:
        if self.count == 0:
            return False
        self.head = (self.head + 1) % self.capacity
        self.count -= 1
        return True

    def Front(self) -> int:
        return -1 if self.count == 0 else self.data[self.head]

    def Rear(self) -> int:
        return -1 if self.count == 0 else self.data[(self.head + self.count - 1) % self.capacity]

    def isEmpty(self) -> bool:
        return self.count == 0

    def isFull(self) -> bool:
        return self.count == self.capacity`,
    companies: ['amazon', 'bloomberg'],
    pitfalls: ['Using head == tail alone to mean empty is ambiguous with full; track count (or sacrifice one slot) instead'],
  },
  {
    id: 'bank-structures:problem:1146', lc: 1146, title: 'Snapshot Array', difficulty: 'Medium',
    skills: ['ds-diagnosis', 'binary-search'], pattern: 'Lazy per-index history + binary search', ds: ['hashmap', 'array'],
    constraints: '1 <= length <= 5 * 10^4, at most 5 * 10^4 calls', time: 'O(1) snap, O(log m) get, O(1) amortized set', space: 'O(calls)',
    insight: 'Copying the whole array on every snap() would be O(n) per snapshot; instead record history lazily per index.',
    signals: ['snapshot the whole structure cheaply', 'query a past version by id'],
    narration: ['snap() just increments a counter and returns it: O(1), no copying.', 'set(index, val) appends (currentSnapId, val) to that index\'s own history list.', 'get(index, snapId) binary-searches that index\'s history for the latest entry at or before snapId.'],
    solution: `import bisect
from collections import defaultdict as dd

class SnapshotArray:
    def __init__(self, length: int):
        self.snapId = 0
        self.history = dd(lambda: [(0, 0)])

    def set(self, index: int, val: int) -> None:
        self.history[index].append((self.snapId, val))

    def snap(self) -> int:
        self.snapId += 1
        return self.snapId - 1

    def get(self, index: int, snap_id: int) -> int:
        entries = self.history[index]
        i = bisect.bisect_right(entries, (snap_id, float('inf'))) - 1
        return entries[i][1]`,
    companies: ['google'],
    pitfalls: ['Copying the entire array at snap() time defeats the point and is too slow at scale'],
  },
  {
    id: 'bank-structures:problem:1396', lc: 1396, title: 'Design Underground System', difficulty: 'Medium',
    skills: ['ds-diagnosis'], pattern: 'Two hashmaps: in-progress trips + aggregated stats', ds: ['hashmap'],
    constraints: 'At most 2 * 10^4 calls, timestamps strictly increasing per traveler', time: 'O(1) per call', space: 'O(travelers + station pairs)',
    insight: "checkIn and checkOut must be paired per traveler id before a trip's duration can be folded into a running average.",
    signals: ['check in / check out events', 'average time between two stations'],
    narration: ['checkIn(id, station, t): remember (station, t) for that traveler id.', 'checkOut(id, station, t): look up the matching checkIn, compute the duration, then add it into a running (totalTime, count) keyed by (startStation, endStation), and forget the in-progress entry.', 'getAverageTime divides totalTime by count for that station pair.'],
    solution: `from collections import defaultdict as dd

class UndergroundSystem:
    def __init__(self):
        self.checkIns = {}
        self.stats = dd(lambda: [0, 0])

    def checkIn(self, id: int, stationName: str, t: int) -> None:
        self.checkIns[id] = (stationName, t)

    def checkOut(self, id: int, stationName: str, t: int) -> None:
        startStation, startTime = self.checkIns.pop(id)
        entry = self.stats[(startStation, stationName)]
        entry[0] += t - startTime
        entry[1] += 1

    def getAverageTime(self, startStation: str, endStation: str) -> float:
        totalTime, count = self.stats[(startStation, endStation)]
        return totalTime / count`,
    companies: ['amazon', 'bloomberg'],
    pitfalls: ['Forgetting to remove the in-progress checkIn entry after checkOut, leaking stale state'],
  },
  {
    id: 'bank-structures:problem:173', lc: 173, title: 'Binary Search Tree Iterator', difficulty: 'Medium',
    skills: ['bst', 'stack'], pattern: 'Explicit left-spine stack (controlled inorder)', ds: ['stack'],
    constraints: '0 <= number of nodes <= 10^5', time: 'O(1) amortized next(), O(h) worst case for one call', space: 'O(h)',
    insight: 'Flattening the whole tree to a list costs O(n) memory even if next() is called once; a stack over the left spine costs only O(h).',
    signals: ['in-order traversal, but paused/resumed one value at a time', 'next() / hasNext() interface over a BST'],
    narration: ['Push every node down the left spine onto a stack to start.', 'next() pops the top (the current smallest unvisited), then pushes the left spine of its right child.', 'hasNext() is just "is the stack non-empty".'],
    solution: `class BSTIterator:
    def __init__(self, root: Optional[TreeNode]):
        self.stack = []
        self.pushLeft(root)

    def pushLeft(self, node):
        while node:
            self.stack.append(node)
            node = node.left

    def next(self) -> int:
        node = self.stack.pop()
        self.pushLeft(node.right)
        return node.val

    def hasNext(self) -> bool:
        return len(self.stack) > 0`,
    companies: ['meta', 'microsoft'],
    pitfalls: ['Precomputing the full inorder list upfront works but costs O(n) memory, defeating the O(h) requirement'],
  },
]

export default {
  mcqs: [...mcqs, ...oopMcqs],
  clozes,
  parsons,
  flashcards,
  problems,
}
