import { runQuiz, pick, part, pickByLevel, rand } from './_engine.js'

const budget = 1e8

const factorial = n => {
  let result = 1
  for (let i = 2; i <= n; i++) {
    result *= i
    if (!isFinite(result)) return Infinity
  }
  return result
}

const ladder = [
  { label: 'O(log n)', ops: n => Math.log2(n) },
  { label: 'O(√n)', ops: n => Math.sqrt(n) },
  { label: 'O(n)', ops: n => n },
  { label: 'O(n log n)', ops: n => n * Math.log2(n) },
  { label: 'O(n²)', ops: n => n * n },
  { label: 'O(n³)', ops: n => n ** 3 },
  { label: 'O(n⁴)', ops: n => n ** 4 },
  { label: 'O(2ⁿ)', ops: n => 2 ** n },
  { label: 'O(2ⁿ·n)', ops: n => 2 ** n * n },
  { label: 'O(n!)', ops: n => factorial(n) },
]

const bounds = [
  { n: 1e5, text: 'n ≤ 10⁵', d: 1 },
  { n: 1000, text: 'n ≤ 1000', d: 1 },
  { n: 20, text: 'n ≤ 20', d: 1 },
  { n: 10, text: 'n ≤ 10', d: 1 },
  { n: 1e9, text: 'n ≤ 10⁹', d: 1 },
  { n: 100, text: 'n ≤ 100', d: 2 },
  { n: 3000, text: 'n ≤ 3000', d: 2 },
  { n: 1e6, text: 'n ≤ 10⁶', d: 2 },
  { n: 50, text: 'n ≤ 50', d: 2 },
  { n: 2e5, text: 'n ≤ 2·10⁵', d: 2 },
  { n: 1e7, text: 'n ≤ 10⁷', d: 3 },
  { n: 1e18, text: 'n ≤ 10¹⁸', d: 3 },
  { n: 12, text: 'n ≤ 12', d: 3 },
  { n: 500, text: 'n ≤ 500', d: 3 },
  { n: 5000, text: 'n ≤ 5000', d: 3 },
  { n: 200, text: 'n ≤ 200', d: 3 },
]

const scenarios = [
  'Array of n integers',
  'n tasks to schedule',
  'n words to group',
  'n points on a line',
  'String of length n',
  'n people in a line',
  'n coins to choose from',
  'n cities to visit',
  'n log entries',
  'A single integer n',
]

const sup = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }

export function formatOps(value) {
  if (!isFinite(value) || value > 1e30) return 'way too many'
  if (value < 1000) return `${Math.max(1, Math.round(value))}`
  const exponent = Math.floor(Math.log10(value))
  const mantissa = value / 10 ** exponent
  const exponentText = String(exponent).split('').map(digit => sup[digit]).join('')
  const lead = mantissa >= 1.05 ? `${Math.round(mantissa * 10) / 10}·` : ''
  return `${lead}10${exponentText}`
}

function maxComplexityQuestion(level) {
  const bound = pickByLevel(bounds, level)
  const passes = ladder.map(rung => rung.ops(bound.n) <= budget)
  let answerIndex = 0
  passes.forEach((ok, i) => { if (ok) answerIndex = i })
  const answer = ladder[answerIndex]
  const slower = ladder[answerIndex + 1]
  const near = [answerIndex - 1, answerIndex + 1, answerIndex + 2, answerIndex - 2, answerIndex - 3, answerIndex + 3].filter(i => i >= 0 && i < ladder.length).slice(0, 3)
  const why = `${answer.label} ≈ ${formatOps(answer.ops(bound.n))} ops ✓${slower ? `, ${slower.label} ≈ ${formatOps(slower.ops(bound.n))} ✗` : ''}. Budget ≈ 10⁸/s.`
  return {
    id: `constraint-sniper:max:${bound.n}`,
    skills: ['constraints', 'complexity'],
    tag: '🎯 Max complexity',
    chips: [bound.text],
    summary: `${bound.text}: slowest complexity that fits?`,
    prompt: pick(scenarios),
    parts: [part('Slowest time complexity that still passes in ~1s?', answer.label, near.map(i => ladder[i].label), why)],
  }
}

const approaches = [
  { d: 1, skills: ['constraints', 'arrays-hashing'], c: ['n ≤ 10⁵'], s: 'Do any two numbers sum to target?',
    good: 'Hash set of seen values: O(n)', bad: ['Check every pair: O(n²)', 'Try all subsets: O(2ⁿ)', 'Re-sort each prefix: O(n² log n)'],
    why: 'n² = 10¹⁰ is far over 10⁸. One pass with a set is 10⁵.' },
  { d: 1, skills: ['constraints', 'grid', 'graph-bfs'], c: ['grid 200×200', 'unweighted'], s: 'Fewest steps from S to T avoiding walls.',
    good: 'BFS from S: O(r·c)', bad: ['BFS from every cell: O((r·c)²)', 'DFS over all paths: exponential', 'Floyd–Warshall on cells: O((r·c)³)'],
    why: '4·10⁴ cells: one BFS is tiny. (r·c)² = 1.6·10⁹ is too slow.' },
  { d: 2, skills: ['constraints', 'dijkstra'], c: ['V, E ≤ 10⁴', 'weights > 0'], s: 'Cheapest cost from source to every node.',
    good: 'Dijkstra with a heap: O((V+E) log V)', bad: ['Floyd–Warshall: O(V³)', 'Plain BFS ignoring weights', 'DFS over all paths: exponential'],
    why: 'V³ = 10¹². BFS is wrong with weights. Dijkstra ≈ 2·10⁵ ops.' },
  { d: 2, skills: ['constraints', 'backtracking'], c: ['n ≤ 20'], s: 'Pick a subset of items: max value, some pairs conflict.',
    good: 'Enumerate subsets with a bitmask: O(2ⁿ·n)', bad: ['Try every ordering: O(n!)', 'Greedy by value (can be wrong)', 'DP over value up to 10⁹'],
    why: '2²⁰·20 ≈ 2·10⁷ fits. 20! ≈ 2.4·10¹⁸ does not. Greedy breaks on conflicts.' },
  { d: 3, skills: ['constraints', 'dp-2d'], c: ['k ≤ 15 key cells', 'grid 50×50'], s: 'Shortest tour visiting all k key cells.',
    good: 'BFS distances + bitmask DP: O(2ᵏ·k²)', bad: ['Try all k! orders', 'Greedy nearest key next', 'One BFS without tracking visited keys'],
    why: '2¹⁵·225 ≈ 7·10⁶. 15! ≈ 1.3·10¹². Greedy and plain BFS give wrong answers.' },
  { d: 1, skills: ['constraints', 'arrays-hashing'], c: ['n ≤ 10⁵', 'values ≤ 10⁹'], s: 'Count how often each value appears.',
    good: 'Hash map counts: O(n)', bad: ['Array indexed by value: 10⁹ slots', 'For each value, recount: O(n²)', 'Counting sort over the value range'],
    why: 'Values reach 10⁹, so a value-indexed array is gigabytes. A dict only stores what appears.' },
  { d: 1, skills: ['constraints', 'prefix-sum'], c: ['n ≤ 10⁵', 'q ≤ 10⁵ queries'], s: 'Sum of nums[l..r] for each query, no updates.',
    good: 'Prefix sums: O(n + q)', bad: ['Loop each range: O(n·q)', 'Sort per query: O(q·n log n)', 'Precompute all subarrays: O(n²)'],
    why: 'n·q = 10¹⁰. Prefix sums answer each query in O(1).' },
  { d: 1, skills: ['constraints', 'heap'], c: ['n ≤ 10⁵', 'k ≤ 100'], s: 'k largest values from a stream.',
    good: 'Min-heap of size k: O(n log k)', bad: ['Sort after every insert: O(n² log n)', 'Compare all pairs: O(n²)', 'Max-heap of all, rebuilt each time: O(n²)'],
    why: 'Heap of size k keeps each step at log k ≈ 7.' },
  { d: 2, skills: ['constraints', 'binary-search'], c: ['n ≤ 10⁵', 'answer ≤ 10⁹'], s: 'Min ship capacity to deliver in D days. check(cap) is O(n).',
    good: 'Binary search on capacity: O(n log 10⁹)', bad: ['Try every capacity: O(n·10⁹)', 'DP over capacity values', 'Try all partitions: O(2ⁿ)'],
    why: 'Feasibility is monotonic. ~30 checks × 10⁵ = 3·10⁶.' },
  { d: 1, skills: ['constraints', 'sliding-window'], c: ['n ≤ 10⁵'], s: 'Longest substring without repeating chars.',
    good: 'Sliding window + set: O(n)', bad: ['Check every substring: O(n³)', 'Every pair + fresh set: O(n²)', 'Sort the string first'],
    why: 'Each char enters and leaves the window once. n² = 10¹⁰.' },
  { d: 2, skills: ['constraints', 'dp-1d'], c: ['n ≤ 2500'], s: 'Length of the longest increasing subsequence.',
    good: 'DP over pairs: O(n²)', bad: ['All subsequences: O(2ⁿ)', 'Triple loop: O(n³)', 'Greedily keep the first increasing run'],
    why: 'n² ≈ 6·10⁶ fits. n³ ≈ 1.6·10¹⁰. Greedy run is wrong.' },
  { d: 1, skills: ['constraints', 'dp-2d'], c: ['|s|, |t| ≤ 1000'], s: 'Longest common subsequence of s and t.',
    good: '2-D DP table: O(m·n)', bad: ['Plain recursion, no memo: O(2^(m+n))', 'All subsequences of s vs t', 'Greedy match first equal chars'],
    why: 'm·n = 10⁶ cells. Without memo it explodes.' },
  { d: 1, skills: ['constraints', 'intervals'], c: ['n ≤ 10⁵', 'times ≤ 10⁹'], s: 'Merge all overlapping meetings.',
    good: 'Sort by start, sweep: O(n log n)', bad: ['Mark a timeline array up to 10⁹', 'Compare all pairs until stable: O(n²+)', 'BFS over an overlap graph: O(n²) edges'],
    why: 'Sorting makes overlaps adjacent. The timeline is 10⁹ long.' },
  { d: 2, skills: ['constraints', 'union-find'], c: ['n ≤ 10⁵ nodes', '10⁵ merges + queries'], s: 'Edges arrive online; are a and b connected?',
    good: 'Union-Find: ~O(α(n)) per op', bad: ['BFS per query: O(q·(V+E))', 'Floyd–Warshall closure: O(n³)', 'Adjacency matrix: 10¹⁰ cells'],
    why: 'q·(V+E) = 2·10¹⁰. Union-Find is near constant per op.' },
  { d: 2, skills: ['constraints', 'topo-sort'], c: ['n ≤ 10⁵ courses', 'prereqs ≤ 10⁵'], s: 'Find a valid order to take all courses.',
    good: "Kahn's topo sort: O(V+E)", bad: ['Try all orders: O(n!)', 'Rescan all nodes for in-degree 0: O(V²)', 'Dijkstra from course 0'],
    why: 'Queue of in-degree-0 nodes touches each edge once. V² = 10¹⁰.' },
  { d: 2, skills: ['constraints', 'monotonic-stack'], c: ['n ≤ 10⁶'], s: 'Next greater element for every index.',
    good: 'Monotonic stack: O(n)', bad: ['Scan right for each i: O(n²)', 'Sort values, binary search: loses order', 'Heap of all values: wrong answers'],
    why: 'Each index is pushed and popped once. n² = 10¹².' },
  { d: 2, skills: ['constraints', 'queue-deque'], c: ['n ≤ 10⁵', 'k ≤ n'], s: 'Max of every window of size k.',
    good: 'Monotonic deque: O(n)', bad: ['max() of each window: O(n·k)', 'Sort each window: O(n·k log k)', 'Prefix max array'],
    why: 'k can be 10⁵, so n·k = 10¹⁰. Deque keeps candidates in O(1) amortized.' },
  { d: 3, skills: ['constraints', 'binary-search', 'math'], c: ['n ≤ 10¹⁸'], s: 'Is n a perfect square?',
    good: 'Binary search on the root: O(log n)', bad: ['Loop i while i·i ≤ n: O(√n)', 'Loop i up to n: O(n)', 'Sieve up to n'],
    why: '√10¹⁸ = 10⁹ steps is too slow. log₂ 10¹⁸ ≈ 60.' },
  { d: 2, skills: ['constraints', 'trie'], c: ['10⁴ words, length ≤ 10', 'q ≤ 10⁵ prefix queries'], s: 'How many words start with each query prefix?',
    good: 'Trie with counts: O(total chars + q·L)', bad: ['Scan all words per query: O(q·n·L)', 'Sort words per query', 'Store every substring in a set'],
    why: 'q·n·L = 10¹⁰. A trie walk is L ≤ 10 steps.' },
  { d: 2, skills: ['constraints', 'tree-dfs'], c: ['n ≤ 10⁵ nodes'], s: 'Diameter of a tree.',
    good: 'One DFS returning heights: O(n)', bad: ['DFS from every node: O(n²)', 'All pairs of nodes, path each: O(n³)', 'BFS levels only from the root'],
    why: 'n² = 10¹⁰. Height-returning DFS updates the best at every node once.' },
  { d: 1, skills: ['constraints', 'arrays-hashing'], c: ['n ≤ 10⁴ strings', 'length ≤ 100'], s: 'Group the anagrams.',
    good: 'Key by sorted string: O(n·L log L)', bad: ['Compare every pair: O(n²·L)', 'Generate all permutations of each', 'Nested loops with Counter: O(n²·L)'],
    why: 'n²·L = 10¹⁰. A canonical key buckets each word once.' },
  { d: 3, skills: ['constraints', 'grid', 'graph-bfs'], c: ['grid 1000×1000'], s: 'Distance from every cell to its nearest gate.',
    good: 'Multi-source BFS from all gates: O(r·c)', bad: ['BFS from every empty cell', 'BFS from each gate separately: O(g·r·c)', 'DFS per gate with min updates'],
    why: '10⁶ cells. Seeding every gate in one queue visits each cell once.' },
]

function approachQuestion(level) {
  const item = pickByLevel(approaches, level)
  const index = approaches.indexOf(item)
  return {
    id: `constraint-sniper:approach:${index}`,
    skills: item.skills,
    tag: '🧪 Which passes?',
    tagClass: 'pill-sky',
    chips: item.c,
    summary: `${item.s} (${item.c.join(', ')})`,
    prompt: item.s,
    parts: [part('Which approach passes?', item.good, item.bad, item.why)],
  }
}

export function makeQuestion(level = 1) {
  return rand(10) < 5 ? maxComplexityQuestion(level) : approachQuestion(level)
}

export default {
  id: 'constraint-sniper',
  title: 'Constraint Sniper',
  icon: '🎯',
  blurb: 'Read the limits, snipe the complexity.',
  skills: ['constraints', 'complexity'],
  mount: (container, api) => runQuiz(container, api, {
    title: 'Constraint Sniper',
    icon: '🎯',
    rules: ['10⁸ ops ≈ 1s', 'combos multiply'],
    mode: 'timed',
    seconds: 60,
    speedMs: 9000,
    makeQuestion,
  }),
}
