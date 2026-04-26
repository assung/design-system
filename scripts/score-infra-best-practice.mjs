#!/usr/bin/env node
// Compute Claude Code infra best-practice score(0-100)across 8 dimensions.
// Output: JSON line for tracking over time + human readable score.
//
// Used by stop_meta_self_audit.sh to detect regression auto-inject self-improve prompt.

import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();

function safeWc(file) {
  try { return parseInt(execSync(`wc -l < "${file}"`).toString().trim()); }
  catch { return 0; }
}

function listFiles(dir, pattern) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(f => pattern.test(f));
}

const dimensions = [];

// === D1: CLAUDE.md size discipline(target ≤ 400, transition cap 800)===
{
  const lines = safeWc('CLAUDE.md');
  const score = lines <= 400 ? 100 : lines <= 600 ? 80 : lines <= 800 ? 60 : 30;
  dimensions.push({ dim: 'D1 CLAUDE.md size', value: `${lines} lines`, score, max: 100 });
}

// === D2: Skill SKILL.md size discipline ===
// Per CLAUDE.md `# 資訊治理 canonical`:
//   - Target ≤ 250(ideal)
//   - Transition cap 400(acceptable in transition)
//   - Over 400 = real violation
// Score = average per-skill where ≤250→100 / 250-400→90(transition) / >400→30
{
  const skillDirs = readdirSync('.claude/skills').filter(d => statSync(join('.claude/skills', d)).isDirectory());
  let totalSkills = 0, sumScore = 0, overBudget = 0, overCap = 0;
  for (const s of skillDirs) {
    const f = join('.claude/skills', s, 'SKILL.md');
    if (existsSync(f)) {
      const l = safeWc(f);
      totalSkills++;
      if (l > 400) { sumScore += 30; overCap++; }
      else if (l > 250) { sumScore += 90; overBudget++; }
      else sumScore += 100;
    }
  }
  const score = totalSkills === 0 ? 0 : Math.round(sumScore / totalSkills);
  dimensions.push({ dim: 'D2 Skill SKILL.md sizes', value: `${overBudget} in transition (250-400) / ${overCap} over cap (>400)`, score, max: 100 });
}

// === D3: Memory entries(target ≤ 20)===
{
  const memDir = '/Users/chenqiren/.claude/projects/-Users-chenqiren-Library-CloudStorage-GoogleDrive-qijenchen-gmail-com--------my-project/memory';
  const entries = existsSync(memDir) ? readdirSync(memDir).filter(f => f.endsWith('.md') && f !== 'MEMORY.md').length : 0;
  const score = entries <= 15 ? 100 : entries <= 20 ? 80 : entries <= 30 ? 50 : 20;
  dimensions.push({ dim: 'D3 Memory entries', value: `${entries}/20`, score, max: 100 });
}

// === D4: Hook test coverage ===
{
  const hooks = listFiles('.claude/hooks', /\.sh$/).filter(f => f !== '_log-fire.sh');
  const tests = listFiles('.claude/hooks/tests', /^test_.*\.sh$/);
  const ratio = hooks.length === 0 ? 0 : tests.length / hooks.length;
  const score = Math.round(ratio * 100);
  dimensions.push({ dim: 'D4 Hook test coverage', value: `${tests.length}/${hooks.length}`, score, max: 100 });
}

// === D5: CI workflow presence ===
{
  const ciExists = existsSync('.github/workflows/ci.yml');
  const score = ciExists ? 100 : 0;
  dimensions.push({ dim: 'D5 CI workflow', value: ciExists ? 'present' : 'missing', score, max: 100 });
}

// === D6: Self-audit hook presence(stop_self_audit + audit-content-quality)===
{
  const selfAudit = existsSync('.claude/hooks/stop_self_audit.sh');
  const contentAudit = existsSync('scripts/audit-content-quality.mjs');
  const score = (selfAudit ? 50 : 0) + (contentAudit ? 50 : 0);
  dimensions.push({ dim: 'D6 Self-audit mechanisms', value: `${selfAudit ? 'self_audit ✓' : ''} ${contentAudit ? 'content_audit ✓' : ''}`.trim(), score, max: 100 });
}

// === D7: Codify-principle generator skill presence ===
{
  const exists = existsSync('.claude/skills/codify-principle/SKILL.md');
  const score = exists ? 100 : 0;
  dimensions.push({ dim: 'D7 Principle generator skill', value: exists ? 'present' : 'missing', score, max: 100 });
}

// === D8: tsc + storybook build state(actual mechanical pass)===
{
  let tscPass = false;
  try {
    const out = execSync('npx tsc -b 2>&1 | grep -c "error TS" || true').toString().trim();
    tscPass = out === '0';
  } catch {}
  // Don't run storybook build (slow) — just check storybook-static existence as proxy
  const sbStatic = existsSync('storybook-static');
  const score = (tscPass ? 70 : 0) + (sbStatic ? 30 : 0);
  dimensions.push({ dim: 'D8 Build state', value: `tsc ${tscPass ? '✓' : '✗'} / storybook-static ${sbStatic ? '✓' : '✗'}`, score, max: 100 });
}

// === Aggregate ===
const total = dimensions.reduce((s, d) => s + d.score, 0);
const max = dimensions.reduce((s, d) => s + d.max, 0);
const finalScore = Math.round((total / max) * 100);

const result = {
  ts: new Date().toISOString(),
  finalScore,
  dimensions,
};

// Output JSON for tracking
const logPath = '.claude/logs/infra-best-practice-score.jsonl';
try {
  writeFileSync(logPath, JSON.stringify(result) + '\n', { flag: 'a' });
} catch {}

// Human readable output
if (process.argv.includes('--json')) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`\n=== Infra Best-Practice Score: ${finalScore}/100 ===\n`);
  for (const d of dimensions) {
    const bar = '█'.repeat(Math.floor(d.score / 10)) + '░'.repeat(10 - Math.floor(d.score / 10));
    console.log(`  ${bar} ${d.score.toString().padStart(3)}/100 — ${d.dim} (${d.value})`);
  }
  console.log('');
}

// Exit code: 0 if ≥ 80, 1 if regressed
process.exit(finalScore >= 80 ? 0 : 1);
