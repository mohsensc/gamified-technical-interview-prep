const items = [
  {
    id: 'thought:arrays-pointers:two-sum',
    lc: 1,
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'arrays-pointers',
    skills: ['arrays-hashing'],
    companies: ['amazon', 'google', 'meta', 'microsoft'],
    statement: `You're given an array of integers and a target value. Find the indices of the two numbers that add up to exactly the target.

Each input has exactly one valid pair, you can't reuse the same element twice, and the order of the two indices in your answer doesn't matter.`,
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' },
    ],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i], target <= 10^9', 'exactly one valid answer exists'],
    ds: {
      answer: 'dict mapping value -> index seen so far',
      choices: ['dict mapping value -> index seen so far', 'sorted copy of nums + two pointers', 'set() of values only, no indices', 'min-heap of (value, index)'],
    },
    method: {
      answer: 'One pass, check the complement first: ==if target - num in seen: return [seen[target-num], i]==, then record num after',
      choices: [
        'One pass, check the complement first: ==if target - num in seen: return [seen[target-num], i]==, then record num after',
        'Sort the array, use two pointers from both ends, then map back to original indices',
        'Brute force nested loop checking every pair, no hashmap at all',
        'Record every value into the map first, then do a second pass checking complements',
      ],
    },
    code: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}

        for i, num in enumerate(nums):
            if target - num in seen:
                return [seen[target - num], i]
            seen[num] = i

        return []`,
    blanks: [5, 6, 7],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(1)'], why: 'single pass, O(1) dict lookup and insert per element' },
    space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(n^2)', 'O(log n)'], why: 'the seen dict can hold up to n-1 entries' },
    sayIt: "I check the complement before inserting: ==if target - num in seen: return the pair==, otherwise record num, O(n) time with a single pass.",
    pitfall: 'Must check the complement before adding the current number, or a number could pair with itself.',
  },
  {
    id: 'thought:arrays-pointers:top-k-frequent-elements',
    lc: 347,
    title: 'Top K Frequent Elements',
    difficulty: 'Medium',
    category: 'arrays-pointers',
    skills: ['arrays-hashing'],
    companies: ['amazon', 'google', 'meta'],
    statement: `Given an array of integers, return the k most frequent elements, in any order.

Aim for better than O(n log n).`,
    examples: [
      { input: 'nums = [1,1,1,2,2,3], k = 2', output: '[1,2]', explanation: '1 appears 3 times, 2 appears twice, 3 appears once' },
    ],
    constraints: ['1 <= nums.length <= 10^5', 'k is in the range [1, number of distinct elements]'],
    ds: {
      answer: 'frequency Counter + bucket array indexed by count',
      choices: ['frequency Counter + bucket array indexed by count', 'min-heap of size k over (count, value)', 'sorted list of (value, count) pairs', 'dict only, no bucket or heap'],
    },
    method: {
      answer: "Bucket sort by frequency: ==buckets[freq].append(num)==, then walk buckets from the highest frequency down, collecting values until k are taken",
      choices: [
        "Bucket sort by frequency: ==buckets[freq].append(num)==, then walk buckets from the highest frequency down, collecting values until k are taken",
        'Sort all (value, count) pairs by count descending and slice the first k',
        'Maintain a min-heap of size k, pushing every (count, value) and popping whenever the heap exceeds k',
        'Just return the k values with the smallest value, ignoring frequency entirely',
      ],
    },
    code: `class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        counts = Counter(nums)
        buckets = [[] for _ in range(len(nums) + 1)]

        for num, freq in counts.items():
            buckets[freq].append(num)

        result = []
        for freq in range(len(buckets) - 1, 0, -1):
            for num in buckets[freq]:
                result.append(num)
                if len(result) == k:
                    return result

        return result`,
    blanks: [6, 11, 12],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n log k)', 'O(n^2)'], why: 'counting is O(n), bucket array has n+1 slots, each number visited once' },
    space: { answer: 'O(n)', choices: ['O(n)', 'O(k)', 'O(1)', 'O(log n)'], why: 'the counts dict and the bucket array both scale with n' },
    sayIt: "I bucket numbers by frequency, ==buckets[freq].append(num)==, then walk buckets high-to-low collecting until I have k, O(n) time beats a heap's O(n log k).",
    pitfall: 'Bucket array needs len(nums) + 1 slots since frequency can equal len(nums).',
  },
  {
    id: 'thought:arrays-pointers:product-of-array-except-self',
    lc: 238,
    title: 'Product of Array Except Self',
    difficulty: 'Medium',
    category: 'arrays-pointers',
    skills: ['prefix-sum'],
    companies: ['amazon', 'meta', 'microsoft'],
    statement: `Given an array of integers, return an array where each index holds the product of every other element except the one at that index.

You can't use division, and it should run in O(n) time.`,
    examples: [
      { input: 'nums = [1,2,3,4]', output: '[24,12,8,6]', explanation: 'result[0] = 2*3*4, result[1] = 1*3*4, and so on' },
    ],
    constraints: ['2 <= nums.length <= 10^5', 'product of any prefix/suffix fits in a 32-bit int'],
    ds: {
      answer: 'output array reused as both prefix and postfix accumulator',
      choices: ['output array reused as both prefix and postfix accumulator', 'two separate full-size prefix and postfix arrays', 'a running total with division at the end', 'a 2-D table of partial products'],
    },
    method: {
      answer: 'Two passes over one output array: left-to-right store ==running prefix product==, then right-to-left multiply in the ==running postfix product==',
      choices: [
        'Two passes over one output array: left-to-right store ==running prefix product==, then right-to-left multiply in the ==running postfix product==',
        'Compute the total product once, then divide it by each element',
        'Build two full separate prefix and postfix arrays, then multiply them index by index into a third array',
        'Single pass computing a running product and dividing out the current element each time',
      ],
    },
    code: `class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        n = len(nums)
        result = [1] * n

        prefix = 1
        for i in range(n):
            result[i] = prefix
            prefix *= nums[i]

        postfix = 1
        for i in range(n - 1, -1, -1):
            result[i] *= postfix
            postfix *= nums[i]

        return result`,
    blanks: [7, 8, 12],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(1)'], why: 'exactly two linear passes over the array' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(n^2)', 'O(log n)'], why: 'only the output array is used, which does not count as extra space' },
    sayIt: "Left pass fills ==result[i] = running prefix product==, right pass multiplies in the ==running postfix product==, O(n) time, O(1) extra space, no division.",
    pitfall: 'Division breaks on zero elements; the two-pass accumulation avoids that entirely.',
  },
  {
    id: 'thought:arrays-pointers:longest-consecutive-sequence',
    lc: 128,
    title: 'Longest Consecutive Sequence',
    difficulty: 'Medium',
    category: 'arrays-pointers',
    skills: ['arrays-hashing'],
    companies: ['amazon', 'google', 'meta'],
    statement: `Given an unsorted array of integers, find the length of the longest run of consecutive integers, such as [3,4,5,6].

The array isn't sorted, and it should run in O(n) time.`,
    examples: [
      { input: 'nums = [100,4,200,1,3,2]', output: '4', explanation: 'the run [1,2,3,4] has length 4' },
    ],
    constraints: ['0 <= nums.length <= 10^5', '-10^9 <= nums[i] <= 10^9'],
    ds: {
      answer: 'set() of all values, only expand from run starts',
      choices: ['set() of all values, only expand from run starts', 'sorted array + single linear scan', 'dict counting occurrences of each value', 'union-find over consecutive values'],
    },
    method: {
      answer: "Only start counting from a run's beginning: ==skip num if num - 1 is also in the set==, otherwise extend forward while num + length is present",
      choices: [
        "Only start counting from a run's beginning: ==skip num if num - 1 is also in the set==, otherwise extend forward while num + length is present",
        'Sort the array once, then do a single linear scan tracking the current run length',
        'For every number, walk both directions from it every time, without checking whether it is a run start',
        'Use a union-find structure, unioning every pair of consecutive values found while scanning',
      ],
    },
    code: `class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        numSet = set(nums)
        longest = 0

        for num in numSet:
            if num - 1 in numSet:
                continue

            length = 1
            while num + length in numSet:
                length += 1

            longest = max(longest, length)

        return longest`,
    blanks: [6, 10, 13],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(n^2 log n)'], why: 'each number is only ever the inner loop start for one run, so total work across all runs is O(n)' },
    space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(log n)', 'O(n log n)'], why: 'the hash set stores every distinct value' },
    sayIt: "I only expand from a run's start, ==skip num if num-1 is in the set==, so every number is visited at most twice total, O(n) time.",
    pitfall: 'Without the num-1 check, the while loop re-walks every run from every element, degrading to O(n^2).',
  },
  {
    id: 'thought:arrays-pointers:valid-sudoku',
    lc: 36,
    title: 'Valid Sudoku',
    difficulty: 'Medium',
    category: 'arrays-pointers',
    skills: ['arrays-hashing'],
    companies: ['amazon', 'microsoft'],
    statement: `Given a 9x9 Sudoku board, partially filled, determine whether the digits currently placed satisfy the rules: each row, each column, and each of the nine 3x3 boxes must contain each digit 1-9 at most once.

You only need to validate the digits already placed, not solve the board or confirm it's completable.`,
    examples: [
      { input: 'board with no row/col/box repeats among its filled cells', output: 'true' },
      { input: 'board with "8" repeated in the top-left 3x3 box', output: 'false' },
    ],
    constraints: ['board.length == 9', 'board[i].length == 9', "board[i][j] is a digit '1'-'9' or '.'"],
    ds: {
      answer: 'three dd(set): rows, cols, and 3x3 boxes',
      choices: ['three dd(set): rows, cols, and 3x3 boxes', 'a single 9x9 boolean grid', 'one flat set() of every (row, col, val) seen', 'sorted list per row compared pairwise'],
    },
    method: {
      answer: "Single scan of all 81 cells: skip '.', else check ==val in rows[r] or val in cols[c] or val in boxes[(r//3,c//3)]==, return False on any hit, else record val in all three",
      choices: [
        "Single scan of all 81 cells: skip '.', else check ==val in rows[r] or val in cols[c] or val in boxes[(r//3,c//3)]==, return False on any hit, else record val in all three",
        'Extract each row, column, and box into a list, then check len(list) == len(set(list)) for each',
        'Only check rows and columns, since a valid row/column pairing implies a valid box',
        'Sort each row and scan for adjacent equal non-dot characters',
      ],
    },
    code: `class Solution:
    def isValidSudoku(self, board: List[List[str]]) -> bool:
        rows = defaultdict(set)
        cols = defaultdict(set)
        boxes = defaultdict(set)

        for r in range(9):
            for c in range(9):
                val = board[r][c]
                if val == ".":
                    continue

                boxId = (r // 3, c // 3)
                if val in rows[r] or val in cols[c] or val in boxes[boxId]:
                    return False

                rows[r].add(val)
                cols[c].add(val)
                boxes[boxId].add(val)

        return True`,
    blanks: [13, 16, 18],
    time: { answer: 'O(1)', choices: ['O(1)', 'O(n^2)', 'O(n log n)', 'O(n^3)'], why: 'board is fixed at 81 cells, so the work is bounded by a constant' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(n^2)', 'O(log n)'], why: 'at most 9 rows, 9 cols, 9 boxes, each holding at most 9 digits' },
    sayIt: "One scan of all 81 cells, checking ==val in rows[r] or cols[c] or boxes[boxId]== before recording it in all three, O(1) since the board size is fixed.",
    pitfall: "The box key must be (r // 3, c // 3), not r // 3 and c // 3 checked separately.",
  },
  {
    id: 'thought:arrays-pointers:3sum',
    lc: 15,
    title: '3Sum',
    difficulty: 'Medium',
    category: 'arrays-pointers',
    skills: ['two-pointers'],
    companies: ['amazon', 'meta', 'microsoft', 'google'],
    statement: `Given an array of integers, find all unique triplets that sum to zero. The solution set must not contain duplicate triplets.`,
    examples: [
      { input: 'nums = [-1,0,1,2,-1,-4]', output: '[[-1,-1,2],[-1,0,1]]' },
    ],
    constraints: ['3 <= nums.length <= 3000', '-10^5 <= nums[i] <= 10^5'],
    ds: {
      answer: 'sorted array + two pointers per fixed index i',
      choices: ['sorted array + two pointers per fixed index i', 'hash set of all pairs seen, checked against -nums[i]', 'nested triple loop with a seen-set of sorted tuples', 'min-heap of partial sums'],
    },
    method: {
      answer: 'Sort, then fix i and two-pointer the rest: ==left, right = i+1, len(nums)-1==, move left up if the sum is too small, right down if too big, record and skip duplicates on a match',
      choices: [
        'Sort, then fix i and two-pointer the rest: ==left, right = i+1, len(nums)-1==, move left up if the sum is too small, right down if too big, record and skip duplicates on a match',
        'Brute-force triple nested loop over all i, j, k, de-duplicating triplets with a set at the end',
        'Hash every pair sum into a dict, then for each i look up whether -nums[i] was ever a pair sum',
        'Sort the array and only check adjacent triplets, since the array is sorted',
      ],
    },
    code: `class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        nums.sort()
        result = []

        for i in range(len(nums)):
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
                    while left < right and nums[left] == nums[left - 1]:
                        left += 1

        return result`,
    blanks: [11, 17, 19],
    time: { answer: 'O(n^2)', choices: ['O(n^2)', 'O(n log n)', 'O(n^3)', 'O(n)'], why: 'O(n log n) sort plus an O(n) two-pointer scan for each of the n starting indices' },
    space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(n^2)', 'O(log n)'], why: 'the sort is in place but the result list can hold O(n) triplets; some sorts use O(n) auxiliary space' },
    sayIt: "Sort, fix i, two-pointer the rest with ==left, right = i+1, len(nums)-1==, skipping duplicate values at every level, O(n^2) time.",
    pitfall: 'Must skip duplicate values for i and for left after a match, or the result has repeated triplets.',
  },
  {
    id: 'thought:arrays-pointers:container-with-most-water',
    lc: 11,
    title: 'Container With Most Water',
    difficulty: 'Medium',
    category: 'arrays-pointers',
    skills: ['two-pointers'],
    companies: ['amazon', 'meta', 'google', 'bloomberg'],
    statement: `Given an array of heights, each pair of indices forms a container whose capacity is the distance between them times the shorter of the two heights. Find the maximum capacity over all pairs.`,
    examples: [
      { input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49', explanation: 'lines at index 1 (height 8) and index 8 (height 7), width 7, capacity 7*7=49' },
    ],
    constraints: ['2 <= height.length <= 10^5', '0 <= height[i] <= 10^4'],
    ds: {
      answer: 'two pointers at both ends, moved inward',
      choices: ['two pointers at both ends, moved inward', 'monotonic stack of (index, height)', 'sorted list of heights with original indices', 'prefix max / suffix max arrays'],
    },
    method: {
      answer: 'Two pointers from both ends: track ==best = max(best, width * min(height[left], height[right]))==, then always move the pointer at the shorter height inward',
      choices: [
        'Two pointers from both ends: track ==best = max(best, width * min(height[left], height[right]))==, then always move the pointer at the shorter height inward',
        'Brute force checking every pair of indices and their capacity',
        'Always move the taller pointer inward, hoping to find an even taller wall',
        'Sort the heights, then pair the two tallest remaining heights at each step',
      ],
    },
    code: `class Solution:
    def maxArea(self, height: List[int]) -> int:
        left, right = 0, len(height) - 1
        best = 0

        while left < right:
            width = right - left
            best = max(best, width * min(height[left], height[right]))

            if height[left] < height[right]:
                left += 1
            else:
                right -= 1

        return best`,
    blanks: [7, 9, 12],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(1)'], why: 'the two pointers each move inward at most n times total' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'], why: 'only a few pointer and best-so-far variables are kept' },
    sayIt: "I track ==best = max(best, width * min(height[left], height[right]))== and always step the shorter wall inward, since it was the bottleneck, O(n) time.",
    pitfall: 'Moving the taller pointer can never improve the answer and risks missing the optimum.',
  },
  {
    id: 'thought:arrays-pointers:trapping-rain-water',
    lc: 42,
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    category: 'arrays-pointers',
    skills: ['two-pointers'],
    companies: ['amazon', 'google', 'meta', 'microsoft'],
    statement: `Given an array representing an elevation map, compute how much water it can trap after raining.`,
    examples: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6' },
    ],
    constraints: ['1 <= height.length <= 2 * 10^4', '0 <= height[i] <= 10^5'],
    ds: {
      answer: 'two pointers at both ends, two rolling running-max vars',
      choices: ['two pointers at both ends, two rolling running-max vars', 'full left-max and right-max arrays, then one pass over both', 'monotonic decreasing stack of (index, height)', 'prefix sum array of heights'],
    },
    method: {
      answer: 'Two pointers inward, always process the side with the smaller running max: ==if leftMax < rightMax: water += leftMax - height[left]==, else the mirrored case on the right',
      choices: [
        'Two pointers inward, always process the side with the smaller running max: ==if leftMax < rightMax: water += leftMax - height[left]==, else the mirrored case on the right',
        'Build full leftMax and rightMax arrays first, then sum min(leftMax[i], rightMax[i]) - height[i] over every index',
        'Use a monotonic decreasing stack, popping and computing trapped water in bounded layers whenever a taller bar appears',
        'Always process the taller side first since it determines the final water level',
      ],
    },
    code: `class Solution:
    def trap(self, height: List[int]) -> int:
        left, right = 0, len(height) - 1
        leftMax, rightMax = 0, 0
        water = 0

        while left < right:
            leftMax = max(leftMax, height[left])
            rightMax = max(rightMax, height[right])

            if leftMax < rightMax:
                water += leftMax - height[left]
                left += 1
            else:
                water += rightMax - height[right]
                right -= 1

        return water`,
    blanks: [10, 11, 14],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(1)'], why: 'single pass, the two pointers meet after at most n total steps' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'], why: 'only the two pointers and two running max variables are kept, no arrays' },
    sayIt: "I process whichever side has the smaller running max, ==water += leftMax - height[left]== (or the mirrored right case), O(n) time, O(1) space, no left/right-max arrays needed.",
    pitfall: 'The two-pointer trick only works because the side with the smaller running max is guaranteed bounded by it; mixing up leftMax/rightMax breaks correctness.',
  },
  {
    id: 'thought:arrays-pointers:sort-colors',
    lc: 75,
    title: 'Sort Colors',
    difficulty: 'Medium',
    category: 'arrays-pointers',
    skills: ['two-pointers'],
    companies: ['amazon', 'microsoft', 'meta'],
    statement: `Given an array with only the values 0, 1, and 2, sort it in place in one pass, without using a library sort.`,
    examples: [
      { input: 'nums = [2,0,2,1,1,0]', output: '[0,0,1,1,2,2]' },
    ],
    constraints: ['n == nums.length', '1 <= n <= 300', "nums[i] is 0, 1, or 2"],
    ds: {
      answer: 'three pointers: low, mid, high (Dutch flag partition)',
      choices: ['three pointers: low, mid, high (Dutch flag partition)', 'Counter of 0/1/2 then overwrite the array', 'two pointers only, one from each end', 'min-heap of the three values'],
    },
    method: {
      answer: "One pass with low/mid/high: ==a 0 at mid swaps to low and both advance==, a 1 just advances mid, a 2 swaps to high and only high shrinks",
      choices: [
        "One pass with low/mid/high: ==a 0 at mid swaps to low and both advance==, a 1 just advances mid, a 2 swaps to high and only high shrinks",
        'Count the 0s, 1s, and 2s in one pass, then overwrite the array with that many of each value in order',
        'Bubble sort style repeated adjacent swaps until the array is sorted',
        'Two pointers from both ends swapping 0s to the front and 2s to the back, ignoring 1s entirely',
      ],
    },
    code: `class Solution:
    def sortColors(self, nums: List[int]) -> None:
        low, mid, high = 0, 0, len(nums) - 1

        while mid <= high:
            if nums[mid] == 0:
                nums[low], nums[mid] = nums[mid], nums[low]
                low += 1
                mid += 1
            elif nums[mid] == 1:
                mid += 1
            else:
                nums[mid], nums[high] = nums[high], nums[mid]
                high -= 1`,
    blanks: [6, 10, 12],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(1)'], why: 'mid only moves forward or high only moves backward each iteration, so one pass total' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'], why: 'sorted in place with three index variables, no extra array' },
    sayIt: "Three pointers, ==low/mid/high==: a 0 swaps to low and both advance, a 1 just advances mid, a 2 swaps to high and only high shrinks (mid must recheck), one pass O(n).",
    pitfall: 'After swapping a 2 to high, mid must NOT advance yet, since the swapped-in value is still unchecked.',
  },
  {
    id: 'thought:arrays-pointers:move-zeroes',
    lc: 283,
    title: 'Move Zeroes',
    difficulty: 'Easy',
    category: 'arrays-pointers',
    skills: ['two-pointers'],
    companies: ['amazon', 'meta'],
    statement: `Given an array, move all 0s to the end while keeping the relative order of the non-zero elements, doing it in place without making a copy.`,
    examples: [
      { input: 'nums = [0,1,0,3,12]', output: '[1,3,12,0,0]' },
    ],
    constraints: ['1 <= nums.length <= 10^4', '-2^31 <= nums[i] <= 2^31 - 1'],
    ds: {
      answer: 'single write-pointer (insertPos), in place',
      choices: ['single write-pointer (insertPos), in place', 'new output array of the same size, then copy back', 'two pointers from both ends swapping zeros outward', 'sort the array by (value == 0) as the key'],
    },
    method: {
      answer: "Write-pointer pass: ==if num != 0: nums[insertPos] = num; insertPos += 1==, then fill everything from insertPos to the end with 0",
      choices: [
        "Write-pointer pass: ==if num != 0: nums[insertPos] = num; insertPos += 1==, then fill everything from insertPos to the end with 0",
        'Build a new list of the non-zero values followed by the zeros, then copy it back into nums',
        'Swap every zero found directly with the next non-zero found scanning from the opposite end',
        'Use nums.remove(0) repeatedly until no zeros remain, then append zeros at the end',
      ],
    },
    code: `class Solution:
    def moveZeroes(self, nums: List[int]) -> None:
        insertPos = 0

        for num in nums:
            if num != 0:
                nums[insertPos] = num
                insertPos += 1

        for i in range(insertPos, len(nums)):
            nums[i] = 0`,
    blanks: [6, 7, 10],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(1)'], why: 'two linear passes over the array, one to compact and one to zero the tail' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'], why: 'rearranged in place with a single index variable' },
    sayIt: "One pass, ==if num != 0: write it to insertPos and advance==, then zero out the rest from insertPos on, O(n) time, O(1) space, in place.",
    pitfall: 'Must zero-fill the tail after the compaction pass, not during it, or you overwrite values not yet read.',
  },
  {
    id: 'thought:arrays-pointers:subarray-sum-equals-k',
    lc: 560,
    title: 'Subarray Sum Equals K',
    difficulty: 'Medium',
    category: 'arrays-pointers',
    skills: ['prefix-sum'],
    companies: ['meta', 'amazon', 'google'],
    statement: `Given an array of integers and a target k, count the total number of contiguous subarrays whose sum equals k. The array can contain negative numbers.`,
    examples: [
      { input: 'nums = [1,1,1], k = 2', output: '2', explanation: 'the subarrays [1,1] (index 0-1) and [1,1] (index 1-2) both sum to 2' },
    ],
    constraints: ['1 <= nums.length <= 2 * 10^4', '-1000 <= nums[i] <= 1000', '-10^7 <= k <= 10^7'],
    ds: {
      answer: 'dd(int) count of prefix sums seen so far',
      choices: ['dd(int) count of prefix sums seen so far', 'sliding window of two pointers', 'sorted prefix sum array + binary search', 'monotonic stack of prefix sums'],
    },
    method: {
      answer: "Running prefix sum with a seen-count map: ==result += prefixCounts[prefixSum - k]==, since any earlier prefix equal to prefixSum - k marks a subarray summing to k, then record this prefixSum",
      choices: [
        "Running prefix sum with a seen-count map: ==result += prefixCounts[prefixSum - k]==, since any earlier prefix equal to prefixSum - k marks a subarray summing to k, then record this prefixSum",
        'Sliding window: expand right, shrink left whenever the window sum exceeds k',
        'Brute force checking every (i, j) subarray sum directly, no prefix map',
        'Sort the array first, then two-pointer for pairs of prefix sums that differ by k',
      ],
    },
    code: `class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        prefixCounts = defaultdict(int)
        prefixCounts[0] = 1
        prefixSum = 0
        result = 0

        for num in nums:
            prefixSum += num
            result += prefixCounts[prefixSum - k]
            prefixCounts[prefixSum] += 1

        return result`,
    blanks: [8, 9, 10],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(n^2 log n)'], why: 'single pass, O(1) dict lookup and update per element' },
    space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(n^2)', 'O(log n)'], why: 'prefixCounts can hold up to n distinct running sums' },
    sayIt: "I keep a running ==prefixSum== and add ==prefixCounts[prefixSum - k]== to the result before recording this prefix, O(n) time since negatives rule out a sliding window.",
    pitfall: "Must seed prefixCounts[0] = 1 so a subarray starting at index 0 is counted, and update the count after reading it, not before.",
  },
  {
    id: 'thought:arrays-pointers:best-time-to-buy-and-sell-stock',
    lc: 121,
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    category: 'arrays-pointers',
    skills: ['arrays-hashing'],
    companies: ['amazon', 'meta', 'microsoft', 'apple'],
    statement: `Given an array of daily stock prices, find the maximum profit from buying on one day and selling on a later day. You must buy before you sell, and if no profit is possible, return 0.`,
    examples: [
      { input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'buy at 1 (day 1), sell at 6 (day 4), profit 5' },
      { input: 'prices = [7,6,4,3,1]', output: '0', explanation: 'prices only fall, so no profitable trade exists' },
    ],
    constraints: ['1 <= prices.length <= 10^5', '0 <= prices[i] <= 10^4'],
    ds: {
      answer: 'two rolling vars: running min price and best profit',
      choices: ['two rolling vars: running min price and best profit', '2-D dp table of (day, holding state)', 'monotonic stack of prices', 'sorted copy of prices with original day indices'],
    },
    method: {
      answer: 'One pass tracking both: ==best = max(best, price - minPrice)==, computed before updating minPrice so you never sell before you buy',
      choices: [
        'One pass tracking both: ==best = max(best, price - minPrice)==, computed before updating minPrice so you never sell before you buy',
        'Check every pair of buy/sell days with a nested loop and take the max difference',
        'Sort the prices and subtract the smallest from the largest, ignoring day order',
        'Track only the running minimum price, then subtract it from the very last price',
      ],
    },
    code: `class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        minPrice = prices[0]
        best = 0

        for price in prices[1:]:
            best = max(best, price - minPrice)
            minPrice = min(minPrice, price)

        return best`,
    blanks: [6, 7, 9],
    accept: { 6: ['best = max(price - minPrice, best)'] },
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(1)'], why: 'single forward pass over the prices array' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'], why: 'only two rolling variables are kept, no array or table' },
    sayIt: "One pass, ==best = max(best, price - minPrice)== computed before updating minPrice, so the sale always happens on a later day, O(n) time, O(1) space.",
    pitfall: 'Must compute profit against minPrice before updating minPrice with the current price, or you could sell on the same day you bought at a new low.',
  },
  {
    id: 'thought:arrays-pointers:two-sum-ii-sorted',
    lc: 167,
    title: 'Two Sum II - Input Array Is Sorted',
    difficulty: 'Medium',
    category: 'arrays-pointers',
    skills: ['two-pointers'],
    companies: ['amazon', 'microsoft'],
    statement: `Given a 1-indexed array already sorted in ascending order, find two numbers that add up to a target and return their 1-indexed positions.`,
    examples: [
      { input: 'numbers = [2,7,11,15], target = 9', output: '[1,2]', explanation: 'numbers[0] + numbers[1] = 2 + 7 = 9, returned as 1-indexed [1,2]' },
    ],
    constraints: ['2 <= numbers.length <= 3*10^4', 'numbers is sorted in non-decreasing order', 'exactly one valid answer exists'],
    ds: {
      answer: 'two pointers at both ends of the sorted array',
      choices: ['two pointers at both ends of the sorted array', 'dict mapping value -> index, same as unsorted Two Sum', 'binary search for the complement at every index', 'min-heap of (value, index)'],
    },
    method: {
      answer: "Two pointers from both ends: ==if total < target: left += 1==, elif total > target: right -= 1, else return the 1-indexed pair immediately",
      choices: [
        "Two pointers from both ends: ==if total < target: left += 1==, elif total > target: right -= 1, else return the 1-indexed pair immediately",
        'Use a hashmap of value to index exactly like the unsorted Two Sum, ignoring that the array is sorted',
        'Binary search for target - numbers[i] for every index i',
        'Move left forward whenever the sum is too large, since larger numbers are further right',
      ],
    },
    code: `class Solution:
    def twoSum(self, numbers: List[int], target: int) -> List[int]:
        left, right = 0, len(numbers) - 1

        while left < right:
            total = numbers[left] + numbers[right]
            if total == target:
                return [left + 1, right + 1]
            elif total < target:
                left += 1
            else:
                right -= 1

        return []`,
    blanks: [7, 9, 11],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)'], why: 'the two pointers close the gap by one step each iteration, at most n steps total' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'], why: 'only two index variables are kept, no hashmap needed since the array is sorted' },
    sayIt: "Two pointers exploit the sort: ==total < target moves left up, total > target moves right down==, return 1-indexed positions on a match, O(n) time, O(1) space.",
    pitfall: 'The answer is 1-indexed, so return left + 1 and right + 1, not the raw 0-indexed positions.',
  },
  {
    id: 'thought:arrays-pointers:4sum',
    lc: 18,
    title: '4Sum',
    difficulty: 'Medium',
    category: 'arrays-pointers',
    skills: ['two-pointers'],
    companies: ['amazon', 'meta'],
    statement: `Given an array of integers and a target, find all unique quadruplets that sum exactly to the target.`,
    examples: [
      { input: 'nums = [1,0,-1,0,-2,2], target = 0', output: '[[-2,-1,1,2],[-2,0,0,2],[-1,0,0,1]]' },
    ],
    constraints: ['1 <= nums.length <= 200', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9'],
    ds: {
      answer: 'sorted array + nested fixed indices (i, j) + two pointers',
      choices: ['sorted array + nested fixed indices (i, j) + two pointers', 'hash set of pair-sums checked against target minus other pair-sums', 'quadruple nested loop with a seen-set of sorted tuples', 'sorted array + binary search for each pair of complements'],
    },
    method: {
      answer: 'Sort, fix i and j with duplicate-skipping, then two-pointer the rest: ==total = nums[i] + nums[j] + nums[left] + nums[right]==, move left/right based on the comparison to target, record and skip duplicates on a match',
      choices: [
        'Sort, fix i and j with duplicate-skipping, then two-pointer the rest: ==total = nums[i] + nums[j] + nums[left] + nums[right]==, move left/right based on the comparison to target, record and skip duplicates on a match',
        'Brute-force quadruple nested loop over all i, j, k, l, de-duplicating with a set of sorted tuples at the end',
        'Hash every pair sum into a dict keyed by sum, then for each pair look up target minus that sum',
        'Reduce to 3Sum by fixing only one index, then call 3Sum on the rest with the same target',
      ],
    },
    code: `class Solution:
    def fourSum(self, nums: List[int], target: int) -> List[List[int]]:
        nums.sort()
        n = len(nums)
        result = []

        for i in range(n):
            if i > 0 and nums[i] == nums[i - 1]:
                continue

            for j in range(i + 1, n):
                if j > i + 1 and nums[j] == nums[j - 1]:
                    continue

                left, right = j + 1, n - 1
                while left < right:
                    total = nums[i] + nums[j] + nums[left] + nums[right]
                    if total < target:
                        left += 1
                    elif total > target:
                        right -= 1
                    else:
                        result.append([nums[i], nums[j], nums[left], nums[right]])
                        left += 1
                        while left < right and nums[left] == nums[left - 1]:
                            left += 1

        return result`,
    blanks: [16, 22, 24],
    time: { answer: 'O(n^3)', choices: ['O(n^3)', 'O(n^2)', 'O(n^4)', 'O(n log n)'], why: 'two nested fixed indices, O(n^2), times an O(n) two-pointer scan for each pair' },
    space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(n^2)', 'O(log n)'], why: 'the result list can hold O(n^2) quadruplets in the worst case, and sorting uses O(n) auxiliary space' },
    sayIt: "Sort, fix i and j (skipping duplicates), two-pointer the rest with ==total = nums[i]+nums[j]+nums[left]+nums[right]==, O(n^3) time.",
    pitfall: 'Must skip duplicates at all three levels (i, j, and left after a match), and watch for integer overflow in other languages (not an issue in Python).',
  },
  {
    id: 'thought:arrays-pointers:remove-duplicates-from-sorted-array',
    lc: 26,
    title: 'Remove Duplicates from Sorted Array',
    difficulty: 'Easy',
    category: 'arrays-pointers',
    skills: ['two-pointers'],
    companies: ['microsoft', 'amazon'],
    statement: `Given a sorted array, remove the duplicates in place so each unique element appears only once, and return the count of unique elements. The relative order must be kept, and you must not allocate extra array space.`,
    examples: [
      { input: 'nums = [0,0,1,1,1,2,2,3,3,4]', output: '5, nums becomes [0,1,2,3,4,...]', explanation: '5 unique values, the first 5 slots hold them in order' },
    ],
    constraints: ['1 <= nums.length <= 3*10^4', 'nums is sorted in non-decreasing order'],
    ds: {
      answer: 'two pointers: slow (write) and fast (scan), in place',
      choices: ['two pointers: slow (write) and fast (scan), in place', 'set() of seen values, then rebuild the array', 'new output array, then copy back over nums', 'binary search for each duplicate run boundary'],
    },
    method: {
      answer: "Fast/slow scan starting fast at 1: ==if nums[fast] != nums[fast-1]: nums[slow] = nums[fast]; slow += 1==, since the array is sorted, a differing neighbor means a new unique value",
      choices: [
        "Fast/slow scan starting fast at 1: ==if nums[fast] != nums[fast-1]: nums[slow] = nums[fast]; slow += 1==, since the array is sorted, a differing neighbor means a new unique value",
        'Convert to a set, sort the set, then copy it back into nums',
        'Delete every duplicate element found with nums.pop(), scanning from the front',
        'Compare every element against every later element to check uniqueness, an O(n^2) scan',
      ],
    },
    code: `class Solution:
    def removeDuplicates(self, nums: List[int]) -> int:
        slow = 1

        for fast in range(1, len(nums)):
            if nums[fast] != nums[fast - 1]:
                nums[slow] = nums[fast]
                slow += 1

        return slow`,
    blanks: [5, 6, 7],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(1)'], why: 'single linear scan with the fast pointer' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'], why: 'rearranged in place with two index variables, no extra array' },
    sayIt: "Fast/slow pointers: ==if nums[fast] != nums[fast-1], write it to slow and advance slow==, exploiting the sort, O(n) time, O(1) space.",
    pitfall: 'Comparing nums[fast] to nums[fast-1] only works because the array is already sorted; an unsorted array would need a different approach (a hash set).',
  },
  {
    id: 'thought:arrays-pointers:next-permutation',
    lc: 31,
    title: 'Next Permutation',
    difficulty: 'Medium',
    category: 'arrays-pointers',
    skills: ['two-pointers'],
    companies: ['amazon', 'microsoft', 'google'],
    statement: `Given an array of numbers representing a permutation, rearrange it into the lexicographically next greater permutation, in place. If no greater permutation exists (it's already the highest), rearrange it into the lowest possible order (sorted ascending).`,
    examples: [
      { input: 'nums = [1,2,3]', output: '[1,3,2]' },
      { input: 'nums = [3,2,1]', output: '[1,2,3]', explanation: 'already the highest permutation, wraps around to the lowest' },
    ],
    constraints: ['1 <= nums.length <= 100', '0 <= nums[i] <= 100'],
    ds: {
      answer: 'in-place array, scan from the right for the pivot, then reverse a suffix',
      choices: ['in-place array, scan from the right for the pivot, then reverse a suffix', 'generate every permutation and sort them, then find the current one and return the next', 'min-heap of remaining values to place greedily', 'sort the whole array ascending every time'],
    },
    method: {
      answer: "Find the pivot scanning right to left: ==while i >= 0 and nums[i] >= nums[i+1]: i -= 1==, then if a pivot exists, swap it with the smallest larger value to its right, and always reverse everything after the pivot",
      choices: [
        "Find the pivot scanning right to left: ==while i >= 0 and nums[i] >= nums[i+1]: i -= 1==, then if a pivot exists, swap it with the smallest larger value to its right, and always reverse everything after the pivot",
        'Sort the whole array descending, which always gives the lexicographically smallest next arrangement',
        'Scan left to right for the first descending pair and swap those two adjacent elements only',
        'Generate all permutations with backtracking, sort them, and binary search for the current one',
      ],
    },
    code: `class Solution:
    def nextPermutation(self, nums: List[int]) -> None:
        n = len(nums)
        i = n - 2

        while i >= 0 and nums[i] >= nums[i + 1]:
            i -= 1

        if i >= 0:
            j = n - 1
            while nums[j] <= nums[i]:
                j -= 1
            nums[i], nums[j] = nums[j], nums[i]

        nums[i + 1:] = reversed(nums[i + 1:])`,
    blanks: [5, 12, 14],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(n!)'], why: 'finding the pivot, finding the swap target, and reversing the suffix are each a single linear scan' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(log n)', 'O(n!)'], why: 'rearranged in place with a few index variables, no extra array' },
    sayIt: "Scan right to left for the pivot, ==while nums[i] >= nums[i+1]: i -= 1==, swap it with the smallest bigger value to its right, then reverse the suffix, O(n) time.",
    pitfall: 'The suffix after the pivot is always reversed (never re-sorted from scratch), and if no pivot is found (i < 0) the whole array just gets reversed to its lowest order.',
  },
  {
    id: 'thought:arrays-pointers:majority-element',
    lc: 169,
    title: 'Majority Element',
    difficulty: 'Easy',
    category: 'arrays-pointers',
    skills: ['arrays-hashing'],
    companies: ['amazon', 'microsoft'],
    statement: `Given an array of size n, find the element that appears more than n/2 times. The problem guarantees such a majority element always exists.`,
    examples: [
      { input: 'nums = [2,2,1,1,1,2,2]', output: '2' },
    ],
    constraints: ['n == nums.length', '1 <= n <= 5*10^4', 'a majority element always exists'],
    ds: {
      answer: 'two rolling vars: candidate and vote count (Boyer-Moore)',
      choices: ['two rolling vars: candidate and vote count (Boyer-Moore)', 'dd(int) frequency count of every value', 'sorted copy of nums, then read the middle element', 'min-heap keyed by frequency'],
    },
    method: {
      answer: "Boyer-Moore voting in one pass: ==reset candidate to num whenever count hits 0==, then count += 1 if num matches the candidate else count -= 1; the guaranteed majority always survives",
      choices: [
        "Boyer-Moore voting in one pass: ==reset candidate to num whenever count hits 0==, then count += 1 if num matches the candidate else count -= 1; the guaranteed majority always survives",
        'Count every value with a dict, then return the key with the maximum count',
        'Sort the array and return the element at index n // 2',
        'Use a min-heap keyed by negative frequency and pop the top element',
      ],
    },
    code: `class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        candidate = None
        count = 0

        for num in nums:
            if count == 0:
                candidate = num

            count += 1 if num == candidate else -1

        return candidate`,
    blanks: [7, 9, 11],
    accept: { 9: ['count += 1 if candidate == num else -1'] },
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(1)'], why: 'single linear pass maintaining a candidate and a count' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'], why: 'only a candidate variable and a count variable are kept' },
    sayIt: "Boyer-Moore voting: ==reset candidate when count hits 0==, then +1 for a match, -1 otherwise, the guaranteed majority always wins out, O(n) time, O(1) space.",
    pitfall: 'This only works because a strict majority (more than n/2) is guaranteed to exist; without that guarantee you must verify the candidate with a second pass.',
  },
  {
    id: 'thought:arrays-pointers:rotate-array',
    lc: 189,
    title: 'Rotate Array',
    difficulty: 'Medium',
    category: 'arrays-pointers',
    skills: ['two-pointers'],
    companies: ['amazon', 'microsoft', 'meta'],
    statement: `Given an array, rotate it to the right by k steps, in place, without using extra array space.`,
    examples: [
      { input: 'nums = [1,2,3,4,5,6,7], k = 3', output: '[5,6,7,1,2,3,4]' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '0 <= k <= 10^5'],
    ds: {
      answer: 'in-place array, three reversals via two pointers each',
      choices: ['in-place array, three reversals via two pointers each', 'new output array indexed by (i + k) % n, then copy back', 'deque with rotate(k) built in', 'repeatedly pop the last element and insert it at the front, k times'],
    },
    method: {
      answer: 'Three reversals: ==reverse the whole array, then reverse the first k, then reverse the remaining n-k==, after first reducing k %= n',
      choices: [
        'Three reversals: ==reverse the whole array, then reverse the first k, then reverse the remaining n-k==, after first reducing k %= n',
        'Build a brand new array where new[(i + k) % n] = nums[i], then copy it back over nums',
        'Repeatedly remove the last element and insert it at index 0, done k times',
        'Reverse only the first k elements, leaving the rest untouched',
      ],
    },
    code: `class Solution:
    def rotate(self, nums: List[int], k: int) -> None:
        n = len(nums)
        k %= n

        def reverse(left, right):
            while left < right:
                nums[left], nums[right] = nums[right], nums[left]
                left += 1
                right -= 1

        reverse(0, n - 1)
        reverse(0, k - 1)
        reverse(k, n - 1)`,
    blanks: [7, 12, 13],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(k)'], why: 'each of the three reversals is linear, and together they touch every element a constant number of times' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(log n)', 'O(k)'], why: 'rearranged in place with only pointer variables, no second array' },
    sayIt: "Three reversals after ==k %= n==: whole array, then first k, then the rest, O(n) time, O(1) space, no extra array needed.",
    pitfall: 'Forgetting k %= n first breaks the reversal boundaries whenever k >= n.',
  },
  {
    id: 'thought:arrays-pointers:find-all-duplicates-in-an-array',
    lc: 442,
    title: 'Find All Duplicates in an Array',
    difficulty: 'Medium',
    category: 'arrays-pointers',
    skills: ['arrays-hashing'],
    companies: ['amazon', 'bloomberg'],
    statement: `Given an array of n integers where every value is between 1 and n, and each value appears either once or twice, find all the values that appear twice — in O(n) time and O(1) extra space.`,
    examples: [
      { input: 'nums = [4,3,2,7,8,2,3,1]', output: '[2,3]' },
    ],
    constraints: ['n == nums.length', '1 <= n <= 10^5', '1 <= nums[i] <= n', 'each integer appears once or twice'],
    ds: {
      answer: 'the input array itself, sign-marking visited indices',
      choices: ['the input array itself, sign-marking visited indices', 'a separate dd(int) count of every value', 'set() tracking values seen so far', 'sorted copy of nums, scanning for adjacent equal values'],
    },
    method: {
      answer: "In-place sign marking: for each num, compute ==idx = abs(num) - 1==, and ==if nums[idx] < 0: record a duplicate==, then always negate nums[idx]",
      choices: [
        "In-place sign marking: for each num, compute ==idx = abs(num) - 1==, and ==if nums[idx] < 0: record a duplicate==, then always negate nums[idx]",
        'Count every value into a dict, then collect the keys whose count is exactly 2',
        'Sort the array, then scan for adjacent equal elements',
        'Use a set() to track seen values and append to result on a second sighting, without touching the array',
      ],
    },
    code: `class Solution:
    def findDuplicates(self, nums: List[int]) -> List[int]:
        result = []

        for num in nums:
            idx = abs(num) - 1
            if nums[idx] < 0:
                result.append(idx + 1)
            nums[idx] = -nums[idx]

        return result`,
    blanks: [5, 7, 8],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(1)'], why: 'single pass, each index is negated at most once' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'], why: 'the array itself is reused as the seen-marker, no extra set or dict' },
    sayIt: "I use the array as a hash set: ==idx = abs(num) - 1==, ==if nums[idx] < 0 it's a duplicate==, then negate nums[idx] either way, O(n) time, O(1) space.",
    pitfall: 'Must read nums[idx] with abs(num), since a previously-visited num at this position may already be negative.',
  },
  {
    id: 'thought:arrays-pointers:contains-duplicate-ii',
    lc: 219,
    title: 'Contains Duplicate II',
    difficulty: 'Easy',
    category: 'arrays-pointers',
    skills: ['arrays-hashing'],
    companies: ['amazon', 'apple'],
    statement: `Given an array of integers and an integer k, determine whether there are two distinct indices i and j such that nums[i] == nums[j] and the absolute difference between i and j is at most k.`,
    examples: [
      { input: 'nums = [1,2,3,1], k = 3', output: 'true', explanation: 'both 1s are at indices 0 and 3, a gap of 3, which is <= k' },
      { input: 'nums = [1,2,3,1,2,3], k = 2', output: 'false', explanation: 'every repeat is more than 2 indices apart' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '0 <= k <= 10^5'],
    ds: {
      answer: 'dict mapping value -> most recent index',
      choices: ['dict mapping value -> most recent index', 'sliding window set of the last k values', 'sorted list of (value, index) pairs', 'dd(list) of every index per value'],
    },
    method: {
      answer: "One pass with a last-seen map: ==if num in lastSeen and i - lastSeen[num] <= k: return True==, otherwise update lastSeen[num] to i",
      choices: [
        "One pass with a last-seen map: ==if num in lastSeen and i - lastSeen[num] <= k: return True==, otherwise update lastSeen[num] to i",
        'Maintain a sliding window set of exactly the last k elements, checking membership before adding each new one',
        'Store every index seen per value in a list, then scan each list for any two within k of each other at the end',
        'Sort the array along with original indices, then scan adjacent sorted entries for small index gaps',
      ],
    },
    code: `class Solution:
    def containsNearbyDuplicate(self, nums: List[int], k: int) -> bool:
        lastSeen = {}

        for i, num in enumerate(nums):
            if num in lastSeen and i - lastSeen[num] <= k:
                return True

            lastSeen[num] = i

        return False`,
    blanks: [5, 6, 8],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(n*k)'], why: 'single pass, O(1) dict lookup and update per element' },
    space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(k)', 'O(log n)'], why: 'lastSeen can hold up to n distinct values' },
    sayIt: "One pass, ==if num in lastSeen and i - lastSeen[num] <= k: return True==, always updating lastSeen[num] after the check, O(n) time.",
    pitfall: 'Must update lastSeen[num] every time, not just on the first sighting, so later close pairs are still caught.',
  },
]

export default {
  id: 'arrays-pointers',
  title: 'Arrays, hashing & two pointers',
  icon: 'array',
  items,
}
