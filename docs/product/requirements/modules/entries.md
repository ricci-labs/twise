---
summary: Functional requirements for entries — list with search, filters, period and summary, the new-entry form for every type (expense, card purchase, income, transfer, invoice payment, settlement, opening balance), detail, edit (details or replace), delete, restore and trash.
read_when: Designing or building ENT-01..05, or any shortcut that opens the new-entry form.
updated: 2026-10-16
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
Route `/lancamentos`, the "Lançamentos" tab. Permission `entries:view`. Designed in
`../../../design/entries-list/` (every state, mobile and desktop); where this section and the
design disagree, the design won (`../../../design/entries-list/decisions.md`). `GET /entries`
with the filters below (G45) and `GET /entries/summary` (G46).

**Layout.** Phone: the title with the trash icon (only with `entries:delete`); the Home's period
picker; a row with the search field and the "Filtros" button (the count of active filters on it,
ink outline when any is on); the active filters as chips with "×" and "Limpar"; the summary line;
one white card per day, rows split by dividers; "Mostrar mais" at the end; the floating "+".
Desktop: the page title with "Lixeira" on the right; one bar with the period, the search and one
button per filter (Tipo, Conta ou cartão, Categoria, Quem gastou), each opening a menu under itself
as wide as the button (288–480 px), an active one showing its value ("Tipo: Compra no cartão") with
the ink outline and "Limpar filtros" at the end of the bar; a full-width table (entry, category,
account or card, who spent, amount, "⋯") with the days as bands, the summary in its header and
"Mostrar mais" at its bottom. Home margins (`PageFrame`).

**RF-ENT-1** Newest first, grouped by day ("Hoje · ter, 20 out", "Ontem · seg, 19 out", "sáb, 17
out"). Row: the loose drawing (42 px) of the category, or the system drawing for a transfer,
settlement, invoice payment or opening balance; the description with its badges ("3×" for
installments, the contacts icon when shared, a clip when it has a receipt); a second line
"Categoria › Subcategoria · Conta ou cartão" and "· por {nome}" only when another member spent; it
wraps instead of being cut. Amounts: money out in ink with "−"; money in in `mint-ink` with "+";
transfers and invoice payments in `ink-muted` with no sign (they are not spending). Day totals stay
Later.
**RF-ENT-2** Filters, all answered by the API (G45), never applied to what is on screen: period
(default the current financial period), type (one or more of the seven), account or card, category
(a parent includes its subcategories: the chip reads "Mercado e subcategorias"), who spent (Todos
or a member) and "Só os divididos com contatos". Phone: one "Filtros" sheet with Tipo (multiple
chips), Conta ou cartão and Categoria (the app's pickers, most used first, with search), Quem
gastou and the switch; its footer "Limpar tudo" and "Ver resultados", which applies and closes.
Desktop: Tipo is a checkbox menu that applies at once, with "Limpar"; the others are the app's
pickers under their button. The filters live in the URL, so a link keeps them.
**RF-ENT-2b** Period. The Home's period picker; its sheet (a popover on the desktop) adds "Últimos 30
dias", "Este ano" and "Escolher datas", which opens the app's calendar picking a range: "De" and
"Até" on top (the one still to pick outlined), the first and last day with the selection outline,
the days between on `sunken`, today with its dot, weeks from Sunday; tapping a day before the first
starts again from it; the button says what happens ("Ver de 5 a 20 out"; "Escolha o último dia",
disabled, until both are picked). Desktop: the shortcuts on the left (Este período, Período
anterior, Últimos 30 dias, Este ano, Escolher datas), the month on the right and "Aplicar".
**RF-ENT-3** Paging: 50 per load and "Mostrar mais" (`nextCursor`), no page numbers and no endless
scroll; while it loads the button reads "Carregando…" with the spinner in the same place, and the
new days come in below without moving the scroll; a failure puts "Não foi possível carregar mais."
and "Tentar de novo" in its place. When nothing is left: "Isso é tudo de {out/26}." with "Ver
{set/26}" (the previous period); with filters, "Isso é tudo com esses filtros em {out/26}."
**RF-ENT-4** Search by description in the API (G45), from the 2nd letter, ignoring case and
accents, inside the chosen period and with the filters; the matching part of each description is
highlighted; "Buscar em todos os períodos" under the results widens it to every period, keeping
the text; "×" clears it.
**RF-ENT-4b** Summary: one muted line with bold numbers, from the API for the period, search and
filters (G46): "Saiu R$ 6.505,20 · Entrou R$ 9.120,00 · 11 lançamentos". "Saiu" adds expenses and
card purchases (the whole purchase, as the rows show it), "Entrou" incomes and settlements;
transfers, invoice payments and opening balances count in neither, but in the count.
**RF-ENT-4c** Opened from an account, card, category or subcategory (`ACC-01`, `ACC-02`, their
"Ver lançamentos"): the filter comes ready as a chip ("Mercado e subcategorias" for a parent, only
the subcategory for a child) and the back arrow returns there; removing the chip shows everything.

| Action | Permission | Rule |
|---|---|---|
| "Novo lançamento" (floating; sidebar on the desktop) | `entries:create` | opens `ENT-02` |
| Tap a row | `entries:view` | opens `ENT-03` (a panel on the desktop) |
| Row "⋯" (desktop only) | as each item | Editar (`entries:update`), Repetir (`entries:create`), Anexar comprovante (`attachments:create`), Excluir com motivo and Excluir (`entries:delete`); the closed-invoice rule of RF-ENT-10 applies |
| Trash icon (phone) / "Lixeira" (desktop) | `entries:delete` | opens the "Lixeira" page on its "Lançamentos" tab (`ENT-05`) |

States: skeleton rows grouped as days, the period, search and filters shown at once; empty period
"Nenhum lançamento neste período." + "Novo lançamento", the period arrows still there; empty with
filters or search, the loose drawing, "Nada encontrado com esses filtros." + "Limpar filtros", the
chips still visible; error "Não foi possível carregar os lançamentos.", the code and "Tentar de
novo", the top still working; viewer: the read-only band, no "+", no trash, no "⋯", a row opens the
detail to read; `ENTRY_QUERY_INVALID` (an old link with a filter that no longer exists) resets the
filters and the toast says "Os filtros eram inválidos e foram limpos."; after a delete in the
detail, back on the list without the row and the toast "Lançamento movido para a lixeira." with
"Desfazer" for 8 s (the floating "+" moves up while it shows).

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
"Mais" pill shows its name. The selected pill has the 2 px `ink` outline and a bold label, like
every selection (`../ui-standards.md`; it was `mint` until the entries list design). The fields below
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
the current item gets the 2 px `ink` outline and a bold label (no mint fill, no check mark).
Categories open as a grid of tiles (three columns, the parents, most used first — counted over the
workspace's 50 latest entries, a child counting for its parent — search on top); the selected tile
keeps its paper colour and gets a 2 px `ink` outline and a bold label, with no check mark.
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
The invoices show as a radio list: "Vence {dd/mm}" ("{dd/mm/aa}" when due in another year than the payment date), "Falta pagar R$ X" and a status badge.
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
cache when there is one, completed when the API answers). Phone: a full page with back, the pencil
("Editar") and "⋯". Desktop: a 480 px panel on the right over the list, which stays visible behind;
the route changes, so the link works alone; its header "Lançamento", the "Editar" button, "⋯" and
close; Esc closes. A deleted or replaced entry answers `404 ENTRY_NOT_FOUND`: the loose drawing, its
message and "Voltar para Lançamentos".

**RF-ENT-9** Header: the drawing (52 px) and the name on one line, the type in small muted text
above the name (no badge: it would read as a status), the amount (32 px display, cents raised) on
the full width, income in `mint-ink` with "+", then "3× de R$ 333,34 · ter, 20 out 2026". Then
sections, each a white card with a title and label/value rows split by dividers, by kind:
- **Detalhes:** account or card, category (with the income nature badge), payment method, who
  spent, the invoice it fell on (a link), who recorded and from where ("pela web", "pelo
  WhatsApp").
- **Dividido com contatos** (right after the header when shared): each contact with the dotted
  leader to their amount, a **solid** line, "Sua parte" with its leader and amount; "Ver cobranças"
  in the header.
- **Parcelas:** one row per installment ("1/3", the month and "vence 04/11", the invoice's status
  badge, the amount, a chevron to that invoice, `CARD-03`); more than 3 show the closed one, the
  open one and the next, then "Mostrar mais {n} parcelas".
- **De onde para onde** (transfer): "Saiu de Conta X" → "Entrou em Conta Y" with their drawings and
  the arrow, and the sentence that a transfer is neither spending nor income; no category, no "Quem
  gastou".
- **What it belongs to:** the planned bill it paid ("Pagou a conta prevista Aluguel de outubro"),
  the commission split step it was (a link to `HOME-03`), the invoice it paid (invoice payment,
  with the sentence that it is not new spending); a variable income shows the mint card of its
  split ("Divisão sugerida feita · 4 de 4 partes").
- **Observações**, **Comprovantes** (the files with their "⋯": Abrir, Baixar, Excluir, from the
  attachments round; "Anexar comprovante · Foto ou PDF" as a dashed area, `ATT-01`; "Nenhum
  comprovante." for who can't attach) and **Histórico** (`AUD-01` filtered by this entry, only with
  `audit:view`; G11).
**RF-ENT-10** When the entry has a line on a closed invoice: a note with the lock on top, "Parte
deste lançamento está em uma fatura fechada, então ele não pode ser excluído nem ter valores
alterados."; the pencil stays (only description and notes change, `ENT-04`) and "⋯" keeps only
Repetir and Anexar comprovante.

| Action | Permission | Rule |
|---|---|---|
| Pencil "Editar" (desktop: button) | `entries:update` | opens `ENT-04`; one action per destination, so "Editar" is never in "⋯" here |
| "⋯" › "Repetir" | `entries:create` | opens `ENT-02` with the same type, amount, description, accounts, category, payment method and shares, today's date, the amount selected to change (web only) |
| "⋯" › "Anexar comprovante" | `attachments:create` | `ATT-01` |
| "⋯" › "Excluir com motivo" | `entries:delete` | a sheet (dialog on the desktop) "Excluir {nome}": the text, "Motivo" (optional, up to 200, shown in the trash), "Cancelar" and the danger "Excluir lançamento"; then as "Excluir" |
| "⋯" › "Excluir" | `entries:delete` | no dialog; back to the list without the row and the toast "Lançamento movido para a lixeira." with "Desfazer" for 8 s (calls restore) |

Viewer: no pencil, no "⋯", no "Anexar comprovante", no "Histórico"; "Comprovantes" shows the files
or "Nenhum comprovante."

## ENT-04 Edit entry (MVP)
The `ENT-02` form prefilled, titled "Editar lançamento": a full screen on the phone, the 880 px
dialog on the desktop. One button, "Salvar alterações" (desktop: "Cancelar" on the left), enabled
once something changed; no "Salvar e registrar outro" and no "Repetir um recente".

**RF-ENT-11** Two modes, chosen by what changes:
- only description or notes → `PATCH /entries/:id` in place, with no note; back to the detail with
  the toast "Lançamento atualizado.";
- anything else (amount, date, accounts, category, installments, shares, type) → `PUT
  /entries/:id`. Only then a blue note appears on top, naming what changed: "Mudou o valor, então
  ao salvar criamos uma nova versão do lançamento. A anterior fica no histórico." The installments
  preview is redone. After saving, the web goes to the new id's detail with "Lançamento
  atualizado."; attachments and a matched planned bill follow it automatically.
The toast has no "Desfazer": the old version is in the history.
**RF-ENT-11b** Closed invoice (RF-ENT-10): the form shows only "Descrição" and "Observações", no
type pills, and the rest in a locked block "O que não muda" with the lock and the reason.
**RF-ENT-11c** Closing with changes asks "Descartar as alterações?" as `ENT-02`, with the edit text.

Errors: `ENTRY_ALREADY_DELETED` (someone deleted or edited it first): a danger alert on top, "Este
lançamento foi excluído ou já foi editado por outra pessoa.", with "Ver a versão atual"; what was
typed stays on screen to copy. `ENTRY_NOT_FOUND` as `ENT-03`, plus all of `ENT-02`.

## ENT-05 Entries trash (MVP)
The "Lançamentos" tab of the shared "Lixeira" page (route `/lixeira`, decided by the product owner
on 2026-10-15; the other tab, "Contas e categorias", is `ACC-04`). The "Lixeira" item of the menu
("Mais" on the phone, the sidebar on the desktop) opens the page; the trash icon of each screen
opens its own tab. Permission `entries:delete` (a tab the person can't open is not shown).
`GET /entries/trash`, 50 per load with "Mostrar mais". Old versions of edited entries don't appear
(they are history).

**RF-ENT-12** Rows as in the list, plus "Excluído em {data} por {nome}" and the reason, and the
small secondary "Restaurar" (named "Restaurar {descrição}"). Desktop: a table with entry, when and
who, reason, amount and "Restaurar".
"Restaurar" asks nothing: the row leaves and the toast "Lançamento restaurado." offers "Ver" (opens
`ENT-03`) for 8 s. `ENTRY_CANNOT_BE_RESTORED`: an error toast with the reason the API gives (G47):
"Não dá para restaurar: ele usa a Conta Y, que está na lixeira." with "Restaurar Conta Y" (restores
the account, then the entry), "Não dá para restaurar: parte dele está numa fatura fechada." or "Não
dá para restaurar: ele já tem outra versão." Empty: the loose drawing, "A lixeira está vazia." and
what happens to deleted entries.
