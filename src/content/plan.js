import { units, hrefFor } from './curriculum.js'

const unitById = Object.fromEntries(units.map(unit => [unit.id, unit]))

const weekDefs = [
  {
    id: 'week-1',
    title: 'Week 1 · Foundations & Arrays',
    focus: 'Big-O, constraints, prefix sums, binary search, sliding windows, two pointers, hashing',
    unitIds: ['u-complexity', 'u-arrays'],
  },
  {
    id: 'week-2',
    title: 'Week 2 · Linear Structures & Trees',
    focus: 'Stacks, queues, linked lists, tree traversal, heaps, tries, OOP design',
    unitIds: ['u-stacks', 'u-trees', 'u-oop'],
  },
  {
    id: 'week-3',
    title: 'Week 3 · Graphs',
    focus: 'DFS/BFS on graphs and grids, topological sort, union-find, shortest paths, MST',
    unitIds: ['u-graphs1', 'u-graphs2'],
  },
  {
    id: 'week-4',
    title: 'Week 4 · Paradigms & Interview Craft',
    focus: 'Backtracking, DP, greedy, intervals, narration drills, mock interviews',
    unitIds: ['u-paradigms', 'u-craft'],
  },
]

const blockFromModule = (mod, unit) => ({
  id: mod.id,
  title: mod.title,
  minutes: mod.minutes,
  skills: mod.skills,
  href: hrefFor(mod.id),
  mustLearn: mod.mustLearn,
  gap: mod.gap,
  unitId: unit.id,
  unitTitle: unit.title,
  unitIcon: unit.icon,
})

export const weeks = weekDefs.map(week => {
  const weekUnits = week.unitIds.map(id => unitById[id]).filter(Boolean)
  const modules = weekUnits.flatMap(unit => unit.modules.map(mod => blockFromModule(mod, unit)))
  const minutes = modules.reduce((sum, mod) => sum + mod.minutes, 0)
  return { id: week.id, title: week.title, focus: week.focus, minutes, modules }
})

export const planBlocks = weeks.flatMap(week => week.modules)

export const totalPlanMinutes = planBlocks.reduce((total, block) => total + block.minutes, 0)

export default { weeks, planBlocks, totalPlanMinutes }
