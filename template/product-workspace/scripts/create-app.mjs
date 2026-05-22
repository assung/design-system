#!/usr/bin/env node
// scripts/create-app.mjs — Phase 5 Deliverable
// Usage: `npm run create-app <kebab-name>`(e.g. order-dashboard)
// Copies apps/_template/ → apps/<name>/,replaces placeholders.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const name = process.argv[2]
if (!name || !/^[a-z][a-z0-9-]*$/.test(name)) {
  console.error('Usage: npm run create-app <kebab-name>')
  console.error('  Example:npm run create-app order-dashboard')
  process.exit(1)
}

const TEMPLATE = path.join(ROOT, 'apps/_template')
const TARGET = path.join(ROOT, 'apps', name)

if (fs.existsSync(TARGET)) {
  console.error(`✗ apps/${name}/ already exists`)
  process.exit(1)
}

// Recursive copy with placeholder replace
function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const sp = path.join(src, entry.name)
    const dp = path.join(dst, entry.name)
    if (entry.isDirectory()) copyDir(sp, dp)
    else {
      const content = fs.readFileSync(sp, 'utf8')
        .replace(/__APP_NAME__/g, name)
        .replace(/__APP_PASCAL__/g, name.split('-').map(s => s[0].toUpperCase() + s.slice(1)).join(''))
      fs.writeFileSync(dp, content)
    }
  }
}

copyDir(TEMPLATE, TARGET)
console.log(`✓ apps/${name}/ created from _template`)
console.log('  next steps:')
console.log(`    cd apps/${name}`)
console.log(`    npm run dev    # localhost:5173`)
console.log('  or run \`npm run storybook\` from workspace root')
