import { amountParts } from '@web/components/display/amount/amount'
import { describe, expect, it } from 'vitest'

describe('amountParts', () => {
  it('splits a value into the reais and the cents, pt-BR style', () => {
    expect(amountParts(234_000)).toEqual({ sign: '', whole: 'R$ 2.340', cents: ',00' })
  })

  it('uses the true minus sign, and a plus only when asked', () => {
    expect(amountParts(-38_000).sign).toBe('−')
    expect(amountParts(150_000, 'always').sign).toBe('+')
    expect(amountParts(0, 'always').sign).toBe('')
  })
})
