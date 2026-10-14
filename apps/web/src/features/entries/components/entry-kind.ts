import {
  ENTRY_TYPES_WITH_CATEGORY,
  ENTRY_TYPES_WITH_PAYMENT_METHOD,
  SPENDING_ENTRY_TYPES,
} from '@financas/shared'

const WITH_CATEGORY: readonly string[] = ENTRY_TYPES_WITH_CATEGORY
const WITH_PAYMENT_METHOD: readonly string[] = ENTRY_TYPES_WITH_PAYMENT_METHOD
const SPENDING: readonly string[] = SPENDING_ENTRY_TYPES

export function hasCategory(entryType: string): boolean {
  return WITH_CATEGORY.includes(entryType)
}

export function hasPaymentMethod(entryType: string): boolean {
  return WITH_PAYMENT_METHOD.includes(entryType)
}

export function isSpending(entryType: string): boolean {
  return SPENDING.includes(entryType)
}
