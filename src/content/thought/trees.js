const items = [
  {
    id: 'thought:trees:max-depth', lc: 104, title: 'Maximum Depth of Binary Tree', difficulty: 'Easy', category: 'trees',
    skills: ['tree-dfs'],
    companies: ['google', 'amazon', 'microsoft'],
    statement: `Given the root of a binary tree, return its maximum depth: the number of nodes along the longest path from the root down to the farthest leaf.

A tree with just a root node has depth 1. An empty tree has depth 0. The tree is not necessarily balanced or complete, so one side can be much deeper than the other.`,
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '3' },
      { input: 'root = []', output: '0' },
    ],
    constraints: ['0 <= number of nodes <= 10^4', '-100 <= Node.val <= 100'],
    ds: { answer: 'recursion only (implicit call stack), no extra DS', choices: ['recursion only (implicit call stack), no extra DS', 'deque queue + level counter', 'dd(list) adjacency + set visited', 'min-heap of (dist, node) + dist dict'] },
    method: { answer: 'Postorder DFS: each call returns the height of its own subtree; combine as ==1 + max(left, right)==', choices: ['Postorder DFS: each call returns the height of its own subtree; combine as ==1 + max(left, right)==', 'Preorder DFS passing current depth down and updating a nonlocal max on every leaf, but with no base case for None', 'BFS counting how many times the queue is refilled, without snapshotting level size first', 'Track depth with a running nonlocal counter that increments on every visit and never decrements going back up'] },
    code: `class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:

        def dfs(node):
            if not node:
                return 0

            left = dfs(node.left)
            right = dfs(node.right)

            return 1 + max(left, right)

        return dfs(root)`,
    blanks: [7, 8, 10],
    accept: { 10: ['return max(left, right) + 1'] },
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(h)', 'O(n^2)'], why: 'Every node visited exactly once.' },
    space: { answer: 'O(h)', choices: ['O(h)', 'O(n)', 'O(1)', 'O(log n)'], why: 'Call stack depth equals tree height, worst case n.' },
    sayIt: '==Postorder DFS==: each call returns subtree height, parent combines as ==1 + max(left, right)==. O(n) time, O(h) space.',
    pitfall: 'Forgetting the None base case, or off-by-one on the +1.',
  },
  {
    id: 'thought:trees:diameter', lc: 543, title: 'Diameter of Binary Tree', difficulty: 'Easy', category: 'trees',
    skills: ['tree-dfs'],
    companies: ['google', 'amazon', 'microsoft', 'meta'],
    statement: `Given the root of a binary tree, return the length (in edges) of the longest path between any two nodes. The path may or may not pass through the root.

A path is counted in edges, so a single node has diameter 0.`,
    examples: [{ input: 'root = [1,2,3,4,5]', output: '3', explanation: 'the path 4-2-1-3 (or 5-2-1-3) has 3 edges' }],
    constraints: ['1 <= number of nodes <= 10^4', '-100 <= Node.val <= 100'],
    ds: { answer: 'recursion returning height + nonlocal int for best', choices: ['recursion returning height + nonlocal int for best', 'dd(list) adjacency + BFS distance dict', 'stack of (node, depth) pairs, iterative', 'two pointers over a flattened inorder list'] },
    method: { answer: 'Postorder DFS: at every node update a ==nonlocal best== with left+right, but return height ==1 + max(left, right)== to the parent', choices: ['Postorder DFS: at every node update a ==nonlocal best== with left+right, but return height ==1 + max(left, right)== to the parent', 'Preorder DFS that updates nonlocal best with left+right before recursing into either child', 'BFS layer by layer, diameter is the number of layers minus one', 'Postorder DFS returning left+right itself up to the parent instead of height'] },
    code: `class Solution:
    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:
        best = 0

        def dfs(node):
            nonlocal best
            if not node:
                return 0

            left = dfs(node.left)
            right = dfs(node.right)
            best = max(best, left + right)

            return 1 + max(left, right)

        dfs(root)
        return best`,
    blanks: [9, 10, 11],
    accept: { 11: ['best = max(left + right, best)'] },
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(h)'], why: 'Single postorder pass visits each node once.' },
    space: { answer: 'O(h)', choices: ['O(h)', 'O(n)', 'O(1)', 'O(n log n)'], why: 'Recursion depth bounded by tree height.' },
    sayIt: '==Postorder DFS== returning height, updating a ==nonlocal best== with left+right at every node since the path may not pass through root. O(n)/O(h).',
    pitfall: 'Returning best from dfs instead of height breaks the parent combine.',
  },
  {
    id: 'thought:trees:balanced-binary-tree', lc: 110, title: 'Balanced Binary Tree', difficulty: 'Easy', category: 'trees',
    skills: ['tree-dfs'],
    companies: ['google', 'amazon', 'bloomberg'],
    statement: `Given a binary tree, determine if it is height-balanced: for every node, the heights of its left and right subtrees differ by at most 1.`,
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: 'true' },
      { input: 'root = [1,2,2,3,3,null,null,4,4]', output: 'false' },
    ],
    constraints: ['0 <= number of nodes <= 5000', '-10^4 <= Node.val <= 10^4'],
    ds: { answer: 'recursion returning height, with -1 as a failure sentinel', choices: ['recursion returning height, with -1 as a failure sentinel', 'two separate dfs passes: one for height, one to recheck every node', 'deque BFS comparing level widths left vs right', 'stack of (node, height) iterative postorder'] },
    method: { answer: 'Postorder DFS: return subtree height, but return ==-1== the moment a child failed or |left-right|>1, short-circuiting upward', choices: ['Postorder DFS: return subtree height, but return ==-1== the moment a child failed or |left-right|>1, short-circuiting upward', 'Preorder DFS: compute height(node.left) and height(node.right) independently at every node, called from the top down', 'BFS comparing the number of nodes at each depth on the left half of the tree vs the right half', 'Postorder DFS returning the true height always, and checking balance only once at the root'] },
    code: `class Solution:
    def isBalanced(self, root: Optional[TreeNode]) -> bool:

        def dfs(node):
            if not node:
                return 0

            left = dfs(node.left)
            right = dfs(node.right)

            if left == -1 or right == -1 or abs(left - right) > 1:
                return -1

            return 1 + max(left, right)

        return dfs(root) != -1`,
    blanks: [10, 11, 13],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(h)'], why: 'One postorder pass; -1 sentinel skips recomputation.' },
    space: { answer: 'O(h)', choices: ['O(h)', 'O(n)', 'O(log n)', 'O(1)'], why: 'Call stack depth equals tree height.' },
    sayIt: 'Postorder DFS returning height, but ==-1 is a sentinel== for "already unbalanced", short-circuiting the rest of the tree. O(n)/O(h).',
    pitfall: 'Recomputing height separately at each node makes it O(n^2).',
  },
  {
    id: 'thought:trees:longest-univalue-path', lc: 687, title: 'Longest Univalue Path', difficulty: 'Easy', category: 'trees',
    skills: ['tree-dfs'],
    companies: ['google'],
    statement: `Given the root of a binary tree, find the length (in edges) of the longest path where every node has the same value. The path does not need to pass through the root, and it can bend at a node, using one arm going left and one arm going right.`,
    examples: [{ input: 'root = [5,4,5,1,1,null,5]', output: '2', explanation: 'the path 5-5-5 has 2 edges' }],
    constraints: ['0 <= number of nodes <= 10^4', '-1000 <= Node.val <= 1000'],
    ds: { answer: 'recursion returning matched-arm length + nonlocal best for edge count', choices: ['recursion returning matched-arm length + nonlocal best for edge count', "dd(int) counting frequency of each value across the tree", 'deque BFS grouping nodes by value per level', 'union-find merging same-valued neighbors into components'] },
    method: { answer: 'Postorder DFS: each call returns its own longest matching arm (0 if child value differs); update ==nonlocal best== with leftArm+rightArm at every node', choices: ['Postorder DFS: each call returns its own longest matching arm (0 if child value differs); update ==nonlocal best== with leftArm+rightArm at every node', 'Preorder DFS passing the parent value down and incrementing a nonlocal run length only while descending in one fixed direction', 'BFS level by level, counting the longest run of equal values within each level', 'Postorder DFS that returns leftArm+rightArm itself up to the parent instead of the single longer arm'] },
    code: `class Solution:
    def longestUnivaluePath(self, root: Optional[TreeNode]) -> int:
        best = 0

        def dfs(node):
            nonlocal best
            if not node:
                return 0

            left = dfs(node.left)
            right = dfs(node.right)

            leftArm = left + 1 if node.left and node.left.val == node.val else 0
            rightArm = right + 1 if node.right and node.right.val == node.val else 0

            best = max(best, leftArm + rightArm)

            return max(leftArm, rightArm)

        dfs(root)
        return best`,
    blanks: [12, 13, 15],
    accept: { 15: ['best = max(leftArm + rightArm, best)'] },
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(h)'], why: 'Each node visited once in the postorder pass.' },
    space: { answer: 'O(h)', choices: ['O(h)', 'O(n)', 'O(1)', 'O(n^2)'], why: 'Recursion depth bounded by tree height.' },
    sayIt: 'Postorder DFS: each side only counts as an ==arm== if the child value matches; tally left+right into nonlocal best, return the longer single arm. O(n)/O(h).',
    pitfall: "Forgetting to zero out an arm when the child's value differs.",
  },
  {
    id: 'thought:trees:max-path-sum', lc: 124, title: 'Binary Tree Maximum Path Sum', difficulty: 'Hard', category: 'trees',
    skills: ['tree-dfs'],
    companies: ['google', 'amazon', 'microsoft', 'meta'],
    statement: `Given the root of a binary tree where nodes can hold negative values, find the maximum sum of any downward-bending path. A path can start and end at any node, doesn't need to pass through the root, and can use one child subtree on the left and one on the right to bend at a node, but it can never fork at two different points.`,
    examples: [
      { input: 'root = [1,2,3]', output: '6' },
      { input: 'root = [-10,9,20,null,null,15,7]', output: '42' },
    ],
    constraints: ['1 <= number of nodes <= 3 * 10^4', '-1000 <= Node.val <= 1000'],
    ds: { answer: 'recursion returning best single-arm sum (clamped at 0) + nonlocal best', choices: ['recursion returning best single-arm sum (clamped at 0) + nonlocal best', 'dp table indexed by node id storing best sum ending at that node', 'dd(list) adjacency list + Dijkstra on negated weights', 'prefix sum array over a flattened preorder traversal'] },
    method: { answer: "Postorder DFS: clamp each child's contribution at ==max(0, gain)==, update nonlocal best with node.val+left+right, return node.val + the larger side", choices: ["Postorder DFS: clamp each child's contribution at ==max(0, gain)==, update nonlocal best with node.val+left+right, return node.val + the larger side", 'Preorder DFS that adds node.val to a running nonlocal total as it descends and never resets on a negative node', 'Greedy: always descend into whichever child subtree has the larger single node value', 'Postorder DFS without clamping negatives, so a negative subtree can lower an otherwise positive path'] },
    code: `class Solution:
    def maxPathSum(self, root: Optional[TreeNode]) -> int:
        best = float('-inf')

        def dfs(node):
            nonlocal best
            if not node:
                return 0

            left = max(0, dfs(node.left))
            right = max(0, dfs(node.right))

            best = max(best, node.val + left + right)

            return node.val + max(left, right)

        dfs(root)
        return best`,
    blanks: [9, 10, 12],
    accept: { 12: ['best = max(node.val + left + right, best)'] },
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(h)'], why: 'Postorder visits every node exactly once.' },
    space: { answer: 'O(h)', choices: ['O(h)', 'O(n)', 'O(1)', 'O(log n)'], why: 'Recursion stack depth equals tree height.' },
    sayIt: "Postorder DFS: ==clamp each side at max(0, gain)== so negatives don't hurt, update nonlocal best with node.val+left+right, return node.val plus the better side. O(n)/O(h).",
    pitfall: 'Skipping the max(0, ...) clamp lets negative subtrees lower the sum.',
  },
  {
    id: 'thought:trees:same-tree', lc: 100, title: 'Same Tree', difficulty: 'Easy', category: 'trees',
    skills: ['tree-dfs'],
    companies: ['amazon', 'microsoft', 'bloomberg'],
    statement: `Given the roots of two binary trees, determine whether they are structurally identical and every corresponding pair of nodes has the same value.`,
    examples: [
      { input: 'p = [1,2,3], q = [1,2,3]', output: 'true' },
      { input: 'p = [1,2], q = [1,null,2]', output: 'false' },
    ],
    constraints: ['0 <= nodes in each tree <= 100', '-10^4 <= Node.val <= 10^4'],
    ds: { answer: 'paired recursion over both trees, no extra DS', choices: ['paired recursion over both trees, no extra DS', 'serialize both trees to strings with preorder + N markers, then compare strings', 'dd(list) grouping node values by depth for both trees, compare lists', 'two queues, BFS both trees level by level and compare level lists'] },
    method: { answer: 'Preorder recursion on both trees together: mismatched None-ness or value returns ==False== immediately, else recurse into ==both children==', choices: ['Preorder recursion on both trees together: mismatched None-ness or value returns ==False== immediately, else recurse into ==both children==', 'Serialize each tree independently with an inorder traversal and compare the two resulting lists for equality', 'Compare only the two root values, then separately check that both trees have the same total node count', 'Postorder recursion that compares the two subtree sums before ever checking p.val against q.val'] },
    code: `class Solution:
    def isSameTree(self, p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:
        if not p and not q:
            return True

        if not p or not q or p.val != q.val:
            return False

        return self.isSameTree(p.left, q.left) and self.isSameTree(p.right, q.right)`,
    blanks: [5, 6, 8],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(n+m)'], why: 'Visits nodes of the smaller tree once before any mismatch.' },
    space: { answer: 'O(h)', choices: ['O(h)', 'O(n)', 'O(1)', 'O(log n)'], why: "Recursion depth bounded by the shorter tree's height." },
    sayIt: 'Paired preorder recursion: mismatched None-ness or value returns False immediately, else recurse into ==both children==. O(n)/O(h).',
    pitfall: "Checking only node.val and skipping the None-shape mismatch case.",
  },
  {
    id: 'thought:trees:subtree-of-another-tree', lc: 572, title: 'Subtree of Another Tree', difficulty: 'Easy', category: 'trees',
    skills: ['tree-dfs'],
    companies: ['amazon', 'microsoft', 'meta'],
    statement: `Given the roots of two binary trees root and subRoot, determine whether subRoot appears anywhere inside root as an exact subtree, meaning there's some node in root whose entire subtree matches subRoot node-for-node.

An empty subRoot trivially matches (vacuously true), but an empty root with a non-empty subRoot can never match.`,
    examples: [{ input: 'root = [3,4,5,1,2], subRoot = [4,1,2]', output: 'true' }],
    constraints: ['1 <= nodes in root <= 2000', '1 <= nodes in subRoot <= 1000'],
    ds: { answer: 'recursion: for each node of root, run a same-tree check against subRoot', choices: ['recursion: for each node of root, run a same-tree check against subRoot', 'serialize root and subRoot to strings with N markers, substring search', "hash every subtree of root into a set, look up subRoot's hash", "BFS root level by level, compare node values against subRoot's root value only"] },
    method: { answer: 'Preorder DFS over root: at each node run the ==same-tree check== against subRoot; if it fails, recurse into left and right', choices: ['Preorder DFS over root: at each node run the ==same-tree check== against subRoot; if it fails, recurse into left and right', "Compare only node.val equal to subRoot.val, skip verifying the rest of the structure", 'Run the same-tree check once at the root of root only, since a subtree must start at the top', "BFS over root collecting every node into a list, then check if subRoot's values appear as a contiguous slice"] },
    code: `class Solution:
    def isSubtree(self, root: Optional[TreeNode], subRoot: Optional[TreeNode]) -> bool:

        def sameTree(a, b):
            if not a and not b:
                return True
            if not a or not b or a.val != b.val:
                return False
            return sameTree(a.left, b.left) and sameTree(a.right, b.right)

        if not root:
            return not subRoot

        if sameTree(root, subRoot):
            return True

        return self.isSubtree(root.left, subRoot) or self.isSubtree(root.right, subRoot)`,
    blanks: [13, 14, 16],
    time: { answer: 'O(n*m)', choices: ['O(n*m)', 'O(n+m)', 'O(n log m)', 'O(n^2)'], why: 'Same-tree check (O(m)) can run at up to n nodes of root.' },
    space: { answer: 'O(h_root + h_sub)', choices: ['O(h_root + h_sub)', 'O(n*m)', 'O(1)', 'O(n+m)'], why: 'Outer recursion depth plus inner same-tree recursion depth.' },
    sayIt: 'Preorder DFS over root running a ==same-tree check== at every node against subRoot, recursing into children on failure. O(n*m)/O(h_root+h_sub).',
    pitfall: 'Checking only the root of root instead of every node.',
  },
  {
    id: 'thought:trees:invert-tree', lc: 226, title: 'Invert Binary Tree', difficulty: 'Easy', category: 'trees',
    skills: ['tree-dfs'],
    companies: ['google', 'amazon'],
    statement: `Given the root of a binary tree, flip it into its mirror image: swap every node's left and right children, all the way down.`,
    examples: [
      { input: 'root = [4,2,7,1,3,6,9]', output: '[4,7,2,9,6,3,1]' },
      { input: 'root = []', output: '[]' },
    ],
    constraints: ['0 <= number of nodes <= 100', '-100 <= Node.val <= 100'],
    ds: { answer: 'recursion only, swap children in place', choices: ['recursion only, swap children in place', "deque BFS, swap each popped node's children before enqueueing them", 'stack-based iterative postorder, swap children after both subtrees return', 'build a brand new mirrored tree with a hashmap from old node id to new node'] },
    method: { answer: 'Preorder DFS: swap ==node.left and node.right== first, then recurse into both (now-swapped) children', choices: ['Preorder DFS: swap ==node.left and node.right== first, then recurse into both (now-swapped) children', "Postorder DFS: recurse into both children first, then swap the parent's pointers to the already-inverted subtrees without reassigning them", 'BFS level by level, reversing the left-to-right order of nodes within each level only', "Preorder DFS that swaps node.val with its sibling's val instead of swapping child pointers"] },
    code: `class Solution:
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        if not root:
            return None

        root.left, root.right = root.right, root.left

        self.invertTree(root.left)
        self.invertTree(root.right)

        return root`,
    blanks: [5, 7, 8],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(log n)', 'O(n log n)', 'O(n^2)'], why: 'Every node visited once to swap its children.' },
    space: { answer: 'O(h)', choices: ['O(h)', 'O(n)', 'O(1)', 'O(w)'], why: 'Recursion depth equals tree height.' },
    sayIt: 'Preorder DFS: ==swap node.left and node.right== first, then recurse into both now-swapped children. O(n)/O(h).',
    pitfall: 'Swapping values instead of swapping the child pointers themselves.',
  },
  {
    id: 'thought:trees:level-order', lc: 102, title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', category: 'trees',
    skills: ['tree-bfs', 'queue-deque'],
    companies: ['amazon', 'microsoft', 'meta', 'bloomberg'],
    statement: `Given the root of a binary tree, return its node values grouped level by level, from top to bottom, each level read left to right.`,
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]' },
      { input: 'root = []', output: '[]' },
    ],
    constraints: ['0 <= number of nodes <= 2000', '-1000 <= Node.val <= 1000'],
    ds: { answer: 'deque queue, snapshot len(queue) per level', choices: ['deque queue, snapshot len(queue) per level', 'dd(list) mapping depth to values via recursive DFS', 'stack, pop last-in-first for level grouping', 'min-heap of (depth, node) ordered by depth'] },
    method: { answer: 'BFS: snapshot ==len(queue)== at the top of each round, pop exactly that many nodes, push their children for the next round', choices: ['BFS: snapshot ==len(queue)== at the top of each round, pop exactly that many nodes, push their children for the next round', "BFS popping from the queue until it's completely empty inside one single loop, no per-level snapshot", "Preorder DFS with a depth parameter, appending node.val to result[depth] as it descends", 'BFS using a stack instead of a queue so each level comes out right to left, then reversing each level'] },
    code: `from collections import deque

class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        if not root:
            return []

        result = []
        queue = deque([root])

        while queue:
            level = []
            size = len(queue)

            for _ in range(size):
                node = queue.popleft()
                level.append(node.val)

                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)

            result.append(level)

        return result`,
    blanks: [12, 15, 23],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(w)', 'O(n^2)'], why: 'Every node enqueued and dequeued exactly once.' },
    space: { answer: 'O(w)', choices: ['O(w)', 'O(n)', 'O(h)', 'O(1)'], why: 'Queue holds at most one level; width w up to n/2.' },
    sayIt: 'BFS: ==snapshot len(queue)== before draining each level, so children enqueued now wait for the next round. O(n)/O(w).',
    pitfall: 'Not snapshotting the size before the inner loop blurs levels together.',
  },
  {
    id: 'thought:trees:right-side-view', lc: 199, title: 'Binary Tree Right Side View', difficulty: 'Medium', category: 'trees',
    skills: ['tree-bfs', 'queue-deque'],
    companies: ['amazon', 'meta', 'bloomberg'],
    statement: `Given the root of a binary tree, imagine standing to its right: return the values of the nodes you can see, ordered from top to bottom.`,
    examples: [{ input: 'root = [1,2,3,null,5,null,4]', output: '[1,3,4]' }],
    constraints: ['0 <= number of nodes <= 100', '-100 <= Node.val <= 100'],
    ds: { answer: 'deque queue, keep last-popped node per level', choices: ['deque queue, keep last-popped node per level', 'dd(dict) mapping depth to the rightmost value via preorder DFS (right first)', 'stack-based DFS always pushing right child before left', 'min-heap keyed by depth to find the max-depth node per branch'] },
    method: { answer: 'BFS: snapshot level size, pop that many nodes, keep the value at the ==last index of the level== (i is size - 1)', choices: ['BFS: snapshot level size, pop that many nodes, keep the value at the ==last index of the level== (i is size - 1)', 'DFS visiting left child before right at every node, recording the first node seen at each new depth', 'BFS keeping the first node popped at each level instead of the last', 'Preorder DFS always going right first, recording the first node encountered at each depth'] },
    code: `from collections import deque

class Solution:
    def rightSideView(self, root: Optional[TreeNode]) -> List[int]:
        if not root:
            return []

        result = []
        queue = deque([root])

        while queue:
            size = len(queue)

            for i in range(size):
                node = queue.popleft()

                if i == size - 1:
                    result.append(node.val)

                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)

        return result`,
    blanks: [11, 16, 17],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(h)', 'O(n log n)', 'O(w^2)'], why: 'Standard BFS visits every node once.' },
    space: { answer: 'O(w)', choices: ['O(w)', 'O(n)', 'O(h)', 'O(1)'], why: 'Queue holds at most one level at a time.' },
    sayIt: "BFS, same as level order, but only keep the ==last node popped== in each level since that's the visible one. O(n)/O(w).",
    pitfall: 'Checking i==0 (first) instead of i==size-1 (last).',
  },
  {
    id: 'thought:trees:count-good-nodes', lc: 1448, title: 'Count Good Nodes in Binary Tree', difficulty: 'Medium', category: 'trees',
    skills: ['tree-dfs'],
    companies: ['amazon', 'microsoft'],
    statement: `Given the root of a binary tree, a node X is "good" if, on the path from the root down to X, no node has a value greater than X.val. Count how many good nodes exist.`,
    examples: [{ input: 'root = [3,1,4,3,null,1,5]', output: '4' }],
    constraints: ['1 <= number of nodes <= 10^5', '-10^4 <= Node.val <= 10^4'],
    ds: { answer: 'top-down recursion passing pathMax + nonlocal counter', choices: ['top-down recursion passing pathMax + nonlocal counter', 'postorder DFS returning the max of each subtree, compare against root.val once', 'dd(list) bucketing nodes by depth, then scanning each bucket for a running max', 'BFS tracking the global max seen so far across the whole queue'] },
    method: { answer: 'Preorder DFS passing ==pathMax== down; increment a ==nonlocal count== whenever node.val >= pathMax, then recurse with the updated pathMax', choices: ['Preorder DFS passing ==pathMax== down; increment a ==nonlocal count== whenever node.val >= pathMax, then recurse with the updated pathMax', 'Postorder DFS: compute the max of each subtree first, then compare node.val against that max on the way back up', 'Preorder DFS passing down the single global tree maximum computed once upfront, instead of the running path maximum', 'BFS level by level, comparing every node only against the largest value seen in the previous level'] },
    code: `class Solution:
    def goodNodes(self, root: TreeNode) -> int:
        count = 0

        def dfs(node, pathMax):
            nonlocal count
            if not node:
                return

            if node.val >= pathMax:
                count += 1
                pathMax = node.val

            dfs(node.left, pathMax)
            dfs(node.right, pathMax)

        dfs(root, root.val)
        return count`,
    blanks: [9, 10, 11],
    accept: { 10: ['count = count + 1'] },
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(h)', 'O(n^2)'], why: 'Preorder DFS visits each node exactly once.' },
    space: { answer: 'O(h)', choices: ['O(h)', 'O(n)', 'O(1)', 'O(log n)'], why: 'Recursion depth equals tree height.' },
    sayIt: 'Preorder DFS carrying a ==pathMax== down; increment a nonlocal count whenever node.val >= pathMax, then update pathMax before recursing. O(n)/O(h).',
    pitfall: 'Using > instead of >= misses ties with the current max.',
  },
  {
    id: 'thought:trees:validate-bst', lc: 98, title: 'Validate Binary Search Tree', difficulty: 'Medium', category: 'trees',
    skills: ['bst', 'tree-dfs'],
    companies: ['amazon', 'microsoft', 'meta', 'bloomberg'],
    statement: `Given the root of a binary tree, determine if it's a valid binary search tree: every node's value must be strictly greater than all values in its left subtree and strictly less than all values in its right subtree.`,
    examples: [
      { input: 'root = [2,1,3]', output: 'true' },
      { input: 'root = [5,1,4,null,null,3,6]', output: 'false', explanation: '4 is less than 5 but sits in the right subtree, so it must be greater than 5' },
    ],
    constraints: ['1 <= number of nodes <= 10^4', '-2^31 <= Node.val <= 2^31 - 1'],
    ds: { answer: 'recursion passing down (low, high) bounds', choices: ['recursion passing down (low, high) bounds', 'inorder traversal into a list, then check the list is strictly increasing', 'dd(list) adjacency + topological check for ordering violations', 'stack-based iterative postorder comparing each node only to its parent'] },
    method: { answer: 'Preorder DFS: check ==low < node.val < high==, then recurse left with (low, node.val) and right with (node.val, high)', choices: ['Preorder DFS: check ==low < node.val < high==, then recurse left with (low, node.val) and right with (node.val, high)', 'Postorder DFS: compute min and max of each subtree, then compare node.val against those after both children return', "Preorder DFS comparing every node only to its immediate parent's value, with no inherited bounds", 'Inorder DFS tracking a nonlocal prev node, but flagging invalid only when prev is None instead of comparing prev.val to node.val'] },
    code: `class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:

        def dfs(node, low, high):
            if not node:
                return True

            if not (low < node.val < high):
                return False

            return dfs(node.left, low, node.val) and dfs(node.right, node.val, high)

        return dfs(root, float('-inf'), float('inf'))`,
    blanks: [7, 8, 10],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(h)', 'O(n^2)'], why: "Each node checked once against its (low, high) window." },
    space: { answer: 'O(h)', choices: ['O(h)', 'O(n)', 'O(1)', 'O(log n)'], why: 'Recursion depth equals tree height.' },
    sayIt: 'Preorder DFS passing a ==(low, high) window== down, tightening it on each recursive call instead of comparing only to the parent. O(n)/O(h).',
    pitfall: 'Comparing only to the direct parent misses deep ancestor violations.',
  },
  {
    id: 'thought:trees:kth-smallest-bst', lc: 230, title: 'Kth Smallest Element in a BST', difficulty: 'Medium', category: 'trees',
    skills: ['bst', 'stack'],
    companies: ['amazon', 'meta', 'bloomberg'],
    statement: `Given the root of a binary search tree and an integer k, return the kth smallest value in the tree (1-indexed).`,
    examples: [
      { input: 'root = [3,1,4,null,2], k = 1', output: '1' },
      { input: 'root = [5,3,6,2,4,null,null,1], k = 3', output: '3' },
    ],
    constraints: ['number of nodes == n', '1 <= k <= n <= 10^4'],
    ds: { answer: 'explicit stack walking the left spine (iterative inorder)', choices: ['explicit stack walking the left spine (iterative inorder)', 'min-heap of all node values, pop k times', 'recursive inorder collecting all values into a list, index k-1', 'deque BFS level by level, flatten and sort all values'] },
    method: { answer: "Iterative inorder: push the ==left spine== onto a stack, pop, decrement k, return once ==k reaches 0==, else continue into the popped node's right subtree", choices: ["Iterative inorder: push the ==left spine== onto a stack, pop, decrement k, return once ==k reaches 0==, else continue into the popped node's right subtree", 'Iterative preorder with a stack, counting visits and returning on the kth pop regardless of which side it came from', 'Recursive postorder, counting from the rightmost node inward since postorder visits right before left', 'BFS with a queue, returning the kth node dequeued across all levels'] },
    code: `class Solution:
    def kthSmallest(self, root: Optional[TreeNode], k: int) -> int:
        stack = []
        curr = root

        while stack or curr:
            while curr:
                stack.append(curr)
                curr = curr.left

            curr = stack.pop()
            k -= 1

            if k == 0:
                return curr.val

            curr = curr.right`,
    blanks: [7, 10, 16],
    time: { answer: 'O(h + k)', choices: ['O(h + k)', 'O(n)', 'O(n log n)', 'O(k log n)'], why: 'Push left spine once, then pop k times before stopping.' },
    space: { answer: 'O(h)', choices: ['O(h)', 'O(n)', 'O(k)', 'O(1)'], why: 'Stack holds at most one left spine.' },
    sayIt: 'Iterative inorder with an explicit ==stack for the left spine==; pop, decrement k, stop the moment k hits 0. O(h+k)/O(h).',
    pitfall: 'Forgetting to move into curr.right after popping and visiting.',
  },
  {
    id: 'thought:trees:lca-bst', lc: 235, title: 'Lowest Common Ancestor of a BST', difficulty: 'Easy', category: 'trees',
    skills: ['bst'],
    companies: ['amazon', 'microsoft'],
    statement: `Given a binary search tree and two nodes p and q that both exist in it, find their lowest common ancestor: the deepest node that has both p and q as descendants (a node can be its own descendant).`,
    examples: [
      { input: 'root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8', output: '6' },
      { input: 'root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 4', output: '2' },
    ],
    constraints: ['2 <= number of nodes <= 10^5', 'all Node.val unique', 'p and q both exist in the tree'],
    ds: { answer: 'iterative walk using BST ordering, no extra DS', choices: ['iterative walk using BST ordering, no extra DS', 'recursion computing the full root-to-p and root-to-q paths as lists, then compare them', 'dd(list) adjacency + BFS to find the meeting point of two shortest paths', 'stack-based iterative postorder checking every node for both descendants'] },
    method: { answer: 'Walk down from root: go ==left== if both p and q are smaller than curr, go ==right== if both are larger, otherwise curr is the split point', choices: ['Walk down from root: go ==left== if both p and q are smaller than curr, go ==right== if both are larger, otherwise curr is the split point', 'Postorder DFS over the whole tree, returning the deepest node whose subtree contains both p and q, with no use of BST ordering', 'BFS from the root until both p and q have been dequeued, returning whichever node was dequeued last', 'Walk down comparing only p against curr, ignoring q entirely, since whichever side holds p must hold the LCA too'] },
    code: `class Solution:
    def lowestCommonAncestor(self, root: TreeNode, p: TreeNode, q: TreeNode) -> TreeNode:
        curr = root

        while curr:
            if p.val < curr.val and q.val < curr.val:
                curr = curr.left
            elif p.val > curr.val and q.val > curr.val:
                curr = curr.right
            else:
                return curr`,
    blanks: [5, 6, 7],
    time: { answer: 'O(h)', choices: ['O(h)', 'O(n)', 'O(log n)', 'O(1)'], why: 'One root-to-split walk, no backtracking.' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(h)', 'O(n)', 'O(log n)'], why: 'Iterative walk; no recursion or extra memory.' },
    sayIt: 'Walk down using ==BST ordering==: both smaller go left, both larger go right, otherwise this is the split (the LCA). O(h)/O(1).',
    pitfall: 'Mishandling the case where curr itself equals p or q.',
  },
  {
    id: 'thought:trees:lca-binary-tree', lc: 236, title: 'Lowest Common Ancestor of a Binary Tree', difficulty: 'Medium', category: 'trees',
    skills: ['tree-dfs'],
    companies: ['amazon', 'microsoft', 'meta'],
    statement: `Given a binary tree (not necessarily a BST) and two nodes p and q guaranteed to exist in it, find their lowest common ancestor.`,
    examples: [
      { input: 'root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1', output: '3' },
      { input: 'root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 4', output: '5' },
    ],
    constraints: ['2 <= number of nodes <= 10^5', 'all Node.val unique'],
    ds: { answer: 'postorder recursion bubbling up whichever of p/q was found', choices: ['postorder recursion bubbling up whichever of p/q was found', "BST-style walk comparing p.val and q.val against curr.val to pick a side", 'dd(list) adjacency + BFS from p and from q to find the meeting node', 'store parent pointers in a hashmap via BFS, then walk both ancestor chains up'] },
    method: { answer: 'Postorder DFS: recurse both children; if ==both sides return non-null==, this node is the split, else pass up whichever side is non-null', choices: ['Postorder DFS: recurse both children; if ==both sides return non-null==, this node is the split, else pass up whichever side is non-null', 'Preorder DFS returning the first node encountered whose value equals p.val or q.val, descending left before right', 'BST-style comparison of p.val and q.val against node.val to decide which single child to recurse into', 'BFS with a queue, returning the first node dequeued that matches either p or q'] },
    code: `class Solution:
    def lowestCommonAncestor(self, root: TreeNode, p: TreeNode, q: TreeNode) -> TreeNode:
        if not root or root == p or root == q:
            return root

        left = self.lowestCommonAncestor(root.left, p, q)
        right = self.lowestCommonAncestor(root.right, p, q)

        if left and right:
            return root

        return left if left else right`,
    blanks: [5, 6, 8],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(h)', 'O(log n)', 'O(n log n)'], why: 'Every node may be visited once in the worst case.' },
    space: { answer: 'O(h)', choices: ['O(h)', 'O(n)', 'O(1)', 'O(log n)'], why: 'Recursion stack depth equals tree height.' },
    sayIt: 'Postorder DFS into both children; ==both sides non-null== means this node is the split, otherwise bubble up whichever side found something. O(n)/O(h).',
    pitfall: 'Forgetting the root==p or root==q base case before recursing.',
  },
  {
    id: 'thought:trees:insert-into-bst', lc: 701, title: 'Insert into a Binary Search Tree', difficulty: 'Medium', category: 'trees',
    skills: ['bst'],
    companies: ['microsoft'],
    statement: `Given the root of a binary search tree and a value to insert, add a new node with that value so the tree stays a valid BST, and return the tree's new root. There can be multiple valid trees after the insert; any of them is accepted as long as the BST property holds.`,
    examples: [
      { input: 'root = [4,2,7,1,3], val = 5', output: '[4,2,7,1,3,5]' },
      { input: 'root = [], val = 5', output: '[5]' },
    ],
    constraints: ['0 <= number of nodes <= 10^4', '-10^8 <= Node.val, val <= 10^8', 'all Node.val unique'],
    ds: { answer: 'iterative BST walk, no extra DS', choices: ['iterative BST walk, no extra DS', 'inorder traversal into a sorted list, insert val with bisect, rebuild the tree', 'deque BFS searching for the first empty child slot level by level', 'recursion building an entirely new tree with every old value plus val'] },
    method: { answer: 'Walk down comparing val to node.val, go left/right accordingly; when a child slot is ==None==, attach a new ==TreeNode(val)== there', choices: ['Walk down comparing val to node.val, go left/right accordingly; when a child slot is ==None==, attach a new ==TreeNode(val)== there', "Recurse into both children regardless of val's comparison to node.val, inserting at whichever side returns first", 'BFS with a queue, inserting the new node as the left child of the first node dequeued that has any empty slot', 'Walk down comparing val only to the root, then always insert into the right subtree since val must be the newest'] },
    code: `class Solution:
    def insertIntoBST(self, root: Optional[TreeNode], val: int) -> Optional[TreeNode]:
        if not root:
            return TreeNode(val)

        curr = root

        while True:
            if val < curr.val:
                if not curr.left:
                    curr.left = TreeNode(val)
                    break
                curr = curr.left
            else:
                if not curr.right:
                    curr.right = TreeNode(val)
                    break
                curr = curr.right

        return root`,
    blanks: [10, 12, 15],
    time: { answer: 'O(h)', choices: ['O(h)', 'O(n)', 'O(log n) always', 'O(1)'], why: 'Walks one root-to-leaf path to find the insertion spot.' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(h)', 'O(n)', 'O(log n)'], why: 'Iterative walk uses no recursion or extra structures.' },
    sayIt: 'Iterative BST walk comparing val to node.val; attach a new node the moment a ==child slot is None==. O(h)/O(1).',
    pitfall: 'Forgetting the empty-tree base case before starting the walk.',
  },
  {
    id: 'thought:trees:build-tree-preorder-inorder', lc: 105, title: 'Construct Binary Tree from Preorder and Inorder Traversal', difficulty: 'Medium', category: 'trees',
    skills: ['tree-dfs', 'arrays-hashing'],
    companies: ['amazon', 'microsoft', 'bloomberg'],
    statement: `Given two integer arrays preorder and inorder representing the preorder and inorder traversal of the same binary tree (values are unique), reconstruct and return the original tree.`,
    examples: [{ input: 'preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]', output: '[3,9,20,null,null,15,7]' }],
    constraints: ['1 <= preorder.length <= 3000', 'inorder.length == preorder.length', 'all values unique'],
    ds: { answer: 'dd/dict mapping value to inorder index + nonlocal preorder pointer', choices: ['dd/dict mapping value to inorder index + nonlocal preorder pointer', 'two pointers scanning inorder linearly for the root value on every call, no hashmap', 'stack simulating preorder, pushing right then left children as you go', 'deque BFS reconstructing the tree level by level from preorder alone'] },
    method: { answer: 'Recursion over inorder index ranges: the next unused preorder value is the subtree root; find its ==split== in inorder via the hashmap, recurse left range then right range', choices: ['Recursion over inorder index ranges: the next unused preorder value is the subtree root; find its ==split== in inorder via the hashmap, recurse left range then right range', 'Recursion over inorder ranges that builds the right subtree before the left, since preorder processes right children first', "Use only inorder to find the root by picking the middle index of each range, ignoring preorder entirely", 'Scan inorder linearly for the current preorder value on every call instead of precomputing a hashmap of indices'] },
    code: `class Solution:
    def buildTree(self, preorder: List[int], inorder: List[int]) -> Optional[TreeNode]:
        indexOf = {val: i for i, val in enumerate(inorder)}
        preIndex = 0

        def dfs(left, right):
            nonlocal preIndex
            if left > right:
                return None

            rootVal = preorder[preIndex]
            mid = indexOf[rootVal]
            preIndex += 1

            node = TreeNode(rootVal)
            node.left = dfs(left, mid - 1)
            node.right = dfs(mid + 1, right)

            return node

        return dfs(0, len(preorder) - 1)`,
    blanks: [11, 15, 16],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(h)'], why: 'Hashmap gives O(1) split lookups; each value becomes one node.' },
    space: { answer: 'O(n)', choices: ['O(n)', 'O(h)', 'O(1)', 'O(log n)'], why: 'Hashmap of n entries plus O(h) recursion stack.' },
    sayIt: "Preorder value is always the next subtree root; find its ==split in inorder== via a hashmap, recurse left range then right range. O(n)/O(n).",
    pitfall: "Building left before advancing preIndex mixes up which value is 'next'.",
  },
  {
    id: 'thought:trees:path-sum-iii', lc: 437, title: 'Path Sum III', difficulty: 'Medium', category: 'trees',
    skills: ['tree-dfs', 'arrays-hashing'],
    companies: ['amazon'],
    statement: `Given the root of a binary tree and an integer targetSum, count the number of downward paths (parent to child to child, never moving back up) whose node values sum to targetSum. A path doesn't need to start at the root or end at a leaf, but it must move strictly downward.`,
    examples: [{ input: 'root = [10,5,-3,3,2,null,11,3,-2,null,1], targetSum = 8', output: '3' }],
    constraints: ['0 <= number of nodes <= 1000', '-10^9 <= Node.val <= 10^9', '-1000 <= targetSum <= 1000'],
    ds: { answer: 'dd(int) counting prefix sums along the current root-to-node path + backtracking', choices: ['dd(int) counting prefix sums along the current root-to-node path + backtracking', 'dd(list) adjacency + BFS computing all pairwise path sums', 'two pointers over a flattened inorder array of node values', 'monotonic stack of partial sums, popping when a sum exceeds targetSum'] },
    method: { answer: "Preorder DFS with a running prefix sum; add ==prefixCount[currentSum - targetSum]== to a nonlocal total, then after recursing into children, decrement this node's prefix sum (backtrack)", choices: ["Preorder DFS with a running prefix sum; add ==prefixCount[currentSum - targetSum]== to a nonlocal total, then after recursing into children, decrement this node's prefix sum (backtrack)", 'Preorder DFS that checks only whether currentSum itself equals targetSum, with no prefix-sum map at all', 'BFS treating every node as a fresh starting point, summing straight down each branch to targetSum', 'Preorder DFS using the prefix-sum map but skipping the decrement step on the way back up the recursion'] },
    code: `from collections import defaultdict as dd

class Solution:
    def pathSum(self, root: Optional[TreeNode], targetSum: int) -> int:
        total = 0
        prefixCount = dd(int)
        prefixCount[0] = 1

        def dfs(node, currentSum):
            nonlocal total
            if not node:
                return

            currentSum += node.val
            total += prefixCount[currentSum - targetSum]

            prefixCount[currentSum] += 1
            dfs(node.left, currentSum)
            dfs(node.right, currentSum)
            prefixCount[currentSum] -= 1

        dfs(root, 0)
        return total`,
    blanks: [14, 16, 19],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(h)'], why: 'Each node visited once; prefix map lookups are O(1).' },
    space: { answer: 'O(n)', choices: ['O(n)', 'O(h)', 'O(1)', 'O(n log n)'], why: 'Prefix map plus recursion stack both bounded by n.' },
    sayIt: 'Running prefix sum down each path; add ==prefixCount[currentSum - targetSum]== to the total, then backtrack by decrementing after recursing. O(n)/O(n).',
    pitfall: 'Forgetting to decrement the prefix count on the way back up leaks counts across branches.',
  },
  {
    id: 'thought:trees:serialize-deserialize', lc: 297, title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard', category: 'trees',
    skills: ['tree-dfs'],
    companies: ['google', 'amazon', 'microsoft', 'meta', 'apple'],
    statement: `Design an algorithm to serialize a binary tree into a string and deserialize that string back into the exact same tree structure. The only requirement is that your own serialize and deserialize functions are inverses of each other; the string format is entirely up to you.`,
    examples: [{ input: 'root = [1,2,3,null,null,4,5]', output: '"1,2,3,N,N,4,5" (deserialize reproduces [1,2,3,null,null,4,5])' }],
    constraints: ['0 <= number of nodes <= 10^4', '-1000 <= Node.val <= 1000'],
    ds: { answer: 'preorder DFS into a comma-joined string, with a sentinel for None', choices: ['preorder DFS into a comma-joined string, with a sentinel for None', 'level order BFS with a queue, writing None markers for missing children per level', 'inorder DFS storing values plus a separate shape bitmask', 'store the tree as an array by index (2*i+1, 2*i+2) like a heap'] },
    method: { answer: 'Serialize with preorder DFS writing ==N== for None; deserialize by walking the same token order with a ==shared index== that advances as each token is consumed', choices: ['Serialize with preorder DFS writing ==N== for None; deserialize by walking the same token order with a ==shared index== that advances as each token is consumed', 'Serialize with level order BFS, deserialize by rebuilding level by level from a queue of pending parent slots', "Serialize with inorder DFS, deserialize by picking the middle remaining token as each subtree's root", 'Serialize with preorder DFS but deserialize using an independent index per recursive call, restarting from 0 each time'] },
    code: `class Codec:
    def serialize(self, root: Optional[TreeNode]) -> str:
        tokens = []

        def dfs(node):
            if not node:
                tokens.append('N')
                return
            tokens.append(str(node.val))
            dfs(node.left)
            dfs(node.right)

        dfs(root)
        return ','.join(tokens)

    def deserialize(self, data: str) -> Optional[TreeNode]:
        tokens = data.split(',')
        index = 0

        def dfs():
            nonlocal index
            if tokens[index] == 'N':
                index += 1
                return None
            node = TreeNode(int(tokens[index]))
            index += 1
            node.left = dfs()
            node.right = dfs()
            return node
        return dfs()`,
    blanks: [6, 26, 27],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(h)'], why: 'Preorder visits every node once on each side.' },
    space: { answer: 'O(n)', choices: ['O(n)', 'O(h)', 'O(1)', 'O(log n)'], why: 'Token list and recursion stack both scale with n.' },
    sayIt: 'Preorder DFS writes ==N== for every None child; deserialize replays the same order using one ==shared index== across recursive calls. O(n)/O(n).',
    pitfall: 'Passing index as a parameter instead of nonlocal desyncs the shared token position.',
  },
  {
    id: 'thought:trees:delete-node-bst', lc: 450, title: 'Delete Node in a BST', difficulty: 'Medium', category: 'trees',
    skills: ['bst'],
    companies: ['amazon', 'microsoft'],
    statement: `Given the root of a binary search tree and a key, delete the node with that value from the tree (if present) and return the new root. The remaining tree must still be a valid BST, and you don't need to preserve any particular shape beyond that.`,
    examples: [{ input: 'root = [5,3,6,2,4,null,7], key = 3', output: '[5,4,6,2,null,null,7] (or an equivalent valid BST)' }],
    constraints: ['0 <= number of nodes <= 10^4', '-10^5 <= Node.val, key <= 10^5', 'all Node.val unique'],
    ds: { answer: 'recursive BST search + splice/successor-copy on delete', choices: ['recursive BST search + splice/successor-copy on delete', "iterative BST search with an explicit parent pointer, then unlink the node from its parent's child slot", 'convert to a sorted array via inorder, remove the key, rebuild the tree from scratch', 'dd(list) adjacency list representation, delete the node and reconnect its neighbors'] },
    method: { answer: "BST search for key; when found with two children, copy in the ==right subtree's minimum== value, then recursively delete that value from the right subtree", choices: ["BST search for key; when found with two children, copy in the ==right subtree's minimum== value, then recursively delete that value from the right subtree", "When found with two children, copy in the left subtree's maximum value and recursively delete that value from the left subtree", "When found with two children, just promote the left child to take the deleted node's place, discarding the right subtree entirely", 'BST search for key, and once found, always remove it by swapping it with its direct parent regardless of children'] },
    code: `class Solution:
    def deleteNode(self, root: Optional[TreeNode], key: int) -> Optional[TreeNode]:
        if not root:
            return None

        if key < root.val:
            root.left = self.deleteNode(root.left, key)
        elif key > root.val:
            root.right = self.deleteNode(root.right, key)
        else:
            if not root.left:
                return root.right
            if not root.right:
                return root.left

            curr = root.right
            while curr.left:
                curr = curr.left

            root.val = curr.val
            root.right = self.deleteNode(root.right, curr.val)

        return root`,
    blanks: [17, 19, 20],
    time: { answer: 'O(h)', choices: ['O(h)', 'O(n)', 'O(log n) always', 'O(1)'], why: 'One search path down, plus a bounded walk to the successor.' },
    space: { answer: 'O(h)', choices: ['O(h)', 'O(n)', 'O(1)', 'O(log n)'], why: 'Recursion stack depth equals tree height.' },
    sayIt: "BST search for key; with two children, copy in the ==right subtree's minimum== and recursively delete that value from the right subtree. O(h)/O(h).",
    pitfall: 'Forgetting to recursively delete the copied successor leaves a duplicate.',
  },
  {
    id: 'thought:trees:path-sum', lc: 112, title: 'Path Sum', difficulty: 'Easy', category: 'trees',
    skills: ['tree-dfs'],
    companies: ['amazon', 'microsoft', 'meta'],
    statement: `Given the root of a binary tree and a target sum, decide whether the tree has a root-to-leaf path such that the values along the path add up exactly to the target.

A leaf is a node with no children. The path must start at the root and end at a leaf; it can't stop partway down.`,
    examples: [
      { input: 'root = [5,4,8,11,null,13,4,7,2], targetSum = 22', output: 'true', explanation: '5 -> 4 -> 11 -> 2 sums to 22' },
    ],
    constraints: ['0 <= number of nodes <= 5000', '-1000 <= Node.val <= 1000', '-1000 <= targetSum <= 1000'],
    ds: {
      answer: '1-D recursive DFS passing down the remaining target (no extra structure)',
      choices: ['1-D recursive DFS passing down the remaining target (no extra structure)', 'BFS queue of (node, running sum)', '2-D dp table keyed by (node, remaining)', 'stack-based iterative DFS with an explicit sum stack'],
    },
    method: {
      answer: "Top-down DFS: ==subtract root.val from the target on the way down==, and at a leaf check if ==the remaining target equals root.val==, true if either subtree succeeds",
      choices: [
        "Top-down DFS: ==subtract root.val from the target on the way down==, and at a leaf check if ==the remaining target equals root.val==, true if either subtree succeeds",
        'Bottom-up DFS: compute every root-to-leaf sum first, then check afterward if any equals targetSum',
        'BFS level by level, tracking the running sum to each node in a queue, checking leaves as they are dequeued',
        'DFS that collects every root-to-leaf path into a list first, then checks each path sum against targetSum',
      ],
    },
    code: `class Solution:
    def hasPathSum(self, root: Optional[TreeNode], targetSum: int) -> bool:
        if not root:
            return False

        if not root.left and not root.right:
            return root.val == targetSum

        remaining = targetSum - root.val
        return self.hasPathSum(root.left, remaining) or self.hasPathSum(root.right, remaining)`,
    blanks: [3, 6, 9],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(log n)', 'O(n^2)', 'O(h)'], why: 'visits every node at most once' },
    space: { answer: 'O(h)', choices: ['O(h)', 'O(n)', 'O(1)', 'O(n log n)'], why: 'recursion stack depth equals the tree height, h' },
    sayIt: 'I carry the remaining target down the recursion, subtracting each node value, and check for exactly 0 at a leaf; O(n) time, O(h) space.',
    pitfall: 'A node with only one child is NOT a leaf — must check both root.left and root.right are None before comparing.',
  },
  {
    id: 'thought:trees:minimum-absolute-difference-bst', lc: 530, title: 'Minimum Absolute Difference in BST', difficulty: 'Easy', category: 'trees',
    skills: ['bst'],
    companies: ['amazon', 'microsoft'],
    statement: `Given the root of a binary search tree, return the minimum absolute difference between the values of any two distinct nodes in the tree.

There are at least two nodes in the tree.`,
    examples: [
      { input: 'root = [4,2,6,1,3]', output: '1', explanation: 'the pairs (1,2), (2,3), and (3,4) each differ by 1' },
    ],
    constraints: ['2 <= number of nodes <= 10^4', '0 <= Node.val <= 10^5'],
    ds: {
      answer: '2 rolling vars (prev value, best diff) updated during an inorder traversal',
      choices: ['2 rolling vars (prev value, best diff) updated during an inorder traversal', 'list collecting every value, sorted afterward', 'min-heap of all node values', '1-D dp array indexed by node depth'],
    },
    method: {
      answer: "Inorder traversal visits BST nodes in ==sorted order==, so the minimum difference is always between ==two values adjacent in that inorder sequence==, track a running previous value and update the best gap as you go",
      choices: [
        "Inorder traversal visits BST nodes in ==sorted order==, so the minimum difference is always between ==two values adjacent in that inorder sequence==, track a running previous value and update the best gap as you go",
        'Collect all values into a list via any traversal, sort it, then scan for the minimum adjacent gap',
        "Preorder traversal comparing each node directly to its parent's value",
        'For each node, binary-search the rest of the tree for its closest value and take the global min',
      ],
    },
    code: `class Solution:
    def getMinimumDifference(self, root: Optional[TreeNode]) -> int:
        prev = None
        best = math.inf

        def inorder(node):
            nonlocal prev, best
            if not node:
                return

            inorder(node.left)

            if prev is not None:
                best = min(best, node.val - prev)
            prev = node.val

            inorder(node.right)

        inorder(root)
        return best`,
    blanks: [10, 13, 16],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(h)', 'O(n^2)'], why: 'a single inorder visit of every node' },
    space: { answer: 'O(h)', choices: ['O(h)', 'O(n)', 'O(1)', 'O(n log n)'], why: 'recursion depth only, no extra list of values' },
    sayIt: 'Inorder gives BST values in sorted order for free, so I just track the previous value and keep the running min gap; O(n) time, O(h) space.',
    pitfall: 'Must guard prev is not None for the very first visited node, or the first comparison breaks.',
  },
  {
    id: 'thought:trees:all-nodes-distance-k', lc: 863, title: 'All Nodes Distance K in Binary Tree', difficulty: 'Medium', category: 'trees',
    skills: ['tree-bfs', 'graph-bfs'],
    companies: ['amazon', 'meta'],
    statement: `Given the root of a binary tree, a target node within that tree, and an integer k, return the values of all nodes that are exactly distance k from target.

Distance means the number of edges on the path between two nodes, and that path can go up through ancestors as well as down through descendants. You may return the values in any order.`,
    examples: [
      { input: 'root = [3,5,1,6,2,0,8,null,null,7,4], target = 5, k = 2', output: '[7,4,1]', explanation: "7 and 4 are target's grandchildren, 1 is target's sibling via the shared parent" },
    ],
    constraints: ['1 <= number of nodes <= 500', 'all node values are unique', '0 <= k <= 1000'],
    ds: {
      answer: 'dict mapping each node to its parent, then BFS queue treating the tree as an undirected graph',
      choices: ['dict mapping each node to its parent, then BFS queue treating the tree as an undirected graph', '2-D dp table of (node, distance)', 'DFS computing depth of every node, then filtering by |depth - target depth| == k', 'Union-Find grouping nodes within distance k'],
    },
    method: {
      answer: "Two-phase BFS: first DFS to build a ==parent pointer for every node==, then level-order BFS from target treating ==left child, right child, AND parent== as neighbors (undirected graph), stopping after k levels",
      choices: [
        "Two-phase BFS: first DFS to build a ==parent pointer for every node==, then level-order BFS from target treating ==left child, right child, AND parent== as neighbors (undirected graph), stopping after k levels",
        "Single DFS from root computing each node's distance to target directly via path reconstruction",
        'BFS from root down recording depth of every node, then separately BFS from target down its own subtree only',
        'Binary search on node depth after an inorder traversal, since BST ordering lets you binary search for distance',
      ],
    },
    code: `class Solution:
    def distanceK(self, root: TreeNode, target: TreeNode, k: int) -> List[int]:
        parent = {}

        def link(node, par):
            if not node:
                return

            parent[node] = par
            link(node.left, node)
            link(node.right, node)

        link(root, None)

        queue = deque([target])
        visited = {target}
        depth = 0

        while queue and depth < k:
            for _ in range(len(queue)):
                node = queue.popleft()
                for neighbor in (node.left, node.right, parent[node]):
                    if neighbor and neighbor not in visited:
                        visited.add(neighbor)
                        queue.append(neighbor)
            depth += 1

        return [node.val for node in queue]`,
    blanks: [8, 21, 25],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(k)', 'O(n + k)'], why: 'build parents in O(n), then BFS visits each node at most once' },
    space: { answer: 'O(n)', choices: ['O(n)', 'O(h)', 'O(k)', 'O(1)'], why: 'parent dict and visited set both scale with node count' },
    sayIt: 'I link every node to its parent first, then BFS from target treating left/right/parent all as neighbors, stopping at depth k; O(n) time.',
    pitfall: 'Forgetting the parent pointer means you can only walk down the tree, never back up toward where target came from.',
  },
  {
    id: 'thought:trees:flatten-binary-tree-to-linked-list', lc: 114, title: 'Flatten Binary Tree to Linked List', difficulty: 'Medium', category: 'trees',
    skills: ['tree-dfs', 'stack'],
    companies: ['microsoft', 'meta', 'amazon'],
    statement: `You're given the root of a binary tree. Flatten it in place into a "linked list" that follows the same shape as a preorder traversal: every node's left child becomes null, and its right child points to the next node in preorder order.

You must do this in place, modifying the tree's own pointers rather than building a new structure.

The final right-chain, read from the root, should list every node in the same order a preorder traversal would visit them.`,
    examples: [
      { input: 'root = [1,2,5,3,4,null,6]', output: '[1,null,2,null,3,null,4,null,5,null,6]', explanation: 'preorder visits 1,2,3,4,5,6, so the flattened chain follows that same order via right pointers only' },
    ],
    constraints: ['the number of nodes is in the range [0, 2000]', '-100 <= Node.val <= 100'],
    ds: {
      answer: 'explicit stack doing a reverse preorder (push right child before left, so left pops first) + a prev pointer',
      choices: ['explicit stack doing a reverse preorder (push right child before left, so left pops first) + a prev pointer', 'recursion returning the tail node of the flattened subtree', 'queue doing level-order traversal, re-linking nodes level by level', 'Morris traversal threading the right subtree into the predecessor, no stack'],
    },
    method: {
      answer: "Iterative preorder with an explicit stack: ==push the right child, then the left child==, so left is processed first (true preorder order); after popping each node, rewire the PREVIOUS node's pointers so ==prev.left = None, prev.right = node==, then advance prev to the current node",
      choices: [
        'Recursively flatten the left and right subtrees first, then splice the flattened left subtree between the root and the flattened right subtree',
        "Morris-style: for each node with a left child, find that left subtree's rightmost node and thread the original right subtree onto it, then move left into right",
        "Iterative preorder with an explicit stack: ==push the right child, then the left child==, so left is processed first (true preorder order); after popping each node, rewire the PREVIOUS node's pointers so ==prev.left = None, prev.right = node==, then advance prev to the current node",
        'BFS level by level, collecting nodes into a list, then rebuilding a right-only chain from that list',
      ],
    },
    code: `class Solution:
    def flatten(self, root: Optional[TreeNode]) -> None:
        prev = None
        stack = [root] if root else []

        while stack:
            node = stack.pop()
            if node.right:
                stack.append(node.right)
            if node.left:
                stack.append(node.left)

            if prev:
                prev.left = None
                prev.right = node

            prev = node`,
    blanks: [10, 13, 14],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(h)'], why: 'every node is pushed and popped from the stack exactly once' },
    space: { answer: 'O(n)', choices: ['O(n)', 'O(h)', 'O(1)', 'O(log n)'], why: 'the stack can hold up to O(n) nodes since both children get pushed' },
    sayIt: "Iterative preorder stack, ==push right then left== so left pops first, rewire ==prev.right = node, prev.left = None== after each pop, O(n) time, O(n) space for the stack.",
    pitfall: "Must null out prev.left after rewiring, or the old left subtree stays attached as a dangling branch.",
  },
  {
    id: 'thought:trees:bst-iterator', lc: 173, title: 'Binary Search Tree Iterator', difficulty: 'Medium', category: 'trees',
    skills: ['bst', 'stack'],
    companies: ['meta', 'microsoft', 'google'],
    statement: `Design an iterator over a BST's in-order traversal. The constructor takes the root; next() returns the next smallest number, and hasNext() reports whether a next number exists.

Both next() and hasNext() must run in O(1) average time per call, using O(h) memory overall where h is the tree's height, even though the tree could have many more nodes than that.

You should not simply build the full sorted list of values up front; the point is to produce them lazily, one at a time.`,
    examples: [
      { input: 'root = [7,3,15,null,null,9,20]; next(), next(), hasNext(), next(), hasNext(), next(), hasNext(), next(), hasNext()', output: '3, 7, true, 9, true, 15, true, 20, false', explanation: 'calls return values in sorted order: 3, 7, 9, 15, 20' },
    ],
    constraints: ['the number of nodes is in the range [1, 10^5]', '0 <= Node.val <= 10^6', 'at most 10^5 calls total to hasNext and next'],
    ds: {
      answer: 'explicit stack holding the left spine (controlled/iterative inorder traversal)',
      choices: ['explicit stack holding the left spine (controlled/iterative inorder traversal)', 'flatten the whole tree into a sorted list up front, then walk it with an index', 'queue doing level-order traversal, filtering out-of-order values on the fly', 'recursion with a generator/yield doing true inorder traversal'],
    },
    method: {
      answer: "Controlled recursion: push the entire left spine onto a stack in __init__, so the top of the stack is always the next smallest unvisited node; ==next() pops that node, then pushes the left spine of its right child==, giving each node amortized O(1) work overall",
      choices: [
        'Precompute a full sorted list of every value with one inorder traversal in __init__, then next() just increments an index',
        'Use a generator-based inorder traversal and call next() on it each time',
        "Controlled recursion: push the entire left spine onto a stack in __init__, so the top of the stack is always the next smallest unvisited node; ==next() pops that node, then pushes the left spine of its right child==, giving each node amortized O(1) work overall",
        'Store only the root and re-traverse from scratch on every next() call',
      ],
    },
    code: `class BSTIterator:
    def __init__(self, root: Optional[TreeNode]):
        self.stack = []
        self._pushLeft(root)

    def _pushLeft(self, node):
        while node:
            self.stack.append(node)
            node = node.left

    def next(self) -> int:
        node = self.stack.pop()
        self._pushLeft(node.right)
        return node.val

    def hasNext(self) -> bool:
        return len(self.stack) > 0`,
    blanks: [7, 8, 12],
    time: { answer: 'O(1) amortized', choices: ['O(1) amortized', 'O(h)', 'O(n)', 'O(log n)'], why: 'each node is pushed and popped exactly once across all calls, O(n) total work spread over n calls' },
    space: { answer: 'O(h)', choices: ['O(h)', 'O(n)', 'O(1)', 'O(log n)'], why: 'the stack holds at most one left spine, bounded by the tree height' },
    sayIt: "Stack holds the ==left spine==; next() pops the smallest, then pushes the left spine of ==its right child==, so work amortizes to O(1) per call even though a single next() can do up to O(h) work, O(h) space.",
    pitfall: "Forgetting to push the left spine of the popped node's right child means later nodes get skipped entirely.",
  },
  {
    id: 'thought:trees:count-complete-tree-nodes', lc: 222, title: 'Count Complete Tree Nodes', difficulty: 'Medium', category: 'trees',
    skills: ['bst', 'tree-dfs'],
    companies: ['google', 'amazon'],
    statement: `You're given the root of a complete binary tree: every level is completely filled except possibly the last, which is filled from left to right.

Count the total number of nodes, faster than a plain O(n) traversal would, by exploiting the fact that the tree is complete.`,
    examples: [
      { input: 'root = [1,2,3,4,5,6]', output: '6', explanation: 'all 6 nodes are counted; the tree is complete since the last level fills left to right' },
    ],
    constraints: ['the number of nodes is in the range [0, 5 * 10^4]', '0 <= Node.val <= 5 * 10^4', 'the tree is guaranteed to be complete'],
    ds: {
      answer: 'two height-probing helpers (leftmost spine height, rightmost spine height) + recursion',
      choices: ['two height-probing helpers (leftmost spine height, rightmost spine height) + recursion', 'plain BFS level-order traversal counting every node', '1-D dp array indexed by depth, counting nodes per level', 'binary search directly over node indices in an implicit array representation'],
    },
    method: {
      answer: "At each node, compute both ==leftHeight (walking all-left) and rightHeight (walking all-right)==; if they're equal the subtree is a PERFECT tree, so its count is ==(1 << height) - 1== in O(1); otherwise recurse into both children and add 1 for the current node",
      choices: [
        'Plain recursive node count: 1 + count(left) + count(right), with no height shortcut (always O(n))',
        'BFS counting nodes level by level until a level comes back incomplete, binary-searching within that last level only',
        'Treat the tree as an implicit heap array and binary search for the largest valid 1-indexed position',
        "At each node, compute both ==leftHeight (walking all-left) and rightHeight (walking all-right)==; if they're equal the subtree is a PERFECT tree, so its count is ==(1 << height) - 1== in O(1); otherwise recurse into both children and add 1 for the current node",
      ],
    },
    code: `class Solution:
    def countNodes(self, root: Optional[TreeNode]) -> int:
        if not root:
            return 0

        def leftHeight(node):
            height = 0
            while node:
                height += 1
                node = node.left
            return height

        def rightHeight(node):
            height = 0
            while node:
                height += 1
                node = node.right
            return height

        left, right = leftHeight(root), rightHeight(root)
        if left == right:
            return (1 << left) - 1

        return 1 + self.countNodes(root.left) + self.countNodes(root.right)`,
    blanks: [19, 21, 23],
    time: { answer: 'O(log^2 n)', choices: ['O(log^2 n)', 'O(n)', 'O(log n)', 'O(n log n)'], why: 'height probes cost O(log n) and happen O(log n) times down the recursion' },
    space: { answer: 'O(log n)', choices: ['O(log n)', 'O(n)', 'O(1)', 'O(log^2 n)'], why: 'recursion depth is bounded by the tree height' },
    sayIt: "Compare ==leftHeight vs rightHeight==: equal means a perfect subtree, count it in O(1) via ==(1<<height)-1==; otherwise recurse both sides, O(log^2 n) time beats the naive O(n).",
    pitfall: "This only beats O(n) because of the height shortcut — skipping it degrades to a plain O(n) traversal.",
  },
]

export default { id: 'trees', title: 'Trees & BST', icon: 'tree', items }
