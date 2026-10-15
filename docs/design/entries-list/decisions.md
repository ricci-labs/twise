---
summary: Design decisions for ENT-01, ENT-03, ENT-04 and ENT-05 that change entries.md, the app-wide rules confirmed in this round, and what the API must add (G45–G47).
read_when: Before building the entries list, detail, edit or trash, and when updating entries.md, ui-standards.md or api-gaps.md.
updated: 2026-10-14
---

# Decisions (entries list, detail, edit, trash)

Where the design and the requirement docs disagree, the design wins and the doc is updated in the same PR.

## Changes to entries.md

| Topic | Requirement today | Design |
|---|---|---|
| RF-ENT-3 paging | "Carregar mais" or infinite scroll, 100 per page | 50 per load and "Mostrar mais" (ui-standards, 2026-10-14). At the end: "Isso é tudo de out/26." + the previous period |
| RF-ENT-4 search | Client side over loaded pages | The API searches (G45), from the 2nd letter, ignoring case and accents, inside the chosen period; "Buscar em todos os períodos" widens it; the match is highlighted |
| RF-ENT-2 filters | Period, account (API), type (client) | Period, type (several), account or card, category (a parent includes its subcategories), who spent, only shared — all in the API (G45). Phone: one "Filtros" sheet; desktop: one menu per filter |
| Period | "custom range" | The Home's period picker; its sheet adds "Últimos 30 dias", "Este ano" and "Escolher datas" (the app's calendar picking a range) |
| Summary | Day net "Later" | A summary line for the period and filters (G46). Day totals stay "Later" |
| Row | description, category, account, "10×", share icon, attachment icon, signed amount | Same, plus subcategory ("Mercado › Feira"), "por Member B" only when someone else spent, transfers and invoice payments without a sign in grey |
| Opened from an account or category | — | The filter comes ready as a chip ("Mercado e subcategorias"), the back arrow returns there |
| RF-ENT-9 detail | One list of facts | Header option B, then sections by kind: Detalhes, Parcelas (one row per invoice, links to CARD-03), Dividido com contatos, De onde para onde (transfer), the linked plan/split/invoice, Observações, Comprovantes, Histórico |
| Detail actions | Editar, Excluir (+ "Excluir com motivo"), Anexar | Pencil = Editar; "⋯" = Repetir (new: opens ENT-02 with the same data, today's date, amount selected; web only), Anexar comprovante, Excluir com motivo, Excluir |
| Desktop detail | — | A panel on the right over the list |
| RF-ENT-11 edit | A note on top in the replace mode | The note appears only when a value field changes, and says which ("Mudou o valor…"); one button "Salvar alterações"; no "Salvar e registrar outro" |
| Closed invoice edit | Description and notes editable | Only those two fields, plus a locked block "O que não muda" with the reason |
| Saved | "Lançamento atualizado." | Same toast, without "Desfazer" (the old version is in the history) |
| ENT-05 | Its own page | Decision 1 below |

## Decisions confirmed with the product owner

1. **Confirmed on 2026-10-15. One "Lixeira" page** with the tabs "Lançamentos | Contas e categorias" (the second is ACC-04). The "Lixeira" item of the menu (Mais on the phone, sidebar on the desktop) opens it; the trash icon of each screen opens its own tab.

## API needs (add to `../../product/requirements/api-gaps.md`)

Numbered G45–G47 in the repo (the designer's G44–G46): G44 went to the invoice lines paging the day this package arrived.

| # | Need | Today | Proposal |
|---|---|---|---|
| G45 | ENT-01 search and filters (RF-ENT-2, RF-ENT-4) | `GET /entries` filters only by period and account; the web would filter or search what is loaded | `GET /entries` adds `q` (description contains, case- and accent-insensitive, 2+ letters), `types` (several `entryType`), `categoryId` (with its subcategories), `spentByUserId`, `shared=true` (has contact shares); default `limit` 50 |
| G46 | The summary line ("Saiu", "Entrou", count) for the period and filters | Nothing; the web may not add amounts | `GET /entries/summary` with the same filters → `outCents`, `inCents`, `count`, using the same rule as the Home for what counts as spending (transfers and invoice payments count in neither) |
| G47 | `ENTRY_CANNOT_BE_RESTORED` says only "one of three reasons" | Generic toast | Return the reason (`deleted_account` with its id and name, `closed_invoice`, `replaced`) so the toast says which and can offer "Restaurar Conta Y" |

## App-wide rules confirmed in this round

1. **One selection style everywhere** also covers the new-entry type pills and the chosen month of the period sheet (both were mint): 2 px `--ink` outline and bold label.
2. **Name-to-value lists with a closing total** (shares in the detail): the dotted leader links each name to its value; the line before the total is solid, not dashed.
3. **Calendar:** weeks start on Sunday (D S T Q Q S S), as `CalendarSheet`; a range uses the outline on its ends and `--bg-sunken` between them.
