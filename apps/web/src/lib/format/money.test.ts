import {
  centsOfTypedAmount,
  formatTypedAmount,
  formatWholeReais,
  tidyTypedAmount,
} from '@web/lib/format/money'
import { describe, expect, it } from 'vitest'

describe('formatWholeReais', () => {
  it('rounds to whole reais for compact comparisons', () => {
    expect(formatWholeReais(46_000)).toBe('R$ 460')
    expect(formatWholeReais(120_049)).toBe('R$ 1.200')
  })
})

describe('typed amounts', () => {
  it('reads what people type in Brazilian notation as cents', () => {
    expect(centsOfTypedAmount('86,40')).toBe(8640)
    expect(centsOfTypedAmount(' 1.234,5 ')).toBe(123_450)
    expect(centsOfTypedAmount('1234')).toBe(123_400)
    expect(centsOfTypedAmount('')).toBeNull()
    expect(centsOfTypedAmount('12,345')).toBeNull()
    expect(centsOfTypedAmount('dez')).toBeNull()
  })

  it('writes cents back without the currency, as the field shows them', () => {
    expect(formatTypedAmount(123_450)).toBe('1.234,50')
    expect(formatTypedAmount(0)).toBe('0,00')
  })

  it('tidies a valid amount on blur and leaves anything else as typed', () => {
    expect(tidyTypedAmount('1234,5')).toBe('1.234,50')
    expect(tidyTypedAmount('12,3,4')).toBe('12,3,4')
  })
})
