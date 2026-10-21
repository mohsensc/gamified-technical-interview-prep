const exactKeys = {
  'codecram-state': 'techprep-state',
  'google-cram-state': 'techprep-state',
  'codecram-theme': 'techprep-theme',
  'codecram-rail': 'techprep-rail',
  'codecram-auth': 'techprep-auth',
  'cram.stepHint': 'techprep.stepHint',
  'cram.practiceScope': 'techprep.practiceScope',
  'cram.algoView': 'techprep.algoView',
  'cram.algoPath': 'techprep.algoPath',
}

const prefixKeys = [
  ['codecram-state:', 'techprep-state:'],
  ['codecram-pending-merge:', 'techprep-pending-merge:'],
]

const targetFor = key => {
  if (exactKeys[key]) return exactKeys[key]
  for (const [oldPrefix, newPrefix] of prefixKeys) {
    if (key.startsWith(oldPrefix)) return newPrefix + key.slice(oldPrefix.length)
  }
  return null
}

const migrateStore = store => {
  const oldKeys = []
  for (let index = 0; index < store.length; index += 1) {
    const key = store.key(index)
    if (key && targetFor(key)) oldKeys.push(key)
  }
  oldKeys.sort((a, b) => (a === 'google-cram-state' ? 1 : 0) - (b === 'google-cram-state' ? 1 : 0))
  for (const key of oldKeys) {
    const target = targetFor(key)
    const value = store.getItem(key)
    if (value !== null && store.getItem(target) === null) store.setItem(target, value)
    store.removeItem(key)
  }
}

export function migrateLegacyStorage() {
  try { migrateStore(localStorage) } catch {}
  try { migrateStore(sessionStorage) } catch {}
}

migrateLegacyStorage()
