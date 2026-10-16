import { moved } from '@web/hooks/use-drag-reorder'
import { describe, expect, it } from 'vitest'

describe('moved', () => {
  it('takes an item out and puts it at the new place', () => {
    expect(moved(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd'])
    expect(moved(['a', 'b', 'c', 'd'], 3, 1)).toEqual(['a', 'd', 'b', 'c'])
  })

  it('leaves the list as it was when the place is the same', () => {
    expect(moved(['a', 'b'], 1, 1)).toEqual(['a', 'b'])
  })
})
