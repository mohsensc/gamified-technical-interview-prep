const problems = [
  {
    id: 'bank-linear:problem:986', lc: 986, title: 'Interval List Intersections', difficulty: 'Medium',
    skills: ['intervals', 'two-pointers'], pattern: 'Intervals: two-pointer merge of two sorted lists', ds: ['array'],
    constraints: '0 ≤ list lengths ≤ 1000, each list sorted and disjoint, closed intervals', time: 'O(m + n)', space: 'O(1) extra',
    insight: 'The overlap of two intervals is [max of starts, min of ends]; advance whichever interval ends first.',
    signals: ['two sorted lists of disjoint intervals', 'return every overlap', 'closed endpoints'],
    narration: ['Keep one pointer in each list.', 'Overlap start is the larger start, overlap end is the smaller end.', 'If start <= end, record it. Touching endpoints count.', 'Move the pointer whose interval ends first; the other may still overlap the next one.'],
    solution: `class Solution:
    def intervalIntersection(self, firstList, secondList):
        result = []
        i = j = 0
        while i < len(firstList) and j < len(secondList):
            start = max(firstList[i][0], secondList[j][0])
            end = min(firstList[i][1], secondList[j][1])
            if start <= end:
                result.append([start, end])
            if firstList[i][1] < secondList[j][1]:
                i += 1
            else:
                j += 1
        return result`,
    pitfalls: ['Using start < end drops intersections that are a single point like [5, 5]', 'Advancing both pointers at once can skip an overlap'],
  },
  {
    id: 'bank-linear:problem:191', lc: 191, title: 'Number of 1 Bits', difficulty: 'Easy',
    skills: ['bit'], pattern: 'Bit manipulation: n &= n - 1 clears the lowest set bit', ds: ['array'],
    constraints: '1 ≤ n ≤ 2^31 - 1', time: 'O(k) for k set bits', space: 'O(1)',
    insight: 'n & (n - 1) removes exactly one set bit, so the loop runs once per 1.',
    signals: ['count the set bits', 'Hamming weight', 'integer input'],
    narration: ['Subtracting 1 flips the lowest set bit and every bit below it.', 'AND with the original clears that lowest set bit and nothing else.', 'Count how many times you can do this before n hits 0.'],
    solution: `class Solution:
    def hammingWeight(self, n: int) -> int:
        count = 0
        while n:
            n &= n - 1
            count += 1
        return count`,
    pitfalls: ['Looping while n and shifting right on a negative Python int never ends; mask to 32 bits first if negatives are allowed'],
  },
  {
    id: 'bank-linear:problem:137', lc: 137, title: 'Single Number II', difficulty: 'Medium',
    skills: ['bit'], pattern: 'Bit manipulation: per-bit count mod 3', ds: ['array'],
    constraints: '1 ≤ n ≤ 3·10^4, every value appears 3 times except one that appears once', time: 'O(32n)', space: 'O(1)',
    insight: 'Add up each bit position across all numbers; positions where the total is not a multiple of 3 belong to the single value.',
    signals: ['every element appears three times except one', 'constant extra space', 'linear time'],
    narration: ['Triplicates contribute 0 or 3 to each bit position.', 'So bit b of the answer is (count of numbers with bit b set) % 3.', 'Rebuild the answer one bit at a time over 32 positions.', 'Convert from unsigned back to signed if bit 31 is set.'],
    solution: `class Solution:
    def singleNumber(self, nums):
        result = 0
        for bit in range(32):
            total = 0
            for num in nums:
                total += (num >> bit) & 1
            if total % 3:
                result |= 1 << bit
        if result >= 1 << 31:
            result -= 1 << 32
        return result`,
    companies: ['google', 'amazon'],
    pitfalls: ['XOR alone only cancels pairs, not triples', 'Forgetting the sign fix returns a huge positive number for a negative answer'],
  },
  {
    id: 'bank-linear:problem:201', lc: 201, title: 'Bitwise AND of Numbers Range', difficulty: 'Medium',
    skills: ['bit', 'math'], pattern: 'Bit manipulation: common prefix shift', ds: ['array'],
    constraints: '0 ≤ left ≤ right ≤ 2^31 - 1', time: 'O(log right)', space: 'O(1)',
    insight: 'Any bit that changes somewhere in [left, right] becomes 0, so the answer is the shared binary prefix of left and right.',
    signals: ['AND of every number in a range', 'range up to 2^31', 'cannot loop the range'],
    narration: ['Walking from left to right flips every lower bit at least once.', 'Only the common leading bits of left and right survive.', 'Shift both right until they match, counting shifts.', 'Shift the common prefix back left.'],
    solution: `class Solution:
    def rangeBitwiseAnd(self, left, right):
        shift = 0
        while left != right:
            left >>= 1
            right >>= 1
            shift += 1
        return left << shift`,
    companies: ['amazon', 'microsoft'],
    pitfalls: ['Looping from left to right and ANDing every value times out for ranges near 2^31'],
  },
  {
    id: 'bank-linear:problem:1482', lc: 1482, title: 'Minimum Number of Days to Make m Bouquets', difficulty: 'Medium',
    skills: ['binary-search', 'greedy'], pattern: 'Binary search on answer + greedy adjacency count', ds: ['array'],
    constraints: '1 ≤ n ≤ 10^5, 1 ≤ bloomDay[i] ≤ 10^9, 1 ≤ m, k', time: 'O(n log max)', space: 'O(1)',
    insight: 'If day d works then every later day works, so binary search d and check by counting runs of k adjacent bloomed flowers.',
    signals: ['minimum days', 'm bouquets of k adjacent flowers', 'feasibility only gets easier with more days'],
    narration: ['If m * k > n it is impossible, return -1.', 'For a candidate day, scan and count consecutive bloomed flowers; each full run of k is a bouquet and resets the run.', 'A flower not yet bloomed resets the run.', 'Binary search the smallest day where bouquets >= m.'],
    solution: `class Solution:
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
    companies: ['amazon', 'google'],
    pitfalls: ['Not resetting the run after completing a bouquet reuses flowers', 'm * k can exceed n, check it before searching'],
  },
  {
    id: 'bank-linear:problem:774', lc: 774, title: 'Minimize Max Distance to Gas Station', difficulty: 'Hard',
    skills: ['binary-search', 'math'], pattern: 'Binary search on a real-valued answer (epsilon loop)', ds: ['array'],
    constraints: '10 ≤ n ≤ 2000, 0 ≤ stations[i] ≤ 10^8 sorted, 1 ≤ k ≤ 10^6, answer within 10^-6', time: 'O(n log(range / ε))', space: 'O(1)',
    insight: 'Binary search the target max gap D; a segment of length L needs floor(L / D) new stations to get every gap down to D.',
    signals: ['add k stations anywhere, even fractional', 'minimize the largest gap', 'answer accepted within 10^-6'],
    narration: ['The answer is a real number, so search on floats and stop when high - low is tiny.', 'For a gap D, each segment needs int(length / D) extra stations.', 'If the total needed is at most k, D is achievable: shrink high.', 'Otherwise raise low.'],
    solution: `class Solution:
    def minmaxGasDist(self, stations, k):
        def stationsNeeded(gap):
            return sum(int((b - a) / gap) for a, b in zip(stations, stations[1:]))

        low, high = 0.0, float(stations[-1] - stations[0])
        while high - low > 1e-6:
            mid = (low + high) / 2
            if stationsNeeded(mid) <= k:
                high = mid
            else:
                low = mid
        return high`,
    companies: ['google'],
    pitfalls: ['Using mid + 1 or mid - 1 steps from integer binary search never converges on floats', 'A priority queue of gaps is O(k log n) and too slow for k up to 10^6'],
  },
  {
    id: 'bank-linear:problem:438', lc: 438, title: 'Find All Anagrams in a String', difficulty: 'Medium',
    skills: ['sliding-window', 'arrays-hashing'], pattern: 'Sliding window: fixed size + count diff', ds: ['hashmap', 'string'],
    constraints: '1 ≤ s.length, p.length ≤ 3·10^4, lowercase letters', time: 'O(n)', space: 'O(1)',
    insight: 'An anagram of p is any window of length |p| whose letter counts equal p\'s, so slide the window and update counts by one in, one out.',
    signals: ['all start indices', 'anagram of p inside s', 'fixed window length'],
    narration: ['Count the letters of p once.', 'Start with a window over the first |p| characters.', 'Slide: add the new right character, drop the one that leaves, deleting zero counts.', 'Record the start index whenever the two counters match.'],
    solution: `class Solution:
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
    pitfalls: ['Leaving zero counts in the dict can make two equal windows compare unequal on older Pythons', 'Sorting every window is O(n · m log m)'],
  },
  {
    id: 'bank-linear:problem:862', lc: 862, title: 'Shortest Subarray with Sum at Least K', difficulty: 'Hard',
    skills: ['prefix-sum', 'queue-deque', 'monotonic-stack'], pattern: 'Prefix sum + monotonic deque (negatives allowed)', ds: ['deque', 'array'],
    constraints: '1 ≤ n ≤ 10^5, -10^5 ≤ nums[i] ≤ 10^5, 1 ≤ k ≤ 10^9', time: 'O(n)', space: 'O(n)',
    insight: 'With negatives a plain window breaks, so keep indices of increasing prefix sums in a deque and pop the front while the sum reaches k.',
    signals: ['shortest subarray with sum at least K', 'values can be negative', 'n up to 10^5'],
    narration: ['Build prefix sums so a subarray sum is prefix[j] - prefix[i].', 'Pop the deque front while prefix[j] - prefix[front] >= k, recording the length. That front can never give a shorter answer later.', 'Pop the back while its prefix >= the current one; a larger earlier prefix is never better.', 'Push j.'],
    solution: `class Solution:
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
    companies: ['google', 'amazon'],
    pitfalls: ['Shrinking a two-pointer window when the sum is large assumes non-negative values', 'Skipping the back-pop leaves a non-monotonic deque and misses shorter answers'],
  },
  {
    id: 'bank-linear:problem:1838', lc: 1838, title: 'Frequency of the Most Frequent Element', difficulty: 'Medium',
    skills: ['sliding-window', 'greedy'], pattern: 'Sliding window: sort + window cost check', ds: ['array'],
    constraints: '1 ≤ n ≤ 10^5, 1 ≤ nums[i] ≤ 10^5, 1 ≤ k ≤ 10^5, only increments', time: 'O(n log n)', space: 'O(1)',
    insight: 'After sorting, raising a window to its largest value costs max * size - sum; grow the window while that cost stays within k.',
    signals: ['at most k increments', 'maximize frequency of one value', 'only increase elements'],
    narration: ['Sort so the target for a window is its rightmost element.', 'Cost to equalize = nums[right] * width - window sum.', 'While cost > k, drop the left element.', 'The widest valid window is the answer.'],
    solution: `class Solution:
    def maxFrequency(self, nums, k):
        nums.sort()
        left = 0
        total = 0
        best = 1
        for right, num in enumerate(nums):
            total += num
            while num * (right - left + 1) - total > k:
                total -= nums[left]
                left += 1
            best = max(best, right - left + 1)
        return best`,
    pitfalls: ['Raising elements to a value below the window max is impossible, only increments allowed', 'Cost uses the right end, not the average'],
  },
  {
    id: 'bank-linear:problem:2444', lc: 2444, title: 'Count Subarrays With Fixed Bounds', difficulty: 'Hard',
    skills: ['sliding-window'], pattern: 'Sliding window: last-seen min/max/bad index', ds: ['array'],
    constraints: '2 ≤ n ≤ 10^5, 1 ≤ nums[i], minK, maxK ≤ 10^6', time: 'O(n)', space: 'O(1)',
    insight: 'For each right end, valid starts lie after the last out-of-range value and at or before the earlier of the last minK and last maxK.',
    signals: ['subarray min equals minK and max equals maxK', 'count subarrays', 'values outside the range break everything'],
    narration: ['Track the last index of minK, of maxK, and of a "bad" value outside [minK, maxK].', 'A subarray ending at i is valid if it starts after lastBad and includes both lastMin and lastMax.', 'That gives max(0, min(lastMin, lastMax) - lastBad) starts.', 'Add it for every i.'],
    solution: `class Solution:
    def countSubarrays(self, nums, minK, maxK):
        count = 0
        lastMin = lastMax = lastBad = -1
        for i, num in enumerate(nums):
            if num < minK or num > maxK:
                lastBad = i
            if num == minK:
                lastMin = i
            if num == maxK:
                lastMax = i
            count += max(0, min(lastMin, lastMax) - lastBad)
        return count`,
    companies: ['amazon', 'google'],
    pitfalls: ['Forgetting the max(0, ...) counts negative amounts when a bad value is the latest index', 'Resetting lastMin and lastMax on a bad value is unnecessary, lastBad already blocks them'],
  },
  {
    id: 'bank-linear:problem:1109', lc: 1109, title: 'Corporate Flight Bookings', difficulty: 'Medium',
    skills: ['prefix-sum'], pattern: 'Prefix sum: difference array', ds: ['array'],
    constraints: '1 ≤ n ≤ 2·10^4, 1 ≤ bookings.length ≤ 2·10^4, flights are 1-indexed', time: 'O(n + bookings)', space: 'O(n)',
    insight: 'Add seats at the first flight and subtract them just after the last; one running sum rebuilds every flight total.',
    signals: ['many range updates', 'add seats to flights first through last', 'read all totals at the end'],
    narration: ['Make diff with n + 1 slots.', 'For each booking, diff[first - 1] += seats and diff[last] -= seats.', 'Sweep once keeping a running sum; that is the answer for each flight.'],
    solution: `class Solution:
    def corpFlightBookings(self, bookings, n):
        diff = [0] * (n + 1)
        for first, last, seats in bookings:
            diff[first - 1] += seats
            diff[last] -= seats
        result = []
        running = 0
        for i in range(n):
            running += diff[i]
            result.append(running)
        return result`,
    companies: ['amazon'],
    pitfalls: ['Flights are 1-indexed, so shift by one and size diff n + 1 so diff[last] is always in range', 'Looping each booking over its whole range is O(n · bookings)'],
  },
]

export default { problems }
