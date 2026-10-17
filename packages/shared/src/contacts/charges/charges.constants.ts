export const CHARGE_STATUSES = ['draft', 'sent', 'partially_paid', 'paid', 'cancelled'] as const

export type ChargeStatus = (typeof CHARGE_STATUSES)[number]

export const OPEN_CHARGE_STATUSES: readonly ChargeStatus[] = ['draft', 'sent', 'partially_paid']

export const CHARGE_SENT_VIAS = ['whatsapp', 'email', 'manual'] as const

export type ChargeSentVia = (typeof CHARGE_SENT_VIAS)[number]

export const CHARGE_EMAIL_STATUSES = ['queued', 'sent', 'failed'] as const

export type ChargeEmailStatus = (typeof CHARGE_EMAIL_STATUSES)[number]

export const CHARGE_EMAIL_ERROR_MAX_LENGTH = 200
