import type { ReactNode } from 'react'

export type InvoiceFact = {
  label: string
  value: ReactNode
}

export type InvoiceFactsProps = {
  label: string
  facts: readonly InvoiceFact[]
}
