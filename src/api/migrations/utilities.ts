import { parse } from 'path'
import type * as Migrations from './index.d'

type FileName = Migrations.IMigration['filename']

export const isValidMigrationFilename = (
  filenameOrMigration: FileName | Migrations.IMigrationPartial
): boolean =>
  /^[0-9]+-[a-z0-9-]+\.[jt]s$/i.test(
    typeof filenameOrMigration === 'string'
      ? filenameOrMigration
      : filenameOrMigration.filename
  )

export const getMigrationBasename = (
  filename: FileName
): Migrations.IMigration['basename'] => parse(filename).name

// expects a valid migration filename
export const getMigrationId = (
  filename: FileName
): Migrations.IMigration['id'] => parseInt(filename.replace(/^(0-9+)/, '$1'))
