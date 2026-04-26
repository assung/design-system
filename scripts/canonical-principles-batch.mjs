#!/usr/bin/env node
// Phase 2 align — strict canonical principles (universal core ≥ 2 of
// {WhenToUse / WhenNotToUse / Vs*Rule / ContentGuidelines}).
//
// Strategy:
//   1. Components with `ComponentChoiceRule` → rename to `WhenNotToUse`
//      (content is functionally when-not + alternatives, just named differently)
//   2. Components without any Vs*/WhenNotToUse → add WhenNotToUse story sourced
//      from spec.md「何時不用」section

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';

// 19 components to fix per Audit 30
const TARGETS = [
  'Button', 'DataTable', 'Input', 'Select', 'Dialog', 'Slider', 'Combobox',
  'NumberInput', 'DatePicker', 'DateGrid', 'TreeView', 'Steps', 'Empty',
  'FileItem', 'FileViewer', 'TimePicker', 'Sidebar', 'Separator',
  'SegmentedControl',
];

// Step 1: Rename ComponentChoiceRule → WhenNotToUse where it exists
const renames = [];
const adds = [];

for (const comp of TARGETS) {
  const dir = `src/design-system/components/${comp}`;
  const files = readdirSync(dir).filter(f => f.endsWith('.principles.stories.tsx'));
  if (files.length === 0) continue;
  const file = join(dir, files[0]);
  let content = readFileSync(file, 'utf-8');

  // Detect existing exports
  const exports = [...content.matchAll(/^export const ([A-Z]\w+)/gm)].map(m => m[1]);
  const hasWhenNotToUse = exports.some(e => /^(WhenNotToUse|Forbidden|Donts|Pitfalls|Prohibitions|NonGoals|VisualDonts)/.test(e));
  // Match prefix VsX (VsTabsRule) OR infix XVsY (CalendarVsDatePickerRule) — both are Carbon「versus」idiom
  const hasVs = exports.some(e => /^Vs[A-Z]/.test(e) || /[A-Z][a-z]+Vs[A-Z]/.test(e));
  const hasComponentChoice = exports.includes('ComponentChoiceRule');

  if (hasWhenNotToUse || hasVs) continue; // already has core

  if (hasComponentChoice) {
    // Rename ComponentChoiceRule → WhenNotToUse
    content = content.replace(/\bComponentChoiceRule\b/g, 'WhenNotToUse');
    writeFileSync(file, content);
    renames.push(comp);
  } else {
    adds.push({ comp, file, exports });
  }
}

console.log(`=== Phase 2 canonical alignment ===\n`);
console.log(`Renamed ComponentChoiceRule → WhenNotToUse: ${renames.length}`);
renames.forEach(c => console.log(`  ✓ ${c}`));
console.log(`\nNeed ADD WhenNotToUse story: ${adds.length}`);
adds.forEach(a => console.log(`  + ${a.comp} (current: ${a.exports.slice(0, 4).join(',')})`));
