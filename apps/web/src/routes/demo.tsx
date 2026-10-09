import { createFileRoute } from '@tanstack/react-router'
import { DemoFrame, demoHomeProps, demoSearchSchema } from '@web/features/demo'
import { HomePage } from '@web/features/home'

export const Route = createFileRoute('/demo')({
  validateSearch: demoSearchSchema,
  component: function DemoRoute() {
    const { period, variant = 'normal' } = Route.useSearch()
    return (
      <DemoFrame variant={variant}>
        <HomePage {...demoHomeProps(variant, period)} />
      </DemoFrame>
    )
  },
})
