import { join } from 'node:path'
import { readdirSync, statSync } from 'node:fs'
import { stripIndent } from 'common-tags'

import getErrorMessage from '../../lib/utilities/get-error-message.js'
import {
  getMigrationBasename,
  getMigrationId,
  isValidMigrationFilename,
} from './utilities.js'
import type * as Migrations from './index.d.js'

const migrations: Migrations.APIBuilder = ({ localDirectory }) => {
  const store: Migrations.IStore = {
    localDirectory: '',
    data: {},
  }

  const api: Migrations.IAPI = {
    setLocalDirectory: (localDirectory) => {
      if (typeof localDirectory !== 'string' || localDirectory === '') {
        throw new Error('The provided local directory is empty.')
      }

      const stat = statSync(localDirectory, { throwIfNoEntry: false })
      if (!stat?.isDirectory()) {
        throw new Error(stripIndent`
          The provided local migrations directory path is not a directory:
            ${localDirectory}
        `)
      }

      try {
        readdirSync(localDirectory)
      } catch (e) {
        throw new Error(stripIndent`
          The provided local migrations directory could not be read:
            ${localDirectory}

          The read error encountered was:
            ${getErrorMessage(e)}
        `)
      }

      store.localDirectory = localDirectory
      return api.unsetLocal().setLocal()
    },

    getLocalDirectory: () => {
      return store.localDirectory
    },

    expandMigration: (migration) => {
      const {
        filename,
        local = false,
        registered = false,
        requested = false,
      } = migration

      const expanded: Migrations.IMigration = {
        filename,
        basename: getMigrationBasename(filename),
        id: getMigrationId(filename),
        local,
        registered,
        requested,
      }

      if (local) {
        expanded.path = join(store.localDirectory, filename)
      }

      if (!registered) {
        return expanded
      }

      const { appliedAt, appliedAtFormatted } = migration

      return {
        ...expanded,
        appliedAt,
        appliedAtFormatted,
      }
    },

    mergeMigrations: (base, migration) => {
      if (typeof base === 'undefined' && typeof migration === 'undefined') {
        return undefined
      }

      if (typeof base === 'undefined') {
        return migration
      }

      if (typeof migration === 'undefined') {
        return base
      }

      const merged: Migrations.IMigration = {
        ...{
          filename: base.filename,
          basename: base.basename,
          id: base.id,
        },
        ...{
          filename: migration.filename,
          basename: migration.basename,
          id: migration.id,
        },
        local: base.local || migration.local,
        registered: base.registered || migration.registered,
        requested: base.requested || migration.requested,
      }

      if (merged.local) {
        merged.path = join(store.localDirectory, merged.filename)
      }

      if (!merged.registered) {
        delete merged.appliedAt
        delete merged.appliedAtFormatted
        return merged
      } else {
        merged.appliedAt = migration.appliedAt ?? base.appliedAt
        merged.appliedAtFormatted =
          migration.appliedAtFormatted ?? base.appliedAtFormatted
      }

      return merged
    },

    mergeData: (migrations) => {
      migrations.forEach((migration) => {
        const key = migration.filename
        const merged = api.mergeMigrations(store.data[key], migration)
        if (typeof merged === 'undefined') {
          delete store.data[key]
          return
        }
        store.data[key] = merged
      })

      const data = Object.entries(store.data)

      data.sort(([a], [b]) => {
        // logically a will never equal b
        if (a < b) {
          return -1
        }
        return 1
      })

      store.data = Object.fromEntries(data)

      return api
    },

    getMigrations: (({ flags, list } = {}) => {
      if (
        (typeof flags === 'undefined' || Object.keys(flags).length < 1) &&
        (typeof list === 'undefined' || list === false)
      ) {
        return store.data
      }

      let entries = Object.entries(store.data)

      if (typeof flags !== 'undefined') {
        entries = entries.filter(([_filename, migration]) => {
          const localFlagMatch =
            typeof flags.local === 'boolean'
              ? flags.local === migration.local
              : true

          const registeredFlagMatch =
            typeof flags.registered === 'boolean'
              ? flags.registered === migration.registered
              : true

          const requestedFlagMatch =
            typeof flags.requested === 'boolean'
              ? flags.requested === migration.requested
              : true

          return localFlagMatch && registeredFlagMatch && requestedFlagMatch
        })
      }

      if (typeof list === 'undefined' || list === false) {
        return Object.fromEntries(entries)
      }

      if (list === true) {
        return entries.map(([_filename, migration]) => migration)
      }

      return entries.map(
        ([_filename, migration]) =>
          migration[list as keyof Migrations.IMigration]
      )
    }) as Migrations.IAPI['getMigrations'],

    setLocal: () => {
      if (store.localDirectory === '') {
        throw new Error('No local migrations directory is set.')
      }

      const migrationFiles = readdirSync(store.localDirectory)
        .filter(isValidMigrationFilename)
        .map((filename) => api.expandMigration({ filename, local: true }))

      return api.mergeData(migrationFiles)
    },

    getLocal: (({ flags, list } = {}) =>
      api.getMigrations({
        flags: { ...flags, local: true },
        list,
      })) as Migrations.IAPI['getLocal'],

    getLocalVariantList: () => {
      const local = api.getLocal({ list: true })

      return local.flatMap((migration) => [
        migration.filename,
        migration.basename,
        migration.id,
      ])
    },

    unsetLocal: () => {
      api.getLocal({ list: 'filename' }).forEach((filename) => {
        delete store.data[filename]
      })

      return api
    },

    setRegistered: async (migrations) =>
      api.mergeData(
        migrations
          .filter(isValidMigrationFilename)
          .map(({ filename, appliedAt, appliedAtFormatted }) =>
            api.expandMigration({
              filename,
              appliedAt,
              appliedAtFormatted,
              registered: true,
            })
          )
      ),

    getRegistered: (({ flags, list } = {}) =>
      api.getMigrations({
        flags: { ...flags, registered: true },
        list,
      })) as Migrations.IAPI['getRegistered'],

    getUnregistered: (({ flags, list } = {}) =>
      api.getMigrations({
        flags: { ...flags, local: true, registered: false },
        list,
      })) as Migrations.IAPI['getUnregistered'],

    setRequested: (requested) => {
      if (typeof requested === 'undefined') {
        return api
      }

      const local = Object.entries(api.getLocal())
      if (local.length < 1) {
        return api
      }

      const filenames = requested
        .map((variant) => {
          const found = local.find(
            ([filename, migration]) =>
              filename === variant ||
              migration.basename === variant ||
              String(migration.id) === String(variant)
          )
          return found?.[0]
        })
        .filter<string>(
          (filename): filename is string => typeof filename !== 'undefined'
        )

      return api.mergeData(
        filenames
          .filter(isValidMigrationFilename)
          .map((filename) => api.expandMigration({ filename, requested: true }))
      )
    },

    getRequested: (({ flags, list } = {}) =>
      api.getMigrations({
        flags: { ...flags, requested: true },
        list,
      })) as Migrations.IAPI['getRequested'],

    getData: () => store.data,
  }

  return api.setLocalDirectory(localDirectory)
}

export default migrations
