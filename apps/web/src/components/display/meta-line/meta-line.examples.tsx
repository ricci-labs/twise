import { MetaLine } from '@web/components/display/meta-line/meta-line'
import type { ComponentExamples } from '@web/lib/examples.types'

const DETAIL = 'line-clamp-2 text-row-detail text-ink-muted'

export const metaLineExamples: ComponentExamples = {
  component: 'MetaLine',
  examples: [
    {
      name: 'Tudo numa linha',
      render: () => (
        <p className={DETAIL}>
          <MetaLine text="Cartão X · fecha dia 25 · vence dia 4" />
        </p>
      ),
    },
    {
      name: 'Pedaço que não cabe desce inteiro, sem o ponto e com maiúscula',
      render: () => (
        <p className={`w-50 ${DETAIL}`}>
          <MetaLine text="19/10 · Mercado da semana · pelo WhatsApp" />
        </p>
      ),
    },
    {
      name: 'Texto longo para em duas linhas',
      render: () => (
        <p className={`w-60 ${DETAIL}`}>
          <MetaLine text="Conta Conjunta do Banco Exemplo · Internet fibra 1 giga com TV e telefone · vence dia 10 · R$ 1.256.200,00" />
        </p>
      ),
    },
  ],
}
