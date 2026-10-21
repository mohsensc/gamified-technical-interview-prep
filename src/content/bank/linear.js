import rawMcqs from './linear-mcqs.js'
import rawClozes from './linear-clozes.js'
import parsons from './linear-parsons.js'
import flashcards from './linear-flashcards.js'
import linearProblems from './linear-problems.js'

const withIds = (items, prefix) => items.map((item, i) => (item.id ? item : { id: `${prefix}:${i + 1}`, ...item }))

const mcqs = withIds(rawMcqs, 'bank-linear:mcq')
const clozes = withIds(rawClozes, 'bank-linear:cloze')

export default {
  id: 'bank-linear',
  title: 'linear',
  mcqs,
  clozes,
  parsons,
  flashcards,
  problems: linearProblems.problems,
}
