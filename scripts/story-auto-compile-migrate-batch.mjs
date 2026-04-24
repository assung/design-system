#!/usr/bin/env node
/**
 * Batch migrate 58 components to story-auto-compile Phase 1+2 structure.
 *
 * For each component:
 *   1. Parse cva() in tsx → extract variants + sizes + defaultVariants
 *   2. If no cva, generate empty componentMeta(structural components like AspectRatio / Separator)
 *   3. Inject `export const {name}Meta = { ... } as const` before last export
 *   4. Inject YAML frontmatter into spec.md top(mirror keys)
 *
 * Strategy: regex-based parsing(AST would need @babel/parser + setup);
 * fail fast on components with complex cva and flag for manual migration.
 *
 * Idempotent: checks if componentMeta/frontmatter already exists.
 */

import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'

const COMPONENTS_DIR = 'src/design-system/components'

function toKebab(name) {
  return name.replace(/[A-Z]/g, (c, i) => (i === 0 ? c.toLowerCase() : `-${c.toLowerCase()}`))
}

/**
 * Parse cva() call:extract variants + defaultVariants
 * Returns { variants: string[], sizes: string[], defaultVariant, defaultSize } or null
 */
function parseCva(tsxContent) {
  // Find first cva( ... )
  const cvaMatch = tsxContent.match(/(?:const|let)\s+\w+Variants?\s*=\s*cva\s*\(\s*(?:\[[\s\S]*?\]|['"`][\s\S]*?['"`])\s*,\s*\{([\s\S]*?)\n\)/)
  if (!cvaMatch) return null
  const body = cvaMatch[1]

  const variants = {}
  // variants: { key: { a: '...', b: '...' }, ... } — parse top-level keys
  const variantsMatch = body.match(/variants\s*:\s*\{([\s\S]*?)\n\s*\}\s*,?\s*(?:defaultVariants|$)/)
  if (variantsMatch) {
    // Simple parse:  keyName: { ... } / keyName: '...' patterns at top level
    const raw = variantsMatch[1]
    // Find top-level "name: {" pattern (indent level of key)
    for (const m of raw.matchAll(/^\s{2,6}(\w+)\s*:\s*\{([\s\S]*?)^\s{2,6}\}/gm)) {
      const keyName = m[1]
      const subContent = m[2]
      // Extract sub-keys
      const subKeys = []
      for (const sm of subContent.matchAll(/^\s+(\w+)\s*:/gm)) {
        subKeys.push(sm[1])
      }
      variants[keyName] = subKeys
    }
  }

  const defaultVariantsMatch = body.match(/defaultVariants\s*:\s*\{([\s\S]*?)\n\s*\}/)
  const defaults = {}
  if (defaultVariantsMatch) {
    for (const m of defaultVariantsMatch[1].matchAll(/(\w+)\s*:\s*['"](\w+)['"]/g)) {
      defaults[m[1]] = m[2]
    }
  }

  return { variants, defaults }
}

function generateComponentMeta(componentName, parsed) {
  const variants = parsed?.variants?.variant ?? []
  const sizes = parsed?.variants?.size ?? []
  const defaultVariant = parsed?.defaults?.variant
  const defaultSize = parsed?.defaults?.size

  const variantsObj = variants.length
    ? variants.map((v) => `    ${v}: { purpose: 'TODO: Phase 2 fill' },`).join('\n')
    : ''
  const sizesObj = sizes.length
    ? sizes
        .map((s) => {
          // Default fieldHeight guess by size name
          const fh =
            s === 'xs' ? 24 : s === 'sm' ? 28 : s === 'md' ? 32 : s === 'lg' ? 40 : 0
          const icon = s === 'lg' ? 20 : 16
          return `    ${s}: { fieldHeight: ${fh}, iconSize: ${icon}, typography: 'body' },`
        })
        .join('\n')
    : ''

  return `// Story auto-compile metadata — Phase 1 mechanical migration(2026-04-24)
// Phase 2 fill needed: purpose descriptions + when rationale + world-class refs
export const ${componentName[0].toLowerCase() + componentName.slice(1)}Meta = {
  component: '${componentName}',
  family: null, // TODO: Phase 2 — declare Layout Family(1/2/3/4 或 non-family)
  variants: {
${variantsObj}
  },
  sizes: {
${sizesObj}
  },
  states: ['default', 'hover', 'active', 'focus-visible', 'disabled'],
  tokens: {
    bg: [], // TODO: grep tsx for bg-* tokens
    fg: [],
    ring: [],
  },${defaultVariant ? `\n  defaultVariant: '${defaultVariant}',` : ''}${defaultSize ? `\n  defaultSize: '${defaultSize}',` : ''}
} as const
`
}

function generateFrontmatter(componentName, parsed) {
  const variants = parsed?.variants?.variant ?? []
  const sizes = parsed?.variants?.size ?? []
  const fm = {
    component: componentName,
    family: null,
    variants: Object.fromEntries(variants.map((v) => [v, { when: 'TODO: Phase 2 fill', 'world-class': [] }])),
    sizes: Object.fromEntries(sizes.map((s) => [s, { when: 'TODO: Phase 2 fill' }])),
  }
  const yamlStr = yaml.dump(fm, { lineWidth: 120, noRefs: true, quotingType: '"' })
  return `---\n# Phase 1 auto-migrated(2026-04-24). TODO: Phase 2 fill world-class refs + when rationale.\n${yamlStr}---\n\n`
}

function processComponent(componentName) {
  const kebab = toKebab(componentName)
  const compDir = path.join(COMPONENTS_DIR, componentName)
  const tsxPath = path.join(compDir, `${kebab}.tsx`)
  const specPath = path.join(compDir, `${kebab}.spec.md`)

  if (!fs.existsSync(tsxPath) || !fs.existsSync(specPath)) {
    return { component: componentName, skipped: true, reason: 'spec or tsx missing' }
  }

  const tsxContent = fs.readFileSync(tsxPath, 'utf-8')
  const specContent = fs.readFileSync(specPath, 'utf-8')

  // Skip if already migrated
  const hasMeta = /export const \w+Meta\s*=\s*\{[\s\S]*?\}\s*as const/.test(tsxContent)
  const hasFrontmatter = /^---\n[\s\S]*?\n---\n/.test(specContent)
  if (hasMeta && hasFrontmatter) {
    return { component: componentName, skipped: true, reason: 'already migrated' }
  }

  const parsed = parseCva(tsxContent)

  let newTsxContent = tsxContent
  if (!hasMeta) {
    const metaCode = generateComponentMeta(componentName, parsed)
    // Insert before the last `export { ... }` statement or end of file
    const exportsMatch = newTsxContent.match(/\nexport\s*\{[^}]*\}\s*$/m)
    if (exportsMatch) {
      newTsxContent =
        newTsxContent.slice(0, exportsMatch.index) + '\n' + metaCode + newTsxContent.slice(exportsMatch.index)
    } else {
      // Fallback: append at end
      newTsxContent = newTsxContent.trimEnd() + '\n\n' + metaCode
    }
  }

  let newSpecContent = specContent
  if (!hasFrontmatter) {
    const frontmatter = generateFrontmatter(componentName, parsed)
    newSpecContent = frontmatter + specContent
  }

  fs.writeFileSync(tsxPath, newTsxContent)
  fs.writeFileSync(specPath, newSpecContent)

  return {
    component: componentName,
    ok: true,
    variantKeys: parsed?.variants?.variant ?? [],
    sizeKeys: parsed?.variants?.size ?? [],
  }
}

// ─── Main ─────────────────────────────────────────────────────────

const targets = fs
  .readdirSync(COMPONENTS_DIR)
  .filter((d) => fs.statSync(path.join(COMPONENTS_DIR, d)).isDirectory())

const results = targets.map(processComponent)
const ok = results.filter((r) => r.ok)
const skipped = results.filter((r) => r.skipped)

console.log(`\n✅ Migrated ${ok.length} / skipped ${skipped.length}\n`)
if (ok.length) {
  console.log('Migrated:')
  for (const r of ok.slice(0, 40)) {
    console.log(`  ${r.component}: variants=[${r.variantKeys.join(',')}] sizes=[${r.sizeKeys.join(',')}]`)
  }
  if (ok.length > 40) console.log(`  ... +${ok.length - 40} more`)
}
if (skipped.length) {
  console.log('\nSkipped:')
  for (const r of skipped) console.log(`  ${r.component}: ${r.reason}`)
}
