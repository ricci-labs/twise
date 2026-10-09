---
summary: Overview of the designed app shell, workspace creation and Home (SHELL-01, WS-01, HOME-01): layouts, navigation, rules, build order and where each number comes from.
read_when: Starting any work on SHELL-01, WS-01 or HOME-01, mobile or desktop.
updated: 2026-10-09
---

# Shell, workspace and Home

Requirements: `../../product/requirements/modules/dashboard.md` (HOME-01), `../../product/requirements/modules/workspace-and-members.md` (SHELL-01, WS-01), `../../product/requirements/ui-standards.md` (states, permissions, money). Design decisions that change them: `decisions.md`. Read that first.

| File | Read when |
|---|---|
| `screens.md` | Building one screen or state: HTML, PNG and notes for each |
| `components.md` | Which components to build, in what order, and the shadcn/ui piece behind each |
| `data.md` | Wiring a widget: which endpoint and field feeds it, and which ones are proposals |
| `motion.md` | Animating the Home, the charts, the menus and the workspace owl |
| `decisions.md` | Before building: what the design changes in the requirements |
| `twise.css` | Only to open the HTML references; build with tokens and components, not this file |

## Flow map

| From | Action | To |
|---|---|---|
| Log in, no workspace | — | WS-01 "Criar o espaço de vocês" |
| WS-01 | "Criar espaço" (`POST /api/workspaces`) | Home in the first-run state (owl winks) |
| Home first run | each step | the module that step opens (accounts, cards, planning, entries) |
| Home | period arrows or period label | same Home, other period (`?period=YYYY-MM`) |
| Home | "Posso comprar?" | HOME-02 |
| Home | an alert action | the screen named in RF-HOME-4 |
| Workspace switcher | pick another | that workspace's Home (last one remembered on the device) |

## Layouts

- **Mobile (< 1024 px):** top bar (workspace + people), greeting, period picker, then the cards in one column. The four KPIs are a **swipeable carousel** (next card peeks at the right, dots below). Bottom tab bar: Início, Lançamentos, Cartões, Planejamento, Mais. Floating "Novo lançamento" above it.
- **Desktop (≥ 1024 px):** left sidebar (264 px, collapsible to 76 px) and a 12-column fluid grid that fills the width next to the sidebar, 32 px side padding, up to 1600 px (margins appear only beyond that, equal on both sides), 20 px gaps. Collapsing the sidebar widens the content with it. Every row has equal-height cards. Order: KPIs (4×3) · balance forecast (8) + alerts (4) · budgets (8) + pace (4) · coming months (8) + where income goes (4) · bills due in 7 days, next invoices, reserve and goals (4 each) · commissions and receivables (6 each).
- The sidebar is fixed to the window height; only the content scrolls. Workspace switcher and account sit at the sidebar foot. Collapsed: icons only, tooltips on hover, logo becomes the owl, "Novo lançamento" a round "+".

## Rules for every screen here

- The web never computes a metric; it only formats what the API sends (the repo rule). Where the design shows a number the API does not send yet, it is marked as a proposal in `data.md`.
- One state per section: skeleton while loading, its own error with the `ref` code and "Tentar de novo", its own empty state. A section failing never blanks the page.
- Empty states sit directly on the card (icon in a soft circle + one line), never a box inside the card.
- Money: `R$ 1.234,56`, cents raised in the hero numbers, tabular figures everywhere.
- Charts follow shadcn/ui charts (Recharts). Validated colors: blue `#3f67d1`, green `#26915d`, amber `#b7791f`, with legend and direct labels; the forecast line is `--mint-ink` with a mint gradient; negative stretches in the danger style.
- Viewer role: no "Novo lançamento", no write actions (Registrar, Dividir, Cobrar), and the menu hides Membros, Configurações, Histórico and Lixeira, from the role matrix. A discreet banner says "Você está vendo este espaço sem poder alterar nada."
- Light theme is the default.

## Build order

1. Icons (`../assets/icones`) and the shell: sidebar (with collapse) and bottom tab bar, period picker, workspace switcher.
2. Card, KPI card and carousel, section skeleton and section error, empty state.
3. Charts: balance forecast (area), coming months (stacked bars), pace (radial), budget rows, where income goes (100% bar).
4. Home mobile, then desktop; then the states (`screens.md` → desktop states).
5. First run and WS-01 (with the owl entrance), then the period-closed achievements.
6. Motion last (`motion.md`); everything must already work with `prefers-reduced-motion`.

## Not designed yet (behavior described here)

- **Desktop popovers:** workspace switcher (opens upward from the sidebar foot, same content as the mobile sheet), account menu ("Minha conta", "Sair"), period picker (dropdown with the months of the year, same as the mobile sheet), help "?" (popover beside the number).
- **Mobile cases:** future period (badge "Período futuro"; no "por dia"; forecast and pace hidden), first run half done ("2 de 4 feitos", done steps checked and collapsed, KPIs appear as their data exists), no salary registered (KPIs show "—" with "Cadastre o salário" link), long names and big values (workspace name truncates with ellipsis at one line; values never wrap, the KPI font steps down one size above R$ 99.999,99).
- **Details:** keyboard focus ring on menu items (2 px `--focus-ring`, offset 2 px), toasts ("Espaço criado.", "Você saiu.") bottom center on desktop, above the tab bar on mobile.
