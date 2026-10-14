import { Dialog } from '@base-ui/react/dialog'
import type { FormOverlayProps } from '@web/components/layout/form-overlay/form-overlay.types'
import {
  formOverlayBackdropVariants,
  formOverlayBodyVariants,
  formOverlayCloseVariants,
  formOverlayFootVariants,
  formOverlayHeadVariants,
  formOverlayPopupVariants,
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
          render={onSubmit ? <form noValidate onSubmit={onSubmit} /> : undefined}
          className={formOverlayPopupVariants()}
        >
          {banner}
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
          <div className={formOverlayBodyVariants()}>{children}</div>
          <div className={formOverlayFootVariants()}>{footer}</div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
