import type { AuditEvent } from '@web/features/audit/audit.types'
import {
  auditChangeDetailOf,
  auditChangeRowsOf,
  auditDaysOf,
  auditRowDetailOf,
  auditSentenceOf,
  auditTitleOf,
} from '@web/features/audit/components/audit-views'
import {
  AUTOMATIC_OCCURRENCE,
  DELETED_CARTEIRA,
  EDITED_PADARIA,
  HOUSEHOLD_EVENTS,
  RECORDED_MERCADO,
  RECORDED_UBER,
  ROLE_CHANGED,
} from '@web/testing/audit-api'
import { describe, expect, it } from 'vitest'

const TODAY = '2026-10-30'

function textOf(event: unknown): string {
  return auditSentenceOf(event as AuditEvent)
    .map((part) => (part.isStrong ? `**${part.text}**` : part.text))
    .join('')
}

describe('audit sentences', () => {
  it('says who did what to which item, with the amount of an entry', () => {
    expect(textOf(RECORDED_MERCADO)).toBe(
      '**Member A** registrou o lançamento **Mercado da semana** (R$\u00a086,40)',
    )
    expect(textOf(DELETED_CARTEIRA)).toBe('**Member A** excluiu a conta **Carteira**')
    expect(textOf(AUTOMATIC_OCCURRENCE)).toBe('**Automático** criou o previsto de **Internet**')
  })

  it('names the only changed field with its old and new value', () => {
    expect(textOf(EDITED_PADARIA)).toBe(
      '**Member B** editou o lançamento **Padaria**: valor de R$\u00a018,50 para R$\u00a021,00',
    )
    expect(auditTitleOf(EDITED_PADARIA as AuditEvent)).toBe('Member B editou o lançamento Padaria')
  })

  it('tells a role change and a category apart', () => {
    expect(textOf(ROLE_CHANGED)).toBe('**Member A** mudou o papel de **Member B** para Admin')
    const category = {
      ...DELETED_CARTEIRA,
      entityLabel: 'Lazer',
      changes: [
        {
          field: 'kind',
          kind: 'choice',
          reference: null,
          before: 'expense_category',
          after: 'expense_category',
          changed: false,
        },
      ],
    }
    expect(textOf(category)).toBe('**Member A** excluiu a categoria **Lazer**')
  })
})

describe('audit details', () => {
  it('reads time, area and reference on the row, day and channel on the change', () => {
    expect(auditRowDetailOf(EDITED_PADARIA as AuditEvent)).toBe(
      '11:05 · Lançamentos · Ref. a91b2f07',
    )
    expect(auditRowDetailOf(AUTOMATIC_OCCURRENCE as AuditEvent)).toBe('06:00 · Planejamento')
    expect(auditChangeDetailOf(EDITED_PADARIA as AuditEvent, TODAY)).toBe('Hoje, 11:05 · Pela web')
    expect(auditChangeDetailOf(RECORDED_UBER as AuditEvent, TODAY)).toBe(
      'Ontem, 21:40 · Pelo WhatsApp',
    )
  })

  it('formats each field and marks only what an edit changed', () => {
    expect(auditChangeRowsOf(EDITED_PADARIA as AuditEvent)).toEqual([
      { label: 'Valor', before: 'R$\u00a018,50', after: 'R$\u00a021,00', isChanged: true },
      { label: 'Descrição', before: 'Padaria', after: 'Padaria', isChanged: false },
      { label: 'Data', before: '19/10/2026', after: '19/10/2026', isChanged: false },
      {
        label: 'Categoria',
        before: 'Mercado › Padaria',
        after: 'Mercado › Padaria',
        isChanged: false,
      },
    ])
    expect(auditChangeRowsOf(RECORDED_MERCADO as AuditEvent)[0]).toEqual({
      label: 'Valor',
      before: '—',
      after: 'R$\u00a086,40',
      isChanged: false,
    })
  })

  it('groups the events by day in São Paulo', () => {
    const days = auditDaysOf(HOUSEHOLD_EVENTS as AuditEvent[], TODAY)
    expect(days.map((day) => [day.title, day.events.length])).toEqual([
      ['Hoje', 3],
      ['Ontem, 29 out', 2],
      ['Ter, 13 out', 1],
    ])
  })
})
