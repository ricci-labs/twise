---
summary: The phone's system bars follow the screen's colour (approved); what to change in the manifest and the page.
read_when: Changing the manifest, theme-color, the splash or the dark theme.
updated: 2026-10-29
---

# Phone system bars (installed app)

**Problem:** the manifest uses the mint as `theme_color` and `background_color` (`apps/web/vite.config.ts`), so the installed app paints the status bar and the Android navigation bar green, while the top of every screen is cream and the tab bar is white. The green bars continue nothing.

**Decision (product owner, 2026-10-29):** the bars take the colour of the screen. Options with green at the top (a green band, a green block with the greeting, a green header with a new use) were designed and rejected. The app header (workspace and people) stays as it is.

## What to do

1. Manifest: `theme_color` and `background_color` = the page background (`--bg-page`, light). The splash shows the owl on cream.
2. The page sets `<meta name="theme-color">` with the colour of what sits right under the status bar: `--bg-page` by default; the dark background in the dark theme (two metas with `media="(prefers-color-scheme: …)"` plus an update when the user picks Claro/Escuro/Automático); a screen whose top is another colour updates it while open.
3. Android navigation bar: the tab bar's white (`--bg-surface`; the dark surface in the dark theme). Where the platform takes it from the manifest, keep the manifest colours as in 1 and check on a device.
4. iPhone: `apple-mobile-web-app-status-bar-style` = `black-translucent`, the app draws under the status bar and pads the top and bottom with `env(safe-area-inset-*)` so the effect is the same (edge to edge).
5. Check on an Android phone with the app installed (status bar cream, gesture bar white) and on an iPhone added to the home screen.
