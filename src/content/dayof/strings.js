export default {
  id: 'strings',
  title: 'Strings, collections & hashing',
  icon: 'read',
  minutes: 25,

  summary: [
    '==str== methods never mutate — always return new',
    '==list==.sort()/reverse()/append() mutate and return ==None==',
    'x in ==set==/==dict== is O(1); x in ==list== is O(n)',
    '==Counter== counts, ==defaultdict== groups, ==deque== gives O(1) ends',
    '==heapq== is min-heap only — negate values for max-heap',
    'Anagram key = sorted(word) or a 26-length count tuple',
    'seen ==set()== / index map kills O(n²) pair search',
    'Build strings with a list + join, never += in a loop',
  ],

  sections: [
    {
      kind: 'beforeAfter',
      title: 'String ops — predict the output',
      rows: [
        { op: "s.strip()", before: "'  hi  '", after: "'hi'", note: 'trims both ends only' },
        { op: 's.split()', before: "'a b  c'", after: "['a', 'b', 'c']", note: 'collapses whitespace runs' },
        { op: "s.split(' ')", before: "'a b  c'", after: "['a', 'b', '', 'c']", note: 'splits literal spaces only' },
        { op: "s.split(',')", before: "'a,b,,c'", after: "['a', 'b', '', 'c']", note: 'empty string between commas' },
        { op: "'-'.join(xs)", before: "['a', 'b', 'c']", after: "'a-b-c'", note: 'separator between items' },
        { op: 's.lower() / s.upper()', before: "'Hi'", after: "'hi' / 'HI'", note: 'returns new, case swapped' },
        { op: "'abc123'.isalnum()", before: "'abc123'", after: 'True', note: 'letters + digits, no symbols' },
        { op: "'-4'.isdigit()", before: "'-4'", after: 'False', note: 'minus sign breaks isdigit' },
        { op: "s.find('z')", before: "'cat'", after: '-1', note: 'missing → -1, no error' },
        { op: "s.index('z')", before: "'cat'", after: 'ValueError', note: 'missing → raises' },
        { op: "s.replace('a','o')", before: "'cat'", after: "'cot'", note: 'all matches replaced' },
        { op: "s.count('a')", before: "'aaa'", after: '3', note: 'non-overlapping matches' },
        { op: "'sub' in s", before: "'substring'", after: 'True', note: 'substring membership test' },
      ],
    },
    {
      kind: 'beforeAfter',
      title: 'Slicing, conversions & immutability',
      rows: [
        { op: 's[1:3]', before: "'hello'", after: "'el'", note: 'slice excludes end index' },
        { op: 's[::-1]', before: "'hello'", after: "'olleh'", note: 'full reverse, step -1' },
        { op: 's[:-1]', before: "'hello'", after: "'hell'", note: 'drops last character' },
        { op: 's[-1]', before: "'hello'", after: "'o'", note: 'last character' },
        { op: "ord('a') / chr(97)", before: "'a' / 97", after: "97 / 'a'", note: 'char ↔ code point' },
        { op: "ord('d') - ord('a')", before: "'d', 'a'", after: '3', note: 'alphabet distance trick' },
        { op: "int('-042')", before: "'-042'", after: '-42', note: 'leading zeros ignored' },
        { op: "f'{name} has {n} lives'", before: "name='cat', n=3", after: "'cat has 3 lives'", note: 'inline expr inside {}' },
        { op: "s.split('')", before: "'cat'", after: 'ValueError', note: 'empty sep — use list(s)' },
        { op: "s[0] = 'b'", before: "'cat'", after: 'TypeError', note: 'strings are immutable' },
        { op: "chars[0]='b'; ''.join(chars)", before: "list('cat')", after: "'bat'", note: 'mutate list, then rejoin' },
      ],
    },
    {
      kind: 'table',
      title: 'Collections — quick API',
      columns: ['thing', 'key ops', 'gotcha'],
      rows: [
        ['Counter', "Counter(x), c[k] (0 default), c.most_common(k), c1-c2", "c['missing'] does NOT raise — returns 0"],
        ['defaultdict', 'dd(list)/dd(int)/dd(set) — auto-creates on access', 'reading dd(list)[k] CREATES that key'],
        ['deque', 'append/appendleft/pop/popleft, d[0]/d[-1], maxlen', 'd[i] random access is O(n), not O(1)'],
        ['heapq', 'heappush/heappop (min-heap), heapify(list), heap[0]', 'push/pop/heapify all return None'],
        ['bisect', 'bisect_left/right (search), insort (insert)', "list must already be sorted — it won't check"],
        ['set', 'a|b, a&b, a-b, a^b, add, discard, remove', 'discard is safe, remove raises if missing'],
        ['dict', 'get(k,default), setdefault(k,v), pop(k), items()', 'd[k] on missing key raises KeyError'],
        ['OrderedDict', 'move_to_end(k), popitem(last=False)', 'plain dict keeps order too, but no move_to_end'],
      ],
    },
    {
      kind: 'boilerplate',
      title: 'Frequency / Counter pattern',
      when: 'count occurrences, find most/least common, compare multisets',
      code:
`class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        counts = Counter(nums)

        return [num for num, freq in counts.most_common(k)]`,
      time: 'O(n log k)',
      space: 'O(n)',
      knobs: [
        {
          change: 'make it O(n) worst case instead of O(n log k)',
          how: 'bucket by frequency index, walk buckets high to low',
          code:
`buckets = [[] for _ in range(len(nums) + 1)]
for num, freq in counts.items():
    buckets[freq].append(num)

result = []
for freq in range(len(buckets) - 1, 0, -1):
    for num in buckets[freq]:
        result.append(num)
        if len(result) == k:
            return result`,
        },
        {
          change: 'check if two strings are anagrams instead of top-k',
          how: 'compare counts directly, skip sorting entirely',
          code: 'return Counter(a) == Counter(b)',
        },
      ],
    },
    {
      kind: 'boilerplate',
      title: 'Seen-set / index-map for pairs',
      when: 'need a complement, a duplicate, or a pair that sums to target',
      code:
`class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}

        for i, num in enumerate(nums):
            need = target - num

            if need in seen:
                return [seen[need], i]

            seen[num] = i

        return []`,
      time: 'O(n)',
      space: 'O(n)',
      knobs: [
        {
          change: 'just detect ANY duplicate, no indices needed',
          how: 'swap the dict for a set() and return a bool',
          code:
`seen = set()
for num in nums:
    if num in seen:
        return True
    seen.add(num)
return False`,
        },
        {
          change: 'count all pairs that sum to target, not just the first',
          how: 'Counter + split same-value case from cross-value case',
          code:
`counts = Counter(nums)
pairs = 0

for num, freq in counts.items():
    need = target - num
    if need not in counts:
        continue
    if need == num:
        pairs += freq * (freq - 1) // 2
    elif need > num:
        pairs += freq * counts[need]

return pairs`,
        },
      ],
    },
    {
      kind: 'boilerplate',
      title: 'Build a string the right way',
      when: 'constructing a string piece by piece in a loop',
      code:
`class Solution:
    def reverseVowels(self, s: str) -> str:
        chars = list(s)
        left, right = 0, len(chars) - 1
        vowels = set('aeiouAEIOU')

        while left < right:
            if chars[left] not in vowels:
                left += 1
            elif chars[right] not in vowels:
                right -= 1
            else:
                chars[left], chars[right] = chars[right], chars[left]
                left += 1
                right -= 1

        return ''.join(chars)`,
      time: 'O(n)',
      space: 'O(n)',
      knobs: [
        {
          change: 'just need the whole string reversed, nothing selective',
          how: 'slicing already builds a new reversed string',
          code: 'return s[::-1]',
        },
        {
          change: 'filtering characters out instead of swapping',
          how: 'append kept chars to a list, join once at the end',
          code:
`result = []
for ch in s:
    if ch not in vowels:
        result.append(ch)

return ''.join(result)`,
        },
      ],
    },
    {
      kind: 'boilerplate',
      title: 'Group by hashable key (anagrams)',
      when: 'bucket items that share a computed signature',
      code:
`class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        groups = dd(list)

        for word in strs:
            key = ''.join(sorted(word))
            groups[key].append(word)

        return list(groups.values())`,
      time: 'O(n · k log k)',
      space: 'O(n · k)',
      knobs: [
        {
          change: 'avoid the log k sort, make the key O(k) instead',
          how: 'key = tuple of counts for each of the 26 letters',
          code:
`key = [0] * 26
for ch in word:
    key[ord(ch) - ord('a')] += 1
key = tuple(key)`,
        },
        {
          change: 'need just a yes/no anagram check, not full grouping',
          how: 'compare two keys directly, skip the dict entirely',
          code: 'return Counter(a) == Counter(b)',
        },
      ],
    },
    {
      kind: 'boilerplate',
      title: 'Min/max heap for top-k',
      when: 'kth largest/smallest, running top-k, closest-k points',
      code:
`class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        heap = []

        for num in nums:
            heapq.heappush(heap, num)
            if len(heap) > k:
                heapq.heappop(heap)

        return heap[0]`,
      time: 'O(n log k)',
      space: 'O(k)',
      knobs: [
        {
          change: 'ranking by a custom priority, like distance',
          how: 'push tuples (priority, item) — tuples compare element-wise',
          code: 'heapq.heappush(heap, (dist, point))',
        },
        {
          change: 'need a MAX-heap (heapq is min-heap only)',
          how: 'negate on push, negate again on pop',
          code:
`heap = [-num for num in nums]
heapq.heapify(heap)
largest = -heapq.heappop(heap)`,
        },
      ],
    },
    {
      kind: 'list',
      title: 'Hashing patterns',
      items: [
        "Anagram key: ''.join(sorted(word)) or tuple(26 letter counts)",
        'Seen set: seen = set() — O(1) dedupe / repeat detection',
        'Index map: value → index dict, turns O(n²) pair search into O(n)',
        'Frequency buckets: bucket[freq].append(x) for O(n) top-k, no sort',
        'Prefix hash: running sum/XOR in a dict catches subarray patterns',
        'Tuple/frozenset as key: only hashable (immutable) types work as keys',
        'Signature grouping: map a computed key to a list of matches',
      ],
    },
    {
      kind: 'table',
      title: 'Time complexity — common ops',
      columns: ['op', 'time', 'why'],
      rows: [
        ['x in list', 'O(n)', 'linear scan, no index'],
        ['x in set / dict', 'O(1) avg', 'hash lookup'],
        ['list.append(x)', 'O(1)', 'amortized'],
        ['list.pop()', 'O(1)', 'removes last element'],
        ['list.pop(0)', 'O(n)', 'shifts everything left'],
        ['list.insert(i, x)', 'O(n)', 'shifts everything right'],
        ['deque append/pop (either end)', 'O(1)', 'doubly linked, not an array'],
        ['deque[i] random access', 'O(n)', "not array-backed, don't index much"],
        ['sorted(x) / x.sort()', 'O(n log n)', 'Timsort'],
        ['heapq.heappush / heappop', 'O(log n)', 'sift up / down one path'],
        ['heapq.heapify(x)', 'O(n)', 'builds heap order from scratch'],
        ['bisect_left / bisect_right', 'O(log n)', 'binary search, list must be sorted'],
        ['bisect.insort', 'O(n)', 'search is log n, shifting is not'],
        ['Counter(iterable)', 'O(n)', 'one pass to tally counts'],
        ['s += ch in a loop', 'O(n²) total', 'each += copies the whole string'],
        ["''.join(list)", 'O(n)', 'builds the result once'],
      ],
    },
    {
      kind: 'table',
      title: 'In-place vs returns new (the big trap)',
      columns: ['method', 'behavior', 'note'],
      rows: [
        ['any str method (strip/split/replace/…)', 'returns NEW', 'strings are immutable — original never changes'],
        ['list.sort()', 'returns None, mutates', "don't write x = x.sort()"],
        ['sorted(list)', 'returns NEW list', 'original untouched'],
        ['list.reverse()', 'returns None, mutates', 'in place, no new list'],
        ['reversed(list)', 'returns NEW iterator', 'wrap in list(...) to use it'],
        ['list.append/extend/insert/remove/pop', 'returns None, mutates', 'all five mutate and return None'],
        ['heapq.heappush/heappop/heapify', 'returns None, mutates', 'the list you pass in IS the heap'],
        ['dict.update(x)', 'returns None, mutates', 'merges x into the dict in place'],
        ['set.add/discard/remove/update', 'returns None, mutates', 'all mutate the set in place'],
      ],
    },
  ],

  recall: [
    { prompt: 'Does s.strip() mutate s?', answer: 'No — strings are immutable, strip() returns a new string' },
    { prompt: 'Fastest way to check membership in a big collection?', answer: 'set or dict — O(1) avg; list is O(n)' },
    { prompt: "Counter(s)['missing'] — error or 0?", answer: '0, never KeyError — Counter defaults missing keys to 0' },
    { prompt: 'What does heapq.heappush(heap, x) return?', answer: 'None — it mutates heap in place' },
    { prompt: 'How do you build a max-heap with heapq?', answer: 'Negate values on push and pop; heapq is min-heap only' },
    { prompt: 'list.sort() vs sorted(list) — which returns a new list?', answer: 'sorted() returns new; list.sort() mutates and returns None' },
    { prompt: 'One-line anagram check', answer: 'return Counter(a) == Counter(b)' },
    { prompt: 'Two-sum pattern: data structure and why', answer: 'dict value→index; O(1) lookup makes it O(n) not O(n²)' },
    { prompt: 'deque.popleft() vs list.pop(0) — complexity?', answer: 'deque O(1); list O(n), it shifts every remaining element' },
    { prompt: 'bisect_left vs bisect_right on duplicate values?', answer: 'left inserts before the equal run, right inserts after it' },
    { prompt: 'Can a list be a dict key?', answer: 'No — unhashable/mutable; use a tuple or frozenset instead' },
    { prompt: "'4'.isdigit() vs '-4'.isdigit()?", answer: 'True / False — isdigit() rejects the minus sign' },
    { prompt: 'Reverse a string without += in a loop — code', answer: "s[::-1]" },
    { prompt: 'Why insert into seen AFTER the check in two-sum?', answer: 'so a value can never pair with itself' },
    { prompt: 'OrderedDict.popitem(last=False) does what?', answer: 'pops and returns the oldest (first-inserted) item — FIFO' },
    { prompt: "defaultdict(list)[k] on a brand new key — what happens?", answer: 'creates k with an empty list, no KeyError, key now exists' },
  ],

  quiz: [
    { id: 'dayof:strings:q1', q: "What does 'a b  c'.split() return?", choices: ["['a', 'b', 'c']", "['a', 'b', '', 'c']", "['a', ' ', 'b', 'c']", 'ValueError'], answer: 0, why: 'split() with no args collapses any run of whitespace and ignores leading/trailing space.', skills: ['arrays-hashing'] },
    { id: 'dayof:strings:q2', q: "What does 'a b  c'.split(' ') return?", choices: ["['a', 'b', 'c']", "['a', 'b', '', 'c']", "['a b  c']", 'ValueError'], answer: 1, why: "split(' ') splits on every literal space, so a double space leaves an empty string.", skills: ['arrays-hashing'] },
    { id: 'dayof:strings:q3', q: "What does '-4'.isdigit() return?", choices: ['True', 'False', 'raises TypeError', "'-4'"], answer: 1, why: 'isdigit() only accepts characters 0-9 — the minus sign makes it False.', skills: ['arrays-hashing'] },
    { id: 'dayof:strings:q4', q: 'x = [3,1,2]; y = x.sort() — what is y?', choices: ['[1, 2, 3]', '[3, 1, 2]', 'None', 'TypeError'], answer: 2, why: 'list.sort() mutates in place and always returns None — never assign its result.', skills: ['arrays-hashing'] },
    { id: 'dayof:strings:q5', q: 'heapq.heapify(h) returns what, and what happens to h?', choices: ['a new sorted list, h unchanged', 'None, h is rearranged in place', 'the smallest element, h unchanged', 'a list of tuples'], answer: 1, why: 'heapify reorders the list in place into heap order and returns None.', skills: ['heap'] },
    { id: 'dayof:strings:q6', q: 'You need O(1) push/pop from both the front and back. Which structure?', choices: ['list', 'deque', 'set', 'a heapq list'], answer: 1, why: 'deque is doubly linked — appendleft/popleft are O(1), unlike list.insert(0, x).', skills: ['queue-deque'] },
    { id: 'dayof:strings:q7', q: 'Fastest way to get the 3 most frequent elements of a list?', choices: ['sorted(list) then slice', 'Counter(list).most_common(3)', 'set(list) then loop', 'bisect.insort each element'], answer: 1, why: 'Counter tallies in O(n); most_common(k) picks top-k in O(n log k) via a heap.', skills: ['arrays-hashing'] },
    { id: 'dayof:strings:q8', q: 'Grouping words by first letter into lists, no KeyError on a new letter. Best choice?', choices: ['dict()', 'defaultdict(list)', 'set()', 'Counter()'], answer: 1, why: 'defaultdict(list) auto-creates an empty list for a missing key instead of raising.', skills: ['arrays-hashing', 'ds-diagnosis'] },
    { id: 'dayof:strings:q9', q: 'Complexity of `x in nums` when nums is a plain list of length n?', choices: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], answer: 2, why: 'A list has no hash index, so membership is a linear scan.', skills: ['complexity'] },
    { id: 'dayof:strings:q10', q: 'Complexity of `x in seen` when seen is a set?', choices: ['O(1) average', 'O(n)', 'O(log n)', 'O(n²)'], answer: 0, why: 'Sets hash their elements, so membership is average O(1).', skills: ['complexity'] },
    { id: 'dayof:strings:q11', q: "Counter('aab') == Counter('aba') → ?", choices: ['True', 'False', 'TypeError', 'NotImplemented'], answer: 0, why: "Both have {'a': 2, 'b': 1} — Counter compares by counts, not order.", skills: ['arrays-hashing'] },
    { id: 'dayof:strings:q12', q: 'After heapq.heapify(h), what is h[0]?', choices: ['the largest element', 'the smallest element', 'a random element', 'always the original h[0]'], answer: 1, why: 'heapq is a min-heap — index 0 always holds the smallest element.', skills: ['heap'] },
    { id: 'dayof:strings:q13', q: "Python's heapq only gives a min-heap. How do you simulate a max-heap?", choices: ['pass reverse=True to heappush', 'negate values on push, negate again on pop', 'use heapify with key=', 'you cannot, use sorted() instead'], answer: 1, why: 'heapq has no max variant or key param — negating flips smallest-first into largest-first.', skills: ['heap'] },
    { id: 'dayof:strings:q14', q: "'cat'.index('z') vs 'cat'.find('z')?", choices: ['both return -1', 'index raises ValueError, find returns -1', 'index returns -1, find raises', 'both raise ValueError'], answer: 1, why: 'find() fails quietly with -1; index() raises ValueError when the substring is absent.', skills: ['arrays-hashing'] },
    { id: 'dayof:strings:q15', q: "s = 'cat'; s[0] = 'b' does what?", choices: ["s becomes 'bat'", 'raises TypeError', 'raises IndexError', 'silently does nothing'], answer: 1, why: 'Strings are immutable — item assignment is not supported, unlike lists.', skills: ['arrays-hashing'] },
    { id: 'dayof:strings:q16', q: 'Building a string character-by-character in a loop — best practice?', choices: ["result = ''; result += ch each time", "append to a list, then ''.join(list) once", 'use a tuple and +', 'use a set to dedupe then join'], answer: 1, why: '+= on a string copies the whole string each time (O(n²) total); list append + join is O(n).', skills: ['arrays-hashing', 'complexity'] },
    { id: 'dayof:strings:q17', q: 'bisect.bisect_left([1,3,3,5], 3) → ?', choices: ['0', '1', '2', '3'], answer: 1, why: 'bisect_left returns the leftmost valid insert point, before the existing 3s at index 1.', skills: ['binary-search'] },
    { id: 'dayof:strings:q18', q: 'bisect.bisect_right([1,3,3,5], 3) → ?', choices: ['1', '2', '3', '4'], answer: 2, why: 'bisect_right returns the position after all existing 3s, which is index 3.', skills: ['binary-search'] },
    { id: 'dayof:strings:q19', q: 'Need insertion-ordered keys plus O(1) move_to_end and pop-oldest. Which collection?', choices: ['dict', 'OrderedDict', 'Counter', 'frozenset'], answer: 1, why: 'Plain dict keeps insertion order but lacks move_to_end/popitem(last=False); OrderedDict adds both.', skills: ['ds-diagnosis'] },
    { id: 'dayof:strings:q20', q: 'Which of these can be a dict key?', choices: ['a list', 'a set', 'a tuple of ints', 'a dict'], answer: 2, why: "Dict keys must be hashable and immutable — tuples qualify, lists/sets/dicts don't.", skills: ['arrays-hashing'] },
    { id: 'dayof:strings:q21', q: 'nums.pop(0) on a list of length n vs d.popleft() on a deque — complexities?', choices: ['both O(1)', 'both O(n)', 'list.pop(0) is O(n), deque.popleft() is O(1)', 'list.pop(0) is O(1), deque.popleft() is O(n)'], answer: 2, why: 'Removing index 0 from a list shifts every remaining element; a deque has no such shift.', skills: ['complexity', 'queue-deque'] },
    { id: 'dayof:strings:q22', q: 'nums = [3,1,2]; sorted(nums) is called but not assigned — what is nums now?', choices: ['[1, 2, 3]', '[3, 1, 2]', 'None', 'raises an error'], answer: 1, why: 'sorted() returns a new list and leaves the original list completely untouched.', skills: ['arrays-hashing'] },
  ],
}
