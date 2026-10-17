import { createFileRoute } from '@tanstack/react-router'
import { OptOutPage } from '@web/features/contacts'

export const Route = createFileRoute('/opt-out')({
  component: OptOutPage,
})
