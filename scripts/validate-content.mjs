import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')
const contentPath = rel => path.join(root, rel)

const { mcqs, clozes, parsons, flashcards, problems, topics } = await import(contentPath('src/content/index.js'))
const { loadThought } = await import(contentPath('src/content/thought/index.js'))
const { companyIds } = await import(contentPath('src/content/companies.js'))
const { skillIds } = await import(contentPath('src/content/skills.js'))
const { cheatSheets, cheatSheetGroups } = await import(contentPath('src/content/cheatsheets.js'))
const curriculum = await import(contentPath('src/content/curriculum.js'))
const { splitCloze } = await import(contentPath('src/ui/clozeParse.js'))

const companySet = new Set(companyIds)
const skillSet = new Set(skillIds)
const cheatGroupSet = new Set(cheatSheetGroups.map(group => group.id))
const difficultyLabels = new Set(['Easy', 'Medium', 'Hard'])

const listSourceFiles = dir => readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const full = path.join(dir, entry.name)
  if (entry.isDirectory()) return listSourceFiles(full)
  return entry.name.endsWith('.js') ? [full] : []
})

const sourceFiles = listSourceFiles(contentPath('src/content')).concat(listSourceFiles(contentPath('src/games'))).map(file => ({
  rel: path.relative(root, file),
  lines: readFileSync(file, 'utf8').split('\n'),
}))

const findSource = needles => {
  for (const needle of needles.filter(Boolean)) {
    for (const file of sourceFiles) {
      const index = file.lines.findIndex(line => line.includes(needle))
      if (index >= 0) return `${file.rel}:${index + 1}`
    }
  }
  return null
}

const sourceNeedles = item => [
  item.q && String(item.q).slice(0, 40),
  item.front && String(item.front).slice(0, 40),
  item.id && `'${item.id}'`,
  item.id && `"${item.id}"`,
  item.lc && `lc: ${item.lc},`,
  item.title && `title: '${item.title}'`,
  item.title && `title: "${item.title}"`,
]

const problemsFound = []

const fail = (tag, problem, fix) => {
  const item = tag.item || {}
  problemsFound.push({
    where: findSource(sourceNeedles(item)) || `src/content (module "${tag.topic || item.topic || item.category || 'unknown'}")`,
    label: `${tag.kind} ${item.id ?? item.title ?? (item.lc ? `lc ${item.lc}` : '(no id)')}`,
    problem,
    fix,
  })
}

const makeTag = (kind, item) => ({ kind, item, topic: item.topic || item.category })

const closestMatches = (value, options) => {
  const words = String(value).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
  const near = options.filter(option => words.some(word => option.includes(word) || word.includes(option)))
  return (near.length ? near : options).slice(0, 6)
}

function checkSkills(tag, skills) {
  if (skills !== undefined && !Array.isArray(skills)) {
    fail(tag, `"skills" must be a list, got ${typeof skills}.`, 'Write it as skills: [\'stack\'].')
    return
  }
  for (const skill of skills || []) {
    if (!skillSet.has(skill)) fail(tag, `Unknown skill id "${skill}".`, `Use an id from src/content/skills.js. Close ones: ${closestMatches(skill, skillIds).join(', ')}.`)
  }
}

function checkCompanies(tag, companies) {
  if (!Array.isArray(companies) || !companies.length) return false
  const bad = companies.filter(company => !companySet.has(company))
  if (bad.length) fail(tag, `Unknown company id(s): ${bad.join(', ')}.`, `Valid ids: ${companyIds.join(', ')}. See src/content/companies.js.`)
  return true
}

function checkText(tag, item, field, label = field) {
  if (typeof item[field] !== 'string' || !item[field].trim()) fail(tag, `Missing "${label}" text.`, `Add a non-empty ${label}: '...' field.`)
}

function checkMcqShape(tag, item) {
  checkText(tag, item, 'q', 'q (the question)')
  if (!Array.isArray(item.choices) || item.choices.length < 2) {
    fail(tag, 'An MCQ needs at least 2 choices.', 'Add choices: [\'first\', \'second\', ...].')
    return
  }
  if (!Number.isInteger(item.answer) || item.answer < 0 || item.answer >= item.choices.length) {
    fail(tag, `"answer" is ${JSON.stringify(item.answer)} but there are ${item.choices.length} choices.`, `Set answer to the position of the right choice, counting from 0 (0 to ${item.choices.length - 1}).`)
  }
  const normalized = item.choices.map(choice => String(choice).trim().toLowerCase())
  if (new Set(normalized).size !== normalized.length) fail(tag, 'Two choices are the same.', 'Reword or remove the duplicate choice.')
}

function checkClozeShape(tag, item) {
  if (typeof item.code !== 'string') {
    fail(tag, 'Missing "code" text.', 'Add code: `...` with at least one [[blank]].')
    return
  }
  const blanks = splitCloze(item.code, () => '').blanks
  if (blanks.length < 1) fail(tag, 'The code has no [[blank]].', 'Wrap the hidden part in double square brackets, like [[seen.add(num)]].')
  for (const alternatives of blanks) {
    if (!alternatives.length) fail(tag, 'A [[blank]] is empty.', 'Put the correct answer between the brackets.')
    for (const answer of alternatives) {
      if (answer.split('[').length !== answer.split(']').length) fail(tag, `The blank "${answer}" has unbalanced square brackets.`, 'Make sure every [ inside a blank has a matching ].')
    }
  }
}

function checkParsonsShape(tag, item) {
  if (!Array.isArray(item.lines) || item.lines.length < 3) {
    fail(tag, `A reorder item needs at least 3 lines, found ${(item.lines || []).length}.`, 'Add the full solution, one line per entry in lines: [...].')
    return
  }
  const realLines = new Set(item.lines.map(line => String(line).replace(/\s+$/, '')))
  for (const decoy of item.distractors || []) {
    if (realLines.has(String(decoy).replace(/\s+$/, ''))) fail(tag, `Distractor "${String(decoy).trim()}" is also a real line.`, 'Change the distractor so it is wrong, or remove it.')
  }
}

function checkFlashcardShape(tag, item) {
  checkText(tag, item, 'front')
  checkText(tag, item, 'back')
}

const idRegistry = new Map()
function registerId(tag, id) {
  if (id === undefined || id === null || id === '') {
    fail(tag, 'Missing "id".', 'Add a unique id: \'topic:kind:number\' field.')
    return
  }
  const existing = idRegistry.get(id)
  if (existing) fail(tag, `The id "${id}" is already used by ${existing}.`, 'Ids must be unique. Rename one of them.')
  else idRegistry.set(id, `${tag.kind} in ${findSource(sourceNeedles(tag.item)) || 'another file'}`)
}

const countsByKindAndModule = {}
function tally(kind, moduleId) {
  countsByKindAndModule[kind] ??= {}
  countsByKindAndModule[kind][moduleId] = (countsByKindAndModule[kind][moduleId] || 0) + 1
}

for (const item of mcqs) {
  const tag = makeTag('mcq', item)
  registerId(tag, item.id)
  checkSkills(tag, item.skills)
  checkMcqShape(tag, item)
  tally('mcqs', item.topic || 'unknown')
}

for (const item of clozes) {
  const tag = makeTag('fill-in', item)
  registerId(tag, item.id)
  checkSkills(tag, item.skills)
  checkClozeShape(tag, item)
  tally('clozes', item.topic || 'unknown')
}

for (const item of parsons) {
  const tag = makeTag('reorder', item)
  registerId(tag, item.id)
  checkSkills(tag, item.skills)
  checkParsonsShape(tag, item)
  tally('parsons', item.topic || 'unknown')
}

for (const item of flashcards) {
  const tag = makeTag('flashcard', item)
  registerId(tag, item.id)
  checkSkills(tag, item.skills)
  checkFlashcardShape(tag, item)
  tally('flashcards', item.topic || 'unknown')
}

for (const problem of problems) {
  const tag = makeTag('problem', problem)
  registerId(tag, problem.id)
  checkSkills(tag, problem.skills)
  checkText(tag, problem, 'title')
  if (!difficultyLabels.has(problem.difficulty)) fail(tag, `Difficulty is ${JSON.stringify(problem.difficulty)}.`, 'Use exactly Easy, Medium or Hard.')
  checkText(tag, problem, 'time')
  checkText(tag, problem, 'space')
  if (!checkCompanies(tag, problem.companies)) {
    fail(tag, 'No company tags were found.', 'Add the problem number to the table in src/content/companies.js, or give the problem companies: [\'google\'].')
  }
  tally('problems', problem.topic || 'unknown')
}

const { categories: thoughtCategories, items: thoughtItems } = await loadThought()

for (const item of thoughtItems) {
  const tag = makeTag('thought', item)
  registerId(tag, item.id)
  checkSkills(tag, item.skills)
  tally('thought', item.category || 'unknown')

  for (const field of ['ds', 'method', 'time', 'space']) {
    const value = item[field]
    if (!value || !Array.isArray(value.choices) || !value.choices.length) {
      fail(tag, `"${field}" has no choices.`, `Add ${field}: { answer: '...', choices: ['...', '...'] }.`)
      continue
    }
    if (!value.choices.includes(value.answer)) fail(tag, `${field}.answer is not one of ${field}.choices.`, 'Copy the answer text exactly (same characters) into choices.')
    const normalized = value.choices.map(choice => String(choice).trim())
    if (new Set(normalized).size !== normalized.length) fail(tag, `${field} has two identical choices.`, 'Remove or reword the duplicate.')
  }

  if (!checkCompanies(tag, item.companies)) fail(tag, 'No companies listed.', 'Add companies: [\'google\', \'amazon\'].')

  if (typeof item.code !== 'string' || !item.code.trim()) {
    fail(tag, 'Missing "code".', 'Add the full solution as code: `...`.')
    continue
  }
  const rawLines = item.code.replace(/\t/g, '    ').replace(/\s+$/, '').split('\n')
  if (!Array.isArray(item.blanks) || !item.blanks.length) {
    fail(tag, 'No blanks chosen.', 'Add blanks: [3, 7] with the line numbers to hide, counting from 0.')
  } else {
    for (const blank of item.blanks) {
      if (!Number.isInteger(blank) || blank < 0 || blank >= rawLines.length) fail(tag, `Blank line ${blank} does not exist. The code has ${rawLines.length} lines (0 to ${rawLines.length - 1}).`, 'Change blanks to line numbers inside the code, counting from 0.')
      else if (!rawLines[blank].trim()) fail(tag, `Blank line ${blank} is an empty line in the code.`, 'Point blanks at a line that has code on it.')
    }
    for (const key of Object.keys(item.accept || {})) {
      if (!item.blanks.includes(Number(key))) fail(tag, `accept key ${key} is not one of the blanks.`, 'Use only line numbers that are also in blanks.')
    }
  }
}

for (const sheet of cheatSheets) {
  const tag = { kind: 'cheatsheet', item: { id: sheet.id, title: sheet.title } }
  if (!cheatGroupSet.has(sheet.group)) fail(tag, `Unknown group "${sheet.group}".`, `Use one of: ${[...cheatGroupSet].join(', ')}.`)
  for (const [index, quizItem] of (sheet.quiz || []).entries()) {
    if (!Array.isArray(quizItem.choices) || quizItem.answer == null || quizItem.answer < 0 || quizItem.answer >= quizItem.choices.length) {
      fail(tag, `Quiz question ${index + 1}: answer index is out of range.`, 'Set answer to the position of the right choice, counting from 0.')
    }
  }
}

{
  const cheatIds = cheatSheets.map(sheet => sheet.id)
  const duplicateSheets = [...new Set(cheatIds.filter((id, index) => cheatIds.indexOf(id) !== index))]
  for (const id of duplicateSheets) fail({ kind: 'cheatsheet', item: { id } }, `Two cheat sheets share the id "${id}".`, 'Give each sheet its own id.')
}

for (const unit of curriculum.units || []) {
  for (const mod of unit.modules || []) {
    for (const skill of mod.skills || []) {
      if (!skillSet.has(skill)) fail({ kind: 'course module', item: { id: `${unit.id}/${mod.id}`, title: mod.title } }, `Unknown skill id "${skill}".`, `Use an id from src/content/skills.js. Close ones: ${closestMatches(skill, skillIds).join(', ')}.`)
    }
  }
}

const gamesDir = path.join(root, 'src/games')
const gameFiles = readdirSync(gamesDir).filter(file => file.endsWith('.js') && file !== '_engine.js')
for (const file of gameFiles) {
  const tag = { kind: 'game', item: { id: file, title: file } }
  let mod
  try {
    mod = await import(path.join(gamesDir, file))
  } catch (error) {
    fail(tag, `The file could not be loaded: ${error.message}`, 'Fix the syntax or import error named above.')
    continue
  }
  const game = mod.default
  if (!game || !game.id) {
    fail(tag, 'No default export with an id.', 'Export default { id, title, icon, blurb, skills, mount }.')
    continue
  }
  checkSkills(tag, game.skills)
  if (typeof game.mount !== 'function') fail(tag, 'The default export has no mount() function.', 'Add mount: (container, api) => runQuiz(container, api, { ... }).')
}

for (const topic of topics.filter(entry => typeof entry?.id !== 'string')) {
  fail({ kind: 'topic', item: { title: topic?.title } }, 'A topic module has no id.', 'Add id: \'my-topic\' to the exported object.')
}

console.log('Content counts')
for (const kind of ['mcqs', 'clozes', 'parsons', 'flashcards', 'problems', 'thought']) {
  const total = Object.values(countsByKindAndModule[kind] || {}).reduce((sum, count) => sum + count, 0)
  console.log(`  ${kind}: ${total}`)
}
console.log(`  games: ${gameFiles.length}`)
console.log(`  cheatsheets: ${cheatSheets.length} in ${cheatSheetGroups.length} groups`)
console.log(`  thought categories: ${thoughtCategories.length}`)

console.log('')
if (!problemsFound.length) {
  console.log('All content is valid. 0 errors.')
  process.exit(0)
}

const byFile = new Map()
for (const entry of problemsFound) {
  const key = entry.where.split(':')[0]
  byFile.set(key, [...(byFile.get(key) || []), entry])
}
for (const [file, entries] of byFile) {
  console.log(file)
  for (const entry of entries) {
    console.log(`  ${entry.where.includes(':') ? `line ${entry.where.split(':')[1]}  ` : ''}${entry.label}`)
    console.log(`    Problem: ${entry.problem}`)
    console.log(`    Fix:     ${entry.fix}`)
  }
  console.log('')
}
console.log(`${problemsFound.length} error${problemsFound.length === 1 ? '' : 's'} found. See docs/adding-problems.md for the format of each kind.`)
process.exit(1)
