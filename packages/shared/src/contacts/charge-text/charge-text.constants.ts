export const CHARGE_TAGS = [
  '{contato}',
  '{quem cobra}',
  '{valor}',
  '{vencimento}',
  '{espaço}',
] as const

export type ChargeTag = (typeof CHARGE_TAGS)[number]

export const CHARGE_TEXT_FIELDS = ['subject', 'opening', 'closing'] as const

export type ChargeTextField = (typeof CHARGE_TEXT_FIELDS)[number]

export const CHARGE_TEXT_ISSUE_REASONS = ['empty', 'unknown_tag', 'too_long'] as const

export type ChargeTextIssueReason = (typeof CHARGE_TEXT_ISSUE_REASONS)[number]

export const CHARGE_TEXT_CHANNELS = ['whatsapp', 'email'] as const

export type ChargeTextChannel = (typeof CHARGE_TEXT_CHANNELS)[number]

export const CHARGE_TEXT_LIMITS: Readonly<
  Record<ChargeTextField, { minLength: number; maxLength: number }>
> = {
  subject: { minLength: 1, maxLength: 120 },
  opening: { minLength: 1, maxLength: 300 },
  closing: { minLength: 0, maxLength: 300 },
}

export const DEFAULT_CHARGE_SUBJECT = '{quem cobra} te enviou uma cobrança de {valor}'

export const DEFAULT_CHARGE_OPENING =
  '{quem cobra} pediu para te lembrar do que está em aberto. Dá para pagar com Pix, o valor já vem preenchido.'

export const DEFAULT_CHARGE_OPENING_WITHOUT_PIX =
  '{quem cobra} pediu para te lembrar do que está em aberto.'

export const DEFAULT_CHARGE_CLOSINGS: Readonly<Record<ChargeTextChannel, string>> = {
  whatsapp: '',
  email: 'Qualquer dúvida, é só responder este e-mail.',
}

export const DEFAULT_CHARGE_TEXT = {
  subject: DEFAULT_CHARGE_SUBJECT,
  opening: DEFAULT_CHARGE_OPENING,
  closing: null,
} as const
