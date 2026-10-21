import { h } from '../ui/h.js'
import { icon } from '../ui/icons.js'
import * as store from '../store.js'
import { dailySeed, dailyLabel, hashString } from '../games/_engine.js'
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
  'pointer-surgery': [['1-9, 0', 'pick line'], ['⌫', 'undo'], ['Enter', 'run']],
}

const bestOf = gameId => {
  try {
    return store.getState()?.gameScores?.[gameId] || 0
  } catch {
    return 0
  }
}

const hasPlayed = gameId => {
  try {
    return store.getState()?.gameScores?.[gameId] !== undefined
  } catch {
    return false
  }
}

const dailyGame = (date = new Date()) => games[hashString(dailySeed(date)) % games.length]

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

function renderTile(game, i) {
  const best = bestOf(game.id)
  return h('a', { class: `tile game-tile${game.id === 'complexity-boss' ? ' boss-tile' : ''}`, href: `#/games/${game.id}`, style: { '--tile-color': tileColors[i % tileColors.length] } },
    h('div', { class: 'row spread' },
      h('span', { class: 'tile-icon' }, icon(game.icon, 26)),
      hasPlayed(game.id) ? h('span', { class: 'pill pill-amber' }, icon('star', 12), ` ${best}`) : h('span', { class: 'pill' }, 'new')),
    h('span', { class: 'tile-title' }, game.title),
    h('span', { class: 'tile-sub' }, game.blurb))
}

function renderArcade(container) {
  const daily = dailyGame()
  container.append(h('div', { class: 'page games-page' },
    h('div', { class: 'page-header' },
      h('div', null, h('h1', null, 'Arcade'), h('p', null, 'Fast reps. Real interview reflexes.')),
      h('a', { class: 'btn btn-primary btn-lg', href: `#/games/${daily.id}?daily=1` }, icon('play', 16), ' Play daily challenge')),
    h('div', { class: 'grid games-grid' }, games.map((game, i) => renderTile(game, i)))))
}

function renderGame(container, game, isDaily) {
  const host = h('div', { class: 'game-host' })
  container.append(h('div', { class: 'page games-page' },
    h('div', { class: 'page-header' },
      h('div', { class: 'row row-wrap' },
        h('a', { class: 'btn btn-ghost btn-sm', href: '#/games' }, [icon('arrowLeft', 16), ' Arcade']),
        h('h1', { class: 'game-title' }, icon(game.icon, 22), ` ${game.title}`),
        isDaily ? h('span', { class: 'pill pill-sky' }, icon('calendar', 13), ` Daily · ${dailyLabel()}`) : null),
      h('span', { class: 'muted small' }, ...(keyHints[game.id] || keyHints.quiz).flatMap(([key, label]) => [h('span', { class: 'kbd' }, key), ` ${label}  `]))),
    host))
  return game.mount(host, makeApi(game, isDaily))
}

export default function render(container, params = {}) {
  const game = params.id ? gameById[params.id] : null
  if (params.id && !game) {
    container.append(h('div', { class: 'page' }, h('div', { class: 'empty' },
      h('div', { class: 'empty-icon' }, icon('joystick', 32)), 'No such game. ', h('a', { href: '#/games' }, 'Back to the arcade'))))
    return
  }
  if (game) return renderGame(container, game, Boolean(params.query?.daily))
  renderArcade(container)
}
