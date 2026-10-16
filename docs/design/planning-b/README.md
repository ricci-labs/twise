---
summary: Overview of planning round B (PLAN-05..07): goals and the emergency reserve, the commission split, holidays (now under Configurações); layouts, rules, build order.
read_when: Starting any screen of PLAN-05, PLAN-06 or PLAN-07.
updated: 2026-10-15
---

# Planning, round B

Requirement: `../../product/requirements/modules/planning.md` (PLAN-05..07). Error copy: `../../product/requirements/error-messages.md` (Planning). Round A (PLAN-01..04) is in `../planning/`. Screens: `screens.md`. Components: `components.md`. **Read `decisions.md` before building**: holidays move to Configurações, and three API additions (G58–G60) feed the numbers.

## Layouts

- **Metas** (`/planejamento/metas`, the 4th tab of Planning): the **reserve card** first (mint-soft surface): label, the amount large, "de R$ 18.000,00 · guardado na Poupança", the bar, a pill "Cobre 2,4 meses de gastos", "67% · faltam R$ 6.000,00", the drawing and "⋯". Then "Metas (n)" with "+ Nova meta" and one **goal card** per goal: drawing, name (2 lines max), "Guardado em {conta}" (badge "Meta atingida" first when reached), "R$ X de R$ Y" (moves whole to the next line), a blue bar (mint when reached), "32% · até jul/27" or "· sem prazo", "faltam R$ X" or "Passou R$ X", and when there is a deadline a hint "Para chegar em jul/27: R$ 1.134,00 por mês". Last, a link card to the **Divisão da comissão** ("4 passos. A próxima comissão vai primeiro para a reserva.", "Editar divisão").
- **Nova / Editar meta:** full screen on the phone, a 720 px dialog in two columns on the desktop. Help on top, name, value, "Guardado em", "Até quando" (the app's calendar, optional), the monthly preview when there is a deadline, the reserve switch (locked when another goal is the reserve, saying which).
- **Divisão da comissão** (`/planejamento/divisao-da-comissao`): a sentence on what it is; numbered steps ("Passo 1" above the title) with a grip, the drawing of the destination, what it does, a detail line and "⋯"; "Adicionar passo"; "Como ficaria" with the example; a sticky "Salvar divisão" (disabled until something changes). Desktop: steps on the left (with three short rules at the bottom of the card), on the right the example with a stacked bar and "Comissões recebidas" (PROPOSTA, G59).
- **Feriados** (`/configuracoes/feriados`, opened from Configurações and from the business-day help of the recurrence form): year with arrows, the note, "Do espaço" (with "Adicionar feriado" and "⋯ Excluir") and "Nacionais (bancários)" (read only). Desktop: the **year as a calendar** — three cards on top (next holiday with what it changes in the fixed bills, the workspace's holidays, the legend with the note) and 12 mini months below (Sunday first, 4 per row, same height), each with its holidays' names under it.

## Rules that hold everywhere

- `../../product/requirements/ui-standards.md`: the app's pickers and calendar; no bottom sheets on the desktop; one selection style (2 px `--ink` outline, bold label, no mint fill, **no check mark — also in picker sheets and menus**, see `decisions.md`); the long-text rule of round A.
- Reorder never depends on dragging: every step's "⋯" has "Mover para cima" / "Mover para baixo".
- Read-only cards (viewer) lose the grip and "⋯" and gain inner padding (16 px), so the drawing never touches the edge.
- Desktop pages have no large empty areas: columns in a row share their height and the shorter one gets useful support content.
- Viewers and members without the permission: no "+", no "⋯", no grip, no "Adicionar passo", no "Salvar divisão", no "Adicionar feriado".

## Build order

1. Docs PR (decisions.md) and API G58–G60.
2. Fix the selection style in `PickerSheet` and `ActionMenu` (no check mark), used again here.
3. Metas and the goal form.
4. Divisão da comissão (with the shared `splitVariableIncome` for the live example).
5. Holidays under Configurações, mobile list and desktop calendar.
6. Desktop of each.
