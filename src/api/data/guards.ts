import type * as Data from './types'

export const isDataCell = (
  maybeDataCell: unknown
): maybeDataCell is Data.Cell =>
  ['undefined', 'boolean', 'string', 'number'].includes(typeof maybeDataCell)

export const isDataRow = (maybeDataRow: unknown): maybeDataRow is Data.Row =>
  Array.isArray(maybeDataRow) && maybeDataRow.every(isDataCell)

export const isSafeData = (maybeData: unknown): maybeData is Data.SafeData =>
  Array.isArray(maybeData) && maybeData.every(isDataRow)

export const isUnsafeData = (
  maybeUnsafeData: unknown
): maybeUnsafeData is Data.UnsafeData =>
  isDataCell(maybeUnsafeData) ||
  isDataRow(maybeUnsafeData) ||
  (Array.isArray(maybeUnsafeData) &&
    maybeUnsafeData.every((row) => isDataCell(row) || isDataRow(row)))
