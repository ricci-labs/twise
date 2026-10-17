import { PixBox } from '@web/components/finance/pix-box/pix-box'
import type { ComponentExamples } from '@web/lib/examples.types'

const PIX =
  '00020126580014br.gov.bcb.pix0136a1b2c3d4-e5f6-4789-abcd-ef01234567895204000053039865406200.005802BR5908MEMBER A6009SAO PAULO62070503***6304E1F2'

export const pixBoxExamples: ComponentExamples = {
  component: 'PixBox',
  examples: [
    {
      name: 'Pix copia e cola da cobrança',
      render: () => <PixBox amountCents={20000} payload={PIX} className="max-w-90" />,
    },
    {
      name: 'Valor longo no celular',
      render: () => <PixBox amountCents={125652000} payload={PIX} className="w-80" />,
    },
  ],
}
