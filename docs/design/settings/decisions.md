---
summary: Design decisions of the settings round (SET-01 hub, MEM-01..03, ME-01, AUD-01) that change workspace-and-members.md, auth-and-account.md and attachments-and-audit.md, five new app-wide UI rules, and API needs G73–G75.
read_when: Before building the settings round, and when updating those requirement docs, ui-standards.md or api-gaps.md.
updated: 2026-10-29
---

# Decisions (settings, members, account, history)

Where the design and the requirement docs disagree, the design wins and the doc is updated in the same PR. Approved by the product owner on 2026-10-29.

## Changes to workspace-and-members.md

| Topic | Requirement today | Design |
|---|---|---|
| SET-01 layout | one page with groups, each with its own save | **Mobile: a hub** (list of groups showing the current values); each group opens its own screen with one save. Desktop: paired cards, one save per card. Pix (SET-02), Mensagem das cobranças (SET-03) and Feriados (PLAN-07) are entries of the hub |
| SET-01 read-only | not described | Members with `settings:view` only: the hub with a note; each screen dimmed with a lock note and no save button |
| Period preview | "Período atual: 5 out – 4 nov." | The current **and** the next period, from the API (G73); the web never computes dates |
| Time zone | select, Brazil first | The app's picker: Brazilian zones with the cities they cover, search, "Outros países" |
| MEM-01 row | name, email, role, "Desde", "Você" | Role badge first on line 3; email on its own line; "Ver no histórico" in "⋯" (G75); desktop adds "Última atividade" (G75) |
| Mudar papel | role picker | Choice cards with a sentence per role; owner and roles beyond the editor's permissions disabled |
| LAST_OWNER, ROLE_IN_USE | error messages | Dialogs that explain and offer the way out ("Tornar Member B dono", "Ver convites") |
| MEM-02 usage | "number of members using it" | People **and** invitations ("1 pessoa", "1 convite", "Ninguém"), from the API (G74) |
| MEM-02 presets | copy from an existing role | Three equal buttons: Admin, Membro, Leitor |
| Members, Roles, Invitations | separate routes | Tabs inside Membros (routes kept: `/membros`, `/membros/papeis`, `/membros/convites`) |

## Changes to auth-and-account.md (ME-01)

- A hub on the phone like Configurações: Você (Nome, E-mail read-only, Senha), Avisos (Horário de silêncio, Avisos do espaço {nome}), Aparência (Tema); "Sair" at the end. Desktop: paired cards and "Sair" in the page header.
- Password: the eye button sits **inside** the field; after changing, a toast "Senha trocada. Saímos dos outros aparelhos."
- Notifications: the days-ahead stepper shows a real example ("A Internet vence em 18/11: o aviso chega em 15/11, por e-mail, uma vez.").
- Theme: three cards with a miniature; it changes at once, no save.

## Changes to attachments-and-audit.md (AUD-01)

- Filter "Quem" (a member or "Automático") next to "Área" (G75).
- Row: the sentence with the item in bold; below, time · area · ref (a `MetaLine`); "pelo WhatsApp" as a badge first.
- The change opens in a sheet (phone) or the right pane (desktop) with "Neste lançamento", the item's other changes.
- Desktop is a work screen (rule 4).

## New app-wide rules (add to `../../product/requirements/ui-standards.md`)

1. **Support lines break by whole pieces.** A second line made of pieces joined by " · " never breaks inside a piece: a piece that does not fit drops whole to the next line, without its dot, starting with a capital letter. Never "19/10 · link" with the rest below.
2. **Desktop: paired cards.** Fixed-content cards (forms, settings) sit in two columns, paired by similar height; cards in a row share their height and keep the save button at the foot. A card without a pair takes the full row. Never a lone card beside an empty space; never one stretched sheet across a wide screen. Check every desktop screen at 1440 and 1920 px.
3. **Quantities.** A list is never placed side by side with something else: it takes the full row and grows (50 per load + "Carregar mais"). Side-by-side cards only for fixed content. A summary of a list shows its first 4–6 items + "Ver todos os N". Grids of tiles wrap into as many columns as fit (no holes: 5 tiles become 3 + 2 wider ones). Design every list with 1, 6 and many items.
4. **Work screens (desktop).** A list with a detail beside it (Histórico now; Lançamentos and Contatos when revisited; Posso comprar?) uses the whole window: the page does not scroll, each column scrolls on its own, filters stay pinned at the top of the list, the next 50 load automatically about 300 px before the end (skeleton rows + "Carregando mais…"), an error keeps what loaded and shows "Tentar de novo" at the end, the end says "Isso é tudo…". Below 700 px of window height it falls back to a scrolling page with "Carregar mais" and the detail pinned. Each pane is focusable and named for screen readers. The phone does not change.
5. **Offline bar on desktop.** The dark "Sem conexão" bar is glued to the top of the content area and runs edge to edge (from the sidebar to the right edge), outside the content margins; the content starts 24 px below it.

## API needs (add to `../../product/requirements/api-gaps.md`)

| # | Need | Today | Proposal |
|---|---|---|---|
| G73 | Period preview in Mês financeiro | The web would have to compute period dates | `GET /settings/period-preview?anchor=&value=` → `{ current: { start, end }, next: { start, end } }` (or the same in `GET /settings`) |
| G74 | How many use each role | Counting members on the web; invitations not counted | `GET /roles` adds `memberCount` and `invitationCount` |
| G75 | Readable history and "who" | Events carry ids and raw fields | `GET /audit` adds `actor { id, name } \| null` (null = Automático), `entityLabel` (also for deleted items), field labels and formatted values for the diff, and an `actorId` filter; `GET /members` adds `lastActivityAt` (latest audit event of the member) |
