import { h } from '../ui/h.js'
import * as store from '../store.js'
import { skillIds } from '../content/skills.js'
import constraintSniper from '../games/constraint-sniper.js'
import patternRadar from '../games/pattern-radar.js'
import dsMatch from '../games/ds-match.js'
import bigoLadder from '../games/bigo-ladder.js'
import bfsOrDfs from '../games/bfs-or-dfs.js'
import traversalOrder from '../games/traversal-order.js'
import pointerSurgery from '../games/pointer-surgery.js'
import complexityBoss from '../games/complexity-boss.js'

export const games = [constraintSniper, patternRadar, dsMatch, bigoLadder, bfsOrDfs, traversalOrder, pointerSurgery, complexityBoss]
export const gameById = Object.fromEntries(games.map(game => [game.id, game]))

const tileColors = ['var(--amber)', 'var(--sky)', 'var(--teal)', 'var(--green)', 'var(--pink)', 'var(--sky)', 'var(--pink)', 'var(--red)']

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

function makeApi(game) {
  return {
    best: () => bestOf(game.id),
    record(correct, skills, itemId) {
      try {
        store.recordAnswer({ itemId: itemId || `game:${game.id}`, kind: 'game', skills: skills?.length ? skills : game.skills, correct: !!correct })
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

function renderArcade(container) {
  const totalBest = games.reduce((sum, game) => sum + bestOf(game.id), 0)
  const suggestion = suggestedGame()
  container.append(h('div', { class: 'page games-page' },
    h('div', { class: 'page-header' },
      h('div', null, h('h1', null, 'Arcade'), h('p', null, 'Fast reps. Real interview reflexes.')),
      h('div', { class: 'row' },
        totalBest ? h('span', { class: 'pill pill-amber' }, `🏆 ${totalBest.toLocaleString()} total best`) : null,
        h('a', { class: 'btn btn-primary', href: `#/games/${suggestion.game.id}`, title: suggestion.skill ? `Targets your weakest: ${suggestion.skill}` : '' }, `▶ Play next: ${suggestion.game.title}`))),
    h('div', { class: 'grid games-grid' }, games.map((game, i) => {
      const best = bestOf(game.id)
      return h('a', { class: `tile game-tile${game.id === 'complexity-boss' ? ' boss-tile' : ''}`, href: `#/games/${game.id}`, style: { '--tile-color': tileColors[i % tileColors.length] } },
        h('div', { class: 'row spread' },
          h('span', { class: 'tile-icon' }, game.icon),
          best ? h('span', { class: 'pill pill-amber' }, `★ ${best}`) : h('span', { class: 'pill' }, 'new')),
        h('span', { class: 'tile-title' }, game.title),
        h('span', { class: 'tile-sub' }, game.blurb))
    }))))
}

function renderGame(container, game) {
  const host = h('div', { class: 'game-host' })
  container.append(h('div', { class: 'page games-page' },
    h('div', { class: 'page-header' },
      h('div', { class: 'row' },
        h('a', { class: 'btn btn-ghost btn-sm', href: '#/games' }, '← Arcade'),
        h('h1', { class: 'game-title' }, `${game.icon} ${game.title}`)),
      h('span', { class: 'muted small' }, ...(keyHints[game.id] || keyHints.quiz).flatMap(([key, label]) => [h('span', { class: 'kbd' }, key), ` ${label}  `]))),
    host))
  return game.mount(host, makeApi(game))
}

export default function render(container, params = {}) {
  const game = params.id ? gameById[params.id] : null
  if (params.id && !game) {
    container.append(h('div', { class: 'page' }, h('div', { class: 'empty' },
      h('div', { class: 'empty-icon' }, '🕹️'), 'No such game. ', h('a', { href: '#/games' }, 'Back to the arcade'))))
    return
  }
  if (game) return renderGame(container, game)
  renderArcade(container)
}
