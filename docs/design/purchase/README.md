---
summary: Overview of "Posso comprar?" (HOME-02): layout, live result, states, build order.
read_when: Starting HOME-02.
updated: 2026-10-29
---

# Posso comprar? (HOME-02)

Requirement: `../../product/requirements/modules/dashboard.md` (HOME-02, RF-HOME-11). Route `GET /simulations/purchase` (`reports:view`), read-only. Errors: `../../product/requirements/error-messages.md` (SIMULATION_*). **Before building: `decisions.md`** (requirement changes, two app-wide rules, API G76–G78).

## Layout

- **Mobile (`/posso-comprar`, from the Home card):** back + title + "Simule uma compra antes de gastar. Nada é registrado." The form card: Valor da compra; Como vai pagar (No cartão | Na conta, outline selection); Cartão (picker with due day and free limit) + Parcelas (stepper with "6× de R$ 540,00") and the same installment preview as the new entry (RF-ENT-6, computed on the device); or Conta (with today's balance); Quando (the app's calendar, default today).
- **The result appears by itself** 500 ms after each valid change (no "Simular" button); only the last request counts. Order: the verdict (Cabe no orçamento / Cabe, mas aperta / Não cabe sem estourar, with one sentence); "Neste período" as before-and-after blocks (rule 6): Livre para gastar, Por dia and the payment method (card free limit or account balance, G77); "Próximos meses" bars (already committed + this purchase, the 70% line, only months that change in strong colour; above 100% the bar stops with an overflow mark); "O que passaria a aparecer nos avisos" (or "Nenhum aviso novo apareceria."); "É só uma simulação: nada foi registrado." and "Registrar esta compra" (opens ENT-02 filled in; hidden without `entries:create`).
- **States:** start (the result area explains what will appear), loading (skeleton in the result's shape), purchase in the next period ("sem mudança" in this period + a note, G78), viewer (simulates; no "Registrar"), card picker (archived hidden behind "Mostrar arquivados"), too many installments for the amount (field error, the "+" stops at the max), deleted card (field error), offline and server error (rule 7), a 7-digit amount in 48×.
- **Desktop:** a work screen (settings/decisions.md rule 4): "A compra" on the left, "O que muda" on the right with "Atualiza enquanto você digita"; each pane scrolls on its own; "Neste período" as three blocks side by side.

## Build order

1. Docs PR (`decisions.md`), G76–G78 into `../../product/requirements/api-gaps.md`, rules 6 and 7 into `../../product/requirements/ui-standards.md`.
2. The form (reuse the ENT-02 money, card, installment and date components).
3. The live result with the verdict, blocks, bars and alerts.
4. States and errors; desktop work screen.
