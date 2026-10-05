const statements = [
  {
    id: 'statements-a:lc4',
    lc: 4,
    title: 'Median of Two Sorted Arrays',
    difficulty: 'Hard',
    statement: `A monitoring service keeps two independent feeds of latency readings. Each feed is produced by its own collector, and each collector already hands you its numbers sorted from smallest to largest before you ever see them. The two feeds are never merged on disk, so you are looking at two separate sorted arrays, nums1 and nums2, and their lengths can differ a lot, including the case where one of them is completely empty while the other is not.

Your job is to report back the median latency as if the two feeds had been combined into a single sorted sequence, without ever actually building that combined sequence in memory. Remember that the median of an even number of values is the average of the two values sitting exactly in the middle once everything is sorted, while for an odd count it is simply the one value sitting in the middle.

A reviewer on the team points out that merging both arrays and then sorting, or even just merging two already-sorted arrays with a linear walk, is the obvious first answer, but that runs in linear time in the combined size and they specifically do not want that here. The agreed target the team wrote into the design doc is O(log (m + n)) using the two sizes m and n, which means your solution has to search its way to the answer instead of scanning every element.`,
    examples: [
      { input: 'nums1 = [1,3], nums2 = [2]', output: '2.00000', explanation: 'Merged conceptually the values are [1,2,3]; the single middle value is 2.' },
      { input: 'nums1 = [1,2], nums2 = [3,4]', output: '2.50000', explanation: 'Merged conceptually the values are [1,2,3,4]; the median is the average of the two middle values 2 and 3.' },
      { input: 'nums1 = [], nums2 = [1]', output: '1.00000', explanation: 'One feed is empty, so the median is just the only value in the other feed.' },
    ],
    constraints: ['nums1.length == m', 'nums2.length == n', '0 <= m <= 1000', '0 <= n <= 1000', '1 <= m + n <= 2000', '-10^6 <= nums1[i], nums2[i] <= 10^6', 'nums1 and nums2 are each sorted in non-decreasing order'],
    followUp: 'What would change if the two feeds were too large to fit in memory and you could only stream them forward once?',
    signature: { kind: 'function', className: 'Solution', method: 'findMedianSortedArrays', params: [['nums1', 'List[int]'], ['nums2', 'List[int]']], returns: 'float' },
    signals: [
      { phrase: 'O(log (m + n))', means: 'linear merge is too slow, binary search required' },
      { phrase: 'sorted in non-decreasing order', means: 'both inputs already sorted, no need to sort again' },
      { phrase: 'median', means: 'need middle value(s), careful with even vs odd total' },
      { phrase: 'one of them is completely empty', means: 'must handle a zero-length array safely' },
    ],
    keyInfo: { input: 'two sorted arrays, possibly very different lengths', output: 'single float median of the merged set', target: 'O(log min(m,n)) because a full merge is explicitly disallowed' },
    pattern: 'Binary search the partition',
    ds: ['array'],
    time: 'O(log min(m, n))',
    space: 'O(1)',
    edgeCases: ['one array is empty', 'arrays of very different sizes', 'all values in one array smaller than all values in the other', 'total length is odd vs even', 'duplicate values across both arrays'],
    skills: ['binary-search', 'arrays-hashing', 'constraints'],
  },
  {
    id: 'statements-a:lc3',
    lc: 3,
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    statement: `A product analyst is scanning raw event strings that get logged by a web client, and wants to find, for quality purposes, the longest stretch of a given string where every character is distinct, with nothing repeated. The input string s may contain letters, digits, punctuation symbols, and even plain spaces, so you cannot assume it is restricted to a small alphabet.

To be precise about what counts: a substring has to be a contiguous run of characters taken directly from s, not some rearranged subsequence pulled from scattered positions. The analyst only cares about the length of the longest such run, not about printing the run itself, and if the string is empty the expected answer is simply zero.

They mention offhand that they already tried generating every possible substring and checking each one with a set, but that approach got noticeably slow once the input strings grew past a few thousand characters, so they are hoping for something closer to linear time over the length of s.`,
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"', output: '1', explanation: 'The answer is "b", with the length of 1.' },
      { input: 's = "pwwkew"', output: '3', explanation: 'The answer is "wke", with the length of 3. Note that "pwke" is a subsequence, not a substring.' },
    ],
    constraints: ['0 <= s.length <= 5 * 10^4', 's consists of English letters, digits, symbols and spaces'],
    signature: { kind: 'function', className: 'Solution', method: 'lengthOfLongestSubstring', params: [['s', 'str']], returns: 'int' },
    signals: [
      { phrase: 'contiguous run of characters', means: 'substring, not subsequence, so a sliding window applies' },
      { phrase: 'every character is distinct', means: 'window must track characters already inside it' },
      { phrase: 'closer to linear time over the length of s', means: 'O(n) target, not O(n^2) or O(n^3) brute force' },
      { phrase: 'if the string is empty', means: 'edge case returning 0' },
    ],
    keyInfo: { input: 'one string s, any printable characters', output: 'single integer, the longest unique-char run length', target: 'O(n) because n can be up to 5*10^4' },
    pattern: 'Sliding window + last-seen map',
    ds: ['hashmap'],
    time: 'O(n)',
    space: 'O(min(n, charset))',
    edgeCases: ['empty string', 'all identical characters', 'all characters already unique', 'repeats right at the start vs right at the end', 'spaces and symbols mixed in'],
    skills: ['sliding-window', 'arrays-hashing'],
  },
  {
    id: 'statements-a:lc15',
    lc: 15,
    title: '3Sum',
    difficulty: 'Medium',
    statement: `You are handed a flat list of integers, nums, which can include negative numbers, positive numbers, and zeros in any order, with no guarantee it starts out sorted. The task sounds simple at first: find every way to pick three distinct positions in the array whose values add up to exactly zero.

There is a catch that trips a lot of people up during the interview: the answer should be a list of value triplets, not a list of index triplets, and critically, the same triplet of values must never show up twice in your output even if it could be built from different index combinations. So if the array contains repeated numbers, you are responsible for recognizing that two different index choices produced the same triplet and only keeping one copy.

The size of nums can reach the low thousands, which rules out the most naive approach of trying every combination of three indices directly, since that blows up cubically. The team wants something that comfortably handles that upper bound without timing out, and they are fine with modifying the input array in place if it helps, since nobody downstream needs the original order preserved.`,
    examples: [
      { input: 'nums = [-1,0,1,2,-1,-4]', output: '[[-1,-1,2],[-1,0,1]]', explanation: 'Distinct value triplets that sum to 0, with duplicate triplets removed even though -1 appears twice in the input.' },
      { input: 'nums = [0,1,1]', output: '[]', explanation: 'No three values here can sum to 0.' },
      { input: 'nums = [0,0,0]', output: '[[0,0,0]]', explanation: 'All three zeros sum to 0, and only one copy of this triplet is kept.' },
    ],
    constraints: ['3 <= nums.length <= 3000', '-10^5 <= nums[i] <= 10^5'],
    signature: { kind: 'function', className: 'Solution', method: 'threeSum', params: [['nums', 'List[int]']], returns: 'List[List[int]]' },
    signals: [
      { phrase: 'three distinct positions', means: 'no reusing the same index twice' },
      { phrase: 'must never show up twice in your output', means: 'need a dedupe strategy for triplets' },
      { phrase: 'low thousands', means: 'n up to 3000, O(n^2) is acceptable, O(n^3) is not' },
      { phrase: 'fine with modifying the input array in place', means: 'sorting nums first is allowed' },
    ],
    keyInfo: { input: 'one unsorted array of up to 3000 ints', output: 'list of unique value triplets summing to 0', target: 'O(n^2) because n <= 3000 rules out O(n^3)' },
    pattern: 'Sort + two pointers',
    ds: ['array'],
    time: 'O(n^2)',
    space: 'O(1) extra (sort aside)',
    edgeCases: ['fewer than 3 usable non-zero values', 'all zeros', 'no valid triplet exists', 'many duplicate values', 'all positive or all negative values'],
    skills: ['two-pointers', 'constraints'],
  },
  {
    id: 'statements-a:lc33',
    lc: 33,
    title: 'Search in Rotated Sorted Array',
    difficulty: 'Medium',
    statement: `Picture an array that started out sorted in ascending order with all distinct values, no duplicates anywhere, but then got rotated at some unknown pivot point before it reached you. Concretely, rotating at index k means the array that used to look like [a0, a1, ..., an-1] now looks like [ak, ak+1, ..., an-1, a0, a1, ..., ak-1]. You are not told what k is, and k could even be zero, meaning the array might not actually be rotated at all.

Given this rotated array nums and an integer target, you need to return the index of target if it exists anywhere in the array, or -1 if it is nowhere to be found. The values are guaranteed distinct, which matters a lot for how you reason about which half of the array is still in sorted order at any point during your search.

Here is the part interviewers love to probe: a plain linear scan obviously works and is easy to write, but the problem explicitly expects you to do better than that, aiming for logarithmic time with respect to the length of nums, the same complexity class you would get on a normal, non-rotated sorted array.`,
    examples: [
      { input: 'nums = [4,5,6,7,0,1,2], target = 0', output: '4', explanation: 'The array was rotated at index 4; target 0 sits at index 4.' },
      { input: 'nums = [4,5,6,7,0,1,2], target = 3', output: '-1', explanation: '3 is not present anywhere in the rotated array.' },
      { input: 'nums = [1], target = 0', output: '-1', explanation: 'A single-element array that does not contain the target.' },
    ],
    constraints: ['1 <= nums.length <= 5000', '-10^4 <= nums[i] <= 10^4', 'all values of nums are unique', 'nums is guaranteed to be rotated at some pivot', '-10^4 <= target <= 10^4'],
    signature: { kind: 'function', className: 'Solution', method: 'search', params: [['nums', 'List[int]'], ['target', 'int']], returns: 'int' },
    signals: [
      { phrase: 'rotated at some unknown pivot point', means: 'not a plain sorted array, standard binary search breaks' },
      { phrase: 'all distinct values', means: 'no duplicate-handling edge cases to worry about' },
      { phrase: 'logarithmic time with respect to the length', means: 'O(log n) required, linear scan not acceptable' },
      { phrase: 'k could even be zero', means: 'array might not actually be rotated' },
    ],
    keyInfo: { input: 'rotated sorted array of distinct ints, a target', output: 'index of target or -1', target: 'O(log n) because linear scan is explicitly discouraged' },
    pattern: 'Binary search, find sorted half',
    ds: ['array'],
    time: 'O(log n)',
    space: 'O(1)',
    edgeCases: ['no rotation at all (k = 0)', 'single-element array', 'target equals nums[left] or nums[right] exactly', 'target not present', 'rotation point right in the middle'],
    skills: ['binary-search'],
  },
  {
    id: 'statements-a:lc410',
    lc: 410,
    title: 'Split Array Largest Sum',
    difficulty: 'Hard',
    statement: `A batch scheduler has a single array, nums, of non-negative workload sizes that must be processed strictly in order, and a fixed number of workers, k. The scheduler has to cut the array into exactly k contiguous, non-empty chunks, where every original element belongs to exactly one chunk and the order of elements within a chunk is preserved.

Each worker gets handed one chunk and takes time proportional to the sum of the workload sizes inside that chunk. Management does not care about the total time across all workers; they care about the worst single worker, the one who ends up with the heaviest chunk, because that worker determines when the whole batch finishes. Your job is to decide where the k-1 cut points go so that the heaviest chunk sum, across all k chunks, is as small as it can possibly be, and then report that minimized value.

It helps to notice something about the shape of this problem before writing any code: as you imagine raising or lowering a hypothetical cap on how large any single chunk is allowed to be, the number of chunks you would need to stay under that cap only moves in one direction. That monotonic relationship is usually the tell that you should be searching over possible answers rather than searching over where to place the cuts directly.`,
    examples: [
      { input: 'nums = [7,2,5,10,8], k = 2', output: '18', explanation: 'Splitting into [7,2,5] and [10,8] gives sums 14 and 18; 18 is the smallest possible largest sum.' },
      { input: 'nums = [1,2,3,4,5], k = 2', output: '9', explanation: 'Splitting into [1,2,3] and [4,5] gives sums 6 and 9, which is the best achievable split.' },
      { input: 'nums = [1,4,4], k = 3', output: '4', explanation: 'With k equal to the array length, each element is its own chunk, so the answer is the maximum single element.' },
    ],
    constraints: ['1 <= nums.length <= 1000', '0 <= nums[i] <= 10^6', '1 <= k <= min(50, nums.length)'],
    signature: { kind: 'function', className: 'Solution', method: 'splitArray', params: [['nums', 'List[int]'], ['k', 'int']], returns: 'int' },
    signals: [
      { phrase: 'as small as it can possibly be', means: 'minimize the maximum, classic binary-search-on-answer phrasing' },
      { phrase: 'k contiguous, non-empty chunks', means: 'splitting an array, order preserved, no reordering' },
      { phrase: 'That monotonic relationship', means: 'feasibility check is monotonic, enabling binary search' },
      { phrase: 'the worst single worker', means: 'objective is the max chunk sum, not the total' },
    ],
    keyInfo: { input: 'array of up to 1000 non-negative ints, split count k', output: 'minimum possible value of the largest chunk sum', target: 'O(n log(sum)) via binary search on the answer, not DP over splits directly' },
    pattern: 'Binary search on the answer',
    ds: ['array'],
    time: 'O(n log(sum))',
    space: 'O(1)',
    edgeCases: ['k equals 1 (one chunk, the whole array)', 'k equals nums.length (every element its own chunk)', 'all zeros', 'a single very large element forcing a high lower bound', 'array of length 1'],
    skills: ['binary-search', 'greedy', 'constraints'],
  },
  {
    id: 'statements-a:lc560',
    lc: 560,
    title: 'Subarray Sum Equals K',
    difficulty: 'Medium',
    statement: `An analytics engineer is looking at a sequence of daily net changes, nums, where "net change" can be positive, negative, or zero, since some days gain value and others lose it. The engineer wants to know how many contiguous stretches of consecutive days add up to exactly a target total k.

To be very clear about what "stretch" means here: it is any contiguous run nums[i..j] with i <= j, and two different runs are counted separately even if they happen to produce the exact same list of values, as long as they start or end at different positions. A single day by itself also counts as a valid stretch of length one.

Because the daily changes are allowed to be negative, the usual trick of growing and shrinking a window while watching the running total does not safely apply here, since adding more days does not monotonically move the running sum in one direction. The engineer has thousands of days of data and wants an answer that scans the data roughly once rather than checking every possible pair of start and end days.`,
    examples: [
      { input: 'nums = [1,1,1], k = 2', output: '2', explanation: 'The stretches [1,1] (indices 0-1) and [1,1] (indices 1-2) both sum to 2.' },
      { input: 'nums = [1,2,3], k = 3', output: '2', explanation: 'The stretch [1,2] and the single-day stretch [3] both sum to 3.' },
      { input: 'nums = [1,-1,0], k = 0', output: '3', explanation: 'The stretches [1,-1], [-1,0]... wait, only sums equal to 0 count: [1,-1] sums to 0, [0] sums to 0, and [1,-1,0] sums to 0, giving 3.' },
    ],
    constraints: ['1 <= nums.length <= 2 * 10^4', '-1000 <= nums[i] <= 1000', '-10^7 <= k <= 10^7'],
    signature: { kind: 'function', className: 'Solution', method: 'subarraySum', params: [['nums', 'List[int]'], ['k', 'int']], returns: 'int' },
    signals: [
      { phrase: 'contiguous stretches of consecutive days', means: 'subarray counting problem, not subsequence' },
      { phrase: 'allowed to be negative', means: 'sliding window alone cannot be used safely' },
      { phrase: 'scans the data roughly once', means: 'target is O(n), prefix sums plus a hashmap' },
      { phrase: 'two different runs are counted separately', means: 'count occurrences, not distinct sums' },
    ],
    keyInfo: { input: 'array of up to 2*10^4 ints (can be negative), target k', output: 'count of contiguous subarrays summing to k', target: 'O(n) via prefix sums in a hashmap since negatives break sliding window' },
    pattern: 'Prefix sum + hashmap of counts',
    ds: ['hashmap'],
    time: 'O(n)',
    space: 'O(n)',
    edgeCases: ['k = 0 with zeros present', 'all negative numbers', 'no subarray sums to k', 'entire array sums to k', 'single-element array'],
    skills: ['prefix-sum', 'arrays-hashing', 'constraints'],
  },
  {
    id: 'statements-a:lc42',
    lc: 42,
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    statement: `Imagine a cross-section of terrain represented by an array of non-negative integers, height, where each entry is the height of a one-unit-wide bar standing at that position, all bars sitting side by side with no gaps between them. After a heavy rain, water pools on top of this terrain, held in place by the bars acting as walls, and any water that is not held in by a taller bar on both sides simply runs off the edges of the array and is lost.

You need to compute the total volume of water, measured in unit squares, that ends up trapped above the terrain once the rain stops and everything settles. A given position can only hold water up to the height of the shorter of the tallest bar to its left and the tallest bar to its right, since a gap on either side lets the water escape that way instead.

Someone on the team suggests precomputing, for every position, the tallest bar to its left and the tallest bar to its right, which works fine but costs extra memory proportional to the array length. The follow-up question they always ask afterward is whether you can get the same answer using only a constant amount of extra space, no matter how long the terrain array is.`,
    examples: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6', explanation: 'Water pools above several of the shorter bars; summing every trapped column gives 6 total units.' },
      { input: 'height = [4,2,0,3,2,5]', output: '9', explanation: 'The deep dip between the two tall bars on the ends traps 9 units once filled.' },
      { input: 'height = [1,0,1]', output: '1', explanation: 'A single unit of water sits in the dip between the two equal-height bars.' },
    ],
    constraints: ['n == height.length', '1 <= n <= 2 * 10^4', '0 <= height[i] <= 10^5'],
    followUp: 'Can you compute the answer with only O(1) extra space instead of precomputed left/right max arrays?',
    signature: { kind: 'function', className: 'Solution', method: 'trap', params: [['height', 'List[int]']], returns: 'int' },
    signals: [
      { phrase: 'tallest bar to its left and the tallest bar to its right', means: 'water level bounded by the shorter of two running maxes' },
      { phrase: 'runs off the edges of the array and is lost', means: 'boundary bars never trap anything themselves' },
      { phrase: 'constant amount of extra space', means: 'O(1) space target, so avoid storing full left/right arrays' },
      { phrase: 'total volume of water', means: 'sum trapped water across all positions, not just the max' },
    ],
    keyInfo: { input: 'array of up to 2*10^4 non-negative bar heights', output: 'total trapped water volume', target: 'O(n) time, O(1) space via two pointers instead of precomputed arrays' },
    pattern: 'Two pointers with running maxes',
    ds: [],
    time: 'O(n)',
    space: 'O(1)',
    edgeCases: ['strictly increasing or strictly decreasing terrain (traps nothing)', 'all bars the same height', 'a single very tall bar surrounded by zeros', 'array of length 1 or 2', 'repeated equal peaks'],
    skills: ['two-pointers', 'monotonic-stack'],
  },
  {
    id: 'statements-a:lc11',
    lc: 11,
    title: 'Container With Most Water',
    difficulty: 'Medium',
    statement: `You are given an array height where each entry represents the height of a vertical line standing at that index along a horizontal axis, with n such lines total. Picking any two of these lines and dropping a container between them traps water up to the height of whichever of the two lines is shorter, since water would simply spill over the shorter side otherwise, and the width of that container is just the distance between the two chosen indices.

Your task is to choose exactly two lines, out of all the possible pairs, so that the resulting container holds the greatest possible amount of water, and then return that maximum area as a single number. It is worth noting explicitly that the container's walls themselves have no thickness and do not take up any volume, so you only care about the height and the horizontal gap, not anything about the lines in between.

Checking every single pair of lines is a perfectly correct way to solve this, but with n reaching up to one hundred thousand, that quadratic approach will not finish in reasonable time, so the expectation here is a solution that scans through the lines close to linearly.`,
    examples: [
      { input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49', explanation: 'Choosing the lines at index 1 (height 8) and index 8 (height 7) gives width 7 and height min(8,7)=7, area 49.' },
      { input: 'height = [1,1]', output: '1', explanation: 'Only one pair is possible: width 1, height min(1,1)=1, area 1.' },
      { input: 'height = [4,3,2,1,4]', output: '16', explanation: 'The two end lines, both height 4, give width 4 and height 4, area 16.' },
    ],
    constraints: ['n == height.length', '2 <= n <= 10^5', '0 <= height[i] <= 10^4'],
    signature: { kind: 'function', className: 'Solution', method: 'maxArea', params: [['height', 'List[int]']], returns: 'int' },
    signals: [
      { phrase: 'whichever of the two lines is shorter', means: 'area capped by the shorter wall' },
      { phrase: 'choose exactly two lines', means: 'pick a pair, not a contiguous range' },
      { phrase: 'up to one hundred thousand', means: 'n <= 10^5 rules out O(n^2) pair checking' },
      { phrase: 'scans through the lines close to linearly', means: 'O(n) target via converging pointers' },
    ],
    keyInfo: { input: 'array of up to 10^5 non-negative heights', output: 'maximum possible container area from any pair', target: 'O(n) because checking all pairs is O(n^2) and too slow' },
    pattern: 'Converging pointers, move the shorter',
    ds: [],
    time: 'O(n)',
    space: 'O(1)',
    edgeCases: ['only two lines total', 'all lines the same height', 'heights include zeros', 'strictly increasing heights', 'the tallest two lines are adjacent'],
    skills: ['two-pointers', 'greedy'],
  },
  {
    id: 'statements-a:lc200',
    lc: 200,
    title: 'Number of Islands',
    difficulty: 'Medium',
    statement: `A geography team hands you a rectangular grid of characters, where every cell is either the character "1", meaning land, or "0", meaning water. They explain that an island is formed by land cells that are connected to each other only horizontally or vertically, never diagonally, so a land cell touching another land cell only at a corner does not count as the same island.

They also tell you something important: the grid is always fully surrounded by water on all four sides, so you never need to worry about an island touching the actual edge of the map in a special way, and you can safely assume there is always at least one row and one column.

Your job is to count how many distinct islands exist in the grid overall. The team mentions you are free to modify the grid in place while you work if that makes your life easier, since nobody downstream reuses this particular copy of the grid afterward. Given that the grid can have up to three hundred rows and three hundred columns, they also want to know, during the interview, why your approach does not blow up the call stack or the time budget on a grid that large.`,
    examples: [
      { input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', output: '1', explanation: 'All the land cells are connected horizontally or vertically into one single island.' },
      { input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', output: '3', explanation: 'There are three separate groups of connected land cells.' },
    ],
    constraints: ['m == grid.length', 'n == grid[i].length', '1 <= m, n <= 300', 'grid[i][j] is "0" or "1"'],
    signature: { kind: 'function', className: 'Solution', method: 'numIslands', params: [['grid', 'List[List[str]]']], returns: 'int' },
    signals: [
      { phrase: 'connected to each other only horizontally or vertically', means: '4-directional adjacency, not 8-directional' },
      { phrase: 'fully surrounded by water on all four sides', means: 'no special-casing needed at the grid border' },
      { phrase: 'free to modify the grid in place', means: 'can mark visited by overwriting cells instead of a separate set' },
      { phrase: 'three hundred rows and three hundred columns', means: 'm, n up to 300, watch recursion depth on 300x300' },
    ],
    keyInfo: { input: 'up to 300x300 grid of "0"/"1" characters', output: 'count of 4-directionally connected land groups', target: 'O(m*n) because every cell is visited once, flood fill per island' },
    pattern: 'Flood fill (BFS/DFS) per island',
    ds: ['queue', 'grid'],
    time: 'O(m*n)',
    space: 'O(m*n) worst',
    edgeCases: ['all water, no islands', 'all land, one giant island', 'single-row or single-column grid', 'islands touching only diagonally (must not merge)', 'checkerboard pattern of isolated single cells'],
    skills: ['grid', 'graph-bfs', 'graph-dfs', 'communication'],
  },
  {
    id: 'statements-a:lc713',
    lc: 713,
    title: 'Subarray Product Less Than K',
    difficulty: 'Medium',
    statement: `A sensor pipeline streams in a sequence of strictly positive integer readings, nums, where every single reading is guaranteed to be at least 1, and hands you an integer threshold k as well. The pipeline wants to know how many contiguous stretches of readings, when every reading inside the stretch is multiplied together, produce a running product that stays strictly less than k.

A single reading on its own counts as a valid stretch of length one, and the same stretch of readings appearing at different starting and ending positions in the array is counted as a separate stretch each time, even if the values happen to repeat elsewhere in the sequence. Because every single value is strictly positive, growing a window to include one more reading can only ever keep the product the same or make it larger, never smaller, which is a property worth noticing before you pick an approach.

With the array able to hold up to thirty thousand readings, checking every possible pair of start and end positions directly would mean looking at roughly n squared stretches, which the pipeline team considers unacceptably slow for their real-time dashboard.`,
    examples: [
      { input: 'nums = [10,5,2,6], k = 100', output: '8', explanation: 'The qualifying contiguous stretches are [10], [5], [2], [6], [10,5], [5,2], [2,6], [5,2,6].' },
      { input: 'nums = [1,2,3], k = 0', output: '0', explanation: 'No product can ever be strictly less than 0 since all values are positive.' },
      { input: 'nums = [1,1,1], k = 2', output: '6', explanation: 'Every one of the six possible contiguous stretches has a product of 1, which is less than 2.' },
    ],
    constraints: ['1 <= nums.length <= 3 * 10^4', '1 <= nums[i] <= 1000', '0 <= k <= 10^6'],
    signature: { kind: 'function', className: 'Solution', method: 'numSubarrayProductLessThanK', params: [['nums', 'List[int]'], ['k', 'int']], returns: 'int' },
    signals: [
      { phrase: 'every single reading is guaranteed to be at least 1', means: 'all positive values, product only grows as window grows' },
      { phrase: 'strictly less than k', means: 'strict inequality on the running product, not <=' },
      { phrase: 'counted as a separate stretch each time', means: 'count all qualifying subarrays, not distinct products' },
      { phrase: 'roughly n squared stretches', means: 'brute force is O(n^2), pipeline wants faster' },
    ],
    keyInfo: { input: 'array of up to 3*10^4 positive ints, threshold k', output: 'count of contiguous subarrays with product < k', target: 'O(n) sliding window because all values are positive so product is monotonic in window size' },
    pattern: 'Sliding window counting',
    ds: [],
    time: 'O(n)',
    space: 'O(1)',
    edgeCases: ['k equal to 0 or 1 (nothing can qualify)', 'all ones', 'a single value already exceeding k', 'k larger than the full product of the array', 'array of length 1'],
    skills: ['sliding-window'],
  },
  {
    id: 'statements-a:lc875',
    lc: 875,
    title: 'Koko Eating Bananas',
    difficulty: 'Medium',
    statement: `Koko has piles of bananas lined up, described by an array piles where each entry is the number of bananas in that particular pile, and she has exactly h hours total before the guards return. Each hour, Koko walks up to exactly one pile and eats some number of bananas from it at whatever constant speed, measured in bananas per hour, you choose for her in advance; that speed never changes once picked.

If a pile has fewer bananas left in it than her chosen eating speed, she simply finishes that entire pile during that hour and does not carry the leftover eating capacity over to another pile; the rest of that hour is effectively idle for her. If a pile has more bananas than her speed allows her to finish in one hour, she eats exactly speed-many bananas from it and leaves the remainder for a future hour. Once the guards return, after exactly h hours have passed, Koko stops eating no matter what is left in any pile.

You need to figure out the minimum integer eating speed that still lets Koko get through every single pile within the h hours she has been given. The piles can each contain up to a billion bananas and h itself can be nearly that large too, so trying every possible speed one at a time starting from one is not going to finish in time.`,
    examples: [
      { input: 'piles = [3,6,7,11], h = 8', output: '4', explanation: 'At speed 4, Koko needs ceil(3/4)+ceil(6/4)+ceil(7/4)+ceil(11/4) = 1+2+2+3 = 8 hours, exactly fitting.' },
      { input: 'piles = [30,11,23,4,20], h = 5', output: '30', explanation: 'With only one hour per pile allowed on average, she must be fast enough to clear the largest pile in a single hour.' },
      { input: 'piles = [30,11,23,4,20], h = 6', output: '23', explanation: 'With one extra hour of slack, a slightly lower speed of 23 still finishes everything in time.' },
    ],
    constraints: ['1 <= piles.length <= 10^4', 'piles.length <= h <= 10^9', '1 <= piles[i] <= 10^9'],
    signature: { kind: 'function', className: 'Solution', method: 'minEatingSpeed', params: [['piles', 'List[int]'], ['h', 'int']], returns: 'int' },
    signals: [
      { phrase: 'exactly one pile', means: 'one pile per hour, cannot split hours across piles' },
      { phrase: 'does not carry the leftover eating capacity over', means: 'unused speed on a finished pile is wasted, not banked' },
      { phrase: 'minimum integer eating speed', means: 'binary search for the smallest feasible speed' },
      { phrase: 'up to a billion bananas', means: 'search space up to 10^9, rules out linear speed scan' },
    ],
    keyInfo: { input: 'pile sizes up to 10^9 each, hour budget h up to 10^9', output: 'smallest integer speed that finishes within h hours', target: 'O(n log max(piles)) because trying every speed from 1 is O(n * max)' },
    pattern: 'Binary search on the answer',
    ds: [],
    time: 'O(n log max(piles))',
    space: 'O(1)',
    edgeCases: ['h exactly equal to the number of piles (must eat fastest pile in one hour)', 'a single pile', 'all piles the same size', 'h much larger than needed', 'very large pile values near 10^9'],
    skills: ['binary-search', 'constraints'],
  },
  {
    id: 'statements-a:lc312',
    lc: 312,
    title: 'Burst Balloons',
    difficulty: 'Hard',
    statement: `There are n balloons lined up in a row, each labeled with a number from the array nums, and you get to burst them one at a time in whatever order you like. The rule that makes this interesting: when you burst the balloon at some position, the coins you earn equal the product of the numbers on the three balloons currently at that position and its two immediate neighbors, left and right, as they exist in the row at that exact moment, which means the neighbors shift as other balloons disappear.

If the balloon you are about to burst happens to be at either end of the row, you treat the missing neighbor on that side as if it had the number 1 written on it, so edge balloons still earn something, just without a real neighbor contributing a multiplier on that side. After a balloon bursts, the two balloons that used to flank it become adjacent to each other, closing the gap, and this changes what bursting either of them next would earn you.

Your goal is to choose a bursting order that earns the maximum total coins across all n bursts combined. The array length can reach three hundred, so brute forcing every possible order of bursting, which grows factorially, is completely out of the question, and even an approach that tries every possible first balloon to burst at every step tends to be too slow unless you reframe the problem around which balloon bursts last in a given range rather than which bursts first.`,
    examples: [
      { input: 'nums = [3,1,5,8]', output: '167', explanation: 'Bursting in the order 1, 5, 3, 8 (by value, following optimal neighbors) yields 3*1*5 + 3*5*8 + 1*3*8 + 1*8*1 = 15+120+24+8 = 167.' },
      { input: 'nums = [1,5]', output: '10', explanation: 'Bursting 1 first earns 1*1*5=5 (using the virtual 1 on the left edge), then bursting 5 earns 1*5*1=5, total 10.' },
    ],
    constraints: ['n == nums.length', '1 <= n <= 300', '0 <= nums[i] <= 100'],
    signature: { kind: 'function', className: 'Solution', method: 'maxCoins', params: [['nums', 'List[int]']], returns: 'int' },
    signals: [
      { phrase: 'as if it had the number 1 written on it', means: 'pad both ends with a virtual 1 before computing' },
      { phrase: 'the neighbors shift as other balloons disappear', means: 'bursting order changes adjacency, classic interval DP cue' },
      { phrase: 'reframe the problem around which balloon bursts last', means: 'think in terms of last-to-burst in a range, not first' },
      { phrase: 'grows factorially', means: 'brute force order enumeration is O(n!), infeasible' },
    ],
    keyInfo: { input: 'array of up to 300 balloon values', output: 'maximum total coins from bursting all balloons', target: 'O(n^3) interval DP because factorial ordering search is impossible' },
    pattern: 'Interval DP (last to burst)',
    ds: ['dp table'],
    time: 'O(n^3)',
    space: 'O(n^2)',
    edgeCases: ['single balloon', 'two balloons', 'all balloons valued zero', 'all balloons the same value', 'one very large value next to many small ones'],
    skills: ['dp-2d', 'constraints'],
  },
  {
    id: 'statements-a:lc84',
    lc: 84,
    title: 'Largest Rectangle in Histogram',
    difficulty: 'Hard',
    statement: `You are looking at a histogram made of n bars standing side by side, each exactly one unit wide, where the array heights gives the height of each bar in order from left to right. Picture trying to fit the biggest possible rectangle you can inside this histogram's silhouette, where the rectangle's base sits on the ground and its top edge is a single flat horizontal line.

The catch is that the rectangle's top edge cannot poke above any bar it spans; wherever the rectangle covers a range of bars, its height is limited by the single shortest bar anywhere within that range, since anything taller would stick out above a shorter bar and break the silhouette. So a rectangle spanning many bars can only be as tall as the weakest link among them, while a rectangle spanning just one bar can be as tall as that one bar itself.

You need to return the area, meaning width times height, of the single largest such rectangle that fits entirely within the histogram. With n reaching up to one hundred thousand bars, checking every possible pair of left and right boundaries directly and scanning for the minimum height in between each time is far too slow, so the team wants an approach that gets through the whole histogram in roughly linear time using some kind of auxiliary stack structure.`,
    examples: [
      { input: 'heights = [2,1,5,6,2,3]', output: '10', explanation: 'The bars at indices 2 and 3 (heights 5 and 6) support a rectangle of width 2 and height 5, area 10.' },
      { input: 'heights = [2,4]', output: '4', explanation: 'A rectangle of width 1 and height 4 over just the second bar gives the largest area, 4.' },
    ],
    constraints: ['1 <= heights.length <= 10^5', '0 <= heights[i] <= 10^4'],
    signature: { kind: 'function', className: 'Solution', method: 'largestRectangleArea', params: [['heights', 'List[int]']], returns: 'int' },
    signals: [
      { phrase: 'limited by the single shortest bar anywhere within that range', means: 'rectangle height bounded by the min in a span' },
      { phrase: 'one hundred thousand bars', means: 'n up to 10^5, O(n^2) pair checking too slow' },
      { phrase: 'auxiliary stack structure', means: 'monotonic stack is the intended data structure' },
      { phrase: 'roughly linear time', means: 'O(n) target' },
    ],
    keyInfo: { input: 'array of up to 10^5 bar heights', output: 'area of the largest rectangle fitting the silhouette', target: 'O(n) via a monotonic stack because pairwise min-scanning is O(n^2)' },
    pattern: 'Monotonic stack',
    ds: ['stack'],
    time: 'O(n)',
    space: 'O(n)',
    edgeCases: ['single bar', 'strictly increasing heights', 'strictly decreasing heights', 'all bars the same height', 'bars with height 0 mixed in'],
    skills: ['monotonic-stack', 'stack'],
  },
  {
    id: 'statements-a:lc39',
    lc: 39,
    title: 'Combination Sum',
    difficulty: 'Medium',
    statement: `You get a list of distinct positive integers, candidates, which you should think of as an unlimited supply of each number rather than a fixed set you draw from once, meaning any single candidate value can appear in your answer as many times as you like. You also get a target integer. The task is to find every distinct combination of these candidate values, used any number of times each, that adds up exactly to target.

Two combinations are considered the same, and therefore should only be reported once, if they contain the same numbers the same number of times regardless of the order those numbers were picked in; for example picking 2 then 2 then 3 is the same combination as picking 3 then 2 then 2, so your output should not contain both as separate entries. The problem guarantees that the number of distinct combinations that sum to target stays under 150, which is a hint about how deep the exploration can realistically get even though it is conceptually unbounded.

Since any candidate can repeat, a naive recursive exploration could in theory recurse forever if you are not careful about which candidates remain eligible to be picked again at each step, so controlling the branching and the stopping condition correctly is the real core of this problem rather than any particularly exotic algorithm.`,
    examples: [
      { input: 'candidates = [2,3,6,7], target = 7', output: '[[2,2,3],[7]]', explanation: 'Both 2+2+3 and 7 alone sum to 7, and these are the only two distinct combinations.' },
      { input: 'candidates = [2,3,5], target = 8', output: '[[2,2,2,2],[2,3,3],[3,5]]', explanation: 'Three distinct ways to reach 8 using repeats of 2, 3, and 5.' },
      { input: 'candidates = [2], target = 1', output: '[]', explanation: 'No combination of the single available value 2 can ever sum to 1.' },
    ],
    constraints: ['1 <= candidates.length <= 30', '2 <= candidates[i] <= 40', 'all elements of candidates are distinct', '1 <= target <= 40'],
    signature: { kind: 'function', className: 'Solution', method: 'combinationSum', params: [['candidates', 'List[int]'], ['target', 'int']], returns: 'List[List[int]]' },
    signals: [
      { phrase: 'unlimited supply of each number', means: 'a candidate can be reused any number of times' },
      { phrase: 'regardless of the order those numbers were picked in', means: 'dedupe by only ever picking non-decreasing, avoid permutation duplicates' },
      { phrase: 'stays under 150', means: 'output size bound hints branching is manageable despite being exponential' },
      { phrase: 'could in theory recurse forever', means: 'must not revisit a smaller candidate after moving past it' },
    ],
    keyInfo: { input: 'up to 30 distinct positive candidates, a target up to 40', output: 'all distinct combinations (with repetition) summing to target', target: 'exponential in the worst case, pruned heavily by target <= 40' },
    pattern: 'Backtracking with reuse',
    ds: ['array'],
    time: 'O(2^target) worst case, heavily pruned',
    space: 'O(target / min(candidates))',
    edgeCases: ['target smaller than every candidate (empty result)', 'a candidate exactly equal to target', 'single candidate value', 'target that forces many repeats of the smallest candidate', 'no combination exists at all'],
    skills: ['backtracking'],
  },
  {
    id: 'statements-a:lc743',
    lc: 743,
    title: 'Network Delay Time',
    difficulty: 'Medium',
    statement: `A distributed systems engineer models their cluster as a directed network of n nodes, labeled from 1 to n, where signals travel along one-way wires described by times, a list of triples [source, destination, weight], with weight being how many time units a signal takes to travel along that particular wire from source to destination. A signal is sent out from one specific node, k, at time zero, and then spreads outward, with every node that receives the signal immediately forwarding it along every outgoing wire it has.

The engineer wants to know how long it takes, starting from the moment node k sends its first signal, for every single node in the whole network to have received the signal at least once. If there is no possible way for the signal to reach every node, because the network is not fully connected outward from k, the engineer wants you to report -1 instead of a time.

They mention the network can have up to a hundred nodes and as many as six thousand directed wires between them, with wire weights that are always positive, and they specifically want the single longest of all the shortest arrival times across every node, since the whole network is not considered informed until its slowest-to-reach member finally gets the signal.`,
    examples: [
      { input: 'times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2', output: '2', explanation: 'From node 2, nodes 1 and 3 are reached at time 1, and node 4 is reached at time 2 via node 3; the slowest arrival is 2.' },
      { input: 'times = [[1,2,1]], n = 2, k = 1', output: '1', explanation: 'Node 2 is reached directly from node 1 in 1 time unit.' },
      { input: 'times = [[1,2,1]], n = 2, k = 2', output: '-1', explanation: 'There is no outgoing wire from node 2, so node 1 can never be reached.' },
    ],
    constraints: ['1 <= k <= n <= 100', '1 <= times.length <= 6000', 'times[i].length == 3', '1 <= source, target <= n', 'source != target', '0 <= weight <= 100', 'all pairs (source, target) are unique'],
    signature: { kind: 'function', className: 'Solution', method: 'networkDelayTime', params: [['times', 'List[List[int]]'], ['n', 'int'], ['k', 'int']], returns: 'int' },
    signals: [
      { phrase: 'directed network', means: 'edges are one-way, not bidirectional' },
      { phrase: 'the single longest of all the shortest arrival times', means: 'compute shortest path from k to every node, take the max' },
      { phrase: 'report -1 instead of a time', means: 'handle unreachable nodes explicitly' },
      { phrase: 'wire weights that are always positive', means: 'non-negative weights, Dijkstra is safe to use' },
    ],
    keyInfo: { input: 'directed weighted graph, up to 100 nodes, 6000 edges, start node k', output: 'max shortest-path time from k, or -1 if unreachable', target: 'O(E log V) with a heap because n, E are large enough to need an efficient shortest-path algorithm' },
    pattern: "Dijkstra's shortest path",
    ds: ['graph', 'heap'],
    time: 'O(E log V)',
    space: 'O(V + E)',
    edgeCases: ['k cannot reach every node (return -1)', 'n = 1 (trivially 0)', 'self-contained cycles that do not include all nodes', 'multiple equally short paths to the same node', 'a wire weight of 0'],
    skills: ['dijkstra', 'graph-modeling', 'heap'],
  },
  {
    id: 'statements-a:lc215',
    lc: 215,
    title: 'Kth Largest Element in an Array',
    difficulty: 'Medium',
    statement: `You are given an unsorted integer array, nums, and an integer k, and asked to find the kth largest element in the array, but with an important clarification the problem statement insists on spelling out: this means the kth largest element in strictly sorted order, not the kth distinct largest value. In other words, if the array has duplicate values, those duplicates still occupy separate ranks when you sort the whole array, so you cannot just deduplicate first and then index.

A reviewer mentions that sorting the entire array and then indexing from the end would trivially work and is easy to reason about, but they specifically want to know if you can avoid paying the full cost of sorting everything when all you actually need is one particular rank, not the complete ordering. They are especially interested in whether you can do the whole thing without ever allocating a second full copy of the array.

The array length can reach over a hundred thousand elements, and k is always a valid rank between 1 and the length of the array inclusive, so you never need to handle a k that is out of range.`,
    examples: [
      { input: 'nums = [3,2,1,5,6,4], k = 2', output: '5', explanation: 'Sorted descending the array is [6,5,4,3,2,1]; the 2nd largest is 5.' },
      { input: 'nums = [3,2,3,1,2,4,5,5,6], k = 4', output: '4', explanation: 'Sorted descending with duplicates kept, the 4th position is 4.' },
    ],
    constraints: ['1 <= k <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    signature: { kind: 'function', className: 'Solution', method: 'findKthLargest', params: [['nums', 'List[int]'], ['k', 'int']], returns: 'int' },
    signals: [
      { phrase: 'not the kth distinct largest value', means: 'duplicates count separately, no deduping' },
      { phrase: 'avoid paying the full cost of sorting everything', means: 'target is better than O(n log n) full sort' },
      { phrase: 'without ever allocating a second full copy', means: 'in-place or bounded extra space preferred' },
      { phrase: 'over a hundred thousand elements', means: 'n up to 10^5, matters for picking heap size vs quickselect' },
    ],
    keyInfo: { input: 'unsorted array up to 10^5 ints, rank k', output: 'the value at rank k from the largest end', target: 'O(n log k) with a size-k heap, or average O(n) with quickselect' },
    pattern: 'Min-heap of size k (or quickselect)',
    ds: ['heap'],
    time: 'O(n log k)',
    space: 'O(k)',
    edgeCases: ['k = 1 (just the maximum)', 'k = n (just the minimum)', 'all duplicate values', 'already sorted input, ascending or descending', 'array of length 1'],
    skills: ['heap', 'ds-diagnosis'],
  },
  {
    id: 'statements-a:lc25',
    lc: 25,
    title: 'Reverse Nodes in k-Group',
    difficulty: 'Hard',
    statement: `You are handed the head of a singly linked list along with an integer k, and asked to reverse the order of the nodes k at a time, treating the list as a sequence of consecutive, non-overlapping groups of exactly k nodes each, starting from the very front of the list. Within each full group, the nodes should come out in the opposite order from how they went in, as if that small chunk had been reversed on its own.

Here is the detail that catches people off guard: if the total number of nodes left in the list is not evenly divisible by k, there will be one final group at the tail end that contains fewer than k nodes, and that leftover group must be left exactly as it is, in its original order, completely untouched by the reversal logic that applies to the full groups before it.

The follow-up constraint that makes this a genuinely hard problem rather than a medium one is that you are expected to solve it using only a constant amount of extra memory; you are not allowed to pull the node values out into some other data structure, manipulate them there, and then rebuild the list, since that would use memory proportional to the list length. Every rearrangement has to happen by directly relinking the existing node objects.`,
    examples: [
      { input: 'head = [1,2,3,4,5], k = 2', output: '[2,1,4,3,5]', explanation: 'The first two groups of 2 are each reversed; the final single leftover node 5 stays untouched.' },
      { input: 'head = [1,2,3,4,5], k = 3', output: '[3,2,1,4,5]', explanation: 'The first group of 3 is reversed; the trailing group of only 2 nodes is left as is.' },
    ],
    constraints: ['the number of nodes is n', '1 <= k <= n <= 5000', '0 <= Node.val <= 1000'],
    followUp: "Can you solve it without allocating any additional data structure beyond a few pointers, i.e. O(1) extra space?",
    signature: { kind: 'function', className: 'Solution', method: 'reverseKGroup', params: [['head', 'Optional[ListNode]'], ['k', 'int']], returns: 'Optional[ListNode]' },
    helperClasses: ['ListNode'],
    signals: [
      { phrase: 'consecutive, non-overlapping groups of exactly k nodes', means: 'process the list in fixed-size chunks from the front' },
      { phrase: 'left exactly as it is, in its original order', means: 'a trailing partial group must not be reversed' },
      { phrase: 'constant amount of extra memory', means: 'O(1) space, must relink nodes in place, no array dump' },
      { phrase: 'directly relinking the existing node objects', means: 'manipulate .next pointers rather than copying values' },
    ],
    keyInfo: { input: 'linked list head, group size k', output: 'head of the list with every full k-group reversed', target: 'O(n) time, O(1) space because value extraction into an array is disallowed' },
    pattern: 'Iterative in-place reversal per group',
    ds: ['linked list'],
    time: 'O(n)',
    space: 'O(1)',
    edgeCases: ['k = 1 (no change at all)', 'k equal to the full list length', 'list length not a multiple of k', 'single-node list', 'k larger than the remaining nodes in the last group'],
    skills: ['linked-list'],
  },
  {
    id: 'statements-a:lc143',
    lc: 143,
    title: 'Reorder List',
    difficulty: 'Medium',
    statement: `You are given the head of a singly linked list containing n nodes, which you should mentally index as L0, L1, L2, all the way up to Ln-1 in their original order. Rather than leaving the list in that straightforward order, you are asked to physically rearrange the nodes in place so the list instead reads L0, Ln-1, L1, Ln-2, L2, Ln-3, and so on, alternating between taking the next node from the front of the remaining sequence and the next node from the back.

It is worth stressing that you must actually change the node links themselves to achieve this new order; simply changing which values are stored in which node objects, instead of relinking the nodes, would not satisfy what is being asked here, since the problem is specifically testing whether you can manipulate pointers correctly rather than just copy data around.

Since you only have forward-pointing next references available to you, and no direct way to jump to "the last node" or walk backward from the end, you will need to figure out some combination of pointer techniques, such as finding a midpoint, reversing part of the list, and merging two halves together, to pull this off using no extra data structures proportional to the list size.`,
    examples: [
      { input: 'head = [1,2,3,4]', output: '[1,4,2,3]', explanation: 'With 4 nodes, the reordering alternates front and back: L0, L3, L1, L2.' },
      { input: 'head = [1,2,3,4,5]', output: '[1,5,2,4,3]', explanation: 'With 5 nodes, the middle node L2 ends up last since there is nothing left to pair it with.' },
    ],
    constraints: ['the number of nodes is n', '1 <= n <= 5 * 10^4', '1 <= Node.val <= 1000'],
    signature: { kind: 'function', className: 'Solution', method: 'reorderList', params: [['head', 'Optional[ListNode]']], returns: 'None' },
    helperClasses: ['ListNode'],
    signals: [
      { phrase: 'alternating between taking the next node from the front', means: 'interleave first half with reversed second half' },
      { phrase: 'you must actually change the node links themselves', means: 'relink nodes in place, do not just swap stored values' },
      { phrase: 'no direct way to jump to "the last node"', means: 'need fast/slow pointer to find the midpoint first' },
      { phrase: 'no extra data structures proportional to the list size', means: 'O(1) extra space beyond a few pointers' },
    ],
    keyInfo: { input: 'singly linked list head, up to 5*10^4 nodes', output: 'none, list is reordered in place', target: 'O(n) time, O(1) space using find-middle + reverse + merge' },
    pattern: 'Find middle + reverse second half + merge',
    ds: ['linked list'],
    time: 'O(n)',
    space: 'O(1)',
    edgeCases: ['single-node list (no change)', 'two-node list', 'odd length (middle node has no pair)', 'even length', 'already in the target order'],
    skills: ['linked-list', 'two-pointers'],
  },
  {
    id: 'statements-a:lc115',
    lc: 115,
    title: 'Distinct Subsequences',
    difficulty: 'Hard',
    statement: `You are given two strings, s and t, where t is typically much shorter than s, and asked to count the number of distinct ways you can pick characters out of s, moving left to right without skipping around or reusing a position twice, such that the characters you picked, read in the order you picked them, spell out t exactly.

A subtlety that matters a lot here: "distinct ways" refers to distinct choices of which positions in s you used, not distinct resulting strings; since t is fixed and every valid pick spells the same string t by definition, what you are really counting is the number of different index sets in s that work, even though they all produce an identical-looking result. So a string s full of repeated letters can have many valid ways to spell out the same short target t.

The string s can be up to a thousand characters long and t can be nearly as long, so the team wants to see you recognize that brute-force enumeration of subsequences is exponential and completely infeasible, and that this needs to be approached as a counting problem built up from smaller prefixes of both strings rather than generated and checked one subsequence at a time.`,
    examples: [
      { input: 's = "rabbbit", t = "rabbit"', output: '3', explanation: 'There are 3 distinct ways to choose positions in s that spell out "rabbit", differing in which of the three b\'s get used.' },
      { input: 's = "babgbag", t = "bag"', output: '5', explanation: 'There are 5 distinct index combinations in s that spell out "bag".' },
    ],
    constraints: ['1 <= s.length, t.length <= 1000', 's and t consist of English letters'],
    signature: { kind: 'function', className: 'Solution', method: 'numDistinct', params: [['s', 'str'], ['t', 'str']], returns: 'int' },
    signals: [
      { phrase: 'moving left to right without skipping around or reusing a position twice', means: 'counting subsequences, order preserved, no reuse' },
      { phrase: 'refers to distinct choices of which positions in s you used', means: 'count index combinations, not distinct output strings' },
      { phrase: 'exponential and completely infeasible', means: 'must use DP over prefixes, not generate-and-check' },
      { phrase: 'built up from smaller prefixes of both strings', means: '2D DP table indexed by prefix lengths of s and t' },
    ],
    keyInfo: { input: 'two strings, each up to 1000 characters', output: 'count of distinct subsequences of s equal to t', target: 'O(m*n) DP because subsequence enumeration is exponential' },
    pattern: 'Prefix-based counting DP',
    ds: ['dp table'],
    time: 'O(m*n)',
    space: 'O(m*n) (reducible to O(n))',
    edgeCases: ['t longer than s (always 0)', 't empty (exactly 1 empty match)', 's and t identical', 's made entirely of one repeated character', 'no occurrence of t\'s characters in s at all'],
    skills: ['dp-2d'],
  },
  {
    id: 'statements-a:lc210',
    lc: 210,
    title: 'Course Schedule II',
    difficulty: 'Medium',
    statement: `A university registrar system has numCourses total courses, labeled with the integers from 0 up to numCourses minus 1, and a list of prerequisite pairs, prerequisites, where each pair [a, b] means you are required to take course b before you are allowed to take course a. The registrar wants you to produce one valid order in which a student could take every single course while always respecting every prerequisite relationship along the way.

It is entirely possible that more than one valid ordering exists for a given set of prerequisites, and the registrar is fine with any one of them being returned, so there is no notion of a single "correct" answer to match exactly. What the registrar does care about is detecting the case where no valid ordering exists at all, which happens precisely when the prerequisite relationships form a cycle, meaning some course directly or indirectly depends on itself being completed first; in that situation you should return an empty list instead of any ordering.

The number of courses can reach two thousand and the number of prerequisite pairs can reach five thousand, so the registrar expects a solution that processes the whole dependency graph in time proportional to its size rather than repeatedly rechecking prerequisites from scratch.`,
    examples: [
      { input: 'numCourses = 2, prerequisites = [[1,0]]', output: '[0,1]', explanation: 'Course 1 depends on course 0, so course 0 must come first.' },
      { input: 'numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]', output: '[0,1,2,3]', explanation: 'One valid order is 0, then 1 and 2 in either order, then 3; 0,2,1,3 would also be accepted.' },
      { input: 'numCourses = 1, prerequisites = []', output: '[0]', explanation: 'A single course with no prerequisites can simply be taken.' },
    ],
    constraints: ['1 <= numCourses <= 2000', '0 <= prerequisites.length <= 5000', 'prerequisites[i].length == 2', '0 <= ai, bi < numCourses', 'ai != bi', 'all pairs [ai, bi] are distinct'],
    signature: { kind: 'function', className: 'Solution', method: 'findOrder', params: [['numCourses', 'int'], ['prerequisites', 'List[List[int]]']], returns: 'List[int]' },
    signals: [
      { phrase: 'before you are allowed to take course a', means: 'directed edge from prerequisite to dependent course' },
      { phrase: 'more than one valid ordering exists', means: 'any valid topological order is accepted, not a unique one' },
      { phrase: 'form a cycle', means: 'detect cycles, return empty list if the graph is not a DAG' },
      { phrase: 'processes the whole dependency graph in time proportional to its size', means: 'O(V + E), Kahn\'s algorithm or DFS-based topo sort' },
    ],
    keyInfo: { input: 'up to 2000 course nodes, up to 5000 directed prerequisite edges', output: 'one valid course order, or [] if a cycle exists', target: 'O(V + E) via topological sort because rechecking per course would be slower' },
    pattern: "Kahn's topological sort",
    ds: ['graph', 'queue'],
    time: 'O(V + E)',
    space: 'O(V + E)',
    edgeCases: ['no prerequisites at all (any order works)', 'a direct cycle between two courses', 'a longer indirect cycle', 'a single course', 'disconnected groups of courses with no relation to each other'],
    skills: ['topo-sort', 'graph-modeling', 'graph-bfs'],
  },
  {
    id: 'statements-a:lc213',
    lc: 213,
    title: 'House Robber II',
    difficulty: 'Medium',
    statement: `A burglar is casing a neighborhood where every single house has a known amount of money stored inside, given by the array nums, but unlike a typical street, these houses are arranged in a circle, meaning the very first house and the very last house in the array are actually direct neighbors of each other, not just the two ends of a line.

Every house in this neighborhood is wired with a connected security system, and the one rule that never changes is that robbing two houses that are directly adjacent to each other on any given night will automatically trigger the alarm and end the whole operation. Because the arrangement is circular, this means the burglar specifically cannot rob both the first house and the last house on the same night, since those two count as adjacent, on top of the usual rule about not robbing two adjacent houses anywhere else in the circle.

Given this circular arrangement of houses and their respective amounts of money, determine the maximum total amount of money the burglar can make off with in one night without ever tripping an alarm. Think carefully about how the circular wraparound constraint changes a solution you might already know for houses arranged in a straight line instead.`,
    examples: [
      { input: 'nums = [2,3,2]', output: '3', explanation: 'Robbing house 0 and house 2 is not allowed since they are adjacent in the circle; the best is robbing just house 1 for 3.' },
      { input: 'nums = [1,2,3,1]', output: '4', explanation: 'Robbing house 0 (value 1) and house 2 (value 3) avoids the first/last adjacency and totals 4.' },
      { input: 'nums = [200,3,140,20,10]', output: '340', explanation: 'Robbing house 0 and house 2 gives 200 + 140 = 340, which beats other combinations once the wraparound is respected.' },
    ],
    constraints: ['1 <= nums.length <= 100', '0 <= nums[i] <= 1000'],
    signature: { kind: 'function', className: 'Solution', method: 'rob', params: [['nums', 'List[int]']], returns: 'int' },
    signals: [
      { phrase: 'arranged in a circle', means: 'first and last elements are adjacent, not just a linear array' },
      { phrase: 'cannot rob both the first house and the last house', means: 'must exclude one end to break the circular adjacency' },
      { phrase: 'how the circular wraparound constraint changes a solution you might already know', means: 'reduce to two linear House Robber runs excluding one end each' },
      { phrase: 'robbing two houses that are directly adjacent', means: 'core no-adjacent-robbery rule, same as the linear version' },
    ],
    keyInfo: { input: 'circularly arranged array of up to 100 house values', output: 'maximum money robbable with no two adjacent (including wraparound)', target: 'O(n) by running linear House Robber twice, once excluding each end' },
    pattern: 'DP circular (two linear passes)',
    ds: [],
    time: 'O(n)',
    space: 'O(1)',
    edgeCases: ['single house (circle of one, rob it)', 'two houses (they are adjacent to each other both ways)', 'all houses the same value', 'only the first or last house holding the most value', 'three houses in a circle'],
    skills: ['dp-1d'],
  },
  {
    id: 'statements-a:lc6',
    lc: 6,
    title: 'Zigzag Conversion',
    difficulty: 'Medium',
    statement: `Picture writing a string s out by hand, but instead of writing in a straight horizontal line, you write it in a zigzag pattern down and then diagonally back up across a fixed number of rows, numRows, repeating that down-then-diagonal-up motion over and over until every character of s has been placed somewhere. For example, with three rows the letters would physically visit row 0, then row 1, then row 2, then back up to row 1, then row 0, then back down to row 1, and so on, tracing a zigzag shape with your pen.

Once the entire string has been laid out in this zigzag pattern across the rows, the task is to read the characters back out row by row, from row 0 straight across to the last row, concatenating everything together into one single output string, and return that result.

Something worth noticing before coding: when numRows is exactly 1, there is no zigzag at all, since there is nowhere to zig or zag to, and the output should simply equal the input string unchanged. The string length can reach a thousand characters and numRows can itself be close to that, so you want an approach that places characters directly rather than literally simulating a 2D grid of mostly empty cells.`,
    examples: [
      { input: 's = "PAYPALISHIRING", numRows = 3', output: '"PAHNAPLSIIGYIR"', explanation: 'Written in a zigzag of 3 rows and read back row by row, the letters rearrange into "PAHNAPLSIIGYIR".' },
      { input: 's = "PAYPALISHIRING", numRows = 4', output: '"PINALSIGYAHRPI"', explanation: 'With 4 rows the zigzag shape is taller and narrower, producing a different rearrangement.' },
      { input: 's = "A", numRows = 1', output: '"A"', explanation: 'With only one row there is no zigzag; the string is returned unchanged.' },
    ],
    constraints: ['1 <= s.length <= 1000', 's consists of English letters, digits, dot (\'.\'), comma (\',\') and other printable characters', '1 <= numRows <= 1000'],
    signature: { kind: 'function', className: 'Solution', method: 'convert', params: [['s', 'str'], ['numRows', 'int']], returns: 'str' },
    signals: [
      { phrase: 'down and then diagonally back up', means: 'row index bounces between 0 and numRows-1 in a fixed pattern' },
      { phrase: 'read the characters back out row by row', means: 'final output groups characters by row, not by original order' },
      { phrase: 'when numRows is exactly 1', means: 'edge case where output equals input directly' },
      { phrase: 'rather than literally simulating a 2D grid', means: 'avoid O(n * numRows) grid allocation, place directly into row buffers' },
    ],
    keyInfo: { input: 'string up to 1000 chars, row count up to 1000', output: 'the zigzag-rearranged string', target: 'O(n) by tracking current row directly instead of building a full grid' },
    pattern: 'Simulate rows with a bouncing index',
    ds: ['array'],
    time: 'O(n)',
    space: 'O(n)',
    edgeCases: ['numRows = 1 (no change)', 'numRows >= s.length (each char its own row)', 'numRows = 2 (simplest real zigzag)', 'single character string', 'numRows exactly matching a full zigzag cycle'],
    skills: ['math', 'arrays-hashing'],
  },
  {
    id: 'statements-a:lc1944',
    lc: 1944,
    title: 'Number of Visible People in a Queue',
    difficulty: 'Hard',
    statement: `There are n people standing in a single-file queue, each with a distinct height given by the array heights, and every person is facing in the same direction, looking toward the front of the queue past everyone standing ahead of them. From any given position i, looking toward the front, a person j standing ahead of them (meaning j > i) is visible to person i if and only if every single person standing strictly between i and j is shorter than both person i and person j.

In other words, the first person ahead who is at least as tall as person i always blocks the view beyond them, and counts as visible themselves since they are the one doing the blocking, but nobody standing beyond that blocker can be seen, no matter how tall they are, because the blocker is in the way. All the heights given are guaranteed to be distinct, so you never have to reason about ties.

For every single person in the queue, you need to compute exactly how many other people standing ahead of them are visible to them, and return that as an array of counts, one per person, in the original left-to-right order of the queue. With n able to reach up to one hundred thousand people, checking every pair of positions directly to determine visibility would be far too slow.`,
    examples: [
      { input: 'heights = [10,6,8,5,11,9]', output: '[3,1,2,1,1,0]', explanation: 'Person 0 (height 10) can see persons at indices 1, 2, and 4 before being blocked by the taller person at index 4.' },
      { input: 'heights = [5,1,2,3,10]', output: '[4,1,1,1,0]', explanation: 'Person 0 can see everyone up through the final tallest person at index 4, since nobody in between blocks the view to someone taller.' },
    ],
    constraints: ['n == heights.length', '1 <= n <= 10^5', '1 <= heights[i] <= 10^5', 'all the values of heights are unique'],
    signature: { kind: 'function', className: 'Solution', method: 'canSeePersonsCount', params: [['heights', 'List[int]']], returns: 'List[int]' },
    signals: [
      { phrase: 'every single person standing strictly between i and j is shorter than both person i and person j', means: 'visibility defined by a run of strictly shorter people in between' },
      { phrase: 'blocks the view beyond them, and counts as visible themselves', means: 'the first taller-or-equal person is visible but ends the count there' },
      { phrase: 'guaranteed to be distinct', means: 'no tie-handling needed for equal heights' },
      { phrase: 'checking every pair of positions directly', means: 'brute force is O(n^2), need a stack-based O(n) scan' },
    ],
    keyInfo: { input: 'array of up to 10^5 distinct heights', output: 'array of visible-ahead counts per person', target: 'O(n) via a monotonic stack scanned from the right' },
    pattern: 'Monotonic stack from the right',
    ds: ['stack'],
    time: 'O(n)',
    space: 'O(n)',
    edgeCases: ['strictly increasing heights left to right (last person sees nothing ahead)', 'strictly decreasing heights (everyone sees everyone ahead of them)', 'single person (sees nobody)', 'tallest person at the very front', 'tallest person at the very back'],
    skills: ['monotonic-stack', 'stack'],
  },
  {
    id: 'statements-a:lc239',
    lc: 239,
    title: 'Sliding Window Maximum',
    difficulty: 'Hard',
    statement: `You have an integer array nums, and a window of a fixed size k that starts out covering the very first k elements of the array, all the way at the left edge. That window then slides one position to the right at a time, each slide dropping the leftmost element currently covered and picking up the next element to the right, continuing until the window has slid all the way off the right edge of the array.

For every single position the window stops at along the way, you need to record the maximum value of all the elements currently inside that window at that moment, and your final answer is the full list of these per-window maximums, in the order the window visited them.

The naive way to do this is to recompute the maximum of all k elements from scratch every time the window slides, which costs O(k) work per slide and O(n*k) overall; with n reaching up to a hundred thousand and k potentially being just as large, that is explicitly called out as too slow, so the team wants something closer to O(n) total, no matter how large k is relative to n.`,
    examples: [
      { input: 'nums = [1,3,-1,-3,5,3,6,7], k = 3', output: '[3,3,5,5,6,7]', explanation: 'Each window of size 3 slides across nums; its maximum is recorded at every stop.' },
      { input: 'nums = [1], k = 1', output: '[1]', explanation: 'A window the same size as the array has exactly one position, and its maximum is the single element.' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4', '1 <= k <= nums.length'],
    signature: { kind: 'function', className: 'Solution', method: 'maxSlidingWindow', params: [['nums', 'List[int]'], ['k', 'int']], returns: 'List[int]' },
    signals: [
      { phrase: 'slides one position to the right at a time', means: 'fixed-size window moving across the array' },
      { phrase: 'maximum value of all the elements currently inside that window', means: 'need the max of each window, not a sum or count' },
      { phrase: 'O(n*k) overall', means: 'brute force recompute per window is too slow' },
      { phrase: 'closer to O(n) total, no matter how large k is', means: 'target is O(n) via a monotonic deque, not a heap that costs log k per op naively mishandled' },
    ],
    keyInfo: { input: 'array up to 10^5 ints, window size k', output: 'array of per-window maximums', target: 'O(n) total via a monotonic deque because recomputing per window is O(n*k)' },
    pattern: 'Monotonic decreasing deque',
    ds: ['deque'],
    time: 'O(n)',
    space: 'O(k)',
    edgeCases: ['k equal to the full array length (one window, one answer)', 'k = 1 (every element is its own max)', 'strictly increasing array', 'strictly decreasing array', 'repeated maximum values across overlapping windows'],
    skills: ['queue-deque', 'monotonic-stack'],
  },
  {
    id: 'statements-a:lc835',
    lc: 835,
    title: 'Image Overlap',
    difficulty: 'Medium',
    statement: `You are given two binary square images, img1 and img2, each represented as an n by n grid where every cell holds either 0 or 1, with a 1 marking a colored pixel and a 0 marking an empty one. You are allowed to take img1 and translate it, meaning sliding the entire image some whole number of rows up or down and some whole number of columns left or right, as a single rigid shift applied to every pixel at once; no rotation or scaling is allowed, only this kind of sliding.

After you slide img1 by whatever row and column offset you choose, any of its colored pixels that would land outside the boundary of the n by n grid are simply discarded and no longer count for anything, while any newly empty area created by the slide on the other side is treated as all zeros. You want to choose the single best translation offset, trying every possible one if you have to, that maximizes the count of positions where a colored pixel from the translated img1 lands exactly on top of a colored pixel already present in img2.

Your answer should be that maximum possible overlap count, considering every combination of row offset and column offset you could apply. The grid size n stays fairly small in this problem, so an approach that is not the most asymptotically elegant can still comfortably fit within the time budget.`,
    examples: [
      { input: 'img1 = [[1,1,0],[0,1,0],[0,1,0]], img2 = [[0,0,0],[0,1,1],[0,0,1]]', output: '3', explanation: 'Translating img1 down by 1 row and right by 1 column overlaps 3 colored pixels with img2.' },
      { input: 'img1 = [[1]], img2 = [[1]]', output: '1', explanation: 'With no translation needed at all, the single pixel already overlaps.' },
      { input: 'img1 = [[0]], img2 = [[0]]', output: '0', explanation: 'Neither image has any colored pixels, so there is nothing to overlap.' },
    ],
    constraints: ['n == img1.length == img1[i].length', 'n == img2.length == img2[i].length', '1 <= n <= 30', 'img1[i][j] is 0 or 1', 'img2[i][j] is 0 or 1'],
    signature: { kind: 'function', className: 'Solution', method: 'largestOverlap', params: [['img1', 'List[List[int]]'], ['img2', 'List[List[int]]']], returns: 'int' },
    signals: [
      { phrase: 'a single rigid shift applied to every pixel at once', means: 'translation only, same offset for every colored pixel' },
      { phrase: 'simply discarded and no longer count', means: 'pixels shifted off the grid contribute nothing' },
      { phrase: 'maximizes the count of positions where a colored pixel', means: 'objective is overlap count, pick the best shift vector' },
      { phrase: 'fairly small in this problem', means: 'n <= 30, so an O(n^4) brute force over pixel pairs is acceptable' },
    ],
    keyInfo: { input: 'two n x n binary grids, n up to 30', output: 'max overlap count over all translations', target: 'O(n^4) via counting shift vectors between every pair of colored pixels, since n is small' },
    pattern: 'Translation vector counting',
    ds: ['hashmap'],
    time: 'O(n^4)',
    space: 'O(n^2)',
    edgeCases: ['one image entirely zeros (overlap always 0)', 'both images identical with no shift needed', 'images with a single colored pixel each', 'n = 1', 'images with colored pixels only at opposite corners'],
    skills: ['arrays-hashing', 'grid', 'constraints'],
  },
  {
    id: 'statements-a:lc525',
    lc: 525,
    title: 'Contiguous Array',
    difficulty: 'Medium',
    statement: `You are given a binary array nums, meaning every single value in it is either a 0 or a 1, with nothing else possible. The task is to find the length of the longest contiguous stretch of the array that contains exactly the same number of 0s as it does 1s, so if a stretch has three 1s it must also have exactly three 0s to qualify.

A naive way to check this is to try every possible starting and ending position, counting zeros and ones inside each candidate stretch from scratch, which obviously works but costs quadratic time for an array that can hold up to a hundred thousand elements, which the problem explicitly treats as too slow for a passing solution.

Here is a reframing trick worth noticing: if you treat every 0 in the array as if it were actually a -1 instead of a 0, then a stretch having an equal count of 0s and 1s becomes exactly the same thing as that stretch summing to zero under this relabeling, which connects this problem conceptually to counting zero-sum subarrays using running totals rather than brute-force counting.`,
    examples: [
      { input: 'nums = [0,1]', output: '2', explanation: 'The entire array has one 0 and one 1, giving a contiguous length of 2.' },
      { input: 'nums = [0,1,0]', output: '2', explanation: 'The longest balanced stretch is either [0,1] or [1,0], both length 2; the whole array has two 0s and one 1 so it does not qualify.' },
      { input: 'nums = [0,0,1,0,0,0,1,1]', output: '6', explanation: 'The stretch from index 1 to index 6 has three 0s and three 1s.' },
    ],
    constraints: ['1 <= nums.length <= 10^5', 'nums[i] is either 0 or 1'],
    signature: { kind: 'function', className: 'Solution', method: 'findMaxLength', params: [['nums', 'List[int]']], returns: 'int' },
    signals: [
      { phrase: 'exactly the same number of 0s as it does 1s', means: 'balanced count subarray, not just any sum' },
      { phrase: 'costs quadratic time', means: 'O(n^2) brute force explicitly too slow for n up to 10^5' },
      { phrase: 'treat every 0 in the array as if it were actually a -1', means: 'relabel to connect to zero-sum subarray counting' },
      { phrase: 'running totals rather than brute-force counting', means: 'prefix sum plus a hashmap of first-seen indices' },
    ],
    keyInfo: { input: 'binary array (0/1 only) up to 10^5 long', output: 'longest subarray length with equal 0s and 1s', target: 'O(n) via prefix sum with 0 relabeled as -1, tracked in a hashmap' },
    pattern: 'Prefix sum + first-seen index',
    ds: ['hashmap'],
    time: 'O(n)',
    space: 'O(n)',
    edgeCases: ['array of all 0s or all 1s (answer 0)', 'already perfectly balanced whole array', 'alternating 0s and 1s', 'single element array', 'the balanced stretch starting at index 0'],
    skills: ['prefix-sum', 'arrays-hashing'],
  },
  {
    id: 'statements-a:lc437',
    lc: 437,
    title: 'Path Sum III',
    difficulty: 'Medium',
    statement: `You are given the root of a binary tree where every node holds an integer value, which can be positive, negative, or zero, and an integer targetSum. You need to count how many distinct paths exist in the tree whose node values add up exactly to targetSum, where a qualifying path has two specific requirements: it must travel strictly downward, meaning from some ancestor node to one of its own descendant nodes following parent-to-child links only, and it does not need to start at the root or end at a leaf, it can begin and end at any two nodes as long as one is a genuine ancestor of the other.

This means a single node by itself, with no further movement, is itself a valid path of length one if that node's own value happens to equal targetSum, and a path is also allowed to pass straight through the root if the ancestor-descendant relationship holds across it. What a qualifying path can never do is turn sideways, going from one child branch over to a sibling branch through their shared parent in a way that is not strictly a continuous downward chain.

The tree can contain up to a thousand nodes and values can be surprisingly large in magnitude, including negative numbers, which rules out any assumption that longer paths always have larger sums, since a negative value along the way could bring a running total right back down to targetSum again later.`,
    examples: [
      { input: 'root = [10,5,-3,3,2,null,11,3,-2,null,1], targetSum = 8', output: '3', explanation: 'Three distinct downward paths sum to 8: 5->3, 5->2->1, and -3->11.' },
      { input: 'root = [5,4,8,11,null,13,4,7,2,null,null,5,1], targetSum = 22', output: '3', explanation: 'Three distinct downward paths through this tree sum to exactly 22.' },
    ],
    constraints: ['the number of nodes in the tree is in the range [0, 1000]', '-10^9 <= Node.val <= 10^9', '-1000 <= targetSum <= 1000'],
    signature: { kind: 'function', className: 'Solution', method: 'pathSum', params: [['root', 'Optional[TreeNode]'], ['targetSum', 'int']], returns: 'int' },
    helperClasses: ['TreeNode'],
    signals: [
      { phrase: 'travel strictly downward', means: 'parent-to-child direction only, no sideways jumps' },
      { phrase: 'does not need to start at the root or end at a leaf', means: 'any ancestor-descendant pair qualifies, not just root-to-leaf' },
      { phrase: 'never do is turn sideways', means: 'cannot combine two different branches through a shared parent' },
      { phrase: 'a negative value along the way could bring a running total right back down', means: 'running sum is not monotonic, need full prefix tracking not a shortcut' },
    ],
    keyInfo: { input: 'binary tree up to 1000 nodes, values can be negative', output: 'count of downward paths summing to targetSum', target: 'O(n) via prefix sums on the root-to-node path, undone on backtrack' },
    pattern: 'Prefix sums on a root-to-node path',
    ds: ['hashmap', 'tree'],
    time: 'O(n)',
    space: 'O(h)',
    edgeCases: ['empty tree (0 paths)', 'targetSum of 0 with zero-valued nodes present', 'all negative values', 'a single node equal to targetSum', 'a skewed tree that is really just a linked list'],
    skills: ['prefix-sum', 'tree-dfs'],
  },
  {
    id: 'statements-a:lc1235',
    lc: 1235,
    title: 'Maximum Profit in Job Scheduling',
    difficulty: 'Hard',
    statement: `A freelancer is choosing which jobs to accept out of n available offers, described by three parallel arrays: startTime, endTime, and profit, where job i begins at startTime[i], ends at endTime[i], and pays exactly profit[i] if taken. The freelancer can only work one job at a time, so any two jobs they accept must not overlap at all in time, although one job ending at the exact same moment another begins is considered fine, since there is no actual time conflict there.

The freelancer wants to choose a subset of these non-overlapping jobs that pays the maximum total profit achievable, and they want the actual number, not the list of which jobs were picked. A greedy strategy like always taking the job that pays the most, or always taking whichever job ends soonest, does not reliably produce the optimal answer here, since a high-paying job might block out two smaller jobs that would have paid more combined.

Both the number of jobs and the time values themselves can reach into the tens of thousands to nearly a billion respectively, which rules out building any kind of timeline array indexed directly by time value, so the team expects a solution that reasons about the jobs themselves, sorted sensibly, combined with some form of fast lookup to find which job can legally follow which.`,
    examples: [
      { input: 'startTime = [1,2,3,3], endTime = [3,4,5,6], profit = [50,10,40,70]', output: '120', explanation: 'Taking the job from 1 to 3 (profit 50) and the job from 3 to 6 (profit 70) gives a non-overlapping total of 120.' },
      { input: 'startTime = [1,2,3,4,6], endTime = [3,5,10,6,9], profit = [20,20,100,70,60]', output: '150', explanation: 'Taking the job from 1 to 3 (20), then 4 to 6 (70), then 6 to 9 (60) totals 150.' },
    ],
    constraints: ['1 <= startTime.length == endTime.length == profit.length <= 5 * 10^4', '1 <= startTime[i] < endTime[i] <= 10^9', '1 <= profit[i] <= 10^4'],
    signature: { kind: 'function', className: 'Solution', method: 'jobScheduling', params: [['startTime', 'List[int]'], ['endTime', 'List[int]'], ['profit', 'List[int]']], returns: 'int' },
    signals: [
      { phrase: 'must not overlap at all in time', means: 'weighted interval scheduling, pick a non-overlapping subset' },
      { phrase: 'ending at the exact same moment another begins is considered fine', means: 'touching endpoints are allowed, not a true overlap' },
      { phrase: 'does not reliably produce the optimal answer here', means: 'greedy by profit or by end time alone fails, need DP' },
      { phrase: 'rules out building any kind of timeline array indexed directly by time value', means: 'time values too large for a direct array, need sorting plus binary search' },
    ],
    keyInfo: { input: 'up to 5*10^4 jobs with start, end, profit (times up to 10^9)', output: 'maximum total profit from non-overlapping jobs', target: 'O(n log n) via sorted DP with binary search, since a time-indexed array is impossible' },
    pattern: 'Sort by start + DP + binary search',
    ds: ['array'],
    time: 'O(n log n)',
    space: 'O(n)',
    edgeCases: ['all jobs overlapping each other (pick only the best single one)', 'no jobs overlapping at all (take everything)', 'jobs that touch at endpoints exactly', 'a single job', 'many jobs with identical profit'],
    skills: ['dp-1d', 'binary-search', 'intervals'],
  },
]

export default { id: 'statements-a', statements }
