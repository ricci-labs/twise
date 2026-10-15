---
summary: Overview of the entries list, detail, edit and trash design (ENT-01, ENT-03, ENT-04, ENT-05): layouts, rules, build order and what is still not designed.
read_when: Starting ENT-01, ENT-03, ENT-04 or ENT-05. The new-entry form (ENT-02) is in ../entries/.
updated: 2026-10-14
---

# Entries: list, detail, edit, trash

Requirement: `../../product/requirements/modules/entries.md` (ENT-01, ENT-03, ENT-04, ENT-05). Error copy: `../../product/requirements/error-messages.md` (Entries). Screens: `screens.md`. Components: `components.md`. **Read `decisions.md` before building**: it replaces the paging and search of entries.md and lists what the API must add (G45–G47).

## Layouts

- **List, mobile** (`/lancamentos`, the "Lançamentos" tab): title with the trash icon (only with `entries:delete`); the Home's `PeriodPicker`; a row with the search field and the "Filtros" button (count badge when filters are on); active filters as removable chips with "Limpar"; a summary line from the API (Saiu · Entrou · count); then one white card per day ("Hoje · ter, 20 out", "Ontem · seg, 19 out", "sáb, 17 out"); "Mostrar mais" at the end; the floating "+".
- **List, desktop:** page title and "Lixeira" on the right; a bar with the period, the search and one button per filter (Tipo, Conta ou cartão, Categoria, Quem gastou), each opening a menu under itself; a full-width table with the days as bands; "Mostrar mais" at the bottom of the table.
- **Detail** (`/lancamentos/:id`): a full page on the phone (back, the pencil "Editar", "⋯"); on the desktop a 480 px panel on the right over the list (the route changes, so the link works alone; Esc closes).
- **Edit:** the new-entry form prefilled: a full screen on the phone, the 880 px dialog on the desktop.
- **Trash** (`/lancamentos/lixeira`): rows as in the list plus who, when and why, and "Restaurar".

## Rules that hold everywhere

- `../../product/requirements/ui-standards.md` → "Lists, pickers and long content": 50 items per load, "Mostrar mais", no page numbers; search and filters ask the API; the app's pickers and calendar; menus as wide as their field (288–480 px); no bottom sheets on the desktop; Home margins (`PageFrame`).
- **Amounts in the list:** money out in ink with "−"; money in in `--mint-ink` with "+"; transfers and invoice payments in `--ink-muted` without a sign (they are not spending).
- **Row content:** loose drawing (42 px) of the category (system drawings for transfer, settlement, invoice payment, opening balance); description with badges ("3×" installments, a contacts icon when shared, a clip when it has a receipt); second line "Categoria › Subcategoria · Conta"; "por Member B" only when someone else spent. The second line wraps instead of being cut.
- **One selection style** (the 2 px `--ink` outline, bold label): filter chips, the type pills of the new entry, the chosen month in the period sheet, the calendar's first and last day. No mint fill.
- **Undo instead of confirm:** delete and restore never ask first; a toast with "Desfazer" (delete) or "Ver" (restore) for 8 s; the floating "+" moves up while a toast shows.
- **One action per destination:** "Editar" is the pencil (phone) or the button (desktop panel); the "⋯" holds Repetir, Anexar comprovante, Excluir com motivo, Excluir. On the desktop list row, the "⋯" menu also has Editar (there is no pencil there).
- Viewers: no "+", no trash, no pencil, no "⋯", no "Anexar comprovante", no Histórico.

## Build order

1. API G45 (filters and search) and G46 (summary): the list must not filter or add up what is on screen.
2. Components in `components.md` (1 to 7).
3. ENT-01 mobile with every state, then the period sheet and the range calendar.
4. ENT-03 for each kind of entry; delete, reason and undo.
5. ENT-04 (two modes, closed invoice, conflict).
6. ENT-05 and the shared "Lixeira" page (decision 1 in `decisions.md`).
7. Desktop: filter menus, period popover, side panel, edit dialog, trash table.

## Not designed yet

- Attachments (`ATT-01`): only the entry points ("Anexar comprovante", the file row with "⋯").
- The entry's version history (`AUD-01`, and `../../product/requirements/api-gaps.md` G11).
- Day totals in the list (RF-ENT-1 "Later").
