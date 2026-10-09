import type { ResponsiveTextProps } from '@web/components/display/responsive-text/responsive-text.types'

export function ResponsiveText({ short, long }: ResponsiveTextProps) {
  return (
    <>
      <span data-slot="responsive-text" className="lg:hidden">
        {short}
      </span>
      <span data-slot="responsive-text" className="hidden lg:inline">
        {long}
      </span>
    </>
  )
}
