const lineFinder = code => {
  const lines = code.split('\n')
  return (text, nth = 1) => {
    let count = 0
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith(text)) {
        count++
        if (count === nth) return i + 1
      }
    }
    throw new Error(`line not found: ${text}`)
  }
}

const arrayPanel = (label, values, extra = {}) => ({ kind: 'array', label, values: [...values], pointers: {}, highlight: [], ...extra })
const mapPanel = (label, entries, highlight = []) => ({ kind: 'hashmap', label, entries: entries.map(([k, v]) => [k, Array.isArray(v) ? [...v] : v]), highlight })
const setPanel = (label, items, highlight = []) => ({ kind: 'set', label, items: [...items], highlight })
const textPanel = text => ({ kind: 'text', text })

const sayOnce = t => {
  const said = new Set()
  return {
    step(line, state) {
      if (state.say && said.has(state.say)) state = { ...state, say: undefined }
      else if (state.say) said.add(state.say)
      t.step(line, state)
    },
  }
}

const twoSumCode = `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}

        for i in range(len(nums)):
            need = target - nums[i]

            if need in seen:
                return [seen[need], i]

            seen[nums[i]] = i

        return []`

const twoSumLine = lineFinder(twoSumCode)

const twoSumTrace = {
  id: 'linear:trace:two-sum',
  title: 'Two Sum — one-pass hashmap',
  skills: ['arrays-hashing', 'ds-diagnosis'],
  problem: 'Return indices of the two numbers that add up to target.',
  code: twoSumCode,
  complexity: { time: 'O(n)', space: 'O(n)', why: 'Each number checked once with O(1) dict lookup.' },
  inputs: [
    { label: 'classic', value: { nums: [2, 7, 11, 15], target: 9 } },
    { label: 'late hit', value: { nums: [3, 1, 4, 6, 5, 8], target: 9 } },
    { label: 'duplicates', value: { nums: [3, 3], target: 6 } },
  ],
  run(input, tracer) {
    const t = sayOnce(tracer)
    const { nums, target } = input
    const seen = new Map()
    const panels = (i, keyHighlight = [], extra = {}) => [
      arrayPanel('nums', nums, { pointers: i == null ? {} : { i }, highlight: i == null ? [] : [i], ...extra }),
      mapPanel('seen  value → index', [...seen], keyHighlight),
    ]
    t.step(twoSumLine('seen = {}'), { vars: { target }, panels: panels(null), note: 'Map every passed value to its index.', say: 'Brute force is O(n²). A hashmap of seen values makes the complement lookup O(1).' })
    for (let i = 0; i < nums.length; i++) {
      t.step(twoSumLine('for i in'), { vars: { i, 'nums[i]': nums[i] }, panels: panels(i), note: `Visit index ${i}.` })
      const need = target - nums[i]
      t.step(twoSumLine('need ='), { vars: { i, need }, panels: panels(i), note: `${nums[i]} needs a partner of ${need}.`, say: i === 0 ? 'For each number I compute the complement it needs.' : undefined })
      if (seen.has(need)) {
        t.step(twoSumLine('if need in seen'), { vars: { i, need }, panels: panels(i, [need], { highlight: [seen.get(need), i] }), note: `${need} was seen at index ${seen.get(need)}.` })
        t.step(twoSumLine('return [seen'), { vars: { result: [seen.get(need), i] }, panels: panels(i, [need], { highlight: [seen.get(need), i] }), note: 'Pair found in one pass.', say: 'Found it. One pass, O(n) time, O(n) space for the map.' })
        return
      }
      t.step(twoSumLine('if need in seen'), { vars: { i, need }, panels: panels(i), note: `${need} not seen yet.` })
      seen.set(nums[i], i)
      t.step(twoSumLine('seen[nums[i]]'), { vars: { i }, panels: panels(i, [nums[i]]), note: 'Store after checking, so a number never pairs with itself.', say: i === 0 ? 'I insert after the check so an element cannot match itself.' : undefined })
    }
    t.step(twoSumLine('return []'), { vars: {}, panels: panels(null), note: 'No pair exists.' })
  },
}

const threeSumCode = `class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        nums.sort()
        result = []

        for i in range(len(nums) - 2):
            if i > 0 and nums[i] == nums[i - 1]:
                continue

            left, right = i + 1, len(nums) - 1

            while left < right:
                total = nums[i] + nums[left] + nums[right]

                if total == 0:
                    result.append([nums[i], nums[left], nums[right]])
                    left += 1
                    right -= 1
                    while left < right and nums[left] == nums[left - 1]:
                        left += 1
                elif total > 0:
                    right -= 1
                else:
                    left += 1

        return result`

const threeSumLine = lineFinder(threeSumCode)

const threeSumTrace = {
  id: 'linear:trace:three-sum',
  title: '3Sum — sort + two pointers',
  skills: ['two-pointers', 'arrays-hashing'],
  problem: 'Find all unique triplets that sum to zero.',
  code: threeSumCode,
  complexity: { time: 'O(n²)', space: 'O(1) extra', why: 'Sort n log n, then a linear two-pointer scan per i.' },
  inputs: [
    { label: 'classic', value: [-1, 0, 1, 2, -1, -4] },
    { label: 'dupes', value: [-2, 0, 0, 2, 2] },
    { label: 'none', value: [1, 2, -2, -1] },
  ],
  run(input, tracer) {
    const t = sayOnce(tracer)
    const nums = [...input]
    const result = []
    const panels = (ptrs = {}, extra = {}) => [
      arrayPanel('nums (sorted)', nums, { pointers: ptrs, sorted: true, ...extra }),
      { kind: 'table', label: 'result', rows: result.map(r => [...r]), highlight: [], deps: [] },
    ]
    t.step(threeSumLine('nums.sort()'), { vars: {}, panels: [arrayPanel('nums', nums)], note: 'Unsorted input.', say: 'Sorting lets me move pointers by comparing the sum to zero, and makes duplicates adjacent.' })
    nums.sort((a, b) => a - b)
    t.step(threeSumLine('result = []'), { vars: {}, panels: panels(), note: 'Sorted. Duplicates now sit next to each other.' })
    for (let i = 0; i < nums.length - 2; i++) {
      t.step(threeSumLine('for i in'), { vars: { i, 'nums[i]': nums[i] }, panels: panels({ i }, { highlight: [i] }), note: `Fix nums[${i}] = ${nums[i]} as first element.` })
      if (i > 0 && nums[i] === nums[i - 1]) {
        t.step(threeSumLine('continue'), { vars: { i }, panels: panels({ i }, { dim: [i - 1], highlight: [i] }), note: 'Same as previous anchor: skip duplicate triplets.' })
        continue
      }
      let left = i + 1
      let right = nums.length - 1
      t.step(threeSumLine('left, right ='), { vars: { i, left, right }, panels: panels({ i, left, right }, { window: [left, right] }), note: 'Two pointers squeeze the rest.', say: i === 0 ? 'Now it reduces to two-sum on a sorted array: two pointers from both ends.' : undefined })
      while (left < right) {
        const total = nums[i] + nums[left] + nums[right]
        t.step(threeSumLine('total ='), { vars: { i, left, right, total }, panels: panels({ i, left, right }, { window: [left, right], highlight: [i, left, right] }), note: `${nums[i]} + ${nums[left]} + ${nums[right]} = ${total}` })
        if (total === 0) {
          result.push([nums[i], nums[left], nums[right]])
          t.step(threeSumLine('result.append'), { vars: { i, left, right, total }, panels: panels({ i, left, right }, { highlight: [i, left, right] }), note: 'Zero! Record triplet.', say: 'Hit zero. I move both pointers and skip duplicate lefts.' })
          left += 1
          right -= 1
          t.step(threeSumLine('right -= 1'), { vars: { i, left, right }, panels: panels({ i, left, right }, { window: [left, right] }), note: 'Move both pointers inward.' })
          while (left < right && nums[left] === nums[left - 1]) {
            left += 1
            t.step(threeSumLine('left += 1', 2), { vars: { i, left, right }, panels: panels({ i, left, right }, { window: [left, right], dim: [left - 1] }), note: 'Skip duplicate left value.' })
          }
        } else if (total > 0) {
          right -= 1
          t.step(threeSumLine('right -= 1', 2), { vars: { i, left, right, total }, panels: panels({ i, left, right }, { window: [left, right] }), note: 'Too big: shrink from the right.', say: 'Sum too big, and the array is sorted, so only moving right down can lower it.' })
        } else {
          left += 1
          t.step(threeSumLine('left += 1', 3), { vars: { i, left, right, total }, panels: panels({ i, left, right }, { window: [left, right] }), note: 'Too small: grow from the left.' })
        }
      }
    }
    t.step(threeSumLine('return result'), { vars: { count: result.length }, panels: panels(), note: `${result.length} unique triplet(s).`, say: 'O(n²) time: n anchors times a linear scan. Sorting is dominated.' })
  },
}

const longestSubstringCode = `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        window = set()
        left = 0
        longest = 0

        for right in range(len(s)):
            while s[right] in window:
                window.remove(s[left])
                left += 1

            window.add(s[right])
            longest = max(longest, right - left + 1)

        return longest`

const longestSubstringLine = lineFinder(longestSubstringCode)

const longestSubstringTrace = {
  id: 'linear:trace:longest-substring',
  title: 'Longest Substring Without Repeats — variable window',
  skills: ['sliding-window', 'arrays-hashing'],
  problem: 'Length of the longest substring with all distinct characters.',
  code: longestSubstringCode,
  complexity: { time: 'O(n)', space: 'O(min(n, alphabet))', why: 'Each char enters and leaves the window at most once.' },
  inputs: [
    { label: 'abcabcbb', value: 'abcabcbb' },
    { label: 'pwwkew', value: 'pwwkew' },
    { label: 'dvdf', value: 'dvdf' },
  ],
  run(input, tracer) {
    const t = sayOnce(tracer)
    const s = input.split('')
    const window = new Set()
    let left = 0
    let longest = 0
    const panels = (right, highlightChar = [], extra = {}) => [
      arrayPanel('s', s, { pointers: right == null ? { left } : { left, right }, window: right != null && left <= right ? [left, right] : undefined, ...extra }),
      setPanel('window chars', [...window], highlightChar),
    ]
    t.step(longestSubstringLine('window = set()'), { vars: {}, panels: panels(null), note: 'Set holds chars currently inside the window.', say: 'Substring plus "longest" plus a validity rule: variable sliding window.' })
    t.step(longestSubstringLine('longest = 0'), { vars: { left, longest }, panels: panels(null), note: 'Window starts empty.' })
    for (let right = 0; right < s.length; right++) {
      t.step(longestSubstringLine('for right in'), { vars: { right, 's[right]': s[right], left, longest }, panels: panels(right, [], { highlight: [right] }), note: `Expand: try adding '${s[right]}'.` })
      let shrank = false
      while (window.has(s[right])) {
        if (!shrank) t.step(longestSubstringLine('while s[right] in window'), { vars: { right, left }, panels: panels(right, [s[right]], { highlight: [right] }), note: `'${s[right]}' already inside: window invalid.`, say: 'Duplicate. I shrink from the left until the window is valid again.' })
        shrank = true
        window.delete(s[left])
        const removed = left
        left += 1
        t.step(longestSubstringLine('left += 1'), { vars: { right, left, removed: s[removed] }, panels: panels(right, [], { dim: [removed] }), note: `Drop '${s[removed]}', move left.` })
      }
      window.add(s[right])
      t.step(longestSubstringLine('window.add'), { vars: { right, left }, panels: panels(right, [s[right]]), note: 'Window valid again: all unique.' })
      const before = longest
      longest = Math.max(longest, right - left + 1)
      t.step(longestSubstringLine('longest = max'), { vars: { right, left, size: right - left + 1, longest }, panels: panels(right), note: longest > before ? `New best: ${longest}.` : `Size ${right - left + 1}, best stays ${longest}.` })
    }
    t.step(longestSubstringLine('return longest'), { vars: { longest }, panels: panels(null), note: `Answer ${longest}.`, say: 'O(n): left and right each move at most n times. Space is the alphabet size.' })
  },
}

const minWindowCode = `import math
from collections import Counter

class Solution:
    def minWindow(self, s: str, t: str) -> str:
        countT, window = Counter(t), {}
        have, need = 0, len(countT)
        answer, answerLen = [-1, -1], math.inf
        left = 0

        for right in range(len(s)):
            c = s[right]
            window[c] = window.get(c, 0) + 1

            if c in countT and window[c] == countT[c]:
                have += 1

            while have == need:
                if right - left + 1 < answerLen:
                    answer = [left, right]
                    answerLen = right - left + 1

                window[s[left]] -= 1
                if s[left] in countT and window[s[left]] < countT[s[left]]:
                    have -= 1
                left += 1

        l, r = answer
        return s[l:r + 1] if answerLen != math.inf else ""`

const minWindowLine = lineFinder(minWindowCode)

const minWindowTrace = {
  id: 'linear:trace:min-window',
  title: 'Minimum Window Substring — have/need window',
  skills: ['sliding-window', 'arrays-hashing'],
  problem: 'Smallest substring of s containing every char of t (with counts).',
  code: minWindowCode,
  complexity: { time: 'O(|s| + |t|)', space: 'O(alphabet)', why: 'Each index enters and leaves once; have/need avoids rescanning maps.' },
  inputs: [
    { label: 'classic', value: { s: 'ADOBECODEBANC', t: 'ABC' } },
    { label: 'small', value: { s: 'aaflslflsldkalskaaa', t: 'aaa' } },
    { label: 'tiny', value: { s: 'cabwefgewcwaefgcf', t: 'cae' } },
  ],
  run(input, tracer) {
    const t = sayOnce(tracer)
    const s = input.s.split('')
    const countT = new Map()
    for (const ch of input.t) countT.set(ch, (countT.get(ch) || 0) + 1)
    const window = new Map()
    let have = 0
    const need = countT.size
    let answer = [-1, -1]
    let answerLen = Infinity
    let left = 0
    const vars = extra => ({ left, have, need, best: answerLen === Infinity ? '∞' : answerLen, ...extra })
    const panels = (right, hlKeys = [], extra = {}) => [
      arrayPanel('s', s, { pointers: right == null ? { left } : { left, right }, window: right != null && left <= right ? [left, right] : undefined, ...extra }),
      mapPanel('countT (need)', [...countT], hlKeys),
      mapPanel('window counts', [...window].filter(([k]) => countT.has(k)), hlKeys),
      textPanel(`have ${have} / need ${need}   best: ${answerLen === Infinity ? 'none' : `"${s.slice(answer[0], answer[1] + 1).join('')}"`}`),
    ]
    t.step(minWindowLine('countT, window'), { vars: vars({}), panels: panels(null), note: 'Count what t requires.', say: 'Smallest window containing all of t: variable window that expands until valid, then shrinks.' })
    t.step(minWindowLine('have, need'), { vars: vars({}), panels: panels(null), note: 'need = distinct chars; have = chars fully satisfied.', say: 'Instead of comparing two maps each step, I track how many distinct chars are satisfied.' })
    for (let right = 0; right < s.length; right++) {
      const c = s[right]
      window.set(c, (window.get(c) || 0) + 1)
      t.step(minWindowLine('window[c] = window.get'), { vars: vars({ right, c }), panels: panels(right, countT.has(c) ? [c] : [], { highlight: [right] }), note: `Expand with '${c}'.` })
      if (countT.has(c) && window.get(c) === countT.get(c)) {
        have += 1
        t.step(minWindowLine('have += 1'), { vars: vars({ right, c }), panels: panels(right, [c], { highlight: [right] }), note: `'${c}' now fully satisfied.` })
      }
      while (have === need) {
        if (right - left + 1 < answerLen) {
          answer = [left, right]
          answerLen = right - left + 1
          t.step(minWindowLine('answerLen = right'), { vars: vars({ right }), panels: panels(right), note: `Valid window, new best length ${answerLen}.`, say: 'Window is valid. Record it, then shrink from the left to try for smaller.' })
        }
        const out = s[left]
        window.set(out, window.get(out) - 1)
        let lost = false
        if (countT.has(out) && window.get(out) < countT.get(out)) {
          have -= 1
          lost = true
        }
        t.step(lost ? minWindowLine('have -= 1') : minWindowLine('window[s[left]] -= 1'), { vars: vars({ right, removed: out }), panels: panels(right, lost ? [out] : [], { dim: [left] }), note: lost ? `Lost a needed '${out}': window breaks.` : `Drop '${out}', still valid.` })
        left += 1
        t.step(minWindowLine('left += 1'), { vars: vars({ right }), panels: panels(right), note: have === need ? 'Still valid, keep shrinking.' : 'Invalid: resume expanding.' })
      }
    }
    const result = answerLen === Infinity ? '' : s.slice(answer[0], answer[1] + 1).join('')
    t.step(minWindowLine('return s[l:r + 1]'), { vars: { result }, panels: panels(null, [], { highlight: answerLen === Infinity ? [] : Array.from({ length: answerLen }, (_, k) => answer[0] + k) }), note: `Answer "${result}".`, say: 'Linear time: each pointer moves at most |s| times.' })
  },
}

const subarraySumCode = `class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        prefixCount = {0: 1}
        prefix = 0
        result = 0

        for num in nums:
            prefix += num
            result += prefixCount.get(prefix - k, 0)
            prefixCount[prefix] = prefixCount.get(prefix, 0) + 1

        return result`

const subarraySumLine = lineFinder(subarraySumCode)

const subarraySumTrace = {
  id: 'linear:trace:subarray-sum-k',
  title: 'Subarray Sum Equals K — prefix + hashmap',
  skills: ['prefix-sum', 'arrays-hashing'],
  problem: 'Count contiguous subarrays whose sum equals k (negatives allowed).',
  code: subarraySumCode,
  complexity: { time: 'O(n)', space: 'O(n)', why: 'One pass; map stores counts of prefix sums seen.' },
  inputs: [
    { label: 'classic', value: { nums: [1, 2, 3], k: 3 } },
    { label: 'negatives', value: { nums: [3, 4, 7, 2, -3, 1, 4, 2], k: 7 } },
    { label: 'zeros', value: { nums: [1, -1, 0], k: 0 } },
  ],
  run(input, tracer) {
    const t = sayOnce(tracer)
    const { nums, k } = input
    const prefixCount = new Map([[0, 1]])
    let prefix = 0
    let result = 0
    const prefixes = []
    const panels = (i, hlKeys = []) => [
      arrayPanel('nums', nums, { pointers: i == null ? {} : { i }, highlight: i == null ? [] : [i], window: i == null ? undefined : [0, i] }),
      arrayPanel('prefix sums so far', prefixes),
      mapPanel('prefixCount  sum → times seen', [...prefixCount], hlKeys),
    ]
    t.step(subarraySumLine('prefixCount = {0: 1}'), { vars: { k }, panels: panels(null, [0]), note: 'Empty prefix has sum 0, seen once.', say: 'sum(i..j) = prefix[j] − prefix[i−1]. So I need how many earlier prefixes equal prefix − k.' })
    t.step(subarraySumLine('result = 0'), { vars: { prefix, result }, panels: panels(null), note: 'Negatives allowed, so a sliding window fails.', say: 'Negatives break the sliding window, since growing the window can shrink the sum.' })
    for (let i = 0; i < nums.length; i++) {
      prefix += nums[i]
      prefixes.push(prefix)
      t.step(subarraySumLine('prefix += num'), { vars: { num: nums[i], prefix, k, result }, panels: panels(i), note: `Running sum is ${prefix}.` })
      const found = prefixCount.get(prefix - k) || 0
      result += found
      t.step(subarraySumLine('result += prefixCount'), { vars: { prefix, 'prefix - k': prefix - k, found, result }, panels: panels(i, [prefix - k]), note: found ? `${found} earlier prefix(es) = ${prefix - k}: subarrays end here.` : `No earlier prefix equals ${prefix - k}.`, say: found && i === nums.length - 1 ? 'Each earlier prefix equal to prefix − k marks a start of a valid subarray.' : undefined })
      prefixCount.set(prefix, (prefixCount.get(prefix) || 0) + 1)
      t.step(subarraySumLine('prefixCount[prefix] ='), { vars: { prefix, result }, panels: panels(i, [prefix]), note: 'Record this prefix after counting.' })
    }
    t.step(subarraySumLine('return result'), { vars: { result }, panels: panels(null), note: `${result} subarray(s) sum to ${k}.`, say: 'O(n) time and space, versus O(n²) checking every pair.' })
  },
}

const maxAreaCode = `class Solution:
    def maxArea(self, heights: List[int]) -> int:
        left, right = 0, len(heights) - 1
        best = 0

        while left < right:
            area = min(heights[left], heights[right]) * (right - left)
            best = max(best, area)

            if heights[left] < heights[right]:
                left += 1
            else:
                right -= 1

        return best`

const maxAreaLine = lineFinder(maxAreaCode)

const maxAreaTrace = {
  id: 'linear:trace:container-water',
  title: 'Container With Most Water — greedy two pointers',
  skills: ['two-pointers', 'greedy'],
  problem: 'Pick two lines that hold the most water.',
  code: maxAreaCode,
  complexity: { time: 'O(n)', space: 'O(1)', why: 'Pointers only move inward; each step discards one line.' },
  inputs: [
    { label: 'classic', value: [1, 8, 6, 2, 5, 4, 8, 3, 7] },
    { label: 'small', value: [1, 7, 2, 5, 4, 7, 3, 6] },
    { label: 'equal', value: [2, 2, 2] },
  ],
  run(input, tracer) {
    const t = sayOnce(tracer)
    const heights = input
    let left = 0
    let right = heights.length - 1
    let best = 0
    const panels = (extra = {}) => [arrayPanel('heights', heights, { pointers: { left, right }, window: left <= right ? [left, right] : undefined, ...extra })]
    t.step(maxAreaLine('left, right ='), { vars: { left, right }, panels: panels(), note: 'Start widest: both ends.', say: 'Start with the widest container, then greedily give up width only to chase taller lines.' })
    t.step(maxAreaLine('best = 0'), { vars: { left, right, best }, panels: panels(), note: 'Track best area.' })
    while (left < right) {
      const area = Math.min(heights[left], heights[right]) * (right - left)
      t.step(maxAreaLine('area = min'), { vars: { left, right, width: right - left, area, best }, panels: panels({ highlight: [left, right] }), note: `min(${heights[left]}, ${heights[right]}) × ${right - left} = ${area}` })
      const before = best
      best = Math.max(best, area)
      t.step(maxAreaLine('best = max'), { vars: { area, best }, panels: panels(), note: best > before ? `New best ${best}.` : `Best stays ${best}.` })
      if (heights[left] < heights[right]) {
        const dropped = left
        left += 1
        t.step(maxAreaLine('left += 1'), { vars: { left, right, best }, panels: panels({ dim: [dropped] }), note: 'Left is shorter: it can never do better. Drop it.', say: dropped === 0 ? 'The shorter line limits the area; any narrower container with it is worse, so I move it.' : undefined })
      } else {
        const dropped = right
        right -= 1
        t.step(maxAreaLine('right -= 1'), { vars: { left, right, best }, panels: panels({ dim: [dropped] }), note: 'Right is shorter or equal: drop it.' })
      }
    }
    t.step(maxAreaLine('return best'), { vars: { best }, panels: panels(), note: `Max area ${best}.`, say: 'One pass, O(n) time, O(1) space.' })
  },
}

const trapCode = `class Solution:
    def trap(self, height: List[int]) -> int:
        left, right = 0, len(height) - 1
        leftMax, rightMax = height[left], height[right]
        total = 0

        while left < right:
            if leftMax < rightMax:
                left += 1
                leftMax = max(leftMax, height[left])
                total += leftMax - height[left]
            else:
                right -= 1
                rightMax = max(rightMax, height[right])
                total += rightMax - height[right]

        return total`

const trapLine = lineFinder(trapCode)

const trapTrace = {
  id: 'linear:trace:trapping-rain',
  title: 'Trapping Rain Water — two pointers',
  skills: ['two-pointers', 'prefix-sum'],
  problem: 'Total water trapped between bars after rain.',
  code: trapCode,
  complexity: { time: 'O(n)', space: 'O(1)', why: 'Replaces preMax/postMax arrays with two running maxes.' },
  inputs: [
    { label: 'classic', value: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] },
    { label: 'bowl', value: [4, 2, 0, 3, 2, 5] },
    { label: 'small', value: [3, 0, 2, 0, 4] },
  ],
  run(input, tracer) {
    const t = sayOnce(tracer)
    const height = input
    const water = height.map(() => 0)
    let left = 0
    let right = height.length - 1
    let leftMax = height[left]
    let rightMax = height[right]
    let total = 0
    const panels = (extra = {}) => [
      arrayPanel('height', height, { pointers: { left, right }, window: [left, right], ...extra }),
      arrayPanel('water above each bar', water, { highlight: extra.highlight || [] }),
    ]
    t.step(trapLine('left, right ='), { vars: { left, right }, panels: panels(), note: 'Pointers at both ends.', say: 'Water at i is min(maxLeft, maxRight) − height[i]. I can compute it with two pointers.' })
    t.step(trapLine('leftMax, rightMax'), { vars: { leftMax, rightMax }, panels: panels(), note: 'Tallest wall seen from each side.' })
    t.step(trapLine('total = 0'), { vars: { leftMax, rightMax, total }, panels: panels(), note: 'Accumulate water.' })
    let said = false
    while (left < right) {
      if (leftMax < rightMax) {
        t.step(trapLine('if leftMax < rightMax'), { vars: { leftMax, rightMax }, panels: panels(), note: 'Left wall is the bottleneck: settle left side.', say: said ? undefined : 'The smaller max is the true limit for that side, since the other side has something at least as tall.' })
        said = true
        left += 1
        t.step(trapLine('left += 1'), { vars: { left, leftMax }, panels: panels({ highlight: [left] }), note: `Move left to ${left}.` })
        leftMax = Math.max(leftMax, height[left])
        t.step(trapLine('leftMax = max'), { vars: { left, leftMax }, panels: panels({ highlight: [left] }), note: `leftMax = ${leftMax}.` })
        water[left] = leftMax - height[left]
        total += water[left]
        t.step(trapLine('total += leftMax'), { vars: { left, added: water[left], total }, panels: panels({ highlight: [left] }), note: `Trap ${water[left]} above index ${left}.` })
      } else {
        t.step(trapLine('else:'), { vars: { leftMax, rightMax }, panels: panels(), note: 'Right wall is the bottleneck: settle right side.' })
        right -= 1
        t.step(trapLine('right -= 1'), { vars: { right, rightMax }, panels: panels({ highlight: [right] }), note: `Move right to ${right}.` })
        rightMax = Math.max(rightMax, height[right])
        t.step(trapLine('rightMax = max'), { vars: { right, rightMax }, panels: panels({ highlight: [right] }), note: `rightMax = ${rightMax}.` })
        water[right] = rightMax - height[right]
        total += water[right]
        t.step(trapLine('total += rightMax'), { vars: { right, added: water[right], total }, panels: panels({ highlight: [right] }), note: `Trap ${water[right]} above index ${right}.` })
      }
    }
    t.step(trapLine('return total'), { vars: { total }, panels: panels(), note: `Total water ${total}.`, say: 'O(n) time, O(1) space, versus O(n) space for prefix and suffix max arrays.' })
  },
}

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

const binarySearchLine = lineFinder(binarySearchCode)

const binarySearchTrace = {
  id: 'linear:trace:binary-search',
  title: 'Binary Search — closed interval',
  skills: ['binary-search'],
  problem: 'Find target index in a sorted array, else -1.',
  code: binarySearchCode,
  complexity: { time: 'O(log n)', space: 'O(1)', why: 'Each comparison halves the search range.' },
  inputs: [
    { label: 'found', value: { nums: [-1, 0, 3, 5, 9, 12, 15, 20], target: 15 } },
    { label: 'missing', value: { nums: [-1, 0, 3, 5, 9, 12], target: 2 } },
    { label: 'one item', value: { nums: [5], target: 5 } },
  ],
  run(input, tracer) {
    const t = sayOnce(tracer)
    const { nums, target } = input
    let left = 0
    let right = nums.length - 1
    const outside = () => nums.map((_, i) => i).filter(i => i < left || i > right)
    const panels = (extra = {}) => [arrayPanel('nums', nums, { sorted: true, pointers: { left, right, ...(extra.mid != null ? { mid: extra.mid } : {}) }, window: left <= right ? [left, right] : undefined, dim: outside(), highlight: extra.mid != null ? [extra.mid] : [] })]
    t.step(binarySearchLine('left, right ='), { vars: { left, right, target }, panels: panels(), note: 'Search the whole closed range [left, right].', say: 'Sorted input means binary search: O(log n). I use a closed interval, so the loop runs while left <= right.' })
    while (left <= right) {
      t.step(binarySearchLine('while left <= right'), { vars: { left, right }, panels: panels(), note: `${right - left + 1} candidate(s) left.` })
      const mid = Math.floor((left + right) / 2)
      t.step(binarySearchLine('mid ='), { vars: { left, right, mid, 'nums[mid]': nums[mid] }, panels: panels({ mid }), note: `Probe middle: nums[${mid}] = ${nums[mid]}.` })
      if (nums[mid] === target) {
        t.step(binarySearchLine('return mid'), { vars: { mid }, panels: panels({ mid }), note: 'Found.', say: 'Found at mid.' })
        return
      } else if (nums[mid] < target) {
        left = mid + 1
        t.step(binarySearchLine('left = mid + 1'), { vars: { left, right }, panels: panels(), note: `${nums[mid]} < ${target}: discard left half incl. mid.`, say: 'Mid is too small and everything left of it is smaller, so I throw that half away.' })
      } else {
        right = mid - 1
        t.step(binarySearchLine('right = mid - 1'), { vars: { left, right }, panels: panels(), note: `${nums[mid]} > ${target}: discard right half incl. mid.` })
      }
    }
    t.step(binarySearchLine('return -1'), { vars: { left, right }, panels: panels(), note: 'Range empty: left passed right.', say: 'Pointers crossed, so the target is not present.' })
  },
}

const rotatedCode = `class Solution:
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

        return -1`

const rotatedLine = lineFinder(rotatedCode)

const rotatedTrace = {
  id: 'linear:trace:rotated-search',
  title: 'Search in Rotated Sorted Array',
  skills: ['binary-search'],
  problem: 'Find target in a sorted array rotated at an unknown pivot.',
  code: rotatedCode,
  complexity: { time: 'O(log n)', space: 'O(1)', why: 'One half is always sorted; check it and discard a half.' },
  inputs: [
    { label: 'right side', value: { nums: [4, 5, 6, 7, 0, 1, 2], target: 0 } },
    { label: 'left side', value: { nums: [6, 7, 8, 1, 2, 3, 4, 5], target: 7 } },
    { label: 'missing', value: { nums: [4, 5, 6, 7, 0, 1, 2], target: 3 } },
  ],
  run(input, tracer) {
    const t = sayOnce(tracer)
    const { nums, target } = input
    let left = 0
    let right = nums.length - 1
    const outside = () => nums.map((_, i) => i).filter(i => i < left || i > right)
    const panels = (mid, sortedHalf) => [
      arrayPanel('nums', nums, { pointers: { left, right, ...(mid != null ? { mid } : {}) }, window: left <= right ? [left, right] : undefined, dim: outside(), highlight: sortedHalf || (mid != null ? [mid] : []) }),
    ]
    const range = (a, b) => Array.from({ length: Math.max(0, b - a + 1) }, (_, k) => a + k)
    t.step(rotatedLine('left, right ='), { vars: { left, right, target }, panels: panels(null), note: 'Rotated, but still halvable.', say: 'O(log n) is required, so binary search. Key fact: at least one half around mid is sorted.' })
    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      t.step(rotatedLine('mid ='), { vars: { left, right, mid, 'nums[mid]': nums[mid] }, panels: panels(mid), note: `Probe nums[${mid}] = ${nums[mid]}.` })
      if (nums[mid] === target) {
        t.step(rotatedLine('return mid'), { vars: { mid }, panels: panels(mid), note: 'Found.', say: 'Found it in logarithmic time.' })
        return
      }
      if (nums[left] <= nums[mid]) {
        t.step(rotatedLine('if nums[left] <= nums[mid]'), { vars: { 'nums[left]': nums[left], 'nums[mid]': nums[mid] }, panels: panels(mid, range(left, mid)), note: 'Left half is sorted.', say: 'Left half is sorted, so I can test if the target lies in its range.' })
        if (nums[left] <= target && target < nums[mid]) {
          right = mid - 1
          t.step(rotatedLine('right = mid - 1'), { vars: { left, right }, panels: panels(null), note: 'Target inside sorted left: go left.' })
        } else {
          left = mid + 1
          t.step(rotatedLine('left = mid + 1'), { vars: { left, right }, panels: panels(null), note: 'Not in sorted left: go right.' })
        }
      } else {
        t.step(rotatedLine('else:', 2), { vars: { 'nums[mid]': nums[mid], 'nums[right]': nums[right] }, panels: panels(mid, range(mid, right)), note: 'Right half is sorted.', say: 'Pivot is on the left, so the right half is sorted.' })
        if (nums[mid] < target && target <= nums[right]) {
          left = mid + 1
          t.step(rotatedLine('left = mid + 1', 2), { vars: { left, right }, panels: panels(null), note: 'Target inside sorted right: go right.' })
        } else {
          right = mid - 1
          t.step(rotatedLine('right = mid - 1', 2), { vars: { left, right }, panels: panels(null), note: 'Not in sorted right: go left.' })
        }
      }
    }
    t.step(rotatedLine('return -1'), { vars: {}, panels: panels(null), note: 'Not present.' })
  },
}

const kokoCode = `class Solution:
    def minEatingSpeed(self, piles: List[int], h: int) -> int:
        left, right = 1, max(piles)
        result = right

        while left <= right:
            k = (left + right) // 2
            hours = 0
            for pile in piles:
                hours += (pile + k - 1) // k

            if hours <= h:
                result = k
                right = k - 1
            else:
                left = k + 1

        return result`

const kokoLine = lineFinder(kokoCode)

const kokoTrace = {
  id: 'linear:trace:koko',
  title: 'Koko Eating Bananas — binary search on answer',
  skills: ['binary-search', 'constraints'],
  problem: 'Minimum eating speed k to finish all piles within h hours.',
  code: kokoCode,
  complexity: { time: 'O(n log M)', space: 'O(1)', why: 'log M speeds tried, each costs one O(n) feasibility pass.' },
  inputs: [
    { label: 'classic', value: { piles: [3, 6, 7, 11], h: 8 } },
    { label: 'tight', value: { piles: [30, 11, 23, 4, 20], h: 5 } },
    { label: 'loose', value: { piles: [30, 11, 23, 4, 20], h: 6 } },
  ],
  run(input, tracer) {
    const t = sayOnce(tracer)
    const { piles, h } = input
    let left = 1
    let right = Math.max(...piles)
    let result = right
    const speeds = Array.from({ length: right }, (_, i) => i + 1)
    const tested = {}
    const panels = (k, hourList, hl = []) => {
      const list = [arrayPanel(`speed k (answer space 1..${speeds.length})`, speeds, { pointers: { left: left - 1, right: right - 1, ...(k ? { k: k - 1 } : {}) }, window: left <= right ? [left - 1, right - 1] : undefined, dim: speeds.filter(v => v < left || v > right).map(v => v - 1), highlight: k ? [k - 1] : [] })]
      list.push(arrayPanel('piles', piles, { highlight: hl }))
      if (hourList) list.push(arrayPanel('hours per pile at k', hourList))
      list.push(mapPanel('tested  k → hours', Object.entries(tested).map(([a, b]) => [Number(a), b]), k ? [k] : []))
      return list
    }
    t.step(kokoLine('left, right ='), { vars: { left, right, h }, panels: panels(null), note: 'Answer lies in 1..max(piles).', say: 'Piles up to 10^9 rules out trying every speed. Feasibility is monotonic: if k works, any bigger k works. So binary search the answer.' })
    t.step(kokoLine('result = right'), { vars: { result }, panels: panels(null), note: 'max(piles) always works: one pile per hour.' })
    while (left <= right) {
      const k = Math.floor((left + right) / 2)
      t.step(kokoLine('k ='), { vars: { left, right, k }, panels: panels(k), note: `Try speed ${k}.` })
      let hours = 0
      const hourList = []
      for (let p = 0; p < piles.length; p++) {
        const need = Math.floor((piles[p] + k - 1) / k)
        hours += need
        hourList.push(need)
      }
      tested[k] = hours
      t.step(kokoLine('hours += (pile'), { vars: { k, hours, h }, panels: panels(k, hourList), note: `At k=${k}, needs ${hours}h (ceil per pile).`, say: k === Math.floor((1 + Math.max(...piles)) / 2) ? 'Feasibility check is O(n): sum ceil(pile / k).' : undefined })
      if (hours <= h) {
        result = k
        right = k - 1
        t.step(kokoLine('right = k - 1'), { vars: { result, left, right }, panels: panels(null), note: `${hours} ≤ ${h}: feasible. Record, try slower.`, say: 'Works, so I save it and search for something smaller.' })
      } else {
        left = k + 1
        t.step(kokoLine('left = k + 1'), { vars: { left, right }, panels: panels(null), note: `${hours} > ${h}: too slow, go faster.` })
      }
    }
    t.step(kokoLine('return result'), { vars: { result }, panels: panels(null), note: `Minimum speed ${result}.`, say: 'O(n log max) time. That is the binary-search-on-answer template.' })
  },
}

const consecutiveCode = `class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        numSet = set(nums)
        longest = 0

        for num in numSet:
            if num - 1 not in numSet:
                length = 1
                while num + length in numSet:
                    length += 1
                longest = max(longest, length)

        return longest`

const consecutiveLine = lineFinder(consecutiveCode)

const consecutiveTrace = {
  id: 'linear:trace:longest-consecutive',
  title: 'Longest Consecutive Sequence — set starts',
  skills: ['arrays-hashing', 'ds-diagnosis'],
  problem: 'Length of the longest run of consecutive integers, in O(n).',
  code: consecutiveCode,
  complexity: { time: 'O(n)', space: 'O(n)', why: 'Only sequence starts extend; each number is walked once overall.' },
  inputs: [
    { label: 'classic', value: [100, 4, 200, 1, 3, 2] },
    { label: 'long', value: [0, 3, 7, 2, 5, 8, 4, 6, 0, 1] },
    { label: 'gaps', value: [9, 1, 4, 7, 3, 2, 10] },
  ],
  run(input, tracer) {
    const t = sayOnce(tracer)
    const numSet = [...new Set(input)]
    let longest = 0
    const panels = (hl = []) => [arrayPanel('nums', input), setPanel('numSet', numSet, hl)]
    t.step(consecutiveLine('numSet = set(nums)'), { vars: {}, panels: panels(), note: 'O(1) membership; duplicates gone.', say: 'Sorting would be O(n log n). A set gives O(1) lookups so I can do it in O(n).' })
    t.step(consecutiveLine('longest = 0'), { vars: { longest }, panels: panels(), note: 'Best run length.' })
    let said = false
    for (const num of numSet) {
      t.step(consecutiveLine('for num in'), { vars: { num, longest }, panels: panels([num]), note: `Consider ${num}.` })
      if (!numSet.includes(num - 1)) {
        t.step(consecutiveLine('if num - 1 not in'), { vars: { num, 'num - 1': num - 1 }, panels: panels([num]), note: `${num - 1} absent: ${num} starts a run.`, say: said ? undefined : 'I only count from sequence starts, numbers with no left neighbor. That keeps it linear.' })
        said = true
        let length = 1
        t.step(consecutiveLine('length = 1'), { vars: { num, length }, panels: panels([num]), note: 'Run of 1 so far.' })
        while (numSet.includes(num + length)) {
          length += 1
          t.step(consecutiveLine('length += 1'), { vars: { num, length }, panels: panels(Array.from({ length }, (_, k) => num + k)), note: `${num + length - 1} present, extend.` })
        }
        const before = longest
        longest = Math.max(longest, length)
        t.step(consecutiveLine('longest = max'), { vars: { length, longest }, panels: panels(Array.from({ length }, (_, k) => num + k)), note: longest > before ? `New best ${longest}.` : `Best stays ${longest}.` })
      } else {
        t.step(consecutiveLine('if num - 1 not in'), { vars: { num, 'num - 1': num - 1 }, panels: panels([num, num - 1]), note: `${num - 1} exists: not a start, skip.` })
      }
    }
    t.step(consecutiveLine('return longest'), { vars: { longest }, panels: panels(), note: `Answer ${longest}.`, say: 'Each number is visited by the inner while at most once overall: O(n).' })
  },
}

const traces = [twoSumTrace, threeSumTrace, longestSubstringTrace, minWindowTrace, subarraySumTrace, maxAreaTrace, trapTrace, binarySearchTrace, rotatedTrace, kokoTrace, consecutiveTrace]

const lessons = [
  {
    id: 'linear:lesson:hashing',
    title: 'Hashmap reflexes',
    skills: ['arrays-hashing', 'ds-diagnosis'],
    slides: [
      {
        title: 'The question to ask',
        points: ['"Have I seen X before?" → set', '"Where / how many times?" → dict', 'Lookup drops from O(n) to O(1)'],
        panels: [mapPanel('seen  value → index', [[2, 0], [7, 1], [11, 2]], [7])],
      },
      {
        title: 'Complement lookup',
        points: ['Two Sum: for x, look up target − x', 'Insert after checking'],
        code: twoSumCode,
        highlight: 8,
        ask: { q: 'Why insert nums[i] after the check?', choices: ['Faster', 'So an element never pairs with itself', 'Keeps dict sorted', 'Saves memory'], answer: 1, why: 'Checking first means seen only has earlier indices, so [3] with target 6 does not use 3 twice.' },
      },
      {
        title: 'Grouping key',
        points: ['Anagrams: key = sorted word or 26-count tuple', 'Same key → same bucket', 'dd(list) makes it one line'],
        panels: [mapPanel('groups', [['aet', ['eat', 'tea', 'ate']], ['ant', ['tan', 'nat']], ['abt', ['bat']]], ['aet'])],
      },
      {
        title: 'Set for starts',
        points: ['Longest consecutive: only extend when num − 1 is absent', 'Each number walked once → O(n)'],
        panels: [setPanel('numSet', [100, 4, 200, 1, 3, 2], [1, 2, 3, 4])],
        ask: { q: 'Longest consecutive must be O(n). Why not sort?', choices: ['Sorting is O(n log n)', 'Sorting loses duplicates', 'Sorting needs O(n²)', 'Sets are sorted'], answer: 0, why: 'Sorting costs n log n. Set membership is O(1) on average.' },
      },
      {
        title: 'Counter tricks',
        points: ['Counter(s) == Counter(t) → anagram', 'Bucket by frequency → top-k in O(n)'],
        code: `from collections import Counter

class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        return Counter(s) == Counter(t)`,
      },
    ],
  },
  {
    id: 'linear:lesson:two-pointers',
    title: 'Two pointers on sorted data',
    skills: ['two-pointers', 'greedy'],
    slides: [
      {
        title: 'Sorted + pair → squeeze',
        points: ['Sum too big → right −= 1', 'Sum too small → left += 1', 'Each move discards a whole row of pairs'],
        panels: [arrayPanel('sorted', [-4, -1, -1, 0, 1, 2], { pointers: { left: 0, right: 5 }, window: [0, 5], sorted: true })],
      },
      {
        title: 'Why it is safe',
        points: ['If nums[l] + nums[r] > target, r pairs with nothing larger', 'So r is useless: drop it'],
        ask: { q: 'Sorted [1,3,4,6,9], target 10, l=0, r=4. Sum is 10. Next for two-sum II?', choices: ['Return [l, r]', 'Move left', 'Move right', 'Move both'], answer: 0, why: '1 + 9 = 10 equals target: done.' },
      },
      {
        title: '3Sum = anchor + two-sum',
        points: ['Sort, fix i, squeeze the rest', 'Skip equal anchors and equal lefts', 'O(n²)'],
        code: threeSumCode,
        highlight: 7,
      },
      {
        title: 'Greedy pointer moves',
        points: ['Container: move the shorter wall', 'Trap: settle the side with the smaller max'],
        panels: [arrayPanel('heights', [1, 8, 6, 2, 5, 4, 8, 3, 7], { pointers: { left: 1, right: 8 }, window: [1, 8], highlight: [8] })],
        ask: { q: 'heights[l]=8, heights[r]=7. Which pointer moves?', choices: ['left', 'right', 'both', 'neither'], answer: 1, why: 'The shorter wall caps the area. Keeping it while narrowing can only shrink area.' },
      },
      {
        title: 'Same-direction pointers',
        points: ['Slow writes, fast reads', 'Remove duplicates, move zeros, partition', 'In place, O(1) space'],
        code: `class Solution:
    def removeDuplicates(self, nums: List[int]) -> int:
        slow = 1

        for fast in range(1, len(nums)):
            if nums[fast] != nums[fast - 1]:
                nums[slow] = nums[fast]
                slow += 1

        return slow`,
        highlight: 6,
      },
    ],
  },
  {
    id: 'linear:lesson:sliding-window',
    title: 'Sliding window: fixed vs variable',
    skills: ['sliding-window'],
    slides: [
      {
        title: 'Signals',
        points: ['Contiguous substring / subarray', 'Longest / shortest / count with a rule', 'All values positive (for sums)'],
        panels: [arrayPanel('s', 'abcabcbb'.split(''), { pointers: { left: 1, right: 3 }, window: [1, 3] })],
      },
      {
        title: 'Fixed size k',
        points: ['Add right, remove right − k', 'Window always exactly k'],
        code: `class Solution:
    def maxSum(self, nums: List[int], k: int) -> int:
        curr = sum(nums[:k])
        best = curr

        for right in range(k, len(nums)):
            curr += nums[right] - nums[right - k]
            best = max(best, curr)

        return best`,
        highlight: 7,
      },
      {
        title: 'Variable: expand, then shrink',
        points: ['for right: add s[right]', 'while invalid: remove s[left], left += 1', 'Then update answer'],
        code: longestSubstringCode,
        highlight: 8,
      },
      {
        title: 'Longest vs shortest',
        points: ['Longest: shrink while INVALID, record after', 'Shortest: shrink while VALID, record inside loop'],
        code: minWindowCode,
        highlight: 18,
        ask: { q: 'Min window: where is the answer recorded?', choices: ['Before the for loop', 'Inside while have == need', 'After the while loop', 'Only at the end'], answer: 1, why: 'For shortest-valid windows, every valid state inside the shrink loop is a candidate.' },
      },
      {
        title: 'Why O(n)',
        points: ['left only moves forward', 'Each index enters once, leaves once → 2n moves'],
        ask: { q: 'Window fails when...', choices: ['Values can be negative in a sum target', 'Input is a string', 'k is fixed', 'Answer is a length'], answer: 0, why: 'Negatives break monotonicity: shrinking may raise the sum. Use prefix sums + hashmap instead.' },
      },
    ],
  },
  {
    id: 'linear:lesson:prefix-sum',
    title: 'Prefix sums + hashmap',
    skills: ['prefix-sum', 'arrays-hashing'],
    slides: [
      {
        title: 'Range sum in O(1)',
        points: ['prefix[i] = sum of first i items', 'sum(l..r) = prefix[r + 1] − prefix[l]'],
        panels: [arrayPanel('nums', [3, 1, 4, 1, 5], { window: [1, 3] }), arrayPanel('prefix', [0, 3, 4, 8, 9, 14], { highlight: [1, 4] })],
      },
      {
        title: 'Count subarrays = k',
        points: ['Need earlier prefix = prefix − k', 'Map prefix → count', 'Seed {0: 1}'],
        code: subarraySumCode,
        highlight: 9,
      },
      {
        title: 'Why seed {0: 1}?',
        points: ['A subarray starting at index 0 needs an "empty prefix" of 0'],
        ask: { q: 'nums=[3], k=3. Without {0: 1}, result is...', choices: ['1', '0', '3', 'error'], answer: 1, why: 'prefix − k = 0 must already be in the map to count [3].' },
      },
      {
        title: 'Variants',
        points: ['Divisible by k → key = prefix % k', 'Equal 0s and 1s → map −1/+1', 'Longest → store first index'],
        panels: [mapPanel('first index of prefix', [[0, -1], [1, 0], [0, 1]], [0])],
      },
      {
        title: 'Products too',
        points: ['Product except self = prefix product × suffix product', 'O(n), no division'],
        panels: [arrayPanel('nums', [1, 2, 3, 4]), arrayPanel('prefix', [1, 1, 2, 6]), arrayPanel('suffix', [24, 12, 4, 1]), arrayPanel('output', [24, 12, 8, 6], { highlight: [2] })],
      },
    ],
  },
  {
    id: 'linear:lesson:binary-search-answer',
    title: 'Binary search on the answer',
    skills: ['binary-search', 'constraints'],
    slides: [
      {
        title: 'Spot it',
        points: ['"Minimum speed / capacity / max-min"', 'Values up to 10^9', 'Monotonic yes/no check'],
        panels: [arrayPanel('feasible(k)?', ['no', 'no', 'no', 'yes', 'yes', 'yes'], { highlight: [3], pointers: { first: 3 } })],
      },
      {
        title: 'The template',
        points: ['Range = [smallest possible, largest possible]', 'Feasible → save, go left', 'Else go right'],
        code: kokoCode,
        highlight: 12,
      },
      {
        title: 'Cost',
        points: ['log(range) guesses × O(n) check', 'Koko: O(n log max(piles))'],
        ask: { q: 'piles ≤ 10^4 items, values ≤ 10^9. Checks needed?', choices: ['~30', '~10^4', '~10^9', '~1'], answer: 0, why: 'log2(10^9) ≈ 30 guesses, each O(n).' },
      },
      {
        title: 'Rotated arrays',
        points: ['One half around mid is always sorted', 'Test target against the sorted half'],
        panels: [arrayPanel('nums', [4, 5, 6, 7, 0, 1, 2], { pointers: { left: 0, mid: 3, right: 6 }, highlight: [0, 1, 2, 3] })],
      },
      {
        title: 'Bounds cheat sheet',
        points: ['Exact match: while l <= r, mid ± 1', 'First true: while l < r, r = mid', 'bisect_left = first ≥ x'],
        ask: { q: 'Loop is while l < r with r = mid. Mid must be...', choices: ['(l + r) // 2', '(l + r + 1) // 2', 'r − 1', 'any'], answer: 0, why: 'Lower mid guarantees l < r shrinks range; with l = mid you need upper mid.' },
      },
    ],
  },
]

const cardData = [
  [['arrays-hashing', 'ds-diagnosis'], '"Have I seen this before?" in O(1)', 'set. Average O(1) add and membership.'],
  [['arrays-hashing'], 'Two Sum, unsorted, return indices', 'One pass dict value → index. Check target − x before inserting x. O(n) / O(n).'],
  [['two-pointers'], 'Two Sum II, sorted input, O(1) space', 'Two pointers from both ends. Sum too big → right −= 1, too small → left += 1.'],
  [['arrays-hashing'], 'Group Anagrams key', 'tuple(sorted(word)) or a 26-count tuple. Group with dd(list).', `groups = dd(list)
for word in strs:
    groups[tuple(sorted(word))].append(word)`],
  [['arrays-hashing'], 'Top K Frequent in O(n)', 'Counter, then bucket by frequency (index = count), walk buckets from high to low.'],
  [['arrays-hashing'], 'Longest Consecutive Sequence trick', 'Put nums in a set. Only start counting at x where x − 1 is absent. O(n).'],
  [['arrays-hashing', 'complexity'], 'Average vs worst case of dict lookup', 'Average O(1), worst O(n) with many collisions. Interviews assume O(1).'],
  [['arrays-hashing'], 'Can a list be a dict key?', 'No, lists are mutable/unhashable. Use a tuple or frozenset.'],
  [['arrays-hashing'], 'Valid Anagram one-liner', 'Counter(s) == Counter(t). O(n) time, O(alphabet) space.'],
  [['arrays-hashing', 'prefix-sum'], 'Product of Array Except Self, no division', 'Left pass writes prefix products, right pass multiplies a running suffix. O(n), O(1) extra.'],
  [['arrays-hashing'], 'Contains Duplicate fastest', 'len(set(nums)) != len(nums), or add to set and stop on first repeat. O(n).'],
  [['two-pointers'], '3Sum approach', 'Sort. For each anchor i, two-pointer the rest for −nums[i]. Skip duplicate anchors and lefts. O(n²).'],
  [['two-pointers', 'greedy'], 'Container With Most Water: which pointer moves?', 'The shorter wall. It caps the area, so keeping it while narrowing can never help.'],
  [['two-pointers'], 'Trapping Rain Water formula', 'water[i] = min(maxLeft, maxRight) − height[i]. Two pointers settle the side with the smaller max.'],
  [['two-pointers'], 'Valid Palindrome pattern', 'left/right inward, skip non-alphanumerics, compare lowercase. O(n), O(1).'],
  [['two-pointers'], 'Same-direction pointers use', 'slow writes, fast reads: remove duplicates, move zeros, partition in place.'],
  [['two-pointers', 'complexity'], 'Why is two-pointer squeeze O(n)?', 'Each step moves one pointer inward; at most n moves total.'],
  [['sliding-window'], 'Sliding window signals', 'Contiguous subarray/substring + longest/shortest/count + a condition you can update incrementally.'],
  [['sliding-window'], 'Variable window skeleton', 'for right: add s[right]; while invalid: remove s[left], left += 1; update answer.'],
  [['sliding-window'], 'Fixed window of size k', 'Add nums[right], remove nums[right − k]. Update answer once right ≥ k − 1.'],
  [['sliding-window'], 'Longest vs shortest window: where to record?', 'Longest: after shrinking (window valid). Shortest: inside the shrink loop while valid.'],
  [['sliding-window'], 'Longest Repeating Char Replacement validity', 'window size − count of most frequent char ≤ k.'],
  [['sliding-window', 'arrays-hashing'], 'Min Window Substring have/need', 'need = distinct chars in t. have += 1 when window[c] hits countT[c]. Shrink while have == need.'],
  [['sliding-window'], 'Permutation in String', 'Fixed window of len(s1) over s2; compare 26-count arrays (or track matches).'],
  [['sliding-window', 'prefix-sum'], 'When does sliding window fail on sums?', 'Negative numbers. Growing can shrink the sum, so no monotonic shrink rule. Use prefix + hashmap.'],
  [['sliding-window', 'queue-deque'], 'Sliding Window Maximum', 'Monotonic decreasing deque of indices. Pop smaller from back, expired from front. O(n).'],
  [['prefix-sum'], 'Range sum query formula', 'prefix has n + 1 entries, prefix[0] = 0. sum(l..r) = prefix[r + 1] − prefix[l].'],
  [['prefix-sum', 'arrays-hashing'], 'Subarray Sum Equals K', 'Map prefix → count, seeded {0: 1}. result += count[prefix − k] each step. O(n).'],
  [['prefix-sum'], 'Subarray sum divisible by k', 'Key = prefix % k. Equal remainders → divisible subarray between them.'],
  [['prefix-sum'], 'Longest subarray with sum k', 'Map prefix → FIRST index seen. length = i − first[prefix − k].'],
  [['binary-search'], 'Closed-interval binary search loop', 'while left <= right; mid = (left + right) // 2; left = mid + 1 / right = mid − 1.'],
  [['binary-search'], 'bisect_left vs bisect_right', 'bisect_left: first index ≥ x. bisect_right: first index > x.'],
  [['binary-search'], 'Binary search on answer signal', 'Minimize/maximize a value with a monotonic feasible(x) check; huge value range.'],
  [['binary-search'], 'Koko Eating Bananas', 'Search speed 1..max(piles). hours = Σ ceil(p / k). Feasible → right = k − 1.'],
  [['binary-search'], 'Rotated sorted array key fact', 'One half around mid is always sorted. Check if target lies in that half.'],
  [['binary-search'], 'Find Min in Rotated Sorted', 'while l < r: if nums[mid] > nums[r]: l = mid + 1 else r = mid. Answer nums[l].'],
  [['binary-search', 'constraints'], 'Values up to 10^9, n ≤ 10^5', 'Binary search on the value: O(n log 10^9) ≈ 30n ops.'],
  [['greedy'], 'Jump Game greedy', 'Track farthest reachable. If i > farthest, return False.'],
  [['greedy', 'dp-1d'], "Kadane's algorithm", 'curr = max(x, curr + x); best = max(best, curr). Drop a negative running sum.'],
  [['greedy'], 'Best Time to Buy and Sell Stock', 'Track min price so far; profit = price − minPrice. O(n).'],
]

const flashcards = cardData.map(([skills, front, back, code], i) => ({ id: `linear:card:${i + 1}`, skills, front, back, ...(code ? { code } : {}) }))

const mcqData = [
  [['arrays-hashing', 'complexity'], 1, 'Two Sum with a hashmap, one pass. Time and space?', ['O(n), O(n)', 'O(n log n), O(1)', 'O(n²), O(1)', 'O(n), O(1)'], 0, 'Each element: one O(1) lookup and one insert. The map can hold n entries.'],
  [['arrays-hashing', 'ds-diagnosis'], 2, 'You must check if a pair sums to target, input unsorted, O(1) extra space required. Best?', ['Hashmap one pass', 'Sort then two pointers', 'Nested loops', 'Binary search per element without sorting'], 1, 'In-place sort: O(1) extra in theory (Timsort uses up to O(n)); a hashmap always costs O(n).'],
  [['arrays-hashing'], 2, 'Group Anagrams with key tuple(sorted(word)). Words have length ≤ m. Time?', ['O(n · m log m)', 'O(n · m)', 'O(n log n)', 'O(n² · m)'], 0, 'Sorting each word costs m log m, done n times. A 26-count key gives O(n · m).'],
  [['arrays-hashing'], 1, 'Why can groups[sorted(word)] fail?', ['sorted returns a list, which is unhashable', 'sorted is too slow', 'Keys must be strings', 'dict cannot hold lists'], 0, 'Lists are mutable, so not hashable. Wrap with tuple() or "".join().'],
  [['arrays-hashing', 'complexity'], 2, 'Longest Consecutive: why is the nested while loop still O(n) total?', ['It only runs from sequence starts, so each number is walked once', 'Sets are sorted', 'The while loop runs at most once', 'Python optimizes it'], 0, 'Starts are numbers without x − 1. Each run is walked once from its start.'],
  [['arrays-hashing'], 2, 'Top K Frequent with buckets indexed by frequency. Bucket list size?', ['len(nums) + 1', 'k', 'max(nums)', 'number of distinct values'], 0, 'A frequency can be anywhere from 1 to n, so n + 1 buckets.'],
  [['arrays-hashing', 'ds-diagnosis'], 1, 'Need counts of each character in a string. Most idiomatic?', ['Counter(s)', 'sorted(s)', 'set(s)', 'list(s).index'], 0, 'Counter builds a dict char → count in O(n).'],
  [['arrays-hashing', 'prefix-sum'], 2, 'Product Except Self: output[i] after the left pass holds...', ['product of nums[0..i-1]', 'product of nums[i+1..]', 'nums[i]', 'total product / nums[i]'], 0, 'Left pass writes prefix products. The right pass multiplies in suffix products.'],
  [['arrays-hashing'], 3, 'Two Sum code inserts seen[nums[i]] = i BEFORE checking. nums=[3,2,4], target=6. Returns?', ['[0, 0]', '[1, 2]', '[]', '[0, 2]'], 0, 'At i=0 it stores 3 → 0, then finds need 3 in seen: pairs index 0 with itself.'],
  [['two-pointers'], 1, 'Sorted array, left + right sum is less than target. Next move?', ['left += 1', 'right -= 1', 'Both move', 'Return False'], 0, 'Only a larger left value can increase the sum.'],
  [['two-pointers', 'complexity'], 2, '3Sum: total time complexity?', ['O(n²)', 'O(n³)', 'O(n log n)', 'O(n² log n)'], 0, 'Sort O(n log n), then n anchors × O(n) squeeze.'],
  [['two-pointers'], 2, '3Sum after finding a triplet: why skip while nums[left] == nums[left - 1]?', ['To avoid duplicate triplets', 'To speed up to O(n)', 'To keep the array sorted', 'To avoid index errors'], 0, 'Same left value with same anchor would rebuild the same triplet.'],
  [['two-pointers', 'greedy'], 2, 'Container: heights[l]=3, heights[r]=9. Why move l, not r?', ['Any narrower container using l is ≤ current area', 'Taller walls are slower', 'r is already optimal', 'To keep pointers balanced'], 0, 'Height is capped by 3 and width only shrinks, so l cannot improve.'],
  [['two-pointers'], 3, 'Trapping Rain Water: leftMax=2, rightMax=5. Which side is safe to settle?', ['Left: its water is bounded by leftMax', 'Right: it has the bigger max', 'Both', 'Neither until pointers meet'], 0, 'Right has a wall ≥ 5 > 2, so left water = leftMax − height exactly.'],
  [['two-pointers', 'prefix-sum'], 2, 'Trapping Rain Water with preMax/postMax arrays. Space?', ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'], 0, 'Two extra arrays of size n. Two pointers bring it to O(1).'],
  [['two-pointers'], 1, 'Valid Palindrome "A man, a plan..." — what to do with commas?', ['Skip non-alphanumerics on both pointers', 'Return False', 'Count them', 'Replace with spaces'], 0, 'Only alphanumerics matter, compared case-insensitively.'],
  [['two-pointers'], 2, 'Remove duplicates in place from sorted nums. slow ends at...', ['The number of unique values', 'len(nums) − 1', 'Index of the last duplicate', 'Always 1'], 0, 'slow is the next write position, so it equals the count of uniques.'],
  [['two-pointers', 'ds-diagnosis'], 3, 'Find a pair with difference k in a sorted array. Pointers?', ['Both start left, move same direction', 'Ends moving inward', 'Binary search only', 'Not possible in O(n)'], 0, 'If diff < k, move fast forward; if > k, move slow forward. Inward squeeze fits sums, not differences.'],
  [['sliding-window'], 1, 'Which prompt most strongly signals sliding window?', ['Longest substring with at most 2 distinct chars', 'Count all subsets with sum k', 'Shortest path in grid', 'Kth largest element'], 0, 'Contiguous + longest + incremental condition.'],
  [['sliding-window', 'complexity'], 2, 'Variable window has a while inside a for. Time?', ['O(n)', 'O(n²)', 'O(n log n)', 'O(k·n)'], 0, 'left only moves forward, so total inner iterations ≤ n.'],
  [['sliding-window'], 2, 's = "abba". Longest substring without repeats, at right=2 (second b). left becomes?', ['2', '1', '0', '3'], 0, 'Remove a, then b, left = 2. Window is "b".'],
  [['sliding-window'], 2, 'Longest Repeating Character Replacement: window is valid when...', ['size − maxFreq ≤ k', 'distinct chars ≤ k', 'size ≤ k', 'maxFreq ≥ k'], 0, 'Chars that are not the majority must be replaced, at most k.'],
  [['sliding-window'], 3, 'Min Window Substring: why track have/need instead of comparing two Counters?', ['Comparing maps each step costs O(alphabet)', 'Counters are unordered', 'Counters cannot hold zero', 'have/need uses less memory'], 0, 'have/need updates in O(1); map compare is O(52) per step.'],
  [['sliding-window', 'prefix-sum'], 2, 'Count subarrays summing to k, nums may be negative. Approach?', ['Prefix sum + hashmap', 'Sliding window', 'Two pointers from ends', 'Sort then window'], 0, 'Negatives break window monotonicity.'],
  [['sliding-window'], 2, 'Max sum of any subarray of size exactly k. Per step update?', ['curr += nums[r] − nums[r − k]', 'curr = sum(nums[r−k:r])', 'curr = max(curr, nums[r])', 'curr += nums[r]'], 0, 'Fixed window: add incoming, subtract outgoing in O(1).'],
  [['sliding-window'], 2, 'Permutation in String (s1 in s2). Window size?', ['len(s1), fixed', 'Variable, grows until invalid', 'len(s2)', '26'], 0, 'A permutation has exactly len(s1) chars.'],
  [['sliding-window', 'arrays-hashing'], 3, 'Longest substring with at most k distinct chars. Data structure for the window?', ['dict char → count', 'set of chars', 'sorted list', 'stack'], 0, 'Need counts to know when a char fully leaves; len(dict) gives distinct.'],
  [['sliding-window', 'queue-deque'], 3, 'Sliding Window Maximum in O(n). Deque holds...', ['Indices with decreasing values', 'All window values sorted', 'Indices with increasing values', 'Only the max'], 0, 'Front is the max; smaller items behind a new value are useless.'],
  [['prefix-sum'], 1, 'prefix = [0, 3, 4, 8, 9]. sum(nums[1..3])?', ['6', '8', '5', '9'], 0, 'prefix[4] − prefix[1] = 9 − 3 = 6.'],
  [['prefix-sum', 'arrays-hashing'], 2, 'Subarray Sum = k: why seed prefixCount with {0: 1}?', ['Counts subarrays that start at index 0', 'Avoids KeyError', 'Handles k = 0 only', 'Required for negatives'], 0, 'If prefix itself equals k, prefix − k = 0 must be counted once.'],
  [['prefix-sum'], 3, 'Subarray Sum = k: update map before or after adding to result?', ['After: else k = 0 counts the empty subarray', 'Before: always', 'Order never matters', 'Only before when k < 0'], 0, 'Inserting first would let prefix − 0 match itself, a zero-length subarray.'],
  [['prefix-sum'], 2, 'Longest subarray with sum k. Map should store...', ['First index of each prefix', 'Last index of each prefix', 'Count of each prefix', 'Max prefix'], 0, 'Earliest start gives the longest length.'],
  [['prefix-sum', 'complexity'], 1, 'Many range-sum queries on a static array. Build and query cost?', ['O(n) build, O(1) query', 'O(1) build, O(n) query', 'O(n log n) build, O(log n) query', 'O(n²) build, O(1) query'], 0, 'Precompute once, then each query is one subtraction.'],
  [['binary-search', 'complexity'], 1, 'Binary search on 10^6 sorted items. Max comparisons?', ['~20', '~1000', '~10^6', '~6'], 0, 'log2(10^6) ≈ 20.'],
  [['binary-search'], 2, 'Loop while left <= right with left = mid (not mid + 1). Risk?', ['Infinite loop', 'Off by one answer only', 'Index error', 'None'], 0, 'When left == mid the range never shrinks.'],
  [['binary-search'], 2, 'Rotated [4,5,6,7,0,1,2], mid=3 (7), target 0. Next?', ['Left half sorted, 0 not in [4,7) → left = mid + 1', 'right = mid − 1', 'Return -1', 'Linear scan'], 0, 'nums[left] ≤ nums[mid] means left sorted; target outside, so go right.'],
  [['binary-search', 'constraints'], 2, 'Koko: piles ≤ 10^4, pile ≤ 10^9. Why not try every k?', ['Up to 10^9 × 10^4 ops', 'k must be prime', 'Hours overflow', 'Piles are unsorted'], 0, 'Binary search cuts 10^9 speeds to ~30.'],
  [['binary-search'], 3, 'Koko feasible at k=6, not at k=5. Answer?', ['6', '5', '5.5', 'Need more checks'], 0, 'Monotonic: the boundary between infeasible and feasible is the minimum.'],
  [['binary-search'], 2, 'Find Minimum in Rotated Sorted: nums[mid] > nums[right]. Then...', ['Min is right of mid: left = mid + 1', 'right = mid', 'Return nums[mid]', 'right = mid − 1'], 0, 'A drop exists between mid and right, so the min is after mid.'],
  [['binary-search', 'ds-diagnosis'], 3, 'Ship packages within D days: minimum capacity. Search range?', ['[max(weights), sum(weights)]', '[1, D]', '[0, max(weights)]', '[min(weights), max(weights)]'], 0, 'Capacity must fit the heaviest package; sum ships everything in one day.'],
  [['binary-search'], 2, 'bisect_left([1,2,2,2,5], 2) returns?', ['1', '3', '4', '2'], 0, 'First index where value ≥ 2.'],
  [['greedy'], 2, 'Jump Game nums=[3,2,1,0,4]. Where does it fail?', ['i=4 > farthest=3', 'i=3', 'i=0', 'Never'], 0, 'farthest stays 3; index 4 is unreachable.'],
  [['greedy', 'dp-1d'], 2, "Kadane: curr = max(x, curr + x). Resetting to x means...", ['The running sum went negative, so start fresh', 'x is the max overall', 'Array ended', 'curr was positive'], 0, 'A negative prefix can only hurt any subarray that extends it.'],
  [['greedy', 'two-pointers'], 1, 'Best Time to Buy/Sell Stock (one trade). Track...', ['Min price so far and max profit', 'Max price so far', 'All pairs', 'Sorted prices'], 0, 'Profit today = price − cheapest earlier price.'],
  [['constraints', 'arrays-hashing'], 2, 'n ≤ 10^5, find duplicates count. Which complexity fits?', ['O(n) or O(n log n)', 'O(n²)', 'O(2^n)', 'O(n³)'], 0, '10^10 ops for O(n²) is too slow; ~10^8 per second budget.'],
]

const rotateChoices = (choices, answer, shift) => {
  const order = choices.map((_, k) => (k + shift) % choices.length)
  return { choices: order.map(k => choices[k]), answer: order.indexOf(answer) }
}

const mcqs = mcqData.map(([skills, difficulty, q, choices, answer, why, code], i) => ({ id: `linear:mcq:${i + 1}`, skills, difficulty, q, ...rotateChoices(choices, answer, (i * 3 + 1) % 4), why, ...(code ? { code } : {}) }))

const clozes = [
  {
    id: 'linear:cloze:1', skills: ['arrays-hashing'], title: 'Two Sum one pass',
    code: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}

        for i in range(len(nums)):
            need = [[target - nums[i]]]

            if need in [[seen]]:
                return [seen[need], i]

            seen[nums[i]] = [[i]]`,
  },
  {
    id: 'linear:cloze:2', skills: ['sliding-window'], title: 'Longest substring without repeats',
    code: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        window = set()
        left = 0
        longest = 0

        for right in range(len(s)):
            [[while]] s[right] in window:
                window.remove([[s[left]]])
                left += 1

            window.add(s[right])
            longest = max(longest, [[right - left + 1]])

        return longest`,
    hint: 'Shrink until valid, then measure.',
  },
  {
    id: 'linear:cloze:3', skills: ['prefix-sum', 'arrays-hashing'], title: 'Subarray Sum Equals K',
    code: `class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        prefixCount = {0: [[1]]}
        prefix = 0
        result = 0

        for num in nums:
            prefix += num
            result += prefixCount.get([[prefix - k]], 0)
            prefixCount[prefix] = prefixCount.get(prefix, 0) + 1

        return result`,
    hint: 'Earlier prefix that cancels out k.',
  },
  {
    id: 'linear:cloze:4', skills: ['binary-search'], title: 'Closed-interval binary search',
    code: `class Solution:
    def search(self, nums: List[int], target: int) -> int:
        left, right = 0, len(nums) - 1

        while left [[<=]] right:
            mid = (left + right) // 2

            if nums[mid] == target:
                return mid
            elif nums[mid] < target:
                left = [[mid + 1]]
            else:
                right = [[mid - 1]]

        return -1`,
  },
  {
    id: 'linear:cloze:5', skills: ['binary-search'], title: 'Koko: binary search on answer',
    code: `class Solution:
    def minEatingSpeed(self, piles: List[int], h: int) -> int:
        left, right = [[1]], [[max(piles)]]
        result = right

        while left <= right:
            k = (left + right) // 2
            hours = 0
            for pile in piles:
                hours += (pile + k - 1) // k

            if hours [[<=]] h:
                result = k
                right = k - 1
            else:
                left = k + 1

        return result`,
    hint: 'Smallest and largest sensible speeds.',
  },
  {
    id: 'linear:cloze:6', skills: ['two-pointers', 'greedy'], title: 'Container With Most Water',
    code: `class Solution:
    def maxArea(self, heights: List[int]) -> int:
        left, right = 0, len(heights) - 1
        best = 0

        while left < right:
            area = [[min]](heights[left], heights[right]) * ([[right - left]])
            best = max(best, area)

            if heights[left] < heights[right]:
                [[left += 1]]
            else:
                right -= 1

        return best`,
  },
  {
    id: 'linear:cloze:7', skills: ['arrays-hashing'], title: 'Longest consecutive sequence',
    code: `class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        numSet = [[set(nums)]]
        longest = 0

        for num in numSet:
            if [[num - 1]] not in numSet:
                length = 1
                while [[num + length]] in numSet:
                    length += 1
                longest = max(longest, length)

        return longest`,
  },
  {
    id: 'linear:cloze:8', skills: ['sliding-window', 'arrays-hashing'], title: 'Min window have/need',
    code: `for right in range(len(s)):
    c = s[right]
    window[c] = window.get(c, 0) + 1

    if c in countT and window[c] [[==]] countT[c]:
        have += 1

    while have [[==]] need:
        if right - left + 1 < answerLen:
            answer = [left, right]
            answerLen = right - left + 1

        window[s[left]] -= 1
        if s[left] in countT and window[s[left]] [[<]] countT[s[left]]:
            have -= 1
        left [[+= 1]]`,
  },
  {
    id: 'linear:cloze:9', skills: ['two-pointers'], title: 'Trapping rain water',
    code: `class Solution:
    def trap(self, height: List[int]) -> int:
        left, right = 0, len(height) - 1
        leftMax, rightMax = height[left], height[right]
        total = 0

        while left < right:
            if leftMax [[<]] rightMax:
                left += 1
                leftMax = max(leftMax, height[left])
                total += [[leftMax - height[left]]]
            else:
                right -= 1
                rightMax = [[max(rightMax, height[right])]]
                total += rightMax - height[right]

        return total`,
  },
  {
    id: 'linear:cloze:10', skills: ['arrays-hashing', 'prefix-sum'], title: 'Product except self',
    code: `class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        output = [1] * len(nums)

        for i in range(1, len(nums)):
            output[i] = output[i - 1] * [[nums[i - 1]]]

        suffix = 1
        for i in range(len(nums) - 2, -1, -1):
            suffix *= [[nums[i + 1]]]
            output[i] [[*=]] suffix

        return output`,
  },
]

const parsons = [
  {
    id: 'linear:parsons:1', skills: ['arrays-hashing'], title: 'Group Anagrams',
    lines: [
      'class Solution:',
      '    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:',
      '        groups = dd(list)',
      '        for word in strs:',
      '            key = tuple(sorted(word))',
      '            groups[key].append(word)',
      '        return list(groups.values())',
    ],
    distractors: ['            key = sorted(word)'],
  },
  {
    id: 'linear:parsons:2', skills: ['sliding-window'], title: 'Longest substring without repeats',
    lines: [
      'class Solution:',
      '    def lengthOfLongestSubstring(self, s: str) -> int:',
      '        window = set()',
      '        left = longest = 0',
      '        for right in range(len(s)):',
      '            while s[right] in window:',
      '                window.remove(s[left])',
      '                left += 1',
      '            window.add(s[right])',
      '            longest = max(longest, right - left + 1)',
      '        return longest',
    ],
    distractors: ['            if s[right] in window:'],
  },
  {
    id: 'linear:parsons:3', skills: ['two-pointers'], title: 'Two Sum II (sorted)',
    lines: [
      'class Solution:',
      '    def twoSum(self, numbers: List[int], target: int) -> List[int]:',
      '        left, right = 0, len(numbers) - 1',
      '        while left < right:',
      '            total = numbers[left] + numbers[right]',
      '            if total == target:',
      '                return [left + 1, right + 1]',
      '            elif total > target:',
      '                right -= 1',
      '            else:',
      '                left += 1',
    ],
    distractors: ['                left -= 1'],
  },
  {
    id: 'linear:parsons:4', skills: ['binary-search'], title: 'Find minimum in rotated sorted array',
    lines: [
      'class Solution:',
      '    def findMin(self, nums: List[int]) -> int:',
      '        left, right = 0, len(nums) - 1',
      '        while left < right:',
      '            mid = (left + right) // 2',
      '            if nums[mid] > nums[right]:',
      '                left = mid + 1',
      '            else:',
      '                right = mid',
      '        return nums[left]',
    ],
    distractors: ['                right = mid - 1'],
  },
  {
    id: 'linear:parsons:5', skills: ['prefix-sum', 'arrays-hashing'], title: 'Subarray Sum Equals K',
    lines: [
      'class Solution:',
      '    def subarraySum(self, nums: List[int], k: int) -> int:',
      '        prefixCount = {0: 1}',
      '        prefix = result = 0',
      '        for num in nums:',
      '            prefix += num',
      '            result += prefixCount.get(prefix - k, 0)',
      '            prefixCount[prefix] = prefixCount.get(prefix, 0) + 1',
      '        return result',
    ],
    distractors: ['        prefixCount = {}'],
  },
  {
    id: 'linear:parsons:6', skills: ['greedy'], title: 'Jump Game',
    lines: [
      'class Solution:',
      '    def canJump(self, nums: List[int]) -> bool:',
      '        farthest = 0',
      '        for i in range(len(nums)):',
      '            if i > farthest:',
      '                return False',
      '            farthest = max(farthest, i + nums[i])',
      '        return True',
    ],
    distractors: ['            farthest = i + nums[i]'],
  },
]

const problems = [
  {
    id: 'linear:problem:two-sum', lc: 1, title: 'Two Sum', difficulty: 'Easy', google: true,
    skills: ['arrays-hashing'], pattern: 'Hashmap complement', ds: ['hashmap'],
    constraints: '2 ≤ n ≤ 10^4, exactly one answer', time: 'O(n)', space: 'O(n)',
    insight: 'Store value → index; look up target − x before inserting x.',
    signals: ['pair', 'add up to target', 'return indices', 'unsorted'],
    narration: ['Clarify: exactly one answer, can I reuse an element? No.', 'Brute force checks all pairs, O(n²).', 'A dict of seen values gives O(1) complement lookups.', 'Check before insert so an element never pairs with itself.', 'O(n) time, O(n) space.'],
    solution: twoSumCode, traceId: 'linear:trace:two-sum',
    pitfalls: ['Duplicates like [3,3] target 6', 'Returning values instead of indices'],
  },
  {
    id: 'linear:problem:longest-substring', lc: 3, title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', google: true,
    skills: ['sliding-window', 'arrays-hashing'], pattern: 'Variable sliding window', ds: ['set'],
    constraints: '0 ≤ n ≤ 5·10^4', time: 'O(n)', space: 'O(min(n, alphabet))',
    insight: 'Grow right; on a repeat, shrink left until the window is unique again.',
    signals: ['substring', 'longest', 'without repeating'],
    narration: ['Clarify: character set? Empty string returns 0.', 'Contiguous + longest + validity rule → sliding window.', 'Set holds chars in the window.', 'On duplicate, remove from the left until valid.', 'Each index enters and leaves once: O(n).'],
    solution: longestSubstringCode, traceId: 'linear:trace:longest-substring',
    pitfalls: ['Empty string', 'Recording length before shrinking'],
  },
  {
    id: 'linear:problem:container', lc: 11, title: 'Container With Most Water', difficulty: 'Medium', google: true,
    skills: ['two-pointers', 'greedy'], pattern: 'Two pointers from ends', ds: ['array'],
    constraints: '2 ≤ n ≤ 10^5', time: 'O(n)', space: 'O(1)',
    insight: 'Move the shorter wall; it caps every narrower container.',
    signals: ['two lines', 'most water', 'max area'],
    narration: ['n up to 10^5 rules out O(n²) pairs.', 'Start widest, both ends.', 'Area limited by the shorter wall.', 'Moving the taller wall can never help, so move the shorter.', 'O(n) time, O(1) space.'],
    solution: maxAreaCode, traceId: 'linear:trace:container-water',
  },
  {
    id: 'linear:problem:three-sum', lc: 15, title: '3Sum', difficulty: 'Medium', google: true,
    skills: ['two-pointers', 'arrays-hashing'], pattern: 'Sort + two pointers', ds: ['array'],
    constraints: '3 ≤ n ≤ 3000', time: 'O(n²)', space: 'O(1) extra',
    insight: 'Fix one number, two-sum the rest with pointers on the sorted array.',
    signals: ['triplets', 'sum to zero', 'unique'],
    narration: ['n ≤ 3000 means O(n²) is fine, O(n³) is not.', 'Sort, so duplicates are adjacent and pointers can steer.', 'For each anchor, squeeze left/right toward −anchor.', 'Skip equal anchors and equal lefts to avoid duplicate triplets.', 'O(n²) time, sorting in place.'],
    solution: threeSumCode, traceId: 'linear:trace:three-sum',
    pitfalls: ['Duplicate triplets', 'All zeros [0,0,0,0]'],
  },
  {
    id: 'linear:problem:rotated-search', lc: 33, title: 'Search in Rotated Sorted Array', difficulty: 'Medium', google: true,
    skills: ['binary-search'], pattern: 'Modified binary search', ds: ['array'],
    constraints: '1 ≤ n ≤ 5000, distinct values, O(log n) required', time: 'O(log n)', space: 'O(1)',
    insight: 'One half around mid is always sorted; test target against that half.',
    signals: ['rotated', 'sorted', 'O(log n)'],
    narration: ['O(log n) requirement → binary search.', 'Rotation breaks global order, but one side of mid is sorted.', 'If nums[left] ≤ nums[mid], left half is sorted.', 'Check if target is inside the sorted half, else go to the other.', 'O(log n) time, O(1) space.'],
    solution: rotatedCode, traceId: 'linear:trace:rotated-search',
    pitfalls: ['Use <= in nums[left] <= nums[mid] for 2-element ranges', 'Strict vs inclusive range checks'],
  },
  {
    id: 'linear:problem:trapping-rain', lc: 42, title: 'Trapping Rain Water', difficulty: 'Hard', google: true,
    skills: ['two-pointers', 'prefix-sum'], pattern: 'Two pointers with running max', ds: ['array'],
    constraints: '1 ≤ n ≤ 2·10^4', time: 'O(n)', space: 'O(1)',
    insight: 'water[i] = min(maxLeft, maxRight) − height[i]; settle the side with smaller max.',
    signals: ['trap', 'elevation map', 'water'],
    narration: ['Water above a bar is min of tallest left and right walls minus its height.', 'Prefix/suffix max arrays give O(n) time, O(n) space.', 'Two pointers: the side with the smaller max is already determined.', 'Move it, update its max, add water.', 'O(n) time, O(1) space.'],
    solution: trapCode, traceId: 'linear:trace:trapping-rain',
  },
  {
    id: 'linear:problem:group-anagrams', lc: 49, title: 'Group Anagrams', difficulty: 'Medium', google: true,
    skills: ['arrays-hashing'], pattern: 'Hash by canonical key', ds: ['hashmap'],
    constraints: '1 ≤ n ≤ 10^4, word length ≤ 100', time: 'O(n · m log m)', space: 'O(n · m)',
    insight: 'Anagrams share a sorted-letters key.',
    signals: ['group', 'anagrams', 'rearrange letters'],
    narration: ['Anagrams are equal after sorting their letters.', 'Use that as a dict key, bucket words with dd(list).', 'Key must be hashable: tuple or joined string.', 'O(n · m log m); a 26-count key makes it O(n · m).'],
    solution: `from collections import defaultdict as dd

class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        groups = dd(list)

        for word in strs:
            groups[tuple(sorted(word))].append(word)

        return list(groups.values())`,
  },
  {
    id: 'linear:problem:max-subarray', lc: 53, title: 'Maximum Subarray', difficulty: 'Medium', google: true,
    skills: ['greedy', 'dp-1d'], pattern: "Kadane's", ds: ['array'],
    constraints: '1 ≤ n ≤ 10^5', time: 'O(n)', space: 'O(1)',
    insight: 'Drop the running sum when it would hurt; start fresh at x.',
    signals: ['contiguous subarray', 'largest sum'],
    narration: ['n up to 10^5, so O(n) or O(n log n).', 'At each x: extend the previous subarray or start new.', 'curr = max(x, curr + x), best tracks the max.', 'O(n) time, O(1) space.'],
    solution: `class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        curr = best = nums[0]

        for num in nums[1:]:
            curr = max(num, curr + num)
            best = max(best, curr)

        return best`,
    pitfalls: ['All negative: initialize with nums[0], not 0'],
  },
  {
    id: 'linear:problem:jump-game', lc: 55, title: 'Jump Game', difficulty: 'Medium', google: true,
    skills: ['greedy'], pattern: 'Greedy reach', ds: ['array'],
    constraints: '1 ≤ n ≤ 10^4', time: 'O(n)', space: 'O(1)',
    insight: 'Track the farthest reachable index; fail if you step past it.',
    signals: ['can you reach', 'max jump length'],
    narration: ['DP over indices would be O(n²).', 'Greedy: keep the farthest index reachable so far.', 'If i exceeds it, i is unreachable.', 'O(n) time, O(1) space.'],
    solution: `class Solution:
    def canJump(self, nums: List[int]) -> bool:
        farthest = 0

        for i in range(len(nums)):
            if i > farthest:
                return False
            farthest = max(farthest, i + nums[i])

        return True`,
  },
  {
    id: 'linear:problem:min-window', lc: 76, title: 'Minimum Window Substring', difficulty: 'Hard', google: true,
    skills: ['sliding-window', 'arrays-hashing'], pattern: 'Variable window, shortest valid', ds: ['hashmap'],
    constraints: '1 ≤ |s|, |t| ≤ 10^5', time: 'O(|s| + |t|)', space: 'O(alphabet)',
    insight: 'Expand until have == need, then shrink while valid, recording the best.',
    signals: ['minimum window', 'contains all characters', 'substring'],
    narration: ['Clarify: duplicates in t count? Yes.', 'Shortest valid substring → window that shrinks while valid.', 'countT for requirements, window counts, have/need for O(1) validity.', 'Record inside the shrink loop.', 'Linear: each pointer moves at most |s| times.'],
    solution: minWindowCode, traceId: 'linear:trace:min-window',
    pitfalls: ['t longer than s', 'Counting have on every increment instead of exact match'],
  },
  {
    id: 'linear:problem:longest-consecutive', lc: 128, title: 'Longest Consecutive Sequence', difficulty: 'Medium', google: true,
    skills: ['arrays-hashing'], pattern: 'Set + sequence starts', ds: ['set'],
    constraints: '0 ≤ n ≤ 10^5, O(n) required', time: 'O(n)', space: 'O(n)',
    insight: 'Only count upward from numbers whose predecessor is missing.',
    signals: ['consecutive', 'unsorted', 'O(n)'],
    narration: ['Sorting is O(n log n), but they want O(n).', 'Set for O(1) membership.', 'Start counting only at x where x − 1 is absent.', 'Each number walked once overall: O(n).'],
    solution: consecutiveCode, traceId: 'linear:trace:longest-consecutive',
  },
  {
    id: 'linear:problem:product-except-self', lc: 238, title: 'Product of Array Except Self', difficulty: 'Medium', google: true,
    skills: ['prefix-sum', 'arrays-hashing'], pattern: 'Prefix and suffix products', ds: ['array'],
    constraints: '2 ≤ n ≤ 10^5, no division', time: 'O(n)', space: 'O(1) extra',
    insight: 'Answer = product of everything left × everything right.',
    signals: ['except self', 'without division'],
    narration: ['No division, so build it from prefix and suffix products.', 'Left pass: output[i] = product of nums before i.', 'Right pass: multiply by a running suffix.', 'O(n) time, O(1) extra besides output.'],
    solution: `class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        output = [1] * len(nums)

        for i in range(1, len(nums)):
            output[i] = output[i - 1] * nums[i - 1]

        suffix = 1
        for i in range(len(nums) - 2, -1, -1):
            suffix *= nums[i + 1]
            output[i] *= suffix

        return output`,
    pitfalls: ['Zeros make division fail'],
  },
  {
    id: 'linear:problem:char-replacement', lc: 424, title: 'Longest Repeating Character Replacement', difficulty: 'Medium', google: true,
    skills: ['sliding-window', 'arrays-hashing'], pattern: 'Variable window with max frequency', ds: ['hashmap'],
    constraints: '1 ≤ n ≤ 10^5, uppercase letters', time: 'O(n)', space: 'O(26)',
    insight: 'Valid while window size − maxFreq ≤ k.',
    signals: ['replace at most k', 'longest', 'same letter'],
    narration: ['Contiguous + longest + rule → sliding window.', 'Chars to replace = size − count of most common char.', 'Shrink while that exceeds k.', 'maxFreq never needs to decrease for the answer to stay right.', 'O(n) time, O(26) space.'],
    solution: `class Solution:
    def characterReplacement(self, s: str, k: int) -> int:
        count = {}
        left = maxFreq = longest = 0

        for right in range(len(s)):
            count[s[right]] = count.get(s[right], 0) + 1
            maxFreq = max(maxFreq, count[s[right]])

            while (right - left + 1) - maxFreq > k:
                count[s[left]] -= 1
                left += 1

            longest = max(longest, right - left + 1)

        return longest`,
  },
  {
    id: 'linear:problem:subarray-sum-k', lc: 560, title: 'Subarray Sum Equals K', difficulty: 'Medium', google: true,
    skills: ['prefix-sum', 'arrays-hashing'], pattern: 'Prefix sum + hashmap', ds: ['hashmap'],
    constraints: '1 ≤ n ≤ 2·10^4, −1000 ≤ nums[i] ≤ 1000', time: 'O(n)', space: 'O(n)',
    insight: 'Count earlier prefixes equal to prefix − k.',
    signals: ['subarrays', 'sum equals k', 'negatives allowed', 'count'],
    narration: ['Negatives rule out a sliding window.', 'sum(i..j) = prefix[j] − prefix[i−1].', 'Map prefix → count, seeded {0: 1}.', 'Add count[prefix − k] before recording prefix.', 'O(n) time, O(n) space.'],
    solution: subarraySumCode, traceId: 'linear:trace:subarray-sum-k',
    pitfalls: ['Missing {0: 1} seed', 'Inserting before counting when k = 0'],
  },
  {
    id: 'linear:problem:binary-search', lc: 704, title: 'Binary Search', difficulty: 'Easy', google: false,
    skills: ['binary-search'], pattern: 'Closed-interval binary search', ds: ['array'],
    constraints: '1 ≤ n ≤ 10^4, sorted, distinct', time: 'O(log n)', space: 'O(1)',
    insight: 'Halve [left, right] each step; stop when they cross.',
    signals: ['sorted', 'find target', 'O(log n)'],
    narration: ['Sorted input → binary search.', 'Closed interval, loop while left <= right.', 'Move left = mid + 1 or right = mid − 1, never mid.', 'O(log n) time.'],
    solution: binarySearchCode, traceId: 'linear:trace:binary-search',
  },
  {
    id: 'linear:problem:koko', lc: 875, title: 'Koko Eating Bananas', difficulty: 'Medium', google: true,
    skills: ['binary-search', 'constraints'], pattern: 'Binary search on answer', ds: ['array'],
    constraints: 'n ≤ 10^4, piles[i] ≤ 10^9, n ≤ h ≤ 10^9', time: 'O(n log max)', space: 'O(1)',
    insight: 'If speed k works, every faster speed works: monotonic → binary search k.',
    signals: ['minimum speed', 'within h hours', 'values up to 10^9'],
    narration: ['Answer lies in 1..max(piles); trying all is too slow.', 'Feasibility is monotonic in k.', 'Binary search k; hours = sum of ceil(pile / k).', 'Feasible: save and go lower. Else go higher.', 'O(n log max(piles)).'],
    solution: kokoCode, traceId: 'linear:trace:koko',
    pitfalls: ['Float ceil precision: use (p + k − 1) // k', 'Lower bound is 1, not 0'],
  },
]

export default {
  id: 'linear',
  title: 'Arrays, Hashing, Pointers & Binary Search',
  icon: 'target',
  skills: ['arrays-hashing', 'two-pointers', 'sliding-window', 'prefix-sum', 'binary-search', 'greedy'],
  lessons,
  traces,
  flashcards,
  mcqs,
  clozes,
  parsons,
  problems,
}
