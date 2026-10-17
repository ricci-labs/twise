import { phoneE164Schema } from '@financas/shared'
import type { PhoneParts } from '@web/lib/format/format.types'

export const BRAZIL_CALLING_CODE = '+55'

export const CALLING_CODES = [
  BRAZIL_CALLING_CODE,
  '+49',
  '+54',
  '+56',
  '+34',
  '+1',
  '+33',
  '+39',
  '+81',
  '+595',
  '+351',
  '+44',
  '+598',
] as const

const BRAZIL_LANDLINE_DIGITS = 10
const BRAZIL_MOBILE_DIGITS = 11
const AREA_CODE_DIGITS = 2
const LINE_END_DIGITS = 4
const NOT_A_DIGIT = /\D/g
const INTERNATIONAL_PREFIX = '+'
const NO_AREA_CODE_STARTS_WITH = '0'
const LONGEST_CODE_FIRST = [...CALLING_CODES].sort((first, second) => second.length - first.length)

export function phoneE164Of({ callingCode, number }: PhoneParts): string | null {
  const typed = number.trim()
  const digits = digitsOf(typed)
  if (typed.startsWith(INTERNATIONAL_PREFIX)) {
    return validE164(`${INTERNATIONAL_PREFIX}${digits}`)
  }
  if (callingCode === BRAZIL_CALLING_CODE && !isBrazilianNumber(digits)) {
    return null
  }
  return validE164(`${callingCode}${digits}`)
}

export function phonePartsOf(phoneE164: string | null): PhoneParts {
  if (!phoneE164) {
    return { callingCode: BRAZIL_CALLING_CODE, number: '' }
  }
  const callingCode = LONGEST_CODE_FIRST.find((code) => phoneE164.startsWith(code))
  if (!callingCode) {
    return { callingCode: BRAZIL_CALLING_CODE, number: phoneE164 }
  }
  const number = phoneE164.slice(callingCode.length)
  return { callingCode, number: tidyPhoneNumber({ callingCode, number }) }
}

export function tidyPhoneNumber({ callingCode, number }: PhoneParts): string {
  const digits = digitsOf(number)
  const isTypedInternationally = number.trim().startsWith(INTERNATIONAL_PREFIX)
  if (callingCode !== BRAZIL_CALLING_CODE || isTypedInternationally) {
    return number
  }
  if (!isBrazilianNumber(digits)) {
    return number
  }
  const areaCode = digits.slice(0, AREA_CODE_DIGITS)
  const line = digits.slice(AREA_CODE_DIGITS)
  const lineSplit = line.length - LINE_END_DIGITS
  return `(${areaCode}) ${line.slice(0, lineSplit)}-${line.slice(lineSplit)}`
}

function isBrazilianNumber(digits: string): boolean {
  const hasValidLength =
    digits.length === BRAZIL_LANDLINE_DIGITS || digits.length === BRAZIL_MOBILE_DIGITS
  return hasValidLength && !digits.startsWith(NO_AREA_CODE_STARTS_WITH)
}

function validE164(candidate: string): string | null {
  return phoneE164Schema.safeParse(candidate).success ? candidate : null
}

function digitsOf(text: string): string {
  return text.replace(NOT_A_DIGIT, '')
}
