import { Drawer } from '@base-ui/react/drawer'
import type { SheetProps } from '@web/components/layout/sheet/sheet.types'
import {
  sheetBackdropVariants,
  sheetCloseVariants,
  sheetDescriptionVariants,
  sheetHandleVariants,
  sheetHeadVariants,
  sheetPopupVariants,
  sheetTitleBlockVariants,
  sheetTitleVariants,
} from '@web/components/layout/sheet/sheet.variants'
import { X } from 'lucide-react'

export function Sheet({
  title,
  description,
  closeLabel,
  trigger,
  isOpen,
  onOpenChange,
  children,
}: SheetProps) {
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
