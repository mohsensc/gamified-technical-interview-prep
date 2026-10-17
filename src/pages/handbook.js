import { h, toast } from '../ui/h.js'
import { icon } from '../ui/icons.js'
import { codeBlock } from '../ui/code.js'
import { chapters, chapterById } from '../content/handbook.js'
import { rich, stripMarks } from '../ui/rich.js'
import { subnav } from '../ui/subnav.js'

let panelRenderer = null
const loadPanelRenderer = () => {
  if (!panelRenderer) panelRenderer = import('../viz/render.js').then(mod => mod.renderPanels || mod.default).catch(() => null)
  return panelRenderer
}

export const panelsView = panels => {
  const wrap = h('div', { class: 'hb-panels' })
  loadPanelRenderer().then(renderPanels => {
    if (!renderPanels) {
      wrap.append(h('div', { class: 'muted' }, 'Diagram unavailable'))
      return
    }
    try {
      const out = renderPanels.length >= 2 ? renderPanels(wrap, panels) : renderPanels(panels)
      if (out instanceof Node) wrap.append(out)
    } catch (error) {
      wrap.append(h('div', { class: 'muted' }, 'Diagram failed to render'))
    }
  })
  return wrap
}

export const copyableCode = (source, title) => {
  const copyButton = h('button', {
    class: 'btn btn-ghost hb-copy',
    onclick: () => {
      navigator.clipboard?.writeText(source).then(() => toast('Copied', 'good')).catch(() => toast('Copy failed', 'bad'))
    },
  }, 'Copy')
  return h('div', { class: 'hb-code' },
    h('div', { class: 'hb-code-head' }, h('span', { class: 'hb-code-title' }, stripMarks(title || 'python')), copyButton),
    codeBlock(source, { lineNumbers: true }))
}

const barsSection = section => h('div', { class: 'hb-bars' },
  section.rows.map(row => h('div', { class: 'hb-bar-row' },
    h('span', { class: 'hb-bar-n' }, row.n),
    h('div', { class: 'hb-bar-track' },
      h('div', { class: 'hb-bar-fill', style: { width: `${Math.round(row.level * 100)}%`, '--heat': row.level } },
        h('span', { class: 'hb-bar-label' }, rich(row.complexity)))),
    h('span', { class: 'hb-bar-example muted' }, rich(row.example)))))

const tableSection = section => h('div', { class: 'hb-table-wrap' },
  h('table', { class: 'hb-table' },
    h('thead', null, h('tr', null, section.cols.map(col => h('th', null, stripMarks(col))))),
    h('tbody', null, section.rows.map(row => h('tr', null, row.map((cell, index) => h('td', { class: index === 0 ? 'hb-cell-key' : '' }, rich(cell))))))))

const whereSection = section => h('div', { class: 'hb-where' },
  section.items.map(item => h('a', { class: 'hb-where-card', href: `#/drill/${item.skill}` },
    h('div', { class: 'hb-where-signal' }, `"${stripMarks(item.signal)}"`),
    h('div', { class: 'hb-where-pattern' }, stripMarks(item.pattern)),
    h('div', { class: 'muted hb-small' }, `${stripMarks(item.think)} · ${stripMarks(item.ds)}`))))

export const flowSection = section => {
  const root = h('div', { class: 'hb-flow' })
  const trail = []
  const draw = () => {
    root.replaceChildren()
    const chain = h('div', { class: 'hb-flow-chain' })
    trail.forEach(({ nodeId, answer }) => {
      chain.append(
        h('div', { class: 'hb-flow-node answered' }, stripMarks(section.nodes[nodeId].q)),
        h('div', { class: `hb-flow-edge ${answer ? 'yes' : 'no'}` }, answer ? 'yes' : 'no'))
    })
    const lastStep = trail[trail.length - 1]
    const currentId = lastStep ? section.nodes[lastStep.nodeId][lastStep.answer ? 'yes' : 'no'] : section.start
    if (currentId.startsWith('L:')) {
      const leaf = section.leaves[currentId.slice(2)]
      chain.append(h('div', { class: 'hb-flow-leaf' },
        h('div', { class: 'hb-flow-leaf-title' }, stripMarks(leaf.pattern)),
        h('div', { class: 'row hb-flow-meta' }, h('span', { class: 'pill' }, leaf.ds), h('span', { class: 'pill' }, leaf.time)),
        h('div', { class: 'row' },
          h('a', { class: 'btn btn-primary', href: `#/drill/${leaf.skill}` }, 'Drill it'),
          h('button', { class: 'btn btn-ghost', onclick: () => { trail.pop(); draw() } }, 'Back'),
          h('button', { class: 'btn btn-ghost', onclick: () => { trail.length = 0; draw() } }, 'Restart'))))
    } else {
      chain.append(h('div', { class: 'hb-flow-node current' },
        h('div', { class: 'hb-flow-q' }, rich(section.nodes[currentId].q)),
        h('div', { class: 'row hb-flow-buttons' },
          h('button', { class: 'btn btn-primary', onclick: () => { trail.push({ nodeId: currentId, answer: true }); draw() } }, 'Yes'),
          h('button', { class: 'btn', onclick: () => { trail.push({ nodeId: currentId, answer: false }); draw() } }, 'No'),
          trail.length ? h('button', { class: 'btn btn-ghost', onclick: () => { trail.pop(); draw() } }, 'Back') : null)))
    }
    root.append(chain)
  }
  draw()
  return root
}

const stepsSection = section => h('div', { class: 'hb-steps' },
  section.items.map((step, index) => h('div', { class: 'hb-step card' },
    h('div', { class: 'hb-step-head' }, h('span', { class: 'hb-step-num' }, index + 1), h('span', null, icon(step.icon, 15), ` ${stripMarks(step.title)}`), h('span', { class: 'pill' }, `${step.minutes}m`)),
    h('div', { class: 'muted hb-small' }, rich(step.goal)),
    h('div', { class: 'hb-starter' }, '“', rich(step.starters[0]), '”'))))

const tipsSection = section => h('div', { class: 'hb-tips' },
  section.items.map(tip => h('div', { class: 'hb-tip' }, h('strong', null, stripMarks(tip.title)), h('span', { class: 'muted hb-small' }, rich(tip.text)))))

const listSection = section => h('div', { class: 'hb-checklist' },
  section.items.map(item => h('label', { class: 'hb-check' }, h('input', { type: 'checkbox' }), h('span', null, rich(item)))))

const narrationSection = section => h('div', { class: 'hb-narration' },
  section.items.map(template => h('div', { class: 'hb-narration-card', style: { minWidth: 0 } },
    h('div', { class: 'hb-narration-title' }, stripMarks(template.title)),
    template.lines.map(line => h('div', { class: 'hb-say', style: { minWidth: 0 } },
      h('span', { class: 'chip' }, stripMarks(line.cue)),
      h('span', { style: { minWidth: 0, overflowWrap: 'anywhere' } }, rich(line.say)))))))

const sectionRenderers = {
  bars: barsSection,
  table: tableSection,
  where: whereSection,
  flow: flowSection,
  steps: stepsSection,
  tips: tipsSection,
  list: listSection,
  narration: narrationSection,
  code: section => h('div', { class: 'stack' }, section.when ? h('div', { class: 'hb-when' }, h('span', { class: 'chip' }, 'when'), rich(section.when)) : null, copyableCode(section.code, section.title)),
  panels: section => panelsView(section.panels),
}

const renderSection = section => {
  const render = sectionRenderers[section.type]
  if (!render) return null
  const wide = ['code', 'flow', 'bars', 'panels', 'where', 'steps', 'narration'].includes(section.type)
  return h('section', { class: `card hb-section ${wide ? 'hb-wide' : ''}` },
    section.type === 'code' ? null : h('h3', { class: 'hb-section-title' }, stripMarks(section.title)),
    render(section))
}

const renderList = container => {
  container.append(h('div', { class: 'page' },
    subnav('handbook', 'handbook'),
    h('div', { class: 'page-header' }, h('h1', null, 'Handbook')),
    h('div', { class: 'grid hb-grid' },
      chapters.map(chapter => h('a', { class: 'card hb-chapter', href: `#/handbook/${chapter.id}` },
        h('div', { class: 'hb-chapter-icon' }, icon(chapter.icon, 24)),
        h('div', { class: 'hb-chapter-title' }, stripMarks(chapter.title)),
        h('div', { class: 'muted hb-small' }, stripMarks(chapter.blurb)))))))
}

export default function render(container, params = {}) {
  const chapter = params.id ? chapterById[params.id] : null
  if (!chapter) {
    renderList(container)
    return
  }
  const index = chapters.indexOf(chapter)
  const previous = chapters[index - 1]
  const next = chapters[index + 1]
  container.append(h('div', { class: 'page hb-page' },
    subnav('handbook', 'handbook'),
    h('div', { class: 'page-header' },
      h('a', { class: 'btn btn-ghost', href: '#/handbook' }, '← Handbook'),
      h('h1', { class: 'row' }, icon(chapter.icon, 24), ` ${stripMarks(chapter.title)}`)),
    h('div', { class: 'row hb-tabs' }, chapters.map(other => h('a', { class: `chip ${other.id === chapter.id ? 'active' : ''}`, href: `#/handbook/${other.id}` }, stripMarks(other.title)))),
    h('div', { class: 'hb-sections' }, chapter.sections.map(renderSection)),
    h('div', { class: 'row hb-pager' },
      previous ? h('a', { class: 'btn btn-ghost', href: `#/handbook/${previous.id}` }, `← ${stripMarks(previous.title)}`) : h('span'),
      next ? h('a', { class: 'btn btn-primary', href: `#/handbook/${next.id}` }, `${stripMarks(next.title)} →`) : null)))
}
