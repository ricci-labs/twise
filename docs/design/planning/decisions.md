---
summary: Design decisions for planning round A (PLAN-01..04) that change planning.md, the new app-wide rule for long text, and what the API must add (G52–G54).
read_when: Before building PLAN-01..04, and when updating planning.md, ui-standards.md or api-gaps.md.
updated: 2026-10-15
---

# Decisions (planning, round A)

Where the design and the requirement docs disagree, the design wins and the doc is updated in the same PR. Approved by the product owner on 2026-10-15.

## Changes to planning.md

| Topic | Requirement today | Design |
|---|---|---|
| Landing | `/planejamento` = PLAN-01 | Planning opens on **Previstos** (PLAN-03): it is what is used every day. Segmented control "Previstos \| Contas fixas \| Orçamentos \| Metas" |
| RF-PLAN-5 groups | Atrasados, A vencer, Pagos/Recebidos, Pulados | Same, plus the summary tiles "Falta pagar" / "Falta receber" (G53); overdue rows get a compact "Registrar"; done rows muted with when and how they were paid |
| RF-PLAN-6 after "Registrar pagamento" | Asks "Este lançamento paga {descrição} de {data}?" | Same, as a sheet with the occurrence card and "Sim, paga" as primary |
| RF-PLAN-7 | "Isto paga alguma conta prevista?" with the list and "Não" as default | Candidates as selectable rows, the most likely pre-selected; "Não, nenhuma" closes |
| "Já registrei" | Recent entries of the same type and accounts | Most similar first with "Mais provável", search, 5 + "Mostrar mais" |
| RF-PLAN-1 row | description, amount, how it repeats, account, category, next date | Same; the next date in warning ("Vence hoje") or danger ("Atrasada desde 18/10") |
| RF-PLAN-2 summary | "Contas fixas por mês", "Receitas fixas por mês" | Same, from the API (G52); the commission stays out of fixed income and says so |
| PLAN-02 day rule | radio | Radio cards with the number picker inside the sentence; business day hides the weekend rule |
| RF-PLAN-3 preview | "Próximas: 10/10, 10/11, 10/12" | Three rows with weekday and amount; an adjusted date says why on its own line |
| RF-PLAN-4 warning | Text | A warning alert on top that names the occurrence with its own amount |
| RF-PLAN-8 budgets | limit, spent, bar with pace, status; subcategories under the parent; a total | Same; status words "No ritmo", "Acima do ritmo", "Estourado"; subcategories as one line (what fits + "+N"); "Sem orçamento" shows the period's spending; the budget sheet shows spending by subcategory and the 3-month average |

## New app-wide rule: long text

Tested with long names ("Internet fibra 1 giga com TV e telefone", "Conta Conjunta do Banco Exemplo", "Fulana de Tal dos Santos Silva") and 7-digit amounts on every screen designed so far. Add to `../../product/requirements/ui-standards.md` and apply to the screens already built:

1. A list item's name: at most 2 lines, then "…". Its second line: at most 2 lines, then "…". The amount never wraps and is never cut: the text on the left shrinks instead.
2. Status badges (Atrasado, Pago, Hoje…) start the second line; they never sit beside the name.
3. "R$ X de R$ Y" beside a name moves whole to the next line when it does not fit; it never breaks in the middle.
4. A second line listing several items with values shows what fits on one line + "+N", which opens the full list.
5. Notes that explain a value (an adjusted date) go on their own line, never over the value.
6. Desktop table cells: one line with "…"; the name column may take 2 lines. The full text is in the detail.
7. Cards with a colored border (overdue) get a larger inner padding than plain lists.

## API needs (add to `../../product/requirements/api-gaps.md`)

| # | Need | Today | Proposal |
|---|---|---|---|
| G52 | PLAN-01: the next date of each recurrence and the monthly totals | The web would read occurrences per rule and convert weekly/yearly amounts | `GET /recurrences` adds per rule `nextOn`, `nextIsOverdue`, `monthlyCents` (monthly equivalent), and a `summary` with `billsMonthlyCents` (expense + card), `incomeMonthlyCents` (fixed income only) and `transfersMonthlyCents`, plus whether any amount is an estimate |
| G53 | PLAN-03: "Falta pagar", "Falta receber" and the group counts | The web would add pending amounts | `GET /occurrences` adds `totals`: `toPayCents`, `toPayCount`, `overdueCount`, `toReceiveCents`, `toReceiveCount`, and counts per status, for the same range |
| G54 | PLAN-04: the summary, spending by subcategory, spending of categories without a budget, and the 3-month average | `budgetPace` has one line per budget only | `GET /overview?period=` (or `/budgets/summary`) adds `budgetTotals` (`limitCents`, `spentCents`), per budget `children: [{ categoryAccountId, spentCents }]` and `directCents`, `unbudgeted: [{ categoryAccountId, spentCents }]`, and `GET /budgets/:categoryId/average?months=3` → `averageCents` |
