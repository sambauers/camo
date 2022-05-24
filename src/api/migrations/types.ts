export interface IVariants {
  filename: string
  basename: string
  id: number
  path?: string
}
export type Flags = 'local' | 'registered' | 'requested'

export type IFlags = Record<Flags, boolean> & {
  appliedAt?: string
  appliedAtFormatted?: string
}
export type IMigration = IVariants & IFlags

export type IMigrationPartial = Pick<IMigration, 'filename'> & Partial<Omit<IMigration, 'filename'>>

export type IMigrations = Record<string, IMigration>

export type IPropertyTypes<K extends keyof IMigration = never> = {
  [P in K]: IMigration[P]
}[K]

export interface IStore {
  localDirectory?: string
  data: IMigrations
}

interface IParameters {
  localDirectory?: IStore['localDirectory']
}

type GetMigrationsFlags<F extends undefined | keyof IFlags = undefined> =
  F extends undefined
    ? Partial<IFlags>
    : [F] extends [keyof IFlags]
      ? Partial<Omit<IFlags, F>>
      : undefined

type GetMigrationsReturnType<L extends boolean | keyof IMigration = false> =
  L extends false
    ? IMigrations
    : L extends true
      ? Array<IMigration>
      : [L] extends [keyof IMigration]
        ? Array<IPropertyTypes<L>>
        : undefined

type ExpandMigrationParameter =
  Pick<IMigration, 'filename'> &
  Partial<Omit<IMigration, 'filename' | 'basename' | 'id'>>

export interface IAPI {
  setLocalDirectory: (localDirectory?: IParameters['localDirectory']) => IAPI
  getLocalDirectory: () => IStore['localDirectory']
  expandMigration: (migration: ExpandMigrationParameter) => IMigration
  mergeMigrations: (
    base?: IMigration,
    migration?: IMigration
  ) => IMigration | undefined
  mergeData: (migrations: Array<IMigration>) => IAPI
  getMigrations: <L extends boolean | keyof IMigration = false>(
    options?: { flags?: GetMigrationsFlags, list?: L }
  ) => GetMigrationsReturnType<L>
  setLocal: () => IAPI
  getLocal: <L extends boolean | keyof IMigration = false>(
    options?: { flags?: GetMigrationsFlags<'local'>, list?: L }
  ) => GetMigrationsReturnType<L>
  getLocalVariantList: () =>
    Array<IPropertyTypes<'filename' | 'basename' | 'id'>>
  setRegistered: (migrations: Array<IMigrationPartial>) => Promise<IAPI>
  getRegistered: <L extends boolean | keyof IMigration = false>(
    options?: { flags?: GetMigrationsFlags<'registered'>, list?: L }
  ) => GetMigrationsReturnType<L>
  getUnregistered: <L extends boolean | keyof IMigration = false>(
    options?: { flags?: GetMigrationsFlags<'local' | 'registered'>, list?: L }
  ) => GetMigrationsReturnType<L>
  setRequested: (requested?: Array<string | number>) => IAPI
  getRequested: <L extends boolean | keyof IMigration = false>(
    options?: { flags?: GetMigrationsFlags<'requested'>, list?: L }
  ) => GetMigrationsReturnType<L>
  getData: () => IMigrations
}

export type APIBuilder = (options?: IParameters) => IAPI
