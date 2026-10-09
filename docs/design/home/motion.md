---
summary: How the Home, its charts and menus move, and the workspace owl entrances, with durations and easing.
read_when: Animating anything in the shell, WS-01 or the Home.
updated: 2026-10-09
---

# Motion (shell, workspace, Home)

Demo: `animations/Movimento-inicio.html` (one loop per piece), `animations/Animacao-inicio-desktop.html`, `animations/Animacao-inicio-celular.html`. Owl rules and the older entrances: `../account/motion.md`.

## Rules

- Calm: motion shows what changed and where it came from; it never asks for attention.
- Durations: taps and tab changes 120–200 ms; cards and sheets 250–350 ms; charts 600–800 ms.
- Easing: ease-out (`cubic-bezier(.2,.8,.2,1)`). A small overshoot only for achievements and the owl.
- Once: the full Home entrance plays on the first open of the Home in a session. Changing period only swaps the numbers (200 ms); charts are not redrawn from zero.
- Money never spins: values fade in; no counters.
- Alerts are serious: no bounce, no sparkle, no wink.
- `prefers-reduced-motion: reduce`: everything appears at its final state.
- Charts use Recharts' own animation (`isAnimationActive`, `animationDuration`, `animationEasing="ease-out"`); the rest is CSS transitions and keyframes. No new library.

## Pieces

| Piece | Motion | Timing |
|---|---|---|
| KPIs | rise 12 px and fade in, one after another | 350 ms each, 60 ms stagger |
| Cards | rise 12 px and fade in together after the KPIs | 350 ms, starting at 350 ms |
| Balance forecast | line draws left to right; gradient fades in after; lowest point pops | 700 ms + 300 ms |
| Coming months | bars grow from the base; 70% line fades in last | 400 ms each, 50 ms stagger |
| Pace | rings sweep to their value | 800 ms |
| Budgets | bars fill from the left; pace mark fades in after | 500 ms, 60 ms stagger |
| KPI carousel | snaps one card; active dot stretches | 300 ms |
| Bottom tab bar | only the color changes | 150 ms |
| Sidebar collapse | width 264 → 76 px, ease-out; the content widens with it; labels fade first | 250 ms (labels 120 ms) |
| Sheets (Mais, workspaces, period) | scrim fades; sheet slides up; closes faster | 200 + 280 ms; close 200 ms |
| Help "?" popover | scale .96 → 1 and fade | 160 ms |
| Period change | numbers leave 6 px sideways, new ones enter from the other side | 200 ms |
| Achievements | highlight rises, streak badge pops, piggy bank pops | up to 900 ms |
| Negative KPI | fades in; the worried piggy bank sways once | 250 ms, sway 600 ms |
| Mobile charts | each chart animates when it scrolls into view, not before | — |

## Owl entrances

| Demo | Kit | Entrance | Timing |
|---|---|---|---|
| `animations/Animacao-criar-espaco.html` (WS-01) | `kit-espaco` | "Construir" (new): walls rise from the ground, roof drops and settles with a small bounce, door and chimney appear, sparkle pops. Form screen: only the owl moves | walls 0.25–0.65 s, roof 0.55–0.92 s, door 0.85 s, chimney 0.95 s, sparkle 1.25 s; ends 1.7 s |
| `animations/Animacao-espaco-criado.html` (Home first run) | `kit-espaco` | Achievement: hero rises, sparkle, progress bar fills to the first step, steps enter one by one, "Próximo passo" pops, the owl winks | hero 0.1–0.45 s, sparkle 0.6 s, wink 1.1–1.6 s; ends 1.6 s |

`kit-espaco` ids beyond the common ones: `k-telhado`, `k-paredes`, `k-porta`, `k-chamine`, `k-brilho-1..3`, `k-pontos`. Its last frame is identical to `coruja-espaco.svg`.
