---
summary: Functional requirements for entries — list and filters, the new-entry form for every type (expense, card purchase, income, transfer, invoice payment, settlement, opening balance), detail, edit (details or replace), delete, restore and trash.
read_when: Designing or building ENT-01..05, or any shortcut that opens the new-entry form.
updated: 2026-10-14
---

# Entries

Standards: `../ui-standards.md`. Messages per code: `../error-messages.md`. Domain:
`../../../domain/model/ledger.md`, `../../../domain/billing-and-installments.md`. API:
`/api/workspaces/:id/entries`.

## Rules that shape these screens
- **Types the API accepts:**
  | Type | Label | Means |
  |---|---|---|
  | `expense` | "Despesa" | Paid now from a money account (Pix, débito, dinheiro, boleto) |
  | `card_purchase` | "Compra no cartão" | On a credit card, à vista or in installments |
  | `income` | "Receita" | Money in (salário, comissão) |
  | `transfer` | "Transferência" | Between the household's own accounts; never spending |
  | `invoice_payment` | "Pagamento de fatura" | Pays a card invoice; a transfer, never spending |
  | `settlement` | "Recebimento de contato" | A contact paying back what they owe |
  | `opening_balance` | "Saldo inicial" | The starting balance of a money account |
  Refunds ("estorno") and adjustments are not accepted yet (`../api-gaps.md`).
- **Money** is typed in reais and sent as integer cents, always positive (the opening balance may be
  negative: "saldo devedor").
- **Description** 1–200 characters; **notes** up to 2000; **dates** are real calendar days, past or
  future allowed.
- **Payment method** ("Forma de pagamento"): "Pix", "Débito", "Crédito", "Dinheiro", "Boleto",
  "Transferência bancária", "Débito automático", "Outro". A card purchase defaults to "Crédito".
- **"Quem gastou"** must be an active member.
- **Pickers** show only active (not archived) accounts of the right kind.
- **Installments:** 1 to 48, and never more than the amount in cents. The first installment takes
  the rounding cents (R$ 1.000,00 in 3× = 333,34 + 333,33 + 333,33). Installment k goes k−1 invoices
  after the first. A purchase already in progress is recorded "a partir da parcela N": the amount
  is still the full purchase total.
- **Shares** ("Dividir com contatos"): up to 10 contacts, each at most once, amounts > 0, summing to
  at most the total; the rest is "Sua parte". On a card purchase the shares are spread across the
  installments.
- **Closed invoices:** a card purchase can't place an installment on a closed invoice (the API says
  from which installment it could start). An entry with any line on a closed invoice can't be
  deleted, edited (replaced) or restored; only its description and notes change.
- **Editing:** description and notes change in place. Anything else (amount, date, accounts, type,
  installments, shares) creates a new version that replaces the old one, which leaves the active
  list; the new entry has a new id.
- **Delete** sends to the trash; restore brings it back, unless it uses a deleted account or touches
  a closed invoice.

## ENT-01 Entries list (MVP)
Route `/lancamentos`. Permission `entries:view`. `GET /entries` (`from`, `to`, `accountId`,
`limit`, `cursor`).

**RF-ENT-1** Newest first, grouped by day ("Hoje", "Ontem", "sex, 25 set"). Row: description,
category (or "Transferência", "Pagamento de fatura"), account or card, installments "10×" and
contact-share icon when present, attachment icon, amount with sign. Day groups show the day's net
(Later).
**RF-ENT-2** Filters: period (default the current financial period; custom range), account or card
(`accountId`), and type (client side). Active filters show as chips with "Limpar".
**RF-ENT-3** Paging: "Carregar mais" or infinite scroll with `nextCursor`, 100 per page.
**RF-ENT-4** Search by description (client side over loaded pages; server search Later).

| Action | Permission | Rule |
|---|---|---|
| "Novo lançamento" (floating) | `entries:create` | opens `ENT-02` |
| Tap a row | `entries:view` | opens `ENT-03` |
| "Lixeira" (menu) | `entries:delete` | opens `ENT-05` |

States: skeleton rows; empty for the period "Nenhum lançamento neste período." + "Novo lançamento";
empty with filters "Nada encontrado com esses filtros." + "Limpar filtros"; error with retry;
`ENTRY_QUERY_INVALID` resets the filters and says "Os filtros eram inválidos e foram limpos."

## ENT-02 New entry (MVP)
`POST /entries`, permission `entries:create`. Designed in `../../../design/entries/` (every type and
state, mobile and desktop); where this section and the design disagree, the design won and this
section follows it (`../../../design/entries/decisions.md`).
Opened from the floating button, from `CARD-02/03` (invoice payment), `CON-02` (settlement),
`ACC-01/03` (opening balance), `PLAN-03` (pay a planned bill) and `HOME-03` (moving commission),
prefilled accordingly.

**Layout.** Mobile: a full screen over the app (no tab bar) with "X" (Cancelar) and the title
"Novo lançamento" on top, the fields in one column (16 px margins), and a fixed footer with
"Salvar lançamento" (primary, full width) and "Salvar e registrar outro" (text button). Desktop: a
dialog 880 px wide, 40 px from the top, over the screen the person was on (dimmed); fixed header
and footer ("Cancelar" on the left, "Salvar e registrar outro" secondary and "Salvar lançamento"
primary on the right), the body scrolls; fields in two columns in the mobile order, side-by-side
fields share one height (48 px) and only the money field is taller; the invoice preview, the
shares and the notes span both columns. It opens on "Despesa" with the focus on "Valor". The form
mixes required and optional fields, so it starts with "* obrigatório".

**RF-ENT-5** First choose the type: pill buttons that wrap onto a second line, all visible (no
sideways scroll), the most used first: "Despesa", "Compra no cartão", "Receita", "Transferência",
then "Mais ▾", which opens a sheet with the other three (invoice payment, settlement, opening
balance), each with a loose illustration and a one-line description; once one is chosen, the
"Mais" pill shows its name. The selected pill is `mint` with `on-mint` text. The fields below
change with the type; values common to all types are kept when switching.

### Fields common to every type
| Field | Label | Input | Required | Rules |
|---|---|---|---|---|
| amountCents | "Valor" | money, large, first focus | yes | > 0 ("Informe um valor maior que zero, como 25,90.") |
| description | "Descrição" | text, suggestions from recent descriptions | yes | trimmed, 1–200 |
| occurredOn | "Data" | shortcuts "Hoje, {dd mmm}" · "Ontem" · "Outra data" (calendar; then shows the picked date, e.g. "20 set"), default "Hoje" | yes | valid date |
| paymentMethod | "Forma de pagamento" | select | no | enum above; hidden for transfer, invoice payment, opening balance |
| spentByUserId | "Quem gastou" | the members as two side-by-side cards (avatar + name), default the current user | no | active member; **only on expense and card purchase** |
| notes | "Observações" | textarea with counter | no | up to 2000 |

The account, card, category and contact fields are **pickers**: 56 px on mobile, 48 px on desktop,
showing the loose illustration, the name and a grey second line ("Saldo de hoje: R$ 4.200,00",
"Fecha 25/10 · vence 04/11", "Renda variável"); empty, a dashed "+" square with a grey placeholder
("Escolha uma categoria"). They open a bottom sheet on mobile and a popover with search on desktop;
the current item is on `mint-soft` with a check. Categories open as a grid of tiles (three columns,
the parents, most used first — counted over the workspace's 50 latest entries, a child counting for
its parent — search on top); the selected tile keeps its paper colour and gets a
2 px `ink` outline and a bold label, with no check mark.
**Subcategories:** a category with children shows "{N} sub" under its name. Tapping it marks the
tile and opens, right below the grid, the row "Em {mãe}" with "Só {mãe}" and its children as
chips; choosing one closes the sheet. A category without children closes the sheet at once.
Posting to the parent is allowed (the API accepts any active category; the parent's budget covers
its children). The search also finds subcategories, shown with their parent ("Feira · em
Mercado"). The field then reads "Mercado › Feira", with the parent's drawing (subcategories have
no drawing of their own unless one was chosen).
**No account or card yet:** the sheet says so ("Vocês ainda não têm um cartão.") and offers
"Cadastrar conta" / "Cadastrar cartão" (`ACC-03` / `CARD-04`), which comes back with the new one
selected and nothing typed lost. The same holds for categories.

**Defaults.** "Pago com" starts on the money account the latest expense left from (among the 50
latest entries), or on the only active money account; with neither, it starts empty.

### Despesa (`expense`)
| Field | Label | Required | Rules |
|---|---|---|---|
| paidFromAccountId | "Pago com" | yes | active money account |
| categoryId | "Categoria" | yes | active expense category |
| shares | "Dividir com contatos" | no | see Shares |

### Compra no cartão (`card_purchase`)
| Field | Label | Required | Rules |
|---|---|---|---|
| cardAccountId | "Cartão" | yes | active card with cycle set up |
| categoryId | "Categoria" | yes | active expense category |
| installmentCount | "Parcelas" | yes, default 1 ("À vista") | 1–48 and ≤ amount in cents; shows "3× de R$ 333,34" |
| firstInstallment | "Começar da parcela" (under "Compra já em andamento") | no, default 1 | 1–installments; help "Para registrar uma compra antiga só a partir das parcelas que faltam. O valor continua sendo o total da compra." |
| shares | "Dividir com contatos" | no | see Shares |

"Parcelas" is a stepper "−  3×  +" (1 shows "À vista") with "3× de R$ 333,34" beside it. "Compra
já em andamento" is a switch beside its label; on, it shows "Começar da parcela" in a bordered box
with the help text above a stepper and "de {N}".

**RF-ENT-6** Live preview under the card, in a sunken box with the loose calendar: "Entra na fatura
que vence em {dd/mm}" (à vista) or "A 1ª parcela entra na fatura que vence em {dd/mm}." and one row
per installment, "1/3 · vence 04/11 · R$ 333,34", the amount right-aligned and rows split by
dividers (no dotted leader). Long lists show three rows and "+ {N} parcelas, até a fatura que vence
em {dd/mm/aa}". A purchase in progress lists only the installments still to come. Computed on the
device with the shared billing rules (`ledger/cards/billing-cycle`, `ledger/installments`); the
screen never makes up dates or cents and doesn't call the API for it. The card's payment method
starts as "Crédito".
**RF-ENT-7** When the first installment would fall on a closed invoice, say it before submitting:
the preview row of that invoice is struck through with the badge "Fechada", and a warning Alert
says "A fatura de {mês} já fechou. Registre a partir da parcela {N}." with the action "Começar da
parcela {N}", which turns on "Compra já em andamento" and sets it. The same comes back from the
API as `INVOICE_CLOSED`.

### Receita (`income`)
| Field | Label | Required | Rules |
|---|---|---|---|
| receivedInAccountId | "Recebido em" | yes | active money account |
| categoryId | "Categoria" | yes | active income category (badge "Fixa" / "Variável") |
The category picker shows the badge "Fixa" or "Variável" (variable income is a commission). No
"Quem gastou" and no shares. When the category is variable income, the success toast's action is
"Ver sugestão de divisão" (instead of "Ver"), opening `HOME-03` with that amount.

### Transferência (`transfer`)
| Field | Label | Required | Rules |
|---|---|---|---|
| fromAccountId | "De" | yes | active money account |
| toAccountId | "Para" | yes | active money account, different from "De" ("Escolha uma conta diferente da de origem.") |
Only "De", "Para", date and notes besides the amount and description: no payment method, category
or "Quem gastou". **From `HOME-03`** ("Transferir" on a step of the commission split) it opens
prefilled (amount, "De" where the commission landed, "Para" the step's account) under a mint band
"Parte {n} da divisão da comissão · {step} · R$ {valor}"; after saving it goes back to the split
with that part "Feito".

### Pagamento de fatura (`invoice_payment`)
| Field | Label | Required | Rules |
|---|---|---|---|
| cardAccountId | "Cartão" | yes | active card |
| invoiceId | "Fatura" | yes | an invoice of that card (list with status and "falta pagar"); default the oldest with something due |
| paidFromAccountId | "Pago com" | yes when the card has no default payment account | active money account; default the card's |
The invoices show as a radio list: "Vence {dd/mm}", "Falta pagar R$ X" and a status badge.
Amount defaults to the invoice's "falta pagar"; partial payment allowed; paying more than due warns
in amber under the amount "O valor é maior que o saldo da fatura." (not blocked).

### Recebimento de contato (`settlement`)
| Field | Label | Required | Rules |
|---|---|---|---|
| contactId | "Contato" | yes, first field | contact picker showing what each owes and, when overdue, a red badge with text; "Novo contato" at the end |
| receivedInAccountId | "Recebido em" | yes | active money account |
The amount defaults to what the contact owes and the description to "{nome} pagou"; receiving
part is allowed, more warns in amber under the amount ("O valor é maior do que {nome} deve.", not
blocked). The chosen contact reads "deve R$ 120,00 · vence 25/10"; in the picker the due date or
the overdue badge sits at the end of the row. Charges record payments through `CON-04`, which uses this type.

### Saldo inicial (`opening_balance`)
| Field | Label | Required | Rules |
|---|---|---|---|
| accountId | "Conta" | yes | active money account |
| balanceCents | "Saldo" | yes | ≠ 0; a "Negativo (cheque especial)" switch makes it negative (shown with "−" in the danger colour) |
Replaces "Valor"; description defaults to "Saldo inicial".

### Shares (`shares`, expense and card purchase)
**RF-ENT-8** Collapsed, a dashed pill "+ Dividir com contatos". Open, a header "Dividir com
contatos" with the quick fills "Metade" (the contacts together take half, split evenly between
them) and "Dividir igualmente" (between you and the contacts); the rounding cents stay in "Sua
parte". The contact picker lists the active contacts not yet in the split, with a search,
then one row per contact: avatar, name, a **dotted leader**, the amount input (132 px) and "×" to
remove; "+ Adicionar contato" below. After a dashed divider, the last row "Sua parte" with its
value, bold, in the same column as the inputs; it updates live and shows "—" while the sum passes
the total. Errors under the rows: a contact twice ("Esse contato já está na divisão."), the sum
above the total ("A soma das partes passa do valor total."), 11th contact blocked with "Até 10
contatos por lançamento." "Novo contato" inside the picker opens `CON-05` in a dialog. On a card
purchase the shares are spread across the installments.

**RF-ENT-13** "Repetir um recente" (new form only, not when it opens prefilled from another
screen): under the types, a row of cards that scrolls sideways from the 16 px margin, the last one
peeking: loose illustration, description and last amount. They are the entries **the current
person** repeats most of the chosen type (`GET /entries/frequent`, G39); the row disappears when the
type has none. One tap fills everything as last time (description, account or card, category,
payment method and the amount, selected so typing replaces it), outlines the card in ink, and shows
the auto-fill line with "Desfazer". Two taps save it.
**RF-ENT-14** Description suggestions: while typing, up to 3 recent descriptions of the workspace
for the chosen type (`GET /entries/suggestions`, G38). Choosing one fills the description **and**
the category, account or card and payment method used last time, and moves the focus back to
"Valor". A discreet line under the description (green check, what was filled, "Desfazer" on the
right) says so; "Desfazer" clears what was filled. An account or category that is no longer active
is not filled.

### Actions and outcome
| Action | Enabled when | Success | Errors |
|---|---|---|---|
| "Salvar lançamento" (primary) | the form is valid for the chosen type (button contract) and online | toast "Lançamento registrado." with "Ver" (opens `ENT-03`); closes and goes back where it was, whose numbers refresh | field-mapped codes below; others as a danger Alert just above the buttons: "Não foi possível registrar o lançamento. Código: {ref}." |
| "Salvar e registrar outro" (secondary) | the form is valid and online | the same toast, shown just above the buttons; the form stays, cleared except type, date and accounts, focus back on "Valor" | same |
| "Cancelar" ("X", Esc, a click outside the dialog) | always | closes at once when nothing changed; otherwise "Descartar as alterações?" with "Continuar editando" (secondary) and "Descartar" (danger) | — |

While saving: spinner and "Salvando…" in the button, both buttons locked, the form stays open
until the answer. Nothing typed is lost on an error.

**Offline.** With no connection, "Novo lançamento" doesn't open (the Home rule: "Sem conexão. Dá
para salvar quando a internet voltar."). If the connection drops while the form is open, a dark
band on top says "Sem conexão. O que você digitou fica aqui; salve quando a conexão voltar.", the
save buttons are disabled and the form stays editable; nothing is queued to send later. When the
connection is back the band goes and the buttons release.

Field-mapped codes: `NOT_A_MONEY_ACCOUNT` and `ACCOUNT_NOT_AVAILABLE` → the account field involved;
`NOT_AN_EXPENSE_CATEGORY`, `NOT_AN_INCOME_CATEGORY` → category; `SAME_ACCOUNT` → "Para";
`NOT_A_CARD`, `CARD_NOT_SET_UP` → card; `TOO_MANY_INSTALLMENTS` → installments;
`FIRST_INSTALLMENT_OUT_OF_RANGE` → first installment; `INVOICE_CLOSED` → the RF-ENT-7 message;
`INVOICE_NOT_FOUND` → invoice; `PAYMENT_ACCOUNT_REQUIRED` → "Pago com"; `CONTACT_TWICE`,
`SHARES_EXCEED_AMOUNT`, `CONTACT_NOT_AVAILABLE` → shares; `SPENT_BY_NOT_A_MEMBER` → "Quem gastou".

## ENT-03 Entry detail (MVP)
Route `/lancamentos/:entryId`, loaded with `GET /entries/:entryId` (shown at once from the list
cache when there is one). A deleted or replaced entry answers `404 ENTRY_NOT_FOUND`: the page shows
its message and a link back to the list.

**RF-ENT-9** Shows type, amount, date, description, notes, payment method, who spent, who recorded
and from where ("pelo WhatsApp", "pela web"), and a readable breakdown of the lines ("Saiu de Conta
X", "Categoria Mercado", "Parcela 2/3 na fatura de novembro", "Contact J deve R$ 20,00").
Attachments section (`ATT-01`). "Histórico" link (`AUD-01` filtered by this entry; `audit:view`).
**RF-ENT-10** When the entry has a line on a closed invoice: a note "Parte deste lançamento está em
uma fatura fechada, então ele não pode ser excluído nem ter valores alterados." and the edit and
delete actions are hidden (description and notes stay editable).

| Action | Permission | Rule |
|---|---|---|
| "Editar" | `entries:update` | opens `ENT-04` |
| "Excluir" | `entries:delete` | no dialog; toast "Lançamento movido para a lixeira." with "Desfazer" (calls restore); optional reason in "Excluir com motivo" |
| "Anexar comprovante" | `attachments:create` | see `ATT-01` |

## ENT-04 Edit entry (MVP)
**RF-ENT-11** Two modes, chosen by what changes:
- only description or notes → `PATCH /entries/:id` in place; toast "Lançamento atualizado.";
- anything else → the `ENT-02` form prefilled, submitted with `PUT /entries/:id`; a note on top: "Ao
  salvar, criamos uma nova versão do lançamento e a anterior fica no histórico." The web switches
  to the new id; attachments and a matched planned bill follow it automatically.
Errors: `ENTRY_ALREADY_DELETED` ("Este lançamento foi excluído ou já foi editado por outra
pessoa. Atualize a lista."), `ENTRY_NOT_FOUND`, plus all of `ENT-02`.

## ENT-05 Entries trash (MVP)
Route `/lancamentos/lixeira`. Permission `entries:delete`. `GET /entries/trash`, paged. Old
versions of edited entries don't appear (they are history).

**RF-ENT-12** Rows as in the list, plus "Excluído em {data} por {nome}" and the reason.
Action "Restaurar" → toast "Lançamento restaurado."; `ENTRY_CANNOT_BE_RESTORED` shows "Não dá para
restaurar: ele usa uma conta excluída, está numa fatura fechada, ou já foi substituído por outra
versão." Empty: "A lixeira está vazia."
