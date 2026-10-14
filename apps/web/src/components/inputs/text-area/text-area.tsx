import type { TextAreaProps } from '@web/components/inputs/text-area/text-area.types'
import { textAreaVariants } from '@web/components/inputs/text-area/text-area.variants'
import { cn } from '@web/lib/cn'

export function TextArea({ className, rows = 2, ...props }: TextAreaProps) {
  return (
    <textarea
      data-slot="text-area"
      rows={rows}
      className={cn(textAreaVariants(), className)}
      {...props}
    />
  )
}
