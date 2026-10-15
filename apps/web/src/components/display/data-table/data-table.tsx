import { Amount } from '@web/components/display/amount'
import { CategoryArt } from '@web/components/display/category-art'
import type {
  DataTableAmountProps,
  DataTableBodyRowProps,
  DataTableNameProps,
  DataTableProps,
} from '@web/components/display/data-table/data-table.types'
import {
  dataTableAmountVariants,
  dataTableBandCellVariants,
  dataTableBandVariants,
  dataTableCellVariants,
  dataTableHeadCellVariants,
  dataTableNameDetailVariants,
  dataTableNameLabelVariants,
  dataTableNameLineVariants,
  dataTableNameTextVariants,
  dataTableNameVariants,
  dataTableRowVariants,
  dataTableVariants,
} from '@web/components/display/data-table/data-table.variants'
import { ColorSwatch } from '@web/components/inputs/color-swatch'
import { cloneElement } from 'react'

export function DataTable({ label, layout, columns, rows }: DataTableProps) {
  return (
    <table data-slot="data-table" aria-label={label} className={dataTableVariants()}>
      <thead>
        <tr className={dataTableRowVariants({ layout, isHead: true })}>
          {columns.map((column) => (
            <th
              key={column.key}
              scope="col"
              className={dataTableHeadCellVariants({ layout, align: column.align })}
            >
              {column.isLabelHidden ? (
                <span className="sr-only">{column.label}</span>
              ) : (
                column.label
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <DataTableBodyRow key={row.key} row={row} layout={layout} columns={columns} />
        ))}
      </tbody>
    </table>
  )
}

function DataTableBodyRow({ row, layout, columns }: DataTableBodyRowProps) {
  if ('band' in row) {
    return (
      <tr className={dataTableBandVariants()}>
        <th colSpan={columns.length} scope="colgroup" className={dataTableBandCellVariants()}>
          {row.band}
        </th>
      </tr>
    )
  }
  return (
    <tr className={dataTableRowVariants({ layout, isOpen: row.isOpen })}>
      {row.cells.map((cell, position) => (
        <td
          key={columns[position]?.key ?? position}
          className={dataTableCellVariants({
            align: columns[position]?.align,
            isActions: columns[position]?.isActions,
          })}
        >
          {cell}
        </td>
      ))}
    </tr>
  )
}

export function DataTableName({
  name,
  icon,
  color = null,
  detail,
  artName = name,
  badges,
  link,
}: DataTableNameProps) {
  const content = (
    <>
      <CategoryArt name={artName} icon={icon} size="row" />
      <span className={dataTableNameTextVariants()}>
        {badges ? (
          <span className={dataTableNameLineVariants()}>
            <span className={dataTableNameLabelVariants()}>{name}</span>
            {badges}
          </span>
        ) : (
          <span className={dataTableNameLabelVariants()}>{name}</span>
        )}
        {detail && <span className={dataTableNameDetailVariants()}>{detail}</span>}
      </span>
      <ColorSwatch color={color} />
    </>
  )
  if (!link) {
    return (
      <span data-slot="data-table-name" className={dataTableNameVariants()}>
        {content}
      </span>
    )
  }
  return cloneElement(
    link,
    { 'data-slot': 'data-table-name', className: dataTableNameVariants() },
    content,
  )
}

export function DataTableAmount({ cents }: DataTableAmountProps) {
  return (
    <span className={dataTableAmountVariants()}>
      <Amount cents={cents} size="inherit" />
    </span>
  )
}
