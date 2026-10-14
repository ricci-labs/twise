import { InvoicePreview } from '@web/components/finance/invoice-preview/invoice-preview'
import type { ComponentExamples } from '@web/lib/examples.types'

const FIRST = { key: '1', number: '1/3', due: 'vence 04/11', amountCents: 33_334, isClosed: false }

const THREE = [
  FIRST,
  { key: '2', number: '2/3', due: 'vence 04/12', amountCents: 33_333, isClosed: false },
  { key: '3', number: '3/3', due: 'vence 04/01/27', amountCents: 33_333, isClosed: false },
]

export const invoicePreviewExamples: ComponentExamples = {
  component: 'InvoicePreview',
  examples: [
    {
      name: 'À vista',
      render: () => (
        <InvoicePreview
          title="Entra na fatura que vence em **04/11**."
          rows={[
            { key: '1', number: '1/1', due: 'vence 04/11', amountCents: 100_000, isClosed: false },
          ]}
        />
      ),
    },
    {
      name: 'Em 3×',
      render: () => (
        <InvoicePreview title="A 1ª parcela entra na fatura que vence em **04/11**." rows={THREE} />
      ),
    },
    {
      name: 'Fatura já fechada',
      render: () => (
        <InvoicePreview
          title="A 1ª parcela cairia na fatura que vence em **04/10**."
          rows={[{ ...FIRST, due: 'vence 04/10', isClosed: true }, ...THREE.slice(1)]}
        />
      ),
    },
    {
      name: 'Já em andamento, com mais parcelas',
      render: () => (
        <InvoicePreview
          title="Faltam 7 parcelas. A próxima entra na fatura que vence em **04/11**."
          rows={[
            { key: '4', number: '4/10', due: 'vence 04/11', amountCents: 30_000, isClosed: false },
            { key: '5', number: '5/10', due: 'vence 04/12', amountCents: 30_000, isClosed: false },
            {
              key: '6',
              number: '6/10',
              due: 'vence 04/01/27',
              amountCents: 30_000,
              isClosed: false,
            },
          ]}
          more="+ 4 parcelas, até a fatura que vence em 04/05/27"
        />
      ),
    },
  ],
}
