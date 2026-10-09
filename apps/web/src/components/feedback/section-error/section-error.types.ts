export type SectionErrorProps = {
  message: string
  errorRef?: string | null
  onRetry: () => void
  isRetrying?: boolean
  className?: string
}
