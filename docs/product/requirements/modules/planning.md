---
summary: Functional requirements for planning — recurring bills and incomes, planned occurrences and matching them to payments, budgets, goals and the emergency reserve, the commission split steps, and holidays (screens PLAN-01..07).
read_when: Designing or building any planning screen, or a shortcut that pays a planned bill.
updated: 2026-10-15
---

# Planning

Standards: `../ui-standards.md`. Messages per code: `../error-messages.md`. Domain:
`../../../domain/model/planning.md`, `../../household-finances.md`. API:
`/api/workspaces/:id/{recurrences,occurrences,budgets,goals,allocation-steps,holidays}`.
Designed in `../../../design/planning/` (round A: PLAN-01..04; read `../../../design/planning/decisions.md`). Round B
(PLAN-05..07) is not designed yet.

## Navigation
The "Planejamento" tab opens on **Previstos** (`PLAN-03`): it is what is used every day. Under the
title, a segmented control "Previstos | Contas fixas | Orçamentos | Metas" switches between
`PLAN-03`, `PLAN-01`, `PLAN-04` and `PLAN-05` (Metas comes with round B). On the desktop the same
tabs sit under the title. Viewers and members without the permission see no "+", no "Registrar",
no "⋯" and no "Definir". Skipping and unmatching never ask: a toast with "Desfazer" for 8 s.
Deleting a recurrence asks (there is no trash for recurrences).

## Rules that shape these screens
- **A recurrence** ("conta fixa", "salário", "assinatura") plans occurrences ("previstos") from
  today up to the end of the 6th month ahead. The past is never planned. Types: "Despesa" (from a
  money account), "Receita", "Compra no cartão" (a subscription on a card), "Transferência". The type
  can't change after creation.
- **Schedule:** weekly (repeats the weekday of the start date), monthly or yearly, every 1–52;
  monthly/yearly on a day of the month (1–31; a short month uses its last day) or on the N-th
  business day (1–10), or by default on the start date's day. Weekend rule: "Manter a data",
  "Antecipar para o dia útil anterior", "Adiar para o próximo dia útil". Business day = Monday to
  Friday, not a national bank holiday or a workspace holiday. Optional end date (not before the
  start).
- **"Valor aproximado"** (`amountIsEstimate`, e.g. the energy bill, a commission) shows amounts with
  "≈" and widens the match tolerance from 5% to 20%.
- **Occurrence status:** "Pendente", "Pago/Recebido" (matched to an entry), "Pulado" (skipped).
  "Atrasado" is a pending one past its date. A matched occurrence follows its entry: editing the
  entry keeps the match, deleting the entry makes it pending again.
- **Matching is never automatic.** After a payment is recorded, the app suggests the planned bills
  it probably pays (same type, same two accounts, within ±10 days and the tolerance); a member
  confirms. A member may also match by hand any entry with the same type and accounts.
- **Changing a recurrence** re-plans its future pending occurrences: amounts edited on those are
  lost. The web warns about it.
- **Budgets:** a monthly limit for an expense category, valid from a period on until changed; a
  parent category's budget covers its subcategories. Removing a budget = setting no limit from a
  period on.
- **Goals:** each goal lives in one money account and its progress is that account's balance; one
  goal per account; at most one goal is the emergency reserve ("Reserva de emergência").
- **Commission split** ("Divisão da comissão"): up to 10 ordered steps that suggest how to split
  variable income. Nothing moves by itself: the member records the transfers.
- **Holidays:** national bank holidays are built in; the workspace adds local ones (e.g. the city's
  anniversary). They change business days, and so the planned dates computed from now on.

## PLAN-01 Recurring bills and incomes (MVP)
Route `/planejamento/contas-fixas`, the "Contas fixas" tab. Permission `planning:view`.
`GET /recurrences`.

**RF-PLAN-1** Two sections, "Contas e assinaturas" (expense, card) and "Receitas" (income), plus
"Transferências programadas". Row: description, amount ("≈" when estimate), how it repeats in
words ("Todo dia 10", "No 5º dia útil", "Toda segunda", "A cada 3 meses no dia 15"), account or card,
category, next due date (from the API, G52): "Próxima 05/11"; "Vence hoje" in warning;
"Atrasada desde 18/10" in danger. Income in green; a variable income (the commission) with "≈" and
"variável"; transfers muted, with "Conta X → Poupança". Each group has its add link in the header.
**RF-PLAN-2** A summary on top: "Contas fixas por mês" and "Receitas fixas por mês" (monthly
equivalents of the active rules: a weekly or yearly rule counts by its monthly average), from the
API (G52); the commission stays out of fixed income and says so. The desktop adds a third
indicator, the scheduled transfers per month.
Actions: "Nova conta fixa" / "Nova receita" (`planning:create`) → `PLAN-02`; tap → `PLAN-02` edit
(`planning:update`); the row's "⋯" has "Ver previstos" (`PLAN-03` filtered by that recurrence),
"Editar" and "Excluir" (`planning:delete`) with the dialog "Excluir {descrição}? Os
previstos pendentes dela somem; os já pagos continuam no histórico." and then the toast
"{descrição} excluída.".
Empty: "Nenhuma conta fixa cadastrada. Cadastre aluguel, internet e salário para ver o que está
comprometido." + actions.

## PLAN-02 New or edit recurrence (MVP)
Full screen on the phone, like the other forms; the large dialog (880 px) in two columns on the
desktop. Create `POST /recurrences` (`planning:create`); edit `PATCH /recurrences/:id` (`planning:update`,
always sending the whole schedule). It opens over Planning with `?recurrence=new&recurrenceType=`
(`expense`, `income`, `transfer` from the group links and the empty states), so the title stays
"Nova conta fixa" and the button names the type ("Criar conta fixa", "Criar receita", "Criar
transferência").

| Field | Label | Input | Required | Rules |
|---|---|---|---|---|
| entryType | "Tipo" | segmented: "Despesa", "Receita", "Compra no cartão", "Transferência" | yes (create only) | fixed after creation |
| description | "Descrição" | text | yes | trimmed, 1–200 |
| amountCents | "Valor" | money | yes | > 0 |
| amountIsEstimate | "O valor muda todo mês (aproximado)" | switch | — | default off |
| sourceAccountId | "Pago com" / "Recebido em" / "Cartão" / "De" (by type) | picker | yes | expense, income, transfer: active money account; card: active card |
| categoryAccountId | "Categoria" / "Para" (transfer) | picker | yes | expense and card: expense category; income: income category; transfer: another money account, different from "De" |
| frequency | "Repete" | "Semanal", "Mensal", "Anual" | yes | |
| interval | "A cada" | number + unit ("semanas", "meses", "anos") | yes, default 1 | 1–52 |
| day rule | "Quando" | radio cards (monthly/yearly) with the number picker inside the sentence: "No dia [10] do mês", "No [5º] dia útil", "No mesmo dia da primeira data" | yes | day 1–31 ("Se o mês tiver menos dias, vale o último.") or business day 1–10 (the help says what a business day is); hidden for weekly, which repeats the weekday of the first date (the list words it "Toda sexta" / "A cada 2 semanas, na sexta"; the form shows the weekday in the preview). Until a day is picked, the day follows the first date |
| weekendRule | "Se cair em fim de semana ou feriado" | select: "Manter a data", "Antecipar para o dia útil anterior", "Adiar para o próximo dia útil" | yes, default keep | hidden when "N-th business day" is chosen |
| startsOn | "Primeira data" | date | yes | valid date; help "Só planejamos a partir de hoje." |
| endsOn | "Termina em" | date, with "Sem data para terminar" (default) | no | not before the first date: "A data final não pode ser antes da primeira." |

The labels of the account and category pickers follow the type ("Pago com", "Cartão", "Recebido
em", "De"/"Para"); the type is locked on edit.
**RF-PLAN-3** A live preview of the next three dates, one row each with the date, the weekday and
the amount, computed with the shared rules and holidays (the web never computes dates by itself).
A date moved by a weekend or a holiday says why on its own line under it ("dia 10 é domingo, foi
para segunda"), never over the amount.
**RF-PLAN-4** Editing a rule with pending future occurrences whose amount was changed shows a
warning alert on top that names the occurrence with its own amount: "Ao salvar, os próximos
previstos voltam para o valor desta conta fixa." Saving re-plans the pending occurrences.
Actions "Criar" / "Salvar". Errors: `RECURRENCE_INVALID` (the form checks the same rules under
each field before sending; the API names no field, so one that still comes back is the form alert
with its code), `RECURRENCE_ACCOUNTS_INVALID` (a form alert: "Confira as contas: elas precisam
estar ativas e combinar com o tipo."; above the button, as every form alert, where the board draws
it on top), `RECURRENCE_NOT_FOUND`.

Not in the form: "Lembrar X dias antes" (stored per rule but unused: reminders follow each member's
lead time, `ME-01`) and "Registrar sozinho" (phase 2). See `../api-gaps.md`.

## PLAN-03 Planned occurrences (MVP)
Route `/planejamento/previstos`, where `/planejamento` lands. Permission `planning:view`.
`GET /occurrences?from&to` (up to 366 days; default the current financial period, chosen with the
Home's period picker).

**RF-PLAN-5** Two tiles on top, "Falta pagar" and "Falta receber", from the API (G53). Grouped,
each heading with its count: "Atrasados" (pending, past due: a card with a danger border, and a
compact "Registrar" under the amount that keeps the row's height), "A vencer", "Pagos e recebidos"
(muted, with when and with which account they were paid), "Pulados" (muted). Row: a date block (day
and month), the description, a second line with the status badge first ("Atrasado", "Hoje",
"Pago", "Recebido", "Pulado") and then account or card and category, the amount on the right ("≈"
for estimates; a matched estimate shows the real amount and "≈" the planned one). More than 5 in a
group: "Mostrar mais". Tap → the actions, titled with the description and "Prevista para 18/10 ·
R$ 120,00 · Conta X". Loading: skeletons shaped like the rows. The desktop shows one table with the
groups as bands (due date, recurrence, account or card, status, amount), the main action in the
row ("Registrar pagamento" when pending, "Ver lançamento" when paid) and "⋯" with the rest.
**RF-PLAN-6** Row actions (`planning:update` unless said):
| Action | Shown when | Does |
|---|---|---|
| "Registrar pagamento" / "Registrar recebimento" | pending | opens `ENT-02` prefilled (type, accounts, amount, description, date = today); after saving, a sheet with the occurrence card asks "Este lançamento paga {descrição} de {data}?" with "Sim, paga" as the primary action and "Não" (leaves the entry unmatched) → match (`entries:create` + `planning:update`) |
| "Já registrei" | pending | a sheet with entries of the same type and account, the most similar first (the likely ones badged "Mais provável"), a search, 5 + "Mostrar mais" (`GET /occurrences/:id/candidates`, G56); pick one and "Marcar como pago" → match. `ENTRY_ALREADY_MATCHED` and `OCCURRENCE_ENTRY_MISMATCH` show as the sheet's alert |
| "Mudar o valor deste" | pending | a sheet with "Valor deste mês", help "Não muda a conta fixa.", "Salvar valor"; editing the recurrence later brings the amount back (G17: the form warns) |
| "Pular este mês" | pending | skip without asking; the row moves to "Pulados" and a toast offers "Desfazer" (unskip) for 8 s |
| "Desfazer pagamento" | matched | unmatch; the entry stays; toast with "Desfazer" |
| "Ver lançamento" | matched | `ENT-03` |
| "Voltar a esperar" | skipped | unskip |

**RF-PLAN-7** Suggesting matches from the other side: after any expense, income, card purchase or
transfer is saved in `ENT-02`, the web calls `GET /occurrences/suggestions?entryId=` and, when there
are suggestions, shows the sheet "Isto paga alguma conta prevista?" with the candidates as
selectable rows (the most likely one pre-selected), "Não, nenhuma" (closes without matching) and
"Paga {descrição}". No suggestions: nothing shows.
Errors: `OCCURRENCE_NOT_PENDING` ("Este previsto já foi pago ou pulado. Atualize a lista."),
`OCCURRENCE_ENTRY_MISMATCH` ("Esse lançamento não usa as mesmas contas desta conta fixa."),
`ENTRY_ALREADY_MATCHED` ("Esse lançamento já paga outro previsto."), `ENTRY_NOT_AVAILABLE`,
`OCCURRENCE_NOT_MATCHED`, `OCCURRENCE_NOT_SKIPPED`, `OCCURRENCE_INVALID`, `OCCURRENCE_QUERY_INVALID`.
Empty: "Nada previsto neste período." with the shortcut to the first recurrence.

## PLAN-04 Budgets (MVP)
Route `/planejamento/orcamentos`. Read `budgets:view`; change `budgets:update` (owners and admins
by default). `GET /budgets?period=` for limits; `GET /overview?period=` (G54) → `budgetPace` for
spent and pace, each budget's `directCents` and `children` (subcategories that spent, largest
first), `budgetTotals` (`count`, `limitCents`, `spentCents`, `expectedCents`, `usedPercent`,
`offPaceCount`), `unbudgetedSpending` (top categories without a budget that spent, largest first;
the other active ones show R$ 0,00), `categoryAverages` (each expense category's average over the
last `periods` periods with activity, at most 3) and `periodProgress` for "dia 16 de 31".

**RF-PLAN-8** The period picker on top, then a summary card: "Gasto nas categorias com orçamento",
spent of the sum of limits, a bar with the pace mark and the legend "onde o gasto deveria estar
hoje (dia 16 de 31)" (from the API, G54). "Com orçamento": each expense category with a budget
shows its drawing, "R$ X de R$ Y" (moves whole to the next line when it does not fit), a progress
bar with the expected-pace mark, and the status with an icon and text: "No ritmo", "Acima do
ritmo", "Estourado"; under it, on one line, the spending of its subcategories, the largest first,
what fits + "+N" (opens the budget sheet with all of them). A parent's budget covers its
subcategories. "Sem orçamento": the other expense categories with the period's spending and
"Definir". Empty: "Nenhum orçamento ainda." with what a budget does and "Definir orçamento". The
desktop shows three indicators (the sum of limits, spent, how many are off pace) and two tables.

The budget opens in a sheet on the phone and a medium dialog on the desktop, "Orçamento de
{categoria}": the category card, "Gasto em {mês}" by subcategory (dotted leaders, a solid line
before the total), the average of the last 3 months as a reference (G54), then the fields. "Definir"
opens the same sheet empty, with the average.

| Field | Label | Required | Rules |
|---|---|---|---|
| limitCents | "Limite por mês" | yes (or the "Sem orçamento" switch) | money > 0 |
| fromPeriod | "Vale a partir de" | yes, default the viewed period | month picker; help "Continua valendo nos meses seguintes até você mudar." |
Actions "Salvar orçamento", "Remover orçamento" (a danger text button; sends no limit from the
period on; dialog "Remover o orçamento de {categoria} a partir de {mês}?" with "Os meses anteriores continuam com o
limite que tinham."). Errors `BUDGET_INVALID`,
`BUDGET_CATEGORY_INVALID` ("Orçamentos só valem para categorias de despesa ativas."),
`BUDGET_QUERY_INVALID`.

## PLAN-05 Goals and emergency reserve (MVP)
Route `/planejamento/metas`. `GET /goals` (`planning:view`).

**RF-PLAN-9** The reserve first, as a highlighted card: saved, target, progress, and "Cobre {n}
meses de gastos" (from `HOME-01` → reserve coverage). Other goals: name, account, saved of target
(e.g. "R$ 1.200 de R$ 5.000 · 24%"), deadline and "faltam R$ X"; a goal over its target shows
"Meta atingida".
| Field | Label | Required | Rules |
|---|---|---|---|
| name | "Nome da meta" | yes | 1–80 |
| targetCents | "Valor da meta" | yes | money > 0 |
| accountId | "Guardado em" | yes | active money account not used by another goal: `GOAL_ACCOUNT_TAKEN` "Essa conta já é de outra meta." |
| targetOn | "Até quando" | no | date |
| isReserve | "É a reserva de emergência" | no | only one: `RESERVE_ALREADY_SET` "Já existe uma reserva de emergência." |
Help: "O progresso é o saldo da conta escolhida. Use uma conta só para esta meta."
Actions: "Nova meta" (`planning:create`), "Salvar" (`planning:update`), "Excluir"
(`planning:delete`, dialog; when a commission step uses it: "Esta meta está na divisão da comissão.
Tire ela de lá também."). Errors `GOAL_INVALID`, `GOAL_ACCOUNT_INVALID`, `GOAL_NOT_FOUND`.

## PLAN-06 Commission split steps (MVP)
Route `/planejamento/divisao-da-comissao`. Read `planning:view`; save `planning:update`.
`GET/PUT /allocation-steps`.

**RF-PLAN-10** An ordered list (drag to reorder), up to 10 steps, each one of:
| Step | Label | Fields |
|---|---|---|
| `fill_goal` | "Completar uma meta" | goal (picker) |
| `cover_overspent` | "Cobrir o que passou do orçamento no período" | — |
| `percent` | "Porcentagem para uma conta" | account, percent 1–100 ("da comissão inteira") |
| `fixed_amount` | "Valor fixo para uma conta" | account, amount |
| `rest` | "O que sobrar para uma conta" | account; only as the last step |
**RF-PLAN-11** A live example with R$ 1.000 (or the average commission) shows where each real
would go, using the shared `splitVariableIncome`.
A step pointing to a deleted goal is flagged "Meta excluída" and must be removed before saving.
Action "Salvar divisão" replaces the whole list: dialog "Substituir a divisão atual?". Errors
`ALLOCATION_INVALID` ("O passo 'o que sobrar' precisa ser o último."), `ALLOCATION_ACCOUNT_INVALID`,
`ALLOCATION_GOAL_INVALID` ("Uma das metas foi excluída. Remova esse passo.").

## PLAN-07 Holidays (MVP)
Route `/planejamento/feriados`. `GET /holidays?year=` (2000–2100).

**RF-PLAN-12** A year picker; national bank holidays with their pt-BR names ("Carnaval
(segunda-feira)", "Sexta-feira Santa", "Corpus Christi", "Dia da Consciência Negra" from 2024…),
read only; local holidays with "Excluir" (`planning:delete`, dialog).
| Field | Label | Required | Rules |
|---|---|---|---|
| onDate | "Data" | yes | valid date; not a national holiday (`HOLIDAY_ALREADY_NATIONAL` "Esse dia já é feriado nacional."); one per day (`HOLIDAY_DATE_TAKEN` "Já existe um feriado nesse dia.") |
| name | "Nome" | yes | 1–80 |
Action "Adicionar feriado" (`planning:create`). Note: "Previstos já planejados não mudam de data;
a mudança vale para os próximos." Errors `HOLIDAY_INVALID`, `HOLIDAY_QUERY_INVALID`,
`HOLIDAY_NOT_FOUND`.
