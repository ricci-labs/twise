export type MessageBubbleProps = {
  message: string
  pixPayload?: string | null
  className?: string
}

export type MessageLine = {
  key: string
  text: string
  isPix: boolean
}
