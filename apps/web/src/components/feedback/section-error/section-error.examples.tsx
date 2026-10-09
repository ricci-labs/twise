import { SectionError } from '@web/components/feedback/section-error/section-error'
import type { ComponentExamples } from '@web/lib/examples.types'

export const sectionErrorExamples: ComponentExamples = {
  component: 'SectionError',
  examples: [
    {
      name: 'Com código',
      render: () => (
        <SectionError
          message="Não foi possível carregar a previsão de saldo."
          errorRef="7F3A-2C91"
          onRetry={() => undefined}
        />
      ),
    },
  ],
}
