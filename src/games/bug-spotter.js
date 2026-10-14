import { h, clear } from '../ui/h.js'
import { codeBlock } from '../ui/code.js'
import { createArcade, choiceSet, pickByLevel } from './_engine.js'
import { overrideButton, applyOverrideVisuals } from '../ui/override.js'

const L = (...lines) => lines.join('\n')

const rounds = [
  { d: 1, skills: ['arrays-hashing'], title: 'Two Sum',
    code: L('def twoSum(nums, target):', '    seen = {}', '    for i, x in enumerate(nums):', '        seen[x] = i', '        if target - x in seen:', '            return [seen[target - x], i]', '    return []'),
    buggyLine: 4, bugWhy: 'It records the current number in seen before checking for its complement, so a number can be matched against itself on the very same pass.',
    fixCorrect: 'Add to seen after checking, not before', fixWhy: 'Checking first means seen never contains the current index yet, so a value can only match an earlier, different index.',
    fixDistractors: ["Change `seen[x] = i` to `seen[i] = x`", 'Change `target - x` to `x - target`', 'Change `enumerate(nums)` to `enumerate(nums, 1)`'] },
  { d: 1, skills: ['linked-list'], title: 'Reverse Linked List',
    code: L('def reverseList(head):', '    prev = None', '    curr = head', '    while curr:', '        curr.next = prev', '        prev = curr', '        curr = curr.next', '    return prev'),
    buggyLine: 5, bugWhy: "It overwrites curr.next before saving where the rest of the list continues, so curr = curr.next on the next line just gives back prev, losing everything after curr.",
    fixCorrect: 'Save `nxt = curr.next` before this line, and use `curr = nxt` afterward', fixWhy: 'Saving the next node first means rewiring curr.next can never cost you the rest of the list.',
    fixDistractors: ['Change `curr.next = prev` to `prev.next = curr`', 'Swap the order of `prev = curr` and `curr = curr.next`', 'Change `curr = curr.next` to `curr = prev.next`'] },
  { d: 1, skills: ['binary-search'], title: 'Binary Search',
    code: L('def binarySearch(arr, target):', '    left, right = 0, len(arr) - 1', '    while left <= right:', '        mid = (left + right) // 2', '        if arr[mid] == target:', '            return mid', '        elif arr[mid] < target:', '            left = mid', '        else:', '            right = mid - 1', '    return -1'),
    buggyLine: 8, bugWhy: 'left = mid keeps mid itself in play forever; once left and right converge next to each other with the target still not found, left never moves past mid and the loop spins forever.',
    fixCorrect: 'Change `left = mid` to `left = mid + 1`', fixWhy: 'mid was already checked and ruled out, so the next search window must start strictly after it.',
    fixDistractors: ['Change `right = mid - 1` to `right = mid`', 'Change `mid = (left + right) // 2` to `mid = (left + right + 1) // 2`', 'Change `while left <= right` to `while left < right`'] },
  { d: 1, skills: ['stack'], title: 'Valid Parentheses',
    code: L('def isValid(s):', '    stack = []', "    pairs = {')': '(', ']': '[', '}': '{'}", '    for ch in s:', '        if ch in pairs:', '            if stack.pop() != pairs[ch]:', '                return False', '        else:', '            stack.append(ch)', '    return not stack'),
    buggyLine: 6, bugWhy: "It pops before confirming there's anything to pop. A closer with no matching opener yet, like a lone ')', calls pop() on an empty stack and crashes.",
    fixCorrect: "Change the condition to `if not stack or stack.pop() != pairs[ch]:`", fixWhy: 'Checking that the stack is non-empty first short-circuits before the crashing pop ever runs.',
    fixDistractors: ['Change `stack.pop()` to `stack[-1]`', 'Change `return not stack` to `return True`', 'Change `stack.append(ch)` to `stack.insert(0, ch)`'] },
  { d: 1, skills: ['dp-1d'], title: 'Maximum Subarray (Kadane)',
    code: L('def maxSubArray(nums):', '    best = nums[0]', '    curr = nums[0]', '    for i in range(1, len(nums)):', '        curr = max(0, curr + nums[i])', '        best = max(best, curr)', '    return best'),
    buggyLine: 5, bugWhy: "Clamping curr to a floor of 0 lets it reset even when every number is negative, and since best = max(best, curr) can then see that 0, it wrongly reports 0 as the max subarray sum for an all-negative array.",
    fixCorrect: 'Change `max(0, curr + nums[i])` to `max(nums[i], curr + nums[i])`', fixWhy: 'The restart option should be the current element itself, not a hardcoded 0, so negative-only arrays still track their best (least negative) run.',
    fixDistractors: ['Change `best = nums[0]` to `best = 0`', 'Change `curr = nums[0]` to `curr = 0`', 'Change `range(1, len(nums))` to `range(len(nums))`'] },
  { d: 1, skills: ['dp-1d'], title: 'Climbing Stairs',
    code: L('def climbStairs(n):', '    if n <= 2:', '        return n', '    dp = [0] * (n + 1)', '    dp[1], dp[2] = 1, 2', '    for i in range(3, n + 1):', '        dp[i] = dp[i - 1]', '    return dp[n]'),
    buggyLine: 7, bugWhy: "It only counts the path that ends on a 1-step move, ignoring the path that ends on a 2-step move from i - 2.",
    fixCorrect: 'Change `dp[i] = dp[i - 1]` to `dp[i] = dp[i - 1] + dp[i - 2]`', fixWhy: 'Every way to reach stair i ends with either a final 1-step or a final 2-step, so both counts must be added together.',
    fixDistractors: ['Change `dp[1], dp[2] = 1, 2` to `dp[1], dp[2] = 0, 1`', 'Change `range(3, n + 1)` to `range(2, n + 1)`', 'Change `if n <= 2: return n` to `if n <= 1: return n`'] },
  { d: 1, skills: ['dp-1d'], title: 'House Robber',
    code: L('def rob(nums):', '    if not nums:', '        return 0', '    dp = [0] * len(nums)', '    dp[0] = nums[0]', '    for i in range(1, len(nums)):', '        prev = dp[i - 2] if i >= 2 else 0', '        dp[i] = prev + nums[i]', '    return max(dp)'),
    buggyLine: 8, bugWhy: 'It always robs house i, never considering the option of skipping it to keep the best total from before. A pricey house next to an even pricier one should sometimes be skipped.',
    fixCorrect: 'Change to `dp[i] = max(dp[i - 1], prev + nums[i])`', fixWhy: "Robbing house i and skipping house i are both legal plans, so dp[i] must take whichever is worth more.",
    fixDistractors: ['Change `prev + nums[i]` to `prev - nums[i]`', 'Change `dp[0] = nums[0]` to `dp[0] = 0`', 'Change `max(dp)` to `dp[-1]`'] },
  { d: 2, skills: ['dp-1d'], title: 'Coin Change (fewest coins)',
    code: L('def coinChange(coins, amount):', "    dp = [float('inf')] * (amount + 1)", "    dp[0] = float('inf')", '    for a in range(1, amount + 1):', '        for c in coins:', '            if c <= a:', '                dp[a] = min(dp[a], dp[a - c] + 1)', "    return dp[amount] if dp[amount] != float('inf') else -1"),
    buggyLine: 3, bugWhy: "Making dp[0] infinite means no amount can ever build off of it correctly, since dp[a - c] + 1 inherits that infinity instead of a real coin count.",
    fixCorrect: "Change `dp[0] = float('inf')` to `dp[0] = 0`", fixWhy: 'Zero amount needs zero coins — that has to be a real, finite number for every other amount to build on.',
    fixDistractors: ['Change `dp[a - c] + 1` to `dp[a - c] - 1`', 'Change `c <= a` to `c < a`', 'Change `range(1, amount + 1)` to `range(0, amount + 1)`'] },
  { d: 2, skills: ['dp-1d'], title: 'Word Break',
    code: L('def wordBreak(s, wordDict):', '    words = set(wordDict)', '    dp = [False] * (len(s) + 1)', '    for i in range(1, len(s) + 1):', '        for j in range(0, i):', '            if dp[j] and s[j:i] in words:', '                dp[i] = True', '    return dp[len(s)]'),
    buggyLine: 3, bugWhy: 'There is no base case marking the empty prefix as breakable, so dp[j] is never True for j = 0 and nothing downstream can ever become True either.',
    fixCorrect: 'Add `dp[0] = True` right after this line', fixWhy: 'An empty prefix trivially breaks, and every other dp[i] depends on that base case being True.',
    fixDistractors: ['Change `dp = [False] * (len(s) + 1)` to `dp = [True] * (len(s) + 1)`', 'Change `range(0, i)` to `range(1, i)`', 'Change `dp[j] and s[j:i] in words` to `dp[j] or s[j:i] in words`'] },
  { d: 1, skills: ['dp-1d'], title: 'Longest Increasing Subsequence',
    code: L('def lengthOfLIS(nums):', '    dp = [1] * len(nums)', '    for i in range(len(nums)):', '        for j in range(i):', '            if nums[j] > nums[i]:', '                dp[i] = max(dp[i], dp[j] + 1)', '    return max(dp)'),
    buggyLine: 5, bugWhy: "This condition only extends a run when an earlier value is bigger, which builds the longest decreasing run instead of increasing.",
    fixCorrect: 'Change `nums[j] > nums[i]` to `nums[j] < nums[i]`', fixWhy: 'An increasing subsequence only extends past an earlier value that was smaller.',
    fixDistractors: ['Change `dp[j] + 1` to `dp[i] + 1`', 'Change `dp = [1] * len(nums)` to `dp = [0] * len(nums)`', 'Change `max(dp)` to `dp[-1]`'] },
  { d: 1, skills: ['dp-2d'], title: 'Unique Paths',
    code: L('def uniquePaths(m, n):', '    dp = [[0] * n for _ in range(m)]', '    for i in range(m):', '        for j in range(n):', '            if i == 0 or j == 0:', '                dp[i][j] = 0', '            else:', '                dp[i][j] = dp[i - 1][j] + dp[i][j - 1]', '    return dp[m - 1][n - 1]'),
    buggyLine: 6, bugWhy: "The top row and left column each have exactly one path (straight across or straight down), not zero — setting them to 0 makes every path count downstream come out as 0 too.",
    fixCorrect: 'Change `dp[i][j] = 0` to `dp[i][j] = 1`', fixWhy: 'There is exactly one way to trace the top row or left column: keep going straight the whole way.',
    fixDistractors: ['Change `dp[i - 1][j] + dp[i][j - 1]` to `dp[i - 1][j] * dp[i][j - 1]`', 'Change `i == 0 or j == 0` to `i == 0 and j == 0`', 'Change `dp = [[0] * n ...]` to `dp = [[1] * n ...]`'] },
  { d: 3, skills: ['dp-2d'], title: 'Edit Distance',
    code: L('def minDistance(word1, word2):', '    m, n = len(word1), len(word2)', '    dp = [[0] * (n + 1) for _ in range(m + 1)]', '    for i in range(m + 1):', '        dp[i][0] = i', '    for j in range(n + 1):', '        dp[0][j] = j', '    for i in range(1, m + 1):', '        for j in range(1, n + 1):', '            if word1[i - 1] == word2[j - 1]:', '                dp[i][j] = dp[i - 1][j - 1]', '            else:', '                dp[i][j] = dp[i - 1][j - 1]', '    return dp[m][n]'),
    buggyLine: 13, bugWhy: 'On a mismatch it just copies the match-case formula, never adding the cost of an edit or considering insert and delete as options — it silently assumes every mismatch is free.',
    fixCorrect: 'Change to `dp[i][j] = 1 + min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])`', fixWhy: 'A mismatch always costs one edit, and that edit can be a substitution, an insertion, or a deletion — take whichever is cheapest.',
    fixDistractors: ['Change to `dp[i][j] = dp[i - 1][j - 1] + 1`', 'Change `word1[i - 1] == word2[j - 1]` to `word1[i] == word2[j]`', 'Change `dp[i][0] = i` to `dp[i][0] = 0`'] },
  { d: 2, skills: ['grid'], title: 'Shortest Path in Grid (BFS)',
    code: L('def shortestPath(grid):', '    rows, cols = len(grid), len(grid[0])', '    queue = deque([(0, 0, 0)])', '    seen = {(0, 0)}', '    while queue:', '        r, c, dist = queue.popleft()', '        if (r, c) == (rows - 1, cols - 1):', '            return dist', '        for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:', '            nr, nc = r + dr, c + dc', '            if (nr, nc) not in seen and grid[nr][nc] == 0:', '                seen.add((nr, nc))', '                queue.append((nr, nc, dist + 1))', '    return -1'),
    buggyLine: 11, bugWhy: 'It indexes grid[nr][nc] before confirming nr and nc are still inside the grid, so stepping off any border crashes with an IndexError.',
    fixCorrect: 'Add `0 <= nr < rows and 0 <= nc < cols and` to the condition', fixWhy: 'Bounds must be checked before the grid is indexed, not after.',
    fixDistractors: ['Change `grid[nr][nc] == 0` to `grid[nr][nc] == 1`', 'Change `seen = {(0, 0)}` to `seen = set()`', 'Move `seen.add((nr, nc))` after the recursive call'] },
  { d: 3, skills: ['topo-sort'], title: 'Course Schedule (cycle detection)',
    code: L('def canFinish(numCourses, prerequisites):', '    graph = [[] for _ in range(numCourses)]', '    for a, b in prerequisites:', '        graph[a].append(b)', '    visited = set()', '    def dfs(node):', '        if node in visited:', '            return True', '        visited.add(node)', '        for nxt in graph[node]:', '            if not dfs(nxt):', '                return False', '        return True', '    return all(dfs(i) for i in range(numCourses))'),
    buggyLine: 7, bugWhy: "Treating any previously-seen node as automatically fine conflates 'already fully checked' with 'currently being checked on this very path' — which is exactly what a cycle looks like.",
    fixCorrect: 'Track a separate in-progress set and return False if node is already in progress', fixWhy: 'A cycle reveals itself as revisiting a node that is still an ancestor on the current recursion path, which requires telling that apart from a node that finished cleanly earlier.',
    fixDistractors: ['Change `if node in visited: return True` to `if node in visited: return False`', 'Change `visited.add(node)` to run after the for loop instead of before', 'Change `all(dfs(i) ...)` to `any(dfs(i) ...)`'] },
  { d: 2, skills: ['graph-bfs'], title: 'Rotting Oranges',
    code: L('def orangesRotting(grid):', '    rows, cols = len(grid), len(grid[0])', '    queue = deque()', '    fresh = 0', '    for r in range(rows):', '        for c in range(cols):', '            if grid[r][c] == 2:', '                queue.append((r, c))', '                break', '            elif grid[r][c] == 1:', '                fresh += 1', '    minutes = 0', '    while queue and fresh:', '        minutes += 1', '        for _ in range(len(queue)):', '            r, c = queue.popleft()', '            for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:', '                nr, nc = r+dr, c+dc', '                if 0<=nr<rows and 0<=nc<cols and grid[nr][nc]==1:', '                    grid[nr][nc] = 2', '                    fresh -= 1', '                    queue.append((nr, nc))', '    return minutes if fresh == 0 else -1'),
    buggyLine: 9, bugWhy: "This break exits the inner column loop the moment it finds one rotten orange in a row, so any additional rotten oranges later in that same row never get added as starting sources.",
    fixCorrect: 'Delete the `break` statement', fixWhy: 'Every rotten orange on the board has to start in the queue, not just the first one found per row.',
    fixDistractors: ['Change `break` to `continue`', 'Move the `break` outside both for loops', 'Change `queue.append((r, c))` to `queue.appendleft((r, c))`'] },
  { d: 3, skills: ['queue-deque'], title: '0-1 BFS',
    code: L('def zeroOneBFS(n, edges, src):', '    graph = [[] for _ in range(n)]', '    for u, v, w in edges:', '        graph[u].append((v, w))', "    dist = [float('inf')] * n", '    dist[src] = 0', '    dq = deque([src])', '    while dq:', '        node = dq.popleft()', '        for neighbor, weight in graph[node]:', '            if dist[node] + weight < dist[neighbor]:', '                dist[neighbor] = dist[node] + weight', '                if weight == 0:', '                    dq.append(neighbor)', '                else:', '                    dq.append(neighbor)'),
    buggyLine: 14, bugWhy: "0-1 BFS relies on 0-weight edges jumping to the FRONT of the deque so they're processed before edges already queued — appending to the back here throws that ordering away.",
    fixCorrect: 'Change line 14 to `dq.appendleft(neighbor)`', fixWhy: 'A 0-weight edge reaches its target with no extra cost, so it deserves to be processed immediately, ahead of anything already waiting.',
    fixDistractors: ['Change line 16 to `dq.appendleft(neighbor)`', 'Change `dist[node] + weight < dist[neighbor]` to `<=`', 'Change `dq.popleft()` to `dq.pop()`'] },
  { d: 2, skills: ['heap'], title: 'Top K Frequent Elements',
    code: L('def topKFrequent(nums, k):', '    counts = Counter(nums)', '    heap = []', '    for num, freq in counts.items():', '        heapq.heappush(heap, (freq, num))', '        if len(heap) >= k:', '            heapq.heappop(heap)', '    return [num for freq, num in heap]'),
    buggyLine: 6, bugWhy: 'Popping as soon as the heap merely reaches size k — instead of only once it exceeds k — means the heap can never actually hold k elements at the end; it settles at k - 1.',
    fixCorrect: 'Change `>=` to `>`', fixWhy: 'The heap should only shed an element once a k+1th one arrives, keeping exactly the top k the rest of the time.',
    fixDistractors: ['Change `(freq, num)` to `(num, freq)` when pushing', 'Change `heapq.heappop(heap)` to `heap.pop(0)`', 'Change `counts.items()` to `counts.keys()`'] },
  { d: 2, skills: ['trie'], title: 'Trie Prefix Count',
    code: L('class Trie:', '    def __init__(self):', '        self.children = {}', '        self.count = 0', '    def insert(self, word):', '        node = self', '        for ch in word:', '            if ch not in node.children:', '                node.children[ch] = Trie()', '            node = node.children[ch]', '    def countWithPrefix(self, prefix):', '        node = self', '        for ch in prefix:', '            if ch not in node.children:', '                return 0', '            node = node.children[ch]', '        return node.count'),
    buggyLine: 10, bugWhy: 'insert walks the path for every character but never touches node.count along the way, so every count stays 0 forever no matter how many words are inserted.',
    fixCorrect: 'Add `node.count += 1` right after this line, inside the loop', fixWhy: 'Every node on a word’s path should have its count bumped once per word that passes through it, so prefix counts work.',
    fixDistractors: ['Add `node.count += 1` only after the loop ends', 'Change `return node.count` to `return len(node.children)`', 'Change `self.count = 0` to `self.count = 1`'] },
  { d: 2, skills: ['backtracking'], title: 'Combinations',
    code: L('def combine(n, k):', '    result = []', '    curr = []', '    def dfs(start):', '        if len(curr) == k:', '            result.append(curr.copy())', '            return', '        for i in range(start, n + 1):', '            curr.append(i)', '            dfs(i + 1)', '    dfs(1)', '    return result'),
    buggyLine: 10, bugWhy: 'There is no curr.pop() after the recursive call, so curr keeps growing across branches instead of backtracking to its state before i was tried.',
    fixCorrect: 'Add `curr.pop()` on the next line, after `dfs(i + 1)`', fixWhy: 'Backtracking means undoing a choice before trying the next one, so curr has to shrink back down after each recursive branch returns.',
    fixDistractors: ['Move `curr.append(i)` to after `dfs(i + 1)`', 'Change `len(curr) == k` to `len(curr) >= k`', 'Change `range(start, n + 1)` to `range(start, n)`'] },
  { d: 2, skills: ['backtracking'], title: 'Permutations',
    code: L('def permute(nums):', '    result = []', '    def dfs(curr, remaining):', '        if not remaining:', '            result.append(curr)', '            return', '        for i in range(len(remaining)):', '            dfs(curr + [remaining[i]], remaining[i + 1:])', '    dfs([], nums)', '    return result'),
    buggyLine: 8, bugWhy: 'remaining[i + 1:] throws away every element before index i too, not just the one being used — so values earlier in the list vanish from that whole branch instead of staying available.',
    fixCorrect: 'Change `remaining[i + 1:]` to `remaining[:i] + remaining[i + 1:]`', fixWhy: 'Only the chosen element itself should be removed; everything else in remaining, before or after it, still needs to be tried.',
    fixDistractors: ['Change `curr + [remaining[i]]` to `curr.append(remaining[i])`', 'Change `if not remaining:` to `if len(curr) == len(nums):`', 'Change `range(len(remaining))` to `range(1, len(remaining))`'] },
  { d: 3, skills: ['backtracking'], title: 'N-Queens Safety Check',
    code: L('def isSafe(board, row, col, n):', '    for i in range(row):', '        if board[i] == col:', '            return False', '        if board[i] - col == i - row:', '            return False', '    return True'),
    buggyLine: 5, bugWhy: 'Without abs() on both sides, this only catches one diagonal direction and misses attacks coming from the other diagonal.',
    fixCorrect: 'Change the condition to `abs(board[i] - col) == abs(i - row)`', fixWhy: 'A queen attacks along both diagonals, and absolute value is what makes the same formula catch both directions.',
    fixDistractors: ['Change `board[i] == col` to `board[i] != col`', 'Change `range(row)` to `range(row, n)`', 'Change `return False` to `continue`'] },
  { d: 2, skills: ['greedy'], title: 'Jump Game',
    code: L('def canJump(nums):', '    reach = 0', '    for i in range(len(nums)):', '        if i > reach:', '            return False', '        reach = i + nums[i]', '    return True'),
    buggyLine: 6, bugWhy: "Overwriting reach every step lets it shrink if the current index's own jump is smaller than a farther reach some earlier index already established.",
    fixCorrect: 'Change to `reach = max(reach, i + nums[i])`', fixWhy: 'reach should remember the farthest point ever proven reachable, which can only grow, never fall back.',
    fixDistractors: ['Change `i > reach` to `i >= reach`', 'Change `reach = i + nums[i]` to `reach += nums[i]`', 'Change `range(len(nums))` to `range(len(nums) - 1)`'] },
  { d: 3, skills: ['greedy'], title: 'Jump Game II (min jumps)',
    code: L('def jump(nums):', '    jumps = 0', '    currentEnd = 0', '    farthest = 0', '    for i in range(len(nums)):', '        farthest = max(farthest, i + nums[i])', '        if i == currentEnd:', '            jumps += 1', '            currentEnd = farthest', '    return jumps'),
    buggyLine: 5, bugWhy: "Looping all the way through the last index means that once currentEnd lands exactly on the final index, the code still counts one more unnecessary jump from a destination you've already reached.",
    fixCorrect: 'Change `range(len(nums))` to `range(len(nums) - 1)`', fixWhy: 'You never need to jump from the last index — you are already there — so it should not be processed as a jump trigger.',
    fixDistractors: ['Change `farthest = max(farthest, i + nums[i])` to `farthest = i + nums[i]`', 'Change `i == currentEnd` to `i >= currentEnd`', 'Change `jumps += 1` to `jumps = i`'] },
  { d: 3, skills: ['union-find'], title: 'Count Connected Components',
    code: L('def find(parent, x):', '    while parent[x] != x:', '        x = parent[x]', '    return x', '', 'def union(parent, a, b):', '    rootA = find(parent, a)', '    rootB = find(parent, b)', '    parent[rootB] = rootA', '', 'def countComponents(n, edges):', '    parent = list(range(n))', '    for a, b in edges:', '        union(parent, a, b)', '    return len(set(parent))'),
    buggyLine: 15, bugWhy: "A node's raw parent[] value is not always its current true root — a former root can later get reparented under someone else without every node that pointed to it being updated. Counting raw parent values can overcount components.",
    fixCorrect: 'Change `len(set(parent))` to `len({find(parent, i) for i in range(n)})`', fixWhy: 'Resolving every node all the way to its true root before counting is the only way to get the real number of distinct groups.',
    fixDistractors: ['Change `parent[rootB] = rootA` to `parent[rootA] = rootB`', 'Change `while parent[x] != x` to `if parent[x] != x`', 'Change `parent = list(range(n))` to `parent = [0] * n`'] },
  { d: 2, skills: ['prefix-sum'], title: 'Subarray Sum Equals K',
    code: L('def subarraySum(nums, k):', '    counts = {}', '    total = 0', '    result = 0', '    for x in nums:', '        total += x', '        if total - k in counts:', '            result += counts[total - k]', '        counts[total] = counts.get(total, 0) + 1', '    return result'),
    buggyLine: 2, bugWhy: 'A subarray starting from index 0 needs to match against a prefix sum of 0 (meaning "before any elements"), but that 0 is never seeded into counts up front.',
    fixCorrect: 'Change `counts = {}` to `counts = {0: 1}`', fixWhy: 'Seeding a prefix sum of 0 lets subarrays that start at the very beginning of the array be counted too.',
    fixDistractors: ['Change `counts.get(total, 0) + 1` to `counts.get(total, 1) + 1`', 'Change `total - k in counts` to `k - total in counts`', 'Change `total += x` to `total = x`'] },
  { d: 1, skills: ['monotonic-stack'], title: 'Daily Temperatures',
    code: L('def dailyTemperatures(temps):', '    result = [0] * len(temps)', '    stack = []', '    for i, t in enumerate(temps):', '        while stack and temps[stack[-1]] < t:', '            prevIndex = stack.pop()', '            result[prevIndex] = t - temps[prevIndex]', '        stack.append(t)', '    return result'),
    buggyLine: 8, bugWhy: "Everywhere else the stack is treated as holding indices (temps[stack[-1]], result[prevIndex]), but this line pushes the temperature value itself instead of its index.",
    fixCorrect: 'Change `stack.append(t)` to `stack.append(i)`', fixWhy: 'The stack needs to track positions so the code can later compute a day-distance and look values back up by index.',
    fixDistractors: ['Change `temps[stack[-1]] < t` to `stack[-1] < t`', 'Change `result[prevIndex] = t - temps[prevIndex]` to `result[prevIndex] = i - prevIndex`', 'Change `enumerate(temps)` to `enumerate(temps, 1)`'] },
  { d: 2, skills: ['queue-deque'], title: 'Queue Using Two Stacks',
    code: L('class MyQueue:', '    def __init__(self):', '        self.inStack = []', '        self.outStack = []', '    def push(self, x):', '        self.inStack.append(x)', '    def pop(self):', '        for _ in range(len(self.inStack)):', '            self.outStack.append(self.inStack.pop())', '        return self.outStack.pop()'),
    buggyLine: 8, bugWhy: 'It transfers from inStack every single time pop is called, even when outStack already has older elements correctly ordered on top — dumping inStack on top of it scrambles the order.',
    fixCorrect: 'Wrap the transfer loop in `if not self.outStack:`', fixWhy: 'Only refill outStack from inStack once outStack has fully drained; otherwise the existing order is already correct.',
    fixDistractors: ['Change `self.outStack.pop()` to `self.outStack.pop(0)`', 'Change `self.inStack.append(x)` to `self.outStack.append(x)`', 'Change `range(len(self.inStack))` to `range(len(self.outStack))`'] },
  { d: 1, skills: ['linked-list'], title: 'Merge Two Sorted Lists',
    code: L('def mergeTwoLists(l1, l2):', '    dummy = ListNode()', '    tail = dummy', '    while l1 and l2:', '        if l1.val <= l2.val:', '            tail.next = l1', '            l1 = l1.next', '        else:', '            tail.next = l2', '            l2 = l2.next', '        tail = tail.next', '    return dummy.next'),
    buggyLine: 12, bugWhy: "Once either list runs out, the loop ends — but whichever list still has leftover nodes never gets attached to the tail.",
    fixCorrect: 'Add `tail.next = l1 or l2` right before this line', fixWhy: 'Exactly one list can still have nodes left over once the loop ends, and they need to be appended wholesale.',
    fixDistractors: ['Change `l1.val <= l2.val` to `l1.val < l2.val`', 'Change `tail = tail.next` to `tail = l1 or l2`', 'Change `dummy = ListNode()` to `dummy = l1`'] },
  { d: 3, skills: ['bst'], title: 'Validate BST',
    code: L('def isValidBST(node):', '    if not node:', '        return True', '    if node.left and node.left.val >= node.val:', '        return False', '    if node.right and node.right.val <= node.val:', '        return False', '    return isValidBST(node.left) and isValidBST(node.right)'),
    buggyLine: 8, bugWhy: "Only comparing a node to its immediate children misses violations further down — a left-subtree grandchild could be larger than the root without ever directly touching it.",
    fixCorrect: 'Pass down a low/high range and check `low < node.val < high` instead of just comparing to immediate children', fixWhy: 'Every node in a subtree is bounded by every ancestor above it, not just its direct parent, so the valid range has to be threaded through the recursion.',
    fixDistractors: ['Change `>=` to `>` on line 4', 'Change `<=` to `<` on line 6', 'Change `and` to `or` on line 8'] },
  { d: 2, skills: ['grid'], title: 'Flood Fill',
    code: L('def floodFill(image, sr, sc, color):', '    oldColor = image[sr][sc]', '    def dfs(r, c):', '        if r < 0 or r >= len(image) or c < 0 or c >= len(image[0]):', '            return', '        if image[r][c] != oldColor:', '            return', '        image[r][c] = color', '        dfs(r + 1, c); dfs(r - 1, c)', '        dfs(r, c + 1); dfs(r, c - 1)', '    dfs(sr, sc)', '    return image'),
    buggyLine: 2, bugWhy: "If the fill color happens to equal the starting color, painting a cell never actually changes it, so it never stops looking 'unfilled' and the 4-way recursion spins forever.",
    fixCorrect: 'Add `if oldColor == color: return image` right after this line', fixWhy: 'When the new color matches the old one there is nothing to do, and skipping that case avoids infinite recursion.',
    fixDistractors: ['Change `image[r][c] != oldColor` to `image[r][c] == oldColor`', 'Change `image[r][c] = color` to run before the bounds check', 'Change `dfs(sr, sc)` to `dfs(sr, sc, oldColor)`'] },
  { d: 2, skills: ['intervals'], title: 'Insert Interval',
    code: L('def insert(intervals, newInterval):', '    result = []', '    i = 0', '    n = len(intervals)', '    while i < n and intervals[i][1] < newInterval[0]:', '        result.append(intervals[i])', '        i += 1', '    while i < n and intervals[i][0] <= newInterval[1]:', '        newInterval[0] = min(newInterval[0], intervals[i][0])', '        newInterval[1] = min(newInterval[1], intervals[i][1])', '        i += 1', '    result.append(newInterval)', '    result.extend(intervals[i:])', '    return result'),
    buggyLine: 10, bugWhy: 'Taking the min of the two end times shrinks the merged interval instead of growing it to cover everything it overlaps.',
    fixCorrect: 'Change `min(newInterval[1], intervals[i][1])` to `max(newInterval[1], intervals[i][1])`', fixWhy: 'A merged interval has to extend at least as far as every interval it absorbed, so the end time can only grow.',
    fixDistractors: ['Change `intervals[i][0] <= newInterval[1]` to `intervals[i][0] < newInterval[1]`', 'Change `min(newInterval[0], intervals[i][0])` to `max(newInterval[0], intervals[i][0])`', 'Change `intervals[i][1] < newInterval[0]` to `intervals[i][1] <= newInterval[0]`'] },
  { d: 1, skills: ['bit'], title: 'Single Number (XOR)',
    code: L('def singleNumber(nums):', '    result = nums[0]', '    for x in nums:', '        result ^= x', '    return result'),
    buggyLine: 2, bugWhy: 'Seeding result with nums[0] and then also XOR-ing nums[0] again inside the loop cancels it out completely (x ^ x = 0), quietly dropping it from the computation.',
    fixCorrect: 'Change `result = nums[0]` to `result = 0`', fixWhy: 'XOR-ing every number against an identity start of 0 means each one is counted exactly once, with no double cancellation.',
    fixDistractors: ['Change `result = nums[0]` to `result = nums[-1]`', 'Change `result ^= x` to `result = x`', 'Change `for x in nums:` to `for x in range(len(nums)):`'] },
  { d: 2, skills: ['math'], title: 'Greatest Common Divisor',
    code: L('def gcd(a, b):', '    if b == 0:', '        return a', '    return gcd(a % b, b)'),
    buggyLine: 4, bugWhy: 'Swapping the arguments wrong means b never changes between calls, so the base case b == 0 can only ever trigger if the original b already was 0 — otherwise it recurses on the same unchanging b forever.',
    fixCorrect: 'Change `gcd(a % b, b)` to `gcd(b, a % b)`', fixWhy: "Euclid's algorithm needs the remainder to become the new b each step so it keeps shrinking toward the base case.",
    fixDistractors: ['Change `b == 0` to `a == 0`', 'Change `a % b` to `b % a`', 'Change `return a` to `return b`'] },
  { d: 2, skills: ['two-pointers'], title: 'Container With Most Water',
    code: L('def maxArea(height):', '    left, right = 0, len(height) - 1', '    best = 0', '    while left < right:', '        area = min(height[left], height[right]) * (right - left)', '        best = max(best, area)', '        left += 1', '        right -= 1', '    return best'),
    buggyLine: 7, bugWhy: 'Moving both pointers inward every step regardless of height can skip right past the true optimal pairing — the proof behind this approach only holds if you move the shorter side.',
    fixCorrect: 'Only move the shorter side: `if height[left] < height[right]: left += 1 else: right -= 1`', fixWhy: 'The taller line can never be the bottleneck again until the shorter one moves, so only the shorter pointer should advance.',
    fixDistractors: ['Change `min(...)` to `max(...)` on the area line', 'Change `right - left` to `right - left + 1`', 'Change `while left < right` to `while left <= right`'] },
  { d: 2, skills: ['sliding-window'], title: 'Minimum Size Subarray Sum',
    code: L('def minSubArrayLen(target, nums):', '    left = 0', '    total = 0', "    best = float('inf')", '    for right, x in enumerate(nums):', '        total += x', '        if total >= target:', '            best = min(best, right - left + 1)', '            total -= nums[left]', '            left += 1', "    return best if best != float('inf') else 0"),
    buggyLine: 7, bugWhy: 'Using if instead of while only shrinks the window by one step even when it could keep shrinking further and still satisfy the target, missing shorter valid windows.',
    fixCorrect: 'Change `if total >= target:` to `while total >= target:`', fixWhy: 'The window should keep shrinking from the left as long as it still meets the target, to find the shortest valid length.',
    fixDistractors: ['Change `total -= nums[left]` to `total -= nums[right]`', 'Change `right - left + 1` to `right - left`', 'Change `total += x` to `total = x`'] },
  { d: 1, skills: ['arrays-hashing'], title: 'Group Anagrams',
    code: L('def groupAnagrams(words):', '    groups = {}', '    for word in words:', '        key = word', "        groups.setdefault(key, []).append(word)", '    return list(groups.values())'),
    buggyLine: 4, bugWhy: "Using the raw word as its own key means every word is its own unique key, so true anagrams never land in the same group.",
    fixCorrect: "Change `key = word` to `key = ''.join(sorted(word))`", fixWhy: 'Anagrams share the exact same letters, so sorting the letters gives every anagram of a word the identical key.',
    fixDistractors: ['Change `groups.setdefault(key, [])` to `groups.get(key, [])`', 'Change `list(groups.values())` to `list(groups.keys())`', 'Change `for word in words:` to `for word in set(words):`'] },
  { d: 3, skills: ['graph-modeling'], title: 'Clone Graph',
    code: L('def cloneGraph(node):', '    clones = {}', '    def dfs(n):', '        copy = Node(n.val)', '        clones[n] = copy', '        for neighbor in n.neighbors:', '            copy.neighbors.append(dfs(neighbor))', '        return copy', '    return dfs(node) if node else None'),
    buggyLine: 7, bugWhy: "It never checks whether a neighbor has already been cloned before recursing into it again, so any cycle in the graph (very common, since neighbors usually point back) recurses forever.",
    fixCorrect: 'At the start of the loop, check `if neighbor in clones: copy.neighbors.append(clones[neighbor]); continue`', fixWhy: 'Reusing an already-made clone instead of remaking it is what breaks the infinite cycle.',
    fixDistractors: ['Change `clones[n] = copy` to run after the for loop', 'Change `Node(n.val)` to `Node(n.val, n.neighbors)`', 'Change `dfs(node) if node else None` to `dfs(node)`'] },
  { d: 2, skills: ['arrays-hashing', 'math'], title: 'Majority Element (Boyer-Moore)',
    code: L('def majorityElement(nums):', '    count = 0', '    candidate = nums[0]', '    for x in nums:', '        if x == candidate:', '            count += 1', '        else:', '            count -= 1', '    return candidate'),
    buggyLine: 3, bugWhy: "candidate is locked in as nums[0] forever and never re-elected, even after count drops back to 0 and the vote should restart with a fresh candidate.",
    fixCorrect: 'Add `if count == 0: candidate = x` as the first line inside the loop', fixWhy: "Whenever the running count hits 0, the current leader has been fully canceled out and a new candidate needs to take over.",
    fixDistractors: ['Change `count -= 1` to `count = 0`', 'Change `candidate = nums[0]` to `candidate = nums[-1]`', 'Change `x == candidate` to `x != candidate`'] },
  { d: 3, skills: ['heap'], title: 'Merge K Sorted Lists',
    code: L('def mergeKLists(lists):', '    heap = []', '    for node in lists:', '        if node:', '            heapq.heappush(heap, (node.val, node))', '    dummy = tail = ListNode()', '    while heap:', '        val, node = heapq.heappop(heap)', '        tail.next = node', '        tail = tail.next', '        if node.next:', '            heapq.heappush(heap, (node.next.val, node.next))', '    return dummy.next'),
    buggyLine: 5, bugWhy: "When two nodes share the same val, heapq breaks the tie by comparing the second tuple element — the ListNode objects themselves — which have no defined ordering and raise a TypeError.",
    fixCorrect: 'Push a unique tiebreaker too: `(node.val, i, node)` with an incrementing i', fixWhy: 'A tiebreaker that is always comparable (like an incrementing counter) means the heap never has to fall back to comparing the nodes directly.',
    fixDistractors: ['Change `heapq.heappush(heap, (node.val, node))` to `heapq.heappush(heap, node.val)`', 'Change `tail = tail.next` to `tail = node`', 'Change `if node.next:` to `while node.next:`'] },
  { d: 2, skills: ['topo-sort'], title: 'Course Schedule Order',
    code: L('def findOrder(numCourses, prerequisites):', '    graph = [[] for _ in range(numCourses)]', '    indegree = [0] * numCourses', '    for course, prereq in prerequisites:', '        graph[course].append(prereq)', '        indegree[prereq] += 1', '    queue = deque([i for i in range(numCourses) if indegree[i] == 0])', '    order = []', '    while queue:', '        node = queue.popleft()', '        order.append(node)', '        for nxt in graph[node]:', '            indegree[nxt] -= 1', '            if indegree[nxt] == 0:', '                queue.append(nxt)', '    return order if len(order) == numCourses else []'),
    buggyLine: 5, bugWhy: "A prerequisite relationship means prereq has to come before course, so the edge should point from prereq to course — this has the direction, and which node gets the indegree, backwards.",
    fixCorrect: 'Change to `graph[prereq].append(course)` and `indegree[course] += 1`', fixWhy: 'Edges in a dependency graph should point from the thing required to the thing that requires it, so indegree correctly tracks how many prerequisites each course still needs.',
    fixDistractors: ['Change `indegree[prereq] += 1` to `indegree[prereq] -= 1`', 'Change `queue.popleft()` to `queue.pop()`', 'Change `len(order) == numCourses` to `len(order) >= numCourses`'] },
  { d: 3, skills: ['mst'], title: "Prim's Minimum Spanning Tree",
    code: L('def primMST(n, graph):', '    visited = [False] * n', '    visited[0] = True', '    heap = [(w, 0, v) for v, w in graph[0]]', '    heapq.heapify(heap)', '    total = 0', '    while heap:', '        w, u, v = heapq.heappop(heap)', '        total += w', '        visited[v] = True', '        for nv, nw in graph[v]:', '            heapq.heappush(heap, (nw, v, nv))', '    return total'),
    buggyLine: 9, bugWhy: "It never checks whether v is already in the tree before adding its edge weight and expanding it again, so an already-visited node can be counted — and re-explored — more than once, inflating the total above the true MST weight.",
    fixCorrect: 'After popping, add `if visited[v]: continue` before using it', fixWhy: 'Only edges that bring in a genuinely new node should count toward the spanning tree; an edge to a node already inside it is redundant.',
    fixDistractors: ['Change `visited[v] = True` to run before the heap push', 'Change `heap = [(w, 0, v) for v, w in graph[0]]` to include all nodes', 'Change `total += w` to `total = w`'] },
  { d: 1, skills: ['stack'], title: 'Simplify Path',
    code: L('def simplifyPath(path):', '    stack = []', "    for part in path.split('/'):", "        if part == '..':", '            stack.pop()', "        elif part and part != '.':", '            stack.append(part)', "    return '/' + '/'.join(stack)"),
    buggyLine: 5, bugWhy: "It pops without checking the stack has anything in it first. A path like '/../a' hits '..' as its very first real component and crashes with an IndexError.",
    fixCorrect: 'Change to `if stack: stack.pop()`', fixWhy: "Going '..' past the root should just be ignored, not crash — there's nothing left to pop.",
    fixDistractors: ["Change `part != '.'` to `part != ''`", "Change `'/'.join(stack)` to `''.join(stack)`", "Change `path.split('/')` to `path.split('//')`"] },
]

function mount(container, api) {
  let round = null
  let phase = 'pickLine'
  let locked = false
  let block = null
  let feedback = null
  let fixHost = null
  let startTime = 0

  function nextRound(ctx) {
    if (ctx.over()) return
    round = pickByLevel(rounds, ctx.level)
    phase = 'pickLine'
    locked = false
    startTime = performance.now()
    clear(ctx.stage)
    block = codeBlock(round.code, { lineNumbers: true })
    const pickHost = h('div', { class: 'game-pickline' }, block)
    pickHost.addEventListener('click', event => {
      const lineEl = event.target.closest('.code-line')
      if (!lineEl) return
      onLineClick(ctx, Number(lineEl.dataset.line))
    })
    fixHost = h('div', { class: 'stack-sm' })
    feedback = h('div', { class: 'game-feedback' })
    ctx.stage.append(h('div', { class: 'card game-card fade-in' },
      h('div', { class: 'row row-wrap game-tags' },
        h('span', { class: 'pill pill-red' }, `🐛 ${round.title}`),
        h('span', { class: 'chip' }, 'click the buggy line')),
      pickHost,
      fixHost,
      feedback))
  }

  function onLineClick(ctx, lineNo) {
    if (phase !== 'pickLine' || locked || !round) return
    if (lineNo === round.buggyLine) {
      phase = 'pickFix'
      block.setMarks({ [lineNo]: 'good' })
      renderFixChoices(ctx)
      return
    }
    locked = true
    block.setMarks({ [lineNo]: 'bad', [round.buggyLine]: 'good' })
    ctx.resolve(false, {
      skills: round.skills, id: `bug-spotter:line:${round.title}`,
      mistake: { summary: round.title, yours: `Line ${lineNo}`, answer: `Line ${round.buggyLine}`, why: round.bugWhy },
    })
    const alive = ctx.miss()
    feedback.append(
      h('div', { class: 'game-why bad' }, h('strong', null, `Line ${round.buggyLine} is the bug`), h('span', null, round.bugWhy)),
      h('button', { class: 'btn btn-primary game-continue', onclick: () => ctx.proceed() }, alive ? 'Continue ' : 'Results ', h('span', { class: 'kbd' }, 'Enter')))
    ctx.waitFor(() => (alive ? nextRound(ctx) : ctx.end()))
  }

  function renderFixChoices(ctx) {
    clear(fixHost)
    const { choices, answer } = choiceSet(round.fixCorrect, round.fixDistractors, 4)
    const buttons = choices.map((choiceText, i) => h('button', { class: 'btn game-choice', onclick: () => chooseFix(ctx, i, buttons, answer) },
      h('span', { class: 'kbd' }, String(i + 1)),
      h('span', { class: 'game-choice-text' }, choiceText)))
    fixHost.append(
      h('div', { class: 'game-ask' }, "Found it. What's the fix?"),
      h('div', { class: `game-choices${choices.some(c => c.length > 34) ? ' wide' : ''}` }, buttons))
  }

  function chooseFix(ctx, i, buttons, answer) {
    if (phase !== 'pickFix' || locked) return
    locked = true
    const correct = i === answer
    buttons.forEach((button, j) => {
      button.disabled = true
      if (j === answer) button.classList.add('is-correct')
      else if (j === i) button.classList.add('is-wrong')
    })
    const seconds = (performance.now() - startTime) / 1000
    if (correct) {
      ctx.hit(160, Math.max(0, 1 - seconds / 20))
      ctx.resolve(true, { skills: round.skills, id: `bug-spotter:fix:${round.title}` })
      feedback.append(h('div', { class: 'game-why good' }, '✓ ', round.fixWhy))
      ctx.waitFor(() => nextRound(ctx), 1300)
      return
    }
    ctx.resolve(false, {
      skills: round.skills, id: `bug-spotter:fix:${round.title}`,
      mistake: { summary: round.title, yours: buttons[i].querySelector('.game-choice-text').textContent, answer: round.fixCorrect, why: round.fixWhy },
    })
    let alive = ctx.miss()
    const continueButton = h('button', { class: 'btn btn-primary game-continue', onclick: () => ctx.proceed() }, alive ? 'Continue ' : 'Results ', h('span', { class: 'kbd' }, 'Enter'))
    const overrule = overrideButton({
      title: 'My fix also solves it. Count it.',
      onOverride: () => {
        if (!ctx.overrule({ base: 160 })) return
        alive = true
        applyOverrideVisuals(feedback)
        continueButton.firstChild.textContent = 'Continue '
      },
    })
    feedback.append(
      h('div', { class: 'game-why bad' }, h('strong', null, round.fixCorrect), h('span', null, round.fixWhy)),
      h('div', { class: 'row row-wrap' }, continueButton, overrule))
    ctx.waitFor(() => (alive ? nextRound(ctx) : ctx.end()))
  }

  return createArcade(container, api, {
    title: 'Bug Spotter',
    icon: '🐛',
    rules: ['click the buggy line', 'then pick the fix'],
    mode: 'lives',
    lives: 3,
    seed: api.seed,
    onStart: ctx => nextRound(ctx),
    onKey: (event, ctx) => {
      if (!round || locked) return
      if (phase === 'pickFix') {
        const index = '1234'.indexOf(event.key)
        if (index < 0) return
        const buttons = fixHost ? [...fixHost.querySelectorAll('.game-choice')] : []
        if (index < buttons.length) {
          event.preventDefault()
          buttons[index].click()
        }
        return
      }
      const index = Number(event.key) - 1
      if (!Number.isInteger(index) || index < 0) return
      const lineEl = block?.querySelector(`[data-line="${index + 1}"]`)
      if (lineEl) {
        event.preventDefault()
        onLineClick(ctx, index + 1)
      }
    },
  })
}

export default {
  id: 'bug-spotter',
  title: 'Bug Spotter',
  icon: '🐛',
  blurb: 'Click the buggy line, then pick the fix.',
  skills: ['communication', 'ds-diagnosis'],
  difficulty: 'Up to Lv 6',
  modeLabel: '3 lives',
  supportsDaily: true,
  mount,
}
