import { Badge } from '@web/components/display/badge/badge'
import type { ComponentExamples } from '@web/lib/examples.types'

export const badgeExamples: ComponentExamples = {
  component: 'Badge',
  examples: [
    {
      name: 'Tons',
      render: () => (
        <div className="flex flex-wrap gap-2">
          <Badge>Período encerrado</Badge>
          <Badge tone="info">Período futuro</Badge>
          <Badge tone="success">No ritmo</Badge>
          <Badge tone="warning">Adiantado</Badge>
          <Badge tone="danger">Estourou</Badge>
        </div>
      ),
    },
    {
      name: 'Situação de uma cobrança',
      render: () => (
        <div className="flex flex-wrap gap-2">
          <Badge size="xs" hasDot>
            Rascunho
          </Badge>
          <Badge tone="warning" size="xs" hasDot>
            Enviada
          </Badge>
          <Badge tone="partial" size="xs" hasDot>
            Paga em parte
          </Badge>
          <Badge tone="success" size="xs" hasDot>
            Paga
          </Badge>
        </div>
      ),
    },
  ],
}
