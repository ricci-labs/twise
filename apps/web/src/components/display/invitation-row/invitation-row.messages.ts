export const invitationRowMessages = {
  validUntil: (date: string) => `Vale até ${date}`,
  invitedBy: (name: string, date: string) => `Convidado por ${name} em ${date}`,
  linkShownOnce: 'Link mostrado uma vez',
  byEmail: 'Convite por e-mail',
  byPhone: 'Convite por telefone',
} as const
