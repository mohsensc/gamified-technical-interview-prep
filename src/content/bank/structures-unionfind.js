const rotate = (choices, answer, shift) => {
  const n = choices.length
  const rotated = choices.map((_, j) => choices[(j + shift) % n])
  return { choices: rotated, answer: ((answer - shift) % n + n) % n }
}

const mcqRows = [
  ['union-find', 1, 'Number of Provinces (cities connected if directly or indirectly linked, given an adjacency matrix): union-find approach?', null, ['Union every pair regardless of the matrix', 'Union i and j whenever matrix[i][j] == 1, then count distinct roots', 'Sort cities by index', 'Requires a heap of distances'], 1, 'Each direct connection merges two components; the final distinct-root count is the number of provinces.'],
  ['union-find', 2, 'Redundant Connection (n nodes, n edges, exactly one edge creates a cycle — return it): how does union-find find it?', null, ['The first edge processed', 'The first edge whose two endpoints are ALREADY in the same component (union would be a no-op / "already connected")', 'The edge with the largest node labels', 'The last edge in the input'], 1, 'An edge connecting two already-connected nodes is exactly what closes the cycle.'],
  ['union-find', 2, 'Path compression in find(x) means…', null, ['Sorting the component by size', 'After finding the root, re-point x (and every node visited along the way) directly at that root', 'Deleting the component', 'Merging with a random other component'], 1, 'Flattening the tree on every find keeps future lookups fast.'],
  ['union-find', 2, 'Union by rank/size means…', null, ['Always attach the first argument\'s tree under the second', 'Attach the SMALLER tree\'s root under the LARGER tree\'s root, to keep overall tree height low', 'Pick a random root to be the new parent', 'Rebuild the whole structure after every union'], 1, 'Keeping the bigger tree as the new root avoids repeatedly growing the same chain taller.'],
  ['union-find', 2, 'Union-find with NEITHER path compression NOR union by rank: worst-case find(x) cost?', null, ['O(1)', 'O(α(n)), still nearly constant', 'O(n) — a degenerate chain of unions can make the tree a straight line', 'O(log n) always'], 2, 'Without either optimization, unioning in a bad order (always attaching to the same end) builds a linked-list-shaped tree.'],
  ['union-find', 2, 'Union-find WITH both path compression and union by rank: amortized cost per operation over m operations?', null, ['O(log n)', 'O(α(n)), the inverse Ackermann function — effectively constant for any realistic n', 'O(n)', 'O(m log n)'], 1, 'This is one of the few data structures with a provably sub-logarithmic (practically O(1)) amortized bound.'],
  ['union-find', 2, 'Graph Valid Tree (n nodes, given edges — is it exactly one tree?): the two conditions to verify?', null, ['Just count the edges', 'Exactly n - 1 edges, AND no union ever fails because its two endpoints were already connected (no cycle)', 'All nodes have the same degree', 'The graph must be a complete graph'], 1, 'A tree on n nodes has exactly n-1 edges and no cycles; union-find catches a cycle the moment an edge tries to connect an already-connected pair.'],
  ['union-find', 2, 'Accounts Merge (merge accounts that share any email, same person): what do you union?', null, ['Account indices directly by owner name', "Every email within one account together, treating each distinct email as a DSU key", 'Only the first email of each account', 'Nothing, this needs a trie instead'], 1, 'Two accounts sharing even one email must be the same component; unioning every email within an account, plus linking shared emails across accounts, finds all merges.'],
  ['union-find', 2, 'Smallest String With Swaps (pairs of indices are swappable any number of times): algorithm after union-find groups indices into components?', null, ['Leave each component unchanged', 'Within each connected component, collect the characters, sort them, and place them back into the component\'s sorted index positions', 'Reverse each component', 'Swap only directly connected pairs once'], 1, 'Any permutation is reachable within a connected component (since swaps can chain), so the lexicographically smallest arrangement sorts each component\'s characters into its sorted index slots.'],
  ['union-find', 2, 'Satisfiability of Equality Equations ("a==b", "b!=c", ...): processing order and check?', null, ['Process all equations in given order, single pass', 'First union every "==" pair, THEN check every "!=" pair has find(a) != find(b)', 'First process "!=" pairs, then "=="', 'Order never matters'], 1, '"==" must be applied first to build full components before "!=" can correctly check for contradictions against the final groupings.'],
  ['union-find', 2, 'Number of Islands II (land cells added one at a time via positions, count islands after each addition): why is union-find a natural fit?', null, ['Because cells are removed over time', 'Because connections only ever get ADDED (never removed), matching union-find\'s one-directional merging strength', 'Because the grid is always square', 'Because it avoids needing any graph structure'], 1, 'Union-find excels at incremental connectivity where things only merge, not split; recomputing full BFS/DFS after every addition would be far more expensive.'],
  ['union-find', 2, 'Most Stones Removed with Same Row or Column (max stones removable, one per move, leaving at least one per connected group): final answer formula?', null, ['Number of stones + number of components', 'Number of stones - number of connected components (where stones sharing a row or column are unioned)', 'Number of components only', 'Number of rows plus number of columns'], 1, 'Every component can be reduced down to a single surviving stone, so removable count = total stones minus number of surviving (one per component) stones.'],
]

const mcqs = mcqRows.map(([skill, difficulty, q, code, choices, answer, why], i) => {
  const shift = (i * 2 + 1) % choices.length
  return { id: `bank-structures:mcq:unionfind:${i + 1}`, skills: [skill], difficulty, q, ...(code ? { code } : {}), ...rotate(choices, answer, shift), why }
})

const clozes = [
  { id: 'bank-structures:cloze:unionfind:1', skills: ['union-find'], title: 'Union-Find with path compression + union by size', code: `class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.size = [1] * n

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.[[find]](self.parent[x])
        return self.parent[x]

    def union(self, a, b) -> bool:
        rootA, rootB = self.find(a), self.find(b)
        if rootA == rootB:
            return [[False]]

        if self.size[rootA] < self.size[rootB]:
            rootA, rootB = rootB, rootA

        self.parent[rootB] = [[rootA]]
        self.size[rootA] += [[self.size[rootB]]]
        return True` },
  { id: 'bank-structures:cloze:unionfind:2', skills: ['union-find'], title: 'Redundant Connection', code: `def findRedundantConnection(edges):
    uf = UnionFind(len(edges) + 1)

    for a, b in edges:
        if not uf.union(a, [[b]]):
            return [[a, b]]

    return []` },
  { id: 'bank-structures:cloze:unionfind:3', skills: ['union-find'], title: 'Graph Valid Tree', code: `def validTree(n, edges) -> bool:
    if len(edges) != n - [[1]]:
        return False

    uf = UnionFind(n)
    for a, b in edges:
        if not uf.[[union]](a, b):
            return False

    return [[True]]` },
  { id: 'bank-structures:cloze:unionfind:4', skills: ['union-find'], title: 'Number of Provinces', code: `def findCircleNum(isConnected) -> int:
    n = len(isConnected)
    uf = UnionFind(n)

    for i in range(n):
        for j in range(i + 1, n):
            if isConnected[i][j] == [[1]]:
                uf.union(i, [[j]])

    return len({uf.[[find]](i) for i in range(n)})` },
  { id: 'bank-structures:cloze:unionfind:5', skills: ['union-find'], title: 'Accounts Merge', code: `def accountsMerge(accounts):
    emailToName = {}
    uf = UnionFind(len(accounts))
    emailToIndex = {}

    for i, account in enumerate(accounts):
        name = account[0]
        for email in account[1:]:
            emailToName[email] = name
            if email in emailToIndex:
                uf.union(i, [[emailToIndex[email]]])
            else:
                emailToIndex[email] = [[i]]

    groups = defaultdict(set)
    for email, index in emailToIndex.items():
        groups[uf.[[find]](index)].add(email)

    result = []
    for emails in groups.values():
        name = emailToName[next(iter(emails))]
        result.append([name] + sorted(emails))

    return [[result]]` },
]

const parsons = [
  { id: 'bank-structures:parsons:unionfind:1', skills: ['union-find'], title: 'Union-Find core (find + union)', lines: [
    'def find(parent, x):',
    '    if parent[x] != x:',
    '        parent[x] = find(parent, parent[x])',
    '    return parent[x]',
    'def union(parent, size, a, b):',
    '    rootA, rootB = find(parent, a), find(parent, b)',
    '    if rootA == rootB:',
    '        return False',
    '    if size[rootA] < size[rootB]:',
    '        rootA, rootB = rootB, rootA',
    '    parent[rootB] = rootA',
    '    size[rootA] += size[rootB]',
    '    return True',
  ], distractors: ['    parent[rootA] = rootB'] },
  { id: 'bank-structures:parsons:unionfind:2', skills: ['union-find'], title: 'Redundant Connection', lines: [
    'uf = UnionFind(len(edges) + 1)',
    'for a, b in edges:',
    '    if not uf.union(a, b):',
    '        return [a, b]',
    'return []',
  ], distractors: ['    if uf.union(a, b):'] },
  { id: 'bank-structures:parsons:unionfind:3', skills: ['union-find'], title: 'Graph Valid Tree', lines: [
    'if len(edges) != n - 1:',
    '    return False',
    'uf = UnionFind(n)',
    'for a, b in edges:',
    '    if not uf.union(a, b):',
    '        return False',
    'return True',
  ], distractors: ['if len(edges) != n:'] },
]

const cardData = [
  ['union-find', 'Union-Find core operations', 'find(x): follow parent pointers to the root (with path compression). union(a, b): merge the two roots (with union by rank/size).'],
  ['union-find', 'Path compression', 'After finding the root, repoint every visited node directly to it, flattening future lookups.'],
  ['union-find', 'Union by rank/size', 'Attach the smaller tree under the larger tree\'s root, keeping overall height small.'],
  ['union-find', 'Amortized complexity with both optimizations', 'O(α(n)), the inverse Ackermann function — effectively O(1) for any n you would ever encounter.'],
  ['union-find', 'Detecting a cycle while building a graph', "union(a, b) returning False (they were already in the same component) IS the cycle."],
  ['union-find', 'When union-find beats BFS/DFS', 'When edges are added incrementally over time and you need connectivity answers after each addition (no need to recompute from scratch).'],
  ['union-find', 'Graph Valid Tree conditions', 'Exactly n - 1 edges AND every union succeeds (no cycle) — both are required, neither alone is sufficient.'],
  ['union-find', 'Most Stones Removed formula', 'stones removable = total stones - number of connected components (union by shared row or column).'],
  ['union-find', 'Accounts Merge union key', 'Union every email within the same account together; two accounts sharing an email collapse into the same component.'],
  ['union-find', 'Satisfiability of Equality Equations order', 'Union every "==" pair FIRST, then check every "!=" pair has different roots — order matters.'],
]

const flashcards = cardData.map(([skill, front, back, code], i) => ({ id: `bank-structures:card:unionfind:${i + 1}`, skills: [skill], front, back, ...(code ? { code } : {}) }))

export default {
  mcqs,
  clozes,
  parsons,
  flashcards,
}
