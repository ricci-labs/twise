---
summary: Overview of the accounts, categories and cards design (ACC-01..04, CARD-01..04): layouts, rules, build order and what is still not designed.
read_when: Starting any accounts, categories, cards or invoice screen.
updated: 2026-10-14
---

# Accounts, categories and cards

Requirement: `../../product/requirements/modules/accounts-and-cards.md`. Error copy: `../../product/requirements/error-messages.md` (Accounts, Cards). Screens: `screens.md`. Components: `components.md`. **Read `decisions.md` before building**: it changes the requirement in several places and lists what the API must add.

## Layouts

- **Mobile, Contas e categorias** (`/contas`, `/categorias`): reached from "Mais"; "Mais" stays marked in the bar. Title, the trash icon on the right, and the segmented tabs "Contas | Categorias".
  - Contas: three indicators in a carousel (Total em dinheiro, Em aberto nos cartões, Próxima fatura), the first at the 16 px margin and the next one peeking, dots below. Then the groups "Dinheiro" and "Cartões", each with its add link in the group header ("+ Nova conta", "+ Novo cartão"). "Arquivadas (n)" collapsed at the end.
  - Categorias: chips "Despesas | Receitas", the list of categories (loose illustration, name, "N subcategorias ⌄" when it has children, "⋯"). Opening shows the subcategories as chips that wrap, plus a dashed "+" chip.
- **Mobile, Cartões** (`/cartoes`, the "Cartões" tab): one block per card. Card → invoices with a month strip on top (`/cartoes/:id`) → invoice detail (`/cartoes/:id/faturas/:faturaId`).
- **Forms** (ACC-03, CARD-04): full screen on mobile, like the new-entry form; a 560 px dialog on desktop (the card form uses two columns).
- **Desktop:** the same area with the sidebar item marked. Contas: three KPI cards (a third of the width each), then full-width tables. Categorias: two full-width tables (Despesas, Receitas) with the subcategories as chips in the row. Cartões: a grid of cards (two per row with 1–2 cards, three per row with more) and the "Próximas faturas" table. The card page joins CARD-02 and CARD-03: month strip, four KPIs and the lines table.

## Rules that hold everywhere

- Same form and feedback patterns as the account, Home and new-entry screens: errors on blur; `aria-disabled` submit with no hint; "* obrigatório" on long forms; help text above the input; "Criando…"/"Salvando…" in the button.
- **Archive and delete never ask first** when the action can be undone: the item leaves the list and a toast offers "Desfazer" for 8 s (bottom on mobile, top-right on desktop). A dialog appears only when the action is **refused** (it explains why and offers the way out, usually "Arquivar").
- Sheets on mobile, dropdown menus on desktop, with the same items in the same order. Each action shows only for who has its permission; viewers see no "+", no trash and no "⋯".
- Illustrations: loose on white surfaces, paper tile only when the illustration is the button; selected = 2 px `--ink` outline, bold label, no check mark. Entries made by the system (invoice payment, transfer, opening balance, receipt) use the new illustrations, never a line icon.
- Every selection in these screens (month strip, chips, days, holder, tapped subcategory chip) uses the same 2 px `--ink` outline.
- The web shows numbers, it does not compute them: totals, "% usado" and the next invoice come from the API (`decisions.md`, API needs). Counting items already in a list ("2 subcategorias") is fine.

## Build order

1. Components in `components.md`, 1 to 8 (rows, groups, KPI carousel, action sheet/menu, undo toast, refused-action dialog, archived toggle, loading/empty/error blocks).
2. ACC-01 Contas mobile, with all states, then ACC-03 (account), ACC-04 trash.
3. ACC-02 Categorias with subcategories and every subcategory action, then ACC-03 (category, edit, move).
4. CARD-01, CARD-02 (strip, year sheet), CARD-03, CARD-04 (days row and day sheet).
5. Desktop versions (same components; tables, menus, dialogs).
6. The proposals that need the API (`decisions.md`), when the API has them.

## Not designed yet (behaviour from the requirement)

- Reordering accounts and categories (`sortOrder`, Later).
- "Dívidas" group: hidden until loans have a flow (`../../product/requirements/api-gaps.md` G15).
- ENT-01 filtered by an account or category (opened from these screens): entries round.
