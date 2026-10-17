const items = [
  {
    id: 'thought:strings:valid-anagram',
    lc: 242,
    title: 'Valid Anagram',
    difficulty: 'Easy',
    category: 'strings',
    skills: ['arrays-hashing'],
    companies: ['amazon', 'microsoft', 'bloomberg'],
    statement: `You're given two strings s and t. Decide whether t is an anagram of s — meaning t uses exactly the same letters as s, same multiset of counts, just possibly reordered.

If the strings are different lengths they obviously can't match, so that's an instant no. Otherwise every letter's count in one string has to equal its count in the other.`,
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: 'true' },
      { input: 's = "rat", t = "car"', output: 'false' },
    ],
    constraints: ['1 <= s.length, t.length <= 5 * 10^4', 's and t consist of lowercase English letters only'],
    ds: {
      answer: 'dd(int) character counts',
      choices: ['dd(int) character counts', 'sorted lists compared directly', 'two pointers over sorted strings', 'set() of unique characters only'],
    },
    method: {
      answer: 'Tally every char of s up, every char of t down in one ==dd(int)==, then check all counts hit zero',
      choices: [
        'Tally every char of s up, every char of t down in one ==dd(int)==, then check all counts hit zero',
        'Sort both strings and compare them character by character',
        'Two pointers from both ends checking mirrored characters match',
        'Build a Counter for s only and check every char of t is in it',
      ],
    },
    code: `class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        if len(s) != len(t):
            return False

        counts = defaultdict(int)
        for c in s:
            counts[c] += 1
        for c in t:
            counts[c] -= 1

        return all(v == 0 for v in counts.values())`,
    blanks: [7, 9, 11],
    accept: { 7: ['counts[c] = counts[c] + 1'], 9: ['counts[c] = counts[c] - 1'] },
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(1)'], why: 'single pass over each string to tally counts' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(n^2)', 'O(26^n)'], why: 'at most 26 lowercase letters bounds the hashmap size' },
    sayIt: "I'll tally character counts for both strings in one pass each using a defaultdict, then check every count landed back at zero — O(n) time, O(1) extra space.",
    pitfall: "Skipping the length check wastes a pass comparing strings that can't match.",
  },
  {
    id: 'thought:strings:group-anagrams',
    lc: 49,
    title: 'Group Anagrams',
    difficulty: 'Medium',
    category: 'strings',
    skills: ['arrays-hashing'],
    companies: ['google', 'amazon', 'meta', 'bloomberg'],
    statement: `You get a list of lowercase words. Bucket them into groups where every word in a group is an anagram of every other word in that group, and return the groups in any order.

The trick is finding a key that's identical for any two anagrams but different otherwise — either a sorted version of the word, or a fixed-length count of how many of each letter it has.`,
    examples: [
      { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
    ],
    constraints: ['1 <= strs.length <= 10^4', '0 <= strs[i].length <= 100', 'strs[i] consists of lowercase English letters'],
    ds: {
      answer: "dd(list) keyed by a 26-length count tuple",
      choices: [
        "dd(list) keyed by a 26-length count tuple",
        "dd(list) keyed by sorted(word)",
        "Counter of counters, one per word",
        "set of frozenset(word) keys",
      ],
    },
    method: {
      answer: "For each word, build a 26-length letter count tuple as the hashmap key, then group words sharing that key via dd(list)",
      choices: [
        "For each word, build a 26-length letter count tuple as the hashmap key, then group words sharing that key via dd(list)",
        "Sort each word's letters and group identical sorted strings with a plain dict",
        "Compare every pair of words with Counter equality and union-find them into groups",
        "Hash each word's length and bucket by that into dd(list)",
      ],
    },
    code: `class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        groups = defaultdict(list)

        for word in strs:
            count = [0] * 26
            for c in word:
                count[ord(c) - ord('a')] += 1
            groups[tuple(count)].append(word)

        return list(groups.values())`,
    blanks: [7, 8, 10],
    time: { answer: 'O(n*k)', choices: ['O(n*k)', 'O(n*k log k)', 'O(n^2*k)', 'O(n log n)'], why: 'n words, each of length up to k, counted once' },
    space: { answer: 'O(n*k)', choices: ['O(n*k)', 'O(26)', 'O(n)', 'O(k)'], why: 'stores every word plus one 26-length tuple key per group' },
    sayIt: "I build a 26-length count tuple for each word as a hashmap key and group with a defaultdict(list) — O(n·k) time instead of sorting each word.",
    pitfall: 'Using sorted(word) works too but costs an extra log k factor.',
  },
  {
    id: 'thought:strings:longest-substring-without-repeating',
    lc: 3,
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    category: 'strings',
    skills: ['sliding-window', 'arrays-hashing'],
    companies: ['google', 'amazon', 'microsoft', 'meta', 'apple', 'bloomberg'],
    statement: `Given a string s, find the length of the longest contiguous substring that never repeats a character.

A brute-force check of every substring is too slow, so the standard move is a sliding window: grow the right edge, and the moment a character would repeat, snap the left edge forward past its previous occurrence instead of inching forward one step at a time.`,
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: '"abc" is the longest run with no repeats' },
      { input: 's = "bbbbb"', output: '1' },
    ],
    constraints: ['0 <= s.length <= 5 * 10^4', 's consists of English letters, digits, symbols and spaces'],
    ds: {
      answer: 'hashmap of char to last seen index + two pointers',
      choices: [
        'hashmap of char to last seen index + two pointers',
        'set() of chars in window + two pointers',
        'dd(int) running counts + two pointers',
        'deque of chars as the window',
      ],
    },
    method: {
      answer: "Slide right, jump left straight past a repeat using its last-seen index from the hashmap, track the widest window",
      choices: [
        "Slide right, jump left straight past a repeat using its last-seen index from the hashmap, track the widest window",
        "Expand right one char at a time, shrink left one char at a time removing from a set until no duplicate remains",
        "BFS from every starting index tracking the first repeat",
        "Sort the string and compare adjacent characters for duplicates",
      ],
    },
    code: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        seen = {}
        left = 0
        longest = 0

        for right, c in enumerate(s):
            if c in seen and seen[c] >= left:
                left = seen[c] + 1

            seen[c] = right
            longest = max(longest, right - left + 1)

        return longest`,
    blanks: [8, 10, 11],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n^2)', 'O(n log n)', 'O(26n)'], why: 'jumping left directly visits each index O(1) amortized times' },
    space: { answer: 'O(min(n, charset))', choices: ['O(min(n, charset))', 'O(n)', 'O(1)', 'O(n^2)'], why: 'hashmap holds at most one entry per distinct character' },
    sayIt: "Sliding window with a hashmap of last-seen index per character; on a repeat I jump left straight past it instead of inching forward — O(n) time.",
    pitfall: 'Only checking seen[c] exists, not that it is still inside the current window.',
  },
  {
    id: 'thought:strings:longest-repeating-character-replacement',
    lc: 424,
    title: 'Longest Repeating Character Replacement',
    difficulty: 'Medium',
    category: 'strings',
    skills: ['sliding-window', 'arrays-hashing'],
    companies: ['google'],
    statement: `You can change up to k characters in string s to any other character. After doing so, find the length of the longest substring where every character is the same.

Slide a window over s while tracking the count of the most frequent letter inside it. The window is valid as long as everything else in it — window size minus that top count — is at most k replacements; otherwise shrink from the left.`,
    examples: [
      { input: 's = "ABAB", k = 2', output: '4', explanation: 'replace both Bs with A (or vice versa)' },
      { input: 's = "AABABBA", k = 1', output: '4' },
    ],
    constraints: ['1 <= s.length <= 10^5', 's consists of only uppercase English letters', '0 <= k <= s.length'],
    ds: {
      answer: 'dd(int) sliding window counts + running maxCount',
      choices: [
        'dd(int) sliding window counts + running maxCount',
        'Counter snapshot recomputed every window',
        '26-length fixed array counts + two pointers',
        'set() of distinct chars in window',
      ],
    },
    method: {
      answer: "Expand right tallying counts and the window's best single-letter count, shrink left only when window minus that best count exceeds k",
      choices: [
        "Expand right tallying counts and the window's best single-letter count, shrink left only when window minus that best count exceeds k",
        "Try every one of the 26 letters as the dominant letter and re-scan the whole string for each",
        "Binary search the answer length and check feasibility with a fixed window scan",
        "Expand right, shrink left whenever any letter's count exceeds k",
      ],
    },
    code: `class Solution:
    def characterReplacement(self, s: str, k: int) -> int:
        counts = defaultdict(int)
        left = 0
        longest = 0
        maxCount = 0

        for right, c in enumerate(s):
            counts[c] += 1
            maxCount = max(maxCount, counts[c])

            while (right - left + 1) - maxCount > k:
                counts[s[left]] -= 1
                left += 1

            longest = max(longest, right - left + 1)

        return longest`,
    blanks: [11, 12, 15],
    accept: { 12: ['counts[s[left]] = counts[s[left]] - 1'] },
    time: { answer: 'O(n)', choices: ['O(n)', 'O(26n)', 'O(n^2)', 'O(n log n)'], why: 'one amortized pass; maxCount never needs to decrease' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(26n)', 'O(n^2)'], why: 'counts dict holds at most 26 letters' },
    sayIt: 'I track counts in the window and the count of its most frequent letter; the window stays valid while size minus that count is at most k, else I shrink left — O(n).',
    pitfall: 'Letting maxCount decrease on shrink breaks the amortized O(n) trick.',
  },
  {
    id: 'thought:strings:permutation-in-string',
    lc: 567,
    title: 'Permutation in String',
    difficulty: 'Medium',
    category: 'strings',
    skills: ['sliding-window', 'arrays-hashing'],
    companies: ['amazon', 'microsoft'],
    statement: `Given two strings s1 and s2, decide whether any contiguous substring of s2 is a permutation of s1 — same letters, same counts, any order.

Since a permutation only cares about letter counts, slide a fixed-size window of length len(s1) across s2 and compare its letter counts to s1's letter counts at every position.`,
    examples: [
      { input: 's1 = "ab", s2 = "eidbaooo"', output: 'true', explanation: '"ba" inside s2 is a permutation of "ab"' },
      { input: 's1 = "ab", s2 = "eidboaoo"', output: 'false' },
    ],
    constraints: ['1 <= s1.length, s2.length <= 10^4', 's1 and s2 consist of lowercase English letters'],
    ds: {
      answer: 'Counter sliding window compared to a fixed Counter of s1',
      choices: [
        'Counter sliding window compared to a fixed Counter of s1',
        'dd(int) counts + set of letters still missing',
        '26-length array counts + two pointers',
        'sorted(window) compared to sorted(s1) each slide',
      ],
    },
    method: {
      answer: "Keep a fixed-size window Counter over s2, slide one char at a time, and check equality against s1's Counter",
      choices: [
        "Keep a fixed-size window Counter over s2, slide one char at a time, and check equality against s1's Counter",
        "Try every substring of length len(s1) and sort it to compare against sorted(s1)",
        "Two pointers expanding and shrinking like minimum window substring until counts cover s1",
        "Backtrack over every permutation of s1 and search for it in s2",
      ],
    },
    code: `class Solution:
    def checkInclusion(self, s1: str, s2: str) -> bool:
        need = Counter(s1)
        window = Counter(s2[:len(s1)])

        if window == need:
            return True

        for right in range(len(s1), len(s2)):
            window[s2[right]] += 1
            left = s2[right - len(s1)]
            window[left] -= 1

            if window[left] == 0:
                del window[left]

            if window == need:
                return True

        return False`,
    blanks: [9, 11, 16],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n*m)', 'O(n log n)', 'O(m!)'], why: 'fixed-size window slides once per index of s2' },
    space: { answer: 'O(m)', choices: ['O(m)', 'O(n)', 'O(1)', 'O(n*m)'], why: "two Counters sized by s1's distinct letters, m = len(s1)" },
    sayIt: "I slide a fixed window of length len(s1) across s2, updating a running Counter, and check equality against s1's Counter each step — O(n).",
    pitfall: 'Rebuilding Counter(window) from scratch every slide instead of updating it incrementally.',
  },
  {
    id: 'thought:strings:minimum-window-substring',
    lc: 76,
    title: 'Minimum Window Substring',
    difficulty: 'Hard',
    category: 'strings',
    skills: ['sliding-window', 'arrays-hashing'],
    companies: ['google', 'amazon', 'microsoft', 'meta'],
    statement: `Given strings s and t, find the shortest contiguous substring of s that contains every character of t, including duplicates — or an empty string if no such window exists.

Expand a window over s, counting how many of t's required letters are currently satisfied in full. Once every required letter is satisfied, shrink the window from the left to look for something tighter before it breaks the condition again.`,
    examples: [
      { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"' },
      { input: 's = "a", t = "aa"', output: '""', explanation: 's does not have two a-s, so no window works' },
    ],
    constraints: ['1 <= s.length, t.length <= 10^5', 's and t consist of English letters'],
    ds: {
      answer: 'two Counters (need fixed, window sliding) + have/required counters',
      choices: [
        'two Counters (need fixed, window sliding) + have/required counters',
        'Counter for t only, scanning substrings of growing length',
        "set() of t's characters + two pointers",
        'dd(int) window counts, no separate have/required tracking',
      ],
    },
    method: {
      answer: "Expand right growing the window, track how many distinct required letters are fully satisfied (==have== == required), then shrink left while still satisfied to tighten the best window",
      choices: [
        "Expand right growing the window, track how many distinct required letters are fully satisfied (==have== == required), then shrink left while still satisfied to tighten the best window",
        "Try every possible left boundary and scan right until all of t is covered, recording the shortest",
        "Sort s and t then two-pointer match letters directly",
        "Only shrink left when a letter's count exceeds what's needed, like permutation-in-string",
      ],
    },
    code: `class Solution:
    def minWindow(self, s: str, t: str) -> str:
        if not t or len(t) > len(s):
            return ""

        need = Counter(t)
        window = defaultdict(int)
        have, required = 0, len(need)
        bestLen, bestLeft = float('inf'), 0
        left = 0

        for right, c in enumerate(s):
            window[c] += 1
            if c in need and window[c] == need[c]:
                have += 1

            while have == required:
                if right - left + 1 < bestLen:
                    bestLen, bestLeft = right - left + 1, left

                window[s[left]] -= 1
                if s[left] in need and window[s[left]] < need[s[left]]:
                    have -= 1
                left += 1

        return s[bestLeft:bestLeft + bestLen] if bestLen != float('inf') else ""`,
    blanks: [13, 18, 20],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n*m)', 'O(n^2)', 'O(n log n)'], why: 'left and right pointers each sweep s once' },
    space: { answer: 'O(m)', choices: ['O(m)', 'O(n)', 'O(1)', 'O(n+m)'], why: "need/window hashmaps sized by t's distinct letters" },
    sayIt: "I expand right tracking how many of t's letters are fully satisfied, and once all are, shrink left to tighten the window before it breaks — O(n) time, O(m) space.",
    pitfall: "Comparing window[c] to need[c] with > instead of ==, miscounting have.",
  },
  {
    id: 'thought:strings:valid-palindrome',
    lc: 125,
    title: 'Valid Palindrome',
    difficulty: 'Easy',
    category: 'strings',
    skills: ['two-pointers'],
    companies: ['microsoft', 'meta', 'apple'],
    statement: `Given a string s, decide whether it reads the same forwards and backwards once you ignore every character that isn't a letter or digit, and ignore case.

Rather than building a cleaned copy of the string, walk inward from both ends at once, skipping past anything that isn't alphanumeric, and compare the letters you land on (lowercased).`,
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'true' },
      { input: 's = "race a car"', output: 'false' },
    ],
    constraints: ['1 <= s.length <= 2 * 10^5', 's consists of printable ASCII characters'],
    ds: {
      answer: 'two pointers from both ends, skip non-alphanumeric in place',
      choices: [
        'two pointers from both ends, skip non-alphanumeric in place',
        'build a cleaned string then compare it to its reverse',
        'stack push front half, pop and compare to back half',
        'two pointers only after sorting the string',
      ],
    },
    method: {
      answer: "Walk left and right inward, skipping non-alphanumeric chars on each side, comparing lowercase letters until they cross",
      choices: [
        "Walk left and right inward, skipping non-alphanumeric chars on each side, comparing lowercase letters until they cross",
        "Strip all non-alphanumerics into a new string first, then check it equals its reverse",
        "Push every character onto a stack, then pop and compare against a second left-to-right scan",
        "Recursively peel one character off each end and recurse on the middle substring",
      ],
    },
    code: `class Solution:
    def isPalindrome(self, s: str) -> bool:
        left, right = 0, len(s) - 1

        while left < right:
            while left < right and not s[left].isalnum():
                left += 1
            while left < right and not s[right].isalnum():
                right -= 1

            if s[left].lower() != s[right].lower():
                return False

            left, right = left + 1, right - 1

        return True`,
    blanks: [6, 10, 13],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n^2)', 'O(n log n)', 'O(1)'], why: 'each pointer sweeps its half of s once' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'], why: 'no new string built, only two index pointers' },
    sayIt: 'Two pointers walk inward from both ends, skipping anything non-alphanumeric and comparing lowercase letters — O(n) time, O(1) space, no new string built.',
    pitfall: 'Forgetting to skip non-alphanumeric characters before comparing.',
  },
  {
    id: 'thought:strings:valid-palindrome-ii',
    lc: 680,
    title: 'Valid Palindrome II',
    difficulty: 'Easy',
    category: 'strings',
    skills: ['two-pointers'],
    companies: ['microsoft', 'meta'],
    statement: `Given a string s, decide whether it can be made into a palindrome by deleting at most one character.

Two-pointer scan inward as usual. The first time the two ends disagree, you have exactly one chance left: try skipping the left character or skipping the right character, and see if either remaining range is a clean palindrome on its own.`,
    examples: [
      { input: 's = "abca"', output: 'true', explanation: 'delete the c (or the b) to get "aba"' },
      { input: 's = "abc"', output: 'false' },
    ],
    constraints: ['1 <= s.length <= 10^5', 's consists of lowercase English letters'],
    ds: {
      answer: 'two pointers + a helper range-check function for the one-skip branch',
      choices: [
        'two pointers + a helper range-check function for the one-skip branch',
        'two pointers with a stack of mismatched indices',
        'two pointers, rebuild string without each char to test both',
        'recursion over the whole string trying every single deletion',
      ],
    },
    method: {
      answer: "Two-pointer scan; on the first mismatch, try skipping either the left or the right character and check if the remaining range is a palindrome",
      choices: [
        "Two-pointer scan; on the first mismatch, try skipping either the left or the right character and check if the remaining range is a palindrome",
        "Remove one character at a time from the whole string and check if any result is a palindrome",
        "Count mismatched pairs while scanning once; allow the final answer only if mismatches are at most 1",
        "Reverse the string and diff it character by character against the original",
      ],
    },
    code: `class Solution:
    def validPalindrome(self, s: str) -> bool:
        def isPalindromeRange(left, right):
            while left < right:
                if s[left] != s[right]:
                    return False
                left, right = left + 1, right - 1
            return True

        left, right = 0, len(s) - 1

        while left < right:
            if s[left] != s[right]:
                return isPalindromeRange(left + 1, right) or isPalindromeRange(left, right - 1)
            left, right = left + 1, right - 1

        return True`,
    blanks: [6, 13, 14],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n^2)', 'O(n log n)', 'O(1)'], why: 'at most one mismatch triggers two O(n) range checks' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'], why: 'only pointers, no extra string built' },
    sayIt: 'Two-pointer scan inward; on the first mismatch I try skipping either side once and check if what is left is a palindrome — O(n).',
    pitfall: 'Allowing more than one skip, or not trying both skip directions.',
  },
  {
    id: 'thought:strings:palindromic-substrings',
    lc: 647,
    title: 'Palindromic Substrings',
    difficulty: 'Medium',
    category: 'strings',
    skills: ['two-pointers'],
    companies: ['amazon', 'microsoft', 'meta'],
    statement: `Given a string s, count how many substrings of s are palindromes — the same substring appearing at different positions counts separately each time.

Every palindrome has a center: either a single character (odd length) or a gap between two characters (even length). Expand outward from every possible center and count every step that still matches on both sides.`,
    examples: [
      { input: 's = "abc"', output: '3', explanation: '"a", "b", "c" are the only palindromic substrings' },
      { input: 's = "aaa"', output: '6', explanation: '"a", "a", "a", "aa", "aa", "aaa"' },
    ],
    constraints: ['1 <= s.length <= 1000', 's consists of lowercase English letters'],
    ds: {
      answer: 'nonlocal counter + expand-around-center helper, no table',
      choices: [
        'nonlocal counter + expand-around-center helper, no table',
        '2-D dp table of is-palindrome booleans',
        'stack of (left, right) ranges to expand',
        "Manacher's array of palindrome radii",
      ],
    },
    method: {
      answer: "For every index as an odd center and every gap as an even center, expand outward while it still matches, tallying into a ==nonlocal== total",
      choices: [
        "For every index as an odd center and every gap as an even center, expand outward while it still matches, tallying into a ==nonlocal== total",
        "Fill a 2-D dp table bottom-up where dp[i][j] means s[i:j+1] is a palindrome",
        "Generate every substring and check each one with a two-pointer palindrome test",
        "Run Manacher's algorithm to compute palindrome radius arrays in one pass",
      ],
    },
    code: `class Solution:
    def countSubstrings(self, s: str) -> int:
        total = 0

        def expand(left, right):
            nonlocal total
            while left >= 0 and right < len(s) and s[left] == s[right]:
                total += 1
                left -= 1
                right += 1

        for center in range(len(s)):
            expand(center, center)
            expand(center, center + 1)

        return total`,
    blanks: [7, 12, 13],
    accept: { 7: ['total = total + 1'] },
    time: { answer: 'O(n^2)', choices: ['O(n^2)', 'O(n log n)', 'O(n)', 'O(n^3)'], why: 'n centers, each expansion can walk O(n) outward' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(n^2)', 'O(n log n)'], why: 'only pointers and a running total, no table' },
    sayIt: 'I expand outward from every odd and even center, tallying each matching step into a nonlocal total — O(n^2) time, O(1) space, no dp table needed.',
    pitfall: 'Forgetting the even-length center call expand(center, center + 1).',
  },
  {
    id: 'thought:strings:encode-and-decode-strings',
    lc: 271,
    title: 'Encode and Decode Strings',
    difficulty: 'Medium',
    category: 'strings',
    skills: ['two-pointers', 'arrays-hashing'],
    companies: ['google', 'meta'],
    statement: `Design an encode(strs) function that joins a list of strings into one string, and a decode(s) function that perfectly recovers the original list — even when the strings themselves contain any character, including commas, spaces, or whatever delimiter you were about to pick.

The standard trick is to never rely on a separator character that could appear inside the data. Instead, prefix each string with its own length and a delimiter the length itself can't be confused with, so decoding always knows exactly how many characters to read next.`,
    examples: [
      { input: 'strs = ["lint","code","love","you"]', output: '["lint","code","love","you"]', explanation: 'decode(encode(strs)) returns the original list' },
      { input: 'strs = ["we","say",":","yes"]', output: '["we","say",":","yes"]' },
    ],
    constraints: ['1 <= strs.length <= 200', '0 <= strs[i].length <= 200', 'strs[i] can contain any possible characters'],
    ds: {
      answer: "length-prefixed string with a '#' delimiter, parsed with two index pointers",
      choices: [
        "length-prefixed string with a '#' delimiter, parsed with two index pointers",
        'split on a comma delimiter between words',
        'a fixed-width padding scheme with spaces',
        'store strings as a list of (length, string) tuples directly without encoding',
      ],
    },
    method: {
      answer: "Encode each word as len#word concatenated; decode by scanning to the next # for the length, then slicing exactly that many characters",
      choices: [
        "Encode each word as len#word concatenated; decode by scanning to the next # for the length, then slicing exactly that many characters",
        "Pick a rare separator character and split the encoded string on it",
        "Store the number of words up front then split evenly by average length",
        "Use JSON serialization to join and split the list of strings",
      ],
    },
    code: `class Solution:
    def encode(self, strs: List[str]) -> str:
        return "".join(f"{len(s)}#{s}" for s in strs)

    def decode(self, s: str) -> List[str]:
        result = []
        i = 0

        while i < len(s):
            j = i
            while s[j] != "#":
                j += 1

            length = int(s[i:j])
            result.append(s[j + 1:j + 1 + length])
            i = j + 1 + length

        return result`,
    blanks: [11, 14, 15],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n^2)', 'O(n log n)', 'O(1)'], why: 'encode and decode each scan every character once' },
    space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(n^2)', 'O(log n)'], why: 'builds one new string/list roughly the size of the input' },
    sayIt: "I prefix every string with its length and a # delimiter so decode always knows exactly how many characters to read next, regardless of content — O(n).",
    pitfall: 'Splitting on a plain delimiter instead of a length prefix breaks if data contains that delimiter.',
  },
  {
    id: 'thought:strings:reverse-words-in-a-string',
    lc: 151,
    title: 'Reverse Words in a String',
    difficulty: 'Medium',
    category: 'strings',
    skills: ['two-pointers'],
    companies: ['microsoft', 'apple', 'bloomberg'],
    statement: `Given a string s containing words separated by spaces, return a string with the words in reverse order, using a single space between words and no leading, trailing, or doubled-up spaces even if the input had extra ones.

Python's split() already collapses any run of whitespace and drops empty pieces, so the real work is just reversing the resulting list of words and joining it back with single spaces.`,
    examples: [
      { input: 's = "  hello world  "', output: '"world hello"' },
      { input: 's = "a good   example"', output: '"example good a"' },
    ],
    constraints: ['1 <= s.length <= 10^4', 's contains English letters, spaces, and digits', 'there is at least one word in s'],
    ds: {
      answer: 's.split() word list + two pointers to reverse in place',
      choices: [
        's.split() word list + two pointers to reverse in place',
        'stack push each word, pop to reverse order',
        'deque of words, reverse via rotation',
        'split on single spaces then filter empties manually',
      ],
    },
    method: {
      answer: "Split on whitespace to drop extra spaces for free, two-pointer swap the word list end to end, rejoin with single spaces",
      choices: [
        "Split on whitespace to drop extra spaces for free, two-pointer swap the word list end to end, rejoin with single spaces",
        "Reverse the whole character string, then reverse each word back in place",
        "Push every word onto a stack while scanning, then pop them all into the result",
        "Recursively reverse: last word + space + reverse of the rest",
      ],
    },
    code: `class Solution:
    def reverseWords(self, s: str) -> str:
        words = s.split()
        left, right = 0, len(words) - 1

        while left < right:
            words[left], words[right] = words[right], words[left]
            left += 1
            right -= 1

        return " ".join(words)`,
    blanks: [2, 6, 10],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n^2)', 'O(n log n)', 'O(1)'], why: 'split, swap pass, and join are each linear in s' },
    space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(n^2)', 'O(log n)'], why: 'the word list and joined result are both sized to the input' },
    sayIt: 's.split() already drops extra whitespace for free, then I two-pointer swap the word list and rejoin with single spaces — O(n) time and space.',
    pitfall: 'Using s.split(" ") instead of s.split() leaves empty strings from extra spaces.',
  },
  {
    id: 'thought:strings:string-to-integer-atoi',
    lc: 8,
    title: 'String to Integer (atoi)',
    difficulty: 'Medium',
    category: 'strings',
    skills: ['math'],
    companies: ['amazon', 'microsoft', 'meta', 'bloomberg'],
    statement: `Implement a function that converts a string to a 32-bit signed integer, mimicking the rules of C's atoi: skip leading whitespace, read an optional + or - sign, read as many digits as follow, stop at the first non-digit character, and clamp the result into the 32-bit signed integer range if it overflows.

Any invalid string with no digits at all should just produce 0, not an error.`,
    examples: [
      { input: 's = "   -042"', output: '-42' },
      { input: 's = "4193 with words"', output: '4193' },
    ],
    constraints: ['0 <= s.length <= 200', 's consists of English letters, digits, spaces, "+", "-" and "."'],
    ds: {
      answer: 'single pointer scan with running sign/digit accumulators, clamp at the end',
      choices: [
        'single pointer scan with running sign/digit accumulators, clamp at the end',
        'stack of digit characters popped to build the number',
        'regex match for an optional sign plus digits',
        'split on the first non-digit character',
      ],
    },
    method: {
      answer: "Strip whitespace, read an optional sign, accumulate digits left to right into an int, then clamp the result into the 32-bit signed range",
      choices: [
        "Strip whitespace, read an optional sign, accumulate digits left to right into an int, then clamp the result into the 32-bit signed range",
        "Use Python's int() directly on the whole string and catch ValueError",
        "Reverse the string, read digits from the back, then multiply by the sign",
        "Use regex to extract the leading sign-and-digits pattern in one call",
      ],
    },
    code: `class Solution:
    def myAtoi(self, s: str) -> int:
        s = s.strip()
        if not s:
            return 0

        sign, i = 1, 0
        if s[0] in "+-":
            sign = -1 if s[0] == "-" else 1
            i += 1

        digits = 0
        while i < len(s) and s[i].isdigit():
            digits = digits * 10 + int(s[i])
            i += 1

        result = sign * digits
        return max(-2**31, min(result, 2**31 - 1))`,
    blanks: [8, 13, 17],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n^2)', 'O(log n)', 'O(1)'], why: 'one left-to-right scan over the characters' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'], why: 'only a few integer accumulators, no extra array' },
    sayIt: 'I strip whitespace, read an optional sign, accumulate digits left to right, then clamp the result into the 32-bit signed range — O(n) time, O(1) space.',
    pitfall: 'Clamping after multiplying by sign but before the digit loop stops correctly.',
  },
  {
    id: 'thought:strings:zigzag-conversion',
    lc: 6,
    title: 'Zigzag Conversion',
    difficulty: 'Medium',
    category: 'strings',
    skills: ['math'],
    companies: ['amazon', 'microsoft', 'apple'],
    statement: `Write the characters of string s in a zigzag pattern across numRows rows — straight down one column, then diagonally back up, then straight down again — and return the string formed by reading row by row left to right.

Rather than computing each character's final (row, column) position with a formula, you can simulate it: walk through s once, append each character to whichever row you're currently on, and bounce that row pointer between 0 and numRows-1.`,
    examples: [
      { input: 's = "PAYPALISHIRING", numRows = 3', output: '"PAHNAPLSIIGYIR"' },
      { input: 's = "PAYPALISHIRING", numRows = 4', output: '"PINALSIGYAHRPI"' },
    ],
    constraints: ['1 <= s.length <= 1000', '1 <= numRows <= 1000'],
    ds: {
      answer: 'list of numRows strings (buckets) + a bouncing row pointer',
      choices: [
        'list of numRows strings (buckets) + a bouncing row pointer',
        '2-D grid of characters indexed by (row, col)',
        'dd(list) keyed by column index',
        'deque that rotates characters into rows',
      ],
    },
    method: {
      answer: "Walk the string once, appending each char to its current row bucket, and flip the row step between +1 and -1 at the top and bottom rows",
      choices: [
        "Walk the string once, appending each char to its current row bucket, and flip the row step between +1 and -1 at the top and bottom rows",
        "Compute each character's (row, col) with a formula based on a 2*numRows-2 cycle and place it directly",
        "Split the string into numRows equal chunks and interleave them",
        "Build a 2-D grid of size numRows by len(s) and fill it diagonally",
      ],
    },
    code: `class Solution:
    def convert(self, s: str, numRows: int) -> str:
        if numRows == 1:
            return s

        rows = [""] * numRows
        row, step = 0, 1

        for c in s:
            rows[row] += c

            if row == 0:
                step = 1
            elif row == numRows - 1:
                step = -1

            row += step

        return "".join(rows)`,
    blanks: [9, 13, 16],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n^2)', 'O(n log n)', 'O(numRows*n)'], why: 'one pass appending each character to its row once' },
    space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(numRows)', 'O(n^2)'], why: 'the row buckets together hold every character once' },
    sayIt: 'I simulate it: walk s once appending each char to its current row bucket, bouncing the row pointer between top and bottom — O(n) time and space.',
    pitfall: 'Flipping direction at the wrong row, off by one from numRows - 1.',
  },
  {
    id: 'thought:strings:isomorphic-strings',
    lc: 205,
    title: 'Isomorphic Strings',
    difficulty: 'Easy',
    category: 'strings',
    skills: ['arrays-hashing'],
    companies: ['google', 'apple'],
    statement: `Given two strings s and t of the same length, decide whether they're isomorphic: there must exist a way to replace every character in s with another character (always the same replacement) so that it becomes exactly t, and that mapping has to be one-to-one in both directions.

It's not enough to track s's characters mapping to t's — two different characters in s are also not allowed to map to the same character in t, so you need to check both directions as you scan.`,
    examples: [
      { input: 's = "egg", t = "add"', output: 'true', explanation: 'e maps to a, g maps to d, consistently' },
      { input: 's = "foo", t = "bar"', output: 'false', explanation: 'both os in foo would need two different mappings' },
    ],
    constraints: ['1 <= s.length <= 5 * 10^4', 't.length == s.length', 's and t consist of any valid ASCII character'],
    ds: {
      answer: 'two hashmaps, one s-to-t and one t-to-s, enforced both directions',
      choices: [
        'two hashmaps, one s-to-t and one t-to-s, enforced both directions',
        'single hashmap s-to-t only',
        'two Counters compared by sorted values',
        'a single bijection array indexed by ord(char)',
      ],
    },
    method: {
      answer: "Walk both strings together; maintain forward and backward character maps and bail the moment either mapping would conflict",
      choices: [
        "Walk both strings together; maintain forward and backward character maps and bail the moment either mapping would conflict",
        "Check that both strings have the same multiset of characters, ignoring order",
        "Only track the s-to-t mapping, assuming t-to-s is automatically consistent",
        "Compare sorted(s) directly against sorted(t) for equality",
      ],
    },
    code: `class Solution:
    def isIsomorphic(self, s: str, t: str) -> bool:
        mapST = {}
        mapTS = {}

        for a, b in zip(s, t):
            if a in mapST and mapST[a] != b:
                return False
            if b in mapTS and mapTS[b] != a:
                return False

            mapST[a] = b
            mapTS[b] = a

        return True`,
    blanks: [8, 11, 12],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n^2)', 'O(n log n)', 'O(26n)'], why: 'single pass over paired characters of s and t' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(n^2)', 'O(log n)'], why: 'at most a charset-bounded number of entries per map' },
    sayIt: 'I keep two hashmaps, s-to-t and t-to-s, and bail the moment either mapping would conflict — O(n) time, O(1) space.',
    pitfall: 'Only checking s-to-t and missing collisions in the reverse direction.',
  },
  {
    id: 'thought:strings:roman-to-integer',
    lc: 13,
    title: 'Roman to Integer',
    difficulty: 'Easy',
    category: 'strings',
    skills: ['math', 'arrays-hashing'],
    companies: ['amazon', 'microsoft', 'apple', 'bloomberg'],
    statement: `Convert a Roman numeral string into its integer value. Each symbol (I, V, X, L, C, D, M) has a fixed value, and the only wrinkle is the subtractive notation — a smaller-value symbol placed right before a larger one means subtract instead of add, like IV meaning 4 instead of 6.

Scanning left to right, you only need to look one symbol ahead: if the next symbol outranks the current one, the current one's value gets subtracted instead of added.`,
    examples: [
      { input: 's = "III"', output: '3' },
      { input: 's = "MCMXCIV"', output: '1994' },
    ],
    constraints: ['1 <= s.length <= 15', 's contains only the characters I, V, X, L, C, D, M', 's is guaranteed to be a valid roman numeral in the range [1, 3999]'],
    ds: {
      answer: 'symbol-to-value hashmap + one-character lookahead',
      choices: [
        'symbol-to-value hashmap + one-character lookahead',
        'stack push values, pop and subtract when a smaller value follows',
        'sort symbols by value first then sum',
        'dd(int) counting symbol occurrences then multiplying',
      ],
    },
    method: {
      answer: "Map each symbol to its value; walk left to right and subtract a symbol's value whenever the next symbol is strictly larger, otherwise add it",
      choices: [
        "Map each symbol to its value; walk left to right and subtract a symbol's value whenever the next symbol is strictly larger, otherwise add it",
        "Push each value onto a stack, then pop pairs and subtract when the top is smaller than the one below",
        "Scan right to left, subtracting whenever the current value is smaller than the running max seen so far",
        "Replace every known two-letter subtractive pair like IV or IX with a placeholder before summing",
      ],
    },
    code: `class Solution:
    def romanToInt(self, s: str) -> int:
        values = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
        total = 0

        for i, c in enumerate(s):
            if i + 1 < len(s) and values[c] < values[s[i + 1]]:
                total -= values[c]
            else:
                total += values[c]

        return total`,
    blanks: [6, 7, 9],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n^2)', 'O(log n)', 'O(1)'], why: 'single left-to-right scan with O(1) lookahead per symbol' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'], why: 'the symbol table is a fixed 7-entry hashmap' },
    sayIt: 'I map each symbol to its value and look one symbol ahead; if the next one outranks the current, I subtract instead of add — O(n) time, O(1) space.',
    pitfall: 'Comparing the wrong pair, or checking i - 1 instead of i + 1.',
  },
  {
    id: 'thought:strings:find-first-occurrence',
    lc: 28,
    title: 'Find the Index of the First Occurrence in a String',
    difficulty: 'Easy',
    category: 'strings',
    skills: ['two-pointers'],
    companies: ['amazon', 'microsoft', 'meta'],
    statement: `Given two strings haystack and needle, return the index of the first occurrence of needle inside haystack, or -1 if needle never appears there at all.

The straightforward approach tries every possible starting index in haystack and checks whether needle matches character by character from there, stopping as soon as a mismatch rules that start out.`,
    examples: [
      { input: 'haystack = "sadbutsad", needle = "sad"', output: '0', explanation: 'the first occurrence starts at index 0' },
      { input: 'haystack = "leetcode", needle = "leeto"', output: '-1' },
    ],
    constraints: ['1 <= haystack.length, needle.length <= 10^4', 'haystack and needle consist of only lowercase English characters'],
    ds: {
      answer: 'two nested index loops, no hashing needed',
      choices: [
        'two nested index loops, no hashing needed',
        'KMP failure-function table over the needle',
        'rolling hash of each window compared to hash(needle)',
        'build a trie of the needle and walk haystack through it',
      ],
    },
    method: {
      answer: "Slide a start index over every valid offset in haystack, and at each one compare needle character by character, breaking early on a mismatch",
      choices: [
        "Slide a start index over every valid offset in haystack, and at each one compare needle character by character, breaking early on a mismatch",
        "Build the KMP failure function for needle, then scan haystack once skipping redundant comparisons",
        "Hash every window of haystack of length len(needle) and compare it to hash(needle)",
        "Use needle as a regex pattern and search for the first match",
      ],
    },
    code: `class Solution:
    def strStr(self, haystack: str, needle: str) -> int:
        n, m = len(haystack), len(needle)

        for start in range(n - m + 1):
            matched = True

            for offset in range(m):
                if haystack[start + offset] != needle[offset]:
                    matched = False
                    break

            if matched:
                return start

        return -1`,
    blanks: [4, 8, 12],
    time: { answer: 'O(n*m)', choices: ['O(n*m)', 'O(n+m)', 'O(n log m)', 'O(n)'], why: 'naive scan compares up to m chars at each start' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(m)', 'O(n+m)'], why: 'only index counters, no extra structure built' },
    sayIt: 'I try every valid start index and compare characters one by one, breaking early on a mismatch — O(n·m) time, O(1) space, no preprocessing needed.',
    pitfall: 'Looping start up to len(haystack) instead of len(haystack) - len(needle) + 1.',
  },
  {
    id: 'thought:strings:first-unique-character',
    lc: 387,
    title: 'First Unique Character in a String',
    difficulty: 'Easy',
    category: 'strings',
    skills: ['arrays-hashing'],
    companies: ['amazon', 'bloomberg'],
    statement: `Given a string s, find the index of the first character that appears exactly once in the whole string, or -1 if every character repeats.

Since uniqueness depends on the WHOLE string's counts, not just what's been seen so far, you need two passes: one to tally every character's total count, and a second to walk left to right looking for the first one whose total count is exactly 1.`,
    examples: [
      { input: 's = "leetcode"', output: '0', explanation: "l is the first character with count 1" },
      { input: 's = "aabb"', output: '-1' },
    ],
    constraints: ['1 <= s.length <= 10^5', 's consists of only lowercase English letters'],
    ds: {
      answer: 'Counter for frequencies + a second pass for first count == 1',
      choices: [
        'Counter for frequencies + a second pass for first count == 1',
        'dd(list) of character to all indices it appears at',
        'single pass removing duplicates into a set as it goes',
        'sort characters with their original indices then scan for a singleton',
      ],
    },
    method: {
      answer: "Count every character's frequency first with a Counter, then re-scan in order and return the first index whose count is exactly one",
      choices: [
        "Count every character's frequency first with a Counter, then re-scan in order and return the first index whose count is exactly one",
        "Scan once keeping a set of seen characters and return the first one not in a second duplicates set",
        "Remove every character that appears more than once, then return the index of whatever remains first",
        "Build a hashmap of character to its first index only, then check each for uniqueness",
      ],
    },
    code: `class Solution:
    def firstUniqChar(self, s: str) -> int:
        counts = Counter(s)

        for i, c in enumerate(s):
            if counts[c] == 1:
                return i

        return -1`,
    blanks: [2, 5, 8],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n^2)', 'O(26n)', 'O(n log n)'], why: 'one pass to count, one pass to find the first unique index' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(n log n)', 'O(n^2)'], why: 'Counter holds at most a fixed-size alphabet of keys' },
    sayIt: 'I count every character total frequency first with a Counter, then re-scan for the first index whose count is exactly one — O(n) time, O(1) space.',
    pitfall: 'Checking uniqueness during the first pass before every count is finalized.',
  },
  {
    id: 'thought:strings:longest-common-prefix',
    lc: 14,
    title: 'Longest Common Prefix',
    difficulty: 'Easy',
    category: 'strings',
    skills: ['two-pointers'],
    companies: ['google', 'amazon', 'apple'],
    statement: `Given a list of strings, find the longest prefix string that all of them share. If there's no common prefix at all, return an empty string.

Use the first string as a yardstick and check column by column: for position i, see whether every other string still has a character at i and whether it matches the first string's character there. The moment one doesn't, the prefix found so far is the answer.`,
    examples: [
      { input: 'strs = ["flower","flow","flight"]', output: '"fl"' },
      { input: 'strs = ["dog","racecar","car"]', output: '""', explanation: 'no common prefix between all three' },
    ],
    constraints: ['1 <= strs.length <= 200', '0 <= strs[i].length <= 200', 'strs[i] consists of only lowercase English letters'],
    ds: {
      answer: 'vertical scan comparing column i across all words to the first word',
      choices: [
        'vertical scan comparing column i across all words to the first word',
        'sort strs, then compare only the first and last strings',
        'trie built from all words, walk down while only one child exists',
        'zip() all words together and compare columns that way',
      ],
    },
    method: {
      answer: "Scan column by column using strs[0] as the reference character, and the moment any other word differs or runs out, return the prefix up to there",
      choices: [
        "Scan column by column using strs[0] as the reference character, and the moment any other word differs or runs out, return the prefix up to there",
        "Sort the list of strings, then the common prefix only needs comparing the first and last elements",
        "Insert every word into a trie, then walk from the root while each node has exactly one child",
        "Binary search the prefix length, checking at each midpoint whether all words share that much prefix",
      ],
    },
    code: `class Solution:
    def longestCommonPrefix(self, strs: List[str]) -> str:
        if not strs:
            return ""

        for i in range(len(strs[0])):
            c = strs[0][i]

            for word in strs[1:]:
                if i == len(word) or word[i] != c:
                    return strs[0][:i]

        return strs[0]`,
    blanks: [6, 9, 10],
    time: { answer: 'O(S)', choices: ['O(S)', 'O(n log n)', 'O(n*m)', 'O(S log S)'], why: 'S = total characters across all strings worst case' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(S)', 'O(n)', 'O(log S)'], why: 'only a slice of the first string is returned' },
    sayIt: 'I use the first string as reference and scan column by column across the rest, stopping the moment any word differs or runs out — O(S) time.',
    pitfall: 'Forgetting to check i == len(word) before indexing word[i].',
  },
  {
    id: 'thought:strings:string-compression',
    lc: 443,
    title: 'String Compression',
    difficulty: 'Medium',
    category: 'strings',
    skills: ['two-pointers'],
    companies: ['microsoft', 'bloomberg'],
    statement: `You're given an array of characters. Compress it in place by replacing each run of repeated characters with the character followed by the run's length (only when the run is longer than 1), and return the new length of the array.

You must modify the input array in place using only O(1) extra space beyond the pointers you need. Characters past the returned length can be ignored.`,
    examples: [
      { input: 'chars = ["a","a","b","b","c","c","c"]', output: '6, chars = ["a","2","b","2","c","3"]', explanation: 'each run of 2+ gets its count written out as separate characters' },
      { input: 'chars = ["a"]', output: '1, chars = ["a"]', explanation: 'a run of length 1 writes no digit' },
    ],
    constraints: ['1 <= chars.length <= 2000', 'chars[i] is a lowercase/uppercase English letter, digit, or symbol'],
    ds: {
      answer: 'two pointers (read, write) over the chars array, mutated in place',
      choices: ['two pointers (read, write) over the chars array, mutated in place', 'dict Counter of character frequencies built first, then rewritten', 'stack of (char, count) pairs popped at the end to rebuild the array', 'new output list, chars copied over at the end'],
    },
    method: {
      answer: "Two pointers: ==read scans forward counting a run of the same character==, then ==write the character once==, and if the run length is more than 1, write out each digit of the count one character at a time, all in place",
      choices: [
        "Two pointers: ==read scans forward counting a run of the same character==, then ==write the character once==, and if the run length is more than 1, write out each digit of the count one character at a time, all in place",
        "Build a separate string like char + str(count) for every run, then copy that whole string back over chars",
        'Use a dict to count every character in the whole array first, then write pairs out in dict order',
        "Two pointers, but always write the count even when it's 1, then strip trailing '1's afterward",
      ],
    },
    code: `class Solution:
    def compress(self, chars: List[str]) -> int:
        write = 0
        read = 0

        while read < len(chars):
            char = chars[read]
            count = 0

            while read < len(chars) and chars[read] == char:
                read += 1
                count += 1

            chars[write] = char
            write += 1

            if count > 1:
                for digit in str(count):
                    chars[write] = digit
                    write += 1

        return write`,
    blanks: [10, 13, 18],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(1)'], why: 'read advances through the array once total across all runs' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'], why: 'compresses in place aside from a few pointers and the digit string' },
    sayIt: 'Read pointer counts each run, write pointer lays down the char and then the digits of the run length only if count > 1, all in place; O(n) time, O(1) space.',
    pitfall: "A run of length 1 writes just the character — no '1' digit gets appended.",
  },
  {
    id: 'thought:strings:text-justification',
    lc: 68,
    title: 'Text Justification',
    difficulty: 'Hard',
    category: 'strings',
    skills: ['arrays-hashing'],
    companies: ['google', 'meta'],
    statement: `Given an array of words and a width maxWidth, format the text into lines that are fully justified: each line (except the last) has exactly maxWidth characters, padded with extra spaces between words so both edges are flush.

Pack as many words as possible onto each line without exceeding maxWidth, distributing extra spaces as evenly as possible between words, with the leftmost gaps getting any extra space when it doesn't divide evenly. The last line should be left-justified instead, with no extra space between words and only trailing spaces to pad it out.`,
    examples: [
      { input: 'words = ["This","is","an","example","of","text","justification."], maxWidth = 16', output: '["This    is    an", "example  of text", "justification.  "]', explanation: 'first two lines distribute extra spaces evenly; the last line is left-justified with trailing padding' },
    ],
    constraints: ['1 <= words.length <= 300', '1 <= words[i].length <= 20', '1 <= maxWidth <= 100'],
    ds: {
      answer: 'greedy word-wrap: accumulate words into a line list, flush and redistribute spaces when the next word would overflow',
      choices: ['greedy word-wrap: accumulate words into a line list, flush and redistribute spaces when the next word would overflow', '2-D dp table minimizing total raggedness across all line breaks', 'binary search on the number of lines, checking feasibility of a max line width', 'queue of words popped one line-width at a time regardless of word boundaries'],
    },
    method: {
      answer: "Greedy line-fill: keep adding words while ==length + mandatory single spaces + the next word still fits==, then on overflow distribute the leftover spaces ==round-robin across the gaps, leftmost gaps getting the extra one==; the ==very last line is left-justified with simple trailing padding==, not evenly distributed",
      choices: [
        "Greedy line-fill: keep adding words while ==length + mandatory single spaces + the next word still fits==, then on overflow distribute the leftover spaces ==round-robin across the gaps, leftmost gaps getting the extra one==; the ==very last line is left-justified with simple trailing padding==, not evenly distributed",
        'Greedy line-fill, but every line including the last is evenly space-distributed the same way',
        "DP that considers every possible line-break point to minimize the sum of squared leftover spaces (like a word processor's paragraph breaking)",
        'Split on every single space first into a flat token list, then just insert a newline every maxWidth characters',
      ],
    },
    code: `class Solution:
    def fullJustify(self, words: List[str], maxWidth: int) -> List[str]:
        result = []
        line = []
        length = 0

        for word in words:
            if length + len(line) + len(word) > maxWidth:
                for i in range(maxWidth - length):
                    line[i % (len(line) - 1 or 1)] += " "
                result.append("".join(line))
                line, length = [], 0

            line.append(word)
            length += len(word)

        lastLine = " ".join(line)
        result.append(lastLine + " " * (maxWidth - len(lastLine)))
        return result`,
    blanks: [7, 9, 17],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n^2)', 'O(n log n)', 'O(n * maxWidth)'], why: 'each word and space character is processed a constant number of times (n = total characters)' },
    space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(maxWidth)', 'O(n^2)'], why: 'result holds every line, each roughly maxWidth characters long' },
    sayIt: 'Greedy fill each line until the next word overflows, then round-robin the leftover spaces across the gaps, leftmost gaps first; the last line alone is just left-justified with padding; O(n) time.',
    pitfall: 'The last line is NOT space-distributed like the others — it is single-spaced and padded on the right only.',
  },
  {
    id: 'thought:strings:compare-version-numbers',
    lc: 165,
    title: 'Compare Version Numbers',
    difficulty: 'Medium',
    category: 'strings',
    skills: ['two-pointers'],
    companies: ['amazon', 'microsoft'],
    statement: `Given two version strings, version1 and version2, compare them. A version string is a sequence of revisions separated by dots, e.g. "1.01" or "1.001.0". Each revision is compared as an integer, so leading zeros don't matter and a missing trailing revision is treated as 0.

Return -1 if version1 < version2, 1 if version1 > version2, and 0 if they're equal.`,
    examples: [
      { input: 'version1 = "1.01", version2 = "1.001"', output: '0', explanation: "revision '01' and '001' both parse to the integer 1" },
      { input: 'version1 = "1.0", version2 = "1.0.0"', output: '0', explanation: "the missing third revision of version1 is treated as 0, matching version2's trailing 0" },
    ],
    constraints: ['1 <= version1.length, version2.length <= 500', 'each revision contains only digits', 'no leading zeros in a non-zero revision unless written that way in input'],
    ds: {
      answer: 'split both versions on "." into revision lists, compared index by index as integers',
      choices: ['split both versions on "." into revision lists, compared index by index as integers', 'two pointers scanning both raw strings character by character, comparing digit runs', 'pad both strings with leading zeros to equal length, then compare lexicographically', 'convert each version to a single float and compare directly'],
    },
    method: {
      answer: 'Split both versions on ==\".\"== into revision lists, pad the shorter one with an implicit ==0 for any missing trailing revision==, and compare each revision as an ==integer (which drops leading zeros for free)==, returning as soon as a difference is found',
      choices: [
        'Split both versions on ==\".\"== into revision lists, pad the shorter one with an implicit ==0 for any missing trailing revision==, and compare each revision as an ==integer (which drops leading zeros for free)==, returning as soon as a difference is found',
        "Convert each full version string to a float (e.g. '1.01' -> 1.01) and compare the two floats directly",
        'Pad both strings with leading zeros to the same character length, then compare them lexicographically as strings',
        'Two pointers walking both raw strings, comparing digit by digit without ever splitting on the dot',
      ],
    },
    code: `class Solution:
    def compareVersion(self, version1: str, version2: str) -> int:
        parts1 = version1.split(".")
        parts2 = version2.split(".")
        length = max(len(parts1), len(parts2))

        for i in range(length):
            num1 = int(parts1[i]) if i < len(parts1) else 0
            num2 = int(parts2[i]) if i < len(parts2) else 0

            if num1 != num2:
                return 1 if num1 > num2 else -1

        return 0`,
    blanks: [4, 7, 11],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(1)'], why: 'split both strings then one pass over the longer revision list (n = total length)' },
    space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'], why: 'split() allocates a list of revision substrings for each version' },
    sayIt: "Split on '.', treat a missing trailing revision as 0, compare each revision as an int so leading zeros vanish automatically, stop at the first difference; O(n) time.",
    pitfall: "Comparing as raw strings or floats breaks on inputs like '1.01' vs '1.001' or a missing revision — must split and int()-compare per revision.",
  },
  {
    id: 'thought:strings:integer-to-roman',
    lc: 12,
    title: 'Integer to Roman',
    difficulty: 'Medium',
    category: 'strings',
    skills: ['math'],
    companies: ['amazon', 'microsoft', 'bloomberg'],
    statement: `Given an integer, convert it to a Roman numeral string.

Roman numerals use symbols (I, V, X, L, C, D, M) combined additively, but also subtractively in six special cases (like IV for 4, or CM for 900) to avoid ever repeating a symbol more than three times in a row.

The input is guaranteed to be within the range that Roman numerals can represent (1 to 3999).`,
    examples: [
      { input: 'num = 1994', output: '"MCMXCIV"', explanation: 'M (1000) + CM (900) + XC (90) + IV (4)' },
      { input: 'num = 58', output: '"LVIII"', explanation: 'L (50) + V (5) + III (3)' },
    ],
    constraints: ['1 <= num <= 3999'],
    ds: {
      answer: 'two parallel lists of value-symbol pairs, ordered largest to smallest (greedy table)',
      choices: ['two parallel lists of value-symbol pairs, ordered largest to smallest (greedy table)', 'a single dict mapping each of the 13 symbols to its value, iterated in dict order', 'recursion that picks the single largest symbol fitting num, then recurses on the remainder', 'hardcoded if/elif chain for every one of the 13 roman numeral symbols'],
    },
    method: {
      answer: "Greedy, largest value first: for each (value, symbol) pair in descending order, ==divmod(num, value)== gives how many times that symbol repeats and the remainder to carry forward, appending ==symbol * count== before moving to the next smaller value",
      choices: [
        'Recursively find the single largest symbol <= num, append it once, and recurse on num minus that value',
        'Convert each digit (ones, tens, hundreds, thousands) separately using 4 separate lookup tables, then concatenate the four pieces',
        "Greedy, largest value first: for each (value, symbol) pair in descending order, ==divmod(num, value)== gives how many times that symbol repeats and the remainder to carry forward, appending ==symbol * count== before moving to the next smaller value",
        'Apply the subtractive notation rules inline for each digit (I-before-V, X-before-L, C-before-D, etc.) with no lookup table at all',
      ],
    },
    code: `class Solution:
    def intToRoman(self, num: int) -> str:
        values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
        symbols = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"]
        result = []

        for value, symbol in zip(values, symbols):
            if num == 0:
                break

            count, num = divmod(num, value)
            result.append(symbol * count)

        return "".join(result)`,
    blanks: [10, 11, 13],
    time: { answer: 'O(1)', choices: ['O(1)', 'O(log num)', 'O(num)', 'O(13^2)'], why: 'at most 13 fixed value/symbol pairs are checked regardless of num' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(num)', 'O(log num)', 'O(13^2)'], why: "result holds a bounded number of symbol characters (at most ~15), independent of num's magnitude" },
    sayIt: "Walk a fixed table of 13 (value, symbol) pairs largest to smallest, ==divmod== gives the repeat count and carries the remainder forward, O(1) time since the table size never changes.",
    pitfall: "The value/symbol table must include the subtractive pairs like (900,'CM') and (400,'CD'), not just the 7 base symbols, or compound numbers like 1994 come out wrong.",
  },
  {
    id: 'thought:strings:multiply-strings',
    lc: 43,
    title: 'Multiply Strings',
    difficulty: 'Medium',
    category: 'strings',
    skills: ['math'],
    companies: ['meta', 'microsoft', 'amazon'],
    statement: `Given two non-negative integers represented as strings, return the product of the two numbers, also as a string.

You cannot convert the entire input strings directly to integers or use any built-in big-integer library; the multiplication has to be computed digit by digit.

The result can be arbitrarily large, which is exactly why it has to stay a string instead of a built-in int.`,
    examples: [
      { input: 'num1 = "123", num2 = "456"', output: '"56088"', explanation: '123 * 456 = 56088, built up digit pair by digit pair' },
      { input: 'num1 = "2", num2 = "3"', output: '"6"', explanation: 'single-digit multiply, no carrying needed' },
    ],
    constraints: ['1 <= num1.length, num2.length <= 200', 'num1 and num2 consist of digits only', 'neither num1 nor num2 has leading zeros, except the number 0 itself'],
    ds: {
      answer: 'fixed-size digits array of length len(num1)+len(num2), carries resolved in place',
      choices: ['fixed-size digits array of length len(num1)+len(num2), carries resolved in place', 'convert both strings to Python ints, multiply directly, convert back to a string', 'repeated string addition: add num1 to itself num2 times using a string-addition helper', 'two stacks of digits, multiplying and carrying from the top of each stack'],
    },
    method: {
      answer: "Grade-school multiplication: every digit pair (i,j) contributes to position ==pos = i + j + 1== in a result array sized len(num1)+len(num2) (the max possible digits); accumulate the product there, then immediately push the ==carry into digits[pos-1]== and ==mod digits[pos] down to one digit==",
      choices: [
        'Convert both input strings directly to a Python int, multiply with *, and str() the result',
        'Repeated addition: parse num1 as an int and add it to a running total num2 times using grade-school string addition',
        'Karatsuba divide-and-conquer, splitting each number in half and combining four sub-products',
        "Grade-school multiplication: every digit pair (i,j) contributes to position ==pos = i + j + 1== in a result array sized len(num1)+len(num2) (the max possible digits); accumulate the product there, then immediately push the ==carry into digits[pos-1]== and ==mod digits[pos] down to one digit==",
      ],
    },
    code: `class Solution:
    def multiply(self, num1: str, num2: str) -> str:
        if num1 == "0" or num2 == "0":
            return "0"

        n1, n2 = len(num1), len(num2)
        digits = [0] * (n1 + n2)

        for i in range(n1 - 1, -1, -1):
            for j in range(n2 - 1, -1, -1):
                product = int(num1[i]) * int(num2[j])
                pos = i + j + 1

                digits[pos] += product
                digits[pos - 1] += digits[pos] // 10
                digits[pos] %= 10

        result = "".join(map(str, digits)).lstrip("0")
        return result`,
    blanks: [11, 14, 15],
    time: { answer: 'O(n1 * n2)', choices: ['O(n1 * n2)', 'O(n1 + n2)', 'O((n1+n2) log(n1+n2))', 'O(n1^2 * n2^2)'], why: 'every pair of digits (one from num1, one from num2) is multiplied exactly once' },
    space: { answer: 'O(n1 + n2)', choices: ['O(n1 + n2)', 'O(n1 * n2)', 'O(1)', 'O(log(n1*n2))'], why: 'one fixed-size digits array sized to the maximum possible result length' },
    sayIt: "Every digit pair lands at ==pos = i+j+1== in a digits array sized n1+n2, accumulate then carry into ==pos-1== and mod pos down to one digit, strip leading zeros at the end, O(n1*n2) time.",
    pitfall: "The early 'num1 == 0 or num2 == 0' guard is required — without it the digits array can stay all zeros and lstrip('0') would wrongly return an empty string instead of '0'.",
  },
  {
    id: 'thought:strings:repeated-dna-sequences',
    lc: 187,
    title: 'Repeated DNA Sequences',
    difficulty: 'Medium',
    category: 'strings',
    skills: ['sliding-window', 'arrays-hashing'],
    companies: ['google', 'amazon'],
    statement: `DNA sequences are made only of the letters A, C, G, T. Given a string representing a DNA sequence, find every 10-letter-long substring that occurs more than once in the string.

Return each such repeated substring once, in any order.

Overlapping occurrences still count as repeats; two windows starting one character apart can both be valid.`,
    examples: [
      { input: 's = "AAAAACCCCCAAAAACCCCCCAAAAAGGGTTT"', output: '["AAAAACCCCC","CCCCCAAAAA"]', explanation: 'both of these 10-letter windows appear more than once in the string' },
    ],
    constraints: ['1 <= s.length <= 10^5', "s[i] is one of 'A', 'C', 'G', or 'T'"],
    ds: {
      answer: 'sliding window of fixed length 10 + two hash sets (seen, repeated)',
      choices: ['sliding window of fixed length 10 + two hash sets (seen, repeated)', 'rolling polynomial hash of each 10-length window stored in a single Counter', 'trie of the 4 DNA characters (A,C,G,T), marking repeated paths at depth 10', 'sort all length-10 substrings and scan for adjacent duplicates'],
    },
    method: {
      answer: "Slide a fixed ==length-10 window== across the string; the first time a window string is seen it goes into ==seen==, the second time (or later) it goes into ==repeated==, which naturally dedupes itself since it's a set",
      choices: [
        'Encode each of the 4 bases into 2 bits and roll a single integer hash forward one base at a time, checking a Counter of integer hashes',
        'Build a Counter of every length-10 substring directly, then filter for counts >= 2 at the end',
        "Use a trie where only paths visited more than once trigger adding that path's string to the result",
        "Slide a fixed ==length-10 window== across the string; the first time a window string is seen it goes into ==seen==, the second time (or later) it goes into ==repeated==, which naturally dedupes itself since it's a set",
      ],
    },
    code: `class Solution:
    def findRepeatedDnaSequences(self, s: str) -> List[str]:
        seen = set()
        repeated = set()

        for i in range(len(s) - 9):
            window = s[i:i + 10]

            if window in seen:
                repeated.add(window)
            else:
                seen.add(window)

        return list(repeated)`,
    blanks: [5, 6, 9],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n^2)', 'O(n log n)', 'O(4^10)'], why: 'each of the ~n length-10 windows is sliced and hashed in O(1) amortized, one pass total' },
    space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(n^2)', 'O(log n)'], why: 'up to n distinct length-10 windows can be stored across the two sets' },
    sayIt: "Slide a ==length-10 window==, first sighting goes into seen, any later sighting goes into repeated (a set, so duplicates self-dedupe), O(n) time.",
    pitfall: "The loop bound must be len(s) - 9, not -10 — range(i, i+10) needs i+10 <= len(s), so i only goes up to len(s)-10, meaning range(len(s)-9) is what correctly includes it.",
  },
]

export default {
  id: 'strings',
  title: 'Strings & hashing',
  icon: 'read',
  items,
}
