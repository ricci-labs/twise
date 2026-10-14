---
summary: Overview of the ENT-02 "Novo lançamento" design: layouts, rules, build order and what is still not designed.
read_when: Starting ENT-02 or any form that reuses its pieces (pickers, money field, date shortcuts, shares).
updated: 2026-10-14
---

# New entry (ENT-02)

Requirement: `../../product/requirements/modules/entries.md` (ENT-02, RF-ENT-5 to 8). Error copy: `../../product/requirements/error-messages.md` (Entries). Screens: `screens.md`. Components: `components.md`. Read `decisions.md` before building.

## Layouts

- **Mobile:** a full screen over the app (no tab bar). Top: "X" (Cancelar) and the title. Then the type chips, "Repetir um recente" (new form only), "* obrigatório", the fields, and a fixed footer with "Salvar lançamento" (primary, full width) and "Salvar e registrar outro" (text button). 16 px side margins.
- **Desktop:** a large dialog, 880 px wide, 40 px from the top, over the screen the person was on (dimmed). Fixed header and footer, the body scrolls. Footer: "Cancelar" on the left; "Salvar e registrar outro" (secondary) and "Salvar lançamento" (primary) on the right. Fields in two columns in the same order as mobile; side-by-side fields share one height (48 px) and only the money field is taller. The invoice preview, the shares list and the notes span both columns, edge to edge.

## Rules that hold everywhere

- Same form patterns as the account screens and the Home: errors on blur with icon and text; a disabled submit uses `aria-disabled` with no hint text; help text above the input; the button shows a spinner and "Salvando…"; toasts at the bottom on mobile and top-right on desktop; "Descartar as alterações?" only when something changed.
- Values common to every type are kept when switching type (RF-ENT-5).
- The invoice preview and the installment split come from `packages/shared` (`ledger/cards/billing-cycle`, `ledger/installments`): the screen never makes up dates or cents.
- Illustrations are never clipped in a circle; loose (no paper square) on white surfaces. See `../assets/ilustracoes/soltas/README.md`.
- Name-to-value lists (shares): a dotted leader between the name and the value, values in one column, the total aligned to them. Lists split by dividers (the installments) have no leader.

## Build order

1. Components in `components.md` (1 to 6 first: they are reused by accounts, cards and planning).
2. Mobile Despesa end to end (fields, pickers, errors, save, toast, discard).
3. Card purchase with the preview and the closed-invoice message.
4. Shares.
5. The other types.
6. Desktop dialog (same components, two columns).
7. The two shortcuts (recent entries and suggestion fill) once the API gives the data (`decisions.md`, API needs).

## Not designed yet (behaviour from the requirement)

- ENT-01 list, ENT-03 detail, ENT-04 edit (reuses this form; closed-invoice entries only change description and notes), ENT-05 trash.
- "Novo contato" inside the contact picker opens CON-05 in a dialog (contacts round).
- "Cadastrar conta" / "Cadastrar cartão" from the empty pickers open ACC-03 / CARD-04, the new account and new card forms (accounts and cards round) and come back with the new item selected.
