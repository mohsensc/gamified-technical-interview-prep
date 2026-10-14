const arraysHashingClozes = [
  {
    skills: ['arrays-hashing'], title: 'Contains Duplicate',
    code: `class Solution:
    def containsDuplicate(self, nums: List[int]) -> bool:
        seen = [[set()]]
        for num in nums:
            if num in seen:
                return [[True]]
            seen.add(num)
        return False`,
  },
  {
    skills: ['arrays-hashing'], title: 'Group Anagrams by letter-count key',
    code: `from collections import defaultdict

class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        groups = defaultdict(list)
        for word in strs:
            count = [0] * 26
            for ch in word:
                count[[[ord(ch) - ord('a')]]] += 1
            groups[[[tuple(count)]]].append(word)
        return list(groups.values())`,
    hint: 'Map each letter to an index 0-25, then key by the full count vector.',
  },
  {
    skills: ['arrays-hashing', 'heap'], title: 'Top K Frequent — bucket sort',
    code: `from collections import Counter

class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        count = Counter(nums)
        buckets = [[] for _ in range(len(nums) + 1)]
        for num, freq in count.items():
            buckets[[[freq]]].append(num)

        result = []
        for freq in range(len(buckets) - 1, 0, -1):
            for num in buckets[freq]:
                result.append(num)
                if len(result) == [[k]]:
                    return result
        return result`,
    hint: 'Bucket index is the frequency itself; walk buckets from high to low.',
  },
  {
    skills: ['arrays-hashing', 'bit'], title: 'Single Number — XOR cancels pairs',
    code: `class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        result = 0
        for num in nums:
            result [[^=]] num
        return result`,
  },
  {
    skills: ['arrays-hashing'], title: 'Majority Element — Boyer-Moore voting',
    code: `class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        count = 0
        candidate = None
        for num in nums:
            if count == 0:
                candidate = num
            count += [[1 if num == candidate else -1]]
        return candidate`,
    hint: 'A match grows the count, a mismatch shrinks it.',
  },
  {
    skills: ['arrays-hashing', 'prefix-sum'], title: 'Max length subarray, equal 0s and 1s',
    code: `class Solution:
    def findMaxLength(self, nums: List[int]) -> int:
        seen = {0: -1}
        total = 0
        longest = 0
        for i, num in enumerate(nums):
            total += [[1 if num == 1 else -1]]
            if total in seen:
                longest = max(longest, i - [[seen[total]]])
            else:
                seen[total] = i
        return longest`,
    hint: 'Treat 0 as -1, so "equal counts" becomes "sum to zero".',
  },
]

const twoPointersClozes = [
  {
    skills: ['two-pointers'], title: 'Valid Palindrome — filtered two pointers',
    code: `class Solution:
    def isPalindrome(self, s: str) -> bool:
        filtered = [c.lower() for c in s if c.isalnum()]
        left, right = 0, [[len(filtered) - 1]]

        while left < right:
            if filtered[left] != filtered[right]:
                return [[False]]
            left += 1
            right -= 1

        return True`,
  },
  {
    skills: ['two-pointers'], title: 'Move Zeroes',
    code: `class Solution:
    def moveZeroes(self, nums: List[int]) -> None:
        slow = 0
        for fast in range(len(nums)):
            if nums[fast] != 0:
                nums[slow], nums[fast] = [[nums[fast], nums[slow]]]
                slow += 1`,
  },
  {
    skills: ['two-pointers'], title: 'Sort Colors — Dutch flag',
    code: `class Solution:
    def sortColors(self, nums: List[int]) -> None:
        low, mid, high = 0, 0, len(nums) - 1

        while mid <= high:
            if nums[mid] == 0:
                nums[low], nums[mid] = nums[mid], nums[low]
                low += 1
                mid += 1
            elif nums[mid] == 1:
                mid += [[1]]
            else:
                nums[mid], nums[high] = nums[high], nums[mid]
                high -= [[1]]`,
  },
  {
    skills: ['two-pointers', 'linked-list'], title: "Linked List Cycle — Floyd's",
    code: `class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        slow = fast = head

        while fast and fast.next:
            slow = slow.next
            fast = [[fast.next.next]]
            if slow is fast:
                return True

        return [[False]]`,
  },
  {
    skills: ['two-pointers'], title: 'Merge Sorted Array — from the back',
    code: `class Solution:
    def merge(self, nums1: List[int], m: int, nums2: List[int], n: int) -> None:
        i, j, k = m - 1, n - 1, m + n - 1

        while j >= 0:
            if i >= 0 and nums1[i] > nums2[j]:
                nums1[k] = [[nums1[i]]]
                i -= 1
            else:
                nums1[k] = nums2[j]
                j -= [[1]]
            k -= 1`,
    hint: 'Place the larger of the two tails first, writing from the last slot backward.',
  },
  {
    skills: ['two-pointers'], title: 'Is Subsequence',
    code: `class Solution:
    def isSubsequence(self, s: str, t: str) -> bool:
        i = 0
        for ch in t:
            if i < len(s) and s[i] == ch:
                i += [[1]]
        return i == [[len(s)]]`,
  },
]

const slidingWindowClozes = [
  {
    skills: ['sliding-window'], title: 'Max Sum Subarray of size k',
    code: `def maxSumSubarray(nums: List[int], k: int) -> int:
    total = sum(nums[:k])
    best = total

    for i in range(k, len(nums)):
        total += nums[i] - [[nums[i - k]]]
        best = [[max(best, total)]]

    return best`,
  },
  {
    skills: ['sliding-window'], title: 'Minimum Size Subarray Sum',
    code: `class Solution:
    def minSubArrayLen(self, target: int, nums: List[int]) -> int:
        left = 0
        total = 0
        best = float('inf')

        for right in range(len(nums)):
            total += nums[right]
            while total >= target:
                best = min(best, right - left + [[1]])
                total -= [[nums[left]]]
                left += 1

        return best if best != float('inf') else 0`,
  },
  {
    skills: ['sliding-window', 'arrays-hashing'], title: 'Permutation in String',
    code: `from collections import Counter

class Solution:
    def checkInclusion(self, s1: str, s2: str) -> bool:
        need = Counter(s1)
        window = Counter()

        for i, ch in enumerate(s2):
            window[ch] += 1
            if i >= len(s1):
                left = s2[i - len(s1)]
                window[left] -= 1
                if window[left] == 0:
                    del window[left]
            if window == [[need]]:
                return True

        return [[False]]`,
  },
  {
    skills: ['sliding-window', 'monotonic-stack'], title: 'Sliding Window Maximum',
    code: `from collections import deque

class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:
        dq = deque()
        result = []

        for i, num in enumerate(nums):
            while dq and nums[dq[-1]] < num:
                dq.pop()
            dq.append(i)

            if dq[0] == [[i - k]]:
                dq.popleft()
            if i >= k - 1:
                result.append(nums[[[dq[0]]]])

        return result`,
    hint: 'The deque stores indices in decreasing value order; the front is always the window max.',
  },
  {
    skills: ['sliding-window'], title: 'Longest Repeating Character Replacement',
    code: `class Solution:
    def characterReplacement(self, s: str, k: int) -> int:
        count = {}
        left = maxFreq = longest = 0

        for right in range(len(s)):
            count[s[right]] = count.get(s[right], 0) + 1
            maxFreq = max(maxFreq, count[s[right]])

            while (right - left + 1) - maxFreq > [[k]]:
                count[s[left]] -= 1
                left += [[1]]

            longest = max(longest, right - left + 1)

        return longest`,
  },
  {
    skills: ['sliding-window'], title: 'Longest Substring with At Most K Distinct',
    code: `class Solution:
    def lengthOfLongestSubstringKDistinct(self, s: str, k: int) -> int:
        count = {}
        left = 0
        longest = 0

        for right in range(len(s)):
            count[s[right]] = count.get(s[right], 0) + 1

            while len(count) > [[k]]:
                count[s[left]] -= 1
                if count[s[left]] == 0:
                    del count[[[s[left]]]]
                left += 1

            longest = max(longest, right - left + 1)

        return longest`,
  },
]

const prefixSumClozes = [
  {
    skills: ['prefix-sum'], title: 'Range Sum Query — Immutable',
    code: `class NumArray:
    def __init__(self, nums: List[int]):
        self.prefix = [0]
        for num in nums:
            self.prefix.append(self.prefix[-1] + [[num]])

    def sumRange(self, left: int, right: int) -> int:
        return self.prefix[[[right + 1]]] - self.prefix[left]`,
  },
  {
    skills: ['prefix-sum'], title: 'Product of Array Except Self',
    code: `class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        n = len(nums)
        output = [1] * n

        for i in range(1, n):
            output[i] = output[i - 1] * [[nums[i - 1]]]

        suffix = 1
        for i in range(n - 2, -1, -1):
            suffix *= nums[i + 1]
            output[i] [[*=]] suffix

        return output`,
  },
  {
    skills: ['prefix-sum'], title: 'Continuous Subarray Sum divisible by k',
    code: `class Solution:
    def checkSubarraySum(self, nums: List[int], k: int) -> bool:
        seen = {0: -1}
        prefix = 0

        for i, num in enumerate(nums):
            prefix = (prefix + num) % [[k]]
            if prefix in seen:
                if i - seen[prefix] [[>= 2]]:
                    return True
            else:
                seen[prefix] = i

        return False`,
    hint: 'Two equal remainders need to be at least 2 apart to form a real subarray.',
  },
  {
    skills: ['prefix-sum'], title: 'Running Sum of 1D Array',
    code: `class Solution:
    def runningSum(self, nums: List[int]) -> List[int]:
        for i in range(1, len(nums)):
            nums[i] += [[nums[i - 1]]]
        return nums`,
  },
  {
    skills: ['prefix-sum', 'grid'], title: 'Range Sum Query 2D — Immutable',
    code: `class NumMatrix:
    def __init__(self, matrix: List[List[int]]):
        rows, cols = len(matrix), len(matrix[0])
        self.prefix = [[0] * (cols + 1) for _ in range(rows + 1)]

        for r in range(rows):
            for c in range(cols):
                self.prefix[r + 1][c + 1] = (self.prefix[r][c + 1] + self.prefix[r + 1][c]
                                              - self.prefix[r][c] + [[matrix[r][c]]])

    def sumRegion(self, row1: int, col1: int, row2: int, col2: int) -> int:
        return (self.prefix[row2 + 1][col2 + 1] - self.prefix[row1][col2 + 1]
                - self.prefix[row2 + 1][col1] + [[self.prefix[row1][col1]]])`,
    hint: 'Inclusion-exclusion over the four corner prefix sums.',
  },
  {
    skills: ['prefix-sum'], title: 'Find Pivot Index',
    code: `class Solution:
    def pivotIndex(self, nums: List[int]) -> int:
        total = sum(nums)
        leftSum = 0

        for i, num in enumerate(nums):
            if leftSum == [[total - leftSum - num]]:
                return i
            leftSum += num

        return -1`,
    hint: 'rightSum = total - leftSum - current.',
  },
]

const binarySearchClozes = [
  {
    skills: ['binary-search'], title: 'bisect_left, implemented by hand',
    code: `def bisectLeft(nums: List[int], target: int) -> int:
    left, right = 0, len(nums)

    while left < right:
        mid = (left + right) // 2
        if nums[mid] < target:
            left = [[mid + 1]]
        else:
            right = [[mid]]

    return left`,
  },
  {
    skills: ['binary-search'], title: 'Find Minimum in Rotated Sorted Array',
    code: `class Solution:
    def findMin(self, nums: List[int]) -> int:
        left, right = 0, len(nums) - 1

        while left < right:
            mid = (left + right) // 2
            if nums[mid] > nums[right]:
                left = [[mid + 1]]
            else:
                right = [[mid]]

        return nums[left]`,
  },
  {
    skills: ['binary-search'], title: 'Capacity To Ship Packages Within D Days',
    code: `class Solution:
    def shipWithinDays(self, weights: List[int], days: int) -> int:
        left, right = max(weights), [[sum(weights)]]

        while left < right:
            mid = (left + right) // 2
            needed, load = 1, 0
            for w in weights:
                if load + w > mid:
                    needed += 1
                    load = 0
                load += w
            if needed [[<= days]]:
                right = mid
            else:
                left = mid + 1

        return left`,
    hint: 'Lower bound must fit the heaviest package; upper bound ships everything in one day.',
  },
  {
    skills: ['binary-search', 'grid'], title: 'Search a 2D Matrix — flattened',
    code: `class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        rows, cols = len(matrix), len(matrix[0])
        left, right = 0, rows * cols - 1

        while left <= right:
            mid = (left + right) // 2
            value = matrix[mid // cols][mid % cols]
            if value == target:
                return True
            elif value < target:
                left = [[mid + 1]]
            else:
                right = [[mid - 1]]

        return False`,
  },
  {
    skills: ['binary-search'], title: 'Find Peak Element',
    code: `class Solution:
    def findPeakElement(self, nums: List[int]) -> int:
        left, right = 0, len(nums) - 1

        while left < right:
            mid = (left + right) // 2
            if nums[mid] < nums[mid + 1]:
                left = [[mid + 1]]
            else:
                right = [[mid]]

        return left`,
  },
  {
    skills: ['binary-search'], title: 'Find First and Last Position',
    code: `from bisect import bisect_left, bisect_right

class Solution:
    def searchRange(self, nums: List[int], target: int) -> List[int]:
        left = bisect_left(nums, target)
        right = [[bisect_right(nums, target)]]

        if left == right:
            return [-1, -1]

        return [[[left, right - 1]]]`,
  },
]

const stringsClozes = [
  {
    skills: ['arrays-hashing'], title: 'Valid Anagram',
    code: `from collections import Counter

class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        if len(s) != len(t):
            return [[False]]
        return Counter(s) == [[Counter(t)]]`,
  },
  {
    skills: ['stack'], title: 'Valid Parentheses',
    code: `class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        pairs = {')': '(', ']': '[', '}': '{'}

        for ch in s:
            if ch in pairs:
                if not stack or stack[-1] != pairs[ch]:
                    return False
                stack.pop()
            else:
                stack.append(ch)

        return [[not stack]]`,
  },
  {
    skills: ['two-pointers'], title: 'Longest Palindromic Substring — expand around center',
    code: `class Solution:
    def longestPalindrome(self, s: str) -> str:
        def expand(left, right):
            while left >= 0 and right < len(s) and s[left] == s[right]:
                left -= 1
                right += 1
            return s[left + 1:right]

        longest = ""
        for i in range(len(s)):
            odd = expand(i, i)
            even = expand(i, [[i + 1]])
            longest = max(longest, odd, even, key=[[len]])

        return longest`,
  },
  {
    skills: ['stack'], title: 'Decode String',
    code: `class Solution:
    def decodeString(self, s: str) -> str:
        stack = []
        current = ""
        num = 0

        for ch in s:
            if ch.isdigit():
                num = num * 10 + int(ch)
            elif ch == '[':
                stack.append((current, num))
                current = ""
                num = 0
            elif ch == ']':
                prevString, repeatCount = stack.pop()
                current = prevString + current * [[repeatCount]]
            else:
                current += ch

        return current`,
  },
  {
    skills: ['arrays-hashing'], title: 'Roman to Integer',
    code: `class Solution:
    def romanToInt(self, s: str) -> int:
        values = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000}
        total = 0

        for i in range(len(s)):
            if i + 1 < len(s) and values[s[i]] < values[s[i + 1]]:
                total -= [[values[s[i]]]]
            else:
                total += values[s[i]]

        return total`,
  },
  {
    skills: ['arrays-hashing'], title: 'Reverse Words in a String',
    code: `class Solution:
    def reverseWords(self, s: str) -> str:
        words = [[s.split()]]
        return ' '.join([[reversed(words)]])`,
  },
]

const intervalsClozes = [
  {
    skills: ['intervals'], title: 'Merge Intervals',
    code: `class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        intervals.sort(key=lambda pair: [[pair[0]]])
        merged = [intervals[0]]

        for start, end in intervals[1:]:
            if start <= merged[-1][1]:
                merged[-1][1] = max(merged[-1][1], [[end]])
            else:
                merged.append([start, end])

        return merged`,
  },
  {
    skills: ['intervals'], title: 'Insert Interval',
    code: `class Solution:
    def insert(self, intervals: List[List[int]], newInterval: List[int]) -> List[List[int]]:
        result = []
        i, n = 0, len(intervals)

        while i < n and intervals[i][1] < newInterval[0]:
            result.append(intervals[i])
            i += 1

        while i < n and intervals[i][0] <= newInterval[1]:
            newInterval[0] = min(newInterval[0], intervals[i][0])
            newInterval[1] = [[max(newInterval[1], intervals[i][1])]]
            i += 1

        result.append(newInterval)
        result.extend(intervals[i:])
        return result`,
  },
  {
    skills: ['intervals', 'greedy'], title: 'Non-overlapping Intervals',
    code: `class Solution:
    def eraseOverlapIntervals(self, intervals: List[List[int]]) -> int:
        intervals.sort(key=lambda pair: [[pair[1]]])
        removed = 0
        prevEnd = float('-inf')

        for start, end in intervals:
            if start >= prevEnd:
                prevEnd = end
            else:
                removed += [[1]]

        return removed`,
  },
  {
    skills: ['intervals', 'heap'], title: 'Meeting Rooms II',
    code: `import heapq

class Solution:
    def minMeetingRooms(self, intervals: List[List[int]]) -> int:
        intervals.sort(key=lambda pair: pair[0])
        rooms = []

        for start, end in intervals:
            if rooms and rooms[0] <= [[start]]:
                heapq.heapreplace(rooms, end)
            else:
                heapq.heappush(rooms, [[end]])

        return len(rooms)`,
    hint: 'rooms is a min-heap of end times; reuse a room if its meeting already ended.',
  },
  {
    skills: ['intervals', 'greedy'], title: 'Minimum Arrows to Burst Balloons',
    code: `class Solution:
    def findMinArrowShots(self, points: List[List[int]]) -> int:
        points.sort(key=lambda pair: pair[1])
        arrows = 1
        end = points[0][1]

        for start, stop in points[1:]:
            if start > [[end]]:
                arrows += 1
                end = stop

        return arrows`,
  },
  {
    skills: ['intervals', 'two-pointers'], title: 'Interval List Intersections',
    code: `class Solution:
    def intervalIntersection(self, firstList: List[List[int]], secondList: List[List[int]]) -> List[List[int]]:
        result = []
        i = j = 0

        while i < len(firstList) and j < len(secondList):
            start = max(firstList[i][0], secondList[j][0])
            end = min(firstList[i][1], secondList[j][1])

            if start <= end:
                result.append([start, end])

            if firstList[i][1] < secondList[j][1]:
                i += [[1]]
            else:
                j += [[1]]

        return result`,
  },
]

const sortingClozes = [
  {
    skills: ['heap'], title: 'Kth Largest Element — min-heap',
    code: `import heapq

class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        heap = []
        for num in nums:
            heapq.heappush(heap, num)
            if len(heap) > [[k]]:
                heapq.heappop(heap)
        return heap[[[0]]]`,
  },
  {
    skills: ['two-pointers'], title: 'Sort Colors — Dutch flag (sorting view)',
    code: `class Solution:
    def sortColors(self, nums: List[int]) -> None:
        low, mid, high = 0, 0, len(nums) - 1

        while mid <= high:
            if nums[mid] == 0:
                nums[low], nums[mid] = nums[mid], nums[low]
                low += 1
                mid += 1
            elif nums[mid] == 2:
                nums[mid], nums[high] = nums[high], nums[mid]
                high -= [[1]]
            else:
                mid += [[1]]`,
  },
  {
    skills: ['arrays-hashing'], title: 'Largest Number',
    code: `from functools import cmp_to_key

class Solution:
    def largestNumber(self, nums: List[int]) -> str:
        strs = list(map(str, nums))

        def compare(a, b):
            if a + b > b + a:
                return [[-1]]
            elif a + b < b + a:
                return 1
            return 0

        strs.sort(key=cmp_to_key(compare))
        result = ''.join(strs)
        return '0' if result[[[0]]] == '0' else result`,
    hint: 'Return a negative number when a should come before b.',
  },
  {
    skills: ['heap', 'linked-list'], title: 'Merge k Sorted Lists',
    code: `import heapq

class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        heap = []
        for i, node in enumerate(lists):
            if node:
                heapq.heappush(heap, (node.val, i, node))

        dummy = tail = ListNode()
        while heap:
            val, i, node = heapq.heappop(heap)
            tail.next = node
            tail = tail.next
            if node.next:
                heapq.heappush(heap, (node.next.val, [[i]], node.next))

        return dummy.next`,
    hint: 'The index i breaks ties so two equal-valued nodes never get compared directly.',
  },
  {
    skills: ['heap'], title: 'K Closest Points to Origin',
    code: `import heapq

class Solution:
    def kClosest(self, points: List[List[int]], k: int) -> List[List[int]]:
        heap = []
        for x, y in points:
            dist = x * x + [[y * y]]
            heapq.heappush(heap, (-dist, x, y))
            if len(heap) > k:
                heapq.heappop(heap)

        return [[[p[1], p[2]] for p in heap]]`,
    hint: 'Negate the distance so a min-heap behaves like a max-heap on distance.',
  },
  {
    skills: ['arrays-hashing'], title: 'Insert into a sorted list with bisect',
    code: `from bisect import bisect_left

def insertSorted(sortedList: List[int], x: int) -> None:
    index = [[bisect_left(sortedList, x)]]
    sortedList.insert(index, x)`,
  },
]

const matricesClozes = [
  {
    skills: ['grid'], title: 'Rotate Image 90° clockwise',
    code: `class Solution:
    def rotate(self, matrix: List[List[int]]) -> None:
        n = len(matrix)

        for i in range(n):
            for j in range(i + 1, n):
                matrix[i][j], matrix[j][i] = [[matrix[j][i], matrix[i][j]]]

        for row in matrix:
            row.reverse()`,
  },
  {
    skills: ['grid'], title: 'Spiral Matrix',
    code: `class Solution:
    def spiralOrder(self, matrix: List[List[int]]) -> List[int]:
        result = []
        top, bottom = 0, len(matrix) - 1
        left, right = 0, len(matrix[0]) - 1

        while top <= bottom and left <= right:
            for col in range(left, right + 1):
                result.append(matrix[top][col])
            top += 1

            for row in range(top, bottom + 1):
                result.append(matrix[row][right])
            right -= 1

            if top <= bottom:
                for col in range(right, left - 1, -1):
                    result.append(matrix[bottom][col])
                bottom -= [[1]]

            if left <= right:
                for row in range(bottom, top - 1, -1):
                    result.append(matrix[row][left])
                left += [[1]]

        return result`,
  },
  {
    skills: ['arrays-hashing', 'grid'], title: 'Set Matrix Zeroes',
    code: `class Solution:
    def setZeroes(self, matrix: List[List[int]]) -> None:
        rows, cols = len(matrix), len(matrix[0])
        firstRowZero = any(matrix[0][c] == 0 for c in range(cols))
        firstColZero = any(matrix[r][0] == 0 for r in range(rows))

        for r in range(1, rows):
            for c in range(1, cols):
                if matrix[r][c] == 0:
                    matrix[r][0] = [[0]]
                    matrix[0][c] = 0

        for r in range(1, rows):
            for c in range(1, cols):
                if matrix[r][0] == 0 or matrix[0][c] == 0:
                    matrix[r][c] = 0

        if firstRowZero:
            for c in range(cols):
                matrix[0][c] = 0
        if firstColZero:
            for r in range(rows):
                matrix[[[r]]][0] = 0`,
    hint: 'Row 0 and column 0 double as marker flags for the rest of the matrix.',
  },
  {
    skills: ['binary-search', 'grid'], title: 'Search a 2D Matrix II — staircase',
    code: `class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        row, col = 0, len(matrix[0]) - 1

        while row < len(matrix) and col >= 0:
            if matrix[row][col] == target:
                return True
            elif matrix[row][col] > target:
                col -= [[1]]
            else:
                row += [[1]]

        return False`,
  },
  {
    skills: ['grid'], title: 'Number of Islands',
    code: `class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        rows, cols = len(grid), len(grid[0])

        def dfs(r, c):
            if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] == '0':
                return
            grid[r][c] = [['0']]
            dfs(r + 1, c)
            dfs(r - 1, c)
            dfs(r, c + 1)
            dfs(r, c - 1)

        count = 0
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == '1':
                    count += [[1]]
                    dfs(r, c)

        return count`,
  },
  {
    skills: ['grid'], title: 'Valid Sudoku',
    code: `class Solution:
    def isValidSudoku(self, board: List[List[str]]) -> bool:
        rows = [set() for _ in range(9)]
        cols = [set() for _ in range(9)]
        boxes = [set() for _ in range(9)]

        for r in range(9):
            for c in range(9):
                val = board[r][c]
                if val == '.':
                    continue
                boxId = (r // 3) * 3 + (c // [[3]])
                if val in rows[r] or val in cols[c] or val in boxes[boxId]:
                    return False
                rows[r].add(val)
                cols[c].add(val)
                boxes[[[boxId]]].add(val)

        return True`,
  },
]

const mathClozes = [
  {
    skills: ['math'], title: 'Pow(x, n) — fast exponentiation',
    code: `class Solution:
    def myPow(self, x: float, n: int) -> float:
        if n < 0:
            x = 1 / x
            n = [[-n]]

        result = 1
        while n > 0:
            if n % 2 == 1:
                result *= x
            x *= [[x]]
            n //= [[2]]

        return result`,
  },
  {
    skills: ['math'], title: 'GCD and LCM',
    code: `def gcd(a: int, b: int) -> int:
    while b:
        a, b = b, [[a % b]]
    return a

def lcm(a: int, b: int) -> int:
    return a * b // [[gcd(a, b)]]`,
  },
  {
    skills: ['math'], title: 'Sieve of Eratosthenes',
    code: `def countPrimes(n: int) -> int:
    if n < 2:
        return 0
    isPrime = [True] * n
    isPrime[0] = isPrime[1] = False

    for i in range(2, int(n ** 0.5) + 1):
        if isPrime[i]:
            for multiple in range(i * i, n, i):
                isPrime[[[multiple]]] = False

    return sum(isPrime)`,
  },
  {
    skills: ['math'], title: 'Happy Number — cycle detection',
    code: `class Solution:
    def isHappy(self, n: int) -> bool:
        seen = set()

        while n != 1 and n not in seen:
            seen.add(n)
            n = sum(int(d) ** 2 for d in [[str(n)]])

        return n == [[1]]`,
  },
  {
    skills: ['bit'], title: 'Power of Two — bit trick',
    code: `class Solution:
    def isPowerOfTwo(self, n: int) -> bool:
        return n > 0 and (n & [[n - 1]]) == 0`,
  },
  {
    skills: ['bit'], title: 'Single Number II — bit counting mod 3',
    code: `class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        ones, twos = 0, 0

        for num in nums:
            ones = (ones ^ num) & [[~twos]]
            twos = (twos ^ num) & [[~ones]]

        return ones`,
    hint: 'ones tracks bits seen once; twos tracks bits seen twice; both reset to 0 on the third sighting.',
  },
]

export default [
  ...arraysHashingClozes,
  ...twoPointersClozes,
  ...slidingWindowClozes,
  ...prefixSumClozes,
  ...binarySearchClozes,
  ...stringsClozes,
  ...intervalsClozes,
  ...sortingClozes,
  ...matricesClozes,
  ...mathClozes,
]
