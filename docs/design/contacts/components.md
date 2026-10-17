---
summary: The components behind the contacts round, in build order, mapped to what already exists in apps/web.
read_when: Creating or changing a component used by contacts, charges, the charge email or the charge text settings.
updated: 2026-10-16
---

# Components (contacts and charges)

Reuse first (`../../architecture/web-components.md`): `PageFrame`, `ListSummary`/summary tiles, `ChoiceChips`, `Avatar`, `Badge`, `Amount`, `ActionMenu`/`ItemActions`, `ConfirmDialog`, `Toast`, `EmptyBlock`, `ListSkeleton`, `SectionError`, `ArchivedToggle`, `PickerField`/`PickerSheet`, `CalendarSheet`, `MoneyInput`, `Switch`, `Alert`, `DetailSection`, `Breadcrumb`, `KpiCard`, the round A date block, the dotted-leader rows of ENT-03.

| # | Component | Base | Notes |
|---|---|---|---|
| 1 | `SummaryTiles` (change) | the planning tiles | Flex-wrap: each tile `flex: 1 1 50%`, `min-width: min-content`; the amount `nowrap`. Two tiles side by side until an amount does not fit, then the second drops below. Apply to every summary pair in the app |
| 2 | `ContactRow` | — | Avatar 42 px (paper), name (2 lines), second line: badges first, then the state (2 lines, `R$&nbsp;` kept together), channels line 12 px with icons; right column: amount + "deve/crédito/em dia"; optional compact "Cobrar" pill (30 px, ink) under it |
| 3 | `ContactHeader` | the ENT-03 hero (option B) | Initial 48 px + "Contato" + name; "Deve" / "Crédito de" label; amount display full width (nowrap); sentence; opt-out pill "Pediu para não receber mensagens" |
| 4 | `OpenItemRow` | `OccurrenceRow` | Date block, description (2 lines), second line badge first ("Atrasado", "Na cobrança de 20/10"), card + share detail, amount right. Grouped under "Vencidos" / "A vencer" small caps labels |
| 5 | `ChargeRow` | — | **No drawing.** Grid: line 1 title (nowrap, ellipsis) · amount (nowrap) · chevron; line 2 status badge + "n itens · canal". "⋯" outside the toggle button, only when open (Copiar mensagem, Anexar comprovante, Cancelar cobrança). Status badges: Rascunho neutral, Enviada pending, Paga em parte partial, Paga paid, Cancelada neutral |
| 6 | `ChargeBody` | — | Send history line (icon + channel, time, address; danger tint on failure), item rows with dotted leaders and a solid line before the total, `<details>` "Mensagem" with the bubble, `ActionGrid` |
| 7 | `ActionGrid` | — | CSS grid, 2 equal columns, gap 8; the primary spans both; buttons 44 px (primary 48), centered label, nowrap. Container query ≥ 560 px: 3 equal columns in one row. Normal: Registrar pagamento · Enviar de novo · Copiar Pix. Email failed: Tentar o e-mail de novo · Pelo WhatsApp · Corrigir e-mail. Viewer: Copiar mensagem · Copiar Pix |
| 8 | `MessageBubble` | — | Mint-soft bubble (4 16 16 16 radius), the stored message line by line, the Pix line in mono and shortened in the app |
| 9 | `PixBox` | — | "Pix copia e cola · R$ X", mono code (wraps anywhere), "Copiar Pix" |
| 10 | `UntilChips` + `ChargePreview` | `ChoiceChips` | Shortcuts "Hoje, dd/mm", "Até dd/mm · +n parcela" (from G63), "Outra data" (opens `CalendarSheet`); preview card "Vai na cobrança · n itens" with dotted leaders, total; nothing to charge → `NothingToCharge` (drawing, sentence, "Incluir até 10/11 · R$ 160,00") and the primary disabled |
| 11 | `SendOptions` | radio-card look | Stacked 64 px buttons: icon, title, the address and what happens; "Copiar mensagem" dashed. Email disabled for a contact who opted out by the email link |
| 12 | `EmailSendSheet` | `Sheet` | Para, Assunto, Respostas vão para (dl), "Ver o e-mail como ele chega", the opt-out line, "Enviar e-mail" |
| 13 | `PaymentSheet` | the ENT forms | Charge card, `MoneyInput` (warn above what is left), money-account picker, date |
| 14 | `ContactForm` | the ACC forms | Nome; `PhoneField` (country select 92 px + number, same 48 px height); E-mail (new); Chave Pix; Observações with counter /500; edit: the opt-out `Switch`. Desktop grid: Nome full, WhatsApp | E-mail, Pix full, Observações full |
| 15 | `PixSettingsForm` | the forms | Key, receiver name (counter /25), city (counter /15), bank preview (`pv` block), "Remover Pix" (danger text, confirm) |
| 16 | `ChargeTextEditor` (new) | — | A text field that shows info tags as mint chips ("Quem cobra", "Valor"…), counters, insert-tag buttons (dashed pills with "+"), unknown `{tag}` underlined in danger with the field error; the fixed-parts note with a padlock; preview with tabs "E-mail" (inbox row) and "WhatsApp" (bubble); "Voltar ao texto padrão" |
| 17 | `InboxPreview` | — | Sender, time, subject (one line, ellipsis), preheader (one line) — used in the text settings and the subject options |
| 18 | Charge email template | `core/email/layout.ts` | See `emails.md` |
