const categoryPaths = ['./graphs.js', './graphs-weighted.js', './trees.js', './dp.js', './stack-trie.js', './strings.js', './arrays-pointers.js', './windows-search.js', './lists-heaps.js', './backtracking-greedy.js']

async function safeLoad(path) {
  try {
    const mod = await import(path)
    const category = mod?.default
    if (!category || !category.id) return null
    return { ...category, items: Array.isArray(category.items) ? category.items : [] }
  } catch (error) {
    console.error('thought category failed to load', path, error)
    return null
  }
}

let cache = null

export async function loadThought() {
  if (cache) return cache
  const loaded = await Promise.all(categoryPaths.map(safeLoad))
  const categories = loaded.filter(Boolean)
  const items = categories.flatMap(category => category.items)
  cache = { categories, items }
  return cache
}
