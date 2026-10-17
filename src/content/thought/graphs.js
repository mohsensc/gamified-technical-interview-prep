const items = [
  {
    id: 'thought:graphs:number-of-islands',
    lc: 200,
    title: 'Number of Islands',
    difficulty: 'Medium',
    category: 'graphs',
    skills: ['graph-dfs', 'grid'],
    companies: ['google', 'amazon', 'microsoft', 'meta', 'bloomberg'],
    statement: `You get a 2-D grid of "1"s (land) and "0"s (water). An island is a maximal blob of land cells connected up/down/left/right - diagonals do not count.

Count how many separate islands sit in the grid. The grid never wraps around the edges, and a single island can be any bendy shape.

Think of each land cell as a node and each 4-directional land-land adjacency as an edge; islands are exactly the connected components of that implicit graph.`,
    examples: [
      { input: 'grid = [["1","1","0","0"],["1","1","0","0"],["0","0","1","0"],["0","0","0","1"]]', output: '3', explanation: 'a 2x2 block, a lone cell at (2,2), and a lone cell at (3,3)' },
    ],
    constraints: ['1 <= rows, cols <= 300', 'grid[r][c] is "0" or "1"'],
    ds: {
      answer: 'visited set of (row,col) + recursive DFS',
      choices: ['visited set of (row,col) + recursive DFS', 'deque queue + set seen (BFS)', 'union-find parent/rank arrays', 'dd(list) adjacency + set visited'],
    },
    method: {
      answer: '==DFS== from each unvisited land cell; mark visited on entry so the whole blob is consumed before the next start',
      choices: [
        '==DFS== from each unvisited land cell; mark visited on entry so the whole blob is consumed before the next start',
        'BFS with a deque from each unvisited land cell, same visited marking',
        'Union-Find: union every adjacent pair of land cells, answer = number of distinct roots',
        "Dynamic programming scanning row by row, counting new land runs that don't connect upward",
      ],
    },
    code: `class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        rows, cols = len(grid), len(grid[0])
        seen = set()

        def dfs(row, col):
            if row < 0 or row >= rows or col < 0 or col >= cols: return
            if (row, col) in seen or grid[row][col] == "0": return
            seen.add((row, col))
            for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:
                dfs(row + dr, col + dc)

        count = 0
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == "1" and (r, c) not in seen:
                    dfs(r, c)
                    count += 1
        return count`,
    blanks: [7, 8, 10],
    time: {
      answer: 'O(rows * cols)',
      choices: ['O(rows * cols)', 'O(rows + cols)', 'O((rows*cols) log(rows*cols))', 'O(rows^2 * cols^2)'],
      why: 'Each of the rows*cols cells is visited and marked exactly once.',
    },
    space: {
      answer: 'O(rows * cols)',
      choices: ['O(rows * cols)', 'O(1)', 'O(rows + cols)', 'O(log(rows*cols))'],
      why: 'Recursion depth and the seen set can both hit every cell on one big island.',
    },
    sayIt: 'I DFS from each unseen land cell, marking cells visited so I never recount an island. O(rows*cols) time and space for the recursion stack.',
    pitfall: 'Forgetting to bound-check row/col before indexing grid[row][col] in the recursive call.',
  },
  {
    id: 'thought:graphs:max-area-of-island',
    lc: 695,
    title: 'Max Area of Island',
    difficulty: 'Medium',
    category: 'graphs',
    skills: ['graph-dfs', 'grid'],
    companies: ['google', 'amazon', 'meta'],
    statement: `Same grid-of-land setup as Number of Islands, but now every island has a size: the count of land cells in its connected blob.

Return the size of the single largest island, or 0 if the grid is all water.

You still only move 4-directionally, and you still want to visit every cell belonging to one island exactly once before moving to the next island.`,
    examples: [
      { input: 'grid = [[1,1,0,0],[1,1,0,0],[0,0,0,1]]', output: '4', explanation: 'the 2x2 block has area 4; the lone cell at (2,3) has area 1' },
    ],
    constraints: ['1 <= rows, cols <= 50', 'grid[r][c] is 0 or 1'],
    ds: {
      answer: 'grid in-place marking (sink to 0) + recursion',
      choices: ['grid in-place marking (sink to 0) + recursion', 'visited set of (row,col) + recursive DFS', 'deque queue + set seen (BFS)', 'dd(list) adjacency + set visited'],
    },
    method: {
      answer: '==DFS== that sinks each visited land cell to 0 and tallies area in a ==nonlocal== counter, taking the max over every island start',
      choices: [
        '==DFS== that sinks each visited land cell to 0 and tallies area in a ==nonlocal== counter, taking the max over every island start',
        'BFS from each land cell, counting queue pops per connected component',
        'Union-Find unioning adjacent land cells, answer = size of the largest component by rank',
        'Prefix sum over rows to count contiguous land runs per row',
      ],
    },
    code: `class Solution:
    def maxAreaOfIsland(self, grid: List[List[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        best = 0

        def dfs(row, col):
            nonlocal area
            if row < 0 or row >= rows or col < 0 or col >= cols: return
            if grid[row][col] == 0: return
            grid[row][col] = 0
            area += 1
            for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:
                dfs(row + dr, col + dc)

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 1:
                    area = 0
                    dfs(r, c)
                    best = max(best, area)
        return best`,
    blanks: [9, 10, 19],
    time: {
      answer: 'O(rows * cols)',
      choices: ['O(rows * cols)', 'O(rows + cols)', 'O((rows*cols) log(rows*cols))', 'O(2^(rows*cols))'],
      why: 'Each cell is sunk and counted at most once across all DFS calls.',
    },
    space: {
      answer: 'O(rows * cols)',
      choices: ['O(rows * cols)', 'O(1)', 'O(rows + cols)', 'O(log(rows*cols))'],
      why: 'Worst case one snake-shaped island makes recursion depth hit every cell.',
    },
    sayIt: 'DFS sinks each land cell to 0 and sums area in a nonlocal counter; I take the max over every unvisited start. O(rows*cols) time and space.',
    pitfall: 'Resetting area to 0 outside the per-island loop instead of right before each new DFS start.',
  },
  {
    id: 'thought:graphs:rotting-oranges',
    lc: 994,
    title: 'Rotting Oranges',
    difficulty: 'Medium',
    category: 'graphs',
    skills: ['graph-bfs', 'grid'],
    companies: ['google', 'amazon', 'microsoft'],
    statement: `A grid has empty cells (0), fresh oranges (1) and rotten oranges (2). Every minute, every rotten orange rots its 4-directional fresh neighbors at the same time.

Return the number of minutes until no fresh orange is left, or -1 if some fresh orange can never be reached.

Because rot spreads from many sources simultaneously and in lockstep minutes, this is a layer-by-layer spread problem, not a single start-to-finish path.`,
    examples: [
      { input: 'grid = [[2,1,1],[1,1,0],[0,1,1]]', output: '4' },
    ],
    constraints: ['1 <= rows, cols <= 10', 'grid[r][c] in {0,1,2}'],
    ds: {
      answer: 'deque queue of (row,col,time) + in-place grid marking',
      choices: ['deque queue of (row,col,time) + in-place grid marking', 'visited set of (row,col) + recursive DFS', 'min-heap of (dist, node) + dist dict', 'dd(list) adjacency + set visited'],
    },
    method: {
      answer: '==Multi-source BFS==: seed the queue with every rotten orange at time 0, spread one minute per layer, track remaining fresh count',
      choices: [
        '==Multi-source BFS==: seed the queue with every rotten orange at time 0, spread one minute per layer, track remaining fresh count',
        'DFS from each rotten orange tracking the maximum depth reached',
        'Dijkstra from a single source rotten orange with edge weight 1',
        'Topological sort of oranges by dependency on neighboring rot',
      ],
    },
    code: `class Solution:
    def orangesRotting(self, grid: List[List[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        queue = deque()
        fresh = 0

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 2: queue.append((r, c, 0))
                elif grid[r][c] == 1: fresh += 1

        minutes = 0
        while queue:
            row, col, time = queue.popleft()
            minutes = max(minutes, time)
            for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:
                nr, nc = row + dr, col + dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                    grid[nr][nc] = 2
                    fresh -= 1
                    queue.append((nr, nc, time + 1))

        return minutes if fresh == 0 else -1`,
    blanks: [18, 19, 20],
    time: {
      answer: 'O(rows * cols)',
      choices: ['O(rows * cols)', 'O(rows + cols)', 'O((rows*cols) log(rows*cols))', 'O(rows^2 * cols^2)'],
      why: 'Each cell is enqueued once; BFS visits all cells layer by layer.',
    },
    space: {
      answer: 'O(rows * cols)',
      choices: ['O(rows * cols)', 'O(1)', 'O(rows + cols)', 'O(log(rows*cols))'],
      why: 'The queue can hold every rotten cell of the widest layer at once.',
    },
    sayIt: 'Multi-source BFS seeded with every rotten orange at once; minutes is the max pop time, and leftover fresh means -1. O(rows*cols) time and space.',
    pitfall: 'Seeding only one rotten orange instead of ALL of them before starting BFS.',
  },
  {
    id: 'thought:graphs:islands-and-treasure',
    lc: 286,
    title: 'Islands and Treasure',
    difficulty: 'Medium',
    category: 'graphs',
    skills: ['graph-bfs', 'grid'],
    companies: ['google', 'meta'],
    statement: `A grid mixes walls (-1), treasure chests (0) and empty rooms (INF, shown as 2147483647). Moves are 4-directional and walls block movement.

Fill every empty room in place with the distance to its nearest treasure chest. Rooms that cannot reach any chest stay INF.

Multiple chests exist, and a room should pick whichever chest is closest - so you want every chest expanding outward at the same time, not one chest fully explored before the next.`,
    examples: [
      { input: 'grid = [[2147483647,0,2147483647],[2147483647,-1,2147483647]]', output: '[[1,0,1],[2,-1,2]]' },
    ],
    constraints: ['1 <= rows, cols <= 25', 'grid[r][c] in {-1, 0, 2147483647}'],
    ds: {
      answer: 'deque queue seeded from all 0-cells + in-place distance fill',
      choices: ['deque queue seeded from all 0-cells + in-place distance fill', 'visited set of (row,col) + recursive DFS', 'min-heap of (dist, node) + dist dict', 'dd(list) adjacency + set visited'],
    },
    method: {
      answer: '==Multi-source BFS== from every gate (0-cell) simultaneously, writing the current distance+1 into each INF neighbor the first time it is reached',
      choices: [
        '==Multi-source BFS== from every gate (0-cell) simultaneously, writing the current distance+1 into each INF neighbor the first time it is reached',
        'Single-source BFS from the one nearest gate, repeated separately for each gate',
        'DFS from each empty room, storing the minimum distance found so far',
        'Dijkstra with a min-heap since cell costs can vary',
      ],
    },
    code: `class Solution:
    def islandsAndTreasure(self, grid: List[List[int]]) -> None:
        rows, cols = len(grid), len(grid[0])
        queue = deque()

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 0: queue.append((r, c))

        while queue:
            row, col = queue.popleft()
            for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:
                nr, nc = row + dr, col + dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 2147483647:
                    grid[nr][nc] = grid[row][col] + 1
                    queue.append((nr, nc))`,
    blanks: [7, 14, 15],
    time: {
      answer: 'O(rows * cols)',
      choices: ['O(rows * cols)', 'O(rows + cols)', 'O((rows*cols) log(rows*cols))', 'O(rows^2 * cols^2)'],
      why: 'Every room is enqueued and relaxed once from the nearest gate.',
    },
    space: {
      answer: 'O(rows * cols)',
      choices: ['O(rows * cols)', 'O(1)', 'O(rows + cols)', 'O(log(rows*cols))'],
      why: 'The queue holds up to every room across the BFS layers.',
    },
    sayIt: 'BFS from every gate at once; the first time INF flips to a number, that distance is final. O(rows*cols) time and space.',
    pitfall: 'Running BFS separately per gate instead of seeding all gates into one queue up front.',
  },
  {
    id: 'thought:graphs:pacific-atlantic-water-flow',
    lc: 417,
    title: 'Pacific Atlantic Water Flow',
    difficulty: 'Medium',
    category: 'graphs',
    skills: ['graph-dfs', 'grid'],
    companies: ['google', 'amazon'],
    statement: `A grid of heights has the Pacific touching its top and left edges, and the Atlantic touching its bottom and right edges. Water flows from a cell to a 4-directional neighbor only if the neighbor's height is less than or equal to the current cell.

Return every cell from which water can reach BOTH oceans.

Checking every cell's path forward to both oceans is slow, so instead flow backward: start DFS from each ocean's border cells and only climb to neighbors that are equal or taller, which is exactly water flowing downhill in reverse.`,
    examples: [
      { input: 'heights = [[1,2],[4,3]]', output: '[[0,1],[1,0],[1,1]]' },
    ],
    constraints: ['1 <= rows, cols <= 200', '0 <= heights[r][c] <= 10^5'],
    ds: {
      answer: 'two visited sets (pacific/atlantic) + DFS from border cells',
      choices: ['two visited sets (pacific/atlantic) + DFS from border cells', 'single BFS from the two oceans merged into one queue', 'min-heap of (height, node) + dist dict', 'union-find linking cells by equal height'],
    },
    method: {
      answer: '==Reverse DFS== from every pacific-border and atlantic-border cell, moving only to neighbors at least as tall; intersect the two visited sets',
      choices: [
        '==Reverse DFS== from every pacific-border and atlantic-border cell, moving only to neighbors at least as tall; intersect the two visited sets',
        'Forward DFS from every cell down to the oceans, checking if the path keeps descending',
        'BFS layer by layer from the two oceans with a shared distance array',
        'DP table where each cell stores whether both oceans are reachable from it',
      ],
    },
    code: `class Solution:
    def pacificAtlantic(self, heights: List[List[int]]) -> List[List[int]]:
        rows, cols = len(heights), len(heights[0])
        pacific, atlantic = set(), set()

        def dfs(row, col, seen, prevHeight):
            if row < 0 or row >= rows or col < 0 or col >= cols: return
            if (row, col) in seen or heights[row][col] < prevHeight: return
            seen.add((row, col))
            for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:
                dfs(row + dr, col + dc, seen, heights[row][col])

        for r in range(rows):
            dfs(r, 0, pacific, heights[r][0])
            dfs(r, cols - 1, atlantic, heights[r][cols - 1])
        for c in range(cols):
            dfs(0, c, pacific, heights[0][c])
            dfs(rows - 1, c, atlantic, heights[rows - 1][c])

        return [[r, c] for r in range(rows) for c in range(cols) if (r, c) in pacific and (r, c) in atlantic]`,
    blanks: [7, 8, 10],
    time: {
      answer: 'O(rows * cols)',
      choices: ['O(rows * cols)', 'O(rows + cols)', 'O((rows*cols) log(rows*cols))', 'O(rows^2 * cols^2)'],
      why: 'Two DFS passes each visit every cell at most once per ocean.',
    },
    space: {
      answer: 'O(rows * cols)',
      choices: ['O(rows * cols)', 'O(1)', 'O(rows + cols)', 'O(log(rows*cols))'],
      why: 'Two visited sets plus the recursion stack can each hold every cell.',
    },
    sayIt: "DFS inward from both oceans' borders, only climbing to equal-or-taller neighbors, then intersect the pacific and atlantic sets. O(rows*cols) time and space.",
    pitfall: 'Flowing downhill from the borders instead of flipping the condition to only climb equal-or-higher.',
  },
  {
    id: 'thought:graphs:clone-graph',
    lc: 133,
    title: 'Clone Graph',
    difficulty: 'Medium',
    category: 'graphs',
    skills: ['graph-dfs', 'graph-modeling'],
    companies: ['google', 'microsoft', 'meta'],
    statement: `You're handed a reference to one node of a connected undirected graph. Every node has a value and a list of neighbor references.

Return a deep copy of the whole graph: new node objects with the same values and the same neighbor structure, with no shared references back to the original.

The graph can have cycles, so whatever you use to build the copy needs to recognize "I already cloned this node" instead of recursing forever.`,
    examples: [
      { input: 'adjList = [[2,4],[1,3],[2,4],[1,3]]', output: '[[2,4],[1,3],[2,4],[1,3]]', explanation: 'node 1 connects to 2 and 4, etc; the clone has the same shape' },
    ],
    constraints: ['0 <= number of nodes <= 100', 'node values are unique'],
    ds: {
      answer: 'hashmap old-node to new-node clone + DFS recursion',
      choices: ['hashmap old-node to new-node clone + DFS recursion', 'deque BFS queue + hashmap old to new clone', 'visited set of ids + BFS level order copy', 'dd(list) adjacency rebuilt from scratch + index mapping'],
    },
    method: {
      answer: '==DFS== that clones the current node ==before== recursing into neighbors, using the hashmap both as memo and cycle guard',
      choices: [
        '==DFS== that clones the current node ==before== recursing into neighbors, using the hashmap both as memo and cycle guard',
        'BFS queue that clones each node only after all its neighbors are cloned',
        'Topological sort the graph first, then clone nodes in sorted order',
        'Union-Find to merge nodes that share any neighbor, then clone merged groups',
      ],
    },
    code: `class Solution:
    def cloneGraph(self, node: Optional['Node']) -> Optional['Node']:
        oldToNew = {}

        def dfs(curr):
            if curr in oldToNew: return oldToNew[curr]
            clone = Node(curr.val)
            oldToNew[curr] = clone
            for neighbor in curr.neighbors:
                clone.neighbors.append(dfs(neighbor))
            return clone

        return dfs(node) if node else None`,
    blanks: [5, 7, 9],
    time: {
      answer: 'O(V + E)',
      choices: ['O(V + E)', 'O(V * E)', 'O(V log V)', 'O(V^2)'],
      why: 'Every node is cloned once and every edge is followed once.',
    },
    space: {
      answer: 'O(V)',
      choices: ['O(V)', 'O(1)', 'O(E)', 'O(V + E)'],
      why: 'The hashmap and recursion stack each hold up to every node.',
    },
    sayIt: 'DFS clones a node and stores it in the hashmap before recursing into its neighbors, so a cycle just hits the memo. O(V+E) time, O(V) space.',
    pitfall: 'Storing the clone in oldToNew AFTER recursing into neighbors, which causes infinite recursion on a cycle.',
  },
  {
    id: 'thought:graphs:surrounded-regions',
    lc: 130,
    title: 'Surrounded Regions',
    difficulty: 'Medium',
    category: 'graphs',
    skills: ['graph-dfs', 'grid'],
    companies: ['google'],
    statement: `A board has 'X' and 'O' cells. Capture every region of 'O's that is fully surrounded by 'X' on all sides, flipping it to 'X'.

An 'O' region touching the border, directly or through a chain of other 'O's, can never be captured - it has an escape route.

So instead of trying to prove a region is surrounded, it's easier to find every region that is NOT surrounded (reachable from the border) and leave only those alone.`,
    examples: [
      { input: 'board = [["X","X","X","X"],["X","O","O","X"],["X","X","O","X"],["X","O","X","X"]]', output: '[["X","X","X","X"],["X","X","X","X"],["X","X","X","X"],["X","O","X","X"]]', explanation: 'the O at the bottom-left touches the border and survives; the rest get captured' },
    ],
    constraints: ['1 <= rows, cols <= 200', "board[r][c] is 'X' or 'O'"],
    ds: {
      answer: 'set of border-safe cells + DFS from the border',
      choices: ['set of border-safe cells + DFS from the border', 'deque BFS queue from every O cell inward', 'union-find linking all O cells touching the border into one group', 'dd(list) adjacency of O-cells + visited set'],
    },
    method: {
      answer: '==DFS from every border cell==, marking reachable O cells safe; flip every unmarked O to X afterward',
      choices: [
        '==DFS from every border cell==, marking reachable O cells safe; flip every unmarked O to X afterward',
        'DFS from every interior O cell outward, flipping to X the moment the border is NOT reached',
        'BFS flood fill from the four corners only, not the whole border',
        'Union-Find grouping all O cells, flipping groups smaller than a size threshold',
      ],
    },
    code: `class Solution:
    def solve(self, board: List[List[str]]) -> None:
        rows, cols = len(board), len(board[0])
        safe = set()

        def dfs(row, col):
            if row < 0 or row >= rows or col < 0 or col >= cols: return
            if (row, col) in safe or board[row][col] == "X": return
            safe.add((row, col))
            for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:
                dfs(row + dr, col + dc)

        for r in range(rows):
            dfs(r, 0)
            dfs(r, cols - 1)
        for c in range(cols):
            dfs(0, c)
            dfs(rows - 1, c)

        for r in range(rows):
            for c in range(cols):
                if board[r][c] == "O" and (r, c) not in safe:
                    board[r][c] = "X"`,
    blanks: [8, 10, 22],
    time: {
      answer: 'O(rows * cols)',
      choices: ['O(rows * cols)', 'O(rows + cols)', 'O((rows*cols) log(rows*cols))', 'O(rows^2 * cols^2)'],
      why: 'Border DFS and the final sweep each touch every cell once.',
    },
    space: {
      answer: 'O(rows * cols)',
      choices: ['O(rows * cols)', 'O(1)', 'O(rows + cols)', 'O(log(rows*cols))'],
      why: 'The safe set and recursion stack can hold every border-connected O.',
    },
    sayIt: "DFS inward from the border to mark safe O's, then flip every O that's NOT marked safe to X. O(rows*cols) time and space.",
    pitfall: "Flipping O's to X during the border DFS itself instead of marking safe first and sweeping after.",
  },
  {
    id: 'thought:graphs:word-ladder',
    lc: 127,
    title: 'Word Ladder',
    difficulty: 'Hard',
    category: 'graphs',
    skills: ['graph-bfs', 'graph-modeling'],
    companies: ['google', 'amazon', 'microsoft', 'meta'],
    statement: `Starting from beginWord, you may change exactly one letter at a time, and every intermediate word must exist in wordList. Reach endWord in as few transformations as possible.

Return the number of words in the shortest such sequence, counting both begin and end words, or 0 if no sequence exists.

Every word is a node, and an edge connects two words that differ by exactly one letter; the fewest transformations is just the shortest path in that implicit graph, so it wants BFS, not DFS.`,
    examples: [
      { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', output: '5', explanation: 'hit -> hot -> dot -> dog -> cog' },
    ],
    constraints: ['1 <= beginWord.length <= 10', '1 <= wordList.length <= 5000'],
    ds: {
      answer: 'dd(list) wildcard-pattern buckets + deque BFS',
      choices: ['dd(list) wildcard-pattern buckets + deque BFS', 'visited set of words + recursive DFS trying every one-letter swap', 'trie of dict children storing the word list', 'min-heap of (steps, word) ordered by edit distance'],
    },
    method: {
      answer: '==BFS== over words, treating each one-letter wildcard pattern (like "h*t") as a bucket of same-pattern words to expand in O(1) per neighbor',
      choices: [
        '==BFS== over words, treating each one-letter wildcard pattern (like "h*t") as a bucket of same-pattern words to expand in O(1) per neighbor',
        'DFS trying all 26 letter substitutions at each position, backtracking on dead ends',
        'Dijkstra with edge weight 1 between every pair of words differing by one letter',
        'Build the full word graph with an adjacency list first, then run BFS on explicit edges',
      ],
    },
    code: `class Solution:
    def ladderLength(self, beginWord: str, endWord: str, wordList: List[str]) -> int:
        if endWord not in wordList: return 0
        length = len(beginWord)
        patterns = dd(list)

        for word in wordList:
            for i in range(length):
                patterns[word[:i] + "*" + word[i+1:]].append(word)

        queue = deque([(beginWord, 1)])
        seen = {beginWord}

        while queue:
            word, steps = queue.popleft()
            if word == endWord: return steps
            for i in range(length):
                for neighbor in patterns[word[:i] + "*" + word[i+1:]]:
                    if neighbor not in seen:
                        seen.add(neighbor)
                        queue.append((neighbor, steps + 1))

        return 0`,
    blanks: [8, 19, 20],
    time: {
      answer: 'O(n * L^2)',
      choices: ['O(n * L^2)', 'O(n * L)', 'O(n^2 * L)', 'O(26 * L * n)'],
      why: 'n=len(wordList), L=word length; building buckets and BFS both scan L per word.',
    },
    space: {
      answer: 'O(n * L)',
      choices: ['O(n * L)', 'O(n)', 'O(L)', 'O(n * L^2)'],
      why: 'The pattern dictionary stores every word under L wildcard keys.',
    },
    sayIt: 'BFS where neighbors come from a pattern dictionary bucketing words by one-letter wildcard masks, avoiding a 26-letter check per position. O(n*L^2) time, O(n*L) space.',
    pitfall: 'Rebuilding the pattern dictionary inside the BFS loop instead of once upfront.',
  },
  {
    id: 'thought:graphs:count-connected-components',
    lc: 323,
    title: 'Number of Connected Components',
    difficulty: 'Medium',
    category: 'graphs',
    skills: ['graph-dfs', 'graph-modeling'],
    companies: ['google', 'amazon', 'meta'],
    statement: `You get n nodes labeled 0 to n-1 and a list of undirected edges between them.

Return how many separate connected components the graph splits into - groups of nodes where every node can reach every other node in the same group, with no path to any other group.

Nodes with no edges at all are still their own single-node component.`,
    examples: [
      { input: 'n = 5, edges = [[0,1],[1,2],[3,4]]', output: '2', explanation: '{0,1,2} form one component, {3,4} form another' },
    ],
    constraints: ['1 <= n <= 2000', '0 <= edges.length <= n*(n-1)/2'],
    ds: {
      answer: 'dd(list) adjacency + set visited DFS',
      choices: ['dd(list) adjacency + set visited DFS', 'union-find parent/rank arrays', 'deque queue + set seen (BFS)', '2-D dp table of pairwise reachability'],
    },
    method: {
      answer: '==DFS== from each unseen node over a dd(list) adjacency list; every fresh DFS start is one new component',
      choices: [
        '==DFS== from each unseen node over a dd(list) adjacency list; every fresh DFS start is one new component',
        'Union-Find: union every edge pair, answer = number of distinct roots (no DFS)',
        'BFS layer by layer from node 0 only, counting unreachable nodes as separate components',
        'Sort edges and count gaps between consecutive node ids',
      ],
    },
    code: `class Solution:
    def countComponents(self, n: int, edges: List[List[int]]) -> int:
        graph = dd(list)
        for a, b in edges:
            graph[a].append(b)
            graph[b].append(a)

        seen = set()

        def dfs(node):
            if node in seen: return
            seen.add(node)
            for neighbor in graph[node]:
                dfs(neighbor)

        count = 0
        for node in range(n):
            if node not in seen:
                dfs(node)
                count += 1

        return count`,
    blanks: [4, 11, 13],
    time: {
      answer: 'O(V + E)',
      choices: ['O(V + E)', 'O(V * E)', 'O(E log V)', 'O(V^2)'],
      why: 'Building the adjacency list and the DFS pass each touch every node and edge once.',
    },
    space: {
      answer: 'O(V + E)',
      choices: ['O(V + E)', 'O(V)', 'O(E)', 'O(1)'],
      why: 'The adjacency list stores every edge twice; the seen set holds every node.',
    },
    sayIt: 'Build a dd(list) adjacency list, DFS from every unseen node, counting one component per fresh start. O(V+E) time and space.',
    pitfall: 'Only adding the edge one direction instead of both, since the graph is undirected.',
  },
  {
    id: 'thought:graphs:graph-valid-tree',
    lc: 261,
    title: 'Graph Valid Tree',
    difficulty: 'Medium',
    category: 'graphs',
    skills: ['graph-dfs', 'graph-modeling'],
    companies: ['google', 'microsoft', 'meta'],
    statement: `You get n nodes labeled 0 to n-1 and a list of undirected edges.

Decide whether these edges form a valid tree: every node connected, and no cycles.

A tree on n nodes always has exactly n-1 edges, which is a fast pre-check, but it isn't sufficient by itself - you still need to confirm the edges don't form a cycle somewhere while leaving another part disconnected.`,
    examples: [
      { input: 'n = 5, edges = [[0,1],[0,2],[0,3],[1,4]]', output: 'true' },
      { input: 'n = 5, edges = [[0,1],[1,2],[2,3],[1,3],[1,4]]', output: 'false', explanation: '1-2-3-1 is a cycle' },
    ],
    constraints: ['1 <= n <= 2000', '0 <= edges.length <= 5000'],
    ds: {
      answer: 'dd(list) adjacency + DFS passing parent to skip the back-edge',
      choices: ['dd(list) adjacency + DFS passing parent to skip the back-edge', 'union-find parent/rank arrays, valid iff one component and no union fails', 'deque BFS + set seen, parent tracked in a dict', 'topological sort checking for a cycle via indegree'],
    },
    method: {
      answer: '==DFS== tracking the parent node so the edge back to where you came from is ignored; any OTHER seen neighbor means a cycle',
      choices: [
        '==DFS== tracking the parent node so the edge back to where you came from is ignored; any OTHER seen neighbor means a cycle',
        'Union-Find: union every edge, a tree iff no union ever finds an already-equal root',
        'BFS marking depth per node, a tree iff no two nodes at the same depth share a neighbor',
        'Count edges and vertices only; call it a tree iff edges == n - 1 and skip the DFS',
      ],
    },
    code: `class Solution:
    def validTree(self, n: int, edges: List[List[int]]) -> bool:
        if len(edges) != n - 1: return False
        graph = dd(list)
        for a, b in edges:
            graph[a].append(b)
            graph[b].append(a)

        seen = set()

        def dfs(node, parent):
            seen.add(node)
            for neighbor in graph[node]:
                if neighbor == parent: continue
                if neighbor in seen: return False
                if not dfs(neighbor, node): return False
            return True

        return dfs(0, -1) and len(seen) == n`,
    blanks: [2, 14, 15],
    time: {
      answer: 'O(V + E)',
      choices: ['O(V + E)', 'O(V * E)', 'O(E log V)', 'O(V^2)'],
      why: "DFS visits every node and edge once to confirm there's no cycle.",
    },
    space: {
      answer: 'O(V + E)',
      choices: ['O(V + E)', 'O(V)', 'O(E)', 'O(1)'],
      why: 'Adjacency list plus the seen set and recursion stack scale with V and E.',
    },
    sayIt: 'n-1 edges is necessary but not sufficient; DFS passing the parent catches any cycle, and I confirm every node got visited. O(V+E) time and space.',
    pitfall: 'Not excluding the parent node, so the edge just traversed looks like a false cycle.',
  },
  {
    id: 'thought:graphs:shortest-path-binary-matrix',
    lc: 1091,
    title: 'Shortest Path in Binary Matrix',
    difficulty: 'Medium',
    category: 'graphs',
    skills: ['graph-bfs', 'grid'],
    companies: ['google', 'amazon'],
    statement: `An n x n grid has 0 (clear) and 1 (blocked) cells. From a cell you may step to any of its 8 neighbors - orthogonal AND diagonal - as long as that neighbor is clear.

Return the length of the shortest clear path from the top-left to the bottom-right cell, counting both endpoints, or -1 if no path exists.

Because every step costs exactly 1 regardless of direction, the shortest path is just a BFS distance, not a weighted shortest-path problem.`,
    examples: [
      { input: 'grid = [[0,1],[1,0]]', output: '2' },
    ],
    constraints: ['1 <= n <= 100', 'grid[r][c] is 0 or 1'],
    ds: {
      answer: 'deque of (row,col,dist) + set seen, 8-directional BFS',
      choices: ['deque of (row,col,dist) + set seen, 8-directional BFS', 'min-heap of (dist, row, col) + dist dict', 'visited set of (row,col) + recursive DFS', 'dd(list) adjacency built from grid + BFS on explicit edges'],
    },
    method: {
      answer: '==BFS== over all 8 directions from (0,0), returning the distance the first time (n-1,n-1) is popped',
      choices: [
        '==BFS== over all 8 directions from (0,0), returning the distance the first time (n-1,n-1) is popped',
        'DFS trying all 8 directions, keeping the minimum path length found across all branches',
        'Dijkstra with a min-heap since diagonal moves could cost more than orthogonal ones',
        'Dynamic programming where each cell stores the shortest path from the top-left cell',
      ],
    },
    code: `class Solution:
    def shortestPathBinaryMatrix(self, grid: List[List[int]]) -> int:
        n = len(grid)
        if grid[0][0] == 1: return -1
        directions = [(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]
        queue = deque([(0, 0, 1)])
        seen = {(0, 0)}

        while queue:
            row, col, dist = queue.popleft()
            if row == n - 1 and col == n - 1: return dist
            for dr, dc in directions:
                nr, nc = row + dr, col + dc
                if 0 <= nr < n and 0 <= nc < n and (nr, nc) not in seen and grid[nr][nc] == 0:
                    seen.add((nr, nc))
                    queue.append((nr, nc, dist + 1))

        return -1`,
    blanks: [10, 14, 15],
    time: {
      answer: 'O(n^2)',
      choices: ['O(n^2)', 'O(n)', 'O(n^2 log n)', 'O(n^3)'],
      why: 'Each of the n*n cells is enqueued and expanded at most once.',
    },
    space: {
      answer: 'O(n^2)',
      choices: ['O(n^2)', 'O(1)', 'O(n)', 'O(n log n)'],
      why: 'The seen set and queue can each hold every cell in the worst case.',
    },
    sayIt: "BFS checking all 8 neighbor directions, seeded at (0,0); the first time I pop the bottom-right cell that's the shortest path. O(n^2) time and space.",
    pitfall: 'Only checking 4 directions instead of all 8, missing the diagonal moves.',
  },
  {
    id: 'thought:graphs:keys-and-rooms',
    lc: 841,
    title: 'Keys and Rooms',
    difficulty: 'Medium',
    category: 'graphs',
    skills: ['graph-dfs', 'graph-modeling'],
    companies: ['google'],
    statement: `There are n rooms numbered 0 to n-1. You start inside room 0, which is unlocked. Each room holds a list of keys, and each key is the index of another room you may now also enter.

Return true if you can eventually visit every room, false otherwise.

Room i's keys are exactly its outgoing edges to other rooms, so this is a reachability question on an implicit directed graph starting from node 0.`,
    examples: [
      { input: 'rooms = [[1],[2],[3],[]]', output: 'true' },
      { input: 'rooms = [[1,3],[3,0,1],[2],[0]]', output: 'false', explanation: 'room 2 is never reachable' },
    ],
    constraints: ['n == rooms.length', '1 <= n <= 1000'],
    ds: {
      answer: 'set seen + DFS over rooms[i] key lists',
      choices: ['set seen + DFS over rooms[i] key lists', 'deque BFS queue + set seen', 'union-find parent/rank arrays over rooms', 'dd(list) adjacency rebuilt from rooms + topo sort'],
    },
    method: {
      answer: '==DFS== from room 0, visiting every key found inside; all rooms are reachable iff seen ends up covering all of them',
      choices: [
        '==DFS== from room 0, visiting every key found inside; all rooms are reachable iff seen ends up covering all of them',
        'BFS from room 0, counting rooms visited within n-1 steps',
        'Union-Find unioning each room with the rooms its keys open, check one component',
        'Topological sort rooms by key dependency, valid iff no cycle',
      ],
    },
    code: `class Solution:
    def canVisitAllRooms(self, rooms: List[List[int]]) -> bool:
        seen = set()

        def dfs(room):
            seen.add(room)
            for key in rooms[room]:
                if key not in seen:
                    dfs(key)

        dfs(0)
        return len(seen) == len(rooms)`,
    blanks: [5, 8, 11],
    time: {
      answer: 'O(V + E)',
      choices: ['O(V + E)', 'O(V * E)', 'O(V^2)', 'O(E log V)'],
      why: 'DFS visits each room once and follows each key edge once.',
    },
    space: {
      answer: 'O(V)',
      choices: ['O(V)', 'O(1)', 'O(E)', 'O(V + E)'],
      why: 'The seen set and recursion stack scale with the number of rooms.',
    },
    sayIt: "DFS from room 0 following every key found inside; if seen ends up covering every room they're all reachable. O(V+E) time, O(V) space.",
    pitfall: 'Not guarding against revisiting a room whose keys loop back, causing infinite recursion without the seen check.',
  },
  {
    id: 'thought:graphs:find-if-path-exists-in-graph',
    lc: 1971,
    title: 'Find if Path Exists in Graph',
    difficulty: 'Easy',
    category: 'graphs',
    skills: ['graph-dfs', 'graph-modeling'],
    companies: ['amazon', 'microsoft'],
    statement: `You get n nodes labeled 0 to n-1, a list of undirected edges, plus a source and a destination node.

Return true if there's any path (through any number of edges) from source to destination, false otherwise.

This is a plain reachability check, no shortest distance needed - you can stop the instant destination is found anywhere in the search.`,
    examples: [
      { input: 'n = 3, edges = [[0,1],[1,2],[2,0]], source = 0, destination = 2', output: 'true' },
    ],
    constraints: ['1 <= n <= 2 * 10^5', '0 <= edges.length <= 2 * 10^5'],
    ds: {
      answer: 'dd(list) adjacency + set seen DFS',
      choices: ['dd(list) adjacency + set seen DFS', 'union-find parent/rank arrays, path exists iff same root', 'deque BFS + set seen', 'min-heap of (dist, node) + dist dict'],
    },
    method: {
      answer: '==DFS== from source, short-circuiting True the moment destination is reached or found through a neighbor',
      choices: [
        '==DFS== from source, short-circuiting True the moment destination is reached or found through a neighbor',
        'BFS from source, returning True only after the whole graph is exhausted',
        'Union-Find: union every edge, path exists iff source and destination share a root',
        'Binary search over a sorted edge list for a direct source-destination pair',
      ],
    },
    code: `class Solution:
    def validPath(self, n: int, edges: List[List[int]], source: int, destination: int) -> bool:
        graph = dd(list)
        for a, b in edges:
            graph[a].append(b)
            graph[b].append(a)

        seen = set()

        def dfs(node):
            if node == destination: return True
            seen.add(node)
            for neighbor in graph[node]:
                if neighbor not in seen and dfs(neighbor):
                    return True
            return False

        return dfs(source)`,
    blanks: [10, 11, 13],
    time: {
      answer: 'O(V + E)',
      choices: ['O(V + E)', 'O(V * E)', 'O(E log V)', 'O(V^2)'],
      why: 'DFS visits each node once and follows each edge at most once.',
    },
    space: {
      answer: 'O(V + E)',
      choices: ['O(V + E)', 'O(V)', 'O(E)', 'O(1)'],
      why: 'Adjacency list plus the seen set and recursion stack scale with V, E.',
    },
    sayIt: 'DFS from source, short-circuiting true as soon as destination shows up. O(V+E) time and space; Union-Find also fits this shape.',
    pitfall: 'Forgetting edges are undirected, so each pair must be added to both adjacency lists.',
  },
  {
    id: 'thought:graphs:number-of-provinces',
    lc: 547,
    title: 'Number of Provinces',
    difficulty: 'Medium',
    category: 'graphs',
    skills: ['graph-dfs', 'graph-modeling'],
    companies: ['google', 'amazon', 'meta'],
    statement: `n cities are described by an n x n adjacency MATRIX isConnected, where isConnected[i][j] = 1 means city i and city j are directly connected.

A province is a group of cities connected directly or indirectly, with no connection to any city outside the group. Return the number of provinces.

The input is already a dense matrix instead of an edge list, so each DFS step scans a whole row of n entries rather than following a short adjacency list.`,
    examples: [
      { input: 'isConnected = [[1,1,0],[1,1,0],[0,0,1]]', output: '2' },
    ],
    constraints: ['1 <= n <= 200', 'isConnected[i][i] == 1'],
    ds: {
      answer: 'set seen + DFS scanning each row of the adjacency matrix',
      choices: ['set seen + DFS scanning each row of the adjacency matrix', 'union-find parent/rank arrays over cities', 'dd(list) adjacency list built from the matrix + BFS', 'min-heap of (weight, city) for a minimum spanning tree'],
    },
    method: {
      answer: '==DFS== over the adjacency MATRIX (scan row i for 1s) from each unseen city; one fresh start per province',
      choices: [
        '==DFS== over the adjacency MATRIX (scan row i for 1s) from each unseen city; one fresh start per province',
        'Union-Find: union cities i,j wherever isConnected[i][j]==1, count distinct roots',
        'BFS over the matrix rows, counting layers until no new 1 is found',
        'Count the number of 1s in the upper triangle of the matrix directly',
      ],
    },
    code: `class Solution:
    def findCircleNum(self, isConnected: List[List[int]]) -> int:
        n = len(isConnected)
        seen = set()

        def dfs(city):
            seen.add(city)
            for neighbor in range(n):
                if isConnected[city][neighbor] == 1 and neighbor not in seen:
                    dfs(neighbor)

        provinces = 0
        for city in range(n):
            if city not in seen:
                dfs(city)
                provinces += 1

        return provinces`,
    blanks: [6, 8, 9],
    time: {
      answer: 'O(n^2)',
      choices: ['O(n^2)', 'O(n)', 'O(n log n)', 'O(n^3)'],
      why: 'DFS scans a full matrix row of length n for every one of the n cities.',
    },
    space: {
      answer: 'O(n)',
      choices: ['O(n)', 'O(1)', 'O(n^2)', 'O(log n)'],
      why: 'The seen set and recursion stack scale with the number of cities, not n^2.',
    },
    sayIt: "DFS scans each city's matrix row for connections; one fresh start equals one province. O(n^2) time, O(n) space; Union-Find also fits this shape.",
    pitfall: 'Treating isConnected like an edge list instead of scanning the full row per city.',
  },
  {
    id: 'thought:graphs:island-perimeter',
    lc: 463,
    title: 'Island Perimeter',
    difficulty: 'Easy',
    category: 'graphs',
    skills: ['grid'],
    companies: ['google', 'amazon', 'meta'],
    statement: `A grid has exactly one island of land cells (1s) connected 4-directionally, with water (0s) everywhere else and no lakes inside the island.

Return the perimeter of that island - the total length of its boundary edges.

There's no traversal order to figure out here: every land cell contributes one unit of perimeter for each side that touches water or the edge of the grid, so a single pass with no visited set does the whole job.`,
    examples: [
      { input: 'grid = [[0,1,0,0],[1,1,1,0],[0,1,0,0],[1,1,0,0]]', output: '16' },
    ],
    constraints: ['1 <= rows, cols <= 100', 'there is exactly one island'],
    ds: {
      answer: 'plain grid scan + 4-direction edge counting (no visited set needed)',
      choices: ['plain grid scan + 4-direction edge counting (no visited set needed)', 'visited set of (row,col) + recursive DFS summing exposed edges', 'deque BFS queue + set seen around the island border', 'union-find grouping land cells, perimeter = cells*4 - 2*unions'],
    },
    method: {
      answer: 'For every land cell, count a perimeter edge for each of its 4 neighbors that is water OR off the grid',
      choices: [
        'For every land cell, count a perimeter edge for each of its 4 neighbors that is water OR off the grid',
        '==DFS== flood fill the island, subtracting 2 for every pair of adjacent land cells found',
        'BFS from one land cell outward, counting the frontier size at the final layer',
        'Count land cells times 4, then subtract edges found by a separate adjacency scan',
      ],
    },
    code: `class Solution:
    def islandPerimeter(self, grid: List[List[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        perimeter = 0

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 1:
                    for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:
                        nr, nc = r + dr, c + dc
                        if nr < 0 or nr >= rows or nc < 0 or nc >= cols or grid[nr][nc] == 0:
                            perimeter += 1

        return perimeter`,
    blanks: [7, 10, 11],
    time: {
      answer: 'O(rows * cols)',
      choices: ['O(rows * cols)', 'O(rows + cols)', 'O((rows*cols) log(rows*cols))', 'O(1)'],
      why: 'Every cell is checked once with a constant 4-neighbor look.',
    },
    space: {
      answer: 'O(1)',
      choices: ['O(1)', 'O(rows * cols)', 'O(rows + cols)', 'O(log(rows*cols))'],
      why: 'No visited set or recursion is needed, just a running counter.',
    },
    sayIt: "For every land cell, each neighbor that's water or off-grid adds one to the perimeter. O(rows*cols) time, O(1) space, no DFS needed.",
    pitfall: 'Reaching for DFS and a visited set out of habit when this problem needs no traversal at all.',
  },
  {
    id: 'thought:graphs:flood-fill',
    lc: 733,
    title: 'Flood Fill',
    difficulty: 'Easy',
    category: 'graphs',
    skills: ['graph-dfs', 'grid'],
    companies: ['amazon', 'microsoft'],
    statement: `An image is a grid of colors. Starting at pixel (sr, sc), repaint it and every 4-directionally connected pixel that shares its ORIGINAL color with the new color.

Return the resulting image.

The classic trap: if the new color happens to equal the start color, naive recursion never terminates because every repainted pixel still "matches" and keeps re-queuing itself.`,
    examples: [
      { input: 'image = [[1,1,1],[1,1,0],[1,0,1]], sr = 1, sc = 1, color = 2', output: '[[2,2,2],[2,2,0],[2,0,1]]' },
    ],
    constraints: ['1 <= rows, cols <= 50', '0 <= color, startColor < 2^16'],
    ds: {
      answer: 'plain grid in-place recoloring + recursive DFS (no visited set needed)',
      choices: ['plain grid in-place recoloring + recursive DFS (no visited set needed)', 'visited set of (row,col) + DFS, kept separate from the color grid', 'deque BFS queue + set seen', 'union-find grouping same-color pixels'],
    },
    method: {
      answer: '==DFS== repainting each matching-color neighbor; guard against start color == new color first or recursion never terminates',
      choices: [
        '==DFS== repainting each matching-color neighbor; guard against start color == new color first or recursion never terminates',
        'BFS repainting layer by layer from the start pixel',
        'DFS repainting without an early guard, relying on the color-match check alone to stop',
        'Union-Find grouping same-colored pixels, then repaint the whole group at once',
      ],
    },
    code: `class Solution:
    def floodFill(self, image: List[List[int]], sr: int, sc: int, color: int) -> List[List[int]]:
        rows, cols = len(image), len(image[0])
        startColor = image[sr][sc]
        if startColor == color: return image

        def dfs(row, col):
            if row < 0 or row >= rows or col < 0 or col >= cols: return
            if image[row][col] != startColor: return
            image[row][col] = color
            for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:
                dfs(row + dr, col + dc)

        dfs(sr, sc)
        return image`,
    blanks: [4, 8, 9],
    time: {
      answer: 'O(rows * cols)',
      choices: ['O(rows * cols)', 'O(rows + cols)', 'O((rows*cols) log(rows*cols))', 'O(2^(rows*cols))'],
      why: 'Each matching pixel is visited and repainted at most once.',
    },
    space: {
      answer: 'O(rows * cols)',
      choices: ['O(rows * cols)', 'O(1)', 'O(rows + cols)', 'O(log(rows*cols))'],
      why: 'The recursion stack can hold every connected matching pixel.',
    },
    sayIt: 'Guard startColor == color first, then DFS repainting every connected pixel that still matches startColor. O(rows*cols) time and space.',
    pitfall: 'Skipping the startColor == color guard, which causes infinite recursion since the repainted color still matches itself.',
  },
  {
    id: 'thought:graphs:count-sub-islands',
    lc: 1905,
    title: 'Count Sub Islands',
    difficulty: 'Medium',
    category: 'graphs',
    skills: ['graph-dfs', 'grid'],
    companies: ['google', 'amazon'],
    statement: `You get two same-sized grids of land (1) and water (0). An island in grid2 is a SUB-island if every one of its land cells is also land in grid1 at the same position.

Return how many of grid2's islands are sub-islands.

A single mismatched cell anywhere in a grid2 island disqualifies the WHOLE island, not just that cell - so the DFS needs to check every cell and every branch before deciding, not bail out on the first mismatch.`,
    examples: [
      { input: 'grid1 = [[1,1,1,0],[0,1,1,1],[0,0,0,0],[1,0,0,0]], grid2 = [[1,1,1,0],[0,0,1,1],[0,1,0,0],[1,0,1,1]]', output: '2' },
    ],
    constraints: ['1 <= rows, cols <= 500', 'grid1 and grid2 are the same size'],
    ds: {
      answer: 'set seen + DFS over grid2 returning whether the WHOLE island is backed by grid1',
      choices: ['set seen + DFS over grid2 returning whether the WHOLE island is backed by grid1', 'two visited sets, one per grid, intersected at the end', 'deque BFS over grid2 tallying grid1 mismatches in a counter', 'dd(list) adjacency built from grid2 + union-find over matching cells'],
    },
    method: {
      answer: '==DFS== over each grid2 island that returns True only if every cell AND all its branches are also land in grid1',
      choices: [
        '==DFS== over each grid2 island that returns True only if every cell AND all its branches are also land in grid1',
        'DFS that returns False immediately on the first mismatch, skipping the rest of that island',
        'BFS tallying a mismatch counter per island, sub-island iff the counter stays 0',
        'Compare grid1 and grid2 cell by cell first, then count islands only in the matching region',
      ],
    },
    code: `class Solution:
    def countSubIslands(self, grid1: List[List[int]], grid2: List[List[int]]) -> int:
        rows, cols = len(grid2), len(grid2[0])
        seen = set()

        def dfs(row, col):
            if row < 0 or row >= rows or col < 0 or col >= cols: return True
            if (row, col) in seen or grid2[row][col] == 0: return True
            seen.add((row, col))
            isSub = grid1[row][col] == 1
            for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:
                isSub = dfs(row + dr, col + dc) and isSub
            return isSub

        count = 0
        for r in range(rows):
            for c in range(cols):
                if grid2[r][c] == 1 and (r, c) not in seen and dfs(r, c):
                    count += 1

        return count`,
    blanks: [9, 11, 17],
    time: {
      answer: 'O(rows * cols)',
      choices: ['O(rows * cols)', 'O(rows + cols)', 'O((rows*cols) log(rows*cols))', 'O(rows^2 * cols^2)'],
      why: 'DFS visits every grid2 land cell once across all islands.',
    },
    space: {
      answer: 'O(rows * cols)',
      choices: ['O(rows * cols)', 'O(1)', 'O(rows + cols)', 'O(log(rows*cols))'],
      why: 'The seen set and recursion stack can hold every cell of one big island.',
    },
    sayIt: 'DFS each grid2 island, AND-ing whether grid1 also has land there across every cell and branch, before counting it. O(rows*cols) time and space.',
    pitfall: 'Returning early on mismatch skips marking the rest of the island, causing a double count.',
  },
  {
    id: 'thought:graphs:01-matrix',
    lc: 542,
    title: '01 Matrix',
    difficulty: 'Medium',
    category: 'graphs',
    skills: ['graph-bfs', 'grid'],
    companies: ['google', 'amazon'],
    statement: `You're given an m x n binary matrix of 0s and 1s. For every cell, return the distance to the nearest 0, where distance is measured in up/down/left/right steps.

Every cell holding a 0 has distance 0 to itself. The matrix always contains at least one 0.

Return a same-shaped matrix of these distances.`,
    examples: [
      { input: 'mat = [[0,0,0],[0,1,0],[1,1,1]]', output: '[[0,0,0],[0,1,0],[1,2,1]]', explanation: 'the center 1 is one step from a 0; the bottom-right 1 is two steps away' },
    ],
    constraints: ['1 <= rows, cols <= 10^4', 'rows * cols <= 10^4', 'mat[i][j] is 0 or 1', 'at least one 0 exists'],
    ds: {
      answer: 'BFS queue seeded with every 0-cell + dist grid (multi-source BFS)',
      choices: ['BFS queue seeded with every 0-cell + dist grid (multi-source BFS)', '2-D dp table swept forward then backward', 'DFS from every 1-cell outward to the nearest 0', 'min-heap of (dist, row, col) (Dijkstra)'],
    },
    method: {
      answer: 'Multi-source BFS: ==seed the queue with every 0-cell at distance 0==, then BFS outward so each 1-cell gets its distance from the first 0 that reaches it',
      choices: [
        'Multi-source BFS: ==seed the queue with every 0-cell at distance 0==, then BFS outward so each 1-cell gets its distance from the first 0 that reaches it',
        'Single-source BFS from one arbitrary 0-cell, repeated once per 1-cell',
        'Two-pass DP: sweep top-left to bottom-right taking min of up/left, then bottom-right to top-left taking min of down/right',
        'DFS from each 1-cell, tracking the minimum depth to any 0 seen so far',
      ],
    },
    code: `class Solution:
    def updateMatrix(self, mat: List[List[int]]) -> List[List[int]]:
        rows, cols = len(mat), len(mat[0])
        dist = [[-1] * cols for _ in range(rows)]
        queue = deque()

        for r in range(rows):
            for c in range(cols):
                if mat[r][c] == 0:
                    dist[r][c] = 0
                    queue.append((r, c))

        while queue:
            r, c = queue.popleft()
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and dist[nr][nc] == -1:
                    dist[nr][nc] = dist[r][c] + 1
                    queue.append((nr, nc))

        return dist`,
    blanks: [9, 10, 17],
    time: { answer: 'O(rows * cols)', choices: ['O(rows * cols)', 'O(rows * cols * log(rows * cols))', 'O((rows * cols)^2)', 'O(rows + cols)'], why: 'each cell is enqueued and dequeued at most once' },
    space: { answer: 'O(rows * cols)', choices: ['O(rows * cols)', 'O(1)', 'O(rows + cols)', 'O(log(rows * cols))'], why: 'dist grid plus a queue that can hold every cell' },
    sayIt: 'I seed a BFS queue with every 0-cell at distance 0, then expand outward so each 1-cell picks up the distance from the nearest 0, O(rows*cols) time.',
    pitfall: 'Must seed ALL zero cells into the queue up front, not just one, or distances overcount.',
  },
  {
    id: 'thought:graphs:as-far-from-land-as-possible',
    lc: 1162,
    title: 'As Far from Land as Possible',
    difficulty: 'Medium',
    category: 'graphs',
    skills: ['graph-bfs', 'grid'],
    companies: ['google', 'amazon'],
    statement: `You're given an n x n grid of 0s (water) and 1s (land). Find a water cell whose distance to the nearest land cell is as large as possible, and return that distance.

Distance is measured in up/down/left/right steps between cells. If the grid is all land or all water, return -1 since the question doesn't apply.`,
    examples: [
      { input: 'grid = [[1,0,1],[0,0,0],[1,0,1]]', output: '2', explanation: 'the center cell is 2 steps from the nearest land corner' },
    ],
    constraints: ['1 <= n <= 100', 'grid[i][j] is 0 or 1'],
    ds: {
      answer: 'BFS queue seeded with every land cell, processed level by level',
      choices: ['BFS queue seeded with every land cell, processed level by level', 'min-heap of (dist, row, col) (Dijkstra)', '2-D dp table of distances swept twice', 'DFS from each water cell outward to the nearest land'],
    },
    method: {
      answer: "Multi-source level-order BFS: ==seed every land cell at distance 0==, expand one full ring (level) at a time, and the last level fully processed before the queue empties is the answer",
      choices: [
        "Multi-source level-order BFS: ==seed every land cell at distance 0==, expand one full ring (level) at a time, and the last level fully processed before the queue empties is the answer",
        'Single BFS from one land cell, then take the max distance recorded',
        'Sort all cells by Manhattan distance to the nearest land cell, computed pairwise',
        'DFS flood fill marking depth from each land cell independently and taking the max over all runs',
      ],
    },
    code: `class Solution:
    def maxDistance(self, grid: List[List[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        queue = deque()

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 1:
                    queue.append((r, c))

        if not queue or len(queue) == rows * cols:
            return -1

        dist = -1
        while queue:
            for _ in range(len(queue)):
                r, c = queue.popleft()
                for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nr, nc = r + dr, c + dc
                    if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0:
                        grid[nr][nc] = 1
                        queue.append((nr, nc))
            dist += 1

        return dist`,
    blanks: [8, 20, 22],
    time: { answer: 'O(n^2)', choices: ['O(n^2)', 'O(n^2 log n)', 'O(n^3)', 'O(n)'], why: 'each of the n*n cells is enqueued and dequeued once' },
    space: { answer: 'O(n^2)', choices: ['O(n^2)', 'O(1)', 'O(n)', 'O(n^2 log n)'], why: 'queue and grid both scale with the number of cells' },
    sayIt: 'I BFS outward from all land cells at once, level by level, so the last ring reached is the maximum distance; O(n^2) time.',
    pitfall: 'Must return -1 up front when the grid is all land or all water.',
  },
  {
    id: 'thought:graphs:number-of-enclaves',
    lc: 1020,
    title: 'Number of Enclaves',
    difficulty: 'Medium',
    category: 'graphs',
    skills: ['graph-dfs', 'grid'],
    companies: ['amazon', 'meta'],
    statement: `You're given a binary matrix where 1 means land and 0 means water, connected up/down/left/right. A move walks from one land cell to an adjacent land cell, or off the boundary of the grid.

An enclave is a land cell from which you can never walk off the boundary of the grid, no matter how many moves you make.

Return the number of land cells in all enclaves.`,
    examples: [
      { input: 'grid = [[0,0,0,0],[1,0,1,0],[0,1,1,0],[0,0,0,0]]', output: '3', explanation: 'the three connected 1s in the middle never reach the border' },
    ],
    constraints: ['1 <= rows, cols <= 500', 'grid[i][j] is 0 or 1'],
    ds: {
      answer: 'DFS flood-fill that sinks land connected to the border, in-place on the grid',
      choices: ['DFS flood-fill that sinks land connected to the border, in-place on the grid', 'Union-Find over land cells merging neighbors and a virtual border node', 'BFS queue seeded with border land cells', '2-D dp table marking reachability from the border'],
    },
    method: {
      answer: "DFS flood the border first: ==walk every border cell and recursively sink (zero out) any connected land==, then whatever land remains after sinking is fully enclosed, so count it",
      choices: [
        "DFS flood the border first: ==walk every border cell and recursively sink (zero out) any connected land==, then whatever land remains after sinking is fully enclosed, so count it",
        'BFS from the border inward, counting cells visited as escaped and subtracting from total land',
        'DFS from every individual land cell checking if any path reaches the border, memoizing per cell',
        'Union-Find merging every land cell with its neighbors, then flagging any component that touches a border index',
      ],
    },
    code: `class Solution:
    def numEnclaves(self, grid: List[List[int]]) -> int:
        rows, cols = len(grid), len(grid[0])

        def sink(r, c):
            if not (0 <= r < rows and 0 <= c < cols) or grid[r][c] == 0:
                return

            grid[r][c] = 0
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                sink(r + dr, c + dc)

        for r in range(rows):
            sink(r, 0)
            sink(r, cols - 1)
        for c in range(cols):
            sink(0, c)
            sink(rows - 1, c)

        return sum(row.count(1) for row in grid)`,
    blanks: [8, 10, 19],
    time: { answer: 'O(rows * cols)', choices: ['O(rows * cols)', 'O(rows * cols * log(rows * cols))', 'O((rows + cols)^2)', 'O(rows + cols)'], why: 'DFS visits each land cell once total across all sink calls' },
    space: { answer: 'O(rows * cols)', choices: ['O(rows * cols)', 'O(1)', 'O(rows + cols)', 'O(log(rows * cols))'], why: 'recursion depth can reach every connected land cell' },
    sayIt: 'I DFS-sink every land cell reachable from the border down to 0, then whatever land is left over never reached the border, O(rows*cols) time.',
    pitfall: 'Sinking has to run from ALL four border edges, not just the first row or column.',
  },
  {
    id: 'thought:graphs:open-the-lock',
    lc: 752,
    title: 'Open the Lock',
    difficulty: 'Medium',
    category: 'graphs',
    skills: ['graph-bfs', 'graph-modeling'],
    companies: ['google', 'amazon'],
    statement: `A lock has 4 circular wheels, each showing a digit 0-9, starting at "0000". Each move turns one wheel by one position, wrapping from 9 to 0 or from 0 to 9.

You're given a list of deadend combinations; if the lock ever displays one of them, it locks forever and that combination can never be reached or passed through.

Find the minimum number of moves to reach the target combination, or report it's impossible.`,
    examples: [
      { input: 'deadends = ["0201","0101","0102","1212","2002"], target = "0202"', output: '6', explanation: 'a path of 6 single-wheel turns reaches 0202 while avoiding every deadend' },
      { input: 'deadends = ["8888"], target = "0009"', output: '1', explanation: 'turn the last wheel from 0 to 9 (wrapping down) in a single move' },
    ],
    constraints: ['1 <= deadends.length <= 500', 'deadends[i].length == 4', 'target.length == 4', 'target is not in the list deadends', 'deadends and target consist of digits only'],
    ds: {
      answer: 'BFS queue of (combo string, steps) + a visited set of seen combos',
      choices: ['BFS queue of (combo string, steps) + a visited set of seen combos', 'DFS with memo keyed by combo, returning the minimum of all neighbor results', 'Dijkstra with a min-heap of (steps, combo)', 'Union-Find over all 10000 possible combos'],
    },
    method: {
      answer: "BFS over the state graph of all 4-digit combos: ==each combo has 8 neighbors, one digit wheel moved +1 or -1 (mod 10)==, explore layer by layer so the first time target is dequeued gives the fewest turns, skipping deadends and already-visited combos",
      choices: [
        'DFS exploring every reachable combo recursively, tracking the minimum depth seen so far',
        "BFS over the state graph of all 4-digit combos: ==each combo has 8 neighbors, one digit wheel moved +1 or -1 (mod 10)==, explore layer by layer so the first time target is dequeued gives the fewest turns, skipping deadends and already-visited combos",
        'Treat it as shortest path with Dijkstra, since every move costs exactly 1',
        'Precompute the full 10000-node graph once, then run BFS from target back to "0000" instead',
      ],
    },
    code: `class Solution:
    def openLock(self, deadends: List[str], target: str) -> int:
        dead = set(deadends)
        if "0000" in dead:
            return -1

        queue = deque([("0000", 0)])
        visited = {"0000"}

        while queue:
            combo, steps = queue.popleft()
            if combo == target:
                return steps

            for i in range(4):
                digit = int(combo[i])
                for delta in (-1, 1):
                    nextDigit = (digit + delta) % 10
                    nextCombo = combo[:i] + str(nextDigit) + combo[i + 1:]
                    if nextCombo not in dead and nextCombo not in visited:
                        visited.add(nextCombo)
                        queue.append((nextCombo, steps + 1))

        return -1`,
    blanks: [12, 17, 21],
    time: { answer: 'O(10^4)', choices: ['O(10^4)', 'O(10^8)', 'O(log(10^4))', 'O(2^(10^4))'], why: 'at most 10,000 reachable combos, each with a constant 8 neighbors explored once' },
    space: { answer: 'O(10^4)', choices: ['O(10^4)', 'O(1)', 'O(10^8)', 'O(4)'], why: 'the visited set and queue can together hold up to all 10,000 combos' },
    sayIt: "BFS from 0000 treating each combo as a node with ==8 neighbors from turning one wheel +/-1 mod 10==, skip deadends and revisits, first time target pops off the queue is the answer, O(10^4) time.",
    pitfall: 'Check whether "0000" itself is a deadend before starting BFS from it.',
  },
  {
    id: 'thought:graphs:snakes-and-ladders',
    lc: 909,
    title: 'Snakes and Ladders',
    difficulty: 'Medium',
    category: 'graphs',
    skills: ['graph-bfs', 'grid'],
    companies: ['amazon', 'google'],
    statement: `You're given an n x n board where squares are numbered 1 to n*n in a boustrophedon pattern (left to right on one row, then right to left on the next, alternating), starting at the bottom-left square.

From square curr, a move can reach any of squares curr+1 through curr+6 (like rolling a die). If that destination square has a snake or ladder, you immediately move to the other end of it instead; you can only use one snake or ladder per move, and landing back on a square with another snake/ladder does not chain further.

Find the minimum number of moves to go from square 1 to square n*n, or report it's impossible.`,
    examples: [
      { input: 'board = [[-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1],[-1,35,-1,-1,13,-1],[-1,-1,-1,-1,-1,-1],[-1,15,-1,-1,-1,-1]]', output: '4', explanation: 'rolling to square 2 (laddering straight to 15), then 17, 32, and finally 36 reaches the end in 4 moves' },
    ],
    constraints: ['2 <= n <= 20', 'board[i][j] is either -1 (no snake/ladder) or a valid 1-indexed destination square'],
    ds: {
      answer: 'BFS queue of (board label, steps) + visited set of reached labels',
      choices: ['BFS queue of (board label, steps) + visited set of reached labels', 'DFS with memo keyed by label, returning min steps to n*n', 'Dijkstra with a min-heap of (steps, label)', '2-D dp table of (row, col) minimum steps, filled by increasing label'],
    },
    method: {
      answer: "BFS over labels 1..n*n: ==from label, try every roll 1-6 to reach nextLabel, convert it to (row,col) with a boustrophedon formula, then jump through a snake or ladder if board[r][c] != -1==, first time n*n is dequeued is the fewest rolls",
      choices: [
        'DFS trying every sequence of dice rolls recursively, tracking the minimum path length found',
        'Greedy: always take the roll that lands on the snake/ladder destination farthest along the board',
        "BFS over labels 1..n*n: ==from label, try every roll 1-6 to reach nextLabel, convert it to (row,col) with a boustrophedon formula, then jump through a snake or ladder if board[r][c] != -1==, first time n*n is dequeued is the fewest rolls",
        'Precompute all-pairs shortest paths between every two labels with Floyd-Warshall, then read off label 1 to n*n',
      ],
    },
    code: `class Solution:
    def snakesAndLadders(self, board: List[List[int]]) -> int:
        n = len(board)

        def cell(label):
            row, col = divmod(label - 1, n)
            if row % 2 == 1:
                col = n - 1 - col
            return n - 1 - row, col

        queue = deque([(1, 0)])
        visited = {1}

        while queue:
            label, steps = queue.popleft()
            if label == n * n:
                return steps

            for nextLabel in range(label + 1, min(label + 6, n * n) + 1):
                r, c = cell(nextLabel)
                dest = board[r][c] if board[r][c] != -1 else nextLabel
                if dest not in visited:
                    visited.add(dest)
                    queue.append((dest, steps + 1))

        return -1`,
    blanks: [7, 20, 23],
    time: { answer: 'O(n^2)', choices: ['O(n^2)', 'O(n)', 'O(n^4)', 'O(n^2 log n)'], why: 'each of the n^2 labels is visited once, with a constant 6 rolls checked per label' },
    space: { answer: 'O(n^2)', choices: ['O(n^2)', 'O(n)', 'O(1)', 'O(n log n)'], why: 'visited set and queue can hold up to n^2 labels, plus the board itself' },
    sayIt: "BFS over board labels, each state tries rolls ==1 through 6==, converts the landing label to (row,col) with the boustrophedon flip, and snakes/ladders teleport the destination; first dequeue of n*n wins, O(n^2) time/space.",
    pitfall: "Odd rows (from the bottom, 0-indexed) read right to left — forgetting the boustrophedon column flip sends you to the wrong cell.",
  },
  {
    id: 'thought:graphs:number-of-distinct-islands',
    lc: 694,
    title: 'Number of Distinct Islands',
    difficulty: 'Medium',
    category: 'graphs',
    skills: ['graph-dfs', 'grid'],
    companies: ['amazon', 'google'],
    statement: `You're given a grid of 0s and 1s where 1s form islands (connected horizontally or vertically). Two islands are considered the same shape if one can be translated (shifted, not rotated or reflected) to exactly match the other.

Count how many distinct island shapes exist in the grid.

Islands that are identical in shape but located in different parts of the grid still only count once.`,
    examples: [
      { input: 'grid = [[1,1,0,0,0],[1,1,0,0,0],[0,0,0,1,1],[0,0,0,1,1]]', output: '1', explanation: 'both 2x2 square islands have the exact same shape' },
    ],
    constraints: ['1 <= rows, cols <= 50', 'grid[i][j] is 0 or 1'],
    ds: {
      answer: 'DFS per island recording relative (row,col) offsets from its start cell, collected into a set of shape tuples',
      choices: ['DFS per island recording relative (row,col) offsets from its start cell, collected into a set of shape tuples', 'BFS per island recording absolute (row,col) cells into a set', 'Union-Find grouping land cells, counting connected components only', 'dd(list) adjacency + hashing the sorted list of absolute cell coordinates'],
    },
    method: {
      answer: "DFS each unvisited land cell as a new island, but record every visited cell as ==(row - startRow, col - startCol)== relative to where that island started, so two islands with the same shape produce the identical path tuple regardless of position",
      choices: [
        'DFS each island recording absolute (row, col) cells, then normalize afterward by subtracting the minimum row and column',
        "DFS each unvisited land cell as a new island, but record every visited cell as ==(row - startRow, col - startCol)== relative to where that island started, so two islands with the same shape produce the identical path tuple regardless of position",
        'BFS each island, hashing the multiset of cell-to-cell Manhattan distances',
        'Flood-fill and compare islands pairwise by rotating and reflecting one onto the other',
      ],
    },
    code: `class Solution:
    def numDistinctIslands(self, grid: List[List[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        seen = set()
        shapes = set()

        def dfs(r, c, r0, c0, path):
            if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] == 0 or (r, c) in seen:
                return

            seen.add((r, c))
            path.append((r - r0, c - c0))

            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                dfs(r + dr, c + dc, r0, c0, path)

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 1 and (r, c) not in seen:
                    path = []
                    dfs(r, c, r, c, path)
                    shapes.add(tuple(path))

        return len(shapes)`,
    blanks: [11, 18, 21],
    time: { answer: 'O(rows * cols)', choices: ['O(rows * cols)', 'O(rows * cols * log(rows*cols))', 'O((rows*cols)^2)', 'O(rows + cols)'], why: 'each land cell is visited by DFS exactly once total' },
    space: { answer: 'O(rows * cols)', choices: ['O(rows * cols)', 'O(rows + cols)', 'O(1)', 'O(log(rows*cols))'], why: 'seen set, recursion stack, and shape paths can each hold every land cell' },
    sayIt: "DFS each island, but record cells as ==offsets from that island's own start cell==, not absolute coordinates, so identical shapes hash to the same tuple no matter where they sit, O(rows*cols) time/space.",
    pitfall: 'Recording absolute coordinates instead of offsets from the start cell makes every island look unique, even identical shapes in different spots.',
  },
]

export default {
  id: 'graphs',
  title: 'Graphs: traversal',
  icon: 'web',
  items,
}
