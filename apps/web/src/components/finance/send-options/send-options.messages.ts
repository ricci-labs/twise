export const sendOptionsMessages = {
  heading: 'Como enviar',
  whatsapp: 'Enviar pelo WhatsApp',
  whatsappDetail: (phone: string) => `${phone} · abre o WhatsApp com a mensagem`,
  email: 'Enviar por e-mail',
  emailDetail: (address: string) => `${address} · o app envia e já marca como enviada`,
  emailOptedOut: (name: string) => `${name} pediu para não receber e-mails`,
  copy: 'Copiar mensagem',
  copyDetail: 'Para mandar por onde preferir',
  addChannel: 'Adicionar WhatsApp ou e-mail',
} as const
