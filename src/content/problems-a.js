import { companiesFor } from './companies.js'

const bank = [
  {
    lc: 1, title: 'Two Sum', difficulty: 'Easy', skills: ['arrays-hashing', 'ds-diagnosis'],
    pattern: 'Hashmap complement', ds: ['hashmap'],
    constraints: '2 ≤ n ≤ 10^4, values up to ±10^9, exactly one answer',
    time: 'O(n)', space: 'O(n)',
    insight: 'For each number, ask the map if target minus it was already seen.',
    signals: ['pair sums to target', 'return indices', 'unsorted'],
    narration: [
      'Clarify: exactly one answer, can I reuse the same index? No.',
      'Brute force checks every pair, O(n^2).',
      'Instead I store value to index in a dict as I scan.',
      'For each num I look up target minus num in O(1).',
      'One pass: O(n) time, O(n) space for the dict.',
    ],
    pitfalls: ['Check the map before inserting so one index is not used twice', 'Duplicates like [3,3] still work'],
    wrong: ['Sort + two pointers · O(n log n), loses original indices', 'Nested loops over all pairs · O(n^2)', 'Binary search per element · O(n log n) on unsorted data'],
    solution: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:

        seen = {}

        for i, num in enumerate(nums):
            if target - num in seen:
                return [seen[target - num], i]
            seen[num] = i

        return []`,
  },
  {
    lc: 9, title: 'Palindrome Number', difficulty: 'Easy', skills: ['math'],
    pattern: 'Reverse half the digits', ds: [],
    constraints: '-2^31 ≤ x ≤ 2^31 - 1, no string conversion (follow-up)',
    time: 'O(log x)', space: 'O(1)',
    insight: 'Reverse only the back half; stop when it catches up to the front half.',
    signals: ['integer', 'palindrome', 'without converting to string'],
    narration: [
      'Clarify: negatives are never palindromes, trailing zero only if x is 0.',
      'I peel digits off the end and build the reversed half.',
      'Stop when reversed half ≥ remaining x, so no overflow.',
      'Compare x with half, or half // 10 for odd length.',
      'Digits count is log10 x, so O(log x) time, O(1) space.',
    ],
    pitfalls: ['x = 10 must be False', 'Odd digit count: drop middle with half // 10'],
    wrong: ['Convert to string and compare reversed · O(n) extra space', 'Recursion over digits · O(log x) stack', 'Full reverse with 64-bit check · risks overflow'],
    solution: `class Solution:
    def isPalindrome(self, x: int) -> bool:

        if x < 0 or (x % 10 == 0 and x != 0):
            return False

        half = 0
        while x > half:
            half = half * 10 + x % 10
            x //= 10

        return x == half or x == half // 10`,
  },
  {
    lc: 4, title: 'Median of Two Sorted Arrays', difficulty: 'Hard', skills: ['binary-search'],
    pattern: 'Binary search the partition', ds: ['array'],
    constraints: 'm, n ≤ 1000, both sorted, must be O(log(m+n))',
    time: 'O(log min(m, n))', space: 'O(1)',
    insight: 'Binary search a cut in the smaller array so left halves hold exactly half the elements.',
    signals: ['two sorted arrays', 'median', 'O(log (m+n)) required'],
    narration: [
      'Clarify: either array may be empty, total is at least 1.',
      'Merging is O(m+n); the log requirement means binary search.',
      'I pick i elements from the smaller array, half - i from the other.',
      'Valid cut when leftA ≤ rightB and leftB ≤ rightA.',
      'Otherwise move the cut left or right: O(log min(m, n)), O(1) space.',
    ],
    pitfalls: ['Search the smaller array or j goes negative', 'Use ±inf for empty sides of the cut', 'Odd total: median is max of left sides'],
    wrong: ['Merge then pick middle · O(m+n)', 'Heap of all elements · O((m+n) log(m+n))', 'Two pointers walking to the middle · O(m+n)'],
    solution: `class Solution:
    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:

        if len(nums1) > len(nums2):
            nums1, nums2 = nums2, nums1

        m, n = len(nums1), len(nums2)
        half = (m + n + 1) // 2
        left, right = 0, m

        while left <= right:
            i = (left + right) // 2
            j = half - i

            leftA = nums1[i - 1] if i > 0 else float('-inf')
            rightA = nums1[i] if i < m else float('inf')
            leftB = nums2[j - 1] if j > 0 else float('-inf')
            rightB = nums2[j] if j < n else float('inf')

            if leftA <= rightB and leftB <= rightA:
                if (m + n) % 2:
                    return max(leftA, leftB)
                return (max(leftA, leftB) + min(rightA, rightB)) / 2
            elif leftA > rightB:
                right = i - 1
            else:
                left = i + 1

        return 0.0`,
  },
  {
    lc: 3, title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', skills: ['sliding-window', 'arrays-hashing'],
    pattern: 'Sliding window + last-seen map', ds: ['hashmap'],
    constraints: '0 ≤ n ≤ 5·10^4, letters, digits, symbols, spaces',
    time: 'O(n)', space: 'O(min(n, charset))',
    insight: 'On a repeat, jump left past the previous copy instead of shrinking one by one.',
    signals: ['longest substring', 'no repeating', 'contiguous'],
    narration: [
      'Clarify: substring means contiguous, empty string returns 0.',
      'A window [left, right] with all unique chars, grown to the right.',
      'Dict maps char to its last index so I can jump left in O(1).',
      'Only jump if the last index is inside the current window.',
      'Each index visited once: O(n) time, O(charset) space.',
    ],
    pitfalls: ['Ignore stale indices left of the window (abba)', 'Empty string'],
    wrong: ['Check every substring with a set · O(n^3)', 'Sort characters first · breaks contiguity', 'DP table over all (i, j) · O(n^2)'],
    solution: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:

        last = {}
        left = 0
        result = 0

        for right, char in enumerate(s):
            if char in last and last[char] >= left:
                left = last[char] + 1
            last[char] = right
            result = max(result, right - left + 1)

        return result`,
  },
  {
    lc: 15, title: '3Sum', difficulty: 'Medium', skills: ['two-pointers', 'constraints'],
    pattern: 'Sort + two pointers', ds: ['array'],
    constraints: '3 ≤ n ≤ 3000, unique triplets only',
    time: 'O(n^2)', space: 'O(1) extra (sort aside)',
    insight: 'Fix one number, then Two Sum II on the sorted rest; skip equal values to dedupe.',
    signals: ['triplets', 'sum to zero', 'no duplicate triplets', 'n ≤ 3000'],
    narration: [
      'Clarify: return values not indices, no duplicate triplets.',
      'n ≤ 3000 means O(n^2) is fine, O(n^3) is not.',
      'Sort, fix nums[i], then two pointers on the rest.',
      'Sorting makes dedupe easy: skip equal neighbors.',
      'O(n^2) time, O(1) extra besides sort.',
    ],
    pitfalls: ['Skip duplicate i and duplicate left after a hit', 'Break early when nums[i] > 0'],
    wrong: ['Three nested loops + set · O(n^3)', 'Hashmap of all pairs · O(n^2) space and dedupe pain', 'Binary search for third · O(n^2 log n)'],
    solution: `class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:

        nums.sort()
        result = []

        for i in range(len(nums) - 2):
            if nums[i] > 0:
                break
            if i > 0 and nums[i] == nums[i - 1]:
                continue

            left, right = i + 1, len(nums) - 1
            while left < right:
                total = nums[i] + nums[left] + nums[right]
                if total < 0:
                    left += 1
                elif total > 0:
                    right -= 1
                else:
                    result.append([nums[i], nums[left], nums[right]])
                    left += 1
                    right -= 1
                    while left < right and nums[left] == nums[left - 1]:
                        left += 1

        return result`,
  },
  {
    lc: 2, title: 'Add Two Numbers', difficulty: 'Medium', skills: ['linked-list', 'math'],
    pattern: 'Digit-by-digit with carry', ds: ['linked list'],
    constraints: '1 ≤ nodes ≤ 100, digits stored in reverse order',
    time: 'O(max(m, n))', space: 'O(1) extra',
    insight: 'Reverse order means the head is the ones digit, so just add like grade school.',
    signals: ['linked lists', 'digits in reverse order', 'sum as a list'],
    narration: [
      'Clarify: digits reversed, no leading zeros except 0 itself.',
      'Walk both lists together, add digits plus carry.',
      'Dummy head avoids special-casing the first node.',
      'Keep looping while either list or carry remains.',
      'O(max(m, n)) time, O(1) extra besides the output.',
    ],
    pitfalls: ['Final carry creates a new node', 'Lists of different length'],
    wrong: ['Convert to ints and back · breaks in fixed-width languages', 'Reverse both lists first · unnecessary work', 'Recursion · O(n) stack'],
    solution: `class Solution:
    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:

        dummy = ListNode()
        curr = dummy
        carry = 0

        while l1 or l2 or carry:
            total = carry
            if l1:
                total += l1.val
                l1 = l1.next
            if l2:
                total += l2.val
                l2 = l2.next

            carry, digit = divmod(total, 10)
            curr.next = ListNode(digit)
            curr = curr.next

        return dummy.next`,
  },
  {
    lc: 121, title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', skills: ['greedy', 'arrays-hashing'],
    pattern: 'Running minimum', ds: [],
    constraints: '1 ≤ n ≤ 10^5, one buy then one sell',
    time: 'O(n)', space: 'O(1)',
    insight: 'Best sell today uses the cheapest price seen so far.',
    signals: ['buy once sell once', 'maximize profit', 'n ≤ 10^5'],
    narration: [
      'Clarify: must buy before selling, profit 0 if prices only drop.',
      'n is 10^5 so O(n^2) pairs is too slow.',
      'Track the lowest price so far as I scan.',
      'Profit if I sell today is price minus lowest.',
      'One pass, O(n) time, O(1) space.',
    ],
    pitfalls: ['Never return negative profit'],
    wrong: ['Check every buy/sell pair · O(n^2)', 'Sort prices · loses time order', 'Heap of prices · O(n log n) and still wrong order'],
    solution: `class Solution:
    def maxProfit(self, prices: List[int]) -> int:

        lowest = prices[0]
        result = 0

        for price in prices:
            lowest = min(lowest, price)
            result = max(result, price - lowest)

        return result`,
  },
  {
    lc: 13, title: 'Roman to Integer', difficulty: 'Easy', skills: ['arrays-hashing', 'math'],
    pattern: 'Lookup + subtract rule', ds: ['hashmap'],
    constraints: '1 ≤ len ≤ 15, valid numeral 1..3999',
    time: 'O(n)', space: 'O(1)',
    insight: 'A symbol smaller than the next one is subtracted, otherwise added.',
    signals: ['roman numeral', 'convert', 'IV, IX'],
    narration: [
      'Clarify: input is always valid.',
      'Map each symbol to its value.',
      'If current < next, subtract it, else add it.',
      'Single pass: O(n) time, O(1) space.',
    ],
    pitfalls: ['Bounds check before peeking at s[i + 1]'],
    wrong: ['Hardcode all 3999 numerals · O(1) but absurd', 'Recursion splitting on biggest symbol · overkill', 'Stack of symbols · unnecessary'],
    solution: `class Solution:
    def romanToInt(self, s: str) -> int:

        values = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000}
        result = 0

        for i, char in enumerate(s):
            if i + 1 < len(s) and values[char] < values[s[i + 1]]:
                result -= values[char]
            else:
                result += values[char]

        return result`,
  },
  {
    lc: 1929, title: 'Concatenation of Array', difficulty: 'Easy', skills: ['arrays-hashing'],
    pattern: 'Build output array', ds: ['array'],
    constraints: '1 ≤ n ≤ 1000',
    time: 'O(n)', space: 'O(n)',
    insight: 'ans[i] and ans[i + n] are both nums[i].',
    signals: ['length 2n', 'ans[i] == ans[i + n]'],
    narration: [
      'Output is nums followed by nums again.',
      'Each element copied twice.',
      'O(n) time, O(n) for the output.',
    ],
    pitfalls: ['None beyond off-by-one if indexing manually'],
    wrong: ['Insert into front repeatedly · O(n^2)', 'Recursion doubling · pointless', 'Sorting first · changes order'],
    solution: `class Solution:
    def getConcatenation(self, nums: List[int]) -> List[int]:

        result = []

        for _ in range(2):
            for num in nums:
                result.append(num)

        return result`,
  },
  {
    lc: 128, title: 'Longest Consecutive Sequence', difficulty: 'Medium', skills: ['arrays-hashing', 'constraints'],
    pattern: 'Hash set, start at sequence heads', ds: ['set'],
    constraints: '0 ≤ n ≤ 10^5, must run in O(n)',
    time: 'O(n)', space: 'O(n)',
    insight: 'Only count upward from numbers whose num - 1 is missing; each number is walked once.',
    signals: ['consecutive', 'unsorted', 'O(n) required'],
    narration: [
      'Clarify: duplicates allowed, empty returns 0.',
      'Sorting is n log n, but they want O(n).',
      'Put everything in a set for O(1) membership.',
      'Only start counting at a head: num - 1 not in set.',
      'Each element extends a run once: O(n) time, O(n) space.',
    ],
    pitfalls: ['Iterate the set, not nums, to avoid repeated heads', 'Empty input'],
    wrong: ['Sort then scan · O(n log n)', 'Count up from every number · O(n^2)', 'Union-Find on neighbors · O(n α(n)) and heavier'],
    solution: `class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:

        numSet = set(nums)
        result = 0

        for num in numSet:
            if num - 1 not in numSet:
                curr = num
                length = 1
                while curr + 1 in numSet:
                    curr += 1
                    length += 1
                result = max(result, length)

        return result`,
  },
  {
    lc: 88, title: 'Merge Sorted Array', difficulty: 'Easy', skills: ['two-pointers'],
    pattern: 'Three pointers from the back', ds: ['array'],
    constraints: 'm + n ≤ 200, nums1 has n trailing zeros of space',
    time: 'O(m + n)', space: 'O(1)',
    insight: 'Fill from the end so you never overwrite unread nums1 values.',
    signals: ['merge in place', 'nums1 has extra space', 'sorted'],
    narration: [
      'Clarify: modify nums1 in place, return nothing.',
      'Front merge would overwrite nums1, so I write from the back.',
      'Compare the largest remaining of each, place it at k.',
      'Stop when nums2 is empty; leftover nums1 is already placed.',
      'O(m + n) time, O(1) space.',
    ],
    pitfalls: ['Loop on j ≥ 0, not i', 'm = 0 case'],
    wrong: ['Copy nums2 in and sort · O((m+n) log(m+n))', 'Merge into new array then copy · O(m+n) space', 'Insert with shifting · O(m·n)'],
    solution: `class Solution:
    def merge(self, nums1: List[int], m: int, nums2: List[int], n: int) -> None:

        i, j, k = m - 1, n - 1, m + n - 1

        while j >= 0:
            if i >= 0 and nums1[i] > nums2[j]:
                nums1[k] = nums1[i]
                i -= 1
            else:
                nums1[k] = nums2[j]
                j -= 1
            k -= 1`,
  },
  {
    lc: 26, title: 'Remove Duplicates from Sorted Array', difficulty: 'Easy', skills: ['two-pointers'],
    pattern: 'Read/write pointers', ds: ['array'],
    constraints: '1 ≤ n ≤ 3·10^4, sorted, in place',
    time: 'O(n)', space: 'O(1)',
    insight: 'Sorted means duplicates are adjacent; write only when value changes.',
    signals: ['sorted', 'in place', 'return k unique'],
    narration: [
      'Clarify: in place, return count of uniques.',
      'Duplicates are neighbors because it is sorted.',
      'Write pointer marks next slot; read pointer scans.',
      'O(n) time, O(1) space.',
    ],
    pitfalls: ['Start write at 1, first element is always kept'],
    wrong: ['Convert to set and back · O(n) space, loses in-place', 'Pop duplicates from list · O(n^2)', 'Hashmap of counts · O(n) space'],
    solution: `class Solution:
    def removeDuplicates(self, nums: List[int]) -> int:

        write = 1

        for read in range(1, len(nums)):
            if nums[read] != nums[read - 1]:
                nums[write] = nums[read]
                write += 1

        return write`,
  },
  {
    lc: 33, title: 'Search in Rotated Sorted Array', difficulty: 'Medium', skills: ['binary-search'],
    pattern: 'Binary search, find sorted half', ds: ['array'],
    constraints: 'n ≤ 5000, distinct values, must be O(log n)',
    time: 'O(log n)', space: 'O(1)',
    insight: 'One half around mid is always sorted; check if target lies in it.',
    signals: ['rotated sorted', 'distinct', 'O(log n)'],
    narration: [
      'Clarify: distinct values, return -1 if missing.',
      'O(log n) required, so binary search.',
      'Compare nums[left] with nums[mid] to see which half is sorted.',
      'If target is inside the sorted half go there, else the other half.',
      'O(log n) time, O(1) space.',
    ],
    pitfalls: ['Use <= when comparing nums[left] and nums[mid] (two elements)', 'Inclusive bounds on the range check'],
    wrong: ['Linear scan · O(n)', 'Find pivot then sort · O(n log n)', 'Hashmap value to index · O(n)'],
    solution: `class Solution:
    def search(self, nums: List[int], target: int) -> int:

        left, right = 0, len(nums) - 1

        while left <= right:
            mid = (left + right) // 2
            if nums[mid] == target:
                return mid

            if nums[left] <= nums[mid]:
                if nums[left] <= target < nums[mid]:
                    right = mid - 1
                else:
                    left = mid + 1
            else:
                if nums[mid] < target <= nums[right]:
                    left = mid + 1
                else:
                    right = mid - 1

        return -1`,
  },
  {
    lc: 7, title: 'Reverse Integer', difficulty: 'Medium', skills: ['math'],
    pattern: 'Pop and push digits', ds: [],
    constraints: '-2^31 ≤ x ≤ 2^31 - 1, return 0 on overflow',
    time: 'O(log x)', space: 'O(1)',
    insight: 'Reverse the absolute value digit by digit, then clamp to the 32-bit range.',
    signals: ['reverse digits', '32-bit', 'overflow returns 0'],
    narration: [
      'Clarify: overflow returns 0, keep the sign.',
      'Work on abs(x), pop last digit with % 10.',
      'Push it onto result with result * 10 + digit.',
      'Check the 32-bit range at the end.',
      'O(number of digits) = O(log x), O(1) space.',
    ],
    pitfalls: ['Python % with negatives is floor mod, so use abs', 'Overflow check'],
    wrong: ['String reverse ignoring sign · fails on negatives', 'Recursion per digit · O(log x) stack', 'Array of digits sorted · wrong'],
    solution: `class Solution:
    def reverse(self, x: int) -> int:

        sign = -1 if x < 0 else 1
        x = abs(x)
        result = 0

        while x:
            result = result * 10 + x % 10
            x //= 10

        result *= sign
        if result < -2**31 or result > 2**31 - 1:
            return 0
        return result`,
  },
  {
    lc: 410, title: 'Split Array Largest Sum', difficulty: 'Hard', skills: ['binary-search', 'greedy', 'constraints'],
    pattern: 'Binary search on the answer', ds: ['array'],
    constraints: 'n ≤ 1000, nums[i] ≤ 10^6, k ≤ min(50, n)',
    time: 'O(n log(sum))', space: 'O(1)',
    insight: 'Guess the max subarray sum; greedily count pieces; feasibility is monotonic.',
    signals: ['minimize the largest', 'split into k', 'non-negative'],
    narration: [
      'Clarify: k non-empty contiguous parts, values non-negative.',
      '"Minimize the maximum" hints binary search on the answer.',
      'Answer lies in [max(nums), sum(nums)].',
      'For a limit, greedily cut when the running sum would exceed it.',
      'If parts ≤ k the limit works, shrink right.',
      'O(n log sum) time, O(1) space.',
    ],
    pitfalls: ['Lower bound is max(nums), not 0', 'Use left < right with right = mid'],
    wrong: ['DP over (i, parts) · O(k·n^2)', 'Try all cut positions · exponential', 'Sort then split evenly · breaks contiguity'],
    solution: `class Solution:
    def splitArray(self, nums: List[int], k: int) -> int:

        def canSplit(limit):
            parts, total = 1, 0
            for num in nums:
                if total + num > limit:
                    parts += 1
                    total = 0
                total += num
            return parts <= k

        left, right = max(nums), sum(nums)

        while left < right:
            mid = (left + right) // 2
            if canSplit(mid):
                right = mid
            else:
                left = mid + 1

        return left`,
  },
  {
    lc: 125, title: 'Valid Palindrome', difficulty: 'Easy', skills: ['two-pointers'],
    pattern: 'Converging two pointers', ds: [],
    constraints: '1 ≤ n ≤ 2·10^5, printable ASCII',
    time: 'O(n)', space: 'O(1)',
    insight: 'Skip non-alphanumerics on each side and compare lowercase.',
    signals: ['palindrome', 'ignore non-alphanumeric', 'case-insensitive'],
    narration: [
      'Clarify: ignore punctuation and case.',
      'Pointers from both ends moving inward.',
      'Skip non-alnum characters, compare lowercased.',
      'O(n) time, O(1) space, no cleaned copy.',
    ],
    pitfalls: ['Empty after cleaning is True', 'Digits count as alphanumeric'],
    wrong: ['Build cleaned string and reverse · O(n) space', 'Recursion on substrings · O(n^2) slicing', 'Stack of chars · O(n) space'],
    solution: `class Solution:
    def isPalindrome(self, s: str) -> bool:

        left, right = 0, len(s) - 1

        while left < right:
            if not s[left].isalnum():
                left += 1
            elif not s[right].isalnum():
                right -= 1
            elif s[left].lower() != s[right].lower():
                return False
            else:
                left += 1
                right -= 1

        return True`,
  },
  {
    lc: 169, title: 'Majority Element', difficulty: 'Easy', skills: ['arrays-hashing', 'greedy'],
    pattern: 'Boyer-Moore voting', ds: [],
    constraints: '1 ≤ n ≤ 5·10^4, majority always exists, O(1) space follow-up',
    time: 'O(n)', space: 'O(1)',
    insight: 'Pair off different elements; the majority survives the cancellations.',
    signals: ['appears more than n/2', 'always exists', 'O(1) space'],
    narration: [
      'Clarify: majority is guaranteed.',
      'Counter works in O(n) space; follow-up wants O(1).',
      'Keep a candidate and count, reset when count hits 0.',
      'Matching votes +1, others -1.',
      'O(n) time, O(1) space.',
    ],
    pitfalls: ['Only valid because majority is guaranteed'],
    wrong: ['Counter dict · O(n) space', 'Sort and take middle · O(n log n)', 'Count each element · O(n^2)'],
    solution: `class Solution:
    def majorityElement(self, nums: List[int]) -> int:

        candidate, count = None, 0

        for num in nums:
            if count == 0:
                candidate = num
            count += 1 if num == candidate else -1

        return candidate`,
  },
  {
    lc: 242, title: 'Valid Anagram', difficulty: 'Easy', skills: ['arrays-hashing'],
    pattern: 'Frequency count', ds: ['hashmap'],
    constraints: '1 ≤ len ≤ 5·10^4, lowercase letters',
    time: 'O(n)', space: 'O(1) (26 letters)',
    insight: 'Anagrams have identical letter counts.',
    signals: ['anagram', 'same letters', 'rearrange'],
    narration: [
      'Clarify: lowercase only, lengths may differ.',
      'Different lengths return False immediately.',
      'Count letters of both and compare.',
      'O(n) time, O(26) space.',
    ],
    pitfalls: ['Unicode follow-up: use a dict, not a 26 array'],
    wrong: ['Sort both and compare · O(n log n)', 'Remove each char from list · O(n^2)', 'Set comparison · ignores counts'],
    solution: `from collections import Counter

class Solution:
    def isAnagram(self, s: str, t: str) -> bool:

        if len(s) != len(t):
            return False

        return Counter(s) == Counter(t)`,
  },
  {
    lc: 49, title: 'Group Anagrams', difficulty: 'Medium', skills: ['arrays-hashing', 'ds-diagnosis'],
    pattern: 'Hashmap keyed by letter count', ds: ['hashmap'],
    constraints: 'n ≤ 10^4, word length k ≤ 100, lowercase',
    time: 'O(n·k)', space: 'O(n·k)',
    insight: 'A 26-count tuple is a canonical key every anagram shares.',
    signals: ['group', 'anagrams', 'any order'],
    narration: [
      'Clarify: lowercase, output order does not matter.',
      'I need a key equal for all anagrams.',
      'Sorted word works in k log k; a 26-count tuple is O(k).',
      'dict from key to list of words.',
      'O(n·k) time and space.',
    ],
    pitfalls: ['Lists are unhashable, convert count to tuple'],
    wrong: ['Compare every pair · O(n^2·k)', 'Sorted string key · O(n·k log k)', 'Sum of char codes as key · collides'],
    solution: `from collections import defaultdict as dd

class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:

        groups = dd(list)

        for word in strs:
            count = [0] * 26
            for char in word:
                count[ord(char) - ord('a')] += 1
            groups[tuple(count)].append(word)

        return list(groups.values())`,
  },
  {
    lc: 14, title: 'Longest Common Prefix', difficulty: 'Easy', skills: ['arrays-hashing'],
    pattern: 'Vertical scan', ds: [],
    constraints: '1 ≤ n ≤ 200, length ≤ 200',
    time: 'O(S) total chars', space: 'O(1)',
    insight: 'Compare column by column against the first word; stop at the first mismatch.',
    signals: ['common prefix', 'array of strings'],
    narration: [
      'Clarify: empty string allowed, return "" if none.',
      'Walk characters of the first word by index.',
      'Every other word must have the same char at that index.',
      'Stop at first mismatch or short word.',
      'O(S) time where S is total characters, O(1) space.',
    ],
    pitfalls: ['A shorter word ends the prefix'],
    wrong: ['Build a trie of all words · O(S) space', 'Check every prefix of every word · O(S·m)', 'Binary search on length · O(S log m) and more complex'],
    solution: `class Solution:
    def longestCommonPrefix(self, strs: List[str]) -> str:

        for i, char in enumerate(strs[0]):
            for word in strs[1:]:
                if i >= len(word) or word[i] != char:
                    return strs[0][:i]

        return strs[0]`,
  },
  {
    lc: 560, title: 'Subarray Sum Equals K', difficulty: 'Medium', skills: ['prefix-sum', 'arrays-hashing', 'constraints'],
    pattern: 'Prefix sum + hashmap of counts', ds: ['hashmap'],
    constraints: 'n ≤ 2·10^4, values can be negative',
    time: 'O(n)', space: 'O(n)',
    insight: 'sum(i..j) = prefix[j] - prefix[i-1], so count earlier prefixes equal to prefix - k.',
    signals: ['count subarrays', 'sum equals k', 'negatives allowed'],
    narration: [
      'Clarify: negatives allowed, so sliding window fails.',
      'Subarray sum is a difference of two prefix sums.',
      'Map prefix value to how many times seen, seed {0: 1}.',
      'At each prefix, add count of prefix - k.',
      'O(n) time, O(n) space.',
    ],
    pitfalls: ['Seed counts[0] = 1 for subarrays starting at 0', 'Sliding window breaks with negatives'],
    wrong: ['Sliding window · fails with negatives', 'All subarrays with running sum · O(n^2)', 'Sort + two pointers · loses contiguity'],
    solution: `from collections import defaultdict as dd

class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:

        counts = dd(int)
        counts[0] = 1
        prefix = 0
        result = 0

        for num in nums:
            prefix += num
            result += counts[prefix - k]
            counts[prefix] += 1

        return result`,
  },
  {
    lc: 42, title: 'Trapping Rain Water', difficulty: 'Hard', skills: ['two-pointers', 'monotonic-stack'],
    pattern: 'Two pointers with running maxes', ds: [],
    constraints: '1 ≤ n ≤ 2·10^4, 0 ≤ height ≤ 10^5',
    time: 'O(n)', space: 'O(1)',
    insight: 'Water at i = min(maxLeft, maxRight) - h; move the side with the smaller max.',
    signals: ['trap water', 'elevation map', 'bars'],
    narration: [
      'Clarify: width 1 bars, non-negative heights.',
      'Water above i is min of tallest left and right minus height.',
      'Prefix max arrays give O(n) space; two pointers give O(1).',
      'The lower side is bounded by its own max, so process it.',
      'O(n) time, O(1) space.',
    ],
    pitfalls: ['Update max before adding water', 'Move the smaller side'],
    wrong: ['For each bar scan left and right · O(n^2)', 'Sort heights · loses positions', 'Heap of bars · O(n log n) (that is the 2D version)'],
    solution: `class Solution:
    def trap(self, height: List[int]) -> int:

        left, right = 0, len(height) - 1
        leftMax, rightMax = 0, 0
        result = 0

        while left < right:
            if height[left] < height[right]:
                leftMax = max(leftMax, height[left])
                result += leftMax - height[left]
                left += 1
            else:
                rightMax = max(rightMax, height[right])
                result += rightMax - height[right]
                right -= 1

        return result`,
  },
  {
    lc: 11, title: 'Container With Most Water', difficulty: 'Medium', skills: ['two-pointers', 'greedy'],
    pattern: 'Converging pointers, move the shorter', ds: [],
    constraints: '2 ≤ n ≤ 10^5, 0 ≤ height ≤ 10^4',
    time: 'O(n)', space: 'O(1)',
    insight: 'The shorter wall caps the area; moving the taller one can never help.',
    signals: ['two lines', 'max area', 'n ≤ 10^5'],
    narration: [
      'Clarify: area = width times shorter height.',
      'n is 10^5, so all pairs O(n^2) is too slow.',
      'Start widest, then move the shorter pointer inward.',
      'Moving the taller only shrinks width with the same cap.',
      'O(n) time, O(1) space.',
    ],
    pitfalls: ['Confusing with trapping rain water'],
    wrong: ['All pairs · O(n^2)', 'Sort by height · loses positions', 'Monotonic stack · solves a different problem'],
    solution: `class Solution:
    def maxArea(self, height: List[int]) -> int:

        left, right = 0, len(height) - 1
        result = 0

        while left < right:
            area = (right - left) * min(height[left], height[right])
            result = max(result, area)
            if height[left] < height[right]:
                left += 1
            else:
                right -= 1

        return result`,
  },
  {
    lc: 35, title: 'Search Insert Position', difficulty: 'Easy', skills: ['binary-search'],
    pattern: 'Lower-bound binary search', ds: ['array'],
    constraints: 'n ≤ 10^4, sorted distinct, O(log n) required',
    time: 'O(log n)', space: 'O(1)',
    insight: 'Find the first index whose value is ≥ target.',
    signals: ['sorted', 'insert position', 'O(log n)'],
    narration: [
      'Clarify: return the index or where it would go.',
      'That is the lower bound: first value ≥ target.',
      'Half-open [left, right) with right = len(nums).',
      'O(log n) time, O(1) space.',
    ],
    pitfalls: ['Target larger than all returns len(nums)'],
    wrong: ['Linear scan · O(n)', 'Insert and sort · O(n log n)', 'Hash set · no ordering'],
    solution: `class Solution:
    def searchInsert(self, nums: List[int], target: int) -> int:

        left, right = 0, len(nums)

        while left < right:
            mid = (left + right) // 2
            if nums[mid] < target:
                left = mid + 1
            else:
                right = mid

        return left`,
  },
  {
    lc: 70, title: 'Climbing Stairs', difficulty: 'Easy', skills: ['dp-1d'],
    pattern: 'Fibonacci DP', ds: [],
    constraints: '1 ≤ n ≤ 45',
    time: 'O(n)', space: 'O(1)',
    insight: 'ways(n) = ways(n-1) + ways(n-2): last step was 1 or 2.',
    signals: ['how many ways', '1 or 2 steps'],
    narration: [
      'Clarify: steps of 1 or 2, count distinct ways.',
      'Last move was 1 or 2, so ways(n) = ways(n-1) + ways(n-2).',
      'Only the previous two values matter.',
      'O(n) time, O(1) space.',
    ],
    pitfalls: ['Plain recursion without memo is O(2^n)'],
    wrong: ['Plain recursion · O(2^n)', 'Enumerate all step sequences · exponential', 'Combinatorics with factorials · overflow-prone'],
    solution: `class Solution:
    def climbStairs(self, n: int) -> int:

        prev, curr = 1, 1

        for _ in range(n - 1):
            prev, curr = curr, prev + curr

        return curr`,
  },
  {
    lc: 20, title: 'Valid Parentheses', difficulty: 'Easy', skills: ['stack'],
    pattern: 'Stack of open brackets', ds: ['stack'],
    constraints: '1 ≤ n ≤ 10^4, only ()[]{}',
    time: 'O(n)', space: 'O(n)',
    insight: 'Every closer must match the most recent unmatched opener: LIFO.',
    signals: ['brackets', 'valid', 'matching'],
    narration: [
      'Clarify: only bracket characters.',
      'Most recent opener must close first, so a stack.',
      'Push openers, on closer pop and compare.',
      'Valid only if the stack ends empty.',
      'O(n) time, O(n) space.',
    ],
    pitfalls: ['Closer with empty stack', 'Leftover openers'],
    wrong: ['Count each bracket type · misses ([)]', 'Repeatedly delete "()" pairs · O(n^2)', 'Queue · wrong order'],
    solution: `class Solution:
    def isValid(self, s: str) -> bool:

        pairs = {')': '(', ']': '[', '}': '{'}
        stack = []

        for char in s:
            if char in pairs:
                if not stack or stack.pop() != pairs[char]:
                    return False
            else:
                stack.append(char)

        return not stack`,
  },
  {
    lc: 16, title: '3Sum Closest', difficulty: 'Medium', skills: ['two-pointers', 'constraints'],
    pattern: 'Sort + two pointers', ds: ['array'],
    constraints: '3 ≤ n ≤ 500, exactly one closest answer',
    time: 'O(n^2)', space: 'O(1) extra',
    insight: 'Same as 3Sum but track the best distance instead of exact hits.',
    signals: ['closest to target', 'three integers'],
    narration: [
      'Clarify: return the sum, not the triplet.',
      'Sort, fix i, two pointers on the rest.',
      'Track the sum with smallest |total - target|.',
      'Move left if too small, right if too big, exact returns early.',
      'O(n^2) time, O(1) extra.',
    ],
    pitfalls: ['Initialize result with a real triplet sum'],
    wrong: ['Three nested loops · O(n^3), passes but not optimal', 'Binary search third · O(n^2 log n)', 'Hash set of pairs · cannot do "closest"'],
    solution: `class Solution:
    def threeSumClosest(self, nums: List[int], target: int) -> int:

        nums.sort()
        result = nums[0] + nums[1] + nums[2]

        for i in range(len(nums) - 2):
            left, right = i + 1, len(nums) - 1
            while left < right:
                total = nums[i] + nums[left] + nums[right]
                if abs(total - target) < abs(result - target):
                    result = total
                if total < target:
                    left += 1
                elif total > target:
                    right -= 1
                else:
                    return total

        return result`,
  },
  {
    lc: 217, title: 'Contains Duplicate', difficulty: 'Easy', skills: ['arrays-hashing'],
    pattern: 'Hash set', ds: ['set'],
    constraints: '1 ≤ n ≤ 10^5',
    time: 'O(n)', space: 'O(n)',
    insight: 'A set answers "seen before?" in O(1).',
    signals: ['any value twice', 'duplicate'],
    narration: [
      'Scan once, keep a set of seen values.',
      'Return True the moment a value repeats.',
      'O(n) time, O(n) space; sorting would be O(1) space but n log n.',
    ],
    pitfalls: ['Mention the sort trade-off'],
    wrong: ['Compare all pairs · O(n^2)', 'Sort then compare neighbors · O(n log n)', 'Counter then scan · O(n) but two passes'],
    solution: `class Solution:
    def containsDuplicate(self, nums: List[int]) -> bool:

        seen = set()

        for num in nums:
            if num in seen:
                return True
            seen.add(num)

        return False`,
  },
  {
    lc: 283, title: 'Move Zeroes', difficulty: 'Easy', skills: ['two-pointers'],
    pattern: 'Read/write swap', ds: ['array'],
    constraints: '1 ≤ n ≤ 10^4, in place, keep order',
    time: 'O(n)', space: 'O(1)',
    insight: 'Swap each non-zero into the write slot; zeros drift to the end.',
    signals: ['in place', 'keep relative order', 'zeros to end'],
    narration: [
      'Clarify: in place, non-zero order preserved.',
      'Write pointer marks next slot for a non-zero.',
      'Swap read and write when nums[read] is non-zero.',
      'O(n) time, O(1) space.',
    ],
    pitfalls: ['Do not sort, it breaks order'],
    wrong: ['Remove zeros and append · O(n^2) list ops', 'Sort with key · O(n log n)', 'Copy to new array · O(n) space'],
    solution: `class Solution:
    def moveZeroes(self, nums: List[int]) -> None:

        write = 0

        for read in range(len(nums)):
            if nums[read] != 0:
                nums[write], nums[read] = nums[read], nums[write]
                write += 1`,
  },
  {
    lc: 200, title: 'Number of Islands', difficulty: 'Medium', skills: ['grid', 'graph-bfs', 'graph-dfs', 'communication'],
    pattern: 'Flood fill (BFS/DFS) per island', ds: ['queue', 'grid'],
    constraints: 'm, n ≤ 300, cells "0"/"1"',
    time: 'O(m·n)', space: 'O(m·n) worst',
    insight: 'Each unvisited land cell starts a new island; flood it so it is never counted again.',
    signals: ['grid', 'connected', '4-directional', 'count islands'],
    narration: [
      'Clarify: 4-directional, can I mutate the grid? Yes.',
      'Cells are nodes, adjacent land cells are edges.',
      'Scan; on unvisited land, count one and flood fill it.',
      'BFS with a deque avoids recursion depth on 300x300.',
      'Each cell processed once: O(m·n) time and space.',
    ],
    pitfalls: ['Mark visited when enqueuing, not when popping', 'Recursive DFS can hit Python recursion limit'],
    wrong: ['Union-Find without path compression · near O(m·n·log)', 'BFS from every cell · O((m·n)^2)', 'Dijkstra · weights do not exist'],
    solution: `from collections import deque

class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:

        rows, cols = len(grid), len(grid[0])
        result = 0

        def bfs(r, c):
            queue = deque([(r, c)])
            grid[r][c] = '0'
            while queue:
                row, col = queue.popleft()
                for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nr, nc = row + dr, col + dc
                    if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == '1':
                        grid[nr][nc] = '0'
                        queue.append((nr, nc))

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == '1':
                    bfs(r, c)
                    result += 1

        return result`,
  },
  {
    lc: 704, title: 'Binary Search', difficulty: 'Easy', skills: ['binary-search'],
    pattern: 'Classic binary search', ds: ['array'],
    constraints: 'n ≤ 10^4, sorted, distinct, O(log n)',
    time: 'O(log n)', space: 'O(1)',
    insight: 'Halve the search range each step using the sorted order.',
    signals: ['sorted', 'O(log n)', 'find target'],
    narration: [
      'Clarify: return -1 if absent.',
      'Inclusive bounds, loop while left ≤ right.',
      'Compare mid, discard the half that cannot contain target.',
      'O(log n) time, O(1) space.',
    ],
    pitfalls: ['left <= right with inclusive bounds', 'mid ± 1 to avoid infinite loop'],
    wrong: ['Linear scan · O(n)', 'Set lookup · loses index', 'Recursion on slices · O(n) copying'],
    solution: `class Solution:
    def search(self, nums: List[int], target: int) -> int:

        left, right = 0, len(nums) - 1

        while left <= right:
            mid = (left + right) // 2
            if nums[mid] == target:
                return mid
            if nums[mid] < target:
                left = mid + 1
            else:
                right = mid - 1

        return -1`,
  },
  {
    lc: 344, title: 'Reverse String', difficulty: 'Easy', skills: ['two-pointers'],
    pattern: 'Swap from both ends', ds: ['array'],
    constraints: '1 ≤ n ≤ 10^5, in place, O(1) extra',
    time: 'O(n)', space: 'O(1)',
    insight: 'Swap the ends and walk inward.',
    signals: ['in place', 'reverse'],
    narration: [
      'Two pointers at both ends.',
      'Swap and move inward until they meet.',
      'O(n) time, O(1) space.',
    ],
    pitfalls: ['s = s[::-1] rebinds, does not modify in place'],
    wrong: ['s[::-1] into new list · O(n) space', 'Stack push/pop · O(n) space', 'Recursion · O(n) stack'],
    solution: `class Solution:
    def reverseString(self, s: List[str]) -> None:

        left, right = 0, len(s) - 1

        while left < right:
            s[left], s[right] = s[right], s[left]
            left += 1
            right -= 1`,
  },
  {
    lc: 713, title: 'Subarray Product Less Than K', difficulty: 'Medium', skills: ['sliding-window'],
    pattern: 'Sliding window counting', ds: [],
    constraints: 'n ≤ 3·10^4, 1 ≤ nums[i] ≤ 1000, k ≤ 10^6',
    time: 'O(n)', space: 'O(1)',
    insight: 'Positive values make product monotonic; each right adds right - left + 1 subarrays.',
    signals: ['contiguous', 'product less than k', 'positive integers'],
    narration: [
      'Clarify: all positive, so growing the window grows the product.',
      'Expand right, shrink left while product ≥ k.',
      'Every subarray ending at right inside the window counts.',
      'That adds right - left + 1 each step.',
      'O(n) time, O(1) space.',
    ],
    pitfalls: ['k ≤ 1 returns 0', 'Count subarrays, not windows'],
    wrong: ['All subarrays · O(n^2)', 'Prefix products + binary search · O(n log n) with log tricks', 'Hashmap of products · does not apply to "less than"'],
    solution: `class Solution:
    def numSubarrayProductLessThanK(self, nums: List[int], k: int) -> int:

        if k <= 1:
            return 0

        product = 1
        left = 0
        result = 0

        for right, num in enumerate(nums):
            product *= num
            while product >= k:
                product //= nums[left]
                left += 1
            result += right - left + 1

        return result`,
  },
  {
    lc: 496, title: 'Next Greater Element I', difficulty: 'Easy', skills: ['monotonic-stack', 'arrays-hashing'],
    pattern: 'Monotonic decreasing stack + map', ds: ['stack', 'hashmap'],
    constraints: 'nums1 ⊆ nums2, length ≤ 1000, distinct',
    time: 'O(n + m)', space: 'O(n)',
    insight: 'When a bigger number arrives, it is the next greater for everything smaller on the stack.',
    signals: ['next greater', 'to the right', 'distinct'],
    narration: [
      'Clarify: values distinct, nums1 is a subset of nums2.',
      'Precompute next greater for every value in nums2.',
      'Stack holds values still waiting, decreasing from bottom.',
      'A bigger num pops them and becomes their answer.',
      'O(n + m) time, O(n) space.',
    ],
    pitfalls: ['Values left on the stack map to -1'],
    wrong: ['Scan right for each query · O(n·m)', 'Sort nums2 · loses positions', 'Heap of seen values · O(n log n)'],
    solution: `class Solution:
    def nextGreaterElement(self, nums1: List[int], nums2: List[int]) -> List[int]:

        nextGreater = {}
        stack = []

        for num in nums2:
            while stack and stack[-1] < num:
                nextGreater[stack.pop()] = num
            stack.append(num)

        return [nextGreater.get(num, -1) for num in nums1]`,
  },
  {
    lc: 347, title: 'Top K Frequent Elements', difficulty: 'Medium', skills: ['heap', 'arrays-hashing', 'ds-diagnosis'],
    pattern: 'Count + bucket sort', ds: ['hashmap', 'array'],
    constraints: 'n ≤ 10^5, must beat O(n log n)',
    time: 'O(n)', space: 'O(n)',
    insight: 'Frequencies are at most n, so bucket by frequency instead of sorting.',
    signals: ['k most frequent', 'better than n log n'],
    narration: [
      'Clarify: answer is unique, any order.',
      'Count with Counter in O(n).',
      'Sorting counts is n log n; heap of size k is n log k.',
      'Buckets indexed by frequency give O(n).',
      'Walk buckets from high to low until I have k.',
    ],
    pitfalls: ['Bucket array size n + 1'],
    wrong: ['Sort by frequency · O(n log n)', 'Max-heap of all · O(n log n)', 'Repeated max scans · O(n·k)'],
    solution: `from collections import Counter

class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:

        count = Counter(nums)
        buckets = [[] for _ in range(len(nums) + 1)]

        for num, freq in count.items():
            buckets[freq].append(num)

        result = []
        for freq in range(len(buckets) - 1, 0, -1):
            for num in buckets[freq]:
                result.append(num)
                if len(result) == k:
                    return result

        return result`,
  },
  {
    lc: 875, title: 'Koko Eating Bananas', difficulty: 'Medium', skills: ['binary-search', 'constraints'],
    pattern: 'Binary search on the answer', ds: [],
    constraints: 'n ≤ 10^4, piles[i] ≤ 10^9, n ≤ h ≤ 10^9',
    time: 'O(n log max)', space: 'O(1)',
    insight: 'Hours needed decreases as speed grows; find the smallest speed that fits.',
    signals: ['minimum speed', 'within h hours', 'values up to 10^9'],
    narration: [
      'Clarify: one pile per hour max, h ≥ number of piles.',
      'Speed up to 10^9 means binary search on speed.',
      'Feasible check: sum of ceil(pile / speed) ≤ h.',
      'Feasibility is monotonic so search [1, max(piles)].',
      'O(n log max) time, O(1) space.',
    ],
    pitfalls: ['Ceil with (pile + speed - 1) // speed', 'Lower bound 1, not 0'],
    wrong: ['Try every speed from 1 up · O(n·max)', 'Greedy largest pile first · not a schedule problem', 'Heap of piles · O(h log n)'],
    solution: `class Solution:
    def minEatingSpeed(self, piles: List[int], h: int) -> int:

        left, right = 1, max(piles)

        while left < right:
            speed = (left + right) // 2
            hours = sum((pile + speed - 1) // speed for pile in piles)
            if hours <= h:
                right = speed
            else:
                left = speed + 1

        return left`,
  },
  {
    lc: 312, title: 'Burst Balloons', difficulty: 'Hard', skills: ['dp-2d', 'constraints'],
    pattern: 'Interval DP (last to burst)', ds: ['dp table'],
    constraints: '1 ≤ n ≤ 300, 0 ≤ nums[i] ≤ 100',
    time: 'O(n^3)', space: 'O(n^2)',
    insight: 'Pick which balloon bursts LAST in (left, right); its neighbors are then fixed.',
    signals: ['burst', 'neighbors change', 'n ≤ 300'],
    narration: [
      'Clarify: out of bounds counts as 1.',
      'n ≤ 300 allows O(n^3).',
      'Choosing first burst changes neighbors, choosing last does not.',
      'dp(l, r) = max over last of nums[l]·nums[last]·nums[r] + dp(l, last) + dp(last, r).',
      'n^2 states, n choices: O(n^3) time, O(n^2) space.',
    ],
    pitfalls: ['Pad with 1 on both ends', 'Exclusive interval bounds'],
    wrong: ['Try all burst orders · O(n!)', 'Greedy burst smallest first · wrong', 'Bitmask DP · O(2^n·n)'],
    solution: `from functools import cache

class Solution:
    def maxCoins(self, nums: List[int]) -> int:

        nums = [1] + nums + [1]

        @cache
        def dp(left, right):
            if left + 1 == right:
                return 0
            best = 0
            for last in range(left + 1, right):
                coins = nums[left] * nums[last] * nums[right]
                best = max(best, coins + dp(left, last) + dp(last, right))
            return best

        return dp(0, len(nums) - 1)`,
  },
  {
    lc: 53, title: 'Maximum Subarray', difficulty: 'Medium', skills: ['dp-1d', 'greedy'],
    pattern: "Kadane's algorithm", ds: [],
    constraints: '1 ≤ n ≤ 10^5, values ±10^4',
    time: 'O(n)', space: 'O(1)',
    insight: 'Best sum ending here = max(num, num + best ending at previous).',
    signals: ['contiguous', 'largest sum', 'negatives'],
    narration: [
      'Clarify: at least one element, all-negative allowed.',
      'n is 10^5 so O(n^2) is out.',
      'Either extend the previous run or start fresh at num.',
      'Track the best seen.',
      'O(n) time, O(1) space.',
    ],
    pitfalls: ['Initialize result to nums[0], not 0'],
    wrong: ['All subarrays · O(n^2)', 'Sliding window · fails with negatives', 'Divide and conquer · O(n log n)'],
    solution: `class Solution:
    def maxSubArray(self, nums: List[int]) -> int:

        result = nums[0]
        curr = 0

        for num in nums:
            curr = max(num, curr + num)
            result = max(result, curr)

        return result`,
  },
  {
    lc: 28, title: 'Find the Index of the First Occurrence in a String', difficulty: 'Easy', skills: ['arrays-hashing', 'sliding-window'],
    pattern: 'Window compare (KMP for linear)', ds: [],
    constraints: '1 ≤ n, m ≤ 10^4',
    time: 'O(n·m), KMP O(n + m)', space: 'O(m)',
    insight: 'Compare each length-m window; mention KMP if asked for linear time.',
    signals: ['substring search', 'first occurrence'],
    narration: [
      'Clarify: return -1 if absent.',
      'Slide a window of len(needle) over haystack.',
      'At 10^4 each, n·m is fine in practice.',
      'KMP reaches O(n + m) using a prefix table if they push.',
    ],
    pitfalls: ['Loop to n - m inclusive'],
    wrong: ['All substrings into a set · O(n·m) space', 'Sort characters · meaningless', 'Binary search · not sorted'],
    solution: `class Solution:
    def strStr(self, haystack: str, needle: str) -> int:

        n, m = len(haystack), len(needle)

        for i in range(n - m + 1):
            if haystack[i:i + m] == needle:
                return i

        return -1`,
  },
  {
    lc: 485, title: 'Max Consecutive Ones', difficulty: 'Easy', skills: ['arrays-hashing'],
    pattern: 'Running count', ds: [],
    constraints: '1 ≤ n ≤ 10^5, binary array',
    time: 'O(n)', space: 'O(1)',
    insight: 'Count the current run; reset on 0.',
    signals: ['consecutive 1s', 'binary array'],
    narration: [
      'Track current streak and best streak.',
      'A 0 resets current.',
      'O(n) time, O(1) space.',
    ],
    pitfalls: ['Update best inside the loop, not only on 0'],
    wrong: ["Split string on '0' · O(n) space", 'All subarrays · O(n^2)', 'Sort · destroys runs'],
    solution: `class Solution:
    def findMaxConsecutiveOnes(self, nums: List[int]) -> int:

        result = curr = 0

        for num in nums:
            curr = curr + 1 if num == 1 else 0
            result = max(result, curr)

        return result`,
  },
  {
    lc: 680, title: 'Valid Palindrome II', difficulty: 'Easy', skills: ['two-pointers', 'greedy'],
    pattern: 'Two pointers, one skip', ds: [],
    constraints: '1 ≤ n ≤ 10^5, delete at most one char',
    time: 'O(n)', space: 'O(1)',
    insight: 'At the first mismatch, try skipping left or right once.',
    signals: ['palindrome', 'delete at most one'],
    narration: [
      'Clarify: at most one deletion.',
      'Two pointers inward until first mismatch.',
      'Then check s[left+1..right] or s[left..right-1] is a palindrome.',
      'At most two linear scans: O(n) time, O(1) space.',
    ],
    pitfalls: ['Must try both skips', 'Do not slice repeatedly in a loop'],
    wrong: ['Delete each index and check · O(n^2)', 'Count char parity · ignores order', 'DP on substrings · O(n^2)'],
    solution: `class Solution:
    def validPalindrome(self, s: str) -> bool:

        def isPal(left, right):
            while left < right:
                if s[left] != s[right]:
                    return False
                left += 1
                right -= 1
            return True

        left, right = 0, len(s) - 1

        while left < right:
            if s[left] != s[right]:
                return isPal(left + 1, right) or isPal(left, right - 1)
            left += 1
            right -= 1

        return True`,
  },
  {
    lc: 84, title: 'Largest Rectangle in Histogram', difficulty: 'Hard', skills: ['monotonic-stack'],
    pattern: 'Monotonic increasing stack', ds: ['stack'],
    constraints: '1 ≤ n ≤ 10^5, heights ≤ 10^4',
    time: 'O(n)', space: 'O(n)',
    insight: 'A bar popped by a shorter one knows its right edge; its stack start is its left edge.',
    signals: ['histogram', 'largest rectangle', 'n ≤ 10^5'],
    narration: [
      'Clarify: width 1 bars.',
      'For each bar, the widest span where it is the shortest.',
      'Stack keeps (start, height) with increasing heights.',
      'A shorter bar pops taller ones and inherits their start.',
      'Sentinel 0 at the end flushes the stack. O(n) time and space.',
    ],
    pitfalls: ['Inherit start index when popping', 'Flush stack with a sentinel'],
    wrong: ['Expand from every bar · O(n^2)', 'Divide and conquer at min · O(n log n) avg, O(n^2) worst', 'Two pointers · no monotonic property'],
    solution: `class Solution:
    def largestRectangleArea(self, heights: List[int]) -> int:

        stack = []
        result = 0

        for i, h in enumerate(heights + [0]):
            start = i
            while stack and stack[-1][1] >= h:
                index, height = stack.pop()
                result = max(result, height * (i - index))
                start = index
            stack.append((start, h))

        return result`,
  },
  {
    lc: 21, title: 'Merge Two Sorted Lists', difficulty: 'Easy', skills: ['linked-list'],
    pattern: 'Dummy head + splice', ds: ['linked list'],
    constraints: '0 ≤ nodes ≤ 50 each, sorted',
    time: 'O(m + n)', space: 'O(1)',
    insight: 'A dummy head lets you always attach the smaller node without special cases.',
    signals: ['merge', 'sorted linked lists'],
    narration: [
      'Clarify: reuse nodes, either list may be empty.',
      'Dummy node and a tail pointer.',
      'Attach the smaller head, advance it.',
      'Append whatever list remains.',
      'O(m + n) time, O(1) space.',
    ],
    pitfalls: ['Attach the leftover list at the end'],
    wrong: ['Collect values, sort, rebuild · O((m+n) log(m+n))', 'Recursion · O(m+n) stack', 'Heap of nodes · overkill for 2 lists'],
    solution: `class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:

        dummy = ListNode()
        curr = dummy

        while list1 and list2:
            if list1.val <= list2.val:
                curr.next = list1
                list1 = list1.next
            else:
                curr.next = list2
                list2 = list2.next
            curr = curr.next

        curr.next = list1 or list2
        return dummy.next`,
  },
  {
    lc: 39, title: 'Combination Sum', difficulty: 'Medium', skills: ['backtracking', 'constraints'],
    pattern: 'Backtracking with reuse', ds: ['recursion'],
    constraints: 'n ≤ 30, 2 ≤ candidates[i] ≤ 40, target ≤ 40, distinct',
    time: 'O(n^(t/m)) exponential', space: 'O(t/m) depth',
    insight: 'Recurse with the same start index to allow reuse; increasing start avoids duplicates.',
    signals: ['all combinations', 'reuse unlimited', 'small target'],
    narration: [
      'Clarify: unlimited reuse, combinations not permutations.',
      'Small target (≤ 40) means exhaustive search is fine.',
      'dfs(start, remaining) tries candidates from start on.',
      'Pass i, not i + 1, so a number can repeat.',
      'Exponential time, recursion depth target / min.',
    ],
    pitfalls: ['Append a copy of path', 'Start index prevents [2,3] and [3,2]'],
    wrong: ['BFS over sums · exponential memory', 'Unbounded knapsack counts · gives count, not lists', 'Greedy largest first · misses combos'],
    solution: `class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:

        result = []
        path = []

        def dfs(start, remaining):
            if remaining == 0:
                result.append(path[:])
                return
            for i in range(start, len(candidates)):
                if candidates[i] <= remaining:
                    path.append(candidates[i])
                    dfs(i, remaining - candidates[i])
                    path.pop()

        dfs(0, target)
        return result`,
  },
  {
    lc: 153, title: 'Find Minimum in Rotated Sorted Array', difficulty: 'Medium', skills: ['binary-search'],
    pattern: 'Binary search vs right end', ds: ['array'],
    constraints: 'n ≤ 5000, distinct, O(log n)',
    time: 'O(log n)', space: 'O(1)',
    insight: 'If nums[mid] > nums[right], the drop (min) is to the right of mid.',
    signals: ['rotated', 'minimum', 'O(log n)'],
    narration: [
      'Clarify: distinct values, rotated 1..n times.',
      'Compare mid with right end.',
      'Bigger means min is right of mid, else mid or left.',
      'Loop until left == right.',
      'O(log n) time, O(1) space.',
    ],
    pitfalls: ['right = mid, not mid - 1 (mid could be min)'],
    wrong: ['min(nums) · O(n)', 'Sort · O(n log n)', 'Compare with nums[left] · breaks when not rotated'],
    solution: `class Solution:
    def findMin(self, nums: List[int]) -> int:

        left, right = 0, len(nums) - 1

        while left < right:
            mid = (left + right) // 2
            if nums[mid] > nums[right]:
                left = mid + 1
            else:
                right = mid

        return nums[left]`,
  },
  {
    lc: 104, title: 'Maximum Depth of Binary Tree', difficulty: 'Easy', skills: ['tree-dfs', 'communication'],
    pattern: 'Post-order DFS', ds: ['tree'],
    constraints: '0 ≤ nodes ≤ 10^4',
    time: 'O(n)', space: 'O(h)',
    insight: 'Depth = 1 + max(depth of left, depth of right).',
    signals: ['max depth', 'binary tree'],
    narration: [
      'Clarify: empty tree has depth 0.',
      'Recursive: ask each child its depth, take the max, add 1.',
      'Every node visited once: O(n).',
      'Stack depth is tree height h, O(n) if skewed.',
    ],
    pitfalls: ['Skewed tree recursion depth'],
    wrong: ['Count all nodes · wrong quantity', 'BFS storing all paths · O(n·h)', 'Heap of depths · O(n log n)'],
    solution: `class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:

        if not root:
            return 0

        return 1 + max(self.maxDepth(root.left), self.maxDepth(root.right))`,
  },
  {
    lc: 78, title: 'Subsets', difficulty: 'Medium', skills: ['backtracking', 'constraints'],
    pattern: 'Include/exclude backtracking', ds: ['recursion'],
    constraints: '1 ≤ n ≤ 10, distinct',
    time: 'O(n·2^n)', space: 'O(n) depth',
    insight: 'Each element is in or out: a binary decision tree with 2^n leaves.',
    signals: ['all subsets', 'power set', 'n ≤ 10'],
    narration: [
      'Clarify: distinct values, any order.',
      'n ≤ 10 means 2^n output is expected.',
      'dfs(i): include nums[i], recurse, pop, exclude, recurse.',
      'Copy path at each leaf.',
      'O(n·2^n) time, O(n) recursion depth.',
    ],
    pitfalls: ['Append path[:] not path'],
    wrong: ['Nested loops per size · messy O(n·2^n)', 'DP table · no overlapping subproblems', 'Permutations then dedupe · O(n!)'],
    solution: `class Solution:
    def subsets(self, nums: List[int]) -> List[List[int]]:

        result = []
        path = []

        def dfs(i):
            if i == len(nums):
                result.append(path[:])
                return
            path.append(nums[i])
            dfs(i + 1)
            path.pop()
            dfs(i + 1)

        dfs(0)
        return result`,
  },
  {
    lc: 739, title: 'Daily Temperatures', difficulty: 'Medium', skills: ['monotonic-stack', 'constraints'],
    pattern: 'Monotonic decreasing stack of indices', ds: ['stack'],
    constraints: '1 ≤ n ≤ 10^5, 30 ≤ temp ≤ 100',
    time: 'O(n)', space: 'O(n)',
    insight: 'Unresolved days wait on a stack; a warmer day resolves all cooler ones on top.',
    signals: ['next warmer day', 'how many days until'],
    narration: [
      'Clarify: 0 if no warmer day.',
      'n is 10^5 so scanning forward per day is O(n^2).',
      'Stack of indices with decreasing temps.',
      'Warmer temp pops and records i - prev.',
      'Each index pushed and popped once: O(n).',
    ],
    pitfalls: ['Store indices, not temps', 'Strictly warmer uses <'],
    wrong: ['Scan forward per day · O(n^2)', 'Sort by temp · loses order', 'Heap of temps · O(n log n)'],
    solution: `class Solution:
    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:

        result = [0] * len(temperatures)
        stack = []

        for i, temp in enumerate(temperatures):
            while stack and temperatures[stack[-1]] < temp:
                prev = stack.pop()
                result[prev] = i - prev
            stack.append(i)

        return result`,
  },
  {
    lc: 743, title: 'Network Delay Time', difficulty: 'Medium', skills: ['dijkstra', 'graph-modeling', 'heap'],
    pattern: 'Dijkstra with min-heap', ds: ['heap', 'adjacency list'],
    constraints: 'n ≤ 100, edges ≤ 6000, weights 0..100',
    time: 'O(E log V)', space: 'O(V + E)',
    insight: 'Time for all to receive = the farthest shortest-path distance from k.',
    signals: ['signal from k', 'weighted directed edges', 'minimum time'],
    narration: [
      'Clarify: directed, non-negative weights, -1 if unreachable.',
      'Weighted shortest path with non-negative weights: Dijkstra.',
      'Adjacency list, heap of (time, node).',
      'First pop of a node is final; skip later pops.',
      'Answer is max distance. O(E log V) time, O(V + E) space.',
    ],
    pitfalls: ['Unreached nodes return -1', 'Skip stale heap entries'],
    wrong: ['Plain BFS · ignores weights', 'DFS all paths · exponential', 'Floyd-Warshall · O(V^3), fine here but not optimal'],
    solution: `import heapq
from collections import defaultdict as dd

class Solution:
    def networkDelayTime(self, times: List[List[int]], n: int, k: int) -> int:

        graph = dd(list)
        for u, v, w in times:
            graph[u].append((v, w))

        dist = {}
        heap = [(0, k)]

        while heap:
            time, node = heapq.heappop(heap)
            if node in dist:
                continue
            dist[node] = time
            for nei, w in graph[node]:
                if nei not in dist:
                    heapq.heappush(heap, (time + w, nei))

        return max(dist.values()) if len(dist) == n else -1`,
  },
  {
    lc: 215, title: 'Kth Largest Element in an Array', difficulty: 'Medium', skills: ['heap', 'ds-diagnosis'],
    pattern: 'Min-heap of size k (or quickselect)', ds: ['heap'],
    constraints: '1 ≤ k ≤ n ≤ 10^5, solve without full sort',
    time: 'O(n log k)', space: 'O(k)',
    insight: 'Keep the k largest in a min-heap; its top is the kth largest.',
    signals: ['kth largest', 'without sorting'],
    narration: [
      'Clarify: kth largest in sorted order, duplicates count.',
      'Sorting is n log n; they ask to avoid it.',
      'Min-heap capped at k: pop when it exceeds k.',
      'Heap top is the answer.',
      'O(n log k) time, O(k) space; quickselect is O(n) average.',
    ],
    pitfalls: ['Min-heap, not max-heap, for k largest'],
    wrong: ['Sort descending · O(n log n)', 'Max-heap of all and pop k · O(n + k log n), more memory', 'Find max k times · O(n·k)'],
    solution: `import heapq

class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:

        heap = []

        for num in nums:
            heapq.heappush(heap, num)
            if len(heap) > k:
                heapq.heappop(heap)

        return heap[0]`,
  },
  {
    lc: 1502, title: 'Can Make Arithmetic Progression From Sequence', difficulty: 'Easy', skills: ['arrays-hashing'],
    pattern: 'Sort then check gaps', ds: ['array'],
    constraints: '2 ≤ n ≤ 1000',
    time: 'O(n log n)', space: 'O(1)',
    insight: 'Sorted, an arithmetic progression has one constant gap.',
    signals: ['rearrange', 'arithmetic progression'],
    narration: [
      'Sort, take the first gap.',
      'Every neighbor gap must match.',
      'O(n log n) time; O(n) is possible with min, max and a set.',
    ],
    pitfalls: ['Mention the O(n) set approach as a follow-up'],
    wrong: ['Try all permutations · O(n!)', 'Check only first and last · insufficient', 'Hashmap of gaps unsorted · meaningless'],
    solution: `class Solution:
    def canMakeArithmeticProgression(self, arr: List[int]) -> bool:

        arr.sort()
        diff = arr[1] - arr[0]

        for i in range(2, len(arr)):
            if arr[i] - arr[i - 1] != diff:
                return False

        return True`,
  },
  {
    lc: 25, title: 'Reverse Nodes in k-Group', difficulty: 'Hard', skills: ['linked-list'],
    pattern: 'Group reversal with dummy', ds: ['linked list'],
    constraints: '1 ≤ k ≤ n ≤ 5000, O(1) extra memory',
    time: 'O(n)', space: 'O(1)',
    insight: 'Find the kth node, reverse that block pointing at groupNext, reconnect.',
    signals: ['reverse k at a time', 'leftover stays', 'O(1) memory'],
    narration: [
      'Clarify: leftover < k stays in order.',
      'Dummy before head; groupPrev marks node before each block.',
      'Walk k steps to find kth; stop if fewer remain.',
      'Reverse the block with prev starting at groupNext.',
      'Link groupPrev to kth, move groupPrev to old first. O(n), O(1).',
    ],
    pitfalls: ['Save groupPrev.next before relinking', 'Do not reverse a short tail'],
    wrong: ['Copy values to array and rebuild · O(n) space', 'Stack of k nodes · O(k) space', 'Recursion per group · O(n/k) stack'],
    solution: `class Solution:
    def reverseKGroup(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:

        dummy = ListNode(0, head)
        groupPrev = dummy

        while True:
            kth = groupPrev
            for _ in range(k):
                kth = kth.next
                if not kth:
                    return dummy.next

            groupNext = kth.next
            prev, curr = groupNext, groupPrev.next

            while curr != groupNext:
                nxt = curr.next
                curr.next = prev
                prev = curr
                curr = nxt

            first = groupPrev.next
            groupPrev.next = kth
            groupPrev = first`,
  },
  {
    lc: 143, title: 'Reorder List', difficulty: 'Medium', skills: ['linked-list', 'two-pointers'],
    pattern: 'Middle + reverse + merge', ds: ['linked list'],
    constraints: '1 ≤ n ≤ 5·10^4, in place',
    time: 'O(n)', space: 'O(1)',
    insight: 'Split at the middle, reverse the back half, then weave the two halves.',
    signals: ['L0 → Ln → L1 → Ln-1', 'in place'],
    narration: [
      'Clarify: change links, not values.',
      'Slow/fast pointers find the middle.',
      'Reverse the second half.',
      'Alternate nodes from the front and reversed back.',
      'O(n) time, O(1) space.',
    ],
    pitfalls: ['Cut slow.next = None to end the first half'],
    wrong: ['Copy nodes to array and relink · O(n) space', 'Find tail each time · O(n^2)', 'Stack of second half · O(n) space'],
    solution: `class Solution:
    def reorderList(self, head: Optional[ListNode]) -> None:

        slow, fast = head, head.next
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next

        second = slow.next
        slow.next = None
        prev = None
        while second:
            nxt = second.next
            second.next = prev
            prev = second
            second = nxt

        first, second = head, prev
        while second:
            nxt1, nxt2 = first.next, second.next
            first.next = second
            second.next = nxt1
            first, second = nxt1, nxt2`,
  },
  {
    lc: 27, title: 'Remove Element', difficulty: 'Easy', skills: ['two-pointers'],
    pattern: 'Read/write pointers', ds: ['array'],
    constraints: '0 ≤ n ≤ 100, in place',
    time: 'O(n)', space: 'O(1)',
    insight: 'Copy every non-val forward; write index is the new length.',
    signals: ['remove in place', 'return k'],
    narration: [
      'Write pointer for kept values.',
      'Copy each element not equal to val.',
      'Return write. O(n) time, O(1) space.',
    ],
    pitfalls: ['Order beyond k does not matter'],
    wrong: ['nums.remove in a loop · O(n^2)', 'New filtered list · O(n) space', 'Sort first · O(n log n)'],
    solution: `class Solution:
    def removeElement(self, nums: List[int], val: int) -> int:

        write = 0

        for num in nums:
            if num != val:
                nums[write] = num
                write += 1

        return write`,
  },
  {
    lc: 1480, title: 'Running Sum of 1d Array', difficulty: 'Easy', skills: ['prefix-sum'],
    pattern: 'Prefix sum', ds: ['array'],
    constraints: '1 ≤ n ≤ 1000',
    time: 'O(n)', space: 'O(n) output',
    insight: 'Each output is the previous output plus the current value.',
    signals: ['running sum', 'sum(nums[0..i])'],
    narration: [
      'Keep a running total.',
      'Append it at each index.',
      'O(n) time, output is O(n).',
    ],
    pitfalls: ['Avoid recomputing sum(nums[:i]) each time (O(n^2))'],
    wrong: ['sum(nums[:i + 1]) each index · O(n^2)', 'Sort · wrong answer', 'Recursion · O(n) stack'],
    solution: `class Solution:
    def runningSum(self, nums: List[int]) -> List[int]:

        result = []
        total = 0

        for num in nums:
            total += num
            result.append(total)

        return result`,
  },
  {
    lc: 115, title: 'Distinct Subsequences', difficulty: 'Hard', skills: ['dp-2d', 'constraints'],
    pattern: '2-D DP over (s, t) prefixes', ds: ['dp table'],
    constraints: '1 ≤ len(s), len(t) ≤ 1000',
    time: 'O(m·n)', space: 'O(n)',
    insight: 'dp[j] = ways to form t[:j]; matching char adds dp[j-1]. Iterate j backward.',
    signals: ['number of distinct subsequences', 'equals t', 'lengths ≤ 1000'],
    narration: [
      'Clarify: count ways s has t as a subsequence.',
      '1000 × 1000 means O(m·n) DP.',
      'dp[j] counts ways to build t[:j]; dp[0] = 1.',
      'For each char of s, if t[j-1] matches, dp[j] += dp[j-1].',
      'Go j backward so each s char is used once. O(m·n) time, O(n) space.',
    ],
    pitfalls: ['Iterate j backward for 1-D space', 'Empty t has 1 way'],
    wrong: ['Enumerate subsequences · O(2^m)', 'Two pointers greedy · counts at most 1', 'Sliding window · not contiguous'],
    solution: `class Solution:
    def numDistinct(self, s: str, t: str) -> int:

        n = len(t)
        dp = [1] + [0] * n

        for char in s:
            for j in range(n, 0, -1):
                if t[j - 1] == char:
                    dp[j] += dp[j - 1]

        return dp[n]`,
  },
  {
    lc: 392, title: 'Is Subsequence', difficulty: 'Easy', skills: ['two-pointers'],
    pattern: 'Two pointers greedy match', ds: [],
    constraints: 's ≤ 100, t ≤ 10^4',
    time: 'O(len(t))', space: 'O(1)',
    insight: 'Match s greedily left to right while scanning t.',
    signals: ['subsequence', 'order kept'],
    narration: [
      'Pointer i into s, scan t.',
      'Advance i when characters match.',
      'True if i reaches len(s). O(len t) time, O(1) space.',
      'Many queries follow-up: index lists + binary search.',
    ],
    pitfalls: ['Empty s is always True'],
    wrong: ['Generate all subsequences of t · O(2^n)', 'LCS DP · O(m·n)', 'Set membership · ignores order'],
    solution: `class Solution:
    def isSubsequence(self, s: str, t: str) -> bool:

        i = 0

        for char in t:
            if i < len(s) and s[i] == char:
                i += 1

        return i == len(s)`,
  },
  {
    lc: 940, title: 'Distinct Subsequences II', difficulty: 'Hard', skills: ['dp-1d'],
    pattern: 'DP by last character', ds: ['array'],
    constraints: '1 ≤ n ≤ 2000, lowercase, answer mod 10^9+7',
    time: 'O(26·n)', space: 'O(26)',
    insight: 'Subsequences ending in c = all distinct subsequences so far + 1, replacing old count for c.',
    signals: ['distinct non-empty subsequences', 'modulo'],
    narration: [
      'Clarify: non-empty, distinct, return mod 10^9 + 7.',
      'Group subsequences by their last character.',
      'Appending c to every existing one, plus "c" itself, gives all ending in c.',
      'Overwrite, not add, so duplicates are not double counted.',
      'O(26·n) time, O(26) space.',
    ],
    pitfalls: ['Overwrite endsWith[c], do not add', 'Apply mod'],
    wrong: ['Set of all subsequences · O(2^n)', 'Distinct Subsequences I DP · different problem', '2-D DP over pairs · O(n^2)'],
    solution: `class Solution:
    def distinctSubseqII(self, s: str) -> int:

        mod = 10**9 + 7
        endsWith = [0] * 26

        for char in s:
            endsWith[ord(char) - ord('a')] = (sum(endsWith) + 1) % mod

        return sum(endsWith) % mod`,
  },
  {
    lc: 74, title: 'Search a 2D Matrix', difficulty: 'Medium', skills: ['binary-search'],
    pattern: 'Binary search on flattened index', ds: ['matrix'],
    constraints: 'm, n ≤ 100, rows sorted and chained',
    time: 'O(log(m·n))', space: 'O(1)',
    insight: 'The matrix is one sorted array; index k maps to (k // cols, k % cols).',
    signals: ['sorted rows', 'first of row > last of previous'],
    narration: [
      'Clarify: each row starts after the previous ends.',
      'So it is a sorted array of length m·n.',
      'Binary search k, map to row k // cols, col k % cols.',
      'O(log(m·n)) time, O(1) space.',
    ],
    pitfalls: ['Divide by cols, not rows'],
    wrong: ['Scan every cell · O(m·n)', 'Staircase from top-right · O(m + n)', 'Binary search each row · O(m log n)'],
    solution: `class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:

        rows, cols = len(matrix), len(matrix[0])
        left, right = 0, rows * cols - 1

        while left <= right:
            mid = (left + right) // 2
            value = matrix[mid // cols][mid % cols]
            if value == target:
                return True
            if value < target:
                left = mid + 1
            else:
                right = mid - 1

        return False`,
  },
  {
    lc: 102, title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', skills: ['tree-bfs', 'queue-deque', 'communication'],
    pattern: 'BFS level by level', ds: ['queue'],
    constraints: '0 ≤ nodes ≤ 2000',
    time: 'O(n)', space: 'O(n)',
    insight: 'Freeze len(queue) at the start of each level to know where it ends.',
    signals: ['level by level', 'left to right'],
    narration: [
      'Clarify: empty tree returns [].',
      'Levels mean BFS with a deque.',
      'Snapshot the queue size, pop that many, push children.',
      'Each node enqueued once: O(n) time, O(width) ≤ O(n) space.',
    ],
    pitfalls: ['Use len(queue) before the inner loop'],
    wrong: ['DFS without depth param · loses levels', 'Stack-based traversal · wrong order', 'Sort nodes by value · not levels'],
    solution: `from collections import deque

class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:

        if not root:
            return []

        result = []
        queue = deque([root])

        while queue:
            level = []
            for _ in range(len(queue)):
                node = queue.popleft()
                level.append(node.val)
                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)
            result.append(level)

        return result`,
  },
  {
    lc: 210, title: 'Course Schedule II', difficulty: 'Medium', skills: ['topo-sort', 'graph-modeling', 'graph-bfs'],
    pattern: "Kahn's topological sort", ds: ['adjacency list', 'queue'],
    constraints: 'n ≤ 2000, edges ≤ n(n-1), pairs distinct',
    time: 'O(V + E)', space: 'O(V + E)',
    insight: 'Take courses with no remaining prerequisites; a cycle leaves some never ready.',
    signals: ['prerequisites', 'order to finish', 'return [] if impossible'],
    narration: [
      'Clarify: [a, b] means b before a; return [] on a cycle.',
      'Courses are nodes, prereq → course are directed edges.',
      'Indegree counts unmet prereqs; queue all zeros.',
      'Pop, append to order, decrement neighbors, enqueue new zeros.',
      'If order has all n, valid. O(V + E) time and space.',
    ],
    pitfalls: ['Edge direction prereq → course', 'Cycle check by length'],
    wrong: ['Try all permutations · O(n!)', 'Plain DFS without cycle states · misses cycles', 'Dijkstra · no weights'],
    solution: `from collections import deque

class Solution:
    def findOrder(self, numCourses: int, prerequisites: List[List[int]]) -> List[int]:

        graph = {i: [] for i in range(numCourses)}
        indegree = [0] * numCourses

        for course, prereq in prerequisites:
            graph[prereq].append(course)
            indegree[course] += 1

        queue = deque([i for i in range(numCourses) if indegree[i] == 0])
        result = []

        while queue:
            node = queue.popleft()
            result.append(node)
            for nei in graph[node]:
                indegree[nei] -= 1
                if indegree[nei] == 0:
                    queue.append(nei)

        return result if len(result) == numCourses else []`,
  },
  {
    lc: 213, title: 'House Robber II', difficulty: 'Medium', skills: ['dp-1d'],
    pattern: 'Linear DP twice (break the circle)', ds: [],
    constraints: '1 ≤ n ≤ 100, houses in a circle',
    time: 'O(n)', space: 'O(1)',
    insight: 'First and last cannot both be robbed: solve without first, without last, take max.',
    signals: ['circle', 'adjacent cannot both', 'maximize'],
    narration: [
      'Clarify: circular street, n can be 1.',
      'House Robber I: best = max(skip, prev2 + money).',
      'Circle means exclude first or exclude last.',
      'Run linear twice, take the max.',
      'O(n) time, O(1) space.',
    ],
    pitfalls: ['n = 1 returns nums[0]'],
    wrong: ['Try all subsets · O(2^n)', 'Greedy every other house · wrong', 'Single linear pass · ignores circle'],
    solution: `class Solution:
    def rob(self, nums: List[int]) -> int:

        def robLine(houses):
            prev, curr = 0, 0
            for money in houses:
                prev, curr = curr, max(curr, prev + money)
            return curr

        if len(nums) == 1:
            return nums[0]

        return max(robLine(nums[:-1]), robLine(nums[1:]))`,
  },
  {
    lc: 6, title: 'Zigzag Conversion', difficulty: 'Medium', skills: ['math'],
    pattern: 'Simulate row bouncing', ds: ['array'],
    constraints: '1 ≤ len ≤ 1000, 1 ≤ numRows ≤ 1000',
    time: 'O(n)', space: 'O(n)',
    insight: 'Walk rows 0 → numRows-1 → 0, appending each char to its row.',
    signals: ['zigzag', 'read line by line'],
    narration: [
      'Clarify: numRows = 1 returns s.',
      'Keep one string per row.',
      'Bounce direction at top and bottom rows.',
      'Join rows. O(n) time and space.',
    ],
    pitfalls: ['numRows = 1 infinite bounce'],
    wrong: ['Build full 2-D grid · O(n·numRows)', 'Sort chars by row formula · O(n log n)', 'Recursion per row · unnecessary'],
    solution: `class Solution:
    def convert(self, s: str, numRows: int) -> str:

        if numRows == 1:
            return s

        rows = [''] * numRows
        row, step = 0, 1

        for char in s:
            rows[row] += char
            if row == 0:
                step = 1
            elif row == numRows - 1:
                step = -1
            row += step

        return ''.join(rows)`,
  },
  {
    lc: 19, title: 'Remove Nth Node From End of List', difficulty: 'Medium', skills: ['linked-list', 'two-pointers'],
    pattern: 'Gap-n two pointers', ds: ['linked list'],
    constraints: '1 ≤ sz ≤ 30, n ≤ sz, one pass',
    time: 'O(L)', space: 'O(1)',
    insight: 'Lead pointer n ahead; when it hits the end, trailer is before the target.',
    signals: ['nth from end', 'one pass'],
    narration: [
      'Clarify: n is valid, head may be removed.',
      'Dummy before head handles removing the head.',
      'Move right n steps, then both until right is None.',
      'left.next is the node to drop.',
      'O(L) time, O(1) space.',
    ],
    pitfalls: ['Removing the head needs the dummy'],
    wrong: ['Count length then walk again · two passes', 'Store nodes in array · O(L) space', 'Reverse, remove, reverse · three passes'],
    solution: `class Solution:
    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:

        dummy = ListNode(0, head)
        left, right = dummy, head

        for _ in range(n):
            right = right.next

        while right:
            left = left.next
            right = right.next

        left.next = left.next.next
        return dummy.next`,
  },
  {
    lc: 1944, title: 'Number of Visible People in a Queue', difficulty: 'Hard', skills: ['monotonic-stack', 'constraints'],
    pattern: 'Monotonic stack from the right', ds: ['stack'],
    constraints: '1 ≤ n ≤ 10^5, distinct heights',
    time: 'O(n)', space: 'O(n)',
    insight: 'Person i sees everyone shorter it pops, plus the first taller one left on the stack.',
    signals: ['can see to the right', 'everyone in between shorter', 'n ≤ 10^5'],
    narration: [
      'Clarify: distinct heights, look to the right.',
      'n is 10^5 so O(n^2) scanning is out.',
      'Go right to left with a decreasing stack.',
      'Pop shorter people, each is visible; count them.',
      'If the stack is non-empty, that taller one is visible too. O(n).',
    ],
    pitfalls: ['Add 1 for the blocker still on the stack'],
    wrong: ['Scan right for each person · O(n^2)', 'Sort heights · loses positions', 'Segment tree max queries · O(n log n), overkill'],
    solution: `class Solution:
    def canSeePersonsCount(self, heights: List[int]) -> List[int]:

        result = [0] * len(heights)
        stack = []

        for i in range(len(heights) - 1, -1, -1):
            count = 0
            while stack and stack[-1] < heights[i]:
                stack.pop()
                count += 1
            if stack:
                count += 1
            result[i] = count
            stack.append(heights[i])

        return result`,
  },
  {
    lc: 239, title: 'Sliding Window Maximum', difficulty: 'Hard', skills: ['queue-deque', 'sliding-window', 'ds-diagnosis'],
    pattern: 'Monotonic deque of indices', ds: ['deque'],
    constraints: '1 ≤ n ≤ 10^5, 1 ≤ k ≤ n',
    time: 'O(n)', space: 'O(k)',
    insight: 'Drop smaller values from the back; they can never be a max again.',
    signals: ['window of size k', 'max of each window'],
    narration: [
      'Clarify: output n - k + 1 maxes.',
      'n·k brute force is 10^10, too slow.',
      'Deque keeps indices with decreasing values.',
      'Pop back while smaller, pop front if out of window.',
      'Front is the max. Each index in/out once: O(n), O(k) space.',
    ],
    pitfalls: ['Store indices to detect expiry', 'Start output at right ≥ k - 1'],
    wrong: ['max() of each window · O(n·k)', 'Max-heap with lazy deletion · O(n log n)', 'Sort each window · O(n·k log k)'],
    solution: `from collections import deque

class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:

        queue = deque()
        result = []

        for right, num in enumerate(nums):
            while queue and nums[queue[-1]] <= num:
                queue.pop()
            queue.append(right)
            if queue[0] <= right - k:
                queue.popleft()
            if right >= k - 1:
                result.append(nums[queue[0]])

        return result`,
  },
  {
    lc: 387, title: 'First Unique Character in a String', difficulty: 'Easy', skills: ['arrays-hashing'],
    pattern: 'Count then scan', ds: ['hashmap'],
    constraints: '1 ≤ n ≤ 10^5, lowercase',
    time: 'O(n)', space: 'O(1) (26 letters)',
    insight: 'Two passes: count everything, then find the first count of 1.',
    signals: ['first non-repeating', 'index'],
    narration: [
      'Count characters with Counter.',
      'Second pass returns the first index with count 1.',
      'O(n) time, O(26) space.',
    ],
    pitfalls: ['Return -1 if none'],
    wrong: ['s.count for each char · O(n^2)', 'Sort characters · loses index', 'Set of seen only · cannot tell later repeats'],
    solution: `from collections import Counter

class Solution:
    def firstUniqChar(self, s: str) -> int:

        count = Counter(s)

        for i, char in enumerate(s):
            if count[char] == 1:
                return i

        return -1`,
  },
  {
    lc: 67, title: 'Add Binary', difficulty: 'Easy', skills: ['bit', 'math'],
    pattern: 'Right-to-left add with carry', ds: [],
    constraints: '1 ≤ len ≤ 10^4, no leading zeros',
    time: 'O(max(m, n))', space: 'O(max(m, n))',
    insight: 'Same as decimal addition but divmod by 2.',
    signals: ['binary strings', 'sum'],
    narration: [
      'Two pointers from the ends, carry starts 0.',
      'Add bits plus carry, divmod by 2.',
      'Collect bits, reverse at the end.',
      'O(max(m, n)) time and space.',
    ],
    pitfalls: ['Final carry', 'Build list then join, not string +='],
    wrong: ['int(a, 2) + int(b, 2) · fine in Python, not what they test', 'Pad and recurse · O(n) stack', 'Convert to decimal by hand · overflow elsewhere'],
    solution: `class Solution:
    def addBinary(self, a: str, b: str) -> str:

        i, j = len(a) - 1, len(b) - 1
        carry = 0
        result = []

        while i >= 0 or j >= 0 or carry:
            total = carry
            if i >= 0:
                total += int(a[i])
                i -= 1
            if j >= 0:
                total += int(b[j])
                j -= 1
            carry, bit = divmod(total, 2)
            result.append(str(bit))

        return ''.join(reversed(result))`,
  },
  {
    lc: 205, title: 'Isomorphic Strings', difficulty: 'Easy', skills: ['arrays-hashing'],
    pattern: 'Two-way character mapping', ds: ['hashmap'],
    constraints: '1 ≤ len ≤ 5·10^4, same length',
    time: 'O(n)', space: 'O(charset)',
    insight: 'Mapping must be a bijection, so check both s→t and t→s.',
    signals: ['replace characters', 'one-to-one', 'preserve order'],
    narration: [
      'Clarify: no two chars map to the same char.',
      'Keep maps in both directions.',
      'Any conflict returns False.',
      'O(n) time, O(charset) space.',
    ],
    pitfalls: ['One map alone misses "ab" vs "aa"'],
    wrong: ['Single map s→t · misses collisions', 'Compare sorted counts · ignores order', 'Try all mappings · exponential'],
    solution: `class Solution:
    def isIsomorphic(self, s: str, t: str) -> bool:

        sToT, tToS = {}, {}

        for a, b in zip(s, t):
            if sToT.get(a, b) != b or tToS.get(b, a) != a:
                return False
            sToT[a] = b
            tToS[b] = a

        return True`,
  },
]

const problemId = item => `google-a:lc${item.lc}`

const problems = bank.map(({ wrong, ...item }) => ({
  id: problemId(item),
  lc: item.lc,
  title: item.title,
  difficulty: item.difficulty,
  companies: companiesFor(item),
  skills: item.skills,
  pattern: item.pattern,
  ds: item.ds,
  constraints: item.constraints,
  time: item.time,
  space: item.space,
  insight: item.insight,
  signals: item.signals,
  narration: item.narration,
  pitfalls: item.pitfalls,
  solution: item.solution,
}))

const difficultyLevel = { Easy: 1, Medium: 2, Hard: 3 }

const mcqs = bank.map(item => {
  const correct = `${item.pattern} · ${item.time}`
  const answer = item.lc % 4
  const choices = [...item.wrong]
  choices.splice(answer, 0, correct)
  return {
    id: `google-a:mcq:lc${item.lc}`,
    skills: [...new Set([...item.skills, 'constraints'])],
    difficulty: difficultyLevel[item.difficulty],
    q: `${item.title}. Given ${item.constraints}, which approach fits?`,
    choices,
    answer,
    why: `${item.insight} ${item.time} time, ${item.space} space.`,
  }
})

const flashcards = bank.map(item => ({
  id: `google-a:card:lc${item.lc}`,
  skills: item.skills,
  front: `LC ${item.lc} ${item.title} (${item.constraints})`,
  back: `${item.pattern}. ${item.insight} ${item.time} time, ${item.space} space.`,
}))

const usedSkills = [...new Set([...bank.flatMap(item => item.skills), 'constraints'])]

export default {
  id: 'google-a',
  title: 'Interview list',
  icon: 'search',
  skills: usedSkills,
  lessons: [],
  traces: [],
  flashcards,
  mcqs,
  clozes: [],
  parsons: [],
  problems,
}
