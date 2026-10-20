const items = [
  {
    id: 'thought:dp:climbing-stairs',
    lc: 70,
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    category: 'dp',
    skills: ['dp-1d'],
    companies: ['google', 'amazon', 'apple', 'bloomberg'],
    statement: `You're climbing a staircase that takes n steps to reach the top, and on each move you can climb either 1 or 2 steps.

Count how many distinct sequences of moves get you from the ground to the top step.

Only the count matters here, not what the actual sequences look like.`,
    examples: [
      { input: 'n = 5', output: '8', explanation: 'ways(5) = ways(4) + ways(3), Fibonacci-style growth' },
    ],
    constraints: ['1 <= n <= 45'],
    ds: {
      answer: '1-D dp array of step counts (or two rolling ints)',
      choices: ['2-D dp table', '1-D dp array of step counts (or two rolling ints)', 'min-heap of (steps, pos) + dist dict', 'dd(list) adjacency + set visited'],
    },
    method: {
      answer: 'Bottom-up DP: ==dp[i] = dp[i-1] + dp[i-2]==, ways to land on step i is the sum of ways from the two steps before it',
      choices: [
        'Greedy: always take 2-steps first then fill the remainder with 1-steps',
        'Bottom-up DP: ==dp[i] = dp[i-1] + dp[i-2]==, ways to land on step i is the sum of ways from the two steps before it',
        'BFS over step counts, counting paths layer by layer from step 0',
        'Backtracking that tries both step sizes at each position with no memoization',
      ],
    },
    code: `class Solution:
    def climbStairs(self, n: int) -> int:
        if n <= 2:
            return n

        dp = [1, 2]

        for i in range(2, n):
            dp.append(dp[i - 1] + dp[i - 2])

        return dp[-1]`,
    blanks: [5, 8, 10],
    accept: { 8: ['dp.append(dp[-1] + dp[-2])'] },
    time: { answer: 'O(n)', choices: ['O(log n)', 'O(n)', 'O(n^2)', 'O(2^n)'], why: 'one forward pass filling dp up to n' },
    space: { answer: 'O(n)', choices: ['O(1)', 'O(n)', 'O(n^2)', 'O(log n)'], why: 'dp list grows to length n, rollable to two vars' },
    sayIt: "I'll roll this like Fibonacci: ==dp[i] = dp[i-1] + dp[i-2]==, bottom-up O(n) time, O(1) space with two rolling vars.",
    pitfall: 'Must special-case n <= 2 before building the dp array.',
  },
  {
    id: 'thought:dp:house-robber',
    lc: 198,
    title: 'House Robber',
    difficulty: 'Medium',
    category: 'dp',
    skills: ['dp-1d'],
    companies: ['google', 'amazon', 'microsoft'],
    statement: `You're planning a heist down a street of houses, each holding some amount of cash. Robbing two houses that are directly next to each other trips the alarm, so any two houses you pick can't be adjacent.

Given the cash at each house, find the maximum total you can steal.

You may rob any subset of non-adjacent houses, not just every other one; skipping around is allowed as long as no two picks are neighbors.`,
    examples: [
      { input: 'nums = [2,7,9,3,1]', output: '12', explanation: 'rob house0 (2) + house2 (9) + house4 (1) = 12' },
    ],
    constraints: ['1 <= nums.length <= 100', '0 <= nums[i] <= 400'],
    ds: {
      answer: '1-D dp array (rob vs skip at each house)',
      choices: ['1-D dp array (rob vs skip at each house)', '2-D dp table', 'monotonic stack of indices', 'dd(list) adjacency + set visited'],
    },
    method: {
      answer: 'Bottom-up DP: ==dp[i] = max(dp[i-1], dp[i-2] + nums[i])==, at each house either skip it (carry forward) or rob it (add to two-back)',
      choices: [
        'DFS/backtracking trying every subset of non-adjacent houses',
        'Greedy: always rob every other house starting from the richest one',
        'Bottom-up DP: ==dp[i] = max(dp[i-1], dp[i-2] + nums[i])==, at each house either skip it (carry forward) or rob it (add to two-back)',
        'Sliding window tracking the best sum of any 2 consecutive houses',
      ],
    },
    code: `class Solution:
    def rob(self, nums: List[int]) -> int:
        if len(nums) == 1:
            return nums[0]

        dp = [nums[0], max(nums[0], nums[1])]

        for i in range(2, len(nums)):
            dp.append(max(dp[i - 1], dp[i - 2] + nums[i]))

        return dp[-1]`,
    blanks: [5, 8, 10],
    accept: { 8: ['dp.append(max(dp[i - 2] + nums[i], dp[i - 1]))'] },
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(2^n)'], why: 'one pass building dp, O(1) work per house' },
    space: { answer: 'O(n)', choices: ['O(1)', 'O(n)', 'O(n^2)', 'O(log n)'], why: 'dp list grows to length n, rollable to two vars' },
    sayIt: "I track ==dp[i] = max(dp[i-1], dp[i-2]+nums[i])== at each house, skip or rob, O(n) time, O(1) space rolled.",
    pitfall: 'Forgetting the len(nums) == 1 base case before indexing nums[1].',
  },
  {
    id: 'thought:dp:house-robber-ii',
    lc: 213,
    title: 'House Robber II',
    difficulty: 'Medium',
    category: 'dp',
    skills: ['dp-1d'],
    companies: ['amazon', 'microsoft'],
    statement: `Same heist, except the houses are arranged in a circle this time, so the first and last houses count as adjacent to each other too.

You still can't rob two adjacent houses, and now that adjacency wraps around the ends of the street.

Find the maximum you can steal from this circular street.`,
    examples: [
      { input: 'nums = [2,3,2]', output: '3', explanation: 'house0 and house2 are now adjacent (circular), so robbing just house1 alone is best' },
    ],
    constraints: ['1 <= nums.length <= 100', '0 <= nums[i] <= 1000'],
    ds: {
      answer: '1-D dp array applied twice (skip first vs skip last house)',
      choices: ['2-D dp table keyed by (index, wrapped bool)', '1-D dp array applied twice (skip first vs skip last house)', 'monotonic stack of indices', 'dd(list) adjacency + set visited'],
    },
    method: {
      answer: 'Break the circle: ==run the linear House Robber dp twice==, once excluding the first house and once excluding the last, then take the max',
      choices: [
        'Single linear dp over all n houses, treating the circle as a line and ignoring the wrap',
        'Break the circle: ==run the linear House Robber dp twice==, once excluding the first house and once excluding the last, then take the max',
        'Greedy: compare the sum of even-indexed houses against the sum of odd-indexed houses',
        'DFS backtracking that tries skipping every pair of adjacent houses, including the wrap edge',
      ],
    },
    code: `class Solution:
    def rob(self, nums: List[int]) -> int:
        if len(nums) == 1:
            return nums[0]

        def robLine(houses):
            if len(houses) == 1:
                return houses[0]

            dp = [houses[0], max(houses[0], houses[1])]

            for i in range(2, len(houses)):
                dp.append(max(dp[i - 1], dp[i - 2] + houses[i]))

            return dp[-1]

        return max(robLine(nums[1:]), robLine(nums[:-1]))`,
    blanks: [9, 12, 16],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(2^n)'], why: 'two linear O(n) passes over the two trimmed arrays' },
    space: { answer: 'O(n)', choices: ['O(1)', 'O(n)', 'O(n^2)', 'O(log n)'], why: 'each robLine call builds its own O(n) dp list' },
    sayIt: "I ==break the circle== into two linear robber calls, exclude index 0, exclude index n-1, take the max, O(n) time.",
    pitfall: 'Forgetting the n == 1 special case before slicing nums[1:] / nums[:-1].',
  },
  {
    id: 'thought:dp:min-cost-climbing-stairs',
    lc: 746,
    title: 'Min Cost Climbing Stairs',
    difficulty: 'Easy',
    category: 'dp',
    skills: ['dp-1d'],
    companies: ['amazon'],
    statement: `You're given the cost to step on each stair in an array, and you start standing just before index 0, where you can enter at either index 0 or index 1 for free.

From any stair you can move 1 or 2 indices forward, paying the cost of whatever stair you land on. One index past the last stair is the "top", and reaching it costs nothing.

Find the minimum total cost to get from the start to the top.`,
    examples: [
      { input: 'cost = [10,15,20]', output: '15', explanation: 'start at index1 (pay 15), then step 2 to reach the top for free' },
    ],
    constraints: ['2 <= cost.length <= 1000', '0 <= cost[i] <= 999'],
    ds: {
      answer: '1-D dp array of minimum cost to reach each stair',
      choices: ['1-D dp array of minimum cost to reach each stair', '2-D dp table', 'min-heap of (cost, stair) + dist dict (Dijkstra)', 'monotonic stack of indices'],
    },
    method: {
      answer: 'Bottom-up DP: ==dp[i] = cost[i] + min(dp[i-1], dp[i-2])==, cheapest way onto stair i is its own cost plus the cheaper of the two stairs before it',
      choices: [
        'Dijkstra with a min-heap of (cost, stair index), relaxing 1 and 2-step neighbors',
        'Greedy: always take the single cheapest stair cost at each move, ignoring future stairs',
        'DFS backtracking over every 1/2-step sequence to the top, no memoization',
        'Bottom-up DP: ==dp[i] = cost[i] + min(dp[i-1], dp[i-2])==, cheapest way onto stair i is its own cost plus the cheaper of the two stairs before it',
      ],
    },
    code: `class Solution:
    def minCostClimbingStairs(self, cost: List[int]) -> int:
        dp = [cost[0], cost[1]]

        for i in range(2, len(cost)):
            dp.append(cost[i] + min(dp[i - 1], dp[i - 2]))

        return min(dp[-1], dp[-2])`,
    blanks: [2, 5, 7],
    accept: { 5: ['dp.append(min(dp[i - 2], dp[i - 1]) + cost[i])'] },
    time: { answer: 'O(n)', choices: ['O(n)', 'O(log n)', 'O(n^2)', 'O(2^n)'], why: 'single forward pass, O(1) work filling each dp entry' },
    space: { answer: 'O(n)', choices: ['O(1)', 'O(n)', 'O(n^2)', 'O(log n)'], why: 'dp list grows to length n, rollable to O(1)' },
    sayIt: "I build ==dp[i] = cost[i] + min(dp[i-1], dp[i-2])==, then take min(dp[-1], dp[-2]) since either stair can be the top, O(n) time.",
    pitfall: 'Forgetting you can start at index 0 or index 1 for free.',
  },
  {
    id: 'thought:dp:decode-ways',
    lc: 91,
    title: 'Decode Ways',
    difficulty: 'Medium',
    category: 'dp',
    skills: ['dp-1d'],
    companies: ['google', 'microsoft', 'meta'],
    statement: `A message of digits was encoded by mapping letters A-Z to the numbers 1-26, then concatenating the numbers with no separator.

Given the encoded digit string, count how many different letter messages could have produced it.

A "0" can never stand alone as a valid code, and two digits only form a valid letter together when read as a number between 10 and 26.`,
    examples: [
      { input: 's = "226"', output: '3', explanation: 'decodes to "BBF" (2,2,6), "BZ" (2,26), or "VF" (22,6)' },
      { input: 's = "06"', output: '0', explanation: 'a leading zero can\'t stand alone and "06" is not a valid 2-digit code' },
    ],
    constraints: ['1 <= s.length <= 100', 's[i] is a digit; s may contain leading zeros'],
    ds: {
      answer: '1-D dp array indexed by prefix length',
      choices: ['2-D dp table', '1-D dp array indexed by prefix length', 'trie of dict children', 'dd(list) adjacency + set visited'],
    },
    method: {
      answer: 'Bottom-up DP: ==dp[i] = dp[i-1] if the single digit s[i] is valid, plus dp[i-2] if the pair s[i-1:i+1] is 10-26==',
      choices: [
        'Greedy: always prefer the 2-digit split whenever it is valid',
        'BFS layer by layer over partial decodings, counting ways to reach each prefix length',
        'DFS backtracking that tries every 1-digit/2-digit split and counts valid leaves, no memoization',
        'Bottom-up DP: ==dp[i] = dp[i-1] if the single digit s[i] is valid, plus dp[i-2] if the pair s[i-1:i+1] is 10-26==',
      ],
    },
    code: `class Solution:
    def numDecodings(self, s: str) -> int:
        if s[0] == "0":
            return 0

        n = len(s)
        dp = [0] * n
        dp[0] = 1

        for i in range(1, n):
            if s[i] != "0":
                dp[i] += dp[i - 1]
            if 9 < int(s[i - 1:i + 1]) < 27:
                dp[i] += dp[i - 2] if i >= 2 else 1

        return dp[-1]`,
    blanks: [7, 11, 13],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(2^n)'], why: 'one pass checking a 1-digit and 2-digit window per index' },
    space: { answer: 'O(n)', choices: ['O(1)', 'O(n)', 'O(n^2)', 'O(log n)'], why: 'one dp array of length n, rollable to two vars' },
    sayIt: "I add ==dp[i-1] for a valid single digit, dp[i-2] for a valid two-digit pair==, base case dp[0] = 1, O(n) time.",
    pitfall: "A leading \"0\" or an invalid two-digit pair must contribute zero ways.",
  },
  {
    id: 'thought:dp:coin-change',
    lc: 322,
    title: 'Coin Change',
    difficulty: 'Medium',
    category: 'dp',
    skills: ['dp-1d'],
    companies: ['google', 'amazon', 'microsoft'],
    statement: `You have coins of several denominations and an unlimited supply of each. You need to make up a target amount using the fewest coins possible.

Return that minimum number of coins, or report that the amount can't be made at all with these denominations.

You can reuse any coin as many times as needed; only the count of coins used matters, not their order.`,
    examples: [
      { input: 'coins = [1,2,5], amount = 11', output: '3', explanation: '5 + 5 + 1 = 11 using 3 coins' },
      { input: 'coins = [2], amount = 3', output: '-1', explanation: 'an odd amount can never be made from only even coins' },
    ],
    constraints: ['1 <= coins.length <= 12', '1 <= coins[i] <= 2^31 - 1', '0 <= amount <= 10^4'],
    ds: {
      answer: '1-D dp array seeded with inf (min coins per amount)',
      choices: ['1-D dp array seeded with inf (min coins per amount)', 'min-heap of (coins, amount) + dist dict', 'BFS queue of remaining amounts + visited set', '2-D dp table of (coin index, amount)'],
    },
    method: {
      answer: 'Bottom-up unbounded knapsack: ==dp[i] = min over every coin c of 1 + dp[i-c]==, minimum coins to make amount i',
      choices: [
        'Greedy: always take the largest coin that fits, like making change with US currency',
        'Bottom-up unbounded knapsack: ==dp[i] = min over every coin c of 1 + dp[i-c]==, minimum coins to make amount i',
        'DFS backtracking over coin choices with no memoization, pruning only when the running total exceeds amount',
        'BFS treating amounts as graph nodes and coin values as edges, tracking the first amount reached at each depth',
      ],
    },
    code: `class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        dp = [0] + [math.inf] * amount

        for i in range(1, amount + 1):
            for c in coins:
                if i - c >= 0:
                    dp[i] = min(dp[i], 1 + dp[i - c])

        return dp[amount] if dp[amount] != math.inf else -1`,
    blanks: [2, 7, 9],
    accept: { 7: ['dp[i] = min(1 + dp[i - c], dp[i])'] },
    time: { answer: 'O(amount * len(coins))', choices: ['O(amount * len(coins))', 'O(amount)', 'O(2^amount)', 'O(amount log amount)'], why: 'nested loop over every amount and every coin' },
    space: { answer: 'O(amount)', choices: ['O(amount)', 'O(1)', 'O(amount * len(coins))', 'O(len(coins))'], why: 'one dp array of size amount + 1' },
    sayIt: "I fill dp bottom-up, ==dp[i] = min(dp[i], 1 + dp[i-c]) for every coin c==, unbounded knapsack, O(amount*coins) time.",
    pitfall: 'Must check dp[amount] is still inf before returning -1.',
  },
  {
    id: 'thought:dp:coin-change-ii',
    lc: 518,
    title: 'Coin Change II',
    difficulty: 'Medium',
    category: 'dp',
    skills: ['dp-1d'],
    companies: ['amazon'],
    statement: `Same pile of unlimited coin denominations, but now you're counting instead of minimizing.

Given a target amount, count how many different combinations of coins add up to exactly that amount. Two combinations that use the same coins in a different order count as the same combination.

So two 1s and a 3 is the same combination as a 3 and two 1s; you're counting multisets, not sequences.`,
    examples: [
      { input: 'amount = 5, coins = [1,2,5]', output: '4', explanation: '5=5, 5=2+2+1, 5=2+1+1+1, 5=1+1+1+1+1' },
    ],
    constraints: ['1 <= coins.length <= 300', '1 <= amount <= 5000', '1 <= coins[i] <= 5000, all coins distinct'],
    ds: {
      answer: '1-D dp array of combo counts (coin-outer, amount-inner loop)',
      choices: ['2-D dp table of (coin index, amount)', '1-D dp array of combo counts (coin-outer, amount-inner loop)', 'dd(int) memo keyed by (index, remaining)', 'BFS queue of remaining amounts + visited set'],
    },
    method: {
      answer: 'Bottom-up counting DP: ==loop coins on the outside, amounts on the inside==, so each coin is considered once per combination instead of generating every ordering',
      choices: [
        'Loop amounts on the outside and coins on the inside, same recurrence dp[i] += dp[i-c]',
        'DFS backtracking trying every ordered sequence of coins that sums to amount',
        'Bottom-up counting DP: ==loop coins on the outside, amounts on the inside==, so each coin is considered once per combination instead of generating every ordering',
        'Top-down memo on (index, remaining) exploring take/skip for a 0/1 knapsack',
      ],
    },
    code: `class Solution:
    def change(self, amount: int, coins: List[int]) -> int:
        dp = [1] + [0] * amount

        for c in coins:
            for i in range(c, amount + 1):
                dp[i] += dp[i - c]

        return dp[amount]`,
    blanks: [2, 4, 6],
    time: { answer: 'O(amount * len(coins))', choices: ['O(amount * len(coins))', 'O(amount)', 'O(2^amount)', 'O(amount log amount)'], why: 'for each coin, scan every amount up to the target' },
    space: { answer: 'O(amount)', choices: ['O(amount)', 'O(1)', 'O(amount * len(coins))', 'O(len(coins))'], why: 'one dp array of size amount + 1' },
    sayIt: "I loop ==coins outside, amounts inside== so I count combinations, not permutations, dp[i] += dp[i-c], O(amount*coins) time.",
    pitfall: 'Swapping the loop order double counts permutations instead of combinations.',
  },
  {
    id: 'thought:dp:word-break',
    lc: 139,
    title: 'Word Break',
    difficulty: 'Medium',
    category: 'dp',
    skills: ['dp-1d'],
    companies: ['google', 'amazon', 'microsoft', 'meta'],
    statement: `You're given a string and a dictionary of words. Decide whether the string can be fully segmented into a sequence of one or more dictionary words, back to back with no leftover characters.

The same dictionary word can be reused as many times as needed, and the dictionary may contain words that never end up being used.

You only need to answer whether a valid segmentation exists, not what it looks like.`,
    examples: [
      { input: 's = "leetcode", wordDict = ["leet","code"]', output: 'true', explanation: '"leet" + "code" exactly covers the string' },
      { input: 's = "catsandog", wordDict = ["cats","dog","sand","and","cat"]', output: 'false', explanation: "no combination covers the string without a leftover 'og'" },
    ],
    constraints: ['1 <= s.length <= 300', '1 <= wordDict.length <= 1000', '1 <= word.length <= 20'],
    ds: {
      answer: '1-D dp boolean array over suffix positions',
      choices: ['1-D dp boolean array over suffix positions', 'trie of dict children', '2-D dp table of (i, j) substring breakable', 'BFS queue of positions + visited set'],
    },
    method: {
      answer: 'Bottom-up DP from the end: ==dp[i] = True if some dictionary word matches s[i:i+len(word)] and dp[i+len(word)] is True==, dp[n] (empty suffix) is the base case',
      choices: [
        'Top-down DFS trying every prefix split point, no memoization (exponential)',
        'BFS treating each index as a node and each valid word-match as an edge, scanning from the end',
        'Bottom-up DP from the end: ==dp[i] = True if some dictionary word matches s[i:i+len(word)] and dp[i+len(word)] is True==, dp[n] (empty suffix) is the base case',
        'Greedy: always take the longest dictionary word that matches at the current position',
      ],
    },
    code: `class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        n = len(s)
        dp = [False] * (n + 1)
        dp[n] = True

        for i in range(n - 1, -1, -1):
            for word in wordDict:
                if i + len(word) <= n and s[i:i + len(word)] == word:
                    dp[i] = dp[i + len(word)]
                if dp[i]:
                    break

        return dp[0]`,
    blanks: [4, 8, 9],
    time: { answer: 'O(n * W * L)', choices: ['O(n * W * L)', 'O(n^2)', 'O(2^n)', 'O(n log n)'], why: 'n string positions times dict size times max word length' },
    space: { answer: 'O(n)', choices: ['O(1)', 'O(n)', 'O(n^2)', 'O(n * W)'], why: 'one boolean dp array of length n + 1' },
    sayIt: "I fill dp backward: ==dp[i] true if a word matches s[i:] and dp[i+len(word)] is also true==, base case dp[n]=True, O(n*W*L) time.",
    pitfall: 'Must check i + len(word) <= n before slicing the substring.',
  },
  {
    id: 'thought:dp:longest-increasing-subsequence',
    lc: 300,
    title: 'Longest Increasing Subsequence',
    difficulty: 'Medium',
    category: 'dp',
    skills: ['dp-1d'],
    companies: ['google', 'amazon', 'microsoft'],
    statement: `Given an array of integers, find the length of the longest subsequence that is strictly increasing.

A subsequence keeps the relative order of the original array but can skip over elements; it doesn't need to be contiguous.

You only need the length of the longest such subsequence, not the subsequence itself.`,
    examples: [
      { input: 'nums = [10,9,2,5,3,7,101,18]', output: '4', explanation: '[2,3,7,101] (or [2,3,7,18]) is a longest increasing subsequence' },
    ],
    constraints: ['1 <= nums.length <= 2500', '-10^4 <= nums[i] <= 10^4'],
    ds: {
      answer: '1-D dp array (longest[i] = best suffix starting at i)',
      choices: ['tails array + bisect (patience sorting)', '1-D dp array (longest[i] = best suffix starting at i)', '2-D dp table of (i, j) pairs', 'dd(list) adjacency + topological sort'],
    },
    method: {
      answer: 'Bottom-up O(n^2) DP: ==longest[i] = 1 + max(longest[j]) over every j > i with nums[j] > nums[i]==, computed back to front, track a running max',
      choices: [
        'Patience sorting: maintain a tails array and binary-search where each number would extend or replace a tail',
        'Greedy: always extend the current increasing run and reset whenever a smaller number appears',
        'Top-down DFS trying to include or exclude each element, with no memoization',
        'Bottom-up O(n^2) DP: ==longest[i] = 1 + max(longest[j]) over every j > i with nums[j] > nums[i]==, computed back to front, track a running max',
      ],
    },
    code: `class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        n = len(nums)
        longest = [1] * n
        best = 1

        for i in range(n - 1, -1, -1):
            for j in range(i + 1, n):
                if nums[j] > nums[i]:
                    longest[i] = max(longest[i], 1 + longest[j])

            best = max(best, longest[i])

        return best`,
    blanks: [3, 9, 11],
    time: { answer: 'O(n^2)', choices: ['O(n^2)', 'O(n log n)', 'O(n)', 'O(2^n)'], why: 'nested loop comparing every pair of indices (i, j)' },
    space: { answer: 'O(n)', choices: ['O(1)', 'O(n)', 'O(n^2)', 'O(log n)'], why: 'one dp array of length n plus a running max' },
    sayIt: "I run ==longest[i] = 1 + best longest[j] for any later larger nums[j]==, O(n^2); could upgrade to O(n log n) with patience sorting if asked.",
    pitfall: 'Forgetting every single element is itself a length-1 subsequence.',
  },
  {
    id: 'thought:dp:partition-equal-subset-sum',
    lc: 416,
    title: 'Partition Equal Subset Sum',
    difficulty: 'Medium',
    category: 'dp',
    skills: ['dp-1d'],
    companies: ['amazon', 'meta'],
    statement: `Given an array of positive integers, decide whether it can be split into two subsets whose sums are exactly equal.

Every element must land in exactly one of the two groups; nothing is left out and nothing is shared between groups.

This is really asking whether some subset of the array sums to exactly half of the total.`,
    examples: [
      { input: 'nums = [1,5,11,5]', output: 'true', explanation: '[1,5,5] sums to 11 and the remaining [11] also sums to 11' },
      { input: 'nums = [1,2,3,5]', output: 'false', explanation: 'total is 11 (odd), so it can never split into two equal halves' },
    ],
    constraints: ['1 <= nums.length <= 200', '1 <= nums[i] <= 100'],
    ds: {
      answer: '1-D boolean dp array over achievable sums (0/1 knapsack, iterate backward)',
      choices: ['1-D boolean dp array over achievable sums (0/1 knapsack, iterate backward)', 'dd(int) Counter of achievable sums', '2-D dp table of (index, sum)', 'min-heap of partial sums + visited set'],
    },
    method: {
      answer: '0/1 knapsack reduction: check if any subset sums to ==total/2==; dp[i] = true if sum i is reachable, looping sums backward per number so each item is used at most once',
      choices: [
        'Loop sums forward (ascending) for each number, same dp[i] = dp[i] or dp[i-num] update',
        '0/1 knapsack reduction: check if any subset sums to ==total/2==; dp[i] = true if sum i is reachable, looping sums backward per number so each item is used at most once',
        'Greedy: sort descending and keep assigning each number to whichever running total is currently smaller',
        'Backtracking over every 2^n subset assignment with no memoization',
      ],
    },
    code: `class Solution:
    def canPartition(self, nums: List[int]) -> bool:
        total = sum(nums)
        if total % 2:
            return False

        target = total // 2
        dp = [True] + [False] * target

        for num in nums:
            for i in range(target, num - 1, -1):
                if dp[i - num]:
                    dp[i] = True

        return dp[target]`,
    blanks: [7, 10, 12],
    time: { answer: 'O(n * sum(nums))', choices: ['O(n * sum(nums))', 'O(2^n)', 'O(n log n)', 'O(n^2)'], why: 'for each number, scan achievable sums up to total/2' },
    space: { answer: 'O(sum(nums))', choices: ['O(sum(nums))', 'O(n)', 'O(1)', 'O(n * sum(nums))'], why: 'one boolean dp array sized total/2' },
    sayIt: "I check if some subset hits ==total/2==, looping numbers outside and sums backward inside so nothing gets reused, O(n*sum) time.",
    pitfall: 'An odd total sum means the answer is immediately false.',
  },
  {
    id: 'thought:dp:unique-paths',
    lc: 62,
    title: 'Unique Paths',
    difficulty: 'Medium',
    category: 'dp',
    skills: ['dp-2d'],
    companies: ['google', 'amazon', 'bloomberg'],
    statement: `A robot sits at the top-left corner of an m x n grid and wants to reach the bottom-right corner.

At each step the robot can only move right or down by one cell, never left or up.

Count how many distinct paths get the robot from the top-left to the bottom-right corner.`,
    examples: [
      { input: 'm = 3, n = 7', output: '28' },
    ],
    constraints: ['1 <= m, n <= 100'],
    ds: {
      answer: '2-D dp table (padded one extra row/col of zeros)',
      choices: ['1-D dp array rolled row by row', '2-D dp table (padded one extra row/col of zeros)', 'BFS grid traversal + visited set', 'dd(list) adjacency + DFS'],
    },
    method: {
      answer: 'Bottom-up DP filling from the goal backward: ==dp[i][j] = dp[i+1][j] + dp[i][j+1]==, paths from a cell is the sum of paths from below and from the right',
      choices: [
        'Top-down DFS counting every right/down path to the goal, no memoization (exponential)',
        'BFS level by level from the start, counting how many ways reach each distance',
        'Greedy: always move toward whichever of right/down has more remaining cells',
        'Bottom-up DP filling from the goal backward: ==dp[i][j] = dp[i+1][j] + dp[i][j+1]==, paths from a cell is the sum of paths from below and from the right',
      ],
    },
    code: `class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        dp[m - 1][n - 1] = 1

        for i in range(m - 1, -1, -1):
            for j in range(n - 1, -1, -1):
                dp[i][j] += dp[i + 1][j] + dp[i][j + 1]

        return dp[0][0]`,
    blanks: [2, 3, 7],
    time: { answer: 'O(m * n)', choices: ['O(m * n)', 'O(m + n)', 'O(2^(m+n))', 'O(m * n * log(m*n))'], why: 'fill every cell of the padded grid once' },
    space: { answer: 'O(m * n)', choices: ['O(min(m, n))', 'O(m * n)', 'O(1)', 'O(m + n)'], why: 'full 2-D dp table, rollable to one row O(n)' },
    sayIt: "I fill backward, ==dp[i][j] = dp[i+1][j] + dp[i][j+1]==, seeded at the goal cell, O(m*n) time and space.",
    pitfall: 'Forgetting to seed the goal cell dp[m-1][n-1] = 1 first.',
  },
  {
    id: 'thought:dp:minimum-path-sum',
    lc: 64,
    title: 'Minimum Path Sum',
    difficulty: 'Medium',
    category: 'dp',
    skills: ['dp-2d'],
    companies: ['google', 'amazon', 'bloomberg'],
    statement: `You're given a grid of non-negative numbers representing the cost to step on each cell. Starting at the top-left corner, you want to reach the bottom-right corner.

From any cell you can only move right or down, and you pay the cost of every cell you land on, including the start and the end.

Find the minimum total cost of any path from the top-left to the bottom-right.`,
    examples: [
      { input: 'grid = [[1,3,1],[1,5,1],[4,2,1]]', output: '7', explanation: 'path 1 -> 3 -> 1 -> 1 -> 1 sums to 7' },
    ],
    constraints: ['1 <= rows, cols <= 200', '0 <= grid[i][j] <= 200'],
    ds: {
      answer: '2-D dp table padded with infinity, two border cells seeded to 0',
      choices: ['1-D dp array rolled across rows', '2-D dp table padded with infinity, two border cells seeded to 0', 'min-heap of (cost, row, col) + dist dict (Dijkstra)', 'BFS grid traversal + visited set'],
    },
    method: {
      answer: 'Bottom-up DP from the goal backward: ==dp[i][j] = grid[i][j] + min(dp[i+1][j], dp[i][j+1])==, pad one extra row/col of infinity and zero only the two cells touching the goal',
      choices: [
        'Dijkstra with a min-heap of (cost, row, col), relaxing right/down neighbors',
        'BFS from the start, taking the first path that reaches the goal',
        'Greedy: always move into whichever neighboring cell has the smaller value',
        'Bottom-up DP from the goal backward: ==dp[i][j] = grid[i][j] + min(dp[i+1][j], dp[i][j+1])==, pad one extra row/col of infinity and zero only the two cells touching the goal',
      ],
    },
    code: `class Solution:
    def minPathSum(self, grid: List[List[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        dp = [[math.inf] * (cols + 1) for _ in range(rows + 1)]
        dp[rows - 1][cols] = 0
        dp[rows][cols - 1] = 0

        for i in range(rows - 1, -1, -1):
            for j in range(cols - 1, -1, -1):
                dp[i][j] = grid[i][j] + min(dp[i + 1][j], dp[i][j + 1])

        return dp[0][0]`,
    blanks: [4, 5, 9],
    time: { answer: 'O(rows * cols)', choices: ['O(rows * cols)', 'O(rows + cols)', 'O(2^(rows+cols))', 'O(rows * cols * log(rows*cols))'], why: 'fill every cell of the rows x cols grid once' },
    space: { answer: 'O(rows * cols)', choices: ['O(cols)', 'O(rows * cols)', 'O(1)', 'O(rows + cols)'], why: 'full 2-D dp table, rollable to one row O(cols)' },
    sayIt: "I fill backward, ==dp[i][j] = grid[i][j] + min(down, right)==, padded with infinity so out-of-bounds moves never win, O(rows*cols) time/space.",
    pitfall: 'Padding cells must default to infinity, not zero.',
  },
  {
    id: 'thought:dp:longest-common-subsequence',
    lc: 1143,
    title: 'Longest Common Subsequence',
    difficulty: 'Medium',
    category: 'dp',
    skills: ['dp-2d'],
    companies: ['google', 'amazon'],
    statement: `Given two strings, find the length of their longest common subsequence.

A subsequence of a string keeps the relative order of its characters but can skip any number of them, and a common subsequence is one that appears as a subsequence of both strings.

You only need the length of the longest shared subsequence, not the subsequence itself.`,
    examples: [
      { input: 'text1 = "abcde", text2 = "ace"', output: '3', explanation: '"ace" is a subsequence of both strings' },
    ],
    constraints: ['1 <= text1.length, text2.length <= 1000', 'both strings are lowercase English letters'],
    ds: {
      answer: '2-D dp table padded with a zero row/col',
      choices: ['2-D dp table padded with a zero row/col', '1-D dp array rolled across rows', 'dd(list) adjacency + topological sort', 'two pointers over both strings'],
    },
    method: {
      answer: 'Bottom-up DP filled backward from both ends: ==match -> dp[i][j] = 1 + dp[i+1][j+1]; mismatch -> dp[i][j] = max(dp[i+1][j], dp[i][j+1])==, padded with a zero row/col',
      choices: [
        'Two pointers walking both strings forward, advancing whichever pointer points at the smaller character',
        'Greedy: always match the next occurrence of the current character in both strings',
        'Top-down DFS trying every subsequence of text1 checked against text2, no memoization',
        'Bottom-up DP filled backward from both ends: ==match -> dp[i][j] = 1 + dp[i+1][j+1]; mismatch -> dp[i][j] = max(dp[i+1][j], dp[i][j+1])==, padded with a zero row/col',
      ],
    },
    code: `class Solution:
    def longestCommonSubsequence(self, text1: str, text2: str) -> int:
        rows, cols = len(text1), len(text2)
        dp = [[0] * (cols + 1) for _ in range(rows + 1)]

        for i in range(rows - 1, -1, -1):
            for j in range(cols - 1, -1, -1):
                if text1[i] == text2[j]:
                    dp[i][j] = 1 + dp[i + 1][j + 1]
                else:
                    dp[i][j] = max(dp[i + 1][j], dp[i][j + 1])

        return dp[0][0]`,
    blanks: [3, 8, 10],
    accept: { 10: ['dp[i][j] = max(dp[i][j + 1], dp[i + 1][j])'] },
    time: { answer: 'O(rows * cols)', choices: ['O(rows * cols)', 'O(rows + cols)', 'O(2^(rows+cols))', 'O(rows * cols * log(rows*cols))'], why: 'fill every (i, j) cell of the table once' },
    space: { answer: 'O(rows * cols)', choices: ['O(min(rows, cols))', 'O(rows * cols)', 'O(1)', 'O(rows + cols)'], why: 'full 2-D table, rollable to one row O(min(rows,cols))' },
    sayIt: "Match -> ==1 + diagonal==, mismatch -> ==max(right, down)==, filled backward with a zero-padded border, O(n*m) time/space.",
    pitfall: 'Padding the extra row/col with zero and remembering the +1 offset.',
  },
  {
    id: 'thought:dp:edit-distance',
    lc: 72,
    title: 'Edit Distance',
    difficulty: 'Hard',
    category: 'dp',
    skills: ['dp-2d'],
    companies: ['google', 'amazon', 'microsoft'],
    statement: `Given two strings, find the minimum number of operations needed to turn the first string into the second.

Each operation is either inserting one character, deleting one character, or replacing one character with another.

Return the fewest operations needed, not the sequence of edits itself.`,
    examples: [
      { input: 'word1 = "horse", word2 = "ros"', output: '3', explanation: "horse -> rorse (replace 'h' with 'r') -> rose (delete 'r') -> ros (delete 'e')" },
    ],
    constraints: ['0 <= word1.length, word2.length <= 500', 'both strings are lowercase English letters'],
    ds: {
      answer: '2-D dp table, base case = remaining length along each border',
      choices: ['2-D dp table, base case = remaining length along each border', '1-D dp array rolled across rows', 'dd(int) memo keyed by (i, j), top-down', 'two pointers over both strings'],
    },
    method: {
      answer: 'Bottom-up DP from the end of both strings: ==match -> carry dp[i+1][j+1] forward free; mismatch -> dp[i][j] = 1 + min(dp[i+1][j], dp[i][j+1], dp[i+1][j+1])==, base case is the remaining length when one string runs out',
      choices: [
        'Top-down DFS trying every combination of insert/delete/replace, no memoization',
        'Greedy: always replace a mismatched character first, never insert or delete',
        'Bottom-up DP from the end of both strings: ==match -> carry dp[i+1][j+1] forward free; mismatch -> dp[i][j] = 1 + min(dp[i+1][j], dp[i][j+1], dp[i+1][j+1])==, base case is the remaining length when one string runs out',
        'Only consider insert and delete operations, since replace is just a delete followed by an insert',
      ],
    },
    code: `class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        rows, cols = len(word1), len(word2)
        dp = [[0] * (cols + 1) for _ in range(rows + 1)]

        for j in range(cols + 1):
            dp[rows][j] = cols - j
        for i in range(rows + 1):
            dp[i][cols] = rows - i

        for i in range(rows - 1, -1, -1):
            for j in range(cols - 1, -1, -1):
                if word1[i] == word2[j]:
                    dp[i][j] = dp[i + 1][j + 1]
                else:
                    dp[i][j] = 1 + min(dp[i + 1][j], dp[i][j + 1], dp[i + 1][j + 1])

        return dp[0][0]`,
    blanks: [6, 13, 15],
    accept: { 15: ['dp[i][j] = 1 + min(dp[i][j + 1], dp[i + 1][j], dp[i + 1][j + 1])'] },
    time: { answer: 'O(rows * cols)', choices: ['O(rows * cols)', 'O(rows + cols)', 'O(2^(rows+cols))', 'O(rows * cols * log(rows*cols))'], why: 'fill every (i, j) cell of the table once' },
    space: { answer: 'O(rows * cols)', choices: ['O(rows + cols)', 'O(rows * cols)', 'O(1)', 'O(min(rows, cols))'], why: 'full 2-D table of edit distances, rollable to one row' },
    sayIt: "Mismatch costs ==1 + min(delete, insert, replace)==, match carries the diagonal free, O(n*m) time/space.",
    pitfall: 'The three-way min must include dp[i+1][j+1] for replace, not just the two neighbors.',
  },
  {
    id: 'thought:dp:distinct-subsequences',
    lc: 115,
    title: 'Distinct Subsequences',
    difficulty: 'Hard',
    category: 'dp',
    skills: ['dp-2d'],
    companies: ['google'],
    statement: `Given two strings s and t, count how many distinct ways t appears as a subsequence of s.

Each way is a different choice of index positions in s, read left to right, whose characters spell out t exactly; the same characters chosen at different positions count as different ways.

Return that count, which can get large, so think in terms of accumulating counts rather than enumerating them.`,
    examples: [
      { input: 's = "rabbbit", t = "rabbit"', output: '3', explanation: "3 different choices of which 'b' to skip among the three b's" },
    ],
    constraints: ['1 <= s.length, t.length <= 1000'],
    ds: {
      answer: '2-D dp table (skip-s[i] count, plus match count when chars equal)',
      choices: ['1-D dp array rolled across rows', '2-D dp table (skip-s[i] count, plus match count when chars equal)', 'two pointers over both strings', 'dd(list) positions of each char + binary search'],
    },
    method: {
      answer: 'Bottom-up DP from the end: ==dp[i][j] = dp[i+1][j] (skip s[i]), plus dp[i+1][j+1] when s[i] == t[j] (use s[i] to match t[j])==; base case dp[i][cols] = 1, an empty t is matched exactly one way',
      choices: [
        'Top-down DFS enumerating every subset of index positions in s and checking which spell t',
        'Greedy: always match the next occurrence of each character of t as early as possible in s',
        'Two pointers advancing through s and t together, counting a match only once per pointer pass',
        'Bottom-up DP from the end: ==dp[i][j] = dp[i+1][j] (skip s[i]), plus dp[i+1][j+1] when s[i] == t[j] (use s[i] to match t[j])==; base case dp[i][cols] = 1, an empty t is matched exactly one way',
      ],
    },
    code: `class Solution:
    def numDistinct(self, s: str, t: str) -> int:
        rows, cols = len(s), len(t)
        dp = [[0] * (cols + 1) for _ in range(rows + 1)]

        for i in range(rows + 1):
            dp[i][cols] = 1

        for i in range(rows - 1, -1, -1):
            for j in range(cols - 1, -1, -1):
                dp[i][j] = dp[i + 1][j]
                if s[i] == t[j]:
                    dp[i][j] += dp[i + 1][j + 1]

        return dp[0][0]`,
    blanks: [6, 10, 12],
    time: { answer: 'O(rows * cols)', choices: ['O(rows * cols)', 'O(rows + cols)', 'O(2^rows)', 'O(rows * cols * log(rows))'], why: 'fill every (i, j) cell of the table once' },
    space: { answer: 'O(rows * cols)', choices: ['O(cols)', 'O(rows * cols)', 'O(1)', 'O(rows + cols)'], why: 'full 2-D table, one entry per (s index, t index)' },
    sayIt: "I always carry ==dp[i+1][j]==, and add ==dp[i+1][j+1]== only on a character match, base case empty t = 1, O(n*m) time/space.",
    pitfall: 'Must always inherit the skip count dp[i+1][j], not replace it, on a match.',
  },
  {
    id: 'thought:dp:longest-palindromic-substring',
    lc: 5,
    title: 'Longest Palindromic Substring',
    difficulty: 'Medium',
    category: 'dp',
    skills: ['dp-2d'],
    companies: ['amazon', 'microsoft', 'meta', 'apple', 'bloomberg'],
    statement: `Given a string, find the longest substring that reads the same forward and backward.

A substring has to be contiguous, no skipping characters, unlike a subsequence.

If more than one longest palindromic substring of the same length exists, returning any one of them is fine.`,
    examples: [
      { input: 's = "babad"', output: '"aba"', explanation: '"bab" is also a valid length-3 answer; this fill order happens to land on "aba"' },
    ],
    constraints: ['1 <= s.length <= 1000'],
    ds: {
      answer: '2-D dp table of boolean palindrome(i, j), filled by substring length',
      choices: ['two pointers expanding outward from each center', '2-D dp table of boolean palindrome(i, j), filled by substring length', 'monotonic stack of indices', 'dd(list) adjacency + DFS'],
    },
    method: {
      answer: 'Bottom-up DP filled i decreasing / j increasing: ==dp[i][j] = s[i] == s[j] and (j-i <= 2 or dp[i+1][j-1])==, track the longest True window seen',
      choices: [
        'Expand around each center outward while characters keep matching, trying both odd and even centers',
        "Manacher's algorithm maintaining a mirror and a rightmost boundary for O(n) palindrome radius",
        'Two pointers from both ends of the string moving inward, stopping at the first mismatch',
        'Bottom-up DP filled i decreasing / j increasing: ==dp[i][j] = s[i] == s[j] and (j-i <= 2 or dp[i+1][j-1])==, track the longest True window seen',
      ],
    },
    code: `class Solution:
    def longestPalindrome(self, s: str) -> str:
        n = len(s)
        dp = [[False] * n for _ in range(n)]
        bestLen, bestStart = 1, 0

        for i in range(n - 1, -1, -1):
            for j in range(i, n):
                if s[i] == s[j] and (j - i <= 2 or dp[i + 1][j - 1]):
                    dp[i][j] = True
                    if j - i + 1 > bestLen:
                        bestLen, bestStart = j - i + 1, i

        return s[bestStart:bestStart + bestLen]`,
    blanks: [8, 9, 11],
    time: { answer: 'O(n^2)', choices: ['O(n^2)', 'O(n)', 'O(n log n)', 'O(n^3)'], why: 'check every (i, j) substring once, O(1) work each' },
    space: { answer: 'O(n^2)', choices: ['O(n)', 'O(n^2)', 'O(1)', 'O(n log n)'], why: 'full boolean table marking every substring as palindrome or not' },
    sayIt: "==dp[i][j] true if the ends match and the inside is already a palindrome==, track the longest span, O(n^2) time/space.",
    pitfall: 'dp[i+1][j-1] only matters once j - i > 2.',
  },
  {
    id: 'thought:dp:target-sum',
    lc: 494,
    title: 'Target Sum',
    difficulty: 'Medium',
    category: 'dp',
    skills: ['dp-1d'],
    companies: ['amazon', 'meta'],
    statement: `You're given an array of non-negative integers and a target value. You must assign either a plus or minus sign to every number and sum them all up.

Count how many different ways of assigning signs make the total equal exactly the target.

Every number gets exactly one sign, and two assignments that differ in even one sign count as different ways.`,
    examples: [
      { input: 'nums = [1,1,1,1,1], target = 3', output: '5', explanation: 'exactly two of the five 1s get a minus sign, in any of 5 positions' },
    ],
    constraints: ['1 <= nums.length <= 20', '0 <= nums[i] <= 1000', '0 <= sum(nums) <= 1000', '-1000 <= target <= 1000'],
    ds: {
      answer: '@cache memo keyed by (index, remaining target)',
      choices: ['2-D dp table of (index, offset) filled bottom-up', '@cache memo keyed by (index, remaining target)', 'dd(list) adjacency + BFS over partial sums', 'backtracking over all 2^n sign assignments, no memo'],
    },
    method: {
      answer: 'Top-down DFS with ==@cache on (index, remaining target)==: at each number, branch into subtracting it or adding it, base case is reaching the end with remain == 0',
      choices: [
        'Backtracking over every sign assignment with no memoization, pruning only at the very end',
        'Bottom-up DP table over (index, achievable sum offset by the total), filled iteratively',
        'Greedy: assign minus to the largest numbers first until the running sum no longer overshoots',
        'Top-down DFS with ==@cache on (index, remaining target)==: at each number, branch into subtracting it or adding it, base case is reaching the end with remain == 0',
      ],
    },
    code: `class Solution:
    def findTargetSumWays(self, nums: List[int], target: int) -> int:
        n = len(nums)

        @cache
        def dfs(i, remain):
            if i == n:
                return 1 if remain == 0 else 0

            return dfs(i + 1, remain - nums[i]) + dfs(i + 1, remain + nums[i])

        return dfs(0, target)`,
    blanks: [4, 7, 9],
    time: { answer: 'O(n * sum(nums))', choices: ['O(n * sum(nums))', 'O(2^n)', 'O(n)', 'O(n^2)'], why: 'memo has one entry per (index, remaining) pair' },
    space: { answer: 'O(n * sum(nums))', choices: ['O(n)', 'O(n * sum(nums))', 'O(2^n)', 'O(1)'], why: 'cache stores one entry per distinct (index, remaining) state' },
    sayIt: "I DFS with ==@cache on (index, remaining target)==, branching +/- nums[i], turning the 2^n brute force into O(n*sum) states.",
    pitfall: 'Without @cache this blows up to 2^n calls.',
  },
  {
    id: 'thought:dp:burst-balloons',
    lc: 312,
    title: 'Burst Balloons',
    difficulty: 'Hard',
    category: 'dp',
    skills: ['dp-2d', 'intervals'],
    companies: ['google', 'amazon'],
    statement: `You have a row of balloons, each painted with a number. Bursting a balloon gives coins equal to the product of the numbers on its current left and right neighbors, treating the ends of the row as invisible balloons worth 1.

You must burst every balloon exactly once, choosing the order, and bursting one balloon makes its former neighbors adjacent to each other for all future bursts.

Find the maximum total coins you can collect by choosing the best order to burst them all.`,
    examples: [
      { input: 'nums = [3,1,5,8]', output: '167', explanation: 'bursting in order 1,5,3,8 scores 3*1*5 + 3*5*8 + 1*3*8 + 1*8*1 = 167' },
    ],
    constraints: ['1 <= nums.length <= 300', '0 <= nums[i] <= 100'],
    ds: {
      answer: '@cache memo keyed by interval (l, r), balloons padded with sentinel 1s',
      choices: ['2-D dp table filled by increasing interval length', '@cache memo keyed by interval (l, r), balloons padded with sentinel 1s', 'monotonic stack of indices', 'backtracking over every burst order, no memo'],
    },
    method: {
      answer: "Interval DP: for each open interval (l, r), pick which balloon k is the LAST one burst inside it: ==score = balloons[l] * balloons[k] * balloons[r], plus dfs(l, k) + dfs(k, r)==; pad both ends with a sentinel 1",
      choices: [
        'Greedy: always burst the smallest balloon first so its neighbors stay large as long as possible',
        'DFS simulating every possible burst order directly on the array and removing elements, no reformulation',
        "Interval DP: for each open interval (l, r), pick which balloon k is the LAST one burst inside it: ==score = balloons[l] * balloons[k] * balloons[r], plus dfs(l, k) + dfs(k, r)==; pad both ends with a sentinel 1",
        'DP where k is the FIRST balloon burst in the interval, scored against whatever is adjacent before any bursts happen',
      ],
    },
    code: `class Solution:
    def maxCoins(self, nums: List[int]) -> int:
        balloons = [1] + nums + [1]
        n = len(balloons)

        @cache
        def dfs(l, r):
            if l + 1 == r:
                return 0

            best = 0
            for k in range(l + 1, r):
                score = balloons[l] * balloons[k] * balloons[r]
                best = max(best, score + dfs(l, k) + dfs(k, r))

            return best

        return dfs(0, n - 1)`,
    blanks: [2, 12, 13],
    time: { answer: 'O(n^3)', choices: ['O(n^3)', 'O(n^2)', 'O(2^n)', 'O(n log n)'], why: 'O(n^2) intervals, each trying up to n choices of k' },
    space: { answer: 'O(n^2)', choices: ['O(n)', 'O(n^2)', 'O(n^3)', 'O(1)'], why: 'memo has one entry per (left, right) interval pair' },
    sayIt: "I pick the ==last balloon burst== in each interval, score = left*k*right, plus both sub-intervals recursively, padded with sentinels, O(n^3) time.",
    pitfall: "Think in terms of the last balloon burst in the interval, not the first.",
  },
  {
    id: 'thought:dp:maximum-product-subarray',
    lc: 152,
    title: 'Maximum Product Subarray',
    difficulty: 'Medium',
    category: 'dp',
    skills: ['dp-1d'],
    companies: ['amazon', 'meta'],
    statement: `Given an array of integers that can include negative numbers and zero, find the contiguous subarray with the largest product.

Because a negative number flips the sign, the subarray with the best product so far can turn into the worst one after multiplying by another negative, so tracking only a running maximum isn't enough.

Return that maximum product, not the subarray itself.`,
    examples: [
      { input: 'nums = [2,3,-2,4]', output: '6', explanation: '[2,3] has product 6; pulling in -2 or [-2,4] only drops it' },
      { input: 'nums = [-2,0,-1]', output: '0', explanation: 'the zero caps any subarray crossing it at 0' },
    ],
    constraints: ['1 <= nums.length <= 2 * 10^4', '-10 <= nums[i] <= 10'],
    ds: {
      answer: 'two rolling vars: running max AND running min product',
      choices: ['single running max only (like max subarray sum)', 'two rolling vars: running max AND running min product', '1-D dp array of max product ending at i', 'monotonic stack of indices'],
    },
    method: {
      answer: 'Track both a running max AND running min product ending here: ==curMax, curMin = max(num, curMax*num, curMin*num), min(num, curMax*num, curMin*num)==, since a negative can flip the worst running product into the best',
      choices: [
        'Track only a running max product ending at each index, same recurrence as max subarray sum',
        'Split the array at every zero and every negative number, then greedily pick the best segment',
        'DFS/backtracking over every contiguous subarray product, no memoization',
        'Track both a running max AND running min product ending here: ==curMax, curMin = max(num, curMax*num, curMin*num), min(num, curMax*num, curMin*num)==, since a negative can flip the worst running product into the best',
      ],
    },
    code: `class Solution:
    def maxProduct(self, nums: List[int]) -> int:
        curMax = curMin = nums[0]
        best = nums[0]

        for num in nums[1:]:
            candidates = (num, curMax * num, curMin * num)
            curMax, curMin = max(candidates), min(candidates)

            best = max(best, curMax)

        return best`,
    blanks: [2, 7, 9],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n^2)', 'O(n log n)', 'O(1)'], why: 'single pass, constant work updating max and min per step' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(n^2)', 'O(log n)'], why: 'only a few rolling variables, no array allocated' },
    sayIt: "I track ==running max AND running min== together since a negative number can flip which one is best next, O(n) time, O(1) space.",
    pitfall: 'Forgetting to also track the running minimum product.',
  },
  {
    id: 'thought:dp:number-of-longest-increasing-subsequence',
    lc: 673,
    title: 'Number of Longest Increasing Subsequence',
    difficulty: 'Medium',
    category: 'dp',
    skills: ['dp-1d'],
    companies: ['google'],
    statement: `Given an integer array, return the number of distinct longest strictly increasing subsequences.

A subsequence keeps the relative order of the original array but can skip elements. You need both the length of the longest increasing subsequence AND how many different subsequences achieve that length.`,
    examples: [
      { input: 'nums = [1,3,5,4,7]', output: '2', explanation: 'the two length-4 LIS are [1,3,4,7] and [1,3,5,7]' },
    ],
    constraints: ['1 <= nums.length <= 2000', '-10^6 <= nums[i] <= 10^6'],
    ds: {
      answer: 'two parallel 1-D dp arrays: longest length ending at i, and count of ways to reach that length',
      choices: ['two parallel 1-D dp arrays: longest length ending at i, and count of ways to reach that length', '1-D dp array of length only (like plain LIS)', '2-D dp table of (i, j) pairs', 'tails array + bisect (patience sorting) plus a separate count array'],
    },
    method: {
      answer: "O(n^2) DP tracking both arrays: for each ==j < i with nums[j] < nums[i]==, if it ==strictly extends the longest chain ending at i==, reset count[i] to count[j]; if it ties the current best length, add count[j] onto count[i]",
      choices: [
        "O(n^2) DP tracking both arrays: for each ==j < i with nums[j] < nums[i]==, if it ==strictly extends the longest chain ending at i==, reset count[i] to count[j]; if it ties the current best length, add count[j] onto count[i]",
        'Track only length[i] via plain LIS DP, then count afterward by re-running DFS from every index that achieves the max length',
        "Greedy: always extend whichever earlier index has the single largest count[j], ignoring ties",
        'Patience sorting with a tails array, incrementing a global counter whenever a number extends the longest pile',
      ],
    },
    code: `class Solution:
    def findNumberOfLIS(self, nums: List[int]) -> int:
        n = len(nums)
        length = [1] * n
        count = [1] * n

        for i in range(n):
            for j in range(i):
                if nums[j] < nums[i]:
                    if length[j] + 1 > length[i]:
                        length[i] = length[j] + 1
                        count[i] = count[j]
                    elif length[j] + 1 == length[i]:
                        count[i] += count[j]

        longest = max(length)
        return sum(c for l, c in zip(length, count) if l == longest)`,
    blanks: [10, 13, 16],
    time: { answer: 'O(n^2)', choices: ['O(n^2)', 'O(n log n)', 'O(n)', 'O(n^2 log n)'], why: 'nested loop over every pair (i, j)' },
    space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(n^2)', 'O(log n)'], why: 'two parallel dp arrays of length n' },
    sayIt: 'I keep length[i] AND count[i] together: a strictly longer chain resets the count, a tie adds onto it, then sum counts at the max length; O(n^2) time.',
    pitfall: 'A longer chain must RESET count[i], not add to it — mixing up reset vs accumulate double-counts.',
  },
  {
    id: 'thought:dp:combination-sum-iv',
    lc: 377,
    title: 'Combination Sum IV',
    difficulty: 'Medium',
    category: 'dp',
    skills: ['dp-1d'],
    companies: ['amazon', 'meta'],
    statement: `Given an array of distinct positive integers and a target, count the number of possible ORDERED sequences that add up to target. The same number can be reused any number of times, and different orderings count as different sequences.

Despite the name "Combination Sum", this is secretly counting permutations, not combinations.`,
    examples: [
      { input: 'nums = [1,2,3], target = 4', output: '7', explanation: '(1,1,1,1),(1,1,2),(1,2,1),(2,1,1),(1,3),(3,1),(2,2) are all counted separately' },
    ],
    constraints: ['1 <= nums.length <= 200', '1 <= nums[i] <= 1000', 'all nums distinct', '1 <= target <= 1000'],
    ds: {
      answer: '1-D dp array of ways to reach each total (amount-outer, number-inner loop)',
      choices: ['1-D dp array of ways to reach each total (amount-outer, number-inner loop)', '1-D dp array of ways to reach each total (number-outer, amount-inner loop)', '2-D dp table of (number index, amount)', 'dd(int) memo keyed by (index, remaining), top-down with order fixed by index'],
    },
    method: {
      answer: "Bottom-up counting DP where ==amounts are the outer loop and numbers are the inner loop==, so at each total every number is tried in every order, making this count ORDERED sequences, unlike Coin Change II which loops coins outside to count unordered combinations",
      choices: [
        "Bottom-up counting DP where ==amounts are the outer loop and numbers are the inner loop==, so at each total every number is tried in every order, making this count ORDERED sequences, unlike Coin Change II which loops coins outside to count unordered combinations",
        'Loop numbers on the outside and amounts on the inside — identical recurrence to Coin Change II, since both just count ways to hit a target',
        'Backtracking that enumerates every ordered sequence of numbers summing to target directly, no dp array',
        'Greedy: always pick the smallest number that still fits under the remaining target',
      ],
    },
    code: `class Solution:
    def combinationSum4(self, nums: List[int], target: int) -> int:
        dp = [1] + [0] * target

        for total in range(1, target + 1):
            for num in nums:
                if total - num >= 0:
                    dp[total] += dp[total - num]

        return dp[target]`,
    blanks: [2, 6, 9],
    time: { answer: 'O(target * len(nums))', choices: ['O(target * len(nums))', 'O(target)', 'O(2^target)', 'O(target log target)'], why: 'nested loop over every total and every number' },
    space: { answer: 'O(target)', choices: ['O(target)', 'O(1)', 'O(target * len(nums))', 'O(len(nums))'], why: 'one dp array of size target + 1' },
    sayIt: 'Looping totals outside, numbers inside counts ordered sequences, dp[total] += dp[total-num] for every number; swapping the loop order would make it Coin Change II instead, O(target*nums) time.',
    pitfall: 'This is secretly counting permutations, not combinations — the name is misleading; loop order is the whole trick.',
  },
  {
    id: 'thought:dp:interleaving-string',
    lc: 97,
    title: 'Interleaving String',
    difficulty: 'Medium',
    category: 'dp',
    skills: ['dp-2d'],
    companies: ['google'],
    statement: `Given three strings s1, s2, and s3, decide whether s3 can be formed by interleaving the characters of s1 and s2 while keeping each string's own characters in their original relative order.

An interleaving means every character of s3 comes from s1 or s2, consumed left to right, and both s1 and s2 must be fully used up exactly once.`,
    examples: [
      { input: 's1 = "aabcc", s2 = "dbbca", s3 = "aadbbcbcac"', output: 'true', explanation: 's3 can be built by weaving characters from s1 and s2 without reordering either' },
      { input: 's1 = "ab", s2 = "cd", s3 = "adbc"', output: 'false', explanation: "d comes before c, which breaks s2's required order" },
    ],
    constraints: ['0 <= s1.length, s2.length <= 100', 's1.length + s2.length == s3.length'],
    ds: {
      answer: '2-D dp table of boolean, base case = the (rows, cols) corner (both strings exhausted)',
      choices: ['2-D dp table of boolean, base case = the (rows, cols) corner (both strings exhausted)', '1-D dp array rolled across rows', 'two pointers greedily choosing whichever string matches next', 'dd(int) memo keyed by (i, j), top-down'],
    },
    method: {
      answer: "Bottom-up DP filled backward from both ends: ==dp[i][j] is true if s1[i] can extend a valid interleaving from dp[i+1][j]==, OR if ==s2[j] can extend one from dp[i][j+1]==, matched against s3 at position i+j",
      choices: [
        "Bottom-up DP filled backward from both ends: ==dp[i][j] is true if s1[i] can extend a valid interleaving from dp[i+1][j]==, OR if ==s2[j] can extend one from dp[i][j+1]==, matched against s3 at position i+j",
        'Greedy: at each position of s3, always consume from whichever of s1/s2 currently matches, backtrack only on a dead end',
        'Two separate dp arrays for s1 and s2, checked independently then ANDed together at the end',
        'Top-down DFS trying every interleaving order, no memoization (exponential)',
      ],
    },
    code: `class Solution:
    def isInterleave(self, s1: str, s2: str, s3: str) -> bool:
        rows, cols = len(s1), len(s2)
        if rows + cols != len(s3):
            return False

        dp = [[False] * (cols + 1) for _ in range(rows + 1)]
        dp[rows][cols] = True

        for i in range(rows, -1, -1):
            for j in range(cols, -1, -1):
                if i < rows and s1[i] == s3[i + j] and dp[i + 1][j]:
                    dp[i][j] = True
                if j < cols and s2[j] == s3[i + j] and dp[i][j + 1]:
                    dp[i][j] = True

        return dp[0][0]`,
    blanks: [4, 11, 13],
    time: { answer: 'O(rows * cols)', choices: ['O(rows * cols)', 'O(rows + cols)', 'O(2^(rows+cols))', 'O(rows * cols * len(s3))'], why: 'fill every (i, j) cell once, O(1) work each' },
    space: { answer: 'O(rows * cols)', choices: ['O(rows * cols)', 'O(min(rows, cols))', 'O(1)', 'O(rows + cols)'], why: 'full 2-D boolean table, rollable to one row' },
    sayIt: "dp[i][j] true if s1[i] or s2[j] can match s3[i+j] and lead into an already-true state; early-exit when lengths don't add up, O(rows*cols) time/space.",
    pitfall: "Must check rows + cols == len(s3) up front — skipping it can index s3 out of range.",
  },
  {
    id: 'thought:dp:longest-palindromic-subsequence',
    lc: 516,
    title: 'Longest Palindromic Subsequence',
    difficulty: 'Medium',
    category: 'dp',
    skills: ['dp-2d'],
    companies: ['amazon', 'google'],
    statement: `Given a string, find the length of the longest subsequence of it that reads the same forward and backward.

A subsequence keeps the relative order of the original string but can skip over any number of characters; it doesn't have to be contiguous like a substring does.

You only need the length of the longest such subsequence, not the subsequence itself.`,
    examples: [
      { input: 's = "bbbab"', output: '4', explanation: '"bbbb" (dropping the "a") is the longest palindromic subsequence' },
      { input: 's = "cbbd"', output: '2', explanation: '"bb" is the longest palindromic subsequence' },
    ],
    constraints: ['1 <= s.length <= 1000'],
    ds: {
      answer: '2-D dp table of (i, j) intervals, filled with i decreasing and j increasing',
      choices: ['2-D dp table of (i, j) intervals, filled with i decreasing and j increasing', 'two pointers expanding outward from the center of the string', '1-D dp array equal to the LCS of s and reversed(s)', 'monotonic stack tracking matched palindrome boundaries'],
    },
    method: {
      answer: "Interval DP from the inside out: ==s[i]==s[j] -> dp[i][j] = 2 + dp[i+1][j-1]; otherwise dp[i][j] = max(dp[i+1][j], dp[i][j-1])==, base case dp[i][i] = 1 for every single character",
      choices: [
        'Reduce to LCS: compute the longest common subsequence between s and its reverse',
        'Two pointers expand from the center of the string outward, trying every odd and even center',
        "Interval DP from the inside out: ==s[i]==s[j] -> dp[i][j] = 2 + dp[i+1][j-1]; otherwise dp[i][j] = max(dp[i+1][j], dp[i][j-1])==, base case dp[i][i] = 1 for every single character",
        'Top-down DFS trying to include or exclude each end character, with no memoization',
      ],
    },
    code: `class Solution:
    def longestPalindromeSubseq(self, s: str) -> int:
        n = len(s)
        dp = [[0] * n for _ in range(n)]

        for i in range(n - 1, -1, -1):
            dp[i][i] = 1
            for j in range(i + 1, n):
                if s[i] == s[j]:
                    dp[i][j] = 2 + dp[i + 1][j - 1]
                else:
                    dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])

        return dp[0][n - 1]`,
    blanks: [6, 9, 11],
    accept: { 11: ['dp[i][j] = max(dp[i][j - 1], dp[i + 1][j])'] },
    time: { answer: 'O(n^2)', choices: ['O(n^2)', 'O(n)', 'O(n log n)', 'O(n^3)'], why: 'fills every (i, j) interval once, O(1) work per cell' },
    space: { answer: 'O(n^2)', choices: ['O(n^2)', 'O(n)', 'O(1)', 'O(n log n)'], why: 'full n x n table of subsequence lengths' },
    sayIt: "Interval DP from the inside out: ==match extends both ends +2, mismatch drops whichever end gives the better inner answer==, base case single chars = 1, O(n^2) time/space.",
    pitfall: 'dp[i][j] depends on dp[i][j-1] in the same row, so j must run increasing while i runs decreasing — filling in the wrong order reads uninitialized cells.',
  },
  {
    id: 'thought:dp:best-time-to-buy-and-sell-stock-with-cooldown',
    lc: 309,
    title: 'Best Time to Buy and Sell Stock with Cooldown',
    difficulty: 'Medium',
    category: 'dp',
    skills: ['dp-1d'],
    companies: ['amazon', 'bloomberg', 'google'],
    statement: `You're given daily stock prices. You may buy and sell as many times as you like, but you can only hold at most one share at a time, and after selling you must skip a day (cooldown) before buying again.

Find the maximum total profit achievable under these rules.

You can't buy and sell on the same day, and the cooldown only applies to buying again right after a sell, not to selling itself.`,
    examples: [
      { input: 'prices = [1,2,3,0,2]', output: '3', explanation: 'buy day0 (1), sell day1 (2) for profit 1, cooldown day2, buy day3 (0), sell day4 (2) for profit 2, total 3' },
    ],
    constraints: ['1 <= prices.length <= 5000', '0 <= prices[i] <= 1000'],
    ds: {
      answer: 'three rolling state variables: hold, sold (just sold today), and rest (free to buy)',
      choices: ['three rolling state variables: hold, sold (just sold today), and rest (free to buy)', '1-D dp array of max profit per day, single state only', '2-D dp table of (day, holding-or-not)', 'monotonic stack tracking increasing price runs'],
    },
    method: {
      answer: "State machine DP with rolling ==hold, sold, rest== variables: hold = max(hold, rest-price) (keep holding, or buy today from rest); sold = hold + price (sell what was held, using yesterday's hold); rest = max(rest, prevSold) (stay rested, or cooldown clears into rest the day after a sell)",
      choices: [
        'Greedy: buy at every local minimum and sell at every local maximum, skipping only the day right after a sell',
        '2-D dp table of (day index, holding boolean, cooldown boolean), filled iteratively',
        "State machine DP with rolling ==hold, sold, rest== variables: hold = max(hold, rest-price) (keep holding, or buy today from rest); sold = hold + price (sell what was held, using yesterday's hold); rest = max(rest, prevSold) (stay rested, or cooldown clears into rest the day after a sell)",
        'DFS trying every subset of buy/sell/cooldown days, no memoization',
      ],
    },
    code: `class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        hold, sold, rest = -math.inf, 0, 0

        for price in prices:
            prevSold = sold
            sold = hold + price
            hold = max(hold, rest - price)
            rest = max(rest, prevSold)

        return max(sold, rest)`,
    blanks: [6, 7, 8],
    accept: { 7: ['hold = max(rest - price, hold)'], 8: ['rest = max(prevSold, rest)'] },
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(2^n)'], why: 'single pass updating three rolling vars per price' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(n^2)', 'O(log n)'], why: 'only three scalars tracked, no array allocated' },
    sayIt: "Three rolling states, ==hold = max(hold, rest-price), sold = hold+price, rest = max(rest, prevSold)==, cooldown just means rest waits one extra day after a sell, O(n) time, O(1) space.",
    pitfall: "sold must be computed from the OLD hold value before hold gets updated this same iteration, or you'd allow buying and selling on the same day.",
  },
  {
    id: 'thought:dp:maximal-square',
    lc: 221,
    title: 'Maximal Square',
    difficulty: 'Medium',
    category: 'dp',
    skills: ['dp-2d'],
    companies: ['google', 'amazon'],
    statement: `You're given a 2-D binary matrix of 0s and 1s. Find the largest square made up only of 1s and return its area.

The square must be axis-aligned and fully contained within the matrix; every cell inside it has to be a 1.

Return the area (side length squared), not the side length itself.`,
    examples: [
      { input: 'matrix = [["1","0","1","0","0"],["1","0","1","1","1"],["1","1","1","1","1"],["1","0","0","1","0"]]', output: '4', explanation: 'a 2x2 square of 1s gives area 4' },
    ],
    constraints: ['1 <= rows, cols <= 300', 'matrix[i][j] is "0" or "1"'],
    ds: {
      answer: '2-D dp table padded with an extra zero row/col (top and left border)',
      choices: ['2-D dp table padded with an extra zero row/col (top and left border)', '1-D dp array rolled row by row, tracking the previous row only', 'monotonic stack of column heights (like Largest Rectangle in Histogram)', 'prefix-sum 2-D table of 1-counts per rectangle'],
    },
    method: {
      answer: 'Bottom-up DP filled forward: ==dp[i+1][j+1] = 1 + min(dp[i][j], dp[i][j+1], dp[i+1][j]) when the cell is a 1==, a square can only grow as large as the smallest of its top, left, and top-left neighbor squares',
      choices: [
        'Rolling 1-D dp array updated left to right, same min-of-three recurrence but using only the previous row in place',
        'Expand every 1-cell into the largest square it anchors by brute-force checking increasing side lengths',
        'Greedy: scan row by row and extend the current square only while the next cell below-right is also 1',
        'Bottom-up DP filled forward: ==dp[i+1][j+1] = 1 + min(dp[i][j], dp[i][j+1], dp[i+1][j]) when the cell is a 1==, a square can only grow as large as the smallest of its top, left, and top-left neighbor squares',
      ],
    },
    code: `class Solution:
    def maximalSquare(self, matrix: List[List[str]]) -> int:
        rows, cols = len(matrix), len(matrix[0])
        dp = [[0] * (cols + 1) for _ in range(rows + 1)]
        best = 0

        for i in range(rows):
            for j in range(cols):
                if matrix[i][j] == "1":
                    dp[i + 1][j + 1] = 1 + min(dp[i][j], dp[i][j + 1], dp[i + 1][j])
                    best = max(best, dp[i + 1][j + 1])

        return best * best`,
    blanks: [9, 10, 12],
    accept: { 9: ['dp[i + 1][j + 1] = 1 + min(dp[i + 1][j], dp[i][j + 1], dp[i][j])'] },
    time: { answer: 'O(rows * cols)', choices: ['O(rows * cols)', 'O(rows * cols * min(rows, cols))', 'O(rows + cols)', 'O(rows * cols * log(rows*cols))'], why: 'fill every padded cell once, O(1) work per cell' },
    space: { answer: 'O(rows * cols)', choices: ['O(rows * cols)', 'O(min(rows, cols))', 'O(1)', 'O(rows + cols)'], why: 'full padded 2-D table, one entry per cell, rollable to one row' },
    sayIt: "A square at (i,j) can only be as big as the smallest of its ==top, left, and top-left neighbor squares, plus one==, padded border handles edges, track the running best side, answer is best squared, O(rows*cols) time/space.",
    pitfall: 'Return best squared (the area), not best itself (the side length).',
  },
]

export default {
  id: 'dp',
  title: 'Dynamic programming',
  icon: 'calculator',
  items,
}
