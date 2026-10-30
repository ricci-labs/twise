---
summary: The components behind the settings round, in build order, mapped to what already exists in apps/web.
read_when: Creating or changing a component used by Configurações, Membros, Papéis, Convites, Minha conta or Histórico.
updated: 2026-10-29
---

# Components (settings round)

Reuse first (`../../architecture/web-components.md`): `PageFrame`, `ChoiceChips`, `Avatar`, `Badge`, `ActionMenu`/`ItemActions`, `ConfirmDialog`, `Sheet`, `Toast`, `EmptyBlock`, `ListSkeleton`, `SectionError`, the form fields, `Switch`, `Stepper`, `ThemePicker` if it exists.

| # | Component | Base | Notes |
|---|---|---|---|
| 1 | `MetaLine` (app-wide) | the second line of every row | Splits on " · " and renders each piece as an unbreakable chunk; a chunk that does not fit drops whole to the next line, without its dot, starting with a capital letter. Max 2 lines then "…". Use in every row's support line |
| 2 | `SettingsHubRow` / `SettingsHub` | list rows | Icon tile 36 px, title (2 lines), current value (2 lines, `MetaLine`), chevron; groups with a small-caps title and an optional note under the list |
| 3 | `SettingsFormPage` | the form pages | Back + title + optional subtitle; form; sticky footer with one primary (disabled until changed). Read-only mode: lock note on top, controls dimmed, no footer |
| 4 | `PeriodChoice` | radio cards | Three cards, the number picker inside the sentence; preview block from G73 |
| 5 | `MemberRow` | — | Avatar 42 px, name + "você" pill, email (own line, 2 lines, `overflow-wrap:anywhere`), role badge + "Desde" on line 3, "⋯" |
| 6 | `RoleSheet` | radio cards in a tall sheet | Disabled cards for roles the editor can't give |
| 7 | `RoleCard` | — | Name, type badge, usage (G74), one-sentence description; lock line for the owner; "⋯" (custom roles) or a chevron, never both |
| 8 | `PermissionRows` (mobile) / `PermissionMatrix` (desktop) | chips / checkboxes | Only valid actions per area; ticking any ticks "Ver", unticking "Ver" clears the rest; actions the editor lacks show a lock and are disabled |
| 9 | `RolePresetButtons` | — | Three equal buttons in a grid ("Admin", "Membro", "Leitor") |
| 10 | `InvitationRow` | `MemberRow` | Email/phone icon tile, the contact, role badge + "Vale até", "Convidado por … em …" |
| 11 | `InviteForm` + `InviteLinkSheet` | forms | Channel segmented control, field, role picker; one-time link sheet with the warning and two equal buttons |
| 12 | `AccountHeader`, `PasswordField` (eye inside), `QuietHours`, `NotifyDaysStepper` + example, `ThemeCards` | — | As in the screens |
| 13 | `AuditEventRow` | list rows | Avatar or bolt, sentence (3 lines), `MetaLine` with time · area · ref; "pelo WhatsApp" badge first |
| 14 | `AuditChange` | — | Who/when/how, `DiffTable` (Campo / Antes / Depois, changed row tinted), reference sentence; in a sheet on the phone, in the right column on desktop, with the item timeline below |
| 15 | `PairedCardGrid` (desktop, app-wide) | CSS grid | Two equal columns, `align-items: stretch`, each card a flex column with its footer pushed down; `.span-2` for an unpaired card |
| 16 | `WorkScreen` (desktop, app-wide) | — | See decisions.md → rule 4: page height fixed to the window, two panes (`min-height:0`, own scroll), sticky pane header, auto-load sentinel, end/error rows, fallback below 700 px |
| 17 | `ResultTiles` / `MembersTable` / `InvitationsTable` / `RoleTiles` | tables | Tables on the full row; summaries show the first 4–6 + "Ver todos os N" |
