const complexityTree = {
  q: 'What does the code actually do?',
  options: [
    {
      label: 'Nested loops over the same n',
      next: {
        q: 'How many levels nest?',
        options: [
          { label: '2 levels', leaf: { result: 'Quadratic pass', ds: 'arrays / indices', time: 'O(n²)', why: 'each outer step scans ~n inner steps' } },
          { label: '3 levels', leaf: { result: 'Cubic pass', ds: 'arrays / indices', time: 'O(n³)', why: 'three nested scans multiply together' } },
        ],
      },
    },
    {
      label: 'One loop, pointer halves each step (//2, mid)',
      leaf: { result: 'Binary search / halving', ds: 'two index pointers', time: 'O(log n)', why: 'range shrinks by a constant factor every step' },
    },
    {
      label: 'One pass, each item pushed & popped once',
      leaf: { result: 'Monotonic stack / window / heap pass', ds: 'stack, deque or heap', time: 'O(n) amortized (heap: O(n log n))', why: 'total pushes+pops are bounded by n' },
    },
    {
      label: 'Calls .sort() then does a linear pass',
      leaf: { result: 'Sort-dominated pass', ds: 'array', time: 'O(n log n)', why: 'sort cost beats the O(n) pass after it' },
    },
    {
      label: 'Recursion visiting graph/tree nodes + edges once',
      leaf: { result: 'DFS / BFS traversal', ds: 'adjacency list + seen set', time: 'O(V + E)', why: 'every node and edge touched exactly once' },
    },
    {
      label: 'Recursion that branches b ways per call, depth d',
      next: {
        q: 'Is it memoized (cache / seen-state dict)?',
        options: [
          { label: 'No memo', leaf: { result: 'Exponential recursion tree', ds: 'call stack only', time: 'O(b^d)', why: 'branches multiply at every depth level' } },
          { label: 'Yes, caches on a unique state key', leaf: { result: 'DP via memoization', ds: 'memo dict / 2-D table', time: 'O(states × work per state)', why: 'each distinct state computed once, then reused' } },
        ],
      },
    },
  ],
}

const summary = [
  '==n ≤ 20== → 2ⁿ. ==n ≤ 1000== → n². ==n ≤ 10⁵== → n log n. ==n ≤ 10⁶== → n.',
  'Python runs ≈10⁷ ops/sec — budget tighter than C++.',
  '==Space== = recursion depth + frontier width + memo + output.',
  'Nested loops → n². Halving → log n. Push/pop once → n. Graph → V+E.',
  '==Script==: clarify → examples → constraints → brute force → optimize → code → test → complexity → follow-ups.',
  '==The usual rubric==: communication, problem solving, coding, verification.',
  'Say something when stuck — silence reads as stuck, not thinking.',
  'Plain def is fine. No type hints needed.',
]

const sections = [
  {
    kind: 'table',
    title: 'Constraint → target Big-O (Python ≈ 10⁷ ops/sec)',
    columns: ['n ≤', 'target', 'pattern cue'],
    rows: [
      ['10', 'O(n!) or O(2ⁿ·n)', 'permutations, subset + check'],
      ['20', 'O(2ⁿ)', 'bitmask DP, try every subset'],
      ['100', 'O(n³)', 'triple nested loops, Floyd–Warshall'],
      ['1,000', 'O(n²)', 'all-pairs, DP table'],
      ['10⁴', 'O(n²) risky → O(n log n) safer', 'sort + pointers, heap'],
      ['10⁵', 'O(n log n)', 'sort, heap, binary search, two pointers'],
      ['10⁶', 'O(n)', 'single pass, hashmap, prefix sum'],
      ['10⁸–10⁹', 'O(log n) / O(√n) / math', 'binary search the answer, closed form'],
    ],
  },
  {
    kind: 'table',
    title: 'Big-O ladder at n = 10⁵',
    columns: ['Big-O', 'ops at n=10⁵', 'feel'],
    rows: [
      ['O(1)', '1', 'instant'],
      ['O(log n)', '~17', 'instant'],
      ['O(√n)', '~316', 'instant'],
      ['O(n)', '100,000', 'fast, one pass'],
      ['O(n log n)', '~1,700,000', 'fast, sort/heap'],
      ['O(n²)', '10,000,000,000', 'too slow (~1000s in Python)'],
      ['O(2ⁿ)', 'astronomical', 'never at this n'],
      ['O(n!)', 'astronomical', 'never at this n'],
    ],
  },
  {
    kind: 'list',
    title: 'How to count space',
    items: [
      'Recursion depth = tallest call stack (tree height, or n)',
      'Explicit stack/queue/heap = widest frontier reached, not total pushes',
      'Memo table size = number of distinct state keys cached',
      'Visited set or array = usually O(n) or O(V)',
      'The output you must return counts as space too',
      "Input you only read without copying usually doesn't count",
    ],
  },
  {
    kind: 'tree',
    title: 'What complexity is my code?',
    root: complexityTree,
  },
  {
    kind: 'list',
    title: 'Interview script — say this out loud',
    items: [
      "Clarify: 'Given ___, I return ___ — can it be empty, have dupes?'",
      "Examples: 'Let me trace one example by hand first.'",
      "Constraints → target: 'n is up to ___, so I'm aiming for O(___).'",
      "Brute force: 'The naive way is ___, costing O(___) because ___.'",
      "Optimize: 'This smells like ___ — a ___ gets O(___) because ___.'",
      "Code, setup: 'I'll track ___ with a ___.'",
      "Code, invariant: 'At every step, ___ stays true.'",
      "Code, update: 'I update ___ here because ___.'",
      "Code, return: 'Once ___, I return ___.'",
      "Test: 'Tracing [small input] — after step one, ___.'",
      "Complexity: 'O(___) time since ___; O(___) space for ___.'",
      "Follow-ups: 'If ___ changed, I'd swap ___ for ___.'",
    ],
  },
  {
    kind: 'list',
    title: 'Interview rubric',
    items: [
      'Communication: think aloud, state assumptions, respond well to hints',
      'Problem solving: structured approach, weighs tradeoffs, reaches a working solution',
      'Coding: clean, correct, idiomatic, handles edges unprompted',
      'Verification: tests the solution, finds own bugs, reasons about correctness',
      'Strong hire: optimal solution + clean code + clear talk + little help',
    ],
  },
  {
    kind: 'list',
    title: 'Day-of checklist',
    items: [
      'Bring water, find a quiet room, close extra tabs',
      'Use a plain doc editor — no autocomplete, no highlighting',
      'Ask before coding — say your approach out loud first',
      "It's fine to say 'let me think for 10 seconds'",
      'No type hints needed — plain def search(self, nums, target): is fine',
      'Join 5 minutes early, phone on silent, headphones charged',
    ],
  },
  {
    kind: 'list',
    title: 'Recovery lines when stuck',
    items: [
      "'Let me re-read the problem once more.'",
      "'Let me try a smaller example by hand.'",
      "'What structure gives O(1) for the thing I keep repeating?'",
      "'Let me think out loud for a few seconds.'",
      "'I'll code the brute force first, then optimize.'",
      "'Could I get a small hint on the approach?'",
      "'Let me double check the empty and single-element case.'",
    ],
  },
]

const recall = [
  { prompt: 'n ≤ 20 → target Big-O?', answer: 'O(2ⁿ)' },
  { prompt: 'n ≤ 10⁵ → target Big-O?', answer: 'O(n log n)' },
  { prompt: 'n ≤ 10⁶ → target Big-O?', answer: 'O(n)' },
  { prompt: 'Values up to 10⁹ with a monotonic feasibility check → target?', answer: 'O(log n) — binary search the answer' },
  { prompt: "Python's ops/sec budget?", answer: '~10⁷ (not 10⁸ like C++)' },
  { prompt: 'Space cost of a recursive DFS on a tree of height h?', answer: 'O(h) — the call stack' },
  { prompt: 'Nested loops over the same n → complexity?', answer: 'O(n²)' },
  { prompt: 'A pointer that halves the range each step → complexity?', answer: 'O(log n)' },
  { prompt: 'Each element pushed and popped at most once → complexity?', answer: 'O(n) amortized' },
  { prompt: 'Graph DFS/BFS visiting every node and edge once → complexity?', answer: 'O(V + E)' },
  { prompt: 'Recursion branching b ways to depth d, no memo → complexity?', answer: 'O(b^d)' },
  { prompt: 'Memoized recursion with k unique states → complexity?', answer: 'O(k) × work per state' },
  { prompt: 'Sentence starter for the optimize phase?', answer: "'This smells like ___ — a ___ gets O(___) because ___.'" },
  { prompt: 'Best line to say when stuck?', answer: "'Let me try a smaller example' or 'let me think for 10 seconds.'" },
  { prompt: "The four rubric pillars?", answer: 'Communication, problem solving, coding, verification' },
  { prompt: 'Do you need type hints while coding in the interview?', answer: 'No — plain def is fine' },
  { prompt: 'Fine interview-style function signature (no type hints)?', answer: 'def search(self, nums, target):' },
  { prompt: 'Two sequential loops over nums then other → complexity, and why not n·m?', answer: 'O(n + m) — they never nest, so costs add instead of multiply' },
]

const quiz = [
  {
    id: 'dayof:interview:q1',
    q: 'n ≤ 10⁵, one pass or a sort is enough — target Big-O?',
    choices: ['O(n²)', 'O(n log n)', 'O(2ⁿ)', 'O(n³)'],
    answer: 1,
    why: 'n log n ≈ 1.7M ops at 10⁵, comfortable. n² is 10¹⁰ — far too slow.',
    skills: ['constraints'],
  },
  {
    id: 'dayof:interview:q2',
    q: 'n ≤ 12, need every permutation checked — target Big-O?',
    choices: ['O(n)', 'O(n log n)', 'O(n!)', 'O(n²)'],
    answer: 2,
    why: 'Tiny n (≤12) is the classic signal for factorial or 2ⁿ brute force.',
    skills: ['constraints'],
  },
  {
    id: 'dayof:interview:q3',
    q: 'Values up to 10⁹, and a yes/no check is monotonic in the answer — target?',
    choices: ['O(n)', 'O(log n) via binary search on the answer', 'O(n²)', 'O(2ⁿ)'],
    answer: 1,
    why: 'Huge value range plus a monotonic check is the signature of binary search on the answer.',
    skills: ['constraints', 'binary-search'],
  },
  {
    id: 'dayof:interview:q4',
    q: 'n ≤ 1,000, every pair of elements must be compared — target Big-O?',
    choices: ['O(n)', 'O(n log n)', 'O(n²)', 'O(n³)'],
    answer: 2,
    why: '1000² = 10⁶, well inside budget. All-pairs work is the n² signal.',
    skills: ['constraints'],
  },
  {
    id: 'dayof:interview:q5',
    q: 'Grid with r·c ≤ 10⁵ cells, each cell visited a constant number of times — target?',
    choices: ['O(r + c)', 'O(r · c)', 'O(r · c · log(r·c))', 'O((r·c)²)'],
    answer: 1,
    why: 'Each of the r·c cells does O(1) work, so total work is O(r·c).',
    skills: ['constraints', 'grid'],
  },
  {
    id: 'dayof:interview:q6',
    q: 'Graph with V, E ≤ 10⁵, shortest path with non-negative weights — target?',
    choices: ['O(V + E)', 'O((V+E) log V)', 'O(V · E)', 'O(V²)'],
    answer: 1,
    why: 'Dijkstra with a heap: every edge relaxes and every pop costs O(log V).',
    skills: ['constraints', 'dijkstra'],
  },
  {
    id: 'dayof:interview:q7',
    q: 'n ≤ 20, need to try every subset — target Big-O?',
    choices: ['O(n)', 'O(n log n)', 'O(2ⁿ)', 'O(n²)'],
    answer: 2,
    why: 'n ≤ 20 is the classic bitmask / subset-enumeration signal: 2ⁿ subsets.',
    skills: ['constraints'],
  },
  {
    id: 'dayof:interview:q8',
    q: 'What is the time complexity of this snippet?',
    code: `for i in range(n):
    for j in range(i + 1, n):
        if arr[i] + arr[j] == target:
            count += 1`,
    choices: ['O(n)', 'O(n log n)', 'O(n²)', 'O(n³)'],
    answer: 2,
    why: 'Starting j at i+1 skips half the pairs but still checks ~n²/2 — still O(n²).',
    skills: ['complexity'],
  },
  {
    id: 'dayof:interview:q9',
    q: 'What is the time complexity of this loop?',
    code: `while n > 1:
    n //= 2
    steps += 1`,
    choices: ['O(n)', 'O(log n)', 'O(√n)', 'O(1)'],
    answer: 1,
    why: 'n is halved every iteration, so it takes log₂(n) iterations to reach 1.',
    skills: ['complexity'],
  },
  {
    id: 'dayof:interview:q10',
    q: 'What is the time complexity of this pair of loops?',
    code: `seen = set()
for x in nums:
    seen.add(x)
for y in other:
    if y in seen:
        result += 1`,
    choices: ['O(n · m)', 'O(n + m)', 'O(n²)', 'O(n log n)'],
    answer: 1,
    why: 'The loops are sequential, not nested — they never multiply, so costs add.',
    skills: ['complexity'],
  },
  {
    id: 'dayof:interview:q11',
    q: 'What is the time complexity of this monotonic stack pass?',
    code: `stack = []
for num in nums:
    while stack and stack[-1] < num:
        stack.pop()
    stack.append(num)`,
    choices: ['O(n²), the inner while dominates', 'O(n) amortized — each item pushed and popped once', 'O(n log n)', 'O(log n)'],
    answer: 1,
    why: 'Every element is pushed once and popped at most once across the run, so total work is O(n).',
    skills: ['monotonic-stack', 'complexity'],
  },
  {
    id: 'dayof:interview:q12',
    q: 'What dominates the time complexity here?',
    code: `nums.sort()
left, right = 0, len(nums) - 1
while left < right:
    pairSum = nums[left] + nums[right]
    left += 1
    right -= 1`,
    choices: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
    answer: 1,
    why: 'The two-pointer pass is O(n), but sort() costs O(n log n) and dominates the total.',
    skills: ['two-pointers', 'complexity'],
  },
  {
    id: 'dayof:interview:q13',
    q: 'What is the time complexity of this recursion?',
    code: `def dfs(i):
    if i == n:
        return 1
    return dfs(i + 1) + dfs(i + 1)`,
    choices: ['O(n)', 'O(n²)', 'O(2ⁿ)', 'O(log n)'],
    answer: 2,
    why: 'Two calls per level, depth n, no memo — the call tree has 2ⁿ leaves.',
    skills: ['complexity'],
  },
  {
    id: 'dayof:interview:q14',
    q: 'What is the time complexity of this graph traversal?',
    code: `def dfs(node):
    seen.add(node)
    for nei in graph[node]:
        if nei not in seen:
            dfs(nei)`,
    choices: ['O(V)', 'O(V + E)', 'O(V · E)', 'O(E)'],
    answer: 1,
    why: 'Each node is visited once and each edge is scanned once across all calls.',
    skills: ['graph-dfs', 'complexity'],
  },
  {
    id: 'dayof:interview:q15',
    q: 'What is the time complexity of this memoized recursion?',
    code: `@cache
def dfs(i, remain):
    if remain == 0: return 1
    if i == n or remain < 0: return 0
    return dfs(i + 1, remain) + dfs(i + 1, remain - cost[i])`,
    choices: ['O(2ⁿ)', 'O(n · target)', 'O(n)', 'O(n²)'],
    answer: 1,
    why: 'There are n · target distinct (i, remain) states, each computed once thanks to @cache.',
    skills: ['dp-1d', 'complexity'],
  },
  {
    id: 'dayof:interview:q16',
    q: "You just restated the problem and asked about edge cases. What's the best next move?",
    choices: ['Start coding right away', 'Walk through one small example by hand', 'Ask for the time limit', 'Jump to discussing space complexity'],
    answer: 1,
    why: 'Examples surface misunderstandings before any code is written — cheaper to fix now.',
    skills: ['communication'],
  },
  {
    id: 'dayof:interview:q17',
    q: 'The prompt says n ≤ 10⁵. What should you say out loud?',
    choices: ["I'll brute force this with nested loops.", "n is up to 10⁵, so I'm aiming for O(n log n) or better.", 'This looks easy.', "I'll just submit and see if it passes."],
    answer: 1,
    why: 'Naming the target complexity from the constraint shows you reason before you code.',
    skills: ['communication', 'constraints'],
  },
  {
    id: 'dayof:interview:q18',
    q: "You're stuck mid-solution. What's the best thing to say?",
    choices: ['Stay silent and think', "Let me think out loud for a few seconds — I'll try a smaller example.", "I'm stuck, can you just tell me?", 'Guess and move on'],
    answer: 1,
    why: 'Narrating buys thinking time without reading as stuck or giving up.',
    skills: ['communication'],
  },
  {
    id: 'dayof:interview:q19',
    q: 'You just finished the brute force. What do you say before optimizing?',
    choices: ["This is O(n²) from the nested loop — let's see if we can do better.", 'This is done, next problem.', "I'll leave it at O(n²).", 'Say nothing and start rewriting'],
    answer: 0,
    why: 'Naming the brute force cost signals you know it is not optimal before you improve it.',
    skills: ['communication', 'complexity'],
  },
  {
    id: 'dayof:interview:q20',
    q: 'You just finished writing the code. What is the very next thing to say and do?',
    choices: ['Submit it', 'Trace through the example input step by step', 'Ask for a new problem', 'Explain an unrelated project'],
    answer: 1,
    why: 'Tracing the example out loud catches bugs before the interviewer has to point them out.',
    skills: ['communication'],
  },
  {
    id: 'dayof:interview:q21',
    q: 'Interviewer asks if you can beat O(n²). You know sort + two pointers works. Best response?',
    choices: ['Maybe, let me think (then silence)', 'Yes — sort first for O(n log n), then two pointers find it in O(n), so O(n log n) total.', 'No, O(n²) is optimal.', 'I would need a hint.'],
    answer: 1,
    why: 'Naming the pattern, the data structure, and the resulting complexity together is the target answer shape.',
    skills: ['communication', 'two-pointers'],
  },
  {
    id: 'dayof:interview:q22',
    q: 'Mid-interview you notice your code misses the empty-input case. What do you say?',
    choices: ['Say nothing and hope they miss it', 'Good catch — let me handle the empty case first, with an early return.', 'Restart the whole problem silently', 'Blame the test case'],
    answer: 1,
    why: 'Naming and fixing your own bug out loud is exactly what the verification pillar rewards.',
    skills: ['communication'],
  },
]

export default {
  id: 'interview',
  title: 'Constraints, complexity & interview script',
  icon: 'mic',
  minutes: 20,
  summary,
  sections,
  recall,
  quiz,
}
