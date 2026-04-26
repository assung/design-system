import type { Meta } from '@storybook/react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
} from './carousel'
import { Button } from '@/design-system/components/Button/button'
import { AspectRatio } from '@/design-system/components/AspectRatio/aspect-ratio'

const meta: Meta = {
  title: 'Design System/Components/Carousel/展示',
  parameters: { layout: 'padded' },
}
export default meta

// ── Real-content data ────────────────────────────────────────────────────────

const heroBanners = [
  {
    city: '京都',
    tagline: '秋日楓紅限定行程',
    gradient: 'linear-gradient(135deg, #c4452a 0%, #f28b3a 60%, #ffd37a 100%)',
  },
  {
    city: '雷克雅維克',
    tagline: '極光季早鳥 8 折',
    gradient: 'linear-gradient(135deg, #1b3b6f 0%, #3d7ea6 60%, #a8e0ff 100%)',
  },
  {
    city: '里斯本',
    tagline: '歐洲西岸 7 日自由行',
    gradient: 'linear-gradient(135deg, #e87d5a 0%, #f4c27a 50%, #f7e2b0 100%)',
  },
  {
    city: '峇里島',
    tagline: '熱帶度假村 · 含機加酒',
    gradient: 'linear-gradient(135deg, #1d6a5a 0%, #4db893 60%, #c7ebd9 100%)',
  },
]

const productImages = [
  { label: '正面', gradient: 'linear-gradient(135deg, #f4f4f5 0%, #e4e4e7 100%)' },
  { label: '側面', gradient: 'linear-gradient(135deg, #e4e4e7 0%, #d4d4d8 100%)' },
  { label: '背面', gradient: 'linear-gradient(135deg, #d4d4d8 0%, #a1a1aa 100%)' },
  { label: '情境', gradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' },
]


// ── Stories ─────────────────────────────────────────────────────────────────

export const HomepageHeroBanner = {
  name: '首頁 Hero Banner',
  render: () => (
    <div className="max-w-[960px]">
      <p className="text-caption text-fg-muted mb-3">
        Airbnb / Booking 首頁風格 · 4 張城市主題大圖 · hover 顯示箭頭 · 底部白點指示
      </p>
      <Carousel opts={{ loop: true }}>
        <CarouselContent>
          {heroBanners.map((b) => (
            <CarouselItem key={b.city}>
              <div
                className="relative h-[360px] rounded-lg overflow-hidden flex items-end p-8"
                style={{ background: b.gradient }}
              >
                <div className="text-white">
                  <div className="text-caption font-medium opacity-90 mb-1">推薦目的地</div>
                  <div className="text-h2 font-bold mb-1">{b.city}</div>
                  <div className="text-body-lg opacity-95">{b.tagline}</div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
        <CarouselDots />
      </Carousel>
    </div>
  ),
}

export const ProductImageGallery = {
  name: '商品圖片輪播',
  render: () => (
    <div className="max-w-[480px]">
      <p className="text-caption text-fg-muted mb-3">
        單一商品 4 張角度照 · dots 顯示共有幾張 · 適合電商 / B2B SaaS marketing site
      </p>
      <Carousel>
        <CarouselContent>
          {productImages.map((img) => (
            <CarouselItem key={img.label}>
              <AspectRatio
                ratio={1}
                className="relative rounded-lg overflow-hidden flex items-center justify-center"
                style={{ background: img.gradient }}
              >
                <div className="text-foreground/40 text-body-lg font-medium">{img.label}</div>
              </AspectRatio>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
        <CarouselDots />
      </Carousel>
      <div className="mt-4 flex items-baseline justify-between">
        <div>
          <div className="text-body font-medium">無線降噪耳機 Pro</div>
          <div className="text-caption text-fg-muted">NT$ 8,990</div>
        </div>
        <Button variant="primary" size="sm">加入購物車</Button>
      </div>
    </div>
  ),
}

// TestimonialCarousel / VerticalOrientation 範例於 2026-04-20 移除:
//   - TestimonialCarousel:箭頭直接覆蓋文字 card(text 佔滿卡片高度),
//     違反「箭頭 overlay 只覆蓋圖 / 背景,不壓文字」原則(見 principles story)。
//     純文字 carousel 若真要保留,應改為 arrows OUTSIDE the card(旁邊,非 overlay)
//     — 但該 layout 較少見,DS 不主動 demo
//   - VerticalOrientation:垂直輪播使用情境少見(story feed / 影片 feed 外難找),
//     且 embla 垂直模式在 a11y / touch gesture 上都次等,不值得做為 DS canonical
//     範例示範
//
// 如果 consumer 有這兩類需求,自己評估合適性 — DS 不 demo 等於不背書
