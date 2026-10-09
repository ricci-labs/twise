import { ResponsiveText } from '@web/components/display/responsive-text/responsive-text'
import type { ComponentExamples } from '@web/lib/examples.types'

export const responsiveTextExamples: ComponentExamples = {
  component: 'ResponsiveText',
  examples: [
    {
      name: 'Curto no celular, completo no desktop',
      render: () => (
        <p>
          <ResponsiveText
            short="Até o próximo salário."
            long="Do dia de hoje até o próximo salário, com o que já está previsto."
          />
        </p>
      ),
    },
  ],
}
