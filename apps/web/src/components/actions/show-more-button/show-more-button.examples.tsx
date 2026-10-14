import { ShowMoreButton } from '@web/components/actions/show-more-button/show-more-button'
import type { ComponentExamples } from '@web/lib/examples.types'

export const showMoreButtonExamples: ComponentExamples = {
  component: 'ShowMoreButton',
  examples: [
    {
      name: 'Com quantos faltam',
      render: () => (
        <div className="w-full max-w-90">
          <ShowMoreButton hiddenCount={45} onClick={() => undefined} />
        </div>
      ),
    },
    {
      name: 'Próxima página, carregando',
      render: () => (
        <div className="w-full max-w-90">
          <ShowMoreButton isLoading onClick={() => undefined} />
        </div>
      ),
    },
  ],
}
