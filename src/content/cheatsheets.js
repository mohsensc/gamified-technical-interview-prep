export const cheatSheetGroups = [
  { id: 'foundations', label: 'Foundations', tone: 'teal' },
  { id: 'python', label: 'Python reference', tone: 'amber' },
  { id: 'patterns', label: 'Pattern templates', tone: 'sky' },
  { id: 'structures', label: 'Data structure recipes', tone: 'pink' },
  { id: 'interview', label: 'Interview day', tone: 'green' },
]

const factorial = n => {
  let result = 1
  for (let i = 2; i <= n; i++) {
    result *= i
    if (!isFinite(result)) return Infinity
  }
  return result
}

export const cheatSheets = [
  {
    id: 'constraints', group: 'foundations', title: 'Constraints → complexity',
    parts: [
      {
        kind: 'constraints', title: 'Constraints → target complexity',
        rows: [
          { n: 'n ≤ 10', target: 'O(n!) or O(2ⁿ·n)', note: 'permutations, brute-force subsets' },
          { n: 'n ≤ 20', target: 'O(2ⁿ)', note: 'bitmask DP, subset enumeration' },
          { n: 'n ≤ 100', target: 'O(n³)', note: 'cubic DP, Floyd–Warshall' },
          { n: 'n ≤ 1,000', target: 'O(n²) (·log n ok)', note: 'pairwise DP, nested loops' },
          { n: 'n ≤ 10⁴', target: 'O(n²) risky · O(n√n) / O(n log n) safer', note: 'n² = 10⁸, borderline in Python' },
          { n: 'n ≤ 10⁵', target: 'O(n log n)', note: 'sort, heap, hashmap, two pointers' },
          { n: 'n ≤ 10⁶', target: 'O(n) · O(n log n) tight', note: 'single pass, hashing, prefix sums' },
          { n: 'n ≤ 10⁸', target: 'O(n) only in C++ — in Python aim log n / √n / O(1)', note: 'Python does ~10⁷ ops/sec' },
          { n: 'n ≥ 10⁹ (or values ≤ 10⁹)', target: 'O(log n) · O(√n) · O(1)', note: 'binary search the answer, or closed-form math' },
        ],
        notes: [
          'budget ≈ 10⁷–10⁸ simple ops/sec · Python ~10⁷',
          'grid R×C ≤ 10⁵ cells → O(R·C)',
          'graph V,E ≤ 10⁵ → O(V+E) or O((V+E) log V)',
          'k small (≤ 20) → exponential in k is fine',
        ],
      },
      {
        kind: 'ladder', title: 'Big-O ladder',
        rows: [
          { label: 'O(1)', fn: () => 1 },
          { label: 'O(log n)', fn: n => Math.log2(n) },
          { label: 'O(√n)', fn: n => Math.sqrt(n) },
          { label: 'O(n)', fn: n => n },
          { label: 'O(n log n)', fn: n => n * Math.log2(n) },
          { label: 'O(n²)', fn: n => n * n },
          { label: 'O(n³)', fn: n => n ** 3 },
          { label: 'O(2ⁿ)', fn: n => 2 ** n },
          { label: 'O(n!)', fn: n => factorial(n) },
        ],
        quiz: [{
          q: 'At n = 10⁶, which complexity finishes closest to about a second on a judge that runs roughly 10⁸–10⁹ simple ops/sec?',
          choices: ['O(n log n)', 'O(n²)', 'O(2ⁿ)', 'O(n!)'],
          answer: 0,
          why: 'O(n log n) at n = 10⁶ is about 2·10⁷ ops — comfortably fast. O(n²) is already 10¹² ops, and O(2ⁿ)/O(n!) are astronomically larger.',
        }],
      },
    ],
  },
  {
    id: 'algos', group: 'foundations', title: 'Complexity reference',
    parts: [
      {
        kind: 'table', title: 'Algorithm complexities',
        headers: ['algorithm', 'time', 'space', 'note'],
        quizCol: 1,
        quizPrompt: row => `Time complexity of ${row[0]}?`,
        rows: [
      ['Linear scan', 'O(n)', 'O(1)', 'single pass over the input'],
      ['Binary search', 'O(log n)', 'O(1)', 'range halves each step'],
      ['Binary search on answer', 'O(n log range)', 'O(1)', 'log(range) feasibility checks, each O(n)'],
      ['Sorting (Python Timsort)', 'O(n log n)', 'O(n)', 'sorted() copies, .sort() is in place'],
      ['Two pointers', 'O(n)', 'O(1)', 'each pointer moves forward at most n times'],
      ['Sliding window', 'O(n)', 'O(k) or O(1)', 'each index enters and leaves the window once'],
      ['BFS / DFS (graph)', 'O(V + E)', 'O(V)', 'each node + edge visited once'],
      ['BFS / DFS (grid)', 'O(R · C)', 'O(R · C)', 'each cell visited once'],
      ['Dijkstra (binary heap)', 'O((V+E) log V)', 'O(V + E)', 'needs non-negative weights'],
      ['Bellman-Ford', 'O(V · E)', 'O(V)', 'handles negative weights, detects negative cycles'],
      ['Floyd–Warshall', 'O(V³)', 'O(V²)', 'all-pairs shortest paths, only for small V'],
      ['Union-Find', '~O(α(n)) per op', 'O(V)', 'path compression + union by rank, near O(1)'],
      ['Prim / Kruskal (MST)', 'O(E log V)', 'O(V + E)', 'Kruskal sorts edges, Prim uses a heap'],
      ['Topological sort', 'O(V + E)', 'O(V)', "Kahn's (BFS) or DFS postorder reversed"],
      ['Heap push / pop', 'O(log n)', 'O(1)', 'heapify a whole list is O(n)'],
      ['Heap top-k', 'O(n log k)', 'O(k)', 'heap sized k beats a full O(n log n) sort'],
      ['Quickselect (kth order stat)', 'O(n) avg · O(n²) worst', 'O(1)', 'like quicksort but recurse one side only'],
      ['Backtracking: subsets', 'O(2ⁿ · n)', 'O(n)', '2ⁿ leaves, up to n to copy each'],
      ['Backtracking: permutations', 'O(n! · n)', 'O(n)', 'n! orderings, up to n to copy each'],
      ['1-D dynamic programming', 'O(n) states × O(1) transition', 'O(n) → O(1) rolled', 'one subproblem per index'],
      ['2-D dynamic programming', 'O(n · m)', 'O(n · m) → O(m) rolled', 'grid or two-string DP'],
      ['0/1 knapsack', 'O(n · capacity)', 'O(capacity)', 'one pass per item, 1-D rolling array'],
      ['Trie insert / search', 'O(L)', 'O(total chars)', 'L = word or prefix length'],
      ['KMP substring search', 'O(n + m)', 'O(m)', 'prefix-function avoids re-scanning text'],
        ],
      },
      {
        kind: 'notes', title: 'Space complexity reminders',
        rows: [
          { label: 'Recursion depth', note: 'O(h) balanced tree/graph · O(n) skewed or linked-list shape — counts the call stack' },
          { label: 'BFS / level queue', note: 'O(width) — the widest frontier or level, not the total node count' },
          { label: 'Output space', note: 'usually stated separately — say "O(1) extra, excluding the output"' },
          { label: 'In-place', note: 'O(1) extra — mutate the input, allocate nothing new' },
          { label: 'Memo table', note: 'O(distinct states) — one slot per subproblem, not per call' },
          { label: 'Rolling DP array', note: 'a 2-D table often collapses to O(m) or O(1) if each row only needs the row above it' },
          { label: 'Backtracking', note: 'O(depth) for the path/stack, plus O(results · size) if you collect every solution' },
          { label: 'Union-Find', note: 'O(n) for parent and rank arrays, independent of how many unions you run' },
          { label: 'Trie', note: 'O(total characters inserted) in the worst case, shared prefixes reduce it' },
          { label: 'Sliding window', note: 'O(window) or O(alphabet) for the counts map, not O(n)' },
        ],
        quiz: [{
          q: 'A recursive DFS walks a binary tree that happens to be a straight chain (every node has exactly one child). What is the recursion stack space?',
          choices: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'],
          answer: 0,
          why: 'A chain-shaped tree has height n, so the call stack holds one frame per node — O(h) with h = n here, not the O(log n) you would get for a balanced tree.',
        }],
      },
    ],
  },
  {
    id: 'signals', group: 'foundations', title: 'Pattern recognition signals', kind: 'signals',
    quizPrompt: row => `${row[0]} → which pattern fits best?`,
    rows: [
      ['sorted array, find a pair/triple', 'two pointers'],
      ['sorted array, find one value', 'binary search'],
      ['rotated sorted array', 'modified binary search'],
      ['find the boundary of a yes/no condition', 'binary search on the answer'],
      ['kth largest / smallest element', 'heap · quickselect'],
      ['k closest points / elements', 'heap of size k'],
      ['median of a data stream', 'two heaps (max-heap + min-heap)'],
      ['contiguous subarray / substring, fixed length', 'sliding window (fixed size)'],
      ['contiguous subarray / substring, "smallest/longest that satisfies X"', 'sliding window (variable size)'],
      ['subarray sum equals k', 'prefix sum + hashmap'],
      ['range sum queries, many of them', 'prefix sum array'],
      ['next greater / smaller element', 'monotonic stack'],
      ['sliding window maximum / minimum', 'monotonic deque'],
      ['valid parentheses / matching brackets', 'stack'],
      ['evaluate an expression', 'stack'],
      ['daily temperatures / stock span', 'monotonic stack'],
      ['shortest path, unweighted graph or grid', 'BFS'],
      ['shortest path, weighted, non-negative', 'Dijkstra'],
      ['shortest path, negative weights allowed', 'Bellman-Ford'],
      ['dependencies / prerequisites / build order', 'topological sort'],
      ['connected components / groups / friend circles', 'union-find · DFS'],
      ['number of islands / flood fill', 'BFS/DFS on a grid'],
      ['word ladder / transform one string to another', 'BFS over an implicit graph'],
      ['clone a graph', 'BFS/DFS + hashmap of visited → copy'],
      ['connect all points cheaply', 'MST (Prim/Kruskal)'],
      ['all combinations / subsets / orderings', 'backtracking'],
      ['N-Queens / Sudoku / constraint puzzles', 'backtracking with pruning'],
      ['count ways to reach a state', 'dynamic programming'],
      ['min or max cost to reach a state', 'dynamic programming'],
      ['can you partition into equal/target sums', 'DP subset-sum / knapsack'],
      ['longest common subsequence / edit distance', '2-D DP over two strings'],
      ['longest increasing subsequence', 'DP or patience sort + binary search'],
      ['unique paths through a grid', '2-D DP'],
      ['word break into dictionary words', '1-D DP'],
      ['coin change, minimum count', 'unbounded knapsack DP'],
      ['intervals: merge / insert / overlap', 'sort by start, then sweep'],
      ['max non-overlapping intervals', 'greedy — sort by end time'],
      ['meeting rooms needed at once', 'heap of end times or sweep line'],
      ['LRU / LFU cache, O(1) get + put', 'hashmap + doubly linked list'],
      ['autocomplete / prefix search', 'trie'],
      ['detect a cycle in a linked list', "Floyd's slow/fast pointers"],
      ['find the middle of a linked list', 'slow/fast pointers'],
      ['reverse a linked list (in place)', 'three-pointer iterative reversal'],
      ['small n (≤ 20), try every subset', 'bitmask DP'],
      ['single number / everything pairs up except one', 'XOR'],
      ['count set bits / toggle a flag', 'bit manipulation'],
      ['palindrome substring', 'expand around center · DP'],
      ['buy/sell stock for max profit', 'single pass, track running minimum'],
      ['at most k distinct characters in a window', 'sliding window + hashmap of counts'],
    ],
  },

  {
    id: 'python-ops', group: 'python', title: 'Python operation costs',
    parts: [
      {
        kind: 'table', title: 'list',
        headers: ['operation', 'cost'], quizCol: 1, quizPrompt: row => `Cost of ${row[0]} on a Python list?`,
        rows: [
          ['lst[i]', 'O(1)'],
          ['lst[a:b]', 'O(b-a)'],
          ['lst.append(x) / lst.pop()', 'O(1) amortized'],
          ['lst.pop(0) / lst.insert(0, x)', 'O(n) — shifts every element'],
          ['x in lst', 'O(n)'],
          ['lst.index(x) / lst.count(x)', 'O(n)'],
          ['lst.sort() / sorted(lst)', 'O(n log n)'],
          ['lst.reverse() / lst[::-1]', 'O(n)'],
          ['lst.extend(iterable)', 'O(k), k = len(iterable)'],
          ['list(iterable) / lst.copy()', 'O(n)'],
          ['min(lst) / max(lst) / sum(lst)', 'O(n)'],
          ['len(lst)', 'O(1)'],
        ],
      },
      {
        kind: 'table', title: 'dict & set',
        headers: ['operation', 'cost'], quizCol: 1, quizPrompt: row => `Cost of ${row[0]}?`,
        rows: [
          ['d[k] = v', 'O(1) average'],
          ['k in d / k in s', 'O(1) average'],
          ['del d[k] / s.remove(x)', 'O(1) average'],
          ['d.get(k, default)', 'O(1) average'],
          ['dict(pairs) / {k: v for ...}', 'O(n)'],
          ['Counter(iterable)', 'O(n)'],
          ['defaultdict(list)[k].append(x)', 'O(1) average — no KeyError'],
          ['a | b / a & b / a - b (sets)', 'O(len(a) + len(b))'],
          ['sorted(d) / sorted(d.items())', 'O(n log n)'],
          ['all/any worst case (hash collisions)', 'O(n) — rare in practice'],
        ],
      },
      {
        kind: 'table', title: 'deque',
        headers: ['operation', 'cost'], quizCol: 1, quizPrompt: row => `Cost of ${row[0]} on a collections.deque?`,
        rows: [
          ['dq.append(x) / dq.appendleft(x)', 'O(1)'],
          ['dq.pop() / dq.popleft()', 'O(1)'],
          ['dq[i]', 'O(n) — no random access, walks from the near end'],
          ['dq.rotate(k)', 'O(k)'],
          ['dq.extend(it) / dq.extendleft(it)', 'O(k), k = len(it)'],
          ['x in dq', 'O(n)'],
        ],
      },
      {
        kind: 'table', title: 'heapq',
        headers: ['operation', 'cost'], quizCol: 1, quizPrompt: row => `Cost of ${row[0]} with heapq?`,
        rows: [
          ['heappush(heap, x)', 'O(log n)'],
          ['heappop(heap)', 'O(log n)'],
          ['heap[0] (peek min)', 'O(1)'],
          ['heapify(list)', 'O(n)'],
          ['heapreplace(heap, x)', 'O(log n) — pop then push in one step'],
          ['heappushpop(heap, x)', 'O(log n) — push then pop, faster than two calls'],
          ['nlargest(k, it) / nsmallest(k, it)', 'O(n log k)'],
        ],
      },
      {
        kind: 'table', title: 'bisect',
        headers: ['operation', 'cost'], quizCol: 1, quizPrompt: row => `Cost of ${row[0]}?`,
        rows: [
          ['bisect_left(a, x) / bisect_right(a, x)', 'O(log n) — binary search for the insertion point'],
          ['insort_left(a, x) / insort(a, x)', 'O(n) — the O(log n) search plus an O(n) shift to insert'],
          ['a must already be sorted', 'bisect never sorts for you'],
        ],
      },
      {
        kind: 'table', title: 'str',
        headers: ['operation', 'cost'], quizCol: 1, quizPrompt: row => `Cost of ${row[0]}?`,
        rows: [
          ['s[i] / s[a:b]', 'O(1) / O(b-a)'],
          ['s + t in a loop, repeated', 'O(n²) total — each += copies the whole string'],
          ["''.join(parts)", 'O(n) total — builds the string once'],
          ['s[::-1]', 'O(n)'],
          ['x in s (substring search)', 'O(n·m) worst case'],
          ['s.split() / s.strip()', 'O(n)'],
          ['s == t', 'O(min(len(s), len(t))) — short-circuits on first mismatch'],
          ['f"{value}" / str.format', 'O(n) in the result length'],
        ],
      },
      {
        kind: 'idioms', title: 'Idioms & gotchas',
        quiz: [
          {
            q: 'Why is `def f(x, cache={}):` dangerous?',
            choices: ['The default dict is created once and shared across every call', 'Dicts cannot be function arguments', 'It raises a SyntaxError', 'It makes the function run in O(n) instead of O(1)'],
            answer: 0,
            why: 'Default argument values are evaluated once, at function definition time, so a mutable default keeps state between unrelated calls.',
          },
          {
            q: 'What does `for i, value in enumerate(nums):` avoid?',
            choices: ['Indexing with nums[i] inside a range(len(nums)) loop', 'Using a while loop', 'Importing itertools', 'Sorting the list first'],
            answer: 0,
            why: 'enumerate pairs each index with its value directly, which is clearer and just as fast as range(len(nums)) + indexing.',
          },
        ],
        rows: [
          { bad: 'def f(x, cache={}):', good: 'def f(x, cache=None):\n    cache = cache if cache is not None else {}', note: 'mutable default arguments persist across calls' },
          { bad: 'for i in range(len(nums)):\n    v = nums[i]', good: 'for i, v in enumerate(nums):', note: 'enumerate gives index + value together' },
          { bad: 'for i in range(len(a)):\n    x, y = a[i], b[i]', good: 'for x, y in zip(a, b):', note: 'zip walks two sequences in parallel' },
          { bad: 'if len(items) == 0:', good: 'if not items:', note: 'empty list/dict/str/tuple are falsy' },
          { bad: 'if x == None:', good: 'if x is None:', note: 'None is a singleton — compare identity, not equality' },
          { bad: 'try:\n    risky()\nexcept:', good: 'try:\n    risky()\nexcept ValueError:', note: 'bare except hides real bugs, including KeyboardInterrupt' },
          { bad: "d = {}\nif k not in d:\n    d[k] = []\nd[k].append(x)", good: 'd = defaultdict(list)\nd[k].append(x)', note: 'defaultdict skips the manual key-check' },
          { bad: 'result = ""\nfor part in parts:\n    result += part', good: "result = ''.join(parts)", note: 'repeated += on strings is O(n²); join is O(n)' },
          { bad: 'new_list = old_list', good: 'new_list = old_list.copy()', note: 'assignment aliases the same list; .copy() (or list(old_list)) makes a real new one' },
          { bad: 'nums.sort()\nnums = nums[::-1]', good: 'nums.sort(reverse=True)', note: 'one sort call instead of a sort plus a reverse' },
          { bad: "sorted(people, key=lambda p: (p['age'], p['name']))", good: 'from operator import itemgetter\nsorted(people, key=itemgetter("age", "name"))', note: 'itemgetter reads cleaner than a lambda for simple key extraction' },
          { bad: 'first, second, rest = a[0], a[1], a[2:]', good: 'first, second, *rest = a', note: 'starred unpacking grabs "everything else" in one line' },
          { bad: 'mid = (left + right) / 2', good: 'mid = (left + right) // 2', note: '/ returns a float in Python 3 — always use // for an index' },
          { bad: 'def fib(n):\n    if n <= 1: return n\n    return fib(n-1) + fib(n-2)', good: 'from functools import lru_cache\n@lru_cache(maxsize=None)\ndef fib(n):\n    if n <= 1: return n\n    return fib(n-1) + fib(n-2)', note: 'lru_cache adds memoization to plain recursion with one line' },
          { bad: 'import sys\nsys.setrecursionlimit(100000)', good: 'rewrite the recursion as an explicit stack or iterative loop', note: "raising the limit just masks the issue — Python's default recursion depth is ~1000, and deep recursion on a long list/skewed tree can still overflow the real C stack" },
        ],
      },
    ],
  },

  {
    id: 'two-pointers-windows', group: 'patterns', title: 'Two pointers & sliding window',
    parts: [
      {
        kind: 'code', title: 'Two pointers',
        when: 'Sorted array (or two sorted arrays), looking for a pair/triple, or comparing from both ends.',
        complexity: 'O(n) time · O(1) extra space',
        code: `def twoSumSorted(numbers, target):
    left, right = 0, len(numbers) - 1
    while left < right:
        total = numbers[left] + numbers[right]
        if total == target:
            return [left, right]
        if total < target:
            left += 1
        else:
            right -= 1
    return [-1, -1]`,
        quiz: [{
          q: 'The array is sorted and you need a pair that sums to a target. Two pointers beat brute force because:',
          choices: ['Each failed comparison eliminates a whole range of pairs at once', 'It avoids using extra memory for a hashmap, which is the only benefit', 'It works even when the array is unsorted', 'It has the same O(n²) complexity but simpler code'],
          answer: 0,
          why: 'If the sum is too small, every pair using the current left index is too small, so left can jump forward past all of them in one step — same idea from the right.',
        }],
      },
      {
        kind: 'code', title: 'Sliding window — fixed size',
        when: 'Subarray/substring of an exact length k — find the best sum/average/count over every window of size k.',
        complexity: 'O(n) time · O(1) extra space',
        code: `def maxFixedWindowSum(nums, k):
    windowSum = sum(nums[:k])
    best = windowSum
    for i in range(k, len(nums)):
        windowSum += nums[i] - nums[i - k]
        best = max(best, windowSum)
    return best`,
        quiz: [{
          q: 'In a fixed-size sliding window, when you move one step to the right you:',
          choices: ['Add the entering element and subtract the one leaving the window', 'Recompute the sum of all k elements from scratch', 'Only add — windows never shrink', 'Re-sort the window'],
          answer: 0,
          why: 'Updating in O(1) per step (add new, remove old) is what keeps the whole scan at O(n) instead of O(n·k).',
        }],
      },
      {
        kind: 'code', title: 'Sliding window — variable size',
        when: '"Smallest/longest subarray or substring such that ___" — the window grows and shrinks based on a condition.',
        complexity: 'O(n) time · O(1) or O(alphabet) extra space',
        code: `def smallestSubarrayAtLeast(nums, target):
    left = 0
    total = 0
    best = float('inf')
    for right, value in enumerate(nums):
        total += value
        while total >= target:
            best = min(best, right - left + 1)
            total -= nums[left]
            left += 1
    return best if best != float('inf') else 0`,
        quiz: [{
          q: 'In a variable-size window, the inner while loop shrinks the window from the left while:',
          choices: ['The current window still satisfies the condition, so you try to shrink it further', 'The window is empty', 'right has not moved yet', 'left has reached the end of the array'],
          answer: 0,
          why: "Once the window is valid, shrinking from the left looks for a smaller valid window before right advances again — that's what keeps both pointers each moving at most n times total.",
        }],
      },
    ],
  },
  {
    id: 'binary-search', group: 'patterns', title: 'Binary search',
    parts: [
      {
        kind: 'code', title: 'Binary search',
        when: 'Sorted array, find the index of an exact target (or the first/last position where a condition flips).',
        complexity: 'O(log n) time · O(1) extra space',
        code: `def binarySearch(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
        quiz: [{
          q: 'Why write `mid = left + (right - left) // 2` instead of `mid = (left + right) // 2`?',
          choices: ['It avoids integer overflow in languages with fixed-width ints (harmless habit in Python)', 'It is required for the loop to terminate', 'It changes the result for an odd-length range', 'It makes the search O(1) instead of O(log n)'],
          answer: 0,
          why: "Python ints never overflow, but the habit carries over from languages that do — it's a safe default either way.",
        }],
      },
      {
        kind: 'code', title: 'Binary search on the answer',
        when: '"Minimum/maximum value such that a feasibility check passes" — the answer space is monotonic (false...false, true...true).',
        complexity: 'O(log(range) · cost of feasible)',
        code: `def binarySearchOnAnswer(lo, hi, feasible):
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if feasible(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo`,
        quiz: [{
          q: 'Binary search on the answer requires that `feasible(x)` be:',
          choices: ['Monotonic — once it turns true, it stays true for all larger x (or the mirror for smaller)', 'O(1) to evaluate', 'Called on every integer in the range', 'True for exactly one value of x'],
          answer: 0,
          why: 'Without monotonicity, moving lo/hi based on one feasible() call could skip past the real answer.',
        }],
      },
    ],
  },
  {
    id: 'prefix-monostack', group: 'patterns', title: 'Prefix sums & monotonic stack',
    parts: [
      {
        kind: 'code', title: 'Prefix sum + hashmap',
        when: '"Number of subarrays with sum equal to k" — any running-total question over a subarray.',
        complexity: 'O(n) time · O(n) extra space',
        code: `def subarraySumEqualsK(nums, k):
    countByPrefix = {0: 1}
    prefix = 0
    answer = 0
    for value in nums:
        prefix += value
        answer += countByPrefix.get(prefix - k, 0)
        countByPrefix[prefix] = countByPrefix.get(prefix, 0) + 1
    return answer`,
        quiz: [{
          q: 'Why does the hashmap start with `{0: 1}` before the loop runs?',
          choices: ['So a subarray starting at index 0 that already sums to k is counted', 'To avoid a KeyError on the first lookup only, it has no effect on the answer', 'Because prefix sums must start at 1, not 0', 'It initializes the running total, not the map'],
          answer: 0,
          why: 'A prefix sum of exactly k is "prefix - k == 0", so you need a count for the empty prefix to catch subarrays starting at the very beginning.',
        }],
      },
      {
        kind: 'code-multi', title: 'Monotonic stack / deque',
        when: '"Next greater/smaller element" uses a monotonic stack. "Sliding window max/min" uses a monotonic deque.',
        complexity: 'O(n) time · O(n) extra space — each index is pushed and popped at most once',
        snippets: [
          {
            label: 'Next greater element (monotonic stack)',
            code: `def nextGreaterElement(nums):
    result = [-1] * len(nums)
    stack = []
    for i, value in enumerate(nums):
        while stack and nums[stack[-1]] < value:
            result[stack.pop()] = value
        stack.append(i)
    return result`,
          },
          {
            label: 'Sliding window maximum (monotonic deque)',
            code: `def slidingWindowMaximum(nums, k):
    window = deque()
    result = []
    for i, value in enumerate(nums):
        while window and nums[window[-1]] <= value:
            window.pop()
        window.append(i)
        if window[0] <= i - k:
            window.popleft()
        if i >= k - 1:
            result.append(nums[window[0]])
    return result`,
          },
        ],
        quiz: [{
          q: 'Why is the total work across the whole monotonic stack/deque scan O(n) even though there is a while loop inside the for loop?',
          choices: ['Each index is pushed once and popped at most once, so total pushes + pops is bounded by 2n', 'The while loop only ever runs once total, not once per index', 'The stack is capped at a fixed size', 'Python optimizes nested loops automatically'],
          answer: 0,
          why: 'This is amortized analysis: count total pushes and pops across the whole run, not per-iteration worst case.',
        }],
      },
    ],
  },
  {
    id: 'graph-traversal', group: 'patterns', title: 'Graph traversal: BFS/DFS, topo sort & Dijkstra',
    parts: [
      {
        kind: 'code-multi', title: 'BFS / DFS on a grid',
        when: 'Shortest path / number of steps → BFS. Connectivity, flood fill, "can you reach" → either works, DFS is simpler to write.',
        complexity: 'O(rows · cols) time and space',
        snippets: [
          {
            label: 'BFS — shortest number of steps',
            code: `def bfsShortestSteps(grid, startRow, startCol, targetRow, targetCol):
    rows, cols = len(grid), len(grid[0])
    seen = {(startRow, startCol)}
    queue = deque([(startRow, startCol)])
    steps = 0
    while queue:
        for _ in range(len(queue)):
            row, col = queue.popleft()
            if (row, col) == (targetRow, targetCol):
                return steps
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = row + dr, col + dc
                if 0 <= nr < rows and 0 <= nc < cols and (nr, nc) not in seen and grid[nr][nc] != '#':
                    seen.add((nr, nc))
                    queue.append((nr, nc))
        steps += 1
    return -1`,
          },
          {
            label: 'DFS — flood fill / mark connected region',
            code: `def dfsFloodFill(grid, row, col, seen):
    rows, cols = len(grid), len(grid[0])
    if not (0 <= row < rows and 0 <= col < cols):
        return
    if (row, col) in seen or grid[row][col] == '#':
        return
    seen.add((row, col))
    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        dfsFloodFill(grid, row + dr, col + dc, seen)`,
          },
        ],
        quiz: [{
          q: 'Why does the BFS snippet drain the queue level by level with `for _ in range(len(queue))` instead of popping one node at a time?',
          choices: ['It lets the code count steps/levels, since every node popped in that inner loop is the same distance from the start', 'It is required to avoid revisiting nodes', 'It makes the algorithm DFS instead of BFS', 'It reduces the time complexity to O(log n)'],
          answer: 0,
          why: 'Freezing the queue length at the start of each round means everything popped in that round is exactly `steps` moves from the source.',
        }],
      },
      {
        kind: 'code', title: "Topological sort (Kahn's)",
        when: 'Ordering with dependencies / prerequisites — "can you finish all courses", "build order".',
        complexity: 'O(V + E) time · O(V + E) space',
        code: `def topologicalOrder(numNodes, edges):
    graph = defaultdict(list)
    indegree = [0] * numNodes
    for src, dst in edges:
        graph[src].append(dst)
        indegree[dst] += 1
    queue = deque(node for node in range(numNodes) if indegree[node] == 0)
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for nxt in graph[node]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                queue.append(nxt)
    return order if len(order) == numNodes else []`,
        quiz: [{
          q: 'If `len(order) < numNodes` at the end of Kahn\'s algorithm, that means:',
          choices: ['The graph has a cycle, so a full ordering is impossible', 'Some nodes have no edges at all', 'The queue was initialized incorrectly', 'The graph is disconnected but acyclic'],
          answer: 0,
          why: 'Nodes stuck in a cycle never reach indegree 0, so they never get added to the queue or the output order.',
        }],
      },
      {
        kind: 'code', title: "Dijkstra's algorithm",
        when: 'Shortest path with non-negative weights.',
        complexity: 'O((V + E) log V) time · O(V + E) space',
        code: `def dijkstra(numNodes, graph, source):
    distance = [float('inf')] * numNodes
    distance[source] = 0
    heap = [(0, source)]
    while heap:
        dist, node = heappop(heap)
        if dist > distance[node]:
            continue
        for neighbor, weight in graph[node]:
            newDist = dist + weight
            if newDist < distance[neighbor]:
                distance[neighbor] = newDist
                heappush(heap, (newDist, neighbor))
    return distance`,
        quiz: [{
          q: 'Why does the loop check `if dist > distance[node]: continue`?',
          choices: ['The heap can hold stale, outdated entries for a node whose distance was already improved — skip them', 'It is how negative weights are handled', 'It prevents the heap from growing too large', 'It is required to detect unreachable nodes'],
          answer: 0,
          why: "Since there's no decrease-key in Python's heapq, you push a new (dist, node) pair instead of updating in place, so old, larger entries linger and need to be skipped.",
        }],
      },
    ],
  },
  {
    id: 'unionfind-mst', group: 'patterns', title: 'Union-Find & minimum spanning tree',
    parts: [
      {
        kind: 'code', title: 'Union-Find (disjoint set)',
        when: 'Connected components, cycle detection in an undirected graph, "connect all points", Kruskal\'s MST.',
        complexity: '~O(α(n)) per operation (practically constant) · O(n) space',
        code: `class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, a, b):
        rootA, rootB = self.find(a), self.find(b)
        if rootA == rootB:
            return False
        if self.rank[rootA] < self.rank[rootB]:
            rootA, rootB = rootB, rootA
        self.parent[rootB] = rootA
        if self.rank[rootA] == self.rank[rootB]:
            self.rank[rootA] += 1
        return True`,
        quiz: [{
          q: 'What does `union(a, b)` returning `False` tell you?',
          choices: ['a and b were already in the same component — this edge would create a cycle', 'a or b is out of range', 'The union failed due to a bug', 'a and b are not connected'],
          answer: 0,
          why: 'find(a) == find(b) before the union means they already share a root, so adding this edge connects a component to itself.',
        }],
      },
      {
        kind: 'code', title: 'Minimum spanning tree (Kruskal)',
        when: 'Connect all nodes with the least total edge weight, no cycles — "cheapest network connecting all points".',
        complexity: 'O(E log E) time (dominated by the sort) · O(V) space',
        code: `def minimumSpanningTreeWeight(numNodes, edges):
    unionFind = UnionFind(numNodes)
    totalWeight = 0
    edgesUsed = 0
    for weight, a, b in sorted(edges):
        if unionFind.union(a, b):
            totalWeight += weight
            edgesUsed += 1
    return totalWeight if edgesUsed == numNodes - 1 else -1`,
        quiz: [{
          q: "Kruskal's algorithm greedily takes the smallest edge that:",
          choices: ['Does not connect two nodes already in the same component (no cycle)', 'Touches the most recently added node', 'Has the smallest node index', 'Is adjacent to the starting node'],
          answer: 0,
          why: 'Union-Find rejects an edge whose endpoints already share a root, which is exactly "would create a cycle".',
        }],
      },
    ],
  },
  {
    id: 'backtracking-dp', group: 'patterns', title: 'Backtracking & dynamic programming',
    parts: [
      {
        kind: 'code-multi', title: 'Backtracking',
    when: 'Generate all subsets/permutations/combinations, or search with constraints you can prune early (N-Queens, Sudoku).',
        complexity: 'Exponential — bounded by the number of valid paths explored, e.g. O(2ⁿ) for subsets, O(n!) for permutations',
        snippets: [
          {
            label: 'Generic shape',
            code: `def backtrack(path, choices, results):
    if isSolution(path):
        results.append(path[:])
        return
    for choice in choices:
        if not isValid(choice, path):
            continue
        path.append(choice)
        backtrack(path, nextChoices(choices, choice), results)
        path.pop()`,
          },
          {
            label: 'Concrete — all subsets',
            code: `def subsets(nums):
    results = []
    def backtrack(start, path):
        results.append(path[:])
        for i in range(start, len(nums)):
            path.append(nums[i])
            backtrack(i + 1, path)
            path.pop()
    backtrack(0, [])
    return results`,
          },
        ],
        quiz: [{
          q: 'Why does `results.append(path[:])` use a slice instead of `results.append(path)`?',
          choices: ['path is mutated and reused for every branch, so you need a snapshot, not a reference to the same list', 'path[:] is required syntax for backtracking', 'It sorts the path before appending', 'It converts the list to a tuple'],
          answer: 0,
          why: "Without the copy, every entry in results would point to the same list object, which ends up empty once path.pop() unwinds back to the top.",
        }],
      },
      {
        kind: 'code', title: '1-D dynamic programming',
        when: '"Min/max/count ways" where the state is just "up to index i" — climbing stairs, house robber, word break.',
        complexity: 'O(n) time · O(n) space, often rollable to O(1)',
        code: `def houseRobber(nums):
    takeCurrent, skipCurrent = 0, 0
    for value in nums:
        takeCurrent, skipCurrent = skipCurrent + value, max(takeCurrent, skipCurrent)
    return max(takeCurrent, skipCurrent)`,
        quiz: [{
          q: 'This house-robber solution uses O(1) space instead of an O(n) dp array because:',
          choices: ['Each state only ever depends on the previous two states, so only those need to be kept', 'The array is sorted first', 'Python lists are always O(1) space', 'It uses recursion instead of iteration'],
          answer: 0,
          why: 'dp[i] here only reads dp[i-1] and dp[i-2]-equivalents, so two rolling variables are enough — a common 1-D DP space optimization.',
        }],
      },
      {
        kind: 'code', title: '2-D dynamic programming',
        when: 'State depends on two indices — two strings (LCS, edit distance) or a grid (unique paths, min path sum).',
        complexity: 'O(n · m) time · O(n · m) space, often rollable to O(m)',
        code: `def longestCommonSubsequence(a, b):
    dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[len(a)][len(b)]`,
        quiz: [{
          q: 'In this LCS table, `dp[i][j]` represents:',
          choices: ['The LCS length using the first i characters of a and the first j characters of b', 'The edit distance between a and b', 'The number of common substrings', 'The index of the first mismatch'],
          answer: 0,
          why: 'The table is built on prefixes, which is why it is sized (len(a)+1) by (len(b)+1) to include the empty-prefix row/column.',
        }],
      },
      {
        kind: 'code', title: '0/1 knapsack',
        when: '"Pick a subset of items under a weight/capacity limit to maximize value" — each item used at most once.',
        complexity: 'O(n · capacity) time · O(capacity) space (rolling 1-D array)',
        code: `def zeroOneKnapsack(weights, values, capacity):
    dp = [0] * (capacity + 1)
    for weight, value in zip(weights, values):
        for cap in range(capacity, weight - 1, -1):
            dp[cap] = max(dp[cap], dp[cap - weight] + value)
    return dp[capacity]`,
        quiz: [{
          q: 'Why does the inner loop go from `capacity` down to `weight`, instead of forward?',
          choices: ['Iterating backward stops this item from being counted twice in the same pass (0/1, not unbounded)', 'Forward iteration would raise an IndexError', 'It makes the algorithm O(log n) instead of O(n)', 'Backward iteration is only a style preference, both directions give the same result'],
          answer: 0,
          why: 'Going forward would let dp[cap - weight] already include this same item from earlier in the same row — that turns 0/1 knapsack into unbounded (unlimited copies) knapsack.',
        }],
      },
      {
        kind: 'code', title: 'Longest increasing subsequence',
        when: 'Longest strictly increasing (or non-decreasing) run picked from the array, not necessarily contiguous.',
        complexity: 'O(n log n) time · O(n) space (O(n²) with the simpler DP version)',
        code: `def longestIncreasingSubsequence(nums):
    tails = []
    for value in nums:
        index = bisect_left(tails, value)
        if index == len(tails):
            tails.append(value)
        else:
            tails[index] = value
    return len(tails)`,
        quiz: [{
          q: '`tails` in this patience-sorting LIS solution holds:',
          choices: ['The smallest possible tail value for an increasing subsequence of each length seen so far', 'The actual longest increasing subsequence itself', 'Every element of nums in sorted order', 'The indices of the LIS elements'],
          answer: 0,
          why: 'tails is not the real subsequence — len(tails) is the LIS length, because keeping the smallest tail per length leaves the most room to extend later.',
        }],
      },
    ],
  },
  {
    id: 'intervals-heap', group: 'patterns', title: 'Intervals & heap top-k',
    parts: [
      {
        kind: 'code', title: 'Intervals — merge & sweep',
        when: 'Merge overlapping intervals, insert a new one, or count overlaps at a point in time.',
        complexity: 'O(n log n) time (the sort dominates) · O(n) space',
        code: `def mergeIntervals(intervals):
    intervals.sort(key=lambda interval: interval[0])
    merged = [intervals[0]]
    for start, end in intervals[1:]:
        lastEnd = merged[-1][1]
        if start <= lastEnd:
            merged[-1][1] = max(lastEnd, end)
        else:
            merged.append([start, end])
    return merged`,
        quiz: [{
          q: 'Why must the intervals be sorted by start time before the sweep?',
          choices: ['So each interval only needs to be compared against the last merged interval, not all previous ones', 'Sorting is required by Python lists', 'It changes the time complexity from O(n) to O(n log n) with no other benefit', 'To make the output intervals non-overlapping by definition'],
          answer: 0,
          why: 'Once sorted, any overlap can only happen with the most recently merged interval, so one linear pass after the sort is enough.',
        }],
      },
      {
        kind: 'code', title: 'Heap — top-k',
        when: '"k largest/smallest/most frequent elements" out of a big collection, when k is much smaller than n.',
        complexity: 'O(n log k) time · O(k) space',
        code: `def kLargest(nums, k):
    heap = nums[:k]
    heapify(heap)
    for value in nums[k:]:
        if value > heap[0]:
            heapreplace(heap, value)
    return heap`,
        quiz: [{
          q: 'Why keep a min-heap of size k to find the k largest elements?',
          choices: ['The smallest element in the heap (the root) is the weakest of your current top k, cheap to compare and evict', 'A max-heap cannot hold more than one element in Python', 'Min-heaps are always faster than max-heaps', 'It is required because heapq cannot pop the maximum'],
          answer: 0,
          why: "heap[0] is the heap's minimum; if a new value beats the weakest member of your current top-k, it replaces it in O(log k).",
        }],
      },
    ],
  },
  {
    id: 'trie-bits', group: 'patterns', title: 'Trie & bit tricks',
    parts: [
      {
        kind: 'code', title: 'Trie',
        when: 'Prefix search, autocomplete, "does any word start with this prefix", word search on a board.',
        complexity: 'O(L) per insert/search, L = word or prefix length · O(total characters) space',
        code: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.isWord = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for ch in word:
            node = node.children.setdefault(ch, TrieNode())
        node.isWord = True

    def search(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                return False
            node = node.children[ch]
        return node.isWord`,
        quiz: [{
          q: 'What does `node.children.setdefault(ch, TrieNode())` do during insert?',
          choices: ['Reuses the existing child node for ch if present, otherwise creates and stores a new one', 'Overwrites the child node for ch every time', 'Deletes any existing word ending at that node', 'Only works the first time a word is inserted'],
          answer: 0,
          why: "setdefault returns the existing value if the key is present, which is exactly how shared prefixes end up sharing trie nodes instead of duplicating them.",
        }],
      },
      {
        kind: 'table', title: 'Bit tricks',
        headers: ['expression', 'meaning'],
        rows: [
          ['n & 1', 'parity / is n odd'],
          ['n & (n - 1)', 'clear the lowest set bit'],
          ['n & (-n)', 'isolate the lowest set bit'],
          ['n | (1 << i)', 'set bit i'],
          ['n & ~(1 << i)', 'clear bit i'],
          ['n ^ (1 << i)', 'toggle bit i'],
          ['(n >> i) & 1', 'read bit i'],
          ['n > 0 and n & (n - 1) == 0', 'n is a power of two'],
          ['result ^= value (loop over all values)', 'single-number trick — every value that appears twice cancels out'],
          ['bin(n).count("1")', "count set bits (built-in, no manual loop needed)"],
          ['n << 1 / n >> 1', 'multiply / divide by 2'],
        ],
        quiz: [{
          q: 'Every number in an array appears twice except one. The fastest way to find it is:',
          choices: ['XOR every value together — pairs cancel to 0, leaving the lone value', 'Sort the array and scan for a gap', 'Use a hashmap of counts', 'Binary search for the odd one out'],
          answer: 0,
          why: 'x ^ x == 0 and x ^ 0 == x, so XOR-ing the whole array leaves only the unpaired value, in O(n) time and O(1) space.',
        }],
      },
    ],
  },

  {
    id: 'core-templates', group: 'structures', title: 'Trees, lists & recursion templates',
    parts: [
      {
        kind: 'code-multi', title: 'Tree traversal templates',
        when: 'Preorder/inorder/postorder visit order; BFS level order when you need "by depth" results.',
        complexity: 'O(n) time · O(h) space recursive (O(n) for BFS, h = height)',
        snippets: [
          {
            label: 'Preorder (root, left, right) — recursive',
            code: `def preorder(root):
    if not root:
        return []
    return [root.val] + preorder(root.left) + preorder(root.right)`,
          },
          {
            label: 'Inorder (left, root, right) — iterative',
            code: `def inorderIterative(root):
    result, stack = [], []
    node = root
    while stack or node:
        while node:
            stack.append(node)
            node = node.left
        node = stack.pop()
        result.append(node.val)
        node = node.right
    return result`,
          },
          {
            label: 'Level order (BFS)',
            code: `def levelOrder(root):
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
          },
        ],
        quiz: [{
          q: 'Which traversal visits nodes of a binary search tree in sorted order?',
          choices: ['Inorder', 'Preorder', 'Postorder', 'Level order'],
          answer: 0,
          why: 'Inorder visits left subtree, then root, then right subtree — for a BST that is exactly ascending sorted order.',
        }],
      },
      {
        kind: 'code-multi', title: 'Linked list surgery',
        when: 'Reverse, find the middle, detect a cycle, merge two sorted lists, remove the nth node from the end — almost always with a dummy head and/or slow-fast pointers.',
        complexity: 'O(n) time · O(1) extra space for all five',
        snippets: [
          {
            label: 'Reverse a linked list',
            code: `def reverseList(head):
    previous = None
    while head:
        nextNode = head.next
        head.next = previous
        previous = head
        head = nextNode
    return previous`,
          },
          {
            label: 'Find the middle (slow/fast pointers)',
            code: `def findMiddle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow`,
          },
          {
            label: 'Detect a cycle',
            code: `def hasCycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False`,
          },
          {
            label: 'Merge two sorted lists',
            code: `def mergeTwoLists(a, b):
    dummy = tail = ListNode()
    while a and b:
        if a.val <= b.val:
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a or b
    return dummy.next`,
          },
          {
            label: 'Remove the nth node from the end',
            code: `def removeNthFromEnd(head, n):
    dummy = ListNode(0, head)
    fast = slow = dummy
    for _ in range(n):
        fast = fast.next
    while fast.next:
        fast = fast.next
        slow = slow.next
    slow.next = slow.next.next
    return dummy.next`,
          },
        ],
        quiz: [{
          q: 'Why does `removeNthFromEnd` move `fast` n steps ahead before moving both pointers together?',
          choices: ['It creates a fixed n-node gap, so when fast reaches the end, slow is right before the node to remove', 'It is needed to count the total length of the list first', 'n steps ahead guarantees fast reaches the middle', 'It prevents an infinite loop'],
          answer: 0,
          why: 'A fixed gap of n means "fast at the end" and "slow one before the target" happen at the same time — one pass, no need to know the length upfront.',
        }],
      },
      {
        kind: 'code-multi', title: 'Recursion → memo → tabulation',
        when: 'The standard escalation path for any DP problem: get a correct brute-force recursion first, cache repeated subproblems, then (optionally) rewrite bottom-up to drop recursion overhead.',
        complexity: 'Plain recursion is exponential · memo and tabulation are both O(states)',
        snippets: [
          {
            label: '1. Plain recursion (correct, but exponential)',
            code: `def fibRecursive(n):
    if n <= 1:
        return n
    return fibRecursive(n - 1) + fibRecursive(n - 2)`,
          },
          {
            label: '2. Add memoization (top-down DP)',
            code: `from functools import lru_cache

@lru_cache(maxsize=None)
def fibMemo(n):
    if n <= 1:
        return n
    return fibMemo(n - 1) + fibMemo(n - 2)`,
          },
          {
            label: '3. Tabulation (bottom-up DP, no recursion)',
            code: `def fibTabulation(n):
    if n <= 1:
        return n
    previous, current = 0, 1
    for _ in range(2, n + 1):
        previous, current = current, previous + current
    return current`,
          },
        ],
        quiz: [{
          q: 'Going from step 1 to step 2, `@lru_cache` changes the complexity from:',
          choices: ['O(2ⁿ) to O(n), by never recomputing the same subproblem twice', 'O(n) to O(log n)', 'O(n²) to O(n log n)', 'It only reduces constant factors, not the complexity class'],
          answer: 0,
          why: 'Plain recursion re-derives fib(k) exponentially many times; caching means each distinct n is computed exactly once.',
        }],
      },
    ],
  },

  {
    id: 'interview-communication', group: 'interview', title: 'Interview communication',
    parts: [
      {
        kind: 'steps', title: 'Interview communication script',
        rows: [
          { step: 'Restate the problem', you: "So we're given X and need to return Y — did I get that right?" },
          { step: 'Clarify constraints', you: 'What\'s the size of n? Can values repeat, be negative, or is the array already sorted?' },
          { step: 'Walk through an example', you: 'Let me trace a small example by hand before I start coding.' },
          { step: 'Name the brute force', you: 'The brute force checks every pair, which is O(n²) — I think we can do better.' },
          { step: 'Name the pattern', you: 'Since the array is sorted, this looks like a two-pointer problem.' },
          { step: 'Narrate while coding', you: "I'm tracking the running total here, so I can check it against the target in O(1)." },
          { step: 'Trace your own code', you: 'Let me step through my example again against this code before calling it done.' },
          { step: 'State final complexity', you: "This is O(n) time, O(1) extra space, since we only make one pass and no extra storage." },
          { step: 'Test edge cases out loud', you: 'Let me check empty input, one element, and all-duplicates.' },
          { step: 'Invite follow-ups', you: 'Happy to talk through what changes if this needs to run on streaming data.' },
        ],
        quiz: [{
          q: 'What is the main reason to narrate your thinking out loud during a coding interview?',
          choices: ['The interviewer can only evaluate reasoning they can hear, not just the final code', 'It is required to pass regardless of code correctness', 'It fills silence so the interview feels longer', 'It replaces the need to test the code'],
          answer: 0,
          why: 'Most interviewers weigh problem-solving process as heavily as the final answer — silent typing hides exactly the part they are scoring.',
        }],
      },
      {
        kind: 'star', title: 'Behavioral STAR quick sheet',
        rows: [
          { letter: 'S', label: 'Situation', tip: 'One or two sentences of context — team, project, timeframe.' },
          { letter: 'T', label: 'Task', tip: 'What were you specifically responsible for or trying to achieve?' },
          { letter: 'A', label: 'Action', tip: 'What did you personally do — use "I", not "we". This is the longest part of the answer.' },
          { letter: 'R', label: 'Result', tip: 'What happened, ideally with a number or concrete outcome, plus what you learned.' },
        ],
        prompts: [
          'Tell me about a time you disagreed with a teammate or a decision.',
          'Tell me about a time you failed, or a project that didn\'t go as planned.',
          'Tell me about a time you had to meet a tight deadline.',
          'Tell me about a time you had to learn something unfamiliar quickly.',
          'Tell me about a time you helped someone else on your team.',
          'Tell me about a time you got negative feedback.',
        ],
        rule: 'Keep each answer to about 60–90 seconds. Prepare 3–4 stories in advance and map them to whichever prompt comes up — most behavioral prompts are really asking for the same handful of stories.',
        quiz: [{
          q: 'In a STAR answer, which part should usually take up the most time?',
          choices: ['Action — what you personally did', 'Situation — the background context', 'Task — the goal', 'Result — the outcome'],
          answer: 0,
          why: 'Interviewers are evaluating your judgment and behavior, which lives in the Action — Situation and Task should be brief setup.',
        }],
      },
    ],
  },
  {
    id: 'edge-cases-companies', group: 'interview', title: 'Edge cases & company notes',
    parts: [
      {
        kind: 'notes', title: 'Edge-case checklist',
        rows: [
          'Empty input — [], "", None, or an empty graph/tree',
          'A single element',
          'All elements equal',
          'Already sorted, and reverse sorted',
          'Duplicates allowed in the input',
          'Negative numbers and zero, not just positives',
          'Very large n — does the approach still fit the time budget?',
          'Target/value not present — does the function fail gracefully?',
          'Off-by-one at loop and window boundaries (<= vs <, left vs left+1)',
          'Cycles — in a graph, or in a linked list',
          'Disconnected graph components, not just one connected blob',
          'A tree that is a single path (all left or all right children)',
          'Recursion depth on a long list or skewed tree (~1000 default limit in Python)',
          'Integer vs floating point division, and which one the problem wants',
        ],
        quiz: [{
          q: 'You just coded a binary search. Before saying "done", which edge case is most important to trace through out loud?',
          choices: ['An empty array and a one-element array', 'An array with 10,000 elements', 'An array of only even numbers', 'Only the target being the first element'],
          answer: 0,
          why: 'Boundary sizes (0 and 1 elements) are where off-by-one loop conditions most often break.',
        }],
      },
      {
        kind: 'companies', title: 'Company notes',
        rows: [
          { id: 'google', points: [
            'Strong emphasis on CS fundamentals and clean, correct code with the right time/space complexity.',
            'Expect to explain your thinking the whole time, including when you get a follow-up that changes the constraints.',
            'A separate "Googleyness" / leadership round is common alongside several coding rounds.',
          ] },
          { id: 'amazon', points: [
            'Leadership Principles show up even in coding rounds — be ready for "tell me about a time..." before or after you code.',
            'A bar-raiser interviewer (not on the hiring team) is typically part of the loop.',
            'Practical correctness and edge-case handling are weighed heavily, not just the big-O.',
          ] },
          { id: 'microsoft', points: [
            'Coding rounds are mixed with questions about collaboration and how you approach ambiguous problems.',
            'You may be asked to extend or modify your working solution live ("now handle duplicates", "now make it streaming").',
            'More senior loops often add a system design round.',
          ] },
          { id: 'meta', points: [
            'Fast-paced — typically two coding rounds of about 35 minutes each, so speed and clean code both matter.',
            'A behavioral round focuses heavily on how you work with and influence a team.',
            'Practical, working code under time pressure is valued over a theoretically perfect but unfinished solution.',
          ] },
          { id: 'apple', points: [
            'Loops vary a lot by team — the specific group you interview with shapes the format more than at most companies.',
            'Expect deep follow-up questions that probe your trade-offs, not just whether the first answer works.',
            'Attention to detail and precision in your solution are explicitly valued.',
          ] },
          { id: 'bloomberg', points: [
            'Less puzzle-heavy than most — emphasis on practical, testable, well-organized code and OOP design.',
            'Multiple shorter rounds rather than fewer long ones.',
            'Clear communication and occasionally finance-flavored word problems (no finance background required).',
          ] },
        ],
        quiz: [{
          q: "Which company's interviews most consistently weave \"tell me about a time...\" style questions directly into the coding rounds themselves, not just a separate behavioral round?",
          choices: ['Amazon', 'Bloomberg', 'Apple', 'Google'],
          answer: 0,
          why: "Amazon's Leadership Principles show up across nearly every round, including the coding ones — expect a leadership question before or after you code.",
        }],
      },
    ],
  },
]

export const cheatSheetById = Object.fromEntries(cheatSheets.map(sheet => [sheet.id, sheet]))

export const cheatSheetsByGroup = cheatSheetGroups.map(group => ({
  ...group,
  sheets: cheatSheets.filter(sheet => sheet.group === group.id),
}))
