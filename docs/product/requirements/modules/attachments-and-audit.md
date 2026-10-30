---
summary: Functional requirements for attachments (receipts on entries and charges), the audit history screen, and what the user experiences from notifications (reminder emails).
read_when: Designing or building ATT-01, AUD-01, or anything about receipts, history or reminders.
updated: 2026-10-30
---

# Attachments, history and notifications

Standards: `../ui-standards.md`. Messages per code: `../error-messages.md`. Domain:
`../../../domain/model/support.md`. API: `/api/workspaces/:id/{entries|charges}/:id/attachments`,
`/files/:fileId`, `/audit`.

## Attachments (ATT-01, MVP)
A section inside `ENT-03` (entry) and in each charge of `CON-02`.

Rules:
- Accepted: JPEG, PNG, WebP, HEIC and PDF, **detected from the file's content** (a renamed file
  doesn't pass). Up to 10 MB by default (the server's `FILE_MAX_BYTES`; the web reads the same
  value from its build config).
- The same file attached twice (anywhere) is stored once; its first name is kept.
- A file can belong to several entries and charges. Removing it from one keeps it on the others;
  when it belongs to nothing, it goes to a trash for 30 days and is then deleted for good.
- Editing an entry (a new version) carries its attachments along.
- Names keep up to 255 characters; a file with no name becomes "anexo.pdf", "anexo.jpg"…

**RF-ATT-1 List** (`attachments:view`): thumbnails for images, a PDF icon otherwise; name, size
("1,2 MB"), who attached and when. Tap opens a viewer: images and PDF inline (`GET /files/:id`);
HEIC shows "Pré-visualização indisponível" with "Baixar". Empty: "Nenhum comprovante anexado."

**RF-ATT-2 Upload** (`attachments:create`): "Anexar comprovante" opens the file picker; on phones
it also offers the camera. Several files at once, each with its own progress and result. The web
checks type (by extension and declared type, as a first filter) and size before uploading.

| Check | Message |
|---|---|
| empty or no file | "Escolha um arquivo." |
| over the size limit (`FILE_TOO_LARGE`, and `PAYLOAD_TOO_LARGE` on this route) | "O arquivo passa de 10 MB. Tire uma foto menor ou envie um PDF." |
| type (`FILE_TYPE_NOT_ALLOWED`) | "Envie uma foto (JPG, PNG, WebP ou HEIC) ou um PDF." |
| entry gone (`ENTRY_NOT_FOUND`) | "Este lançamento foi excluído ou editado. Atualize a página." |

Success: toast "Comprovante anexado." (or "3 comprovantes anexados.").

**RF-ATT-3 Remove** (`attachments:delete`; owners and admins by default): "Remover" asks "Remover
este comprovante do lançamento?" → toast "Comprovante removido." Error `ATTACHMENT_NOT_FOUND`
("Este comprovante já foi removido.").

## AUD-01 History (MVP)
Route `/historico`. Permission `audit:view` (owners and admins by default). `GET /audit`, paged,
newest first; filters `tableName`, `rowId` and `actorId` (G75). Design: `../../../design/settings/`
(screens "Historico*").

**RF-AUD-1** A timeline grouped by day, like Lançamentos. Each event: the member's avatar (or the
bolt for "Automático"), a sentence built from the event with the item in **bold**, and below it a
support line (`../ui-standards.md` → Support lines) with the time, the area and "ref. xxxxxxxx",
"pelo WhatsApp" as a badge first. The names come from the API (`actor`, `entityLabel`, also for
deleted items, G75). E.g.:
- "Member A registrou o lançamento Mercado (R$ 87,50)";
- "Member B editou o lançamento Padaria: valor de R$ 25,00 para R$ 31,00";
- "Member A excluiu a conta Carteira";
- "Member A mudou o papel de Member B para Membro".
Tapping an event opens the change in a sheet (phone) or the right pane (desktop): who, when and how,
before and after field by field with the changed fields highlighted (the API's `changes`: field
keys, kinds and names for ids, G75; the web holds the labels and formats money and dates), the reference sentence, "Ver lançamento", and "Neste lançamento" (the
item's other changes).
**RF-AUD-2** Filters: area (the API's `area`, also on each event: "Lançamentos" = `journal_entries`, "Contas" =
`ledger_accounts`, "Cartões" = `card_details`, "Contatos" = `contacts`, "Cobranças" = `charges`,
"Planejamento" = recurrences, occurrences, budgets, goals, allocation and holidays, "Membros e
acesso" = memberships, roles, invitations, "Configurações" = workspaces and settings, shared `AUDIT_AREAS`); and a
single item (from "Histórico" links in other screens, e.g. `ENT-03` passes the entry id: the item
sits on top with an X to see everything); "Quem", a member or "Automático" (`actorId`, G75), next to
"Área" (`MEM-01` → "Ver no histórico" opens it filtered).
**RF-AUD-3** Paging with `nextCursor`, 50 per load ("Carregar mais"). Desktop is a work screen
(`../ui-standards.md` → Work screens): the list on the left, the change on the right, the next 50
loading on their own near the end. Empty: "Nada registrado ainda." Error
`AUDIT_QUERY_INVALID` resets the filters.
**RF-AUD-4** Each event shows its reference (first 8 characters of `traceId`), so a problem report
can be traced.
Notes: attachment events use the file id as `rowId`; membership preferences use the user id; the
commission split uses the workspace id.

## Notifications (what the user experiences)
There is no in-app inbox. Today the app sends by e-mail, to each member:
| Reminder | When | E-mail |
|---|---|---|
| Bill ("{descrição} vence em {data}") | a pending planned expense due within the member's lead time (default 3 days; 0 = on the day) | "Lembrete: {descrição} vence em {data}, no valor de (cerca de) R$ X." + "Abrir o Twise" |
| Card invoice ("Fatura do {cartão} vence em {data}") | an invoice due within the lead time with something still to pay | "…com R$ X até agora. O valor pode mudar até o fechamento." + "Ver a fatura" |
Each reminder is sent once per member. Quiet hours (`ME-01`) delay it to the end of the window, in
the workspace time zone.

**RF-NOT-1** The e-mail buttons open the app on the right screen: bills → `PLAN-03`, invoices →
`CARD-03` (when the links carry the target; today they open the app's home, see
`../api-gaps.md`).
**RF-NOT-2** (Later) A notifications area in the app, budget alerts, a daily digest, commission
suggestions, and WhatsApp as a channel, as the matching features arrive.
