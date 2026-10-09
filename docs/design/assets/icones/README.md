---
summary: The Twise interface icon set (15 navigation icons and 3 alert icons), two layers each.
read_when: Adding an icon to the navigation, the sidebar, an alert or a button.
updated: 2026-10-09
---

# Interface icons

Geometric, 24 px grid, 1.75 px stroke, round caps and joins (corners follow the card radius). Each file has two layers:

- `g.ti__f`: the inner fill. `fill="var(--ti-fill, transparent)"`, so it is invisible by default.
- the stroke: `currentColor`.

States:

- **At rest:** stroke `--ink-muted`, no fill.
- **Selected:** desktop sidebar, stroke `--on-mint` on a `--mint` background; phone tab bar, stroke `--mint-ink`. Never filled.
- **Alert:** stroke and fill in the alert color (`danger`, `warning`, `info`, `success`; the fill is the soft one).

The fill is only for alerts and a few decorative accents (the "Posso comprar?" bag, the achievement tiles: stroke `--ink`, fill `--mint`), never for selection. `menu` and `plus` have no fill layer.

Build them as React components (one file per icon, `className` and `--ti-fill` via props or CSS), not as `<img>`, so color and fill follow CSS. Small utility glyphs (chevrons, close, the period calendar, `chevrons-up-down`, the sidebar collapse `chevrons-left/right`) stay on Lucide (`lucide-react`).

Reference sheet: `../../home/screens/html/Icones.html`.
