const rotate = (choices, answer, shift) => ({
  choices: choices.map((_, j) => choices[(j + shift) % choices.length]),
  answer: (answer - shift + choices.length) % choices.length,
})

const mcqRows = [
  [['dp-1d'], 1, 'Climbing Stairs, n = 6. Answer?', ['13', '8', '21', '11'], 0, 'Sequence 1, 2, 3, 5, 8, 13 for n = 1..6.'],
  [['dp-1d'], 2, 'House Robber on [2, 7, 9, 3, 1]: optimal total?', ['12', '11', '10', '9'], 0, 'Rob 2, 9, 1 → 12, which beats robbing 7 and 3.'],
  [['dp-1d'], 2, 'House Robber II (circular) on [2, 3, 2]: answer?', ['3', '4', '5', '2'], 0, 'Excluding either end gives max(2,3)=3 or max(3,2)=3; the circular max is 3.'],
  [['dp-1d'], 2, "Decode Ways: s = '226'. Count of valid decodings?", ['3', '2', '4', '1'], 0, "\"2 2 6\", \"22 6\", \"2 26\" — three ways."],
  [['dp-1d'], 1, 'Coin Change: coins = [1, 2, 5], amount = 11. Minimum coins?', ['3', '4', '2', '5'], 0, '5 + 5 + 1 = 11 using 3 coins.'],
  [['dp-1d'], 2, 'Coin Change II (count ways): coins = [1, 2, 5], amount = 5. Number of combinations?', ['4', '3', '5', '6'], 0, '{5}, {1,2,2}, {1,1,1,2}, {1,1,1,1,1} — four combinations.'],
  [['dp-1d'], 2, "Word Break: s = 'catsandog', dict = ['cats','dog','sand','and','cat']. Segmentable?", ['False', 'True', 'Cannot determine', 'Only with memoization'], 0, "Every split leaves \"og\", which is not in the dictionary."],
  [['dp-1d'], 2, 'Longest Increasing Subsequence length for [0, 1, 0, 3, 2, 3]?', ['4', '3', '5', '2'], 0, '0, 1, 2, 3 is length 4.'],
  [['dp-1d'], 2, 'Perfect Squares: fewest square numbers summing to 12?', ['3', '4', '2', '5'], 0, '4 + 4 + 4 = 12 using three squares.'],
  [['dp-1d', 'complexity'], 1, 'dp[i] depends only on dp[i-1] and dp[i-2]. Best space optimization?', ['Two rolling variables, O(1) space', 'Keep the full array, O(n)', 'A heap', 'Recursion without memoization'], 0, 'Only the last two values are ever needed at once.'],
  [['dp-2d'], 2, '0/1 Knapsack with a 1-D dp array: why loop capacity BACKWARDS?', ['So each item is used at most once (no reuse)', 'It is faster', 'Needed for sorting', 'Avoids overflow'], 0, 'Backward iteration keeps dp[c - weight] as the previous item\'s row, not the current one.'],
  [['dp-2d'], 2, 'Unbounded Knapsack (infinite supply of each item): capacity loop direction?', ['Forward, so an item can be reused within the same pass', 'Backward, same as 0/1', 'It does not matter', 'Random order'], 0, 'Forward iteration lets an already-updated cell feed into a later one, allowing reuse.'],
  [['dp-2d'], 2, 'Partition Equal Subset Sum: nums = [1, 5, 11, 5]. Possible?', ['True', 'False', 'Only with duplicates removed', 'Needs sorting first'], 0, '{11} or {5, 5, 1} both sum to 11, half of 22.'],
  [['dp-2d'], 1, 'Partition Equal Subset Sum reduces to:', ['0/1 knapsack: can a subset sum to total / 2', 'Unbounded knapsack', 'A greedy pass', 'Topological sort'], 0, 'It is exactly subset-sum with target total/2, using each number once.'],
  [['dp-2d', 'complexity'], 1, '0/1 Knapsack DP table for n items, capacity W: time and space (2-D version)?', ['O(n · W) time and space', 'O(n + W)', 'O(n²)', 'O(2ⁿ)'], 0, 'One cell per (item, capacity) pair, O(1) work each.'],
  [['dp-2d'], 3, 'Target Sum (assign + or - to each number to hit a target): best reframing?', ['Subset sum: find a subset summing to (total + target) / 2', 'Pure backtracking only, no DP possible', 'A BFS over partial sums', 'A greedy pass sorted by value'], 0, 'Positive-assigned numbers must sum to (total + target) / 2; the rest are negative.'],
  [['dp-2d'], 2, 'Coin Change II: looping COINS in the outer loop, AMOUNT in the inner loop counts:', ['Combinations (order does not matter)', 'Permutations (order matters)', 'The same result either way', 'Neither combinations nor permutations'], 0, 'Each coin is fully decided before moving to the next, so order within a combo never forms twice.'],
  [['dp-2d'], 2, 'The same Coin Change II table, but looping AMOUNT outer and COINS inner instead counts:', ['Permutations (order matters)', 'Combinations', 'The same result either way', 'An undefined quantity'], 0, 'Every coin is reconsidered at every amount, so different orderings of the same coins are counted separately.'],
  [['dp-1d', 'binary-search'], 2, 'LIS via patience sorting (tails array + bisect_left): why does replacing tails[i] not corrupt the final answer?', ['tails only grows in length when a new high is appended; a replacement just finds a smaller tail for an existing length', 'It does corrupt it, but the bug rarely shows up', 'Only append is ever actually used', 'bisect is not actually required'], 0, 'len(tails) always equals the current best LIS length; replacing improves future extendability without changing that length.'],
  [['dp-1d'], 2, 'LIS O(n²) DP: dp[i] represents:', ['The length of the LIS ending at index i', 'The length of the LIS starting at index i', 'The total count of increasing subsequences', 'The maximum value seen so far'], 0, 'dp[i] = 1 + max(dp[j]) over j < i with nums[j] < nums[i].'],
  [['dp-2d'], 1, "LCS of 'abcde' and 'ace': length?", ['3', '2', '4', '5'], 0, '"ace" is a subsequence of "abcde".'],
  [['dp-2d'], 2, "Edit Distance between 'horse' and 'ros': minimum operations?", ['3', '2', '4', '5'], 0, "horse → rorse → rose → ros: 3 edits."],
  [['dp-2d'], 1, 'Edit Distance DP: on a character match, dp[i][j] =', ['dp[i+1][j+1] (no operation needed)', '1 + dp[i+1][j+1]', '1 + min of the three neighbors', 'dp[i][j+1]'], 0, 'Matching characters cost nothing; just advance both pointers.'],
  [['dp-2d'], 2, 'Edit Distance DP on a mismatch, dp[i][j] =', ['1 + min(dp[i+1][j], dp[i][j+1], dp[i+1][j+1])', 'dp[i+1][j+1]', 'The max of the three neighbors', 'dp[i][j] unchanged'], 0, 'One edit (delete, insert, or replace) plus the best of the three resulting subproblems.'],
  [['dp-2d'], 2, 'Longest Common Substring (contiguous) differs from LCS (subsequence) in that on a mismatch:', ['dp[i][j] resets to 0 instead of taking the max of neighbors', 'It uses the same recurrence as LCS', 'It adds 1 regardless', 'It requires sorting the strings first'], 0, 'A mismatch breaks any contiguous run, so the count must restart at 0.'],
  [['dp-1d', 'constraints'], 1, 'LIS with n ≤ 10⁵. Target complexity?', ['O(n log n) via tails + binary search', 'O(n²) DP is fine', 'O(2ⁿ)', 'O(n³)'], 0, '10¹⁰ is too slow; patience sorting fits the budget.'],
  [['dp-2d'], 2, 'Shortest Common Supersequence length relates to LCS by:', ['len(a) + len(b) - LCS(a, b)', 'len(a) + len(b)', 'LCS(a, b) alone', 'max(len(a), len(b))'], 0, 'Shared characters are not duplicated in the supersequence.'],
  [['dp-2d'], 2, 'Longest Palindromic Subsequence of s relates to LCS by:', ['LCS(s, reverse(s))', 'len(s) - LCS(s, reverse(s))', 'LCS(s, sorted(s))', 'Always len(s)'], 0, 'A palindromic subsequence reads the same forward and backward, matching itself against its reverse.'],
  [['dp-2d'], 3, 'Burst Balloons: dp[i][j] is the max coins from bursting every balloon strictly between i and j, with k the LAST one burst there. The transition considers:', ['dp[i][k] + dp[k][j] + nums[i]·nums[k]·nums[j], over every k between i and j', 'Only k adjacent to i', 'Greedy: always burst the smallest balloon first', 'BFS over every burst order'], 0, 'Trying every possible "last burst" k and taking the best split is the full interval DP.'],
  [['dp-2d'], 2, 'Interval DP (Burst Balloons, Matrix Chain Multiplication, etc.) fills its table by:', ['Increasing interval LENGTH, so every smaller subinterval is ready first', 'Row by row, top to bottom', 'Column by column only', 'Any order; memoization makes it irrelevant'], 0, 'dp[i][j] depends on strictly shorter intervals inside (i, j), so length must increase.'],
  [['dp-2d'], 3, 'Matrix Chain Multiplication: dp[i][j] = minimum scalar multiplications for matrices i..j. Transition:', ['min over split k of dp[i][k] + dp[k+1][j] + cost(i, k, j)', 'dp[i][j-1] + dp[i+1][j]', 'The sum of every pairwise product', 'Greedy: multiply the smallest dimensions first'], 0, 'Every split point k is tried and the cheapest total is kept.'],
  [['dp-2d'], 2, 'Palindrome Partitioning II (minimum cuts): a key speedup is precomputing:', ['isPalindrome[i][j] for every substring in O(n²), making each transition O(1)', 'A sorted copy of the string', 'A suffix array', 'Nothing — it is already O(n)'], 0, 'Without the table, checking palindromes repeatedly inside the DP would blow up the complexity.'],
  [['dp-2d'], 3, 'Minimum Cost to Merge Stones (merge exactly k adjacent piles at a time): a necessary feasibility check before any DP is:', ['(n - 1) % (k - 1) == 0', 'n must be even', 'k must equal 2', 'n must be prime'], 0, 'Each merge reduces the pile count by k - 1, so reaching exactly 1 pile requires this divisibility.'],
  [['dp-2d', 'complexity'], 2, 'Interval DP time complexity is typically:', ['O(n³): O(n²) intervals times an O(n) split search', 'O(n²)', 'O(n log n)', 'O(2ⁿ)'], 0, 'Each of O(n²) intervals tries up to O(n) split points.'],
  [['dp-2d'], 3, 'Strange Printer (fewest turns to print a string by painting runs): if s[i] == s[j], dp[i][j] relates to dp[i][j-1] by:', ['dp[i][j] = dp[i][j-1] (reuse the same print pass for the matching character)', 'dp[i][j] = dp[i][j-1] + 1 always', 'A fresh print is always required', 'Greedy: print character by character'], 0, 'A matching end character can ride along with an earlier print of the same character.'],
  [['dp-2d'], 2, 'Why frame Burst Balloons around "k is the LAST balloon burst in [i, j]" rather than the first?', ['After k bursts last, i and j are still its direct neighbors, keeping the subproblem split clean', 'It is an arbitrary convention with no effect', 'Order of bursting never matters for this problem', 'Balloons must burst left to right by rule'], 0, 'Choosing the last burst preserves i and j as fixed neighbors for the two subintervals.'],
  [['dp-2d', 'bit'], 2, 'Traveling Salesman via bitmask DP: dp[mask][i] means:', ['Minimum cost to visit exactly the cities in mask, ending at city i', 'Minimum cost while ignoring city i', 'The total number of visited cities', 'The maximum cost of any tour'], 0, 'mask encodes which cities are already visited; i is where the partial tour currently sits.'],
  [['dp-2d', 'bit', 'complexity'], 2, 'Bitmask DP TSP complexity for n cities:', ['O(n² · 2ⁿ)', 'O(n!)', 'O(2ⁿ)', 'O(n³)'], 0, '2ⁿ masks, times n possible last cities, times n possible next cities.'],
  [['dp-2d', 'bit', 'constraints'], 2, 'Smallest Sufficient Team: dp[mask] = smallest team covering skill set mask, with ≤ 16 distinct skills. This constraint strongly suggests:', ['Bitmask DP over 2¹⁶ skill subsets', 'Greedy by skill frequency', 'Unmemoized backtracking', 'Sorting people by skill count'], 0, 'A small number of skills (not people) is the real exponential dimension here.'],
  [['dp-2d', 'bit'], 2, 'Partition to K Equal Sum Subsets: dp[mask] = True if the numbers in mask can be perfectly grouped so far. mask ranges over:', ['All 2ⁿ subsets of the n numbers', 'All k subsets', 'Only the n numbers individually', 'Pairs of numbers'], 0, 'Every subset of the input numbers is a candidate partial grouping.'],
  [['graph-bfs', 'bit'], 2, 'Shortest Path Visiting All Nodes: why is this bitmask BFS/DP and not plain Dijkstra?', ['The state must track WHICH nodes have been visited, not just the current node', 'Dijkstra cannot handle unweighted graphs', 'It requires negative weights', 'It is actually simpler without a mask'], 0, 'Revisiting a node is fine and sometimes required; what changes is the visited-set, which must be part of the state.'],
  [['bit'], 1, 'Bitmask trick: mask & (mask - 1) removes:', ['The lowest set bit', 'The highest set bit', 'All set bits', 'Nothing'], 0, 'Subtracting 1 flips the lowest set bit and every bit below it; ANDing clears it.'],
  [['bit'], 1, 'Bitmask trick: mask & -mask isolates:', ['The lowest set bit', 'The highest set bit', 'All bits except the lowest', 'Always zero'], 0, "Two's complement makes -mask flip everything below the lowest set bit."],
  [['bit', 'constraints'], 1, 'n ≤ 20 in the constraints, and the problem is about subsets of items. Strong hint toward:', ['Bitmask DP or brute-force subset enumeration, O(2ⁿ · n)', 'O(n²) DP only', 'O(n log n) greedy', 'A single O(n) pass'], 0, '2²⁰ ≈ 10⁶ subsets is well within budget; larger n rules this out.'],
  [['backtracking'], 2, 'N-Queens: why track column AND both diagonal sets?', ['A queen attacks along its column and both diagonals, not just its row', 'Only the column matters', 'Diagonals are irrelevant to the queens problem', 'It is purely to save memory'], 0, 'One queen per row is guaranteed by the recursion; column and diagonal conflicts still need checking.'],
  [['backtracking'], 2, "N-Queens: all cells on the same '/' diagonal share a constant value of:", ['row + col', 'row - col', 'row · col', 'row alone'], 0, 'Moving one step along that diagonal increases row and decreases col by the same amount, or vice versa — their sum stays fixed.'],
  [['backtracking'], 2, "N-Queens: all cells on the same '\\' diagonal share a constant value of:", ['row - col', 'row + col', 'row · col', 'col alone'], 0, 'Along this diagonal row and col increase together, keeping their difference fixed.'],
  [['backtracking'], 1, 'Sudoku Solver: backtracking tries digits 1-9 in an empty cell and checks validity against:', ['Its row, column, and 3×3 box', 'Its row only', 'The whole board sorted', 'Nothing — brute force every full board'], 0, 'All three Sudoku constraints must hold simultaneously.'],
  [['backtracking', 'grid'], 2, 'Word Search on an m×n board: why restore board[r][c] after recursing?', ['A sibling call path may still need to pass through that same cell', 'Python requires undoing every mutation', 'It saves memory', 'It avoids index errors'], 0, 'The cell is only blocked for the current in-progress path, not for the whole search.'],
  [['backtracking'], 1, 'Combination Sum (numbers can repeat): the recursive call after taking nums[i] uses index:', ['i (stay, allowing reuse)', 'i + 1', 'i - 1', '0'], 0, 'Staying at i lets the same number be chosen again in the next step.'],
  [['backtracking'], 2, 'Combination Sum II (each number used once, duplicates in input): duplicate combinations are avoided by:', ['Sorting, then skipping nums[j] == nums[j-1] at the same recursion level', 'A global seen-set of result tuples', 'Removing duplicate values from the input first', 'This is only possible with DP'], 0, 'Skipping equal siblings at the same depth prevents generating the same combination twice.'],
  [['backtracking'], 1, 'Palindrome Partitioning (list every way to cut s so each piece is a palindrome): right paradigm?', ['Backtracking: try every cut point and recurse on the rest', '2-D DP that returns only a count', 'A greedy single pass', 'BFS over cut positions'], 0, 'Every valid partition must be enumerated, not just counted or checked for existence.'],
  [['backtracking'], 1, "Generate Parentheses with n pairs: add '(' while open < n, and add ')' while:", ['close < open', 'close < n', 'open < close', 'Always allowed'], 0, 'A closing bracket is only valid if an unmatched opening bracket is still pending.'],
  [['backtracking'], 1, 'Letter Combinations of a Phone Number: backtracking branches at each digit over:', ['The letters mapped to that digit (2-4 choices)', 'All 26 letters', 'Every previous digit\'s letters again', 'A single fixed letter'], 0, 'Each digit key maps to a small fixed set of letters on a phone keypad.'],
  [['backtracking', 'complexity'], 2, 'Backtracking time to generate all subsets of n items, each copied to the output:', ['O(n · 2ⁿ)', 'O(2ⁿ) only', 'O(n²)', 'O(n!)'], 0, '2ⁿ subsets, each costing up to O(n) to copy.'],
]

const mcqs = mcqRows.map(([skills, difficulty, q, choices, answer, why], i) => ({
  id: `bank-graphs-dp:dp:mcq:${i + 1}`,
  skills,
  difficulty,
  q,
  ...rotate(choices, answer, (i * 3 + 1) % 4),
  why,
}))

const clozeRows = [
  [['dp-1d'], 'Climbing Stairs bottom-up', `dp = [0] * (n + 1)
dp[0], dp[1] = 1, 1

for i in range(2, n + 1):
    dp[i] = dp[i - 1] + dp[[[i - 2|i-2]]]

return dp[[[n]]]`],
  [['dp-1d'], 'House Robber II (circular)', `def robLine(nums):
    prev, curr = 0, 0
    for num in nums:
        prev, curr = curr, max(curr, prev + num)
    return curr

return max(robLine(nums[1:]), robLine(nums[[[:-1]]])) if len(nums) > 1 else [[nums[0]]]`, 'Drop the last house in one run, the first in the other.'],
  [['dp-1d'], 'Decode Ways bottom-up', `dp = [0] * (len(s) + 1)
dp[len(s)] = 1
dp[len(s) - 1] = [[0 if s[-1] == "0" else 1]]

for i in range(len(s) - 2, -1, -1):
    if s[i] != "0":
        dp[i] += dp[i + [[1]]]
    if 10 <= int(s[i:i + 2]) <= 26:
        dp[i] += dp[i + [[2]]]

return dp[0]`],
  [['dp-1d'], 'Perfect Squares bottom-up', `dp = [0] + [math.inf] * n

for i in range(1, n + 1):
    j = 1
    while j * j <= i:
        dp[i] = [[min]](dp[i], 1 + dp[i - j * j])
        j [[+= 1]]

return dp[n]`],
  [['dp-2d'], '0/1 Knapsack, 1-D rolling array', `dp = [0] * (capacity + 1)

for weight, value in items:
    for c in range(capacity, weight - 1, [[-1]]):
        dp[c] = max(dp[c], dp[c - weight] + [[value]])

return dp[capacity]`, 'Backward loop: each item used at most once.'],
  [['dp-2d'], 'Partition Equal Subset Sum', `target = sum(nums) // 2
if sum(nums) % 2 != 0:
    return [[False]]

dp = [True] + [False] * target
for num in nums:
    for c in range(target, num - 1, -1):
        dp[c] = dp[c] or dp[c - [[num]]]

return dp[[[target]]]`],
  [['dp-2d'], 'Coin Change II: count combinations', `dp = [1] + [0] * amount

for coin in coins:
    for c in range(coin, amount + 1):
        dp[c] [[+= dp[c - coin]]]

return dp[amount]`, 'Coins outer loop: order never double-counted.'],
  [['dp-1d', 'binary-search'], 'LIS with bisect (patience sorting)', `tails = []

for num in nums:
    i = bisect.[[bisect_left]](tails, num)
    if i == len(tails):
        tails.append(num)
    else:
        tails[i] = [[num]]

return len(tails)`],
  [['dp-2d'], 'LCS bottom-up', `dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]

for i in range(len(a) - 1, -1, -1):
    for j in range(len(b) - 1, -1, -1):
        if a[i] == b[j]:
            dp[i][j] = 1 + dp[i + 1][j + [[1]]]
        else:
            dp[i][j] = [[max]](dp[i + 1][j], dp[i][j + 1])

return dp[0][0]`],
  [['dp-2d'], 'Edit Distance bottom-up', `dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
for j in range(len(b) + 1):
    dp[len(a)][j] = len(b) - j
for i in range(len(a) + 1):
    dp[i][len(b)] = len(a) - i

for i in range(len(a) - 1, -1, -1):
    for j in range(len(b) - 1, -1, -1):
        if a[i] == b[j]:
            dp[i][j] = dp[i + 1][j + 1]
        else:
            dp[i][j] = 1 + [[min]](dp[i + 1][j], dp[i][j + 1], dp[i + 1][j + [[1]]])

return dp[0][0]`],
  [['dp-2d'], 'Longest Palindromic Subsequence via LCS', `reversedS = s[::-1]
dp = [[0] * (len(s) + 1) for _ in range(len(s) + 1)]

for i in range(len(s) - 1, -1, -1):
    for j in range(len(s) - 1, -1, -1):
        if s[i] == reversedS[j]:
            dp[i][j] = 1 + dp[i + 1][j + 1]
        else:
            dp[i][j] = [[max]](dp[i + 1][j], dp[i][j + 1])

return dp[[[0]]][0]`],
  [['dp-2d'], 'Burst Balloons (interval DP)', `nums = [1] + nums + [1]
dp = [[0] * len(nums) for _ in range(len(nums))]

for length in range(2, len(nums)):
    for i in range(0, len(nums) - length):
        j = i + length
        for k in range(i + 1, j):
            dp[i][j] = max(dp[i][j], dp[i][k] + dp[k][j] + nums[i] * nums[k] * [[nums[j]]])

return dp[0][[[len(nums) - 1]]]`],
  [['dp-2d'], 'Palindrome Partitioning II with precomputed table', `isPal = [[True] * n for _ in range(n)]
for i in range(n - 1, -1, -1):
    for j in range(i + 1, n):
        isPal[i][j] = s[i] == s[j] and isPal[i + 1][[[j - 1]]]

dp = [0] * n
for i in range(n):
    if isPal[0][i]:
        dp[i] = 0
        continue
    dp[i] = min(dp[j] + 1 for j in range(i) if isPal[[[j + 1]]][i])

return dp[[[n - 1]]]`],
  [['dp-2d'], 'Matrix Chain Multiplication', `dp = [[0] * n for _ in range(n)]

for length in range(2, n):
    for i in range(n - length):
        j = i + length
        dp[i][j] = math.inf
        for k in range(i + 1, j):
            cost = dp[i][k] + dp[k][j] + dims[i] * dims[k] * [[dims[j]]]
            dp[i][j] = [[min]](dp[i][j], cost)`],
  [['dp-2d', 'bit'], 'TSP bitmask DP', `dp = {(1, 0): 0}

for mask in range(1, 1 << n):
    for last in range(n):
        if (mask, last) not in dp:
            continue
        for nxt in range(n):
            if mask & (1 << nxt):
                continue
            nmask = mask | (1 << [[nxt]])
            cand = dp[(mask, last)] + cost[last][nxt]
            dp[(nmask, nxt)] = min(dp.get((nmask, nxt), math.inf), [[cand]])`],
  [['dp-2d', 'bit'], 'Smallest Sufficient Team bitmask', `full = (1 << len(skills)) - 1
dp = {0: []}

for i, person in enumerate(people):
    mask = 0
    for skill in person:
        mask |= 1 << [[skillIndex[skill]]]
    for have, team in list(dp.items()):
        combined = have | mask
        if combined != have and (combined not in dp or len(dp[combined]) > len(team) + 1):
            dp[combined] = team + [[[i]]]

return dp[full]`],
  [['bit'], 'Bitmask: count set bits', `count = 0
while n:
    n &= n - [[1]]
    count [[+= 1]]`],
  [['backtracking'], 'N-Queens: column and diagonal tracking', `cols, posDiag, negDiag = set(), set(), set()

def backtrack(row):
    if row == n:
        result.append(["".join(r) for r in board])
        return
    for col in range(n):
        if col in cols or (row + col) in posDiag or (row - col) in [[negDiag]]:
            continue
        cols.add(col)
        posDiag.add(row + col)
        negDiag.add(row - col)
        board[row][col] = "Q"
        backtrack(row + 1)
        board[row][col] = "."
        cols.[[remove]](col)
        posDiag.remove(row + col)
        negDiag.remove(row - col)`],
  [['backtracking', 'grid'], 'Word Search DFS with restore', `def dfs(r, c, i):
    if i == len(word):
        return True
    if r < 0 or r >= rows or c < 0 or c >= cols or board[r][c] != word[i]:
        return False
    temp, board[r][c] = board[r][c], "#"
    found = any(dfs(r + dr, c + dc, i + 1) for dr, dc in directions)
    board[r][c] = [[temp]]
    return found`],
  [['backtracking'], 'Palindrome Partitioning backtracking', `def backtrack(start, path):
    if start == len(s):
        result.append(path[:])
        return
    for end in range(start + 1, len(s) + 1):
        piece = s[start:end]
        if piece == piece[::-1]:
            path.append(piece)
            backtrack([[end]], path)
            path.[[pop]]()`],
]

const clozes = clozeRows.map(([skills, title, code, hint], i) => ({
  id: `bank-graphs-dp:dp:cloze:${i + 1}`,
  skills,
  title,
  code,
  ...(hint ? { hint } : {}),
}))

const parsonsRows = [
  [['dp-1d'], 'Decode Ways bottom-up', [
    'def numDecodings(self, s: str) -> int:',
    '    dp = [0] * (len(s) + 1)',
    '    dp[len(s)] = 1',
    '    dp[len(s) - 1] = 0 if s[-1] == "0" else 1',
    '    for i in range(len(s) - 2, -1, -1):',
    '        if s[i] != "0":',
    '            dp[i] += dp[i + 1]',
    '        if 10 <= int(s[i:i + 2]) <= 26:',
    '            dp[i] += dp[i + 2]',
    '    return dp[0]',
  ], ['        dp[i] = dp[i + 1] + dp[i + 2]']],
  [['dp-1d'], 'Perfect Squares bottom-up', [
    'def numSquares(self, n: int) -> int:',
    '    dp = [0] + [math.inf] * n',
    '    for i in range(1, n + 1):',
    '        j = 1',
    '        while j * j <= i:',
    '            dp[i] = min(dp[i], 1 + dp[i - j * j])',
    '            j += 1',
    '    return dp[n]',
  ], ['            dp[i] = min(dp[i], dp[i - j * j])']],
  [['dp-2d'], '0/1 Knapsack, 1-D rolling array', [
    'def knapsack(weights, values, capacity):',
    '    dp = [0] * (capacity + 1)',
    '    for weight, value in zip(weights, values):',
    '        for c in range(capacity, weight - 1, -1):',
    '            dp[c] = max(dp[c], dp[c - weight] + value)',
    '    return dp[capacity]',
  ], ['        for c in range(weight, capacity + 1):']],
  [['dp-2d'], 'Partition Equal Subset Sum', [
    'def canPartition(self, nums: List[int]) -> bool:',
    '    total = sum(nums)',
    '    if total % 2 != 0:',
    '        return False',
    '    target = total // 2',
    '    dp = [True] + [False] * target',
    '    for num in nums:',
    '        for c in range(target, num - 1, -1):',
    '            dp[c] = dp[c] or dp[c - num]',
    '    return dp[target]',
  ], ['        for c in range(num, target + 1):']],
  [['dp-2d'], 'LCS bottom-up', [
    'def longestCommonSubsequence(self, text1: str, text2: str) -> int:',
    '    dp = [[0] * (len(text2) + 1) for _ in range(len(text1) + 1)]',
    '    for i in range(len(text1) - 1, -1, -1):',
    '        for j in range(len(text2) - 1, -1, -1):',
    '            if text1[i] == text2[j]:',
    '                dp[i][j] = 1 + dp[i + 1][j + 1]',
    '            else:',
    '                dp[i][j] = max(dp[i + 1][j], dp[i][j + 1])',
    '    return dp[0][0]',
  ], ['                dp[i][j] = dp[i + 1][j] + dp[i][j + 1]']],
  [['dp-2d'], 'Edit Distance bottom-up', [
    'def minDistance(self, word1: str, word2: str) -> int:',
    '    m, n = len(word1), len(word2)',
    '    dp = [[0] * (n + 1) for _ in range(m + 1)]',
    '    for j in range(n + 1):',
    '        dp[m][j] = n - j',
    '    for i in range(m + 1):',
    '        dp[i][n] = m - i',
    '    for i in range(m - 1, -1, -1):',
    '        for j in range(n - 1, -1, -1):',
    '            if word1[i] == word2[j]:',
    '                dp[i][j] = dp[i + 1][j + 1]',
    '            else:',
    '                dp[i][j] = 1 + min(dp[i + 1][j], dp[i][j + 1], dp[i + 1][j + 1])',
    '    return dp[0][0]',
  ], ['                dp[i][j] = 1 + dp[i + 1][j + 1]']],
  [['dp-2d'], 'Burst Balloons', [
    'def maxCoins(self, nums: List[int]) -> int:',
    '    nums = [1] + nums + [1]',
    '    n = len(nums)',
    '    dp = [[0] * n for _ in range(n)]',
    '    for length in range(2, n):',
    '        for i in range(n - length):',
    '            j = i + length',
    '            for k in range(i + 1, j):',
    '                dp[i][j] = max(dp[i][j], dp[i][k] + dp[k][j] + nums[i] * nums[k] * nums[j])',
    '    return dp[0][n - 1]',
  ], ['                dp[i][j] = dp[i][k] + dp[k][j]']],
  [['dp-2d'], 'Palindrome Partitioning II', [
    'def minCut(self, s: str) -> int:',
    '    n = len(s)',
    '    isPal = [[True] * n for _ in range(n)]',
    '    for i in range(n - 1, -1, -1):',
    '        for j in range(i + 1, n):',
    '            isPal[i][j] = s[i] == s[j] and isPal[i + 1][j - 1]',
    '    dp = [0] * n',
    '    for i in range(n):',
    '        if isPal[0][i]:',
    '            dp[i] = 0',
    '            continue',
    '        dp[i] = min(dp[j] + 1 for j in range(i) if isPal[j + 1][i])',
    '    return dp[n - 1]',
  ], ['        dp[i] = min(dp[j] for j in range(i) if isPal[j + 1][i])']],
  [['dp-2d', 'bit'], 'Traveling Salesman bitmask DP', [
    'def tsp(n, cost):',
    '    full = (1 << n) - 1',
    '    dp = {(1, 0): 0}',
    '    for mask in range(1, 1 << n):',
    '        for last in range(n):',
    '            if (mask, last) not in dp:',
    '                continue',
    '            for nxt in range(n):',
    '                if mask & (1 << nxt):',
    '                    continue',
    '                nmask = mask | (1 << nxt)',
    '                cand = dp[(mask, last)] + cost[last][nxt]',
    '                dp[(nmask, nxt)] = min(dp.get((nmask, nxt), math.inf), cand)',
    '    return min(dp[(full, last)] + cost[last][0] for last in range(n))',
  ], ['                nmask = mask & (1 << nxt)']],
  [['bit'], 'Subsets via bitmask iteration', [
    'def subsets(self, nums: List[int]) -> List[List[int]]:',
    '    n = len(nums)',
    '    result = []',
    '    for mask in range(1 << n):',
    '        subset = []',
    '        for i in range(n):',
    '            if mask & (1 << i):',
    '                subset.append(nums[i])',
    '        result.append(subset)',
    '    return result',
  ], ['            if mask | (1 << i):']],
  [['backtracking'], 'N-Queens', [
    'def solveNQueens(self, n: int) -> List[List[str]]:',
    '    cols, posDiag, negDiag = set(), set(), set()',
    '    board = [["."] * n for _ in range(n)]',
    '    result = []',
    '    def backtrack(row):',
    '        if row == n:',
    '            result.append(["".join(r) for r in board])',
    '            return',
    '        for col in range(n):',
    '            if col in cols or (row + col) in posDiag or (row - col) in negDiag:',
    '                continue',
    '            cols.add(col)',
    '            posDiag.add(row + col)',
    '            negDiag.add(row - col)',
    '            board[row][col] = "Q"',
    '            backtrack(row + 1)',
    '            board[row][col] = "."',
    '            cols.remove(col)',
    '            posDiag.remove(row + col)',
    '            negDiag.remove(row - col)',
    '    backtrack(0)',
    '    return result',
  ], ['            if col in cols:']],
  [['backtracking'], 'Palindrome Partitioning backtracking', [
    'def partition(self, s: str) -> List[List[str]]:',
    '    result = []',
    '    def backtrack(start, path):',
    '        if start == len(s):',
    '            result.append(path[:])',
    '            return',
    '        for end in range(start + 1, len(s) + 1):',
    '            piece = s[start:end]',
    '            if piece == piece[::-1]:',
    '                path.append(piece)',
    '                backtrack(end, path)',
    '                path.pop()',
    '    backtrack(0, [])',
    '    return result',
  ], ['                backtrack(start, path)']],
]

const parsons = parsonsRows.map(([skills, title, lines, distractors], i) => ({
  id: `bank-graphs-dp:dp:parsons:${i + 1}`,
  skills,
  title,
  lines,
  ...(distractors ? { distractors } : {}),
}))

const flashcardData = [
  [['trie'], 'Trie vs sorted array for prefix queries?', 'Binary search on a sorted array finds the prefix range in O(m log n) with little memory. A trie costs O(m) per query but spends memory on nodes.'],
  [['dp-1d'], 'House Robber II circular trick?', 'Run linear House Robber twice: once excluding the first house, once excluding the last. Take the max.'],
  [['dp-1d'], 'Decode Ways: why fill dp from the END of the string backward?', 'dp[i] depends on dp[i+1] and dp[i+2], which must already be computed.'],
  [['dp-1d'], 'Perfect Squares recurrence?', 'dp[i] = 1 + min(dp[i - j·j]) over every j with j·j ≤ i. Base case dp[0] = 0.'],
  [['dp-1d'], 'Why can many 1-D DPs drop to O(1) space?', 'If dp[i] only reads the last one or two cells, keep rolling variables instead of a full array.'],
  [['dp-1d'], 'Top-down vs. bottom-up DP tradeoff?', 'Top-down (recursion + @cache) is easier to derive; bottom-up avoids recursion limits and makes space cuts obvious.'],
  [['dp-1d'], 'Word Break transition?', 'dp[i] = True if some dictionary word matches s[i:i+len(word)] and dp[i + len(word)] is also True.'],
  [['dp-2d'], '0/1 knapsack 1-D space trick?', 'Loop capacity backward so dp[c - weight] still reflects the PREVIOUS item\'s row, preventing reuse.'],
  [['dp-2d'], 'Unbounded knapsack 1-D space trick?', 'Loop capacity forward, so an item\'s own update can feed back into itself (reuse allowed).'],
  [['dp-2d'], 'Partition Equal Subset Sum reduces to?', '0/1 knapsack: can a subset of nums sum to exactly total / 2? An odd total means immediate False.'],
  [['dp-2d'], 'Target Sum (assign + or -) reframes to?', 'Subset sum: find a subset summing to (total + target) / 2 to receive the "+" sign; the rest get "-".'],
  [['dp-2d', 'complexity'], '0/1 knapsack 2-D table dimensions and cost?', '(n+1) × (capacity+1) cells, O(n · capacity) time and space.'],
  [['dp-2d'], 'Coin Change II: coins outer loop vs. amount outer loop?', 'Coins outer counts combinations (order-free); amount outer counts permutations (order matters).'],
  [['dp-1d', 'binary-search'], 'LIS patience-sorting trick?', 'Keep a tails array of the smallest possible tail per length; bisect_left finds where to extend or replace. len(tails) is the answer.'],
  [['dp-2d'], 'LCS recurrence on a match?', 'dp[i][j] = 1 + dp[i+1][j+1] — both pointers advance together.'],
  [['dp-2d'], 'LCS recurrence on a mismatch?', 'dp[i][j] = max(dp[i+1][j], dp[i][j+1]) — drop one character from either string.'],
  [['mst'], 'Minimum bottleneck path between two nodes?', 'Build the MST. The path between them in the MST has the smallest possible maximum edge.'],
  [['dp-2d'], 'Longest Common Substring vs. LCS mismatch rule?', 'Substring resets dp[i][j] to 0 on a mismatch; subsequence instead takes the max of its neighbors.'],
  [['dp-2d'], 'Longest Palindromic Subsequence via LCS?', 'LPS(s) = LCS(s, reverse(s)).'],
  [['dp-2d'], 'Shortest Common Supersequence length formula?', 'len(a) + len(b) - LCS(a, b).'],
  [['dp-2d'], 'Interval DP fill order?', 'By increasing interval length (gap), so every smaller subinterval is already solved.'],
  [['dp-2d'], 'Burst Balloons key trick?', 'Think of k as the LAST balloon burst in (i, j), not the first — its neighbors at burst time are still exactly i and j.'],
  [['dp-2d'], 'Matrix Chain Multiplication recurrence?', 'dp[i][j] = min over split k of dp[i][k] + dp[k+1][j] + the cost of multiplying the two resulting matrices.'],
  [['dp-2d'], 'Palindrome Partitioning II speedup?', 'Precompute isPalindrome[i][j] for every substring in O(n²), so each cut-count transition is O(1).'],
  [['dp-2d'], 'Minimum Cost to Merge Stones feasibility check?', '(n - 1) must be divisible by (k - 1), or merging down to one pile is impossible.'],
  [['dp-2d', 'complexity'], 'Interval DP time complexity, typically?', 'O(n³): O(n²) intervals times an O(n) split-point search.'],
  [['dp-2d', 'bit'], 'Bitmask DP state for TSP?', 'dp[mask][i] = cheapest cost to have visited exactly the cities in mask, ending at city i.'],
  [['dp-2d', 'bit', 'complexity'], 'TSP bitmask DP complexity?', 'O(n² · 2ⁿ): 2ⁿ masks, n possible last cities, n possible next cities.'],
  [['bit', 'constraints'], 'n ≤ ~20 and the problem is about subsets. Hint toward?', 'Bitmask DP or brute-force subset enumeration, O(2ⁿ · n).'],
  [['bit'], 'mask & (mask - 1) does what?', 'Clears the lowest set bit — used to iterate over subsets or count set bits.'],
  [['bit'], 'mask & -mask isolates?', 'The lowest set bit alone, as its own bitmask value.'],
  [['dp-2d', 'bit'], 'Smallest Sufficient Team bitmask idea?', 'dp[skillMask] = smallest list of people whose combined skills cover skillMask; update by OR-ing in each person\'s skill mask.'],
  [['backtracking'], 'Backtracking template in three steps?', 'Choose (mutate state), explore (recurse), unchoose (undo the mutation) before trying the next option.'],
  [['backtracking'], 'N-Queens diagonal identities?', '"/" diagonal: row + col is constant. "\\" diagonal: row − col is constant.'],
  [['backtracking', 'grid'], 'Word Search: why restore the board cell after recursing?', 'Other call paths may still need to pass through that same cell.'],
  [['backtracking'], 'Combination Sum vs. Combination Sum II, index after taking an element?', 'Sum (reuse allowed): recurse at the same index i. Sum II (each used once): recurse at i + 1.'],
  [['backtracking'], 'Generate Parentheses placement rules?', 'Add "(" while open < n. Add ")" while close < open.'],
  [['backtracking', 'complexity'], 'Backtracking space, excluding the output?', 'O(depth), usually O(n) for the recursion stack and the current partial path.'],
]

const flashcards = flashcardData.map(([skills, front, back, code], i) => ({
  id: `bank-graphs-dp:dp:card:${i + 1}`,
  skills,
  front,
  back,
  ...(code ? { code } : {}),
}))

const problems = [
  {
    id: 'bank-graphs-dp:problem:174', lc: 174, title: 'Dungeon Game', difficulty: 'Hard',
    skills: ['dp-2d', 'grid'], pattern: 'Dynamic programming: reverse grid DP (min health needed)', ds: ['dp table'],
    constraints: '1 ≤ m, n ≤ 200, cells in [-1000, 1000], only move right or down, health must stay ≥ 1', time: 'O(m · n)', space: 'O(m · n)',
    insight: 'Going forward you cannot know how much health you need later, so work backward: need[r][c] is the least health required on entering the cell.',
    signals: ['health must never drop to 0', 'minimum initial health', 'path from top-left to bottom-right'],
    narration: ['need[r][c] = max(1, min(need[r+1][c], need[r][c+1]) - dungeon[r][c]).', 'Pad with infinity outside the grid, but 1 just past the princess.', 'Fill from the bottom-right to the top-left.', 'need[0][0] is the answer.'],
    solution: `class Solution:
    def calculateMinimumHP(self, dungeon):
        rows, cols = len(dungeon), len(dungeon[0])
        need = [[float('inf')] * (cols + 1) for _ in range(rows + 1)]
        need[rows][cols - 1] = need[rows - 1][cols] = 1
        for r in range(rows - 1, -1, -1):
            for c in range(cols - 1, -1, -1):
                best = min(need[r + 1][c], need[r][c + 1])
                need[r][c] = max(1, best - dungeon[r][c])
        return need[0][0]`,
    companies: ['amazon', 'microsoft'],
    pitfalls: ['A forward DP of max health along a path ignores dips below 1 midway', 'Forgetting max(1, ...) lets the required health go to zero or below'],
  },
  {
    id: 'bank-graphs-dp:problem:329', lc: 329, title: 'Longest Increasing Path in a Matrix', difficulty: 'Hard',
    skills: ['dp-2d', 'graph-dfs', 'grid'], pattern: 'Dynamic programming: memoized grid DFS', ds: ['grid', 'recursion stack'],
    constraints: '1 ≤ m, n ≤ 200, move in 4 directions, strictly increasing values', time: 'O(m · n)', space: 'O(m · n)',
    insight: 'Strictly increasing means no cycles, so the longest path from a cell depends only on larger neighbors and can be cached.',
    signals: ['longest strictly increasing path', 'move in four directions', 'no repeated cells possible'],
    narration: ['dfs(r, c) = 1 + max(dfs(neighbor)) over strictly larger neighbors.', 'Cache each result in memo so every cell is solved once.', 'No visited set needed: increasing paths cannot loop.', 'Answer is the max over all start cells.'],
    solution: `class Solution:
    def longestIncreasingPath(self, matrix):
        rows, cols = len(matrix), len(matrix[0])
        memo = {}

        def dfs(r, c):
            if (r, c) in memo:
                return memo[(r, c)]
            best = 1
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and matrix[nr][nc] > matrix[r][c]:
                    best = max(best, 1 + dfs(nr, nc))
            memo[(r, c)] = best
            return best

        return max(dfs(r, c) for r in range(rows) for c in range(cols))`,
    pitfalls: ['Plain DFS without a memo is exponential', 'Deep paths can exceed the default Python recursion limit, raise it or go bottom-up by sorted value'],
  },
  {
    id: 'bank-graphs-dp:problem:10', lc: 10, title: 'Regular Expression Matching', difficulty: 'Hard',
    skills: ['dp-2d'], pattern: 'Dynamic programming: 2-D over (s, p) with star', ds: ['dp table'],
    constraints: '1 ≤ s.length ≤ 20, 1 ≤ p.length ≤ 20, "." matches any one char, "*" repeats the previous element 0 or more times', time: 'O(m · n)', space: 'O(m · n)',
    insight: 'dp[i][j] says whether s[:i] matches p[:j]; a star either drops its element (dp[i][j-2]) or consumes one more matching char (dp[i-1][j]).',
    signals: ['pattern with . and *', 'match the entire string', 'star applies to the previous character'],
    narration: ['dp[0][0] = True; a leading "x*" can match empty, so dp[0][j] = dp[0][j-2] for stars.', 'Normal char: dp[i][j] = dp[i-1][j-1] and chars match (or "." ).', 'Star: zero uses = dp[i][j-2]; one more use needs p[j-2] to match s[i-1] and dp[i-1][j].', 'Answer is dp[m][n].'],
    solution: `class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        m, n = len(s), len(p)
        dp = [[False] * (n + 1) for _ in range(m + 1)]
        dp[0][0] = True
        for j in range(2, n + 1):
            if p[j - 1] == '*':
                dp[0][j] = dp[0][j - 2]
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if p[j - 1] == '*':
                    dp[i][j] = dp[i][j - 2]
                    if p[j - 2] == '.' or p[j - 2] == s[i - 1]:
                        dp[i][j] = dp[i][j] or dp[i - 1][j]
                else:
                    dp[i][j] = dp[i - 1][j - 1] and (p[j - 1] == '.' or p[j - 1] == s[i - 1])
        return dp[m][n]`,
    pitfalls: ['Treating "*" as a wildcard for any string, it only repeats the one element before it', 'Forgetting the empty-string row, so patterns like "a*b*" fail against ""'],
  },
  {
    id: 'bank-graphs-dp:problem:1277', lc: 1277, title: 'Count Square Submatrices with All Ones', difficulty: 'Medium',
    skills: ['dp-2d', 'grid'], pattern: 'Dynamic programming: min of three neighbors + 1', ds: ['matrix'],
    constraints: '1 ≤ m, n ≤ 300, cells are 0 or 1', time: 'O(m · n)', space: 'O(1) extra',
    insight: 'dp[r][c] is the side of the largest all-ones square ending there, and it also counts how many squares end at that cell.',
    signals: ['count all square submatrices of ones', 'bottom-right corner anchored', 'binary matrix'],
    narration: ['For a 1 not on the first row or column, dp = 1 + min(up, left, up-left).', 'That value is the largest square ending here, which equals the number of squares ending here.', 'Sum dp over the whole grid.'],
    solution: `class Solution:
    def countSquares(self, matrix):
        rows, cols = len(matrix), len(matrix[0])
        total = 0
        for r in range(rows):
            for c in range(cols):
                if matrix[r][c] and r and c:
                    matrix[r][c] = 1 + min(matrix[r - 1][c], matrix[r][c - 1], matrix[r - 1][c - 1])
                total += matrix[r][c]
        return total`,
    companies: ['google', 'amazon'],
    pitfalls: ['Using max of the neighbors instead of min builds squares with holes', 'Counting only the largest square, not every size ending at the cell'],
  },
]

export default { mcqs, clozes, parsons, flashcards, problems }
