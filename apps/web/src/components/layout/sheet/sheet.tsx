import { Drawer } from '@base-ui/react/drawer'
import type { SheetProps } from '@web/components/layout/sheet/sheet.types'
import {
  sheetBackdropVariants,
  sheetHandleVariants,
  sheetPopupVariants,
} from '@web/components/layout/sheet/sheet.variants'

export function Sheet({ title, trigger, isOpen, onOpenChange, children }: SheetProps) {
  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => onOpenChange?.(open)}>
      {trigger && <Drawer.Trigger render={trigger} />}
      <Drawer.Portal>
        <Drawer.Backdrop className={sheetBackdropVariants()} />
        <Drawer.Popup data-slot="sheet" className={sheetPopupVariants()}>
          <span aria-hidden="true" className={sheetHandleVariants()} />
          <Drawer.Title className="text-title-sm">{title}</Drawer.Title>
          {children}
        </Drawer.Popup>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
