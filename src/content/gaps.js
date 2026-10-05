import { skillIds } from './skills.js'

const topicId = 'gaps'

const unwrap = input => (input && typeof input === 'object' && !Array.isArray(input) && 'value' in input && 'label' in input) ? input.value : input

const lineFinder = code => {
  const lines = code.split('\n')
  return (text, nth = 1) => {
    let seen = 0
    for (let i = 0; i < lines.length; i++) if (lines[i].includes(text) && ++seen === nth) return i + 1
    throw new Error(`line not found: ${text}`)
  }
}

const range = n => Array.from({ length: Math.max(0, n) }, (_, i) => i)
const clone = value => JSON.parse(JSON.stringify(value))
const partA = (() => {
  const subarraySumCode = `from collections import defaultdict as dd

class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        prefixCount = dd(int)
        prefixCount[0] = 1
        total = 0
        result = 0

        for num in nums:
            total += num
            result += prefixCount[total - k]
            prefixCount[total] += 1

        return result`

  const contiguousCode = `class Solution:
    def findMaxLength(self, nums: List[int]) -> int:
        firstSeen = {0: -1}
        balance = 0
        result = 0

        for i, num in enumerate(nums):
            balance += 1 if num == 1 else -1
            if balance in firstSeen:
                result = max(result, i - firstSeen[balance])
            else:
                firstSeen[balance] = i

        return result`

  const binarySearchCode = `class Solution:
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

        return -1`

  const kokoCode = `class Solution:
    def minEatingSpeed(self, piles: List[int], h: int) -> int:
        left, right = 1, max(piles)

        while left < right:
            speed = (left + right) // 2
            hours = sum((pile + speed - 1) // speed for pile in piles)
            if hours <= h:
                right = speed
            else:
                left = speed + 1

        return left`

  const splitArrayCode = `class Solution:
    def splitArray(self, nums: List[int], k: int) -> int:
        def canSplit(limit):
            pieces, total = 1, 0
            for num in nums:
                if total + num > limit:
                    pieces += 1
                    total = 0
                total += num
            return pieces <= k

        left, right = max(nums), sum(nums)

        while left < right:
            mid = (left + right) // 2
            if canSplit(mid):
                right = mid
            else:
                left = mid + 1

        return left`

  const productCode = `class Solution:
    def numSubarrayProductLessThanK(self, nums: List[int], k: int) -> int:
        if k <= 1:
            return 0

        product = 1
        left = 0
        result = 0

        for right in range(len(nums)):
            product *= nums[right]
            while product >= k:
                product //= nums[left]
                left += 1
            result += right - left + 1

        return result`

  const minSizeCode = `class Solution:
    def minSubArrayLen(self, target: int, nums: List[int]) -> int:
        left = 0
        total = 0
        result = float('inf')

        for right in range(len(nums)):
            total += nums[right]
            while total >= target:
                result = min(result, right - left + 1)
                total -= nums[left]
                left += 1

        return result if result != float('inf') else 0`

  const binarySubarraysCode = `class Solution:
    def numSubarraysWithSum(self, nums: List[int], goal: int) -> int:
        def atMost(limit):
            if limit < 0:
                return 0
            left = total = result = 0
            for right in range(len(nums)):
                total += nums[right]
                while total > limit:
                    total -= nums[left]
                    left += 1
                result += right - left + 1
            return result

        return atMost(goal) - atMost(goal - 1)`

  const nextPermCode = `class Solution:
    def nextPermutation(self, nums: List[int]) -> None:
        pivot = len(nums) - 2
        while pivot >= 0 and nums[pivot] >= nums[pivot + 1]:
            pivot -= 1

        if pivot >= 0:
            swap = len(nums) - 1
            while nums[swap] <= nums[pivot]:
                swap -= 1
            nums[pivot], nums[swap] = nums[swap], nums[pivot]

        left, right = pivot + 1, len(nums) - 1
        while left < right:
            nums[left], nums[right] = nums[right], nums[left]
            left += 1
            right -= 1`

  const lessons = [
    {
      id: `${topicId}:prefix-hash:lesson`,
      title: 'Prefix sum + hashmap',
      skills: ['prefix-sum', 'arrays-hashing'],
      slides: [
        {
          title: 'Running ==total== at every index',
          panels: [
            { kind: 'array', label: 'nums', values: [3, 4, 7, 2, -3], pointers: {}, highlight: [] },
            { kind: 'array', label: 'prefix (total after i)', values: [3, 7, 14, 16, 13], pointers: {}, highlight: [] },
          ],
          points: ['prefix[i] = sum of nums[0..i]', 'Any subarray sum = ==prefix[j] − prefix[i]=='],
        },
        {
          title: 'Flip the question',
          panels: [
            { kind: 'array', label: 'prefix', values: [0, 3, 7, 14, 16, 13], pointers: { earlier: 2, now: 3 }, highlight: [2, 3] },
            { kind: 'text', text: '14 − 7 = 7 → subarray [7] sums to k=7' },
          ],
          points: ['Want sum k ending here?', 'Need an ==earlier prefix== equal to ==total − k=='],
        },
        {
          title: 'Hashmap remembers earlier prefixes',
          panels: [
            { kind: 'hashmap', label: 'prefixCount', entries: [[0, 1], [3, 1], [7, 1]], highlight: [7] },
          ],
          points: ['Look up ==total − k== → add its count', 'Then store current total', 'Seed ==prefixCount[0] = 1== for subarrays starting at 0'],
        },
        {
          title: 'Template',
          code: `prefixCount = dd(int)
prefixCount[0] = 1
total = result = 0
for num in nums:
    total += num
    result += prefixCount[total - k]
    prefixCount[total] += 1`,
          highlight: 6,
          points: ['Lookup ==before== insert, or k=0 counts empty subarray'],
        },
        {
          title: 'Why not sliding window?',
          panels: [{ kind: 'complexity', n: 'n', ops: 'n lookups × O(1)' }],
          points: ['==Negatives== break window shrinking', 'O(n) time, O(n) space for the map', 'Brute force O(n²) dies at n = 2·10^4'],
        },
        {
          title: 'Check',
          ask: { q: 'Longest subarray with equal 0s and 1s. Map stores?', choices: ['Count of each prefix', 'First index of each balance', 'Last index of each balance', 'Sorted prefixes'], answer: 1, why: 'Longest wants the earliest matching balance, so keep only the first index.' },
        },
      ],
    },
    {
      id: `${topicId}:bs-answer:lesson`,
      title: 'Binary search on the answer',
      skills: ['binary-search', 'constraints'],
      slides: [
        {
          title: 'One clean ==template==',
          code: `left, right = 0, len(nums) - 1
while left <= right:
    mid = (left + right) // 2
    if nums[mid] == target:
        return mid
    elif nums[mid] < target:
        left = mid + 1
    else:
        right = mid - 1
return -1`,
          highlight: 2,
          points: ['==left <= right==: range still non-empty', 'Always move past mid'],
        },
        {
          title: 'Answers form a ==yes/no line==',
          panels: [
            { kind: 'array', label: 'speed → can finish in h?', values: ['no', 'no', 'no', 'yes', 'yes', 'yes'], pointers: { first: 3 }, highlight: [3, 4, 5], dim: [0, 1, 2] },
          ],
          points: ['==Monotone==: once yes, always yes', 'Find the ==first yes=='],
        },
        {
          title: 'Shrink toward the first yes',
          panels: [
            { kind: 'array', label: 'candidates', values: [1, 2, 3, 4, 5, 6, 7, 8], pointers: { left: 0, mid: 3, right: 7 }, window: [0, 7], highlight: [3] },
          ],
          points: ['mid works → ==right = mid== (keep it)', 'mid fails → ==left = mid + 1==', '==while left < right==, return left'],
        },
        {
          title: 'Template',
          code: `left, right = lowest, highest
while left < right:
    mid = (left + right) // 2
    if feasible(mid):
        right = mid
    else:
        left = mid + 1
return left`,
          highlight: 5,
          points: ['Write ==feasible== as a greedy O(n) check'],
        },
        {
          title: 'Spot it from ==constraints==',
          panels: [{ kind: 'complexity', n: 'values ≤ 10^9', ops: 'log(10^9) ≈ 30 checks × O(n)' }],
          points: ['"minimize the maximum", "smallest speed/capacity"', 'Values up to 10^9 → search the ==value range==', 'O(n log range)'],
        },
      ],
    },
    {
      id: `${topicId}:window-count:lesson`,
      title: 'Counting with a sliding window',
      skills: ['sliding-window', 'two-pointers'],
      slides: [
        {
          title: 'Each valid window adds ==right − left + 1==',
          panels: [
            { kind: 'array', label: 'nums (product < 100)', values: [10, 5, 2, 6], pointers: { left: 1, right: 3 }, window: [1, 3], highlight: [3] },
            { kind: 'text', text: 'ending at 6: [6] [2,6] [5,2,6] → 3 = 3 − 1 + 1' },
          ],
          points: ['Count subarrays ==ending at right=='],
        },
        {
          title: 'Why it is safe',
          panels: [
            { kind: 'array', label: 'window', values: [10, 5, 2, 6], pointers: { left: 1, right: 3 }, window: [1, 3], dim: [0] },
          ],
          points: ['Positives only: shrinking a valid window ==stays valid==', 'So every start in [left, right] works'],
        },
        {
          title: 'Exactly k = ==atMost(k) − atMost(k−1)==',
          panels: [
            { kind: 'table', label: '[1,0,1,0,1], goal 2', rows: [['atMost(2)', 14], ['atMost(1)', 10], ['exactly 2', 4]], highlight: ['2,1'], deps: ['0,1', '1,1'] },
          ],
          points: ['"Exactly" windows don\'t shrink cleanly', '"At most" ones do'],
        },
        {
          title: 'Template',
          code: `left = result = 0
for right in range(len(nums)):
    add(nums[right])
    while invalid():
        remove(nums[left])
        left += 1
    result += right - left + 1`,
          highlight: 7,
          points: ['Min length? Record ==inside== the while instead'],
        },
        {
          title: 'Cost',
          panels: [{ kind: 'complexity', n: 'n', ops: '≤ 2n pointer moves' }],
          points: ['left and right only move forward', '==O(n)== time, O(1) space', 'Negatives present? Use ==prefix sum + hashmap=='],
        },
      ],
    },
    {
      id: `${topicId}:next-perm:lesson`,
      title: 'Next permutation',
      skills: ['two-pointers', 'math'],
      slides: [
        {
          title: 'Find the ==pivot== from the right',
          panels: [
            { kind: 'array', label: 'nums', values: [1, 3, 5, 4, 2], pointers: { pivot: 1 }, highlight: [1], window: [2, 4] },
          ],
          points: ['Suffix 5,4,2 is ==descending==: already its max', 'First dip from right: 3'],
        },
        {
          title: 'Swap with ==next bigger== in suffix',
          panels: [
            { kind: 'array', label: 'after swap', values: [1, 4, 5, 3, 2], pointers: { pivot: 1, swap: 3 }, highlight: [1, 3] },
          ],
          points: ['Rightmost value > pivot: 4', 'Suffix stays descending'],
        },
        {
          title: '==Reverse== the suffix',
          panels: [
            { kind: 'array', label: 'answer', values: [1, 4, 2, 3, 5], pointers: {}, highlight: [2, 3, 4] },
          ],
          points: ['Descending → ascending = smallest tail', 'No pivot? Reverse everything'],
        },
        {
          title: 'Template',
          code: nextPermCode,
          highlight: 4,
          points: ['Use ==>=== and ==<=== so duplicates work'],
        },
        {
          title: 'Cost',
          panels: [{ kind: 'complexity', n: 'n', ops: '≤ 3 linear passes' }],
          points: ['==O(n)== time, ==O(1)== space, in place', 'Generating all perms would be O(n!)'],
        },
      ],
    },
  ]

  const prefixTrace = {
    id: `${topicId}:prefix-hash:trace:subarray-sum`,
    title: 'Subarray Sum Equals K',
    skills: ['prefix-sum', 'arrays-hashing'],
    problem: 'Count contiguous subarrays whose sum equals k. Values can be negative.',
    code: subarraySumCode,
    complexity: { time: 'O(n)', space: 'O(n)', why: 'One pass, O(1) map lookup per element; map holds up to n prefixes.' },
    inputs: [
      { label: 'basic', value: { nums: [1, 2, 3], k: 3 } },
      { label: 'negatives', value: { nums: [3, 4, 7, 2, -3, 1, 4, 2], k: 7 } },
      { label: 'zero sum', value: { nums: [1, -1, 1, -1], k: 0 } },
    ],
    run(input, t) {
      const { nums, k } = unwrap(input)
      const L = lineFinder(subarraySumCode)
      const prefixCount = new Map()
      const prefixes = []
      let total = 0
      let result = 0
      const view = (i, hit = null) => [
        { kind: 'array', label: 'nums', values: [...nums], pointers: i == null ? {} : { i }, highlight: i == null ? [] : [i], dim: i == null ? [] : range(nums.length).filter(j => j > i) },
        { kind: 'array', label: 'prefix sums so far (start 0)', values: [0, ...prefixes], pointers: {}, highlight: hit == null ? [] : [0, ...prefixes].map((v, j) => v === hit ? j : -1).filter(j => j >= 0) },
        { kind: 'hashmap', label: 'prefixCount', entries: [...prefixCount.entries()].map(([a, b]) => [a, b]), highlight: hit == null ? [] : [hit] },
        { kind: 'text', text: `total = ${total} · need total − k = ${total - k} · result = ${result}` },
      ]
      t.step(L('prefixCount = dd(int)'), { vars: { k }, panels: view(null), note: 'Map: prefix sum → how many times seen.', say: 'A subarray sum is a difference of two prefix sums, so I count prefixes in a hashmap.' })
      prefixCount.set(0, 1)
      t.step(L('prefixCount[0] = 1'), { vars: { k }, panels: view(null), note: 'Empty prefix: lets subarrays start at index 0.', say: 'I seed zero once so a prefix that equals k by itself is counted.' })
      t.step(L('total = 0'), { vars: { total }, panels: view(null), note: 'Running sum.' })
      t.step(L('result = 0'), { vars: { result }, panels: view(null), note: 'Subarrays found.' })
      let saidLookup = false
      nums.forEach((num, i) => {
        t.step(L('for num in nums'), { vars: { i, num }, panels: view(i), note: `Visit ${num}.` })
        total += num
        t.step(L('total += num'), { vars: { i, total }, panels: view(i), note: `Prefix through index ${i} is ${total}.` })
        const need = total - k
        const found = prefixCount.get(need) || 0
        result += found
        t.step(L('result += prefixCount'), { vars: { need, found, result }, panels: view(i, need), note: found ? `${need} seen ${found}× → ${found} subarray(s) end here.` : `${need} never seen. Nothing ends here.`, say: !saidLookup ? 'If an earlier prefix equals total minus k, the part between them sums to k. I add how many such prefixes exist.' : undefined })
        saidLookup = true
        prefixCount.set(total, (prefixCount.get(total) || 0) + 1)
        prefixes.push(total)
        t.step(L('prefixCount[total] += 1'), { vars: { total, count: prefixCount.get(total) }, panels: view(i, total), note: 'Record after lookup so k=0 skips empty subarray.' })
      })
      t.step(L('return result'), { vars: { result }, panels: view(null), note: `${result} subarrays sum to ${k}.`, say: 'One pass with constant-time lookups: O(n) time, O(n) space. Sliding window fails because of negatives.' })
    },
  }

  const kokoTrace = {
    id: `${topicId}:bs-answer:trace:koko`,
    title: 'Koko Eating Bananas',
    skills: ['binary-search', 'constraints'],
    problem: 'Smallest eating speed k so all piles finish within h hours.',
    code: kokoCode,
    complexity: { time: 'O(n log max)', space: 'O(1)', why: 'log(max pile) guesses, each sums n piles.' },
    inputs: [
      { label: 'classic', value: { piles: [3, 6, 7, 11], h: 8 } },
      { label: 'tight h', value: { piles: [30, 11, 23, 4, 20], h: 5 } },
      { label: 'loose h', value: { piles: [30, 11, 23, 4, 20], h: 6 } },
    ],
    run(input, t) {
      const { piles, h } = unwrap(input)
      const L = lineFinder(kokoCode)
      const maxPile = Math.max(...piles)
      let left = 1
      let right = maxPile
      const speeds = range(maxPile).map(i => i + 1)
      const verdict = {}
      const view = (mid = null, perPile = null) => [
        { kind: 'array', label: 'candidate speeds (answer is first "yes")', values: speeds.map(s => verdict[s] ? `${s}${verdict[s]}` : s), pointers: mid == null ? { left: left - 1, right: right - 1 } : { left: left - 1, mid: mid - 1, right: right - 1 }, window: [left - 1, right - 1], highlight: mid == null ? [] : [mid - 1], dim: speeds.filter(s => s < left || s > right).map(s => s - 1) },
        { kind: 'table', label: 'hours per pile at this speed', rows: [piles.map(p => p), perPile ? perPile : piles.map(() => '·')], rowLabels: ['pile', 'hours'], colLabels: piles.map((_, i) => `#${i}`), highlight: [], deps: [] },
        { kind: 'text', text: `h = ${h} · range [${left}, ${right}]` },
      ]
      t.step(L('left, right = 1'), { vars: { left, right, h }, panels: view(), note: 'Speed 1 is slowest; max pile always works.', say: 'Speeds up to 10^9 means I cannot try each one. Feasibility is monotone, so I binary search the speed.' })
      let said = false
      while (true) {
        t.step(L('while left < right'), { vars: { left, right }, panels: view(), note: left < right ? 'Range has 2+ candidates.' : 'One candidate left: the answer.' })
        if (!(left < right)) break
        const speed = Math.floor((left + right) / 2)
        t.step(L('speed = (left + right) // 2'), { vars: { left, right, speed }, panels: view(speed), note: `Try speed ${speed}.` })
        const perPile = piles.map(p => Math.ceil(p / speed))
        const hours = perPile.reduce((a, b) => a + b, 0)
        t.step(L('hours = sum('), { vars: { speed, hours }, panels: view(speed, perPile), note: `Ceil each pile / ${speed} → ${hours} hours.`, say: !said ? 'The check is greedy: each pile takes ceil of pile over speed hours.' : undefined })
        t.step(L('if hours <= h'), { vars: { hours, h }, panels: view(speed, perPile), note: hours <= h ? `${hours} ≤ ${h}: fast enough.` : `${hours} > ${h}: too slow.` })
        if (hours <= h) {
          verdict[speed] = '✓'
          right = speed
          t.step(L('right = speed'), { vars: { left, right }, panels: view(), note: 'Keep this speed; look for slower.', say: !said ? 'It works, so the answer is this speed or smaller. I keep mid by setting right to mid.' : undefined })
        } else {
          verdict[speed] = '✗'
          left = speed + 1
          t.step(L('left = speed + 1'), { vars: { left, right }, panels: view(), note: 'Discard this speed and slower.', say: !said ? 'Too slow, so everything up to mid fails. Left jumps past mid.' : undefined })
        }
        said = true
      }
      t.step(L('return left'), { vars: { answer: left }, panels: view(), note: `Minimum speed = ${left}.`, say: 'log of max pile guesses, each O(n): O(n log max). O(1) extra space.' })
    },
  }

  const productTrace = {
    id: `${topicId}:window-count:trace:product`,
    title: 'Subarray Product Less Than K',
    skills: ['sliding-window', 'two-pointers'],
    problem: 'Count contiguous subarrays (positive ints) with product strictly less than k.',
    code: productCode,
    complexity: { time: 'O(n)', space: 'O(1)', why: 'left and right each move forward at most n times.' },
    inputs: [
      { label: 'classic', value: { nums: [10, 5, 2, 6], k: 100 } },
      { label: 'shrinks', value: { nums: [2, 3, 4, 1, 5], k: 10 } },
      { label: 'ones', value: { nums: [1, 1, 1], k: 2 } },
    ],
    run(input, t) {
      const { nums, k } = unwrap(input)
      const L = lineFinder(productCode)
      let product = 1
      let left = 0
      let result = 0
      const added = []
      const view = (right = null) => [
        { kind: 'array', label: 'nums', values: [...nums], pointers: right == null ? { left } : { left, right }, window: right == null || left > right ? undefined : [left, right], highlight: right == null ? [] : [right], dim: range(nums.length).filter(j => j < left) },
        { kind: 'array', label: 'count added per right', values: [...added], pointers: {}, highlight: added.length ? [added.length - 1] : [] },
        { kind: 'text', text: `product = ${product} · k = ${k} · result = ${result}` },
      ]
      t.step(L('if k <= 1'), { vars: { k }, panels: view(), note: k <= 1 ? 'Positive products are ≥ 1: none qualify.' : 'Some product can be below k.' })
      if (k <= 1) {
        t.step(L('return 0'), { vars: {}, panels: view(), note: 'Edge case.' })
        return
      }
      t.step(L('product = 1'), { vars: { product }, panels: view(), note: 'Empty window product.', say: 'All values positive, so growing a window only grows the product. That makes a sliding window valid.' })
      t.step(L('left = 0'), { vars: { left }, panels: view(), note: 'Window start.' })
      t.step(L('result = 0'), { vars: { result }, panels: view(), note: 'Subarray count.' })
      let saidCount = false
      for (let right = 0; right < nums.length; right++) {
        t.step(L('for right in range'), { vars: { right }, panels: view(right), note: `Extend to index ${right}.` })
        product *= nums[right]
        t.step(L('product *= nums[right]'), { vars: { product }, panels: view(right), note: `Multiply in ${nums[right]}.` })
        while (product >= k) {
          t.step(L('while product >= k'), { vars: { product, k }, panels: view(right), note: `${product} ≥ ${k}: too big, shrink.` })
          product = Math.floor(product / nums[left])
          t.step(L('product //= nums[left]'), { vars: { product }, panels: view(right), note: `Divide out ${nums[left]}.` })
          left += 1
          t.step(L('left += 1'), { vars: { left }, panels: view(right), note: 'Drop from the left.' })
        }
        t.step(L('while product >= k'), { vars: { product, k }, panels: view(right), note: `${product} < ${k}: window valid.` })
        result += right - left + 1
        added.push(right - left + 1)
        t.step(L('result += right - left + 1'), { vars: { right, left, added: right - left + 1, result }, panels: view(right), note: `${right - left + 1} subarrays end at ${right}.`, say: !saidCount ? 'Every subarray ending at right and starting anywhere in the window is valid, so I add the window length.' : undefined })
        saidCount = true
      }
      t.step(L('return result'), { vars: { result }, panels: view(), note: `${result} subarrays.`, say: 'Each pointer only moves forward, so it is O(n) time and O(1) space.' })
    },
  }

  const nextPermTrace = {
    id: `${topicId}:next-perm:trace:next-permutation`,
    title: 'Next Permutation',
    skills: ['two-pointers', 'math'],
    problem: 'Rearrange nums in place into the next lexicographically greater permutation (wrap to sorted).',
    code: nextPermCode,
    complexity: { time: 'O(n)', space: 'O(1)', why: 'Pivot scan, swap scan, reverse: each at most n steps, in place.' },
    inputs: [
      { label: 'middle pivot', value: [1, 3, 5, 4, 2] },
      { label: 'long suffix', value: [2, 6, 5, 4, 3, 1] },
      { label: 'max wraps', value: [3, 2, 1] },
      { label: 'duplicates', value: [1, 5, 1] },
    ],
    run(input, t) {
      const nums = [...unwrap(input)]
      const L = lineFinder(nextPermCode)
      let pivot = nums.length - 2
      const view = (pointers, highlight = [], suffixFrom = null) => [
        { kind: 'array', label: 'nums', values: [...nums], pointers: Object.fromEntries(Object.entries(pointers).filter(([, v]) => v >= 0 && v < nums.length)), highlight, window: suffixFrom != null && suffixFrom < nums.length ? [suffixFrom, nums.length - 1] : undefined },
      ]
      t.step(L('pivot = len(nums) - 2'), { vars: { pivot }, panels: view({ pivot }, [pivot]), note: 'Start at second-to-last.', say: 'I scan from the right for the first spot where the sequence dips. Everything right of it is descending, already maxed out.' })
      while (pivot >= 0 && nums[pivot] >= nums[pivot + 1]) {
        t.step(L('while pivot >= 0'), { vars: { pivot, here: nums[pivot], next: nums[pivot + 1] }, panels: view({ pivot }, [pivot, pivot + 1], pivot + 1), note: `${nums[pivot]} ≥ ${nums[pivot + 1]}: still descending.` })
        pivot -= 1
        t.step(L('pivot -= 1'), { vars: { pivot }, panels: view({ pivot }, pivot >= 0 ? [pivot] : [], pivot + 1), note: 'Move left.' })
      }
      t.step(L('while pivot >= 0'), { vars: { pivot }, panels: view({ pivot }, pivot >= 0 ? [pivot] : [], pivot + 1), note: pivot >= 0 ? `Dip found: ${nums[pivot]} < ${nums[pivot + 1]}.` : 'Whole array descending: no pivot.' })
      t.step(L('if pivot >= 0'), { vars: { pivot }, panels: view({ pivot }, [], pivot + 1), note: pivot >= 0 ? 'Bump the pivot up a little.' : 'Skip swap; just reverse all.', say: pivot < 0 ? 'This is the largest permutation, so the next one wraps to sorted order: reverse everything.' : undefined })
      if (pivot >= 0) {
        let swap = nums.length - 1
        t.step(L('swap = len(nums) - 1'), { vars: { swap }, panels: view({ pivot, swap }, [swap], pivot + 1), note: 'Scan suffix from the right.' })
        while (nums[swap] <= nums[pivot]) {
          t.step(L('while nums[swap] <= nums[pivot]'), { vars: { swap, value: nums[swap], pivotVal: nums[pivot] }, panels: view({ pivot, swap }, [swap], pivot + 1), note: `${nums[swap]} ≤ ${nums[pivot]}: not bigger.` })
          swap -= 1
          t.step(L('swap -= 1'), { vars: { swap }, panels: view({ pivot, swap }, [swap], pivot + 1), note: 'Move left.' })
        }
        t.step(L('while nums[swap] <= nums[pivot]'), { vars: { swap }, panels: view({ pivot, swap }, [pivot, swap], pivot + 1), note: `${nums[swap]} is the smallest value bigger than ${nums[pivot]}.`, say: 'Because the suffix is descending, the rightmost bigger value is the smallest bigger one.' })
        const tmp = nums[pivot]
        nums[pivot] = nums[swap]
        nums[swap] = tmp
        t.step(L('nums[pivot], nums[swap] ='), { vars: { nums: [...nums] }, panels: view({ pivot, swap }, [pivot, swap], pivot + 1), note: 'Swap. Suffix is still descending.' })
      }
      let left = pivot + 1
      let right = nums.length - 1
      t.step(L('left, right = pivot + 1'), { vars: { left, right }, panels: view({ left, right }, [], pivot + 1), note: 'Reverse the suffix.', say: 'The suffix is descending; reversing makes it the smallest possible tail.' })
      while (true) {
        t.step(L('while left < right'), { vars: { left, right }, panels: view({ left, right }, left < right ? [left, right] : [], pivot + 1), note: left < right ? 'Swap ends.' : 'Pointers met: done.' })
        if (!(left < right)) break
        const tmp = nums[left]
        nums[left] = nums[right]
        nums[right] = tmp
        t.step(L('nums[left], nums[right] ='), { vars: { nums: [...nums] }, panels: view({ left, right }, [left, right], pivot + 1), note: 'Swapped.' })
        left += 1
        t.step(L('left += 1'), { vars: { left }, panels: view({ left, right }, [], pivot + 1), note: 'Step in.' })
        right -= 1
        t.step(L('right -= 1'), { vars: { right }, panels: view({ left, right }, [], pivot + 1), note: 'Step in.' })
      }
      t.step(L('while left < right'), { vars: { nums: [...nums] }, panels: view({}, []), note: `Result: [${nums.join(', ')}].`, say: 'Three linear scans, in place: O(n) time, O(1) space.' })
    },
  }

  const traces = [prefixTrace, kokoTrace, productTrace, nextPermTrace]

  const flashcards = [
    { id: `${topicId}:prefix-hash:card:1`, skills: ['prefix-sum'], front: 'Sum of nums[i..j] using prefix sums?', back: 'prefix[j+1] − prefix[i], where prefix[0] = 0. Any subarray sum is a difference of two prefixes.' },
    { id: `${topicId}:prefix-hash:card:2`, skills: ['prefix-sum', 'arrays-hashing'], front: 'Count subarrays summing to k (negatives allowed). Key lookup?', back: 'At each index, add prefixCount[total − k], then increment prefixCount[total]. O(n).' },
    { id: `${topicId}:prefix-hash:card:3`, skills: ['prefix-sum'], front: 'Why seed prefixCount[0] = 1?', back: 'Represents the empty prefix, so subarrays starting at index 0 (total == k) get counted.' },
    { id: `${topicId}:prefix-hash:card:4`, skills: ['prefix-sum', 'sliding-window'], front: 'Subarray sum = k: when does sliding window fail?', back: 'With negatives or zeros, shrinking does not reliably decrease the sum. Use prefix sum + hashmap.' },
    { id: `${topicId}:prefix-hash:card:5`, skills: ['prefix-sum', 'arrays-hashing'], front: 'Longest subarray, equal 0s and 1s: trick?', back: 'Map 0 → −1, track balance. Store first index of each balance (seed {0: −1}). Same balance twice = equal counts between.' },
    { id: `${topicId}:bs-answer:card:1`, skills: ['binary-search'], front: 'Exact-match binary search loop condition and updates?', back: 'while left <= right; left = mid + 1 or right = mid − 1; return −1 after loop.', code: 'while left <= right:\n    mid = (left + right) // 2' },
    { id: `${topicId}:bs-answer:card:2`, skills: ['binary-search'], front: 'First-true binary search template?', back: 'while left < right: if feasible(mid): right = mid else left = mid + 1. Return left.' },
    { id: `${topicId}:bs-answer:card:3`, skills: ['binary-search', 'constraints'], front: 'Signals for binary search on the answer?', back: '"minimize the maximum", "smallest speed/capacity/days", values up to 10^9, and a monotone yes/no check.' },
    { id: `${topicId}:bs-answer:card:4`, skills: ['binary-search'], front: 'Split Array Largest Sum: search range?', back: 'left = max(nums) (one piece must hold the biggest), right = sum(nums) (one piece).' },
    { id: `${topicId}:bs-answer:card:5`, skills: ['binary-search', 'complexity'], front: 'Cost of binary search on answer over range R?', back: 'O(log R) feasibility checks × cost of one check. Typically O(n log R).' },
    { id: `${topicId}:window-count:card:1`, skills: ['sliding-window'], front: 'Count subarrays where window is valid: what to add each step?', back: 'right − left + 1: every start from left to right gives a valid subarray ending at right.' },
    { id: `${topicId}:window-count:card:2`, skills: ['sliding-window'], front: 'Count subarrays with exactly k (sum/distinct/odds)?', back: 'atMost(k) − atMost(k − 1). "At most" windows shrink cleanly; "exactly" ones do not.' },
    { id: `${topicId}:window-count:card:3`, skills: ['sliding-window'], front: 'Min length window: where do you record the answer?', back: 'Inside the while-valid loop, before shrinking. Max length: after the while-invalid loop.' },
    { id: `${topicId}:window-count:card:4`, skills: ['sliding-window', 'complexity'], front: 'Why is a while inside a for still O(n) for windows?', back: 'left only moves forward, at most n times total across the whole loop. Amortized O(n).' },
    { id: `${topicId}:next-perm:card:1`, skills: ['two-pointers', 'math'], front: 'Next permutation step 1?', back: 'Scan from right for first i with nums[i] < nums[i+1]. That is the pivot; suffix after it is descending.' },
    { id: `${topicId}:next-perm:card:2`, skills: ['two-pointers', 'math'], front: 'Next permutation step 2?', back: 'From the right, find first nums[j] > nums[pivot]. Swap them.' },
    { id: `${topicId}:next-perm:card:3`, skills: ['two-pointers', 'math'], front: 'Next permutation step 3?', back: 'Reverse the suffix after the pivot (descending → ascending). If no pivot, reverse the whole array.' },
    { id: `${topicId}:next-perm:card:4`, skills: ['math', 'complexity'], front: 'Next permutation complexity?', back: 'O(n) time, O(1) space, in place. Listing all permutations would be O(n!).' },
  ]

  const mcqs = [
    { id: `${topicId}:prefix-hash:mcq:1`, skills: ['prefix-sum', 'ds-diagnosis'], difficulty: 1, q: 'Count subarrays with sum k; nums may be negative, n ≤ 2·10^4. Best tool?', choices: ['Sliding window', 'Prefix sum + hashmap', 'Sort + two pointers', 'Heap'], answer: 1, why: 'Negatives break window shrinking; sorting destroys contiguity. Prefix counts give O(n).' },
    { id: `${topicId}:prefix-hash:mcq:2`, skills: ['prefix-sum'], difficulty: 2, q: 'In subarraySum, what does prefixCount[total − k] count?', choices: ['Subarrays starting at i', 'Earlier prefixes that make a sum-k subarray ending here', 'Elements equal to k', 'Total subarrays so far'], answer: 1, why: 'total − earlier = k means the stretch between them sums to k.' },
    { id: `${topicId}:prefix-hash:mcq:3`, skills: ['prefix-sum'], difficulty: 2, q: 'You increment prefixCount[total] BEFORE the lookup. nums=[1], k=0 returns?', choices: ['0', '1', '2', 'Error'], answer: 1, why: 'Lookup finds the prefix you just added: counts an empty subarray. Correct answer is 0.' },
    { id: `${topicId}:prefix-hash:mcq:4`, skills: ['prefix-sum', 'arrays-hashing'], difficulty: 2, q: 'Contiguous Array (525): why store FIRST index of each balance?', choices: ['Saves memory', 'Longest length needs the earliest match', 'Avoids collisions', 'Counts subarrays'], answer: 1, why: 'Length = i − firstSeen[balance]; earliest index maximizes it.' },
    { id: `${topicId}:prefix-hash:mcq:5`, skills: ['prefix-sum', 'complexity'], difficulty: 1, q: 'Prefix sum + hashmap time and space?', choices: ['O(n) / O(1)', 'O(n) / O(n)', 'O(n log n) / O(n)', 'O(n²) / O(1)'], answer: 1, why: 'One pass with O(1) lookups; map can hold n distinct prefixes.' },
    { id: `${topicId}:bs-answer:mcq:1`, skills: ['binary-search', 'constraints'], difficulty: 1, q: 'piles ≤ 10^4, pile size ≤ 10^9. Try every speed 1..max?', choices: ['Fine, O(n)', 'Too slow: up to 10^13 ops', 'Fine with a heap', 'Needs DP'], answer: 1, why: '10^9 speeds × 10^4 piles. Binary search: ~30 × 10^4.' },
    { id: `${topicId}:bs-answer:mcq:2`, skills: ['binary-search'], difficulty: 2, q: 'First-true search uses right = mid. Loop condition must be?', choices: ['left <= right', 'left < right', 'left != right + 1', 'mid > 0'], answer: 1, why: 'With left <= right and right = mid, left == right never shrinks: infinite loop.' },
    { id: `${topicId}:bs-answer:mcq:3`, skills: ['binary-search'], difficulty: 2, q: 'Split Array Largest Sum: feasible(limit) returns?', choices: ['Pieces needed ≤ k', 'Pieces needed == k', 'Sum ≤ limit', 'max(nums) ≤ k'], answer: 0, why: 'Fewer pieces can always be split further, so ≤ k is monotone in limit.' },
    { id: `${topicId}:bs-answer:mcq:4`, skills: ['binary-search', 'constraints'], difficulty: 3, q: 'Which phrase most strongly signals binary search on the answer?', choices: ['"return all combinations"', '"minimize the largest sum"', '"shortest path"', '"top k frequent"'], answer: 1, why: 'Minimize a maximum with a monotone greedy check: classic search on value.' },
    { id: `${topicId}:bs-answer:mcq:5`, skills: ['binary-search', 'complexity'], difficulty: 2, q: 'Koko complexity, n piles, max pile M?', choices: ['O(n log n)', 'O(n log M)', 'O(M)', 'O(n · M)'], answer: 1, why: 'log M guesses, each sums n piles.' },
    { id: `${topicId}:window-count:mcq:1`, skills: ['sliding-window'], difficulty: 1, q: 'Window [left, right] valid. Subarrays ending at right that are valid?', choices: ['1', 'right − left', 'right − left + 1', 'n − right'], answer: 2, why: 'Starts left..right each give one; positives keep sub-windows valid.' },
    { id: `${topicId}:window-count:mcq:2`, skills: ['sliding-window', 'ds-diagnosis'], difficulty: 2, q: 'Count binary subarrays with sum exactly goal. Cleanest O(n)?', choices: ['One window for exactly goal', 'atMost(goal) − atMost(goal − 1)', 'Sort then two pointers', 'DP O(n²)'], answer: 1, why: 'Zeros make "exactly" windows ambiguous to shrink; at-most windows are monotone.' },
    { id: `${topicId}:window-count:mcq:3`, skills: ['sliding-window', 'constraints'], difficulty: 2, q: 'Min Size Subarray Sum, positives, n ≤ 10^5. Expected complexity?', choices: ['O(n²)', 'O(n) window', 'O(2^n)', 'O(n³)'], answer: 1, why: 'n = 10^5 needs O(n) or O(n log n); positives allow shrinking.' },
    { id: `${topicId}:window-count:mcq:4`, skills: ['sliding-window'], difficulty: 3, q: 'Product < k: why return 0 early when k ≤ 1?', choices: ['Speed only', 'Every product ≥ 1, and left would run past right', 'Division by zero', 'Overflow'], answer: 1, why: 'Shrink loop never satisfies; left overtakes right and divides an empty window.' },
    { id: `${topicId}:window-count:mcq:5`, skills: ['sliding-window', 'prefix-sum'], difficulty: 2, q: 'Count subarrays with sum k, values may be negative. Window counting works?', choices: ['Yes, always', 'No: use prefix sum + hashmap', 'Yes, if sorted first', 'Only for k = 0'], answer: 1, why: 'Negatives mean removing from left can increase the sum: not monotone.' },
    { id: `${topicId}:next-perm:mcq:1`, skills: ['two-pointers', 'math'], difficulty: 1, q: 'Next permutation of [1, 3, 5, 4, 2]?', choices: ['[1, 4, 2, 3, 5]', '[1, 3, 5, 2, 4]', '[1, 4, 5, 3, 2]', '[2, 1, 3, 4, 5]'], answer: 0, why: 'Pivot 3, swap with 4, reverse [5, 3, 2] → [2, 3, 5].' },
    { id: `${topicId}:next-perm:mcq:2`, skills: ['two-pointers'], difficulty: 2, q: 'After the swap, why reverse instead of sort the suffix?', choices: ['Sorting is wrong', 'Suffix is still descending, so reverse = sort in O(n)', 'Reverse is stable', 'To handle negatives'], answer: 1, why: 'Swap preserves descending order; reversing gives ascending without O(n log n).' },
    { id: `${topicId}:next-perm:mcq:3`, skills: ['math'], difficulty: 1, q: 'Next permutation of [3, 2, 1]?', choices: ['[3, 2, 1]', '[1, 2, 3]', '[2, 3, 1]', '[3, 1, 2]'], answer: 1, why: 'No pivot: largest permutation wraps to sorted ascending.' },
    { id: `${topicId}:next-perm:mcq:4`, skills: ['two-pointers'], difficulty: 3, q: 'Why does the pivot scan use >= rather than >?', choices: ['Speed', 'Equal neighbors are not a dip, so skip ties', 'Handles negatives', 'Avoids index error at 0'], answer: 1, why: 'With > on [1, 5, 5], pivot lands on the first 5 and the swap scan runs off the array.' },
  ]

  const clozes = [
    { id: `${topicId}:prefix-hash:cloze:1`, skills: ['prefix-sum', 'arrays-hashing'], title: 'Subarray Sum Equals K', code: `prefixCount = dd(int)
prefixCount[[[0]]] = 1
total = result = 0

for num in nums:
    total += num
    result += prefixCount[[[total - k]]]
    prefixCount[[[total]]] += 1`, hint: 'Look up what an earlier prefix must equal.' },
    { id: `${topicId}:bs-answer:cloze:1`, skills: ['binary-search'], title: 'First-true binary search', code: `left, right = 1, max(piles)

while left [[<]] right:
    speed = (left + right) // 2
    if hours(speed) <= h:
        right = [[speed]]
    else:
        left = [[speed + 1]]

return left`, hint: 'Keep a working mid; skip a failing one.' },
    { id: `${topicId}:window-count:cloze:1`, skills: ['sliding-window'], title: 'Count windows (at most)', code: `left = total = result = 0
for right in range(len(nums)):
    total += nums[right]
    while total [[>]] limit:
        total -= nums[[[left]]]
        left += 1
    result += [[right - left + 1]]`, hint: 'Every start inside the window counts.' },
    { id: `${topicId}:next-perm:cloze:1`, skills: ['two-pointers', 'math'], title: 'Find the pivot', code: `pivot = len(nums) - [[2]]
while pivot >= 0 and nums[pivot] [[>=]] nums[pivot + 1]:
    pivot -= 1`, hint: 'Walk left while the suffix is non-increasing.' },
  ]

  const parsons = [
    { id: `${topicId}:prefix-hash:parsons:1`, skills: ['prefix-sum', 'arrays-hashing'], title: 'Contiguous Array (525)', lines: [
      'firstSeen = {0: -1}',
      'balance = 0',
      'result = 0',
      'for i, num in enumerate(nums):',
      '    balance += 1 if num == 1 else -1',
      '    if balance in firstSeen:',
      '        result = max(result, i - firstSeen[balance])',
      '    else:',
      '        firstSeen[balance] = i',
      'return result',
    ], distractors: ['    firstSeen[balance] = i', 'firstSeen = {}'] },
    { id: `${topicId}:bs-answer:parsons:1`, skills: ['binary-search'], title: 'Koko Eating Bananas', lines: [
      'left, right = 1, max(piles)',
      'while left < right:',
      '    speed = (left + right) // 2',
      '    hours = sum((pile + speed - 1) // speed for pile in piles)',
      '    if hours <= h:',
      '        right = speed',
      '    else:',
      '        left = speed + 1',
      'return left',
    ], distractors: ['while left <= right:', '        right = speed - 1'] },
    { id: `${topicId}:window-count:parsons:1`, skills: ['sliding-window', 'two-pointers'], title: 'Subarray Product Less Than K', lines: [
      'if k <= 1:',
      '    return 0',
      'product = 1',
      'left = result = 0',
      'for right in range(len(nums)):',
      '    product *= nums[right]',
      '    while product >= k:',
      '        product //= nums[left]',
      '        left += 1',
      '    result += right - left + 1',
      'return result',
    ], distractors: ['    result += 1', '    while product > k:'] },
    { id: `${topicId}:next-perm:parsons:1`, skills: ['two-pointers', 'math'], title: 'Next Permutation', lines: [
      'pivot = len(nums) - 2',
      'while pivot >= 0 and nums[pivot] >= nums[pivot + 1]:',
      '    pivot -= 1',
      'if pivot >= 0:',
      '    swap = len(nums) - 1',
      '    while nums[swap] <= nums[pivot]:',
      '        swap -= 1',
      '    nums[pivot], nums[swap] = nums[swap], nums[pivot]',
      'left, right = pivot + 1, len(nums) - 1',
      'while left < right:',
      '    nums[left], nums[right] = nums[right], nums[left]',
      '    left, right = left + 1, right - 1',
    ], distractors: ['nums[pivot + 1:] = sorted(nums[pivot + 1:], reverse=True)'] },
  ]

  const problems = [
    {
      id: `${topicId}:problem:560`, lc: 560, title: 'Subarray Sum Equals K', difficulty: 'Medium', google: true, skills: ['prefix-sum', 'arrays-hashing'], pattern: 'Prefix sum + hashmap', ds: ['hashmap'],
      constraints: '1 ≤ n ≤ 2·10^4, −1000 ≤ nums[i] ≤ 1000', time: 'O(n)', space: 'O(n)',
      insight: 'Sum(i..j) = prefix[j] − prefix[i]; count earlier prefixes equal to total − k.',
      signals: ['subarray', 'sum equals k', 'count', 'negative values'],
      narration: ['Contiguous? Negatives allowed? Yes, so no sliding window.', 'Subarray sum is a difference of two prefix sums.', 'Map prefix → count, seeded with {0: 1}.', 'At each index add count of total − k, then record total.', 'O(n) time, O(n) space.'],
      solution: subarraySumCode, traceId: prefixTrace.id,
      pitfalls: ['Forgetting prefixCount[0] = 1', 'Inserting before lookup when k = 0', 'Using a window with negatives'],
    },
    {
      id: `${topicId}:problem:525`, lc: 525, title: 'Contiguous Array', difficulty: 'Medium', google: true, skills: ['prefix-sum', 'arrays-hashing'], pattern: 'Prefix balance + first index', ds: ['hashmap'],
      constraints: '1 ≤ n ≤ 10^5, nums[i] ∈ {0, 1}', time: 'O(n)', space: 'O(n)',
      insight: 'Treat 0 as −1; equal counts means same balance seen twice.',
      signals: ['equal number of 0 and 1', 'longest contiguous', 'binary array'],
      narration: ['Return length, not the subarray?', 'Map 0 to −1 and track a running balance.', 'Same balance at i and j → equal 0s and 1s between.', 'Store first index per balance, seeded {0: −1}.', 'O(n) time and space.'],
      solution: contiguousCode,
      pitfalls: ['Overwriting firstSeen (loses longest)', 'Missing {0: −1} seed'],
    },
    {
      id: `${topicId}:problem:704`, lc: 704, title: 'Binary Search', difficulty: 'Easy', google: true, skills: ['binary-search'], pattern: 'Binary search (exact)', ds: ['array'],
      constraints: '1 ≤ n ≤ 10^4, sorted, distinct', time: 'O(log n)', space: 'O(1)',
      insight: 'left <= right with mid ± 1 updates: no special cases needed.',
      signals: ['sorted', 'O(log n)', 'find target'],
      narration: ['Sorted ascending, distinct values?', 'Keep [left, right] as the live range.', 'Compare mid, discard half, move past mid.', 'Empty range means not found.', 'O(log n) time, O(1) space.'],
      solution: binarySearchCode,
      pitfalls: ['right = mid with left <= right loops forever', 'Checking nums[left]/nums[right] separately is unnecessary'],
    },
    {
      id: `${topicId}:problem:875`, lc: 875, title: 'Koko Eating Bananas', difficulty: 'Medium', google: true, skills: ['binary-search', 'constraints'], pattern: 'Binary search on answer', ds: ['array'],
      constraints: '1 ≤ n ≤ 10^4 ≤ h ≤ 10^9, piles[i] ≤ 10^9', time: 'O(n log M)', space: 'O(1)',
      insight: 'If speed s works, every faster speed works: search for the first working speed.',
      signals: ['minimum speed', 'within h hours', 'values up to 10^9'],
      narration: ['h ≥ number of piles, so max pile always works.', 'Feasibility is monotone in speed.', 'Binary search speed in [1, max(piles)].', 'Check: sum of ceil(pile / speed) ≤ h.', 'O(n log M), O(1) space.'],
      solution: kokoCode, traceId: kokoTrace.id,
      pitfalls: ['Float ceil precision: use (pile + speed − 1) // speed', 'Starting left at 0 → division by zero'],
    },
    {
      id: `${topicId}:problem:410`, lc: 410, title: 'Split Array Largest Sum', difficulty: 'Hard', google: true, skills: ['binary-search', 'greedy'], pattern: 'Binary search on answer + greedy check', ds: ['array'],
      constraints: '1 ≤ n ≤ 1000, nums[i] ≤ 10^6, 1 ≤ k ≤ min(50, n)', time: 'O(n log S)', space: 'O(1)',
      insight: 'Guess the max piece sum; greedily count pieces needed; fewer than k is fine.',
      signals: ['minimize the largest sum', 'split into k subarrays', 'non-empty contiguous'],
      narration: ['Pieces contiguous and non-empty?', 'Answer lies in [max(nums), sum(nums)].', 'Given a limit, greedily pack pieces and count them.', 'pieces ≤ k is monotone: search the first limit that works.', 'O(n log sum) time, O(1) space. DP would be O(k·n²).'],
      solution: splitArrayCode,
      pitfalls: ['left = 0 instead of max(nums)', 'Checking pieces == k (not monotone)'],
    },
    {
      id: `${topicId}:problem:713`, lc: 713, title: 'Subarray Product Less Than K', difficulty: 'Medium', google: true, skills: ['sliding-window', 'two-pointers'], pattern: 'Sliding window counting', ds: ['array'],
      constraints: '1 ≤ n ≤ 3·10^4, 1 ≤ nums[i] ≤ 1000, 0 ≤ k ≤ 10^6', time: 'O(n)', space: 'O(1)',
      insight: 'Valid window [left, right] contributes right − left + 1 subarrays ending at right.',
      signals: ['number of contiguous subarrays', 'strictly less than k', 'positive integers'],
      narration: ['All positive, so product grows with the window.', 'Expand right, shrink left while product ≥ k.', 'Add window length: subarrays ending at right.', 'k ≤ 1 returns 0 early.', 'O(n) time, O(1) space.'],
      solution: productCode, traceId: productTrace.id,
      pitfalls: ['k ≤ 1 edge case', 'Adding 1 instead of window length'],
    },
    {
      id: `${topicId}:problem:209`, lc: 209, title: 'Minimum Size Subarray Sum', difficulty: 'Medium', google: true, skills: ['sliding-window', 'two-pointers'], pattern: 'Sliding window (min length)', ds: ['array'],
      constraints: '1 ≤ n ≤ 10^5, 1 ≤ nums[i] ≤ 10^4', time: 'O(n)', space: 'O(1)',
      insight: 'While the window meets target, record its length and shrink.',
      signals: ['minimal length', 'sum ≥ target', 'positive integers'],
      narration: ['Return 0 if impossible?', 'Positives: shrinking lowers the sum.', 'Expand right; while sum ≥ target, record length and shrink.', 'O(n) time, O(1) space.'],
      solution: minSizeCode,
      pitfalls: ['Recording length after the while (window already invalid)', 'Returning inf when impossible'],
    },
    {
      id: `${topicId}:problem:930`, lc: 930, title: 'Binary Subarrays With Sum', difficulty: 'Medium', google: true, skills: ['sliding-window', 'prefix-sum'], pattern: 'atMost(k) − atMost(k−1)', ds: ['array'],
      constraints: '1 ≤ n ≤ 3·10^4, nums[i] ∈ {0, 1}, 0 ≤ goal ≤ n', time: 'O(n)', space: 'O(1)',
      insight: 'Exactly goal = at most goal minus at most goal − 1.',
      signals: ['exactly', 'binary array', 'number of subarrays'],
      narration: ['Zeros make exact-sum windows hard to shrink.', 'Count windows with sum at most goal instead.', 'Exactly = atMost(goal) − atMost(goal − 1).', 'Prefix sum + hashmap also works in O(n).', 'O(n) time, O(1) space.'],
      solution: binarySubarraysCode,
      pitfalls: ['atMost(−1) must return 0', 'Trying to shrink on exactly'],
    },
    {
      id: `${topicId}:problem:31`, lc: 31, title: 'Next Permutation', difficulty: 'Medium', google: true, skills: ['two-pointers', 'math'], pattern: 'Pivot, swap, reverse', ds: ['array'],
      constraints: '1 ≤ n ≤ 100, in place, O(1) extra memory', time: 'O(n)', space: 'O(1)',
      insight: 'Rightmost dip is the pivot; bump it minimally, then make the tail smallest.',
      signals: ['next lexicographically greater', 'in place', 'rearrange'],
      narration: ['Wrap to sorted if already largest?', 'Find the first dip from the right: pivot.', 'Swap pivot with the rightmost bigger value.', 'Reverse the descending suffix.', 'O(n) time, O(1) space.'],
      solution: nextPermCode, traceId: nextPermTrace.id,
      pitfalls: ['Using > instead of >= with duplicates', 'Sorting suffix (works but O(n log n))', 'Forgetting no-pivot case'],
    },
  ]

  return { lessons, traces, flashcards, mcqs, clozes, parsons, problems }
})()
const partB = (() => {
  const orangesCode = `from collections import deque

class Solution:
    def orangesRotting(self, grid: List[List[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        queue = deque()
        fresh = 0

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 2:
                    queue.append((r, c))
                elif grid[r][c] == 1:
                    fresh += 1

        minutes = 0
        while queue and fresh:
            for _ in range(len(queue)):
                r, c = queue.popleft()
                for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
                    row, col = r + dr, c + dc
                    if 0 <= row < rows and 0 <= col < cols and grid[row][col] == 1:
                        grid[row][col] = 2
                        fresh -= 1
                        queue.append((row, col))
            minutes += 1

        return minutes if fresh == 0 else -1`

  const levelOrderCode = `from collections import deque

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

        return result`

  const kahnCode = `from collections import deque

class Solution:
    def findOrder(self, numCourses: int, prerequisites: List[List[int]]) -> List[int]:
        graph = {i: [] for i in range(numCourses)}
        indegree = [0] * numCourses

        for course, prereq in prerequisites:
            graph[prereq].append(course)
            indegree[course] += 1

        queue = deque([i for i in range(numCourses) if indegree[i] == 0])
        order = []

        while queue:
            node = queue.popleft()
            order.append(node)
            for nextCourse in graph[node]:
                indegree[nextCourse] -= 1
                if indegree[nextCourse] == 0:
                    queue.append(nextCourse)

        return order if len(order) == numCourses else []`

  const canFinishCode = `from collections import deque

class Solution:
    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
        graph = {i: [] for i in range(numCourses)}
        indegree = [0] * numCourses

        for course, prereq in prerequisites:
            graph[prereq].append(course)
            indegree[course] += 1

        queue = deque([i for i in range(numCourses) if indegree[i] == 0])
        taken = 0

        while queue:
            node = queue.popleft()
            taken += 1
            for nextCourse in graph[node]:
                indegree[nextCourse] -= 1
                if indegree[nextCourse] == 0:
                    queue.append(nextCourse)

        return taken == numCourses`

  const swimCode = `import heapq

class Solution:
    def swimInWater(self, grid: List[List[int]]) -> int:
        n = len(grid)
        heap = [(grid[0][0], 0, 0)]
        seen = {(0, 0)}

        while heap:
            level, r, c = heapq.heappop(heap)
            if r == n - 1 and c == n - 1:
                return level

            for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
                row, col = r + dr, c + dc
                if 0 <= row < n and 0 <= col < n and (row, col) not in seen:
                    seen.add((row, col))
                    heapq.heappush(heap, (max(level, grid[row][col]), row, col))`

  const crossCode = `from collections import deque

class Solution:
    def latestDayToCross(self, row: int, col: int, cells: List[List[int]]) -> int:
        def canCross(day):
            water = {(r - 1, c - 1) for r, c in cells[:day]}
            queue = deque((0, c) for c in range(col) if (0, c) not in water)
            seen = set(queue)

            while queue:
                r, c = queue.popleft()
                if r == row - 1:
                    return True
                for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
                    nr, nc = r + dr, c + dc
                    if 0 <= nr < row and 0 <= nc < col and (nr, nc) not in seen and (nr, nc) not in water:
                        seen.add((nr, nc))
                        queue.append((nr, nc))

            return False

        left, right = 0, len(cells)
        while left < right:
            mid = (left + right + 1) // 2
            if canCross(mid):
                left = mid
            else:
                right = mid - 1

        return left`

  const histogramCode = `class Solution:
    def largestRectangleArea(self, heights: List[int]) -> int:
        result = 0
        stack = []

        for i, h in enumerate(heights + [0]):
            start = i
            while stack and stack[-1][1] > h:
                index, height = stack.pop()
                result = max(result, height * (i - index))
                start = index
            stack.append((start, h))

        return result`

  const nextGreaterCode = `class Solution:
    def nextGreaterElement(self, nums1: List[int], nums2: List[int]) -> List[int]:
        nextGreater = {}
        stack = []

        for num in nums2:
            while stack and num > stack[-1]:
                nextGreater[stack.pop()] = num
            stack.append(num)

        return [nextGreater.get(num, -1) for num in nums1]`

  const visibleCode = `class Solution:
    def canSeePersonsCount(self, heights: List[int]) -> List[int]:
        result = [0] * len(heights)
        stack = []

        for i in range(len(heights) - 1, -1, -1):
            while stack and heights[i] > stack[-1]:
                stack.pop()
                result[i] += 1
            if stack:
                result[i] += 1
            stack.append(heights[i])

        return result`

  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  const key = (r, c) => `${r},${c}`
  const circleNodes = n => range(n).map(i => ({
    id: String(i), label: String(i),
    x: +(0.5 + 0.38 * Math.cos((2 * Math.PI * i) / n - Math.PI / 2)).toFixed(3),
    y: +(0.5 + 0.38 * Math.sin((2 * Math.PI * i) / n - Math.PI / 2)).toFixed(3),
  }))

  const buildTree = values => {
    if (!values.length || values[0] == null) return null
    const nodes = values.map((val, i) => (val == null ? null : { id: `t${i}`, val, left: null, right: null }))
    const queue = [nodes[0]]
    let i = 1
    while (queue.length && i < nodes.length) {
      const node = queue.shift()
      if (i < nodes.length) { node.left = nodes[i]; if (nodes[i]) queue.push(nodes[i]); i++ }
      if (i < nodes.length) { node.right = nodes[i]; if (nodes[i]) queue.push(nodes[i]); i++ }
    }
    return nodes[0]
  }

  const tupleLess = (a, b) => (a[0] !== b[0] ? a[0] < b[0] : a[1] !== b[1] ? a[1] < b[1] : a[2] < b[2])
  const heapPush = (heap, item) => {
    heap.push(item)
    let i = heap.length - 1
    while (i > 0) {
      const parent = (i - 1) >> 1
      if (!tupleLess(heap[i], heap[parent])) break
      ;[heap[i], heap[parent]] = [heap[parent], heap[i]]
      i = parent
    }
  }
  const heapPop = heap => {
    const top = heap[0]
    const last = heap.pop()
    if (heap.length) {
      heap[0] = last
      let i = 0
      for (;;) {
        const l = 2 * i + 1
        const r = l + 1
        let m = i
        if (l < heap.length && tupleLess(heap[l], heap[m])) m = l
        if (r < heap.length && tupleLess(heap[r], heap[m])) m = r
        if (m === i) break
        ;[heap[i], heap[m]] = [heap[m], heap[i]]
        i = m
      }
    }
    return top
  }

  const orangesTrace = {
    id: `${topicId}:bfs-levels:trace:rotting-oranges`,
    title: 'Rotting Oranges · multi-source BFS',
    skills: ['graph-bfs', 'grid', 'queue-deque'],
    problem: 'Each minute rot spreads to adjacent fresh oranges. Minutes until none fresh, or -1.',
    code: orangesCode,
    complexity: { time: 'O(rows·cols)', space: 'O(rows·cols)', why: 'Each cell enters the queue at most once; queue can hold the whole grid.' },
    inputs: [
      { label: 'classic', value: [[2, 1, 1], [1, 1, 0], [0, 1, 1]] },
      { label: 'two sources', value: [[2, 1, 1, 1], [1, 1, 0, 1], [1, 1, 1, 2]] },
      { label: 'unreachable', value: [[2, 1, 1], [0, 1, 1], [1, 0, 1]] },
    ],
    run(input, t) {
      const grid = clone(unwrap(input))
      const L = lineFinder(orangesCode)
      const rows = grid.length
      const cols = grid[0].length
      const queue = []
      const rotAt = {}
      let fresh = 0
      let minutes = 0
      const view = (cur = null, newCell = null) => {
        const state = {}
        grid.forEach((row, r) => row.forEach((v, c) => {
          if (v === 0) state[key(r, c)] = 'wall'
          else if (v === 2) state[key(r, c)] = 'visited'
        }))
        queue.forEach(([r, c]) => { state[key(r, c)] = 'frontier' })
        if (cur) state[key(cur[0], cur[1])] = 'current'
        if (newCell) state[key(newCell[0], newCell[1])] = 'path'
        return [
          { kind: 'grid', label: `grid · minute ${minutes}`, cells: grid.map(row => row.map(v => (v === 0 ? '' : v === 1 ? '🍊' : '🤢'))), state, values: { ...rotAt } },
          { kind: 'queue', label: 'queue · front → back', items: queue.map(([r, c]) => `(${r},${c})`), highlight: [] },
          { kind: 'hashmap', label: 'counters', entries: [['fresh', fresh], ['minutes', minutes]], highlight: [] },
        ]
      }
      t.step(L('rows, cols ='), { vars: { rows, cols }, panels: view(), note: 'Grid is the graph: cells are nodes, 4 neighbors are edges.', say: 'I treat each cell as a node with up to 4 neighbors. Rot spreads one step per minute, which is exactly BFS by distance.' })
      t.step(L('queue = deque()'), { vars: {}, panels: view(), note: 'deque gives O(1) popleft.' })
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (grid[r][c] === 2) {
            queue.push([r, c])
            rotAt[key(r, c)] = 't0'
            t.step(L('queue.append((r, c))'), { vars: { r, c }, panels: view(), note: `Rotten at (${r},${c}) is a source at time 0.`, say: queue.length === 1 ? 'Every rotten orange starts in the queue together. That is multi-source BFS: all ripples start at minute 0.' : undefined })
          } else if (grid[r][c] === 1) fresh++
        }
      }
      t.step(L('fresh += 1'), { vars: { fresh }, panels: view(), note: `Counted ${fresh} fresh oranges.`, say: 'I count fresh oranges so I can stop early and detect unreachable ones at the end.' })
      t.step(L('minutes = 0'), { vars: { minutes }, panels: view(), note: 'Minute counter = BFS level.' })
      let saidLevel = false
      let saidRot = false
      while (queue.length && fresh) {
        t.step(L('while queue and fresh'), { vars: { queueSize: queue.length, fresh }, panels: view(), note: 'Fresh left and rot can still spread.' })
        const size = queue.length
        t.step(L('for _ in range(len(queue))'), { vars: { levelSize: size }, panels: view(), note: `Freeze size ${size}: exactly this minute's rotten.`, say: saidLevel ? undefined : 'I snapshot len(queue) so this inner loop handles one minute only. Anything I append now belongs to the next minute.' })
        saidLevel = true
        for (let k = 0; k < size; k++) {
          const [r, c] = queue.shift()
          t.step(L('r, c = queue.popleft()'), { vars: { r, c }, panels: view([r, c]), note: `Spread from (${r},${c}).` })
          for (const [dr, dc] of dirs) {
            const row = r + dr
            const col = c + dc
            if (row >= 0 && row < rows && col >= 0 && col < cols && grid[row][col] === 1) {
              grid[row][col] = 2
              fresh--
              queue.push([row, col])
              rotAt[key(row, col)] = `t${minutes + 1}`
              t.step(L('queue.append((row, col))'), { vars: { row, col, fresh }, panels: view([r, c], [row, col]), note: `(${row},${col}) rots at minute ${minutes + 1}.`, say: saidRot ? undefined : 'I mark it rotten the moment I enqueue it, so no other cell can enqueue it twice.' })
              saidRot = true
            }
          }
        }
        minutes++
        t.step(L('minutes += 1'), { vars: { minutes, fresh }, panels: view(), note: `Minute ${minutes} done.` })
      }
      t.step(L('return minutes if'), { vars: { minutes, fresh, result: fresh === 0 ? minutes : -1 }, panels: view(), note: fresh === 0 ? `All rotten after ${minutes}.` : `${fresh} fresh unreachable: -1.`, say: 'Every cell is enqueued at most once and checks 4 neighbors, so time and space are O(rows times cols).' })
    },
  }

  const levelOrderTrace = {
    id: `${topicId}:bfs-levels:trace:level-order`,
    title: 'Level Order with a queue',
    skills: ['tree-bfs', 'queue-deque'],
    problem: 'Return node values level by level, left to right.',
    code: levelOrderCode,
    complexity: { time: 'O(n)', space: 'O(w)', why: 'Each node enqueued once; queue holds at most one level (width w).' },
    inputs: [
      { label: 'classic', value: [3, 9, 20, null, null, 15, 7] },
      { label: 'full', value: [1, 2, 3, 4, 5, 6, 7] },
      { label: 'lopsided', value: [1, 2, null, 3, null, 4] },
    ],
    run(input, t) {
      const values = unwrap(input)
      const L = lineFinder(levelOrderCode)
      const root = buildTree(values)
      const snapshot = node => (node ? { id: node.id, val: node.val, left: snapshot(node.left), right: snapshot(node.right) } : null)
      const treeRoot = snapshot(root)
      const done = new Set()
      const result = []
      let queue = []
      let level = []
      const view = (cur = null) => {
        const state = {}
        done.forEach(id => { state[id] = 'done' })
        queue.forEach(node => { state[node.id] = 'frontier' })
        if (cur) state[cur.id] = 'current'
        return [
          { kind: 'tree', label: 'tree', root: treeRoot, state, pointers: cur ? { node: cur.id } : {} },
          { kind: 'queue', label: 'queue · front → back', items: queue.map(node => node.val), highlight: [] },
          { kind: 'array', label: 'level', values: [...level], pointers: {}, highlight: level.length ? [level.length - 1] : [] },
          { kind: 'text', text: `result = ${JSON.stringify(result)}` },
        ]
      }
      t.step(L('if not root'), { vars: { root: root ? root.val : null }, panels: view(), note: 'Empty tree → [].' })
      if (!root) { t.step(L('return []'), { vars: {}, panels: view(), note: 'Nothing to visit.' }); return }
      t.step(L('result = []'), { vars: {}, panels: view(), note: 'One list per level.' })
      queue = [root]
      t.step(L('queue = deque([root])'), { vars: { queue: [root.val] }, panels: view(), note: 'Level 0 is just the root.', say: 'I use a queue, not recursion, because a queue hands me nodes in order of depth.' })
      let depth = 0
      while (queue.length) {
        level = []
        t.step(L('level = []'), { vars: { depth }, panels: view(), note: `Start level ${depth}.` })
        const size = queue.length
        t.step(L('for _ in range(len(queue))'), { vars: { size }, panels: view(), note: `Queue holds exactly level ${depth}: ${size} nodes.`, say: depth === 0 ? 'Key trick: len(queue) right now is the size of this level. Children I add go behind them.' : undefined })
        for (let k = 0; k < size; k++) {
          const node = queue.shift()
          level.push(node.val)
          done.add(node.id)
          t.step(L('level.append(node.val)'), { vars: { node: node.val }, panels: view(node), note: `Visit ${node.val}.` })
          if (node.left) { queue.push(node.left); t.step(L('queue.append(node.left)'), { vars: { child: node.left.val }, panels: view(node), note: `Left child ${node.left.val} waits for next level.` }) }
          if (node.right) { queue.push(node.right); t.step(L('queue.append(node.right)'), { vars: { child: node.right.val }, panels: view(node), note: `Right child ${node.right.val} waits.` }) }
        }
        result.push([...level])
        t.step(L('result.append(level)'), { vars: { level: [...level] }, panels: view(), note: `Level ${depth} = ${JSON.stringify(level)}.` })
        depth++
      }
      t.step(L('return result'), { vars: { result: clone(result) }, panels: view(), note: 'Levels in order.', say: 'Every node goes in and out of the queue once: O(n) time, O(width) extra space.' })
    },
  }

  const kahnTrace = {
    id: `${topicId}:kahn:trace:course-schedule-ii`,
    title: "Course Schedule II · Kahn's algorithm",
    skills: ['topo-sort', 'graph-modeling', 'queue-deque'],
    problem: 'Return an order to take all courses given [course, prereq] pairs, or [] if impossible.',
    code: kahnCode,
    complexity: { time: 'O(V+E)', space: 'O(V+E)', why: 'Each course queued once; each edge decremented once.' },
    inputs: [
      { label: 'diamond', value: { numCourses: 4, prerequisites: [[1, 0], [2, 0], [3, 1], [3, 2]] } },
      { label: 'six courses', value: { numCourses: 6, prerequisites: [[1, 0], [2, 0], [3, 1], [4, 1], [4, 2], [5, 3], [5, 4]] } },
      { label: 'cycle', value: { numCourses: 4, prerequisites: [[1, 0], [2, 1], [3, 2], [1, 3]] } },
    ],
    run(input, t) {
      const { numCourses, prerequisites } = unwrap(input)
      const L = lineFinder(kahnCode)
      const graph = Object.fromEntries(range(numCourses).map(i => [i, []]))
      const indegree = range(numCourses).map(() => 0)
      const nodes = circleNodes(numCourses)
      const edges = []
      const edgeState = {}
      let queue = []
      const order = []
      const view = (cur = null) => {
        const state = {}
        order.forEach(id => { state[id] = 'done' })
        queue.forEach(id => { state[id] = 'frontier' })
        if (cur != null) state[cur] = 'current'
        return [
          { kind: 'graph', label: 'prereq → course', directed: true, nodes: clone(nodes), edges: clone(edges), state, edgeState: { ...edgeState }, values: Object.fromEntries(indegree.map((d, i) => [String(i), `in ${d}`])) },
          { kind: 'array', label: 'indegree', values: [...indegree], pointers: cur != null ? { node: cur } : {}, highlight: indegree.map((d, i) => (d === 0 && !order.includes(i) ? i : -1)).filter(i => i >= 0) },
          { kind: 'queue', label: 'queue · ready courses', items: [...queue], highlight: [] },
          { kind: 'array', label: 'order', values: [...order], pointers: {}, highlight: order.length ? [order.length - 1] : [] },
        ]
      }
      t.step(L('graph = {i: []'), { vars: { numCourses }, panels: view(), note: 'Adjacency list: prereq points to what it unlocks.', say: 'I model courses as nodes and draw an edge from prereq to course, because finishing the prereq unlocks the course.' })
      t.step(L('indegree = [0]'), { vars: {}, panels: view(), note: 'indegree = how many prereqs still missing.' })
      prerequisites.forEach(([course, prereq], idx) => {
        graph[prereq].push(course)
        indegree[course]++
        edges.push({ from: String(prereq), to: String(course) })
        t.step(L('indegree[course] += 1'), { vars: { course, prereq, [`indegree[${course}]`]: indegree[course] }, panels: view(), note: `${prereq} → ${course}; ${course} now waits on ${indegree[course]}.`, say: idx === 0 ? 'For each pair I add the edge and bump the course\'s indegree.' : undefined })
      })
      queue = range(numCourses).filter(i => indegree[i] === 0)
      t.step(L('queue = deque(['), { vars: { queue: [...queue] }, panels: view(), note: queue.length ? `No blockers: ${queue.join(', ')}.` : 'No course is free: cycle everywhere.', say: 'Every course with indegree zero has nothing blocking it, so those seed the queue.' })
      t.step(L('order = []'), { vars: {}, panels: view(), note: 'Taken courses in order.' })
      let saidDec = false
      while (queue.length) {
        const node = queue.shift()
        t.step(L('node = queue.popleft()'), { vars: { node }, panels: view(node), note: `Take course ${node}.` })
        order.push(node)
        t.step(L('order.append(node)'), { vars: { order: [...order] }, panels: view(node), note: `${node} is done.` })
        for (const nextCourse of graph[node]) {
          indegree[nextCourse]--
          edgeState[`${node}->${nextCourse}`] = 'active'
          t.step(L('indegree[nextCourse] -= 1'), { vars: { nextCourse, [`indegree[${nextCourse}]`]: indegree[nextCourse] }, panels: view(node), note: `${nextCourse} loses a blocker → ${indegree[nextCourse]}.`, say: saidDec ? undefined : 'Taking this course removes one blocker from each course it unlocks, so I decrement their indegree.' })
          saidDec = true
          edgeState[`${node}->${nextCourse}`] = 'tree'
          if (indegree[nextCourse] === 0) {
            queue.push(nextCourse)
            t.step(L('queue.append(nextCourse)'), { vars: { nextCourse }, panels: view(node), note: `${nextCourse} hit 0: ready.`, say: 'It just hit zero, so every prereq is done and it joins the queue.' })
          }
        }
      }
      const ok = order.length === numCourses
      t.step(L('return order if'), { vars: { taken: order.length, numCourses, result: ok ? [...order] : [] }, panels: view(), note: ok ? 'All courses taken: valid order.' : 'Some never hit 0: cycle → [].', say: ok ? 'Order has every course, so no cycle. V plus E time: each node popped once, each edge decremented once.' : 'Courses in a cycle never reach zero indegree, so order is short. That is my cycle check, for free.' })
    },
  }

  const swimTrace = {
    id: `${topicId}:minimax-grid:trace:swim`,
    title: 'Swim in Rising Water · min-max Dijkstra',
    skills: ['dijkstra', 'grid', 'heap'],
    problem: 'Reach bottom-right; you can enter a cell once time ≥ its height. Minimum time?',
    code: swimCode,
    complexity: { time: 'O(n² log n)', space: 'O(n²)', why: 'n² cells pushed once each; heap ops cost log(n²) = O(log n).' },
    inputs: [
      { label: '3×3', value: [[0, 2, 4], [3, 8, 5], [1, 6, 7]] },
      { label: 'spiral 5×5', value: [[0, 1, 2, 3, 4], [24, 23, 22, 21, 5], [12, 13, 14, 15, 16], [11, 17, 18, 19, 20], [10, 9, 8, 7, 6]] },
      { label: '4×4 wall', value: [[0, 9, 1, 2], [3, 15, 4, 10], [5, 14, 6, 7], [8, 13, 12, 11]] },
    ],
    run(input, t) {
      const grid = unwrap(input)
      const L = lineFinder(swimCode)
      const n = grid.length
      const heap = [[grid[0][0], 0, 0]]
      const seen = new Set([key(0, 0)])
      const popped = new Set()
      const parent = {}
      const best = { [key(0, 0)]: grid[0][0] }
      const view = (cur = null, path = []) => {
        const state = {}
        seen.forEach(k => { state[k] = 'frontier' })
        popped.forEach(k => { state[k] = 'visited' })
        path.forEach(k => { state[k] = 'path' })
        if (cur) state[cur] = 'current'
        const values = {}
        Object.entries(best).forEach(([k, v]) => { values[k] = `≤${v}` })
        return [
          { kind: 'grid', label: 'heights · ≤x = best bottleneck', cells: clone(grid), state, values },
          { kind: 'heap', label: 'min-heap (maxSoFar, r, c)', items: heap.map(([v, r, c]) => `${v}·(${r},${c})`), highlight: [0] },
        ]
      }
      t.step(L('n = len(grid)'), { vars: { n }, panels: view(), note: 'Path cost = tallest cell on it.', say: 'The cost of a route is its tallest cell, not a sum. So I run Dijkstra but combine with max instead of plus.' })
      t.step(L('heap = [(grid[0][0]'), { vars: { heap: [`${grid[0][0]}·(0,0)`] }, panels: view(), note: 'Start cell costs its own height.' })
      t.step(L('seen = {(0, 0)}'), { vars: {}, panels: view(), note: 'Mark on push: node weights make first push optimal.' })
      let saidPop = false
      let saidPush = false
      while (heap.length) {
        const [level, r, c] = heapPop(heap)
        popped.add(key(r, c))
        t.step(L('level, r, c = heapq.heappop'), { vars: { level, r, c }, panels: view(key(r, c)), note: `Cheapest frontier: (${r},${c}) needs time ${level}.`, say: saidPop ? undefined : 'I always expand the cell with the smallest bottleneck so far. Like Dijkstra, once popped its answer is final.' })
        saidPop = true
        if (r === n - 1 && c === n - 1) {
          const path = []
          let k = key(r, c)
          while (k) { path.push(k); k = parent[k] }
          t.step(L('return level'), { vars: { result: level }, panels: view(null, path), note: `Target popped: answer ${level}.`, say: 'The target is popped with the smallest possible bottleneck, so I return it. n squared cells, log heap ops.' })
          return
        }
        for (const [dr, dc] of dirs) {
          const row = r + dr
          const col = c + dc
          if (row >= 0 && row < n && col >= 0 && col < n && !seen.has(key(row, col))) {
            seen.add(key(row, col))
            const cost = Math.max(level, grid[row][col])
            heapPush(heap, [cost, row, col])
            parent[key(row, col)] = key(r, c)
            best[key(row, col)] = cost
            t.step(L('heapq.heappush'), { vars: { row, col, cost: `max(${level}, ${grid[row][col]}) = ${cost}` }, panels: view(key(r, c)), note: `Push (${row},${col}) with bottleneck ${cost}.`, say: saidPush ? undefined : 'The new bottleneck is the max of what I needed so far and this cell height.' })
            saidPush = true
          }
        }
      }
    },
  }

  const histogramTrace = {
    id: `${topicId}:mono-stack:trace:histogram`,
    title: 'Largest Rectangle in Histogram',
    skills: ['monotonic-stack', 'stack'],
    problem: 'Bars of width 1. Area of the largest rectangle inside the histogram.',
    code: histogramCode,
    complexity: { time: 'O(n)', space: 'O(n)', why: 'Each bar pushed once and popped once.' },
    inputs: [
      { label: 'classic', value: [2, 1, 5, 6, 2, 3] },
      { label: 'rising', value: [1, 2, 3, 4, 5] },
      { label: 'valley', value: [4, 2, 0, 3, 2, 5] },
    ],
    run(input, t) {
      const heights = unwrap(input)
      const L = lineFinder(histogramCode)
      const ext = [...heights, 0]
      const stack = []
      let result = 0
      let bestRect = null
      const view = (i = null, win = null) => [
        { kind: 'array', label: 'heights + [0]', values: [...ext], pointers: i == null ? {} : { i }, highlight: stack.map(([s]) => s), window: win || undefined, dim: [ext.length - 1] },
        { kind: 'stack', label: 'stack (start, h) · heights increasing', items: stack.map(([s, h]) => `(${s}, ${h})`), highlight: stack.length ? [stack.length - 1] : [] },
        { kind: 'hashmap', label: 'best', entries: [['result', result], ['rect', bestRect || '-']], highlight: [] },
      ]
      t.step(L('result = 0'), { vars: { result }, panels: view(), note: 'Best area so far.' })
      t.step(L('stack = []'), { vars: {}, panels: view(), note: 'Bars whose right edge is still open.', say: 'The stack holds bars that can still extend right. Heights on it only go up.' })
      for (let i = 0; i < ext.length; i++) {
        const h = ext[i]
        t.step(L('for i, h in'), { vars: { i, h }, panels: view(i), note: i === heights.length ? 'Sentinel 0 flushes the stack.' : `Bar ${i}, height ${h}.`, say: i === heights.length ? 'I append a zero so every remaining bar gets popped and measured.' : undefined })
        let start = i
        while (stack.length && stack[stack.length - 1][1] > h) {
          const [index, height] = stack.pop()
          const area = height * (i - index)
          if (area > result) { result = area; bestRect = `h${height} × w${i - index} from ${index}` }
          t.step(L('result = max(result'), { vars: { index, height, width: i - index, area, result }, panels: view(i, [index, i - 1]), note: `${height} ends here: ${height}×${i - index} = ${area}.`, say: area === result && area > 0 ? 'A shorter bar arrived, so this taller bar cannot extend further. Its width runs from its start to i.' : undefined })
          start = index
          t.step(L('start = index'), { vars: { start }, panels: view(i), note: `New bar can reach back to ${start}.` })
        }
        stack.push([start, h])
        t.step(L('stack.append((start, h))'), { vars: { start, h }, panels: view(i), note: start < i ? `Push (${start}, ${h}): extends left over popped bars.` : `Push (${start}, ${h}).`, say: start < i && h > 0 ? 'I push the earliest start I popped, since this shorter bar fits under all those taller ones.' : undefined })
      }
      t.step(L('return result'), { vars: { result }, panels: view(), note: `Largest area ${result}.`, say: 'Each bar is pushed once and popped once, so it is O(n) even with the inner while.' })
    },
  }

  const visibleTrace = {
    id: `${topicId}:mono-stack:trace:visible-people`,
    title: 'Number of Visible People in a Queue',
    skills: ['monotonic-stack', 'stack'],
    problem: 'Person i sees j > i if everyone between is shorter than both. Count per person.',
    code: visibleCode,
    complexity: { time: 'O(n)', space: 'O(n)', why: 'Each height pushed and popped at most once.' },
    inputs: [
      { label: 'classic', value: [10, 6, 8, 5, 11, 9] },
      { label: 'falling', value: [5, 4, 3, 2, 1] },
      { label: 'rising', value: [1, 2, 3, 4, 5] },
    ],
    run(input, t) {
      const heights = unwrap(input)
      const L = lineFinder(visibleCode)
      const result = heights.map(() => 0)
      const stack = []
      const view = (i = null) => [
        { kind: 'array', label: 'heights', values: [...heights], pointers: i == null ? {} : { i }, highlight: [], dim: i == null ? [] : range(i) },
        { kind: 'stack', label: 'stack · heights to the right (decreasing up)', items: [...stack], highlight: stack.length ? [stack.length - 1] : [] },
        { kind: 'array', label: 'result', values: [...result], pointers: i == null ? {} : { i }, highlight: i == null ? [] : [i] },
      ]
      t.step(L('result = [0]'), { vars: {}, panels: view(), note: 'Count per person.' })
      t.step(L('stack = []'), { vars: {}, panels: view(), note: 'Scan right to left.', say: 'I walk from the right. The stack holds people still visible from the left, tallest at the bottom.' })
      let saidPop = false
      for (let i = heights.length - 1; i >= 0; i--) {
        t.step(L('for i in range'), { vars: { i, height: heights[i] }, panels: view(i), note: `Person ${i}, height ${heights[i]}.` })
        while (stack.length && heights[i] > stack[stack.length - 1]) {
          const gone = stack.pop()
          result[i]++
          t.step(L('result[i] += 1'), { vars: { i, popped: gone, count: result[i] }, panels: view(i), note: `Sees ${gone}; ${gone} is now hidden for anyone further left.`, say: saidPop ? undefined : 'I can see each shorter person, and after me they are blocked for everyone to my left, so I pop them.' })
          saidPop = true
        }
        if (stack.length) {
          result[i]++
          t.step(L('result[i] += 1', 2), { vars: { i, blocker: stack[stack.length - 1], count: result[i] }, panels: view(i), note: `Also sees taller ${stack[stack.length - 1]}, then view blocked.` })
        }
        stack.push(heights[i])
        t.step(L('stack.append(heights[i])'), { vars: { stack: [...stack] }, panels: view(i), note: `Push ${heights[i]}.` })
      }
      t.step(L('return result'), { vars: { result: [...result] }, panels: view(), note: 'Done in one pass.', say: 'Each height is pushed and popped once: O(n) time, O(n) stack.' })
    },
  }

  const lessons = [
    {
      id: `${topicId}:bfs-levels:lesson`,
      title: 'BFS: ripples, levels, shortest paths',
      skills: ['graph-bfs', 'tree-bfs', 'grid', 'queue-deque'],
      slides: [
        {
          title: 'BFS = ==ripples== from a stone',
          panels: [{ kind: 'grid', label: 'distance from S', cells: [['S', '', ''], ['', '', ''], ['', '', '']], state: { '0,0': 'current', '0,1': 'frontier', '1,0': 'frontier', '1,1': 'visited', '0,2': 'visited', '2,0': 'visited' }, values: { '0,1': '1', '1,0': '1', '1,1': '2', '0,2': '2', '2,0': '2', '1,2': '3', '2,1': '3', '2,2': '4' } }],
          points: ['Visit distance 0, then 1, then 2', 'First arrival = ==shortest path== (unweighted)'],
        },
        {
          title: 'A ==queue== keeps the order',
          panels: [{ kind: 'queue', label: 'front → back', items: ['d1', 'd1', 'd2', 'd2'], highlight: [0] }],
          points: ['==popleft== oldest, append newest', 'Closer cells always come out first', 'deque, never list.pop(0)'],
        },
        {
          title: 'Snapshot ==len(queue)== = one level',
          panels: [
            { kind: 'tree', label: 'tree', root: { id: 'a', val: 3, left: { id: 'b', val: 9, left: null, right: null }, right: { id: 'c', val: 20, left: { id: 'd', val: 15, left: null, right: null }, right: { id: 'e', val: 7, left: null, right: null } } }, state: { a: 'done', b: 'frontier', c: 'frontier' } },
            { kind: 'queue', label: 'queue = level 1', items: [9, 20], highlight: [] },
          ],
          points: ['Size frozen before the inner loop', 'Children appended now = ==next level=='],
        },
        {
          title: '==Multi-source==: seed every start',
          panels: [{ kind: 'grid', label: 'two rotten oranges', cells: [['🤢', '🍊', '🍊', '🍊'], ['🍊', '🍊', '', '🍊'], ['🍊', '🍊', '🍊', '🤢']], state: { '0,0': 'current', '2,3': 'current', '0,1': 'frontier', '1,0': 'frontier', '1,3': 'frontier', '2,2': 'frontier', '1,2': 'wall' } }],
          points: ['All sources in queue at time 0', 'Ripples grow ==together==, one minute per level'],
        },
        {
          title: 'Template',
          code: `queue = deque(sources)
seen = set(sources)
steps = 0

while queue:
    for _ in range(len(queue)):
        node = queue.popleft()
        for nei in graph[node]:
            if nei not in seen:
                seen.add(nei)
                queue.append(nei)
    steps += 1`,
          highlight: 10,
          points: ['Mark ==seen on enqueue==, not on pop'],
        },
        {
          title: 'Cost and why',
          points: ['Each node enqueued ==once== → O(V+E)', 'Grid: O(rows·cols), 4 edges per cell', 'Mark late → duplicates → blowup'],
          ask: { q: 'Shortest steps in an unweighted grid?', choices: ['DFS', 'BFS', 'Dijkstra', 'DP'], answer: 1, why: 'Unweighted: BFS reaches each cell first by the fewest steps.' },
        },
      ],
    },
    {
      id: `${topicId}:kahn:lesson`,
      title: "Kahn's topological sort",
      skills: ['topo-sort', 'graph-modeling'],
      slides: [
        {
          title: 'Prereqs are ==arrows==',
          panels: [{ kind: 'graph', label: 'prereq → course', directed: true, nodes: [{ id: '0', x: 0.15, y: 0.5 }, { id: '1', x: 0.5, y: 0.2 }, { id: '2', x: 0.5, y: 0.8 }, { id: '3', x: 0.85, y: 0.5 }], edges: [{ from: '0', to: '1' }, { from: '0', to: '2' }, { from: '1', to: '3' }, { from: '2', to: '3' }], state: {}, values: { 0: 'in 0', 1: 'in 1', 2: 'in 1', 3: 'in 2' } }],
          points: ['Edge prereq → course', '==indegree== = prereqs still missing'],
        },
        {
          title: 'Start where ==indegree is 0==',
          panels: [{ kind: 'graph', label: 'take 0', directed: true, nodes: [{ id: '0', x: 0.15, y: 0.5 }, { id: '1', x: 0.5, y: 0.2 }, { id: '2', x: 0.5, y: 0.8 }, { id: '3', x: 0.85, y: 0.5 }], edges: [{ from: '0', to: '1' }, { from: '0', to: '2' }, { from: '1', to: '3' }, { from: '2', to: '3' }], state: { 0: 'done', 1: 'frontier', 2: 'frontier' }, edgeState: { '0->1': 'active', '0->2': 'active' }, values: { 0: 'taken', 1: 'in 0', 2: 'in 0', 3: 'in 2' } }],
          points: ['Nothing blocks them → queue', 'Take one, ==decrement== what it unlocks', 'Hits 0 → joins queue'],
        },
        {
          title: '==Cycle== check for free',
          panels: [{ kind: 'graph', label: '1 → 2 → 3 → 1', directed: true, nodes: [{ id: '0', x: 0.15, y: 0.5 }, { id: '1', x: 0.5, y: 0.2 }, { id: '2', x: 0.85, y: 0.5 }, { id: '3', x: 0.5, y: 0.8 }], edges: [{ from: '0', to: '1' }, { from: '1', to: '2' }, { from: '2', to: '3' }, { from: '3', to: '1' }], state: { 0: 'done' }, edgeState: { '1->2': 'back', '2->3': 'back', '3->1': 'back' }, values: { 1: 'in 1', 2: 'in 1', 3: 'in 1' } }],
          points: ['Cycle nodes never reach 0', '==len(order) < n== → impossible'],
        },
        {
          title: 'Template',
          code: `graph = {i: [] for i in range(n)}
indegree = [0] * n
for course, prereq in prerequisites:
    graph[prereq].append(course)
    indegree[course] += 1

queue = deque([i for i in range(n) if indegree[i] == 0])
order = []
while queue:
    node = queue.popleft()
    order.append(node)
    for nei in graph[node]:
        indegree[nei] -= 1
        if indegree[nei] == 0:
            queue.append(nei)`,
          highlight: 13,
          points: ['Return order if ==len(order) == n=='],
        },
        {
          title: 'Cost and why',
          points: ['Each node queued ==once==, each edge decremented once', '==O(V+E)== time and space', 'BFS-style: easy to narrate, no recursion depth'],
          ask: { q: 'Kahn ends with order shorter than n. Means?', choices: ['Graph disconnected', 'A cycle exists', 'Duplicate edges', 'Wrong edge direction only'], answer: 1, why: 'Nodes on a cycle keep indegree ≥ 1 forever.' },
        },
      ],
    },
    {
      id: `${topicId}:minimax-grid:lesson`,
      title: 'Minimize the maximum on a path',
      skills: ['dijkstra', 'graph-bfs', 'binary-search', 'grid'],
      slides: [
        {
          title: 'Route cost = ==tallest== cell',
          panels: [{ kind: 'grid', label: 'heights', cells: [[0, 2, 4], [3, 8, 5], [1, 6, 7]], state: { '0,0': 'path', '0,1': 'path', '0,2': 'path', '1,2': 'path', '2,2': 'path', '1,1': 'wall' } }],
          points: ['Not a sum: the ==bottleneck==', 'Goal: route with smallest max'],
        },
        {
          title: 'Dijkstra with ==max== instead of +',
          panels: [{ kind: 'heap', label: '(maxSoFar, r, c)', items: ['2·(0,1)', '3·(1,0)', '8·(1,1)'], highlight: [0] }],
          points: ['Pop smallest bottleneck', 'new = ==max(level, grid[r][c])==', 'First pop of target = answer'],
        },
        {
          title: 'Or: ==binary search== the answer',
          panels: [{ kind: 'array', label: 'canReach(t)?', values: ['F', 'F', 'F', 'F', 'F', 'F', 'F', 'T', 'T'], pointers: { lo: 0, mid: 4, hi: 8 }, highlight: [7] }],
          points: ['canReach(t) is ==monotonic==', 'Each guess = one BFS'],
        },
        {
          title: 'Template',
          code: `heap = [(grid[0][0], 0, 0)]
seen = {(0, 0)}
while heap:
    level, r, c = heapq.heappop(heap)
    if (r, c) == target:
        return level
    for row, col in neighbors(r, c):
        if (row, col) not in seen:
            seen.add((row, col))
            heapq.heappush(heap, (max(level, grid[row][col]), row, col))`,
          highlight: 10,
          points: ['Same skeleton as Dijkstra'],
        },
        {
          title: 'Cost and why',
          points: ['Heap: ==O(n² log n)==, each cell pushed once', 'Binary search: log(range) × O(n²) BFS', 'n ≤ 50 or rows·cols ≤ 2·10^4: both fit'],
          ask: { q: 'Last day to cross (1970): why binary search works?', choices: ['Cells sorted', 'More water never helps', 'BFS is monotonic', 'Grid is square'], answer: 1, why: 'If you can cross on day d you can on any earlier day: monotonic predicate.' },
        },
      ],
    },
    {
      id: `${topicId}:mono-stack:lesson`,
      title: 'Monotonic stack: who blocks whom',
      skills: ['monotonic-stack', 'stack'],
      slides: [
        {
          title: 'Who is my ==next greater==?',
          panels: [
            { kind: 'array', label: 'nums', values: [2, 1, 5, 3], pointers: { num: 2 }, highlight: [2] },
            { kind: 'stack', label: 'waiting', items: [2, 1], highlight: [1] },
          ],
          points: ['Stack holds items ==waiting== for an answer', '5 pops 1, then 2: answer found'],
        },
        {
          title: 'Pick the ==direction==',
          points: ['Next greater → stack stays ==decreasing==', 'Next smaller → stack stays ==increasing==', 'Pop moment = answer moment'],
        },
        {
          title: 'Histogram: pop = ==rectangle ends==',
          panels: [
            { kind: 'array', label: 'heights', values: [2, 1, 5, 6, 2, 3], pointers: { i: 4 }, window: [2, 3], highlight: [2, 3] },
            { kind: 'stack', label: '(start, h)', items: ['(0,1)', '(2,5)', '(3,6)'], highlight: [2] },
          ],
          points: ['Shorter bar arrives → taller bars close', 'Area = h × (i − start)', 'Push new bar at popped ==start=='],
        },
        {
          title: 'Template',
          code: `stack = []
for i, h in enumerate(heights + [0]):
    start = i
    while stack and stack[-1][1] > h:
        index, height = stack.pop()
        result = max(result, height * (i - index))
        start = index
    stack.append((start, h))`,
          highlight: 6,
          points: ['Sentinel 0 flushes the stack'],
        },
        {
          title: 'Cost and why',
          points: ['Each index pushed once, popped once', 'Nested while is still ==O(n) amortized==', 'Space O(n): sorted input keeps everything'],
          ask: { q: 'n ≤ 10^5. Nearest smaller to the left of each?', choices: ['O(n²) scan', 'Monotonic stack O(n)', 'Heap O(n log n) only', 'Union-Find'], answer: 1, why: 'Increasing stack: pop bigger ones; top is the nearest smaller.' },
        },
      ],
    },
  ]

  const flashcards = [
    { id: `${topicId}:bfs-levels:card:1`, skills: ['graph-bfs'], front: 'Why does BFS give shortest paths in unweighted graphs?', back: 'It visits nodes in order of distance. The first time a node is reached is by the fewest edges.' },
    { id: `${topicId}:bfs-levels:card:2`, skills: ['graph-bfs', 'queue-deque'], front: 'Mark visited on enqueue or on pop?', back: 'On enqueue. Marking on pop lets the same node be queued many times, blowing up time and memory.' },
    { id: `${topicId}:bfs-levels:card:3`, skills: ['tree-bfs', 'queue-deque'], front: 'How do you process BFS one level at a time?', back: 'Snapshot the size first: for _ in range(len(queue)). Children appended during the loop wait for the next level.', code: 'for _ in range(len(queue)):\n    node = queue.popleft()' },
    { id: `${topicId}:bfs-levels:card:4`, skills: ['graph-bfs', 'grid'], front: 'Multi-source BFS: what changes?', back: 'Put every source in the queue at distance 0 before the loop. Everything else is identical.' },
    { id: `${topicId}:bfs-levels:card:5`, skills: ['queue-deque'], front: 'Why deque instead of list for a queue?', back: 'deque.popleft() is O(1). list.pop(0) shifts every element: O(n).' },
    { id: `${topicId}:kahn:card:1`, skills: ['topo-sort'], front: 'What is indegree in Kahn\'s algorithm?', back: 'Number of incoming edges: prerequisites not yet taken. Zero means the node is ready.' },
    { id: `${topicId}:kahn:card:2`, skills: ['topo-sort', 'graph-modeling'], front: 'Course pair [course, prereq]: which edge direction?', back: 'prereq → course. Finishing the prereq unlocks the course, and decrements its indegree.' },
    { id: `${topicId}:kahn:card:3`, skills: ['topo-sort'], front: 'How does Kahn detect a cycle?', back: 'If len(order) < n at the end. Nodes on a cycle never reach indegree 0.' },
    { id: `${topicId}:kahn:card:4`, skills: ['topo-sort'], front: 'Kahn vs DFS topo sort: when prefer Kahn?', back: 'Easier to explain, iterative (no recursion limit), gives order directly, and cycle check is just a count.' },
    { id: `${topicId}:minimax-grid:card:1`, skills: ['dijkstra', 'grid'], front: 'Path cost is the max cell, not the sum. Algorithm?', back: 'Dijkstra with max as the combine: heap of (maxSoFar, r, c). First pop of target is the answer.' },
    { id: `${topicId}:minimax-grid:card:2`, skills: ['binary-search', 'graph-bfs'], front: 'When does binary search + BFS work on a grid?', back: 'When feasibility is monotonic in the answer: if t works, every larger t works. BFS checks each guess.' },
    { id: `${topicId}:minimax-grid:card:3`, skills: ['binary-search'], front: 'Finding the LAST true value: how to pick mid?', back: 'mid = (left + right + 1) // 2 with left = mid on success, else right = mid - 1. Avoids infinite loop.' },
    { id: `${topicId}:minimax-grid:card:4`, skills: ['dijkstra', 'complexity'], front: 'Swim in Rising Water complexity with a heap?', back: 'O(n² log n): n² cells pushed once, each heap op log(n²) = 2 log n.' },
    { id: `${topicId}:mono-stack:card:1`, skills: ['monotonic-stack'], front: 'Next greater element: stack is increasing or decreasing?', back: 'Decreasing from bottom to top. A bigger item pops all smaller waiting items and becomes their answer.' },
    { id: `${topicId}:mono-stack:card:2`, skills: ['monotonic-stack'], front: 'Why is a monotonic stack O(n) despite a nested while?', back: 'Each index is pushed once and popped at most once. Total pops ≤ n.' },
    { id: `${topicId}:mono-stack:card:3`, skills: ['monotonic-stack'], front: 'Histogram: why push the popped start index?', back: 'The new shorter bar fits under all popped taller bars, so its rectangle extends left to the earliest popped start.' },
    { id: `${topicId}:mono-stack:card:4`, skills: ['monotonic-stack', 'stack'], front: 'Why append a 0 sentinel in histogram?', back: 'It is shorter than everything, so it pops and measures every remaining bar at the end.' },
  ]

  const mcqs = [
    { id: `${topicId}:bfs-levels:mcq:1`, skills: ['graph-bfs', 'grid', 'constraints'], difficulty: 1, q: 'Grid up to 1000×1000, min steps from S to E, all moves cost 1. Best?', choices: ['DFS with backtracking', 'BFS, O(rows·cols)', 'Dijkstra O(E log V) required', 'DP over all paths'], answer: 1, why: 'Unweighted shortest path = BFS. 10^6 cells is fine in linear time.' },
    { id: `${topicId}:bfs-levels:mcq:2`, skills: ['graph-bfs', 'queue-deque'], difficulty: 2, q: 'BFS marks seen when popping, not when pushing. Result?', choices: ['Wrong distances always', 'Still correct but nodes can be queued many times', 'Infinite loop always', 'Becomes DFS'], answer: 1, why: 'Distances stay right but duplicates pile up; dense grids can blow up time and memory.' },
    { id: `${topicId}:bfs-levels:mcq:3`, skills: ['ds-diagnosis', 'graph-bfs'], difficulty: 1, q: '"Minimum minutes until every cell is reached, spreading from many starts." Pattern?', choices: ['Union-Find', 'Multi-source BFS', 'Topological sort', 'Two pointers'], answer: 1, why: 'Many starts spreading one step per minute = all sources in the queue at level 0.' },
    { id: `${topicId}:bfs-levels:mcq:4`, skills: ['tree-bfs', 'complexity'], difficulty: 2, q: 'Level-order on a complete binary tree with n nodes. Max queue size?', choices: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], answer: 2, why: 'The last level holds about n/2 nodes, all queued together.' },
    { id: `${topicId}:bfs-levels:mcq:5`, skills: ['graph-bfs'], code: 'while queue:\n    for _ in range(len(queue)):\n        node = queue.popleft()', difficulty: 1, q: 'What does range(len(queue)) guarantee?', choices: ['Queue never empties', 'One full level processed per outer loop', 'Nodes visited in sorted order', 'No duplicates'], answer: 1, why: 'Size is captured before appending children, so exactly the current level is drained.' },
    { id: `${topicId}:kahn:mcq:1`, skills: ['topo-sort', 'graph-modeling'], difficulty: 1, q: 'prerequisites[i] = [a, b] means take b before a. Edge to add?', choices: ['a → b, indegree[b]++', 'b → a, indegree[a]++', 'both directions', 'a → b, indegree[a]++'], answer: 1, why: 'b unlocks a, so b → a; a waits on one more prereq.' },
    { id: `${topicId}:kahn:mcq:2`, skills: ['topo-sort', 'constraints'], difficulty: 2, q: 'numCourses ≤ 2000, prerequisites ≤ 5000. Kahn runtime?', choices: ['O(V²)', 'O(V+E)', 'O(E log V)', 'O(V·E)'], answer: 1, why: 'Each node popped once, each edge decremented once.' },
    { id: `${topicId}:kahn:mcq:3`, skills: ['ds-diagnosis', 'topo-sort'], difficulty: 2, q: '"Find an order of tasks respecting dependencies." Which structure drives Kahn?', choices: ['Max-heap', 'Queue of indegree-0 nodes', 'Stack of visited', 'Union-Find'], answer: 1, why: 'Ready tasks (no unmet dependencies) wait in a queue.' },
    { id: `${topicId}:kahn:mcq:4`, skills: ['topo-sort'], difficulty: 3, q: 'Need the lexicographically smallest valid order. Change to Kahn?', choices: ['Use a stack', 'Use a min-heap instead of the queue', 'Sort edges first', 'Run DFS twice'], answer: 1, why: 'Always take the smallest ready node: heap gives O((V+E) log V).' },
    { id: `${topicId}:minimax-grid:mcq:1`, skills: ['dijkstra', 'ds-diagnosis'], difficulty: 2, q: 'Minimize the highest elevation on a route from top-left to bottom-right. Best fit?', choices: ['Plain BFS', 'Dijkstra combining with max', 'DP right/down only', 'Greedy step to lowest neighbor'], answer: 1, why: 'Moves go in all 4 directions, so DP fails; greedy can trap. Bottleneck Dijkstra is exact.' },
    { id: `${topicId}:minimax-grid:mcq:2`, skills: ['binary-search', 'constraints'], difficulty: 2, q: 'rows·cols ≤ 2·10^4, find last day you can cross. Binary search + BFS costs?', choices: ['O(rc)', 'O(rc log(rc))', 'O((rc)²)', 'O(2^rc)'], answer: 1, why: 'log(rc) guesses, each a full BFS of O(rc).' },
    { id: `${topicId}:minimax-grid:mcq:3`, skills: ['binary-search'], difficulty: 3, code: 'while left < right:\n    mid = (left + right) // 2\n    if ok(mid):\n        left = mid\n    else:\n        right = mid - 1', q: 'Bug?', choices: ['None', 'Infinite loop when right = left + 1 and ok(mid)', 'Off by one in right', 'Should use <='], answer: 1, why: 'mid rounds down to left, left = mid stalls. Use (left + right + 1) // 2.' },
    { id: `${topicId}:minimax-grid:mcq:4`, skills: ['dijkstra', 'complexity'], difficulty: 2, q: 'n×n grid, bottleneck Dijkstra with a heap. Time?', choices: ['O(n²)', 'O(n² log n)', 'O(n³)', 'O(n⁴)'], answer: 1, why: 'n² pushes and pops, each log(n²) = O(log n).' },
    { id: `${topicId}:mono-stack:mcq:1`, skills: ['monotonic-stack', 'constraints'], difficulty: 1, q: 'n ≤ 10^5. For each element, next greater to the right. Best?', choices: ['Nested loops O(n²)', 'Monotonic stack O(n)', 'Sort O(n log n)', 'Heap O(n log n)'], answer: 1, why: '10^10 is too slow; the stack pops each index once.' },
    { id: `${topicId}:mono-stack:mcq:2`, skills: ['monotonic-stack'], difficulty: 2, q: 'Largest rectangle: bar of height 6 at index 3 pops at i = 4. Width?', choices: ['1', '2', '3', '4'], answer: 0, why: 'Width = i − start = 4 − 3 = 1.' },
    { id: `${topicId}:mono-stack:mcq:3`, skills: ['monotonic-stack', 'ds-diagnosis'], difficulty: 2, q: 'Signal words that suggest a monotonic stack?', choices: ['"k most frequent"', '"next warmer / nearest smaller / visible"', '"shortest path"', '"all subsets"'], answer: 1, why: 'Nearest bigger or smaller neighbor questions are its home turf.' },
    { id: `${topicId}:mono-stack:mcq:4`, skills: ['monotonic-stack', 'complexity'], difficulty: 3, q: 'Why is the histogram stack O(n) total?', choices: ['Heights are bounded', 'Each bar pushed once and popped once', 'The while runs at most twice', 'Python lists are fast'], answer: 1, why: 'Amortized: total pops cannot exceed total pushes = n + 1.' },
  ]

  const clozes = [
    {
      id: `${topicId}:bfs-levels:cloze:1`, skills: ['graph-bfs', 'grid', 'queue-deque'], title: 'Level BFS on a grid',
      code: `while queue and fresh:
    for _ in range([[len(queue)]]):
        r, c = queue.[[popleft()]]
        for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
            row, col = r + dr, c + dc
            if 0 <= row < rows and 0 <= col < cols and grid[row][col] == 1:
                grid[row][col] = [[2]]
                fresh -= 1
                queue.[[append((row, col))]]
    minutes += 1`,
      hint: 'Freeze level size; mark rotten when enqueuing.',
    },
    {
      id: `${topicId}:kahn:cloze:1`, skills: ['topo-sort'], title: "Kahn's core loop",
      code: `queue = deque([i for i in range(n) if [[indegree[i] == 0]]])
order = []

while queue:
    node = queue.popleft()
    order.append(node)
    for nei in graph[node]:
        indegree[nei] [[-= 1]]
        if indegree[nei] == [[0]]:
            queue.append(nei)

return order if [[len(order) == n]] else []`,
    },
    {
      id: `${topicId}:minimax-grid:cloze:1`, skills: ['dijkstra', 'grid'], title: 'Bottleneck Dijkstra push',
      code: `level, r, c = heapq.[[heappop]](heap)
if r == n - 1 and c == n - 1:
    return level
for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
    row, col = r + dr, c + dc
    if 0 <= row < n and 0 <= col < n and (row, col) not in seen:
        seen.add((row, col))
        heapq.heappush(heap, ([[max]](level, grid[row][col]), row, col))`,
    },
    {
      id: `${topicId}:mono-stack:cloze:1`, skills: ['monotonic-stack'], title: 'Histogram stack',
      code: `for i, h in enumerate(heights + [0]):
    start = i
    while stack and stack[-1][1] [[>|>=]] h:
        index, height = stack.pop()
        result = max(result, height * ([[i - index]]))
        start = [[index]]
    stack.append(([[start]], h))`,
    },
  ]

  const parsons = [
    {
      id: `${topicId}:bfs-levels:parsons:1`, skills: ['tree-bfs', 'queue-deque'], title: 'Level order traversal',
      lines: [
        'result = []',
        'queue = deque([root])',
        'while queue:',
        '    level = []',
        '    for _ in range(len(queue)):',
        '        node = queue.popleft()',
        '        level.append(node.val)',
        '        if node.left:',
        '            queue.append(node.left)',
        '        if node.right:',
        '            queue.append(node.right)',
        '    result.append(level)',
        'return result',
      ],
      distractors: ['        node = queue.pop()', '    for _ in range(len(result)):'],
    },
    {
      id: `${topicId}:kahn:parsons:1`, skills: ['topo-sort'], title: "Kahn's algorithm",
      lines: [
        'for course, prereq in prerequisites:',
        '    graph[prereq].append(course)',
        '    indegree[course] += 1',
        'queue = deque([i for i in range(n) if indegree[i] == 0])',
        'order = []',
        'while queue:',
        '    node = queue.popleft()',
        '    order.append(node)',
        '    for nei in graph[node]:',
        '        indegree[nei] -= 1',
        '        if indegree[nei] == 0:',
        '            queue.append(nei)',
        'return order if len(order) == n else []',
      ],
      distractors: ['    graph[course].append(prereq)', '    indegree[prereq] += 1'],
    },
    {
      id: `${topicId}:minimax-grid:parsons:1`, skills: ['binary-search', 'graph-bfs'], title: 'Binary search the last good day',
      lines: [
        'left, right = 0, len(cells)',
        'while left < right:',
        '    mid = (left + right + 1) // 2',
        '    if canCross(mid):',
        '        left = mid',
        '    else:',
        '        right = mid - 1',
        'return left',
      ],
      distractors: ['    mid = (left + right) // 2', '        left = mid + 1'],
    },
    {
      id: `${topicId}:mono-stack:parsons:1`, skills: ['monotonic-stack'], title: 'Next greater element',
      lines: [
        'nextGreater = {}',
        'stack = []',
        'for num in nums2:',
        '    while stack and num > stack[-1]:',
        '        nextGreater[stack.pop()] = num',
        '    stack.append(num)',
        'return [nextGreater.get(num, -1) for num in nums1]',
      ],
      distractors: ['    while stack and num < stack[-1]:', '    stack.insert(0, num)'],
    },
  ]

  const problems = [
    {
      id: `${topicId}:problem:994`, lc: 994, title: 'Rotting Oranges', difficulty: 'Medium', google: true, skills: ['graph-bfs', 'grid', 'queue-deque'], pattern: 'Multi-source BFS by levels', ds: ['deque', 'grid'],
      constraints: '1 ≤ m, n ≤ 10', time: 'O(m·n)', space: 'O(m·n)',
      insight: 'All rotten start together; each BFS level is one minute.',
      signals: ['minimum minutes', 'every minute adjacent', 'spreads', 'return -1 if impossible'],
      narration: ['Empty cells block? Diagonals count? No.', 'Rot spreads one step per minute: BFS levels.', 'Seed the queue with every rotten orange, count fresh.', 'Drain one level per minute, rot on enqueue.', 'fresh left → -1. O(m·n) time and space.'],
      solution: orangesCode, traceId: orangesTrace.id,
      pitfalls: ['No fresh at start → 0, not 1', 'Counting a final minute with nothing rotted', 'Mark rotten when enqueuing'],
    },
    {
      id: `${topicId}:problem:102`, lc: 102, title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', google: true, skills: ['tree-bfs', 'queue-deque'], pattern: 'BFS level snapshot', ds: ['deque'],
      constraints: '0 ≤ nodes ≤ 2000', time: 'O(n)', space: 'O(w)',
      insight: 'len(queue) at loop start is exactly one level.',
      signals: ['level by level', 'left to right', 'each depth'],
      narration: ['Empty tree returns []?', 'Queue gives nodes in depth order.', 'Snapshot len(queue) to drain one level.', 'Append children for the next level.', 'O(n) time, O(width) space.'],
      solution: levelOrderCode, traceId: levelOrderTrace.id,
      pitfalls: ['Forgetting the empty root', 'Using len(queue) inside the loop condition after appends'],
    },
    {
      id: `${topicId}:problem:210`, lc: 210, title: 'Course Schedule II', difficulty: 'Medium', google: true, skills: ['topo-sort', 'graph-modeling'], pattern: "Kahn's topological sort", ds: ['adjacency list', 'deque', 'array'],
      constraints: '1 ≤ numCourses ≤ 2000, prerequisites ≤ n(n−1)', time: 'O(V+E)', space: 'O(V+E)',
      insight: 'Take courses with no missing prereqs; taking one unblocks others.',
      signals: ['prerequisites', 'order to finish', 'dependencies', 'impossible → empty'],
      narration: ['Any valid order fine? Duplicate pairs?', 'Edge prereq → course, track indegree.', 'Queue all indegree-0 courses.', 'Pop, append to order, decrement neighbors, push zeros.', 'Short order means cycle. O(V+E).'],
      solution: kahnCode, traceId: kahnTrace.id,
      pitfalls: ['Edge direction reversed', 'Forgetting isolated courses', 'Returning partial order on a cycle'],
    },
    {
      id: `${topicId}:problem:207`, lc: 207, title: 'Course Schedule', difficulty: 'Medium', google: true, skills: ['topo-sort', 'graph-modeling'], pattern: "Kahn's cycle check", ds: ['adjacency list', 'deque'],
      constraints: '1 ≤ numCourses ≤ 2000, prerequisites ≤ 5000', time: 'O(V+E)', space: 'O(V+E)',
      insight: 'Possible iff Kahn takes every course.',
      signals: ['can you finish', 'prerequisites', 'cycle'],
      narration: ['Self loops possible?', 'Model as a directed graph.', 'Kahn: count courses taken.', 'Equal to n means no cycle.', 'O(V+E) time and space.'],
      solution: canFinishCode, traceId: kahnTrace.id,
      pitfalls: ['DFS without a visiting state misses cycles', 'Recursion depth on long chains'],
    },
    {
      id: `${topicId}:problem:778`, lc: 778, title: 'Swim in Rising Water', difficulty: 'Hard', google: true, skills: ['dijkstra', 'grid', 'heap'], pattern: 'Bottleneck Dijkstra', ds: ['heap', 'set'],
      constraints: '1 ≤ n ≤ 50, values a permutation of 0..n²−1', time: 'O(n² log n)', space: 'O(n²)',
      insight: 'Cost of a path is its max; Dijkstra with max.',
      signals: ['minimum time', 'elevation', 'reach bottom right', 'minimize the maximum'],
      narration: ['4-directional moves, instant swimming?', 'Path cost = highest cell, so bottleneck.', 'Min-heap of (maxSoFar, r, c) from start.', 'Push neighbors with max(level, height).', 'First pop of target wins. O(n² log n).'],
      solution: swimCode, traceId: swimTrace.id,
      pitfalls: ['Forgetting grid[0][0] itself', 'DP right/down misses detours'],
    },
    {
      id: `${topicId}:problem:1970`, lc: 1970, title: 'Last Day Where You Can Still Cross', difficulty: 'Hard', google: true, skills: ['binary-search', 'graph-bfs', 'grid'], pattern: 'Binary search on answer + BFS', ds: ['deque', 'set'],
      constraints: '2 ≤ row, col ≤ 2·10^4, row·col ≤ 2·10^4', time: 'O(rc log(rc))', space: 'O(rc)',
      insight: 'Crossable on day d implies crossable earlier: binary search d.',
      signals: ['last day', 'still possible', 'cells flood one per day', 'top to bottom'],
      narration: ['Cells 1-indexed? Yes, convert.', 'Feasibility is monotonic in day.', 'canCross(day): BFS from top row avoiding water.', 'Binary search the last true day, mid rounds up.', 'log(rc) BFS runs: O(rc log rc).'],
      solution: crossCode,
      pitfalls: ['1-indexed cells', 'mid must round up for last-true search', 'Rebuilding water per guess is fine: O(rc)'],
    },
    {
      id: `${topicId}:problem:84`, lc: 84, title: 'Largest Rectangle in Histogram', difficulty: 'Hard', google: true, skills: ['monotonic-stack', 'stack'], pattern: 'Monotonic increasing stack', ds: ['stack'],
      constraints: '1 ≤ n ≤ 10^5, 0 ≤ h ≤ 10^4', time: 'O(n)', space: 'O(n)',
      insight: 'A bar\'s rectangle ends when a shorter bar arrives.',
      signals: ['largest rectangle', 'histogram', 'contiguous bars', 'width 1'],
      narration: ['Heights can be 0? Yes.', 'n is 10^5, so O(n²) is out.', 'Increasing stack of (start, h); shorter bar pops and measures.', 'Push new bar at earliest popped start; 0 sentinel flushes.', 'Each bar pushed and popped once: O(n).'],
      solution: histogramCode, traceId: histogramTrace.id,
      pitfalls: ['Forgetting the sentinel', 'Pushing i instead of the popped start'],
    },
    {
      id: `${topicId}:problem:496`, lc: 496, title: 'Next Greater Element I', difficulty: 'Easy', google: true, skills: ['monotonic-stack', 'arrays-hashing'], pattern: 'Monotonic stack + hashmap', ds: ['stack', 'hashmap'],
      constraints: '1 ≤ nums1.length ≤ nums2.length ≤ 1000, distinct', time: 'O(n + m)', space: 'O(n)',
      insight: 'Precompute next greater for every value of nums2.',
      signals: ['next greater', 'to the right', 'subset of another array'],
      narration: ['Values distinct? Yes, so a map works.', 'Decreasing stack over nums2.', 'Bigger num pops smaller ones: record answer.', 'Lookup each nums1 value, default -1.', 'O(n + m) time, O(n) space.'],
      solution: nextGreaterCode,
      pitfalls: ['Searching nums2 for each query is O(nm)'],
    },
    {
      id: `${topicId}:problem:1944`, lc: 1944, title: 'Number of Visible People in a Queue', difficulty: 'Hard', google: true, skills: ['monotonic-stack', 'stack'], pattern: 'Monotonic stack right to left', ds: ['stack'],
      constraints: '1 ≤ n ≤ 10^5, distinct heights', time: 'O(n)', space: 'O(n)',
      insight: 'You see everyone you pop, plus the first taller one.',
      signals: ['can see', 'everyone in between shorter', 'to their right'],
      narration: ['Heights distinct? Yes.', 'Scan right to left with a decreasing stack.', 'Pop shorter people: each is visible, then hidden.', 'If stack remains, +1 for the taller blocker.', 'O(n) amortized time and space.'],
      solution: visibleCode, traceId: visibleTrace.id,
      pitfalls: ['Forgetting the +1 for the taller person', 'Scanning left to right'],
    },
  ]

  const traces = [orangesTrace, levelOrderTrace, kahnTrace, swimTrace, histogramTrace, visibleTrace]

  return { lessons, traces, flashcards, mcqs, clozes, parsons, problems }
})()
const partC = (() => {
  const listNodes = (vals, prefix) => vals.map((val, i) => ({ id: `${prefix}${i}`, val, next: i < vals.length - 1 ? `${prefix}${i + 1}` : null }))
  const listPanel = (label, nodes, pointers = {}, highlight = [], extra = {}) => ({ kind: 'linkedlist', label, nodes: clone(nodes), pointers: { ...pointers }, highlight: [...highlight], ...extra })

  const addTwoCode = `class Solution:
    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = ListNode()
        tail = dummy
        carry = 0

        while l1 or l2 or carry:
            first = l1.val if l1 else 0
            second = l2.val if l2 else 0

            total = first + second + carry
            carry = total // 10
            tail.next = ListNode(total % 10)
            tail = tail.next

            l1 = l1.next if l1 else None
            l2 = l2.next if l2 else None

        return dummy.next`

  const kGroupCode = `class Solution:
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
                temp = curr.next
                curr.next = prev
                prev = curr
                curr = temp

            first = groupPrev.next
            groupPrev.next = kth
            groupPrev = first`

  const middleCode = `class Solution:
    def middleNode(self, head: Optional[ListNode]) -> Optional[ListNode]:
        slow = fast = head

        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next

        return slow`

  const cycleCode = `class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        slow = fast = head

        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow is fast:
                return True

        return False`

  const subsetsCode = `class Solution:
    def subsets(self, nums: List[int]) -> List[List[int]]:
        result = []
        curr = []

        def dfs(i):
            if i == len(nums):
                result.append(curr.copy())
                return

            curr.append(nums[i])
            dfs(i + 1)
            curr.pop()

            dfs(i + 1)

        dfs(0)
        return result`

  const lettersCode = `class Solution:
    def letterCombinations(self, digits: str) -> List[str]:
        if not digits:
            return []

        letters = {'2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl', '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz'}
        result = []
        curr = []

        def dfs(i):
            if i == len(digits):
                result.append(''.join(curr))
                return

            for char in letters[digits[i]]:
                curr.append(char)
                dfs(i + 1)
                curr.pop()

        dfs(0)
        return result`

  const parensCode = `class Solution:
    def generateParenthesis(self, n: int) -> List[str]:
        result = []
        curr = []

        def dfs(opened, closed):
            if len(curr) == 2 * n:
                result.append(''.join(curr))
                return

            if opened < n:
                curr.append('(')
                dfs(opened + 1, closed)
                curr.pop()

            if closed < opened:
                curr.append(')')
                dfs(opened, closed + 1)
                curr.pop()

        dfs(0, 0)
        return result`

  const timeMapCode = `import bisect
from collections import defaultdict as dd

class TimeMap:

    def __init__(self):
        self.times = dd(list)
        self.values = dd(list)

    def set(self, key: str, value: str, timestamp: int) -> None:
        self.times[key].append(timestamp)
        self.values[key].append(value)

    def get(self, key: str, timestamp: int) -> str:
        times = self.times[key]
        index = bisect.bisect_right(times, timestamp)

        if index == 0:
            return ""

        return self.values[key][index - 1]`

  const loggerCode = `class Logger:

    def __init__(self):
        self.nextAllowed = {}

    def shouldPrintMessage(self, timestamp: int, message: str) -> bool:
        if timestamp < self.nextAllowed.get(message, 0):
            return False

        self.nextAllowed[message] = timestamp + 10
        return True`

  const lisCode = `import bisect

class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        tails = []

        for num in nums:
            index = bisect.bisect_left(tails, num)

            if index == len(tails):
                tails.append(num)
            else:
                tails[index] = num

        return len(tails)`

  const envelopesCode = `import bisect

class Solution:
    def maxEnvelopes(self, envelopes: List[List[int]]) -> int:
        envelopes.sort(key=lambda e: (e[0], -e[1]))
        tails = []

        for width, height in envelopes:
            index = bisect.bisect_left(tails, height)

            if index == len(tails):
                tails.append(height)
            else:
                tails[index] = height

        return len(tails)`

  const bisectLeft = (arr, x) => { let lo = 0, hi = arr.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (arr[mid] < x) lo = mid + 1; else hi = mid } return lo }
  const bisectRight = (arr, x) => { let lo = 0, hi = arr.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (arr[mid] <= x) lo = mid + 1; else hi = mid } return lo }

  const lessons = [
    {
      id: 'gaps:list-surgery:lesson',
      title: 'Linked-list pointer surgery',
      skills: ['linked-list', 'two-pointers'],
      slides: [
        {
          title: 'A ==dummy== node kills edge cases',
          panels: [{ kind: 'linkedlist', label: 'result being built', nodes: [{ id: 'd', val: 'dummy', next: 'r0' }, { id: 'r0', val: 7, next: 'r1' }, { id: 'r1', val: 0, next: null }], pointers: { dummy: 'd', tail: 'r1' }, highlight: ['d'] }],
          points: ['Never special-case the head', '==tail== appends in O(1)', 'Return ==dummy.next=='],
        },
        {
          title: 'Add digits with a ==carry==',
          panels: [
            { kind: 'linkedlist', label: 'l1 = 342 (reversed)', nodes: [{ id: 'a0', val: 2, next: 'a1' }, { id: 'a1', val: 4, next: 'a2' }, { id: 'a2', val: 3, next: null }], pointers: { l1: 'a1' }, highlight: ['a1'] },
            { kind: 'linkedlist', label: 'l2 = 465 (reversed)', nodes: [{ id: 'b0', val: 5, next: 'b1' }, { id: 'b1', val: 6, next: 'b2' }, { id: 'b2', val: 4, next: null }], pointers: { l2: 'b1' }, highlight: ['b1'] },
            { kind: 'text', text: '4 + 6 + carry 1 = 11 → write 1, carry 1' },
          ],
          points: ['Digit = ==total % 10==', 'Carry = ==total // 10==', 'Loop while ==l1 or l2 or carry=='],
        },
        {
          title: '==Reverse== a group in place',
          panels: [{ kind: 'linkedlist', label: 'k = 2, first group', nodes: [{ id: 'D', val: 'dummy', next: 'n1' }, { id: 'n0', val: 1, next: 'n2' }, { id: 'n1', val: 2, next: 'n0' }, { id: 'n2', val: 3, next: 'n3' }, { id: 'n3', val: 4, next: null }], pointers: { groupPrev: 'D', kth: 'n1', groupNext: 'n2' }, highlight: ['n0', 'n1'] }],
          points: ['Find ==kth== node first; fewer than k → stop', 'Reverse with ==prev = groupNext==', 'Old first becomes next ==groupPrev=='],
        },
        {
          title: '==Fast / slow== pointers',
          panels: [{ kind: 'linkedlist', label: 'fast moves 2, slow moves 1', nodes: [{ id: 'm0', val: 1, next: 'm1' }, { id: 'm1', val: 2, next: 'm2' }, { id: 'm2', val: 3, next: 'm3' }, { id: 'm3', val: 4, next: 'm4' }, { id: 'm4', val: 5, next: null }], pointers: { slow: 'm2', fast: 'm4' }, highlight: ['m2'] }],
          points: ['fast at end → slow at ==middle==', 'They meet → ==cycle==', 'Compare ==nodes==, never values'],
        },
        {
          title: 'Template',
          code: `dummy = ListNode()
tail = dummy

while l1 or l2 or carry:
    total = first + second + carry
    carry = total // 10
    tail.next = ListNode(total % 10)
    tail = tail.next

return dummy.next`,
          highlight: 7,
          points: ['Draw boxes and arrows before coding', 'Save ==next== before you overwrite it'],
        },
        {
          title: 'Complexity',
          points: ['Each node touched a constant number of times → ==O(n)==', 'Rewiring in place → ==O(1)== extra (output list aside)'],
          ask: { q: 'Your 141 stored node VALUES in a set. Fails when?', choices: ['Empty list', 'Duplicate values, no cycle', 'One node', 'Long list'], answer: 1, why: 'Two different nodes with equal values look like a revisit. Compare node identity, or use fast/slow.' },
        },
      ],
    },
    {
      id: 'gaps:choose-skip:lesson',
      title: 'Backtracking: choose, explore, unchoose',
      skills: ['backtracking'],
      slides: [
        {
          title: 'Every element: ==take== it or ==skip== it',
          panels: [{ kind: 'tree', label: 'decision tree for [1, 2]', root: { id: 'n', val: '[]', left: { id: 'n1', val: '[1]', left: { id: 'n11', val: '[1,2]', left: null, right: null }, right: { id: 'n10', val: '[1]', left: null, right: null } }, right: { id: 'n0', val: '[]', left: { id: 'n01', val: '[2]', left: null, right: null }, right: { id: 'n00', val: '[]', left: null, right: null } } }, state: { n11: 'done', n10: 'done', n01: 'done', n00: 'done' } }],
          points: ['Left = take, right = skip', 'Each ==leaf== is one answer', '2^n leaves'],
        },
        {
          title: 'One shared ==curr== list',
          panels: [
            { kind: 'callstack', label: 'recursion', frames: ['dfs(0)', 'dfs(1)', 'dfs(2)'] },
            { kind: 'array', label: 'curr', values: [1, 2], highlight: [1] },
          ],
          points: ['==append== before going down', '==pop== after coming back', 'Leaf saves ==curr.copy()=='],
        },
        {
          title: 'Template',
          code: `def dfs(i):
    if i == len(nums):
        result.append(curr.copy())
        return

    curr.append(nums[i])
    dfs(i + 1)
    curr.pop()

    dfs(i + 1)`,
          highlight: 8,
          points: ['Choose → explore → ==unchoose==', 'Base case = all decisions made'],
        },
        {
          title: '==Pruning== = skip dead branches',
          panels: [{ kind: 'text', text: 'Parentheses: add "(" only if opened < n, ")" only if closed < opened' }],
          points: ['Check validity ==before== recursing', 'Never build then filter', 'Same template for strings: ==\'\'.join(curr)=='],
        },
        {
          title: 'Complexity',
          points: ['Leaves × copy cost: subsets ==O(n·2^n)==', 'Letters ==O(4^n·n)==', 'Space ==O(n)== recursion depth, plus output', 'n ≤ 20 hints ==2^n=='],
        },
        {
          title: 'Check',
          ask: { q: 'Why curr.copy() at the leaf?', choices: ['Faster', 'curr keeps mutating after we save it', 'Sorting', 'Python requires it'], answer: 1, why: 'Without a copy every saved entry points to the same list, which ends empty.' },
        },
      ],
    },
    {
      id: 'gaps:design-bisect:lesson',
      title: 'Design: hashmap + sorted list + bisect',
      skills: ['ds-diagnosis', 'binary-search', 'arrays-hashing'],
      slides: [
        {
          title: '==Key== → sorted history',
          panels: [
            { kind: 'hashmap', label: 'self.times', entries: [['foo', '[1, 4, 9]'], ['bar', '[2]']], highlight: ['foo'] },
            { kind: 'array', label: "times['foo']", values: [1, 4, 9], sorted: true, pointers: {}, highlight: [] },
          ],
          points: ['Hashmap finds the key in ==O(1)==', 'List holds that key\'s timestamps'],
        },
        {
          title: '==Increasing== timestamps = free sort',
          panels: [{ kind: 'array', label: 'append 12', values: [1, 4, 9, 12], sorted: true, pointers: { new: 3 }, highlight: [3] }],
          points: ['Ask: are set() timestamps ==strictly increasing==?', 'Yes → ==append== keeps order, O(1)'],
        },
        {
          title: '==bisect_right== − 1 = latest ≤ t',
          panels: [{ kind: 'array', label: 'get(foo, 6)', values: [1, 4, 9], sorted: true, pointers: { 'index-1': 1, index: 2 }, highlight: [1] }],
          points: ['bisect_right counts items ==≤ t==', 'index 0 → nothing old enough → ""'],
        },
        {
          title: 'Template',
          code: `def get(self, key: str, timestamp: int) -> str:
    times = self.times[key]
    index = bisect.bisect_right(times, timestamp)

    if index == 0:
        return ""

    return self.values[key][index - 1]`,
          highlight: 3,
          points: ['Logger 359: map ==message → next allowed time=='],
        },
        {
          title: 'Complexity + clarify',
          points: ['set ==O(1)==, get ==O(log n)==, space O(total sets)', 'Ask: missing key? ties? memory growth? concurrency?'],
          ask: { q: 'Need "latest value at or before t". Best structure?', choices: ['Heap per key', 'Hashmap of sorted lists + bisect', 'Linked list', 'Set'], answer: 1, why: 'Hashmap isolates the key; a sorted list answers predecessor queries with binary search in O(log n).' },
        },
      ],
    },
    {
      id: 'gaps:lis-bisect:lesson',
      title: 'LIS in O(n log n): patience tails',
      skills: ['dp-1d', 'binary-search', 'constraints'],
      slides: [
        {
          title: '==tails[i]== = smallest end of length i+1',
          panels: [{ kind: 'array', label: 'tails after 10, 9, 2, 5, 3', values: [2, 3], sorted: true, pointers: {}, highlight: [1] }],
          points: ['Small endings leave the most room to grow', 'tails stays ==sorted=='],
        },
        {
          title: 'New number: ==extend== or ==replace==',
          panels: [
            { kind: 'array', label: 'tails', values: [2, 3, 7], sorted: true, pointers: { index: 2 }, highlight: [2] },
            { kind: 'text', text: 'num = 4 → bisect_left = 2 → replace 7 with 4' },
          ],
          points: ['Bigger than all → ==append==', 'Else ==overwrite== first ≥ num', 'len(tails) = answer'],
        },
        {
          title: 'Template',
          code: `tails = []

for num in nums:
    index = bisect.bisect_left(tails, num)

    if index == len(tails):
        tails.append(num)
    else:
        tails[index] = num

return len(tails)`,
          highlight: 4,
          points: ['==bisect_left== → strictly increasing', 'tails is NOT the actual subsequence'],
        },
        {
          title: '==2D==: Russian dolls',
          panels: [{ kind: 'array', label: 'sorted (w asc, h desc) → heights', values: ['[2,3]', '[5,4]', '[6,7]', '[6,4]'], pointers: {}, highlight: [2, 3] }],
          points: ['Sort width asc, ==height desc== on ties', 'Then LIS on heights', 'Desc stops equal widths nesting'],
        },
        {
          title: 'Complexity',
          points: ['n binary searches → ==O(n log n)==, O(n) space', 'n ≤ 2500: O(n²) ok', 'n ≤ 10^5 (354): O(n²) = 10^10, ==too slow=='],
          ask: { q: 'n = 10^5 envelopes. Your O(n²) DP?', choices: ['Fine', 'About 10^10 ops: TLE', 'Fine with memo', 'Needs O(n³)'], answer: 1, why: 'Budget is ~10^8 ops per second. 10^10 is 100× over, so use bisect tails.' },
        },
      ],
    },
  ]

  const addTwoTrace = {
    id: 'gaps:list-surgery:trace:add-two',
    title: 'Add Two Numbers',
    skills: ['linked-list'],
    problem: 'Digits stored in reverse order. Return the sum as a linked list.',
    code: addTwoCode,
    complexity: { time: 'O(max(m, n))', space: 'O(1) extra', why: 'One pass over both lists; only carry and pointers besides the output.' },
    inputs: [
      { label: '342 + 465', value: { l1: [2, 4, 3], l2: [5, 6, 4] } },
      { label: '999 + 1', value: { l1: [9, 9, 9], l2: [1] } },
      { label: '5 + 5', value: { l1: [5], l2: [5] } },
    ],
    run(input, t) {
      const { l1, l2 } = unwrap(input)
      const L = lineFinder(addTwoCode)
      const nodesA = listNodes(l1, 'a')
      const nodesB = listNodes(l2, 'b')
      const out = [{ id: 'd', val: 'dummy', next: null }]
      let p1 = 0
      let p2 = 0
      let carry = 0
      const idA = () => (p1 < nodesA.length ? `a${p1}` : null)
      const idB = () => (p2 < nodesB.length ? `b${p2}` : null)
      const view = (hl = []) => [
        listPanel('l1', nodesA, { l1: idA() }, idA() ? [idA()] : []),
        listPanel('l2', nodesB, { l2: idB() }, idB() ? [idB()] : []),
        listPanel('result', out, { dummy: 'd', tail: out[out.length - 1].id }, hl),
        { kind: 'text', text: `carry = ${carry}` },
      ]
      t.step(L('dummy = ListNode()'), { vars: {}, panels: view(['d']), note: 'Placeholder head so we never special-case.', say: 'I use a dummy head so appending the first digit is the same as any other.' })
      t.step(L('tail = dummy'), { vars: {}, panels: view(), note: 'tail = last node of the result.' })
      t.step(L('carry = 0'), { vars: { carry }, panels: view(), note: 'No carry yet.' })
      let first = true
      while (idA() || idB() || carry) {
        t.step(L('while l1 or l2 or carry'), { vars: { l1: idA() ? nodesA[p1].val : null, l2: idB() ? nodesB[p2].val : null, carry }, panels: view(), note: 'Keep going while anything is left.', say: first ? 'The loop also runs on a leftover carry, so 99 + 1 grows a new digit.' : undefined })
        first = false
        const a = idA() ? nodesA[p1].val : 0
        const b = idB() ? nodesB[p2].val : 0
        t.step(L('second = l2.val'), { vars: { first: a, second: b }, panels: view(), note: 'Missing list counts as 0.' })
        const total = a + b + carry
        t.step(L('total = first'), { vars: { first: a, second: b, carry, total }, panels: view(), note: `${a} + ${b} + ${carry} = ${total}.` })
        carry = Math.floor(total / 10)
        t.step(L('carry = total // 10'), { vars: { total, carry }, panels: view(), note: `Carry ${carry} goes to the next digit.` })
        const id = `r${out.length - 1}`
        out[out.length - 1].next = id
        out.push({ id, val: total % 10, next: null })
        t.step(L('tail.next = ListNode'), { vars: { digit: total % 10 }, panels: view([id]), note: `Append digit ${total % 10}.`, say: total >= 10 ? 'Write total mod 10, carry total div 10.' : undefined })
        t.step(L('tail = tail.next'), { vars: {}, panels: view([id]), note: 'Move tail to the new node.' })
        if (idA()) p1++
        if (idB()) p2++
        t.step(L('l2 = l2.next'), { vars: { l1: idA() ? nodesA[p1].val : null, l2: idB() ? nodesB[p2].val : null }, panels: view(), note: 'Advance both inputs if they exist.' })
      }
      t.step(L('while l1 or l2 or carry'), { vars: { carry }, panels: view(), note: 'Nothing left. Stop.' })
      t.step(L('return dummy.next'), { vars: { result: out.slice(1).map(n => n.val) }, panels: view(out.slice(1).map(n => n.id)), note: 'Skip the dummy.', say: 'One pass, O(max(m, n)) time, constant extra space besides the output.' })
    },
  }

  const kGroupTrace = {
    id: 'gaps:list-surgery:trace:k-group',
    title: 'Reverse Nodes in k-Group',
    skills: ['linked-list'],
    problem: 'Reverse every block of k nodes; leftover tail stays as is.',
    code: kGroupCode,
    complexity: { time: 'O(n)', space: 'O(1)', why: 'Each node is visited by the kth scan and once by the reversal.' },
    inputs: [
      { label: '1..5, k=2', value: { values: [1, 2, 3, 4, 5], k: 2 } },
      { label: '1..7, k=3', value: { values: [1, 2, 3, 4, 5, 6, 7], k: 3 } },
      { label: '1..4, k=4', value: { values: [1, 2, 3, 4], k: 4 } },
    ],
    run(input, t) {
      const { values, k } = unwrap(input)
      const L = lineFinder(kGroupCode)
      const nodes = { D: { id: 'D', val: 'dummy', next: values.length ? 'n0' : null } }
      values.forEach((val, i) => { nodes[`n${i}`] = { id: `n${i}`, val, next: i < values.length - 1 ? `n${i + 1}` : null } })
      const ptr = {}
      const ordered = () => {
        const out = []
        const seen = new Set()
        let id = 'D'
        while (id && !seen.has(id)) { seen.add(id); out.push(nodes[id]); id = nodes[id].next }
        for (const key of Object.keys(nodes)) if (!seen.has(key)) out.push(nodes[key])
        return out
      }
      const view = (hl = []) => [listPanel(`k = ${k}`, ordered(), Object.fromEntries(Object.entries(ptr).filter(([, v]) => v !== undefined)), hl)]
      const val = id => (id ? nodes[id].val : null)
      ptr.dummy = 'D'
      t.step(L('dummy = ListNode(0, head)'), { vars: { k }, panels: view(['D']), note: 'Dummy points at head.', say: 'A dummy before the head means the first group is not a special case.' })
      ptr.groupPrev = 'D'
      t.step(L('groupPrev = dummy'), { vars: {}, panels: view(), note: 'groupPrev = node just before the group.' })
      let saidReverse = false
      while (true) {
        t.step(L('while True'), { vars: { groupPrev: val(ptr.groupPrev) }, panels: view(), note: 'Try the next group.' })
        let kth = ptr.groupPrev
        ptr.kth = kth
        t.step(L('kth = groupPrev'), { vars: { kth: val(kth) }, panels: view(), note: 'Walk k steps to find the group end.', say: 'First I check there are k nodes. If not, the tail stays unreversed.' })
        let short = false
        for (let s = 0; s < k; s++) {
          kth = nodes[kth].next
          ptr.kth = kth
          t.step(L('kth = kth.next'), { vars: { step: s + 1, kth: val(kth) }, panels: view(kth ? [kth] : []), note: kth ? `Step ${s + 1}: kth = ${val(kth)}.` : 'Ran off the end.' })
          if (!kth) { short = true; break }
        }
        if (short) {
          delete ptr.kth
          t.step(L('return dummy.next'), { vars: { result: ordered().slice(1).map(n => n.val) }, panels: view(), note: 'Fewer than k left. Done.', say: 'Each node is touched about twice, so O(n) time and O(1) space.' })
          return
        }
        ptr.groupNext = nodes[kth].next
        t.step(L('groupNext = kth.next'), { vars: { groupNext: val(ptr.groupNext) }, panels: view(), note: 'Remember what follows the group.' })
        let prev = ptr.groupNext
        let curr = nodes[ptr.groupPrev].next
        ptr.prev = prev
        ptr.curr = curr
        t.step(L('prev, curr = groupNext'), { vars: { prev: val(prev), curr: val(curr) }, panels: view(), note: 'prev starts at groupNext so the reversed tail links out.', say: saidReverse ? undefined : 'Setting prev to groupNext means the last reversed node already points at the rest of the list.' })
        while (curr !== ptr.groupNext) {
          t.step(L('while curr != groupNext'), { vars: { curr: val(curr), prev: val(prev) }, panels: view([curr]), note: `Reverse node ${val(curr)}.` })
          const temp = nodes[curr].next
          nodes[curr].next = prev
          t.step(L('curr.next = prev'), { vars: { temp: val(temp), curr: val(curr), prev: val(prev) }, panels: view([curr]), note: `${val(curr)} now points back to ${val(prev) ?? 'None'}.`, say: saidReverse ? undefined : 'Save next first, then flip the arrow. Same as reverse list.' })
          saidReverse = true
          prev = curr
          curr = temp
          ptr.prev = prev
          ptr.curr = curr
          t.step(L('curr = temp'), { vars: { prev: val(prev), curr: val(curr) }, panels: view([prev]), note: 'Shift prev and curr forward.' })
        }
        delete ptr.curr
        delete ptr.prev
        const first = nodes[ptr.groupPrev].next
        ptr.first = first
        t.step(L('first = groupPrev.next'), { vars: { first: val(first) }, panels: view([first]), note: 'Old first is now the group tail.' })
        nodes[ptr.groupPrev].next = kth
        t.step(L('groupPrev.next = kth'), { vars: { kth: val(kth) }, panels: view([kth]), note: 'Hook the previous part to the new group head.' })
        ptr.groupPrev = first
        delete ptr.first
        delete ptr.groupNext
        t.step(L('groupPrev = first'), { vars: { groupPrev: val(first) }, panels: view([first]), note: 'Next group starts after old first.' })
      }
    },
  }

  const subsetsTrace = {
    id: 'gaps:choose-skip:trace:subsets',
    title: 'Subsets (take / skip)',
    skills: ['backtracking'],
    problem: 'Return all subsets of distinct nums.',
    code: subsetsCode,
    complexity: { time: 'O(n · 2^n)', space: 'O(n) + output', why: '2^n leaves, each copies up to n items; recursion depth n.' },
    inputs: [
      { label: '[1, 2, 3]', value: [1, 2, 3] },
      { label: '[5, 7]', value: [5, 7] },
    ],
    run(input, t) {
      const nums = unwrap(input)
      const L = lineFinder(subsetsCode)
      const n = nums.length
      const build = (path, chosen, i) => ({
        id: `n${path}`,
        val: `[${chosen.join(',')}]`,
        left: i < n ? build(`${path}1`, [...chosen, nums[i]], i + 1) : null,
        right: i < n ? build(`${path}0`, chosen, i + 1) : null,
      })
      const root = build('', [], 0)
      const state = {}
      const result = []
      const curr = []
      const frames = []
      let node = 'n'
      const view = () => [
        { kind: 'tree', label: 'left = take, right = skip', root: clone(root), state: { ...state, [node]: 'current' }, pointers: { here: node } },
        { kind: 'callstack', label: 'calls', frames: [...frames] },
        { kind: 'array', label: 'curr', values: [...curr], highlight: curr.length ? [curr.length - 1] : [] },
        { kind: 'text', text: `result = ${JSON.stringify(result)}` },
      ]
      t.step(L('result = []'), { vars: {}, panels: view(), note: 'Collected answers.' })
      t.step(L('curr = []'), { vars: {}, panels: view(), note: 'One shared path, mutated in place.', say: 'I keep one list for the current choices and undo after each branch.' })
      let saidPop = false
      let saidSkip = false
      const dfs = (i, id) => {
        frames.push(`dfs(${i})`)
        node = id
        t.step(L('if i == len(nums)'), { vars: { i, curr: [...curr] }, panels: view(), note: i === n ? 'All decided: leaf.' : `Decide on ${nums[i]}.` })
        if (i === n) {
          result.push([...curr])
          state[id] = 'done'
          t.step(L('result.append(curr.copy())'), { vars: { saved: [...curr] }, panels: view(), note: `Save a copy of [${curr.join(',')}].`, say: result.length === 1 ? 'At a leaf I save a copy, because curr keeps changing.' : undefined })
          frames.pop()
          return
        }
        curr.push(nums[i])
        t.step(L('curr.append(nums[i])'), { vars: { i, curr: [...curr] }, panels: view(), note: `Choose ${nums[i]}.` })
        t.step(L('dfs(i + 1)'), { vars: { i }, panels: view(), note: 'Explore the take branch.' })
        dfs(i + 1, `${id}1`)
        node = id
        state[id] = 'visited'
        curr.pop()
        t.step(L('curr.pop()'), { vars: { i, curr: [...curr] }, panels: view(), note: `Unchoose ${nums[i]}.`, say: saidPop ? undefined : 'Pop to undo the choice, so the skip branch starts clean.' })
        saidPop = true
        t.step(L('dfs(i + 1)', 2), { vars: { i }, panels: view(), note: `Skip ${nums[i]}.`, say: saidSkip ? undefined : 'Now the branch where this element is skipped.' })
        saidSkip = true
        dfs(i + 1, `${id}0`)
        node = id
        state[id] = 'done'
        frames.pop()
      }
      t.step(L('dfs(0)'), { vars: {}, panels: view(), note: 'Start at index 0.' })
      dfs(0, 'n')
      node = 'n'
      t.step(L('return result'), { vars: { count: result.length }, panels: view(), note: `${result.length} subsets = 2^${n}.`, say: `2^n leaves, each copy up to n, so O(n·2^n) time and O(n) depth.` })
    },
  }

  const timeMapTrace = {
    id: 'gaps:design-bisect:trace:time-map',
    title: 'Time Based Key-Value Store',
    skills: ['ds-diagnosis', 'binary-search', 'arrays-hashing'],
    problem: 'set(key, value, t); get(key, t) returns value with largest timestamp ≤ t.',
    code: timeMapCode,
    complexity: { time: 'set O(1), get O(log n)', space: 'O(total sets)', why: 'Timestamps arrive increasing, so append keeps order; get is one binary search.' },
    inputs: [
      { label: 'one key', value: [['set', 'foo', 'bar', 1], ['get', 'foo', 1], ['get', 'foo', 3], ['set', 'foo', 'bar2', 4], ['get', 'foo', 4], ['get', 'foo', 5], ['get', 'foo', 0]] },
      { label: 'two keys', value: [['set', 'a', 'x', 1], ['set', 'b', 'y', 2], ['set', 'a', 'z', 5], ['set', 'a', 'w', 9], ['get', 'a', 6], ['get', 'b', 1], ['get', 'a', 9], ['get', 'c', 3]] },
    ],
    run(input, t) {
      const ops = unwrap(input)
      const L = lineFinder(timeMapCode)
      const times = {}
      const values = {}
      const log = []
      const view = (key = null, pointers = {}, hl = []) => [
        { kind: 'hashmap', label: 'self.times', entries: Object.entries(times).map(([k, v]) => [k, `[${v.join(', ')}]`]), highlight: key && times[key] ? [key] : [] },
        { kind: 'hashmap', label: 'self.values', entries: Object.entries(values).map(([k, v]) => [k, `[${v.join(', ')}]`]), highlight: key && values[key] ? [key] : [] },
        { kind: 'array', label: key ? `times['${key}']` : 'times[key]', values: key && times[key] ? [...times[key]] : [], sorted: true, pointers: { ...pointers }, highlight: [...hl] },
        { kind: 'text', text: log.length ? log.join('  ·  ') : 'no calls yet' },
      ]
      t.step(L('self.times = dd(list)'), { vars: {}, panels: view(), note: 'key → list of timestamps.', say: 'Two parallel lists per key: timestamps and values. I ask first: are set timestamps strictly increasing?' })
      t.step(L('self.values = dd(list)'), { vars: {}, panels: view(), note: 'key → list of values, same order.' })
      let saidSet = false
      let saidGet = false
      for (const op of ops) {
        if (op[0] === 'set') {
          const [, key, value, ts] = op
          t.step(L('def set'), { vars: { key, value, timestamp: ts }, panels: view(key), note: `set(${key}, ${value}, ${ts})` })
          times[key] = times[key] || []
          values[key] = values[key] || []
          times[key].push(ts)
          t.step(L('self.times[key].append'), { vars: { key, timestamp: ts }, panels: view(key, { new: times[key].length - 1 }, [times[key].length - 1]), note: 'Append keeps the list sorted.', say: saidSet ? undefined : 'Timestamps only increase, so append is O(1) and the list stays sorted for free.' })
          saidSet = true
          values[key].push(value)
          log.push(`set ${key}@${ts}`)
          t.step(L('self.values[key].append'), { vars: { key, value }, panels: view(key, { new: times[key].length - 1 }, [times[key].length - 1]), note: 'Value at the same index.' })
        } else {
          const [, key, ts] = op
          t.step(L('def get'), { vars: { key, timestamp: ts }, panels: view(key), note: `get(${key}, ${ts})` })
          const list = times[key] || []
          t.step(L('times = self.times[key]'), { vars: { times: [...list] }, panels: view(key), note: list.length ? `${list.length} timestamps for ${key}.` : `No history for ${key}.` })
          const index = bisectRight(list, ts)
          t.step(L('index = bisect.bisect_right'), { vars: { timestamp: ts, index }, panels: view(key, { index }, index > 0 ? [index - 1] : []), note: `${index} timestamps are ≤ ${ts}.`, say: saidGet ? undefined : 'bisect_right gives the count of timestamps at or before t, so index minus one is the latest valid one.' })
          saidGet = true
          t.step(L('if index == 0'), { vars: { index }, panels: view(key, { index }, index > 0 ? [index - 1] : []), note: index === 0 ? 'Nothing old enough.' : 'Something exists.' })
          if (index === 0) {
            log.push(`get ${key}@${ts} → ""`)
            t.step(L('return ""'), { vars: { answer: '' }, panels: view(key, { index }), note: 'Return empty string.' })
          } else {
            const answer = values[key][index - 1]
            log.push(`get ${key}@${ts} → ${answer}`)
            t.step(L('return self.values[key][index - 1]'), { vars: { answer }, panels: view(key, { 'index-1': index - 1 }, [index - 1]), note: `Latest ≤ ${ts} is ${times[key][index - 1]} → ${answer}.` })
          }
        }
      }
    },
  }

  const lisTrace = {
    id: 'gaps:lis-bisect:trace:lis',
    title: 'LIS with patience tails',
    skills: ['dp-1d', 'binary-search'],
    problem: 'Length of the longest strictly increasing subsequence.',
    code: lisCode,
    complexity: { time: 'O(n log n)', space: 'O(n)', why: 'One binary search on tails per number.' },
    inputs: [
      { label: 'classic', value: [10, 9, 2, 5, 3, 7, 101, 18] },
      { label: 'dips', value: [0, 1, 0, 3, 2, 3] },
      { label: 'equal', value: [7, 7, 7, 7, 7] },
    ],
    run(input, t) {
      const nums = unwrap(input)
      const L = lineFinder(lisCode)
      const tails = []
      const view = (i, idx = null) => [
        { kind: 'array', label: 'nums', values: [...nums], pointers: i == null ? {} : { num: i }, highlight: i == null ? [] : [i], dim: i == null ? [] : range(i) },
        { kind: 'array', label: 'tails (smallest end per length)', values: [...tails], sorted: true, pointers: idx == null ? {} : { index: idx }, highlight: idx == null || idx >= tails.length ? [] : [idx] },
        { kind: 'complexity', n: nums.length, ops: tails.length },
      ]
      t.step(L('tails = []'), { vars: {}, panels: view(null), note: 'tails[i] = smallest end of an increasing run of length i+1.', say: 'I keep, for every length, the smallest possible ending value. That array stays sorted, so I can binary search it.' })
      let saidReplace = false
      nums.forEach((num, i) => {
        t.step(L('for num in nums'), { vars: { num, tails: [...tails] }, panels: view(i), note: `Place ${num}.` })
        const index = bisectLeft(tails, num)
        t.step(L('index = bisect.bisect_left'), { vars: { num, index }, panels: view(i, index), note: `First tail ≥ ${num} is at ${index}.` })
        if (index === tails.length) {
          tails.push(num)
          t.step(L('tails.append(num)'), { vars: { length: tails.length }, panels: view(i, index), note: `${num} beats every tail: LIS grows to ${tails.length}.`, say: i === 0 ? undefined : 'Bigger than every ending, so it extends the longest run.' })
        } else {
          const old = tails[index]
          tails[index] = num
          t.step(L('tails[index] = num'), { vars: { old, num }, panels: view(i, index), note: `Replace ${old} with ${num}: same length, smaller end.`, say: saidReplace ? undefined : 'Replacing does not change the length, it just gives future numbers a lower bar to beat.' })
          saidReplace = true
        }
      })
      t.step(L('return len(tails)'), { vars: { answer: tails.length }, panels: view(null), note: `Answer ${tails.length}. tails is not the real subsequence.`, say: 'n binary searches, so O(n log n). For n = 10^5 the O(n²) DP would be 10^10 ops.' })
    },
  }

  const traces = [addTwoTrace, kGroupTrace, subsetsTrace, timeMapTrace, lisTrace]

  const flashcards = [
    { id: 'gaps:list-surgery:card:1', skills: ['linked-list'], front: 'Why start a built list with a dummy node?', back: 'No special case for the head. Append via tail, return dummy.next.' },
    { id: 'gaps:list-surgery:card:2', skills: ['linked-list'], front: 'Add Two Numbers: loop condition?', back: 'while l1 or l2 or carry. The carry alone can create a final digit (999 + 1).' },
    { id: 'gaps:list-surgery:card:3', skills: ['linked-list', 'two-pointers'], front: 'Find the middle node in one pass?', back: 'slow moves 1, fast moves 2. When fast hits the end, slow is the middle (second middle for even length).', code: 'while fast and fast.next:\n    slow = slow.next\n    fast = fast.next.next' },
    { id: 'gaps:list-surgery:card:4', skills: ['linked-list', 'two-pointers'], front: 'Why is a set of node VALUES wrong for cycle detection?', back: 'Different nodes can share a value. Track node objects, or use Floyd fast/slow for O(1) space.' },
    { id: 'gaps:list-surgery:card:5', skills: ['linked-list'], front: 'Reverse k-group: what does prev start as?', back: 'groupNext. The reversed group\'s last node then points at the rest of the list automatically.' },
    { id: 'gaps:choose-skip:card:1', skills: ['backtracking'], front: 'Backtracking in three words?', back: 'Choose, explore, unchoose. append, recurse, pop.' },
    { id: 'gaps:choose-skip:card:2', skills: ['backtracking'], front: 'Subsets: what are the two branches at index i?', back: 'Take nums[i] then dfs(i + 1), pop, then skip it with dfs(i + 1).' },
    { id: 'gaps:choose-skip:card:3', skills: ['backtracking'], front: 'Generate Parentheses: when can you add "(" and ")"?', back: '"(" if opened < n. ")" if closed < opened. Only valid prefixes are ever built.' },
    { id: 'gaps:choose-skip:card:4', skills: ['backtracking', 'constraints'], front: 'n ≤ 20 and "all combinations". What runtime is expected?', back: 'Exponential: O(2^n · n). Backtracking is the intended answer.' },
    { id: 'gaps:choose-skip:card:5', skills: ['backtracking'], front: 'Letter Combinations: complexity?', back: 'O(4^n · n): up to 4 letters per digit, n levels, joining each string costs n.' },
    { id: 'gaps:design-bisect:card:1', skills: ['ds-diagnosis', 'binary-search'], front: 'Time Map: structure for "latest value at or before t"?', back: 'Hashmap key → sorted timestamps (plus values). bisect_right(times, t) − 1.' },
    { id: 'gaps:design-bisect:card:2', skills: ['binary-search'], front: 'bisect_left vs bisect_right?', back: 'left: first index with item ≥ x. right: first index with item > x. right = count of items ≤ x.' },
    { id: 'gaps:design-bisect:card:3', skills: ['ds-diagnosis', 'arrays-hashing'], front: 'Logger Rate Limiter: what do you store?', back: 'message → next allowed timestamp. Print if t ≥ stored, then store t + 10. O(1) per call.' },
    { id: 'gaps:design-bisect:card:4', skills: ['ds-diagnosis'], front: 'Three clarifying questions for any design problem?', back: 'Are timestamps increasing? What to return when missing? Call volume and memory limits (need eviction?).' },
    { id: 'gaps:lis-bisect:card:1', skills: ['dp-1d', 'binary-search'], front: 'What does tails[i] mean in patience LIS?', back: 'Smallest ending value of any increasing subsequence of length i + 1. Always sorted.' },
    { id: 'gaps:lis-bisect:card:2', skills: ['dp-1d', 'binary-search'], front: 'Strict LIS: bisect_left or bisect_right?', back: 'bisect_left. An equal value replaces, never extends. bisect_right gives non-decreasing.' },
    { id: 'gaps:lis-bisect:card:3', skills: ['dp-1d'], front: 'Russian Doll Envelopes: sort key?', back: '(width asc, height desc). Then LIS on heights. Desc heights stop same-width envelopes from nesting.' },
    { id: 'gaps:lis-bisect:card:4', skills: ['constraints', 'dp-1d'], front: 'LIS with n = 10^5: which approach?', back: 'O(n log n) tails. O(n²) is 10^10 ops, far beyond ~10^8 per second.' },
  ]

  const mcqs = [
    { id: 'gaps:list-surgery:mcq:1', skills: ['linked-list'], difficulty: 1, q: 'Add Two Numbers on 999 + 1. Why loop on carry too?', choices: ['Speed', 'The sum has an extra digit only the carry produces', 'Handles negatives', 'Not needed'], answer: 1, why: '999 + 1 = 1000. After both lists end, carry 1 still needs a node.' },
    { id: 'gaps:list-surgery:mcq:2', skills: ['linked-list', 'two-pointers'], difficulty: 1, q: 'Middle of the list in one pass, O(1) space?', choices: ['Count then walk', 'Slow/fast pointers', 'Stack', 'Hash set'], answer: 1, why: 'Fast moves twice as far, so slow is at the midpoint when fast ends.' },
    { id: 'gaps:list-surgery:mcq:3', skills: ['linked-list'], difficulty: 2, q: 'Reverse k-group with fewer than k nodes left. What happens?', choices: ['Reverse them anyway', 'Leave them as is', 'Drop them', 'Raise error'], answer: 1, why: 'Scan for the kth node first; if it does not exist, return dummy.next unchanged.' },
    { id: 'gaps:list-surgery:mcq:4', skills: ['linked-list', 'two-pointers'], difficulty: 2, q: 'Cycle detection with a set of node.val fails on?', code: '1 -> 1 -> 2 -> None', choices: ['Nothing, it works', 'Reports a false cycle', 'Infinite loop', 'Crashes on None'], answer: 1, why: 'Second 1 is a different node with a seen value. Use node identity or Floyd.' },
    { id: 'gaps:list-surgery:mcq:5', skills: ['linked-list', 'complexity'], difficulty: 2, q: 'Reverse k-group extra space?', choices: ['O(k)', 'O(n)', 'O(1)', 'O(n/k)'], answer: 2, why: 'Only a few pointers: dummy, groupPrev, kth, prev, curr, temp.' },
    { id: 'gaps:choose-skip:mcq:1', skills: ['backtracking'], difficulty: 1, q: 'How many subsets does a set of n distinct items have?', choices: ['n²', 'n!', '2^n', 'n'], answer: 2, why: 'Each item is taken or skipped: two choices, n times.' },
    { id: 'gaps:choose-skip:mcq:2', skills: ['backtracking'], difficulty: 2, q: 'You forgot curr.pop() after the take branch. Result?', choices: ['Same output', 'Skip branches still contain the taken item', 'Fewer calls', 'Stack overflow'], answer: 1, why: 'Without unchoose, the skip branch inherits the choice, so subsets are wrong.' },
    { id: 'gaps:choose-skip:mcq:3', skills: ['backtracking', 'constraints'], difficulty: 1, q: '1 ≤ nums.length ≤ 10, "return all". Expected complexity?', choices: ['O(n)', 'O(n log n)', 'Exponential', 'O(n²)'], answer: 2, why: 'Tiny n plus "all" means output itself is exponential. Backtracking.' },
    { id: 'gaps:choose-skip:mcq:4', skills: ['backtracking'], difficulty: 2, q: 'Generate Parentheses: when is adding ")" allowed?', choices: ['closed < n', 'closed < opened', 'opened < n', 'Always'], answer: 1, why: 'A ")" needs an unmatched "(" before it.' },
    { id: 'gaps:choose-skip:mcq:5', skills: ['backtracking', 'complexity'], difficulty: 3, q: 'Letter Combinations for 4 digits all "7". Leaves?', choices: ['12', '64', '256', '81'], answer: 2, why: '"7" maps to 4 letters: 4^4 = 256 strings.' },
    { id: 'gaps:design-bisect:mcq:1', skills: ['ds-diagnosis', 'binary-search'], difficulty: 2, q: 'TimeMap get(key, t): which call finds the latest timestamp ≤ t?', choices: ['bisect_left(times, t)', 'bisect_right(times, t) - 1', 'bisect_left(times, t) - 1', 'times.index(t)'], answer: 1, why: 'bisect_right counts items ≤ t; minus one is the last of them.' },
    { id: 'gaps:design-bisect:mcq:2', skills: ['ds-diagnosis'], difficulty: 1, q: 'Timestamps for set are strictly increasing. Keeping each list sorted costs?', choices: ['O(log n) insort', 'O(n) insert', 'O(1) append', 'O(n log n) re-sort'], answer: 2, why: 'New timestamps are always largest, so append preserves order.' },
    { id: 'gaps:design-bisect:mcq:3', skills: ['ds-diagnosis', 'arrays-hashing'], difficulty: 1, q: 'Logger: print each message at most once per 10s. Store?', choices: ['Queue of all messages', 'message → next allowed time', 'Sorted list', 'Heap'], answer: 1, why: 'One hashmap lookup decides; O(1) per call.' },
    { id: 'gaps:design-bisect:mcq:4', skills: ['constraints', 'binary-search'], difficulty: 2, q: '2·10^5 get calls on lists up to 2·10^5. Linear scan per get?', choices: ['Fine', '4·10^10 ops: too slow, use bisect', 'Fine in Python', 'Needs a trie'], answer: 1, why: 'Bisect makes each get ~18 steps instead of 2·10^5.' },
    { id: 'gaps:design-bisect:mcq:5', skills: ['binary-search'], difficulty: 2, q: 'bisect_right([1, 4, 4, 9], 4)?', choices: ['1', '2', '3', '4'], answer: 2, why: 'First index with an item > 4 is 3.' },
    { id: 'gaps:lis-bisect:mcq:1', skills: ['dp-1d', 'binary-search'], difficulty: 2, q: 'tails = [2, 5, 7], next num = 3. New tails?', choices: ['[2, 3, 7]', '[2, 5, 7, 3]', '[3, 5, 7]', '[2, 3, 5, 7]'], answer: 0, why: 'bisect_left finds 5 (index 1); replace it with 3.' },
    { id: 'gaps:lis-bisect:mcq:2', skills: ['constraints', 'dp-1d'], difficulty: 1, q: 'LIS with n ≤ 2500. Is O(n²) acceptable?', choices: ['No', 'Yes, ~6·10^6 ops', 'Only in C++', 'Needs O(n)'], answer: 1, why: '2500² ≈ 6·10^6, well under 10^8.' },
    { id: 'gaps:lis-bisect:mcq:3', skills: ['dp-1d'], difficulty: 3, q: 'Envelopes sorted by (w asc, h asc) instead of h desc. Bug?', choices: ['None', 'Same-width envelopes count as nested', 'Crashes', 'Slower'], answer: 1, why: '[3,4],[3,5] would form an increasing height run despite equal widths.' },
    { id: 'gaps:lis-bisect:mcq:4', skills: ['dp-1d', 'binary-search'], difficulty: 2, q: 'After running on [3, 4, 1], tails = [1, 4]. Is tails the actual LIS?', choices: ['Always', 'Never', 'Not necessarily; only its length is guaranteed', 'Only for sorted input'], answer: 2, why: 'Replacements can mix elements from different runs. Length is correct.' },
    { id: 'gaps:lis-bisect:mcq:5', skills: ['dp-1d', 'binary-search'], difficulty: 2, q: 'Longest non-decreasing subsequence: which bisect?', choices: ['bisect_left', 'bisect_right', 'Either', 'Neither'], answer: 1, why: 'Equal values must extend, so search past equals with bisect_right.' },
  ]

  const clozes = [
    { id: 'gaps:list-surgery:cloze:1', skills: ['linked-list'], title: 'Add Two Numbers core', code: `dummy = ListNode()
tail = dummy
carry = 0

while l1 or l2 or [[carry]]:
    first = l1.val if l1 else 0
    second = l2.val if l2 else 0
    total = first + second + carry
    carry = total [[// 10]]
    tail.next = ListNode(total [[% 10]])
    tail = tail.next
    l1 = l1.next if l1 else None
    l2 = l2.next if l2 else None

return [[dummy.next]]`, hint: 'Digit is the remainder, carry is the quotient.' },
    { id: 'gaps:list-surgery:cloze:2', skills: ['linked-list', 'two-pointers'], title: 'Middle node', code: `slow = fast = head

while fast and [[fast.next]]:
    slow = [[slow.next]]
    fast = [[fast.next.next]]

return slow` },
    { id: 'gaps:choose-skip:cloze:1', skills: ['backtracking'], title: 'Subsets take / skip', code: `def dfs(i):
    if i == len(nums):
        result.append(curr.[[copy()]])
        return

    curr.append(nums[i])
    dfs([[i + 1]])
    curr.[[pop()]]

    dfs(i + 1)`, hint: 'Save a snapshot; undo the choice.' },
    { id: 'gaps:choose-skip:cloze:2', skills: ['backtracking'], title: 'Generate Parentheses pruning', code: `def dfs(opened, closed):
    if len(curr) == [[2 * n]]:
        result.append(''.join(curr))
        return

    if opened < [[n]]:
        curr.append('(')
        dfs(opened + 1, closed)
        curr.pop()

    if closed < [[opened]]:
        curr.append(')')
        dfs(opened, closed + 1)
        curr.pop()` },
    { id: 'gaps:design-bisect:cloze:1', skills: ['binary-search', 'ds-diagnosis'], title: 'TimeMap get', code: `def get(self, key: str, timestamp: int) -> str:
    times = self.times[key]
    index = bisect.[[bisect_right]](times, timestamp)

    if index == [[0]]:
        return ""

    return self.values[key][[[index - 1]]]` },
    { id: 'gaps:lis-bisect:cloze:1', skills: ['dp-1d', 'binary-search'], title: 'Patience LIS', code: `tails = []

for num in nums:
    index = bisect.[[bisect_left]](tails, num)

    if index == [[len(tails)]]:
        tails.append(num)
    else:
        tails[index] = [[num]]

return len(tails)` },
  ]

  const parsons = [
    { id: 'gaps:list-surgery:parsons:1', skills: ['linked-list'], title: 'Reverse one group of k', lines: [
      'groupNext = kth.next',
      'prev, curr = groupNext, groupPrev.next',
      'while curr != groupNext:',
      '    temp = curr.next',
      '    curr.next = prev',
      '    prev = curr',
      '    curr = temp',
      'first = groupPrev.next',
      'groupPrev.next = kth',
      'groupPrev = first',
    ], distractors: ['prev, curr = None, groupPrev.next', '    curr = curr.next'] },
    { id: 'gaps:choose-skip:parsons:1', skills: ['backtracking'], title: 'Letter Combinations dfs', lines: [
      'def dfs(i):',
      '    if i == len(digits):',
      "        result.append(''.join(curr))",
      '        return',
      '    for char in letters[digits[i]]:',
      '        curr.append(char)',
      '        dfs(i + 1)',
      '        curr.pop()',
      'dfs(0)',
    ], distractors: ['        dfs(i)', '    result.append(curr)'] },
    { id: 'gaps:design-bisect:parsons:1', skills: ['ds-diagnosis', 'arrays-hashing'], title: 'Logger Rate Limiter', lines: [
      'class Logger:',
      '    def __init__(self):',
      '        self.nextAllowed = {}',
      '    def shouldPrintMessage(self, timestamp: int, message: str) -> bool:',
      '        if timestamp < self.nextAllowed.get(message, 0):',
      '            return False',
      '        self.nextAllowed[message] = timestamp + 10',
      '        return True',
    ], distractors: ['        self.nextAllowed[message] = timestamp', '        if timestamp <= self.nextAllowed.get(message, 0):'] },
    { id: 'gaps:lis-bisect:parsons:1', skills: ['dp-1d', 'binary-search'], title: 'Russian Doll Envelopes', lines: [
      'envelopes.sort(key=lambda e: (e[0], -e[1]))',
      'tails = []',
      'for width, height in envelopes:',
      '    index = bisect.bisect_left(tails, height)',
      '    if index == len(tails):',
      '        tails.append(height)',
      '    else:',
      '        tails[index] = height',
      'return len(tails)',
    ], distractors: ['envelopes.sort()', '    index = bisect.bisect_right(tails, height)'] },
  ]

  const problems = [
    {
      id: 'gaps:problem:2', lc: 2, title: 'Add Two Numbers', difficulty: 'Medium', google: true, skills: ['linked-list'], pattern: 'Dummy node + carry', ds: ['linked list'],
      constraints: '1 ≤ nodes per list ≤ 100, digits 0-9, no leading zeros', time: 'O(max(m, n))', space: 'O(1) extra',
      insight: 'Grade-school addition from the ones digit; the reversed order is a gift.',
      signals: ['digits stored in reverse order', 'return the sum as a linked list'],
      narration: ['Lists can differ in length? Output new nodes ok?', 'Walk both with a dummy head and a carry.', 'Digit is total mod 10, carry is total div 10.', 'Loop while either list or carry remains.', 'O(max(m, n)) time, O(1) extra space.'],
      solution: addTwoCode, traceId: 'gaps:list-surgery:trace:add-two',
      pitfalls: ['Forgetting the final carry (999 + 1)', 'Advancing a None list'],
    },
    {
      id: 'gaps:problem:25', lc: 25, title: 'Reverse Nodes in k-Group', difficulty: 'Hard', google: true, skills: ['linked-list'], pattern: 'Group reversal with dummy', ds: ['linked list'],
      constraints: '1 ≤ k ≤ n ≤ 5000', time: 'O(n)', space: 'O(1)',
      insight: 'Find the kth node first, reverse with prev = groupNext, then splice.',
      signals: ['k at a time', 'left-out nodes remain as is', 'only nodes may be changed'],
      narration: ['Leftover fewer than k stays as is?', 'Dummy before head; groupPrev marks the splice point.', 'Find kth; if missing, done.', 'Reverse the group with prev starting at groupNext.', 'Link groupPrev to kth, move groupPrev to old first.', 'O(n) time, O(1) space.'],
      solution: kGroupCode, traceId: 'gaps:list-surgery:trace:k-group',
      pitfalls: ['Reversing a short tail', 'Losing the old first node before relinking', 'k = 1'],
    },
    {
      id: 'gaps:problem:876', lc: 876, title: 'Middle of the Linked List', difficulty: 'Easy', google: true, skills: ['linked-list', 'two-pointers'], pattern: 'Fast / slow pointers', ds: ['linked list'],
      constraints: '1 ≤ n ≤ 100', time: 'O(n)', space: 'O(1)',
      insight: 'Fast moves two for every one of slow.',
      signals: ['middle node', 'two middle nodes return the second'],
      narration: ['Even length returns the second middle?', 'Slow steps one, fast steps two.', 'Fast reaches the end, slow is the middle.', 'O(n) time, O(1) space.'],
      solution: middleCode,
      pitfalls: ['while fast.next alone crashes when fast is None'],
    },
    {
      id: 'gaps:problem:141', lc: 141, title: 'Linked List Cycle', difficulty: 'Easy', google: false, skills: ['linked-list', 'two-pointers'], pattern: 'Floyd fast / slow', ds: ['linked list'],
      constraints: '0 ≤ n ≤ 10^4, -10^5 ≤ val ≤ 10^5', time: 'O(n)', space: 'O(1)',
      insight: 'In a loop, fast gains one step per round and must land on slow.',
      signals: ['cycle', 'O(1) memory follow-up'],
      narration: ['Values can repeat, so compare nodes.', 'Slow one step, fast two.', 'If they ever meet, there is a cycle.', 'If fast hits None, no cycle.', 'O(n) time, O(1) space.'],
      solution: cycleCode,
      pitfalls: ['Storing values instead of nodes', 'Comparing before moving (both start at head)'],
    },
    {
      id: 'gaps:problem:78', lc: 78, title: 'Subsets', difficulty: 'Medium', google: true, skills: ['backtracking'], pattern: 'Backtracking take / skip', ds: ['array'],
      constraints: '1 ≤ n ≤ 10, distinct', time: 'O(n · 2^n)', space: 'O(n) + output',
      insight: 'Each element is a binary decision; leaves are answers.',
      signals: ['all possible subsets', 'power set', 'n ≤ 10'],
      narration: ['Distinct values? Any order ok?', 'Each index: take it or skip it.', 'Append, recurse, pop, then recurse without it.', 'Save a copy at the leaf.', 'O(n·2^n) time, O(n) recursion depth.'],
      solution: subsetsCode, traceId: 'gaps:choose-skip:trace:subsets',
      pitfalls: ['Appending curr without copy', 'Forgetting pop'],
    },
    {
      id: 'gaps:problem:17', lc: 17, title: 'Letter Combinations of a Phone Number', difficulty: 'Medium', google: true, skills: ['backtracking'], pattern: 'Backtracking per position', ds: ['hashmap', 'array'],
      constraints: '0 ≤ digits.length ≤ 4', time: 'O(4^n · n)', space: 'O(n) + output',
      insight: 'One recursion level per digit, one branch per letter.',
      signals: ['all possible letter combinations', 'phone keypad', 'tiny n'],
      narration: ['Empty input returns []?', 'Map digits to letters.', 'dfs(i) tries every letter for digit i.', 'Join at depth n.', 'O(4^n·n) time, O(n) depth.'],
      solution: lettersCode,
      pitfalls: ['Empty string should return [] not [""]'],
    },
    {
      id: 'gaps:problem:22', lc: 22, title: 'Generate Parentheses', difficulty: 'Medium', google: true, skills: ['backtracking'], pattern: 'Backtracking with pruning', ds: ['array'],
      constraints: '1 ≤ n ≤ 8', time: 'O(4^n / √n)', space: 'O(n) + output',
      insight: 'Only build valid prefixes: track opened and closed counts.',
      signals: ['all combinations', 'well-formed parentheses'],
      narration: ['Return all, any order?', 'Add "(" while opened < n.', 'Add ")" while closed < opened.', 'Save when length is 2n.', 'Catalan count, about 4^n/√n results.'],
      solution: parensCode,
      pitfalls: ['Generating all 2^(2n) strings then filtering', 'closed < n instead of closed < opened'],
    },
    {
      id: 'gaps:problem:981', lc: 981, title: 'Time Based Key-Value Store', difficulty: 'Medium', google: true, skills: ['ds-diagnosis', 'binary-search', 'arrays-hashing'], pattern: 'Hashmap + binary search', ds: ['hashmap', 'array'],
      constraints: '≤ 2·10^5 calls, set timestamps strictly increasing', time: 'set O(1), get O(log n)', space: 'O(n)',
      insight: 'Increasing timestamps make append sorted; bisect_right − 1 is the answer.',
      signals: ['timestamp_prev <= timestamp', 'largest timestamp', 'design'],
      narration: ['Are set timestamps increasing? Missing key returns ""?', 'Hashmap key → timestamps and values.', 'set appends, stays sorted.', 'get: bisect_right(times, t) − 1.', 'set O(1), get O(log n), O(n) space.'],
      solution: timeMapCode, traceId: 'gaps:design-bisect:trace:time-map',
      pitfalls: ['bisect_left misses an exact match index', 'Linear scan in get'],
    },
    {
      id: 'gaps:problem:359', lc: 359, title: 'Logger Rate Limiter', difficulty: 'Easy', google: true, skills: ['ds-diagnosis', 'arrays-hashing'], pattern: 'Hashmap of next allowed time', ds: ['hashmap'],
      constraints: '≤ 10^4 calls, timestamps non-decreasing', time: 'O(1)', space: 'O(m) messages',
      insight: 'Store when each message may print next.',
      signals: ['at most every 10 seconds', 'stream', 'design'],
      narration: ['Timestamps non-decreasing? Same second allowed?', 'Map message → next allowed time.', 'Print if t ≥ stored, then store t + 10.', 'O(1) per call; memory grows with unique messages.', 'Follow-up: evict old entries with a queue.'],
      solution: loggerCode,
      pitfalls: ['Updating the time on a rejected message', 'Off by one: < vs ≤'],
    },
    {
      id: 'gaps:problem:300', lc: 300, title: 'Longest Increasing Subsequence', difficulty: 'Medium', google: false, skills: ['dp-1d', 'binary-search'], pattern: 'Patience tails + bisect', ds: ['array'],
      constraints: '1 ≤ n ≤ 2500', time: 'O(n log n)', space: 'O(n)',
      insight: 'Keep the smallest tail per length; binary search where each number goes.',
      signals: ['strictly increasing subsequence', 'follow-up O(n log n)'],
      narration: ['Strictly increasing? Length only?', 'tails[i] = smallest end of length i+1.', 'bisect_left: append or replace.', 'Answer is len(tails).', 'O(n log n) time, O(n) space.'],
      solution: lisCode, traceId: 'gaps:lis-bisect:trace:lis',
      pitfalls: ['bisect_right breaks strictness', 'Returning tails as the subsequence'],
    },
    {
      id: 'gaps:problem:354', lc: 354, title: 'Russian Doll Envelopes', difficulty: 'Hard', google: true, skills: ['dp-1d', 'binary-search', 'constraints'], pattern: 'Sort + LIS', ds: ['array'],
      constraints: '1 ≤ n ≤ 10^5', time: 'O(n log n)', space: 'O(n)',
      insight: 'Sort width asc, height desc; LIS on heights.',
      signals: ['fit inside', 'both width and height strictly greater', 'n ≤ 10^5'],
      narration: ['Rotation allowed? Strictly greater on both?', 'n = 10^5 rules out O(n²).', 'Sort by width asc, height desc on ties.', 'LIS on heights with bisect_left.', 'O(n log n) time, O(n) space.'],
      solution: envelopesCode,
      pitfalls: ['Height asc on ties lets equal widths nest', 'O(n²) DP times out'],
    },
  ]

  return { lessons, traces, flashcards, mcqs, clozes, parsons, problems }
})()
const priority = [
  { rank: 1, tier: 'P0', slug: 'prefix-hash', title: 'Prefix sum + hashmap', why: 'Counting subarrays with a target sum is a Google staple. Sliding window fails with negatives.', minutes: 45, skills: ['prefix-sum', 'arrays-hashing'], anchorLc: [560, 525], covered: false, evidence: 'Only prefix products in 238. No 560/525/930/437.' },
  { rank: 2, tier: 'P0', slug: 'bs-answer', title: 'Binary search template + search on the answer', why: 'Values up to 10^9 with a yes/no check means binary search the answer. Many Google mediums.', minutes: 50, skills: ['binary-search', 'constraints'], anchorLc: [875, 410], covered: 'partial', evidence: '704 took 18 submissions with ad-hoc end checks. 33/153 fine. No 875/410.' },
  { rank: 3, tier: 'P0', slug: 'bfs-levels', title: 'BFS by levels / shortest path', why: 'Unweighted shortest path, minutes-to-spread, level order. Must explain the queue out loud.', minutes: 45, skills: ['graph-bfs', 'tree-bfs', 'grid', 'queue-deque'], anchorLc: [994, 102], covered: 'partial', evidence: '286 multi-source BFS is good, but 102 was solved with DFS. No other BFS.' },
  { rank: 4, tier: 'P0', slug: 'kahn', title: 'Topological sort (Kahn)', why: 'Dependencies and build order show up constantly. Kahn gives the order and the cycle check together.', minutes: 35, skills: ['topo-sort', 'graph-modeling'], anchorLc: [210, 207], covered: 'partial', evidence: '207 and 269 via DFS coloring only. No indegree queue, no 210.' },
  { rank: 5, tier: 'P0', slug: 'mono-stack', title: 'Monotonic stack: next greater + histogram', why: 'Next-greater and span problems are Google favorites. 84 is a classic follow-up.', minutes: 45, skills: ['monotonic-stack', 'stack'], anchorLc: [84, 496, 1944], covered: 'partial', evidence: '739 only. 42 solved with prefix-max arrays, not a stack.' },
  { rank: 6, tier: 'P0', slug: 'list-surgery', title: 'Linked list surgery: dummy, carry, k-group, Floyd', why: 'Pointer bugs are easy to make live. 2, 25, 143, 19 are all on the Google list.', minutes: 45, skills: ['linked-list', 'two-pointers'], anchorLc: [2, 25, 876], covered: 'partial', evidence: '206/21/143/19 clean. 141 stores node VALUES in a set, which breaks on duplicates.' },
  { rank: 7, tier: 'P1', slug: 'choose-skip', title: 'Backtracking: choose / explore / unchoose', why: 'Subsets, combos, parentheses. Interviewers want the decision tree and its 2^n cost.', minutes: 35, skills: ['backtracking'], anchorLc: [78, 22, 17], covered: 'partial', evidence: '39 is clean. 46 built by insertion, not backtracking. No 78/17/22/131.' },
  { rank: 8, tier: 'P1', slug: 'window-count', title: 'Sliding window counting', why: 'Count subarrays, not just longest. right - left + 1 and atMost(k) - atMost(k-1).', minutes: 30, skills: ['sliding-window', 'two-pointers'], anchorLc: [713, 209, 930], covered: 'partial', evidence: '3/424/76/567 all max/min length windows. No counting windows.' },
  { rank: 9, tier: 'P1', slug: 'design-bisect', title: 'Design: hashmap + sorted list + bisect', why: 'Google likes small API design rounds. Pick the structure per operation.', minutes: 30, skills: ['ds-diagnosis', 'binary-search', 'arrays-hashing'], anchorLc: [981, 359], covered: false, evidence: 'Only 155 and 211/208 designs. Never used bisect.' },
  { rank: 10, tier: 'P1', slug: 'minimax-grid', title: 'Minimax path: Dijkstra-max or binary search + BFS', why: 'Three Google-list grid problems (778, 1970, 2812) share this shape.', minutes: 40, skills: ['dijkstra', 'graph-bfs', 'binary-search', 'grid'], anchorLc: [778, 1970], covered: 'partial', evidence: '743 Dijkstra and 1584 Prim are solid. No minimax variant.' },
  { rank: 11, tier: 'P1', slug: 'lis-bisect', title: 'LIS in O(n log n) with tails + bisect', why: '354 Russian Doll is on the list and needs n log n. Common follow-up to 300.', minutes: 25, skills: ['dp-1d', 'binary-search', 'constraints'], anchorLc: [354, 300], covered: 'partial', evidence: '300 is O(n^2) only.' },
  { rank: 12, tier: 'P1', slug: 'next-perm', title: 'Next permutation', why: 'Short, tricky, Google-tagged. Pure reasoning about suffixes.', minutes: 20, skills: ['two-pointers', 'math'], anchorLc: [31], covered: false, evidence: 'Not attempted.' },
  { rank: 13, tier: 'P2', slug: 'quickselect', title: 'Kth largest: heap vs quickselect', why: 'A heap of size k is enough. Quickselect is the O(n) average follow-up.', minutes: 20, skills: ['heap'], anchorLc: [215], covered: 'partial', evidence: '703 and 1046 use heaps well.' },
  { rank: 14, tier: 'P2', slug: 'distinct-subseq', title: 'Counting DP on two strings', why: '115 and 940 count ways, not lengths. Same table shape as LCS.', minutes: 30, skills: ['dp-2d'], anchorLc: [115, 940], covered: 'partial', evidence: '1143 LCS and 10 regex DP are solid.' },
  { rank: 15, tier: 'P2', slug: 'interval-dp', title: 'Interval DP (burst balloons)', why: 'Hard tier. Pick the LAST balloon in a range so subproblems split cleanly.', minutes: 30, skills: ['dp-2d'], anchorLc: [312], covered: false, evidence: 'Only palindrome-range DP (5, 647).' },
  { rank: 16, tier: 'P2', slug: 'union-find-plus', title: 'Union-Find beyond counting', why: 'Online connectivity: add cells or edges over time and ask "connected yet?".', minutes: 20, skills: ['union-find'], anchorLc: [1970, 684], covered: 'partial', evidence: '323 uses path compression and rank. Good base.' },
  { rank: 17, tier: 'P2', slug: 'parsing', title: 'String parsing and simulation', why: 'Easy to fumble edge cases under pressure: signs, overflow, whitespace.', minutes: 20, skills: ['math'], anchorLc: [8, 6], covered: false, evidence: '7 and 43 done. No 8/6.' },
  { rank: 18, tier: 'P2', slug: 'bipartite', title: 'Bipartite check and undirected cycles', why: 'Two-coloring via BFS. Quick win once BFS is solid.', minutes: 15, skills: ['graph-bfs', 'graph-dfs'], anchorLc: [785, 261], covered: 'partial', evidence: '261 Valid Tree uses parent-skip DFS correctly.' },
  { rank: 19, tier: 'P2', slug: 'multi-bfs-bs', title: 'Multi-source BFS + binary search', why: '2812 Safest Path: BFS distances to thieves, then minimax path.', minutes: 25, skills: ['graph-bfs', 'binary-search', 'grid'], anchorLc: [2812], covered: 'partial', evidence: '286 multi-source BFS done.' },
  { rank: 20, tier: 'P2', slug: 'meet-middle', title: 'Meet in the middle', why: 'n ≈ 30 means 2^n is too big but 2^(n/2) fits. Rare, skip unless ahead.', minutes: 30, skills: ['bit', 'constraints'], anchorLc: [2035], covered: false, evidence: 'Not attempted.' },
]

const partP = (() => {
  const flashcards = [
    { id: 'gaps:p2:card:1', skills: ['heap'], front: 'Kth largest: which heap and what size?', back: '==Min-heap== of size k. Push each num, pop when size > k. Top is the answer. O(n log k).' },
    { id: 'gaps:p2:card:2', skills: ['heap'], front: 'Quickselect average and worst time?', back: 'Average ==O(n)==: each partition keeps one side. Worst O(n^2) on bad pivots, so pick a random pivot.' },
    { id: 'gaps:p2:card:3', skills: ['dp-2d'], front: '115 Distinct Subsequences: recurrence?', back: 'dp[i][j] = dp[i+1][j] + (dp[i+1][j+1] if s[i] == t[j]). Skip s[i], or ==use it== to match t[j].' },
    { id: 'gaps:p2:card:4', skills: ['dp-2d'], front: 'Base cases for counting subsequences of t in s?', back: 'Empty t matches ==once== in anything: dp[i][len(t)] = 1. Empty s with non-empty t: 0.' },
    { id: 'gaps:p2:card:5', skills: ['dp-2d'], front: 'Burst Balloons: why pick the LAST balloon in a range?', back: 'If k bursts last in (l, r), its neighbors are ==l and r==, fixed. Left and right ranges become independent.' },
    { id: 'gaps:p2:card:6', skills: ['dp-2d'], front: 'Interval DP loop order?', back: 'Iterate by ==range length== from short to long, so smaller ranges are ready. O(n^3) time, O(n^2) space.' },
    { id: 'gaps:p2:card:7', skills: ['union-find'], front: 'When is Union-Find better than BFS?', back: 'When edges ==arrive over time== and you ask connectivity repeatedly. Near O(1) per union with path compression + rank.' },
    { id: 'gaps:p2:card:8', skills: ['union-find'], front: '684 Redundant Connection in one line?', back: 'Union each edge. The first edge whose ends already share a ==root== closes a cycle. Return it.' },
    { id: 'gaps:p2:card:9', skills: ['math'], front: 'atoi order of steps?', back: 'Skip spaces, read ==one sign==, read digits until non-digit, clamp to [-2^31, 2^31 - 1].' },
    { id: 'gaps:p2:card:10', skills: ['math'], front: 'Zigzag conversion trick?', back: 'Keep one string per row and a ==direction== that flips at row 0 and row numRows-1. Join rows.' },
    { id: 'gaps:p2:card:11', skills: ['graph-bfs'], front: 'How to test if a graph is bipartite?', back: 'BFS from every uncolored node, color neighbors the ==opposite color==. Same color on an edge means not bipartite.' },
    { id: 'gaps:p2:card:12', skills: ['graph-dfs'], front: 'Cycle in an UNDIRECTED graph with DFS?', back: 'Pass the ==parent==. Seeing a visited neighbor that is not the parent means a cycle.' },
    { id: 'gaps:p2:card:13', skills: ['graph-bfs', 'grid'], front: '2812 Safest Path: two phases?', back: '==Multi-source BFS== from all thieves gives safeness per cell. Then maximize the minimum along a path: max-heap Dijkstra or binary search + BFS.' },
    { id: 'gaps:p2:card:14', skills: ['constraints', 'bit'], front: 'n ≤ 30 subset problem. 2^30 too slow?', back: '2^30 ≈ 10^9: too slow. Split in halves: ==2 × 2^15== subsets each, then sort + binary search to combine.' },
  ]
  const mcqs = [
    { id: 'gaps:p2:mcq:1', skills: ['heap'], difficulty: 1, q: 'n = 10^5, k = 10. Best way to get the kth largest?', choices: ['Sort: O(n log n)', 'Min-heap of size k: O(n log k)', 'Max-heap of all n then pop k', 'Nested loops'], answer: 1, why: 'Size-k min-heap keeps only the k largest. log k is tiny, so it beats sorting.' },
    { id: 'gaps:p2:mcq:2', skills: ['dp-2d'], difficulty: 2, q: 'Burst Balloons, n ≤ 300. Which complexity fits?', choices: ['O(2^n)', 'O(n^3) interval DP', 'O(n log n) greedy', 'O(n) stack'], answer: 1, why: '300^3 = 2.7·10^7, fine. Greedy fails; brute force is exponential.' },
    { id: 'gaps:p2:mcq:3', skills: ['union-find'], difficulty: 2, q: 'Cells turn to land one at a time; after each, ask "is top connected to bottom?". Best fit?', choices: ['BFS after each addition', 'Union-Find with virtual top/bottom nodes', 'Dijkstra', 'Topological sort'], answer: 1, why: 'Union new cell with land neighbors. Check find(top) == find(bottom). Near O(1) each.' },
    { id: 'gaps:p2:mcq:4', skills: ['constraints', 'bit'], difficulty: 3, q: 'Split 2n numbers into two halves, n ≤ 15 (30 numbers). Approach?', choices: ['Try all 2^30 splits', 'Meet in the middle: 2^15 per half + sort + bisect', 'Greedy by sorting', 'O(n^2) DP on sums'], answer: 1, why: '2^30 is ~10^9. Halves give ~3·10^4 subsets each, combined with binary search.' },
  ]
  return { lessons: [], traces: [], flashcards, mcqs, clozes: [], parsons: [], problems: [] }
})()

const parts = [partA, partB, partC, partP]
const collect = key => parts.flatMap(part => part[key] || [])
const gapSkills = [...new Set(priority.flatMap(item => item.skills))].filter(skill => skillIds.includes(skill))

export default {
  id: topicId,
  title: 'Must-Learn Gaps',
  icon: '🎯',
  skills: gapSkills,
  priority,
  lessons: collect('lessons'),
  traces: collect('traces'),
  flashcards: collect('flashcards'),
  mcqs: collect('mcqs'),
  clozes: collect('clozes'),
  parsons: collect('parsons'),
  problems: collect('problems'),
}
