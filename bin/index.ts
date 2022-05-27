#!/usr/bin/env node

// The hashbang above is a lie, until this is compiled to Javascript

import 'dotenv/config'
import { join } from 'path'
import { Command, Option } from 'commander'
import { oneLine } from 'common-tags'

import expandCommandOptions from '../src/lib/program/expand-command-options'
import ensureNonEmptyOption from '../src/lib/program/ensure-non-empty-option'
import exit from '../src/lib/program/exit'
import block from '../src/api/block'
import chalk from '../src/lib/program/chalk'
import migrations from '../src/api/migrations'
import contentfulMigration, {
  ContentfulMigrationError,
} from '../src/api/contentful-migration'

import type * as Migrations from '../src/api/migrations/index.d'
import type * as Program from '../src/lib/program/index.d'
import type * as ContentfulMigration from '../src/api/contentful-migration/index.d'

const envLocalDirectory = process.env.CONTENTFUL_MIGRATION_LOCAL_DIRECTORY
const safeLocalDirectory =
  typeof envLocalDirectory === 'string' && envLocalDirectory !== ''
    ? envLocalDirectory
    : 'migrations'
const localDirectory = safeLocalDirectory.startsWith('/')
  ? safeLocalDirectory
  : join(process.cwd(), safeLocalDirectory)

let migrationsAPI: Migrations.IAPI
try {
  migrationsAPI = migrations({ localDirectory })
} catch (e) {
  exit({
    title: 'Could not initiate the migrations API.',
    message: e instanceof Error ? e.message : 'Unknown',
  })
  process.exit(1)
}

const commandOptions = expandCommandOptions([
  ['value', 'accessToken', 'a'],
  ['value', 'spaceId', 's'],
  ['value', 'environmentId', 'e', 'master'],
  ['value', 'contentTypeId', 'i', 'contentfulMigration'],
  ['value', 'contentTypeName', 'n', 'Contentful Migration'],
  ['variadic', 'migrations', 'm'],
  ['variadic', 'list', 'l'],
  ['boolean', 'dry', 'd'],
])

const command = new Command()

command
  .name('Contentful Active Migration Organiser (CAMO)')
  .description('Applies migrations to the target Contentful space')
  .version('1.0.0')

command
  .option(
    commandOptions.accessToken.allOptions,
    oneLine`
      a valid ${commandOptions.accessToken.english} for the target contentful
      space - over-rides the environment variable
      ${commandOptions.accessToken.envVar}
    `
  )
  .option(commandOptions.spaceId.allOptions, commandOptions.spaceId.help)
  .option(
    commandOptions.environmentId.allOptions,
    commandOptions.environmentId.help,
    commandOptions.environmentId.fallback
  )
  .option(
    commandOptions.contentTypeId.allOptions,
    commandOptions.contentTypeId.help,
    commandOptions.contentTypeId.fallback
  )
  .option(
    commandOptions.contentTypeName.allOptions,
    commandOptions.contentTypeName.help,
    commandOptions.contentTypeName.fallback
  )
  .addOption(
    new Option(
      commandOptions.migrations.allOptions,
      oneLine`
        the file names or IDs of the migration files to run from the migrations
        directory: if this is not supplied, the program will attempt to
        determine which migration to run automatically
      `
    )
      .choices(
        migrationsAPI.getLocalVariantList().map((variant) => String(variant))
      )
      .conflicts(['list'])
  )
  .addOption(
    new Option(
      commandOptions.list.allOptions,
      oneLine`
        list migration file statuses, filtering by category or specify the
        migration file names or IDs to look up. Categories are: local,
        registered, or unregistered
      `
    ).conflicts(['migrations'])
  )
  .option(
    commandOptions.dry.allOptions,
    'executes a "dry run" which does not actually execute migrations'
  )

// Begin processing
;(async () => {
  command.parse()

  const options = command.opts<Program.IOptionInstances>()
  ensureNonEmptyOption(options, commandOptions, 'accessToken', 2)
  ensureNonEmptyOption(options, commandOptions, 'spaceId', 3)
  ensureNonEmptyOption(options, commandOptions, 'environmentId', 4)
  ensureNonEmptyOption(options, commandOptions, 'contentTypeId', 5)
  ensureNonEmptyOption(options, commandOptions, 'contentTypeName', 6)

  // Print the resolved options to the console
  const connectionDefinitions = [
    ['Access Token', '<supplied>'],
    ['Space ID', options.spaceId],
    ['Environment ID', options.environmentId],
    ['Content Type ID', options.contentTypeId],
    ['Content Type Name', options.contentTypeName],
    ['Migrations Directory', migrationsAPI.getLocalDirectory()],
  ]
  if (options.dry) {
    connectionDefinitions.push(['Dry Run', 'yes'])
  }

  block('Contentful connection details')
    .definitions(connectionDefinitions)
    .finish()

  // Connect to Contentful using provided access details
  const connectionBlock = block('Connecting to Contentful').wait(
    'connection',
    'Connecting'
  )

  let contentfulMigrationAPI: ContentfulMigration.IAPI
  try {
    contentfulMigrationAPI = await contentfulMigration({
      accessToken: options.accessToken,
      spaceId: options.spaceId,
      environmentId: options.environmentId,
      contentTypeId: options.contentTypeId,
      contentTypeName: options.contentTypeName,
    })
  } catch (e) {
    exit({
      title: 'There was a problem connecting to Contentful.',
      message: e instanceof Error ? e.message : 'Unknown',
    })
    process.exit(7)
  }
  connectionBlock.resume('connection', 'Connecting took {seconds}s').finish()

  // Retrieve the migrations that are registered in Contentful
  const contentTypeBlock = block('Retrieving Contentful migrations').wait(
    'contentTypeRetrieval'
  )

  // Find the Contentful migration content type
  let offerToCreateContentType = false
  try {
    await contentfulMigrationAPI.getContentType()
  } catch (e) {
    if (
      e instanceof ContentfulMigrationError &&
      e.recover === 'createContentType'
    ) {
      offerToCreateContentType = true
    } else {
      exit({
        title: 'Could not retrieve the Contentful migration content type.',
        message: e instanceof Error ? e.message : 'Unknown',
      })
      process.exit(8)
    }
  }

  let registeredMigrationEntries: Array<ContentfulMigration.IEntry> = []

  // Offer to create the content type if not present
  if (offerToCreateContentType) {
    contentTypeBlock.resume(
      'contentTypeRetrieval',
      oneLine`
        Could not find content type "${options.contentTypeName}", the query took
        {seconds}s
      `
    )

    if (
      !(await contentTypeBlock.confirm(oneLine`
        Do you wish to create the Contentful migration content type in this
        Contentful space and environment?
      `))
    ) {
      contentTypeBlock.abort()
      process.exit(0)
    }

    contentTypeBlock.blank().print()

    try {
      await contentfulMigrationAPI.createContentType()
    } catch (e) {
      exit({
        title: 'Could not create the Contentful migration content type.',
        message: e instanceof Error ? e.message : 'Unknown',
      })
      process.exit(9)
    }

    contentTypeBlock.text(`Created content type "${options.contentTypeName}"`)
  } else {
    contentTypeBlock
      .resume(
        'contentTypeRetrieval',
        `Found content type "${options.contentTypeName}" in {seconds}s`
      )
      .wait('contentTypeRead', 'Retrieving registered migrations')

    try {
      registeredMigrationEntries = await contentfulMigrationAPI.getEntries()
    } catch (e) {
      exit({
        title: 'Could not retrieve the Contentful migration entries.',
        message: e instanceof Error ? e.message : 'Unknown',
      })
      process.exit(10)
    }

    contentTypeBlock.resume(
      'contentTypeRead',
      `Retrieved ${registeredMigrationEntries.length} entries in {seconds}s`
    )
  }
  contentTypeBlock.print()

  migrationsAPI.setRegistered(
    registeredMigrationEntries.map((entry) => ({
      filename: entry.name,
      appliedAt: entry.appliedAt,
      appliedAtFormatted: entry.appliedAtFormatted,
    }))
  )

  if (typeof options.list !== 'undefined') {
    let listTypes = 'all migrations'
    const listFlags: Partial<Migrations.IFlags> = {}
    let filterMigrations = false

    if (Array.isArray(options.list) && options.list.length > 0) {
      listTypes = 'provided migrations'

      if (options.list.includes('local')) {
        listTypes = 'migrations that are local'
        listFlags.local = true
        if (options.list.includes('registered')) {
          listTypes = 'migrations that are local and registered'
          listFlags.registered = true
        }
      } else if (options.list.includes('registered')) {
        listTypes = 'migrations that are registered'
        listFlags.registered = true
      } else if (options.list.includes('unregistered')) {
        listTypes = 'migrations that are unregistered'
        listFlags.local = true
        listFlags.registered = false
      } else {
        filterMigrations = true
      }
    }

    const rows = migrationsAPI
      .getMigrations({ flags: listFlags, list: true })
      .filter((migration) => {
        if (!filterMigrations) {
          return true
        }

        if (!Array.isArray(options.list)) {
          return false
        }

        return options.list.some((id) =>
          [
            migration.filename,
            migration.basename,
            String(migration.id),
          ].includes(id)
        )
      })
      .map((migration) => [
        migration.filename,
        migration.local,
        migration.registered,
        migration.appliedAtFormatted,
      ])

    contentTypeBlock.blank().text(`Getting status of ${listTypes}…`)

    if (rows.length < 1) {
      contentTypeBlock.text('No matching migrations found.', {
        label: 'warning',
      })
    } else {
      contentTypeBlock.table({
        headers: ['Name', 'Local', 'Registered', 'Applied'],
        rows,
      })
    }
    contentTypeBlock.finish()

    process.exit(0)
  }

  const registeredMigrationsWithoutLocal = migrationsAPI.getRegistered({
    flags: { local: false },
    list: 'filename',
  })

  if (registeredMigrationsWithoutLocal.length > 0) {
    contentTypeBlock
      .blank()
      .text(
        oneLine`
          These migrations are registered in Contentful but are not present in
          the local directory:
        `,
        { label: 'warning' }
      )
      .list({
        headers: 'name',
        rows: registeredMigrationsWithoutLocal.map((filename) => [filename]),
      })
      .blank()
      .print()

    if (!(await contentTypeBlock.confirm('Do you wish to proceed anyway?'))) {
      contentTypeBlock.abort()
      process.exit(0)
    }
  }

  contentTypeBlock.finish()

  const migrationsBlock = block('Gathering local migrations to apply')

  let applyRegistered = undefined

  if (typeof options.migrations === 'undefined') {
    migrationsBlock
      .text('No migrations were supplied on the command line')
      .blank()

    const unregisteredMigrations = migrationsAPI.getUnregistered({
      list: 'filename',
    })

    if (unregisteredMigrations.length > 0) {
      migrationsBlock
        .text(
          oneLine`
            The following local migrations have ${chalk.emphasise('not')} been
            registered in Contentful and will be applied:
          `
        )
        .list({
          headers: 'name',
          rows: unregisteredMigrations.map((filename) => [filename]),
        })
    } else {
      migrationsBlock
        .text('All local migrations are already registered in Contentful')
        .abort()
      process.exit(0)
    }
  } else {
    migrationsBlock
      .text('Validating migrations that were supplied on the command line…')
      .blank()

    migrationsAPI.setRequested(options.migrations)

    const requestedButRegisteredMigrations = migrationsAPI.getRequested({
      flags: { registered: true },
      list: 'filename',
    })

    if (requestedButRegisteredMigrations.length > 0) {
      migrationsBlock
        .text(
          oneLine`
            These migrations were requested, but are already registered in
            Contentful:
          `,
          { label: 'warning' }
        )
        .list({
          headers: 'name',
          rows: requestedButRegisteredMigrations.map((filename) => [filename]),
        })
        .blank()
        .text(
          oneLine`
            You can choose to re-apply these migrations or remove them from the
            migration process.
          `
        )
        .print()

      if (
        await migrationsBlock.confirm(oneLine`
          Do you wish to remove these migrations from the migration process?
        `)
      ) {
        applyRegistered = false
      }

      migrationsBlock.blank()
    }

    const requestedMigrations = migrationsAPI.getRequested({
      flags: { registered: applyRegistered },
      list: 'filename',
    })

    if (requestedMigrations.length > 0) {
      migrationsBlock
        .text('The following local migrations will be applied:')
        .list({
          headers: 'name',
          rows: requestedMigrations.map((filename) => [filename]),
        })
    } else {
      migrationsBlock
        .text('No local migrations match the requested migrations', {
          label: 'warning',
        })
        .abort()

      process.exit(0)
    }
  }

  migrationsBlock.blank().print()
  if (
    !(await migrationsBlock.confirm(
      'Do you wish to proceed with the migration?'
    ))
  ) {
    migrationsBlock.abort()
    process.exit(0)
  }
  migrationsBlock.finish()

  const migrateBlock = block('Applying migrations').blank().blank(0).print()

  const targetMigrations =
    typeof options.migrations === 'undefined'
      ? migrationsAPI.getUnregistered({ list: true })
      : migrationsAPI.getRequested({
          flags: { registered: applyRegistered },
          list: true,
        })

  try {
    await contentfulMigrationAPI.runMigrations(
      targetMigrations.map((migration) => [migration.filename, migration.path]),
      options.dry
    )
  } catch (e) {
    exit({
      title: 'There was a problem applying the Contentful migrations',
      message: e instanceof Error ? e.message : 'Unknown',
    })
    process.exit(11)
  }

  migrateBlock.blank(0).complete()
})()
