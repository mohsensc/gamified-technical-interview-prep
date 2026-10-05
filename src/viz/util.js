export function syncKeyed(parent, list, keyOf, make, patch) {
  const cache = parent._keyed || (parent._keyed = new Map())
  const used = new Set()
  list.forEach((item, index) => {
    const key = String(keyOf(item, index))
    if (used.has(key)) return
    used.add(key)
    let node = cache.get(key)
    const fresh = !node
    if (fresh) {
      node = make(item, index)
      cache.set(key, node)
      node.classList.add('viz-enter')
      node.addEventListener('animationend', () => node.classList.remove('viz-enter'), { once: true })
    }
    patch(node, item, index, fresh)
    const at = parent.childNodes[used.size - 1]
    if (at !== node) parent.insertBefore(node, at || null)
  })
  for (const [key, node] of cache) {
    if (!used.has(key)) {
      node.remove()
      cache.delete(key)
    }
  }
}

export function flash(node) {
  node.classList.remove('viz-flash')
  void node.getBoundingClientRect()
  node.classList.add('viz-flash')
}

export function setText(node, text) {
  const value = String(text)
  if (node.textContent === value) return false
  node.textContent = value
  return true
}

export function formatValue(value, depth = 0) {
  if (value === null || value === undefined) return 'None'
  if (value === true) return 'True'
  if (value === false) return 'False'
  if (typeof value === 'number') {
    if (value === Infinity) return '∞'
    if (value === -Infinity) return '-∞'
    if (Number.isNaN(value)) return 'NaN'
    return Number.isInteger(value) ? String(value) : String(Math.round(value * 1000) / 1000)
  }
  if (typeof value === 'string') return depth ? `'${value}'` : value
  if (depth > 3) return '…'
  if (Array.isArray(value)) return `[${value.slice(0, 40).map(item => formatValue(item, depth + 1)).join(', ')}${value.length > 40 ? ', …' : ''}]`
  if (value instanceof Set) return value.size ? `{${[...value].slice(0, 40).map(item => formatValue(item, depth + 1)).join(', ')}}` : 'set()'
  if (value instanceof Map) return `{${[...value].slice(0, 30).map(([k, v]) => `${formatValue(k, depth + 1)}: ${formatValue(v, depth + 1)}`).join(', ')}}`
  if (typeof value === 'object') {
    if ('val' in value && ('next' in value || 'left' in value || 'right' in value || 'neighbors' in value)) return `Node(${formatValue(value.val, depth + 1)})`
    const entries = Object.entries(value)
    return `{${entries.slice(0, 30).map(([k, v]) => `${formatValue(k, 1)}: ${formatValue(v, depth + 1)}`).join(', ')}${entries.length > 30 ? ', …' : ''}}`
  }
  if (typeof value === 'function') return 'ƒ'
  return String(value)
}

export const cellText = value => formatValue(value, 0)

export function deepClone(value, seen = new WeakMap(), depth = 0) {
  if (value === null || typeof value !== 'object') return typeof value === 'function' ? undefined : value
  if (seen.has(value)) return seen.get(value)
  if (depth > 40) return value
  if (Array.isArray(value)) {
    const copy = []
    seen.set(value, copy)
    for (const item of value) copy.push(deepClone(item, seen, depth + 1))
    return copy
  }
  if (value instanceof Set) {
    const copy = new Set()
    seen.set(value, copy)
    for (const item of value) copy.add(deepClone(item, seen, depth + 1))
    return copy
  }
  if (value instanceof Map) {
    const copy = new Map()
    seen.set(value, copy)
    for (const [k, v] of value) copy.set(k, deepClone(v, seen, depth + 1))
    return copy
  }
  const copy = {}
  seen.set(value, copy)
  for (const [k, v] of Object.entries(value)) copy[k] = deepClone(v, seen, depth + 1)
  return copy
}

export const stateClass = state => (state ? `st-${state}` : '')

export const asList = value => (Array.isArray(value) ? value : value == null ? [] : [value])
