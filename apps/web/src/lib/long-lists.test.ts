import { matchesSearch } from '@web/lib/long-lists'
import { describe, expect, it } from 'vitest'

describe('matchesSearch', () => {
  it('ignores case, accents and the spaces around the search', () => {
    expect(matchesSearch('Farmácia', ' FARMAC ')).toBe(true)
    expect(matchesSearch('Mercado', 'padaria')).toBe(false)
  })
})
