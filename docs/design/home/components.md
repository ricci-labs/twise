---
summary: The components behind the shell, WS-01 and the Home, in build order, each mapped to its shadcn/ui piece.
read_when: Creating or changing a component used by the shell or the Home.
updated: 2026-10-09
---

# Components

Existing design-system components (`../design-system/components`) are reused: Button, TextField, Alert, Badge, BudgetProgress, InsightCard, StatHero. The new ones below are composed from shadcn/ui; classes in the HTML references (`twise.css`) only show the look.

| # | Component | shadcn/ui base | Notes |
|---|---|---|---|
| 1 | `Icon` set | — | `../assets/icones`, two layers, see its README |
| 2 | `AppSidebar` | `Sidebar` with `collapsible="icon"` | 264 px open / 76 px collapsed; logo 42 px; "Novo lançamento"; main items; group "Mais"; foot: workspace switcher + account. Collapse button `chevrons-left` beside the logo, discreet (18 px, `--ink-subtle`). State remembered in the browser. Tooltip with the item name when collapsed. Current item: `--mint` background, stroke and label `--on-mint`, weight 650, same radius; the others: label `--ink`, icon `--ink-muted`, hover `--bg-page`. Collapsed: the current item is the 48×44 mint square with the dark icon. The icon is never filled |
| 3 | `BottomTabBar` | — | 94 px tall, white, attached to the bottom. No background and no mark under the current item: its stroke and label turn `--mint-ink`, label weight 700, icon not filled; the others `--ink-muted`. Changing item only changes the colour (150 ms) |
| 4 | `PeriodPicker` | `Button` + `Popover` (desktop) / `Drawer` (mobile) | Arrows plus a label with the range; opens the months of the year |
| 5 | `WorkspaceSwitcher` | `DropdownMenu` (desktop) / `Drawer` (mobile) | Name, role, current one checked, "Criar espaço" |
| 6 | `Card` | `Card` | Title, description, body, footer with a stat on the left and a link on the right; rows stretch to equal height |
| 7 | `KpiCard` + `KpiCarousel` | `Card`, `Carousel` | First card mint ("Livre para gastar", with the piggy bank). Negative: danger-soft card, red value, badge "Passou do planejado", the reason and "Ver onde ajustar", piggy bank in trouble (`cofrinho-alerta.svg`). Closed period: white card, "Sobrou no período encerrado". Carousel: the track spans the screen with 16 px `padding-inline` and `scroll-padding-inline`, so the first card (and every snapped one) starts on the same 16 px margin as the rest of the page and the last one ends 16 px from the right; 300 px cards, `scroll-snap-align: start`, 12 px gap, next one peeks, dots centered below are buttons, each slide read as "2 de 4" |
| 8 | `SectionSkeleton`, `SectionError`, `EmptyState` | `Skeleton` | Per section. Empty state: icon in a soft circle + text, on the card itself |
| 9 | `BalanceForecastChart` | `ChartContainer` + `AreaChart` (step) | `ResponsiveContainer` 100% wide, 330 px tall. Account tabs inside the card (`ToggleGroup`), zero line dashed, lowest point marked with a tooltip, negative stretch in danger |
| 10 | `CommittedAheadChart` | `BarChart` stacked + `ReferenceLine` at 70% | `ResponsiveContainer` 100% wide, 230 px tall. Parcelas blue, Contas previstas green, % above each bar, ≥ 70% in warning |
| 11 | `PaceRadial` | `RadialBarChart` | Income used vs period elapsed (proposal metric) |
| 12 | `BudgetRows` | `BudgetProgress` | Desktop: aligned table (category, bar with pace mark, amount, status). Mobile: stacked rows |
| 13 | `IncomeBar` | — | 100% bar: spent, committed, free (proposal metric) |
| 14 | `BillsDueList` | — | Next 7 days. Each row: date block (`--bg-sunken`, 42×46) · name left and amount right (bold, tabular) · second line in grey with the weekday and how long ("Quinta · em 2 dias"); rows split by a divider. Overdue row: `--danger-soft`, `--radius-md`, 10 px padding, bleeding 10 px into the card sides, no divider above or below; white date block with the day in `--danger`; second line = alert icon + "Atrasada há N dias" (`--danger`, 600) on the left and the small secondary "Registrar" button (30 px, white, `--border-control`) on the right of the same line. No "Atrasada" badge, nothing stacked. Viewer: no "Registrar" |
| 15 | `InvoiceList` | — | Card, dates, total, posted/planned, chip "R$ X são de outras pessoas" |
| 16 | `ReserveGoalsCard` | `Progress` | Reserve radial + goals with deadline |
| 17 | `ReceivablesCard`, `CommissionsCard` | — | Next receivable line; commission vs average bars |
| 18 | `FirstRun` | — | Mint hero with the owl and house (phone: owl at the top right, full-width button); progress bar on `--on-mint` 15% with a start dot and "N de 4 feitos" beside it. Numbered steps with their illustration (carteira, cartão, calendário, recibo), split by dividers: the next one open on `--mint-soft` with the "Próximo passo" tag and its button, the others whole-row links with a chevron. Ghost preview of the KPIs with a lock and "Depois do passo N" on dashed `--border-control` tiles, plus a ghost forecast on the desktop ("Depois dos passos 1 e 3"). Invite card (alone in the workspace): amber dashed outline, "juntos" illustration, under the steps on the desktop. The phone uses the shorter copy of `Inicio-primeiro-uso` |
| 19 | `AchievementsCard` | — | Closed period only: mint highlight ("Fecharam setembro no azul", "Sobrou R$ X", streak badge) + 4 tiles |
| 20 | `OfflineBanner`, `ViewerBanner` | — | Offline: dark band on top of the content with "Atualizado às HH:MM" at the right |
