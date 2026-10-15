---
summary: Design decisions for ENT-02 that change or extend entries.md, the app-wide rules decided in this round, and what the API must add.
read_when: Before building ENT-02, and when updating entries.md, api-gaps.md or the Home illustrations.
updated: 2026-10-14
---

# Decisions (ENT-02)

Where the design and the requirement docs disagree, the design wins and the doc is updated in the same PR.

## Changes to entries.md

| Topic | Requirement today | Design |
|---|---|---|
| Type choice (RF-ENT-5) | Segmented control | Wrapping pill buttons, all visible (no hidden scroll), selected in `--mint` (now the ink outline, `../entries-list/decisions.md`); "Mais" opens a sheet and then shows the chosen type |
| Date | Date field, default "Hoje" | Shortcuts "Hoje, dd mmm" · "Ontem" · "Outra data" (calendar) |
| "Quem gastou" | Common field | Only on expense and card purchase |
| Shares (RF-ENT-8) | Rows + "Sua parte" line | Dotted leader between name and value, values in one column, "Sua parte" as the last row with its value in that column |
| Category with subcategories | "Categoria": active expense category | The grid shows the parents; a parent with children shows "N sub" and, when tapped, a row "Em {mãe}" with "Só {mãe}" + its children. Posting to the parent is allowed (the API accepts any active category; the parent's budget covers its children). The field reads "Mercado › Feira" |
| Save and register another | Keeps type, date and accounts | Same, the toast shows above the buttons, focus back on Valor |
| Variable income saved | Offer "Ver sugestão de divisão" | The toast action becomes "Ver sugestão de divisão" (instead of "Ver") |
| Prefilled transfer from HOME-03 | — | A mint band on top: "Parte 1 da divisão da comissão · Reserva de emergência · R$ 600,00"; after saving, back to the split with the part "Feito" |
| No account / card yet | — | The picker sheet explains and offers "Cadastrar conta" / "Cadastrar cartão", which comes back with the new one selected and nothing lost |
| Offline | — | Offline before opening: "Novo lançamento" does not open (Home rule). Connection lost while open: dark band "Sem conexão. O que você digitou fica aqui; salve quando a conexão voltar.", save buttons disabled, nothing queued |
| Form error | "others as form messages" | Danger Alert just above the buttons: "Não foi possível registrar o lançamento. Código: {ref}." |

## Approved additions (need the API)

| Addition | Behaviour | API need |
|---|---|---|
| Description suggestions (already in the requirement) | Up to 3 recent descriptions while typing | No route today. Proposed **G38**: `GET /entries/suggestions?q=&type=` → `[{ description, categoryId, accountId (paid from / received in / card), paymentMethod, lastAmountCents, lastUsedOn }]` for the current workspace |
| Suggestion fills the rest | Choosing one also fills category, account and payment method like last time; focus back on Valor; "Desfazer" | Same G38 fields |
| "Repetir um recente" | Under the types on a new form: the entries the current person repeats most (per type). One tap fills everything including the last amount (selected to change); "Desfazer" | Proposed **G39**: `GET /entries/frequent?type=&limit=8` → same shape as G38, ordered by frequency in the last 90 days, by the current user |

Add G38 and G39 to `../../product/requirements/api-gaps.md` and the behaviour to `../../product/requirements/modules/entries.md` (ENT-02).

## App-wide rules decided in this round

1. **Illustrations:** never clipped in a circle. On white or light surfaces use the loose versions (`../assets/ilustracoes/soltas/`, 42–46 px). The paper square only when the illustration is the button itself (category grid, illustration picker); selected = 2 px `--ink` outline, no check mark. **The Home still uses circles** (budgets, invoices, goals, first run, empty states): switch them too.
2. **Desktop forms:** fields side by side share one height (48 px); only money fields are taller. A switch sits beside its label, not at the far edge.
3. **Name-to-value lists:** dotted leader when the row has a gap and no divider; no leader when rows are split by dividers. On desktop these lists use the full width of their container.
