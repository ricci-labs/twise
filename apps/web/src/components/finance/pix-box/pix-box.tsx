import { formatBrl } from '@financas/shared'
import { Button } from '@web/components/actions/button'
import { pixBoxMessages as messages } from '@web/components/finance/pix-box/pix-box.messages'
import type { PixBoxProps } from '@web/components/finance/pix-box/pix-box.types'
import {
  pixBoxCodeVariants,
  pixBoxTitleVariants,
  pixBoxVariants,
} from '@web/components/finance/pix-box/pix-box.variants'
import { cn } from '@web/lib/cn'
import { QrCode } from 'lucide-react'

export function PixBox({
  amountCents,
  payload,
  copyLabel = messages.copy,
  onCopied,
  onCopyFailed,
  className,
}: PixBoxProps) {
  const copy = () => {
    if (!navigator.clipboard) {
      onCopyFailed?.()
      return
    }
    navigator.clipboard.writeText(payload).then(
      () => onCopied?.(),
      () => onCopyFailed?.(),
    )
  }
  return (
    <div data-slot="pix-box" className={cn(pixBoxVariants(), className)}>
      <p className={pixBoxTitleVariants()}>
        <QrCode aria-hidden="true" />
        {messages.title(formatBrl(amountCents))}
      </p>
      <code className={pixBoxCodeVariants()}>{payload}</code>
      <Button variant="secondary" size="sm" onClick={copy}>
        <QrCode aria-hidden="true" />
        {copyLabel}
      </Button>
    </div>
  )
}
