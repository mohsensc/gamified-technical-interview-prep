const svgNamespace = 'http://www.w3.org/2000/svg'

export function logoGlyph() {
  const svg = document.createElementNS(svgNamespace, 'svg')
  svg.setAttribute('viewBox', '0 0 32 32')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('class', 'brand-glyph')
  const path = document.createElementNS(svgNamespace, 'path')
  path.setAttribute('d', 'M7 9.5h13a4.25 4.25 0 0 1 0 8.5h-6M13.5 9.5v14')
  svg.append(path)
  return svg
}
