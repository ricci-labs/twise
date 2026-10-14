---
summary: How web components are layered and built — shadcn primitives, design-system components with one folder each (variants, types, copy, tests, examples), the props contract, forms, icons, copy, the workbench, tests and lint.
read_when: Creating, changing or using any component in apps/web; adding a shadcn component; building a form; reviewing a web PR.
updated: 2026-10-14
---

# Web components

Decision: ADR 0027. Tokens: `web-design-tokens.md`. What the components must contain and every
state they show: `../product/requirements/design-system-brief.md` and `../product/requirements/ui-standards.md`.

## Layers
| Layer | Path | Holds | May import |
|---|---|---|---|
| 1. Primitives | `src/components/ui/` | shadcn components (Base UI), kept close to upstream | `lib/`, tokens |
| 2. Design system | `src/components/<family>/<component>/` | Our components: shadcn re-exported or composed, plus finance patterns | layer 1, other design-system components, `lib/`, `hooks/`, `@financas/shared` |
| 3. Features | `src/features/<feature>/components/` | Screens' building blocks with data and copy of one feature | layer 2, its own feature, `lib/`, `hooks/`, shared |
| 4. Routes | `src/routes/` | Compose features into pages (`web-application.md`) | features' `index.ts`, layer 2 |

- **Features and routes never import `components/ui`.** A primitive they need is exposed by a
  design-system component, even as a plain re-export (`export { Button } from
  '@web/components/ui/button'`). That gives one import surface, and a later wrapper changes nothing
  in the callers.
- **Wrap only when it adds something:** domain meaning (`Amount`), fixed copy (`PasswordInput`'s
  toggle labels), a smaller API, or a rule from `../product/requirements/ui-standards.md` (`SubmitButton`).
- **A component used by two features moves to layer 2.** Features never import each other.
- Enforced by depcruise (`dependency-rules.md` → Web).

## Families
Layer 2 is grouped by the families of the brief. Each component name says what it shows, never
where it's used.

| Family | Components (from the brief) |
|---|---|
| `actions/` | `Button`, `IconButton`, `SubmitButton`, `FloatingActionButton`, `ActionMenu`, `SegmentedControl` |
| `inputs/` | `TextInput`, `PasswordInput`, `EmailInput`, `PhoneInput`, `SearchInput`, `TextArea`, `MoneyInput`, `ChoiceChips`, `PickerField`, `PickerSheet`, `Stepper`, `RadioCardList`, `DateInput`, `PeriodPicker`, `Select`, `Combobox`, `Checkbox`, `RadioGroup`, `Switch`, `DayOfMonthPicker`, `FileUpload`, `ColorSwatch` |
| `forms/` | `Form`, `FormField`, `FormErrorSummary`, `FormFooter`, `RequiredLegend` |
| `feedback/` | `Toast`, `InlineAlert`, `AutoFillTip`, `Banner`, `ConfirmDialog`, `EmptyState`, `Skeleton`, `ErrorState` |
| `display/` | `Amount`, `StatusBadge`, `Avatar`, `ListItem`, `Card`, `StatCard`, `ThresholdProgress`, `Tabs`, `Accordion`, `DataList` (table on desktop, list on mobile), `LoadMore`, `Tooltip`, `HelpPopover`, `FilterChips`, `CategoryIcon` |
| `charts/` | `BarChart`, `ForecastChart`, `DonutChart`, each with its text alternative |
| `navigation/` | `BottomBar`, `Sidebar`, `TopBar`, `WorkspaceSwitcher`, `BackLink`, `Breadcrumb` |
| `layout/` | `AppShell`, `FormOverlay`, `Page`, `PageHeader`, `Section`, `Stack`, `Grid` |
| `finance/` | `StatHero`, `InsightCard`, `InvoiceCard`, `InvoicePreview`, `SharesList`, `RecentEntries`, `EntryRow`, `OccurrenceRow`, `ContactRow`, `ChargePreview`, `AmountSplitEditor` |
| `brand/` | `Logo`, `OwlScene` (the layered owl scenes and their motion), `AppSplash` |
| `icons/` | `TwiseIcon` and the icon registries (see Icons) |

`finance/` holds patterns with no data fetching: they take props and render. The feature passes
the data.

## One folder per component
**Everything a shared component is made of lives in its folder, once.**

```
components/display/amount/
├── amount.tsx            # the component; markup and wiring only
├── amount.variants.ts    # the cva recipe: every size, tone and state
├── amount.types.ts       # props and any other type
├── amount.messages.ts    # its pt-BR copy (labels, aria-labels, units)
├── amount.examples.tsx   # every variant and state, for the workbench
├── amount.test.tsx       # behaviour and accessibility
└── index.ts              # the public surface: component + props type
```

| File | Rule |
|---|---|
| `<name>.tsx` | One exported component (compound parts are extra named exports: `Card`, `CardHeader`). No class strings beyond layout glue; appearance comes from the recipe |
| `<name>.variants.ts` | `cva` recipes only, with `defaultVariants` always set. One recipe per part for multi-part components |
| `<name>.types.ts` | Props extend the native element's props (`ComponentProps<'button'>`) plus `VariantProps<typeof nameVariants>` |
| `<name>.messages.ts` | A typed `as const` object; interpolation through functions (`installmentLabel(3, 10)`) |
| `<name>.examples.tsx` | A list of named examples; the only place outside tests that may hard-code copy and amounts (placeholders only, RNF-PRIV-2) |
| `<name>.test.tsx` | Each state of the brief that has behaviour, plus the axe check (`<name>.test.ts` for pure logic, run in Node) |
| `index.ts` | What features import. Nothing else from the folder is imported from outside |

Files are created only when needed (a component with no copy has no `.messages.ts`), always with
these names. `lint:file-roles` checks the names; depcruise checks that only `index.ts` is imported
from outside.

## Props contract
- **Variant props:** `variant` (visual weight: `primary`, `secondary`, `outline`, `subtle`,
  `tertiary`, `danger`; `surface: 'mint'` for buttons on a mint moment),
  `size` (`sm`, `md`, `lg`), `tone` (meaning: `income`, `expense`, `neutral`, a status). Same names
  in every component.
- **`className` is for placement only** (margin, width, grid position). A different look is a new
  variant in the recipe, never a class passed from a feature.
- **States come from attributes, not extra props:** `disabled`, `aria-invalid`, `aria-busy`,
  `aria-disabled`, `data-state`. The recipe styles them with Tailwind's `aria-*:` and `data-*:`
  variants, so the visual state and the accessible state can't drift.
- **`ref` is a normal prop** (React 19); no `forwardRef`.
- **`data-slot="<name>"`** on the root and on each part, as shadcn does, so a parent can style a
  child part (`[&_[data-slot=icon]]:size-4`) without new props.
- **Polymorphism** only through Base UI's composition prop (`render`); no `as` prop.
- **Copy has a default** from `.messages.ts` and can be overridden by a prop when the screen spec
  gives its own text.

## Variants
- `cva` (class-variance-authority) is the only variant API, the one shadcn generates. No
  tailwind-variants, no ad-hoc `Record<variant, string>` maps.
- Classes are joined with `cn()` from `lib/cn.ts` (shadcn's `cn` engine), which merges conflicts.
  It is created with our theme's utility names (`lib/tokens.ts` reads them from `theme.css`, the
  same source as Tailwind), so `text-button` and `text-on-action-primary` are known as a type style
  and a colour; the stock `cn` would drop one of them as a conflict.
- Compound states use `compoundVariants` (`{ variant: 'danger', size: 'sm', class: … }`).
- Every class in a recipe is a token utility (`web-design-tokens.md` → The rule).

## Forms
React Hook Form v7 + `zodResolver` with the **schemas from `@financas/shared`** (ADR 0005,
`../product/requirements/ui-standards.md` → Forms and validation). RHF v8 waits until it's stable.

- `useSchemaForm({ schema, requiredMessages, defaultValues })` (`lib/forms/use-schema-form.ts`) is
  `useForm` with `zodResolver(schema)` and `mode: 'onTouched'`: validates on the first blur, then
  on every change, which is the rule decided on 2026-09-29.
- **Messages in pt-BR without touching the shared schemas** (the API keeps them as they are):
  `fieldErrorMap(requiredMessages)` (`lib/forms/field-errors.ts`) is passed to the parse, and turns
  each Zod issue into the `../product/requirements/ui-standards.md` sentence: an empty value (after trimming) → the field's
  own "Informe…" from `requiredMessages`, `too_small`/`too_big` → "Use pelo menos/no máximo {n}
  caracteres.", an invalid e-mail → "Informe um e-mail válido, como nome@exemplo.com.". A web-only
  rule (the password confirmation) writes its pt-BR message in its own web schema.
- `Form` provides the form (`FormProvider` + `<form noValidate>`, so Enter submits from any field);
  `FormField` is the only way to render a field. It wires the visible label, the "*" for required
  fields (`aria-hidden`; the input gets `required`), the help text **before** the input, the error
  with its icon in an `aria-live` region, `aria-invalid`, `aria-describedby` (help + error ids from
  `useId`), the counter from 80% of `maxLength`, and `readOnly` while the form is submitting. It
  hands the input its props through a render function:
  `<FormField name="email" label="E-mail" isRequired>{(control) => <TextInput {...control} />}</FormField>`.
- Fields go through `useController`, and `onBlur` is always passed down, or `onTouched` stops
  working. Components below the form read its state with `useFormState`, never
  `useFormContext().formState`, which doesn't subscribe a child to changes (the submit button
  stayed disabled with a valid form until this was fixed).
- **A blur caused by a press waits for the press to end** (`afterPointerRelease`,
  `lib/forms/after-pointer-release.ts`). Pressing a link below a field moves the focus out of it at
  once; showing the error right then pushed the link down, the press ended somewhere else and the
  browser dropped the click, so "Esqueci minha senha" or "Criar conta" needed two taps (seen
  2026-10-02). With the keyboard (Tab) the error still shows at once.
- Read live values with `useWatch`, never `form.watch()` (it opts the component out of the React
  Compiler).
- `SubmitButton` implements the button contract: disabled until valid (and changed, with
  `requiresChange`, on edit forms) with `aria-disabled` and no hint sentence; pressing it then runs
  `trigger(undefined, { shouldFocus: true })`, which marks the missing fields and focuses the first.
  The spinner with the gerund label while submitting, one request per press, and `isBlocked` for
  outside reasons (offline). Waiting is the `Button`'s `waitUntil` prop.
- `PasswordInput`'s toggle is named "Mostrar senha" / "Ocultar senha" (visible "Mostrar"/"Ocultar"
  plus a screen-reader-only "senha"), so its accessible name always contains its visible label
  (WCAG 2.5.3); it doesn't take the focus from the field.
- Server errors: `applyApiError(form, error)` (`lib/errors/`) puts a code with a field in the
  "Shown as" column of `../product/requirements/error-messages.md` under that field with `setError`, and the rest above the
  buttons.

## Feedback
- `Alert` (`tone`: info, success, warning, danger; always with its icon): form errors above the
  main button with `isUrgent` (`role="alert"`), arrival messages under the title without it
  (`role="status"`); an `action` slot takes a small `subtle` button or the message holds a
  `TextLink` with `tone="inherit"`.
- `Banner`: a full-width ink strip for states of the whole screen; `OfflineBanner` shows it with the
  catalog's network message while the device is offline.
  It takes an optional `action` at the end (the update banner's "Atualizar").
- `Tip`: one centred line of help with the Info icon, in the colour of its background's text.
- Toasts: `showToast(message, { action, tone })` with the `Toaster` mounted once in `AppProviders`
  (`sonner`, styled with tokens): an ink card (`action-primary`) with 15 px text, the action bold and
  underlined in `accent-on-primary`; `tone: 'success'` adds the mint check before the text. On phones
  at the bottom, 16 px from the sides, lifted over the tab bar and, while a `FormOverlay` is open,
  over its buttons (`styles/toast-placement.css`, which also lifts the floating "+" while a toast
  shows); top-right and 400 px wide from 1024 px. 4 s, or 8 s with an action. Toasts with the same
  message replace each other (never two about the same thing).

## Brand and illustrations
- The owl scenes and the logo are SVG files in `apps/web/src/assets/` (`owls/`, `brand/`), copied
  from `docs/design/assets/` with English names (`coruja-boas-vindas` → `owls/welcome.svg`…). Vite
  ships each as its own hashed file, loaded only by the screen that shows it, so they never weigh on
  the JavaScript bundle. A new or changed drawing is copied again from the design package.
- `OwlScene` draws a scene by name (`welcome`, `wait`, `envelope`, `offline`, `signUp`,
  `confirmed`, `key`, `linkExpired`, `closed`, `invitation`, `together`) as a decorative image.
- **Owl motion** (`docs/design/account/motion.md`) plays on the layered kits, the only drawings
  made for it: `OwlKit` (`components/brand/owl-kit`) draws one inline (`confirm`,
  `confirm-expired`, `invitation`, `sign-up-sent`, `forgot-sent`, `reset-expired`, `closed`; the
  files are `assets/owl-kits/`, copied from `docs/design/assets/corujas-em-camadas/`). Each kit is
  its own chunk, loaded when shown (`preloadOwlKits` ahead of an event), with the still scene in
  its place meanwhile. An arrival kit plays on mount; an event kit waits in `phase="before"` (the
  hourglass turning while the API works) and plays when it flips to `"after"`.
- **Static screens have entrances too:** `OwlEntrance` (`components/brand/owl-entrance`) plays the
  entrance kit of a scene (`entrance-welcome`, `entrance-sign-up`, `entrance-key`,
  `entrance-offline`, `entrance-wait`, `entrance-link-expired`, `entrance-invitation`,
  `entrance-together`, `entrance-envelope`), from the design's entrance kits, which are drawn with the
  static scenes' strokes, so the last frame is the static image. `AuthLayout` plays it only on the
  scene's first opening in the session (`isOncePerSession`), but a scene that comes in later, such
  as waiting or offline, always plays. `MomentScreen` plays it on every mount; `isStill` keeps a
  warning still (the invitation for another email). Until a kit's chunk arrives, the owl block stays
  empty rather than flashing the static image. A scene with no entrance kit (`confirmed`) shows its
  static image. The kit box has the drawings' 6:5 proportion (`aspect-owl`), so it sizes like the
  image it replaces.
- **The sequences are generated, not written:** `pnpm gen:owl-motion`
  (`scripts/generate-owl-motion.mjs`) reads the design's looped demos
  (`docs/design/account/animations/*.html`), keeps each kit's window from its event to its last
  change and writes one-shot keyframes to `styles/owl-motion.gen.css`, with the designed timings
  and easings. It also writes when each moment's text and actions come in
  (`--moment-text-delay`, `--moment-actions-delay`). `pnpm check:owl-motion` (in `pnpm check`)
  fails when the file drifts from the demos. The brand owl of the app opening comes from the same
  generator.
- With `prefers-reduced-motion`, every duration and delay is zero (`globals.css`), so each
  sequence shows its final state at once.
- `Logo` is the full logo or the icon, named "twise" for screen readers.
- `Spinner` (`components/feedback/spinner`, `sm`/`md`/`lg`) is the one spinner: buttons, the
  step track, the app opening and "Abrindo o espaço…" all use it.
- `StepTrack` is the 3-step journey of the moments: an `<ol>` with `aria-label`, the current step
  with `aria-current="step"` (a spinner while it loads), a solid line up to it and a dashed one
  after (no rounding on the dashed line, which Chrome would draw solid).

## App shell
`docs/design/home/` → Layouts. Presentational; the workspace feature gives them the items.
- `NavItem` (`components/navigation/nav-link`): `{ key, label, icon, render, isCurrent }`. `render`
  is the element that navigates (a router `Link`, or a `button` for "Mais"); `NavLink` draws it
  with the Twise icon (mint fill when current) and forwards any props, so it can be a tooltip
  trigger. `aria-current="page"` marks the current item.
- `AppSidebar`: 264 px (`w-66`) with the logo, the collapse button (`chevrons-left`), the primary
  action ("Novo lançamento"), the items, the group "Mais" and a `foot` slot (workspace switcher and
  account); collapsed, 76 px (`w-19`) of icons that keep their names (`aria-label`) with a tooltip
  on hover, the owl logo, a round "+" and a divider for "Mais". It's sticky at the window height.
  The collapsed state is the caller's (`isCollapsed`, `onToggle`).
- `BottomTabBar`: the phone's five items, fixed at the bottom with the safe area (`pb-safe`);
  current item bold with a short mint bar under the label; hidden from 1024 px.
- `AppShell` (`components/layout/app-shell`): the sidebar from 1024 px, the content (with an
  optional `banner` on top) and, on the phone, the bottom bar and an optional floating action.
## Charts
`docs/design/home/` → Rules: shadcn/ui's look on Recharts, the validated blue (`chart-4`), green
(`chart-2`) and amber (`chart-3`), the forecast line in `mint-ink` over a mint gradient, negative
stretches in the danger colour. Each chart is a `figure` whose drawing is `aria-hidden` and whose
`figcaption` says the same in words (the text alternative the requirements ask for).
- **No shadcn `chart.tsx`:** its `ChartStyle` writes a `<style>` element, which the CSP blocks (as
  it did Sonner's). Colours go on the SVG as `var(--color-…)` attributes or token classes
  (`fill-ink`, `stroke-chart-2`), and Recharts' own focusable layer is off (`accessibilityLayer`
  `false`), since the figure carries the meaning.
- Recharts is imported only by `ForecastChart` and `CommittedChart`, reached from the Home route's
  chunk, so it stays out of the initial bundle.
- `ForecastChart` (`components/charts/forecast-chart`): step area of one account's balance, dashed
  zero line, the lowest point marked and named under the chart.
- `CommittedChart` (`components/charts/committed-chart`): stacked bars of installments and bills
  as a share of the fixed income, the share above each bar, a dashed line at the limit (70%) and
  the months at or above it in amber.
- `PaceRing`, `ProgressBar` and `IncomeBar` (`components/charts/`): plain SVG, since a width that
  comes from data can't be a token class and `style` is not allowed: the two rings of the pace
  (income used, time gone; one ring and a `sm` size for the reserve), the budget bar with the pace mark (`within`, `ahead`, `over`), and the
  100% bar of where the income goes with its legend.

## Home motion
`docs/design/home/motion.md`. CSS only (`styles/home-motion.css`, timings from `semantic.css`:
`--duration-enter`, `--stagger`, `--duration-chart`, `--duration-fill`, `--duration-sway`); charts
use Recharts' own animation. The page sets `data-entrance="play"` only on the first Home of the
session (`useFirstTimeThisSession`): the KPIs rise one after another (60 ms apart), then the cards
together. Rings sweep and budget bars fill whenever they mount. While another period loads, the
old numbers stay at reduced opacity (`data-stale`, `aria-busy`). A red "Livre para gastar" sways its
piggy bank once. `prefers-reduced-motion` zeroes all of it (`globals.css`).
- The WS-01 owl plays the design's "Construir" entrance (`entrance-space`, generated from
  `docs/design/home/animations/Animacao-criar-espaco.html` by `pnpm gen:owl-motion`, which now reads
  demos from both design folders).

## Menus, sheets and avatars
- `ActionMenu` (`components/actions/action-menu`, Base UI `Menu`): a `trigger` element and `groups`
  of items (separators between groups), each a link (`render`) or an action (`onSelect`), with an
  optional Twise icon, a `detail` line and `isCurrent` (check mark). Keyboard and Escape come from
  Base UI. Desktop popovers of the shell: the account menu and the workspace switcher.
- `Sheet` (`components/layout/sheet`, Base UI `Drawer`): a titled dialog from the bottom with a
  handle, a dimmed backdrop and the safe area; the phone's "Mais" and workspace switcher. The
  content keeps 16 px from the sides, the title 20 px; a list may bleed to 8 px (the picker rows).
  With `closeLabel`, the title is the display `title` and "X" sits 8 px from the edge.
- `Avatar` (`components/display/avatar`): the initial of a name in a circle (`mint` or `paper`),
  decorative: the name is always written next to it or in the control's label.

## Home building blocks
`docs/design/home/` → Rules and `../design/home/components.md`. They take formatted pieces; the Home feature
passes the overview's numbers.
- `Amount` (`components/display/amount`): cents → "R$ 1.234,56" through `formatBrl`, the true minus
  "−", "+" only with `sign="always"`, never wrapping, tabular figures; sizes `inherit` (the
  surrounding text's, for an amount inside a sentence or a card's second line), `sm`, `md`, `lg`,
  `kpi` (30 px, display font) and `hero`; `isCentsRaised` lifts ",00" (`text-cents`).
- `Card` (`components/display/card`): a region named by its `h2` title, an optional description
  and `headerAction` (tabs), the body, and a footer with a stat on the left and a link on the
  right when given. Rows of cards stretch to the same height.
- `KpiCard` + `KpiBadge` (`components/display/kpi-card`): label (`h3`) with an optional help
  slot, the value, a badge and the foot lines (`children`); `tone` `plain`, `mint` (the first
  card) or `danger` (passed the plan); `art` sits at the bottom right and the foot keeps clear of
  it.
- `KpiCarousel` (`components/display/kpi-carousel`): on the phone a scroll-snap row of 300 px
  cards (the next one peeks), each slide a group read as "2 de 4", dots that are buttons and
  follow the swipe; from 1024 px a row of four.
- `SegmentedControl` (`components/actions/segmented-control`, Base UI `ToggleGroup`): one option
  pressed at a time (`aria-pressed`), e.g. the forecast's account tabs.
- `Badge` (`components/display/badge`): a short status pill (`neutral`, `info`, `success`,
  `warning`, `danger`), e.g. "Período encerrado".
- `HelpPopover` (`components/display/help-popover`): the "?" next to a number ("O que é {topic}?"),
  a Base UI popover with the plain-words explanation; Escape and a press outside close it.
- `SectionSkeleton`, `SectionError` and `EmptyState` (`components/feedback/`): one per section.
  The skeleton is a `status` with "Carregando…" for screen readers and decorative blocks that
  stop pulsing with reduced motion; the error says what failed, "Código: {ref}" and "Tentar de
  novo" for that section only; the empty state is an illustration in a soft circle and one line
  on the card itself, with an optional action.

## New entry building blocks
`../design/entries/components.md` names the pieces of the `ENT-02` form; several of them are one
component here, so the form, and later the account, card and planning forms, share them.
- `MoneyInput` (`components/inputs/money-input`, the design's `MoneyField`): "R$" before the
  amount, `inputmode="decimal"`, the typed text kept as typed and tidied on blur ("1234,5" →
  "1.234,50", `lib/format/money.ts`); text that isn't an amount stays as typed so the form can say
  what's wrong. Sizes `sm` (a share row), `md` and `lg` (the entry's amount, 64 px, display font);
  `isNegative` puts "−" and the danger colour on it (opening balance). It speaks the `FormField`
  control contract (`value` text, `onChange({ target: { value } })`, `onBlur`).
- `ChoiceChips` (`components/inputs/choice-chips`, Base UI `RadioGroup`): one choice among a few,
  all visible, as radios (arrow keys move the choice). `variant` `pill` (the entry types, chosen in
  `mint`), `outline` (the date shortcuts, chosen with an ink outline; 48 px from 1024 px) and `card`
  (who spent, two cards with an initial). An option can open a dialog (`opensDialog`,
  `aria-haspopup`) and carry an icon (`calendar` before the label, `chevron` after it); `onSelect`
  fires for every press, even on the chosen option, so "Mais" and "Outra data" reopen their sheet.
- `PickerField` (`components/inputs/picker-field`): the field of an account, card, category or
  contact: a button named by its `FormField` label that opens a dialog, with the drawing, the name
  and a grey second line ("Saldo de hoje: R$ 4.200,00"); a subcategory reads with its parent
  (`parentLabel`: "Mercado › Feira", the separator in `ink-subtle`); empty, a dashed "+" square and
  the placeholder. 56 px on the phone, 48 px from 1024 px; the drawing (42 px) overhangs the padding
  instead of growing the field. A filled field reads in `choice` semibold.
- `PickerSheet` (`components/inputs/picker-sheet`): what a `PickerField` opens. A bottom `Sheet`
  with "Fechar" on the phone; from 1024 px a popover anchored to the field (`anchor`), above a
  dialog. `layout` `list` (rows with the drawing and the detail, 8 px from the sheet's sides, the
  current one on `mint-soft` with a check) or `grid` (the category tiles on paper; the current one keeps its paper and gets a 2 px
  sketch-ink outline and a bold label, no mint and no check). An item with `children` shows "N sub";
  pressing it opens the row "Em {mãe}" below the grid with "Só {mãe}" and the children as chips.
  `searchLabel` adds a 44 px search (with its icon) that ignores case and accents and also finds children,
  shown "em {mãe}" with the parent's drawing; `empty` replaces the list with the drawing, a sentence
  and, when it has `actionLabel` and `onAction`, the primary action ("Cadastrar conta"). A pick calls
  `onSelect` and closes. On the desktop the popover sits on the `modal` layer, over a `FormOverlay`.
- `Stepper` (`components/inputs/stepper`, the design's `InstallmentStepper`): "−  3×  +" between
  `min` and `max` (the ends disable their button), the shown value given by the caller ("À vista"
  for 1), an `output` read when it changes, and an optional line beside it with `**bold**` ("3× de
  **R$ 333,34**", "de 10"). The aria-labels are the screen's ("Menos uma parcela", "Parcela
  anterior").
- `Switch` (`components/inputs/switch`, Base UI `Switch`, the design's `InProgressSwitch`): the
  label beside the switch, which the label also turns; on the desktop the switch sits right after
  its label, not at the far edge (`../product/requirements/ui-standards.md` → Visual rules).
- `RadioCardList` (`components/inputs/radio-card-list`, Base UI `RadioGroup`, the design's
  `InvoiceRadioList`): one choice among rows with a radio dot, a title, a detail with `**bold**`
  ("Falta pagar **R$ 1.950,00**") and an optional status badge; the chosen row gets the ink outline.
- `InvoicePreview` (`components/finance/invoice-preview`): the sunken box under the card with the
  calendar drawing, the sentence ("A 1ª parcela entra na fatura que vence em **04/11**.") and, with
  more than one installment or a closed invoice, one row per installment ("1/3 · vence 04/11 · R$
  333,34", split by dividers, no leader); a closed one is struck through with "Fechada"; `more` adds
  "+ N parcelas, até…". A `status` region, so changes are announced. The screen computes the rows
  with the shared billing rules and passes them.
- `SharesList` + `SharesCollapsed` (`components/finance/shares-list`): "Dividir com contatos".
  Collapsed, a dashed pill. Open, the title with the quick fills "Metade" and "Dividir igualmente",
  one row per contact (initial, name, a dotted leader, a `sm` `MoneyInput` named "Parte de {nome}",
  "×" to take them out), the error under the rows, "Adicionar contato" (disabled at the limit), and,
  after a dashed divider, "Sua parte" with its value in the same column (blank while the sum passes
  the total). The screen owns the amounts and the rules; the list only shows them.
- `RecentEntries` (`components/finance/recent-entries`): "Repetir um recente", a row of cards that
  scrolls sideways from the 16 px margin (the last one peeking): the drawing, the description and
  the last amount; the picked card is `aria-pressed` with the ink outline. Nothing renders when
  there is nothing to repeat.
- `AutoFillTip` (`components/feedback/auto-fill-tip`): the discreet line under a field that says
  what was filled for the person, with a mint check and "Desfazer" on the right; a `status`, so it
  is announced.
- `Button` `quiet`: a transparent button with ink text that turns `sunken` on hover; the phone's
  second action under the main one ("Salvar e registrar outro", with size `touch`: 44 px, the
  smallest touch target, where the design draws it lower) and the desktop's "Cancelar" at the left
  of a form footer.
- `Select` (`components/inputs/select`): a native `select` drawn like the fields (the phone's own
  picker opens), with an optional empty first choice; `TextArea` (`components/inputs/text-area`):
  the notes field, two lines to start. Both take the `FormField` control.
- `ConfirmDialog` (`components/feedback/confirm-dialog`, Base UI `AlertDialog`): the title, what
  will happen, the secondary "keep" action and the danger one side by side (keep on the left; they
  share the width on the phone and sit at the right, 440 px wide, on the desktop), as
  `../product/requirements/ui-standards.md` → Destructive actions and the discard rule ask
  ("Descartar as alterações?").
- `FormOverlay` (`components/layout/form-overlay`, Base UI `Dialog`): a form that opens over the
  screen: full screen on the phone (no tab bar), with "X" and the title on top; from 1024 px a
  dialog 880 px wide, 40 px from the top, over the dimmed page, the title on the left and "X" on the
  right (a 20 px "X"; the title in `form-title`, `form-title-lg` on the desktop). The body sits on
  the page colour and scrolls above the white footer of buttons, which has a top border; on the
  phone the header scrolls away with it, on the desktop it stays on top. "X", Escape and a press outside all call `onRequestClose`, so the screen decides
  whether to ask before discarding. With `onSubmit` the body and footer are a `form` inside the
  dialog (submit buttons in the footer and Enter submit it); `initialFocus` names the field that
  takes the focus when it opens (the amount).
- `CategoryArt` (`components/display/category-art`): the category drawing of an account's `icon`,
  never clipped in a circle (`../product/requirements/ui-standards.md` → Visual rules across
  screens). By default (`loose`) it is the drawing without its paper square, from
  `assets/illustrations/loose/` (copied from `docs/design/assets/ilustracoes/soltas/`), for white
  surfaces; in the dark theme it switches to the drawing on its paper square, since the loose black
  ink would vanish. `onLight` keeps the loose drawing in both themes, for a surface that is always
  light (the paper or mint tiles of the category grid). Sizes `sm` 32, `md` 42, `lg` 46, `xl` 64 and
  `2xl` 88 px. A drawing with no loose version uses its paper one; no icon shows the
  initial on a paper square.

## Account layouts
- `AuthLayout` (`components/layout/auth-layout`): the auth screen of
  `../product/requirements/ui-standards.md` → Account screens. On phones, a mint block with the
  owl, flexible from 160 to 320 px, then the title, subtitle, `notice`, the form and the footer
  link, in a 400 px column; an optional `banner` on top. From 1024 px, a mint panel on the left
  (logo, owl, "Leve, claro, a dois." and its support sentence) and the form on the right.
- `MomentScreen` motion: it takes a `scene` or a `kit`; its text and actions come in again when the
  title changes ("Trocar texto": 8 px down and in, 250 ms; "Subir ações": 16 px, 300 ms), inside
  the persistent `aria-live` body, so the new state is still announced. The old text is replaced,
  not faded out.
- `MomentScreen`: a full screen with no form, `tone` `celebrate` (mint) or `calm` (cream), the
  owl, the title, the body (`aria-live`, since the same page changes state in place) and the
  actions last; centred on desktop with a 400 px owl block. A page whose state changes on its own
  (`/verify-email`) renders one `MomentScreen` from every branch, so React keeps the element: the
  title change is announced and the background fades from mint to cream. An optional `banner`
  (the offline banner) sits on top, edge to edge, and takes no room when it renders nothing.
- `NextStepCard`: the dashed "what comes next" card of the celebratory moments.
- `Divider` (`components/display/divider`): a label between two thin lines ("Ainda não
  confirmou?"); `surface` `page` or `paper` (cream moments, `sketch-line`).
- `AppSplash`: the app opening, mint with the brand owl, "twise" and the slogan; `isSlow` adds
  "Abrindo…". The brand owl file keeps its animation layers, with the sleep and wink layers
  hidden (their final state).
- All three call `useLightTheme()`: account screens are always light, whatever the person chose,
  and the chosen theme comes back when they leave.
- They are page components: each screen renders its layout. The design keeps the owl block
  mounted between log in, sign up and the password screens so only the object changes, but no
  layered kit exists for those changes (welcome → form card → key), so lifting `AuthLayout` into
  the `_auth` route would change nothing visible yet; it waits for those kits.

## Icons
- **The Twise set** (`components/icons/twise-icon`, from `docs/design/assets/icones/`) draws every
  icon of the navigation, the menus and the alerts: `<TwiseIcon name="home" tone="selected" />`.
  Two layers: the stroke in `currentColor` and an inner fill that shows only when `tone` asks for
  it (`selected`: ink stroke, mint fill; `danger`, `warning`, `info`, `success`: the alert colour
  and its soft fill; `muted` and `inherit`: no fill). Always decorative (`aria-hidden`); the
  control around it carries the name. A new design icon is added to its shape map by hand from the
  SVG, keeping the two layers.
- `lucide-react` only for small utility glyphs (chevrons, close, the period calendar, the sidebar
  collapse), named imports only (each icon is its own module). Never the `icons` namespace or
  `DynamicIcon`, which pull in the whole set.
- **Icons that carry meaning come from a registry** in `components/icons/`: `entryKindIcons`,
  `statusIcons`, `feedbackIcons`, and `accountIcons` (the names a user can pick, stored as the
  account's `icon` string). One meaning, one icon, everywhere.
- Generic icons (chevron, close) are imported directly by design-system components.
- An icon-only control always has an `aria-label` from its messages and a tooltip.

## Copy
- **No user-facing string literal in a `.tsx`** outside `.examples.tsx`. Copy lives in
  `<component>.messages.ts` (design system) or `<feature>.messages.ts` (features), written in pt-BR
  exactly as the screen spec gives it. `pnpm lint:copy` flags JSX text and literal `label`,
  `placeholder`, `title` and `aria-label` props in `.tsx` files.
- API error messages live in one map, `lib/errors/errors.messages.ts`, keyed by code, with the
  message of `../product/requirements/error-messages.md` (the title, for the calm pages; the
  catalog's fallback for the "per field" codes, which the form's own validation already covers).
  `errors.messages.test.ts` reads the catalog and fails on a missing, extra or different message.
  `errorMessageFor(error, values)` (`lib/errors/error-message.ts`) picks and fills it: `{ref}`,
  `{minutos}` from `Retry-After`, the screen's own values; a 5xx with an unknown code shows the
  `INTERNAL_ERROR` message with its `ref`, and a network failure the "Sem conexão" message.
- Emphasis inside a sentence ("Toque em **Confirmar e-mail**") stays in the message string:
  `RichText` (`components/display/rich-text`) renders `**bold**` and fills `{values}`, so the
  copy is never split into pieces in a component. A link inside a sentence is marked `[like this]`
  and drawn by the `link` render prop ("[Entre com ela] para aceitar o convite."). Markers are read
  from the message only, never from the values it fills in.
- Plurals and numbers through `Intl` (`Intl.PluralRules('pt-BR')`, `formatBrl`), never string
  concatenation.
- **Later:** if a second language becomes real, move to Lingui; the per-file message objects make
  that mechanical (RNF-I18N-1).

## Workbench
- `/dev/components` exists only in development: the route throws `notFound()` and renders nothing
  outside `import.meta.env.DEV`, so the build drops the workbench code (`features/workbench`).
  It shows a **Tokens** gallery (every colour role, type style, radius and shadow, read from the
  token files) and each component's examples, in light and dark side by side.
- A component's examples are a `ComponentExamples` value (`lib/examples.types.ts`) exported from
  its `index.ts` as `<name>Examples`, and listed once in
  `features/workbench/components/workbench-sections.ts`.
- It is how a component is reviewed against the Claude Design prototype before a screen uses it.
- **Storybook 10** replaces it only if the library outgrows it (around 30+ components, or stories
  wanted as tests); the `.examples.tsx` files then become stories.

## Tests
| Kind | Tool | Covers |
|---|---|---|
| Pure logic (formatters, mappers) | Vitest (node) | Like `packages/shared` |
| Components | Vitest browser mode (Playwright provider, `vitest-browser-react`) | States with behaviour, keyboard, focus; `expectNoAccessibilityViolations()` (axe-core) in each test file, which first waits for running transitions to end, so contrast is never measured mid-fade |
| Journeys J1–J11 | Playwright e2e + `@axe-core/playwright` | `../product/requirements/experience.md` journeys against the real API (RNF-QUAL-2) |

Browser mode runs components in a real browser, which focus management, popovers and layout need.
Visual snapshots (`toMatchScreenshot`) are **Later**, and only from the CI image, so fonts render
the same.

## React and lint
- **React Compiler** on from the start: `babel({ presets: [reactCompilerPreset()] })` in
  `vite.config.ts` (`@rolldown/plugin-babel` with the preset from `@vitejs/plugin-react`), so tests
  and builds run compiled code. No manual `useMemo`, `useCallback` or `memo` unless a measured case
  needs it.
- Biome covers React and accessibility (`biome.json`): the `react` domain (`useExhaustiveDependencies`,
  `useHookAtTopLevel`, `noNestedComponentDefinitions`...), the a11y group, and
  `nursery/useReactCompiler` as an error, so code the compiler can't optimise fails the lint. No
  ESLint.
- Biome's `useSortedClasses` is not enabled: it still sorts by Tailwind 3 order.

## Adding a component
1. Check the brief's list and this file: does it exist, or is it a variant of one that does?
2. Need a primitive? `pnpm dlx shadcn add <name>` into `components/ui/`, then run
   `pnpm lint:tokens` and fix what upstream brings (`bg-black/50`, `text-white`).
3. Create the folder with the file set; recipe first, then the component.
4. Examples for every state in the brief; review it in `/dev/components`.
5. Tests for behaviour + axe.
6. Upgrading a primitive later: `shadcn add <name> --diff`, merge by hand, keep our token fixes.

## Primitive library
shadcn is initialised with **Base UI** (decided 2026-10-01, ADR 0027), shadcn's default since July
2026. Composition uses its `render` prop. Radix components are never mixed in; examples found
online with `asChild` are translated to `render`.
