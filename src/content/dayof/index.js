const sheetPaths = ['./init.js', './decide.js', './graphs.js', './patterns.js', './strings.js', './trees-design.js', './interview.js']

async function safeLoad(path) {
  try {
    const mod = await import(path)
    const sheet = mod?.default
    if (!sheet || !sheet.id) return null
    return sheet
  } catch (error) {
    console.error('dayof sheet failed to load', path, error)
    return null
  }
}

const loaded = await Promise.all(sheetPaths.map(safeLoad))

export const sheets = loaded.filter(Boolean)
export const sheetById = Object.fromEntries(sheets.map(sheet => [sheet.id, sheet]))
export const missingSheets = sheetPaths.length - sheets.length
