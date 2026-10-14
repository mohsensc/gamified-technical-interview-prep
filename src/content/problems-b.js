const problems = [
  {
    id: "google-b:lc835",
    lc: 835,
    title: "Image Overlap",
    difficulty: "Medium",
    companies: ['google'],
    skills: ["arrays-hashing", "grid", "constraints"],
    pattern: "Translation vector counting",
    ds: ["hashmap"],
    constraints: "1 ≤ n ≤ 30, cells are 0/1",
    time: "O(n^4)",
    space: "O(n^2)",
    insight: "Every overlap comes from one shift vector; count (dr, dc) over all pairs of ones.",
    signals: ["translate", "overlap", "n ≤ 30"],
    narration: ["Shifts can go any direction, ones outside the grid are dropped, right?", "n ≤ 30 means even O(n^4) is under a million ops.", "Collect coordinates of ones in both images.", "For every pair, the shift that aligns them is (r1-r2, c1-c2); count it in a Counter.", "Best count is the answer. Time O(n^4) worst, space O(n^2)."],
    pitfalls: ["All-zero image returns 0", "Use tuple keys, not r*n+c without offset"],
    solution: `from collections import Counter

class Solution:
    def largestOverlap(self, img1: List[List[int]], img2: List[List[int]]) -> int:
        n = len(img1)

        onesA = [(r, c) for r in range(n) for c in range(n) if img1[r][c]]
        onesB = [(r, c) for r in range(n) for c in range(n) if img2[r][c]]

        shifts = Counter()

        for r1, c1 in onesA:
            for r2, c2 in onesB:
                shifts[(r1 - r2, c1 - c2)] += 1

        return max(shifts.values(), default=0)`,
  },
  {
    id: "google-b:lc155",
    lc: 155,
    title: "Min Stack",
    difficulty: "Medium",
    companies: ['amazon', 'google', 'bloomberg'],
    skills: ["stack", "ds-diagnosis"],
    pattern: "Stack of (value, min so far)",
    ds: ["stack"],
    constraints: "up to 3·10^4 calls, all O(1)",
    time: "O(1) per op",
    space: "O(n)",
    insight: "Store the running minimum alongside each value so pop restores the old min for free.",
    signals: ["constant time", "getMin", "design"],
    narration: ["Every op must be O(1), and pop/top/getMin are only called on non-empty stacks?", "A single min variable breaks when the min gets popped.", "So each stack entry carries the min at the moment it was pushed.", "push: min(val, top min). getMin reads the top pair.", "All ops O(1), space O(n)."],
    pitfalls: ["Duplicate minimums", "Empty stack on first push"],
    solution: `class MinStack:

    def __init__(self):
        self.stack = []

    def push(self, val: int) -> None:
        currMin = min(val, self.stack[-1][1]) if self.stack else val
        self.stack.append((val, currMin))

    def pop(self) -> None:
        self.stack.pop()

    def top(self) -> int:
        return self.stack[-1][0]

    def getMin(self) -> int:
        return self.stack[-1][1]`,
  },
  {
    id: "google-b:lc977",
    lc: 977,
    title: "Squares of a Sorted Array",
    difficulty: "Easy",
    companies: ['meta', 'google'],
    skills: ["two-pointers"],
    pattern: "Two pointers from both ends",
    ds: ["array"],
    constraints: "1 ≤ n ≤ 10^4, sorted, may be negative",
    time: "O(n)",
    space: "O(n)",
    insight: "Largest square is always at one of the two ends; fill the result from the back.",
    signals: ["sorted", "negative", "squares", "O(n) follow-up"],
    narration: ["Input sorted non-decreasing, negatives allowed, output sorted squares.", "Squaring and sorting is O(n log n); the follow-up wants O(n).", "Biggest absolute value sits at an end, so compare both ends.", "Write the larger square into the last open slot and move that pointer.", "O(n) time, O(n) for the output."],
    pitfalls: ["All negative input", "Fill from the back, not the front"],
    solution: `class Solution:
    def sortedSquares(self, nums: List[int]) -> List[int]:
        left, right = 0, len(nums) - 1
        result = [0] * len(nums)

        for i in range(len(nums) - 1, -1, -1):
            if abs(nums[left]) > abs(nums[right]):
                result[i] = nums[left] ** 2
                left += 1
            else:
                result[i] = nums[right] ** 2
                right -= 1

        return result`,
  },
  {
    id: "google-b:lc38",
    lc: 38,
    title: "Count and Say",
    difficulty: "Medium",
    companies: ['meta', 'amazon', 'google'],
    skills: ["math", "arrays-hashing"],
    pattern: "Run-length simulation",
    ds: ["string"],
    constraints: "1 ≤ n ≤ 30",
    time: "O(n · L)",
    space: "O(L)",
    insight: "Each term is the run-length encoding of the previous one; just simulate n-1 times.",
    signals: ["describe the previous term", "n ≤ 30", "recursive definition"],
    narration: ["Start from \"1\", each next term reads groups of equal digits aloud.", "n ≤ 30 so straight simulation is fine.", "Scan the string, count each run, append count then digit.", "Build with a list and join to avoid quadratic string concat.", "Time is the total length of all terms, space O(L) of the last term."],
    pitfalls: ["n = 1 returns \"1\"", "Flush the final run"],
    solution: `class Solution:
    def countAndSay(self, n: int) -> str:
        result = "1"

        for _ in range(n - 1):
            parts = []
            i = 0

            while i < len(result):
                j = i
                while j < len(result) and result[j] == result[i]:
                    j += 1
                parts.append(str(j - i) + result[i])
                i = j

            result = "".join(parts)

        return result`,
  },
  {
    id: "google-b:lc98",
    lc: 98,
    title: "Validate Binary Search Tree",
    difficulty: "Medium",
    companies: ['meta', 'amazon', 'microsoft', 'bloomberg'],
    skills: ["bst", "tree-dfs"],
    pattern: "DFS with (low, high) bounds",
    ds: ["tree"],
    constraints: "1 ≤ nodes ≤ 10^4, values fit in int32",
    time: "O(n)",
    space: "O(h)",
    insight: "Each node must fit inside bounds inherited from all ancestors, not just its parent.",
    signals: ["valid BST", "strictly less", "subtree"],
    narration: ["Strictly less on the left and strictly greater on the right, so no duplicates?", "Checking only parent-child misses a deep node violating a grandparent.", "Pass down an open interval (low, high) through DFS.", "Going left tightens high to node.val, going right tightens low.", "Visits each node once: O(n) time, O(h) recursion stack."],
    pitfalls: ["Use -inf/inf, not int min/max", "Equal values are invalid"],
    solution: `class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:

        def dfs(node, low, high):
            if not node:
                return True

            if not low < node.val < high:
                return False

            return dfs(node.left, low, node.val) and dfs(node.right, node.val, high)

        return dfs(root, float("-inf"), float("inf"))`,
  },
  {
    id: "google-b:lc876",
    lc: 876,
    title: "Middle of the Linked List",
    difficulty: "Easy",
    companies: ['amazon', 'apple'],
    skills: ["linked-list", "two-pointers"],
    pattern: "Fast and slow pointers",
    ds: ["linked list"],
    constraints: "1 ≤ nodes ≤ 100",
    time: "O(n)",
    space: "O(1)",
    insight: "Fast moves two steps, slow moves one; when fast ends, slow is in the middle.",
    signals: ["middle", "linked list", "one pass"],
    narration: ["For even length we return the second middle, right?", "Could count then walk again, but one pass is cleaner.", "Slow moves 1, fast moves 2.", "Loop while fast and fast.next exist; slow lands on the second middle.", "O(n) time, O(1) space."],
    pitfalls: ["Even length returns the second middle", "Check fast.next before fast.next.next"],
    solution: `class Solution:
    def middleNode(self, head: Optional[ListNode]) -> Optional[ListNode]:
        slow = fast = head

        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next

        return slow`,
  },
  {
    id: "google-b:lc525",
    lc: 525,
    title: "Contiguous Array",
    difficulty: "Medium",
    companies: ['meta', 'google'],
    skills: ["prefix-sum", "arrays-hashing"],
    pattern: "Prefix sum + first-seen index",
    ds: ["hashmap"],
    constraints: "1 ≤ n ≤ 10^5, values 0/1",
    time: "O(n)",
    space: "O(n)",
    insight: "Map 0 to -1; equal counts means a zero-sum subarray, so equal prefix sums.",
    signals: ["equal number of 0 and 1", "longest contiguous", "n ≤ 10^5"],
    narration: ["Longest subarray with equal 0s and 1s, binary only.", "n is 10^5, so O(n^2) over all subarrays is too slow.", "Treat 0 as -1, then balanced means the sum is zero.", "Store the first index of every prefix sum; seeing it again gives a length.", "Seed {0: -1} for subarrays starting at index 0. O(n) time and space."],
    pitfalls: ["Forget seed {0: -1}", "Only store the first index, never overwrite"],
    solution: `class Solution:
    def findMaxLength(self, nums: List[int]) -> int:
        firstSeen = {0: -1}
        total = 0
        result = 0

        for i, num in enumerate(nums):
            total += 1 if num == 1 else -1

            if total in firstSeen:
                result = max(result, i - firstSeen[total])
            else:
                firstSeen[total] = i

        return result`,
  },
  {
    id: "google-b:lc17",
    lc: 17,
    title: "Letter Combinations of a Phone Number",
    difficulty: "Medium",
    companies: ['google', 'amazon', 'meta', 'microsoft'],
    skills: ["backtracking"],
    pattern: "Backtracking over digits",
    ds: ["string"],
    constraints: "0 ≤ digits.length ≤ 4",
    time: "O(4^n · n)",
    space: "O(n)",
    insight: "Tiny n means generating every combination is the answer; one recursion level per digit.",
    signals: ["all possible combinations", "length ≤ 4", "phone keypad"],
    narration: ["Digits 2-9 only; empty input returns an empty list.", "Output itself is up to 4^n strings, so exponential is unavoidable.", "Backtrack: index into digits, try each mapped letter, recurse.", "At length n, join the path into the result.", "O(4^n · n) time, O(n) recursion depth."],
    pitfalls: ["Empty string should return []", "7 and 9 have four letters"],
    solution: `class Solution:
    def letterCombinations(self, digits: str) -> List[str]:
        if not digits:
            return []

        letters = {"2": "abc", "3": "def", "4": "ghi", "5": "jkl",
                   "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz"}
        result = []
        path = []

        def dfs(i):
            if i == len(digits):
                result.append("".join(path))
                return

            for c in letters[digits[i]]:
                path.append(c)
                dfs(i + 1)
                path.pop()

        dfs(0)
        return result`,
  },
  {
    id: "google-b:lc209",
    lc: 209,
    title: "Minimum Size Subarray Sum",
    difficulty: "Medium",
    companies: ['meta', 'google'],
    skills: ["sliding-window"],
    pattern: "Variable sliding window",
    ds: ["array"],
    constraints: "1 ≤ n ≤ 10^5, all nums positive",
    time: "O(n)",
    space: "O(1)",
    insight: "Positive numbers make the window sum monotonic, so shrink from the left while sum ≥ target.",
    signals: ["positive integers", "minimal length", "subarray sum ≥ target"],
    narration: ["All numbers positive? That is what makes a window work.", "n up to 10^5, so aim for O(n).", "Grow right, add to the sum.", "While the sum is at least target, record the length and shrink from the left.", "Each index enters and leaves once: O(n) time, O(1) space."],
    pitfalls: ["Return 0 if no window qualifies", "Negatives would break this, need prefix + deque"],
    solution: `class Solution:
    def minSubArrayLen(self, target: int, nums: List[int]) -> int:
        left = 0
        total = 0
        result = float("inf")

        for right in range(len(nums)):
            total += nums[right]

            while total >= target:
                result = min(result, right - left + 1)
                total -= nums[left]
                left += 1

        return 0 if result == float("inf") else result`,
  },
  {
    id: "google-b:lc1676",
    lc: 1676,
    title: "Lowest Common Ancestor of a Binary Tree IV",
    difficulty: "Medium",
    companies: ['google'],
    skills: ["tree-dfs"],
    pattern: "Postorder DFS with target set",
    ds: ["tree", "set"],
    constraints: "1 ≤ nodes ≤ 10^4, all target nodes exist",
    time: "O(n)",
    space: "O(n)",
    insight: "Same as two-node LCA: return a node if it is a target or both sides found something.",
    signals: ["lowest common ancestor", "array of nodes", "all exist"],
    narration: ["All given nodes exist and values are unique?", "Put the targets in a set for O(1) membership.", "DFS returns the node if it is a target; otherwise combine children.", "If both children return something, the current node is the LCA.", "One pass: O(n) time, O(n) for the set and recursion."],
    pitfalls: ["A single target node is its own LCA", "Stop descending at a target node"],
    solution: `class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', nodes: 'List[TreeNode]') -> 'TreeNode':
        targets = set(nodes)

        def dfs(node):
            if not node or node in targets:
                return node

            left = dfs(node.left)
            right = dfs(node.right)

            if left and right:
                return node

            return left or right

        return dfs(root)`,
  },
  {
    id: "google-b:lc172",
    lc: 172,
    title: "Factorial Trailing Zeroes",
    difficulty: "Medium",
    companies: ['microsoft', 'bloomberg'],
    skills: ["math", "constraints"],
    pattern: "Count factors of 5",
    ds: [],
    constraints: "0 ≤ n ≤ 10^4, follow-up O(log n)",
    time: "O(log n)",
    space: "O(1)",
    insight: "Each zero needs a 2 and a 5; fives are rarer, so count multiples of 5, 25, 125...",
    signals: ["trailing zeroes", "factorial", "logarithmic"],
    narration: ["Computing n! directly is huge; the follow-up wants O(log n).", "A trailing zero is a factor of 10 = 2 × 5, and 2s are plentiful.", "So count how many 5s appear in 1..n.", "Add n // 5, n // 25, n // 125 until the power exceeds n.", "O(log₅ n) time, O(1) space."],
    pitfalls: ["25 contributes two fives", "n = 0 returns 0"],
    solution: `class Solution:
    def trailingZeroes(self, n: int) -> int:
        result = 0

        while n:
            n //= 5
            result += n

        return result`,
  },
  {
    id: "google-b:lc207",
    lc: 207,
    title: "Course Schedule",
    difficulty: "Medium",
    companies: ['amazon', 'google', 'microsoft'],
    skills: ["topo-sort", "graph-modeling", "graph-bfs"],
    pattern: "Kahn's topological sort",
    ds: ["graph", "queue"],
    constraints: "1 ≤ courses ≤ 2000, prereqs ≤ 5000",
    time: "O(V + E)",
    space: "O(V + E)",
    insight: "Possible iff the prerequisite graph has no cycle; Kahn processes every node exactly when acyclic.",
    signals: ["prerequisites", "can you finish", "dependencies", "order"],
    narration: ["Courses are nodes, [a, b] is an edge b → a.", "Finishing all courses means no cycle in this directed graph.", "Kahn: queue every course with indegree 0.", "Pop, count it, decrement neighbors, enqueue new zeros.", "If count == numCourses there is no cycle. O(V + E) time and space."],
    pitfalls: ["Self-loop prereq [a, a]", "Disconnected components"],
    solution: `from collections import deque

class Solution:
    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
        graph = {i: [] for i in range(numCourses)}
        indegree = [0] * numCourses

        for course, prereq in prerequisites:
            graph[prereq].append(course)
            indegree[course] += 1

        queue = deque(i for i in range(numCourses) if indegree[i] == 0)
        taken = 0

        while queue:
            curr = queue.popleft()
            taken += 1

            for nxt in graph[curr]:
                indegree[nxt] -= 1
                if indegree[nxt] == 0:
                    queue.append(nxt)

        return taken == numCourses`,
  },
  {
    id: "google-b:lc1108",
    lc: 1108,
    title: "Defanging an IP Address",
    difficulty: "Easy",
    companies: ['amazon'],
    skills: ["arrays-hashing"],
    pattern: "String building",
    ds: ["string"],
    constraints: "valid IPv4 address",
    time: "O(n)",
    space: "O(n)",
    insight: "Strings are immutable; build a new one replacing each dot.",
    signals: ["replace", "IP address"],
    narration: ["Input is always a valid IPv4 address.", "Replace every \".\" with \"[.]\".", "Either str.replace or build with a list and join.", "O(n) time and space."],
    pitfalls: ["Do not concatenate in a loop in languages with immutable strings"],
    solution: `class Solution:
    def defangIPaddr(self, address: str) -> str:
        result = []

        for c in address:
            result.append("[.]" if c == "." else c)

        return "".join(result)`,
  },
  {
    id: "google-b:lc151",
    lc: 151,
    title: "Reverse Words in a String",
    difficulty: "Medium",
    companies: ['microsoft', 'bloomberg', 'apple'],
    skills: ["two-pointers", "arrays-hashing"],
    pattern: "Split and reverse",
    ds: ["string"],
    constraints: "1 ≤ s.length ≤ 10^4, extra spaces possible",
    time: "O(n)",
    space: "O(n)",
    insight: "split() with no argument drops all extra spaces; reverse the word list and join.",
    signals: ["reverse words", "leading or trailing spaces", "multiple spaces"],
    narration: ["Collapse multiple spaces and trim ends in the output?", "split() handles all the whitespace edge cases.", "Reverse the words with two pointers or slicing.", "Join with single spaces.", "O(n) time and space. In-place is possible in C++ by reversing twice."],
    pitfalls: ["split(\" \") keeps empty strings", "Leading and trailing spaces"],
    solution: `class Solution:
    def reverseWords(self, s: str) -> str:
        words = s.split()
        left, right = 0, len(words) - 1

        while left < right:
            words[left], words[right] = words[right], words[left]
            left += 1
            right -= 1

        return " ".join(words)`,
  },
  {
    id: "google-b:lc1621",
    lc: 1621,
    title: "Number of Sets of K Non-Overlapping Line Segments",
    difficulty: "Medium",
    companies: ['google'],
    skills: ["math", "dp-2d"],
    pattern: "Stars and bars combinatorics",
    ds: [],
    constraints: "2 ≤ n ≤ 1000, 1 ≤ k ≤ n-1, mod 10^9+7",
    time: "O(n)",
    space: "O(1)",
    insight: "Segments may share endpoints; duplicate shared points to get C(n+k-1, 2k) free choices.",
    signals: ["number of ways", "modulo 10^9+7", "non-overlapping segments"],
    narration: ["Segments can touch at endpoints but not overlap, and must have positive length.", "A DP over (point, segments, open?) is O(n·k), fine for n = 1000.", "Cleaner: pick 2k endpoints where a shared point counts twice.", "Adding k-1 virtual copies gives C(n + k - 1, 2k).", "O(n) with math.comb; mention the DP as the fallback."],
    pitfalls: ["Forget the modulo", "Segments of length zero are not allowed"],
    solution: `from math import comb

class Solution:
    def numberOfSets(self, n: int, k: int) -> int:
        return comb(n + k - 1, 2 * k) % (10 ** 9 + 7)`,
  },
  {
    id: "google-b:lc930",
    lc: 930,
    title: "Binary Subarrays With Sum",
    difficulty: "Medium",
    companies: ['google'],
    skills: ["prefix-sum", "arrays-hashing"],
    pattern: "Prefix sum count map",
    ds: ["hashmap"],
    constraints: "1 ≤ n ≤ 3·10^4, values 0/1",
    time: "O(n)",
    space: "O(n)",
    insight: "Count subarrays summing to goal by looking up how many earlier prefixes equal sum - goal.",
    signals: ["number of subarrays", "sum equals goal", "binary"],
    narration: ["Count subarrays with sum exactly goal; goal can be 0.", "Zeros break the simple window, so use prefix counts.", "Keep a Counter of prefix sums seen so far, seeded with {0: 1}.", "At each index add count[total - goal], then record total.", "O(n) time, O(n) space; the atMost(goal) - atMost(goal-1) window is O(1) space."],
    pitfalls: ["goal = 0 with runs of zeros", "Seed count[0] = 1"],
    solution: `from collections import Counter

class Solution:
    def numSubarraysWithSum(self, nums: List[int], goal: int) -> int:
        count = Counter({0: 1})
        total = 0
        result = 0

        for num in nums:
            total += num
            result += count[total - goal]
            count[total] += 1

        return result`,
  },
  {
    id: "google-b:lc359",
    lc: 359,
    title: "Logger Rate Limiter",
    difficulty: "Easy",
    companies: ['google'],
    skills: ["arrays-hashing", "ds-diagnosis"],
    pattern: "Hashmap of next allowed time",
    ds: ["hashmap"],
    constraints: "timestamps non-decreasing, ≤ 10^4 calls",
    time: "O(1) per call",
    space: "O(m)",
    insight: "Remember when each message is next allowed; compare and update in O(1).",
    signals: ["design", "every 10 seconds", "timestamp"],
    narration: ["Timestamps arrive in non-decreasing order?", "Store message → earliest next allowed time.", "If timestamp ≥ stored time, print and set timestamp + 10.", "O(1) per call, O(m) for unique messages; a deque could evict old ones."],
    pitfalls: ["Do not update the time when the message is blocked"],
    solution: `class Logger:

    def __init__(self):
        self.nextAllowed = {}

    def shouldPrintMessage(self, timestamp: int, message: str) -> bool:
        if timestamp < self.nextAllowed.get(message, 0):
            return False

        self.nextAllowed[message] = timestamp + 10
        return True`,
  },
  {
    id: "google-b:lc1520",
    lc: 1520,
    title: "Maximum Number of Non-Overlapping Substrings",
    difficulty: "Hard",
    companies: ['google'],
    skills: ["greedy", "intervals"],
    pattern: "Closed intervals + greedy by end",
    ds: ["array"],
    constraints: "1 ≤ n ≤ 10^5, lowercase letters",
    time: "O(26 · n)",
    space: "O(26)",
    insight: "Each letter defines a closed interval; expand it, then pick intervals greedily by earliest end.",
    signals: ["non-overlapping substrings", "all occurrences of a char", "max number then min total length"],
    narration: ["A chosen substring must contain every occurrence of each of its letters.", "Only 26 letters, so at most 26 candidate intervals.", "Start with first..last of each letter, then expand while letters inside reach outside.", "Skip candidates that start before their own letter first appears.", "Greedy by smallest right end maximizes count and keeps them short. O(26 · n)."],
    pitfalls: ["Expansion must re-scan new letters", "Ties need the shortest, which ending earliest gives"],
    solution: `class Solution:
    def maxNumOfSubstrings(self, s: str) -> List[str]:
        first, last = {}, {}

        for i, c in enumerate(s):
            first.setdefault(c, i)
            last[c] = i

        intervals = []

        for c in first:
            left, right = first[c], last[c]
            i = left
            valid = True

            while i <= right:
                if first[s[i]] < left:
                    valid = False
                    break
                right = max(right, last[s[i]])
                i += 1

            if valid:
                intervals.append((right, left))

        intervals.sort()
        result = []
        prevEnd = -1

        for right, left in intervals:
            if left > prevEnd:
                result.append(s[left:right + 1])
                prevEnd = right

        return result`,
  },
  {
    id: "google-b:lc31",
    lc: 31,
    title: "Next Permutation",
    difficulty: "Medium",
    companies: ['google', 'meta', 'microsoft'],
    skills: ["two-pointers", "arrays-hashing"],
    pattern: "Find pivot, swap, reverse suffix",
    ds: ["array"],
    constraints: "1 ≤ n ≤ 100, in place, O(1) extra",
    time: "O(n)",
    space: "O(1)",
    insight: "The suffix after the pivot is descending; swap pivot with next larger, then reverse the suffix.",
    signals: ["next lexicographically greater", "in place", "constant memory"],
    narration: ["In place, and wrap to sorted ascending if it is already the largest.", "Scan from the right for the first i with nums[i] < nums[i+1], the pivot.", "Swap it with the rightmost element larger than it.", "Reverse the suffix after i to make it the smallest.", "O(n) time, O(1) space."],
    pitfalls: ["No pivot means reverse everything", "Use < and > strictly with duplicates"],
    solution: `class Solution:
    def nextPermutation(self, nums: List[int]) -> None:
        i = len(nums) - 2

        while i >= 0 and nums[i] >= nums[i + 1]:
            i -= 1

        if i >= 0:
            j = len(nums) - 1
            while nums[j] <= nums[i]:
                j -= 1
            nums[i], nums[j] = nums[j], nums[i]

        left, right = i + 1, len(nums) - 1

        while left < right:
            nums[left], nums[right] = nums[right], nums[left]
            left += 1
            right -= 1`,
  },
  {
    id: "google-b:lc29",
    lc: 29,
    title: "Divide Two Integers",
    difficulty: "Medium",
    companies: ['meta', 'microsoft'],
    skills: ["bit", "math"],
    pattern: "Doubling subtraction (bit shifts)",
    ds: [],
    constraints: "-2^31 ≤ a, b ≤ 2^31-1, no *, /, %",
    time: "O(log² n)",
    space: "O(1)",
    insight: "Subtract the largest divisor·2^k that fits, repeatedly; like long division in binary.",
    signals: ["without multiplication", "truncate toward zero", "32-bit overflow"],
    narration: ["Truncate toward zero and clamp -2^31 / -1 to 2^31 - 1.", "Subtracting the divisor one at a time is O(n), too slow for 2^31.", "Work with absolute values and double the divisor with shifts.", "Subtract the biggest shifted chunk, add 1 << k to the quotient, repeat.", "O(log² n) time, O(1) space, then apply the sign."],
    pitfalls: ["-2^31 / -1 overflows", "Sign when exactly one is negative"],
    solution: `class Solution:
    def divide(self, dividend: int, divisor: int) -> int:
        if dividend == -2 ** 31 and divisor == -1:
            return 2 ** 31 - 1

        negative = (dividend < 0) != (divisor < 0)
        a, b = abs(dividend), abs(divisor)
        result = 0

        while a >= b:
            shift = 0
            while a >= b << (shift + 1):
                shift += 1
            a -= b << shift
            result += 1 << shift

        return -result if negative else result`,
  },
  {
    id: "google-b:lc437",
    lc: 437,
    title: "Path Sum III",
    difficulty: "Medium",
    companies: ['amazon'],
    skills: ["prefix-sum", "tree-dfs"],
    pattern: "Prefix sums on a root-to-node path",
    ds: ["hashmap", "tree"],
    constraints: "0 ≤ nodes ≤ 1000, values ±10^9",
    time: "O(n)",
    space: "O(h)",
    insight: "Subarray-sum-equals-k on the current root path; undo the prefix count when backtracking.",
    signals: ["downward paths", "number of paths", "sum equals target"],
    narration: ["Paths go downward only but can start and end anywhere?", "Brute force from every node is O(n²), fine for 1000 but we can do O(n).", "Treat the root-to-node path like an array: count prefixes equal to curr - target.", "Add the prefix before recursing, remove it after, like backtracking.", "O(n) time, O(h) for the map and recursion."],
    pitfalls: ["Seed {0: 1}", "Forgetting to decrement leaks sums across branches"],
    solution: `from collections import defaultdict as dd

class Solution:
    def pathSum(self, root: Optional[TreeNode], targetSum: int) -> int:
        prefix = dd(int)
        prefix[0] = 1
        result = 0

        def dfs(node, curr):
            nonlocal result
            if not node:
                return

            curr += node.val
            result += prefix[curr - targetSum]

            prefix[curr] += 1
            dfs(node.left, curr)
            dfs(node.right, curr)
            prefix[curr] -= 1

        dfs(root, 0)
        return result`,
  },
  {
    id: "google-b:lc54",
    lc: 54,
    title: "Spiral Matrix",
    difficulty: "Medium",
    companies: ['amazon', 'microsoft', 'google', 'apple'],
    skills: ["grid", "math"],
    pattern: "Shrinking boundaries simulation",
    ds: ["matrix"],
    constraints: "1 ≤ m, n ≤ 10",
    time: "O(m · n)",
    space: "O(1)",
    insight: "Walk top row, right col, bottom row, left col, shrinking each boundary after use.",
    signals: ["spiral order", "matrix", "clockwise"],
    narration: ["Return all elements clockwise; matrix may be non-square.", "Keep four boundaries: top, bottom, left, right.", "Walk each side then shrink that boundary.", "Check top ≤ bottom and left ≤ right before the reverse passes to avoid duplicates.", "O(m·n) time, O(1) extra besides output."],
    pitfalls: ["Single row or column double counts", "Re-check bounds before bottom and left sweeps"],
    solution: `class Solution:
    def spiralOrder(self, matrix: List[List[int]]) -> List[int]:
        top, bottom = 0, len(matrix) - 1
        left, right = 0, len(matrix[0]) - 1
        result = []

        while top <= bottom and left <= right:
            for c in range(left, right + 1):
                result.append(matrix[top][c])
            top += 1

            for r in range(top, bottom + 1):
                result.append(matrix[r][right])
            right -= 1

            if top <= bottom:
                for c in range(right, left - 1, -1):
                    result.append(matrix[bottom][c])
                bottom -= 1

            if left <= right:
                for r in range(bottom, top - 1, -1):
                    result.append(matrix[r][left])
                left += 1

        return result`,
  },
  {
    id: "google-b:lc682",
    lc: 682,
    title: "Baseball Game",
    difficulty: "Easy",
    companies: ['amazon', 'apple'],
    skills: ["stack"],
    pattern: "Stack simulation",
    ds: ["stack"],
    constraints: "1 ≤ ops ≤ 1000",
    time: "O(n)",
    space: "O(n)",
    insight: "Every op only touches the most recent scores, which is exactly a stack.",
    signals: ["previous score", "invalidate the last", "record"],
    narration: ["Ops are always valid, so C and D never hit an empty stack?", "Each op looks at the last one or two scores: stack.", "\"+\" pushes sum of top two, \"D\" doubles top, \"C\" pops.", "Sum the stack at the end. O(n) time and space."],
    pitfalls: ["Negative numbers are strings like \"-2\""],
    solution: `class Solution:
    def calPoints(self, operations: List[str]) -> int:
        stack = []

        for op in operations:
            if op == "+":
                stack.append(stack[-1] + stack[-2])
            elif op == "D":
                stack.append(stack[-1] * 2)
            elif op == "C":
                stack.pop()
            else:
                stack.append(int(op))

        return sum(stack)`,
  },
  {
    id: "google-b:lc326",
    lc: 326,
    title: "Power of Three",
    difficulty: "Easy",
    companies: ['google'],
    skills: ["math"],
    pattern: "Divide out factors / max power trick",
    ds: [],
    constraints: "-2^31 ≤ n ≤ 2^31-1",
    time: "O(1)",
    space: "O(1)",
    insight: "3^19 is the largest int32 power of 3; since 3 is prime, only powers of 3 divide it.",
    signals: ["power of", "without loops", "int32"],
    narration: ["Negatives and zero are never powers of three.", "Loop dividing by 3 is O(log n) and totally fine to say first.", "Follow-up without loops: 3^19 = 1162261467 is the biggest power in int32.", "Since 3 is prime, its only divisors are powers of 3.", "O(1) time and space."],
    pitfalls: ["n ≤ 0", "Floating log rounding errors"],
    solution: `class Solution:
    def isPowerOfThree(self, n: int) -> bool:
        return n > 0 and 1162261467 % n == 0`,
  },
  {
    id: "google-b:lc8",
    lc: 8,
    title: "String to Integer (atoi)",
    difficulty: "Medium",
    companies: ['microsoft', 'meta', 'amazon', 'bloomberg'],
    skills: ["math"],
    pattern: "Careful parsing state machine",
    ds: ["string"],
    constraints: "0 ≤ s.length ≤ 200, clamp to int32",
    time: "O(n)",
    space: "O(1)",
    insight: "Skip spaces, read one sign, read digits, stop at anything else, clamp at the end.",
    signals: ["parse", "clamp", "whitespace", "sign"],
    narration: ["Leading spaces, optional sign, digits, then ignore the rest; clamp to int32.", "Walk an index through each phase in order.", "Accumulate result = result * 10 + digit.", "Python ints do not overflow, so clamp once at the end.", "O(n) time, O(1) space."],
    pitfalls: ["\"+-12\" returns 0", "Only whitespace", "Clamp both directions"],
    solution: `class Solution:
    def myAtoi(self, s: str) -> int:
        i, n = 0, len(s)

        while i < n and s[i] == " ":
            i += 1

        sign = 1
        if i < n and s[i] in "+-":
            sign = -1 if s[i] == "-" else 1
            i += 1

        result = 0
        while i < n and s[i].isdigit():
            result = result * 10 + int(s[i])
            i += 1

        result *= sign
        return max(-2 ** 31, min(2 ** 31 - 1, result))`,
  },
  {
    id: "google-b:lc1235",
    lc: 1235,
    title: "Maximum Profit in Job Scheduling",
    difficulty: "Hard",
    companies: ['google', 'amazon'],
    skills: ["dp-1d", "binary-search", "intervals"],
    pattern: "Sort by start + DP + binary search",
    ds: ["array"],
    constraints: "1 ≤ n ≤ 5·10^4, times ≤ 10^9",
    time: "O(n log n)",
    space: "O(n)",
    insight: "dp[i]: skip job i, or take it and jump to the first job starting after it ends.",
    signals: ["non-overlapping", "maximum profit", "weighted intervals", "n ≤ 5·10^4"],
    narration: ["A job ending at t can be followed by one starting at t?", "Greedy fails with weights; this is weighted interval scheduling.", "Sort by start, dp[i] = max(dp[i+1], profit[i] + dp[next]).", "next is found with bisect on the sorted starts.", "n log n for sorting and binary searches, O(n) space."],
    pitfalls: ["Times up to 10^9 rule out a timeline array", "bisect_left on end time allows touching"],
    solution: `import bisect

class Solution:
    def jobScheduling(self, startTime: List[int], endTime: List[int], profit: List[int]) -> int:
        jobs = sorted(zip(startTime, endTime, profit))
        starts = [s for s, _, _ in jobs]
        n = len(jobs)
        dp = [0] * (n + 1)

        for i in range(n - 1, -1, -1):
            _, end, gain = jobs[i]
            nxt = bisect.bisect_left(starts, end)
            dp[i] = max(dp[i + 1], gain + dp[nxt])

        return dp[0]`,
  },
  {
    id: "google-b:lc796",
    lc: 796,
    title: "Rotate String",
    difficulty: "Easy",
    companies: ['amazon'],
    skills: ["arrays-hashing"],
    pattern: "Doubled string containment",
    ds: ["string"],
    constraints: "1 ≤ length ≤ 100",
    time: "O(n²)",
    space: "O(n)",
    insight: "Every rotation of s is a substring of s + s.",
    signals: ["shift", "rotate", "leftmost to rightmost"],
    narration: ["Lengths must match first.", "All rotations of s appear inside s + s.", "So check goal in s + s.", "Python find is O(n²) worst; KMP makes it O(n)."],
    pitfalls: ["Different lengths", "Empty-ish edge cases"],
    solution: `class Solution:
    def rotateString(self, s: str, goal: str) -> bool:
        return len(s) == len(goal) and goal in s + s`,
  },
  {
    id: "google-b:lc1658",
    lc: 1658,
    title: "Minimum Operations to Reduce X to Zero",
    difficulty: "Medium",
    companies: ['google', 'amazon'],
    skills: ["sliding-window", "prefix-sum"],
    pattern: "Longest middle window with sum total - x",
    ds: ["array"],
    constraints: "1 ≤ n ≤ 10^5, nums positive",
    time: "O(n)",
    space: "O(1)",
    insight: "Removing from both ends leaves a middle subarray; maximize its length with sum = total - x.",
    signals: ["remove from left or right", "minimum operations", "positive"],
    narration: ["Elements are positive, so window sums are monotonic.", "Choices at both ends explode; flip it to the middle that stays.", "Find the longest subarray with sum total - x via a sliding window.", "Answer is n minus that length, or -1 if none.", "O(n) time, O(1) space."],
    pitfalls: ["target = 0 means remove everything", "target < 0 is impossible"],
    solution: `class Solution:
    def minOperations(self, nums: List[int], x: int) -> int:
        target = sum(nums) - x
        if target < 0:
            return -1

        left = 0
        total = 0
        longest = -1

        for right in range(len(nums)):
            total += nums[right]

            while total > target:
                total -= nums[left]
                left += 1

            if total == target:
                longest = max(longest, right - left + 1)

        return -1 if longest == -1 else len(nums) - longest`,
  },
  {
    id: "google-b:lc76",
    lc: 76,
    title: "Minimum Window Substring",
    difficulty: "Hard",
    companies: ['meta', 'google', 'amazon', 'microsoft'],
    skills: ["sliding-window", "arrays-hashing"],
    pattern: "Sliding window with need counter",
    ds: ["hashmap"],
    constraints: "1 ≤ m, n ≤ 10^5",
    time: "O(m + n)",
    space: "O(k)",
    insight: "Expand until all needed chars are covered, then shrink while still valid, tracking the best.",
    signals: ["minimum window", "contains all characters", "including duplicates"],
    narration: ["Duplicates in t count, and the answer is unique if it exists?", "n up to 10^5, so one pass with a window.", "Counter for t and a \"missing\" count of chars still needed.", "Expand right; once missing is 0, shrink left as far as it stays valid.", "O(m + n) time, O(k) for distinct chars."],
    pitfalls: ["Duplicate chars in t", "Return \"\" when no window"],
    solution: `from collections import Counter

class Solution:
    def minWindow(self, s: str, t: str) -> str:
        need = Counter(t)
        missing = len(t)
        left = 0
        start, end = 0, 0

        for right, c in enumerate(s, 1):
            if need[c] > 0:
                missing -= 1
            need[c] -= 1

            if missing == 0:
                while need[s[left]] < 0:
                    need[s[left]] += 1
                    left += 1

                if end == 0 or right - left < end - start:
                    start, end = left, right

                need[s[left]] += 1
                missing += 1
                left += 1

        return s[start:end]`,
  },
  {
    id: "google-b:lc349",
    lc: 349,
    title: "Intersection of Two Arrays",
    difficulty: "Easy",
    companies: ['meta', 'amazon'],
    skills: ["arrays-hashing"],
    pattern: "Set intersection",
    ds: ["set"],
    constraints: "1 ≤ n, m ≤ 1000",
    time: "O(n + m)",
    space: "O(n)",
    insight: "Unique common values is exactly what a set intersection gives.",
    signals: ["unique", "intersection", "any order"],
    narration: ["Each value appears once in the output, any order.", "Put one array in a set, scan the other.", "Add hits to a result set.", "O(n + m) time, O(n) space. Sorted inputs could use two pointers."],
    pitfalls: ["Duplicates in output"],
    solution: `class Solution:
    def intersection(self, nums1: List[int], nums2: List[int]) -> List[int]:
        seen = set(nums1)
        result = set()

        for num in nums2:
            if num in seen:
                result.add(num)

        return list(result)`,
  },
  {
    id: "google-b:lc110",
    lc: 110,
    title: "Balanced Binary Tree",
    difficulty: "Easy",
    companies: ['amazon', 'google', 'bloomberg'],
    skills: ["tree-dfs"],
    pattern: "Postorder height with -1 sentinel",
    ds: ["tree"],
    constraints: "0 ≤ nodes ≤ 5000",
    time: "O(n)",
    space: "O(h)",
    insight: "Return height bottom-up and -1 the moment any subtree is unbalanced.",
    signals: ["height-balanced", "differ by more than one"],
    narration: ["Balanced means every node, not just the root.", "Calling height at every node is O(n²).", "Postorder DFS returns height, or -1 if unbalanced below.", "Check both children then |left - right| ≤ 1.", "O(n) time, O(h) stack."],
    pitfalls: ["Only checking the root", "Propagate -1 upward"],
    solution: `class Solution:
    def isBalanced(self, root: Optional[TreeNode]) -> bool:

        def dfs(node):
            if not node:
                return 0

            left = dfs(node.left)
            right = dfs(node.right)

            if left == -1 or right == -1 or abs(left - right) > 1:
                return -1

            return 1 + max(left, right)

        return dfs(root) != -1`,
  },
  {
    id: "google-b:lc34",
    lc: 34,
    title: "Find First and Last Position of Element in Sorted Array",
    difficulty: "Medium",
    companies: ['google', 'meta', 'amazon'],
    skills: ["binary-search"],
    pattern: "Two lower-bound binary searches",
    ds: ["array"],
    constraints: "0 ≤ n ≤ 10^5, sorted, must be O(log n)",
    time: "O(log n)",
    space: "O(1)",
    insight: "First = lower_bound(target); last = lower_bound(target + 1) - 1.",
    signals: ["sorted", "O(log n)", "starting and ending position"],
    narration: ["Sorted with duplicates, and O(log n) is required.", "One lower-bound search finds the first index ≥ target.", "Searching for target + 1 gives one past the last.", "If first is out of range or not target, return [-1, -1].", "Two binary searches: O(log n), O(1) space."],
    pitfalls: ["Empty array", "Off-by-one in right bound"],
    solution: `class Solution:
    def searchRange(self, nums: List[int], target: int) -> List[int]:

        def lowerBound(value):
            left, right = 0, len(nums)
            while left < right:
                mid = (left + right) // 2
                if nums[mid] < value:
                    left = mid + 1
                else:
                    right = mid
            return left

        first = lowerBound(target)
        if first == len(nums) or nums[first] != target:
            return [-1, -1]

        return [first, lowerBound(target + 1) - 1]`,
  },
  {
    id: "google-b:lc167",
    lc: 167,
    title: "Two Sum II - Input Array Is Sorted",
    difficulty: "Medium",
    companies: ['amazon'],
    skills: ["two-pointers"],
    pattern: "Converging two pointers",
    ds: ["array"],
    constraints: "2 ≤ n ≤ 3·10^4, sorted, O(1) extra space",
    time: "O(n)",
    space: "O(1)",
    insight: "Sorted lets you move left up when the sum is small and right down when it is big.",
    signals: ["sorted", "constant extra space", "exactly one solution"],
    narration: ["1-indexed output, exactly one answer, O(1) extra space.", "A hashmap works but wastes the sorted order and space.", "Pointers at both ends; compare the sum to target.", "Too small, move left up; too big, move right down.", "O(n) time, O(1) space."],
    pitfalls: ["Return 1-indexed", "Do not reuse the same element"],
    solution: `class Solution:
    def twoSum(self, numbers: List[int], target: int) -> List[int]:
        left, right = 0, len(numbers) - 1

        while left < right:
            total = numbers[left] + numbers[right]

            if total == target:
                return [left + 1, right + 1]
            if total < target:
                left += 1
            else:
                right -= 1

        return []`,
  },
  {
    id: "google-b:lc371",
    lc: 371,
    title: "Sum of Two Integers",
    difficulty: "Medium",
    companies: ['microsoft', 'amazon'],
    skills: ["bit"],
    pattern: "XOR sum + AND carry with 32-bit mask",
    ds: [],
    constraints: "-1000 ≤ a, b ≤ 1000, no + or -",
    time: "O(1)",
    space: "O(1)",
    insight: "a ^ b adds without carry, (a & b) << 1 is the carry; loop until no carry.",
    signals: ["without + or -", "bitwise"],
    narration: ["No + or -, and values are small.", "XOR is addition ignoring carries; AND then shift is the carry.", "Repeat until the carry is zero.", "Python ints are unbounded, so mask to 32 bits and convert back if the sign bit is set.", "At most 32 iterations: O(1)."],
    pitfalls: ["Python infinite loop on negatives without a mask"],
    solution: `class Solution:
    def getSum(self, a: int, b: int) -> int:
        mask = 0xFFFFFFFF

        while b & mask:
            carry = (a & b) << 1
            a = a ^ b
            b = carry

        a &= mask
        return a if a <= 0x7FFFFFFF else ~(a ^ mask)`,
  },
  {
    id: "google-b:lc62",
    lc: 62,
    title: "Unique Paths",
    difficulty: "Medium",
    companies: ['google', 'amazon', 'bloomberg'],
    skills: ["dp-2d", "grid"],
    pattern: "Grid DP (right/down)",
    ds: ["array"],
    constraints: "1 ≤ m, n ≤ 100",
    time: "O(m · n)",
    space: "O(n)",
    insight: "Paths into a cell = paths from above + paths from the left.",
    signals: ["only right or down", "number of unique paths", "grid"],
    narration: ["Robot moves only right or down, count paths to the corner.", "Brute recursion is exponential; subproblems overlap.", "dp[c] holds paths to the current row cell; dp[c] += dp[c-1].", "First row and column are all 1.", "O(m·n) time, O(n) space. Math alternative: C(m+n-2, m-1)."],
    pitfalls: ["1×1 grid has one path"],
    solution: `class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        dp = [1] * n

        for _ in range(1, m):
            for c in range(1, n):
                dp[c] += dp[c - 1]

        return dp[-1]`,
  },
  {
    id: "google-b:lc64",
    lc: 64,
    title: "Minimum Path Sum",
    difficulty: "Medium",
    companies: ['google', 'amazon', 'bloomberg'],
    skills: ["dp-2d", "grid"],
    pattern: "Grid DP (min of up/left)",
    ds: ["matrix"],
    constraints: "1 ≤ m, n ≤ 200, values ≥ 0",
    time: "O(m · n)",
    space: "O(1)",
    insight: "Best cost to a cell = its value + min(best from above, best from left).",
    signals: ["minimum sum", "only right or down", "non-negative"],
    narration: ["Moves are right/down only and values are non-negative.", "Each cell depends only on top and left: classic grid DP.", "Update the grid in place to save space (or use one row).", "First row/col only have one predecessor.", "O(m·n) time, O(1) extra if in place."],
    pitfalls: ["Mutating input; mention it or copy", "Edges of the grid"],
    solution: `class Solution:
    def minPathSum(self, grid: List[List[int]]) -> int:
        rows, cols = len(grid), len(grid[0])

        for r in range(rows):
            for c in range(cols):
                if r == 0 and c == 0:
                    continue
                up = grid[r - 1][c] if r > 0 else float("inf")
                left = grid[r][c - 1] if c > 0 else float("inf")
                grid[r][c] += min(up, left)

        return grid[-1][-1]`,
  },
  {
    id: "google-b:lc22",
    lc: 22,
    title: "Generate Parentheses",
    difficulty: "Medium",
    companies: ['google', 'amazon', 'microsoft', 'bloomberg'],
    skills: ["backtracking"],
    pattern: "Backtracking with open/close counts",
    ds: ["string"],
    constraints: "1 ≤ n ≤ 8",
    time: "O(4^n / √n)",
    space: "O(n)",
    insight: "Add \"(\" while open < n and \")\" while close < open; every leaf is valid.",
    signals: ["all combinations", "well-formed", "n ≤ 8"],
    narration: ["Generate all well-formed strings with n pairs.", "Generating all 2^(2n) strings then filtering is wasteful.", "Track open and close counts so we only build valid prefixes.", "At length 2n, record the string.", "Catalan-number many results: about O(4^n / √n), depth O(n)."],
    pitfalls: ["Allowing close > open"],
    solution: `class Solution:
    def generateParenthesis(self, n: int) -> List[str]:
        result = []
        path = []

        def dfs(opened, closed):
            if len(path) == 2 * n:
                result.append("".join(path))
                return

            if opened < n:
                path.append("(")
                dfs(opened + 1, closed)
                path.pop()

            if closed < opened:
                path.append(")")
                dfs(opened, closed + 1)
                path.pop()

        dfs(0, 0)
        return result`,
  },
  {
    id: "google-b:lc1380",
    lc: 1380,
    title: "Lucky Numbers in a Matrix",
    difficulty: "Easy",
    companies: ['amazon'],
    skills: ["arrays-hashing", "grid"],
    pattern: "Row mins ∩ column maxes",
    ds: ["set"],
    constraints: "1 ≤ m, n ≤ 50, distinct values",
    time: "O(m · n)",
    space: "O(m + n)",
    insight: "A lucky number is both its row min and column max; intersect the two sets.",
    signals: ["minimum in its row", "maximum in its column", "distinct"],
    narration: ["Values are distinct, so at most one lucky number exists.", "Compute each row min and each column max.", "Intersect them as sets.", "O(m·n) time, O(m + n) space."],
    pitfalls: ["zip(*matrix) for columns"],
    solution: `class Solution:
    def luckyNumbers(self, matrix: List[List[int]]) -> List[int]:
        rowMins = {min(row) for row in matrix}
        colMaxes = {max(col) for col in zip(*matrix)}

        return list(rowMins & colMaxes)`,
  },
  {
    id: "google-b:lc2035",
    lc: 2035,
    title: "Partition Array Into Two Arrays to Minimize Sum Difference",
    difficulty: "Hard",
    companies: ['google'],
    skills: ["binary-search", "constraints", "backtracking"],
    pattern: "Meet in the middle + binary search",
    ds: ["hashmap", "array"],
    constraints: "1 ≤ n ≤ 15, nums.length = 2n",
    time: "O(2^n · n)",
    space: "O(2^n)",
    insight: "2^30 is too big but 2^15 per half is fine; pair subset sums of each size with bisect.",
    signals: ["2n elements", "n ≤ 15", "minimize absolute difference"],
    narration: ["Two halves of exactly n each, minimize |sumA - sumB|.", "2^30 subsets is too many, but n ≤ 15 screams meet in the middle.", "Split the array; for each half, group subset sums by how many elements were picked.", "Pick k from the left and n-k from the right; bisect for the sum closest to total / 2.", "O(2^n · n) time, O(2^n) space."],
    pitfalls: ["Must pick exactly n elements total", "Negative numbers are allowed"],
    solution: `import bisect
from collections import defaultdict as dd

class Solution:
    def minimumDifference(self, nums: List[int]) -> int:
        n = len(nums) // 2
        total = sum(nums)

        def subsetSums(arr):
            sums = dd(list)
            for mask in range(1 << n):
                count = bin(mask).count("1")
                sums[count].append(sum(arr[i] for i in range(n) if mask >> i & 1))
            return sums

        leftSums = subsetSums(nums[:n])
        rightSums = subsetSums(nums[n:])
        result = float("inf")

        for k in range(n + 1):
            right = sorted(rightSums[n - k])

            for leftSum in leftSums[k]:
                want = total / 2 - leftSum
                i = bisect.bisect_left(right, want)

                for j in (i - 1, i):
                    if 0 <= j < len(right):
                        half = leftSum + right[j]
                        result = min(result, abs(total - 2 * half))

        return result`,
  },
  {
    id: "google-b:lc1970",
    lc: 1970,
    title: "Last Day Where You Can Still Cross",
    difficulty: "Hard",
    companies: ['google'],
    skills: ["union-find", "grid", "binary-search"],
    pattern: "Reverse time + Union-Find",
    ds: ["union-find"],
    constraints: "2 ≤ rows·cols ≤ 2·10^4",
    time: "O(r·c · α)",
    space: "O(r·c)",
    insight: "Run time backwards turning water into land; the first moment top joins bottom is the answer.",
    signals: ["last day", "cells flood over time", "top to bottom", "monotonic"],
    narration: ["Crossing is monotonic: once impossible, it stays impossible.", "Option 1: binary search the day and BFS each guess, O(r·c log(r·c)).", "Option 2: go backwards, adding land; union with land neighbors.", "Virtual top and bottom nodes join row 0 and the last row.", "When top and bottom connect, that day is the answer. Near O(r·c)."],
    pitfalls: ["Day indexing is 1-based in cells", "Union with virtual nodes for edge rows"],
    solution: `class Solution:
    def latestDayToCross(self, row: int, col: int, cells: List[List[int]]) -> int:
        top, bottom = row * col, row * col + 1
        parent = list(range(row * col + 2))
        land = set()

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        def union(a, b):
            parent[find(a)] = find(b)

        for day in range(len(cells) - 1, -1, -1):
            r, c = cells[day][0] - 1, cells[day][1] - 1
            land.add((r, c))
            curr = r * col + c

            if r == 0:
                union(curr, top)
            if r == row - 1:
                union(curr, bottom)

            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if (nr, nc) in land:
                    union(curr, nr * col + nc)

            if find(top) == find(bottom):
                return day

        return 0`,
  },
  {
    id: "google-b:lc693",
    lc: 693,
    title: "Binary Number with Alternating Bits",
    difficulty: "Easy",
    companies: ['amazon'],
    skills: ["bit"],
    pattern: "XOR with shifted self",
    ds: [],
    constraints: "1 ≤ n ≤ 2^31-1",
    time: "O(1)",
    space: "O(1)",
    insight: "Alternating bits make x = n ^ (n >> 1) all ones, so x & (x + 1) == 0.",
    signals: ["adjacent bits", "alternating", "binary"],
    narration: ["Check adjacent bits always differ.", "Simple version: loop over bits comparing n & 1 with the previous bit.", "Trick: n ^ (n >> 1) becomes all ones exactly when bits alternate.", "All ones plus one is a power of two, so x & (x + 1) == 0.", "O(1) time and space."],
    pitfalls: ["Leading zeros do not count"],
    solution: `class Solution:
    def hasAlternatingBits(self, n: int) -> bool:
        x = n ^ (n >> 1)
        return x & (x + 1) == 0`,
  },
  {
    id: "google-b:lc3026",
    lc: 3026,
    title: "Maximum Good Subarray Sum",
    difficulty: "Medium",
    companies: ['google'],
    skills: ["prefix-sum", "arrays-hashing"],
    pattern: "Prefix sums + min prefix per value",
    ds: ["hashmap"],
    constraints: "2 ≤ n ≤ 10^5, values ±10^9",
    time: "O(n)",
    space: "O(n)",
    insight: "For each end j, the best start i has nums[i] = nums[j] ± k and the smallest prefix before it.",
    signals: ["|nums[i] - nums[j]| == k", "maximum subarray sum", "n ≤ 10^5"],
    narration: ["Subarray endpoints must differ by exactly k; return 0 if none.", "O(n²) pairs is too slow for 10^5.", "sum(i..j) = prefix[j+1] - prefix[i], so minimize prefix[i] per value nums[i].", "Map value → smallest prefix sum before that index.", "At j check nums[j] - k and nums[j] + k. O(n) time and space."],
    pitfalls: ["Answer can be negative but return 0 only when no good subarray", "Keep the min prefix, not the first"],
    solution: `class Solution:
    def maximumSubarraySum(self, nums: List[int], k: int) -> int:
        minPrefix = {}
        total = 0
        result = float("-inf")

        for num in nums:
            if num not in minPrefix or total < minPrefix[num]:
                minPrefix[num] = total

            total += num

            for start in (num - k, num + k):
                if start in minPrefix:
                    result = max(result, total - minPrefix[start])

        return 0 if result == float("-inf") else result`,
  },
  {
    id: "google-b:lc1190",
    lc: 1190,
    title: "Reverse Substrings Between Each Pair of Parentheses",
    difficulty: "Medium",
    companies: ['microsoft', 'amazon'],
    skills: ["stack"],
    pattern: "Stack of buffers",
    ds: ["stack"],
    constraints: "1 ≤ n ≤ 2000, balanced",
    time: "O(n²)",
    space: "O(n)",
    insight: "On \")\", pop the inner buffer, reverse it, and append it to the outer one.",
    signals: ["innermost first", "parentheses", "reverse"],
    narration: ["Parentheses are balanced; the result has no brackets.", "Innermost reversals happen first, so think stack.", "Push a new buffer on \"(\", append letters to the top buffer.", "On \")\", pop, reverse, and extend the buffer below.", "O(n²) worst with n ≤ 2000 is fine; a paired-index wormhole walk gives O(n)."],
    pitfalls: ["Nested reversals cancel out", "Start with one base buffer"],
    solution: `class Solution:
    def reverseParentheses(self, s: str) -> str:
        stack = [[]]

        for c in s:
            if c == "(":
                stack.append([])
            elif c == ")":
                inner = stack.pop()
                stack[-1].extend(reversed(inner))
            else:
                stack[-1].append(c)

        return "".join(stack[0])`,
  },
  {
    id: "google-b:lc131",
    lc: 131,
    title: "Palindrome Partitioning",
    difficulty: "Medium",
    companies: ['google', 'amazon'],
    skills: ["backtracking", "dp-2d"],
    pattern: "Backtracking over cut positions",
    ds: ["string"],
    constraints: "1 ≤ n ≤ 16",
    time: "O(n · 2^n)",
    space: "O(n)",
    insight: "Choose the next palindromic prefix and recurse on the rest; n ≤ 16 allows all cuts.",
    signals: ["all possible partitions", "palindrome", "n ≤ 16"],
    narration: ["Return every way to cut s into palindromes.", "n ≤ 16 means 2^n cut patterns is fine.", "From index i, try every end j where s[i:j+1] is a palindrome.", "Recurse from j + 1; at the end record a copy of the path.", "O(n · 2^n) time, O(n) depth; a palindrome DP table avoids rechecks."],
    pitfalls: ["Append a copy of path", "Single chars are palindromes"],
    solution: `class Solution:
    def partition(self, s: str) -> List[List[str]]:
        result = []
        path = []

        def dfs(i):
            if i == len(s):
                result.append(path[:])
                return

            for j in range(i, len(s)):
                piece = s[i:j + 1]
                if piece == piece[::-1]:
                    path.append(piece)
                    dfs(j + 1)
                    path.pop()

        dfs(0)
        return result`,
  },
  {
    id: "google-b:lc701",
    lc: 701,
    title: "Insert into a Binary Search Tree",
    difficulty: "Medium",
    companies: ['microsoft'],
    skills: ["bst"],
    pattern: "Walk down by BST order",
    ds: ["tree"],
    constraints: "0 ≤ nodes ≤ 10^4, value not present",
    time: "O(h)",
    space: "O(1)",
    insight: "Follow the BST comparisons down to a null child and hang the new node there.",
    signals: ["insert", "BST", "any valid tree"],
    narration: ["The value is guaranteed new, and any valid BST is accepted?", "BST order tells us which side at each node.", "Walk down iteratively until the child slot is empty.", "Attach the node there; empty tree returns the new node.", "O(h) time, O(1) space iteratively."],
    pitfalls: ["Empty root", "Skewed tree makes h = n"],
    solution: `class Solution:
    def insertIntoBST(self, root: Optional[TreeNode], val: int) -> Optional[TreeNode]:
        if not root:
            return TreeNode(val)

        curr = root

        while True:
            if val < curr.val:
                if not curr.left:
                    curr.left = TreeNode(val)
                    return root
                curr = curr.left
            else:
                if not curr.right:
                    curr.right = TreeNode(val)
                    return root
                curr = curr.right`,
  },
  {
    id: "google-b:lc1478",
    lc: 1478,
    title: "Allocate Mailboxes",
    difficulty: "Hard",
    companies: ['amazon'],
    skills: ["dp-2d", "math"],
    pattern: "Partition DP with median cost",
    ds: ["matrix"],
    constraints: "1 ≤ k ≤ n ≤ 100",
    time: "O(n² · k)",
    space: "O(n²)",
    insight: "One mailbox per group at the median; DP splits sorted houses into k contiguous groups.",
    signals: ["minimum total distance", "k mailboxes", "n ≤ 100"],
    narration: ["Houses on a line, k mailboxes, minimize total distance.", "Sort: each mailbox serves a contiguous block, best placed at the median.", "Precompute cost[i][j] for one mailbox serving houses i..j.", "dp[j][m] = min over i of dp[i][m-1] + cost[i][j-1].", "n ≤ 100 so O(n² · k) is about 10^6. Space O(n²)."],
    pitfalls: ["Sort houses first", "cost[i][j] = cost[i + 1][j - 1] + houses[j] - houses[i] keeps the build O(n²)"],
    solution: `from functools import cache

class Solution:
    def minDistance(self, houses: List[int], k: int) -> int:
        houses.sort()
        n = len(houses)
        cost = [[0] * n for _ in range(n)]

        for i in range(n - 1, -1, -1):
            for j in range(i + 1, n):
                cost[i][j] = cost[i + 1][j - 1] + houses[j] - houses[i]

        @cache
        def dfs(i, boxes):
            if i == n:
                return 0 if boxes == 0 else float("inf")
            if boxes == 0:
                return float("inf")

            return min(cost[i][j] + dfs(j + 1, boxes - 1) for j in range(i, n))

        return dfs(0, k)`,
  },
  {
    id: "google-b:lc56",
    lc: 56,
    title: "Merge Intervals",
    difficulty: "Medium",
    companies: ['google', 'meta', 'bloomberg', 'amazon'],
    skills: ["intervals", "greedy"],
    pattern: "Sort by start, merge into last",
    ds: ["array"],
    constraints: "1 ≤ n ≤ 10^4",
    time: "O(n log n)",
    space: "O(n)",
    insight: "After sorting by start, an interval overlaps only the last merged one.",
    signals: ["overlapping intervals", "merge"],
    narration: ["Touching intervals like [1,4] and [4,5] merge?", "Sort by start so overlaps become adjacent.", "If the next start ≤ last end, extend the end with max.", "Otherwise push a new interval.", "Sorting dominates: O(n log n), O(n) output."],
    pitfalls: ["Use max for the end (containment)", "Touching endpoints"],
    solution: `class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        intervals.sort()
        result = [intervals[0]]

        for start, end in intervals[1:]:
            if start <= result[-1][1]:
                result[-1][1] = max(result[-1][1], end)
            else:
                result.append([start, end])

        return result`,
  },
  {
    id: "google-b:lc1047",
    lc: 1047,
    title: "Remove All Adjacent Duplicates In String",
    difficulty: "Easy",
    companies: ['meta', 'bloomberg'],
    skills: ["stack"],
    pattern: "Stack cancellation",
    ds: ["stack"],
    constraints: "1 ≤ n ≤ 10^5",
    time: "O(n)",
    space: "O(n)",
    insight: "Removing a pair can expose a new pair; a stack top is always the left neighbor.",
    signals: ["adjacent duplicates", "repeatedly remove"],
    narration: ["Remove adjacent equal pairs until none remain.", "Repeated scanning is O(n²) worst.", "Push chars; if the top equals the current char, pop instead.", "The stack is the final string.", "O(n) time and space."],
    pitfalls: ["Chains like \"abba\" collapse fully"],
    solution: `class Solution:
    def removeDuplicates(self, s: str) -> str:
        stack = []

        for c in s:
            if stack and stack[-1] == c:
                stack.pop()
            else:
                stack.append(c)

        return "".join(stack)`,
  },
  {
    id: "google-b:lc235",
    lc: 235,
    title: "Lowest Common Ancestor of a Binary Search Tree",
    difficulty: "Medium",
    companies: ['microsoft', 'amazon'],
    skills: ["bst"],
    pattern: "Split point in BST",
    ds: ["tree"],
    constraints: "2 ≤ nodes ≤ 10^5, p and q exist",
    time: "O(h)",
    space: "O(1)",
    insight: "The LCA is the first node whose value lies between p and q.",
    signals: ["BST", "lowest common ancestor"],
    narration: ["Both nodes exist and a node can be its own ancestor.", "BST order tells us where p and q are without searching both sides.", "If both are smaller go left, both larger go right.", "Otherwise they split here, so this is the LCA.", "O(h) time, O(1) space."],
    pitfalls: ["p is an ancestor of q"],
    solution: `class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        curr = root

        while curr:
            if p.val < curr.val and q.val < curr.val:
                curr = curr.left
            elif p.val > curr.val and q.val > curr.val:
                curr = curr.right
            else:
                return curr`,
  },
  {
    id: "google-b:lc417",
    lc: 417,
    title: "Pacific Atlantic Water Flow",
    difficulty: "Medium",
    companies: ['google', 'amazon'],
    skills: ["grid", "graph-dfs", "graph-modeling"],
    pattern: "Reverse multi-source DFS from each ocean",
    ds: ["set", "matrix"],
    constraints: "1 ≤ m, n ≤ 200",
    time: "O(m · n)",
    space: "O(m · n)",
    insight: "Flip the flow: climb uphill from each ocean border, then intersect the two reachable sets.",
    signals: ["flow to both oceans", "height", "border cells"],
    narration: ["Water flows to equal or lower neighbors; edges touch the oceans.", "DFS from every cell is O((mn)²).", "Reverse it: start from the ocean borders and move to neighbors ≥ current.", "Do it once per ocean, then intersect the visited sets.", "Each cell visited twice: O(m·n) time and space."],
    pitfalls: ["Use >= when climbing", "Corners touch both oceans"],
    solution: `class Solution:
    def pacificAtlantic(self, heights: List[List[int]]) -> List[List[int]]:
        rows, cols = len(heights), len(heights[0])
        pacific, atlantic = set(), set()

        def dfs(r, c, seen):
            seen.add((r, c))

            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if (0 <= nr < rows and 0 <= nc < cols and (nr, nc) not in seen
                        and heights[nr][nc] >= heights[r][c]):
                    dfs(nr, nc, seen)

        for r in range(rows):
            dfs(r, 0, pacific)
            dfs(r, cols - 1, atlantic)

        for c in range(cols):
            dfs(0, c, pacific)
            dfs(rows - 1, c, atlantic)

        return [[r, c] for r, c in pacific & atlantic]`,
  },
  {
    id: "google-b:lc268",
    lc: 268,
    title: "Missing Number",
    difficulty: "Easy",
    companies: ['microsoft', 'amazon', 'meta'],
    skills: ["bit", "math"],
    pattern: "XOR or Gauss sum",
    ds: [],
    constraints: "1 ≤ n ≤ 10^4, distinct in [0, n], O(1) space",
    time: "O(n)",
    space: "O(1)",
    insight: "XOR all indices 0..n with all values; pairs cancel and the missing one remains.",
    signals: ["range [0, n]", "missing", "constant space"],
    narration: ["n distinct numbers from 0..n, exactly one missing.", "A set works but uses O(n) space.", "Gauss: n(n+1)/2 minus the sum; or XOR indices with values.", "Everything present cancels, leaving the missing number.", "O(n) time, O(1) space."],
    pitfalls: ["Missing number can be n itself"],
    solution: `class Solution:
    def missingNumber(self, nums: List[int]) -> int:
        result = len(nums)

        for i, num in enumerate(nums):
            result ^= i ^ num

        return result`,
  },
  {
    id: "google-b:lc1111",
    lc: 1111,
    title: "Maximum Nesting Depth of Two Valid Parentheses Strings",
    difficulty: "Medium",
    companies: ['google'],
    skills: ["stack", "greedy"],
    pattern: "Assign by depth parity",
    ds: ["array"],
    constraints: "1 ≤ n ≤ 10^4, valid parentheses",
    time: "O(n)",
    space: "O(1)",
    insight: "Alternate nesting levels between A and B; depth parity halves the max depth.",
    signals: ["split into two", "minimize max depth", "valid parentheses"],
    narration: ["Split a valid string into two valid subsequences minimizing the deeper one.", "Max depth d can at best be split into ceil(d / 2).", "Track depth; give odd levels to A and even levels to B.", "For \"(\" increment then assign, for \")\" assign then decrement, so pairs match.", "O(n) time, O(1) extra."],
    pitfalls: ["Opening and closing of a pair must get the same label"],
    solution: `class Solution:
    def maxDepthAfterSplit(self, seq: str) -> List[int]:
        result = []
        depth = 0

        for c in seq:
            if c == "(":
                depth += 1
                result.append(depth % 2)
            else:
                result.append(depth % 2)
                depth -= 1

        return result`,
  },
  {
    id: "google-b:lc1071",
    lc: 1071,
    title: "Greatest Common Divisor of Strings",
    difficulty: "Easy",
    companies: ['google'],
    skills: ["math"],
    pattern: "Concatenation check + gcd of lengths",
    ds: ["string"],
    constraints: "1 ≤ lengths ≤ 1000",
    time: "O(n + m)",
    space: "O(n + m)",
    insight: "A common divisor exists iff s1 + s2 == s2 + s1; then its length is gcd(len1, len2).",
    signals: ["divides both", "largest string", "repeated"],
    narration: ["x divides s if s is x repeated some times.", "If s1 + s2 != s2 + s1 there is no common base.", "Otherwise the answer is the prefix of length gcd(len1, len2).", "O(n + m) time and space."],
    pitfalls: ["No divisor returns \"\""],
    solution: `from math import gcd

class Solution:
    def gcdOfStrings(self, str1: str, str2: str) -> str:
        if str1 + str2 != str2 + str1:
            return ""

        return str1[:gcd(len(str1), len(str2))]`,
  },
  {
    id: "google-b:lc778",
    lc: 778,
    title: "Swim in Rising Water",
    difficulty: "Hard",
    companies: ['google'],
    skills: ["dijkstra", "grid", "heap"],
    pattern: "Minimax Dijkstra with heap",
    ds: ["heap", "set"],
    constraints: "1 ≤ n ≤ 50, values are a permutation",
    time: "O(n² log n)",
    space: "O(n²)",
    insight: "Path cost is its max cell; Dijkstra works with max instead of sum.",
    signals: ["minimum time", "max elevation on path", "grid"],
    narration: ["Cost of a path is the highest elevation on it; minimize that.", "Dijkstra still works because max is monotonic along a path.", "Heap of (time so far, r, c); pop smallest, push neighbors with max(time, height).", "First time we pop the bottom-right cell, that is the answer.", "O(n² log n) time, O(n²) space. Binary search + BFS also works."],
    pitfalls: ["Start cost is grid[0][0]", "Mark seen when popped or pushed consistently"],
    solution: `import heapq

class Solution:
    def swimInWater(self, grid: List[List[int]]) -> int:
        n = len(grid)
        heap = [(grid[0][0], 0, 0)]
        seen = {(0, 0)}

        while heap:
            time, r, c = heapq.heappop(heap)

            if r == n - 1 and c == n - 1:
                return time

            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < n and 0 <= nc < n and (nr, nc) not in seen:
                    seen.add((nr, nc))
                    heapq.heappush(heap, (max(time, grid[nr][nc]), nr, nc))

        return -1`,
  },
  {
    id: "google-b:lc136",
    lc: 136,
    title: "Single Number",
    difficulty: "Easy",
    companies: ['amazon', 'apple'],
    skills: ["bit"],
    pattern: "XOR everything",
    ds: [],
    constraints: "1 ≤ n ≤ 3·10^4, O(n) time, O(1) space",
    time: "O(n)",
    space: "O(1)",
    insight: "x ^ x = 0 and x ^ 0 = x, so all pairs cancel.",
    signals: ["every element twice except one", "constant extra space"],
    narration: ["Everything appears twice except one, and O(1) space is required.", "A set or Counter works but uses O(n).", "XOR is commutative and cancels pairs.", "XOR every number; the leftover is the answer.", "O(n) time, O(1) space."],
    pitfalls: ["Negatives work fine with XOR"],
    solution: `class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        result = 0

        for num in nums:
            result ^= num

        return result`,
  },
  {
    id: "google-b:lc278",
    lc: 278,
    title: "First Bad Version",
    difficulty: "Easy",
    companies: ['meta', 'microsoft'],
    skills: ["binary-search"],
    pattern: "Binary search for first true",
    ds: [],
    constraints: "1 ≤ bad ≤ n ≤ 2^31-1",
    time: "O(log n)",
    space: "O(1)",
    insight: "isBad is false…false true…true; find the boundary with left < right search.",
    signals: ["minimize API calls", "n up to 2^31", "first"],
    narration: ["Versions after a bad one are all bad: monotonic predicate.", "n up to 2^31 means linear is way too slow.", "Binary search: if mid is bad, the answer is mid or left of it.", "Otherwise move left past mid. Loop ends when left == right.", "O(log n) calls, O(1) space."],
    pitfalls: ["right = mid, not mid - 1", "Overflow in other languages for (l + r) / 2"],
    solution: `class Solution:
    def firstBadVersion(self, n: int) -> int:
        left, right = 1, n

        while left < right:
            mid = (left + right) // 2

            if isBadVersion(mid):
                right = mid
            else:
                left = mid + 1

        return left`,
  },
  {
    id: "google-b:lc424",
    lc: 424,
    title: "Longest Repeating Character Replacement",
    difficulty: "Medium",
    companies: ['google'],
    skills: ["sliding-window", "arrays-hashing"],
    pattern: "Sliding window with max frequency",
    ds: ["hashmap"],
    constraints: "1 ≤ n ≤ 10^5, uppercase letters",
    time: "O(n)",
    space: "O(26)",
    insight: "A window is valid if its length minus its top letter count is ≤ k.",
    signals: ["at most k replacements", "longest substring", "same letter"],
    narration: ["Uppercase only, replace up to k chars to get one repeated letter.", "n is 10^5, so O(n) or O(26n).", "Window with letter counts and the best count seen.", "If length - maxCount > k, shrink from the left.", "maxCount never needs to decrease since only bigger windows matter. O(n), O(26)."],
    pitfalls: ["Recomputing max over counts is O(26n), still fine"],
    solution: `from collections import defaultdict as dd

class Solution:
    def characterReplacement(self, s: str, k: int) -> int:
        count = dd(int)
        left = 0
        maxCount = 0
        result = 0

        for right in range(len(s)):
            count[s[right]] += 1
            maxCount = max(maxCount, count[s[right]])

            if right - left + 1 - maxCount > k:
                count[s[left]] -= 1
                left += 1

            result = max(result, right - left + 1)

        return result`,
  },
  {
    id: "google-b:lc354",
    lc: 354,
    title: "Russian Doll Envelopes",
    difficulty: "Hard",
    companies: ['google'],
    skills: ["binary-search", "dp-1d", "greedy"],
    pattern: "Sort (w asc, h desc) + LIS patience",
    ds: ["array"],
    constraints: "1 ≤ n ≤ 10^5",
    time: "O(n log n)",
    space: "O(n)",
    insight: "Sort width ascending and height descending, then LIS on heights blocks equal widths.",
    signals: ["fit inside", "both dimensions strictly greater", "n ≤ 10^5"],
    narration: ["Both width and height must be strictly bigger; no rotation.", "O(n²) LIS DP times out at 10^5.", "Sort by width asc, height desc so same-width envelopes cannot chain.", "Then it is LIS on heights with bisect_left tails.", "O(n log n) time, O(n) space."],
    pitfalls: ["Equal widths must not nest", "bisect_left for strict increase"],
    solution: `import bisect

class Solution:
    def maxEnvelopes(self, envelopes: List[List[int]]) -> int:
        envelopes.sort(key=lambda e: (e[0], -e[1]))
        tails = []

        for _, height in envelopes:
            i = bisect.bisect_left(tails, height)

            if i == len(tails):
                tails.append(height)
            else:
                tails[i] = height

        return len(tails)`,
  },
  {
    id: "google-b:lc981",
    lc: 981,
    title: "Time Based Key-Value Store",
    difficulty: "Medium",
    companies: ['amazon', 'google'],
    skills: ["binary-search", "arrays-hashing", "ds-diagnosis"],
    pattern: "Hashmap of sorted lists + bisect",
    ds: ["hashmap", "array"],
    constraints: "timestamps strictly increasing per set, ≤ 2·10^5 calls",
    time: "O(1) set, O(log n) get",
    space: "O(n)",
    insight: "Timestamps arrive increasing, so each key list is already sorted for binary search.",
    signals: ["timestamp_prev ≤ timestamp", "design", "largest timestamp ≤"],
    narration: ["Are set timestamps strictly increasing? That keeps lists sorted.", "Map each key to a list of (timestamp, value).", "get binary searches for the last timestamp ≤ the query.", "Return \"\" if none.", "Set O(1), get O(log n), O(n) space."],
    pitfalls: ["bisect_right then minus one", "Unknown key"],
    solution: `import bisect
from collections import defaultdict as dd

class TimeMap:

    def __init__(self):
        self.times = dd(list)
        self.values = dd(list)

    def set(self, key: str, value: str, timestamp: int) -> None:
        self.times[key].append(timestamp)
        self.values[key].append(value)

    def get(self, key: str, timestamp: int) -> str:
        i = bisect.bisect_right(self.times[key], timestamp) - 1
        return self.values[key][i] if i >= 0 else ""`,
  },
  {
    id: "google-b:lc836",
    lc: 836,
    title: "Rectangle Overlap",
    difficulty: "Easy",
    companies: ['amazon'],
    skills: ["math", "intervals"],
    pattern: "Interval overlap on each axis",
    ds: [],
    constraints: "coordinates within ±10^9",
    time: "O(1)",
    space: "O(1)",
    insight: "Rectangles overlap iff their x-intervals and y-intervals both overlap with positive length.",
    signals: ["axis-aligned", "positive area", "touching does not count"],
    narration: ["Touching edges or corners do not count as overlap.", "Project onto each axis: two intervals.", "Overlap on an axis means max(starts) < min(ends).", "Need both axes. O(1) time and space."],
    pitfalls: ["Use strict <", "Degenerate zero-area rectangles"],
    solution: `class Solution:
    def isRectangleOverlap(self, rec1: List[int], rec2: List[int]) -> bool:
        xOverlap = max(rec1[0], rec2[0]) < min(rec1[2], rec2[2])
        yOverlap = max(rec1[1], rec2[1]) < min(rec1[3], rec2[3])

        return xOverlap and yOverlap`,
  },
  {
    id: "google-b:lc219",
    lc: 219,
    title: "Contains Duplicate II",
    difficulty: "Easy",
    companies: ['amazon'],
    skills: ["arrays-hashing", "sliding-window"],
    pattern: "Last-seen index map",
    ds: ["hashmap"],
    constraints: "1 ≤ n ≤ 10^5, 0 ≤ k ≤ 10^5",
    time: "O(n)",
    space: "O(n)",
    insight: "Only the most recent index of each value matters for distance ≤ k.",
    signals: ["abs(i - j) ≤ k", "duplicate", "n ≤ 10^5"],
    narration: ["Need equal values at distance ≤ k.", "Checking all pairs is O(n²); too slow at 10^5.", "Keep value → last index; compare on each new occurrence.", "A size-k sliding set also works with O(k) space.", "O(n) time, O(n) space."],
    pitfalls: ["k = 0 always false"],
    solution: `class Solution:
    def containsNearbyDuplicate(self, nums: List[int], k: int) -> bool:
        lastSeen = {}

        for i, num in enumerate(nums):
            if num in lastSeen and i - lastSeen[num] <= k:
                return True
            lastSeen[num] = i

        return False`,
  },
  {
    id: "google-b:lc149",
    lc: 149,
    title: "Max Points on a Line",
    difficulty: "Hard",
    companies: ['google'],
    skills: ["arrays-hashing", "math"],
    pattern: "Slope hashing per anchor (gcd)",
    ds: ["hashmap"],
    constraints: "1 ≤ n ≤ 300, points unique",
    time: "O(n² log C)",
    space: "O(n)",
    insight: "Fix an anchor; points sharing a reduced slope with it are on one line.",
    signals: ["same straight line", "n ≤ 300", "points"],
    narration: ["Points are unique, n ≤ 300, so O(n²) is fine.", "For each anchor, hash the slope to every later point.", "Avoid floats: reduce (dx, dy) by gcd and normalize the sign.", "Best count + 1 for the anchor is a candidate.", "O(n² log C) for gcd, O(n) space per anchor."],
    pitfalls: ["Float slopes lose precision", "Vertical lines", "n = 1 returns 1"],
    solution: `from collections import Counter
from math import gcd

class Solution:
    def maxPoints(self, points: List[List[int]]) -> int:
        result = 1

        for i, (x1, y1) in enumerate(points):
            slopes = Counter()

            for x2, y2 in points[i + 1:]:
                dx, dy = x2 - x1, y2 - y1
                g = gcd(dx, dy)
                dx, dy = dx // g, dy // g

                if dx < 0 or (dx == 0 and dy < 0):
                    dx, dy = -dx, -dy

                slopes[(dx, dy)] += 1
                result = max(result, slopes[(dx, dy)] + 1)

        return result`,
  },
  {
    id: "google-b:lc709",
    lc: 709,
    title: "To Lower Case",
    difficulty: "Easy",
    companies: ['amazon'],
    skills: ["arrays-hashing"],
    pattern: "ASCII offset",
    ds: ["string"],
    constraints: "1 ≤ n ≤ 100, printable ASCII",
    time: "O(n)",
    space: "O(n)",
    insight: "Uppercase letters are 32 below lowercase in ASCII; shift only 'A'..'Z'.",
    signals: ["lowercase", "ASCII"],
    narration: ["Probably expected to avoid str.lower().", "Uppercase A-Z map to lowercase by adding 32.", "Leave every other char as is.", "O(n) time and space."],
    pitfalls: ["Shifting non-letters"],
    solution: `class Solution:
    def toLowerCase(self, s: str) -> str:
        result = []

        for c in s:
            if "A" <= c <= "Z":
                result.append(chr(ord(c) + 32))
            else:
                result.append(c)

        return "".join(result)`,
  },
  {
    id: "google-b:lc448",
    lc: 448,
    title: "Find All Numbers Disappeared in an Array",
    difficulty: "Easy",
    companies: ['google'],
    skills: ["arrays-hashing"],
    pattern: "In-place index marking",
    ds: ["array"],
    constraints: "1 ≤ n ≤ 10^5, values in [1, n]",
    time: "O(n)",
    space: "O(1)",
    insight: "Values in [1, n] are indices; negate nums[v-1] to mark v as seen.",
    signals: ["values in [1, n]", "no extra space", "disappeared"],
    narration: ["Values are within 1..n; output does not count as extra space.", "A set works but uses O(n).", "Use the array as the set: negate the slot at abs(value) - 1.", "Indices still positive at the end are missing.", "O(n) time, O(1) extra."],
    pitfalls: ["Use abs when reading", "Do not double-negate"],
    solution: `class Solution:
    def findDisappearedNumbers(self, nums: List[int]) -> List[int]:
        for num in nums:
            i = abs(num) - 1
            nums[i] = -abs(nums[i])

        return [i + 1 for i in range(len(nums)) if nums[i] > 0]`,
  },
  {
    id: "google-b:lc2812",
    lc: 2812,
    title: "Find the Safest Path in a Grid",
    difficulty: "Medium",
    companies: ['google'],
    skills: ["graph-bfs", "grid", "dijkstra"],
    pattern: "Multi-source BFS + max-min Dijkstra",
    ds: ["queue", "heap"],
    constraints: "1 ≤ n ≤ 400",
    time: "O(n² log n)",
    space: "O(n²)",
    insight: "BFS from all thieves gives each cell its safeness; then maximize the path minimum.",
    signals: ["safeness factor", "distance to nearest thief", "maximum minimum"],
    narration: ["Safeness is the min Manhattan distance to any thief along the path.", "Step one: multi-source BFS from every thief fills distances in O(n²).", "Step two: find the path maximizing its minimum cell distance.", "Max-heap Dijkstra on that bottleneck value; binary search + BFS also works.", "O(n² log n) time, O(n²) space."],
    pitfalls: ["Thief on start or end means 0", "Seed BFS with all thieves at once"],
    solution: `import heapq
from collections import deque

class Solution:
    def maximumSafenessFactor(self, grid: List[List[int]]) -> int:
        n = len(grid)
        dist = [[-1] * n for _ in range(n)]
        queue = deque()

        for r in range(n):
            for c in range(n):
                if grid[r][c] == 1:
                    dist[r][c] = 0
                    queue.append((r, c))

        directions = ((1, 0), (-1, 0), (0, 1), (0, -1))

        while queue:
            r, c = queue.popleft()
            for dr, dc in directions:
                nr, nc = r + dr, c + dc
                if 0 <= nr < n and 0 <= nc < n and dist[nr][nc] == -1:
                    dist[nr][nc] = dist[r][c] + 1
                    queue.append((nr, nc))

        heap = [(-dist[0][0], 0, 0)]
        seen = {(0, 0)}

        while heap:
            safe, r, c = heapq.heappop(heap)
            safe = -safe

            if r == n - 1 and c == n - 1:
                return safe

            for dr, dc in directions:
                nr, nc = r + dr, c + dc
                if 0 <= nr < n and 0 <= nc < n and (nr, nc) not in seen:
                    seen.add((nr, nc))
                    heapq.heappush(heap, (-min(safe, dist[nr][nc]), nr, nc))

        return 0`,
  },
  {
    id: "google-b:lc645",
    lc: 645,
    title: "Set Mismatch",
    difficulty: "Easy",
    companies: ['amazon'],
    skills: ["arrays-hashing", "math"],
    pattern: "Index marking (or sum math)",
    ds: ["array"],
    constraints: "2 ≤ n ≤ 10^4, values in [1, n]",
    time: "O(n)",
    space: "O(1)",
    insight: "Mark seen values by negating their slot; a slot already negative reveals the duplicate.",
    signals: ["one duplicated", "one missing", "values 1..n"],
    narration: ["Exactly one number appears twice and one is missing.", "Counter is O(n) space; we can mark in place.", "Negate nums[v-1]; if it is already negative, v is the duplicate.", "The one index still positive is the missing value.", "O(n) time, O(1) extra."],
    pitfalls: ["Return [duplicate, missing] order"],
    solution: `class Solution:
    def findErrorNums(self, nums: List[int]) -> List[int]:
        duplicate = missing = 0

        for num in nums:
            i = abs(num) - 1
            if nums[i] < 0:
                duplicate = abs(num)
            else:
                nums[i] = -nums[i]

        for i in range(len(nums)):
            if nums[i] > 0:
                missing = i + 1

        return [duplicate, missing]`,
  },
  {
    id: "google-b:lc678",
    lc: 678,
    title: "Valid Parenthesis String",
    difficulty: "Medium",
    companies: ['meta', 'amazon', 'microsoft'],
    skills: ["greedy", "stack"],
    pattern: "Greedy open-count range",
    ds: [],
    constraints: "1 ≤ n ≤ 100",
    time: "O(n)",
    space: "O(1)",
    insight: "Track the min and max possible open count; '*' widens the range.",
    signals: ["'*' can be '(' or ')' or empty", "valid parentheses"],
    narration: ["'*' is a wildcard: open, close, or nothing.", "DP over (index, open) is O(n²), fine for 100, but greedy is O(n).", "Keep low and high possible open counts.", "If high < 0 fail; clamp low at 0. Valid if low == 0 at the end.", "O(n) time, O(1) space."],
    pitfalls: ["Clamp low to 0", "Early exit when high < 0"],
    solution: `class Solution:
    def checkValidString(self, s: str) -> bool:
        low = high = 0

        for c in s:
            if c == "(":
                low += 1
                high += 1
            elif c == ")":
                low -= 1
                high -= 1
            else:
                low -= 1
                high += 1

            if high < 0:
                return False
            low = max(low, 0)

        return low == 0`,
  },
  {
    id: "google-b:lc463",
    lc: 463,
    title: "Island Perimeter",
    difficulty: "Easy",
    companies: ['meta', 'amazon', 'google'],
    skills: ["grid"],
    pattern: "Count edges per land cell",
    ds: ["matrix"],
    constraints: "1 ≤ rows, cols ≤ 100, one island",
    time: "O(r · c)",
    space: "O(1)",
    insight: "Each land cell adds 4, minus 2 for every land neighbor shared above or left.",
    signals: ["perimeter", "island", "grid"],
    narration: ["Exactly one island and no lakes.", "No traversal needed: just count edges.", "Each land cell gives 4; a shared edge removes 2.", "Check only up and left so each shared edge counts once.", "O(r·c) time, O(1) space."],
    pitfalls: ["Double subtracting shared edges"],
    solution: `class Solution:
    def islandPerimeter(self, grid: List[List[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        result = 0

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 1:
                    result += 4
                    if r > 0 and grid[r - 1][c] == 1:
                        result -= 2
                    if c > 0 and grid[r][c - 1] == 1:
                        result -= 2

        return result`,
  },
  {
    id: "google-b:lc2441",
    lc: 2441,
    title: "Largest Positive Integer That Exists With Its Negative",
    difficulty: "Easy",
    companies: ['amazon'],
    skills: ["arrays-hashing"],
    pattern: "Set lookup",
    ds: ["set"],
    constraints: "1 ≤ n ≤ 1000, no zeros",
    time: "O(n)",
    space: "O(n)",
    insight: "Put all numbers in a set; the answer is the max k > 0 with -k also present.",
    signals: ["both k and -k", "largest"],
    narration: ["Return -1 if no pair exists.", "Sorting plus two pointers is O(n log n).", "A set gives O(1) lookup for -k.", "Scan and keep the largest positive with its negative present.", "O(n) time and space."],
    pitfalls: ["Return -1 when none"],
    solution: `class Solution:
    def findMaxK(self, nums: List[int]) -> int:
        seen = set(nums)
        result = -1

        for num in nums:
            if num > 0 and -num in seen:
                result = max(result, num)

        return result`,
  },
]

const mcqs = [
  {"id": "google-b:lc835:mcq", "skills": ["arrays-hashing", "grid", "constraints", "ds-diagnosis"], "difficulty": 2, "q": "Image Overlap (1 ≤ n ≤ 30, cells are 0/1). Which approach fits?", "choices": ["Translation vector counting", "Grid DFS returning size", "BFS shortest path, 8 directions", "Binary search on answer + BFS"], "answer": 0, "why": "Translation vector counting: Every overlap comes from one shift vector; count (dr, dc) over all pairs of ones."},
  {"id": "google-b:lc155:mcq", "skills": ["stack", "ds-diagnosis", "complexity", "constraints"], "difficulty": 2, "q": "Min Stack (up to 3·10^4 calls, all O(1)). What is the optimal time / space?", "choices": ["O(n^4) time · O(n^2) space", "O(1) per op time · O(n) space", "O(h) time · O(1) space", "O(n) per op time · O(n) space"], "answer": 1, "why": "Stack of (value, min so far): Store the running minimum alongside each value so pop restores the old min for free."},
  {"id": "google-b:lc977:mcq", "skills": ["two-pointers", "ds-diagnosis"], "difficulty": 1, "q": "Squares of a Sorted Array (1 ≤ n ≤ 10^4, sorted, may be negative). Which approach fits?", "choices": ["Fast / slow (Floyd)", "Binary search for first true", "Two pointers from both ends", "Sliding window (min length)"], "answer": 2, "why": "Two pointers from both ends: Largest square is always at one of the two ends; fill the result from the back."},
  {"id": "google-b:lc38:mcq", "skills": ["math", "arrays-hashing", "complexity", "constraints"], "difficulty": 2, "q": "Count and Say (1 ≤ n ≤ 30). What is the optimal time / space?", "choices": ["O(n · L) time · O(L) space", "O(1) per op time · O(n) space", "O(m · n) time · O(1) space", "O(n² · k) time · O(n²) space"], "answer": 0, "why": "Run-length simulation: Each term is the run-length encoding of the previous one; just simulate n-1 times."},
  {"id": "google-b:lc98:mcq", "skills": ["bst", "tree-dfs", "ds-diagnosis"], "difficulty": 2, "q": "Validate Binary Search Tree (1 ≤ nodes ≤ 10^4, values fit in int32). Which approach fits?", "choices": ["Iterative inorder", "DFS with (low, high) bounds", "Walk down by BST order", "Split point in BST"], "answer": 1, "why": "DFS with (low, high) bounds: Each node must fit inside bounds inherited from all ancestors, not just its parent."},
  {"id": "google-b:lc876:mcq", "skills": ["linked-list", "two-pointers", "complexity", "constraints"], "difficulty": 1, "q": "Middle of the Linked List (1 ≤ nodes ≤ 100). What is the optimal time / space?", "choices": ["O(n) time · O(1) space", "O(2^n · n) time · O(2^n) space", "O(n² log n) time · O(n²) space", "O(n log n) time · O(1) space"], "answer": 0, "why": "Fast and slow pointers: Fast moves two steps, slow moves one; when fast ends, slow is in the middle."},
  {"id": "google-b:lc525:mcq", "skills": ["prefix-sum", "arrays-hashing", "ds-diagnosis"], "difficulty": 2, "q": "Contiguous Array (1 ≤ n ≤ 10^5, values 0/1). Which approach fits?", "choices": ["Prefix sum + first-seen index", "atMost(k) − atMost(k−1)", "Two pointers with running max", "Kadane's"], "answer": 0, "why": "Prefix sum + first-seen index: Map 0 to -1; equal counts means a zero-sum subarray, so equal prefix sums."},
  {"id": "google-b:lc17:mcq", "skills": ["backtracking", "complexity", "constraints"], "difficulty": 2, "q": "Letter Combinations of a Phone Number (0 ≤ digits.length ≤ 4). What is the optimal time / space?", "choices": ["O(4^n · n) time · O(n) space", "O(4^n / √n) time · O(n) space", "O(n · 2^n) time · O(n) space", "O(2^n · n) time · O(2^n) space"], "answer": 0, "why": "Backtracking over digits: Tiny n means generating every combination is the answer; one recursion level per digit."},
  {"id": "google-b:lc209:mcq", "skills": ["sliding-window", "ds-diagnosis"], "difficulty": 2, "q": "Minimum Size Subarray Sum (1 ≤ n ≤ 10^5, all nums positive). Which approach fits?", "choices": ["Monotonic stack", "Variable sliding window", "Backtracking (take / skip)", "Prefix sum + first-seen index"], "answer": 1, "why": "Variable sliding window: Positive numbers make the window sum monotonic, so shrink from the left while sum ≥ target."},
  {"id": "google-b:lc1676:mcq", "skills": ["tree-dfs", "complexity", "constraints"], "difficulty": 2, "q": "Lowest Common Ancestor of a Binary Tree IV (1 ≤ nodes ≤ 10^4, all target nodes exist). What is the optimal time / space?", "choices": ["O(n) time · O(n) space", "O(log² n) time · O(1) space", "O(n·α(n)) time · O(n) space", "O(n²) time · O(n²) space"], "answer": 0, "why": "Postorder DFS with target set: Same as two-node LCA: return a node if it is a target or both sides found something."},
  {"id": "google-b:lc172:mcq", "skills": ["math", "constraints", "ds-diagnosis"], "difficulty": 2, "q": "Factorial Trailing Zeroes (0 ≤ n ≤ 10^4, follow-up O(log n)). Which approach fits?", "choices": ["Converging pointers, move the shorter", "Sliding window with max frequency", "Backtracking (take / skip)", "Count factors of 5"], "answer": 3, "why": "Count factors of 5: Each zero needs a 2 and a 5; fives are rarer, so count multiples of 5, 25, 125..."},
  {"id": "google-b:lc207:mcq", "skills": ["topo-sort", "graph-modeling", "graph-bfs", "complexity", "constraints"], "difficulty": 2, "q": "Course Schedule (1 ≤ courses ≤ 2000, prereqs ≤ 5000). What is the optimal time / space?", "choices": ["O(E log V) time · O(V + E) space", "O(V + E) time · O(V + E) space", "O((V+E) log V) time · O(V+E) space", "O(h) time · O(1) space"], "answer": 1, "why": "Kahn's topological sort: Possible iff the prerequisite graph has no cycle; Kahn processes every node exactly when acyclic."},
  {"id": "google-b:lc1108:mcq", "skills": ["arrays-hashing", "ds-diagnosis"], "difficulty": 1, "q": "Defanging an IP Address (valid IPv4 address). Which approach fits?", "choices": ["String building", "Trie", "Closed intervals + greedy by end", "Build graph from adjacent pairs + topological sort"], "answer": 0, "why": "String building: Strings are immutable; build a new one replacing each dot."},
  {"id": "google-b:lc151:mcq", "skills": ["two-pointers", "arrays-hashing", "complexity", "constraints"], "difficulty": 2, "q": "Reverse Words in a String (1 ≤ s.length ≤ 10^4, extra spaces possible). What is the optimal time / space?", "choices": ["O(n²·α(n)) time · O(n) space", "O(n·α(n)) time · O(n) space", "O(n) time · O(n) space", "O(n log n) time · O(n) space"], "answer": 2, "why": "Split and reverse: split() with no argument drops all extra spaces; reverse the word list and join."},
  {"id": "google-b:lc1621:mcq", "skills": ["math", "dp-2d", "ds-diagnosis"], "difficulty": 2, "q": "Number of Sets of K Non-Overlapping Line Segments (2 ≤ n ≤ 1000, 1 ≤ k ≤ n-1, mod 10^9+7). Which approach fits?", "choices": ["Grid DP (right/down)", "Grid DP (min of up/left)", "Interval DP (last to burst)", "Stars and bars combinatorics"], "answer": 3, "why": "Stars and bars combinatorics: Segments may share endpoints; duplicate shared points to get C(n+k-1, 2k) free choices."},
  {"id": "google-b:lc930:mcq", "skills": ["prefix-sum", "arrays-hashing", "complexity", "constraints"], "difficulty": 2, "q": "Binary Subarrays With Sum (1 ≤ n ≤ 3·10^4, values 0/1). What is the optimal time / space?", "choices": ["O(n²) time · O(n) space", "O(4^n / √n) time · O(n) space", "O(n) time · O(n) space", "O(N·α(n) + N log N) time · O(N) space"], "answer": 2, "why": "Prefix sum count map: Count subarrays summing to goal by looking up how many earlier prefixes equal sum - goal."},
  {"id": "google-b:lc359:mcq", "skills": ["arrays-hashing", "ds-diagnosis"], "difficulty": 1, "q": "Logger Rate Limiter (timestamps non-decreasing, ≤ 10^4 calls). Which approach fits?", "choices": ["Directed cycle detection", "Stack simulation", "prev / curr pointers", "Hashmap of next allowed time"], "answer": 3, "why": "Hashmap of next allowed time: Remember when each message is next allowed; compare and update in O(1)."},
  {"id": "google-b:lc1520:mcq", "skills": ["greedy", "intervals", "complexity", "constraints"], "difficulty": 3, "q": "Maximum Number of Non-Overlapping Substrings (1 ≤ n ≤ 10^5, lowercase letters). What is the optimal time / space?", "choices": ["O(26 · n) time · O(26) space", "O(n log n) time · O(1) space", "O(n log S) time · O(1) space", "O(n²) time · O(n²) space"], "answer": 0, "why": "Closed intervals + greedy by end: Each letter defines a closed interval; expand it, then pick intervals greedily by earliest end."},
  {"id": "google-b:lc31:mcq", "skills": ["two-pointers", "arrays-hashing", "ds-diagnosis"], "difficulty": 2, "q": "Next Permutation (1 ≤ n ≤ 100, in place, O(1) extra). Which approach fits?", "choices": ["Fast / slow (Floyd)", "Sort then two pointers", "Find pivot, swap, reverse suffix", "Backtracking with used set"], "answer": 2, "why": "Find pivot, swap, reverse suffix: The suffix after the pivot is descending; swap pivot with next larger, then reverse the suffix."},
  {"id": "google-b:lc29:mcq", "skills": ["bit", "math", "complexity", "constraints"], "difficulty": 2, "q": "Divide Two Integers (-2^31 ≤ a, b ≤ 2^31-1, no *, /, %). What is the optimal time / space?", "choices": ["O(n) time · O(1) space", "O(n^3) time · O(n^2) space", "O(log² n) time · O(1) space", "O(n^4) time · O(n^2) space"], "answer": 2, "why": "Doubling subtraction (bit shifts): Subtract the largest divisor·2^k that fits, repeatedly; like long division in binary."},
  {"id": "google-b:lc437:mcq", "skills": ["prefix-sum", "tree-dfs", "ds-diagnosis"], "difficulty": 2, "q": "Path Sum III (0 ≤ nodes ≤ 1000, values ±10^9). Which approach fits?", "choices": ["Two pointers with running max", "Prefix sums on a root-to-node path", "Bottom-up DFS", "Divide by inorder index"], "answer": 1, "why": "Prefix sums on a root-to-node path: Subarray-sum-equals-k on the current root path; undo the prefix count when backtracking."},
  {"id": "google-b:lc54:mcq", "skills": ["grid", "math", "complexity", "constraints"], "difficulty": 2, "q": "Spiral Matrix (1 ≤ m, n ≤ 10). What is the optimal time / space?", "choices": ["O(n · m log m) time · O(n · m) space", "O(n + m) time · O(1) space", "O(m + n) time · O(k) space", "O(m · n) time · O(1) space"], "answer": 3, "why": "Shrinking boundaries simulation: Walk top row, right col, bottom row, left col, shrinking each boundary after use."},
  {"id": "google-b:lc682:mcq", "skills": ["stack", "ds-diagnosis"], "difficulty": 1, "q": "Baseball Game (1 ≤ ops ≤ 1000). Which approach fits?", "choices": ["Greedy open-count range", "Iterative inorder", "Assign by depth parity", "Stack simulation"], "answer": 3, "why": "Stack simulation: Every op only touches the most recent scores, which is exactly a stack."},
  {"id": "google-b:lc326:mcq", "skills": ["math", "complexity", "constraints"], "difficulty": 1, "q": "Power of Three (-2^31 ≤ n ≤ 2^31-1). What is the optimal time / space?", "choices": ["O(r·c · α) time · O(r·c) space", "O(1) time · O(1) space", "O(n) time · O(1) space", "O(2^n · n) time · O(2^n) space"], "answer": 1, "why": "Divide out factors / max power trick: 3^19 is the largest int32 power of 3; since 3 is prime, only powers of 3 divide it."},
  {"id": "google-b:lc8:mcq", "skills": ["math", "ds-diagnosis"], "difficulty": 2, "q": "String to Integer (atoi) (0 ≤ s.length ≤ 200, clamp to int32). Which approach fits?", "choices": ["Careful parsing state machine", "Boyer-Moore voting", "Prefix sum + hashmap", "Running minimum"], "answer": 0, "why": "Careful parsing state machine: Skip spaces, read one sign, read digits, stop at anything else, clamp at the end."},
  {"id": "google-b:lc1235:mcq", "skills": ["dp-1d", "binary-search", "intervals", "complexity", "constraints"], "difficulty": 3, "q": "Maximum Profit in Job Scheduling (1 ≤ n ≤ 5·10^4, times ≤ 10^9). What is the optimal time / space?", "choices": ["O(n²) time · O(n) space", "O(n log n) time · O(n) space", "O(n² log n) time · O(n²) space", "O(n) time · O(n) space"], "answer": 1, "why": "Sort by start + DP + binary search: dp[i]: skip job i, or take it and jump to the first job starting after it ends."},
  {"id": "google-b:lc796:mcq", "skills": ["arrays-hashing", "ds-diagnosis"], "difficulty": 1, "q": "Rotate String (1 ≤ length ≤ 100). Which approach fits?", "choices": ["Floyd fast / slow", "Multi-source BFS by layers", "Hashmap + binary search", "Doubled string containment"], "answer": 3, "why": "Doubled string containment: Every rotation of s is a substring of s + s."},
  {"id": "google-b:lc1658:mcq", "skills": ["sliding-window", "prefix-sum", "complexity", "constraints"], "difficulty": 2, "q": "Minimum Operations to Reduce X to Zero (1 ≤ n ≤ 10^5, nums positive). What is the optimal time / space?", "choices": ["O(log² n) time · O(1) space", "O(n · 2^n) time · O(n) space", "O(n²) time · O(n²) space", "O(n) time · O(1) space"], "answer": 3, "why": "Longest middle window with sum total - x: Removing from both ends leaves a middle subarray; maximize its length with sum = total - x."},
  {"id": "google-b:lc76:mcq", "skills": ["sliding-window", "arrays-hashing", "ds-diagnosis"], "difficulty": 3, "q": "Minimum Window Substring (1 ≤ m, n ≤ 10^5). Which approach fits?", "choices": ["Monotonic deque", "atMost(k) − atMost(k−1)", "Sliding window with need counter", "Monotonic deque of indices"], "answer": 2, "why": "Sliding window with need counter: Expand until all needed chars are covered, then shrink while still valid, tracking the best."},
  {"id": "google-b:lc349:mcq", "skills": ["arrays-hashing", "complexity", "constraints"], "difficulty": 1, "q": "Intersection of Two Arrays (1 ≤ n, m ≤ 1000). What is the optimal time / space?", "choices": ["O(m·n) time · O(n) space", "O(n + m) time · O(n) space", "O(m + n) time · O(1) space", "O(log(m·n)) time · O(1) space"], "answer": 1, "why": "Set intersection: Unique common values is exactly what a set intersection gives."},
  {"id": "google-b:lc110:mcq", "skills": ["tree-dfs", "ds-diagnosis"], "difficulty": 1, "q": "Balanced Binary Tree (0 ≤ nodes ≤ 5000). Which approach fits?", "choices": ["Postorder height with -1 sentinel", "Prefix sums on a root-to-node path", "Top-down DFS with bounds", "Bottom-up DFS"], "answer": 0, "why": "Postorder height with -1 sentinel: Return height bottom-up and -1 the moment any subtree is unbalanced."},
  {"id": "google-b:lc34:mcq", "skills": ["binary-search", "complexity", "constraints"], "difficulty": 2, "q": "Find First and Last Position of Element in Sorted Array (0 ≤ n ≤ 10^5, sorted, must be O(log n)). What is the optimal time / space?", "choices": ["O(2^n · n) time · O(2^n) space", "O(log n) time · O(1) space", "O(n²) time · O(n) space", "O(n log n) time · O(n) space"], "answer": 1, "why": "Two lower-bound binary searches: First = lower_bound(target); last = lower_bound(target + 1) - 1."},
  {"id": "google-b:lc167:mcq", "skills": ["two-pointers", "ds-diagnosis"], "difficulty": 2, "q": "Two Sum II - Input Array Is Sorted (2 ≤ n ≤ 3·10^4, sorted, O(1) extra space). Which approach fits?", "choices": ["Middle + reverse + weave", "Converging two pointers", "Floyd fast / slow", "Read/write swap"], "answer": 1, "why": "Converging two pointers: Sorted lets you move left up when the sum is small and right down when it is big."},
  {"id": "google-b:lc371:mcq", "skills": ["bit", "complexity", "constraints"], "difficulty": 2, "q": "Sum of Two Integers (-1000 ≤ a, b ≤ 1000, no + or -). What is the optimal time / space?", "choices": ["O(n²) time · O(n) space", "O(n + m) time · O(n + m) space", "O(1) time · O(1) space", "O(r·c · α) time · O(r·c) space"], "answer": 2, "why": "XOR sum + AND carry with 32-bit mask: a ^ b adds without carry, (a & b) << 1 is the carry; loop until no carry."},
  {"id": "google-b:lc62:mcq", "skills": ["dp-2d", "grid", "ds-diagnosis"], "difficulty": 2, "q": "Unique Paths (1 ≤ m, n ≤ 100). Which approach fits?", "choices": ["Shrinking boundaries simulation", "Reverse time + Union-Find", "Bottleneck Dijkstra", "Grid DP (right/down)"], "answer": 3, "why": "Grid DP (right/down): Paths into a cell = paths from above + paths from the left."},
  {"id": "google-b:lc64:mcq", "skills": ["dp-2d", "grid", "complexity", "constraints"], "difficulty": 2, "q": "Minimum Path Sum (1 ≤ m, n ≤ 200, values ≥ 0). What is the optimal time / space?", "choices": ["O(m + n) time · O(1) space", "O(n · m log m) time · O(n · m) space", "O(n + m) time · O(n) space", "O(m · n) time · O(1) space"], "answer": 3, "why": "Grid DP (min of up/left): Best cost to a cell = its value + min(best from above, best from left)."},
  {"id": "google-b:lc22:mcq", "skills": ["backtracking", "ds-diagnosis"], "difficulty": 2, "q": "Generate Parentheses (1 ≤ n ≤ 8). Which approach fits?", "choices": ["Backtracking with open/close counts", "Meet in the middle + binary search", "Bucket sort", "Find pivot, swap, reverse suffix"], "answer": 0, "why": "Backtracking with open/close counts: Add \"(\" while open < n and \")\" while close < open; every leaf is valid."},
  {"id": "google-b:lc1380:mcq", "skills": ["arrays-hashing", "grid", "complexity", "constraints"], "difficulty": 1, "q": "Lucky Numbers in a Matrix (1 ≤ m, n ≤ 50, distinct values). What is the optimal time / space?", "choices": ["O(n + m) time · O(m) space", "O(m · n) time · O(m + n) space", "O(n · m log m) time · O(n · m) space", "O(m + n) time · O(1) space"], "answer": 1, "why": "Row mins ∩ column maxes: A lucky number is both its row min and column max; intersect the two sets."},
  {"id": "google-b:lc2035:mcq", "skills": ["binary-search", "constraints", "backtracking", "ds-diagnosis"], "difficulty": 3, "q": "Partition Array Into Two Arrays to Minimize Sum Difference (1 ≤ n ≤ 15, nums.length = 2n). Which approach fits?", "choices": ["Meet in the middle + binary search", "Backtracking take / skip", "Hashmap of sorted lists + bisect", "Backtracking with used set"], "answer": 0, "why": "Meet in the middle + binary search: 2^30 is too big but 2^15 per half is fine; pair subset sums of each size with bisect."},
  {"id": "google-b:lc1970:mcq", "skills": ["union-find", "grid", "binary-search", "complexity", "constraints"], "difficulty": 3, "q": "Last Day Where You Can Still Cross (2 ≤ rows·cols ≤ 2·10^4). What is the optimal time / space?", "choices": ["O(rc log(rc)) time · O(rc) space", "O(r · c) time · O(1) space", "O(r·c · α) time · O(r·c) space", "O(h) time · O(1) space"], "answer": 2, "why": "Reverse time + Union-Find: Run time backwards turning water into land; the first moment top joins bottom is the answer."},
  {"id": "google-b:lc693:mcq", "skills": ["bit", "ds-diagnosis"], "difficulty": 1, "q": "Binary Number with Alternating Bits (1 ≤ n ≤ 2^31-1). Which approach fits?", "choices": ["Bit DP", "XOR with shifted self", "Right-to-left add with carry", "Doubling subtraction (bit shifts)"], "answer": 1, "why": "XOR with shifted self: Alternating bits make x = n ^ (n >> 1) all ones, so x & (x + 1) == 0."},
  {"id": "google-b:lc3026:mcq", "skills": ["prefix-sum", "arrays-hashing", "complexity", "constraints"], "difficulty": 2, "q": "Maximum Good Subarray Sum (2 ≤ n ≤ 10^5, values ±10^9). What is the optimal time / space?", "choices": ["O(n² log n) time · O(n²) space", "O(n log S) time · O(1) space", "O(n) time · O(n) space", "O(n²·α(n)) time · O(n) space"], "answer": 2, "why": "Prefix sums + min prefix per value: For each end j, the best start i has nums[i] = nums[j] ± k and the smallest prefix before it."},
  {"id": "google-b:lc1190:mcq", "skills": ["stack", "ds-diagnosis"], "difficulty": 2, "q": "Reverse Substrings Between Each Pair of Parentheses (1 ≤ n ≤ 2000, balanced). Which approach fits?", "choices": ["Assign by depth parity", "Iterative inorder", "Greedy open-count range", "Stack of buffers"], "answer": 3, "why": "Stack of buffers: On \")\", pop the inner buffer, reverse it, and append it to the outer one."},
  {"id": "google-b:lc131:mcq", "skills": ["backtracking", "dp-2d", "complexity", "constraints"], "difficulty": 2, "q": "Palindrome Partitioning (1 ≤ n ≤ 16). What is the optimal time / space?", "choices": ["O(4^n / √n) time · O(n) space", "O(n · 2^n) time · O(n) space", "O(4^n · n) time · O(n) space", "O(2^n · n) time · O(2^n) space"], "answer": 1, "why": "Backtracking over cut positions: Choose the next palindromic prefix and recurse on the rest; n ≤ 16 allows all cuts."},
  {"id": "google-b:lc701:mcq", "skills": ["bst", "ds-diagnosis"], "difficulty": 2, "q": "Insert into a Binary Search Tree (0 ≤ nodes ≤ 10^4, value not present). Which approach fits?", "choices": ["DFS with (low, high) bounds", "Iterative inorder", "Walk down by BST order", "Set + sequence starts"], "answer": 2, "why": "Walk down by BST order: Follow the BST comparisons down to a null child and hang the new node there."},
  {"id": "google-b:lc1478:mcq", "skills": ["dp-2d", "math", "complexity", "constraints"], "difficulty": 3, "q": "Allocate Mailboxes (1 ≤ k ≤ n ≤ 100). What is the optimal time / space?", "choices": ["O(n·k) time · O(n·k) space", "O(n² · k) time · O(n²) space", "O(n log k) time · O(k) space", "O(m · n) time · O(1) space"], "answer": 1, "why": "Partition DP with median cost: One mailbox per group at the median; DP splits sorted houses into k contiguous groups."},
  {"id": "google-b:lc56:mcq", "skills": ["intervals", "greedy", "ds-diagnosis"], "difficulty": 2, "q": "Merge Intervals (1 ≤ n ≤ 10^4). Which approach fits?", "choices": ["Sort by start, merge into last", "Greedy by end", "Min-heap of end times", "Binary search on the answer"], "answer": 0, "why": "Sort by start, merge into last: After sorting by start, an interval overlaps only the last merged one."},
  {"id": "google-b:lc1047:mcq", "skills": ["stack", "complexity", "constraints"], "difficulty": 1, "q": "Remove All Adjacent Duplicates In String (1 ≤ n ≤ 10^5). What is the optimal time / space?", "choices": ["O(n²) time · O(n) space", "O(n^4) time · O(n^2) space", "O(n) time · O(n) space", "O(n·α(n)) time · O(n) space"], "answer": 2, "why": "Stack cancellation: Removing a pair can expose a new pair; a stack top is always the left neighbor."},
  {"id": "google-b:lc235:mcq", "skills": ["bst", "ds-diagnosis"], "difficulty": 2, "q": "Lowest Common Ancestor of a Binary Search Tree (2 ≤ nodes ≤ 10^5, p and q exist). Which approach fits?", "choices": ["Split point in BST", "Top-down DFS with bounds", "Level-order BFS", "Iterative inorder"], "answer": 0, "why": "Split point in BST: The LCA is the first node whose value lies between p and q."},
  {"id": "google-b:lc417:mcq", "skills": ["grid", "graph-dfs", "graph-modeling", "complexity", "constraints"], "difficulty": 2, "q": "Pacific Atlantic Water Flow (1 ≤ m, n ≤ 200). What is the optimal time / space?", "choices": ["O(n + m) time · O(m) space", "O(n · m log m) time · O(n · m) space", "O(m + n) time · O(k) space", "O(m · n) time · O(m · n) space"], "answer": 3, "why": "Reverse multi-source DFS from each ocean: Flip the flow: climb uphill from each ocean border, then intersect the two reachable sets."},
  {"id": "google-b:lc268:mcq", "skills": ["bit", "math", "ds-diagnosis"], "difficulty": 1, "q": "Missing Number (1 ≤ n ≤ 10^4, distinct in [0, n], O(1) space). Which approach fits?", "choices": ["Right-to-left add with carry", "Doubling subtraction (bit shifts)", "XOR or Gauss sum", "Bit DP"], "answer": 2, "why": "XOR or Gauss sum: XOR all indices 0..n with all values; pairs cancel and the missing one remains."},
  {"id": "google-b:lc1111:mcq", "skills": ["stack", "greedy", "complexity", "constraints"], "difficulty": 2, "q": "Maximum Nesting Depth of Two Valid Parentheses Strings (1 ≤ n ≤ 10^4, valid parentheses). What is the optimal time / space?", "choices": ["O(n log S) time · O(1) space", "O(n) time · O(1) space", "O(n log n) time · O(1) space", "O(n²) time · O(n) space"], "answer": 1, "why": "Assign by depth parity: Alternate nesting levels between A and B; depth parity halves the max depth."},
  {"id": "google-b:lc1071:mcq", "skills": ["math", "ds-diagnosis"], "difficulty": 1, "q": "Greatest Common Divisor of Strings (1 ≤ lengths ≤ 1000). Which approach fits?", "choices": ["Count then scan", "Dummy + carry", "Concatenation check + gcd of lengths", "Sort + min-heap of end times"], "answer": 2, "why": "Concatenation check + gcd of lengths: A common divisor exists iff s1 + s2 == s2 + s1; then its length is gcd(len1, len2)."},
  {"id": "google-b:lc778:mcq", "skills": ["dijkstra", "grid", "heap", "complexity", "constraints"], "difficulty": 3, "q": "Swim in Rising Water (1 ≤ n ≤ 50, values are a permutation). What is the optimal time / space?", "choices": ["O(n² log n) time · O(n²) space", "O(n) time · O(n) space", "O(n²) time · O(n²) space", "O(n^4) time · O(n^2) space"], "answer": 0, "why": "Minimax Dijkstra with heap: Path cost is its max cell; Dijkstra works with max instead of sum."},
  {"id": "google-b:lc136:mcq", "skills": ["bit", "ds-diagnosis"], "difficulty": 1, "q": "Single Number (1 ≤ n ≤ 3·10^4, O(n) time, O(1) space). Which approach fits?", "choices": ["Bit DP", "XOR everything", "Right-to-left add with carry", "Doubling subtraction (bit shifts)"], "answer": 1, "why": "XOR everything: x ^ x = 0 and x ^ 0 = x, so all pairs cancel."},
  {"id": "google-b:lc278:mcq", "skills": ["binary-search", "complexity", "constraints"], "difficulty": 1, "q": "First Bad Version (1 ≤ bad ≤ n ≤ 2^31-1). What is the optimal time / space?", "choices": ["O(n log S) time · O(1) space", "O(n²) time · O(n) space", "O(n² log n) time · O(n²) space", "O(log n) time · O(1) space"], "answer": 3, "why": "Binary search for first true: isBad is false…false true…true; find the boundary with left < right search."},
  {"id": "google-b:lc424:mcq", "skills": ["sliding-window", "arrays-hashing", "ds-diagnosis"], "difficulty": 2, "q": "Longest Repeating Character Replacement (1 ≤ n ≤ 10^5, uppercase letters). Which approach fits?", "choices": ["Last-seen index map", "Sliding window with max frequency", "Monotonic deque", "atMost(k) − atMost(k−1)"], "answer": 1, "why": "Sliding window with max frequency: A window is valid if its length minus its top letter count is ≤ k."},
  {"id": "google-b:lc354:mcq", "skills": ["binary-search", "dp-1d", "greedy", "complexity", "constraints"], "difficulty": 3, "q": "Russian Doll Envelopes (1 ≤ n ≤ 10^5). What is the optimal time / space?", "choices": ["O(n²) time · O(n) space", "O(n) time · O(1) space", "O(n log n) time · O(n) space", "O(n log S) time · O(1) space"], "answer": 2, "why": "Sort (w asc, h desc) + LIS patience: Sort width ascending and height descending, then LIS on heights blocks equal widths."},
  {"id": "google-b:lc981:mcq", "skills": ["binary-search", "arrays-hashing", "ds-diagnosis"], "difficulty": 2, "q": "Time Based Key-Value Store (timestamps strictly increasing per set, ≤ 2·10^5 calls). Which approach fits?", "choices": ["Trie", "Sorted array + two pointers", "Hashmap of sorted lists + bisect", "Hashmap of counts"], "answer": 2, "why": "Hashmap of sorted lists + bisect: Timestamps arrive increasing, so each key list is already sorted for binary search."},
  {"id": "google-b:lc836:mcq", "skills": ["math", "intervals", "complexity", "constraints"], "difficulty": 1, "q": "Rectangle Overlap (coordinates within ±10^9). What is the optimal time / space?", "choices": ["O(n) time · O(n) space", "O(log² n) time · O(1) space", "O(2^n · n) time · O(2^n) space", "O(1) time · O(1) space"], "answer": 3, "why": "Interval overlap on each axis: Rectangles overlap iff their x-intervals and y-intervals both overlap with positive length."},
  {"id": "google-b:lc219:mcq", "skills": ["arrays-hashing", "sliding-window", "ds-diagnosis"], "difficulty": 1, "q": "Contains Duplicate II (1 ≤ n ≤ 10^5, 0 ≤ k ≤ 10^5). Which approach fits?", "choices": ["Sort then two pointers", "Prefix sum + hashmap", "Last-seen index map", "Monotonic stack"], "answer": 2, "why": "Last-seen index map: Only the most recent index of each value matters for distance ≤ k."},
  {"id": "google-b:lc149:mcq", "skills": ["arrays-hashing", "math", "complexity", "constraints"], "difficulty": 3, "q": "Max Points on a Line (1 ≤ n ≤ 300, points unique). What is the optimal time / space?", "choices": ["O(n) time · O(n) space", "O(n² log C) time · O(n) space", "O(n²) time · O(n²) space", "O(n^4) time · O(n^2) space"], "answer": 1, "why": "Slope hashing per anchor (gcd): Fix an anchor; points sharing a reduced slope with it are on one line."},
  {"id": "google-b:lc709:mcq", "skills": ["arrays-hashing", "ds-diagnosis"], "difficulty": 1, "q": "To Lower Case (1 ≤ n ≤ 100, printable ASCII). Which approach fits?", "choices": ["Middle + reverse + weave", "Binary search (exact)", "Binary search on flattened index", "ASCII offset"], "answer": 3, "why": "ASCII offset: Uppercase letters are 32 below lowercase in ASCII; shift only 'A'..'Z'."},
  {"id": "google-b:lc448:mcq", "skills": ["arrays-hashing", "complexity", "constraints"], "difficulty": 1, "q": "Find All Numbers Disappeared in an Array (1 ≤ n ≤ 10^5, values in [1, n]). What is the optimal time / space?", "choices": ["O(n) time · O(1) space", "O(log n) time · O(1) space", "O(n²) time · O(n²) space", "O(n^4) time · O(n^2) space"], "answer": 0, "why": "In-place index marking: Values in [1, n] are indices; negate nums[v-1] to mark v as seen."},
  {"id": "google-b:lc2812:mcq", "skills": ["graph-bfs", "grid", "dijkstra", "ds-diagnosis"], "difficulty": 2, "q": "Find the Safest Path in a Grid (1 ≤ n ≤ 400). Which approach fits?", "choices": ["Grid flood fill / components", "Multi-source BFS + max-min Dijkstra", "Kahn's topological sort", "Count edges per land cell"], "answer": 1, "why": "Multi-source BFS + max-min Dijkstra: BFS from all thieves gives each cell its safeness; then maximize the path minimum."},
  {"id": "google-b:lc645:mcq", "skills": ["arrays-hashing", "math", "complexity", "constraints"], "difficulty": 1, "q": "Set Mismatch (2 ≤ n ≤ 10^4, values in [1, n]). What is the optimal time / space?", "choices": ["O(n) time · O(1) space", "O(log² n) time · O(1) space", "O(n² log C) time · O(n) space", "O(n²) time · O(n) space"], "answer": 0, "why": "Index marking (or sum math): Mark seen values by negating their slot; a slot already negative reveals the duplicate."},
  {"id": "google-b:lc678:mcq", "skills": ["greedy", "stack", "ds-diagnosis"], "difficulty": 2, "q": "Valid Parenthesis String (1 ≤ n ≤ 100). Which approach fits?", "choices": ["Assign by depth parity", "Boyer-Moore voting", "Binary search on the answer", "Greedy open-count range"], "answer": 3, "why": "Greedy open-count range: Track the min and max possible open count; '*' widens the range."},
  {"id": "google-b:lc463:mcq", "skills": ["grid", "complexity", "constraints"], "difficulty": 1, "q": "Island Perimeter (1 ≤ rows, cols ≤ 100, one island). What is the optimal time / space?", "choices": ["O(r·c · α) time · O(r·c) space", "O(rc log(rc)) time · O(rc) space", "O(m · n) time · O(n) space", "O(r · c) time · O(1) space"], "answer": 3, "why": "Count edges per land cell: Each land cell adds 4, minus 2 for every land neighbor shared above or left."},
  {"id": "google-b:lc2441:mcq", "skills": ["arrays-hashing", "ds-diagnosis"], "difficulty": 1, "q": "Largest Positive Integer That Exists With Its Negative (1 ≤ n ≤ 1000, no zeros). Which approach fits?", "choices": ["Set lookup", "Dummy + tail", "Binary search on flattened index", "Dijkstra (lazy deletion)"], "answer": 0, "why": "Set lookup: Put all numbers in a set; the answer is the max k > 0 with -k also present."},
]

const flashcards = [
  {"id": "google-b:lc835:card", "skills": ["arrays-hashing", "grid", "constraints"], "front": "LC 835 Image Overlap · 1 ≤ n ≤ 30, cells are 0/1", "back": "Translation vector counting. Every overlap comes from one shift vector; count (dr, dc) over all pairs of ones. O(n^4) time, O(n^2) space."},
  {"id": "google-b:lc155:card", "skills": ["stack", "ds-diagnosis"], "front": "LC 155 Min Stack · up to 3·10^4 calls, all O(1)", "back": "Stack of (value, min so far). Store the running minimum alongside each value so pop restores the old min for free. O(1) per op time, O(n) space."},
  {"id": "google-b:lc977:card", "skills": ["two-pointers"], "front": "LC 977 Squares of a Sorted Array · 1 ≤ n ≤ 10^4, sorted, may be negative", "back": "Two pointers from both ends. Largest square is always at one of the two ends; fill the result from the back. O(n) time, O(n) space."},
  {"id": "google-b:lc38:card", "skills": ["math", "arrays-hashing"], "front": "LC 38 Count and Say · 1 ≤ n ≤ 30", "back": "Run-length simulation. Each term is the run-length encoding of the previous one; just simulate n-1 times. O(n · L) time, O(L) space."},
  {"id": "google-b:lc98:card", "skills": ["bst", "tree-dfs"], "front": "LC 98 Validate Binary Search Tree · 1 ≤ nodes ≤ 10^4, values fit in int32", "back": "DFS with (low, high) bounds. Each node must fit inside bounds inherited from all ancestors, not just its parent. O(n) time, O(h) space."},
  {"id": "google-b:lc876:card", "skills": ["linked-list", "two-pointers"], "front": "LC 876 Middle of the Linked List · 1 ≤ nodes ≤ 100", "back": "Fast and slow pointers. Fast moves two steps, slow moves one; when fast ends, slow is in the middle. O(n) time, O(1) space."},
  {"id": "google-b:lc525:card", "skills": ["prefix-sum", "arrays-hashing"], "front": "LC 525 Contiguous Array · 1 ≤ n ≤ 10^5, values 0/1", "back": "Prefix sum + first-seen index. Map 0 to -1; equal counts means a zero-sum subarray, so equal prefix sums. O(n) time, O(n) space."},
  {"id": "google-b:lc17:card", "skills": ["backtracking"], "front": "LC 17 Letter Combinations of a Phone Number · 0 ≤ digits.length ≤ 4", "back": "Backtracking over digits. Tiny n means generating every combination is the answer; one recursion level per digit. O(4^n · n) time, O(n) space."},
  {"id": "google-b:lc209:card", "skills": ["sliding-window"], "front": "LC 209 Minimum Size Subarray Sum · 1 ≤ n ≤ 10^5, all nums positive", "back": "Variable sliding window. Positive numbers make the window sum monotonic, so shrink from the left while sum ≥ target. O(n) time, O(1) space."},
  {"id": "google-b:lc1676:card", "skills": ["tree-dfs"], "front": "LC 1676 Lowest Common Ancestor of a Binary Tree IV · 1 ≤ nodes ≤ 10^4, all target nodes exist", "back": "Postorder DFS with target set. Same as two-node LCA: return a node if it is a target or both sides found something. O(n) time, O(n) space."},
  {"id": "google-b:lc172:card", "skills": ["math", "constraints"], "front": "LC 172 Factorial Trailing Zeroes · 0 ≤ n ≤ 10^4, follow-up O(log n)", "back": "Count factors of 5. Each zero needs a 2 and a 5; fives are rarer, so count multiples of 5, 25, 125... O(log n) time, O(1) space."},
  {"id": "google-b:lc207:card", "skills": ["topo-sort", "graph-modeling", "graph-bfs"], "front": "LC 207 Course Schedule · 1 ≤ courses ≤ 2000, prereqs ≤ 5000", "back": "Kahn's topological sort. Possible iff the prerequisite graph has no cycle; Kahn processes every node exactly when acyclic. O(V + E) time, O(V + E) space."},
  {"id": "google-b:lc1108:card", "skills": ["arrays-hashing"], "front": "LC 1108 Defanging an IP Address · valid IPv4 address", "back": "String building. Strings are immutable; build a new one replacing each dot. O(n) time, O(n) space."},
  {"id": "google-b:lc151:card", "skills": ["two-pointers", "arrays-hashing"], "front": "LC 151 Reverse Words in a String · 1 ≤ s.length ≤ 10^4, extra spaces possible", "back": "Split and reverse. split() with no argument drops all extra spaces; reverse the word list and join. O(n) time, O(n) space."},
  {"id": "google-b:lc1621:card", "skills": ["math", "dp-2d"], "front": "LC 1621 Number of Sets of K Non-Overlapping Line Segments · 2 ≤ n ≤ 1000", "back": "Stars and bars combinatorics. Segments may share endpoints; duplicate shared points to get C(n+k-1, 2k) free choices. O(n) time, O(1) space."},
  {"id": "google-b:lc930:card", "skills": ["prefix-sum", "arrays-hashing"], "front": "LC 930 Binary Subarrays With Sum · 1 ≤ n ≤ 3·10^4, values 0/1", "back": "Prefix sum count map. Count subarrays summing to goal by looking up how many earlier prefixes equal sum - goal. O(n) time, O(n) space."},
  {"id": "google-b:lc359:card", "skills": ["arrays-hashing", "ds-diagnosis"], "front": "LC 359 Logger Rate Limiter · timestamps non-decreasing, ≤ 10^4 calls", "back": "Hashmap of next allowed time. Remember when each message is next allowed; compare and update in O(1). O(1) per call time, O(m) space."},
  {"id": "google-b:lc1520:card", "skills": ["greedy", "intervals"], "front": "LC 1520 Maximum Number of Non-Overlapping Substrings · 1 ≤ n ≤ 10^5, lowercase letters", "back": "Closed intervals + greedy by end. Each letter defines a closed interval; expand it, then pick intervals greedily by earliest end. O(26 · n) time, O(26) space."},
  {"id": "google-b:lc31:card", "skills": ["two-pointers", "arrays-hashing"], "front": "LC 31 Next Permutation · 1 ≤ n ≤ 100, in place, O(1) extra", "back": "Find pivot, swap, reverse suffix. The suffix after the pivot is descending; swap pivot with next larger, then reverse the suffix. O(n) time, O(1) space."},
  {"id": "google-b:lc29:card", "skills": ["bit", "math"], "front": "LC 29 Divide Two Integers · -2^31 ≤ a, b ≤ 2^31-1, no *, /, %", "back": "Doubling subtraction (bit shifts). Subtract the largest divisor·2^k that fits, repeatedly; like long division in binary. O(log² n) time, O(1) space."},
  {"id": "google-b:lc437:card", "skills": ["prefix-sum", "tree-dfs"], "front": "LC 437 Path Sum III · 0 ≤ nodes ≤ 1000, values ±10^9", "back": "Prefix sums on a root-to-node path. Subarray-sum-equals-k on the current root path; undo the prefix count when backtracking. O(n) time, O(h) space."},
  {"id": "google-b:lc54:card", "skills": ["grid", "math"], "front": "LC 54 Spiral Matrix · 1 ≤ m, n ≤ 10", "back": "Shrinking boundaries simulation. Walk top row, right col, bottom row, left col, shrinking each boundary after use. O(m · n) time, O(1) space."},
  {"id": "google-b:lc682:card", "skills": ["stack"], "front": "LC 682 Baseball Game · 1 ≤ ops ≤ 1000", "back": "Stack simulation. Every op only touches the most recent scores, which is exactly a stack. O(n) time, O(n) space."},
  {"id": "google-b:lc326:card", "skills": ["math"], "front": "LC 326 Power of Three · -2^31 ≤ n ≤ 2^31-1", "back": "Divide out factors / max power trick. 3^19 is the largest int32 power of 3; since 3 is prime, only powers of 3 divide it. O(1) time, O(1) space."},
  {"id": "google-b:lc8:card", "skills": ["math"], "front": "LC 8 String to Integer (atoi) · 0 ≤ s.length ≤ 200, clamp to int32", "back": "Careful parsing state machine. Skip spaces, read one sign, read digits, stop at anything else, clamp at the end. O(n) time, O(1) space."},
  {"id": "google-b:lc1235:card", "skills": ["dp-1d", "binary-search", "intervals"], "front": "LC 1235 Maximum Profit in Job Scheduling · 1 ≤ n ≤ 5·10^4, times ≤ 10^9", "back": "Sort by start + DP + binary search. dp[i]: skip job i, or take it and jump to the first job starting after it ends. O(n log n) time, O(n) space."},
  {"id": "google-b:lc796:card", "skills": ["arrays-hashing"], "front": "LC 796 Rotate String · 1 ≤ length ≤ 100", "back": "Doubled string containment. Every rotation of s is a substring of s + s. O(n²) time, O(n) space."},
  {"id": "google-b:lc1658:card", "skills": ["sliding-window", "prefix-sum"], "front": "LC 1658 Minimum Operations to Reduce X to Zero · 1 ≤ n ≤ 10^5, nums positive", "back": "Longest middle window with sum total - x. Removing from both ends leaves a middle subarray; maximize its length with sum = total - x. O(n) time, O(1) space."},
  {"id": "google-b:lc76:card", "skills": ["sliding-window", "arrays-hashing"], "front": "LC 76 Minimum Window Substring · 1 ≤ m, n ≤ 10^5", "back": "Sliding window with need counter. Expand until all needed chars are covered, then shrink while still valid, tracking the best. O(m + n) time, O(k) space."},
  {"id": "google-b:lc349:card", "skills": ["arrays-hashing"], "front": "LC 349 Intersection of Two Arrays · 1 ≤ n, m ≤ 1000", "back": "Set intersection. Unique common values is exactly what a set intersection gives. O(n + m) time, O(n) space."},
  {"id": "google-b:lc110:card", "skills": ["tree-dfs"], "front": "LC 110 Balanced Binary Tree · 0 ≤ nodes ≤ 5000", "back": "Postorder height with -1 sentinel. Return height bottom-up and -1 the moment any subtree is unbalanced. O(n) time, O(h) space."},
  {"id": "google-b:lc34:card", "skills": ["binary-search"], "front": "LC 34 Find First and Last Position of Element in Sorted Array · 0 ≤ n ≤ 10^5", "back": "Two lower-bound binary searches. First = lower_bound(target); last = lower_bound(target + 1) - 1. O(log n) time, O(1) space."},
  {"id": "google-b:lc167:card", "skills": ["two-pointers"], "front": "LC 167 Two Sum II - Input Array Is Sorted · 2 ≤ n ≤ 3·10^4, sorted, O(1) extra space", "back": "Converging two pointers. Sorted lets you move left up when the sum is small and right down when it is big. O(n) time, O(1) space."},
  {"id": "google-b:lc371:card", "skills": ["bit"], "front": "LC 371 Sum of Two Integers · -1000 ≤ a, b ≤ 1000, no + or -", "back": "XOR sum + AND carry with 32-bit mask. a ^ b adds without carry, (a & b) << 1 is the carry; loop until no carry. O(1) time, O(1) space."},
  {"id": "google-b:lc62:card", "skills": ["dp-2d", "grid"], "front": "LC 62 Unique Paths · 1 ≤ m, n ≤ 100", "back": "Grid DP (right/down). Paths into a cell = paths from above + paths from the left. O(m · n) time, O(n) space."},
  {"id": "google-b:lc64:card", "skills": ["dp-2d", "grid"], "front": "LC 64 Minimum Path Sum · 1 ≤ m, n ≤ 200, values ≥ 0", "back": "Grid DP (min of up/left). Best cost to a cell = its value + min(best from above, best from left). O(m · n) time, O(1) space."},
  {"id": "google-b:lc22:card", "skills": ["backtracking"], "front": "LC 22 Generate Parentheses · 1 ≤ n ≤ 8", "back": "Backtracking with open/close counts. Add \"(\" while open < n and \")\" while close < open; every leaf is valid. O(4^n / √n) time, O(n) space."},
  {"id": "google-b:lc1380:card", "skills": ["arrays-hashing", "grid"], "front": "LC 1380 Lucky Numbers in a Matrix · 1 ≤ m, n ≤ 50, distinct values", "back": "Row mins ∩ column maxes. A lucky number is both its row min and column max; intersect the two sets. O(m · n) time, O(m + n) space."},
  {"id": "google-b:lc2035:card", "skills": ["binary-search", "constraints", "backtracking"], "front": "LC 2035 Partition Array Into Two Arrays to Minimize Sum Difference · 1 ≤ n ≤ 15, nums.length = 2n", "back": "Meet in the middle + binary search. 2^30 is too big but 2^15 per half is fine; pair subset sums of each size with bisect. O(2^n · n) time, O(2^n) space."},
  {"id": "google-b:lc1970:card", "skills": ["union-find", "grid", "binary-search"], "front": "LC 1970 Last Day Where You Can Still Cross · 2 ≤ rows·cols ≤ 2·10^4", "back": "Reverse time + Union-Find. Run time backwards turning water into land; the first moment top joins bottom is the answer. O(r·c · α) time, O(r·c) space."},
  {"id": "google-b:lc693:card", "skills": ["bit"], "front": "LC 693 Binary Number with Alternating Bits · 1 ≤ n ≤ 2^31-1", "back": "XOR with shifted self. Alternating bits make x = n ^ (n >> 1) all ones, so x & (x + 1) == 0. O(1) time, O(1) space."},
  {"id": "google-b:lc3026:card", "skills": ["prefix-sum", "arrays-hashing"], "front": "LC 3026 Maximum Good Subarray Sum · 2 ≤ n ≤ 10^5, values ±10^9", "back": "Prefix sums + min prefix per value. For each end j, the best start i has nums[i] = nums[j] ± k and the smallest prefix before it. O(n) time, O(n) space."},
  {"id": "google-b:lc1190:card", "skills": ["stack"], "front": "LC 1190 Reverse Substrings Between Each Pair of Parentheses · 1 ≤ n ≤ 2000, balanced", "back": "Stack of buffers. On \")\", pop the inner buffer, reverse it, and append it to the outer one. O(n²) time, O(n) space."},
  {"id": "google-b:lc131:card", "skills": ["backtracking", "dp-2d"], "front": "LC 131 Palindrome Partitioning · 1 ≤ n ≤ 16", "back": "Backtracking over cut positions. Choose the next palindromic prefix and recurse on the rest; n ≤ 16 allows all cuts. O(n · 2^n) time, O(n) space."},
  {"id": "google-b:lc701:card", "skills": ["bst"], "front": "LC 701 Insert into a Binary Search Tree · 0 ≤ nodes ≤ 10^4, value not present", "back": "Walk down by BST order. Follow the BST comparisons down to a null child and hang the new node there. O(h) time, O(1) space."},
  {"id": "google-b:lc1478:card", "skills": ["dp-2d", "math"], "front": "LC 1478 Allocate Mailboxes · 1 ≤ k ≤ n ≤ 100", "back": "Partition DP with median cost. One mailbox per group at the median; DP splits sorted houses into k contiguous groups. O(n² · k) time, O(n²) space."},
  {"id": "google-b:lc56:card", "skills": ["intervals", "greedy"], "front": "LC 56 Merge Intervals · 1 ≤ n ≤ 10^4", "back": "Sort by start, merge into last. After sorting by start, an interval overlaps only the last merged one. O(n log n) time, O(n) space."},
  {"id": "google-b:lc1047:card", "skills": ["stack"], "front": "LC 1047 Remove All Adjacent Duplicates In String · 1 ≤ n ≤ 10^5", "back": "Stack cancellation. Removing a pair can expose a new pair; a stack top is always the left neighbor. O(n) time, O(n) space."},
  {"id": "google-b:lc235:card", "skills": ["bst"], "front": "LC 235 Lowest Common Ancestor of a Binary Search Tree · 2 ≤ nodes ≤ 10^5, p and q exist", "back": "Split point in BST. The LCA is the first node whose value lies between p and q. O(h) time, O(1) space."},
  {"id": "google-b:lc417:card", "skills": ["grid", "graph-dfs", "graph-modeling"], "front": "LC 417 Pacific Atlantic Water Flow · 1 ≤ m, n ≤ 200", "back": "Reverse multi-source DFS from each ocean. Flip the flow: climb uphill from each ocean border, then intersect the two reachable sets. O(m · n) time, O(m · n) space."},
  {"id": "google-b:lc268:card", "skills": ["bit", "math"], "front": "LC 268 Missing Number · 1 ≤ n ≤ 10^4, distinct in [0, n], O(1) space", "back": "XOR or Gauss sum. XOR all indices 0..n with all values; pairs cancel and the missing one remains. O(n) time, O(1) space."},
  {"id": "google-b:lc1111:card", "skills": ["stack", "greedy"], "front": "LC 1111 Maximum Nesting Depth of Two Valid Parentheses Strings · 1 ≤ n ≤ 10^4, valid parentheses", "back": "Assign by depth parity. Alternate nesting levels between A and B; depth parity halves the max depth. O(n) time, O(1) space."},
  {"id": "google-b:lc1071:card", "skills": ["math"], "front": "LC 1071 Greatest Common Divisor of Strings · 1 ≤ lengths ≤ 1000", "back": "Concatenation check + gcd of lengths. A common divisor exists iff s1 + s2 == s2 + s1; then its length is gcd(len1, len2). O(n + m) time, O(n + m) space."},
  {"id": "google-b:lc778:card", "skills": ["dijkstra", "grid", "heap"], "front": "LC 778 Swim in Rising Water · 1 ≤ n ≤ 50, values are a permutation", "back": "Minimax Dijkstra with heap. Path cost is its max cell; Dijkstra works with max instead of sum. O(n² log n) time, O(n²) space."},
  {"id": "google-b:lc136:card", "skills": ["bit"], "front": "LC 136 Single Number · 1 ≤ n ≤ 3·10^4, O(n) time, O(1) space", "back": "XOR everything. x ^ x = 0 and x ^ 0 = x, so all pairs cancel. O(n) time, O(1) space."},
  {"id": "google-b:lc278:card", "skills": ["binary-search"], "front": "LC 278 First Bad Version · 1 ≤ bad ≤ n ≤ 2^31-1", "back": "Binary search for first true. isBad is false…false true…true; find the boundary with left < right search. O(log n) time, O(1) space."},
  {"id": "google-b:lc424:card", "skills": ["sliding-window", "arrays-hashing"], "front": "LC 424 Longest Repeating Character Replacement · 1 ≤ n ≤ 10^5, uppercase letters", "back": "Sliding window with max frequency. A window is valid if its length minus its top letter count is ≤ k. O(n) time, O(26) space."},
  {"id": "google-b:lc354:card", "skills": ["binary-search", "dp-1d", "greedy"], "front": "LC 354 Russian Doll Envelopes · 1 ≤ n ≤ 10^5", "back": "Sort (w asc, h desc) + LIS patience. Sort width ascending and height descending, then LIS on heights blocks equal widths. O(n log n) time, O(n) space."},
  {"id": "google-b:lc981:card", "skills": ["binary-search", "arrays-hashing", "ds-diagnosis"], "front": "LC 981 Time Based Key-Value Store · timestamps strictly increasing per set, ≤ 2·10^5 calls", "back": "Hashmap of sorted lists + bisect. Timestamps arrive increasing, so each key list is already sorted for binary search. O(1) set, O(log n) get time, O(n) space."},
  {"id": "google-b:lc836:card", "skills": ["math", "intervals"], "front": "LC 836 Rectangle Overlap · coordinates within ±10^9", "back": "Interval overlap on each axis. Rectangles overlap iff their x-intervals and y-intervals both overlap with positive length. O(1) time, O(1) space."},
  {"id": "google-b:lc219:card", "skills": ["arrays-hashing", "sliding-window"], "front": "LC 219 Contains Duplicate II · 1 ≤ n ≤ 10^5, 0 ≤ k ≤ 10^5", "back": "Last-seen index map. Only the most recent index of each value matters for distance ≤ k. O(n) time, O(n) space."},
  {"id": "google-b:lc149:card", "skills": ["arrays-hashing", "math"], "front": "LC 149 Max Points on a Line · 1 ≤ n ≤ 300, points unique", "back": "Slope hashing per anchor (gcd). Fix an anchor; points sharing a reduced slope with it are on one line. O(n² log C) time, O(n) space."},
  {"id": "google-b:lc709:card", "skills": ["arrays-hashing"], "front": "LC 709 To Lower Case · 1 ≤ n ≤ 100, printable ASCII", "back": "ASCII offset. Uppercase letters are 32 below lowercase in ASCII; shift only 'A'..'Z'. O(n) time, O(n) space."},
  {"id": "google-b:lc448:card", "skills": ["arrays-hashing"], "front": "LC 448 Find All Numbers Disappeared in an Array · 1 ≤ n ≤ 10^5, values in [1, n]", "back": "In-place index marking. Values in [1, n] are indices; negate nums[v-1] to mark v as seen. O(n) time, O(1) space."},
  {"id": "google-b:lc2812:card", "skills": ["graph-bfs", "grid", "dijkstra"], "front": "LC 2812 Find the Safest Path in a Grid · 1 ≤ n ≤ 400", "back": "Multi-source BFS + max-min Dijkstra. BFS from all thieves gives each cell its safeness; then maximize the path minimum. O(n² log n) time, O(n²) space."},
  {"id": "google-b:lc645:card", "skills": ["arrays-hashing", "math"], "front": "LC 645 Set Mismatch · 2 ≤ n ≤ 10^4, values in [1, n]", "back": "Index marking (or sum math). Mark seen values by negating their slot; a slot already negative reveals the duplicate. O(n) time, O(1) space."},
  {"id": "google-b:lc678:card", "skills": ["greedy", "stack"], "front": "LC 678 Valid Parenthesis String · 1 ≤ n ≤ 100", "back": "Greedy open-count range. Track the min and max possible open count; '*' widens the range. O(n) time, O(1) space."},
  {"id": "google-b:lc463:card", "skills": ["grid"], "front": "LC 463 Island Perimeter · 1 ≤ rows, cols ≤ 100, one island", "back": "Count edges per land cell. Each land cell adds 4, minus 2 for every land neighbor shared above or left. O(r · c) time, O(1) space."},
  {"id": "google-b:lc2441:card", "skills": ["arrays-hashing"], "front": "LC 2441 Largest Positive Integer That Exists With Its Negative · 1 ≤ n ≤ 1000, no zeros", "back": "Set lookup. Put all numbers in a set; the answer is the max k > 0 with -k also present. O(n) time, O(n) space."},
]

export default {
  id: 'google-b',
  title: 'Interview list',
  icon: '🔎',
  skills: ["arrays-hashing", "grid", "constraints", "stack", "ds-diagnosis", "two-pointers", "math", "bst", "tree-dfs", "linked-list", "prefix-sum", "backtracking", "sliding-window", "topo-sort", "graph-modeling", "graph-bfs", "dp-2d", "greedy", "intervals", "bit", "dp-1d", "binary-search", "union-find", "graph-dfs", "dijkstra", "heap", "complexity"],
  lessons: [],
  traces: [],
  flashcards,
  mcqs,
  clozes: [],
  parsons: [],
  problems,
}
