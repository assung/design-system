import * as React from 'react'
import {
  TransformWrapper,
  TransformComponent,
  type ReactZoomPanPinchRef,
} from 'react-zoom-pan-pinch'
import type { FileRendererProps } from './file-viewer-types'

/**
 * ImageRenderer — FileViewer 的圖片 renderer。
 *
 * 世界級對照:Google Photos / Dropbox / Figma(file preview)/ macOS Preview.app
 * 共同行為:scroll-wheel zoom / drag-to-pan when zoomed / 預設 fit-to-page /
 * double-click to toggle 100%。
 *
 * ── 為什麼消費 react-zoom-pan-pinch ──
 * Zoom + pan 是行為 primitive,視覺 chrome(toolbar / zoom input)由 shell 提供。
 * 自己寫 pinch / wheel event 正確處理會踩大量 edge case(trackpad vs mouse /
 * momentum / bounds 邊界 / CLS),react-zoom-pan-pinch 是 canonical 解法
 * (世界級產品 Figma Community / Miro embed / PhotoSwipe 同類流派)。
 *
 * ── Capability 宣告 ──
 * 透過 onCapabilitiesChange 告訴 shell:本 renderer 支援 zoom,toolbar 顯示
 * zoom input。未來 PDF renderer 會額外回報 pageNumber,shell 根據 capability
 * 動態決定 toolbar 內容。
 */

const MIN_SCALE = 0.1 // 10%
const MAX_SCALE = 4.0 // 400%

export const ImageRenderer: React.FC<FileRendererProps> = ({
  file,
  zoom,
  onZoomChange,
  fitRequest,
  onCapabilitiesChange,
}) => {
  const apiRef = React.useRef<ReactZoomPanPinchRef | null>(null)
  const imgRef = React.useRef<HTMLImageElement | null>(null)
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  // 宣告 capability — shell 用此決定 toolbar 內容。
  // 只 emit 一次(mount),後續 capability 不變。
  React.useEffect(() => {
    onCapabilitiesChange({ zoom: true })
  }, [onCapabilitiesChange])

  // 外部 zoom 變動(user 打字 / 按 preset / ± 按鈕)→ 同步到 TransformWrapper。
  // **zoom anchor 固定在 viewport center**:對齊 Figma / Photoshop / Google Slides 的 ± 按鈕
  // 行為 — 沒 cursor 位置時,以 viewport center 為 anchor 保留視覺重心(內容不會跳飛)。
  // 算法:保持「image 上 viewport-center 對應的那個點」在 zoom 後仍在 viewport center。
  // (wheel zoom 不走本 useEffect,由 react-zoom-pan-pinch 內建 anchor-at-cursor 處理)
  React.useEffect(() => {
    const api = apiRef.current
    const container = containerRef.current
    if (!api || !container) return
    const currentScale = api.state.scale
    const targetScale = zoom / 100
    if (Math.abs(currentScale - targetScale) < 0.01) return

    const rect = container.getBoundingClientRect()
    const cx = rect.width / 2
    const cy = rect.height / 2
    const ratio = targetScale / currentScale
    // 讓「圖上當前 viewport-center 對應的點」zoom 後仍在 (cx, cy):
    //   newPanX = cx - (cx - oldPanX) * ratio
    const newX = cx - (cx - api.state.positionX) * ratio
    const newY = cy - (cy - api.state.positionY) * ratio
    api.setTransform(newX, newY, targetScale, 200)
  }, [zoom])

  // Fit-to-* 指令處理 — 算 container / image 比例,emit 回 shell
  // 世界級對照:Figma / Google Drive / Adobe Acrobat 的 Fit to width / page 都是
  // 基於 container 與 image 的實際尺寸計算,不是「切換到固定 100%」
  React.useEffect(() => {
    if (!fitRequest) return
    const img = imgRef.current
    const container = containerRef.current
    if (!img || !container) return
    // 等到 image load 才有 naturalWidth/Height
    if (!img.naturalWidth || !img.naturalHeight) return

    const containerRect = container.getBoundingClientRect()
    const cw = containerRect.width
    const ch = containerRect.height
    const iw = img.naturalWidth
    const ih = img.naturalHeight
    if (cw <= 0 || ch <= 0 || iw <= 0 || ih <= 0) return

    const widthRatio = cw / iw
    const heightRatio = ch / ih
    const ratio = fitRequest.fit === 'fit-width'
      ? widthRatio
      : Math.min(widthRatio, heightRatio) // 'fit-page' = 整頁符合,取較小 scale

    const nextZoomPct = Math.round(ratio * 100)
    // Clamp to [MIN_SCALE*100, MAX_SCALE*100]
    const clamped = Math.min(MAX_SCALE * 100, Math.max(MIN_SCALE * 100, nextZoomPct))
    onZoomChange(clamped)
  }, [fitRequest, onZoomChange])

  // TransformWrapper 內部 zoom 變動(wheel / pinch)→ 同步回 shell
  const handleTransformed = React.useCallback(
    (_ref: ReactZoomPanPinchRef, state: { scale: number }) => {
      const nextZoom = Math.round(state.scale * 100)
      if (nextZoom !== zoom) {
        onZoomChange(nextZoom)
      }
    },
    [zoom, onZoomChange],
  )

  return (
    <div ref={containerRef} className="w-full h-full">
      <TransformWrapper
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={apiRef as any}
        initialScale={zoom / 100}
        minScale={MIN_SCALE}
        maxScale={MAX_SCALE}
        centerOnInit
        centerZoomedOut
        limitToBounds={false}
        wheel={{ step: 0.1 }}
        doubleClick={{ mode: 'reset' }}
        onTransform={handleTransformed}
      >
        <TransformComponent
          wrapperClass="!w-full !h-full"
          contentClass="!w-full !h-full flex items-center justify-center"
        >
          <img
            ref={imgRef}
            src={file.url}
            alt={file.name}
            draggable={false}
            className="max-w-full max-h-full object-contain select-none"
            style={{ pointerEvents: 'none' }}
          />
        </TransformComponent>
      </TransformWrapper>
    </div>
  )
}
ImageRenderer.displayName = 'ImageRenderer'

const IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif', 'bmp', 'ico'])

/** 判斷檔案是否可用 ImageRenderer 渲染。 */
export function canRenderImage(file: { mimeType: string; name: string }): boolean {
  if (file.mimeType.startsWith('image/')) return true
  const ext = file.name.split('.').pop()?.toLowerCase()
  return ext ? IMAGE_EXTS.has(ext) : false
}
