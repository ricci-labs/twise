---
summary: Design decisions for accounts, categories and cards that change accounts-and-cards.md, the app-wide rules decided in this round, and what the API must add (G40–G42).
read_when: Before building ACC-01..04 or CARD-01..04, and when updating accounts-and-cards.md, error-messages.md or api-gaps.md.
updated: 2026-10-14
---

# Decisions (accounts, categories, cards)

Where the design and the requirement docs disagree, the design wins and the doc is updated in the same PR.

## Changes to accounts-and-cards.md

| Topic | Requirement today | Design |
|---|---|---|
| ACC-01 total | "a total of money" | Three indicators: Total em dinheiro, Em aberto nos cartões, Próxima fatura. Mobile: carousel with dots. Desktop: a row of three KPI cards, then full-width tables |
| Add actions | "Nova conta" | In each group header: "+ Nova conta" (Dinheiro), "+ Novo cartão" (Cartões, opens CARD-04), "+ Nova categoria" |
| Archive / delete | "toast with Desfazer" (archive) | Both without a confirmation dialog, toast with "Desfazer" for 8 s. A dialog only when the API refuses (`ACCOUNT_CANNOT_BE_DELETED`) |
| Category tree depth | "no depth limit" | **The UI uses two levels** (categoria › subcategoria). "Dentro de" lists only main categories of the same kind; a category that has subcategories can't be put inside another (the field is locked and explains why). The API may keep its rule; the web just never offers a third level |
| Subcategories on mobile | "a tree" | Collapsed by default with "N subcategorias ⌄"; open = chips that wrap + a dashed "+" chip. No tree lines |
| Subcategories on desktop | — | A table per kind; chips in the row; when they don't fit: the ones that fit + "+N mais" (opens that row only, "Mostrar menos"), and "N subcategorias" under the name |
| Subcategory actions | "Actions as in ACC-01" | Tapping a chip opens its actions: Ver lançamentos, Editar, **Mover para outra categoria** (new shortcut for `parentId`, saves at once with "Desfazer"), Arquivar, Excluir. Viewers: the chip opens the entries |
| Refused delete copy | One text: "Esta conta tem lançamentos ou subcategorias." | The web picks the text by kind and by what the list already shows: account "Esta conta tem lançamentos…", subcategory "Feira tem lançamentos. Arquive em vez de excluir: ela sai das escolhas e o histórico continua.", parent "Mercado tem 2 subcategorias: Feira e Padaria. Mova ou exclua as duas antes, ou arquive Mercado com elas." (more than 3: "Mercado tem 5 subcategorias, como Feira e Padaria.") |
| Refused restore copy | "A conta mãe está na lixeira. Restaure ela primeiro." | "Saúde, a categoria mãe, está na lixeira." + toast action "Restaurar as duas" (restores the parent, then the child). "conta mãe" for accounts |
| Unarchive a child of an archived parent | — | Toast "Mercado está arquivada. Desarquive Mercado primeiro." + "Desarquivar Mercado" |
| CARD-01 on desktop | "One card per row" | Grid: half width each with 1–2 cards, three per row with more (a list that grows down, not a carousel); a dashed "Novo cartão" tile fills an incomplete last row; then "Próximas faturas" (all cards, soonest first) |
| CARD-02 | "a list or month strip" | Month strip, selected = `--ink` outline; small vertical year label at a year change; "Todas" opens the year sheet (3 × 4 months with status and total). An invoice is named after its **due** month ("Fatura de novembro" is due 04/11) |
| Paying a future invoice | — | Allowed; "Pagar fatura" becomes a secondary button |
| CARD-02 + CARD-03 on desktop | Two screens | One page: strip, four KPIs (total, falta pagar, seu, de terceiros), the lines table with the filters in its header |
| CARD-04 days | "day picker 1–31" | The two days side by side at the same height, help once below both; each opens the day sheet (circles 1–31, 29–31 marked) |
| CARD-04 holder | "member picker" | One holder per card (informational); the member buttons wrap with more members |
| Invoice payment line | "Pagamento" negative | Uses the new `fatura-paga` illustration, value in green with "−" |

## API needs (add to `../../product/requirements/api-gaps.md`)

| # | Need | Today | Proposal |
|---|---|---|---|
| G40 | ACC-01 indicators: "Total em dinheiro" (and how many accounts), "Em aberto nos cartões", "Próxima fatura" | The web would have to add balances | `GET /balances` (or a small `GET /accounts/summary`) adds `moneyTotalCents`, `moneyAccountCount`, `cardsOpenCents`, and `nextInvoice` (`cardId`, `invoiceId`, `dueOn`, `dueCents`) — the Home overview already has `nextInvoice[]`, reuse it |
| G41 | CARD-01 block and desktop "Próximas faturas": each card's open invoice, "% usado" of the limit and the upcoming invoices of all cards | One call per card and a percentage computed in the web | `GET /cards` adds per card `openCents` (all-time, with future installments), `limitUsedPercent` (null without a limit), `currentInvoice` (`invoiceId`, `referenceMonth`, `dueOn`, `totalCents`, `dueCents`); and `GET /cards/invoices/upcoming?limit=` for the desktop table |
| G42 | **PROPOSTA:** archiving a category with active subcategories | Archives only the parent; the children stay active but have no parent in the pickers | `POST /accounts/:id/archive` archives the active children too, in one transaction, and returns their ids; `unarchive` brings back the children archived with it. Until then the web shows the dialog and the "Arquivar as 3" action calls archive for each child, then the parent |

## App-wide rules decided in this round

1. **KPIs on mobile:** when desktop shows 3 or more KPI cards in a row, mobile shows the same cards as a carousel with dots (Home, Contas, and later Planning).
2. **One selection style:** 2 px `--ink` outline + bold label for every selected or pressed item (tiles, chips, month pills, days, member buttons, the tapped chip while its menu is open). No mint fill, no check mark.
3. **System illustrations:** entries and actions made by the system use illustrations in the same hand-drawn style, never line icons: `fatura-paga`, `transferencia`, `saldo-inicial`, `recebimento` (paper and loose versions in `../assets/ilustracoes/`). Line icons stay for interface controls (menus, buttons). The "Mais" sheet of the new-entry form now uses them (updated `../entries/screens/png/ENT-mais.png`).
4. **Desktop grids:** cards in a row have the same height; their footer sits at the bottom.
5. **Messages name things:** a refused action says which item and why, and offers the way out; the web picks the copy by the kind of item.
6. **Every list is designed with:** loading, empty, error, viewer, many items, archived, actions (sheet and menu), undo toast and the refused case. New screens follow the same checklist.
