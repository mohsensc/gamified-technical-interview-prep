import { course, units, allModules, hrefFor } from './curriculum.js'

export const interviewLabel = 'Interview Tue 12:00'

export function interviewTime() {
  return new Date(course.deadline)
}

const unitById = Object.fromEntries(units.map(unit => [unit.id, unit]))
const tierWeight = { P0: 0, P1: 1 }
const gapScore = mod => (tierWeight[mod.gap?.tier] ?? 2) * 1000 + (mod.gap?.rank ?? 50)

const priorityOrder = allModules
  .map((mod, index) => ({ mod, index }))
  .sort((a, b) => {
    const score = entry => (entry.mod.mustLearn ? gapScore(entry.mod) : 100000 + entry.index)
    return score(a) - score(b)
  })
  .map(entry => entry.mod)

const budgetMinutes = 600

const picked = []
let spent = 0
for (const mod of priorityOrder) {
  if (spent >= budgetMinutes) break
  picked.push(mod)
  spent += mod.minutes
}

export const planBlocks = picked.map(mod => ({
  id: mod.id,
  title: mod.title,
  minutes: mod.minutes,
  skills: mod.skills,
  href: hrefFor(mod.id),
  mustLearn: mod.mustLearn,
  gap: mod.gap,
  unitId: mod.unitId,
  unitTitle: unitById[mod.unitId]?.title || '',
  unitIcon: unitById[mod.unitId]?.icon || '',
}))

export const totalPlanMinutes = planBlocks.reduce((total, block) => total + block.minutes, 0)

export default { planBlocks, totalPlanMinutes, interviewTime, interviewLabel }
