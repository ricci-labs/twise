import { Button } from '@web/components/actions/button'
import { CategoryArt } from '@web/components/display/category-art'
import { MetaLine } from '@web/components/display/meta-line'
import type { TrashRowProps } from '@web/components/finance/trash-row/trash-row.types'
import {
  trashRowMainVariants,
  trashRowNameVariants,
  trashRowNoteVariants,
  trashRowTextVariants,
  trashRowTitleVariants,
  trashRowVariants,
} from '@web/components/finance/trash-row/trash-row.variants'
import { TwiseIcon } from '@web/components/icons/twise-icon'

export function TrashRow({
  name,
  amount,
  isStacked = false,
  icon,
  details,
  note,
  actionLabel,
  actionAccessibleLabel,
  isBusy = false,
  onAction,
}: TrashRowProps) {
  return (
    <li data-slot="trash-row" className={trashRowVariants({ isStacked })}>
      <div className={trashRowMainVariants()}>
        <CategoryArt name={name} icon={icon} size="list" />
        <div className={trashRowTextVariants()}>
          <p className={trashRowNameVariants()}>
            <span className={trashRowTitleVariants()}>{name}</span>
            {amount}
          </p>
          {details.map((detail) => (
            <p key={detail}>
              <MetaLine text={detail} />
            </p>
          ))}
          {note && <p className={trashRowNoteVariants()}>{note}</p>}
        </div>
      </div>
      <Button
        variant="secondary"
        size="sm"
        aria-label={actionAccessibleLabel}
        isLoading={isBusy}
        onClick={onAction}
      >
        <TwiseIcon name="restore" size="md" />
        {actionLabel}
      </Button>
    </li>
  )
}
