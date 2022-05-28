import type * as Data from '../data/index.d'

export type Label = 'warning' | 'error' | 'abort' | 'success'

interface TextOptionsParameter {
  label?: Label
  trim?: boolean
  indent?: number
}

interface DataSections {
  headers?: Data.UnsafeData
  rows?: Data.UnsafeData
  footers?: Data.UnsafeData
}

type DataParameter = DataSections | Data.UnsafeData

interface TableOptionsParameter {
  indent?: number
  alignments?: Array<Data.CellAlignment | undefined>
}

export interface IAPI {
  heading: (text: string, options?: TextOptionsParameter) => IAPI
  text: (text: string, options?: TextOptionsParameter) => IAPI
  blank: (indent?: number) => IAPI
  data: (
    type: 'list' | 'definitions' | 'table',
    data: DataParameter,
    options?: TableOptionsParameter
  ) => IAPI
  definitions: (data: DataParameter, options?: TableOptionsParameter) => IAPI
  list: (data: DataParameter, options?: TableOptionsParameter) => IAPI
  table: (data: DataParameter, options?: TableOptionsParameter) => IAPI
  wait: (id: string, prefix?: string, options?: { indent?: number }) => IAPI
  resume: (id: string, notice?: string, options?: { indent?: number }) => IAPI
  setIndent: (level: number) => IAPI
  _label: (label?: Label) => string
  confirm: (text: string, options?: { indent?: number }) => Promise<boolean>
  abort: (options?: { indent?: number }) => void
  complete: (options?: { indent?: number }) => void
  print: () => IAPI
  finish: () => void
}

type Types = keyof Omit<IAPI, 'flush' | 'finish'>

interface ILine {
  type: Types
  label?: Label
  text: string
  trim?: boolean
  indent: number
}

interface IAction {
  id: string
  timer: NodeJS.Timer
  seconds: number
}

export interface IStore {
  content: Array<ILine>
  actions: Record<string, IAction>
  indent: number
}
