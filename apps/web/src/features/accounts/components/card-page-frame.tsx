import type { CardPageFrameProps } from '@web/features/accounts/accounts.types'

export function CardPageFrame({ children }: CardPageFrameProps) {
  return (
    <div className="mx-auto flex w-full max-w-160 flex-col gap-4 px-4 pt-2 pb-6 lg:px-8 lg:pt-7 lg:pb-12">
      {children}
    </div>
  )
}
