const items = [
  {
    id: 'thought:backtracking-greedy:subsets',
    lc: 78,
    title: 'Subsets',
    difficulty: 'Medium',
    category: 'backtracking-greedy',
    skills: ['backtracking'],
    companies: ['amazon', 'google', 'meta', 'microsoft'],
    statement: `Given an integer array of unique elements, return every possible subset (the power set), including the empty subset and the full array itself.

The elements are distinct, so you don't need to worry about duplicate subsets showing up.

Order of subsets in the result and order of elements within each subset don't matter.`,
    examples: [
      { input: 'nums = [1,2,3]', output: '[[],[1],[2],[3],[1,2],[1,3],[2,3],[1,2,3]]' },
      { input: 'nums = [0]', output: '[[],[0]]' },
    ],
    constraints: ['1 <= nums.length <= 10', '-10 <= nums[i] <= 10', 'all elements are unique'],
    ds: {
      answer: 'backtracking with a shared path list, snapshot on every call',
      choices: ['backtracking with a shared path list, snapshot on every call', 'bitmask over n positions, one integer per subset', 'BFS queue of partial subsets, level by level', 'iterative doubling: for each num, double every existing subset with and without it'],
    },
    method: {
      answer: "Backtrack over 'start' index: ==record the current path as a subset at every call==, then for each remaining index append it, recurse, and ==pop it back off after returning==",
      choices: [
        "Backtrack over 'start' index: ==record the current path as a subset at every call==, then for each remaining index append it, recurse, and ==pop it back off after returning==",
        'Only record the path as a subset once the path reaches the full array length, skipping every shorter subset',
        'Bitmask every integer from 0 to 2^n - 1, and build a subset from whichever bits are set in that integer',
        'BFS level by level, expanding every existing subset in the queue by one more element per level',
      ],
    },
    code: `class Solution:
    def subsets(self, nums: List[int]) -> List[List[int]]:
        result = []
        path = []

        def backtrack(start):
            result.append(path[:])

            for i in range(start, len(nums)):
                path.append(nums[i])
                backtrack(i + 1)
                path.pop()

        backtrack(0)
        return result`,
    blanks: [6, 9, 11],
    time: { answer: 'O(n * 2^n)', choices: ['O(n * 2^n)', 'O(2^n)', 'O(n^2)', 'O(n!)'], why: '2^n subsets total, each snapshot costs O(n) to copy' },
    space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(2^n)', 'O(n^2)'], why: 'recursion depth and the shared path list are both bounded by n, ignoring the output' },
    sayIt: "Backtrack on 'start': ==snapshot path into result at every call==, then try including each remaining element, ==undo with path.pop() after recursing==. O(n*2^n) time.",
    pitfall: 'Recording the subset at every call, not just at the leaves — every prefix is itself a valid subset.',
  },
  {
    id: 'thought:backtracking-greedy:subsets-ii',
    lc: 90,
    title: 'Subsets II',
    difficulty: 'Medium',
    category: 'backtracking-greedy',
    skills: ['backtracking'],
    companies: ['amazon', 'meta'],
    statement: `Given an integer array that may contain duplicates, return every possible subset (the power set), with no duplicate subsets in the result.

Sorting the array first groups equal values together, which makes it possible to skip over a duplicate value at the same recursion depth before it ever gets used.

Both the subsets and the elements within each subset can be returned in any order.`,
    examples: [
      { input: 'nums = [1,2,2]', output: '[[],[1],[1,2],[1,2,2],[2],[2,2]]' },
      { input: 'nums = [0]', output: '[[],[0]]' },
    ],
    constraints: ['1 <= nums.length <= 10', '-10 <= nums[i] <= 10'],
    ds: {
      answer: 'sort first, then backtracking that skips repeats at the same depth',
      choices: ['sort first, then backtracking that skips repeats at the same depth', 'set of tuples to dedupe subsets after generating all of them unsorted', 'bitmask over n positions, deduping identical bitmasks after the fact', 'Counter of value frequencies, generating subsets from 0..count of each value'],
    },
    method: {
      answer: "Same subsets backtracking, plus one dedup rule: ==sort nums first, then at each recursion depth skip nums[i] if it equals nums[i-1] and i is not the first choice at this depth==",
      choices: [
        "Same subsets backtracking, plus one dedup rule: ==sort nums first, then at each recursion depth skip nums[i] if it equals nums[i-1] and i is not the first choice at this depth==",
        'Generate every subset exactly like the no-duplicates version, then dedupe the final result list by converting each subset to a sorted tuple and using a set',
        'Skip nums[i] whenever it equals nums[i-1] anywhere in the array, regardless of recursion depth or position',
        'Use a Counter of each distinct value\'s frequency, and never sort nums at all before recursing',
      ],
    },
    code: `class Solution:
    def subsetsWithDup(self, nums: List[int]) -> List[List[int]]:
        nums.sort()
        result = []
        path = []

        def backtrack(start):
            result.append(path[:])

            for i in range(start, len(nums)):
                if i > start and nums[i] == nums[i - 1]:
                    continue
                path.append(nums[i])
                backtrack(i + 1)
                path.pop()

        backtrack(0)
        return result`,
    blanks: [10, 12, 14],
    time: { answer: 'O(n * 2^n)', choices: ['O(n * 2^n)', 'O(2^n)', 'O(n log n)', 'O(n^2 * 2^n)'], why: 'same subset explosion as the no-duplicates version, plus an O(n log n) sort up front' },
    space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(2^n)', 'O(n log n)'], why: 'recursion depth and path list are bounded by n, ignoring the output' },
    sayIt: "Sort first so equal values sit together. Same backtracking as plain subsets, but ==skip nums[i] == nums[i-1] when i isn't the first pick at this depth== to avoid duplicate subsets.",
    pitfall: 'The skip condition is `i > start`, not `i > 0` — duplicates are only a problem at the same recursion depth, not globally.',
  },
  {
    id: 'thought:backtracking-greedy:combination-sum',
    lc: 39,
    title: 'Combination Sum',
    difficulty: 'Medium',
    category: 'backtracking-greedy',
    skills: ['backtracking'],
    companies: ['amazon', 'google', 'meta'],
    statement: `Given an array of distinct positive integers and a target, return every unique combination of numbers that sum to exactly target. The same number can be reused an unlimited number of times.

Two combinations are considered the same if they use the same numbers in any order (sorted comparison), so each valid multiset should appear only once in the result.

Since numbers can repeat, the recursion needs a way to "stay at the same index" instead of always moving forward, while still eventually making progress toward the target.`,
    examples: [
      { input: 'candidates = [2,3,6,7], target = 7', output: '[[2,2,3],[7]]' },
      { input: 'candidates = [2,3,5], target = 8', output: '[[2,2,2,2],[2,3,3],[3,5]]' },
    ],
    constraints: ['1 <= candidates.length <= 30', '2 <= candidates[i] <= 40', 'all candidates are distinct', '1 <= target <= 40'],
    ds: {
      answer: 'backtracking with a remaining-target counter, path list of chosen numbers',
      choices: ['backtracking with a remaining-target counter, path list of chosen numbers', 'bottom-up DP table of (index, remaining amount) booleans, no path reconstruction', 'BFS queue of partial sums, expanding by one candidate per level', 'bitmask over candidates, enumerating every subset and checking sums'],
    },
    method: {
      answer: "Backtrack with reuse: at each candidate index, ==try including candidates[i] and recurse on the SAME index i (not i+1)== since reuse is allowed, subtracting it from the remaining target, and stop a branch once remain hits 0 or goes negative",
      choices: [
        "Backtrack with reuse: at each candidate index, ==try including candidates[i] and recurse on the SAME index i (not i+1)== since reuse is allowed, subtracting it from the remaining target, and stop a branch once remain hits 0 or goes negative",
        'Backtrack like a normal subset search, always recursing on i + 1 so every candidate is used at most once per combination',
        'Greedily sort candidates descending and repeatedly subtract the largest candidate that still fits, backtracking only when none fit',
        'Bottom-up DP filling a table of booleans for every (index, remaining amount) pair, with no mechanism to recover which numbers were used',
      ],
    },
    code: `class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        result = []
        path = []

        def backtrack(start, remain):
            if remain == 0:
                result.append(path[:])
                return
            if remain < 0:
                return

            for i in range(start, len(candidates)):
                path.append(candidates[i])
                backtrack(i, remain - candidates[i])
                path.pop()

        backtrack(0, target)
        return result`,
    blanks: [13, 14, 15],
    time: { answer: 'O(2^target)', choices: ['O(2^target)', 'O(target * n)', 'O(n^target)', 'O(n log n)'], why: 'at each remaining amount the recursion can branch across every candidate, bounded by how deep target allows' },
    space: { answer: 'O(target / min(candidates))', choices: ['O(target / min(candidates))', 'O(1)', 'O(n)', 'O(target)'], why: 'recursion depth is bounded by how many times the smallest candidate can be subtracted from target' },
    sayIt: "Backtrack on (start, remain): ==recurse on the same index i to allow reuse==, subtracting candidates[i] from remain each time, record a combo when remain hits exactly 0.",
    pitfall: 'Recursing on `i`, not `i + 1` — moving to i + 1 would silently forbid reusing the same number.',
  },
  {
    id: 'thought:backtracking-greedy:combination-sum-ii',
    lc: 40,
    title: 'Combination Sum II',
    difficulty: 'Medium',
    category: 'backtracking-greedy',
    skills: ['backtracking'],
    companies: ['amazon', 'meta'],
    statement: `Given a collection of candidate numbers that may contain duplicates, and a target, return every unique combination that sums to target. Unlike Combination Sum I, each number may only be used once per combination.

Duplicate combinations in the result are not allowed, even though the input array itself can have repeated values.

Sort the candidates first: it groups duplicates together (for the same skip trick as Subsets II) and lets you break out of the loop early the moment a candidate alone would overshoot the remaining target.`,
    examples: [
      { input: 'candidates = [10,1,2,7,6,1,5], target = 8', output: '[[1,1,6],[1,2,5],[1,7],[2,6]]' },
      { input: 'candidates = [2,5,2,1,2], target = 5', output: '[[1,2,2],[5]]' },
    ],
    constraints: ['1 <= candidates.length <= 100', '1 <= candidates[i] <= 50', '1 <= target <= 30'],
    ds: {
      answer: 'sorted candidates + backtracking that skips same-depth duplicates and prunes early',
      choices: ['sorted candidates + backtracking that skips same-depth duplicates and prunes early', 'Counter of candidate frequencies, generating combinations from 0..count of each distinct value with no sort', 'bottom-up DP table of (index, remaining) with no duplicate handling', 'unsorted backtracking identical to Combination Sum I, deduping the final result with a set of sorted tuples'],
    },
    method: {
      answer: "Backtrack with no-reuse plus dedup: sort first, ==skip candidates[i] at the same depth if it matches candidates[i-1]==, ==break out of the loop the moment candidates[i] exceeds remain== (nothing later can fit either since sorted), and always recurse on i + 1",
      choices: [
        "Backtrack with no-reuse plus dedup: sort first, ==skip candidates[i] at the same depth if it matches candidates[i-1]==, ==break out of the loop the moment candidates[i] exceeds remain== (nothing later can fit either since sorted), and always recurse on i + 1",
        'Backtrack exactly like Combination Sum I (recursing on the same index i), then dedupe the final combinations list with a set of sorted tuples',
        'Skip any candidate value that has appeared anywhere earlier in the whole array, not just at the current recursion depth',
        'Continue scanning every remaining candidate even after one exceeds remain, since a later duplicate might still coincidentally fit',
      ],
    },
    code: `class Solution:
    def combinationSum2(self, candidates: List[int], target: int) -> List[List[int]]:
        candidates.sort()
        result = []
        path = []

        def backtrack(start, remain):
            if remain == 0:
                result.append(path[:])
                return

            for i in range(start, len(candidates)):
                if i > start and candidates[i] == candidates[i - 1]:
                    continue
                if candidates[i] > remain:
                    break
                path.append(candidates[i])
                backtrack(i + 1, remain - candidates[i])
                path.pop()

        backtrack(0, target)
        return result`,
    blanks: [12, 15, 17],
    time: { answer: 'O(2^n)', choices: ['O(2^n)', 'O(n log n)', 'O(n * target)', 'O(n!)'], why: 'each of n candidates is either picked or skipped before the sort-based pruning kicks in, plus O(n log n) to sort' },
    space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(2^n)', 'O(target)'], why: 'recursion depth and path are bounded by n candidates, ignoring the output' },
    sayIt: "Sort first. ==Skip a duplicate candidate at the same depth==, ==break once a candidate alone exceeds remain== (sorted, so nothing later fits), recurse on i+1 since each number is used at most once.",
    pitfall: 'The duplicate-skip check is `i > start`, scoped to the current recursion depth — not a global \"seen this value before\" check.',
  },
  {
    id: 'thought:backtracking-greedy:permutations',
    lc: 46,
    title: 'Permutations',
    difficulty: 'Medium',
    category: 'backtracking-greedy',
    skills: ['backtracking'],
    companies: ['amazon', 'microsoft', 'meta', 'google'],
    statement: `Given an array of distinct integers, return every possible permutation (every reordering of all the elements), in any order.

Every permutation must use every element exactly once, just in a different arrangement.

You'll need to track which elements are already placed in the current path, since (unlike subsets) you can revisit earlier indices as long as that value hasn't been used yet in this particular arrangement.`,
    examples: [
      { input: 'nums = [1,2,3]', output: '[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]' },
      { input: 'nums = [0,1]', output: '[[0,1],[1,0]]' },
    ],
    constraints: ['1 <= nums.length <= 6', 'all elements are unique'],
    ds: {
      answer: 'backtracking with a boolean used[] array + path list',
      choices: ['backtracking with a boolean used[] array + path list', 'swap-in-place backtracking over the original array, no extra array', 'bitmask of used indices, bit i set once index i is placed', 'queue of partial permutations, extended by one element per BFS level'],
    },
    method: {
      answer: "Backtrack by position: at each of n positions, try ==every unused index, mark it used==, append its value, recurse, then on return ==unmark it (used[i] = False) so other branches can use it==",
      choices: [
        "Backtrack by position: at each of n positions, try ==every unused index, mark it used==, append its value, recurse, then on return ==unmark it (used[i] = False) so other branches can use it==",
        'Backtrack by position, marking an index used but never unmarking it, relying on a fresh used array being passed into each recursive call instead',
        'Swap nums[start] with nums[i] for each i from start onward, recurse on start + 1, but skip swapping back after the recursive call returns',
        'Generate all n! permutations with Python\'s itertools.permutations and immediately return the first one found without checking length',
      ],
    },
    code: `class Solution:
    def permute(self, nums: List[int]) -> List[List[int]]:
        result = []
        path = []
        used = [False] * len(nums)

        def backtrack():
            if len(path) == len(nums):
                result.append(path[:])
                return

            for i in range(len(nums)):
                if used[i]:
                    continue
                used[i] = True
                path.append(nums[i])
                backtrack()
                path.pop()
                used[i] = False

        backtrack()
        return result`,
    blanks: [14, 15, 18],
    time: { answer: 'O(n * n!)', choices: ['O(n * n!)', 'O(n!)', 'O(n^2)', 'O(2^n)'], why: 'n! permutations total, each snapshot costs O(n) to copy into the result' },
    space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(n!)', 'O(n^2)'], why: 'recursion depth, path, and the used[] array are all bounded by n, ignoring the output' },
    sayIt: "Backtrack by position: ==mark an unused index used, append its value==, recurse, then on the way back ==unmark it so later branches can reuse that index==. O(n * n!) time.",
    pitfall: 'Forgetting `used[i] = False` on the way back out — without it, every index gets locked after its first use.',
  },
  {
    id: 'thought:backtracking-greedy:word-search',
    lc: 79,
    title: 'Word Search',
    difficulty: 'Medium',
    category: 'backtracking-greedy',
    skills: ['backtracking', 'grid'],
    companies: ['amazon', 'microsoft', 'bloomberg', 'meta'],
    statement: `Given an m x n grid of letters and a word, determine if the word can be constructed from letters that are sequentially adjacent (up, down, left, right), where the same cell can't be used more than once within a single word.

Try starting the search from every cell in the grid, since the word could begin anywhere.

While exploring a path, temporarily mark the current cell as visited (so you don't reuse it), then restore it before trying a different direction or backtracking to an earlier cell.`,
    examples: [
      { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"', output: 'true' },
      { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCB"', output: 'false', explanation: 'the second B would require reusing the same cell twice' },
    ],
    constraints: ['1 <= m, n <= 6', '1 <= word.length <= 15', 'board and word consist of English letters'],
    ds: {
      answer: 'DFS backtracking over the grid, marking cells visited in place',
      choices: ['DFS backtracking over the grid, marking cells visited in place', 'BFS from every starting cell, tracking a visited set per path', 'trie built from the word, walked alongside the grid with no backtracking', 'dynamic programming table of (row, col, index into word) booleans'],
    },
    method: {
      answer: "DFS with in-place marking: at each cell, ==check the current letter matches word[i], failing fast on a mismatch or out-of-bounds==, then ==temporarily overwrite the cell (e.g. with '#') before recursing into all 4 neighbors==, restoring it afterward so other paths can still use that cell",
      choices: [
        "DFS with in-place marking: at each cell, ==check the current letter matches word[i], failing fast on a mismatch or out-of-bounds==, then ==temporarily overwrite the cell (e.g. with '#') before recursing into all 4 neighbors==, restoring it afterward so other paths can still use that cell",
        'DFS using a separate visited set per recursive call, allocating a brand new set at every single cell visited instead of mutating the board',
        'BFS layer by layer from every starting cell simultaneously, matching one letter of the word per BFS layer',
        'Build a trie of just the single word, then walk the grid once from the top-left corner only, following trie edges wherever they happen to match',
      ],
    },
    code: `class Solution:
    def exist(self, board: List[List[str]], word: str) -> bool:
        rows, cols = len(board), len(board[0])

        def backtrack(r, c, i):
            if i == len(word):
                return True
            if r < 0 or r >= rows or c < 0 or c >= cols or board[r][c] != word[i]:
                return False

            board[r][c] = '#'
            found = any(backtrack(r + dr, c + dc, i + 1) for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)))
            board[r][c] = word[i]

            return found

        return any(backtrack(r, c, 0) for r in range(rows) for c in range(cols))`,
    blanks: [10, 11, 12],
    time: { answer: 'O(rows * cols * 4^L)', choices: ['O(rows * cols * 4^L)', 'O(rows * cols * L)', 'O(rows * cols)', 'O(4^L)'], why: 'L = word length; each of up to 4 directions branches at each of L steps, tried from every starting cell' },
    space: { answer: 'O(L)', choices: ['O(L)', 'O(rows * cols)', 'O(1)', 'O(rows + cols)'], why: 'recursion depth matches how many letters of the word have been matched so far' },
    sayIt: "DFS from every cell: fail fast on a mismatch, else ==mark the cell visited (overwrite it)==, ==recurse into all 4 neighbors==, then restore it on the way back so other paths can reuse that cell. O(rows*cols*4^L).",
    pitfall: 'Restoring `board[r][c] = word[i]` after exploring — forgetting this leaves cells permanently blocked for other starting paths.',
  },
  {
    id: 'thought:backtracking-greedy:palindrome-partitioning',
    lc: 131,
    title: 'Palindrome Partitioning',
    difficulty: 'Medium',
    category: 'backtracking-greedy',
    skills: ['backtracking'],
    companies: ['amazon', 'meta'],
    statement: `Given a string, partition it so that every substring in the partition is a palindrome. Return all possible such partitions.

A palindrome reads the same forward and backward; single characters always count as palindromes.

Try every possible length for the next piece starting from the current position, only recursing into pieces that are themselves palindromes, and a partition is complete once you've consumed the entire string.`,
    examples: [
      { input: 's = "aab"', output: '[["a","a","b"],["aa","b"]]' },
      { input: 's = "a"', output: '[["a"]]' },
    ],
    constraints: ['1 <= s.length <= 16', 's consists of lowercase English letters only'],
    ds: {
      answer: 'backtracking over end-of-substring positions, path list of pieces',
      choices: ['backtracking over end-of-substring positions, path list of pieces', 'bottom-up DP table of boolean palindrome(i, j), with no mechanism to recover partitions', 'BFS queue of partial partitions, extended by one more substring per level', 'two pointers scanning from both ends of the full string inward'],
    },
    method: {
      answer: "Backtrack over substring end points: starting from the current position, ==try every possible end point for the next piece==, and ==only recurse further if that piece is a palindrome==, completing a partition once the position reaches the end of the string",
      choices: [
        "Backtrack over substring end points: starting from the current position, ==try every possible end point for the next piece==, and ==only recurse further if that piece is a palindrome==, completing a partition once the position reaches the end of the string",
        'Precompute a 2-D table of every (i, j) palindrome boolean with DP, but never actually use it, instead checking palindromes fresh on every call anyway',
        'Only try splitting the string exactly in half at every level, recursing on each half independently until single characters remain',
        'Greedily take the longest palindromic prefix available at each step, instead of trying every possible piece length',
      ],
    },
    code: `class Solution:
    def partition(self, s: str) -> List[List[str]]:
        result = []
        path = []

        def isPalindrome(sub):
            return sub == sub[::-1]

        def backtrack(start):
            if start == len(s):
                result.append(path[:])
                return

            for end in range(start + 1, len(s) + 1):
                sub = s[start:end]
                if isPalindrome(sub):
                    path.append(sub)
                    backtrack(end)
                    path.pop()

        backtrack(0)
        return result`,
    blanks: [15, 16, 18],
    time: { answer: 'O(n * 2^n)', choices: ['O(n * 2^n)', 'O(2^n)', 'O(n^2)', 'O(n!)'], why: 'up to 2^n ways to partition an n-length string, each palindrome check costing up to O(n)' },
    space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(2^n)', 'O(n^2)'], why: 'recursion depth and the path list are both bounded by n, ignoring the output' },
    sayIt: "Backtrack on the end-of-piece index: ==try every possible next-piece length==, ==only recurse if that piece reads as a palindrome==, done once start reaches len(s). O(n*2^n) worst case.",
    pitfall: 'Checking `isPalindrome(sub)` before recursing, not after — an invalid piece should never extend the path at all.',
  },
  {
    id: 'thought:backtracking-greedy:letter-combinations',
    lc: 17,
    title: 'Letter Combinations of a Phone Number',
    difficulty: 'Medium',
    category: 'backtracking-greedy',
    skills: ['backtracking'],
    companies: ['amazon', 'google', 'apple'],
    statement: `Given a string of digits 2-9, return every possible letter combination the digits could represent on an old phone keypad (2 -> "abc", 3 -> "def", ..., 9 -> "wxyz"), in any order.

An empty input string should return an empty list of combinations, not a list containing one empty string.

Each digit maps to 3 or 4 letters, and a combination picks exactly one letter per digit, in order.`,
    examples: [
      { input: 'digits = "23"', output: '["ad","ae","af","bd","be","bf","cd","ce","cf"]' },
      { input: 'digits = ""', output: '[]' },
    ],
    constraints: ['0 <= digits.length <= 4', 'digits[i] is a digit in [2, 9]'],
    ds: {
      answer: 'fixed digit-to-letters map + backtracking path of chosen letters',
      choices: ['fixed digit-to-letters map + backtracking path of chosen letters', 'BFS queue of partial strings, expanding by one digit\'s letters per level', 'itertools.product over each digit\'s letter options, no recursion written', 'trie built from every possible combination, generated then traversed'],
    },
    method: {
      answer: "Backtrack by digit position: at digit index i, ==loop over every letter mapped to digits[i]==, append it to the path, recurse to i + 1, and ==record a completed string once i reaches len(digits)==",
      choices: [
        "Backtrack by digit position: at digit index i, ==loop over every letter mapped to digits[i]==, append it to the path, recurse to i + 1, and ==record a completed string once i reaches len(digits)==",
        'Backtrack by digit position, but record a completed string at every call regardless of whether all digits have been consumed yet',
        'BFS level by level, where each level dequeues every partial string built so far and tries appending all 26 letters of the alphabet',
        'Use itertools.product directly on the raw digit characters themselves (not their mapped letters), joining the resulting digit tuples into strings',
      ],
    },
    code: `class Solution:
    def letterCombinations(self, digits: str) -> List[str]:
        if not digits:
            return []

        phone = {"2": "abc", "3": "def", "4": "ghi", "5": "jkl", "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz"}
        result = []
        path = []

        def backtrack(i):
            if i == len(digits):
                result.append(''.join(path))
                return

            for letter in phone[digits[i]]:
                path.append(letter)
                backtrack(i + 1)
                path.pop()

        backtrack(0)
        return result`,
    blanks: [11, 15, 17],
    time: { answer: 'O(4^n * n)', choices: ['O(4^n * n)', 'O(4^n)', 'O(n^4)', 'O(3^n * n)'], why: 'n = digits.length, up to 4 letter choices per digit, each completed string costs O(n) to join' },
    space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(4^n)', 'O(n^2)'], why: 'recursion depth and the path list are bounded by the number of digits, ignoring the output' },
    sayIt: "Guard the empty-string edge case first. Backtrack by digit index: ==try every letter the current digit maps to==, recurse forward, ==join the full path into a string once every digit is placed==. O(4^n * n).",
    pitfall: 'Returning `[]` immediately for empty input — the natural recursion would otherwise return `[""]`.',
  },
  {
    id: 'thought:backtracking-greedy:n-queens',
    lc: 51,
    title: 'N-Queens',
    difficulty: 'Hard',
    category: 'backtracking-greedy',
    skills: ['backtracking'],
    companies: ['amazon', 'apple', 'microsoft'],
    statement: `The n-queens puzzle asks you to place n chess queens on an n x n board so that no two queens attack each other: no two queens can share a row, column, or diagonal. Return every distinct board arrangement that achieves this.

Placing at most one queen per row turns this into "choose a column for each row", which avoids the row-conflict case automatically and keeps the branching factor to n per row.

Columns are easy to track with a set. Diagonals are trickier: every cell on the same top-left-to-bottom-right diagonal shares the same (row - col) value, and every cell on the same top-right-to-bottom-left diagonal shares the same (row + col) value.`,
    examples: [
      { input: 'n = 4', output: '2 distinct solutions', explanation: 'the two board layouts are reflections of each other' },
      { input: 'n = 1', output: '1 solution: [["Q"]]' },
    ],
    constraints: ['1 <= n <= 9'],
    ds: {
      answer: 'three sets (cols, row-col diagonals, row+col anti-diagonals) + backtracking',
      choices: ['three sets (cols, row-col diagonals, row+col anti-diagonals) + backtracking', 'n x n boolean grid, scanning the full board for conflicts before every placement', 'bitmask of attacked columns only, re-deriving diagonal conflicts from scratch each call', 'union-find grouping queens that share a row, column, or diagonal into one component'],
    },
    method: {
      answer: "Backtrack row by row: for each row, ==try every column not already in cols, row-col diagonal set, or row+col anti-diagonal set==, place the queen (add to all three sets), recurse to the next row, then ==remove it from all three sets after returning==",
      choices: [
        "Backtrack row by row: for each row, ==try every column not already in cols, row-col diagonal set, or row+col anti-diagonal set==, place the queen (add to all three sets), recurse to the next row, then ==remove it from all three sets after returning==",
        'Backtrack row by row, checking column conflicts with a set but re-scanning every previously placed queen\'s row and column directly for diagonal conflicts instead of using diagonal sets',
        'Place all n queens on the diagonal first as a starting guess, then repeatedly swap pairs of queens between rows until no conflicts remain',
        'Backtrack column by column instead of row by row, trying every row for each column in turn with no diagonal tracking at all',
      ],
    },
    code: `class Solution:
    def solveNQueens(self, n: int) -> List[List[str]]:
        result = []
        cols, diag, antiDiag = set(), set(), set()
        placement = [-1] * n

        def backtrack(row):
            if row == n:
                board = ['.' * placement[r] + 'Q' + '.' * (n - placement[r] - 1) for r in range(n)]
                result.append(board)
                return

            for c in range(n):
                if c in cols or (row - c) in diag or (row + c) in antiDiag:
                    continue

                cols.add(c); diag.add(row - c); antiDiag.add(row + c)
                placement[row] = c
                backtrack(row + 1)
                cols.remove(c); diag.remove(row - c); antiDiag.remove(row + c)

        backtrack(0)
        return result`,
    blanks: [13, 16, 19],
    time: { answer: 'O(n!)', choices: ['O(n!)', 'O(n^n)', 'O(2^n)', 'O(n^2)'], why: 'the first row has n column choices, the next has at most n-1 valid ones, and so on' },
    space: { answer: 'O(n)', choices: ['O(n)', 'O(n^2)', 'O(1)', 'O(n log n)'], why: 'the three conflict sets and the recursion depth are each bounded by n, ignoring the output boards' },
    sayIt: "One queen per row. Track conflicts with ==three sets: columns, row-col diagonals, row+col anti-diagonals==. Try every column not already blocked, place it, recurse, then ==remove it from all three sets on the way back==.",
    pitfall: 'row - c and row + c are what make diagonal conflicts O(1) to check — without them you\'d rescan every placed queen.',
  },
  {
    id: 'thought:backtracking-greedy:jump-game',
    lc: 55,
    title: 'Jump Game',
    difficulty: 'Medium',
    category: 'backtracking-greedy',
    skills: ['greedy'],
    companies: ['amazon', 'google', 'microsoft'],
    statement: `You're given an array where each element is the maximum jump length from that position. Starting at index 0, determine if you can reach the last index.

You don't need to find the actual sequence of jumps, just whether reaching the end is possible at all.

Working backward from the end: keep track of the leftmost index that's known to still be able to reach the goal, and try to pull that "goal" marker further left each time an earlier index can reach it.`,
    examples: [
      { input: 'nums = [2,3,1,1,4]', output: 'true', explanation: 'jump 1 step to index 1, then 3 steps to the last index' },
      { input: 'nums = [3,2,1,0,4]', output: 'false', explanation: 'every path gets stuck at the 0 on index 3' },
    ],
    constraints: ['1 <= nums.length <= 10^4', '0 <= nums[i] <= 10^5'],
    ds: {
      answer: 'single rolling "goal" index, scanned backward, no array or heap',
      choices: ['single rolling "goal" index, scanned backward, no array or heap', '1-D dp boolean array marking every reachable index, filled forward', 'BFS queue of reachable indices, visited set to avoid reprocessing', 'backtracking over every possible sequence of jump choices, no memoization'],
    },
    method: {
      answer: "Greedy from the end backward: keep a ==goal== index starting at the last position, and scan i from the second-to-last index down to 0, ==pulling goal left to i whenever i + nums[i] can reach the current goal==; reachable overall iff goal ends at 0",
      choices: [
        "Greedy from the end backward: keep a ==goal== index starting at the last position, and scan i from the second-to-last index down to 0, ==pulling goal left to i whenever i + nums[i] can reach the current goal==; reachable overall iff goal ends at 0",
        'DFS/backtracking trying every possible jump length from every index with no memoization, returning true on the first path that reaches the end',
        'Greedy from the start forward, always taking the single longest jump available at the current index without checking if it overshoots toward a dead zone',
        '1-D dp boolean array built forward where dp[i] is true if any earlier reachable index could jump to i, with no early exit and O(n^2) transitions',
      ],
    },
    code: `class Solution:
    def canJump(self, nums: List[int]) -> bool:
        goal = len(nums) - 1

        for i in range(len(nums) - 2, -1, -1):
            if i + nums[i] >= goal:
                goal = i

        return goal == 0`,
    blanks: [2, 5, 6],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n^2)', 'O(n log n)', 'O(2^n)'], why: 'a single backward pass over the array, O(1) work per index' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'], why: 'only the rolling goal index is tracked, no array or recursion stack' },
    sayIt: "Scan backward from the end, keeping a ==goal== index. ==Whenever i + nums[i] reaches goal, pull goal left to i==. The start is reachable iff goal ends at 0. O(n) time, O(1) space.",
    pitfall: 'A 0 at some index only matters if nothing before it can jump clean over it — that\'s exactly what the backward goal-pulling check captures.',
  },
  {
    id: 'thought:backtracking-greedy:jump-game-ii',
    lc: 45,
    title: 'Jump Game II',
    difficulty: 'Medium',
    category: 'backtracking-greedy',
    skills: ['greedy'],
    companies: ['amazon', 'google'],
    statement: `Same setup as Jump Game: each element is the max jump length from that index, and you're guaranteed you can always reach the last index. This time, return the minimum number of jumps needed to get there.

Think of it as a BFS over "reachable in k jumps" ranges, but computed greedily in one forward pass instead of an explicit queue.

Track the farthest index reachable so far, and the farthest index reachable using jumps taken so far (the current jump's range); when you reach the end of the current range, that forces one more jump.`,
    examples: [
      { input: 'nums = [2,3,1,1,4]', output: '2', explanation: 'jump from index 0 to index 1 (distance 1), then from index 1 to index 4 (distance 3)' },
      { input: 'nums = [2,3,0,1,4]', output: '2' },
    ],
    constraints: ['1 <= nums.length <= 10^4', '0 <= nums[i] <= 1000', 'it is guaranteed you can reach the last index'],
    ds: {
      answer: 'three rolling ints: jumps, current range end, farthest reachable',
      choices: ['three rolling ints: jumps, current range end, farthest reachable', '1-D dp array of minimum jumps to reach each index, filled forward', 'BFS queue of indices with an explicit visited set', 'min-heap of (jumps so far, index) pairs, Dijkstra-style'],
    },
    method: {
      answer: "Implicit BFS via greedy ranges: as i scans forward, ==update farthest = max(farthest, i + nums[i])==, and ==whenever i reaches currEnd (the current jump's range), take another jump== by setting currEnd = farthest",
      choices: [
        "Implicit BFS via greedy ranges: as i scans forward, ==update farthest = max(farthest, i + nums[i])==, and ==whenever i reaches currEnd (the current jump's range), take another jump== by setting currEnd = farthest",
        'Bottom-up DP where dp[i] = 1 + min(dp[j]) over every j that can jump to i, filled left to right with no early exit',
        'Greedily always take the single longest jump available at the current index, re-evaluating only from wherever that jump lands',
        'BFS with an explicit queue of indices and a visited set, incrementing a jump counter once per queue level'
      ],
    },
    code: `class Solution:
    def jump(self, nums: List[int]) -> int:
        jumps = 0
        currEnd = 0
        farthest = 0

        for i in range(len(nums) - 1):
            farthest = max(farthest, i + nums[i])

            if i == currEnd:
                jumps += 1
                currEnd = farthest

        return jumps`,
    blanks: [7, 10, 11],
    accept: { 7: ['farthest = max(i + nums[i], farthest)'] },
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(2^n)'], why: 'a single forward pass, O(1) work updating farthest and currEnd per index' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'], why: 'only three rolling integers are tracked, no array or queue' },
    sayIt: "One forward pass: ==extend farthest to i + nums[i] every step==, and ==once i hits the current range's end, commit a jump== and extend the range to farthest. O(n) time, O(1) space — it's BFS levels without the queue.",
    pitfall: 'The loop stops at `len(nums) - 1`, not the full length — jumping from the last index is never needed.',
  },
  {
    id: 'thought:backtracking-greedy:gas-station',
    lc: 134,
    title: 'Gas Station',
    difficulty: 'Medium',
    category: 'backtracking-greedy',
    skills: ['greedy'],
    companies: ['amazon', 'google'],
    statement: `There are n gas stations in a circle, each with some amount of gas, and it costs some amount of gas to travel from each station to the next one. Starting at some station with an empty tank, determine the index of the starting station that lets you complete the full circuit, or return -1 if it's impossible.

If a solution exists, it's guaranteed to be unique.

The key insight: if the total gas available is at least the total cost, a valid start always exists. And if you run out of gas trying to leave some station after starting at index start, no station between start and that failure point could have worked as a start either.`,
    examples: [
      { input: 'gas = [1,2,3,4,5], cost = [3,4,5,1,2]', output: '3', explanation: 'starting at station 3: tank goes 0->4->2->5->4->6, never negative' },
      { input: 'gas = [2,3,4], cost = [3,4,3]', output: '-1', explanation: 'total gas (9) is less than total cost (10)' },
    ],
    constraints: ['n == gas.length == cost.length', '1 <= n <= 10^5', '0 <= gas[i], cost[i] <= 10^4'],
    ds: {
      answer: 'two rolling ints: running tank total and a candidate start index, single pass',
      choices: ['two rolling ints: running tank total and a candidate start index, single pass', 'simulate the full circuit from every candidate start index, O(n) each', '1-D dp array of net gas gained up to each index', 'min-heap of (net gas, index) pairs, picking the index with the least negative net first'],
    },
    method: {
      answer: "Single-pass greedy: first bail out with -1 if total gas < total cost, then scan once tracking a running total of ==gas[i] - cost[i]==, and ==whenever that running total drops below 0, reset it to 0 and move the candidate start to i + 1==",
      choices: [
        "Single-pass greedy: first bail out with -1 if total gas < total cost, then scan once tracking a running total of ==gas[i] - cost[i]==, and ==whenever that running total drops below 0, reset it to 0 and move the candidate start to i + 1==",
        'Try simulating the full circuit starting from every single index from 0 to n-1, returning the first index where the tank never goes negative',
        'Scan once tracking a running total of gas[i] - cost[i], but whenever it goes negative, move the candidate start backward to i - 1 instead of forward to i + 1',
        'Sort stations by gas[i] - cost[i] descending and start from whichever single station has the best individual net gas vs cost',
      ],
    },
    code: `class Solution:
    def canCompleteCircuit(self, gas: List[int], cost: List[int]) -> int:
        if sum(gas) < sum(cost):
            return -1

        total = 0
        start = 0

        for i in range(len(gas)):
            total += gas[i] - cost[i]
            if total < 0:
                start = i + 1
                total = 0

        return start`,
    blanks: [9, 11, 12],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n^2)', 'O(n log n)', 'O(2^n)'], why: 'computing the two sums and the single greedy scan are each O(n)' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'], why: 'only a couple of rolling totals and indices are tracked' },
    sayIt: "If total gas < total cost, impossible. Otherwise one pass: track running ==gas[i] - cost[i]==, and ==the moment it goes negative, the start can't be before i+1==, so reset and move start there. O(n) time, O(1) space.",
    pitfall: 'The problem guarantees a unique answer exists whenever total gas >= total cost — that\'s what makes the single-pass reset argument valid.',
  },
  {
    id: 'thought:backtracking-greedy:hand-of-straights',
    lc: 846,
    title: 'Hand of Straights',
    difficulty: 'Medium',
    category: 'backtracking-greedy',
    skills: ['greedy'],
    companies: ['amazon', 'meta'],
    statement: `You're given an array of card values and a groupSize. Determine if the cards can be rearranged into groups of exactly groupSize, where each group consists of groupSize consecutive values (a "straight").

If the total card count isn't evenly divisible by groupSize, it's immediately impossible.

Always start a new straight at the smallest remaining card value with a count still left; since nothing smaller exists to start a straight with it, it must begin one if it's going to be used at all.`,
    examples: [
      { input: 'hand = [1,2,3,6,2,3,4,7,8], groupSize = 3', output: 'true', explanation: 'groups [1,2,3], [2,3,4], [6,7,8]' },
      { input: 'hand = [1,2,3,4,5], groupSize = 4', output: 'false' },
    ],
    constraints: ['1 <= hand.length <= 10^4', '0 <= hand[i] <= 10^9', '1 <= groupSize <= hand.length'],
    ds: {
      answer: 'Counter of card counts, processed from the smallest remaining value up',
      choices: ['Counter of card counts, processed from the smallest remaining value up', 'sorted array with two pointers, one at each end', 'min-heap of card values with no count tracking, popped one at a time', 'union-find grouping every pair of consecutive values into the same component'],
    },
    method: {
      answer: "Greedy from the smallest card: for each distinct value still needing to be placed, ==treat its full remaining count as the number of straights that must start here==, then ==walk forward groupSize values consuming that same count from each==, failing if any of them doesn't have enough",
      choices: [
        "Greedy from the smallest card: for each distinct value still needing to be placed, ==treat its full remaining count as the number of straights that must start here==, then ==walk forward groupSize values consuming that same count from each==, failing if any of them doesn't have enough",
        'Sort the cards, then greedily group every consecutive run of groupSize sorted values together regardless of whether the values themselves are actually consecutive integers',
        'Process cards from the largest remaining value downward, treating the largest as the end of a straight rather than the smallest as the start',
        'Use two pointers on the sorted array, pairing the smallest remaining value with the value exactly groupSize positions ahead with no count bookkeeping',
      ],
    },
    code: `class Solution:
    def isNStraightHand(self, hand: List[int], groupSize: int) -> bool:
        if len(hand) % groupSize:
            return False

        counts = Counter(hand)

        for card in sorted(counts):
            need = counts[card]
            if need <= 0:
                continue

            for next_card in range(card, card + groupSize):
                if counts[next_card] < need:
                    return False
                counts[next_card] -= need

        return True`,
    blanks: [8, 13, 15],
    time: { answer: 'O(n log n)', choices: ['O(n log n)', 'O(n)', 'O(n^2)', 'O(n * groupSize)'], why: 'Counter is O(n), but sorting the up to n distinct card values costs O(n log n)' },
    space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(groupSize)', 'O(n log n)'], why: 'the Counter can hold up to n distinct card values' },
    sayIt: "Counter of counts, process smallest-remaining-value first since nothing smaller could start a straight with it. ==Its leftover count is how many straights begin there==; ==consume that same count from the next groupSize values==, fail if any comes up short.",
    pitfall: 'Iterating `sorted(counts)` on a live Counter while also mutating it — `next_card` values beyond the original keys still work since Counter returns 0 for missing keys, but counts for already-visited smaller keys must never go negative-checked again.',
  },
  {
    id: 'thought:backtracking-greedy:partition-labels',
    lc: 763,
    title: 'Partition Labels',
    difficulty: 'Medium',
    category: 'backtracking-greedy',
    skills: ['greedy'],
    companies: ['amazon', 'meta'],
    statement: `Given a string, partition it into as many parts as possible so that each letter appears in at most one part, then return the length of each part in order.

Every occurrence of a given letter must land in the same partition piece, even if that letter repeats far apart in the string.

Precompute the last index each letter appears at. Then sweep left to right, growing the current piece's end to cover the last occurrence of every letter seen so far; once the sweep index catches up to that end, the piece is complete.`,
    examples: [
      { input: 's = "ababcbacadefegdehijhklij"', output: '[9,7,8]', explanation: '"ababcbaca", "defegde", "hijhklij"' },
      { input: 's = "eccbbbbdec"', output: '[10]' },
    ],
    constraints: ['1 <= s.length <= 500', 's consists of lowercase English letters'],
    ds: {
      answer: 'dict of letter -> last index, single forward sweep tracking current piece end',
      choices: ['dict of letter -> last index, single forward sweep tracking current piece end', 'Counter of letter frequencies only, with no index information tracked', 'union-find merging indices whenever the same letter reappears', 'two pointers moving inward from both ends of the string'],
    },
    method: {
      answer: "Precompute then sweep: build a ==dict mapping each letter to its last index in s==, then scan forward extending the current piece's end to ==max(end, lastIndex of the current letter)==, and close the piece whenever the scan index reaches that end",
      choices: [
        "Precompute then sweep: build a ==dict mapping each letter to its last index in s==, then scan forward extending the current piece's end to ==max(end, lastIndex of the current letter)==, and close the piece whenever the scan index reaches that end",
        'Build a dict of each letter\'s first index instead of last index, closing a piece once the scan index reaches that first-seen boundary',
        'Scan forward with no precomputed lookups, re-scanning the rest of the string from scratch every time a new letter is seen to find where it last occurs',
        'Union-find where indices sharing a letter get merged into the same component, then read off component sizes in index order as the partition lengths',
      ],
    },
    code: `class Solution:
    def partitionLabels(self, s: str) -> List[int]:
        lastIndex = {c: i for i, c in enumerate(s)}
        result = []
        start = end = 0

        for i, c in enumerate(s):
            end = max(end, lastIndex[c])

            if i == end:
                result.append(end - start + 1)
                start = i + 1

        return result`,
    blanks: [7, 10, 11],
    accept: { 7: ['end = max(lastIndex[c], end)'] },
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(26n)'], why: 'building lastIndex and the single forward sweep are each a linear pass over s' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(26)', 'O(n^2)'], why: 'lastIndex holds at most 26 lowercase letters regardless of string length, ignoring the output' },
    sayIt: "Precompute each letter's ==last occurrence index==. Sweep forward, ==stretching the current piece's end to cover the last occurrence of every letter seen==; the piece closes the instant the scan catches up to that end. O(n) time.",
    pitfall: 'A piece closes based on the scan index catching the *end* boundary, not on simply seeing a letter for a second time.',
  },
  {
    id: 'thought:backtracking-greedy:valid-parenthesis-string',
    lc: 678,
    title: 'Valid Parenthesis String',
    difficulty: 'Medium',
    category: 'backtracking-greedy',
    skills: ['greedy'],
    companies: ['amazon', 'meta'],
    statement: `Given a string containing '(', ')', and '*', determine if it's a valid parenthesization, where '*' can be treated as '(', ')', or the empty string, your choice.

Trying every interpretation of every '*' would be exponential. Instead, track a range of possible "open-paren counts": a lower bound assuming every '*' resolves as unhelpfully as possible, and an upper bound assuming every '*' resolves as helpfully as possible.

The string is valid if, after processing every character, the lower bound can be brought down to exactly 0 while the upper bound never dipped below 0 at any point along the way.`,
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "(*)"', output: 'true', explanation: '* can act as empty' },
      { input: 's = "(()"', output: 'false', explanation: 'no star available to close the extra open paren' },
    ],
    constraints: ['1 <= s.length <= 100', 's[i] is \'(\', \')\', or \'*\''],
    ds: {
      answer: 'two rolling ints: loMin and hiMax possible open count',
      choices: ['two rolling ints: loMin and hiMax possible open count', 'a single stack of open parens, treating every \'*\' as \')\' greedily', 'backtracking over every possible resolution of each \'*\', exponential', 'two separate stacks, one for \'(\' and one for \'*\', popped in a fixed priority order'],
    },
    method: {
      answer: "Range-tracking greedy: maintain ==loMin== (fewest opens possible so far) and ==hiMax== (most opens possible so far); '(' increments both, ')' decrements both, '*' decrements loMin but increments hiMax; ==clamp loMin to 0 whenever it dips negative== (a '*' can just mean empty there), and fail immediately if hiMax ever goes negative",
      choices: [
        "Range-tracking greedy: maintain ==loMin== (fewest opens possible so far) and ==hiMax== (most opens possible so far); '(' increments both, ')' decrements both, '*' decrements loMin but increments hiMax; ==clamp loMin to 0 whenever it dips negative== (a '*' can just mean empty there), and fail immediately if hiMax ever goes negative",
        'Use a single stack, pushing on \'(\' and \'*\', and popping on \')\', treating every \'*\' exactly like \'(\' with no distinction',
        'Track only hiMax (the most opens possible), ignoring loMin entirely, and declare the string valid whenever hiMax ends at exactly 0',
        'Backtrack over every \'*\' trying all three interpretations one at a time, pruning only once the string is fully consumed',
      ],
    },
    code: `class Solution:
    def checkValidString(self, s: str) -> bool:
        loMin, hiMax = 0, 0

        for c in s:
            if c == '(':
                loMin += 1
                hiMax += 1
            elif c == ')':
                loMin -= 1
                hiMax -= 1
            else:
                loMin -= 1
                hiMax += 1

            if hiMax < 0:
                return False
            loMin = max(loMin, 0)

        return loMin == 0`,
    blanks: [15, 16, 17],
    accept: { 17: ['loMin = max(0, loMin)'] },
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n^2)', 'O(2^n)', 'O(n log n)'], why: 'a single forward pass over the string, O(1) work updating the two bounds per character' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(2^n)', 'O(log n)'], why: 'only the two rolling bounds loMin and hiMax are tracked, no stack or recursion' },
    sayIt: "Track a range of possible open-counts: ==loMin== (worst case) and ==hiMax== (best case). '*' moves them in opposite directions. ==Clamp loMin at 0==, bail if hiMax ever goes negative, valid iff loMin ends at 0. O(n) time, O(1) space.",
    pitfall: 'hiMax going negative means failure (not enough opens for the closes seen), but loMin going negative just means some earlier \'*\' should be reinterpreted as empty, not a failure.',
  },
  {
    id: 'thought:backtracking-greedy:single-number',
    lc: 136,
    title: 'Single Number',
    difficulty: 'Easy',
    category: 'backtracking-greedy',
    skills: ['bit'],
    companies: ['amazon', 'apple'],
    statement: `Given a non-empty array of integers where every element appears exactly twice except for one, find that single element that only appears once.

You need linear time and, ideally, constant extra space, which rules out a hashmap of counts.

XOR is the trick: a number XORed with itself is 0, and XOR is commutative/associative, so XORing the entire array cancels out every pair and leaves only the lone element.`,
    examples: [
      { input: 'nums = [2,2,1]', output: '1' },
      { input: 'nums = [4,1,2,1,2]', output: '4' },
    ],
    constraints: ['1 <= nums.length <= 3 * 10^4', 'every element appears exactly twice except for one'],
    ds: {
      answer: 'single rolling XOR accumulator, no extra structure',
      choices: ['single rolling XOR accumulator, no extra structure', 'Counter (hashmap) of value frequencies', 'sorted array, scanning for the one value with no adjacent match', 'set that toggles membership in and out on each occurrence'],
    },
    method: {
      answer: "XOR cancellation: ==XOR every element into a single running accumulator==; every pair cancels to 0 (x ^ x = 0), and XOR with 0 is a no-op, so whatever survives is the unpaired element",
      choices: [
        "XOR cancellation: ==XOR every element into a single running accumulator==; every pair cancels to 0 (x ^ x = 0), and XOR with 0 is a no-op, so whatever survives is the unpaired element",
        'Build a Counter of every value\'s frequency, then scan it for the one key whose count equals 1',
        'Sort the array, then walk pairs of adjacent elements looking for the first pair that doesn\'t match',
        'Use a set: add a value the first time it\'s seen, remove it the second time, then the set must be empty at the end — return the last value removed',
      ],
    },
    code: `class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        result = 0

        for num in nums:
            result ^= num

        return result`,
    blanks: [2, 5, 7],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(1)'], why: 'a single pass XORing every element once' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'], why: 'only one accumulator variable, no hashmap or set' },
    sayIt: "==XOR every element together==: pairs cancel to 0, XOR with 0 changes nothing, so the lone element is all that's left. O(n) time, O(1) space.",
    pitfall: 'This only works because every other value appears exactly *twice* — three-or-more repeats need a different bit-counting trick.',
  },
  {
    id: 'thought:backtracking-greedy:counting-bits',
    lc: 338,
    title: 'Counting Bits',
    difficulty: 'Easy',
    category: 'backtracking-greedy',
    skills: ['bit', 'dp-1d'],
    companies: ['amazon', 'google'],
    statement: `Given an integer n, return an array ans of length n + 1 where ans[i] is the number of 1 bits in the binary representation of i, for every i from 0 to n.

A per-number popcount loop works but costs O(log i) per value. There's an O(1)-per-value recurrence using values already computed earlier in the array.

Every integer i relates to i >> 1 (i with its last bit dropped): the bit count of i is the bit count of i >> 1, plus 1 more if i's last bit (i & 1) is set.`,
    examples: [
      { input: 'n = 2', output: '[0,1,1]', explanation: '0 has 0 bits, 1 has 1 bit, 2 (10 in binary) has 1 bit' },
      { input: 'n = 5', output: '[0,1,1,2,1,2]' },
    ],
    constraints: ['0 <= n <= 10^5'],
    ds: {
      answer: '1-D dp array built from each value\'s "drop the last bit" predecessor',
      choices: ['1-D dp array built from each value\'s "drop the last bit" predecessor', 'per-value loop counting bits one at a time with bin(i).count("1")', 'recursive divide-and-conquer splitting each number\'s bits in half', 'lookup table precomputed for every 8-bit byte, combined 4 bytes at a time'],
    },
    method: {
      answer: "DP via bit-dropping: ==dp[i] = dp[i >> 1] + (i & 1)==, since right-shifting i by 1 drops its last bit (a popcount already computed earlier), and the dropped bit is added back if it was a 1",
      choices: [
        "DP via bit-dropping: ==dp[i] = dp[i >> 1] + (i & 1)==, since right-shifting i by 1 drops its last bit (a popcount already computed earlier), and the dropped bit is added back if it was a 1",
        'dp[i] = dp[i - 1] + 1 for every i, assuming bit count always increases by exactly one between consecutive integers',
        'dp[i] = dp[i // 2] * 2, doubling the previous popcount instead of reusing it directly',
        'Call Python\'s built-in bin(i).count("1") for every i from 0 to n independently, with no dp array at all',
      ],
    },
    code: `class Solution:
    def countBits(self, n: int) -> List[int]:
        dp = [0] * (n + 1)

        for i in range(1, n + 1):
            dp[i] = dp[i >> 1] + (i & 1)

        return dp`,
    blanks: [2, 5, 7],
    accept: { 5: ['dp[i] = dp[i // 2] + (i % 2)'] },
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)'], why: 'one O(1) recurrence computed per value from 1 to n' },
    space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'], why: 'the output array itself holds n + 1 entries' },
    sayIt: "==dp[i] = dp[i >> 1] + (i & 1)==: drop i's last bit to get a smaller number whose popcount is already known, add back 1 if that dropped bit was set. O(n) time, one pass.",
    pitfall: 'i >> 1 always points to a strictly smaller, already-computed index — that ordering is what makes the single forward pass valid.',
  },
  {
    id: 'thought:backtracking-greedy:reverse-bits',
    lc: 190,
    title: 'Reverse Bits',
    difficulty: 'Easy',
    category: 'backtracking-greedy',
    skills: ['bit'],
    companies: ['apple', 'microsoft'],
    statement: `Given a 32-bit unsigned integer, return the integer obtained by reversing the order of its bits.

Treat the input strictly as a fixed-width 32-bit value: bit 0 (least significant) swaps with bit 31 (most significant), bit 1 swaps with bit 30, and so on.

Build the result one bit at a time: pull out bit i of n, then place it into the mirrored position (31 - i) of the result.`,
    examples: [
      { input: 'n = 00000010100101000001111010011100', output: '964176192 (00111001011110000010100101000000)' },
      { input: 'n = 11111111111111111111111111111101', output: '3221225471' },
    ],
    constraints: ['the input is exactly a 32-bit unsigned integer'],
    ds: {
      answer: 'single int accumulator, built bit by bit over 32 fixed iterations',
      choices: ['single int accumulator, built bit by bit over 32 fixed iterations', 'convert to a 32-character binary string, reverse the string, parse it back to int', 'recursive divide-and-conquer swapping bit-group halves (16, then 8, then 4...)', 'array of 32 individual bit values, sorted in reverse index order'],
    },
    method: {
      answer: "Bit-by-bit extraction: for each position i from 0 to 31, ==pull out bit i of n with (n >> i) & 1==, then ==OR it into the result shifted to the mirrored position (31 - i)==",
      choices: [
        "Bit-by-bit extraction: for each position i from 0 to 31, ==pull out bit i of n with (n >> i) & 1==, then ==OR it into the result shifted to the mirrored position (31 - i)==",
        'Convert n to its binary string representation with bin(n), reverse the string with slicing, then parse it back to an integer with int(s, 2) with no zero-padding to 32 characters',
        'Recursively swap the top 16 bits with the bottom 16 bits, then the top 8 with the bottom 8 within each half, and so on down to single bits, implemented with no base case',
        'Shift n left by 1 bit 32 times in a row and call that the reversed result, with no extraction or placement of individual bits at all',
      ],
    },
    code: `class Solution:
    def reverseBits(self, n: int) -> int:
        result = 0

        for i in range(32):
            bit = (n >> i) & 1
            result |= bit << (31 - i)

        return result`,
    blanks: [2, 5, 6],
    time: { answer: 'O(1)', choices: ['O(1)', 'O(log n)', 'O(n)', 'O(32^2)'], why: 'always exactly 32 iterations regardless of the input value' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(32)', 'O(log n)'], why: 'only a couple of integer variables, no string or array built' },
    sayIt: "Loop over all 32 bit positions: ==extract bit i with (n >> i) & 1==, ==OR it into position 31 - i of the result==. O(1) time since it's always exactly 32 iterations.",
    pitfall: 'The mirrored position is `31 - i`, not `32 - i` — bit positions are 0-indexed up to 31.',
  },
  {
    id: 'thought:backtracking-greedy:missing-number',
    lc: 268,
    title: 'Missing Number',
    difficulty: 'Easy',
    category: 'backtracking-greedy',
    skills: ['bit'],
    companies: ['amazon', 'microsoft', 'bloomberg'],
    statement: `Given an array containing n distinct numbers taken from the range [0, n], find the one number in that range that's missing from the array.

The array has length n, but the full range [0, n] has n + 1 possible values, so exactly one is missing.

XORing every array value together with every index from 0 to n cancels out every number that's present (since it appears once as a value and once as an index), leaving only the missing number and one unmatched index.`,
    examples: [
      { input: 'nums = [3,0,1]', output: '2', explanation: 'n = 3, range is [0,3], and 2 is the one missing' },
      { input: 'nums = [9,6,4,2,3,5,7,0,1]', output: '8' },
    ],
    constraints: ['n == nums.length', '1 <= n <= 10^4', 'all nums[i] are distinct and in range [0, n]'],
    ds: {
      answer: 'single XOR accumulator seeded with n, no set or sum',
      choices: ['single XOR accumulator seeded with n, no set or sum', 'set of all numbers 0..n, removing each array value and returning whatever remains', 'sort the array then binary search for the first index where arr[i] != i', 'Gauss sum formula n*(n+1)//2 minus the actual array sum'],
    },
    method: {
      answer: "XOR cancellation with indices: ==seed result with n== (the one index that has no corresponding array slot), then for every index i, ==XOR in both i and nums[i]==; every number present cancels against its matching index, leaving only the missing one",
      choices: [
        "XOR cancellation with indices: ==seed result with n== (the one index that has no corresponding array slot), then for every index i, ==XOR in both i and nums[i]==; every number present cancels against its matching index, leaving only the missing one",
        'Seed result with 0 instead of n, then XOR in only the array values nums[i] with no index XORed in at all',
        'Sort nums first, then XOR every pair of adjacent sorted values together, returning whichever XOR result is nonzero',
        'Build a set from range(n + 1), then repeatedly call set.discard(num) for every num in nums, returning the set\'s only remaining element',
      ],
    },
    code: `class Solution:
    def missingNumber(self, nums: List[int]) -> int:
        n = len(nums)
        result = n

        for i, num in enumerate(nums):
            result ^= i ^ num

        return result`,
    blanks: [3, 6, 8],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(1)'], why: 'a single pass XORing both the index and value at each position' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'], why: 'only one accumulator variable, no set or extra array' },
    sayIt: "==Seed result with n== since index n never has an array slot, then ==XOR in every index i and nums[i] together==. Matched pairs cancel, the missing number survives. O(n) time, O(1) space.",
    pitfall: 'Seeding with n is required — without it, the unmatched index n never gets XORed in anywhere.',
  },
  {
    id: 'thought:backtracking-greedy:sum-of-two-integers',
    lc: 371,
    title: 'Sum of Two Integers',
    difficulty: 'Medium',
    category: 'backtracking-greedy',
    skills: ['bit'],
    companies: ['amazon', 'microsoft'],
    statement: `Given two integers a and b, return their sum without using the '+' or '-' operators.

Think in terms of binary addition: XOR gives you the sum of two bits ignoring any carry, and AND (shifted left by one) gives you exactly the carry that addition would produce. Repeat until there's no carry left.

Python integers aren't fixed-width, so negative numbers need a 32-bit mask to simulate the two's-complement wraparound a fixed-width language would do naturally.`,
    examples: [
      { input: 'a = 1, b = 2', output: '3' },
      { input: 'a = 2, b = 3', output: '5' },
      { input: 'a = -2, b = 3', output: '1' },
    ],
    constraints: ['-1000 <= a, b <= 1000'],
    ds: {
      answer: '32-bit mask + loop computing XOR-sum and AND-carry until carry is 0',
      choices: ['32-bit mask + loop computing XOR-sum and AND-carry until carry is 0', 'convert both to Python ints and add them directly with the + operator', 'repeatedly increment a by 1 and decrement b by 1 until b reaches 0', 'convert both to binary strings and simulate grade-school addition character by character'],
    },
    method: {
      answer: "Bitwise full-adder loop: while there's a carry, compute ==carry = (a & b) << 1== (where both bits were 1), ==a = a ^ b== (sum ignoring carry), then ==b = carry== for the next iteration; mask to 32 bits throughout and flip back to a signed result if the top bit ended up set",
      choices: [
        "Bitwise full-adder loop: while there's a carry, compute ==carry = (a & b) << 1== (where both bits were 1), ==a = a ^ b== (sum ignoring carry), then ==b = carry== for the next iteration; mask to 32 bits throughout and flip back to a signed result if the top bit ended up set",
        'Repeatedly add 1 to a and subtract 1 from b in a loop using only the increment/decrement-by-one pattern until b reaches exactly 0, working for negative b too',
        'Compute carry as (a | b) << 1 (bits where at least one of the two was 1) instead of (a & b) << 1',
        'Mask both a and b to 32 bits once at the very start, but then add them with Python\'s built-in + operator afterward',
      ],
    },
    code: `class Solution:
    def getSum(self, a: int, b: int) -> int:
        mask = 0xFFFFFFFF

        while b & mask:
            carry = (a & b) << 1
            a = a ^ b
            b = carry

        a = a & mask

        return a if a <= 0x7FFFFFFF else ~(a ^ mask)`,
    blanks: [5, 6, 7],
    time: { answer: 'O(1)', choices: ['O(1)', 'O(log(a + b))', 'O(a + b)', 'O(32^2)'], why: 'the carry can propagate at most 32 times before the fixed-width mask zeroes it out' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(log(a + b))', 'O(32)', 'O(a + b)'], why: 'only a handful of integer variables are used regardless of input size' },
    sayIt: "Binary full adder: ==carry = (a & b) << 1==, ==a = a ^ b== is the sum ignoring carry, ==b = carry== feeds the next round; loop while there's still a carry, mask to 32 bits, flip to signed at the end. O(1), bounded by 32 bits.",
    pitfall: 'Without the 0xFFFFFFFF mask and the final two\'s-complement flip, Python\'s unbounded integers never simulate 32-bit overflow correctly for negative results.',
  },
]

export default {
  id: 'backtracking-greedy',
  title: 'Backtracking, greedy & bits',
  icon: 'puzzle',
  items,
}
