// Consumer storybook config — dogfood @your-org/storybook-config shared preset
// 同 DS repo .storybook/main.ts pattern,只是不 import local addon(ds-devmode 是 DS-internal)
import type { StorybookConfig } from '@storybook/react-vite'
import {
  sharedAddons,
  sharedFramework,
  sharedDocsConfig,
  sharedTypescriptConfig,
} from '@your-org/storybook-config/preset'

const config: StorybookConfig = {
  // Product apps 的 stories — adjust glob 對應你的 apps/<name>/src structure
  stories: [
    '../apps/**/*.mdx',
    '../apps/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: sharedAddons,
  framework: sharedFramework,
  docs: sharedDocsConfig,
  typescript: sharedTypescriptConfig,
}

export default config
