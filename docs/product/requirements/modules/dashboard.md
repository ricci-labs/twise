---
summary: Functional requirements for the home screens — the period overview (four indicators, insights, bills due, balance forecast, pace, budgets, coming months, where income goes, invoices, reserve and goals, commissions, receivables, achievements of a closed period, first run), "posso comprar?" and the commission split suggestion (HOME-01..03).
read_when: Designing or building HOME-01, HOME-02 or HOME-03, or writing the pt-BR text of an insight.
updated: 2026-10-09
---

# Dashboard

Standards: `../ui-standards.md`. Messages per code: `../error-messages.md`. Why the numbers are what
they are: `../../household-finances.md`, ADR 0024. API: `/api/workspaces/:id/overview`,
`/allocation/suggestion`, `/simulations/purchase` (all `reports:view`, every role).

## Rules that shape these screens
- **The financial period** follows the workspace settings (`SET-01`): calendar month, from day N,
  or from the N-th business day. Periods are named by the month they start in, and every label
  shows its range ("out/26 · 5 out – 4 nov").
- **Installments count** on each invoice's due date ("por parcela", default) or all at once in the
  purchase month ("no mês da compra"), per the workspace setting.
- **Budget income** is the fixed income (salaries, received or still expected) by default, or all
  income. Commissions are shown apart and never inflate the budget unless that setting says so.
- **"Today"** is the workspace time zone's today, also when looking at another period.
- All numbers come from the API; the web never recomputes a metric, it only formats it.

## HOME-01 Period overview (MVP)
Route `/` (inside a workspace). `GET /overview?period=YYYY-MM` (omitted = the current period).
Design: `../../../design/home/` (screens, data, decisions, approved by the user on 2026-10-09).
Fields marked *(planned)* are added to `/overview` by the Home round (`../api-gaps.md` G25–G34);
until a field exists its widget stays hidden.

**RF-HOME-1 Period header.** Greeting "Bom dia / Boa tarde / Boa noite, {nome}" and "Hoje é {data} ·
faltam {n} dias para o fim do período" (`periodProgress.left`). Period picker (previous /
next, and the label opens the months of the year with their ranges; the current one in mint,
future ones dashed); the period goes in the URL (`?period=2026-10`). A past period shows the badge
"Período encerrado" and "Ir para o período atual"; a future one "Período futuro".

**RF-HOME-2 Indicators.** Four cards of equal weight, in this order; on mobile a swipeable carousel
(one card at a time, the next one peeking, dots that are buttons, each card read as "2 de 4"):
| Card | Value | Lines under it | Help "?" |
|---|---|---|---|
| "Livre para gastar" (mint, piggy bank) | `freeToSpend` | "R$ X por dia" (`dailyAllowance`) · "Até {fim} · faltam {n} dias" | "Renda fixa do período, menos o que já foi gasto, menos as contas que ainda vão vencer." |
| "Renda do orçamento" | `budgetIncome` | "Comissão à parte: R$ X" (`variableIncome`, when the base is fixed income) | "Salários recebidos e previstos no período." |
| "Gasto" | `spent` | "{p}% da renda" (`incomeShare.spentPercent`) · "Média mensal (3 meses): R$ X" (`spendingAverage.monthlyCents`) | "Despesas e parcelas que caem neste período." |
| "Comprometido" | `committed` | "{p}% da renda" (`incomeShare.committedPercent`) · "{n} contas vencem nos próximos 7 dias" (`billsDue.count`) | "Contas fixas previstas que ainda não foram pagas, incluindo atrasadas." |
- **Negative** `freeToSpend`: the first card turns danger-soft, value in red, badge "Passou do
  planejado", the reason in one line, "Ver onde ajustar" (→ `PLAN-04` sorted by how far ahead of
  pace) and the piggy bank in trouble; no "por dia".
- **Closed period:** the first card turns white and reads "Sobrou no período encerrado"; no "por
  dia". "Comprometido" reads "Nada ficou para vencer" when it is zero.
- **Future period:** no "por dia"; the pace and the balance forecast are hidden.
- Values never wrap; above R$ 99.999,99 the number steps down one size.

**RF-HOME-3 "Posso comprar?"** shortcut card under the indicators → `HOME-02` (hidden for a closed
period).

**RF-HOME-4 Insights** ("Avisos · Os mais urgentes primeiro."; max 3 visible, "Ver todos os {n}
avisos" for the rest), in the order the API sends them (alerts first). Each: severity style, the
pt-BR sentence below, and an action.
| Code | Severity | Sentence (values formatted) | Action |
|---|---|---|---|
| `period_overspent` | alert | "Os gastos e as contas deste período já passaram da renda em {overspentCents}." | "Ver gastos" → `ENT-01` |
| `budget_over` | alert | "{categoria} estourou o orçamento: {spentCents} de {limitCents}." | "Ver orçamento" → `PLAN-04` |
| `balance_going_negative` | alert | "O saldo de {conta} deve ficar negativo: {lowestCents} em {lowestOn}." | "Ver previsão" → balance section |
| `occurrence_overdue` | warning | expense: "{descrição} venceu em {dueOn} ({amountCents}) e ainda não foi registrada." · income: "{descrição} era esperada em {dueOn} ({amountCents}) e ainda não entrou." | "Registrar" → `PLAN-03` |
| `budget_ahead` | warning | "{categoria} está gastando acima do ritmo: {spentCents} até agora, o esperado era {expectedCents}." | "Ver orçamento" |
| `period_heavily_committed` | warning | "{mês} já tem {percentOfIncome}% da renda fixa comprometida ({committedCents})." | "Ver próximos meses" |
| `contact_overdue` | warning | "{contato} está com {overdueCents} em atraso." | "Cobrar" → `CON-03` |
| `variable_income_to_split` | info | "Ainda há {amountCents} de comissão para dividir neste período." | "Ver sugestão" → `HOME-03` |
Names come from other lists already loaded (categories, accounts, contacts); the overdue
occurrence carries its own description (G9). Unknown codes are skipped. None: "Tudo em ordem por
aqui." On mobile a calm success line, not a card; on desktop the card stays (the grid must not
jump) with the same line centered and the green check icon.

**RF-HOME-5 Budgets** (`budgetPace`): "Os 5 mais adiantados em relação ao ritmo do período." Top 5
by how far ahead of pace; each row with the category illustration (the account's `icon`, else its
initial). Desktop as an aligned table under a header row ("Categoria · ritmo de hoje · Gasto de
limite · Situação": category, bar with the pace mark, "R$ X de R$ Y", status icon + "Estourou" /
"Adiantado" / "No ritmo"), mobile as stacked rows (name and "R$ X de R$ Y", the bar, then "Passou
R$ 60,00" from `overCents`, "Adiantado: 16% acima do ritmo" from `aheadPoints`, or "No ritmo"; the
footer is the legend "ritmo de hoje"). Note: "Traço = onde o
gasto deveria estar hoje ({p}% do período)." (`periodProgress.elapsedPercent`). "Ver
todos" → `PLAN-04`. No budgets: "Defina orçamentos para acompanhar o ritmo dos gastos." with the
link (`budgets:update`; others see only the line).

**RF-HOME-6 Next invoices** (`nextInvoice`, one per card): card name, "Fecha {dd/mm} · vence
{dd/mm}", "Total previsto" (`forecastCents`), "R$ X lançado · R$ Y previsto" (`postedCents`,
`plannedCents`) and a chip "R$ X são de outras pessoas" (`frontedCents`) or "Tudo de
vocês". Tap → `CARD-03`; "Ver cartões" → `CARD-01`.

**RF-HOME-7 Balance forecast** (`balanceForecast`, one per money account, account tabs inside the
card, plus "Todas" from `balanceForecastAll`: the everyday accounts (checking, wallet) added day by
day to the latest salary, when there are at least two): "Do dia de hoje até o próximo salário, com
o que já está previsto." Step area chart from today to `until`, dashed zero line, the lowest point
marked ("R$ X" / "{data} · menor saldo do período"), negative stretches in the danger style; footer
"Hoje R$ A · termina em R$ B em {data}", or in red "Conta X fica negativa de {dd/mm} a {dd/mm}, até
o salário entrar." ("O saldo somado fica negativo…" for "Todas") from `negativeFrom` /
`negativeUntil`.
Text alternative: "Conta X: hoje R$ A, termina em R$ B, menor saldo R$ C em {data}." Hidden for a
closed or future period (closed: replaced by RF-HOME-17).

**RF-HOME-8 Coming months** (`committedAhead`, 6 periods): stacked bars "Parcelas" and "Contas
previstas", "{n}%" above each bar, a dashed line at "70% da renda fixa", 70% or more in warning; a
line under the chart for the first month at or above 70%: "{Mês} já tem {n}% da renda fixa
comprometida." Help: "Quanto da renda fixa dos próximos meses já está comprometido."

**RF-HOME-9 Reserve and goals:** "A reserva vem primeiro; depois, as metas com prazo."
- reserve (`reserveCoverage`, when a reserve goal exists): radial "{p}%" (`reserveCoverage.percent`), "R$ X de R$ Y", "Cobre {months} meses de gastos" (one decimal; "—" without spending
  history);
- goals with a deadline (`goalProgress`, soonest deadline first): "{nome} · R$ X de R$ Y · {p}% · até {mês/aa}". "Ver
  metas" → `PLAN-05`. No reserve and no goals: an invitation line with the link (`goals:create`).

**RF-HOME-10 Shortcuts:** "Novo lançamento" (floating on mobile, sidebar button on desktop;
`entries:create`).

**RF-HOME-14 Pace of the period** (`periodPace`): "Quanto da renda já foi usada,
comparado ao tempo que passou." Radial "{p}% da renda", "Renda já usada {p}%", "Período passado
{q}%" and "Vocês estão {n} pontos à frente do ritmo." / "… atrás do ritmo." / "Vocês estão no
ritmo." Closed period: "Como o período terminou" with "Gasto {p}%" and "Sobrou {q}%" and "O que
sobrou pode ir para a reserva."

**RF-HOME-15 Where income goes** (`incomeShare`): "Renda do orçamento de R$ X neste
período." A 100% bar with "Gasto", "Comprometido", "Livre" (percent and amount); "A comissão de
R$ X fica fora desta conta." when the base is fixed income.

**RF-HOME-16 Bills due in the next 7 days** (`billsDue`): "{n} contas · R$ X até
{dd/mm}, e {k} atrasada(s)." Rows with a date block, description, amount and "{Dia} · em {n}
dias"; an overdue row is tinted danger-soft with "Atrasada há {n} dias" and "Registrar" on the same
line (`entries:create`). "Ver contas fixas" → `PLAN-03`. None: "Nenhuma conta vence nos próximos 7
dias."

**RF-HOME-17 Achievements of a closed period** (`periodSummary`), in place of the
balance forecast: "Conquistas de {mês}" · "O que deu certo neste período." A mint highlight
"Fecharam {mês} no azul · Sobrou R$ X · {n}º mês seguido" (`periodSummary.positiveStreak`; "{n}+ meses seguidos" when `streakCapped`)
and four tiles: "{a} de {b} orçamentos dentro do limite" (`budgetsWithin` / `budgetsTotal`), "{a} de
{b} contas pagas em dia" (`billsOnTime` / `billsTotal`), "+R$ X na reserva, que agora cobre {m}
meses" (`reserveAddedCents`, `reserveCoverage.months`), "{p}% → {q}% da meta {nome}" (the first of
`goals`, the biggest move). A tile without data (total 0, nothing added, no goal moved) is left out. A period that closed negative shows no highlight.

**RF-HOME-18 Commissions** (`variableIncome`, `variableAverage`): "Renda variável deste período."
"Este período R$ X", "Média dos últimos meses R$ Y" ("—" when null) and "+{p}% acima da média" /
"{p}% abaixo da média" (`variableVsAverage`); "Dividir" → `HOME-03` when there is
commission (`entries:create`).

**RF-HOME-19 Receivables** (`receivables`): "A receber de contatos · De quem usa os
cartões de vocês." "R$ X de {n} contatos · R$ Y em atraso", "Próximo a receber: {contato}, R$ Z em
{dd/mm}", "Cobrar" (`charges:create`) and "Ver contatos" → `CON-01`. Hidden when nobody owes.

**Layout.** Mobile: indicators, "Posso comprar?", insights, bills due, forecast, pace, budgets,
coming months, where income goes, invoices, reserve and goals, commissions, receivables. Desktop
(12 columns, equal-height rows): indicators (4×3) · forecast (8) + insights (4) · budgets (8) +
pace (4) · coming months (8) + where income goes (4) · bills due, invoices, reserve and goals (4
each) · commissions and receivables (6 each).

**States.** Skeletons per section in the shape of the cards (header, period and menu appear at
once); changing the period keeps the old numbers until the new ones arrive (200 ms fade); each
section fails alone with its `ref` and "Tentar de novo" (`../ui-standards.md` → Partial);
`OVERVIEW_QUERY_INVALID` resets to the current period. Empty states sit on the card (icon in a
soft circle + one line). Offline: a dark band on top, the last numbers kept and "Atualizado às
HH:MM"; write actions say it can't be done now. Viewer: banner "Você está vendo este espaço sem
poder alterar nada.", no "Novo lançamento", no "Registrar", "Dividir", "Cobrar"; the "Ver…" links
and "Posso comprar?" stay.

**First run** (no money account yet; the Home opens normally once one exists, each section with its
own empty state): a mint welcome band with the owl and the house, the title, why in
one sentence, the progress ("{a} de 5 feitos") and a button for the next step; then the numbered
steps, the next one open with its action, done ones checked and collapsed: "Cadastre suas contas",
"Cadastre seus cartões", "Cadastre salário e contas fixas", "Registre os primeiros gastos" and, in
its own dashed card, "Convide quem divide com você" (`MEM-03`, owners). Beside or below, a faded
preview of the indicators, each saying which step unlocks it ("Depois do passo {n}"). No period
picker until there are numbers. Right after `WS-01` the band plays its entrance once
(`../../../design/home/motion.md`).

## HOME-02 "Posso comprar?" (MVP)
Route `/posso-comprar`. `GET /simulations/purchase` (read-only, nothing is recorded).

| Field | Label | Input | Required | Rules |
|---|---|---|---|---|
| amountCents | "Valor da compra" | money | yes | > 0 |
| payment | "Como vai pagar" | radio "No cartão" / "Na conta" | yes | |
| cardAccountId | "Cartão" | card picker (archived allowed but hidden by default) | when "No cartão" | a card |
| installmentCount | "Parcelas" | stepper, default 1 | when "No cartão" | 1–48 and ≤ the amount in cents (prevents a known API error, `../api-gaps.md`) |
| paidFromAccountId | "Conta" | money-account picker | when "Na conta" | a money account; installments hidden |
| occurredOn | "Quando" | date, default "Hoje" | no | valid date |

**RF-HOME-11** "Simular" (or live, debounced 500 ms after a valid change) shows:
- this period: "Livre para gastar: R$ A → R$ B" and "Por dia: R$ C → R$ D";
- the next 6 months: a list or bars with "Comprometido: R$ X → R$ Y ({p}% → {q}% da renda fixa)",
  only months that change highlighted;
- new alerts (`newInsights`) with the insight sentences, e.g. "Março ficaria com 82% da renda fixa
  comprometida.";
- a verdict line: no new alert → "Cabe no orçamento."; only warnings → "Cabe, mas aperta."; any
  alert → "Não cabe sem estourar." (wording to validate in design).
Errors: `SIMULATION_QUERY_INVALID` (fields), `SIMULATION_CARD_INVALID` / `SIMULATION_ACCOUNT_INVALID`
(field: "Escolha um cartão/conta ativo."). The same simulation becomes an agent tool on WhatsApp
later (`../../../integrations/ai-agent.md`).

## HOME-03 Commission split suggestion (MVP)
Route `/dividir-comissao`, opened from the insight, from an income entry of variable nature, or from
the menu. `GET /allocation/suggestion?amountCents=`.

| Field | Label | Required | Rules |
|---|---|---|---|
| amountCents | "Valor da comissão" | yes, default the period's commission not split yet | money > 0 |

**RF-HOME-12** Shows the steps (from `PLAN-06`) with the amount each would take and the destination:
"1. Reserva de emergência → Poupança X: R$ 600,00"; "Cobrir o orçamento estourado: R$ 150,00 (fica
na conta)"; what is left over. Without steps: "Você ainda não definiu como dividir a comissão." +
"Definir divisão" → `PLAN-06`.
**RF-HOME-13** Each part with a destination has "Transferir" (`entries:create`), opening `ENT-02`
as a transfer prefilled with the amount and destination; the source is the account where the
commission landed (asked once, then remembered for the screen). Recorded parts show "Feito".
Error `ALLOCATION_QUERY_INVALID` (field amount).
