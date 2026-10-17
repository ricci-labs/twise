---
summary: The web's application layer — routes and guards (TanStack Router), server data (TanStack Query over the hc client), errors, permissions, dates and money, PWA, how the API serves the SPA, and the bundle budget.
read_when: Adding a route or page, fetching or changing server data, handling an API error, touching the PWA, the SPA serving or the build.
updated: 2026-10-16
---

# Web application layer

Stack: ADR 0005. Folders: `structure.md` → apps/web. Import rules: `dependency-rules.md` → Web.
Requirements this layer serves: `../product/requirements/non-functional.md` (RNF-*).

## Flow
`route (params, search, guard, loader) → feature page → feature hooks (features/*/api) →
lib/api-client.ts (hc) → /api`

Routes decide **what** is on a page; features decide **how** it looks and talks to the API.

## Routes
TanStack Router, file-based, `autoCodeSplitting: true` (no `.lazy.tsx` files; components split on
their own, loaders stay in the main chunk as the docs advise). The plugin writes
`src/routeTree.gen.ts`, which is committed (type checking needs it before any build) and never
edited by hand (the guard hook denies it). `app/router.ts` exports `createApp(history?)`, which
builds the query client and the router together, and `app`, the instance `main.tsx` renders;
tests build their own with a memory history.

| Path (file) | Is |
|---|---|
| `__root.tsx` | `createRootRouteWithContext<RouterContext>()`; `RouterContext = { queryClient }` |
| `_auth.tsx` + `_auth/login.tsx`, `signup`, `forgot-password`, `reset-password` | No session needed; the pathless `_auth` layout renders `AuthFrame` (with the offline banner), which owns the art column (logo, owl, claim): each page's `AuthLayout` reports its scene to the frame and renders only its form column, so the owl stays mounted from screen to screen and only its object changes. The art stays while the next page loads; only a `MomentScreen` takes it away (`useWithoutAuthArt`), so a lazily loaded page never makes the owl blink. Outside `_auth` (WS-01, the invitation) `AuthLayout` draws the whole layout itself |
| `demo.tsx` | Public demo, no session: the real `WorkspaceShell` (sidebar, bottom tab bar, workspace switcher, "Mais") around the real `HOME-01`, on the demo household. `lib/demo.ts` answers the demo workspaces (`demo`, `demo-overspent`, `DEMO_WORKSPACE_IDS`) in the browser: access (Casa, Dono, Member A and B), the workspace list, and through `features/home/api` the overview, accounts and contacts, any `?period=`; nothing reaches the API and nothing is remembered on the device. `features/demo` adds a discreet note in the content ("Demonstração", the situation switcher `?variant=overspent`, "Criar conta"), an example account menu (Criar conta, Entrar), and a guard: links to app areas stay on the demo with "Na demonstração, só a Início está aberta." |
| `verify-email.tsx`, `invite.tsx` | No session needed; moments (`MomentScreen`) |
| `_app.tsx` | Pathless layout: session guard + `AppShell` |
| `_app/index.tsx` | Picks the workspace (`chooseWorkspace`): the last one used on this device if it is still theirs, else the only one, else `/workspaces`; none → `/workspaces/new` |
| `_app/workspaces/index.tsx` | "Seus espaços": every workspace with the role, and "Criar espaço"; `?lost=true` adds "Você não tem mais acesso a este espaço." |
| `_app/workspaces/new.tsx` | `WS-01`: create a workspace, remember it and open it ("Espaço criado.") |
| `_app/w/$workspaceId/route.tsx` | `openWorkspace`: loads the workspace, the member's permissions and `memberNames`, and remembers it on the device; `WORKSPACE_NOT_FOUND` → `/workspaces?lost=true`. Renders `WorkspaceShell` (sidebar, bottom bar, "Mais" sheet, top bar, switcher, account menu from `features/auth`) around the page. `?entry=new` (`newEntrySearchSchema`) opens `ENT-02` (`features/entries`, `NewEntry`) over whichever page is open, for a member with `entries:create`; closing it drops the param. `&entryRepeat={id}` ("Repetir" on `ENT-03`) opens it filled as that entry was recorded (`formInputOf`), dated today, the amount selected. "Novo lançamento" (sidebar, floating "+") and the Home's first step link there. `?account=new` or `?account={id}` (`accountSearchSchema`) opens `ACC-03` (`features/accounts`, `AccountEditor`) the same way, for `accounts:create` / `accounts:update`: after creating, it goes to the accounts list with `?created={id}`, or, when the new entry is open behind it ("Cadastrar conta"), just closes so the entry picks the new account. `?category=new` (with `parent={id}` for "Nova subcategoria" and the page's `kind`) or `?category={id}` opens the category form (`CategoryEditor`); after creating, it goes to the categories with `?created={id}`, which opens the new subcategory's parent |
| `_app/w/$workspaceId/index.tsx` | `HOME-01` (`features/home`): `?period=YYYY-MM` (omitted = the current period) picks the overview; the page gets the member's permissions from the route context `openWorkspace` returned |
| `_app/w/$workspaceId/$area.tsx` | Areas not built yet (`members`, `history`, `account`, …): a calm "Em breve" page inside the shell; each real area's route replaces it |
| `_app/w/$workspaceId/entries.tsx` | `ENT-01` (`features/entries`, `EntriesPage`): the period (`?period=` a label, or `?from=&to=` with an optional `preset`) from `GET /periods`, the summary (`GET /entries/summary`) and the days of `GET /entries`, 50 at a time with "Mostrar mais", then the end of the period and "Ver {anterior}". The search and the filters (`q`, `everywhere`, `types`, `accountId`, `categoryId`, `spentBy`, `shared`) live in the address and go to the API; `ENTRY_QUERY_INVALID` drops them with a toast. The phone has one "Filtros" sheet and the chips; the desktop a bar after the period and the search with one `FilterButton` per filter (Tipo a `CheckboxMenu`; Conta ou cartão and Categoria the `PickerSheet` under the button; Quem gastou a menu that also holds "Só os divididos com contatos", which the design left out of the bar) and "Limpar filtros". From 1024 px the list is a table in a card (`EntriesTable`: the month as the title, the summary under it, the days as bands, Lançamento · Categoria · Conta ou cartão · Quem gastou · Valor, "Mostrar mais" or the end of the list at its foot); each row's "⋯" holds Editar (`?edit=true` on the detail), Repetir, Anexar comprovante, Excluir com motivo and Excluir, and a delete keeps the list as it was Opened from `ACC-01` or `ACC-02` ("Ver lançamentos", an account row, a viewer's subcategory chip) it carries `accountId` or `categoryId` and `back`, so the header is a sub-page with "‹" back there |
| `_app/w/$workspaceId/entries_/$entry.tsx` | `ENT-03` (`features/entries`, `EntryDetailPage`) at `/w/:id/entries/:entry`: `GET /entries/:id` (shown at once from a cached list page), the sections the entry's kind has (`entry-detail-view.ts`), its card's invoices for the installments, the contacts of its shares, the bill it paid (`GET /occurrences/matched`, with `planning:view`); `ENTRY_NOT_FOUND` says it is gone and leads back to the list. No floating "+" here, as the design draws it. The address also carries the list's search (`entryDetailSearchSchema` extends the list's), so the rows link with it and "‹" goes back to the same list; from 1024 px `EntryDetailScreen` shows that list with the detail in a 480 px `SidePanel` on the right (`Detalhe-desktop.png`: "Lançamento", the "Editar" button, "⋯", close; Esc closes), and the edit dialog replaces the panel while it is open (`Editar-desktop.png`). `?edit=true` (the pencil, `entries:update`) opens `ENT-04` over it (`EntryEdit`): the new-entry fields filled (`formInputOf`) under "Editar lançamento"; only description or notes changed → `PATCH`, anything else → `PUT` and the new version's detail; an entry on a closed invoice edits only those two, the rest shown locked |
| `_app/w/$workspaceId/accounts.tsx` | `ACC-01`, the accounts and cards with their balances (`features/accounts`): the summary carousel, the "Dinheiro" and "Cartões" groups, the archived ones folded, and each row's actions as the permissions allow. `?created={id}` marks the account just created on `mint-soft` for 4 s, then leaves the URL |
| `_app/w/$workspaceId/contacts.tsx` | `CON-01` (`features/contacts`, `ContactsPage`), from Mais › Contatos e cobranças and the Home's "A receber" card: `GET /contacts` and `GET /contacts/balances` merged (a contact with nothing recorded owes zero), the tiles "Total a receber" (what those who owe add up to, "de n contatos") and "Em atraso", the sort pills (`?sort=name`; omitted = "Mais atrasados primeiro": overdue amount, then the next due date, then what is owed), one `ContactRow` per contact and the archived in "Arquivados (n)" at the end. "Cobrar" shows for `contacts:create` when `dueNotChargedCents > 0` (G63) and opens the contact with `?charge=new`, which `CON-03` will read; with nothing left to charge and an open charge the row says "Cobrado em dd/mm". "Novo contato" (`contacts:create`) adds `?contact=new` (`CON-05`). Loading, empty, error with `ref` and the viewer (no "Novo contato", no "Cobrar") as the design draws them. Phone first; the desktop shows the same content until its own step |
| `_app/w/$workspaceId/contacts_/$contact.tsx` | `CON-02` at `/w/:id/contacts/:contact` (not nested in the list), with `?charge=new` (`contactDetailSearchSchema`) for "Cobrar"; until `CON-02` is built it shows the "Em breve" page |
| `_app/w/$workspaceId/trash.tsx` | `ENT-05` (`features/entries`, `EntriesTrashPage`), the "Lançamentos" tab of the one "Lixeira" ("Contas e categorias" is `ACC-04`; the tabs show only with both `entries:delete` and `accounts:delete`). `GET /entries/trash`, 50 at a time with "Mostrar mais": each deleted entry with its amount, who deleted it and when, and the reason; "Restaurar" → "Lançamento restaurado." with "Ver" (its detail). A refusal says why from the error's `details.reason` (G47); a deleted account offers "Restaurar {conta}", which restores the account and then the entry. From 1024 px the page header has no back arrow ("Lixeira" is a menu item) and the entries are a table in the card "Lançamentos excluídos" (`Lixeira-desktop.png`): Lançamento (with its kind and account), Excluído ("Hoje, 14:12, por Member A"), Motivo, Valor and "Restaurar". No floating "+" on either tab; the phone's bottom bar marks "Lançamentos" and the desktop menu "Lixeira", as the design draws them |
| `_app/w/$workspaceId/accounts_.trash.tsx` | `ACC-04` at `/w/:id/accounts/trash` (not nested in the accounts page), the "Contas e categorias" tab of the "Lixeira", for `accounts:delete`: the deleted accounts, cards and categories, newest first, each with "Restaurar"; a child whose parent is in the trash offers "Restaurar as duas" in an error toast, and "Ver" in the success toast goes back to the list with the item highlighted |
| `_app/w/$workspaceId/categories.tsx` | `ACC-02`, the other tab of "Contas e categorias" (`?kind=income` for income): the category tree with each main category's subcategories folded under a pill (the open ones remembered on the device), the archived ones at the end, and the actions as the permissions allow. The navigation counts it as the `accounts` area |
| `_app/w/$workspaceId/settings/index.tsx` | Configurações (`features/settings`, `SettingsPage`): the group "Planejamento" (`planning:view`) with the "Feriados" row, whose state line comes from `GET /holidays?year=` (the year of `GET /periods` `today`) → `summary` ("15 em 2026 · próximo: Finados, 02/11"), and the group "Recebimentos" (`settings:view`) with the "Recebimento por Pix" row, whose state line comes from `GET /settings` ("Chave cadastrada · {nome}" or "Não configurado"); the rows of `SET-01` come later. No floating "+"; the phone's bottom bar marks "Mais" and the desktop menu "Configurações" |
| `_app/w/$workspaceId/settings/pix.tsx` | `SET-02` (`features/settings`, `PixPage`, design `contacts/` `Pix`): the workspace's Pix from `GET /settings`, saved with `PUT /settings/pix` (all three fields together; `null` removes it). Key (1–77, placeholder "CPF, e-mail, telefone ou aleatória"), "Nome de quem recebe" (1–25, with the help) and "Cidade" (1–15), their counters from 80% of the limit (`../product/requirements/ui-standards.md` → Forms and validation, 8), and the bank preview ("No app do banco de quem paga aparece **{nome} · {cidade}**…") while both are filled. "Salvar Pix" is enabled once something changed and toasts on success; "Remover Pix" (danger text, only when a key is saved) confirms with "As próximas cobranças sairão sem o Pix copia e cola.". `PIX_INVALID` re-checks the fields and, if none is wrong, shows the code above the button. Without `settings:update` the fields are read-only with no actions, or "Nenhuma chave Pix cadastrada.". Phone: a sub-page with "‹" back to Configurações, the lead under "* obrigatório"; desktop: the breadcrumb and the lead under the title, the form 640 px wide. The charge note "Configure sua chave Pix…" links here (`<Link to="/w/$workspaceId/settings/pix">`) |
| `_app/w/$workspaceId/settings/holidays.tsx` | `PLAN-07` (`features/settings`, `HolidaysPage`): `?year=` (2000–2100, omitted = this year) picks `GET /holidays?year=`; the year stepper, the note, "Do espaço" (with "Adicionar feriado" for `planning:create` and "⋯ Excluir" for `planning:delete`) and "Nacionais (bancários)" (their pt-BR names in `settings.messages.ts`). The add sheet checks a national day and a taken day on the date field when it is left, and the API refusals (`HOLIDAY_ALREADY_NATIONAL`, `HOLIDAY_DATE_TAKEN`) land there too; a holiday added in another year moves the page to that year. Phone: a sub-page with "‹" back to Configurações. Desktop (`Feriados-desktop.png`): the breadcrumb, the year stepper and the "Adicionar feriado" button beside the title (the form opens as a dialog), three cards of one height (`NextHolidayCard` with what it moves from `affects`, fetched for the next holiday's year when another year is shown; "Do espaço · n" with "⋯ Excluir"; "Como ler", the legend and the note), then the 12 `MiniMonthCalendar`s, 2, 3 or 4 per row by the content's width (container queries). `planning/holidays.tsx` redirects here, and the recurrence form's business-day help links here ("Ver feriados") |
| `_app/w/$workspaceId/entries/index.tsx`... | One folder per area: `entries`, `cards`, `planning`, `contacts`, `accounts`, `members`, `settings`, `history`, `trash` |
| `_app/account.tsx` | My account and preferences (`ME-01`) |
| `dev/components.tsx` | Workbench, development only (`web-components.md`) |

- URLs are English, like the API; the screen IDs map to them in the route's feature.
- **Every page names its browser tab:** the feature's page calls `usePageTitle(<its messages>.pageTitle)`
  (`hooks/use-page-title.ts`), which writes "Twise · <screen>" (`lib/page-title/`), e.g. "Twise ·
  Entrar", "Twise · Criar conta". The name is the screen, not its state, so it stays put while the
  page changes in place. A new page adds its `pageTitle` to its feature's messages.
- **A route file only wires:** `validateSearch` (a schema from the feature's `.schemas.ts`),
  `loaderDeps`, a `loader` that calls `ensureQueryData` with the feature's query options, and a
  `component` that renders the feature's page with params and search as props. No markup beyond
  that one element, no hooks other than `Route.useParams`/`useSearch`, no copy.
- Features never call `getRouteApi` or `useParams`; they get params as props, so a feature isn't
  tied to a route ID.
- **Guards** run in `beforeLoad` through `context.queryClient.ensureQueryData`:
  - `_app`: `loadSession(context.queryClient)` (features/auth: `ensureQueryData(meQueryOptions())`,
    `null` on `401` and on a network failure); no session → `redirect({ to: '/login', search: {
    next } })`. While it runs, `_app`'s `pendingComponent` is the app opening (`AppOpening`,
    `SHELL-01`), shown at once (`pendingMs: 0`), with "Abrindo…" after 1.5 s. The guard also
    awaits `context.waitForOpening()` (`lib/app-opening.ts`), so the brand entrance gets up to
    1.2 s on the first opening and never more; the wink (at 1.55 s) plays only when the session
    takes longer. With reduced motion there is no hold. Navigation inside the app never shows it,
    since the `_app` match stays rendered. The `['me']` query runs with `networkMode: 'always'`
    and retries only `5xx`: offline, Query would otherwise pause it and the opening would never
    end; with no network, the app goes straight to the log in, where the offline banner shows;
  - `_auth/login`: a session already open → `redirect` to `appPathOrHome(next)` (`lib/navigation.ts`
    accepts only paths of the app, never another site or `//host`);
  - `w/$workspaceId`: the workspace (permissions); `WORKSPACE_NOT_FOUND` → the switcher;
  - each area: `requirePermission(context, 'entries', 'view')` (`lib/permissions.ts`); without it
    the route shows the no-permission state (`../product/requirements/ui-standards.md` → States).
- Router defaults: `defaultPreload: 'intent'`, `defaultPreloadStaleTime: 0` (Query owns the cache),
  and the shared pending, error and not-found components from `components/feedback/`.
- Search params are the state of a list (period, filters, sort), so a link reproduces the view.
- `/login` takes `next` (where to go after logging in) and `notice` (the arrival message:
  `session-ended`, `logged-out`, `password-changed`, `email-verified`), validated by
  `loginSearchSchema`; anything else is dropped.
- **What a screen hands to the next never goes in the URL** (where history, logs and shared links
  would keep it): it travels in the router's history state (`HistoryState` in
  `app/router.types.ts`), read with `useArrivalState()`. A reload of the same entry keeps it; a
  fresh visit opens the screen empty.
  | Field | Set by | Read by |
  |---|---|---|
  | `email` | "Esqueci minha senha"; the invitation's sign-up and its "Entre com ela" | `/forgot-password` and `/login` fill it in (the log in then focuses the password) |
  | `inviteToken` | `/invite` ("Já tenho conta", "Entre com ela", "Sair e entrar com outro e-mail") | `/login` hands it on to `next`; `/invite` uses it when the address has no `#token=` |
  | `joinedWorkspaceName` | The invitation's sign-up with a verified e-mail | `/login` shows "Conta criada. Entre para abrir o espaço {workspaceName}." |

## Server data
- **Only `features/<feature>/api/` calls the backend**, through `apiClient` (`lib/api-client.ts`).
- **Reads:** `<feature>.queries.ts` exports `queryOptions` factories
  (`entriesQueryOptions(workspaceId, filters)`), used by loaders and components alike.
- **Writes:** one hook per use case, `api/use-<verb>-<noun>.ts` (`use-record-entry.ts`), wrapping
  `useMutation`.
- **Keys** always start from `lib/query-keys.ts`: `['me']`, `['workspaces']`, or
  `['w', workspaceId, '<area>', ...]`. Data of two workspaces can't mix, and switching shows no stale
  numbers.
- **Invalidation:** a write invalidates its workspace prefix (`['w', workspaceId]`). Only queries
  on screen refetch, and one write may change balances, the overview and an invoice at once
  (RNF-PERF-4). Narrower keys only when a measured case needs it.
- **Defaults** (`lib/query-client.ts`): `staleTime` 30 s; queries retry twice only on network
  errors and 5xx, never on 4xx; mutations never retry.
- `useSuspenseQuery` where the loader already fetched; `useQuery` for sections that load on their
  own (each with its skeleton, so one failing section doesn't take down the page).
- No optimistic updates unless the API can't refuse for a business rule (RNF-REL-4).

## API client and errors
- `apiClient = hc<AppType>('/')` with the API's type only (`dependency-rules.md`). If type-checking
  slows down, the API exports a pre-compiled client type (`hcWithType`), per the Hono RPC guide.
- `unwrap(request)` (`lib/api/unwrap.ts`) returns the typed body or throws an `ApiError`
  (`status`, `code`, `ref`, `retryAfterSeconds`, `isServerError`), parsed from
  `{ error: { code, message, ref, details? } }` (`ApiError.details`, `{}` when there are none); `unwrapEmpty` does the same for answers with no body (204).
  A response that isn't that shape becomes `UNKNOWN`; a failed fetch becomes `NetworkError`. It
  never imports `hono/client`: it takes any response with `ok`, `status`, `headers` and `json()`.
- **Global handling** (`QueryCache` and `MutationCache` `onError`):
  | Error | Does |
  |---|---|
  | 401 `SESSION_REQUIRED` | `queryClient.clear()`; if there was a session (the `['me']` query had data), go to `/login?next=<here>&notice=session-ended` ("Sua sessão terminou. Entre de novo.", RNF-SEC-3); a first visit just lands on `/login` |
  | 403 `PERMISSION_DENIED` (or `FORBIDDEN`) | Toast with its message (`showToast`); the workspace queries are invalidated, so permissions refetch (`app/router.ts`). Other 403 codes (`SIGNUP_DISABLED`, `EMAIL_NOT_VERIFIED`…) belong to their screen and never toast |
  | `NetworkError` | The offline banner (`OfflineBanner`, from `navigator.onLine` and the `online`/`offline` events); writes disabled (RNF-REL-3) |
  | 5xx | The page or form shows "Algo deu errado…" with the `ref` |
- **Everything else** is shown where it happened, with the message from
  `lib/errors/errors.messages.ts` for its code, picked by `errorMessageFor` (`web-components.md` →
  Copy), field errors through
  `applyApiError`.
- Error boundaries: each route's `errorComponent`, plus one per independent section. "Tentar de
  novo" calls `router.invalidate()` and resets the query error boundary.

## Session and links
- No auth state outside Query: the session is the `HttpOnly` cookie; "who am I" is `['me']`.
- Log in (`useLogIn`): on success the whole cache is cleared (a new session sees nothing of the
  last one) and the page opens `appPathOrHome(next)`. Log out (`useLogOut`, the "Sair" button):
  call the API, then `queryClient.clear()` and `/login?notice=logged-out`, even if the call
  failed (RNF-SEC-4).
- Only a `401` whose code is `SESSION_REQUIRED` (or `UNAUTHORIZED`) ends a session; the log-in
  form's own `401 INVALID_CREDENTIALS` is a form error.
- Link tokens (`#token=`) are read once by `useLinkToken()` (`hooks/use-link-token.ts`, parsing with
  `lib/link-token.ts`) from the router's history, which is a memory history in tests, and removed
  from the address with `history.replace` in a layout effect, before the browser paints
  (RNF-SEC-5). The page keeps the token in state, so "Tentar de novo" can send it again.
- A page that calls the API on its own when it opens (`/verify-email`, `/invite`) does it through
  `useCallOnce(token, call)` (`hooks/use-call-once.ts`), whose ref keeps Strict Mode's second
  effect run in development from spending the link twice.
- `/invite` loads the session in its loader (`loadSession`) and reads it with
  `useSignedInAccount()`, which never fetches again: a logged-out visitor causes one `401`, not a
  second one that would clear the cache under the page. After joining, the moment stays 1.5 s and
  opens the joined workspace (`/w/$workspaceId`).
- Nothing personal is stored in the browser. `localStorage` holds only `theme`
  (`web-design-tokens.md` → Dark mode), `sidebarCollapsed` (the desktop sidebar, toggled by its
  button or Ctrl/⌘ + B, `hooks/use-sidebar-collapsed.ts`) and `lastWorkspaceId` (`lib/last-workspace.ts`), the
  workspace opened last on this device, as the design asks; an id the person no longer has is
  ignored, and all of them survive a failing storage (private mode).

## Permissions in the UI
`hasPermission(permissions, module, action)` and `isReadOnly(permissions)` (`lib/permissions.ts`)
read the workspace access query. The shell shows each menu item only with its module's `view`
(Lixeira with `entries:delete`, "Novo lançamento" with `entries:create`), and a role that can only
view gets "Você está vendo este espaço sem poder alterar nada.". Buttons and navigation items are
hidden, not disabled (`../product/requirements/ui-standards.md` → Permissions); the API still enforces everything
(RNF-SEC-7).

## Dates and money
- **Dates use `@financas/shared`'s calendar** (`IsoDate`, `todayIn`, `addDays`, `periodOf`) with the
  workspace time zone from its settings, never the device's. No date library.
- Calendar dates travel and live as `YYYY-MM-DD` strings; never `new Date('YYYY-MM-DD')` (it parses
  as UTC midnight and shows the day before in São Paulo).
- Display through `lib/format/` (`Intl.DateTimeFormat('pt-BR', { timeZone })`): "hoje", "ontem",
  `dd/mm/aaaa`, "out/26" (RNF-I18N-3).
- Money: `parseBrl` and `formatBrl` from shared. A figure on its own is an `Amount`; an amount
  inside a sentence (a message's value) is `formatBrl`; compact whole reais ("R$ 460 de R$ 400")
  are `formatWholeReais` (`lib/format/money.ts`). Never `toFixed` or string building.
- **Later:** Temporal, once Safari ships it.

## PWA
`vite-plugin-pwa` (`vite.config.ts`) with `registerType: 'prompt'` and `injectRegister: false`:
- **Precache:** every built `js`, `css`, `html`, `woff2`, `svg` and `png` except the email images
  (`email/**`). That is the shell, every route's chunk and every owl scene and kit (about 2.2 MB
  before compression, fetched once per version in the background after the first load). The owl
  scenes are in it because each is its own file, loaded when shown: without the precache the
  offline owl would be missing exactly when there is no network (seen 2026-10-02).
  `navigateFallback: 'index.html'` with `navigateFallbackDenylist: [/^\/api\//]`; **no runtime
  caching of `/api`**: authenticated data never sits in the service worker.
- **Updates:** `AppUpdatePrompt` (`features/app-update`, mounted in `AppProviders`) shows the
  banner "Nova versão disponível" with "Atualizar", fixed on top of the screen, the same strip as
  the offline banner (design system → Alert: banners are for states of the whole screen), and it
  stays until "Atualizar" activates the new worker and reloads (`useRegisterSW` from
  `virtual:pwa-register/react`, so the worker is registered from code, never with an inline
  script). It was a toast at first, too easy to miss at the bottom (2026-10-02).
- **Install offer:** `lib/install-prompt.ts`, started in `main.tsx` before React mounts, keeps
  the browser's `beforeinstallprompt` (and cancels the browser's own banner) until the person
  asks: `install()` opens the browser dialog once and answers `accepted` or `dismissed`;
  `appinstalled` forgets the offer. `useCanInstall()` (`hooks/use-can-install.ts`) says whether an
  offer is kept. `features/app-install` draws the Home card (`InstallOffer`, passed to `HomePage`
  by the app's Home route only, so never on `/demo`) and remembers "Agora não" for 30 days in
  `localStorage` (`installOfferSnoozedAt`); the shell adds "Instalar o app" to the "Mais" items.
  Rules in `../product/requirements/non-functional.md` → RNF-RESP-2.
- **Manifest:** name "Twise", description "Leve, claro, a dois.", `lang: 'pt-BR'`, `display:
  'standalone'`, `start_url: '/'`. `background_color` and `theme_color` are the `mint` token, read
  from `semantic.css` at build time: the design hands off from the icon to the mint app opening
  with no seam (`docs/design/account/screens.md` → App opening).
- **Icons:** `public/icons/` (192, 512, maskable 512 with the owl in the safe zone, the 180 px
  Apple icon and the SVG favicon), generated from the design's `twise-icone.svg` by `pnpm
  gen:app-icons` (`scripts/generate-app-icons.mjs`, Chromium through Playwright; run it again
  when the icon changes). `index.html` links the favicon and the Apple icon, and sets
  `viewport-fit=cover` for the phone's safe areas (RNF-RESP-2).

## Served by the API
The SPA build is copied into the API image (`/app/web`, `WEB_DIST_DIR`) and served by the same
process (ADR 0005), from a **second Hono app**: `createWebApp(logger, WEB_DIST_DIR)`
(`core/http/web-app.ts`). `main.ts` hands the server `routeByPath(api, web)`: `/api/*` goes to the
API app, everything else to the web app. Mounting the web routes inside the API app was tried and
broke it: their `*` routes became the last matched route of every API request, which the session
guard reads to recognise public routes. Kept apart, the API app, its `AppType` and its own headers
(attachments answer with `Content-Security-Policy: sandbox`) stay untouched. In development
`WEB_DIST_DIR` is unset and Vite serves the web.

| Path | Answer | Cache-Control |
|---|---|---|
| `/assets/*` (hashed names) | the file, or 404 | `public, max-age=31536000, immutable` |
| Other files (`index.html`, `theme-init.js`, `email/*.png`…) | the file, or 404 (never the page) | `no-cache` |
| Any other `GET` outside `/api/` (an app page: `/login`, `/w/…`) | `index.html` (SPA fallback) | `no-cache` |
| Unknown `/api/*` | The API's own `ROUTE_NOT_FOUND`, never `index.html` | — |

`Cross-Origin-Resource-Policy` is `same-origin` on every answer except `/email/*`, which is
`cross-origin`: mail clients such as Outlook load those images from their own site, and with
`same-origin` the browser refused them, so every email showed a broken image (seen 2026-10-02;
Gmail hid it because it fetches images through its own proxy). Those files are only the owls and
the logo.

Every answer of the web app is compressed (`compress()` from Hono, gzip or deflate as the browser
asks); the API app is not. Without it the JavaScript went out raw, so RNF-PERF-1's gzipped budget
didn't hold in production. `sw.js` and `manifest.webmanifest` are "other files": `no-cache`, so a
new worker is seen on the next visit.

The Content-Security-Policy (`CONTENT_SECURITY_POLICY` in `core/http/web-app.ts`, on every answer of
the web app):
`default-src`, `script-src`, `style-src`, `font-src`, `connect-src`, `worker-src`, `manifest-src`,
`base-uri` and `form-action` `'self'`; `img-src 'self' data: blob:`; `object-src` and
`frame-ancestors` `'none'`. No `'unsafe-inline'`: the theme script is a file, and React sets styles
through the CSSOM, which the policy doesn't block (checked in Chromium against the served build,
2026-10-01). A library that injects its own `<style>` element is blocked, though: Sonner did, so in
production every toast lost its fixed position and fell to the end of the page (seen 2026-10-02).
Its stylesheet is now imported in `globals.css` (`sonner/dist/styles.css`), and a toast test removes
the injected styles, as the policy does, and checks that the toaster stays fixed. Any new library
that injects CSS needs the same treatment. CI's 🐳 job boots the image and checks the page, the fallback, the headers, an asset,
an email image and an unknown API path.

## Bundle budget
- `pnpm check:bundle` (`scripts/check-bundle.mjs`) reads Vite's `build.manifest`, walks the entry's
  **static** imports, gzips each file and fails above **250 KB** (RNF-PERF-1). Runs in CI after the
  build (📦). It lists each file, largest first; on 2026-10-02 the initial load was 208 KB, so a
  big addition to a shared chunk shows up here first.
- Recharts and other heavy libraries are reached only from route components, which are split, so
  they never land in the initial chunk.
- `apps/web/package.json` declares `"sideEffects": ["*.css", "./src/main.tsx"]`. Without it the
  bundler must keep every module a feature's `index.ts` re-exports, so a guard that imports one
  function (`openWorkspace` in `w/$workspaceId`'s `beforeLoad`) dragged the whole shell (Base UI
  menus, sheet, tooltip) into the initial chunk: 274 KB, over the budget (seen 2026-10-09; 183 KB
  with it). A new module that must run on import (a polyfill, a global style imported from JS)
  is added to that list.
- `packages/shared/package.json` declares `"sideEffects": false`: shared is pure functions,
  schemas and constants (no module runs anything on import), so the web keeps only what it uses of
  the barrel. Adding the demo household to the Home without it put 6 KB of it in the initial chunk
  (seen 2026-10-09); with it the initial load fell to 178 KB.
