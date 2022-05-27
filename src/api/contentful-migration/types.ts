import type { Environment, ContentType } from 'contentful-management'

interface IParameters {
  accessToken?: string
  spaceId?: string
  environmentId?: string
  contentTypeId?: string
  contentTypeName?: string
}

export interface IStore extends IParameters {
  client?: Environment
  locale?: string
}

export interface IEntry {
  name: string
  appliedAt: string
  appliedAtFormatted: string
  content: string
}

export interface IAPI {
  setAccessToken: (accessToken: IParameters['accessToken']) => IAPI
  setSpaceId: (spaceId: IParameters['spaceId']) => IAPI
  setEnvironmentId: (environmentId?: IParameters['environmentId']) => IAPI
  setContentTypeId: (contentTypeId?: IParameters['contentTypeId']) => IAPI
  setContentTypeName: (contentTypeName?: IParameters['contentTypeName']) => IAPI
  setClient: () => Promise<IAPI>
  getClient: () => IStore['client']
  getContentType: () => Promise<ContentType>
  createContentType: () => Promise<IAPI>
  getEntries: () => Promise<Array<IEntry>>
  createEntry: (name: string, content: string) => Promise<IAPI>
  runMigrations: (
    migrations: Array<[string, string | undefined]>,
    dryRun?: boolean
  ) => Promise<IAPI>
}

export type APIBuilder = (options: IParameters) => Promise<IAPI>
