import { MessageBubble } from '@web/components/finance/message-bubble/message-bubble'
import type { ComponentExamples } from '@web/lib/examples.types'

const PIX =
  '00020126580014br.gov.bcb.pix0136a1b2c3d4-e5f6-4789-abcd-ef01234567895204000053039865406200.005802BR5908MEMBER A6009SAO PAULO62070503***6304E1F2'

const MESSAGE = [
  'Oi, Member D! Member A pediu para te lembrar do que está em aberto:',
  '• Mercado da semana — R$ 120,00',
  '• Jantar de aniversário — R$ 80,00',
  'Total: R$ 200,00',
  'Vencimento: 10/10/2026',
  'Pix copia e cola:',
  PIX,
].join('\n')

export const messageBubbleExamples: ComponentExamples = {
  component: 'MessageBubble',
  examples: [
    {
      name: 'Com o Pix (encurtado no app)',
      render: () => <MessageBubble message={MESSAGE} pixPayload={PIX} className="max-w-90" />,
    },
    {
      name: 'Sem o Pix do espaço',
      render: () => (
        <MessageBubble message={MESSAGE.split('\n').slice(0, -2).join('\n')} className="max-w-90" />
      ),
    },
    {
      name: 'Texto longo no celular',
      render: () => (
        <MessageBubble
          message={[
            'Oi, Maria Aparecida dos Santos Oliveira! Member A pediu para te lembrar do que está em aberto:',
            '• Reforma do apartamento da praia (parcela 12/12) — R$ 1.256.520,00',
            'Total: R$ 1.256.520,00',
          ].join('\n')}
          className="w-80"
        />
      ),
    },
  ],
}
