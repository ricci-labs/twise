---
summary: Index of the visual design (Twise design system, account screens, app shell and Home, icons, owl illustrations and motion) and how to use it when building the web app.
read_when: Building or changing any web screen or component, picking colors/type/spacing, or using the owl illustrations.
updated: 2026-10-14
---

# Design

The UX/UI was designed visually (no production code) and exported here so it can be built straight into `apps/web` with the stack in ADR 0005 (Vite, React 19, Tailwind v4, shadcn/ui, TanStack Router/Query, React Hook Form + Zod).

## Routing table

| File | Read when |
|---|---|
| `design-system/README.md` | Any visual decision: principles, voice, colour, type, spacing, motion, brand |
| `../architecture/web-design-tokens.md` | The tokens themselves: they live in code, in `apps/web/src/styles/tokens/`, the single source |
| `design-system/components/<Name>/README.md` | Building that component: anatomy, states, which shadcn piece to use |
| `design-system/components/<Name>/preview.html` | Exact look of each state (classes in `components/bundle.css`, prefix `fn-`) |
| `account/README.md` | Starting the account area (AUTH-01..05, INV-01, SHELL-01): flow map, build order |
| `account/screens.md` | Building one account screen: every state with HTML, PNG and notes |
| `account/components.md` | Which components to build first and how they map to shadcn and to the repo |
| `account/motion.md` | Animating the owl scenes and screen transitions |
| `account/emails.md` | Changing the account emails sent by the API |
| `account/decisions.md` | **Before building:** design decisions that change `product/requirements/*` |
| `home/README.md` | Starting the app shell, WS-01 or the Home (HOME-01): layouts, navigation, rules, build order |
| `home/screens.md` | Building one shell or Home screen: every state, mobile and desktop, with HTML, PNG and notes |
| `home/components.md` | Components for the shell and the Home, mapped to shadcn/ui |
| `home/data.md` | Which endpoint and field feeds each Home widget, and which are proposals |
| `home/motion.md` | Animating the Home, charts, menus and the workspace owl |
| `home/decisions.md` | **Before building the shell or Home:** decisions that change `product/requirements/*` |
| `entries/README.md` | Starting ENT-02 "Novo lançamento": layouts, rules, build order |
| `entries/screens.md` | Building one part of ENT-02: every type and state, mobile and desktop, with HTML, PNG and notes |
| `entries/components.md` | Form components for ENT-02 (pickers, type chips, date shortcuts, shares…), mapped to shadcn/ui |
| `entries/decisions.md` | **Before building ENT-02:** changes to entries.md, approved additions that need the API, app-wide rules (illustrations, desktop field heights, dotted leaders) |
| `accounts/README.md` | Starting accounts, categories or cards (ACC-01..04, CARD-01..04): layouts, rules, build order |
| `accounts/screens.md` | Building one accounts, categories, subcategories, cards or invoice screen, mobile and desktop, with HTML, PNG and notes |
| `accounts/components.md` | Components for accounts, categories and cards (rows, KPI carousel, subcategory chips, month strip, day picker…), mapped to shadcn/ui |
| `accounts/decisions.md` | **Before building accounts or cards:** changes to accounts-and-cards.md, API needs G40–G42, app-wide rules (KPI carousel, one selection style, system illustrations) |
| `entries-list/README.md` | Starting the entries list, detail, edit or trash (ENT-01, ENT-03, ENT-04, ENT-05): layouts, rules, build order |
| `entries-list/screens.md` | Building one of those screens, mobile and desktop, with HTML, PNG and notes |
| `entries-list/components.md` | Components for the list, filters, range calendar, detail sections, edit form and trash |
| `entries-list/decisions.md` | **Before building them:** changes to entries.md, API needs G45–G47, the shared Lixeira page |
| `assets/ilustracoes/README-sistema.md` | The system illustrations (invoice payment, transfer, opening balance, receipt) |
| `assets/ilustracoes/soltas/` | Category illustrations without the paper square, for white surfaces |
| `assets/icones/` | The Twise interface icons (two layers) |
| `assets/` | SVGs: owl scenes, layered owl kits, logo, category illustrations, fonts |

## How to use it

1. Read `account/decisions.md`, `home/decisions.md`, `entries/decisions.md`, `accounts/decisions.md` and `entries-list/decisions.md` first: where the design and the requirement docs disagree, the design wins and the requirement doc must be updated in the same PR.
2. Build components before screens (`account/components.md`). Screens are compositions; no screen should need one-off CSS.
3. For a screen, open its PNG to see it and its HTML for exact copy, spacing and states. The HTML is a reference, not code to copy: its inline CSS (`tw-…` classes) predates the design system classes (`fn-…`). Use tokens and components.
4. Copy (pt-BR) in the screens and notes is final. Error copy comes from `product/requirements/error-messages.md`.
5. The app always opens in the **light theme**; dark only when the person chooses it. Account screens are always light.

## Sources

Exported on 2026-10-01 (account) and 2026-10-07 (shell, workspace and Home: canvas "Twise Telas · Início") and 2026-10-10 (ENT-02 new entry: canvas "Twise Telas · Lançamento") and 2026-10-14 (accounts, categories and cards: canvas "Twise Telas · Contas e cartões") from the Claude design canvas "Twise Telas" and the design system artifact "Twise", then brought into the repo: the docs were translated to English (UI copy stays in pt-BR), and the token values moved into code (`apps/web/src/styles/tokens/`), which is now their only source. The HTML, PNG and animation files are references and are not edited by hand; a new export of a screen replaces its files.
