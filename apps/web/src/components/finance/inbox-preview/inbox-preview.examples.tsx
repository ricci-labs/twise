import { InboxPreview } from '@web/components/finance/inbox-preview/inbox-preview'
import type { ComponentExamples } from '@web/lib/examples.types'

export const inboxPreviewExamples: ComponentExamples = {
  component: 'InboxPreview',
  examples: [
    {
      name: 'Cobrança na caixa de entrada',
      render: () => (
        <InboxPreview
          sender="Twise · Casa"
          subject="Member A te enviou uma cobrança de R$ 200,00"
          preheader="Oi, Member D! Member A pediu para te lembrar do que está em aberto. Dá para pagar com Pix, o valor já vem preenchido."
          className="w-80"
        />
      ),
    },
    {
      name: 'Com a hora',
      render: () => (
        <InboxPreview
          sender="Twise · Casa"
          subject="Lembrete de pagamento: R$ 200,00 para Member A"
          preheader="Oi, Member D! Member A pediu para te lembrar do que está em aberto."
          time="09:41"
          className="w-80"
        />
      ),
    },
  ],
}
