export interface IOptionInstances {
  accessToken?: string
  spaceId?: string
  environmentId?: string
  contentTypeId?: string
  contentTypeName?: string
  migrations?: string[]
  list?: boolean | Array<'local' | 'registered' | 'unregistered' | string>
  dry?: boolean
}

export interface IOptionParameters {
  shortOption: string
  longOption: string
  allOptions: string
  english: string
  envVar: string
  fallback?: string
  help: string
}

type OptionTypes = 'value' | 'boolean' | 'variadic'

export type OptionTuple = [OptionTypes, keyof IOptionInstances, string, string?]

export type OptionTuples = Array<OptionTuple>

export type IOptions = Record<keyof IOptionInstances, IOptionParameters>
