export const chargeEmailPreviewMessages = {
  label: 'O e-mail como ele chega',
  senderAndReplyTo: (sender: string, email: string) => `${sender} · responder para ${email}`,
  greeting: (contactName: string) => `Oi, ${contactName}!`,
  heading: (amount: string, requesterName: string) => `${amount} para ${requesterName}`,
  item: 'Item',
  amount: 'Valor',
  total: 'Total',
  overdue: (date: string) => `Venceu em ${date}`,
  due: (date: string) => `Vence em ${date}`,
  pixTitle: 'Pague com Pix',
  pixHow:
    'No app do banco, escolha Pix › **Pix copia e cola** e cole o código. Ou leia o QR code com o celular.',
  codeLabel: 'Código Pix copia e cola (toque e segure para copiar):',
  receiver: 'Quem recebe: **{nome} · {cidade}**. Confira o nome no app do banco antes de pagar.',
  alreadyPaid: (requesterName: string) =>
    `Já pagou? Pode ignorar este e-mail; ${requesterName} registra o pagamento no app.`,
  signature: '**Twise** · Leve, claro, a dois.',
  why: (requesterName: string, workspaceName: string) =>
    `Você recebeu este e-mail porque ${requesterName}, do espaço ${workspaceName}, dividiu contas com você.`,
  optOut: 'Não quero mais receber cobranças por e-mail',
} as const
