import {
  chargeClosingFor,
  chargeSubject,
  chargeTextIssues,
  fillChargeTags,
  unknownChargeTags,
} from '@shared/contacts/charge-text/charge-text'
import {
  DEFAULT_CHARGE_CLOSINGS,
  DEFAULT_CHARGE_TEXT,
} from '@shared/contacts/charge-text/charge-text.constants'
import { chargeTextSchema } from '@shared/contacts/charge-text/charge-text.schemas'
import type { ChargeTagSource } from '@shared/contacts/charge-text/charge-text.types'
import { describe, expect, it } from 'vitest'

const SOURCE: ChargeTagSource = {
  contactName: 'Contact J',
  requesterName: 'Member A',
  workspaceName: 'Casa',
  totalCents: 20_000,
  dueOn: '2026-10-10',
}

describe('fillChargeTags', () => {
  it('fills every tag with the charge values', () => {
    expect(fillChargeTags('{contato}|{quem cobra}|{valor}|{vencimento}|{espaço}', SOURCE)).toBe(
      'Contact J|Member A|R$ 200,00|10/10/2026|Casa',
    )
  })

  it('fills a tag every time it appears and keeps unknown ones as written', () => {
    expect(fillChargeTags('{contato}, {contato} e {apelido}', SOURCE)).toBe(
      'Contact J, Contact J e {apelido}',
    )
  })

  it('fills the due date with nothing when there is none', () => {
    expect(fillChargeTags('até {vencimento}', { ...SOURCE, dueOn: null })).toBe('até ')
  })
})

describe('chargeSubject', () => {
  it('fills the default subject', () => {
    expect(chargeSubject(DEFAULT_CHARGE_TEXT.subject, SOURCE)).toBe(
      'Member A te enviou uma cobrança de R$ 200,00',
    )
  })

  it('cuts a filled subject to 120 characters', () => {
    const longName = 'N'.repeat(130)
    const subject = chargeSubject('{quem cobra} cobra', { ...SOURCE, requesterName: longName })
    expect(subject).toHaveLength(120)
    expect(subject.endsWith('N…')).toBe(true)
  })
})

describe('chargeClosingFor', () => {
  it('gives each channel its default closing when the workspace kept the default', () => {
    expect(chargeClosingFor(null, 'whatsapp')).toBe('')
    expect(chargeClosingFor(null, 'email')).toBe(DEFAULT_CHARGE_CLOSINGS.email)
  })

  it('uses the workspace closing on both channels, even when it is empty', () => {
    expect(chargeClosingFor('Valeu!', 'whatsapp')).toBe('Valeu!')
    expect(chargeClosingFor('', 'email')).toBe('')
  })
})

describe('chargeTextIssues', () => {
  it('accepts the default text', () => {
    expect(chargeTextIssues(DEFAULT_CHARGE_TEXT)).toEqual([])
  })

  it('names the first unknown tag of each field', () => {
    expect(
      chargeTextIssues({
        subject: '{valor} de {apelido}',
        opening: 'Oi {Contato} e {nome}',
        closing: 'Até {vencimento}',
      }),
    ).toEqual([
      { field: 'subject', reason: 'unknown_tag', tag: '{apelido}' },
      { field: 'opening', reason: 'unknown_tag', tag: '{Contato}' },
    ])
  })

  it('refuses an empty subject or opening but accepts an empty closing', () => {
    expect(chargeTextIssues({ subject: '', opening: '', closing: '' })).toEqual([
      { field: 'subject', reason: 'empty' },
      { field: 'opening', reason: 'empty' },
    ])
  })

  it('keeps each field within its limit, counting the text as written', () => {
    const fits = { subject: 'S'.repeat(120), opening: 'O'.repeat(300), closing: 'C'.repeat(300) }
    expect(chargeTextIssues(fits)).toEqual([])
    expect(
      chargeTextIssues({
        subject: `${fits.subject}S`,
        opening: `${fits.opening}O`,
        closing: `${fits.closing}C`,
      }),
    ).toEqual([
      { field: 'subject', reason: 'too_long', maxLength: 120 },
      { field: 'opening', reason: 'too_long', maxLength: 300 },
      { field: 'closing', reason: 'too_long', maxLength: 300 },
    ])
  })
})

describe('unknownChargeTags', () => {
  it('lists the tags that are not in the list', () => {
    expect(unknownChargeTags('{contato} {apelido} {} {espaço} {quem  cobra}')).toEqual([
      '{apelido}',
      '{}',
      '{quem  cobra}',
    ])
  })
})

describe('chargeTextSchema', () => {
  it('trims the fields and takes a null closing as the channel default', () => {
    expect(
      chargeTextSchema.parse({ subject: '  Assunto ', opening: ' Abertura\n', closing: null }),
    ).toEqual({ subject: 'Assunto', opening: 'Abertura', closing: null })
  })

  it('refuses a missing field or an extra one', () => {
    expect(chargeTextSchema.safeParse({ subject: 'A', opening: 'B' }).success).toBe(false)
    expect(
      chargeTextSchema.safeParse({ subject: 'A', opening: 'B', closing: null, footer: 'C' })
        .success,
    ).toBe(false)
  })
})
