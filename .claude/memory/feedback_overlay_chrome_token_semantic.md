---
name: Overlay chrome bg token = surface-raised(不是 canvas / surface)
description: Dark overlay 元件(FileViewer / Dialog / Popover)的 chrome bg 永遠優先 bg-surface-raised — 對齊 semantic「遮蓋型浮層必須不透明」
type: feedback
originSessionId: 7fa6c876-f1f7-4537-8cb3-1c97212e5a80
---
# Overlay chrome bg = `bg-surface-raised`

**Why**: 用過 `bg-canvas` 跟 `bg-surface` 都被 user 抓:
- `--canvas` semantic = 「頁面最底層」chrome 不是 page,語意錯
- `--surface` dark = `white α8` 半透明,outer 透明時失去 dark backdrop → 視覺洗白
- `--surface-raised` semantic = 「**遮蓋型浮層必須不透明**」(semantic.css 明文)→ FileViewer / Dialog / Popover chrome 全該用此

**How to apply**:
寫 dark overlay 元件 chrome bg(toolbar / filmstrip / sidebar 內任一 chrome)前,**先 grep `semantic.css`** 看 token 註解,匹配「遮蓋型浮層」semantic → bg-surface-raised。

DropdownMenuContent(file-viewer.tsx line 244)已是先例:Portal 逃脫 dark subtree → 顯式 `bg-surface-raised text-foreground`。新元件 / chrome 套同 pattern。

**Self-check before applying bg-*** in dark overlay:
1. 是 page-level container?(rare)→ bg-canvas
2. 是非遮蓋型容器(card / sidebar in light mode)?→ bg-surface(配 opaque parent)
3. 是 overlay 自身 / chrome of overlay(modal / popover / dropdown / lightbox 派 viewer)?→ **bg-surface-raised**(default)

**避免機制**:
- semantic.css line 35-40 註解:每 token 寫了 use case,寫 code 前讀
- 同檔內既有 chrome 用什麼 token = canonical hint(例 DropdownMenuContent line 244)
- 若仍不確定,grep `bg-surface-raised` 跨 DS 看 chrome 用法
