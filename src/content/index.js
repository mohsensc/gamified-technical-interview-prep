import complexity from './complexity.js'
import linear from './linear.js'
import stacksLists from './stacks-lists.js'
import trees from './trees.js'
import graphsCore from './graphs-core.js'
import graphsAdvanced from './graphs-advanced.js'
import paradigms from './paradigms.js'
import problemsA from './problems-a.js'
import problemsB from './problems-b.js'
import gaps from './gaps.js'
import algorithms from './algorithms.js'
import oop from './oop.js'
import bank from './bank/index.js'
import { companiesFor } from './companies.js'

export const topics = [gaps, complexity, graphsCore, graphsAdvanced, trees, stacksLists, oop, linear, paradigms, algorithms]
const bankModules = [problemsA, problemsB, ...bank]
const allModules = [...topics, ...bankModules]

const collect = key => allModules.flatMap(mod => (mod[key] || []).map(item => ({ ...item, topic: mod.id })))

export const lessons = collect('lessons')
export const traces = collect('traces')
export const flashcards = collect('flashcards')
export const mcqs = collect('mcqs')
export const clozes = collect('clozes')
export const parsons = collect('parsons')

const problemMap = new Map()
const problemAliases = {}
for (const problem of collect('problems')) {
  const key = problem.lc || problem.id
  const existing = problemMap.get(key)
  if (!existing) {
    problemMap.set(key, problem)
    continue
  }
  const merged = { ...problem, ...existing, companies: [...new Set([...(existing.companies || []), ...(problem.companies || [])])] }
  for (const field of Object.keys(problem)) {
    const value = existing[field]
    if (value == null || value === '' || (Array.isArray(value) && !value.length)) merged[field] = problem[field]
  }
  problemAliases[problem.id] = existing.id
  problemMap.set(key, merged)
}
const withCompanies = problem => {
  const companies = companiesFor({ ...problem, companies: problem.companies?.length ? problem.companies : undefined })
  return { ...problem, companies, google: companies.includes('google') }
}

export const problems = [...problemMap.values()].map(withCompanies).sort((a, b) => (a.lc || 9999) - (b.lc || 9999))

export const traceById = Object.fromEntries(traces.map(trace => [trace.id, trace]))
export const problemById = Object.fromEntries(problems.map(problem => [problem.id, problem]))
for (const [alias, id] of Object.entries(problemAliases)) problemById[alias] = problemById[id]
export const topicById = Object.fromEntries(topics.map(topic => [topic.id, topic]))

export const generators = allModules.flatMap(mod => mod.extras?.generators || [])

export { companyList, companyById, companiesFor, matchesCompanies } from './companies.js'
