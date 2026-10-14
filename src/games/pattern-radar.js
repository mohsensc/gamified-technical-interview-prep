import { runQuiz, pick, shuffle, choiceSet } from './_engine.js'

const patternSkills = {
  'Sliding window': 'sliding-window',
  'Two pointers': 'two-pointers',
  'Binary search': 'binary-search',
  'Hash map / set': 'arrays-hashing',
  'Prefix sum': 'prefix-sum',
  'Monotonic stack': 'monotonic-stack',
  'Stack': 'stack',
  'Heap / top-k': 'heap',
  'Fast & slow pointers': 'linked-list',
  'Tree DFS': 'tree-dfs',
  'BFS shortest path': 'graph-bfs',
  'Graph DFS / flood fill': 'graph-dfs',
  'Topological sort': 'topo-sort',
  'Union-Find': 'union-find',
  'Dijkstra': 'dijkstra',
  'Backtracking': 'backtracking',
  'Dynamic programming': 'dp-1d',
  'Greedy': 'greedy',
  'Intervals: sort + sweep': 'intervals',
  'Trie': 'trie',
  'Bit manipulation': 'bit',
}

const patternNames = Object.keys(patternSkills)

const builtIn = [
  ['Longest substring with at most k distinct characters.', 'Sliding window', 'Contiguous + "at most k" → grow right, shrink left.'],
  ['Smallest subarray with sum ≥ target, all positive.', 'Sliding window', 'Positive values make the window sum monotonic.'],
  ['Does s2 contain a permutation of s1?', 'Sliding window', 'Fixed-size window of len(s1) with char counts.'],
  ['Sorted array: find two numbers adding to target, O(1) space.', 'Two pointers', 'Sorted + pair → move left/right inward.'],
  ['Container with most water between vertical lines.', 'Two pointers', 'Move the shorter side; it is the bottleneck.'],
  ['Find all unique triplets summing to zero.', 'Two pointers', 'Sort, fix one, two-pointer the rest.'],
  ['Find min in a rotated sorted array in O(log n).', 'Binary search', 'O(log n) on sorted-ish data → binary search.'],
  ['Minimum eating speed to finish piles in h hours.', 'Binary search', 'Monotonic feasibility → binary search on the answer.'],
  ['Return true if any value appears twice.', 'Hash map / set', 'Membership check in O(1) with a set.'],
  ['Longest run of consecutive integers, unsorted, O(n).', 'Hash map / set', 'Set lookups; only start counting at sequence starts.'],
  ['Count subarrays whose sum equals k (negatives allowed).', 'Prefix sum', 'prefix[j] − prefix[i] = k, count prefixes in a map.'],
  ['Answer many range-sum queries on a fixed array.', 'Prefix sum', 'Precompute once, O(1) per query.'],
  ['For each day, how many days until a warmer temperature?', 'Monotonic stack', '"Next greater" → decreasing stack of indices.'],
  ['Largest rectangle in a histogram.', 'Monotonic stack', 'Pop bars when a shorter one bounds them.'],
  ['Are the brackets in this string valid?', 'Stack', 'Last opened must close first: LIFO.'],
  ['Evaluate an expression in reverse Polish notation.', 'Stack', 'Push numbers, pop two on each operator.'],
  ['Return the k closest points to the origin.', 'Heap / top-k', 'Top-k → heap of size k.'],
  ['Running median of a data stream.', 'Heap / top-k', 'Two heaps balance lower and upper halves.'],
  ['Detect whether a linked list has a cycle, O(1) space.', 'Fast & slow pointers', 'Fast catches slow inside a cycle.'],
  ['Find the middle node of a linked list in one pass.', 'Fast & slow pointers', 'Fast moves 2, slow moves 1.'],
  ['Max path sum between any two nodes of a binary tree.', 'Tree DFS', 'Post-order: return best single branch, update global.'],
  ['Is this binary tree height-balanced?', 'Tree DFS', 'Return heights bottom-up, flag imbalance.'],
  ['Minimum moves for a knight to reach a target square.', 'BFS shortest path', 'Unweighted fewest steps → BFS.'],
  ['Fewest single-letter changes to turn beginWord into endWord.', 'BFS shortest path', 'Each word is a node, each change an edge.'],
  ['Count islands of 1s in a grid.', 'Graph DFS / flood fill', 'Flood each new 1 and count launches.'],
  ['Which cells can flow to both oceans?', 'Graph DFS / flood fill', 'Reverse flow: DFS inward from each ocean.'],
  ['Can you finish all courses given prerequisites?', 'Topological sort', 'Dependencies + cycle check → topo sort.'],
  ['Derive the letter order of an alien language.', 'Topological sort', 'Adjacent words give edges; order letters.'],
  ['Count connected components as edges are added.', 'Union-Find', 'Dynamic connectivity → union + find.'],
  ['Find the redundant edge that creates a cycle.', 'Union-Find', 'First edge joining already-connected nodes.'],
  ['Time for a signal to reach all nodes, weighted edges.', 'Dijkstra', 'Positive weights + shortest path → Dijkstra.'],
  ['Cheapest path in a grid where each cell costs its value.', 'Dijkstra', 'Weighted cells → heap by total cost.'],
  ['Generate all valid combinations summing to target.', 'Backtracking', '"All combinations" → choose, recurse, undo.'],
  ['Place n queens so none attack each other.', 'Backtracking', 'Try each column per row, prune conflicts.'],
  ['Number of ways to climb n stairs taking 1 or 2 steps.', 'Dynamic programming', 'ways[i] = ways[i−1] + ways[i−2].'],
  ['Fewest coins to make an amount.', 'Dynamic programming', 'Overlapping subproblems over amounts.'],
  ['Can you reach the last index jumping up to nums[i]?', 'Greedy', 'Track the farthest reachable index.'],
  ['Minimum meeting rooms needed.', 'Intervals: sort + sweep', 'Sort starts and ends, sweep with a counter or heap.'],
  ['Implement search with "." wildcards over a word set.', 'Trie', 'Shared prefixes, branch on wildcard.'],
  ['Every number appears twice except one. Find it.', 'Bit manipulation', 'XOR cancels pairs.'],
  ['Longest substring with all unique characters.', 'Sliding window', 'Grow right, shrink left the moment a repeat enters the window.'],
  ['Max sum of any contiguous subarray of fixed size k.', 'Sliding window', 'Add the new element, drop the oldest, keep a running sum.'],
  ['Remove duplicates from a sorted array in place.', 'Two pointers', 'A slow pointer marks the next unique slot while a fast pointer scans.'],
  ['Merge two sorted arrays in place, one with extra trailing space.', 'Two pointers', 'Fill from the back so unread values are never overwritten.'],
  ['Search a 2-D matrix sorted by row and column.', 'Binary search', 'Treat it as a 1-D sorted array via index math.'],
  ['Find a peak element, greater than both neighbors.', 'Binary search', 'Compare mid to its neighbor to discard the half with no peak.'],
  ['Does a subarray with sum divisible by k exist?', 'Hash map / set', 'Store prefix-sum remainders mod k; a repeat means a divisible subarray.'],
  ['Design O(1) insert, remove, and getRandom for a set.', 'Hash map / set', 'Array for O(1) random access, hash map for O(1) index lookup.'],
  ['Find the pivot index where left sum equals right sum.', 'Prefix sum', 'Track a running left sum; the right sum is the total minus it.'],
  ['Count subarrays with an equal number of 0s and 1s.', 'Prefix sum', 'Map 0 to −1, then count subarrays summing to 0 via a running-sum map.'],
  ['Remove k digits from a number to form the smallest result.', 'Monotonic stack', 'Pop larger digits while removals remain and a smaller digit follows.'],
  ['Final prices after a special discount (next smaller or equal price).', 'Monotonic stack', 'A decreasing stack finds each next smaller-or-equal price in one pass.'],
  ['Simplify a Unix-style file path, resolving "." and "..".', 'Stack', 'Push directory names, pop on "..".'],
  ['Remove all adjacent duplicate characters, repeatedly.', 'Stack', 'Push a character, pop it if it matches the top.'],
  ['Merge k sorted arrays into one sorted array.', 'Heap / top-k', 'A heap tracks the smallest current head among the k arrays.'],
  ['Reorganize a string so no two adjacent characters match.', 'Heap / top-k', 'Always place the most frequent remaining character next, via a heap.'],
  ['Find the start of the cycle in a linked list.', 'Fast & slow pointers', 'After they meet, reset one pointer to head; both now meet at the cycle start.'],
  ['Determine if a linked list is a palindrome.', 'Fast & slow pointers', 'Find the middle, reverse the second half, then compare.'],
  ['Lowest common ancestor of two nodes in a binary tree.', 'Tree DFS', 'Recurse both sides; the split point is where the paths diverge.'],
  ['Serialize and deserialize a binary tree exactly.', 'Tree DFS', 'Preorder recursion with explicit null markers rebuilds the exact shape.'],
  ['Shortest bridge connecting two islands in a grid.', 'BFS shortest path', 'BFS outward layer by layer from the first island until the second is hit.'],
  ['Minimum knight moves between two squares on an infinite board.', 'BFS shortest path', 'Unweighted moves: BFS layers give the fewest.'],
  ['Flood fill a region starting from one pixel with a new color.', 'Graph DFS / flood fill', 'Spread to same-colored neighbors recursively.'],
  ['Check whether a graph is bipartite (2-colorable).', 'Graph DFS / flood fill', 'Color each component as you go; a clash means it is not bipartite.'],
  ['Minimum semesters to finish all courses, layer by layer.', 'Topological sort', "Each wave of in-degree-zero nodes is one semester (Kahn's layers)."],
  ['Order module compilation given "depends on" pairs.', 'Topological sort', 'Dependencies form edges; topological order respects every one.'],
  ['Count provinces (connected friend groups) from a matrix.', 'Union-Find', 'Union every connected pair, then count distinct roots.'],
  ['Smallest string after swaps: group indices linked by allowed swaps.', 'Union-Find', 'Union swappable indices into components, sort each independently.'],
  ['Path with the maximum possible minimum edge weight.', 'Dijkstra', "A heap greedily expands the best bottleneck so far — Dijkstra's variant."],
  ['Swim in rising water: minimize the max elevation crossed to the goal.', 'Dijkstra', 'Heap by "worst step so far" pops the best bottleneck path first.'],
  ['Generate all valid combinations of n pairs of parentheses.', 'Backtracking', "Add '(' or ')' only when the string can still be completed, then recurse."],
  ['Word search: does the word exist via adjacent grid moves?', 'Backtracking', 'DFS one path at a time, mark visited, undo on backtrack.'],
  ['Longest palindromic substring in a string.', 'Dynamic programming', 'isPalindrome(i, j) builds from isPalindrome(i+1, j−1).'],
  ['Partition an array into two subsets with equal sum.', 'Dynamic programming', 'Subset-sum DP over which totals are achievable.'],
  ['Minimum platforms needed for a train schedule.', 'Greedy', 'Sort arrivals and departures, sweep with a running counter.'],
  ['Assign cookies to children to maximize satisfied children.', 'Greedy', 'Sort both lists, match the smallest sufficient cookie to each child.'],
  ['Can one person attend every meeting with no overlaps?', 'Intervals: sort + sweep', 'Sort by start time, check each against the previous end.'],
  ["Find common free time across everyone's merged schedules.", 'Intervals: sort + sweep', 'Merge all busy intervals, then read the gaps between merged blocks.'],
  ["Replace words in a sentence with their shortest dictionary root.", 'Trie', "Each word's shortest valid root is the first word-end hit walking down the trie."],
  ['Count how many stored words start with a given prefix.', 'Trie', 'Walk the prefix once; a count at each node avoids rescanning words.'],
  ['Determine if a number is a power of two.', 'Bit manipulation', 'n & (n − 1) clears the lowest set bit; a power of two has exactly one.'],
  ['Two numbers appear once, all others appear twice. Find both.', 'Bit manipulation', 'XOR everything to get a ⊕ b, then split by any set bit in that XOR.'],
]

const builtInQuestions = builtIn.map(([text, pattern, why], index) => ({ text, pattern, why, id: `pattern-radar:${index}` }))

let contentQuestions = []

import('../content/index.js')
  .then(mod => {
    contentQuestions = (mod.problems || [])
      .filter(problem => problem.pattern && (problem.signals?.length || problem.insight))
      .map(problem => ({
        id: `pattern-radar:${problem.id}`,
        pattern: problem.pattern,
        title: problem.title,
        signals: problem.signals || [],
        constraints: problem.constraints,
        why: `${problem.title}: ${problem.insight || problem.pattern}`,
        skills: problem.skills,
      }))
  })
  .catch(() => {})

const tokens = text => new Set(String(text).toLowerCase().split(/[^a-z0-9]+/).filter(word => word.length >= 3))

function distractorsFor(pattern) {
  const answerTokens = tokens(pattern)
  return patternNames.filter(name => {
    if (name.toLowerCase() === pattern.toLowerCase()) return false
    for (const word of tokens(name)) if (answerTokens.has(word)) return false
    return true
  })
}

function skillsFor(entry) {
  const known = patternSkills[entry.pattern]
  const skills = entry.skills?.length ? entry.skills : known ? [known] : []
  return [...new Set(['ds-diagnosis', ...skills])]
}

export function makeQuestion() {
  const useContent = contentQuestions.length >= 8 && Math.random() < 0.55
  const entry = useContent ? pick(contentQuestions) : pick(builtInQuestions)
  const { choices, answer } = choiceSet(entry.pattern, distractorsFor(entry.pattern))
  const prompt = entry.signals
    ? `"${shuffle(entry.signals).slice(0, 3).join('" · "')}"`
    : entry.text
  return {
    id: entry.id,
    skills: skillsFor(entry),
    tag: entry.signals ? '📡 Signals' : '📡 Problem',
    chips: entry.constraints ? [entry.constraints] : null,
    summary: entry.title || entry.text,
    prompt,
    parts: [{ q: 'Which pattern?', choices, answer, why: entry.why }],
  }
}

export default {
  id: 'pattern-radar',
  title: 'Pattern Radar',
  icon: '📡',
  blurb: 'Spot the pattern before the clock does.',
  skills: ['ds-diagnosis', 'sliding-window', 'two-pointers', 'graph-bfs'],
  difficulty: 'Escalates with streak',
  modeLabel: '75s timer',
  supportsDaily: true,
  mount: (container, api) => runQuiz(container, api, {
    title: 'Pattern Radar',
    icon: '📡',
    rules: ['faster = more points', '1-4 to answer'],
    mode: 'timed',
    seconds: 75,
    speedMs: 7000,
    autoMs: 650,
    seed: api.seed,
    makeQuestion,
  }),
}
