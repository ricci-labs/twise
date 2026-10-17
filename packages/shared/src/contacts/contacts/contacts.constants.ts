export const CONTACT_OPT_OUT_VIAS = ['member', 'email_link'] as const

export type ContactOptOutVia = (typeof CONTACT_OPT_OUT_VIAS)[number]
