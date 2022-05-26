import * as contentful from 'contentful-management'
import type { MigrationFunction } from 'contentful-migration'
import { runMigration } from 'contentful-migration'
import { oneLine, stripIndent } from 'common-tags'

import type * as ContentfulMigration from './types'
import { readFileSync, statSync } from 'fs'

export class ContentfulMigrationError extends Error {
  public recover?: string

  constructor(
    message: string,
    meta?: { recover: keyof ContentfulMigration.IAPI }
  ) {
    super(message)
    Object.setPrototypeOf(this, ContentfulMigrationError.prototype)
    this.recover = meta?.recover
  }
}

const contentfulMigration: ContentfulMigration.APIBuilder = async ({
  accessToken,
  spaceId,
  environmentId,
  contentTypeId,
  contentTypeName
}) => {
  const store: ContentfulMigration.IStore = {}
  
  const api: ContentfulMigration.IAPI = {
    setAccessToken: (accessToken) => {
      if (typeof accessToken !== 'string' || accessToken === '') {
        throw new ContentfulMigrationError(
          'The provided Contentful access token is not valid.'
        )
      }

      store.accessToken = accessToken

      return api
    },

    setSpaceId: (spaceId) => {
      if (typeof spaceId !== 'string' || spaceId === '') {
        throw new ContentfulMigrationError(
          'The provided Contentful space ID is not valid.'
        )
      }

      store.spaceId = spaceId

      return api
    },

    setEnvironmentId: (environmentId) => {
      if (typeof environmentId !== 'string' || environmentId === '') {
        environmentId = undefined
      }

      store.environmentId = environmentId ?? 'master'

      return api
    },

    setContentTypeId: (contentTypeId) => {
      if (typeof contentTypeId !== 'string' || contentTypeId === '') {
        contentTypeId = undefined
      }

      store.contentTypeId = contentTypeId ?? 'contentfulMigration'

      return api
    },

    setContentTypeName: (contentTypeName) => {
      if (typeof contentTypeName !== 'string' || contentTypeName === '') {
        contentTypeName = undefined
      }

      store.contentTypeName = contentTypeName ?? 'Contentful Migration'

      return api
    },

    setClient: async () => {
      if (typeof store.accessToken === 'undefined') {
        throw new ContentfulMigrationError(
          'No Contentful access token is set.',
          { recover: 'setAccessToken' }
        )
      }
      if (typeof store.spaceId === 'undefined') {
        throw new ContentfulMigrationError(
          'No Contentful space ID is set.',
          { recover: 'setSpaceId' }
        )
      }
      if (typeof store.environmentId === 'undefined') {
        throw new ContentfulMigrationError(
          'No Contentful environment ID is set.',
          { recover: 'setEnvironmentId' }
        )
      }

      // Setup the Contentful client
      const queryClient = contentful.createClient({
        accessToken: store.accessToken
      })
      const querySpace = await queryClient.getSpace(store.spaceId)
      store.client = await querySpace.getEnvironment(store.environmentId)

      // Get the default locale and store it
      const locales = await store.client.getLocales()
      const defaultLocale = locales.items.find((item) => item.default)
      if (typeof defaultLocale === 'undefined') {
        throw new ContentfulMigrationError(
          'Could not retrieve the default locale from Contentful.'
        )
      }
      store.locale = defaultLocale.code

      return api
    },

    getClient: () => store?.client,

    getContentType: async () => {
      if (!store.client) {
        throw new ContentfulMigrationError(
          'The Contentful client is not set up.',
          { recover: 'setClient' }
        )
      }
      if (!store.contentTypeId) {
        throw new ContentfulMigrationError(
          'The Contentful content type ID is not set.',
          { recover: 'setContentTypeId' }
        )
      }

      let contentType: contentful.ContentType
      try {
        contentType = await store.client.getContentType(store.contentTypeId)
      } catch (e) {
        throw new ContentfulMigrationError(
          'Could not find Contentful migration content type.',
          { recover: 'createContentType' }
        )
      }

      return contentType
    },

    createContentType: async () => {
      if (typeof store.accessToken === 'undefined') {
        throw new ContentfulMigrationError(
          'No Contentful access token is set.',
          { recover: 'setAccessToken' }
        )
      }
      if (typeof store.spaceId === 'undefined') {
        throw new ContentfulMigrationError(
          'No Contentful space ID is set.',
          { recover: 'setSpaceId' }
        )
      }
      if (typeof store.environmentId === 'undefined') {
        throw new ContentfulMigrationError(
          'No Contentful environment ID is set.',
          { recover: 'setEnvironmentId' }
        )
      }

      const migrationFunction: MigrationFunction = (migration) => {
        if (typeof store.contentTypeId === 'undefined') {
          throw new ContentfulMigrationError(
            'The Contentful content type ID is not set.',
            { recover: 'setContentTypeId' }
          )
        }
        if (typeof store.contentTypeName === 'undefined') {
          throw new ContentfulMigrationError(
            'The Contentful content type name is not set.',
            { recover: 'setContentTypeName' }
          )
        }

        const contentfulMigrations = migration
          .createContentType(store.contentTypeId)
          .name(store.contentTypeName)

        contentfulMigrations
          .createField('name')
          .type('Symbol')
          .name('Name')
          .required(true)
          .validations([
            { regexp: { pattern: '^[0-9]+-[a-zA-Z0-9-]+.[jt]s' } },
            { unique: true }
          ])

        contentfulMigrations
          .changeFieldControl('name', 'builtin', 'singleLine', {
            helpText: 'The filename of the migration that was run.'
          })

        contentfulMigrations
          .createField('content')
          .type('Text')
          .name('Content')
          .required(true)
        
        contentfulMigrations
          .changeFieldControl('content', 'builtin', 'multipleLine', {
            helpText: 'The migration function that was applied.'
          })

        contentfulMigrations.displayField('name')
      }

      await runMigration({
        migrationFunction,
        accessToken: store.accessToken,
        spaceId: store.spaceId,
        environmentId: store.environmentId,
        yes: true
      })

      return api
    },

    getEntries: async () => {
      if (typeof store.client === 'undefined') {
        throw new ContentfulMigrationError(
          'The Contentful client is not set up.',
          { recover: 'setClient' }
        )
      }
      if (typeof store.locale === 'undefined') {
        throw new ContentfulMigrationError(
          'The Contentful locale is not set.',
          { recover: 'setClient' }
        )
      }
      if (typeof store.contentTypeId === 'undefined') {
        throw new ContentfulMigrationError(
          'The Contentful content type ID is not set.',
          { recover: 'setContentTypeId' }
        )
      }

      const result = await store.client.getEntries({
        content_type: store.contentTypeId,
        order: 'sys.createdAt',
        limit: 1000
      })

      // This tool doesn't page through the entire collection, so fail hard if
      // there are more than 1,000 migrations
      if (result.total > 1000) {
        throw new ContentfulMigrationError(oneLine`
          There are more than 1000 migrations registered, that is more than this
          tool can manage.
        `)
      }

      if (result.items.length < 1) {
        return []
      }

      // This avoids some nasty type checking inside the map
      const locale = store.locale

      return result.items.map<ContentfulMigration.IEntry>(
        (item) => ({
          name: item.fields.name[locale],
          appliedAt: item.sys.createdAt,
          appliedAtFormatted: (new Date(item.sys.createdAt))
            .toLocaleString(locale, {
              weekday: 'short',
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
              timeZoneName: 'short'
            }),
          content: item.fields.content[locale]
        })
      )
    },

    createEntry: async (name, content) => {
      if (typeof store.client === 'undefined') {
        throw new ContentfulMigrationError(
          'The Contentful client is not set up.',
          { recover: 'setClient' }
        )
      }
      if (typeof store.locale === 'undefined') {
        throw new ContentfulMigrationError(
          'The Contentful locale is not set.',
          { recover: 'setClient' }
        )
      }
      if (typeof store.contentTypeId === 'undefined') {
        throw new ContentfulMigrationError(
          'The Contentful content type ID is not set.',
          { recover: 'setContentTypeId' }
        )
      }

      const localeFields = {
        name: { [store.locale]: name },
        content: { [store.locale]: content }
      }

      try {
        await store.client.createEntry(
          store.contentTypeId,
          { fields: localeFields }
        )
      } catch (e) {
        const message = e instanceof Error
          ? e.message
          : 'Unknown'
        throw new ContentfulMigrationError(stripIndent`
          The Contentful entry could not be created.

          The Contentful client error encountered was:
            ${message}
        `)
      }

      return api
    },

    runMigrations: async (migrationPaths, dryRun) => {
      if (dryRun === true) {
        console.info(oneLine`
          DRY RUN: would have executed the following Contentful migrations:
        `)
      }

      for (const migrationPath of migrationPaths) {
        const [filename, path] = migrationPath

        if (typeof path === 'undefined') {
          continue
        }

        const stat = statSync(path, { throwIfNoEntry: false })
        if (!stat?.isFile()) {
          throw new ContentfulMigrationError(oneLine`
            The Contentful migration ${filename} at ${path} is not a file.
          `)
        }

        const content = readFileSync(path).toString()
        if (content.trim() === '') {
          throw new ContentfulMigrationError(oneLine`
            The Contentful migration ${filename} at ${path} is empty.
          `)
        }

        if (dryRun === true) {
          // Just print out the migration details
          console.info(` → ${filename}: ${path}`)
        } else {
          // Apply the migration
          await runMigration({
            filePath: path,
            accessToken: store.accessToken,
            spaceId: store.spaceId,
            environmentId: store.environmentId,
            yes: true,
          })

          // Add the migration to the register after it has been applied
          await api.createEntry(filename, content.trim())
        }
      }

      return api
    }
  }

  return api
    .setAccessToken(accessToken)
    .setSpaceId(spaceId)
    .setEnvironmentId(environmentId)
    .setContentTypeId(contentTypeId)
    .setContentTypeName(contentTypeName)
    .setClient()
}

export default contentfulMigration
