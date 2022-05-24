import chalk from '../../lib/program/chalk'
import arrayPad from '../../lib/utilities/array-pad'
import arrayTrim from '../../lib/utilities/array-trim'

import type * as Data from './types'
import { isDataCell, isDataRow, isUnsafeData } from './guards'

const data = (unsafeData?: Data.UnsafeData, defaultCell?: Data.Cell): Data.IAPI => {
  const store: Data.IStore = {
    data: [[]],
    width: 0,
    height: 0,
    cellWidths: { columnMax: [], rowMax: [] },
    defaultCell: undefined,
    headerCount: 0,
    footerCount: 0,
    alignments: [],
    padFillStrings: [],
    columnBuffers: [],
    rowBuffers: [],
  }

  const api: Data.IAPI = {
    defaultCell: (cell) => {
      store.defaultCell = cell
      return api
    },

    set: (unsafeData) => {
      if (!isUnsafeData(unsafeData)) {
        store.data = []
        store.width = 0
        store.height = 0
        api._setCellWidths()
        return api
      }
      
      if (isDataCell(unsafeData)) {
        store.data = [[unsafeData]]
        store.width = 1
        store.height = 1
        api._setCellWidths()
        return api
      }

      if (isDataRow(unsafeData)) {
        store.data = [unsafeData]
        store.width = store.data[0].length
        store.height = 1
        api._setCellWidths()
        return api
      }

      store.data = unsafeData.map(
        (row) => isDataCell(row) ? [row] : row
      )
      store.width = Math.max(...store.data.map((row) => row.length))
      store.height = store.data.length
      api._fillCells()
      api._setCellWidths()
      return api
    },

    get: () => store.data,

    width: () => store.width,

    height: () => store.height,

    transpose: (({ save = true, header = false, footer = false }) => {
      const width = api.width()

      const [headers, rows, footers] = api._slice()

      const table: Data.SafeData = []
      if (header) {
        table.push(...headers)
      }
      table.push(...rows)
      if (footer) {
        table.push(...footers)
      }

      const transposedTable = table.reduce<Data.SafeData>(
        (accumulator, current, row) => {
          for (let column = 0; column < width; column++) {
            accumulator[column] ??= []
            accumulator[column][row] = current[column]
          }
          return accumulator
        },
        []
      )

      // if header was included in the transpose, then reset headers to zero
      // otherwise reinstate the headers
      const trimmedHeaders = header
        ? 0
        : headers.map((row) => arrayTrim(row, 'end'))

      // if footer was included in the transpose, then reset footers to zero
      // otherwise reinstate the footers
      const trimmedFooters = footer
        ? 0
        : footers.map((row) => arrayTrim(row, 'end'))

      return save
        ? api
            .set(transposedTable)
            .setHeader(trimmedHeaders)
            .setFooter(trimmedFooters)
        : transposedTable
    }) as Data.IAPI['transpose'],

    _stringifyCell: (value) => typeof value === 'undefined' || value === ''
      ? String(store.defaultCell ?? '')
      : String(value).trim(),

    _fillCells: () => {
      store.data = store.data.map(
        (row, index) => {
          const value = index < store.headerCount
            ? ''
            : store.defaultCell
          return arrayPad(row, 'end', store.width, value)
        }
      )
    },

    _setCellWidths: () => {
      const stringifiedData = store.data
        .map((row) => row.map(api._stringifyCell))

      store.cellWidths.rowMax = stringifiedData.map(
        (row) => Math.max(...row.map((cell) => cell.length))
      )

      const columnWidths = stringifiedData
        .reduce<Array<Array<number>>>(
          (accumulator, current) => {
            current.forEach((cell, column) => {
              accumulator[column] ??= []
              accumulator[column].push(cell.length)
            })
            return accumulator
          },
          []
        )
      store.cellWidths.columnMax = columnWidths
        .map((widths) => Math.max(...widths))
    },

    cellWidths: () => store.cellWidths,

    setHeader: (unsafeHeader) => {
      if (typeof unsafeHeader === 'undefined') {
        store.headerCount = 0
        return api
      }

      if (typeof unsafeHeader === 'number') {
        store.headerCount = Math.max(0, unsafeHeader)
        return api
      }

      if (isDataCell(unsafeHeader)) {
        store.headerCount = 1
        api.set([[unsafeHeader], ...store.data])
        return api
      }

      if (isDataRow(unsafeHeader)) {
        store.headerCount = 1
        api.set([unsafeHeader, ...store.data])
        return api
      }

      const safeHeaders = unsafeHeader
        .map((row) => isDataCell(row) ? [row] : row)
        store.headerCount = safeHeaders.length
      api.set([...safeHeaders, ...store.data])
      return api
    },

    setFooter: (unsafeFooter) => {
      if (typeof unsafeFooter === 'undefined') {
        store.footerCount = 0
        return api
      }

      if (typeof unsafeFooter === 'number') {
        store.footerCount = Math.max(0, unsafeFooter)
        return api
      }

      if (isDataCell(unsafeFooter)) {
        store.footerCount = 1
        api.set([...store.data, [unsafeFooter]])
        return api
      }

      if (isDataRow(unsafeFooter)) {
        store.footerCount = 1
        api.set([...store.data, unsafeFooter])
        return api
      }

      const safeFooters = unsafeFooter.map(
        (row) => isDataCell(row) ? [row] : row
      )
      store.footerCount = safeFooters.length
      api.set([...store.data, ...safeFooters])
      return api
    },

    setAlignment: (alignment, column) => {
      if (typeof column !== 'number') {
        store.alignments = alignment === 'left'
          ? []
          : new Array(store.width).fill(alignment)
        return api
      }

      const safeColumnIndex = Math.max(0, column - 1)

      if (alignment === 'left') {
        delete store.alignments[safeColumnIndex]
        return api
      }

      store.alignments[safeColumnIndex] = alignment
      return api
    },

    setAlignments: (alignments) => {
      alignments?.forEach((alignment, column) => {
        if (typeof alignment !== 'undefined') {
          api.setAlignment(alignment, column + 1)
        }
      })

      return api
    },

    _padCell: (alignment, value, width, fillString = ' ', dim = true) => {
      const safeValue = api._stringifyCell(value)
      const safeFillString = typeof fillString === 'string'
        ? fillString.trim()[0] ?? ' '
        : ' '

      if (safeValue.length === width) {
        return safeValue
      }

      if (safeValue === '') {
        const padded = safeFillString.repeat(width)
        return dim ? chalk.dim(padded) : padded
      }

      let padded: string
      switch (alignment ?? 'left') {
        case 'left':
          padded = safeValue.concat(' ').padEnd(width, safeFillString)
          break

        case 'right':
          padded = ' '.concat(safeValue).padStart(width, safeFillString)
          break

        case 'center':
          if (safeValue.length === width - 1) {
            return safeValue.concat(' ')
          }

          const padBothLength = width - safeValue.length
          const padStartLength = Math.floor(padBothLength / 2)
          const padEndLength = padBothLength - padStartLength
          const padStart = safeFillString.repeat(padStartLength - 1)
          const padEnd = safeFillString.repeat(padEndLength - 1)
          padded = `${padStart} ${safeValue} ${padEnd}`
          break
      }

      return dim
        ? padded
            .replace(/^…+/, (match) => chalk.dim(match))
            .replace(/…+$/, (match) => chalk.dim(match))
        : padded
    },

    _slice: () => [
      store.data.slice(0, store.headerCount),
      store.data.slice(store.headerCount, store.height - store.footerCount),
      store.data.slice(store.height - store.footerCount)
    ],

    definitions: () => {
      const [headers, rows, footers] = api._slice()

      const joinHeaders = (headers: Data.SafeData): Array<string> => {
        if (headers.length < 1) {
          return []
        }

        return headers.map(
          (values) => values
            .map((value, column) => {
              let buffer = ' '
              switch (column) {
                case 0:
                  buffer = ''
                  break
                case 1:
                  buffer = api._stringifyCell(values[0]) === '' ? '  ' : ': '
                  break
              }

              const safeValue = api._padCell(
                column === 0 ? 'right' : store.alignments[column],
                value,
                store.cellWidths.columnMax[column],
              )

              return chalk.dim(buffer.concat(safeValue))
            })
            .join('')
        )
      }

      const joinedHeaders = joinHeaders(headers)

      const joinedRows = rows.length > 0
        ? rows.map(
            (values) => values
              .map((value, column) => {
                let buffer = ' '
                switch (column) {
                  case 0:
                    buffer = ''
                    break
                  case 1:
                    buffer = ': '
                    break
                }

                const safeFillString = column === 0 || store.width === 2
                  ? ' '
                  : '…'

                const safeValue = api._padCell(
                  column === 0 ? 'right' : store.alignments[column],
                  value,
                  store.cellWidths.columnMax[column],
                  safeFillString
                )

                return buffer.concat(safeValue)
              })
              .join('')
          )
        : []

      const joinedFooters = joinHeaders(footers)

      return [...joinedHeaders, ...joinedRows, ...joinedFooters]
    },

    list: () => {
      const [headers, rows, footers] = api._slice()

      const joinHeaders = (headers: Data.SafeData): Array<string> => {
        if (headers.length < 1) {
          return []
        }

        return headers.map(
          (values) => values
            .map((value, column) => {
              const buffer = column === 0 ? '  ' : ' '
              const safeValue = api._padCell(
                'left',
                value,
                store.cellWidths.columnMax[column],
                ' ',
                false
              )
              return chalk.dim(buffer.concat(safeValue))
            })
            .join('')
        )
      }

      const joinedHeaders = joinHeaders(headers)

      const joinedRows = rows.map(
        (values) => values
          .map((value, column) => {
            const buffer = column === 0
              ? chalk.dim('• ')
              : ' '
            const safeValue = api._padCell(
              store.alignments[column],
              value,
              store.cellWidths.columnMax[column],
              store.width === 1 ? ' ' : '…'
            )
            return buffer.concat(safeValue)
          })
          .join('')
      )

      const joinedFooters = joinHeaders(footers)

      return [...joinedHeaders, ...joinedRows, ...joinedFooters]
    },

    table: () => {
      const [headers, rows, footers] = api._slice()

      const gridLine = (pattern: string): string => {
        const [left, buffer, center, right] = pattern.split('')
        const body = store.cellWidths
          .columnMax.map((width) => buffer.repeat(width + 2))
          .join(center)
        return chalk.dim(left.concat(body, right))
      }

      const gridTop = gridLine('┌─┬┐')
      const gridHeader = gridLine('┝━┿┥')
      const gridMiddle = gridLine('├─┼┤')
      const gridFooter = gridLine('╞═╪╡')
      const gridBottom = gridLine('└─┴┘')

      const joinedHeaders = headers.length > 0
        ? headers.flatMap((values, row) => {
            const body = values.map((value, column) => api._padCell(
              store.alignments[column],
              value,
              store.cellWidths.columnMax[column],
            )).join(' │ ')

            return [
              chalk.dim('│ '.concat(body, ' │')),
              row === headers.length - 1 ? gridHeader : gridMiddle
            ]
          })
        : []

      const joinedRows = rows.length > 0
        ? rows.flatMap((values, row) => {
            const body = values.map((value, column) => api._padCell(
              store.alignments[column],
              value,
              store.cellWidths.columnMax[column],
            )).join(chalk.dim(' │ '))

            const line = chalk.dim('│ ').concat(body, chalk.dim(' │'))

            return row === rows.length - 1 ? line : [line, gridMiddle]
          })
        : []

      const joinedFooters = footers.length > 0
        ? footers.flatMap((values, row) => {
            const body = values.map((value, column) => api._padCell(
              store.alignments[column],
              value,
              store.cellWidths.columnMax[column],
            )).join(' │ ')

            return [
              row === 0 ? gridFooter : gridMiddle,
              chalk.dim('│ '.concat(body, ' │')),
            ]
          })
        : []

      return [
        gridTop,
        ...joinedHeaders,
        ...joinedRows,
        ...joinedFooters,
        gridBottom
      ]
    }
  }

  return api.defaultCell(defaultCell).set(unsafeData)
}

export default data
