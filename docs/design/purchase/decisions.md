---
summary: Design decisions for "Posso comprar?" (HOME-02) that change dashboard.md, two new app-wide UI rules, and API needs G76–G78.
read_when: Before building HOME-02, and when updating dashboard.md, ui-standards.md or api-gaps.md.
updated: 2026-10-29
---

# Decisions (Posso comprar?)

Approved by the product owner on 2026-10-29. This replaces the HOME-02 draft in the Home canvas (09/10), which was never built.

## Changes to dashboard.md (HOME-02)

| Topic | Requirement today | Design |
|---|---|---|
| When it runs | "Simular" or live | **Live only**, 500 ms after a valid change; no button |
| Installments | stepper | Stepper + the new entry's preview of the invoices each installment falls on (RF-ENT-6, on the device) |
| This period | "Livre para gastar: R$ A → R$ B", "Por dia: R$ C → R$ D" | Before-and-after blocks (rule 6), plus the payment method's line (G77) |
| Verdict | wording to validate | "Cabe no orçamento." / "Cabe, mas aperta." / "Não cabe sem estourar." with one sentence below; from the API (G76) |
| No new alert | — | "Nenhum aviso novo apareceria." instead of an empty section |
| After the result | — | "Registrar esta compra" opens ENT-02 filled in (amount, card or account, installments, date); hidden without `entries:create` |
| Purchase in another period | — | This period shows "sem mudança" and a note says where the effect shows (G78) |
| Errors | field errors | Field errors as in error-messages.md; offline and server errors as rule 7 (no stale result kept) |
| Desktop | — | Work screen: form left, result right |

## New app-wide rules (add to `../../product/requirements/ui-standards.md`)

6. **Before and after values are blocks, never "old › new" on one line.** Phone: label (up to 2 lines) and "antes R$ X" in small text on the left, the new value large on the right (never wraps, danger when negative). Desktop: tiles side by side (3–4 per row) with the new value large and "antes" below. Nothing changed: the current value and "sem mudança". Applies wherever a screen shows an effect (simulations, edits with before/after, the history change when it fits).
7. **Offline or error where a result appears.** The app's dark "Sem conexão" bar at the top (desktop: rule 5 of settings) and, in the result area, a centred notice: icon, title, one sentence, "Tentar de novo". Never keep an old result on screen. A server error adds the code and the reference. On desktop the notice fills the pane, never a card inside a card.

## API needs (add to `../../product/requirements/api-gaps.md`)

| # | Need | Today | Proposal |
|---|---|---|---|
| G76 | The verdict, the same on the web and WhatsApp | The screen would decide from `newInsights` | `GET /simulations/purchase` adds `verdict: 'fits' \| 'tight' \| 'over'`, `verdictReason` (the sentence's data, e.g. the month and %) and `committedReferencePercent` (the 70% line) |
| G77 | Effect on the payment method | Not returned | Card: `card { limitCents, freeBeforeCents, freeAfterCents }` and the insight `card_limit_exceeded`; account: `account { balanceTodayBeforeCents, balanceTodayAfterCents }` |
| G78 | Which period the purchase falls in | The response is always "the current period" | `period.label` of the period that contains `occurredOn` (or of the first installment's invoice), and `affectsCurrentPeriod: boolean` |
