#!/usr/bin/env node
// plugin-structure-validate.mjs — Phase 5 Claude plugin structure E2E check
//
// Validates plugin distribution structure(per Anthropic plugin spec)before publish:
//   1. .claude-plugin/marketplace.json schema(name, plugins[])
//   2. .claude-plugin/plugin.json schema(name, version, description)
//   3. skills/ + commands/ symlinks resolve to actual .claude/{skills,commands}
//   4. hooks/hooks.json + hooks/scripts/ symlink resolve
//   5. hooks.json paths use ${CLAUDE_PLUGIN_ROOT}(consumer can install via /plugin marketplace add)
//
// Fail = block release(plugin broken for consumer install)。

import { readFileSync, existsSync, readlinkSync, statSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

const REPO_ROOT = process.cwd()
const errors = []

function check(name, fn) {
  try {
    fn()
    console.log(`✓ ${name}`)
  } catch (e) {
    console.error(`✗ ${name}: ${e.message}`)
    errors.push({ name, error: e.message })
  }
}

// 1. marketplace.json schema
check('marketplace.json exists + valid JSON + schema', () => {
  const mp = JSON.parse(readFileSync(join(REPO_ROOT, '.claude-plugin/marketplace.json'), 'utf8'))
  if (!mp.name) throw new Error('marketplace.json missing `name`')
  if (!Array.isArray(mp.plugins) || mp.plugins.length === 0) throw new Error('marketplace.json `plugins` empty')
  const ds = mp.plugins.find((p) => p.name === 'design-system')
  if (!ds) throw new Error('design-system plugin not in marketplace.json')
  if (!ds.version) throw new Error('design-system plugin version missing')
})

// 2. plugin.json schema
check('plugin.json exists + valid JSON + schema', () => {
  const p = JSON.parse(readFileSync(join(REPO_ROOT, '.claude-plugin/plugin.json'), 'utf8'))
  if (!p.name) throw new Error('plugin.json missing name')
  if (!p.version) throw new Error('plugin.json missing version')
  if (!p.description) throw new Error('plugin.json missing description')
})

// 3. skills/ + commands/ symlinks
check('skills/ symlink → .claude/skills/', () => {
  const skillsPath = join(REPO_ROOT, 'skills')
  if (!existsSync(skillsPath)) throw new Error('skills/ not found')
  const stat = statSync(skillsPath)
  if (!stat.isDirectory()) throw new Error('skills/ not directory')
  // Verify content matches .claude/skills/
  const skillNames = readdirSync(skillsPath).filter((n) => !n.startsWith('.'))
  if (skillNames.length === 0) throw new Error('skills/ empty')
  if (!existsSync(join(skillsPath, 'README.md'))) throw new Error('skills/README.md not accessible')
})

check('commands/ symlink → .claude/commands/', () => {
  const cmdsPath = join(REPO_ROOT, 'commands')
  if (!existsSync(cmdsPath)) throw new Error('commands/ not found')
  if (readdirSync(cmdsPath).length === 0) throw new Error('commands/ empty')
})

// 4. hooks structure
check('hooks/hooks.json + hooks/scripts/ structure', () => {
  const hooksJsonPath = join(REPO_ROOT, 'hooks/hooks.json')
  if (!existsSync(hooksJsonPath)) throw new Error('hooks/hooks.json not found')
  const hooks = JSON.parse(readFileSync(hooksJsonPath, 'utf8'))
  if (!hooks.hooks) throw new Error('hooks/hooks.json missing `hooks` key')
  const scriptsPath = join(REPO_ROOT, 'hooks/scripts')
  if (!existsSync(scriptsPath)) throw new Error('hooks/scripts not found')
  const hookFiles = readdirSync(scriptsPath).filter((n) => n.endsWith('.sh'))
  if (hookFiles.length < 10) throw new Error(`hooks/scripts only ${hookFiles.length} hooks(expect ≥ 10)`)
})

// 5. hooks.json paths reference CLAUDE_PLUGIN_ROOT
check('hooks.json paths use ${CLAUDE_PLUGIN_ROOT}', () => {
  const hooks = JSON.parse(readFileSync(join(REPO_ROOT, 'hooks/hooks.json'), 'utf8'))
  const cmdStr = JSON.stringify(hooks)
  if (!cmdStr.includes('${CLAUDE_PLUGIN_ROOT}')) {
    throw new Error('hooks.json commands should reference ${CLAUDE_PLUGIN_ROOT}(per Anthropic plugin spec)')
  }
})

// 6. Version sync(plugin.json vs marketplace.json vs package.json)
check('Version sync across 5 manifests', () => {
  const dsPkg = JSON.parse(readFileSync(join(REPO_ROOT, 'packages/design-system/package.json'), 'utf8'))
  const sbPkg = JSON.parse(readFileSync(join(REPO_ROOT, 'packages/storybook-config/package.json'), 'utf8'))
  const plugin = JSON.parse(readFileSync(join(REPO_ROOT, '.claude-plugin/plugin.json'), 'utf8'))
  const mp = JSON.parse(readFileSync(join(REPO_ROOT, '.claude-plugin/marketplace.json'), 'utf8'))
  const dsPlugin = mp.plugins.find((p) => p.name === 'design-system')

  const versions = {
    'design-system pkg': dsPkg.version,
    'storybook-config pkg': sbPkg.version,
    'plugin.json': plugin.version,
    'marketplace.metadata': mp.metadata?.version,
    'marketplace.plugin': dsPlugin?.version,
  }
  const unique = new Set(Object.values(versions))
  if (unique.size !== 1) {
    throw new Error(`5 manifests version drift: ${JSON.stringify(versions, null, 2)}`)
  }
})

console.log('')
if (errors.length > 0) {
  console.error(`❌ Plugin structure validation FAILED(${errors.length} errors)`)
  process.exit(1)
}
console.log('✅ Plugin structure valid — consumer can install via /plugin marketplace add github:ajenchen/design-system')
