import { Drawer } from '@base-ui/react/drawer'
import { Button } from '@web/components/actions/button'
import { CategoryArt } from '@web/components/display/category-art'
import { ConfirmDialog } from '@web/components/feedback/confirm-dialog'
import type { MomentSheetProps } from '@web/components/feedback/moment-sheet/moment-sheet.types'
import {
  momentSheetBackdropVariants,
  momentSheetHandleVariants,
  momentSheetPopupVariants,
  momentSheetTextVariants,
  momentSheetTitleVariants,
} from '@web/components/feedback/moment-sheet/moment-sheet.variants'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'

export function MomentSheet({
  art,
  title,
  text,
  actionLabel,
  dismissLabel,
  isOpen,
  onOpenChange,
  onAction,
}: MomentSheetProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  if (isDesktop) {
    return (
      <ConfirmDialog
        title={title}
        description={text}
        cancelLabel={dismissLabel}
        confirmLabel={actionLabel}
        confirmVariant="primary"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onConfirm={onAction}
      />
    )
  }
  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => onOpenChange(open)}>
      <Drawer.Portal>
        <Drawer.Backdrop forceRender className={momentSheetBackdropVariants()} />
        <Drawer.Viewport>
          <Drawer.Popup data-slot="moment-sheet" className={momentSheetPopupVariants()}>
            <span aria-hidden="true" className={momentSheetHandleVariants()} />
            <CategoryArt name={title} icon={art} size="moment" />
            <Drawer.Title className={momentSheetTitleVariants()}>{title}</Drawer.Title>
            <Drawer.Description className={momentSheetTextVariants()}>{text}</Drawer.Description>
            <Button width="full" onClick={onAction}>
              {actionLabel}
            </Button>
            <Drawer.Close render={<Button variant="tertiary" />}>{dismissLabel}</Drawer.Close>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
