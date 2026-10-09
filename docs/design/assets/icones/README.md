---
summary: The Twise interface icon set (15 navigation icons and 3 alert icons), two layers each.
read_when: Adding an icon to the navigation, the sidebar, an alert or a button.
updated: 2026-10-07
---

# Interface icons

Geometric, 24 px grid, 1.75 px stroke, round caps and joins (corners follow the card radius). Each file has two layers:

- `g.ti__f`: the inner fill. `fill="var(--ti-fill, transparent)"`, so it is invisible by default.
- the stroke: `currentColor`.

States: at rest, stroke in `--ink-muted`, no fill. Selected (tab bar, sidebar): stroke `--ink`, `--ti-fill: var(--mint)`. Alerts: stroke in the alert color, fill in its soft color (`danger`, `warning`, `info`, `success`). `menu` and `plus` have no fill layer.

Build them as React components (one file per icon, `className` and `--ti-fill` via props or CSS), not as `<img>`, so color and fill follow CSS. Small utility glyphs (chevrons, close, the period calendar, `chevrons-up-down`, the sidebar collapse `chevrons-left/right`) stay on Lucide (`lucide-react`).

Reference sheet: `../../home/screens/html/Icones.html`.
