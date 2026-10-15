---
summary: Overview of planning round A (PLAN-01..04): layouts, rules, build order and what is still not designed.
read_when: Starting any planning screen of round A.
updated: 2026-10-15
---

# Planning, round A

Requirement: `../../product/requirements/modules/planning.md` (PLAN-01..04). Error copy: `../../product/requirements/error-messages.md` (Planning). Screens: `screens.md`. Components: `components.md`. **Read `decisions.md` before building**: Planning now opens on "Previstos", and three API additions (G52–G54) feed the numbers.

## Layouts

- **Planejamento** (the "Planejamento" tab): title and a segmented control "Previstos | Contas fixas | Orçamentos | Metas" (Metas comes in round B). Opens on **Previstos**.
- **Previstos** (`/planejamento/previstos`, the default): the Home's `PeriodPicker`; two tiles "Falta pagar" and "Falta receber"; groups Atrasados (danger card with a compact "Registrar" under the amount), A vencer, Pagos e recebidos (muted, when and with which account), Pulados. Rows: a date block (day + month), the name, a second line with the status badge first, then account and category; the amount on the right ("≈" when estimated). Tap → actions.
- **Contas fixas** (`/planejamento`, or `/planejamento/contas-fixas` if Previstos takes the root): two tiles (fixed bills and fixed income per month), groups "Contas e assinaturas", "Receitas", "Transferências programadas", each with its add link.
- **Nova / Editar conta fixa:** full screen on the phone, the 880 px dialog in two columns on the desktop.
- **Orçamentos** (`/planejamento/orcamentos`): period picker, a summary card (spent vs. the sum of limits, with the pace mark), "Com orçamento" rows with the bar and the pace mark, "Sem orçamento" with the period's spending and "Definir". The budget opens in a sheet (phone) or a medium dialog (desktop).

## Rules that hold everywhere

- `../../product/requirements/ui-standards.md` rules: the app's pickers and calendar; no bottom sheets on the desktop; long lists with "Mostrar mais"; Home margins; one selection style (2 px `--ink` outline).
- **Long text (new app-wide rule, see `decisions.md`):** names up to 2 lines, second lines up to 2 lines, amounts never wrap or get cut; status badges start the second line; "R$ X de R$ Y" moves whole to the next line; multi-item second lines show what fits + "+N"; desktop table cells are one line with "…".
- Skip and unmatch never ask: toast with "Desfazer" for 8 s. Deleting a recurrence asks (no trash).
- Viewers and members without the permission: no "+", no "Registrar", no "⋯", no "Definir".

## Build order

1. API G52–G54 (the web must not add monthly equivalents, totals or averages).
2. Components in `components.md`.
3. Previstos with every action and both match questions.
4. Contas fixas and the recurrence form (preview with the reason for an adjusted date).
5. Orçamentos and the budget sheet.
6. Desktop.

## Not designed yet

- Goals and emergency reserve (PLAN-05), commission split (PLAN-06), holidays (PLAN-07): round B.
- "Lembrar X dias antes" and "Registrar sozinho" (not in the form: `../../product/requirements/api-gaps.md` G16).
