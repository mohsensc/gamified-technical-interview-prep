import { h, clear, confetti } from '../ui/h.js'
import { renderCard } from '../ui/items.js'
import * as store from '../store.js'
import { flashcards } from '../content/index.js'
import { skills, skillGroups } from '../content/skills.js'
import { companyChips } from '../ui/companies.js'
import { companiesFor } from '../content/companies.js'
import { subnav } from '../ui/subnav.js'

const companyBadge = card => { try { return companyChips(companiesFor(card), { size: 'xs' }) } catch { return null } }

const newPerSession = 20
let activeDeck = 'all'

const idOf = entry => typeof entry === 'string' ? entry : entry?.itemId ?? entry?.id

function dueIdSet() {
  try { return new Set((store.dueItems() || []).map(idOf).filter(Boolean)) } catch { return new Set() }
}

const seen = id => {
  try { return store.isSeen(id) || Boolean(store.getItemRecord?.(id)?.attempts) } catch { return false }
}

function inDeck(card, deck) {
  if (deck === 'all') return true
  const group = skillGroups.find(g => g.id === deck)
  if (!group) return true
  const groupSkills = new Set(group.skills.map(([id]) => id))
  return (card.skills || []).some(skill => groupSkills.has(skill))
}

function deckCounts(deck) {
  const due = dueIdSet()
  const cards = flashcards.filter(card => inDeck(card, deck))
  return {
    total: cards.length,
    due: cards.filter(card => due.has(card.id)).length,
    fresh: cards.filter(card => !due.has(card.id) && !seen(card.id)).length,
  }
}

export default function render(container) {
  let cleanupKeys = null

  function draw(mode = 'review') {
    cleanupKeys?.()
    cleanupKeys = null
    clear(container)

    const due = dueIdSet()
    const deckCards = flashcards.filter(card => inDeck(card, activeDeck))
    let queue
    if (mode === 'cram') queue = [...deckCards].sort(() => Math.random() - 0.5).slice(0, 25)
    else queue = [
      ...deckCards.filter(card => due.has(card.id)),
      ...deckCards.filter(card => !due.has(card.id) && !seen(card.id)).slice(0, newPerSession),
    ]
    const totalQueued = queue.length
    let done = 0
    let again = 0

    const chips = h('div', { class: 'row deck-chips' },
      [{ id: 'all', label: 'All' }, ...skillGroups].map(deck => {
        const counts = deckCounts(deck.id)
        return h('button', {
          class: `chip deck-chip${deck.id === activeDeck ? ' active' : ''}`,
          onclick: () => {
            activeDeck = deck.id
            draw()
          },
        }, deck.label, counts.due ? h('span', { class: 'pill pill-due' }, String(counts.due)) : null)
      }))

    const counts = deckCounts(activeDeck)
    const countsEl = h('div', { class: 'row flash-counts' },
      h('span', { class: 'pill' }, `${counts.due} due`),
      h('span', { class: 'pill' }, `${counts.fresh} new`),
      h('span', { class: 'pill muted' }, `${counts.total} cards`))

    const progressFill = h('div', { class: 'progress-fill' })
    const progressEl = h('div', { class: 'progress' }, progressFill)
    const sessionCount = h('span', { class: 'muted' })
    const stage = h('div', { class: 'flash-stage' })

    container.append(h('div', { class: 'page flash-page' },
      subnav('practice', 'flashcards'),
      h('div', { class: 'page-header row' }, h('h1', null, 'Flashcards'), countsEl),
      chips,
      h('div', { class: 'row flash-session' }, progressEl, sessionCount),
      stage))

    const updateProgress = () => {
      progressFill.style.width = `${totalQueued ? (done / (done + queue.length)) * 100 : 0}%`
      sessionCount.textContent = `${done} done · ${queue.length} left`
    }

    function showNext() {
      updateProgress()
      if (!queue.length) {
        if (done > 0) confetti()
        stage.replaceChildren(h('div', { class: 'empty card stack flash-empty' },
          h('div', { class: 'flash-empty-title' }, done ? 'Deck clear' : 'All caught up'),
          done ? h('div', { class: 'muted' }, `${done} reviewed · ${again} again`) : h('div', { class: 'muted' }, 'Nothing due right now.'),
          h('div', { class: 'row' },
            deckCards.length ? h('button', { class: 'btn btn-primary', onclick: () => draw('cram') }, 'Cram 25') : null,
            h('a', { class: 'btn btn-ghost', href: '#/drill' }, 'Drill'))))
        return
      }
      const card = queue.shift()
      const isNew = !seen(card.id)
      const cardEl = renderCard(card, grade => {
        try { store.rateCard(card.id, card.skills || [], grade) } catch {}
        try { store.markSeen(card.id) } catch {}
        done += 1
        if (grade === 0) {
          again += 1
          queue.splice(Math.min(3, queue.length), 0, card)
        }
        setTimeout(showNext, 180)
      })
      stage.replaceChildren(
        h('div', { class: 'row-wrap flash-meta' },
          isNew ? h('span', { class: 'chip chip-new' }, 'new') : h('span', { class: 'chip' }, mode === 'cram' ? 'cram' : 'review'),
          companyBadge(card),
          ...(card.skills || []).slice(0, 3).map(skill => h('a', { class: 'chip chip-skill', href: `#/drill/${skill}` }, skills[skill]?.label || skill))),
        cardEl)
      cardEl.querySelector('.flash-card')?.focus({ preventScroll: true })
    }

    if (!flashcards.length) {
      stage.replaceChildren(h('div', { class: 'empty card' }, 'No flashcards yet.'))
      return
    }
    showNext()
  }

  draw()
  return () => cleanupKeys?.()
}
