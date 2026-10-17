---
summary: Functional requirements for contacts, what each owes (shares and balances), charges with the pt-BR message and Pix copia e cola, sending them (WhatsApp, e-mail or copy), recording payments and cancelling — screens CON-01..05.
read_when: Designing or building contacts, charges or anything showing what third parties owe.
updated: 2026-10-16
---

# Contacts and charges

Standards: `../ui-standards.md`. Messages per code: `../error-messages.md`. Domain:
`../../../domain/model/third-parties.md`. API: `/api/workspaces/:id/contacts`, `/charges`.
Design: `../../../design/contacts/` (decisions approved by the product owner on 2026-10-16; where
it and this file disagreed, the design won and this file follows it). The charge e-mail:
`../../../design/contacts/emails.md`.

## Rules that shape these screens
- **A contact** is someone outside the workspace (friend, relative) who shares purchases. Only the
  name is required: 1–80 characters. Phone in international format (`+5511999990000`, 8–15 digits
  after the "+"), unique among active contacts. E-mail (G61) valid and unique among active
  contacts. Pix key 1–77. Notes up to 500.
- **What a contact owes** comes from shares on expenses and card purchases (`entries.md` →
  Shares). On installment purchases each installment is owed on that invoice's due date, so a
  contact can have amounts overdue and amounts still to come.
- **Balance fields:**
  - "Deve" (`owedCents`): everything still owed, future installments included; negative means the
    contact has credit ("tem crédito");
  - "Em atraso" (`overdueCents`): what was due up to today and is still unpaid; payments count
    against what is due first;
  - "Próximo vencimento" (`nextDueOn`, `nextDueCents`): the next date with something due.
  - "Já cobrado" (G63): `dueNotChargedCents` is what is due up to today and not in an open charge;
    `lastCharge` is the newest open charge. "Cobrar" shows only when `dueNotChargedCents > 0`;
    after charging the row's badge reads "Cobrado em dd/mm".
- **Archive** only when the balance is exactly zero (credit included); with a balance, a dialog
  names the contact and the amount and offers "Nova cobrança". **Delete** has no balance check and
  no restore: the UI warns when the contact still owes.
- **Opting out** ("Não quer receber mensagens") is set by a member (switch) or by the contact
  through the link in a charge e-mail (`optedOutVia`: `member` | `email_link`). It is shown on the
  contact; WhatsApp asks first ("Este contato pediu para não receber mensagens. Enviar mesmo
  assim?"); e-mails are never sent while it is set (`CONTACT_OPTED_OUT`); copying the message never
  asks. A member can turn the switch off only for an opt-out a member set.
- **A charge** gathers the contact's open items up to a date (default today; a later date includes
  upcoming installments; when nothing is due yet, the default is the next due date) into a pt-BR
  message, plus a Pix copia e cola when the workspace has Pix receiving set up (`SET-02`). The
  message uses the workspace's charge text (`SET-03`: opening and closing; G64) and is written when
  the charge is created: later edits of the text never change charges already created.
- **Charge status** ("Rascunho", "Enviada", "Paga em parte", "Paga", "Cancelada"): paid and
  partially paid come from payments recorded against it. Allowed:
  | Action | Allowed when |
  |---|---|
  | Mark as sent | draft, with no payment yet |
  | Cancel | draft or sent, with no payment yet; its items can be charged again |
  | Record payment | any status except cancelled; partial and over-payment allowed |
- **Sending** has three channels, each offered only when possible: WhatsApp (opens
  `https://wa.me/<phone>?text=<message>`, then asks "Você enviou a mensagem?" and marks it sent
  with `via: 'whatsapp'`), **E-mail** (the app sends it, G62) and "Copiar mensagem" (marks it sent
  with `via: 'manual'` when the member says so). Automatic WhatsApp sending comes with the WhatsApp
  channel.
- **Sending by e-mail** (G62): a confirmation (to, subject, "Respostas vão para" the e-mail of the
  member who created the charge, "Ver o e-mail como ele chega"), then the app queues the e-mail
  (outbox, SMTP), marks the charge sent with channel, time and address, and shows a toast. When the
  mail server refuses the address the charge goes back to draft, its history says why, and its
  actions become "Tentar o e-mail de novo", "Pelo WhatsApp" and "Corrigir e-mail". The e-mail
  itself is designed in `../../../design/contacts/emails.md`.
- **A payment** is a "Recebimento de contato" entry named "Pagamento de cobrança". Deleting that
  entry undoes the payment.

## CON-01 Contacts (MVP)
Route `/w/:id/contacts` (`?sort=name`). Permission `contacts:view`. `GET /contacts` + `GET /contacts/balances`.

Reached from Mais › Contatos e cobranças and from the Home's "A receber" card ("Ver contatos").

**RF-CON-1** One row per contact: the initial in a paper circle, the name (2 lines); a second line
with the badge first ("Em atraso", "Cobrado em 20/10", "Não quer mensagens") then the state ("R$
200,00 vencido desde 10/10", "Próximo: R$ 120,00 em 25/10", "Tem crédito de R$ 30,00"); a small
line with the channels (WhatsApp, E-mail). On the right the amount (danger when overdue, mint for
credit) with "deve" / "crédito" / "em dia" under it and, when something due is not in an open
charge (`dueNotChargedCents > 0`, G63), a compact "Cobrar" pill. Archived contacts are in a
collapsed "Arquivados (n)" group at the end; an open archived contact has "Desarquivar" in its "⋯".
After a charge is sent, the toast offers "Ver" (opens the charge).
**RF-CON-2** Sort as pills: "Mais atrasados primeiro" (default), "Nome". Two summary tiles on top:
"Total a receber" and "Em atraso" (they wrap instead of breaking the amount).
**Desktop:** three KPIs ("A receber", "Em atraso", "Próximo"), the table across the width (contact,
channels, state with the badge first, amount, "Cobrar" and "⋯"), the sort in the table header,
archived at the end; below, "Próximos vencimentos" of every contact (`GET /contacts/upcoming`, G63)
and "Como as cobranças saem" (the workspace Pix and the channels).

| Action | Permission | Rule |
|---|---|---|
| "Novo contato" | `contacts:create` | opens `CON-05` |
| Tap a row | `contacts:view` | opens `CON-02` |
| "Cobrar" (row action) | `contacts:create` | shown when something due is not in an open charge (G63); opens `CON-03` |

Empty: what a contact is, with examples, and "Novo contato" (copy in the design, `Contatos-vazio`).
Loading: skeleton of the tiles and rows. Error: message, code and "Tentar de novo". Viewer: no
"Novo contato" and no "Cobrar".

## CON-02 Contact detail (MVP)
Route `/contatos/:contactId`, loaded with `GET /contacts/:contactId`; its charges come from
`GET /charges?contactId=`, and one charge from `GET /charges/:chargeId`.

**RF-CON-3** Header (the detail header, option B): the initial and the name, "Deve" (or "Crédito
de", in mint) and the amount across the width, one sentence of what it includes; the opt-out pill
"Pediu para não receber mensagens" when set. Two tiles: "Em atraso" and "Próximo vencimento".
"Nova cobrança" (primary, full width) and the link "Recebeu sem cobrança? Registrar recebimento"
(`ENT-02` as "Recebimento de contato", RF-CON-8). "Falar com {nome}" at the end: WhatsApp with
"Abrir" (or "Sem número" + "Adicionar"), the e-mail, "Chave Pix de {nome}" with copy (for the
household to pay them), the notes. A contact with credit has no "Nova cobrança": the credit pays
the next debt by itself.
**RF-CON-4** "Em aberto": the contact's open items in two groups, "Vencidos" and "A vencer"
(future installments too: `GET /contacts/:contactId/open-items?until=&includeCharged=true`, G63):
date block, description (2 lines), the second line with the badge first ("Atrasado", "Na cobrança
de 20/10" when `inChargeId` is set), card and share detail, what is still owed
(`remainingCents`).
**RF-CON-5** "Cobranças": the contact's charges (`GET /charges?contactId=`), newest first, with no
drawing. Line 1 "Cobrança de dd/mm", amount, chevron; line 2 the status badge and "n itens · canal".
Tap expands in place: the send history (channel, time, address; danger tint when the e-mail
failed), the items with dotted leaders and a solid line before the total, the message (collapsible),
and the actions in a grid (the primary full width, the two others side by side, same size):
"Registrar pagamento" · "Enviar de novo" · "Copiar Pix"; when the e-mail failed "Tentar o e-mail
de novo" · "Pelo WhatsApp" · "Corrigir e-mail"; viewers "Copiar mensagem" · "Copiar Pix". The open
charge's header carries the "⋯" (Copiar mensagem, Anexar comprovante, Cancelar cobrança).
**Desktop:** two columns: left the amount, "Em aberto" and the charges; right "Falar com", the
receipt-without-charge shortcut and "Pagamentos recebidos" (the contact's settlement entries).
"Nova cobrança" in the page header.

| Action | Permission | Rule |
|---|---|---|
| "Nova cobrança" | `contacts:create` | opens `CON-03`; shown whenever an open item (future installments included) is not in an open charge |
| "Registrar pagamento" (on a charge) | `contacts:update` | opens `CON-04`; hidden on cancelled |
| "Marcar como enviada" | `contacts:update` | only on a draft with no payment |
| "Enviar de novo" | `contacts:update` | offers the same channels as after creating (RF-CON-7) |
| "Enviar por e-mail" | `contacts:update` | needs an e-mail; disabled with the reason when the contact opted out ("{nome} pediu para não receber e-mails") |
| "Copiar mensagem", "Enviar pelo WhatsApp", "Copiar Pix" | `contacts:view` | the WhatsApp button needs a phone; opted-out contacts show a warning first: "Este contato pediu para não receber mensagens. Enviar mesmo assim?" |
| "Cancelar cobrança" | `contacts:update` | only without payments (otherwise not in the "⋯"); dialog "Cancelar esta cobrança? Os itens dela poderão ser cobrados de novo." |
| "Anexar comprovante" (on a charge) | `attachments:create` | `ATT-01` |
| "Editar" | `contacts:update` | `CON-05` |
| "Arquivar" / "Desarquivar" | `contacts:update` | archive only with a zero balance; with a balance a dialog names the contact and the amount, says why, and offers "Nova cobrança" (`CONTACT_HAS_BALANCE`) |
| "Não quer receber mensagens" | `contacts:update` | switch (`isOptedOut`) |
| "Excluir" | `contacts:delete` | dialog; without balance "Excluir {nome}? Os lançamentos continuam."; when the contact owes: "{nome} ainda deve R$ X. Excluir o contato não apaga as dívidas dos lançamentos, mas ele some das listas. Excluir mesmo assim?" |

Viewer: no edit, no "⋯", no "Nova cobrança" and no "Registrar pagamento"; copying the message and
the Pix stays.

## CON-03 New charge (MVP)
A tall sheet from `CON-01`/`CON-02` (an 880 px two-column dialog on the desktop). `POST
/contacts/:contactId/charges`, permission `contacts:create`.

| Field | Label | Input | Required | Rules |
|---|---|---|---|---|
| until | "Cobrar o que vence até" | shortcuts "Hoje, dd/mm", "Até {próximo vencimento} · +n parcela" and "Outra data" (the app's calendar); default today, or the next due date (`nextOpenDueOn`, G63) when nothing is due yet | yes | valid date |

**RF-CON-6** Before creating, show a preview of the items that will be included ("Vai na cobrança ·
n itens", dotted leaders, solid line before the total; `GET
/contacts/:contactId/open-items?until=`, refreshed when the date changes). Nothing to charge up to
the date disables "Criar cobrança" and explains why (what is due is already in the charge of dd/mm)
with the shortcut "Incluir até 10/11 · R$ 160,00". On the desktop the right column previews the
message live with the shared `chargeMessage` and the workspace's charge text.
**RF-CON-7** After creating: first "Como enviar" (stacked options, each only when possible:
"WhatsApp" opens `wa.me` with the text, then asks "Você enviou a mensagem?" ("Ainda não" keeps the
draft); "E-mail" opens the e-mail confirmation (G62); "Copiar mensagem", dashed), then the message
exactly as the contact will read it (from the response), the link "Mudar o texto padrão das
cobranças" (`SET-03`, `settings:update`) and the Pix copia e cola box with "Copiar Pix". Without
Pix receiving set up: the message has no code and a note leads to `SET-02` (only for
`settings:update`). A contact without e-mail has no e-mail option; without WhatsApp nor e-mail,
only "Copiar mensagem" stays, with "Adicionar WhatsApp ou e-mail". Desktop: the message on the
left, the Pix and the channels on the right.
Errors: `NOTHING_TO_CHARGE` ("Este contato não tem nada em aberto até essa data."),
`CONTACT_NOT_FOUND`, `CHARGE_INVALID`; sending by e-mail `CONTACT_HAS_NO_EMAIL`,
`CONTACT_OPTED_OUT`.

## CON-04 Record a payment for a charge (MVP)
A sheet (a dialog on the desktop) with the charge card on top (its amount and what is left).
`POST /charges/:chargeId/payments`, permission `contacts:update`.

| Field | Label | Input | Required | Rules |
|---|---|---|---|---|
| amountCents | "Valor recebido" | money, default what is left of the charge | yes | > 0; above what is left warns "O valor passa do que falta; o excesso fica como crédito do contato." (not blocked) |
| receivedInAccountId | "Recebido em" | money-account picker | yes | active money account |
| occurredOn | "Data" | date, default "Hoje" | yes | valid date |

Action "Registrar pagamento" → toast "Pagamento registrado." with "Ver lançamento"; the charge
shows its new status ("Paga em parte") and its history says how much came in and how much is
left. Deleting the payment's entry undoes it.
Errors: `CHARGE_STATUS_REFUSED` ("Esta cobrança foi cancelada e não recebe pagamentos."),
`ACCOUNT_NOT_AVAILABLE` / `NOT_A_MONEY_ACCOUNT` (field account), `CHARGE_PAYMENT_INVALID`,
`CHARGE_NOT_FOUND`.
**RF-CON-8** A payment without a charge (a contact paid something not charged yet) is recorded in
`ENT-02` as "Recebimento de contato".

## CON-05 New or edit contact (MVP)
Full screen on the phone, a 720 px dialog on the desktop (Nome full width, WhatsApp | E-mail side
by side, Chave Pix and Observações full width). Create `POST /contacts` (`contacts:create`); edit
`PATCH /contacts/:id` (`contacts:update`, only changed fields; "Salvar" enabled once something
changed). Errors show when leaving the field.

| Field | Label | Input | Required | Rules |
|---|---|---|---|---|
| name | "Nome" | text | yes | trimmed, 1–80 |
| phoneE164 | "WhatsApp" | country select (+55) and the number, same height | no | valid international number: "Informe o número com DDD, como (11) 99999-0000."; unique: `CONTACT_PHONE_TAKEN` "Outro contato já usa esse número."; help "Para enviar cobranças pelo WhatsApp." |
| email | "E-mail" | e-mail | no | valid: "Informe um e-mail válido, como nome@exemplo.com."; unique: `CONTACT_EMAIL_TAKEN` "Outro contato já usa esse e-mail."; help "Para enviar cobranças por e-mail." (G61) |
| pixKey | "Chave Pix" | text | no | 1–77; help "Para vocês pagarem este contato, quando precisarem." |
| notes | "Observações" | textarea with counter /500 | no | up to 500 |
| isOptedOut (edit only) | "Não quer receber mensagens" | switch, with the explanation | no | off only for an opt-out a member set |

Actions "Criar contato" / "Salvar". Errors: `CONTACT_INVALID`, `CONTACT_PHONE_TAKEN` and
`CONTACT_EMAIL_TAKEN` (field), `CONTACT_NOT_FOUND` (page state).

## The charge e-mail and its opt-out page (MVP)
Designed in `../../../design/contacts/emails.md`: the account e-mail layout with the two owls, the
items, the due date, the Pix block with a QR code and the copia e cola, the customizable opening
and closing (`SET-03`), and the footer link "Não quero mais receber cobranças por e-mail". The link
opens a public page (no login) that sets the opt-out (`POST /api/public/contacts/opt-out` with the
contact's token, G62) and confirms in one sentence.
