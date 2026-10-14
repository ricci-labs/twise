import { PageFrame } from '@web/components/layout/page-frame'
import type { CardPageFrameProps } from '@web/features/accounts/accounts.types'

export function CardPageFrame({ children }: CardPageFrameProps) {
  return <PageFrame className="gap-4">{children}</PageFrame>
}
