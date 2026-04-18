# Badge 設計原則

## 定位

Badge 是通知計數指示器，用於未讀數量、待辦計數、狀態紅點。不是分類標籤（那是 Tag）。

**實作基礎**：純視覺 atom——styled span，無 external primitive base。

---

## 何時用

- **通知計數**：收件匣未讀數（3）、待辦事項數（12）、notification center 新訊息數
- **狀態紅點**（dot 模式）：新功能提示、「有新內容」不需具體數字
- **版本 / 角色標記**：「Beta」、「Pro」、「Admin」（當視覺重量需要比 Tag 更輕時）
- **疊加在互動元件右上角**：Button iconOnly + Badge 通知 icon（鈴鐺 + 3）

## 何時不用

| 場景 | 改用 | 原因 |
|------|------|------|
| 分類標籤（產品類別、角色分類）| `Tag` | Tag 較大、可含 icon/dismiss，適合承載語意；Badge 是計數指示器 |
| 狀態描述（In stock / Out of stock）| `Tag` + 色彩 | 狀態語意用 Tag 的 variant 系統（green/yellow/red）更明確 |
| 過濾 / 選擇（filter chip）| `Chip` | Badge 不可互動，Chip 是 filter 選取 |
| Loading 指示 | `Spinner` | Badge 是數字或 dot，loading 用旋轉動畫 |

---

## 層級（Variant）

四個層級代表通知的**緊急程度 / 視覺重量**，由高到低。**選 level 時先問「使用者錯過這個訊息會怎樣?」**——不是先挑顏色再套 level。

| Variant | 視覺 | 使用者錯過會怎樣 |
|---------|------|------------------|
| `critical`（預設） | 紅底白字（bg-notification） | **直接傷害**——錯過訊息會造成資料遺失 / 錯過機會 / 帳戶問題 |
| `high` | 藍底白字（bg-info） | **有感影響**——工作會堆積、待辦會過期，但不是立即傷害 |
| `medium` | 淺藍底藍字（bg-info-subtle） | **輕微不便**——少了資訊但不影響主要流程 |
| `low` | 灰底灰字（neutral-3 + neutral-7） | **無影響**——只是「目前有這麼多」的資訊，不讀也沒關係 |

### 具體場景對照

| 場景 | 選擇 | 為什麼 |
|------|------|--------|
| Email / Slack 未讀訊息 | `critical` | 錯過會錯過溝通；紅色觸發 scan-and-action |
| 錯誤計數（表單驗證錯誤數、CI 失敗數）| `critical` | 必須立即處理才能繼續 |
| 帳戶警告（付款失敗、到期前 3 天）| `critical` | 有金錢或服務中斷風險 |
| 新功能提示（「NEW」、「Beta」label）| `high` | 重要但可延後看 |
| 待辦事項計數（未完成 task 數）| `high` | 工作會堆積但不立即傷害 |
| 通知中心 bell icon 的數字 | `high` 或 `critical` | 視通知內容而定,若全是 critical 通知則升級 |
| 評論 / 回覆計數 | `medium` | 社交互動,延遲看不會失去 |
| 可用更新數量（套件、訂閱內容）| `medium` | 沒看也能繼續工作 |
| 已完成 task 總數 | `low` | 純參考數字,不期待使用者關注 |
| Inbox 總郵件數（不是「未讀」）| `low` | 被動指標,不是 call-to-action |
| Archive / Trash 計數 | `low` | 使用者只有要找時才關心 |

### 色彩硬規則（不可違反）

- **❌ Critical 不是紅色就是錯誤**——critical 永遠 `bg-notification`（紅）。改色等於改信號語意，會稀釋紅色在產品內的「急迫」意義
- **❌ High 不能用紅色**——會跟 critical 搶信號。藍色是「重要但不急」的全球共識
- **❌ 不能為了「視覺統一」把所有 badge 降 level**——使用者需要看到 level 差異才能分配注意力。全部都是 low 等於沒有 badge
- **❌ 不能為了「強調」把 low 升 level**——升 level 改變的是「這件事多重要」的承諾，不是消費者的偏好問題

### 級別使用頻率的自我檢查

一個畫面上**最多 1-2 個 `critical` badge**。更多代表：
1. 使用者真的有多個急迫狀況（罕見）→ 合理
2. 你把不急迫的事標成 critical（常見錯誤）→ 降級

「critical 過多」會讓使用者麻木、無法分辨真正的急迫。**critical 是稀缺資源，要保留信號價值。**

### 層級與容器的關係

Badge 的層級應自然匹配容器的視覺重量。Primary button 是畫面上最強烈的元素，只有 `critical` 的對比度足以在深色底上清楚辨識。低層級 badge 放在高視覺重量的按鈕上是設計矛盾——通知不重要，按鈕卻最重要。

| 按鈕 variant | 適合的 Badge 層級 |
|---|---|
| primary、checked、secondary+danger | `critical` |
| secondary、tertiary | `critical`、`high` |
| text | 全部 |

---

## 模式

### Count（預設）

16px 高、10px 字、font-medium。

- 個位數：min-w-4 確保寬 = 高 = 16px → 正圓
- 多位數：px-1 等距左右 padding → 膠囊
- `max` prop 設定上限，超過顯示 "max+"（如 `max={99}` → "99+"）

### Dot

6×6px 純色圓點，無文字。用於不需顯示具體數量的場景（「有新東西」vs「有 N 個新東西」）。

---

## 禁止事項

- ❌ 不用 Badge 做分類標籤——那是 Tag
- ❌ 不在深色背景按鈕上用 `medium` / `low` 層級——對比不足
- ❌ dot 模式不帶數字——dot 是純視覺指示，數量用 count 模式

---

## 相關

- `../Tag/tag.spec.md` — 分類標籤、狀態標記（Badge vs Tag 的詳細對照在本 spec 定位段落）
- `../Button/button.spec.md` — iconOnly Button + Badge overlay 通知 icon 的組合模式
- `../Chip/chip.spec.md` — 可互動 filter（不是 Badge 的用途）
- `../Spinner/spinner.spec.md` — Loading 狀態指示
