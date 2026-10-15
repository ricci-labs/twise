---
summary: The components behind planning round A (PLAN-01..04), in build order, mapped to what already exists in apps/web.
read_when: Creating or changing a component used by the planning screens.
updated: 2026-10-15
---

# Components (planning, round A)

Reuse first (`../../architecture/web-components.md`): `PeriodPicker`, `SegmentedControl`, `PickerField`/`PickerSheet`, `Select`, `CalendarSheet`, `MoneyInput`, `ChoiceChips`, `Stepper`, `Switch`, `ActionMenu`/`ItemActions`, `Toast`, `EmptyBlock`, `ListSkeleton`, `ShowMoreButton`, the budget bar of the Home.

| # | Component | Base | Notes |
|---|---|---|---|
| 1 | `OccurrenceRow` | — | Date block (42 × 46, day 18 px display + month 11 px caps; danger tint when overdue), name (2 lines max), second line: status badge first ("Atrasado", "Hoje", "Pago", "Recebido", "Pulado"), then account · category (2 lines max), amount right (never wraps; "≈" for estimates; done rows muted). Overdue variant: a compact dark pill "Registrar" under the amount, the row keeps its height |
| 2 | `OccurrenceGroup` | — | Heading with the count; the overdue group is a card with a 1.5 px `--danger` border and a larger inner padding (6 px 16 px) |
| 3 | `PlanSummaryTiles` | — | Two tiles side by side on the phone ("Falta pagar", "Falta receber"; "Contas fixas por mês", "Receitas fixas por mês"); amounts never wrap; desktop: KPI cards |
| 4 | `OccurrenceActions` | `ActionSheet` / `ActionMenu` | Pending: Registrar pagamento/recebimento, Já registrei, Mudar o valor deste, Pular este mês. Paid: Ver lançamento, Desfazer pagamento. Skipped: Voltar a esperar. Title = name, second line "Prevista para 18/10 · R$ 120,00 · Conta X" |
| 5 | `MatchQuestion` | `Sheet` / `Dialog` | After "Registrar pagamento": "Este lançamento paga a Internet de 18/10?" with the occurrence card, "Não" + "Sim, paga". RF-PLAN-7 after any entry: "Isto paga alguma conta prevista?", candidates as selectable rows (the most likely outlined), "Não, nenhuma" + "Paga a Luz" |
| 6 | `EntryPickerSheet` ("Já registrei") | `Sheet` | Entries of the same type and accounts, most similar first ("Mais provável" badge), search, 5 + "Mostrar mais (n)", "Marcar como pago" |
| 7 | `OccurrenceAmountSheet` | `Sheet` | "Valor deste mês" money field, help "Não muda a conta fixa…", "Salvar valor" |
| 8 | `RecurrenceRow` | — | Drawing, name, second line "Todo dia 5 · Conta X · Casa › Aluguel" (2 lines max), next date line ("Próxima 05/11"; "Vence hoje" in warning; "Atrasada desde 18/10" in danger), amount right |
| 9 | `RecurrenceForm` | the forms of ACC/CARD | Type pills (locked on edit), description, money, switch "O valor muda todo mês (aproximado)" with help, account and category pickers (labels by type), `Repete` (Semanal/Mensal/Anual) + "A cada N", `Quando` radio cards with inline number pickers ("No dia [10] do mês", "No [5º] dia útil", "No mesmo dia da primeira data"), weekend `Select` (hidden for business day), first date (`CalendarSheet`), end switch + date, and the preview |
| 10 | `NextDatesPreview` | like the installment preview | Rows in a grid: date · weekday · amount; when a date moved, the reason on its own line under it ("dia 10 é domingo, foi para segunda"), never over the amount |
| 11 | `BudgetRow` | the Home's budget bar | Loose drawing (no circle), name (ellipsis) and "R$ X de R$ Y" (moves whole to the next line when it does not fit), bar with the pace mark, status with icon and text, subcategories on one line (what fits + "+N", opens the budget sheet), "⋯" |
| 12 | `BudgetSummary` | — | "Gasto nas categorias com orçamento", amount of total, bar with the pace mark, legend "onde o gasto deveria estar hoje (dia 16 de 31)" |
| 13 | `BudgetSheet` | `Sheet` / `Dialog` | Category card, "Gasto em out/26" by subcategory (dotted leader, solid line before the total), the 3-month average hint (info), "Limite por mês", "Vale a partir de" (period picker), "Remover orçamento" (danger text button, confirm dialog) |
