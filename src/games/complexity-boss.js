import { runQuiz, pick } from './_engine.js'
import { makeQuestion as constraintQuestion } from './constraint-sniper.js'
import { makeQuestion as patternQuestion } from './pattern-radar.js'
import { makeQuestion as dsQuestion } from './ds-match.js'
import { makeQuestion as bigoQuestion } from './bigo-ladder.js'
import { makeQuestion as graphQuestion } from './bfs-or-dfs.js'

const sources = [constraintQuestion, patternQuestion, dsQuestion, bigoQuestion, graphQuestion, constraintQuestion, bigoQuestion]

export function makeQuestion(level = 1) {
  const question = pick(sources)(Math.min(6, level + 1))
  return { ...question, tag: `⚔️ ${question.tag || 'Boss'}`, tagClass: 'pill-red' }
}

export default {
  id: 'complexity-boss',
  title: 'Complexity Boss',
  icon: '🐉',
  blurb: 'Everything mixed. Three lives. Beat bosses.',
  skills: ['complexity', 'constraints', 'ds-diagnosis', 'graph-bfs', 'graph-dfs'],
  mount: (container, api) => runQuiz(container, api, {
    title: 'Complexity Boss',
    icon: '🐉',
    rules: ['all games mixed', 'combos hit harder'],
    mode: 'lives',
    lives: 3,
    boss: true,
    speedMs: 12000,
    makeQuestion,
  }),
}
