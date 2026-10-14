import stacks from './structures-stacks.js'
import lists from './structures-lists.js'
import heaps from './structures-heaps.js'
import trees from './structures-trees.js'
import unionFind from './structures-unionfind.js'
import design from './structures-design.js'

const parts = [stacks, lists, heaps, trees, unionFind, design]

export default {
  id: 'bank-structures',
  title: 'structures',
  mcqs: parts.flatMap(part => part.mcqs || []),
  clozes: parts.flatMap(part => part.clozes || []),
  parsons: parts.flatMap(part => part.parsons || []),
  flashcards: parts.flatMap(part => part.flashcards || []),
  problems: parts.flatMap(part => part.problems || []),
}
