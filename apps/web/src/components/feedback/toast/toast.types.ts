export type ToastAction = {
  label: string
  onPress: () => void
}

export type ToastTone = 'neutral' | 'success' | 'danger'

export type ToastOptions = {
  action?: ToastAction
  tone?: ToastTone
}
