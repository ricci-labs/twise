import { TextLink } from '@web/components/actions/text-link'
import type { AccountGroupProps } from '@web/components/finance/account-group/account-group.types'
import {
  accountGroupAddVariants,
  accountGroupHeadVariants,
  accountGroupListVariants,
  accountGroupNoteVariants,
  accountGroupTitleVariants,
  accountGroupVariants,
} from '@web/components/finance/account-group/account-group.variants'
import { Plus } from 'lucide-react'
import { useId } from 'react'

export function AccountGroup({ title, add, note, children }: AccountGroupProps) {
  const titleId = useId()
  return (
    <section data-slot="account-group" aria-labelledby={titleId} className={accountGroupVariants()}>
      <div className={accountGroupHeadVariants()}>
        <h2 id={titleId} className={accountGroupTitleVariants()}>
          {title}
        </h2>
        {add && (
          <TextLink
            render={add.link ?? <button type="button" />}
            onClick={add.onPress}
            className={accountGroupAddVariants()}
          >
            <Plus aria-hidden="true" />
            {add.label}
          </TextLink>
        )}
      </div>
      <ul className={accountGroupListVariants()}>{children}</ul>
      {note && <p className={accountGroupNoteVariants()}>{note}</p>}
    </section>
  )
}
