---
summary: The components behind the shell, WS-01 and the Home, in build order, each mapped to its shadcn/ui piece.
read_when: Creating or changing a component used by the shell or the Home.
updated: 2026-10-07
---

# Components

Existing design-system components (`../design-system/components`) are reused: Button, TextField, Alert, Badge, BudgetProgress, InsightCard, StatHero. The new ones below are composed from shadcn/ui; classes in the HTML references (`twise.css`) only show the look.

| # | Component | shadcn/ui base | Notes |
|---|---|---|---|
| 1 | `Icon` set | — | `../assets/icones`, two layers, see its README |
| 2 | `AppSidebar` | `Sidebar` with `collapsible="icon"` | 264 px open / 76 px collapsed; logo 42 px; "Novo lançamento"; main items; group "Mais"; foot: workspace switcher + account. Collapse button `chevrons-left` beside the logo, discreet (18 px, `--ink-subtle`). State remembered in the browser. Tooltip with the item name when collapsed |
| 3 | `BottomTabBar` | — | 94 px tall, white, attached to the bottom. Selected: icon fill mint, label bold, a 22×3 px mint bar 10 px under the label |
| 4 | `PeriodPicker` | `Button` + `Popover` (desktop) / `Drawer` (mobile) | Arrows plus a label with the range; opens the months of the year |
| 5 | `WorkspaceSwitcher` | `DropdownMenu` (desktop) / `Drawer` (mobile) | Name, role, current one checked, "Criar espaço" |
| 6 | `Card` | `Card` | Title, description, body, footer with a stat on the left and a link on the right; rows stretch to equal height |
| 7 | `KpiCard` + `KpiCarousel` | `Card`, `Carousel` | First card mint ("Livre para gastar", with the piggy bank). Negative: danger-soft card, red value, badge "Passou do planejado", the reason and "Ver onde ajustar", piggy bank in trouble (`cofrinho-alerta.svg`). Closed period: white card, "Sobrou no período encerrado". Carousel: 300 px cards, 12 px gap, next one peeks, dots are buttons, each slide read as "2 de 4" |
| 8 | `SectionSkeleton`, `SectionError`, `EmptyState` | `Skeleton` | Per section. Empty state: icon in a soft circle + text, on the card itself |
| 9 | `BalanceForecastChart` | `ChartContainer` + `AreaChart` (step) | Account tabs inside the card (`ToggleGroup`), zero line dashed, lowest point marked with a tooltip, negative stretch in danger |
| 10 | `CommittedAheadChart` | `BarChart` stacked + `ReferenceLine` at 70% | Parcelas blue, Contas previstas green, % above each bar, ≥ 70% in warning |
| 11 | `PaceRadial` | `RadialBarChart` | Income used vs period elapsed (proposal metric) |
| 12 | `BudgetRows` | `BudgetProgress` | Desktop: aligned table (category, bar with pace mark, amount, status). Mobile: stacked rows |
| 13 | `IncomeBar` | — | 100% bar: spent, committed, free (proposal metric) |
| 14 | `BillsDueList` | — | Next 7 days; date block; overdue row tinted danger-soft with "Atrasada há N dias" and a "Registrar" button on the same line |
| 15 | `InvoiceList` | — | Card, dates, total, posted/planned, chip "R$ X são de outras pessoas" |
| 16 | `ReserveGoalsCard` | `Progress` | Reserve radial + goals with deadline |
| 17 | `ReceivablesCard`, `CommissionsCard` | — | Next receivable line; commission vs average bars |
| 18 | `FirstRun` | — | Mint hero with the owl and house, numbered steps (next one open with its action), ghost preview of the KPIs ("Depois do passo N"), invite card (proposal) |
| 19 | `AchievementsCard` | — | Closed period only: mint highlight ("Fecharam setembro no azul", "Sobrou R$ X", streak badge) + 4 tiles |
| 20 | `OfflineBanner`, `ViewerBanner` | — | Offline: dark band on top of the content with "Atualizado às HH:MM" at the right |
