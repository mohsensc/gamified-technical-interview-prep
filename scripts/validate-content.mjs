import { readdirSync } from 'node:fs'
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

const companySet = new Set(companyIds)
const skillSet = new Set(skillIds)
const cheatGroupSet = new Set(cheatSheetGroups.map(g => g.id))

const errors = []
const fail = message => errors.push(message)

const { splitCloze } = await import(contentPath('src/ui/clozeParse.js'))
const parseClozeBlanks = code => splitCloze(code, () => '').blanks

function checkSkills(tag, skills) {
  for (const s of skills || []) if (!skillSet.has(s)) fail(`${tag}: invalid skill id "${s}"`)
}

function checkMcqShape(tag, item) {
  if (!Array.isArray(item.choices) || item.choices.length < 2) {
    fail(`${tag}: mcq needs >=2 choices`)
    return
  }
  if (!Number.isInteger(item.answer) || item.answer < 0 || item.answer >= item.choices.length) {
    fail(`${tag}: mcq answer index ${item.answer} out of range (choices=${item.choices.length})`)
  }
  const normalized = item.choices.map(choice => String(choice).trim().toLowerCase())
  if (new Set(normalized).size !== normalized.length) fail(`${tag}: mcq has duplicate choices`)
}

function checkClozeShape(tag, item) {
  const blanks = parseClozeBlanks(item.code)
  if (blanks.length < 1) fail(`${tag}: cloze has 0 parsable [[blanks]]`)
  for (const alts of blanks) {
    if (!alts.length) fail(`${tag}: cloze blank has no non-empty answer`)
    for (const answer of alts) {
      if (answer.split('[').length !== answer.split(']').length) fail(`${tag}: cloze answer "${answer}" has unbalanced square brackets`)
    }
  }
}

function checkParsonsShape(tag, item) {
  if (!Array.isArray(item.lines) || item.lines.length < 3) {
    fail(`${tag}: parsons needs >=3 lines (got ${(item.lines || []).length})`)
  }
}

function checkFlashcardShape(tag, item) {
  if (!item.front || !String(item.front).trim()) fail(`${tag}: flashcard missing front`)
  if (!item.back || !String(item.back).trim()) fail(`${tag}: flashcard missing back`)
}

const idRegistry = new Map()
function registerId(kind, tag, id) {
  if (id === undefined || id === null || id === '') {
    fail(`${tag}: missing id`)
    return
  }
  const existing = idRegistry.get(id)
  if (existing) fail(`duplicate id "${id}" used by both ${existing} and ${tag} (${kind})`)
  else idRegistry.set(id, tag)
}

const countsByKindAndModule = {}
function tally(kind, moduleId) {
  countsByKindAndModule[kind] ??= {}
  countsByKindAndModule[kind][moduleId] = (countsByKindAndModule[kind][moduleId] || 0) + 1
}

for (const item of mcqs) {
  const tag = `mcq ${item.id ?? '(no id)'} [${item.topic}]`
  registerId('mcq', tag, item.id)
  checkSkills(tag, item.skills)
  checkMcqShape(tag, item)
  tally('mcqs', item.topic || 'unknown')
}

for (const item of clozes) {
  const tag = `cloze ${item.id ?? '(no id)'} [${item.topic}]`
  registerId('cloze', tag, item.id)
  checkSkills(tag, item.skills)
  checkClozeShape(tag, item)
  tally('clozes', item.topic || 'unknown')
}

for (const item of parsons) {
  const tag = `parsons ${item.id ?? '(no id)'} [${item.topic}]`
  registerId('parsons', tag, item.id)
  checkSkills(tag, item.skills)
  checkParsonsShape(tag, item)
  tally('parsons', item.topic || 'unknown')
}

for (const item of flashcards) {
  const tag = `flashcard ${item.id ?? '(no id)'} [${item.topic}]`
  registerId('flashcard', tag, item.id)
  checkSkills(tag, item.skills)
  checkFlashcardShape(tag, item)
  tally('flashcards', item.topic || 'unknown')
}

for (const problem of problems) {
  const tag = `problem ${problem.id ?? '(no id)'} lc${problem.lc} [${problem.topic}]`
  registerId('problem', tag, problem.id)
  checkSkills(tag, problem.skills)
  if (!Array.isArray(problem.companies) || !problem.companies.length) {
    fail(`${tag}: no companies resolved (not in table and no explicit companies field)`)
  } else {
    const bad = problem.companies.filter(c => !companySet.has(c))
    if (bad.length) fail(`${tag}: invalid company ids ${bad.join(',')}`)
  }
  tally('problems', problem.topic || 'unknown')
}

const { categories: thoughtCategories, items: thoughtItems } = await loadThought()

for (const item of thoughtItems) {
  const tag = `thought ${item.id ?? '(no id)'} [${item.category}]`
  registerId('thought', tag, item.id)
  checkSkills(tag, item.skills)
  tally('thought', item.category || 'unknown')

  for (const field of ['ds', 'method', 'time', 'space']) {
    const value = item[field]
    if (!value || !Array.isArray(value.choices) || !value.choices.length) {
      fail(`${tag}: ${field} missing choices`)
      continue
    }
    if (!value.choices.includes(value.answer)) fail(`${tag}: ${field}.answer not found verbatim in ${field}.choices`)
    const normalized = value.choices.map(choice => String(choice).trim())
    if (new Set(normalized).size !== normalized.length) fail(`${tag}: ${field} has duplicate choices`)
  }

  if (!Array.isArray(item.companies) || !item.companies.length) {
    fail(`${tag}: missing companies`)
  } else {
    const bad = item.companies.filter(c => !companySet.has(c))
    if (bad.length) fail(`${tag}: invalid company ids ${bad.join(',')}`)
  }

  const rawLines = String(item.code).replace(/\t/g, '    ').replace(/\s+$/, '').split('\n')
  if (!Array.isArray(item.blanks) || !item.blanks.length) {
    fail(`${tag}: no blanks`)
  } else {
    for (const b of item.blanks) {
      if (!Number.isInteger(b) || b < 0 || b >= rawLines.length) fail(`${tag}: blank index ${b} out of range (0..${rawLines.length - 1})`)
      else if (!rawLines[b].trim()) fail(`${tag}: blank index ${b} points at a blank code line`)
    }
    if (item.accept) {
      for (const key of Object.keys(item.accept)) {
        if (!item.blanks.includes(Number(key))) fail(`${tag}: accept key ${key} is not one of this item's blanks`)
      }
    }
  }
}

for (const sheet of cheatSheets) {
  const tag = `cheatsheet ${sheet.id}`
  if (!cheatGroupSet.has(sheet.group)) fail(`${tag}: invalid group "${sheet.group}"`)
  for (const [i, quizItem] of (sheet.quiz || []).entries()) {
    const quizTag = `${tag} quiz[${i}]`
    if (!Array.isArray(quizItem.choices) || quizItem.answer == null || quizItem.answer < 0 || quizItem.answer >= quizItem.choices.length) {
      fail(`${quizTag}: answer index out of range`)
    }
  }
}
{
  const cheatIds = cheatSheets.map(s => s.id)
  const dupSheet = cheatIds.filter((id, i) => cheatIds.indexOf(id) !== i)
  if (dupSheet.length) fail(`duplicate cheatsheet ids: ${[...new Set(dupSheet)].join(',')}`)
}

{
  const curriculumSkillSet = skillSet
  for (const unit of curriculum.units || []) {
    for (const mod of unit.modules || []) {
      for (const s of mod.skills || []) if (!curriculumSkillSet.has(s)) fail(`curriculum ${unit.id}/${mod.id}: invalid skill id "${s}"`)
    }
  }
}

const gamesDir = path.join(root, 'src/games')
const gameFiles = readdirSync(gamesDir).filter(f => f.endsWith('.js') && f !== '_engine.js')
for (const file of gameFiles) {
  const tag = `game ${file}`
  let mod
  try {
    mod = await import(path.join(gamesDir, file))
  } catch (error) {
    fail(`${tag}: failed to import — ${error.message}`)
    continue
  }
  const game = mod.default
  if (!game || !game.id) {
    fail(`${tag}: no default export with an id`)
    continue
  }
  checkSkills(tag, game.skills)
  if (typeof game.mount !== 'function') fail(`${tag}: default export missing mount()`)
}

const errorsFromOtherModules = topics.filter(topic => typeof topic?.id !== 'string')
if (errorsFromOtherModules.length) fail(`${errorsFromOtherModules.length} topic module(s) missing an id`)

console.log('--- counts by kind ---')
for (const kind of ['mcqs', 'clozes', 'parsons', 'flashcards', 'problems', 'thought']) {
  const byModule = countsByKindAndModule[kind] || {}
  const total = Object.values(byModule).reduce((a, b) => a + b, 0)
  console.log(`${kind}: ${total}`)
  for (const [moduleId, count] of Object.entries(byModule).sort()) console.log(`  ${moduleId}: ${count}`)
}
console.log(`games: ${gameFiles.length}`)
console.log(`cheatsheets: ${cheatSheets.length} across ${cheatSheetGroups.length} groups`)
console.log(`thought categories: ${thoughtCategories.length}`)

console.log('\n--- errors ---')
console.log(`${errors.length} error(s)`)
for (const e of errors) console.log(` - ${e}`)

if (errors.length) process.exit(1)
