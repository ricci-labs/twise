---
summary: Design decisions for the shell, WS-01 and the Home that change or extend the requirement docs, and the open proposals.
read_when: Before building SHELL-01, WS-01 or HOME-01, and when updating dashboard.md or workspace-and-members.md.
updated: 2026-10-09
---

# Decisions (shell, workspace, Home)

Where the design and the requirement docs disagree, the design wins and the doc is updated in the same PR.

## Changes to the requirements

| Topic | Requirement today | Design |
|---|---|---|
| Hero (RF-HOME-2/3) | Hero "Livre para gastar" + three stat cards | Four KPI cards of equal weight; the first is mint. Mobile: a swipeable carousel |
| No alerts (RF-HOME-4) | "a calm success line, not a card" | Mobile: a calm line, no box. Desktop: the Alerts card stays (the grid must not jump) and shows the same calm line centered |
| Closed period | Hero with no "por dia" | First KPI turns white and reads "Sobrou no período encerrado"; Comprometido R$ 0,00 "Nada ficou para vencer"; the forecast card is replaced by the achievements (proposal); pace becomes "Como o período terminou" |
| Negative "Livre para gastar" | danger style, "Passou R$ X do planejado" | danger-soft card, badge "Passou do planejado", the reason, "Ver onde ajustar" (proposal), and the worried piggy bank |
| Desktop sidebar | — | Collapsible; workspace switcher moved to the sidebar foot, above the account. Current item on a `--mint` background with `--on-mint` stroke and label (open and collapsed); icons never filled |
| Desktop content width | — | Fluid: fills the width next to the sidebar (content padding 28 / 32 / 48 px), up to 1600 px, then centered. 12 fluid columns, 20 px gaps, equal-height cards per row; charts take the card's width (forecast 330 px tall, coming months 230 px) |
| Mobile tab bar | — | Attached white bar; current item = `--mint-ink` stroke and bold label, no fill, no background, no mark under the label |
| Icons | Lucide | Own icon set (`../assets/icones`); Lucide only for small utility glyphs |
| First run | Checklist of 4 steps | Mint hero with owl and house, numbered steps with the next one open, ghost preview of the KPIs saying which step unlocks each |
| Viewer | — | Menu hides Membros, Configurações, Histórico, Lixeira (role matrix) |

## Proposals (approved by the user on 2026-10-09; now in the requirements)

- 5th first-run step "Convide quem divide com você" (shown as its own card).
- "Ir para o período atual" link next to "Período encerrado".
- All metrics listed as proposals in `data.md` (percents of income, pace, where income goes, commission vs average, achievements).
- "Ver onde ajustar" on the negative KPI.
- Keyboard shortcut Ctrl/⌘ + B to collapse the sidebar.
