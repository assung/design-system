import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { X, Download, RotateCw } from 'lucide-react'
import { FileItem } from './file-item'
import { Button } from '@/design-system/components/Button/button'

const meta: Meta = {
  title: 'Design System/Components/FileItem/設計原則',
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj

const Rule = ({
  title, note, children,
}: {
  title: string; note?: string; children: React.ReactNode
}) => (
  <div className="mb-14">
    <h3 className="text-body font-bold text-foreground mb-1">{title}</h3>
    {note && <p className="text-caption text-fg-muted mb-5 max-w-[720px] leading-relaxed">{note}</p>}
    <div className="flex flex-col gap-3 max-w-lg">{children}</div>
  </div>
)

const Label = ({ children, warn }: { children: React.ReactNode; warn?: boolean }) => (
  <p className={`text-footnote leading-normal ${warn ? 'text-error font-medium' : 'text-fg-muted'}`}>{children}</p>
)

export const ModeRule: Story = {
  name: 'Mode 選擇（compact vs rich）',
  render: () => (
    <div>
      <Rule
        title="rich — 需要縮圖預覽的檔案（圖片、文件）"
        note="左側 Avatar 56px 顯示縮圖或檔案類型 icon,右側檔名 + 大小 + 進度 bar。閱讀模式(text-body 14px),資訊容量較高"
      >
        <FileItem
          name="Q1-report.pdf"
          description="2.4 MB · 上傳中 75%"
          status="uploading"
          progress={75}
          mode="rich"
        />
        <FileItem
          name="beach-photo.jpg"
          description="4.8 MB"
          mode="rich"
          thumbnailSrc="https://i.pravatar.cc/112?img=3"
        />
        <Label>↑ 設計 / 影音類檔案、需要視覺辨識的場景</Label>
      </Rule>

      <Rule
        title="compact — 批次上傳的一般檔案（CSV / JSON）"
        note="左側 Paperclip 16px icon,掃描模式(text-caption),資訊密度高。適合一次顯示 10+ 檔案的 batch upload 清單"
      >
        <div className="flex flex-col gap-1">
          <FileItem
            name="users.csv"
            mode="compact"
            status="completed"
            progress={100}
          />
          <FileItem
            name="orders.json"
            mode="compact"
            status="uploading"
            progress={42}
          />
          <FileItem
            name="products.xlsx"
            mode="compact"
            status="error"
            description="檔案格式不支援"
          />
        </div>
        <Label>↑ 數據匯入、日誌上傳等批次場景</Label>
      </Rule>

      <Rule
        title="判斷法：「檔案需要視覺預覽,還是清單掃視？」"
        note="需要預覽 → rich(圖文並列)/ 需要快速掃視多個 → compact(單行列表,預設)"
      >
        <Label>圖片類 / 需要縮圖用 rich;logs / data export / batch 用 compact（預設）</Label>
      </Rule>
    </div>
  ),
}

export const StatusProgressRule: Story = {
  name: '上傳狀態與進度視覺',
  render: () => (
    <div>
      <Rule
        title="uploading — progress bar primary 色 + 百分比 description"
        note="上傳中清楚展示進度,讓使用者知道「多久能好」而不是只看到一個等待狀態"
      >
        <FileItem
          name="large-backup.zip"
          description="128 MB · 上傳中 42%"
          status="uploading"
          progress={42}
          mode="rich"
        />
      </Rule>

      <Rule
        title="completed — 成功 icon + 無 bar"
        note="完成後不再需要 progress bar,成功 icon 明確表達「完成」。檔案變可點擊(下載)"
      >
        <FileItem
          name="users-export.csv"
          description="1.2 MB"
          status="completed"
          mode="rich"
        />
      </Rule>

      <Rule
        title="error — 錯誤 icon + error 訊息 description + 可重試"
        note="失敗必須清楚告知原因——不只顯示「失敗」,要有具體錯誤訊息讓使用者知道怎麼修。compact 模式下 error 會強制顯示 description"
      >
        <FileItem
          name="broken-file.pdf"
          description="檔案損毀,請重新上傳"
          status="error"
          mode="rich"
          actions={<Button variant="text" size="xs" iconOnly startIcon={RotateCw} aria-label="重試" />}
        />
      </Rule>

      <Rule
        title="無 status — 已上傳的靜態檔案"
        note="上傳已完成且已保存,不需要進度 / 狀態標示。可傳 onClick 讓整個 item 變可點擊下載"
      >
        <FileItem
          name="final-contract.pdf"
          description="已簽署 · 2.1 MB"
          mode="rich"
          onClick={() => {}}
          actions={<Button variant="text" size="xs" iconOnly startIcon={Download} aria-label="下載" />}
        />
      </Rule>
    </div>
  ),
}

export const ActionsRule: Story = {
  name: 'Actions 使用',
  render: () => (
    <div>
      <Rule
        title="Uploading 時：Cancel action"
        note="上傳進行中使用者應該可以取消。用 X icon 表達「取消上傳」"
      >
        <FileItem
          name="massive-video.mov"
          description="450 MB · 上傳中 12%"
          status="uploading"
          progress={12}
          mode="rich"
          actions={<Button variant="text" size="xs" iconOnly startIcon={X} aria-label="取消上傳" />}
        />
      </Rule>

      <Rule
        title="Error 時：Retry + Remove"
        note="失敗時使用者需要兩個選項——重試(可能只是暫時網路問題)或移除(放棄這個檔案)"
      >
        <FileItem
          name="failed-upload.pdf"
          description="網路中斷,請重試"
          status="error"
          mode="rich"
          actions={
            <div className="flex gap-1">
              <Button variant="text" size="xs" iconOnly startIcon={RotateCw} aria-label="重試" />
              <Button variant="text" size="xs" iconOnly startIcon={X} aria-label="移除" />
            </div>
          }
        />
      </Rule>

      <Rule
        title="Completed 時：Download / View"
        note="完成後使用者可以下載或查看。action 不必是 dismiss,重點在後續可能的動作"
      >
        <FileItem
          name="report-final.pdf"
          description="上傳完成 · 3.2 MB"
          status="completed"
          mode="rich"
          actions={<Button variant="text" size="xs" iconOnly startIcon={Download} aria-label="下載" />}
        />
      </Rule>

      <Rule
        title="❌ 重要 action 只靠 hover 才出現"
        note="「移除」「取消」這類影響資料的 action 必須 persistent visible,不能 hover 才顯示。觸控裝置無法 hover,會錯過關鍵動作"
      >
        <Label warn>hover-only actions 只適合純便利功能(如「複製連結」),關鍵動作永遠 visible</Label>
      </Rule>
    </div>
  ),
}
