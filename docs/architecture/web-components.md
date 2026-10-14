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
| `actions/` | `Button`, `IconButton`, `SubmitButton`, `FloatingActionButton`, `ActionMenu`, `ItemActions`, `SegmentedControl`, `AddTile` |
| `inputs/` | `TextInput`, `PasswordInput`, `EmailInput`, `PhoneInput`, `SearchInput`, `TextArea`, `MoneyInput`, `ChoiceChips`, `PickerField`, `PickerSheet`, `Stepper`, `RadioCardList`, `DateInput`, `PeriodPicker`, `Select`, `Combobox`, `Checkbox`, `RadioGroup`, `Switch`, `DayOfMonthPicker`, `FileUpload`, `ColorSwatch` |
| `forms/` | `Form`, `FormField`, `FieldGroup`, `LockedField`, `FormErrorSummary`, `FormFooter`, `RequiredLegend` |
| `feedback/` | `Toast`, `InlineAlert`, `AutoFillTip`, `Banner`, `ConfirmDialog`, `EmptyState`, `EmptyBlock`, `Skeleton`, `ListSkeleton`, `KpiSkeleton`, `ErrorState` |
| `display/` | `Amount`, `StatusBadge`, `Avatar`, `ListItem`, `Card`, `StatCard`, `ThresholdProgress`, `Tabs`, `Accordion`, `DataList` (table on desktop, list on mobile), `LoadMore`, `Tooltip`, `HelpPopover`, `FilterChips`, `CategoryIcon`, `ArchivedToggle` |
| `charts/` | `BarChart`, `ForecastChart`, `DonutChart`, each with its text alternative |
| `navigation/` | `BottomBar`, `Sidebar`, `TopBar`, `WorkspaceSwitcher`, `BackLink`, `Breadcrumb` |
| `layout/` | `AppShell`, `FormOverlay`, `Page`, `PageHeader`, `Section`, `Stack`, `Grid` |
| `finance/` | `StatHero`, `InsightCard`, `InvoiceCard`, `InvoicePreview`, `SharesList`, `RecentEntries`, `AccountRow`, `AccountGroup`, `CardBlock`, `InvoiceSummary`, `InvoiceLine`, `EntryRow`, `OccurrenceRow`, `ContactRow`, `ChargePreview`, `AmountSplitEditor` |
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
  outside reasons (offline). Waiting is the `Button`'s `waitUntil` prop. A field error the server
  sent (`setError(name, { type: 'server' })`, e.g. a name already taken) does not disable it: the
  form stays as it was and the person can fix the name or send it again.
- `FieldGroup` (`components/forms/field-group`): the label, "*", help and error of a field that is
  a group of choices (`ChoiceChips`, the pickers below), as a `fieldset` named by its visible label.
  The help sits 8 px under the label ("O tipo não pode ser mudado depois.").
- `LockedField` (`components/forms/locked-field`): a value that can't change on this form (an
  account's kind on edit): the label, a grey box with the lock and the value in bold, and the reason
  under it.
- `FormField`'s help sits 4 px under the label by default; `helpGap="roomy"` gives the 8 px of the
  account, category and card forms.
- Text inputs keep the design's 2 px inner padding on the `input` (18 px from the border to the
  text).
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
- `Tip`: one centred line of help with the Info icon, in the colour of its background's text;
  `tone="readOnly"` is the grey strip with the eye (`note`, 500) the shell shows to a viewer.
- Toasts: `showToast(message, { action, tone })` with the `Toaster` mounted once in `AppProviders`
  (`sonner`, styled with tokens): an ink card (`action-primary`) with 15 px text, the action bold and
  underlined in `accent-on-primary`; `tone: 'success'` adds the mint check before the text. On phones
  at the bottom, 16 px from the sides, lifted over the tab bar and, while a `FormOverlay` is open,
  over its buttons (`styles/toast-placement.css`, which also lifts the floating "+" while a toast
  shows); top-right and 400 px wide from 1024 px. 4 s, or 8 s with an action ("Desfazer").
  `tone: 'danger'` is a refusal: the alert icon in `danger-on-primary`, `role="alert"`, and it stays
  until answered (its action, as "Restaurar as duas", or a new toast). Toasts with the same message
  replace each other (never two about the same thing).

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
- `Logo` is the full logo, the `lockup` (the 42 px icon and the "twise" wordmark set in
  `wordmark`, the sidebar), the icon (42 px, the collapsed sidebar) or the `mark` (30 px, the
  phone's top bar), named "twise" for screen readers.
- `Spinner` (`components/feedback/spinner`, `sm`/`md`/`lg`) is the one spinner: buttons, the
  step track, the app opening and "Abrindo o espaço…" all use it.
- `StepTrack` is the 3-step journey of the moments: an `<ol>` with `aria-label`, the current step
  with `aria-current="step"` (a spinner while it loads), a solid line up to it and a dashed one
  after (no rounding on the dashed line, which Chrome would draw solid).

## App shell
`docs/design/home/` → Layouts. Presentational; the workspace feature gives them the items.
- `Breadcrumb` (`components/navigation/breadcrumb`): the desktop path above a page title
  ("Cartões › Cartão X"), a `nav` named by `label`; the levels above are mint underlined links,
  the current one plain with `aria-current="page"`, 14 px, `›` between them.
- `NavItem` (`components/navigation/nav-link`): `{ key, label, icon, render, isCurrent }`. `render`
  is the element that navigates (a router `Link`, or a `button` for "Mais"); `NavLink` draws it
  with the Twise icon (mint fill when current) and forwards any props, so it can be a tooltip
  trigger. `aria-current="page"` marks the current item.
- `AppSidebar`: 264 px (`w-66`) with the logo lockup, the collapse button (the thin `collapse` /
  `expand` arrows), the primary action ("Novo lançamento"), the items (42 px, `choice` type, 22 px
  icons, 2 px apart), the group "Mais" (`overline`) and a `foot` slot (workspace switcher and,
  under a divider, the account); collapsed, 76 px (`w-19`) of icons that keep their names
  (`aria-label`) with a tooltip on hover, the owl icon, a round "+", a divider for "Mais" and the
  foot reduced to the house and the avatar (the foot items read `group-data-collapsed/sidebar`).
  It's sticky at the window height. The collapsed state is the caller's (`isCollapsed`,
  `onToggle`).
- `BottomTabBar`: the phone's five items, fixed at the bottom with the safe area (`pb-safe`), 94 px
  tall as the approved model: each item centred, a 44 × 30 box with the 25 px icon over the `tab`
  label (11.5 px); the current one bold in `mint-ink`, with no fill, pill or mark; the bar casts
  `shadow-bar` upwards. Hidden from 1024 px. The floating action sits 108 px from the bottom and
  toasts 12 px above the bar.
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
  optional Twise icon (18 px, muted), a `detail` line, `isCurrent` (check mark) and `tone: 'danger'`
  for the destructive item. The accounts design's dropdown: 240 px, 40 px items in 14 px medium,
  the highlighted one on `page`. `align` (`start`, or `end` for a row's "⋯") and `onOpenChange`.
  Keyboard and Escape come from Base UI. Desktop popovers of the shell: the account menu and the
  workspace switcher.
- `ItemActions` (`components/actions/item-actions`): the actions of one item, the same items in
  the same order as a sheet on the phone and an `ActionMenu` on the desktop
  (`../design/accounts/components.md` item 4). The sheet is titled with the item's name and an optional `description`
  ("Subcategoria de Mercado"); rows of 52 px with a 22 px icon, the destructive one last in
  `danger`. The default trigger is a 36 px "⋯" (16 px dots) named by `triggerLabel` ("Ações de
  Conta X"); a `trigger` replaces it (a subcategory chip). The desktop menu opens aligned to the
  trigger's end, or its start with `align="start"` (under a chip). Renders nothing when the person
  may do nothing.
- `Sheet` (`components/layout/sheet`, Base UI `Drawer`): a titled dialog from the bottom with a
  handle, a dimmed backdrop and the safe area; the phone's "Mais" and workspace switcher. The
  content keeps 16 px from the sides, the title 20 px; a list may bleed to 8 px (the picker rows).
  With `closeLabel`, the title is the display `title` and "X" sits 8 px from the edge; an optional
  `description` goes under the title in `note`.
- `Avatar` (`components/display/avatar`): the initial of a name in a circle (`mint` or `paper`),
  decorative: the name is always written next to it or in the control's label. `size="stacked"` is
  the overlapping pair of the phone's top bar: 36 px with a 2 px ring of the page colour; `lg`
  (40 px) is the person in a picker row.

## Home building blocks
`docs/design/home/` → Rules and `../design/home/components.md`. They take formatted pieces; the Home feature
passes the overview's numbers.
- `Amount` (`components/display/amount`): cents → "R$ 1.234,56" through `formatBrl`, the true minus
  "−", "+" only with `sign="always"`, never wrapping, tabular figures; sizes `inherit` (the
  surrounding text's, for an amount inside a sentence or a card's second line), `sm`, `md`, `lg`,
  `kpi` (30 px, display font) and `hero`; `isCentsRaised` lifts ",00" (`text-cents`).
- `Card` (`components/display/card`): a region named by its `h2` title, an optional description
  and `headerAction` (tabs), the body, and a footer with a stat on the left and a link on the
  right when given. Rows of cards stretch to the same height. The title is the design's `cc__title`
  (display font, `section-title` on the phone, `card-title` from 1024 px), the description `note`.
- `DataTable` + `DataTableName` + `DataTableAmount` (`components/display/data-table`): the desktop
  tables of the design (`tb`): a `table` whose rows are grids on one of the column templates
  (`layout`: `accounts`, `cards`, `invoices`, `lines`, `categories`, `incomes`, from
  `--grid-template-columns-table-*`), 14 px muted cells, a divider per row, the name cell (40 px
  drawing, name, an optional `detail` line, colour dot, an optional link) and the bold amount. The
  money layouts have 60 px rows, a 12 px gap and a 14 px header (the accounts page's names sit 2 px
  lower, as measured on its PNG); the category ones (`ctb`) 64 px rows,
  a 16 px gap and the 12.5 px semibold header. A column can hide its label from view
  (`isLabelHidden`); the actions column (`isActions`) puts the "⋯" at the end, 8 px past the column
  like the design. A row whose menu is open (`data-popup-open` in its last cell) gets the `page`
  highlight; an `isOpen` row (a category showing all its chips) gets it too, top-aligned.
- `PageHeader` (`components/layout/page-header`): a screen's title (`form-title-lg` on the phone,
  `display` from 1024 px), its description on the desktop only and the actions on the right.
- `KpiCard` + `KpiBadge` (`components/display/kpi-card`): label (`h3`) with an optional help
  slot, the value, a badge and the foot lines (`children`); `tone` `plain`, `mint` (the first
  card) or `danger` (passed the plan); `art` sits at the bottom right and the foot keeps clear of
  it. The label line keeps 26 px for the help button only when there is one (the Home cards);
  without `help` it is the label's 20 px, as the card page's KPIs. With `artAt="top"` (the
  accounts summary) the art sits at the top right.
- `KpiCarousel` (`components/display/kpi-carousel`): on the phone a scroll-snap row of 300 px
  cards (the next one peeks), each slide a group read as "2 de 4", dots that are buttons and
  follow the swipe (the current one 22 px in ink, the others `indicator-idle`); the row takes the
  keyboard focus so the arrows scroll it. From 1024 px a row of four, or of three with
  `columns={3}`.
- `SegmentedControl` (`components/actions/segmented-control`, Base UI `ToggleGroup`): one option
  pressed at a time (`aria-pressed`), e.g. the forecast's account tabs. `width="full"` splits the
  whole width in equal options with the raised white selection (the "Contas | Categorias" tabs).
- `Badge` (`components/display/badge`): a short status pill (`neutral`, `info`, `success`,
  `warning`, `danger`), e.g. "Período encerrado"; `neutral` is the design's `fn-badge--neutral`
  (`status-neutral-soft` with the muted `status-neutral` text, "Futura"). `size="sm"` (22 px) for
  the nature of an income category, `size="status"` (22 px, 10 px sides, the design's `fn-badge`)
  for an invoice's state in a table, `size="tiny"` (18 px, 11 px text) inside a preview row
  ("Fechada"), `size="compact"` (20 px, 8 px sides) beside the name in a `PickerField`.
- `AddTile` (`components/actions/add-tile`): the dashed tile that closes a grid's last row ("Novo
  cartão"): a 240 px minimum, the "+" icon, a 16 px display title and an optional muted line; the
  whole tile is the link it is given.
- `HelpPopover` (`components/display/help-popover`): the "?" next to a number ("O que é {topic}?"),
  a Base UI popover with the plain-words explanation; Escape and a press outside close it.
- `SectionSkeleton`, `SectionError` and `EmptyState` (`components/feedback/`): one per section.
  The skeleton is a `status` with "Carregando…" for screen readers and decorative blocks that
  stop pulsing with reduced motion; the error says what failed (`message`, 15 px), "Código: {ref}"
  and a grey "Tentar de novo" with the refresh icon for that section only, behind the loose alert
  drawing (no circle); the empty state is an illustration in a soft circle and one line on the
  card itself, with an optional action.

## New entry building blocks
`../design/entries/components.md` names the pieces of the `ENT-02` form; several of them are one
component here, so the form, and later the account, card and planning forms, share them.
- `MoneyInput` (`components/inputs/money-input`, the design's `MoneyField`): "R$" before the
  amount, `inputmode="decimal"`, the typed text kept as typed and tidied on blur ("1234,5" →
  "1.234,50", `lib/format/money.ts`); text that isn't an amount stays as typed so the form can say
  what's wrong. Sizes `sm` (a share row, 44 px, the value right-aligned in 600), `md` and `lg` (the entry's amount, 64 px, display font);
  `isNegative` puts "−" and the danger colour on it (opening balance); the sign is set like the
  amount (32 px display at `lg`). It speaks the `FormField`
  control contract (`value` text, `onChange({ target: { value } })`, `onBlur`).
- `ChoiceChips` (`components/inputs/choice-chips`, Base UI `RadioGroup`): one choice among a few,
  all visible, as radios (arrow keys move the choice). `variant` `pill` (the entry types, chosen in
  `mint`), `outline` (the date shortcuts, chosen with an ink outline; 48 px from 1024 px), `card`
  (who spent, two 48 px cards with a 30 px initial, `choice` text) and `member` (the account form's
  "De quem é": 44 px buttons that wrap, a 26 px initial and 14 px names; an option with `avatarIcon`
  shows that icon on paper instead of the initial, "Da casa"). An option can open a dialog (`opensDialog`,
  `aria-haspopup`) and carry an icon (`calendar` before the label, `chevron` after it); `onSelect`
  fires for every press, even on the chosen option, so "Mais" and "Outra data" reopen their sheet.
- `PickerField` (`components/inputs/picker-field`): the field of an account, card, category or
  contact: a button named by its `FormField` label that opens a dialog, with the drawing, the name
  and a grey second line ("Saldo de hoje: R$ 4.200,00"); a subcategory reads with its parent
  (`parentLabel`: "Mercado › Feira", the separator in `ink-subtle`); empty, a dashed "+" square and
  the placeholder. 56 px on the phone, 48 px from 1024 px; the drawing (42 px) overhangs the padding
  instead of growing the field. A filled field reads in `choice` semibold; `badge` puts an `info`
  `compact` `Badge` 8 px after the name (an income category's "Fixa" / "Variável").
- `PickerSheet` (`components/inputs/picker-sheet`): what a `PickerField` opens. A bottom `Sheet`
  with "Fechar" on the phone; from 1024 px a popover anchored to the field (`anchor`), above a
  dialog. `layout` `list` (rows with the drawing and the detail, 8 px from the sheet's sides, the
  current one on `mint-soft` with a check) or `grid` (the category tiles on paper; the current one keeps its paper and gets a 2 px
  sketch-ink outline and a bold label, no mint and no check). An item with `isPerson` shows the
  `lg` `Avatar` of its label instead of a drawing (the contact picker); one with `hasChevron` ends
  in a 16 px muted chevron instead of the check (a choice that leads on, as "Outros tipos").
  A row's detail is 13 px (`isDetailStrong`: ink semibold, what a contact owes); `end` puts a
  muted note ("Vence 25/10") or, with a tone, a status `Badge` with its dot ("R$ 200,00 em
  atraso") at the end; `fieldDetail` is what the `PickerField` shows under the chosen one. An item with `children` shows "N sub";
  pressing it opens the row "Em {mãe}" below the grid with "Só {mãe}" and the children as chips.
  `searchLabel` adds a 44 px search (with its icon) that ignores case and accents and also finds children,
  shown "em {mãe}" with the parent's drawing; `empty` replaces the list with the drawing, a sentence
  and, when it has `actionLabel` and `onAction`, the primary action with a "+" ("Cadastrar conta"). An item with
  `placeholderIcon` shows that icon in a dashed square instead of a drawing ("Nenhuma" in the move
  sheet),
  which closes the sheet before it runs. A pick calls
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
  ("Falta pagar **R$ 1.950,00**", 13 px) and an optional status badge with its dot; the title is
  15 px semibold; the chosen row gets the ink outline.
  `layout="pair"` puts two cards side by side, the dot at the top and a grey example under the title
  (the income nature: "Renda fixa" / "ex.: salário").
- `InvoicePreview` (`components/finance/invoice-preview`): the sunken box under the card with the
  calendar drawing, the sentence ("A 1ª parcela entra na fatura que vence em **04/11**.") and, with
  more than one installment or a closed invoice, one row per installment ("1/3 · vence 04/11 · R$
  333,34", split by dividers, no leader); a closed one is struck through with "Fechada"; `more` adds
  "+ N parcelas, até…" (13 px). The 40 px drawing, the number in a 30 px column and the due date
  with its tiny "Fechada" 8 px apart, as the design's `pv`. A `status` region, so changes are
  announced. The screen computes the rows with the shared `installmentPlan` and passes them.
- `SharesList` + `SharesCollapsed` (`components/finance/shares-list`): "Dividir com contatos".
  Collapsed, a dashed pill. Open, the title with the quick fills "Metade" and "Dividir igualmente",
  one row per contact (initial, name, a dotted leader, a `sm` `MoneyInput` named "Parte de {nome}",
  "×" to take them out), the error under the rows, "Adicionar contato" (disabled at the limit), and,
  after a dashed divider, "Sua parte" with its value in the same column ("—" while the sum passes
  the total). The screen owns the amounts and the rules; the list only shows them. `ref` (collapsed)
  and `addRef` anchor the contact picker's popover on desktop.
- `RecentEntries` (`components/finance/recent-entries`): "Repetir um recente", a row of cards that
  scrolls sideways from the 16 px margin (the last one peeking): the drawing, the description and
  the last amount; the picked card is `aria-pressed` with the ink outline. Nothing renders when
  there is nothing to repeat.
- `AutoFillTip` (`components/feedback/auto-fill-tip`): the discreet line under a field that says
  what was filled for the person, with a mint check and "Desfazer" on the right; a `status`, so it
  is announced.
- `Button` `sm` keeps the buttons' 650 weight at 14 px (the design's `fn-btn--sm`: "Restaurar",
  "Começar da parcela 2"); `subtle` is the white one with a 1 px `border-control` ring, the
  button inside an `Alert`.
- `Button` `quiet`: a transparent button with ink text that turns `sunken` on hover; the phone's
  second action under the main one ("Salvar e registrar outro", with size `touch`: 44 px, the
  smallest touch target, where the design draws it lower) and the desktop's "Cancelar" at the left
  of a form footer.
- `Select` (`components/inputs/select`): a native `select` drawn like the fields (the phone's own
  picker opens), with an optional empty first choice; `TextArea` (`components/inputs/text-area`):
  the notes field, two lines to start. Both take the `FormField` control.
- `FormField` `warning`: an amber line under the control, with the `warn` triangle, for something
  allowed but worth a second look ("O valor é maior que o saldo da fatura."); an error replaces it.
- `ConfirmDialog` (`components/feedback/confirm-dialog`, Base UI `AlertDialog`): the title
  (`dialog-title`), what will happen (`dialog-text`), the secondary "keep" action and the danger one side by side (keep on the left; they
  share the width on the phone and sit at the right, 440 px wide, on the desktop), as
  `../product/requirements/ui-standards.md` → Destructive actions and the discard rule ask
  ("Descartar as alterações?").
- `MomentSheet` (`components/feedback/moment-sheet`): a moment worth a pause and one next step,
  as the design's `sheet--moment` ("Conta Z criada"): on the phone a bottom sheet without header,
  centred, with the handle, the 104 px loose drawing, the 22 px display title, the muted text, the
  full-width primary action and a `tertiary` "Agora não" that closes it (16 px under it); from
  1024 px it is a `ConfirmDialog` with the same words (the desktop has no design of its own).
- `FormOverlay` (`components/layout/form-overlay`, Base UI `Dialog`): a form that opens over the
  screen: full screen on the phone (no tab bar), with "X" and the title on top; from 1024 px a
  dialog 880 px wide, 40 px from the top, over the dimmed page, the title on the left and "X" on the
  right (a 20 px "X"; the title in `form-title`, `form-title-lg` on the desktop). The body sits on
  the page colour and scrolls above the white footer of buttons, which has a top border; on the
  phone the header scrolls away with it, on the desktop it stays on top. "X", Escape and a press outside all call `onRequestClose`, so the screen decides
  whether to ask before discarding. With `onSubmit` the body and footer are a `form` inside the
  dialog (submit buttons in the footer and Enter submit it); `initialFocus` names the field that
  takes the focus when it opens (the amount). `size="md"` is the one-column 560 px dialog, 60 px from
  the top and as tall as its content (up to 820 px), for the account and category forms;
  `size="wide"` is the same at 760 px, for the card form's two columns (fields side by side at the
  same height, the days preview and the switch across both). The desktop header keeps 4 px under
  the 44 px "X" row, as the design's `dlg__head`. `actions="single"` gives the phone footer of one
  button its 20 px bottom.
- `IllustrationPicker` (`components/inputs/illustration-picker`, Base UI `RadioGroup`): the 13
  drawings on paper tiles, 5 per row on the phone and 7 from 1024 px, after the first tile, the
  name's initial ("Sem ilustração: a inicial"); the chosen tile keeps its paper and gets the 2 px
  sketch-ink outline. Values are the `icon` keys of `CategoryArt`.
- `ColorPicker` (`components/inputs/color-picker`, Base UI `RadioGroup`): "Sem cor" (a crossed
  circle) and the palette of `styles/account-colors.ts` as 36 px `ColorSwatch`es named by colour
  ("Petróleo"); the chosen one gets a 2 px ink ring 3 px away.
- `CategoryArt` (`components/display/category-art`): the category drawing of an account's `icon`
  (without one, its initial in display `letter` type on a paper square with the `md` radius),
  never clipped in a circle (`../product/requirements/ui-standards.md` → Visual rules across
  screens). By default (`loose`) it is the drawing without its paper square, from
  `assets/illustrations/loose/` (copied from `docs/design/assets/ilustracoes/soltas/`), for white
  surfaces; in the dark theme it switches to the drawing on its paper square, since the loose black
  ink would vanish. `onLight` keeps the loose drawing in both themes, for a surface that is always
  light (the paper or mint tiles of the category grid). Sizes `sm` 32, `md` 42, `list` 44 (a list
  row), `lg` 46, `xl` 64 and `2xl` 88 px. A drawing with no loose version uses its paper one; no icon shows the
  initial on a paper square.

## Accounts building blocks
`../design/accounts/components.md` items 1–8; the accounts, categories and cards screens share them.
- `ColorSwatch` (`components/inputs/color-swatch`): the colour an account or category stores, as a
  decorative 9 px `dot` beside a name or a 36 px `swatch` in the picker. One of the two components
  allowed a `style` prop: it sets `--data-color` (and `--data-color-on-dark` for a palette choice
  that needs a lighter dark-theme shade) for the `bg-data-color` utility (`web-design-tokens.md` →
  Data colours). No colour, no swatch.
- `AccountRow` (`components/finance/account-row`): an account, card or category in a list: the
  loose drawing (44 px, overhanging the padding), the name with its colour dot, the balance on the
  right of the first line (`Amount`), the grey second line under both ("Conta corrente · Member
  A"), and the `actions` slot at the end. The `link` element (the entries filtered by it) wraps
  drawing, name and value; without it they are plain text. `isArchived` fades the content;
  `isHighlighted` puts a new item on `mint-soft`. 61 px with a divider, as the design.
- `AccountGroup` (`components/finance/account-group`): a titled region ("Dinheiro", `section-title`)
  with its add link on the right ("+ Nova conta", hidden for who can't create), the rows in a white
  card with dividers, and an optional note under it. `loadingRows` puts a `ListSkeleton` in place of
  the rows; without a title it's only the card (the archived rows under `ArchivedToggle`).
- `ArchivedToggle` (`components/display/archived-toggle`, Base UI `Collapsible`): the dashed
  "Arquivadas (n)" row at the end of a list, with the archive icon and a chevron; it opens the
  archived items below. Nothing when none is archived.
- `ListSkeleton` (`components/feedback/list-skeleton`): 64 px skeleton rows shaped like
  `AccountRow` in the same white card, a `status` that says "Carregando…".
- `KpiSkeleton` (`components/feedback/kpi-skeleton`): one summary card while it loads (label and
  value blocks), what the carousel shows before its numbers arrive.
- `EmptyBlock` (`components/feedback/empty-block`): a whole list with nothing in it yet: the 96 px
  loose drawing, the `lead` sentence ("Nenhuma conta ainda."), the reason or next step, and the
  first action, centred in a white card. The second sentence and the action are optional ("A
  lixeira está vazia.").
- `TrashRow` (`components/finance/trash-row`): a deleted account, card or category: the drawing
  (or the initial), the name, the grey lines (kind, "dentro de {mãe}", "Excluída em {data} por
  {nome}"), the reason in ink, and the small secondary "Restaurar" with the restore arrow; the
  button's name says what it restores ("Restaurar Conta antiga"). The name sits 2 px over the
  first grey line and the grey lines 4 px apart, as the design's `small + small`.
- `CategoryRow` (`components/finance/category-row`, Base UI `Collapsible`): a category in the tree:
  the drawing, the name (and, for income, a small `Badge`: "Fixa" or "Variável"), a grey detail
  line when given, and the "2 subcategorias ⌄" pill that opens its chips below (mint while open;
  named "Mostrar/Recolher as subcategorias de {nome}"); without subcategories or a toggle, the
  chips (archived ones) show at once. 64 px rows with dividers, the chips 56 px from the edge.
- `SubcategoryChip` (`components/finance/subcategory-chip`): a 30 px pill per subcategory. `action`
  is a button that opens its actions (white with the 2 px ink outline while they are open, via
  `data-popup-open`), `plain` is the text a viewer sees and `archived` the outlined, faded one.
- `SubcategoryAddChip` (`components/finance/subcategory-add-chip`): the dashed "+" at the end of
  a category's chips, a link named "Nova subcategoria em {mãe}"; with `text` it also shows a word
  ("+ Subcategoria", the desktop row of a category without subcategories).
- `SubcategoryChips` (`components/finance/subcategory-chips`): a desktop row of chips that stays on
  one line. It measures the chips (from their `labels`) and shows the ones that fit, then "+{n}
  mais" and the add chip; `isExpanded` shows them all, wrapping, ending with "Mostrar menos ⌃"
  (mint, underlined). It reports how many are hidden (`onHiddenCountChange`) so the row can show
  "{n} subcategorias" under the name.
- `SubPageHeader` (`components/layout/sub-page-header`): a page one level down on the phone: the
  40 px "‹" back link (named "Voltar para {page}"), the title in `form-title-lg`, a grey
  `sub-page` description under it, and an optional `actions` slot on the right (a card's "⋯").
- The refused action is a `ConfirmDialog` with `confirmVariant="primary"` and `confirmIcon`: the
  title names the item ("Não dá para excluir a Conta Y"), the text says why, "Cancelar" and the way
  out ("Arquivar"). The undo is a toast with "Desfazer"; a refusal that needs an answer, a `danger`
  toast. A list with nothing yet is an `EmptyBlock`; a failed load, a `SectionError`.

## Cards building blocks
`../design/accounts/components.md` items 17–21; the cards and invoice screens share them.
- `CardBlock` (`components/finance/card-block`): one card in the list: the drawing, the name with
  its colour dot and the grey cycle line ("Fecha dia 25 · vence dia 4 · Member A") inside the
  `link` element, the `actions` slot, the sunken "Fatura aberta" row (big amount, "vence 04/11",
  chevron) inside `invoice.link`, the limit line and its `ProgressBar` when there is a limit, the
  "Em aberto no cartão" sentence and, under a dashed rule, "Melhor dia de compra". The footer stays
  at the bottom when a grid row stretches the blocks.
- `InvoiceMonthStrip` (`components/finance/invoice-month-strip`): the scrolling row of month
  pills (month and status), the current one with the 2 px ink outline and `aria-current`; a small
  vertical year label before a January (`yearBefore`); "Todas" at the end calls `onAll`. It opens
  with the month after `anchor` (the open invoice) in view and a whole month at the left margin,
  then keeps the chosen month in view. `size="wide"` (the desktop card page): 96 px months, no
  side margin, and it opens scrolled to the end so the latest months and "Todas" show.
- `InvoiceYearSheet` (`components/finance/invoice-year-sheet`): the `Sheet` behind "Todas", with
  its close button: the year between arrows (no arrow when there is nowhere to go), the months in three columns with the
  status `Badge` and the total, and the footnote. Choosing a month closes it.
- `InvoiceSummary` (`components/finance/invoice-summary`): the chosen invoice: title and status
  badge, the dates, the total (`Amount` size `total`), the "Pago" / "Falta pagar" tiles, the
  "Seu" / "De terceiros" bar (an SVG with a surface gap) with its legend, an optional `note` (the
  future or paid sentence) and the `action` slot ("Pagar fatura").
- `InvoiceFacts` (`components/finance/invoice-facts`): a `dl` in three columns, the invoice
  detail header (total, pago, falta pagar, seu, de terceiros, situação).
- `InvoiceLine` (`components/finance/invoice-line`): one line of an invoice: the date, the
  category drawing, the description with the installment `Badge` ("1/3"), the grey detail ("R$
  160,00 de terceiros") and the amount; `isPayment` uses the `invoice-paid` drawing and the
  positive tone.

- `DayField` (`components/inputs/day-field`): a day of the month, the field the card form uses
  twice side by side: calendar icon, "Escolha" or "Dia 25", chevron. It opens a `Sheet` with the
  31 days as 42 px circles, seven per row (the chosen one with the ink outline and heavy weight;
  29, 30 and 31 with a dot explained below) and, once a day is chosen, the `summary` line ("Fecha
  todo dia **25**"). Tapping a day picks it and closes the sheet. It takes the `FormField` control.
- `CyclePreview` (`components/finance/cycle-preview`): the sunken box with the calendar drawing
  that says where purchases land ("…vence em **04/11**."), live while the days change.

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
  SVG, keeping the two layers. Drawn icons use a 1.75 stroke; the plain line icons of the action
  sheets and menus (`edit`, `flag`, `archive`, `unarchive`, `calendar`, `subcategory`, `move`,
  `more`) keep the design's 2 (`weight` in the shape), and the sidebar's `collapse` / `expand`
  arrows its 1.5.
- `lucide-react` only for small utility glyphs (chevrons, close, the period calendar), named
  imports only (each icon is its own module). Never the `icons` namespace or
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
