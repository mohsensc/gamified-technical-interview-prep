const rotate = (choices, answer, shift) => {
  const n = choices.length
  const rotated = choices.map((_, j) => choices[(j + shift) % n])
  return { choices: rotated, answer: ((answer - shift) % n + n) % n }
}

const trieRows = [
  ['trie', 1, 'A basic TrieNode in Python is usually built from…', null, ['A fixed 26-element array of children', 'A dict of children plus a boolean endOfWord flag', 'A single string', 'A heap of child nodes'], 1, 'A dict handles any character set simply, with O(1) average child lookup; endOfWord marks a complete word.'],
  ['trie', 2, 'WordDictionary.search supports "." as a wildcard for any single letter. How does "." get handled?', null, ['Skip it entirely', "DFS/backtrack into every child at that position, returning True if any branch succeeds", 'Treat it as end of word', 'Only match it against the letter "a"'], 1, 'A wildcard fans out the search across all children at that depth, unlike a normal letter which follows one path.'],
  ['trie', 2, 'WordDictionary.search worst case, word length L, many "." wildcards, alphabet size 26?', null, ['O(L)', 'O(26^L) in the worst case (every character is a wildcard)', 'O(log L)', 'O(L^2)'], 1, 'Each wildcard can branch into up to 26 children, so an all-wildcard word explores exponentially many paths.'],
  ['trie', 2, 'Word Search II (find all dictionary words present in a letter grid): why build a trie of all target words first?', null, ['Tries are required for any grid problem', 'One DFS over the grid can check all words sharing a prefix at once, instead of one DFS per word', 'It reduces grid size', 'It avoids needing DFS entirely'], 1, 'Walking the trie alongside the grid DFS shares work across every word with the same prefix.'],
  ['trie', 2, 'Word Search II optimization: after a word is found during the grid DFS, what should happen to its trie node?', null, ['Nothing, leave it', "Prune it (and empty ancestor chains) from the trie so future DFS branches stop exploring that dead end sooner", 'Delete the whole trie', 'Mark the grid cell permanently visited forever'], 1, 'Removing exhausted trie branches keeps later DFS calls from re-walking paths that can no longer produce new words.'],
  ['trie', 2, 'Replace Words (replace each sentence word with its shortest dictionary root, if any): per word, how do you search the trie?', null, ['Walk letter by letter, and stop as soon as you hit a node marked endOfWord — that prefix is the root', 'Walk the entire word always, ignoring endOfWord along the way', 'Search the whole dictionary with a set instead', 'Binary search the dictionary'], 0, 'The FIRST endOfWord hit while descending is the shortest matching root by definition.'],
  ['trie', 2, 'Longest Word in Dictionary (built one character at a time, every prefix also a word): algorithm?', null, ['Sort by length only', 'DFS/BFS the trie, only descending into children marked endOfWord, tracking the longest (ties: lexicographically smallest) path', 'Just return the longest string in the input', 'Count characters, no trie needed'], 1, 'A valid word\'s entire prefix chain must also be marked endOfWord, which a trie traversal checks naturally.'],
  ['trie', 1, 'Trie space complexity for inserting w words of total length n?', null, ['O(w * n)', 'O(n) total: shared prefixes reuse the same nodes', 'O(26^n)', 'O(w^2)'], 1, 'Each distinct character position creates at most one node; shared prefixes across words do not duplicate nodes.'],
  ['trie', 1, 'A hashset of whole words CANNOT efficiently answer which query that a trie can?', null, ['"Is this exact word present?"', '"Does any word start with this prefix?" (startsWith)', 'Both are equally easy with a set', 'Neither works with either structure'], 1, 'A set only answers exact membership in O(1); prefix queries would need scanning every word, O(total length).'],
  ['trie', 3, 'Map Sum Pairs (insert(key, val); sum of all vals whose key has a given prefix): if the same key is inserted twice with different values, what must you track?', null, ['Nothing, the trie handles it automatically', "The delta (newVal - oldVal) applied along the key's path, since a prefix-sum trie usually accumulates sums at each node", 'Reject the second insert', 'Only the most recent insert anywhere'], 1, 'Prefix sums stored at trie nodes must be corrected by the difference, not just added again, to stay accurate.'],
  ['trie', 2, 'Counting how many inserted words share a given prefix, in O(L): where do you store the running count?', null, ['In a separate hashmap of prefix strings', 'A counter on each TrieNode, incremented every time a word passes through it during insert', 'Sort all words after every insert', 'Recount by scanning every word on each query'], 1, 'Incrementing a per-node counter during insertion lets any prefix query read it directly in O(L).'],
  ['trie', 1, 'Why is a dict of children usually preferred over a fixed 26-slot array in Python tries?', null, ['Arrays are impossible in Python', 'Simpler code and it handles any character set (unicode, digits, punctuation) without wasted slots', 'Dicts are always faster', 'Arrays cannot be indexed by letter'], 1, 'A dict only allocates entries for characters actually used, at the cost of slightly more overhead per lookup than true O(1) array indexing.'],
]

const dfsRows = [
  ['tree-dfs', 2, 'Path Sum II (return every root-to-leaf path summing to target): the recursive path list needs what after each recursive call?', null, ['Nothing', 'path.pop() (undo the append) so sibling branches don\'t see this branch\'s node', 'path.clear()', 'A new list copy before appending'], 1, 'Backtracking requires removing the node after exploring it, or it would leak into unrelated branches.'],
  ['tree-dfs', 3, 'Binary Tree Maximum Path Sum (path between ANY two nodes, not necessarily through the root): what must dfs(node) return to its parent?', null, ['The best path sum found anywhere in this subtree', 'The best path sum extending upward from node through ONE child (clipped at 0 if negative)', 'Both children\'s sums added together', 'node.val only'], 1, 'A parent can only extend a path through one side of a child, so returning a two-sided sum upward would be invalid; the true answer (possibly using both children) is tracked in a separate global/nonlocal variable.'],
  ['tree-dfs', 2, 'In Binary Tree Maximum Path Sum, why clip a child\'s returned value at 0 (use max(0, left))?', null, ['Negative sums are impossible', "A negative contribution should simply be excluded from the path rather than dragging the sum down", 'It speeds up recursion', 'It only matters for leaves'], 1, 'If a subtree only hurts the sum, the best choice is to not include it at all.'],
  ['tree-dfs', 2, 'Flatten Binary Tree to Linked List (right-skewed, preorder order), O(1) extra space approach?', null, ['Collect preorder into a list, then rebuild', 'Reverse postorder (right, then left, then node), keeping a running "prev" pointer and rewiring node.right = prev, node.left = None', 'BFS level by level', 'Only works with O(n) space'], 1, 'Processing right subtree, then left subtree, then the node lets each node point forward to the already-flattened remainder.'],
  ['tree-dfs', 2, 'Construct Binary Tree from Inorder and Postorder Traversal: the root for the current range is found how?', null, ['The first element of inorder', "The LAST unconsumed element of postorder (processed back to front), whose position in inorder splits left/right", 'The middle of postorder', 'The first element of postorder'], 1, 'Postorder lists left, right, root — so its last unused element is always the current subtree\'s root.'],
  ['tree-dfs', 2, 'Serialize and Deserialize Binary Tree with a preorder string and None markers: why preorder (not inorder)?', null, ['Inorder alone cannot reconstruct a general binary tree, even with None markers included oddly; preorder with explicit None markers is unambiguous', 'Preorder is always faster', 'Any order works identically', 'Only postorder works'], 0, 'Preorder visits the root before its children, so a recursive decode can consume tokens in the same order they were written, with None marking an empty subtree.'],
  ['tree-dfs', 2, 'Lowest Common Ancestor of a Binary Tree (general, NOT a BST): the recursive idea?', null, ['Compare values like a BST', 'dfs(node) returns node if node is p or q, else returns the LCA found by combining left and right results: if both sides return non-null, node itself is the LCA', 'Only works with parent pointers', 'Requires sorting the tree first'], 1, 'Finding p in one subtree and q in the other means node must be where their paths split.'],
  ['tree-dfs', 1, 'Symmetric Tree (mirror image of itself): what does the helper compare?', null, ['left.val and right.val only, ignoring children', "left.left vs right.right, AND left.right vs right.left, recursively", 'left vs right as plain Python equality', 'Only tree height'], 1, 'A mirror swaps left and right at every level, so the cross-comparison must recurse into swapped pairs.'],
  ['tree-dfs', 1, 'Invert Binary Tree: the key operation at each node?', null, ['Delete one child', 'Swap node.left and node.right, then recurse into both (now-swapped) children', 'Sort children by value', 'Only swap leaf nodes'], 1, 'A full mirror requires swapping children at every level, not just the root.'],
  ['tree-dfs', 2, 'Count Good Nodes in Binary Tree (a node is "good" if no ancestor has a greater value): DFS needs to carry what extra argument?', null, ['The node\'s depth', "The maximum value seen on the path from the root to this node so far", 'A visited set', 'The total node count'], 1, 'Comparing node.val against the running max-so-far (not every individual ancestor) answers "good" in O(1) per node.'],
  ['tree-dfs', 2, 'Sum Root to Leaf Numbers (each root-to-leaf path forms a number, digits top to bottom; sum all such numbers): recursive accumulation?', null, ['Add node.val directly to a global sum at every node', 'Pass down runningValue = runningValue * 10 + node.val; at a leaf, add runningValue to the total', 'Multiply all node values together', 'Use BFS only, DFS cannot solve this'], 1, 'Each descent shifts the accumulated number one digit left before adding the new digit.'],
  ['tree-dfs', 2, 'Right Side View computed via DFS instead of BFS: traversal order and rule?', null, ['Preorder visiting left child before right; record the first node seen at a new, deeper level', 'Preorder visiting RIGHT child before left; record the first node seen at a new, deeper level', 'Inorder traversal only', 'Postorder, recording every node'], 1, 'Visiting right first means the first time a depth is reached, that node is the rightmost one visible at that level.'],
  ['tree-dfs', 3, 'Path Sum III (count paths, not necessarily from the root, summing to target, must go downward): efficient approach?', null, ['Check every pair of nodes: O(n^2)', 'DFS while maintaining a running prefix-sum hashmap (like Subarray Sum Equals K, but on a tree): O(n) time', 'Sort all root-to-leaf sums', 'BFS level by level only'], 1, 'Each node checks how many ancestors have prefixSum == currentSum - target, exactly like the array prefix-sum trick, then removes its own prefix sum when backtracking out.'],
]

const bfsRows = [
  ['tree-bfs', 2, 'Binary Tree Zigzag Level Order Traversal: how do levels alternate direction?', null, ['Reverse the whole tree first', 'BFS normally level by level, then reverse() the collected list for every other (e.g. odd-indexed) level', 'Use two separate queues always swapping', 'It cannot be done with BFS'], 1, 'Standard level-order BFS collects each level in order; simply reversing alternating levels produces the zigzag.'],
  ['tree-bfs', 1, 'Average of Levels in Binary Tree: per level, what do you compute?', null, ['Just the first value', 'sum(level) / len(level) for each level collected by BFS', 'The max value only', 'The product of all values'], 1, 'Standard BFS level collection, then a simple average per level.'],
  ['tree-bfs', 2, 'Minimum Depth of Binary Tree via BFS vs DFS: why might BFS be preferred?', null, ['BFS uses less memory always', 'BFS can return as soon as it finds the FIRST leaf, often well before exploring the whole tree', 'DFS cannot find minimum depth at all', 'They are always identical in speed'], 1, 'The first leaf BFS reaches is guaranteed to be at the minimum depth, letting it short-circuit early on wide, shallow trees.'],
  ['tree-bfs', 2, 'Populating Next Right Pointers in Each Node (PERFECT binary tree), O(1) extra space trick?', null, ['Impossible without a queue', 'Use the already-established next pointers of the CURRENT level to traverse it and link the NEXT level, no queue needed', 'Requires converting to an array first', 'Requires recursion with O(n) stack'], 1, 'Since the tree is perfect, walking the current level via .next lets you wire up every child-to-child link one level down.'],
  ['tree-bfs', 1, 'Binary Tree Level Order Traversal II asks for levels bottom-up. Simplest change to standard BFS?', null, ['BFS from every leaf upward', 'Run normal top-down level-order BFS, then reverse the final list of levels', 'Use DFS with depth tracking only', 'Sort levels by average value'], 1, 'Collecting normally and reversing the outer list at the end is simpler than reversing the traversal itself.'],
  ['tree-bfs', 2, 'Cousins in Binary Tree (same depth, different direct parents): BFS needs to track what per node?', null, ['Only the value', 'Both depth and parent reference (or parent id) for every node', 'Only depth', 'Only parent'], 1, 'Same depth alone is not enough — siblings share depth too; parent must also differ.'],
  ['tree-bfs', 2, 'Find Bottom Left Tree Value: BFS trick to get it in one pass without tracking levels explicitly?', null, ['BFS normally left-to-right; the LAST node dequeued is the answer', "BFS pushing RIGHT child before LEFT child; the last node dequeued is the bottom-left one", 'DFS only, BFS cannot solve it', 'Requires two separate BFS passes'], 1, 'Enqueuing right before left means the final value popped, by the time the queue empties, is the leftmost node of the deepest level.'],
  ['tree-bfs', 3, 'Maximum Width of Binary Tree (width includes null gaps between the leftmost and rightmost present nodes of a level): what must BFS track per node?', null, ['Only its value', 'A position index (like a complete binary tree: left child = 2*i, right child = 2*i+1), normalized per level to avoid overflow', 'Only its depth', 'Nothing extra, plain BFS suffices'], 1, 'Width is (rightmost index - leftmost index + 1) per level; indices must be re-based each level to prevent huge numbers from accumulating.'],
  ['tree-bfs', 1, 'N-ary Tree Level Order Traversal: how does the BFS loop differ from a binary tree\'s?', null, ['It is identical, N-ary trees cannot use BFS', 'Enqueue ALL of node.children (a list), not just two fixed left/right fields', 'Requires sorting children first', 'Needs a stack, not a queue'], 1, 'The structure generalizes directly: enqueue every child in the node\'s children list.'],
  ['tree-bfs', 2, 'Why can BFS use MORE memory than DFS on the same tree?', null, ['BFS is always more memory efficient', "BFS's queue can hold an entire level, up to ~n/2 nodes on a wide tree, while DFS's stack is only O(height)", 'They always use the same memory', 'DFS always uses more memory'], 1, 'A bushy, shallow tree has a huge widest level (BFS cost) but small height (DFS cost).'],
  ['tree-bfs', 2, 'Complete Binary Tree Inserter (insert the next node to keep the tree complete, in O(1) amortized): key structure?', null, ['Re-run full BFS on every insert', 'A queue/deque of nodes that still have an available child slot, refilled with each newly inserted node', 'A sorted array of all nodes', 'A trie of positions'], 1, 'Only nodes missing a child are candidates for the next insertion; keeping just those in a queue avoids rescanning the tree.'],
]

const bstRows = [
  ['bst', 1, 'Insert into a BST (recursive): base case and recursive step?', null, ['If node is None, return a new node; otherwise recurse left or right by comparing val to node.val', 'Always insert at the root', 'Insert at a random leaf', 'Requires rebalancing every insert'], 0, 'Values less than node.val go left, greater go right, landing in the correct empty spot.'],
  ['bst', 3, 'Delete Node in a BST, deleting a node with TWO children: standard approach?', null, ['Just remove it and reconnect children arbitrarily', "Replace its value with its inorder successor (min of right subtree), then delete that successor node instead", 'Replace with its parent\'s value', 'Convert the whole subtree to a sorted array'], 1, 'The inorder successor is the smallest value greater than the deleted node, preserving BST ordering when swapped in.'],
  ['bst', 2, 'Validate BST: why does comparing only node.val to its DIRECT parent fail, but passing (low, high) bounds down works?', null, ['Both approaches are equally wrong', "A deep node can violate an ancestor further up even while satisfying its immediate parent", 'Direct parent comparison is actually sufficient', 'Bounds only work on balanced trees'], 1, 'E.g. root=5, left=4, left.right=6: 6 > 4 (ok locally) but 6 > 5 violates the whole left subtree\'s bound.'],
  ['bst', 1, 'Convert Sorted Array to a height-balanced BST: recursive strategy?', null, ['Insert each element one at a time in array order', 'Pick the middle element as root, recurse on the left and right halves', 'Always use the first element as root', 'Sort is required first (already sorted, so this is a no-op anyway)'], 1, 'Splitting at the midpoint each time guarantees O(log n) height.'],
  ['bst', 2, 'Range Sum of BST (sum values in [low, high]): why is this faster than visiting every node?', null, ['It is not actually faster', 'BST ordering lets you skip entire subtrees known to be fully outside [low, high]', 'It requires sorting first', 'It uses a hashmap of all values'], 1, 'If node.val < low, the whole left subtree is < low too and can be skipped; symmetric for > high.'],
  ['bst', 2, 'Trim a Binary Search Tree to range [low, high]: if node.val < low, what should the function return?', null, ['node unchanged', 'The trimmed RIGHT subtree only (the node and its entire left subtree are discarded)', 'None, always', 'The trimmed left subtree'], 1, 'Everything in the left subtree is even smaller, so only the right subtree can possibly contain valid values.'],
  ['bst', 2, 'Two Sum IV - Input is a BST (find if two nodes sum to target): simplest O(n) approach?', null, ['Binary search for the complement of every node', 'Inorder traversal collecting values into a set, checking target - val as you go (same idea as array Two Sum)', 'Requires building a second tree', 'Only solvable in O(n^2)'], 1, 'The BST structure does not meaningfully speed this up over a plain hashset scan across all values.'],
  ['bst', 2, 'Lowest Common Ancestor of a BST: why is this easier than the general binary tree version?', null, ['It is not easier, same algorithm', "Ordering tells you which side p and q are on without searching both subtrees: O(h) time, no need to search both sides", 'BSTs have no LCA concept', 'It requires parent pointers'], 1, 'If both targets are smaller, go left; both bigger, go right; otherwise this node is the split point — no backtracking needed.'],
  ['bst', 1, 'Closest value in a BST to a target (not necessarily present): approach?', null, ['Inorder traversal collecting all values, then scan for the closest', 'Walk down from root, updating "closest" whenever a smaller difference is found, going left or right by comparison: O(h)', 'Convert to a sorted array always', 'Requires a full O(n) scan with no shortcuts'], 1, 'BST ordering guides which single branch to follow next, without needing to inspect both subtrees.'],
  ['bst', 3, 'Kth Smallest Element in a BST with FREQUENT inserts/deletes and repeated kth-smallest queries: how to beat O(h + k) per query?', null, ['Nothing can be done, O(h + k) is optimal always', 'Augment each node with its subtree size, letting a query decide left/right/this-node in O(log n) (or O(h)) using size comparisons, without any linear scan', 'Rebuild the whole tree before every query', 'Convert to an array and re-sort each time'], 1, "A subtree-size field turns 'how many nodes are smaller' into an O(1) comparison at each step down the tree."],
  ['bst', 3, 'Recover Binary Search Tree (exactly two nodes were swapped by mistake, fix without changing structure): detection method?', null, ['Compare every pair of nodes: O(n^2)', 'Inorder traversal; wherever a value is smaller than the previous one, that marks a violation — track the first and last violating nodes and swap their VALUES', 'Rebuild the tree from scratch', 'It cannot be solved in better than O(n^2)'], 1, 'A valid BST\'s inorder sequence is strictly increasing; one or two "drops" pinpoint exactly which two values to swap back.'],
  ['bst', 2, 'Why doesn\'t Python\'s standard library provide a built-in self-balancing BST?', null, ['It is impossible to implement one', "dict/set (hash-based) and sorted containers (via the bisect module on a list, or third-party libraries) usually cover the same needs without a hand-rolled balanced tree", 'BSTs are never useful in Python', 'heapq already is a balanced BST'], 1, 'Most "ordered data" needs are met by hashmaps or the bisect module; implementing AVL/red-black trees by hand is reserved for specific interview questions.'],
  ['bst', 2, 'BST Iterator supporting next() and hasNext() in O(1) amortized time, O(h) memory: core idea?', null, ['Flatten the whole tree into a list upfront: O(n) memory', 'Maintain an explicit stack pushed down the left spine; next() pops a node, then pushes its right child\'s whole left spine', 'Recompute inorder traversal from scratch on every next() call', 'Requires a queue, not a stack'], 1, 'Only the current left spine is ever on the stack, bounding memory by the tree height while still visiting nodes in sorted order one at a time.'],
]

const mcqs = trieRows.map(([skill, difficulty, q, code, choices, answer, why], i) => {
  const shift = (i * 2 + 1) % choices.length
  return { id: `bank-structures:mcq:trie:${i + 1}`, skills: [skill], difficulty, q, ...(code ? { code } : {}), ...rotate(choices, answer, shift), why }
})

const dfsMcqs = dfsRows.map(([skill, difficulty, q, code, choices, answer, why], i) => {
  const shift = (i * 2 + 1) % choices.length
  return { id: `bank-structures:mcq:treedfs:${i + 1}`, skills: [skill], difficulty, q, ...(code ? { code } : {}), ...rotate(choices, answer, shift), why }
})

const bfsMcqs = bfsRows.map(([skill, difficulty, q, code, choices, answer, why], i) => {
  const shift = (i * 2 + 1) % choices.length
  return { id: `bank-structures:mcq:treebfs:${i + 1}`, skills: [skill], difficulty, q, ...(code ? { code } : {}), ...rotate(choices, answer, shift), why }
})

const bstMcqs = bstRows.map(([skill, difficulty, q, code, choices, answer, why], i) => {
  const shift = (i * 2 + 1) % choices.length
  return { id: `bank-structures:mcq:bst:${i + 1}`, skills: [skill], difficulty, q, ...(code ? { code } : {}), ...rotate(choices, answer, shift), why }
})

const clozes = [
  { id: 'bank-structures:cloze:trie:1', skills: ['trie'], title: 'Trie insert', code: `class TrieNode:
    def __init__(self):
        self.children = [[{}]]
        self.endOfWord = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        curr = self.root
        for c in word:
            if c not in curr.children:
                curr.children[c] = [[TrieNode()]]
            curr = curr.children[c]
        curr.endOfWord = [[True]]` },
  { id: 'bank-structures:cloze:trie:2', skills: ['trie'], title: 'WordDictionary wildcard search', code: `def search(self, word: str) -> bool:
    def dfs(j, node):
        for i in range(j, len(word)):
            c = word[i]
            if c != '.':
                if c not in node.child:
                    return [[False]]
                node = node.child[c]
            else:
                for kid in node.child.[[values]]():
                    if dfs(i + 1, kid):
                        return True
                return False
        return node.[[endOfWord]]

    return dfs(0, self.root)` },
  { id: 'bank-structures:cloze:trie:3', skills: ['trie'], title: 'Replace Words', code: `def replaceWords(roots, sentence):
    trie = {}
    for root in roots:
        node = trie
        for c in root:
            node = node.setdefault(c, [[{}]])
        node['#'] = root

    def shortest(word):
        node = trie
        for c in word:
            if c not in node:
                break
            node = node[c]
            if '#' in [[node]]:
                return node['#']
        return [[word]]

    return ' '.join(shortest(w) for w in sentence.split())` },
  { id: 'bank-structures:cloze:treedfs:1', skills: ['tree-dfs'], title: 'Lowest Common Ancestor (general binary tree)', code: `def lowestCommonAncestor(root, p, q):
    if not root or root == p or root == q:
        return [[root]]

    left = lowestCommonAncestor(root.left, p, q)
    right = lowestCommonAncestor(root.right, p, q)

    if left and right:
        return [[root]]

    return left [[or]] right` },
  { id: 'bank-structures:cloze:treedfs:2', skills: ['tree-dfs'], title: 'Invert Binary Tree', code: `def invertTree(root):
    if not root:
        return None

    root.left, root.right = [[root.right]], [[root.left]]
    invertTree(root.left)
    invertTree(root.right)

    return [[root]]` },
  { id: 'bank-structures:cloze:treedfs:3', skills: ['tree-dfs'], title: 'Sum Root to Leaf Numbers', code: `def dfs(node, running):
    if not node:
        return 0

    running = running * [[10]] + node.val

    if not node.left and not node.right:
        return [[running]]

    return dfs(node.left, running) + dfs(node.[[right]], running)` },
  { id: 'bank-structures:cloze:treedfs:4', skills: ['tree-dfs'], title: 'Count Good Nodes in Binary Tree', code: `def dfs(node, maxSoFar):
    if not node:
        return 0

    good = 1 if node.val >= [[maxSoFar]] else 0
    maxSoFar = max(maxSoFar, node.[[val]])

    return good + dfs(node.left, maxSoFar) + dfs(node.right, [[maxSoFar]])` },
  { id: 'bank-structures:cloze:treebfs:1', skills: ['tree-bfs'], title: 'Average of Levels in Binary Tree', code: `def averageOfLevels(root):
    result = []
    queue = deque([root])

    while queue:
        level = []
        for _ in range(len([[queue]])):
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.[[right]])
        result.append(sum(level) / [[len]](level))

    return result` },
  { id: 'bank-structures:cloze:treebfs:2', skills: ['tree-bfs'], title: 'Minimum Depth of Binary Tree (BFS early exit)', code: `def minDepth(root):
    if not root:
        return 0

    queue = deque([(root, 1)])
    while queue:
        node, depth = queue.popleft()
        if not node.left and not node.right:
            return [[depth]]
        if node.left:
            queue.append((node.left, depth + [[1]]))
        if node.right:
            queue.append((node.right, depth + 1))` },
  { id: 'bank-structures:cloze:treebfs:3', skills: ['tree-bfs'], title: 'Populating Next Right Pointers (O(1) space)', code: `def connect(root):
    leftmost = root

    while leftmost and leftmost.left:
        head = leftmost
        while head:
            head.left.next = head.[[right]]
            if head.next:
                head.right.next = head.next.[[left]]
            head = head.next
        leftmost = leftmost.[[left]]

    return root` },
  { id: 'bank-structures:cloze:treebfs:4', skills: ['tree-bfs'], title: 'Cousins in Binary Tree', code: `def isCousins(root, x, y):
    def find(node, target, depth, parent):
        if not node:
            return None
        if node.val == target:
            return (depth, [[parent]])
        return find(node.left, target, depth + 1, node) or find(node.right, target, depth + [[1]], node)

    dx, px = find(root, x, 0, None)
    dy, py = find(root, y, 0, None)

    return dx == [[dy]] and px [[!=]] py` },
  { id: 'bank-structures:cloze:bst:1', skills: ['bst'], title: 'Validate BST (bounds)', code: `def isValidBST(node, low=float('-inf'), high=float('inf')):
    if not node:
        return True

    if not (low < node.val < [[high]]):
        return False

    return isValidBST(node.left, low, node.[[val]]) and isValidBST(node.right, node.val, [[high]])` },
  { id: 'bank-structures:cloze:bst:2', skills: ['bst'], title: 'Range Sum of BST', code: `def rangeSumBST(root, low, high):
    if not root:
        return 0

    if root.val < low:
        return rangeSumBST(root.[[right]], low, high)
    if root.val > high:
        return rangeSumBST(root.left, low, [[high]])

    return root.val + rangeSumBST(root.left, low, high) + rangeSumBST(root.[[right]], low, high)` },
  { id: 'bank-structures:cloze:bst:3', skills: ['bst'], title: 'Closest Value in a BST', code: `def closestValue(root, target):
    closest = root.val
    node = root

    while node:
        if abs(node.val - target) < abs(closest - [[target]]):
            closest = node.val
        node = node.left if target < node.[[val]] else node.[[right]]

    return closest` },
  { id: 'bank-structures:cloze:bst:4', skills: ['bst'], title: 'BST Iterator (controlled inorder)', code: `class BSTIterator:
    def __init__(self, root):
        self.stack = []
        self.pushLeft(root)

    def pushLeft(self, node):
        while node:
            self.stack.append(node)
            node = node.[[left]]

    def next(self) -> int:
        node = self.stack.[[pop]]()
        self.pushLeft(node.[[right]])
        return node.val

    def hasNext(self) -> bool:
        return len(self.stack) [[>]] 0` },
]

const parsons = [
  { id: 'bank-structures:parsons:trie:1', skills: ['trie'], title: 'Trie insert and search', lines: [
    'class TrieNode:',
    '    def __init__(self):',
    '        self.children = {}',
    '        self.endOfWord = False',
    'def insert(root, word):',
    '    curr = root',
    '    for c in word:',
    '        if c not in curr.children:',
    '            curr.children[c] = TrieNode()',
    '        curr = curr.children[c]',
    '    curr.endOfWord = True',
  ], distractors: ['    curr.endOfWord = False'] },
  { id: 'bank-structures:parsons:treedfs:1', skills: ['tree-dfs'], title: 'Lowest Common Ancestor (general binary tree)', lines: [
    'def dfs(node):',
    '    if not node or node == p or node == q:',
    '        return node',
    '    left = dfs(node.left)',
    '    right = dfs(node.right)',
    '    if left and right:',
    '        return node',
    '    return left or right',
  ], distractors: ['    return left and right'] },
  { id: 'bank-structures:parsons:treedfs:2', skills: ['tree-dfs'], title: 'Flatten Binary Tree to Linked List', lines: [
    'prev = None',
    'def dfs(node):',
    '    nonlocal prev',
    '    if not node:',
    '        return',
    '    dfs(node.right)',
    '    dfs(node.left)',
    '    node.right = prev',
    '    node.left = None',
    '    prev = node',
  ], distractors: ['    node.left = prev'] },
  { id: 'bank-structures:parsons:treebfs:1', skills: ['tree-bfs'], title: 'Zigzag Level Order Traversal', lines: [
    'result = []',
    'queue = deque([root]) if root else deque()',
    'leftToRight = True',
    'while queue:',
    '    level = []',
    '    for _ in range(len(queue)):',
    '        node = queue.popleft()',
    '        level.append(node.val)',
    '        if node.left:',
    '            queue.append(node.left)',
    '        if node.right:',
    '            queue.append(node.right)',
    '    if not leftToRight:',
    '        level.reverse()',
    '    result.append(level)',
    '    leftToRight = not leftToRight',
  ], distractors: ['    level.sort()'] },
  { id: 'bank-structures:parsons:bst:1', skills: ['bst'], title: 'Lowest Common Ancestor of a BST', lines: [
    'curr = root',
    'while curr:',
    '    if p.val < curr.val and q.val < curr.val:',
    '        curr = curr.left',
    '    elif p.val > curr.val and q.val > curr.val:',
    '        curr = curr.right',
    '    else:',
    '        return curr',
  ], distractors: ['        return None'] },
  { id: 'bank-structures:parsons:bst:2', skills: ['bst'], title: 'Insert into a BST', lines: [
    'def insertIntoBST(root, val):',
    '    if not root:',
    '        return TreeNode(val)',
    '    if val < root.val:',
    '        root.left = insertIntoBST(root.left, val)',
    '    else:',
    '        root.right = insertIntoBST(root.right, val)',
    '    return root',
  ], distractors: ['        root.left = insertIntoBST(root.right, val)'] },
  { id: 'bank-structures:parsons:treedfs:3', skills: ['tree-dfs'], title: 'Invert Binary Tree', lines: [
    'def invertTree(root):',
    '    if not root:',
    '        return None',
    '    root.left, root.right = root.right, root.left',
    '    invertTree(root.left)',
    '    invertTree(root.right)',
    '    return root',
  ], distractors: ['    root.left, root.right = root.left, root.right'] },
  { id: 'bank-structures:parsons:treedfs:4', skills: ['tree-dfs'], title: 'Path Sum II (all root-to-leaf paths)', lines: [
    'def dfs(node, remaining, path, result):',
    '    if not node:',
    '        return',
    '    path.append(node.val)',
    '    remaining -= node.val',
    '    if not node.left and not node.right and remaining == 0:',
    '        result.append(path[:])',
    '    dfs(node.left, remaining, path, result)',
    '    dfs(node.right, remaining, path, result)',
    '    path.pop()',
  ], distractors: ['    result.append(path)'] },
  { id: 'bank-structures:parsons:treebfs:2', skills: ['tree-bfs'], title: 'Average of Levels in Binary Tree', lines: [
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
    '    result.append(sum(level) / len(level))',
    'return result',
  ], distractors: ['    result.append(sum(level))'] },
  { id: 'bank-structures:parsons:treebfs:3', skills: ['tree-bfs'], title: 'Find Bottom Left Tree Value', lines: [
    'queue = deque([root])',
    'node = root',
    'while queue:',
    '    node = queue.popleft()',
    '    if node.right:',
    '        queue.append(node.right)',
    '    if node.left:',
    '        queue.append(node.left)',
    'return node.val',
  ], distractors: ['return queue[-1].val'] },
  { id: 'bank-structures:parsons:bst:3', skills: ['bst'], title: 'Validate BST (bounds)', lines: [
    "def isValidBST(node, low=float('-inf'), high=float('inf')):",
    '    if not node:',
    '        return True',
    '    if not (low < node.val < high):',
    '        return False',
    '    return isValidBST(node.left, low, node.val) and isValidBST(node.right, node.val, high)',
  ], distractors: ['    return isValidBST(node.left, node.val, high) and isValidBST(node.right, low, node.val)'] },
  { id: 'bank-structures:parsons:bst:4', skills: ['bst'], title: 'Closest Value in a BST', lines: [
    'closest = root.val',
    'node = root',
    'while node:',
    '    if abs(node.val - target) < abs(closest - target):',
    '        closest = node.val',
    '    node = node.left if target < node.val else node.right',
    'return closest',
  ], distractors: ['    node = node.right if target < node.val else node.left'] },
]

const cardData = [
  ['trie', ['TrieNode shape'], 'A dict of children (char -> TrieNode) plus a boolean endOfWord flag.'],
  ['trie', ['WordDictionary "." wildcard'], 'Fan out: try every child at that position via DFS/backtracking instead of following one fixed character.'],
  ['trie', ['Word Search II trie pruning'], "After a word is fully matched during grid DFS, delete it (and now-empty ancestor nodes) from the trie so future searches skip that dead branch."],
  ['trie', ['Replace Words key rule'], 'Walk the trie letter by letter; the FIRST endOfWord hit is the shortest valid root — stop there.'],
  ['trie', ['Trie space complexity'], 'O(total characters across all inserted words): shared prefixes reuse existing nodes instead of duplicating them.'],
  ['trie', ['Map Sum Pairs re-insert'], 'Store the delta (newVal - oldVal) along the path when a key is inserted again, not the raw new value.'],
  ['tree-dfs', ['Tree DFS recursion contract'], 'State in one sentence what dfs(node) returns before writing any code; every base case and combine step follows from it.'],
  ['tree-dfs', ['Binary Tree Maximum Path Sum trick'], 'dfs returns the best ONE-SIDED extension (clipped at 0); the true answer (possibly using both sides) updates a separate running best.'],
  ['tree-dfs', ['Flatten to Linked List, O(1) space'], 'Recurse right, then left, then rewire node.right = prev and prev = node — a reversed postorder walk.'],
  ['tree-dfs', ['Build tree from inorder + postorder'], "Postorder's last unconsumed element is always the current subtree's root; find it in inorder to split left/right."],
  ['tree-dfs', ['Serialize/deserialize with None markers'], 'Preorder string with explicit "null" tokens lets decode consume tokens in the exact order they were written.'],
  ['tree-dfs', ['Path Sum III approach'], 'DFS with a running prefix-sum count (hashmap), same trick as Subarray Sum Equals K, but walked top-down on the tree and undone on backtrack.'],
  ['tree-dfs', ['Count Good Nodes extra state'], 'Pass the max value seen on the path so far; a node is good if its value >= that running max.'],
  ['tree-bfs', ['Populate Next Right Pointers, O(1) space'], 'On a perfect tree, use the current level\'s already-set next pointers to walk it and link the next level — no queue required.'],
  ['bit', ['Counting Bits for 0..n in O(n)?'], 'bits[i] = bits[i >> 1] + (i & 1). Reuse the answer for i with its last bit dropped.'],
  ['tree-bfs', ['Cousins in Binary Tree needs'], 'Track BOTH depth and parent per node — equal depth alone does not rule out siblings.'],
  ['tree-bfs', ['Maximum Width of Binary Tree'], 'Number nodes as in a complete tree (2*i, 2*i+1); width = last index - first index + 1 per level, re-based to avoid overflow.'],
  ['tree-bfs', ['BFS memory vs DFS memory'], 'BFS queue can hold an entire level (up to ~n/2 on a bushy tree); DFS stack is bounded by height. Either can be worse depending on tree shape.'],
  ['tree-bfs', ['N-ary tree BFS difference'], 'Enqueue every element of node.children, not two fixed left/right fields.'],
  ['bst', ['Validate BST correctly'], 'Pass (low, high) bounds down recursively (or check the inorder sequence is strictly increasing) — comparing only to the direct parent is not enough.'],
  ['bst', ['Delete Node, two-children case'], "Replace the node's value with its inorder successor (min of right subtree), then delete that successor instead."],
  ['bst', ['LCA of a BST shortcut'], 'Ordering tells you which single side to descend into — no need to search both subtrees like the general tree version.'],
  ['bst', ['Range Sum of BST pruning'], 'If node.val < low, skip the whole left subtree; if node.val > high, skip the whole right subtree.'],
  ['bst', ['Recover Binary Search Tree'], 'Inorder traversal should be strictly increasing; track the first and last place it drops, then swap those two VALUES back.'],
  ['bst', ['BST Iterator memory bound'], 'An explicit stack holding only the current left spine gives O(h) memory and O(1) amortized next().'],
  ['bst', ['Convert Sorted Array to BST'], 'Recurse on the middle element as root, left half and right half as subtrees, guaranteeing O(log n) height.'],
  ['bst', ['Kth smallest with frequent queries'], 'Augment nodes with subtree size so "how many nodes are smaller" is an O(1) comparison at each step, avoiding a full inorder re-walk.'],
]

const flashcards = cardData.map(([skill, frontArr, back, code], i) => ({ id: `bank-structures:card:trees:${i + 1}`, skills: [skill], front: frontArr[0], back, ...(code ? { code } : {}) }))

const problems = [
  {
    id: 'bank-structures:problem:1268', lc: 1268, title: 'Search Suggestions System', difficulty: 'Medium',
    skills: ['trie', 'binary-search'], pattern: 'Trie with top-3 per node (or sort + bisect)', ds: ['trie', 'list'],
    constraints: '1 ≤ products ≤ 1000, searchWord ≤ 1000 chars, return up to 3 lexicographic matches per prefix', time: 'O(n log n + L²)', space: 'O(1) extra',
    insight: 'Sorted words with a shared prefix are contiguous, so binary search the prefix and read the next three.',
    signals: ['suggest after each typed character', 'up to three lexicographically smallest', 'prefix of product names'],
    narration: ['Sort the products once.', 'After each typed letter, bisect_left for the current prefix.', 'Take the next three words and keep those that start with the prefix.', 'A trie storing three words per node does the same without bisect.'],
    solution: `class Solution:
    def suggestedProducts(self, products, searchWord):
        products.sort()
        result = []
        prefix = ''
        for ch in searchWord:
            prefix += ch
            i = bisect_left(products, prefix)
            result.append([word for word in products[i:i + 3] if word.startswith(prefix)])
        return result`,
    pitfalls: ['The three words after the bisect point may not all share the prefix, so filter', 'Forgetting to sort first breaks the contiguity'],
  },
  {
    id: 'bank-structures:problem:421', lc: 421, title: 'Maximum XOR of Two Numbers in an Array', difficulty: 'Medium',
    skills: ['trie', 'bit'], pattern: 'Trie of bits, greedy opposite bit', ds: ['trie'],
    constraints: '1 ≤ n ≤ 2·10^5, 0 ≤ nums[i] ≤ 2^31 - 1', time: 'O(31n)', space: 'O(31n)',
    insight: 'Store every number in a binary trie, then for each number walk down choosing the opposite bit whenever it exists; higher bits matter most.',
    signals: ['maximum XOR of any pair', 'values up to 2^31', 'n squared is too slow'],
    narration: ['Insert each number into a trie from bit 30 down to 0.', 'For each number, at every bit prefer the child with the opposite bit.', 'If it exists, that XOR bit is 1 and we step there; otherwise step the same way.', 'Track the best XOR over all numbers.'],
    solution: `class Solution:
    def findMaximumXOR(self, nums):
        root = {}
        for num in nums:
            node = root
            for bit in range(30, -1, -1):
                node = node.setdefault((num >> bit) & 1, {})
        best = 0
        for num in nums:
            node = root
            current = 0
            for bit in range(30, -1, -1):
                want = 1 - ((num >> bit) & 1)
                if want in node:
                    current |= 1 << bit
                    node = node[want]
                else:
                    node = node[1 - want]
            best = max(best, current)
        return best`,
    companies: ['google', 'amazon'],
    pitfalls: ['A number can pair with itself (XOR 0), which is harmless', 'Walking from the lowest bit up gives the wrong priority'],
  },
  {
    id: 'bank-structures:problem:662', lc: 662, title: 'Maximum Width of Binary Tree', difficulty: 'Medium',
    skills: ['tree-bfs'], pattern: 'BFS level order with position index', ds: ['binary tree', 'deque'],
    constraints: '1 ≤ nodes ≤ 3000, width counts the null gaps between the leftmost and rightmost node of a level', time: 'O(n)', space: 'O(w)',
    insight: 'Number nodes like a heap (children 2i and 2i + 1); a level\'s width is last index - first index + 1.',
    signals: ['width includes empty positions', 'level by level', 'as if the tree were complete'],
    narration: ['Queue holds (node, index) for one level at a time.', 'Width of a level = index of last - index of first + 1.', 'Children get 2 · index and 2 · index + 1, measured from the level\'s first index to keep numbers small.', 'Keep the max width.'],
    solution: `class Solution:
    def widthOfBinaryTree(self, root):
        best = 0
        level = deque([(root, 0)])
        while level:
            base = level[0][1]
            best = max(best, level[-1][1] - base + 1)
            for _ in range(len(level)):
                node, index = level.popleft()
                if node.left:
                    level.append((node.left, 2 * (index - base)))
                if node.right:
                    level.append((node.right, 2 * (index - base) + 1))
        return best`,
    companies: ['amazon', 'google'],
    pitfalls: ['Counting only real nodes per level gives the plain level size, not the width', 'Without re-basing, indexes double each level and grow huge in other languages'],
  },
]

export default {
  mcqs: [...mcqs, ...dfsMcqs, ...bfsMcqs, ...bstMcqs],
  clozes,
  parsons,
  flashcards,
  problems,
}
