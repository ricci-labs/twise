import { formatWholeReais } from '@web/lib/format/money'
import { describe, expect, it } from 'vitest'

describe('formatWholeReais', () => {
  it('rounds to whole reais for compact comparisons', () => {
    expect(formatWholeReais(46_000)).toBe('R$ 460')
    expect(formatWholeReais(120_049)).toBe('R$ 1.200')
  })
})
