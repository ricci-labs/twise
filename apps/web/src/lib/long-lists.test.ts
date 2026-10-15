import { matchesSearch, partsMatching } from '@web/lib/long-lists'
import { describe, expect, it } from 'vitest'

describe('matchesSearch', () => {
  it('ignores case, accents and the spaces around the search', () => {
    expect(matchesSearch('Farmácia', ' FARMAC ')).toBe(true)
    expect(matchesSearch('Mercado', 'padaria')).toBe(false)
  })
})

describe('partsMatching', () => {
  it('marks the part that matched, keeping the accents and case of the text', () => {
    expect(partsMatching('Pão da manhã', 'PAO')).toEqual([
      { text: 'Pão', isMatch: true },
      { text: ' da manhã', isMatch: false },
    ])
    expect(partsMatching('Farmácia do bairro', 'macia')).toEqual([
      { text: 'Far', isMatch: false },
      { text: 'mácia', isMatch: true },
      { text: ' do bairro', isMatch: false },
    ])
  })

  it('leaves the text whole when nothing matches or nothing is searched', () => {
    expect(partsMatching('Mercado', 'feira')).toEqual([{ text: 'Mercado', isMatch: false }])
    expect(partsMatching('Mercado', '  ')).toEqual([{ text: 'Mercado', isMatch: false }])
  })
})
