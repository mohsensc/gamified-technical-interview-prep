const rotate = (choices, answer, shift) => {
  const n = choices.length
  const rotated = choices.map((_, j) => choices[(j + shift) % n])
  return { choices: rotated, answer: ((answer - shift) % n + n) % n }
}

const mcqRows = [
  ['heap', 1, 'Python\'s heapq module implements…', null, ['A max-heap', 'A min-heap: smallest element always at heap[0]', 'A balanced BST', 'A sorted list'], 1, 'To simulate a max-heap, push negated values and negate again on pop.'],
  ['heap', 1, 'Cost of heapq.heappush and heapq.heappop on a heap of size n?', null, ['O(1) both', 'O(log n) both', 'O(n) both', 'O(log n) push, O(1) pop'], 1, 'Both sift an element up or down the tree, height log n.'],
  ['heap', 1, 'Cost of heapq.heapify(existingList)?', null, ['O(n log n)', 'O(n)', 'O(log n)', 'O(n^2)'], 1, 'Bottom-up heap construction is linear, cheaper than n individual pushes.'],
  ['heap', 2, 'K Closest Points to Origin, k << n: best approach and complexity?', null, ['Sort all points, take first k: O(n log n)', 'Max-heap of size k by distance, push/pop to keep only the k smallest: O(n log k)', 'Brute force all pairs: O(n^2)', 'Binary search on distance: O(log n)'], 1, 'A bounded max-heap evicts the farthest point whenever the heap exceeds size k.'],
  ['heap', 2, 'Kth Largest Element in an Array: min-heap of size k approach complexity, versus quickselect?', null, ['Heap O(n log k); quickselect O(n) average', 'Heap O(n); quickselect O(n log n)', 'Both are O(n log n) always', 'Heap O(log n); quickselect O(n^2) always'], 0, 'Quickselect partitions like quicksort and averages O(n); the heap approach is O(n log k) but simpler to reason about and avoids worst-case recursion.'],
  ['heap', 2, 'Merge K Sorted Lists with a heap: why push tuples like (val, i, node) instead of just (val, node)?', null, ['Faster hashing', "ListNode objects aren't directly comparable, so a tie-breaker (list index i) is needed to avoid comparing nodes when values are equal", 'To keep the heap smaller', "It's not actually needed"], 1, 'If two values tie, heapq compares the next tuple element; without a tie-breaker it would try to compare ListNode objects and crash.'],
  ['heap', 2, 'Merge K Sorted Lists, total n nodes across k lists, heap approach time?', null, ['O(n log k)', 'O(n log n)', 'O(n * k)', 'O(n)'], 0, 'The heap never holds more than k elements; each of n nodes is pushed and popped once.'],
  ['heap', 2, 'Top K Frequent Words, ties broken by lexicographically smaller word first: a plain max-heap of (-freq, word) does what on ties?', null, ['Breaks ties randomly', 'Naturally picks the lexicographically SMALLER word first, since tuples compare word as the second field ascending', 'Crashes on ties', 'Picks the lexicographically larger word first'], 1, 'With equal -freq, Python compares the next tuple element, the word string, in normal ascending order — exactly the required tie-break.'],
  ['heap', 2, 'Task Scheduler (same-letter tasks need n cooldown slots between them): core structure used?', null, ['A trie of task letters', 'A max-heap of remaining counts, plus a cooldown queue of (count, availableTime)', 'A monotonic stack', 'A union-find over task letters'], 1, 'Always run the most frequent available task; recently run tasks wait in a queue until their cooldown expires.'],
  ['heap', 2, 'Meeting Rooms II (minimum rooms needed for overlapping intervals): the heap holds what?', null, ['Start times of all meetings', 'End times of meetings currently in progress; push a new end time, but first pop if the earliest end <= new start', 'All meeting durations', 'Room numbers'], 1, 'The heap size at any point is how many rooms are simultaneously occupied; popping frees a room whose meeting already ended.'],
  ['heap', 2, 'Reorganize String (rearrange so no two adjacent characters are equal): when is it impossible?', null, ['Never, always possible', 'When the most frequent character\'s count exceeds (len(s) + 1) // 2', 'When the string has an odd length', 'When there are more than 26 distinct characters'], 1, "If one character dominates past the halfway+1 point, it cannot avoid sitting next to itself somewhere."],
  ['heap', 2, 'Reorganize String approach: max-heap by frequency, then what each step?', null, ['Pop and place the same character twice in a row', 'Pop the most frequent remaining character, place it, and hold it out for one round so it is not placed adjacent to itself', 'Sort characters alphabetically first', 'Use two separate strings and concatenate'], 1, "Holding the just-placed character back by one iteration before re-pushing it guarantees it won't repeat immediately."],
  ['heap', 2, 'Ugly Number II (numbers whose only prime factors are 2, 3, 5), min-heap approach: avoiding duplicates requires?', null, ['Nothing special, duplicates never occur', 'A visited set, since e.g. 2*3 and 3*2 both generate 6', 'Sorting at the end', 'A separate stack'], 1, 'Multiplying the same popped value by 2, 3, and 5 can regenerate values already seen from a different popped value.'],
  ['heap', 2, 'Smallest Range Covering Elements from K Lists: the heap tracks what at each step?', null, ['The maximum value seen so far only', 'The current smallest among the k lists\' pointers, while a separate running variable tracks the current largest', 'A sorted merge of all k lists upfront', 'Nothing, it is pure two pointers'], 1, 'The range candidate is [heap top, running max]; popping the min and advancing that list\'s pointer narrows the search.'],
  ['heap', 1, 'heapq.nlargest(k, nums) complexity for n total elements?', null, ['O(n log k)', 'O(n log n) always', 'O(k)', 'O(n)'], 0, 'Internally it maintains a heap of size k, same cost profile as the manual bounded-heap pattern.'],
]

const mcqs = mcqRows.map(([skill, difficulty, q, code, choices, answer, why], i) => {
  const shift = (i * 2 + 1) % choices.length
  return { id: `bank-structures:mcq:heap:${i + 1}`, skills: [skill], difficulty, q, ...(code ? { code } : {}), ...rotate(choices, answer, shift), why }
})

const clozes = [
  { id: 'bank-structures:cloze:heap:1', skills: ['heap'], title: 'K Closest Points to Origin', code: `import heapq

def kClosest(points, k):
    heap = []

    for x, y in points:
        dist = -(x * x + y * y)
        heapq.[[heappush]](heap, (dist, x, y))
        if len(heap) > [[k]]:
            heapq.heappop(heap)

    return [(x, y) for dist, x, y in [[heap]]]` },
  { id: 'bank-structures:cloze:heap:2', skills: ['heap'], title: 'Kth Largest Element (min-heap of size k)', code: `import heapq

def findKthLargest(nums, k):
    heap = nums[:k]
    heapq.[[heapify]](heap)

    for num in nums[k:]:
        if num > heap[0]:
            heapq.[[heapreplace]](heap, num)

    return [[heap[0]]]` },
  { id: 'bank-structures:cloze:heap:3', skills: ['heap'], title: 'Merge K Sorted Lists', code: `import heapq

def mergeKLists(lists):
    heap = []
    for i, node in enumerate(lists):
        if node:
            heapq.heappush(heap, (node.val, [[i]], node))

    dummy = tail = ListNode()
    while heap:
        val, i, node = heapq.[[heappop]](heap)
        tail.next = node
        tail = tail.next
        if node.next:
            heapq.heappush(heap, (node.next.val, i, node.[[next]]))

    return dummy.next` },
  { id: 'bank-structures:cloze:heap:4', skills: ['heap'], title: 'Meeting Rooms II', code: `import heapq

def minMeetingRooms(intervals):
    intervals.sort(key=lambda pair: [[pair[0]]])
    endTimes = []

    for start, end in intervals:
        if endTimes and endTimes[0] <= [[start]]:
            heapq.heappop(endTimes)
        heapq.[[heappush]](endTimes, end)

    return len(endTimes)` },
  { id: 'bank-structures:cloze:heap:5', skills: ['heap'], title: 'Task Scheduler (max-heap + cooldown queue)', code: `import heapq
from collections import Counter, deque

def leastInterval(tasks, n):
    counts = Counter(tasks)
    heap = [-count for count in counts.values()]
    heapq.[[heapify]](heap)
    cooldown = deque()
    time = 0

    while heap or cooldown:
        time += 1
        if heap:
            count = heapq.[[heappop]](heap) + 1
            if count:
                cooldown.append((count, time + n))
        if cooldown and cooldown[0][1] == [[time]]:
            heapq.heappush(heap, cooldown.popleft()[0])

    return time` },
  { id: 'bank-structures:cloze:heap:6', skills: ['heap'], title: 'Smallest Range Covering Elements from K Lists', code: `import heapq

def smallestRange(nums):
    heap = []
    currentMax = float('-inf')

    for i, row in enumerate(nums):
        heapq.heappush(heap, (row[0], i, 0))
        currentMax = max(currentMax, row[0])

    bestRange = [float('-inf'), float('inf')]

    while True:
        val, row, idx = heapq.[[heappop]](heap)
        if currentMax - val < bestRange[1] - bestRange[0]:
            bestRange = [val, [[currentMax]]]

        if idx + 1 == len(nums[row]):
            break

        nextVal = nums[row][idx + 1]
        currentMax = max(currentMax, [[nextVal]])
        heapq.heappush(heap, (nextVal, row, idx + 1))

    return bestRange` },
]

const parsons = [
  { id: 'bank-structures:parsons:heap:1', skills: ['heap'], title: 'Kth Largest Element (min-heap of size k)', lines: [
    'heap = nums[:k]',
    'heapq.heapify(heap)',
    'for num in nums[k:]:',
    '    if num > heap[0]:',
    '        heapq.heapreplace(heap, num)',
    'return heap[0]',
  ], distractors: ['heap = nums[-k:]', 'return heap[-1]'] },
  { id: 'bank-structures:parsons:heap:2', skills: ['heap'], title: 'Meeting Rooms II', lines: [
    'intervals.sort(key=lambda pair: pair[0])',
    'endTimes = []',
    'for start, end in intervals:',
    '    if endTimes and endTimes[0] <= start:',
    '        heapq.heappop(endTimes)',
    '    heapq.heappush(endTimes, end)',
    'return len(endTimes)',
  ], distractors: ['intervals.sort(key=lambda pair: pair[1])'] },
  { id: 'bank-structures:parsons:heap:3', skills: ['heap'], title: 'K Closest Points to Origin', lines: [
    'heap = []',
    'for x, y in points:',
    '    dist = -(x * x + y * y)',
    '    heapq.heappush(heap, (dist, x, y))',
    '    if len(heap) > k:',
    '        heapq.heappop(heap)',
    'return [(x, y) for dist, x, y in heap]',
  ], distractors: ['    dist = x * x + y * y'] },
]

const cardData = [
  ['heap', 'heapq default behavior', "Min-heap only. Push -value for a max-heap, remembering to negate again on pop."],
  ['heap', 'Bounded heap of size k pattern', 'Push every element, pop whenever size exceeds k. Leftover k elements are exactly the "best k" by whichever order you negate.'],
  ['heap', 'heapify vs n pushes', 'heapify(list) is O(n); n individual heappush calls cost O(n log n). Heapify wins when building from an existing list.'],
  ['heap', 'Merge K Sorted Lists tie-breaker', "Push (value, listIndex, node), not (value, node): ListNode objects aren't comparable, and ties need a fallback field."],
  ['heap', 'Top K Frequent Words tie-break', 'Push (-frequency, word): equal frequency falls through to compare the word strings directly, picking lexicographically smaller first.'],
  ['heap', 'Meeting Rooms II heap trick', 'Heap of end times in progress. Room count needed = max heap size reached. Pop first if its end time already passed.'],
  ['heap', 'Task Scheduler structure', 'Max-heap of remaining task counts; a side queue holds recently-run tasks until their cooldown time arrives.'],
  ['heap', 'Reorganize String feasibility check', 'Possible iff the most frequent character\'s count <= (n + 1) // 2.'],
  ['heap', 'Quickselect vs heap for Kth largest', 'Quickselect: O(n) average, in-place, no extra heap. Heap of size k: O(n log k), simpler and stable worst case.'],
  ['heap', 'Sliding Window Median (two heaps)', 'Max-heap for the lower half, min-heap for the upper half, with lazy deletion (mark stale entries instead of removing mid-heap).'],
  ['heap', 'heapq.merge(*iterables)', 'Merges several already-sorted iterables into one sorted iterator in O(n log k), without building a single combined heap by hand.'],
  ['heap', 'Smallest Range Covering K Lists', 'Min-heap of one pointer per list; the current range is [heap top, running max]; always advance the list holding the current minimum.'],
]

const flashcards = cardData.map(([skill, front, back, code], i) => ({ id: `bank-structures:card:heap:${i + 1}`, skills: [skill], front, back, ...(code ? { code } : {}) }))

const problems = [
  {
    id: 'bank-structures:problem:2402', lc: 2402, title: 'Meeting Rooms III', difficulty: 'Hard',
    skills: ['heap', 'intervals'], pattern: 'Heap / top-k: two heaps (free rooms, busy by end time)', ds: ['min-heap'],
    constraints: '1 ≤ n ≤ 100, 1 ≤ meetings ≤ 10^5, start times unique, delayed meetings keep their duration', time: 'O(m log m + m log n)', space: 'O(n)',
    insight: 'Sort by start; a min-heap of free room numbers picks the lowest room, and a min-heap of (end time, room) tells you which room frees up first.',
    signals: ['lowest-numbered free room', 'meeting waits for the earliest room to free', 'room with the most meetings'],
    narration: ['Sort meetings by start.', 'Before each meeting, move every busy room whose end <= start back to the free heap.', 'If a room is free, take the smallest number. Otherwise pop the earliest-ending room and delay by its remaining time.', 'Count uses per room; return the first room with the max count.'],
    solution: `class Solution:
    def mostBooked(self, n, meetings):
        meetings.sort()
        free = list(range(n))
        heapq.heapify(free)
        busy = []
        counts = [0] * n
        for start, end in meetings:
            while busy and busy[0][0] <= start:
                _, room = heapq.heappop(busy)
                heapq.heappush(free, room)
            if free:
                room = heapq.heappop(free)
                heapq.heappush(busy, (end, room))
            else:
                freeAt, room = heapq.heappop(busy)
                heapq.heappush(busy, (freeAt + end - start, room))
            counts[room] += 1
        return counts.index(max(counts))`,
    pitfalls: ['Busy heap ties on end time must break by room number, which tuples do for free', 'A delayed meeting ends at freeAt + duration, not at its original end'],
  },
  {
    id: 'bank-structures:problem:373', lc: 373, title: 'Find K Pairs with Smallest Sums', difficulty: 'Medium',
    skills: ['heap'], pattern: 'Heap / top-k: k-way frontier from (i, 0)', ds: ['min-heap'],
    constraints: '1 ≤ nums lengths ≤ 10^5, both sorted ascending, 1 ≤ k ≤ 10^4', time: 'O(k log k)', space: 'O(k)',
    insight: 'Each row nums1[i] + nums2[·] is already sorted, so this is a k-way merge that only ever needs the next cell in a row.',
    signals: ['two sorted arrays', 'k smallest pair sums', 'k much smaller than n · m'],
    narration: ['Seed the heap with (nums1[i] + nums2[0], i, 0) for the first k rows.', 'Pop the smallest, record the pair.', 'Push the next pair in the same row, (i, j + 1).', 'Stop after k pops.'],
    solution: `class Solution:
    def kSmallestPairs(self, nums1, nums2, k):
        heap = [(nums1[i] + nums2[0], i, 0) for i in range(min(k, len(nums1)))]
        heapq.heapify(heap)
        result = []
        while heap and len(result) < k:
            _, i, j = heapq.heappop(heap)
            result.append([nums1[i], nums2[j]])
            if j + 1 < len(nums2):
                heapq.heappush(heap, (nums1[i] + nums2[j + 1], i, j + 1))
        return result`,
    pitfalls: ['Pushing all n · m pairs blows memory', 'Seeding more than k rows is wasted work, only the first k can matter'],
  },
  {
    id: 'bank-structures:problem:632', lc: 632, title: 'Smallest Range Covering Elements from K Lists', difficulty: 'Hard',
    skills: ['heap', 'sliding-window'], pattern: 'Heap / top-k: k-way merge tracking current max', ds: ['min-heap'],
    constraints: '1 ≤ k ≤ 3500, each list sorted, total elements ≤ 10^5', time: 'O(N log k)', space: 'O(k)',
    insight: 'Keep one element from every list in a min-heap while tracking the largest; [heap min, current max] is always a valid range, so advance the list that holds the min.',
    signals: ['range must include one number from each list', 'k sorted lists', 'smallest range'],
    narration: ['Push the first element of every list and track currentMax.', 'The range [heap top, currentMax] covers every list; update the best if it is narrower.', 'Pop the min and push the next element from the same list, raising currentMax if needed.', 'Stop when a list runs out.'],
    solution: `class Solution:
    def smallestRange(self, nums):
        heap = [(row[0], i, 0) for i, row in enumerate(nums)]
        heapq.heapify(heap)
        currentMax = max(row[0] for row in nums)
        best = [heap[0][0], currentMax]
        while True:
            value, i, j = heapq.heappop(heap)
            if currentMax - value < best[1] - best[0]:
                best = [value, currentMax]
            if j + 1 == len(nums[i]):
                return best
            nextValue = nums[i][j + 1]
            currentMax = max(currentMax, nextValue)
            heapq.heappush(heap, (nextValue, i, j + 1))`,
    companies: ['google', 'amazon'],
    pitfalls: ['Once any list is exhausted no later range can cover it, so return immediately', 'Forgetting currentMax when pushing the next value shrinks the range wrongly'],
  },
  {
    id: 'bank-structures:problem:502', lc: 502, title: 'IPO', difficulty: 'Hard',
    skills: ['heap', 'greedy'], pattern: 'Heap / top-k: sort by capital + max-heap of profits', ds: ['heap'],
    constraints: '1 ≤ k ≤ 10^5, 0 ≤ w ≤ 10^9, up to 10^5 projects', time: 'O(n log n + k log n)', space: 'O(n)',
    insight: 'Greedy: always run the most profitable project you can afford; sort by capital and release affordable ones into a max-heap of profits.',
    signals: ['pick at most k projects', 'each needs minimum capital', 'profit increases your capital'],
    narration: ['Sort projects by required capital.', 'For each of k rounds, push every project with capital <= w into a max-heap of profits.', 'Pop the best profit and add it to w.', 'Stop early if nothing is affordable.'],
    solution: `class Solution:
    def findMaximizedCapital(self, k, w, profits, capital):
        projects = sorted(zip(capital, profits))
        available = []
        i = 0
        for _ in range(k):
            while i < len(projects) and projects[i][0] <= w:
                heapq.heappush(available, -projects[i][1])
                i += 1
            if not available:
                break
            w -= heapq.heappop(available)
        return w`,
    companies: ['amazon', 'google'],
    pitfalls: ['Heap of all projects by profit would pick ones you cannot afford', 'Python heaps are min-heaps, so negate the profit'],
  },
]

export default {
  mcqs,
  clozes,
  parsons,
  flashcards,
  problems,
}
