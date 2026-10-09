---
summary: Where every number on the Home comes from (existing endpoints and fields) and which ones are design proposals that need an API change first.
read_when: Wiring a Home widget to data, or planning API work for the Home.
updated: 2026-10-07
---

# Data behind the Home

The web never computes a metric (`../../product/requirements/modules/dashboard.md`). Anything below marked **proposal** needs the API first; until then the widget is hidden.

## Already in the API

| Widget | Source |
|---|---|
| KPIs: livre para gastar, por dia, renda, gasto, comprometido | `GET /overview` → `freeToSpend`, `dailyAllowance`, `budgetIncome`, `spent`, `committed` |
| "Média mensal (3 meses)" under Gasto | `reserveCoverage.monthlySpendingCents` |
| Balance forecast | `balanceForecast[]` (`points`, `lowestCents`, `lowestOn`, `until`) |
| Budgets | `budgetPace[]` |
| Coming months | `committedAhead[]` |
| Next invoices | `nextInvoice[]` |
| Reserve | `reserveCoverage` |
| Commissions | `variableIncome`, `variableAverage` |
| Alerts | `insights[]` (RF-HOME-4) |

## Exists in another route; the Home must also load it (or `/overview` should include it)

| Widget | Source |
|---|---|
| Bills due in the next 7 days | `GET /occurrences` (`dueOn`, `status`) |
| "R$ X são de outras pessoas" on each invoice | `GET /cards/:id/invoices` → `frontedCents` |
| Goals with deadlines | `GET /goals` (`targetOn`, `savedCents`, `targetCents`) |
| Receivables and "Próximo a receber" | `GET /contacts/balances` (`owedCents`, `overdueCents`, `nextDueOn`, `nextDueCents`) |

## Proposals (need new API fields; add to `../../product/requirements/api-gaps.md` if approved)

| Widget | Needs |
|---|---|
| "% da renda" under Gasto and Comprometido | percent of budget income per metric |
| Pace of the period (radial) | percent of income used and percent of the period elapsed |
| Where income goes (100% bar) | spent / committed / free as percents |
| "+25% acima da média" on commissions | percent difference to the average |
| Achievements of a closed period | a period summary: amount left, months in a row closing positive, budgets within limit (n of m), bills paid on time (n of m), amount added to the reserve, goals progress at start and end |
| "Ver onde ajustar" on the negative KPI | link target: budgets list sorted by how far ahead of pace |
