const svgNamespace = 'http://www.w3.org/2000/svg'

const appendChildren = (el, children) => {
  for (const child of children) {
    if (child === null || child === undefined || child === false || child === true) continue
    if (Array.isArray(child)) appendChildren(el, child)
    else if (child instanceof Node) el.appendChild(child)
    else el.appendChild(document.createTextNode(String(child)))
  }
}

const applyAttrs = (el, attrs, isSvg) => {
  if (!attrs) return
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue
    if (key === 'class' || key === 'className') {
      const className = Array.isArray(value) ? value.filter(Boolean).join(' ') : value
      if (isSvg) el.setAttribute('class', className)
      else el.className = className
    } else if (key === 'style') {
      if (typeof value === 'string') el.style.cssText = value
      else for (const [prop, propValue] of Object.entries(value)) {
        if (propValue === null || propValue === undefined) continue
        if (prop.startsWith('--')) el.style.setProperty(prop, propValue)
        else el.style[prop] = propValue
      }
    } else if (key === 'html') {
      el.innerHTML = value
    } else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value)
    } else if (key === 'dataset' && typeof value === 'object') {
      Object.assign(el.dataset, value)
    } else if (!isSvg && (key === 'value' || key === 'checked' || key === 'disabled' || key === 'selected')) {
      el[key] = value
    } else {
      el.setAttribute(key, value === true ? '' : value)
    }
  }
}

const isAttrs = value => value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Node)

export function h(tag, attrs, ...children) {
  const el = document.createElement(tag)
  if (isAttrs(attrs)) applyAttrs(el, attrs, false)
  else children.unshift(attrs)
  appendChildren(el, children)
  return el
}

export function svg(tag, attrs, ...children) {
  const el = document.createElementNS(svgNamespace, tag)
  if (isAttrs(attrs)) applyAttrs(el, attrs, true)
  else children.unshift(attrs)
  appendChildren(el, children)
  return el
}

export function clear(el) {
  if (!el) return el
  while (el.firstChild) el.removeChild(el.firstChild)
  return el
}

let toastHost = null

export function toast(message, kind = 'info') {
  if (!toastHost || !document.body.contains(toastHost)) {
    toastHost = h('div', { class: 'toast-host' })
    document.body.appendChild(toastHost)
  }
  const toastEl = h('div', { class: `toast toast-${kind}` }, message)
  toastHost.appendChild(toastEl)
  requestAnimationFrame(() => toastEl.classList.add('show'))
  setTimeout(() => {
    toastEl.classList.remove('show')
    setTimeout(() => toastEl.remove(), 300)
  }, 2200)
  return toastEl
}

const confettiColors = ['#2dd4bf', '#fbbf24', '#38bdf8', '#f472b6', '#4ade80']

export function confetti(originX, originY) {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  const layer = h('div', { class: 'confetti-layer' })
  document.body.appendChild(layer)
  const startX = originX ?? window.innerWidth / 2
  const startY = originY ?? window.innerHeight / 3
  const pieces = []
  for (let i = 0; i < 48; i++) {
    const piece = h('i', { style: { background: confettiColors[i % confettiColors.length], left: `${startX}px`, top: `${startY}px` } })
    layer.appendChild(piece)
    const angle = Math.random() * Math.PI * 2
    const speed = 4 + Math.random() * 7
    pieces.push({ piece, x: 0, y: 0, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 5, spin: Math.random() * 360 })
  }
  let frame = 0
  const tick = () => {
    frame++
    for (const p of pieces) {
      p.vy += 0.32
      p.vx *= 0.985
      p.x += p.vx
      p.y += p.vy
      p.spin += 9
      p.piece.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.spin}deg)`
      p.piece.style.opacity = String(Math.max(0, 1 - frame / 70))
    }
    if (frame < 70) requestAnimationFrame(tick)
    else layer.remove()
  }
  requestAnimationFrame(tick)
}

for (const method of typeof Element === 'undefined' ? [] : ['replaceChildren', 'append', 'prepend']) {
  for (const proto of [Element.prototype, DocumentFragment.prototype]) {
    const original = proto[method]
    proto[method] = function (...nodes) {
      return original.apply(this, nodes.flat().filter(node => node != null && node !== false))
    }
  }
}
