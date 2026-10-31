import { Button } from '@web/components/actions/button'
import { CategoryArt } from '@web/components/display/category-art'
import { ResultState } from '@web/components/feedback/result-state/result-state'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import type { ComponentExamples } from '@web/lib/examples.types'

const BOX = 'w-full max-w-100'

export const resultStateExamples: ComponentExamples = {
  component: 'ResultState',
  examples: [
    {
      name: 'Começo, sem conexão e erro do servidor',
      render: () => (
        <div className={`${BOX} flex flex-col gap-3`}>
          <ResultState
            frame="dashed"
            art={<CategoryArt name="Carteira" icon="wallet" size="hero" />}
            title="Quanto custa o que vocês querem comprar?"
            text="Digite o valor e como vai pagar. O resultado aparece sozinho, sem botão."
          />
          <ResultState
            isAlert
            tone="neutral"
            art={<TwiseIcon name="refresh" />}
            title="Sem conexão"
            text="Os campos continuam como você deixou."
            action={<Button variant="secondary">Tentar de novo</Button>}
          />
          <ResultState
            isAlert
            tone="danger"
            art={<TwiseIcon name="alert" />}
            title="Não deu para simular agora"
            text="Foi um erro do nosso lado. Tente de novo em instantes."
            detail="Código SERVER_ERROR · Ref. 3f9a7c21"
            action={<Button variant="secondary">Tentar de novo</Button>}
          />
        </div>
      ),
    },
  ],
}
