export default {
  id: 'patterns',
  title: 'Core pattern boilerplates + formulas',
  icon: 'puzzle',
  minutes: 35,

  summary: [
    "==Two pointers==: converge ends, move the side that can still fix the sum.",
    "==Sliding window==: grow r, shrink l while invalid, best = max(best, r-l+1).",
    "==Fixed window==: windowSum += nums[r] - nums[r-k].",
    "==Prefix sum==: result += count[prefix-k], then count[prefix] += 1.",
    "==Binary search==: lo<=hi finds exact; lo<hi with hi=mid finds a boundary.",
    "==Monotonic stack==: pop while top < current — those pops just got their answer.",
    "==Heap top-k==: cap size at k, pop smallest on overflow; negate for max-heap.",
    "==DP==: dp[i] meaning → transition → base case → fill order → answer cell.",
  ],

  sections: [
    {
      kind: 'boilerplate',
      title: 'Two Pointers',
      when: 'sorted array, pair sum, or converge from ends',
      code: `def twoSum(nums, target):

    left, right = 0, len(nums) - 1

    while left < right:
        total = nums[left] + nums[right]
        if total == target:
            return [left, right]
        if total < target:
            left += 1
        else:
            right -= 1

    return [-1, -1]`,
      time: 'O(n)',
      space: 'O(1)',
      knobs: [
        {
          change: '==core formula==',
          how: "Too small → move left up; too big → move right down — only the losing side helps.",
          code: `if total < target: left += 1\nelse: right -= 1`,
        },
        {
          change: 'container with most water',
          how: "Move the shorter side — the taller one can't raise the area on its own.",
          code: `best = max(best, (right - left) * min(h[left], h[right]))\nif h[left] < h[right]: left += 1\nelse: right -= 1`,
        },
        {
          change: 'remove duplicates in place',
          how: "slow marks the write position; copy nums[fast] forward only when it's a new value.",
          code: `if nums[fast] != nums[slow]:\n    slow += 1\n    nums[slow] = nums[fast]`,
        },
        {
          change: 'palindrome check',
          how: "Compare both ends inward; stop the moment characters don't match.",
          code: `if s[left] != s[right]: return False`,
        },
      ],
    },
    {
      kind: 'boilerplate',
      title: 'Sliding Window (variable)',
      when: 'substring or subarray with a shrinkable condition',
      code: `def longest(s):

    seen = set()
    left = best = 0

    for right in range(len(s)):
        while s[right] in seen:
            seen.remove(s[left])
            left += 1
        seen.add(s[right])
        best = max(best, right - left + 1)

    return best`,
      time: 'O(n)',
      space: 'O(k)',
      knobs: [
        {
          change: '==core formula==',
          how: "Grow right every step; while the window is invalid, shrink left; update best once valid.",
          code: `while invalid(window):\n    shrink()\nbest = max(best, right - left + 1)`,
        },
        {
          change: 'at most k distinct chars',
          how: "Track counts in a dict; shrink from the left while more than k distinct keys remain.",
          code: `counts[s[right]] += 1\nwhile len(counts) > k:\n    counts[s[left]] -= 1\n    if counts[s[left]] == 0: del counts[s[left]]\n    left += 1`,
        },
        {
          change: 'longest repeat after k replacements',
          how: "Shrink while window size minus the most frequent char count exceeds k.",
          code: `maxFreq = max(maxFreq, counts[s[right]])\nwhile (right - left + 1) - maxFreq > k:\n    counts[s[left]] -= 1\n    left += 1`,
        },
        {
          change: 'minimum window containing t',
          how: "Expand until every needed char is covered, then shrink while still covered, recording the smallest window.",
          code: `while have == need:\n    if (right - left + 1) < bestLen:\n        bestLen = right - left + 1\n    window[s[left]] -= 1\n    left += 1`,
        },
      ],
    },
    {
      kind: 'boilerplate',
      title: 'Fixed Window (size k)',
      when: 'exactly k window, max sum, avg, or count',
      code: `def maxSumFixed(nums, k):

    windowSum = sum(nums[:k])
    best = windowSum

    for right in range(k, len(nums)):
        windowSum += nums[right] - nums[right - k]
        best = max(best, windowSum)

    return best`,
      time: 'O(n)',
      space: 'O(1)',
      knobs: [
        {
          change: '==core formula==',
          how: "Add the new right edge, subtract the value that just fell off the left edge.",
          code: `windowSum += nums[right] - nums[right - k]`,
        },
        {
          change: 'max distinct / avg of size k',
          how: "Swap the running sum for a counts dict; add the right edge, remove the left edge.",
          code: `counts[nums[right]] += 1\ncounts[nums[right - k]] -= 1`,
        },
        {
          change: 'first negative in every window',
          how: "Keep indices of negatives in a deque; drop the front once it falls outside the window.",
          code: `if window and window[0] <= right - k:\n    window.popleft()`,
        },
      ],
    },
    {
      kind: 'boilerplate',
      title: 'Prefix Sum + Hashmap',
      when: 'count or find subarrays summing to k',
      code: `from collections import defaultdict as dd

def subarraySum(nums, k):

    counts = dd(int)
    counts[0] = 1
    prefix = result = 0

    for num in nums:
        prefix += num
        result += counts[prefix - k]
        counts[prefix] += 1

    return result`,
      time: 'O(n)',
      space: 'O(n)',
      knobs: [
        {
          change: '==core formula==',
          how: "Look up counts[prefix-k] before adding the current prefix, so you never count a subarray against itself.",
          code: `result += counts[prefix - k]\ncounts[prefix] += 1`,
        },
        {
          change: 'equal number of 0s and 1s',
          how: 'Map every 0 to -1, then this becomes "longest subarray summing to 0" — same pattern, k=0.',
          code: `nums = [-1 if x == 0 else 1 for x in nums]`,
        },
        {
          change: 'longest subarray summing to k',
          how: "Store the first index each prefix value was seen at, not a running count.",
          code: `if prefix not in first: first[prefix] = i\nif prefix - k in first:\n    best = max(best, i - first[prefix - k])`,
        },
      ],
    },
    {
      kind: 'boilerplate',
      title: 'Binary Search',
      when: 'sorted array, or search over a range of answers',
      code: `def search(nums, target):

    lo, hi = 0, len(nums) - 1

    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1

    return -1`,
      time: 'O(log n)',
      space: 'O(1)',
      knobs: [
        {
          change: 'lower bound (first index that fits)',
          how: "lo < hi, hi = mid (not mid-1) — mid could be the final answer.",
          code: `while lo < hi:\n    mid = (lo + hi) // 2\n    if feasible(mid): hi = mid\n    else: lo = mid + 1`,
        },
        {
          change: 'binary search on the answer',
          how: "lo/hi become the answer range, not array indices; shrink using a monotonic feasible(mid) check.",
          code: `lo, hi = minPossible, maxPossible\nwhile lo < hi:\n    mid = (lo + hi) // 2\n    if feasible(mid): hi = mid\n    else: lo = mid + 1`,
        },
        {
          change: 'Koko eating bananas (ceil hours)',
          how: "Ceiling division without floats: (p + k - 1) // k rounds hours up for pile p.",
          code: `hours = sum((p + k - 1) // k for p in piles)`,
        },
      ],
    },
    {
      kind: 'boilerplate',
      title: 'Monotonic Stack',
      when: 'next greater/smaller element, or histogram width',
      code: `def nextGreater(nums):

    result = [-1] * len(nums)
    stack = []

    for i in range(len(nums)):
        while stack and nums[stack[-1]] < nums[i]:
            j = stack.pop()
            result[j] = nums[i]
        stack.append(i)

    return result`,
      time: 'O(n)',
      space: 'O(n)',
      knobs: [
        {
          change: '==core formula==',
          how: "Pop while the top is weaker than now; each pop just found that index's answer.",
          code: `while stack and nums[stack[-1]] < nums[i]:\n    result[stack.pop()] = nums[i]`,
        },
        {
          change: 'largest rectangle in histogram',
          how: "On pop, width = i - stack[-1] - 1; multiply by the popped height for the area.",
          code: `width = i - stack[-1] - 1\nbest = max(best, heights[j] * width)`,
        },
        {
          change: 'daily temperatures',
          how: "Push indices, not values; the answer for a popped index is i minus that index.",
          code: `while stack and temps[stack[-1]] < temps[i]:\n    j = stack.pop()\n    result[j] = i - j`,
        },
      ],
    },
    {
      kind: 'boilerplate',
      title: 'Monotonic Deque (window max)',
      when: 'max or min of every sliding window',
      code: `from collections import deque

def maxSlidingWindow(nums, k):

    result = []
    window = deque()

    for i in range(len(nums)):
        while window and nums[window[-1]] < nums[i]:
            window.pop()
        window.append(i)

        if window[0] <= i - k:
            window.popleft()

        if i >= k - 1:
            result.append(nums[window[0]])

    return result`,
      time: 'O(n)',
      space: 'O(k)',
      knobs: [
        {
          change: '==core formula==',
          how: "Front of the deque is always the current max; pop the back while it is beaten.",
          code: `if window[0] <= i - k:\n    window.popleft()`,
        },
        {
          change: 'window minimum instead of max',
          how: "Flip the comparison so the deque stays increasing instead of decreasing.",
          code: `while window and nums[window[-1]] > nums[i]:\n    window.pop()`,
        },
      ],
    },
    {
      kind: 'boilerplate',
      title: 'Heap Top-K',
      when: 'kth largest, k closest, or top-k frequent',
      code: `import heapq

def kthLargest(nums, k):

    heap = []

    for num in nums:
        heapq.heappush(heap, num)
        if len(heap) > k:
            heapq.heappop(heap)

    return heap[0]`,
      time: 'O(n log k)',
      space: 'O(k)',
      knobs: [
        {
          change: '==core formula==',
          how: "Heap holds the k largest seen so far; once size exceeds k, pop the smallest.",
          code: `if len(heap) > k:\n    heapq.heappop(heap)`,
        },
        {
          change: 'need a max-heap, not min',
          how: "heapq only pops the minimum; negate values going in and out to fake a max-heap.",
          code: `heapq.heappush(heap, -num)\nbiggest = -heapq.heappop(heap)`,
        },
        {
          change: 'one-liner shortcut',
          how: "heapq.nlargest(k, nums) builds the whole top-k list in one call, no loop needed.",
          code: `heapq.nlargest(k, nums)`,
        },
        {
          change: 'top-k frequent elements',
          how: "Push (-count, value) tuples so the heap orders entries by frequency, not raw value.",
          code: `heapq.heappush(heap, (-count[num], num))`,
        },
      ],
    },
    {
      kind: 'boilerplate',
      title: 'Intervals',
      when: 'merge, overlap, or meeting-room scheduling',
      code: `def merge(intervals):

    intervals.sort(key=lambda i: i[0])
    result = [intervals[0]]

    for start, end in intervals[1:]:
        if start <= result[-1][1]:
            result[-1][1] = max(result[-1][1], end)
        else:
            result.append([start, end])

    return result`,
      time: 'O(n log n)',
      space: 'O(n)',
      knobs: [
        {
          change: '==core formula==',
          how: "Sort by start first; two intervals overlap exactly when start <= the last kept end.",
          code: `if start <= result[-1][1]:\n    result[-1][1] = max(result[-1][1], end)`,
        },
        {
          change: 'meeting rooms II (min rooms)',
          how: "Push each end time to a heap; reuse the earliest-freed room if the new start is late enough.",
          code: `if heap and start >= heap[0]:\n    heapq.heappop(heap)\nheapq.heappush(heap, end)`,
        },
        {
          change: 'max non-overlapping intervals',
          how: "Sort by END time instead; greedily keep an interval only if it starts after the last kept one ends.",
          code: `intervals.sort(key=lambda i: i[1])\nif start >= lastEnd:\n    lastEnd = end\n    kept += 1`,
        },
      ],
    },
    {
      kind: 'boilerplate',
      title: 'Backtracking',
      when: 'all subsets, combos, perms, or constraint search',
      code: `def subsets(nums):

    result = []
    path = []

    def dfs(i):
        if i == len(nums):
            result.append(path.copy())
            return
        path.append(nums[i])
        dfs(i + 1)
        path.pop()
        dfs(i + 1)

    dfs(0)
    return result`,
      time: 'O(2^n)',
      space: 'O(n)',
      knobs: [
        {
          change: '==core formula==',
          how: "Append the choice, recurse one level deeper, then pop — the pop undoes it for the next sibling.",
          code: `path.append(choice)\ndfs(next)\npath.pop()`,
        },
        {
          change: 'combinations / combination sum',
          how: "Loop from a start index so later picks never revisit an earlier index — no duplicate sets.",
          code: `for j in range(start, len(nums)):\n    path.append(nums[j])\n    dfs(j + 1)\n    path.pop()`,
        },
        {
          change: 'combination sum (reuse a number)',
          how: "Recurse with the SAME index instead of index+1, so one number can be reused.",
          code: `dfs(i, total + nums[i])`,
        },
        {
          change: 'permutations (order matters)',
          how: "Track a used set instead of a start index; try every unused choice at each level.",
          code: `for j in range(len(nums)):\n    if j in used: continue\n    used.add(j); path.append(nums[j])\n    dfs()\n    path.pop(); used.remove(j)`,
        },
        {
          change: 'prune early',
          how: "Check the invalid condition before recursing and return immediately — don't explore a dead branch.",
          code: `if total > target: return`,
        },
      ],
    },
    {
      kind: 'boilerplate',
      title: 'Dynamic Programming',
      when: 'optimal value built from smaller subproblems',
      code: `def rob(nums):

    if len(nums) == 1:
        return nums[0]

    dp = [0] * len(nums)
    dp[0] = nums[0]
    dp[1] = max(nums[0], nums[1])

    for i in range(2, len(nums)):
        dp[i] = max(dp[i - 1], dp[i - 2] + nums[i])

    return dp[-1]`,
      time: 'O(n)',
      space: 'O(n)',
      knobs: [
        {
          change: '==core formula (the 5 questions)==',
          how: "Define dp[i]'s meaning, write the transition, set base cases, pick the fill order, read the answer cell.",
          code: `dp[i] = max(dp[i - 1], dp[i - 2] + nums[i])`,
        },
        {
          change: 'coin change (min coins)',
          how: "dp[a] = min over every coin c of 1 + dp[a-c]; base case dp[0] = 0.",
          code: `dp[a] = min(dp[a], 1 + dp[a - c])`,
        },
        {
          change: 'longest common subsequence (2D)',
          how: "dp[i][j] matches text1[i:] vs text2[j:]; match adds 1 plus the diagonal, else take the best neighbor.",
          code: `dp[i][j] = 1 + dp[i + 1][j + 1] if text1[i] == text2[j] else max(dp[i + 1][j], dp[i][j + 1])`,
        },
        {
          change: 'top-down with memo instead of a table',
          how: "Write it as plain recursion and add @cache — same transition, no fill order to plan.",
          code: `from functools import cache\n\n@cache\ndef dp(i):\n    if i < 0: return 0\n    return max(dp(i - 1), dp(i - 2) + nums[i])`,
        },
      ],
    },
    {
      kind: 'boilerplate',
      title: 'Linked List',
      when: 'reverse, find middle, detect cycle, or remove a node',
      code: `def reverseList(head):

    prev = None
    curr = head

    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt

    return prev`,
      time: 'O(n)',
      space: 'O(1)',
      knobs: [
        {
          change: '==core formula==',
          how: "Save curr.next before overwriting it, then shift prev, curr forward one node together.",
          code: `nxt = curr.next\ncurr.next = prev\nprev, curr = curr, nxt`,
        },
        {
          change: 'find the middle / detect a cycle',
          how: "Fast moves 2 steps per 1 slow step; it hits null at the middle, or laps slow in a cycle.",
          code: `slow, fast = head, head\nwhile fast and fast.next:\n    slow = slow.next\n    fast = fast.next.next`,
        },
        {
          change: 'remove the nth node from the end',
          how: "Advance a lead pointer n steps first, then move both together — the gap stays n behind.",
          code: `for _ in range(n):\n    ahead = ahead.next\nwhile ahead.next:\n    ahead = ahead.next\n    behind = behind.next`,
        },
        {
          change: 'merge two sorted lists',
          how: "Use a dummy head so the first node needs no special case; always attach the smaller value.",
          code: `dummy = ListNode()\ntail = dummy`,
        },
      ],
    },
  ],

  recall: [
    { prompt: 'Two pointers: total < target — which pointer moves?', answer: 'left += 1 (need a bigger sum, only growing left can do that)' },
    { prompt: 'Sliding window: the core shrink loop', answer: 'while invalid(window): shrink()' },
    { prompt: 'Fixed window: one-line slide update', answer: 'windowSum += nums[right] - nums[right - k]' },
    { prompt: "Prefix sum: what do you add to result before updating counts?", answer: 'result += counts[prefix - k]' },
    { prompt: 'Longest-after-k-replacements shrink condition', answer: '(right - left + 1) - maxFreq > k' },
    { prompt: 'Lower-bound binary search: loop condition and hi update', answer: 'while lo < hi: ... hi = mid (never mid - 1)' },
    { prompt: 'Koko eating bananas: hours for pile p at speed k', answer: '(p + k - 1) // k' },
    { prompt: 'Histogram width when popping stack[-1] at position i', answer: 'i - stack[-1] - 1' },
    { prompt: 'Monotonic deque: when do you pop the front?', answer: 'when window[0] <= i - k' },
    { prompt: 'Why heapq.heappush(heap, -num) for a max-heap?', answer: 'heapq is min-heap only — negating simulates a max-heap' },
    { prompt: 'Interval merge condition (sorted by start)', answer: 'start <= result[-1][1]' },
    { prompt: 'Meeting Rooms II: when do you reuse a room?', answer: 'if heap and start >= heap[0]: pop it; else push a new end time' },
    { prompt: 'Backtracking 3-line core', answer: 'path.append(x); dfs(next); path.pop()' },
    { prompt: 'Combinations (start index) vs permutations — what tracks choices?', answer: 'used = set(), loop from 0 every level instead of a start index' },
    { prompt: 'House robber transition', answer: 'dp[i] = max(dp[i - 1], dp[i - 2] + nums[i])' },
    { prompt: 'Reverse linked list: 3-line body in order', answer: 'nxt = curr.next; curr.next = prev; prev, curr = curr, nxt' },
  ],

  quiz: [
    {
      id: 'dayof:patterns:q1',
      q: 'Sorted array two-sum: nums[left] + nums[right] < target. What do you do?',
      choices: ['right -= 1', 'left += 1', 'left += 1 and right -= 1', 'return [-1, -1]'],
      answer: 1,
      why: 'Sum is too small — only increasing left can grow it; right only shrinks the sum further.',
      skills: ['two-pointers'],
    },
    {
      id: 'dayof:patterns:q2',
      q: 'At-most-k-distinct sliding window: shrink while?',
      choices: ['len(counts) > k', 'len(counts) < k', 'right - left > k', 'counts[s[right]] > 1'],
      answer: 0,
      why: "len(counts) > k means more distinct chars than allowed, so shrink from the left until it's back to k or fewer.",
      skills: ['sliding-window'],
    },
    {
      id: 'dayof:patterns:q3',
      q: 'Longest substring after k replacements — correct shrink condition?',
      choices: ['(right - left + 1) - maxFreq > k', 'maxFreq > k', 'right - left > k', '(right - left + 1) > k'],
      answer: 0,
      why: "Window length minus the most frequent char's count is how many replacements are needed; shrink once that exceeds k.",
      skills: ['sliding-window'],
    },
    {
      id: 'dayof:patterns:q4',
      q: "Fixed window size k, sliding from right-1 to right. What's the O(1) update?",
      choices: ['windowSum = sum(nums[right-k+1:right+1])', 'windowSum += nums[right] - nums[right - k]', 'windowSum += nums[right]', 'windowSum -= nums[right - k]'],
      answer: 1,
      why: 'Add the new right edge and remove the value that just left the window on the left side.',
      skills: ['sliding-window'],
    },
    {
      id: 'dayof:patterns:q5',
      q: 'Counting subarrays that sum to k using a running prefix. What do you add to result?',
      choices: ['counts[prefix]', 'counts[prefix - k]', 'counts[k - prefix]', 'counts[prefix + k]'],
      answer: 1,
      why: 'counts[prefix - k] is how many earlier prefixes would make the subarray between them sum to exactly k.',
      skills: ['prefix-sum'],
    },
    {
      id: 'dayof:patterns:q6',
      q: 'Longest subarray with equal 0s and 1s — the trick?',
      choices: ['map 0 to -1, then find the longest subarray summing to 0', 'use two pointers from both ends', 'sort the array first', 'count 0s and 1s separately then divide'],
      answer: 0,
      why: 'Mapping 0 to -1 turns "equal counts" into "sum is zero", reusing the prefix-sum-equals-k pattern with k=0.',
      skills: ['prefix-sum'],
    },
    {
      id: 'dayof:patterns:q7',
      q: 'To find the LONGEST subarray summing to k (not the count), what do you store per prefix value?',
      choices: ['a running count of occurrences', 'the first index it was seen at', 'the last index it was seen at', 'nothing extra is needed'],
      answer: 1,
      why: 'Storing the first index maximizes the subarray length when that prefix value reappears later.',
      skills: ['prefix-sum'],
    },
    {
      id: 'dayof:patterns:q8',
      q: 'Fill the lower-bound binary search:',
      code: 'while lo < hi:\n    mid = (lo + hi) // 2\n    if feasible(mid): hi = ___\n    else: lo = mid + 1',
      choices: ['mid - 1', 'mid', 'mid + 1', 'hi'],
      answer: 1,
      why: 'Lower bound search keeps mid in range since it might BE the answer, unlike exact-match search which excludes it.',
      skills: ['binary-search'],
    },
    {
      id: 'dayof:patterns:q9',
      q: 'Hours to eat pile p bananas at speed k, without float math?',
      choices: ['p // k', '(p + k - 1) // k', 'p % k', 'k // p'],
      answer: 1,
      why: 'Integer ceiling division: adding k-1 before floor-dividing rounds up without math.ceil or floats.',
      skills: ['binary-search'],
    },
    {
      id: 'dayof:patterns:q10',
      q: 'Classic nums[mid] == target search uses while lo <= hi. Why <= and not <?',
      choices: ['no real reason, both work the same', 'lo == hi is still one candidate left to check', '<= is just faster to type', '<= only avoids infinite loops'],
      answer: 1,
      why: 'When lo == hi there is exactly one index left to check; using < would skip checking it.',
      skills: ['binary-search'],
    },
    {
      id: 'dayof:patterns:q11',
      q: 'Monotonic stack next-greater code pops index j when nums[i] beats the top. What does that mean?',
      code: 'while stack and nums[stack[-1]] < nums[i]:\n    j = stack.pop()\n    result[j] = nums[i]',
      choices: ['nums[j] has no next greater element', "nums[i] is nums[j]'s next greater element", 'nums[j] is just discarded', 'the stack is now empty'],
      answer: 1,
      why: "The stack only pops when the current value beats the top, so nums[i] is exactly that element's next-greater answer.",
      skills: ['monotonic-stack'],
    },
    {
      id: 'dayof:patterns:q12',
      q: 'Largest rectangle in histogram — width when popping index stack[-1] at position i?',
      choices: ['i - stack[-1]', 'i - stack[-1] - 1', 'i - stack[-1] + 1', 'stack[-1] - i'],
      answer: 1,
      why: 'The rectangle spans from just after the new stack top to just before i, excluding both boundary indices.',
      skills: ['monotonic-stack'],
    },
    {
      id: 'dayof:patterns:q13',
      q: 'Daily temperatures (monotonic stack): what do you store on the stack?',
      choices: ['the temperature value', 'the index', 'both as a tuple', 'nothing, just a counter'],
      answer: 1,
      why: 'You need the index to compute the day-distance (i - poppedIndex) once a warmer day pops it.',
      skills: ['monotonic-stack'],
    },
    {
      id: 'dayof:patterns:q14',
      q: 'Sliding window maximum with a deque — when do you pop from the front?',
      choices: ['when the deque is empty', 'when window[0] <= i - k (it fell outside the window)', 'every single iteration', 'when nums[window[0]] is negative'],
      answer: 1,
      why: 'The front index has fallen out of the current window of size k, so it can no longer be the max.',
      skills: ['queue-deque'],
    },
    {
      id: 'dayof:patterns:q15',
      q: 'heapq only gives a min-heap. To get the k LARGEST elements with a size-k heap, what do you do?',
      choices: ['push negative values, pop on overflow, negate back', 'push positive values and pop the max each time', 'sort the array and slice the end', 'use a stack instead of a heap'],
      answer: 0,
      why: 'heapq.heappop always removes the smallest; negating flips max-selection into min-selection.',
      skills: ['heap'],
    },
    {
      id: 'dayof:patterns:q16',
      q: 'Finding the kth largest with a size-capped min-heap: when do you pop?',
      choices: ['never pop', 'pop whenever len(heap) > k', 'pop before every push', 'pop only once at the very end'],
      answer: 1,
      why: 'Keeping exactly k elements means the smallest of those k — heap[0] — is always the kth largest so far.',
      skills: ['heap'],
    },
    {
      id: 'dayof:patterns:q17',
      q: 'Intervals sorted by start. Merge condition with the last kept interval?',
      choices: ['start < result[-1][0]', 'start <= result[-1][1]', 'end <= result[-1][1]', 'start == result[-1][1]'],
      answer: 1,
      why: "If the new interval starts before or at the last interval's end, they overlap and should merge.",
      skills: ['intervals'],
    },
    {
      id: 'dayof:patterns:q18',
      q: 'Meeting Rooms II (heap of end times): when do you reuse a room instead of adding one?',
      choices: ['when start >= heap[0] (the earliest end time)', 'when start < heap[0]', 'when the heap is empty', 'you always reuse the same room'],
      answer: 0,
      why: 'If the new meeting starts after the earliest-ending meeting finished, that room is free to reuse.',
      skills: ['intervals'],
    },
    {
      id: 'dayof:patterns:q19',
      q: 'Max non-overlapping intervals (greedy keep) — sort by what?',
      choices: ['start time', 'end time', 'interval length', 'no sort needed'],
      answer: 1,
      why: 'Sorting by end time lets you greedily keep the interval that frees up the earliest room for the next pick.',
      skills: ['intervals'],
    },
    {
      id: 'dayof:patterns:q20',
      q: "Backtracking's core is append → recurse → pop. What does the pop do?",
      choices: ['removes the worst solution found so far', 'undoes the last choice so the next sibling starts clean', 'ends the recursion early', 'sorts the path in place'],
      answer: 1,
      why: "Popping restores path to its state before this branch, so the next sibling choice isn't contaminated.",
      skills: ['backtracking'],
    },
    {
      id: 'dayof:patterns:q21',
      q: 'Subsets/combinations use a start index to avoid repeats. Permutations instead use?',
      choices: ['a start index too', 'a used set, looping from index 0 every level', 'sorting the input first', 'no tracking at all'],
      answer: 1,
      why: 'Order matters in permutations, so every level must try ALL remaining elements, tracked with a used set.',
      skills: ['backtracking'],
    },
    {
      id: 'dayof:patterns:q22',
      q: 'House robber: dp[i] = ?',
      choices: ['dp[i - 1] + nums[i]', 'max(dp[i - 1], dp[i - 2] + nums[i])', 'max(dp[i - 1], nums[i])', 'dp[i - 2] + nums[i]'],
      answer: 1,
      why: 'Either skip house i (keep dp[i-1]) or rob it and add to dp[i-2], since the adjacent house is now forbidden.',
      skills: ['dp-1d'],
    },
    {
      id: 'dayof:patterns:q23',
      q: 'Coin change (min coins to make amount a): dp[a] = ?',
      choices: ['min(dp[a - c]) over each coin c', 'min(dp[a - c] + 1) over each coin c', 'dp[a - 1] + 1', 'max(dp[a - c] + 1) over each coin c'],
      answer: 1,
      why: 'Using one more coin of value c to reach amount a costs 1 plus the best way to reach a-c.',
      skills: ['dp-1d'],
    },
    {
      id: 'dayof:patterns:q24',
      q: 'LCS 2D table is filled with i, j going from len down to 0 — why that direction?',
      choices: ['dp[i][j] needs dp[i+1][j+1], dp[i+1][j], dp[i][j+1] already computed', "it's arbitrary, any order works", 'forward order is actually required', 'to save memory only'],
      answer: 0,
      why: 'Filling backwards guarantees the three cells a transition depends on are already computed.',
      skills: ['dp-2d'],
    },
    {
      id: 'dayof:patterns:q25',
      q: 'Reverse linked list: why save nxt = curr.next BEFORE curr.next = prev?',
      code: 'nxt = curr.next\ncurr.next = prev\nprev, curr = curr, nxt',
      choices: ["it doesn't matter, the order is free", "curr.next is about to be overwritten — you'd lose the rest of the list", 'to save memory', 'Python requires this order for syntax reasons'],
      answer: 1,
      why: "Overwriting curr.next first would permanently lose the pointer to the remaining unreversed nodes.",
      skills: ['linked-list'],
    },
  ],
}
