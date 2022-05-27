export type Cell = undefined | boolean | string | number

export type Row<T extends Cell = Cell> = Array<T>

export type SafeData<T extends Cell = Cell> = Array<Row<T>>

export type UnsafeData = Array<Row | Cell> | Row | Cell

export interface ICellWidths {
  columnMax: Array<number>
  rowMax: Array<number>
}

export type CellAlignment = 'left' | 'right' | 'center'

export interface IStore {
  data: SafeData
  width: number
  height: number
  cellWidths: ICellWidths
  defaultCell: Cell
  headerCount: number
  footerCount: number
  alignments: Array<CellAlignment>
  padFillStrings: Array<string>
  columnBuffers: Array<string>
  rowBuffers: Array<string>
}

export interface IAPI {
  defaultCell: (cell: Cell) => IAPI
  set: (unsafeTable?: UnsafeData) => IAPI
  get: () => IStore['data']
  width: () => IStore['width']
  height: () => IStore['height']
  transpose({
    save,
    header,
    footer,
  }: {
    save?: true
    header?: boolean
    footer?: boolean
  }): IAPI
  transpose({
    save,
    header,
    footer,
  }: {
    save: false
    header?: boolean
    footer?: boolean
  }): SafeData
  _stringifyCell: (value: Cell) => string
  _fillCells: () => void
  _setCellWidths: () => void
  cellWidths: () => IStore['cellWidths']
  setHeader: (unsafeHeader: UnsafeData) => IAPI
  setFooter: (unsafeFooter: UnsafeData) => IAPI
  setAlignment: (alignment: CellAlignment, column?: number) => IAPI
  setAlignments: (alignments?: Array<CellAlignment | undefined>) => IAPI
  _padCell: (
    alignment: CellAlignment,
    value: Cell,
    width: number,
    fillString?: string,
    dim?: boolean
  ) => string
  _slice: () => [SafeData, SafeData, SafeData]
  definitions: () => Array<string>
  list: () => Array<string>
  table: () => Array<string>
}
