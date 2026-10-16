import { useRender } from '@base-ui/react/use-render'
import { CategoryArt } from '@web/components/display/category-art'
import { splitShortcutMessages as messages } from '@web/components/finance/split-shortcut/split-shortcut.messages'
import type { SplitShortcutProps } from '@web/components/finance/split-shortcut/split-shortcut.types'
import {
  splitShortcutBodyVariants,
  splitShortcutChevronVariants,
  splitShortcutEditVariants,
  splitShortcutTextVariants,
  splitShortcutTitleVariants,
  splitShortcutVariants,
} from '@web/components/finance/split-shortcut/split-shortcut.variants'
import { ChevronRight } from 'lucide-react'

const SPLIT_ART = 'together'

export function SplitShortcut({ text, link, canEdit }: SplitShortcutProps) {
  return useRender({
    render: link,
    props: {
      'data-slot': 'split-shortcut',
      className: splitShortcutVariants(),
      children: (
        <>
          <CategoryArt name={messages.title} icon={SPLIT_ART} size="lg" />
          <span className={splitShortcutBodyVariants()}>
            <span className={splitShortcutTitleVariants()}>{messages.title}</span>
            <span className={splitShortcutTextVariants()}>{text}</span>
            {canEdit && <span className={splitShortcutEditVariants()}>{messages.edit}</span>}
          </span>
          <ChevronRight aria-hidden="true" className={splitShortcutChevronVariants()} />
        </>
      ),
    },
  })
}
