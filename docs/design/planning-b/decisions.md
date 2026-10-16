---
summary: Design decisions for planning round B (PLAN-05..07) that change planning.md, holidays moving to Configurações, the selection-style fix in picker sheets, and what the API must add (G58–G60).
read_when: Before building PLAN-05..07, and when updating planning.md, ui-standards.md, experience.md or api-gaps.md.
updated: 2026-10-15
---

# Decisions (planning, round B)

Where the design and the requirement docs disagree, the design wins and the doc is updated in the same PR. Approved by the product owner on 2026-10-15.

## Changes to planning.md

| Topic | Requirement today | Design |
|---|---|---|
| RF-PLAN-9 reserve | Highlighted card: saved, target, progress, "Cobre {n} meses de gastos" | Same, plus where it is kept and "67% · faltam R$ X"; the coverage as a pill. No reserve: its place stays on top explaining what it is, with "Criar a reserva" |
| RF-PLAN-9 goals | name, account, "R$ 1.200 de R$ 5.000 · 24%", deadline, "faltam R$ X", "Meta atingida" | Same, as cards; with a deadline, "Para chegar em {mês}: R$ X por mês" (G58); no deadline: "sem prazo"; reached: "Passou R$ X", mint bar and the hint to conclude (delete) or raise the target |
| Goal actions | Nova, Salvar, Excluir | Plus "Guardar dinheiro" (transfer prefilled to the goal's account with the monthly amount) and "Ver lançamentos da conta" |
| Delete a goal used by the split | Dialog "…Tire ela de lá também." | The dialog says it and its button "Excluir e tirar da divisão" removes the step and saves the split in the same action; without a step: "Excluir {nome}? O dinheiro continua na conta." |
| `GOAL_ACCOUNT_TAKEN` | Field error | Prevented: the picker dims accounts of other goals and names the goal; the error stays for a race on save |
| `RESERVE_ALREADY_SET` | Field error | Prevented: the switch is disabled and says which goal is the reserve; the error stays for a race |
| Goal form | fields + help | Plus a monthly preview when there is a deadline (G58) and "Criar uma conta para a meta" in the account picker |
| Metas → split | — | A link card at the end of Metas opens PLAN-06 |
| RF-PLAN-10 reorder | Drag to reorder | Drag by a grip **and** "Mover para cima/baixo" in each step's "⋯" (keyboard, screen readers, desktop without touch). "O que sobrar" never moves |
| RF-PLAN-10 add | — | Two steps: the type (5 radio cards, "o que sobrar" disabled when it exists), then its fields in a sheet; the percent field shows the value for the example amount |
| RF-PLAN-11 example | R$ 1.000 or the average, with `splitVariableIncome` | Chips "Esta comissão" (default: the period's commission not split yet, as HOME-03), "Média" (last 3), "Outro valor". Rows with dotted leaders and "Sem destino" after a solid line. Desktop adds a stacked bar. Recomputed live with the shared `splitVariableIncome` |
| Invalid step | Flag "Meta excluída" | Danger card, message under the title, the example skips it ("—"); "Salvar divisão" disabled until it is removed |
| Remove a step | — | No dialog: removed at once with toast "Passo removido." + "Desfazer"; nothing is saved until "Salvar divisão" |
| Save | Dialog "Substituir a divisão atual?" | Same, text "A próxima comissão já segue a ordem nova. As divisões que vocês já fizeram não mudam."; button disabled until something changes; toast "Divisão salva." |
| No steps | — | Empty block with "Usar a sugestão" (step 1 fill the reserve goal, step 2 the rest to the account that receives the commission; only when a reserve exists, otherwise the rest only) and "Adicionar passo" |
| Split desktop | — | Two columns of the same height: steps + three short rules; the example + "Comissões recebidas" (PROPOSTA, G59) |
| PLAN-07 route | `/planejamento/feriados` | **`/configuracoes/feriados`** (redirect the old one). Holidays are a workspace setting rarely changed: Configurações gets a group "Planejamento" with "Feriados" ("15 em 2026 · próximo: Finados, 02/11") and the budget base. Shortcut "Ver feriados" in the recurrence form's business-day help. On the phone the "Mais" tab is active, on the desktop "Configurações" |
| RF-PLAN-12 list | Year picker, national read only, local with Excluir | Same; past holidays muted, the next one marked "Próximo", weekend ones say "cai no fim de semana"; "Adicionar feriado" in the "Do espaço" header |
| Holidays desktop | — | The year as 12 mini calendars + three cards (next holiday and its effect (G60), the workspace's, legend and note) |
| Delete a holiday | Dialog | "Excluir {nome} ({dd/mm})?" + "As contas fixas que mudaram por causa dele voltam a contar o dia {d} como útil, a partir dos próximos previstos." |
| Add a holiday | — | Toast "Feriado adicionado. As próximas contas fixas já contam com ele."; errors on the date field |

## Changes to experience.md and ui-standards.md

- `../../product/requirements/experience.md`: PLAN-07 is reached from "Mais › Configurações › Feriados" (and from the recurrence form), not from the Planning tabs.
- `../../product/requirements/ui-standards.md`, **one selection style**: add "picker sheets and menus too: the current item gets the 2 px `ink` outline and a bold label, with no mint fill and **no check mark**". Today `PickerSheet` (`picker-check`) and `ActionMenu` (`Check`) draw a check — fix them (instructions, step 2).
- `../../product/requirements/ui-standards.md`, **read-only cards**: when the grip and "⋯" are hidden, the card's inner padding grows to 16 px.
- `../../product/requirements/ui-standards.md`, **desktop density**: no large empty areas; columns in one row share their height; the shorter column gets support content (rules, history, summary), never filler.

## API needs (add to `../../product/requirements/api-gaps.md`)

| # | Need | Today | Proposal |
|---|---|---|---|
| G58 | PLAN-05: each goal's percent, what is left or over, the monthly amount to reach the deadline, the reserve coverage, and the same monthly amount live in the form | The web would divide balances and count months | `GET /goals` adds per goal `savedCents`, `percent`, `remainingCents`, `overCents`, `monthlyToTargetCents` (null without `targetOn`), and for the reserve `coverageMonths`; `GET /goals/preview?targetCents=&accountId=&targetOn=` → `monthlyToTargetCents`, `savedCents` |
| G59 | PLAN-06 desktop (PROPOSTA): "Comissões recebidas" — each recent variable income and how many split parts were recorded | Split parts are only linked from each entry (`ENT-03`) | `GET /allocation/history?limit=3` → `[{ periodLabel, receivedOn, amountCents, partsDone, partsTotal }]` plus `averageCents` (the "Média" chip also uses it) |
| G60 | PLAN-07: what each upcoming holiday changes in the fixed bills, and the summary of the Configurações row | The web would recompute business days | `GET /holidays?year=` adds per upcoming holiday `affects: [{ recurrenceId, description, fromOn, toOn }]`, and `summary: { total, national, workspace, next: { onDate, name, daysAway } }` |
