export type InvoiceLineProps = {
  date: string
  description: string
  icon: string | null
  installment?: string
  detail?: string
  amountCents: number
  isPayment?: boolean
}
