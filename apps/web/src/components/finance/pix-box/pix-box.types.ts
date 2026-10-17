export type PixBoxProps = {
  amountCents: number
  payload: string
  copyLabel?: string
  onCopied?: () => void
  onCopyFailed?: () => void
  className?: string
}
