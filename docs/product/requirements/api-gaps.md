---
summary: API gaps and defects found while writing the web requirements (2026-09-29) and the Home design (2026-10-09) — errors that surface as 500, reads the screens need, overview fields the Home needs, and behaviours to decide — with the proposed fix and when.
read_when: Planning the web work, fixing the API before a screen, or wondering why a requirement works around something.
updated: 2026-10-09
---

# API gaps found by the requirements

Found by reading every route against what the screens need (2026-09-29). Each item says what
happens today, what the UI does meanwhile, and the proposed fix. "Before the web" means the
matching screen would be wrong or fragile without it.

## Defects: errors that answer 500
| # | Today | Proposed fix | When |
|---|---|---|---|
| G1 | ~~`DELETE` or `PUT /entries/:id` on an entry with a line on a closed invoice answered 500.~~ **Fixed:** the service checks first and answers `409 ENTRY_ON_CLOSED_INVOICE`. | The UI also hides these actions (`modules/entries.md` → RF-ENT-10). | Done |
| G2 | ~~`GET /simulations/purchase` on a card with an amount in cents smaller than the installments (R$ 0,05 in 10×) answered 500.~~ **Fixed:** the query schema refuses it (`400 SIMULATION_QUERY_INVALID`). | The UI also limits installments to the amount in cents. | Done |
| G3 | ~~`ownerUserId` (accounts) or `holderUserId` (cards) with an unknown user answered 500, and a non-member was accepted.~~ **Fixed:** the database requires an active member (`400 OWNER_NOT_A_MEMBER` / `HOLDER_NOT_A_MEMBER`). | The UI picks them from the member list. | Done |
| G4 | ~~Password reset sent the "senha trocada" e-mail inside the request, so a mail failure answered 500 after the password changed. Same for the verification e-mail of an invitation sign-up by phone.~~ **Fixed:** both go out in the background, like the other account e-mails. | Nothing for the UI. | Done |

## Reads the screens need
| # | Today | UI meanwhile | Proposed fix | When |
|---|---|---|---|---|
| G5 | ~~No route for **one** entry, contact or charge.~~ **Fixed.** | Detail screens load them, showing the list cache first when there is one. | `GET /entries/:entryId`, `GET /contacts/:contactId`, `GET /charges/:chargeId`. | Done |
| G6 | ~~Charge items carry only `postingId` and amount.~~ **Fixed.** | Shows each item's description, installment and date. | Every item carries `description`, `installmentNo`, `installmentCount`, `effectiveOn`. | Done |
| G7 | ~~No route for a contact's **open items**.~~ **Fixed.** | `CON-02` and the charge preview read it. | `GET /contacts/:contactId/open-items?until=`, the same computation the charge uses. | Done |
| G8 | The upload size limit (`FILE_MAX_BYTES`) isn't exposed. | Uses a build-time value (10 MB). | Add it to `GET /api/auth/config` (or a workspace config route). | With attachments |
| G9 | `occurrence_overdue` insights carry the occurrence id but not its description or type. | Looks it up in `GET /occurrences` when it's in range. | **Done:** `description` and `entryType` are in the insight values. | Home round (with G29) |
| G10 | Reminder e-mails link to the app's home. | — | Link bills to `PLAN-03` and invoices to `CARD-03` with the ids. | With notifications |
| G11 | The version history of an edited entry is only readable through `GET /audit`, which members and viewers can't open. | `ENT-03` shows "Histórico" only with `audit:view`. | Decide: a small `GET /entries/:id/versions` for `entries:view`. | Later |

## Overview fields the Home needs
From the Home design (`../../design/home/data.md`), approved by the user on 2026-10-09. The web
never computes a metric, so every number, percent and day count on `HOME-01` comes from
`GET /overview`. Each is one metric file in `packages/shared/src/reports/metrics/` (ADR 0024), in
the Home round (`../roadmap.md`). Field names are the plan; the PR that adds one fixes it here.
| # | Widget | Proposed field |
|---|---|---|
| G25 | "faltam {n} dias", pace mark on budgets | **Done:** `periodProgress`: `total`, `elapsed`, `left`, `elapsedPercent` |
| G26 | "Média mensal (3 meses)" under Gasto (was only inside `reserveCoverage`, null without a reserve) | **Done:** `spendingAverage`: `monthlyCents`, `periods` |
| G27 | "% da renda" under Gasto and Comprometido; the 100% bar | **Done:** `incomeShare`: `spentPercent`, `committedPercent`, `freePercent` (null without budget income) |
| G28 | Pace radial | **Done:** `periodPace`: `usedPercent`, `elapsedPercent`, `pointsAhead` |
| G29 | Bills due in 7 days and the count under Comprometido | **Done:** `billsDue`: `until`, `count`, `totalCents` (coming ones), `overdueCount`, `items[]` (`occurrenceId`, `description`, `dueOn`, `amountCents`, `daysFromToday`), expenses only |
| G30 | "R$ X são de outras pessoas" on each invoice | **Done:** `nextInvoice[].frontedCents` |
| G31 | Receivables card | **Done:** `receivables` (null when nobody owes): `owedCents`, `overdueCents`, `contactCount`, `next` (`contactId`, `dueOn`, `amountCents`) |
| G32 | Reserve radial and goals with a deadline | **Done:** `reserveCoverage.percent`; `goalProgress[]` (`goalId`, `name`, `savedCents`, `targetCents`, `targetOn`, `percent`), soonest first |
| G33 | "+25% acima da média" on commissions | **Done:** `variableVsAverage`: `percent` (null before any commission in the period) |
| G34 | Achievements of a closed period | **Done:** `periodSummary` (null unless the period is closed): `leftCents`, `positiveStreak` (this period + up to the 6 loaded before) + `streakCapped`, `budgetsWithin` / `budgetsTotal`, `billsOnTime` / `billsTotal`, `reserveAddedCents`, `goals[]` (`goalId`, `startPercent`, `endPercent`) |
| G36 | The shell shows who shares the space ("Dono · 2 pessoas", avatars on the phone), but only `GET /members` names them, and viewers can't call it | **Done:** `GET /api/workspaces/:id` adds `memberNames` for every member |
| G35 | Found by the demo household: in a **future** period nothing has elapsed, so a budget with an installment already recorded there reads `ahead` (expected R$ 0,00) and raises `budget_ahead` | **Done:** `budgetPace` reads `within` until the period starts (still `over` past the limit) |
| G37 | Design review (2026-10-09): the forecast card has a third tab "Todas" (all accounts together) and, when a stretch goes below zero, the line "Conta X fica negativa de 03/11 a 04/11, até o salário entrar." The web may not add balances or derive ranges | **Done:** `balanceForecastAll` (null with fewer than two everyday accounts: checking, wallet; savings and investments stay out) and, per series, `negativeFrom` / `negativeUntil` (null when it never goes below zero; `until` when it never recovers) |

## Behaviours to decide
| # | Today | Options |
|---|---|---|
| G12 | Stored **invoice status** is refreshed only when a purchase or payment is recorded on that card, so the invoices list can show "Aberta" after closing. The UI computes the status itself. | Refresh on read, or a nightly job (planned in the ledger doc). |
| G13 | An **archived card's invoices can't be paid** (the card counts as unavailable). | Allow invoice payments on archived cards. |
| G14 | **Refund ("estorno") and adjustment** entries are not accepted, so a closed invoice can't be corrected as the ledger doc prescribes. | Implement `refund` (on the open invoice) before users need it. |
| G15 | `loan` accounts can be created but no entry type moves money in or out of them. | Hide the kind in the UI until a loan flow exists (done in `modules/accounts-and-cards.md`), or add the flow. |
| G16 | A recurrence's `remindDaysBefore` is stored but unused (reminders use each member's lead time); `autoRecord` is phase 2. | The UI doesn't show them. Decide: drop the field, or make it override the member's lead time as the planning doc says. |
| G17 | An amount changed on one planned occurrence is lost when its recurrence changes (future pending occurrences are re-planned). | The UI warns. Option: keep edited amounts when re-planning. |
| G18 | A deleted goal left in the commission split yields nothing and blocks saving the split until removed. | Remove the step when the goal is deleted, or refuse deleting a goal in use. |
| G19 | Member notification preferences `notifyChannel`, `notifyDailyDigest`, `notifyBudgetThresholdPct` and `notifyVariableIncome` are stored but have no effect; reminders are always e-mail. | The UI shows only the lead time until each feature exists. |
| G20 | The "senha trocada" e-mail says every session ended, but a change while logged in keeps the current one. | Two texts (reset vs change). |
| G21 | Deleting a contact has no balance check and no restore. | The UI warns when the contact owes. Option: refuse, or add a restore. |
| G22 | Adding or removing a holiday doesn't move occurrences already planned. | The UI says so. Option: re-plan the affected rules. |
| G23 | No route archives or deletes a workspace (`isArchived` is read only). | Later, with LGPD erasure. |
| G24 | `docs/domain/model/ledger.md` said settlements "come later", but they exist. | Fixed in the same PR as this file. |
