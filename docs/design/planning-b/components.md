---
summary: The components behind planning round B (PLAN-05..07), in build order, mapped to what already exists in apps/web.
read_when: Creating or changing a component used by goals, the commission split or holidays.
updated: 2026-10-15
---

# Components (planning, round B)

Reuse first (`../../architecture/web-components.md`): `PageFrame`, `SegmentedControl`, `PickerField`/`PickerSheet`, `CalendarSheet`, `MoneyInput`, `ChoiceChips`, `Stepper`, `Switch`, `ActionMenu`/`ItemActions`, `ConfirmDialog`, `Toast`, `EmptyBlock`, `ProgressBar`, `KpiCard`, `Badge`, `Alert`, `Breadcrumb`, the round A `OccurrenceRow` date block.

| # | Component | Base | Notes |
|---|---|---|---|
| 1 | `ReserveCard` | `Card` | Mint-soft surface, mint border at 45%. Label "Reserva de emergência" (mint-ink), amount 30 px display (36 px on the desktop, never wraps), "de R$ Y · guardado na {conta}" (2 lines max), loose drawing 56 px, "⋯". Bar mint on a light track. Footer: pill "Cobre **2,4 meses** de gastos" (white, shield icon) and "67% · faltam R$ X" (moves to its own line when it does not fit). Empty variant: dashed border, drawing, one sentence, "Criar a reserva" (opens the form with the reserve switch on) |
| 2 | `GoalCard` | `Card` | Drawing, name (2 lines), second line "Guardado em {conta}" with the "Meta atingida" badge first, "⋯". "R$ X de R$ Y" (20 px display + muted; moves whole). Bar blue `#3f67d1` (mint when reached). Footer "32% · até jul/27" / "faltam R$ X". Hint: "Para chegar em jul/27: **R$ 1.134,00 por mês**" (calendar icon) or, reached, mint hint "Chegou lá. Pode concluir a meta ou aumentar o valor." Desktop: 3 per row, same height, the hint at the bottom |
| 3 | `GoalActions` | `ActionSheet` / `ActionMenu` | "Guardar dinheiro" (opens `ENT-02` as a transfer to the goal's account, amount = the monthly suggestion), "Ver lançamentos da conta", "Editar", "Excluir" (danger) |
| 4 | `SplitShortcut` | `Card` link | Drawing "juntos", "Divisão da comissão", "{n} passos. A próxima comissão vai primeiro para {destino do passo 1}.", "Editar divisão" (hidden for viewers), chevron |
| 5 | `GoalForm` | the forms of round A | Info alert on top, name, `MoneyInput`, `PickerField` "Guardado em", date "Até quando" (empty = "Sem prazo"), the monthly preview (`pv` block with the calendar drawing, G58), the reserve `Switch` (disabled with "Já existe uma: a da Poupança. Só pode haver uma.") |
| 6 | `GoalAccountPicker` | `PickerSheet` | Active money accounts with "Saldo de hoje"; accounts of another goal are dimmed and say which ("É da meta Troca do carro"), not selectable; last row "Criar uma conta para a meta" (opens ACC-02 and comes back with it chosen). Selected = outline, no check |
| 7 | `AllocationStepRow` | — | Card row 72 px min: grip button (32×44, "Arrastar para mudar a ordem"), drawing 42 px, body: "Passo N" (12 px muted), title (2 lines), detail (2 lines), "⋯". States: lifted (scale 1.02, float shadow, ink border), invalid (danger border, "Meta excluída. Remova este passo para salvar." in danger), read-only (no grip, no "⋯", padding 14 px 16 px) |
| 8 | `StepActions` | `ActionSheet` / `ActionMenu` | "Mover para cima" (not on the first), "Mover para baixo" (not on the one before "o que sobrar"), "Editar", "Remover passo" (danger; toast "Passo removido." + "Desfazer"). The "rest" step has only Editar |
| 9 | `StepTypePicker` | radio cards (`ncard`) in a sheet | The 5 types, one sentence each; "O que sobrar" disabled when it exists ("Só pode ser o último. Já existe um: a Conta X."). "Continuar" |
| 10 | `StepFieldsSheet` | `Sheet` / `Dialog` | By type: account + `Stepper` 1–100 % with help "Da comissão inteira, não do que sobra." and "Com R$ 1.500,00, dá **R$ 300,00**"; account + money; goal only; nothing for "cobrir". "Voltar" + "Adicionar passo" |
| 11 | `SplitExample` | `ed-sec` card | Chips "Esta comissão" / "Média" / "Outro valor" (outline selection; "Outro valor" opens a money field), "Com **R$ 1.500,00** (esta comissão):", rows "n · destino ······ R$ X" (dotted leader; skipped step shows "—"), a solid line, "Sem destino ······ R$ 0,00", footnote "Nada se move sozinho…". Desktop: a stacked bar above the rows, one colour per step, the step numbers in the same colours |
| 12 | `CommissionHistory` (PROPOSTA, G59) | `Card` list | Last 3 variable incomes: "Este período · R$ 1.500,00", badge "Falta registrar"/"Dividida", "05/10 · 1 de 4 partes", a small bar, "Continuar" (opens HOME-03 with that amount) or "Ver" |
| 13 | `YearStepper` | — | Pill with ‹ 2026 › (2000–2100, `HOLIDAY_QUERY_INVALID` never reachable) |
| 14 | `HolidayRow` | the round A date block | Date block (past: outline only and muted; next: ink fill), name (2 lines), second line "Próximo" badge first, weekday, " · cai no fim de semana"; "⋯" only for the workspace's |
| 15 | `HolidaySheet` | `Sheet` / `Dialog` | "Data" (`CalendarSheet`), "Nome", help "Vale todo ano? Adicione um por ano…"; errors on the date field on blur |
| 16 | `MiniMonthCalendar` (desktop) | `CalendarSheet` grid | 7 columns Sunday first, 28 px day cells; national = ink circle, workspace = mint circle, past = 40% tint, today = 2 px ink ring, next = amber outer ring; weekends muted. Under the grid, a solid line and the month's holidays ("02 Finados", "espaço" tag) or "Sem feriados". Current month card outlined; past months' titles muted |
| 17 | `NextHolidayCard` (desktop) | `Card` | "Próximo feriado", ink date block 60×64, name 26 px display, "Segunda-feira · daqui a 18 dias", amber box "Muda 1 conta fixa: Vale-alimentação (1º dia útil) passa para 03/11." (G60) |
| 18 | `SettingsRow` | `AccountRow`-like link | Drawing, title, one line of state ("15 em 2026 · próximo: Finados, 02/11"), chevron; grouped with headings |
