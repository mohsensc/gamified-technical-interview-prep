export default {
  id: 'stack-trie',
  title: 'Stacks & tries',
  icon: 'layers',
  items: [
    {
      id: 'thought:stack-trie:valid-parentheses',
      lc: 20,
      title: 'Valid Parentheses',
      difficulty: 'Easy',
      category: 'stack-trie',
      skills: ['stack'],
      companies: ['google', 'amazon', 'microsoft', 'meta', 'bloomberg'],
      statement: "You're given a string made only of the characters (, ), {, }, [, and ]. Decide whether the brackets are balanced: every closing bracket must match the most recently opened bracket of the same type, and every open bracket must eventually close.",
      examples: [
        { input: "s = '()[]{}'", output: 'true' },
        { input: "s = '(]'", output: 'false' },
      ],
      constraints: ['1 <= s.length <= 10^4', "s consists only of '()[]{}'"],
      ds: {
        answer: 'deque stack of open brackets + dict of closing→opening',
        choices: [
          'deque stack of open brackets + dict of closing→opening',
          'queue (deque) of brackets + set of valid pairs',
          'two pointers scanning from both ends inward',
          'Counter of each bracket type',
        ],
      },
      method: {
        answer: "Scan left to right: push every opening bracket; on a closing bracket, ==pop and check== it matches, mismatch or empty stack means invalid",
        choices: [
          "Scan left to right: push every opening bracket; on a closing bracket, ==pop and check== it matches, mismatch or empty stack means invalid",
          'Scan left to right pushing every bracket, then reverse the whole stack and compare pairwise',
          'Count each bracket type with a Counter and check that every count is even',
          'Two pointers from both ends moving inward, swapping any mismatched pair',
        ],
      },
      code: `class Solution:
    def isValid(self, s: str) -> bool:
        stack = deque()
        pairs = {')': '(', ']': '[', '}': '{'}

        for c in s:
            if c in pairs:
                if not stack or stack.pop() != pairs[c]:
                    return False
            else:
                stack.append(c)

        return not stack`,
      blanks: [3, 7, 10],
      accept: { '7': ['if not stack or pairs[c] != stack.pop():'] },
      time: { answer: 'O(n)', choices: ['O(n)', 'O(n^2)', 'O(log n)', 'O(n log n)'], why: 'single left-to-right pass, each char pushed/popped once' },
      space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'], why: 'stack can hold up to n open brackets' },
      sayIt: "==Stack== of open brackets; on a close, ==pop and match== the type — mismatch or empty means invalid. O(n) time, O(n) space.",
      pitfall: 'Popping from an empty stack before checking it has anything',
    },

    {
      id: 'thought:stack-trie:min-stack',
      lc: 155,
      title: 'Min Stack',
      difficulty: 'Medium',
      category: 'stack-trie',
      skills: ['stack'],
      companies: ['google', 'amazon', 'bloomberg'],
      statement: 'Design a stack that supports push, pop, top, and getMin, where getMin must return the current minimum in O(1).',
      examples: [
        { input: 'push(-2), push(0), push(-3), getMin(), pop(), top(), getMin()', output: '-3, None, 0, -2', explanation: 'getMin right after push(-3) is -3; after pop, top is 0 and the new getMin is -2' },
      ],
      constraints: ['-2^31 <= val <= 2^31 - 1', 'at most 3*10^4 calls total to push, pop, top, getMin', 'pop, top, getMin are only called on a non-empty stack'],
      ds: {
        answer: 'deque stack of (val, minSoFar) tuples',
        choices: [
          'deque stack of (val, minSoFar) tuples',
          'deque stack of values + a separate min-heap of values',
          'list stack of values + a sorted list of minimums',
          'two stacks: one of values, one of running sums',
        ],
      },
      method: {
        answer: "On push, store ==(val, min(val, prevMin))==; pop/top/getMin all just read the ==top tuple==, no rescanning",
        choices: [
          "On push, store ==(val, min(val, prevMin))==; pop/top/getMin all just read the ==top tuple==, no rescanning",
          'On push store only the value; getMin scans the whole stack every call',
          'Keep a parallel min-heap and pop from it whenever the main stack pops',
          'Track the min in one variable and recompute it by scanning after every pop',
        ],
      },
      code: `class MinStack:
    def __init__(self):
        self.stack = deque()

    def push(self, val: int) -> None:
        minVal = min(val, self.stack[-1][1]) if self.stack else val
        self.stack.append((val, minVal))

    def pop(self) -> None:
        self.stack.pop()

    def top(self) -> int:
        return self.stack[-1][0]

    def getMin(self) -> int:
        return self.stack[-1][1]`,
      blanks: [5, 6, 15],
      accept: { '5': ['minVal = val if not self.stack else min(val, self.stack[-1][1])'] },
      time: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(log n)', 'O(n) amortized'], why: 'every op only reads or writes the top tuple' },
      space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(n^2)', 'O(log n)'], why: 'one (val, min) tuple stored per pushed value' },
      sayIt: 'Each entry is ==(val, minSoFar)== so popping never loses the running minimum. All four ops are O(1).',
      pitfall: 'Storing just the value and rescanning for the min on every getMin call',
    },

    {
      id: 'thought:stack-trie:evaluate-rpn',
      lc: 150,
      title: 'Evaluate Reverse Polish Notation',
      difficulty: 'Medium',
      category: 'stack-trie',
      skills: ['stack'],
      companies: ['google', 'amazon', 'meta'],
      statement: "You're given tokens of an arithmetic expression already written in postfix order — operands come before the operator that uses them. Evaluate it and return the integer result.\n\nValid operators are +, -, *, and /, and division truncates toward zero. There are no divide-by-zero cases and the result always fits in a 32-bit integer.",
      examples: [{ input: "tokens = ['2','1','+','3','*']", output: '9', explanation: '(2 + 1) * 3' }],
      constraints: ['1 <= tokens.length <= 10^4', "each token is an operator, or an integer in [-200, 200]"],
      ds: {
        answer: 'deque stack of operands',
        choices: [
          'deque stack of operands',
          'two pointers walking the token list',
          'queue of operands processed front to back',
          'recursion with a call stack of partial sums',
        ],
      },
      method: {
        answer: "Scan tokens left to right: push numbers; on an operator, ==pop two operands, apply it, push the result back==",
        choices: [
          "Scan tokens left to right: push numbers; on an operator, ==pop two operands, apply it, push the result back==",
          'Scan right to left, pushing operators and applying each to the next two numbers seen',
          'Convert the whole expression to infix first, then evaluate with operator precedence',
          'Push every token, then repeatedly scan the stack for the first operator and reduce around it',
        ],
      },
      code: `class Solution:
    def evalRPN(self, tokens: List[str]) -> int:
        stack = deque()
        ops = {'+': lambda a, b: a + b,
               '-': lambda a, b: a - b,
               '*': lambda a, b: a * b,
               '/': lambda a, b: int(a / b)}

        for token in tokens:
            if token in ops:
                second = stack.pop()
                first = stack.pop()
                stack.append(ops[token](first, second))
            else:
                stack.append(int(token))

        return stack[0]`,
      blanks: [10, 11, 12],
      time: { answer: 'O(n)', choices: ['O(n)', 'O(n^2)', 'O(log n)', 'O(n log n)'], why: 'single pass, each token pushed or popped once' },
      space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'], why: 'operand stack holds up to n/2 numbers' },
      sayIt: '==Stack== of operands; on each operator ==pop two, apply, push the result back==. O(n) time, O(n) space.',
      pitfall: 'Popping the two operands in the wrong order for - and /',
    },

    {
      id: 'thought:stack-trie:daily-temperatures',
      lc: 739,
      title: 'Daily Temperatures',
      difficulty: 'Medium',
      category: 'stack-trie',
      skills: ['monotonic-stack'],
      companies: ['google', 'amazon'],
      statement: "Given the day's temperature for n days, for each day return how many days you'd have to wait until a warmer temperature shows up. If none ever comes, that day's answer is 0.",
      examples: [{ input: 'temperatures = [73,74,75,71,69,72,76,73]', output: '[1,1,4,2,1,1,0,0]' }],
      constraints: ['1 <= temperatures.length <= 10^5', '30 <= temperatures[i] <= 100'],
      ds: {
        answer: 'monotonic stack of indices (decreasing temps)',
        choices: [
          'monotonic stack of indices (decreasing temps)',
          'min-heap of (temperature, index) pairs',
          'dd(list) mapping each temperature to its indices',
          'two pointers scanning from both ends',
        ],
      },
      method: {
        answer: "One pass; while the ==stack top's temp is colder==, pop it and set its answer to the ==gap in indices==, then push the current index",
        choices: [
          "One pass; while the ==stack top's temp is colder==, pop it and set its answer to the ==gap in indices==, then push the current index",
          'Sort days by temperature, then propagate answers from hottest to coldest',
          'Two pointers: advance the right pointer to the next warmer day and store that gap for the left pointer',
          'Binary search forward from each day using a precomputed suffix-max array',
        ],
      },
      code: `class Solution:
    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:
        result = [0] * len(temperatures)
        stack = deque()

        for i, temp in enumerate(temperatures):
            while stack and temp > temperatures[stack[-1]]:
                prev = stack.pop()
                result[prev] = i - prev
            stack.append(i)

        return result`,
      blanks: [6, 8, 9],
      time: { answer: 'O(n)', choices: ['O(n)', 'O(n^2)', 'O(n log n)', 'O(log n)'], why: 'each index pushed and popped at most once' },
      space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'], why: 'stack can hold up to n waiting indices' },
      sayIt: '==Monotonic stack== of indices waiting for warmth; pop and record the ==gap== whenever a hotter day arrives.',
      pitfall: 'Comparing temp to the stacked index instead of temperatures[stack[-1]]',
    },

    {
      id: 'thought:stack-trie:next-greater-element',
      lc: 496,
      title: 'Next Greater Element I',
      difficulty: 'Easy',
      category: 'stack-trie',
      skills: ['monotonic-stack'],
      companies: ['amazon'],
      statement: "You have two arrays, nums1 and nums2, where every value in nums1 also appears somewhere in nums2. For each value in nums1, find its next greater element to the right in nums2 — the first value further right that's strictly bigger. If there isn't one, the answer is -1.",
      examples: [{ input: 'nums1 = [4,1,2], nums2 = [1,3,4,2]', output: '[-1,3,-1]', explanation: "4 has nothing bigger after it; 1's next greater is 3; 2 has nothing after it" }],
      constraints: ['1 <= nums1.length <= nums2.length <= 1000', 'all integers in nums2 are distinct', 'nums1 is a subset of nums2'],
      ds: {
        answer: 'dd(int) next-greater map + monotonic decreasing stack',
        choices: [
          'dd(int) next-greater map + monotonic decreasing stack',
          'min-heap of values paired with their index',
          'sorted copy of nums2 + binary search per query',
          'two pointers walking both arrays together',
        ],
      },
      method: {
        answer: "Scan nums2 left to right with a stack; whenever the current value beats the ==stack top==, pop it and ==map it to the current value==, then push current",
        choices: [
          "Scan nums2 left to right with a stack; whenever the current value beats the ==stack top==, pop it and ==map it to the current value==, then push current",
          'Scan nums2 right to left, pushing the max seen so far and mapping every popped value to it',
          'For each nums1 value, binary search nums2 for its position then scan forward for something bigger',
          'Sort nums2, find the rank of each nums1 value, then take the next element in sorted order',
        ],
      },
      code: `class Solution:
    def nextGreaterElement(self, nums1: List[int], nums2: List[int]) -> List[int]:
        nextGreater = dd(lambda: -1)
        stack = deque()

        for num in nums2:
            while stack and num > stack[-1]:
                smaller = stack.pop()
                nextGreater[smaller] = num
            stack.append(num)

        return [nextGreater[num] for num in nums1]`,
      blanks: [6, 8, 9],
      time: { answer: 'O(n + m)', choices: ['O(n + m)', 'O(n * m)', 'O(n log n)', 'O(m log m)'], why: 'one pass over nums2, one map lookup per nums1 value' },
      space: { answer: 'O(n)', choices: ['O(n)', 'O(n + m)', 'O(1)', 'O(m)'], why: 'stack and map hold up to n values from nums2' },
      sayIt: "Build a ==next-greater map== for nums2 with one monotonic-stack pass, then answer nums1 by lookup.",
      pitfall: 'Forgetting values with no next-greater default to -1',
    },

    {
      id: 'thought:stack-trie:largest-rectangle-histogram',
      lc: 84,
      title: 'Largest Rectangle in Histogram',
      difficulty: 'Hard',
      category: 'stack-trie',
      skills: ['monotonic-stack'],
      companies: ['google', 'amazon', 'microsoft', 'meta'],
      statement: "Given the bar heights of a histogram where each bar has width 1, find the area of the largest rectangle that fits entirely under the skyline.",
      examples: [{ input: 'heights = [2,1,5,6,2,3]', output: '10', explanation: 'the bars of height 5 and 6 together give width 2 * height 5 = 10' }],
      constraints: ['1 <= heights.length <= 10^5', '0 <= heights[i] <= 10^4'],
      ds: {
        answer: 'monotonic stack of (index, height) pairs',
        choices: [
          'monotonic stack of (index, height) pairs',
          'min-heap of heights with their index',
          'dd(list) grouping equal heights together',
          'two pointers shrinking inward from both ends',
        ],
      },
      method: {
        answer: "While the current bar is ==shorter than the stack top==, pop it and compute its area from the ==popped height times width between neighbors==, then push current",
        choices: [
          "While the current bar is ==shorter than the stack top==, pop it and compute its area from the ==popped height times width between neighbors==, then push current",
          'Sort bars by height ascending and sweep, accumulating width from the nearest unremoved neighbors',
          'Two pointers from both ends, moving the shorter side inward and tracking the max height seen',
          'Precompute prefix-max and suffix-max arrays, then take the min of the two at every index',
        ],
      },
      code: `class Solution:
    def largestRectangleArea(self, heights: List[int]) -> int:
        stack = deque()
        best = 0

        for i, h in enumerate(heights):
            start = i
            while stack and stack[-1][1] >= h:
                index, height = stack.pop()
                best = max(best, height * (i - index))
                start = index
            stack.append((start, h))

        for index, h in stack:
            best = max(best, h * (len(heights) - index))

        return best`,
      blanks: [7, 9, 14],
      time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)'], why: 'each bar is pushed and popped from the stack once' },
      space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'], why: 'stack can hold all n bars when heights strictly increase' },
      sayIt: 'Monotonic increasing stack of (index, height); popping a taller bar reveals its ==right boundary==, so its area is settled right then.',
      pitfall: 'Forgetting to drain the leftover stack after the loop for bars that never got popped',
    },

    {
      id: 'thought:stack-trie:car-fleet',
      lc: 853,
      title: 'Car Fleet',
      difficulty: 'Medium',
      category: 'stack-trie',
      skills: ['monotonic-stack'],
      companies: ['google'],
      statement: "Cars start at different positions on a single-lane road, all driving toward the same target at their own fixed speed, and no car can pass another — a faster car behind a slower one just bunches up into that car's fleet and matches its speed. Given each car's starting position and speed, count how many distinct fleets arrive at the target.",
      examples: [{ input: 'target = 12, position = [10,8,0,5,3], speed = [2,4,1,1,3]', output: '3', explanation: 'the cars at 10 and 8 merge into one fleet; the remaining three cars form two more fleets' }],
      constraints: ['n == position.length == speed.length', '1 <= n <= 10^5', '0 < position[i] < target <= 10^6', '0 < speed[i] <= 10^6', 'all positions are distinct'],
      ds: {
        answer: 'monotonic stack of arrival times, cars sorted by position descending',
        choices: [
          'monotonic stack of arrival times, cars sorted by position descending',
          'min-heap of arrival times, popped smallest first',
          'dd(list) grouping cars by rounded arrival time',
          'two pointers moving inward from both ends of sorted positions',
        ],
      },
      method: {
        answer: "Sort by position descending; push each car's ==time to reach target==, and if it's ==<= the stack top==, pop it since it merges into the fleet ahead",
        choices: [
          "Sort by position descending; push each car's ==time to reach target==, and if it's ==<= the stack top==, pop it since it merges into the fleet ahead",
          'Sort by speed descending and merge any car whose speed is within 1 of the car ahead',
          'Sort by position ascending and merge a car into the fleet behind it whenever its time is smaller',
          'Use a min-heap of (position, speed) and repeatedly merge the two closest cars by position',
        ],
      },
      code: `class Solution:
    def carFleet(self, target: int, position: List[int], speed: List[int]) -> int:
        cars = sorted(zip(position, speed), reverse=True)
        stack = deque()

        for pos, spd in cars:
            time = (target - pos) / spd
            if not stack or time > stack[-1]:
                stack.append(time)

        return len(stack)`,
      blanks: [2, 6, 8],
      accept: { '2': ['cars = sorted(zip(position, speed))[::-1]'] },
      time: { answer: 'O(n log n)', choices: ['O(n log n)', 'O(n)', 'O(n^2)', 'O(log n)'], why: 'sorting dominates; the stack pass after is O(n)' },
      space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'], why: 'stack can hold up to n arrival times / fleets' },
      sayIt: 'Sort by position, closest to target first; a car merges if its ==arrival time ≤ the fleet ahead==, else it starts a new fleet.',
      pitfall: 'Sorting by position ascending instead of descending',
    },

    {
      id: 'thought:stack-trie:asteroid-collision',
      lc: 735,
      title: 'Asteroid Collision',
      difficulty: 'Medium',
      category: 'stack-trie',
      skills: ['stack'],
      companies: ['google', 'amazon', 'bloomberg'],
      statement: "Asteroids move along a single row: a positive value moves right, a negative value moves left, and the absolute value is its size. When two asteroids collide, the smaller one explodes; equal sizes mean both explode. Asteroids moving the same direction never meet. Return the state of all asteroids after every collision has finished.",
      examples: [
        { input: 'asteroids = [5,10,-5]', output: '[5,10]', explanation: '10 and -5 collide; 10 survives since it is bigger' },
        { input: 'asteroids = [8,-8]', output: '[]', explanation: 'equal size, both explode' },
      ],
      constraints: ['2 <= asteroids.length <= 10^4', '-1000 <= asteroids[i] <= 1000', 'asteroids[i] != 0'],
      ds: {
        answer: 'deque stack of surviving right-moving asteroids',
        choices: [
          'deque stack of surviving right-moving asteroids',
          'queue (deque) processed front to back, re-inserting survivors at the back',
          'min-heap of asteroid sizes',
          'two pointers converging from both ends of the array',
        ],
      },
      method: {
        answer: "Push right-movers; on a left-mover, ==pop smaller right-movers==, and only push it once nothing bigger survives to block it",
        choices: [
          "Push right-movers; on a left-mover, ==pop smaller right-movers==, and only push it once nothing bigger survives to block it",
          'Sort by absolute size descending and remove the smaller asteroids first regardless of order',
          'Two pointers from both ends, exploding the smaller of the two endpoints each step',
          'Push every asteroid first, then make a second pass removing adjacent opposite-direction pairs',
        ],
      },
      code: `class Solution:
    def asteroidCollision(self, asteroids: List[int]) -> List[int]:
        stack = deque()

        for a in asteroids:
            alive = True
            while alive and a < 0 and stack and stack[-1] > 0:
                if stack[-1] < -a:
                    stack.pop()
                elif stack[-1] == -a:
                    stack.pop()
                    alive = False
                else:
                    alive = False
            if alive:
                stack.append(a)

        return list(stack)`,
      blanks: [6, 8, 15],
      time: { answer: 'O(n)', choices: ['O(n)', 'O(n^2)', 'O(n log n)', 'O(log n)'], why: 'each asteroid pushed and popped at most once overall' },
      space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'], why: 'stack holds up to n surviving asteroids' },
      sayIt: '==Stack== of right-movers; a left-mover ==pops anything smaller== moving right, and only joins the stack if nothing bigger survives.',
      pitfall: 'Forgetting the equal-size case destroys both instead of just the smaller one',
    },

    {
      id: 'thought:stack-trie:decode-string',
      lc: 394,
      title: 'Decode String',
      difficulty: 'Medium',
      category: 'stack-trie',
      skills: ['stack'],
      companies: ['google', 'amazon', 'bloomberg'],
      statement: "You're given an encoded string like '3[a2[c]]' where k[encoded] means encoded repeats k times, and these encodings can nest arbitrarily deep. Decode it back to the full string.",
      examples: [
        { input: "s = '3[a2[c]]'", output: "'accaccacc'" },
        { input: "s = '2[abc]3[cd]ef'", output: "'abcabccdcdcdef'" },
      ],
      constraints: ['1 <= s.length <= 30', 's consists of lowercase letters, digits, and square brackets', '1 <= k <= 10^9'],
      ds: {
        answer: 'two stacks: counts and partial strings',
        choices: [
          'two stacks: counts and partial strings',
          'single stack of characters, reversed at the end',
          'queue of tokens processed front to back',
          'dd(str) mapping bracket depth to accumulated text',
        ],
      },
      method: {
        answer: "On '[' push the ==count and string so far==, reset both; on ']' pop and do ==prevString + count * current==",
        choices: [
          "On '[' push the ==count and string so far==, reset both; on ']' pop and do ==prevString + count * current==",
          'On every digit multiply a running total and apply it immediately to just the next character',
          'Use regex to repeatedly find and expand the innermost k[...] pattern until none remain',
          'Recursively parse right to left, carrying the repeat count forward through nested calls',
        ],
      },
      code: `class Solution:
    def decodeString(self, s: str) -> str:
        countStack = deque()
        stringStack = deque()
        current = ''
        num = 0

        for c in s:
            if c.isdigit():
                num = num * 10 + int(c)
            elif c == '[':
                countStack.append(num)
                stringStack.append(current)
                current = ''
                num = 0
            elif c == ']':
                prevString = stringStack.pop()
                repeat = countStack.pop()
                current = prevString + current * repeat
            else:
                current += c

        return current`,
      blanks: [9, 11, 18],
      time: { answer: 'O(n)', choices: ['O(n)', 'O(n^2)', 'O(log n)', 'O(n log n)'], why: 'n = length of the final decoded string, each char appended once' },
      space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'], why: 'stacks plus the current string grow with nesting and output length' },
      sayIt: "==Two stacks==: counts and partial strings. On '[' push and reset; on ']' pop both and do ==prev + repeat * current==.",
      pitfall: 'Parsing only a single digit instead of accumulating multi-digit counts',
    },

    {
      id: 'thought:stack-trie:remove-adjacent-duplicates',
      lc: 1047,
      title: 'Remove All Adjacent Duplicates In String',
      difficulty: 'Easy',
      category: 'stack-trie',
      skills: ['stack'],
      companies: ['meta', 'bloomberg'],
      statement: "Repeatedly remove any two adjacent, identical letters from a string until no such pair remains, then return what's left. Order matters here — removing one pair can expose a brand new pair right next to where it used to be.",
      examples: [{ input: "s = 'abbaca'", output: "'ca'", explanation: "'bb' cancels first leaving 'aaca', then 'aa' cancels, leaving 'ca'" }],
      constraints: ['1 <= s.length <= 10^5', 's consists of lowercase English letters'],
      ds: {
        answer: 'deque stack of surviving characters',
        choices: [
          'deque stack of surviving characters',
          'queue (deque) scanned front to back without popping',
          'Counter of character frequencies',
          'two pointers shrinking the string from both ends',
        ],
      },
      method: {
        answer: "Scan left to right: if the current char ==matches the stack top==, pop it (cancel); otherwise push it",
        choices: [
          "Scan left to right: if the current char ==matches the stack top==, pop it (cancel); otherwise push it",
          'Repeatedly rescan the whole string for the first adjacent pair and remove it until none remain',
          'Count each letter and drop it entirely if its total count is even',
          'Two pointers from both ends, removing matching letters found at mirrored positions',
        ],
      },
      code: `class Solution:
    def removeDuplicates(self, s: str) -> str:
        stack = deque()

        for c in s:
            if stack and stack[-1] == c:
                stack.pop()
            else:
                stack.append(c)

        return ''.join(stack)`,
      blanks: [5, 6, 8],
      time: { answer: 'O(n)', choices: ['O(n)', 'O(n^2)', 'O(log n)', 'O(n log n)'], why: 'each character pushed and popped at most once' },
      space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'], why: 'stack can hold up to n characters before any cancel' },
      sayIt: '==Stack== of survivors; a match with the top ==cancels it (pop)==, otherwise push. Join the stack at the end.',
      pitfall: 'Checking the stack top before confirming the stack is non-empty',
    },

    {
      id: 'thought:stack-trie:simplify-path',
      lc: 71,
      title: 'Simplify Path',
      difficulty: 'Medium',
      category: 'stack-trie',
      skills: ['stack'],
      companies: ['microsoft', 'meta'],
      statement: "You're given an absolute Unix-style file path and need its simplified canonical form. A single dot means stay in the current directory, a double dot means go up one directory, and repeated slashes just collapse into one.",
      examples: [
        { input: "path = '/a/./b/../../c/'", output: "'/c'" },
        { input: "path = '/../'", output: "'/'" },
      ],
      constraints: ['1 <= path.length <= 3000', "path consists of English letters, digits, '.', '/' or '_'", 'path is a valid absolute Unix path'],
      ds: {
        answer: 'deque stack of directory names',
        choices: [
          'deque stack of directory names',
          'queue (deque) of path pieces processed front to back',
          'dd(int) counting how many times each directory name appears',
          'two pointers scanning the raw path string in place',
        ],
      },
      method: {
        answer: "Split on '/'; for each piece, ==pop on '..'==, ==skip '.' and empty pieces==, otherwise push the directory name",
        choices: [
          "Split on '/'; for each piece, ==pop on '..'==, ==skip '.' and empty pieces==, otherwise push the directory name",
          'Use a regex to repeatedly collapse any dir/../ pattern until none remain',
          'Scan character by character, counting slash runs and dot runs without ever splitting the string',
          'Reverse the path, resolve ".." by skipping the next real directory name, then reverse back',
        ],
      },
      code: `class Solution:
    def simplifyPath(self, path: str) -> str:
        stack = deque()

        for piece in path.split('/'):
            if piece == '..':
                if stack:
                    stack.pop()
            elif piece == '' or piece == '.':
                continue
            else:
                stack.append(piece)

        return '/' + '/'.join(stack)`,
      blanks: [5, 7, 11],
      time: { answer: 'O(n)', choices: ['O(n)', 'O(n^2)', 'O(log n)', 'O(n log n)'], why: 'splitting and walking the path is one linear pass' },
      space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'], why: 'stack holds up to n directory names' },
      sayIt: "Split on '/'; ==pop on '..'==, skip '.' and empties, push everything else. Join survivors with '/'.",
      pitfall: "Popping on '..' even when the stack is already empty",
    },

    {
      id: 'thought:stack-trie:online-stock-span',
      lc: 901,
      title: 'Online Stock Span',
      difficulty: 'Medium',
      category: 'stack-trie',
      skills: ['monotonic-stack'],
      companies: ['amazon'],
      statement: "Design a class that is called once per day with that day's stock price, and returns the stock's span: the number of consecutive days up to and including today where the price stayed less than or equal to today's price, counting backward.",
      examples: [{ input: 'next(100), next(80), next(60), next(70), next(60), next(75), next(85)', output: '1, 1, 1, 2, 1, 4, 6' }],
      constraints: ['1 <= price <= 10^5', 'at most 10^4 calls to next'],
      ds: {
        answer: 'deque stack of (price, span) pairs',
        choices: [
          'deque stack of (price, span) pairs',
          'min-heap of prices with their day index',
          'dd(list) mapping price to every day it occurred',
          'deque queue of every price seen so far',
        ],
      },
      method: {
        answer: "On each call, ==pop while the stack top's price <= today's==, summing their spans, then push (today, 1 + sum of popped spans)",
        choices: [
          "On each call, ==pop while the stack top's price <= today's==, summing their spans, then push (today, 1 + sum of popped spans)",
          'Keep every price in a list and binary search backward for the first bigger price each call',
          'Maintain a running max and reset the span counter to 1 whenever a new max appears',
          'Push every price onto a stack and recompute the span by popping and re-pushing after every call',
        ],
      },
      code: `class StockSpanner:
    def __init__(self):
        self.stack = deque()

    def next(self, price: int) -> int:
        span = 1

        while self.stack and self.stack[-1][0] <= price:
            prevPrice, prevSpan = self.stack.pop()
            span += prevSpan

        self.stack.append((price, span))
        return span`,
      blanks: [7, 9, 11],
      time: { answer: 'O(1) amortized', choices: ['O(1) amortized', 'O(n) per call', 'O(log n) per call', 'O(n) amortized'], why: 'each price is pushed and popped from the stack once overall' },
      space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'], why: 'stack holds up to n (price, span) pairs across all calls' },
      sayIt: '==Monotonic stack== of (price, span); absorb every smaller-or-equal span underneath today before pushing it.',
      pitfall: 'Using strict < instead of <= when popping, which miscounts equal prices',
    },

    {
      id: 'thought:stack-trie:implement-trie',
      lc: 208,
      title: 'Implement Trie (Prefix Tree)',
      difficulty: 'Medium',
      category: 'stack-trie',
      skills: ['trie'],
      companies: ['google', 'amazon', 'microsoft', 'meta'],
      statement: "Design a trie that supports insert, search (exact word match), and startsWith (prefix match), all faster than scanning a word list each time.",
      examples: [{ input: "insert('apple'), search('apple'), search('app'), startsWith('app'), insert('app'), search('app')", output: 'None, true, false, true, None, true' }],
      constraints: ['1 <= word.length, prefix.length <= 2000', 'word and prefix consist only of lowercase English letters', 'at most 3*10^4 calls total to insert, search, startsWith'],
      ds: {
        answer: 'TrieNode with dict children + endOfWord flag',
        choices: [
          'TrieNode with dict children + endOfWord flag',
          'TrieNode with a fixed 26-length array of children + endOfWord flag',
          'dd(set) mapping every prefix string to the set of words with that prefix',
          'single dict mapping each inserted word directly to True',
        ],
      },
      method: {
        answer: "Walk from the root one character at a time, ==creating a missing child node== on insert, or ==returning False early== on a missing child for search/startsWith",
        choices: [
          "Walk from the root one character at a time, ==creating a missing child node== on insert, or ==returning False early== on a missing child for search/startsWith",
          'Store every inserted word in a sorted list and binary search for prefix matches',
          'Hash each prefix of the word independently and look each hash up in a set',
          'Build one combined regex from all inserted words for search and startsWith',
        ],
      },
      code: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.endOfWord = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        curr = self.root
        for c in word:
            if c not in curr.children:
                curr.children[c] = TrieNode()
            curr = curr.children[c]
        curr.endOfWord = True

    def search(self, word: str) -> bool:
        curr = self.root
        for c in word:
            if c not in curr.children:
                return False
            curr = curr.children[c]
        return curr.endOfWord

    def startsWith(self, prefix: str) -> bool:
        curr = self.root
        for c in prefix:
            if c not in curr.children:
                return False
            curr = curr.children[c]
        return True`,
      blanks: [13, 15, 23],
      time: { answer: 'O(L)', choices: ['O(L)', 'O(26^L)', 'O(words * L)', 'O(L^2)'], why: 'L = word/prefix length, one node hop per character' },
      space: { answer: 'O(total characters inserted)', choices: ['O(total characters inserted)', 'O(L)', 'O(26^L)', 'O(1)'], why: 'a node is created once per unique character path' },
      sayIt: 'Trie nodes are a ==dict of children + endOfWord==; insert builds missing nodes, search/startsWith bail out the moment a character is missing.',
      pitfall: "Returning True from search as soon as the characters match, instead of checking endOfWord",
    },

    {
      id: 'thought:stack-trie:add-search-words',
      lc: 211,
      title: 'Design Add and Search Words Data Structure',
      difficulty: 'Medium',
      category: 'stack-trie',
      skills: ['trie'],
      companies: ['amazon', 'microsoft', 'meta'],
      statement: "Design a structure that supports adding words and then searching with a wildcard: a '.' in the search pattern matches any single letter.",
      examples: [{ input: "addWord('bad'), addWord('dad'), addWord('mad'), search('pad'), search('bad'), search('.ad'), search('b..')", output: 'None, None, None, false, true, true, true' }],
      constraints: ['1 <= word.length <= 25', 'word in addWord consists of lowercase English letters', 'word in search consists of lowercase letters and/or periods', 'at most 2*10^4 calls total'],
      ds: {
        answer: 'TrieNode with dict children + endOfWord, DFS over children on "."',
        choices: [
          'TrieNode with dict children + endOfWord, DFS over children on "."',
          'TrieNode with a fixed 26-length array, BFS layer by layer on "."',
          'dd(list) mapping word length to every word of that length',
          'set of all added words, regex match on every search',
        ],
      },
      method: {
        answer: "addWord inserts like a normal trie; search does ==DFS==, and on '.' it ==tries every child== and returns True if any branch matches the rest",
        choices: [
          "addWord inserts like a normal trie; search does ==DFS==, and on '.' it ==tries every child== and returns True if any branch matches the rest",
          'search does BFS level by level, matching one character per level across all candidates at once',
          'Store all words in a set and on search generate every concrete string the pattern could match',
          'search walks greedily, picking only the first matching child at each "." without trying alternatives',
        ],
      },
      code: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.endOfWord = False

class WordDictionary:
    def __init__(self):
        self.root = TrieNode()

    def addWord(self, word: str) -> None:
        curr = self.root
        for c in word:
            if c not in curr.children:
                curr.children[c] = TrieNode()
            curr = curr.children[c]
        curr.endOfWord = True

    def search(self, word: str) -> bool:
        def dfs(node, i):
            if i == len(word):
                return node.endOfWord
            c = word[i]
            if c == '.':
                return any(dfs(child, i + 1) for child in node.children.values())
            if c not in node.children:
                return False
            return dfs(node.children[c], i + 1)

        return dfs(self.root, 0)`,
      blanks: [13, 23, 26],
      time: { answer: 'O(26^L) worst case (all dots)', choices: ['O(26^L) worst case (all dots)', 'O(L)', 'O(L log L)', 'O(26 * L)'], why: 'each dot branches the DFS into up to 26 children' },
      space: { answer: 'O(total characters inserted)', choices: ['O(total characters inserted)', 'O(L)', 'O(26^L)', 'O(1)'], why: 'trie storage plus up to L recursive search frames' },
      sayIt: "Trie with dict children; addWord inserts normally, search does ==DFS and branches on every child at a '.'==",
      pitfall: "Forgetting to check node.endOfWord once the pattern ends, not just that children exist",
    },

    {
      id: 'thought:stack-trie:word-search-ii',
      lc: 212,
      title: 'Word Search II',
      difficulty: 'Hard',
      category: 'stack-trie',
      skills: ['trie', 'grid', 'backtracking'],
      companies: ['google', 'amazon', 'microsoft', 'meta'],
      statement: "Given a grid of letters and a list of words, find every word that can be traced by moving to horizontally or vertically adjacent cells, never reusing a cell within one word.",
      examples: [{ input: "board = [['o','a','a','n'],['e','t','a','e'],['i','h','k','r'],['i','f','l','v']], words = ['oath','pea','eat','rain']", output: "['eat','oath']" }],
      constraints: ['1 <= rows, cols <= 12', '1 <= words.length <= 3*10^4', '1 <= word.length <= 10', 'all inputs are lowercase English letters'],
      ds: {
        answer: 'trie of all words + grid DFS with a visited/path set',
        choices: [
          'trie of all words + grid DFS with a visited/path set',
          'dd(list) mapping each starting letter to its words + DFS per word',
          'set of all words + DFS trying every word string independently per cell',
          'sorted list of words + binary search while scanning the grid',
        ],
      },
      method: {
        answer: "Build a trie of all words; DFS each grid cell following trie children, and when a node's ==endOfWord is hit==, record that word as ==found==",
        choices: [
          "Build a trie of all words; DFS each grid cell following trie children, and when a node's ==endOfWord is hit==, record that word as ==found==",
          'For each word independently, DFS the grid from every cell trying to match just that one word',
          'BFS outward from every cell simultaneously, tagging each frontier cell with every word it could still complete',
          "Sort words by length and binary search the grid's flattened letters for each one",
        ],
      },
      code: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.word = None

class Solution:
    def findWords(self, board: List[List[str]], words: List[str]) -> List[str]:
        root = TrieNode()
        for word in words:
            curr = root
            for c in word:
                if c not in curr.children:
                    curr.children[c] = TrieNode()
                curr = curr.children[c]
            curr.word = word
        rows, cols = len(board), len(board[0])
        found = set()
        path = set()

        def dfs(r, c, node):
            if r < 0 or c < 0 or r >= rows or c >= cols or (r, c) in path:
                return
            char = board[r][c]
            if char not in node.children:
                return
            nextNode = node.children[char]
            if nextNode.word:
                found.add(nextNode.word)
            path.add((r, c))
            for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
                dfs(r + dr, c + dc, nextNode)
            path.remove((r, c))
        for r in range(rows):
            for c in range(cols):
                dfs(r, c, root)
        return list(found)`,
      blanks: [27, 28, 30],
      time: { answer: 'O(rows*cols*4^L)', choices: ['O(rows*cols*4^L)', 'O(rows*cols)', 'O(rows*cols*words.length)', 'O(words.length*L)'], why: 'L = longest word; DFS explores up to 4 directions per depth' },
      space: { answer: 'O(sum of word lengths)', choices: ['O(sum of word lengths)', 'O(rows*cols)', 'O(words.length)', 'O(1)'], why: 'trie stores each shared character path once' },
      sayIt: '==Trie of all words==, then one grid DFS per cell following trie children; mark ==endOfWord== hits as found.',
      pitfall: 'Forgetting to remove (r, c) from path after recursing, which blocks reuse from other starts',
    },

    {
      id: 'thought:stack-trie:longest-common-prefix',
      lc: 14,
      title: 'Longest Common Prefix',
      difficulty: 'Easy',
      category: 'stack-trie',
      skills: ['arrays-hashing'],
      companies: ['google', 'amazon', 'apple'],
      statement: "Given a list of strings, find the longest prefix that every single one of them starts with. If there's no common starting prefix at all, return an empty string.",
      examples: [{ input: "strs = ['flower','flow','flight']", output: "'fl'" }, { input: "strs = ['dog','racecar','car']", output: "''" }],
      constraints: ['1 <= strs.length <= 200', '0 <= strs[i].length <= 200', 'strs[i] consists of lowercase English letters'],
      ds: {
        answer: 'shortest string as the scan bound, compare each column across all words',
        choices: [
          'shortest string as the scan bound, compare each column across all words',
          'trie of all words, walk down following the first child at each node',
          'sorted list of words, compare only the first and last alphabetically',
          'dd(int) counting how many words share each character at index i',
        ],
      },
      method: {
        answer: "Scan column by column up to the ==length of the shortest word==; the moment any word ==disagrees at that column==, the prefix ends there",
        choices: [
          "Scan column by column up to the ==length of the shortest word==; the moment any word ==disagrees at that column==, the prefix ends there",
          'Build a trie of all words, then walk down following the first child at each node until a word ends',
          'Sort the strings alphabetically and compare only the first and the last one character by character',
          "Pick any one string as a candidate and binary search for how many of its leading characters all others share",
        ],
      },
      code: `class Solution:
    def longestCommonPrefix(self, strs: List[str]) -> str:
        shortest = min(strs, key=len)

        for i, c in enumerate(shortest):
            for word in strs:
                if word[i] != c:
                    return shortest[:i]

        return shortest`,
      blanks: [2, 6, 7],
      time: { answer: 'O(n * minLen)', choices: ['O(n * minLen)', 'O(n^2)', 'O(n log n)', 'O(minLen)'], why: 'at most minLen columns, each compared across n strings' },
      space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(minLen)', 'O(n * minLen)'], why: 'only the shortest-string reference and an index are kept' },
      sayIt: '==Column by column== up to the shortest word\'s length; stop the instant any word disagrees at that column.',
      pitfall: 'Not bounding the scan by the shortest string, causing an index error',
    },

    {
      id: 'thought:stack-trie:replace-words',
      lc: 648,
      title: 'Replace Words',
      difficulty: 'Medium',
      category: 'stack-trie',
      skills: ['trie'],
      companies: ['amazon'],
      statement: "You have a dictionary of root words and a sentence. For every word in the sentence, if some root is a prefix of it, replace the word with the shortest such root. Words with no matching root stay exactly as they are.",
      examples: [{ input: "dictionary = ['cat','bat','rat'], sentence = 'the cattle was rattled by the battery'", output: "'the cat was rat by the bat'" }],
      constraints: ['1 <= dictionary.length <= 1000', '1 <= roots[i].length <= 100', '1 <= sentence.length <= 10^6', 'roots and sentence words are lowercase English letters'],
      ds: {
        answer: 'trie of roots with dict children + endOfWord',
        choices: [
          'trie of roots with dict children + endOfWord',
          'set of roots + check every prefix length against the set per word',
          'dd(list) grouping roots by their first letter',
          'sorted list of roots + binary search for a matching prefix per word',
        ],
      },
      method: {
        answer: "Insert all roots into a trie; for each sentence word walk the trie and ==stop at the first endOfWord node==, replacing with that prefix",
        choices: [
          "Insert all roots into a trie; for each sentence word walk the trie and ==stop at the first endOfWord node==, replacing with that prefix",
          'For each word, try every prefix length from shortest to longest against a set of roots',
          'Sort the roots by length, then for each word check only the single shortest root for a match',
          'Build one combined regex of all roots joined by "|" and match it against the start of every word',
        ],
      },
      code: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.endOfWord = False

class Solution:
    def replaceWords(self, dictionary: List[str], sentence: str) -> str:
        root = TrieNode()
        for word in dictionary:
            curr = root
            for c in word:
                if c not in curr.children:
                    curr.children[c] = TrieNode()
                curr = curr.children[c]
            curr.endOfWord = True

        def shortestRoot(word):
            curr = root
            for i, c in enumerate(word):
                if c not in curr.children:
                    return word
                curr = curr.children[c]
                if curr.endOfWord:
                    return word[:i + 1]
            return word

        return ' '.join(shortestRoot(w) for w in sentence.split())`,
      blanks: [19, 22, 26],
      time: { answer: 'O(D + S)', choices: ['O(D + S)', 'O(D * S)', 'O(S log D)', 'O(D log D)'], why: 'D = dictionary chars to build the trie, S = sentence chars to walk it' },
      space: { answer: 'O(D)', choices: ['O(D)', 'O(S)', 'O(D * S)', 'O(1)'], why: 'trie nodes stored once per unique character path in the dictionary' },
      sayIt: 'Trie of roots; walk each sentence word and ==stop at the first endOfWord==, that is the shortest matching root.',
      pitfall: 'Continuing past the first endOfWord instead of stopping immediately, which picks a longer wrong root',
    },
    {
      id: 'thought:stack-trie:basic-calculator-ii',
      lc: 227,
      title: 'Basic Calculator II',
      difficulty: 'Medium',
      category: 'stack-trie',
      skills: ['stack'],
      companies: ['amazon', 'meta'],
      statement: "You're given a string expression containing non-negative integers and the operators +, -, *, and /, with no parentheses and no spaces to worry about once you skip them. Evaluate it following standard operator precedence (multiply and divide before add and subtract) and return the integer result.\n\nDivision between two integers should truncate toward zero.",
      examples: [
        { input: 's = "3+2*2"', output: '7', explanation: '2*2 is evaluated first (6), then 3+6=9... actually 3 + (2*2) = 7' },
        { input: 's = " 3/2 "', output: '1', explanation: 'integer division truncates 1.5 toward zero' },
      ],
      constraints: ['1 <= s.length <= 3*10^5', 's consists of digits, +, -, *, /, and spaces', 'the expression is always valid'],
      ds: {
        answer: 'single stack of signed terms, resolve * and / immediately against the top',
        choices: ['single stack of signed terms, resolve * and / immediately against the top', 'two stacks: one for numbers, one for operators, resolved by precedence at the end', 'queue converting the expression to postfix first, then evaluate the queue', '2-D dp table of (position, running total)'],
      },
      method: {
        answer: "One-pass stack machine: build each multi-digit number as you scan, and when you hit an operator (or the end) apply the PREVIOUS sign — for + or - just push the signed number, but for ==* or / pop the top of the stack and combine it with num immediately==, so precedence falls out for free; sum the stack at the end",
        choices: [
          "One-pass stack machine: build each multi-digit number as you scan, and when you hit an operator (or the end) apply the PREVIOUS sign — for + or - just push the signed number, but for ==* or / pop the top of the stack and combine it with num immediately==, so precedence falls out for free; sum the stack at the end",
          'Convert the expression to postfix (Shunting-yard) first, then evaluate the postfix stack in a second pass',
          "Recursive descent parser splitting on + and - first, then recursively evaluating each term's * and /",
          'Scan right to left, pushing every number and operator, resolving all operators in one final pass by precedence',
        ],
      },
      code: `class Solution:
    def calculate(self, s: str) -> int:
        stack = []
        num = 0
        sign = "+"

        for i, ch in enumerate(s):
            if ch.isdigit():
                num = num * 10 + int(ch)

            if ch in "+-*/" or i == len(s) - 1:
                if sign == "+":
                    stack.append(num)
                elif sign == "-":
                    stack.append(-num)
                elif sign == "*":
                    stack.append(stack.pop() * num)
                else:
                    stack.append(int(stack.pop() / num))

                num = 0
                sign = ch

        return sum(stack)`,
      blanks: [8, 16, 23],
      time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(1)'], why: 'single left-to-right scan of the string' },
      space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'], why: 'stack can hold up to one term per number in the expression' },
      sayIt: 'I resolve * and / the instant I see them by popping the stack, but push + and - as signed numbers to resolve later with a final sum; one pass, O(n) time.',
      pitfall: 'Integer division must truncate toward zero (int(a / b)), not floor — matters on negative intermediate results.',
    },
    {
      id: 'thought:stack-trie:implement-queue-using-stacks',
      lc: 232,
      title: 'Implement Queue using Stacks',
      difficulty: 'Easy',
      category: 'stack-trie',
      skills: ['stack'],
      companies: ['amazon', 'microsoft', 'bloomberg'],
      statement: "Implement a first-in-first-out (FIFO) queue using only two stacks. The queue must support push, pop, peek, and empty, each behaving like a normal queue's version of that operation.\n\nYou may only use standard stack operations: push to top, pop from top, peek at top, and check if empty.",
      examples: [
        { input: 'push(1), push(2), peek(), pop(), empty()', output: '1, 1, false', explanation: 'FIFO order means the first pushed value comes out first, even though stacks are LIFO' },
      ],
      constraints: ['1 <= x <= 9', 'at most 100 calls to push, pop, peek, empty', 'pop and peek are only called on a non-empty queue'],
      ds: {
        answer: 'two stacks: inStack for pushes, outStack for pops/peeks (lazy transfer)',
        choices: ['two stacks: inStack for pushes, outStack for pops/peeks (lazy transfer)', 'one stack + reversing it into a new list on every pop', 'deque used directly as a queue (single structure)', 'two stacks, transferring every element on every single push'],
      },
      method: {
        answer: "Two-stack trick: push always goes onto inStack; pop/peek only refill ==outStack by dumping all of inStack onto it== when outStack is empty, so each element crosses over exactly once no matter how many peeks happen",
        choices: [
          "Two-stack trick: push always goes onto inStack; pop/peek only refill ==outStack by dumping all of inStack onto it== when outStack is empty, so each element crosses over exactly once no matter how many peeks happen",
          'Transfer every element from inStack to outStack and back on every single push, keeping outStack always in FIFO order',
          'Use one stack only, and on pop reverse the whole stack in place to reach the bottom element',
          'Maintain both stacks always in sync (double-write every push to both) so either can be read directly',
        ],
      },
      code: `class MyQueue:
    def __init__(self):
        self.inStack = []
        self.outStack = []

    def push(self, x: int) -> None:
        self.inStack.append(x)

    def pop(self) -> int:
        self.peek()
        return self.outStack.pop()

    def peek(self) -> int:
        if not self.outStack:
            while self.inStack:
                self.outStack.append(self.inStack.pop())
        return self.outStack[-1]

    def empty(self) -> bool:
        return not self.inStack and not self.outStack`,
      blanks: [15, 16, 19],
      time: { answer: 'O(1) amortized', choices: ['O(1) amortized', 'O(n) every call', 'O(n) amortized', 'O(log n) amortized'], why: 'each element moves from inStack to outStack at most once across its lifetime' },
      space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'], why: 'the two stacks together hold every currently queued element' },
      sayIt: "Push onto inStack; pop/peek dump inStack into outStack ONLY when outStack is empty, so every element crosses over once — O(1) amortized.",
      pitfall: "Refilling outStack on every call instead of only when it's empty reverses the order and breaks FIFO.",
    },
    {
      id: 'thought:stack-trie:132-pattern',
      lc: 456,
      title: '132 Pattern',
      difficulty: 'Hard',
      category: 'stack-trie',
      skills: ['monotonic-stack'],
      companies: ['google', 'amazon'],
      statement: `Given an array of integers, find three indices i < j < k such that nums[i] < nums[k] < nums[j]. This is called a 132 pattern, since the relative order of (small, big, middle) matches the digits 1, 3, 2.

Return true if any such triple exists anywhere in the array, false otherwise. You don't need to return the indices themselves.`,
      examples: [
        { input: 'nums = [3,1,4,2]', output: 'true', explanation: 'i=1 (1), j=2 (4), k=3 (2): 1 < 2 < 4' },
        { input: 'nums = [1,2,3,4]', output: 'false', explanation: 'strictly increasing, no later value ever dips back between two earlier ones' },
      ],
      constraints: ['1 <= nums.length <= 2*10^5', '-10^9 <= nums[i] <= 10^9'],
      ds: {
        answer: 'monotonic decreasing stack scanned right-to-left + a running thirdMax variable',
        choices: ['monotonic decreasing stack scanned right-to-left + a running thirdMax variable', 'monotonic increasing stack scanned left-to-right + a running min variable', 'prefix-min array + suffix-max array compared at every index', '2-D dp table of (i, k) pairs'],
      },
      method: {
        answer: "Scan ==right to left==, maintaining a decreasing stack of potential '2' values; whenever the current number pops a smaller value off the stack, that popped value becomes the new ==thirdMax (the '3' candidate)==; if the current number is ever less than thirdMax, it's the '1' and a valid 132 pattern exists",
        choices: [
          "Scan ==right to left==, maintaining a decreasing stack of potential '2' values; whenever the current number pops a smaller value off the stack, that popped value becomes the new ==thirdMax (the '3' candidate)==; if the current number is ever less than thirdMax, it's the '1' and a valid 132 pattern exists",
          "Scan left to right tracking the running minimum so far as the '1' candidate, then check every later pair for a '3' bigger than a '2'",
          'For every index j, binary search to the left for the minimum before j and to the right for a value strictly between min and nums[j]',
          'Brute-force triple nested loop checking every i < j < k directly, no stack',
        ],
      },
      code: `class Solution:
    def find132pattern(self, nums: List[int]) -> bool:
        stack = []
        thirdMax = -math.inf

        for num in reversed(nums):
            if num < thirdMax:
                return True

            while stack and stack[-1] < num:
                thirdMax = stack.pop()

            stack.append(num)

        return False`,
      blanks: [7, 10, 12],
      time: { answer: 'O(n)', choices: ['O(n)', 'O(n^2)', 'O(n log n)', 'O(n^3)'], why: 'each element is pushed and popped from the stack at most once' },
      space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'], why: 'the stack can hold up to n elements in the worst case' },
      sayIt: "Right-to-left with a decreasing stack: popped values become my '3' candidate (thirdMax), and if the current number ever dips below thirdMax that's my '1' — O(n) time.",
      pitfall: 'thirdMax must start at -infinity, and every comparison must be strict, or equal values wrongly count as a pattern.',
    },
    {
      id: 'thought:stack-trie:remove-k-digits',
      lc: 402,
      title: 'Remove K Digits',
      difficulty: 'Medium',
      category: 'stack-trie',
      skills: ['monotonic-stack', 'greedy'],
      companies: ['amazon', 'google'],
      statement: `You're given a string of digits and a number k. Remove exactly k digits from the string so that the remaining digits, kept in their original order, form the smallest possible number.

The result can't have leading zeros unless the number itself is 0, in which case return "0".

Removing a digit means deleting it, not replacing it; the remaining digits just close the gap.`,
      examples: [
        { input: 'num = "1432219", k = 3', output: '"1219"', explanation: 'removing the three largest out-of-place digits (4,3,2) leaves 1219' },
        { input: 'num = "10200", k = 1', output: '"200"', explanation: 'removing the leading 1 leaves "0200", which strips down to "200"' },
      ],
      constraints: ['1 <= k <= num.length <= 10^5', 'num consists of only digits', 'num does not have any leading zeros other than the number 0 itself'],
      ds: {
        answer: 'monotonic increasing stack of digits, with a remaining-removal budget k',
        choices: ['monotonic increasing stack of digits, with a remaining-removal budget k', 'min-heap of digits, popping the k smallest and reassembling in original order', 'two pointers scanning for the first descending pair, removing greedily k times', 'sort the digits and keep the (len(num)-k) smallest, preserving original order'],
      },
      method: {
        answer: "Greedy monotonic stack: while the ==top of the stack is bigger than the current digit== and removals remain, pop (dropping a bigger digit before a smaller one later always helps), then push the current digit; any leftover budget removes from the end, and leading zeros get stripped",
        choices: [
          'Repeat k times: scan the whole string for the first place digit[i] > digit[i+1] and delete digit[i] there, naive O(k*n)',
          'Sort all digits ascending and keep the smallest len(num)-k of them, ignoring their original order',
          "Greedy monotonic stack: while the ==top of the stack is bigger than the current digit== and removals remain, pop (dropping a bigger digit before a smaller one later always helps), then push the current digit; any leftover budget removes from the end, and leading zeros get stripped",
          'Greedy: always remove the single largest digit in the entire remaining string each round',
        ],
      },
      code: `class Solution:
    def removeKdigits(self, num: str, k: int) -> str:
        stack = []

        for digit in num:
            while stack and k > 0 and stack[-1] > digit:
                stack.pop()
                k -= 1
            stack.append(digit)

        while k > 0:
            stack.pop()
            k -= 1

        result = "".join(stack).lstrip("0")
        return result if result else "0"`,
      blanks: [5, 8, 14],
      time: { answer: 'O(n)', choices: ['O(n)', 'O(n * k)', 'O(n log n)', 'O(n^2)'], why: 'each digit is pushed and popped from the stack at most once total' },
      space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(k)', 'O(log n)'], why: 'the stack can hold up to n digits in the worst case' },
      sayIt: 'Monotonic increasing stack: pop a bigger top digit whenever a smaller one shows up and budget remains, trim leftover budget off the end, strip leading zeros; O(n) time.',
      pitfall: 'Leftover k after the main pass still needs removing from the END of the stack, and leading zeros must be stripped before returning.',
    },
    {
      id: 'thought:stack-trie:next-greater-element-ii',
      lc: 503,
      title: 'Next Greater Element II',
      difficulty: 'Medium',
      category: 'stack-trie',
      skills: ['monotonic-stack'],
      companies: ['google', 'amazon'],
      statement: `You're given a circular array (the last element wraps around to connect to the first). For every element, find its next greater element: the first element you'd reach scanning forward (wrapping once if needed) that is strictly bigger.

If no such element exists even after wrapping all the way around, that position's answer is -1.

The array is circular but you only ever wrap around once per starting position, never twice.`,
      examples: [
        { input: 'nums = [1,2,1]', output: '[2,-1,2]', explanation: 'index 0 (1) sees 2 next; index 1 (2) wraps all the way around and finds nothing bigger; index 2 (1) wraps to find 2' },
      ],
      constraints: ['1 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9'],
      ds: {
        answer: 'monotonic decreasing stack of values, scanned over the array twice (circular wrap via modulo)',
        choices: ['monotonic decreasing stack of values, scanned over the array twice (circular wrap via modulo)', 'monotonic decreasing stack scanned once, then the array is physically doubled (nums + nums) before scanning', 'two pointers, one starting at i and one circularly scanning ahead until a bigger value or a full lap', 'min-heap of (value, index), popping until a bigger value surfaces'],
      },
      method: {
        answer: "Monotonic stack scanned right to left over TWO laps (==idx = i % n== simulates a doubled array without copying it): pop anything on the stack that is <= the current value, and only RECORD an answer during the first lap (==i < n==) since the second lap just primes the stack with wraparound candidates",
        choices: [
          'Scan left to right once, pushing indices and resolving each one the first time a bigger value appears anywhere later, including wrapping past the end',
          "Monotonic stack scanned right to left over TWO laps (==idx = i % n== simulates a doubled array without copying it): pop anything on the stack that is <= the current value, and only RECORD an answer during the first lap (==i < n==) since the second lap just primes the stack with wraparound candidates",
          'Physically build doubled = nums + nums, run the standard single-pass next-greater-element scan on it, then only keep the first n answers',
          'For each index, linearly scan forward (wrapping with modulo) until a bigger element or a full lap is completed',
        ],
      },
      code: `class Solution:
    def nextGreaterElements(self, nums: List[int]) -> List[int]:
        n = len(nums)
        result = [-1] * n
        stack = []

        for i in range(2 * n - 1, -1, -1):
            idx = i % n
            while stack and stack[-1] <= nums[idx]:
                stack.pop()
            if stack and i < n:
                result[idx] = stack[-1]
            stack.append(nums[idx])

        return result`,
      blanks: [7, 8, 11],
      time: { answer: 'O(n)', choices: ['O(n)', 'O(n^2)', 'O(n log n)', 'O(2^n)'], why: 'each of the 2n positions pushes and pops from the stack at most once total' },
      space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'], why: 'the stack and result array both scale with n' },
      sayIt: "Two laps right to left via ==i % n==, pop smaller-or-equal values off the stack, only WRITE answers on the first lap since the second lap just seeds wraparound candidates, O(n) time.",
      pitfall: 'The i < n guard matters: skipping it writes answers during the priming lap, before the stack reflects the full circular context.',
    },
    {
      id: 'thought:stack-trie:map-sum-pairs',
      lc: 677,
      title: 'Map Sum Pairs',
      difficulty: 'Medium',
      category: 'stack-trie',
      skills: ['trie'],
      companies: ['google', 'amazon'],
      statement: `Design a structure that supports insert(key, val), storing a value for a string key, and sum(prefix), returning the sum of values for every key that starts with that prefix.

Inserting a key that was already inserted before overwrites its value; it doesn't add to it.`,
      examples: [
        { input: 'insert("apple", 3), sum("ap"), insert("app", 2), sum("ap")', output: '3, 5', explanation: 'sum("ap") first counts only "apple" (3), then also "app" (2) once inserted, for a total of 5' },
      ],
      constraints: ['1 <= key.length, prefix.length <= 50', 'key and prefix consist of only lowercase English letters', '1 <= val <= 1000', 'at most 50 calls total to insert and sum'],
      ds: {
        answer: 'trie of dict children, each node carrying a running prefix sum',
        choices: ['trie of dict children, each node carrying a running prefix sum', 'plain dict mapping key -> val, summing by filtering key.startswith(prefix) on every sum() call', 'sorted list of (key, val) pairs, binary-searching the prefix range on every sum() call', 'trie of dict children storing the full list of (key, val) pairs at each node, summed on demand'],
      },
      method: {
        answer: "Trie where every node along a key's path accumulates that key's value: inserting a key that already exists first computes ==delta = newVal - oldVal==, so re-inserting only adjusts every node's running sum by the difference instead of double-counting; sum(prefix) just walks to that prefix's node and reads its running total",
        choices: [
          'Store every (key, val) pair in a flat dict, and on sum(prefix) iterate all keys checking startswith(prefix), summing matches each time',
          'Trie storing only characters with no running sums, requiring a DFS from the prefix node to total every matching key on each sum() call',
          'Maintain a separate dict for every possible prefix length, recomputing all of them whenever a key is inserted',
          "Trie where every node along a key's path accumulates that key's value: inserting a key that already exists first computes ==delta = newVal - oldVal==, so re-inserting only adjusts every node's running sum by the difference instead of double-counting; sum(prefix) just walks to that prefix's node and reads its running total",
        ],
      },
      code: `class MapSum:
    def __init__(self):
        self.root = {}
        self.scores = {}

    def insert(self, key: str, val: int) -> None:
        delta = val - self.scores.get(key, 0)
        self.scores[key] = val

        node = self.root
        node["_sum"] = node.get("_sum", 0) + delta
        for ch in key:
            node = node.setdefault(ch, {})
            node["_sum"] = node.get("_sum", 0) + delta

    def sum(self, prefix: str) -> int:
        node = self.root
        for ch in prefix:
            if ch not in node:
                return 0
            node = node[ch]

        return node.get("_sum", 0)`,
      blanks: [6, 12, 13],
      time: { answer: 'O(L)', choices: ['O(L)', 'O(26^L)', 'O(number of keys)', 'O(L^2)'], why: 'L = key/prefix length, insert and sum both walk one node per character' },
      space: { answer: 'O(total characters inserted)', choices: ['O(total characters inserted)', 'O(L)', 'O(26^L)', 'O(number of keys)'], why: 'a trie node is created once per unique character position across all inserted keys' },
      sayIt: "Every node on a key's path carries a running sum; re-inserting a key applies ==delta = newVal - oldVal== instead of double counting, sum(prefix) is just one node lookup, O(L) per call.",
      pitfall: 'Re-inserting an existing key must ADJUST every node\'s sum by the delta, not add the new value on top of the old one.',
    },

    {
      id: 'thought:stack-trie:sum-of-subarray-minimums',
      lc: 907,
      title: 'Sum of Subarray Minimums',
      difficulty: 'Medium',
      category: 'stack-trie',
      skills: ['monotonic-stack', 'math'],
      companies: ['amazon'],
      statement: `Given an integer array arr, add up the minimum of every contiguous subarray and return the total modulo 10^9 + 7.

There are O(n^2) subarrays, so aim for better than listing them all.`,
      examples: [
        { input: 'arr = [3,1,2,4]', output: '17', explanation: 'Minimums are 3,1,2,4,1,1,2,1,1,1 which add to 17.' },
        { input: 'arr = [11,81,94,43,3]', output: '444' },
      ],
      constraints: ['1 <= arr.length <= 3 * 10^4', '1 <= arr[i] <= 3 * 10^4'],
      ds: {
        answer: 'monotonic stack of indices + left/right span arrays',
        choices: [
          'monotonic stack of indices + left/right span arrays',
          'deque queue of values + prefix sum array',
          'min-heap of (value, index) pairs',
          'hashmap of value -> count of occurrences',
        ],
      },
      method: {
        answer: 'Find how far each element reaches left (previous smaller) and right (next smaller-or-equal) with a ==monotonic stack==, then add arr[i] * left * right',
        choices: [
          'Find how far each element reaches left (previous smaller) and right (next smaller-or-equal) with a ==monotonic stack==, then add arr[i] * left * right',
          'Enumerate every subarray and take its min with a running min, summing all of them',
          'Sort the array and add each value times its rank',
          'Sliding window of fixed size k, summing each window minimum',
        ],
      },
      code: `class Solution:
    def sumSubarrayMins(self, arr):
        mod = 10**9 + 7
        n = len(arr)
        left = [0] * n
        right = [0] * n
        stack = []
        for i in range(n):
            while stack and arr[stack[-1]] >= arr[i]:
                stack.pop()
            left[i] = i - (stack[-1] if stack else -1)
            stack.append(i)
        stack = []
        for i in range(n - 1, -1, -1):
            while stack and arr[stack[-1]] > arr[i]:
                stack.pop()
            right[i] = (stack[-1] if stack else n) - i
            stack.append(i)
        return sum(arr[i] * left[i] * right[i] for i in range(n)) % mod`,
      blanks: [8, 10, 14],
      time: { answer: 'O(n)', choices: ['O(n)', 'O(n^2)', 'O(n log n)', 'O(n^3)'], why: 'each index is pushed and popped at most once per pass' },
      space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'], why: 'left, right and the stack each hold up to n entries' },
      sayIt: 'For each element count the subarrays where it is the min: ==distance to previous smaller== times ==distance to next smaller-or-equal==, both from a monotonic stack, sum value times count mod 10^9+7. O(n).',
      pitfall: 'Using the same strictness on both sides counts subarrays with equal minimums twice.',
    },

    {
      id: 'thought:stack-trie:remove-duplicate-letters',
      lc: 316,
      title: 'Remove Duplicate Letters',
      difficulty: 'Medium',
      category: 'stack-trie',
      skills: ['monotonic-stack', 'greedy'],
      companies: ['google', 'amazon'],
      statement: `Given a string s of lowercase letters, remove duplicate letters so each letter appears exactly once, and return the smallest string in lexicographic order among all possible results.

You may not reorder the letters you keep, only drop extra copies.`,
      examples: [
        { input: "s = 'bcabc'", output: "'abc'" },
        { input: "s = 'cbacdcbc'", output: "'acdb'" },
      ],
      constraints: ['1 <= s.length <= 10^4', 's consists of lowercase English letters'],
      ds: {
        answer: 'stack of kept letters + last-index dict + in-stack set',
        choices: [
          'stack of kept letters + last-index dict + in-stack set',
          'min-heap of letters + frequency Counter',
          'queue (deque) of letters + visited array',
          'sorted set of the distinct letters only',
        ],
      },
      method: {
        answer: 'Scan once; for each unseen letter ==pop larger letters== off the stack while they occur again later, then push it',
        choices: [
          'Scan once; for each unseen letter ==pop larger letters== off the stack while they occur again later, then push it',
          'Sort the distinct letters alphabetically and join them',
          'Remove the first duplicate you find and repeat until none are left',
          'Keep the first occurrence of every letter with a set',
        ],
      },
      code: `class Solution:
    def removeDuplicateLetters(self, s: str) -> str:
        lastIndex = {ch: i for i, ch in enumerate(s)}
        stack = []
        inStack = set()
        for i, ch in enumerate(s):
            if ch in inStack:
                continue
            while stack and stack[-1] > ch and lastIndex[stack[-1]] > i:
                inStack.remove(stack.pop())
            stack.append(ch)
            inStack.add(ch)
        return ''.join(stack)`,
      blanks: [2, 6, 8, 9],
      time: { answer: 'O(n)', choices: ['O(n)', 'O(n^2)', 'O(n log n)', 'O(26^n)'], why: 'each character is pushed and popped at most once' },
      space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'], why: 'the stack, set and last-index map are all bounded by 26 letters' },
      sayIt: 'Keep an increasing ==monotonic stack==; for a new letter ==pop a bigger top only if it appears again later== (last-index), skip letters already in the stack. O(n).',
      pitfall: 'Popping a larger letter that never appears again drops it from the answer for good.',
    },

    {
      id: 'thought:stack-trie:search-suggestions-system',
      lc: 1268,
      title: 'Search Suggestions System',
      difficulty: 'Medium',
      category: 'stack-trie',
      skills: ['trie', 'binary-search'],
      companies: ['amazon'],
      statement: `You have a list of product names and a searchWord. After each character of searchWord is typed, suggest up to three products that start with what has been typed so far, in lexicographic order.

Return the list of suggestions after each typed character.`,
      examples: [
        { input: "products = ['mobile','mouse','moneypot','monitor','mousepad'], searchWord = 'mouse'", output: "[['mobile','moneypot','monitor'],['mobile','moneypot','monitor'],['mouse','mousepad'],['mouse','mousepad'],['mouse','mousepad']]" },
      ],
      constraints: ['1 <= products.length <= 1000', '1 <= searchWord.length <= 1000', 'products are lowercase and unique'],
      ds: {
        answer: 'sorted list of products + bisect_left on the typed prefix',
        choices: [
          'sorted list of products + bisect_left on the typed prefix',
          'hashmap of full word -> count',
          'max-heap of all products by length',
          'stack of products with a pointer per letter',
        ],
      },
      method: {
        answer: '==Sort== the products once; for each typed prefix ==binary search== its first match and take the next three that still start with the prefix',
        choices: [
          '==Sort== the products once; for each typed prefix ==binary search== its first match and take the next three that still start with the prefix',
          'For each prefix, scan every product and sort the matches before taking three',
          'Insert each product into a hash set and look the prefix up directly',
          'Use a stack and pop products that do not match the next typed letter',
        ],
      },
      code: `class Solution:
    def suggestedProducts(self, products, searchWord):
        products.sort()
        result = []
        prefix = ''
        for ch in searchWord:
            prefix += ch
            i = bisect_left(products, prefix)
            result.append([word for word in products[i:i + 3] if word.startswith(prefix)])
        return result`,
      blanks: [2, 7, 8],
      time: { answer: 'O(n log n + L^2)', choices: ['O(n log n + L^2)', 'O(n * L)', 'O(n^2)', 'O(L)'], why: 'sorting once, then per typed letter a log n bisect plus up to three prefix comparisons of length L' },
      space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(n * L)', 'O(L^2)'], why: 'beyond the output and the in-place sort, only the growing prefix is held' },
      sayIt: '==Sort once==; each typed prefix is a contiguous block, so ==bisect_left== to its start and take up to three that match. A trie with three words per node works too.',
      pitfall: 'The three words after the bisect point may not all share the prefix, so filter with startswith.',
    },

    {
      id: 'thought:stack-trie:maximum-frequency-stack',
      lc: 895,
      title: 'Maximum Frequency Stack',
      difficulty: 'Hard',
      category: 'stack-trie',
      skills: ['stack', 'arrays-hashing', 'ds-diagnosis'],
      companies: ['amazon'],
      statement: `Design a stack-like structure with push(val) and pop(). pop() removes and returns the most frequent element in the stack; if several tie, remove the one closest to the top.

Both operations should run in O(1).`,
      examples: [
        { input: 'push 5,7,5,7,4,5 then pop four times', output: '5, 7, 5, 4', explanation: '5 is most frequent (3), then 5 and 7 tie at 2 so the most recent 7 goes, then 5, then 4.' },
      ],
      constraints: ['0 <= val <= 10^9', 'At most 2 * 10^4 calls'],
      ds: {
        answer: 'dict of counts + dict of frequency -> stack of values + maxCount',
        choices: [
          'dict of counts + dict of frequency -> stack of values + maxCount',
          'max-heap of (count, value) pairs',
          'one list sorted by value on every push',
          'deque with the most frequent value kept at the left',
        ],
      },
      method: {
        answer: 'Give each frequency its own ==stack==; push appends to the stack for the new count, pop takes from the ==highest-count stack== and lowers maxCount when it empties',
        choices: [
          'Give each frequency its own ==stack==; push appends to the stack for the new count, pop takes from the ==highest-count stack== and lowers maxCount when it empties',
          'Keep a heap keyed by (-count, -time) and rebuild it after each pop',
          'Scan the stack from the top on every pop to find the most frequent value',
          'Sort all values by count whenever pop is called',
        ],
      },
      code: `class FreqStack:
    def __init__(self):
        self.count = defaultdict(int)
        self.stacks = defaultdict(list)
        self.maxCount = 0

    def push(self, val: int) -> None:
        self.count[val] += 1
        self.maxCount = max(self.maxCount, self.count[val])
        self.stacks[self.count[val]].append(val)

    def pop(self) -> int:
        val = self.stacks[self.maxCount].pop()
        self.count[val] -= 1
        if not self.stacks[self.maxCount]:
            self.maxCount -= 1
        return val`,
      blanks: [7, 9, 12, 14],
      time: { answer: 'O(1)', choices: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], why: 'each push and pop touches one count and one stack' },
      space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'], why: 'every pushed value sits in one stack per level it has reached' },
      sayIt: 'A ==stack per frequency level==: push to the stack for its new count, pop from the ==stack at maxCount==, so ties fall to the most recent. O(1) each.',
      pitfall: 'Forgetting to decrement maxCount when the top level empties makes the next pop read an empty stack.',
    },
  ],
}
