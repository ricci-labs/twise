import { Dialog } from '@base-ui/react/dialog'
import { Drawer } from '@base-ui/react/drawer'
import { Popover } from '@base-ui/react/popover'
import type {
  SheetAnchoredProps,
  SheetBodyProps,
  SheetProps,
} from '@web/components/layout/sheet/sheet.types'
import {
  sheetBackdropVariants,
  sheetCloseVariants,
  sheetDescriptionVariants,
  sheetDialogVariants,
  sheetHandleVariants,
  sheetHeadVariants,
  sheetPopoverVariants,
  sheetPopupVariants,
  sheetPositionerVariants,
  sheetTitleBlockVariants,
  sheetTitleVariants,
} from '@web/components/layout/sheet/sheet.variants'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'
import { X } from 'lucide-react'

const POPOVER_GAP = 6

export function Sheet({ anchor, ...props }: SheetProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  if (!isDesktop) {
    return <DrawerSheet {...props} />
  }
  return anchor ? <PopoverSheet {...props} anchor={anchor} /> : <DialogSheet {...props} />
}

function DrawerSheet({
  title,
  description,
  closeLabel,
  trigger,
  isOpen,
  onOpenChange,
  children,
}: SheetBodyProps) {
  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => onOpenChange?.(open)}>
      {trigger && <Drawer.Trigger render={trigger} />}
      <Drawer.Portal>
        <Drawer.Backdrop forceRender className={sheetBackdropVariants()} />
        <Drawer.Viewport>
          <Drawer.Popup data-slot="sheet" className={sheetPopupVariants()}>
            <span aria-hidden="true" className={sheetHandleVariants()} />
            <div className={sheetHeadVariants()}>
              <div className={sheetTitleBlockVariants()}>
                <Drawer.Title className={sheetTitleVariants({ hasClose: Boolean(closeLabel) })}>
                  {title}
                </Drawer.Title>
                {description && (
                  <Drawer.Description className={sheetDescriptionVariants()}>
                    {description}
                  </Drawer.Description>
                )}
              </div>
              {closeLabel && (
                <Drawer.Close aria-label={closeLabel} className={sheetCloseVariants()}>
                  <X aria-hidden="true" />
                </Drawer.Close>
              )}
            </div>
            {children}
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

function PopoverSheet({
  title,
  description,
  closeLabel,
  trigger,
  anchor,
  isOpen,
  onOpenChange,
  children,
}: SheetAnchoredProps) {
  return (
    <Popover.Root open={isOpen} onOpenChange={(open) => onOpenChange?.(open)}>
      {trigger && <Popover.Trigger render={trigger} />}
      <Popover.Portal>
        <Popover.Positioner
          anchor={anchor}
          side="bottom"
          align="start"
          sideOffset={POPOVER_GAP}
          className={sheetPositionerVariants()}
        >
          <Popover.Popup data-slot="sheet" className={sheetPopoverVariants()}>
            <div className={sheetHeadVariants()}>
              <div className={sheetTitleBlockVariants()}>
                <Popover.Title className={sheetTitleVariants({ hasClose: Boolean(closeLabel) })}>
                  {title}
                </Popover.Title>
                {description && (
                  <Popover.Description className={sheetDescriptionVariants()}>
                    {description}
                  </Popover.Description>
                )}
              </div>
              {closeLabel && (
                <Popover.Close aria-label={closeLabel} className={sheetCloseVariants()}>
                  <X aria-hidden="true" />
                </Popover.Close>
              )}
            </div>
            {children}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}

function DialogSheet({
  title,
  description,
  closeLabel,
  trigger,
  isOpen,
  onOpenChange,
  children,
}: SheetBodyProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => onOpenChange?.(open)}>
      {trigger && <Dialog.Trigger render={trigger} />}
      <Dialog.Portal>
        <Dialog.Backdrop className={sheetBackdropVariants()} />
        <Dialog.Popup data-slot="sheet" className={sheetDialogVariants()}>
          <div className={sheetHeadVariants()}>
            <div className={sheetTitleBlockVariants()}>
              <Dialog.Title className={sheetTitleVariants({ hasClose: Boolean(closeLabel) })}>
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className={sheetDescriptionVariants()}>
                  {description}
                </Dialog.Description>
              )}
            </div>
            {closeLabel && (
              <Dialog.Close aria-label={closeLabel} className={sheetCloseVariants()}>
                <X aria-hidden="true" />
              </Dialog.Close>
            )}
          </div>
          {children}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
