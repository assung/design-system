import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  // 1. 確保路徑能掃描到你所有的 stories 檔案
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  
  addons: [
    // essentials 含 Controls, Actions, Viewport, Backgrounds, **Measure**(Alt+hover 顯示
    // spacing / margin / padding / border pixel overlay,類 Figma Dev Mode 的 spacing inspector),
    // Highlight, Toolbars, Docs。
    // **Outline + Backgrounds disabled**(user 2026-04-24 / 2026-04-25):
    //   outline overlay / backgrounds 切換對 DS audit 沒用(我們用 token 量值)。
    //   `backgrounds: false` 同時關掉該 addon 內建的 **Grid toolbar 按鈕**(田字 icon)
    //   — 這 grid 功能由 addon-backgrounds 提供(非 essentials 自身),沒 `grid` 獨立
    //   options key,只能整包關 backgrounds 才連 grid 一起消失。
    {
      name: "@storybook/addon-essentials",
      options: { outline: false, backgrounds: false },
    },
    "@storybook/addon-a11y",         // 無障礙檢查(對 DS 很重要)
    "@storybook/addon-docs",         // 自動生成文件
    // addon-html:選了元件後在右側 panel 看 rendered HTML + 套用的 className list,
    // 為 custom DS Devmode addon 的補強。
    "@whitespace/storybook-addon-html",
    // DS Devmode — local addon,Figma Dev Mode 等級 inspect(anatomy / redline / token reverse lookup)。
    // Register via managerEntries + previewAnnotations below(繞 auto-discovery 的 .ts 副檔名問題)
    "./addons/ds-devmode/preset",
  ],

  framework: {
    name: "@storybook/react-vite",
    options: {
      // 這裡可以保持空白，Vite 會自動處理你的 design-system 目錄
    },
  },

  docs: {
    autodocs: "tag", // 支援在 .stories.tsx 中使用 tags: ["autodocs"]
  },

  // 2. 如果你的 Token 檔案很大，這能幫助 Vite 預熱
  typescript: {
    reactDocgen: "react-docgen-typescript",
  },
};

export default config;