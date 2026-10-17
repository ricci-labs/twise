export const emailSendSheetMessages = {
  title: 'Enviar por e-mail',
  close: 'Fechar',
  to: 'Para',
  subject: 'Assunto',
  replyTo: 'Respostas vão para',
  replyToValue: (email: string, name: string) => `${email} (${name})`,
  preview: 'Ver o e-mail como ele chega',
  carriesWithPix:
    'O e-mail leva a mensagem, o Pix copia e cola e um link para a pessoa pedir para não receber mais cobranças.',
  carries:
    'O e-mail leva a mensagem e um link para a pessoa pedir para não receber mais cobranças.',
  back: 'Voltar',
  send: 'Enviar e-mail',
  sending: 'Enviando e-mail',
} as const
