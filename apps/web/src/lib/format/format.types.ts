export type TemplateValues = Readonly<Record<string, string | number>>

export type DateBlock = {
  day: string
  month: string
}

export type PhoneParts = {
  callingCode: string
  number: string
}
