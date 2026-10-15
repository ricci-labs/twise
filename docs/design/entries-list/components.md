---
summary: The components behind ENT-01, ENT-03, ENT-04 and ENT-05, in build order, mapped to what already exists in apps/web.
read_when: Creating or changing a component used by the entries list, detail, edit or trash.
updated: 2026-10-14
---

# Components (entries list, detail, edit, trash)

Reuse first (see `../../architecture/web-components.md`): `PeriodPicker`, `SearchInput`, `PickerField`/`PickerSheet`, `ChoiceChips`, `CalendarSheet`, `ShowMoreButton`, `ActionMenu`/`ItemActions`, `Toast`, `EmptyBlock`, `ListSkeleton`, `ErrorState`, `PageFrame`, the new-entry form. Classes in the HTML references (`twise.css`) only show the look.

| # | Component | Base | Notes |
|---|---|---|---|
| 1 | `EntryRow` | — | Drawing 42 px, description + badges (`3×`, contacts icon, clip), second line that wraps, amount by kind (out ink "−", in `--mint-ink` "+", neutral `--ink-muted`). A link to the detail. Trash variant: who/when/why lines and a small secondary "Restaurar" under the text |
| 2 | `EntryDayGroup` | — | Day heading ("Hoje · ter, 20 out"; then "sáb, 17 out") and a white card with the rows split by dividers |
| 3 | `EntryFilters` | `Sheet` (phone) / menus (desktop) | Phone: one "Filtros" button with a count; the sheet has Tipo (`ChoiceChips`, multiple), Conta ou cartão and Categoria (`PickerField`; a category includes its subcategories), Quem gastou (Todos, members), "Só os divididos com contatos" (switch); footer "Limpar tudo" + "Ver resultados". Desktop: one button per filter showing its value ("Tipo: Compra no cartão"), outlined when on; Tipo is a checkbox menu that applies at once, with "Limpar" |
| 4 | `FilterChips` | — | Active filters as chips with "×" and a "Limpar" text button; a category from a parent reads "Mercado e subcategorias" |
| 5 | `RangeCalendar` | extends `CalendarSheet` | Picks a range: "De" / "Até" boxes on top (the empty one outlined), first and last day with the selection outline, the days between on `--bg-sunken`, today with the dot; footer button says what happens ("Ver de 5 a 20 out", or "Escolha o último dia" disabled). Desktop popover: shortcuts on the left (Este período, Período anterior, Últimos 30 dias, Este ano, Escolher datas) and the month on the right with "Aplicar" |
| 6 | `ListEnd` | — | Under the last page: "Isso é tudo de out/26." + "Ver set/26"; with filters, "Isso é tudo com esses filtros em out/26." |
| 7 | `ListSummary` | — | One muted line with bold numbers from the API (G46): "Saiu R$ 6.505,20 · Entrou R$ 9.120,00 · 11 lançamentos"; follows the filters |
| 8 | `EntryHeader` | — | Option B: drawing (52 px) and the name on one line, the type in small muted text above the name (no badge with a dot: it looks like a status), the amount (32 px display, cents raised) on the full width, then "3× de R$ 333,34 · ter, 20 out 2026". Income in `--mint-ink` with "+" |
| 9 | `DetailSection` + `DetailList` | — | White card with a title and label/value rows split by dividers (value right-aligned, with the small drawing or avatar) |
| 10 | `InstallmentRows` | — | One row per installment: "1/3", month and "vence 04/11", invoice status badge, amount, chevron to that invoice (CARD-03). More than 3: the closed, the open and the next, then "Mostrar mais N parcelas" |
| 11 | `ShareRows` | — | Contacts with the dotted leader to their amount; a **solid** divider; "Sua parte" with its leader and amount; "Ver cobranças" in the header |
| 12 | `TransferFlow` | — | Two boxes "Saiu de Conta X" → "Entrou em Poupança" with their drawings and an arrow; the sentence that a transfer is neither spending nor income |
| 13 | `LinkedItem` | — | A row linking to what the entry belongs to: the planned bill it paid, the commission split step, the invoice it paid; mint variant for "Divisão sugerida feita · 4 de 4 partes" |
| 14 | `AttachArea` | — | Dashed "Anexar comprovante · Foto ou PDF" (ATT-01), or the file rows with their "⋯" |
| 15 | `DeleteReasonSheet` | `Sheet` / `Dialog` | "Excluir {nome}": text, "Motivo (opcional)" textarea (200), "Cancelar" + danger "Excluir lançamento" |
| 16 | `EntryEditForm` | the new-entry form | Title "Editar lançamento", one button "Salvar alterações" (disabled until something changes). The blue note "Mudou o valor, então ao salvar criamos uma nova versão…" appears only when a field other than description and notes changes, and names it. Closed invoice: only Descrição and Observações, plus a locked block "O que não muda". Conflict: danger alert with "Ver a versão atual" |
| 17 | `DetailPanel` | `Dialog` on the right | Desktop: 480 px, header "Lançamento" + "Editar" button + "⋯" + close, the same sections |
| 18 | `TrashTabs` | `SegmentedControl` | "Lançamentos | Contas e categorias" on the shared Lixeira page |
