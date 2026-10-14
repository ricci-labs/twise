import type { ToastOptions } from '@web/components/feedback/toast/toast.types'
import {
  toastActionVariants,
  toastIconVariants,
  toastMessageVariants,
  toastVariants,
} from '@web/components/feedback/toast/toast.variants'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner'

const DESKTOP_QUERY = '(min-width: 64rem)'
const TOAST_DURATION_MS = 4000
const UNDO_DURATION_MS = 8000

export function Toaster() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  return <SonnerToaster position={isDesktop ? 'top-right' : 'bottom-center'} />
}

export function showToast(message: string, { action, tone = 'neutral' }: ToastOptions = {}) {
  sonnerToast.custom(
    (id) => (
      <div data-slot="toast" className={toastVariants()}>
        {tone === 'success' && <TwiseIcon name="ok" className={toastIconVariants()} />}
        <p className={toastMessageVariants()}>{message}</p>
        {action && (
          <button
            type="button"
            className={toastActionVariants()}
            onClick={() => {
              action.onPress()
              sonnerToast.dismiss(id)
            }}
          >
            {action.label}
          </button>
        )}
      </div>
    ),
    { id: message, duration: action ? UNDO_DURATION_MS : TOAST_DURATION_MS },
  )
}
