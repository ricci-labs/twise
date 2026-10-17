---
summary: Design decisions for the contacts round (CON-01..05, SET-02) that change contacts-and-charges.md and workspace-and-members.md, the email channel for charges, the customizable charge text, four new app-wide UI rules, and what the API must add (G61–G64).
read_when: Before building contacts and charges, and when updating contacts-and-charges.md, workspace-and-members.md, third-parties.md, ui-standards.md or api-gaps.md.
updated: 2026-10-16
---

# Decisions (contacts and charges)

Where the design and the requirement docs disagree, the design wins and the doc is updated in the same PR. Approved by the product owner on 2026-10-16. **New, asked by the product owner:** contacts have an email and a charge can be sent by email.

## Changes to contacts-and-charges.md

| Topic | Requirement today | Design |
|---|---|---|
| Contact fields | name, phone, Pix key, notes | **+ `email`** (optional, valid, unique among active contacts: `CONTACT_EMAIL_TAKEN` "Outro contato já usa esse e-mail."; invalid: "Informe um e-mail válido, como nome@exemplo.com."). Help texts: "Para enviar cobranças pelo WhatsApp." / "Para enviar cobranças por e-mail." / "Para vocês pagarem este contato, quando precisarem." (G61) |
| RF-CON-1 row | name, phone, balance texts, opted-out badge | Badge first on the second line; a channels line (WhatsApp, E-mail); amount on the right with "deve/crédito/em dia"; "Cobrar" pill only when something due is not in an open charge; after charging, badge "Cobrado em dd/mm" (G63) |
| RF-CON-2 | Sort; summary "Total a receber" and "Em atraso" | Same, sort as pills; tiles wrap instead of breaking the amount |
| RF-CON-3 header | name, phone, Pix key, notes, balances | Detail header option B with "Deve" and the amount; tiles "Em atraso" and "Próximo vencimento"; contact data in "Falar com {nome}" (WhatsApp "Abrir", email, the contact's Pix key labelled "Chave Pix de {nome}", notes) |
| RF-CON-4 open items | up to today | "Vencidos" **and** "A vencer" (future installments too, G63); items already in an open charge say "Na cobrança de dd/mm" |
| RF-CON-5 charges | date, total, paid, status, due; tap expands | Same; no drawing; history line (channel, time, address); items with leaders; collapsible message; actions in a grid; "⋯" in the open header |
| "Nova cobrança" visibility | hidden when nothing is open (up to today) | Shown whenever an open item is not in an open charge, future installments included; when nothing is due yet the default date is the next due date (G63) |
| CON-03 date | date field, default today | Shortcuts "Hoje", "Até {próximo vencimento} · +n parcela" and "Outra data"; nothing to charge explains why (already in the charge of dd/mm) and offers to include the next installment |
| RF-CON-7 after creating | message, Pix, WhatsApp, copy, close | "Como enviar" first (WhatsApp, **E-mail**, Copiar mensagem — each only when possible), then the message, "Mudar o texto padrão das cobranças" and the Pix |
| Sending by email | — | **New.** "Enviar por e-mail" opens a confirmation (to, subject, replies go to); the app sends it (outbox, SMTP), marks the charge sent with channel, time and address, and shows a toast. A refused address puts the charge back to draft with the reason and "Tentar o e-mail de novo" / "Pelo WhatsApp" / "Corrigir e-mail" (G62). "Enviar de novo" offers the same channels |
| Opt-out | recorded and shown; blocks nothing | Warning before WhatsApp (unchanged). Emails are not sent to a contact who opted out (the email has an opt-out link that sets it); see `emails.md` → Opt-out |
| Archive with balance | toast `CONTACT_HAS_BALANCE` | A dialog naming the contact and the amount, with "Nova cobrança" as the way out |
| Delete | dialog when the contact owes | Same text |
| CON-04 | amount, account, date, warning above what is left | Same, with the charge card on top; toast "Pagamento registrado." with "Ver lançamento" |
| Desktop | — | Contatos: KPIs (a receber, em atraso, próximo), the table, "Próximos vencimentos" (G63), "Como as cobranças saem"; Contato: two columns with "Pagamentos recebidos" (the contact's settlement entries); dialogs; the new charge dialog previews the message live with the shared `chargeMessage` |

## Changes to workspace-and-members.md

- SET-02: as designed (counters, bank preview, "Remover Pix" with its dialog). Reached from Configurações and from the charge note.
- **New SET-03 "Mensagem das cobranças"** (`settings:update`): subject, opening, closing with tags; previews; reset to default. Route `/configuracoes/mensagem-das-cobrancas`. See `emails.md`.

## Changes to third-parties.md

- `contacts.email` (citext null, unique among active contacts); `contacts.opted_out_via` (`member` | `email_link`); an opt-out token per contact.
- `charges.sent_via` (`whatsapp` | `email` | `manual`), `charges.sent_to`, `charges.email_status` (`queued` | `sent` | `failed`) and `email_error`.
- Sending by email goes through `notification_outbox` like the account emails; the template lives in `contacts.emails.ts`.
- `chargeMessage` takes the workspace template (opening, closing); the subject is built from the template too.

## New app-wide rules (add to `../../product/requirements/ui-standards.md`)

1. **Summary tiles side by side:** amounts never wrap; when both tiles do not fit, the second one drops to its own line.
2. **Button groups:** buttons of one group have the same height and width (a grid). On the phone the primary takes the full width and the others share the row below; on wide containers all sit in one row. No loose "⋯" beside a row of buttons.
3. **Dense rows:** a row with three or more things on the right (amount, chevron, "⋯") has no drawing; the status moves to the second line.
4. **Fields side by side:** their help texts are the same length (one line) or absent; a field whose help needs more goes full width.

## API needs (add to `../../product/requirements/api-gaps.md`)

| # | Need | Today | Proposal |
|---|---|---|---|
| G61 | Contact email | No email on contacts | `email` on `POST/PATCH/GET /contacts` (validated, unique among active contacts, `CONTACT_EMAIL_TAKEN`); `GET /contacts/balances` includes `email` and `phoneE164` for the channels line |
| G62 | Send a charge by email; know if it left; opt-out by link | Sending is by hand only | `POST /charges/:chargeId/send-email` (`contacts:update`): queues the email (outbox), marks the charge sent with `sentVia: 'email'`, `sentTo`, `sentAt`; `emailStatus` and `emailError` on the charge (a refusal returns it to draft); `409 CONTACT_OPTED_OUT` when the contact opted out by link; `409 CONTACT_HAS_NO_EMAIL`. Public `POST /api/public/contacts/opt-out` with the token (no login), sets `opted_out_at` and `opted_out_via: 'email_link'`. `POST /charges/:id/sent` takes `{ via: 'whatsapp' | 'manual' }` |
| G63 | Whether what is due is already charged; future installments; next due across contacts | `open-items` stops at the date and leaves out items in open charges | `GET /contacts/balances` adds `dueNotChargedCents`, `lastCharge { chargeId, createdOn, status }`; `GET /contacts/:id/open-items?until=&includeCharged=true` marks items with `inChargeId`; `GET /contacts/upcoming?limit=` → the next due items across contacts; `nextOpenDueOn` for the default date |
| G64 | Customizable charge text | The message is fixed in code | `GET/PUT /settings/charge-text` (`settings:update`): `{ subject, opening, closing }` with tags validated (`CHARGE_TEXT_INVALID`, unknown tag); `chargeMessage` and the email use it when the charge is created; `DELETE` resets to the default |
