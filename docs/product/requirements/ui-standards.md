---
summary: Rules every web screen follows — field and form validation, the button contract, feedback, loading/empty/error states, money and date inputs, permissions in the UI, destructive actions and how API errors become messages.
read_when: Designing or building any form, button, list or screen, or reviewing one before merge.
updated: 2026-10-16
---

# UI standards

Every screen spec in `modules/` assumes these rules. A spec only says where it differs.

## Forms and validation
**Every field of every form follows this, with no exception.**

1. **Label:** always visible above the field, in pt-BR. Required fields are marked with "*" next to
   the label (the "*" is `aria-hidden`; the field has `required`). **Short forms** (up to about 4
   fields, all required, like log in or sign up) show only the asterisks. **Long forms** that mix
   required and optional fields also start with "* obrigatório". Optional fields are not marked
   "(opcional)".
2. **Help text:** under the label and **before** the input, when the field needs explaining (format, what it affects), e.g.
   "Dia em que a fatura fecha. Compras nesse dia entram na próxima fatura."
3. **Same rules as the API:** the client validates with the same Zod schema the API uses
   (`@financas/shared`). Limits in the specs (lengths, ranges, formats) come from those schemas; a
   field never accepts what the API would refuse.
4. **When to validate** (decided with the user, 2026-09-29): the error shows **as soon as the
   person leaves the field** with an invalid value, never later on submit.
   - on leaving a field (blur), even the first time; never while the first value is being typed;
   - after a field shows an error, on every change, so the error disappears as soon as it's fixed;
   - rules between fields (the shares' sum, an end date after the start, "Para" different from
     "De") are checked again as soon as either field changes;
   - a required field the person hasn't touched shows no error; the disabled button says what is
     missing (Button contract).
5. **Error display:** under the field, in the error colour, with an icon and text (not colour
   alone), announced to screen readers. The field gets `aria-invalid`.
6. **Errors from the server on submit** (rules only the API knows, like a name already taken):
   the error shows under its field and focus moves there; when the form is long, a summary at the
   top lists every error as a link to its field ("Corrija 2 campos para continuar.").
7. **Message style:** says what's wrong and what to do, in plain pt-BR, never the raw code or an
   English message. Patterns:
   - required: "Informe {o nome da conta}."
   - too long: "Use no máximo {80} caracteres."
   - too short: "Use pelo menos {12} caracteres."
   - format: "Informe um e-mail válido, como nome@exemplo.com."
   - range: "Escolha um dia entre 1 e 31."
   - money: "Informe um valor maior que zero, como 25,90."
   - date: "Informe uma data válida (dd/mm/aaaa)."
   - relation: "Escolha uma conta." / "Escolha pelo menos uma permissão."
8. **Counters:** text fields with a limit show "{n}/{max}" once the user is near it (80%).
9. **Trimming:** leading and trailing spaces are removed before validating and sending, as the API
   does; a value of only spaces counts as empty.
10. **Defaults:** fields that have a default in the schema start filled with it and say so when it
    matters ("Hoje").
11. **Server errors on submit:** an error code that points to a field (see `error-messages.md`,
    "field" column) is shown under that field; others show as a form-level message above the
    buttons. The typed data stays.
12. **Leaving with changes:** closing a dialog or navigating away from a form with unsaved changes
    asks "Descartar as alterações?" with "Continuar editando" (default) and "Descartar".
13. **Dependent fields:** a field that depends on another appears only when it applies (e.g.
    "Parcelas" only for a card purchase), and hidden fields are not validated or sent.

## Button contract
**Every button and action states all of this in its screen spec.** A button with no rule is a bug.
A submit button whose spec doesn't give an "Enabled when" follows the default below (disabled
until the form is valid; on edit forms, also until something changed).

| Aspect | Rule |
|---|---|
| Label | A verb that says the outcome: "Salvar conta", "Registrar pagamento", never "OK" or "Enviar" alone |
| Visibility | Hidden if the role lacks the permission (see Permissions) |
| Enabled when | Explicit condition. **Submit buttons stay disabled until the whole form is valid** (every required field filled, every rule met) and, on edit forms, until something changed; also while a request runs. A disabled submit uses `aria-disabled` (it stays focusable) and shows **no** sentence under it (decided with the design, 2026-10-01): tapping it only marks the missing fields and moves focus to the first one, it never sends |
| Loading | While the request runs: spinner inside the button and the label in the gerund ("Entrando…", "Criando conta…", "Trocando senha…"), `aria-busy`; the form's fields read-only and its links paused |
| Waiting | A button that can't act yet counts down with a clock icon and tabular numbers, then releases itself: resend ("Reenviar em 52 s", 60 s after each send) and limits ("Tente de novo em 39:48", from `Retry-After`) |
| Double submit | Impossible: one request per press (RNF-REL-1) |
| Success | Says what happened (a toast or an inline message) and where the user goes next |
| Failure | Maps the error code to a message (`error-messages.md`); keeps the form as it was |
| Confirmation | Required for destructive or hard-to-undo actions (see Destructive actions) |
| Keyboard | Enter submits the form from any single-line field; Esc closes dialogs |
| Hierarchy | One primary button per view; secondary and tertiary (link) styles for the rest; destructive in the danger style, never primary |
| Icon-only | Has a tooltip and an `aria-label` |

## Account screens
The screens with no workspace yet (`AUTH-*`, `INV-01`, `SHELL-01`) use two layouts, always in the
light theme. Drawn in `../../design/account/` and `../../design/design-system/components/`
(`TelaConta`, `Momento`).

| Layout | Used for | Rules |
|---|---|---|
| **Auth screen** | Forms: log in, sign up, forgot and new password, sign up through an invitation | Mobile: a mint block flush with the top of the phone, straight edges, no logo, with the owl scene; it is flexible (160–320 px) and shrinks when an alert or a banner appears, so the form is never cut and fits one screen without scrolling. Then the title (`display`, `text-wrap: balance`), a one-line subtitle (14 px), the fields, the alert above the button, the full-width primary button and a centred footer link. Desktop (≥ 1024 px): mint panel on the left (logo, owl, slogan), the form on the right, at most 400 px wide |
| **Moment** | Screens with no form: waiting, achievements, handoffs, warnings | Full screen, the owl large in the centre, title, short text, actions at the bottom. **Mint** for an achievement or a wait (may show a 3-step track and a dashed "next step" card); **cream** (`sketch-paper`) for a warning or an error, with no exclamation mark, no sparkle and no track. Desktop: the same colour, content grouped in the centre, owl block 400 px, actions at most 400 px |

- The owl scene keeps its base between screens of the same flow; only the object next to the owl
  and its expression change (`../../design/account/motion.md`).
- Button labels and durations never break across lines ("24 horas" with a non-breaking space).
- Arrival messages ("Você saiu.", "Senha trocada…") show under the title with `role="status"`;
  form errors show above the main button with `role="alert"`.

## Feedback
- **Toast** (bottom on mobile, top-right on desktop, 4 s, pausable): confirms an action done away
  from where the user looks, e.g. "Lançamento registrado." Toasts for undoable actions carry
  "Desfazer" (e.g. after moving to the trash). In a full-screen form that stays open after saving
  ("Salvar e registrar outro"), the toast sits just above its buttons.
- **Inline message:** for results the user must read (a form error, "Nada a cobrar deste contato").
- **Banner:** for states of the whole screen (offline, read-only role, session about to expire).
- Never more than one toast at a time about the same thing.

## States of a screen or section
Every screen spec defines each of these:
| State | Rule |
|---|---|
| Loading | Skeletons shaped like the content (not a full-page spinner); keep the previous data while refreshing |
| Empty | A sentence saying why it's empty and the next action, e.g. "Nenhum lançamento neste período." + "Novo lançamento" |
| Error | What failed, the `ref` when it's a 5xx, and "Tentar de novo" |
| No permission | The item is not in the navigation; a direct link shows "Você não tem acesso a esta área. Peça a um administrador do espaço." |
| Partial | A section that fails doesn't take down the rest of the screen |

## Money, dates and amounts
- **Money input:** a numeric field with "R$" as a prefix, `inputmode="decimal"`, accepting
  `1234,56`, `1.234,56` or `1234`; formats on blur; always positive unless the field says
  otherwise; sent as integer cents.
- **Money display:** `formatBrl` (`R$ 1.234,56`). Expenses and money out show with "−" and the
  expense colour; incomes and money in with "+" and the income colour; transfers neutral. The sign
  is always shown, so colour is not the only cue.
- **Date input:** a date picker plus typing `dd/mm/aaaa`; "Hoje" as a shortcut; sent as
  `YYYY-MM-DD`. Where almost everything is recorded on the day (the new entry), the date is three
  shortcuts instead: "Hoje, {dd mmm}" · "Ontem" · "Outra data" (opens the calendar, then shows the
  picked date); the selected one has a 1.5 px ink outline and a bold label.
- **Period picker:** previous and next arrows plus a month list; always shows the range, e.g.
  "5 out – 4 nov".
- **Percentages:** `72%`, no decimals unless below 10% (`4,5%`).

## Visual rules across screens
Decided with the new-entry design (2026-10-10, version 2 on 2026-10-14,
`../../design/entries/decisions.md`) and the accounts design (2026-10-14,
`../../design/accounts/decisions.md`); they hold for every screen, the Home included.

- **Illustrations are never clipped in a circle** (it cut the details at the corners). On white or
  light surfaces (picker fields, list rows, sheets, previews, banners, cards) use the loose versions
  without the paper square (`../../design/assets/ilustracoes/soltas/`), 42–46 px. The paper square
  stays only when the illustration *is* the button (the category grid, an illustration picker),
  where the selected one keeps its paper colour and gets a 2 px `ink` outline and a bold label, like
  every other selection in the app (no full mint tile, which hides the mint inside the drawing, and
  no check mark); and in the dark theme, where the loose drawing's black ink would vanish on a dark
  surface (found while building, 2026-10-14). On a full mint surface (the Home's first KPI, the
  closed period's highlight) the drawing keeps its paper square too, without the circle, because
  its mint would vanish on the mint card.
- **One selection style:** a 2 px `ink` outline and a bold label for every selected or pressed item
  (tiles, chips, month pills, days, member buttons, the tapped chip while its menu is open). No mint
  fill and no check mark. Since the entries list design (2026-10-14) this also holds for the new
  entry's type pills and the chosen month of the period sheet. Only the pills that pick a list
  ("Despesas | Receitas") and the sidebar's current item keep their mint fill.
- **System illustrations:** entries and actions made by the system use drawings in the same hand
  drawn style, never line icons: `fatura-paga`, `transferencia`, `saldo-inicial`, `recebimento`
  (`../../design/assets/ilustracoes/`, paper and loose). Line icons stay for interface controls.
- **KPIs on the phone:** where the desktop shows three or more KPI cards in a row, the phone shows
  the same cards as a carousel with dots, the first at the 16 px margin and the next one peeking
  (Home, Contas, later Planning).
- **Desktop forms:** fields side by side share one height (48 px, the `control` size); only money
  fields are taller. A switch sits beside its label, not at the far edge of the row.
- **Desktop grids:** cards in a row have the same height, their footer at the bottom.
- **Desktop density** (planning round B, 2026-10-15): no large empty areas. Columns in one row share
  their height, and the shorter column gets support content (short rules, history, a summary),
  never filler.
- **Read-only cards:** when a viewer's card loses its grip and "⋯", its inner padding grows to
  16 px, so the drawing never touches the edge.
- **Page margins follow the Home** (decided by the user, 2026-10-14, for every screen, old and
  new): on the phone 16 px at the sides; on the desktop 32 px at the sides, 32 px above the title
  and 48 px under the last block, the content filling the width next to the sidebar up to 1600 px
  (equal margins beyond). Pages whose phone layout runs edge to edge (a month strip) keep the
  desktop margins. The accounts designs drew 28 px on top and stopped at 1184 px; the Home rule
  wins.
- **One action per destination** (decided by the user, 2026-10-14): when two actions of a menu
  open the same screen with no real difference (only the field that gets the focus, say), they
  become one action named after the screen ("Editar cartão", not "Editar ciclo" and "Renomear e
  cor"). The screen shows the person only what they may change, as before.
- **No bottom sheets on the desktop** (decided by the user, 2026-10-14): what slides up from the
  bottom on the phone opens, on the desktop, as a popover under the field or button that asked for
  it (day, month and item pickers) or, when nothing on screen asked for it, as a dialog in the
  middle of the screen ("Mover para"). Action sheets are menus there, as before.
- **Messages name things:** a refused action says which item and why, and offers the way out; the
  web picks the copy by the kind of item (`error-messages.md`).
- **Every list is designed with** loading, empty, error, viewer, many items, archived, its actions
  (sheet on the phone, menu on the desktop, same items in the same order), the undo toast and the
  refused case.
- **Name-to-value lists** (the shares of an entry, who owes what): a dotted leader between the name
  and the value when rows are separated only by a gap; values in one column, the total aligned to
  them. Lists whose rows are split by dividers (the installments) have no leader. On desktop these
  lists take the full width of their container. When such a list closes with a total (the shares
  in an entry's detail, ending in "Sua parte"), the line before the total is solid, not dashed.
- **Forms over a screen** (full screen on the phone, a dialog on the desktop): the body sits on the
  page colour, so the white fields stand out, and the footer of buttons is white with a top border.
  Field labels are 14 px medium (500), as in the design system; the selected option of a choice is
  semibold.
- **Toasts** are an ink card with white text and a mint action; a confirmation carries the mint
  check. On the phone they sit above the tab bar, or above a form's buttons, and the floating "+"
  moves up while one shows.

## Lists, pickers and long content
Decided by the user on 2026-10-14, for every screen, built or to be built.

- **Lists that grow over time** (entries, the lines of an invoice, the trash, the history) load 50
  items at a time and end with a "Mostrar mais" button; no page numbers. Search and filters ask the
  API, never only what is already on screen. Lists that stay small by nature (accounts,
  categories, cards, contacts, a card's invoices) load whole.
- **A menu opened from a field** (picker, select, suggestions) is as wide as the field, at least
  288 px and at most 480 px. A field narrower than that keeps the menu's start aligned with it and
  lets the menu grow towards the side with room.
- **No browser-made controls.** Every choice field uses the app's picker (a sheet on the phone, a
  menu under the field on the desktop), never the browser's `select`; every date uses the app's
  calendar (month with arrows, weeks from Sunday, days in a grid, today marked, the chosen day with
  the selection outline), never the browser's date picker. A range (the entries' "Escolher datas")
  outlines its first and last day and puts the days between on `sunken`.
- **Nothing on the desktop depends on swiping.** A strip that scrolls sideways (the invoice
  months, "Repetir um recente") gets ‹ › arrows at its ends on the desktop, shown only while there
  is more on that side; the wheel and the touchpad keep scrolling it.
- **Many items in a card or a list:** a card of the Home shows at most 5 items, and its footer link
  ("Ver contas fixas", "Ver cartões", "Ver metas") opens the whole list; a
  row of chips shows what fits on one line and "+N mais"; a list of more than 12 items (the
  categories, on their page and in the picker) gets a search on top; pickers show the most used first, with their search.
- **Lists inside a dialog or a sheet** (the invoices to pay, the contacts to choose) show at most 5
  items, the most relevant first (the oldest invoice with something due), then "Mostrar mais
  ({n})"; more than 10 items add a search on top.

## Long text
Decided with the planning design (2026-10-15), for every screen, built or to be built. Tested with
long names ("Internet fibra 1 giga com TV e telefone", "Conta Conjunta do Banco Exemplo") and
7-digit amounts.

- **A list item's name** takes at most 2 lines, then "…"; its **second line** at most 2 lines,
  then "…". **The amount never wraps and is never cut**: the text on the left shrinks instead.
- **Status badges** ("Atrasado", "Pago", "Hoje"…) start the second line; they never sit beside the
  name.
- **"R$ X de R$ Y"** beside a name moves whole to the next line when it does not fit; it never
  breaks in the middle.
- **A second line listing several items with values** shows what fits on one line + "+N", which
  opens the full list.
- **A note that explains a value** (an adjusted date) goes on its own line, never over the value.
- **Desktop table cells** are one line with "…"; the name column may take 2 lines. The full text
  is in the detail.
- **Cards with a coloured border** (overdue) get a larger inner padding than plain lists.

## Permissions in the UI
- The member's permissions come from `GET /api/workspaces/:workspaceId`. Each action in a screen
  spec names its permission (`module:action`, e.g. `entries:create`).
- Without `view` on a module, its navigation item and screens are hidden.
- Without the action's permission, the button or menu item is hidden (not disabled), unless hiding
  it would confuse; then it is disabled with a tooltip saying why.
- A viewer sees a discreet banner: "Você está vendo este espaço sem poder alterar nada."
- A `403 PERMISSION_DENIED` from the API (the role changed meanwhile) shows its message and
  refreshes the permissions.

## Destructive actions
- **Restorable deletes** (entries and accounts, which have a trash and a restore route): no
  dialog; the toast offers "Desfazer" for 8 s, and the item can be restored from the trash.
- **Deletes with no restore in the UI** (contacts, recurrences, goals, holidays, roles; the rows
  are kept for history but there is no restore route) and **irreversible or wide actions** (remove
  a member, leave the workspace, revoke an invitation, cancel a charge, replace the commission
  split): a dialog that names the thing and the consequence, e.g. "Remover Member B do espaço? A
  pessoa perde o acesso na hora." The confirm button repeats the verb ("Remover membro"), is in the
  danger style, and is not the default focus.
- An optional reason field ("Motivo") where the API accepts one (deletions), up to its limit.

## API errors
Every response error has the shape `{ "error": { "code", "message", "ref" } }`, with `details` when the screen needs them (the reason a restore was refused).
- The UI shows the pt-BR message for the `code` from `error-messages.md`, never the API's
  `message`, which is English and for developers.
- Unknown codes fall back to "Não foi possível concluir. Tente de novo." plus the `ref`.
- 5xx always shows the `ref`: "Algo deu errado. Código: {ref}."
- 429 shows the wait the API gives (`Retry-After`), e.g. "Muitas tentativas. Tente de novo em 15
  minutos.", as a warning above the button, and the button counts down until it releases
  (Button contract → Waiting).
