#!/usr/bin/env node
/**
 * Q2 Issue 2 pixel measure — cell edit vs display avatar.left delta（2026-05-13）
 *
 * 量 PeoplePicker multi 2-avatar stack 在 cell:
 *   - row0 display mode → avatars[0].left vs cell.left → relLeft
 *   - row0 edit mode（click → enter edit）→ avatars[0].left vs cell.left → relLeft
 *   - delta = edit.relLeft - display.relLeft
 *
 * Codex hypothesis:若 FieldSurface 沒 propagate 到 edit path → people-picker.tsx:310 走
 * `surface==='form'?8:undefined` → edit 多 8px。Layer A 撤回:cell-registry.tsx:483 用
 * 同一 Cell 給兩 path。真因更可能 Tag-chip wrapper vs raw PersonDisplay DOM 不對稱。
 *
 * 出真 number 才 verdict。
 */

import { chromium } from 'playwright'

const STORYBOOK_URL = process.env.STORYBOOK_URL || 'http://localhost:6006'
const STORY_ID = 'design-system-components-datatable-展示--inline-edit'
const url = `${STORYBOOK_URL}/iframe.html?id=${STORY_ID}&viewMode=story`

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } })
let exitCode = 0

try {
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)

  // reviewers column is multiPerson — find a row with exactly 2 avatars
  const findRowWith2 = async () => {
    return await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('[role="row"][data-row-index]'))
      for (const row of rows) {
        const cell = row.querySelector('[data-column-id="reviewers"]')
        if (!cell) continue
        const avatars = cell.querySelectorAll('img, [class*="rounded-full"]')
        // Filter out overflow indicator (count ≥ 2 = stack mode candidate)
        if (avatars.length >= 2) {
          return { rowIndex: row.getAttribute('data-row-index'), avatarCount: avatars.length }
        }
      }
      return null
    })
  }

  const target = await findRowWith2()
  if (!target) { console.error('FAIL: no row with multi avatar found'); process.exit(2) }
  console.log(`[setup] target row idx=${target.rowIndex} avatars=${target.avatarCount}`)

  const measure = async (label) => {
    return await page.evaluate(({ rowIndex }) => {
      const cell = document.querySelector(`[role="row"][data-row-index="${rowIndex}"] [data-column-id="reviewers"]`)
      if (!cell) return { error: 'cell not found' }
      const cellRect = cell.getBoundingClientRect()
      const cellCs = getComputedStyle(cell)

      // Find field (data-field-mode wrapper)
      const field = cell.querySelector('[data-field-mode]')
      const fieldRect = field?.getBoundingClientRect()
      const fieldCs = field ? getComputedStyle(field) : null

      // Find tag area (Combobox internal flex container)
      const tagArea = cell.querySelector('.flex-1.min-w-0.flex.items-center, .flex-1.min-w-0.flex.items-center.relative')
      const tagAreaRect = tagArea?.getBoundingClientRect()
      const tagAreaCs = tagArea ? getComputedStyle(tagArea) : null

      // First avatar
      const avatars = Array.from(cell.querySelectorAll('img, [class*="rounded-full"]'))
        .filter(el => el.tagName === 'IMG' || (el.children.length === 0 && el.getBoundingClientRect().width > 10))
      const firstAvatar = avatars[0]
      const firstRect = firstAvatar?.getBoundingClientRect()

      return {
        mode: field?.getAttribute('data-field-mode') || 'unknown',
        cell: {
          left: cellRect.left, top: cellRect.top, width: cellRect.width,
          paddingLeft: cellCs.paddingLeft, paddingRight: cellCs.paddingRight,
        },
        field: field ? {
          left: fieldRect.left, width: fieldRect.width,
          paddingLeft: fieldCs.paddingLeft,
          borderLeftWidth: fieldCs.borderLeftWidth,
          className: String(field.className).slice(0, 200),
        } : null,
        tagArea: tagArea ? {
          left: tagAreaRect.left, width: tagAreaRect.width,
          paddingLeft: tagAreaCs.paddingLeft,
          className: String(tagArea.className).slice(0, 200),
        } : null,
        firstAvatar: firstAvatar ? {
          tag: firstAvatar.tagName,
          left: firstRect.left, width: firstRect.width,
          relLeftFromCell: firstRect.left - cellRect.left,
          relLeftFromField: fieldRect ? firstRect.left - fieldRect.left : null,
          relLeftFromTagArea: tagAreaRect ? firstRect.left - tagAreaRect.left : null,
          parentClass: String(firstAvatar.parentElement?.className || '').slice(0, 150),
        } : null,
      }
    }, { rowIndex: target.rowIndex })
  }

  // DISPLAY mode
  const display = await measure('display')
  console.log('\n=== DISPLAY MODE ===')
  console.log(JSON.stringify(display, null, 2))

  // Click cell to enter EDIT mode
  const cellBox = await page.evaluate(({ rowIndex }) => {
    const cell = document.querySelector(`[role="row"][data-row-index="${rowIndex}"] [data-column-id="reviewers"]`)
    const r = cell?.getBoundingClientRect()
    return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null
  }, { rowIndex: target.rowIndex })

  await page.mouse.click(cellBox.x, cellBox.y)
  await page.waitForTimeout(600)

  const edit = await measure('edit')
  console.log('\n=== EDIT MODE ===')
  console.log(JSON.stringify(edit, null, 2))

  // Delta analysis
  const dispRel = display.firstAvatar?.relLeftFromCell
  const editRel = edit.firstAvatar?.relLeftFromCell
  const delta = (editRel != null && dispRel != null) ? editRel - dispRel : null

  console.log('\n=== DELTA ===')
  console.log(`display avatar.relLeftFromCell = ${dispRel?.toFixed(2)}px`)
  console.log(`edit    avatar.relLeftFromCell = ${editRel?.toFixed(2)}px`)
  console.log(`delta (edit - display)         = ${delta?.toFixed(2)}px`)
  console.log(`display tagArea.paddingLeft    = ${display.tagArea?.paddingLeft}`)
  console.log(`edit    tagArea.paddingLeft    = ${edit.tagArea?.paddingLeft}`)
  console.log(`display field.paddingLeft      = ${display.field?.paddingLeft}`)
  console.log(`edit    field.paddingLeft      = ${edit.field?.paddingLeft}`)
  console.log(`display cell.paddingLeft       = ${display.cell.paddingLeft}`)
  console.log(`edit    cell.paddingLeft       = ${edit.cell.paddingLeft}`)

  if (delta != null && Math.abs(delta) > 1) {
    console.log(`\n❌ FAIL: avatar offset detected ${delta.toFixed(2)}px`)
    exitCode = 1
  } else {
    console.log(`\n✅ PASS: avatar within 1px tolerance`)
  }
} catch (err) {
  console.error('ERROR:', err.message)
  exitCode = 2
} finally {
  await browser.close()
}
process.exit(exitCode)
