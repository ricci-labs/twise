import { phoneE164Of, phonePartsOf, tidyPhoneNumber } from '@web/lib/format/phone'
import { describe, expect, it } from 'vitest'

describe('phoneE164Of', () => {
  it('reads a Brazilian number with its area code, however it was typed', () => {
    expect(phoneE164Of({ callingCode: '+55', number: '(11) 99999-0000' })).toBe('+5511999990000')
    expect(phoneE164Of({ callingCode: '+55', number: '11 3333 0000' })).toBe('+551133330000')
  })

  it('refuses a Brazilian number without the area code or with a leading zero', () => {
    expect(phoneE164Of({ callingCode: '+55', number: '99999-0000' })).toBeNull()
    expect(phoneE164Of({ callingCode: '+55', number: '011 99999-0000' })).toBeNull()
    expect(phoneE164Of({ callingCode: '+55', number: 'abc' })).toBeNull()
  })

  it('joins other countries and takes a full international number as typed', () => {
    expect(phoneE164Of({ callingCode: '+351', number: '912 345 678' })).toBe('+351912345678')
    expect(phoneE164Of({ callingCode: '+55', number: '+44 20 7946 0000' })).toBe('+442079460000')
    expect(phoneE164Of({ callingCode: '+1', number: '12' })).toBeNull()
  })
})

describe('phonePartsOf', () => {
  it('splits a stored number into the country and the number as the field shows it', () => {
    expect(phonePartsOf('+5511999990000')).toEqual({
      callingCode: '+55',
      number: '(11) 99999-0000',
    })
    expect(phonePartsOf('+351912345678')).toEqual({ callingCode: '+351', number: '912345678' })
    expect(phonePartsOf(null)).toEqual({ callingCode: '+55', number: '' })
  })

  it('keeps a number from a country outside the list whole', () => {
    expect(phonePartsOf('+2348012345678')).toEqual({
      callingCode: '+55',
      number: '+2348012345678',
    })
  })
})

describe('tidyPhoneNumber', () => {
  it('writes a Brazilian number with the area code in brackets and leaves the rest as typed', () => {
    expect(tidyPhoneNumber({ callingCode: '+55', number: '1133330000' })).toBe('(11) 3333-0000')
    expect(tidyPhoneNumber({ callingCode: '+55', number: '11999990000' })).toBe('(11) 99999-0000')
    expect(tidyPhoneNumber({ callingCode: '+55', number: '9999' })).toBe('9999')
    expect(tidyPhoneNumber({ callingCode: '+1', number: '2025550000' })).toBe('2025550000')
  })
})
