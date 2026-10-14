import { lessons, traces, flashcards, mcqs, clozes, parsons, problems, generators } from './index.js'
import algorithmsTopic from './algorithms.js'
import gaps from './gaps.js'
import { templates as narrationTemplates } from './narration.js'

const unitDefs = [
  {
    id: 'u-complexity', title: 'Constraints & Complexity', icon: '⏱️', topics: ['complexity'],
    modules: [
      { id: 'cx-constraints', title: 'Constraints → Big-O', mustLearn: true, skills: ['constraints', 'complexity'], lessons: ['complexity:lesson:constraints', 'complexity:lesson:big-o'], algos: [] },
      { id: 'cx-recursion', title: 'Recursion, amortized & space', skills: ['complexity'], lessons: ['complexity:lesson:recursion-amortized', 'complexity:lesson:space'], algos: ['merge-sort', 'quicksort-partition'] },
      { id: 'cx-python', title: 'Python costs & picking the DS', skills: ['ds-diagnosis', 'complexity'], lessons: ['complexity:lesson:python-costs', 'stacks-lists:lesson:python-costs'], algos: ['bucket-sort'] },
    ],
  },
  {
    id: 'u-graphs1', title: 'Graphs I: DFS/BFS/Grids', icon: '🕸️', topics: ['graphs-core'],
    modules: [
      { id: 'g1-bfs-levels', title: 'BFS by levels', mustLearn: true, gap: 'bfs-levels', skills: ['graph-bfs', 'tree-bfs', 'grid', 'queue-deque'], lessons: ['gaps:bfs-levels:lesson'], algos: ['graph-bfs', 'multi-source-bfs'] },
      { id: 'g1-model', title: 'Spot & build the graph', skills: ['graph-modeling'], lessons: ['graphs-core:lesson:spot-the-graph', 'graphs-core:lesson:representations'], algos: [] },
      { id: 'g1-dfs', title: 'Graph DFS', skills: ['graph-dfs'], lessons: ['graphs-core:lesson:dfs'], algos: ['graph-dfs', 'graph-dfs-iterative'] },
      { id: 'g1-bfs', title: 'Graph BFS & fewest hops', skills: ['graph-bfs', 'queue-deque'], lessons: ['graphs-core:lesson:bfs'], algos: ['zero-one-bfs', 'bipartite'] },
      { id: 'g1-grids', title: 'Grids as graphs', skills: ['grid', 'graph-dfs', 'graph-bfs'], lessons: ['graphs-core:lesson:grids'], algos: ['flood-fill'] },
      { id: 'g1-narrate', title: 'DFS or BFS? Say it aloud', skills: ['communication', 'graph-dfs', 'graph-bfs'], lessons: ['graphs-core:lesson:choose-and-narrate'], algos: [] },
    ],
  },
  {
    id: 'u-graphs2', title: 'Graphs II: Topo, Union-Find, Weighted', icon: '🧭', topics: ['graphs-advanced'],
    modules: [
      { id: 'g2-kahn', title: 'Topological sort (Kahn)', mustLearn: true, gap: 'kahn', skills: ['topo-sort', 'graph-modeling'], lessons: ['gaps:kahn:lesson'], algos: ['topo-kahn'] },
      { id: 'g2-cycles', title: 'Cycles & DFS topo', skills: ['topo-sort', 'graph-dfs'], lessons: ['graphs-core:lesson:cycles', 'graphs-core:lesson:topo'], algos: ['cycle-directed', 'topo-dfs', 'cycle-undirected'], topics: ['graphs-core'] },
      { id: 'g2-union-find', title: 'Union-Find', skills: ['union-find'], lessons: ['graphs-advanced:lesson:union-find'], algos: ['union-find', 'tarjan-bridges'] },
      { id: 'g2-dijkstra', title: 'Dijkstra & weighted paths', skills: ['dijkstra', 'heap'], lessons: ['graphs-advanced:lesson:dijkstra', 'graphs-advanced:lesson:shortest-path-variants'], algos: ['dijkstra', 'bellman-ford', 'floyd-warshall', 'a-star'] },
      { id: 'g2-minimax', title: 'Minimax paths', mustLearn: true, gap: 'minimax-grid', skills: ['dijkstra', 'binary-search', 'grid'], lessons: ['gaps:minimax-grid:lesson', 'graphs-advanced:lesson:minimax-paths'], algos: [] },
      { id: 'g2-mst', title: 'MST & modeling', skills: ['mst', 'graph-modeling'], lessons: ['graphs-advanced:lesson:mst', 'graphs-advanced:lesson:modeling'], algos: ['prim', 'kruskal'] },
    ],
  },
  {
    id: 'u-trees', title: 'Trees & Heaps', icon: '🌳', topics: ['trees'],
    modules: [
      { id: 't-dfs', title: 'Tree DFS contract', skills: ['tree-dfs'], lessons: ['trees:lesson:dfs-contract', 'trees:lesson:orders'], algos: ['tree-dfs', 'tree-dfs-iterative', 'lca'] },
      { id: 't-bfs', title: 'Tree BFS by level', skills: ['tree-bfs', 'queue-deque'], lessons: ['trees:lesson:bfs-levels'], algos: ['tree-bfs'] },
      { id: 't-bst', title: 'BST', skills: ['bst'], lessons: ['trees:lesson:bst'], algos: ['bst-ops', 'bst-validate'] },
      { id: 't-heap', title: 'Heaps & top-k', skills: ['heap'], lessons: ['trees:lesson:heaps-tries'], algos: ['heap-top-k', 'two-heaps-median', 'k-way-merge', 'quick-select'] },
      { id: 't-trie', title: 'Tries', skills: ['trie'], lessons: [], algos: ['trie'] },
    ],
  },
  {
    id: 'u-stacks', title: 'Stacks, Queues & Linked Lists', icon: '📚', topics: ['stacks-lists'],
    modules: [
      { id: 's-mono', title: 'Monotonic stack', mustLearn: true, gap: 'mono-stack', skills: ['monotonic-stack', 'stack'], lessons: ['gaps:mono-stack:lesson', 'stacks-lists:lesson:monotonic'], algos: ['monotonic-stack'] },
      { id: 's-lists', title: 'Linked list surgery', mustLearn: true, gap: 'list-surgery', skills: ['linked-list', 'two-pointers'], lessons: ['gaps:list-surgery:lesson', 'stacks-lists:lesson:linked-list'], algos: ['reverse-linked-list', 'fast-slow-pointers', 'lru-cache'] },
      { id: 's-stack', title: 'Stack basics', skills: ['stack', 'ds-diagnosis'], lessons: ['stacks-lists:lesson:stack'], algos: [] },
      { id: 's-deque', title: 'Queues & deques', skills: ['queue-deque'], lessons: ['stacks-lists:lesson:deque'], algos: ['monotonic-deque'] },
    ],
  },
  {
    id: 'u-oop', title: 'OOP & Design', icon: '🧱', topics: ['oop'],
    modules: [
      { id: 'oop-classes', title: 'Classes & self', skills: ['communication', 'ds-diagnosis'], lessons: ['oop:lesson:classes-101', 'oop:lesson:pitfalls'], algos: [] },
      { id: 'oop-lru', title: 'LRU Cache', skills: ['linked-list', 'ds-diagnosis'], lessons: ['oop:lesson:building-blocks', 'oop:lesson:ordereddict-shortcut'], algos: [],
        readRefs: [{ ref: 'statements-b:lc146', title: 'Read & sign: LRU Cache' }, { ref: 'statements-b:lc460', title: 'Read & sign: LFU Cache' }] },
      { id: 'oop-heaps', title: 'Two-heap median & streams', skills: ['heap', 'ds-diagnosis'], lessons: ['oop:lesson:heaps-as-objects'], algos: [],
        readRefs: [{ ref: 'statements-b:lc295', title: 'Read & sign: Find Median from Data Stream' }, { ref: 'statements-b:lc703', title: 'Read & sign: Kth Largest in a Stream' }] },
      { id: 'oop-design', title: 'Design drills', skills: ['ds-diagnosis', 'trie', 'arrays-hashing', 'stack', 'queue-deque'], lessons: ['oop:lesson:design-interview-flow'], algos: [],
        readRefs: [{ ref: 'statements-b:lc208', title: 'Read & sign: Implement Trie' }, { ref: 'statements-b:lc155', title: 'Read & sign: Min Stack' }, { ref: 'statements-b:lc981', title: 'Read & sign: Time Based Key-Value Store' }] },
    ],
  },
  {
    id: 'u-arrays', title: 'Arrays, Windows, Prefix & Binary Search', icon: '📏', topics: ['linear'],
    modules: [
      { id: 'a-prefix', title: 'Prefix sum + hashmap', mustLearn: true, gap: 'prefix-hash', skills: ['prefix-sum', 'arrays-hashing'], lessons: ['gaps:prefix-hash:lesson', 'linear:lesson:prefix-sum'], algos: ['prefix-sum', 'prefix-sum-hashmap'] },
      { id: 'a-bs', title: 'Binary search & search on answer', mustLearn: true, gap: 'bs-answer', skills: ['binary-search', 'constraints'], lessons: ['gaps:bs-answer:lesson', 'linear:lesson:binary-search-answer'], algos: ['binary-search', 'bounds', 'bs-on-answer'] },
      { id: 'a-window', title: 'Sliding window counting', mustLearn: true, gap: 'window-count', skills: ['sliding-window', 'two-pointers'], lessons: ['gaps:window-count:lesson', 'linear:lesson:sliding-window'], algos: ['sliding-window-fixed', 'sliding-window-variable', 'rolling-hash'] },
      { id: 'a-design', title: 'Design with hashmap + bisect', mustLearn: true, gap: 'design-bisect', skills: ['ds-diagnosis', 'binary-search', 'arrays-hashing'], lessons: ['gaps:design-bisect:lesson'], algos: [] },
      { id: 'a-two-pointers', title: 'Two pointers & next permutation', mustLearn: true, gap: 'next-perm', skills: ['two-pointers', 'math'], lessons: ['linear:lesson:two-pointers', 'gaps:next-perm:lesson'], algos: ['two-pointers', 'palindrome-expand'] },
      { id: 'a-hashing', title: 'Hashing patterns', skills: ['arrays-hashing'], lessons: ['linear:lesson:hashing'], algos: ['hashmap-lookup', 'kadane', 'kmp'] },
    ],
  },
  {
    id: 'u-paradigms', title: 'Backtracking & DP', icon: '🧩', topics: ['paradigms'],
    modules: [
      { id: 'p-backtrack', title: 'Choose / explore / unchoose', mustLearn: true, gap: 'choose-skip', skills: ['backtracking'], lessons: ['gaps:choose-skip:lesson', 'paradigms:lesson:backtracking'], algos: ['subsets', 'permutations', 'combination-sum'] },
      { id: 'p-dp1', title: '1-D DP recipe', skills: ['dp-1d'], lessons: ['paradigms:lesson:dp-recipe', 'paradigms:lesson:recognize-dp'], algos: ['dp-1d', 'knapsack-unbounded', 'lis-n2'] },
      { id: 'p-lis', title: 'LIS in n log n', mustLearn: true, gap: 'lis-bisect', skills: ['dp-1d', 'binary-search'], lessons: ['gaps:lis-bisect:lesson'], algos: ['lis-patience'] },
      { id: 'p-dp2', title: '2-D DP tables', skills: ['dp-2d'], lessons: [], algos: ['dp-grid', 'lcs', 'edit-distance', 'knapsack-01'] },
      { id: 'p-intervals', title: 'Intervals & sweep', skills: ['intervals', 'greedy'], lessons: ['paradigms:lesson:intervals'], algos: ['merge-intervals', 'sweep-line', 'interval-scheduling'] },
      { id: 'p-greedy-bits', title: 'Greedy & bits', skills: ['greedy', 'bit', 'math'], lessons: ['paradigms:lesson:greedy', 'paradigms:lesson:bits'], algos: ['jump-game', 'bit-tricks', 'reservoir-sampling'] },
    ],
  },
  {
    id: 'u-craft', title: 'Interview Craft (narration + mock)', icon: '🎤', topics: [],
    modules: [
      { id: 'ic-read', title: 'Read & Sign', skills: ['communication', 'ds-diagnosis'], lessons: [], algos: [], extraBites: [
        { type: 'read', ref: 'drill', title: 'Signature drill: rapid-fire', minutes: 4 },
        { type: 'read', ref: 'statements-a:lc743', title: 'Read: Network Delay Time', minutes: 6 },
        { type: 'read', ref: 'statements-a:lc210', title: 'Read: Course Schedule II', minutes: 6 },
        { type: 'read', ref: 'statements-a:lc312', title: 'Read: Burst Balloons', minutes: 6 },
        { type: 'read', ref: 'statements-a:lc25', title: 'Read: Reverse Nodes in k-Group', minutes: 6 },
        { type: 'read', ref: 'statements-a:lc215', title: 'Read: Kth Largest Element in an Array', minutes: 6 },
      ] },
      { id: 'ic-framework', title: 'The 45-minute script', skills: ['communication'], lessons: [], algos: [], extraBites: [
        { type: 'mock', ref: 'framework', title: 'Clarify → plan → code → test', minutes: 5 },
        { type: 'mock', ref: 'tips', title: 'Phrases that keep you talking', minutes: 4 },
      ] },
      { id: 'ic-narrate', title: 'Narrate the templates', skills: ['communication', 'graph-dfs', 'graph-bfs'], lessons: [], algos: [], narrate: true },
      { id: 'ic-diagnose', title: 'Diagnose curated problems', skills: ['ds-diagnosis', 'constraints'], lessons: [], algos: [], curatedDiagnose: true },
      { id: 'ic-mock', title: 'Full mock', skills: ['communication'], lessons: [], algos: [], extraBites: [
        { type: 'mock', ref: 'sim', title: 'Timed mock interview', minutes: 20 },
      ] },
    ],
  },
]

const traceOverrides = {
  'graphs-core:trace:course-schedule': 'g2-cycles',
  'graphs-core:trace:course-schedule-ii': 'g2-kahn',
  'graphs-advanced:trace:alien-dictionary': 'g2-kahn',
  'graphs-advanced:trace:bipartite': 'g1-bfs',
  'graphs-advanced:trace:swim-rising-water': 'g2-minimax',
  'graphs-advanced:trace:min-effort': 'g2-minimax',
  'graphs-core:trace:clone-graph': 'g1-dfs',
  'graphs-core:trace:valid-tree': 'g1-model',
  'graphs-core:trace:components': 'g1-model',
  'graphs-core:trace:word-ladder': 'g1-bfs',
  'graphs-core:trace:islands-dfs': 'g1-grids',
  'graphs-core:trace:islands-bfs': 'g1-grids',
  'graphs-core:trace:rotting-oranges': 'g1-bfs',
  'complexity:trace:nested-loop': 'cx-constraints',
  'complexity:trace:bfs-v-plus-e': 'cx-constraints',
  'complexity:trace:binary-search': 'cx-constraints',
  'complexity:trace:two-pointers': 'cx-constraints',
  'complexity:trace:fib-naive': 'cx-recursion',
  'complexity:trace:fib-memo': 'cx-recursion',
  'trees:trace:kth-smallest': 't-bst',
  'trees:trace:trie': 't-trie',
  'stacks-lists:trace:min-stack': 's-stack',
  'stacks-lists:trace:sliding-window-max': 's-deque',
  'linear:trace:koko': 'a-bs',
  'linear:trace:trapping-rain': 'a-two-pointers',
  'linear:trace:two-sum': 'a-hashing',
  'linear:trace:longest-consecutive': 'a-hashing',
  'linear:trace:longest-substring': 'a-window',
  'linear:trace:min-window': 'a-window',
  'paradigms:trace:lis': 'p-lis',
  'paradigms:trace:coin-change': 'p-dp1',
  'paradigms:trace:unique-paths': 'p-dp2',
  'oop:trace:lru-evict': 'oop-lru',
  'oop:trace:lru-identity': 'oop-lru',
  'oop:trace:median-two-heaps': 'oop-heaps',
  'oop:trace:min-stack': 'oop-design',
  'oop:trace:kth-largest': 'oop-design',
  'oop:trace:time-map': 'oop-design',
  'oop:trace:randomized-set': 'oop-design',
  'oop:trace:trie': 'oop-design',
  'oop:trace:queue-via-stacks': 'oop-design',
  'oop:trace:browser-history': 'oop-design',
}

const mustKnowAlgos = new Set((algorithmsTopic.paths || []).find(path => path.id.endsWith('must-know'))?.algoIds || [])

const kindOf = { mcqs: 'mcq', clozes: 'cloze', parsons: 'parsons', flashcards: 'card' }
export const allItems = [
  ...mcqs.map(item => ({ ...item, kind: 'mcq' })),
  ...clozes.map(item => ({ ...item, kind: 'cloze' })),
  ...parsons.map(item => ({ ...item, kind: 'parsons' })),
  ...flashcards.map(item => ({ ...item, kind: 'card' })),
  ...generators.map(gen => ({ ...gen, kind: 'generator', topic: gen.topic || String(gen.id).split(':')[0] })),
]
export { kindOf }

const lessonById = Object.fromEntries(lessons.map(lesson => [lesson.id, lesson]))
const traceMap = Object.fromEntries(traces.map(trace => [trace.id, trace]))
export const algorithmById = Object.fromEntries((algorithmsTopic.algorithms || []).map(algo => [algo.id, algo]))
const gapBySlug = Object.fromEntries((gaps.priority || []).map(entry => [entry.slug, entry]))

const realSkills = list => (list || []).filter(skill => skill !== 'communication')

const scoreFit = (skills, topic, mod, unit) => {
  const itemSkills = realSkills(skills)
  let score = 0
  itemSkills.forEach((skill, i) => {
    const j = mod.skills.indexOf(skill)
    if (j >= 0) score += (i === 0 ? 3 : 1) * (j === 0 ? 2 : 1)
  })
  const topics = mod.topics || unit.topics
  if (topic && topics.includes(topic)) score += 1.5
  if (mod.gap) score -= 0.5
  return score
}

const flatModules = unitDefs.flatMap(unit => unit.modules.map(mod => ({ mod, unit })))
const moduleDefById = Object.fromEntries(flatModules.map(({ mod, unit }) => [mod.id, { mod, unit }]))
const gapModule = Object.fromEntries(flatModules.filter(({ mod }) => mod.gap).map(({ mod }) => [mod.gap, mod.id]))

const skillHomeModule = new Map()
for (const { mod } of flatModules) {
  mod.skills.forEach((skill, index) => {
    const existing = skillHomeModule.get(skill)
    if (!existing || index < existing.index) skillHomeModule.set(skill, { id: mod.id, index })
  })
}

const gapSlugOf = id => {
  const match = /^gaps:([^:]+):/.exec(id || '')
  return match ? match[1] : null
}

const bestModuleFor = (id, skills, topic) => {
  if (traceOverrides[id]) return traceOverrides[id]
  const slug = gapSlugOf(id)
  if (slug && gapModule[slug]) return gapModule[slug]
  let best = null
  let bestScore = -Infinity
  for (const { mod, unit } of flatModules) {
    if (unit.id === 'u-craft') continue
    const score = scoreFit(skills, topic, mod, unit)
    if (score > bestScore) {
      best = mod.id
      bestScore = score
    }
  }
  return best
}

const placedLessons = new Map()
for (const { mod } of flatModules) for (const lessonId of mod.lessons) if (lessonById[lessonId]) placedLessons.set(lessonId, mod.id)
for (const lesson of lessons) if (!placedLessons.has(lesson.id)) placedLessons.set(lesson.id, bestModuleFor(lesson.id, lesson.skills, lesson.topic))

const algoTraceIds = new Set()
const placedAlgos = new Map()
for (const { mod } of flatModules) for (const short of mod.algos) {
  const algoId = `algorithms:${short}`
  if (algorithmById[algoId]) placedAlgos.set(algoId, mod.id)
}
for (const algo of algorithmsTopic.algorithms || []) {
  if (!placedAlgos.has(algo.id)) placedAlgos.set(algo.id, bestModuleFor(algo.id, algo.skills, null))
  if (algo.traceId) algoTraceIds.add(algo.traceId)
}

const placedTraces = new Map()
for (const trace of traces) {
  if (algoTraceIds.has(trace.id)) continue
  placedTraces.set(trace.id, bestModuleFor(trace.id, trace.skills, trace.topic))
}

const itemMatchesModule = (item, mod) => {
  const slug = gapSlugOf(item.id)
  if (slug) {
    if (mod.gap === slug) return true
    if (gapModule[slug]) return false
  }
  const skills = item.skills || []
  if (!skills.length) return false
  const primary = mod.skills[0]
  if (skills[0] === primary) return true
  if (skills.includes(primary) && mod.skills.includes(skills[0])) return true
  return skillHomeModule.get(skills[0])?.id === mod.id
}

const moduleItemCache = new Map()
const moduleItems = mod => {
  if (!moduleItemCache.has(mod.id)) moduleItemCache.set(mod.id, allItems.filter(item => itemMatchesModule(item, mod)))
  return moduleItemCache.get(mod.id)
}

const moduleProblemCache = new Map()
const moduleProblems = mod => {
  if (!moduleProblemCache.has(mod.id)) {
    const gap = mod.gap ? gapBySlug[mod.gap] : null
    const anchors = new Set(gap?.anchorLc || [])
    moduleProblemCache.set(mod.id, problems.filter(problem => (problem.lc && anchors.has(problem.lc)) || itemMatchesModule(problem, mod)))
  }
  return moduleProblemCache.get(mod.id)
}

const lessonMinutes = lesson => Math.max(2, Math.min(5, Math.round((lesson.slides?.length || 4) * 0.7)))
const biteMinutes = { trace: 4, algo: 3, cards: 3, rapid: 3, quiz: 4, diagnose: 4, predict: 3, mock: 5, read: 5 }
const coreTraceLimit = 2

const buildModule = (mod, unit) => {
  const bites = []
  const add = bite => bites.push({ ...bite, id: `${mod.id}~${bite.type}~${bite.ref || bite.slot}`, moduleId: mod.id, unitId: unit.id })
  const moduleLessons = lessons.filter(lesson => placedLessons.get(lesson.id) === mod.id)
    .sort((a, b) => indexOrEnd(mod.lessons, a.id) - indexOrEnd(mod.lessons, b.id))
  const moduleTraces = traces.filter(trace => placedTraces.get(trace.id) === mod.id)
    .sort((a, b) => traceRank(a, mod) - traceRank(b, mod))
  const moduleAlgos = (algorithmsTopic.algorithms || []).filter(algo => placedAlgos.get(algo.id) === mod.id)
    .sort((a, b) => indexOrEnd(mod.algos.map(s => `algorithms:${s}`), a.id) - indexOrEnd(mod.algos.map(s => `algorithms:${s}`), b.id))
  const coreTraces = moduleTraces.slice(0, coreTraceLimit)
  const extraTraces = moduleTraces.slice(coreTraceLimit)
  const coreAlgo = moduleAlgos.find(algo => mustKnowAlgos.has(algo.id)) || (moduleTraces.length ? null : moduleAlgos[0])
  const extraAlgos = moduleAlgos.filter(algo => algo !== coreAlgo)

  const traceBite = (trace, optional) => ({ type: 'trace', ref: trace.id, title: trace.title, minutes: biteMinutes.trace, skills: realSkills(trace.skills).length ? trace.skills : mod.skills, optional })
  const algoBite = (algo, optional) => ({ type: 'algo', ref: algo.id, traceId: algo.traceId || null, title: algo.title, minutes: biteMinutes.algo, skills: algo.skills, optional })

  moduleLessons.forEach((lesson, i) => {
    add({ type: 'lesson', ref: lesson.id, title: lesson.title, minutes: lessonMinutes(lesson), skills: lesson.skills, optional: i === 0 ? false : undefined, anchor: i === 0, rank: i === 0 ? 0 : 3 })
    if (coreTraces[i]) add({ ...traceBite(coreTraces[i], i === 0 ? false : undefined), anchor: i === 0, rank: i === 0 ? 0 : 6 })
  })
  coreTraces.slice(moduleLessons.length).forEach((trace, i) => add({ ...traceBite(trace, i === 0 && !moduleLessons.length ? false : undefined), anchor: i === 0 && !moduleLessons.length, rank: 6 }))
  if (coreAlgo) add({ ...algoBite(coreAlgo, undefined), rank: 5 })

  for (const extra of mod.extraBites || []) add({ ...extra, skills: mod.skills, minutes: extra.minutes || biteMinutes.mock, slot: extra.ref, optional: false, anchor: true })
  if (mod.narrate) for (const template of narrationTemplates || []) {
    add({ type: 'mock', ref: `narrate:${template.id}`, title: `Narrate: ${template.title}`, minutes: 2, skills: template.skills || mod.skills, rank: 1 })
  }

  const items = moduleItems(mod)
  const scope = { moduleId: mod.id }
  const cards = items.filter(item => item.kind === 'card')
  const quizzable = items.filter(item => item.kind === 'mcq' || item.kind === 'generator')
  const buildable = items.filter(item => item.kind === 'cloze' || item.kind === 'parsons')
  const probs = mod.curatedDiagnose ? problems.filter(problem => (problem.companies || []).length) : moduleProblems(mod)
  if (cards.length >= 3) add({ type: 'cards', slot: 'cards', title: 'Flash cards', minutes: biteMinutes.cards, skills: mod.skills, mode: 'cards', scope, rank: 4 })
  if (quizzable.length >= 3) add({ type: 'rapid', slot: 'rapid', title: 'Rapid fire', minutes: biteMinutes.rapid, skills: mod.skills, mode: 'rapid', scope, rank: 2 })
  if (buildable.length) add({ type: 'quiz', slot: 'build', title: 'Fill & order the code', minutes: biteMinutes.quiz, skills: mod.skills, mode: 'mixed', scope: { ...scope, kinds: ['cloze', 'parsons'] }, rank: 7 })
  if (probs.length >= 2) add({ type: 'diagnose', slot: 'diagnose', title: mod.curatedDiagnose ? 'Diagnose: curated set' : 'Diagnose the problem', minutes: mod.curatedDiagnose ? 8 : biteMinutes.diagnose, skills: [...new Set(['ds-diagnosis', ...mod.skills])], mode: 'diagnose', scope: mod.curatedDiagnose ? { taggedOnly: true } : scope, rank: 3.5 })
  if (mod.curatedDiagnose) add({ type: 'rapid', slot: 'constraints', title: 'Constraint sprint', minutes: 3, skills: ['constraints', 'complexity'], mode: 'rapid', scope: { skills: ['constraints', 'complexity'] }, rank: 1 })
  if (coreTraces.length) add({ type: 'predict', slot: 'predict', ref: coreTraces[0].id, title: 'Predict the next step', minutes: biteMinutes.predict, skills: coreTraces[0].skills, mode: 'predict', scope, rank: 8 })

  for (const trace of extraTraces) add(traceBite(trace, true))
  for (const algo of extraAlgos) add(algoBite(algo, true))
  for (const read of mod.readRefs || []) add({ type: 'read', ref: read.ref, title: read.title, minutes: biteMinutes.read, skills: mod.skills, optional: true })

  const budget = mod.mustLearn ? 20 : 13
  let spent = bites.filter(bite => bite.optional === false && bite.anchor).reduce((sum, bite) => sum + bite.minutes, 0)
  const ranked = bites.filter(bite => bite.optional === undefined).sort((a, b) => corePriority(a) - corePriority(b))
  for (const bite of ranked) {
    const fits = spent + bite.minutes <= budget
    bite.optional = !fits
    if (fits) spent += bite.minutes
  }
  const coreBites = bites.filter(bite => !bite.optional)
  const minutes = coreBites.reduce((sum, bite) => sum + bite.minutes, 0)
  const checkable = items.filter(item => item.kind !== 'card').length + probs.length
  return {
    id: mod.id,
    kind: 'module',
    unitId: unit.id,
    title: mod.title,
    minutes,
    skills: mod.skills,
    mustLearn: Boolean(mod.mustLearn),
    gap: mod.gap ? { slug: mod.gap, tier: gapBySlug[mod.gap]?.tier || null, rank: gapBySlug[mod.gap]?.rank || null, why: gapBySlug[mod.gap]?.why || '' } : null,
    bites: bites.map(({ anchor, rank, ...bite }) => ({ ...bite, optional: Boolean(bite.optional) })),
    checkpoint: { itemCount: Math.max(4, Math.min(10, checkable)), passPct: 80 },
  }
}

function corePriority(bite) {
  return bite.rank ?? 9
}

function indexOrEnd(list, id) {
  const i = list.indexOf(id)
  return i < 0 ? 999 : i
}

function traceRank(trace, mod) {
  let rank = 0
  if (gapSlugOf(trace.id) && gapSlugOf(trace.id) === mod.gap) rank -= 10
  if (realSkills(trace.skills)[0] === mod.skills[0]) rank -= 3
  if ((trace.skills || []).includes('communication')) rank -= 1
  return rank
}

export const units = unitDefs.map(unit => {
  const modules = unit.modules.map(mod => buildModule(mod, unit))
  return {
    id: unit.id,
    kind: 'unit',
    title: unit.title,
    icon: unit.icon,
    minutes: modules.reduce((sum, mod) => sum + mod.minutes, 0),
    skills: [...new Set(modules.flatMap(mod => mod.skills))],
    mustLearn: modules.some(mod => mod.mustLearn),
    modules,
    checkpoint: { itemCount: 15, passPct: 80 },
  }
})

export const course = {
  id: 'course',
  kind: 'course',
  title: 'CodeCram Interview Course',
  deadline: null,
  minutes: units.reduce((sum, unit) => sum + unit.minutes, 0),
  units,
}

export const allModules = units.flatMap(unit => unit.modules)
export const allBites = allModules.flatMap(mod => mod.bites)

const nodeIndex = new Map()
nodeIndex.set(course.id, { node: course, parents: [] })
for (const unit of units) {
  nodeIndex.set(unit.id, { node: unit, parents: [course.id] })
  for (const mod of unit.modules) {
    nodeIndex.set(mod.id, { node: mod, parents: [course.id, unit.id] })
    for (const bite of mod.bites) nodeIndex.set(bite.id, { node: { ...bite, kind: 'bite' }, parents: [course.id, unit.id, mod.id] })
  }
}

export function findNode(id) {
  return nodeIndex.get(id)?.node || null
}

export function hrefFor(id) {
  const node = findNode(id)
  if (!node) return '#/course'
  if (node.kind === 'course') return '#/course'
  if (node.kind === 'bite') return `#/bite/${encodeURIComponent(id)}`
  return `#/course/${encodeURIComponent(id)}`
}

export function pathTo(id) {
  const entry = nodeIndex.get(id)
  if (!entry) return []
  return [...entry.parents, id].map(nodeId => {
    const node = findNode(nodeId)
    return { id: nodeId, kind: node.kind, title: node.title, href: hrefFor(nodeId) }
  })
}

const modulesUnder = node => {
  if (!node) return []
  if (node.kind === 'course') return allModules
  if (node.kind === 'unit') return node.modules
  if (node.kind === 'module') return [node]
  return [findNode(node.moduleId)].filter(Boolean)
}

const uniqueById = list => {
  const seen = new Set()
  return list.filter(item => !seen.has(item.id) && seen.add(item.id))
}

export function itemsForNode(id) {
  const node = findNode(id)
  if (!node) return []
  if (node.kind === 'course') return allItems
  if (node.kind === 'bite') {
    const mod = moduleDefById[node.moduleId]?.mod
    if (!mod) return []
    const pool = moduleItems(mod)
    if (node.scope?.kinds) return pool.filter(item => node.scope.kinds.includes(item.kind))
    const slug = gapSlugOf(node.ref)
    if (slug) {
      const gapItems = pool.filter(item => gapSlugOf(item.id) === slug)
      if (gapItems.length) return gapItems
    }
    const focus = realSkills(node.skills)[0]
    const focused = focus ? pool.filter(item => (item.skills || []).includes(focus)) : []
    return focused.length >= 4 ? focused : pool
  }
  return uniqueById(modulesUnder(node).flatMap(mod => moduleItems(moduleDefById[mod.id].mod)))
}

export function problemsForNode(id) {
  const node = findNode(id)
  if (!node) return []
  if (node.kind === 'course') return problems
  if (node.kind === 'module' && moduleDefById[id].mod.curatedDiagnose) return problems.filter(problem => (problem.companies || []).length)
  return uniqueById(modulesUnder(node).flatMap(mod => moduleProblems(moduleDefById[mod.id].mod)))
}

export function tracesForNode(id) {
  const node = findNode(id)
  if (!node) return []
  if (node.kind === 'bite') return node.type === 'trace' || node.type === 'predict' ? [traceMap[node.ref]].filter(Boolean) : node.traceId ? [traceMap[node.traceId]].filter(Boolean) : []
  const ids = modulesUnder(node).flatMap(mod => mod.bites.map(bite => bite.type === 'trace' ? bite.ref : bite.traceId).filter(Boolean))
  return [...new Set(ids)].map(traceId => traceMap[traceId]).filter(Boolean)
}

export function moduleForItem(itemId) {
  const item = allItems.find(entry => entry.id === itemId)
  if (!item) return null
  return allModules.find(mod => itemMatchesModule(item, moduleDefById[mod.id].mod)) || null
}

export function nextBite(afterId, { includeOptional = false } = {}) {
  const list = includeOptional ? allBites : allBites.filter(bite => !bite.optional)
  const i = list.findIndex(bite => bite.id === afterId)
  return i >= 0 ? list[i + 1] || null : null
}

export const placement = {
  lessons: Object.fromEntries(placedLessons),
  traces: Object.fromEntries(placedTraces),
  algorithms: Object.fromEntries(placedAlgos),
}
