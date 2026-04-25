import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage()

console.log('═══ Test source-first extraction(recursive walk) ═══\n')

await p.goto('http://localhost:6006/?path=/story/design-system-components-button-%E5%B1%95%E7%A4%BA--icon-only&viewMode=story', { waitUntil: 'networkidle' })
await p.waitForTimeout(1500)

const result = await p.frameLocator('#storybook-preview-iframe').locator('#storybook-root button').first().evaluate(el => {
  // Replicate extractSourceVars logic with recursive walk
  const map = {}
  function walkRules(rules) {
    if (!rules) return
    for (const rule of rules) {
      if (rule.cssRules) walkRules(rule.cssRules)
      if (!(rule instanceof CSSStyleRule)) continue
      try { if (!el.matches(rule.selectorText)) continue } catch { continue }
      const decl = rule.style
      for (let i = 0; i < decl.length; i++) {
        const prop = decl.item(i)
        const val = decl.getPropertyValue(prop)
        if (/var\(/.test(val)) {
          if (!map[prop]) map[prop] = []
          map[prop].push({ rawValue: val, fromSelector: rule.selectorText })
        }
      }
    }
  }
  for (const sheet of document.styleSheets) {
    let rules
    try { rules = sheet.cssRules } catch { continue }
    walkRules(rules)
  }
  return map
})

console.log('Button source-extracted vars(recursive walk):')
for (const [prop, decls] of Object.entries(result)) {
  console.log(`  ${prop}:`)
  decls.slice(0, 3).forEach(d => console.log(`    ${d.fromSelector} → ${d.rawValue}`))
}

console.log('\n═══ SVG element source vars ═══\n')
const svgResult = await p.frameLocator('#storybook-preview-iframe').locator('#storybook-root button svg').first().evaluate(el => {
  const map = {}
  function walkRules(rules) {
    if (!rules) return
    for (const rule of rules) {
      if (rule.cssRules) walkRules(rule.cssRules)
      if (!(rule instanceof CSSStyleRule)) continue
      try { if (!el.matches(rule.selectorText)) continue } catch { continue }
      const decl = rule.style
      for (let i = 0; i < decl.length; i++) {
        const prop = decl.item(i)
        const val = decl.getPropertyValue(prop)
        if (/var\(/.test(val)) {
          if (!map[prop]) map[prop] = []
          map[prop].push({ rawValue: val, fromSelector: rule.selectorText })
        }
      }
    }
  }
  for (const sheet of document.styleSheets) {
    let rules
    try { rules = sheet.cssRules } catch { continue }
    walkRules(rules)
  }
  const cs = getComputedStyle(el)
  return { sourceVars: map, computedWidth: cs.width, computedHeight: cs.height }
})
console.log('SVG source-extracted vars(should be EMPTY for width/height — author 沒寫 token):')
console.log(JSON.stringify(svgResult, null, 2))
await b.close()
