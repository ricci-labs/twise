---
summary: The components behind the accounts, categories and cards screens, in build order, each mapped to its shadcn/ui piece.
read_when: Creating or changing a component used by ACC-01..04 or CARD-01..04.
updated: 2026-10-14
---

# Components (accounts, categories, cards)

Reused from earlier rounds: Button, TextField, MoneyField, PickerField + PickerSheet, Alert, Badge, Amount, KPI card (Home), Toast. Classes in the HTML references (`twise.css`) only show the look.

| # | Component | shadcn/ui base | Notes |
|---|---|---|---|
| 1 | `AccountRow` | — | Loose illustration (42 px), name + the colour dot, second line "Conta corrente · Member A", balance right-aligned on the first line, "⋯" at the end. The subtitle spans under name and value (grid), so it never wraps early. Tap = entries of that account |
| 2 | `AccountGroup` | — | Section title on the left, the add link on the right ("+ Nova conta"), rows inside a white card with dividers |
| 3 | `KpiCarousel` | `Carousel` (embla) | Mobile only: the same KPI cards as the desktop row, scroll-snap, first card at the 16 px margin, the next one peeking, dots below. Used wherever desktop shows 3+ KPIs in a row |
| 4 | `ActionSheet` / `ActionMenu` | `Drawer` / `DropdownMenu` | Same items and order on both. Title = the item's name; for a subcategory, a second line "Subcategoria de Mercado". Destructive item last, in `--danger` |
| 5 | `UndoToast` | `Sonner` | "Feira arquivada." + "Desfazer", 8 s. Error variant: alert icon, no auto close, optional action ("Restaurar as duas") |
| 6 | `RefusedActionDialog` | `AlertDialog` | Title names the thing ("Não dá para excluir Mercado"), the text says why and what to do, "Cancelar" (secondary) + the way out (primary, e.g. "Arquivar", "Arquivar as 3") |
| 7 | `ArchivedToggle` | `Collapsible` | Dashed row "Arquivadas (n)" with the archive icon and a chevron, at the end of the list |
| 8 | `ListSkeleton`, `EmptyBlock`, `SectionError` | `Skeleton` | Skeleton in the shape of the rows; empty = loose illustration + sentence + primary button; error = message, code and "Tentar de novo" |
| 9 | `CategoryList` + `SubcategoryChips` | `Collapsible` + buttons | Mobile. Toggle "2 subcategorias ⌄" (collapsed by default; the app remembers which are open). Open: chips that wrap, plus a dashed "+" chip. Tapping a chip opens its `ActionSheet`; the tapped chip gets the `--ink` outline while the sheet is open. Viewers: the chip opens the entries |
| 10 | `CategoryTable` | — | Desktop. Columns: Categoria (illustration, name, "12 subcategorias" under it when they don't fit), Natureza (income only), Subcategorias (chips in one line: the ones that fit + "+N mais"; open = wraps + "Mostrar menos"), "⋯". Chip click opens the `ActionMenu` under the chip |
| 11 | `MoveCategorySheet` | `Drawer` / `Dialog` | "Mover Feira para": "Nenhuma" (becomes a main category) + main categories of the same kind, current one marked. Choosing saves at once, `UndoToast` |
| 12 | `IllustrationPicker` | `RadioGroup` | The 13 paper tiles + first option = the name's initial. Selected = `--ink` outline |
| 13 | `ColorPicker` | `RadioGroup` | "Sem cor" + 8 colours (Azul, Verde, Âmbar, Roxo, Vermelho, Rosa, Petróleo, Cinza), 36 px circles, selected = ring |
| 14 | `MemberPicker` | `RadioGroup` | Avatar + name buttons that wrap (3 per row on mobile); "Da casa" option for accounts ("De quem é"); cards ("Titular") list only members |
| 15 | `LockedField` | — | Grey box with a lock, the value in bold, help below ("O tipo não pode ser mudado depois.") |
| 16 | `IncomeNatureCards` | `RadioGroup` | Two cards: "Renda fixa (ex.: salário)" / "Renda variável (ex.: comissão)"; help "O orçamento usa a renda fixa." |
| 17 | `CardBlock` | — | Card illustration, name + colour dot, "Fecha dia 25 · vence dia 4 · Member A", "⋯"; the "Fatura aberta" row (total, "vence 04/11", chevron); limit line ("Limite de R$ 6.000,00", "48% usado") with the bar; "Em aberto no cartão: R$ 2.890,00, com as parcelas futuras"; footer "Melhor dia de compra: dia 25". Desktop grid: equal heights per row, footer pinned to the bottom |
| 18 | `InvoiceMonthStrip` | `ToggleGroup` in a scroll area | Month + status per pill; selected = `--ink` outline; at a year change a small vertical year label between Dec and Jan; last item "Todas" |
| 19 | `InvoiceYearSheet` | `Drawer` / `Popover` | Year with arrows, 12 months in 3 columns, each with the status badge and the total; months before the card existed are not shown; footnote "Cada fatura leva o mês em que vence." |
| 20 | `InvoiceSummary` | — | Title "Fatura de novembro" + status badge, "Fecha 25/10 · vence 04/11", big total, Pago / Falta pagar tiles, the Seu / De terceiros bar with legend, "Pagar fatura" (primary; secondary on a future invoice; hidden when nothing is due). Paid: "Paga em 03/10 com a Conta X" |
| 21 | `InvoiceLines` + filters | `ToggleGroup` | Rows: date, category illustration, description (+ "1/3" badge), value; "R$ 160,00 de terceiros" under the description; payments negative in green with the `fatura-paga` illustration. Filters: Todas, Só minhas, Com terceiros (client side) |
| 22 | `DaysRow` + `DayPickerSheet` | `Drawer` / `Popover` | Two pickers side by side, same height, one help line below both. Sheet: days 1–31 as 44 px circles, 7 per row; chosen = filled `--ink`; 29, 30, 31 with a small dot explained by a note; footer "Fecha todo dia 25" |
| 23 | `CyclePreview` | — | Sunken box with the calendar illustration: "Compras até dia 25 entram na fatura que vence dia 4. Uma compra hoje entra na fatura que vence em 04/11." From `packages/shared` billing rules |
| 24 | `TrashList` | — | Name, kind ("Categoria de despesa · dentro de Saúde"), "Excluída em … por …", reason; "Restaurar" (secondary, small) |
