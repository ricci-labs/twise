import { auditChangesOf } from '@shared/audit/audit-fields'
import { describe, expect, it } from 'vitest'

const CHECKING = '01900000-0000-7000-8000-000000000001'
const GROCERIES = '01900000-0000-7000-8000-000000000002'
const BAKERY = '01900000-0000-7000-8000-000000000003'

function entry(amountCents: number, categoryId = GROCERIES) {
  return {
    id: 'entry',
    description: 'Padaria',
    occurredOn: '2026-10-19',
    entryType: 'expense',
    notes: null,
    postings: [
      { lineNo: 1, accountId: categoryId, accountKind: 'expense_category', amountCents },
      { lineNo: 2, accountId: CHECKING, accountKind: 'checking', amountCents: -amountCents },
    ],
  }
}

describe('auditChangesOf', () => {
  it('lists the fields of a change in order and marks the ones that changed', () => {
    const changes = auditChangesOf('journal_entries', entry(1850), entry(2100, BAKERY))
    expect(
      changes.map((change) => [change.field, change.before, change.after, change.changed]),
    ).toEqual([
      ['amountCents', 1850, 2100, true],
      ['description', 'Padaria', 'Padaria', false],
      ['occurredOn', '2026-10-19', '2026-10-19', false],
      ['categoryId', GROCERIES, BAKERY, true],
      ['accountId', CHECKING, CHECKING, false],
      ['entryType', 'expense', 'expense', false],
    ])
    expect(changes[0]).toMatchObject({ kind: 'money', reference: null })
    expect(changes[3]).toMatchObject({ kind: 'reference', reference: 'account' })
  })

  it('reads the amount, category and account of an entry from its postings, not from shares', () => {
    const shared = {
      ...entry(3000),
      postings: [
        ...entry(2000).postings.slice(0, 1),
        { lineNo: 2, accountId: 'receivable', accountKind: 'receivable', amountCents: 1000 },
        { lineNo: 3, accountId: CHECKING, accountKind: 'checking', amountCents: -3000 },
      ],
    }
    const fields = Object.fromEntries(
      auditChangesOf('journal_entries', null, shared).map((change) => [change.field, change.after]),
    )
    expect(fields).toMatchObject({ amountCents: 3000, categoryId: GROCERIES, accountId: CHECKING })
  })

  it('shows only the after side of a creation and the before side of a removal', () => {
    const created = auditChangesOf('workspace_holidays', null, {
      name: 'Feriado',
      onDate: '2026-11-20',
    })
    expect(created).toEqual([
      {
        field: 'name',
        kind: 'text',
        reference: null,
        before: null,
        after: 'Feriado',
        changed: true,
      },
      {
        field: 'onDate',
        kind: 'date',
        reference: null,
        before: null,
        after: '2026-11-20',
        changed: true,
      },
    ])
    const removed = auditChangesOf('entry_attachments', { name: 'nota.jpg' }, null)
    expect(removed).toEqual([
      {
        field: 'name',
        kind: 'text',
        reference: null,
        before: 'nota.jpg',
        after: null,
        changed: true,
      },
    ])
  })

  it('leaves out ids, timestamps and fields empty on both sides', () => {
    const changes = auditChangesOf(
      'contacts',
      { id: 'c', name: 'Contact A', email: null, updatedAt: '2026-10-01T10:00:00Z' },
      { id: 'c', name: 'Contact A', email: null, updatedAt: '2026-10-02T10:00:00Z' },
    )
    expect(changes.map((change) => change.field)).toEqual(['name'])
  })

  it('has nothing to show for lists and for tables it does not describe', () => {
    expect(auditChangesOf('role_permissions', [], [{ module: 'entries', action: 'view' }])).toEqual(
      [],
    )
    expect(auditChangesOf('somewhere_else', { name: 'x' }, { name: 'y' })).toEqual([])
  })
})
