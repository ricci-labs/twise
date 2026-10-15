---
summary: The components behind ENT-02, in build order, each mapped to its shadcn/ui piece.
read_when: Creating or changing a component used by the new-entry form (and later by the accounts, cards and planning forms).
updated: 2026-10-14
---

# Components (ENT-02)

Reused from the design system: Button, TextField, MoneyInput, Alert, Badge, Amount. Classes in the HTML references (`twise.css`) only show the look.

| # | Component | shadcn/ui base | Notes |
|---|---|---|---|
| 1 | `MoneyField` | `Input` | Label + "R$" prefix + the amount in the display font (32 px), 64 px tall; the only field taller than the rest. Negative variant (opening balance): "−" and the value in `--danger`. Error below with icon; amber warning variant that does not block (`f-warn`: invoice overpay) |
| 2 | `PickerField` + `PickerSheet` | `Button` + `Drawer` (mobile) / `Popover` + `Command` (desktop) | 56 px on mobile, 48 px on desktop. Loose illustration (42 px, no circle, no paper), name and a grey second line (balance, closing/due dates, "Renda variável"). Empty: dashed rounded square with "+" and grey placeholder ("Escolha uma categoria"). Sheet: title, optional search, rows with loose illustration (46 px), current one on `--mint-soft` with a check. Empty sheet: big loose illustration, the sentence and a primary "Cadastrar conta" |
| 3 | `CategoryGrid` | `ToggleGroup` in the sheet | 3 columns of tiles on the paper colour with the illustration (64 px, loose); selected = same paper tile with a 2 px `--ink` outline and bold label, no check mark. A category with subcategories shows "N sub" under its name; tapping it opens, right below the grid, the row "Em {mãe}" with "Só {mãe}" and its subcategories as chips (choosing one closes the sheet). A category without children closes the sheet at once. Search also finds subcategories, shown with their parent ("Feira · em Mercado"). The field then reads "Mercado › Feira" with the parent's illustration. Most used first; search on top |
| 4 | `TypeChips` | `ToggleGroup` (single) | Wrapping pill buttons, all visible (no horizontal scroll): Despesa, Compra no cartão, Receita, Transferência, "Mais ▾". Selected: `--mint` background, `--on-mint` text (now the 2 px `--ink` outline and a bold label, `../entries-list/decisions.md`). "Mais" opens a sheet with the three other types (loose illustration + one-line description) and then shows the chosen type's name |
| 5 | `DateShortcuts` | `ToggleGroup` + `Popover`/`Calendar` | "Hoje, 20 out" · "Ontem" · "Outra data" (calendar icon; shows the picked date, e.g. "20 set"). Selected: 1.5 px ink outline, bold |
| 6 | `WhoSpent` | `RadioGroup` as two cards | Avatar + "Member A/B"; default the current user. Only on expense and card purchase |
| 7 | `InstallmentStepper` | `Button` × 2 | "−  3×  +" (1 = "À vista"), with "3× de R$ 333,34" beside it. 1 to 48 |
| 8 | `InvoicePreview` | — | `--bg-sunken` box with the loose calendar: "A 1ª parcela entra na fatura que vence em 04/11." and one row per installment ("1/3 · vence 04/11 · R$ 333,34", value right-aligned, rows split by dividers, no leader). Closed invoice row: struck through with a "Fechada" badge; then the warning Alert with "Começar da parcela N". Long lists show 3 rows + "+ N parcelas, até a fatura que vence em …" |
| 9 | `InProgressSwitch` | `Switch` | "Compra já em andamento", switch beside the label. On: a bordered box with "Começar da parcela", the help text above, a stepper and "de 10" |
| 10 | `SharesList` | — | Header "Dividir com contatos" + quick fills "Metade" and "Dividir igualmente". Rows: contact avatar, name, **dotted leader**, money input (132 px), remove "×". "+ Adicionar contato" (text button). Last row after a dashed divider: "Sua parte", leader, bold value in the same column. Errors below the rows. Collapsed state: dashed pill "+ Dividir com contatos" |
| 11 | `InvoiceRadioList` | `RadioGroup` | Invoice payment: rows with radio, "Vence 04/11", "Falta pagar R$ X" and a status badge |
| 12 | `RecentEntries` | — | "Repetir um recente": horizontal row of cards (loose illustration, description, last amount), starting at the 16 px margin, last one peeking. Tapped one gets an ink outline |
| 13 | `AutoFillTip` | — | 13 px grey line with a green check, what was filled, and "Desfazer" (link) on the right; under the field it relates to |
| 14 | `EntryForm` shell | `Dialog` (desktop) / full-screen route (mobile) | Mobile: header, scroll area, fixed footer (toast and form errors sit just above the buttons). Desktop: dialog 880 × 820, header, scrolling body, footer bar. "Cancelar"/Esc/outside click follow the discard rule (`AlertDialog`: "Descartar as alterações?", "Continuar editando" secondary, "Descartar" danger) |
