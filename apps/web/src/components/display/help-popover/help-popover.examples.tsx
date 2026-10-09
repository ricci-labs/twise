import { HelpPopover } from '@web/components/display/help-popover/help-popover'
import type { ComponentExamples } from '@web/lib/examples.types'

export const helpPopoverExamples: ComponentExamples = {
  component: 'HelpPopover',
  examples: [
    {
      name: 'Livre para gastar',
      render: () => (
        <p className="flex items-center gap-1.5">
          Livre para gastar
          <HelpPopover topic="Livre para gastar">
            Renda fixa do período, menos o que já foi gasto, menos as contas que ainda vão vencer.
          </HelpPopover>
        </p>
      ),
    },
  ],
}
