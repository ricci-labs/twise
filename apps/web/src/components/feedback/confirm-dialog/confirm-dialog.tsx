import { AlertDialog } from '@base-ui/react/alert-dialog'
import { Button } from '@web/components/actions/button'
import type { ConfirmDialogProps } from '@web/components/feedback/confirm-dialog/confirm-dialog.types'
import {
  confirmActionsVariants,
  confirmBackdropVariants,
  confirmDescriptionVariants,
  confirmPopupVariants,
  confirmTitleVariants,
} from '@web/components/feedback/confirm-dialog/confirm-dialog.variants'
import { TwiseIcon } from '@web/components/icons/twise-icon'

export function ConfirmDialog({
  title,
  description,
  cancelLabel,
  confirmLabel,
  confirmVariant = 'danger',
  confirmIcon,
  isOpen,
  onOpenChange,
  onConfirm,
  children,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={isOpen} onOpenChange={(open) => onOpenChange(open)}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className={confirmBackdropVariants()} />
        <AlertDialog.Popup data-slot="confirm-dialog" className={confirmPopupVariants()}>
          <AlertDialog.Title className={confirmTitleVariants()}>{title}</AlertDialog.Title>
          <AlertDialog.Description className={confirmDescriptionVariants()}>
            {description}
          </AlertDialog.Description>
          {children}
          <div className={confirmActionsVariants()}>
            <AlertDialog.Close render={<Button variant="secondary" />}>
              {cancelLabel}
            </AlertDialog.Close>
            <Button variant={confirmVariant} onClick={onConfirm}>
              {confirmIcon && <TwiseIcon name={confirmIcon} size="md" />}
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
