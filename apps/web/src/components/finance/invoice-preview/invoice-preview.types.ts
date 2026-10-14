export type InvoicePreviewRow = {
  key: string
  number: string
  due: string
  amountCents: number
  isClosed: boolean
}

export type InvoicePreviewProps = {
  title: string
  rows: readonly InvoicePreviewRow[]
  more?: string
  className?: string
}
