import { fileURLToPath } from 'node:url'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { readThemeValues, resolveColor } from '../../scripts/tokens/semantic-tokens.mjs'

const API_DEV_SERVER = 'http://localhost:3100'
const TOKENS_FILE = fileURLToPath(new URL('./src/styles/tokens/semantic.css', import.meta.url))
const THEME_VALUES = readThemeValues(TOKENS_FILE)
const PAGE_LIGHT = resolveColor(THEME_VALUES.light, 'bg-page')
const PAGE_DARK = resolveColor(THEME_VALUES.dark, 'bg-page')
const API_PATHS = /^\/api\//

const pwa = VitePWA({
  registerType: 'prompt',
  injectRegister: false,
  manifest: {
    name: 'Twise',
    short_name: 'Twise',
    description: 'Leve, claro, a dois.',
    lang: 'pt-BR',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: PAGE_LIGHT,
    theme_color: PAGE_LIGHT,
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,woff2,svg,png}'],
    globIgnores: ['email/**'],
    navigateFallback: 'index.html',
    navigateFallbackDenylist: [API_PATHS],
    cleanupOutdatedCaches: true,
  },
})

const CHARSET_META = '<meta charset="UTF-8" />'
const THEME_COLOR_META = `<meta name="theme-color" content="${PAGE_LIGHT}" data-dark="${PAGE_DARK}" />`

const systemBarColor: Plugin = {
  name: 'twise-system-bar-color',
  transformIndexHtml: (html) => {
    if (!html.includes(CHARSET_META)) {
      throw new Error(`index.html has no ${CHARSET_META}, which the theme-color meta follows`)
    }
    return html.replace(CHARSET_META, `${CHARSET_META}\n    ${THEME_COLOR_META}`)
  },
}

export default defineConfig({
  plugins: [
    systemBarColor,
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    pwa,
  ],
  resolve: { tsconfigPaths: true },
  build: { manifest: true },
  server: {
    proxy: { '/api': API_DEV_SERVER },
  },
})
