import { Dialog } from '@base-ui/react/dialog'
import type { SidePanelProps } from '@web/components/layout/side-panel/side-panel.types'
import {
  sidePanelBackdropVariants,
  sidePanelBodyVariants,
  sidePanelCloseVariants,
  sidePanelHeadVariants,
  sidePanelPopupVariants,
  sidePanelTitleVariants,
} from '@web/components/layout/side-panel/side-panel.variants'
import { X } from 'lucide-react'

export function SidePanel({ title, closeLabel, onClose, actions, children }: SidePanelProps) {
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className={sidePanelBackdropVariants()} />
        <Dialog.Popup data-slot="side-panel" className={sidePanelPopupVariants()}>
          <div className={sidePanelHeadVariants()}>
            <Dialog.Title className={sidePanelTitleVariants()}>{title}</Dialog.Title>
            {actions}
            <button
              type="button"
              aria-label={closeLabel}
              onClick={onClose}
              className={sidePanelCloseVariants()}
            >
              <X aria-hidden="true" />
            </button>
          </div>
          <div className={sidePanelBodyVariants()}>{children}</div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
