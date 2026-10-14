---
summary: Functional requirements for accounts, categories, balances, cards and invoices — screens ACC-01..04 and CARD-01..04, with fields, actions, states, rules and errors.
read_when: Designing or building accounts, categories, cards or invoice screens.
updated: 2026-10-14
---

# Accounts and cards

Design: `../../../design/accounts/` (screens, components, and `../../../design/accounts/decisions.md`, which this doc
follows). Standards: `../ui-standards.md`. Messages per code: `../error-messages.md`. Domain:
`../../../domain/model/ledger.md`, `../../../domain/billing-and-installments.md`. API:
`/api/workspaces/:id/accounts`, `/cards`, `/balances`.

## Rules that shape these screens
- **Account kinds** (the user creates the money kinds and categories; loans are hidden for now):
  | Kind | Label | Group |
  |---|---|---|
  | `checking` | "Conta corrente" | Money |
  | `savings` | "Poupança" | Money |
  | `cash_wallet` | "Carteira (dinheiro)" | Money |
  | `investment` | "Investimento" | Money |
  | `loan` | "Empréstimo" | Debts. Not offered in the UI yet: no entry type moves money in or out of it (`../api-gaps.md` G15) |
  | `expense_category` | "Categoria de despesa" | Categories |
  | `income_category` | "Categoria de receita", with nature "Renda fixa" (salário) or "Renda variável" (comissão) | Categories |
  | `credit_card` | "Cartão de crédito" | Cards, created only in `CARD-04` |
  | `receivable`, `payable`, `opening_balance` | "A receber", "A pagar", "Saldo inicial" | System, one each, created with the workspace |
- **Categories have two levels in the UI:** a category can have a parent of the same class
  (expense under expense, income under income), shown as "Mercado › Feira". The API accepts any
  depth; the web never offers a third level: "Dentro de" lists only main categories of the same
  kind, and a category that has subcategories can't be put inside another (the field is locked
  and says why).
- **Names:** 1 to 80 characters, unique without case among siblings (same parent and class).
- **Archived** ("arquivada") accounts still count in history and balances but can't receive new
  entries; pickers hide them. **Deleted** ones go to the trash and are only allowed when no active
  entry uses them and they have no active children ("arquive em vez de excluir").
- **Archive and delete never ask first** (both can be undone): the item leaves the list and a
  toast offers "Desfazer" for 8 s ("Conta Y arquivada.", "Conta excluída.", "Feira arquivada.",
  "Padaria excluída."). A dialog appears only when the API **refuses**; it names the item, says
  why and offers the way out (usually "Arquivar"), with "Cancelar". The web picks the copy by the
  kind of item and by what the list already shows (`../error-messages.md` → Accounts).
- **Actions** open as a sheet on the phone and a dropdown menu on the desktop, with the same items
  in the same order; the destructive one last, in danger. Each shows only for who has its
  permission; a viewer sees no "+", no trash and no "⋯".
- **The web shows numbers, it doesn't compute them:** totals, "% usado" and the next invoice come
  from the API (`../api-gaps.md` G40, G41). Counting items already in a list is fine.
- **System accounts** can only get colour, icon and order; rename, move, archive and delete are
  hidden for them.
- **A card** is an account plus its cycle. Name, colour, archive and delete go through the account
  routes (`accounts:*`); the cycle through the card routes (`cards:*`). A member can edit a card's
  cycle but not rename or archive it.
- **Which invoice a purchase goes to** (show it live in forms): before the closing day → this
  month's invoice; after → next; on the closing day → next when "Compras no dia do fechamento vão
  para a próxima fatura" is on (default). Due date: same month when the due day is after the
  closing day, else the next month. A day beyond the month's length becomes its last day.
- **Invoice status:** "Futura" (only installments so far), "Aberta" (receives purchases now),
  "Fechada" (final). The stored status can be stale (`../api-gaps.md`), so the web computes it
  with the shared `invoiceStatusOn` for display.
- **Own vs fronted:** each invoice total splits into "Seu" (own) and "De terceiros" (what contacts
  owe, from shares).
- **Balances** are all-time; a card's balance includes future installments ("total em aberto no
  cartão").

## ACC-01 Accounts and balances (MVP)
Route `/contas`. Permission `accounts:view`. Reached from "Mais › Contas e categorias" ("Mais"
stays marked on the phone's bar; "Contas e categorias" in the sidebar). Contas and Categorias are
tabs of the same area ("Contas | Categorias" under the title; the trash icon on the right).

**RF-ACC-1** Three indicators (G40): "Total em dinheiro" ("{n} contas", "Cartões ficam de fora."),
"Em aberto nos cartões" ("{n} cartões", "Inclui as parcelas futuras.") and "Próxima fatura" (card
name, "Vence em {dd/mm} · fecha {dd/mm}"). On the phone a carousel with dots (the first card at the
16 px margin, the next one peeking); on the desktop a row of three KPI cards, a third of the width
each. Then the groups, each with its add link in the header: "Dinheiro" (checking, savings,
wallet, investment; "+ Nova conta") and "Cartões" ("+ Novo cartão", opens `CARD-04`), with a
note under the cards "Nos cartões, o total em aberto inclui as parcelas futuras." A row: the loose
drawing, the name with the colour dot, the second line "{tipo} · {dono}" ("Conta corrente ·
Member A", "Poupança · da casa"; for a card "Em aberto · fecha {dd/mm} · vence {dd/mm}"), today's
balance (`naturalBalanceCents`) on the right, and "⋯". "Dívidas" only when one exists (loans have
no flow yet). Archived accounts go in a collapsed "Arquivadas (n)" at the end; system accounts
(A receber, A pagar, Saldo inicial) are not listed. On the desktop the groups are full-width
tables (conta, tipo, de quem, saldo aligned right).
**RF-ACC-2** Tapping an account opens `ENT-01` filtered by it.

| Action ("⋯", in this order) | Permission | Rule |
|---|---|---|
| "Ver lançamentos" | `entries:view` | `ENT-01` filtered by the account |
| "Editar" | `accounts:update` | opens `ACC-03`; on system accounts only colour, drawing and order |
| "Informar saldo inicial" | `entries:create` | money accounts: `ENT-02` as an opening balance on this account |
| "Arquivar" / "Desarquivar" | `accounts:update` | no confirmation; toast "{nome} arquivada." with "Desfazer" |
| "Excluir" | `accounts:delete` | no confirmation; toast "Conta excluída." with "Desfazer"; `ACCOUNT_CANNOT_BE_DELETED` → dialog "Não dá para excluir a {nome}" / "Esta conta tem lançamentos ou subcategorias. Arquive em vez de excluir." with "Cancelar" and "Arquivar" |
| "+ Nova conta" / "+ Novo cartão" | `accounts:create` / `cards:create` | `ACC-03` with the money kinds / `CARD-04` |
| Trash icon | `accounts:delete` | opens `ACC-04` |

States: loading (skeletons shaped like the rows; title, tabs and buttons at once); empty (loose
drawing, "Nenhuma conta ainda." "Comece pela sua conta corrente. Depois, os cartões." and "Nova
conta"; the Home's first step leads here); error ("Não foi possível carregar as contas.", the code,
"Tentar de novo"; the top keeps working); viewer (the read-only band, no add links, trash or "⋯";
a row still opens its entries).

## ACC-02 Categories (MVP)
Route `/categorias`. Permission `accounts:view`.

**RF-ACC-3** On the phone, chips "Despesas | Receitas"; on the desktop both as full-width tables,
one under the other (no tabs). Each category: the loose drawing, the name and "⋯"; income
categories carry the nature badge with text ("Fixa" green, "Variável" blue) and the sentence "A
renda fixa (salário) é a que o orçamento usa; a variável (comissão) entra na divisão da comissão."
Totals per category are not shown here (they belong to `HOME-01`). Tapping the name opens `ENT-01`
filtered by it.
**RF-ACC-3b** Subcategories. Phone: collapsed by default under "{n} subcategorias ⌄" (the app
remembers which are open on the device); open, they are chips that wrap plus a dashed "+" chip
("Nova subcategoria em {mãe}"). Desktop: chips in the row's own column, on one line: the ones that
fit (most used first), then "+{n} mais" (opens that row only, which then ends with "Mostrar menos")
and "{n} subcategorias" under the name; the "+" chip always last. Tapping a chip opens its actions
(sheet / menu under the chip); the chip keeps the ink outline while they are open. A viewer's chip
opens its entries.

| Action | Permission | On |
|---|---|---|
| "Ver lançamentos", "Editar", "Arquivar"/"Desarquivar", "Excluir" | as in `ACC-01` | categories and subcategories |
| "Nova subcategoria" | `accounts:create` | main categories: `ACC-03` with "Dentro de" filled |
| "Mover para outra categoria" | `accounts:update` | subcategories: "Mover {nome} para" lists "Nenhuma" (it becomes a main category) and the main categories of the same kind, the current one marked "atual"; choosing saves at once (`PATCH /accounts/:id` with `parentId`) with the toast "{nome} agora está em {mãe}." and "Desfazer". The entries go along and count in the new parent's budget |
| "+ Nova categoria" | `accounts:create` | `ACC-03` with Despesa / Receita |

The subcategory's sheet title is its name with "Subcategoria de {mãe}" under it; there is no
"Nova subcategoria" on a subcategory (two levels). Refused deletes, with the dialog's way out:
a subcategory with entries "Não dá para excluir {nome}" / "{nome} tem lançamentos. Arquive em vez
de excluir: ela sai das escolhas e o histórico continua." ("Arquivar"); a category with active
subcategories "{nome} tem 2 subcategorias: Feira e Padaria. Mova ou exclua as duas antes, ou
arquive {nome} com elas." (more than three: "{nome} tem 5 subcategorias, como Feira e Padaria.")
with "Arquivar as {n+1}", which archives each child and then the parent (until G42).
Archived, opened at the end: a parent shows its children as faded chips; a lone archived
subcategory says "Subcategoria · em {mãe}". Unarchiving a child whose parent is archived: toast
"{mãe} está arquivada. Desarquive {mãe} primeiro." with "Desarquivar {mãe}". Reordering by
`sortOrder` (Later).

## ACC-03 New or edit account or category (MVP)
Full screen on the phone (like `ENT-02`), a 560 px dialog with one column on the desktop, footer
"Cancelar" and the main button. Create: `POST /accounts`, permission `accounts:create`. Edit:
`PATCH /accounts/:id`, permission `accounts:update`. Starts with "* obrigatório".

| Field | Label | Input | Required | Rules |
|---|---|---|---|---|
| kind | "Tipo" | choice chips: the four money kinds from "+ Nova conta" ("Conta corrente" marked), "Despesa" / "Receita" from "Nova categoria"; on edit a locked field with the lock | yes (create only) | help before it: "O tipo não pode ser mudado depois." |
| name | "Nome" | text | yes | trimmed, 1–80; unique among siblings |
| incomeNature | "Natureza da receita" | two choice cards "Renda fixa" (ex.: salário) / "Renda variável" (ex.: comissão) | income category (create) | help before: "O orçamento usa a renda fixa." |
| parentId | "Dentro de" | picker of **main** categories of the same kind, plus "Nenhuma (principal)" | no | categories only; filled from "Nova subcategoria". Editing a subcategory: help "Escolha "Nenhuma" para {nome} virar uma categoria principal." Editing a category that has subcategories: locked, "{nome} tem subcategorias, então continua principal. Para colocar {nome} dentro de outra, mova ou exclua Feira e Padaria antes." |
| ownerUserId | "De quem é" | member buttons that wrap, plus "Da casa" (= none) | no | money accounts only; informational |
| icon | "Ilustração" | the 13 drawings on paper tiles, the first option the name's initial ("Sem ilustração: a inicial") | no | the selected tile keeps its paper and gets the 2 px ink outline |
| color | "Cor" | "Sem cor" + Azul, Verde, Âmbar, Roxo, Vermelho, Rosa, Petróleo, Cinza (36 px circles) | no | help "Aparece nos gráficos e ao lado do nome."; `#RRGGBB` |

Actions: "Criar conta" / "Criar categoria" (create; `aria-disabled` without a name) or "Salvar"
(edit; enabled when something changed). System accounts (A receber, A pagar) only change colour,
drawing and order; name and the rest are locked. Errors: `ACCOUNT_NAME_TAKEN` (field name: "Já
existe uma conta com esse nome aqui."), `PARENT_NOT_AVAILABLE`, `PARENT_OF_ANOTHER_CLASS` (field
parent), `ACCOUNT_CHANGE_REFUSED` (form: "Essa mudança não é permitida: uma categoria não pode
ficar dentro dela mesma, e contas do sistema não mudam de nome."), `ACCOUNT_DELETED`,
`ACCOUNT_INVALID`.
**RF-ACC-5** After creating a money account, a sheet "{nome} criada" / "Quanto tem nela hoje? Com o
saldo inicial, os saldos e a previsão batem com o banco." offers "Informar saldo inicial" (opens
`ENT-02` as an opening balance on it) or "Agora não"; the new account is in the list with R$ 0,00,
highlighted for a few seconds. Opened from `ENT-02`'s empty sheet ("Cadastrar conta"), it returns
there with the new account chosen and nothing typed lost.

## ACC-04 Accounts trash (MVP)
Route `/contas/lixeira`, from the trash icon of the area ("Contas e categorias › Lixeira" on the
desktop). Permission `accounts:delete`. "Lixeira de contas" / "Contas, cartões e categorias
excluídos. Restaurar traz de volta com o histórico." Each row: the drawing, name, kind ("Categoria
de despesa · dentro de Saúde"), "Excluída em {data} por {nome}", the reason when there is one, and
"Restaurar" (secondary, small).
"Restaurar" → toast "Conta restaurada." Errors: `ACCOUNT_NAME_TAKEN` ("Já existe outra conta com
esse nome. Renomeie a outra e tente de novo."); `ACCOUNT_CANNOT_BE_RESTORED`: an error toast that
names the parent from the row ("Saúde, a categoria mãe, está na lixeira."; "conta mãe" for
accounts) with "Restaurar as duas" (restores the parent, then the child). Restoring a parent
doesn't bring its children back: each returns by its own "Restaurar". Empty: "A lixeira está
vazia."

## CARD-01 Cards (MVP)
Route `/cartoes`, the "Cartões" tab. Permission `cards:view`.

**RF-CARD-1** One block per card (G41): the card drawing, name with the colour dot, "Fecha dia
{closingDay} · vence dia {dueDay} · {titular}", "⋯"; the "Fatura aberta" row (total, "vence
{dd/mm}", chevron) that opens `CARD-02`; the limit line ("Limite de R$ 6.000,00", "{n}% usado")
with its bar, when there is a limit; "Em aberto no cartão: R$ 2.890,00, com as parcelas futuras";
footer "Melhor dia de compra: dia {closingDay}" (a purchase on the closing day already goes to
the next invoice). Desktop: a grid, half the width each with one or two cards, three per row with
more (a list that grows down, not a carousel), equal heights with the footer at the bottom, and a
dashed "Novo cartão" tile in an incomplete last row; then "Próximas faturas" of all cards (soonest
first) as a full-width table with "Pagar" on those with something due.
Actions: "Novo cartão" (`cards:create`) → `CARD-04`; "⋯": "Ver faturas", "Editar ciclo"
(`cards:update`, `CARD-04` with the days only), "Renomear e cor", "Arquivar", "Excluir"
(`accounts:update` / `accounts:delete`, as in `ACC-01`; a member who can edit the cycle doesn't see
these). Empty: "Nenhum cartão cadastrado." "Cadastre o cartão com os dias de fechamento e
vencimento para o app saber em que fatura cada compra entra." + "Novo cartão". Viewer: no "Novo
cartão" and no "⋯".

## CARD-02 Invoices of a card (MVP)
Route `/cartoes/:cardId`. Permission `cards:view`. `GET /cards/:id/invoices`.

**RF-CARD-2** An invoice is named after the month it is **due** in ("Fatura de novembro" is due
04/11). A month strip on top, scrolling both ways from the 16 px margin: month and status per pill,
the open one selected (2 px ink outline); a small vertical year label between December and January;
last item "Todas", which opens the year sheet (the year with arrows, 12 months in 3 columns with
status and total, back to the month the card was created; footnote "Cada fatura leva o mês em que
vence."). The summary: title and status badge, "Fecha {dd/mm} · vence {dd/mm}", the big total,
"Pago" and "Falta pagar", the "Seu" / "De terceiros" bar with legend; the first lines and "Ver
todos ({n})" (`CARD-03`). A future invoice shows only its installments, with "Só parcelas até
agora. Ela abre em {dd/mm}…". A paid one: badge "Paga", "Falta pagar R$ 0,00", "Paga em {dd/mm}
com a {conta}", no button.
**RF-CARD-3** "Pagar fatura" on an invoice with something due (`entries:create`) opens `ENT-02` as
an invoice payment, prefilled with the card, invoice, due amount and the card's payment account;
secondary on a future invoice (paying early is allowed); hidden when nothing is due or the card is
archived (`../api-gaps.md`).
Desktop: `CARD-02` and `CARD-03` are one page: the strip, four KPIs of the chosen invoice (total,
falta pagar, seu, de terceiros), "Pagar fatura" top right, and the lines table with the filters in
its header.

## CARD-03 Invoice detail (MVP)
Route `/cartoes/:cardId/faturas/:invoiceId`. `GET …/invoices/:invoiceId/lines`.

**RF-CARD-4** Header in a grid: total, paid, due, own, fronted, status. Lines by date: date,
category drawing, description (+ "1/3"), amount; "R$ 160,00 de terceiros" under the description
when contacts owe part; payments negative in green with the `fatura-paga` drawing ("Pagamento",
the account used). Tap a line → `ENT-03`.
**RF-CARD-5** Filters (client side): "Todas", "Só minhas", "Com terceiros".
**RF-CARD-6** "Pagar fatura" as in `CARD-02`. Closed invoices show, with a lock: "Fatura fechada.
Lançamentos dela não podem ser excluídos nem editados."
Errors: `INVOICE_NOT_FOUND` ("Fatura não encontrada.") as the page state.

## CARD-04 New or edit card (MVP)
Full screen on the phone, a dialog with two columns on the desktop (fields side by side at the same
height; the cycle preview and the switch span both). Create `POST /cards` (`cards:create`); edit
cycle `PATCH /cards/:id` (`cards:update`); name and colour on edit go through `PATCH /accounts/:id`
(`accounts:update`), so a member edits only the days.

| Field | Label | Input | Required | Rules / help |
|---|---|---|---|---|
| name | "Nome do cartão" | text | yes | 1–80 |
| closingDay | "Dia do fechamento" | day field ("Escolha" / "Dia 25") opening the day sheet | yes | side by side with the due day, same height; help once under both: "Se o mês tiver menos dias, vale o último dia." |
| dueDay | "Dia do vencimento" | the same | yes | |
| purchaseOnClosingDayGoesNext | "Compras no dia do fechamento vão para a próxima fatura" | switch | — | default on |
| limitCents | "Limite" | money | no | > 0 |
| paymentAccountId | "Conta que paga a fatura" | money-account picker | no | active money account; detail "Usada no "Pagar fatura"" |
| holderUserId | "Titular" | member buttons that wrap | no | help "Quem tem o cartão no nome. Só informativo."; one holder per card |
| color | "Cor" | palette | no | as in `ACC-03` |

The day sheet: "Dia do fechamento" / "Dia do vencimento", days 1–31 as 44 px circles, 7 per row,
the chosen one with the ink outline and bold; 29, 30 and 31 carry a dot explained below ("nos
meses mais curtos, vale o último dia"); footer "Fecha todo dia {n}" / "Vence todo dia {n}";
tapping a day closes it.
**RF-CARD-7** With both days, a live preview (shared billing rules): "Compras até dia {fecha}
entram na fatura que vence dia {vence}. Uma compra hoje entra na fatura que vence em {dd/mm}."
**RF-CARD-8** Editing the days warns: "Faturas já criadas mantêm as datas atuais; a mudança vale
para as próximas."
Actions: "Criar cartão" / "Salvar" (when something changed). Errors: `CARD_INVALID`,
`PAYMENT_ACCOUNT_NOT_AVAILABLE` (field payment account: "Escolha uma conta ativa de dinheiro."),
`ACCOUNT_NAME_TAKEN` (field name), `CARD_NOT_FOUND` (page state). Opened from `ENT-02`'s empty
card sheet ("Cadastrar cartão"), it returns there with the new card chosen.
