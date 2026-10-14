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
  { d: 1, skills: ['constraints', 'two-pointers'], c: ['n ≤ 2·10⁵'], s: 'Container with most water between two vertical lines.',
    good: 'Two pointers, move the shorter line: O(n)', bad: ['Check every pair of lines: O(n²)', 'Try all triples of lines: O(n³)', 'Sort heights then pair greedily: wrong answer'],
    why: 'n² = 4·10¹⁰. Moving the shorter side never loses the optimal pair.' },
  { d: 1, skills: ['constraints', 'sliding-window'], c: ['n ≤ 10⁵'], s: 'Smallest subarray with sum ≥ target, all positive values.',
    good: 'Sliding window, shrink while sum ≥ target: O(n)', bad: ['Check every subarray: O(n²)', 'Resum every subarray from scratch: O(n³)', 'Sort the array first: breaks subarray order'],
    why: 'Positive values make the window sum monotonic. n² = 10¹⁰.' },
  { d: 2, skills: ['constraints', 'backtracking'], c: ['9×9 board'], s: 'Solve a Sudoku board by filling empty cells.',
    good: 'Backtracking with constraint checks: fast in practice', bad: ['Try all 9⁸¹ fillings blindly: infeasible', 'Greedy: fill the first valid digit per cell (gets stuck)', 'BFS over partial boards: memory explodes'],
    why: 'Backtracking prunes illegal branches immediately; brute force over 9⁸¹ grids is infeasible.' },
  { d: 1, skills: ['constraints', 'arrays-hashing', 'bit'], c: ['n ≤ 10⁵'], s: 'Find the single number that appears once, all others twice.',
    good: 'XOR every value: O(n), O(1) space', bad: ['Hash map counts then scan: O(n) but needless extra space', 'Sort then scan adjacent pairs: O(n log n)', 'Check each value against all others: O(n²)'],
    why: 'XOR cancels pairs in one pass with O(1) space; sorting adds an unneeded log factor.' },
  { d: 2, skills: ['constraints', 'greedy', 'intervals'], c: ['n ≤ 10⁵ intervals'], s: 'Maximum number of non-overlapping intervals you can keep.',
    good: 'Sort by end time, greedily keep: O(n log n)', bad: ['Try every subset of intervals: O(2ⁿ)', 'Sort by start time and greedily keep: can be wrong', 'Compare every pair of intervals: O(n²)'],
    why: 'Sorting by end time and taking the earliest-ending option is provably optimal; sorting by start is not.' },
  { d: 1, skills: ['constraints', 'math'], c: ['n, m ≤ 10⁴ digits'], s: 'Multiply two large numbers given as strings.',
    good: 'Grade-school digit multiplication: O(n·m)', bad: ['Convert to native ints: overflows past ~10¹⁸', 'Repeated addition: O(n · value), far too slow', 'Use floating point: loses precision'],
    why: 'n·m ≈ 10⁸ fits. Native integers overflow long before 10⁴ digits.' },
  { d: 2, skills: ['constraints', 'dp-2d'], c: ['m, n ≤ 1000'], s: 'Edit distance between two strings s and t.',
    good: '2-D DP table: O(m·n)', bad: ['Plain recursion without memo: O(3^(m+n))', 'Try every alignment of characters: O(2^(m+n))', 'Greedy character matching: wrong answer'],
    why: 'm·n = 10⁶ cells. Without memoization the recursion explodes.' },
  { d: 1, skills: ['constraints', 'arrays-hashing'], c: ['n ≤ 10⁵'], s: 'Find the majority element appearing more than n/2 times.',
    good: 'Boyer–Moore voting: O(n), O(1) space', bad: ['Hash map counts then scan: O(n) time but O(n) space', 'Sort and read the middle: O(n log n)', 'Recheck each value’s count by rescanning: O(n²)'],
    why: 'Boyer–Moore needs no extra storage; sorting adds a needless log factor.' },
  { d: 2, skills: ['constraints', 'dijkstra'], c: ['V, E ≤ 10⁵', 'stops ≤ k', 'weights ≥ 0'], s: 'Cheapest flight with at most k stops allowed.',
    good: 'Bellman-Ford relaxed k times: O(k·E)', bad: ['Plain Dijkstra ignoring the stop limit: wrong answer', 'Floyd–Warshall: O(V³)', 'DFS over all paths: exponential'],
    why: 'The stop limit breaks Dijkstra’s greedy assumption; bounded Bellman-Ford respects it directly.' },
  { d: 1, skills: ['constraints', 'grid', 'graph-dfs'], c: ['grid 300×300'], s: 'Count the number of distinct islands by shape.',
    good: 'DFS per island + canonical shape signature: O(r·c)', bad: ['Compare every pair of islands directly: O((r·c)²) worst case', 'Hash only the island size: collides different shapes', 'Sort cells by coordinate pairs: loses shape information'],
    why: '9·10⁴ cells. A canonical signature (e.g. relative path) lets a hash set dedupe in one pass.' },
  { d: 2, skills: ['constraints', 'topo-sort', 'union-find'], c: ['n ≤ 10⁵ tasks'], s: 'Does this task dependency graph contain a cycle?',
    good: "Kahn's algorithm or DFS colors: O(V+E)", bad: ['Try every topological ordering: O(n!)', 'Union-Find only: cannot detect directed cycles', 'Floyd–Warshall reachability: O(V³)'],
    why: 'V³ = 10¹⁵. Union-Find does not respect edge direction, so it misses some cycles.' },
  { d: 1, skills: ['constraints', 'arrays-hashing'], c: ['n ≤ 10⁵'], s: 'Return indices of the two numbers that add up to target, one pass.',
    good: 'Hash map of value → index: O(n)', bad: ['Check every pair: O(n²)', 'Sort then binary search each complement: O(n log n), loses original indices', 'Try all subsets: O(2ⁿ)'],
    why: 'n² = 10¹⁰. Sorting also requires tracking original indices separately.' },
  { d: 3, skills: ['constraints', 'greedy', 'intervals'], c: ['n ≤ 300 balloons'], s: 'Minimum arrows to burst all balloons (overlapping intervals).',
    good: 'Sort by end, greedy arrow placement: O(n log n)', bad: ['Try every subset of arrow positions: O(2ⁿ)', 'Compare every pair of balloons with no clear rule: O(n²)', 'DP over all interval pairs: O(n³) unnecessary'],
    why: 'Sorting by end and reusing an arrow while it still hits the next balloon is provably optimal.' },
  { d: 2, skills: ['constraints', 'binary-search'], c: ['n ≤ 10⁵', 'answer ≤ 10⁹'], s: 'Minimum days to make m bouquets from n flowers (feasibility is monotonic in days).',
    good: 'Binary search on the day count: O(n log(max day))', bad: ['Try every possible day: O(n · max day)', 'DP over all days and flowers: memory blow-up', 'Greedy: pick the earliest blooming flowers only'],
    why: 'Feasibility flips once as days increase, so binary search applies directly.' },
  { d: 1, skills: ['constraints', 'stack'], c: ['n ≤ 10⁵'], s: 'Validate that brackets in an expression are balanced and correctly nested.',
    good: 'Stack of open brackets: O(n)', bad: ['Count each bracket type and compare totals: misses nesting order', 'Check every substring for balance: O(n²)', 'Repeatedly regex-replace innermost pairs: O(n²) worst case'],
    why: 'Only a stack captures nesting order, not just totals.' },
  { d: 2, skills: ['constraints', 'greedy'], c: ['n ≤ 10⁵ gas stations'], s: 'Find a starting gas station that lets you complete a circular route.',
    good: 'One greedy pass tracking running tank: O(n)', bad: ['Try every starting station then simulate: O(n²)', 'Binary search over starting index: feasibility is not monotonic in index', 'DP over all (station, fuel) pairs: O(n · fuel)'],
    why: 'If total gas ≥ total cost, a single greedy pass finds a valid start in O(n).' },
  { d: 1, skills: ['constraints', 'intervals'], c: ['n ≤ 10⁵ intervals'], s: 'Insert a new interval into a sorted, non-overlapping list and merge.',
    good: 'One linear sweep, merge overlaps: O(n)', bad: ['Insert then re-sort and re-merge everything: O(n log n)', 'Compare the new interval against every pair: O(n²)', 'Rebuild the list from scratch each insert: O(n²) over many inserts'],
    why: 'A single sweep splits into before, merged, and after in one pass.' },
  { d: 2, skills: ['constraints', 'grid', 'dp-2d'], c: ['grid 1000×1000'], s: 'Minimum path sum from top-left to bottom-right, moving right or down.',
    good: '2-D DP over the grid: O(r·c)', bad: ['Try every path: exponential in r+c', 'DFS with memo keyed by the full path: huge constants', 'Recompute the best path from scratch at each cell: O((r·c)²)'],
    why: '10⁶ cells, one O(1) update each from the DP recurrence.' },
  { d: 1, skills: ['constraints', 'arrays-hashing'], c: ['n ≤ 10⁵'], s: 'Return the first element that never repeats in an array.',
    good: 'Hash map counts, then one more pass: O(n)', bad: ['For each element, scan the rest: O(n²)', 'Sort, then find a run of length 1: loses original order', 'Nested loop comparing every pair: O(n²)'],
    why: 'n² = 10¹⁰. Sorting also destroys the "first" ordering the question asks for.' },
  { d: 3, skills: ['constraints', 'dp-2d'], c: ['n ≤ 20 items', 'capacity ≤ 10⁵'], s: '0/1 knapsack: maximize value under a weight capacity.',
    good: 'DP over (item, capacity): O(n·capacity)', bad: ['Try every subset of items: O(2ⁿ), ignores capacity scaling', 'Greedy by value/weight ratio: can be wrong for 0/1 items', 'Sort items and take greedily by value: can be wrong'],
    why: 'n·capacity = 2·10⁶. Fractional-greedy reasoning does not hold once items cannot be split.' },
  { d: 3, skills: ['constraints', 'graph-bfs', 'grid', 'binary-search'], c: ['grid 500×500'], s: 'Minimum effort path where cost is the max height difference along the way.',
    good: 'Binary search on effort + BFS reachability check: O(r·c·log(maxHeight))', bad: ['Dijkstra by sum of differences: wrong cost model', 'Try every path: exponential', 'Plain BFS ignoring heights: wrong answer'],
    why: 'The cost is a max, not a sum, so plain Dijkstra needs modification; binary search + a reachability check is simpler and fits budget.' },
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
  difficulty: 'Escalates with streak',
  modeLabel: '60s timer',
  supportsDaily: true,
  mount: (container, api) => runQuiz(container, api, {
    title: 'Constraint Sniper',
    icon: '🎯',
    rules: ['10⁸ ops ≈ 1s', 'combos multiply'],
    mode: 'timed',
    seconds: 60,
    speedMs: 9000,
    seed: api.seed,
    makeQuestion,
  }),
}
