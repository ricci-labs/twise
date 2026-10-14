export type ToastAction = {
  label: string
  onPress: () => void
}

export type ToastTone = 'neutral' | 'success'

export type ToastOptions = {
  action?: ToastAction
  tone?: ToastTone
}
