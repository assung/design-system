# FileItem 設計原則

**檔案上傳列表項目**——顯示檔案名稱、上傳進度、狀態（uploading / completed / error）。

## Mode

| Mode | Prefix | Typography | 適用場景 |
|---|---|---|---|
| `detail` | Avatar 48px square | 閱讀模式（ListItem md） | 需要縮圖預覽的檔案（圖片、文件） |
| `compact` | Paperclip icon 16px | 掃描模式 | 批次上傳的一般檔案（CSV、JSON） |

不叫 lg/sm——兩者是資訊量不同的展示策略，不是同一結構的尺寸縮放。

## Typography（對齊 item-layout 兩種閱讀模式）

| | detail（閱讀模式） | compact（掃描模式） |
|---|---|---|
| label | text-body (14px) 預設行高 (1.5), font-medium | text-body (14px) leading-compact (1.3) |
| description | text-body (14px) 預設行高 (1.5), fg-secondary | text-caption (12px) leading-compact, fg-secondary |

## 結構

### detail

```
[Avatar 48px]  [ label + desc        suffix ]
               [  (justify-between)         ]
               [ ██████████░░░░░░░░░░░░░░░░ ]
```

Avatar 獨立在左（不在 item-layout 內）。右側 flex-col justify-between，minHeight = 48px。
Progress bar 底部對齊 avatar 底部。justify-between 自動分配 gap（有 desc 時 ≈ 2px）。

**Avatar 尺寸約束**：48px ≥ label(21) + desc(21) + bar(4) = 46px ✓

### compact

```
[📎]  [ label + desc?   suffix ]
      [ ██████████░░░░░░░░░░░░ ]
```

標準 item-layout row（icon prefix）。content 和 bar 之間 gap-2（8px）。

## Padding

| Mode | py | px | prefix↔content gap |
|---|---|---|---|
| detail | `py-2`（8px 固定） | `px-3`（12px） | `gap-3`（12px） |
| compact | item-layout formula | `px-3` | `gap-2`（8px） |

detail 的 py 固定——高度由 avatar 決定，不走 row 公式。

## Progress bar

| 屬性 | 值 | 依據 |
|---|---|---|
| 高度 | `h-1`（4px） | 跟 Slider track 對齊 |
| Track 底色 | `bg-secondary` | 跟 Slider track 對齊（見 color.spec.md） |
| 圓角 | `rounded-full` | 跟 Slider 對齊 |
| 進度色 | uploading=`bg-primary`, completed=`bg-success`, error=`bg-error` | 語義色 |

## Actions（suffix）

Consumer 自行組合：

```tsx
<FileItem actions={<>
  <Button variant="text" size="sm" iconOnly startIcon={Download} aria-label="下載" />
  <Button variant="text" size="sm" iconOnly startIcon={Trash2} aria-label="刪除" />
</>} />
```

用 Button（不是 Inline Action）——FileItem 的 action 是始終可見的獨立操作。
詳見 CLAUDE.md「互動元素三層級」。

## Suffix 24px 閾值

| Mode | 最大 suffix 元素 | 有 desc 時 | alignment |
|---|---|---|---|
| detail | Button sm = 28px > 24px | block | `h-[calc(1lh+2px+desc_lh)]` |
| compact | Button xs = 24px ≤ 24px | — | `h-[1lh]` inline |

## 反向引用

- item-layout 閱讀模式 → `patterns/item-layout/item-layout.spec.md`
- Avatar shape → `components/Avatar/avatar.spec.md`
- Track 底色 → `tokens/color/color.spec.md`（bg-secondary 使用原則）
