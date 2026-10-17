const oneDLinearLeaf = {
  result: '==1-D linear DP== (climbing stairs, house robber, decode ways)',
  ds: 'single dp array (or two rolling variables)',
  time: 'O(n) states × O(1) work = O(n)',
  why: 'dp[i] only ever reads the last 1-2 entries — no inner loop needed',
  ref: '1-D Bottom-Up (House Robber)',
}

const oneDInnerLoopLeaf = {
  result: '==1-D DP with an inner loop== (coin change, word break, LIS)',
  ds: 'dp array + a loop over coins / dictionary words / earlier indices per state',
  time: 'O(n) or O(amount) states × O(k) work = O(n·k)',
  why: 'the answer at i needs trying every choice before committing to dp[i]',
  ref: 'Coin Change / Unbounded Knapsack',
}

const twoSequenceLeaf = {
  result: '==2-D DP over two sequences== (LCS, edit distance, distinct subsequences)',
  ds: '(len(a)+1) x (len(b)+1) table',
  time: 'O(n·m) states × O(1) work = O(n·m)',
  why: 'each cell compares one char from each string — match vs mismatch IS the transition',
  ref: 'LCS 2-D Table',
}

const gridLeaf = {
  result: '==2-D grid DP== (unique paths, min path sum)',
  ds: 'dp table same shape as the grid (or one rolling row)',
  time: 'O(R·C) states × O(1) work = O(R·C)',
  why: 'each cell only ever needs the cell above and the cell to the left',
  ref: 'Grid DP (Unique Paths / Min Path Sum)',
}

const intervalLeaf = {
  result: '==interval DP== (burst balloons, palindrome partitioning/substrings)',
  ds: 'dp[l][r] over every subrange, filled by increasing length',
  time: 'O(n²) states × O(n) split point = O(n³) for burst balloons; O(n²) total for most palindrome tables',
  why: 'the state is a whole subrange, not one index — the transition picks a split or boundary point inside it',
}

const knapsackReuseNode = {
  q: 'Can each item be used more than once?',
  options: [
    {
      label: 'No — each item used at most once (0/1)',
      leaf: {
        result: '==0/1 knapsack== (partition equal subset, target sum)',
        ds: 'dp[cap] 1-D array, capacity loop DESCENDING per item',
        time: 'O(n·capacity) states × O(1) work',
        why: 'descending capacity order stops an item being reused inside the same pass',
        ref: '0/1 Knapsack / Partition Equal Subset',
      },
    },
    {
      label: 'Yes — unlimited reuse (unbounded)',
      leaf: {
        result: '==unbounded knapsack== (coin change, coin change II)',
        ds: 'dp[amount] 1-D array, amount loop ASCENDING',
        time: 'O(amount·coins) states × O(1) work',
        why: 'ascending order lets dp[a-c] already include this same coin from earlier in the pass',
        ref: 'Coin Change / Unbounded Knapsack',
      },
    },
  ],
}

const dpDecisionTree = {
  q: "What's given, and what does one state need to describe?",
  options: [
    { label: 'One array/string, dp[i] needs only a FEW previous dp values', leaf: oneDLinearLeaf },
    { label: 'One array/string, dp[i] needs a LOOP over earlier choices/positions', leaf: oneDInnerLoopLeaf },
    { label: 'TWO sequences being compared or aligned', leaf: twoSequenceLeaf },
    { label: 'A 2-D grid of cells', leaf: gridLeaf },
    { label: 'A set of items plus a capacity/target number', next: knapsackReuseNode },
    { label: 'One sequence, but the state is a SUBRANGE (l, r) of it', leaf: intervalLeaf },
  ],
}

export default {
  id: 'dp',
  title: 'DP from zero to 2-D',
  icon: 'calculator',
  minutes: 35,

  summary: [
    "==Is it DP?== count ways / min-max cost / can-you-reach / choices at each step / overlapping subproblems.",
    "The 5-step recipe: state (in words) → transition (choices) → base cases → fill order → answer cell.",
    "==top-down== (recursion + `@cache`) and ==bottom-up== (array, explicit order) compute the SAME transition.",
    "1-D linear (climbing stairs, house robber) needs only the last 1-2 dp values — no inner loop.",
    "1-D with an inner loop (coin change, word break, LIS) tries every choice before committing to dp[i].",
    "2-D two sequences (LCS, edit distance): size the table (len(a)+1) x (len(b)+1), fill by suffix.",
    "0/1 knapsack: capacity loop DESCENDING. Unbounded (coin change): capacity loop ASCENDING. That's the whole difference.",
    "Complexity = states × work per state — say both numbers out loud, not just the final Big-O.",
  ],

  sections: [
    {
      kind: 'list',
      title: 'Is it DP?',
      items: [
        "Asked to count the number of ways to do something → DP.",
        "Asked for a min or max cost/value/length built from smaller pieces → DP.",
        "Asked 'can you reach / form / make X at all' with choices along the way → DP.",
        "There are multiple choices at each step, and an earlier choice changes what later choices are optimal → DP, not greedy.",
        "The same smaller subproblem would get solved again and again if you just recursed → ==overlapping subproblems==, the core DP signal.",
        "Constraints: n up to ~10^5-10^6 and only ONE sequence → probably O(n) 1-D DP.",
        "Constraints: n up to ~1,000-5,000 and TWO sequences, or a grid → probably O(n²) 2-D DP — anything bigger and an O(n²) table won't fit the time limit.",
        "If instead the array is sorted and you need a pair/triple summing to something → that's two pointers, not DP.",
      ],
    },
    {
      kind: 'list',
      title: 'The 5-step recipe',
      items: [
        "==1. State==: say out loud, in a full sentence, what `dp[i]` or `dp[i][j]` MEANS — e.g. 'dp[i] is the max money robbed using houses 0 through i'.",
        "==2. Transition==: name the choices available at this state, then write the formula combining them — e.g. 'rob house i, or don't — take the better one'.",
        "==3. Base cases==: the smallest state you can answer directly, with no recursion — e.g. dp[0], or an empty suffix/prefix.",
        "==4. Fill order==: which direction makes every value a transition needs already computed? Depends on dp[i-1]/dp[i-2] → go left to right. Depends on dp[i+1] → go right to left. 2-D: pick a direction per axis the same way.",
        "==5. Answer location==: where does the final answer live? Usually the last cell, but not always — check e.g. dp[0][0] for a suffix-style table, or max(dp) when the answer isn't at a fixed index.",
        "Memory hook: ==SToBoFA== — State, Transition, Base cases, Order, answer (Find Answer). Say all five before writing a single line of code.",
        "Second memory hook: if you can write the brute-force recursion and point at the repeated call, you already know the state — it's exactly the recursion's arguments.",
        "Say the complexity in the same breath: number of distinct states × work done per state.",
      ],
    },
    {
      kind: 'tree',
      title: 'DP: input shape → family → which boilerplate',
      root: dpDecisionTree,
    },
    {
      kind: 'boilerplate',
      title: 'Brute Recursion → @cache (Top-Down)',
      when: 'you can write the brute-force choice recursion but it times out from repeated calls',
      code: `def climbStairs(n):

    def dp(i):
        if i > n:
            return 0
        if i == n:
            return 1
        return dp(i + 1) + dp(i + 2)

    return dp(0)`,
      time: 'O(2^n) before memo',
      space: 'O(n) recursion depth',
      knobs: [
        {
          change: '==core move: add @cache==',
          how: "Import cache from functools and decorate the inner function — identical logic, now memoized to O(n) states.",
          code: `from functools import cache

def climbStairs(n):

    @cache
    def dp(i):
        if i > n:
            return 0
        if i == n:
            return 1
        return dp(i + 1) + dp(i + 2)

    return dp(0)`,
        },
        {
          change: 'house robber top-down',
          how: "State is the index; the choice is rob it (then skip i-1) or don't (keep dp(i-1)).",
          code: `@cache
def dp(i):
    if i < 0:
        return 0
    return max(dp(i - 1), dp(i - 2) + nums[i])`,
        },
        {
          change: 'coin change top-down (min coins)',
          how: "State is the remaining amount; try every coin as the last one used, then take the cheapest.",
          code: `@cache
def dp(a):
    if a == 0:
        return 0
    if a < 0:
        return float('inf')
    return min(1 + dp(a - c) for c in coins)`,
        },
        {
          change: 'word break top-down',
          how: "State is the start index; true if some dictionary word matches the prefix AND the rest also breaks.",
          code: `@cache
def dp(i):
    if i == len(s):
        return True
    return any(s[i:i + len(w)] == w and dp(i + len(w)) for w in wordSet)`,
        },
        {
          change: 'why @cache needs a pure function',
          how: "@cache keys on the exact arguments passed in — never memoize a function that reads or mutates anything outside its own parameters.",
        },
      ],
    },
    {
      kind: 'boilerplate',
      title: '1-D Bottom-Up (House Robber)',
      when: 'top-down works but you want an explicit fill order, or to drop the recursion depth entirely',
      code: `def rob(nums):

    if len(nums) == 1:
        return nums[0]

    dp = [nums[0], max(nums[0], nums[1])]

    for i in range(2, len(nums)):
        dp.append(max(dp[i - 1], dp[i - 2] + nums[i]))

    return dp[-1]`,
      time: 'O(n)',
      space: 'O(n)',
      knobs: [
        {
          change: '==O(1) space, two variables==',
          how: "Only the last two dp values are ever read — drop the array and keep two rolling variables.",
          code: `prev2, prev1 = 0, 0
for num in nums:
    prev2, prev1 = prev1, max(prev1, prev2 + num)
return prev1`,
        },
        {
          change: 'climbing stairs',
          how: "Same recurrence shape as Fibonacci: dp[i] = dp[i-1] + dp[i-2], base dp[1]=1, dp[2]=2.",
          code: `dp[i] = dp[i - 1] + dp[i - 2]`,
        },
        {
          change: 'min cost climbing stairs',
          how: "max becomes min, and the cost is paid when you LAND on step i, not when you leave it.",
          code: `dp[i] = min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2])`,
        },
        {
          change: 'house robber II (circular houses)',
          how: "Run the linear version twice — once excluding the first house, once excluding the last — take the max.",
          code: `return max(robLinear(nums[1:]), robLinear(nums[:-1]))`,
        },
      ],
    },
    {
      kind: 'boilerplate',
      title: 'Coin Change / Unbounded Knapsack',
      when: 'unlimited coins/items, min count or number of ways to hit a target',
      code: `def coinChange(coins, amount):

    dp = [0] + [float('inf')] * amount

    for a in range(1, amount + 1):
        for c in coins:
            if a - c >= 0:
                dp[a] = min(dp[a], 1 + dp[a - c])

    return dp[amount] if dp[amount] != float('inf') else -1`,
      time: 'O(amount · coins)',
      space: 'O(amount)',
      knobs: [
        {
          change: '==core recurrence==',
          how: "dp[a] = min over every coin c of 1 + dp[a-c]; looping amount outer, coins inner lets a coin repeat (unbounded).",
          code: `dp[a] = min(dp[a], 1 + dp[a - c])`,
        },
        {
          change: 'count the number of ways (coin change II)',
          how: "Switch min/1+ to +=, and loop coins OUTER, amount INNER — committing fully to one coin before the next stops double-counting orderings.",
          code: `dp = [1] + [0] * amount
for c in coins:
    for a in range(c, amount + 1):
        dp[a] += dp[a - c]`,
        },
        {
          change: 'why coins-outer vs amount-outer changes the answer',
          how: "amount-outer (coins inner) counts ORDERED sequences — picking [1,2] and [2,1] separately. coins-outer counts UNORDERED combinations, since each coin is fully placed before the next coin is even considered.",
        },
        {
          change: "minimum coins: float('inf') means unreachable",
          how: "Only convert inf to -1 at the very end — never mid-loop, or a later min() comparison breaks.",
        },
      ],
    },
    {
      kind: 'boilerplate',
      title: '0/1 Knapsack / Partition Equal Subset',
      when: 'each item used at most once, maximize value under a capacity (or decide if a target sum is reachable)',
      code: `def knapsack(weights, values, capacity):

    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]

    for i in range(n - 1, -1, -1):
        for cap in range(capacity + 1):
            dp[i][cap] = dp[i + 1][cap]
            if weights[i] <= cap:
                dp[i][cap] = max(dp[i][cap], values[i] + dp[i + 1][cap - weights[i]])

    return dp[0][capacity]`,
      time: 'O(n · capacity)',
      space: 'O(n · capacity)',
      knobs: [
        {
          change: '==collapse to 1-D, loop capacity DESCENDING==',
          how: "One row suffices if cap counts DOWN to weights[i] — descending order guarantees dp[cap - weight] is still last item's value, not this item reused.",
          code: `dp = [0] * (capacity + 1)
for i in range(n):
    for cap in range(capacity, weights[i] - 1, -1):
        dp[cap] = max(dp[cap], values[i] + dp[cap - weights[i]])`,
        },
        {
          change: 'ascending instead of descending breaks it',
          how: "Ascending lets dp[cap - weight] already include item i from earlier in THIS same pass — that silently turns it into unbounded knapsack (coin change), not 0/1.",
        },
        {
          change: 'partition equal subset sum',
          how: "It's 0/1 knapsack with values == weights == nums and target = sum(nums) // 2; the answer is whether dp[target] is True.",
          code: `dp[t] = dp[t] or dp[t - num]`,
        },
        {
          change: 'target sum (+/- signs) reduces to subset sum',
          how: "Let P = sum of the positive picks; P - (total - P) = target gives P = (target + total) // 2 — now count subsets summing to P.",
        },
      ],
    },
    {
      kind: 'boilerplate',
      title: 'Grid DP (Unique Paths / Min Path Sum)',
      when: 'move only right/down through a 2-D grid, count paths or minimize cost',
      code: `def uniquePaths(m, n):

    dp = [[0] * n for _ in range(m)]

    for r in range(m):
        for c in range(n):
            if r == 0 or c == 0:
                dp[r][c] = 1
            else:
                dp[r][c] = dp[r - 1][c] + dp[r][c - 1]

    return dp[m - 1][n - 1]`,
      time: 'O(m · n)',
      space: 'O(m · n)',
      knobs: [
        {
          change: '==core transition==',
          how: "Each cell sums the ways from directly above and directly left; the first row and first column are exactly 1 way each (a straight line in).",
          code: `dp[r][c] = dp[r - 1][c] + dp[r][c - 1]`,
        },
        {
          change: 'min path sum',
          how: "Swap + for min, and seed each cell with the actual grid cost instead of counting 1s.",
          code: `dp[r][c] = grid[r][c] + min(dp[r - 1][c], dp[r][c - 1])`,
        },
        {
          change: 'obstacles (obstacle grid)',
          how: "An obstacle cell is unreachable — force dp[r][c] = 0 and skip the normal transition entirely.",
          code: `if grid[r][c] == 1:
    dp[r][c] = 0
    continue`,
        },
        {
          change: '1-row rolling array (O(n) space)',
          how: "Only the row above is ever read — reuse one array; dp[c] still holds last row's value until it's overwritten by dp[c-1] from this row.",
          code: `dp = [1] * n
for r in range(1, m):
    for c in range(1, n):
        dp[c] += dp[c - 1]
return dp[-1]`,
        },
      ],
    },
    {
      kind: 'boilerplate',
      title: 'LCS 2-D Table',
      when: 'two sequences, longest common subsequence / edit distance / distinct subsequences family',
      code: `def longestCommonSubsequence(text1, text2):

    dp = [[0] * (len(text2) + 1) for _ in range(len(text1) + 1)]

    for i in range(len(text1) - 1, -1, -1):
        for j in range(len(text2) - 1, -1, -1):
            if text1[i] == text2[j]:
                dp[i][j] = 1 + dp[i + 1][j + 1]
            else:
                dp[i][j] = max(dp[i + 1][j], dp[i][j + 1])

    return dp[0][0]`,
      time: 'O(n · m)',
      space: 'O(n · m)',
      knobs: [
        {
          change: '==sizing + meaning==',
          how: "dp[i][j] = LCS length of text1[i:] and text2[j:]; the +1 row and column is the empty-suffix base case, already zero-filled.",
          code: `dp = [[0] * (len(text2) + 1) for _ in range(len(text1) + 1)]`,
        },
        {
          change: 'edit distance (3 choices: insert/delete/replace)',
          how: "A match costs 0 and moves diagonally; a mismatch costs 1 plus the best of insert, delete, or replace.",
          code: `if word1[i] == word2[j]:
    dp[i][j] = dp[i + 1][j + 1]
else:
    dp[i][j] = 1 + min(dp[i + 1][j], dp[i][j + 1], dp[i + 1][j + 1])`,
        },
        {
          change: 'distinct subsequences (count, not length)',
          how: "On a match there are two options — use this char or skip it — so ADD the diagonal to the skip, instead of taking 1 + diagonal.",
          code: `if s[i] == t[j]:
    dp[i][j] = dp[i + 1][j + 1] + dp[i + 1][j]
else:
    dp[i][j] = dp[i + 1][j]`,
        },
        {
          change: 'longest common substring (must be contiguous)',
          how: "A mismatch RESETS the run to 0 instead of taking the best neighbor; track the max over every cell, not just dp[0][0].",
          code: `dp[i][j] = 1 + dp[i + 1][j + 1] if s1[i] == s2[j] else 0
best = max(best, dp[i][j])`,
        },
      ],
    },
    {
      kind: 'beforeAfter',
      title: "Fill the table: predict every cell, then check",
      rows: [
        { op: "LCS('abc','ac') row i=3 — text1[3:] = ''", before: '[0, 0, 0]', after: '[0, 0, 0]', note: 'base case: empty text1 suffix, LCS with anything is 0' },
        { op: "LCS('abc','ac') row i=2 — text1[2:] = 'c'", before: '[0, 0, 0]', after: '[1, 1, 0]', note: "j=1: 'c'=='c' match → dp[2][1]=1+dp[3][2]=1. j=0: 'c'!='a' → dp[2][0]=max(dp[3][0],dp[2][1])=1" },
        { op: "LCS('abc','ac') row i=1 — text1[1:] = 'bc'", before: '[0, 0, 0]', after: '[1, 1, 0]', note: "both mismatches — carries forward the best neighbor (max), no reset" },
        { op: "LCS('abc','ac') row i=0 — text1[0:] = 'abc'", before: '[0, 0, 0]', after: '[2, 1, 0]', note: "j=0: 'a'=='a' match → dp[0][0]=1+dp[1][1]=1+1=2 — the final answer" },
        { op: 'uniquePaths(3,3) row r=0', before: '[0, 0, 0]', after: '[1, 1, 1]', note: 'first row — exactly one straight path in from the left each time' },
        { op: 'uniquePaths(3,3) row r=1', before: '[0, 0, 0]', after: '[1, 2, 3]', note: 'dp[1][1]=dp[0][1]+dp[1][0]=1+1=2; dp[1][2]=dp[0][2]+dp[1][1]=1+2=3' },
        { op: 'uniquePaths(3,3) row r=2', before: '[0, 0, 0]', after: '[1, 3, 6]', note: 'dp[2][1]=dp[1][1]+dp[2][0]=2+1=3; dp[2][2]=dp[1][2]+dp[2][1]=3+3=6 → the answer' },
      ],
    },
    {
      kind: 'boilerplate',
      title: 'LIS: O(n²) and O(n log n)',
      when: 'longest strictly increasing subsequence of an array',
      code: `def lengthOfLIS(nums):

    n = len(nums)
    dp = [1] * n

    for i in range(n - 1, -1, -1):
        for j in range(i + 1, n):
            if nums[j] > nums[i]:
                dp[i] = max(dp[i], 1 + dp[j])

    return max(dp)`,
      time: 'O(n²)',
      space: 'O(n)',
      knobs: [
        {
          change: '==O(n log n) with bisect==',
          how: "tails[k] = smallest possible tail of an increasing subsequence of length k+1; bisect_left finds where num belongs, extending or replacing a tail.",
          code: `from bisect import bisect_left

def lengthOfLIS(nums):

    tails = []

    for num in nums:
        pos = bisect_left(tails, num)
        if pos == len(tails):
            tails.append(num)
        else:
            tails[pos] = num

    return len(tails)`,
        },
        {
          change: 'longest NON-decreasing (equal values allowed)',
          how: "Swap bisect_left for bisect_right so an equal value extends the run instead of replacing a tail.",
          code: `pos = bisect_right(tails, num)`,
        },
        {
          change: "why tails isn't the actual LIS",
          how: "tails only tracks the smallest tail per length for comparison purposes — it is not a real subsequence that appeared in nums.",
        },
        {
          change: 'reconstruct the actual sequence',
          how: "Go back to the O(n²) version and store a parent pointer alongside dp[i] for whichever j gave the max; walk the pointers back from the best i.",
        },
      ],
    },
    {
      kind: 'table',
      title: 'Problem → state → transition → time/space',
      columns: ['Problem', 'dp state means', 'Transition', 'Time / Space'],
      rows: [
        ['70. Climbing Stairs', 'ways to reach step i', 'dp[i] = dp[i-1] + dp[i-2]', 'O(n) / O(1)'],
        ['198. House Robber', 'max loot using houses 0..i', 'dp[i] = max(dp[i-1], dp[i-2]+nums[i])', 'O(n) / O(1)'],
        ['213. House Robber II', 'max loot, houses in a circle', 'max(robLinear(nums[1:]), robLinear(nums[:-1]))', 'O(n) / O(1)'],
        ['322. Coin Change', 'min coins to make amount a', 'dp[a] = min(1 + dp[a-c]) over coins c', 'O(amount·coins) / O(amount)'],
        ['518. Coin Change II', 'number of combinations making amount a', 'dp[a] += dp[a-c], coins outer loop', 'O(amount·coins) / O(amount)'],
        ['62. Unique Paths', 'ways to reach (r,c) from (0,0)', 'dp[r][c] = dp[r-1][c] + dp[r][c-1]', 'O(m·n) / O(n) rolling'],
        ['64. Minimum Path Sum', 'min cost to reach (r,c)', 'dp[r][c] = grid[r][c] + min(dp[r-1][c], dp[r][c-1])', 'O(m·n) / O(n) rolling'],
        ['1143. Longest Common Subsequence', 'LCS length of text1[i:] & text2[j:]', 'match: 1+dp[i+1][j+1]; else max(dp[i+1][j], dp[i][j+1])', 'O(n·m) / O(n·m)'],
        ['72. Edit Distance', 'edits to turn word1[i:] into word2[j:]', 'match: dp[i+1][j+1]; else 1+min(3 neighbors)', 'O(n·m) / O(n·m)'],
        ['115. Distinct Subsequences', 'ways s[i:] forms t[j:]', 'match: dp[i+1][j+1]+dp[i+1][j]; else dp[i+1][j]', 'O(n·m) / O(n·m)'],
        ['300. Longest Increasing Subsequence', 'LIS length starting at i', 'dp[i] = max(1, 1+dp[j]) for j>i, nums[j]>nums[i]', 'O(n²) or O(n log n) / O(n)'],
        ['139. Word Break', 'can s[i:] be segmented by the dictionary', 'dp[i] = any(dp[i+len(w)] for matching word w)', 'O(n²) or O(n·dict) / O(n)'],
        ['91. Decode Ways', 'ways to decode s[:i]', "dp[i] = dp[i-1] (s[i-1]!='0') + dp[i-2] (10<=s[i-2:i]<=26)", 'O(n) / O(1)'],
        ['416. Partition Equal Subset Sum', 'can some subset sum to t', 'dp[t] = dp[t] or dp[t-num], nums outer, t descending', 'O(n·sum) / O(sum)'],
        ['312. Burst Balloons', 'max coins bursting everything strictly between l and r', 'dp[l][r] = max over k in (l,r) of dp[l][k]+dp[k][r]+nums[l]*nums[k]*nums[r]', 'O(n³) / O(n²)'],
      ],
    },
    {
      kind: 'list',
      title: 'Say it out loud (and common bugs)',
      items: [
        "State it in words first: 'dp[i] means the best/count/length ending at (or using) index i' — say this before any code.",
        "Name the choices out loud: 'at each step I can either X or Y' — that sentence IS the transition.",
        "Base case is the smallest subproblem you can answer with no recursion — state it, and the fill order falls out naturally.",
        "Fill order: depends on dp[i-1]/dp[i-2] → go left to right. Depends on dp[i+1] → go right to left. 2-D picks a direction per axis.",
        "Complexity = number of distinct states × work done per state — say both numbers, not just the final Big-O.",
        "Bug: off-by-one in the +1 sizing — `dp = [[0]*(n+1) for _ in range(m+1)]` needs every index access shifted consistently.",
        "Bug: wrong base row/column — forgetting dp[0][j] or dp[i][0] leaves the first row/col at 0 when it should hold real seed values.",
        "Bug: iteration order — filling ascending when the transition needs last pass's value (descending) silently reuses an item twice; 0/1 quietly becomes unbounded.",
        "Bug: `[[0] * n] * m` makes m references to the SAME row — mutating one mutates all of them. Always use a list comprehension per row.",
        "If stuck, fall back to brute-force recursion first, then ask 'what call repeats?' — that overlap IS the memo key, and its arguments ARE the state.",
      ],
    },
  ],

  recall: [
    { prompt: 'Climbing stairs: dp[i] means?', answer: 'the number of ways to reach step i' },
    { prompt: 'Climbing stairs transition?', answer: 'dp[i] = dp[i-1] + dp[i-2]' },
    { prompt: 'House robber transition?', answer: 'dp[i] = max(dp[i-1], dp[i-2] + nums[i])' },
    { prompt: 'Coin change (min coins): dp[a] transition?', answer: 'min(dp[a], 1 + dp[a-c]) over every coin c' },
    { prompt: 'Coin change II (count ways): which loop order gives combinations, not permutations?', answer: 'coins outer, amount inner' },
    { prompt: 'LCS table size for strings of length n and m?', answer: '(n+1) x (m+1)' },
    { prompt: 'LCS: dp[i][j] means?', answer: 'LCS length of text1[i:] and text2[j:] (suffixes)' },
    { prompt: 'LCS match transition?', answer: 'dp[i][j] = 1 + dp[i+1][j+1]' },
    { prompt: 'Edit distance mismatch transition?', answer: '1 + min(dp[i+1][j], dp[i][j+1], dp[i+1][j+1])' },
    { prompt: 'Distinct subsequences match transition?', answer: 'dp[i][j] = dp[i+1][j+1] + dp[i+1][j]' },
    { prompt: 'Unique paths transition?', answer: 'dp[r][c] = dp[r-1][c] + dp[r][c-1]' },
    { prompt: 'Unique paths base case (first row/col)?', answer: '1 — exactly one straight-line path in' },
    { prompt: '0/1 knapsack 1-D: which direction over capacity?', answer: 'descending — capacity down to weights[i]' },
    { prompt: 'Why descending, not ascending, for 0/1 knapsack?', answer: "ascending would let the same item be reused within one pass — that's unbounded, not 0/1" },
    { prompt: 'LIS O(n log n): what does tails[k] store?', answer: 'the smallest possible tail value of an increasing subsequence of length k+1' },
    { prompt: 'LIS O(n log n): bisect_left or bisect_right for STRICTLY increasing?', answer: 'bisect_left' },
    { prompt: 'Decode ways: when does dp[i] add dp[i-2]?', answer: "when s[i-2:i] parses as a number from 10 to 26 inclusive" },
    { prompt: 'Complexity formula to say out loud for any DP?', answer: 'number of states × work per state' },
  ],

  quiz: [
    {
      id: 'dayof:dp:q1',
      q: 'Which is the strongest signal a problem is DP, not greedy?',
      choices: ['Making the locally best choice always gives the global best answer', 'The answer needs trying multiple choices at each step, and earlier choices affect which later choices are optimal', 'The array is already sorted', 'Only one pass over the input is needed'],
      answer: 1,
      why: "That's exactly overlapping subproblems with no safe local shortcut — the definition of needing DP instead of greedy.",
      skills: ['dp-1d'],
    },
    {
      id: 'dayof:dp:q2',
      q: 'n is about 5,000 and the problem compares two strings pairwise. Which complexity should that nudge you toward?',
      choices: ['O(2^n) brute force', 'O(n) single pass', 'O(n²) 2-D DP table', 'O(n log n) sorting'],
      answer: 2,
      why: '5,000² = 25 million cells, comfortably inside a typical time limit — exactly the 2-D DP sweet spot.',
      skills: ['complexity'],
    },
    {
      id: 'dayof:dp:q3',
      q: 'Say the 5-step DP recipe in order:',
      choices: ['transition, state, base case, order, answer', 'state, transition, base cases, fill order, answer location', 'base case, answer, state, order, transition', 'order, state, answer, transition, base case'],
      answer: 1,
      why: 'You have to know what a state MEANS before you can write its transition, and know the base case before picking a fill order.',
      skills: ['dp-1d'],
    },
    {
      id: 'dayof:dp:q4',
      q: "Before writing any code, dp[i]'s meaning should be stated as what?",
      choices: ['a vague sense that it is good', 'a complete sentence describing exactly what value dp[i] holds, in words', 'the final Big-O, since that is what matters most', 'just the variable name'],
      answer: 1,
      why: "If you can't say the state in one sentence, you can't trust the transition you write next.",
      skills: ['dp-1d'],
    },
    {
      id: 'dayof:dp:q5',
      q: 'One array. dp[i] only ever reads dp[i-1] and dp[i-2] — no inner loop. Which family?',
      choices: ['2-D two sequences', '1-D linear', 'interval DP', '0/1 knapsack'],
      answer: 1,
      why: 'A fixed, tiny number of earlier dp values with no extra loop is the 1-D linear shape (climbing stairs, house robber).',
      skills: ['dp-1d'],
    },
    {
      id: 'dayof:dp:q6',
      q: 'A problem needs trying every coin denomination (or every dictionary word) before committing to dp[i]. Which family?',
      choices: ['1-D linear', '1-D DP with an inner loop', '2-D grid', 'interval DP'],
      answer: 1,
      why: "An inner loop over choices per state — coins, words, earlier indices — is the coin-change / word-break / LIS family.",
      skills: ['dp-1d'],
    },
    {
      id: 'dayof:dp:q7',
      q: 'Comparing two strings character by character, state = (i, j). Which family, and what table size?',
      choices: ['2-D grid; R×C', '2-D two sequences; (len(a)+1)×(len(b)+1)', '1-D linear; O(n)', 'interval DP; n×n'],
      answer: 1,
      why: "Two sequences being aligned pairwise need one extra row and column for the empty-suffix base case.",
      skills: ['dp-2d'],
    },
    {
      id: 'dayof:dp:q8',
      q: 'State = a subrange (l, r) of one array, and the transition picks a split point k inside it. Which family?',
      choices: ['1-D with inner loop', '2-D grid', 'interval DP', '0/1 knapsack'],
      answer: 2,
      why: 'A whole subrange as the state, with a split point chosen inside it, is the interval DP shape (burst balloons, palindromes).',
      skills: ['dp-2d'],
    },
    {
      id: 'dayof:dp:q9',
      q: 'Converting brute-force recursion into top-down DP — what is the one line you add?',
      choices: ['a global variable', '@cache (or @lru_cache) above the recursive helper', 'a second recursive call', 'sort the input first'],
      answer: 1,
      why: '@cache memoizes every (state) → result pair the recursion computes, turning exponential repeats into O(states).',
      skills: ['dp-1d'],
    },
    {
      id: 'dayof:dp:q10',
      q: "Brute-force choice recursion — try option A, try option B, combine results — before adding @cache. Which other technique does this shape resemble?",
      choices: ['backtracking', 'binary search', 'a monotonic stack', 'union-find'],
      answer: 0,
      why: "Exploring every choice at each step and combining the results is exactly backtracking's shape — DP is backtracking plus memoizing the repeats.",
      skills: ['backtracking'],
    },
    {
      id: 'dayof:dp:q11',
      q: 'This 2-D init line is a classic bug. What is wrong with it?',
      code: 'dp = [[0] * n] * m',
      choices: ['nothing, totally fine', 'all m rows are the SAME list — mutating one row mutates every row', 'n and m are swapped', 'it should use tuples instead of lists'],
      answer: 1,
      why: '[x] * m repeats the same list object m times — use a list comprehension so each row is independently allocated.',
      skills: ['dp-2d'],
    },
    {
      id: 'dayof:dp:q12',
      q: 'House robber needs O(1) space instead of an array. What do you keep?',
      choices: ['the entire dp array, just reversed', 'only the last two dp values, in two variables', 'a set of visited indices', 'nothing — recompute from scratch every time'],
      answer: 1,
      why: 'The transition only ever reads dp[i-1] and dp[i-2] — two rolling variables are enough.',
      skills: ['dp-1d'],
    },
    {
      id: 'dayof:dp:q13',
      q: 'Coin change (min coins): dp[a] = ?',
      choices: ['min(dp[a - c]) over coins c', 'min(1 + dp[a - c]) over coins c', 'dp[a - 1] + 1', 'sum(dp[a - c] for c in coins)'],
      answer: 1,
      why: 'Using one more coin of value c costs 1 plus the best way to make the remaining amount a - c.',
      skills: ['dp-1d'],
    },
    {
      id: 'dayof:dp:q14',
      q: "Coin Change II (count combinations, order doesn't matter) — which loop order is required?",
      choices: ['amount outer, coins inner', 'coins outer, amount inner', 'either order gives the same answer', 'recursion only, no loops work'],
      answer: 1,
      why: 'Coins outer fully commits to one coin before moving to the next, so the same combo is never counted in two different orders.',
      skills: ['dp-1d'],
    },
    {
      id: 'dayof:dp:q15',
      q: 'Amount up to 10,000, 20 distinct coins, min-coins DP. Time complexity, stated as states × work?',
      choices: ['O(amount) states × O(1) work = O(amount)', 'O(amount) states × O(coins) work = O(amount·coins)', 'O(coins) states × O(amount) work — same thing either way', 'O(amount²), coins do not matter'],
      answer: 1,
      why: 'Each of the amount+1 states loops over every coin once — states times work per state.',
      skills: ['complexity'],
    },
    {
      id: 'dayof:dp:q16',
      q: '0/1 knapsack collapsed to a 1-D dp[cap] array — which loop direction over capacity, and why?',
      choices: ['ascending — simpler to read', "descending — so dp[cap - weight] is still LAST item's value, not this item reused", 'direction never matters here', 'descending only matters for unbounded knapsack'],
      answer: 1,
      why: 'Descending guarantees you read a value that has not yet been updated by the current item in this same pass.',
      skills: ['dp-2d'],
    },
    {
      id: 'dayof:dp:q17',
      q: 'That same 1-D knapsack array, but you loop capacity ASCENDING instead. What do you actually compute now?',
      choices: ['the same 0/1 answer, just slower', 'unbounded knapsack — items can be reused within the same pass', 'a syntax error', 'the minimum instead of the maximum'],
      answer: 1,
      why: 'Ascending order lets dp[cap - weight] already include this item from earlier in the same pass — that is unbounded reuse.',
      skills: ['dp-2d'],
    },
    {
      id: 'dayof:dp:q18',
      q: 'Unique paths: dp[r][c] = ?',
      choices: ['dp[r-1][c-1] + 1', 'dp[r-1][c] + dp[r][c-1]', 'max(dp[r-1][c], dp[r][c-1])', 'dp[r][c-1] * 2'],
      answer: 1,
      why: 'Every path into (r, c) arrived either from directly above or directly left — sum both counts.',
      skills: ['dp-2d'],
    },
    {
      id: 'dayof:dp:q19',
      q: 'Grid DP with an obstacle at (r, c). What do you force?',
      choices: ['dp[r][c] = 1', 'dp[r][c] = dp[r-1][c]', 'dp[r][c] = 0, and skip the normal transition', 'delete that row entirely'],
      answer: 2,
      why: 'An obstacle cell is unreachable, so it contributes zero paths/cost forward — skip the sum/min transition for it.',
      skills: ['dp-2d'],
    },
    {
      id: 'dayof:dp:q20',
      q: 'LCS table for strings of length n and m is sized how, and why the +1?',
      choices: ['n×m; no padding needed', '(n+1)×(m+1); the extra row/col is the empty-suffix base case', '(n+1)×(m+1); just convention, no real meaning', 'n×(m+1); only text2 needs padding'],
      answer: 1,
      why: 'dp[n][j] and dp[i][m] represent comparing against an empty suffix — a real base case, not padding for its own sake.',
      skills: ['dp-2d'],
    },
    {
      id: 'dayof:dp:q21',
      q: 'Edit distance mismatch transition (3 operations)?',
      choices: ['dp[i][j] = dp[i+1][j+1]', 'dp[i][j] = 1 + min(dp[i+1][j], dp[i][j+1], dp[i+1][j+1])', 'dp[i][j] = max(dp[i+1][j], dp[i][j+1])', 'dp[i][j] = dp[i+1][j] + dp[i][j+1]'],
      answer: 1,
      why: 'A mismatch costs 1 plus the cheapest of delete, insert, or replace, read from the three neighboring cells.',
      skills: ['dp-2d'],
    },
    {
      id: 'dayof:dp:q22',
      q: "Distinct subsequences counts WAYS. What does a MATCH do differently than plain LCS?",
      choices: ['nothing, identical to LCS', 'adds the diagonal AND the skip-this-char option: dp[i+1][j+1] + dp[i+1][j]', 'resets to 0', 'subtracts instead of adds'],
      answer: 1,
      why: "On a match you can either USE this character or SKIP it — both paths count, so they add, not just the diagonal alone.",
      skills: ['dp-2d'],
    },
    {
      id: 'dayof:dp:q23',
      q: 'Longest common substring vs LCS — what happens to dp[i][j] on a mismatch?',
      choices: ['same as LCS: max of the two neighbors', 'resets to 0, since a substring must stay contiguous', 'adds 1 anyway', 'becomes negative'],
      answer: 1,
      why: "A substring can't skip a character, so any mismatch breaks the run completely — reset to 0 and track the max seen.",
      skills: ['dp-2d'],
    },
    {
      id: 'dayof:dp:q24',
      q: "LCS('abc', 'ac') table, backward-filled. What is dp[1][1] (comparing text1[1:]='bc' with text2[1:]='c')?",
      code: "dp[1] row ends up as [1, 1, 0] for j = 0, 1, 2",
      choices: ['0', '1', '2', '3'],
      answer: 1,
      why: "text1[1]='b' vs text2[1]='c' is a mismatch, so dp[1][1] = max(dp[2][1], dp[1][2]) = max(1, 0) = 1.",
      skills: ['dp-2d'],
    },
    {
      id: 'dayof:dp:q25',
      q: 'LIS O(n log n): what does tails[] hold, and which bisect keeps it STRICTLY increasing?',
      choices: ['the actual LIS subsequence; bisect_right', 'the smallest tail value per length; bisect_left', 'a sorted copy of nums; bisect_right', 'the count of increasing pairs; bisect_left'],
      answer: 1,
      why: 'tails[k] is the smallest tail achievable for length k+1; bisect_left replaces an equal value instead of extending past it, keeping the subsequence strict.',
      skills: ['dp-1d'],
    },
  ],
}
