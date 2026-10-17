export const chargeRowMessages = {
  title: (date: string) => `Cobrança de ${date}`,
  actions: (date: string) => `Ações da cobrança de ${date}`,
  items: (count: number) => (count === 1 ? '1 item' : `${count} itens`),
  separator: ' · ',
  statuses: {
    draft: 'Rascunho',
    sent: 'Enviada',
    partially_paid: 'Paga em parte',
    paid: 'Paga',
    cancelled: 'Cancelada',
  },
  channels: {
    whatsapp: 'WhatsApp',
    email: 'e-mail',
    manual: 'mensagem copiada',
  },
  emailFailed: 'e-mail não saiu',
} as const
