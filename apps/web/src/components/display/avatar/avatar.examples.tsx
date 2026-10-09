import { Avatar } from '@web/components/display/avatar/avatar'
import type { ComponentExamples } from '@web/lib/examples.types'

export const avatarExamples: ComponentExamples = {
  component: 'Avatar',
  examples: [
    {
      name: 'Tons e tamanhos',
      render: () => (
        <div className="flex items-center gap-2">
          <Avatar name="Member A" />
          <Avatar name="Member B" tone="paper" />
          <Avatar name="member c" size="sm" />
        </div>
      ),
    },
  ],
}
