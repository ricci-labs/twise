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
          <Avatar name="Member D" size="xs" />
          <Avatar name="Da casa" icon="home" tone="paper" size="sm" />
          <Avatar name="Member E" tone="paper" size="xl" />
          <Avatar name="Member F" tone="paper" size="2xl" />
        </div>
      ),
    },
    {
      name: 'Empilhados, como no topo do celular',
      render: () => (
        <p className="flex -space-x-2">
          <Avatar name="Member A" tone="paper" size="stacked" />
          <Avatar name="Member B" size="stacked" />
        </p>
      ),
    },
  ],
}
