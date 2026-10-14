import { Dialog } from '@base-ui/react/dialog'
import type {
  FormOverlayContentProps,
  FormOverlayProps,
} from '@web/components/layout/form-overlay/form-overlay.types'
import {
  formOverlayBackdropVariants,
  formOverlayCloseVariants,
  formOverlayContentVariants,
  formOverlayFootVariants,
  formOverlayHeadVariants,
  formOverlayPopupVariants,
  formOverlayScrollVariants,
  formOverlayTitleVariants,
} from '@web/components/layout/form-overlay/form-overlay.variants'
import { X } from 'lucide-react'

export function FormOverlay({
  title,
  closeLabel,
  isOpen,
  onRequestClose,
  banner,
  footer,
  children,
  onSubmit,
  initialFocus,
}: FormOverlayProps) {
  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onRequestClose()
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className={formOverlayBackdropVariants()} />
        <Dialog.Popup
          data-slot="form-overlay"
          initialFocus={initialFocus}
          className={formOverlayPopupVariants()}
        >
          {banner}
          <FormOverlayContent onSubmit={onSubmit}>
            <div className={formOverlayScrollVariants()}>
              <div className={formOverlayHeadVariants()}>
                <button
                  type="button"
                  aria-label={closeLabel}
                  onClick={onRequestClose}
                  className={formOverlayCloseVariants()}
                >
                  <X aria-hidden="true" />
                </button>
                <Dialog.Title className={formOverlayTitleVariants()}>{title}</Dialog.Title>
              </div>
              {children}
            </div>
            <div className={formOverlayFootVariants()}>{footer}</div>
          </FormOverlayContent>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function FormOverlayContent({ onSubmit, children }: FormOverlayContentProps) {
  if (!onSubmit) {
    return <div className={formOverlayContentVariants()}>{children}</div>
  }
  return (
    <form noValidate onSubmit={onSubmit} className={formOverlayContentVariants()}>
      {children}
    </form>
  )
}
