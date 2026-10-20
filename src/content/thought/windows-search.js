const items = [
  {
    id: 'thought:windows-search:sliding-window-maximum',
    lc: 239,
    title: 'Sliding Window Maximum',
    difficulty: 'Hard',
    category: 'windows-search',
    skills: ['sliding-window', 'queue-deque'],
    companies: ['amazon', 'google', 'meta'],
    statement: `Given an array and a window size k, return the maximum value in each window as it slides from the left end of the array to the right.

Recomputing the max for every window is O(n*k). A monotonic decreasing deque of indices keeps the window max at the front in O(1) amortized: pop smaller values from the back before pushing, and drop indices that fall out of the window from the front.`,
    examples: [
      { input: 'nums = [1,3,-1,-3,5,3,6,7], k = 3', output: '[3,3,5,5,6,7]' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '1 <= k <= nums.length'],
    ds: {
      answer: 'monotonic decreasing deque of indices',
      choices: ['monotonic decreasing deque of indices', 'max-heap of (value, index), lazy deletion', 'sorted list of the current window, updated per slide', 'segment tree over the array'],
    },
    method: {
      answer: "Monotonic deque: ==while window and nums[window[-1]] <= num: window.pop()==, then push i, drop the front if it's out of the window, and once i >= k-1 record nums at the front",
      choices: [
        "Monotonic deque: ==while window and nums[window[-1]] <= num: window.pop()==, then push i, drop the front if it's out of the window, and once i >= k-1 record nums at the front",
        'Max-heap of (value, index), pushing every element and popping stale (out-of-window) entries lazily whenever they reach the top',
        'Recompute the maximum of the current window from scratch with a nested loop every time it slides',
        'Segment tree supporting range-max queries, querying the window range at every position',
      ],
    },
    code: `class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:
        window = deque()
        result = []

        for i, num in enumerate(nums):
            while window and nums[window[-1]] <= num:
                window.pop()
            window.append(i)

            if window[0] <= i - k:
                window.popleft()

            if i >= k - 1:
                result.append(nums[window[0]])

        return result`,
    blanks: [6, 10, 14],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n*k)', 'O(n^2)'], why: 'each index enters and leaves the deque at most once, amortized O(1) per element' },
    space: { answer: 'O(k)', choices: ['O(k)', 'O(n)', 'O(1)', 'O(n log n)'], why: 'the deque holds at most k indices at a time' },
    sayIt: "Monotonic deque holding candidate maxima: ==pop smaller values from the back before pushing==, drop stale indices from the front, O(n) time since each index moves once.",
    pitfall: 'Must drop front indices that fall outside the window before reading the max, and pop smaller values before every push, not after.',
  },
  {
    id: 'thought:windows-search:fruit-into-baskets',
    lc: 904,
    title: 'Fruit Into Baskets',
    difficulty: 'Medium',
    category: 'windows-search',
    skills: ['sliding-window'],
    companies: ['amazon', 'google'],
    statement: `You're picking fruit from a row of trees, each tree holding one type. You have exactly two baskets, each holding only one type of fruit, with no limit on quantity. You must pick from trees in a contiguous run and stop as soon as you'd need a third basket type.

This is really "longest subarray with at most 2 distinct values": grow the window to the right, and whenever a third distinct type appears, shrink from the left until only 2 types remain.`,
    examples: [
      { input: 'fruits = [1,2,1]', output: '3', explanation: 'all three trees can be picked, only 2 types present' },
      { input: 'fruits = [0,1,2,2]', output: '3', explanation: 'picking [1,2,2] uses only 2 basket types' },
    ],
    constraints: ['1 <= fruits.length <= 10^5', '0 <= fruits[i] < fruits.length'],
    ds: {
      answer: 'dd(int) count of fruit types in the current window',
      choices: ['dd(int) count of fruit types in the current window', 'set() of the last two distinct types only', 'sorted list of fruit types in the window', 'two pointers with no auxiliary count structure'],
    },
    method: {
      answer: 'Sliding window with a type-count map: ==while len(basket) > 2: decrement the leftmost type, remove it if it hits 0, then shrink left==, track the best window width seen',
      choices: [
        'Sliding window with a type-count map: ==while len(basket) > 2: decrement the leftmost type, remove it if it hits 0, then shrink left==, track the best window width seen',
        'For every pair of fruit types, scan the whole array and find the longest run containing only those two',
        'Greedily reset the window every time a new type is seen, regardless of how many distinct types are currently held',
        'Fixed-size sliding window of size 2, since only 2 basket types are allowed',
      ],
    },
    code: `class Solution:
    def totalFruit(self, fruits: List[int]) -> int:
        basket = defaultdict(int)
        left = 0
        best = 0

        for right, fruit in enumerate(fruits):
            basket[fruit] += 1

            while len(basket) > 2:
                basket[fruits[left]] -= 1
                if basket[fruits[left]] == 0:
                    del basket[fruits[left]]
                left += 1

            best = max(best, right - left + 1)

        return best`,
    blanks: [9, 13, 15],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(1)'], why: 'left and right pointers each move forward at most n times total' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'], why: 'the basket map holds at most 3 fruit types at any instant' },
    sayIt: "Sliding window keyed by a type-count map, ==shrink left while more than 2 distinct types remain==, track the best width, O(n) time.",
    pitfall: 'Must delete a type from the map once its count hits 0, or len(basket) stays inflated and the shrink never stops.',
  },
  {
    id: 'thought:windows-search:max-consecutive-ones-iii',
    lc: 1004,
    title: 'Max Consecutive Ones III',
    difficulty: 'Medium',
    category: 'windows-search',
    skills: ['sliding-window'],
    companies: ['google', 'meta'],
    statement: `Given a binary array and an integer k, find the length of the longest contiguous subarray of 1s you can get by flipping at most k zeros to 1s.

Grow the window to the right, counting zeros inside it; whenever the zero count exceeds k, shrink from the left until it's back at k or fewer.`,
    examples: [
      { input: 'nums = [1,1,1,0,0,0,1,1,1,1,0], k = 2', output: '6', explanation: 'flip the two 0s at indices 3,4 to get a run of six 1s from index 0 to 5' },
    ],
    constraints: ['1 <= nums.length <= 10^5', 'nums[i] is 0 or 1', '0 <= k <= nums.length'],
    ds: {
      answer: 'two pointers + a running zero-count in the window',
      choices: ['two pointers + a running zero-count in the window', 'prefix sum array of zero counts + binary search', 'dd(int) counting both 0s and 1s in the window', 'monotonic stack of zero positions'],
    },
    method: {
      answer: "Sliding window tracking zero count: ==while zeros > k: shrink left, decrementing zeros whenever the leaving element is a zero==, track the best window width (right - left + 1) after each shrink",
      choices: [
        "Sliding window tracking zero count: ==while zeros > k: shrink left, decrementing zeros whenever the leaving element is a zero==, track the best window width (right - left + 1) after each shrink",
        'For every zero in the array, try flipping it and the k-1 nearest zeros, then measure the run',
        'Binary search on the answer length, checking every window of that length for at most k zeros',
        'Fixed window of size k+1, sliding it across and counting ones inside',
      ],
    },
    code: `class Solution:
    def longestOnes(self, nums: List[int], k: int) -> int:
        left = 0
        zeros = 0
        best = 0

        for right, num in enumerate(nums):
            if num == 0:
                zeros += 1

            while zeros > k:
                if nums[left] == 0:
                    zeros -= 1
                left += 1

            best = max(best, right - left + 1)

        return best`,
    blanks: [10, 13, 15],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(n*k)'], why: 'left and right pointers each advance forward at most n times total' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(log n)', 'O(k)'], why: 'only a zero count and two pointers are kept, no auxiliary array' },
    sayIt: "Sliding window counting zeros, ==shrink left while zeros > k==, best window width tracked after each shrink, O(n) time.",
    pitfall: 'The window never needs to shrink back below k zeros, it never needs to reset; it only ever shrinks by exactly one from the left per excess zero.',
  },
  {
    id: 'thought:windows-search:minimum-size-subarray-sum',
    lc: 209,
    title: 'Minimum Size Subarray Sum',
    difficulty: 'Medium',
    category: 'windows-search',
    skills: ['sliding-window'],
    companies: ['meta', 'amazon'],
    statement: `Given an array of positive integers and a target sum, find the length of the shortest contiguous subarray whose sum is greater than or equal to the target. Return 0 if no such subarray exists.

Since all values are positive, growing the window only increases the sum and shrinking only decreases it, so a sliding window works: grow right until the sum reaches target, then shrink left as far as possible while staying at or above target.`,
    examples: [
      { input: 'target = 7, nums = [2,3,1,2,4,3]', output: '2', explanation: 'the subarray [4,3] has sum 7 with length 2' },
      { input: 'target = 11, nums = [1,1,1,1,1,1,1,1]', output: '0', explanation: 'the total sum is only 8, which never reaches 11' },
    ],
    constraints: ['1 <= target <= 10^9', '1 <= nums.length <= 10^5', '1 <= nums[i] <= 10^4'],
    ds: {
      answer: 'two pointers + running window sum',
      choices: ['two pointers + running window sum', 'prefix sum array + binary search per index', 'dd(int) of running sums seen so far', 'monotonic stack of partial sums'],
    },
    method: {
      answer: "Sliding window: grow by adding nums[right], then ==while total >= target: shrink from the left, recording the window length before each shrink==",
      choices: [
        "Sliding window: grow by adding nums[right], then ==while total >= target: shrink from the left, recording the window length before each shrink==",
        'Prefix sums with a sorted structure, binary searching for the earliest prefix at least target less than the current one',
        'Check every subarray length from 1 to n, testing all starting positions at each length',
        'Greedily take the single largest remaining element repeatedly until the target is reached',
      ],
    },
    code: `class Solution:
    def minSubArrayLen(self, target: int, nums: List[int]) -> int:
        left = 0
        total = 0
        best = len(nums) + 1

        for right, num in enumerate(nums):
            total += num

            while total >= target:
                best = min(best, right - left + 1)
                total -= nums[left]
                left += 1

        return best if best <= len(nums) else 0`,
    blanks: [9, 10, 14],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(1)'], why: 'left and right pointers each advance forward at most n times total' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'], why: 'only a running sum, best-so-far, and two pointers are kept' },
    sayIt: "Sliding window, grow right adding to total, ==shrink left while total >= target==, recording window length each shrink, O(n) time since all values are positive.",
    pitfall: 'This only works because every nums[i] is positive; with negatives in the array you would need a different approach entirely.',
  },
  {
    id: 'thought:windows-search:maximum-average-subarray-i',
    lc: 643,
    title: 'Maximum Average Subarray I',
    difficulty: 'Easy',
    category: 'windows-search',
    skills: ['sliding-window'],
    companies: ['amazon', 'google'],
    statement: `Given an array of integers and an integer k, find the maximum average value of any contiguous subarray of exactly length k.

Compute the sum of the first window directly, then slide the window one step at a time, adjusting the sum by subtracting the element that leaves and adding the one that enters, instead of resumming from scratch.`,
    examples: [
      { input: 'nums = [1,12,-5,-6,50,3], k = 4', output: '12.75', explanation: 'the window [12,-5,-6,50] sums to 51, average 51/4 = 12.75' },
    ],
    constraints: ['n == nums.length', '1 <= k <= n <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    ds: {
      answer: 'fixed-size sliding window with a running sum',
      choices: ['fixed-size sliding window with a running sum', 'prefix sum array, querying every length-k range', 'sorted window contents, recomputed every slide', 'monotonic deque of window maxima'],
    },
    method: {
      answer: "Fixed window of size k: seed with sum(nums[:k]), then slide one step at a time: ==windowSum += nums[i] - nums[i-k]==, tracking the best sum seen",
      choices: [
        "Fixed window of size k: seed with sum(nums[:k]), then slide one step at a time: ==windowSum += nums[i] - nums[i-k]==, tracking the best sum seen",
        'Recompute sum(nums[i:i+k]) from scratch for every starting index i, an O(n*k) scan',
        'Build a prefix sum array, then take the max of prefix[i+k] - prefix[i] over every i using nested loops',
        'Sort the array and average the k largest values, ignoring contiguity',
      ],
    },
    code: `class Solution:
    def findMaxAverage(self, nums: List[int], k: int) -> float:
        windowSum = sum(nums[:k])
        best = windowSum

        for i in range(k, len(nums)):
            windowSum += nums[i] - nums[i - k]
            best = max(best, windowSum)

        return best / k`,
    blanks: [6, 7, 9],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n*k)', 'O(n^2)'], why: 'the first window is O(k), then each slide is O(1), for O(n) total' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(k)', 'O(log n)'], why: 'only a running window sum and a best-so-far variable are kept' },
    sayIt: "Seed the first window's sum, then each slide is ==windowSum += nums[i] - nums[i-k]== instead of resumming, O(n) time, divide by k at the very end.",
    pitfall: 'Dividing by k inside the loop on every step wastes time; only divide once at the end, after finding the best raw sum.',
  },
  {
    id: 'thought:windows-search:longest-subarray-deleting-one',
    lc: 1493,
    title: "Longest Subarray of 1's After Deleting One Element",
    difficulty: 'Medium',
    category: 'windows-search',
    skills: ['sliding-window'],
    companies: ['google', 'amazon'],
    statement: `Given a binary array, you must delete exactly one element from it. Find the length of the longest contiguous run of 1s in the resulting array.

This is "at most one zero in the window" (same shape as Max Consecutive Ones III with k=1), except you must delete something, so the answer is the best window width minus 1, not the width itself.`,
    examples: [
      { input: 'nums = [1,1,0,1]', output: '3', explanation: 'delete the 0 at index 2, leaving [1,1,1]' },
      { input: 'nums = [1,1,1]', output: '2', explanation: 'no zero to delete, so you must still delete one of the 1s, leaving length 2' },
    ],
    constraints: ['1 <= nums.length <= 10^5', 'nums[i] is 0 or 1'],
    ds: {
      answer: 'two pointers + a running zero-count, allowing at most one zero',
      choices: ['two pointers + a running zero-count, allowing at most one zero', 'prefix sum array of zero positions + binary search', 'dd(int) counting run lengths between zeros', 'monotonic stack of zero indices'],
    },
    method: {
      answer: "Sliding window allowing at most one zero: ==while zeros > 1: shrink from the left, decrementing zeros when a zero leaves==, then track ==best = max(best, right - left)== (width minus the mandatory deletion)",
      choices: [
        "Sliding window allowing at most one zero: ==while zeros > 1: shrink from the left, decrementing zeros when a zero leaves==, then track ==best = max(best, right - left)== (width minus the mandatory deletion)",
        'Split the array on every zero and take the length of the longest resulting run of 1s',
        'Same as Max Consecutive Ones III with k=1, and return the window width directly with no adjustment',
        'Greedily delete the first zero found, then scan the remaining array once for the longest run of 1s',
      ],
    },
    code: `class Solution:
    def longestSubarray(self, nums: List[int]) -> int:
        left = 0
        zeros = 0
        best = 0

        for right, num in enumerate(nums):
            if num == 0:
                zeros += 1

            while zeros > 1:
                if nums[left] == 0:
                    zeros -= 1
                left += 1

            best = max(best, right - left)

        return best`,
    blanks: [10, 13, 15],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(1)'], why: 'left and right pointers each advance forward at most n times total' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(log n)', 'O(k)'], why: 'only a zero count and two pointers are kept' },
    sayIt: "Window allowing at most one zero, ==shrink left while zeros > 1==, then ==best = max(best, right - left)==, subtracting one for the mandatory deletion, O(n) time.",
    pitfall: "Returning right - left + 1 instead of right - left forgets you must delete exactly one element, even when the best window has no zero in it at all.",
  },
  {
    id: 'thought:windows-search:binary-search',
    lc: 704,
    title: 'Binary Search',
    difficulty: 'Easy',
    category: 'windows-search',
    skills: ['binary-search'],
    companies: ['amazon', 'google', 'microsoft'],
    statement: `Given a sorted array of distinct integers and a target, return the index of the target, or -1 if it's not present. The classic requirement is O(log n) time.

Keep a left and right bound, check the midpoint, and discard half the search space each time based on whether the midpoint is too small or too large.`,
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' },
    ],
    constraints: ['1 <= nums.length <= 10^4', 'nums is sorted in ascending order, all values distinct'],
    ds: {
      answer: 'two pointers (left, right) over the sorted array',
      choices: ['two pointers (left, right) over the sorted array', 'hashmap of value -> index', 'linear scan with early exit', 'sorted copy of the array (already sorted, so unnecessary)'],
    },
    method: {
      answer: 'Classic binary search: ==mid = (left + right) // 2==, if nums[mid] == target return mid, elif too small move left past mid, else move right before mid',
      choices: [
        'Classic binary search: ==mid = (left + right) // 2==, if nums[mid] == target return mid, elif too small move left past mid, else move right before mid',
        'Linear scan from left to right, returning the first index where nums[i] == target',
        'Jump search in fixed-size blocks of sqrt(n), then linear scan within the found block',
        'Exponential search doubling the bound until nums[bound] >= target, then binary search that range',
      ],
    },
    code: `class Solution:
    def search(self, nums: List[int], target: int) -> int:
        left, right = 0, len(nums) - 1

        while left <= right:
            mid = (left + right) // 2

            if nums[mid] == target:
                return mid
            elif nums[mid] < target:
                left = mid + 1
            else:
                right = mid - 1

        return -1`,
    blanks: [5, 10, 12],
    time: { answer: 'O(log n)', choices: ['O(log n)', 'O(n)', 'O(n log n)', 'O(1)'], why: 'the search space is halved every iteration' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], why: 'only left, right, and mid index variables are kept' },
    sayIt: "Standard binary search, ==mid = (left + right) // 2==, narrow left/right based on comparing nums[mid] to target, O(log n) time.",
    pitfall: 'Loop condition must be left <= right (not <), or the last remaining candidate is skipped.',
  },
  {
    id: 'thought:windows-search:search-insert-position',
    lc: 35,
    title: 'Search Insert Position',
    difficulty: 'Easy',
    category: 'windows-search',
    skills: ['binary-search'],
    companies: ['amazon', 'microsoft'],
    statement: `Given a sorted array of distinct integers and a target, return the index if the target is found, or the index where it would be inserted to keep the array sorted, if it's not.

This is binary search for the leftmost position where nums[pos] >= target; the loop is written with a half-open [left, right) range so the answer falls out naturally as left when the loop ends.`,
    examples: [
      { input: 'nums = [1,3,5,6], target = 5', output: '2', explanation: 'target is present at index 2' },
      { input: 'nums = [1,3,5,6], target = 2', output: '1', explanation: 'target would be inserted between index 0 and 1' },
    ],
    constraints: ['1 <= nums.length <= 10^4', 'nums is sorted in ascending order, all values distinct'],
    ds: {
      answer: 'binary search, half-open [left, right) range',
      choices: ['binary search, half-open [left, right) range', 'linear scan returning the first index where nums[i] >= target', 'hashmap of value -> index, with a fallback linear scan', 'bisect-style sorted insert via list.insert'],
    },
    method: {
      answer: "Binary search for the leftmost insertion point: ==if nums[mid] < target: left = mid + 1==, else right = mid, shrinking a half-open range until left == right",
      choices: [
        "Binary search for the leftmost insertion point: ==if nums[mid] < target: left = mid + 1==, else right = mid, shrinking a half-open range until left == right",
        'Linear scan from the start, returning the first index where nums[i] >= target',
        'Binary search for an exact match only, then separately linear-scan for the insertion point if no match is found',
        'Append target to the array, sort it, then return the index of target in the sorted result',
      ],
    },
    code: `class Solution:
    def searchInsert(self, nums: List[int], target: int) -> int:
        left, right = 0, len(nums)

        while left < right:
            mid = (left + right) // 2

            if nums[mid] < target:
                left = mid + 1
            else:
                right = mid

        return left`,
    blanks: [5, 8, 10],
    time: { answer: 'O(log n)', choices: ['O(log n)', 'O(n)', 'O(n log n)', 'O(1)'], why: 'the half-open range is halved every iteration' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], why: 'only left, right, and mid index variables are kept' },
    sayIt: "Half-open binary search: ==nums[mid] < target moves left past mid, else right shrinks to mid==, loop ends when left == right, that's the answer, O(log n).",
    pitfall: 'right starts at len(nums), not len(nums) - 1, since the insertion point can legally be past the last element.',
  },
  {
    id: 'thought:windows-search:search-in-rotated-sorted-array',
    lc: 33,
    title: 'Search in Rotated Sorted Array',
    difficulty: 'Medium',
    category: 'windows-search',
    skills: ['binary-search'],
    companies: ['amazon', 'microsoft', 'meta', 'google'],
    statement: `You're given an array that was sorted in ascending order, then rotated at some unknown pivot. Search for a target value and return its index, or -1 if it's not present, in O(log n) time.

At every midpoint, one of the two halves is still guaranteed to be properly sorted. Check which half is sorted, then check whether the target falls inside that sorted half's range to decide which side to keep searching.`,
    examples: [
      { input: 'nums = [4,5,6,7,0,1,2], target = 0', output: '4' },
      { input: 'nums = [4,5,6,7,0,1,2], target = 3', output: '-1' },
    ],
    constraints: ['1 <= nums.length <= 5000', 'all values in nums are distinct', 'nums is a rotated sorted array'],
    ds: {
      answer: 'modified binary search, identify the sorted half each step',
      choices: ['modified binary search, identify the sorted half each step', 'find the rotation pivot first with binary search, then binary search the correct half', 'linear scan checking every element', 'hashmap of value -> index built from the array'],
    },
    method: {
      answer: "Modified binary search: ==if nums[left] <= nums[mid]: the left half is sorted==, so check if target is in that sorted range to pick a side; otherwise the right half is sorted, check the mirrored condition there",
      choices: [
        "Modified binary search: ==if nums[left] <= nums[mid]: the left half is sorted==, so check if target is in that sorted range to pick a side; otherwise the right half is sorted, check the mirrored condition there",
        'Binary search for the rotation pivot index first, then run a plain binary search restricted to the correct side',
        'Linear scan from index 0, returning the first index where nums[i] == target',
        'Unrotate the array into a new sorted copy, binary search that, then map the index back',
      ],
    },
    code: `class Solution:
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
    blanks: [10, 11, 16],
    time: { answer: 'O(log n)', choices: ['O(log n)', 'O(n)', 'O(n log n)', 'O(1)'], why: 'one half is always eliminated each iteration, same as plain binary search' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], why: 'only left, right, and mid index variables are kept' },
    sayIt: "Check which half is sorted, ==nums[left] <= nums[mid] means the left half is sorted==, then test if target lies in that sorted range to choose a side, O(log n).",
    pitfall: 'The comparison must use <= on nums[left] <= nums[mid] to correctly handle a 2-element sorted half.',
  },
  {
    id: 'thought:windows-search:find-minimum-in-rotated-sorted-array',
    lc: 153,
    title: 'Find Minimum in Rotated Sorted Array',
    difficulty: 'Medium',
    category: 'windows-search',
    skills: ['binary-search'],
    companies: ['amazon', 'microsoft'],
    statement: `Given a rotated sorted array of distinct values with no duplicates, find the minimum element in O(log n) time.

Compare the middle element to the rightmost element: if the middle is greater, the minimum must be strictly to the right of it; otherwise the middle itself could be (or be past) the minimum, so keep it in the search range.`,
    examples: [
      { input: 'nums = [3,4,5,1,2]', output: '1' },
      { input: 'nums = [4,5,6,7,0,1,2]', output: '0' },
    ],
    constraints: ['n == nums.length', '1 <= n <= 5000', 'all integers of nums are unique', 'nums was rotated between 0 and n-1 times'],
    ds: {
      answer: 'binary search comparing mid against the right boundary',
      choices: ['binary search comparing mid against the right boundary', 'linear scan for the first index where nums[i] > nums[i+1]', 'binary search comparing mid against the left boundary only', 'sort a copy of the array and return its first element'],
    },
    method: {
      answer: "Binary search against the right edge: ==if nums[mid] > nums[right]: left = mid + 1== (min is strictly past mid), else right = mid (min is at or before mid), loop while left < right",
      choices: [
        "Binary search against the right edge: ==if nums[mid] > nums[right]: left = mid + 1== (min is strictly past mid), else right = mid (min is at or before mid), loop while left < right",
        'Linear scan comparing every adjacent pair for the one drop point',
        'Compare mid against the left boundary instead of the right, moving right = mid - 1 whenever nums[mid] < nums[left]',
        'Sort a copy of the array and read off index 0, ignoring the rotation structure entirely',
      ],
    },
    code: `class Solution:
    def findMin(self, nums: List[int]) -> int:
        left, right = 0, len(nums) - 1

        while left < right:
            mid = (left + right) // 2

            if nums[mid] > nums[right]:
                left = mid + 1
            else:
                right = mid

        return nums[left]`,
    blanks: [5, 7, 10],
    time: { answer: 'O(log n)', choices: ['O(log n)', 'O(n)', 'O(n log n)', 'O(1)'], why: 'the search range is halved every iteration' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], why: 'only left, right, and mid index variables are kept' },
    sayIt: "Compare mid to the right edge: ==nums[mid] > nums[right] means the min is past mid==, else keep mid in range, loop while left < right, O(log n).",
    pitfall: 'Comparing against nums[right] (not nums[left]) is what makes this work regardless of how many times the array was rotated.',
  },
  {
    id: 'thought:windows-search:search-a-2d-matrix',
    lc: 74,
    title: 'Search a 2D Matrix',
    difficulty: 'Medium',
    category: 'windows-search',
    skills: ['binary-search'],
    companies: ['amazon', 'microsoft'],
    statement: `You're given an m x n matrix where each row is sorted ascending, and the first element of each row is greater than the last element of the previous row — meaning the whole matrix is really just one sorted sequence read row by row. Determine whether a target value exists in the matrix.

Treat the matrix as one flat sorted array of length rows*cols, binary search over that flat index space, and convert mid back to (row, col) with divmod.`,
    examples: [
      { input: 'matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3', output: 'true' },
      { input: 'matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 13', output: 'false' },
    ],
    constraints: ['m == matrix.length', 'n == matrix[i].length', '1 <= m, n <= 100'],
    ds: {
      answer: 'binary search over a virtual flat index (mid // cols, mid % cols)',
      choices: ['binary search over a virtual flat index (mid // cols, mid % cols)', 'binary search each row separately, one row at a time', 'start at the top-right corner and step left or down', 'linear scan through every cell'],
    },
    method: {
      answer: 'Flatten conceptually and binary search: ==val = matrix[mid // cols][mid % cols]==, over mid in [0, rows*cols - 1], same comparisons as plain binary search',
      choices: [
        'Flatten conceptually and binary search: ==val = matrix[mid // cols][mid % cols]==, over mid in [0, rows*cols - 1], same comparisons as plain binary search',
        'Binary search within each row independently until one row contains the target',
        'Start at the top-right cell, moving left when too big and down when too small',
        'Scan every cell with a nested loop until the target is found or the matrix is exhausted',
      ],
    },
    code: `class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        rows, cols = len(matrix), len(matrix[0])
        left, right = 0, rows * cols - 1

        while left <= right:
            mid = (left + right) // 2
            val = matrix[mid // cols][mid % cols]

            if val == target:
                return True
            elif val < target:
                left = mid + 1
            else:
                right = mid - 1

        return False`,
    blanks: [7, 12, 14],
    time: { answer: 'O(log(m*n))', choices: ['O(log(m*n))', 'O(m + n)', 'O(m*n)', 'O(log m + log n)'], why: 'binary search over a virtual array of length rows*cols' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(log(m*n))', 'O(m*n)', 'O(m+n)'], why: 'only left, right, and mid index variables are kept, the matrix is never flattened into real memory' },
    sayIt: "Treat the matrix as one flat sorted array: ==val = matrix[mid // cols][mid % cols]==, binary search mid over [0, rows*cols-1], O(log(m*n)) time.",
    pitfall: 'This flattening trick requires each row to continue where the previous one left off, which the problem guarantees; a matrix only sorted per-row/per-column would need the top-right staircase approach instead.',
  },
  {
    id: 'thought:windows-search:find-peak-element',
    lc: 162,
    title: 'Find Peak Element',
    difficulty: 'Medium',
    category: 'windows-search',
    skills: ['binary-search'],
    companies: ['google', 'amazon'],
    statement: `A peak element is one strictly greater than both of its neighbors (treating out-of-bounds neighbors as negative infinity). Given an array, find the index of any one peak; multiple peaks may exist and returning any valid one is fine.

Binary search works here even though the array isn't sorted: whichever direction is increasing from the midpoint is guaranteed to lead to a peak, since the array's boundaries are effectively -infinity.`,
    examples: [
      { input: 'nums = [1,2,3,1]', output: '2', explanation: 'index 2 holds value 3, greater than both neighbors' },
      { input: 'nums = [1,2,1,3,5,6,4]', output: '1 or 5', explanation: 'both index 1 (value 2) and index 5 (value 6) are valid peaks' },
    ],
    constraints: ['1 <= nums.length <= 1000', 'nums[i] != nums[i+1] for all adjacent pairs'],
    ds: {
      answer: 'binary search following the upward slope',
      choices: ['binary search following the upward slope', 'linear scan for the first index greater than both neighbors', 'sort a copy of the array and return the original index of the max', 'two pointers from both ends moving toward the global max'],
    },
    method: {
      answer: "Binary search toward the climb: ==if nums[mid] > nums[mid+1]: a peak is at or before mid, so right = mid==, else a peak is strictly after mid, so left = mid + 1",
      choices: [
        "Binary search toward the climb: ==if nums[mid] > nums[mid+1]: a peak is at or before mid, so right = mid==, else a peak is strictly after mid, so left = mid + 1",
        'Linear scan checking every index against both of its neighbors',
        'Find the global maximum with one pass and return its index',
        'Binary search but always move right when nums[mid] > nums[mid+1], since larger values tend to cluster to the right',
      ],
    },
    code: `class Solution:
    def findPeakElement(self, nums: List[int]) -> int:
        left, right = 0, len(nums) - 1

        while left < right:
            mid = (left + right) // 2

            if nums[mid] > nums[mid + 1]:
                right = mid
            else:
                left = mid + 1

        return left`,
    blanks: [5, 8, 10],
    time: { answer: 'O(log n)', choices: ['O(log n)', 'O(n)', 'O(n log n)', 'O(1)'], why: 'the search range is halved every iteration' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], why: 'only left, right, and mid index variables are kept' },
    sayIt: "Follow the upward slope: ==nums[mid] > nums[mid+1] means a peak is at or before mid==, else it's strictly after, O(log n) even on an unsorted array.",
    pitfall: 'The boundaries count as -infinity, so an array that only increases (or only decreases) still has a peak, at one of the ends.',
  },
  {
    id: 'thought:windows-search:koko-eating-bananas',
    lc: 875,
    title: 'Koko Eating Bananas',
    difficulty: 'Medium',
    category: 'windows-search',
    skills: ['binary-search'],
    companies: ['google', 'amazon'],
    statement: `Koko has piles of bananas and h hours before the guards return. Each hour she picks one pile and eats up to k bananas from it (if the pile has fewer than k, she finishes it and the hour still counts). Find the minimum integer eating speed k so she finishes all piles within h hours.

The answer space (possible speeds from 1 to max(piles)) is monotonic: a faster speed never needs more hours. Binary search on the speed itself, checking how many hours a candidate speed requires.`,
    examples: [
      { input: 'piles = [3,6,7,11], h = 8', output: '4' },
      { input: 'piles = [30,11,23,4,20], h = 5', output: '30' },
    ],
    constraints: ['1 <= piles.length <= 10^4', 'piles.length <= h <= 10^9', '1 <= piles[i] <= 10^9'],
    ds: {
      answer: 'binary search over the answer (candidate eating speeds)',
      choices: ['binary search over the answer (candidate eating speeds)', 'sort piles descending and greedily assign hours to the largest piles first', 'dd(int) dp over (pile index, hours used)', 'max-heap of piles, always eating from the largest'],
    },
    method: {
      answer: "Binary search on speed: ==hoursNeeded = sum(math.ceil(pile / mid) for pile in piles)==, if that fits within h shrink right to mid (try slower), else speed up by moving left past mid",
      choices: [
        "Binary search on speed: ==hoursNeeded = sum(math.ceil(pile / mid) for pile in piles)==, if that fits within h shrink right to mid (try slower), else speed up by moving left past mid",
        'Linear scan trying every speed from 1 upward until one fits within h hours',
        'Greedily sort piles and always eat whichever pile is currently largest, recomputing after every hour',
        'DP where state is (pile index, hours remaining), minimizing the max bananas eaten in one hour',
      ],
    },
    code: `class Solution:
    def minEatingSpeed(self, piles: List[int], h: int) -> int:
        left, right = 1, max(piles)

        while left < right:
            mid = (left + right) // 2
            hoursNeeded = sum(math.ceil(pile / mid) for pile in piles)

            if hoursNeeded <= h:
                right = mid
            else:
                left = mid + 1

        return left`,
    blanks: [6, 9, 11],
    time: { answer: 'O(n log m)', choices: ['O(n log m)', 'O(n*m)', 'O(n)', 'O(log m)'], why: 'binary search over speeds 1..max(piles) (log m steps), each checking all n piles' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(log m)', 'O(n log m)'], why: 'only left, right, mid, and a running hour total are kept' },
    sayIt: "Binary search the speed itself: ==hoursNeeded = sum(ceil(pile/mid) for pile in piles)==, fits within h means try slower, else speed up, O(n log m) time.",
    pitfall: 'Must use ceiling division per pile (math.ceil(pile/mid)), since a partial pile still costs a full hour.',
  },
  {
    id: 'thought:windows-search:capacity-to-ship-packages',
    lc: 1011,
    title: 'Capacity To Ship Packages Within D Days',
    difficulty: 'Medium',
    category: 'windows-search',
    skills: ['binary-search'],
    companies: ['google', 'amazon'],
    statement: `A conveyor belt ships packages (in the given order, never reordered) over exactly D days, where each day you load as many consecutive packages as fit within the ship's weight capacity. Find the minimum ship capacity that still ships everything within D days.

Same shape as Koko: the answer space is monotonic (a bigger capacity never needs more days), so binary search on capacity and simulate how many days a candidate capacity requires.`,
    examples: [
      { input: 'weights = [1,2,3,4,5,6,7,8,9,10], days = 5', output: '15' },
      { input: 'weights = [3,2,2,4,1,4], days = 3', output: '6' },
    ],
    constraints: ['1 <= days <= weights.length <= 5*10^4', '1 <= weights[i] <= 500'],
    ds: {
      answer: 'binary search over the answer (candidate capacities)',
      choices: ['binary search over the answer (candidate capacities)', 'greedily split weights into D equal-sized chunks by count', 'dd(int) dp over (package index, days used)', 'sort weights and pair largest with smallest per day'],
    },
    method: {
      answer: "Binary search on capacity, bounded by [max(weights), sum(weights)]: simulate loading greedily and ==if current + weight > mid: start a new day==, if the simulated days fit within D shrink right, else push left up",
      choices: [
        "Binary search on capacity, bounded by [max(weights), sum(weights)]: simulate loading greedily and ==if current + weight > mid: start a new day==, if the simulated days fit within D shrink right, else push left up",
        'Greedily divide the weights array into D contiguous chunks of as-equal-as-possible count, then take the max chunk sum',
        'Linear scan trying every capacity from max(weights) upward until the simulated days fit',
        'Sort the weights descending and assign each to the currently least-loaded day, like a bin-packing heuristic',
      ],
    },
    code: `class Solution:
    def shipWithinDays(self, weights: List[int], days: int) -> int:
        left, right = max(weights), sum(weights)

        while left < right:
            mid = (left + right) // 2
            daysNeeded, current = 1, 0

            for weight in weights:
                if current + weight > mid:
                    daysNeeded += 1
                    current = 0
                current += weight

            if daysNeeded <= days:
                right = mid
            else:
                left = mid + 1

        return left`,
    blanks: [9, 14, 17],
    time: { answer: 'O(n log(sum))', choices: ['O(n log(sum))', 'O(n^2)', 'O(n)', 'O(log(sum))'], why: 'binary search over the capacity range, each check simulating all n weights' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(log(sum))', 'O(n log(sum))'], why: 'only left, right, mid, and a couple of simulation counters are kept' },
    sayIt: "Binary search on capacity in [max(weights), sum(weights)]: simulate days, ==start a new day when current + weight > mid==, fits within days means try smaller, O(n log(sum)) time.",
    pitfall: 'The capacity lower bound must be max(weights), since no capacity smaller than the heaviest single package could ever ship it.',
  },
  {
    id: 'thought:windows-search:median-of-two-sorted-arrays',
    lc: 4,
    title: 'Median of Two Sorted Arrays',
    difficulty: 'Hard',
    category: 'windows-search',
    skills: ['binary-search'],
    companies: ['amazon', 'microsoft', 'google', 'apple'],
    statement: `Given two sorted arrays, find the median of the combined data, in O(log(min(m,n))) time, without actually merging the arrays.

Binary search on how many elements to take from the shorter array; the partition point in the longer array is then fully determined by that choice, since together both partitions must hold exactly half the combined length.`,
    examples: [
      { input: 'nums1 = [1,3], nums2 = [2]', output: '2.0', explanation: 'merged is [1,2,3], median is the middle value 2' },
      { input: 'nums1 = [1,2], nums2 = [3,4]', output: '2.5', explanation: 'merged is [1,2,3,4], median is the average of the two middle values' },
    ],
    constraints: ['nums1.length == m', 'nums2.length == n', '0 <= m, n <= 1000', '1 <= m + n <= 2000'],
    ds: {
      answer: 'binary search a partition index over the shorter array',
      choices: ['binary search a partition index over the shorter array', 'merge both arrays into one sorted array, then index the middle', 'min-heap merge of both arrays, popping until the midpoint', 'two pointers walking both arrays simultaneously to the midpoint'],
    },
    method: {
      answer: "Binary search the partition in the shorter array: ==i = (left + right) // 2==, derive the matching partition in the other array with ==j = (m+n+1)//2 - i==, then check if the left/right edges interleave correctly across both partitions",
      choices: [
        "Binary search the partition in the shorter array: ==i = (left + right) // 2==, derive the matching partition in the other array with ==j = (m+n+1)//2 - i==, then check if the left/right edges interleave correctly across both partitions",
        'Merge both sorted arrays into a single sorted array in O(m+n), then read off the middle element(s)',
        'Use a min-heap to merge both arrays lazily, popping (m+n)//2 + 1 times to reach the median',
        'Walk both arrays with two pointers simultaneously, advancing whichever is smaller, until reaching the midpoint count',
      ],
    },
    code: `class Solution:
    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:
        if len(nums1) > len(nums2):
            nums1, nums2 = nums2, nums1

        m, n = len(nums1), len(nums2)
        left, right = 0, m

        while left <= right:
            i = (left + right) // 2
            j = (m + n + 1) // 2 - i

            leftA = nums1[i - 1] if i > 0 else -math.inf
            rightA = nums1[i] if i < m else math.inf
            leftB = nums2[j - 1] if j > 0 else -math.inf
            rightB = nums2[j] if j < n else math.inf

            if leftA <= rightB and leftB <= rightA:
                if (m + n) % 2:
                    return max(leftA, leftB)
                return (max(leftA, leftB) + min(rightA, rightB)) / 2
            elif leftA > rightB:
                right = i - 1
            else:
                left = i + 1`,
    blanks: [9, 10, 17],
    time: { answer: 'O(log(min(m,n)))', choices: ['O(log(min(m,n)))', 'O(m+n)', 'O(log(m+n))', 'O((m+n) log(m+n))'], why: 'binary search runs only over the shorter array of length min(m,n)' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(m+n)', 'O(log(m+n))', 'O(m*n)'], why: 'only a handful of index and boundary variables are kept, nothing is merged' },
    sayIt: "Binary search the partition i in the shorter array, ==j = (m+n+1)//2 - i== fixes the other partition, check the four boundary values interleave, O(log(min(m,n))) time.",
    pitfall: 'Always binary search over the shorter array; searching the longer one can make j go negative or past its bounds.',
  },
  {
    id: 'thought:windows-search:split-array-largest-sum',
    lc: 410,
    title: 'Split Array Largest Sum',
    difficulty: 'Hard',
    category: 'windows-search',
    skills: ['binary-search'],
    companies: ['google', 'apple'],
    statement: `Given an array of non-negative integers and an integer k, split the array into k non-empty contiguous subarrays so as to minimize the largest sum among the subarrays.

The answer is monotonic in the "max allowed subarray sum" (a larger cap always needs fewer or equal groups), so binary search that cap between max(nums) and sum(nums), greedily counting how many groups a candidate cap requires.`,
    examples: [
      { input: 'nums = [7,2,5,10,8], k = 2', output: '18', explanation: 'split into [7,2,5] (sum 14) and [10,8] (sum 18), minimizing the larger of the two' },
    ],
    constraints: ['1 <= nums.length <= 1000', '0 <= nums[i] <= 10^6', '1 <= k <= min(50, nums.length)'],
    ds: {
      answer: 'binary search over the answer (candidate max subarray sum)',
      choices: ['binary search over the answer (candidate max subarray sum)', '2-D dp table of (prefix index, groups used)', 'greedily sort nums and distribute round-robin into k groups', 'prefix sum array + sliding window of fixed size k'],
    },
    method: {
      answer: "Binary search on the cap, bounded by [max(nums), sum(nums)]: greedily count groups needed with ==if current + num > limit: groups += 1; current = 0==, if groups fits within k shrink right, else push left up",
      choices: [
        "Binary search on the cap, bounded by [max(nums), sum(nums)]: greedily count groups needed with ==if current + num > limit: groups += 1; current = 0==, if groups fits within k shrink right, else push left up",
        '2-D DP where dp[i][j] is the best split of the first i elements into j groups, O(n^2 * k) time',
        'Sort nums descending and deal them round-robin into k buckets, then take the max bucket sum',
        'Linear scan trying every possible cap starting from max(nums) until one works',
      ],
    },
    code: `class Solution:
    def splitArray(self, nums: List[int], k: int) -> int:
        left, right = max(nums), sum(nums)

        def countGroups(limit):
            groups, current = 1, 0

            for num in nums:
                if current + num > limit:
                    groups += 1
                    current = 0
                current += num

            return groups

        while left < right:
            mid = (left + right) // 2

            if countGroups(mid) <= k:
                right = mid
            else:
                left = mid + 1

        return left`,
    blanks: [8, 16, 19],
    time: { answer: 'O(n log(sum))', choices: ['O(n log(sum))', 'O(n^2 * k)', 'O(n)', 'O(log(sum))'], why: 'binary search over the sum range, each check scanning all n elements once' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(n*k)', 'O(log(sum))'], why: 'no table is built, only a handful of counters across the binary search and the greedy count' },
    sayIt: "Binary search the cap in [max(nums), sum(nums)], greedily count groups with ==start a new group when current + num > limit==, fits within k means try smaller, O(n log(sum)) time, beats the O(n^2*k) DP.",
    pitfall: 'The lower bound must be max(nums), not 0, since no cap smaller than the single largest element could ever be valid.',
  },
  {
    id: 'thought:windows-search:time-based-key-value-store',
    lc: 981,
    title: 'Time Based Key-Value Store',
    difficulty: 'Medium',
    category: 'windows-search',
    skills: ['binary-search'],
    companies: ['amazon', 'bloomberg'],
    statement: `Design a time-based key-value store that stores multiple values for the same key at different timestamps, and can retrieve the value associated with a key at a given timestamp. If no exact timestamp match exists, return the value at the largest stored timestamp that is still <= the given timestamp; return "" if none exists.

Store each key's (timestamp, value) pairs in a list, appended in increasing timestamp order (since set() calls are guaranteed non-decreasing in time), and binary search that list for the latest entry not exceeding the query timestamp.`,
    examples: [
      { input: 'set("foo","bar",1); get("foo",1); get("foo",3)', output: '"bar", "bar"', explanation: 'no entry at timestamp 3, so it falls back to the latest entry at or before it, timestamp 1' },
      { input: 'set("foo","bar2",4); get("foo",4); get("foo",5)', output: '"bar2", "bar2"' },
    ],
    constraints: ['1 <= key.length, value.length <= 100', '1 <= timestamp <= 10^7', 'set calls per key are in strictly increasing order of timestamp'],
    ds: {
      answer: 'dd(list) of (timestamp, value) per key, binary searched',
      choices: ['dd(list) of (timestamp, value) per key, binary searched', 'dd(dict) mapping timestamp -> value per key, linear scanned on get', 'single sorted global list of (key, timestamp, value)', 'dd(list) per key, linear scanned backward on get'],
    },
    method: {
      answer: "Append-only per-key list in timestamp order, binary search on get: ==if entries[mid][0] <= timestamp: left = mid + 1==, else right = mid, then return ==entries[left-1][1] if left else \"\"==",
      choices: [
        "Append-only per-key list in timestamp order, binary search on get: ==if entries[mid][0] <= timestamp: left = mid + 1==, else right = mid, then return ==entries[left-1][1] if left else \"\"==",
        'Store a dict keyed by exact timestamp, and on get scan backward from the query timestamp to 0 until a key hits',
        'Keep entries sorted by value instead of timestamp, binary searching for the value directly',
        'Re-sort the full list of (timestamp, value) pairs on every get call before searching it',
      ],
    },
    code: `class TimeMap:
    def __init__(self):
        self.store = defaultdict(list)

    def set(self, key: str, value: str, timestamp: int) -> None:
        self.store[key].append((timestamp, value))

    def get(self, key: str, timestamp: int) -> str:
        entries = self.store[key]
        left, right = 0, len(entries)

        while left < right:
            mid = (left + right) // 2

            if entries[mid][0] <= timestamp:
                left = mid + 1
            else:
                right = mid

        return entries[left - 1][1] if left else ""`,
    blanks: [5, 14, 19],
    time: { answer: 'O(log n) per get, O(1) per set', choices: ['O(log n) per get, O(1) per set', 'O(n) per get, O(1) per set', 'O(log n) for both get and set', 'O(1) per get, O(log n) per set'], why: 'set just appends, get binary searches that key\'s list of entries' },
    space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'], why: 'every set call stores one more (timestamp, value) pair' },
    sayIt: "Append-only list per key since timestamps are non-decreasing, ==binary search for the rightmost timestamp <= query==, then read entries[left-1], O(log n) per get.",
    pitfall: 'Must handle left == 0 (no entry at or before the query timestamp) by returning "", not entries[-1].',
  },
  {
    id: 'thought:windows-search:find-first-and-last-position',
    lc: 34,
    title: 'Find First and Last Position of Element in Sorted Array',
    difficulty: 'Medium',
    category: 'windows-search',
    skills: ['binary-search'],
    companies: ['amazon', 'microsoft'],
    statement: `Given a sorted array of integers and a target, find the starting and ending position of the target's run. Return [-1,-1] if the target isn't present, in O(log n) time.

Run two separate binary searches: one biased to keep narrowing left after a match (finds the first occurrence), one biased to keep narrowing right after a match (finds the last occurrence).`,
    examples: [
      { input: 'nums = [5,7,7,8,8,10], target = 8', output: '[3,4]' },
      { input: 'nums = [5,7,7,8,8,10], target = 6', output: '[-1,-1]' },
    ],
    constraints: ['0 <= nums.length <= 10^5', 'nums is sorted in non-decreasing order'],
    ds: {
      answer: 'two biased binary searches (leftmost bound and rightmost bound)',
      choices: ['two biased binary searches (leftmost bound and rightmost bound)', 'one binary search for any match, then linear expand outward from it', 'linear scan tracking the first and last index where nums[i] == target', 'binary search for the first match, then binary search again starting just after it'],
    },
    method: {
      answer: 'Shared binary search parameterized by direction: on a match, record ==bound = mid==, then keep narrowing toward the first occurrence (==right = mid - 1==) or the last (left = mid + 1) depending on which bound is being sought',
      choices: [
        'Shared binary search parameterized by direction: on a match, record ==bound = mid==, then keep narrowing toward the first occurrence (==right = mid - 1==) or the last (left = mid + 1) depending on which bound is being sought',
        'Binary search for one match, then linearly scan left and right from it to find both ends of the run',
        'Linear scan once, tracking the first index seen and the last index seen where nums[i] == target',
        'Binary search for the first occurrence only, then add the count of target (found via another scan) to get the last',
      ],
    },
    code: `class Solution:
    def searchRange(self, nums: List[int], target: int) -> List[int]:
        def findBound(isFirst):
            left, right = 0, len(nums) - 1
            bound = -1

            while left <= right:
                mid = (left + right) // 2

                if nums[mid] == target:
                    bound = mid
                    if isFirst:
                        right = mid - 1
                    else:
                        left = mid + 1
                elif nums[mid] < target:
                    left = mid + 1
                else:
                    right = mid - 1

            return bound

        return [findBound(True), findBound(False)]`,
    blanks: [10, 12, 22],
    time: { answer: 'O(log n)', choices: ['O(log n)', 'O(n)', 'O(n log n)', 'O(1)'], why: 'two independent binary searches, each halving the range every iteration' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], why: 'only a handful of index variables are kept per search' },
    sayIt: "Two biased binary searches sharing one helper: on a match, ==record bound = mid==, then keep narrowing left for the first occurrence or right for the last, O(log n) total.",
    pitfall: 'The direction only affects which side keeps narrowing after a match; the elif/else branches for non-matches stay the same in both directions.',
  },
  {
    id: 'thought:windows-search:kth-smallest-in-sorted-matrix',
    lc: 378,
    title: 'Kth Smallest Element in a Sorted Matrix',
    difficulty: 'Medium',
    category: 'windows-search',
    skills: ['binary-search'],
    companies: ['google', 'amazon'],
    statement: `Given an n x n matrix where every row and every column is sorted ascending, find the kth smallest element in the matrix (counting duplicates).

Binary search on the value range [matrix[0][0], matrix[n-1][n-1]] instead of on index. For a candidate value, count how many entries are <= it in O(n) by walking from the bottom-left corner: moving right when the current cell qualifies, moving up when it doesn't.`,
    examples: [
      { input: 'matrix = [[1,5,9],[10,11,13],[12,13,15]], k = 8', output: '13' },
    ],
    constraints: ['n == matrix.length == matrix[i].length', '1 <= n <= 300', 'rows and columns are both sorted ascending'],
    ds: {
      answer: 'binary search over the value range + staircase count',
      choices: ['binary search over the value range + staircase count', 'min-heap of the first element of every row, popped n times', 'flatten the matrix, sort it, and index k-1', 'merge all n sorted rows with a k-way merge, stopping at the kth pop'],
    },
    method: {
      answer: "Binary search on value: ==count += row + 1== whenever a cell qualifies (walking from the bottom-left, moving right on qualify, up otherwise), if countLessEqual(mid) < k push left up, else shrink right to mid",
      choices: [
        "Binary search on value: ==count += row + 1== whenever a cell qualifies (walking from the bottom-left, moving right on qualify, up otherwise), if countLessEqual(mid) < k push left up, else shrink right to mid",
        'Flatten the whole matrix into a list, sort it with O(n^2 log n), and index k-1',
        'Min-heap of the first element of every row, popping and pushing the next element from that row\'s column, k times',
        'Binary search on the value range but count qualifying cells with a nested loop checking every single cell every time',
      ],
    },
    code: `class Solution:
    def kthSmallest(self, matrix: List[List[int]], k: int) -> int:
        n = len(matrix)
        left, right = matrix[0][0], matrix[n - 1][n - 1]

        def countLessEqual(mid):
            count = 0
            row, col = n - 1, 0

            while row >= 0 and col < n:
                if matrix[row][col] <= mid:
                    count += row + 1
                    col += 1
                else:
                    row -= 1

            return count

        while left < right:
            mid = (left + right) // 2

            if countLessEqual(mid) < k:
                left = mid + 1
            else:
                right = mid

        return left`,
    blanks: [11, 21, 24],
    time: { answer: 'O(n log(max-min))', choices: ['O(n log(max-min))', 'O(n^2 log n)', 'O(n^2)', 'O(n log n)'], why: 'binary search over the value range, each count pass walking the staircase in O(n)' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(n^2)', 'O(log n)'], why: 'only the binary search bounds and the staircase walk counters are kept' },
    sayIt: "Binary search the value, counting with a bottom-left staircase walk, ==count += row + 1 when the cell qualifies==, then narrow based on count vs k, O(n log(max-min)) time.",
    pitfall: 'The staircase count walk must start at the bottom-left corner (row n-1, col 0), not the top-left, for the move-right/move-up logic to be correct.',
  },
  {
    id: 'thought:windows-search:search-in-rotated-sorted-array-ii',
    lc: 81,
    title: 'Search in Rotated Sorted Array II',
    difficulty: 'Medium',
    category: 'windows-search',
    skills: ['binary-search'],
    companies: ['amazon', 'microsoft'],
    statement: `Same as Search in Rotated Sorted Array, except this array may contain duplicate values. Determine whether target exists in the array.

Duplicates break the "one half is always sorted" guarantee when nums[left] == nums[mid] == nums[right], since you can't tell which side is rotated; in that one case, shrink both ends by one and keep going, which only costs O(n) worst case instead of O(log n).`,
    examples: [
      { input: 'nums = [2,5,6,0,0,1,2], target = 0', output: 'true' },
      { input: 'nums = [2,5,6,0,0,1,2], target = 3', output: 'false' },
    ],
    constraints: ['1 <= nums.length <= 5000', 'nums is rotated at some pivot, may contain duplicates'],
    ds: {
      answer: 'modified binary search with a duplicate-collision fallback',
      choices: ['modified binary search with a duplicate-collision fallback', 'remove duplicates first, then run the duplicate-free rotated binary search', 'linear scan checking every element', 'sort a copy of the array and binary search that, losing the rotation info'],
    },
    method: {
      answer: "Same as rotated binary search, but first handle the ambiguous case: ==if nums[left] == nums[mid] == nums[right]: left += 1; right -= 1==, otherwise fall through to the usual sorted-half check",
      choices: [
        "Same as rotated binary search, but first handle the ambiguous case: ==if nums[left] == nums[mid] == nums[right]: left += 1; right -= 1==, otherwise fall through to the usual sorted-half check",
        'Deduplicate the array into a set first, then it is no longer safe to reason about rotation at all',
        'Linear scan from index 0 comparing every element to target directly',
        'Ignore duplicates and run the exact same logic as the no-duplicates version, since it still mostly works',
      ],
    },
    code: `class Solution:
    def search(self, nums: List[int], target: int) -> bool:
        left, right = 0, len(nums) - 1

        while left <= right:
            mid = (left + right) // 2

            if nums[mid] == target:
                return True

            if nums[left] == nums[mid] == nums[right]:
                left += 1
                right -= 1
            elif nums[left] <= nums[mid]:
                if nums[left] <= target < nums[mid]:
                    right = mid - 1
                else:
                    left = mid + 1
            else:
                if nums[mid] < target <= nums[right]:
                    left = mid + 1
                else:
                    right = mid - 1

        return False`,
    blanks: [10, 13, 19],
    time: { answer: 'O(n) worst case', choices: ['O(n) worst case', 'O(log n) always', 'O(n log n)', 'O(n^2)'], why: 'a sequence of nums[left] == nums[mid] == nums[right] collisions can force shrinking by one from each end' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], why: 'only left, right, and mid index variables are kept' },
    sayIt: "Same rotated binary search, but first peel off the ambiguous case, ==nums[left] == nums[mid] == nums[right] shrinks both ends by one==, otherwise the usual sorted-half check applies, O(n) worst case because of duplicates.",
    pitfall: 'Without the triple-equal check, duplicates can make both "halves" look sorted when they are not, causing the search to discard the half actually containing target.',
  },

  {
    id: 'thought:windows-search:find-all-anagrams',
    lc: 438,
    title: 'Find All Anagrams in a String',
    difficulty: 'Medium',
    category: 'windows-search',
    skills: ['sliding-window', 'arrays-hashing'],
    companies: ['meta', 'amazon', 'microsoft'],
    statement: `Given strings s and p, return every start index in s where a substring of length len(p) is an anagram of p.

An anagram has exactly the same letters with the same counts, in any order.`,
    examples: [
      { input: "s = 'cbaebabacd', p = 'abc'", output: '[0, 6]' },
    ],
    constraints: ['1 <= s.length, p.length <= 3 * 10^4', 'lowercase English letters'],
    ds: {
      answer: 'Counter of p + Counter of the current window',
      choices: [
        'Counter of p + Counter of the current window',
        'sorted copy of p only',
        'min-heap of the window letters',
        'stack of the last len(p) letters',
      ],
    },
    method: {
      answer: "Slide a ==fixed-size window==: add the new right letter, remove the leaving one, record the start when the window ==counter equals== p's counter",
      choices: [
        "Slide a ==fixed-size window==: add the new right letter, remove the leaving one, record the start when the window ==counter equals== p's counter",
        'Sort every substring of length len(p) and compare to sorted p',
        'Two pointers that move inward from both ends',
        'Binary search the start index of the anagram',
      ],
    },
    code: `class Solution:
    def findAnagrams(self, s, p):
        if len(p) > len(s):
            return []
        need = Counter(p)
        window = Counter(s[:len(p)])
        result = [0] if window == need else []
        for right in range(len(p), len(s)):
            window[s[right]] += 1
            leaving = s[right - len(p)]
            window[leaving] -= 1
            if window[leaving] == 0:
                del window[leaving]
            if window == need:
                result.append(right - len(p) + 1)
        return result`,
    blanks: [4, 5, 8, 10, 14],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n * m log m)', 'O(n * m)', 'O(n^2)'], why: 'one pass; comparing two counters of at most 26 letters is constant' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(m)', 'O(n * m)'], why: 'counters hold at most 26 keys' },
    sayIt: '==Fixed-size window== of len(p): add the right letter, drop the leaving one, compare the ==two letter counters==; equal means an anagram starts there. O(n).',
    pitfall: 'Window start index is right - len(p) + 1, an easy off-by-one when appending.',
  },

  {
    id: 'thought:windows-search:shortest-subarray-sum-at-least-k',
    lc: 862,
    title: 'Shortest Subarray with Sum at Least K',
    difficulty: 'Hard',
    category: 'windows-search',
    skills: ['prefix-sum', 'queue-deque', 'monotonic-stack'],
    companies: ['google', 'amazon'],
    statement: `Given an integer array nums that may contain negatives and an integer k, return the length of the shortest non-empty subarray whose sum is at least k, or -1 if none exists.

Because of the negatives, a normal grow-and-shrink window does not work.`,
    examples: [
      { input: 'nums = [2,-1,2], k = 3', output: '3' },
      { input: 'nums = [1], k = 1', output: '1' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^5 <= nums[i] <= 10^5', '1 <= k <= 10^9'],
    ds: {
      answer: 'prefix sum array + deque of indices with increasing prefix values',
      choices: [
        'prefix sum array + deque of indices with increasing prefix values',
        'min-heap of (sum, index)',
        'hashmap of prefix sum -> first index',
        'stack of subarray sums',
      ],
    },
    method: {
      answer: 'Pop the deque ==front== while prefix[j] - prefix[front] >= k to record lengths, and pop the ==back== while its prefix >= prefix[j]',
      choices: [
        'Pop the deque ==front== while prefix[j] - prefix[front] >= k to record lengths, and pop the ==back== while its prefix >= prefix[j]',
        'Two pointers: grow right, shrink left while the sum stays at least k',
        'Binary search the length and verify each length with a window',
        'Sort the prefix sums and pair adjacent ones',
      ],
    },
    code: `class Solution:
    def shortestSubarray(self, nums, k):
        prefix = [0]
        for num in nums:
            prefix.append(prefix[-1] + num)
        best = len(nums) + 1
        window = deque()
        for right, total in enumerate(prefix):
            while window and total - prefix[window[0]] >= k:
                best = min(best, right - window.popleft())
            while window and prefix[window[-1]] >= total:
                window.pop()
            window.append(right)
        return best if best <= len(nums) else -1`,
    blanks: [4, 8, 9, 10, 12],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(n * k)'], why: 'each index enters and leaves the deque once' },
    space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(k)', 'O(log n)'], why: 'prefix array and deque' },
    sayIt: 'Build prefix sums and keep a ==monotonic deque== of indices: pop the ==front== when the sum reaches k (record length), pop the ==back== when its prefix is not smaller. O(n).',
    pitfall: 'A two-pointer window assumes non-negative values and silently returns wrong answers here.',
  },

  {
    id: 'thought:windows-search:min-days-m-bouquets',
    lc: 1482,
    title: 'Minimum Number of Days to Make m Bouquets',
    difficulty: 'Medium',
    category: 'windows-search',
    skills: ['binary-search', 'greedy'],
    companies: ['amazon', 'google'],
    statement: `bloomDay[i] is the day flower i blooms. A bouquet needs k adjacent bloomed flowers and each flower can be used once. Return the minimum number of days to make m bouquets, or -1 if impossible.`,
    examples: [
      { input: 'bloomDay = [1,10,3,10,2], m = 3, k = 1', output: '3' },
      { input: 'bloomDay = [1,10,3,10,2], m = 3, k = 2', output: '-1' },
    ],
    constraints: ['1 <= bloomDay.length <= 10^5', '1 <= bloomDay[i] <= 10^9', '1 <= m <= 10^6, 1 <= k <= n'],
    ds: {
      answer: 'binary search bounds over days + a feasibility function scanning the array',
      choices: [
        'binary search bounds over days + a feasibility function scanning the array',
        'min-heap of bloom days',
        'prefix sum array of bloom days',
        'hashmap of day -> flower index',
      ],
    },
    method: {
      answer: '==Binary search the answer== day; ==feasibility check== scans for runs of k bloomed flowers and counts bouquets, shrinking high if m is reached',
      choices: [
        '==Binary search the answer== day; ==feasibility check== scans for runs of k bloomed flowers and counts bouquets, shrinking high if m is reached',
        'Try every day from 1 up and stop at the first that works',
        'Sort the flowers and take the m * k smallest days',
        'Sliding window of size k over the sorted bloom days',
      ],
    },
    code: `class Solution:
    def minDays(self, bloomDay, m, k):
        if m * k > len(bloomDay):
            return -1

        def canMake(day):
            bouquets = run = 0
            for bloom in bloomDay:
                if bloom <= day:
                    run += 1
                    if run == k:
                        bouquets += 1
                        run = 0
                else:
                    run = 0
            return bouquets >= m

        low, high = min(bloomDay), max(bloomDay)
        while low < high:
            mid = (low + high) // 2
            if canMake(mid):
                high = mid
            else:
                low = mid + 1
        return low`,
    blanks: [2, 8, 11, 6, 20],
    time: { answer: 'O(n log max)', choices: ['O(n log max)', 'O(n)', 'O(n^2)', 'O(n log n)'], why: 'log of the day range iterations, each an O(n) scan' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(log n)', 'O(m)'], why: 'only counters inside the check' },
    sayIt: 'If day d works, any later day works: ==binary search the day==. Check = count runs of ==k adjacent bloomed flowers==, resetting after each bouquet or unbloomed flower. O(n log max).',
    pitfall: 'Not resetting the run after completing a bouquet reuses the same flowers.',
  },
]

export default {
  id: 'windows-search',
  title: 'Sliding window & binary search',
  icon: 'window',
  items,
}
