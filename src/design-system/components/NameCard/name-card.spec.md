# NameCard 設計原則

人員 HoverCard 的內容元件。提供統一的人員資訊展示格式，作為 HoverCard 的 content 消費者。

## 結構

```
NameCard (w-320px)
├── Profile header (avatar + name + subtitle)
├── Action buttons (optional)
├── Status section (border-t, optional)
│   ├── Status badge (dot + label, bg-muted rounded-md)
│   └── Status message (DescriptionItem, line-clamp-2)
├── Info fields (border-t, DescriptionList cols=2, optional)
└── View more (border-t, Button link w-full, optional)
```

## 寬度

固定 320px。HoverCard 浮層寬度由 NameCard 決定，不隨內容伸縮。

## Profile Header

- **Avatar**：64px circle，透過 Avatar 元件的 `status` prop 顯示狀態圓點
- **Text column 對齊**：`justify-center` + `minHeight: 64px`（= avatar 高度）。短文字（單行名字）垂直置中於 avatar；長文字（多行名字 + subtitle）自然撐高
- **Name**：`text-body-lg font-medium text-foreground`
- **Subtitle**：`text-body text-fg-secondary mt-0.5`
- **間距**：`gap-3`（avatar 與 text column 之間）

## Section Padding

- **一般 section**：`px-4 py-3`
- **View more footer**：`px-4 py-2`（較緊湊，因為 Button link 自帶 padding）
- **Action buttons**：`px-4 pb-3`（無 top padding，緊貼 profile header）

## Status 區

### Status badge

`bg-muted rounded-md px-3 py-2`——非互動元素使用 `bg-muted`（不是 `bg-secondary`），視覺重量低。

包含：
- **Status dot**：`w-2.5 h-2.5 rounded-full`，顏色依狀態而定（available=success, away=warning, busy=error, offline=fg-muted）
- **Status label**：`text-body`

### Status message

使用 `DescriptionItem`（label="Status message"），value 加 `line-clamp-2` 限制最多兩行。

## Info Fields

使用 `DescriptionList cols={2}`，適合展示 ID、員工編號等短屬性。

## View More

`Button variant="link" size="sm" className="w-full"`——填滿容器寬度的文字按鈕。位於獨立的 bordered section（`border-t border-divider`），`py-2` 較緊湊。

只在傳入 `onViewMore` callback 時顯示。

## 設計決策

- **固定寬度而非 min/max**：HoverCard 內容量可預期，固定寬度避免不同人員 card 寬度跳動
- **Section 用 border-t 分隔**：清晰的資訊分區，每個 section 獨立存在或不存在
- **Status badge 用 muted 而非 interactive 色**：狀態是展示資訊，不可點擊，不應暗示互動性
