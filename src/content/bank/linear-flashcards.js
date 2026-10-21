const AH = ['arrays-hashing']
const TP = ['two-pointers']
const SW = ['sliding-window']
const PS = ['prefix-sum']
const BS = ['binary-search']
const BSC = ['binary-search', 'constraints']
const ST = ['stack']
const IV = ['intervals']
const HP = ['heap']
const GR = ['grid']
const MT = ['math']
const BIT = ['bit']

const cardData = [
  [AH, 'Two Sum: best approach and complexity?', 'A hashmap of value → index, one pass. O(n) time, O(n) space.'],
  [AH, 'Why use defaultdict(list) over a plain dict for grouping?', 'It auto-creates an empty list on first access, avoiding a manual "if key not in d" check before appending.'],
  [AH, 'Counter(nums).most_common(k) returns?', 'A list of the k (value, count) pairs with the highest counts, ordered by count descending.'],
  [AH, 'Fastest way to check two strings are anagrams?', 'Counter(s) == Counter(t), O(n). Sorting both strings works too but costs O(n log n).'],
  [AH, 'Majority Element (> n/2 occurrences), O(n) time and O(1) space?', 'Boyer–Moore voting: increment on a match, decrement on a mismatch, reset the candidate whenever count hits 0.'],
  [AH, 'Why can a Python list never be a dict key?', 'Lists are mutable and unhashable. Use a tuple instead, e.g. tuple(sorted(word)).'],
  [AH, 'Single Number (every value twice except one), O(1) space?', 'XOR every element together — x ^ x = 0 cancels each pair, leaving only the lone value.'],
  [AH, 'Top K Frequent in true O(n), not O(n log k)?', 'Counter, then bucket sort by frequency (bucket index = count); read buckets from high to low.'],
  [AH, 'Longest Consecutive Sequence in O(n) — why not just sort?', 'Sorting is O(n log n). Put values in a set instead, and only extend a run from numbers whose predecessor (num − 1) is missing.'],
  [AH, 'Encode/decode a list of strings: why not join with commas?', 'A string in the list could itself contain a comma. Length-prefix each string instead, e.g. "5#hello".'],
  [AH, 'Max-length subarray of equal 0s and 1s — the trick?', "Treat each 0 as −1; 'equal 0s and 1s' becomes 'subarray sums to 0', solved with prefix sums + a hashmap of first-seen index."],
  [AH, 'Bug: "seen = []" then "if n in seen" inside a loop over n values. Problem?', '"x in list" is O(n), so the whole loop becomes O(n²). Swap the list for a set.'],
  [AH, 'Group Anagrams: sorted-string key vs. 26-count-tuple key, complexity?', 'Sorted key costs O(w · L log L). A count-vector key costs O(w · L), skipping the sort.'],
  [AH, "Dict keys must be hashable. Which works for a 2D coordinate?", "(r, c) — a tuple. Lists, sets, and dicts can't be dict keys."],
  [AH, 'After "d[num] = i" runs in a loop with a repeated value, what survives in d?', 'The LAST index where that value appeared — each iteration overwrites the previous entry.'],

  [TP, 'Two Sum II on a SORTED array — why two pointers over a hashmap?', 'O(n) time, O(1) space. A hashmap also works but costs O(n) extra space, which sortedness lets you skip.'],
  [TP, 'Container With Most Water: which pointer moves when heights[left] < heights[right]?', 'left — the shorter wall caps the area regardless, so only moving it has any chance of improving things.'],
  [TP, 'Valid Palindrome II (delete at most one char): on a mismatch, what do you try?', 'Check whether skipping the left character or skipping the right character leaves a palindrome.'],
  [TP, 'Move Zeroes in place, O(n) time, O(1) space — pattern?', 'Same-direction two pointers: a slow write pointer places every nonzero value fast finds as it scans ahead.'],
  [TP, 'Why sort before using two pointers from both ends (3Sum, Two Sum II)?', 'So moving a pointer has a predictable effect on the sum — a larger index always means a larger or equal value.'],
  [TP, "Floyd's cycle detection complexity?", 'O(n) time, O(1) space — fast and slow pointers meet inside a cycle without any extra memory.'],
  [TP, 'Sort Colors (values 0, 1, 2 only), one pass — how many pointers?', 'Three: low, mid, high (the Dutch National Flag partition).'],
  [TP, '3Sum: why skip duplicate values of nums[i] and nums[left] after recording a hit?', 'To avoid emitting the same triplet twice — the array is sorted, so equal adjacent values would otherwise repeat it.'],
  [TP, 'Merging two sorted arrays in place (room at the end of nums1) — which direction do you fill?', 'From the back. Placing the larger of the two tails first avoids overwriting values you have not read yet.'],
  [TP, 'Trapping Rain Water with two pointers instead of prefix/suffix max arrays — space saved?', 'O(n) extra space drops to O(1): two running maxes replace two full arrays.'],
  [TP, "Is Subsequence(s, t): when does s's pointer advance?", "Only on a match. t's pointer always advances — you are scanning all of t regardless."],
  [TP, '4Sum via a nested loop plus two pointers: overall time complexity?', 'O(n³) — O(n²) for the pair of fixed indices, times O(n) for the two-pointer scan on the rest.'],
  [TP, 'Reversing a string in place with two pointers — cost?', 'O(n) time, O(1) extra space: swap characters from both ends moving inward.'],
  [TP, 'Linked List Cycle detection in O(1) space — why not a hash set of visited nodes?', 'A hash set also detects cycles correctly but costs O(n) space; Floyd\'s two pointers get the same answer in O(1).'],

  [SW, 'Minimum Size Subarray Sum ≥ target, all positive values — pattern and time?', 'Variable sliding window, O(n): the sum only grows as right advances and only shrinks as left advances.'],
  [SW, 'Longest Repeating Character Replacement: window validity condition?', 'windowSize − maxFreqInWindow ≤ k.'],
  [SW, "Why doesn't maxFreq need to decrease when the window shrinks (char replacement)?", 'A stale, too-high maxFreq can only make the window look invalid sooner — it can never falsely report a new best length.'],
  [SW, 'Sliding Window Maximum in O(n) — data structure?', 'A monotonic decreasing deque of indices; the front of the deque is always the current window max.'],
  [SW, 'Permutation in String: why does a fixed-size window work here?', "Any permutation of s1 has exactly len(s1) characters, so a window of that fixed length can compare counts directly."],
  [SW, 'Minimum Window Substring: why track have/need counters instead of comparing two full dicts?', 'have == need is an O(1) check; recomputing whether two frequency maps fully match each step would cost O(alphabet).'],
  [SW, 'Longest substring with at most k distinct characters — what actually triggers a shrink?', 'The count of DISTINCT characters currently in the window exceeding k, not the window\'s raw size.'],
  [SW, 'Bug: using "if s[right] in window: ... left += 1" instead of "while". What breaks?', 'A single "if" only removes one character; if the duplicate sits further inside the window, it can still be invalid afterward.'],
  [SW, 'A fixed-size window of size k slid across n elements — total time?', 'O(n): each slide does O(1) work, adding one element and dropping one.'],
  [SW, 'When does a plain sliding window approach break down entirely?', 'When negative numbers are allowed — growing the window can shrink the running sum, so there\'s no reliable direction to shrink or grow in.'],
  [SW, "Does a sliding window ever need to restart entirely from right + 1 after becoming invalid?", 'No — it shrinks from the left until valid again; the window never resets and rebuilds from scratch.'],

  [PS, 'Prefix sum array convention: why a leading extra 0?', 'So sum(0..i) is always prefix[i+1] − prefix[0], with no special case needed for i = 0.'],
  [PS, 'Subarray Sum Equals K: why seed prefixCount with {0: 1}?', 'So a subarray starting at index 0 that already sums to k gets counted — its prefix minus k hits that "empty prefix" entry.'],
  [PS, 'Product of Array Except Self without division — technique?', 'A left-to-right prefix-product pass, then a right-to-left suffix-product pass multiplied in.'],
  [PS, 'Count subarrays divisible by k, negatives allowed — key insight?', 'Two prefix sums sharing the same remainder mod k mean the subarray between them is itself divisible by k.'],
  [PS, '2D Range Sum Query with many repeated queries — what do you precompute?', 'A 2D prefix sum table: O(rows · cols) to build, O(1) per query via inclusion-exclusion over the four corners.'],
  [PS, 'The "difference array" technique is for?', 'Applying many range "add v to every index in [l, r]" updates in O(1) each, then recovering the final array with one prefix-sum pass.'],
  [PS, 'Find Pivot Index — fastest approach?', 'Track a running leftSum and compare it against total − leftSum − current, all in one O(n) pass.'],
  [PS, 'A prefix XOR array answers "XOR of subarray [i, j]" in?', 'O(1): prefixXor[j+1] ^ prefixXor[i], since XOR is its own inverse, the same trick as prefix sums.'],
  [PS, 'Random Pick with Weight combines prefix sums with?', 'Binary search (bisect) to map a random draw to the right weighted bucket in O(log n).'],
  [PS, 'Running Sum of a 1D array — in-place update formula?', 'nums[i] += nums[i - 1] for i from 1 onward: a prefix sum built directly in the array.'],

  [BS, 'Classic closed-interval binary search loop condition?', 'while left <= right, with mid = (left + right) // 2.'],
  [BS, 'bisect_left vs. bisect_right on a sorted list — difference?', 'bisect_left finds the first position ≥ x; bisect_right finds the first position > x. Their difference is the count of x in the list.'],
  [BS, 'Find Minimum in Rotated Sorted Array: nums[mid] > nums[right] means?', 'The minimum sits strictly right of mid, so left = mid + 1.'],
  [BSC, 'Binary search on the answer — what must the feasibility check be?', 'Monotonic: once a candidate works, every candidate further in the same direction keeps working too.'],
  [BSC, "Koko Eating Bananas: why doesn't the search space start at 0?", 'A speed of 0 can never finish any nonempty pile — infinite hours needed, so it is never feasible.'],
  [BSC, 'Capacity To Ship Packages Within D Days — correct lower and upper bounds?', 'Lower: max(weights), since the ship must carry the single heaviest package. Upper: sum(weights), one day for everything.'],
  [BS, 'Search in Rotated Sorted Array: how do you know which half around mid is sorted?', 'Compare nums[left] to nums[mid]: if nums[left] ≤ nums[mid], the left half is sorted.'],
  [BS, 'Find Peak Element: when nums[mid] < nums[mid + 1], which way do you search?', 'Right — an ascending step guarantees a peak exists somewhere further in that direction.'],
  [BS, 'Find First and Last Position of a target — approach?', 'Two binary searches: bisect_left gives the first index, bisect_right − 1 gives the last.'],
  [BS, 'Median of Two Sorted Arrays in O(log(min(m, n))) — core idea?', 'Binary search a partition point in the smaller array so the left/right halves across both arrays balance in size.'],
  [BS, "A fully sorted matrix (each row's first element exceeds the previous row's last) — search approach?", 'Treat it as one flattened sorted array and binary search with index math: mid // cols, mid % cols.'],

  [AH, 'Fastest O(n) check that two strings are anagrams?', 'Counter(s) == Counter(t) after confirming equal lengths.'],
  [ST, 'Valid Parentheses — natural data structure?', 'A stack: push opening brackets, and on a closing bracket pop and check it matches.'],
  [TP, 'Longest Palindromic Substring via expand-around-center — why check both odd and even centers?', 'A palindrome can be centered on a single character (odd length) or between two characters (even length).'],
  [ST, 'Decode String ("3[a2[c]]") — what does the stack hold?', 'Pairs of (string-so-far, repeat-count), pushed on "[" and popped-and-repeated on "]".'],
  [AH, 'Roman to Integer: when is a numeral subtracted instead of added?', 'When it sits directly before a strictly larger numeral, e.g. the I in IV.'],
  [AH, 'Reverse Words in a String — simplest Python idiom?', "' '.join(reversed(s.split())) — split() with no arguments already collapses extra whitespace."],
  [AH, 'Group Shifted Strings — what key groups strings together?', 'The sequence of (letter[i+1] − letter[i]) mod 26 differences between consecutive characters.'],
  [TP, 'Expand-around-center complexity for Longest Palindromic Substring?', 'O(n²): O(n) possible centers, each expanding up to O(n) characters in the worst case.'],
  [ST, 'Why might a careless bracket matcher wrongly accept "([)]"?', 'If it only checks bracket membership instead of comparing the stack top against the specific matching open bracket.'],
  [AH, 'Implementing atoi (string to integer) — what must it handle, and what can it skip?', 'Leading/trailing whitespace, an optional sign, digits until the first non-digit, and 32-bit clamping — never scientific notation.'],

  [IV, 'Merge Intervals — essential first step?', 'Sort by start time; any interval that could merge with the current group is then guaranteed to appear immediately next.'],
  [IV, 'Non-overlapping Intervals (minimum removals) — greedy key?', 'Sort by END time; at each conflict, keep whichever interval ends earliest.'],
  [IV, 'Meeting Rooms II — minimum rooms needed?', 'Sweep sorted start/end times (or use a min-heap of end times), tracking how many meetings are simultaneously active.'],
  [IV, 'Two intervals [a, b] and [c, d] overlap exactly when?', 'a ≤ d and c ≤ b.'],
  [IV, 'Minimum Arrows to Burst Balloons — sort key?', 'Sort by end coordinate; fire a new arrow whenever the next balloon starts after the current arrow position.'],
  [IV, 'Insert Interval into an already sorted, non-overlapping list — complexity?', 'O(n): one linear pass, since the existing list is already sorted and never needs a full re-sort.'],
  [IV, 'Interval List Intersections: which pointer advances after recording an overlap?', 'Whichever interval ends first — it is exhausted and cannot contribute to any further intersection.'],
  [IV, 'Binary-searching sorted, non-overlapping intervals for the one containing a point — complexity?', 'O(log n) via bisect on the interval start times.'],

  [HP, 'Kth Largest Element, streaming data — fastest practical approach?', 'A size-k min-heap: push each value, pop when the size exceeds k. O(n log k).'],
  [AH, "Merge sort's time complexity, and why?", 'O(n log n): log n levels of splitting, with O(n) merge work done at every level.'],
  [AH, 'Quicksort\'s worst case of O(n²) happens when?', 'The pivot is consistently the smallest or largest remaining element, e.g. a first-element pivot on already-sorted input.'],
  [AH, 'Largest Number (arrange values to form the largest concatenation) — comparator?', 'Compare a+b against b+a as strings; put a before b whenever a+b is the larger string.'],
  [HP, 'K Closest Points to Origin, large n and small k — approach?', 'A bounded max-heap of size k (or quickselect), O(n log k), instead of sorting all n distances.'],
  [HP, 'Merge k Sorted Lists with a heap — why include the list index in the heap tuple?', "So two equal-valued nodes never get compared directly — raw ListNode objects aren't comparable in Python."],
  [AH, 'bisect.insort(sortedList, x) cost?', 'O(n): O(log n) to find the insertion point, O(n) to physically shift elements and make room.'],
  [HP, 'heapify(list) vs. n separate heappush calls — which is faster to build a heap?', 'heapify is O(n); n individual pushes cost O(n log n).'],
  [AH, 'Insert into a sorted list while keeping it sorted, using bisect — cost?', 'O(log n) to find the index, O(n) to actually insert, since a Python list still shifts elements over.'],

  [GR, 'Rotate Image 90° clockwise in place — two-step trick?', 'Transpose the matrix (swap across the diagonal), then reverse each row.'],
  [GR, 'Spiral Matrix traversal order?', 'Right across the top, down the right side, left across the bottom, up the left side, shrinking the boundary each lap.'],
  [GR, 'Set Matrix Zeroes in O(1) extra space — technique?', "Use the matrix's own first row and first column as marker flags for which rows and columns need zeroing."],
  [GR, "Search a 2D Matrix II (rows and columns each sorted, but rows don't chain globally) — approach?", 'Start at the top-right corner; move left when too big, move down when too small. O(rows + cols).'],
  [GR, 'Number of Islands — algorithm?', 'BFS or DFS flood-fill from every unvisited land cell, marking cells visited as you go, counting one island per fill.'],
  [GR, 'A full BFS/DFS flood-fill over an r × c grid runs in?', 'O(r · c): every cell is visited and processed at most once.'],
  [GR, "Game of Life: why not update cells in place using already-updated neighbor values?", "Every cell's next state depends only on the PREVIOUS generation's neighbors — reading an updated neighbor mixes two generations."],
  [GR, 'Word Search — why temporarily mark a visited cell instead of keeping a separate visited set?', 'It avoids O(r · c) extra memory: mark the cell, recurse, then unmark it before returning (classic backtracking).'],
  [GR, 'Diagonal Traverse (zigzag over every diagonal of a matrix) — what alternates?', 'The direction traveled along each diagonal, up-right vs. down-left, based on whether the diagonal index is even or odd.'],

  [MT, 'Pow(x, n) via fast exponentiation — complexity?', 'O(log n): square the base and halve the exponent each round.'],
  [MT, 'Sieve of Eratosthenes — complexity?', 'O(n log log n), nearly linear, since the sum of 1/p over primes p ≤ n converges very slowly.'],
  [MT, "GCD via the Euclidean algorithm — complexity?", 'O(log(min(a, b))).'],
  [BIT, 'Power of Two check — idiomatic bit trick?', 'n > 0 and (n & (n - 1)) == 0. A power of two has exactly one bit set, and subtracting 1 flips every bit below it.'],
  [BIT, 'Single Number II (every value three times except one) — does plain XOR still work?', 'No. XOR-ing a value three times returns the original value, not zero. Track bits seen once vs. twice (mod 3) instead.'],
  [MT, "Why does Python's Reverse Integer problem need an explicit overflow check, when Python ints never overflow?", 'The PROBLEM itself defines a 32-bit signed range and asks you to return 0 outside it, even though Python would compute the exact value.'],
  [MT, 'Counting trailing zeroes in n! — what do you actually count?', 'Factors of 5 among 1..n. Factors of 2 are always more plentiful, so 5s are the real bottleneck.'],
  [MT, 'Happy Number — how do you detect it will never reach 1?', 'A seen-set (or explicit cycle detection) catches the repeating cycle instead of looping forever.'],
  [MT, 'The 3-argument built-in pow(base, exp, mod) — benefit?', 'Computes (base ** exp) % mod efficiently via modular reduction at each squaring step, never building the full huge intermediate value.'],
  [MT, 'Sieve-based primality vs. trial division to √n for a single number — when would you pick which?', 'Sieve when you need many queries up to n (precompute once). Trial division to √n for a one-off check on a single number.'],
]

export default cardData.map(([skills, front, back, code], i) => ({
  id: `bank-linear:card:${i + 1}`, skills, front, back, ...(code ? { code } : {}),
}))
