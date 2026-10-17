import { SendOptions } from '@web/components/finance/send-options/send-options'
import type { ComponentExamples } from '@web/lib/examples.types'

const MESSAGE = 'Oi, Member D! Member A pediu para te lembrar do que está em aberto.'
const WHATSAPP = { phone: '+55 (11) 99999-0004', onSend: () => undefined }
const EMAIL = { address: 'member.d@exemplo.com', onSend: () => undefined }

export const sendOptionsExamples: ComponentExamples = {
  component: 'SendOptions',
  examples: [
    {
      name: 'WhatsApp, e-mail e copiar',
      render: () => (
        <SendOptions
          contactName="Member D"
          message={MESSAGE}
          whatsapp={WHATSAPP}
          email={EMAIL}
          className="max-w-100"
        />
      ),
    },
    {
      name: 'Pediu para não receber e-mails',
      render: () => (
        <SendOptions
          contactName="Member E"
          message={MESSAGE}
          whatsapp={WHATSAPP}
          email={{ ...EMAIL, isOptedOut: true }}
          className="max-w-100"
        />
      ),
    },
    {
      name: 'Só WhatsApp',
      render: () => (
        <SendOptions
          contactName="Member D"
          message={MESSAGE}
          whatsapp={WHATSAPP}
          className="max-w-100"
        />
      ),
    },
    {
      name: 'Sem WhatsApp nem e-mail',
      render: () => (
        <SendOptions
          contactName="Member D"
          message={MESSAGE}
          onAddChannel={() => undefined}
          className="max-w-100"
        />
      ),
    },
    {
      name: 'E-mail longo no celular',
      render: () => (
        <SendOptions
          contactName="Maria Aparecida dos Santos Oliveira"
          message={MESSAGE}
          email={{ ...EMAIL, address: 'maria.aparecida.dos.santos.oliveira@exemplo.com' }}
          className="w-80"
        />
      ),
    },
  ],
}
