import { h, clear, confetti } from '../ui/h.js'
import { icon } from '../ui/icons.js'
import { codeBlock } from '../ui/code.js'
import { persistOverride } from '../ui/override.js'

export const rand = n => Math.floor(Math.random() * n)
export const pick = list => list[rand(list.length)]
export const uniq = list => [...new Set(list)]

export function shuffle(list) {
  const result = [...list]
  for (let i = result.length - 1; i > 0; i--) {
    const j = rand(i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export const sample = (list, k) => shuffle(list).slice(0, k)

export function choiceSet(answer, distractors, size = 4) {
  const others = shuffle(uniq(distractors.filter(choice => choice !== answer))).slice(0, size - 1)
  const choices = shuffle([answer, ...others])
  return { choices, answer: choices.indexOf(answer) }
}

export const part = (q, answer, distractors, why) => ({ q, ...choiceSet(answer, distractors), why })

export function pickByLevel(items, level) {
  const pool = items.filter(item => (item.d || 1) <= level)
  const usable = pool.length ? pool : items
  const top = usable.filter(item => (item.d || 1) >= Math.min(level, 3))
  return Math.random() < 0.55 && top.length ? pick(top) : pick(usable)
}

export function codeView(source) {
  try {
    return codeBlock(source, { lineNumbers: false })
  } catch {
    return h('pre', { class: 'code-block game-pre' }, source)
  }
}

export function hashString(text) {
  let h1 = 1779033703 ^ text.length
  for (let i = 0; i < text.length; i++) {
    h1 = Math.imul(h1 ^ text.charCodeAt(i), 3432918353)
    h1 = (h1 << 13) | (h1 >>> 19)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
  h1 = Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  h1 ^= h1 >>> 16
  return h1 >>> 0
}

function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

let originalRandom = null

export function seedRandom(seed) {
  const generator = mulberry32(hashString(String(seed)))
  if (!originalRandom) originalRandom = Math.random
  Math.random = generator
}

export function unseedRandom() {
  if (originalRandom) {
    Math.random = originalRandom
    originalRandom = null
  }
}

export function dailySeed(date = new Date()) {
  return `daily-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

export function dailyLabel(date = new Date()) {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function relativeTime(ts) {
  if (!ts) return null
  const diff = Date.now() - ts
  if (diff < 45e3) return 'just now'
  const mins = Math.round(diff / 60e3)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days}d ago`
  return 'a while ago'
}

const multiplierFor = combo => combo >= 10 ? 4 : combo >= 6 ? 3 : combo >= 3 ? 2 : 1

const bossNames = ['Brute Force Golem', 'Quadratic Hydra', 'Stack Overflow Wraith', 'TLE Titan', 'Exponential Lich', 'The Hiring Committee']

export function createArcade(container, api, config) {
  const { title, icon: iconName = 'joystick', rules = [], mode = 'lives', seconds = 60, lives = 3, boss = false, maxLevel = 6, seed = null, onStart, onKey } = config
  const root = h('div', { class: 'game' })
  container.append(root)
  const timers = new Set()
  let phase = 'intro'
  let state = null
  let tickId = null
  let nextAction = null
  let waitToken = 0
  const hud = {}

  const later = (fn, ms) => {
    const id = setTimeout(() => {
      timers.delete(id)
      fn()
    }, ms)
    timers.add(id)
    return id
  }

  const clearTimers = () => {
    timers.forEach(clearTimeout)
    timers.clear()
  }

  function showIntro() {
    phase = 'intro'
    clear(root)
    const best = api.best?.() || 0
    const modeChip = mode === 'timed' ? [icon('clock', 14), ` ${seconds}s`] : [icon('heart', 14), ` x${lives} lives`]
    root.append(h('div', { class: 'card game-intro' },
      seed ? h('span', { class: 'pill pill-sky' }, icon('calendar', 14), ` Daily · ${dailyLabel()}`) : null,
      h('div', { class: 'game-intro-icon' }, icon(iconName, 44)),
      h('h2', null, title),
      h('div', { class: 'row row-wrap game-rules' },
        h('span', { class: 'chip' }, modeChip),
        rules.map(rule => h('span', { class: 'chip' }, rule))),
      best ? h('div', { class: 'pill pill-amber' }, `Best ${best}`) : null,
      h('button', { class: 'btn btn-primary btn-lg', onclick: start }, 'Start ', h('span', { class: 'kbd' }, 'Enter'))))
  }

  function buildHud() {
    hud.score = h('div', { class: 'game-score' }, '0')
    hud.floats = h('div', { class: 'game-floats' })
    hud.combo = h('span', { class: 'pill game-combo' })
    hud.comboFill = h('div', { class: 'game-combo-fill' })
    hud.level = h('span', { class: 'pill' })
    hud.lives = h('div', { class: 'game-lives' })
    hud.timerText = h('span', { class: 'pill pill-sky game-timer-text' })
    hud.timerFill = h('div', { class: 'game-timer-fill' })
    hud.bossName = h('div', { class: 'game-boss-name' })
    hud.bossFill = h('div', { class: 'game-boss-fill' })
    return h('div', { class: 'game-hud' },
      seed ? h('span', { class: 'pill pill-sky game-daily-chip' }, icon('calendar', 13), ' Daily') : null,
      h('div', { class: 'game-hud-top' },
        h('div', { class: 'game-score-wrap' }, hud.score, hud.floats),
        h('div', { class: 'row game-hud-right' },
          h('div', { class: 'game-combo-wrap' }, hud.combo, h('div', { class: 'game-combo-bar' }, hud.comboFill)),
          hud.level, mode === 'timed' ? hud.timerText : hud.lives)),
      mode === 'timed' ? h('div', { class: 'game-timer' }, hud.timerFill) : null,
      boss ? h('div', { class: 'game-boss' }, hud.bossName, h('div', { class: 'game-boss-bar' }, hud.bossFill)) : null)
  }

  function renderHud() {
    if (!state) return
    hud.score.textContent = String(state.score)
    const multiplier = multiplierFor(state.combo)
    clear(hud.combo)
    hud.combo.append(...(state.combo ? [icon('flame', 13), ` ${state.combo}${multiplier > 1 ? ` · x${multiplier}` : ''}`] : ['x1']))
    hud.combo.className = `pill game-combo${multiplier > 1 ? ' hot' : ''}${multiplier >= 3 ? ' blazing' : ''}`
    const tiers = [0, 3, 6, 10]
    let tier = 0
    while (tier < tiers.length - 1 && state.combo >= tiers[tier + 1]) tier++
    const lo = tiers[tier], hi = tiers[tier + 1] ?? lo + 6
    hud.comboFill.style.width = `${Math.min(100, Math.round(((state.combo - lo) / (hi - lo)) * 100))}%`
    hud.level.textContent = `Lv ${state.level}`
    clear(hud.lives)
    for (let i = 0; i < lives; i++) hud.lives.append(h('span', { class: i < state.lives ? 'heart' : 'heart lost' }, icon('heart', 18)))
    hud.lives.classList.toggle('critical', mode === 'lives' && state.lives === 1)
    if (boss) {
      clear(hud.bossName)
      const bossSuffix = state.bossIndex >= bossNames.length ? ` +${Math.floor(state.bossIndex / bossNames.length)}` : ''
      hud.bossName.append(icon('crown', 14), ` ${bossNames[state.bossIndex % bossNames.length]}${bossSuffix}`)
      hud.bossFill.style.width = `${Math.max(0, (state.bossHp / state.bossMax) * 100)}%`
    }
    renderTimer()
  }

  function renderTimer() {
    if (mode !== 'timed' || !state) return
    const fraction = Math.max(0, state.timeLeft / (seconds * 1000))
    hud.timerFill.style.width = `${fraction * 100}%`
    hud.timerFill.classList.toggle('low', fraction < 0.2)
    hud.timerFill.classList.toggle('critical', state.timeLeft < 10e3)
    clear(hud.timerText)
    hud.timerText.append(icon('clock', 13), ` ${Math.ceil(state.timeLeft / 1000)}s`)
  }

  function floatText(text, kind = 'good') {
    const el = h('span', { class: `game-float ${kind}` }, text)
    hud.floats.append(el)
    setTimeout(() => el.remove(), 900)
  }

  function pulse(el, className) {
    if (!el) return
    el.classList.remove(className)
    void el.offsetWidth
    el.classList.add(className)
  }

  function start() {
    clearTimers()
    clearInterval(tickId)
    nextAction = null
    if (seed) seedRandom(seed)
    phase = 'play'
    state = {
      score: 0, combo: 0, maxCombo: 0, level: 1, streak: 0, lives, timeLeft: seconds * 1000,
      answered: 0, correct: 0, mistakes: [], paused: false, bossIndex: 0, bossHp: 100, bossMax: 100, bossesBeaten: 0,
      previousBest: api.best?.() || 0, bestBeaten: false,
    }
    clear(root)
    ctx.stage = h('div', { class: 'game-stage' })
    root.append(buildHud(), ctx.stage)
    renderHud()
    if (mode === 'timed') startClock()
    onStart(ctx)
  }

  function startClock() {
    let last = performance.now()
    tickId = setInterval(() => {
      const now = performance.now()
      if (!state.paused && phase === 'play') state.timeLeft -= now - last
      last = now
      if (state.timeLeft <= 0) {
        state.timeLeft = 0
        end()
      }
      renderTimer()
    }, 100)
  }

  function damageBoss(amount) {
    state.bossHp -= amount
    pulse(hud.bossFill.parentElement, 'hit')
    if (state.bossHp > 0) return
    state.bossesBeaten++
    const bonus = 400 * (state.bossIndex + 1)
    state.score += bonus
    floatText(`Boss down +${bonus}`, 'boss')
    confetti()
    state.bossIndex++
    state.bossMax = 100 + state.bossIndex * 50
    state.bossHp = state.bossMax
    state.level = Math.min(maxLevel, state.level + 1)
  }

  function end() {
    if (phase !== 'play') return
    phase = 'over'
    clearInterval(tickId)
    clearTimers()
    nextAction = null
    if (seed) unseedRandom()
    const result = api.finish?.(state.score) || {}
    if (result.isBest && state.score > 0) confetti()
    renderSummary(result)
  }

  function shareText(result) {
    const best = Math.max(result.best ?? 0, state.score)
    const label = seed ? `Daily Challenge · ${dailyLabel()}` : title
    const link = `${location.origin}${location.pathname}${location.hash}`
    return `CodeCram · ${label} — scored ${state.score} (best ${best}). Beat me: ${link}`
  }

  function copyShare(button, result) {
    const text = shareText(result)
    const label = button.querySelector('.share-label')
    const original = label.textContent
    const done = () => {
      label.textContent = ' Copied'
      setTimeout(() => { label.textContent = original }, 1600)
    }
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done))
    } else fallbackCopy(text, done)
  }

  function fallbackCopy(text, done) {
    try {
      const area = document.createElement('textarea')
      area.value = text
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      area.remove()
      done()
    } catch {}
  }

  function renderSummary(result) {
    clear(root)
    const accuracy = state.answered ? Math.round((state.correct / state.answered) * 100) : 0
    const stats = [
      ['Accuracy', `${accuracy}%`],
      ['Answered', state.answered],
      ['Max combo', state.maxCombo],
      ['Level', state.level],
    ]
    if (boss) stats.push(['Bosses', state.bossesBeaten])
    const mistakes = state.mistakes.slice(-15)
    const bestNow = Math.max(result.best ?? 0, state.score)
    const shortBy = !result.isBest && bestNow > state.score ? bestNow - state.score : 0
    root.append(h('div', { class: 'stack game-summary' },
      h('div', { class: 'card game-result' },
        seed ? h('span', { class: 'pill pill-sky' }, icon('calendar', 14), ` Daily · ${dailyLabel()}`) : null,
        h('div', { class: 'game-intro-icon' }, icon(iconName, 44)),
        h('div', { class: 'game-final-score' }, String(state.score)),
        result.isBest && state.score > 0
          ? h('span', { class: 'pill pill-amber' }, icon('trophy', 14), ' New best')
          : h('span', { class: 'pill' }, `Best ${bestNow}`),
        shortBy ? h('div', { class: 'muted small' }, `${shortBy} short of your best`) : null,
        h('div', { class: 'row row-wrap game-stats' }, stats.map(([label, value]) =>
          h('div', { class: 'stat' }, h('div', { class: 'stat-value' }, String(value)), h('div', { class: 'stat-label' }, label)))),
        h('div', { class: 'row row-wrap' },
          h('button', { class: 'btn btn-primary', onclick: start }, 'Play again ', h('span', { class: 'kbd' }, 'Enter')),
          h('button', { class: 'btn btn-ghost', onclick: event => copyShare(event.currentTarget, result) }, icon('copy', 16), h('span', { class: 'share-label' }, ' Share score')),
          h('a', { class: 'btn btn-ghost', href: '#/games' }, 'Arcade'))),
      mistakes.length
        ? h('div', { class: 'stack' },
          h('div', { class: 'section-title' }, `Review · ${state.mistakes.length} miss${state.mistakes.length === 1 ? '' : 'es'}`),
          mistakes.map(mistake => h('div', { class: 'card game-mistake' },
            h('div', { class: 'game-mistake-q' }, mistake.summary),
            mistake.ask ? h('div', { class: 'muted small' }, mistake.ask) : null,
            h('div', { class: 'row row-wrap' },
              mistake.yours ? h('span', { class: 'pill pill-red' }, icon('x', 12), ` ${mistake.yours}`) : null,
              h('span', { class: 'pill pill-green' }, icon('check', 12), ` ${mistake.answer}`)),
            h('div', { class: 'muted small' }, mistake.why))))
        : h('div', { class: 'empty' }, h('div', { class: 'empty-icon' }, icon('sparkle', 32)), 'Flawless run.')))
  }

  const ctx = {
    stage: null,
    get level() { return state.level },
    get state() { return state },
    later,
    floatText,
    pulse,
    over: () => phase !== 'play',
    alive: () => mode !== 'lives' || state.lives > 0,
    pause(flag) { state.paused = flag },
    hit(base = 100, speedFraction = 0) {
      state.combo++
      state.maxCombo = Math.max(state.maxCombo, state.combo)
      const multiplier = multiplierFor(state.combo)
      const points = Math.round((base * (1 + 0.25 * (state.level - 1)) + 100 * speedFraction) * multiplier)
      state.score += points
      const crossedBest = !state.bestBeaten && state.previousBest > 0 && state.score > state.previousBest
      if (crossedBest) {
        state.bestBeaten = true
        floatText('New best!', 'level')
        confetti()
      } else {
        floatText(`+${points}`)
      }
      pulse(hud.score, 'bump')
      if (boss) damageBoss(Math.round(14 * multiplier))
      renderHud()
      return points
    },
    miss() {
      if (state.combo > 0) state.comboBeforeMiss = state.combo
      state.combo = 0
      if (mode === 'lives') {
        state.lives--
        pulse(hud.lives, 'shake')
      }
      floatText(mode === 'lives' ? [icon('heart', 13), '-1'] : 'miss', 'bad')
      renderHud()
      return ctx.alive()
    },
    resolve(correct, { skills = [], id, mistake } = {}) {
      api.record?.(correct, skills, id)
      state.lastResolved = { correct, skills, id, mistake, levelBefore: state.level, streakBefore: state.streak }
      state.answered++
      if (correct) {
        state.comboBeforeMiss = 0
        state.correct++
        state.streak++
        if (!boss && state.streak % 3 === 0 && state.level < maxLevel) {
          state.level++
          floatText(`Level ${state.level}`, 'level')
        }
      } else {
        state.streak = 0
        if (!boss) state.level = Math.max(1, state.level - 1)
        if (mistake) state.mistakes.push(mistake)
      }
      renderHud()
    },
    overrule({ restoreLives = 1, dropMistakes, base = 100 } = {}) {
      const last = state?.lastResolved
      if (!last || last.correct || phase !== 'play') return false
      last.correct = true
      last.overridden = true
      if (api.override) api.override(last.skills, last.id)
      else persistOverride({ itemId: last.id, kind: 'game', skills: last.skills })
      state.correct++
      state.streak = (last.streakBefore || 0) + 1
      if (!boss) state.level = Math.max(state.level, last.levelBefore)
      const drop = dropMistakes ?? (last.mistake ? 1 : 0)
      if (drop > 0) state.mistakes.splice(Math.max(0, state.mistakes.length - drop), drop)
      if (mode === 'lives') state.lives = Math.min(lives, state.lives + restoreLives)
      state.combo = state.comboBeforeMiss || 0
      state.comboBeforeMiss = 0
      if (base) ctx.hit(base)
      else renderHud()
      floatText('overruled', 'level')
      return true
    },
    waitFor(fn, autoMs = 0) {
      const token = ++waitToken
      nextAction = fn
      if (autoMs) later(() => {
        if (waitToken === token && nextAction) ctx.proceed()
      }, autoMs)
    },
    proceed() {
      if (!nextAction || phase !== 'play') return
      const fn = nextAction
      nextAction = null
      fn()
    },
    end,
  }

  const onKeyDown = event => {
    if (event.metaKey || event.ctrlKey || event.altKey) return
    if (event.target?.matches?.('input, textarea, select')) return
    if (!root.isConnected) return
    if (phase === 'intro' && event.key === 'Enter') {
      event.preventDefault()
      start()
      return
    }
    if (phase === 'over' && (event.key === 'Enter' || event.key === 'r')) {
      event.preventDefault()
      start()
      return
    }
    if (phase !== 'play') return
    if ((event.key === 'Enter' || event.key === ' ') && nextAction) {
      event.preventDefault()
      ctx.proceed()
      return
    }
    onKey?.(event, ctx)
  }

  document.addEventListener('keydown', onKeyDown)
  showIntro()

  return () => {
    phase = 'dead'
    clearInterval(tickId)
    clearTimers()
    if (seed) unseedRandom()
    document.removeEventListener('keydown', onKeyDown)
  }
}

export function runQuiz(container, api, config) {
  const { makeQuestion, speedMs = 0, autoMs = 650 } = config
  let question = null
  let partIndex = 0
  let partStart = 0
  let locked = true
  let buttons = []
  let card = null
  let feedback = null
  let recent = []

  function pickQuestion(level) {
    for (let tries = 0; tries < 15; tries++) {
      const candidate = makeQuestion(level)
      const key = candidate.key || candidate.id
      if (!recent.includes(key)) {
        recent = [...recent.slice(-10), key]
        return candidate
      }
    }
    return makeQuestion(level)
  }

  function next(ctx) {
    if (ctx.over()) return
    question = pickQuestion(ctx.level)
    partIndex = 0
    render(ctx)
  }

  function render(ctx) {
    locked = false
    const current = question.parts[partIndex]
    clear(ctx.stage)
    const prompt = typeof question.prompt === 'function' ? question.prompt() : question.prompt
    feedback = h('div', { class: 'game-feedback' })
    buttons = current.choices.map((choice, i) => h('button', { class: 'btn game-choice', onclick: () => choose(ctx, i) },
      h('span', { class: 'kbd' }, String(i + 1)),
      h('span', { class: 'game-choice-text' }, choice)))
    const speedBar = speedMs ? h('div', { class: 'game-speed' }, h('div', { class: 'game-speed-fill', style: { animationDuration: `${speedMs}ms` } })) : null
    card = h('div', { class: 'card game-card fade-in' },
      h('div', { class: 'row row-wrap game-tags' },
        question.tag ? h('span', { class: `pill ${question.tagClass || 'pill-teal'}` },
          typeof question.tag === 'object' ? [icon(question.tag.icon, 13), ` ${question.tag.text}`] : question.tag) : null,
        question.parts.length > 1 ? h('span', { class: 'pill' }, `${partIndex + 1} / ${question.parts.length}`) : null,
        question.chips ? question.chips.map(chip => h('span', { class: 'chip mono' }, chip)) : null),
      prompt ? (typeof prompt === 'string' ? h('div', { class: 'game-prompt' }, prompt) : prompt) : null,
      question.code ? codeView(question.code) : null,
      speedBar,
      h('div', { class: 'game-ask' }, current.q),
      h('div', { class: `game-choices${current.choices.some(choice => choice.length > 34) ? ' wide' : ''}` }, buttons),
      feedback)
    ctx.stage.append(card)
    partStart = performance.now()
    document.activeElement?.blur?.()
  }

  function choose(ctx, i) {
    if (locked || ctx.over() || !question) return
    const current = question.parts[partIndex]
    if (i < 0 || i >= current.choices.length) return
    locked = true
    const correct = i === current.answer
    buttons.forEach((button, j) => {
      button.disabled = true
      if (j === current.answer) button.classList.add('is-correct')
      else if (j === i) button.classList.add('is-wrong')
    })
    if (correct) {
      const elapsed = performance.now() - partStart
      ctx.hit(100, speedMs ? Math.max(0, 1 - elapsed / speedMs) : 0)
      ctx.pulse(card, 'flash-good')
      const isLast = partIndex === question.parts.length - 1
      feedback.append(h('div', { class: 'game-why good' }, icon('check', 14), ' ', current.why))
      if (!isLast) {
        ctx.waitFor(() => {
          partIndex++
          render(ctx)
        }, 650)
        return
      }
      ctx.resolve(true, { skills: question.skills, id: question.id })
      ctx.waitFor(() => next(ctx), autoMs)
      return
    }
    ctx.pulse(card, 'flash-bad')
    ctx.resolve(false, {
      skills: question.skills,
      id: question.id,
      mistake: { summary: question.summary || current.q, ask: question.summary ? current.q : null, yours: current.choices[i], answer: current.choices[current.answer], why: current.why },
    })
    const alive = ctx.miss()
    ctx.pause(true)
    feedback.append(
      h('div', { class: 'game-why bad' }, h('strong', null, current.choices[current.answer]), h('span', null, current.why)),
      h('button', { class: 'btn btn-primary game-continue', onclick: () => ctx.proceed() }, alive ? 'Continue ' : 'Results ', h('span', { class: 'kbd' }, 'Enter')))
    ctx.waitFor(() => {
      ctx.pause(false)
      if (!alive) ctx.end()
      else next(ctx)
    })
  }

  return createArcade(container, api, {
    ...config,
    onStart: ctx => next(ctx),
    onKey: (event, ctx) => {
      const index = '1234'.indexOf(event.key)
      if (index >= 0) {
        event.preventDefault()
        choose(ctx, index)
      }
    },
  })
}
