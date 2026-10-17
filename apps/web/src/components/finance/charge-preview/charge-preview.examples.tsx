import { ChargePreview } from '@web/components/finance/charge-preview/charge-preview'
import type { ChargePreviewItem } from '@web/components/finance/charge-preview/charge-preview.types'
import type { ComponentExamples } from '@web/lib/examples.types'

const OVERDUE: readonly ChargePreviewItem[] = [
  {
    key: 'market',
    description: 'Mercado da semana',
    dueOn: '2026-10-10',
    isOverdue: true,
    amountCents: 12000,
  },
  {
    key: 'dinner',
    description: 'Jantar de aniversário',
    dueOn: '2026-10-10',
    isOverdue: true,
    amountCents: 8000,
  },
]

const WITH_NEXT: readonly ChargePreviewItem[] = [
  ...OVERDUE,
  {
    key: 'tv',
    description: 'TV da sala (parcela 2/3)',
    dueOn: '2026-11-10',
    isOverdue: false,
    amountCents: 16000,
  },
]

const LONG: readonly ChargePreviewItem[] = [
  {
    key: 'long',
    description: 'Reforma do apartamento de Maria Aparecida dos Santos Oliveira (parcela 10/12)',
    dueOn: '2026-10-10',
    isOverdue: true,
    amountCents: 125652000,
  },
]

export const chargePreviewExamples: ComponentExamples = {
  component: 'ChargePreview',
  examples: [
    {
      name: 'O que venceu até hoje',
      render: () => <ChargePreview items={OVERDUE} totalCents={20000} className="max-w-100" />,
    },
    {
      name: 'Incluindo a próxima parcela',
      render: () => <ChargePreview items={WITH_NEXT} totalCents={36000} className="max-w-100" />,
    },
    {
      name: 'Nome longo e valor grande no celular',
      render: () => <ChargePreview items={LONG} totalCents={125652000} className="w-80" />,
    },
  ],
}
