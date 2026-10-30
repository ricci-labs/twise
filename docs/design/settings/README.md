---
summary: Overview of the settings round (SET-01 hub, MEM-01..03, ME-01, AUD-01): layouts, rules, build order.
read_when: Starting Configurações, Membros, Papéis, Convites, Minha conta or Histórico.
updated: 2026-10-29
---

# Settings, members, account and history

Requirements: `../../product/requirements/modules/workspace-and-members.md` (SET-01, MEM-01..03), `../../product/requirements/modules/auth-and-account.md` (ME-01), `../../product/requirements/modules/attachments-and-audit.md` (AUD-01). Screens: `screens.md`. Components: `components.md`. **Before building: `decisions.md`** (requirement changes, five app-wide rules, API G73–G75).

## Layouts

- **Configurações (mobile, `/configuracoes`):** a list in groups, each row with an icon tile, the title and the current value in one or two lines (so nothing needs opening to be read). Espaço: Nome e moeda, Mês financeiro, Orçamento, Calendário e fuso. Cobranças: Recebimento por Pix (SET-02), Mensagem das cobranças (SET-03). Planejamento: Feriados (PLAN-07). Each row opens its own screen with the group's fields and one "Salvar …" in the sticky footer (enabled only when something changed). A member without `settings:update` sees the same list with the line "Só donos e admins mudam as configurações. Você pode ver." and the screens with dimmed controls, a lock note and no save button. Viewers don't see Configurações.
- **Mês financeiro:** three choice cards, the number inside the sentence (the app's picker), the preview "Período atual: 5 out – 4 nov" and the next period, from the API (G73).
- **Membros (`/membros`):** title + "Convidar"; tabs Membros | Papéis | Convites (the pending count as a small badge). Member row: initial, name (2 lines) + "você" pill; the email alone on line 2 (up to 2 lines, breaks anywhere); line 3 starts with the role badge, then "Desde dd/mm/aaaa". "⋯": Mudar papel, Ver no histórico (G75), Remover do espaço; on your own row: Minha conta, Sair do espaço. A plain member sees no "Convidar" and no "⋯" on other rows.
- **Mudar papel:** tall sheet with the roles as choice cards (what each can do in one sentence); "Dono" only enabled for owners; roles holding permissions the editor lacks are disabled, so `OWNER_ONLY` and `PERMISSION_ESCALATION` don't happen in practice.
- **Refused actions** become dialogs that name the item and offer the way out: last owner ("Tornar Member B dono"), role in use ("Ver convites"), remove (with optional reason, up to 200).
- **Papéis:** one card per role: name, "Sistema" / "Do espaço" badge, how many use it (people and invitations, G74), what it can do in one sentence; "Dono" with a lock "Não pode ser alterado". The editor: name, description (200), "Começar a partir de" (Admin | Membro | Leitor, three equal buttons), and the permission rows (one row per area, chips Ver / Criar / Editar / Excluir only where valid; permissions the editor lacks show a lock and an info alert).
- **Convites:** pending, newest first: email or phone tile, the contact, role badge + "Vale até", "Convidado por … em …". The form: "Convidar por" E-mail | Telefone, the field, the role picker (default Membro). By phone: the sheet with the one-time link, the yellow warning, "Enviar pelo WhatsApp" and "Copiar link" of equal size.
- **Minha conta (`/conta`):** header with the initial, name and email; groups Você (Nome; E-mail read-only with a lock; Senha "Trocada em …"), Avisos (Horário de silêncio; Avisos do espaço Casa), Aparência (Tema "só neste aparelho"); "Sair" at the end. Password: current, new (eye inside the field), repeat. Quiet hours: switch next to the label; "Das" and "Até" side by side. Notifications: days-ahead stepper (0–30) with a real example. Theme: three cards with a miniature (Claro, Escuro, Automático), changes at once.
- **Histórico (`/historico`):** days grouped like Lançamentos; each event: avatar (or the bolt for "Automático"), the sentence with the item in bold, and below the time, the area and "ref. xxxxxxxx", "pelo WhatsApp" as a badge first. Filters Área and Quem (G75). 50 per load + "Carregar mais". Tapping opens the change: who/when/how, a before-and-after table with the changed row highlighted, the reference sentence and "Ver lançamento". From an entry ("Histórico deste lançamento") the item sits on top with an X to see everything.
- **Desktop:**
  - Configurações and Minha conta: two columns of cards paired by similar height (cards in a row share their height; "Salvar" at the foot of each). Configurações: [Nome e moeda | Calendário e fuso], [Mês financeiro | Orçamento], then "Cobranças e planejamento" on the full row with Pix, Mensagem and Feriados side by side. Minha conta: "Sair" in the page header; [Perfil | Tema], [Horário de silêncio | Avisos do espaço], Senha on the full row with the three fields side by side.
  - Membros: the members table on the full row (Pessoa | Papel | Desde | Última atividade | ⋯), then Convites pendentes as a table (the 4 newest + "Ver todos os N convites"), then Papéis as tiles (up to 6 + "Ver todos").
  - Papéis tab: the roles table (Papel | Tipo | Quem usa) and "O que cada papel pode" (one column per role; above 6 roles it scrolls sideways with the Área column fixed).
  - Papel: page with breadcrumb; name, description and "Começar a partir de" on the left with "Quem usa"; the permission matrix with checkboxes on the right; both columns end together.
  - Convidar: 560 px dialog over Membros.
  - Histórico: a work screen (see decisions.md): list on the left, the change on the right with "Neste lançamento" (the item's other changes) below; states loading more, error, end and low window.

## Build order

1. Docs PR (`decisions.md`): requirement changes, the five app-wide rules into `../../product/requirements/ui-standards.md`, G73–G75 into `../../product/requirements/api-gaps.md`.
2. App-wide rules in what is already built (support lines that break by whole pieces, paired desktop cards, lists on the full row, the offline bar on desktop).
3. Configurações hub and its screens (reusing the existing settings forms).
4. Membros, Papéis, Convites.
5. Minha conta.
6. Histórico, with the work-screen layout on desktop.
