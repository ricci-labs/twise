export const contactRowMessages = {
  badges: {
    overdue: 'Em atraso',
    charged: (date: string) => `Cobrado em ${date}`,
    optedOut: 'Não quer mensagens',
  },
  state: {
    overdueSince: (amount: string, date: string) => `${amount} vencido desde ${date}`,
    overdue: (amount: string) => `${amount} vencido`,
    next: (amount: string, date: string) => `Próximo: ${amount} em ${date}`,
    credit: (amount: string) => `Tem crédito de ${amount}`,
    settled: 'Em dia',
  },
  balance: {
    owes: 'deve',
    late: 'deve',
    credit: 'crédito',
    settled: 'em dia',
  },
  channels: {
    whatsapp: 'WhatsApp',
    email: 'E-mail',
  },
  charge: 'Cobrar',
  chargeLabel: (name: string) => `Cobrar ${name}`,
} as const
