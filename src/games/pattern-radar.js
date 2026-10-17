import { h } from '../ui/h.js'
import { runQuiz, pick, shuffle, choiceSet, part, rand, pickByLevel } from './_engine.js'

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

function diagnosisQuestion() {
  const useContent = contentQuestions.length >= 8 && Math.random() < 0.55
  const entry = useContent ? pick(contentQuestions) : pick(builtInQuestions)
  const { choices, answer } = choiceSet(entry.pattern, distractorsFor(entry.pattern))
  const prompt = entry.signals
    ? `"${shuffle(entry.signals).slice(0, 3).join('" · "')}"`
    : entry.text
  return {
    id: entry.id,
    skills: skillsFor(entry),
    tag: { icon: 'radar', text: entry.signals ? 'Signals' : 'Problem' },
    chips: entry.constraints ? [entry.constraints] : null,
    summary: entry.title || entry.text,
    prompt,
    parts: [{ q: 'Which pattern?', choices, answer, why: entry.why }],
  }
}

const recurrences = [
  { d: 1, dim: 1, name: 'Fibonacci Number', skills: ['dp-1d'],
    rec: 'dp[i] = dp[i-1] + dp[i-2]', recWhy: 'F(n) is the sum of the two values before it.',
    base: 'dp[0] = 0, dp[1] = 1', baseWhy: 'The sequence starts 0, 1 by definition.' },
  { d: 1, dim: 1, name: 'Climbing Stairs', skills: ['dp-1d'],
    rec: 'dp[i] = dp[i-1] + dp[i-2]', recWhy: 'The last move was 1 step (from i-1) or 2 steps (from i-2).',
    base: 'dp[1] = 1, dp[2] = 2', baseWhy: 'One way to reach step 1; two ways to reach step 2 (1+1 or 2).' },
  { d: 1, dim: 1, name: 'Tiling a 2×n Board with Dominoes', skills: ['dp-1d'],
    rec: 'dp[i] = dp[i-1] + dp[i-2]', recWhy: 'Place one vertical domino (leaves i-1) or two horizontals (leaves i-2).',
    base: 'dp[0] = 1, dp[1] = 1', baseWhy: 'An empty board and a single column each tile exactly one way.' },
  { d: 1, dim: 1, name: 'House Robber', skills: ['dp-1d', 'greedy'],
    rec: 'dp[i] = max(dp[i-1], dp[i-2] + nums[i])', recWhy: 'Skip house i and keep dp[i-1], or rob it plus the best up through i-2.',
    base: 'dp[0] = nums[0], dp[1] = max(nums[0], nums[1])', baseWhy: 'With one house take it; with two take the larger.' },
  { d: 1, dim: 1, name: 'Maximum Subarray (Kadane)', skills: ['dp-1d'],
    rec: 'dp[i] = max(nums[i], dp[i-1] + nums[i])', recWhy: 'Extend the previous run only if it still helps, otherwise restart at i.',
    base: 'dp[0] = nums[0]', baseWhy: 'A single element is its own best subarray.' },
  { d: 1, dim: 1, name: 'Minimum Cost Climbing Stairs', skills: ['dp-1d'],
    rec: 'dp[i] = min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2])', recWhy: 'Pay to step from i-1 or from i-2, whichever is cheaper.',
    base: 'dp[0] = 0, dp[1] = 0', baseWhy: 'You can start free from either step 0 or step 1.' },
  { d: 1, dim: 1, name: 'Counting Bits', skills: ['dp-1d', 'bit'],
    rec: 'dp[i] = dp[i >> 1] + (i & 1)', recWhy: 'Dropping the last bit is i >> 1; add back 1 if that bit was set.',
    base: 'dp[0] = 0', baseWhy: 'Zero has no set bits.' },
  { d: 2, dim: 1, name: 'Coin Change (fewest coins)', skills: ['dp-1d', 'greedy'],
    rec: 'dp[a] = min(dp[a-c] + 1 for c in coins if c <= a)', recWhy: 'Try every coin as the last one used and take the cheapest remainder.',
    base: 'dp[0] = 0', baseWhy: 'Zero amount needs zero coins.' },
  { d: 2, dim: 1, name: 'Coin Change II (count combinations)', skills: ['dp-1d'],
    rec: 'for c in coins: dp[a] += dp[a-c]', recWhy: 'Looping coins on the outside counts each combination once, regardless of order.',
    base: 'dp[0] = 1', baseWhy: 'There is exactly one way to make 0: use nothing.' },
  { d: 2, dim: 1, name: 'Combination Sum IV (ordered count)', skills: ['dp-1d', 'backtracking'],
    rec: 'for num in nums: dp[t] += dp[t-num]', recWhy: 'Looping the target on the outside counts every ordering as a distinct way.',
    base: 'dp[0] = 1', baseWhy: 'One way to reach 0: the empty sequence.' },
  { d: 2, dim: 1, name: 'Perfect Squares', skills: ['dp-1d', 'math'],
    rec: 'dp[n] = min(dp[n - k*k] + 1 for k*k <= n)', recWhy: 'Try every perfect square ≤ n as the last one used.',
    base: 'dp[0] = 0', baseWhy: 'Zero needs zero squares.' },
  { d: 2, dim: 1, name: 'Decode Ways', skills: ['dp-1d'],
    rec: 'dp[i] = dp[i-1]·[s[i-1] valid] + dp[i-2]·[s[i-2:i] valid]', recWhy: 'The last decoded group is either one digit or two digits.',
    base: 'dp[0] = 1', baseWhy: 'An empty prefix decodes exactly one way.' },
  { d: 2, dim: 1, name: 'Jump Game (can reach the end)', skills: ['dp-1d', 'greedy'],
    rec: 'dp[i] = any(dp[j] and j + nums[j] >= i for j < i)', recWhy: 'Index i is reachable if some earlier reachable j can jump at least that far.',
    base: 'dp[0] = True', baseWhy: 'The start index is always reachable.' },
  { d: 2, dim: 1, name: 'Word Break', skills: ['dp-1d'],
    rec: 'dp[i] = any(dp[j] and s[j:i] in words for j < i)', recWhy: 'Split at j: the prefix must already break and the rest must be one dictionary word.',
    base: 'dp[0] = True', baseWhy: 'An empty prefix trivially breaks.' },
  { d: 2, dim: 1, name: 'Longest Increasing Subsequence', skills: ['dp-1d'],
    rec: 'dp[i] = max(dp[j] + 1 for j < i if nums[j] < nums[i])', recWhy: 'Extend the best increasing run that ends at any smaller earlier value.',
    base: 'dp[i] = 1 for every i', baseWhy: 'Every element alone is a length-1 increasing subsequence.' },
  { d: 2, dim: 1, name: 'Partition Equal Subset Sum', skills: ['dp-1d', 'backtracking'],
    rec: 'dp[s] = dp[s] or dp[s - num]', recWhy: 'A sum is reachable without num, or by adding num to a smaller reachable sum.',
    base: 'dp[0] = True', baseWhy: 'Sum 0 is always reachable: pick nothing.' },
  { d: 2, dim: 1, name: 'Subset Sum Count', skills: ['dp-1d'],
    rec: 'for num in nums: dp[s] += dp[s - num]', recWhy: 'Each item either joins a subset that summed to s-num, or is left out entirely.',
    base: 'dp[0] = 1', baseWhy: 'Exactly one subset sums to 0: the empty one.' },
  { d: 2, dim: 1, name: 'Paint Fence', skills: ['dp-1d', 'math'],
    rec: 'dp[i] = (k-1) * (dp[i-1] + dp[i-2])', recWhy: 'Post i differs from i-1 (k-1 choices off dp[i-1]), or matches i-1 which then forces i-1 to differ from i-2 (k-1 choices off dp[i-2]).',
    base: 'dp[1] = k, dp[2] = k*k', baseWhy: 'One post has k colors available; two posts have k² combinations.' },
  { d: 2, dim: 1, name: 'Maximum Product Subarray', skills: ['dp-1d'],
    rec: 'hi[i] = max(nums[i], hi[i-1]*nums[i], lo[i-1]*nums[i])', recWhy: 'A negative number can flip the running minimum into the new maximum, so both are tracked.',
    base: 'hi[0] = lo[0] = nums[0]', baseWhy: 'A single element is both its own max and min product.' },
  { d: 2, dim: 1, name: 'House Robber II (circular street)', skills: ['dp-1d', 'greedy'],
    rec: 'run the House Robber recurrence twice: once over houses[1:], once over houses[:-1]', recWhy: 'The first and last houses are adjacent, so no valid plan can use both.',
    base: 'dp[0] = nums[0] on each linear pass', baseWhy: 'Each pass starts exactly like ordinary House Robber on its slice.' },
  { d: 2, dim: 1, name: 'Delete and Earn', skills: ['dp-1d'],
    rec: 'dp[v] = max(dp[v-1], dp[v-2] + v * count[v])', recWhy: 'Bucketed by value, this is House Robber: taking value v blocks value v-1.',
    base: 'dp[0] = 0', baseWhy: 'No value below 1 contributes anything.' },
  { d: 2, dim: 1, name: 'Nth Ugly Number', skills: ['dp-1d', 'math'],
    rec: 'dp[i] = min(dp[p2]*2, dp[p3]*3, dp[p5]*5)', recWhy: 'Each ugly number is the smallest unused multiple of 2, 3, or 5 of an earlier ugly number.',
    base: 'dp[0] = 1', baseWhy: '1 is the first ugly number by convention.' },
  { d: 3, dim: 1, name: 'Integer Break', skills: ['dp-1d', 'math'],
    rec: 'dp[n] = max(i*(n-i), i*dp[n-i]) for i < n', recWhy: 'Split off a piece i and either leave the rest whole or break it again recursively.',
    base: 'dp[1] = 1', baseWhy: "1 can't be split further, so its best product with itself is 1." },
  { d: 3, dim: 1, name: 'Best Time to Buy/Sell Stock with Cooldown', skills: ['dp-1d', 'greedy'],
    rec: 'hold[i] = max(hold[i-1], rest[i-1] - price[i]); sold[i] = hold[i-1] + price[i]; rest[i] = max(rest[i-1], sold[i-1])',
    recWhy: 'Three running states track holding a share, having just sold, or resting through cooldown.',
    base: 'hold[0] = -price[0], sold[0] = 0, rest[0] = 0', baseWhy: 'On day 0 you can only buy (hold) or do nothing (rest/sold).' },
  { d: 1, dim: 2, name: 'Unique Paths', skills: ['dp-2d'],
    rec: 'dp[i][j] = dp[i-1][j] + dp[i][j-1]', recWhy: 'Arrive at a cell from directly above or directly to the left.',
    base: 'dp[0][*] = dp[*][0] = 1', baseWhy: 'Only one way to trace the top row or left column: keep going straight.' },
  { d: 1, dim: 2, name: 'Unique Paths II (with obstacles)', skills: ['dp-2d'],
    rec: 'dp[i][j] = 0 if obstacle else dp[i-1][j] + dp[i][j-1]', recWhy: 'An obstacle kills every path that would pass through that cell.',
    base: 'dp[0][0] = 1 if clear else 0', baseWhy: 'The start cell has exactly one path to itself, unless it is blocked.' },
  { d: 1, dim: 2, name: 'Minimum Path Sum', skills: ['dp-2d'],
    rec: 'dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])', recWhy: 'Enter the cell from whichever neighbor was cheaper to reach.',
    base: 'dp[0][0] = grid[0][0]', baseWhy: 'The starting cell costs exactly its own value.' },
  { d: 2, dim: 2, name: 'Longest Common Subsequence', skills: ['dp-2d'],
    rec: 'dp[i][j] = dp[i-1][j-1] + 1 if match else max(dp[i-1][j], dp[i][j-1])', recWhy: 'A matching pair extends the subsequence; otherwise drop one character from either string.',
    base: 'dp[0][*] = dp[*][0] = 0', baseWhy: 'An empty string shares no characters with anything.' },
  { d: 2, dim: 2, name: 'Longest Common Substring', skills: ['dp-2d'],
    rec: 'dp[i][j] = dp[i-1][j-1] + 1 if match else 0', recWhy: 'Unlike LCS, a mismatch breaks the run completely back to 0.',
    base: 'dp[0][*] = dp[*][0] = 0', baseWhy: 'No run can start before either string does.' },
  { d: 2, dim: 2, name: '0/1 Knapsack', skills: ['dp-2d'],
    rec: 'dp[i][w] = max(dp[i-1][w], dp[i-1][w - wt[i]] + val[i]) if wt[i] <= w else dp[i-1][w]', recWhy: 'Skip item i, or take it if it fits and add its value to the remaining capacity.',
    base: 'dp[0][w] = 0', baseWhy: 'With no items chosen yet, every capacity holds zero value.' },
  { d: 2, dim: 2, name: 'Longest Palindromic Substring', skills: ['dp-2d'],
    rec: 'dp[i][j] = dp[i+1][j-1] and s[i] == s[j]', recWhy: 'The outer characters must match and the inside must already be a palindrome.',
    base: 'dp[i][i] = True', baseWhy: 'Every single character is a palindrome of length 1.' },
  { d: 2, dim: 2, name: 'Triangle Minimum Path Sum', skills: ['dp-2d'],
    rec: 'dp[i][j] = tri[i][j] + min(dp[i+1][j], dp[i+1][j+1])', recWhy: 'Working bottom-up, each cell adds its value to the cheaper of the two cells just below it.',
    base: 'dp[last row][j] = tri[last row][j]', baseWhy: 'The bottom row has nowhere left to descend to.' },
  { d: 3, dim: 2, name: 'Edit Distance', skills: ['dp-2d'],
    rec: 'dp[i][j] = dp[i-1][j-1] if match else 1 + min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1])', recWhy: 'A match is free; otherwise pay 1 for a substitute, a delete, or an insert.',
    base: 'dp[i][0] = i, dp[0][j] = j', baseWhy: 'Turning a string into empty (or the reverse) costs one edit per character.' },
  { d: 3, dim: 2, name: 'Longest Palindromic Subsequence', skills: ['dp-2d'],
    rec: 'dp[i][j] = dp[i+1][j-1] + 2 if s[i]==s[j] else max(dp[i+1][j], dp[i][j-1])', recWhy: 'A matching outer pair adds 2 around the inner best; otherwise drop one end.',
    base: 'dp[i][i] = 1', baseWhy: 'A single character is a palindrome of length 1.' },
  { d: 3, dim: 2, name: 'Minimum Insertions to Make a Palindrome', skills: ['dp-2d'],
    rec: 'dp[i][j] = dp[i+1][j-1] if s[i]==s[j] else 1 + min(dp[i+1][j], dp[i][j-1])', recWhy: 'Matching ends need no insertion; otherwise insert a mirror on whichever side is cheaper.',
    base: 'dp[i][i] = 0', baseWhy: 'A single character is already a palindrome.' },
  { d: 3, dim: 2, name: 'Maximal Square', skills: ['dp-2d'],
    rec: 'dp[i][j] = min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) + 1 if cell == 1 else 0', recWhy: 'A square ending at (i,j) is capped by the smallest square ending just above, just left, and diagonally up-left.',
    base: "dp[0][*] / dp[*][0] = the cell's own value", baseWhy: 'The first row and column can form at best a 1×1 square.' },
  { d: 3, dim: 2, name: 'Interleaving String', skills: ['dp-2d'],
    rec: 'dp[i][j] = (dp[i-1][j] and s1[i-1]==s3[i+j-1]) or (dp[i][j-1] and s2[j-1]==s3[i+j-1])', recWhy: 'The next character of s3 must come from s1 or from s2, matching whichever one it extends.',
    base: 'dp[0][0] = True', baseWhy: 'Two empty strings trivially interleave into an empty string.' },
  { d: 3, dim: 2, name: 'Wildcard Matching', skills: ['dp-2d'],
    rec: "dp[i][j] = dp[i-1][j-1] if chars match else (dp[i-1][j] or dp[i][j-1]) if p[j-1]=='*' else False",
    recWhy: "A '*' can match zero characters (dp[i][j-1]) or absorb one more character of the text (dp[i-1][j]).",
    base: 'dp[0][0] = True', baseWhy: 'Two empty strings match.' },
  { d: 3, dim: 2, name: 'Distinct Subsequences', skills: ['dp-2d'],
    rec: 'dp[i][j] = dp[i-1][j-1] + dp[i-1][j] if match else dp[i-1][j]', recWhy: 'On a match, either use s[i-1] to complete t[j-1] or skip it; a mismatch can only skip it.',
    base: 'dp[i][0] = 1', baseWhy: 'Every prefix of s matches the empty target in exactly one way: use nothing.' },
  { d: 3, dim: 2, name: 'Burst Balloons', skills: ['dp-2d', 'greedy'],
    rec: 'dp[l][r] = max(dp[l][k-1] + nums[l-1]*nums[k]*nums[r+1] + dp[k+1][r] for k in range(l, r+1))', recWhy: 'Think of k as the last balloon burst in the range, not the first, so its neighbors are still the range edges.',
    base: 'dp[i][i-1] = 0', baseWhy: 'An empty range of balloons scores nothing.' },
  { d: 3, dim: 2, name: 'Stone Game (optimal play)', skills: ['dp-2d', 'greedy'],
    rec: 'dp[l][r] = max(nums[l] - dp[l+1][r], nums[r] - dp[l][r-1])', recWhy: 'Taking an end gives you that pile, minus whatever lead the opponent then wins on the rest.',
    base: 'dp[i][i] = nums[i]', baseWhy: 'One pile left: take it, no one answers back.' },
  { d: 3, dim: 2, name: 'Longest Increasing Path in a Matrix', skills: ['dp-2d'],
    rec: 'dp[r][c] = 1 + max(dp[nr][nc] for a strictly greater neighbor)', recWhy: 'Memoized DFS: the path starting at a cell is 1 plus the best path from a strictly larger neighbor.',
    base: 'dp[r][c] = 1 if no neighbor is greater', baseWhy: 'A local peak is a path of length 1 by itself.' },
]

const recPool1d = recurrences.filter(entry => entry.dim === 1)
const recPool2d = recurrences.filter(entry => entry.dim === 2)

function recurrenceQuestion(level = 1) {
  const item = pickByLevel(recurrences, level)
  const index = recurrences.indexOf(item)
  const pool = item.dim === 1 ? recPool1d : recPool2d
  const recDistractors = pool.filter(entry => entry !== item).map(entry => entry.rec)
  const baseDistractors = pool.filter(entry => entry !== item).map(entry => entry.base)
  return {
    id: `pattern-radar:recurrence:${index}`,
    skills: item.skills,
    tag: { icon: 'ruler', text: 'DP recurrence' },
    tagClass: 'pill-amber',
    summary: item.name,
    prompt: `${item.name} — define dp[i]${item.dim === 2 ? '[j]' : ''}.`,
    parts: [
      part('Recurrence?', item.rec, recDistractors, item.recWhy),
      part('Base case?', item.base, baseDistractors, item.baseWhy),
    ],
  }
}

function simulateTwoPointer(arr, target) {
  let l = 0
  let r = arr.length - 1
  const steps = []
  while (l < r) {
    const sum = arr[l] + arr[r]
    const action = sum === target ? 'found' : sum < target ? 'left' : 'right'
    steps.push({ l, r, sum, action })
    if (action === 'found') break
    if (action === 'left') l++
    else r--
  }
  return steps
}

function drawRaceArray(arr, l, r, target) {
  return h('div', { class: 'race-ask' },
    h('div', { class: 'heap-ask-cap' }, `L = ${l}, R = ${r}`),
    h('div', { class: 'race-row' }, arr.map((val, i) => h('div', { class: `race-box${i === l ? ' race-l' : ''}${i === r ? ' race-r' : ''}` }, String(val)))),
    h('div', { class: 'race-target muted small' }, `target = ${target} · arr[L] + arr[R] = ${arr[l] + arr[r]}`))
}

function twoPointerQuestion(level = 1) {
  const n = Math.min(9, 6 + Math.floor(level / 1.6) + rand(2))
  const arr = Array.from({ length: n }, () => 1 + rand(40)).sort((a, b) => a - b)
  const li = rand(n - 2)
  const ri = li + 1 + rand(n - li - 1)
  const target = arr[li] + arr[ri]
  const steps = simulateTwoPointer(arr, target)
  const parts = steps.map(step => {
    const options = {
      left: `Move L → (sum ${step.sum} < target)`,
      right: `Move R ← (sum ${step.sum} > target)`,
      found: 'Found! sum = target',
    }
    const answer = options[step.action]
    const distractors = Object.entries(options).filter(([key]) => key !== step.action).map(([, label]) => label)
    const why = step.action === 'found'
      ? `arr[L] + arr[R] = ${step.sum} = target. Stop here.`
      : step.action === 'left'
        ? `${step.sum} < ${target}: the array is sorted, so only a bigger left value can raise the sum.`
        : `${step.sum} > ${target}: only a smaller right value can lower the sum.`
    return part(drawRaceArray(arr, step.l, step.r, target), answer, distractors, why)
  })
  return {
    id: `pattern-radar:race:${arr.join('-')}:${target}`,
    skills: ['two-pointers'],
    tag: { icon: 'flag', text: 'Two-pointer race' },
    tagClass: 'pill-green',
    summary: `Sorted array, target ${target}`,
    prompt: `Target sum = ${target}. Which move closes the gap?`,
    parts,
  }
}

export function makeQuestion(level = 1) {
  const roll = rand(5)
  if (roll < 3) return diagnosisQuestion(level)
  if (roll === 3) return recurrenceQuestion(level)
  return twoPointerQuestion(level)
}

export default {
  id: 'pattern-radar',
  title: 'Pattern Radar',
  icon: 'radar',
  blurb: 'Spot the pattern before the clock does.',
  skills: ['ds-diagnosis', 'sliding-window', 'two-pointers', 'graph-bfs', 'dp-1d', 'dp-2d'],
  difficulty: 'Escalates with streak',
  modeLabel: '75s timer',
  supportsDaily: true,
  mount: (container, api) => runQuiz(container, api, {
    title: 'Pattern Radar',
    icon: 'radar',
    rules: ['faster = more points', '1-4 to answer'],
    mode: 'timed',
    seconds: 75,
    speedMs: 7000,
    autoMs: 650,
    seed: api.seed,
    makeQuestion,
  }),
}
