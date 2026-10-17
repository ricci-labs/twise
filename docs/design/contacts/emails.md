---
summary: Design of the charge email (sent from the app to a contact): layout, copy, subject options, what is customizable and the opt-out link.
read_when: Building the charge email template, the email sending of charges, or the charge text settings.
updated: 2026-10-16
---

# The charge email

Mockups: `screens/html/Email-cobranca.html`, `Email-desktop.html`, `Email-assunto.html`, `Email-descadastro.html`. Same layout as the account emails (`../account/emails.md`, `core/email/layout.ts`), with a payment block.

## Layout

Subject and sender → logo (icon + "twise") → white card, max 520 px, radius 20, 1 px `border`:

1. Mint band (150 px) with the scene `corujas-juntos` (PNG 2x, hosted like the other scenes: `owl-together.png`).
2. Greeting `ink-muted` 15 px: "Oi, {contato}!" (fixed).
3. Heading, 26 px display: "R$ {valor} para {quem cobra}" (fixed).
4. Opening paragraph, 16 px (**customizable**, default below).
5. Items table: description with "Cartão X · venceu 10/10" under it, amount right (nowrap); a 2 px ink line before "Total".
6. "Venceu em {data}" (danger) or "Vence em {data}".
7. Pix block (mint-soft, radius 14): a QR code (PNG generated from the same payload, 104 px; 132 px on wide clients) and "Pague com Pix — No app do banco, escolha Pix › Pix copia e cola e cole o código. Ou leia o QR code com o celular."
8. "Código Pix copia e cola (toque e segure para copiar):" + the full code in a dashed box, mono 12 px, breaking anywhere.
9. Closing paragraph (**customizable**, optional).
10. Notes under a divider, 13 px: "Quem recebe: **{nome} · {cidade}**. Confira o nome no app do banco antes de pagar." and "Já pagou? Pode ignorar este e-mail; {quem cobra} registra o pagamento no app."

Footer: "**Twise** · Leve, claro, a dois." + "Você recebeu este e-mail porque {quem cobra}, do espaço {espaço}, dividiu contas com você." + the link "Não quero mais receber cobranças por e-mail".

Without Pix receiving set up (SET-02), blocks 7 and 8 and the first note are left out. The text version keeps the order and prints the Pix code in full.

## Sender, reply and preheader

- From: "Twise · {espaço}" `<cobrancas@[app domain]>` (the address depends on the app's domain; SPF/DKIM of that domain).
- Reply-To: the email of the member who created the charge.
- Preheader: "Oi, {contato}! " + the opening.

## Subject

Default (option A, approved): **"{quem cobra} te enviou uma cobrança de {valor}"**. Rejected: B "Lembrete de pagamento: {valor} para {quem cobra}" (the word "pagamento" in subjects trips spam filters more), C "{espaço}: {valor} em aberto com {quem cobra}" (contacts may not know the workspace name).

## Customizable vs fixed

| Part | Who sets it | Default | Limits |
|---|---|---|---|
| Subject | workspace (Mensagem das cobranças) | "{quem cobra} te enviou uma cobrança de {valor}" | 1–120 after filling |
| Opening (email and WhatsApp) | workspace | "{quem cobra} pediu para te lembrar do que está em aberto. Dá para pagar com Pix, o valor já vem preenchido." | 1–300 |
| Closing (email and WhatsApp) | workspace | "Qualquer dúvida, é só responder este e-mail." (WhatsApp: none by default) | 0–300 |
| Greeting, heading, items, total, due date, Pix, notes, footer, opt-out link | fixed | — | — |

The defaults are `DEFAULT_CHARGE_TEXT` and `DEFAULT_CHARGE_CLOSINGS` in `@financas/shared`. An untouched closing is stored as `null`, which means each channel's default (the e-mail sentence above, nothing on WhatsApp); a written or emptied closing goes to both channels. The limits count the text as written; the filled subject is cut to 120 characters with "…" (`chargeSubject`).

Tags: `{contato}`, `{quem cobra}`, `{valor}`, `{vencimento}`, `{espaço}`; shown as chips in the editor; an unknown tag is a field error ("Esta informação não existe: {apelido}. Use os botões abaixo para inserir."). The stored `message_text` of a charge is built when the charge is created, with the template of that moment: later edits never change charges already created.

## Opt-out

The footer link opens a public page (`Email-descadastro`) that marks the contact `opted_out_at` (token per contact, no login) and confirms in one sentence. The app shows "Pediu para não receber mensagens" on the contact. While opted out by this link, the app **does not send emails** to the contact (the email option is disabled with the reason); WhatsApp and "Copiar mensagem" stay possible with the warning dialog. A member can turn the switch off in the contact's edit form only for opt-outs the members set themselves.
