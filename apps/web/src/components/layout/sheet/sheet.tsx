import { Drawer } from '@base-ui/react/drawer'
import type { SheetProps } from '@web/components/layout/sheet/sheet.types'
import {
  sheetBackdropVariants,
  sheetCloseVariants,
  sheetHandleVariants,
  sheetHeadVariants,
  sheetPopupVariants,
  sheetTitleVariants,
} from '@web/components/layout/sheet/sheet.variants'
import { X } from 'lucide-react'

export function Sheet({ title, closeLabel, trigger, isOpen, onOpenChange, children }: SheetProps) {
  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => onOpenChange?.(open)}>
      {trigger && <Drawer.Trigger render={trigger} />}
      <Drawer.Portal>
        <Drawer.Backdrop forceRender className={sheetBackdropVariants()} />
        <Drawer.Viewport>
          <Drawer.Popup data-slot="sheet" className={sheetPopupVariants()}>
            <span aria-hidden="true" className={sheetHandleVariants()} />
            <div className={sheetHeadVariants()}>
              <Drawer.Title className={sheetTitleVariants({ hasClose: Boolean(closeLabel) })}>
                {title}
              </Drawer.Title>
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
