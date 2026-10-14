import { equalShares, halfShares } from '@shared/ledger/shares/quick-fills'
import { describe, expect, it } from 'vitest'

describe('equalShares', () => {
  it('splits the total between you and the contacts', () => {
    expect(equalShares(24_000, 2)).toEqual([8000, 8000])
  })

  it('leaves the rounding cents in your part', () => {
    expect(equalShares(10_000, 2)).toEqual([3333, 3333])
  })

  it('has nothing to fill without contacts', () => {
    expect(equalShares(10_000, 0)).toEqual([])
  })
})

describe('halfShares', () => {
  it('gives the contacts half of the total, split between them', () => {
    expect(halfShares(24_000, 1)).toEqual([12_000])
    expect(halfShares(24_000, 2)).toEqual([6000, 6000])
  })

  it('leaves the rounding cents in your part', () => {
    expect(halfShares(10_001, 3)).toEqual([1666, 1666, 1666])
  })

  it('has nothing to fill without contacts', () => {
    expect(halfShares(10_000, 0)).toEqual([])
  })
})
