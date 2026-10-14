import { h } from '../ui/h.js'
import * as store from '../store.js'
import { skillIds, skills } from '../content/skills.js'
import { dailySeed, dailyLabel, hashString, relativeTime } from '../games/_engine.js'
import constraintSniper from '../games/constraint-sniper.js'
import patternRadar from '../games/pattern-radar.js'
import dsMatch from '../games/ds-match.js'
import bigoLadder from '../games/bigo-ladder.js'
import bfsOrDfs from '../games/bfs-or-dfs.js'
import traversalOrder from '../games/traversal-order.js'
import pointerSurgery from '../games/pointer-surgery.js'
import heapBuilder from '../games/heap-builder.js'
import stackSim from '../games/stack-sim.js'
import twoPointerRace from '../games/two-pointer-race.js'
import complexityBoss from '../games/complexity-boss.js'

const newRoster = ['edge-case-hunter', 'bug-spotter', 'recurrence-match', 'line-up']
const extraGames = (await Promise.all(newRoster.map(async name => {
  try {
    const mod = await import(`../games/${name}.js`)
    return mod.default || null
  } catch (error) {
    console.warn(`games: ${name} not available yet`, error)
    return null
  }
}))).filter(Boolean)

export const games = [
  constraintSniper, patternRadar, dsMatch, bigoLadder, bfsOrDfs, traversalOrder, pointerSurgery,
  heapBuilder, stackSim, twoPointerRace,
  ...extraGames,
  complexityBoss,
]
export const gameById = Object.fromEntries(games.map(game => [game.id, game]))

const tileColors = ['var(--amber)', 'var(--sky)', 'var(--teal)', 'var(--green)', 'var(--pink)', 'var(--sky)', 'var(--pink)', 'var(--teal)', 'var(--amber)', 'var(--green)', 'var(--sky)', 'var(--pink)', 'var(--teal)', 'var(--amber)', 'var(--red)']

const keyHints = {
  quiz: [['1-4', 'answer'], ['Enter', 'next']],
  'traversal-order': [['0-9', 'pick node'], ['Enter', 'next']],
  'pointer-surgery': [['1-6', 'add line'], ['⌫', 'undo'], ['Enter', 'run']],
}

const bestOf = gameId => {
  try {
    return store.getState()?.gameScores?.[gameId] || 0
  } catch {
    return 0
  }
}

const lastPlayedAt = gameId => {
  try {
    return store.getItemRecord(`game:${gameId}`)?.lastAt || null
  } catch {
    return null
  }
}

const startOfToday = () => {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

const playedToday = gameId => {
  try {
    const events = store.getEvents({ type: 'game', itemId: gameId, since: startOfToday() })
    if (!events.length) return null
    return events[events.length - 1].score ?? null
  } catch {
    return null
  }
}

const dailyPool = games.filter(game => game.supportsDaily)

const dailyGame = (date = new Date()) => {
  const pool = dailyPool.length ? dailyPool : games
  return pool[hashString(dailySeed(date)) % pool.length]
}

function makeApi(game, isDaily = false) {
  return {
    seed: isDaily ? dailySeed() : null,
    best: () => bestOf(game.id),
    record(correct, itemSkills, itemId) {
      try {
        store.recordAnswer({ itemId: itemId || `game:${game.id}`, kind: 'game', skills: itemSkills?.length ? itemSkills : game.skills, correct: !!correct })
      } catch (error) {
        console.warn(error)
      }
    },
    finish(score) {
      const previous = bestOf(game.id)
      let isBest = false
      try {
        isBest = store.recordGameScore ? store.recordGameScore(game.id, score) && score > previous : false
      } catch (error) {
        console.warn(error)
      }
      return { best: Math.max(previous, score), previous, isBest }
    },
  }
}

const suggestedGame = () => {
  let weak = []
  try {
    weak = store.weakestSkills(skillIds.length, skillIds) || []
  } catch {}
  for (const skill of weak) {
    const match = games.find(game => (game.skills || []).includes(skill) && game.id !== 'complexity-boss')
    if (match) return { game: match, skill }
  }
  return { game: games[0], skill: null }
}

function skillChip(id) {
  return h('span', { class: 'chip tile-chip' }, skills[id]?.label || id)
}

function renderDailyCard(daily) {
  const score = playedToday(daily.id)
  return h('a', { class: 'card card-hover daily-card', href: `#/games/${daily.id}?daily=1` },
    h('span', { class: 'daily-card-icon' }, daily.icon),
    h('div', { class: 'grow' },
      h('div', { class: 'row row-wrap' },
        h('span', { class: 'pill pill-sky' }, `📅 Daily · ${dailyLabel()}`),
        score != null ? h('span', { class: 'pill pill-green' }, `✓ played · ${score}`) : null),
      h('div', { class: 'daily-card-title' }, daily.title),
      h('div', { class: 'tile-sub' }, daily.blurb)),
    h('div', { class: 'daily-card-side' },
      h('span', { class: 'pill pill-amber' }, `Best ${bestOf(daily.id)}`),
      h('span', { class: 'btn btn-primary btn-sm' }, score != null ? 'Play again' : 'Play daily ▶')))
}

function renderTile(game, i) {
  const best = bestOf(game.id)
  const lastAt = lastPlayedAt(game.id)
  const chips = (game.skills || []).slice(0, 3).map(skillChip)
  return h('a', { class: `tile game-tile${game.id === 'complexity-boss' ? ' boss-tile' : ''}`, href: `#/games/${game.id}`, style: { '--tile-color': tileColors[i % tileColors.length] } },
    h('div', { class: 'row spread' },
      h('span', { class: 'tile-icon' }, game.icon),
      best ? h('span', { class: 'pill pill-amber' }, `★ ${best}`) : h('span', { class: 'pill' }, 'new')),
    h('span', { class: 'tile-title' }, game.title),
    h('span', { class: 'tile-sub' }, game.blurb),
    chips.length ? h('div', { class: 'row row-wrap tile-skills' }, chips) : null,
    h('div', { class: 'row spread tile-meta muted small' },
      h('span', null, game.difficulty || game.modeLabel || ''),
      h('span', null, lastAt ? `Played ${relativeTime(lastAt)}` : 'Not played yet')))
}

function renderArcade(container) {
  const totalBest = games.reduce((sum, game) => sum + bestOf(game.id), 0)
  const suggestion = suggestedGame()
  const daily = dailyGame()
  container.append(h('div', { class: 'page games-page' },
    h('div', { class: 'page-header' },
      h('div', null, h('h1', null, 'Arcade'), h('p', null, 'Fast reps. Real interview reflexes.')),
      h('div', { class: 'row' },
        totalBest ? h('span', { class: 'pill pill-amber' }, `🏆 ${totalBest.toLocaleString()} total best`) : null,
        h('a', { class: 'btn btn-primary', href: `#/games/${suggestion.game.id}`, title: suggestion.skill ? `Targets your weakest: ${suggestion.skill}` : '' }, `▶ Play next: ${suggestion.game.title}`))),
    renderDailyCard(daily),
    h('div', { class: 'grid games-grid' }, games.map((game, i) => renderTile(game, i)))))
}

function renderGame(container, game, isDaily) {
  const host = h('div', { class: 'game-host' })
  container.append(h('div', { class: 'page games-page' },
    h('div', { class: 'page-header' },
      h('div', { class: 'row row-wrap' },
        h('a', { class: 'btn btn-ghost btn-sm', href: '#/games' }, '← Arcade'),
        h('h1', { class: 'game-title' }, `${game.icon} ${game.title}`),
        isDaily ? h('span', { class: 'pill pill-sky' }, `📅 Daily · ${dailyLabel()}`) : null),
      h('span', { class: 'muted small' }, ...(keyHints[game.id] || keyHints.quiz).flatMap(([key, label]) => [h('span', { class: 'kbd' }, key), ` ${label}  `]))),
    host))
  return game.mount(host, makeApi(game, isDaily))
}

export default function render(container, params = {}) {
  const game = params.id ? gameById[params.id] : null
  if (params.id && !game) {
    container.append(h('div', { class: 'page' }, h('div', { class: 'empty' },
      h('div', { class: 'empty-icon' }, '🕹️'), 'No such game. ', h('a', { href: '#/games' }, 'Back to the arcade'))))
    return
  }
  if (game) return renderGame(container, game, Boolean(params.query?.daily))
  renderArcade(container)
}
