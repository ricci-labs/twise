import { Verdict } from '@web/components/display/verdict/verdict'
import type { ComponentExamples } from '@web/lib/examples.types'

export const verdictExamples: ComponentExamples = {
  component: 'Verdict',
  examples: [
    {
      name: 'Cabe, aperta e não cabe',
      render: () => (
        <div className="flex w-full max-w-100 flex-col gap-3">
          <Verdict
            tone="ok"
            title="Cabe no orçamento."
            text="Ainda sobram R$ 1.800,00 até 4 nov."
          />
          <Verdict
            tone="warn"
            title="Cabe, mas aperta."
            text="Dezembro chegaria a 70% da renda fixa comprometida."
          />
          <Verdict
            tone="alert"
            title="Não cabe sem estourar."
            text="Os gastos deste período passariam da renda em R$ 420,00."
          />
        </div>
      ),
    },
  ],
}
