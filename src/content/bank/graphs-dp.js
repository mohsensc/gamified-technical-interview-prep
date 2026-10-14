import graphs from './graphs-dp-graphs.js'
import dp from './graphs-dp-dp.js'
import extra from './graphs-dp-extra.js'

const parts = [graphs, dp, extra]

export default {
  id: 'bank-graphs-dp',
  title: 'graphs-dp',
  mcqs: parts.flatMap(part => part.mcqs || []),
  clozes: parts.flatMap(part => part.clozes || []),
  parsons: parts.flatMap(part => part.parsons || []),
  flashcards: parts.flatMap(part => part.flashcards || []),
}
