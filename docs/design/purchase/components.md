---
summary: Components behind "Posso comprar?" (HOME-02), mapped to what exists in apps/web.
read_when: Creating or changing a component used by HOME-02.
updated: 2026-10-29
---

# Components (Posso comprar?)

| # | Component | Base | Notes |
|---|---|---|---|
| 1 | `PurchaseForm` | ENT-02 fields | `MoneyInput`, segmented "Como vai pagar", card / money-account pickers, `InstallmentStepper` + `InstallmentPreview` (RF-ENT-6), date button with the app's calendar |
| 2 | `useLiveSimulation` | TanStack Query | Debounce 500 ms, cancel the previous request, keep the form while loading; errors map to fields (SIMULATION_*) |
| 3 | `Verdict` | — | Mint (ok), warning-soft (aperta), danger-soft (não cabe); icon in a white circle, title 20 px display, one sentence |
| 4 | `BeforeAfterTiles` (app-wide) | — | Rule 6 in decisions.md. Phone: rows (label 2 lines + "antes R$ X" small on the left; the new value large on the right, `nowrap`, danger when negative). Desktop: tiles side by side (label, new value 22 px, "antes" below). "sem mudança" when nothing changes |
| 5 | `ComingMonthsBars` | Home "Próximos meses" | Committed + this purchase, 70% reference line, only changed months strong, overflow mark above 100% |
| 6 | `InsightCard` | Home | Same as the Home's alerts |
| 7 | `ResultState` (app-wide) | — | Rule 7: centred icon, title, sentence, optional code + ref, "Tentar de novo"; used inside a result area or a pane |
| 8 | `OfflineBar` | Home/ENT-02 bar | Desktop: edge to edge at the top of the content area (settings rule 5) |
