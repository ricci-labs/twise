import { ChargeEmailPreview } from '@web/components/finance/charge-email-preview/charge-email-preview'
import type { ChargeEmailPreviewProps } from '@web/components/finance/charge-email-preview/charge-email-preview.types'
import type { ComponentExamples } from '@web/lib/examples.types'

const PIX =
  '00020126580014br.gov.bcb.pix0136a1b2c3d4-0000-4000-8000-0000000000005204000053039865406200.005802BR5908MEMBER A6009SAO PAULO62140510CB20OUT26A6304E1F2'

const EMAIL: ChargeEmailPreviewProps = {
  subject: 'Member A te enviou uma cobrança de R$ 200,00',
  sender: 'Twise · Casa',
  replyTo: 'member.a@exemplo.com',
  contactName: 'Member D',
  requesterName: 'Member A',
  workspaceName: 'Casa',
  opening:
    'Member A pediu para te lembrar do que está em aberto. Dá para pagar com Pix, o valor já vem preenchido.',
  closing: 'Qualquer dúvida, é só responder este e-mail.',
  items: [
    {
      key: 'mercado',
      description: 'Mercado da semana',
      detail: 'Cartão X · venceu 10/10',
      amountCents: 12_000,
    },
    {
      key: 'jantar',
      description: 'Jantar de aniversário',
      detail: 'Cartão X · venceu 10/10',
      amountCents: 8_000,
    },
  ],
  totalCents: 20_000,
  dueOn: '2026-10-10',
  isOverdue: true,
  pix: { payload: PIX, receiverName: 'MEMBER A', receiverCity: 'SAO PAULO' },
}

export const chargeEmailPreviewExamples: ComponentExamples = {
  component: 'ChargeEmailPreview',
  examples: [
    {
      name: 'Vencida, com o Pix',
      render: () => <ChargeEmailPreview {...EMAIL} className="max-w-140" />,
    },
    {
      name: 'A vencer, sem o Pix e sem encerramento',
      render: () => (
        <ChargeEmailPreview
          {...EMAIL}
          dueOn="2026-11-10"
          isOverdue={false}
          pix={null}
          closing=""
          className="max-w-140"
        />
      ),
    },
  ],
}
