---
summary: Overview of the contacts round (CON-01..05, SET-02) plus charges by email and the customizable charge text: layouts, rules, build order.
read_when: Starting any contacts or charges screen, the charge email or Configurações › Mensagem das cobranças.
updated: 2026-10-16
---

# Contacts and charges

Requirement: `../../product/requirements/modules/contacts-and-charges.md` (CON-01..05) and `../../product/requirements/modules/workspace-and-members.md` (SET-02). Domain: `../../domain/model/third-parties.md`. Errors: `../../product/requirements/error-messages.md` (Contacts and charges). Screens: `screens.md`. Components: `components.md`. The charge email: `emails.md`. **Read `decisions.md` before building**: contacts get an email, charges can be sent by email from the app, and the charge text becomes customizable (G61–G64).

## Layouts

- **Contatos** (`/contatos`, from Mais › Contatos e cobranças and the Home's "A receber" card): title + "Novo contato"; two summary tiles ("Total a receber", "Em atraso"); sort pills ("Mais atrasados primeiro" | "Nome", outline selection); one white list. Row: the initial in a paper circle, the name (2 lines), the second line with the badge first ("Em atraso", "Cobrado em 20/10", "Não quer mensagens") then the state ("R$ 200,00 vencido desde 10/10", "Próximo: R$ 120,00 em 25/10", "Tem crédito de R$ 30,00"), a small line with the channels (WhatsApp, E-mail); on the right the amount (danger when overdue, mint for credit) with "deve" / "crédito" / "em dia" under it and, when something due is not in an open charge, a compact dark "Cobrar" pill. "Arquivados (n)" collapsed at the end.
- **Contato** (`/contatos/:id`): detail header option B (initial + name, "Deve" + the amount full width, one sentence); tiles "Em atraso" and "Próximo vencimento"; "Nova cobrança" (primary, full width) and the link "Recebeu sem cobrança? Registrar recebimento" (ENT-02 as Recebimento de contato); **Em aberto** in "Vencidos" and "A vencer" (date block, description, badge first on the second line, amount); **Cobranças** (expand in place); **Falar com {nome}** (WhatsApp with "Abrir", email, the contact's Pix key with copy, notes).
- **Charge row:** no drawing. Line 1: "Cobrança de dd/mm", amount, chevron (and "⋯" in the header when open). Line 2: status badge + "n itens · canal". Open: send history (channel, time, address), items with dotted leaders and the total, the message (collapsible), actions in a grid: the primary full width, the two secondary ones side by side, same size.
- **Nova cobrança** (tall sheet / 880 px dialog): who, "Cobrar o que vence até" with shortcuts ("Hoje, 20/10", "Até 10/11 · +1 parcela", "Outra data" → the app's calendar), the items preview with the total. Desktop: the message preview on the right.
- **Cobrança criada:** first "Como enviar" (WhatsApp, E-mail, Copiar mensagem — each only when the contact has the data), then the message as the contact reads it, "Mudar o texto padrão das cobranças", and the Pix copia e cola box.
- **Registrar pagamento** (sheet / dialog): the charge card, "Valor recebido" (default what is left), "Recebido em", "Data".
- **Novo / Editar contato:** full screen on the phone, a 720 px dialog on the desktop: Nome (full width), WhatsApp | E-mail side by side, Chave Pix and Observações full width; editing adds the "Não quer receber mensagens" switch.
- **Recebimento por Pix** (SET-02, Configurações): key, receiver name (25) and city (15) with counters, the bank preview, "Remover Pix".
- **Mensagem das cobranças** (new, Configurações): subject, opening and closing with insertable info tags, the fixed parts explained, previews (email and WhatsApp), "Voltar ao texto padrão".
- **Desktop:** Contatos with 3 KPIs, the table, "Próximos vencimentos" and "Como as cobranças saem"; Contato in two columns (left: amount, open items, charges; right: Falar com, recebimento sem cobrança, Pagamentos recebidos); dialogs for the new charge (two columns), the created charge and the contact form; the text settings with the fields and the WhatsApp preview on the left and the full email on the right.

## Rules that hold everywhere (new ones are in decisions.md → ui-standards)

- Long text: names 2 lines, second lines 2 lines, amounts never wrap (tested with "Maria Aparecida dos Santos Oliveira", a 47-character email and R$ 1.256.520,00).
- **Summary tiles side by side:** the amount never wraps; when both do not fit, the second tile drops to its own line.
- **Button groups:** buttons of one group share height and width (grid); the primary takes the full width on the phone; on wide containers all sit in one row.
- **Dense rows:** a row with three or more things on the right (amount, chevron, "⋯") has no drawing, and the status moves to the second line.
- **Fields side by side:** their help texts are the same length (one line) or absent; a field whose help needs more goes full width.
- Viewers: no "Novo contato", "Cobrar", "Nova cobrança", "Registrar pagamento", "⋯" or edit; they can copy the message and the Pix.

## Build order

1. Docs PR (decisions.md) and API G61–G64.
2. Components in `components.md`.
3. Contatos and Contato, with the open items and charges.
4. Nova cobrança, Cobrança criada and sending (WhatsApp, email, copy), with the email template (`emails.md`).
5. Registrar pagamento, the contact form, Recebimento por Pix.
6. Mensagem das cobranças.
7. Desktop.
